begin;

-- M008 limited public delivery writes to administrators and a syntactically
-- valid key. A key must also belong to a real ProductImage whose Product is
-- in the lifecycle staging state established by prepare/unpublish.
drop policy storage_public_product_media_admin_insert on storage.objects;
drop policy storage_public_product_media_admin_delete on storage.objects;

create policy storage_public_product_media_admin_insert
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'public-product-media'
    and (select private.is_admin())
    and exists (
      select 1
      from public.product_images as image
      join public.products as product on product.id = image.product_id
      where name = format('products/%s.webp', image.id)
        and product.status = 'published'
        and product.public_media_ready_at is null
    )
  );

create policy storage_public_product_media_admin_delete
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'public-product-media'
    and (select private.is_admin())
    and exists (
      select 1
      from public.product_images as image
      join public.products as product on product.id = image.product_id
      where name = format('products/%s.webp', image.id)
        and product.status = 'published'
        and product.public_media_ready_at is null
    )
  );

commit;
