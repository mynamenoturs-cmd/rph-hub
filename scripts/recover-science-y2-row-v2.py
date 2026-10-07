#!/usr/bin/env python3

from pathlib import Path
from openai import OpenAI
import csv, json, os, re, hashlib, sys, time

if len(sys.argv) != 3:
    raise SystemExit(
        "Guna: python scripts/recover-science-y2-row-v2.py WEEK SESSION"
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
        f"❌ M{WEEK:02d} S{SESSION} tiada dalam manifest"
    )

pool = [
    int(x)
    for x in target["source_pool_sessions"].split(",")
    if x.strip()
]

files = [
    x.strip()
    for x in target["blueprint_files"].split("|")
    if x.strip()
]

# ------------------------------------------------
# Ambil hanya source route sebenar yang diperlukan
# ------------------------------------------------

snippets = []

for filename in files:

    p = Path(filename)

    if not p.exists():
        raise SystemExit(f"❌ Blueprint tiada: {filename}")

    text = p.read_text(
        encoding="utf-8",
        errors="ignore"
    )

    for src_session in pool:

        patterns = [
            f"|W{WEEK}|S{src_session}",
            f"|W{WEEK:02d}|S{src_session}",
        ]

        found = False

        for pattern in patterns:

            start = 0

            while True:

                pos = text.find(pattern, start)

                if pos < 0:
                    break

                found = True

                a = max(0, pos - 1800)
                b = min(len(text), pos + 3200)

                snippet = text[a:b]

                tag = (
                    f"\n--- ROUTE "
                    f"W{WEEK} SOURCE-S{src_session} ---\n"
                )

                snippets.append(
                    tag + snippet
                )

                start = pos + len(pattern)

        if not found:
            print(
                f"⚠️ Route W{WEEK} S{src_session} "
                f"tidak ditemui dalam {filename}"
            )

if not snippets:
    raise SystemExit(
        "❌ Tiada exact route snippet ditemui"
    )

# Buang duplicate snippet
unique = []
seen = set()

for s in snippets:
    key = hashlib.sha1(
        s.encode("utf-8")
    ).hexdigest()

    if key not in seen:
        seen.add(key)
        unique.append(s)

source = "\n".join(unique)

snippet_file = (
    LOGS /
    f"w{WEEK:02d}-s{SESSION}-EXACT-SOURCE.txt"
)

snippet_file.write_text(
    source,
    encoding="utf-8"
)

print("Exact source chars =", len(source))
print("Exact source file  =", snippet_file)

base = (
    os.environ.get("OPENAI_API_BASE")
    or os.environ.get("OPENAI_BASE_URL")
)

key = os.environ.get("OPENAI_API_KEY")

if not base or not key:
    raise SystemExit("❌ API environment tidak lengkap")

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
    "sharing",
}

BAD = re.compile(
    r'OCR|LOCAL_PROPOSED|LOCAL_VERIFIED|'
    r'source task|source evidence|'
    r'blueprint|hotfix|metadata',
    re.I
)


def clean(v):
    return re.sub(
        r"\s+",
        " ",
        str(v or "")
    ).strip()


def escape_control_chars(s):

    out = []
    inside = False
    escaped = False

    for ch in s:

        if inside:

            if escaped:
                out.append(ch)
                escaped = False

            elif ch == "\\":
                out.append(ch)
                escaped = True

            elif ch == '"':
                out.append(ch)
                inside = False

            elif ch == "\n":
                out.append("\\n")

            elif ch == "\r":
                out.append("\\r")

            elif ch == "\t":
                out.append("\\t")

            else:
                out.append(ch)

        else:

            out.append(ch)

            if ch == '"':
                inside = True

    return "".join(out)


def balanced_object(raw):

    start = raw.find("{")

    if start < 0:
        return None

    depth = 0
    inside = False
    escaped = False

    for i in range(start, len(raw)):

        ch = raw[i]

        if inside:

            if escaped:
                escaped = False

            elif ch == "\\":
                escaped = True

            elif ch == '"':
                inside = False

            continue

        if ch == '"':
            inside = True

        elif ch == "{":
            depth += 1

        elif ch == "}":
            depth -= 1

            if depth == 0:
                return raw[start:i+1]

    return None


def extract_json(raw):

    raw = (
        (raw or "")
        .replace("```json", "")
        .replace("```JSON", "")
        .replace("```", "")
        .strip()
    )

    # 1. JSON terus
    try:
        x = json.loads(raw)

        if isinstance(x, dict):
            return x

        if isinstance(x, list) and len(x) == 1:
            return x[0]

    except Exception:
        pass

    # 2. Cari object seimbang
    candidate = balanced_object(raw)

    if candidate:

        try:
            return json.loads(candidate)
        except Exception:
            pass

        # 3. Repair control characters dalam string
        try:
            return json.loads(
                escape_control_chars(candidate)
            )
        except Exception:
            pass

    return None


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


