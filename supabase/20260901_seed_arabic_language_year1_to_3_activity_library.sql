-- Bahasa Arab Tahun 1-3: isolated source-first Activity + Induction Library.
-- RPT 2026 Kumpulan B supplies week/unit/SK-SP; DSKP verifies standards;
-- the printed Buku Teks page and its real task remain the fixed source anchor.

with patterns(
  pattern_key, pattern_name, year_no, sk_codes, source_words,
  printed_pages, source_focus, evidence
) as (
  values
    ('arabic_y1_alphabet','Huruf Hijaiyah Tahun 1',1,'1.1,2.1,3.1','هيا نتعرف إلى الحروف,huruf hijaiyah,huruf arab,dengar sebut huruf,salin huruf','4-32','mendengar, menyebut, mengecam, membaca dan menyalin huruf hijaiyah daripada tugasan sebenar halaman sumber','bunyi, bentuk, baris, kedudukan dan salinan huruf'),
    ('arabic_y1_focused_letters','Huruf Fokus Tahun 1',1,'1.2,2.2,2.3,3.2','هيا نركز,fokus huruf,kedudukan huruf,suku kata,م,ب,ت,أ,ج,د,ك,ن','33-40','membina, membaca, memadankan dan menyalin huruf atau suku kata fokus pada halaman sumber','bunyi, sambungan, kedudukan, bacaan dan salinan'),
    ('arabic_y1_greetings','Ucapan dan Sambutan',1,'1.4,2.4,3.3','كيف نحيي ونرحب,تحيات,ترحيبات,ucapan,salam,selamat datang','42-46','mendengar, membaca, melakonkan dan menyalin ucapan yang terdapat pada halaman sumber','sebutan, intonasi, padanan situasi, bacaan dan salinan'),
    ('arabic_y1_numbers_1_10','Nombor 1 hingga 10',1,'1.5,2.5,3.4','نمرح بالأرقام,nombor 1-10,أرقام,واحد,اثنان,ثلاثة,عشرة','47-50','mendengar, menyebut, membaca, menyusun, memadankan dan menyalin nombor 1 hingga 10 pada halaman sumber','sebutan, urutan, angka, perkataan nombor, kuantiti dan salinan'),
    ('arabic_y2_focused_letters','Huruf Fokus Tahun 2',2,'1.1,1.2,2.1,2.2,3.1,3.2','huruf fokus,suku kata,ل,ي,و,س,ه,ر,ف,ط,ق','9-10,25-30,49-54,75-80','mendengar, menyebut, membezakan, membaca, membina dan menyalin huruf atau suku kata fokus pada halaman sumber','bunyi, baris, kedudukan, sambungan, bacaan dan salinan'),
    ('arabic_y2_acquaintance','Suai Kenal',2,'1.3,1.4,2.3,2.4,3.3,3.4','هيا نتعارف,suai kenal,pengenalan diri,ما اسمك,كم عمرك,أين تسكن','9-24','mendengar, membaca, melakonkan, melengkapkan dan menyalin kosa kata atau struktur suai kenal pada halaman sumber','sebutan, padanan soalan-jawapan, dialog, bacaan dan salinan'),
    ('arabic_y2_family','Keluarga Saya',2,'1.3,1.4,2.3,2.4,3.3,3.4','أحب أسرتي,keluarga,هذا,هذه,أب,أم,أخ,أخت,جد,جدة','25-48','mengenal, membaca, mengelaskan, menggunakan dan menyalin kosa kata atau struktur keluarga pada halaman sumber','padanan ahli keluarga, penggunaan هذا atau هذه, bacaan, dialog dan salinan'),
    ('arabic_y2_body','Anggota Badan',2,'1.3,1.4,2.3,2.4,3.3,3.4','جسمي السليم,anggota badan,عين,أذن,يد,رجل,نظيف,جميل','49-74','mendengar, menunjukkan, membaca, memadankan, menerangkan dan menyalin kosa kata atau struktur anggota badan pada halaman sumber','pengecaman anggota, kata sifat, bacaan, struktur dan salinan'),
    ('arabic_y2_school_tools','Alat Persekolahan',2,'1.3,1.4,2.3,2.4,3.3,3.4','أحافظ على الأدوات الدراسية,alat persekolahan,قلم,كتاب,دفتر,مسطرة,عندي,على,في,أين','75-101','mengenal, membaca, mengeja, mengelaskan, menggunakan dan menyalin kosa kata atau struktur alat persekolahan pada halaman sumber','padanan objek-perkataan, pemilikan, lokasi, soal jawab, bacaan dan salinan'),
    ('arabic_y2_numbers_11_20','Nombor 11 hingga 20',2,'1.5,2.5,3.5','nombor 11-20,الأرقام,الأعداد,أحد عشر,عشرون,harga','19-24,43-48,70-74,98-101','mendengar, menyebut, membaca, menyusun, memadankan dan menyalin nombor 11 hingga 20 pada halaman sumber','sebutan, urutan, angka, perkataan nombor, kuantiti, harga dan salinan'),
    ('arabic_y3_focused_letters','Huruf Fokus Tahun 3',3,'1.1,1.2,2.1,2.2,3.1,3.2','huruf fokus,suku kata,خ,ش,ع,ص,ز,ح,ث,ذ,ظ,غ,ض','5-10,29-36,59-64,87-92','mendengar, menyebut, membezakan, membaca, membina dan menyalin huruf atau suku kata fokus pada halaman sumber','bunyi, baris, kedudukan, sambungan, bacaan dan salinan'),
    ('arabic_y3_classroom','Bilik Darjah',3,'1.3,1.4,2.3,2.4,3.3,3.4','تفضل إلى الفصل,bilik darjah,مقعد,سبورة,مكتب,هذا,هذه,ذلك,تلك,من فضلك','2-28','mengenal, membaca, memadankan, melakonkan dan menyalin kosa kata atau struktur bilik darjah pada halaman sumber','padanan objek, kata tunjuk, ungkapan sopan, bacaan, dialog dan salinan'),
    ('arabic_y3_clothes','Pakaian Cantik',3,'1.3,1.4,2.3,2.4,3.3,3.4','ملابسي الجميلة,pakaian,قميص,سروال,فستان,حذاء,عندي,جميل,نظيف,جديد','29-58','mengenal, membaca, mengelaskan, menggunakan dan menyalin kosa kata atau struktur pakaian pada halaman sumber','padanan pakaian, kata sifat, pemilikan, dialog, bacaan dan salinan'),
    ('arabic_y3_colours','Warna di Sekeliling Kita',3,'1.3,1.4,2.3,2.4,3.3,3.4','الألوان حولنا,warna,ما لون,أحمر,أزرق,أخضر,أصفر,رائع,جميل','59-86','mendengar, mengenal, membaca, memadankan, menerangkan dan menyalin kosa kata atau struktur warna pada halaman sumber','pengecaman warna, bentuk muzakkar atau muannath, soal jawab, bacaan dan salinan'),
    ('arabic_y3_time','Masa Itu Emas',3,'1.3,1.4,2.3,2.4,3.3,3.4','الوقت كالذهب,masa,waktu,اليوم,غد,أمس,صباح,ظهر,مساء,الفطور,الغداء,العشاء','87-117','mengenal, menyusun, membaca, melakonkan dan menyalin kosa kata atau struktur hari dan waktu pada halaman sumber','urutan hari, padanan waktu-aktiviti, dialog, bacaan dan salinan'),
    ('arabic_y3_numbers_21_31','Nombor 21 hingga 31',3,'1.5,2.5,3.5','nombor 21-31,الأرقام,الأعداد,واحد وعشرون,إحدى وثلاثون','23-25,53-55,80-82,108-110','mendengar, menyebut, membaca, menyusun, memadankan dan menyalin nombor 21 hingga 31 pada halaman sumber','sebutan, urutan, angka, perkataan nombor, kuantiti dan salinan')
), variants(level_key,phase,suffix,row_name,pak21,is_game,priority,weight,template) as (
  values
    ('support','input','source_notice','Dengar dan Kenal Petunjuk','Listen-and-Repeat',false,20,142,'Guru memperdengarkan atau memaparkan bahagian terpilih pada {{page}}. Murid mengenal satu petunjuk bagi %1$s, kemudian meniru model sumber dengan bimbingan.'),
    ('support','guided','guided_source','Tiru-Baca-Salin Berpandu','Listen-and-Repeat',false,21,150,'Dengan bimbingan guru, murid melaksanakan %1$s pada {{page}} mengikut urutan tugasan asal: dengar atau lihat, tiru, baca, semak dan salin jika diarahkan. Semakan menumpukan %2$s.'),
    ('support','evidence','show_one','Tunjuk Satu Bukti','Show Me',false,22,138,'Selepas tugasan asal pada {{page}}, murid menunjukkan satu bukti daripada halaman yang sama. Guru menyemak %2$s.'),
    ('core','practice','pair_source','Pasangan Tugasan Sumber','Pair Check',false,30,152,'Murid melaksanakan %1$s berdasarkan arahan sebenar pada {{page}}. Pasangan menyemak %2$s dan membetulkan satu bahagian jika perlu.'),
    ('core','game','source_match','Padanan Bahasa Arab','Matching Game',true,31,144,'Selepas tugasan asal selesai, kumpulan memadan bahan yang diambil daripada {{page}}. Setiap padanan disahkan semula melalui %2$s.'),
    ('core','sharing','round_robin','Kongsi Respons Bergilir','Round Robin',false,32,140,'Setiap ahli berkongsi satu hasil daripada tugasan %1$s pada {{page}}. Kumpulan menyemak %2$s dan merekod satu pembetulan.'),
    ('challenge','practice','independent_source','Tugasan Kendiri Berbukti','Word Hunt',false,40,150,'Murid melaksanakan %1$s pada {{page}} dengan minimum bimbingan, kemudian memilih dua bukti yang menunjukkan %2$s.'),
    ('challenge','game','source_challenge','Cabaran Bacaan dan Padanan','Team Challenge',true,41,144,'Kumpulan menyelesaikan cabaran menggunakan bahan daripada {{page}} dan menunjukkan ketepatan melalui %2$s tanpa menambah kandungan di luar sumber.'),
    ('challenge','evidence','explain_choice','Jelaskan Pilihan','Gallery Walk',false,42,140,'Murid mempamerkan hasil tugasan %1$s pada {{page}}, menerangkan satu pilihan atau pembetulan dan menyokongnya melalui %2$s.')
)
insert into public.rph_activity_library (
  activity_key,language_code,skill_key,phase,level_key,activity_name,
  activity_template,bbm_template,pak21,objective_keywords,source_keywords,
  year_min,year_max,is_game,priority,active,subject_key,pedagogy_key,
  activity_type,example_text,requires_source,selection_weight,subskill_key
)
select format('%s_%s',p.pattern_key,v.suffix),'ar','arabic_language',v.phase,v.level_key,
  format('%s: %s',p.pattern_name,v.row_name),format(v.template,p.source_focus,p.evidence),
  'Buku Teks',v.pak21,array[p.pattern_name,p.sk_codes]::text[],string_to_array(p.source_words,','),
  p.year_no,p.year_no,v.is_game,v.priority,true,'arabic_language','source_first_arabic_language',
  format('%s_%s',p.pattern_key,v.suffix),
  format('Gunakan hanya selepas tugasan sebenar Buku Teks Bahasa Arab Tahun %s halaman bercetak %s dikenal pasti dan disahkan.',p.year_no,p.printed_pages),
  true,v.weight,p.pattern_key
