# BM Tahun 2 — RPH Hermes asal, Minggu 31–37 (CALON SEMAKAN)

Sumber: muat naik pengguna `RPH-Semua-Subjek-FormatHub.zip`; pengekstrakan kandungan R1/R2 dalam `functions/api/bm2-hermes-review.js` (server-only; akses admin).

**Status: bukan import produksi; tidak diluluskan.**

- 33 sesi unik, 66 fail Word asal: Minggu 31 (5), 32 (4), 33 (5), 34 (4), 35 (5), 36 (5), 37 (5).
- Semua calon mengekalkan tajuk, SK/SP, objektif, enam langkah guru/murid, tiga laluan Peneroka/Pembina/Pencabar, PBD, penutup dan refleksi bagi setiap versi.
- Kekalkan R1 dan R2 secara berasingan. R1 ialah cadangan lalai untuk semakan, **bukan kelulusan**.
- Metadata Word asal mengandungi subjek `Subjek`, kelas `Kelas / Tahun 1`, tarikh `2026-10-05`. Calon import menggunakan `subject_key=bm`, `year=2`, manakala tarikh, kelas dan guru kekal kosong sehingga pelaksanaan sebenar.
- Semakan audit 10 Okt 2026: tajuk, SP utama dan halaman awal buku sepadan dengan 33 Lesson Map. **Semua Lesson Map masih `needs_review`**, maka tiada auto-verified, tiada auto-approval, dan tiada laluan pintas Accuracy Gate.
- Pelan RPH lama/blueprint tidak diganti dan tiada tulisan ke Supabase, Auth, Lesson Map, RLS atau Production.
- Skop tidak meliputi Minggu 29–30 (batch berasingan tidak hadir dalam ZIP) atau Minggu 38 (tiada Lesson Map yang ditemui).
- Sebelum diaktifkan pada kad RPH Hub: semak bukti buku sebenar bagi setiap aktiviti dan hakikat teks, betulkan metadata paparan, tentukan versi rasmi melalui guru, dan uji kesetaraan kad serta eksport Word. Jangan gunakan label 'diluluskan' sebelum pengesahan.

Ujian staging: `node tests/bm2-hermes-staging.test.mjs`.

## Kawalan akses data

- Kandungan Hermes R1/R2 kini dibungkus dalam Cloudflare Pages Function; tiada fail JSON statik untuk orang awam.
- Endpoint `GET /api/bm2-hermes-review` memerlukan token Supabase yang sah dan rekod `authorized_users` bertanda `role=admin`, `status=allowed`.
- Respons `private, no-store`; Service Worker mesti mengecualikan API daripada cache.
- Paparan guru hanyalah draf semakan dan tidak menukar status Lesson Map atau kandungan generator.
