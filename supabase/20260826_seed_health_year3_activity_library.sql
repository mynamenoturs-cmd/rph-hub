-- RPH Hub: Pendidikan Kesihatan Tahun 3 source-first Activity + Induction Library.
-- Idempotent: existing keys are updated, not duplicated.
-- Library rows wrap a verified RPT/DSKP/textbook task; they never replace it.

with patterns(
  pattern_key, pattern_name, source_words, source_task,
  game_name, game_rule, evidence, bbm
) as (
  values
    ('personal_boundaries','Kehormatan dan Privasi Diri',
      'anggota seksual,kehormatan diri,kehormatan anggota,sentuhan selamat,sentuhan tidak selamat,peraturan sentuhan',
      'meneliti rajah dan arahan Buku Teks, mengenal pasti peraturan menjaga privasi anggota seksual serta memilih tindakan berkata TIDAK, beredar dan memberitahu orang dewasa yang dipercayai',
      'Laluan Tindakan Selamat',
      'Kumpulan membaca kad situasi rekaan, memilih kad “Katakan TIDAK”, “Beredar” atau “Beritahu orang dewasa dipercayai”, kemudian meletakkannya mengikut urutan tindakan yang selamat. Murid tidak diminta menceritakan pengalaman sendiri.',
      'pilihan tindakan yang betul, alasan menjaga privasi dan urutan mendapatkan bantuan',
      'Buku Teks, kad situasi rekaan, kad tindakan selamat, papan urutan, kad respons peribadi'),
    ('family_boundaries','Batas Selamat dalam Keluarga',
      'batas sentuhan,sentuhan dalam keluarga,perhubungan kekeluargaan,keluarga selamat',
      'mengelaskan situasi rekaan kepada sentuhan selamat atau tidak selamat dan memilih tindakan berkata TIDAK, menjauhkan diri serta memberitahu orang dewasa yang dipercayai',
      'Isyarat Selamat',
      'Guru membacakan situasi keluarga rekaan. Kumpulan mengangkat kad hijau bagi situasi selamat atau kad merah bagi situasi yang mesti dihentikan, kemudian menyatakan tindakan perlindungan tanpa melakonkan sentuhan dan tanpa pendedahan peribadi.',
      'pengelasan situasi, penggunaan ayat tegas dan pemilihan orang dewasa yang dipercayai',
      'Buku Teks, kad situasi rekaan, kad hijau-merah, kad ayat tegas, senarai bantuan selamat'),
    ('smoke_refusal','Jauhi Rokok dan Asap Rokok',
      'merokok,rokok,perokok pasif,asap rokok,berkata tidak,bahaya merokok',
      'meneliti kesan merokok dalam Buku Teks, mempraktikkan ayat penolakan yang tegas dan memilih tindakan beredar serta mendapatkan bantuan orang dewasa',
      'Tiga Langkah TEGAS',
      'Pasangan menerima kad pelawaan rekaan dan menyelesaikan tiga petak: katakan TIDAK dengan jelas, beredar dari kawasan berasap dan maklumkan orang dewasa. Tiada produk sebenar digunakan atau dipamerkan.',
      'ayat penolakan yang jelas, alasan kesihatan dan tindakan mengelakkan asap rokok',
      'Buku Teks, kad situasi rekaan, kad TIDAK, papan tiga langkah, kad sebab dan akibat'),
    ('self_confidence','Keyakinan Diri melalui Amalan Positif',
      'keyakinan diri,amalan positif,yakin boleh,kemampuan diri,berfikiran positif',
      'mengenal pasti amalan positif pada halaman sumber, memadankan amalan dengan kesannya dan menghasilkan pesanan ringkas yang membantu murid mencuba tugasan dengan yakin',
      'Roda Amalan Positif',
      'Murid memutar roda kategori seperti pengetahuan, komunikasi, kesihatan atau kemahiran, memilih satu kad amalan positif daripada halaman sumber dan menerangkan bagaimana amalan itu membantu keyakinan diri.',
      'nama amalan positif, hubungan amalan dengan keyakinan dan contoh tindakan yang realistik',
      'Buku Teks, roda kategori, kad amalan positif, penanda buku kosong, kad refleksi'),
    ('conflict_management','Mengurus Konflik secara Berhemah',
      'konflik,berselisih faham,berbeza pendapat,bertolak ansur,menghormati perasaan,memaafkan',
      'mengenal pasti punca dan tanda konflik daripada situasi sumber, memilih langkah mengurus konflik serta melatih dialog sopan untuk mencapai penyelesaian',
      'Tangga Damai',
      'Kumpulan bergerak pada papan permainan selepas menjawab kad punca, perasaan atau tindakan. Untuk maju, murid perlu membina satu ayat sopan seperti meminta giliran, menjelaskan perasaan atau mencadangkan jalan tengah.',
      'punca atau tanda konflik, ayat komunikasi sopan dan langkah penyelesaian yang dipilih',
      'Buku Teks, kad konflik rekaan, papan Tangga Damai, kad dialog, penanda pemain'),
    ('mosquito_disease','Cegah Penyakit Bawaan Nyamuk',
      'demam denggi,demam malaria,penyakit bawaan nyamuk,pembiakan nyamuk,nyamuk aedes,nyamuk tiruk',
      'membandingkan maklumat demam denggi dan malaria pada Buku Teks, mengenal pasti cara penyakit merebak serta memilih tindakan mencegah pembiakan nyamuk',
      'Pemburu Tempat Pembiakan',
      'Kumpulan meneliti gambar persekitaran rekaan, menanda tempat yang mungkin menakung air dan memadankan setiap tanda dengan tindakan seperti membersih, menutup atau mengurus bekas dengan selamat.',
      'perbezaan maklumat penyakit, petunjuk tempat pembiakan dan tindakan pencegahan yang sesuai',
      'Buku Teks, kad nyamuk dan penyakit, gambar persekitaran rekaan, pelekat tanda, kad tindakan pencegahan'),
    ('environmental_safety','Bijak Mengelak Ancaman Sekeliling',
      'ancaman sekeliling,mengancam keselamatan,orang tidak dikenali,tempat sunyi,keselamatan diri',
      'meneliti situasi ancaman dalam Buku Teks, mengenal pasti petunjuk risiko dan memilih tindakan mengelak, beredar atau memberitahu orang dewasa yang dipercayai',
      'Pilih Laluan Selamat',
      'Kumpulan menyusun kad laluan bagi watak rekaan. Pada setiap simpang, murid memilih tindakan yang lebih selamat dan menjelaskan petunjuk ancaman yang menyebabkan pilihan itu.',
      'petunjuk ancaman, pilihan tindakan selamat dan alasan mengelakkan risiko',
      'Buku Teks, peta laluan rekaan, kad ancaman, kad tindakan, penanda kumpulan'),
    ('nutritious_snacks','Pilihan Snek Berkhasiat',
      'snek berkhasiat,pilihan snek,gula,garam,lemak,pemakanan sihat,sandwic',
      'mengenal pasti contoh snek berkhasiat pada Buku Teks, memilih bahan atau snek yang sesuai dan memberikan sebab berdasarkan keperluan serta pengambilan gula, garam dan lemak secara sederhana',
      'Bakul Snek Bijak',
      'Kumpulan menerima kad snek dan bakul kategori. Murid memilih snek bagi situasi harian rekaan, meletakkan kad dalam bakul pilihan dan memperoleh mata apabila dapat memberikan sebab berasaskan halaman sumber.',
      'nama snek, sebab pilihan dan penggunaan prinsip sederhana tanpa membandingkan tubuh murid',
      'Buku Teks, kad gambar snek, bakul kategori, kad situasi harian, templat sandwic pilihan'),
    ('minor_first_aid','Bantu Mula Kecederaan Ringan',
      'kecederaan ringan,luka kecil,calar,lebam,melecet,bantu mula,pertolongan cemas',
      'mengenal pasti jenis kecederaan ringan daripada gambar sumber, menyusun tindakan meminta bantuan dan menunjukkan bantu mula menggunakan bahan simulasi yang bersih',
      'Susun Kit Bantu Mula',
      'Kumpulan memilih kad bahan simulasi yang sesuai bagi kecederaan rekaan, menyusun kad tindakan dan menerangkan bila perlu meminta bantuan guru, penjaga atau petugas kesihatan. Tiada kecederaan sebenar digunakan untuk latihan.',
      'jenis kecederaan, urutan tindakan, pemilihan bahan dan keputusan mendapatkan bantuan lanjut',
      'Buku Teks, kad kecederaan rekaan, kit simulasi bersih, kad urutan, sarung tangan demonstrasi'),
    ('general','Amalan Kesihatan dan Keselamatan',
      'pendidikan kesihatan,amalan sihat,keselamatan diri,keputusan sihat',
      'meneliti maklumat, gambar atau situasi pada halaman sumber, membuat pilihan kesihatan yang selamat dan menerangkan sebab berdasarkan bukti Buku Teks',
      'Jejak Keputusan Sihat',
      'Kumpulan bergerak melalui kad situasi yang berkaitan dengan halaman sumber, memilih satu tindakan dan memberikan sebab sebelum menerima kad stesen berikutnya.',
      'pilihan tindakan, sebab dan bukti daripada halaman sumber',
      'Buku Teks, kad situasi, kad keputusan, papan jawapan, kad refleksi')
), activity_rows(
  level_key, phase, suffix, row_name, pak21, is_game, priority,
  selection_weight, template
) as (
  values
    ('support','input','picture_cue','Lihat, Tanda dan Sebut','Think-Pair-Share',false,20,136,
      'Guru membuka {{page}} dan menumpukan perhatian murid pada gambar, label atau arahan utama. Dengan dua kad petunjuk, murid mula %1$s. Guru menyemak istilah dan tindakan pertama sebelum murid bergerak ke tugasan penuh.'),
    ('support','guided','guided_source','Tugasan Sumber Berpandu','I Do-We Do',false,21,140,
      'Murid mengikuti tugasan pada {{page}} secara satu bahagian demi satu bahagian untuk %1$s. Guru memodelkan satu contoh menggunakan situasi rekaan, kemudian murid melengkapkan dua item seterusnya bersama pasangan.'),
    ('support','evidence','choose_evidence','Pilih Bukti Selamat','Show Me',false,22,132,
      'Murid memilih satu kad jawapan yang menunjukkan %3$s. Murid menunjuk bahagian pada {{page}} yang menyokong pilihan dan menyebut satu ayat lengkap; pendedahan pengalaman peribadi tidak diperlukan.'),
    ('core','practice','source_practice','Baca, Pilih dan Jelaskan','Pair Check',false,30,142,
      'Secara berpasangan, murid menggunakan maklumat pada {{page}} untuk %1$s. Murid pertama membuat pilihan, murid kedua mencari bukti pada halaman, kemudian mereka bertukar peranan bagi item berikutnya.'),
    ('core','game','source_game','Permainan Keputusan Sumber','Game-Based Learning',true,31,146,
      '%2$s Selepas setiap pusingan, kumpulan merekod satu bukti tentang %3$s dan membetulkan keputusan dengan merujuk semula {{page}}.'),
    ('core','sharing','explain_choice','Meja Pakar Kesihatan','World Cafe',false,32,134,
      'Setiap kumpulan menyiapkan satu bahagian tugasan pada {{page}}, kemudian seorang wakil kekal untuk menerangkan %3$s. Pelawat menambah satu soalan atau bukti sebelum kumpulan merumuskan jawapan bersama.'),
    ('challenge','practice','cause_action','Sebab, Kesan dan Tindakan','Think-Write-Pair-Share',false,40,140,
      'Selepas tugasan asal pada {{page}} selesai, murid membina rantaian sebab-kesan-tindakan berkaitan %3$s. Setiap anak panah mesti disokong oleh maklumat sumber atau alasan keselamatan yang jelas.'),
    ('challenge','game','decision_challenge','Cabaran Keputusan Bijak','Team Challenge',true,41,146,
      '%2$s Pada pusingan cabaran, kumpulan membandingkan dua pilihan, memilih tindakan yang lebih selamat dan mempertahankan pilihan menggunakan bukti daripada {{page}}.'),
    ('challenge','evidence','design_message','Mesej Kesihatan Berbukti','Gallery Walk',false,42,136,
      'Murid menghasilkan kad pesanan, peta keputusan atau penerangan ringkas tentang %3$s berdasarkan {{page}}. Rakan menggunakan dua kriteria—tepat kepada sumber dan tindakan boleh dilaksanakan—untuk memberi maklum balas.')
)
insert into public.rph_activity_library (
  activity_key, language_code, skill_key, phase, level_key, activity_name,
  activity_template, bbm_template, pak21, objective_keywords, source_keywords,
  year_min, year_max, is_game, priority, active, subject_key, pedagogy_key,
  activity_type, example_text, requires_source, selection_weight, subskill_key
)
select
  format('health_y3_%s_%s', p.pattern_key, a.suffix),
  'ms', 'health_education', a.phase, a.level_key,
  format('%s: %s', p.pattern_name, case when a.is_game then p.game_name else a.row_name end),
  format(a.template, p.source_task, p.game_rule, p.evidence),
  p.bbm, a.pak21,
  array[p.pattern_name, p.pattern_key]::text[],
  string_to_array(p.source_words, ','),
  3, 3, a.is_game, a.priority, true, 'health', 'source_first_health',
  format('health_%s_%s', p.pattern_key, a.suffix),
  'Digunakan hanya selepas tugasan Buku Teks sebenar bagi tajuk dan Standard Pembelajaran yang sama dikenal pasti.',
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

