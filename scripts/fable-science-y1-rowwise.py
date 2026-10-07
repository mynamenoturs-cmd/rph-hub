#!/usr/bin/env python3

from pathlib import Path
from openai import OpenAI
import csv, json, os, re, hashlib, time

ROOT = Path("rph-library/generated/science-y1")
MANIFEST = ROOT / "science-y1-route-manifest.csv"
CACHE = ROOT / "fable-row-cache"
LOGS = ROOT / "fable-row-logs"
OUT = ROOT / "science-y1-activity-library-FABLE-pre-dedup.csv"
AUDIT = ROOT / "science-y1-fable-audit.txt"

CACHE.mkdir(parents=True, exist_ok=True)
LOGS.mkdir(parents=True, exist_ok=True)

MODEL = "xyrz/claude-fable-5"

base = os.environ.get("OPENAI_API_BASE") or os.environ.get("OPENAI_BASE_URL")
key = os.environ.get("OPENAI_API_KEY")

if not base or not key:
    raise SystemExit("API environment tidak lengkap")

client = OpenAI(api_key=key, base_url=base)

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

BAD = re.compile(
    r"\b(?:OCR|LOCAL_PROPOSED|LOCAL_VERIFIED|"
    r"source evidence|source task|metadata|"
    r"blueprint|hotfix)\b",
    re.I
)

def clean(v):
    return re.sub(r"\s+", " ", str(v or "")).strip()

def extract_object(raw):
    raw = (raw or "").replace("```json","").replace("```","")

    dec = json.JSONDecoder()

    for i,c in enumerate(raw):
        if c != "{":
            continue

        try:
            obj,_ = dec.raw_decode(raw[i:])

            if isinstance(obj,dict):
                return obj
        except Exception:
            pass

    raise ValueError("JSON object tidak dijumpai")

def make_key(week,session,name,method):
    slug = re.sub(
        r"[^a-z0-9]+",
        "_",
        name.lower()
    ).strip("_")[:42]

    digest = hashlib.sha1(
        f"{week}|{session}|{name}|{method}".encode()
    ).hexdigest()[:8]

    return f"science_y1_w{week:02d}_s{session}_{slug}_{digest}"

final=[]

