#!/usr/bin/env python3

from pathlib import Path
from openai import OpenAI
import csv, json, os, re, hashlib, sys, time

if len(sys.argv) != 3:
    raise SystemExit(
        "Guna: python scripts/recover-science-y2-row-v3.py WEEK SESSION"
    )

WEEK = int(sys.argv[1])
SESSION = int(sys.argv[2])

ROOT = Path("rph-library/generated/science-y2")
MANIFEST = ROOT / "science-y2-MERGED-actual-manifest.csv"

CACHE = (
    ROOT / "fable-row-cache" /
    f"w{WEEK:02d}-s{SESSION}.json"
)

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
        f"❌ Route M{WEEK:02d} S{SESSION} tiada"
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

# ============================================================
# COMPACT EXACT SOURCE
# Ambil hanya konteks dekat route sasaran.
# ============================================================

parts = []

for src_session in pool:

    found_for_session = False

    for filename in files:

        p = Path(filename)

        if not p.exists():
            continue

        text = p.read_text(
            encoding="utf-8",
            errors="ignore"
        )

        patterns = [
            f"|W{WEEK}|S{src_session}",
            f"|W{WEEK:02d}|S{src_session}",
        ]

        pos = -1

        for pat in patterns:
            pos = text.find(pat)

            if pos >= 0:
                break

        if pos < 0:
            continue

        # Lebih kecil daripada V2:
        # ~3.2k maksimum setiap source route.
        start = max(0, pos - 1100)
        end = min(len(text), pos + 2100)

        snippet = text[start:end]

        # Compact whitespace tetapi kekalkan kandungan.
        snippet = re.sub(
            r"[ \t]+",
            " ",
            snippet
        )

        parts.append(
            f"\n=== SOURCE ROUTE "
            f"W{WEEK} S{src_session} ===\n"
            + snippet
        )

        found_for_session = True

        # Satu exact occurrence mencukupi bagi source session.
        break

    if not found_for_session:
        print(
            f"⚠️ Exact source W{WEEK} S{src_session} "
            f"tidak dijumpai"
        )

if not parts:
    raise SystemExit(
        "❌ Tiada exact source dapat diekstrak"
    )

source = "\n".join(parts)

source_file = (
    LOGS /
    f"w{WEEK:02d}-s{SESSION}-V3-COMPACT-SOURCE.txt"
)

source_file.write_text(
    source,
    encoding="utf-8"
)

print("V3 source chars =", len(source))
print("Source-pool     =", ",".join(map(str,pool)))
print("Source file     =", source_file)

# ============================================================
# API
# ============================================================

base = (
    os.environ.get("OPENAI_API_BASE")
    or os.environ.get("OPENAI_BASE_URL")
)

key = os.environ.get("OPENAI_API_KEY")

if not base or not key:
    raise SystemExit("❌ API env tidak lengkap")

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


# ============================================================
# PARSE FIELD OUTPUT
# Tidak bergantung pada JSON.
# ============================================================

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


def parse_fields(raw):

    raw = (
        (raw or "")
        .replace("```text", "")
        .replace("```", "")
        .strip()
    )

    result = {}

    for i, field in enumerate(FIELD_NAMES):

        if i + 1 < len(FIELD_NAMES):
            nxt = FIELD_NAMES[i + 1]

            pattern = (
                rf"(?ims)^\s*{re.escape(field)}\s*:\s*"
                rf"(.*?)"
                rf"(?=^\s*{re.escape(nxt)}\s*:)"
            )

        else:
            pattern = (
                rf"(?ims)^\s*{re.escape(field)}\s*:\s*"
                rf"(.*?)\s*$"
            )

        m = re.search(pattern, raw)

        if m:
            result[field] = clean(m.group(1))
        else:
            result[field] = ""

    return result


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