schema = f"""
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
"""

prompt = f"""
Hasilkan SATU Activity Library untuk SAINS TAHUN 2.

Minggu sebenar: {WEEK}
Sesi sebenar: {SESSION}
Source-pool yang digabungkan: {pool}

Hanya potongan route yang diperlukan diberikan di bawah.

Gabungkan isi penting route tersebut menjadi SATU aktiviti PdP
yang boleh dilaksanakan dalam satu sesi kelas.

WAJIB:
- realistik untuk Tahun 2;
- aktiviti konkrit;
- BBM praktikal;
- PBD boleh dilihat/didengar/disemak;
- Peneroka = bantuan;
- Pembina = aras biasa;
- Pencabar = lanjutan;
- bahasa Melayu natural.

JANGAN:
- cipta SK/SP;
- cipta halaman;
- cipta fakta sains;
- cipta tugasan buku;
- sebut OCR, blueprint, source task, source evidence,
  metadata, hotfix atau LOCAL_.

phase hanya:
input
guided
practice
game
evidence
sharing

Balas tepat SATU JSON object sahaja.
Tiada markdown.
Tiada ayat sebelum JSON.
Tiada ayat selepas JSON.

FORMAT:
{schema}

EXACT ROUTES:
================================
{source}
================================
"""


def repair_response(raw):

    repair_prompt = f"""
Tukar kandungan berikut kepada SATU valid JSON object.

JANGAN tambah fakta baharu.
JANGAN ubah maksud aktiviti.
JANGAN beri penerangan.

Gunakan schema tepat ini:

{schema}

KANDUNGAN UNTUK DIBAIKI:
------------------------
{raw[:10000]}
------------------------

JSON SAHAJA.
"""

    r = client.chat.completions.create(
        model="xyrz/claude-fable-5",
        messages=[
            {
                "role": "system",
                "content":
                "Repair malformed output into valid JSON only."
            },
            {
                "role": "user",
                "content": repair_prompt
            }
        ],
        temperature=0,
        max_tokens=1600
    )

    return r.choices[0].message.content or ""


obj = None

for attempt in range(1, 5):

    print(
        f"🤖 Exact-route recovery "
        f"{attempt}/4..."
    )

    try:

        r = client.chat.completions.create(
            model="xyrz/claude-fable-5",
            messages=[
                {
                    "role": "system",
                    "content":
                    "Return one valid JSON object only."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0,
            max_tokens=1800
        )

        raw = r.choices[0].message.content or ""

        raw_file = (
            LOGS /
            f"w{WEEK:02d}-s{SESSION}-v2-{attempt}.txt"
        )

        raw_file.write_text(
            raw,
            encoding="utf-8"
        )

        x = extract_json(raw)

        # Kalau format rosak, suruh Fable repair
        if x is None:

            print("⚠️ Output bukan JSON — repair pass...")

            repaired = repair_response(raw)

            (
                LOGS /
                f"w{WEEK:02d}-s{SESSION}-v2-{attempt}-REPAIRED.txt"
            ).write_text(
                repaired,
                encoding="utf-8"
            )

            x = extract_json(repaired)

        if x is None:
            raise ValueError(
                "JSON masih tidak dapat dipulihkan"
            )

        if int(x.get("week", -1)) != WEEK:
            raise ValueError("week mismatch")

        if int(x.get("session", -1)) != SESSION:
            raise ValueError("session mismatch")

        phase = clean(
            x.get("phase")
        ).lower()

        if phase not in ALLOWED:
            raise ValueError(
                f"phase invalid: {phase}"
            )

        required = [
            "activity_name",
            "pdp_method",
            "materials",
            "peneroka",
            "pembina",
            "pencabar",
            "pbd_evidence",
        ]

        missing = [
            k for k in required
            if not clean(x.get(k))
        ]

        if missing:
            raise ValueError(
                f"field kosong: {missing}"
            )

        combined = " ".join(
            clean(x[k])
            for k in required
        )

        if BAD.search(combined):
            raise ValueError(
                "istilah dalaman bocor"
            )

        name = clean(
            x["activity_name"]
        )

        method = clean(
            x["pdp_method"]
        )

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
                ",".join(map(str, pool)),
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
            f"✅ M{WEEK:02d} S{SESSION} RECOVERED V2"
        )
        print("Aktiviti:", obj["activity_name"])
        print("Phase:", obj["phase"])
        print(
            "Source-pool:",
            obj["source_pool_sessions"]
        )

        break

    except Exception as e:

        print("⚠️", e)

        if attempt < 4:
            time.sleep(2)

if obj is None:
    raise SystemExit(
        f"❌ M{WEEK:02d} S{SESSION} masih gagal V2"
    )
