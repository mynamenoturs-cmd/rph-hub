# Roadmap Fusiom (90 Hari)

## Asumsi
Roadmap ini memakai kode dasar repo saat ini (e-RPH & PBD Hub) sebagai fondasi produk Fusiom.

## Target Utama
1. **Stabilitas produksi**: alur RPH → Export → Classroom konsisten.
2. **Kualitas data pembelajaran**: mapping sesi/minggu/sumber tetap presisi.
3. **Kecepatan rilis**: patch kecil aman dirilis dengan regression test minimal.

## KPI (harus terukur)
- Test kritikal lulus: **100%** pada suite wajib.
- Bug kritikal produksi: **0** (P0) sebelum release.
- Waktu recovery bug regresi: **< 24 jam**.

## Fase 0 (Hari 1–3) — Stabilitas Inti
- Kunci perilaku Google Classroom:
  - Kelas participant-only tetap tampil, tapi tidak bisa dipilih publish.
  - Scope OAuth berlebih dibuang.
- Validasi ulang alur diferensiasi PBD dan export parity.

**Status:** ✅ **SELESAI DIEKSEKUSI** (lihat bagian “Eksekusi yang Sudah Dijalankan”).

## Fase 1 (Minggu 1–2) — Release Candidate Hardening
- Bekukan scope test wajib untuk alur kritikal:
  - RPH generation
  - Lesson map gating
  - Export parity (Word/Drive/Classroom)
  - Timetable session policy
- Tambah smoke test release (single command) untuk QA cepat.
- Siapkan catatan rilis + rollback plan 1 langkah.

## Fase 2 (Minggu 3–6) — Kualitas Konten & Data
- Audit source blueprint lintas subjek (BM/BI/Sains/PJ/PK/PI/PM/BA).
- Perketat guard agar sesi jadwal tidak silang.
- Prioritaskan perbaikan data yang berdampak langsung ke guru (top 10 issue frequency).

## Fase 3 (Minggu 7–10) — Operasional & Observability
- Tambah dashboard metrik minimum:
  - jumlah generate RPH berhasil/gagal
  - gagal upload Drive
  - gagal draft Classroom
- Definisikan error taxonomy agar triase cepat (auth/data/logic/network).

## Fase 4 (Minggu 11–13) — Skalasi Terukur
- Bersihkan technical debt patch yang sudah stabil ke baseline utama.
- Kurangi fragmentasi file hotfix bertahap.
- Kunci standar release cadence mingguan.

## Eksekusi yang Sudah Dijalankan (Hari ini)
1. **Perbaikan Classroom selector** di `app-v03334-original.js`:
   - Participant-only course sekarang ditandai `disabled`.
   - Label course non-teacher menjadi `peserta sahaja`.
   - Auto-select course hanya jika course itu bisa publish (`canPublish=true`).
2. **Pembersihan OAuth scope**:
   - Menghapus `classroom.coursework.students.readonly` dari `GOOGLE_WORKSPACE_SCOPES`.

## Verifikasi Eksekusi
Suite yang dijalankan dan **lulus**:
- `tests/google-classroom-integration.test.mjs`
- `tests/rph-differentiated-pbd-preview.test.mjs`
- `tests/rph-exact-session-differentiation-export.test.mjs`
- `tests/rph-exact-session-gold-standard.test.mjs`
- `tests/rph-export-parity.test.mjs`
- `tests/rph-flexible-date-routing.test.mjs`
- `tests/lessonmap-live-verify-gate.test.mjs`
- `tests/rph-generation-ui.test.mjs`
- `tests/cloudflare-r2-source-files.test.mjs`
- `tests/all-subject-timetable-session-policy.test.mjs`

## Next Action (langsung bisa jalan)
1. Buat perintah tunggal `release-smoke` untuk 10 test wajib di atas.
2. Tetapkan checklist release (go/no-go) dalam 1 file.
3. Jalankan dry-run release notes dari perubahan terakhir.