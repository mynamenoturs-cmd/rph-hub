-- RPH Hub: Pendidikan Islam Tahun 2 source-first Activity + Induction Library.
-- Source audit: RPT Pendidikan Islam Tahun 2 SK 2026, DSKP KSSR (Semakan 2017)
-- and Buku Teks Pendidikan Islam Tahun 2 (printed pages 1-138).
--
-- Idempotent: existing keys are updated, never duplicated.
-- These rows only vary how a verified source task is delivered. They do not
-- create Lesson Maps, invent textbook content or mark any map as verified.

with patterns(
  pattern_key, field_key, sk_code, pattern_name, source_words,
  printed_pages, source_focus, evidence
) as (
  values
    ('quran_tilawah_annas','al_quran','1.1','Tilawah Surah an-Nas',
      'surah an-nas,surah annas,sورة الناس,tilawah,talaqqi,musyafahah',
      '1-6','membaca Surah an-Nas secara talaqqi dan musyafahah mengikut potongan serta tanda bacaan pada halaman sumber',
      'sebutan huruf, baris, kelancaran, tertib ayat dan adab membaca al-Quran'),
    ('quran_tilawah_alfalaq','al_quran','1.2','Tilawah Surah al-Falaq',
      'surah al-falaq,surah alfalaq,سورة الفلق,tilawah,talaqqi,musyafahah',
      '7-12','membaca Surah al-Falaq secara talaqqi dan musyafahah mengikut potongan serta tanda bacaan pada halaman sumber',
      'sebutan huruf, baris, kelancaran, tertib ayat dan adab membaca al-Quran'),
    ('quran_hifz_annas','al_quran','1.3','Hafazan Surah an-Nas',
      'hafazan surah an-nas,hafaz an-nas,حفظ سورة الناس,memperdengarkan hafazan',
      '13-18','menghafaz dan memperdengarkan Surah an-Nas mengikut urutan serta panduan pada halaman sumber',
      'ketepatan urutan, kelancaran, sebutan, ingatan dan adab tasmi'''),
    ('quran_hifz_alfalaq','al_quran','1.4','Hafazan Surah al-Falaq',
      'hafazan surah al-falaq,hafaz al-falaq,حفظ سورة الفلق,memperdengarkan hafazan',
      '19-24','menghafaz dan memperdengarkan Surah al-Falaq mengikut urutan serta panduan pada halaman sumber',
      'ketepatan urutan, kelancaran, sebutan, ingatan dan adab tasmi'''),
    ('quran_mad_asli','al_quran','1.5','Bacaan Mad Asli',
      'mad asli,مد اصلي,dua harakat,huruf mad,kenal pasti mad',
      '25-30','mengenal pasti kalimah atau potongan ayat yang mengandungi mad asli dan membacanya dua harakat berdasarkan halaman sumber',
      'huruf mad, tanda bacaan, kadar dua harakat dan bacaan yang tepat'),
    ('quran_nun_mim_syaddah','al_quran','1.6','Nun dan Mim Syaddah',
      'nun syaddah,mim syaddah,nun dan mim sabdu,نون,ميم,شدة,ghunnah',
      '31-36','mengenal pasti nun dan mim syaddah pada kalimah atau potongan ayat lalu membacanya mengikut panduan halaman sumber',
      'tanda syaddah, bunyi dengung, sebutan, kadar bacaan dan pengecaman kalimah'),

    ('jawi_multisyllable','jawi','6.1','Perkataan Tiga Suku Kata atau Lebih',
      'tiga suku kata,empat suku kata,lima suku kata,perkataan jawi,تيݢ سوكو كات',
      '37-42','membaca, membina dan menulis perkataan Jawi yang terdiri daripada tiga suku kata atau lebih berdasarkan contoh halaman sumber',
      'pecahan suku kata, ejaan Jawi, bentuk huruf, sambungan huruf dan ketepatan tulisan'),
    ('jawi_word_phrases','jawi','6.2','Rangkai Kata Jawi',
      'rangkai kata,رڠكاي كات,membina rangkai kata,menulis rangkai kata',
      '43-48','membaca, membina dan menulis rangkai kata Jawi menggunakan perkataan serta gambar pada halaman sumber',
      'padanan makna, susunan perkataan, ejaan Jawi, sambungan huruf dan ketepatan rangkai kata'),
    ('jawi_short_text','jawi','6.3','Ayat dan Teks Pendek Jawi',
      'ayat pendek,teks pendek,تيك س ڤينديق,membina ayat jawi,menulis teks jawi',
      '49-54','membaca, membina dan menulis ayat atau teks pendek Jawi berdasarkan gambar, frasa dan tugasan halaman sumber',
      'susunan ayat, ejaan Jawi, tanda baca, makna dan ketepatan teks'),

    ('akidah_sifat_allah','akidah','2.1','Sifat-sifat Allah',
      'sifat allah,صيفت الله,sifat wajib,sifat mustahil,sifat harus',
      '55-60','menyenaraikan serta menerangkan sifat wajib, mustahil dan harus bagi Allah berdasarkan carta serta aktiviti halaman sumber',
      'nama sifat, pasangan lawan, maksud, pengelasan dan kesan keimanan'),
    ('akidah_ahad_samad','akidah','2.2','Nama Allah al-Ahad dan as-Samad',
      'al-ahad,al ahad,الأحد,as-samad,al-samad,الصمد,nama allah',
      '61-66','menerangkan pengertian al-Ahad dan as-Samad serta memadankan dalil dan bukti berdasarkan halaman sumber',
      'nama Allah, pengertian, dalil naqli, bukti akal dan tindakan beriman'),
    ('akidah_malaikat','akidah','2.3','Beriman kepada Malaikat',
      'malaikat,ملائكة,nama malaikat,tugas malaikat,sifat malaikat',
      '67-72','mengenal pengertian, sifat, nama dan tugas malaikat serta mengaitkannya dengan tindakan harian berdasarkan halaman sumber',
      'pengertian, sifat, nama, tugas, dalil dan kesan keimanan'),

    ('ibadah_istinja','ibadah','3.1','Istinja'' selain Air',
      'istinja,استنجاء,alat istinja,syarat istinja,cara istinja,selain air',
      '73-78','mengenal alat, syarat, cara dan kepentingan istinja'' selain air mengikut gambar dan urutan halaman sumber',
      'alat yang sesuai, syarat, urutan cara, kebersihan dan kepentingan'),
    ('ibadah_syarat_solat','ibadah','3.2','Syarat Wajib dan Syarat Sah Solat',
      'syarat wajib solat,syarat sah solat,شرط واجب صلاة,شرط صح صلاة',
      '79-84','mengelaskan syarat wajib dan syarat sah solat serta menerangkan kepentingannya berdasarkan halaman sumber',
      'kategori syarat, contoh, perbezaan, sebab dan aplikasi dalam situasi harian'),
    ('ibadah_bacaan_wajib','ibadah','3.3','Bacaan Wajib dalam Solat',
      'bacaan wajib solat,باچاءن واجب دالم صلاة,takbir,al-fatihah,tahiyat akhir,salam',
      '85-90','membaca, menghafaz dan memperdengarkan bacaan wajib dalam solat mengikut urutan lakuan pada halaman sumber',
      'urutan, sebutan, hafazan, padanan bacaan dengan lakuan dan kelancaran'),
    ('ibadah_bacaan_sunat','ibadah','3.4','Bacaan Sunat Hai''at dalam Solat',
      'bacaan sunat solat,sunat haiat,sunat hai''at,باچاءن سنة هيئات دالم صلاة',
      '91-96','membaca, menghafaz dan memperdengarkan bacaan sunat hai''at dalam solat mengikut lakuan pada halaman sumber',
      'urutan, sebutan, hafazan, padanan bacaan dengan lakuan dan kelancaran'),

    ('sirah_belah_dada','sirah','4.1','Peristiwa Malaikat Membelah Dada Nabi',
      'membelah dada nabi,belah dada nabi,ممبله دادا نبي,tanda kenabian,kekasih allah',
      '97-102','menyusun dan menerangkan peristiwa malaikat membelah dada Nabi Muhammad serta pengajarannya berdasarkan halaman sumber',
      'urutan peristiwa, tokoh, tempat, tanda kenabian, kepentingan dan iktibar'),
    ('sirah_amanah','sirah','4.2','Keunggulan Sifat Amanah Nabi Muhammad',
      'amanah nabi muhammad,امانه نبي محمد,nabi muhammad al-amin,al amin',
      '103-108','mengenal kisah yang menunjukkan sifat amanah Nabi Muhammad dan memilih tindakan amanah berdasarkan halaman sumber',
      'maksud amanah, bukti kisah, tindakan, sebab, akibat dan teladan'),
    ('sirah_sahabat','sirah','4.3','Keperibadian Nabi ketika Bersahabat',
      'sahabat nabi,صحابت نبي,keperibadian nabi,persahabatan nabi,sahabat sejati',
      '109-114','menerangkan keperibadian dan tingkah laku Nabi Muhammad ketika bersahabat serta meneladaninya berdasarkan halaman sumber',
      'maksud sahabat, contoh sahabat, tingkah laku, sebab, teladan dan aplikasi'),

    ('adab_makan_minum','adab','5.1','Adab Makan dan Minum',
      'adab makan dan minum,ادب ماكن دان مينوم,sunnah makan,sunnah minum',
      '115-120','mengenal, menyusun dan mempraktikkan adab makan serta minum mengikut panduan halaman sumber',
      'urutan adab, bacaan, tangan kanan, kesederhanaan, kebersihan dan kepentingan'),
    ('adab_bersahabat','adab','5.2','Adab Bersahabat',
      'adab bersahabat,ادب برصحابت,persahabatan,indahnya persahabatan',
      '121-126','mengenal dan memilih adab bersahabat mengikut situasi, dialog dan tugasan halaman sumber',
      'maksud sahabat, tindakan beradab, tutur kata, bantuan, hormat dan kepentingan'),
    ('adab_berdoa','adab','5.3','Adab Berdoa',
      'adab berdoa,ادب بردعاء,doa,berdoa kepada allah',
      '127-132','mengenal, menyusun dan mempraktikkan adab berdoa berdasarkan situasi serta arahan halaman sumber',
      'maksud doa, urutan adab, waktu, cara, pengharapan dan kepentingan'),
    ('adab_cinta_rasul','adab','5.4','Adab Mengasihi Rasulullah',
      'mengasihi rasulullah,mencintai rasul,مغاسيهي رسول الله,selawat,sunnah rasul',
      '133-138','mengenal dan memilih amalan yang menunjukkan kasih kepada Rasulullah berdasarkan situasi halaman sumber',
      'adab, dalil, selawat, mencontohi sunnah, tindakan harian dan kepentingan')
), activity_rows(
  level_key, phase, suffix, row_name, pak21, is_game, priority,
  selection_weight, template
) as (
  values
    ('support','input','source_preview','Lihat Petunjuk Sumber','Think-Pair-Share',false,20,138,
      'Guru memaparkan tajuk, gambar, carta atau potongan tugasan pada {{page}}. Murid mengenal fokus %1$s dan menyebut satu petunjuk yang benar-benar kelihatan pada halaman tersebut.'),
    ('support','guided','guided_source','Bimbingan Langkah Demi Langkah','Talaqqi Musyafahah',false,21,145,
      'Dengan bimbingan guru, murid melaksanakan %1$s mengikut urutan asal pada {{page}}. Guru memodelkan satu langkah, murid mencuba, kemudian menyemak sebelum bergerak ke langkah seterusnya.'),
    ('support','evidence','show_one_evidence','Tunjuk Satu Bukti','Show Me',false,22,132,
      'Selepas tugasan Buku Teks pada {{page}}, murid menunjukkan satu jawapan, bacaan, tulisan atau pilihan daripada halaman yang sama sebagai bukti. Semakan menumpukan %2$s.'),
    ('core','practice','paired_source_task','Pasangan Tugasan Sumber','Pair Check',false,30,150,
      'Murid melaksanakan %1$s berdasarkan arahan sebenar pada {{page}}. Pasangan menyemak hasil menggunakan %2$s, kemudian kedua-duanya membetulkan satu bahagian jika perlu.'),
    ('core','game','source_match','Padanan Sumber Beradab','Matching Game',true,31,140,
      'Selepas tugasan asal selesai, kumpulan memadan atau menyusun semula kata kunci, gambar, kategori atau urutan yang diambil daripada {{page}}. Setiap padanan mesti disahkan semula melalui %2$s.'),
    ('core','sharing','round_robin_evidence','Kongsi Bukti Bergilir','Round Robin',false,32,136,
      'Setiap ahli berkongsi satu hasil daripada tugasan %1$s pada {{page}}. Kumpulan menyemak ketepatan berdasarkan %2$s dan merekod satu pembetulan bersama.'),
    ('challenge','practice','independent_source','Tugasan Kendiri Berbukti','Evidence Hunt',false,40,148,
      'Murid melaksanakan %1$s pada {{page}} dengan minimum bimbingan, kemudian memilih dua bukti daripada halaman atau hasil sendiri yang menunjukkan %2$s.'),
    ('challenge','game','source_reasoning','Cabaran Bukti Sumber','Team Challenge',true,41,140,
      'Kumpulan menerima satu soalan cabaran yang masih menggunakan tugasan %1$s pada {{page}}. Mereka memilih jawapan, memberikan sebab dan menunjukkan bukti melalui %2$s tanpa menambah fakta di luar sumber.'),
    ('challenge','evidence','explain_and_apply','Jelaskan dan Aplikasikan','Gallery Walk',false,42,138,
      'Murid menerangkan hasil tugasan %1$s pada {{page}}, menyokongnya dengan %2$s dan memberikan satu contoh aplikasi yang selaras dengan SK/SP. Rakan menyemak ketepatan kepada sumber.')
)
insert into public.rph_activity_library (
  activity_key, language_code, skill_key, phase, level_key, activity_name,
  activity_template, bbm_template, pak21, objective_keywords, source_keywords,
  year_min, year_max, is_game, priority, active, subject_key, pedagogy_key,
  activity_type, example_text, requires_source, selection_weight, subskill_key
)
select
  format('islamic_y2_%s_%s', p.pattern_key, a.suffix),
  'jawi', 'islamic_education', a.phase, a.level_key,
  format('%s: %s', p.pattern_name, a.row_name),
  format(a.template, p.source_focus, p.evidence),
  'Buku Teks', a.pak21,
  array[p.pattern_name, p.field_key, p.sk_code]::text[],
  string_to_array(p.source_words, ','),
  2, 2, a.is_game, a.priority, true,
  'islamic_education', 'source_first_islamic_education',
  format('islamic_y2_%s_%s', p.pattern_key, a.suffix),
  format('Digunakan hanya selepas tugasan sebenar Buku Teks Pendidikan Islam Tahun 2 halaman bercetak %s dikenal pasti dan disahkan.', p.printed_pages),
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

