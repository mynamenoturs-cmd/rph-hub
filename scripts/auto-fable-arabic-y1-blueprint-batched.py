#!/usr/bin/env python3

from pathlib import Path
from openai import OpenAI
import csv, json, os, re, time

ROOT = Path("rph-library/generated/arabic-y1")
RPT = Path("/tmp/arabic-y1-rpt.txt")

CACHE = ROOT / "batch-cache"
LOGS = ROOT / "batch-logs"

OUT = ROOT / "arabic-y1-source-blueprint-draft.csv"
AUDIT = ROOT / "arabic-y1-source-blueprint-audit.txt"

CACHE.mkdir(parents=True, exist_ok=True)
LOGS.mkdir(parents=True, exist_ok=True)

MODEL = "xyrz/claude-fable-5"

base = os.environ.get("OPENAI_API_BASE") or os.environ.get("OPENAI_BASE_URL")
key = os.environ.get("OPENAI_API_KEY")

if not base or not key:
    raise SystemExit("API environment belum lengkap")

if not RPT.exists():
    raise SystemExit("RPT text tidak ditemui")

client = OpenAI(api_key=key, base_url=base)

RPT_TEXT = RPT.read_text(encoding="utf-8", errors="ignore")

BATCHES = [
    (1,5),(6,10),(11,15),(16,20),(21,25),
    (26,30),(31,35),(36,40),(41,45)
]

VALID_STATUS = {
    "SOURCE_LOCKED",
    "REVIEW",
    "NEEDS_TEXTBOOK_EVIDENCE"
}


def clean(v):
    return re.sub(r"\s+", " ", str(v or "")).strip()


def extract_json(raw):
    raw = re.sub(r"\x1b\[[0-?]*[ -/]*[@-~]", "", raw or "")
    raw = raw.replace("```json", "").replace("```", "")

    dec = json.JSONDecoder()

    # Array terus
    for i, ch in enumerate(raw):
        if ch != "[":
            continue
        try:
            obj, _ = dec.raw_decode(raw[i:])
            if isinstance(obj, list):
                return obj
        except Exception:
            pass

    # Sesetengah model balas {"rows":[...]}
    for i, ch in enumerate(raw):
        if ch != "{":
            continue
        try:
            obj, _ = dec.raw_decode(raw[i:])
            if isinstance(obj, dict):
                for k in ("rows","sessions","data","items"):
                    if isinstance(obj.get(k), list):
                        return obj[k]
        except Exception:
            pass

    raise ValueError("JSON array/object rows tidak dijumpai")


def normalize(r):
    week = int(r["week"])
    session = int(r["session"])

    page = clean(r.get("textbook_page"))

    page = re.sub(
        r"(?i)\b(?:m\s*/\s*s|halaman|pages?|p\.)\b",
        "",
        page
    ).strip()

    page = page.replace("–", "-")

    if page and not re.fullmatch(r"\d+(?:\s*-\s*\d+)?", page):
        page = ""

    page = re.sub(r"\s+", "", page)

    task = clean(r.get("source_task"))

    status = clean(r.get("source_status")).upper()

    if status not in VALID_STATUS:
        status = "NEEDS_TEXTBOOK_EVIDENCE"

    # Tidak boleh lock tanpa dua bukti ini.
    if status == "SOURCE_LOCKED" and (not page or not task):
        status = "NEEDS_TEXTBOOK_EVIDENCE"

    return {
        "week": week,
        "session": session,
        "title": clean(r.get("title")),
        "sk": clean(r.get("sk")),
        "sp": clean(r.get("sp")),
        "textbook_page": page,
        "source_task": task,
        "source_status": status,
        "notes": clean(r.get("notes"))
    }


all_rows = []


