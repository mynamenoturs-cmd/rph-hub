#!/usr/bin/env bash
set -u

DIR="rph-library/generated/science-y3/final-candidates"
FAIL=0

echo "=== QUALITY GATE SAINS TAHUN 3 ==="

for W in $(seq 2 37); do

  [ "$W" -eq 6 ] && continue

  F="$DIR/week-$(printf '%02d' "$W").md"

  if [ ! -f "$F" ]; then
    echo "FAIL M$W -> fail tiada"
    FAIL=1
    continue
  fi

  if ! grep -q "GEN_OK" "$F"; then
    echo "FAIL M$W -> GEN_OK tiada"
    FAIL=1
  fi

  S1=$(grep -Eic \
    '"session"[[:space:]]*:[[:space:]]*1|SESI[[:space:]]*1|Sesi 1' "$F")

  S2=$(grep -Eic \
    '"session"[[:space:]]*:[[:space:]]*2|SESI[[:space:]]*2|Sesi 2' "$F")

  if [ "$S1" -eq 0 ] || [ "$S2" -eq 0 ]; then
    echo "FAIL M$W -> sesi tidak lengkap S1=$S1 S2=$S2"
    FAIL=1
  fi

  for K in Peneroka Pembina Pencabar; do
    if ! grep -qi "$K" "$F"; then
      echo "FAIL M$W -> $K tiada"
      FAIL=1
    fi
  done

  if grep -Eqi \
    'OCR|teks OCR|dialog OCR|source task|source evidence|source_pages|page_no|LOCAL_PROPOSED|LOCAL_VERIFIED|metadata|hasil ekstrak|aktiviti sumber|berdasarkan sumber' \
    "$F"; then

    echo "FAIL M$W -> bahasa teknikal masih ada"
    FAIL=1
  fi

  if grep -Eqi '\bTP[1-6]\b|TP[1-6]-TP[1-6]' "$F"; then
    echo "FAIL M$W -> TP tidak disahkan masih ada"
    FAIL=1
  fi

done

echo

if [ "$FAIL" -eq 0 ]; then
  echo "QUALITY_GATE_PASS"
  echo "35 minggu / 70 sesi lulus."
else
  echo "QUALITY_GATE_FAIL"
  exit 1
fi
