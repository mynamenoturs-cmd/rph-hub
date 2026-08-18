-- ============================================================
-- DIAGNOSTIC (READ-ONLY): Cari halaman DETAIL RPT English Y2
-- yang mengandungi rujukan halaman Superminds / Lesson numbers
-- SELECT sahaja. Selamat untuk Supabase SQL Editor.
-- ============================================================

-- ------------------------------------------------------------
-- 1) Senarai SEMUA chunk dokumen RPT English (inventori)
--    Tunjuk berapa banyak chunk & di mana content bermula
-- ------------------------------------------------------------
select
  d.file_name,
  c.chunk_no,
  length(c.content) as chunk_len,
  left(regexp_replace(c.content, '\s+', ' ', 'g'), 100) as chunk_start
from public.source_chunks c
join public.source_documents d on d.id = c.document_id
where d.source_type = 'rpt'
  and d.file_name ilike '%english%'
order by d.file_name, c.chunk_no
limit 100;

-- ------------------------------------------------------------
-- 2) Chunk yang mengandungi "superminds" / "111" / "lesson 137"
--    + petik teks di sekeliling marker pertama yang dijumpai
-- ------------------------------------------------------------
with norm as (
  select
    c.document_id,
    d.file_name,
    c.chunk_no,
    regexp_replace(c.content, '\s+', ' ', 'g') as txt
  from public.source_chunks c
  join public.source_documents d on d.id = c.document_id
  where d.source_type = 'rpt'
    and d.file_name ilike '%english%'
)
select
  n.file_name,
  n.chunk_no,
  marker.marker,
  substring(
    n.txt
    from greatest(1, strpos(lower(n.txt), marker.marker) - 200)
    for 1500
  ) as segment
from norm n
cross join lateral (values
  ('superminds'), ('111-113'), ('111'), ('lesson 137')
) as marker(marker)
where strpos(lower(n.txt), marker.marker) > 0
order by n.file_name, n.chunk_no, marker.marker;
