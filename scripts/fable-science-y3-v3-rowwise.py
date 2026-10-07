#!/usr/bin/env python3

from pathlib import Path
from openai import OpenAI
import csv, json, os, re, time, hashlib

ROOT = Path("rph-library/generated/science-y3/auto-fable")

INPUT = ROOT / "science-y3-activity-library-FINAL-v2.csv"
CACHE = ROOT / "v3-row-cache"
LOGS = ROOT / "v3-row-logs"

OUT = ROOT / "science-y3-activity-library-FINAL-v3-pre-dedup.csv"
AUDIT = ROOT / "science-y3-library-audit-v3-pre-dedup.txt"

CACHE.mkdir(parents=True, exist_ok=True)
LOGS.mkdir(parents=True, exist_ok=True)

MODEL = "xyrz/claude-fable-5"

VALID_PHASES = {
    "input",
    "guided",
    "practice",
    "game",
    "evidence",
    "sharing",
}

TEXT_FIELDS = [
    "activity_name",
    "activity_template",
    "bbm_template",
    "example_text",
]

BANNED = [
    r"\bOCR\b",
    r"source\s+task",
    r"source\s+evidence",
    r"source_pages",
    r"LOCAL_PROPOSED",
    r"LOCAL_VERIFIED",
    r"\bmetadata\b",
    r"hasil\s+ekstrak",
    r"aktiviti\s+sumber",
    r"berdasarkan\s+sumber",
    r"\bm\s*/\s*s\s*\d+",
    r"\bhalaman\s+\d+",
    r"\bminggu\s+\d+",
    r"\bsesi\s+[12]\b",
]

base = (
    os.environ.get("OPENAI_API_BASE")
    or os.environ.get("OPENAI_BASE_URL")
)

key = os.environ.get("OPENAI_API_KEY")

if not base or not key:
    raise SystemExit("ERROR: OPENAI API environment belum lengkap")

client = OpenAI(
    api_key=key,
    base_url=base
)


def clean(v):
    return re.sub(r"\s+", " ", str(v or "")).strip()


def normalize_bool(v):
    if isinstance(v, bool):
        return v

    return str(v).strip().lower() in {
        "true",
        "1",
        "yes",
        "ya",
    }


def extract_json(text):
    text = re.sub(
        r"\x1b\[[0-?]*[ -/]*[@-~]",
        "",
        text or "",
    )

    # Cubaan biasa dahulu.
    decoder = json.JSONDecoder()

    for i, ch in enumerate(text):
        if ch != "{":
            continue

        try:
            obj, _ = decoder.raw_decode(text[i:])

            if isinstance(obj, dict):
                return obj

        except Exception:
            pass

    # Fallback untuk raw newline/control character dalam string.
    for start, ch0 in enumerate(text):

        if ch0 != "{":
            continue

        out = []
        depth = 0
        inside = False
        escaped = False

        for ch in text[start:]:

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

                elif ch in "\r\n\t" or ord(ch) < 32:
                    out.append(" ")

                else:
                    out.append(ch)

                continue

            if ch == '"':
                out.append(ch)
                inside = True

            elif ch == "{":
                depth += 1
                out.append(ch)

            elif ch == "}":
                depth -= 1
                out.append(ch)

                if depth == 0:

                    try:
                        obj = json.loads("".join(out))

                        if isinstance(obj, dict):
                            return obj

                    except Exception:
                        break

            else:
                out.append(ch)

    raise ValueError("JSON object tidak dijumpai")


def validate(obj, original):

    problems = []

    required = [
        "activity_name",
        "phase",
        "activity_template",
        "bbm_template",
        "example_text",
    ]

    for k in required:

        if not clean(obj.get(k)):
            problems.append(f"{k} kosong")

    phase = clean(
        obj.get("phase")
    ).lower()

    if phase not in VALID_PHASES:
        problems.append(
            f"phase tidak sah: {phase!r}"
        )

    is_game = normalize_bool(
        obj.get("is_game")
    )

    if phase == "game" and not is_game:
        problems.append(
            "phase=game tetapi is_game=false"
        )

    if phase != "game" and is_game:
        problems.append(
            "is_game=true tetapi phase bukan game"
        )

    if str(obj.get("week")) != str(original.get("week")):
        problems.append("week berubah")

    if str(obj.get("session")) != str(original.get("session")):
        problems.append("session berubah")

    for field in TEXT_FIELDS:

        value = clean(
            obj.get(field)
        )

        for pat in BANNED:

            if re.search(
                pat,
                value,
                re.I
            ):
                problems.append(
                    f"{field} masih mengandungi {pat}"
                )

    return problems


