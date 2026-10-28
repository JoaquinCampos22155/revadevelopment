begin;

create extension if not exists pgtap with schema extensions;
select no_plan();

select ok(to_regclass('private.product_lifecycle_events') is not null, 'manual sale has a private Product lifecycle audit table');
select ok(to_regprocedure('public.admin_mark_product_sold(uuid,text,boolean)') is not null, 'manual sale uses a narrow RPC');
select ok(coalesce((select relrowsecurity from pg_class where oid = to_regclass('private.product_lifecycle_events')), false), 'manual sale audit table has RLS enabled');
select ok(not exists (select 1 from pg_policy where polrelid = to_regclass('private.product_lifecycle_events')), 'manual sale audit table has no client-readable policies');
select ok((select prosecdef and proconfig @> array['search_path=""'] from pg_proc where oid = to_regprocedure('public.admin_mark_product_sold(uuid,text,boolean)')), 'RPC is SECURITY DEFINER with an empty fixed search path');
select ok(not has_function_privilege('anon', 'public.admin_mark_product_sold(uuid,text,boolean)', 'EXECUTE'), 'anonymous role cannot execute manual sale');
select ok(has_function_privilege('authenticated', 'public.admin_mark_product_sold(uuid,text,boolean)', 'EXECUTE'), 'authenticated role can reach the RPC authorization check');
select ok(not has_function_privilege('service_role', 'public.admin_mark_product_sold(uuid,text,boolean)', 'EXECUTE'), 'service role has no direct manual-sale RPC grant');
select ok(not has_column_privilege('authenticated', 'public.products', 'status', 'UPDATE'), 'manual sale does not add direct Product status-update privilege');
select ok(not has_table_privilege('anon', 'private.product_lifecycle_events', 'SELECT'), 'anonymous role cannot read Product lifecycle events');
select ok(not has_table_privilege('authenticated', 'private.product_lifecycle_events', 'SELECT'), 'authenticated role cannot read Product lifecycle events');
select ok(not has_table_privilege('service_role', 'private.product_lifecycle_events', 'SELECT'), 'service role has no direct Product lifecycle event read grant');

