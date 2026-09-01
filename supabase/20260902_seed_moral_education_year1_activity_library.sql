-- Pendidikan Moral Tahun 1: isolated source-first Activity + Induction Library.
-- RPT 2026 Kumpulan B supplies week/unit/SK-SP; DSKP verifies the three moral
-- domains; the printed textbook page and its real task remain the fixed anchor.

with patterns(
  pattern_key,pattern_name,unit_no,sk_name,sp_codes,source_words,
  printed_pages,source_focus,evidence
) as (
  values
    ('moral_y1_belief','Kepercayaan kepada Tuhan',1,'Agama atau Kepercayaan Saya','1.1-1.5','pegangan hidup,agama,kepercayaan,ciptaan Tuhan,syukur','1-5','meneliti situasi, menyatakan pegangan, mengenal ciptaan dan menzahirkan rasa syukur','sebab, perasaan dan perlakuan yang menghormati agama atau kepercayaan'),
    ('moral_y1_kindness','Baik Hati',2,'Bantuan Secara Ikhlas','2.1-2.5','baik hati,bantuan ikhlas,membantu,sokongan moral','6-10','mengenal sifat baik hati, mencadangkan bantuan dan melaksanakan tugasan bantuan pada halaman sumber','sebab membantu, perasaan penerima/pemberi dan tindakan yang sesuai'),
    ('moral_y1_responsibility','Bertanggungjawab',3,'Tanggungjawab Diri','3.1-3.5','tanggungjawab diri,tugas,kebersihan,kekemasan','11-15','menyenaraikan tanggungjawab, menerangkan kepentingan dan melengkapkan bukti pelaksanaan','pilihan, akibat, rasa bangga dan perlakuan bertanggungjawab'),
    ('moral_y1_gratitude','Berterima Kasih',4,'Sikap Berterima Kasih','4.1-4.5','terima kasih,penghargaan,cenderahati,kad ucapan','16-20','mengenal cara penghargaan, menggunakan ucapan dan melaksanakan tugasan tanda terima kasih','kesesuaian ucapan, sebab, perasaan dan tindakan menghargai'),
    ('moral_y1_courtesy','Hemah Tinggi',5,'Bersopan dalam Tutur Kata dan Tingkah Laku','5.1-5.5','budi bahasa,bersopan,tutur kata,tingkah laku,hemah tinggi','21-25','membezakan pertuturan atau tingkah laku sopan dan melaksanakan tugasan komunikasi beradab','ungkapan, kesan, emosi dan perlakuan sopan'),
    ('moral_y1_self_respect','Hormat',6,'Hormati Diri','6.1-6.5','hormati diri,menghormati diri,maruah diri','26-30','mengenal cara menghormati diri, membandingkan pilihan dan melaksanakan tugasan penjagaan maruah','faedah, perasaan dan tindakan menghormati diri'),
    ('moral_y1_self_love','Kasih Sayang',7,'Sayangi Diri','7.1-7.5','sayangi diri,kebersihan diri,keselamatan diri,kasih sayang','31-35','mengenal amalan kebersihan dan keselamatan diri serta melaksanakan tugasan penjagaan diri','kesan, sebab, emosi dan amalan selamat pada situasi sumber'),
    ('moral_y1_justice','Keadilan',8,'Adil dalam Perlakuan Seharian','8.1-8.5','adil,keadilan,agihan,tugasan kelas','36-40','menilai situasi adil atau tidak adil dan melaksanakan tugasan pengagihan pada halaman sumber','sebab, kesan ketidakadilan, perasaan dan tindakan adil'),
    ('moral_y1_courage','Keberanian',9,'Berani Mempertahankan Maruah Diri','9.1-9.5','berani,keberanian,maruah diri,tidak melulu','41-45','mengenal perlakuan berani yang berfikir dahulu dan melaksanakan tugasan situasi sumber','risiko, akibat, emosi dan tindakan mempertahankan maruah diri secara selamat'),
    ('moral_y1_honesty','Kejujuran',10,'Jujur dalam Kehidupan Seharian','10.1-10.5','jujur,kejujuran,bercakap benar,amanah','46-50','menilai situasi jujur, menghuraikan sebab dan melaksanakan tugasan pilihan bermoral','sebab, akibat, perasaan dan perlakuan jujur'),
    ('moral_y1_diligence','Kerajinan',11,'Rajin dalam Perlakuan Harian','11.1-11.5','rajin,kerajinan,usaha,tugas harian','51-56','mengenal ciri rajin, menerangkan kebaikan dan melaksanakan tugasan usaha berterusan','usaha, hasil, perasaan dan amalan rajin'),
    ('moral_y1_cooperation','Kerjasama',12,'Kerjasama dalam Kehidupan Seharian','12.1-12.5','kerjasama,bekerjasama,aktiviti bersama,kumpulan','57-62','merancang dan melaksanakan tugasan bersama berdasarkan arahan halaman sumber','peranan, sumbangan, perasaan dan hasil bersama'),
    ('moral_y1_moderation','Kesederhanaan',13,'Kesederhanaan dalam Diri','13.1-13.5','kesederhanaan,sederhana,tidak keterlaluan,pembaziran','63-68','membandingkan sikap sederhana dengan keterlaluan dan melaksanakan tugasan penggunaan berhemah','keperluan, akibat, perasaan dan perlakuan sederhana'),
    ('moral_y1_tolerance','Toleransi',14,'Toleransi dalam Kehidupan Seharian','14.1-14.5','toleransi,bertolak ansur,bersabar,mengawal diri','69-74','mengenal cara bertoleransi dan melaksanakan tugasan giliran atau persetujuan pada halaman sumber','sebab, perasaan, kawalan diri dan perlakuan bertolak ansur')
), variants(level_key,phase,suffix,row_name,pak21,is_game,priority,weight,template) as (
  values
    ('support','input','notice_source','Lihat dan Kenal Petunjuk','Think-Pair-Share',false,20,142,'Guru membimbing murid meneliti bahagian terpilih pada {{page}}. Murid mengenal satu petunjuk bagi %1$s dan memadankannya dengan contoh pada halaman yang sama.'),
    ('support','guided','guided_reason','Fikir-Perasaan-Tindakan Berpandu','Show Me',false,21,150,'Dengan bimbingan, murid melaksanakan %1$s pada {{page}} mengikut tugasan asal. Guru menyoal sebab, perasaan dan tindakan; semakan menumpukan %2$s.'),
    ('support','evidence','show_evidence','Tunjuk Satu Bukti Moral','Pair Check',false,22,138,'Selepas tugasan asal pada {{page}}, murid menunjukkan satu bukti daripada situasi yang sama dan menerangkan %2$s menggunakan ayat mudah.'),
    ('core','practice','pair_reason','Pasangan Penaakulan Moral','Think-Pair-Share',false,30,152,'Murid melaksanakan %1$s berdasarkan arahan sebenar pada {{page}}. Pasangan membandingkan sebab, emosi dan perlakuan melalui %2$s.'),
    ('core','game','source_sort','Padanan Situasi dan Nilai','Matching Game',true,31,144,'Selepas tugasan asal selesai, kumpulan memadan situasi atau respons yang diambil daripada {{page}}. Setiap padanan disahkan semula melalui %2$s.'),
    ('core','sharing','round_robin','Kongsi Pilihan Bermoral','Round Robin',false,32,140,'Setiap ahli berkongsi satu respons bagi %1$s pada {{page}}. Kumpulan menyemak %2$s dan merekod satu pembetulan.'),
    ('challenge','practice','independent_reason','Tugasan Kendiri Bersebab','Think-Pair-Share',false,40,150,'Murid melaksanakan %1$s pada {{page}} dengan minimum bimbingan, kemudian memilih dua bukti yang menunjukkan %2$s.'),
    ('challenge','roleplay','source_roleplay','Lakon dan Nilai Pilihan','Role Play',true,41,144,'Kumpulan melakonkan semula situasi daripada {{page}} selepas tugasan asal selesai, kemudian menilai pilihan melalui %2$s tanpa menambah konteks di luar sumber.'),
    ('challenge','evidence','explain_choice','Jelaskan Pilihan dan Akibat','Gallery Walk',false,42,140,'Murid mempamerkan hasil %1$s pada {{page}}, menerangkan satu pilihan, emosi dan akibat serta menyokongnya melalui %2$s.')
)
insert into public.rph_activity_library (
  activity_key,language_code,skill_key,phase,level_key,activity_name,
  activity_template,bbm_template,pak21,objective_keywords,source_keywords,
  year_min,year_max,is_game,priority,active,subject_key,pedagogy_key,
  activity_type,example_text,requires_source,selection_weight,subskill_key
)
select format('%s_%s',p.pattern_key,v.suffix),'ms','moral_education',v.phase,v.level_key,
  format('%s: %s',p.pattern_name,v.row_name),format(v.template,p.source_focus,p.evidence),
  'Buku Teks',v.pak21,array[p.pattern_name,p.sk_name,p.sp_codes]::text[],string_to_array(p.source_words,','),
  1,1,v.is_game,v.priority,true,'moral_education','source_first_moral_education',
  format('%s_%s',p.pattern_key,v.suffix),
  format('Gunakan hanya selepas tugasan sebenar Buku Teks Pendidikan Moral Tahun 1 halaman bercetak %s dikenal pasti dan disahkan.',p.printed_pages),
  true,v.weight,p.pattern_key
