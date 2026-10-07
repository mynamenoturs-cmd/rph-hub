#!/usr/bin/env python3

from pathlib import Path
from openai import OpenAI
import csv, json, os, re, hashlib, sys, time

if len(sys.argv) != 3:
    raise SystemExit(
        "Guna: python scripts/recover-science-y2-row.py WEEK SESSION"
    )

WEEK = int(sys.argv[1])
SESSION = int(sys.argv[2])

ROOT = Path("rph-library/generated/science-y2")

MANIFEST = ROOT / "science-y2-MERGED-actual-manifest.csv"
CACHE = ROOT / "fable-row-cache" / f"w{WEEK:02d}-s{SESSION}.json"
LOGS = ROOT / "fable-row-logs"

LOGS.mkdir(parents=True, exist_ok=True)
CACHE.parent.mkdir(parents=True, exist_ok=True)

rows = list(csv.DictReader(
    MANIFEST.open(encoding="utf-8")
))

target = next(
    (
        r for r in rows
        if int(r["week"]) == WEEK
        and int(r["session"]) == SESSION
    ),
    None
)

if not target:
    raise SystemExit(
        f"❌ Route M{WEEK:02d} S{SESSION} tidak dijumpai"
    )

pool = target["source_pool_sessions"]

files = [
    x.strip()
    for x in target["blueprint_files"].split("|")
    if x.strip()
]

parts = []

for name in files:
    p = Path(name)

    if not p.exists():
        raise SystemExit(f"❌ Blueprint tiada: {name}")

    parts.append(
        p.read_text(
            encoding="utf-8",
            errors="ignore"
        )
    )

source = "\n\n".join(parts)

base = (
    os.environ.get("OPENAI_API_BASE")
    or os.environ.get("OPENAI_BASE_URL")
)

key = os.environ.get("OPENAI_API_KEY")

client = OpenAI(
    api_key=key,
    base_url=base
)

ALLOWED = {
    "input",
    "guided",
    "practice",
    "game",
    "evidence",
    "sharing"
}

BAD = re.compile(
    r'OCR|LOCAL_PROPOSED|LOCAL_VERIFIED|'
    r'source task|source evidence|blueprint|'
    r'hotfix|metadata',
    re.I
)


def clean(v):
    return re.sub(
        r"\s+",
        " ",
        str(v or "")
    ).strip()


def extract(raw):

    raw = raw or ""

    raw = re.sub(
        r"\x1b\[[0-?]*[ -/]*[@-~]",
        "",
        raw
    )

    raw = (
        raw
        .replace("```json", "")
        .replace("```JSON", "")
        .replace("```", "")
        .strip()
    )

    try:
        obj = json.loads(raw)

        if isinstance(obj, dict):
            return obj

        if isinstance(obj, list) and len(obj) == 1:
            return obj[0]

    except Exception:
        pass

    dec = json.JSONDecoder()

    for i, ch in enumerate(raw):
        if ch != "{":
            continue

        try:
            obj, _ = dec.raw_decode(raw[i:])

            if isinstance(obj, dict):
                return obj

        except Exception:
            continue

    raise ValueError("JSON object tidak dijumpai")


def make_key(name, method):

    slug = re.sub(
        r"[^a-z0-9]+",
        "_",
        name.lower()
    ).strip("_")[:42]

    digest = hashlib.sha1(
        f"{WEEK}|{SESSION}|{name}|{method}".encode()
    ).hexdigest()[:8]

    return (
        f"science_y2_w{WEEK:02d}_"
        f"s{SESSION}_{slug}_{digest}"
    )


