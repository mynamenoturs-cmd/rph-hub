#!/usr/bin/env python3

from pathlib import Path
import csv
import re
import unicodedata
from difflib import SequenceMatcher

ROOT = Path("rph-library/generated/science-y1")

NEW = ROOT / "science-y1-activity-library-CLEAN-v1.csv"
OLD = ROOT / "db-audit/existing-science-y1.csv"

FINAL = ROOT / "science-y1-activity-library-FINAL-v1.csv"
REVIEW = ROOT / "science-y1-dedup-review.csv"
SQL = ROOT / "science-y1-activity-library-INSERT-FINAL-DRAFT-v1.sql"
AUDIT = ROOT / "science-y1-final-dedup-audit.txt"


def clean(v):
    return re.sub(r"\s+", " ", str(v or "")).strip()


def norm(v):
    s = clean(v).lower()

    s = "".join(
        c for c in unicodedata.normalize("NFKD", s)
        if not unicodedata.combining(c)
    )

    # Abaikan page dalam perbandingan nama
    s = re.sub(
        r"\b(?:buku\s+teks\s*)?"
        r"m\s*/\s*s\s*\d+(?:\s*[-–]\s*\d+)?",
        " ",
        s
    )

    s = re.sub(r"[^a-z0-9]+", " ", s)

    return re.sub(r"\s+", " ", s).strip()


def similarity(a, b):
    a = norm(a)
    b = norm(b)

    if not a or not b:
        return 0.0

    return SequenceMatcher(None, a, b).ratio()


def sqlq(v):
    if v is None:
        return "NULL"

    return "'" + str(v).replace("'", "''") + "'"


if not NEW.exists():
    raise SystemExit(f"❌ CLEAN CSV tiada: {NEW}")

if not OLD.exists():
    raise SystemExit(f"❌ DB snapshot tiada: {OLD}")


new_rows = list(csv.DictReader(
    NEW.open(encoding="utf-8")
))

old_rows = list(csv.DictReader(
    OLD.open(encoding="utf-8")
))

print("INPUT CLEAN =", len(new_rows))
print("EXISTING DB =", len(old_rows))


old_keys = {
    clean(r.get("activity_key"))
    for r in old_rows
}

old_names = {}

for r in old_rows:
    old_names.setdefault(
        norm(r.get("activity_name")),
        []
    ).append(r)


safe = []
review = []
exact = []


for idx, r in enumerate(new_rows, 1):

    key = clean(r.get("activity_key"))
    name = clean(r.get("activity_name"))
    method = clean(r.get("pdp_method"))

    print(
        f"[{idx:02d}/{len(new_rows)}] "
        f"M{int(r['week']):02d} S{r['session']} "
        f"{name}"
    )

    # Exact key
    if key and key in old_keys:
        exact.append({
            **r,
            "dedup_reason": "EXACT_ACTIVITY_KEY"
        })

        print("  ❌ EXACT KEY")
        continue

    # Exact normalized name
    if norm(name) in old_names:
        old = old_names[norm(name)][0]

        exact.append({
            **r,
            "existing_activity_key":
                old.get("activity_key", ""),
            "existing_activity_name":
                old.get("activity_name", ""),
            "dedup_reason":
                "EXACT_NORMALIZED_NAME"
        })

        print("  ❌ EXACT NAME")
        continue

    # Semantic comparison
    best_old = None
    best_name = 0.0
    best_method = 0.0
    best_score = 0.0

    for old in old_rows:

        ns = similarity(
            name,
            old.get("activity_name", "")
        )

        ms = similarity(
            method,
            old.get("activity_template", "")
        )

        score = (
            ns * 0.70 +
            ms * 0.30
        )

        if score > best_score:
            best_score = score
            best_name = ns
            best_method = ms
            best_old = old

    # Jangan auto-drop semantic.
    # Hanya tahan untuk review.
    if (
        best_name >= 0.90
        or (
            best_name >= 0.78
            and best_method >= 0.70
        )
    ):
        review.append({
            **r,
            "existing_activity_key":
                best_old.get("activity_key", ""),
            "existing_activity_name":
                best_old.get("activity_name", ""),
            "name_similarity":
                f"{best_name:.3f}",
            "method_similarity":
                f"{best_method:.3f}",
            "combined_similarity":
                f"{best_score:.3f}",
            "dedup_reason":
                "SEMANTIC_REVIEW"
        })

        print(
            f"  ⚠️ REVIEW "
            f"name={best_name:.3f} "
            f"method={best_method:.3f}"
        )

        continue

    safe.append(r)
    print("  ✅ NEW")


