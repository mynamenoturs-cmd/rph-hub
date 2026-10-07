#!/usr/bin/env bash
set -euo pipefail

ROOT="/data/data/com.termux/files/home/rph-hub"
OUT="$ROOT/rph-library/generated/science-y3"
PROMPTS="$OUT/mapping-prompts"
PARTS="$OUT/mapping-parts"

MODEL="openai/xyrz/claude-fable-5"
SUBJECT_ID="87568239-8070-4328-93a4-c131eb4e7d4d"
RPT_ID="c85d242e-e6f6-4390-99a4-4255c5c6b2ad"

mkdir -p "$PROMPTS" "$PARTS"
cd "$ROOT"

make_batch () {
  START="$1"
  END="$2"
  CHUNKS="$3"

  NAME="${START}-${END}"
  PROMPT="$PROMPTS/map-${NAME}.txt"
  RESULT="$PARTS/map-${NAME}.txt"

  echo "======================================"
  echo " LOCAL MAPPING SAINS Y3 M${START}-M${END}"
  echo "======================================"

  RPT=$(
    psql -At -c "
      select content
      from public.source_chunks
      where document_id='$RPT_ID'
        and chunk_no in ($CHUNKS)
      order by chunk_no;
    "
  )

  EXISTING=$(
    psql -At -F $'\t' -c "
      select
        week_no,
        session_no,
        coalesce(title,''),
        coalesce(sk,''),
        coalesce(sp,''),
        coalesce(textbook_page_start::text,''),
        coalesce(verification_status,'')
      from public.lesson_maps
      where subject_id='$SUBJECT_ID'
        and year=3
        and academic_year=2026
        and week_no between $START and $END
      order by week_no,session_no;
    "
  )

  cat > "$PROMPT" <<EOF
BINA LOCAL MAPPING MANIFEST SAINS TAHUN 3 2026.

MODE READ-ONLY.

JANGAN:
- edit Supabase
- INSERT/UPDATE/DELETE
- ubah lesson_maps
- ubah kod aplikasi
- commit
- push
- bina RPH
- bina Activity Library lagi

Jadual sebenar guru:
SAINS TAHUN 3 = 2 SESI SEMINGGU.

RPT mempunyai S1-S5 sebagai SOURCE POOL.
S1-S5 BUKAN lima waktu sebenar.

TUGAS:
Bina dua sesi sebenar bagi Minggu $START hingga Minggu $END sahaja.

RPT SUMBER:
$RPT

LESSON MAP SEDIA ADA:
$EXISTING

PERATURAN:

1. Kekalkan row Lesson Map yang sudah VERIFIED.
2. Row needs_review boleh digunakan sebagai petunjuk tetapi semak dengan RPT.
3. Kekalkan urutan SP daripada RPT.
4. Jangan cipta SP.
5. Jangan cipta halaman Buku Teks.
6. Semua SP penting dalam minggu/unit perlu diagihkan secara munasabah kepada dua sesi.
7. Jika beberapa SP perlu digabung dalam satu sesi, tulis:
   10.1.4 + 10.1.5
8. Jika dua sesi menggunakan SP sama kerana RPT hanya mempunyai satu fokus, dibenarkan:
   Sesi 1 = introduction/penerokaan
   Sesi 2 = guided/application/pengukuhan.
9. Minggu cuti/orientasi/UASA jangan dipaksa menjadi PdP.
10. Jika benar-benar tidak dapat disahkan, gunakan status NEEDS_REVIEW.
11. Jangan gunakan lima source-pool sessions sebagai lima waktu guru.

OUTPUT WAJIB:
JANGAN beri penerangan.
JANGAN markdown table.

Hanya TSV dengan header tepat:

week	session	title	sk	sp	textbook_page	stage	status

Contoh bentuk:
3	1	Memerhati	1.1	1.1.1	2	introduction	LOCAL_PROPOSED
3	2	Memerhati	1.1	1.1.1	2	application	LOCAL_PROPOSED

Hasilkan hanya Minggu $START hingga $END.
EOF

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
    > "$RESULT" 2>&1 || true

  echo "Siap: $RESULT"
}

# Batch kecil supaya XYRUS/Fable tidak kena context limit.
make_batch 3 5 "0,1"
make_batch 7 11 "1"
make_batch 13 16 "1,2"
make_batch 23 27 "2"
make_batch 28 32 "2,3"
make_batch 33 37 "3"

echo
echo "SEMUA LOCAL MAPPING PARTS SIAP:"
ls -1 "$PARTS"