insert into auth.users (id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('94000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'manual-sale-admin@example.test', '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('94000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'manual-sale-customer@example.test', '{}'::jsonb, '{}'::jsonb, now(), now());
update public.profiles set role = 'admin' where id = '94000000-0000-0000-0000-000000000001';

insert into public.intake_items (id, source_type, destination, created_by_profile_id, acquisition_cost, received_at)
values
  ('94000000-0000-0000-0000-000000000101', 'sell', 'catalog', '94000000-0000-0000-0000-000000000001', 1.00, current_date),
  ('94000000-0000-0000-0000-000000000102', 'sell', 'catalog', '94000000-0000-0000-0000-000000000001', 1.00, current_date),
  ('94000000-0000-0000-0000-000000000103', 'sell', 'catalog', '94000000-0000-0000-0000-000000000001', 1.00, current_date),
  ('94000000-0000-0000-0000-000000000104', 'sell', 'catalog', '94000000-0000-0000-0000-000000000001', 1.00, current_date),
  ('94000000-0000-0000-0000-000000000105', 'sell', 'catalog', '94000000-0000-0000-0000-000000000001', 1.00, current_date),
  ('94000000-0000-0000-0000-000000000106', 'sell', 'catalog', '94000000-0000-0000-0000-000000000001', 1.00, current_date),
  ('94000000-0000-0000-0000-000000000107', 'sell', 'catalog', '94000000-0000-0000-0000-000000000001', 1.00, current_date);

insert into public.products (
  id, intake_item_id, created_by_profile_id, sku, slug, title, description, price,
  audience, garment_type, size_label, condition_rating, status, published_at, public_media_ready_at
) values
  ('94000000-0000-0000-0000-000000000201', '94000000-0000-0000-0000-000000000101', '94000000-0000-0000-0000-000000000001', 'RV-998901', 'manual-sale-published', 'Manual Sale Published', 'Fixture', 40.00, 'mujer', 'camisas', 'M', 3, 'published', '2026-10-01T10:00:00Z', '2026-10-01T10:01:00Z'),
  ('94000000-0000-0000-0000-000000000202', '94000000-0000-0000-0000-000000000102', '94000000-0000-0000-0000-000000000001', 'RV-998902', 'manual-sale-draft', 'Manual Sale Draft', null, null, null, null, null, null, 'draft', null, null),
  ('94000000-0000-0000-0000-000000000203', '94000000-0000-0000-0000-000000000103', '94000000-0000-0000-0000-000000000001', 'RV-998903', 'manual-sale-archived', 'Manual Sale Archived', null, null, null, null, null, null, 'archived', null, null),
  ('94000000-0000-0000-0000-000000000204', '94000000-0000-0000-0000-000000000104', '94000000-0000-0000-0000-000000000001', 'RV-998904', 'manual-sale-reserved', 'Manual Sale Reserved', 'Fixture', 43.00, 'mujer', 'camisas', 'M', 3, 'reserved', '2026-10-01T10:00:00Z', null),
  ('94000000-0000-0000-0000-000000000205', '94000000-0000-0000-0000-000000000105', '94000000-0000-0000-0000-000000000001', 'RV-998905', 'manual-sale-already-sold', 'Manual Sale Already Sold', 'Fixture', 44.00, 'mujer', 'camisas', 'M', 3, 'sold', '2026-10-01T10:00:00Z', null),
  ('94000000-0000-0000-0000-000000000206', '94000000-0000-0000-0000-000000000106', '94000000-0000-0000-0000-000000000001', 'RV-998906', 'manual-sale-reservation-conflict', 'Manual Sale Reservation Conflict', 'Fixture', 45.00, 'mujer', 'camisas', 'M', 3, 'published', '2026-10-01T10:00:00Z', '2026-10-01T10:01:00Z'),
  ('94000000-0000-0000-0000-000000000207', '94000000-0000-0000-0000-000000000107', '94000000-0000-0000-0000-000000000001', 'RV-998907', 'manual-sale-stale', 'Manual Sale Stale', null, null, null, null, null, null, 'draft', null, null);

insert into public.product_images (id, product_id, storage_key, alt_text, position, width, height, mime_type)
values ('94000000-0000-0000-0000-000000000301', '94000000-0000-0000-0000-000000000201', 'products/manual-sale-fixture.webp', 'Camisa de prueba', 1, 800, 1000, 'image/webp');

insert into private.orders (id, public_reference, status, payment_status, fulfillment_status, merchandise_subtotal)
values ('94000000-0000-0000-0000-000000000401', 'REVA-940000000001', 'pending_payment', 'pending', 'not_ready', 45.00);
insert into private.inventory_reservations (order_id, product_id, status, expires_at)
values ('94000000-0000-0000-0000-000000000401', '94000000-0000-0000-0000-000000000206', 'active', now() + interval '1 hour');

set local role authenticated;
select set_config('request.jwt.claim.sub', '94000000-0000-0000-0000-000000000001', true);
select ok((select recommendation_position > 0 from public.add_product_recommendation('94000000-0000-0000-0000-000000000201')), 'published fixture can be recommended before sale');
select is((select slug from public.admin_mark_product_sold('94000000-0000-0000-0000-000000000201', 'published', true)), 'manual-sale-published', 'admin can atomically mark a published Product sold');
reset role;

select is((select status from public.products where id = '94000000-0000-0000-0000-000000000201'), 'sold', 'published Product transitions to Sold');
select is((select public_media_ready_at from public.products where id = '94000000-0000-0000-0000-000000000201'), null::timestamptz, 'Sold Product is removed from public media-ready inventory');
select is((select published_at from public.products where id = '94000000-0000-0000-0000-000000000201'), '2026-10-01T10:00:00Z'::timestamptz, 'sale preserves publication history');
select is((select sku || ':' || slug from public.products where id = '94000000-0000-0000-0000-000000000201'), 'RV-998901:manual-sale-published', 'sale preserves Product identity and SKU');
select is((select count(*)::integer from public.product_images where product_id = '94000000-0000-0000-0000-000000000201'), 1, 'sale preserves Product image metadata');
select is((select storage_key from public.product_images where product_id = '94000000-0000-0000-0000-000000000201'), 'products/manual-sale-fixture.webp', 'sale preserves the image storage reference');
select is((select count(*)::integer from api.published_product_previews where slug = 'manual-sale-published'), 0, 'Sold Product leaves the public Catalog projection');
select is((select count(*)::integer from api.published_product_details where slug = 'manual-sale-published'), 0, 'Sold Product leaves the public Product-detail projection');
select is((select count(*)::integer from api.recommended_product_previews where title = 'Manual Sale Published'), 0, 'Sold Product leaves public recommendations');
select is((select count(*)::integer from public.product_recommendations where product_id = '94000000-0000-0000-0000-000000000201'), 1, 'sale preserves internal recommendation history without exposing the Product publicly');
select is((select count(*)::integer from private.product_lifecycle_events where product_id = '94000000-0000-0000-0000-000000000201'), 1, 'successful manual sale creates exactly one lifecycle audit event');
select is((select previous_status from private.product_lifecycle_events where product_id = '94000000-0000-0000-0000-000000000201'), 'published', 'audit event records the previous state');
select is((select actor_profile_id from private.product_lifecycle_events where product_id = '94000000-0000-0000-0000-000000000201'), '94000000-0000-0000-0000-000000000001'::uuid, 'audit actor is derived from the authenticated Admin session');
select ok((select external_payment_verified and new_status = 'sold' and event_type = 'manual_external_sale' and occurred_at <= clock_timestamp() from private.product_lifecycle_events where product_id = '94000000-0000-0000-0000-000000000201'), 'audit records the Admin attestation and database timestamp');
select is((select count(*)::integer from private.order_items where product_id = '94000000-0000-0000-0000-000000000201') + (select count(*)::integer from private.payments payment join private.order_items item on item.order_id = payment.order_id where item.product_id = '94000000-0000-0000-0000-000000000201') + (select count(*)::integer from private.inventory_reservations where product_id = '94000000-0000-0000-0000-000000000201'), 0, 'manual sale creates no Order item, Payment, or reservation');

set local role authenticated;
select set_config('request.jwt.claim.sub', '94000000-0000-0000-0000-000000000001', true);
select is((select status from public.products where id = '94000000-0000-0000-0000-000000000201'), 'sold', 'authorized Product Manager reads retain Sold Products');
select throws_ok($$update public.products set status = 'sold' where id = '94000000-0000-0000-0000-000000000207'$$, '42501', null, 'Admin cannot bypass the lifecycle RPC with a direct Product status update');
select throws_ok($$select * from public.admin_mark_product_sold('94000000-0000-0000-0000-000000000201', 'published', true)$$, 'P0001', 'PRODUCT_ALREADY_SOLD', 'a repeated manual sale is rejected');
select throws_ok($$select * from public.admin_mark_product_sold('94000000-0000-0000-0000-000000000203', 'draft', true)$$, 'P0001', 'PRODUCT_NOT_ELIGIBLE', 'archived Product cannot be marked Sold');
select throws_ok($$select * from public.admin_mark_product_sold('94000000-0000-0000-0000-000000000204', 'draft', true)$$, 'P0001', 'PRODUCT_NOT_ELIGIBLE', 'reserved Product cannot be marked Sold');
select throws_ok($$select * from public.admin_mark_product_sold('94000000-0000-0000-0000-000000000207', 'published', true)$$, 'P0001', 'STALE_PRODUCT_STATE', 'stale expected state is rejected');
select throws_ok($$select * from public.admin_mark_product_sold('94000000-0000-0000-0000-000000000202', 'draft', false)$$, '22023', 'EXTERNAL_PAYMENT_VERIFICATION_REQUIRED', 'manual sale requires explicit external payment attestation');
select throws_ok($$select * from public.admin_mark_product_sold('94000000-0000-0000-0000-000000000206', 'published', true)$$, 'P0001', 'ACTIVE_RESERVATION_EXISTS', 'active reservation conflict is rejected even when Product status is published');
select throws_ok($$select * from public.admin_mark_product_sold('94000000-0000-0000-0000-000000009999', 'draft', true)$$, 'P0002', 'PRODUCT_NOT_FOUND', 'missing Product cannot be marked Sold');
select throws_ok($$select public.prepare_product_publication('94000000-0000-0000-0000-000000000201')$$, 'P0002', 'The requested Product draft does not exist.', 'ordinary publication cannot reactivate a Sold Product');
reset role;

select is((select status from public.products where id = '94000000-0000-0000-0000-000000000206'), 'published', 'reservation-conflict rejection leaves Product unchanged');
select is((select count(*)::integer from private.product_lifecycle_events where product_id in ('94000000-0000-0000-0000-000000000203','94000000-0000-0000-0000-000000000204','94000000-0000-0000-0000-000000000206','94000000-0000-0000-0000-000000000207')), 0, 'rejected lifecycle transitions create no audit events');

set local role authenticated;
select set_config('request.jwt.claim.sub', '94000000-0000-0000-0000-000000000002', true);
select throws_ok($$select * from public.admin_mark_product_sold('94000000-0000-0000-0000-000000000202', 'draft', true)$$, '42501', 'ADMIN_REQUIRED', 'customer cannot mark a Product sold');
reset role;
set local role anon;
select set_config('request.jwt.claim.sub', '', true);
select throws_ok($$select * from public.admin_mark_product_sold('94000000-0000-0000-0000-000000000202', 'draft', true)$$, '42501', null, 'anonymous visitor cannot mark a Product sold');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '94000000-0000-0000-0000-000000000001', true);
select is((select slug from public.admin_mark_product_sold('94000000-0000-0000-0000-000000000202', 'draft', true)), 'manual-sale-draft', 'incomplete Draft can transition to Sold without invented publication facts');
reset role;
select is((select status from public.products where id = '94000000-0000-0000-0000-000000000202'), 'sold', 'Draft Product transitions to Sold');
select ok((select description is null and price is null and published_at is null from public.products where id = '94000000-0000-0000-0000-000000000202'), 'Draft sale preserves absent publication facts');
select is((select count(*)::integer from private.product_lifecycle_events where product_id = '94000000-0000-0000-0000-000000000202'), 1, 'Draft sale records one audit event');

select * from finish();
rollback;
