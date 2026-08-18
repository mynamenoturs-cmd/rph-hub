-- ============================================================
-- DIAGNOSTIC (READ-ONLY): DELIMa Auth setup — RPH Hub v0.3.3
-- SELECT only. No INSERT/UPDATE/DELETE/DROP/ALTER/CREATE/TRUNCATE.
-- Safe to paste into Supabase SQL Editor. Run sections 1-6 as-is;
-- section 7 is OPTIONAL (replace placeholders first).
-- ============================================================

-- ------------------------------------------------------------
-- 1) Does the trigger exist on auth.users? Is it enabled?
--    Expected: trigger on_auth_user_created, state = ENABLED,
--    definition ending in EXECUTE PROCEDURE public.handle_new_user()
-- ------------------------------------------------------------
select
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  case when tgenabled = 'O' then 'ENABLED'
       when tgenabled = 'D' then 'DISABLED'
       when tgenabled = 'R' then 'REPLICA'
       else 'ALWAYS' end as state,
  pg_get_triggerdef(t.oid) as trigger_definition
from pg_trigger t
where tgrelid = 'auth.users'::regclass
  and not tgisinternal
order by tgname;

-- ------------------------------------------------------------
-- 2) Trigger function exists? Show its full definition.
--    Expected: full body of public.handle_new_user()
-- ------------------------------------------------------------
select pg_get_functiondef(p.oid) as function_definition
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where p.proname = 'handle_new_user' and n.nspname = 'public';

-- ------------------------------------------------------------
-- 3) Does the function create a public.profiles row for new users?
--    (also checks the v0.3.3 authorized_users insert)
-- ------------------------------------------------------------
select
  p.proname as function_name,
  (p.prosrc ilike '%insert into public.profiles%')          as creates_profiles_row,
  (p.prosrc ilike '%insert into public.authorized_users%')  as creates_authorized_users_row,
  (p.prosrc ilike '%insert into public.subjects%')          as creates_default_subjects,
  pg_get_function_result(p.oid) as returns_type
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where p.proname = 'handle_new_user' and n.nspname = 'public';

-- ------------------------------------------------------------
-- 4a) RLS enabled? (profiles / authorized_users / login_sessions)
-- ------------------------------------------------------------
select
  c.relname as table_name,
  c.relrowsecurity    as rls_enabled,
  c.relforcerowsecurity as rls_forced,
  count(p.policyname) as policy_count
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
left join pg_policies p on p.schemaname = n.nspname and p.tablename = c.relname
where n.nspname = 'public'
  and c.relname in ('profiles','authorized_users','login_sessions')
group by c.relname, c.relrowsecurity, c.relforcerowsecurity
order by c.relname;

-- ------------------------------------------------------------
-- 4b) The actual policies (who can do what, and on which rows)
-- ------------------------------------------------------------
select
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual as using_expression,     -- row filter for SELECT/UPDATE/DELETE
  with_check                     -- row filter for INSERT/UPDATE
from pg_policies
where schemaname = 'public'
  and tablename in ('profiles','authorized_users','login_sessions')
order by tablename, cmd, policyname;

-- ------------------------------------------------------------
-- 5a) Grants to the authenticated role on these tables
-- ------------------------------------------------------------
select
  grantee,
  table_name,
  privilege_type,
  is_grantable
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('profiles','authorized_users','login_sessions')
  and grantee in ('authenticated','postgres')
order by table_name, grantee, privilege_type;

-- ------------------------------------------------------------
-- 5b) OPTIONAL: simulate an authenticated teacher session.
--     Replace the two placeholders with a real teacher's
--     UUID + email BEFORE running. set_config() only sets a
--     session-local setting — it writes NOTHING to the database.
--     Afterwards, the SELECTs below return exactly what that
--     teacher's JWT would see under RLS.
-- ------------------------------------------------------------
select set_config('request.jwt.claims',
  '{"sub":"REPLACE_WITH_TEACHER_UUID","email":"REPLACE_WITH_TEACHER_EMAIL","role":"authenticated"}',
  false);

select user_id, full_name, role, delima_id, access_status
from public.profiles;                 -- rows this JWT can read

select email, role, status
from public.authorized_users;         -- rows this JWT can read

select id, email, status, login_at
from public.login_sessions;           -- rows this JWT can read

-- ------------------------------------------------------------
-- 6a) auth.users rows with NO matching public.profiles row
--     (plus missing authorized_users rows, for the same list)
-- ------------------------------------------------------------
select
  u.id,
  u.email,
  u.created_at,
  u.last_sign_in_at,
  (p.user_id is null) as missing_profile,
  (a.email is null)   as missing_authorized_users
from auth.users u
left join public.profiles p        on p.user_id = u.id
left join public.authorized_users a on a.email = lower(u.email)
where p.user_id is null or a.email is null
order by u.created_at desc;

-- ------------------------------------------------------------
-- 6b) Summary counts
-- ------------------------------------------------------------
select
  count(*)                                                                   as total_auth_users,
  count(*) filter (where p.user_id is null)                                  as users_without_profile,
  count(*) filter (where a.email is null)                                    as users_without_authorized_users,
  count(*) filter (where p.user_id is null
                   and lower(coalesce(u.email,'')) ~ '^g-[^@]+@moe-dl\.edu\.my$') as g_teachers_without_profile
from auth.users u
left join public.profiles p        on p.user_id = u.id
left join public.authorized_users a on a.email = lower(u.email);
