#!/usr/bin/env python3

from pathlib import Path
from openai import OpenAI
import csv, json, os, re, hashlib, sys, time

if len(sys.argv) != 3:
    raise SystemExit(
        "Guna: python scripts/recover-science-y2-row-v4.py WEEK SESSION"
    )

WEEK = int(sys.argv[1])
SESSION = int(sys.argv[2])

ROOT = Path("rph-library/generated/science-y2")
MANIFEST = ROOT / "science-y2-MERGED-actual-manifest.csv"
CACHE = ROOT / "fable-row-cache" / f"w{WEEK:02d}-s{SESSION}.json"
LOGS = ROOT / "fable-row-logs"

CACHE.parent.mkdir(parents=True, exist_ok=True)
LOGS.mkdir(parents=True, exist_ok=True)

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
    int(x.strip())
    for x in target["source_pool_sessions"].split(",")
    if x.strip()
]

files = [
    x.strip()
    for x in target["blueprint_files"].split("|")
    if x.strip()
]

# ==========================================================
# Ambil sumber compact
# ==========================================================

parts = []

for src_session in pool:

    found = False

    for filename in files:

        p = Path(filename)

        if not p.exists():
            continue

        text = p.read_text(
            encoding="utf-8",
            errors="ignore"
        )

        positions = []

        for pattern in (
            f"|W{WEEK}|S{src_session}",
            f"|W{WEEK:02d}|S{src_session}",
        ):
            pos = text.find(pattern)
            if pos >= 0:
                positions.append(pos)

        if not positions:
            continue

        pos = min(positions)

        # Compact ~2.5k chars setiap source route
        a = max(0, pos - 800)
        b = min(len(text), pos + 1700)

        snippet = text[a:b]

        snippet = re.sub(
            r"[ \t]+",
            " ",
            snippet
        )

        parts.append(
            f"\n=== W{WEEK} SOURCE S{src_session} ===\n"
            + snippet
        )

        found = True
        break

    if not found:
        print(
            f"⚠️ W{WEEK} source S{src_session} tidak ditemui"
        )

if not parts:
    raise SystemExit("❌ Sumber compact kosong")

source = "\n".join(parts)

source_file = (
    LOGS /
    f"w{WEEK:02d}-s{SESSION}-V4-SOURCE.txt"
)

source_file.write_text(
    source,
    encoding="utf-8"
)

print("V4 source chars =", len(source))
print("Source-pool     =", ",".join(map(str,pool)))

# ==========================================================
# API
# ==========================================================

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

MODEL = "xyrz/claude-fable-5"

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


def make_key(name, method):

    slug = re.sub(
        r"[^a-z0-9]+",
        "_",
        name.lower()
    ).strip("_")[:42]

    digest = hashlib.sha1(
        (
            f"{WEEK}|{SESSION}|"
            f"{name}|{method}"
        ).encode()
    ).hexdigest()[:8]

    return (
        f"science_y2_w{WEEK:02d}_"
        f"s{SESSION}_{slug}_{digest}"
    )


# ==========================================================
# Parser fleksibel
# Terima ACTIVITY_NAME / ACTIVITY NAME / activity-name
# ==========================================================

FIELD_NAMES = [
    "ACTIVITY_NAME",
    "PHASE",
    "PDP_METHOD",
    "MATERIALS",
    "PENEROKA",
    "PEMBINA",
    "PENCABAR",
    "PBD_EVIDENCE",
]


def label_pattern(field):
    words = field.split("_")
    return r"[\s_-]*".join(map(re.escape, words))


def parse_fields(raw):

    raw = (
        (raw or "")
        .replace("```text", "")
        .replace("```json", "")
        .replace("```", "")
        .strip()
    )

    # Kalau formatter masih pilih JSON, terima juga.
    try:
        obj = json.loads(raw)

        if isinstance(obj, dict):

            mapping = {
                "ACTIVITY_NAME": "activity_name",
                "PHASE": "phase",
                "PDP_METHOD": "pdp_method",
                "MATERIALS": "materials",
                "PENEROKA": "peneroka",
                "PEMBINA": "pembina",
                "PENCABAR": "pencabar",
                "PBD_EVIDENCE": "pbd_evidence",
            }

            return {
                k: clean(obj.get(v, ""))
                for k, v in mapping.items()
            }

    except Exception:
        pass

    result = {}

    for i, field in enumerate(FIELD_NAMES):

        current = label_pattern(field)

        if i + 1 < len(FIELD_NAMES):
            nxt = label_pattern(FIELD_NAMES[i + 1])

            pat = (
                rf"(?ims)^\s*{current}\s*:\s*"
                rf"(.*?)"
                rf"(?=^\s*{nxt}\s*:)"
            )

        else:
            pat = (
                rf"(?ims)^\s*{current}\s*:\s*"
                rf"(.*?)\s*$"
            )

        m = re.search(pat, raw)

        result[field] = (
            clean(m.group(1))
            if m
            else ""
        )

    return result


# ==========================================================
# STAGE 1 — Kandungan pedagogi sahaja
# ==========================================================

