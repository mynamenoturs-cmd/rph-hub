#!/usr/bin/env bash
set -euo pipefail

ROOT="/data/data/com.termux/files/home/rph-hub"
DIR="$ROOT/rph-library/generated/science-y3"
PARTS="$DIR/mapping-parts"
OUT="$DIR/science-y3-local-mapping.tsv"
TMP="$DIR/.mapping-clean.tmp"

cd "$ROOT"
: > "$TMP"
printf 'week\tsession\ttitle\tsk\tsp\ttextbook_page\tstage\tstatus\n' > "$OUT"

for FILE in "$PARTS"/map-*.txt; do
  echo "Bersihkan: $(basename "$FILE")"
  awk '
    /^```tsv[[:space:]]*$/ {inside=1; next}
    /^```[[:space:]]*$/ && inside {inside=0; next}
    inside {print}
  ' "$FILE" \
  | sed '/^[[:space:]]*$/d' \
  | sed '/^week[[:space:]]/d' \
  >> "$TMP"
done

awk -F '\t' '
  $1 ~ /^[0-9]+$/ &&
  $2 ~ /^[12]$/ &&
  NF >= 8
' "$TMP" \
| sort -t $'\t' -k1,1n -k2,2n \
>> "$OUT"

rm -f "$TMP"

echo
echo "=== VALIDASI LOCAL MAPPING ==="

EXPECTED="3 4 5 7 8 9 10 11 13 14 15 16 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37"
FAIL=0

for W in $EXPECTED; do
  COUNT=$(awk -F '\t' -v w="$W" '$1==w {c++} END{print c+0}' "$OUT")
  SESSIONS=$(awk -F '\t' -v w="$W" '$1==w {print $2}' "$OUT" | sort -n | tr '\n' ',' | sed 's/,$//')

  if [ "$COUNT" -eq 2 ] && [ "$SESSIONS" = "1,2" ]; then
    echo "PASS Minggu $W -> S1,S2"
  else
    echo "FAIL Minggu $W -> rows=$COUNT sessions=$SESSIONS"
    FAIL=1
  fi
done

echo
if [ "$FAIL" -eq 0 ]; then
  echo "SEMUA LOCAL MAPPING LULUS"
  echo "Manifest: $OUT"
else
  echo "ADA MAPPING BELUM LENGKAP"
  echo "Jangan generate Activity Library dahulu."
  exit 1
fi
