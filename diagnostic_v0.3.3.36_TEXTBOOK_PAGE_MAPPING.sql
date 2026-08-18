-- ============================================================
-- DIAGNOSTIC (READ-ONLY): Textbook page mapping — English Y2
-- (Super Minds) & Bahasa Melayu Y2 (Jilid 1/2)
-- SELECT only. Tiada INSERT/UPDATE/DELETE/DROP/ALTER/CREATE.
-- Selamat untuk paste ke Supabase SQL Editor.
-- ============================================================

-- ------------------------------------------------------------
-- 1) RPT lessons untuk dua subjek (minggu/tajuk/SP/aktiviti/rujukan BT)
--    Filter: nama subjek mengandungi Bahasa Melayu / English
-- ------------------------------------------------------------
select
  l.subject_id,
  s.name as subject,
  l.year,
  l.week_no,
  l.title,
  left(l.sp, 120) as sp,
  left(l.suggested_activities, 150) as activities,
  l.textbook_ref,
  l.source_ref
from public.rpt_lessons l
join public.subjects s on s.id = l.subject_id
where s.name ilike '%bahasa melayu%'
   or s.name ilike '%english%'
   or s.name ilike '%bahasa inggeris%'
order by l.week_no, l.title;

-- ------------------------------------------------------------
-- 2) Source documents untuk dua subjek (jenis + nama fail)
-- ------------------------------------------------------------
select
  id,
  source_type,
  file_name,
  subject_id,
  year,
  page_count,
  extraction_status,
  extracted_chars,
  created_at
from public.source_documents
where file_name ilike '%super minds%'
   or file_name ilike '%bahasa melayu%tahun%2%'
   or file_name ilike '%english%tahun%2%'
   or file_name ilike '%bm%tahun%2%'
   or file_name ilike '%jilid%'
order by source_type, file_name;

-- ------------------------------------------------------------
-- 3) PDF page -> printed page mapping untuk dua subjek
--    metadata->>'printed_page' = nombor bercetak jika disimpan
--    (offset = printed - pdf_page; null jika tidak disimpan)
-- ------------------------------------------------------------
select
  p.document_id,
  d.file_name,
  p.page_no as pdf_page,
  (p.metadata->>'printed_page')::numeric as printed_page_meta,
  case when (p.metadata->>'printed_page')::numeric is not null
       then (p.metadata->>'printed_page')::numeric - p.page_no
       else null end as offset_meta,
  left(p.content, 60) as content_start
from public.source_pages p
join public.source_documents d on d.id = p.document_id
where d.file_name ilike '%super minds%'
   or d.file_name ilike '%bahasa melayu%tahun%2%'
   or d.file_name ilike '%english%tahun%2%'
   or d.file_name ilike '%bm%tahun%2%'
   or d.file_name ilike '%jilid%'
order by d.file_name, p.page_no
limit 400;

-- ------------------------------------------------------------
-- 4) Lesson Maps sedia ada untuk dua subjek
--    (halaman yang dipilih + kaedah mapping + skor)
-- ------------------------------------------------------------
select
  m.subject_id,
  s.name as subject,
  m.year,
  m.academic_year,
  m.week_no,
  m.session_no,
  m.verification_status,
  m.confidence_score,
  m.textbook_page_start,
  m.textbook_page_end,
  m.source_evidence->'meta'->>'textbook_mapping_method' as mapping_method,
  m.source_evidence->'meta'->>'textbook_mapping_confidence' as mapping_confidence,
  m.source_evidence->'meta'->>'page_route_method' as page_route_method,
  m.source_evidence->'meta'->>'page_route_verified' as page_route_verified,
  m.source_evidence->'meta'->>'page_candidate_range' as page_candidate_range,
  m.source_evidence->'meta'->>'unit_range' as unit_range,
  left(m.title, 60) as title
from public.lesson_maps m
join public.subjects s on s.id = m.subject_id
where s.name ilike '%bahasa melayu%'
   or s.name ilike '%english%'
   or s.name ilike '%bahasa inggeris%'
order by m.academic_year desc, m.week_no, m.session_no;

-- ------------------------------------------------------------
-- 5) Rujukan halaman Buku Teks yang ditulis dalam RPT
--    (textbook_ref) — bandingkan dengan halaman yang dipilih
-- ------------------------------------------------------------
select
  l.week_no,
  l.title,
  l.textbook_ref,
  left(l.suggested_activities, 150) as activities
from public.rpt_lessons l
join public.subjects s on s.id = l.subject_id
where (s.name ilike '%bahasa melayu%'
    or s.name ilike '%english%'
    or s.name ilike '%bahasa inggeris%')
  and l.textbook_ref is not null
  and l.textbook_ref <> ''
order by l.week_no, l.title;
