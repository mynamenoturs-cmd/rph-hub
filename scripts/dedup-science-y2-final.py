#!/usr/bin/env python3

from pathlib import Path
from difflib import SequenceMatcher
import csv
import re

ROOT = Path("rph-library/generated/science-y2")

SRC = ROOT / "science-y2-activity-library-FABLE-pre-dedup.csv"
DB = ROOT / "db-audit/existing-science-y2.csv"

FINAL = ROOT / "science-y2-activity-library-FINAL-v1.csv"
REVIEW = ROOT / "science-y2-dedup-review-v1.csv"

if not SRC.exists():
    raise SystemExit(f"❌ Tiada source: {SRC}")

if not DB.exists():
    raise SystemExit(f"❌ Tiada DB snapshot: {DB}")


def clean(v):
    return re.sub(r"\s+", " ", str(v or "")).strip()


def norm(v):
    v = clean(v).lower()

    v = re.sub(
        r"\b(?:buku teks|m\/s|ms|halaman)\s*\d+(?:\s*[-–]\s*\d+)?",
        " ",
        v
    )

    v = re.sub(r"[^a-z0-9áéíóúüñ\s]+", " ", v)
    return re.sub(r"\s+", " ", v).strip()


def get(row, *names):
    for n in names:
        if n in row and clean(row[n]):
            return clean(row[n])
    return ""


new_rows = list(csv.DictReader(
    SRC.open(encoding="utf-8")
))

db_rows = list(csv.DictReader(
    DB.open(encoding="utf-8")
))

if not new_rows:
    raise SystemExit("❌ Source CSV kosong")

db_keys = {
    clean(r.get("activity_key"))
    for r in db_rows
    if clean(r.get("activity_key"))
}

seen_new = set()

safe = []
review = []

exact_existing = 0
duplicate_internal = 0


def signature(r):
    return norm(
        " ".join([
            get(r, "activity_name"),
            get(r, "activity_template", "pdp_method"),
            get(r, "bbm_template", "materials"),
        ])
    )


db_sig = [
    (
        r,
        signature(r)
    )
    for r in db_rows
]


for idx, row in enumerate(new_rows, start=1):

    key = clean(row.get("activity_key"))

    if not key:
        review.append({
            "row": idx,
            "reason": "MISSING_ACTIVITY_KEY",
            "new_key": "",
            "new_name": get(row, "activity_name"),
            "existing_key": "",
            "existing_name": "",
            "similarity": ""
        })
        continue

    if key in seen_new:
        duplicate_internal += 1
        continue

    seen_new.add(key)

    if key in db_keys:
        exact_existing += 1
        continue

    sig = signature(row)

    best_ratio = 0.0
    best_db = None

    if sig:
        for existing, esig in db_sig:

            if not esig:
                continue

            ratio = SequenceMatcher(
                None,
                sig,
                esig
            ).ratio()

            if ratio > best_ratio:
                best_ratio = ratio
                best_db = existing

    # Jangan auto-buang semantic similarity.
    # Hanya laporkan untuk audit manusia.
    if best_ratio >= 0.88 and best_db:

        review.append({
            "row": idx,
            "reason": "SEMANTIC_REVIEW",
            "new_key": key,
            "new_name": get(row, "activity_name"),
            "existing_key": get(best_db, "activity_key"),
            "existing_name": get(best_db, "activity_name"),
            "similarity": f"{best_ratio:.3f}"
        })

    safe.append(row)


with FINAL.open(
    "w",
    newline="",
    encoding="utf-8"
) as f:

    writer = csv.DictWriter(
        f,
        fieldnames=new_rows[0].keys()
    )

    writer.writeheader()
    writer.writerows(safe)


review_fields = [
    "row",
    "reason",
    "new_key",
    "new_name",
    "existing_key",
    "existing_name",
    "similarity",
]

with REVIEW.open(
    "w",
    newline="",
    encoding="utf-8"
) as f:

    writer = csv.DictWriter(
        f,
        fieldnames=review_fields
    )

    writer.writeheader()
    writer.writerows(review)


print()
print("SAINS TAHUN 2 — FINAL DB DEDUP AUDIT")
print("=" * 52)

print("INPUT NEW ROWS       =", len(new_rows))
print("EXISTING DB ROWS     =", len(db_rows))
print("EXACT EXISTING       =", exact_existing)
print("DUPLICATE INTERNAL   =", duplicate_internal)
print("SEMANTIC REVIEW      =", sum(
    1 for x in review
    if x["reason"] == "SEMANTIC_REVIEW"
))
print("FINAL SAFE ROWS      =", len(safe))

print()
print("FINAL CSV  =", FINAL)
print("REVIEW CSV =", REVIEW)

print()
print("DATABASE WRITE = OFF")

if (
    len(new_rows) == 72
    and len(seen_new) == 72
    and duplicate_internal == 0
):
    print("✅ SCIENCE_Y2_FINAL_DEDUP_PASS")
else:
    print("⚠️ SCIENCE_Y2_FINAL_DEDUP_NEEDS_REVIEW")
