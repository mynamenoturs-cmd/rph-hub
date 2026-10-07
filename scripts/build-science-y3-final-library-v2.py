#!/usr/bin/env python3
from pathlib import Path
import json, csv, re, hashlib

ROOT = Path("rph-library/generated/science-y3/auto-fable")
FINAL = ROOT / "final"
DBCSV = ROOT / "db-audit/existing-science-library.csv"

OUTCSV = ROOT / "science-y3-activity-library-FINAL-v2.csv"
OUTSQL = ROOT / "science-y3-activity-library-INSERT-DRAFT-v2.sql"
REPORT = ROOT / "science-y3-library-report-v2.txt"

WEEKS = [w for w in range(2,38) if w != 6]

def clean(v):
    return re.sub(r"\s+", " ", str(v or "")).strip()

def slug(v):
    v = clean(v).lower()
    v = re.sub(r"[^a-z0-9]+", "_", v)
    return v.strip("_")[:42]

def q(v):
    return "'" + str(v).replace("'", "''") + "'"

GAME = re.compile(
    r"\b(permainan|game|kuiz|quiz|bingo|bola soalan|"
    r"kerusi panas|kotak beracun|radio rosak|relay|"
    r"lumba berganti|pancing soalan)\b",
    re.I
)

def canonical_phase(raw, name, method):
    t = " ".join([clean(raw), clean(name), clean(method)]).lower()

    if GAME.search(t):
        return "game"

    if re.search(r"set induksi|induksi|pengenalan|input", t):
        return "input"

    if re.search(r"guided|bimbing|berpandu|penerokaan|eksplorasi", t):
        return "guided"

    if re.search(r"evidence|evidens|pbd|penilaian|refleksi|exit ticket", t):
        return "evidence"

    if re.search(r"sharing|perkongsian|pembentangan|gallery|galeri", t):
        return "sharing"

    return "practice"

# --------------------------------------------------
# READ 70 VALID AUTO-FABLE SESSIONS
# --------------------------------------------------

rows = []

for week in WEEKS:
    p = FINAL / f"week-{week:02d}.json"

    if not p.exists():
        raise SystemExit(f"STOP: {p} tiada")

    arr = json.loads(p.read_text(encoding="utf-8"))

    sessions = {
        int(x["session"]): x
        for x in arr
        if isinstance(x,dict) and "session" in x
    }

    if sorted(sessions) != [1,2]:
        raise SystemExit(f"STOP: M{week} tidak mempunyai S1+S2")

    for session in (1,2):
        x = sessions[session]

        name = clean(x.get("activity_name"))
        method = clean(x.get("pdp_method"))
        materials = clean(x.get("materials"))

        phase = canonical_phase(
            x.get("phase"),
            name,
            method
        )

        is_game = phase == "game"

        differentiation = (
            f"Peneroka: {clean(x.get('peneroka'))}; "
            f"Pembina: {clean(x.get('pembina'))}; "
            f"Pencabar: {clean(x.get('pencabar'))}"
        )

        digest = hashlib.sha1(
            f"{week}|{session}|{name}|{method}".encode()
        ).hexdigest()[:8]

        activity_key = (
            f"science_y3_w{week:02d}_s{session}_"
            f"{slug(name)}_{digest}"
        )

        rows.append({
            "activity_key": activity_key,
            "week": week,
            "session": session,
            "language_code": "ms",
            "skill_key": "general",
            "subskill_key": "general",
            "level_key": "all",
            "phase": phase,
            "activity_name": name,
            "activity_template": method,
            "bbm_template": materials,
            "pak21": "",
            "year_min": 3,
            "year_max": 3,
            "is_game": is_game,
            "priority": 100,
            "active": True,
            "subject_key": "science",
            "activity_type": "learning",
            "example_text": (
                f"Minggu {week} Sesi {session}. "
                f"{clean(x.get('pbd_evidence'))} "
                f"{differentiation}"
            ),
            "requires_source": True,
            "selection_weight": 100,
        })

if len(rows) != 70:
    raise SystemExit(f"STOP: dijangka 70 rows, dapat {len(rows)}")

# --------------------------------------------------
# EXISTING LIBRARY DEDUP
# --------------------------------------------------

existing = []

if DBCSV.exists():
    with DBCSV.open(encoding="utf-8", errors="ignore") as f:
        existing = list(csv.DictReader(f))

existing_keys = {
    clean(x.get("activity_key")).lower()
    for x in existing
}

existing_sig = {
    (
        clean(x.get("activity_name")).lower(),
        clean(x.get("activity_template")).lower()
    )
    for x in existing
}

unique = []
dup_db = 0
dup_batch = 0
seen = set()

for r in rows:

    sig = (
        r["activity_name"].lower(),
        r["activity_template"].lower()
    )

    if sig in seen:
        dup_batch += 1
        continue

    seen.add(sig)

    if (
        r["activity_key"].lower() in existing_keys
        or sig in existing_sig
    ):
        dup_db += 1
        continue

    unique.append(r)

# --------------------------------------------------
# CSV
# --------------------------------------------------

fields = list(rows[0].keys())

with OUTCSV.open("w", encoding="utf-8", newline="") as f:
    w = csv.DictWriter(f, fieldnames=fields)
    w.writeheader()
    w.writerows(unique)

# --------------------------------------------------
# SQL DRAFT
# --------------------------------------------------

with OUTSQL.open("w", encoding="utf-8") as f:

    f.write("-- SAINS TAHUN 3\n")
    f.write("-- SQL DRAFT SAHAJA\n")
    f.write("-- JANGAN RUN SEBELUM FINAL REVIEW\n\n")

    for r in unique:

        f.write(
            "INSERT INTO public.rph_activity_library (\n"
            " activity_key, language_code, skill_key, subskill_key,\n"
            " phase, level_key, activity_name, activity_template,\n"
            " bbm_template, year_min, year_max, is_game,\n"
            " priority, active, subject_key, activity_type,\n"
            " example_text, requires_source, selection_weight\n"
            ") VALUES (\n"
            f" {q(r['activity_key'])}, 'ms', 'general', 'general',\n"
            f" {q(r['phase'])}, 'all', {q(r['activity_name'])},\n"
            f" {q(r['activity_template'])},\n"
            f" {q(r['bbm_template'])}, 3, 3,\n"
            f" {'true' if r['is_game'] else 'false'},\n"
            " 100, true, 'science', 'learning',\n"
            f" {q(r['example_text'])}, true, 100\n"
            ")\n"
            "ON CONFLICT (activity_key) DO NOTHING;\n\n"
        )

report = f"""SAINS TAHUN 3 ACTIVITY LIBRARY V2
=====================================
Auto-Fable sessions : {len(rows)}
Existing DB rows    : {len(existing)}
Duplicate batch     : {dup_batch}
Duplicate DB        : {dup_db}
FINAL candidate     : {len(unique)}

Canonical phases:
input / guided / practice / game / evidence / sharing

skill_key     : general
subskill_key  : general
level_key     : all
subject_key   : science
year          : 3
requires_source: true

DATABASE WRITE: OFF

CSV:
{OUTCSV}

SQL DRAFT:
{OUTSQL}
"""

REPORT.write_text(report, encoding="utf-8")
print(report)
