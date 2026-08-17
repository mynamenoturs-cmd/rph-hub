-- e-RPH & PBD Hub Source-First v0.3
-- Untuk PROJECT SUPABASE BARU. Jalankan sekali dalam SQL Editor.
-- Fokus: Source-First RPH, page-level source, Canonical Lesson Map, anti-repeat, PBD, Storage private dan RLS per guru.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  school_name text,
  role text not null default 'teacher' check (role in ('teacher','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  code text not null,
  name text not null,
  created_at timestamptz not null default now(),
  unique(teacher_id,code)
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  year smallint not null check (year between 1 and 6),
  academic_year smallint not null default 2026,
  created_at timestamptz not null default now(),
  unique (teacher_id,name,academic_year)
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  student_no integer,
  name text not null,
  delima_id text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(class_id,name)
);

create table if not exists public.curriculum_standards (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  year smallint not null check (year between 1 and 6),
  sk_code text,
  sk_description text,
  code text not null,
  description text not null,
  source_ref text,
  created_at timestamptz not null default now(),
  unique(subject_id,year,code)
);

create table if not exists public.rpt_lessons (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  year smallint not null check (year between 1 and 6),
  week_no smallint not null check (week_no between 1 and 53),
  title text not null,
  sk text,
  sp text,
  objective text,
  success_criteria text,
  suggested_activities text,
  textbook_ref text,
  source_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(subject_id,year,week_no,title)
);

create table if not exists public.source_documents (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  class_id uuid references public.classes(id) on delete set null,
  year smallint check (year between 1 and 6),
  source_type text not null check (source_type in ('rpt','dskp','rph_example','textbook','activity_book','timetable','transit_template','other')),
  title text,
  file_name text not null,
  mime_type text,
  file_size bigint,
  storage_bucket text default 'source-files',
  storage_path text,
  extraction_status text not null default 'pending',
  extracted_chars integer not null default 0,
  page_count integer,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists source_documents_lookup_idx on public.source_documents(teacher_id,subject_id,year,source_type);

create table if not exists public.source_chunks (
  id bigint generated always as identity primary key,
  document_id uuid not null references public.source_documents(id) on delete cascade,
  chunk_no integer not null,
  content text not null,
  char_start integer,
  char_end integer,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(document_id,chunk_no)
);
create index if not exists source_chunks_document_idx on public.source_chunks(document_id,chunk_no);

create table if not exists public.timetable_entries (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 1 and 7),
  start_time time,
  end_time time,
  academic_year smallint not null default 2026,
  source_document_id uuid references public.source_documents(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  unique(teacher_id,class_id,subject_id,day_of_week,start_time,academic_year)
);
create index if not exists timetable_teacher_class_day_idx on public.timetable_entries(teacher_id,class_id,day_of_week,start_time);

create table if not exists public.transit_records (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete restrict,
  standard_id uuid references public.curriculum_standards(id) on delete set null,
  assessment_date date not null,
  tp smallint not null check (tp between 1 and 6),
  evidence_note text,
  source_type text not null default 'transit',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(student_id,subject_id,standard_id,assessment_date)
);

create table if not exists public.book_checks (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete restrict,
  check_date date not null,
  book_type text not null,
  task_ref text,
  completion_status text not null check (completion_status in ('Lengkap','Separa lengkap','Tidak lengkap','Tidak hadir')),
  score numeric(5,2) check (score is null or (score >= 0 and score <= 10)),
  suggested_tp smallint check (suggested_tp is null or suggested_tp between 1 and 6),
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.rph_records (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete restrict,
  lesson_date date not null,
  week_no smallint,
  rpt_lesson_id uuid references public.rpt_lessons(id) on delete set null,
  title text,
  rph_json jsonb not null default '{}'::jsonb,
  drive_file_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(teacher_id,class_id,subject_id,lesson_date)
);

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  teacher_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Auto-create profile guru selepas Supabase Auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles(user_id,full_name)
  values(new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)))
  on conflict (user_id) do nothing;
  insert into public.subjects(teacher_id,code,name) values
    (new.id,'BM','Bahasa Melayu'),(new.id,'PJ','Pendidikan Jasmani'),(new.id,'PK','Pendidikan Kesihatan')
  on conflict (teacher_id,code) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- RLS semua table aplikasi.
alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.classes enable row level security;
alter table public.students enable row level security;
alter table public.curriculum_standards enable row level security;
alter table public.rpt_lessons enable row level security;
alter table public.source_documents enable row level security;
alter table public.source_chunks enable row level security;
alter table public.timetable_entries enable row level security;
alter table public.transit_records enable row level security;
alter table public.book_checks enable row level security;
alter table public.rph_records enable row level security;
alter table public.audit_logs enable row level security;

-- Policies: profile.
drop policy if exists profile_read_own on public.profiles;
drop policy if exists profile_update_own on public.profiles;
create policy profile_read_own on public.profiles for select to authenticated using (user_id=auth.uid());
create policy profile_update_own on public.profiles for update to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());

-- Subject milik guru sendiri.
drop policy if exists subjects_read on public.subjects;
drop policy if exists subjects_insert_own on public.subjects;
drop policy if exists subjects_update_own on public.subjects;
drop policy if exists subjects_delete_own on public.subjects;
create policy subjects_read on public.subjects for select to authenticated using (teacher_id=auth.uid());
create policy subjects_insert_own on public.subjects for insert to authenticated with check (teacher_id=auth.uid());
create policy subjects_update_own on public.subjects for update to authenticated using (teacher_id=auth.uid()) with check (teacher_id=auth.uid());
create policy subjects_delete_own on public.subjects for delete to authenticated using (teacher_id=auth.uid());

-- Kelas/murid guru sendiri.
drop policy if exists classes_teacher_all on public.classes;
create policy classes_teacher_all on public.classes for all to authenticated using (teacher_id=auth.uid()) with check (teacher_id=auth.uid());
drop policy if exists students_teacher_select on public.students;
drop policy if exists students_teacher_insert on public.students;
drop policy if exists students_teacher_update on public.students;
drop policy if exists students_teacher_delete on public.students;
create policy students_teacher_select on public.students for select to authenticated using (exists(select 1 from public.classes c where c.id=students.class_id and c.teacher_id=auth.uid()));
create policy students_teacher_insert on public.students for insert to authenticated with check (exists(select 1 from public.classes c where c.id=students.class_id and c.teacher_id=auth.uid()));
create policy students_teacher_update on public.students for update to authenticated using (exists(select 1 from public.classes c where c.id=students.class_id and c.teacher_id=auth.uid())) with check (exists(select 1 from public.classes c where c.id=students.class_id and c.teacher_id=auth.uid()));
create policy students_teacher_delete on public.students for delete to authenticated using (exists(select 1 from public.classes c where c.id=students.class_id and c.teacher_id=auth.uid()));

