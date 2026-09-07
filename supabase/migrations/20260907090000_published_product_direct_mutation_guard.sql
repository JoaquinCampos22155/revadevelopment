begin;

-- Direct table writes are limited to drafts. Publication and withdrawal remain
-- explicit, authorized lifecycle RPCs; published records cannot be edited by
-- an administrator session outside that lifecycle.
drop policy if exists products_admin_insert on public.products;
drop policy if exists products_admin_update on public.products;

create policy products_admin_insert_draft
  on public.products
  for insert
  to authenticated
  with check (
    (select private.is_admin())
    and status = 'draft'
  );

create policy products_admin_update_draft
  on public.products
  for update
  to authenticated
  using (
    (select private.is_admin())
    and status = 'draft'
  )
  with check (
    (select private.is_admin())
    and status = 'draft'
  );

-- A Product's intake record is editable only while its associated Product is
-- a draft. This keeps acquisition and source facts immutable once published.
drop policy if exists intake_items_admin_update on public.intake_items;

create policy intake_items_admin_update_draft
  on public.intake_items
  for update
  to authenticated
  using (
    (select private.is_admin())
    and not exists (
      select 1
      from public.products
      where products.intake_item_id = intake_items.id
        and products.status <> 'draft'
    )
  )
  with check (
    (select private.is_admin())
    and not exists (
      select 1
      from public.products
      where products.intake_item_id = intake_items.id
        and products.status <> 'draft'
    )
  );

-- Private-media metadata is likewise mutable only for drafts. Existing
-- lifecycle functions retain their explicit security-definer authority.
drop policy if exists product_images_admin_insert on public.product_images;
drop policy if exists product_images_admin_update on public.product_images;

create policy product_images_admin_insert_draft
  on public.product_images
  for insert
  to authenticated
  with check (
    (select private.is_admin())
    and exists (
      select 1
      from public.products
      where products.id = product_images.product_id
        and products.status = 'draft'
    )
  );

create policy product_images_admin_update_draft
  on public.product_images
  for update
  to authenticated
  using (
    (select private.is_admin())
    and exists (
      select 1
      from public.products
      where products.id = product_images.product_id
        and products.status = 'draft'
    )
  )
  with check (
    (select private.is_admin())
    and exists (
      select 1
      from public.products
      where products.id = product_images.product_id
        and products.status = 'draft'
    )
  );

commit;
