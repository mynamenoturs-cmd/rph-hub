# Google Classroom untuk RPH Hub

Integrasi ini menggunakan OAuth Google sedia ada. RPH dibina sebagai DOCX, dimuat naik ke Google Drive milik guru, kemudian dilampirkan sebagai **Material draf** dalam Google Classroom yang dipilih.

Data murid, Transit PBD, markah dan rekod pentaksiran tidak dihantar ke Google Classroom.

## 1. Aktifkan API

Gunakan Google Cloud project yang memiliki OAuth Client ID berikut dalam aplikasi:

`1054114776616-gnahe84n279ohk4vbpnogj8pnjs79hfg.apps.googleusercontent.com`

Di **Google Cloud Console > APIs & Services > Library**:

1. Pastikan Google Drive API aktif.
2. Aktifkan Google Classroom API.

## 2. Tambah OAuth scopes

Di **APIs & Services > OAuth consent screen > Data Access**, tambah:

- `https://www.googleapis.com/auth/drive.file`
- `https://www.googleapis.com/auth/classroom.courses.readonly`
- `https://www.googleapis.com/auth/classroom.courseworkmaterials`
- `https://www.googleapis.com/auth/classroom.topics.readonly`

Gunakan skop minimum ini sahaja. Aplikasi tidak meminta roster murid, markah atau submission.

## 3. Semak Web OAuth Client

Di **Credentials > OAuth 2.0 Client IDs > Web client**, pastikan URL production Cloudflare Pages berada dalam **Authorized JavaScript origins**, contohnya:

`https://rphtransitproject.pages.dev`

Masukkan custom domain production juga jika digunakan. Masukkan origin sahaja tanpa path.

## 4. Kelulusan DELIMa / Workspace

Jika muncul `access_denied`, `admin_policy_enforced` atau aplikasi tidak dibenarkan:

1. Minta pentadbir Google Workspace/DELIMa meluluskan OAuth Client ID aplikasi.
2. Benarkan Google Classroom API scopes yang disenaraikan di atas.
3. Pastikan akaun guru menjadi **Teacher** dalam Classroom berkenaan.

Aplikasi awam yang menggunakan skop data Google tertentu mungkin memerlukan OAuth verification. Untuk penggunaan dalaman domain, pentadbir Workspace boleh menetapkan aplikasi sebagai dipercayai mengikut polisi organisasi.

## 5. Cara guna dalam RPH Hub

1. Generate RPH seperti biasa.
2. Pada bahagian Google Workspace, pilih akaun DELIMa semasa atau akaun Google lain.
3. Tekan **Hubungkan Classroom** dan luluskan kebenaran.
4. Pilih Classroom aktif dan topik jika perlu.
5. Tekan **Hantar Draf Classroom**.

Pilihan **Auto cipta draf selepas Simpan RPH** hanya berfungsi selepas Classroom telah dihubungkan dan kelas dipilih. Setiap RPH hanya dihantar sekali bagi Classroom yang sama dalam sesi tersebut untuk mengelakkan draf berganda.

## 6. Tingkah laku keselamatan

- Material sentiasa dicipta dengan `state: DRAFT`.
- Fail dilampirkan dengan `shareMode: VIEW`.
- Token OAuth disimpan dalam memori browser sahaja dan tamat tempoh secara automatik.
- Token, refresh token dan Google Client Secret tidak disimpan dalam Supabase atau Git.
- Menukar akaun Google akan membuang token dan pilihan Classroom lama daripada sesi browser.
