#!/usr/bin/env python3

from pathlib import Path
import csv
from collections import defaultdict

SRC = Path(
    "rph-library/generated/science-y2/"
    "science-y2-route-manifest.csv"
)

OUT = Path(
    "rph-library/generated/science-y2/"
    "science-y2-ACTUAL-route-manifest.csv"
)

rows = list(csv.DictReader(
    SRC.open(encoding="utf-8")
))

by_week = defaultdict(list)

for r in rows:
    by_week[int(r["week"])].append(r)

final=[]

for week in sorted(by_week):

    week_rows = by_week[week]

    # Pilih route timetable sebenar S1/S2 sahaja.
    # S3-S5 kekal sebagai source-pool internal dan
    # tidak menjadi sesi RPH berasingan.
    for session in (1,2):

        candidates = [
            r for r in week_rows
            if int(r["session"]) == session
        ]

        if not candidates:
            continue

        # Sekiranya duplicate, ambil entry pertama
        # secara deterministik.
        r = candidates[0]

        final.append({
            "week":week,
            "session":session,
            "blueprint_file":r["blueprint_file"]
        })

OUT.parent.mkdir(parents=True,exist_ok=True)

with OUT.open(
    "w",
    encoding="utf-8",
    newline=""
) as f:

    w=csv.DictWriter(
        f,
        fieldnames=[
            "week",
            "session",
            "blueprint_file"
        ]
    )

    w.writeheader()
    w.writerows(final)

print("RAW ROUTES    =",len(rows))
print("ACTUAL ROUTES =",len(final))
print("OUTPUT        =",OUT)

print()

for r in final:
    print(
        f"M{r['week']:02d} S{r['session']} "
        f"{r['blueprint_file']}"
    )
