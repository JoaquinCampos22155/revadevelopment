begin;

alter table private.purchase_requests
  add column idempotency_key_version smallint not null default 1 check (idempotency_key_version > 0);

alter table private.purchase_request_rate_limits
  add column hmac_key_version smallint not null default 1 check (hmac_key_version > 0);

alter table private.orders
  add column shipping_coverage_confirmed boolean not null default false,
  add column shipping_coverage_confirmed_at timestamptz,
  add column shipping_coverage_confirmed_by uuid references public.profiles(id) on delete set null;

alter table private.payments
  add column payment_link_sent_at timestamptz,
  add column payment_link_sent_by uuid references public.profiles(id) on delete set null,
  add column payment_link_reference text,
  add column verification_source text check (verification_source is null or verification_source = 'recurrente_dashboard'),
  add constraint payments_link_reference_safe check (
    payment_link_reference is null or payment_link_reference ~ '^[A-Za-z0-9_-]{1,120}$'
  );

create table private.payment_incidents (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references private.orders(id) on delete set null,
  payment_id uuid references private.payments(id) on delete set null,
  public_reference text not null check (public_reference ~ '^REVA-[A-F0-9]{12}$'),
  status text not null check (status in ('open','resolved')),
  resolution text check (resolution in ('confirmed_no_payment','fulfilled_after_rereservation','refund_coordinated','customer_accepted_alternative')),
  verification_source text check (verification_source is null or verification_source = 'recurrente_dashboard'),
  resolution_reference text check (resolution_reference is null or resolution_reference ~ '^[A-Za-z0-9_-]{1,120}$'),
  customer_approved boolean not null default false,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references public.profiles(id) on delete set null,
  constraint payment_incident_state_consistent check (
    (status = 'open' and resolution is null and verification_source is null and resolved_at is null and resolved_by is null)
    or (status = 'resolved' and resolution is not null and verification_source = 'recurrente_dashboard' and resolved_at is not null and resolved_by is not null)
  ),
  constraint payment_incident_customer_approval check (
    resolution not in ('refund_coordinated','customer_accepted_alternative') or customer_approved
  )
);

create unique index payment_incidents_one_open_per_order
  on private.payment_incidents (order_id) where status = 'open' and order_id is not null;
create index payment_incidents_order_created_idx
  on private.payment_incidents (order_id, created_at desc);

revoke all on table private.payment_incidents from public, anon, authenticated, service_role;
revoke all on all sequences in schema private from public, anon, authenticated, service_role;

alter table private.order_events drop constraint order_events_event_type_check;
alter table private.order_events add constraint order_events_event_type_check check (
  event_type in (
    'approved','shipping_confirmed','payment_link_sent','payment_verified','payment_incident_opened',
    'payment_incident_resolved','fulfillment_changed','reservation_expired','cancelled','order_data_deleted'
  )
);

create or replace function private.parse_hmac_candidates(p_candidates jsonb, p_active_version smallint)
returns bytea[] language plpgsql immutable set search_path = '' as $$
declare
  v_item jsonb;
  v_version integer;
  v_digest bytea;
  v_digests bytea[] := array[]::bytea[];
  v_versions integer[] := array[]::integer[];
begin
  if p_active_version is null or p_active_version < 1
     or p_candidates is null or jsonb_typeof(p_candidates) <> 'array'
     or jsonb_array_length(p_candidates) < 1 or jsonb_array_length(p_candidates) > 8 then
    raise exception using errcode='22023', message='INVALID_HMAC_CANDIDATES';
  end if;
  for v_item in select value from jsonb_array_elements(p_candidates) loop
    if jsonb_typeof(v_item) <> 'object'
       or coalesce(v_item->>'version','') !~ '^[1-9][0-9]{0,3}$'
       or coalesce(v_item->>'digest','') !~ '^[0-9a-f]{64}$' then
      raise exception using errcode='22023', message='INVALID_HMAC_CANDIDATES';
    end if;
    v_version := (v_item->>'version')::integer;
    v_digest := decode(v_item->>'digest','hex');
    if v_version = any(v_versions) or v_digest = any(v_digests) then
      raise exception using errcode='22023', message='INVALID_HMAC_CANDIDATES';
    end if;
    v_versions := array_append(v_versions,v_version);
    v_digests := array_append(v_digests,v_digest);
  end loop;
  if not (p_active_version = any(v_versions)) then
    raise exception using errcode='22023', message='INVALID_HMAC_CANDIDATES';
  end if;
  return v_digests;