from patterns p cross join variants v
on conflict (activity_key) do update set
  activity_name=excluded.activity_name,activity_template=excluded.activity_template,
  bbm_template=excluded.bbm_template,pak21=excluded.pak21,
  objective_keywords=excluded.objective_keywords,source_keywords=excluded.source_keywords,
  activity_type=excluded.activity_type,example_text=excluded.example_text,
  requires_source=true,selection_weight=excluded.selection_weight,
  subskill_key=excluded.subskill_key,active=true;

with patterns(pattern_key,pattern_name,year_no,source_words,printed_pages,source_focus) as (
  values
    ('arabic_y1_alphabet','Huruf Hijaiyah Tahun 1',1,'huruf hijaiyah,huruf arab','4-32','bunyi, bentuk dan bacaan huruf hijaiyah'),
    ('arabic_y1_focused_letters','Huruf Fokus Tahun 1',1,'huruf fokus,suku kata','33-40','huruf atau suku kata fokus'),
    ('arabic_y1_greetings','Ucapan dan Sambutan',1,'ucapan,salam,تحيات','42-46','ucapan dan sambutan'),
    ('arabic_y1_numbers_1_10','Nombor 1 hingga 10',1,'nombor 1-10,أرقام','47-50','nombor 1 hingga 10'),
    ('arabic_y2_focused_letters','Huruf Fokus Tahun 2',2,'huruf fokus,suku kata','9-10,25-30,49-54,75-80','huruf atau suku kata fokus'),
    ('arabic_y2_acquaintance','Suai Kenal',2,'هيا نتعارف,suai kenal','9-24','kosa kata dan dialog suai kenal'),
    ('arabic_y2_family','Keluarga Saya',2,'أحب أسرتي,keluarga','25-48','kosa kata dan struktur keluarga'),
    ('arabic_y2_body','Anggota Badan',2,'جسمي السليم,anggota badan','49-74','kosa kata dan struktur anggota badan'),
    ('arabic_y2_school_tools','Alat Persekolahan',2,'alat persekolahan,الأدوات الدراسية','75-101','alat persekolahan, pemilikan dan lokasi'),
    ('arabic_y2_numbers_11_20','Nombor 11 hingga 20',2,'nombor 11-20,الأرقام','19-24,43-48,70-74,98-101','nombor 11 hingga 20'),
    ('arabic_y3_focused_letters','Huruf Fokus Tahun 3',3,'huruf fokus,suku kata','5-10,29-36,59-64,87-92','huruf atau suku kata fokus'),
    ('arabic_y3_classroom','Bilik Darjah',3,'تفضل إلى الفصل,bilik darjah','2-28','kosa kata dan struktur bilik darjah'),
    ('arabic_y3_clothes','Pakaian Cantik',3,'ملابسي الجميلة,pakaian','29-58','kosa kata dan struktur pakaian'),
    ('arabic_y3_colours','Warna di Sekeliling Kita',3,'الألوان حولنا,warna','59-86','kosa kata dan struktur warna'),
    ('arabic_y3_time','Masa Itu Emas',3,'الوقت كالذهب,masa,waktu','87-117','hari, waktu dan struktur masa'),
    ('arabic_y3_numbers_21_31','Nombor 21 hingga 31',3,'nombor 21-31,الأرقام','23-25,53-55,80-82,108-110','nombor 21 hingga 31')
), variants(suffix,induction_type,row_name,pak21,priority,template) as (
  values
    ('source_audio','oral','Dengar dan Teka','Listen-and-Repeat',20,'Guru memperdengarkan model ringkas daripada {{page}}. Murid menyatakan satu petunjuk tentang %1$s sebelum menyemak halaman sebenar.'),
    ('source_visual','visual','Lihat dan Padan','Pair Check',22,'Guru memaparkan bahan daripada {{page}}. Pasangan memadankan satu petunjuk dengan %1$s tanpa menambah bahan di luar halaman.'),
    ('source_recall','oral','Ingat dan Semak','Round Robin',24,'Murid berkongsi satu contoh ringkas tentang %1$s secara bergilir, kemudian menyemak ketepatan melalui {{page}}.')
)
insert into public.rph_induction_library (
  induction_key,subject_key,skill_key,language_code,induction_type,
  induction_name,induction_template,example_text,bbm_template,pak21,
  objective_keywords,source_keywords,year_min,year_max,priority,
  selection_weight,active,subskill_key
)
select format('%s_%s',p.pattern_key,v.suffix),'arabic_language','arabic_language','ar',v.induction_type,
  format('%s: %s',p.pattern_name,v.row_name),format(v.template,p.source_focus),
  format('Gunakan hanya petunjuk Buku Teks Bahasa Arab Tahun %s halaman bercetak %s; jangan mereka kandungan.',p.year_no,p.printed_pages),
  'Buku Teks',v.pak21,array[p.pattern_name]::text[],string_to_array(p.source_words,','),
  p.year_no,p.year_no,v.priority,138,true,p.pattern_key
