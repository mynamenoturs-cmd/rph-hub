#!/usr/bin/env python3

from pathlib import Path
import re, csv

FILES = sorted(Path(".").glob(
    "rph-science-year1-*source-blueprint-hotfix.js"
))

OUT = Path(
    "rph-library/generated/science-y1/"
    "science-y1-route-manifest.csv"
)

OUT.parent.mkdir(parents=True,exist_ok=True)

routes={}

route_re = re.compile(
    r'([^\'"\n]*?)\|W(\d{1,2})\|S([12])'
)

for p in FILES:
    text=p.read_text(
        encoding="utf-8",
        errors="ignore"
    )

    for m in route_re.finditer(text):
        week=int(m.group(2))
        session=int(m.group(3))

        key=(week,session)

        routes.setdefault(
            key,
            {
                "week":week,
                "session":session,
                "blueprint_file":p.name,
            }
        )

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

    for key in sorted(routes):
        w.writerow(routes[key])

print("ROUTES =",len(routes))
print("OUTPUT =",OUT)

for key in sorted(routes):
    print(
        f"M{key[0]:02d} S{key[1]} "
        f"{routes[key]['blueprint_file']}"
    )
