-- Bahasa Arab Tahun 1: isolated source-first activity and induction library.
-- Source audit: RPT Bahasa Arab Tahun 1 2022/2023 remapped to the official
-- Kalendar Akademik 2026 Kumpulan B, DSKP KSSR Semakan Tahun 1 Bahasa Arab,
-- and Buku Teks Bahasa Arab Tahun 1 KSSR (printed pages 1-50).
-- These rows wrap a verified textbook task; they never replace it.

with patterns(
  pattern_key, pattern_name, sk_codes, source_words, printed_pages,
  source_focus, evidence
) as (
  values
    ('arabic_alphabet','Huruf Hijaiyah','1.1,1.3,2.1,3.1',
      'هيا نتعرف إلى الحروف,huruf hijaiyah,huruf arab,dengar sebut huruf,baca huruf,salin huruf',
      '3-32','mendengar, menyebut, mengenal, membaca dan menyalin huruf fokus berdasarkan tugasan sebenar halaman sumber',
      'ketepatan bunyi, pengecaman huruf, bacaan berbaris, arah tulisan dan bentuk salinan'),
    ('arabic_focused_letters','Huruf Fokus dalam Perkataan','1.2,1.3,2.2,2.3,3.2,3.3',
      'هيا نركز,fokus huruf,kedudukan huruf,suku kata,eja kata,baca kata,salin kata',
      '33-41','mendengar dan membina suku kata atau perkataan, mengenal kedudukan huruf, membaca, mengeja dan menyalin berdasarkan halaman sumber',
      'ketepatan sebutan, kedudukan huruf, sambungan huruf, ejaan, bacaan dan salinan'),
    ('arabic_greetings','Ucapan dan Sapaan','1.4,2.4,3.3',
      'كيف نحيي ونرحب,تحيات,ترحيبات,ucapan,salam,selamat datang,dialog',
      '42-46','mendengar, meniru, membaca, memadankan dan menggunakan ucapan mengikut waktu atau situasi pada halaman sumber',
      'sebutan, intonasi, pemilihan ucapan, padanan situasi, bacaan dan salinan'),
    ('arabic_numbers','Nombor 1 hingga 10','1.5,2.5,3.4',
      'نمرح بالأرقام,أرقام,nombor,membilang,susun nombor,baca nombor,salin nombor',
      '47-50','mendengar, menyebut, menyusun, membaca, membilang dan menyalin nombor berdasarkan tugasan halaman sumber',
      'sebutan, urutan, pengecaman angka, bacaan, bilangan dan ketepatan salinan')
), activity_rows(
  level_key, phase, suffix, row_name, pak21, is_game, priority,
  selection_weight, template
) as (
  values
    ('support','input','listen_notice','Dengar dan Kenal Petunjuk','Listen-and-Repeat',false,20,140,
      'Guru memperdengarkan atau menunjukkan bahagian terpilih pada {{page}}. Murid mengenal satu petunjuk bagi %1$s, kemudian meniru model sumber dengan bimbingan.'),
    ('support','guided','guided_repeat','Tiru-Sebut Berpandu','Listen-and-Repeat',false,21,148,
      'Dengan bimbingan guru, murid melaksanakan %1$s pada {{page}} secara langkah demi langkah: dengar, tiru, semak dan ulang. Semakan menumpukan %2$s.'),
    ('support','evidence','show_one','Tunjuk Satu Bukti','Show Me',false,22,136,
      'Selepas tugasan asal pada {{page}}, murid menunjukkan satu huruf, perkataan, ucapan atau nombor daripada halaman yang sama sebagai bukti. Guru menyemak %2$s.'),
    ('core','practice','pair_source','Pasangan Tugasan Sumber','Pair Check',false,30,150,
      'Murid melaksanakan %1$s berdasarkan arahan sebenar pada {{page}}. Pasangan menyemak %2$s dan membetulkan satu bahagian jika perlu.'),
    ('core','game','source_match','Padanan Bahasa Arab','Matching Game',true,31,142,
      'Selepas tugasan asal selesai, kumpulan memadan bunyi, huruf, perkataan, ucapan, gambar atau nombor yang diambil daripada {{page}}. Setiap padanan disahkan semula melalui %2$s.'),
    ('core','sharing','round_robin','Kongsi Jawapan Bergilir','Round Robin',false,32,138,
      'Setiap ahli berkongsi satu hasil daripada tugasan %1$s pada {{page}}. Kumpulan mendengar, menyemak %2$s dan merekod satu pembetulan bersama.'),
    ('challenge','practice','independent_source','Tugasan Kendiri Berbukti','Word Hunt',false,40,148,
      'Murid melaksanakan %1$s pada {{page}} dengan minimum bimbingan, kemudian memilih dua bukti daripada halaman atau hasil sendiri yang menunjukkan %2$s.'),
    ('challenge','game','source_challenge','Cabaran Padanan dan Sebutan','Team Challenge',true,41,142,
      'Kumpulan menyelesaikan cabaran yang masih menggunakan bahan daripada {{page}}. Mereka memilih jawapan, menyebut atau membaca dan menunjukkan ketepatan melalui %2$s tanpa menambah kosa kata di luar sumber.'),
    ('challenge','evidence','explain_choice','Jelaskan Pilihan','Gallery Walk',false,42,138,
      'Murid mempamerkan hasil tugasan %1$s pada {{page}}, menerangkan satu pilihan atau pembetulan dan menyokongnya melalui %2$s. Rakan menyemak kepada halaman sumber.')
)
insert into public.rph_activity_library (
  activity_key, language_code, skill_key, phase, level_key, activity_name,
  activity_template, bbm_template, pak21, objective_keywords, source_keywords,
  year_min, year_max, is_game, priority, active, subject_key, pedagogy_key,
  activity_type, example_text, requires_source, selection_weight, subskill_key
)
select
  format('arabic_y1_%s_%s', p.pattern_key, a.suffix),
  'ar', 'arabic_language', a.phase, a.level_key,
  format('%s: %s', p.pattern_name, a.row_name),
  format(a.template, p.source_focus, p.evidence),
  'Buku Teks', a.pak21,
  array[p.pattern_name, p.sk_codes]::text[],
  string_to_array(p.source_words, ','),
  1, 1, a.is_game, a.priority, true,
  'arabic_language', 'source_first_arabic_language',
  format('arabic_y1_%s_%s', p.pattern_key, a.suffix),
  format('Gunakan hanya selepas tugasan sebenar Buku Teks Bahasa Arab Tahun 1 halaman bercetak %s dikenal pasti dan disahkan.', p.printed_pages),
  true, a.selection_weight, p.pattern_key
