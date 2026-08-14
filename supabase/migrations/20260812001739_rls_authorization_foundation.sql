begin;

-- This helper is invoked only by the DDL event trigger. Its dynamic identifier
-- comes from PostgreSQL's event metadata, never from an application request.
create or replace function private.rls_auto_enable()
returns event_trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  command record;
begin
  for command in select * from pg_event_trigger_ddl_commands()
  loop
    if command.schema_name = 'public' and command.object_type = 'table' then
      execute format('alter table if exists %s enable row level security', command.object_identity);
    end if;
  end loop;
end;
$$;

revoke all on function private.rls_auto_enable() from public, anon, authenticated;
revoke all on function private.set_updated_at() from public, anon, authenticated;

-- Recreate the Supabase-documented guard so existing projects stop exposing the
-- legacy public helper while new public tables continue to receive RLS by default.
drop event trigger if exists ensure_rls;
create event trigger ensure_rls
  on ddl_command_end
  when tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
  execute function private.rls_auto_enable();

drop function if exists public.rls_auto_enable();

-- The definer owner bypasses profile RLS, which prevents recursive policy checks.
-- The helper can only answer the current session's role and cannot alter it.
create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function private.is_admin() from public, anon, authenticated;
grant execute on function private.is_admin() to authenticated;

-- Product SKU defaults use this sequence. Schema usage remains private; table
-- INSERT is still protected by the administrator-only products RLS policy.
revoke all on sequence private.product_sku_sequence from public, anon, authenticated;
grant usage on sequence private.product_sku_sequence to authenticated;

revoke all on table public.profiles,
  public.marketing_preferences,
  public.intake_items,
  public.products,
  public.product_images,
  public.tags,
  public.product_tags,
  public.collections,
  public.collection_products,
  public.site_testimonials from anon;

revoke insert, update, delete on table public.profiles from authenticated;
revoke delete on table public.marketing_preferences,
  public.intake_items,
  public.products,
  public.product_images,
  public.tags,
  public.collections,
  public.site_testimonials from authenticated;

grant select on table public.profiles to authenticated;
grant select, insert, update on table public.marketing_preferences to authenticated;
grant select, insert, update on table public.intake_items,
  public.products,
  public.product_images,
  public.tags,
  public.product_tags,
  public.collections,
  public.collection_products,
  public.site_testimonials to authenticated;
grant delete on table public.product_tags, public.collection_products to authenticated;

create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using (id = (select auth.uid()));

create policy profiles_select_admin
  on public.profiles
  for select
  to authenticated
  using ((select private.is_admin()));

create policy marketing_preferences_select_own
  on public.marketing_preferences
  for select
  to authenticated
  using (profile_id = (select auth.uid()));

create policy marketing_preferences_insert_own
  on public.marketing_preferences
  for insert
  to authenticated
  with check (profile_id = (select auth.uid()));

create policy marketing_preferences_update_own
  on public.marketing_preferences
  for update
  to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

create policy intake_items_admin_select on public.intake_items for select to authenticated using ((select private.is_admin()));
create policy intake_items_admin_insert on public.intake_items for insert to authenticated with check ((select private.is_admin()));
create policy intake_items_admin_update on public.intake_items for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

create policy products_admin_select on public.products for select to authenticated using ((select private.is_admin()));
create policy products_admin_insert on public.products for insert to authenticated with check ((select private.is_admin()));
create policy products_admin_update on public.products for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

create policy product_images_admin_select on public.product_images for select to authenticated using ((select private.is_admin()));
create policy product_images_admin_insert on public.product_images for insert to authenticated with check ((select private.is_admin()));
create policy product_images_admin_update on public.product_images for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

create policy tags_admin_select on public.tags for select to authenticated using ((select private.is_admin()));
create policy tags_admin_insert on public.tags for insert to authenticated with check ((select private.is_admin()));
create policy tags_admin_update on public.tags for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

create policy product_tags_admin_select on public.product_tags for select to authenticated using ((select private.is_admin()));
create policy product_tags_admin_insert on public.product_tags for insert to authenticated with check ((select private.is_admin()));
create policy product_tags_admin_update on public.product_tags for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy product_tags_admin_delete on public.product_tags for delete to authenticated using ((select private.is_admin()));

create policy collections_admin_select on public.collections for select to authenticated using ((select private.is_admin()));
create policy collections_admin_insert on public.collections for insert to authenticated with check ((select private.is_admin()));
create policy collections_admin_update on public.collections for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

create policy collection_products_admin_select on public.collection_products for select to authenticated using ((select private.is_admin()));
create policy collection_products_admin_insert on public.collection_products for insert to authenticated with check ((select private.is_admin()));
create policy collection_products_admin_update on public.collection_products for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy collection_products_admin_delete on public.collection_products for delete to authenticated using ((select private.is_admin()));

create policy site_testimonials_admin_select on public.site_testimonials for select to authenticated using ((select private.is_admin()));
create policy site_testimonials_admin_insert on public.site_testimonials for insert to authenticated with check ((select private.is_admin()));
create policy site_testimonials_admin_update on public.site_testimonials for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

commit;
