begin;

create extension if not exists pg_cron with schema extensions;

create table private.purchase_requests (
  id uuid primary key,
  public_reference text not null unique check (public_reference ~ '^REVA-[A-F0-9]{12}$'),
  user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours'),
  idempotency_digest bytea not null unique check (octet_length(idempotency_digest) = 32),
  contact_ciphertext jsonb not null check (jsonb_typeof(contact_ciphertext) = 'object' and octet_length(contact_ciphertext::text) <= 16384),
  contact_key_version smallint not null check (contact_key_version > 0),
  delivery_ciphertext jsonb not null check (jsonb_typeof(delivery_ciphertext) = 'object' and octet_length(delivery_ciphertext::text) <= 16384),
  delivery_key_version smallint not null check (delivery_key_version > 0),
  municipality_code text not null check (municipality_code ~ '^01(0[1-9]|1[0-7])$'),
  billing_type text not null check (billing_type in ('cf', 'nit')),
  billing_ciphertext jsonb not null check (jsonb_typeof(billing_ciphertext) = 'object' and octet_length(billing_ciphertext::text) <= 8192),
  billing_key_version smallint not null check (billing_key_version > 0),
  constraint purchase_requests_exact_expiry check (expires_at = created_at + interval '24 hours')
);

create index purchase_requests_expiry_idx on private.purchase_requests (expires_at);
create index purchase_requests_user_idx on private.purchase_requests (user_id) where user_id is not null;

