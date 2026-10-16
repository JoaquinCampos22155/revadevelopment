begin;
select plan(27);

select ok(to_regclass('private.payment_incidents') is not null, 'payment incidents have a private persistence boundary');
select ok(exists (select 1 from information_schema.columns where table_schema='private' and table_name='payments' and column_name='payment_link_sent_at'), 'manual payment-link sent time is recorded');
select ok(exists (select 1 from information_schema.columns where table_schema='private' and table_name='payments' and column_name='payment_link_reference'), 'only a non-sensitive payment-link reference is recorded');
select ok(exists (select 1 from information_schema.columns where table_schema='private' and table_name='orders' and column_name='shipping_coverage_confirmed'), 'shipping coverage must be explicitly confirmed');
select ok(exists (select 1 from information_schema.columns where table_schema='private' and table_name='purchase_requests' and column_name='idempotency_key_version'), 'idempotency digest key version is retained');
select ok(exists (select 1 from information_schema.columns where table_schema='private' and table_name='purchase_request_rate_limits' and column_name='hmac_key_version'), 'rate-limit digest key version is retained');
select ok(to_regprocedure('public.admin_resolve_late_payment(uuid,text,text,boolean)') is not null, 'late-payment resolution is admin-controlled and typed');
select ok(to_regprocedure('public.admin_delete_abandoned_order(uuid,boolean)') is not null, 'abandoned Order deletion is guarded and requires explicit confirmation in the database');
select ok(to_regprocedure('public.admin_set_order_shipping(uuid,numeric)') is null and to_regprocedure('public.admin_discard_payment_as_late(uuid)') is null and to_regprocedure('public.admin_open_late_payment_incident(uuid)') is not null, 'legacy shipping and unaudited late-payment actions are replaced by guarded operations');

