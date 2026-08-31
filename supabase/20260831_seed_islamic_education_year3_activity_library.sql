-- RPH Hub: Pendidikan Islam Tahun 3 source-first Activity + Induction Library.
-- Source audit: RPT Pendidikan Islam Tahun 3 SK 2026, DSKP KSSR (Semakan 2017)
-- and Buku Teks Pendidikan Islam Tahun 3 (printed pages 2-145).
--
-- Idempotent: existing keys are updated, never duplicated.
-- These rows only vary how a verified source task is delivered. They do not
-- create Lesson Maps, invent textbook content or mark any map as verified.

with patterns(
  pattern_key, field_key, sk_code, pattern_name, source_words,
  printed_pages, source_focus, evidence
) as (
  values
    ('quran_tilawah_alkafirun','al_quran','1.1','Tilawah Surah al-Kafirun',
      'surah al-kafirun,surah alkafirun,surah kafirun,سورة الكافرون,tilawah,talaqqi,musyafahah',
      '2-7','membaca Surah al-Kafirun secara talaqqi dan musyafahah mengikut potongan kalimah, ayat serta tanda bacaan pada halaman sumber',
      'sebutan huruf, baris, kadar bacaan, hukum tajwid, kelancaran, tertib ayat dan adab membaca al-Quran'),
    ('quran_tilawah_alasr','al_quran','1.2','Tilawah Surah al-Asr',
      'surah al-asr,surah alasr,surah al asr,سورة العصر,tilawah,talaqqi,musyafahah',
      '8-13','membaca Surah al-Asr secara talaqqi dan musyafahah mengikut potongan kalimah, ayat serta latihan pada halaman sumber',
      'sebutan huruf, baris, kadar bacaan, hukum tajwid, kelancaran, tertib ayat dan amalan bacaan'),
    ('quran_hifz_alkafirun','al_quran','1.3','Hafazan Surah al-Kafirun',
      'hafazan surah al-kafirun,hafaz al-kafirun,حفظ سورة الكافرون,tasmi,memperdengarkan hafazan',
      '14-19','menghafaz dan memperdengarkan Surah al-Kafirun mengikut urutan ayat, permainan hafazan serta panduan tasmi'' pada halaman sumber',
      'ketepatan urutan, kelancaran, sebutan, hukum tajwid, ingatan dan adab tasmi'''),
    ('quran_hifz_alasr','al_quran','1.4','Hafazan Surah al-Asr',
      'hafazan surah al-asr,hafaz al-asr,حفظ سورة العصر,tasmi,memperdengarkan hafazan',
      '20-25','menghafaz dan memperdengarkan Surah al-Asr mengikut urutan ayat, latihan berpasangan serta panduan pada halaman sumber',
      'ketepatan urutan, kelancaran, sebutan, hukum tajwid, ingatan dan amalan hafazan'),
    ('quran_kefahaman_alfatihah','al_quran','1.5','Kefahaman Surah al-Fatihah',
      'surah al-fatihah,surah al fatihah,سورة الفاتحة,kefahaman,maksud ayat,pengajaran surah',
      '26-31','menerangkan pengenalan, maksud ayat, pengajaran dan kepentingan mengamalkan Surah al-Fatihah berdasarkan tugasan halaman sumber',
      'pengenalan surah, maksud ayat, pengajaran, kaitan dengan solat, contoh amalan dan pembentukan peribadi'),
    ('quran_nun_sakinah_tanwin','al_quran','1.6','Hukum Nun Sakinah dan Tanwin',
      'nun sakinah,nun mati,tanwin,نون ساكنة,تنوين,izhar halqi,idgham,iqlab,ikhfa haqiqi',
      '32-36','mengenal pasti dan membaca kalimah atau potongan ayat yang mengandungi hukum nun sakinah dan tanwin berdasarkan jadual serta contoh halaman sumber',
      'tanda nun sakinah atau tanwin, huruf hukum, izhar halqi, idgham, iqlab, ikhfa haqiqi dan bacaan bertajwid'),

    ('hadith_young_old','hadith','2.1','Yang Muda Dikasihi, Yang Tua Dihormati',
      'yang muda dikasihi,yang tua dihormati,مودا دكاسيهي,توا دحرمتي,hadis,mengasihi,menghormati',
      '38-44','membaca teks dan terjemahan hadis, menjelaskan tuntutan mengasihi yang muda serta menghormati yang tua dan memilih tindakan berdasarkan situasi halaman sumber',
      'pengertian hadis, bacaan teks, terjemahan, adab, kesan, tindakan dalam situasi dan penghayatan tuntutan hadis'),

    ('jawi_prefixes','jawi','7.1','Imbuhan Awalan Jawi',
      'imbuhan awalan,awalan jawi,ايمبوهن اولن,اميبوهن اولن,indahnya negaraku,ايندهث نضاراكو',
      '46-51','mengenal imbuhan awalan lalu membaca, membina dan menulis perkataan, ayat atau teks Jawi berdasarkan contoh berwarna serta tugasan halaman sumber',
      'kata dasar, bentuk imbuhan awalan, perubahan huruf, ejaan Jawi, sambungan huruf, bacaan dan ketepatan tulisan'),
    ('jawi_suffixes','jawi','7.2','Imbuhan Akhiran Jawi',
      'imbuhan akhiran,akhiran jawi,ايمبوهن اخيرن,اميبوهن اخيرن,jauh perjalanan luas pemandangan',
      '52-57','mengenal imbuhan akhiran lalu membaca, membina dan menulis perkataan, ayat atau teks Jawi berdasarkan sajak, contoh dan tugasan halaman sumber',
      'kata dasar, bentuk imbuhan akhiran, pemilihan akhiran, ejaan Jawi, binaan ayat dan ketepatan tulisan'),
    ('jawi_circumfixes','jawi','7.3','Imbuhan Apitan Jawi',
      'imbuhan apitan,apitan jawi,ايمبوهن افيتن,اميبوهن افيتن,negeri cantik budaya menarik',
      '58-64','mengenal imbuhan apitan lalu membaca, membina dan menulis perkataan, ayat atau teks Jawi berdasarkan carta serta tugasan halaman sumber',
      'kata dasar, pasangan awalan-akhiran, bentuk apitan, ejaan Jawi, binaan ayat, bacaan dan ketepatan tulisan'),

    ('akidah_alim_hakim','akidah','3.1','Nama Allah al-Alim dan al-Hakim',
      'al-alim,al alim,العليم,al-hakim,al hakim,الحكيم,nama allah',
      '66-71','menerangkan pengertian nama Allah al-Alim dan al-Hakim, membaca dalil serta menghubungkan kesan keimanan dengan tindakan berdasarkan halaman sumber',
      'nama Allah, pengertian, dalil naqli, perbezaan makna, kesan keimanan, bukti tindakan dan rasa syukur'),
    ('akidah_books','akidah','3.2','Beriman kepada Kitab',
      'beriman kepada kitab,برايمان كفد كتاب,kitab allah,kitab rasul,zabur,taurat,injil,al-quran',
      '72-78','menerangkan maksud dan kewajipan beriman kepada kitab, memadankan kitab dengan rasul serta menilai kesannya berdasarkan halaman sumber',
      'maksud iman, dalil, nama kitab, rasul penerima, kewajipan, kepentingan, kesan keimanan dan tindakan'),

    ('ibadah_hadas','ibadah','4.1','Bersuci daripada Hadas',
      'bersuci daripada hadas,برسوچي درفد حدث,hadas besar,hadas kecil,mandi wajib,sebab hadas',
      '80-85','mengenal maksud dan pembahagian hadas, sebab serta larangan ketika berhadas besar dan menyusun kaedah mandi wajib berdasarkan halaman sumber',
      'maksud hadas, pembahagian, hukum dan dalil, sebab, larangan, urutan mandi wajib, amalan wajib atau sunat dan kepentingan'),
    ('ibadah_solat_sempurna','ibadah','4.2','Solat yang Sempurna',
      'solat yang sempurna,صلاة يغ سمفورنا,rukun solat,rukun qauli,rukun fili,rukun qalbi',
      '86-91','mengenal, mengelaskan dan mempraktikkan rukun solat mengikut urutan perbuatan serta bacaan pada halaman sumber',
      'rukun qalbi, qauli dan fi''li, niat, bacaan, perbuatan, tertib, tumakninah dan amali solat'),
    ('ibadah_sunat_abad_haiat','ibadah','4.3','Sunat Ab''ad dan Hai''at',
      'sunat abad,sunat ab''ad,sunat haiat,sunat hai''at,سنة أبعاض,هيئات,sujud sahwi',
      '92-98','membezakan sunat ab''ad dan hai''at, memadankan contoh dengan kategori serta menerangkan tindakan apabila tertinggal berdasarkan halaman sumber',
      'pengertian, perbezaan kategori, contoh amalan, padanan dengan lakuan solat, sujud sahwi dan kesempurnaan solat'),

    ('sirah_wahyu','sirah','5.1','Wahyu Teragung',
      'wahyu teragung,وحي تراضوڠ,wahyu pertama,gua hira,jibril,iqra,penurunan wahyu',
      '100-107','menyusun dan menceritakan peristiwa penurunan wahyu pertama serta merumuskan kepentingan dan iktibarnya berdasarkan halaman sumber',
      'maksud wahyu, masa, tempat, tokoh, urutan peristiwa, ayat pertama, kepentingan, iktibar dan penghayatan'),
    ('sirah_tabligh','sirah','5.2','Meneladani Sifat Tabligh',
      'sifat tabligh,meneladani tabligh,صيفت تبليغ,menyampaikan,dakwah nabi,sebar ilmu',
      '108-113','menerangkan maksud dan kisah sifat tabligh Nabi Muhammad lalu memilih cara meneladaninya melalui penyampaian ilmu berdasarkan halaman sumber',
      'maksud tabligh, dalil atau kisah, cabaran dakwah, tindakan Nabi, keunggulan sifat, cara meneladani dan kepentingan menyampaikan ilmu'),
    ('sirah_makkah','sirah','5.3','Nabi Muhammad dan Masyarakat Makkah',
      'nabi muhammad dan masyarakat makkah,مشاركت مكة,masyarakat jahiliah,penentangan makkah,keperibadian nabi',
      '114-120','membandingkan keadaan masyarakat Makkah sebelum Islam dengan keperibadian Nabi ketika menghadapi penentangan serta memilih iktibar berdasarkan halaman sumber',
      'keadaan masyarakat, amalan sebelum Islam, bentuk penentangan, keperibadian Nabi, ketabahan, kesabaran, kebijaksanaan dan iktibar'),

    ('adab_sleep','adab','6.1','Jaga Adab Tidurmu',
      'adab tidur,jaga adab tidurmu,ادب تيدور,تيدور,doa tidur,qailulah,sunnah tidur',
      '122-127','mengenal, menyusun dan mempraktikkan adab sebelum tidur, ketika tidur serta selepas bangun berdasarkan gambar, doa dan situasi halaman sumber',
      'urutan adab, doa, kebersihan, posisi tidur, qailulah, larangan, kepentingan dan amalan sunnah'),
    ('adab_knowledge','adab','6.2','Ilmu Dituntut, Adab Dipelihara',
      'menuntut ilmu,ilmu dituntut adab dipelihara,منونتوت علمو,علمو دتونتوت,fardu ain,fardu kifayah,adab belajar',
      '128-133','membezakan ilmu fardu ain dan fardu kifayah, membaca dalil serta memilih adab menuntut ilmu berdasarkan halaman sumber',
      'maksud ilmu, kategori fardu ain atau kifayah, contoh, dalil, adab, kepentingan, situasi dan amalan harian'),
    ('adab_gratitude','adab','6.3','Mari Bersyukur',
      'mari bersyukur,bersyukur,برشكور,syukur,الحمد لله,nikmat allah',
      '134-139','menerangkan pengertian syukur dan memilih cara bersyukur kepada Allah, manusia serta alam sekitar berdasarkan tugasan halaman sumber',
      'pengertian, dalil, nikmat, ucapan alhamdulillah, cara bersyukur, kepentingan, qanaah dan tindakan'),
    ('adab_sunnah','adab','6.4','Cintakan Sunnah Rasulullah',
      'cintakan sunnah rasulullah,sunnah rasul,سنّة رسول,سنة رسول,perkataan nabi,perbuatan nabi',
      '140-145','menerangkan pengertian sunnah, membezakan sunnah perkataan dan perbuatan serta memilih amalan berdasarkan halaman sumber',
      'pengertian sunnah, dalil, sunnah perkataan, sunnah perbuatan, contoh amalan, kepentingan, kecintaan dan penghayatan')
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
  format('islamic_y3_%s_%s', p.pattern_key, a.suffix),
  'jawi', 'islamic_education', a.phase, a.level_key,
  format('%s: %s', p.pattern_name, a.row_name),
  format(a.template, p.source_focus, p.evidence),
  'Buku Teks', a.pak21,
  array[p.pattern_name, p.field_key, p.sk_code]::text[],
  string_to_array(p.source_words, ','),
  3, 3, a.is_game, a.priority, true,
  'islamic_education', 'source_first_islamic_education',
  format('islamic_y3_%s_%s', p.pattern_key, a.suffix),
  format('Digunakan hanya selepas tugasan sebenar Buku Teks Pendidikan Islam Tahun 3 halaman bercetak %s dikenal pasti dan disahkan.', p.printed_pages),
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
    ('quran_tilawah_alkafirun','Tilawah Surah al-Kafirun','al_quran','1.1','surah al-kafirun,سورة الكافرون,tilawah','2-7','membaca Surah al-Kafirun secara talaqqi dan musyafahah'),
    ('quran_tilawah_alasr','Tilawah Surah al-Asr','al_quran','1.2','surah al-asr,سورة العصر,tilawah','8-13','membaca Surah al-Asr secara talaqqi dan musyafahah'),
    ('quran_hifz_alkafirun','Hafazan Surah al-Kafirun','al_quran','1.3','hafazan surah al-kafirun,حفظ سورة الكافرون','14-19','menghafaz dan memperdengarkan Surah al-Kafirun'),
    ('quran_hifz_alasr','Hafazan Surah al-Asr','al_quran','1.4','hafazan surah al-asr,حفظ سورة العصر','20-25','menghafaz dan memperdengarkan Surah al-Asr'),
    ('quran_kefahaman_alfatihah','Kefahaman Surah al-Fatihah','al_quran','1.5','surah al-fatihah,سورة الفاتحة,kefahaman','26-31','memahami maksud dan pengajaran Surah al-Fatihah'),
    ('quran_nun_sakinah_tanwin','Hukum Nun Sakinah dan Tanwin','al_quran','1.6','nun sakinah,tanwin,نون ساكنة,تنوين','32-36','mengenal dan membaca hukum nun sakinah serta tanwin'),
    ('hadith_young_old','Yang Muda Dikasihi, Yang Tua Dihormati','hadith','2.1','yang muda dikasihi,yang tua dihormati,مودا دكاسيهي,توا دحرمتي','38-44','membaca dan menghayati hadis menghormati yang tua serta mengasihi yang muda'),
    ('jawi_prefixes','Imbuhan Awalan Jawi','jawi','7.1','imbuhan awalan,ايمبوهن اولن','46-51','membaca, membina dan menulis perkataan atau teks Jawi berimbuhan awalan'),
    ('jawi_suffixes','Imbuhan Akhiran Jawi','jawi','7.2','imbuhan akhiran,ايمبوهن اخيرن','52-57','membaca, membina dan menulis perkataan atau teks Jawi berimbuhan akhiran'),
    ('jawi_circumfixes','Imbuhan Apitan Jawi','jawi','7.3','imbuhan apitan,ايمبوهن افيتن','58-64','membaca, membina dan menulis perkataan atau teks Jawi berimbuhan apitan'),
    ('akidah_alim_hakim','Nama Allah al-Alim dan al-Hakim','akidah','3.1','al-alim,al-hakim,العليم,الحكيم','66-71','menerangkan nama Allah al-Alim dan al-Hakim'),
    ('akidah_books','Beriman kepada Kitab','akidah','3.2','beriman kepada kitab,برايمان كفد كتاب','72-78','menerangkan dan membuktikan keimanan kepada kitab Allah'),
    ('ibadah_hadas','Bersuci daripada Hadas','ibadah','4.1','bersuci daripada hadas,برسوچي درفد حدث','80-85','mengenal hadas dan menyusun kaedah bersuci daripada hadas besar'),
    ('ibadah_solat_sempurna','Solat yang Sempurna','ibadah','4.2','solat yang sempurna,صلاة يغ سمفورنا','86-91','mengenal dan mempraktikkan rukun solat mengikut urutan'),
    ('ibadah_sunat_abad_haiat','Sunat Ab''ad dan Hai''at','ibadah','4.3','sunat ab''ad,sunat hai''at,سنة أبعاض,هيئات','92-98','membezakan sunat ab''ad dan hai''at dalam solat'),
    ('sirah_wahyu','Wahyu Teragung','sirah','5.1','wahyu teragung,وحي تراضوڠ,wahyu pertama','100-107','menyusun peristiwa penurunan wahyu pertama'),
    ('sirah_tabligh','Meneladani Sifat Tabligh','sirah','5.2','sifat tabligh,صيفت تبليغ','108-113','menerangkan dan meneladani sifat tabligh Nabi Muhammad'),
    ('sirah_makkah','Nabi Muhammad dan Masyarakat Makkah','sirah','5.3','masyarakat makkah,مشاركت مكة','114-120','meneladani keperibadian Nabi ketika menghadapi masyarakat Makkah'),
    ('adab_sleep','Jaga Adab Tidurmu','adab','6.1','adab tidur,ادب تيدور','122-127','menyusun dan mempraktikkan adab tidur'),
    ('adab_knowledge','Ilmu Dituntut, Adab Dipelihara','adab','6.2','menuntut ilmu,منونتوت علمو','128-133','mengenal ilmu dan mengamalkan adab menuntut ilmu'),
    ('adab_gratitude','Mari Bersyukur','adab','6.3','bersyukur,برشكور','134-139','mengenal dan mengamalkan cara bersyukur'),
    ('adab_sunnah','Cintakan Sunnah Rasulullah','adab','6.4','sunnah rasul,سنّة رسول','140-145','mengenal dan mengamalkan sunnah Rasulullah')
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
  format('islamic_y3_%s_%s', p.pattern_key, i.suffix),
  'islamic_education', 'islamic_education', 'jawi', i.induction_type,
  format('%s: %s', p.pattern_name, i.row_name),
  format(i.template, p.source_focus),
  format('Gunakan hanya petunjuk Buku Teks Pendidikan Islam Tahun 3 halaman bercetak %s; jangan mereka kandungan.', p.printed_pages),
  'Buku Teks', i.pak21,
  array[p.pattern_name, p.field_key, p.sk_code]::text[],
  string_to_array(p.source_words, ','),
  3, 3, i.priority, 136, true, p.pattern_key
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
-- 22 patterns x 9 activity variants = 198 activity rows
-- 22 patterns x 3 induction variants = 66 induction rows
-- 1 isolated Pendidikan Islam pedagogy profile
