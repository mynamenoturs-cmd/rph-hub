#!/usr/bin/env python3

from pathlib import Path
from openai import OpenAI
from difflib import SequenceMatcher
import csv
import json
import os
import re
import time

ROOT = Path("rph-library/generated/science-y3/auto-fable")

NEWCSV = ROOT / "science-y3-activity-library-FINAL-v3-pre-dedup.csv"
OLDCSV = ROOT / "db-audit/existing-science-library.csv"

CACHE = ROOT / "v3-dedup-cache"
LOGS = ROOT / "v3-dedup-logs"

FINALCSV = ROOT / "science-y3-activity-library-FINAL-v3.csv"
FINALSQL = ROOT / "science-y3-activity-library-INSERT-FINAL-DRAFT-v3.sql"
AUDIT = ROOT / "science-y3-dedup-audit-v3.txt"

CACHE.mkdir(parents=True, exist_ok=True)
LOGS.mkdir(parents=True, exist_ok=True)

MODEL = "xyrz/claude-fable-5"

base = (
    os.environ.get("OPENAI_API_BASE")
    or os.environ.get("OPENAI_BASE_URL")
)

key = os.environ.get("OPENAI_API_KEY")

if not base or not key:
    raise SystemExit("ERROR: API environment tidak lengkap")

client = OpenAI(
    api_key=key,
    base_url=base
)


def clean(v):
    return re.sub(
        r"\s+",
        " ",
        str(v or "")
    ).strip()


def norm(v):
    v = clean(v).lower()
    v = re.sub(r"[^a-z0-9\s]+", " ", v)
    return re.sub(r"\s+", " ", v).strip()


def fingerprint(r):
    return norm(
        clean(r.get("activity_name"))
        + " "
        + clean(r.get("activity_template"))
    )


def similarity(a, b):
    return SequenceMatcher(
        None,
        fingerprint(a),
        fingerprint(b)
    ).ratio()


def extract_json(text):
    text = text or ""

    decoder = json.JSONDecoder()

    for i, c in enumerate(text):
        if c != "{":
            continue

        try:
            obj, _ = decoder.raw_decode(text[i:])

            if isinstance(obj, dict):
                return obj

        except Exception:
            pass

    raise ValueError("JSON tidak dijumpai")


def boolval(v):
    return str(v).lower() in (
        "true",
        "1",
        "yes"
    )


def sqlq(v):
    if v is None:
        return "NULL"

    return "'" + str(v).replace(
        "'",
        "''"
    ) + "'"


new_rows = list(
    csv.DictReader(
        NEWCSV.open(
            encoding="utf-8"
        )
    )
)

old_rows = list(
    csv.DictReader(
        OLDCSV.open(
            encoding="utf-8",
            errors="ignore"
        )
    )
)

if len(new_rows) != 70:
    raise SystemExit(
        f"STOP: new rows={len(new_rows)}, dijangka 70"
    )

print("NEW      =", len(new_rows))
print("EXISTING =", len(old_rows))
print()


# --------------------------------------------------
# Exact signatures sedia ada
# --------------------------------------------------

exact_old = {}

for old in old_rows:

    sig = fingerprint(old)

    if sig:
        exact_old.setdefault(
            sig,
            old
        )


kept = []
duplicates = []
decisions = []


