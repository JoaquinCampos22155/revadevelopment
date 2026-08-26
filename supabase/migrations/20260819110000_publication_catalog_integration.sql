begin;

-- Public visibility begins only after the delivery materialization is complete.
alter table public.products
  add column public_media_ready_at timestamptz,
  add constraint products_public_media_ready_requires_published check (
    public_media_ready_at is null
    or (status = 'published' and published_at is not null)
  );

-- Public delivery copies are intentionally separate from private operational media.
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'public-product-media',
  'public-product-media',
  true,
  5242880,
  array['image/webp']::text[]
);

-- A public bucket grants delivery only. Administrators retain the sole write and
-- delete path, and keys are immutable ProductImage identities.
create policy storage_public_product_media_admin_insert
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'public-product-media'
    and name ~ '^products/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.webp$'
    and (select private.is_admin())
  );

create policy storage_public_product_media_admin_select
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'public-product-media'
    and name ~ '^products/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.webp$'
    and (select private.is_admin())
  );

create policy storage_public_product_media_admin_delete
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'public-product-media'
    and name ~ '^products/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.webp$'
    and (select private.is_admin())
  );

-- Direct table clients may still edit approved draft facts, but can never set
-- lifecycle state. Lifecycle transitions are deliberately narrow functions.
revoke update on table public.products from authenticated;
grant update (
  title,
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
  condition_notes
) on table public.products to authenticated;

create function private.product_publication_missing_requirements(p_product_id uuid)
returns text[]
language plpgsql
security definer
set search_path = pg_catalog, public, storage
as $$
declare
  v_product public.products%rowtype;
  v_image_count integer;
  v_max_position integer;
  v_missing text[] := array[]::text[];
begin
  select * into v_product
  from public.products
  where id = p_product_id;

  if not found then
    return array['product_not_found'];
  end if;

  if btrim(v_product.title) = '' then v_missing := array_append(v_missing, 'title'); end if;
  if v_product.slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then v_missing := array_append(v_missing, 'slug'); end if;
  if v_product.description is null or btrim(v_product.description) = '' then v_missing := array_append(v_missing, 'description'); end if;
  if v_product.price is null or v_product.price <= 0 then v_missing := array_append(v_missing, 'price'); end if;
  if v_product.audience is null or btrim(v_product.audience) = '' then v_missing := array_append(v_missing, 'audience'); end if;
  if v_product.garment_type is null or btrim(v_product.garment_type) = '' then v_missing := array_append(v_missing, 'garment_type'); end if;
  if v_product.condition_rating is null then v_missing := array_append(v_missing, 'condition'); end if;
  if not (
    (v_product.size_label is not null and btrim(v_product.size_label) <> '')
    or (v_product.measurements is not null and v_product.measurements <> '{}'::jsonb)
  ) then v_missing := array_append(v_missing, 'sizing'); end if;

  select count(*), max(position)
  into v_image_count, v_max_position
  from public.product_images
  where product_id = p_product_id;

  if v_image_count = 0 then
    v_missing := array_append(v_missing, 'image');
  elsif v_max_position <> v_image_count or not exists (
    select 1 from public.product_images where product_id = p_product_id and position = 1
  ) then
    v_missing := array_append(v_missing, 'image_order');
  end if;

  if exists (
    select 1
    from public.product_images as image
    where image.product_id = p_product_id
      and not exists (
        select 1
        from storage.objects as object
        where object.bucket_id = 'product-media'
          and object.name = image.storage_key
          and object.metadata ->> 'mimetype' = 'image/webp'
      )
  ) then v_missing := array_append(v_missing, 'private_media'); end if;

  return v_missing;
end;
$$;

revoke all on function private.product_publication_missing_requirements(uuid)
  from public, anon, authenticated;

create function public.get_product_publication_readiness(p_product_id uuid)
returns table (missing_requirements text[])
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
begin
  if (select auth.uid()) is null or not (select private.is_admin()) then
    raise exception using errcode = '42501', message = 'Administrator access is required.';
  end if;

  return query select private.product_publication_missing_requirements(p_product_id);
end;
$$;

create function public.prepare_product_publication(p_product_id uuid)
returns table (product_id uuid, slug text, published_at timestamptz)
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
declare
  v_missing text[];
begin
  if (select auth.uid()) is null or not (select private.is_admin()) then
    raise exception using errcode = '42501', message = 'Administrator access is required.';
  end if;

  perform 1 from public.products where id = p_product_id and status = 'draft' for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'The requested Product draft does not exist.';
  end if;

  select private.product_publication_missing_requirements(p_product_id) into v_missing;
  if cardinality(v_missing) > 0 then
    raise exception using errcode = '23514', message = 'The Product is not ready for publication.';
  end if;

  return query
  update public.products
  set status = 'published', published_at = now(), public_media_ready_at = null
  where id = p_product_id
  returning public.products.id, public.products.slug, public.products.published_at;
end;
$$;

