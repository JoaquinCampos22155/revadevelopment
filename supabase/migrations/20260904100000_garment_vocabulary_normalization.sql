begin;

-- One approved taxonomy normalization only. Published lifecycle controls remain
-- unchanged; this is not a general Product-editing path.
update public.products
set garment_type = 'pantalones'
where garment_type = 'jeans';

commit;