for idx, row in enumerate(
    new_rows,
    start=1
):

    key_new = row["activity_key"]

    cache = (
        CACHE /
        f"{idx:02d}-{key_new}.json"
    )

    print(
        f"[{idx:02d}/70] {row['activity_name']}"
    )

    # ----------------------------------------------
    # Resume
    # ----------------------------------------------

    if cache.exists():

        try:
            decision = json.loads(
                cache.read_text(
                    encoding="utf-8"
                )
            )

            if decision.get("decision") in (
                "NEW",
                "DUPLICATE"
            ):

                print(
                    "  ✅ CACHE:",
                    decision["decision"]
                )

                decisions.append(decision)

                if decision["decision"] == "NEW":
                    kept.append(row)
                else:
                    duplicates.append(
                        (row, decision)
                    )

                continue

        except Exception:
            pass


    sig = fingerprint(row)

    # ----------------------------------------------
    # Exact semantic text
    # ----------------------------------------------

    if sig in exact_old:

        old = exact_old[sig]

        decision = {
            "decision": "DUPLICATE",
            "method": "exact_signature",
            "matched_activity_key":
                old.get("activity_key", ""),
            "confidence": 1.0,
            "reason":
                "activity_name + activity_template sama selepas normalisasi"
        }

        cache.write_text(
            json.dumps(
                decision,
                ensure_ascii=False,
                indent=2
            ) + "\n",
            encoding="utf-8"
        )

        print("  ♻️ EXACT DUPLICATE")

        decisions.append(decision)
        duplicates.append(
            (row, decision)
        )

        continue


    # ----------------------------------------------
    # Cari top candidates secara lokal
    # ----------------------------------------------

    ranked = []

    for old in old_rows:

        score = similarity(
            row,
            old
        )

        ranked.append(
            (score, old)
        )

    ranked.sort(
        key=lambda x: x[0],
        reverse=True
    )

    top = ranked[:5]
    best_score = (
        top[0][0]
        if top
        else 0
    )


    # Sangat hampir => duplicate automatik.
    if best_score >= 0.94:

        old = top[0][1]

        decision = {
            "decision": "DUPLICATE",
            "method": "local_high_similarity",
            "matched_activity_key":
                old.get("activity_key", ""),
            "confidence":
                round(best_score, 4),
            "reason":
                "similarity lokal >= 0.94"
        }

        cache.write_text(
            json.dumps(
                decision,
                ensure_ascii=False,
                indent=2
            ) + "\n",
            encoding="utf-8"
        )

        print(
            f"  ♻️ LOCAL DUP {best_score:.3f}"
        )

        decisions.append(decision)
        duplicates.append(
            (row, decision)
        )

        continue


    # Sangat berbeza => new automatik.
    if best_score < 0.43:

        decision = {
            "decision": "NEW",
            "method": "local_low_similarity",
            "matched_activity_key": "",
            "confidence":
                round(1 - best_score, 4),
            "reason":
                "tiada existing candidate yang cukup hampir"
        }

        cache.write_text(
            json.dumps(
                decision,
                ensure_ascii=False,
                indent=2
            ) + "\n",
            encoding="utf-8"
        )

        print(
            f"  ✅ NEW LOCAL {best_score:.3f}"
        )

        decisions.append(decision)
        kept.append(row)

        continue


    # ----------------------------------------------
    # Ambiguous => Fable semak top 5 sahaja
    # ----------------------------------------------

    candidates = []

    for score, old in top:

        candidates.append({
            "similarity":
                round(score, 4),
            "activity_key":
                old.get("activity_key", ""),
            "activity_name":
                old.get("activity_name", ""),
            "activity_template":
                old.get("activity_template", ""),
        })


    prompt = f"""
Anda melakukan semantic deduplication
Activity Library Sains.

Tentukan sama ada NEW ACTIVITY sebenarnya
mekanik PdP yang sama dengan salah satu EXISTING CANDIDATE.

Bandingkan CARA PdP, bukan tajuk kandungan.

DUPLICATE jika:
- mekanik utama sama,
- urutan aktiviti hampir sama,
- hanya nama/objek/contoh berubah.

NEW jika:
- cara pelaksanaan kelas benar-benar berbeza,
- struktur interaksi murid berbeza,
- mekanik reusable memberi variasi pedagogi nyata.

Jangan anggap sama hanya kerana kedua-duanya:
- kumpulan,
- papan mini,
- PAK-21,
- stesen,
- pembentangan.

OUTPUT SATU JSON sahaja:

{{
  "duplicate": true,
  "matched_activity_key": "...",
  "confidence": 0.00,
  "reason": "..."
}}

Jika tidak duplicate:

{{
  "duplicate": false,
  "matched_activity_key": "",
  "confidence": 0.00,
  "reason": "..."
}}

NEW ACTIVITY:

{json.dumps({
    "activity_name": row.get("activity_name"),
    "activity_template": row.get("activity_template"),
    "phase": row.get("phase")
}, ensure_ascii=False)}

EXISTING CANDIDATES:

{json.dumps(candidates, ensure_ascii=False)}

JSON SAHAJA.
"""


    resolved = False

    for attempt in (1, 2, 3):

        print(
            f"  🤖 Dedup Fable {attempt}/3..."
        )

        try:

            response = client.chat.completions.create(
                model=MODEL,
                messages=[
                    {
                        "role": "system",
                        "content":
                        "Balas satu JSON object sahaja."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0,
                max_tokens=1000
            )

            raw = (
                response
                .choices[0]
                .message
                .content
                or ""
            )

            (
                LOGS /
                f"{idx:02d}-attempt-{attempt}.txt"
            ).write_text(
                raw,
                encoding="utf-8"
            )

            obj = extract_json(
                raw
            )

        except Exception as e:

            print(
                "    ⚠️",
                e
            )

            time.sleep(1)
            continue


        duplicate = boolval(
            obj.get("duplicate")
        )

        matched = clean(
            obj.get(
                "matched_activity_key"
            )
        )

        if duplicate and not matched:

            print(
                "    ⚠️ duplicate=true tetapi matched key kosong"
            )

            continue


        decision = {
            "decision":
                "DUPLICATE"
                if duplicate
                else "NEW",

            "method":
                "fable_semantic",

            "matched_activity_key":
                matched,

            "confidence":
                obj.get(
                    "confidence",
                    ""
                ),

            "reason":
                clean(
                    obj.get("reason")
                ),

            "local_best_similarity":
                round(
                    best_score,
                    4
                )
        }


        cache.write_text(
            json.dumps(
                decision,
                ensure_ascii=False,
                indent=2
            ) + "\n",
            encoding="utf-8"
        )


        if duplicate:

            print(
                "  ♻️ DUPLICATE FABLE ->",
                matched
            )

            duplicates.append(
                (row, decision)
            )

        else:

            print(
                "  ✅ NEW FABLE"
            )

            kept.append(row)


        decisions.append(
            decision
        )

        resolved = True
        break


    if not resolved:

        print(
            "❌ STOP: Fable tidak dapat resolve row",
            idx
        )

        raise SystemExit(1)


# --------------------------------------------------
# Internal duplicate selepas keputusan
# --------------------------------------------------

final_kept = []
seen = set()
internal_dup = []

for row in kept:

    sig = fingerprint(row)

    if sig in seen:
        internal_dup.append(row)
        continue

    seen.add(sig)
    final_kept.append(row)


# --------------------------------------------------
# FINAL CSV
# --------------------------------------------------

fields = list(
    new_rows[0].keys()
)

with FINALCSV.open(
    "w",
    encoding="utf-8",
    newline=""
) as f:

    writer = csv.DictWriter(
        f,
        fieldnames=fields
    )

    writer.writeheader()
    writer.writerows(
        final_kept
    )


# --------------------------------------------------
# SQL FINAL DRAFT
# --------------------------------------------------

db_fields = [
    "activity_key",
    "language_code",
    "skill_key",
    "subskill_key",
    "phase",
    "level_key",
    "activity_name",
    "activity_template",
    "bbm_template",
    "pak21",
    "year_min",
    "year_max",
    "is_game",
    "priority",
    "active",
    "subject_key",
    "activity_type",
    "example_text",
    "requires_source",
    "selection_weight",
]


with FINALSQL.open(
    "w",
    encoding="utf-8"
) as f:

    f.write(
        "-- SAINS TAHUN 3 ACTIVITY LIBRARY V3\n"
    )

    f.write(
        "-- FINAL DRAFT - DATABASE WRITE MASIH OFF\n\n"
    )

    f.write(
        "BEGIN;\n\n"
    )

    for row in final_kept:

        values = []

        for field in db_fields:

            v = row.get(
                field,
                ""
            )

            if field in (
                "year_min",
                "year_max",
                "priority",
                "selection_weight",
            ):
                values.append(
                    str(
                        int(float(v))
                    )
                )

            elif field in (
                "is_game",
                "active",
                "requires_source",
            ):
                values.append(
                    "true"
                    if boolval(v)
                    else "false"
                )

            else:
                values.append(
                    sqlq(v)
                )


        f.write(
            "INSERT INTO public.rph_activity_library (\n  "
        )

        f.write(
            ", ".join(
                db_fields
            )
        )

        f.write(
            "\n) VALUES (\n  "
        )

        f.write(
            ",\n  ".join(
                values
            )
        )

        f.write(
            "\n)\n"
        )

        f.write(
            "ON CONFLICT (activity_key) DO NOTHING;\n\n"
        )


    f.write(
        "-- DRAFT: tukar ROLLBACK -> COMMIT hanya selepas approval.\n"
    )

    f.write(
        "ROLLBACK;\n"
    )


# --------------------------------------------------
# FINAL AUDIT
# --------------------------------------------------

phase_count = {}

for row in final_kept:

    phase = row.get(
        "phase",
        ""
    )

    phase_count[phase] = (
        phase_count.get(
            phase,
            0
        ) + 1
    )


report = [
    "SAINS TAHUN 3 — V3 FINAL DEDUP AUDIT",
    "=" * 44,

    f"INPUT V3                 = {len(new_rows)}",
    f"EXISTING DB SNAPSHOT     = {len(old_rows)}",
    f"DUPLICATE EXISTING       = {len(duplicates)}",
    f"DUPLICATE INTERNAL       = {len(internal_dup)}",
    f"FINAL NEW ROWS           = {len(final_kept)}",

    "",

    "PHASE FINAL:"
]

for phase in [
    "input",
    "guided",
    "practice",
    "game",
    "evidence",
    "sharing",
]:

    report.append(
        f"{phase:10s} = {phase_count.get(phase,0)}"
    )


report += [
    "",
    f"FINAL CSV:",
    str(FINALCSV),

    "",
    "SQL FINAL DRAFT:",
    str(FINALSQL),

    "",
    "SQL END MODE             = ROLLBACK",
    "DATABASE WRITE           = OFF",
]


AUDIT.write_text(
    "\n".join(report) + "\n",
    encoding="utf-8"
)


print()
print(
    "\n".join(report)
)

print()
print(
    "✅ SCIENCE_Y3_V3_DEDUP_COMPLETE"
)