-- DSKP/RPT ikut pemilik subject.
drop policy if exists standards_read on public.curriculum_standards;
drop policy if exists standards_write on public.curriculum_standards;
create policy standards_read on public.curriculum_standards for select to authenticated using (exists(select 1 from public.subjects s where s.id=curriculum_standards.subject_id and s.teacher_id=auth.uid()));
create policy standards_write on public.curriculum_standards for all to authenticated using (exists(select 1 from public.subjects s where s.id=curriculum_standards.subject_id and s.teacher_id=auth.uid())) with check (exists(select 1 from public.subjects s where s.id=curriculum_standards.subject_id and s.teacher_id=auth.uid()));
drop policy if exists rpt_read on public.rpt_lessons;
drop policy if exists rpt_write on public.rpt_lessons;
create policy rpt_read on public.rpt_lessons for select to authenticated using (exists(select 1 from public.subjects s where s.id=rpt_lessons.subject_id and s.teacher_id=auth.uid()));
create policy rpt_write on public.rpt_lessons for all to authenticated using (exists(select 1 from public.subjects s where s.id=rpt_lessons.subject_id and s.teacher_id=auth.uid())) with check (exists(select 1 from public.subjects s where s.id=rpt_lessons.subject_id and s.teacher_id=auth.uid()));

-- Fail sumber dan chunk hanya guru pemilik.
drop policy if exists source_documents_teacher_all on public.source_documents;
create policy source_documents_teacher_all on public.source_documents for all to authenticated using (teacher_id=auth.uid()) with check (teacher_id=auth.uid());
drop policy if exists source_chunks_teacher_select on public.source_chunks;
drop policy if exists source_chunks_teacher_insert on public.source_chunks;
drop policy if exists source_chunks_teacher_delete on public.source_chunks;
create policy source_chunks_teacher_select on public.source_chunks for select to authenticated using (exists(select 1 from public.source_documents d where d.id=source_chunks.document_id and d.teacher_id=auth.uid()));
create policy source_chunks_teacher_insert on public.source_chunks for insert to authenticated with check (exists(select 1 from public.source_documents d where d.id=source_chunks.document_id and d.teacher_id=auth.uid()));
create policy source_chunks_teacher_delete on public.source_chunks for delete to authenticated using (exists(select 1 from public.source_documents d where d.id=source_chunks.document_id and d.teacher_id=auth.uid()));

-- Jadual, transit, buku, RPH, audit.
drop policy if exists timetable_teacher_all on public.timetable_entries;
create policy timetable_teacher_all on public.timetable_entries for all to authenticated using (teacher_id=auth.uid()) with check (teacher_id=auth.uid() and exists(select 1 from public.classes c where c.id=class_id and c.teacher_id=auth.uid()));
drop policy if exists transit_teacher_all on public.transit_records;
create policy transit_teacher_all on public.transit_records for all to authenticated using (teacher_id=auth.uid()) with check (teacher_id=auth.uid() and exists(select 1 from public.classes c where c.id=class_id and c.teacher_id=auth.uid()));
drop policy if exists book_teacher_all on public.book_checks;
create policy book_teacher_all on public.book_checks for all to authenticated using (teacher_id=auth.uid()) with check (teacher_id=auth.uid() and exists(select 1 from public.classes c where c.id=class_id and c.teacher_id=auth.uid()));
drop policy if exists rph_teacher_all on public.rph_records;
create policy rph_teacher_all on public.rph_records for all to authenticated using (teacher_id=auth.uid()) with check (teacher_id=auth.uid() and exists(select 1 from public.classes c where c.id=class_id and c.teacher_id=auth.uid()));
drop policy if exists audit_teacher_select on public.audit_logs;
drop policy if exists audit_teacher_insert on public.audit_logs;
create policy audit_teacher_select on public.audit_logs for select to authenticated using (teacher_id=auth.uid());
create policy audit_teacher_insert on public.audit_logs for insert to authenticated with check (teacher_id=auth.uid());

-- Private Storage bucket untuk dokumen sumber.
insert into storage.buckets(id,name,public) values('source-files','source-files',false) on conflict (id) do nothing;
drop policy if exists source_files_select_own on storage.objects;
drop policy if exists source_files_insert_own on storage.objects;
drop policy if exists source_files_update_own on storage.objects;
drop policy if exists source_files_delete_own on storage.objects;
create policy source_files_select_own on storage.objects for select to authenticated using (bucket_id='source-files' and (storage.foldername(name))[1]=auth.uid()::text);
create policy source_files_insert_own on storage.objects for insert to authenticated with check (bucket_id='source-files' and (storage.foldername(name))[1]=auth.uid()::text);
create policy source_files_update_own on storage.objects for update to authenticated using (bucket_id='source-files' and (storage.foldername(name))[1]=auth.uid()::text) with check (bucket_id='source-files' and (storage.foldername(name))[1]=auth.uid()::text);
create policy source_files_delete_own on storage.objects for delete to authenticated using (bucket_id='source-files' and (storage.foldername(name))[1]=auth.uid()::text);

-- Data API privileges. RLS tetap menentukan baris yang boleh dilihat/ubah.
grant usage on schema public to anon, authenticated;
grant select,insert,update,delete on public.profiles,public.subjects,public.classes,public.students,public.curriculum_standards,public.rpt_lessons,public.source_documents,public.source_chunks,public.timetable_entries,public.transit_records,public.book_checks,public.rph_records,public.audit_logs to authenticated;
grant usage,select on all sequences in schema public to authenticated;

-- Pastikan user Auth yang SUDAH wujud sebelum schema dijalankan mendapat subjek asas.
insert into public.subjects(teacher_id,code,name)
select u.id, v.code, v.name
from auth.users u
cross join (values ('BM','Bahasa Melayu'),('PJ','Pendidikan Jasmani'),('PK','Pendidikan Kesihatan')) as v(code,name)
on conflict (teacher_id,code) do nothing;

