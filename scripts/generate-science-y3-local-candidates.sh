#!/usr/bin/env bash
set -euo pipefail

ROOT="/data/data/com.termux/files/home/rph-hub"
MAP="$ROOT/rph-library/generated/science-y3/science-y3-local-mapping.tsv"
OUT="$ROOT/rph-library/generated/science-y3/final-candidates"
PROMPTS="$OUT/prompts"

MODEL="openai/xyrz/claude-fable-5"
TEXTBOOK_ID="7b53f6b1-c1d4-4949-a20d-b1ff49c55707"
SUBJECT_ID="87568239-8070-4328-93a4-c131eb4e7d4d"

export PYTHONIOENCODING=utf-8
export PYTHONUTF8=1

mkdir -p "$OUT" "$PROMPTS"
cd "$ROOT"

if [ ! -f "$MAP" ]; then
    echo "ERROR: local mapping tidak dijumpai."
    exit 1
fi

LINES=$(wc -l < "$MAP")

if [ "$LINES" -ne 55 ]; then
    echo "ERROR: manifest sepatutnya 55 baris tetapi sekarang $LINES."
    exit 1
fi

if [ "$#" -eq 0 ]; then
    echo "Contoh:"
    echo "bash scripts/generate-science-y3-local-candidates.sh 3 4 5"
    exit 0
fi

for WEEK in "$@"; do

    echo
    echo "======================================"
    echo " SAINS TAHUN 3 - MINGGU $WEEK"
    echo "======================================"

    FINAL="$OUT/week-$(printf '%02d' "$WEEK").md"
    PROMPT="$PROMPTS/week-$(printf '%02d' "$WEEK").txt"

    # Resume-safe: jangan ulang minggu yang sudah berjaya.
    if [ -f "$FINAL" ] && grep -q "GEN_OK" "$FINAL"; then
        echo "SKIP: Minggu $WEEK sudah siap."
        continue
    fi

    LOCAL_MAP=$(
      awk -F '\t' -v w="$WEEK" '
        NR>1 && $1==w {print}
      ' "$MAP"
    )

    COUNT=$(
      awk -F '\t' -v w="$WEEK" '
        NR>1 && $1==w {c++}
        END {print c+0}
      ' "$MAP"
    )

    SESSIONS=$(
      awk -F '\t' -v w="$WEEK" '
        NR>1 && $1==w {print $2}
      ' "$MAP" | sort -n | paste -sd, -
    )

    if [ "$COUNT" -ne 2 ] || [ "$SESSIONS" != "1,2" ]; then
        echo "ERROR: M$WEEK mapping tidak lengkap: $SESSIONS"
        continue
    fi

    # Jika ada mapping VERIFIED production, ia mengatasi cadangan lokal.
    VERIFIED=$(
      psql -At -F $'\t' -c "
        select
          week_no,
          session_no,
          coalesce(title,''),
          coalesce(sk,''),
          coalesce(sp,''),
          coalesce(textbook_page_start::text,''),
          coalesce(progression_stage,''),
          verification_status
        from public.lesson_maps
        where subject_id='$SUBJECT_ID'
          and year=3
          and academic_year=2026
          and week_no=$WEEK
          and verification_status='verified'
        order by session_no;
      " || true
    )

    # Ambil halaman bercetak daripada local mapping.
    PAGE_SPECS=$(
      awk -F '\t' -v w="$WEEK" '
        NR>1 && $1==w && $6!="" {print $6}
      ' "$MAP" | sort -u
    )

    BOOK=""

    for SPEC in $PAGE_SPECS; do

        SPEC="${SPEC//–/-}"

        if [[ "$SPEC" =~ ^([0-9]+)-([0-9]+)$ ]]; then

            START="${BASH_REMATCH[1]}"
            END="${BASH_REMATCH[2]}"

            for ((PRINTED=START; PRINTED<=END; PRINTED++)); do

                PDFPAGE=$((PRINTED + 8))

                TEXT=$(
                  psql -At -c "
                    select coalesce(content,'')
                    from public.source_pages
                    where document_id='$TEXTBOOK_ID'
                      and page_no=$PDFPAGE
                    limit 1;
                  " || true
                )

                BOOK+="
===== BUKU TEKS M/S $PRINTED =====
$TEXT
"
            done

        elif [[ "$SPEC" =~ ^[0-9]+$ ]]; then

            PRINTED="$SPEC"
            PDFPAGE=$((PRINTED + 8))

            TEXT=$(
              psql -At -c "
                select coalesce(content,'')
                from public.source_pages
                where document_id='$TEXTBOOK_ID'
                  and page_no=$PDFPAGE
                limit 1;
              " || true
            )

            BOOK+="