from patterns p cross join activity_rows a
on conflict (activity_key) do update set
  activity_name=excluded.activity_name,
  activity_template=excluded.activity_template,
  bbm_template=excluded.bbm_template,
  pak21=excluded.pak21,
  objective_keywords=excluded.objective_keywords,
  source_keywords=excluded.source_keywords,
  activity_type=excluded.activity_type,
  example_text=excluded.example_text,
  requires_source=true,
  selection_weight=excluded.selection_weight,
  subskill_key=excluded.subskill_key,
  active=true;

with patterns(pattern_key, pattern_name, source_words, printed_pages, source_focus) as (
  values
    ('arabic_alphabet','Huruf Hijaiyah','هيا نتعرف إلى الحروف,huruf hijaiyah,huruf arab','3-32','bunyi, bentuk dan bacaan huruf fokus'),
    ('arabic_focused_letters','Huruf Fokus dalam Perkataan','هيا نركز,fokus huruf,kedudukan huruf,suku kata','33-41','kedudukan huruf, suku kata dan perkataan fokus'),
    ('arabic_greetings','Ucapan dan Sapaan','كيف نحيي ونرحب,تحيات,ترحيبات,ucapan,salam','42-46','ucapan dan situasi penggunaannya'),
    ('arabic_numbers','Nombor 1 hingga 10','نمرح بالأرقام,أرقام,nombor,membilang','47-50','angka, perkataan nombor dan urutan bilangan')
), induction_rows(suffix, induction_type, row_name, pak21, priority, template) as (
  values
    ('source_audio','oral','Dengar dan Teka','Listen-and-Repeat',20,
      'Guru memperdengarkan model ringkas daripada {{page}}. Murid menyatakan petunjuk yang mereka dengar tentang %1$s sebelum menyemak halaman sebenar.'),
    ('source_visual','visual','Lihat dan Padan','Pair Check',22,
      'Guru memaparkan gambar, huruf, perkataan, ucapan atau nombor daripada {{page}}. Pasangan memadankan satu petunjuk dengan %1$s tanpa menambah bahan di luar halaman.'),
    ('source_recall','oral','Ingat dan Semak','Round Robin',24,
      'Murid berkongsi satu contoh ringkas tentang %1$s secara bergilir, kemudian menyemak ketepatan contoh melalui {{page}}.')
)
insert into public.rph_induction_library (
  induction_key, subject_key, skill_key, language_code, induction_type,
  induction_name, induction_template, example_text, bbm_template, pak21,
  objective_keywords, source_keywords, year_min, year_max, priority,
  selection_weight, active, subskill_key
)
select
  format('arabic_y1_%s_%s', p.pattern_key, i.suffix),
  'arabic_language', 'arabic_language', 'ar', i.induction_type,
  format('%s: %s', p.pattern_name, i.row_name),
  format(i.template, p.source_focus),
  format('Gunakan hanya petunjuk Buku Teks Bahasa Arab Tahun 1 halaman bercetak %s; jangan mereka kandungan.', p.printed_pages),
  'Buku Teks', i.pak21,
  array[p.pattern_name]::text[],
  string_to_array(p.source_words, ','),
  1, 1, i.priority, 136, true, p.pattern_key