-- Realtime.
do $$ begin alter publication supabase_realtime add table public.transit_records; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.book_checks; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.source_documents; exception when duplicate_object then null; end $$;

-- =========================================================
-- v0.3 SOURCE-FIRST / ACCURACY LAYER
-- =========================================================

alter table public.source_documents add column if not exists academic_year smallint not null default 2026;
create index if not exists source_documents_academic_idx on public.source_documents(teacher_id,subject_id,year,academic_year,source_type);

-- Kandungan sumber mengikut halaman/sektion. PDF mendapat nombor halaman sebenar.
create table if not exists public.source_pages (
  id bigint generated always as identity primary key,
  document_id uuid not null references public.source_documents(id) on delete cascade,
  page_no integer not null,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(document_id,page_no)
);
create index if not exists source_pages_doc_page_idx on public.source_pages(document_id,page_no);

-- Canonical Lesson Map: satu rekod yang sudah dipadankan dan disahkan sebelum RPH dijana.
create table if not exists public.lesson_maps (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  year smallint not null check (year between 1 and 6),
  academic_year smallint not null default 2026,
  week_no smallint not null check (week_no between 1 and 53),
  session_no smallint not null default 1 check (session_no between 1 and 10),
  day_of_week smallint check (day_of_week is null or day_of_week between 1 and 7),
  title text not null,
  sk text,
  sp text not null,
  objective text,
  success_criteria text,
  textbook_page_start integer,
  textbook_page_end integer,
  activity_book_ref text,
  progression_stage text not null default 'application' check (progression_stage in ('introduction','guided','application','assessment','enrichment')),
  source_activities text,
  source_document_ids uuid[] not null default '{}'::uuid[],
  source_evidence jsonb not null default '{}'::jsonb,
  confidence_score numeric(5,2) not null default 0 check (confidence_score between 0 and 100),
  week_exact boolean not null default false,
  sp_crosscheck boolean not null default false,
  verification_status text not null default 'draft' check (verification_status in ('draft','verified','needs_review')),
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(teacher_id,subject_id,year,academic_year,week_no,session_no)
);
create index if not exists lesson_maps_lookup_idx on public.lesson_maps(teacher_id,subject_id,year,academic_year,week_no,verification_status);

alter table public.rph_records add column if not exists lesson_map_id uuid references public.lesson_maps(id) on delete set null;
alter table public.rph_records add column if not exists source_match_score numeric(5,2) check (source_match_score is null or source_match_score between 0 and 100);
alter table public.rph_records add column if not exists validation_score numeric(5,2) check (validation_score is null or validation_score between 0 and 100);

-- Sejarah aktiviti untuk anti-repeat. Fingerprint digunakan untuk perbandingan semantik ringan di frontend.
create table if not exists public.rph_activity_history (
  id bigint generated always as identity primary key,
  teacher_id uuid not null references auth.users(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  lesson_date date not null,
  week_no smallint,
  lesson_map_id uuid references public.lesson_maps(id) on delete set null,
  rph_record_id uuid references public.rph_records(id) on delete cascade,
  activity_no smallint not null default 1,
  activity_text text not null,
  activity_fingerprint text,
  similarity_to_recent numeric(6,5),
  created_at timestamptz not null default now()
);
create index if not exists rph_activity_recent_idx on public.rph_activity_history(teacher_id,class_id,subject_id,lesson_date desc);

alter table public.source_pages enable row level security;
alter table public.lesson_maps enable row level security;
alter table public.rph_activity_history enable row level security;

drop policy if exists source_pages_teacher_select on public.source_pages;
drop policy if exists source_pages_teacher_insert on public.source_pages;
drop policy if exists source_pages_teacher_delete on public.source_pages;
create policy source_pages_teacher_select on public.source_pages for select to authenticated using (
  exists(select 1 from public.source_documents d where d.id=source_pages.document_id and d.teacher_id=auth.uid())
);
create policy source_pages_teacher_insert on public.source_pages for insert to authenticated with check (
  exists(select 1 from public.source_documents d where d.id=source_pages.document_id and d.teacher_id=auth.uid())
);
create policy source_pages_teacher_delete on public.source_pages for delete to authenticated using (
  exists(select 1 from public.source_documents d where d.id=source_pages.document_id and d.teacher_id=auth.uid())
);

drop policy if exists lesson_maps_teacher_all on public.lesson_maps;
create policy lesson_maps_teacher_all on public.lesson_maps for all to authenticated
using (teacher_id=auth.uid() and exists(select 1 from public.subjects s where s.id=subject_id and s.teacher_id=auth.uid()))
with check (teacher_id=auth.uid() and exists(select 1 from public.subjects s where s.id=subject_id and s.teacher_id=auth.uid()));

drop policy if exists rph_activity_teacher_all on public.rph_activity_history;
create policy rph_activity_teacher_all on public.rph_activity_history for all to authenticated
using (teacher_id=auth.uid() and exists(select 1 from public.classes c where c.id=class_id and c.teacher_id=auth.uid()))
with check (teacher_id=auth.uid() and exists(select 1 from public.classes c where c.id=class_id and c.teacher_id=auth.uid()));

grant select,insert,update,delete on public.source_pages,public.lesson_maps,public.rph_activity_history to authenticated;
grant usage,select on all sequences in schema public to authenticated;

do $$ begin alter publication supabase_realtime add table public.lesson_maps; exception when duplicate_object then null; end $$;

select 'schema_v0.3_source_first_ready' as status;

-- =========================================================
-- v0.3.2 AUTH / ROLE / RLS HARDENING
-- =========================================================
-- e-RPH & PBD Hub v0.3 -> v0.3.2
-- FULL AUTH GATE + RLS HARDENING + ROLE GURU/ADMIN
-- Jalankan SEKALI pada project yang sudah menjalankan supabase_schema_v0.3.sql.

begin;

-- 1) Pastikan semua pengguna Auth sedia ada mempunyai profile.
insert into public.profiles(user_id, full_name, role)
select u.id,
       coalesce(u.raw_user_meta_data->>'full_name', split_part(coalesce(u.email,''),'@',1), 'Guru'),
       'teacher'
from auth.users u
on conflict (user_id) do nothing;

