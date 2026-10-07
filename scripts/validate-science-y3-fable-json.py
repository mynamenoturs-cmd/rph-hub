#!/usr/bin/env python3

from pathlib import Path
import json
import re
import sys

BANNED = [
    r'\bOCR\b',
    r'teks OCR',
    r'dialog OCR',
    r'source task',
    r'source evidence',
    r'source_pages',
    r'page_no',
    r'LOCAL_PROPOSED',
    r'LOCAL_VERIFIED',
    r'hasil ekstrak',
    r'aktiviti sumber',
    r'berdasarkan sumber',
    r'VERIFIED diterima',
]

REQUIRED = [
    "activity_name",
    "phase",
    "pdp_method",
    "materials",
    "peneroka",
    "pembina",
    "pencabar",
    "pbd_evidence",
]

def clean(v):
    if v is None:
        return ""
    if isinstance(v, (dict, list)):
        return json.dumps(v, ensure_ascii=False)
    return re.sub(r'\s+', ' ', str(v)).strip()

def find_json(text):
    # Fable/Aider biasanya meletakkan JSON array di antara
    # metadata Aider dan baris "Tokens:".
    lines = text.replace("\r", "").splitlines()

    start = None

    for i, line in enumerate(lines):
        if line.strip() == "[":
            start = i
            break

    if start is not None:
        depth = 0

        for j in range(start, len(lines)):
            line = lines[j]

            # Kiraan ini memadai untuk output schema kita:
            # array luar + objek JSON, tanpa array bersarang.
            depth += line.count("[")
            depth -= line.count("]")

            if depth == 0:
                candidate = "\n".join(lines[start:j + 1])

                try:
                    obj = json.loads(candidate)
                    if isinstance(obj, list):
                        return obj
                except Exception:
                    pass

    # Fallback: cari JSON menggunakan decoder.
    decoder = json.JSONDecoder()

    for i, ch in enumerate(text):
        if ch not in "[{":
            continue

        try:
            obj, _ = decoder.raw_decode(text[i:])
        except Exception:
            continue

        if isinstance(obj, dict) and isinstance(obj.get("sessions"), list):
            return obj["sessions"]

        if isinstance(obj, list):
            return obj

    raise ValueError("JSON array tidak dijumpai")

def alias(obj, *names):
    lower = {str(k).lower(): v for k, v in obj.items()}

    for name in names:
        if name.lower() in lower:
            return lower[name.lower()]

    return ""

def normalize(items, expected_week):
    if not isinstance(items, list):
        raise ValueError("Output mesti JSON array")

    sessions = {}

    for obj in items:
        if not isinstance(obj, dict):
            continue

        try:
            week = int(alias(obj, "week", "minggu") or expected_week)
            session = int(alias(obj, "session", "sesi"))
        except Exception:
            continue

        if week != expected_week or session not in (1, 2):
            continue

        row = {
            "week": week,
            "session": session,

            "activity_name": clean(alias(
                obj,
                "activity_name",
                "nama_aktiviti",
                "name"
            )),

            "phase": clean(alias(
                obj,
                "phase",
                "fasa",
                "mode"
            )),

            "pdp_method": clean(alias(
                obj,
                "pdp_method",
                "approach",
                "cara_pdp",
                "method"
            )),

            "materials": clean(alias(
                obj,
                "materials",
                "bahan",
                "bbm"
            )),

            "peneroka": clean(alias(
                obj,
                "peneroka",
                "kelompok_peneroka"
            )),

            "pembina": clean(alias(
                obj,
                "pembina",
                "kelompok_pembina"
            )),

            "pencabar": clean(alias(
                obj,
                "pencabar",
                "kelompok_pencabar"
            )),

            "pbd_evidence": clean(alias(
                obj,
                "pbd_evidence",
                "evidence",
                "evidens",
                "evidens_pbd"
            )),

            "reusable": alias(obj, "reusable"),
        }

        missing = [
            k for k in REQUIRED
            if not row[k]
        ]

        if missing:
            raise ValueError(
                f"M{week} S{session}: field kosong {missing}"
            )

        sessions[session] = row

    if sorted(sessions) != [1, 2]:
        raise ValueError(
            f"Perlu S1+S2, diterima {sorted(sessions)}"
        )

    result = [
        sessions[1],
        sessions[2],
    ]

    combined = json.dumps(
        result,
        ensure_ascii=False
    )

    for pattern in BANNED:
        if re.search(pattern, combined, re.I):
            raise ValueError(
                f"Bahasa teknikal dikesan: {pattern}"
            )

    if (
        result[0]["activity_name"].lower()
        == result[1]["activity_name"].lower()
    ):
        raise ValueError(
            "Nama aktiviti S1 dan S2 sama"
        )

    if (
        result[0]["pdp_method"].lower()
        == result[1]["pdp_method"].lower()
    ):
        raise ValueError(
            "Cara PdP S1 dan S2 sama"
        )

    return result

def main():
    if len(sys.argv) != 5:
        print(
            "usage: script extract|check INPUT OUTPUT WEEK",
            file=sys.stderr
        )
        return 2

    mode = sys.argv[1]
    inp = Path(sys.argv[2])
    out = Path(sys.argv[3])
    week = int(sys.argv[4])

    try:
        if mode == "extract":
            raw = inp.read_text(
                encoding="utf-8",
                errors="ignore"
            )
            data = find_json(raw)

        elif mode == "check":
            data = json.loads(
                inp.read_text(encoding="utf-8")
            )

        else:
            raise ValueError("mode tidak sah")

        result = normalize(data, week)

        out.parent.mkdir(
            parents=True,
            exist_ok=True
        )

        out.write_text(
            json.dumps(
                result,
                ensure_ascii=False,
                indent=2
            ) + "\n",
            encoding="utf-8"
        )

        print(f"PASS M{week}: S1,S2")
        return 0

    except Exception as e:
        print(
            f"FAIL M{week}: {e}",
            file=sys.stderr
        )
        return 1

if __name__ == "__main__":
    raise SystemExit(main())
