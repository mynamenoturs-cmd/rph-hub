#!/usr/bin/env python3

from pathlib import Path
import json
import csv
import re
import hashlib

ROOT = Path("rph-library/generated/science-y3/auto-fable")
FINAL = ROOT / "final"
DBCSV = ROOT / "db-audit/existing-science-library.csv"

MASTER = ROOT / "science-y3-activity-library-final.csv"
SQL = ROOT / "science-y3-activity-library-insert-draft.sql"
REPORT = ROOT / "science-y3-library-report.txt"

WEEKS = [w for w in range(2,38) if w != 6]

def norm(v):
    return re.sub(r'\s+', ' ', str(v or '')).strip()

def slug(v):
    v = v.lower()
    v = re.sub(r'[^a-z0-9]+', '_', v)
    return v.strip('_')[:45]

def sqlq(v):
    return "'" + str(v).replace("'", "''") + "'"

# ---------------------------------------------------
# 1. READ 35 VALID WEEK JSON FILES
# ---------------------------------------------------

rows = []
missing = []

for week in WEEKS:
    p = FINAL / f"week-{week:02d}.json"

    if not p.exists():
        missing.append(week)
        continue

    arr = json.loads(p.read_text(encoding="utf-8"))

    by_session = {
        int(x["session"]): x
        for x in arr
        if isinstance(x, dict) and "session" in x
    }

    if sorted(by_session) != [1,2]:
        missing.append(week)
        continue

    for session in (1,2):
        x = by_session[session]

        diff = (
            f"Peneroka: {norm(x.get('peneroka'))}; "
            f"Pembina: {norm(x.get('pembina'))}; "
            f"Pencabar: {norm(x.get('pencabar'))}"
        )

        rows.append({
            "week": week,
            "session": session,
            "activity_name": norm(x.get("activity_name")),
            "phase": norm(x.get("phase")),
            "pdp_method": norm(x.get("pdp_method")),
            "materials": norm(x.get("materials")),
            "differentiation": diff,
            "pbd_evidence": norm(x.get("pbd_evidence")),
        })

if missing:
    raise SystemExit(f"STOP: minggu tidak lengkap: {missing}")

if len(rows) != 70:
    raise SystemExit(f"STOP: dijangka 70 sesi, diterima {len(rows)}")

# ---------------------------------------------------
# 2. READ EXISTING SUPABASE LIBRARY
# ---------------------------------------------------

existing = []

if DBCSV.exists():
    with DBCSV.open(encoding="utf-8", errors="ignore") as fh:
        existing = list(csv.DictReader(fh))

existing_keys = {
    norm(r.get("activity_key")).lower()
    for r in existing
    if norm(r.get("activity_key"))
}

existing_signatures = set()

for r in existing:
    name = norm(r.get("activity_name")).lower()
    template = norm(r.get("activity_template")).lower()

    if name:
        existing_signatures.add((name, template))

# ---------------------------------------------------
# 3. DEDUPLICATE NEW 70 SESSIONS
# ---------------------------------------------------

unique = []
duplicate_internal = []
duplicate_db = []
seen = set()

for r in rows:
    signature = (
        r["activity_name"].lower(),
        r["pdp_method"].lower()
    )

    if signature in seen:
        duplicate_internal.append(r)
        continue

    seen.add(signature)

    digest = hashlib.sha1(
        (
            f"{r['week']}|{r['session']}|"
            f"{r['activity_name']}|{r['pdp_method']}"
        ).encode("utf-8")
    ).hexdigest()[:8]

    key = (
        f"science_y3_"
        f"w{r['week']:02d}_s{r['session']}_"
        f"{slug(r['activity_name'])}_{digest}"
    )

    r["activity_key"] = key

    if (
        key.lower() in existing_keys
        or signature in existing_signatures
    ):
        duplicate_db.append(r)
        continue

    unique.append(r)

# ---------------------------------------------------
# 4. WRITE FINAL CSV
# ---------------------------------------------------

fields = [
    "activity_key",
    "week",
    "session",
    "activity_name",
    "phase",
    "pdp_method",
    "materials",
    "differentiation",
    "pbd_evidence",
]

with MASTER.open("w", encoding="utf-8", newline="") as fh:
    w = csv.DictWriter(fh, fieldnames=fields)
    w.writeheader()
    w.writerows(unique)

# ---------------------------------------------------
# 5. BUILD SQL DRAFT ONLY
# ---------------------------------------------------

with SQL.open("w", encoding="utf-8") as fh:

    fh.write("-- SAINS TAHUN 3 ACTIVITY LIBRARY\n")
    fh.write("-- DRAFT SAHAJA - JANGAN RUN TERUS\n")
    fh.write("-- DATABASE_WRITE=OFF\n\n")

    for r in unique:

        example = (
            f"Minggu {r['week']} Sesi {r['session']}. "
            f"{r['pbd_evidence']} "
            f"{r['differentiation']}"
        )

        fh.write(
            "INSERT INTO public.rph_activity_library (\n"
            "  activity_key,\n"
            "  language_code,\n"
            "  phase,\n"
            "  activity_name,\n"
            "  activity_template,\n"
            "  bbm_template,\n"
            "  year_min,\n"
            "  year_max,\n"
            "  is_game,\n"
            "  priority,\n"
            "  active,\n"
            "  subject_key,\n"
            "  activity_type,\n"
            "  example_text,\n"
            "  requires_source,\n"
            "  selection_weight\n"
            ") VALUES (\n"
            f"  {sqlq(r['activity_key'])},\n"
            "  'ms',\n"
            f"  {sqlq(r['phase'])},\n"
            f"  {sqlq(r['activity_name'])},\n"
            f"  {sqlq(r['pdp_method'])},\n"
            f"  {sqlq(r['materials'])},\n"
            "  3,\n"
            "  3,\n"
            "  false,\n"
            "  50,\n"
            "  true,\n"
            "  'science',\n"
            "  'classroom_activity',\n"
            f"  {sqlq(example)},\n"
            "  true,\n"
            "  1\n"
            ");\n\n"
        )

# ---------------------------------------------------
# 6. REPORT
# ---------------------------------------------------

report = [
    "SAINS TAHUN 3 - ACTIVITY LIBRARY FINAL",
    "=======================================",
    f"Input session            : {len(rows)}",
    f"Existing Science rows    : {len(existing)}",
    f"Duplicate dalam batch    : {len(duplicate_internal)}",
    f"Duplicate dengan DB      : {len(duplicate_db)}",
    f"Candidate baru final     : {len(unique)}",
    "",
    f"CSV      : {MASTER}",
    f"SQL DRAFT: {SQL}",
    "",
    "SUPABASE WRITE: OFF",
]

REPORT.write_text("\n".join(report) + "\n", encoding="utf-8")

print("\n".join(report))
