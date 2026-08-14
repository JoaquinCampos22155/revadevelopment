begin;

-- Profiles are business identities, not caller-provided signup data. Provisioning
-- in the Auth-user transaction guarantees an authenticated REVA user cannot exist
-- without the corresponding default-customer Profile.
create function private.provision_profile_for_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'customer');

  return new;
end;
$$;

revoke all on function private.provision_profile_for_new_auth_user()
  from public, anon, authenticated;

create trigger auth_users_provision_profile
  after insert on auth.users
  for each row
  execute function private.provision_profile_for_new_auth_user();

commit;