with patterns(pattern_key, pattern_name, field_key, sk_code, source_words, printed_pages, source_focus) as (
  values
    ('quran_tilawah_annas','Tilawah Surah an-Nas','al_quran','1.1','surah an-nas,surah annas,سورة الناس,tilawah','1-6','membaca Surah an-Nas secara talaqqi dan musyafahah'),
    ('quran_tilawah_alfalaq','Tilawah Surah al-Falaq','al_quran','1.2','surah al-falaq,surah alfalaq,سورة الفلق,tilawah','7-12','membaca Surah al-Falaq secara talaqqi dan musyafahah'),
    ('quran_hifz_annas','Hafazan Surah an-Nas','al_quran','1.3','hafazan surah an-nas,حفظ سورة الناس','13-18','menghafaz dan memperdengarkan Surah an-Nas'),
    ('quran_hifz_alfalaq','Hafazan Surah al-Falaq','al_quran','1.4','hafazan surah al-falaq,حفظ سورة الفلق','19-24','menghafaz dan memperdengarkan Surah al-Falaq'),
    ('quran_mad_asli','Bacaan Mad Asli','al_quran','1.5','mad asli,مد اصلي,dua harakat','25-30','mengenal dan membaca mad asli dua harakat'),
    ('quran_nun_mim_syaddah','Nun dan Mim Syaddah','al_quran','1.6','nun syaddah,mim syaddah,نون,ميم,شدة','31-36','mengenal dan membaca nun serta mim syaddah'),
    ('jawi_multisyllable','Perkataan Tiga Suku Kata atau Lebih','jawi','6.1','tiga suku kata,perkataan jawi,تيݢ سوكو كات','37-42','membaca, membina dan menulis perkataan Jawi'),
    ('jawi_word_phrases','Rangkai Kata Jawi','jawi','6.2','rangkai kata,رڠكاي كات','43-48','membaca, membina dan menulis rangkai kata Jawi'),
    ('jawi_short_text','Ayat dan Teks Pendek Jawi','jawi','6.3','ayat pendek,teks pendek,تيك س ڤينديق','49-54','membaca, membina dan menulis teks pendek Jawi'),
    ('akidah_sifat_allah','Sifat-sifat Allah','akidah','2.1','sifat allah,صيفت الله','55-60','mengenal sifat wajib, mustahil dan harus bagi Allah'),
    ('akidah_ahad_samad','Nama Allah al-Ahad dan as-Samad','akidah','2.2','al-ahad,as-samad,الأحد,الصمد','61-66','menerangkan al-Ahad dan as-Samad'),
    ('akidah_malaikat','Beriman kepada Malaikat','akidah','2.3','malaikat,ملائكة,nama malaikat,tugas malaikat','67-72','mengenal sifat, nama dan tugas malaikat'),
    ('ibadah_istinja','Istinja'' selain Air','ibadah','3.1','istinja,استنجاء,alat istinja','73-78','mengenal alat, syarat dan cara istinja'' selain air'),
    ('ibadah_syarat_solat','Syarat Wajib dan Syarat Sah Solat','ibadah','3.2','syarat wajib solat,syarat sah solat','79-84','mengelaskan syarat wajib dan syarat sah solat'),
    ('ibadah_bacaan_wajib','Bacaan Wajib dalam Solat','ibadah','3.3','bacaan wajib solat,باچاءن واجب دالم صلاة','85-90','membaca dan menghafaz bacaan wajib dalam solat'),
    ('ibadah_bacaan_sunat','Bacaan Sunat Hai''at dalam Solat','ibadah','3.4','bacaan sunat solat,sunat haiat,سنة هيئات','91-96','membaca dan menghafaz bacaan sunat hai''at dalam solat'),
    ('sirah_belah_dada','Peristiwa Malaikat Membelah Dada Nabi','sirah','4.1','membelah dada nabi,ممبله دادا نبي','97-102','menyusun peristiwa malaikat membelah dada Nabi'),
    ('sirah_amanah','Keunggulan Sifat Amanah Nabi Muhammad','sirah','4.2','amanah nabi muhammad,امانه نبي محمد,al-amin','103-108','mengenal sifat amanah Nabi Muhammad'),
    ('sirah_sahabat','Keperibadian Nabi ketika Bersahabat','sirah','4.3','sahabat nabi,صحابت نبي','109-114','meneladani keperibadian Nabi ketika bersahabat'),
    ('adab_makan_minum','Adab Makan dan Minum','adab','5.1','adab makan dan minum,ادب ماكن دان مينوم','115-120','mengamalkan adab makan dan minum'),
    ('adab_bersahabat','Adab Bersahabat','adab','5.2','adab bersahabat,ادب برصحابت','121-126','memilih dan mengamalkan adab bersahabat'),
    ('adab_berdoa','Adab Berdoa','adab','5.3','adab berdoa,ادب بردعاء','127-132','menyusun dan mengamalkan adab berdoa'),
    ('adab_cinta_rasul','Adab Mengasihi Rasulullah','adab','5.4','mengasihi rasulullah,مغاسيهي رسول الله','133-138','memilih amalan yang menunjukkan kasih kepada Rasulullah')
), induction_rows(suffix, induction_type, row_name, pak21, priority, template) as (
  values
    ('source_heading','visual','Teka Fokus Halaman','Think-Pair-Share',20,
      'Guru memaparkan tajuk kecil atau bahagian terpilih pada {{page}}. Murid menyatakan satu jangkaan tentang %1$s sebelum menyemak arahan sebenar Buku Teks.'),
    ('source_image','visual','Lihat dan Hubungkan','Pair Check',22,
      'Guru memaparkan gambar, carta atau susun atur daripada {{page}}. Pasangan mengenal dua petunjuk yang berkaitan dengan %1$s tanpa menambah fakta di luar halaman.'),
    ('source_recall','oral','Ingat dan Semak','Round Robin',24,
      'Murid berkongsi satu pengetahuan sedia ada tentang %1$s secara bergilir. Guru menerima respons ringkas, kemudian murid menyemak ketepatan melalui {{page}}.')
)
insert into public.rph_induction_library (
  induction_key, subject_key, skill_key, language_code, induction_type,
  induction_name, induction_template, example_text, bbm_template, pak21,
  objective_keywords, source_keywords, year_min, year_max, priority,
  selection_weight, active, subskill_key
)
select
  format('islamic_y2_%s_%s', p.pattern_key, i.suffix),
  'islamic_education', 'islamic_education', 'jawi', i.induction_type,
  format('%s: %s', p.pattern_name, i.row_name),
  format(i.template, p.source_focus),
  format('Gunakan hanya petunjuk Buku Teks Pendidikan Islam Tahun 2 halaman bercetak %s; jangan mereka kandungan.', p.printed_pages),
  'Buku Teks', i.pak21,
  array[p.pattern_name, p.field_key, p.sk_code]::text[],
  string_to_array(p.source_words, ','),
  2, 2, i.priority, 136, true, p.pattern_key
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
  'islamic_education', 'Pendidikan Islam', 'jawi', 'rtl',
  'RPT menentukan minggu, bidang dan SK/SP; DSKP mengesahkan standard; Buku Teks menentukan gambar, carta, bacaan, urutan, soalan dan hasil sebenar. Aktiviti perpustakaan hanya membungkus tugasan sumber yang sama untuk support, core dan challenge. Tilawah serta hafazan menggunakan talaqqi, musyafahah dan tasmi'' secara beradab. Jawi mengekalkan tulisan Jawi. Pendidikan Islam kekal berasingan daripada Bahasa Melayu, Bahasa Arab dan English. Lesson Map tidak boleh disahkan secara automatik dan tidak boleh dicipta apabila halaman atau tugasan sumber belum dikenal pasti.',
  array['Talaqqi Musyafahah','Tasmi''','Think-Pair-Share','Pair Check','Round Robin','Evidence Hunt','Gallery Walk'],
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

-- Expected result for this file:
-- 23 patterns x 9 activity variants = 207 activity rows
-- 23 patterns x 3 induction variants = 69 induction rows
-- 1 isolated Pendidikan Islam pedagogy profile