def prompt_for(row, problems=None):

    correction = ""

    if problems:

        correction = (
            "\nRESPONS SEBELUMNYA GAGAL:\n- "
            + "\n- ".join(problems[:20])
            + "\n"
        )

    return f"""
Finalisasikan SATU reusable Activity Library row Sains Tahun 3.

PRINSIP:
Buku Teks/RPT/DSKP menentukan ISI.
Activity Library menentukan CARA PdP.

Jangan cipta fakta kurikulum baharu.

Buang:
OCR
source task
source evidence
source_pages
LOCAL_PROPOSED
LOCAL_VERIFIED
metadata
hasil ekstrak
aktiviti sumber
berdasarkan sumber
m/s bernombor
halaman bernombor
Minggu bernombor
Sesi bernombor.

Jika isi sebenar Buku Teks diperlukan gunakan:
{{{{source_activity}}}}

Phase hanya:
input
guided
practice
game
evidence
sharing

phase=game HANYA jika permainan ialah mekanik utama.
is_game mesti selaras dengan phase.

Kekalkan PdP Terbeza secara reusable:
Peneroka = sokongan/scaffold.
Pembina = tugasan aras biasa.
Pencabar = sebab/bukti/perbandingan/aplikasi/justifikasi.

OUTPUT:
SATU JSON OBJECT SAHAJA.
Tiada markdown.
Tiada penerangan.

WAJIB kekalkan:
week = {row["week"]}
session = {row["session"]}

Field:
week
session
activity_key
language_code
skill_key
subskill_key
phase
level_key
activity_name
activity_template
bbm_template
pak21
year_min
year_max
is_game
priority
active
subject_key
activity_type
example_text
requires_source
selection_weight

Tetapan:
language_code = ms
skill_key = general
subskill_key = general
level_key = all
year_min = 3
year_max = 3
priority = 100
active = true
subject_key = science
requires_source = true
selection_weight = 100

{correction}

ROW ASAL:

{json.dumps(row, ensure_ascii=False)}

BALAS SATU JSON OBJECT SAHAJA.
"""


rows = list(
    csv.DictReader(
        INPUT.open(
            encoding="utf-8"
        )
    )
)

if len(rows) != 70:
    raise SystemExit(
        f"STOP: input dijangka 70 rows, dapat {len(rows)}"
    )


final_rows = []


for idx, original in enumerate(
    rows,
    start=1
):

    week = int(
        original["week"]
    )

    session = int(
        original["session"]
    )

    cache = (
        CACHE
        / f"row-{idx:02d}-w{week:02d}-s{session}.json"
    )

    print()
    print(
        f"[{idx:02d}/70] M{week:02d} S{session}"
    )

    # Resume daripada cache.
    if cache.exists():

        try:

            obj = json.loads(
                cache.read_text(
                    encoding="utf-8"
                )
            )

            problems = validate(
                obj,
                original
            )

            if not problems:

                print(
                    "✅ CACHE VALID — SKIP"
                )

                final_rows.append(
                    obj
                )

                continue

        except Exception:
            pass


    success = False
    previous = None


    for attempt in (1, 2, 3, 4):

        print(
            f"🤖 Fable attempt {attempt}/4..."
        )

        try:

            response = client.chat.completions.create(
                model=MODEL,
                messages=[
                    {
                        "role": "system",
                        "content":
                        "Balas satu JSON object sahaja. "
                        "Tiada teks lain."
                    },
                    {
                        "role": "user",
                        "content":
                        prompt_for(
                            original,
                            previous
                        )
                    }
                ],
                temperature=0,
                max_tokens=4500,
            )

            raw = (
                response
                .choices[0]
                .message
                .content
                or ""
            )

        except Exception as e:

            print(
                "❌ API:",
                e
            )

            time.sleep(2)
            continue


        log = (
            LOGS
            / f"row-{idx:02d}-attempt-{attempt}.txt"
        )

        log.write_text(
            raw,
            encoding="utf-8"
        )


        try:

            obj = extract_json(
                raw
            )

        except Exception as e:

            previous = [
                str(e),
                "Balas SATU JSON object lengkap sahaja."
            ]

            print(
                "⚠️",
                e
            )

            continue


        # Tetapan sistem wajib.
        obj["week"] = week
        obj["session"] = session
        obj["language_code"] = "ms"
        obj["skill_key"] = "general"
        obj["subskill_key"] = "general"
        obj["level_key"] = "all"
        obj["year_min"] = "3"
        obj["year_max"] = "3"
        obj["priority"] = "100"
        obj["active"] = "true"
        obj["subject_key"] = "science"
        obj["requires_source"] = "true"
        obj["selection_weight"] = "100"


        phase = clean(
            obj.get("phase")
        ).lower()

        obj["phase"] = phase
        obj["is_game"] = (
            phase == "game"
        )


        name = clean(
            obj.get("activity_name")
        )

        slug = re.sub(
            r"[^a-z0-9]+",
            "_",
            name.lower()
        ).strip("_")[:42]


        digest = hashlib.sha1(
            (
                slug
                + "|"
                + clean(
                    obj.get(
                        "activity_template"
                    )
                ).lower()
            ).encode()
        ).hexdigest()[:8]


        obj["activity_key"] = (
            f"science_y3_{slug}_{digest}"
        )


        problems = validate(
            obj,
            original
        )


        if problems:

            print(
                "⚠️ validator:"
            )

            for problem in problems[:10]:
                print(
                    "  -",
                    problem
                )

            previous = problems
            continue


        cache.write_text(
            json.dumps(
                obj,
                ensure_ascii=False,
                indent=2
            ) + "\n",
            encoding="utf-8"
        )


        final_rows.append(
            obj
        )


        print(
            f"✅ PASS: {name}"
        )

        success = True
        break


    if not success:

        print(
            f"❌ STOP di row {idx} "
            f"M{week} S{session}"
        )

        raise SystemExit(1)


