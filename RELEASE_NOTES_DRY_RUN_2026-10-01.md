# Release Notes (Dry Run) — 2026-10-01

## 1) Metadata
- Version: v0.3.3.34-dryrun-2026-10-01
- Tarikh/Jam release: 2026-10-01 12:51:31 +08
- Release type: Train (dry run)
- Branch/Tag: main (dry run, no release tag)
- Owner: Hermes Agent

---

## 2) Ringkasan release
Rilis ini memfokuskan hardening integrasi Google Classroom agar pemilihan kelas dan izin publish sesuai peran pengguna, serta menjaga cakupan OAuth tetap minimum. Perubahan menurunkan risiko salah pilih kelas untuk publish dan mengurangi potensi isu policy akibat scope berlebihan.

---

## 3) Scope perubahan

### A) Aplikasi/UI
- [x] Classroom participant-only tetap terlihat, tapi tidak selectable untuk publish.
  - Fail: `app-v03334-original.js`
  - Kesan kepada pengguna: Kelas yang hanya participant tidak boleh dipilih untuk hantar RPH.

- [x] Label course non-teacher diperjelas (`peserta sahaja`).
  - Fail: `app-v03334-original.js`
  - Kesan kepada pengguna: Status kelas lebih jelas di UI.

- [x] Auto-select classroom hanya jika kelas memang `canPublish=true`.
  - Fail: `app-v03334-original.js`
  - Kesan kepada pengguna: Elak auto-select ke kelas yang tak boleh publish.

### B) Engine/Routing/Logic
- [x] Penguatkuasaan pemilihan course publish-safe.
  - Fail: `app-v03334-original.js`
  - Risiko: Rendah (scope terhad pada flow Classroom).

### C) Integrasi (Google Classroom/Drive/R2, dll)
- [x] OAuth scope diperkecil (buang `classroom.coursework.students.readonly`).
  - Fail: `app-v03334-original.js`
  - Scope akses/scope OAuth berubah? Ya

- [x] Laluan `/api/source-files` sokong tiket auth jangka pendek (`x-r2-upload-ticket`) untuk kurangkan semakan Supabase per-request; fallback Bearer token kekal.
  - Fail: `functions/api/source-files/[[path]].js`, `app-v03334-original.js`, `tests/cloudflare-r2-source-files.test.mjs`
  - Scope akses/scope OAuth berubah? Tidak

### D) Database/Migration
- [x] Tiada migration

---

## 4) Verifikasi

### A) Automated checks
- [x] `bash scripts/release-smoke.sh` pass
- [x] Test berkaitan scope pass (`google-classroom-integration`, `rph-export-parity`, `lessonmap-live-verify-gate`, `cloudflare-r2-source-files`, `all-subject-timetable-session-policy` dan matriks smoke lain)
- Bukti run terakhir: 2026-10-01 12:51:31 +08 (`[release-smoke] PASS`, exit code 0)

### B) Manual smoke (production/staging)
- [ ] Belum dijalankan pada production (dokumen ini dry run)

---

## 5) Risk assessment
- Risk level: Rendah
- Risiko utama:
  1. Edge case UI jika metadata course Google tidak lengkap.
  2. Perubahan scope OAuth mungkin perlukan re-consent pada sebahagian akaun.
- Mitigasi:
  1. Kekalkan guard `canPublish` dan fallback UX yang jelas.
  2. Pantau error auth selepas deploy dan rollback jika perlu.

---

## 6) Rollback plan
- App rollback target tag: release stabil sebelumnya
- DB rollback plan: Tiada (no migration)
- Trigger rollback jika:
  1. Classroom publish flow gagal untuk teacher course yang sah.
  2. Kadar auth error meningkat secara signifikan selepas deploy.

---

## 7) Known issues / Limitasi
- [x] Tiada known issue kritikal untuk scope ini semasa dry run.

---

## 8) Go/No-Go
- Status: NO-GO (dry-run, preflight only)
- Tarikh/Jam keputusan: 2026-10-01 12:51:31 +08
- Validator: Hermes Agent
- Catatan akhir: Critical smoke matrix lulus penuh (`scripts/release-smoke.sh`), tetapi gate production (T-0/T+1) belum dijalankan.
