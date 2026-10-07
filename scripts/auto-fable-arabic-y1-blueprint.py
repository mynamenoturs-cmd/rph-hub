#!/usr/bin/env python3

from pathlib import Path
from openai import OpenAI
import csv
import json
import os
import re
import time

ROOT = Path("rph-library/generated/arabic-y1")

RPT = Path("/tmp/arabic-y1-rpt.txt")

OUT_CSV = ROOT / "arabic-y1-source-blueprint-draft.csv"
OUT_JSON = ROOT / "arabic-y1-source-blueprint-draft.json"
AUDIT = ROOT / "arabic-y1-source-blueprint-audit.txt"
LOGDIR = ROOT / "logs"

MODEL = "xyrz/claude-fable-5"

LOGDIR.mkdir(parents=True, exist_ok=True)

base = (
    os.environ.get("OPENAI_API_BASE")
    or os.environ.get("OPENAI_BASE_URL")
)

key = os.environ.get("OPENAI_API_KEY")

if not base or not key:
    raise SystemExit("ERROR: API environment belum lengkap")

if not RPT.exists():
    raise SystemExit(f"ERROR: RPT text tidak ditemui: {RPT}")

client = OpenAI(
    api_key=key,
    base_url=base
)

rpt_text = RPT.read_text(
    encoding="utf-8",
    errors="ignore"
)

print("RPT chars:", len(rpt_text))


def clean(v):
    return re.sub(r"\s+", " ", str(v or "")).strip()


def extract_json(text):
    text = text or ""

    # cari JSON array dahulu
    decoder = json.JSONDecoder()

    for i, c in enumerate(text):
        if c != "[":
            continue

        try:
            obj, _ = decoder.raw_decode(text[i:])

            if isinstance(obj, list):
                return obj

        except Exception:
            pass

    raise ValueError("JSON array tidak dijumpai")


SYSTEM = """
Anda ialah extractor source-first untuk RPH Hub.

Tugas anda HANYA mengekstrak fakta yang benar-benar wujud
dalam teks RPT Bahasa Arab Tahun 1.

JANGAN:
- cipta SK;
- cipta SP;
- cipta halaman Buku Teks;
- cipta Source_Task;
- reka aktiviti;
- terjemah kandungan menjadi kandungan baru;
- gunakan Activity Library untuk menentukan isi.

Jika bukti tidak cukup, kosongkan field tersebut.

Balas SATU JSON ARRAY sahaja.
Tiada markdown.
Tiada ulasan.
"""


PROMPT = f"""
Ekstrak semua sesi Bahasa Arab Tahun 1 daripada RPT berikut.

SETIAP row mesti mewakili SATU sesi sebenar.

Field wajib:

week
session
title
sk
sp
textbook_page
source_task
source_status
notes

PERATURAN:

1. week dan session mesti nombor integer.

2. title:
   ambil daripada RPT jika ada.
   Jika tiada, kosongkan.

3. sk dan sp:
   salin seperti dalam RPT.
   Jangan cipta nombor standard.

4. textbook_page:
   isi HANYA jika nombor halaman sebenar dinyatakan.
   Format dibenarkan:
   "12"
   "12-13"
   "47"
   "47-50"

   Jangan isi:
   "page"
   "halaman"
   "m/s"
   atau tekaan.

5. source_task:
   isi HANYA jika RPT mempunyai tugasan sumber yang
   jelas dan spesifik.

   Jika hanya ada:
   "Fokus & Aktiviti Cadangan",
   aktiviti generik,
   atau arahan umum,
   source_task mesti "".

6. source_status hanya salah satu:

   SOURCE_LOCKED
   REVIEW
   NEEDS_TEXTBOOK_EVIDENCE

   SOURCE_LOCKED:
   hanya jika halaman sebenar + Source_Task konkrit
   disokong oleh RPT.

   REVIEW:
   jika RPT sendiri menandakan item memerlukan semakan
   guru, REVIEW, atau status serupa.

   NEEDS_TEXTBOOK_EVIDENCE:
   jika halaman atau Source_Task sebenar masih belum
   dapat dibuktikan.

7. M1-M38:
   Jangan cipta Source_Task untuk melengkapkan kekosongan.

8. M39-M43:
   Kekalkan evidence/status sebenar yang terdapat dalam RPT.
   Jangan naik taraf REVIEW menjadi SOURCE_LOCKED tanpa bukti.

9. notes:
   gunakan ringkas untuk menerangkan kekurangan bukti,
   contohnya:
   "Source_Task tidak tersedia dalam RPT"
   atau
   "Halaman tepat memerlukan semakan Buku Teks".

10. Jangan masukkan istilah dalaman ke teks source_task:
    OCR
    LOCAL_PROPOSED
    LOCAL_VERIFIED
    metadata
    source evidence

RPT:

----- BEGIN RPT -----

{rpt_text}

----- END RPT -----

Balas SATU JSON ARRAY sahaja.
"""


