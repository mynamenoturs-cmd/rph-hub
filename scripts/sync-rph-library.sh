#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="$ROOT_DIR/rph-library"

if ! command -v psql >/dev/null 2>&1; then
  echo "psql tidak dijumpai. Ubuntu: apt update && apt install postgresql-client -y"
  exit 1
fi

if [[ -z "${RPH_DATABASE_URL:-}" ]]; then
  echo "RPH_DATABASE_URL belum diset."
  echo "Simpan connection string Supabase dalam /root/.rph-db, kemudian source fail itu."
  exit 1
fi

mkdir -p "$OUT_DIR"
chmod 700 "$OUT_DIR" || true

export_csv() {
  local table="$1"
  local file="$OUT_DIR/${table}.csv"
  echo "Export $table -> $file"
  psql "$RPH_DATABASE_URL" -v ON_ERROR_STOP=1 -c "\\copy (select * from public.${table} order by 1) to '${file}' with (format csv, header true, encoding 'UTF8')"
}

export_csv rph_activity_library
export_csv rph_induction_library
export_csv rph_subject_pedagogy

psql "$RPH_DATABASE_URL" -At -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$OUT_DIR/schema.tsv"
select table_name,column_name,data_type,is_nullable
from information_schema.columns
where table_schema='public'
  and table_name in ('rph_activity_library','rph_induction_library','rph_subject_pedagogy')
order by table_name,ordinal_position;
SQL

psql "$RPH_DATABASE_URL" -At -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$OUT_DIR/counts.tsv"
select 'rph_activity_library',count(*) from public.rph_activity_library
union all
select 'rph_induction_library',count(*) from public.rph_induction_library
union all
select 'rph_subject_pedagogy',count(*) from public.rph_subject_pedagogy;
SQL

cat > "$OUT_DIR/README.txt" <<'TXT'
LOCAL RPH LIBRARY SNAPSHOT FOR AIDER

Files:
- rph_activity_library.csv
- rph_induction_library.csv
- rph_subject_pedagogy.csv
- schema.tsv
- counts.tsv

These files are local snapshots of Supabase and are intentionally ignored by git.
Use scripts/rphlib-search.sh to search them without adding the full multi-megabyte dataset to Aider context.
Run scripts/sync-rph-library.sh again whenever the Supabase library changes.
TXT

chmod 600 "$OUT_DIR"/* || true

echo
echo "RPH library sync siap."
cat "$OUT_DIR/counts.tsv"
echo
echo "Cari data dengan: ./scripts/rphlib-search.sh \"keyword\""
