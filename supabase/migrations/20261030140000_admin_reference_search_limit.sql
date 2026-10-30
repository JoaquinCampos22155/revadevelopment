begin;

-- Keep M026's RPC contracts and grants intact while accepting 37-character
-- public references and the documented 64-character search ceiling.
do $$
declare
  v_function regprocedure;
  v_definition text;
  v_old_limit constant text := 'length(v_search) > 32';
begin
  foreach v_function in array array[
    'public.admin_list_purchase_requests_v2(integer,integer,text,text,text)'::regprocedure,
    'public.admin_list_orders_v2(integer,integer,text,text,text,text,text)'::regprocedure
  ] loop
    v_definition := pg_get_functiondef(v_function);
    if length(v_definition) - length(replace(v_definition, v_old_limit, '')) <> length(v_old_limit) then
      raise exception 'Unexpected Admin list RPC definition; refusing to alter search validation';
    end if;

    execute replace(v_definition, v_old_limit, 'length(v_search) > 64');
  end loop;
end;
$$;

commit;
