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
    // Unit 10 / Tema Kebudayaan — repeated sessions are intentionally distinct.
    '1.2.1@63|W18|S1':'dabus_explore',
    '2.2.1@65|W18|S2':'ambeng_explore',
    '3.2.4@66|W18|S3':'amplang_explore',
    '5.1.4@68|W18|S5':'baju_kurung_tanya',
    '1.2.1@63|W19|S1':'dabus_apply',
    '2.2.1@65|W19|S2':'ambeng_apply',
    '3.2.4@66|W19|S3':'amplang_apply',

    // Unit 11.
    '1.2.2@69|W19|S5':'rumah_kutai',
    '2.3.1@70|W20|S1':'katak_nilai',
    '3.2.4@71|W20|S2':'tokoh_seni_imlak',
    '5.1.2@74|W20|S4':'bidai_transitif',

    // Unit 12.
    '1.1.1@75|W21|S1':'budi_bahasa_explore',
    '2.3.1@76|W21|S2':'baling_nilai_explore',
    '3.3.1@77|W21|S3':'teater_explore',
    '5.1.4@78|W21|S4':'muzium_kata_seru',
    '5.1.4@79|W22|S1':'muzium_padi_seru_perintah',
    '1.1.1@75|W22|S2':'budi_bahasa_apply',
    '2.3.1@76|W22|S3':'baling_nilai_apply',
    '3.3.1@77|W22|S4':'teater_apply',
    '1.2.1@81|W22|S5':'tema4_assessment'
  };

  // These Lesson Map slots conflict with the textbook task itself. Do not invent a blueprint.
  const REVIEW_ONLY={
    '2.2.1@67|W19|S4':'BT m/s 67 memaparkan aktiviti Seni Bahasa menyanyikan lagu “Indahnya Budaya Sabah” dengan SP 4.2.2(i), tetapi Lesson Map semasa menggunakan SP 2.2.1 dan tajuk “Indahnya Budaya Sarawak”. Perlu semakan sumber sebelum RPH khusus dibina.',
    '5.1.2@72|W20|S3':'BT m/s 72–73 ialah aktiviti Kata Perintah, tetapi Lesson Map semasa menggunakan SP 5.1.2 (kata kerja aktif/pasif). Perlu semakan SP sebelum RPH khusus dibina.'
  };

  function mode(m){
    if(subjectKey(m)!=='bm'||year(m)!==2)return'';
    return ROUTES[routeKey(m)]||'';
  }
  function reviewReason(m){
    if(subjectKey(m)!=='bm'||year(m)!==2)return'';
    return REVIEW_ONLY[routeKey(m)]||'';
  }

  const C={
    dabus_explore:{
      title:'Menariknya Tarian Dabus',
      objective:p=>`Pada akhir PdP, murid dapat menjelaskan sekurang-kurangnya tiga maklumat budaya berdasarkan gambar dan peta pada ${p} secara bertatasusila.`,
      criteria:'Murid menyatakan lokasi Tarian Dabus serta sekurang-kurangnya dua maklumat lain yang dapat disahkan daripada bahan sumber.',
      induction:'Guru memaparkan peta Malaysia dan beberapa gambar budaya pada halaman sumber. Murid meneka negeri yang berkaitan sebelum menyemak pada Buku Teks.',
      bbm:['Buku Teks m/s 63–64','peta Malaysia','kad gambar budaya','BA1 m/s 71'],
      support:[step('u10-63-s1','Padan Budaya–Negeri','Murid memadankan gambar budaya dengan negeri menggunakan pilihan terhad, kemudian menyebut ayat lengkap seperti “Tarian Dabus berasal dari Perak.”','Buku Teks m/s 63–64; kad gambar; peta','Guided Speaking')],
      core:[step('u10-63-c1','Peta Budaya','Pasangan memilih Tarian Dabus dan dua bahan budaya lain pada halaman, menunjukkan lokasinya pada peta dan menerangkan maklumat yang tercetak pada sumber.','Buku Teks m/s 63–64; peta Malaysia','Pair Explain')],
      challenge:[step('u10-63-h1','Penerangan Berbukti','Murid memberikan penerangan ringkas tentang Tarian Dabus dan menyebut bahagian gambar/peta yang menjadi bukti kepada maklumat tersebut.','Buku Teks m/s 63–64','Evidence Talk')],
      close:'Murid melengkapkan ayat lisan: “Satu budaya yang saya pelajari ialah ___ dari negeri ___.”'
    },
    dabus_apply:{
      title:'Menariknya Tarian Dabus — Aplikasi',
      objective:p=>`Pada akhir PdP, murid dapat mengaplikasikan kemahiran menjelaskan maklumat budaya daripada ${p} dalam BA1 m/s 71 dan penerangan lisan tanpa mengulang aktiviti penerokaan.`,
      criteria:'Murid menyiapkan latihan BA dan menerangkan sekurang-kurangnya dua maklumat budaya dengan sebutan serta bahasa yang sesuai.',
      induction:'Guru menunjukkan dua ikon negeri tanpa label. Murid mengingat kembali budaya yang berkaitan secara pantas.',
      bbm:['Buku Teks m/s 63–64','BA1 m/s 71','kad negeri'],
      support:[step('u10-63a-s1','BA dengan Petunjuk Peta','Murid menggunakan peta dan kad negeri sebagai bantuan untuk melengkapkan latihan BA1 m/s 71.','BA1 m/s 71; peta Malaysia','Guided Application')],
      core:[step('u10-63a-c1','BA + Terangkan','Murid menyiapkan BA1 m/s 71, kemudian pasangan memilih dua jawapan untuk diterangkan secara lisan dengan merujuk sumber.','BA1 m/s 71; Buku Teks m/s 63–64','Pair Check')],
      challenge:[step('u10-63a-h1','Banding Dua Budaya','Murid membandingkan dua bahan budaya pada halaman dari segi negeri atau jenis budaya menggunakan maklumat yang benar-benar ada pada sumber.','Buku Teks m/s 63–64','Compare and Explain')],
      close:'Seorang murid menyebut budaya, seorang lagi menyebut negeri yang betul.'
    },
    ambeng_explore:{
      title:'Nasi Ambeng',
      objective:p=>`Pada akhir PdP, murid dapat mengenal pasti idea utama dan idea sampingan untuk menyatakan idea keseluruhan teks “Nasi Ambeng” pada ${p}.`,
      criteria:'Murid mengenal pasti makanan tradisi masyarakat Jawa, komponen hidangan dan keistimewaan makan beramai-ramai sebelum merumuskan idea keseluruhan.',
      induction:'Guru menunjukkan kata “nasi ambeng” dan beberapa komponen hidangan. Murid meramal jenis makanan sebelum membaca dialog.',
      bbm:['Buku Teks m/s 65','BA1 m/s 72–73','kad idea utama/sampingan'],
      support:[step('u10-65-s1','Cari Fakta Utama','Murid mencari tiga fakta bertanda: siapa masyarakatnya, makanan yang terdapat dalam hidangan dan cara hidangan dimakan.','Buku Teks m/s 65; kad petunjuk','Guided Reading')],
      core:[step('u10-65-c1','Utama–Sampingan–Keseluruhan','Pasangan mengasingkan idea utama dan idea sampingan pada kad, kemudian membina satu ayat idea keseluruhan yang merangkumi makanan tradisi serta nilai kebersamaan.','Buku Teks m/s 65; kad idea','Think-Pair-Share')],
      challenge:[step('u10-65-h1','Rumusan Berbukti','Murid menulis atau menyatakan rumusan satu hingga dua ayat dan menunjukkan dua bukti teks yang menyokong rumusan tersebut.','Buku Teks m/s 65','Evidence Summary')],
      close:'Murid menyatakan idea keseluruhan teks dalam satu ayat.'
    },
    ambeng_apply:{
      title:'Nasi Ambeng — Aplikasi',
      objective:p=>`Pada akhir PdP, murid dapat mengaplikasikan kemahiran merumus idea keseluruhan teks “Nasi Ambeng” daripada ${p} melalui BA1 m/s 72–73.`,
      criteria:'Murid melengkapkan BA dan dapat membezakan sekurang-kurangnya satu idea utama daripada dua idea sampingan.',
      induction:'Guru membaca tiga pernyataan daripada sesi lalu. Murid mengangkat kad U untuk idea utama atau S untuk idea sampingan.',
      bbm:['Buku Teks m/s 65','BA1 m/s 72–73','kad U/S'],
      support:[step('u10-65a-s1','Klasifikasi U/S','Murid mengelaskan pernyataan kepada idea utama atau sampingan sebelum menjawab item BA.','kad U/S; BA1 m/s 72–73','Classification')],
      core:[step('u10-65a-c1','BA + Bukti Dialog','Murid menyiapkan BA, kemudian menanda ayat dialog pada Buku Teks yang menyokong dua jawapan mereka.','BA1 m/s 72–73; Buku Teks m/s 65','Evidence Check')],
      challenge:[step('u10-65a-h1','Baiki Rumusan','Murid membandingkan dua rumusan dan membaiki rumusan yang terlalu sempit supaya meliputi idea keseluruhan teks.','kad rumusan','Peer Reasoning')],
      close:'Murid menyebut satu idea utama dan satu idea sampingan tanpa melihat kad.'
    },
    amplang_explore:{
      title:'Sedapnya Amplang',
      objective:p=>`Pada akhir PdP, murid dapat menulis perkataan dan frasa yang diimlakkan berdasarkan bahan “Sedapnya Amplang” pada ${p} dengan ejaan yang betul.`,
      criteria:'Murid menulis sekurang-kurangnya lima perkataan atau frasa sumber dengan ejaan tepat dan menyemaknya dengan teks selepas imlak.',
      induction:'Guru menunjukkan beberapa perkataan sumber seperti “ikan tenggiri”, “tepung ubi”, “bebola” dan “doh”. Murid membaca dahulu sebelum aktiviti imlak.',
      bbm:['Buku Teks m/s 66','BA1 m/s 74','kad perkataan/frasa','buku latihan'],
      support:[step('u10-66-s1','Dengar–Pilih–Tulis','Guru mengimlakkan perkataan atau frasa; murid memilih kad padanan sebelum menulis untuk mengurangkan beban ejaan.','kad perkataan; buku latihan','Guided Dictation')],
      core:[step('u10-66-c1','Imlak Amplang','Guru mengimlakkan perkataan dan frasa daripada bahan serta urutan pembuatan amplang. Murid menulis, kemudian menyemak ejaan dengan Buku Teks.','Buku Teks m/s 66; buku latihan','Dictation + Self-Check')],
      challenge:[step('u10-66-h1','Imlak Frasa Panjang','Murid menulis frasa yang lebih panjang daripada sumber dan menandakan sendiri bahagian ejaan yang diperbetulkan selepas semakan.','Buku Teks m/s 66','Independent Dictation')],
      close:'Murid memilih satu perkataan yang dibetulkan dan menerangkan ejaan yang tepat.'
    },
    amplang_apply:{
      title:'Sedapnya Amplang — Aplikasi',
      objective:p=>`Pada akhir PdP, murid dapat mengaplikasikan kemahiran imlak perkataan dan frasa daripada ${p} melalui BA1 m/s 74 dengan ejaan yang tepat.`,
      criteria:'Murid menyiapkan latihan BA dan membetulkan sekurang-kurangnya satu ejaan berdasarkan semakan kendiri atau rakan.',
      induction:'Guru mengimlakkan dua perkataan sesi lalu tanpa bantuan visual sebagai ulang kaji pantas.',
      bbm:['Buku Teks m/s 66','BA1 m/s 74','senarai semak ejaan'],
      support:[step('u10-66a-s1','BA Berpetunjuk','Murid menggunakan senarai perkataan sumber sebagai rujukan terhad ketika menyiapkan BA1 m/s 74.','BA1 m/s 74; kad rujukan','Guided Application')],
      core:[step('u10-66a-c1','BA + Semak Pasangan','Murid menyiapkan BA, bertukar hasil dengan pasangan dan menyemak ejaan menggunakan halaman sumber.','BA1 m/s 74; Buku Teks m/s 66','Peer Check')],
      challenge:[step('u10-66a-h1','Imlak Ayat Ringkas','Murid menulis satu ayat pendek yang diimlakkan menggunakan perkataan sumber tanpa melihat teks, kemudian menyemak sendiri.','buku latihan','Accuracy Extension')],
      close:'Murid menyebut strategi yang membantu mereka mengeja dengan tepat.'
    },
    baju_kurung_tanya:{
      title:'Baju Kurung Kedah',
      objective:p=>`Pada akhir PdP, murid dapat mengenal pasti dan menggunakan kata tanya berdasarkan maklumat “Baju Kurung Kedah” pada ${p} dengan betul.`,
      criteria:'Murid memilih kata tanya yang sesuai dan membina sekurang-kurangnya tiga soalan berdasarkan fakta atau maklumat lawatan yang diberi.',
      induction:'Guru memaparkan kata apa, siapa, mana, bila, bagaimana dan mengapa. Murid memilih kata tanya untuk soalan mudah tentang pakaian.',
      bbm:['Buku Teks m/s 68','BA1 m/s 76','kad kata tanya'],
      support:[step('u10-68-s1','Padan Kata Tanya','Murid memadankan permulaan soalan dengan jawapan fakta seperti nama pakaian, siapa pemakai dan bila dipakai.','Buku Teks m/s 68; kad kata tanya','Matching')],
      core:[step('u10-68-c1','Bina Soalan daripada Fakta','Pasangan menggunakan fakta Baju Kurung Kedah serta maklumat lawatan Muzium Negeri Kedah untuk membina dan menjawab soalan yang sesuai.','Buku Teks m/s 68','Pair Questioning')],
      challenge:[step('u10-68-h1','Soalan Berbeza, Fakta Sama','Murid membina dua soalan berlainan daripada satu set maklumat tanpa mengubah fakta sumber.','kad fakta','Question Design')],
      close:'Guru memberi satu jawapan; murid mencadangkan kata tanya yang paling sesuai.'
    },
    rumah_kutai:{
      title:'Uniknya Rumah Kutai',
      objective:p=>`Pada akhir PdP, murid dapat menjelaskan maklumat tersurat dan tersirat tentang Rumah Kutai pada ${p} menggunakan bukti yang sesuai.`,
      criteria:'Murid menyatakan sekurang-kurangnya dua fakta tersurat dan dua inferens munasabah yang disokong oleh fakta pada bahan.',
      induction:'Guru menunjukkan kata “kayu”, “anyaman buluh”, “atap rumbia” dan “bertiang tinggi”. Murid meramal ciri rumah tradisional sebelum membaca.',
      bbm:['Buku Teks m/s 69','BA1 m/s 77–78','kad tersurat/tersirat'],
      support:[step('u11-69-s1','Tersurat atau Tersirat','Murid mengelaskan pernyataan yang terus tercetak dalam teks dan pernyataan yang perlu dibuat inferens.','kad T/T; Buku Teks m/s 69','Classification')],
      core:[step('u11-69-c1','Fakta → Inferens','Pasangan memilih fakta seperti atap rumbia atau rumah bertiang tinggi lalu melengkapkan ayat “Hal ini mungkin kerana ...” dengan alasan yang munasabah.','Buku Teks m/s 69','Evidence-Inference Pair')],
      challenge:[step('u11-69-h1','Bela Inferens','Murid memilih satu inferens dan mempertahankannya dengan sekurang-kurangnya satu bukti tersurat daripada halaman.','Buku Teks m/s 69','Reasoning Talk')],
      close:'Murid menyebut satu fakta tersurat dan satu inferens yang berkaitan.'
    },
    katak_nilai:{
      title:'Lompat Si Katak Lompat',
      objective:p=>`Pada akhir PdP, murid dapat mengenal pasti sekurang-kurangnya tiga nilai dalam seni kata lagu “Lompat Si Katak Lompat” pada ${p} dan menyokongnya dengan bukti lirik.`,
      criteria:'Murid memadankan nilai seperti menghargai masa, kerajinan atau hemah tinggi dengan bahagian lirik yang sesuai.',
      induction:'Guru memaparkan tiga nilai: menghargai masa, kerajinan dan hemah tinggi. Murid meramal baris lirik yang mungkin menunjukkan setiap nilai.',
      bbm:['Buku Teks m/s 70','BA1 m/s 79–80','kad nilai','kad petikan lirik ringkas'],
      support:[step('u11-70-s1','Padan Nilai–Bukti','Murid memadankan kad nilai dengan petikan lirik ringkas yang disediakan daripada halaman sumber.','kad nilai; kad bukti','Matching')],
      core:[step('u11-70-c1','Detektif Nilai','Kumpulan membaca seni kata, menandakan baris yang menunjukkan nilai dan menerangkan mengapa baris itu sepadan.','Buku Teks m/s 70','Text Evidence')],
      challenge:[step('u11-70-h1','Nilai kepada Tindakan','Murid memilih satu nilai dan memberi contoh tindakan harian yang selari, kemudian menghubungkannya kembali kepada lirik sumber.','Buku Teks m/s 70','Value Transfer')],
      close:'Murid melengkapkan ayat: “Nilai ___ dapat dilihat apabila lirik menyatakan ___.”'
    },
    tokoh_seni_imlak:{
      title:'Tokoh Seni',
      objective:p=>`Pada akhir PdP, murid dapat menulis ayat yang diimlakkan berdasarkan teks “Tokoh Seni” pada ${p} dengan ejaan dan tanda baca yang betul.`,
      criteria:'Murid menulis sekurang-kurangnya dua ayat imlak dengan nama khas dan ejaan yang tepat, kemudian membaiki kesalahan selepas semakan sumber.',
      induction:'Guru memaparkan beberapa nama khas daripada teks seperti Profesor Doktor Siti Zainon binti Ismail, Gombak dan Kuala Lumpur untuk latihan ejaan.',
      bbm:['Buku Teks m/s 71','BA1 m/s 81–82','buku latihan','senarai semak ejaan'],
      support:[step('u11-71-s1','Imlak Bersegmen','Guru membaca ayat dalam beberapa frasa pendek. Murid menulis setiap segmen dan mendapat masa semak sebelum segmen seterusnya.','buku latihan; kad nama khas','Scaffolded Dictation')],
      core:[step('u11-71-c1','Imlak Tokoh Seni','Guru mengimlakkan dua ayat daripada kandungan teks. Murid menulis, kemudian menyemak ejaan nama khas dan tanda baca dengan Buku Teks.','Buku Teks m/s 71; buku latihan','Dictation + Self-Check')],
      challenge:[step('u11-71-h1','Editor Nama Khas','Murid meneliti hasil sendiri, membulatkan nama khas dan memastikan huruf besar serta tanda baca digunakan dengan tepat.','hasil tulisan; Buku Teks m/s 71','Self-Editing')],
      close:'Murid menunjukkan satu pembetulan ejaan atau tanda baca yang dibuat selepas semakan.',
      discrepancy:'Lesson Map semasa menyimpan SK 5.1 tetapi SP 3.2.4 dan tugasan Buku Teks jelas berkaitan imlak. Blueprint hanya menggunakan SP/tugasan sumber dan tidak mengubah Lesson Map.'
    },
    bidai_transitif:{
      title:'Cantiknya Bidai',
      objective:p=>`Pada akhir PdP, murid dapat mengenal pasti dan menggunakan kata kerja aktif transitif dalam teks “Cantiknya Bidai” pada ${p} bersama objek yang sesuai.`,
      criteria:'Murid memadankan sekurang-kurangnya empat kata kerja seperti menebang, membelah, mengikat, menyusun, memasang atau menghalang dengan objek yang sesuai.',
      induction:'Guru menunjukkan beberapa kata kerja sumber tanpa objek. Murid melengkapkan secara lisan dengan objek yang munasabah.',
      bbm:['Buku Teks m/s 74','kad kata kerja','kad objek'],
      support:[step('u11-74-s1','Pasang Kerja–Objek','Murid memadankan kata kerja sumber dengan objek seperti pokok rotan, rotan, bidai atau cahaya matahari.','kad kata kerja; kad objek','Matching')],
      core:[step('u11-74-c1','Lengkap Proses Bidai','Pasangan melengkapkan tempat kosong dalam teks dengan kata kerja aktif transitif yang sesuai dan menggariskan objek selepas kata kerja.','Buku Teks m/s 74','Pair Check')],
      challenge:[step('u11-74-h1','Bina Ayat Baharu','Murid membina dua ayat menggunakan kata kerja aktif transitif sumber dan menandakan kata kerja serta objek.','buku latihan','Grammar Extension')],
      close:'Guru menyebut satu kata kerja; murid menjawab dengan objek yang sesuai.'
    },
    budi_bahasa_explore:{
      title:'Berbudi Bahasa Budaya Kita',
      objective:p=>`Pada akhir PdP, murid dapat mendengar, mengecam dan menyebut frasa serta ayat berbudi bahasa pada ${p} dengan betul dan tepat.`,
      criteria:'Murid mengecam sekurang-kurangnya tiga ungkapan atau ayat sopan dan menggunakannya dalam simulasi ringkas.',
      induction:'Guru menyebut “Selamat sejahtera”, “Apa khabar?” dan “Terima kasih”. Murid mengenal pasti situasi yang sesuai untuk setiap ungkapan.',
      bbm:['Buku Teks m/s 75','BA1 m/s 85–86','kad situasi sopan'],
      support:[step('u12-75-s1','Dengar dan Pilih','Murid mendengar ungkapan yang dibaca guru lalu memilih gambar situasi yang sepadan.','kad ungkapan; kad situasi','Listen and Match')],
      core:[step('u12-75-c1','Simulasi Berbudi Bahasa','Pasangan melakonkan situasi berjumpa guru, bertanya khabar atau membantu orang lain menggunakan frasa dan ayat daripada sumber.','Buku Teks m/s 75','Role Play')],
      challenge:[step('u12-75-h1','Pilih Ungkapan Paling Sesuai','Murid menerima situasi baharu yang setara dan memilih ungkapan sopan paling sesuai serta menjelaskan sebab.','kad situasi','Pragmatic Reasoning')],
      close:'Murid menyebut satu ungkapan sopan dan situasi penggunaannya.'
    },
    budi_bahasa_apply:{
      title:'Berbudi Bahasa Budaya Kita — Aplikasi',
      objective:p=>`Pada akhir PdP, murid dapat mengaplikasikan frasa dan ayat berbudi bahasa daripada ${p} melalui BA1 m/s 85–86 dan simulasi baharu.`,
      criteria:'Murid menyiapkan latihan BA dan menggunakan sekurang-kurangnya dua ungkapan sopan dalam konteks yang tepat.',
      induction:'Guru memberi tiga situasi pantas; murid menyebut ungkapan sesuai tanpa membuka Buku Teks.',
      bbm:['Buku Teks m/s 75','BA1 m/s 85–86','kad situasi'],
      support:[step('u12-75a-s1','BA dengan Bank Frasa','Murid menggunakan bank frasa terhad untuk membantu melengkapkan latihan BA.','BA1 m/s 85–86; bank frasa','Guided Application')],
      core:[step('u12-75a-c1','BA + Lakon Semula','Murid menyiapkan BA kemudian memilih satu jawapan untuk dijadikan simulasi lisan bersama pasangan.','BA1 m/s 85–86','Pair Application')],
      challenge:[step('u12-75a-h1','Baiki Dialog','Murid membaiki dialog yang kurang sopan dengan menggantikan ungkapan kepada bentuk yang sesuai berdasarkan sumber.','kad dialog','Dialogue Editing')],
      close:'Kelas memilih satu contoh bahasa sopan yang boleh diamalkan setiap hari.'
    },
    baling_nilai_explore:{
      title:'Asal Usul Nama Baling, Kedah',
      objective:p=>`Pada akhir PdP, murid dapat mengenal pasti nilai dalam teks “Asal Usul Nama Baling, Kedah” pada ${p} dan memberikan bukti daripada peristiwa cerita.`,
      criteria:'Murid menyatakan sekurang-kurangnya tiga nilai atau sikap yang disokong oleh tindakan watak dalam teks.',
      induction:'Guru menunjukkan frasa “bantu-membantu”, “bekerja siang dan malam” dan “bermesyuarat”. Murid meneka nilai yang tersirat.',
      bbm:['Buku Teks m/s 76','BA1 m/s 87–88','kad nilai/bukti'],
      support:[step('u12-76-s1','Padan Nilai–Peristiwa','Murid memadankan nilai seperti kerajinan dan kerjasama dengan peristiwa yang benar-benar terdapat dalam teks.','kad nilai; kad peristiwa','Matching')],
      core:[step('u12-76-c1','Nilai dengan Bukti','Pasangan memilih tiga tindakan petani dan menulis atau menyebut nilai yang ditunjukkan serta bukti teks.','Buku Teks m/s 76','Evidence Pair Check')],
      challenge:[step('u12-76-h1','Nilai Paling Kuat','Murid memilih nilai yang paling menonjol dalam cerita dan mempertahankan pilihan menggunakan dua bukti peristiwa.','Buku Teks m/s 76','Reasoning Talk')],
      close:'Murid melengkapkan ayat: “Nilai ___ ditunjukkan apabila petani ___.”'
    },
    baling_nilai_apply:{
      title:'Asal Usul Nama Baling, Kedah — Aplikasi',
      objective:p=>`Pada akhir PdP, murid dapat mengaplikasikan kemahiran mengenal pasti nilai daripada ${p} melalui BA1 m/s 87–88 tanpa mengulang aktiviti penerokaan.`,
      criteria:'Murid menyiapkan BA dan memberi sekurang-kurangnya dua jawapan nilai yang disertai bukti teks.',
      induction:'Guru menyebut satu peristiwa; murid mengangkat kad nilai yang sesuai.',
      bbm:['Buku Teks m/s 76','BA1 m/s 87–88','kad nilai'],
      support:[step('u12-76a-s1','BA dengan Pilihan Nilai','Murid memilih nilai daripada senarai terhad sebelum mencari bukti pada teks.','BA1 m/s 87–88; kad nilai','Guided Application')],
      core:[step('u12-76a-c1','BA + Garis Bukti','Selepas menjawab BA, murid menggariskan ayat sumber yang menyokong dua jawapan mereka.','BA1 m/s 87–88; Buku Teks m/s 76','Evidence Check')],
      challenge:[step('u12-76a-h1','Nilai kepada Kehidupan','Murid memberi contoh amalan nilai yang sama dalam konteks sekolah dan menghubungkannya kembali kepada peristiwa teks.','kad situasi sekolah','Transfer Task')],
      close:'Murid menyebut satu nilai dan satu bukti tanpa bantuan kad.'
    },
    teater_explore:{
      title:'Seronoknya Menonton Teater',
      objective:p=>`Pada akhir PdP, murid dapat menghasilkan karangan separa terkawal berdasarkan bahan “Seronoknya Menonton Teater” pada ${p} dengan urutan cerita yang lengkap.`,
      criteria:'Murid melengkapkan tempat kosong menggunakan maklumat sesuai, mengekalkan urutan cerita “Pemuda yang Jujur” dan menghasilkan perenggan yang boleh dibaca.',
      induction:'Guru menyusun tiga kad peristiwa: masuk ke tempat kejadian, menemukan selendang dan mengembalikan selendang. Murid meramal urutan cerita.',
      bbm:['Buku Teks m/s 77','BA1 m/s 89–91','kad urutan cerita'],
      support:[step('u12-77-s1','Lengkap dengan Bank Kata','Murid menggunakan bank kata yang disediakan untuk melengkapkan tempat kosong dalam karangan separa terkawal.','Buku Teks m/s 77; bank kata','Guided Writing')],
      core:[step('u12-77-c1','Lengkap dan Susun Cerita','Murid melengkapkan teks, menyemak urutan peristiwa dan membaca semula karangan kepada pasangan.','Buku Teks m/s 77','Pair Writing Check')],
      challenge:[step('u12-77-h1','Tambah Ayat Penutup','Murid menambah satu ayat penutup tentang pengajaran kejujuran tanpa mengubah peristiwa asal cerita.','buku latihan','Controlled Extension')],
      close:'Murid menyatakan pengajaran utama cerita dalam satu ayat.'
    },
    teater_apply:{
      title:'Seronoknya Menonton Teater — Aplikasi',
      objective:p=>`Pada akhir PdP, murid dapat memurnikan dan mengaplikasikan penulisan separa terkawal daripada ${p} melalui BA1 m/s 89–91.`,
      criteria:'Murid menyiapkan latihan BA, menyemak urutan serta membaiki sekurang-kurangnya satu aspek ejaan, tanda baca atau kelancaran ayat.',
      induction:'Guru menunjukkan dua ayat daripada cerita yang tertukar urutannya. Murid menentukan susunan yang logik.',
      bbm:['Buku Teks m/s 77','BA1 m/s 89–91','senarai semak penulisan'],
      support:[step('u12-77a-s1','BA Berpanduan Urutan','Murid menggunakan kad “mula–kemudian–akhirnya” ketika menyiapkan latihan BA.','BA1 m/s 89–91; kad urutan','Scaffolded Writing')],
      core:[step('u12-77a-c1','BA + Editor Pasangan','Pasangan bertukar hasil dan menyemak urutan, ejaan serta tanda baca tanpa menulis jawapan bagi rakan.','BA1 m/s 89–91; senarai semak','Peer Editing')],
      challenge:[step('u12-77a-h1','Perkemas Ayat','Murid memilih satu ayat yang kurang lancar dan menulis semula supaya lebih jelas sambil mengekalkan fakta cerita.','hasil tulisan','Sentence Revision')],
      close:'Murid menunjukkan satu pembaikan yang dibuat pada karangan sendiri.'
    },
    muzium_kata_seru:{
      title:'Sehari di Muzium Kaca',
      objective:p=>`Pada akhir PdP, murid dapat mengenal pasti dan menggunakan kata seru berdasarkan situasi lawatan Muzium Kaca pada ${p} dengan tepat.`,
      criteria:'Murid memilih kata seru yang sesuai untuk sekurang-kurangnya empat situasi perasaan seperti kagum, terkejut atau hairan.',
      induction:'Guru menyebut “Wah!”, “Amboi!”, “Oh!” dan “Eh!”. Murid memadankan setiap kata seru dengan ekspresi/perasaan yang sesuai.',
      bbm:['Buku Teks m/s 78','BA1 m/s 92','kad kata seru','kad situasi'],
      support:[step('u12-78-s1','Padan Perasaan–Kata Seru','Murid memadankan kata seru dengan gambar ekspresi dan ayat daripada situasi muzium.','kad kata seru; kad ekspresi','Matching')],
      core:[step('u12-78-c1','Lengkap Dialog Muzium','Pasangan melengkapkan dialog pada halaman dengan kata seru yang sesuai dan membaca dialog dengan intonasi yang sepadan.','Buku Teks m/s 78','Pair Dialogue')],
      challenge:[step('u12-78-h1','Cipta Satu Situasi','Murid membina satu ayat seruan baharu berkaitan objek muzium dengan kata seru yang tepat.','kad objek muzium','Speaking Extension')],
      close:'Guru memberi satu perasaan; murid menyebut kata seru yang sesuai.'
    },
    muzium_padi_seru_perintah:{
      title:'Lawatan ke Muzium Padi',
      objective:p=>`Pada akhir PdP, murid dapat menggunakan kata seru dan kata perintah mengikut konteks lawatan Muzium Padi pada ${p} dengan betul.`,
      criteria:'Murid membezakan fungsi kata seru daripada kata perintah dan melengkapkan sekurang-kurangnya empat ayat dengan perkataan yang sesuai.',
      induction:'Guru memaparkan dua kumpulan kad: “Eh/Oh/Wah/Amboi” dan “minta/sila/tolong/jangan”. Murid menyatakan perbezaan fungsi.',
      bbm:['Buku Teks m/s 79','kad kata seru/perintah','kad dialog lawatan'],
      support:[step('u12-79-s1','Dua Bakul Kata','Murid mengelaskan kad kepada kata seru atau kata perintah sebelum melengkapkan ayat mudah.','kad perkataan','Classification')],
      core:[step('u12-79-c1','Lakon Lawatan Muzium','Kumpulan melengkapkan dialog lawatan dan melakonkannya dengan penggunaan “sila”, “tolong”, “jangan” serta kata seru yang sesuai.','Buku Teks m/s 79','Role Play')],
      challenge:[step('u12-79-h1','Pilih Berdasarkan Niat','Murid menerangkan mengapa sesuatu ayat memerlukan kata perintah tertentu dan bukan kata seru, kemudian memberi satu contoh baharu.','kad situasi','Language Reasoning')],
      close:'Murid menyebut satu kata seru dan satu kata perintah bersama contoh penggunaannya.'
    },
    tema4_assessment:{
      title:'Penilaian Tema 4',
      objective:p=>`Pada akhir PdP, murid dapat menjelaskan maklumat alat muzik tradisional secara bertatasusila dan menyatakan idea keseluruhan teks tentang lepa berdasarkan ${p}.`,
      criteria:'Murid menerangkan maklumat sundatang daripada bahan dan menghasilkan satu rumusan idea keseluruhan tentang fungsi serta nilai budaya lepa.',
      induction:'Guru menunjukkan dua kata kunci “sundatang” dan “lepa”. Murid menyatakan apa yang mereka jangka akan dinilai daripada bahan.',
      bbm:['Buku Teks m/s 81','kad maklumat sundatang','peta idea lepa'],
      support:[step('u12-81-s1','Baca Kad Maklumat','Murid menggunakan kerangka nama–popular di–bahan untuk menerangkan sundatang dengan ayat lengkap.','Buku Teks m/s 81; kad kerangka','Guided Speaking')],
      core:[step('u12-81-c1','Dua Bahagian Penilaian','Murid melaksanakan Bahagian A dengan penerangan lisan tentang sundatang, kemudian membaca teks lepa dan menulis satu ayat idea keseluruhan.','Buku Teks m/s 81','Individual Assessment')],
      challenge:[step('u12-81-h1','Rumusan Lepa Berbukti','Murid menyatakan idea keseluruhan lepa dan memilih dua fakta teks yang menyokong fungsi serta nilai warisannya.','Buku Teks m/s 81','Evidence Summary')],
      close:'Murid menyebut satu warisan budaya yang dipelajari dan satu sebab ia wajar dihargai.'
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
    const pakDetail=`Isi PdP datang daripada tugasan sebenar ${p}; sesi berulang menggunakan aplikasi/BA yang berbeza daripada penerokaan. Activity Library hanya memvariasikan pelaksanaan, bukan menentukan isi.${c.discrepancy?' Catatan sumber: '+c.discrepancy:''}`;
    return {
      method:'Aktiviti source-first BM Tahun 2 berdasarkan RPT + DSKP + Buku Teks',
      pakDetail,
      anchor:`${c.title} — ${p}`,
      kind:'source_task',
      bbmList:c.bbm,
      groupBbm:{support:c.bbm.join('; '),core:c.bbm.join('; '),challenge:c.bbm.join('; ')},
      mainSp:mainSp(m),page:p,topic:c.title,
      setInduksi:c.induction,
      inductionData:{name:'Set Induksi Sumber',text:c.induction,bbm:p,pak21:'Think-Pair-Share'},
      librarySteps:{support:c.support,core:c.core,challenge:c.challenge},
      diffSupport:'Tugasan sumber yang sama dengan pilihan terhad, kad petunjuk atau kerangka jawapan.',
      diffCore:'Melaksanakan tugasan sebenar Buku Teks dan BA yang dirujuk RPT dengan bukti daripada sumber.',
      diffChallenge:'Melaksanakan tugasan yang sama secara lebih kendiri serta memberikan alasan, bukti atau pemurnian bahasa.',
      diffSupportAct:c.support.map(x=>x.text).join(' '),
      diffCoreAct:c.core.map(x=>x.text).join(' '),
      diffChallengeAct:c.challenge.map(x=>x.text).join(' '),
      pbdEvidence:{method:'Pemerhatian + respons/hasil sumber',evidence:'Prestasi murid dinilai terus melalui tugasan Buku Teks dan BA yang dirujuk oleh RPT.',criterion:pair.criteria},
      penutup:c.close,
      _runtime_bm_year2_units10_12_source_blueprint:true,
      _runtime_bm_year2_units10_12_mode:md,
      _runtime_source_discrepancy:c.discrepancy||null
    };
  }

  const originalEffective=window.effectiveRphLessonMap;
  if(typeof originalEffective==='function')window.effectiveRphLessonMap=function(map,...args){
    const out=originalEffective.call(this,map,...args);
    const reason=reviewReason(out);
    if(reason)return {...out,_runtime_source_review_required:true,_runtime_source_review_reason:reason};
    const pair=objectivePair(out);
    if(!pair)return out;
    return {...out,objective:pair.objective,success_criteria:pair.criteria,_runtime_bm_year2_units10_12_source_blueprint:true,_runtime_bm_year2_units10_12_mode:mode(out)};
  };

  const originalPedagogy=window.buildSourceAwarePedagogy;
  if(typeof originalPedagogy==='function')window.buildSourceAwarePedagogy=function(map,ev,built){
    if(reviewReason(map))return originalPedagogy(map,ev,built);
    const out=blueprint(map);
    return out||originalPedagogy(map,ev,built);
  };

  window.bmYear2Units10to12SourceBlueprintMode=mode;
  window.bmYear2Units10to12SourceBlueprint=blueprint;
  window.bmYear2Units10to12SourceReviewReason=reviewReason;
})();