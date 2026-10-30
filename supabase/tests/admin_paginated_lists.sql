begin;

create extension if not exists pgtap with schema extensions;
select no_plan();

create temporary table m026_fixture_context on commit drop as
select
  upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)) as prefix,
  upper(replace(gen_random_uuid()::text, '-', '')) as full_reference_suffix,
  gen_random_uuid() as admin_id,
  gen_random_uuid() as customer_id,
  gen_random_uuid() as intake_a_id,
  gen_random_uuid() as intake_b_id,
  gen_random_uuid() as product_a_id,
  gen_random_uuid() as product_b_id,
  gen_random_uuid() as image_id,
  gen_random_uuid() as request_a_id,
  gen_random_uuid() as request_b_id,
  1000000 + txid_current() * 10 as sku_base;

create temporary table m026_order_fixture_ids (
  sequence_number integer primary key,
  id uuid not null unique,
  public_reference text not null unique
) on commit drop;

insert into m026_order_fixture_ids (sequence_number, id, public_reference)
select g, gen_random_uuid(), case when g = 105 then 'REVA-' || context.full_reference_suffix
  else 'REVA-' || context.prefix || lpad((1000 + g)::text, 4, '0') end
from generate_series(1, 105) as g
cross join m026_fixture_context as context;

select ok(
  to_regprocedure('public.admin_list_purchase_requests_v2(integer,integer,text,text,text)') is not null,
  'bounded request-list RPC is installed without replacing its legacy contract'
);
select ok(
  to_regprocedure('public.admin_list_orders_v2(integer,integer,text,text,text,text,text)') is not null,
  'bounded Order-list RPC is installed without replacing its legacy contract'
);

