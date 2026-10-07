#!/usr/bin/env python3

from pathlib import Path
import re, csv

FILES = sorted(
    Path(".").glob(
        "rph-science-year2-*source-blueprint-hotfix.js"
    )
)

OUT = Path(
    "rph-library/generated/science-y2/"
    "science-y2-route-manifest.csv"
)

OUT.parent.mkdir(parents=True, exist_ok=True)

routes = {}

# Jangan andaikan S1/S2 sahaja ketika ekstrak.
route_re = re.compile(
    r'([^\'"\n]*?)\|W(\d{1,2})\|S(\d+)'
)

for p in FILES:

    text = p.read_text(
        encoding="utf-8",
        errors="ignore"
    )

    for m in route_re.finditer(text):

        week = int(m.group(2))
        session = int(m.group(3))

        key = (week, session)

        routes.setdefault(
            key,
            {
                "week": week,
                "session": session,
                "blueprint_file": p.name
            }
        )

with OUT.open(
    "w",
    encoding="utf-8",
    newline=""
) as f:

    w = csv.DictWriter(
        f,
        fieldnames=[
            "week",
            "session",
            "blueprint_file"
        ]
    )

    w.writeheader()

    for k in sorted(routes):
        w.writerow(routes[k])

print("BLUEPRINT FILES =", len(FILES))
print("ROUTES          =", len(routes))
print("OUTPUT          =", OUT)

for k in sorted(routes):
    r = routes[k]
    print(
        f"M{r['week']:02d} S{r['session']} "
        f"{r['blueprint_file']}"
    )
