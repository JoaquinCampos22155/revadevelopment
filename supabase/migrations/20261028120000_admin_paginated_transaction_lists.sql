begin;

create index purchase_requests_created_id_idx
  on private.purchase_requests (created_at desc, id desc);

create index orders_created_id_idx
  on private.orders (created_at desc, id desc);

create index payments_order_created_id_idx
  on private.payments (order_id, created_at desc, id desc);

create function public.admin_list_purchase_requests_v2(
  p_page integer,
  p_page_size integer,
  p_search text,
  p_status text,
  p_date_order text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_search text;
begin
  if auth.uid() is null or not (select private.is_admin()) then
    raise exception using errcode = '42501', message = 'ADMIN_REQUIRED';
  end if;

  v_search := upper(btrim(coalesce(p_search, '')));
  if p_page is null or p_page < 1 or p_page > 100000
     or p_page_size is null or p_page_size < 1 or p_page_size > 50
     or length(v_search) > 32 or v_search !~ '^[A-Z0-9-]*$'
     or p_status is null or p_status not in ('all', 'pending_review')
     or p_date_order is null or p_date_order not in ('newest', 'oldest') then
    raise exception using errcode = '22023', message = 'INVALID_ADMIN_LIST_FILTER';
  end if;

  return (
    with filtered as materialized (
      select
        r.id,
        r.public_reference,
        r.created_at,
        r.expires_at,
        'pending_review'::text as status,
        coalesce(sum(i.quantity), 0)::integer as product_count,
        coalesce(sum(i.unit_price * i.quantity), 0)::numeric(12, 2) as merchandise_subtotal
      from private.purchase_requests r
      left join private.purchase_request_items i on i.request_id = r.id
      where r.expires_at > now()
        and (v_search = '' or r.public_reference like v_search || '%')
        and (p_status = 'all' or p_status = 'pending_review')
      group by r.id
    ),
    counts as (
      select count(*)::bigint as total_count from filtered
    ),
    bounds as (
      select
        total_count,
        case when total_count = 0 then 0
          else ceil(total_count::numeric / p_page_size)::integer end as page_count,
        case when total_count = 0 then 1
          else least(p_page, greatest(1, ceil(total_count::numeric / p_page_size)::integer)) end as page
      from counts
    ),
    ranked as (
      select
        f.*,
        row_number() over (
          order by
            case when p_date_order = 'newest' then f.created_at end desc,
            case when p_date_order = 'oldest' then f.created_at end asc,
            case when p_date_order = 'newest' then f.id end desc,
            case when p_date_order = 'oldest' then f.id end asc
        ) as row_number
      from filtered f
    ),
    paged as (
      select r.*
      from ranked r
      cross join bounds b
      where r.row_number > ((b.page - 1) * p_page_size)
        and r.row_number <= (b.page * p_page_size)
    ),
    result_items as (
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'id', p.id,
            'public_reference', p.public_reference,
            'created_at', p.created_at,
            'expires_at', p.expires_at,
            'status', p.status,
            'product_count', p.product_count,
            'merchandise_subtotal', p.merchandise_subtotal
          ) order by
            case when p_date_order = 'newest' then p.created_at end desc,
            case when p_date_order = 'oldest' then p.created_at end asc,
            case when p_date_order = 'newest' then p.id end desc,
            case when p_date_order = 'oldest' then p.id end asc
        ), '[]'::jsonb
      ) as items
      from paged p
    )
    select jsonb_build_object(
      'items', result_items.items,
      'page', bounds.page,
      'page_count', bounds.page_count,
      'page_size', p_page_size,
      'total_count', bounds.total_count
    )
    from bounds cross join result_items
  );
end;
$$;

