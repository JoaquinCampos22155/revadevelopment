begin;

-- Preserve the originating request deadline across atomic approval. Existing
-- local Orders have no reliable source deadline, so leave them NULL and fail
-- closed (retain rather than infer a deletion date).
alter table private.orders
  add column source_request_expires_at timestamptz;

create index orders_source_request_expiry_idx
  on private.orders (source_request_expires_at)
  where source_request_expires_at is not null;

create or replace function public.admin_approve_purchase_request(p_request_id uuid, p_customer_price_reviewed boolean)
returns table (order_id uuid, public_reference text)
language plpgsql security definer set search_path = '' as $$
declare
  v_request private.purchase_requests%rowtype;
  v_order_id uuid := gen_random_uuid();
  v_admin_id uuid := auth.uid();
  v_changed boolean;
  v_subtotal numeric(12,2);
  v_products uuid[];
begin
  if v_admin_id is null or not (select private.is_admin()) then raise exception using errcode = '42501', message = 'ADMIN_REQUIRED'; end if;
  select * into v_request from private.purchase_requests r where r.id = p_request_id for update;
  if not found or v_request.expires_at <= now() then raise exception using errcode = 'P0001', message = 'REQUEST_EXPIRED_OR_MISSING'; end if;
  select array_agg(i.product_id order by i.product_id) into v_products from private.purchase_request_items i where i.request_id = p_request_id;
  if coalesce(cardinality(v_products),0) = 0 then raise exception using errcode = 'P0001', message = 'REQUEST_EMPTY'; end if;
  perform p.id from public.products p where p.id = any(v_products) order by p.id for update;
  if (select count(*) from public.products p where p.id = any(v_products) and p.status = 'published' and p.public_media_ready_at is not null and p.price is not null) <> cardinality(v_products) then
    raise exception using errcode = 'P0001', message = 'PRODUCT_UNAVAILABLE';
  end if;
  select exists (
    select 1 from private.purchase_request_items i join public.products p on p.id = i.product_id
    where i.request_id = p_request_id and i.unit_price <> p.price
  ) into v_changed;
  if v_changed and not coalesce(p_customer_price_reviewed,false) then
    raise exception using errcode = 'P0001', message = 'PRICE_REVIEW_REQUIRED';
  end if;
  select sum(p.price) into v_subtotal from public.products p where p.id = any(v_products);

  insert into private.orders (id, public_reference, user_id, status, payment_status, fulfillment_status, merchandise_subtotal, source_request_expires_at)
  values (v_order_id, v_request.public_reference, v_request.user_id, 'pending_payment', 'not_started', 'not_ready', v_subtotal, v_request.expires_at);
  insert into private.order_contacts (order_id, encryption_context_id, encrypted_fields, key_version)
  values (v_order_id, v_request.id, v_request.contact_ciphertext, v_request.contact_key_version);
  insert into private.order_delivery_snapshots (order_id, encryption_context_id, municipality_code, encrypted_fields, key_version)
  values (v_order_id, v_request.id, v_request.municipality_code, v_request.delivery_ciphertext, v_request.delivery_key_version);
  insert into private.order_billing_snapshots (order_id, encryption_context_id, billing_type, encrypted_fields, key_version)
  values (v_order_id, v_request.id, v_request.billing_type, v_request.billing_ciphertext, v_request.billing_key_version);
  insert into private.order_items (order_id, product_id, position, sku_snapshot, title_snapshot, unit_price, quantity)
  select v_order_id, p.id, i.position, p.sku, p.title, p.price, 1
  from private.purchase_request_items i join public.products p on p.id = i.product_id
  where i.request_id = p_request_id order by i.position;
  update public.products p set status = 'reserved', public_media_ready_at = null where p.id = any(v_products);
  insert into private.inventory_reservations (order_id, product_id, status, expires_at)
  select v_order_id, product_id, 'active', now() + interval '3 hours' from unnest(v_products) as product_id;
  insert into private.order_events (order_id, public_reference, actor_profile_id, event_type, metadata)
  values (v_order_id, v_request.public_reference, v_admin_id, 'approved', jsonb_build_object('price_changed',v_changed,'price_reconfirmed',coalesce(p_customer_price_reviewed,false)));
  delete from private.personal_data_access_events where resource_type='purchase_request' and resource_id=p_request_id;
  delete from private.purchase_requests where id = p_request_id;
  return query select v_order_id, v_request.public_reference;
end;
$$;

create or replace function public.cleanup_transactional_records()
returns integer language plpgsql security definer set search_path = '' as $$
declare v_deleted integer := 0; v_expired record; v_order_to_delete record; v_orders_deleted integer := 0;
begin
  delete from private.personal_data_access_events
  where resource_type='purchase_request'
    and resource_id in (select id from private.purchase_requests where expires_at <= now());
  delete from private.purchase_requests where expires_at <= now();
  get diagnostics v_deleted = row_count;

  for v_expired in
    select o.id,o.public_reference from private.orders o
    where o.status = 'pending_payment'
      and exists(select 1 from private.inventory_reservations r where r.order_id=o.id and r.status='active' and r.expires_at <= now())
    for update skip locked
  loop
    update public.products p set status='published', public_media_ready_at=now()
      from private.inventory_reservations r where r.order_id=v_expired.id and r.product_id=p.id and r.status='active' and p.status='reserved';
    update private.inventory_reservations set status='expired', resolved_at=now() where order_id=v_expired.id and status='active';
    update private.payments set status='cancelled' where order_id=v_expired.id and status='pending_manual';
    update private.orders set status='expired',payment_status='expired',fulfillment_status='cancelled',updated_at=now() where id=v_expired.id;
    insert into private.order_events(order_id,public_reference,event_type) values(v_expired.id,v_expired.public_reference,'reservation_expired');
  end loop;

  -- Three-hour reservation expiry releases the garment but does not shorten
  -- the original 24-hour data-retention deadline. Keep financial exceptions.
  for v_order_to_delete in
    select o.id from private.orders o
    where o.source_request_expires_at <= now() and o.status in ('expired','cancelled')
    for update skip locked
  loop
    -- All payment-state transitions lock the Order first. This lock makes the
    -- retention decision serialize with a concurrent late-payment report.
    if not exists (
      select 1 from private.payments p
      where p.order_id=v_order_to_delete.id and p.status in ('verified_manual','late_unverified')
    ) then
      delete from private.personal_data_access_events where resource_type='order' and resource_id=v_order_to_delete.id;
      delete from private.order_events where order_id=v_order_to_delete.id;
      delete from private.orders where id=v_order_to_delete.id;
      v_orders_deleted := v_orders_deleted + 1;
    end if;
  end loop;
  v_deleted := v_deleted + v_orders_deleted;

  delete from private.purchase_request_rate_limits where expires_at <= now();
  return v_deleted;
end;
$$;

revoke all on function public.admin_approve_purchase_request(uuid,boolean) from public, anon;
revoke all on function public.cleanup_transactional_records() from public, anon, authenticated;
grant execute on function public.admin_approve_purchase_request(uuid,boolean) to authenticated;
grant execute on function public.cleanup_transactional_records() to service_role;

commit;
