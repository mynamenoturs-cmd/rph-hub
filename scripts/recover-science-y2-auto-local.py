#!/usr/bin/env python3

from pathlib import Path
from openai import OpenAI
import csv, json, os, re, hashlib, sys, time

if len(sys.argv) != 3:
    raise SystemExit(
        "Guna: python scripts/recover-science-y2-auto-local.py WEEK SESSION"
    )

WEEK = int(sys.argv[1])
SESSION = int(sys.argv[2])

ROOT = Path("rph-library/generated/science-y2")

MANIFEST = (
    ROOT /
    "science-y2-MERGED-actual-manifest.csv"
)

CACHE = (
    ROOT /
    "fable-row-cache" /
    f"w{WEEK:02d}-s{SESSION}.json"
)

LOGS = ROOT / "fable-row-logs"

LOGS.mkdir(parents=True, exist_ok=True)
CACHE.parent.mkdir(parents=True, exist_ok=True)

rows = list(csv.DictReader(
    MANIFEST.open(encoding="utf-8")
))

route = next(
    (
        r for r in rows
        if int(r["week"]) == WEEK
        and int(r["session"]) == SESSION
    ),
    None
)

if not route:
    raise SystemExit(
        f"❌ Route M{WEEK:02d} S{SESSION} tiada"
    )

pool = [
    int(x.strip())
    for x in route["source_pool_sessions"].split(",")
    if x.strip()
]

files = [
    x.strip()
    for x in route["blueprint_files"].split("|")
    if x.strip()
]

base = (
    os.environ.get("OPENAI_API_BASE")
    or os.environ.get("OPENAI_BASE_URL")
)

key = os.environ.get("OPENAI_API_KEY")

if not base or not key:
    raise SystemExit(
        "❌ API environment tidak lengkap"
    )

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

BAD = re.compile(
    r"OCR|LOCAL_PROPOSED|LOCAL_VERIFIED|"
    r"source task|source evidence|blueprint|"
    r"hotfix|metadata",
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


# ====================================================
# EXTRACT SOURCE-POOL SECARA COMPACT
# ====================================================

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

        a = max(0, pos - 650)
        b = min(len(text), pos + 1450)

        raw = text[a:b]

        strings = []

        for m in re.finditer(
            r'''["']([^"'\\]{8,500})["']''',
            raw
        ):

            s = clean(m.group(1))

            if not s:
                continue

            if BAD.search(s):
                continue

            if re.search(
                r"^\w+\|W\d+\|S\d+$",
                s
            ):
                continue

            strings.append(s)

        human = " | ".join(strings)

        if len(human) < 180:
            human = clean(raw)

        parts.append(
            f"SOURCE S{src_session}: "
            + human[:2400]
        )

        found = True
        break

    if not found:
        print(
            f"⚠️ Source S{src_session} "
            f"tidak ditemui"
        )


if not parts:
    raise SystemExit(
        "❌ Tiada source dapat diekstrak"
    )

source = "\n\n".join(parts)

(
    LOGS /
    f"w{WEEK:02d}-s{SESSION}-AUTO-SOURCE.txt"
).write_text(
    source,
    encoding="utf-8"
)

print()
print(
    f"🔧 AUTO RECOVERY "
    f"M{WEEK:02d} S{SESSION}"
)

print(
    "Source-pool =",
    ",".join(map(str,pool))
)

print(
    "Source chars =",
    len(source)
)


# ====================================================
# FABLE HANYA BUAT CORE
# ====================================================

prompt = f"""
Bina TERAS SATU aktiviti PdP Sains Tahun 2.

Minggu sebenar: {WEEK}
Sesi sebenar: {SESSION}

Source-pool:
{','.join(map(str,pool))}

Gabungkan kandungan sumber menjadi satu aktiviti kelas.

JANGAN:
- cipta SK/SP;
- cipta halaman;
- cipta fakta baharu;
- cipta tugasan buku baharu;
- sebut istilah sistem.

Aktiviti mesti:
- sesuai murid Tahun 2;
- konkrit;
- realistik dalam kelas;
- khusus kepada kandungan sumber;
- menggunakan BBM yang sesuai.

PHASE hanya salah satu:

input
guided
practice
game
evidence
sharing

BALAS TEPAT EMPAT FIELD SAHAJA:

ACTIVITY_NAME:
PHASE:
PDP_METHOD:
MATERIALS:

Semua field wajib berisi.
Jangan JSON.
Jangan markdown.

SUMBER:
================================
{source}
================================
"""


def parse_core(raw):

    wanted = {
        "ACTIVITY_NAME",
        "PHASE",
        "PDP_METHOD",
        "MATERIALS",
    }

    out = {}
    current = None

    for line in raw.splitlines():

        line = line.strip()

        if not line:
            continue

        if ":" in line:

            left, right = line.split(
                ":",
                1
            )

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
                out[current]
                + " "
                + line
            )

    return out


