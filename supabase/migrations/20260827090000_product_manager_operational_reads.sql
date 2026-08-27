begin;

-- Internal Product Manager reads remain subject to the authenticated caller's
-- grants and RLS policies. They intentionally expose no Intake, media, or
-- public-catalog data surface.
create function public.list_product_manager_products(
  p_limit integer,
  p_offset integer
)
returns table (
  id uuid,
  sku text,
  title text,
  status text,
  price text,
  published_at timestamptz,
  is_publicly_visible boolean,
  updated_at timestamptz
)
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if p_limit < 1 or p_limit > 26 then
    raise exception using errcode = '22023', message = 'Product Manager page size is invalid.';
  end if;

  if p_offset < 0 then
    raise exception using errcode = '22023', message = 'Product Manager offset is invalid.';
  end if;

  return query
  select
    products.id,
    products.sku,
    products.title,
    products.status,
    products.price::text,
    products.published_at,
    (products.status = 'published' and products.public_media_ready_at is not null),
    products.updated_at
  from public.products
  order by products.updated_at desc, products.id desc
  limit p_limit
  offset p_offset;
end;
$$;

-- A Product can be inspected internally regardless of its domain lifecycle.
-- Draft persistence remains separate and continues to reject non-draft writes.
create function public.get_product_manager_product(p_product_id uuid)
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
  where products.id = p_product_id;
$$;

revoke all on function public.list_product_manager_products(integer, integer)
  from public, anon, authenticated;
revoke all on function public.get_product_manager_product(uuid)
  from public, anon, authenticated;

grant execute on function public.list_product_manager_products(integer, integer)
  to authenticated;
grant execute on function public.get_product_manager_product(uuid)
  to authenticated;

commit;
