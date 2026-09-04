(function(){
  'use strict';

  const subjectKey=m=>{try{return window.rphSubjectKey?.(m?.subject_id)||''}catch{return''}};
  const mainSp=m=>String(m?.source_evidence?.meta?.main_sp||String(m?.sp||'').split(',')[0]||'').trim();
  const year=m=>Number(m?.year||0)||0;
  const week=m=>Number(m?.week_no||m?.week||0)||0;
  const session=m=>Number(m?.session_no||m?.session||0)||0;
  const page=m=>Number(m?.textbook_page_start||0)||0;
  const routeKey=m=>`${mainSp(m)}@${page(m)}|W${week(m)}|S${session(m)}`;
  const pageLabel=m=>page(m)?`Buku Teks m/s ${page(m)}`:'Buku Teks';
  const step=(key,name,text,bbm,pak21)=>({key,name,text,bbm,pak21,phase:'source'});

  const ROUTES={
    // Unit 10 — Toleransi Kukuhkan Perpaduan
    '1.2.3@62|W18|S2':'kami_berbincang',
    '2.3.1@63|W18|S3':'kami_sepakat',
    '3.3.1@64|W18|S4':'bertolak_ansur_explore',
    '3.3.1@64|W19|S3':'bertolak_ansur_apply',
    '5.1.4@68|W19|S5':'sukaneka_perpaduan',

    // Unit 11 — Hormat-menghormati Budaya Kita
    '1.1.2@69|W20|S1':'berkongsi_hasil',
    '2.3.1@70|W20|S2':'manual_aduan',
    '3.3.1@71|W20|S3':'kami_bersahabat',
    '4.2.2@72|W20|S4':'cahaya_keharmonian',
    '5.2.1@73|W21|S1':'hak_bersama',
    '5.2.1@74|W21|S2':'mematuhi_peranan',

    // Unit 12 — Kerjasama Asas Kesejahteraan
    '1.1.2@75|W21|S3':'bersatu_sokongan',
    '3.1.1@77|W22|S1':'pesta_tradisional',
    '5.2.1@78|W22|S2':'program_kita_sihat',
    '5.2.2@79|W22|S3':'pertandingan_mengarang',
    '2.3.1@80|W22|S4':'warga_rimba',
    '3.3.1@81|W22|S5':'masyarakat_prihatin'
  };

  const REVIEW_ONLY={
    '5.1.4@66|W18|S5':'RPT meletakkan “Hasil Seni” di BT m/s 66 di bawah kata bilangan, tetapi source evidence BT m/s 66 ialah aktiviti kata nafi (bukan/tidak). Perlu audit subkemahiran sebelum blueprint khusus dibina.',
    '5.1.4@62|W19|S2':'Lesson Map/RPT bertajuk “Teka Nama Guru” pada BT m/s 62, tetapi source evidence BT m/s 62 ialah “Kami Berbincang”. Perlu audit halaman sumber sebenar.',
    '2.3.1@71|W21|S4':'Lesson Map/RPT bertajuk “Bersatu Hati” pada BT m/s 71, tetapi source evidence BT m/s 71 ialah “Kami Bersahabat”. Perlu audit sumber sebelum blueprint khusus dibina.'
  };

  function mode(m){if(subjectKey(m)!=='bm'||year(m)!==3)return'';return ROUTES[routeKey(m)]||''}
  function reviewReason(m){if(subjectKey(m)!=='bm'||year(m)!==3)return'';return REVIEW_ONLY[routeKey(m)]||''}

  const C={
    kami_berbincang:{
      title:'Kami Berbincang',
      objective:p=>`Pada akhir PdP, murid dapat bersoal jawab untuk mendapatkan dan menyampaikan sekurang-kurangnya empat maklumat berdasarkan poster pada ${p}.`,
      criteria:'Murid membina soalan yang relevan dan menyampaikan jawapan tepat tentang syarat, tema, masa atau tempat berdasarkan poster.',
      induction:'Guru memaparkan sebahagian poster pertandingan. Murid mengenal pasti maklumat yang masih belum diketahui lalu membina soalan.',
      bbm:['Buku Teks m/s 62','BA m/s 69','kad maklumat poster'],
      support:[step('y3u10-62-s','Soalan Berpandu','Murid melengkapkan rangka soalan siapa/apa/bila/di mana berdasarkan poster.','BT m/s 62','Question Scaffold')],
      core:[step('y3u10-62-c','Pasangan Wartawan','Pasangan bergilir bertanya dan menjawab sekurang-kurangnya empat soalan berdasarkan maklumat poster.','BT m/s 62','Pair Interview')],
      challenge:[step('y3u10-62-h','Soal Susulan','Murid membina satu soalan susulan yang memerlukan gabungan dua maklumat poster dan menjawabnya dengan tepat.','BT m/s 62','Follow-up Questioning')],
      close:'Murid berkongsi satu soalan dan jawapan paling tepat daripada poster.'
    },
    kami_sepakat:{
      title:'Kami Sepakat',
      objective:p=>`Pada akhir PdP, murid dapat membaca, mengenal pasti dan menerangkan sekurang-kurangnya lima maklumat pada label berdasarkan ${p}.`,
      criteria:'Murid mengenal pasti maklumat label seperti tanda, kandungan atau ukuran dan menerangkan fungsi sekurang-kurangnya tiga daripadanya.',
      induction:'Guru menunjukkan contoh label produk tanpa jenama. Murid meneka jenis maklumat yang biasanya terdapat pada label.',
      bbm:['Buku Teks m/s 63','BA m/s 70','kad kategori label'],
      support:[step('y3u10-63-s','Jejak Label','Murid memadankan bahagian label dengan kategori maklumat yang sesuai.','BT m/s 63','Label Matching')],
      core:[step('y3u10-63-c','Baca dan Terangkan','Pasangan membaca label pada bahan, melengkapkan maklumat yang diminta dan menerangkan fungsi maklumat tersebut.','BT m/s 63','Pair Explain')],
      challenge:[step('y3u10-63-h','Label Penting','Murid memilih dua maklumat paling penting pada label dan memberi alasan berdasarkan kegunaannya kepada pengguna.','BT m/s 63','Reasoning Talk')],
      close:'Murid menyatakan satu maklumat label dan kegunaannya.'
    },
    bertolak_ansur_explore:{
      title:'Bertolak Ansur',
      objective:p=>`Pada akhir PdP, murid dapat membina kerangka dan menulis sekurang-kurangnya satu perenggan karangan berpandu berdasarkan gambar dan frasa pada ${p}.`,
      criteria:'Murid menyusun idea mengikut urutan yang sesuai dan menulis perenggan dengan ayat yang berkaitan dengan tema toleransi.',
      induction:'Guru memaparkan dua gambar sumber tanpa teks. Murid menyebut tindakan yang menunjukkan toleransi dan kerjasama.',
      bbm:['Buku Teks m/s 64–65','peta kerangka','kad frasa sumber'],
      support:[step('y3u10-64a-s','Susun Kerangka','Murid menyusun kad frasa kepada pendahuluan, isi dan penutup dengan bimbingan guru.','BT m/s 64–65','Sequencing')],
      core:[step('y3u10-64a-c','Perenggan Berpandu','Murid menggunakan gambar/frasa yang tersedia untuk membina satu perenggan lengkap. PKJR tidak ditambah kerana sumber PKJR berasingan tidak diperiksa dalam modul ini.','BT m/s 64–65','Guided Writing')],
      challenge:[step('y3u10-64a-h','Tambah Huraian','Murid menambah satu ayat huraian yang masih berpandukan gambar atau frasa sumber.','BT m/s 64–65','Sentence Expansion')],
      close:'Murid membaca satu ayat terbaik dan menunjukkan sumber idea yang digunakan.'
    },
    bertolak_ansur_apply:{
      title:'Bertolak Ansur — Aplikasi',
      objective:p=>`Pada akhir PdP, murid dapat menambah baik kerangka dan menghasilkan karangan berpandu yang lebih lengkap berdasarkan ${p}.`,
      criteria:'Murid menghasilkan urutan pendahuluan-isi-penutup yang jelas dan memurnikan sekurang-kurangnya dua ayat berdasarkan semakan rakan.',
      induction:'Guru memaparkan satu kerangka yang belum lengkap. Murid mengenal pasti bahagian yang perlu ditambah.',
      bbm:['Buku Teks m/s 64–65','lembaran kerangka','senarai semak rakan'],
      support:[step('y3u10-64b-s','Lengkapkan Kerangka','Murid melengkapkan ruang idea yang hilang menggunakan pilihan frasa daripada sumber.','lembaran kerangka','Scaffolded Writing')],
      core:[step('y3u10-64b-c','Tulis dan Semak','Murid menulis karangan berpandu, kemudian menyemak kesinambungan idea dan ketepatan ayat bersama pasangan.','BT m/s 64–65','Peer Review')],
      challenge:[step('y3u10-64b-h','Pemurnian Kendiri','Murid menggantikan satu ayat lemah dengan ayat yang lebih jelas tanpa keluar daripada maklumat sumber.','senarai semak','Independent Editing')],
      close:'Murid menyatakan satu pembaikan yang dibuat selepas semakan.'
    },
    sukaneka_perpaduan:{
      title:'Sukaneka Perpaduan',
      objective:p=>`Pada akhir PdP, murid dapat mengenal pasti dan menggunakan sekurang-kurangnya lima kata bilangan daripada ${p} dalam ayat yang tepat.`,
      criteria:'Murid membezakan kata bilangan tentu, tidak tentu, himpunan dan pecahan serta membina sekurang-kurangnya empat ayat berdasarkan gambar.',
      induction:'Guru memaparkan beberapa contoh kuantiti tanpa label. Murid memilih kata bilangan yang sesuai.',
      bbm:['Buku Teks m/s 68','BA m/s 76','kad kata bilangan'],
      support:[step('y3u10-68-s','Kelaskan Bilangan','Murid mengelaskan contoh kata bilangan kepada kategori yang sesuai.','kad kata bilangan','Sorting')],
      core:[step('y3u10-68-c','Ayat Sukaneka','Pasangan membina ayat berdasarkan situasi dan gambar sukaneka menggunakan kata bilangan yang tepat. Aktiviti bahasa sahaja; murid tidak perlu menjalankan permainan fizikal.','BT m/s 68','Pair Grammar')],
      challenge:[step('y3u10-68-h','Tukar Kuantiti','Murid menukar jenis kata bilangan dalam satu ayat dan membetulkan struktur ayat supaya kekal gramatis.','BT m/s 68','Grammar Transfer')],
      close:'Murid menyebut satu kata bilangan dan kategorinya.'
    },
    berkongsi_hasil:{
      title:'Berkongsi Hasil Tanaman',
      objective:p=>`Pada akhir PdP, murid dapat mendengar, memahami dan memberikan sekurang-kurangnya empat respons yang sesuai terhadap suruhan dan permintaan berdasarkan ${p}.`,
      criteria:'Murid memberikan respons yang tepat dan santun terhadap arahan atau permintaan dalam dialog.',
      induction:'Guru memperdengarkan dua ayat suruhan dan satu permintaan. Murid memilih respons yang sesuai.',
      bbm:['Buku Teks m/s 69','BA m/s 77','kad dialog'],
      support:[step('y3u11-69-s','Dengar dan Pilih','Murid memilih respons yang sepadan selepas mendengar ayat guru.','kad dialog','Listening Match')],
      core:[step('y3u11-69-c','Dialog Jiran','Pasangan melakonkan dialog berkongsi hasil tanaman dengan fokus pada respons terhadap suruhan dan permintaan.','BT m/s 69','Role Play')],
      challenge:[step('y3u11-69-h','Respons Alternatif','Murid menghasilkan satu respons alternatif yang masih santun dan mengekalkan maksud.','BT m/s 69','Language Transfer')],
      close:'Murid menyatakan beza respons terhadap suruhan dan permintaan.'
    },
    manual_aduan:{
      title:'Manual Laman Aduan Taman Aman',
      objective:p=>`Pada akhir PdP, murid dapat membaca, mengenal pasti dan menerangkan sekurang-kurangnya lima langkah atau maklumat dalam manual pada ${p}.`,
      criteria:'Murid menyusun langkah manual dengan betul dan menerangkan tujuan laman serta etika penggunaan berdasarkan bahan.',
      induction:'Guru memaparkan kad langkah bercampur bagi satu prosedur ringkas. Murid menyusunnya mengikut urutan.',
      bbm:['Buku Teks m/s 70','BA m/s 78','kad urutan manual'],
      support:[step('y3u11-70-s','Susun Langkah','Murid menyusun kad langkah manual daripada mula hingga hantar tanpa menggunakan akaun atau kata laluan sebenar.','kad urutan','Sequencing')],
      core:[step('y3u11-70-c','Terangkan Manual','Pasangan membaca manual dan menerangkan urutan, tujuan serta etika aduan dengan kata sendiri. Tiada pendaftaran akaun sebenar dilakukan.','BT m/s 70','Pair Explain')],
      challenge:[step('y3u11-70-h','Semak Kejelasan','Murid mengenal pasti satu langkah yang perlu diterangkan dengan lebih jelas dan mencadangkan ayat penjelasan.','BT m/s 70','Clarity Check')],
      close:'Murid menyebut satu ciri manual yang baik.'
    },
    kami_bersahabat:{
      title:'Kami Bersahabat',
      objective:p=>`Pada akhir PdP, murid dapat menghasilkan kerangka dan karangan separa berpandu tentang menghormati sahabat berdasarkan ${p}.`,
      criteria:'Murid melengkapkan pendahuluan, sekurang-kurangnya dua isi dan penutup yang berkaitan serta menggunakan penanda wacana sesuai.',
      induction:'Guru memaparkan tiga tindakan berkaitan persahabatan. Murid memilih tindakan yang menunjukkan sikap saling menghormati.',
      bbm:['Buku Teks m/s 71','BA m/s 79','peta kerangka karangan'],
      support:[step('y3u11-71-s','Isi Kerangka','Murid memadankan idea sumber kepada pendahuluan, isi dan penutup.','peta kerangka','Guided Planning')],
      core:[step('y3u11-71-c','Karangan Sahabat','Murid menulis karangan separa berpandu berdasarkan kerangka buku. PKJR tidak ditambah kerana sumber PKJR berasingan tidak diperiksa.','BT m/s 71','Guided Writing')],
      challenge:[step('y3u11-71-h','Huraian Bermakna','Murid menambah satu contoh yang masih selari dengan idea menghormati sahabat dan memurnikan ayat.','BT m/s 71','Elaboration')],
      close:'Murid berkongsi satu isi utama karangan dan huraian ringkas.'
    },
    cahaya_keharmonian:{
      title:'Cahaya Keharmonian',
      objective:p=>`Pada akhir PdP, murid dapat menyanyikan lagu mengikut irama yang ditetapkan dalam ${p} dan menjelaskan maksud sekurang-kurangnya tiga ungkapan bahasa indah daripada lirik.`,
      criteria:'Murid menyanyi dengan irama yang sesuai dan menerangkan maksud ungkapan terpilih menggunakan bahasa sendiri.',
      induction:'Guru memperdengarkan rentak ringkas tanpa memaparkan keseluruhan lirik. Murid meneka tema lagu berdasarkan tajuk dan gambar.',
      bbm:['Buku Teks m/s 72','BA m/s 80','kad maksud ungkapan'],
      support:[step('y3u11-72-s','Padan Maksud','Murid memadankan ungkapan terpilih dalam buku dengan maksud ringkas yang disediakan.','BT m/s 72','Meaning Match')],
      core:[step('y3u11-72-c','Nyanyi dan Jelaskan','Murid menyanyikan lagu terus daripada Buku Teks, kemudian menerangkan maksud beberapa baris terpilih tanpa menyalin semula keseluruhan lirik.','BT m/s 72','Group Performance')],
      challenge:[step('y3u11-72-h','Mesej Utama','Murid merumus mesej keharmonian lagu dalam dua ayat menggunakan kata sendiri.','BT m/s 72','Meaning Transfer')],
      close:'Murid menyatakan satu nilai yang disampaikan melalui lagu.'
    },
    hak_bersama:{
      title:'Hak Bersama',
      objective:p=>`Pada akhir PdP, murid dapat mengenal pasti sekurang-kurangnya lima kata dasar daripada ${p} dan menggunakannya dalam ayat yang tepat.`,
      criteria:'Murid membezakan kata dasar daripada bentuk berimbuhan dan membina sekurang-kurangnya empat ayat berdasarkan situasi taman permainan.',
      induction:'Guru memaparkan pasangan kata seperti ambil/mengambil dan datar/dataran. Murid menentukan kata dasar.',
      bbm:['Buku Teks m/s 73','BA m/s 81–82','kad kata dasar'],
      support:[step('y3u11-73-s','Cari Kata Dasar','Murid memadankan kata berimbuhan dengan kata dasarnya.','kad kata','Word Match')],
      core:[step('y3u11-73-c','Ayat Hak Bersama','Pasangan mengenal pasti kata dasar daripada teks dan membina ayat berdasarkan situasi pada halaman.','BT m/s 73','Pair Grammar')],
      challenge:[step('y3u11-73-h','Bina Keluarga Kata','Murid membina satu keluarga kata daripada kata dasar pilihan dan menjelaskan perubahan makna ringkas.','BT m/s 73','Word Family')],
      close:'Murid menyebut satu kata dasar dan satu bentuk berimbuhannya.'
    },
    mematuhi_peranan:{
      title:'Mematuhi Peranan',
      objective:p=>`Pada akhir PdP, murid dapat mengenal pasti dan menggunakan sekurang-kurangnya lima kata berimbuhan awalan daripada ${p} mengikut konteks.`,
      criteria:'Murid memadankan kata dasar dengan awalan yang sesuai dan membina sekurang-kurangnya empat ayat berdasarkan situasi mesyuarat.',
      induction:'Guru memaparkan tiga pasangan kata dasar dan kata berawalan. Murid mengenal pasti bahagian yang berubah.',
      bbm:['Buku Teks m/s 74','BA m/s 83–84','kad imbuhan awalan'],
      support:[step('y3u11-74-s','Dasar kepada Awalan','Murid memadankan kata dasar dengan bentuk berimbuhan awalan daripada teks.','kad imbuhan','Morphology Match')],
      core:[step('y3u11-74-c','Lengkap Konteks','Pasangan melengkapkan ayat berdasarkan teks mesyuarat dengan kata berimbuhan awalan yang sesuai.','BT m/s 74','Pair Grammar')],
      challenge:[step('y3u11-74-h','Uji Makna','Murid menukar satu kata dasar kepada dua bentuk berawalan yang sesuai dan membandingkan penggunaannya.','BT m/s 74','Word Formation')],
      close:'Murid menyebut satu kata berawalan dan kata dasarnya.'
    },
    bersatu_sokongan:{
      title:'Bersatu Memberikan Sokongan',
      objective:p=>`Pada akhir PdP, murid dapat mendengar, memahami dan memberikan sekurang-kurangnya empat respons terhadap ayat silaan dan larangan berdasarkan ${p}.`,
      criteria:'Murid membezakan fungsi silaan dan larangan serta memberikan respons lisan yang santun dan tepat.',
      induction:'Guru memperdengarkan dua ayat: satu silaan dan satu larangan. Murid mengangkat kad fungsi yang sesuai.',
      bbm:['Buku Teks m/s 75','BA m/s 85–86','kad silaan/larangan'],
      support:[step('y3u12-75-s','Kenal Fungsi','Murid mengelaskan ungkapan kepada silaan atau larangan.','kad fungsi','Listening Sort')],
      core:[step('y3u12-75-c','Dialog Sokongan','Pasangan melakonkan dialog dan memberi respons terhadap ungkapan silaan atau larangan daripada bahan.','BT m/s 75','Role Play')],
      challenge:[step('y3u12-75-h','Tukar Bentuk','Murid menukar satu ayat kepada fungsi lain yang sesuai dan menerangkan perubahan respons.','BT m/s 75','Language Transfer')],
      close:'Murid memberikan satu contoh respons santun bagi silaan atau larangan.'
    },
    pesta_tradisional:{
      title:'Pesta Permainan Tradisional',
      objective:p=>`Pada akhir PdP, murid dapat menulis sekurang-kurangnya enam perkataan daripada ${p} menggunakan tulisan berangkai yang kemas dan boleh dibaca.`,
      criteria:'Murid mengekalkan bentuk huruf, sambungan dan jarak perkataan dengan betul bagi sekurang-kurangnya enam perkataan.',
      induction:'Guru memaparkan satu perkataan dalam tulisan biasa dan tulisan berangkai. Murid mengenal pasti perbezaan bentuk.',
      bbm:['Buku Teks m/s 77','BA m/s 88','lembaran garis tulisan'],
      support:[step('y3u12-77-s','Jejak Perkataan','Murid menyalin perkataan terpilih dengan garis panduan tulisan berangkai.','lembaran garis','Guided Writing')],
      core:[step('y3u12-77-c','Kad Undangan Berangkai','Murid menulis perkataan terpilih daripada kad undangan dalam tulisan berangkai dan menyemak bentuk bersama pasangan.','BT m/s 77','Peer Check')],
      challenge:[step('y3u12-77-h','Frasa Ringkas','Murid menggabungkan dua perkataan yang dikuasai menjadi satu frasa ringkas dalam tulisan berangkai.','lembaran garis','Writing Transfer')],
      close:'Murid memilih satu perkataan paling kemas dan menyatakan cirinya.'
    },
    program_kita_sihat:{
      title:'Program Kita Sihat',
      objective:p=>`Pada akhir PdP, murid dapat mengenal pasti dan menggunakan sekurang-kurangnya lima kata berimbuhan akhiran daripada ${p} mengikut konteks.`,
      criteria:'Murid mengenal pasti kata dasar dan imbuhan akhiran serta membina sekurang-kurangnya empat ayat yang tepat.',
      induction:'Guru memaparkan kata dasar dan beberapa akhiran. Murid mencuba membentuk perkataan yang gramatis.',
      bbm:['Buku Teks m/s 78','BA m/s 89–90','kad kata dasar/akhiran'],
      support:[step('y3u12-78-s','Cantum Akhiran','Murid memadankan kata dasar dengan akhiran yang menghasilkan perkataan sesuai.','kad morfologi','Word Building')],
      core:[step('y3u12-78-c','Jejak Akhiran','Pasangan mengenal pasti kata berakhiran dalam teks dan membina ayat berdasarkan konteks program. Fokus bahasa sahaja; murid tidak menjalankan aktiviti kesihatan fizikal dalam blueprint ini.','BT m/s 78','Pair Grammar')],
      challenge:[step('y3u12-78-h','Banding Bentuk','Murid membandingkan dua bentuk berakhiran daripada kata dasar berbeza dan menjelaskan penggunaannya dalam ayat.','BT m/s 78','Morphology Reasoning')],
      close:'Murid menyebut satu kata berakhiran dan kata dasarnya.'
    },
    pertandingan_mengarang:{
      title:'Pertandingan Mengarang',
      objective:p=>`Pada akhir PdP, murid dapat mengenal pasti dan menggunakan sekurang-kurangnya lima kata majmuk daripada ${p} dalam ayat yang tepat.`,
      criteria:'Murid mengenal pasti rangkai kata yang membentuk kata majmuk dan membina sekurang-kurangnya empat ayat berdasarkan bahan.',
      induction:'Guru memaparkan beberapa pasangan kata. Murid menentukan pasangan yang membentuk makna khusus.',
      bbm:['Buku Teks m/s 79','BA m/s 91–92','kad kata majmuk'],
      support:[step('y3u12-79-s','Padan Kata','Murid memadankan dua kata dasar untuk membentuk kata majmuk yang terdapat dalam bahan.','kad kata','Word Pairing')],
      core:[step('y3u12-79-c','Ayat Kata Majmuk','Pasangan mengenal pasti kata majmuk dalam teks dan membina ayat baharu yang masih berkaitan dengan situasi perpustakaan/pertandingan.','BT m/s 79','Pair Grammar')],
      challenge:[step('y3u12-79-h','Makna Khusus','Murid menerangkan mengapa dua kata yang dirangkaikan menghasilkan makna khusus dalam contoh pilihan.','BT m/s 79','Meaning Reasoning')],
      close:'Murid menyebut satu kata majmuk dan dua kata dasarnya.'
    },
    warga_rimba:{
      title:'Warga Rimba',
      objective:p=>`Pada akhir PdP, murid dapat membaca, mengenal pasti dan menerangkan sekurang-kurangnya empat kandungan penting daripada cerita pada ${p}.`,
      criteria:'Murid menerangkan watak dan kebolehan, suasana serta sekurang-kurangnya satu nilai berdasarkan cerita.',
      induction:'Guru memaparkan nama beberapa watak haiwan daripada cerita. Murid meramal peranan setiap watak.',
      bbm:['Buku Teks m/s 80','kad watak','peta cerita'],
      support:[step('y3u12-80-s','Watak dan Tindakan','Murid memadankan watak dengan tindakan atau kebolehannya berdasarkan cerita.','BT m/s 80','Story Match')],
      core:[step('y3u12-80-c','Baca dan Bentang','Kumpulan membaca cerita, mencatat watak, suasana dan nilai lalu membentangkan hasil perbincangan.','BT m/s 80','Collaborative Reading')],
      challenge:[step('y3u12-80-h','Bukti Nilai','Murid memilih satu nilai dan menerangkan peristiwa yang menjadi bukti.','BT m/s 80','Evidence Talk')],
      close:'Murid menyatakan satu nilai dan tindakan watak yang menyokongnya.'
    },
    masyarakat_prihatin:{
      title:'Masyarakat Prihatin',
      objective:p=>`Pada akhir PdP, murid dapat menghasilkan kerangka dan karangan separa berpandu berdasarkan gambar dan frasa pada ${p}.`,
      criteria:'Murid menyusun sekurang-kurangnya tiga isi mengikut urutan dan menulis karangan dengan pendahuluan, isi serta penutup yang berkaitan.',
      induction:'Guru memaparkan gambar rondaan daripada bahan. Murid menyatakan tujuan aktiviti berdasarkan konteks teks sahaja.',
      bbm:['Buku Teks m/s 81','peta kerangka','kad frasa sumber'],
      support:[step('y3u12-81-s','Susun Frasa','Murid menyusun frasa sumber kepada urutan taklimat, pembahagian tugas, rondaan dan hasil.','BT m/s 81','Sequencing')],
      core:[step('y3u12-81-c','Karangan Prihatin','Murid menulis karangan separa berpandu berdasarkan gambar dan frasa. Aktiviti hanya penulisan kelas; murid tidak diminta menyertai rondaan malam sebenar. PKJR tidak ditambah kerana sumber PKJR berasingan tidak diperiksa.','BT m/s 81','Guided Writing')],
      challenge:[step('y3u12-81-h','Perkukuh Huraian','Murid menambah satu ayat huraian bagi setiap isi menggunakan maklumat yang masih dapat disokong oleh sumber.','BT m/s 81','Elaboration')],
      close:'Murid membaca satu isi dan huraian yang paling jelas.'
    }
  };

  function objectivePair(m){const c=C[mode(m)];return c?{objective:c.objective(pageLabel(m)),criteria:c.criteria}:null}

  function blueprint(m){
    const md=mode(m),c=C[md];
    if(!c)return null;
    const pair=objectivePair(m),p=pageLabel(m);
    return {
      method:'Aktiviti source-first BM Tahun 3 berdasarkan RPT + DSKP + Buku Teks',
      pakDetail:`Isi PdP dikunci kepada tugasan sebenar ${p}. Activity Library hanya memvariasikan cara pelaksanaan dan tidak menentukan kandungan pelajaran.`,
      anchor:`${c.title} — ${p}`,
      kind:'source_task',
      bbmList:c.bbm,
      groupBbm:{support:c.bbm.join('; '),core:c.bbm.join('; '),challenge:c.bbm.join('; ')},
      mainSp:mainSp(m),page:p,topic:c.title,
      setInduksi:c.induction,
      inductionData:{name:'Set Induksi Sumber',text:c.induction,bbm:p,pak21:'Think-Pair-Share'},
      librarySteps:{support:c.support,core:c.core,challenge:c.challenge},
      diffSupport:'Tugasan sumber yang sama dengan kad petunjuk, pilihan terhad atau model bahasa.',
      diffCore:'Melaksanakan tugasan sebenar Buku Teks dengan bukti yang boleh disemak daripada sumber.',
      diffChallenge:'Tugasan sumber yang sama secara lebih kendiri dengan alasan, bukti, rumusan atau pemurnian tambahan.',
      diffSupportAct:c.support.map(x=>x.text).join(' '),
      diffCoreAct:c.core.map(x=>x.text).join(' '),
      diffChallengeAct:c.challenge.map(x=>x.text).join(' '),
      pbdEvidence:{method:'Pemerhatian + hasil lisan/bacaan/tulisan sumber',evidence:'Prestasi murid disemak terus terhadap tugasan Buku Teks dan evidens BA yang dirujuk RPT.',criterion:pair.criteria},
      penutup:c.close,
      _runtime_bm_year3_source_blueprint:true,
      _runtime_bm_year3_units10_12_mode:md
    };
  }

  const originalEffective=window.effectiveRphLessonMap;
  if(typeof originalEffective==='function')window.effectiveRphLessonMap=function(map,...args){
    const out=originalEffective.call(this,map,...args);
    const reason=reviewReason(out);
    if(reason)return {...out,_runtime_bm_year3_source_review_required:true,_runtime_bm_year3_source_review_reason:reason};
    const pair=objectivePair(out);
    if(!pair)return out;
    return {...out,objective:pair.objective,success_criteria:pair.criteria,_runtime_bm_year3_source_blueprint:true,_runtime_bm_year3_units10_12_mode:mode(out)};
  };

  const originalPedagogy=window.buildSourceAwarePedagogy;
  if(typeof originalPedagogy==='function')window.buildSourceAwarePedagogy=function(map,ev,built){
    const out=blueprint(map);
    return out||originalPedagogy(map,ev,built);
  };

  window.bmYear3Units1012SourceBlueprintMode=mode;
  window.bmYear3Units1012SourceReviewReason=reviewReason;
  window.bmYear3Units1012SourceBlueprint=blueprint;
})();