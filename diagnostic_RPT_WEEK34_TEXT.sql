-- ============================================================
-- DIAGNOSTIC (READ-ONLY): Teks mentah RPT English Y2 minggu 32-36
-- Tujuan: lihat format sebenar rujukan halaman Superminds
-- dalam RPT minggu-per-halaman, supaya regex dapat dibetulkan.
-- SELECT sahaja. Selamat untuk Supabase SQL Editor.
-- ============================================================

select
  c.document_id,
  d.file_name,
  c.chunk_no,
  left(c.content, 900) as chunk_text
from public.source_chunks c
join public.source_documents d on d.id = c.document_id
join public.subjects s on s.id = d.subject_id
where d.source_type = 'rpt'
  and (s.name ilike '%english%' or s.name ilike '%bahasa inggeris%')
  and d.year = 2
  and (
       c.content ilike '%week 32%'
    or c.content ilike '%week 33%'
    or c.content ilike '%week 34%'
    or c.content ilike '%week 35%'
    or c.content ilike '%week 36%'
  )
order by c.chunk_no
limit 40;
