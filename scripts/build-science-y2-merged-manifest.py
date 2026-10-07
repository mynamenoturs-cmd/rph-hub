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
    "science-y2-MERGED-actual-manifest.csv"
)

rows = list(csv.DictReader(
    SRC.open(encoding="utf-8")
))

by_week = defaultdict(list)

for r in rows:
    by_week[int(r["week"])].append({
        "week": int(r["week"]),
        "source_session": int(r["session"]),
        "blueprint_file": r["blueprint_file"]
    })

final = []

for week in sorted(by_week):

    srcs = sorted(
        by_week[week],
        key=lambda x:x["source_session"]
    )

    n = len(srcs)

    if n == 1:
        groups = [srcs]

    else:
        # Sesi pertama menerima separuh yang lebih besar.
        cut = (n + 1) // 2
        groups = [
            srcs[:cut],
            srcs[cut:]
        ]

    for actual_session, group in enumerate(groups, 1):

        if not group:
            continue

        files = []

        for x in group:
            if x["blueprint_file"] not in files:
                files.append(x["blueprint_file"])

        final.append({
            "week": week,
            "session": actual_session,
            "source_pool_sessions":
                ",".join(
                    str(x["source_session"])
                    for x in group
                ),
            "source_route_count": len(group),
            "blueprint_files": "|".join(files)
        })


OUT.parent.mkdir(
    parents=True,
    exist_ok=True
)

with OUT.open(
    "w",
    encoding="utf-8",
    newline=""
) as f:

    fields = [
        "week",
        "session",
        "source_pool_sessions",
        "source_route_count",
        "blueprint_files"
    ]

    w = csv.DictWriter(
        f,
        fieldnames=fields
    )

    w.writeheader()
    w.writerows(final)


print("RAW SOURCE ROUTES =", len(rows))
print("ACTUAL RPH ROUTES =", len(final))
print("ACTIVE WEEKS      =", len(by_week))
print("OUTPUT            =", OUT)

print()

for r in final:
    print(
        f"M{r['week']:02d} "
        f"S{r['session']} "
        f"<- SOURCE [{r['source_pool_sessions']}] "
        f"({r['source_route_count']} routes)"
    )