from patterns p cross join induction_rows i
on conflict (induction_key) do update set
  induction_name=excluded.induction_name,
  induction_template=excluded.induction_template,
  example_text=excluded.example_text,
  bbm_template=excluded.bbm_template,
  pak21=excluded.pak21,
  objective_keywords=excluded.objective_keywords,
  source_keywords=excluded.source_keywords,
  selection_weight=excluded.selection_weight,
  subskill_key=excluded.subskill_key,
  active=true;

insert into public.rph_subject_pedagogy (
  subject_key, subject_name, language_code, direction, pedagogy_notes,
  preferred_methods, preferred_bbm, active
)
values (
  'arabic_language', 'Bahasa Arab', 'ar', 'rtl',
  'RPT 2026 Kumpulan B menentukan minggu, urutan unit dan SK/SP; DSKP mengesahkan standard; Buku Teks menentukan huruf, perkataan, ucapan, nombor, arahan dan hasil sebenar. Aktiviti perpustakaan hanya membungkus tugasan sumber yang sama untuk support, core dan challenge. Tulisan Arab kekal kanan-ke-kiri dan sebutan, bacaan serta salinan disemak daripada halaman sebenar. Bahasa Arab kekal berasingan daripada Bahasa Melayu, Pendidikan Islam dan English. Lesson Map tidak boleh disahkan secara automatik dan tidak boleh dicipta apabila halaman atau tugasan sumber belum dikenal pasti.',
  array['Listen-and-Repeat','Pair Check','Matching Game','Round Robin','Show Me','Word Hunt','Gallery Walk'],
  array['Buku Teks'],
  true
)
on conflict (subject_key) do update set
  subject_name=excluded.subject_name,
  language_code=excluded.language_code,
  direction=excluded.direction,
  pedagogy_notes=excluded.pedagogy_notes,
  preferred_methods=excluded.preferred_methods,
  preferred_bbm=excluded.preferred_bbm,
  active=true;

-- Expected result:
-- 4 patterns x 9 activity variants = 36 activity rows
-- 4 patterns x 3 induction variants = 12 induction rows
-- 1 isolated Bahasa Arab pedagogy profile
