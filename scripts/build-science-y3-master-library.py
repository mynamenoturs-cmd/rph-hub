from pathlib import Path
import re, json, csv

ROOT = Path("rph-library/generated/science-y3")
SRC = ROOT / "final-candidates"
OUT = ROOT / "science-y3-activity-library-candidates.csv"
WEEKS = [w for w in range(2,38) if w != 6]

ansi = re.compile(r'\x1b\[[0-?]*[ -/]*[@-~]')
rows = []
seen = set()

def clean(v):
    v = str(v or "")
    v = v.replace("**","").replace("`","")
    return re.sub(r'\s+',' ',v).strip(" |:-")

def add(w,s,name="",method="",materials="",diff="",pbd="",phase="",fmt="",src=""):
    try:
        w,s=int(w),int(s)
    except:
        return

    if w not in WEEKS or s not in (1,2):
        return

    name=clean(name)
    if not name:
        return

    key=(w,s,name.lower())
    if key in seen:
        return

    seen.add(key)
    rows.append({
        "week":w,
        "session":s,
        "activity_name":name,
        "phase":clean(phase),
        "pdp_method":clean(method),
        "materials":clean(materials),
        "differentiation":clean(diff),
        "pbd_evidence":clean(pbd),
        "source_format":fmt,
        "source_file":src
    })

def label_value(block, labels):
    for label in labels:
        # Markdown table
        m=re.search(
            rf'^\s*\|\s*{label}\s*\|\s*(.*?)\s*\|\s*$',
            block,re.I|re.M
        )
        if m:
            return clean(m.group(1))

        # Label: value / bullet label: value
        m=re.search(
            rf'^\s*(?:[-*]\s*)?{label}\s*[:=-]\s*(.+)$',
            block,re.I|re.M
        )
        if m:
            return clean(m.group(1))
    return ""

for f in sorted(SRC.glob("week-[0-9][0-9].md")):
    wm=re.search(r'week-(\d+)',f.name)
    if not wm:
        continue

    week=int(wm.group(1))
    text=f.read_text(encoding="utf-8",errors="ignore")
    text=ansi.sub("",text).replace("\x00","").replace("\r","")

    before=len(rows)

    # -------------------------------------------------------
    # FORMAT 1: JSON object / JSON array
    # -------------------------------------------------------
    decoder=json.JSONDecoder()

    for pos,ch in enumerate(text):
        if ch != "{":
            continue
        try:
            obj,end=decoder.raw_decode(text[pos:])
        except:
            continue

        if not isinstance(obj,dict):
            continue

        if "activity_name" not in obj:
            continue

        w=obj.get("week",week)
        s=obj.get("session")

        add(
            w,s,
            obj.get("activity_name",""),
            obj.get("pdp_method") or obj.get("activity_template",""),
            obj.get("materials") or obj.get("bbm",""),
            obj.get("differentiation",""),
            obj.get("pbd_evidence",""),
            obj.get("mode") or obj.get("phase",""),
            "json",
            f.name
        )

    # -------------------------------------------------------
    # FORMAT 2: Candidate Activity Library heading
    # -------------------------------------------------------
    heading=re.compile(
        r'Candidate\s+Activity\s+Library\s+Row(?:s)?'
        r'.{0,40}?Sesi\s*([12])',
        re.I
    )

    matches=list(heading.finditer(text))

    for i,m in enumerate(matches):
        session=int(m.group(1))
        start=m.end()
        end=matches[i+1].start() if i+1 < len(matches) else len(text)

        block=text[start:end]

        # potong footer Aider
        block=re.split(
            r'\n(?:Tokens:|<!--\s*GEN_|Berhenti di sini)',
            block,
            maxsplit=1,
            flags=re.I
        )[0]

        name=label_value(block,[
            r'Nama\s+aktiviti',
            r'Activity\s+name',
            r'Aktiviti'
        ])

        method=label_value(block,[
            r'Cara\s+PdP\s*\(reusable\)',
            r'Cara\s+PdP',
            r'PdP\s+method',
            r'Kaedah'
        ])

        materials=label_value(block,[
            r'Bahan',
            r'BBM',
            r'Materials'
        ])

        diff=label_value(block,[
            r'PdP\s+Terbeza',
            r'Differentiation'
        ])

        pbd=label_value(block,[
            r'Evidens\s+PBD',
            r'PBD\s+Evidence',
            r'PBD'
        ])

        phase=label_value(block,[
            r'Fasa',
            r'Phase',
            r'Mode'
        ])

        add(
            week,session,
            name,method,materials,diff,pbd,phase,
            "markdown",
            f.name
        )

    # -------------------------------------------------------
    # FORMAT 3: loose "session + activity_name" JSON-like text
    # -------------------------------------------------------
    for s in (1,2):
        if any(r["week"]==week and r["session"]==s for r in rows):
            continue

        pat=re.compile(
            rf'"session"\s*:\s*{s}.*?'
            rf'"activity_name"\s*:\s*"([^"]+)"',
            re.I|re.S
        )

        m=pat.search(text)

        if m:
            add(
                week,s,m.group(1),
                fmt="json-loose",
                src=f.name
            )

    print(f"{f.name}: {len(rows)-before} candidate")

rows.sort(key=lambda r:(r["week"],r["session"],r["activity_name"].lower()))

fields=[
    "week","session","activity_name","phase",
    "pdp_method","materials","differentiation",
    "pbd_evidence","source_format","source_file"
]

with OUT.open("w",encoding="utf-8",newline="") as fh:
    w=csv.DictWriter(fh,fieldnames=fields)
    w.writeheader()
    w.writerows(rows)

missing=[]

print()
print("=== COVERAGE ===")

for week in WEEKS:
    vals=[]
    for session in (1,2):
        n=sum(
            1 for r in rows
            if r["week"]==week and r["session"]==session
        )
        vals.append(n)
        if n==0:
            missing.append((week,session))

    print(f"M{week:02d}: S1={vals[0]} S2={vals[1]}")

print()
print("TOTAL CANDIDATE =",len(rows))
print("MISSING =",len(missing))

if missing:
    print("MISSING LIST:")
    for w,s in missing:
        print(f"M{w} S{s}")
    raise SystemExit(1)

print("MASTER_LIBRARY_PASS")
print(OUT)