create function public.admin_list_orders_v2(
  p_page integer,
  p_page_size integer,
  p_search text,
  p_order_status text,
  p_payment_status text,
  p_fulfillment_status text,
  p_date_order text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_search text;
begin
  if auth.uid() is null or not (select private.is_admin()) then
    raise exception using errcode = '42501', message = 'ADMIN_REQUIRED';
  end if;

  v_search := upper(btrim(coalesce(p_search, '')));
  if p_page is null or p_page < 1 or p_page > 100000
     or p_page_size is null or p_page_size < 1 or p_page_size > 50
     or length(v_search) > 32 or v_search !~ '^[A-Z0-9-]*$'
     or p_order_status is null or p_order_status not in ('all', 'pending_payment', 'paid', 'fulfilling', 'completed', 'cancelled', 'expired')
     or p_payment_status is null or p_payment_status not in ('all', 'not_started', 'pending', 'verified', 'expired', 'cancelled', 'pending_manual', 'verified_manual', 'late_unverified')
     or p_fulfillment_status is null or p_fulfillment_status not in ('all', 'not_ready', 'ready', 'preparing', 'dispatched', 'completed', 'cancelled')
     or p_date_order is null or p_date_order not in ('newest', 'oldest') then
    raise exception using errcode = '22023', message = 'INVALID_ADMIN_LIST_FILTER';
  end if;

  return (
    with filtered as materialized (
      select
        o.id,
        o.public_reference,
        o.status,
        coalesce(payment.status, o.payment_status) as payment_status,
        o.fulfillment_status,
        o.created_at,
        o.merchandise_subtotal,
        o.shipping_amount,
        o.final_total,
        count(oi.product_id)::integer as product_count
      from private.orders o
      left join private.order_items oi on oi.order_id = o.id
      left join lateral (
        select p.status
        from private.payments p
        where p.order_id = o.id
        order by p.created_at desc, p.id desc
        limit 1
      ) payment on true
      where (v_search = '' or o.public_reference like v_search || '%')
        and (p_order_status = 'all' or o.status = p_order_status)
        and (p_payment_status = 'all' or coalesce(payment.status, o.payment_status) = p_payment_status)
        and (p_fulfillment_status = 'all' or o.fulfillment_status = p_fulfillment_status)
      group by o.id, payment.status
    ),
    counts as (
      select count(*)::bigint as total_count from filtered
    ),
    bounds as (
      select
        total_count,
        case when total_count = 0 then 0
          else ceil(total_count::numeric / p_page_size)::integer end as page_count,
        case when total_count = 0 then 1
          else least(p_page, greatest(1, ceil(total_count::numeric / p_page_size)::integer)) end as page
      from counts
    ),
    ranked as (
      select
        f.*,
        row_number() over (
          order by
            case when p_date_order = 'newest' then f.created_at end desc,
            case when p_date_order = 'oldest' then f.created_at end asc,
            case when p_date_order = 'newest' then f.id end desc,
            case when p_date_order = 'oldest' then f.id end asc
        ) as row_number
      from filtered f
    ),
    paged as (
      select r.*
      from ranked r
      cross join bounds b
      where r.row_number > ((b.page - 1) * p_page_size)
        and r.row_number <= (b.page * p_page_size)
    ),
    page_details as (
      select
        p.*,
        (
          select jsonb_build_object(
            'image_id', image.id,
            'alt_text', image.alt_text,
            'width', image.width,
            'height', image.height
          )
          from private.order_items thumbnail_item
          join public.products thumbnail_product
            on thumbnail_product.id = thumbnail_item.product_id
            and thumbnail_product.status = 'published'
            and thumbnail_product.public_media_ready_at is not null
          join public.product_images image
            on image.product_id = thumbnail_product.id
            and image.position = 1
          where thumbnail_item.order_id = p.id
          order by thumbnail_item.position, thumbnail_item.product_id
          limit 1
        ) as product_thumbnail
      from paged p
    ),
    result_items as (
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'id', p.id,
            'public_reference', p.public_reference,
            'status', p.status,
            'payment_status', p.payment_status,
            'fulfillment_status', p.fulfillment_status,
            'created_at', p.created_at,
            'merchandise_subtotal', p.merchandise_subtotal,
            'shipping_amount', p.shipping_amount,
            'final_total', p.final_total,
            'product_count', p.product_count,
            'product_thumbnail', p.product_thumbnail
          ) order by
            case when p_date_order = 'newest' then p.created_at end desc,
            case when p_date_order = 'oldest' then p.created_at end asc,
            case when p_date_order = 'newest' then p.id end desc,
            case when p_date_order = 'oldest' then p.id end asc
        ), '[]'::jsonb
      ) as items
      from page_details p
    )
    select jsonb_build_object(
      'items', result_items.items,
      'page', bounds.page,
      'page_count', bounds.page_count,
      'page_size', p_page_size,
      'total_count', bounds.total_count
    )
    from bounds cross join result_items
  );
end;
$$;

revoke all on function public.admin_list_purchase_requests_v2(integer, integer, text, text, text)
  from public, anon, authenticated, service_role;
revoke all on function public.admin_list_orders_v2(integer, integer, text, text, text, text, text)
  from public, anon, authenticated, service_role;
grant execute on function public.admin_list_purchase_requests_v2(integer, integer, text, text, text)
  to authenticated;
grant execute on function public.admin_list_orders_v2(integer, integer, text, text, text, text, text)
  to authenticated;

commit;
