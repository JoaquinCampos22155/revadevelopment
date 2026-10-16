begin;

-- M017 revokes all private-schema sequences for the transactional foundation.
-- Product Manager still needs the existing SKU default for administrator-only
-- draft inserts; table RLS continues to reject authenticated customers.
grant usage on sequence private.product_sku_sequence to authenticated;

commit;
