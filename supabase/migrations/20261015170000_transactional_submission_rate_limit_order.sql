begin;

-- Charge the existing per-origin limiter only for a submission that passes
-- server-side identity, inventory, and authoritative-price checks.
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

commit;