# -----------------------------
# FINAL SAFE CSV
# -----------------------------

fields = list(new_rows[0].keys())

with FINAL.open(
    "w",
    encoding="utf-8",
    newline=""
) as f:

    w = csv.DictWriter(
        f,
        fieldnames=fields
    )

    w.writeheader()
    w.writerows(safe)


# -----------------------------
# REVIEW CSV
# -----------------------------

review_fields = fields + [
    "existing_activity_key",
    "existing_activity_name",
    "name_similarity",
    "method_similarity",
    "combined_similarity",
    "dedup_reason"
]

with REVIEW.open(
    "w",
    encoding="utf-8",
    newline=""
) as f:

    w = csv.DictWriter(
        f,
        fieldnames=review_fields
    )

    w.writeheader()
    w.writerows(review)


# -----------------------------
# SQL DRAFT - ROLLBACK ONLY
# -----------------------------

sql = [
    "-- SAINS TAHUN 1",
    "-- ACTIVITY LIBRARY FINAL DRAFT",
    "-- DATABASE WRITE DISABLED",
    "",
    "BEGIN;",
    ""
]

for r in safe:

    example = (
        f"Peneroka: {clean(r['peneroka'])}\n"
        f"Pembina: {clean(r['pembina'])}\n"
        f"Pencabar: {clean(r['pencabar'])}\n"
        f"PBD: {clean(r['pbd_evidence'])}"
    )

    is_game = (
        "TRUE"
        if clean(r["is_game"]).lower() == "true"
        else "FALSE"
    )

    sql.append(f"""
INSERT INTO public.rph_activity_library (
    activity_key,
    language_code,
    skill_key,
    subskill_key,
    phase,
    level_key,
    activity_name,
    activity_template,
    bbm_template,
    year_min,
    year_max,
    is_game,
    active,
    subject_key,
    activity_type,
    example_text,
    requires_source
)
VALUES (
    {sqlq(r['activity_key'])},
    'ms',
    {sqlq(r['skill_key'])},
    {sqlq(r['subskill_key'])},
    {sqlq(r['phase'])},
    {sqlq(r['level_key'])},
    {sqlq(r['activity_name'])},
    {sqlq(r['pdp_method'])},
    {sqlq(r['materials'])},
    1,
    1,
    {is_game},
    TRUE,
    'science',
    'learning',
    {sqlq(example)},
    TRUE
)
ON CONFLICT (activity_key)
DO NOTHING;
""".strip())

    sql.append("")


sql += [
    "",
    "-- SAFETY",
    "ROLLBACK;",
    ""
]

SQL.write_text(
    "\n".join(sql),
    encoding="utf-8"
)


# -----------------------------
# AUDIT
# -----------------------------

report = [
    "",
    "SAINS TAHUN 1 — FINAL DEDUP AUDIT",
    "=" * 48,

    f"INPUT CLEAN ROWS       = {len(new_rows)}",
    f"EXISTING DB ROWS       = {len(old_rows)}",

    "",
    f"EXACT DUPLICATES       = {len(exact)}",
    f"SEMANTIC REVIEW        = {len(review)}",
    f"FINAL SAFE ROWS        = {len(safe)}",

    "",
    f"FINAL CSV              = {FINAL}",
    f"REVIEW CSV             = {REVIEW}",
    f"SQL DRAFT              = {SQL}",

    "",
    "DATABASE WRITE         = OFF",
    "SQL END MODE           = ROLLBACK",
]

AUDIT.write_text(
    "\n".join(report) + "\n",
    encoding="utf-8"
)

print("\n".join(report))

total = (
    len(exact) +
    len(review) +
    len(safe)
)

if total == len(new_rows):
    print()
    print("✅ SCIENCE_Y1_DEDUP_COMPLETE")
else:
    print()
    print(
        "❌ DEDUP COUNT MISMATCH:",
        total,
        "!=",
        len(new_rows)
    )
