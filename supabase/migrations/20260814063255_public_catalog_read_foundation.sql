begin;

-- The api schema is REVA's deliberately small Data API surface. Business
-- tables remain in public with their existing default-deny grants and RLS.
create schema if not exists api;
revoke all on schema api from public;

-- These views intentionally run with their migration owner so anonymous
-- visitors can read published data while base-table RLS remains default-deny.
-- Their fixed allowlists and publication predicate are the public contract.
create view api.published_product_previews
with (security_barrier = true)
as
select
  products.slug,
  products.title,
  products.price::text as price,
  products.brand,
  products.garment_type,
  products.color,
  products.size_label,
  products.condition_rating
from public.products
where products.status = 'published';

create view api.published_product_details
with (security_barrier = true)
as
select
  products.slug,
  products.title,
  products.price::text as price,
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
where products.status = 'published';

-- Exposure is opt-in and read-only. No default privileges are granted so each
-- future API object must be reviewed and explicitly added to this contract.
revoke all on all tables in schema api from public, anon, authenticated;
grant usage on schema api to anon, authenticated;
grant select on api.published_product_previews, api.published_product_details
  to anon, authenticated;

commit;