with patterns(pattern_key, pattern_name, source_words, induction_focus, bbm) as (
  values
    ('personal_boundaries','Kehormatan dan Privasi Diri','anggota seksual,kehormatan diri,sentuhan selamat,sentuhan tidak selamat','memilih tindakan berkata TIDAK, beredar dan memberitahu orang dewasa yang dipercayai tanpa berkongsi pengalaman peribadi','Buku Teks, kad tindakan selamat, kad respons peribadi'),
    ('family_boundaries','Batas Selamat dalam Keluarga','batas sentuhan,sentuhan dalam keluarga,perhubungan kekeluargaan','mengelaskan situasi rekaan kepada selamat atau perlu dihentikan tanpa melakonkan sentuhan','Buku Teks, kad situasi rekaan, kad hijau-merah'),
    ('smoke_refusal','Jauhi Rokok dan Asap Rokok','merokok,rokok,perokok pasif,asap rokok','menyusun tindakan berkata TIDAK, beredar dan mendapatkan bantuan orang dewasa','Buku Teks, kad tiga langkah, kad TIDAK'),
    ('self_confidence','Keyakinan Diri','keyakinan diri,amalan positif,yakin boleh','memadankan amalan positif dengan kesannya terhadap keyakinan diri','Buku Teks, kad amalan positif, roda kategori'),
    ('conflict_management','Mengurus Konflik','konflik,berselisih faham,bertolak ansur,menghormati perasaan','memilih respons sopan bagi satu konflik rekaan','Buku Teks, kad dialog, kad konflik rekaan'),
    ('mosquito_disease','Penyakit Bawaan Nyamuk','demam denggi,demam malaria,pembiakan nyamuk','memadankan penyakit, petunjuk dan tindakan mencegah pembiakan nyamuk','Buku Teks, kad nyamuk, kad pencegahan'),
    ('environmental_safety','Ancaman Sekeliling','ancaman sekeliling,keselamatan diri,orang tidak dikenali,tempat sunyi','mengesan satu petunjuk ancaman dan memilih tindakan selamat','Buku Teks, kad ancaman, peta laluan rekaan'),
    ('nutritious_snacks','Snek Berkhasiat','snek berkhasiat,pilihan snek,gula,garam,lemak','memilih satu snek berkhasiat dan memberikan alasan tanpa membandingkan tubuh murid','Buku Teks, kad gambar snek, bakul kategori'),
    ('minor_first_aid','Kecederaan Ringan','kecederaan ringan,luka kecil,calar,lebam,bantu mula','memadankan kecederaan rekaan dengan tindakan meminta bantuan dan bahan simulasi yang sesuai','Buku Teks, kad kecederaan rekaan, kit simulasi bersih'),
    ('general','Amalan Kesihatan dan Keselamatan','pendidikan kesihatan,amalan sihat,keselamatan diri','memilih satu tindakan kesihatan yang selamat dan memberikan sebab','Buku Teks, kad situasi, kad keputusan')
), induction_rows(suffix, induction_type, row_name, pak21, priority, template) as (
  values
    ('visual_clue','visual','Teka Fokus Halaman','Think-Pair-Share',20,
      'Guru memaparkan satu gambar atau tajuk kecil daripada {{page}}. Murid %1$s, kemudian menyemak jangkaan bersama pasangan sebelum membaca arahan asal.'),
    ('scenario_sort','scenario','Pilih Tindakan','Scenario Sort',22,
      'Guru menunjukkan dua kad situasi rekaan yang berkaitan dengan {{page}}. Murid %1$s dan mengangkat kad pilihan sebelum guru membuka maklumat sumber.'),
    ('source_puzzle','game','Puzzle Maklumat','Pair Check',24,
      'Pasangan menyusun tiga kad kata kunci atau gambar yang diambil daripada fokus {{page}}. Murid menggunakan susunan itu untuk %1$s, kemudian menyemak dengan halaman Buku Teks.')
)
insert into public.rph_induction_library (
  induction_key, subject_key, skill_key, language_code, induction_type,
  induction_name, induction_template, example_text, bbm_template, pak21,
  objective_keywords, source_keywords, year_min, year_max, priority,
  selection_weight, active, subskill_key
)
select
  format('health_y3_%s_%s', p.pattern_key, i.suffix),
  'health', 'health_education', 'ms', i.induction_type,
  format('%s: %s', p.pattern_name, i.row_name),
  format(i.template, p.induction_focus),
  'Set induksi menggunakan bahan pada halaman sumber dan tidak menggantikan tugasan Buku Teks.',
  p.bbm, i.pak21,
  array[p.pattern_name, p.pattern_key]::text[],
  string_to_array(p.source_words, ','),
  3, 3, i.priority, 132, true, p.pattern_key
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
  'health', 'Pendidikan Kesihatan', 'ms', 'ltr',
  'RPT menentukan minggu dan SK/SP; DSKP mengesahkan standard; Buku Teks menentukan gambar, situasi, arahan dan hasil sebenar. Semua kumpulan melaksanakan tugasan sumber yang sama. Sokongan menggunakan gambar, kata kunci dan pilihan terhad; kumpulan teras melaksanakan tugasan asal dan memberikan bukti; kumpulan cabaran membandingkan keputusan, sebab dan tindakan susulan tanpa mengubah Standard Pembelajaran. Topik keselamatan diri menggunakan situasi rekaan, tidak meminta pendedahan peribadi dan mengutamakan bantuan orang dewasa yang dipercayai. Topik pemakanan menekankan pilihan seimbang tanpa membandingkan tubuh murid. Bantu mula hanya menggunakan bahan simulasi yang bersih.',
  array['Think-Pair-Share','Scenario Sort','Decision Cards','World Cafe','Game-Based Learning','Gallery Walk','Pair Check'],
  array['Buku Teks','kad gambar dan kata kunci','kad situasi rekaan','kad keputusan','papan jawapan','bahan simulasi bersih','kad refleksi peribadi'],
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
