#!/usr/bin/env python3

from pathlib import Path
from openai import OpenAI
import os, sys, re, json, hashlib, time

if len(sys.argv) != 3:
    raise SystemExit(
        "Guna: python scripts/salvage-science-y2-final.py WEEK SESSION"
    )

WEEK = int(sys.argv[1])
SESSION = int(sys.argv[2])

ROOT = Path("rph-library/generated/science-y2")
LOGS = ROOT / "fable-row-logs"

SUMMARY = (
    LOGS /
    f"w{WEEK:02d}-s{SESSION}-V5-MERGED-SUMMARY.txt"
)

CACHE = (
    ROOT / "fable-row-cache" /
    f"w{WEEK:02d}-s{SESSION}.json"
)

if not SUMMARY.exists():
    raise SystemExit(
        f"❌ Merged summary tiada: {SUMMARY}"
    )

summary = SUMMARY.read_text(
    encoding="utf-8",
    errors="ignore"
).strip()

if len(summary) < 80:
    raise SystemExit(
        f"❌ Summary terlalu pendek: {len(summary)} chars"
    )

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

MODEL = "xyrz/claude-fable-5"

ALLOWED = {
    "input",
    "guided",
    "practice",
    "game",
    "evidence",
    "sharing",
}

FAIL = re.compile(
    r"maaf.*salah|jawaban saya",
    re.I
)


def clean(v):
    return re.sub(
        r"\s+",
        " ",
        str(v or "")
    ).strip()


def call(prompt, tokens=800):

    r = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content":
                    "Ikut format field dengan tepat. "
                    "Jangan JSON dan jangan markdown."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0,
        max_tokens=tokens
    )

    return (
        r.choices[0].message.content
        or ""
    ).strip()


def parse(raw, fields):

    result = {}

    current = None

    aliases = {
        re.sub(
            r"[\s_-]+",
            "",
            f.upper()
        ): f
        for f in fields
    }

    for line in raw.splitlines():

        line = line.strip()

        if not line:
            continue

        if ":" in line:

            left, right = line.split(":", 1)

            key = re.sub(
                r"[\s_-]+",
                "",
                left.upper()
            )

            if key in aliases:

                current = aliases[key]
                result[current] = clean(right)
                continue

        if current:
            result[current] = clean(
                result[current] + " " + line
            )

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


# ==================================================
# CALL A — TERAS AKTIVITI
# ==================================================

core_fields = [
    "ACTIVITY_NAME",
    "PHASE",
    "PDP_METHOD",
    "MATERIALS",
]

core_prompt = f"""
Bina TERAS SATU aktiviti PdP Sains Tahun 2.

Minggu {WEEK}
Sesi sebenar {SESSION}

Gunakan hanya ringkasan sumber berikut.

Jangan cipta fakta, SK/SP, halaman atau tugasan baharu.

PHASE mesti salah satu:
input
guided
practice
game
evidence
sharing

Balas TEPAT empat field sahaja:

ACTIVITY_NAME:
PHASE:
PDP_METHOD:
MATERIALS:

Semua wajib berisi.

RINGKASAN SUMBER:
-------------------------
{summary}
-------------------------
"""

core = None

for attempt in range(1, 5):

    print(
        f"🤖 CORE attempt {attempt}/4..."
    )

    raw = call(core_prompt, 750)

    (
        LOGS /
        f"w{WEEK:02d}-s{SESSION}-salvage-core-{attempt}.txt"
    ).write_text(
        raw,
        encoding="utf-8"
    )

    if len(raw) < 50 or FAIL.search(raw):
        print(
            "⚠️ Core tidak sah:",
            repr(raw[:100])
        )
        time.sleep(1)
        continue

    x = parse(
        raw,
        core_fields
    )

    missing = [
        f for f in core_fields
        if not clean(x.get(f))
    ]

    if missing:
        print(
            "⚠️ Core field kosong:",
            missing
        )
        time.sleep(1)
        continue

    phase = clean(
        x["PHASE"]
    ).lower()

    if phase not in ALLOWED:
        print(
            "⚠️ Phase invalid:",
            phase
        )
        continue

    x["PHASE"] = phase

    core = x

    print("✅ CORE PASS")
    break


