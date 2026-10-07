#!/usr/bin/env python3

from pathlib import Path
from openai import OpenAI
from io import StringIO
import csv
import os
import re
import time

ROOT = Path("rph-library/generated/science-y3/auto-fable")
BATCH = ROOT / "v3-batches"
OUTPUT = ROOT / "v3-output"
LOGS = ROOT / "v3-logs"

MASTER = ROOT / "science-y3-activity-library-FINAL-v3-pre-dedup.csv"
AUDIT = ROOT / "science-y3-library-audit-v3-pre-dedup.txt"

OUTPUT.mkdir(parents=True, exist_ok=True)
LOGS.mkdir(parents=True, exist_ok=True)

base = (
    os.environ.get("OPENAI_API_BASE")
    or os.environ.get("OPENAI_BASE_URL")
)

key = os.environ.get("OPENAI_API_KEY")

if not base:
    raise SystemExit("ERROR: OPENAI_API_BASE / OPENAI_BASE_URL tiada")

if not key:
    raise SystemExit("ERROR: OPENAI_API_KEY tiada")

client = OpenAI(
    api_key=key,
    base_url=base
)

MODEL = "xyrz/claude-fable-5"

PHASES = {
    "input",
    "guided",
    "practice",
    "game",
    "evidence",
    "sharing"
}

TEXT_FIELDS = [
    "activity_name",
    "activity_template",
    "bbm_template",
    "example_text"
]

BANNED = [
    r"\bOCR\b",
    r"teks\s+OCR",
    r"dialog\s+OCR",
    r"source\s+task",
    r"source\s+evidence",
    r"source_pages",
    r"LOCAL_PROPOSED",
    r"LOCAL_VERIFIED",
    r"\bmetadata\b",
    r"hasil\s+ekstrak",
    r"aktiviti\s+sumber",
    r"berdasarkan\s+sumber",
    r"\bm\s*/\s*s\s*\d+",
    r"\bhalaman\s+\d+",
    r"\bminggu\s+\d+",
    r"\bsesi\s+[12]\b",
]

def strip_response(text):
    text = (text or "").strip()

    # buang code fence
    if text.startswith("```"):
        lines = text.splitlines()

        if lines:
            lines = lines[1:]

        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]

        text = "\n".join(lines).strip()

    if text.lower().startswith("csv\n"):
        text = text[4:]

    # cari header sebenar jika Fable beri ayat pembukaan
    marker = "activity_key,"
    pos = text.find(marker)

    if pos > 0:
        text = text[pos:]

    return text.strip()


def read_csv_text(text):
    f = StringIO(text)
    reader = csv.DictReader(f)
    rows = list(reader)

    if reader.fieldnames:
        reader.fieldnames = [
            x.strip() for x in reader.fieldnames
        ]

    return reader.fieldnames or [], rows


def validate(text, expected_fields):
    issues = []

    try:
        fields, rows = read_csv_text(text)
    except Exception as e:
        return [f"CSV_PARSE: {e}"], []

    if fields != expected_fields:
        issues.append(
            f"HEADER_MISMATCH: {fields}"
        )

    if len(rows) != 10:
        issues.append(
            f"ROW_COUNT={len(rows)} expected=10"
        )

    for i, r in enumerate(rows, start=1):

        phase = (r.get("phase") or "").strip().lower()

        if phase not in PHASES:
            issues.append(
                f"ROW{i}: invalid phase={phase!r}"
            )

        is_game = (r.get("is_game") or "").strip().lower()

        if phase == "game":
            if is_game not in ("true", "1", "yes"):
                issues.append(
                    f"ROW{i}: phase=game tetapi is_game={is_game}"
                )
        else:
            if is_game in ("true", "1", "yes"):
                issues.append(
                    f"ROW{i}: phase={phase} tetapi is_game=true"
                )

        for field in TEXT_FIELDS:
            value = r.get(field) or ""

            for pat in BANNED:
                if re.search(pat, value, re.I):
                    issues.append(
                        f"ROW{i}:{field}: banned={pat}"
                    )

    return issues, rows