create table private.purchase_request_items (
  request_id uuid not null references private.purchase_requests(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  position smallint not null check (position between 1 and 20),
  sku_snapshot text not null check (sku_snapshot ~ '^RV-[0-9]{6,}$'),
  title_snapshot text not null check (btrim(title_snapshot) <> ''),
  unit_price numeric(12,2) not null check (unit_price > 0),
  quantity smallint not null default 1 check (quantity = 1),
  primary key (request_id, product_id),
  unique (request_id, position)
);

create table private.orders (
  id uuid primary key default gen_random_uuid(),
  public_reference text not null unique check (public_reference ~ '^REVA-[A-F0-9]{12}$'),
  user_id uuid references public.profiles(id) on delete set null,
  status text not null check (status in ('pending_payment','paid','fulfilling','completed','cancelled','expired')),
  payment_status text not null check (payment_status in ('not_started','pending','verified','expired','cancelled')),
  fulfillment_status text not null check (fulfillment_status in ('not_ready','ready','preparing','dispatched','completed','cancelled')),
  merchandise_subtotal numeric(12,2) not null check (merchandise_subtotal > 0),
  shipping_amount numeric(12,2) check (shipping_amount is null or shipping_amount >= 0),
  processing_amount numeric(12,2) not null default 0 check (processing_amount >= 0),
  final_total numeric(12,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_final_total_consistent check (
    (final_total is null and shipping_amount is null)
    or (final_total is not null and shipping_amount is not null and final_total = merchandise_subtotal + shipping_amount + processing_amount)
  )
);

create index orders_status_created_idx on private.orders (status, created_at desc);

create table private.order_items (
  order_id uuid not null references private.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  position smallint not null check (position between 1 and 20),
  sku_snapshot text not null check (sku_snapshot ~ '^RV-[0-9]{6,}$'),
  title_snapshot text not null check (btrim(title_snapshot) <> ''),
  unit_price numeric(12,2) not null check (unit_price > 0),
  quantity smallint not null default 1 check (quantity = 1),
  primary key (order_id, product_id),
  unique (order_id, position)
);

create table private.order_contacts (
  order_id uuid primary key references private.orders(id) on delete cascade,
  encryption_context_id uuid not null,
  encrypted_fields jsonb not null check (jsonb_typeof(encrypted_fields) = 'object' and octet_length(encrypted_fields::text) <= 16384),
  key_version smallint not null check (key_version > 0)
);

create table private.order_delivery_snapshots (
  order_id uuid primary key references private.orders(id) on delete cascade,
  encryption_context_id uuid not null,
  municipality_code text not null check (municipality_code ~ '^01(0[1-9]|1[0-7])$'),
  encrypted_fields jsonb not null check (jsonb_typeof(encrypted_fields) = 'object' and octet_length(encrypted_fields::text) <= 16384),
  key_version smallint not null check (key_version > 0)
);

create table private.order_billing_snapshots (
  order_id uuid primary key references private.orders(id) on delete cascade,
  encryption_context_id uuid not null,
  billing_type text not null check (billing_type in ('cf', 'nit')),
  encrypted_fields jsonb not null check (jsonb_typeof(encrypted_fields) = 'object' and octet_length(encrypted_fields::text) <= 8192),
  key_version smallint not null check (key_version > 0)
);

create table private.inventory_reservations (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references private.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  status text not null check (status in ('active','consumed','released','expired')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  resolved_at timestamptz,
  check ((status = 'active' and resolved_at is null) or (status <> 'active' and resolved_at is not null))
);

create unique index inventory_reservations_one_active_product
  on private.inventory_reservations (product_id) where status = 'active';
create unique index inventory_reservations_one_active_order_product
  on private.inventory_reservations (order_id, product_id) where status = 'active';
create index inventory_reservations_expiry_idx on private.inventory_reservations (expires_at) where status = 'active';

create table private.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references private.orders(id) on delete cascade,
  provider text not null check (provider = 'recurrente'),
  status text not null check (status in ('pending_manual','verified_manual','late_unverified','cancelled')),
  amount numeric(12,2) not null check (amount > 0),
  provider_reference text,
  verified_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  verified_at timestamptz,
  check ((status = 'verified_manual' and verified_by is not null and verified_at is not null and provider_reference is not null)
    or status <> 'verified_manual')
);
create unique index payments_one_pending_per_order on private.payments(order_id) where status = 'pending_manual';

create table private.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references private.orders(id) on delete set null,
  public_reference text not null,
  actor_profile_id uuid references public.profiles(id) on delete set null,
  event_type text not null check (event_type in ('approved','shipping_confirmed','payment_verified','fulfillment_changed','reservation_expired','cancelled')),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object' and octet_length(metadata::text) <= 2048),
  created_at timestamptz not null default now()
);
create index order_events_order_time_idx on private.order_events (order_id, created_at);

create table private.personal_data_access_events (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid not null references public.profiles(id) on delete restrict,
  resource_type text not null check (resource_type in ('purchase_request','order')),
  resource_id uuid not null,
  public_reference text not null check (public_reference ~ '^REVA-[A-F0-9]{12}$'),
  purpose text not null check (purpose in ('request_review','order_fulfillment')),
  created_at timestamptz not null default now()
);
create index personal_data_access_resource_time_idx on private.personal_data_access_events (resource_type, resource_id, created_at desc);

create table private.purchase_request_rate_limits (
  fingerprint_digest bytea primary key check (octet_length(fingerprint_digest) = 32),
  window_started_at timestamptz not null,
  request_count smallint not null check (request_count between 1 and 6),
  expires_at timestamptz not null
);

revoke all on all tables in schema private from public, anon, authenticated, service_role;
revoke all on all sequences in schema private from public, anon, authenticated, service_role;

create or replace function public.create_purchase_request(
  p_request_id uuid,
  p_slugs text[],
  p_expected_items jsonb,
  p_contact_ciphertext jsonb,
  p_delivery_ciphertext jsonb,
  p_municipality_code text,
  p_billing_type text,
  p_billing_ciphertext jsonb,
  p_idempotency_digest bytea,
  p_fingerprint_digest bytea,
  p_user_id uuid,
  p_key_version smallint
)
returns table (status text, public_reference text, expires_at timestamptz, merchandise_subtotal numeric, items jsonb)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existing private.purchase_requests%rowtype;
  v_count smallint;
  v_started timestamptz;
  v_request_ref text;
begin
  if p_request_id is null or p_slugs is null or cardinality(p_slugs) < 1 or cardinality(p_slugs) > 20
     or p_expected_items is null or jsonb_typeof(p_expected_items) <> 'array' or jsonb_array_length(p_expected_items) <> cardinality(p_slugs)
     or p_idempotency_digest is null or octet_length(p_idempotency_digest) <> 32
     or p_fingerprint_digest is null or octet_length(p_fingerprint_digest) <> 32
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
    raise exception using errcode = '22023', message = 'INVALID_PURCHASE_REQUEST';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(encode(p_idempotency_digest, 'hex'), 0));
  select * into v_existing from private.purchase_requests r where r.idempotency_digest = p_idempotency_digest;
  if found then
    return query select 'existing', v_existing.public_reference, v_existing.expires_at,
      (select sum(i.unit_price) from private.purchase_request_items i where i.request_id = v_existing.id),
      (select jsonb_agg(jsonb_build_object('sku',i.sku_snapshot,'title',i.title_snapshot,'price',i.unit_price,'quantity',i.quantity) order by i.position) from private.purchase_request_items i where i.request_id = v_existing.id);
    return;
  end if;

  perform p.id from public.products p where p.slug = any(p_slugs) order by p.id for update;

  insert into private.purchase_request_rate_limits (fingerprint_digest, window_started_at, request_count, expires_at)
  values (p_fingerprint_digest, now(), 1, now() + interval '24 hours')
  on conflict (fingerprint_digest) do update
    set request_count = case when private.purchase_request_rate_limits.window_started_at <= now() - interval '1 hour' then 1 else least(private.purchase_request_rate_limits.request_count + 1, 6) end,
        window_started_at = case when private.purchase_request_rate_limits.window_started_at <= now() - interval '1 hour' then now() else private.purchase_request_rate_limits.window_started_at end,
        expires_at = case when private.purchase_request_rate_limits.window_started_at <= now() - interval '1 hour'
          then now() + interval '24 hours' else private.purchase_request_rate_limits.expires_at end
  returning request_count, window_started_at into v_count, v_started;
  if v_count > 5 then
    return query select 'rate_limited', null::text, null::timestamptz, null::numeric, null::jsonb;
    return;
  end if;

  if p_user_id is not null and not exists (select 1 from public.profiles where id = p_user_id) then
    raise exception using errcode = '22023', message = 'INVALID_PURCHASE_REQUEST';
  end if;

  if (select count(*) from public.products p
      where p.slug = any(p_slugs) and p.status = 'published' and p.public_media_ready_at is not null and p.price is not null) <> cardinality(p_slugs) then
    raise exception using errcode = 'P0001', message = 'PRODUCT_UNAVAILABLE';
  end if;

  if exists (
    select 1 from jsonb_array_elements(p_expected_items) e
    join public.products p on p.slug = e->>'slug'
    where p.price::text <> e->>'price'
  ) then
    return query select 'changed', null::text, null::timestamptz, null::numeric,
      (select jsonb_agg(jsonb_build_object('sku',p.sku,'title',p.title,'price',p.price,'quantity',1) order by array_position(p_slugs,p.slug))
       from public.products p where p.slug = any(p_slugs));
    return;
  end if;

  v_request_ref := 'REVA-' || upper(replace(substr(gen_random_uuid()::text, 1, 13), '-', ''));
  insert into private.purchase_requests (
    id, public_reference, user_id, idempotency_digest, contact_ciphertext, contact_key_version, delivery_ciphertext,
    delivery_key_version, municipality_code, billing_type, billing_ciphertext, billing_key_version
  ) values (
    p_request_id, v_request_ref, p_user_id, p_idempotency_digest, p_contact_ciphertext, p_key_version, p_delivery_ciphertext,
    p_key_version, p_municipality_code, p_billing_type, p_billing_ciphertext, p_key_version
  );

  insert into private.purchase_request_items (request_id, product_id, position, sku_snapshot, title_snapshot, unit_price, quantity)
  select p_request_id, p.id, array_position(p_slugs, p.slug)::smallint, p.sku, p.title, p.price, 1
  from public.products p
  where p.slug = any(p_slugs) and p.status = 'published' and p.public_media_ready_at is not null
  order by array_position(p_slugs, p.slug);

  return query select 'created', v_request_ref, now() + interval '24 hours',
    (select sum(i.unit_price) from private.purchase_request_items i where i.request_id = p_request_id),
    (select jsonb_agg(jsonb_build_object('sku',i.sku_snapshot,'title',i.title_snapshot,'price',i.unit_price,'quantity',i.quantity) order by i.position) from private.purchase_request_items i where i.request_id = p_request_id);