if core is None:
    raise SystemExit(
        f"❌ CORE M{WEEK:02d} S{SESSION} gagal"
    )


# ==================================================
# CALL B — PDP TERBEZA + PBD SAHAJA
# ==================================================

diff_fields = [
    "PENEROKA",
    "PEMBINA",
    "PENCABAR",
    "PBD_EVIDENCE",
]

diff_prompt = f"""
Lengkapkan PdP Terbeza dan PBD untuk aktiviti Sains Tahun 2 ini.

Jangan ubah aktiviti asal.
Jangan cipta fakta baharu.

AKTIVITI:
Nama: {core["ACTIVITY_NAME"]}
Phase: {core["PHASE"]}
Cara PdP: {core["PDP_METHOD"]}
BBM: {core["MATERIALS"]}

RINGKASAN SUMBER:
-------------------------
{summary}
-------------------------

PENEROKA:
beri sokongan sebenar seperti kad gambar,
kata kunci, contoh separuh siap atau bimbingan rakan.

PEMBINA:
murid laksanakan tugasan utama pada aras biasa.

PENCABAR:
murid tambah sebab, bukti, perbandingan,
ramalan atau aplikasi yang masih berkaitan
dengan kandungan sumber.

PBD_EVIDENCE:
nyatakan bukti konkrit yang guru boleh
lihat, dengar atau semak.

Balas TEPAT empat field sahaja:

PENEROKA:
PEMBINA:
PENCABAR:
PBD_EVIDENCE:

Semua wajib berisi.
"""

diff = None

for attempt in range(1, 5):

    print(
        f"🤖 DIFFERENTIATION attempt {attempt}/4..."
    )

    raw = call(
        diff_prompt,
        850
    )

    (
        LOGS /
        f"w{WEEK:02d}-s{SESSION}-salvage-diff-{attempt}.txt"
    ).write_text(
        raw,
        encoding="utf-8"
    )

    if len(raw) < 60 or FAIL.search(raw):
        print(
            "⚠️ Diff tidak sah:",
            repr(raw[:100])
        )
        time.sleep(1)
        continue

    x = parse(
        raw,
        diff_fields
    )

    missing = [
        f for f in diff_fields
        if not clean(x.get(f))
    ]

    if missing:
        print(
            "⚠️ Diff field kosong:",
            missing
        )
        time.sleep(1)
        continue

    diff = x

    print("✅ DIFFERENTIATION PASS")
    break


if diff is None:
    raise SystemExit(
        f"❌ DIFFERENTIATION M{WEEK:02d} S{SESSION} gagal"
    )


# ==================================================
# PYTHON GABUNG & BINA JSON
# ==================================================

name = clean(
    core["ACTIVITY_NAME"]
)

method = clean(
    core["PDP_METHOD"]
)

phase = core["PHASE"]

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
        clean(core["MATERIALS"]),

    "peneroka":
        clean(diff["PENEROKA"]),

    "pembina":
        clean(diff["PEMBINA"]),

    "pencabar":
        clean(diff["PENCABAR"]),

    "pbd_evidence":
        clean(diff["PBD_EVIDENCE"]),

    "is_game":
        phase == "game",

    "requires_source":
        True,

    "blueprint_route":
        f"M{WEEK}S{SESSION}",
}

CACHE.parent.mkdir(
    parents=True,
    exist_ok=True
)

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
    f"✅ M{WEEK:02d} S{SESSION} SALVAGED"
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
    "Peneroka:",
    obj["peneroka"][:80]
)
print(
    "Pembina:",
    obj["pembina"][:80]
)
print(
    "Pencabar:",
    obj["pencabar"][:80]
)
print(
    "Cache:",
    CACHE
)
