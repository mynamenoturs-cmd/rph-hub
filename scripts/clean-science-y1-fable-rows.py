#!/usr/bin/env python3

from pathlib import Path
from openai import OpenAI
import csv, json, os, re, time

SRC = Path(
    "rph-library/generated/science-y1/"
    "science-y1-activity-library-FABLE-pre-dedup.csv"
)

OUT = Path(
    "rph-library/generated/science-y1/"
    "science-y1-activity-library-CLEAN-v1.csv"
)

CACHE = Path(
    "rph-library/generated/science-y1/clean-cache"
)

LOGS = Path(
    "rph-library/generated/science-y1/clean-logs"
)

CACHE.mkdir(parents=True, exist_ok=True)
LOGS.mkdir(parents=True, exist_ok=True)

MODEL = "xyrz/claude-fable-5"

base = (
    os.environ.get("OPENAI_API_BASE")
    or os.environ.get("OPENAI_BASE_URL")
)

key = os.environ.get("OPENAI_API_KEY")

client = OpenAI(api_key=key, base_url=base)

rows = list(csv.DictReader(
    SRC.open(encoding="utf-8")
))

# Bahasa sistem / AI yang tidak mahu muncul dalam RPH.
BAD = re.compile(
    r'\bsumber\b|source|evidence talk|matching|'
    r'blueprint|OCR|LOCAL_|metadata|hotfix|'
    r'contoh sumber|ayat sumber|luar sumber|'
    r'berdasarkan sumber|merujuk sumber',
    re.I
)

def clean(v):
    return re.sub(r"\s+", " ", str(v or "")).strip()

def combined(r):
    return " ".join([
        r.get("activity_name",""),
        r.get("pdp_method",""),
        r.get("materials",""),
        r.get("peneroka",""),
        r.get("pembina",""),
        r.get("pencabar",""),
        r.get("pbd_evidence","")
    ])

def extract_json(raw):
    raw = (raw or "")
    raw = raw.replace("```json","").replace("```","").strip()

    try:
        obj=json.loads(raw)
        if isinstance(obj,dict):
            return obj
    except Exception:
        pass

    dec=json.JSONDecoder()

    for i,c in enumerate(raw):
        if c != "{":
            continue
        try:
            obj,_=dec.raw_decode(raw[i:])
            if isinstance(obj,dict):
                return obj
        except Exception:
            pass

    raise ValueError("JSON object tidak dijumpai")

FIELDS_TO_REWRITE = [
    "activity_name",
    "pdp_method",
    "materials",
    "peneroka",
    "pembina",
    "pencabar",
    "pbd_evidence"
]

result=[]
changed=0

