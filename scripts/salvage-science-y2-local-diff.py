#!/usr/bin/env python3

from pathlib import Path
import csv, json, re, hashlib, sys

if len(sys.argv) != 3:
    raise SystemExit(
        "Guna: python scripts/salvage-science-y2-local-diff.py WEEK SESSION"
    )

WEEK = int(sys.argv[1])
SESSION = int(sys.argv[2])

ROOT = Path("rph-library/generated/science-y2")
LOGS = ROOT / "fable-row-logs"
CACHE = ROOT / "fable-row-cache" / f"w{WEEK:02d}-s{SESSION}.json"

MANIFEST = ROOT / "science-y2-MERGED-actual-manifest.csv"

ALLOWED = {
    "input",
    "guided",
    "practice",
    "game",
    "evidence",
    "sharing",
}


def clean(v):
    return re.sub(r"\s+", " ", str(v or "")).strip()


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
        f"{WEEK}|{SESSION}|{name}|{method}".encode()
    ).hexdigest()[:8]

    return (
        f"science_y2_w{WEEK:02d}_"
        f"s{SESSION}_{slug}_{digest}"
    )


# --------------------------------------------------
# Dapatkan source-pool sebenar
# --------------------------------------------------

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
        f"❌ Manifest M{WEEK:02d} S{SESSION} tidak dijumpai"
    )

pool = clean(
    route["source_pool_sessions"]
)


# --------------------------------------------------
# Cari CORE Fable yang sudah lulus
# --------------------------------------------------

logs = sorted(
    LOGS.glob(
        f"w{WEEK:02d}-s{SESSION}-salvage-core-*.txt"
    )
)

core = None
core_file = None

for p in reversed(logs):

    raw = p.read_text(
        encoding="utf-8",
        errors="ignore"
    )

    x = parse_core(raw)

    required = [
        "ACTIVITY_NAME",
        "PHASE",
        "PDP_METHOD",
        "MATERIALS",
    ]

    if not all(clean(x.get(k)) for k in required):
        continue

    phase = clean(
        x["PHASE"]
    ).lower()

    if phase not in ALLOWED:
        continue

    x["PHASE"] = phase

    core = x
    core_file = p
    break


if core is None:
    raise SystemExit(
        "❌ CORE yang sah tidak dijumpai. "
        "Jalankan salvage script sehingga CORE PASS dahulu."
    )


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


# --------------------------------------------------
# PdP Terbeza LOCAL
# Tidak cipta fakta/topik baharu.
# Hanya struktur sokongan pelaksanaan.
# --------------------------------------------------

peneroka = (
    "Dalam aktiviti yang sama, murid yang memerlukan sokongan "
    "melaksanakan tugasan utama dengan bimbingan rakan dan guru. "
    "Guru memberi arahan satu demi satu serta kad kata kunci atau "
    "contoh separuh siap apabila perlu. Murid menggunakan "
    f"{materials} untuk menunjukkan jawapan atau hasil sebelum "
    "menerangkannya secara ringkas."
)

pembina = (
    "Dalam aktiviti yang sama, murid melaksanakan tugasan utama "
    "secara berpasangan atau kumpulan kecil mengikut langkah "
    f"aktiviti '{name}'. Murid menggunakan {materials}, "
    "membandingkan hasil dengan rakan dan membuat pembetulan "
    "berdasarkan pemerhatian atau hasil aktiviti."
)

pencabar = (
    "Selepas menyiapkan tugasan utama, murid memilih satu hasil "
    "daripada aktiviti dan menambah satu penerangan lanjutan seperti "
    "sebab, perbandingan, ramalan atau aplikasi yang masih berkaitan "
    "dengan hasil yang diperoleh. Murid kemudian memberikan "
    "justifikasi ringkas kepada rakan."
)

pbd = (
    "Guru memerhati cara murid melaksanakan tugasan, mendengar "
    "penerangan atau jawapan lisan dan menyemak hasil yang dihasilkan "
    "semasa aktiviti. Evidens diambil daripada respons murid, hasil "
    "kerja atau rekod aktiviti serta pembetulan selepas semakan rakan."
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
        pool,
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


print("✅ LOCAL DIFFERENTIATION BUILT")
print("CORE:", core_file)
print("Aktiviti:", name)
print("Phase:", phase)
print("Source-pool:", pool)

print()
print("PENEROKA :", obj["peneroka"])
print()
print("PEMBINA  :", obj["pembina"])
print()
print("PENCABAR :", obj["pencabar"])
print()
print("PBD      :", obj["pbd_evidence"])

print()
print("✅ CACHE WRITTEN:", CACHE)
