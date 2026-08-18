-- ============================================================
-- DIAGNOSTIC (READ-ONLY): Status pengekstrakan RPT English Y2
-- 1) Adakah extraction selesai / penuh?
-- 2) Adakah marker rujukan halaman wujud dalam teks terpakai?
-- SELECT sahaja. Selamat untuk Supabase SQL Editor.
-- ============================================================

-- ------------------------------------------------------------
-- A) Status pengekstrakan dokumen RPT English
-- ------------------------------------------------------------
select
  id,
  file_name,
  extraction_status,
  extracted_chars,
  page_count,
  metadata->>'ocr' as ocr_flag,
  left(metadata::text, 300) as metadata_preview
from public.source_documents
where file_name ilike '%english%';

-- ------------------------------------------------------------
-- B) Kehadiran marker rujukan halaman dalam setiap chunk RPT
--    (TRUE = marker wujud dalam teks terpakai)
-- ------------------------------------------------------------
select
  d.file_name,
  c.chunk_no,
  (lower(c.content) like '%superminds%')  as has_superminds,
  (lower(c.content) like '%111%')         as has_111,
  (lower(c.content) like '%lesson%')      as has_lesson,
  (lower(c.content) like '%p.1%')         as has_p_ref,
  (lower(c.content) like '%m/s%')         as has_ms_ref,
  (lower(c.content) like '%student%')     as has_student_book,
  (lower(c.content) like '%week 34%')     as has_week_34,
  (lower(c.content) like '%week 3 4%')    as has_week_34_spaced
from public.source_chunks c
join public.source_documents d on d.id = c.document_id
where d.source_type = 'rpt'
  and d.file_name ilike '%english%'
order by d.file_name, c.chunk_no;

-- ------------------------------------------------------------
-- C) Jumlah keseluruhan aksara RPT yang diekstrak
--    (rujukan: RPT Rozayus setahun penuh biasanya > 80KB teks)
-- ------------------------------------------------------------
select
  d.file_name,
  sum(length(c.content)) as total_chars_extracted,
  count(*) as chunk_count
from public.source_chunks c
join public.source_documents d on d.id = c.document_id
where d.source_type = 'rpt'
  and d.file_name ilike '%english%'
group by d.file_name;
