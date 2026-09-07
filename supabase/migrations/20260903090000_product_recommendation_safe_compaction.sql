begin;

-- Replaces the two whole-table position shifts that Supabase rejects without a
-- WHERE clause. The affected set remains the already-validated recommendation set.
create or replace function public.remove_product_recommendation(p_product_id uuid)
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

  update public.product_recommendations as recommendations
  set position = recommendations.position + 1000000
  where recommendations.product_id in (
    select remaining.product_id
    from public.product_recommendations as remaining
  );

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

create or replace function public.reorder_product_recommendations(p_product_ids uuid[])
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

  update public.product_recommendations as recommendations
  set position = recommendations.position + 1000000
  where recommendations.product_id = any(p_product_ids);

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

revoke all on function public.remove_product_recommendation(uuid), public.reorder_product_recommendations(uuid[])
  from public, anon, authenticated;
grant execute on function public.remove_product_recommendation(uuid), public.reorder_product_recommendations(uuid[])
  to authenticated;

commit;