content_prompt = f"""
Anda merancang SATU aktiviti PdP Sains Tahun 2.

Minggu sebenar: {WEEK}
Sesi sebenar: {SESSION}
Source-pool digabungkan: {pool}

Baca petikan route di bawah dan bina satu aktiviti kelas
yang menggabungkan isi penting route tersebut.

Fokus hanya kepada KANDUNGAN aktiviti.

Aktiviti mesti:
- realistik untuk murid Tahun 2;
- khusus kepada kandungan yang diberi;
- mempunyai cara pelaksanaan jelas;
- BBM praktikal;
- PdP Terbeza Peneroka/Pembina/Pencabar;
- PBD yang boleh guru lihat/dengar/semak.

JANGAN cipta:
- SK/SP;
- halaman;
- fakta baharu;
- tugasan buku baharu.

JANGAN sebut istilah:
source task, source evidence, blueprint, OCR,
metadata, hotfix, LOCAL_.

Tidak perlu JSON.
Tidak perlu ikut format teknikal.
Tulis ringkas tetapi lengkap.

PETIKAN ROUTE:
====================================
{source}
====================================
"""

# ==========================================================
# STAGE 2 — Format sahaja
# ==========================================================

def format_content(content):

    prompt = f"""
Formatkan kandungan PdP berikut.

JANGAN tambah fakta.
JANGAN buang maksud penting.
JANGAN reka kandungan baharu.

PHASE mesti salah satu:
input
guided
practice
game
evidence
sharing

Balas TEPAT menggunakan 8 label ini:

ACTIVITY_NAME:
PHASE:
PDP_METHOD:
MATERIALS:
PENEROKA:
PEMBINA:
PENCABAR:
PBD_EVIDENCE:

Semua 8 label WAJIB berisi.
Jangan markdown.
Jangan JSON.
Jangan tambah label lain.

KANDUNGAN:
-------------------------
{content}
-------------------------
"""

    r = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content":
                "Anda hanya memformat teks kepada 8 field yang diminta."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0,
        max_tokens=1200
    )

    return r.choices[0].message.content or ""


obj = None

for attempt in range(1, 5):

    print()
    print(
        f"🤖 V4 M{WEEK:02d} S{SESSION} "
        f"attempt {attempt}/4..."
    )

    try:

        # -------------------------------
        # Stage 1
        # -------------------------------

        r1 = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content":
                    "Pakar pedagogi Sains sekolah rendah Malaysia."
                },
                {
                    "role": "user",
                    "content": content_prompt
                }
            ],
            temperature=0.2,
            max_tokens=1600
        )

        content = (
            r1.choices[0].message.content
            or ""
        ).strip()

        (
            LOGS /
            f"w{WEEK:02d}-s{SESSION}-v4-content-{attempt}.txt"
        ).write_text(
            content,
            encoding="utf-8"
        )

        if len(content) < 80:
            raise ValueError(
                f"Stage1 terlalu pendek ({len(content)} chars)"
            )

        print(
            f"  Stage1 chars = {len(content)}"
        )

        # -------------------------------
        # Stage 2
        # -------------------------------

        formatted = format_content(content)

        (
            LOGS /
            f"w{WEEK:02d}-s{SESSION}-v4-format-{attempt}.txt"
        ).write_text(
            formatted,
            encoding="utf-8"
        )

        fields = parse_fields(formatted)

        missing = [
            f for f in FIELD_NAMES
            if not clean(fields.get(f))
        ]

        if missing:

            print(
                "  RAW FORMAT:",
                repr(formatted[:500])
            )

            raise ValueError(
                f"field kosong: {missing}"
            )

        phase = clean(
            fields["PHASE"]
        ).lower()

        if phase not in ALLOWED:
            raise ValueError(
                f"phase invalid: {phase}"
            )

        combined = " ".join(
            fields[f]
            for f in FIELD_NAMES
            if f != "PHASE"
        )

        if BAD.search(combined):
            raise ValueError(
                "istilah dalaman bocor"
            )

        name = clean(
            fields["ACTIVITY_NAME"]
        )

        method = clean(
            fields["PDP_METHOD"]
        )

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
            "materials": clean(fields["MATERIALS"]),

            "peneroka": clean(fields["PENEROKA"]),
            "pembina": clean(fields["PEMBINA"]),
            "pencabar": clean(fields["PENCABAR"]),

            "pbd_evidence":
                clean(fields["PBD_EVIDENCE"]),

            "is_game":
                phase == "game",

            "requires_source": True,

            "blueprint_route":
                f"M{WEEK}S{SESSION}",

            "source_pool_sessions":
                ",".join(map(str,pool)),
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
            f"✅ M{WEEK:02d} S{SESSION} RECOVERED V4"
        )
        print("Aktiviti:", obj["activity_name"])
        print("Phase:", obj["phase"])
        print("Source-pool:", obj["source_pool_sessions"])
        print("Cache:", CACHE)

        break

    except Exception as e:

        print("⚠️", e)

        if attempt < 4:
            time.sleep(2)


if obj is None:
    raise SystemExit(
        f"❌ M{WEEK:02d} S{SESSION} gagal V4"
    )
