-- RPH Hub: Science Year 1-3 source-first Activity + Induction Library.
-- Safe to run more than once. It does not create Lesson Maps or source tasks.
-- Each template wraps {{source_activity}}, which must be an approved textbook task.

with patterns(pattern_key, pattern_name, source_words) as (
  values
    ('observe','Pemerhatian','memerhati,pemerhatian'),
    ('identify','Mengenal pasti','mengenal pasti,kenal pasti'),
    ('classify','Pengelasan','mengelaskan,kelaskan'),
    ('compare','Perbandingan','bandingkan,membandingkan'),
    ('sequence','Urutan','susun urutan,urutan'),
    ('measure','Pengukuran','ukur,sukat,mengukur'),
    ('record_data','Rekod data','rekodkan,catat data'),
    ('represent_data','Perwakilan data','graf,piktograf,jadual'),
    ('investigate','Penyiasatan','penyiasatan,menyiasat'),
    ('test_material','Uji bahan','uji bahan,uji objek'),
    ('compare_conditions','Banding keadaan','banding keadaan,banding kondisi'),
    ('infer','Inferens','inferens,kesimpulan'),
    ('predict','Ramalan','ramal,meramal'),
    ('cause_effect','Sebab dan akibat','sebab dan akibat,punca dan kesan'),
    ('draw_label','Lukis dan label','lukis label,melukis label'),
    ('build_model','Bina model','bina model,hasilkan model'),
    ('design_create','Reka dan cipta','mencipta,hasilkan produk'),
    ('communicate','Komunikasi dapatan','kongsi,bentang,persembah'),
    ('problem_solve','Penyelesaian masalah','selesaikan masalah,mengasingkan'),
    ('review_game','Ulang kaji','kuiz,ulang kaji,permainan')
), years(year_no, year_note) as (
  values
    (1,'Gunakan bahan visual atau maujud, arahan satu demi satu dan respons ringkas.'),
    (2,'Gunakan pasangan atau kumpulan kecil serta jadual atau senarai semak apabila sesuai.'),
    (3,'Murid merujuk hasil, ukuran atau data sebenar dan menerangkan sebab berdasarkan bukti.')
), activity_rows(level_key, phase, activity_type, activity_name, pak21, template) as (
  values
    ('support','input','source_preview','Lihat Bukti Sumber','Think-Pair-Share','Guru memaparkan bahagian sumber pada {{page}}. Murid meneliti bahan yang berkaitan dengan tugasan sebenar “{{source_activity}}”.'),
    ('support','guided','guided_same_task','Langkah Demi Langkah','Pair Check','Dengan bimbingan guru, murid melaksanakan tugasan sebenar “{{source_activity}}” secara berperingkat. {{year_note}}'),
    ('support','evidence','guided_evidence','Sebut Bukti','Round Robin','Murid menunjukkan atau menyebut satu pemerhatian, jawapan atau hasil daripada tugasan sama “{{source_activity}}” sebelum menyemak dengan rakan.'),
    ('core','practice','independent_same_task','Tugasan Sumber','Think-Pair-Share','Murid melaksanakan tugasan Buku Teks “{{source_activity}}” seperti arahan pada {{page}}, kemudian merekod atau menyemak hasil sendiri dan bersama pasangan.'),
    ('core','game','source_evidence_game','Kad Bukti Mini','Quiz-Quiz-Trade','Selepas melaksanakan “{{source_activity}}”, murid menggunakan kad yang mengandungi bukti, jawapan atau pemerhatian daripada tugasan yang sama untuk memadan dan menerangkan pilihan.'),
    ('core','sharing','peer_evidence_share','Kongsi Dapatan','Gallery Walk','Murid berkongsi hasil tugasan sebenar “{{source_activity}}” dan memberi maklum balas berdasarkan bukti pada sumber.'),
    ('challenge','practice','independent_reasoning','Bukti dan Sebab','Evidence Hunt','Murid melaksanakan tugasan sebenar “{{source_activity}}” dengan minimum bimbingan, kemudian memilih bukti daripada hasil sendiri untuk menyokong jawapan.'),
    ('challenge','game','evidence_reasoning_game','Relay Bukti Mini','Round Robin','Selepas tugasan “{{source_activity}}” siap, murid menjalankan relay ringkas menggunakan hasil tugasan yang sama: pilih bukti, nyatakan sebab dan semak dengan kumpulan.'),
    ('challenge','evidence','justify_evidence','Jelaskan Dapatan','Gallery Walk','Murid menerangkan atau menjustifikasikan dapatan daripada tugasan sama “{{source_activity}}” tanpa menukar bahan, penyiasatan atau Standard Pembelajaran.')
)
insert into public.rph_activity_library (
  activity_key, language_code, skill_key, phase, level_key, activity_name,
  activity_template, bbm_template, pak21, objective_keywords, source_keywords,
  year_min, year_max, is_game, priority, active, subject_key, pedagogy_key,
  activity_type, example_text, requires_source, selection_weight, subskill_key
)
select
  format('science_y%s_%s_%s_%s', y.year_no, p.pattern_key, a.level_key, a.phase),
  'ms', 'science', a.phase, a.level_key,
  format('%s: %s', p.pattern_name, a.activity_name),
  replace(a.template, '{{year_note}}', y.year_note),
  'Buku Teks {{page}}; bahan sebenar tugasan; kad bukti atau jadual jika diperlukan',
  a.pak21,
  array[p.pattern_name],
  string_to_array(p.source_words, ','),
  y.year_no, y.year_no, a.phase = 'game',
  case a.level_key when 'support' then 20 when 'core' then 30 else 40 end,
  true, 'science', 'source_first_science', a.activity_type,
  'Aktiviti ini hanya digunakan selepas tugasan Buku Teks yang sama dilaksanakan.',
  true, case a.phase when 'game' then 105 else 120 end, p.pattern_key
