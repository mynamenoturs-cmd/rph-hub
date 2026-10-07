-- RPH Hub PATCH (minimum, review-ready): creates public.rph_approved_session_library only.
-- Scope: CREATE TABLE + ENABLE RLS + 2 policies. NO seed rows, NO ALTER of other tables,
-- no UPDATE/DELETE/DROP, no touch on rph_records / lesson_maps / rpt_lessons / library tables.
-- Idempotent: safe to re-run.
--
-- Policy notes vs existing RPH Hub conventions (rph_activity_library / rph_induction_library /
-- rph_subject_pedagogy use roles={authenticated}, read gated on active=true, admin ALL):
--   * read policy mirrors the existing convention (authenticated only, active rows only);
--     this is stricter than the original file's using(true) and avoids exposing approved
--     lesson bodies to anon/unauthenticated callers.
--   * write is restricted to admins via the existing public.is_admin() helper, so seeding
--     through the app requires an admin session and never a service/anon key.
--   * no FK to rpt_lessons / lesson_maps / rph_records: this table is an additive,
--     hash-bound snapshot store and must not create dependencies on live lesson tables.

create table if not exists public.rph_approved_session_library (
  id text primary key,
  subject_key text not null,
  year int not null,
  academic_year int not null,
  week int not null,
  session int not null,
  duration_minutes int not null,
  sp_code text not null,
  printed_pages int[] not null,
  content_sha256 text not null,
  reviewed_blocks_sha256 text not null,
  approval_manifest_sha256 text not null,
  approval_status text not null,
  active boolean not null default false,
  lesson jsonb not null,
  reviewed_blocks jsonb not null,
  limits jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint rph_approved_session_library_week_range check (week between 1 and 52),
  constraint rph_approved_session_library_session_range check (session between 1 and 10),
  constraint rph_approved_session_library_duration_positive check (duration_minutes > 0),
  constraint rph_approved_session_library_content_sha check (content_sha256 ~ '^[0-9a-f]{64}$'),
  constraint rph_approved_session_library_blocks_sha check (reviewed_blocks_sha256 ~ '^[0-9a-f]{64}$'),
  constraint rph_approved_session_library_manifest_sha check (approval_manifest_sha256 ~ '^[0-9a-f]{64}$')
);

create index if not exists rph_approved_session_library_lookup_idx
  on public.rph_approved_session_library (subject_key, year, academic_year, week, session);
create index if not exists rph_approved_session_library_active_idx
  on public.rph_approved_session_library (active) where active;

alter table public.rph_approved_session_library enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='rph_approved_session_library' and policyname='rph_approved_session_library_read') then
    create policy rph_approved_session_library_read on public.rph_approved_session_library
      for select to authenticated using (active = true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='rph_approved_session_library' and policyname='rph_approved_session_library_admin') then
    create policy rph_approved_session_library_admin on public.rph_approved_session_library
      for all to authenticated using (is_admin()) with check (is_admin());
  end if;
end $$;
