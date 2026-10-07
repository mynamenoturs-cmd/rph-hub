#!/usr/bin/env bash

set -u

cd /data/data/com.termux/files/home/rph-hub \
|| exit 1

source .venv/bin/activate
source /root/.xyrus-models.sh

LOG="/tmp/science-y2-rowwise.log"

echo "======================================"
echo " SAINS TAHUN 2 — FULL AUTO"
echo "======================================"

RECOVERY_COUNT=0

while true
do

    echo
    echo "▶ ROWWISE / RESUME"
    echo

    : > "$LOG"

    set +e

    PYTHONUNBUFFERED=1 python -u \
    scripts/fable-science-y2-rowwise.py \
    2>&1 | tee "$LOG"

    RC=${PIPESTATUS[0]}

    set -e


    # ==================================
    # COMPLETE
    # ==================================

    if [ "$RC" -eq 0 ]; then

        echo
        echo "======================================"
        echo "✅ SCIENCE Y2 FULL AUTO COMPLETE"
        echo "AUTO RECOVERIES = $RECOVERY_COUNT"
        echo "======================================"

        exit 0
    fi


    # ==================================
    # DETECT STOP
    # ==================================

    STOP_ROW=$(
        sed -nE \
        's/.*STOP M([0-9]+) S([0-9]+).*/\1 \2/p' \
        "$LOG" \
        | tail -1
    )


    if [ -z "$STOP_ROW" ]; then

        echo
        echo "❌ STOP row tidak dapat dikenal pasti."
        echo "LOG: $LOG"

        exit 1
    fi


    read -r WEEK SESSION <<< "$STOP_ROW"

    echo
    echo "======================================"
    echo "⚠️ AUTO RECOVERY M${WEEK} S${SESSION}"
    echo "======================================"


    # Elak infinite loop
    RECOVERY_COUNT=$((RECOVERY_COUNT + 1))


    if [ "$RECOVERY_COUNT" -gt 72 ]; then

        echo "❌ Recovery loop melebihi had."
        exit 1
    fi


    # ==================================
    # LOCAL-DIFF RECOVERY
    # ==================================

    set +e

    python \
    scripts/recover-science-y2-auto-local.py \
    "$WEEK" "$SESSION"

    REC_RC=$?

    set -e


    if [ "$REC_RC" -ne 0 ]; then

        echo
        echo "❌ AUTO RECOVERY gagal:"
        echo "M${WEEK} S${SESSION}"

        exit 1
    fi


    echo
    echo "✅ Cache recovery siap."
    echo "↻ Resume automatik..."
    echo

    sleep 1

done