def make_prompt(csv_text, attempt, issues=None):

    correction = ""

    if issues:
        correction = """
RESPONS SEBELUMNYA GAGAL VALIDATOR.
BETULKAN SEMUA ISU INI:
- """ + "\n- ".join(issues[:30])

    return f"""
Anda sedang memfinalisasikan Activity Library
Sains Tahun 3.

Anda menerima TEPAT 10 row CSV.

PRINSIP UTAMA:
Buku Teks / RPT / DSKP menentukan ISI.
Activity Library menentukan CARA PdP.

TUGAS:

1. Pulangkan TEPAT 10 row.
2. Header dan susunan column WAJIB sama.
3. Jangan tambah atau buang row.
4. Jangan ubah week atau session.
5. Kekalkan idea PdP terbaik dan jadikannya reusable.

Buang daripada field reusable:
- OCR
- teks OCR
- dialog OCR
- source task
- source evidence
- source_pages
- LOCAL_PROPOSED
- LOCAL_VERIFIED
- metadata
- hasil ekstrak
- aktiviti sumber
- berdasarkan sumber
- m/s diikuti nombor
- halaman diikuti nombor
- Minggu diikuti nombor
- Sesi diikuti nombor

Jika aktiviti memerlukan kandungan sebenar Buku Teks,
gunakan:

{{{{source_activity}}}}

JANGAN jadikan template generik kosong.

Kekalkan mekanik PdP konkrit seperti:
- Kotak Beracun
- Radio Rosak
- Bola Soalan
- Kerusi Panas
- relay
- stesen
- Think-Pair-Share
- papan mini
- teka gambar
- demonstrasi
- cabaran kumpulan
- galeri
- reka bentuk
- permainan bahasa/sains yang sesuai

PHASE HANYA:

input
guided
practice
game
evidence
sharing

PENTING:
phase=game HANYA jika permainan ialah mekanik UTAMA.

Contoh:
eksperimen + Bola Soalan
=> guided/practice jika eksperimen ialah aktiviti utama.

Kerusi Panas sebagai keseluruhan aktiviti
=> game.

is_game mesti:
phase=game => true
selainnya => false

PdP Terbeza mesti reusable:
Peneroka = sokongan
Pembina = tugasan aras biasa
Pencabar = sebab/bukti/perbandingan/aplikasi/justifikasi tambahan

Jangan cipta fakta kurikulum baharu.

OUTPUT:
CSV SAHAJA.
Tiada markdown.
Tiada ```csv.
Tiada penerangan.
Tiada ayat sebelum atau selepas CSV.

{correction}

================ INPUT CSV ================

{csv_text}

================ OUTPUT ==================

CSV SAHAJA:
"""


all_valid = []

