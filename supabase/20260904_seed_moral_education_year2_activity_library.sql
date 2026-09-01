-- Pendidikan Moral Tahun 2: isolated source-first Activity + Induction Library.
-- RPT 2026 Kumpulan B supplies week/unit/SK-SP; DSKP verifies the three moral
-- domains; the printed textbook page and its real task remain the fixed anchor.

with patterns(
  pattern_key,pattern_name,unit_no,sk_name,sp_codes,source_words,
  printed_pages,source_focus,evidence
) as (
  values
    ('moral_y2_belief','Kepercayaan kepada Tuhan',1,'Kepatuhan kepada Ajaran Agama','1.1-1.5','ajaran agama,patuh,keluarga,kepercayaan','1-6','mengenal perlakuan patuh kepada ajaran agama dalam keluarga','sebab, perasaan dan perlakuan mematuhi ajaran agama'),
    ('moral_y2_kindness','Baik Hati',2,'Bantuan kepada Keluarga','2.1-2.5','baik hati,bantuan keluarga,sokongan moral,tenaga','7-12','mengenal jenis dan cara memberi bantuan ikhlas kepada keluarga','keperluan, sebab, perasaan dan tindakan membantu'),
    ('moral_y2_responsibility','Bertanggungjawab',3,'Tanggungjawab terhadap Keluarga','3.1-3.5','tanggungjawab keluarga,peranan,tugas,rumah','13-18','mengenal dan melaksanakan tanggungjawab terhadap keluarga','cara, kepentingan, perasaan dan bukti pelaksanaan tugas'),
    ('moral_y2_gratitude','Berterima Kasih',4,'Berterima Kasih terhadap Keluarga','4.1-4.5','terima kasih,keluarga,penghargaan,amalan mulia','19-24','mengenal cara penghargaan dan kesan mengabaikan amalan berterima kasih','kepentingan, kesan, perasaan dan tindakan menghargai'),
    ('moral_y2_courtesy','Hemah Tinggi',5,'Hemah Tinggi dalam Keluarga','5.1-5.5','hemah tinggi,keluarga,bersopan,beradab','25-32','membezakan pertuturan atau perlakuan hemah tinggi dalam keluarga','ungkapan, kesan, perasaan dan perlakuan beradab'),
    ('moral_y2_self_respect','Hormat',6,'Hormati Ahli Keluarga','6.1-6.5','hormati keluarga,ahli keluarga,hormat,hubungan','33-40','mengenal hubungan keluarga dan melaksanakan perlakuan hormat','cara, kepentingan, perasaan dan perlakuan hormat'),
    ('moral_y2_self_love','Kasih Sayang',7,'Sayangi Ahli Keluarga','7.1-7.5','keluarga bahagia,sayangi keluarga,kasih sayang,hubungan','41-48','mengenal ciri keluarga bahagia dan cara mengeratkan kasih sayang','kepentingan, akibat, perasaan dan tindakan menyayangi'),
    ('moral_y2_justice','Keadilan',8,'Bersikap Adil terhadap Keluarga','8.1-8.5','adil keluarga,keadilan,agihan,tugasan','49-56','menilai situasi adil atau tidak adil dalam keluarga','sebab, kesan, perasaan dan tindakan adil'),
    ('moral_y2_courage','Keberanian',9,'Berani Menjaga Nama Baik Keluarga','9.1-9.5','nama baik keluarga,berani,maruah,keberanian','57-64','mengenal cara menjaga nama baik keluarga melalui tindakan berani yang wajar','pilihan, kepentingan, perasaan dan tindakan selamat'),
    ('moral_y2_honesty','Kejujuran',10,'Jujur terhadap Ahli Keluarga','10.1-10.5','jujur keluarga,kejujuran,bercakap benar,amanah','65-72','menilai situasi jujur dan kesan ketidakjujuran terhadap keluarga','sebab, kesan, perasaan dan perlakuan jujur'),
    ('moral_y2_diligence','Kerajinan',11,'Rajin terhadap Ahli Keluarga','11.1-11.5','rajin keluarga,kerajinan,usaha,tugas','73-80','mengenal perlakuan rajin yang membantu ahli keluarga','usaha, hasil, perasaan dan amalan rajin'),
    ('moral_y2_cooperation','Kerjasama',12,'Kerjasama dalam Keluarga','12.1-12.5','kerjasama keluarga,bekerjasama,tugasan bersama,kumpulan','81-88','merancang dan melaksanakan tugasan bersama keluarga','peranan, sumbangan, perasaan dan hasil bersama'),
    ('moral_y2_moderation','Kesederhanaan',13,'Kesederhanaan dalam Keluarga','13.1-13.5','kesederhanaan keluarga,sederhana,tidak membazir,berhemah','89-96','mengenal cara dan kebaikan bersikap sederhana dalam keluarga','keperluan, akibat, perasaan dan perlakuan sederhana'),
    ('moral_y2_tolerance','Toleransi',14,'Toleransi terhadap Ahli Keluarga','14.1-14.5','toleransi keluarga,bertolak ansur,bersabar,mengawal diri','97-106','mengenal cara dan manfaat toleransi sesama ahli keluarga','sebab, kepentingan, perasaan dan perlakuan bertoleransi')
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
  2,2,v.is_game,v.priority,true,'moral_education','source_first_moral_education',
  format('%s_%s',p.pattern_key,v.suffix),
  format('Gunakan hanya selepas tugasan sebenar Buku Teks Pendidikan Moral Tahun 2 halaman bercetak %s dikenal pasti dan disahkan.',p.printed_pages),
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
    ('moral_y2_belief','Kepercayaan kepada Tuhan','ajaran agama,patuh','1-6','kepatuhan kepada ajaran agama dalam keluarga'),
    ('moral_y2_kindness','Baik Hati','baik hati,bantuan keluarga','7-12','bantuan ikhlas kepada keluarga'),
    ('moral_y2_responsibility','Bertanggungjawab','tanggungjawab keluarga,peranan','13-18','tanggungjawab terhadap keluarga'),
    ('moral_y2_gratitude','Berterima Kasih','terima kasih,penghargaan','19-24','penghargaan terhadap keluarga'),
    ('moral_y2_courtesy','Hemah Tinggi','hemah tinggi,bersopan','25-32','pertuturan dan perlakuan hemah tinggi'),
    ('moral_y2_self_respect','Hormat','hormati keluarga,ahli keluarga','33-40','hormat terhadap ahli keluarga'),
    ('moral_y2_self_love','Kasih Sayang','keluarga bahagia,kasih sayang','41-48','kasih sayang sesama ahli keluarga'),
    ('moral_y2_justice','Keadilan','adil keluarga,keadilan','49-56','perlakuan adil dalam keluarga'),
    ('moral_y2_courage','Keberanian','nama baik keluarga,berani','57-64','keberanian menjaga nama baik keluarga'),
    ('moral_y2_honesty','Kejujuran','jujur keluarga,kejujuran','65-72','perlakuan jujur terhadap keluarga'),
    ('moral_y2_diligence','Kerajinan','rajin keluarga,kerajinan','73-80','usaha dan kerajinan terhadap keluarga'),
    ('moral_y2_cooperation','Kerjasama','kerjasama keluarga,bekerjasama','81-88','tugasan bersama keluarga'),
    ('moral_y2_moderation','Kesederhanaan','sederhana keluarga,tidak membazir','89-96','perlakuan sederhana dalam keluarga'),
    ('moral_y2_tolerance','Toleransi','toleransi keluarga,bertolak ansur','97-106','toleransi sesama ahli keluarga')
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
  format('Gunakan hanya petunjuk Buku Teks Pendidikan Moral Tahun 2 halaman bercetak %s; jangan mereka pengalaman peribadi murid.',p.printed_pages),
  'Buku Teks',v.pak21,array[p.pattern_name]::text[],string_to_array(p.source_words,','),
  2,2,v.priority,138,true,p.pattern_key
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
  'RPT 2026 Kumpulan B menentukan minggu, unit dan SK/SP; DSKP mengesahkan standard serta tiga domain moral; Buku Teks menentukan situasi, soalan, bahan dan hasil sebenar. Activity Library hanya membungkus tugasan sumber yang sama untuk support, core dan challenge. Pendidikan Moral Tahun 1 hingga Tahun 3 kekal berasingan daripada Pendidikan Islam dan mata pelajaran bahasa. Lesson Map tidak boleh disahkan secara automatik apabila halaman atau tugasan sumber belum dikenal pasti.',
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
