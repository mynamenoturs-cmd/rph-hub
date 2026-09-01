# Cloudflare R2 untuk mengurangkan Supabase egress

Konfigurasi ini memindahkan laluan data yang paling berat ke Cloudflare R2:

- fail sumber asal seperti PDF, DOCX dan XLSX;
- indeks teks `chunks` dan `pages` bagi sumber baharu;
- OCR yang dikemas kini selepas sumber disimpan;
- fail besar melalui multipart upload 8 MB setiap bahagian.

Supabase Storage tidak lagi menjadi fallback untuk upload baharu. Jika binding R2 tiada, aplikasi akan menunjukkan ralat yang jelas dan tidak akan menghantar fail itu ke Supabase secara senyap.

## 1. Cipta bucket R2

1. Buka Cloudflare Dashboard.
2. Pergi ke **R2 Object Storage**.
3. Cipta bucket Standard bernama, sebagai contoh, `rph-source-files`.
4. Bucket hendaklah private. Jangan aktifkan akses awam kerana fail mengandungi data guru/sekolah.

## 2. Sambungkan bucket kepada Pages

Dalam projek Cloudflare Pages aplikasi ini:

1. Pergi ke **Settings > Bindings**.
2. Tambah **R2 bucket binding**.
3. Variable name mesti tepat: `RPH_SOURCE_FILES`.
4. Pilih bucket `rph-source-files` yang dicipta tadi.
5. Tambah environment variables berikut untuk Production dan Preview:
   - `SUPABASE_URL` — URL projek Supabase sedia ada.
   - `SUPABASE_ANON_KEY` — publishable/anon key projek yang sama.
6. Redeploy projek Pages supaya Pages Function menerima binding baharu.

Jangan letakkan `service_role`, secret API key atau JWT secret dalam kod browser atau fail Git.

## 3. Uji upload baharu

1. Login ke aplikasi menggunakan akaun DELIMa yang telah diluluskan.
2. Upload satu fail kecil dahulu.
3. Pastikan lajur status memaparkan `R2 ✓`.
4. Uji fail melebihi 8 MB untuk memastikan multipart upload berjaya.

## 4. Pindahkan data lama

Di skrin **Sumber & Upload**, tekan **Pindah data lama ke R2**.

Proses ini, untuk setiap sumber milik pengguna semasa:

1. membaca fail/indeks lama daripada Supabase sekali;
2. menyimpan fail asal dan indeks JSON ke R2;
3. menukar metadata dokumen kepada R2;
4. hanya selepas salinan R2 berjaya, membuang `source_chunks`, `source_pages` dan objek Supabase Storage lama.

Migrasi satu kali masih menggunakan sedikit/sekali egress Supabase kerana data lama perlu dibaca sebelum dipindahkan. Jalankan semasa projek masih dalam grace period dan jangan tutup tab sehingga selesai.

## 5. Semak hasil

Selepas satu kitaran penggunaan:

- Supabase Storage egress tidak sepatutnya bertambah daripada upload/download sumber baharu;
- perubahan Realtime hanya memuat semula jadual yang berubah, bukan semua jadual;
- pustaka aktiviti statik hanya dimuat sekali bagi setiap sesi login;
- Cloudflare R2 metrics akan menunjukkan operasi Class A/B dan saiz penyimpanan.

## Batas seni bina semasa

Supabase masih digunakan untuk Auth, RLS, metadata kecil, rekod PBD/RPH dan Realtime. Ini disengajakan supaya keselamatan serta fungsi sedia ada tidak rosak. Laluan egress besar telah dialihkan ke Cloudflare.

Menjadikan Supabase secara literal **Realtime sahaja** memerlukan migrasi semua jadual relasi dan polisi RLS ke Cloudflare D1, kemudian Worker menghantar isyarat kecil melalui Supabase Broadcast. Itu ialah migrasi pangkalan data berasingan, bukan sekadar perubahan Storage, dan memerlukan akaun Cloudflare/D1 serta ujian data sebelum boleh diaktifkan dengan selamat.