rows = None

for attempt in range(1, 4):

    print(f"Fable extraction attempt {attempt}/3...")

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM
                },
                {
                    "role": "user",
                    "content": PROMPT
                }
            ],
            temperature=0,
            max_tokens=12000,
        )

        raw = (
            response
            .choices[0]
            .message
            .content
            or ""
        )

        (
            LOGDIR /
            f"extract-attempt-{attempt}.txt"
        ).write_text(
            raw,
            encoding="utf-8"
        )

        rows = extract_json(raw)

        if not rows:
            raise ValueError("JSON array kosong")

        break

    except Exception as e:
        print("FAIL:", e)

        if attempt == 3:
            raise

        time.sleep(2)


# -------------------------------
# NORMALIZE
# -------------------------------

normalized = []

VALID_STATUS = {
    "SOURCE_LOCKED",
    "REVIEW",
    "NEEDS_TEXTBOOK_EVIDENCE",
}

for i, r in enumerate(rows, start=1):

    if not isinstance(r, dict):
        raise SystemExit(
            f"STOP: row {i} bukan object"
        )

    try:
        week = int(r.get("week"))
        session = int(r.get("session"))
    except Exception:
        raise SystemExit(
            f"STOP: week/session invalid row {i}: {r}"
        )

    page = clean(
        r.get("textbook_page")
    )

    # buang label seperti m/s, halaman, page
    page = re.sub(
        r"(?i)\b(?:m\s*/\s*s|halaman|page|pages|p\.)\b",
        "",
        page
    ).strip()

    if page and not re.fullmatch(
        r"\d+(?:\s*[-–]\s*\d+)?",
        page
    ):
        page = ""

    page = page.replace("–", "-")

    source_task = clean(
        r.get("source_task")
    )

    status = clean(
        r.get("source_status")
    ).upper()

    if status not in VALID_STATUS:
        status = "NEEDS_TEXTBOOK_EVIDENCE"

    # Gate keras:
    # SOURCE_LOCKED wajib ada page + task.
    if status == "SOURCE_LOCKED":
        if not page or not source_task:
            status = "NEEDS_TEXTBOOK_EVIDENCE"

    # Jika tiada task, jangan sekali-kali LOCK.
    if not source_task and status == "SOURCE_LOCKED":
        status = "NEEDS_TEXTBOOK_EVIDENCE"

    normalized.append({
        "week": week,
        "session": session,
        "title": clean(r.get("title")),
        "sk": clean(r.get("sk")),
        "sp": clean(r.get("sp")),
        "textbook_page": page,
        "source_task": source_task,
        "source_status": status,
        "notes": clean(r.get("notes")),
    })


# -------------------------------
# SORT + DEDUP
# -------------------------------

normalized.sort(
    key=lambda x: (
        x["week"],
        x["session"]
    )
)

seen = set()
duplicates = []

