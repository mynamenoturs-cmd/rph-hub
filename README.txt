e-RPH & PBD Hub v0.3.3.30
BUILD 20260817-1525

e-RPH & PBD Hub v0.3.3.30 — SOURCE-AWARE PAK21 + NON-PBD DIFFERENTIATION + TEACHER TIMETABLE AUTO + BM OCR
BUILD 20260817-1525

- PdP Terbeza TIDAK lagi dibina daripada kumpulan TP/PBD.
- PdP Terbeza menggunakan tugasan sebenar Buku Teks/BA sebagai aras Sokongan / Standard / Cabaran.
- PAK-21 dipilih mengikut jenis tugasan sumber (membaca, menulis, lisan, tatabahasa, seni/produk) dan tidak menggantikan aktiviti buku.
- Aktiviti RPH mengutamakan arahan Buku Teks, kemudian BA, kemudian RPT sebagai konteks.
- RPH auto-route daripada Tarikh -> Jadual guru login -> Kelas -> Subjek -> Masa Mengajar -> Minggu RPT -> Lesson Map.
- Jika guru mempunyai beberapa sesi pada hari yang sama, dropdown Sesi Jadual Guru disediakan dan sesi terdekat dipilih automatik.
- Masa mengajar dan nama guru dimasukkan dalam preview, Word, Print, Drive dan rph_json.
- OCR kini boleh dimulakan juga pada PDF Buku Teks BM walaupun PDF sudah mempunyai teks digital. OCR BM menggunakan msa+eng dan tidak menimpa teks digital jika teks sedia ada lebih baik.
- Tiada SQL baharu diperlukan; timetable_entries sedia ada digunakan.


e-RPH & PBD Hub v0.3.3.29
BUILD 20260817-1455

e-RPH & PBD Hub v0.3.3.25
BUILD 20260817-1140

e-RPH & PBD Hub v0.3.3.19 — MEASURABLE CRITERIA + COMPLEMENTARY EVIDENCE + ENGLISH UI

Penting:
- Build ini menggunakan app-v03319.js dan style-v03319.css supaya browser/PWA tidak boleh terus menggunakan JS v0.3.3.13/v0.3.3.14 yang lama.
- Header UI mesti menunjukkan: Secure Source-First v0.3.3.19 • BUILD 20260817-0958.
- English LS 4.3.3 dipaksa menggunakan definisi rasmi: Plan, draft and write simple sentences.
- Jika halaman mempunyai 'Write about your country', tugasan itu diberi keutamaan untuk LS 4.3.3 berbanding 'Read and write the country'.
- Objective dan Success Criteria kini code-aware, bukan bergantung pada parser deskripsi DSKP semata-mata.
- Tiada SQL baru diperlukan.


Patch v0.3.3.16:
- Betulkan bug literal method book-skill -> book-activity-role-match yang menyebabkan Sesi dan SK/SP kekal X walaupun sumber sudah sepadan.
- SK/SP cross-check kini berdiri sendiri: jika semua kod benar-benar ditemui dalam DSKP, badge menjadi ✓ tanpa bergantung pada status sesi.
- Sesi boleh dipadankan secara telus daripada RPT explicit/page reference atau Unit + minggu + aktiviti Buku Teks + DSKP.
- Badge ditukar kepada Sesi dipadankan supaya tidak mendakwa RPT memberi pemetaan sesi jika RPT sebenarnya menggabungkan beberapa minggu.
- Bukti RPT dipadatkan kepada minggu sasaran, unit dan SP terpilih; minggu lain tidak lagi memenuhi kad bukti.


Patch v0.3.3.19:
- Success Criteria tidak lagi dicantum dengan frasa 'Complementary evidence:' yang boleh terpotong.
- Complementary Evidence dipisahkan sebagai medan sendiri dan disimpan dalam source_evidence.meta.
- Kriteria 4.3.3 menjadi lebih observable tanpa mereka bilangan ayat yang tidak dinyatakan sumber.
- Lesson Map English menukar label kepada Topic, Content Standard, Learning Standard(s), Learning Objective, Success Criteria, Student's Book, Workbook, Stage of Learning dan Source-based Activities.
- RPH preview English menggunakan label English dan memaparkan Complementary Evidence secara berasingan.
- Hard cache bust: app-v03319.js / style-v03319.css.


Patch v0.3.3.19:
- English Source-based Activities now use Student's Book p. / Workbook p. labels.
- OCR/source instruction cleanup removes leading symbols and fragments such as € / £ / 'and Listen...'.
- English Workbook field shows only the printed page number, not 'm/s'.
- Stage of Learning is inferred from the target week's position inside a multi-week unit, not from Session 1/2 alone.
  Example: a 5-week unit maps approximately Introduction → Guided practice → Application → Assessment/Reinforcement → Enrichment.
- Evidence-card labels follow the subject language for English.
- Hard cache bust: app-v03319.js / style-v03319.css.


Patch v0.3.3.19:
- Stale Lesson Map analysis is invalidated immediately when Subject, Year, Academic Year, Week or Session changes.
- Source Match score, candidate fields and evidence from the previous filter are cleared before a new analysis.
- Prevents a Week 34 result from appearing under Week 3 (or any other filter) before re-analysis.
- Verify/Save cannot accidentally reuse the previous candidate after filter changes.
- Hard cache bust: app-v03319.js / style-v03319.css.


v0.3.3.21: Exact page evidence routing. Mathematical week splits are candidates only; exact page requires explicit RPT page reference or OCR/content + Learning Standard match. Workbook is routed independently. Stage of Learning can be derived from actual selected page position.


v0.3.3.24
- English RPH language lock: generated English lesson plans no longer contain Malay differentiation labels/instructions.
- DAILY LESSON PLAN, Week/Lesson, Verified Lesson Map, Remedial/Reinforcement/Enrichment, Source trail and save action are rendered in English.
- Source page labels use p. for English; PBD/TP official codes remain unchanged.


v0.3.3.25
- Tambah Refleksi selepas PdP.
- Download Word .docx.
- Upload Google Drive (Drive permission diminta pada kali pertama).
- Print RPH.
- Tiada SQL baharu diperlukan.

Current production build: v0.3.3.33 (BUILD 20260817-1818)
BA is optional; textbook exact activities are required for RPH.