prompt = f"""
Anda membina SATU aktiviti PdP Sains Tahun 2.

Minggu sebenar: {WEEK}
Sesi sebenar: {SESSION}
Source-pool digabungkan: {pool}

Gunakan kandungan route yang diberikan sahaja.

TUGAS:
Gabungkan isi penting semua route tersebut menjadi
SATU aliran aktiviti PdP yang realistik untuk satu sesi.

Jangan cipta:
- SK atau SP;
- halaman;
- fakta sains;
- tugasan buku baharu.

Jangan sebut:
OCR, blueprint, source task, source evidence,
metadata, hotfix atau LOCAL_.

Aktiviti mesti:
- sesuai murid Tahun 2;
- konkrit dan boleh dibuat dalam kelas;
- mempunyai BBM praktikal;
- mempunyai PBD yang boleh guru lihat/dengar/semak;
- mengandungi PdP Terbeza:
  Peneroka, Pembina, Pencabar;
- bahasa Melayu natural;
- tidak berbunyi seperti arahan sistem.

PHASE hanya salah satu:
input
guided
practice
game
evidence
sharing

PENTING:
JANGAN keluarkan JSON.

Balas TEPAT menggunakan 8 label berikut.
Setiap label mesti ada isi.

ACTIVITY_NAME:
PHASE:
PDP_METHOD:
MATERIALS:
PENEROKA:
PEMBINA:
PENCABAR:
PBD_EVIDENCE:

Jangan tambah label lain.
Jangan markdown.

EXACT SOURCE:
========================================
{source}
========================================
"""

obj = None

for attempt in range(1, 5):

    print()
    print(
        f"🤖 V3 recovery M{WEEK:02d} "
        f"S{SESSION} attempt {attempt}/4..."
    )

    try:

        r = client.chat.completions.create(
            model="xyrz/claude-fable-5",

            messages=[
                {
                    "role": "system",
                    "content":
                    "Ikut format field berlabel dengan tepat. "
                    "Jangan gunakan JSON."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],

            temperature=0,
            max_tokens=1600
        )

        raw = (
            r.choices[0].message.content
            or ""
        )

        log = (
            LOGS /
            f"w{WEEK:02d}-s{SESSION}-v3-{attempt}.txt"
        )

        log.write_text(
            raw,
            encoding="utf-8"
        )

        f = parse_fields(raw)

        missing = [
            name
            for name in FIELD_NAMES
            if not clean(f.get(name))
        ]

        if missing:
            raise ValueError(
                f"field kosong: {missing}"
            )

        phase = clean(
            f["PHASE"]
        ).lower()

        if phase not in ALLOWED:
            raise ValueError(
                f"phase invalid: {phase}"
            )

        content_fields = [
            "ACTIVITY_NAME",
            "PDP_METHOD",
            "MATERIALS",
            "PENEROKA",
            "PEMBINA",
            "PENCABAR",
            "PBD_EVIDENCE",
        ]

        combined = " ".join(
            clean(f[x])
            for x in content_fields
        )

        if BAD.search(combined):
            raise ValueError(
                "istilah dalaman bocor"
            )

        name = clean(
            f["ACTIVITY_NAME"]
        )

        method = clean(
            f["PDP_METHOD"]
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

            "pdp_method":
                method,

            "materials":
                clean(f["MATERIALS"]),

            "peneroka":
                clean(f["PENEROKA"]),

            "pembina":
                clean(f["PEMBINA"]),

            "pencabar":
                clean(f["PENCABAR"]),

            "pbd_evidence":
                clean(f["PBD_EVIDENCE"]),

            "is_game":
                phase == "game",

            "requires_source":
                True,

            "blueprint_route":
                f"M{WEEK}S{SESSION}",

            "source_pool_sessions":
                ",".join(
                    map(str,pool)
                ),
        }

        # Python yang bina JSON.
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
            f"✅ M{WEEK:02d} S{SESSION} "
            f"RECOVERED V3"
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
            obj["source_pool_sessions"]
        )
        print(
            "Cache:",
            CACHE
        )

        break

    except Exception as e:

        print("⚠️", e)

        if attempt < 4:
            time.sleep(2)


if obj is None:
    raise SystemExit(
        f"❌ M{WEEK:02d} S{SESSION} gagal V3"
    )