-- 2) Trigger pengguna baharu: role default ialah teacher.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles(user_id,full_name,role)
  values(new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email,''),'@',1), 'Guru'), 'teacher')
  on conflict (user_id) do nothing;

  insert into public.subjects(teacher_id,code,name) values
    (new.id,'BM','Bahasa Melayu'),
    (new.id,'PJ','Pendidikan Jasmani'),
    (new.id,'PK','Pendidikan Kesihatan')
  on conflict (teacher_id,code) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- 3) Helper role. SECURITY DEFINER supaya polisi boleh menyemak role tanpa recursion RLS.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists(
    select 1 from public.profiles p
    where p.user_id = auth.uid() and p.role = 'admin'
  );
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- 4) Hanya admin boleh menukar role melalui RPC ini.
create or replace function public.admin_set_user_role(target_user_id uuid, new_role text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Admin access required';
  end if;
  if new_role not in ('teacher','admin') then
    raise exception 'Invalid role';
  end if;
  update public.profiles
     set role = new_role, updated_at = now()
   where user_id = target_user_id;
end;
$$;
revoke all on function public.admin_set_user_role(uuid,text) from public, anon;
grant execute on function public.admin_set_user_role(uuid,text) to authenticated;

-- 5) PROFILE: self read/update profile biasa; admin boleh read semua.
drop policy if exists profile_read_own on public.profiles;
drop policy if exists profile_update_own on public.profiles;
drop policy if exists profile_read_self_or_admin on public.profiles;
drop policy if exists profile_update_self on public.profiles;
create policy profile_read_self_or_admin on public.profiles
for select to authenticated
using (user_id = auth.uid() or public.is_admin());
create policy profile_update_self on public.profiles
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Role tidak boleh ditukar terus dari browser walaupun row sendiri.
revoke update on public.profiles from authenticated;
grant update(full_name, school_name, updated_at) on public.profiles to authenticated;
grant select on public.profiles to authenticated;

-- 6) SUBJECTS
drop policy if exists subjects_read on public.subjects;
drop policy if exists subjects_insert_own on public.subjects;
drop policy if exists subjects_update_own on public.subjects;
drop policy if exists subjects_delete_own on public.subjects;
create policy subjects_read on public.subjects for select to authenticated
using (teacher_id=auth.uid() or public.is_admin());
create policy subjects_insert_own on public.subjects for insert to authenticated
with check (teacher_id=auth.uid() or public.is_admin());
create policy subjects_update_own on public.subjects for update to authenticated
using (teacher_id=auth.uid() or public.is_admin())
with check (teacher_id=auth.uid() or public.is_admin());
create policy subjects_delete_own on public.subjects for delete to authenticated
using (teacher_id=auth.uid() or public.is_admin());

-- 7) CLASSES + STUDENTS
drop policy if exists classes_teacher_all on public.classes;
create policy classes_teacher_all on public.classes for all to authenticated
using (teacher_id=auth.uid() or public.is_admin())
with check (teacher_id=auth.uid() or public.is_admin());

drop policy if exists students_teacher_select on public.students;
drop policy if exists students_teacher_insert on public.students;
drop policy if exists students_teacher_update on public.students;
drop policy if exists students_teacher_delete on public.students;
create policy students_teacher_select on public.students for select to authenticated
using (public.is_admin() or exists(select 1 from public.classes c where c.id=students.class_id and c.teacher_id=auth.uid()));
create policy students_teacher_insert on public.students for insert to authenticated
with check (public.is_admin() or exists(select 1 from public.classes c where c.id=students.class_id and c.teacher_id=auth.uid()));
create policy students_teacher_update on public.students for update to authenticated
using (public.is_admin() or exists(select 1 from public.classes c where c.id=students.class_id and c.teacher_id=auth.uid()))
with check (public.is_admin() or exists(select 1 from public.classes c where c.id=students.class_id and c.teacher_id=auth.uid()));
create policy students_teacher_delete on public.students for delete to authenticated
using (public.is_admin() or exists(select 1 from public.classes c where c.id=students.class_id and c.teacher_id=auth.uid()));

-- 8) CURRICULUM / RPT
drop policy if exists standards_read on public.curriculum_standards;
drop policy if exists standards_write on public.curriculum_standards;
create policy standards_read on public.curriculum_standards for select to authenticated
using (public.is_admin() or exists(select 1 from public.subjects s where s.id=curriculum_standards.subject_id and s.teacher_id=auth.uid()));
create policy standards_write on public.curriculum_standards for all to authenticated
using (public.is_admin() or exists(select 1 from public.subjects s where s.id=curriculum_standards.subject_id and s.teacher_id=auth.uid()))
with check (public.is_admin() or exists(select 1 from public.subjects s where s.id=curriculum_standards.subject_id and s.teacher_id=auth.uid()));

drop policy if exists rpt_read on public.rpt_lessons;
drop policy if exists rpt_write on public.rpt_lessons;
create policy rpt_read on public.rpt_lessons for select to authenticated
using (public.is_admin() or exists(select 1 from public.subjects s where s.id=rpt_lessons.subject_id and s.teacher_id=auth.uid()));
create policy rpt_write on public.rpt_lessons for all to authenticated
using (public.is_admin() or exists(select 1 from public.subjects s where s.id=rpt_lessons.subject_id and s.teacher_id=auth.uid()))
with check (public.is_admin() or exists(select 1 from public.subjects s where s.id=rpt_lessons.subject_id and s.teacher_id=auth.uid()));

-- 9) SOURCE DOCUMENTS / CHUNKS / PAGES
drop policy if exists source_documents_teacher_all on public.source_documents;
create policy source_documents_teacher_all on public.source_documents for all to authenticated
using (teacher_id=auth.uid() or public.is_admin())
with check (teacher_id=auth.uid() or public.is_admin());

drop policy if exists source_chunks_teacher_select on public.source_chunks;
drop policy if exists source_chunks_teacher_insert on public.source_chunks;
drop policy if exists source_chunks_teacher_delete on public.source_chunks;
create policy source_chunks_teacher_select on public.source_chunks for select to authenticated
using (public.is_admin() or exists(select 1 from public.source_documents d where d.id=source_chunks.document_id and d.teacher_id=auth.uid()));
create policy source_chunks_teacher_insert on public.source_chunks for insert to authenticated
with check (public.is_admin() or exists(select 1 from public.source_documents d where d.id=source_chunks.document_id and d.teacher_id=auth.uid()));
create policy source_chunks_teacher_delete on public.source_chunks for delete to authenticated
using (public.is_admin() or exists(select 1 from public.source_documents d where d.id=source_chunks.document_id and d.teacher_id=auth.uid()));

