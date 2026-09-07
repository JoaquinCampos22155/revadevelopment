begin;

-- All data in this script is disposable. The closing rollback is part of the test.
insert into auth.users (id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('10000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'm013-admin@example.test', '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('10000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'm013-customer@example.test', '{}'::jsonb, '{}'::jsonb, now(), now());

update public.profiles set role = 'admin' where id = '10000000-0000-0000-0000-000000000001';

insert into public.intake_items (id, source_type, destination, created_by_profile_id, acquisition_cost, received_at)
values
  ('20000000-0000-0000-0000-000000000001', 'sell', 'catalog', '10000000-0000-0000-0000-000000000001', 1.00, current_date),
  ('20000000-0000-0000-0000-000000000002', 'sell', 'catalog', '10000000-0000-0000-0000-000000000001', 1.00, current_date),
  ('20000000-0000-0000-0000-000000000003', 'sell', 'catalog', '10000000-0000-0000-0000-000000000001', 1.00, current_date),
  ('20000000-0000-0000-0000-000000000004', 'sell', 'catalog', '10000000-0000-0000-0000-000000000001', 1.00, current_date),
  ('20000000-0000-0000-0000-000000000005', 'sell', 'catalog', '10000000-0000-0000-0000-000000000001', 1.00, current_date);

insert into public.products (
  id, intake_item_id, created_by_profile_id, sku, slug, title, description, price,
  audience, garment_type, size_label, condition_rating, status, published_at, public_media_ready_at
)
values
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'RV-900001', 'm013-a', 'M013 A', 'Fixture A', 10.00, 'mujer', 'camisas', 'M', 3, 'published', now(), now()),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'RV-900002', 'm013-b', 'M013 B', 'Fixture B', 20.00, 'mujer', 'camisas', 'M', 3, 'published', now(), now()),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'RV-900003', 'm013-c', 'M013 C', 'Fixture C', 30.00, 'mujer', 'camisas', 'M', 3, 'published', now(), now()),
  ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'RV-900004', 'm013-d', 'M013 D', 'Fixture D', 40.00, 'mujer', 'camisas', 'M', 3, 'published', now(), now()),
  ('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 'RV-900005', 'm013-e', 'M013 E', 'Fixture E', 50.00, 'mujer', 'camisas', 'M', 3, 'published', now(), now());

create function pg_temp.assert_true(p_condition boolean, p_message text)
returns void language plpgsql as $$
begin
  if not p_condition then raise exception '%', p_message; end if;
end;
$$;

create function pg_temp.reset_recommendations()
returns void language plpgsql as $$
begin
  delete from public.product_recommendations;
end;
$$;

-- Anonymous cannot execute the RPC at all.
set local role anon;
do $$
begin
  perform public.remove_product_recommendation('30000000-0000-0000-0000-000000000001');
  raise exception 'anonymous removal unexpectedly succeeded';
exception when insufficient_privilege then null;
end;
$$;
reset role;

-- An authenticated customer can reach the function but fails its explicit admin check.
set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', true);
do $$
begin
  perform public.remove_product_recommendation('30000000-0000-0000-0000-000000000001');
  raise exception 'customer removal unexpectedly succeeded';
exception when insufficient_privilege then null;
end;
$$;
reset role;

-- Use the real session-bound admin path for every mutation below.
set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select public.add_product_recommendation('30000000-0000-0000-0000-000000000001');
select public.add_product_recommendation('30000000-0000-0000-0000-000000000002');
select public.add_product_recommendation('30000000-0000-0000-0000-000000000003');
select public.add_product_recommendation('30000000-0000-0000-0000-000000000004');
select public.add_product_recommendation('30000000-0000-0000-0000-000000000005');
reset role;

select pg_temp.assert_true(
  (select array_agg(position order by position) = array[1,2,3,4,5] from public.product_recommendations),
  'initial recommendation positions are not contiguous'
);

-- Remove first.
set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select public.remove_product_recommendation('30000000-0000-0000-0000-000000000001');
reset role;
select pg_temp.assert_true(
  (select array_agg(product_id order by position) = array['30000000-0000-0000-0000-000000000002'::uuid,'30000000-0000-0000-0000-000000000003'::uuid,'30000000-0000-0000-0000-000000000004'::uuid,'30000000-0000-0000-0000-000000000005'::uuid] from public.product_recommendations),
  'remove first did not preserve remaining order'
);

-- Reset and remove middle.
select pg_temp.reset_recommendations();
set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select public.add_product_recommendation('30000000-0000-0000-0000-000000000001');
select public.add_product_recommendation('30000000-0000-0000-0000-000000000002');
select public.add_product_recommendation('30000000-0000-0000-0000-000000000003');
select public.add_product_recommendation('30000000-0000-0000-0000-000000000004');
select public.add_product_recommendation('30000000-0000-0000-0000-000000000005');
select public.remove_product_recommendation('30000000-0000-0000-0000-000000000003');
reset role;
select pg_temp.assert_true(
  (select array_agg(product_id order by position) = array['30000000-0000-0000-0000-000000000001'::uuid,'30000000-0000-0000-0000-000000000002'::uuid,'30000000-0000-0000-0000-000000000004'::uuid,'30000000-0000-0000-0000-000000000005'::uuid] from public.product_recommendations),
  'remove middle did not preserve remaining order'
);

-- Reorder after removal, then add the removed Product back at the end.
set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select public.reorder_product_recommendations(array['30000000-0000-0000-0000-000000000005'::uuid,'30000000-0000-0000-0000-000000000001'::uuid,'30000000-0000-0000-0000-000000000002'::uuid,'30000000-0000-0000-0000-000000000004'::uuid]);
select public.add_product_recommendation('30000000-0000-0000-0000-000000000003');
reset role;
select pg_temp.assert_true(
  (select array_agg(product_id order by position) = array['30000000-0000-0000-0000-000000000005'::uuid,'30000000-0000-0000-0000-000000000001'::uuid,'30000000-0000-0000-0000-000000000002'::uuid,'30000000-0000-0000-0000-000000000004'::uuid,'30000000-0000-0000-0000-000000000003'::uuid] from public.product_recommendations),
  'reorder or add after removal did not produce deterministic order'
);

-- Reset and remove last.
select pg_temp.reset_recommendations();
set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select public.add_product_recommendation('30000000-0000-0000-0000-000000000001');
select public.add_product_recommendation('30000000-0000-0000-0000-000000000002');
select public.add_product_recommendation('30000000-0000-0000-0000-000000000003');
select public.remove_product_recommendation('30000000-0000-0000-0000-000000000003');
reset role;
select pg_temp.assert_true((select array_agg(position order by position) = array[1,2] from public.product_recommendations), 'remove last did not compact positions');

-- Reset and remove only recommendation; repeated and nonexistent removals must fail safely.
select pg_temp.reset_recommendations();
set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select public.add_product_recommendation('30000000-0000-0000-0000-000000000001');
select public.remove_product_recommendation('30000000-0000-0000-0000-000000000001');
do $$
begin
  perform public.remove_product_recommendation('30000000-0000-0000-0000-000000000001');
  raise exception 'repeated removal unexpectedly succeeded';
exception when no_data_found then null;
end;
$$;
do $$
begin
  perform public.remove_product_recommendation('30000000-0000-0000-0000-000000000005');
  raise exception 'non-recommended removal unexpectedly succeeded';
exception when no_data_found then null;
end;
$$;
reset role;
select pg_temp.assert_true((select count(*) = 0 from public.product_recommendations), 'remove only did not leave an empty set');

-- A malformed UUID is rejected by PostgreSQL before the RPC can mutate state.
do $$
begin
  perform public.remove_product_recommendation('not-a-uuid'::uuid);
  raise exception 'malformed UUID unexpectedly succeeded';
exception when invalid_text_representation then null;
end;
$$;

-- Recommendation operations never mutate Products, lifecycle fields, or media.
select pg_temp.assert_true(
  (select count(*) = 5 and bool_and(status = 'published' and public_media_ready_at is not null) from public.products where id between '30000000-0000-0000-0000-000000000001'::uuid and '30000000-0000-0000-0000-000000000005'::uuid),
  'recommendation operations mutated fixture Product lifecycle state'
);
select pg_temp.assert_true(
  (select count(*) = 0 from public.product_images where product_id between '30000000-0000-0000-0000-000000000001'::uuid and '30000000-0000-0000-0000-000000000005'::uuid),
  'recommendation operations mutated fixture media'
);

rollback;
