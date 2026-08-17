-- e-RPH & PBD Hub v0.3.3.35 HOTFIX
-- Fix: upsert pada NULL standard_id (Transit) / NULL start_time (Jadual) menghasilkan
-- baris pendua kerana kekangan unique Postgres melayan NULL sebagai berbeza.
-- NULLS NOT DISTINCT menjadikan NULL bercanggah, jadi upsert client (onConflict)
-- boleh mengemaskini rekod sedia ada dan bukannya menambah baris baharu.
--
-- Keperluan: PostgreSQL 15+ (Supabase semasa sudah memenuhi).
-- Jalankan SEKALI pada project yang sudah hidup.

begin;

alter table public.transit_records
  drop constraint if exists transit_records_student_id_subject_id_standard_id_assessment_date_key;
alter table public.transit_records
  add constraint transit_records_student_id_subject_id_standard_id_assessment_date_key
  unique nulls not distinct (student_id, subject_id, standard_id, assessment_date);

alter table public.timetable_entries
  drop constraint if exists timetable_entries_teacher_id_class_id_subject_id_day_of_week_start_time_academic_year_key;
alter table public.timetable_entries
  add constraint timetable_entries_teacher_id_class_id_subject_id_day_of_week_start_time_academic_year_key
  unique nulls not distinct (teacher_id, class_id, subject_id, day_of_week, start_time, academic_year);

commit;