drop policy if exists source_pages_teacher_select on public.source_pages;
drop policy if exists source_pages_teacher_insert on public.source_pages;
drop policy if exists source_pages_teacher_delete on public.source_pages;
create policy source_pages_teacher_select on public.source_pages for select to authenticated
using (public.is_admin() or exists(select 1 from public.source_documents d where d.id=source_pages.document_id and d.teacher_id=auth.uid()));
create policy source_pages_teacher_insert on public.source_pages for insert to authenticated
with check (public.is_admin() or exists(select 1 from public.source_documents d where d.id=source_pages.document_id and d.teacher_id=auth.uid()));
create policy source_pages_teacher_delete on public.source_pages for delete to authenticated
using (public.is_admin() or exists(select 1 from public.source_documents d where d.id=source_pages.document_id and d.teacher_id=auth.uid()));

-- 10) LESSON MAP
drop policy if exists lesson_maps_teacher_all on public.lesson_maps;
create policy lesson_maps_teacher_all on public.lesson_maps for all to authenticated
using (public.is_admin() or (teacher_id=auth.uid() and exists(select 1 from public.subjects s where s.id=subject_id and s.teacher_id=auth.uid())))
with check (public.is_admin() or (teacher_id=auth.uid() and exists(select 1 from public.subjects s where s.id=subject_id and s.teacher_id=auth.uid())));

-- 11) TIMETABLE / TRANSIT / BOOK / RPH / ACTIVITY HISTORY
-- Admin boleh read/manage semua. Guru terhad kepada class sendiri.
drop policy if exists timetable_teacher_all on public.timetable_entries;
create policy timetable_teacher_all on public.timetable_entries for all to authenticated
using (public.is_admin() or teacher_id=auth.uid())
with check (public.is_admin() or (teacher_id=auth.uid() and exists(select 1 from public.classes c where c.id=class_id and c.teacher_id=auth.uid())));

drop policy if exists transit_teacher_all on public.transit_records;
create policy transit_teacher_all on public.transit_records for all to authenticated
using (public.is_admin() or teacher_id=auth.uid())
with check (public.is_admin() or (teacher_id=auth.uid() and exists(select 1 from public.classes c where c.id=class_id and c.teacher_id=auth.uid())));

drop policy if exists book_teacher_all on public.book_checks;
create policy book_teacher_all on public.book_checks for all to authenticated
using (public.is_admin() or teacher_id=auth.uid())
with check (public.is_admin() or (teacher_id=auth.uid() and exists(select 1 from public.classes c where c.id=class_id and c.teacher_id=auth.uid())));

drop policy if exists rph_teacher_all on public.rph_records;
create policy rph_teacher_all on public.rph_records for all to authenticated
using (public.is_admin() or teacher_id=auth.uid())
with check (public.is_admin() or (teacher_id=auth.uid() and exists(select 1 from public.classes c where c.id=class_id and c.teacher_id=auth.uid())));

drop policy if exists rph_activity_teacher_all on public.rph_activity_history;
create policy rph_activity_teacher_all on public.rph_activity_history for all to authenticated
using (public.is_admin() or teacher_id=auth.uid())
with check (public.is_admin() or (teacher_id=auth.uid() and exists(select 1 from public.classes c where c.id=class_id and c.teacher_id=auth.uid())));

-- 12) AUDIT LOG: guru lihat log sendiri; admin lihat semua. Insert sentiasa sebagai diri sendiri.
drop policy if exists audit_teacher_select on public.audit_logs;
drop policy if exists audit_teacher_insert on public.audit_logs;
create policy audit_teacher_select on public.audit_logs for select to authenticated
using (teacher_id=auth.uid() or public.is_admin());
create policy audit_teacher_insert on public.audit_logs for insert to authenticated
with check (teacher_id=auth.uid());

-- 13) PRIVATE STORAGE: folder pertama mesti UID guru; admin boleh akses semua.
drop policy if exists source_files_select_own on storage.objects;
drop policy if exists source_files_insert_own on storage.objects;
drop policy if exists source_files_update_own on storage.objects;
drop policy if exists source_files_delete_own on storage.objects;
create policy source_files_select_own on storage.objects for select to authenticated
using (bucket_id='source-files' and ((storage.foldername(name))[1]=auth.uid()::text or public.is_admin()));
create policy source_files_insert_own on storage.objects for insert to authenticated
with check (bucket_id='source-files' and ((storage.foldername(name))[1]=auth.uid()::text or public.is_admin()));
create policy source_files_update_own on storage.objects for update to authenticated
using (bucket_id='source-files' and ((storage.foldername(name))[1]=auth.uid()::text or public.is_admin()))
with check (bucket_id='source-files' and ((storage.foldername(name))[1]=auth.uid()::text or public.is_admin()));
create policy source_files_delete_own on storage.objects for delete to authenticated
using (bucket_id='source-files' and ((storage.foldername(name))[1]=auth.uid()::text or public.is_admin()));

-- 14) Privileges untuk Data API.
grant usage on schema public to authenticated;
grant select,insert,update,delete on public.subjects,public.classes,public.students,public.curriculum_standards,public.rpt_lessons,public.source_documents,public.source_chunks,public.source_pages,public.timetable_entries,public.transit_records,public.book_checks,public.lesson_maps,public.rph_records,public.rph_activity_history,public.audit_logs to authenticated;
grant usage,select on all sequences in schema public to authenticated;

commit;

-- OPTIONAL: jadikan akaun anda Admin selepas upgrade.
-- Gantikan email di bawah dan jalankan baris UPDATE ini secara berasingan dalam SQL Editor:
-- update public.profiles
-- set role='admin', updated_at=now()
-- where user_id=(select id from auth.users where email='EMAIL_ANDA');

-- e-RPH & PBD Hub v0.3.2 -> v0.3.3
-- GOOGLE OAUTH DELIMa + APPROVAL ADMIN + SESSION LOG + KICK/BLOCK
-- Jalankan SEKALI selepas upgrade v0.3.2.

begin;

