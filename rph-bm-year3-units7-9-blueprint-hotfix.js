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
    // Unit 7 — Keselamatan di Rumah
    '1.1.3@42|W13|S1':'jeriji_selamat',
    '2.1.1@43|W13|S2':'rumah_panjang',
    '3.2.2@44|W13|S3':'tutup_selamat',
    '4.1.1@45|W13|S4':'tumbuhan_berbahaya',
    '5.1.4@46|W13|S5':'waspada_explore',
    '5.1.4@46|W14|S5':'waspada_apply',

    // Unit 8 — Rekreasi Selamat
    '1.2.1@47|W15|S1':'berkuda',
    '2.2.1@48|W15|S2':'tembok_tiruan',
    '3.2.3@50|W15|S3':'tradisional_moden',
    '5.1.4@51|W15|S4':'usah_gentar',
    '5.1.4@52|W16|S1':'meneroka_gua',

    // Unit 9 — Alatan Keselamatan
    '1.2.2@53|W16|S2':'mangga_selamat',
    '2.2.1@54|W16|S3':'lampu_kecemasan',
    '3.2.4@55|W16|S4':'menampakkan_diri_explore',
    '4.2.1@56|W16|S5':'kamera_pintar',
    '5.1.4@57|W17|S1':'beringat',
    '3.2.4@55|W17|S2':'menampakkan_diri_apply',
    '5.1.4@58|W17|S5':'hati_hati_mengundur',
    '5.1.4@60|W18|S1':'pengayaan_kata_tugas'
  };

  const REVIEW_ONLY={
    '5.1.4@57|W17|S4':'Lesson Map bertajuk “Palam Pemasa” dan RPT turut merekod Palam Pemasa pada BT m/s 57, tetapi source evidence BT m/s 57 yang disimpan ialah “Beringat Sebelum Kena” (kata pemeri). Perlu audit halaman/sumber sebenar sebelum blueprint khusus Palam Pemasa dibina.'
  };

  function mode(m){if(subjectKey(m)!=='bm'||year(m)!==3)return'';return ROUTES[routeKey(m)]||''}
  function reviewReason(m){if(subjectKey(m)!=='bm'||year(m)!==3)return'';return REVIEW_ONLY[routeKey(m)]||''}

  const C={
    jeriji_selamat:{title:'Jeriji Tingkap yang Selamat',objective:p=>`Pada akhir PdP, murid dapat mendengar, mentafsir dan memberikan sekurang-kurangnya tiga respons terhadap soalan bercapah berdasarkan ${p}.`,criteria:'Murid memberikan jawapan beralasan tentang ciri jeriji yang selamat dengan sekurang-kurangnya dua bukti daripada bahan.',induction:'Guru memaparkan gambar jeriji biasa dan jeriji yang boleh dibuka dari dalam. Murid menyatakan perbezaan yang dapat dilihat.',bbm:['Buku Teks m/s 42','gambar jeriji','kad soalan'],support:[step('y3u7-42-s','Pilih Bukti','Murid memadankan soalan dengan bukti seperti boleh dibuka dari dalam dan sukar dibuka dari luar.','BT m/s 42','Guided Evidence')],core:[step('y3u7-42-c','Jawab dan Alaskan','Pasangan menjawab soalan bercapah tentang ciri jeriji selamat dengan alasan berdasarkan bahan. Aktiviti hanya analisis bahasa dan gambar; murid tidak mengendalikan jeriji sebenar.','BT m/s 42','Think-Pair-Share')],challenge:[step('y3u7-42-h','Nilai Pilihan','Murid membandingkan dua ciri dan menjelaskan ciri yang lebih penting berdasarkan konteks kecemasan dalam bahan.','BT m/s 42','Reasoning Talk')],close:'Murid menyatakan satu ciri jeriji selamat dan sebabnya.'},

    rumah_panjang:{title:'Keselamatan Rumah Panjang di Sarawak',objective:p=>`Pada akhir PdP, murid dapat membaca ayat tunggal dan ayat majmuk daripada ${p} dengan sebutan yang betul dan intonasi yang sesuai.`,criteria:'Murid membaca sekurang-kurangnya satu perenggan dengan jelas dan membezakan sekurang-kurangnya dua ayat tunggal daripada dua ayat majmuk.',induction:'Guru memaparkan gambar rumah panjang bertiang tinggi. Murid meramal sebab binaannya.',bbm:['Buku Teks m/s 43','kad ayat','penanda bacaan'],support:[step('y3u7-43-s','Tanda Jenis Ayat','Murid menandakan ayat tunggal dan ayat majmuk pada petikan terpilih sebelum membaca.','BT m/s 43','Guided Reading')],core:[step('y3u7-43-c','Bacaan Berpasangan','Pasangan membaca perenggan secara bergilir dengan sebutan dan intonasi sesuai, kemudian menyemak jenis ayat.','BT m/s 43','Paired Reading')],challenge:[step('y3u7-43-h','Baca dan Terangkan','Murid membaca satu ayat majmuk dan menerangkan dua maklumat yang digabungkan.','BT m/s 43','Language Reasoning')],close:'Murid membaca satu ayat pilihan dan menamakan jenisnya.'},

    tutup_selamat:{title:'Tutup supaya Selamat',objective:p=>`Pada akhir PdP, murid dapat menghasilkan sekurang-kurangnya empat jawapan pemahaman bercapah berdasarkan ${p} dengan bukti yang sesuai.`,criteria:'Murid menjawab soalan tentang bahaya longkang terbuka, sebab memasang penutup, ciri penutup selamat dan nilai murni dengan alasan yang berpandukan teks.',induction:'Guru menunjukkan gambar longkang terbuka dan bertutup. Murid menyatakan risiko yang dapat dikenal pasti daripada gambar.',bbm:['Buku Teks m/s 44','kad soalan','peta sebab-akibat'],support:[step('y3u7-44-s','Soalan dan Petunjuk','Murid memilih petunjuk teks yang sepadan dengan setiap soalan sebelum menulis jawapan.','BT m/s 44','Guided Comprehension')],core:[step('y3u7-44-c','Jawapan Berbukti','Murid menulis jawapan bercapah menggunakan pola jawapan + sebab + bukti daripada bahan. PKJR tidak ditambah kerana sumber PKJR berasingan tidak diperiksa dalam modul ini.','BT m/s 44','Evidence Writing')],challenge:[step('y3u7-44-h','Baiki Jawapan','Murid menambah baik satu jawapan dengan alasan yang lebih jelas tanpa menambah fakta luar sumber.','BT m/s 44','Peer Review')],close:'Murid membaca satu jawapan terbaik dan menunjukkan bukti yang digunakan.'},

    tumbuhan_berbahaya:{title:'Tumbuhan Berbahaya',objective:p=>`Pada akhir PdP, murid dapat bercerita berdasarkan ${p} dengan menggunakan sekurang-kurangnya tiga perumpamaan secara indah dan santun.`,criteria:'Murid menggunakan perumpamaan sumber seperti “seperti katak di bawah tempurung”, “seperti lipas kudung” atau “bagai aur dengan tebing” mengikut konteks cerita.',induction:'Guru memaparkan tiga perumpamaan dan tiga maksud ringkas. Murid memadankannya.',bbm:['Buku Teks m/s 45','kad perumpamaan','kad urutan cerita'],support:[step('y3u7-45-s','Padan Perumpamaan','Murid memadankan perumpamaan dengan maksud dan situasi yang sesuai.','kad perumpamaan','Matching')],core:[step('y3u7-45-c','Cerita Berurutan','Murid menyusun peristiwa Nabila dan keluarganya lalu bercerita dengan memasukkan perumpamaan yang sesuai. Fokus pada bahasa; murid tidak menyentuh atau mengendalikan tumbuhan yang dinyatakan berbahaya.','BT m/s 45','Storytelling')],challenge:[step('y3u7-45-h','Ganti dengan Tepat','Murid menggantikan satu perumpamaan dengan perumpamaan lain yang masih sesuai dan menjelaskan sebab.','BT m/s 45','Language Reasoning')],close:'Murid menyebut satu perumpamaan dan maksudnya.'},

    waspada_explore:{title:'Waspada Selalu',objective:p=>`Pada akhir PdP, murid dapat mengenal pasti fungsi dan menggunakan sekurang-kurangnya lima kata tanya berdasarkan ${p} dengan tepat.`,criteria:'Murid memadankan kata tanya seperti siapa, bila, berapa, apa, mengapa dan bagaimana dengan fungsi soalan yang betul.',induction:'Guru memaparkan enam kata tanya tanpa ayat. Murid meneka maklumat yang dicari oleh setiap kata.',bbm:['Buku Teks m/s 46','kad kata tanya','kad fungsi'],support:[step('y3u7-46a-s','Padan Kata Tanya','Murid memadankan kata tanya dengan fungsi: orang, masa, bilangan, perkara, sebab dan cara.','kad kata tanya','Matching')],core:[step('y3u7-46a-c','Bina Soalan Waspada','Pasangan membina soalan berdasarkan maklumat rak buku dalam teks menggunakan lima kata tanya berbeza.','BT m/s 46','Question Builder')],challenge:[step('y3u7-46a-h','Soalan Lebih Mendalam','Murid membina satu soalan “mengapa” atau “bagaimana” dan memberi jawapan berdasarkan bukti teks.','BT m/s 46','Reasoning Question')],close:'Guru menyebut satu fungsi; murid memilih kata tanya yang sesuai.'},

    waspada_apply:{title:'Waspada Selalu — Aplikasi',objective:p=>`Pada akhir PdP, murid dapat menggunakan sekurang-kurangnya enam kata tanya untuk membina dan menjawab soalan berdasarkan ${p} dengan tepat.`,criteria:'Murid menghasilkan set soalan pelbagai fungsi dan menjawabnya menggunakan maklumat sumber tanpa mengulang semua contoh sesi penerokaan.',induction:'Guru memaparkan satu jawapan daripada teks. Murid mencipta kata tanya yang sesuai untuk menghasilkan soalannya.',bbm:['Buku Teks m/s 46','lembaran soalan-jawapan','kad kata tanya'],support:[step('y3u7-46b-s','Jawapan Dahulu','Murid diberikan jawapan ringkas lalu memilih kata tanya sesuai untuk membina soalan.','lembaran soalan-jawapan','Scaffolded Questioning')],core:[step('y3u7-46b-c','Rakan Penyoal','Pasangan saling membina dan menjawab soalan berbeza berdasarkan halaman, kemudian menyemak sama ada jawapan mempunyai bukti.','BT m/s 46','Peer Questioning')],challenge:[step('y3u7-46b-h','Soal Jawab Kendiri','Murid menghasilkan enam soalan yang meliputi fungsi berbeza dan menulis jawapan ringkas yang tepat.','BT m/s 46','Independent Application')],close:'Murid berkongsi satu pasangan soalan-jawapan yang paling tepat.'},

    berkuda:{title:'Seronoknya Berkuda',objective:p=>`Pada akhir PdP, murid dapat bertutur untuk menjelaskan dan menilai sekurang-kurangnya tiga maklumat keselamatan daripada ${p} secara bertatasusila.`,criteria:'Murid menjelaskan fungsi topi keledar, tali kekang, pelana atau kasut but berdasarkan poster dan memberikan satu penilaian beralasan.',induction:'Guru memaparkan poster peralatan dalam bahan. Murid menamakan peralatan yang dapat dikenal pasti.',bbm:['Buku Teks m/s 47','BA m/s 53','poster peralatan'],support:[step('y3u8-47-s','Padan Alat–Fungsi','Murid memadankan peralatan dengan fungsi yang dinyatakan pada poster.','BT m/s 47','Matching')],core:[step('y3u8-47-c','Jelaskan Poster','Pasangan menerangkan tiga peralatan dan menilai pilihan yang sesuai berdasarkan gambar. Aktiviti kekal sebagai analisis bahasa/poster; murid tidak melakukan aktiviti menunggang.','BT m/s 47','Pair Explain')],challenge:[step('y3u8-47-h','Nilai Keutamaan','Murid memilih satu maklumat keselamatan paling penting dalam poster dan memberikan alasan berdasarkan sumber.','BT m/s 47','Reasoning Talk')],close:'Murid menyatakan satu alat dan fungsinya.'},

    tembok_tiruan:{title:'Memanjat Tembok Tiruan',objective:p=>`Pada akhir PdP, murid dapat membaca, memahami dan mengecam sekurang-kurangnya lima kosa kata atau idea utama daripada ${p}.`,criteria:'Murid mengenal pasti peralatan keselamatan dan idea utama petikan menggunakan bukti teks yang tepat.',induction:'Guru memaparkan beberapa istilah daripada petikan seperti tali keselamatan, topi keselamatan dan abah-abah. Murid meramal kategori istilah.',bbm:['Buku Teks m/s 48–49','BA m/s 54–55','kad kosa kata'],support:[step('y3u8-48-s','Kosa Kata Selamat','Murid memadankan istilah petikan dengan fungsi yang dinyatakan dalam teks.','BT m/s 48–49','Vocabulary Match')],core:[step('y3u8-48-c','Baca dan Jejak Idea','Pasangan membaca petikan, menandakan kosa kata penting dan merumus idea utama tentang keselamatan aktiviti. Aktiviti kelas hanya membaca dan menganalisis bahan; murid tidak memanjat atau mensimulasikan sukan lasak.','BT m/s 48–49','Close Reading')],challenge:[step('y3u8-48-h','Rumusan Bukti','Murid menulis dua ayat rumusan dengan sekurang-kurangnya dua bukti daripada petikan.','BT m/s 48–49','Evidence Summary')],close:'Murid menyebut satu kosa kata dan maksudnya dalam konteks.'},

    tradisional_moden:{title:'Tradisional dan Moden',objective:p=>`Pada akhir PdP, murid dapat membanding beza dan mencatat sekurang-kurangnya empat maklumat tentang rakit buluh dan rakit getah berdasarkan ${p}.`,criteria:'Murid mencatat sekurang-kurangnya dua persamaan/perbezaan dari aspek bahan, keselamatan, harga atau pengendalian berdasarkan sumber.',induction:'Guru memaparkan dua label “rakit buluh” dan “rakit getah”. Murid meramal satu perbezaan daripada gambar.',bbm:['Buku Teks m/s 50','BA m/s 56–57','peta banding beza'],support:[step('y3u8-50-s','Isi Jadual','Murid memindahkan maklumat terus daripada teks ke jadual dua lajur.','BT m/s 50','Guided Note-taking')],core:[step('y3u8-50-c','Banding dan Catat','Pasangan melengkapkan peta banding beza menggunakan bukti tentang bahan, kemudi, keselamatan dan pengendalian.','BT m/s 50','Compare-Contrast')],challenge:[step('y3u8-50-h','Rumusan Perbezaan','Murid menulis tiga ayat rumusan perbandingan tanpa menambah pengalaman luar.','peta banding beza','Summarising')],close:'Murid menyatakan satu persamaan atau perbezaan yang mempunyai bukti teks.'},

    usah_gentar:{title:'Usah Gentar',objective:p=>`Pada akhir PdP, murid dapat mengenal pasti dan menggunakan sekurang-kurangnya lima kata perintah berdasarkan ${p} mengikut konteks.`,criteria:'Murid membezakan kata perintah larangan, permintaan dan silaan serta melengkapkan dialog dengan bentuk yang sesuai.',induction:'Guru memaparkan “jangan”, “usah”, “sila” dan “harap”. Murid mengelaskan fungsi setiap kata.',bbm:['Buku Teks m/s 51','kad kata perintah','dialog bercetak'],support:[step('y3u8-51-s','Kelas Kata Perintah','Murid mengelaskan kata perintah kepada larangan, silaan atau permintaan.','kad kata perintah','Card Sort')],core:[step('y3u8-51-c','Lengkap Dialog','Pasangan melengkapkan dialog dengan kata perintah yang tepat lalu membacanya dengan intonasi sesuai. Aktiviti hanya bahasa; murid tidak melakukan atau mensimulasikan perlumbaan go-kart.','BT m/s 51','Pair Dialogue')],challenge:[step('y3u8-51-h','Tukar Bentuk','Murid mengubah satu ayat perintah kepada bentuk lain yang masih santun dan sesuai konteks.','BT m/s 51','Language Transfer')],close:'Murid menyebut satu kata perintah dan fungsinya.'},

    meneroka_gua:{title:'Wah, Seronoknya Meneroka Gua!',objective:p=>`Pada akhir PdP, murid dapat mengenal pasti dan menggunakan sekurang-kurangnya empat kata seru daripada ${p} mengikut perasaan yang sesuai.`,criteria:'Murid memadankan kata seru seperti eh, nah dan wah dengan fungsi perasaan atau situasi yang tepat dan membina ayat seruan.',induction:'Guru memaparkan tiga situasi bergambar dan murid memilih kata seru yang sesuai.',bbm:['Buku Teks m/s 52','BA m/s 60','kad kata seru'],support:[step('y3u8-52-s','Padan Seru–Perasaan','Murid memadankan kata seru dengan perasaan hairan, memberi sesuatu atau kagum.','kad kata seru','Matching')],core:[step('y3u8-52-c','Dialog Kata Seru','Pasangan membaca petikan dan mengenal pasti kata seru serta tanda baca. Aktiviti hanya analisis teks/gambar; murid tidak meneroka gua atau mensimulasikan aktiviti tersebut.','BT m/s 52','Paired Reading')],challenge:[step('y3u8-52-h','Bina Ayat Seruan','Murid membina tiga ayat seruan baharu berdasarkan gambar pada halaman.','BT m/s 52','Language Transfer')],close:'Guru menyatakan satu perasaan; murid memilih kata seru sesuai.'},

    mangga_selamat:{title:'Mangga Keselamatan',objective:p=>`Pada akhir PdP, murid dapat menjelaskan dan membanding beza sekurang-kurangnya tiga maklumat tersurat tentang dua jenis mangga berdasarkan ${p}.`,criteria:'Murid membandingkan bahan, ketahanan, keselamatan atau harga dan memberikan pilihan dengan alasan berdasarkan sumber.',induction:'Guru memaparkan dua gambar mangga daripada bahan. Murid menyatakan satu ciri yang berbeza.',bbm:['Buku Teks m/s 53','BA m/s 61','jadual perbandingan'],support:[step('y3u9-53-s','Cari Ciri','Murid mengisi jadual ciri setiap mangga menggunakan maklumat yang sudah tersedia pada halaman.','BT m/s 53','Guided Comparison')],core:[step('y3u9-53-c','Banding dan Pilih','Pasangan membandingkan dua mangga dan menjelaskan pilihan yang lebih sesuai berdasarkan bukti sumber.','BT m/s 53','Pair Reasoning')],challenge:[step('y3u9-53-h','Justifikasi Ringkas','Murid memberikan dua alasan yang menyokong pilihan tanpa menambah spesifikasi luar sumber.','BT m/s 53','Evidence Talk')],close:'Murid menyatakan satu perbezaan dan bukti.'},

    lampu_kecemasan:{title:'Lampu Kecemasan',objective:p=>`Pada akhir PdP, murid dapat membaca, memahami dan mengecam idea keseluruhan ${p} dengan sekurang-kurangnya tiga maklumat sokongan.`,criteria:'Murid merumus fungsi lampu kecemasan dan menyokong idea keseluruhan dengan tiga bukti daripada petikan.',induction:'Guru memaparkan tajuk dan tiga frasa kunci: automatik, bekalan elektrik terputus, kecemasan. Murid meramal idea keseluruhan.',bbm:['Buku Teks m/s 54','BA m/s 62–63','peta idea'],support:[step('y3u9-54-s','Susun Maklumat','Murid mengelaskan ayat kepada fungsi, cara beroperasi dan kebaikan.','BT m/s 54','Information Sort')],core:[step('y3u9-54-c','Idea Keseluruhan Berbukti','Pasangan membaca petikan dan membina satu ayat idea keseluruhan disokong tiga maklumat penting.','BT m/s 54','Pair Summary')],challenge:[step('y3u9-54-h','Rumusan Padat','Murid menghasilkan rumusan dua ayat tanpa menambah maklumat teknikal luar sumber.','BT m/s 54','Summarising')],close:'Murid melengkapkan ayat “Idea keseluruhan petikan ialah ___ kerana ___.”'},

    menampakkan_diri_explore:{title:'Menampakkan Diri',objective:p=>`Pada akhir PdP, murid dapat menulis sekurang-kurangnya empat ayat yang diimlakkan berdasarkan ${p} dengan ejaan dan tanda baca yang tepat.`,criteria:'Murid menulis empat ayat imlak dengan sekurang-kurangnya 80% ketepatan ejaan, huruf besar dan tanda baca.',induction:'Guru membaca satu ayat pendek sekali. Murid menyatakan strategi mendengar sebelum menulis.',bbm:['Buku Teks m/s 55','BA m/s 64','buku latihan'],support:[step('y3u9-55a-s','Imlak Frasa','Murid mendengar frasa penting dahulu sebelum ayat penuh diimlakkan.','BT m/s 55','Scaffolded Dictation')],core:[step('y3u9-55a-c','Imlak Ayat','Guru mengimlakkan ayat terpilih daripada bahan pada kadar sesuai; murid menulis dan menyemak ejaan serta tanda baca.','BT m/s 55','Dictation')],challenge:[step('y3u9-55a-h','Semak Kendiri','Murid membandingkan tulisan dengan sumber selepas imlak dan menandakan jenis kesalahan sendiri.','BT m/s 55','Self-Check')],close:'Murid membetulkan satu kesalahan dan menerangkan pembetulannya.'},

    kamera_pintar:{title:'Kamera Pintar',objective:p=>`Pada akhir PdP, murid dapat melafazkan pantun pada ${p} dengan sebutan dan intonasi yang sesuai serta menjelaskan maksud sekurang-kurangnya tiga rangkap.`,criteria:'Murid melafazkan pantun dengan jelas dan memadankan sekurang-kurangnya tiga rangkap dengan maksud yang tepat berdasarkan halaman.',induction:'Guru memaparkan satu pembayang dan satu maksud ringkas. Murid menentukan fungsi setiap bahagian.',bbm:['Buku Teks m/s 56','kad maksud pantun','penanda rangkap'],support:[step('y3u9-56-s','Padan Rangkap–Maksud','Murid memadankan rangkap pilihan dengan maksud yang disediakan.','BT m/s 56','Matching')],core:[step('y3u9-56-c','Lafaz dan Jelaskan','Pasangan melafazkan rangkap terpilih dan menerangkan maksud berdasarkan kandungan halaman tanpa menyalin keseluruhan pantun.','BT m/s 56','Paired Recitation')],challenge:[step('y3u9-56-h','Bukti Maksud','Murid menunjukkan kata/frasa dalam rangkap yang membantu menentukan maksud.','BT m/s 56','Evidence Talk')],close:'Murid menyatakan satu maksud pantun yang dipelajari.'},

    beringat:{title:'Beringat Sebelum Kena',objective:p=>`Pada akhir PdP, murid dapat mengenal pasti dan menggunakan kata pemeri “ialah” dan “adalah” berdasarkan ${p} dalam sekurang-kurangnya empat ayat yang tepat.`,criteria:'Murid memilih kata pemeri yang sesuai mengikut frasa selepasnya dan membetulkan sekurang-kurangnya empat ayat berdasarkan konteks.',induction:'Guru memaparkan dua ayat contoh yang menggunakan ialah dan adalah. Murid mencari perbezaan pola selepas kata pemeri.',bbm:['Buku Teks m/s 57','kad ialah/adalah','lembaran ayat'],support:[step('y3u9-57-s','Pilih Kata Pemeri','Murid memilih ialah atau adalah untuk ayat yang telah disediakan.','lembaran ayat','Guided Grammar')],core:[step('y3u9-57-c','Editor Kata Pemeri','Pasangan melengkapkan dan menyemak ayat daripada bahan dengan kata pemeri yang sesuai. Teks keselamatan elektrik digunakan sebagai konteks bahasa sahaja; murid tidak mengendalikan pengecas, bateri atau soket.','BT m/s 57','Peer Editing')],challenge:[step('y3u9-57-h','Bina Ayat Baharu','Murid membina dua ayat baharu menggunakan ialah dan adalah berdasarkan maklumat pada halaman.','BT m/s 57','Language Transfer')],close:'Murid menyebut satu ayat dengan kata pemeri yang tepat.'},

    menampakkan_diri_apply:{title:'Menampakkan Diri — Aplikasi Imlak',objective:p=>`Pada akhir PdP, murid dapat menulis sekurang-kurangnya lima ayat imlak berdasarkan ${p} dan membetulkan kesalahan secara kendiri.`,criteria:'Murid mencapai sekurang-kurangnya 80% ketepatan dan dapat membetulkan sekurang-kurangnya dua kesalahan selepas semakan sumber.',induction:'Guru mengulang strategi imlak: dengar ayat penuh, catat kata kunci, tulis, kemudian semak.',bbm:['Buku Teks m/s 55','BA m/s 64','senarai semak imlak'],support:[step('y3u9-55b-s','Imlak Bersegmen','Ayat dipecahkan kepada dua bahagian dengan jeda yang jelas untuk membantu murid menulis.','BT m/s 55','Segmented Dictation')],core:[step('y3u9-55b-c','Imlak + Semakan Pasangan','Murid menulis ayat imlak, bertukar buku untuk semakan ejaan/tanda baca, kemudian menyemak akhir dengan sumber.','BT m/s 55','Peer Check')],challenge:[step('y3u9-55b-h','Analisis Kesalahan','Murid mengelaskan kesalahan kepada ejaan, huruf besar atau tanda baca dan membetulkannya.','senarai semak','Error Analysis')],close:'Murid menyatakan satu pola kesalahan yang berjaya diperbaiki.'},

    hati_hati_mengundur:{title:'Hati-hati semasa Mengundur',objective:p=>`Pada akhir PdP, murid dapat mengenal pasti dan menggunakan sekurang-kurangnya lima kata penguat daripada ${p} mengikut konteks.`,criteria:'Murid membezakan penggunaan kata penguat seperti sangat, paling dan benar serta menggunakannya dengan kata adjektif yang sesuai.',induction:'Guru memaparkan tiga frasa dengan kata penguat dan murid menentukan kata yang menguatkan maksud adjektif.',bbm:['Buku Teks m/s 58','kad kata penguat','lembaran frasa'],support:[step('y3u9-58-s','Padan Penguat–Adjektif','Murid memadankan kata penguat dengan kata adjektif yang sesuai berdasarkan contoh sumber.','kad kata','Matching')],core:[step('y3u9-58-c','Jejak Kata Penguat','Pasangan mencari kata penguat dalam dialog dan melengkapkan ayat lain berdasarkan pola yang sama. Konteks kenderaan digunakan sebagai bahan bahasa sahaja; murid tidak mengendalikan atau memandu kenderaan.','BT m/s 58','Grammar Hunt')],challenge:[step('y3u9-58-h','Ubah Kedudukan','Murid membina ayat menggunakan kata penguat yang sesuai dan menerangkan kesan terhadap maksud.','BT m/s 58','Language Reasoning')],close:'Murid menyebut satu frasa adjektif dengan kata penguat.'},

    pengayaan_kata_tugas:{title:'Pengayaan — Kata Tugas',objective:p=>`Pada akhir PdP, murid dapat membina dan melakonkan dialog berdasarkan ${p} dengan menggunakan sekurang-kurangnya enam kata tugas yang tepat.`,criteria:'Dialog mengandungi sekurang-kurangnya enam kata tugas daripada kategori yang ditetapkan pada kad situasi dan digunakan mengikut konteks.',induction:'Guru menunjukkan tiga kad situasi daripada halaman. Murid mengenal pasti jenis kata tugas yang diminta pada setiap kad.',bbm:['Buku Teks m/s 60','kad situasi','senarai semak kata tugas'],support:[step('y3u9-60-s','Rangka Dialog','Murid memilih satu kad dan melengkapkan rangka dialog dengan kata tugas yang disediakan.','BT m/s 60','Guided Dialogue')],core:[step('y3u9-60-c','Dialog Kata Tugas','Kumpulan membina dialog mengikut situasi dan menyemak penggunaan kata tanya, perintah, seru, pemeri, penguat, arah atau hubung. Lakonan kekal sebagai simulasi bahasa yang selamat, bukan simulasi aktiviti berisiko.','BT m/s 60','Collaborative Role Play')],challenge:[step('y3u9-60-h','Audit Bahasa','Murid menanda kategori bagi setiap kata tugas dalam dialog dan membaiki penggunaan yang tidak tepat.','senarai semak','Language Audit')],close:'Setiap kumpulan menyebut dua kata tugas yang digunakan dan kategorinya.'}
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
      _runtime_bm_year3_units7_9_mode:md
    };
  }

  const originalEffective=window.effectiveRphLessonMap;
  if(typeof originalEffective==='function')window.effectiveRphLessonMap=function(map,...args){
    const out=originalEffective.call(this,map,...args);
    const reason=reviewReason(out);
    if(reason)return {...out,_runtime_bm_year3_source_review_required:true,_runtime_bm_year3_source_review_reason:reason};
    const pair=objectivePair(out);
    if(!pair)return out;
    return {...out,objective:pair.objective,success_criteria:pair.criteria,_runtime_bm_year3_source_blueprint:true,_runtime_bm_year3_units7_9_mode:mode(out)};
  };

  const originalPedagogy=window.buildSourceAwarePedagogy;
  if(typeof originalPedagogy==='function')window.buildSourceAwarePedagogy=function(map,ev,built){
    const out=blueprint(map);
    return out||originalPedagogy(map,ev,built);
  };

  window.bmYear3Units79SourceBlueprintMode=mode;
  window.bmYear3Units79SourceReviewReason=reviewReason;
  window.bmYear3Units79SourceBlueprint=blueprint;
})();