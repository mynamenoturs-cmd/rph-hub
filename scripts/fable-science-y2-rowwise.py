#!/usr/bin/env python3

from pathlib import Path
from openai import OpenAI
import csv, json, os, re, hashlib, time

ROOT = Path("rph-library/generated/science-y2")

MANIFEST = ROOT / "science-y2-MERGED-actual-manifest.csv"

CACHE = ROOT / "fable-row-cache"
LOGS = ROOT / "fable-row-logs"

OUT = ROOT / "science-y2-activity-library-FABLE-pre-dedup.csv"
AUDIT = ROOT / "science-y2-fable-audit.txt"

CACHE.mkdir(parents=True, exist_ok=True)
LOGS.mkdir(parents=True, exist_ok=True)

MODEL = "xyrz/claude-fable-5"

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

rows = list(csv.DictReader(
    MANIFEST.open(encoding="utf-8")
))

ALLOWED_PHASES = {
    "input",
    "guided",
    "practice",
    "game",
    "evidence",
    "sharing",
}

INTERNAL = re.compile(
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


def extract_object(raw):

    raw = (
        (raw or "")
        .replace("```json", "")
        .replace("```JSON", "")
        .replace("```", "")
        .strip()
    )

    try:
        x = json.loads(raw)

        if isinstance(x, dict):
            return x

        if isinstance(x, list) and len(x) == 1:
            return x[0]

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

    raise ValueError(
        "JSON object tidak dijumpai"
    )


def make_key(week, session, name, method):

    slug = re.sub(
        r"[^a-z0-9]+",
        "_",
        name.lower()
    ).strip("_")[:42]

    digest = hashlib.sha1(
        (
            f"{week}|{session}|"
            f"{name}|{method}"
        ).encode()
    ).hexdigest()[:8]

    return (
        f"science_y2_w{week:02d}_"
        f"s{session}_{slug}_{digest}"
    )


def read_blueprints(file_field):

    names = [
        x.strip()
        for x in file_field.split("|")
        if x.strip()
    ]

    chunks = []

    for name in names:

        p = Path(name)

        if not p.exists():
            raise FileNotFoundError(name)

        text = p.read_text(
            encoding="utf-8",
            errors="ignore"
        )

        chunks.append(
            "\n"
            + "=" * 60
            + f"\nFILE: {name}\n"
            + "=" * 60
            + "\n"
            + text
        )

    return "\n".join(chunks)


final = []

for idx, r in enumerate(rows, 1):

    week = int(r["week"])
    session = int(r["session"])

    pool = clean(
        r["source_pool_sessions"]
    )

    route_count = int(
        r["source_route_count"]
    )

    cache = (
        CACHE /
        f"w{week:02d}-s{session}.json"
    )

    print()
    print(
        f"[{idx:02d}/{len(rows)}] "
        f"M{week:02d} S{session} "
        f"<- SOURCE [{pool}]"
    )

    # -------------------------
    # RESUME/CACHE
    # -------------------------

    if cache.exists():

        try:
            obj = json.loads(
                cache.read_text(
                    encoding="utf-8"
                )
            )

            final.append(obj)

            print("✅ CACHE")
            continue

        except Exception:
            pass


    source_text = read_blueprints(
        r["blueprint_files"]
    )


    prompt = f"""
Anda membina SATU Activity Library row
untuk SAINS TAHUN 2.

Minggu sebenar: {week}
Sesi RPH sebenar: {session}

Sesi RPH ini menggabungkan SOURCE-POOL:
{pool}

Bilangan source route:
{route_count}

PENTING:

SOURCE-POOL S1-S5 BUKAN sesi jadual guru.

Anda mesti menggabungkan semua route
SOURCE-POOL [{pool}]
menjadi SATU aliran aktiviti PdP yang koheren
untuk sesi sebenar M{week} S{session}.

JANGAN:
- buang mana-mana tugasan penting daripada
  source-pool tersebut;
- cipta SK/SP;
- cipta halaman Buku Teks;
- cipta fakta sains;
- cipta tugasan buku yang tiada;
- menyebut istilah dalaman sistem;
- menulis "source task", "source evidence",
  "blueprint", "OCR", "hotfix", "metadata";
- menghasilkan aktiviti generik yang boleh
  digunakan pada mana-mana topik.

Aktiviti mesti:
- realistik untuk murid Tahun 2;
- berdasarkan kandungan sebenar route yang diberi;
- menggabungkan beberapa source route secara
  natural, bukan senarai aktiviti berasingan;
- mempunyai satu nama aktiviti yang menarik;
- menggunakan BBM praktikal;
- ada PBD yang boleh guru lihat/dengar/semak;
- mempunyai PdP Terbeza yang disepadukan:
  Peneroka, Pembina, Pencabar;
- tidak terlalu panjang;
- boleh dilaksanakan dalam satu waktu PdP.

CARA PdP boleh menggunakan mekanik seperti:
- Think-Pair-Share
- Kad Padanan
- Kotak Beracun
- Bola Soalan
- Kerusi Panas
- Gallery Walk
- relay
- stesen
- eksperimen mudah
- demonstrasi
- penyiasatan
- model
- pembentangan

HANYA apabila sesuai dengan kandungan sebenar.

phase hanya salah satu:

input
guided
practice
game
evidence
sharing

Gunakan Bahasa Melayu yang natural.

Balas SATU JSON object sahaja:

{{
  "week": {week},
  "session": {session},
  "activity_name": "",
  "phase": "",
  "pdp_method": "",
  "materials": "",
  "peneroka": "",
  "pembina": "",
  "pencabar": "",
  "pbd_evidence": "",
  "is_game": false,
  "requires_source": true
}}

SOURCE BLUEPRINT:
-------------------------
{source_text}
-------------------------

Gunakan HANYA:
Minggu {week}
SOURCE-POOL [{pool}]

Gabungkan semuanya untuk:
Minggu {week}
SESI SEBENAR {session}.

JSON SAHAJA.
"""

    success = False

    for attempt in range(1, 5):

        print(
            f"🤖 Fable attempt "
            f"{attempt}/4..."
        )

        try:

            res = (
                client.chat.completions
                .create(
                    model=MODEL,

                    messages=[
                        {
                            "role": "system",
                            "content":
                            "Pakar pedagogi "
                            "Sains sekolah rendah. "
                            "Source-first. "
                            "Output valid JSON sahaja."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],

                    temperature=0.25,
                    max_tokens=2600
                )
            )

            raw = (
                res.choices[0]
                .message.content
                or ""
            )

            (
                LOGS /
                (
                    f"w{week:02d}-"
                    f"s{session}-"
                    f"attempt-{attempt}.txt"
                )
            ).write_text(
                raw,
                encoding="utf-8"
            )

            x = extract_object(raw)

            if int(
                x.get("week", -1)
            ) != week:

                raise ValueError(
                    "week mismatch"
                )

            if int(
                x.get("session", -1)
            ) != session:

                raise ValueError(
                    "session mismatch"
                )

            phase = clean(
                x.get("phase")
            ).lower()

            if phase not in ALLOWED_PHASES:
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
                f
                for f in required
                if not clean(x.get(f))
            ]

            if missing:
                raise ValueError(
                    f"field kosong: {missing}"
                )


            combined = " ".join(
                clean(x.get(f))
                for f in required
            )

            if INTERNAL.search(combined):
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
                x.get(
                    "is_game",
                    False
                )
            )

            if phase == "game":
                is_game = True

            if is_game and phase != "game":
                phase = "game"


            obj = {
                "week": week,
                "session": session,

                "activity_key":
                    make_key(
                        week,
                        session,
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
                    clean(
                        x["materials"]
                    ),

                "peneroka":
                    clean(
                        x["peneroka"]
                    ),

                "pembina":
                    clean(
                        x["pembina"]
                    ),

                "pencabar":
                    clean(
                        x["pencabar"]
                    ),

                "pbd_evidence":
                    clean(
                        x["pbd_evidence"]
                    ),

                "is_game":
                    is_game,

                "requires_source":
                    True,

                "blueprint_route":
                    f"M{week}S{session}",

                "source_pool_sessions":
                    pool
            }


            cache.write_text(
                json.dumps(
                    obj,
                    ensure_ascii=False,
                    indent=2
                ) + "\n",

                encoding="utf-8"
            )


            final.append(obj)

            print(
                "✅ PASS:",
                name
            )

            success = True
            break


        except Exception as e:

            print("⚠️", e)

            if attempt < 4:
                time.sleep(2)


    if not success:

        raise SystemExit(
            f"❌ STOP M{week} S{session}"
        )


# --------------------------------
# FINAL OUTPUT
# --------------------------------

final.sort(
    key=lambda x:(
        x["week"],
        x["session"]
    )
)

keys = [
    x["activity_key"]
    for x in final
]

if len(keys) != len(set(keys)):
    raise SystemExit(
        "❌ duplicate activity_key"
    )


FIELDS = [
    "week",
    "session",
    "activity_key",
    "subject_key",
    "year",
    "skill_key",
    "subskill_key",
    "level_key",
    "phase",
    "activity_name",
    "pdp_method",
    "materials",
    "peneroka",
    "pembina",
    "pencabar",
    "pbd_evidence",
    "is_game",
    "requires_source",
    "blueprint_route",
    "source_pool_sessions"
]


with OUT.open(
    "w",
    encoding="utf-8",
    newline=""
) as f:

    w = csv.DictWriter(
        f,
        fieldnames=FIELDS
    )

    w.writeheader()
    w.writerows(final)


phase_count = {
    p: 0
    for p in ALLOWED_PHASES
}

for x in final:
    phase_count[
        x["phase"]
    ] += 1


game_count = sum(
    bool(x["is_game"])
    for x in final
)


report = [
    "SAINS TAHUN 2 — FABLE ROWWISE AUDIT",
    "=" * 52,

    f"INPUT ROUTES        = {len(rows)}",
    f"OUTPUT ROWS         = {len(final)}",
    f"UNIQUE KEYS         = {len(set(keys))}",

    ""
]

for p in sorted(
    ALLOWED_PHASES
):
    report.append(
        f"{p:10s} = "
        f"{phase_count[p]}"
    )


report += [
    "",
    f"GAME TRUE           = {game_count}",

    "",
    "SOURCEPOOL POLICY   = MERGED",
    "ACTUAL SESSION      = S1/S2 ONLY",

    "",
    "DATABASE WRITE      = OFF",
    f"OUTPUT              = {OUT}"
]


AUDIT.write_text(
    "\n".join(report) + "\n",
    encoding="utf-8"
)


print()
print("\n".join(report))


if (
    len(final) == len(rows)
    and
    len(keys) == len(set(keys))
):

    print()
    print(
        "✅ SCIENCE_Y2_"
        "FABLE_ROWWISE_PASS"
    )

else:

    print()
    print(
        "⚠️ SCIENCE_Y2 INCOMPLETE"
    )