end;
$$;
revoke all on function private.parse_hmac_candidates(jsonb,smallint) from public, anon, authenticated, service_role;

drop function public.create_purchase_request(uuid,text[],jsonb,jsonb,jsonb,text,text,jsonb,bytea,bytea,uuid,smallint);

create function public.create_purchase_request(
  p_request_id uuid,
  p_slugs text[],
  p_expected_items jsonb,
  p_contact_ciphertext jsonb,
  p_delivery_ciphertext jsonb,
  p_municipality_code text,
  p_billing_type text,
  p_billing_ciphertext jsonb,
  p_idempotency_digest bytea,
  p_idempotency_candidates jsonb,
  p_fingerprint_digest bytea,
  p_fingerprint_candidates jsonb,
  p_user_id uuid,
  p_key_version smallint,
  p_hmac_key_version smallint
)
returns table (status text, public_reference text, expires_at timestamptz, merchandise_subtotal numeric, items jsonb)
language plpgsql security definer set search_path = '' as $$
declare
  v_existing private.purchase_requests%rowtype;
  v_idempotency_digests bytea[];
  v_fingerprint_digests bytea[];
  v_digest bytea;
  v_count integer;
  v_started timestamptz;
  v_request_ref text;
begin
  v_idempotency_digests := private.parse_hmac_candidates(p_idempotency_candidates,p_hmac_key_version);
  v_fingerprint_digests := private.parse_hmac_candidates(p_fingerprint_candidates,p_hmac_key_version);
  if p_request_id is null or p_slugs is null or cardinality(p_slugs) < 1 or cardinality(p_slugs) > 20
     or p_expected_items is null or jsonb_typeof(p_expected_items) <> 'array' or jsonb_array_length(p_expected_items) <> cardinality(p_slugs)
     or p_idempotency_digest is null or octet_length(p_idempotency_digest) <> 32 or not (p_idempotency_digest = any(v_idempotency_digests))
     or p_fingerprint_digest is null or octet_length(p_fingerprint_digest) <> 32 or not (p_fingerprint_digest = any(v_fingerprint_digests))
     or p_contact_ciphertext is null or jsonb_typeof(p_contact_ciphertext) <> 'object' or octet_length(p_contact_ciphertext::text) > 16384
     or p_delivery_ciphertext is null or jsonb_typeof(p_delivery_ciphertext) <> 'object' or octet_length(p_delivery_ciphertext::text) > 16384
     or p_billing_ciphertext is null or jsonb_typeof(p_billing_ciphertext) <> 'object' or octet_length(p_billing_ciphertext::text) > 8192
     or p_key_version is null or p_key_version < 1
     or p_municipality_code !~ '^01(0[1-9]|1[0-7])$' or p_billing_type not in ('cf','nit')
     or exists (select 1 from unnest(p_slugs) as s where s !~ '^[a-z0-9]+(-[a-z0-9]+)*$')
     or cardinality(p_slugs) <> (select count(distinct s) from unnest(p_slugs) as s)
     or exists (select 1 from jsonb_array_elements(p_expected_items) e where e->>'slug' !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or e->>'price' !~ '^\d+\.\d{2}$')
     or cardinality(p_slugs) <> (select count(distinct e->>'slug') from jsonb_array_elements(p_expected_items) e)
     or exists (select 1 from jsonb_array_elements(p_expected_items) e where not ((e->>'slug') = any(p_slugs))) then
    raise exception using errcode='22023', message='INVALID_PURCHASE_REQUEST';
  end if;

  for v_digest in select d from unnest(v_idempotency_digests) d order by encode(d,'hex') loop
    perform pg_advisory_xact_lock(hashtextextended('reva-idempotency:' || encode(v_digest,'hex'),0));
  end loop;
  select * into v_existing from private.purchase_requests r where r.idempotency_digest = any(v_idempotency_digests) limit 1;
  if found then
    return query select 'existing', v_existing.public_reference, v_existing.expires_at,
      (select sum(i.unit_price) from private.purchase_request_items i where i.request_id=v_existing.id),
      (select jsonb_agg(jsonb_build_object('sku',i.sku_snapshot,'title',i.title_snapshot,'price',i.unit_price,'quantity',i.quantity) order by i.position) from private.purchase_request_items i where i.request_id=v_existing.id);
    return;
  end if;

  for v_digest in select d from unnest(v_fingerprint_digests) d order by encode(d,'hex') loop
    perform pg_advisory_xact_lock(hashtextextended('reva-rate-limit:' || encode(v_digest,'hex'),0));
  end loop;

  perform p.id from public.products p where p.slug=any(p_slugs) order by p.id for update;
  if p_user_id is not null and not exists(select 1 from public.profiles where id=p_user_id) then
    raise exception using errcode='22023', message='INVALID_PURCHASE_REQUEST';
  end if;
  if (select count(*) from public.products p where p.slug=any(p_slugs) and p.status='published' and p.public_media_ready_at is not null and p.price is not null) <> cardinality(p_slugs) then
    raise exception using errcode='P0001', message='PRODUCT_UNAVAILABLE';
  end if;
  if exists (
    select 1 from jsonb_array_elements(p_expected_items) e join public.products p on p.slug=e->>'slug'
    where p.price::text <> e->>'price'
  ) then
    return query select 'changed', null::text, null::timestamptz, null::numeric,
      (select jsonb_agg(jsonb_build_object('sku',p.sku,'title',p.title,'price',p.price,'quantity',1) order by array_position(p_slugs,p.slug)) from public.products p where p.slug=any(p_slugs));
    return;
  end if;

  select coalesce(sum(r.request_count),0)::integer, min(r.window_started_at)
    into v_count,v_started
    from private.purchase_request_rate_limits r
    where r.fingerprint_digest=any(v_fingerprint_digests)
      and r.window_started_at > now()-interval '1 hour'
      and r.expires_at > now();
  if v_count >= 5 then
    return query select 'rate_limited',null::text,null::timestamptz,null::numeric,null::jsonb;
    return;
  end if;
  v_count := v_count + 1;
  insert into private.purchase_request_rate_limits(fingerprint_digest,hmac_key_version,window_started_at,request_count,expires_at)
  values(p_fingerprint_digest,p_hmac_key_version,coalesce(v_started,now()),v_count,now()+interval '24 hours')
  on conflict(fingerprint_digest) do update set
    hmac_key_version=excluded.hmac_key_version,
    window_started_at=excluded.window_started_at,
    request_count=excluded.request_count,
    expires_at=excluded.expires_at;
  delete from private.purchase_request_rate_limits r where r.fingerprint_digest=any(v_fingerprint_digests) and r.fingerprint_digest<>p_fingerprint_digest;

  v_request_ref := 'REVA-' || upper(replace(substr(gen_random_uuid()::text,1,13),'-',''));
  insert into private.purchase_requests(
    id,public_reference,user_id,idempotency_digest,idempotency_key_version,contact_ciphertext,contact_key_version,
    delivery_ciphertext,delivery_key_version,municipality_code,billing_type,billing_ciphertext,billing_key_version
  ) values(
    p_request_id,v_request_ref,p_user_id,p_idempotency_digest,p_hmac_key_version,p_contact_ciphertext,p_key_version,
    p_delivery_ciphertext,p_key_version,p_municipality_code,p_billing_type,p_billing_ciphertext,p_key_version
  );
  insert into private.purchase_request_items(request_id,product_id,position,sku_snapshot,title_snapshot,unit_price,quantity)
  select p_request_id,p.id,array_position(p_slugs,p.slug)::smallint,p.sku,p.title,p.price,1
  from public.products p where p.slug=any(p_slugs) and p.status='published' and p.public_media_ready_at is not null
  order by array_position(p_slugs,p.slug);

  return query select 'created',v_request_ref,now()+interval '24 hours',
    (select sum(i.unit_price) from private.purchase_request_items i where i.request_id=p_request_id),
    (select jsonb_agg(jsonb_build_object('sku',i.sku_snapshot,'title',i.title_snapshot,'price',i.unit_price,'quantity',i.quantity) order by i.position) from private.purchase_request_items i where i.request_id=p_request_id);