create function public.complete_product_publication(p_product_id uuid)
returns table (product_id uuid, slug text)
language plpgsql
security definer
set search_path = pg_catalog, public, storage, private
as $$
begin
  if (select auth.uid()) is null or not (select private.is_admin()) then
    raise exception using errcode = '42501', message = 'Administrator access is required.';
  end if;

  perform 1
  from public.products
  where id = p_product_id and status = 'published' and public_media_ready_at is null
  for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'The Product is not awaiting publication completion.';
  end if;

  if exists (
    select 1
    from public.product_images as image
    where image.product_id = p_product_id
      and not exists (
        select 1
        from storage.objects as object
        where object.bucket_id = 'public-product-media'
          and object.name = format('products/%s.webp', image.id)
          and object.metadata ->> 'mimetype' = 'image/webp'
      )
  ) then
    raise exception using errcode = '23514', message = 'Public Product media is incomplete.';
  end if;

  return query
  update public.products
  set public_media_ready_at = now()
  where id = p_product_id
  returning public.products.id, public.products.slug;
end;
$$;

create function public.begin_product_unpublish(p_product_id uuid)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
begin
  if (select auth.uid()) is null or not (select private.is_admin()) then
    raise exception using errcode = '42501', message = 'Administrator access is required.';
  end if;

  update public.products
  set public_media_ready_at = null
  where id = p_product_id and status = 'published' and public_media_ready_at is not null;
  if not found then
    raise exception using errcode = 'P0002', message = 'The Product is not publicly published.';
  end if;
end;
$$;

create function public.complete_product_unpublish(p_product_id uuid)
returns table (product_id uuid, slug text)
language plpgsql
security definer
set search_path = pg_catalog, public, storage, private
as $$
begin
  if (select auth.uid()) is null or not (select private.is_admin()) then
    raise exception using errcode = '42501', message = 'Administrator access is required.';
  end if;

  perform 1
  from public.products
  where id = p_product_id and status = 'published' and public_media_ready_at is null
  for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'The Product is not awaiting unpublish completion.';
  end if;

  if exists (
    select 1
    from public.product_images as image
    join storage.objects as object
      on object.bucket_id = 'public-product-media'
      and object.name = format('products/%s.webp', image.id)
    where image.product_id = p_product_id
  ) then
    raise exception using errcode = '23514', message = 'Public Product media remains.';
  end if;

  return query
  update public.products
  set status = 'draft', published_at = null, public_media_ready_at = null
  where id = p_product_id
  returning public.products.id, public.products.slug;
end;
$$;

revoke all on function public.get_product_publication_readiness(uuid),
  public.prepare_product_publication(uuid),
  public.complete_product_publication(uuid),
  public.begin_product_unpublish(uuid),
  public.complete_product_unpublish(uuid)
  from public, anon, authenticated;
grant execute on function public.get_product_publication_readiness(uuid),
  public.prepare_product_publication(uuid),
  public.complete_product_publication(uuid),
  public.begin_product_unpublish(uuid),
  public.complete_product_unpublish(uuid)
  to authenticated;

drop view api.published_product_previews;
drop view api.published_product_details;

create view api.published_product_previews
with (security_barrier = true)
as
select
  products.slug,
  products.title,
  products.price::text as price,
  products.audience,
  products.brand,
  products.garment_type,
  products.color,
  products.size_label,
  products.condition_rating,
  primary_image.id as primary_image_id,
  primary_image.alt_text as primary_image_alt_text,
  primary_image.width as primary_image_width,
  primary_image.height as primary_image_height
from public.products
left join public.product_images as primary_image
  on primary_image.product_id = products.id and primary_image.position = 1
where products.status = 'published'
  and products.public_media_ready_at is not null;

create view api.published_product_details
with (security_barrier = true)
as
select
  products.slug,
  products.title,
  products.price::text as price,
  products.audience,
  products.brand,
  products.garment_type,
  products.color,
  products.size_label,
  products.condition_rating,
  products.description,
  products.material_details,
  products.measurements,
  products.condition_notes
from public.products
where products.status = 'published'
  and products.public_media_ready_at is not null;

create view api.published_product_images
with (security_barrier = true)
as
select
  products.slug as product_slug,
  product_images.id as image_id,
  product_images.alt_text,
  product_images.position,
  product_images.width,
  product_images.height
from public.products
join public.product_images on product_images.product_id = products.id
where products.status = 'published'
  and products.public_media_ready_at is not null;

revoke all on api.published_product_previews,
  api.published_product_details,
  api.published_product_images
  from public, anon, authenticated;
grant select on api.published_product_previews,
  api.published_product_details,
  api.published_product_images
  to anon, authenticated;

-- Product Manager may display a published record solely to offer the explicit
-- recovery action. Draft persistence functions still refuse non-draft writes.
create or replace function public.get_product_manager_draft(p_product_id uuid)
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
    and products.status in ('draft', 'published');
$$;

commit;
