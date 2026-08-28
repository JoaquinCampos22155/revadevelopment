begin;

-- Keeps editorial Home curation independent from Products and Collections.
create table public.product_recommendations (
  product_id uuid primary key references public.products(id) on delete restrict,
  position integer not null check (position > 0),
  constraint product_recommendations_position_unique unique (position)
);

alter table public.product_recommendations enable row level security;

-- The relation is never a direct Data API surface. Narrow functions below are
-- the sole mutation boundary, and they verify the session-bound admin role.
revoke all on table public.product_recommendations from public, anon, authenticated;

create policy product_recommendations_admin_select
  on public.product_recommendations
  for select
  to authenticated
  using ((select private.is_admin()));

create function public.list_product_recommendations()
returns table (
  product_id uuid,
  sku text,
  title text,
  recommendation_position integer
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not (select private.is_admin()) then
    raise exception using errcode = '42501', message = 'Administrator access is required.';
  end if;

  return query
  select recommendations.product_id, products.sku, products.title, recommendations.position
  from public.product_recommendations as recommendations
  join public.products on products.id = recommendations.product_id
  order by recommendations.position;
end;
$$;

create function public.get_product_recommendation_status(p_product_id uuid)
returns table (
  is_eligible boolean,
  recommendation_position integer
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not (select private.is_admin()) then
    raise exception using errcode = '42501', message = 'Administrator access is required.';
  end if;

  return query
  select
    products.status = 'published' and products.public_media_ready_at is not null,
    recommendations.position
  from public.products
  left join public.product_recommendations as recommendations
    on recommendations.product_id = products.id
  where products.id = p_product_id;
end;
$$;

create function public.add_product_recommendation(p_product_id uuid)
returns table (recommendation_position integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_position integer;
begin
  if not (select private.is_admin()) then
    raise exception using errcode = '42501', message = 'Administrator access is required.';
  end if;

  lock table public.product_recommendations in share row exclusive mode;

  if exists (
    select 1
    from public.product_recommendations
    where product_id = p_product_id
  ) then
    raise exception using errcode = '23505', message = 'The Product is already recommended.';
  end if;

  if not exists (
    select 1
    from public.products
    where id = p_product_id
      and status = 'published'
      and public_media_ready_at is not null
  ) then
    raise exception using errcode = '23514', message = 'Only publicly visible Products can be recommended.';
  end if;

  select coalesce(max(product_recommendations.position), 0) + 1
  into v_position
  from public.product_recommendations;

  insert into public.product_recommendations (product_id, position)
  values (p_product_id, v_position);

  return query select v_position;
end;
$$;

create function public.remove_product_recommendation(p_product_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not (select private.is_admin()) then
    raise exception using errcode = '42501', message = 'Administrator access is required.';
  end if;

  lock table public.product_recommendations in share row exclusive mode;

  delete from public.product_recommendations
  where product_id = p_product_id;

  if not found then
    raise exception using errcode = 'P0002', message = 'The Product is not recommended.';
  end if;

  update public.product_recommendations
  set position = position + 1000000;

  with ordered as (
    select product_id, row_number() over (order by position)::integer as next_position
    from public.product_recommendations
  )
  update public.product_recommendations as recommendations
  set position = ordered.next_position
  from ordered
  where recommendations.product_id = ordered.product_id;
end;
$$;

create function public.reorder_product_recommendations(p_product_ids uuid[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existing_count integer;
  v_input_count integer;
  v_distinct_count integer;
begin
  if not (select private.is_admin()) then
    raise exception using errcode = '42501', message = 'Administrator access is required.';
  end if;

  lock table public.product_recommendations in share row exclusive mode;

  select count(*) into v_existing_count from public.product_recommendations;
  v_input_count := coalesce(cardinality(p_product_ids), 0);
  select count(distinct product_id) into v_distinct_count
  from unnest(coalesce(p_product_ids, array[]::uuid[])) as product_id;

  if v_input_count <> v_existing_count or v_distinct_count <> v_input_count then
    raise exception using errcode = '22023', message = 'The recommendation order is invalid.';
  end if;

  if exists (
    (select product_id from public.product_recommendations)
    except
    (select unnest(p_product_ids))
  ) or exists (
    (select unnest(p_product_ids))
    except
    (select product_id from public.product_recommendations)
  ) then
    raise exception using errcode = '22023', message = 'The recommendation order must contain the current recommendation set.';
  end if;

  update public.product_recommendations
  set position = position + 1000000;

  with ordered as (
    select product_id, position::integer as next_position
    from unnest(p_product_ids) with ordinality as input(product_id, position)
  )
  update public.product_recommendations as recommendations
  set position = ordered.next_position
  from ordered
  where recommendations.product_id = ordered.product_id;
end;
$$;

revoke all on function public.list_product_recommendations(),
  public.get_product_recommendation_status(uuid),
  public.add_product_recommendation(uuid),
  public.remove_product_recommendation(uuid),
  public.reorder_product_recommendations(uuid[])
  from public, anon, authenticated;

grant execute on function public.list_product_recommendations(),
  public.get_product_recommendation_status(uuid),
  public.add_product_recommendation(uuid),
  public.remove_product_recommendation(uuid),
  public.reorder_product_recommendations(uuid[])
  to authenticated;

create view api.recommended_product_previews
with (security_barrier = true)
as
select
  recommendations.position,
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
from public.product_recommendations as recommendations
join public.products on products.id = recommendations.product_id
left join public.product_images as primary_image
  on primary_image.product_id = products.id
  and primary_image.position = 1
where products.status = 'published'
  and products.public_media_ready_at is not null;

revoke all on api.recommended_product_previews from public, anon, authenticated;
grant select on api.recommended_product_previews to anon, authenticated;

commit;