if len(final_rows) != 70:

    raise SystemExit(
        f"STOP: final rows {len(final_rows)} bukan 70"
    )


FIELDS = [
    "activity_key",
    "week",
    "session",
    "language_code",
    "skill_key",
    "subskill_key",
    "phase",
    "level_key",
    "activity_name",
    "activity_template",
    "bbm_template",
    "pak21",
    "year_min",
    "year_max",
    "is_game",
    "priority",
    "active",
    "subject_key",
    "activity_type",
    "example_text",
    "requires_source",
    "selection_weight",
]


with OUT.open(
    "w",
    encoding="utf-8",
    newline=""
) as f:

    writer = csv.DictWriter(
        f,
        fieldnames=FIELDS,
        extrasaction="ignore"
    )

    writer.writeheader()
    writer.writerows(
        final_rows
    )


phase_counts = {
    phase: 0
    for phase in VALID_PHASES
}

games = 0
bad_terms = []
missing = []
keys = []


for i, row in enumerate(
    final_rows,
    start=1
):

    phase_counts[
        row["phase"]
    ] += 1

    if normalize_bool(
        row["is_game"]
    ):
        games += 1

    keys.append(
        row["activity_key"]
    )

    for field in TEXT_FIELDS:

        value = clean(
            row.get(field)
        )

        if not value:

            missing.append(
                f"ROW{i}:{field}"
            )

        for pat in BANNED:

            if re.search(
                pat,
                value,
                re.I
            ):

                bad_terms.append(
                    f"ROW{i}:{field}:{pat}"
                )


duplicate_keys = (
    len(keys)
    - len(set(keys))
)


report = [
    "SAINS TAHUN 3 — FABLE V3 ROWWISE AUDIT",
    "=" * 45,

    "INPUT ROWS               = 70",
    f"OUTPUT ROWS              = {len(final_rows)}",

    "",

    f"input                    = {phase_counts['input']}",
    f"guided                   = {phase_counts['guided']}",
    f"practice                 = {phase_counts['practice']}",
    f"game                     = {phase_counts['game']}",
    f"evidence                 = {phase_counts['evidence']}",
    f"sharing                  = {phase_counts['sharing']}",

    "",

    f"GAME TRUE                = {games}",
    f"BANNED REFERENCES        = {len(bad_terms)}",
    f"MISSING REQUIRED TEXT    = {len(missing)}",
    f"DUPLICATE ACTIVITY KEY   = {duplicate_keys}",

    "",

    "DATABASE WRITE           = OFF",
    f"MASTER                    = {OUT}",
]


AUDIT.write_text(
    "\n".join(report) + "\n",
    encoding="utf-8"
)


print()
print(
    "\n".join(report)
)


if (
    not bad_terms
    and not missing
    and duplicate_keys == 0
):

    print()
    print(
        "✅ FABLE_V3_ROWWISE_PASS"
    )

else:

    print()
    print(
        "⚠️ FINAL AUDIT BELUM LULUS"
    )
