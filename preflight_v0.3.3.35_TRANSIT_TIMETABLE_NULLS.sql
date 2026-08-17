-- ============================================================
-- PREFLIGHT for hotfix_v0.3.3.35_TRANSIT_TIMETABLE_NULLS.sql
-- READ-ONLY: SELECT only. Detects existing duplicate rows that
-- would make the new UNIQUE NULLS NOT DISTINCT constraints fail.
-- ============================================================

-- ------------------------------------------------------------
-- CHECK 1: transit_records duplicates
-- Would violate:
--   UNIQUE NULLS NOT DISTINCT (student_id, subject_id, standard_id, assessment_date)
-- NOTE: GROUP BY treats NULLs as one group, exactly matching the
-- new NULLS NOT DISTINCT semantics.
-- ------------------------------------------------------------
select
  student_id,
  subject_id,
  standard_id,           -- NULL here groups together under the new constraint
  assessment_date,
  count(*) as duplicate_count
from public.transit_records
group by student_id, subject_id, standard_id, assessment_date
having count(*) > 1
order by duplicate_count desc, assessment_date;

-- ------------------------------------------------------------
-- CHECK 2: timetable_entries duplicates
-- Would violate:
--   UNIQUE NULLS NOT DISTINCT (teacher_id, class_id, subject_id,
--                              day_of_week, start_time, academic_year)
-- ------------------------------------------------------------
select
  teacher_id,
  class_id,
  subject_id,
  day_of_week,
  start_time,            -- NULL here groups together under the new constraint
  academic_year,
  count(*) as duplicate_count
from public.timetable_entries
group by teacher_id, class_id, subject_id, day_of_week, start_time, academic_year
having count(*) > 1
order by duplicate_count desc, day_of_week, start_time;

-- ------------------------------------------------------------
-- CHECK 3 (diagnostic): unique constraints currently on both tables
-- Lets you confirm the constraint names in the hotfix match your DB,
-- and whether the migration was already applied.
-- ------------------------------------------------------------
select
  conrelid::regclass as table_name,
  conname,
  contype            -- 'u' = unique constraint
from pg_constraint
where conrelid in ('public.transit_records'::regclass, 'public.timetable_entries'::regclass)
  and contype = 'u'
order by table_name, conname;

-- ------------------------------------------------------------
-- CHECK 4 (diagnostic): how many rows actually use NULL keys
-- rows_with_null_key > 0 means the bug's NULL path is in use and
-- the fix is relevant; 0 means the fix is harmless but still safe.
-- ------------------------------------------------------------
select
  'transit_records' as table_name,
  count(*) as total_rows,
  count(*) filter (where standard_id is null) as rows_with_null_key
from public.transit_records
union all
select
  'timetable_entries',
  count(*),
  count(*) filter (where start_time is null)
from public.timetable_entries;

-- ------------------------------------------------------------
-- CHECK 5 (optional): list the actual row ids of duplicate transit
-- records, newest first (rn = 1 is the "keep" candidate). Helps you
-- decide what to delete BEFORE re-running the hotfix.
-- ------------------------------------------------------------
select
  id,
  student_id,
  subject_id,
  standard_id,
  assessment_date,
  created_at,
  row_number() over (
    partition by student_id, subject_id, standard_id, assessment_date
    order by created_at desc
  ) as keep_rank
from public.transit_records
where (student_id, subject_id, standard_id, assessment_date) in (
  select student_id, subject_id, standard_id, assessment_date
  from public.transit_records
  group by student_id, subject_id, standard_id, assessment_date
  having count(*) > 1
)
order by student_id, subject_id, assessment_date, keep_rank;