for r in normalized:

    key2 = (
        r["week"],
        r["session"]
    )

    if key2 in seen:
        duplicates.append(key2)

    seen.add(key2)

if duplicates:
    raise SystemExit(
        f"STOP: duplicate week/session: {duplicates}"
    )


# -------------------------------
# VALIDATION
# -------------------------------

bad_page = []
bad_internal = []
locked_invalid = []
missing_sksp = []

internal_re = re.compile(
    r"\b(?:OCR|LOCAL_PROPOSED|LOCAL_VERIFIED|metadata|source evidence)\b",
    re.I
)

for r in normalized:

    wk = f"M{r['week']}S{r['session']}"

    if r["textbook_page"] and not re.fullmatch(
        r"\d+(?:-\d+)?",
        r["textbook_page"]
    ):
        bad_page.append(wk)

    if internal_re.search(
        r["source_task"]
    ):
        bad_internal.append(wk)

    if r["source_status"] == "SOURCE_LOCKED":
        if not r["textbook_page"] or not r["source_task"]:
            locked_invalid.append(wk)

    # Untuk sesi pengajaran, SK/SP sepatutnya ada.
    # Kita laporkan sahaja, tidak menciptanya.
    if not r["sk"] or not r["sp"]:
        missing_sksp.append(wk)


# -------------------------------
# WRITE OUTPUTS
# -------------------------------

OUT_JSON.write_text(
    json.dumps(
        normalized,
        ensure_ascii=False,
        indent=2
    ) + "\n",
    encoding="utf-8"
)

FIELDS = [
    "week",
    "session",
    "title",
    "sk",
    "sp",
    "textbook_page",
    "source_task",
    "source_status",
    "notes",
]

with OUT_CSV.open(
    "w",
    encoding="utf-8",
    newline=""
) as f:

    w = csv.DictWriter(
        f,
        fieldnames=FIELDS
    )

    w.writeheader()
    w.writerows(normalized)


counts = {
    "SOURCE_LOCKED": 0,
    "REVIEW": 0,
    "NEEDS_TEXTBOOK_EVIDENCE": 0,
}

for r in normalized:
    counts[r["source_status"]] += 1


weeks = sorted({
    r["week"]
    for r in normalized
})

sessions = len(normalized)


report = [
    "BAHASA ARAB TAHUN 1 — SOURCE BLUEPRINT AUDIT",
    "=" * 50,
    f"TOTAL ROWS                 = {sessions}",
    f"ACTIVE WEEKS               = {len(weeks)}",
    f"FIRST WEEK                 = {weeks[0] if weeks else '-'}",
    f"LAST WEEK                  = {weeks[-1] if weeks else '-'}",
    "",
    f"SOURCE_LOCKED              = {counts['SOURCE_LOCKED']}",
    f"REVIEW                     = {counts['REVIEW']}",
    f"NEEDS_TEXTBOOK_EVIDENCE    = {counts['NEEDS_TEXTBOOK_EVIDENCE']}",
    "",
    f"DUPLICATE WEEK+SESSION     = {len(duplicates)}",
    f"INVALID PAGE FORMAT        = {len(bad_page)}",
    f"INTERNAL TERMS             = {len(bad_internal)}",
    f"INVALID SOURCE_LOCKED      = {len(locked_invalid)}",
    f"MISSING SK/SP              = {len(missing_sksp)}",
    "",
    "DATABASE WRITE            = OFF",
    "ACTIVITY LIBRARY WRITE    = OFF",
    "",
    f"CSV                        = {OUT_CSV}",
    f"JSON                       = {OUT_JSON}",
]

AUDIT.write_text(
    "\n".join(report) + "\n",
    encoding="utf-8"
)

print()
print("\n".join(report))

if (
    not duplicates
    and not bad_page
    and not bad_internal
    and not locked_invalid
):
    print()
    print("✅ ARABIC_Y1_BLUEPRINT_DRAFT_PASS")
else:
    print()
    print("⚠️ BLUEPRINT PERLU SEMAKAN")