end;
$$;

create function public.admin_confirm_order_shipping(p_order_id uuid,p_shipping_amount numeric,p_coverage_confirmed boolean)
returns numeric language plpgsql security definer set search_path = '' as $$
declare v_order private.orders%rowtype; v_total numeric(12,2); v_admin_id uuid:=auth.uid();
begin
  if v_admin_id is null or not (select private.is_admin()) then raise exception using errcode='42501',message='ADMIN_REQUIRED'; end if;
  if p_shipping_amount is null or p_shipping_amount<0 or p_shipping_amount>100000 or not coalesce(p_coverage_confirmed,false) then raise exception using errcode='22023',message='COVERAGE_AND_SHIPPING_REQUIRED'; end if;
  select * into v_order from private.orders where id=p_order_id for update;
  if not found or v_order.status<>'pending_payment' then raise exception using errcode='P0001',message='ORDER_NOT_PAYABLE'; end if;
  if not exists(select 1 from private.inventory_reservations r where r.order_id=p_order_id and r.status='active' and r.expires_at>now()) then raise exception using errcode='P0001',message='RESERVATION_EXPIRED'; end if;
  if exists(select 1 from private.payments p where p.order_id=p_order_id and p.status='pending_manual') then raise exception using errcode='P0001',message='PAYMENT_ALREADY_PENDING'; end if;
  v_total:=v_order.merchandise_subtotal+p_shipping_amount+v_order.processing_amount;
  update private.orders set shipping_amount=p_shipping_amount,final_total=v_total,payment_status='pending',shipping_coverage_confirmed=true,shipping_coverage_confirmed_at=now(),shipping_coverage_confirmed_by=v_admin_id,updated_at=now() where id=p_order_id;
  insert into private.payments(order_id,provider,status,amount) values(p_order_id,'recurrente','pending_manual',v_total);
  insert into private.order_events(order_id,public_reference,actor_profile_id,event_type,metadata)
  values(p_order_id,v_order.public_reference,v_admin_id,'shipping_confirmed',jsonb_build_object('shipping_amount',p_shipping_amount,'coverage_confirmed',true));
  return v_total;
