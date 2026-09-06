#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="$ROOT_DIR/rph-library/backups"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="$BACKUP_DIR/rph-library-$STAMP.sql"

if ! command -v pg_dump >/dev/null 2>&1; then
  echo "pg_dump tidak dijumpai. Ubuntu: apt update && apt install postgresql-client -y"
  exit 1
fi

use_url=false
if [[ -n "${RPH_DATABASE_URL:-}" ]]; then
  use_url=true
else
  missing=()
  [[ -z "${PGHOST:-}" ]] && missing+=(PGHOST)
  [[ -z "${PGUSER:-}" ]] && missing+=(PGUSER)
  [[ -z "${PGDATABASE:-}" ]] && missing+=(PGDATABASE)
  if ((${#missing[@]})); then
    echo "Konfigurasi database belum lengkap: ${missing[*]}"
    exit 1
  fi
fi

run_dump() {
  if $use_url; then
    pg_dump "$RPH_DATABASE_URL" "$@"
  else
    pg_dump "$@"
  fi
}

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR" || true

run_dump \
  --data-only \
  --column-inserts \
  --table=public.rph_activity_library \
  --table=public.rph_induction_library \
  --table=public.rph_subject_pedagogy \
  > "$OUT"

chmod 600 "$OUT" || true

echo "Backup RPH Library siap: $OUT"
