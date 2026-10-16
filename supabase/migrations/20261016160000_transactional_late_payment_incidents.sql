begin;

create function public.admin_open_late_payment_incident(p_order_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  v_order private.orders%rowtype;
  v_payment private.payments%rowtype;
  v_admin_id uuid:=auth.uid();
begin
  if v_admin_id is null or not (select private.is_admin()) then raise exception using errcode='42501',message='ADMIN_REQUIRED'; end if;
  select * into v_order from private.orders where id=p_order_id for update;
  if not found or v_order.status<>'expired' then raise exception using errcode='P0001',message='ORDER_NOT_EXPIRED'; end if;
  select * into v_payment from private.payments where order_id=p_order_id and status='cancelled' for update;
  if not found then raise exception using errcode='P0001',message='LATE_PAYMENT_REVIEW_REQUIRED'; end if;
  if exists(select 1 from private.payment_incidents where order_id=p_order_id and status='open') then
    raise exception using errcode='P0001',message='OPEN_PAYMENT_INCIDENT_EXISTS';
  end if;
  update private.payments set status='late_unverified' where id=v_payment.id;
  insert into private.payment_incidents(order_id,payment_id,public_reference,status)
  values(p_order_id,v_payment.id,v_order.public_reference,'open');
  insert into private.order_events(order_id,public_reference,actor_profile_id,event_type,metadata)
  values(p_order_id,v_order.public_reference,v_admin_id,'payment_incident_opened',jsonb_build_object('review_status','unverified'));
  return true;
end;
$$;

create or replace function public.admin_delete_abandoned_order(p_order_id uuid,p_destructive_confirmed boolean)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_order private.orders%rowtype; v_admin_id uuid:=auth.uid();
begin
  if v_admin_id is null or not (select private.is_admin()) then raise exception using errcode='42501',message='ADMIN_REQUIRED'; end if;
  if not coalesce(p_destructive_confirmed,false) then raise exception using errcode='22023',message='DESTRUCTIVE_CONFIRMATION_REQUIRED'; end if;
  select * into v_order from private.orders where id=p_order_id for update;
  if not found or v_order.status not in ('expired','cancelled') or v_order.source_request_expires_at is null or v_order.source_request_expires_at>now()
     or v_order.payment_status='verified'
     or exists(select 1 from private.payments p where p.order_id=p_order_id and p.status in('verified_manual','late_unverified'))
     or exists(select 1 from private.payment_incidents i where i.order_id=p_order_id and i.status='open')
     or exists(select 1 from private.inventory_reservations r where r.order_id=p_order_id and r.status='active') then
    raise exception using errcode='P0001',message='ORDER_NOT_ELIGIBLE_FOR_DELETION';
  end if;
  delete from private.personal_data_access_events where resource_type='order' and resource_id=p_order_id;
  delete from private.order_events where order_id=p_order_id;
  delete from private.orders where id=p_order_id;
  insert into private.order_events(order_id,public_reference,actor_profile_id,event_type,metadata)
  values(null,v_order.public_reference,v_admin_id,'order_data_deleted',jsonb_build_object('source','admin_confirmed','personal_data_removed',true));
  return true;
end;
$$;

revoke all on function public.admin_discard_payment_as_late(uuid) from public,anon,authenticated;
drop function public.admin_discard_payment_as_late(uuid);
revoke all on function public.admin_open_late_payment_incident(uuid) from public,anon;
grant execute on function public.admin_open_late_payment_incident(uuid) to authenticated;

commit;
