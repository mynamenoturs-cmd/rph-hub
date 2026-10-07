#!/usr/bin/env python3

from pathlib import Path
from openai import OpenAI
import csv
import json
import os
import re
import hashlib
import sys
import time

if len(sys.argv) != 3:
    raise SystemExit(
        "Guna: python scripts/recover-science-y2-row-v5.py WEEK SESSION"
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

ALLOWED_PHASES = {
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

FAIL_TEXT = re.compile(
    r'maaf.*salah|jawaban saya|'
    r'error|ralat',
    re.I
)


def clean(v):
    return re.sub(
        r"\s+",
        " ",
        str(v or "")
    ).strip()


def call_fable(prompt, max_tokens=900):

    r = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content":
                "Ikut arahan dengan tepat. "
                "Gunakan Bahasa Melayu ringkas dan jelas."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0,
        max_tokens=max_tokens
    )

    return (
        r.choices[0].message.content
        or ""
    ).strip()


def extract_route_source(src_session):

    for filename in files:

        p = Path(filename)

        if not p.exists():
            continue

        text = p.read_text(
            encoding="utf-8",
            errors="ignore"
        )

        pos = -1

        for marker in (
            f"|W{WEEK}|S{src_session}",
            f"|W{WEEK:02d}|S{src_session}",
        ):

            pos = text.find(marker)

            if pos >= 0:
                break

        if pos < 0:
            continue

        # Kecilkan setiap route.
        a = max(0, pos - 650)
        b = min(len(text), pos + 1450)

        raw = text[a:b]

        # Ambil string manusia daripada JS.
        strings = []

        for m in re.finditer(
            r'''["']([^"'\\]{8,500})["']''',
            raw
        ):

            s = clean(m.group(1))

            if not s:
                continue

            if re.search(
                r'hotfix|blueprint|LOCAL_|OCR|'
                r'^\w+\|W\d+\|S\d+$',
                s,
                re.I
            ):
                continue

            strings.append(s)

        human = " | ".join(strings)

        # Jika ekstrak string terlalu sedikit,
        # fallback kepada snippet compact.
        if len(human) < 180:
            human = clean(raw)

        return human[:2600]

    return ""


def parse_labels(text):

    wanted = {
        "ACTIVITY_NAME",
        "PHASE",
        "PDP_METHOD",
        "MATERIALS",
        "PENEROKA",
        "PEMBINA",
        "PENCABAR",
        "PBD_EVIDENCE",
    }

    out = {}
    current = None

    for line in (text or "").splitlines():

        line = line.strip()

        if not line:
            continue

        if ":" in line:

            left, right = line.split(":", 1)

            key = re.sub(
                r"[\s\-]+",
                "_",
                left.strip().upper()
            )

            if key in wanted:

                current = key
                out[key] = clean(right)
                continue

        if current:
            out[current] = clean(
                out[current] + " " + line
            )

    return out


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


# =====================================================
# STAGE A — ringkaskan setiap source route secara asing
# =====================================================

summaries = []

print(
    f"M{WEEK:02d} S{SESSION} "
    f"source-pool = {','.join(map(str,pool))}"
)

for src_session in pool:

    source = extract_route_source(src_session)

    if not source:
        raise SystemExit(
            f"❌ Source W{WEEK} S{src_session} tidak ditemui"
        )

    source_path = (
        LOGS /
        f"w{WEEK:02d}-actual-s{SESSION}-"
        f"src-s{src_session}-v5.txt"
    )

    source_path.write_text(
        source,
        encoding="utf-8"
    )

    print()
    print(
        f"🔎 SOURCE S{src_session}: "
        f"{len(source)} chars"
    )

    prompt = f"""
SAINS TAHUN 2.

Ini SATU route sumber sahaja:
Minggu {WEEK}, source-pool S{src_session}.

Ekstrak kandungan yang benar-benar dinyatakan.

Jangan reka fakta.
Jangan reka halaman.
Jangan reka SK/SP.
Jangan bina RPH lagi.

Balas tepat empat baris:

FOKUS:
TUGASAN:
BAHAN:
BUKTI:

Jika sesuatu tidak dinyatakan, tulis:
tidak dinyatakan

SUMBER:
--------------------------
{source}
--------------------------
"""

    summary = None

    for attempt in range(1, 4):

        print(
            f"🤖 Extract S{src_session} "
            f"{attempt}/3..."
        )

        raw = call_fable(
            prompt,
            max_tokens=650
        )

        (
            LOGS /
            f"w{WEEK:02d}-s{SESSION}-"
            f"src{src_session}-extract-{attempt}.txt"
        ).write_text(
            raw,
            encoding="utf-8"
        )

        if (
            len(raw) >= 60
            and not FAIL_TEXT.search(raw)
            and "FOKUS" in raw.upper()
            and "TUGASAN" in raw.upper()
        ):
            summary = raw
            print("✅ Extract OK")
            break

        print(
            "⚠️ Extract tidak sah:",
            repr(raw[:120])
        )

        time.sleep(1)

    if not summary:
        raise SystemExit(
            f"❌ Source S{src_session} gagal diringkaskan"
        )

    summaries.append(
        f"SOURCE S{src_session}\n{summary}"
    )


merged_source = "\n\n".join(summaries)

merged_path = (
    LOGS /
    f"w{WEEK:02d}-s{SESSION}-V5-MERGED-SUMMARY.txt"
)

merged_path.write_text(
    merged_source,
    encoding="utf-8"
)

print()
print(
    "✅ Semua source route diringkaskan"
)
print(
    "Merged chars =",
    len(merged_source)
)


# =====================================================
# STAGE B — bina aktiviti daripada ringkasan kecil sahaja
# =====================================================

final_prompt = f"""
Bina SATU aktiviti PdP SAINS TAHUN 2.

Minggu: {WEEK}
Sesi sebenar: {SESSION}

Aktiviti ini menggabungkan source-pool:
{','.join(map(str,pool))}

Di bawah ialah RINGKASAN SAH bagi setiap source route.

Gabungkan semuanya menjadi satu aliran PdP
yang realistik untuk satu sesi.

WAJIB:
- sesuai murid Tahun 2;
- aktiviti konkrit;
- satu aliran PdP;
- BBM praktikal;
- PdP Terbeza;
- PBD boleh dilihat/didengar/disemak;
- jangan cipta kandungan di luar ringkasan.

PHASE mesti salah satu:
input
guided
practice
game
evidence
sharing

Balas TEPAT:

ACTIVITY_NAME:
PHASE:
PDP_METHOD:
MATERIALS:
PENEROKA:
PEMBINA:
PENCABAR:
PBD_EVIDENCE:

Semua field wajib berisi.
Jangan JSON.
Jangan markdown.

RINGKASAN SUMBER:
================================
{merged_source}
================================
"""

obj = None

for attempt in range(1, 5):

    print()
    print(
        f"🤖 Build V5 attempt "
        f"{attempt}/4..."
    )

    raw = call_fable(
        final_prompt,
        max_tokens=1200
    )

    (
        LOGS /
        f"w{WEEK:02d}-s{SESSION}-"
        f"v5-build-{attempt}.txt"
    ).write_text(
        raw,
        encoding="utf-8"
    )

    if len(raw) < 80 or FAIL_TEXT.search(raw):
        print(
            "⚠️ Build response tidak sah:",
            repr(raw[:150])
        )
        time.sleep(1)
        continue

    fields = parse_labels(raw)

    required = [
        "ACTIVITY_NAME",
        "PHASE",
        "PDP_METHOD",
        "MATERIALS",
        "PENEROKA",
        "PEMBINA",
        "PENCABAR",
        "PBD_EVIDENCE",
    ]

    missing = [
        x for x in required
        if not clean(fields.get(x))
    ]

    if missing:
        print(
            "⚠️ field kosong:",
            missing
        )
        print(
            "RAW:",
            repr(raw[:350])
        )
        time.sleep(1)
        continue

    phase = clean(
        fields["PHASE"]
    ).lower()

    if phase not in ALLOWED_PHASES:
        print(
            "⚠️ phase invalid:",
            phase
        )
        continue

    combined = " ".join(
        fields[x]
        for x in required
        if x != "PHASE"
    )

    if BAD.search(combined):
        print(
            "⚠️ istilah dalaman bocor"
        )
        continue

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

        "subject_key":
            "science",

        "year":
            2,

        "skill_key":
            "general",

        "subskill_key":
            "general",

        "level_key":
            "all",

        "phase":
            phase,

        "activity_name":
            name,

        "pdp_method":
            method,

        "materials":
            clean(fields["MATERIALS"]),

        "peneroka":
            clean(fields["PENEROKA"]),

        "pembina":
            clean(fields["PEMBINA"]),

        "pencabar":
            clean(fields["PENCABAR"]),

        "pbd_evidence":
            clean(fields["PBD_EVIDENCE"]),

        "is_game":
            phase == "game",

        "requires_source":
            True,

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
        f"✅ M{WEEK:02d} S{SESSION} RECOVERED V5"
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


if obj is None:
    raise SystemExit(
        f"❌ M{WEEK:02d} S{SESSION} gagal V5"
    )
