# RELEASE PROCESS — RPH Hub

Dokumen SOP release team untuk perubahan aplikasi `app-v03334*`, hotfix runtime, dan migration Supabase.

---

## 1) Objektif
- Pastikan release **selamat**, **boleh rollback**, dan **boleh audit**.
- Kurangkan risiko regression pada flow kritikal:
  - Lesson Map verify gate
  - Generate RPH
  - Preview/export parity
  - Google Classroom / Drive integration

---

## 2) Jenis release

### A. Release Train (mingguan)
- Cadangan: 1 kali seminggu (contoh Khamis 17:00 +08).
- Semua feature masuk ikut jadual tetap.

### B. Hotfix Release (kecemasan)
- Hanya untuk isu production kritikal.
- Scope kecil + cepat + mesti merge balik ke `main`.

---

## 3) Peranan (minimum)
- **Release Manager (RM)**
  - Owner jadual release, keputusan Go/No-Go.
- **Feature Owner (Dev)**
  - Owner kod perubahan.
- **DB/Migration Owner**
  - Owner SQL migration + backfill + rollback DB.
- **QA Owner**
  - Owner test gate + smoke test.
- **Ops Owner**
  - Owner deploy app + verifikasi selepas deploy.

---

## 4) Branching & versioning
- `main` = source of truth.
- Buka `release/vX.Y.Z` pada **T-2**.
- Tag release: `vX.Y.Z`.
- Hotfix: `hotfix/vX.Y.Z+1` -> merge ke `main` selepas stabil.

---

## 5) Artefak wajib sebelum cut release
1. Release Notes (contoh: `RELEASE_NOTES_YYYY-MM-DD.md`)
2. Go/No-Go Checklist (contoh: `RELEASE_GO_NO_GO_CHECKLIST.md`)
3. Senarai migration SQL (jika ada DB changes)
4. Bukti test/smoke pass

---

## 6) Timeline release (T-2 -> T+1)

## T-2 (Code Freeze)
- [ ] Freeze feature baru untuk release ini.
- [ ] Scope release dimuktamadkan.
- [ ] Changelog/release notes draft disediakan.
- [ ] Migration SQL disemak (idempotent/non-breaking).

## T-1 (Preflight)
- [ ] Jalankan smoke matrix:

```bash
bash scripts/release-smoke.sh
```

- [ ] Semak perubahan benar-benar dalam scope release:

```bash
git status --short
git diff --name-only
```

- [ ] QA sign-off untuk flow kritikal:
  - [ ] Lesson Map verify gate
  - [ ] Generate RPH
  - [ ] Preview/Word export parity
  - [ ] Google Classroom publish permission

## T-0 (Deploy Window)
1. [ ] Backup/snapshot metadata penting.
2. [ ] Jalankan migration **non-breaking** dahulu (jika ada).
3. [ ] Deploy app.
4. [ ] Jalankan smoke test production.
5. [ ] RM declare: **GO** atau **NO-GO**.

## T+1 (Stabilization, 24 jam)
- [ ] Monitor error/log.
- [ ] Jika isu kritikal, trigger rollback runbook.
- [ ] Tutup release bila stabil.

---

## 7) Standard migration order (DB)
Gunakan pattern **Expand -> Migrate -> Contract**.

1. **Expand (safe, non-breaking)**
   - Tambah table/column/index baru (nullable/optional dulu).
2. **Migrate data (backfill)**
   - Isi data baru dari struktur lama.
3. **App dual-read/dual-write (jika perlu)**
   - App baca struktur baru dengan fallback lama.
4. **Cutover berperingkat**
   - Aktifkan untuk subject/year tertentu dahulu.
5. **Contract (release seterusnya)**
   - Buang path lama selepas stabil.

> Elak buat perubahan destructive dalam release yang sama dengan cutover besar.

---

## 8) Gate Go/No-Go (wajib lulus)
- [ ] Semua test kritikal pass.
- [ ] Smoke matrix pass (`scripts/release-smoke.sh` exit code 0).
- [ ] Tiada perubahan luar scope release.
- [ ] Migration berjaya tanpa data-loss.
- [ ] Flow production kritikal pass selepas deploy.
- [ ] Rollback plan disahkan sebelum Go.

**Rule:** 1 item gagal = **NO-GO**.

---

## 9) Rollback runbook

## A. App rollback
- Rollback ke tag release terakhir stabil (contoh `vX.Y.(Z-1)`).
- Verify semula smoke ringkas.

## B. DB rollback
- Utamakan rollback aplikasi dahulu.
- Untuk DB, elak `DROP` tergesa-gesa.
- Jika perlu, guna migration reverse yang telah disediakan.

## C. Incident control
- [ ] Hentikan write-path berisiko jika ada corruption.
- [ ] Rekod timeline insiden.
- [ ] Postmortem ringkas selepas pulih.

---

## 10) Checklist smoke production (ringkas)
- [ ] Login berjaya.
- [ ] Lesson Map boleh dibuka + gate status betul.
- [ ] Generate RPH berjaya dari map verified.
- [ ] Preview sama dengan export utama.
- [ ] Jika integration aktif: Classroom/Drive flow tidak melanggar role/scope.

---

## 11) Template keputusan release

```text
Version      : vX.Y.Z
Tarikh/Jam   : YYYY-MM-DD HH:mm +08
Release Type : Train | Hotfix
Scope        : <ringkasan>
Migration    : <tiada / senarai SQL>
Risk         : Rendah | Sederhana | Tinggi
Rollback     : <tag/plan>
Keputusan    : GO | NO-GO
Validator    : <nama>
```

---

## 12) Nota repo semasa
- Script smoke standard: `scripts/release-smoke.sh`
- Dokumen semasa:
  - `RELEASE_GO_NO_GO_CHECKLIST.md`
  - `RELEASE_NOTES_DRY_RUN_2026-10-01.md`

SOP ini boleh digunakan terus; jika proses berubah, kemas kini dokumen ini sekali dengan release notes.