for idx,r in enumerate(rows,1):

    week=int(r["week"])
    session=int(r["session"])
    source_file=Path(r["blueprint_file"])

    cache=CACHE / f"w{week:02d}-s{session}.json"

    print()
    print(f"[{idx:02d}/{len(rows)}] M{week:02d} S{session}")

    if cache.exists():
        try:
            obj=json.loads(cache.read_text(encoding="utf-8"))
            final.append(obj)
            print("✅ CACHE")
            continue
        except Exception:
            pass

    if not source_file.exists():
        raise SystemExit(
            f"STOP: blueprint tiada: {source_file}"
        )

    source=source_file.read_text(
        encoding="utf-8",
        errors="ignore"
    )

    prompt=f"""
Anda membina SATU Activity Library row untuk
SAINS TAHUN 1, Minggu {week}, Sesi {session}.

SOURCE BLUEPRINT di bawah ialah sumber kebenaran.

Tugas anda ialah mencipta CARA PdP sahaja.

JANGAN:
- cipta SK/SP;
- cipta tajuk kurikulum;
- cipta halaman Buku Teks;
- cipta aktiviti buku;
- ubah fakta sains;
- keluarkan istilah dalaman sistem.

Aktiviti mesti:
- realistik dilaksanakan guru sekolah rendah;
- khusus kepada kandungan sesi ini;
- bukan ayat generik;
- menarik tetapi game hanya jika sesuai;
- menggunakan BBM yang munasabah;
- mempunyai PBD yang boleh diperhatikan;
- mempunyai PdP Terbeza Peneroka/Pembina/Pencabar;
- tidak memisahkan differentiation daripada aktiviti utama.

Gunakan variasi seperti:
Think-Pair-Share, Kad Padanan, Bola Soalan,
Kotak Beracun, Kerusi Panas, Relay,
stesen, eksperimen mudah, pemerhatian,
demonstrasi atau pembentangan
HANYA jika sesuai dengan sumber.

phase hanya:
input
guided
practice
game
evidence
sharing

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
----------------
{source}
----------------

Pilih HANYA route Minggu {week} Sesi {session}.
JSON SAHAJA.
"""

    success=False

    for attempt in range(1,5):

        print(f"🤖 Fable attempt {attempt}/4...")

        try:
            res=client.chat.completions.create(
                model=MODEL,
                messages=[
                    {
                        "role":"system",
                        "content":
                        "Anda pakar pedagogi sekolah rendah. "
                        "Source-first. Output JSON sahaja."
                    },
                    {
                        "role":"user",
                        "content":prompt
                    }
                ],
                temperature=0.3,
                max_tokens=2500
            )

            raw=res.choices[0].message.content or ""

            (
                LOGS /
                f"w{week:02d}-s{session}-attempt-{attempt}.txt"
            ).write_text(raw,encoding="utf-8")

            x=extract_object(raw)

            if int(x.get("week",-1)) != week:
                raise ValueError("week mismatch")

            if int(x.get("session",-1)) != session:
                raise ValueError("session mismatch")

            phase=clean(x.get("phase")).lower()

            if phase not in ALLOWED_PHASES:
                raise ValueError(f"invalid phase={phase}")

            name=clean(x.get("activity_name"))
            method=clean(x.get("pdp_method"))
            materials=clean(x.get("materials"))
            peneroka=clean(x.get("peneroka"))
            pembina=clean(x.get("pembina"))
            pencabar=clean(x.get("pencabar"))
            pbd=clean(x.get("pbd_evidence"))

            required=[
                name,method,materials,
                peneroka,pembina,pencabar,pbd
            ]

            if not all(required):
                raise ValueError("required field kosong")

            combined=" ".join(required)

            if BAD.search(combined):
                raise ValueError(
                    "internal/source terminology bocor"
                )

            is_game=bool(x.get("is_game",False))

            if phase=="game":
                is_game=True

            if phase!="game" and is_game:
                phase="game"

            obj={
                "week":week,
                "session":session,
                "activity_key":make_key(
                    week,session,name,method
                ),
                "subject_key":"science",
                "year":1,
                "skill_key":"general",
                "subskill_key":"general",
                "level_key":"all",
                "phase":phase,
                "activity_name":name,
                "pdp_method":method,
                "materials":materials,
                "peneroka":peneroka,
                "pembina":pembina,
                "pencabar":pencabar,
                "pbd_evidence":pbd,
                "is_game":is_game,
                "requires_source":True,
                "blueprint_route":f"M{week}S{session}",
            }

            cache.write_text(
                json.dumps(
                    obj,
                    ensure_ascii=False,
                    indent=2
                )+"\n",
                encoding="utf-8"
            )

            final.append(obj)

            print("✅ PASS:",name)

            success=True
            break

        except Exception as e:
            print("⚠️",e)
            time.sleep(2)

    if not success:
        raise SystemExit(
            f"❌ STOP M{week} S{session}"
        )

final.sort(
    key=lambda x:(x["week"],x["session"])
)

keys=[x["activity_key"] for x in final]

if len(keys) != len(set(keys)):
    raise SystemExit("STOP: duplicate activity_key")

FIELDS=[
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
    "blueprint_route"
]

with OUT.open(
    "w",
    encoding="utf-8",
    newline=""
) as f:

    w=csv.DictWriter(
        f,
        fieldnames=FIELDS
    )

    w.writeheader()
    w.writerows(final)

phase_count={p:0 for p in ALLOWED_PHASES}

for x in final:
    phase_count[x["phase"]] += 1

game_count=sum(
    bool(x["is_game"])
    for x in final
)

report=[
    "SAINS TAHUN 1 — FABLE ROWWISE AUDIT",
    "="*50,
    f"INPUT ROUTES        = {len(rows)}",
    f"OUTPUT ROWS         = {len(final)}",
    f"UNIQUE KEYS         = {len(set(keys))}",
    "",
]

for p in sorted(ALLOWED_PHASES):
    report.append(
        f"{p:10s} = {phase_count[p]}"
    )

report += [
    "",
    f"GAME TRUE           = {game_count}",
    "DATABASE WRITE      = OFF",
    f"OUTPUT              = {OUT}",
]

AUDIT.write_text(
    "\n".join(report)+"\n",
    encoding="utf-8"
)

print()
print("\n".join(report))

if len(final)==len(rows) and len(keys)==len(set(keys)):
    print()
    print("✅ SCIENCE_Y1_FABLE_ROWWISE_PASS")
else:
    print()
    print("⚠️ SCIENCE_Y1 INCOMPLETE")
