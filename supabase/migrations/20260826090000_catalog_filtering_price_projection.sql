begin;

-- `price` remains canonical text for public Money mapping. This derived value
-- exists solely so PostgreSQL can compare public prices numerically without
-- asking JavaScript to use floating-point arithmetic.
drop view api.published_product_previews;

create view api.published_product_previews
with (security_barrier = true)
as
select
  products.slug,
  products.title,
  products.price::text as price,
  (products.price * 100)::bigint as price_cents,
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

revoke all on api.published_product_previews from public, anon, authenticated;
grant select on api.published_product_previews to anon, authenticated;

commit;