from patterns p cross join years y cross join activity_rows a
where not exists (
  select 1 from public.rph_activity_library x
  where x.activity_key = format('science_y%s_%s_%s_%s', y.year_no, p.pattern_key, a.level_key, a.phase)
);

with patterns(pattern_key, pattern_name) as (
  values
    ('observe','Pemerhatian'),('identify','Mengenal pasti'),('classify','Pengelasan'),('compare','Perbandingan'),('sequence','Urutan'),('measure','Pengukuran'),('record_data','Rekod data'),('represent_data','Perwakilan data'),('investigate','Penyiasatan'),('test_material','Uji bahan'),('compare_conditions','Banding keadaan'),('infer','Inferens'),('predict','Ramalan'),('cause_effect','Sebab dan akibat'),('draw_label','Lukis dan label'),('build_model','Bina model'),('design_create','Reka dan cipta'),('communicate','Komunikasi dapatan'),('problem_solve','Penyelesaian masalah'),('review_game','Ulang kaji')
), years(year_no, year_note) as (
  values (1,'Murid memberikan respons melalui gambar, bahan maujud atau satu perkataan.'),(2,'Murid berbincang secara berpasangan sebelum berkongsi respons.'),(3,'Murid menyatakan jangkaan atau sebab ringkas berdasarkan bukti sumber.')
)
insert into public.rph_induction_library (
  induction_key, subject_key, skill_key, language_code, induction_type, induction_name,
  induction_template, example_text, bbm_template, pak21, objective_keywords,
  source_keywords, year_min, year_max, priority, selection_weight, active, subskill_key
)
select
  format('science_y%s_%s_source_clue', y.year_no, p.pattern_key),
  'science', 'science', 'ms', 'visual', format('%s: Petunjuk Sumber', p.pattern_name),
  format('Guru memaparkan satu gambar, alat, hasil atau petunjuk daripada halaman {{page}} tanpa menerangkan jawapan. %s Guru mengaitkan respons murid dengan tugasan Buku Teks yang akan dilaksanakan.', y.year_note),
  'Gunakan hanya visual atau bahan yang benar-benar terdapat pada halaman sumber.',
  'Buku Teks {{page}}; bahan atau gambar daripada sumber', 'Think-Pair-Share',
  array[p.pattern_name], array[p.pattern_key],
  y.year_no, y.year_no, 20, 120, true, p.pattern_key
from patterns p cross join years y
where not exists (
  select 1 from public.rph_induction_library x
  where x.induction_key = format('science_y%s_%s_source_clue', y.year_no, p.pattern_key)
);

insert into public.rph_subject_pedagogy (
  subject_key, subject_name, language_code, direction, pedagogy_notes,
  preferred_methods, preferred_bbm, active
)
select
  'science', 'Sains', 'ms', 'ltr',
  'Utamakan source-first: RPT menentukan sesi, DSKP mengesahkan SK/SP dan Buku Teks menentukan tugasan sebenar. PdP terbeza menggunakan tugasan sama; support menerima scaffolding, core melaksanakan arahan asal dan challenge menerangkan atau menjustifikasikan bukti. Permainan mini hanya berlaku selepas atau bersama tugasan sumber, bukan menggantikannya.',
  array['Think-Pair-Share','Pair Check','Evidence Hunt','Round Robin','Gallery Walk','Quiz-Quiz-Trade'],
  array['buku teks','bahan sebenar tugasan','gambar','kad bukti','jadual pemerhatian','alat dan bahan sains'],
  true
where not exists (select 1 from public.rph_subject_pedagogy where subject_key = 'science');
