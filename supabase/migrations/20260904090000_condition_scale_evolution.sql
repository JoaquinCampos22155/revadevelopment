begin;

-- Do not reinterpret existing Products. The approved condition model can only
-- evolve when every persisted non-null rating is already valid in 1 through 4.
do $$
begin
  if exists (
    select 1
    from public.products
    where condition_rating is not null
      and condition_rating not between 1 and 4
  ) then
    raise exception using
      errcode = '23514',
      message = 'Condition scale evolution requires all existing Product condition ratings to be within 1 through 4.';
  end if;
end;
$$;

alter table public.products
  drop constraint products_condition_rating_check;

alter table public.products
  add constraint products_condition_rating_check
  check (condition_rating between 1 and 4);

commit;