-- 1) Medan keselamatan tambahan pada profil.
alter table public.profiles add column if not exists delima_id text;
alter table public.profiles add column if not exists access_status text not null default 'pending' check (access_status in ('pending','allowed','blocked'));
alter table public.profiles add column if not exists force_logout_at timestamptz;

-- 2) Allowlist / approval list. Email disimpan lowercase.
create table if not exists public.authorized_users (
  email text primary key,
  user_id uuid unique references auth.users(id) on delete set null,
  display_name text,
  role text not null default 'teacher' check (role in ('teacher','admin')),
  status text not null default 'pending' check (status in ('pending','allowed','blocked')),
  note text,
  authorized_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint authorized_users_email_lower check (email = lower(email)),
  constraint authorized_users_delima_teacher check (email ~ '^g-[^@]+@moe-dl\.edu\.my$')
);
create index if not exists idx_authorized_users_status on public.authorized_users(status);

-- Existing DELIMa users are kept allowed so the current admin is not locked out.
insert into public.authorized_users(email,user_id,display_name,role,status,created_at,updated_at)
select lower(u.email),u.id,
       coalesce(p.full_name,u.raw_user_meta_data->>'full_name',u.raw_user_meta_data->>'name',split_part(u.email,'@',1)),
       coalesce(p.role,'teacher'),'allowed',now(),now()
from auth.users u
left join public.profiles p on p.user_id=u.id
where lower(coalesce(u.email,'')) ~ '^g-[^@]+@moe-dl\.edu\.my$'
on conflict (email) do update set
  user_id=excluded.user_id,
  display_name=coalesce(public.authorized_users.display_name,excluded.display_name),
  role=coalesce(public.authorized_users.role,excluded.role),
  updated_at=now();

update public.profiles p
set delima_id=split_part(lower(u.email),'@',1),
    access_status=coalesce(a.status,'pending'),
    updated_at=now()
from auth.users u
left join public.authorized_users a on a.email=lower(u.email)
where p.user_id=u.id;

-- 3) Log setiap session aplikasi.
create table if not exists public.login_sessions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  delima_id text,
  full_name text,
  login_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  logout_at timestamptz,
  status text not null default 'active' check (status in ('active','pending','blocked','rejected','logout','kicked')),
  user_agent text,
  platform text
);
create index if not exists idx_login_sessions_user on public.login_sessions(user_id,login_at desc);
create index if not exists idx_login_sessions_last_seen on public.login_sessions(last_seen_at desc);

-- 4) Helper: current Auth identity must be a valid teacher DELIMa and approved.
create or replace function public.is_access_allowed()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists(
    select 1
    from auth.users u
    join public.authorized_users a on a.email=lower(u.email)
    where u.id=auth.uid()
      and lower(u.email) ~ '^g-[^@]+@moe-dl\.edu\.my$'
      and a.status='allowed'
  );
$$;
revoke all on function public.is_access_allowed() from public, anon;
grant execute on function public.is_access_allowed() to authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_access_allowed() and exists(
    select 1 from public.profiles p
    where p.user_id=auth.uid() and p.role='admin'
  );
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- 5) Admin approve / block / role.
create or replace function public.admin_set_user_access(
  target_email text,
  new_status text,
  new_role text default 'teacher',
  new_display_name text default null,
  new_note text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  e text := lower(trim(target_email));
  uid uuid;
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  if e !~ '^g-[^@]+@moe-dl\.edu\.my$' then raise exception 'Only teacher DELIMa g- accounts are allowed'; end if;
  if new_status not in ('pending','allowed','blocked') then raise exception 'Invalid status'; end if;
  if new_role not in ('teacher','admin') then raise exception 'Invalid role'; end if;
  select id into uid from auth.users where lower(email)=e limit 1;
  if uid=auth.uid() and (new_status<>'allowed' or new_role<>'admin') then raise exception 'Admin cannot block or demote own active account'; end if;
  insert into public.authorized_users(email,user_id,display_name,role,status,note,authorized_by,updated_at)
  values(e,uid,new_display_name,new_role,new_status,new_note,auth.uid(),now())
  on conflict (email) do update set
    user_id=coalesce(excluded.user_id,public.authorized_users.user_id),
    display_name=coalesce(excluded.display_name,public.authorized_users.display_name),
    role=excluded.role,status=excluded.status,note=excluded.note,
    authorized_by=auth.uid(),updated_at=now();
  if uid is not null then
    update public.profiles set
      role=new_role,
      access_status=new_status,
      full_name=coalesce(new_display_name,full_name),
      updated_at=now()
    where user_id=uid;
  end if;
end;
$$;
revoke all on function public.admin_set_user_access(text,text,text,text,text) from public, anon;
grant execute on function public.admin_set_user_access(text,text,text,text,text) to authenticated;

create or replace function public.admin_kick_user(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  update public.profiles set force_logout_at=now(),updated_at=now() where user_id=target_user_id;
  update public.login_sessions set status='kicked',logout_at=now(),last_seen_at=now()
   where user_id=target_user_id and logout_at is null;
end;
$$;
revoke all on function public.admin_kick_user(uuid) from public, anon;
grant execute on function public.admin_kick_user(uuid) to authenticated;

-- 6) Before-user-created hook. It rejects every Google/user signup that is not g- DELIMa teacher.
-- Valid g- users are allowed to create an Auth account but start as PENDING until Admin approves.
create or replace function public.hook_restrict_delima_teacher(event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  e text := lower(coalesce(event->'user'->>'email',''));
begin
  if e !~ '^g-[^@]+@moe-dl\.edu\.my$' then
    return jsonb_build_object('error',jsonb_build_object('http_code',403,'message','Hanya ID DELIMa guru g-...@moe-dl.edu.my dibenarkan.'));
  end if;
  return '{}'::jsonb;
end;
$$;
grant execute on function public.hook_restrict_delima_teacher(jsonb) to supabase_auth_admin;
revoke execute on function public.hook_restrict_delima_teacher(jsonb) from authenticated, anon, public;

-- 7) Trigger profile + pending access for newly authenticated g- accounts.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  e text := lower(coalesce(new.email,''));
  n text := coalesce(new.raw_user_meta_data->>'full_name',new.raw_user_meta_data->>'name',split_part(e,'@',1),'Guru');
  st text;
  rr text;
begin
  if e !~ '^g-[^@]+@moe-dl\.edu\.my$' then return new; end if;
  insert into public.authorized_users(email,user_id,display_name,role,status,updated_at)
  values(e,new.id,n,'teacher','pending',now())
  on conflict (email) do update set user_id=new.id,display_name=coalesce(public.authorized_users.display_name,excluded.display_name),updated_at=now();
  select status,role into st,rr from public.authorized_users where email=e;
  insert into public.profiles(user_id,full_name,role,delima_id,access_status)
  values(new.id,n,coalesce(rr,'teacher'),split_part(e,'@',1),coalesce(st,'pending'))
  on conflict (user_id) do update set
    full_name=coalesce(public.profiles.full_name,excluded.full_name),
    delima_id=excluded.delima_id,
    access_status=excluded.access_status,
    role=coalesce(rr,public.profiles.role),updated_at=now();
  insert into public.subjects(teacher_id,code,name) values
    (new.id,'BM','Bahasa Melayu'),(new.id,'PJ','Pendidikan Jasmani'),(new.id,'PK','Pendidikan Kesihatan')
  on conflict (teacher_id,code) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- 8) RLS for access & session tables.
