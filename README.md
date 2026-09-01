# RPH Hub

Repository rasmi untuk projek **e-RPH & PBD Hub** — sistem web (PWA) untuk guru menghasilkan Rancangan Pengajaran Harian (RPH), Transit PBD, semakan buku dan analisis, berasaskan sumber sebenar (RPT / DSKP / Buku Teks).

Versi semasa: **v0.3.3.34** (BUILD 20260817-2140) — *HARD STABLE SESSION / BOOK PAGE LOCK*.

## Kandungan

- `index.html` — aplikasi utama (login Google DELIMa, HUD guru, RPH Generator, Lesson Map, Transit PBD, Semakan Buku, Analisis, Admin)
- `app-v03334.js` — logik aplikasi (Supabase client, source indexing, OCR, RPH engine, Google Drive upload)
- `style-v03334.css` — gaya aplikasi
- `manifest.webmanifest` + `sw.js` — PWA (service worker, cache-busting versi)
- `_headers` — konfigurasi cache Cloudflare Pages
- `supabase_schema*.sql` — skema penuh (projek baharu / upgrade)
- `upgrade_*.sql`, `hotfix_*.sql`, `sample_seed_teacher_data.sql` — migrasi & data contoh
- `PATCH_v0.3.3.*.txt` — nota perubahan setiap versi
- `GOOGLE_OAUTH_SETUP.txt` — panduan setup Google OAuth + Supabase
- `CLOUDFLARE_R2_SETUP.md` — setup R2, multipart upload dan migrasi data sumber lama
- `icon-192.png`, `icon-512.png`, `login-delima-hero.jpg` — aset aplikasi

## Deploy

Statik PWA untuk Cloudflare Pages. Semua fail di root; tiada build step diperlukan.

Untuk mengalihkan fail dan indeks sumber berat daripada Supabase ke Cloudflare R2, lengkapkan binding `RPH_SOURCE_FILES` mengikut `CLOUDFLARE_R2_SETUP.md` sebelum deploy.

## Nota keselamatan

- Hanya **publishable/anon key** Supabase disertakan dalam kod (selamat untuk browser; data dilindungi RLS).
- Jangan masukkan `service_role` / Client Secret ke dalam aplikasi.

Lihat `README.txt` untuk nota penuh versi dan `PATCH_v0.3.3.34.txt` untuk perubahan terkini.