end;
$$;

create function public.admin_record_payment_link_sent(p_order_id uuid,p_payment_link_reference text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_order private.orders%rowtype; v_payment private.payments%rowtype; v_admin_id uuid:=auth.uid();
begin
  if v_admin_id is null or not (select private.is_admin()) then raise exception using errcode='42501',message='ADMIN_REQUIRED'; end if;
  if p_payment_link_reference is not null and p_payment_link_reference !~ '^[A-Za-z0-9_-]{1,120}$' then raise exception using errcode='22023',message='INVALID_PAYMENT_LINK_REFERENCE'; end if;
  select * into v_order from private.orders where id=p_order_id for update;
  if not found or v_order.status<>'pending_payment' or v_order.final_total is null or not v_order.shipping_coverage_confirmed then raise exception using errcode='P0001',message='ORDER_NOT_PAYABLE'; end if;
  if not exists(select 1 from private.inventory_reservations r where r.order_id=p_order_id and r.status='active' and r.expires_at>now()) then raise exception using errcode='P0001',message='RESERVATION_EXPIRED'; end if;
  select * into v_payment from private.payments where order_id=p_order_id and status='pending_manual' for update;
  if not found then raise exception using errcode='P0001',message='PAYMENT_NOT_PREPARED'; end if;
  update private.payments set payment_link_sent_at=now(),payment_link_sent_by=v_admin_id,payment_link_reference=p_payment_link_reference where id=v_payment.id;
  insert into private.order_events(order_id,public_reference,actor_profile_id,event_type,metadata)
  values(p_order_id,v_order.public_reference,v_admin_id,'payment_link_sent',jsonb_build_object('reference_recorded',p_payment_link_reference is not null));
  return true;
end;
$$;

create or replace function public.admin_verify_order_payment(p_order_id uuid,p_provider_reference text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_order private.orders%rowtype; v_payment private.payments%rowtype; v_admin_id uuid:=auth.uid();
begin
  if v_admin_id is null or not (select private.is_admin()) then raise exception using errcode='42501',message='ADMIN_REQUIRED'; end if;
  if p_provider_reference is null or btrim(p_provider_reference)='' or length(p_provider_reference)>120 or p_provider_reference !~ '^[A-Za-z0-9_-]{1,120}$' then raise exception using errcode='22023',message='INVALID_PROVIDER_REFERENCE'; end if;
  select * into v_order from private.orders where id=p_order_id for update;
  if not found or v_order.status<>'pending_payment' or v_order.final_total is null or not v_order.shipping_coverage_confirmed then raise exception using errcode='P0001',message='ORDER_NOT_PAYABLE'; end if;
  select * into v_payment from private.payments where order_id=p_order_id and status='pending_manual' for update;
  if not found or v_payment.payment_link_sent_at is null or not exists(select 1 from private.inventory_reservations r where r.order_id=p_order_id and r.status='active' and r.expires_at>now()) then
    raise exception using errcode='P0001',message='PAYMENT_AFTER_RESERVATION_EXPIRY';
  end if;
  update private.payments set status='verified_manual',provider_reference=btrim(p_provider_reference),verified_by=v_admin_id,verified_at=now(),verification_source='recurrente_dashboard' where id=v_payment.id;
  update private.orders set status='paid',payment_status='verified',fulfillment_status='ready',updated_at=now() where id=p_order_id;
  update private.inventory_reservations set status='consumed',resolved_at=now() where order_id=p_order_id and status='active';
  update public.products set status='sold' where id in(select i.product_id from private.order_items i where i.order_id=p_order_id);
  insert into private.order_events(order_id,public_reference,actor_profile_id,event_type,metadata)
  values(p_order_id,v_order.public_reference,v_admin_id,'payment_verified',jsonb_build_object('verification_source','recurrente_dashboard'));
  return true;
end;
$$;

create or replace function public.admin_cancel_unpaid_order(p_order_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_order private.orders%rowtype; v_admin_id uuid:=auth.uid();
begin
  if v_admin_id is null or not (select private.is_admin()) then raise exception using errcode='42501',message='ADMIN_REQUIRED'; end if;
  select * into v_order from private.orders where id=p_order_id for update;
  if not found or v_order.status<>'pending_payment' or v_order.payment_status='verified'
     or exists(select 1 from private.payment_incidents i where i.order_id=p_order_id and i.status='open') then raise exception using errcode='P0001',message='ORDER_NOT_CANCELLABLE'; end if;
  update public.products p set status='published',public_media_ready_at=now() from private.inventory_reservations r where r.order_id=p_order_id and r.product_id=p.id and r.status='active' and p.status='reserved';
  update private.inventory_reservations set status='released',resolved_at=now() where order_id=p_order_id and status='active';
  update private.payments set status='cancelled' where order_id=p_order_id and status='pending_manual';
  update private.orders set status='cancelled',payment_status='cancelled',fulfillment_status='cancelled',updated_at=now() where id=p_order_id;
  delete from private.order_contacts where order_id=p_order_id;
  delete from private.order_delivery_snapshots where order_id=p_order_id;
  delete from private.order_billing_snapshots where order_id=p_order_id;
  insert into private.order_events(order_id,public_reference,actor_profile_id,event_type) values(p_order_id,v_order.public_reference,v_admin_id,'cancelled');
  return true;
end;
$$;

create function public.admin_resolve_late_payment(p_order_id uuid,p_resolution text,p_provider_reference text,p_customer_approved boolean)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  v_order private.orders%rowtype;
  v_payment private.payments%rowtype;
  v_incident private.payment_incidents%rowtype;
  v_admin_id uuid:=auth.uid();
  v_products uuid[];
  v_item_count integer;
begin
  if v_admin_id is null or not (select private.is_admin()) then raise exception using errcode='42501',message='ADMIN_REQUIRED'; end if;
  if p_resolution not in ('confirmed_no_payment','fulfilled_after_rereservation','refund_coordinated','customer_accepted_alternative') then raise exception using errcode='22023',message='INVALID_INCIDENT_RESOLUTION'; end if;
  if p_resolution<>'confirmed_no_payment' and (p_provider_reference is null or btrim(p_provider_reference)='' or length(p_provider_reference)>120 or p_provider_reference !~ '^[A-Za-z0-9_-]{1,120}$') then raise exception using errcode='22023',message='VERIFIED_PROVIDER_REFERENCE_REQUIRED'; end if;
  if p_resolution in ('refund_coordinated','customer_accepted_alternative') and not coalesce(p_customer_approved,false) then raise exception using errcode='22023',message='CUSTOMER_APPROVAL_REQUIRED'; end if;
  select * into v_order from private.orders where id=p_order_id for update;
  if not found then raise exception using errcode='P0002',message='ORDER_NOT_FOUND'; end if;
  select * into v_incident from private.payment_incidents where order_id=p_order_id and status='open' for update;
  if not found then raise exception using errcode='P0001',message='OPEN_PAYMENT_INCIDENT_REQUIRED'; end if;
  select * into v_payment from private.payments where id=v_incident.payment_id for update;
  if not found or v_payment.status<>'late_unverified' then raise exception using errcode='P0001',message='LATE_PAYMENT_REVIEW_REQUIRED'; end if;

  if p_resolution='confirmed_no_payment' then
    update private.payments set status='cancelled' where id=v_payment.id;
    update private.payment_incidents set status='resolved',resolution=p_resolution,verification_source='recurrente_dashboard',resolved_at=now(),resolved_by=v_admin_id where id=v_incident.id;
  else
    if p_resolution='fulfilled_after_rereservation' then
      select array_agg(i.product_id order by i.product_id),count(*) into v_products,v_item_count from private.order_items i where i.order_id=p_order_id;
      perform p.id from public.products p where p.id=any(v_products) order by p.id for update;
      if coalesce(cardinality(v_products),0)=0 or (select count(*) from public.products p where p.id=any(v_products) and p.status='published' and p.public_media_ready_at is not null)<>v_item_count then
        raise exception using errcode='P0001',message='PRODUCT_UNAVAILABLE';
      end if;
      insert into private.inventory_reservations(order_id,product_id,status,expires_at)
      select p_order_id,product_id,'active',now()+interval '3 hours' from unnest(v_products) product_id;
      update private.payments set status='verified_manual',provider_reference=btrim(p_provider_reference),verified_by=v_admin_id,verified_at=now(),verification_source='recurrente_dashboard' where id=v_payment.id;
      update private.orders set status='paid',payment_status='verified',fulfillment_status='ready',updated_at=now() where id=p_order_id;
      update private.inventory_reservations set status='consumed',resolved_at=now() where order_id=p_order_id and status='active';
      update public.products set status='sold' where id=any(v_products);
    else
      update private.payments set status='verified_manual',provider_reference=btrim(p_provider_reference),verified_by=v_admin_id,verified_at=now(),verification_source='recurrente_dashboard' where id=v_payment.id;
      update private.orders set status='cancelled',payment_status='verified',fulfillment_status='cancelled',updated_at=now() where id=p_order_id;
    end if;
    update private.payment_incidents set status='resolved',resolution=p_resolution,verification_source='recurrente_dashboard',resolution_reference=nullif(btrim(p_provider_reference),''),customer_approved=coalesce(p_customer_approved,false),resolved_at=now(),resolved_by=v_admin_id where id=v_incident.id;
  end if;
  insert into private.order_events(order_id,public_reference,actor_profile_id,event_type,metadata)
  values(p_order_id,v_order.public_reference,v_admin_id,'payment_incident_resolved',jsonb_build_object('resolution',p_resolution,'verification_source','recurrente_dashboard','customer_approved',coalesce(p_customer_approved,false)));
  return true;
end;
$$;

create function public.admin_delete_abandoned_order(p_order_id uuid,p_destructive_confirmed boolean)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_order private.orders%rowtype; v_admin_id uuid:=auth.uid();
begin
  if v_admin_id is null or not (select private.is_admin()) then raise exception using errcode='42501',message='ADMIN_REQUIRED'; end if;
  if not coalesce(p_destructive_confirmed,false) then raise exception using errcode='22023',message='DESTRUCTIVE_CONFIRMATION_REQUIRED'; end if;
  select * into v_order from private.orders where id=p_order_id for update;
  if not found or v_order.status not in ('expired','cancelled') or v_order.source_request_expires_at is null or v_order.source_request_expires_at>now()
     or v_order.payment_status='verified'
     or exists(select 1 from private.payments p where p.order_id=p_order_id and p.status='verified_manual')
     or exists(select 1 from private.payment_incidents i where i.order_id=p_order_id and i.status='open')
     or exists(select 1 from private.inventory_reservations r where r.order_id=p_order_id and r.status='active') then
    raise exception using errcode='P0001',message='ORDER_NOT_ELIGIBLE_FOR_DELETION';
  end if;
  delete from private.personal_data_access_events where resource_type='order' and resource_id=p_order_id;
  delete from private.order_events where order_id=p_order_id;
  delete from private.orders where id=p_order_id;
  insert into private.order_events(order_id,public_reference,actor_profile_id,event_type,metadata)
  values(null,v_order.public_reference,v_admin_id,'order_data_deleted',jsonb_build_object('source','admin_confirmed','personal_data_removed',true));
  return true;
end;
$$;

create or replace function public.admin_get_order(p_order_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_order private.orders%rowtype;
begin
  if not (select private.is_admin()) then raise exception using errcode='42501',message='ADMIN_REQUIRED'; end if;
  select * into v_order from private.orders where id=p_order_id;
  if not found then raise exception using errcode='P0002',message='ORDER_NOT_FOUND'; end if;
  insert into private.personal_data_access_events(actor_profile_id,resource_type,resource_id,public_reference,purpose)
  values(auth.uid(),'order',v_order.id,v_order.public_reference,'order_fulfillment');
  return jsonb_build_object(
    'id',v_order.id,'public_reference',v_order.public_reference,'status',v_order.status,'payment_status',v_order.payment_status,
    'fulfillment_status',v_order.fulfillment_status,'merchandise_subtotal',v_order.merchandise_subtotal,'shipping_amount',v_order.shipping_amount,'final_total',v_order.final_total,
    'shipping_coverage_confirmed',v_order.shipping_coverage_confirmed,
    'contact',(select jsonb_build_object('encryption_context_id',c.encryption_context_id,'encrypted_fields',c.encrypted_fields,'key_version',c.key_version) from private.order_contacts c where c.order_id=v_order.id),
    'delivery',(select jsonb_build_object('encryption_context_id',d.encryption_context_id,'municipality_code',d.municipality_code,'encrypted_fields',d.encrypted_fields,'key_version',d.key_version) from private.order_delivery_snapshots d where d.order_id=v_order.id),
    'billing',(select jsonb_build_object('encryption_context_id',b.encryption_context_id,'billing_type',b.billing_type,'encrypted_fields',b.encrypted_fields,'key_version',b.key_version) from private.order_billing_snapshots b where b.order_id=v_order.id),
    'items',(select jsonb_agg(jsonb_build_object('sku',i.sku_snapshot,'title',i.title_snapshot,'price',i.unit_price,'quantity',i.quantity) order by i.position) from private.order_items i where i.order_id=v_order.id),
    'reservations',(select jsonb_agg(jsonb_build_object('status',r.status,'expires_at',r.expires_at,'resolved_at',r.resolved_at) order by r.created_at) from private.inventory_reservations r where r.order_id=v_order.id),
    'payments',(select jsonb_agg(jsonb_build_object('status',p.status,'provider',p.provider,'amount',p.amount,'provider_reference',p.provider_reference,'verified_at',p.verified_at,'verification_source',p.verification_source,'payment_link_sent_at',p.payment_link_sent_at,'payment_link_reference',p.payment_link_reference) order by p.created_at) from private.payments p where p.order_id=v_order.id),
    'incidents',(select jsonb_agg(jsonb_build_object('status',i.status,'resolution',i.resolution,'verification_source',i.verification_source,'resolution_reference',i.resolution_reference,'customer_approved',i.customer_approved,'created_at',i.created_at,'resolved_at',i.resolved_at) order by i.created_at) from private.payment_incidents i where i.order_id=v_order.id or i.public_reference=v_order.public_reference),
    'events',(select jsonb_agg(jsonb_build_object('event_type',e.event_type,'created_at',e.created_at,'metadata',e.metadata) order by e.created_at) from private.order_events e where e.order_id=v_order.id or (e.order_id is null and e.public_reference=v_order.public_reference)),
    'data_access_events',(select jsonb_agg(jsonb_build_object('actor_profile_id',a.actor_profile_id,'created_at',a.created_at,'purpose',a.purpose) order by a.created_at desc) from private.personal_data_access_events a where a.resource_type='order' and a.resource_id=v_order.id)
  );
end;
$$;

create or replace function public.cleanup_transactional_records()
returns integer language plpgsql security definer set search_path = '' as $$
declare v_deleted integer:=0; v_expired record; v_order_to_delete record; v_orders_deleted integer:=0;
begin
  delete from private.personal_data_access_events where resource_type='purchase_request' and resource_id in(select id from private.purchase_requests where expires_at<=now());
  delete from private.purchase_requests where expires_at<=now();
  get diagnostics v_deleted=row_count;

  for v_expired in
    select o.id,o.public_reference from private.orders o
    where o.status='pending_payment' and exists(select 1 from private.inventory_reservations r where r.order_id=o.id and r.status='active' and r.expires_at<=now())
    for update skip locked
  loop
    update public.products p set status='published',public_media_ready_at=now() from private.inventory_reservations r where r.order_id=v_expired.id and r.product_id=p.id and r.status='active' and p.status='reserved';
    update private.inventory_reservations set status='expired',resolved_at=now() where order_id=v_expired.id and status='active';
    update private.payments set status='cancelled' where order_id=v_expired.id and status='pending_manual';
    update private.orders set status='expired',payment_status='expired',fulfillment_status='cancelled',updated_at=now() where id=v_expired.id;
    insert into private.order_events(order_id,public_reference,event_type) values(v_expired.id,v_expired.public_reference,'reservation_expired');
  end loop;

  for v_order_to_delete in
    select o.id,o.public_reference from private.orders o
    where o.source_request_expires_at<=now() and o.status in('expired','cancelled')
      and not exists(select 1 from private.payments p where p.order_id=o.id and p.status in('verified_manual','late_unverified'))
      and not exists(select 1 from private.payment_incidents i where i.order_id=o.id and i.status='open')
      and not exists(select 1 from private.inventory_reservations r where r.order_id=o.id and r.status='active')
    for update skip locked
  loop
    delete from private.personal_data_access_events where resource_type='order' and resource_id=v_order_to_delete.id;
    delete from private.order_events where order_id=v_order_to_delete.id;
    delete from private.orders where id=v_order_to_delete.id;
    insert into private.order_events(order_id,public_reference,event_type,metadata)
      values(null,v_order_to_delete.public_reference,'order_data_deleted',jsonb_build_object('source','retention_cleanup','personal_data_removed',true));
    v_orders_deleted:=v_orders_deleted+1;
  end loop;
  delete from private.purchase_request_rate_limits where expires_at<=now();
  return v_deleted+v_orders_deleted;
end;
$$;

revoke all on function public.create_purchase_request(uuid,text[],jsonb,jsonb,jsonb,text,text,jsonb,bytea,jsonb,bytea,jsonb,uuid,smallint,smallint) from public,anon,authenticated;
grant execute on function public.create_purchase_request(uuid,text[],jsonb,jsonb,jsonb,text,text,jsonb,bytea,jsonb,bytea,jsonb,uuid,smallint,smallint) to service_role;
revoke all on function public.admin_confirm_order_shipping(uuid,numeric,boolean) from public,anon;
revoke all on function public.admin_record_payment_link_sent(uuid,text) from public,anon;
revoke all on function public.admin_resolve_late_payment(uuid,text,text,boolean) from public,anon;
revoke all on function public.admin_delete_abandoned_order(uuid,boolean) from public,anon;
revoke all on function public.admin_verify_order_payment(uuid,text) from public,anon;
revoke all on function public.admin_cancel_unpaid_order(uuid) from public,anon;
revoke all on function public.admin_get_order(uuid) from public,anon;
revoke all on function public.cleanup_transactional_records() from public,anon,authenticated;
grant execute on function public.admin_confirm_order_shipping(uuid,numeric,boolean),public.admin_record_payment_link_sent(uuid,text),
  public.admin_resolve_late_payment(uuid,text,text,boolean),public.admin_delete_abandoned_order(uuid,boolean),
  public.admin_verify_order_payment(uuid,text),public.admin_cancel_unpaid_order(uuid),public.admin_get_order(uuid) to authenticated;
grant execute on function public.cleanup_transactional_records() to service_role;

commit;
