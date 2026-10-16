begin;

create extension if not exists pgtap with schema extensions;
select plan(34);

select ok(
  has_sequence_privilege('authenticated', 'private.product_sku_sequence', 'USAGE'),
  'authenticated Product Manager role retains the narrow Product SKU default privilege'
);

insert into auth.users (id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('90000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'tx-admin@example.test', '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('90000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'tx-customer@example.test', '{}'::jsonb, '{}'::jsonb, now(), now());
update public.profiles set role = 'admin' where id = '90000000-0000-0000-0000-000000000001';
insert into public.intake_items (id, source_type, destination, created_by_profile_id, acquisition_cost, received_at)
values
  ('91000000-0000-0000-0000-000000000001', 'sell', 'catalog', '90000000-0000-0000-0000-000000000001', 1.00, current_date),
  ('91000000-0000-0000-0000-000000000002', 'sell', 'catalog', '90000000-0000-0000-0000-000000000001', 1.00, current_date);
insert into public.products (
  id, intake_item_id, created_by_profile_id, sku, slug, title, description, price,
  audience, garment_type, size_label, condition_rating, status, published_at, public_media_ready_at
) values
  ('92000000-0000-0000-0000-000000000001', '91000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000001', 'RV-990001', 'tx-shirt-one', 'Test Shirt One', 'Fixture', 10.00, 'mujer', 'camisas', 'M', 3, 'published', now(), now()),
  ('92000000-0000-0000-0000-000000000002', '91000000-0000-0000-0000-000000000002', '90000000-0000-0000-0000-000000000001', 'RV-990002', 'tx-shirt-two', 'Test Shirt Two', 'Fixture', 20.00, 'mujer', 'camisas', 'M', 3, 'published', now(), now());

set local role anon;
select throws_ok(
  $$select count(*) from private.purchase_requests$$,
  '42501', null,
  'anonymous role cannot read private purchase requests'
);
reset role;
set local role anon;
select throws_ok(
  $$select public.admin_get_purchase_request('93000000-0000-0000-0000-000000000001')$$,
  '42501', null,
  'anonymous public reference knowledge does not authorize private details'
);
reset role;

set local role service_role;
select throws_ok(
  $$select * from public.create_purchase_request(
    '93000000-0000-0000-0000-000000000003', array['tx-shirt-one'],
    '[{"slug":"tx-shirt-one","price":"10.00"}]'::jsonb,
    jsonb_build_object('first_name', repeat('x', 16385)),
    '{"street":{"keyVersion":1,"nonce":"AA","ciphertext":"AA","tag":"AA"}}'::jsonb,
    '0101', 'cf', '{}'::jsonb,
    decode(repeat('ef', 32), 'hex'), jsonb_build_array(jsonb_build_object('version',1,'digest',repeat('ef',32))),
    decode(repeat('12', 32), 'hex'), jsonb_build_array(jsonb_build_object('version',1,'digest',repeat('12',32))), null, 1::smallint, 1::smallint
  )$$,
  '22023', 'INVALID_PURCHASE_REQUEST',
  'submission rejects oversized encrypted contact payload before persistence'
);
select * from public.create_purchase_request(
  '93000000-0000-0000-0000-000000000001',
  array['tx-shirt-one','tx-shirt-two'],
  '[{"slug":"tx-shirt-one","price":"10.00"},{"slug":"tx-shirt-two","price":"20.00"}]'::jsonb,
  '{"first_name":{"keyVersion":1,"nonce":"AA","ciphertext":"AA","tag":"AA"}}'::jsonb,
  '{"street":{"keyVersion":1,"nonce":"AA","ciphertext":"AA","tag":"AA"}}'::jsonb,
  '0101', 'cf', '{}'::jsonb,
  decode(repeat('ab', 32), 'hex'), jsonb_build_array(jsonb_build_object('version',1,'digest',repeat('ab',32))),
  decode(repeat('cd', 32), 'hex'), jsonb_build_array(jsonb_build_object('version',1,'digest',repeat('cd',32))),
  null, 1::smallint, 1::smallint
);
reset role;
select is((select count(*)::integer from private.orders o join private.order_items i on i.order_id=o.id where i.product_id in ('92000000-0000-0000-0000-000000000001','92000000-0000-0000-0000-000000000002')), 0, 'purchase request submission does not create an Order for its fixture Products');
set local role authenticated;
select set_config('request.jwt.claim.sub', '90000000-0000-0000-0000-000000000002', true);
select throws_ok(
  $$select count(*) from private.purchase_requests$$,
  '42501', null,
  'authenticated customer cannot read private request records directly'
);
reset role;

set local role service_role;
select is((select status from public.create_purchase_request(
  '93000000-0000-0000-0000-000000000099',
  array['tx-shirt-one','tx-shirt-two'],
  '[{"slug":"tx-shirt-one","price":"10.00"},{"slug":"tx-shirt-two","price":"20.00"}]'::jsonb,
  '{"first_name":{"keyVersion":1,"nonce":"AA","ciphertext":"AA","tag":"AA"}}'::jsonb,
  '{"street":{"keyVersion":1,"nonce":"AA","ciphertext":"AA","tag":"AA"}}'::jsonb,
  '0101', 'cf', '{}'::jsonb,
  decode(repeat('ab', 32), 'hex'), jsonb_build_array(jsonb_build_object('version',1,'digest',repeat('ab',32))),
  decode(repeat('cd', 32), 'hex'), jsonb_build_array(jsonb_build_object('version',1,'digest',repeat('cd',32))), null, 1::smallint, 1::smallint
)), 'existing', 'same idempotency digest returns the existing safe reference instead of duplicating the request');

select is((select status from public.create_purchase_request(
  '93000000-0000-0000-0000-000000000002',
  array['tx-shirt-two'],
  '[{"slug":"tx-shirt-two","price":"20.00"}]'::jsonb,
  '{"first_name":{"keyVersion":1,"nonce":"AA","ciphertext":"AA","tag":"AA"}}'::jsonb,
  '{"street":{"keyVersion":1,"nonce":"AA","ciphertext":"AA","tag":"AA"}}'::jsonb,
  '0101', 'cf', '{}'::jsonb,
  decode(repeat('ef', 32), 'hex'), jsonb_build_array(jsonb_build_object('version',1,'digest',repeat('ef',32))),
  decode(repeat('12', 32), 'hex'), jsonb_build_array(jsonb_build_object('version',1,'digest',repeat('12',32))), '90000000-0000-0000-0000-000000000002', 1::smallint, 1::smallint
)), 'created', 'authenticated customer can submit a request without creating an Order');
reset role;

select is(
  (select expires_at - created_at from private.purchase_requests where id = '93000000-0000-0000-0000-000000000001'),
  interval '24 hours',
  'temporary requests expire 24 hours after database creation time'
);
select is((select user_id from private.purchase_requests where id='93000000-0000-0000-0000-000000000002'), '90000000-0000-0000-0000-000000000002'::uuid, 'authenticated request is linked only to the verified profile id supplied by the server boundary');
select is((select count(*)::integer from private.inventory_reservations where product_id in ('92000000-0000-0000-0000-000000000001','92000000-0000-0000-0000-000000000002')), 0, 'request submission does not reserve its fixture inventory');
select is((select count(*)::integer from private.purchase_request_items where request_id = '93000000-0000-0000-0000-000000000001'), 2, 'request snapshots trusted Products and prices');

update public.products set price = 12.00 where id = '92000000-0000-0000-0000-000000000001';
set local role service_role;
select is((select status from public.create_purchase_request(
  '93000000-0000-0000-0000-000000000003',
  array['tx-shirt-one'],
  '[{"slug":"tx-shirt-one","price":"10.00"}]'::jsonb,
  '{"first_name":{"keyVersion":1,"nonce":"AA","ciphertext":"AA","tag":"AA"}}'::jsonb,
  '{"street":{"keyVersion":1,"nonce":"AA","ciphertext":"AA","tag":"AA"}}'::jsonb,
  '0101', 'cf', '{}'::jsonb,
  decode(repeat('34', 32), 'hex'), jsonb_build_array(jsonb_build_object('version',1,'digest',repeat('34',32))),
  decode(repeat('56', 32), 'hex'), jsonb_build_array(jsonb_build_object('version',1,'digest',repeat('56',32))), null, 1::smallint, 1::smallint
)), 'changed', 'submission rechecks authoritative prices inside the Product lock');
reset role;
select is(
  (select request_count::integer from private.purchase_request_rate_limits where fingerprint_digest = decode(repeat('56', 32), 'hex')),
  null::integer,
  'a changed-price response does not consume the origin request quota'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '90000000-0000-0000-0000-000000000002', true);
select throws_ok(
  $$select public.admin_approve_purchase_request('93000000-0000-0000-0000-000000000001', false)$$,
  '42501', 'ADMIN_REQUIRED',
  'non-admin authenticated customer cannot approve requests'
);
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '90000000-0000-0000-0000-000000000001', true);
select throws_ok(
  $$select public.admin_approve_purchase_request('93000000-0000-0000-0000-000000000001', false)$$,
  'P0001', 'PRICE_REVIEW_REQUIRED',
  'approval rejects changed prices without explicit reviewed-price confirmation'
);
select is(jsonb_typeof(public.admin_get_purchase_request('93000000-0000-0000-0000-000000000001')), 'object', 'authorized request detail access returns the protected request');
reset role;
select is((select count(*)::integer from private.personal_data_access_events where resource_type='purchase_request' and resource_id='93000000-0000-0000-0000-000000000001'), 1, 'authorized request detail reveals are audit logged');
set local role authenticated;
select set_config('request.jwt.claim.sub', '90000000-0000-0000-0000-000000000001', true);
select * from public.admin_approve_purchase_request('93000000-0000-0000-0000-000000000001', true);
reset role;

select ok((select source_request_expires_at > now() + interval '23 hours' from private.orders o join private.order_items i on i.order_id=o.id where i.product_id='92000000-0000-0000-0000-000000000001'), 'Order preserves the original 24-hour request deadline');
select is((select count(*)::integer from private.inventory_reservations where product_id in ('92000000-0000-0000-0000-000000000001','92000000-0000-0000-0000-000000000002')), 2, 'admin approval reserves every unique fixture garment in one transaction');
select is((select max(r.expires_at - r.created_at) from private.inventory_reservations r where r.product_id in ('92000000-0000-0000-0000-000000000001','92000000-0000-0000-0000-000000000002')), interval '3 hours', 'fixture reservation windows are exactly three hours');
select is((select unit_price from private.order_items where product_id='92000000-0000-0000-0000-000000000001'), 12.00::numeric, 'Order item snapshots the current authoritative Product price');
select is((select c.encryption_context_id from private.order_contacts c join private.order_items i on i.order_id=c.order_id where i.product_id='92000000-0000-0000-0000-000000000001'), '93000000-0000-0000-0000-000000000001'::uuid, 'encrypted data retains its authenticated source-record context after transfer');
select is((select status from public.products where id = '92000000-0000-0000-0000-000000000001'), 'reserved', 'reserved garment leaves the published state');
select is((select public_media_ready_at from public.products where id = '92000000-0000-0000-0000-000000000001'), null::timestamptz, 'reserved garment is removed from public media-ready projection');
select is((select count(*)::integer from private.purchase_requests where id = '93000000-0000-0000-0000-000000000001'), 0, 'approved request is removed after atomic Order transfer');
select is((select count(*)::integer from private.personal_data_access_events where resource_type='purchase_request' and resource_id='93000000-0000-0000-0000-000000000001'), 0, 'request access history is removed when the temporary request is consumed');
select public.admin_cancel_unpaid_order((select i.order_id from private.order_items i where i.product_id='92000000-0000-0000-0000-000000000001'));
select is((select status from public.products where id = '92000000-0000-0000-0000-000000000001'), 'published', 'cancelling unpaid Order releases Product');
select ok((select public_media_ready_at is not null from public.products where id = '92000000-0000-0000-0000-000000000001'), 'released Product returns to public projection');
select is((select count(*)::integer from private.order_contacts c join private.order_items i on i.order_id=c.order_id where i.product_id='92000000-0000-0000-0000-000000000001') + (select count(*)::integer from private.order_delivery_snapshots d join private.order_items i on i.order_id=d.order_id where i.product_id='92000000-0000-0000-0000-000000000001') + (select count(*)::integer from private.order_billing_snapshots b join private.order_items i on i.order_id=b.order_id where i.product_id='92000000-0000-0000-0000-000000000001'), 0, 'cancellation deletes this fixture Order personal-data snapshots');

update private.purchase_requests set created_at = now() - interval '25 hours', expires_at = now() - interval '1 hour'
where id = '93000000-0000-0000-0000-000000000002';
set local role service_role;
select public.cleanup_transactional_records();
reset role;
select is((select count(*)::integer from private.purchase_requests where id='93000000-0000-0000-0000-000000000002'), 0, 'expired request and encrypted personal data are deleted');
select is((select count(*)::integer from private.purchase_request_items where request_id='93000000-0000-0000-0000-000000000002'), 0, 'dependent expired request item snapshots are deleted');
update private.orders set source_request_expires_at=now()-interval '1 second'
where id=(select i.order_id from private.order_items i where i.product_id='92000000-0000-0000-0000-000000000001');
set local role service_role;
select public.cleanup_transactional_records();
reset role;
select is((select count(*)::integer from private.orders o join private.order_items i on i.order_id=o.id where i.product_id='92000000-0000-0000-0000-000000000001'), 0, 'unpaid cancelled Order is deleted after its original deadline');
select is((select count(*)::integer from private.order_events where event_type='cancelled' and order_id is null), 0, 'deleted Order leaves no orphan lifecycle events');

select * from finish();
rollback;
