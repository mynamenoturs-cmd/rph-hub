-- Pendidikan Moral Tahun 3: isolated source-first Activity + Induction Library.
-- RPT 2026 Kumpulan B supplies week/unit/SK-SP; DSKP verifies the three moral
-- domains; the printed textbook page and its real task remain the fixed anchor.

with patterns(
  pattern_key,pattern_name,unit_no,sk_name,sp_codes,source_words,
  printed_pages,source_focus,evidence
) as (
  values
    ('moral_y3_belief','Kepercayaan kepada Tuhan',1,'Kepelbagaian Perayaan Warga Sekolah','1.1-1.5','perayaan warga sekolah,kepelbagaian perayaan,kepercayaan,amalan perayaan','1-8','mengenal perayaan dan amalan warga sekolah serta mengurus kepelbagaian dengan hormat','sebab, perasaan dan perlakuan menghormati perayaan atau kepercayaan'),
    ('moral_y3_kindness','Baik Hati',2,'Bantuan kepada Warga Sekolah','2.1-2.5','baik hati,bantuan warga sekolah,sokongan moral,tenaga','9-16','mengenal jenis dan cara bantuan ikhlas kepada warga sekolah','keperluan, sebab, perasaan dan tindakan membantu'),
    ('moral_y3_responsibility','Bertanggungjawab',3,'Tanggungjawab di Sekolah','3.1-3.5','tanggungjawab sekolah,peranan,tugas,senarai semak','17-24','mengenal peranan dan melaksanakan tanggungjawab di sekolah','cara, kepentingan, perasaan dan bukti pelaksanaan tugas'),
    ('moral_y3_gratitude','Berterima Kasih',4,'Amalan Berterima Kasih terhadap Warga Sekolah','4.1-4.5','berterima kasih,warga sekolah,penghargaan,amalan mulia','25-32','mengenal cara penghargaan dan menilai kesan mengabaikan amalan berterima kasih','kepentingan, kesan, perasaan dan tindakan menghargai'),
    ('moral_y3_courtesy','Hemah Tinggi',5,'Bersopan dan Berbudi Pekerti Mulia terhadap Warga Sekolah','5.1-5.5','beradab sopan,pekerti terpuji,bersopan,warga sekolah','33-40','membezakan pertuturan atau perlakuan sopan dalam konteks warga sekolah','ungkapan, kesan, perasaan dan perlakuan beradab'),
    ('moral_y3_self_respect','Hormat',6,'Hormati Warga Sekolah dan Pelawat','6.1-6.5','hormati warga sekolah,pelawat,hormat,hubungan','41-48','mengenal warga sekolah atau pelawat dan melaksanakan tugasan menghormati mereka','cara, kepentingan, perasaan dan perlakuan hormat'),
    ('moral_y3_self_love','Kasih Sayang',7,'Sayangi Sekolah dan Warga Sekolah','7.1-7.5','sekolah kebanggaanku,sayangi sekolah,warga sekolah,kasih sayang','49-56','mengenal cara menyayangi sekolah dan warga sekolah serta menilai kesannya','kepentingan, akibat, perasaan dan tindakan menjaga sekolah'),
    ('moral_y3_justice','Keadilan',8,'Bersikap Adil Sesama Warga Sekolah','8.1-8.5','adil warga sekolah,keadilan,agihan,tugasan','57-64','menilai situasi adil atau tidak adil sesama warga sekolah','sebab, kesan, perasaan dan tindakan adil'),
    ('moral_y3_courage','Keberanian',9,'Berani Menghadapi Cabaran di Sekolah','9.1-9.5','hadapi cabaran,berani,sekolah,keberanian','65-72','mengenal cabaran sekolah dan memilih tindakan berani yang wajar','pilihan, kepentingan, perasaan dan tindakan selamat'),
    ('moral_y3_honesty','Kejujuran',10,'Jujur terhadap Warga Sekolah','10.1-10.5','jujur warga sekolah,kejujuran,bercakap benar,amanah','73-80','menilai situasi jujur dan kesan ketidakjujuran terhadap warga sekolah','sebab, kesan, perasaan dan perlakuan jujur'),
    ('moral_y3_diligence','Kerajinan',11,'Bersikap Rajin di Sekolah','11.1-11.5','rajin di sekolah,kerajinan,usaha,tugas','81-88','mengenal perlakuan rajin dan akibat tidak rajin di sekolah','usaha, hasil, perasaan dan amalan rajin'),
    ('moral_y3_cooperation','Kerjasama',12,'Kerjasama dengan Warga Sekolah','12.1-12.5','kerjasama warga sekolah,bekerjasama,aktiviti bersama,kumpulan','89-96','merancang dan melaksanakan tugasan bersama warga sekolah','peranan, sumbangan, perasaan dan hasil bersama'),
    ('moral_y3_moderation','Kesederhanaan',13,'Kesederhanaan di Sekolah','13.1-13.5','kesederhanaan sekolah,sederhana,tidak keterlaluan,berhemah','97-104','mengenal cara dan kebaikan bersikap sederhana di sekolah','keperluan, akibat, perasaan dan perlakuan sederhana'),
    ('moral_y3_tolerance','Toleransi',14,'Toleransi Sesama Warga Sekolah','14.1-14.5','toleransi warga sekolah,bertolak ansur,bersabar,mengawal diri','105-112','mengenal ciri dan contoh toleransi sesama warga sekolah','sebab, kepentingan, perasaan dan perlakuan bertoleransi')
), variants(level_key,phase,suffix,row_name,pak21,is_game,priority,weight,template) as (
  values
    ('support','input','notice_source','Lihat dan Kenal Petunjuk','Think-Pair-Share',false,20,142,'Guru membimbing murid meneliti bahagian terpilih pada {{page}}. Murid mengenal satu petunjuk bagi %1$s dan memadankannya dengan situasi pada halaman yang sama.'),
    ('support','guided','guided_reason','Sebab-Perasaan-Tindakan Berpandu','Show Me',false,21,150,'Dengan bimbingan, murid melaksanakan %1$s pada {{page}} mengikut tugasan asal. Guru menyoal sebab, perasaan dan tindakan; semakan menumpukan %2$s.'),
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
  3,3,v.is_game,v.priority,true,'moral_education','source_first_moral_education',
  format('%s_%s',p.pattern_key,v.suffix),
  format('Gunakan hanya selepas tugasan sebenar Buku Teks Pendidikan Moral Tahun 3 halaman bercetak %s dikenal pasti dan disahkan.',p.printed_pages),
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
    ('moral_y3_belief','Kepercayaan kepada Tuhan','perayaan,kepercayaan','1-8','kepelbagaian perayaan warga sekolah'),
    ('moral_y3_kindness','Baik Hati','baik hati,bantuan warga sekolah','9-16','bantuan ikhlas kepada warga sekolah'),
    ('moral_y3_responsibility','Bertanggungjawab','tanggungjawab sekolah,peranan','17-24','tanggungjawab di sekolah'),
    ('moral_y3_gratitude','Berterima Kasih','berterima kasih,penghargaan','25-32','penghargaan terhadap warga sekolah'),
    ('moral_y3_courtesy','Hemah Tinggi','beradab sopan,pekerti','33-40','pertuturan dan perlakuan sopan'),
    ('moral_y3_self_respect','Hormat','hormati warga sekolah,pelawat','41-48','hormat terhadap warga sekolah dan pelawat'),
    ('moral_y3_self_love','Kasih Sayang','sayangi sekolah,warga sekolah','49-56','kasih sayang terhadap sekolah'),
    ('moral_y3_justice','Keadilan','adil warga sekolah,keadilan','57-64','perlakuan adil sesama warga sekolah'),
    ('moral_y3_courage','Keberanian','hadapi cabaran,berani','65-72','keberanian menghadapi cabaran sekolah'),
    ('moral_y3_honesty','Kejujuran','jujur warga sekolah,kejujuran','73-80','perlakuan jujur terhadap warga sekolah'),
    ('moral_y3_diligence','Kerajinan','rajin di sekolah,kerajinan','81-88','usaha dan kerajinan di sekolah'),
    ('moral_y3_cooperation','Kerjasama','kerjasama warga sekolah,bekerjasama','89-96','aktiviti bersama warga sekolah'),
    ('moral_y3_moderation','Kesederhanaan','sederhana di sekolah,tidak keterlaluan','97-104','perlakuan sederhana di sekolah'),
    ('moral_y3_tolerance','Toleransi','toleransi warga sekolah,bertolak ansur','105-112','toleransi sesama warga sekolah')
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
  format('Gunakan hanya petunjuk Buku Teks Pendidikan Moral Tahun 3 halaman bercetak %s; jangan mereka pengalaman peribadi murid.',p.printed_pages),
  'Buku Teks',v.pak21,array[p.pattern_name]::text[],string_to_array(p.source_words,','),
  3,3,v.priority,138,true,p.pattern_key
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
