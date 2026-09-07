begin;

-- All identities, Products, media objects, and recommendations in this script
-- are disposable. The final rollback is part of the validation contract.
insert into auth.users (id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('14000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'm014-admin@example.test', '{}'::jsonb, '{}'::jsonb, now(), now());

update public.profiles
set role = 'admin'
where id = '14000000-0000-0000-0000-000000000001';

-- Recreate the historical range only inside this rollback-only test. A retained
-- condition 0 must cause M014's pre-DDL guard to abort rather than rewrite data.
alter table public.products drop constraint products_condition_rating_check;
alter table public.products add constraint products_condition_rating_check check (condition_rating between 0 and 3);

do $$
declare
  v_intake_id uuid;
begin
  insert into public.intake_items (source_type, destination, created_by_profile_id, acquisition_cost, received_at)
  values ('sell', 'catalog', '14000000-0000-0000-0000-000000000001', 1.00, current_date)
  returning id into v_intake_id;

  insert into public.products (intake_item_id, created_by_profile_id, slug, title, condition_rating)
  values (v_intake_id, '14000000-0000-0000-0000-000000000001', 'm014-pre-ddl-guard', 'M014 pre-DDL guard', 0);

  begin
    if exists (
      select 1 from public.products
      where condition_rating is not null and condition_rating not between 1 and 4
    ) then
      raise exception using errcode = '23514';
    end if;
    raise exception 'M014 pre-DDL guard unexpectedly accepted condition 0';
  exception when check_violation then null;
  end;
end;
$$;

delete from public.products where slug = 'm014-pre-ddl-guard';
alter table public.products drop constraint products_condition_rating_check;
alter table public.products add constraint products_condition_rating_check check (condition_rating between 1 and 4);

create function pg_temp.assert_true(p_condition boolean, p_message text)
returns void language plpgsql as $$
begin
  if not p_condition then raise exception '%', p_message; end if;
end;
$$;

create temporary table condition_fixtures (
  condition_rating smallint primary key,
  product_id uuid not null,
  intake_item_id uuid not null
) on commit drop;

grant all on table condition_fixtures to authenticated;

-- The actual admin RPC creates a draft for each approved condition value.
set local role authenticated;
select set_config('request.jwt.claim.sub', '14000000-0000-0000-0000-000000000001', true);

insert into condition_fixtures (condition_rating, product_id, intake_item_id)
select
  condition_rating,
  created.product_id,
  created.intake_item_id
from unnest(array[1, 2, 3, 4]::smallint[]) as fixture(condition_rating)
cross join lateral public.create_product_draft_from_intake(
  'sell', current_date, '', '1.00',
  format('M014 condition %s', fixture.condition_rating),
  format('m014-condition-%s', fixture.condition_rating),
  format('Fixture condition %s', fixture.condition_rating),
  '50.00', 'mujer', 'REVA', 'camisas', 'negro', '', 'M',
  null, fixture.condition_rating::text, ''
) as created;

-- Saving each draft through the same application RPC preserves its valid value.
select public.save_product_draft(product_id, 'sell', current_date, '', '1.00',
  format('M014 condition %s edited', condition_rating),
  format('Fixture condition %s edited', condition_rating),
  '50.00', 'mujer', 'REVA', 'camisas', 'negro', '', 'M', null,
  condition_rating::text, '')
from condition_fixtures;

-- A manually altered normal RPC request cannot persist retired condition 0.
do $$
begin
  perform public.create_product_draft_from_intake(
    'sell', current_date, '', '1.00', 'M014 invalid zero', 'm014-invalid-zero',
    'Invalid fixture', '50.00', 'mujer', 'REVA', 'camisas', 'negro', '', 'M', null, '0', ''
  );
  raise exception 'condition 0 unexpectedly persisted through the draft RPC';
exception when check_violation then null;
end;
$$;

reset role;

select pg_temp.assert_true(
  (select array_agg(condition_rating order by condition_rating) = array[1,2,3,4]::smallint[] from public.products where id in (select product_id from condition_fixtures)),
  'approved condition fixtures were not persisted as 1 through 4'
);

-- The direct persistence constraint independently rejects 0.
do $$
declare
  v_intake_id uuid;
begin
  insert into public.intake_items (source_type, destination, created_by_profile_id, acquisition_cost, received_at)
  values ('sell', 'catalog', '14000000-0000-0000-0000-000000000001', 1.00, current_date)
  returning id into v_intake_id;
  insert into public.products (intake_item_id, created_by_profile_id, slug, title, condition_rating)
  values (v_intake_id, '14000000-0000-0000-0000-000000000001', 'unreachable', 'Unreachable', 0);
  raise exception 'condition 0 unexpectedly bypassed the database constraint';
exception when check_violation then null;
end;
$$;

-- Add private authoritative media through the approved ProductImage metadata RPC.
set local role authenticated;
select set_config('request.jwt.claim.sub', '14000000-0000-0000-0000-000000000001', true);
select public.create_product_image_metadata(
  ('24000000-0000-0000-0000-' || lpad(fixture.condition_rating::text, 12, '0'))::uuid, fixture.product_id,
  format('products/%s/%s.webp', fixture.product_id, ('24000000-0000-0000-0000-' || lpad(fixture.condition_rating::text, 12, '0'))::uuid),
  'M014 fixture', 1200, 1600
)
from condition_fixtures fixture;
reset role;

-- Storage objects are fixture-only delivery prerequisites; they are not Product
-- mutations outside the disposable transaction.
insert into storage.objects (bucket_id, name, owner_id, metadata)
select 'product-media', image.storage_key, '14000000-0000-0000-0000-000000000001', jsonb_build_object('mimetype', 'image/webp')
from public.product_images image
where image.product_id in (select product_id from condition_fixtures);

-- Each condition level passes the lifecycle readiness and prepare stages as an admin.
set local role authenticated;
select set_config('request.jwt.claim.sub', '14000000-0000-0000-0000-000000000001', true);
select pg_temp.assert_true(
  (select missing_requirements = array[]::text[] from public.get_product_publication_readiness(product_id)),
  format('condition %s did not satisfy publication readiness', condition_rating)
)
from condition_fixtures;
select public.prepare_product_publication(product_id) from condition_fixtures;
reset role;

-- The normal media-delivery completion prerequisite is supplied for each fixture.
insert into storage.objects (bucket_id, name, owner_id, metadata)
select 'public-product-media', format('products/%s.webp', image.id), '14000000-0000-0000-0000-000000000001', jsonb_build_object('mimetype', 'image/webp')
from public.product_images image
where image.product_id in (select product_id from condition_fixtures);

set local role authenticated;
select set_config('request.jwt.claim.sub', '14000000-0000-0000-0000-000000000001', true);
select public.complete_product_publication(product_id) from condition_fixtures;
select public.add_product_recommendation(product_id) from condition_fixtures;
reset role;

select pg_temp.assert_true(
  (select count(*) = 4 from api.published_product_previews where slug like 'm014-condition-%'),
  'published catalog projection omitted a valid condition fixture'
);
select pg_temp.assert_true(
  (select array_agg(condition_rating order by condition_rating) = array[1,2,3,4]::smallint[] from api.published_product_previews where slug like 'm014-condition-%'),
  'published catalog projection returned an unexpected condition scale'
);
select pg_temp.assert_true(
  (select count(*) = 4 from api.recommended_product_previews where slug like 'm014-condition-%'),
  'recommended projection omitted a valid condition fixture'
);
select pg_temp.assert_true(
  (select count(*) = 4 from api.published_product_details where slug like 'm014-condition-%'),
  'published detail projection omitted a valid condition fixture'
);
select pg_temp.assert_true(
  (select count(*) = 4 from api.published_product_images image where image.product_slug like 'm014-condition-%'),
  'published image projection omitted fixture media'
);

rollback;
