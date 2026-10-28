begin;

-- Incomplete drafts must still be eligible for a genuine manual sale. The
-- publication checklist is required for public/reserved inventory, not Sold.
alter table public.products
  drop constraint products_publication_requirements,
  add constraint products_publication_requirements check (
    status not in ('published', 'reserved')
    or (
      description is not null and btrim(description) <> ''
      and price is not null
      and audience is not null and btrim(audience) <> ''
      and garment_type is not null and btrim(garment_type) <> ''
      and condition_rating is not null
      and published_at is not null
      and (
        (size_label is not null and btrim(size_label) <> '')
        or measurements is not null
      )
    )
  );

create table private.product_lifecycle_events (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  event_type text not null check (event_type = 'manual_external_sale'),
  previous_status text not null check (previous_status in ('draft', 'published')),
  new_status text not null check (new_status = 'sold'),
  actor_profile_id uuid not null references public.profiles(id) on delete restrict,
  external_payment_verified boolean not null check (external_payment_verified),
  occurred_at timestamptz not null default now()
);

create index product_lifecycle_events_product_time_idx
  on private.product_lifecycle_events (product_id, occurred_at desc);

alter table private.product_lifecycle_events enable row level security;
revoke all on table private.product_lifecycle_events from public, anon, authenticated, service_role;

create function public.admin_mark_product_sold(
  p_product_id uuid,
  p_expected_status text,
  p_external_payment_verified boolean
)
returns table (product_id uuid, slug text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := auth.uid();
  v_product public.products%rowtype;
  v_slug text;
begin
  if v_actor_id is null or not (select private.is_admin()) then
    raise exception using errcode = '42501', message = 'ADMIN_REQUIRED';
  end if;

  if p_expected_status is null or p_expected_status not in ('draft', 'published') then
    raise exception using errcode = '22023', message = 'INVALID_EXPECTED_PRODUCT_STATUS';
  end if;

  if p_external_payment_verified is distinct from true then
    raise exception using errcode = '22023', message = 'EXTERNAL_PAYMENT_VERIFICATION_REQUIRED';
  end if;

  select * into v_product
  from public.products
  where id = p_product_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'PRODUCT_NOT_FOUND';
  end if;

  if v_product.status = 'sold' then
    raise exception using errcode = 'P0001', message = 'PRODUCT_ALREADY_SOLD';
  end if;

  if v_product.status not in ('draft', 'published') then
    raise exception using errcode = 'P0001', message = 'PRODUCT_NOT_ELIGIBLE';
  end if;

  if v_product.status <> p_expected_status then
    raise exception using errcode = 'P0001', message = 'STALE_PRODUCT_STATE';
  end if;

  if exists (
    select 1
    from private.inventory_reservations as reservation
    where reservation.product_id = p_product_id
      and reservation.status = 'active'
  ) then
    raise exception using errcode = 'P0001', message = 'ACTIVE_RESERVATION_EXISTS';
  end if;

  update public.products
  set status = 'sold',
      public_media_ready_at = null
  where id = p_product_id
  returning public.products.slug into v_slug;

  insert into private.product_lifecycle_events (
    product_id,
    event_type,
    previous_status,
    new_status,
    actor_profile_id,
    external_payment_verified
  ) values (
    p_product_id,
    'manual_external_sale',
    v_product.status,
    'sold',
    v_actor_id,
    true
  );

  return query select p_product_id, v_slug;
end;
$$;

revoke all on function public.admin_mark_product_sold(uuid, text, boolean)
  from public, anon, authenticated, service_role;
grant execute on function public.admin_mark_product_sold(uuid, text, boolean)
  to authenticated;

commit;