alter table public.authorized_users enable row level security;
alter table public.login_sessions enable row level security;
drop policy if exists authorized_users_read on public.authorized_users;
create policy authorized_users_read on public.authorized_users for select to authenticated
using (public.is_admin() or email=lower(coalesce((select auth.jwt()->>'email'),'')));
drop policy if exists login_sessions_read on public.login_sessions;
drop policy if exists login_sessions_insert on public.login_sessions;
drop policy if exists login_sessions_update on public.login_sessions;
create policy login_sessions_read on public.login_sessions for select to authenticated using (user_id=auth.uid() or public.is_admin());
create policy login_sessions_insert on public.login_sessions for insert to authenticated with check (user_id=auth.uid());
create policy login_sessions_update on public.login_sessions for update to authenticated using (user_id=auth.uid() or public.is_admin()) with check (user_id=auth.uid() or public.is_admin());

grant select on public.authorized_users to authenticated;
grant select,insert,update on public.login_sessions to authenticated;

-- 9) Profile can always be read by self to receive kick/access state. Admin can see all.
drop policy if exists profile_read_self_or_admin on public.profiles;
create policy profile_read_self_or_admin on public.profiles for select to authenticated
using (user_id=auth.uid() or public.is_admin());

-- 10) Harden all curriculum/PBD data: authenticated is NOT enough; approval must be allowed.
drop policy if exists subjects_read on public.subjects;
drop policy if exists subjects_insert_own on public.subjects;
drop policy if exists subjects_update_own on public.subjects;
drop policy if exists subjects_delete_own on public.subjects;
create policy subjects_read on public.subjects for select to authenticated using (public.is_access_allowed() and (teacher_id=auth.uid() or public.is_admin()));
create policy subjects_insert_own on public.subjects for insert to authenticated with check (public.is_access_allowed() and (teacher_id=auth.uid() or public.is_admin()));
create policy subjects_update_own on public.subjects for update to authenticated using (public.is_access_allowed() and (teacher_id=auth.uid() or public.is_admin())) with check (public.is_access_allowed() and (teacher_id=auth.uid() or public.is_admin()));
create policy subjects_delete_own on public.subjects for delete to authenticated using (public.is_access_allowed() and (teacher_id=auth.uid() or public.is_admin()));

drop policy if exists classes_teacher_all on public.classes;
create policy classes_teacher_all on public.classes for all to authenticated using (public.is_access_allowed() and (teacher_id=auth.uid() or public.is_admin())) with check (public.is_access_allowed() and (teacher_id=auth.uid() or public.is_admin()));

drop policy if exists students_teacher_select on public.students; drop policy if exists students_teacher_insert on public.students; drop policy if exists students_teacher_update on public.students; drop policy if exists students_teacher_delete on public.students;
create policy students_teacher_select on public.students for select to authenticated using (public.is_access_allowed() and (public.is_admin() or exists(select 1 from public.classes c where c.id=students.class_id and c.teacher_id=auth.uid())));
create policy students_teacher_insert on public.students for insert to authenticated with check (public.is_access_allowed() and (public.is_admin() or exists(select 1 from public.classes c where c.id=students.class_id and c.teacher_id=auth.uid())));
create policy students_teacher_update on public.students for update to authenticated using (public.is_access_allowed() and (public.is_admin() or exists(select 1 from public.classes c where c.id=students.class_id and c.teacher_id=auth.uid()))) with check (public.is_access_allowed() and (public.is_admin() or exists(select 1 from public.classes c where c.id=students.class_id and c.teacher_id=auth.uid())));
create policy students_teacher_delete on public.students for delete to authenticated using (public.is_access_allowed() and (public.is_admin() or exists(select 1 from public.classes c where c.id=students.class_id and c.teacher_id=auth.uid())));

drop policy if exists standards_read on public.curriculum_standards; drop policy if exists standards_write on public.curriculum_standards;
create policy standards_read on public.curriculum_standards for select to authenticated using (public.is_access_allowed() and (public.is_admin() or exists(select 1 from public.subjects s where s.id=curriculum_standards.subject_id and s.teacher_id=auth.uid())));
create policy standards_write on public.curriculum_standards for all to authenticated using (public.is_access_allowed() and (public.is_admin() or exists(select 1 from public.subjects s where s.id=curriculum_standards.subject_id and s.teacher_id=auth.uid()))) with check (public.is_access_allowed() and (public.is_admin() or exists(select 1 from public.subjects s where s.id=curriculum_standards.subject_id and s.teacher_id=auth.uid())));

drop policy if exists rpt_read on public.rpt_lessons; drop policy if exists rpt_write on public.rpt_lessons;
create policy rpt_read on public.rpt_lessons for select to authenticated using (public.is_access_allowed() and (public.is_admin() or exists(select 1 from public.subjects s where s.id=rpt_lessons.subject_id and s.teacher_id=auth.uid())));
create policy rpt_write on public.rpt_lessons for all to authenticated using (public.is_access_allowed() and (public.is_admin() or exists(select 1 from public.subjects s where s.id=rpt_lessons.subject_id and s.teacher_id=auth.uid()))) with check (public.is_access_allowed() and (public.is_admin() or exists(select 1 from public.subjects s where s.id=rpt_lessons.subject_id and s.teacher_id=auth.uid())));

