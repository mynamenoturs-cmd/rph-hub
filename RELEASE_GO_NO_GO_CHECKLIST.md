# RELEASE GO/NO-GO CHECKLIST — RPH Hub

Checklist standard untuk keputusan release mengikut `RELEASE_PROCESS.md`.

## Rule keputusan
- **GO** hanya jika semua item wajib lulus.
- **NO-GO** jika ada sekurang-kurangnya satu item wajib gagal.

---

## A) Metadata release
- Version: v0.3.3.34-dryrun-2026-10-01
- Release type: Train (dry run)
- Tarikh/Jam (planned): 2026-10-01 12:51:31 +08
- Release Manager: Hermes Agent
- Feature Owner: Hermes Agent
- DB/Migration Owner: N/A (tiada migration)
- QA Owner: Hermes Agent
- Ops Owner: N/A (dry run, belum deploy production)

---

## B) T-2 (Code Freeze)
- [x] Scope release dimuktamadkan.
- [x] Perubahan luar scope dikeluarkan dari release.
- [x] Release notes draft disediakan.
- [x] Migration SQL disemak (idempotent / non-breaking).

---

## C) T-1 (Preflight)
- [x] Smoke matrix lulus:

```bash
bash scripts/release-smoke.sh
```

- [x] Semakan scope kod:

```bash
git status --short
git diff --name-only
```

- [x] QA sign-off flow kritikal:
  - [x] Lesson Map verify gate
  - [x] Generate RPH
  - [x] Preview/Word export parity
  - [x] Google Classroom / Drive integration (jika terlibat)

---

## D) T-0 (Deploy Window)
- [ ] Snapshot/backup metadata penting dibuat.
- [ ] Migration non-breaking dijalankan dahulu (jika ada).
- [ ] Deploy app berjaya.
- [ ] Smoke production pass.
- [ ] Rollback plan disahkan sebelum keputusan akhir.

_Nota dry run: T-0 belum dijalankan di production._

---

## E) T+1 (Stabilization)
- [ ] Monitor error/log 24 jam.
- [ ] Tiada isu kritikal terbuka.
- [ ] Jika ada isu kritikal, rollback runbook telah dijalankan.

_Nota dry run: T+1 belum bermula (tiada deploy production)._ 

---

## F) Gate wajib (final)
- [x] Semua test kritikal pass.
- [x] Tiada data-loss selepas migration.
- [ ] Flow production kritikal berfungsi.
- [x] Release notes final tersedia.

---

## G) Keputusan akhir
- Status: [ ] GO  [x] NO-GO
- Tarikh/Jam keputusan: 2026-10-01 12:51:31 +08
- Validator: Hermes Agent
- Catatan: Preflight dry run lulus (smoke matrix PASS pada 2026-10-01 12:51:31 +08), tetapi gate production belum lengkap kerana T-0/T+1 belum dijalankan.