insert into auth.users(id,aud,role,email,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
values
  ('90000000-0000-0000-0000-000000000101','authenticated','authenticated','security-admin@example.test','{}'::jsonb,'{}'::jsonb,now(),now()),
  ('90000000-0000-0000-0000-000000000102','authenticated','authenticated','security-customer@example.test','{}'::jsonb,'{}'::jsonb,now(),now());
update public.profiles set role='admin' where id='90000000-0000-0000-0000-000000000101';
insert into public.intake_items(id,source_type,destination,created_by_profile_id,acquisition_cost,received_at)
values
  ('91000000-0000-0000-0000-000000000101','sell','catalog','90000000-0000-0000-0000-000000000101',1.00,current_date),
  ('91000000-0000-0000-0000-000000000102','sell','catalog','90000000-0000-0000-0000-000000000101',1.00,current_date),
  ('91000000-0000-0000-0000-000000000103','sell','catalog','90000000-0000-0000-0000-000000000101',1.00,current_date);
insert into public.products(id,intake_item_id,created_by_profile_id,sku,slug,title,description,price,audience,garment_type,size_label,condition_rating,status,published_at,public_media_ready_at)
values
  ('92000000-0000-0000-0000-000000000101','91000000-0000-0000-0000-000000000101','90000000-0000-0000-0000-000000000101','RV-991101','security-current-pay','Security Test Paid','Synthetic fixture',55.00,'mujer','camisas','M',3,'published',now(),now()),
  ('92000000-0000-0000-0000-000000000102','91000000-0000-0000-0000-000000000102','90000000-0000-0000-0000-000000000101','RV-991102','security-late-no-pay','Security Test No Payment','Synthetic fixture',56.00,'mujer','camisas','M',3,'published',now(),now()),
  ('92000000-0000-0000-0000-000000000103','91000000-0000-0000-0000-000000000103','90000000-0000-0000-0000-000000000101','RV-991103','security-late-pay','Security Test Late Payment','Synthetic fixture',57.00,'mujer','camisas','M',3,'published',now(),now());

set local role service_role;
select * from public.create_purchase_request(
  '93000000-0000-0000-0000-000000000101',array['security-current-pay'],'[{"slug":"security-current-pay","price":"55.00"}]'::jsonb,
  '{"first_name":"Synthetic","last_name":"Customer"}'::jsonb,'{"street":"Synthetic"}'::jsonb,'0101','cf','{}'::jsonb,
  decode(repeat('a1',32),'hex'),jsonb_build_array(jsonb_build_object('version',1,'digest',repeat('a1',32))),
  decode(repeat('b1',32),'hex'),jsonb_build_array(jsonb_build_object('version',1,'digest',repeat('b1',32))),null::uuid,1::smallint,1::smallint
);
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','90000000-0000-0000-0000-000000000101',true);
select order_id as order1 from public.admin_approve_purchase_request('93000000-0000-0000-0000-000000000101',true) \gset
select set_config('test.order1', :'order1', true);
reset role;
select throws_ok($$select public.admin_confirm_order_shipping(current_setting('test.order1')::uuid,5.00,false)$$,'22023','COVERAGE_AND_SHIPPING_REQUIRED','shipping amount cannot be recorded without explicit coverage confirmation');
select is(public.admin_confirm_order_shipping(current_setting('test.order1')::uuid,5.00,true),60.00::numeric,'admin confirms coverage and authoritative final payable total');
reset role;
select is((select shipping_coverage_confirmed from private.orders where id=current_setting('test.order1')::uuid),true,'coverage confirmation is persisted on the Order');
reset role;
select throws_ok($$select public.admin_verify_order_payment(current_setting('test.order1')::uuid,'LOCAL-PAY-101')$$,'P0001','PAYMENT_AFTER_RESERVATION_EXPIRY','payment is not verifiable until a payment link has been recorded as sent');
select public.admin_record_payment_link_sent(current_setting('test.order1')::uuid,'LOCAL-LINK-101');
reset role;
select ok((select payment_link_sent_at is not null and payment_link_reference='LOCAL-LINK-101' from private.payments where order_id=current_setting('test.order1')::uuid),'manual Recurrente link sent time and non-sensitive reference are recorded');
select is((select status from private.payments where order_id=current_setting('test.order1')::uuid),'pending_manual','recording a sent link never verifies payment');
reset role;
select public.admin_verify_order_payment(current_setting('test.order1')::uuid,'LOCAL-PAY-101');
reset role;
select is((select verification_source from private.payments where order_id=current_setting('test.order1')::uuid),'recurrente_dashboard','manual payment verification records direct Recurrente source');
select ok((select o.status='paid' and p.status='sold' and p.public_media_ready_at is null and r.status='consumed'
  from private.orders o join private.order_items i on i.order_id=o.id join public.products p on p.id=i.product_id
  join private.inventory_reservations r on r.order_id=o.id and r.status='consumed'
  where o.id=current_setting('test.order1')::uuid),'verified payment atomically completes inventory sale and removes public media readiness');
select public.admin_update_order_fulfillment(current_setting('test.order1')::uuid,'preparing');
select is((select fulfillment_status from private.orders where id=current_setting('test.order1')::uuid),'preparing','paid Order can advance to preparation');
select public.admin_update_order_fulfillment(current_setting('test.order1')::uuid,'dispatched');
select public.admin_update_order_fulfillment(current_setting('test.order1')::uuid,'completed');
select is((select status from private.orders where id=current_setting('test.order1')::uuid),'completed','fulfillment completes only through the allowed lifecycle');
reset role;

set local role service_role;
select * from public.create_purchase_request(
  '93000000-0000-0000-0000-000000000102',array['security-late-no-pay'],'[{"slug":"security-late-no-pay","price":"56.00"}]'::jsonb,
  '{"first_name":"Synthetic","last_name":"Customer"}'::jsonb,'{"street":"Synthetic"}'::jsonb,'0101','cf','{}'::jsonb,
  decode(repeat('a2',32),'hex'),jsonb_build_array(jsonb_build_object('version',1,'digest',repeat('a2',32))),
  decode(repeat('b2',32),'hex'),jsonb_build_array(jsonb_build_object('version',1,'digest',repeat('b2',32))),null::uuid,1::smallint,1::smallint
);
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','90000000-0000-0000-0000-000000000101',true);
select order_id as order2 from public.admin_approve_purchase_request('93000000-0000-0000-0000-000000000102',true) \gset
select set_config('test.order2', :'order2', true);
reset role;
select public_reference as reference2 from private.orders where id=current_setting('test.order2')::uuid \gset
select set_config('test.reference2', :'reference2', true);
select public.admin_confirm_order_shipping(current_setting('test.order2')::uuid,0,true);
select public.admin_record_payment_link_sent(current_setting('test.order2')::uuid,'LOCAL-LINK-102');
reset role;
update private.inventory_reservations set expires_at=now()-interval '1 second' where product_id='92000000-0000-0000-0000-000000000102' and status='active';
reset role;
set local role service_role;
select public.cleanup_transactional_records();
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','90000000-0000-0000-0000-000000000101',true);
select public.admin_open_late_payment_incident(current_setting('test.order2')::uuid);
reset role;
update private.orders set source_request_expires_at=now()-interval '1 second' where id=current_setting('test.order2')::uuid;
reset role;
select ok((select status='open' from private.payment_incidents where order_id=current_setting('test.order2')::uuid),'late payment creates an explicit unresolved incident');
select throws_ok($$select public.admin_delete_abandoned_order(current_setting('test.order2')::uuid,true)$$,'P0001','ORDER_NOT_ELIGIBLE_FOR_DELETION','unresolved financial incident blocks Order deletion');
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','90000000-0000-0000-0000-000000000102',true);
select throws_ok($$select public.admin_resolve_late_payment(current_setting('test.order2')::uuid,'confirmed_no_payment',null,false)$$,'42501','ADMIN_REQUIRED','customer cannot resolve an administrator payment incident');
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','90000000-0000-0000-0000-000000000101',true);
select public.admin_resolve_late_payment(current_setting('test.order2')::uuid,'confirmed_no_payment',null,false);
reset role;
select is((select resolution from private.payment_incidents where public_reference=(select public_reference from private.orders where id=current_setting('test.order2')::uuid)),'confirmed_no_payment','admin records no-payment resolution after direct Recurrente review');
reset role;
select throws_ok($$select public.admin_delete_abandoned_order(current_setting('test.order2')::uuid,false)$$,'22023','DESTRUCTIVE_CONFIRMATION_REQUIRED','manual Order deletion requires destructive confirmation');
select public.admin_delete_abandoned_order(current_setting('test.order2')::uuid,true);
reset role;
select is((select count(*)::integer from private.order_contacts where encryption_context_id='93000000-0000-0000-0000-000000000102'),0,'confirmed abandoned Order deletion removes encrypted contact snapshot');
select ok((select order_id is null and resolution='confirmed_no_payment' and verification_source='recurrente_dashboard' from private.payment_incidents where public_reference=current_setting('test.reference2')),'resolved incident audit survives deletion without Order personal data');

reset role;
set local role service_role;
select * from public.create_purchase_request(
  '93000000-0000-0000-0000-000000000103',array['security-late-pay'],'[{"slug":"security-late-pay","price":"57.00"}]'::jsonb,
  '{"first_name":"Synthetic","last_name":"Customer"}'::jsonb,'{"street":"Synthetic"}'::jsonb,'0101','cf','{}'::jsonb,
  decode(repeat('a3',32),'hex'),jsonb_build_array(jsonb_build_object('version',1,'digest',repeat('a3',32))),
  decode(repeat('b3',32),'hex'),jsonb_build_array(jsonb_build_object('version',1,'digest',repeat('b3',32))),null::uuid,1::smallint,1::smallint
);
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','90000000-0000-0000-0000-000000000101',true);
select order_id as order3 from public.admin_approve_purchase_request('93000000-0000-0000-0000-000000000103',true) \gset
select set_config('test.order3', :'order3', true);
reset role;
select public.admin_confirm_order_shipping(current_setting('test.order3')::uuid,0,true);
select public.admin_record_payment_link_sent(current_setting('test.order3')::uuid,'LOCAL-LINK-103');
reset role;
update private.inventory_reservations set expires_at=now()-interval '1 second' where product_id='92000000-0000-0000-0000-000000000103' and status='active';
reset role;
set local role service_role;
select public.cleanup_transactional_records();
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','90000000-0000-0000-0000-000000000101',true);
select public.admin_open_late_payment_incident(current_setting('test.order3')::uuid);
select public.admin_resolve_late_payment(current_setting('test.order3')::uuid,'fulfilled_after_rereservation','LOCAL-PAY-103',false);
reset role;
select ok((select o.status='paid' and p.status='sold' and r.status='consumed' and pay.verification_source='recurrente_dashboard'
  from private.orders o join private.order_items i on i.order_id=o.id join public.products p on p.id=i.product_id
  join private.inventory_reservations r on r.order_id=o.id and r.status='consumed'
  join private.payments pay on pay.order_id=o.id and pay.status='verified_manual'
  where i.product_id='92000000-0000-0000-0000-000000000103'),'confirmed late payment fulfills only after atomic re-reservation of a still-published Product');

select * from finish();
rollback;
