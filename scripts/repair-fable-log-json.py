#!/usr/bin/env python3
from pathlib import Path
import json, re, sys

if len(sys.argv) != 3:
    print("usage: repair-fable-log-json.py LOG OUTPUT")
    raise SystemExit(2)

src = Path(sys.argv[1])
out = Path(sys.argv[2])

text = src.read_text(encoding="utf-8", errors="ignore")
text = re.sub(r'\x1b\[[0-?]*[ -/]*[@-~]', '', text)
text = text.replace("\x00", "")

# Cari permulaan array JSON pada baris tersendiri.
m = re.search(r'(?m)^[ \t]*\[[ \t]*$', text)
if not m:
    print("NO_JSON_ARRAY")
    raise SystemExit(1)

raw = text[m.start():]

# Scan JSON sambil:
# - abaikan ] di dalam string
# - repair newline/tab/control char di dalam string
fixed = []
inside = False
escaped = False
depth = 0
started = False
finished = False

for ch in raw:

    if inside:
        if escaped:
            fixed.append(ch)
            escaped = False
        elif ch == '\\':
            fixed.append(ch)
            escaped = True
        elif ch == '"':
            fixed.append(ch)
            inside = False
        elif ch in '\r\n\t':
            fixed.append(' ')
        elif ord(ch) < 32:
            fixed.append(' ')
        else:
            fixed.append(ch)
        continue

    if ch == '"':
        fixed.append(ch)
        inside = True
        continue

    if ch == '[':
        depth += 1
        started = True
        fixed.append(ch)
        continue

    if ch == ']':
        depth -= 1
        fixed.append(ch)

        if started and depth == 0:
            finished = True
            break
        continue

    fixed.append(ch)

if not finished:
    print("JSON_ARRAY_NOT_CLOSED")
    raise SystemExit(1)

clean = ''.join(fixed)

try:
    data = json.loads(clean)
except Exception as e:
    print("JSON_REPAIR_FAILED:", e)
    raise SystemExit(1)

if not isinstance(data, list):
    print("NOT_JSON_ARRAY")
    raise SystemExit(1)

out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(
    json.dumps(data, ensure_ascii=False, indent=2) + "\n",
    encoding="utf-8"
)

print(f"REPAIR_OK objects={len(data)}")
