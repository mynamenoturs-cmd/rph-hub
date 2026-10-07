#!/usr/bin/env python3

from __future__ import annotations

import argparse
import csv
import re
import sys
import zipfile
from pathlib import Path

ALLOWED_STATUS = {"SOURCE_LOCKED", "REVIEW", "NEEDS_TEXTBOOK_EVIDENCE"}
PAGE_RE = re.compile(r"^\d+(?:-\d+)?$")
INTERNAL_RE = re.compile(r"\b(?:OCR|LOCAL_PROPOSED|LOCAL_VERIFIED|metadata|source evidence)\b", re.I)


def clean(value: str | None) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def parse_expected_weeks(rpt_docx: Path) -> list[int]:
    with zipfile.ZipFile(rpt_docx) as zf:
        xml = zf.read("word/document.xml").decode("utf-8", errors="ignore")
    text = re.sub(r"<[^>]+>", " ", xml)
    weeks = sorted({int(x) for x in re.findall(r"MINGGU\s*([0-9]{1,2})", text)})
    if not weeks:
        raise ValueError("Tidak jumpa minggu daripada RPT docx")
    return weeks


def is_teaching_row(row: dict) -> bool:
    title = clean(row.get("title")).lower()
    if any(x in title for x in ("program transisi", "cuti", "pentaksiran")):
        return False
    return True


def validate(csv_path: Path, rpt_docx: Path, audit_out: Path) -> int:
    errors: list[str] = []

    if not csv_path.exists():
        print(f"FAIL: CSV tidak ditemui: {csv_path}", file=sys.stderr)
        return 1
    if not rpt_docx.exists():
        print(f"FAIL: RPT tidak ditemui: {rpt_docx}", file=sys.stderr)
        return 1

    expected_weeks = parse_expected_weeks(rpt_docx)
    expected_sessions = {(w, 1) for w in expected_weeks}

    with csv_path.open("r", encoding="utf-8", newline="") as f:
        rows = list(csv.DictReader(f))

    required_cols = [
        "week",
        "session",
        "title",
        "sk",
        "sp",
        "textbook_page",
        "source_task",
        "source_status",
        "notes",
    ]

    if not rows:
        errors.append("CSV kosong")

    header = rows[0].keys() if rows else []
    for col in required_cols:
        if col not in header:
            errors.append(f"Kolum wajib tiada: {col}")

    seen: set[tuple[int, int]] = set()
    actual_sessions: set[tuple[int, int]] = set()

    counts = {"SOURCE_LOCKED": 0, "REVIEW": 0, "NEEDS_TEXTBOOK_EVIDENCE": 0}

    invalid_page = 0
    internal_terms = 0
    missing_sksp = 0
    duplicate = 0

    for idx, row in enumerate(rows, start=2):
        try:
            week = int(clean(row.get("week")))
            session = int(clean(row.get("session")))
        except Exception:
            errors.append(f"Baris {idx}: week/session bukan integer")
            continue

        key = (week, session)
        actual_sessions.add(key)

        if key in seen:
            duplicate += 1
            errors.append(f"Baris {idx}: duplicate week+session {week}-{session}")
        seen.add(key)

        status = clean(row.get("source_status")).upper()
        if status not in ALLOWED_STATUS:
            errors.append(f"Baris {idx}: source_status tidak sah '{status}'")
            continue
        counts[status] += 1

        page = clean(row.get("textbook_page")).replace("–", "-").replace(" ", "")
        task = clean(row.get("source_task"))
        sk = clean(row.get("sk"))
        sp = clean(row.get("sp"))

        if page and not PAGE_RE.fullmatch(page):
            invalid_page += 1
            errors.append(f"Baris {idx}: textbook_page tidak sah '{page}'")

        payload = " | ".join(
            [
                clean(row.get("title")),
                sk,
                sp,
                page,
                task,
                clean(row.get("notes")),
            ]
        )
        if INTERNAL_RE.search(payload):
            internal_terms += 1
            errors.append(f"Baris {idx}: istilah dalaman dikesan")

        if status == "SOURCE_LOCKED" and (not page or not task):
            errors.append(f"Baris {idx}: SOURCE_LOCKED mesti ada textbook_page dan source_task")

        if status == "NEEDS_TEXTBOOK_EVIDENCE" and task:
            errors.append(f"Baris {idx}: NEEDS_TEXTBOOK_EVIDENCE mesti kosongkan source_task")

        if is_teaching_row(row):
            if not sk or sk == "-" or not sp or sp == "-":
                missing_sksp += 1
                errors.append(f"Baris {idx}: sesi pengajaran perlu sk/sp")

    missing = sorted(expected_sessions - actual_sessions)
    extras = sorted(actual_sessions - expected_sessions)

    if missing:
        errors.append(f"Sesi RPT hilang: {missing}")
    if extras:
        errors.append(f"Sesi luar RPT dikesan: {extras}")

    audit_out.parent.mkdir(parents=True, exist_ok=True)
    report = [
        "BAHASA ARAB TAHUN 1 — SOURCE BLUEPRINT VALIDATION",
        "=" * 56,
        f"CSV                         = {csv_path}",
        f"RPT                         = {rpt_docx}",
        f"TOTAL ROWS                  = {len(rows)}",
        f"EXPECTED WEEKS (RPT)        = {len(expected_weeks)} ({expected_weeks[0]}-{expected_weeks[-1]})",
        "",
        f"SOURCE_LOCKED               = {counts['SOURCE_LOCKED']}",
        f"REVIEW                      = {counts['REVIEW']}",
        f"NEEDS_TEXTBOOK_EVIDENCE     = {counts['NEEDS_TEXTBOOK_EVIDENCE']}",
        "",
        f"DUPLICATE WEEK+SESSION      = {duplicate}",
        f"MISSING RPT SESSIONS        = {len(missing)}",
        f"EXTRA SESSIONS              = {len(extras)}",
        f"INVALID PAGE FORMAT         = {invalid_page}",
        f"INTERNAL TERMS              = {internal_terms}",
        f"MISSING SK/SP (TEACHING)    = {missing_sksp}",
        "",
        f"RESULT                      = {'FAIL' if errors else 'PASS'}",
    ]

    if errors:
        report.extend(["", "DETAILS:"])
        report.extend(f"- {e}" for e in errors)

    audit_out.write_text("\n".join(report) + "\n", encoding="utf-8")

    if errors:
        print("\n".join(report), file=sys.stderr)
        return 1

    print("\n".join(report))
    return 0


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument(
        "--csv",
        default="rph-library/generated/arabic-y1/arabic-y1-source-blueprint-draft.csv",
        help="Path CSV blueprint",
    )
    p.add_argument(
        "--rpt",
        default="curriculum/rpt/RPT_Bahasa_Arab_Tahun1_2026_KumpulanB_SourceFirst.docx",
        help="Path RPT docx",
    )
    p.add_argument(
        "--audit",
        default="rph-library/generated/arabic-y1/arabic-y1-source-blueprint-audit.txt",
        help="Path output audit txt",
    )
    args = p.parse_args()
    return validate(Path(args.csv), Path(args.rpt), Path(args.audit))


if __name__ == "__main__":
    raise SystemExit(main())
