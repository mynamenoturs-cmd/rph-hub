# RELEASE NOTES — TEMPLATE

Gunakan template ini untuk semua release RPH Hub.

---

## 1) Metadata
- Version:
- Tarikh/Jam release:
- Release type: Train / Hotfix
- Branch/Tag:
- Owner:

---

## 2) Ringkasan release
> Ringkasan 2-4 ayat tentang apa yang berubah dan kenapa release ini dibuat.

---

## 3) Scope perubahan

### A) Aplikasi/UI
- [ ] Perubahan 1:
  - Fail:
  - Kesan kepada pengguna:
- [ ] Perubahan 2:
  - Fail:
  - Kesan kepada pengguna:

### B) Engine/Routing/Logic
- [ ] Perubahan 1:
  - Fail:
  - Risiko:

### C) Integrasi (Google Classroom/Drive/R2, dll)
- [ ] Perubahan 1:
  - Fail:
  - Scope akses/scope OAuth berubah? Ya/Tidak

### D) Database/Migration
- [ ] Tiada migration
**atau**
- [ ] Ada migration:
  - Nama fail SQL:
  - Jenis: Expand / Migrate / Contract
  - Backfill: Ya/Tidak
  - Breaking: Ya/Tidak

---

## 4) Verifikasi

### A) Automated checks
- [ ] `bash scripts/release-smoke.sh` pass
- [ ] Test tambahan berkaitan scope pass

### B) Manual smoke (production/staging)
- [ ] Login berjaya
- [ ] Lesson Map verify gate berfungsi
- [ ] Generate RPH berjaya
- [ ] Preview/export parity betul
- [ ] Integrasi berkaitan release berfungsi

---

## 5) Risk assessment
- Risk level: Rendah / Sederhana / Tinggi
- Risiko utama:
  1.
  2.
- Mitigasi:
  1.
  2.

---

## 6) Rollback plan
- App rollback target tag:
- DB rollback plan:
- Trigger rollback jika:
  1.
  2.

---

## 7) Known issues / Limitasi
- [ ] Tiada known issue
**atau**
- [ ] Known issues:
  1.
  2.

---

## 8) Go/No-Go
- Status: GO / NO-GO
- Tarikh/Jam keputusan:
- Validator:
- Catatan akhir:
