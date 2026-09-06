#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LIB_DIR="$ROOT_DIR/rph-library"
QUERY="${*:-}"

if [[ -z "$QUERY" ]]; then
  echo "Guna: ./scripts/rphlib-search.sh <kata kunci>"
  echo "Contoh: ./scripts/rphlib-search.sh 'Kotak Beracun'"
  exit 1
fi

if [[ ! -d "$LIB_DIR" ]]; then
  echo "Folder rph-library belum ada. Jalankan ./scripts/sync-rph-library.sh dahulu."
  exit 1
fi

if command -v rg >/dev/null 2>&1; then
  rg -n -i --max-count 80 --glob '*.csv' -- "$QUERY" "$LIB_DIR" || true
else
  grep -Rni -m 80 --include='*.csv' -- "$QUERY" "$LIB_DIR" || true
fi
