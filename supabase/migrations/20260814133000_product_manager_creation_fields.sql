begin;

-- Audience is a stable, single Product discovery attribute. It remains nullable
-- for incomplete drafts, but only the approved values may be persisted.
alter table public.products
  add column audience text
    constraint products_audience_valid check (
      audience is null or audience in ('hombre', 'mujer', 'ninos', 'unisex')
    );

-- Publication is intentionally stricter than draft entry. This replacement
-- preserves existing requirements and adds audience for public catalog trust.
alter table public.products
  drop constraint products_publication_requirements;

alter table public.products
  add constraint products_publication_requirements check (
    status not in ('published', 'reserved', 'sold')
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

-- PostgreSQL function identity includes input types. Replace the prior Product
-- Manager functions atomically rather than leaving overloaded RPC endpoints.
drop function public.create_product_draft_from_intake(text, date, text, text, text, text);
drop function public.save_product_draft(
  uuid, text, date, text, text, text, text, text, text, text, text, text,
  text, jsonb, text, text
);
drop function public.get_product_manager_draft(uuid);

create function public.create_product_draft_from_intake(
  p_source_type text,
  p_received_at date,
  p_source_profile_id text,
  p_acquisition_cost text,
  p_title text,
  p_slug text,
  p_description text,
  p_price text,
  p_audience text,
  p_brand text,
  p_garment_type text,
  p_color text,
  p_material_details text,
  p_size_label text,
  p_measurements jsonb,
  p_condition_rating text,
  p_condition_notes text
)
returns table (
  intake_item_id uuid,
  product_id uuid,
  sku text
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_actor_profile_id uuid := (select auth.uid());
  v_intake_item_id uuid;
  v_product_id uuid;
  v_sku text;
begin
  insert into public.intake_items (
    source_type,
    destination,
    source_profile_id,
    created_by_profile_id,
    acquisition_cost,
    received_at
  )
  values (
    p_source_type,
    'catalog',
    nullif(btrim(p_source_profile_id), '')::uuid,
    v_actor_profile_id,
    nullif(btrim(p_acquisition_cost), '')::numeric,
    p_received_at
  )
  returning id into v_intake_item_id;

  insert into public.products (
    intake_item_id,
    created_by_profile_id,
    title,
    slug,
    description,
    price,
    audience,
    brand,
    garment_type,
    color,
    material_details,
    size_label,
    measurements,
    condition_rating,
    condition_notes,
    status
  )
  values (
    v_intake_item_id,
    v_actor_profile_id,
    p_title,
    p_slug,
    nullif(btrim(p_description), ''),
    nullif(btrim(p_price), '')::numeric,
    nullif(btrim(p_audience), ''),
    nullif(btrim(p_brand), ''),
    nullif(btrim(p_garment_type), ''),
    nullif(btrim(p_color), ''),
    nullif(btrim(p_material_details), ''),
    nullif(btrim(p_size_label), ''),
    p_measurements,
    nullif(btrim(p_condition_rating), '')::smallint,
    nullif(btrim(p_condition_notes), ''),
    'draft'
  )
  returning id, products.sku into v_product_id, v_sku;

  return query select v_intake_item_id, v_product_id, v_sku;
end;
$$;

create function public.save_product_draft(
  p_product_id uuid,
  p_source_type text,
  p_received_at date,
  p_source_profile_id text,
  p_acquisition_cost text,
  p_title text,
  p_description text,
  p_price text,
  p_audience text,
  p_brand text,
  p_garment_type text,
  p_color text,
  p_material_details text,
  p_size_label text,
  p_measurements jsonb,
  p_condition_rating text,
  p_condition_notes text
)
returns table (
  product_id uuid,
  sku text,
  updated_at timestamptz
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_intake_item_id uuid;
  v_sku text;
  v_updated_at timestamptz;
begin
  select products.intake_item_id
  into v_intake_item_id
  from public.products
  where products.id = p_product_id
    and products.status = 'draft';

  if v_intake_item_id is null then
    raise exception using
      errcode = 'P0002',
      message = 'The requested Product draft does not exist.';
  end if;

  update public.intake_items
  set
    source_type = p_source_type,
    destination = 'catalog',
    source_profile_id = nullif(btrim(p_source_profile_id), '')::uuid,
    acquisition_cost = nullif(btrim(p_acquisition_cost), '')::numeric,
    received_at = p_received_at
  where intake_items.id = v_intake_item_id;

  update public.products
  set
    title = p_title,
    description = nullif(btrim(p_description), ''),
    price = nullif(btrim(p_price), '')::numeric,
    audience = nullif(btrim(p_audience), ''),
    brand = nullif(btrim(p_brand), ''),
    garment_type = nullif(btrim(p_garment_type), ''),
    color = nullif(btrim(p_color), ''),
    material_details = nullif(btrim(p_material_details), ''),
    size_label = nullif(btrim(p_size_label), ''),
    measurements = p_measurements,
    condition_rating = nullif(btrim(p_condition_rating), '')::smallint,
    condition_notes = nullif(btrim(p_condition_notes), '')
  where products.id = p_product_id
    and products.status = 'draft'
  returning products.sku, products.updated_at into v_sku, v_updated_at;

  if v_sku is null then
    raise exception using
      errcode = 'P0002',
      message = 'The requested Product draft does not exist.';
  end if;

  return query select p_product_id, v_sku, v_updated_at;
end;
$$;

create function public.get_product_manager_draft(p_product_id uuid)
returns table (
  id uuid,
  intake_item_id uuid,
  sku text,
  title text,
  description text,
  price text,
  audience text,
  brand text,
  garment_type text,
  color text,
  material_details text,
  size_label text,
  measurements jsonb,
  condition_rating smallint,
  condition_notes text,
  status text,
  source_type text,
  source_profile_id uuid,
  acquisition_cost text,
  received_at date,
  updated_at timestamptz
)
language sql
security invoker
set search_path = ''
as $$
  select
    products.id,
    products.intake_item_id,
    products.sku,
    products.title,
    products.description,
    products.price::text,
    products.audience,
    products.brand,
    products.garment_type,
    products.color,
    products.material_details,
    products.size_label,
    products.measurements,
    products.condition_rating,
    products.condition_notes,
    products.status,
    intake_items.source_type,
    intake_items.source_profile_id,
    intake_items.acquisition_cost::text,
    intake_items.received_at,
    products.updated_at
  from public.products
  join public.intake_items on intake_items.id = products.intake_item_id
  where products.id = p_product_id
    and products.status = 'draft';
$$;

revoke all on function public.create_product_draft_from_intake(
  text, date, text, text, text, text, text, text, text, text, text, text,
  text, text, jsonb, text, text
) from public, anon, authenticated;
revoke all on function public.save_product_draft(
  uuid, text, date, text, text, text, text, text, text, text, text, text,
  text, text, jsonb, text, text
) from public, anon, authenticated;
revoke all on function public.get_product_manager_draft(uuid)
  from public, anon, authenticated;

grant execute on function public.create_product_draft_from_intake(
  text, date, text, text, text, text, text, text, text, text, text, text,
  text, text, jsonb, text, text
) to authenticated;
grant execute on function public.save_product_draft(
  uuid, text, date, text, text, text, text, text, text, text, text, text,
  text, text, jsonb, text, text
) to authenticated;
grant execute on function public.get_product_manager_draft(uuid)
  to authenticated;

commit;
