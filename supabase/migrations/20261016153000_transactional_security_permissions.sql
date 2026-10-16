begin;

-- Preserve the narrow Product Manager SKU privilege from M018 after M021's
-- private-schema sequence lockdown, and remove the legacy shipping bypass.
grant usage on sequence private.product_sku_sequence to authenticated;
drop function public.admin_set_order_shipping(uuid,numeric);

commit;