drop policy if exists source_documents_teacher_all on public.source_documents;
create policy source_documents_teacher_all on public.source_documents for all to authenticated using (public.is_access_allowed() and (teacher_id=auth.uid() or public.is_admin())) with check (public.is_access_allowed() and (teacher_id=auth.uid() or public.is_admin()));

drop policy if exists source_chunks_teacher_select on public.source_chunks; drop policy if exists source_chunks_teacher_insert on public.source_chunks; drop policy if exists source_chunks_teacher_delete on public.source_chunks;
create policy source_chunks_teacher_select on public.source_chunks for select to authenticated using (public.is_access_allowed() and (public.is_admin() or exists(select 1 from public.source_documents d where d.id=source_chunks.document_id and d.teacher_id=auth.uid())));
create policy source_chunks_teacher_insert on public.source_chunks for insert to authenticated with check (public.is_access_allowed() and (public.is_admin() or exists(select 1 from public.source_documents d where d.id=source_chunks.document_id and d.teacher_id=auth.uid())));
create policy source_chunks_teacher_delete on public.source_chunks for delete to authenticated using (public.is_access_allowed() and (public.is_admin() or exists(select 1 from public.source_documents d where d.id=source_chunks.document_id and d.teacher_id=auth.uid())));

drop policy if exists source_pages_teacher_select on public.source_pages; drop policy if exists source_pages_teacher_insert on public.source_pages; drop policy if exists source_pages_teacher_delete on public.source_pages;
create policy source_pages_teacher_select on public.source_pages for select to authenticated using (public.is_access_allowed() and (public.is_admin() or exists(select 1 from public.source_documents d where d.id=source_pages.document_id and d.teacher_id=auth.uid())));
create policy source_pages_teacher_insert on public.source_pages for insert to authenticated with check (public.is_access_allowed() and (public.is_admin() or exists(select 1 from public.source_documents d where d.id=source_pages.document_id and d.teacher_id=auth.uid())));
create policy source_pages_teacher_delete on public.source_pages for delete to authenticated using (public.is_access_allowed() and (public.is_admin() or exists(select 1 from public.source_documents d where d.id=source_pages.document_id and d.teacher_id=auth.uid())));

drop policy if exists lesson_maps_teacher_all on public.lesson_maps;
create policy lesson_maps_teacher_all on public.lesson_maps for all to authenticated using (public.is_access_allowed() and (public.is_admin() or teacher_id=auth.uid())) with check (public.is_access_allowed() and (public.is_admin() or teacher_id=auth.uid()));

drop policy if exists timetable_teacher_all on public.timetable_entries;
create policy timetable_teacher_all on public.timetable_entries for all to authenticated using (public.is_access_allowed() and (public.is_admin() or teacher_id=auth.uid())) with check (public.is_access_allowed() and (public.is_admin() or teacher_id=auth.uid()));
drop policy if exists transit_teacher_all on public.transit_records;
create policy transit_teacher_all on public.transit_records for all to authenticated using (public.is_access_allowed() and (public.is_admin() or teacher_id=auth.uid())) with check (public.is_access_allowed() and (public.is_admin() or teacher_id=auth.uid()));
drop policy if exists book_teacher_all on public.book_checks;
create policy book_teacher_all on public.book_checks for all to authenticated using (public.is_access_allowed() and (public.is_admin() or teacher_id=auth.uid())) with check (public.is_access_allowed() and (public.is_admin() or teacher_id=auth.uid()));
drop policy if exists rph_teacher_all on public.rph_records;
create policy rph_teacher_all on public.rph_records for all to authenticated using (public.is_access_allowed() and (public.is_admin() or teacher_id=auth.uid())) with check (public.is_access_allowed() and (public.is_admin() or teacher_id=auth.uid()));
drop policy if exists rph_activity_teacher_all on public.rph_activity_history;
create policy rph_activity_teacher_all on public.rph_activity_history for all to authenticated using (public.is_access_allowed() and (public.is_admin() or teacher_id=auth.uid())) with check (public.is_access_allowed() and (public.is_admin() or teacher_id=auth.uid()));

drop policy if exists audit_teacher_select on public.audit_logs; drop policy if exists audit_teacher_insert on public.audit_logs;
create policy audit_teacher_select on public.audit_logs for select to authenticated using (public.is_access_allowed() and (teacher_id=auth.uid() or public.is_admin()));
create policy audit_teacher_insert on public.audit_logs for insert to authenticated with check (public.is_access_allowed() and teacher_id=auth.uid());

-- Storage also follows approval status.
drop policy if exists source_files_select_own on storage.objects; drop policy if exists source_files_insert_own on storage.objects; drop policy if exists source_files_update_own on storage.objects; drop policy if exists source_files_delete_own on storage.objects;
create policy source_files_select_own on storage.objects for select to authenticated using (bucket_id='source-files' and public.is_access_allowed() and ((storage.foldername(name))[1]=auth.uid()::text or public.is_admin()));
create policy source_files_insert_own on storage.objects for insert to authenticated with check (bucket_id='source-files' and public.is_access_allowed() and ((storage.foldername(name))[1]=auth.uid()::text or public.is_admin()));
create policy source_files_update_own on storage.objects for update to authenticated using (bucket_id='source-files' and public.is_access_allowed() and ((storage.foldername(name))[1]=auth.uid()::text or public.is_admin())) with check (bucket_id='source-files' and public.is_access_allowed() and ((storage.foldername(name))[1]=auth.uid()::text or public.is_admin()));
create policy source_files_delete_own on storage.objects for delete to authenticated using (bucket_id='source-files' and public.is_access_allowed() and ((storage.foldername(name))[1]=auth.uid()::text or public.is_admin()));

-- 11) Realtime security events.
do $$
begin
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='authorized_users') then
    execute 'alter publication supabase_realtime add table public.authorized_users';
  end if;
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='profiles') then
    execute 'alter publication supabase_realtime add table public.profiles';
  end if;
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='login_sessions') then
    execute 'alter publication supabase_realtime add table public.login_sessions';
  end if;
end $$;

commit;

-- WAJIB SELEPAS SQL:
-- Supabase Dashboard -> Authentication -> Hooks -> Before User Created
-- pilih Postgres Function: public.hook_restrict_delima_teacher
-- Kemudian Authentication -> Providers -> Google -> Enable.