core = None

for attempt in range(1, 5):

    print(
        f"🤖 CORE attempt "
        f"{attempt}/4..."
    )

    r = client.chat.completions.create(
        model=MODEL,

        messages=[
            {
                "role": "system",
                "content":
                    "Ikut format empat field "
                    "dengan tepat."
            },
            {
                "role": "user",
                "content":
                    prompt
            }
        ],

        temperature=0,
        max_tokens=900
    )

    raw = (
        r.choices[0]
        .message.content
        or ""
    ).strip()

    (
        LOGS /
        (
            f"w{WEEK:02d}-s{SESSION}-"
            f"auto-core-{attempt}.txt"
        )
    ).write_text(
        raw,
        encoding="utf-8"
    )

    if (
        len(raw) < 50
        or FAIL.search(raw)
    ):

        print(
            "⚠️ CORE fallback:",
            repr(raw[:100])
        )

        time.sleep(1)
        continue


    x = parse_core(raw)

    required = [
        "ACTIVITY_NAME",
        "PHASE",
        "PDP_METHOD",
        "MATERIALS",
    ]

    missing = [
        f
        for f in required
        if not clean(x.get(f))
    ]

    if missing:

        print(
            "⚠️ CORE field kosong:",
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


    combined = " ".join(
        clean(x[f])
        for f in required
    )

    if BAD.search(combined):

        print(
            "⚠️ istilah dalaman bocor"
        )

        continue


    x["PHASE"] = phase

    core = x

    print(
        "✅ CORE PASS:",
        clean(
            core["ACTIVITY_NAME"]
        )
    )

    break


if core is None:
    raise SystemExit(
        f"❌ AUTO CORE M{WEEK:02d} "
        f"S{SESSION} gagal"
    )


# ====================================================
# PDP TERBEZA + PBD DIBINA LOCAL
# ====================================================

name = clean(
    core["ACTIVITY_NAME"]
)

method = clean(
    core["PDP_METHOD"]
)

materials = clean(
    core["MATERIALS"]
)

phase = clean(
    core["PHASE"]
)


peneroka = (
    "Dalam aktiviti yang sama, murid yang memerlukan "
    "sokongan melaksanakan tugasan utama dengan "
    "bimbingan guru atau rakan. Guru memberi arahan "
    "satu demi satu serta kad kata kunci, gambar atau "
    "contoh separuh siap apabila perlu. Murid menggunakan "
    f"{materials} untuk menunjukkan hasil sebelum "
    "menerangkannya secara ringkas."
)


pembina = (
    "Dalam aktiviti yang sama, murid melaksanakan "
    "tugasan utama secara berpasangan atau kumpulan "
    f"kecil mengikut langkah aktiviti '{name}'. "
    f"Murid menggunakan {materials}, membandingkan "
    "hasil dengan rakan dan membuat pembetulan "
    "berdasarkan pemerhatian atau hasil aktiviti."
)


pencabar = (
    "Selepas menyiapkan tugasan utama, murid memilih "
    "satu hasil daripada aktiviti dan menambah satu "
    "penerangan lanjutan seperti sebab, perbandingan, "
    "ramalan atau aplikasi yang masih berkaitan dengan "
    "hasil yang diperoleh. Murid memberikan justifikasi "
    "ringkas kepada rakan."
)


pbd = (
    "Guru memerhati cara murid melaksanakan tugasan, "
    "mendengar penerangan atau jawapan lisan dan "
    "menyemak hasil yang dihasilkan semasa aktiviti. "
    "Evidens diambil daripada respons murid, hasil kerja "
    "atau rekod aktiviti serta pembetulan selepas "
    "semakan rakan."
)


obj = {
    "week":
        WEEK,

    "session":
        SESSION,

    "activity_key":
        make_key(
            name,
            method
        ),

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
        materials,

    "peneroka":
        clean(peneroka),

    "pembina":
        clean(pembina),

    "pencabar":
        clean(pencabar),

    "pbd_evidence":
        clean(pbd),

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
    f"✅ AUTO RECOVERED "
    f"M{WEEK:02d} S{SESSION}"
)

print(
    "Aktiviti:",
    name
)

print(
    "Phase:",
    phase
)

print(
    "Source-pool:",
    obj["source_pool_sessions"]
)

print(
    "Cache:",
    CACHE
)