for idx,r in enumerate(rows,1):

    week=int(r["week"])
    session=int(r["session"])

    if not BAD.search(combined(r)):
        result.append(r)
        continue

    print()
    print(
        f"[{idx:02d}/{len(rows)}] CLEAN "
        f"M{week:02d} S{session} — {r['activity_name']}"
    )

    cache=CACHE / f"w{week:02d}-s{session}.json"

    if cache.exists():
        try:
            x=json.loads(cache.read_text(encoding="utf-8"))
            new=dict(r)
            for f in FIELDS_TO_REWRITE:
                new[f]=clean(x[f])
            result.append(new)
            changed += 1
            print("✅ CACHE")
            continue
        except Exception:
            pass

    prompt=f"""
Anda menyunting SATU Activity Library Sains Tahun 1.

TUGAS:
Kemaskan bahasa sahaja supaya ayat berbunyi seperti
RPH sebenar yang ditulis guru Malaysia.

JANGAN ubah:
- week
- session
- activity_key
- subject
- year
- phase
- fakta sains
- halaman Buku Teks
- maksud aktiviti asal
- aras Peneroka/Pembina/Pencabar

WAJIB:
1. Buang bahasa dalaman sistem seperti:
   sumber, source, source task, source evidence,
   blueprint, OCR, LOCAL_PROPOSED, metadata, hotfix.

2. Jika merujuk halaman, guna bentuk natural:
   "Buku Teks m/s 46"
   atau
   "gambar pada Buku Teks m/s 46".

3. Jangan tulis:
   "berdasarkan sumber",
   "ayat sumber",
   "contoh sumber",
   "tanpa menambah fakta di luar sumber".

4. Bahasa Melayu mesti natural dan ringkas.

5. Peneroka/Pembina/Pencabar mesti pendek:
   Peneroka: bantuan jelas.
   Pembina: tugasan biasa.
   Pencabar: satu cabaran lanjutan.

6. Jangan ulang frasa
   "Dalam aktiviti yang sama, murid..."
   pada setiap aras.

7. Jangan gunakan jargon English yang tidak perlu.
   Contoh:
   Matching -> Kad Padanan
   Evidence Talk -> Jelaskan Jawapan

8. Kekalkan istilah PAK-21 yang biasa digunakan
   seperti Think-Pair-Share, Gallery Walk dan
   See-Think-Wonder jika memang sebahagian aktiviti.

9. BBM mesti ringkas dan praktikal.

10. PBD mesti menyatakan apa yang guru benar-benar
    boleh lihat/dengar/semak.

Balas SATU JSON object sahaja:

{{
 "activity_name":"",
 "pdp_method":"",
 "materials":"",
 "peneroka":"",
 "pembina":"",
 "pencabar":"",
 "pbd_evidence":""
}}

ROW ASAL:

activity_name:
{r['activity_name']}

pdp_method:
{r['pdp_method']}

materials:
{r['materials']}

peneroka:
{r['peneroka']}

pembina:
{r['pembina']}

pencabar:
{r['pencabar']}

pbd_evidence:
{r['pbd_evidence']}

JSON SAHAJA.
"""

    success=False

    for attempt in range(1,5):

        print(f"🤖 Fable clean {attempt}/4...")

        try:
            res=client.chat.completions.create(
                model=MODEL,
                messages=[
                    {
                        "role":"system",
                        "content":
                        "Editor RPH Bahasa Melayu. "
                        "Output JSON sahaja."
                    },
                    {
                        "role":"user",
                        "content":prompt
                    }
                ],
                temperature=0,
                max_tokens=1800
            )

            raw=res.choices[0].message.content or ""

            (
                LOGS /
                f"w{week:02d}-s{session}-attempt-{attempt}.txt"
            ).write_text(raw,encoding="utf-8")

            x=extract_json(raw)

            for f in FIELDS_TO_REWRITE:
                if not clean(x.get(f)):
                    raise ValueError(f"{f} kosong")

            check=" ".join(
                clean(x[f])
                for f in FIELDS_TO_REWRITE
            )

            # Selepas cleaning, istilah dalaman utama
            # tidak boleh tinggal.
            internal=re.compile(
                r'source task|source evidence|blueprint|'
                r'OCR|LOCAL_|metadata|hotfix|'
                r'ayat sumber|contoh sumber|'
                r'berdasarkan sumber|luar sumber',
                re.I
            )

            if internal.search(check):
                raise ValueError(
                    "bahasa sistem masih wujud"
                )

            cache.write_text(
                json.dumps(
                    x,
                    ensure_ascii=False,
                    indent=2
                )+"\n",
                encoding="utf-8"
            )

            new=dict(r)

            for f in FIELDS_TO_REWRITE:
                new[f]=clean(x[f])

            result.append(new)
            changed += 1

            print(
                "✅ CLEAN:",
                new["activity_name"]
            )

            success=True
            break

        except Exception as e:
            print("⚠️",e)
            time.sleep(2)

    if not success:
        raise SystemExit(
            f"❌ STOP M{week} S{session}"
        )


with OUT.open(
    "w",
    encoding="utf-8",
    newline=""
) as f:

    w=csv.DictWriter(
        f,
        fieldnames=rows[0].keys()
    )

    w.writeheader()
    w.writerows(result)


# FINAL AUDIT
remain=[]

for r in result:

    check=" ".join([
        r["activity_name"],
        r["pdp_method"],
        r["materials"],
        r["peneroka"],
        r["pembina"],
        r["pencabar"],
        r["pbd_evidence"]
    ])

    internal=re.compile(
        r'source task|source evidence|blueprint|'
        r'OCR|LOCAL_|metadata|hotfix|'
        r'ayat sumber|contoh sumber|'
        r'berdasarkan sumber|luar sumber',
        re.I
    )

    if internal.search(check):
        remain.append(
            (r["week"],r["session"])
        )

print()
print("SAINS TAHUN 1 — CLEAN AUDIT")
print("="*45)
print("INPUT ROWS        =",len(rows))
print("OUTPUT ROWS       =",len(result))
print("ROWS CLEANED      =",changed)
print("REMAINING LEAK    =",len(remain))
print("OUTPUT             =",OUT)
print("DATABASE WRITE     = OFF")

if (
    len(result)==len(rows)
    and not remain
):
    print()
    print("✅ SCIENCE_Y1_CLEAN_PASS")
else:
    print()
    print("⚠️ CLEANING BELUM LULUS")
