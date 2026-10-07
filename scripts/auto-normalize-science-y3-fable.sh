#!/usr/bin/env bash
set -u

ROOT="/data/data/com.termux/files/home/rph-hub"

SRC="$ROOT/rph-library/generated/science-y3/final-candidates"
AUTO="$ROOT/rph-library/generated/science-y3/auto-fable"

FINAL="$AUTO/final"
PROMPTS="$AUTO/prompts"
LOGS="$AUTO/logs"

VALIDATOR="$ROOT/scripts/validate-science-y3-fable-json.py"

MODEL="openai/xyrz/claude-fable-5"
MAX_RETRY=2

CONFIG="$AUTO/CONFIG"

mkdir -p "$FINAL" "$PROMPTS" "$LOGS"

[ -f "$CONFIG" ] && source "$CONFIG"

[ -f /root/.xyrus-models.sh ] && \
    source /root/.xyrus-models.sh

export PYTHONIOENCODING=utf-8
export PYTHONUTF8=1
export LANG=C.UTF-8

cd "$ROOT"

if [ "${DATABASE_WRITE:-OFF}" != "OFF" ]; then
    echo "STOP: DATABASE_WRITE mesti OFF."
    exit 1
fi

if [ "$#" -eq 0 ]; then
    echo "Guna:"
    echo "  $0 37"
    echo "  $0 3 4 5"
    echo "  $0 all"
    exit 0
fi

if [ "$1" = "all" ]; then
    WEEKS=""
    for W in $(seq 2 37); do
        [ "$W" -eq 6 ] && continue
        WEEKS="$WEEKS $W"
    done
else
    WEEKS="$*"
fi

for WEEK in $WEEKS; do

    WW=$(printf '%02d' "$WEEK")

    SOURCE="$SRC/week-$WW.md"
    RESULT="$FINAL/week-$WW.json"

    echo
    echo "========================================"
    echo " AUTO FABLE — SAINS TAHUN 3 M$WEEK"
    echo "========================================"

    if [ ! -f "$SOURCE" ]; then
        echo "FAIL: $SOURCE tidak dijumpai."
        continue
    fi

    if ! grep -q "GEN_OK" "$SOURCE"; then
        echo "FAIL: week-$WW.md bukan GEN_OK."
        continue
    fi

    # Resume.
    if [ -f "$RESULT" ]; then

        TMP_CHECK="$AUTO/.check-$WW.json"

        if python3 "$VALIDATOR" \
            check "$RESULT" "$TMP_CHECK" "$WEEK" \
            >/dev/null 2>&1; then

            mv "$TMP_CHECK" "$RESULT"

            echo "SKIP M$WEEK -> JSON sudah lulus"
            continue
        fi

        rm -f "$TMP_CHECK"
    fi

    BASE_PROMPT="$PROMPTS/week-$WW.txt"

    cat > "$BASE_PROMPT" <<EOP
Anda ialah NORMALIZER Activity Library.

TUGAS:
Baca kandungan RPH Sains Tahun 3 Minggu $WEEK di bawah.

Kandungan tersebut sudah melalui semakan sumber.
JANGAN mengubah SK, SP, fakta kurikulum atau maksud aktiviti.

Cari:
- aktiviti Sesi 1
- aktiviti Sesi 2
- Candidate Activity Library Row jika ada
- jika format candidate berbeza, normalisasikan maklumat yang sama

Jika Candidate Row tidak lengkap tetapi aliran PdP sesi jelas,
bentuk satu Activity Library row reusable daripada aktiviti sesi tersebut
TANPA mencipta fakta kurikulum baharu.

WAJIB bezakan CARA PdP antara Sesi 1 dan Sesi 2.

OUTPUT WAJIB:
HANYA JSON ARRAY.
Tepat 2 objek.
Tiada markdown.
Tiada code fence.
Tiada penerangan sebelum atau selepas JSON.

SCHEMA WAJIB:

[
  {
    "week": $WEEK,
    "session": 1,
    "activity_name": "...",
    "phase": "...",
    "pdp_method": "...",
    "materials": "...",
    "peneroka": "...",
    "pembina": "...",
    "pencabar": "...",
    "pbd_evidence": "...",
    "reusable": true
  },
  {
    "week": $WEEK,
    "session": 2,
    "activity_name": "...",
    "phase": "...",
    "pdp_method": "...",
    "materials": "...",
    "peneroka": "...",
    "pembina": "...",
    "pencabar": "...",
    "pbd_evidence": "...",
    "reusable": true
  }
]

DILARANG muncul dalam nilai output:
OCR
teks OCR
dialog OCR
source task
source evidence
source_pages
page_no
LOCAL_PROPOSED
LOCAL_VERIFIED
metadata
hasil ekstrak
aktiviti sumber
berdasarkan sumber
VERIFIED diterima