end;
$$;

create or replace function public.admin_list_purchase_requests()
returns table (id uuid, public_reference text, created_at timestamptz, expires_at timestamptz, merchandise_subtotal numeric, items jsonb)
language plpgsql security definer set search_path = '' as $$
begin
  if not (select private.is_admin()) then raise exception using errcode = '42501', message = 'ADMIN_REQUIRED'; end if;
  return query select r.id, r.public_reference, r.created_at, r.expires_at,
    (select sum(i.unit_price) from private.purchase_request_items i where i.request_id = r.id),
    (select jsonb_agg(jsonb_build_object('sku',i.sku_snapshot,'title',i.title_snapshot,'price',i.unit_price,'quantity',i.quantity) order by i.position) from private.purchase_request_items i where i.request_id = r.id)
  from private.purchase_requests r where r.expires_at > now() order by r.created_at;
end;
$$;

create or replace function public.admin_get_purchase_request(p_request_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_request private.purchase_requests%rowtype;
begin
  if not (select private.is_admin()) then raise exception using errcode = '42501', message = 'ADMIN_REQUIRED'; end if;
  select * into v_request from private.purchase_requests r where r.id = p_request_id and r.expires_at > now();
  if not found then raise exception using errcode = 'P0002', message = 'REQUEST_NOT_FOUND'; end if;
  insert into private.personal_data_access_events (actor_profile_id, resource_type, resource_id, public_reference, purpose)
  values (auth.uid(), 'purchase_request', v_request.id, v_request.public_reference, 'request_review');
  return jsonb_build_object(
    'id',v_request.id,'public_reference',v_request.public_reference,'created_at',v_request.created_at,'expires_at',v_request.expires_at,
    'merchandise_subtotal',(select sum(i.unit_price) from private.purchase_request_items i where i.request_id=v_request.id),
    'user_id',v_request.user_id,'contact_ciphertext',v_request.contact_ciphertext,'contact_key_version',v_request.contact_key_version,
    'delivery_ciphertext',v_request.delivery_ciphertext,'delivery_key_version',v_request.delivery_key_version,
    'municipality_code',v_request.municipality_code,'billing_type',v_request.billing_type,'billing_ciphertext',v_request.billing_ciphertext,
    'billing_key_version',v_request.billing_key_version,
    'items',(select jsonb_agg(jsonb_build_object('product_id',i.product_id,'sku',i.sku_snapshot,'title',i.title_snapshot,'price',i.unit_price,'current_price',p.price,'current_status',p.status,'quantity',i.quantity) order by i.position) from private.purchase_request_items i join public.products p on p.id=i.product_id where i.request_id = v_request.id),
    'access_events',(select jsonb_agg(jsonb_build_object('actor_profile_id',a.actor_profile_id,'created_at',a.created_at,'purpose',a.purpose) order by a.created_at desc) from private.personal_data_access_events a where a.resource_type='purchase_request' and a.resource_id=v_request.id)
  );
end;
$$;

create or replace function public.admin_discard_purchase_request(p_request_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  if not (select private.is_admin()) then raise exception using errcode = '42501', message = 'ADMIN_REQUIRED'; end if;
  if exists (select 1 from private.purchase_requests where id=p_request_id and expires_at > now()) then
    delete from private.personal_data_access_events where resource_type='purchase_request' and resource_id=p_request_id;
  end if;
  delete from private.purchase_requests where id = p_request_id and expires_at > now();
  return found;
end;
$$;

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

  insert into private.orders (id, public_reference, user_id, status, payment_status, fulfillment_status, merchandise_subtotal)
  values (v_order_id, v_request.public_reference, v_request.user_id, 'pending_payment', 'not_started', 'not_ready', v_subtotal);
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

create or replace function public.admin_set_order_shipping(p_order_id uuid, p_shipping_amount numeric)
returns numeric language plpgsql security definer set search_path = '' as $$
declare v_order private.orders%rowtype; v_total numeric(12,2); v_admin_id uuid := auth.uid();
begin
  if v_admin_id is null or not (select private.is_admin()) then raise exception using errcode = '42501', message = 'ADMIN_REQUIRED'; end if;
  if p_shipping_amount is null or p_shipping_amount < 0 or p_shipping_amount > 100000 then raise exception using errcode = '22023', message = 'INVALID_SHIPPING_AMOUNT'; end if;
  select * into v_order from private.orders where id = p_order_id for update;
  if not found or v_order.status <> 'pending_payment' then raise exception using errcode = 'P0001', message = 'ORDER_NOT_PAYABLE'; end if;
  if not exists(select 1 from private.inventory_reservations r where r.order_id = p_order_id and r.status = 'active' and r.expires_at > now()) then raise exception using errcode = 'P0001', message = 'RESERVATION_EXPIRED'; end if;
  if exists(select 1 from private.payments p where p.order_id = p_order_id and p.status = 'pending_manual') then raise exception using errcode = 'P0001', message = 'PAYMENT_ALREADY_PENDING'; end if;
  v_total := v_order.merchandise_subtotal + p_shipping_amount + v_order.processing_amount;
  update private.orders set shipping_amount = p_shipping_amount, final_total = v_total, payment_status = 'pending', updated_at = now() where id = p_order_id;
  insert into private.payments (order_id, provider, status, amount) values (p_order_id, 'recurrente', 'pending_manual', v_total);
  insert into private.order_events (order_id, public_reference, actor_profile_id, event_type, metadata)
  values (p_order_id, v_order.public_reference, v_admin_id, 'shipping_confirmed', jsonb_build_object('shipping_amount',p_shipping_amount));
  return v_total;
end;
$$;

create or replace function public.admin_verify_order_payment(p_order_id uuid, p_provider_reference text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_order private.orders%rowtype; v_payment private.payments%rowtype; v_admin_id uuid := auth.uid();
begin
  if v_admin_id is null or not (select private.is_admin()) then raise exception using errcode = '42501', message = 'ADMIN_REQUIRED'; end if;
  if p_provider_reference is null or btrim(p_provider_reference) = '' or length(p_provider_reference) > 120 then raise exception using errcode = '22023', message = 'INVALID_PROVIDER_REFERENCE'; end if;
  select * into v_order from private.orders where id = p_order_id for update;
  if not found or v_order.status <> 'pending_payment' or v_order.final_total is null then raise exception using errcode = 'P0001', message = 'ORDER_NOT_PAYABLE'; end if;
  select * into v_payment from private.payments where order_id = p_order_id and status = 'pending_manual' for update;
  if not found or not exists(select 1 from private.inventory_reservations r where r.order_id = p_order_id and r.status = 'active' and r.expires_at > now()) then
    raise exception using errcode = 'P0001', message = 'PAYMENT_AFTER_RESERVATION_EXPIRY';
  end if;
  update private.payments set status = 'verified_manual', provider_reference = btrim(p_provider_reference), verified_by = v_admin_id, verified_at = now() where id = v_payment.id;
  update private.orders set status = 'paid', payment_status = 'verified', fulfillment_status = 'ready', updated_at = now() where id = p_order_id;
  update private.inventory_reservations set status = 'consumed', resolved_at = now() where order_id = p_order_id and status = 'active';
  update public.products set status = 'sold' where id in (select i.product_id from private.order_items i where i.order_id = p_order_id);
  insert into private.order_events (order_id, public_reference, actor_profile_id, event_type)
  values (p_order_id, v_order.public_reference, v_admin_id, 'payment_verified');
  return true;
end;
$$;

create or replace function public.admin_update_order_fulfillment(p_order_id uuid, p_next_status text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_order private.orders%rowtype; v_admin_id uuid := auth.uid();
begin
  if v_admin_id is null or not (select private.is_admin()) then raise exception using errcode = '42501', message = 'ADMIN_REQUIRED'; end if;
  if p_next_status not in ('preparing','dispatched','completed') then raise exception using errcode = '22023', message = 'INVALID_FULFILLMENT_STATE'; end if;
  select * into v_order from private.orders where id = p_order_id for update;
  if not found or v_order.status not in ('paid','fulfilling') or v_order.payment_status <> 'verified' then raise exception using errcode = 'P0001', message = 'PAYMENT_NOT_VERIFIED'; end if;
  if (v_order.fulfillment_status, p_next_status) not in (('ready','preparing'),('preparing','dispatched'),('dispatched','completed')) then
    raise exception using errcode = 'P0001', message = 'INVALID_FULFILLMENT_TRANSITION';
  end if;
  update private.orders set status = case when p_next_status = 'completed' then 'completed' else 'fulfilling' end, fulfillment_status = p_next_status, updated_at = now() where id = p_order_id;
  insert into private.order_events (order_id, public_reference, actor_profile_id, event_type, metadata)
  values (p_order_id, v_order.public_reference, v_admin_id, 'fulfillment_changed', jsonb_build_object('to',p_next_status));
  return true;
end;
$$;

create or replace function public.admin_cancel_unpaid_order(p_order_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_order private.orders%rowtype; v_admin_id uuid := auth.uid();
begin
  if v_admin_id is null or not (select private.is_admin()) then raise exception using errcode = '42501', message = 'ADMIN_REQUIRED'; end if;
  select * into v_order from private.orders where id = p_order_id for update;
  if not found or v_order.status <> 'pending_payment' then raise exception using errcode = 'P0001', message = 'ORDER_NOT_CANCELLABLE'; end if;
  update public.products p set status = 'published', public_media_ready_at = now() from private.inventory_reservations r where r.order_id = p_order_id and r.product_id = p.id and r.status = 'active' and p.status = 'reserved';
  update private.inventory_reservations set status = 'released', resolved_at = now() where order_id = p_order_id and status = 'active';
  update private.payments set status = 'cancelled' where order_id = p_order_id and status = 'pending_manual';
  update private.orders set status = 'cancelled', payment_status = 'cancelled', fulfillment_status = 'cancelled', updated_at = now() where id = p_order_id;
  delete from private.order_contacts where order_id = p_order_id;
  delete from private.order_delivery_snapshots where order_id = p_order_id;
  delete from private.order_billing_snapshots where order_id = p_order_id;
  insert into private.order_events (order_id, public_reference, actor_profile_id, event_type)
  values (p_order_id, v_order.public_reference, v_admin_id, 'cancelled');
  return true;
end;
$$;

create or replace function public.admin_list_orders()
returns table (id uuid, public_reference text, status text, payment_status text, fulfillment_status text, created_at timestamptz, merchandise_subtotal numeric, shipping_amount numeric, final_total numeric)
language plpgsql security definer set search_path = '' as $$
begin
  if not (select private.is_admin()) then raise exception using errcode = '42501', message = 'ADMIN_REQUIRED'; end if;
  return query select o.id,o.public_reference,o.status,o.payment_status,o.fulfillment_status,o.created_at,o.merchandise_subtotal,o.shipping_amount,o.final_total
  from private.orders o order by o.created_at desc limit 100;
end;
$$;

create or replace function public.admin_get_order(p_order_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_order private.orders%rowtype;
begin
  if not (select private.is_admin()) then raise exception using errcode = '42501', message = 'ADMIN_REQUIRED'; end if;
  select * into v_order from private.orders where id = p_order_id;
  if not found then raise exception using errcode = 'P0002', message = 'ORDER_NOT_FOUND'; end if;
  insert into private.personal_data_access_events (actor_profile_id, resource_type, resource_id, public_reference, purpose)
  values (auth.uid(), 'order', v_order.id, v_order.public_reference, 'order_fulfillment');
  return jsonb_build_object(
    'id',v_order.id,'public_reference',v_order.public_reference,'status',v_order.status,'payment_status',v_order.payment_status,
    'fulfillment_status',v_order.fulfillment_status,'merchandise_subtotal',v_order.merchandise_subtotal,'shipping_amount',v_order.shipping_amount,'final_total',v_order.final_total,
    'contact',(select jsonb_build_object('encryption_context_id',c.encryption_context_id,'encrypted_fields',c.encrypted_fields,'key_version',c.key_version) from private.order_contacts c where c.order_id=v_order.id),
    'delivery',(select jsonb_build_object('encryption_context_id',d.encryption_context_id,'municipality_code',d.municipality_code,'encrypted_fields',d.encrypted_fields,'key_version',d.key_version) from private.order_delivery_snapshots d where d.order_id=v_order.id),
    'billing',(select jsonb_build_object('encryption_context_id',b.encryption_context_id,'billing_type',b.billing_type,'encrypted_fields',b.encrypted_fields,'key_version',b.key_version) from private.order_billing_snapshots b where b.order_id=v_order.id),
    'items',(select jsonb_agg(jsonb_build_object('sku',i.sku_snapshot,'title',i.title_snapshot,'price',i.unit_price,'quantity',i.quantity) order by i.position) from private.order_items i where i.order_id=v_order.id),
    'reservations',(select jsonb_agg(jsonb_build_object('status',r.status,'expires_at',r.expires_at,'resolved_at',r.resolved_at) order by r.created_at) from private.inventory_reservations r where r.order_id=v_order.id),
    'payments',(select jsonb_agg(jsonb_build_object('status',p.status,'provider',p.provider,'amount',p.amount,'provider_reference',p.provider_reference,'verified_at',p.verified_at) order by p.created_at) from private.payments p where p.order_id=v_order.id),
    'events',(select jsonb_agg(jsonb_build_object('event_type',e.event_type,'created_at',e.created_at,'metadata',e.metadata) order by e.created_at) from private.order_events e where e.order_id=v_order.id),
    'data_access_events',(select jsonb_agg(jsonb_build_object('actor_profile_id',a.actor_profile_id,'created_at',a.created_at,'purpose',a.purpose) order by a.created_at desc) from private.personal_data_access_events a where a.resource_type='order' and a.resource_id=v_order.id)
  );
end;
$$;

create or replace function public.cleanup_transactional_records()
returns integer language plpgsql security definer set search_path = '' as $$
declare v_deleted integer := 0; v_expired record;
begin
  delete from private.personal_data_access_events where resource_type='purchase_request' and resource_id in (select id from private.purchase_requests where expires_at <= now());
  delete from private.purchase_requests where expires_at <= now();
  get diagnostics v_deleted = row_count;

  for v_expired in
    select o.id,o.public_reference from private.orders o
    where o.status = 'pending_payment' and exists(select 1 from private.inventory_reservations r where r.order_id=o.id and r.status='active' and r.expires_at <= now())
    for update skip locked
  loop
    update public.products p set status='published', public_media_ready_at=now()
      from private.inventory_reservations r where r.order_id=v_expired.id and r.product_id=p.id and r.status='active' and p.status='reserved';
    update private.inventory_reservations set status='expired', resolved_at=now() where order_id=v_expired.id and status='active';
    update private.payments set status='cancelled' where order_id=v_expired.id and status='pending_manual';
    update private.orders set status='expired',payment_status='expired',fulfillment_status='cancelled',updated_at=now() where id=v_expired.id;
    delete from private.order_contacts where order_id=v_expired.id;
    delete from private.order_delivery_snapshots where order_id=v_expired.id;
    delete from private.order_billing_snapshots where order_id=v_expired.id;
    insert into private.order_events(order_id,public_reference,event_type) values(v_expired.id,v_expired.public_reference,'reservation_expired');
  end loop;
  delete from private.purchase_request_rate_limits where expires_at <= now();
  return v_deleted;
end;
$$;

create or replace function public.admin_discard_payment_as_late(p_order_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_order private.orders%rowtype; v_admin_id uuid := auth.uid();
begin
  if v_admin_id is null or not (select private.is_admin()) then raise exception using errcode='42501',message='ADMIN_REQUIRED'; end if;
  select * into v_order from private.orders where id=p_order_id for update;
  if not found or v_order.status <> 'expired' then raise exception using errcode='P0001',message='ORDER_NOT_EXPIRED'; end if;
  update private.payments set status='late_unverified' where order_id=p_order_id and status='cancelled';
  return found;
end;
$$;

revoke all on function public.create_purchase_request(uuid,text[],jsonb,jsonb,jsonb,text,text,jsonb,bytea,bytea,uuid,smallint) from public, anon, authenticated;
grant execute on function public.create_purchase_request(uuid,text[],jsonb,jsonb,jsonb,text,text,jsonb,bytea,bytea,uuid,smallint) to service_role;
revoke all on function public.admin_list_purchase_requests() from public, anon, authenticated;
revoke all on function public.admin_get_purchase_request(uuid) from public, anon;
revoke all on function public.admin_discard_purchase_request(uuid) from public, anon;
revoke all on function public.admin_approve_purchase_request(uuid,boolean) from public, anon;
revoke all on function public.admin_set_order_shipping(uuid,numeric) from public, anon;
revoke all on function public.admin_verify_order_payment(uuid,text) from public, anon;
revoke all on function public.admin_update_order_fulfillment(uuid,text) from public, anon;
revoke all on function public.admin_cancel_unpaid_order(uuid) from public, anon;
revoke all on function public.admin_list_orders() from public, anon;
revoke all on function public.admin_get_order(uuid) from public, anon;
revoke all on function public.admin_discard_payment_as_late(uuid) from public, anon;
revoke all on function public.cleanup_transactional_records() from public, anon, authenticated;
grant execute on function public.admin_list_purchase_requests(), public.admin_get_purchase_request(uuid), public.admin_discard_purchase_request(uuid),
  public.admin_approve_purchase_request(uuid,boolean), public.admin_set_order_shipping(uuid,numeric), public.admin_verify_order_payment(uuid,text),
  public.admin_update_order_fulfillment(uuid,text), public.admin_cancel_unpaid_order(uuid), public.admin_list_orders(),
  public.admin_get_order(uuid), public.admin_discard_payment_as_late(uuid) to authenticated;
grant execute on function public.cleanup_transactional_records() to service_role;

select cron.schedule('reva-transactional-expiration','* * * * *','select public.cleanup_transactional_records();');

commit;
