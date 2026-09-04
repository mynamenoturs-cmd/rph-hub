(function(){
  'use strict';

  const subjectKey=m=>{try{return window.rphSubjectKey?.(m?.subject_id)||''}catch{return''}};
  const mainSp=m=>String(m?.source_evidence?.meta?.main_sp||String(m?.sp||'').split(',')[0]||'').trim();
  const year=m=>Number(m?.year||0)||0;
  const week=m=>Number(m?.week_no||m?.week||0)||0;
  const session=m=>Number(m?.session_no||m?.session||0)||0;
  const page=m=>Number(m?.textbook_page_start||0)||0;
  const pageLabel=m=>page(m)?`Buku Teks m/s ${page(m)}`:'Buku Teks';
  const step=(key,name,text,bbm,pak21)=>({key,name,text,bbm,pak21,phase:'source'});

  const ROUTES={
    '1.1.1@7|W3|S3':'family_hobbies',
    '2.1.1@8|W3|S4':'sports_day_memory',
    '3.1.1@9|W4|S1':'bukit_larut_copy',
    '4.1.1@10|W4|S2':'idioms_dear_sibling',
    '5.1.1@11|W4|S3':'proper_nouns_explore',
    '5.1.1@11|W4|S4':'proper_nouns_apply',
    '5.1.1@12|W4|S5':'pronouns_photo',
    '1.1.1@13|W5|S1':'compound_sentence_listen',
    '2.1.2@14|W5|S2':'chores_read_explore',
    '2.1.2@14|W5|S3':'chores_read_apply',
    '3.1.1@15|W5|S4':'meal_manners_copy',
    '4.1.1@16|W5|S5':'simile_visit'
  };

  function mode(m){
    if(subjectKey(m)!=='bm'||year(m)!==2)return'';
    return ROUTES[`${mainSp(m)}@${page(m)}|W${week(m)}|S${session(m)}`]||'';
  }

  const C={
    family_hobbies:{
      objective:p=>`Pada akhir PdP, murid dapat mendengar, mengecam dan menyebut ayat tunggal daripada bahan “Hobi Keluarga” pada ${p} dengan betul dan tepat.`,
      criteria:'Murid dapat memadankan ayat yang didengar dengan ahli keluarga atau hobi yang betul, kemudian menyebut semula ayat tunggal tanpa mengubah maksud.',
      induction:'Guru menunjukkan gambar aktiviti mengambil gambar, menggesek biola dan bermain papan selaju. Murid meneka hobi sebelum mendengar ayat sumber.',
      support:[
        step('bm2-u2-hobi-s1','Dengar dan Padankan','Guru membaca satu ayat tunggal pada satu masa. Murid memilih kad gambar hobi atau ahli keluarga yang sepadan, kemudian menyebut semula ayat bersama guru.','Buku Teks m/s 7; kad hobi; kad ahli keluarga','Listen and Match'),
        step('bm2-u2-hobi-s2','Ayat Berpetunjuk','Murid melengkapkan rangka lisan seperti “Hobi ayah saya …” atau “Abang saya suka …” menggunakan pilihan kata daripada halaman.','kad rangka ayat; Buku Teks m/s 7','Guided Speaking')
      ],
      core:[
        step('bm2-u2-hobi-c1','Siapa Punya Hobi?','Secara berpasangan, seorang murid membaca atau menyebut ayat tunggal sumber; pasangan menunjukkan ahli keluarga atau hobi yang tepat dan mengulang ayat tersebut.','Buku Teks m/s 7; kad watak dan hobi','Pair Check'),
        step('bm2-u2-hobi-c2','Dengar–Eja Makna','Guru menyebut ayat tanpa gambar. Kumpulan mengenal pasti hobi yang dimaksudkan dan menerangkan bukti kata dalam ayat, contohnya “menggesek biola” atau “bermain papan selaju”.','Buku Teks m/s 7','Listening Hunt')
      ],
      challenge:[
        step('bm2-u2-hobi-h1','Bina Ayat Hobi Sendiri','Murid menghasilkan satu ayat tunggal tentang hobi ahli keluarga sendiri mengikut pola ayat sumber dan menyebutnya dengan jelas.','Buku Teks m/s 7','Independent Speaking'),
        step('bm2-u2-hobi-h2','Semak Ayat Tunggal','Rakan menentukan sama ada ayat yang didengar ialah satu ayat tunggal yang lengkap dan memberi satu cadangan pembaikan jika perlu.','kad semak ayat','Peer Feedback')
      ],
      close:'Guru menyebut beberapa ayat secara rawak. Murid menunjukkan hobi yang sepadan dan mengulang satu ayat dengan sebutan tepat.',
      bbm:['Buku Teks m/s 7','BA1 m/s 9','kad hobi','kad ahli keluarga']
    },

    sports_day_memory:{
      objective:p=>`Pada akhir PdP, murid dapat membaca perenggan dan petikan “Kenangan Sukaneka” pada ${p} dengan sebutan yang betul dan intonasi yang sesuai.`,
      criteria:'Murid membaca petikan mengikut tanda baca, mengekalkan sebutan jelas dan dapat mengaitkan isi petikan dengan pengalaman sukaneka secara lisan.',
      induction:'Guru menunjukkan gambar suasana sukaneka dan bertanya pengalaman murid tentang acara, kemenangan atau sokongan keluarga.',
      support:[
        step('bm2-u2-sukan-s1','Baca Mengikut Frasa','Guru menandakan jeda pada ayat dialog seperti ucapan tahniah dan terima kasih. Murid membaca mengikut frasa sebelum membaca ayat penuh.','Buku Teks m/s 8; jalur ayat','Guided Reading'),
        step('bm2-u2-sukan-s2','Siapa Berkata?','Murid memadankan dialog dengan Hana, ibu atau Hani sebelum membaca dialog mengikut watak.','kad watak; jalur dialog','Role Reading')
      ],
      core:[
        step('bm2-u2-sukan-c1','Bacaan Berwatak','Dalam kumpulan kecil, murid membahagikan watak pencerita, Hana, Puan Yasmin dan Hani lalu membaca petikan dengan intonasi yang sesuai.','Buku Teks m/s 8','Readers Theatre'),
        step('bm2-u2-sukan-c2','Petikan kepada Pengalaman','Selepas bacaan, pasangan memilih satu isi seperti kemenangan, sokongan atau ucapan tahniah dan mengaitkannya dengan pengalaman sukaneka sekolah.','Buku Teks m/s 8','Think-Pair-Share')
      ],
      challenge:[
        step('bm2-u2-sukan-h1','Baca dengan Nada Watak','Murid membaca semula satu bahagian dialog dengan nada gembira, bangga atau berterima kasih yang sesuai dengan konteks.','Buku Teks m/s 8','Expressive Reading'),
        step('bm2-u2-sukan-h2','Bukti daripada Teks','Murid menyatakan satu perasaan watak dan menunjuk ayat yang membuktikan perasaan tersebut.','Buku Teks m/s 8','Text Evidence')
      ],
      close:'Murid membaca satu ayat pilihan daripada petikan dan menyatakan watak serta perasaan yang sesuai dengan ayat itu.',
      bbm:['Buku Teks m/s 8','BA1 m/s 10–11','kad watak','jalur dialog']
    },

    bukit_larut_copy:{
      objective:p=>`Pada akhir PdP, murid dapat menulis perenggan “Bercuti di Bukit Larut” pada ${p} secara mekanis dengan ejaan, tanda baca, jarak perkataan dan tulisan yang kemas.`,
      criteria:'Murid menyalin perenggan mengikut sumber tanpa menukar isi, mengekalkan tanda baca dan membaiki kesalahan yang dikenal pasti semasa semakan.',
      induction:'Guru memaparkan satu ayat daripada petikan dalam bentuk kemas dan satu versi yang jarak perkataannya tidak teratur. Murid membandingkan keterbacaan kedua-duanya.',
      support:[
        step('bm2-u2-bukit-s1','Salin Satu Ayat Demi Satu','Guru membimbing murid membaca satu ayat, meneliti huruf besar dan tanda baca, kemudian menyalinnya sebelum berpindah ke ayat berikutnya.','Buku Teks m/s 9; buku latihan','Guided Handwriting'),
        step('bm2-u2-bukit-s2','Semak Jejak Empat','Murid menggunakan kad semak: huruf besar, ejaan, jarak, tanda baca. Murid menanda sendiri satu pembaikan.','kad semak; hasil tulisan','Self-Check')
      ],
      core:[
        step('bm2-u2-bukit-c1','Baca–Tutup–Tulis–Semak','Murid membaca satu frasa atau ayat, menutup sumber seketika, menulisnya, kemudian membuka semula Buku Teks untuk membandingkan ketepatan.','Buku Teks m/s 9; buku latihan','Read-Cover-Write-Check'),
        step('bm2-u2-bukit-c2','Editor Pasangan','Pasangan menyemak satu sama lain hanya berdasarkan sumber: ejaan, huruf besar, tanda baca dan jarak perkataan.','Buku Teks m/s 9; senarai semak','Peer Review')
      ],
      challenge:[
        step('bm2-u2-bukit-h1','Salin Perenggan Kendiri','Murid menyalin satu bahagian petikan secara kendiri dengan mengekalkan struktur perenggan dan tanda baca.','Buku Teks m/s 9','Independent Writing'),
        step('bm2-u2-bukit-h2','Cari dan Baiki Sendiri','Murid membandingkan hasil dengan sumber, mengenal pasti sendiri bahagian yang tidak sama dan menulis pembetulan di bawah baris tersebut.','Buku Teks m/s 9','Self-Editing')
      ],
      close:'Murid menunjukkan satu pembaikan yang dibuat dan menyatakan sama ada pembaikan itu melibatkan ejaan, tanda baca, jarak atau bentuk tulisan.',
      bbm:['Buku Teks m/s 9','BA1 m/s 12','buku latihan','kad semak tulisan']
    },

    idioms_dear_sibling:{
      objective:p=>`Pada akhir PdP, murid dapat memahami dan menggunakan simpulan bahasa dalam dialog “Adikku Sayang” pada ${p} semasa bercerita atau menuturkan dialog.`,
      criteria:'Murid memadankan simpulan bahasa dengan maksud yang sesuai dan menggunakannya dalam dialog atau cerita ringkas mengikut konteks.',
      induction:'Guru memaparkan frasa “otak cair” dan bertanya sama ada maksudnya benar-benar berkaitan dengan cecair. Murid membuat tekaan sebelum melihat konteks dialog.',
      support:[
        step('bm2-u2-idiom-s1','Padan Simpulan dengan Maksud','Murid memadankan otak cair, panjang akal, ringan tulang, anak emas dan buah hati dengan kad maksud yang mudah berdasarkan dialog.','Buku Teks m/s 10; kad simpulan bahasa; kad maksud','Matching'),
        step('bm2-u2-idiom-s2','Lakon Ayat Pilihan','Murid memilih satu baris dialog yang mengandungi simpulan bahasa dan melakonkannya dengan bimbingan guru.','kad dialog','Guided Role Play')
      ],
      core:[
        step('bm2-u2-idiom-c1','Detektif Konteks','Pasangan membaca dialog dan mencari petunjuk yang membantu menerangkan maksud setiap simpulan bahasa, contohnya “suka membantu orang lain” untuk ringan tulang.','Buku Teks m/s 10','Context Clues'),
        step('bm2-u2-idiom-c2','Dialog Berantai','Kumpulan menuturkan semula dialog sambil memastikan simpulan bahasa disebut dalam konteks yang betul.','Buku Teks m/s 10; kad watak','Role Play')
      ],
      challenge:[
        step('bm2-u2-idiom-h1','Situasi Baharu, Simpulan Sama','Murid menghasilkan satu situasi baharu yang sesuai untuk satu simpulan bahasa daripada halaman tanpa menukar maksud simpulan tersebut.','kad simpulan bahasa','Transfer Task'),
        step('bm2-u2-idiom-h2','Jelaskan Sebab','Murid menerangkan mengapa simpulan bahasa yang dipilih sesuai untuk watak atau situasi dengan merujuk bukti dialog.','Buku Teks m/s 10','Reasoning Talk')
      ],
      close:'Guru menyebut satu maksud; murid memilih simpulan bahasa yang sesuai dan memberi satu contoh penggunaan lisan.',
      bbm:['Buku Teks m/s 10','BA1 m/s 13','kad simpulan bahasa','kad maksud','kad watak']
    },

    proper_nouns_explore:{
      objective:p=>`Pada akhir PdP, murid dapat mengenal pasti dan menggunakan kata nama khas dalam bahan “Hamster Kesayangan Hani” pada ${p} untuk melengkapkan cerita.`,
      criteria:'Murid membezakan kata nama khas daripada kata nama am berdasarkan konteks dan menggunakan kata nama khas yang tepat ketika melengkapkan cerita.',
      induction:'Guru memaparkan pasangan kata seperti “hamster–Cici”, “doktor–Doktor Ramesh” dan “klinik–Klinik Comel”. Murid menyatakan perbezaan antara nama umum dan nama khusus.',
      support:[
        step('bm2-u2-khas-s1','Cari Nama Khusus','Murid mencari dan menandakan Cici, Hani, Kota Samarahan, Sarawak, Klinik Comel, Doktor Ramesh dan Hamhat dalam bahan.','Buku Teks m/s 11; penanda teks','Text Hunt'),
        step('bm2-u2-khas-s2','Am atau Khas?','Murid meletakkan kad seperti hamster/Cici, doktor/Doktor Ramesh, klinik/Klinik Comel pada lajur kata nama am atau kata nama khas.','kad kata; carta dua lajur','Classification')
      ],
      core:[
        step('bm2-u2-khas-c1','Lengkapkan Cerita dengan Bukti','Murid melengkapkan bahagian cerita menggunakan kata nama khas yang sesuai, kemudian menunjuk ayat sumber yang menyokong pilihan.','Buku Teks m/s 11','Pair Check'),
        step('bm2-u2-khas-c2','Rantaian Nama Khas','Setiap kumpulan mengambil satu kad kategori—orang, tempat, haiwan atau benda/jenama—dan mencari contoh kata nama khas yang benar-benar terdapat dalam halaman.','Buku Teks m/s 11; kad kategori','Cooperative Hunt')
      ],
      challenge:[
        step('bm2-u2-khas-h1','Tukar Umum kepada Khusus','Murid diberi kata nama am daripada konteks halaman dan memilih kata nama khas yang sesuai tanpa mencipta fakta di luar sumber.','kad pasangan kata','Concept Transfer'),
        step('bm2-u2-khas-h2','Ayat Konteks Tepat','Murid membina satu ayat menggunakan salah satu kata nama khas halaman dengan huruf besar yang betul.','Buku Teks m/s 11','Independent Writing')
      ],
      close:'Murid menyebut satu kata nama khas daripada halaman dan menjelaskan perkara khusus yang dirujuknya.',
      bbm:['Buku Teks m/s 11','BA1 m/s 14–15','kad kata','carta kata nama am/khas']
    },

    proper_nouns_apply:{
      objective:p=>`Pada akhir PdP, murid dapat mengaplikasikan penggunaan kata nama khas daripada ${p} dalam latihan BA1 m/s 14–15 dan semakan konteks dengan betul.`,
      criteria:'Murid menyiapkan latihan aplikasi, menggunakan huruf besar pada kata nama khas dan dapat menerangkan mengapa pilihan tersebut ialah nama khusus.',
      induction:'Guru menunjukkan beberapa kad tanpa label kategori. Murid mengangkat kad “AM” atau “KHAS” secara pantas berdasarkan contoh dari sesi sebelumnya.',
      support:[
        step('bm2-u2-khasa-s1','Rujuk sebelum Jawab','Murid merujuk pasangan am–khas daripada Buku Teks sebelum menjawab item berkaitan dalam BA1 m/s 14–15.','Buku Teks m/s 11; BA1 m/s 14–15','Guided Practice'),
        step('bm2-u2-khasa-s2','Semak Huruf Besar','Selepas menjawab, murid membulatkan huruf pertama setiap kata nama khas untuk memastikan penggunaan huruf besar.','BA1 m/s 14–15','Self-Check')
      ],
      core:[
        step('bm2-u2-khasa-c1','BA tanpa Ulang Aktiviti','Murid menyiapkan latihan BA sebagai aplikasi, kemudian hanya kembali ke Buku Teks untuk menyemak kata nama khas yang diragui.','BA1 m/s 14–15; Buku Teks m/s 11','Independent Practice'),
        step('bm2-u2-khasa-c2','Pasangan Justifikasi','Pasangan memilih satu jawapan kata nama khas dan menjelaskan apakah orang, tempat, haiwan atau benda khusus yang dirujuk.','hasil BA','Peer Explanation')
      ],
      challenge:[
        step('bm2-u2-khasa-h1','Baiki Kesalahan Nama Khas','Murid diberikan satu ayat dengan kesalahan huruf besar pada kata nama khas dan membaikinya menggunakan pola sumber.','kad ayat','Editing'),
        step('bm2-u2-khasa-h2','Bukti Konteks','Murid menunjukkan perkataan sebelum/selepas kata nama khas dalam ayat yang membantu menentukan rujukannya.','Buku Teks m/s 11','Context Evidence')
      ],
      close:'Murid berkongsi satu jawapan BA yang diperbaiki dan sebab huruf besar diperlukan.',
      bbm:['Buku Teks m/s 11','BA1 m/s 14–15','kad AM/KHAS','kad ayat']
    },

    pronouns_photo:{
      objective:p=>`Pada akhir PdP, murid dapat mengenal pasti dan menggunakan kata ganti nama diri dalam dialog “Pertandingan Fotografi” pada ${p} mengikut konteks.`,
      criteria:'Murid menentukan rujukan kata ganti nama diri dalam dialog dan menggunakan kata ganti yang sesuai ketika melakonkan semula perbualan.',
      induction:'Guru menunjukkan tiga kad “saya”, “kamu” dan “mereka”. Murid menyatakan siapa yang dirujuk apabila penutur dan pendengar berubah.',
      support:[
        step('bm2-u2-ganti-s1','Warna Kata Ganti','Murid menandakan kata seperti saya, kamu, kami dan mereka mengikut kategori orang pertama, kedua atau ketiga dengan bantuan warna/simbol.','Buku Teks m/s 12; kad kategori','Guided Classification'),
        step('bm2-u2-ganti-s2','Siapa Dirujuk?','Guru membaca satu baris dialog dan murid memilih kad watak yang dirujuk oleh kata ganti nama tersebut.','kad watak; Buku Teks m/s 12','Reference Match')
      ],
      core:[
        step('bm2-u2-ganti-c1','Lakon Dialog Bertukar Watak','Pasangan melakonkan dialog Hana–Soo Mei. Selepas bertukar peranan, mereka memerhati perubahan kata ganti nama yang perlu digunakan.','Buku Teks m/s 12','Role Play'),
        step('bm2-u2-ganti-c2','Ganti Nama Tepat','Kumpulan menerima jalur ayat daripada dialog dengan satu kata ganti dikosongkan dan memilih kata ganti yang sesuai berdasarkan siapa bercakap dan siapa dirujuk.','jalur ayat','Cloze Challenge')
      ],
      challenge:[
        step('bm2-u2-ganti-h1','Ubah Sudut Penutur','Murid menukar satu ayat daripada sudut Hana kepada Soo Mei atau sebaliknya sambil menyesuaikan kata ganti nama diri.','kad ayat','Perspective Shift'),
        step('bm2-u2-ganti-h2','Jelaskan Rujukan','Murid menerangkan rujukan satu kata ganti nama dalam dialog dengan ayat “___ merujuk kepada ___ kerana …”.','Buku Teks m/s 12','Reasoning Talk')
      ],
      close:'Guru membaca satu ayat dialog. Murid mengangkat kad orang pertama, kedua atau ketiga dan menyatakan siapa yang dirujuk.',
      bbm:['Buku Teks m/s 12','BA1 m/s 16','kad kata ganti','kad watak','jalur ayat']
    },

    compound_sentence_listen:{
      objective:p=>`Pada akhir PdP, murid dapat mendengar, mengecam dan menyebut ayat majmuk daripada bahan “Mengemas Dapur” pada ${p} dengan betul dan tepat.`,
      criteria:'Murid membezakan ayat tunggal dan ayat majmuk yang didengar serta menyebut semula ayat majmuk dengan struktur dan sebutan yang tepat.',
      induction:'Guru menyebut dua ayat tunggal pendek kemudian menunjukkan bagaimana dua idea boleh digabungkan menjadi satu ayat baharu. Murid mendengar perbezaannya.',
      support:[
        step('bm2-u3-majmuk-s1','Dengar dan Isyarat','Guru menyebut ayat daripada halaman. Murid menunjukkan kad “T” untuk ayat tunggal atau “M” untuk ayat majmuk sebelum mengulang ayat majmuk bersama guru.','Buku Teks m/s 13; kad T/M','Listening Discrimination'),
        step('bm2-u3-majmuk-s2','Potong Dua Idea','Murid melihat dua bahagian idea dalam ayat majmuk dan menyebut setiap bahagian sebelum menyebut ayat lengkap.','jalur ayat','Chunking')
      ],
      core:[
        step('bm2-u3-majmuk-c1','Echo Ayat Majmuk','Secara berkumpulan, murid mendengar ayat guru seperti ayat tentang Hana dan Hani membantu ibu di dapur, kemudian menyebut semula dengan struktur yang sama.','Buku Teks m/s 13','Echo Speaking'),
        step('bm2-u3-majmuk-c2','Cari Dua Idea','Pasangan mengenal pasti dua idea yang dicantumkan dalam satu ayat majmuk dan menerangkannya secara lisan.','Buku Teks m/s 13','Pair Analysis')
      ],
      challenge:[
        step('bm2-u3-majmuk-h1','Cantum Ayat Berkonteks','Murid mencantum dua ayat mudah berkaitan kerja di dapur menjadi satu ayat majmuk mengikut pola sumber.','kad ayat','Sentence Combining'),
        step('bm2-u3-majmuk-h2','Semak Makna Kekal','Murid menerangkan sama ada ayat majmuk yang dibina masih mengekalkan kedua-dua idea asal.','kad semak','Reasoning Talk')
      ],
      close:'Guru menyebut satu ayat; murid menentukan tunggal atau majmuk dan menyatakan petunjuk yang mereka dengar.',
      bbm:['Buku Teks m/s 13','BA1 m/s 17','kad T/M','jalur ayat']
    },

    chores_read_explore:{
      objective:p=>`Pada akhir PdP, murid dapat membaca dan memahami perkataan serta ayat dalam “Agihan Tugas Kami” pada ${p} dengan mengaitkan kata kerja kepada tugas ahli keluarga yang betul.`,
      criteria:'Murid membaca kata tugas rumah dengan betul, memadankan tugas dengan watak yang tepat dan menunjukkan kefahaman melalui aksi atau penerangan ringkas.',
      induction:'Guru melakukan aksi menyapu, mengelap, menyusun dan menyidai tanpa bercakap. Murid meneka perkataan yang sesuai sebelum membaca halaman.',
      support:[
        step('bm2-u3-tugas-s1','Aksi dan Perkataan','Murid memadankan kad menyapu, mengelap, menyusun dan menyidai dengan aksi guru atau gambar yang sesuai.','Buku Teks m/s 14; kad kata; kad gambar','Total Physical Response'),
        step('bm2-u3-tugas-s2','Siapa Buat Apa?','Murid menggunakan kad watak Hana, Hani, Amin dan Amar untuk memadankan setiap watak dengan tugas yang dinyatakan dalam petikan.','kad watak; Buku Teks m/s 14','Guided Matching')
      ],
      core:[
        step('bm2-u3-tugas-c1','Baca dan Lakukan','Murid membaca satu ayat tugas, kemudian seorang ahli kumpulan melakukan aksi yang sesuai. Rakan menyemak sama ada aksi sepadan dengan ayat.','Buku Teks m/s 14','Read and Act'),
        step('bm2-u3-tugas-c2','Jadual Agihan Tugas','Pasangan memindahkan maklumat petikan kepada jadual “Ahli keluarga | Tugas” dan menyemaknya dengan teks.','lembaran jadual; Buku Teks m/s 14','Information Transfer')
      ],
      challenge:[
        step('bm2-u3-tugas-h1','Nyatakan Tugas Sendiri','Murid menggunakan pola ayat sumber untuk menyatakan satu tugas harian mereka di rumah.','Buku Teks m/s 14','Personal Connection'),
        step('bm2-u3-tugas-h2','Bukti Ayat','Murid menunjukkan ayat sumber yang membuktikan siapa melakukan sesuatu tugas dan membaca ayat itu dengan lancar.','Buku Teks m/s 14','Text Evidence')
      ],
      close:'Guru menunjukkan satu kad watak; murid menyebut tugas watak tersebut dan membacakan ayat sumber yang berkaitan.',
      bbm:['Buku Teks m/s 14','BA1 m/s 18–20','kad kata kerja','kad watak','lembaran jadual']
    },

    chores_read_apply:{
      objective:p=>`Pada akhir PdP, murid dapat mengaplikasikan kefahaman perkataan dan ayat daripada ${p} dalam BA1 m/s 18–20 tanpa mengulang aktiviti penerokaan sesi sebelumnya.`,
      criteria:'Murid menyiapkan latihan aplikasi berdasarkan maklumat tugas keluarga dan dapat menyemak jawapan menggunakan ayat sumber.',
      induction:'Guru menunjukkan jadual tugas yang tidak lengkap. Murid mengisi satu contoh secara lisan daripada ingatan sebelum membuka Buku Teks.',
      support:[
        step('bm2-u3-tugasa-s1','Peta Rujukan','Murid menggunakan peta ringkas Hana–menyidai, Hani–menyapu, Amin–mengelap, Amar–menyusun sebagai sokongan ketika memulakan BA.','peta rujukan; BA1 m/s 18–20','Scaffolded Practice'),
        step('bm2-u3-tugasa-s2','Semak Satu Demi Satu','Selepas setiap bahagian BA, murid merujuk satu ayat Buku Teks untuk mengesahkan jawapan sebelum meneruskan.','Buku Teks m/s 14; BA1 m/s 18–20','Source Check')
      ],
      core:[
        step('bm2-u3-tugasa-c1','BA Kendiri Berasaskan Sumber','Murid menyiapkan latihan BA1 m/s 18–20 secara kendiri, kemudian menanda jawapan yang mempunyai bukti jelas dalam petikan.','BA1 m/s 18–20; Buku Teks m/s 14','Independent Practice'),
        step('bm2-u3-tugasa-c2','Semak Pasangan dengan Bukti','Pasangan membandingkan jawapan dan hanya menerima pembetulan apabila rakan boleh menunjukkan ayat sumber yang menyokongnya.','BA1 m/s 18–20; Buku Teks m/s 14','Evidence-Based Peer Check')
      ],
      challenge:[
        step('bm2-u3-tugasa-h1','Susun Jadual Baharu','Murid menyusun satu jadual tugas rumah ringkas menggunakan pola bahasa daripada petikan, kemudian membaca jadual itu kepada rakan.','lembaran jadual','Application'),
        step('bm2-u3-tugasa-h2','Banding Tugas','Murid membandingkan dua tugas dalam petikan dan menjelaskan persamaan atau perbezaan tindakan menggunakan ayat mudah.','Buku Teks m/s 14','Compare and Explain')
      ],
      close:'Murid menyatakan satu jawapan BA dan menunjukkan ayat sumber yang digunakan untuk menyemaknya.',
      bbm:['Buku Teks m/s 14','BA1 m/s 18–20','peta rujukan','lembaran jadual']
    },

    meal_manners_copy:{
      objective:p=>`Pada akhir PdP, murid dapat menulis petikan “Adab ketika Makan” pada ${p} secara mekanis dengan tulisan yang kemas, ejaan tepat dan tanda baca yang dikekalkan.`,
      criteria:'Murid menyalin petikan mengikut sumber, mengekalkan struktur ayat dan membaiki kesalahan mekanis melalui semakan.',
      induction:'Guru membaca dua ayat awal petikan sambil menunjukkan cara mengesan huruf besar, tanda noktah dan jarak perkataan sebelum menulis.',
      support:[
        step('bm2-u3-adab-s1','Salin Bersegmen','Murid menyalin petikan dalam segmen pendek, contohnya satu ayat tentang membasuh tangan atau membaca doa pada satu masa.','Buku Teks m/s 15; buku latihan','Guided Copying'),
        step('bm2-u3-adab-s2','Semak Model','Selepas setiap segmen, murid membandingkan ejaan, huruf besar, jarak dan tanda baca dengan Buku Teks.','Buku Teks m/s 15; kad semak','Self-Check')
      ],
      core:[
        step('bm2-u3-adab-c1','Petikan Tepat dan Kemas','Murid menyalin bahagian petikan secara kendiri sambil mengekalkan susunan ayat sumber.','Buku Teks m/s 15; buku latihan','Independent Writing'),
        step('bm2-u3-adab-c2','Semakan Rakan Empat Aspek','Pasangan menyemak ejaan, huruf besar, tanda baca dan jarak perkataan tanpa mengubah kandungan petikan.','hasil tulisan; senarai semak','Peer Review')
      ],
      challenge:[
        step('bm2-u3-adab-h1','Salin Tanpa Rujuk Setiap Perkataan','Murid membaca satu ayat penuh, menyalinnya dengan lebih kendiri, kemudian menyemak semula dengan sumber selepas selesai.','Buku Teks m/s 15','Memory Copy'),
        step('bm2-u3-adab-h2','Editor Ketepatan','Murid mengenal pasti sendiri satu ketidakpadanan antara hasil dan sumber lalu menulis pembetulan yang tepat.','Buku Teks m/s 15','Self-Editing')
      ],
      close:'Murid menunjukkan satu baris yang telah disemak dan menyatakan aspek mekanis yang paling mereka jaga.',
      bbm:['Buku Teks m/s 15','BA1 m/s 21','buku latihan','senarai semak']
    },

    simile_visit:{
      objective:p=>`Pada akhir PdP, murid dapat memahami dan menggunakan bandingan semacam daripada “Menziarahi Pak Cik Zamri” pada ${p} ketika bercerita atau menuturkan dialog.`,
      criteria:'Murid memadankan bandingan semacam dengan sifat yang diterangkan dan menggunakannya semula dalam dialog atau cerita mengikut konteks.',
      induction:'Guru menunjukkan dua ayat “manis” dan “manis macam madu”. Murid membandingkan kesan bahasa kedua-duanya sebelum membaca dialog.',
      support:[
        step('bm2-u3-simile-s1','Padan Sifat dan Bandingan','Murid memadankan indah seperti mahligai, lembut bak sutera, rajin macam semut, manis macam madu, masam seperti cuka dan pahit bagai hempedu dengan sifat yang tepat.','Buku Teks m/s 16; kad bandingan; kad sifat','Matching'),
        step('bm2-u3-simile-s2','Dialog Berpanduan','Murid membaca baris dialog terpilih dan menekankan frasa bandingan semacam dengan intonasi yang sesuai.','kad dialog','Guided Role Play')
      ],
      core:[
        step('bm2-u3-simile-c1','Cari Bandingan dalam Konteks','Pasangan membaca dialog dan menggariskan kata pembanding seperti seperti, bak, macam dan bagai, kemudian menerangkan perkara yang dibandingkan.','Buku Teks m/s 16','Text Annotation'),
        step('bm2-u3-simile-c2','Lakon Ziarah','Kumpulan melakonkan situasi ziarah dan menuturkan semula dialog dengan bandingan semacam pada tempat yang betul.','Buku Teks m/s 16; kad watak','Role Play')
      ],
      challenge:[
        step('bm2-u3-simile-h1','Pilih Bandingan Paling Sesuai','Murid diberi satu sifat atau situasi dan memilih bandingan semacam daripada halaman yang paling sesuai, kemudian menerangkan sebab pilihan.','kad situasi','Reasoning Game'),
        step('bm2-u3-simile-h2','Ayat Baharu daripada Pola Sumber','Murid membina satu ayat baharu menggunakan salah satu bandingan semacam yang dipelajari tanpa mengubah maknanya.','kad bandingan','Transfer Task')
      ],
      close:'Guru menyebut satu sifat seperti rajin, lembut atau manis. Murid melengkapkan dengan bandingan semacam yang sesuai dan menyebutnya dalam satu ayat.',
      bbm:['Buku Teks m/s 16','BA1 m/s 22','kad bandingan semacam','kad sifat','kad watak']
    }
  };

  function objectivePair(m){
    const c=C[mode(m)];
    if(!c)return null;
    return {objective:c.objective(pageLabel(m)),criteria:c.criteria};
  }

  function blueprint(m){
    const md=mode(m),c=C[md];
    if(!c)return null;
    const p=pageLabel(m),pair=objectivePair(m);
    return {
      method:'Aktiviti source-first BM Tahun 2 berdasarkan RPT + DSKP + Buku Teks',
      pakDetail:`Isi PdP datang daripada tugasan sebenar pada ${p}. Sesi penerokaan dan aplikasi pada halaman sama dibezakan mengikut sesi RPT; BA hanya digunakan sebagai evidens pengukuhan. Activity Library hanya memvariasikan cara pelaksanaan.`,
      anchor:`${m.title||md} — ${p}`,
      kind:'source_task',
      bbmList:c.bbm,
      groupBbm:{support:c.bbm.join('; '),core:c.bbm.join('; '),challenge:c.bbm.join('; ')},
      mainSp:mainSp(m),page:p,topic:m.title||md,
      setInduksi:c.induction,
      inductionData:{name:'Set Induksi Sumber',text:c.induction,bbm:p,pak21:'Think-Pair-Share'},
      librarySteps:{support:c.support,core:c.core,challenge:c.challenge},
      diffSupport:'Tugasan sumber yang sama dengan kad petunjuk, model bacaan/tulisan, pilihan terhad atau aksi berpandu.',
      diffCore:'Melaksanakan tugasan sebenar Buku Teks mengikut kemahiran SP dan menggunakan BA hanya apabila RPT menetapkannya sebagai pengukuhan.',
      diffChallenge:'Melaksanakan tugasan yang sama secara lebih kendiri dengan bukti teks, penjelasan konteks atau pemindahan pola bahasa.',
      diffSupportAct:c.support.map(x=>x.text).join(' '),
      diffCoreAct:c.core.map(x=>x.text).join(' '),
      diffChallengeAct:c.challenge.map(x=>x.text).join(' '),
      pbdEvidence:{method:'Pemerhatian + hasil lisan/bacaan/tulisan berasaskan sumber',evidence:'Prestasi disemak terus terhadap tugasan pada Buku Teks dan, bagi sesi aplikasi, latihan BA yang ditetapkan RPT.',criterion:pair.criteria},
      penutup:c.close,
      _runtime_bm_year2_source_blueprint:true,
      _runtime_bm_year2_units23_source_blueprint:true,
      _runtime_bm_year2_source_mode:md
    };
  }

  const originalEffective=window.effectiveRphLessonMap;
  if(typeof originalEffective==='function')window.effectiveRphLessonMap=function(map,...args){
    const out=originalEffective.call(this,map,...args);
    const pair=objectivePair(out);
    if(!pair)return out;
    return {...out,objective:pair.objective,success_criteria:pair.criteria,_runtime_bm_year2_source_blueprint:true,_runtime_bm_year2_units23_source_blueprint:true,_runtime_bm_year2_source_mode:mode(out)};
  };

  const originalPedagogy=window.buildSourceAwarePedagogy;
  if(typeof originalPedagogy==='function')window.buildSourceAwarePedagogy=function(map,ev,built){
    const out=blueprint(map);
    return out||originalPedagogy(map,ev,built);
  };

  window.bmYear2Units23SourceBlueprintMode=mode;
  window.bmYear2Units23SourceBlueprint=blueprint;
})();