insert into auth.users (id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
select test_users.id, 'authenticated', 'authenticated', 'admin-list-' || prefix || '-' || test_users.kind || '@example.test', '{}'::jsonb, '{}'::jsonb, now(), now()
from m026_fixture_context context
cross join lateral (values (context.admin_id, 'admin'), (context.customer_id, 'customer')) as test_users(id, kind);
update public.profiles set role = 'admin' where id = (select admin_id from m026_fixture_context);

insert into public.intake_items (id, source_type, destination, created_by_profile_id, acquisition_cost, received_at)
select intake_id, 'sell', 'catalog', admin_id, 1, current_date
from m026_fixture_context context
cross join lateral (values (context.intake_a_id), (context.intake_b_id)) as test_intakes(intake_id);

insert into public.products (
  id, intake_item_id, created_by_profile_id, sku, slug, title, description, price,
  audience, garment_type, size_label, condition_rating, status, published_at, public_media_ready_at
)
select product_id, intake_id, admin_id, 'RV-' || (sku_base + offset_value)::text,
  'm026-' || lower(prefix) || '-' || suffix, title, 'Fixture de prueba', price,
  'mujer', 'camisas', 'M', 3, status, case when status = 'published' then now() end,
  case when status = 'published' then now() end
from m026_fixture_context context
cross join lateral (values
  (context.product_a_id, context.intake_a_id, 1::bigint, 'public', 'Prenda pública M026', 40::numeric, 'published'),
  (context.product_b_id, context.intake_b_id, 2::bigint, 'sold', 'Prenda vendida M026', 30::numeric, 'sold')
) as products(product_id, intake_id, offset_value, suffix, title, price, status);

insert into public.product_images (id, product_id, storage_key, alt_text, position, width, height, mime_type)
select image_id, product_a_id, 'products/m026-' || prefix || '-source.webp', 'Camisa azul fotografiada de frente', 1, 800, 1000, 'image/webp'
from m026_fixture_context;

insert into private.purchase_requests (
  id, public_reference, created_at, expires_at, idempotency_digest,
  contact_ciphertext, contact_key_version, delivery_ciphertext, delivery_key_version,
  municipality_code, billing_type, billing_ciphertext, billing_key_version
)
select request_id, case when request_number = '0002' then 'REVA-' || full_reference_suffix
  else 'REVA-' || prefix || request_number end,
  now() - request_age, now() + interval '24 hours' - request_age,
  decode(md5(prefix || request_number || '-a') || md5(prefix || request_number || '-b'), 'hex'),
  '{"fixture":"hidden"}', 1, '{"fixture":"hidden"}', 1, '0101', 'cf', '{"fixture":"hidden"}', 1
from m026_fixture_context context
cross join lateral (values
  (context.request_a_id, '0001', interval '1 hour'),
  (context.request_b_id, '0002', interval '2 hours')
) as requests(request_id, request_number, request_age);

insert into private.purchase_request_items (request_id, product_id, position, sku_snapshot, title_snapshot, unit_price, quantity)
select context.request_a_id, context.product_a_id, 1, 'RV-' || (context.sku_base + 1)::text, 'Prenda pública M026', 40, 1 from m026_fixture_context context
union all
select context.request_a_id, context.product_b_id, 2, 'RV-' || (context.sku_base + 2)::text, 'Prenda vendida M026', 30, 1 from m026_fixture_context context
union all
select context.request_b_id, context.product_a_id, 1, 'RV-' || (context.sku_base + 1)::text, 'Prenda pública M026', 40, 1 from m026_fixture_context context;

insert into private.orders (id, public_reference, status, payment_status, fulfillment_status, merchandise_subtotal, created_at)
select id, public_reference,
  case when sequence_number = 105 then 'cancelled' else 'pending_payment' end,
  case when sequence_number = 105 then 'cancelled' else 'pending' end,
  case when sequence_number = 105 then 'cancelled' else 'not_ready' end,
  40,
  case when sequence_number in (1, 2) then now() else now() - (sequence_number || ' seconds')::interval end
from m026_order_fixture_ids;

insert into private.order_items (order_id, product_id, position, sku_snapshot, title_snapshot, unit_price, quantity)
select order_fixture.id, context.product_a_id, 1, 'RV-' || (context.sku_base + 1)::text, 'Snapshot original A', 40, 1
from m026_order_fixture_ids order_fixture cross join m026_fixture_context context where sequence_number = 1
union all
select order_fixture.id, context.product_b_id, 2, 'RV-' || (context.sku_base + 2)::text, 'Snapshot original B', 30, 1
from m026_order_fixture_ids order_fixture cross join m026_fixture_context context where sequence_number = 1
union all
select order_fixture.id, context.product_b_id, 1, 'RV-' || (context.sku_base + 2)::text, 'Snapshot vendido', 30, 1
from m026_order_fixture_ids order_fixture cross join m026_fixture_context context where sequence_number = 2;

insert into private.payments (order_id, provider, status, amount)
select id, 'recurrente', 'pending_manual', 70 from m026_order_fixture_ids where sequence_number = 1
union all
select id, 'recurrente', 'late_unverified', 30 from m026_order_fixture_ids where sequence_number = 2;

grant select on m026_fixture_context, m026_order_fixture_ids to authenticated, anon;

set local role authenticated;
select set_config('request.jwt.claim.sub', (select admin_id::text from m026_fixture_context), true);

select is((public.admin_list_purchase_requests_v2(1, 20, 'REVA-' || (select prefix from m026_fixture_context), 'all', 'newest')->>'total_count')::integer, 1, 'request result count includes all prefix-matching fixture requests');
select is((public.admin_list_purchase_requests_v2(1, 20, 'REVA-' || (select prefix from m026_fixture_context), 'all', 'newest')->'items'->0->>'public_reference'), 'REVA-' || (select prefix from m026_fixture_context) || '0001', 'request list is newest-first and reference-stable');
select is((public.admin_list_purchase_requests_v2(1, 20, 'REVA-' || (select prefix from m026_fixture_context) || '0001', 'pending_review', 'oldest')->>'total_count')::integer, 1, 'request prefix search and pending filter return one fixture match');
select is((public.admin_list_purchase_requests_v2(1, 20, 'REVA-' || (select full_reference_suffix from m026_fixture_context), 'all', 'newest')->>'total_count')::integer, 1, 'request RPC accepts an exact complete 37-character public reference');
select is((public.admin_list_purchase_requests_v2(1, 20, 'REVA-' || (select full_reference_suffix from m026_fixture_context), 'all', 'newest')->'items'->0->>'public_reference'), 'REVA-' || (select full_reference_suffix from m026_fixture_context), 'exact request search returns the complete reference unchanged');
select is((public.admin_list_purchase_requests_v2(1, 20, 'REVA-' || repeat('A', 59), 'all', 'newest')->'items'), '[]'::jsonb, 'request RPC accepts a valid 64-character search');
select is((public.admin_list_purchase_requests_v2(1, 20, 'REVA-' || (select prefix from m026_fixture_context), 'all', 'newest')->'items'->0->>'product_count')::integer, 2, 'request product count uses its item snapshots');
select is((public.admin_list_purchase_requests_v2(1, 20, 'REVA-' || (select prefix from m026_fixture_context), 'all', 'newest')->'items'->0->>'merchandise_subtotal')::numeric, 70::numeric, 'request subtotal uses snapshot prices');
select is((public.admin_list_purchase_requests_v2(3, 1, 'REVA-' || (select prefix from m026_fixture_context), 'all', 'newest')->>'page')::integer, 1, 'request out-of-range page clamps within fixture results');
select is((public.admin_list_purchase_requests_v2(1, 20, 'REVA-' || (select prefix from m026_fixture_context) || 'FFFF', 'all', 'newest')->'items'), '[]'::jsonb, 'request empty state has an empty item array');
select ok(position('ciphertext' in public.admin_list_purchase_requests_v2(1, 20, 'REVA-' || (select prefix from m026_fixture_context), 'all', 'newest')::text) = 0, 'request list never returns encrypted personal fields');

select is((public.admin_list_orders_v2(1, 50, 'REVA-' || (select prefix from m026_fixture_context), 'all', 'all', 'all', 'newest')->>'total_count')::integer, 104, 'Order RPC can page across more than the legacy 100-row ceiling');
select is(jsonb_array_length(public.admin_list_orders_v2(3, 50, 'REVA-' || (select prefix from m026_fixture_context), 'all', 'all', 'all', 'newest')->'items'), 4, 'last Order page returns the remaining bounded fixture results');
select is((public.admin_list_orders_v2(1, 50, 'REVA-' || (select prefix from m026_fixture_context), 'all', 'all', 'all', 'newest')->'items'->0->>'public_reference'), 'REVA-' || (select prefix from m026_fixture_context) || case when (select id from m026_order_fixture_ids where sequence_number = 1) > (select id from m026_order_fixture_ids where sequence_number = 2) then '1001' else '1002' end, 'equal timestamps use a deterministic descending UUID tie-break');
select is((public.admin_list_orders_v2(1, 50, 'REVA-' || (select prefix from m026_fixture_context) || '1001', 'pending_payment', 'pending_manual', 'not_ready', 'newest')->>'total_count')::integer, 1, 'Order reference and status filters apply server-side');
select is((public.admin_list_orders_v2(1, 50, 'REVA-' || (select full_reference_suffix from m026_fixture_context), 'all', 'all', 'all', 'newest')->>'total_count')::integer, 1, 'Order RPC accepts an exact complete 37-character public reference');
select is((public.admin_list_orders_v2(1, 50, 'REVA-' || repeat('A', 59), 'all', 'all', 'all', 'newest')->'items'), '[]'::jsonb, 'Order RPC accepts a valid 64-character search');
select is((public.admin_list_orders_v2(1, 50, 'REVA-' || (select prefix from m026_fixture_context) || '1001', 'all', 'pending_manual', 'all', 'newest')->'items'->0->>'payment_status'), 'pending_manual', 'Order list reports current manual payment state');
select is((public.admin_list_orders_v2(1, 50, 'REVA-' || (select prefix from m026_fixture_context), 'all', 'late_unverified', 'all', 'newest')->>'total_count')::integer, 1, 'late-payment incident state can be filtered within fixture results');
select is((public.admin_list_orders_v2(1, 50, 'REVA-' || (select prefix from m026_fixture_context) || '1001', 'all', 'all', 'all', 'newest')->'items'->0->>'product_count')::integer, 2, 'Order Product count uses immutable item snapshots');
select is((public.admin_list_orders_v2(1, 50, 'REVA-' || (select prefix from m026_fixture_context) || '1001', 'all', 'all', 'all', 'newest')->'items'->0->'product_thumbnail'->>'image_id'), (select image_id::text from m026_fixture_context), 'thumbnail comes only from the current public Product image identity');
select is((public.admin_list_orders_v2(1, 50, 'REVA-' || (select prefix from m026_fixture_context) || '1002', 'all', 'all', 'all', 'newest')->'items'->0->'product_thumbnail'), 'null'::jsonb, 'Sold Product image is omitted from the public-thumbnail projection');
select is((public.admin_list_orders_v2(1, 50, 'REVA-' || (select prefix from m026_fixture_context) || 'FFFF', 'all', 'all', 'all', 'newest')->'items'), '[]'::jsonb, 'Order empty state has an empty item array');
select ok(position('contact' in public.admin_list_orders_v2(1, 50, 'REVA-' || (select prefix from m026_fixture_context), 'all', 'all', 'all', 'newest')::text) = 0, 'Order list never returns encrypted customer contact data');
select throws_ok($$select public.admin_list_purchase_requests_v2(0, 20, '', 'all', 'newest')$$, '22023', 'INVALID_ADMIN_LIST_FILTER', 'request page lower bound is enforced');
select throws_ok($$select public.admin_list_purchase_requests_v2(1, 51, '', 'all', 'newest')$$, '22023', 'INVALID_ADMIN_LIST_FILTER', 'request page size upper bound is enforced');
select throws_ok($$select public.admin_list_purchase_requests_v2(1, 20, repeat('x', 65), 'all', 'newest')$$, '22023', 'INVALID_ADMIN_LIST_FILTER', 'request search above 64 characters is rejected');
select throws_ok($$select public.admin_list_purchase_requests_v2(1, 20, 'REVA;DROP', 'all', 'newest')$$, '22023', 'INVALID_ADMIN_LIST_FILTER', 'request search rejects characters outside the reference alphabet');
select throws_ok($$select public.admin_list_purchase_requests_v2(1, 20, '', 'expired', 'newest')$$, '22023', 'INVALID_ADMIN_LIST_FILTER', 'unsupported request status is rejected');
select throws_ok($$select public.admin_list_purchase_requests_v2(1, 20, '', null, 'newest')$$, '22023', 'INVALID_ADMIN_LIST_FILTER', 'null request status is rejected');
select throws_ok($$select public.admin_list_purchase_requests_v2(1, 20, '', 'all', null)$$, '22023', 'INVALID_ADMIN_LIST_FILTER', 'null request date ordering is rejected');
select throws_ok($$select public.admin_list_orders_v2(1, 20, '', 'unexpected', 'all', 'all', 'newest')$$, '22023', 'INVALID_ADMIN_LIST_FILTER', 'unsupported Order state is rejected');
select throws_ok($$select public.admin_list_orders_v2(1, 20, '', 'all', null, 'all', 'newest')$$, '22023', 'INVALID_ADMIN_LIST_FILTER', 'null Order payment filter is rejected');
select throws_ok($$select public.admin_list_orders_v2(1, 20, repeat('x', 65), 'all', 'all', 'all', 'newest')$$, '22023', 'INVALID_ADMIN_LIST_FILTER', 'Order search above 64 characters is rejected');
select throws_ok($$select public.admin_list_orders_v2(1, 20, 'REVA;DROP', 'all', 'all', 'all', 'newest')$$, '22023', 'INVALID_ADMIN_LIST_FILTER', 'Order search rejects characters outside the reference alphabet');
select throws_ok($$select public.admin_list_orders_v2(1, 20, '', 'all', 'all', 'all', 'unordered')$$, '22023', 'INVALID_ADMIN_LIST_FILTER', 'unsupported Order date order is rejected');
select ok(not has_function_privilege('anon', 'public.admin_list_purchase_requests_v2(integer,integer,text,text,text)', 'EXECUTE'), 'anonymous role has no request-list RPC grant');
select ok(not has_function_privilege('anon', 'public.admin_list_orders_v2(integer,integer,text,text,text,text,text)', 'EXECUTE'), 'anonymous role has no Order-list RPC grant');
select ok(not has_function_privilege('service_role', 'public.admin_list_purchase_requests_v2(integer,integer,text,text,text)', 'EXECUTE'), 'service role has no direct request-list RPC grant');
select ok(not has_function_privilege('service_role', 'public.admin_list_orders_v2(integer,integer,text,text,text,text,text)', 'EXECUTE'), 'service role has no direct Order-list RPC grant');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', (select customer_id::text from m026_fixture_context), true);
select throws_ok($$select public.admin_list_purchase_requests_v2(1, 20, '', 'all', 'newest')$$, '42501', 'ADMIN_REQUIRED', 'authenticated customer cannot list requests');
select throws_ok($$select public.admin_list_orders_v2(1, 20, '', 'all', 'all', 'all', 'newest')$$, '42501', 'ADMIN_REQUIRED', 'authenticated customer cannot list Orders');
reset role;

set local role anon;
select set_config('request.jwt.claim.sub', '', true);
select ok(not has_function_privilege('anon', 'public.admin_list_purchase_requests_v2(integer,integer,text,text,text)', 'EXECUTE'), 'anonymous visitor cannot invoke request listing');
select ok(not has_function_privilege('anon', 'public.admin_list_orders_v2(integer,integer,text,text,text,text,text)', 'EXECUTE'), 'anonymous visitor cannot invoke Order listing');
reset role;

select is((select count(*)::integer from private.orders order_row join m026_order_fixture_ids fixture on fixture.id = order_row.id), 105, 'listing RPCs do not create or mutate fixture Order rows');
select is((select count(*)::integer from private.payments payment join m026_order_fixture_ids fixture on fixture.id = payment.order_id), 2, 'listing RPCs do not create or mutate fixture payment rows');
select is((select count(*)::integer from private.inventory_reservations reservation join m026_order_fixture_ids fixture on fixture.id = reservation.order_id), 0, 'listing RPCs do not create reservations for fixture Orders');

select * from finish();
rollback;
