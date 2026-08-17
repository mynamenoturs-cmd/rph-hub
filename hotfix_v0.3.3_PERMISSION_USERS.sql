-- e-RPH & PBD Hub v0.3.3.1 HOTFIX
-- Fix: "permission denied for table users" selepas Google OAuth.
-- Punca: policy authorized_users_read merujuk auth.users secara terus.
-- auth schema tidak patut dibaca terus oleh role authenticated melalui Data API/RLS.

begin;

drop policy if exists authorized_users_read on public.authorized_users;

create policy authorized_users_read
on public.authorized_users
for select
to authenticated
using (
  public.is_admin()
  or email = lower(coalesce((select auth.jwt()->>'email'), ''))
);

grant select on public.authorized_users to authenticated;

commit;
