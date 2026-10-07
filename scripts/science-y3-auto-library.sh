#!/usr/bin/env bash
set -euo pipefail

ROOT="/data/data/com.termux/files/home/rph-hub"
OUT="$ROOT/rph-library/generated/science-y3"
PROMPTS="$OUT/prompts"

MODEL="openai/xyrz/claude-fable-5"
TEXTBOOK_ID="7b53f6b1-c1d4-4949-a20d-b1ff49c55707"
SUBJECT_ID="87568239-8070-4328-93a4-c131eb4e7d4d"

mkdir -p "$OUT" "$PROMPTS"

cd "$ROOT"

# Minggu yang BUKAN PdP biasa
skip_week() {
  case "$1" in
    1|6|38|39|40|41|42|43) return 0 ;;
    *) return 1 ;;
  esac
}

for WEEK in $(seq 2 37); do

  if skip_week "$WEEK"; then
    echo "SKIP Minggu $WEEK"
    continue
  fi

  FINAL="$OUT/week-$(printf '%02d' "$WEEK").md"
  PROMPT="$PROMPTS/week-$(printf '%02d' "$WEEK").txt"

  echo
  echo "======================================"
  echo " SAINS TAHUN 3 - MINGGU $WEEK"
  echo "======================================"

  # Ambil Lesson Map sebenar jika sudah tersedia.
  MAP=$(
    psql -At -F $'\t' -c "
      select
        week_no,
        session_no,
        coalesce(title,''),
        coalesce(sk,''),
        coalesce(sp,''),
        coalesce(textbook_page_start::text,''),
        coalesce(textbook_page_end::text,''),
        coalesce(source_activities,''),
        coalesce(source_evidence::text,''),
        coalesce(verification_status,'')
      from public.lesson_maps
      where subject_id='$SUBJECT_ID'
        and year=3
        and academic_year=2026
        and week_no=$WEEK
      order by session_no;
    "
  )

  # Jangan reka session mapping jika Lesson Map belum wujud.
  if [ -z "$MAP" ]; then
    echo "Minggu $WEEK: Lesson Map sebenar belum tersedia."
    printf "MINGGU %s\nSTATUS: MAPPING_REQUIRED\n" "$WEEK" > "$FINAL"
    continue
  fi

  # Senarai halaman bercetak daripada Lesson Map.
  PAGES=$(
    psql -At -c "
      select distinct textbook_page_start
      from public.lesson_maps
      where subject_id='$SUBJECT_ID'
        and year=3
        and academic_year=2026
        and week_no=$WEEK
        and textbook_page_start is not null
      order by textbook_page_start;
    "
  )

  OCR=""

  while read -r PRINTED; do
    [ -z "$PRINTED" ] && continue

    # Sains Tahun 3: PDF page = printed page + 8
    PDFPAGE=$((PRINTED + 8))

    PAGE_TEXT=$(
      psql -At -c "
        select coalesce(content,'')
        from public.source_pages
        where document_id='$TEXTBOOK_ID'
          and page_no=$PDFPAGE
        limit 1;
      "
    )

    OCR+="

===== BUKU TEKS M/S $PRINTED =====
$PAGE_TEXT
"
  done <<< "$PAGES"

  cat > "$PROMPT" <<EOF
SAINS TAHUN 3 — MINGGU $WEEK

MODE READ-ONLY / LIBRARY DESIGN ONLY.

JANGAN:
- edit kod aplikasi
- ubah Lesson Map
- ubah Supabase
- INSERT/UPDATE/DELETE
- commit
- push
- cipta SK/SP
- cipta halaman buku
- cipta kandungan buku

LESSON MAP SEBENAR:
$MAP

TEKS BUKU YANG DIAMBIL UNTUK PENGESAHAN:
$OCR

PERATURAN SOURCE-FIRST:

RPT/Lesson Map menentukan minggu, sesi dan SK/SP.
Buku Teks menentukan isi/tugasan.
Library menentukan CARA PdP.

JANGAN paparkan dalam RPH akhir istilah teknikal seperti:
OCR
source task
source evidence
source_pages
page_no
metadata
hasil ekstrak
aktiviti sumber
berdasarkan sumber

Istilah itu hanya untuk proses dalaman.

Jadual sebenar Sains = 2 sesi seminggu.

Gunakan HANYA sesi yang benar-benar terdapat dalam LESSON MAP di atas.
Jika data sesi tidak lengkap, nyatakan NEEDS_MAPPING.
JANGAN meneka.

UNTUK SETIAP SESI HASILKAN:

1. Tajuk / SK / SP / Buku Teks
2. Set Induksi 3–5 minit
3. Aliran Aktiviti PdP realistik
4. PAK-21/permainan jika sesuai
5. Kelompok Peneroka
6. Kelompok Pembina
7. Kelompok Pencabar
8. PBD berdasarkan evidens boleh diperhatikan
9. Penutup
10. Candidate Activity Library rows

SESI 1 dan SESI 2 mesti berbeza dari segi CARA PdP.

Jika kedua-dua sesi menggunakan kandungan sama:
Sesi 1 = penerokaan/pemahaman
Sesi 2 = aplikasi/pengukuhan

Jangan cipta label TP1/TP2/TP3 tanpa DSKP yang disahkan.

Aktiviti mesti seperti guru sebenar mengendalikan kelas.
Elakkan boilerplate AI.

Gunakan gaya benchmark Sains Tahun 3 Minggu 37.

Had jawapan: 1200 patah perkataan.

Berhenti selepas Minggu $WEEK.
EOF

  # SETIAP ITERASI = AIDER BARU = CONTEXT BARU
  aider \
    --model "$MODEL" \
    --message-file "$PROMPT" \
    --map-tokens 0 \
    --no-git \
    --no-auto-commits \
    --dry-run \
    --no-stream \
    --no-pretty \
    --no-detect-urls \
    --no-show-model-warnings \
    > "$FINAL" 2>&1 || {
      echo "FAILED Minggu $WEEK"
      echo "STATUS: FAILED" >> "$FINAL"
      continue
    }

  echo "SIAP -> $FINAL"

done

echo
echo "======================================"
echo "BATCH SELESAI"
echo "======================================"
echo "Output:"
echo "$OUT"
