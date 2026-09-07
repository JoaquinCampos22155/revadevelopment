begin;

-- All rows are disposable; the final rollback is mandatory.
insert into auth.users (id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('15000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'm015-admin@example.test', '{}'::jsonb, '{}'::jsonb, now(), now());
update public.profiles set role = 'admin' where id = '15000000-0000-0000-0000-000000000001';

create function pg_temp.assert_true(p_condition boolean, p_message text)
returns void language plpgsql as $$
begin
  if not p_condition then raise exception '%', p_message; end if;
end;
$$;

-- Product Manager's persistence RPC accepts each current controlled value.
set local role authenticated;
select set_config('request.jwt.claim.sub', '15000000-0000-0000-0000-000000000001', true);
create temporary table m015_drafts (garment_type text primary key, product_id uuid not null) on commit drop;
grant all on table m015_drafts to authenticated;
insert into m015_drafts (garment_type, product_id)
select fixture.garment_type, created.product_id
from unnest(array['camisas', 'blusas_tops', 'pantalones', 'shorts']::text[]) as fixture(garment_type)
cross join lateral public.create_product_draft_from_intake(
  'sell', current_date, '', '1.00', format('M015 %s', fixture.garment_type),
  format('m015-%s', replace(fixture.garment_type, '_', '-')), 'M015 draft fixture', '50.00',
  'mujer', 'REVA', fixture.garment_type, 'negro', '', 'M', null, '2', ''
) as created;
reset role;

select pg_temp.assert_true(
  (select array_agg(garment_type order by garment_type) = array['blusas_tops', 'camisas', 'pantalones', 'shorts']::text[] from public.products where id in (select product_id from m015_drafts)),
  'approved garment vocabulary draft fixtures did not persist'
);

-- Replay M015's exact, intentionally narrow normalization statement.
insert into public.intake_items (id, source_type, destination, created_by_profile_id, acquisition_cost, received_at)
values
  ('25000000-0000-0000-0000-000000000001', 'sell', 'catalog', '15000000-0000-0000-0000-000000000001', 1.00, current_date),
  ('25000000-0000-0000-0000-000000000002', 'sell', 'catalog', '15000000-0000-0000-0000-000000000001', 1.00, current_date);

insert into public.products (
  id, intake_item_id, created_by_profile_id, sku, slug, title, description, price,
  audience, garment_type, size_label, condition_rating, status, published_at, public_media_ready_at, updated_at
)
values
  ('35000000-0000-0000-0000-000000000001', '25000000-0000-0000-0000-000000000001', '15000000-0000-0000-0000-000000000001', 'RV-915001', 'm015-normalization-jeans', 'M015 Jeans', 'Fixture', 50.00, 'mujer', 'jeans', 'M', 2, 'published', now(), now(), now() - interval '1 hour'),
  ('35000000-0000-0000-0000-000000000002', '25000000-0000-0000-0000-000000000002', '15000000-0000-0000-0000-000000000001', 'RV-915002', 'm015-normalization-pantalones', 'M015 Pantalones', 'Fixture', 60.00, 'mujer', 'pantalones', 'M', 3, 'published', now(), now(), now() - interval '1 hour');

insert into public.product_images (id, product_id, storage_key, alt_text, position, width, height, mime_type)
values ('45000000-0000-0000-0000-000000000001', '35000000-0000-0000-0000-000000000001', 'm015/fixture.webp', 'M015 fixture', 1, 1200, 1600, 'image/webp');
insert into public.product_recommendations (product_id, position)
values ('35000000-0000-0000-0000-000000000001', 1);

create temporary table m015_before on commit drop as
select
  products.id, products.sku, products.title, products.price, products.status,
  products.condition_rating, products.published_at, products.public_media_ready_at,
  products.updated_at, products.garment_type,
  (select count(*) from public.product_images where product_id = products.id) as image_count,
  (select position from public.product_recommendations where product_id = products.id) as recommendation_position
from public.products
where products.id in ('35000000-0000-0000-0000-000000000001', '35000000-0000-0000-0000-000000000002');

update public.products
set garment_type = 'pantalones'
where garment_type = 'jeans';

select pg_temp.assert_true(
  (select garment_type = 'pantalones' from public.products where id = '35000000-0000-0000-0000-000000000001'),
  'legacy jeans fixture was not normalized to pantalones'
);
select pg_temp.assert_true(
  (select count(*) = 0 from public.products where id in ('35000000-0000-0000-0000-000000000001', '35000000-0000-0000-0000-000000000002') and garment_type = 'jeans'),
  'legacy jeans fixture remains after normalization'
);
select pg_temp.assert_true(
  (select count(*) = 1 from public.products where id = '35000000-0000-0000-0000-000000000002' and garment_type = 'pantalones'),
  'unrelated pantalones fixture changed'
);
select pg_temp.assert_true(
  (select bool_and(products.sku = before.sku and products.title = before.title and products.price = before.price and products.status = before.status and products.condition_rating = before.condition_rating and products.published_at = before.published_at and products.public_media_ready_at = before.public_media_ready_at) from public.products products join m015_before before on before.id = products.id),
  'normalization changed Product facts or lifecycle state outside garment type'
);
select pg_temp.assert_true(
  (select bool_and((select count(*) from public.product_images where product_id = products.id) = before.image_count and coalesce((select position from public.product_recommendations where product_id = products.id), 0) = coalesce(before.recommendation_position, 0)) from public.products products join m015_before before on before.id = products.id),
  'normalization changed ProductImage or recommendation state'
);
select pg_temp.assert_true(
  (select products.updated_at > before.updated_at from public.products products join m015_before before on before.id = products.id where products.id = '35000000-0000-0000-0000-000000000001'),
  'normalization did not report the unavoidable products.updated_at trigger change'
);

rollback;