for start, end in BATCHES:

    cache = CACHE / f"weeks-{start:02d}-{end:02d}.json"

    print()
    print("=" * 48)
    print(f"BAHASA ARAB T1 — M{start}-M{end}")
    print("=" * 48)

    if cache.exists():
        try:
            batch = json.loads(cache.read_text(encoding="utf-8"))
            print(f"✅ CACHE — {len(batch)} rows")
            all_rows.extend(batch)
            continue
        except Exception:
            pass

    prompt = f"""
Ekstrak HANYA sesi Bahasa Arab Tahun 1 untuk Minggu {start} hingga {end}.

Gunakan RPT yang diberikan sebagai satu-satunya sumber kebenaran.

JANGAN cipta:
- SK
- SP
- halaman Buku Teks
- Source_Task
- aktiviti buku.

Jika bukti tiada, kosongkan field itu.

Output SATU JSON ARRAY sahaja.

Setiap object WAJIB mempunyai:

{{
  "week": 1,
  "session": 1,
  "title": "",
  "sk": "",
  "sp": "",
  "textbook_page": "",
  "source_task": "",
  "source_status": "NEEDS_TEXTBOOK_EVIDENCE",
  "notes": ""
}}

source_status hanya:
SOURCE_LOCKED
REVIEW
NEEDS_TEXTBOOK_EVIDENCE

SOURCE_LOCKED hanya jika RPT memberikan halaman tepat
DAN Source_Task konkrit.

REVIEW jika RPT sendiri menandakan item untuk semakan.

Jika hanya ada Fokus/Aktiviti Cadangan generik,
source_task mesti kosong dan gunakan
NEEDS_TEXTBOOK_EVIDENCE.

Jangan keluarkan minggu di luar {start}-{end}.

RPT:

----- BEGIN RPT -----
{RPT_TEXT}
----- END RPT -----

JSON ARRAY SAHAJA.
"""

    success = False

    for attempt in range(1,4):

        print(f"🤖 Fable attempt {attempt}/3...")

        try:
            res = client.chat.completions.create(
                model=MODEL,
                messages=[
                    {
                        "role":"system",
                        "content":
                        "Anda extractor source-first. "
                        "Balas JSON sahaja dan jangan mereka fakta."
                    },
                    {
                        "role":"user",
                        "content":prompt
                    }
                ],
                temperature=0,
                max_tokens=5000
            )

            raw = res.choices[0].message.content or ""

            (LOGS / f"weeks-{start:02d}-{end:02d}-attempt-{attempt}.txt").write_text(
                raw,
                encoding="utf-8"
            )

            rows = extract_json(raw)

            batch = []

            for r in rows:
                x = normalize(r)

                if not (start <= x["week"] <= end):
                    continue

                batch.append(x)

            batch.sort(key=lambda x:(x["week"],x["session"]))

            # duplicate dalam batch
            keys = [(x["week"],x["session"]) for x in batch]

            if len(keys) != len(set(keys)):
                raise ValueError("duplicate week/session dalam batch")

            cache.write_text(
                json.dumps(batch,ensure_ascii=False,indent=2) + "\n",
                encoding="utf-8"
            )

            print(f"✅ M{start}-M{end}: {len(batch)} rows")

            all_rows.extend(batch)
            success = True
            break

        except Exception as e:
            print("⚠️",e)
            time.sleep(2)

    if not success:
        raise SystemExit(
            f"❌ STOP batch M{start}-M{end}"
        )


# GLOBAL DEDUP
all_rows.sort(key=lambda x:(x["week"],x["session"]))

seen=set()

for r in all_rows:
    k=(r["week"],r["session"])

    if k in seen:
        raise SystemExit(f"Duplicate global: {k}")

    seen.add(k)


FIELDS=[
    "week",
    "session",
    "title",
    "sk",
    "sp",
    "textbook_page",
    "source_task",
    "source_status",
    "notes"
]

with OUT.open("w",encoding="utf-8",newline="") as f:
    w=csv.DictWriter(f,fieldnames=FIELDS)
    w.writeheader()
    w.writerows(all_rows)


counts={x:0 for x in VALID_STATUS}

invalid_page=[]
bad_internal=[]
missing_sksp=[]

bad_re=re.compile(
    r"OCR|LOCAL_PROPOSED|LOCAL_VERIFIED|metadata|source evidence",
    re.I
)

for r in all_rows:

    counts[r["source_status"]] += 1

    if r["textbook_page"] and not re.fullmatch(
        r"\d+(?:-\d+)?",
        r["textbook_page"]
    ):
        invalid_page.append((r["week"],r["session"]))

    if bad_re.search(r["source_task"]):
        bad_internal.append((r["week"],r["session"]))

    if not r["sk"] or not r["sp"]:
        missing_sksp.append((r["week"],r["session"]))


weeks=sorted({r["week"] for r in all_rows})

report=[
    "BAHASA ARAB TAHUN 1 — BATCHED SOURCE BLUEPRINT",
    "="*52,

    f"TOTAL ROWS                 = {len(all_rows)}",
    f"ACTIVE WEEKS               = {len(weeks)}",

    "",
    f"SOURCE_LOCKED              = {counts['SOURCE_LOCKED']}",
    f"REVIEW                     = {counts['REVIEW']}",
    f"NEEDS_TEXTBOOK_EVIDENCE    = {counts['NEEDS_TEXTBOOK_EVIDENCE']}",

    "",
    f"INVALID PAGE               = {len(invalid_page)}",
    f"INTERNAL TERMS             = {len(bad_internal)}",
    f"MISSING SK/SP              = {len(missing_sksp)}",

    "",
    "DATABASE WRITE            = OFF",
    "ACTIVITY LIBRARY WRITE    = OFF",
    f"CSV                        = {OUT}"
]

AUDIT.write_text(
    "\n".join(report)+"\n",
    encoding="utf-8"
)

print()
print("\n".join(report))

if not invalid_page and not bad_internal:
    print()
    print("✅ ARABIC_Y1_BATCHED_BLUEPRINT_PASS")
else:
    print()
    print("⚠️ BLUEPRINT PERLU SEMAKAN")
