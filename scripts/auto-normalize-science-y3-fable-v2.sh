#!/usr/bin/env bash
set -u

ROOT="/data/data/com.termux/files/home/rph-hub"
SRC="$ROOT/rph-library/generated/science-y3/final-candidates"
AUTO="$ROOT/rph-library/generated/science-y3/auto-fable"

FINAL="$AUTO/final"
PROMPTS="$AUTO/prompts"
LOGS="$AUTO/logs"

VALIDATOR="$ROOT/scripts/validate-science-y3-fable-json.py"
REPAIR="$ROOT/scripts/repair-fable-log-json.py"

MODEL="openai/xyrz/claude-fable-5"
MAX_NEW_ATTEMPTS=2

mkdir -p "$FINAL" "$PROMPTS" "$LOGS"

[ -f "$AUTO/CONFIG" ] && source "$AUTO/CONFIG"
[ -f /root/.xyrus-models.sh ] && source /root/.xyrus-models.sh

export PYTHONIOENCODING=utf-8
export PYTHONUTF8=1
export LANG=C.UTF-8

cd "$ROOT"

if [ "${DATABASE_WRITE:-OFF}" != "OFF" ]; then
    echo "STOP: DATABASE_WRITE mesti OFF"
    exit 1
fi

if [ "$#" -eq 0 ] || [ "$1" = "all" ]; then
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
    echo " AUTO FABLE V2 — M$WEEK"
    echo "========================================"

    if [ ! -f "$SOURCE" ]; then
        echo "❌ SOURCE TIADA M$WEEK"
        continue
    fi

    # --------------------------------------------------
    # 1. Kalau final sedia ada valid -> SKIP
    # --------------------------------------------------

    if [ -f "$RESULT" ]; then
        TMP="$AUTO/.check-$WW.json"

        if python3 "$VALIDATOR" \
            check "$RESULT" "$TMP" "$WEEK" >/dev/null 2>&1; then

            mv "$TMP" "$RESULT"
            echo "✅ M$WEEK FINAL SUDAH VALID — SKIP"
            continue
        fi

        rm -f "$TMP"
    fi

    # --------------------------------------------------
    # 2. Cuba SELAMATKAN semua log lama dahulu
    # --------------------------------------------------

    SAVED=0

    for LOG in "$LOGS"/week-"$WW"-attempt-*.log; do
        [ -f "$LOG" ] || continue

        TMPJSON="$AUTO/.repair-$WW.json"

        echo "Cuba salvage $(basename "$LOG")..."

        if python3 "$REPAIR" "$LOG" "$TMPJSON" >/dev/null 2>&1; then

            if python3 "$VALIDATOR" \
                check "$TMPJSON" "$RESULT" "$WEEK" >/dev/null 2>&1; then

                echo "✅ M$WEEK DISALVAGE DARIPADA LOG LAMA"
                rm -f "$TMPJSON"
                SAVED=1
                break
            fi
        fi

        rm -f "$TMPJSON"
    done

    [ "$SAVED" -eq 1 ] && continue

    # --------------------------------------------------
    # 3. Hanya sekarang Fable dibenarkan dipanggil
    # --------------------------------------------------

    PROMPT="$PROMPTS/week-$WW-v2.txt"

    cat > "$PROMPT" <<EOP
Normalisasikan Activity Library daripada RPH Sains Tahun 3 Minggu $WEEK.

JANGAN ubah fakta, SK, SP atau maksud kandungan.
Gunakan aktiviti yang memang terdapat dalam RPH ini.

OUTPUT WAJIB:
JSON ARRAY SAHAJA.
Tepat dua objek: session 1 dan session 2.
Tiada markdown, tiada nota, tiada code fence.

SCHEMA:

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

Sesi 1 dan Sesi 2 mesti berbeza CARA PdP.

DILARANG:
OCR
source task
source evidence
source_pages
LOCAL_PROPOSED
LOCAL_VERIFIED
aktiviti sumber
berdasarkan sumber

===== RPH =====

$(cat "$SOURCE")

===== TAMAT RPH =====

JSON ARRAY SAHAJA:
EOP

    # Nombor attempt baharu — jangan overwrite log lama.
    LAST=$(
      find "$LOGS" -maxdepth 1 \
        -name "week-$WW-attempt-*.log" \
        2>/dev/null |
      sed -n 's/.*attempt-\([0-9][0-9]*\)\.log/\1/p' |
      sort -n |
      tail -1
    )

    [ -z "$LAST" ] && LAST=0

    OK=0

    for N in $(seq 1 "$MAX_NEW_ATTEMPTS"); do

        ATTEMPT=$((LAST + N))
        LOG="$LOGS/week-$WW-attempt-$ATTEMPT.log"
        TMPJSON="$AUTO/.new-$WW.json"

        echo "🤖 Fable M$WEEK attempt $ATTEMPT..."

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
          > "$LOG" 2>&1 || true

        # Repair output dahulu.
        if python3 "$REPAIR" "$LOG" "$TMPJSON" >/dev/null 2>&1; then

            if python3 "$VALIDATOR" \
                check "$TMPJSON" "$RESULT" "$WEEK"; then

                echo "✅ M$WEEK S1+S2 PASS"
                rm -f "$TMPJSON"
                OK=1
                break
            fi
        fi

        rm -f "$TMPJSON"
        echo "⚠️ M$WEEK attempt $ATTEMPT gagal"

        sleep 2
    done

    if [ "$OK" -ne 1 ]; then
        echo "❌ M$WEEK masih gagal — akan boleh resume kemudian"
    fi

done

echo
echo "========================================"
echo " COVERAGE"
echo "========================================"

PASS=0

for W in $(seq 2 37); do

    [ "$W" -eq 6 ] && continue

    WW=$(printf '%02d' "$W")
    F="$FINAL/week-$WW.json"
    TMP="$AUTO/.coverage-$WW.json"

    if [ -f "$F" ] && \
       python3 "$VALIDATOR" \
       check "$F" "$TMP" "$W" >/dev/null 2>&1; then

        mv "$TMP" "$F"
        echo "✅ M$W S1,S2"
        PASS=$((PASS + 1))
    else
        rm -f "$TMP"
        echo "❌ M$W"
    fi
done

echo
echo "MINGGU PASS = $PASS / 35"
echo "SESI PASS   = $((PASS * 2)) / 70"

if [ "$PASS" -eq 35 ]; then
    echo "✅ AUTO_FABLE_70_SESSION_PASS"
fi