from patterns p cross join variants v
on conflict (activity_key) do update set
  activity_name=excluded.activity_name,activity_template=excluded.activity_template,
  bbm_template=excluded.bbm_template,pak21=excluded.pak21,
  objective_keywords=excluded.objective_keywords,source_keywords=excluded.source_keywords,
  activity_type=excluded.activity_type,example_text=excluded.example_text,
  requires_source=true,selection_weight=excluded.selection_weight,
  subskill_key=excluded.subskill_key,active=true;

with patterns(pattern_key,pattern_name,source_words,printed_pages,source_focus) as (
  values
    ('moral_y1_belief','Kepercayaan kepada Tuhan','pegangan hidup,agama,kepercayaan','1-5','agama atau kepercayaan dan rasa syukur'),
    ('moral_y1_kindness','Baik Hati','baik hati,bantuan ikhlas','6-10','bantuan ikhlas'),
    ('moral_y1_responsibility','Bertanggungjawab','tanggungjawab diri,tugas','11-15','tanggungjawab diri'),
    ('moral_y1_gratitude','Berterima Kasih','terima kasih,penghargaan','16-20','penghargaan'),
    ('moral_y1_courtesy','Hemah Tinggi','budi bahasa,bersopan','21-25','tutur kata dan tingkah laku sopan'),
    ('moral_y1_self_respect','Hormat','hormati diri,maruah diri','26-30','hormat terhadap diri'),
    ('moral_y1_self_love','Kasih Sayang','sayangi diri,kebersihan diri','31-35','kebersihan dan keselamatan diri'),
    ('moral_y1_justice','Keadilan','adil,keadilan','36-40','perlakuan adil'),
    ('moral_y1_courage','Keberanian','berani,maruah diri','41-45','keberanian yang berfikir dahulu'),
    ('moral_y1_honesty','Kejujuran','jujur,kejujuran','46-50','perlakuan jujur'),
    ('moral_y1_diligence','Kerajinan','rajin,kerajinan','51-56','usaha dan kerajinan'),
    ('moral_y1_cooperation','Kerjasama','kerjasama,bekerjasama','57-62','aktiviti bersama'),
    ('moral_y1_moderation','Kesederhanaan','sederhana,tidak keterlaluan','63-68','perlakuan sederhana'),
    ('moral_y1_tolerance','Toleransi','toleransi,bertolak ansur','69-74','sabar dan bertolak ansur')
), variants(suffix,induction_type,row_name,pak21,priority,template) as (
  values
    ('source_visual','visual','Lihat dan Pilih','Think-Pair-Share',20,'Guru memaparkan situasi ringkas daripada {{page}}. Murid memilih satu petunjuk tentang %1$s dan menyatakan sebab awal.'),
    ('source_emotion','oral','Namakan Perasaan','Round Robin',22,'Guru merujuk watak atau situasi pada {{page}}. Murid menamakan satu perasaan yang berkaitan dengan %1$s sebelum menyemak halaman sebenar.'),
    ('source_choice','oral','Pilih dan Semak','Show Me',24,'Murid memilih satu daripada dua respons ringkas tentang %1$s, kemudian menyemak ketepatan melalui {{page}}.')
)
insert into public.rph_induction_library (
  induction_key,subject_key,skill_key,language_code,induction_type,
  induction_name,induction_template,example_text,bbm_template,pak21,
  objective_keywords,source_keywords,year_min,year_max,priority,
  selection_weight,active,subskill_key
)
select format('%s_%s',p.pattern_key,v.suffix),'moral_education','moral_education','ms',v.induction_type,
  format('%s: %s',p.pattern_name,v.row_name),format(v.template,p.source_focus),
  format('Gunakan hanya petunjuk Buku Teks Pendidikan Moral Tahun 1 halaman bercetak %s; jangan mereka situasi peribadi murid.',p.printed_pages),
  'Buku Teks',v.pak21,array[p.pattern_name]::text[],string_to_array(p.source_words,','),
  1,1,v.priority,138,true,p.pattern_key
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
  'moral_education','Pendidikan Moral','ms','ltr',
  'RPT 2026 Kumpulan B menentukan minggu, unit dan SK/SP; DSKP mengesahkan standard serta tiga domain moral; Buku Teks menentukan situasi, soalan, bahan dan hasil sebenar. Activity Library hanya membungkus tugasan sumber yang sama untuk support, core dan challenge. Pendidikan Moral kekal berasingan daripada Pendidikan Islam dan mata pelajaran bahasa. Lesson Map tidak boleh disahkan secara automatik apabila halaman atau tugasan sumber belum dikenal pasti.',
  array['Think-Pair-Share','Pair Check','Matching Game','Round Robin','Show Me','Role Play','Gallery Walk'],
  array['Buku Teks'],true
)
on conflict (subject_key) do update set
  subject_name=excluded.subject_name,language_code=excluded.language_code,
  direction=excluded.direction,pedagogy_notes=excluded.pedagogy_notes,
  preferred_methods=excluded.preferred_methods,preferred_bbm=excluded.preferred_bbm,
  active=true;

-- Expected: 14 patterns x 9 activities = 126 activity rows.
-- Expected: 14 patterns x 3 inductions = 42 induction rows.