from patterns p cross join variants v
on conflict (induction_key) do update set
  induction_name=excluded.induction_name,induction_template=excluded.induction_template,
  example_text=excluded.example_text,bbm_template=excluded.bbm_template,
  pak21=excluded.pak21,objective_keywords=excluded.objective_keywords,
  source_keywords=excluded.source_keywords,selection_weight=excluded.selection_weight,
  subskill_key=excluded.subskill_key,active=true;

insert into public.rph_subject_pedagogy (
  subject_key,subject_name,language_code,direction,pedagogy_notes,
  preferred_methods,preferred_bbm,active
)
values (
  'arabic_language','Bahasa Arab','ar','rtl',
  'RPT 2026 Kumpulan B menentukan minggu, unit dan SK/SP; DSKP mengesahkan standard; Buku Teks menentukan huruf, kosa kata, struktur, dialog, nombor, gambar dan hasil sebenar. Aktiviti perpustakaan hanya membungkus tugasan sumber yang sama untuk support, core dan challenge. Tulisan Arab kekal kanan-ke-kiri. Bahasa Arab kekal berasingan daripada Bahasa Melayu, Pendidikan Islam dan English. Lesson Map tidak boleh disahkan secara automatik apabila halaman atau tugasan sumber belum dikenal pasti.',
  array['Listen-and-Repeat','Pair Check','Matching Game','Round Robin','Show Me','Word Hunt','Gallery Walk'],
  array['Buku Teks'],true
)
on conflict (subject_key) do update set
  subject_name=excluded.subject_name,language_code=excluded.language_code,
  direction=excluded.direction,pedagogy_notes=excluded.pedagogy_notes,
  preferred_methods=excluded.preferred_methods,preferred_bbm=excluded.preferred_bbm,
  active=true;

-- Expected: 16 patterns x 9 activities = 144 activity rows.
-- Expected: 16 patterns x 3 inductions = 48 induction rows.
