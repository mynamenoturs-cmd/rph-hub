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
    // Unit 1 — Keluarga Cergas
    '1.1.1@2|W2|S1':'suria_pagi',
    '2.1.1@3|W2|S2':'bantu_dapur',
    '3.1.1@4|W2|S3':'butang_kenangan',
    '4.1.1@5|W2|S4':'siapa_pantas',
    '5.1.1@6|W2|S5':'kenangan_indah_explore',
    '5.1.1@6|W3|S2':'kenangan_indah_apply',

    // Unit 2 — Kejayaan Keluarga
    '1.1.1@7|W3|S3':'kejayaan_bersama',
    '2.1.1@8|W3|S4':'kilang_batik',
    '3.2.1@9|W4|S1':'usaha_datuk_explore',
    '4.1.1@10|W4|S2':'mari_bersepakat',
    '5.1.1@11|W4|S3':'kita_boleh_explore',
    '5.1.1@11|W4|S4':'kita_boleh_apply',
    '5.1.1@12|W4|S5':'mari_cuba',
    '3.2.1@9|W5|S1':'usaha_datuk_apply',

    // Unit 3 — Kenangan Manis
    '1.1.1@13|W5|S3':'penghubung_kasih',
    '2.1.1@14|W5|S4':'kem_bestari',
    '3.2.1@15|W5|S5':'kenangan_kem',
    '5.1.2@16|W7|S1':'alangkah_seronok',
    '5.1.2@18|W7|S2':'taman_herba',
    '2.1.1@19|W7|S3':'pemulihan',
    '5.1.1@20|W7|S4':'pengayaan_kata_nama'
  };

  function mode(m){
    if(subjectKey(m)!=='bm'||year(m)!==3)return'';
    return ROUTES[routeKey(m)]||'';
  }

  const C={
    suria_pagi:{
      title:'Suria Pagi',
      objective:p=>`Pada akhir PdP, murid dapat mendengar, mengecam dan menyebut sekurang-kurangnya empat ayat tunggal daripada bahan ${p} dengan betul dan tepat.`,
      criteria:'Murid dapat membezakan ayat tunggal yang didengar dan menyebut semula sekurang-kurangnya empat ayat dengan sebutan jelas.',
      induction:'Guru memaparkan gambar suasana riadah pagi. Murid menyebut satu perkara yang dilihat menggunakan ayat tunggal.',
      bbm:['Buku Teks m/s 2','BA yang dirujuk RPT','kad ayat tunggal'],
      support:[step('y3u1-2-s','Dengar dan Pilih','Murid mendengar ayat guru lalu memilih kad ayat tunggal yang sepadan dengan maksud.','kad ayat','Listening Sort')],
      core:[step('y3u1-2-c','Jejak Ayat Suria','Pasangan mendengar dialog pada halaman, mengenal pasti ayat tunggal, kemudian menyebut semula ayat pilihan dengan sebutan yang tepat.','BT m/s 2','Think-Pair-Repeat')],
      challenge:[step('y3u1-2-h','Bina Ayat Tunggal','Murid menghasilkan dua ayat tunggal baharu tentang riadah pagi berdasarkan gambar tanpa menambah fakta yang bercanggah dengan sumber.','BT m/s 2','Language Transfer')],
      close:'Murid menyebut satu ayat tunggal dan menunjukkan subjek serta maklumat yang dinyatakan.'
    },
    bantu_dapur:{
      title:'Bantu-membantu di Dapur',
      objective:p=>`Pada akhir PdP, murid dapat membaca sekurang-kurangnya satu perenggan daripada ${p} dengan sebutan yang betul dan intonasi yang sesuai.`,
      criteria:'Murid membaca teks dengan sebutan jelas, jeda yang sesuai dan sekurang-kurangnya tiga frasa penting dapat dikenal pasti daripada perenggan yang dibaca.',
      induction:'Guru menunjukkan kata kunci seperti ikan, sayuran, vitamin dan peti sejuk. Murid meramal perkara yang berlaku dalam teks.',
      bbm:['Buku Teks m/s 3','kad frasa','penanda bacaan'],
      support:[step('y3u1-3-s','Bacaan Berpandu','Murid membaca frasa dan ayat pendek secara echo reading sebelum membaca perenggan.','BT m/s 3','Echo Reading')],
      core:[step('y3u1-3-c','Bacaan Berpasangan','Pasangan membaca perenggan secara bergilir, menandai jeda dan menyemak sebutan menggunakan teks sumber.','BT m/s 3','Paired Reading')],
      challenge:[step('y3u1-3-h','Baca dan Rumus','Murid membaca satu perenggan secara kendiri dan menyatakan satu maklumat utama daripada perenggan tersebut.','BT m/s 3','Independent Reading')],
      close:'Murid berkongsi satu frasa yang membantu mereka memahami isi perenggan.'
    },
    butang_kenangan:{
      title:'Butang Kenangan',
      objective:p=>`Pada akhir PdP, murid dapat menulis sekurang-kurangnya enam huruf pilihan daripada ${p} menggunakan tulisan berangkai dengan bentuk yang kemas dan boleh dibaca.`,
      criteria:'Murid mengekalkan bentuk huruf, sambungan dan ruang yang sesuai bagi sekurang-kurangnya enam huruf yang ditulis.',
      induction:'Guru menunjukkan dua contoh bentuk huruf biasa dan tulisan berangkai. Murid mencari perbezaan bentuk dan sambungan.',
      bbm:['Buku Teks m/s 4','lembaran garis tulisan','pensel'],
      support:[step('y3u1-4-s','Jejak Bentuk Huruf','Murid meneliti model huruf dan menulis semula huruf pilihan pada garis panduan yang disediakan.','BT m/s 4; lembaran garis','Guided Writing')],
      core:[step('y3u1-4-c','Galeri Huruf Berangkai','Murid memilih huruf daripada bahan, menulisnya dalam tulisan berangkai dan menyemak bentuk bersama pasangan.','BT m/s 4','Peer Check')],
      challenge:[step('y3u1-4-h','Rangka Nama Ringkas','Murid menggabungkan beberapa huruf yang telah dikuasai menjadi satu perkataan pendek menggunakan tulisan berangkai.','lembaran garis','Writing Transfer')],
      close:'Murid membulatkan satu huruf terbaik dan menyatakan ciri yang menjadikannya kemas.'
    },
    siapa_pantas:{
      title:'Siapa Pantas?',
      objective:p=>`Pada akhir PdP, murid dapat bercerita menggunakan sekurang-kurangnya tiga simpulan bahasa daripada ${p} dengan maksud yang sesuai.`,
      criteria:'Murid menggunakan simpulan bahasa seperti mengambil hati, hati waja atau besar hati dalam konteks cerita yang dapat difahami.',
      induction:'Guru memaparkan simpulan bahasa tanpa maksud. Murid meneka maksud melalui situasi pada gambar.',
      bbm:['Buku Teks m/s 5','kad simpulan bahasa','kad situasi'],
      support:[step('y3u1-5-s','Padan Simpulan Bahasa','Murid memadankan simpulan bahasa dengan maksud dan situasi yang sesuai.','kad simpulan bahasa','Matching')],
      core:[step('y3u1-5-c','Cerita Siapa Pantas','Pasangan menceritakan semula situasi persaingan membina bangunan dengan memasukkan sekurang-kurangnya tiga simpulan bahasa daripada halaman.','BT m/s 5','Pair Storytelling')],
      challenge:[step('y3u1-5-h','Bukti Konteks','Murid memilih satu simpulan bahasa dan menerangkan peristiwa dalam cerita yang membuktikan penggunaannya tepat.','BT m/s 5','Evidence Talk')],
      close:'Murid menyebut satu simpulan bahasa dan maksudnya dengan kata sendiri.'
    },
    kenangan_indah_explore:{
      title:'Kenangan Indah semasa Bercuti',
      objective:p=>`Pada akhir PdP, murid dapat mengenal pasti dan mengelaskan sekurang-kurangnya lapan kata nama am dan kata nama khas daripada ${p} dengan tepat.`,
      criteria:'Murid mengelaskan contoh nama umum dan nama khusus dengan sekurang-kurangnya lapan jawapan tepat serta menggunakan huruf besar pada kata nama khas.',
      induction:'Guru memaparkan pasangan “masjid / Masjid Sultan Abu Bakar” dan “negeri / Negeri Sembilan”. Murid menyatakan perbezaannya.',
      bbm:['Buku Teks m/s 6','kad kata nama','jadual dua lajur'],
      support:[step('y3u1-6-s','Asingkan Dua Lajur','Murid mengasingkan kad kepada kata nama am dan kata nama khas menggunakan contoh berpandu.','kad kata','Word Sort')],
      core:[step('y3u1-6-c','Detektif Nama','Pasangan mencari kata nama pada bahan seperti kereta, masjid, negeri dan nama khusus yang tercetak, kemudian mengisi jadual klasifikasi.','BT m/s 6','Pair Search')],
      challenge:[step('y3u1-6-h','Ayat Berpasangan','Murid membina dua ayat yang masing-masing mengandungi satu kata nama am dan satu kata nama khas daripada sumber.','BT m/s 6','Sentence Transfer')],
      close:'Murid memberikan satu pasangan kata nama am dan kata nama khas yang berkaitan.'
    },
    kenangan_indah_apply:{
      title:'Kenangan Indah semasa Bercuti — Aplikasi',
      objective:p=>`Pada akhir PdP, murid dapat menggunakan kata nama am dan kata nama khas daripada ${p} dalam sekurang-kurangnya empat ayat yang betul.`,
      criteria:'Murid membina empat ayat dengan penggunaan huruf besar dan pemilihan kata nama yang sesuai.',
      induction:'Murid mengingat kembali satu kata nama am dan satu kata nama khas daripada sesi sebelumnya.',
      bbm:['Buku Teks m/s 6','lembaran aplikasi','kad semak'],
      support:[step('y3u1-6a-s','Lengkap Ayat','Murid melengkapkan rangka ayat menggunakan pilihan kata nama daripada sumber.','kad pilihan','Guided Writing')],
      core:[step('y3u1-6a-c','Ayat Kenangan','Murid membina empat ayat berdasarkan bahan dan melakukan peer check huruf besar pada kata nama khas.','BT m/s 6','Peer Editing')],
      challenge:[step('y3u1-6a-h','Perenggan Mini','Murid menggabungkan tiga ayat menjadi perenggan ringkas tanpa menambah fakta luar sumber.','BT m/s 6','Mini Writing')],
      close:'Murid menyemak satu ayat rakan dan membetulkan penggunaan kata nama jika perlu.'
    },
    kejayaan_bersama:{
      title:'Kejayaan Kita Bersama',
      objective:p=>`Pada akhir PdP, murid dapat mendengar, mengecam dan menyebut sekurang-kurangnya empat ayat majmuk daripada ${p} dengan tepat.`,
      criteria:'Murid mengenal pasti ayat majmuk yang menggabungkan dua maklumat dan menyebutnya semula dengan sebutan jelas.',
      induction:'Guru menyebut dua ayat tunggal kemudian satu ayat gabungan. Murid menentukan ayat yang mengandungi lebih daripada satu maklumat.',
      bbm:['Buku Teks m/s 7','BA m/s 7','kad ayat'],
      support:[step('y3u2-7-s','Cantum Dua Maklumat','Murid mencantum dua jalur maklumat mudah menjadi satu ayat majmuk dengan bimbingan.','jalur ayat','Sentence Combining')],
      core:[step('y3u2-7-c','Dengar dan Ulang','Pasangan mendengar dialog keluarga di kedai borong, mengesan ayat majmuk dan menyebut semula ayat pilihan.','BT m/s 7','Think-Pair-Repeat')],
      challenge:[step('y3u2-7-h','Hurai Ayat Majmuk','Murid memecahkan satu ayat majmuk kepada dua maklumat asal dan menerangkan hubungannya.','BT m/s 7','Language Reasoning')],
      close:'Murid menyebut satu ayat majmuk tentang kerjasama keluarga.'
    },
    kilang_batik:{
      title:'Kilang Batik Nenek',
      objective:p=>`Pada akhir PdP, murid dapat membaca sekurang-kurangnya dua perenggan daripada ${p} dengan sebutan yang betul dan intonasi yang sesuai.`,
      criteria:'Murid membaca dengan jelas, menggunakan jeda yang sesuai dan dapat menyatakan satu maklumat bagi setiap perenggan yang dibaca.',
      induction:'Guru memaparkan kata kunci kilang batik, pelanggan, promosi dan kerjasama. Murid meramal isi petikan.',
      bbm:['Buku Teks m/s 8','kad perenggan','penanda jeda'],
      support:[step('y3u2-8-s','Bacaan Bertanda','Murid membaca perenggan yang telah ditandai jedanya oleh guru.','BT m/s 8','Guided Reading')],
      core:[step('y3u2-8-c','Jigsaw Perenggan','Kumpulan membaca perenggan berbeza, menyemak sebutan dan berkongsi satu maklumat daripada perenggan masing-masing.','BT m/s 8','Jigsaw Reading')],
      challenge:[step('y3u2-8-h','Baca dengan Ekspresi','Murid membaca satu perenggan secara kendiri dengan intonasi yang sesuai dan membuat rumusan satu ayat.','BT m/s 8','Independent Reading')],
      close:'Setiap kumpulan menyatakan satu tindakan keluarga yang membantu perniagaan nenek.'
    },
    usaha_datuk_explore:{
      title:'Usaha Gigih Datuk',
      objective:p=>`Pada akhir PdP, murid dapat membina dan menulis sekurang-kurangnya empat ayat berdasarkan frasa dan gambar pada ${p}.`,
      criteria:'Murid menghasilkan empat ayat lengkap yang sepadan dengan frasa/gambar sumber dan menggunakan struktur ayat yang dapat difahami.',
      induction:'Guru memaparkan satu gambar sumber tanpa ayat. Murid mencadangkan kata kerja dan frasa yang sesuai berdasarkan apa yang benar-benar dilihat.',
      bbm:['Buku Teks m/s 9','BA m/s 9','jalur frasa','gambar sumber'],
      support:[step('y3u2-9-s','Susun Frasa ke Ayat','Murid menyusun subjek, kata kerja dan frasa pelengkap yang diberikan untuk membina ayat berdasarkan gambar.','jalur frasa','Sentence Scaffold')],
      core:[step('y3u2-9-c','Ayat Berdasarkan Gambar','Murid meneliti gambar dan frasa pada halaman lalu membina sekurang-kurangnya empat ayat yang sepadan.','BT m/s 9','Picture-to-Sentence')],
      challenge:[step('y3u2-9-h','Ayat Lebih Lengkap','Murid menambah keterangan yang masih dapat dibuktikan melalui gambar tanpa mereka fakta baharu.','BT m/s 9','Evidence Writing')],
      close:'Murid membaca satu ayat dan menunjukkan bahagian gambar/frasa yang menjadi bukti.'
    },
    usaha_datuk_apply:{
      title:'Usaha Gigih Datuk — Aplikasi',
      objective:p=>`Pada akhir PdP, murid dapat memurnikan dan menulis semula sekurang-kurangnya empat ayat berdasarkan ${p} dan latihan aplikasi RPT dengan lebih tepat.`,
      criteria:'Murid membaiki sekurang-kurangnya dua aspek pada ayat terdahulu seperti susunan, pemilihan kata atau tanda baca.',
      induction:'Murid membandingkan satu ayat asas dengan satu ayat yang lebih lengkap tetapi masih berpandukan gambar.',
      bbm:['Buku Teks m/s 9','BA m/s 9','kad semak ayat'],
      support:[step('y3u2-9a-s','Semak Tiga Unsur','Murid menyemak sama ada ayat mempunyai siapa/apa, tindakan dan maklumat pelengkap.','kad semak','Guided Editing')],
      core:[step('y3u2-9a-c','Baiki Ayat Datuk','Murid menggunakan latihan aplikasi untuk membaiki ayat dan bertukar hasil dengan pasangan untuk semakan.','BT m/s 9; BA m/s 9','Peer Editing')],
      challenge:[step('y3u2-9a-h','Justifikasi Ayat','Murid menerangkan mengapa satu ayatnya paling tepat berdasarkan bukti pada gambar/frasa.','BT m/s 9','Evidence Talk')],
      close:'Murid melengkapkan refleksi: “Ayat saya lebih baik kerana saya membetulkan ___.”',
      sourceNote:'RPT memaparkan +PKJR pada salah satu slot Usaha Gigih Datuk. Blueprint ini hanya menggunakan sumber BM m/s 9; kandungan PKJR tidak direka tanpa modul PKJR yang disahkan.'
    },
    mari_bersepakat:{
      title:'Mari Bersepakat',
      objective:p=>`Pada akhir PdP, murid dapat bercerita menggunakan sekurang-kurangnya tiga simpulan bahasa daripada ${p} dengan gaya yang santun dan maksud yang tepat.`,
      criteria:'Murid menggunakan simpulan bahasa seperti titik peluh, mandi peluh, cari jalan atau bulat hati dalam urutan cerita yang dapat difahami.',
      induction:'Guru menunjukkan empat simpulan bahasa dan empat gambar situasi. Murid membuat padanan awal.',
      bbm:['Buku Teks m/s 10','kad simpulan bahasa','kad urutan cerita'],
      support:[step('y3u2-10-s','Padan Maksud','Murid memadankan simpulan bahasa dengan maksud sebelum bercerita.','kad simpulan bahasa','Matching')],
      core:[step('y3u2-10-c','Cerita Amin dan Arif','Pasangan menyusun peristiwa kebun lobak dan masalah kereta sorong lalu bercerita menggunakan sekurang-kurangnya tiga simpulan bahasa.','BT m/s 10','Pair Storytelling')],
      challenge:[step('y3u2-10-h','Simpulan Bahasa Berbukti','Murid memilih satu simpulan bahasa dan menerangkan peristiwa yang menjadikannya sesuai.','BT m/s 10','Evidence Talk')],
      close:'Murid menyebut satu simpulan bahasa dan maksudnya dengan kata sendiri.'
    },
    kita_boleh_explore:{
      title:'Kita Boleh!',
      objective:p=>`Pada akhir PdP, murid dapat mengenal pasti dan menggunakan sekurang-kurangnya enam kata ganti nama daripada ${p} mengikut konteks.`,
      criteria:'Murid memilih kata ganti nama diri atau kata ganti nama tunjuk yang sesuai bagi sekurang-kurangnya enam ayat/dialog.',
      induction:'Guru memaparkan “saya, kamu, mereka, ini, itu”. Murid mengelaskan kata mengikut orang atau benda yang dirujuk.',
      bbm:['Buku Teks m/s 11','kad kata ganti nama','jadual rujukan'],
      support:[step('y3u2-11-s','Siapa Dirujuk?','Murid memadankan kata ganti nama dengan watak atau benda yang dirujuk dalam dialog.','kad kata','Matching')],
      core:[step('y3u2-11-c','Lengkap Dialog Model','Murid melengkapkan ayat/dialog berdasarkan situasi model bangunan dengan kata ganti nama yang sesuai.','BT m/s 11','Pair Grammar')],
      challenge:[step('y3u2-11-h','Tukar Rujukan','Murid menukar watak atau benda yang dirujuk dan memilih kata ganti nama baharu yang tepat.','BT m/s 11','Language Transfer')],
      close:'Guru menyebut satu rujukan; murid memilih kata ganti nama yang sesuai.'
    },
    kita_boleh_apply:{
      title:'Kita Boleh! — Aplikasi',
      objective:p=>`Pada akhir PdP, murid dapat menggunakan kata ganti nama daripada ${p} dalam sekurang-kurangnya enam ayat aplikasi dengan tepat.`,
      criteria:'Murid membina atau melengkapkan enam ayat dengan rujukan kata ganti nama yang jelas dan konsisten.',
      induction:'Murid membetulkan dua ayat yang menggunakan kata ganti nama tidak sepadan dengan rujukan.',
      bbm:['Buku Teks m/s 11','BA m/s 11–12','kad semak'],
      support:[step('y3u2-11a-s','Pilihan Terhad','Murid memilih kata ganti nama daripada bank kata untuk melengkapkan ayat aplikasi.','bank kata','Guided Grammar')],
      core:[step('y3u2-11a-c','Aplikasi Kata Ganti','Murid menyelesaikan latihan aplikasi dan menyemak rujukan setiap kata ganti nama bersama pasangan.','BT m/s 11; BA m/s 11–12','Peer Check')],
      challenge:[step('y3u2-11a-h','Dialog Baharu','Murid membina dialog ringkas menggunakan sekurang-kurangnya empat kata ganti nama yang berbeza.','BT m/s 11','Dialogue Transfer')],
      close:'Murid menerangkan satu kesalahan kata ganti nama yang berjaya dibetulkan.'
    },
    mari_cuba:{
      title:'Mari Cuba',
      objective:p=>`Pada akhir PdP, murid dapat memilih dan menggunakan sekurang-kurangnya lima penjodoh bilangan daripada ${p} mengikut benda yang dirujuk.`,
      criteria:'Murid menggunakan helai, bilah, batang, biji atau botol secara tepat dalam sekurang-kurangnya lima frasa/ayat.',
      induction:'Guru menunjukkan kad gambar kertas, pembaris, butang dan botol. Murid memilih penjodoh bilangan tanpa menggunakan objek tajam sebenar.',
      bbm:['Buku Teks m/s 12','kad gambar bahan','kad penjodoh bilangan'],
      support:[step('y3u2-12-s','Padan Gambar–Penjodoh','Murid memadankan kad gambar dengan penjodoh bilangan yang sesuai.','kad gambar','Matching')],
      core:[step('y3u2-12-c','Senarai Album','Murid membaca senarai bahan pada halaman dan membina frasa yang betul menggunakan penjodoh bilangan. Aktiviti menggunakan kad/gambar sahaja; murid tidak mengendalikan gunting atau jarum.','BT m/s 12','Pair Sort')],
      challenge:[step('y3u2-12-h','Ayat Konteks','Murid membina lima ayat ringkas menggunakan penjodoh bilangan yang berbeza.','BT m/s 12','Sentence Transfer')],
      close:'Guru menunjukkan satu gambar; murid mengangkat kad penjodoh bilangan yang sesuai.'
    },
    penghubung_kasih:{
      title:'Penghubung Kasih',
      objective:p=>`Pada akhir PdP, murid dapat mendengar dan mengenal pasti sekurang-kurangnya tiga ayat tunggal dan tiga ayat majmuk daripada ${p}.`,
      criteria:'Murid mengelaskan sekurang-kurangnya enam ayat dengan tepat dan memberikan satu sebab mudah bagi klasifikasinya.',
      induction:'Guru menyebut satu ayat tunggal dan satu ayat majmuk tentang buah-buahan. Murid mengangkat kad T atau M.',
      bbm:['Buku Teks m/s 13','BA m/s 15–16','kad T/M'],
      support:[step('y3u3-13-s','Kad T atau M','Murid mendengar ayat dan memilih kad tunggal atau majmuk dengan bimbingan kata hubung.','kad T/M','Listening Classification')],
      core:[step('y3u3-13-c','Jejak Ayat Penghubung','Pasangan mendengar bahan keluarga singgah membeli buah tangan, kemudian mengelaskan ayat yang didengar.','BT m/s 13','Think-Pair-Share')],
      challenge:[step('y3u3-13-h','Ubah Bentuk Ayat','Murid menggabungkan dua ayat tunggal menjadi satu ayat majmuk yang sesuai dengan konteks halaman.','BT m/s 13','Sentence Combining')],
      close:'Murid memberikan satu contoh ayat tunggal dan satu ayat majmuk.'
    },
    kem_bestari:{
      title:'Kem Bestari',
      objective:p=>`Pada akhir PdP, murid dapat membaca sekurang-kurangnya dua perenggan daripada ${p} dengan sebutan yang betul dan intonasi yang sesuai.`,
      criteria:'Murid membaca dengan lancar dan dapat menyatakan satu maklumat utama daripada setiap perenggan yang dibaca.',
      induction:'Guru memaparkan tajuk Kem Bestari dan tiga kata kunci: anak yatim, motivasi, sukaneka. Murid meramal isi berita.',
      bbm:['Buku Teks m/s 14','kad perenggan','penanda bacaan'],
      support:[step('y3u3-14-s','Bacaan Frasa','Murid berlatih frasa sukar sebelum membaca perenggan secara berpandu.','BT m/s 14','Echo Reading')],
      core:[step('y3u3-14-c','Jigsaw Berita','Kumpulan membaca bahagian petikan berlainan dan berkongsi satu fakta daripada bahagian masing-masing.','BT m/s 14','Jigsaw Reading')],
      challenge:[step('y3u3-14-h','Bacaan Pembaca Berita','Murid membaca satu perenggan dengan gaya pembaca berita dan merumuskan isi dalam satu ayat.','BT m/s 14','Performance Reading')],
      close:'Murid menyatakan tujuan Kem Bestari berdasarkan teks.'
    },
    kenangan_kem:{
      title:'Kenangan di Kem Bestari',
      objective:p=>`Pada akhir PdP, murid dapat membina dan menulis satu perenggan sekurang-kurangnya empat ayat berdasarkan frasa dan gambar pada ${p}.`,
      criteria:'Murid menghasilkan perenggan yang mempunyai urutan jelas dan sekurang-kurangnya empat ayat yang disokong oleh bahan sumber.',
      induction:'Guru memaparkan dua gambar sumber dan meminta murid menyusun satu frasa bagi setiap gambar.',
      bbm:['Buku Teks m/s 15','BA m/s 18','jalur frasa','gambar sumber'],
      support:[step('y3u3-15-s','Susun Urutan','Murid menyusun jalur frasa mengikut urutan sebelum membina ayat.','jalur frasa','Sequencing')],
      core:[step('y3u3-15-c','Perenggan Kenangan','Murid membina perenggan menggunakan frasa/gambar tentang pengalaman di Kem Bestari dan menyemak kesinambungan ayat bersama pasangan.','BT m/s 15','Pair Writing')],
      challenge:[step('y3u3-15-h','Perenggan Berbukti','Murid menambah satu ayat penutup yang masih selaras dengan pengalaman pada sumber tanpa mereka fakta luar.','BT m/s 15','Evidence Writing')],
      close:'Murid membaca ayat penutup dan menunjukkan frasa/gambar yang menyokongnya.',
      sourceNote:'RPT memaparkan +PKJR bagi Kenangan di Kem Bestari. Blueprint ini mengekalkan tugasan BM sahaja; kandungan PKJR tidak ditambah tanpa semakan modul PKJR berasingan.'
    },
    alangkah_seronok:{
      title:'Alangkah Seronoknya',
      objective:p=>`Pada akhir PdP, murid dapat mengenal pasti dan menggunakan sekurang-kurangnya enam kata kerja aktif transitif dan tak transitif daripada ${p} mengikut konteks.`,
      criteria:'Murid mengelaskan sekurang-kurangnya enam kata kerja kepada transitif/tak transitif dan membina sekurang-kurangnya empat ayat yang sesuai.',
      induction:'Guru memaparkan dua ayat mudah, satu memerlukan objek dan satu tidak. Murid mencari perbezaannya.',
      bbm:['Buku Teks m/s 16','kad kata kerja','jadual dua lajur'],
      support:[step('y3u3-16-s','Ada Objek atau Tidak?','Murid mengelaskan kata kerja seperti menolak, bermain, berlumba dan berasa dengan bantuan rangka ayat.','kad kata kerja','Grammar Sort')],
      core:[step('y3u3-16-c','Jejak Kata Kerja Aktif','Pasangan mencari kata kerja dalam bahan permainan gelek rim, mengelaskan jenisnya dan membina ayat berdasarkan gambar.','BT m/s 16','Pair Grammar')],
      challenge:[step('y3u3-16-h','Tukar Struktur','Murid memilih dua kata kerja dan menerangkan mengapa satu memerlukan objek manakala satu lagi tidak.','BT m/s 16','Grammar Reasoning')],
      close:'Guru menyebut satu kata kerja; murid tentukan transitif atau tak transitif dan beri sebab.'
    },
    taman_herba:{
      title:'Lawatan ke Taman Herba',
      objective:p=>`Pada akhir PdP, murid dapat mengenal pasti dan menggunakan sekurang-kurangnya empat kata kerja pasif daripada ${p} untuk membina ayat.`,
      criteria:'Murid membina sekurang-kurangnya empat ayat pasif yang mengekalkan objek, kata kerja pasif dan pelaku dengan susunan yang sesuai.',
      induction:'Guru memaparkan pasangan “Nasri mengutip daun” dan “Daun itu dikutip oleh Nasri”. Murid menyatakan perubahan yang berlaku.',
      bbm:['Buku Teks m/s 18','kad ayat aktif/pasif','gambar sumber'],
      support:[step('y3u3-18-s','Padan Aktif–Pasif','Murid memadankan ayat aktif dengan pasangan ayat pasifnya.','kad ayat','Matching')],
      core:[step('y3u3-18-c','Tukar kepada Pasif','Murid menggunakan kata seperti diberikan, dikutip, diambil dan dicatat untuk membina ayat berdasarkan gambar pada halaman.','BT m/s 18','Pair Grammar')],
      challenge:[step('y3u3-18-h','Terangkan Perubahan','Murid menukarkan dua ayat aktif kepada pasif dan menerangkan perubahan susunan pelaku/objek.','BT m/s 18','Grammar Reasoning')],
      close:'Murid membaca satu ayat pasif dan menunjukkan kata kerja pasifnya.'
    },
    pemulihan:{
      title:'Pemulihan',
      objective:p=>`Pada akhir PdP, murid dapat membaca petikan pada ${p} dengan sebutan yang betul dan intonasi yang sesuai.`,
      criteria:'Murid membaca sekurang-kurangnya satu perenggan dengan lancar dan menyatakan dua maklumat tepat tentang Nasri daripada petikan.',
      induction:'Guru memaparkan gambar anugerah tanpa teks. Murid meramal sebab seseorang murid menerima penghargaan.',
      bbm:['Buku Teks m/s 19','penanda jeda','kad fakta'],
      support:[step('y3u3-19-s','Bacaan Berpandu','Murid mengikuti bacaan guru bagi ayat sukar sebelum membaca sendiri.','BT m/s 19','Echo Reading')],
      core:[step('y3u3-19-c','Baca dan Cari Fakta','Pasangan membaca petikan, kemudian memilih dua fakta yang benar-benar terdapat dalam teks tentang Nasri.','BT m/s 19','Pair Reading')],
      challenge:[step('y3u3-19-h','Baca Kendiri','Murid membaca perenggan secara kendiri dengan jeda dan intonasi sesuai, kemudian membuat rumusan satu ayat.','BT m/s 19','Independent Reading')],
      close:'Murid menyatakan satu sebab kejayaan Nasri berdasarkan petikan.'
    },
    pengayaan_kata_nama:{
      title:'Pengayaan — Kata Nama',
      objective:p=>`Pada akhir PdP, murid dapat mengenal pasti sekurang-kurangnya lapan kata nama am dan kata nama khas daripada aktiviti ${p} serta membina ayat yang sesuai.`,
      criteria:'Murid mengelaskan sekurang-kurangnya lapan kata dengan tepat dan membina sekurang-kurangnya empat ayat menggunakan kata yang ditemukan.',
      induction:'Guru memaparkan contoh “ayah” dan “Comel”. Murid menentukan kata nama am atau khas dan memberi sebab.',
      bbm:['Buku Teks m/s 20','teka silang kata sumber','jadual kata nama'],
      support:[step('y3u3-20-s','Cari dan Asingkan','Murid mencari kata dalam teka silang kata dengan petunjuk warna dan memasukkannya ke dua lajur.','BT m/s 20','Word Hunt')],
      core:[step('y3u3-20-c','Teka Silang Kata Nama','Pasangan menyelesaikan pencarian kata nama am/khas, kemudian membina empat ayat menggunakan kata yang ditemukan.','BT m/s 20','Pair Puzzle')],
      challenge:[step('y3u3-20-h','Semak Huruf Besar','Murid menyemak penggunaan huruf besar bagi semua kata nama khas dan menerangkan dua pembetulan.','BT m/s 20','Peer Editing')],
      close:'Murid menyebut satu kata nama am dan satu kata nama khas yang ditemukan.'
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
    const out={
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
      diffSupport:'Tugasan sumber yang sama dengan model bahasa, pilihan terhad atau petunjuk visual.',
      diffCore:'Melaksanakan tugasan sebenar Buku Teks dengan hasil yang boleh disemak terus terhadap sumber.',
      diffChallenge:'Tugasan sumber yang sama secara lebih kendiri dengan alasan, bukti atau pemurnian tambahan.',
      diffSupportAct:c.support.map(x=>x.text).join(' '),
      diffCoreAct:c.core.map(x=>x.text).join(' '),
      diffChallengeAct:c.challenge.map(x=>x.text).join(' '),
      pbdEvidence:{method:'Pemerhatian + hasil lisan/bacaan/tulisan sumber',evidence:'Prestasi murid dinilai pada tugasan sebenar Buku Teks/RPT, bukan aktiviti generik.',criterion:pair.criteria},
      penutup:c.close,
      _runtime_bm_year3_source_blueprint:true,
      _runtime_bm_year3_units1_3_mode:md
    };
    if(c.sourceNote)out.sourceDiscrepancy=c.sourceNote;
    return out;
  }

  const originalEffective=window.effectiveRphLessonMap;
  if(typeof originalEffective==='function')window.effectiveRphLessonMap=function(map,...args){
    const out=originalEffective.call(this,map,...args);
    const pair=objectivePair(out);
    if(!pair)return out;
    return {...out,objective:pair.objective,success_criteria:pair.criteria,_runtime_bm_year3_source_blueprint:true,_runtime_bm_year3_units1_3_mode:mode(out)};
  };

  const originalPedagogy=window.buildSourceAwarePedagogy;
  if(typeof originalPedagogy==='function')window.buildSourceAwarePedagogy=function(map,ev,built){
    const out=blueprint(map);
    return out||originalPedagogy(map,ev,built);
  };

  window.bmYear3Units1To3BlueprintMode=mode;
  window.bmYear3Units1To3Blueprint=blueprint;
})();
