# Audit BM Tahun 2 — Minggu 29 (Kumpulan B, 2026)

## Skop dan sumber
Rekod projek Supabase RPH Hub pada 9 Oktober 2026: subjek BM Tahun 2 (UUID dca2ea22-ba69-4c2c-b7b2-aa170e80b85f), RPT BM Tahun 2 2026 murni, padanan DSKP, serta bukti Buku Teks Tahun 2 Jilid 2 dalam source_evidence.textbook.text.

Pangkalan mempunyai **41 sesi BM2 Minggu 29–37** dan **tiada sesi Minggu 38**. Skop pemurnian dalam PR ini hanya **Minggu 29 S1–S5**, tidak menyentuh minggu <29.

| Sesi | Tajuk | SP | BT | Tugasan sumber | Status Lesson Map |
| --- | --- | --- | --- | --- | --- |
| S1 | Mural Penutup Botol | 5.3.1 (i) | m/s 33 | Kenal FN+FN, FN+FA, FN+FK, FN+FS dan bina ayat ikut pola | verified |
| S2 | Bilik Darjah Mesra Alam | 5.3.1 (ii) | m/s 34 | Kenal ayat penyata dan lengkapkan dua ayat | needs_review |
| S3 | Jimatkan Petrol | 1.1.3 (ii) | m/s 35 | Tafsir pesanan ayah tentang berat kereta, petrol, asap dan simulasi | needs_review |
| S4 | Gunakan Air Secara Berhemat | 2.3.2 (iv) | m/s 36 | Baca dan persembahkan syarahan dengan sebutan, intonasi, gaya | needs_review |
| S5 | Amalan Hijau dalam Kehidupan | 3.2.2 (i)(ii) | m/s 37 | Jawab empat soalan berpandukan keluarga Elis dan pengalaman sendiri | needs_review |

## Kawalan kualiti dan sempadan sumber

- Lima pelan mengandungi **enam fasa konkrit**, tindakan guru/murid, Peneroka/Pembina/Pencabar, PBD individu dan penutup sesi khusus. Pelan bersumber ialah reka bentuk guru dan **bukan** dokumen Word yang diluluskan.
- Pelan runtime digunakan hanya setelah Accuracy Gate asal lulus, Lesson Map berstatus verified, dengan padanan ketat sesi, minggu, tahun, SP, tajuk, halaman, dan kata kunci bukti. **S2–S5 masih ditahan** selagi status needs_review.
- Objektif S1 diperincikan oleh runtime tanpa menyunting rekod Supabase. S2–S5 hanya calon pelan yang disediakan untuk semakan; statusnya tidak dinaikkan.
- BBM pelan ialah Buku Teks pada halaman yang tepat. BA dirujuk RPT sahaja kerana Buku Aktiviti sebenar tidak dimuat naik; tiada aktiviti BA direka.
- Tiada Lesson Map, Auth, RLS, Accuracy Gate, approval-lock, rekod RPH lama, atau Activity Library diubah.
- Minit setiap fasa tidak diada-adakan daripada OCR; tempoh mengikut jadual guru.
- Blueprint lama Minggu 30–37 belum bermakna sesi-sesi itu telah selesai pemurnian terperinci.

## Ujian
Jalankan: node tests/bm2-week29-source-plans.test.mjs — semak lima pelan, enam fasa, PBD individu, gate verified sahaja, dan padanan exact-session.