prompt = f"""
HASILKAN SATU JSON OBJECT SAHAJA.

SAINS TAHUN 2
Minggu sebenar: {WEEK}
Sesi sebenar: {SESSION}
Source-pool yang digabungkan: [{pool}]

Semua route source-pool [{pool}] mesti digabungkan
menjadi SATU aliran PdP yang realistik.

Anda menentukan CARA PdP sahaja.

JANGAN:
- cipta SK/SP;
- cipta halaman;
- cipta fakta;
- cipta aktiviti buku;
- buang isi penting route;
- sebut blueprint, source task, source evidence,
  OCR, metadata, hotfix atau LOCAL_.

Aktiviti mesti:
- sesuai murid Tahun 2;
- khusus kepada isi sesi ini;
- satu aktiviti bersepadu;
- BBM praktikal;
- PBD boleh diperhatikan;
- Peneroka/Pembina/Pencabar;
- bahasa Melayu natural.

phase mesti salah satu:
input
guided
practice
game
evidence
sharing

PENTING:
Jawapan WAJIB bermula dengan {{
dan tamat dengan }}.

JANGAN beri penerangan.
JANGAN markdown.

FORMAT:

{{
 "week": {WEEK},
 "session": {SESSION},
 "activity_name": "",
 "phase": "practice",
 "pdp_method": "",
 "materials": "",
 "peneroka": "",
 "pembina": "",
 "pencabar": "",
 "pbd_evidence": "",
 "is_game": false,
 "requires_source": true
}}

KANDUNGAN BLUEPRINT:
--------------------
{source}
--------------------

Ambil HANYA Minggu {WEEK},
source-pool [{pool}],
untuk Sesi sebenar {SESSION}.

JSON SAHAJA.
"""

obj = None

for attempt in range(1, 7):

    print(
        f"🤖 Recovery M{WEEK:02d} "
        f"S{SESSION} attempt {attempt}/6..."
    )

    try:

        res = client.chat.completions.create(
            model="xyrz/claude-fable-5",
            messages=[
                {
                    "role": "system",
                    "content":
                    "Return exactly one valid JSON object. "
                    "No prose and no markdown."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0,
            max_tokens=1800
        )

        raw = res.choices[0].message.content or ""

        (
            LOGS /
            f"w{WEEK:02d}-s{SESSION}-recovery-{attempt}.txt"
        ).write_text(
            raw,
            encoding="utf-8"
        )

        x = extract(raw)

        if int(x.get("week", -1)) != WEEK:
            raise ValueError("week mismatch")

        if int(x.get("session", -1)) != SESSION:
            raise ValueError("session mismatch")

        phase = clean(
            x.get("phase")
        ).lower()

        if phase not in ALLOWED:
            raise ValueError(
                f"invalid phase={phase}"
            )

        required = [
            "activity_name",
            "pdp_method",
            "materials",
            "peneroka",
            "pembina",
            "pencabar",
            "pbd_evidence"
        ]

        missing = [
            f for f in required
            if not clean(x.get(f))
        ]

        if missing:
            raise ValueError(
                f"field kosong: {missing}"
            )

        combined = " ".join(
            clean(x[f])
            for f in required
        )

        if BAD.search(combined):
            raise ValueError(
                "istilah dalaman bocor"
            )

        name = clean(x["activity_name"])
        method = clean(x["pdp_method"])

        is_game = bool(
            x.get("is_game", False)
        )

        if phase == "game":
            is_game = True

        obj = {
            "week": WEEK,
            "session": SESSION,

            "activity_key":
                make_key(name, method),

            "subject_key": "science",
            "year": 2,
            "skill_key": "general",
            "subskill_key": "general",
            "level_key": "all",

            "phase": phase,
            "activity_name": name,
            "pdp_method": method,
            "materials": clean(x["materials"]),

            "peneroka": clean(x["peneroka"]),
            "pembina": clean(x["pembina"]),
            "pencabar": clean(x["pencabar"]),

            "pbd_evidence":
                clean(x["pbd_evidence"]),

            "is_game": is_game,
            "requires_source": True,

            "blueprint_route":
                f"M{WEEK}S{SESSION}",

            "source_pool_sessions":
                pool
        }

        CACHE.write_text(
            json.dumps(
                obj,
                ensure_ascii=False,
                indent=2
            ) + "\n",
            encoding="utf-8"
        )

        print()
        print(
            f"✅ M{WEEK:02d} S{SESSION} RECOVERED"
        )
        print(
            "Aktiviti:",
            obj["activity_name"]
        )
        print(
            "Phase:",
            obj["phase"]
        )
        print(
            "Source-pool:",
            pool
        )
        print(
            "Cache:",
            CACHE
        )

        break

    except Exception as e:
        print("⚠️", e)

        if attempt < 6:
            time.sleep(2)


if obj is None:
    raise SystemExit(
        f"❌ M{WEEK:02d} S{SESSION} masih gagal"
    )
