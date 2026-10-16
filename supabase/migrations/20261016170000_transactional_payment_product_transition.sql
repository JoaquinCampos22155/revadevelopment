begin;

create or replace function public.admin_verify_order_payment(p_order_id uuid,p_provider_reference text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_order private.orders%rowtype; v_payment private.payments%rowtype; v_admin_id uuid:=auth.uid();
begin
  if v_admin_id is null or not (select private.is_admin()) then raise exception using errcode='42501',message='ADMIN_REQUIRED'; end if;
  if p_provider_reference is null or btrim(p_provider_reference)='' or length(p_provider_reference)>120 or p_provider_reference !~ '^[A-Za-z0-9_-]{1,120}$' then raise exception using errcode='22023',message='INVALID_PROVIDER_REFERENCE'; end if;
  select * into v_order from private.orders where id=p_order_id for update;
  if not found or v_order.status<>'pending_payment' or v_order.final_total is null or not v_order.shipping_coverage_confirmed then raise exception using errcode='P0001',message='ORDER_NOT_PAYABLE'; end if;
  select * into v_payment from private.payments where order_id=p_order_id and status='pending_manual' for update;
  if not found or v_payment.payment_link_sent_at is null or not exists(select 1 from private.inventory_reservations r where r.order_id=p_order_id and r.status='active' and r.expires_at>now()) then
    raise exception using errcode='P0001',message='PAYMENT_AFTER_RESERVATION_EXPIRY';
  end if;
  update private.payments set status='verified_manual',provider_reference=btrim(p_provider_reference),verified_by=v_admin_id,verified_at=now(),verification_source='recurrente_dashboard' where id=v_payment.id;
  update private.orders set status='paid',payment_status='verified',fulfillment_status='ready',updated_at=now() where id=p_order_id;
  update private.inventory_reservations set status='consumed',resolved_at=now() where order_id=p_order_id and status='active';
  update public.products set status='sold',public_media_ready_at=null where id in(select i.product_id from private.order_items i where i.order_id=p_order_id);
  insert into private.order_events(order_id,public_reference,actor_profile_id,event_type,metadata)
  values(p_order_id,v_order.public_reference,v_admin_id,'payment_verified',jsonb_build_object('verification_source','recurrente_dashboard'));
  return true;
end;
$$;

create or replace function public.admin_resolve_late_payment(p_order_id uuid,p_resolution text,p_provider_reference text,p_customer_approved boolean)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  v_order private.orders%rowtype;
  v_payment private.payments%rowtype;
  v_incident private.payment_incidents%rowtype;
  v_admin_id uuid:=auth.uid();
  v_products uuid[];
  v_item_count integer;
begin
  if v_admin_id is null or not (select private.is_admin()) then raise exception using errcode='42501',message='ADMIN_REQUIRED'; end if;
  if p_resolution not in ('confirmed_no_payment','fulfilled_after_rereservation','refund_coordinated','customer_accepted_alternative') then raise exception using errcode='22023',message='INVALID_INCIDENT_RESOLUTION'; end if;
  if p_resolution<>'confirmed_no_payment' and (p_provider_reference is null or btrim(p_provider_reference)='' or length(p_provider_reference)>120 or p_provider_reference !~ '^[A-Za-z0-9_-]{1,120}$') then raise exception using errcode='22023',message='VERIFIED_PROVIDER_REFERENCE_REQUIRED'; end if;
  if p_resolution in ('refund_coordinated','customer_accepted_alternative') and not coalesce(p_customer_approved,false) then raise exception using errcode='22023',message='CUSTOMER_APPROVAL_REQUIRED'; end if;
  select * into v_order from private.orders where id=p_order_id for update;
  if not found then raise exception using errcode='P0002',message='ORDER_NOT_FOUND'; end if;
  select * into v_incident from private.payment_incidents where order_id=p_order_id and status='open' for update;
  if not found then raise exception using errcode='P0001',message='OPEN_PAYMENT_INCIDENT_REQUIRED'; end if;
  select * into v_payment from private.payments where id=v_incident.payment_id for update;
  if not found or v_payment.status<>'late_unverified' then raise exception using errcode='P0001',message='LATE_PAYMENT_REVIEW_REQUIRED'; end if;

  if p_resolution='confirmed_no_payment' then
    update private.payments set status='cancelled' where id=v_payment.id;
    update private.payment_incidents set status='resolved',resolution=p_resolution,verification_source='recurrente_dashboard',resolved_at=now(),resolved_by=v_admin_id where id=v_incident.id;
  else
    if p_resolution='fulfilled_after_rereservation' then
      select array_agg(i.product_id order by i.product_id),count(*) into v_products,v_item_count from private.order_items i where i.order_id=p_order_id;
      perform p.id from public.products p where p.id=any(v_products) order by p.id for update;
      if coalesce(cardinality(v_products),0)=0 or (select count(*) from public.products p where p.id=any(v_products) and p.status='published' and p.public_media_ready_at is not null)<>v_item_count then
        raise exception using errcode='P0001',message='PRODUCT_UNAVAILABLE';
      end if;
      insert into private.inventory_reservations(order_id,product_id,status,expires_at)
      select p_order_id,product_id,'active',now()+interval '3 hours' from unnest(v_products) product_id;
      update private.payments set status='verified_manual',provider_reference=btrim(p_provider_reference),verified_by=v_admin_id,verified_at=now(),verification_source='recurrente_dashboard' where id=v_payment.id;
      update private.orders set status='paid',payment_status='verified',fulfillment_status='ready',updated_at=now() where id=p_order_id;
      update private.inventory_reservations set status='consumed',resolved_at=now() where order_id=p_order_id and status='active';
      update public.products set status='sold',public_media_ready_at=null where id=any(v_products);
    else
      update private.payments set status='verified_manual',provider_reference=btrim(p_provider_reference),verified_by=v_admin_id,verified_at=now(),verification_source='recurrente_dashboard' where id=v_payment.id;
      update private.orders set status='cancelled',payment_status='verified',fulfillment_status='cancelled',updated_at=now() where id=p_order_id;
    end if;
    update private.payment_incidents set status='resolved',resolution=p_resolution,verification_source='recurrente_dashboard',resolution_reference=nullif(btrim(p_provider_reference),''),customer_approved=coalesce(p_customer_approved,false),resolved_at=now(),resolved_by=v_admin_id where id=v_incident.id;
  end if;
  insert into private.order_events(order_id,public_reference,actor_profile_id,event_type,metadata)
  values(p_order_id,v_order.public_reference,v_admin_id,'payment_incident_resolved',jsonb_build_object('resolution',p_resolution,'verification_source','recurrente_dashboard','customer_approved',coalesce(p_customer_approved,false)));
  return true;
end;
$$;

commit;