===== BUKU TEKS M/S $PRINTED =====
$TEXT
"
        fi
    done

    cat > "$PROMPT" <<EOP
SAINS TAHUN 3 — MINGGU $WEEK

TUGAS:
Hasilkan candidate RPH Activity Library untuk DUA SESI sebenar minggu ini.

MODE READ-ONLY / CANDIDATE ONLY.

JANGAN:
- edit fail aplikasi
- edit Lesson Map
- INSERT/UPDATE/DELETE Supabase
- commit
- push
- cipta SK/SP
- cipta halaman buku
- cipta fakta buku teks

LOCAL 2-SESSION MAPPING:
$LOCAL_MAP

MAPPING PRODUCTION YANG SUDAH VERIFIED:
$VERIFIED

PERATURAN:
Jika terdapat row VERIFIED untuk sesi yang sama,
row VERIFIED mengatasi LOCAL_PROPOSED.

TEKS BUKU TEKS UNTUK PENGESAHAN:
$BOOK

PRINSIP WAJIB:

RPT / DSKP / Buku Teks menentukan ISI.
Activity Library menentukan CARA PdP.

JANGAN sebut istilah teknikal berikut dalam RPH akhir:
OCR
teks OCR
dialog OCR
source task
source evidence
source_pages
page_no
metadata
hasil ekstrak
aktiviti sumber
berdasarkan sumber
LOCAL_PROPOSED
LOCAL_VERIFIED

Tulis seperti guru sebenar menulis RPH.

Untuk SETIAP SESI hasilkan:

1. Tajuk
2. SK
3. SP
4. Buku Teks
5. Set Induksi 3–5 minit
6. Aliran Aktiviti PdP langkah demi langkah
7. PAK-21 / permainan jika benar-benar sesuai
8. Kelompok Peneroka
9. Kelompok Pembina
10. Kelompok Pencabar
11. PBD
12. Penutup
13. Candidate Activity Library rows

SESI 1 dan SESI 2 mesti berbeza CARA PdP.

Jika kandungan/SP sama:
- Sesi 1 = penerokaan / pemahaman
- Sesi 2 = aplikasi / pengukuhan

PDP TERBEZA WAJIB:

Kelompok Peneroka:
- bimbingan
- petunjuk
- bahan sokongan

Kelompok Pembina:
- tugasan standard

Kelompok Pencabar:
- pengayaan
- justifikasi
- KBAT yang masih berkait dengan SP

PBD:
JANGAN cipta TP1/TP2/TP3/TP4/TP5/TP6.
Gunakan evidens yang dapat diperhatikan guru:
respons lisan,
hasil kerja,
papan mini,
jadual,
pembentangan,
demonstrasi,
atau evidens sesuai dengan aktiviti.

Aktiviti aplikasi guru boleh menggunakan situasi/objek kelas sebenar,
tetapi JANGAN gambarkan perkara tambahan itu sebagai kandungan asal Buku Teks.

Elakkan boilerplate:
"murid meneliti bahan"
"murid melaksanakan aktiviti sumber"
"berdasarkan sumber"
"murid melengkapkan tugasan asal"

Aktiviti mesti konkrit dan realistik seperti:
Kotak Beracun,
Radio Rosak,
Kerusi Panas,
Bola Soalan,
Pancing Soalan,
stesen,
relay,
kad padanan,
papan mini,
atau mekanik lain HANYA jika sesuai dengan task.

Jangan paksa permainan.

Candidate Activity Library rows perlu menyediakan CARA PdP yang reusable,
bukan menghardcode fakta kurikulum secara berlebihan.

Berhenti selepas Minggu $WEEK.
Had jawapan sekitar 1200 patah perkataan.
EOP

    echo "Panggil Fable..."

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
      > "$FINAL" 2>&1 || true

    if grep -Eqi \
      "has hit a token limit|RateLimitError|APIError|Traceback" \
      "$FINAL"; then

        echo "FAILED M$WEEK"
        printf '\n<!-- GEN_FAILED -->\n' >> "$FINAL"

    else

        printf '\n<!-- GEN_OK -->\n' >> "$FINAL"
        echo "SIAP M$WEEK -> $FINAL"

    fi

    sleep 2

done
