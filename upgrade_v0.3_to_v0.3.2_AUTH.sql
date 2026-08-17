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
