begin;

-- Product media remains private while a Product is a draft. This bucket stores
-- only the processed WebP asset; source photographs never become Storage rows.
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'product-media',
  'product-media',
  false,
  5242880,
  array['image/webp']::text[]
);

-- Ordinary request-scoped Storage access preserves the authenticated actor's
-- RLS context. There is deliberately no anonymous/customer access and no
-- UPDATE policy because Product media uses immutable object keys.
create policy storage_product_media_admin_select
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'product-media'
    and name ~ '^products/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.webp$'
    and (select private.is_admin())
  );

create policy storage_product_media_admin_insert
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'product-media'
    and name ~ '^products/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.webp$'
    and (select private.is_admin())
  );

create policy storage_product_media_admin_delete
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'product-media'
    and name ~ '^products/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.webp$'
    and (select private.is_admin())
  );

-- Position assignment is persistence-owned so concurrent uploads cannot
-- duplicate the primary/ordering position. The Product row lock serializes
-- image insertion for a single draft without imposing a Product image count.
create function public.create_product_image_metadata(
  p_image_id uuid,
  p_product_id uuid,
  p_storage_key text,
  p_alt_text_prefix text,
  p_width integer,
  p_height integer
)
returns table (
  id uuid,
  product_id uuid,
  storage_key text,
  alt_text text,
  image_position integer,
  width integer,
  height integer,
  mime_type text,
  created_at timestamptz
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_position integer;
begin
  perform 1
  from public.products
  where products.id = p_product_id
    and products.status = 'draft'
  for update;

  if not found then
    raise exception using
      errcode = 'P0002',
      message = 'The requested Product draft does not exist.';
  end if;

  if p_storage_key <> format('products/%s/%s.webp', p_product_id, p_image_id) then
    raise exception using
      errcode = '22023',
      message = 'The Product media key is invalid.';
  end if;

  select coalesce(max(product_images.position), 0) + 1
  into v_position
  from public.product_images
  where product_images.product_id = p_product_id;

  insert into public.product_images (
    id,
    product_id,
    storage_key,
    alt_text,
    position,
    width,
    height,
    mime_type
  )
  values (
    p_image_id,
    p_product_id,
    p_storage_key,
    concat(p_alt_text_prefix, ' — foto ', v_position),
    v_position,
    p_width,
    p_height,
    'image/webp'
  )
  returning
    product_images.id,
    product_images.product_id,
    product_images.storage_key,
    product_images.alt_text,
    product_images.position,
    product_images.width,
    product_images.height,
    product_images.mime_type,
    product_images.created_at
  into id, product_id, storage_key, alt_text, image_position, width, height, mime_type, created_at;

  return next;
end;
$$;

-- The application supplies the complete intended order. The function validates
-- exact membership, then uses a positive temporary offset to avoid violating
-- the non-deferrable unique Product-position constraint mid-update.
create function public.reorder_product_images(
  p_product_id uuid,
  p_ordered_image_ids uuid[]
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_count integer;
  v_offset integer;
begin
  perform 1
  from public.products
  where products.id = p_product_id
    and products.status = 'draft'
  for update;

  if not found then
    raise exception using
      errcode = 'P0002',
      message = 'The requested Product draft does not exist.';
  end if;

  select count(*) into v_count
  from public.product_images
  where product_images.product_id = p_product_id;

  if coalesce(cardinality(p_ordered_image_ids), 0) <> v_count
    or (
      select count(distinct requested_image.image_id)
      from unnest(p_ordered_image_ids) as requested_image(image_id)
    ) <> v_count
    or exists (
      select 1
      from public.product_images
      where product_images.product_id = p_product_id
        and product_images.id <> all(p_ordered_image_ids)
    ) then
    raise exception using
      errcode = '22023',
      message = 'The Product image order is invalid.';
  end if;

  select coalesce(max(product_images.position), 0) + v_count + 1
  into v_offset
  from public.product_images
  where product_images.product_id = p_product_id;

  update public.product_images
  set position = product_images.position + v_offset
  where product_images.product_id = p_product_id;

  update public.product_images as product_image
  set position = requested_order.position
  from unnest(p_ordered_image_ids) with ordinality as requested_order(image_id, position)
  where product_image.product_id = p_product_id
    and product_image.id = requested_order.image_id;
end;
$$;

-- ProductImage table DELETE remains unavailable to request-scoped roles. This
-- narrow function is intentionally callable only after the application has
-- deleted the object through the Storage API, and it atomically reindexes the
-- remaining metadata. SECURITY DEFINER prevents a general DELETE grant.
create function public.delete_product_image_metadata(
  p_product_image_id uuid
)
returns table (
  product_id uuid,
  deleted_position integer
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_product_id uuid;
  v_deleted_position integer;
  v_count integer;
  v_offset integer;
begin
  if not (select private.is_admin()) then
    raise exception using
      errcode = '42501',
      message = 'Administrator access is required.';
  end if;

  select product_images.product_id, product_images.position
  into v_product_id, v_deleted_position
  from public.product_images
  join public.products on products.id = product_images.product_id
  where product_images.id = p_product_image_id
    and products.status = 'draft'
  for update of products;

  if v_product_id is null then
    raise exception using
      errcode = 'P0002',
      message = 'The requested Product image does not exist.';
  end if;

  delete from public.product_images
  where product_images.id = p_product_image_id;

  select count(*), coalesce(max(product_images.position), 0)
  into v_count, v_offset
  from public.product_images
  where product_images.product_id = v_product_id;

  if v_count > 0 then
    v_offset := v_offset + v_count + 1;

    update public.product_images
    set position = product_images.position + v_offset
    where product_images.product_id = v_product_id;

    update public.product_images as product_image
    set position = normalized_order.position
    from (
      select
        product_images.id,
        row_number() over (order by product_images.position)::integer as position
      from public.product_images
      where product_images.product_id = v_product_id
    ) as normalized_order
    where product_image.id = normalized_order.id;
  end if;

  product_id := v_product_id;
  deleted_position := v_deleted_position;
  return next;
end;
$$;

revoke all on function public.create_product_image_metadata(uuid, uuid, text, text, integer, integer)
  from public, anon, authenticated;
revoke all on function public.reorder_product_images(uuid, uuid[])
  from public, anon, authenticated;
revoke all on function public.delete_product_image_metadata(uuid)
  from public, anon, authenticated;

grant execute on function public.create_product_image_metadata(uuid, uuid, text, text, integer, integer)
  to authenticated;
grant execute on function public.reorder_product_images(uuid, uuid[])
  to authenticated;
grant execute on function public.delete_product_image_metadata(uuid)
  to authenticated;

commit;
