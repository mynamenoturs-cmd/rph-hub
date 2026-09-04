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
    // Unit 4 — Saya Sihat dan Bertenaga
    '1.1.2@22|W8|S1':'minuman_kesihatan',
    '2.1.2@23|W8|S2':'vitamin_c',
    '3.2.1@24|W8|S3':'sumber_tenaga',
    '5.1.3@25|W8|S4':'kolam_air_panas',
    '5.1.3@26|W8|S5':'katakan_boleh',

    // Unit 5 — Kebersihan Tanggungjawab Bersama
    '1.1.2@27|W9|S1':'pilihan_sabun',
    '2.1.2@28|W9|S2':'bersihkan_diri',
    '3.2.1@29|W9|S3':'premis_makanan',
    '4.1.1@30|W9|S4':'jagalah_kebersihan',
    '5.1.3@31|W9|S5':'dapur_bersih_explore',
    '5.1.4@32|W10|S1':'cegah_lalat',
    '5.1.3@31|W10|S4':'dapur_bersih_apply',

    // Unit 6 — Minda Positif Badan Aktif
    '1.1.3@33|W11|S1':'aromaterapi',
    '2.1.2@34|W11|S2':'yakin_boleh',
    '3.2.2@35|W11|S3':'elakkan_kuman',
    '5.1.4@37|W12|S1':'kembara_sihat',
    '1.1.3@38|W12|S2':'gejala_taun',
    '1.1.2@39|W12|S4':'penilaian_tema2',
    '2.1.2@40|W12|S5':'hari_sukan_negara'
  };

  const REVIEW_ONLY={
    '5.1.4@31|W11|S5':'Lesson Map bertajuk “Cergas dan Cerdas” tetapi BT m/s 31 yang disimpan dalam source evidence ialah “Dapur Bersih” (SP 5.1.3 kata adjektif pancaindera). RPT pula merekod “Cergas dan Cerdas” pada BT 31 untuk SP 5.1.4 kata sendi nama. Perlu semakan sumber sebelum blueprint khusus dibina.',
    '5.1.4@31|W12|S3':'Lesson Map bertajuk “Cergas dan Cerdas” tetapi BT m/s 31 yang disimpan dalam source evidence ialah “Dapur Bersih” (SP 5.1.3 kata adjektif pancaindera). RPT pula merekod “Cergas dan Cerdas” pada BT 31 untuk SP 5.1.4 kata sendi nama. Perlu semakan sumber sebelum blueprint khusus dibina.'
  };

  function mode(m){
    if(subjectKey(m)!=='bm'||year(m)!==3)return'';
    return ROUTES[routeKey(m)]||'';
  }
  function reviewReason(m){
    if(subjectKey(m)!=='bm'||year(m)!==3)return'';
    return REVIEW_ONLY[routeKey(m)]||'';
  }

  const C={
    minuman_kesihatan:{
      title:'Minuman Kesihatan',
      objective:p=>`Pada akhir PdP, murid dapat mendengar, memahami dan memberikan sekurang-kurangnya tiga respons yang sesuai terhadap suruhan dan permintaan dalam dialog ${p}.`,
      criteria:'Murid memberikan respons lisan yang tepat dan santun terhadap sekurang-kurangnya tiga suruhan atau permintaan daripada bahan.',
      induction:'Guru memperdengarkan dua arahan ringkas berkaitan situasi dapur. Murid menentukan respons yang sesuai tanpa melakukan aktiviti penyediaan minuman.',
      bbm:['Buku Teks m/s 22','BA yang dirujuk RPT','kad dialog'],
      support:[step('y3u4-22-s','Dengar dan Pilih Respons','Murid mendengar suruhan atau permintaan lalu memilih respons yang sepadan daripada kad jawapan.','kad dialog','Listening Match')],
      core:[step('y3u4-22-c','Dialog Respons Tepat','Pasangan melakonkan dialog ibu–Nabila dengan fokus pada respons terhadap suruhan dan permintaan. Bahan dapur hanya digunakan sebagai gambar/rujukan; murid tidak memotong halia atau menyediakan minuman.','BT m/s 22','Role Play')],
      challenge:[step('y3u4-22-h','Ubah Respons, Kekal Santun','Murid menghasilkan satu respons alternatif yang masih tepat dan santun bagi permintaan yang sama.','BT m/s 22','Language Transfer')],
      close:'Murid menyebut satu ciri respons yang sesuai terhadap suruhan atau permintaan.'
    },
    vitamin_c:{
      title:'Khasiat Vitamin C',
      objective:p=>`Pada akhir PdP, murid dapat membaca bahan ${p} dengan sebutan dan intonasi yang sesuai serta mengenal pasti sekurang-kurangnya tiga jenis ayat.`,
      criteria:'Murid membaca petikan dengan jelas dan membezakan sekurang-kurangnya tiga jenis ayat berdasarkan tanda baca dan fungsi ayat.',
      induction:'Guru memaparkan ayat penyata, ayat tanya dan ayat seruan pendek. Murid memadankan ayat dengan fungsi dan intonasinya.',
      bbm:['Buku Teks m/s 23','kad jenis ayat','penanda bacaan'],
      support:[step('y3u4-23-s','Warna Jenis Ayat','Murid menandakan ayat penyata, tanya dan seruan dengan simbol berbeza sebelum membaca.','BT m/s 23','Guided Reading')],
      core:[step('y3u4-23-c','Baca Ikut Fungsi','Pasangan membaca dialog secara bergilir dengan intonasi yang sesuai mengikut jenis ayat, kemudian menyatakan maksud utama petikan.','BT m/s 23','Paired Reading')],
      challenge:[step('y3u4-23-h','Bukti Jenis Ayat','Murid memilih tiga ayat dan menerangkan petunjuk yang menunjukkan jenis ayat tersebut.','BT m/s 23','Evidence Talk')],
      close:'Murid membaca satu ayat pilihan dengan intonasi yang sesuai dan menamakan jenisnya.'
    },
    sumber_tenaga:{
      title:'Makanan Sumber Tenaga',
      objective:p=>`Pada akhir PdP, murid dapat membina dan menulis sekurang-kurangnya lima ayat berdasarkan maklumat makanan sumber tenaga pada ${p}.`,
      criteria:'Murid menulis ayat yang menghubungkan sekurang-kurangnya dua jenis nutrien dengan contoh makanan atau kepentingannya berdasarkan bahan.',
      induction:'Guru memaparkan tiga label: karbohidrat, protein dan lemak. Murid mengelaskan beberapa maklumat yang sudah terdapat pada halaman.',
      bbm:['Buku Teks m/s 24','kad maklumat','peta tiga stesen'],
      support:[step('y3u4-24-s','Padan Maklumat','Murid memadankan contoh makanan dan kepentingan kepada label karbohidrat, protein atau lemak.','kad maklumat','Matching')],
      core:[step('y3u4-24-c','Stesen Ayat Bermakna','Kumpulan bergerak secara terkawal antara tiga stesen maklumat, kemudian membina ayat lengkap berdasarkan fakta pada halaman.','BT m/s 24','Gallery Walk')],
      challenge:[step('y3u4-24-h','Gabung Dua Fakta','Murid menggabungkan dua maklumat berkaitan menjadi ayat yang lebih lengkap tanpa menambah fakta luar sumber.','BT m/s 24','Sentence Expansion')],
      close:'Murid membaca satu ayat dan menunjukkan maklumat sumber yang menyokong ayat tersebut.'
    },
    kolam_air_panas:{
      title:'Beriadah di Kolam Air Panas',
      objective:p=>`Pada akhir PdP, murid dapat mengenal pasti dan menggunakan kata adjektif jarak berdasarkan ${p} dalam sekurang-kurangnya empat ayat yang tepat.`,
      criteria:'Murid memilih kata adjektif jarak yang sesuai mengikut kedudukan objek dan membina sekurang-kurangnya empat ayat berdasarkan gambar.',
      induction:'Guru meletakkan tiga kad objek pada kedudukan berbeza di dalam kelas. Murid menerangkan jarak objek menggunakan kata yang sesuai.',
      bbm:['Buku Teks m/s 25','kad kedudukan','gambar kolam air panas'],
      support:[step('y3u4-25-s','Padan Jarak','Murid memadankan kata adjektif jarak dengan kedudukan objek dalam gambar.','BT m/s 25','Visual Matching')],
      core:[step('y3u4-25-c','Jejak Kedudukan','Pasangan melengkapkan ayat tentang kedudukan kolam, kerusi, ahli keluarga dan bilik persalinan berdasarkan gambar.','BT m/s 25','Pair Grammar')],
      challenge:[step('y3u4-25-h','Ubah Titik Rujukan','Murid memilih titik rujukan lain dalam gambar dan membina dua ayat baharu menggunakan kata adjektif jarak yang tepat.','BT m/s 25','Spatial Reasoning')],
      close:'Guru menunjukkan satu objek dalam gambar; murid memilih kata adjektif jarak yang sesuai.'
    },
    katakan_boleh:{
      title:'Katakan Boleh',
      objective:p=>`Pada akhir PdP, murid dapat mengenal pasti dan menggunakan sekurang-kurangnya lima kata adjektif perasaan daripada ${p} mengikut konteks.`,
      criteria:'Murid menggunakan kata seperti sedih, gembira, bimbang, malu dan sayang dalam ayat yang tepat berdasarkan situasi emosi.',
      induction:'Guru memaparkan kad situasi neutral dan murid memilih kata adjektif perasaan yang sesuai tanpa membandingkan bentuk atau saiz badan sesiapa.',
      bbm:['Buku Teks m/s 26','kad emosi','kad situasi'],
      support:[step('y3u4-26-s','Padan Perasaan–Situasi','Murid memadankan kata adjektif perasaan dengan situasi yang dinyatakan dalam teks.','BT m/s 26','Matching')],
      core:[step('y3u4-26-c','Jejak Perubahan Perasaan','Pasangan menyusun perubahan perasaan watak berdasarkan teks dan membina ayat menggunakan kata adjektif perasaan. Fokus bahasa sahaja; murid tidak membandingkan berat, bentuk badan atau sasaran fizikal.','BT m/s 26','Timeline Talk')],
      challenge:[step('y3u4-26-h','Ayat Empati','Murid menghasilkan dua ayat yang menunjukkan respons empati terhadap perasaan watak menggunakan kata adjektif yang sesuai.','kad emosi','Empathy Talk')],
      close:'Murid memilih satu kata adjektif perasaan dan memberikan contoh situasi yang sesuai.'
    },
    pilihan_sabun:{
      title:'Pilihan Tepat Kita Selamat',
      objective:p=>`Pada akhir PdP, murid dapat mendengar, memahami dan memberikan respons yang sesuai terhadap silaan dan larangan berdasarkan ${p}.`,
      criteria:'Murid memberikan sekurang-kurangnya empat respons tepat terhadap ungkapan seperti sila, jemput, usah dan jangan.',
      induction:'Guru memaparkan empat kad fungsi: silaan, larangan, suruhan dan permintaan. Murid mengelaskan contoh ayat pendek.',
      bbm:['Buku Teks m/s 27','BA yang dirujuk RPT','kad fungsi ayat'],
      support:[step('y3u5-27-s','Kenal Fungsi','Murid mengangkat kad “silaan” atau “larangan” selepas mendengar ayat guru.','kad fungsi','Listening Sort')],
      core:[step('y3u5-27-c','Dialog Pilihan Tepat','Pasangan melakonkan situasi membeli produk kebersihan dengan fokus pada ungkapan silaan dan larangan serta respons yang santun.','BT m/s 27','Role Play')],
      challenge:[step('y3u5-27-h','Bina Respons Alternatif','Murid menukar satu respons kepada bentuk lain yang masih sesuai tanpa mengubah maksud silaan atau larangan.','BT m/s 27','Language Transfer')],
      close:'Murid memberi satu contoh silaan dan satu contoh larangan daripada bahan.'
    },
    bersihkan_diri:{
      title:'Mari Bersihkan Diri',
      objective:p=>`Pada akhir PdP, murid dapat membaca perenggan dalam ${p} dengan sebutan dan intonasi yang sesuai serta menyatakan maklumat penting setiap perenggan.`,
      criteria:'Murid membaca sekurang-kurangnya dua perenggan dengan jelas dan mencatat sekurang-kurangnya tiga maklumat penting daripada teks.',
      induction:'Guru memaparkan tajuk dan beberapa kata kunci daripada petikan. Murid meramal isi sebelum membaca.',
      bbm:['Buku Teks m/s 28','peta perenggan','penanda bacaan'],
      support:[step('y3u5-28-s','Baca Frasa Kunci','Murid membaca frasa penting secara berpandu sebelum membaca perenggan penuh.','BT m/s 28','Echo Reading')],
      core:[step('y3u5-28-c','Perenggan kepada Maklumat','Pasangan membaca perenggan bergilir dan mencatat satu maklumat penting bagi setiap perenggan pada peta grafik.','BT m/s 28','Paired Reading')],
      challenge:[step('y3u5-28-h','Rumusan Tiga Ayat','Murid merumuskan isi petikan dalam tiga ayat berdasarkan catatan perenggan.','peta perenggan','Summarising')],
      close:'Murid menyatakan satu maklumat penting dan perenggan tempat maklumat itu ditemukan.'
    },
    premis_makanan:{
      title:'Premis Makanan Pilihan Anda',
      objective:p=>`Pada akhir PdP, murid dapat membina dan menulis satu perenggan sekurang-kurangnya lima ayat berdasarkan maklumat pemilihan premis makanan pada ${p}.`,
      criteria:'Perenggan mengandungi idea utama dan sekurang-kurangnya empat maklumat sokongan yang bersumber daripada bahan.',
      induction:'Guru memaparkan beberapa ciri premis daripada bahan dan murid mengelaskan kepada “pengusaha”, “makanan”, “peralatan” atau “kemudahan”.',
      bbm:['Buku Teks m/s 29','kad ciri','peta perenggan'],
      support:[step('y3u5-29-s','Kelompok Maklumat','Murid mengelaskan frasa sumber mengikut kategori sebelum membina ayat.','kad ciri','Information Sort')],
      core:[step('y3u5-29-c','Perenggan Premis Bersih','Murid menulis perenggan berpandukan bahan dengan ayat topik, isi sokongan dan ayat penutup.','BT m/s 29','Guided Paragraph')],
      challenge:[step('y3u5-29-h','Semak Bukti Sumber','Murid menandakan setiap ayat perenggan kepada maklumat asal yang menyokongnya dan membaiki ayat yang tidak bersumber.','BT m/s 29','Peer Editing')],
      close:'Murid membaca ayat topik dan satu ayat sokongan daripada perenggan.'
    },
    jagalah_kebersihan:{
      title:'Jagalah Kebersihan',
      objective:p=>`Pada akhir PdP, murid dapat bercerita berdasarkan ${p} dengan menggunakan sekurang-kurangnya empat bandingan semacam secara sesuai dan santun.`,
      criteria:'Murid menggunakan bandingan semacam mengikut konteks cerita dan menerangkan sekurang-kurangnya dua maksudnya.',
      induction:'Guru memaparkan dua bandingan semacam daripada halaman tanpa konteks lengkap. Murid meneka sifat yang dibandingkan.',
      bbm:['Buku Teks m/s 30','kad bandingan semacam','kad urutan cerita'],
      support:[step('y3u5-30-s','Padan Bandingan–Maksud','Murid memadankan beberapa bandingan semacam dengan maksudnya sebelum bercerita.','kad bandingan','Matching')],
      core:[step('y3u5-30-c','Cerita Raja Hama','Kumpulan menyusun urutan peristiwa dan bercerita dengan menggunakan bandingan semacam yang terdapat dalam bahan, tanpa menyalin keseluruhan teks.','BT m/s 30','Storytelling')],
      challenge:[step('y3u5-30-h','Bukti Gaya Bahasa','Murid memilih dua bandingan semacam dan menerangkan kesannya terhadap gambaran watak atau suasana.','BT m/s 30','Evidence Talk')],
      close:'Murid menyebut satu bandingan semacam dan maksudnya dalam konteks.'
    },
    dapur_bersih_explore:{
      title:'Dapur Bersih',
      objective:p=>`Pada akhir PdP, murid dapat mengenal pasti dan menggunakan sekurang-kurangnya lima kata adjektif pancaindera berdasarkan ${p}.`,
      criteria:'Murid mengelaskan kata adjektif mengikut deria yang sesuai dan membina sekurang-kurangnya tiga ayat berdasarkan situasi dapur.',
      induction:'Guru memaparkan label deria pandang, dengar, sentuh, bau dan rasa. Murid memadankan contoh bahasa yang selamat daripada bahan.',
      bbm:['Buku Teks m/s 31','kad deria','kad kata adjektif'],
      support:[step('y3u5-31-s','Sort Pancaindera','Murid mengelaskan kata seperti cantik, busuk, tengik, licin atau kesat mengikut deria yang berkaitan.','kad kata','Word Sort')],
      core:[step('y3u5-31-c','Ayat Dapur Bersih','Pasangan melengkapkan dan membina ayat berdasarkan gambar dapur menggunakan kata adjektif pancaindera. Tiada aktiviti merasa bahan dijalankan.','BT m/s 31','Pair Grammar')],
      challenge:[step('y3u5-31-h','Banding Dua Keadaan','Murid membina dua ayat yang membandingkan keadaan dapur bersih dan kurang terurus menggunakan kata adjektif pancaindera.','BT m/s 31','Compare-Contrast')],
      close:'Murid menyebut satu kata adjektif pancaindera dan deria yang berkaitan.'
    },
    cegah_lalat:{
      title:'Cegah Lalat',
      objective:p=>`Pada akhir PdP, murid dapat mengenal pasti dan menggunakan sekurang-kurangnya lima kata hubung daripada ${p} untuk membina ayat majmuk yang tepat.`,
      criteria:'Murid menggabungkan sekurang-kurangnya lima pasangan ayat menggunakan kata hubung yang sesuai seperti kerana, lalu, dan atau untuk.',
      induction:'Guru memaparkan dua ayat tunggal dan meminta murid memilih kata hubung yang sesuai untuk menggabungkannya.',
      bbm:['Buku Teks m/s 32','kad kata hubung','jalur ayat'],
      support:[step('y3u5-32-s','Jambatan Kata Hubung','Murid memilih kata hubung untuk menyambungkan dua jalur ayat yang diberikan.','jalur ayat','Sentence Linking')],
      core:[step('y3u5-32-c','Gabung Ayat Cegah Lalat','Pasangan mengenal pasti kata hubung dalam bahan dan membina ayat majmuk berdasarkan maklumat halaman. Aktiviti hanya menggunakan teks/gambar; tiada nyalaan lilin atau api terbuka digunakan.','BT m/s 32','Pair Grammar')],
      challenge:[step('y3u5-32-h','Tukar Kata Hubung','Murid menguji kata hubung alternatif dan menjelaskan sama ada maksud ayat kekal atau berubah.','BT m/s 32','Language Reasoning')],
      close:'Murid menyebut satu kata hubung dan fungsi hubungan yang dibawanya.'
    },
    dapur_bersih_apply:{
      title:'Dapur Bersih — Aplikasi',
      objective:p=>`Pada akhir PdP, murid dapat menggunakan kata adjektif pancaindera daripada ${p} dalam sekurang-kurangnya lima ayat baharu secara lebih kendiri.`,
      criteria:'Murid menggunakan sekurang-kurangnya empat kata adjektif pancaindera dengan deria dan konteks yang betul.',
      induction:'Murid mengingat kembali lima kategori pancaindera tanpa melihat nota sesi terdahulu.',
      bbm:['Buku Teks m/s 31','BA yang dirujuk RPT','kad semak'],
      support:[step('y3u5-31a-s','Lengkap Ayat','Murid melengkapkan ayat dengan pilihan kata adjektif yang disediakan.','BT m/s 31','Guided Practice')],
      core:[step('y3u5-31a-c','Aplikasi Pancaindera','Murid melaksanakan latihan aplikasi dan menyemak setiap kata adjektif kepada deria yang sesuai bersama pasangan. Tiada aktiviti merasa bahan dijalankan.','BT m/s 31; BA','Peer Check')],
      challenge:[step('y3u5-31a-h','Mini Deskripsi','Murid menulis deskripsi ringkas empat ayat tentang ruang bersih menggunakan sekurang-kurangnya tiga jenis pancaindera.','kad semak','Transfer Writing')],
      close:'Murid menilai satu ayat sendiri: kata adjektif, deria dan konteks semuanya tepat atau perlu dibaiki.'
    },
    aromaterapi:{
      title:'Aromaterapi',
      objective:p=>`Pada akhir PdP, murid dapat mendengar, mentafsir dan memberikan respons terhadap sekurang-kurangnya empat soalan bertumpu berdasarkan maklumat pada ${p}.`,
      criteria:'Murid menjawab soalan tentang maksud, cara yang dinyatakan dalam teks dan maklumat kesan aromaterapi dengan jawapan yang bersumber daripada bahan.',
      induction:'Guru memaparkan tajuk dan kata kunci minyak pati, tumbuhan dan rawatan. Murid meramal jenis maklumat yang perlu dicari.',
      bbm:['Buku Teks m/s 33','BA yang dirujuk RPT','kad soalan'],
      support:[step('y3u6-33-s','Cari Kata Kunci','Murid memadankan soalan bertumpu dengan bahagian teks yang mengandungi jawapan.','BT m/s 33','Question-Text Match')],
      core:[step('y3u6-33-c','Jawab Berdasarkan Teks','Pasangan mendengar soalan dan memberikan jawapan lengkap berdasarkan maklumat pada halaman. Bahan digunakan sebagai latihan bahasa/pemahaman, bukan nasihat rawatan perubatan.','BT m/s 33','Pair Response')],
      challenge:[step('y3u6-33-h','Bukti Jawapan','Murid menunjukkan frasa sumber yang menyokong dua jawapan mereka.','BT m/s 33','Evidence Talk')],
      close:'Murid membezakan jawapan yang bersumber daripada teks dengan pendapat sendiri.'
    },
    yakin_boleh:{
      title:'Yakin Boleh',
      objective:p=>`Pada akhir PdP, murid dapat membaca petikan ${p} dengan sebutan dan intonasi yang sesuai serta menyatakan sekurang-kurangnya tiga maklumat penting.`,
      criteria:'Murid membaca petikan dengan jelas dan mengenal pasti sekurang-kurangnya tiga idea berkaitan keyakinan diri daripada bahan.',
      induction:'Guru memaparkan beberapa ungkapan positif ringkas dan murid mengenal pasti tema umum tanpa menyalin keseluruhan petikan.',
      bbm:['Buku Teks m/s 34','peta idea','penanda bacaan'],
      support:[step('y3u6-34-s','Baca Frasa Positif','Murid membaca frasa terpilih secara berpandu sebelum membaca perenggan.','BT m/s 34','Echo Reading')],
      core:[step('y3u6-34-c','Perenggan kepada Idea','Pasangan membaca petikan secara bergilir dan mencatat idea penting tentang percakapan positif, penghargaan kendiri dan keyakinan.','BT m/s 34','Paired Reading')],
      challenge:[step('y3u6-34-h','Rumusan Sumber','Murid menghasilkan rumusan dua ayat menggunakan maklumat daripada petikan sahaja.','peta idea','Summarising')],
      close:'Murid menyatakan satu idea utama daripada bahan dengan kata sendiri.'
    },
    elakkan_kuman:{
      title:'Elakkan Kuman',
      objective:p=>`Pada akhir PdP, murid dapat menghasilkan jawapan pemahaman bagi sekurang-kurangnya lima soalan bertumpu berdasarkan ${p}.`,
      criteria:'Murid menjawab dengan maklumat tepat daripada bahan dan menunjukkan bukti teks bagi sekurang-kurangnya tiga jawapan.',
      induction:'Guru memaparkan empat kategori maklumat: makanan, minuman, batuk/bersin dan gigitan. Murid meramal kategori jawapan yang akan dicari.',
      bbm:['Buku Teks m/s 35','BA yang dirujuk RPT','jadual bukti'],
      support:[step('y3u6-35-s','Soalan kepada Bahagian','Murid memadankan soalan dengan bahagian poster yang sesuai sebelum menulis jawapan.','BT m/s 35','Guided Comprehension')],
      core:[step('y3u6-35-c','Jawapan + Bukti','Murid menjawab soalan bertumpu dan menyalin hanya kata/frasa bukti yang perlu, bukan keseluruhan poster. Aktiviti kekal sebagai pemahaman bahasa, bukan simulasi rawatan.','BT m/s 35','Evidence Writing')],
      challenge:[step('y3u6-35-h','Semak Ketepatan','Pasangan bertukar jawapan dan menyemak sama ada setiap jawapan benar-benar disokong oleh bahan.','jadual bukti','Peer Assessment')],
      close:'Murid membaca satu jawapan dan menunjukkan bukti yang menyokongnya.'
    },
    kembara_sihat:{
      title:'Kembara Sihat',
      objective:p=>`Pada akhir PdP, murid dapat mengenal pasti dan menggunakan sekurang-kurangnya enam kata arah berdasarkan laluan pada ${p}.`,
      criteria:'Murid menggunakan kata arah seperti hadapan, kiri, kanan, hujung, utara, atas/bawah atau tengah mengikut konteks laluan.',
      induction:'Guru melukis laluan mudah tiga simpang di papan. Murid memberi arahan menggunakan kata arah.',
      bbm:['Buku Teks m/s 37','peta laluan','kad kata arah'],
      support:[step('y3u6-37-s','Padan Arah','Murid memadankan kata arah kepada anak panah atau kedudukan pada peta.','peta laluan','Visual Matching')],
      core:[step('y3u6-37-c','Jejak Laluan Kembara','Pasangan melengkapkan arahan laluan berdasarkan peta sumber menggunakan kata arah yang tepat.','BT m/s 37','Map Talk')],
      challenge:[step('y3u6-37-h','Arahan Balik','Murid menghasilkan arahan perjalanan balik menggunakan titik rujukan yang sama dengan kata arah yang sesuai.','peta laluan','Spatial Reasoning')],
      close:'Guru menunjuk satu lokasi; murid memberi satu arahan arah yang tepat.'
    },
    gejala_taun:{
      title:'Gejala Taun',
      objective:p=>`Pada akhir PdP, murid dapat mendengar, mentafsir dan memberikan respons terhadap sekurang-kurangnya lima soalan bertumpu berdasarkan ${p}.`,
      criteria:'Murid menjawab soalan tentang punca, kawasan berisiko, tanda dan langkah pencegahan sebagaimana dinyatakan dalam bahan.',
      induction:'Guru memaparkan tajuk dan kategori “punca – tanda – tindakan – pencegahan”. Murid meramal jenis maklumat yang akan didengar/dibaca.',
      bbm:['Buku Teks m/s 38','kad kategori','kad soalan'],
      support:[step('y3u6-38-s','Padan Soalan–Kategori','Murid memadankan setiap soalan kepada kategori maklumat sebelum menjawab.','kad soalan','Question Sort')],
      core:[step('y3u6-38-c','Respons Berdasarkan Sumber','Pasangan memberikan respons lisan berdasarkan teks yang disediakan. Aktiviti ialah pemahaman bahasa; murid tidak membuat diagnosis atau menyediakan rawatan sendiri.','BT m/s 38','Pair Response')],
      challenge:[step('y3u6-38-h','Bukti Respons','Murid menunjukkan bahagian sumber yang menyokong dua respons dan membezakan fakta sumber daripada andaian.','BT m/s 38','Evidence Talk')],
      close:'Murid menyatakan satu maklumat pencegahan yang benar-benar terdapat dalam bahan.'
    },
    penilaian_tema2:{
      title:'Penilaian Tema 2',
      objective:p=>`Pada akhir PdP, murid dapat memberikan respons terhadap ayat suruhan/permintaan dan melengkapkan ayat dengan kata tugas berdasarkan ${p} dengan sekurang-kurangnya 80% ketepatan.`,
      criteria:'Murid memberikan respons lisan yang sesuai dan memilih kata hubung atau kata sendi nama yang tepat bagi sekurang-kurangnya lima item.',
      induction:'Guru memaparkan dua contoh tugasan daripada format penilaian: satu respons lisan dan satu isi tempat kosong.',
      bbm:['Buku Teks m/s 39','kad respons','kad kata tugas'],
      support:[step('y3u6-39-s','Dua Stesen Penilaian','Murid mencuba satu item respons dan satu item kata tugas dengan petunjuk pilihan.','BT m/s 39','Station Practice')],
      core:[step('y3u6-39-c','Semak dan Betulkan','Murid melengkapkan item penilaian, kemudian menyemak jawapan secara berpasangan dengan alasan tatabahasa ringkas.','BT m/s 39','Peer Check')],
      challenge:[step('y3u6-39-h','Jelaskan Pilihan Kata','Murid memilih tiga jawapan kata tugas dan menerangkan fungsi kata yang digunakan.','BT m/s 39','Grammar Reasoning')],
      close:'Murid menyatakan satu perkara yang sudah dikuasai dan satu perkara yang perlu dibaiki.'
    },
    hari_sukan_negara:{
      title:'Bacaan Luas — Hari Sukan Negara',
      objective:p=>`Pada akhir PdP, murid dapat membaca petikan ${p} dengan sebutan dan intonasi yang sesuai serta merumuskan sekurang-kurangnya tiga tujuan atau manfaat yang dinyatakan.`,
      criteria:'Murid membaca sekurang-kurangnya satu perenggan dengan jelas dan menghasilkan rumusan berdasarkan sekurang-kurangnya tiga fakta daripada petikan.',
      induction:'Guru memaparkan tajuk “Hari Sukan Negara”. Murid menyenaraikan perkara yang mereka jangka akan ditemukan, kemudian menyemak jangkaan semasa membaca.',
      bbm:['Buku Teks m/s 40','peta idea','penanda bacaan'],
      support:[step('y3u6-40-s','Cari Fakta Utama','Murid menandakan fakta tentang masa sambutan, objektif dan aktiviti dengan bantuan kata kunci.','BT m/s 40','Guided Scanning')],
      core:[step('y3u6-40-c','Baca dan Rumus','Pasangan membaca perenggan secara bergilir dan melengkapkan peta “tujuan – aktiviti – manfaat”.','BT m/s 40','Paired Reading')],
      challenge:[step('y3u6-40-h','Rumusan 3 Fakta','Murid menghasilkan rumusan ringkas menggunakan tiga fakta yang dapat ditunjukkan semula dalam teks.','peta idea','Summarising')],
      close:'Murid menyatakan satu manfaat yang disebut dalam petikan dan bukti sumbernya.'
    }
  };

  function objectivePair(m){
    const c=C[mode(m)];
    return c?{objective:c.objective(pageLabel(m)),criteria:c.criteria}:null;
  }

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
      _runtime_bm_year3_units4_6_mode:md
    };
  }

  const originalEffective=window.effectiveRphLessonMap;
  if(typeof originalEffective==='function')window.effectiveRphLessonMap=function(map,...args){
    const out=originalEffective.call(this,map,...args);
    const reason=reviewReason(out);
    if(reason)return {...out,_runtime_bm_year3_source_review_required:true,_runtime_bm_year3_source_review_reason:reason};
    const pair=objectivePair(out);
    if(!pair)return out;
    return {...out,objective:pair.objective,success_criteria:pair.criteria,_runtime_bm_year3_source_blueprint:true,_runtime_bm_year3_units4_6_mode:mode(out)};
  };

  const originalPedagogy=window.buildSourceAwarePedagogy;
  if(typeof originalPedagogy==='function')window.buildSourceAwarePedagogy=function(map,ev,built){
    const out=blueprint(map);
    return out||originalPedagogy(map,ev,built);
  };

  window.bmYear3Units46SourceBlueprintMode=mode;
  window.bmYear3Units46SourceReviewReason=reviewReason;
  window.bmYear3Units46SourceBlueprint=blueprint;
})();