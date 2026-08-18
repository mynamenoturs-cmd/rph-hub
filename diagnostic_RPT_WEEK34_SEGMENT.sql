-- ============================================================
-- DIAGNOSTIC (READ-ONLY): Petik teks di sekitar "Week 34"
-- dari chunk RPT English Y2 (Rozayus Academy)
-- SELECT sahaja. Selamat untuk Supabase SQL Editor.
-- ============================================================

-- ------------------------------------------------------------
-- 1) Teks di sekitar "Week 34" (normalize spasi dahulu)
--    Tunjuk 350 aksara sebelum + 1600 aksara selepas marker
-- ------------------------------------------------------------
select
  d.file_name,
  c.chunk_no,
  length(c.content) as chunk_len,
  substring(
    regexp_replace(c.content, '\s+', ' ', 'g')
    from greatest(1, strpos(lower(regexp_replace(c.content, '\s+', ' ', 'g')), 'week 34') - 350)
    for 1600
  ) as around_week_34
from public.source_chunks c
join public.source_documents d on d.id = c.document_id
where d.source_type = 'rpt'
  and d.file_name ilike '%english%'
  and lower(regexp_replace(c.content, '\s+', ' ', 'g')) like '%week 34%';

-- ------------------------------------------------------------
-- 2) Senarai semua chunk dokumen RPT English (struktur chunking)
-- ------------------------------------------------------------
select
  d.file_name,
  c.chunk_no,
  length(c.content) as chunk_len,
  left(c.content, 90) as start_text
from public.source_chunks c
join public.source_documents d on d.id = c.document_id
where d.source_type = 'rpt'
  and d.file_name ilike '%english%'
order by d.file_name, c.chunk_no
limit 60;

-- ------------------------------------------------------------
-- 3) Petik teks di sekitar "Week 32", "Week 33", "Week 35", "Week 36"
--    untuk lihat corak rujukan halaman merentas minggu
-- ------------------------------------------------------------
select
  d.file_name,
  marker.week_label,
  substring(
    regexp_replace(c.content, '\s+', ' ', 'g')
    from greatest(1, strpos(lower(regexp_replace(c.content, '\s+', ' ', 'g')), marker.week_label) - 120)
    for 500
  ) as segment
from public.source_chunks c
join public.source_documents d on d.id = c.document_id
cross join lateral (values
  ('week 32'), ('week 33'), ('week 35'), ('week 36')
) as marker(week_label)
where d.source_type = 'rpt'
  and d.file_name ilike '%english%'
  and lower(regexp_replace(c.content, '\s+', ' ', 'g')) like '%' || marker.week_label || '%'
order by marker.week_label;