Gunakan bahasa guru sebenar.
Activity Library menentukan CARA PdP, bukan mencipta ISI kurikulum.

==============================
RPH MINGGU $WEEK
==============================

$(cat "$SOURCE")

==============================
AKHIR RPH
==============================

RESPONS SEKARANG:
JSON ARRAY SAHAJA.
EOP

    OK=0
    TOTAL_ATTEMPTS=$((MAX_RETRY + 1))

    for ATTEMPT in $(seq 1 "$TOTAL_ATTEMPTS"); do

        RAW="$LOGS/week-$WW-attempt-$ATTEMPT.log"
        TRY_PROMPT="$PROMPTS/week-$WW-attempt-$ATTEMPT.txt"

        cp "$BASE_PROMPT" "$TRY_PROMPT"

        if [ "$ATTEMPT" -gt 1 ]; then
            cat >> "$TRY_PROMPT" <<EOP

RETRY $ATTEMPT:
Respons sebelumnya gagal validator.

Pastikan:
- JSON array tulen
- tepat dua objek
- session 1 dan 2
- semua field mempunyai nilai
- tiada markdown
- tiada nota
- S1 dan S2 menggunakan cara PdP berbeza
EOP
        fi

        echo "Fable M$WEEK attempt $ATTEMPT/$TOTAL_ATTEMPTS ..."

        aider \
          --model "$MODEL" \
          --message-file "$TRY_PROMPT" \
          --map-tokens 0 \
          --no-git \
          --no-auto-commits \
          --dry-run \
          --no-stream \
          --no-pretty \
          --no-detect-urls \
          --no-show-model-warnings \
          > "$RAW" 2>&1 || true

        if python3 "$VALIDATOR" \
            extract "$RAW" "$RESULT" "$WEEK"; then

            OK=1
            echo "✅ M$WEEK S1+S2 PASS"
            break
        fi

        echo "⚠️ M$WEEK attempt $ATTEMPT gagal"

        sleep 2
    done

    if [ "$OK" -ne 1 ]; then
        echo "❌ M$WEEK gagal selepas $TOTAL_ATTEMPTS percubaan"
    fi

done

echo
echo "========================================"
echo " BUILD MASTER"
echo "========================================"

python3 - <<'PY'
from pathlib import Path
import json
import csv

base = Path(
    "rph-library/generated/science-y3/auto-fable"
)

src = base / "final"

weeks = [
    w for w in range(2, 38)
    if w != 6
]

rows = []
missing = []

for w in weeks:

    p = src / f"week-{w:02d}.json"

    if not p.exists():
        missing.append(w)
        continue

    try:
        arr = json.loads(
            p.read_text(encoding="utf-8")
        )
    except Exception:
        missing.append(w)
        continue

    sessions = {
        int(x["session"])
        for x in arr
        if isinstance(x, dict)
        and "session" in x
    }

    if sessions != {1, 2}:
        missing.append(w)
        continue

    for x in arr:

        rows.append({
            "week": int(x["week"]),
            "session": int(x["session"]),
            "activity_name": x["activity_name"],
            "phase": x["phase"],
            "pdp_method": x["pdp_method"],
            "materials": x["materials"],
            "peneroka": x["peneroka"],
            "pembina": x["pembina"],
            "pencabar": x["pencabar"],
            "pbd_evidence": x["pbd_evidence"],
            "reusable": x.get("reusable", True),
        })

rows.sort(
    key=lambda x: (
        x["week"],
        x["session"]
    )
)

csv_path = base / "science-y3-activity-library-master.csv"
jsonl_path = base / "science-y3-activity-library-master.jsonl"

fields = [
    "week",
    "session",
    "activity_name",
    "phase",
    "pdp_method",
    "materials",
    "peneroka",
    "pembina",
    "pencabar",
    "pbd_evidence",
    "reusable",
]

with csv_path.open(
    "w",
    encoding="utf-8",
    newline=""
) as fh:

    writer = csv.DictWriter(
        fh,
        fieldnames=fields
    )

    writer.writeheader()
    writer.writerows(rows)

with jsonl_path.open(
    "w",
    encoding="utf-8"
) as fh:

    for row in rows:
        fh.write(
            json.dumps(
                row,
                ensure_ascii=False
            ) + "\n"
        )

print("Minggu lengkap :", len(weeks) - len(missing), "/ 35")
print("Sesi lengkap   :", len(rows), "/ 70")

if missing:
    print("Belum siap     :", missing)
else:
    print("✅ AUTO_FABLE_MASTER_PASS")

print("CSV :", csv_path)
PY