for n in range(1, 8):

    src = BATCH / f"batch-{n:02d}.csv"
    dst = OUTPUT / f"batch-{n:02d}-v3.csv"

    if not src.exists():
        raise SystemExit(f"ERROR: {src} tiada")

    source_text = src.read_text(
        encoding="utf-8",
        errors="ignore"
    )

    expected_fields, source_rows = read_csv_text(source_text)

    if len(source_rows) != 10:
        raise SystemExit(
            f"ERROR: batch {n:02d} input bukan 10 row"
        )

    print()
    print("=" * 50)
    print(f"FABLE V3 — BATCH {n:02d}/07")
    print("=" * 50)

    # Resume — output lama valid?
    if dst.exists():

        existing = dst.read_text(
            encoding="utf-8",
            errors="ignore"
        )

        issues, rows = validate(
            existing,
            expected_fields
        )

        if not issues:
            print(
                f"✅ Batch {n:02d} sudah VALID — SKIP"
            )

            all_valid.extend(rows)
            continue

    success = False
    previous_issues = None

    for attempt in (1, 2):

        print(
            f"🤖 Fable Batch {n:02d} "
            f"attempt {attempt}/2..."
        )

        prompt = make_prompt(
            source_text,
            attempt,
            previous_issues
        )

        try:
            r = client.chat.completions.create(
                model=MODEL,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.1,
                max_tokens=10000
            )

            raw = (
                r.choices[0].message.content
                or ""
            )

        except Exception as e:

            print(
                f"❌ API ERROR Batch {n:02d}: {e}"
            )

            time.sleep(3)
            continue

        log = (
            LOGS /
            f"batch-{n:02d}-attempt-{attempt}.txt"
        )

        log.write_text(
            raw,
            encoding="utf-8"
        )

        cleaned = strip_response(raw)

        issues, rows = validate(
            cleaned,
            expected_fields
        )

        if not issues:

            dst.write_text(
                cleaned.rstrip() + "\n",
                encoding="utf-8"
            )

            print(
                f"✅ Batch {n:02d} PASS — 10 rows"
            )

            all_valid.extend(rows)
            success = True
            break

        print(
            f"⚠️ Batch {n:02d} gagal validation:"
        )

        for x in issues[:12]:
            print("  -", x)

        previous_issues = issues

        time.sleep(2)

    if not success:
        print()
        print(
            f"❌ STOP: Batch {n:02d} gagal "
            "selepas 2 percubaan."
        )
        print(
            "Jalankan script sama semula selepas "
            "kita semak log."
        )
        raise SystemExit(1)


# ==================================================
# MERGE 70 ROW
# ==================================================

if len(all_valid) != 70:
    raise SystemExit(
        f"ERROR: jumlah akhir {len(all_valid)}, "
        "bukan 70"
    )

fields = list(all_valid[0].keys())

with MASTER.open(
    "w",
    encoding="utf-8",
    newline=""
) as f:

    w = csv.DictWriter(
        f,
        fieldnames=fields
    )

    w.writeheader()
    w.writerows(all_valid)


# ==================================================
# FINAL AUDIT
# ==================================================

phase_count = {
    p: 0
    for p in sorted(PHASES)
}

game_count = 0
content_specific = 0
invalid_phase = 0
internal_terms = 0

for r in all_valid:

    phase = (
        r.get("phase") or ""
    ).strip().lower()

    if phase in phase_count:
        phase_count[phase] += 1
    else:
        invalid_phase += 1

    if (
        r.get("is_game") or ""
    ).strip().lower() in ("true","1","yes"):
        game_count += 1

    for field in TEXT_FIELDS:

        value = r.get(field) or ""

        for pat in BANNED:

            if re.search(pat, value, re.I):

                if re.search(
                    r"OCR|source|LOCAL_|metadata|hasil\s+ekstrak",
                    pat,
                    re.I
                ):
                    internal_terms += 1
                else:
                    content_specific += 1


report = []

report.append(
    "SAINS TAHUN 3 — FABLE V3 PRE-DEDUP AUDIT"
)

report.append("=" * 45)
report.append("INPUT / OUTPUT ROWS : 70")
report.append("")

for phase in [
    "input",
    "guided",
    "practice",
    "game",
    "evidence",
    "sharing"
]:
    report.append(
        f"{phase:10s}: {phase_count[phase]}"
    )

report.append("")
report.append(f"GAME TRUE               : {game_count}")
report.append(
    f"CONTENT_SPECIFIC_REFS   : {content_specific}"
)
report.append(
    f"INTERNAL_TECH_TERMS     : {internal_terms}"
)
report.append(
    f"INVALID_PHASE           : {invalid_phase}"
)
report.append("")
report.append(f"MASTER: {MASTER}")
report.append("")
report.append("DATABASE WRITE: OFF")

AUDIT.write_text(
    "\n".join(report) + "\n",
    encoding="utf-8"
)

print()
print("\n".join(report))

if (
    content_specific == 0
    and internal_terms == 0
    and invalid_phase == 0
):
    print()
    print("✅ FABLE_V3_70_ROWS_PASS")
else:
    print()
    print("⚠️ V3 memerlukan semakan lanjut")
