(function(){
  'use strict';

  const subjectKey=m=>{try{return window.rphSubjectKey?.(m?.subject_id)||''}catch{return''}};
  const mainSp=m=>String(m?.source_evidence?.meta?.main_sp||String(m?.sp||'').split(',')[0]||'').trim();
  const year=m=>Number(m?.year||0)||0;
  const page=m=>Number(m?.textbook_page_start||0)||0;
  const pageLabel=m=>page(m)?`Buku Teks m/s ${page(m)}`:'Buku Teks';
  const step=(key,name,text,bbm,pak21)=>({key,name,text,bbm,pak21,phase:'source'});

  const ROUTES={
    '1.2.1@138':'money_for_aimi',
    '2.2.1@139':'save_money',
    '3.3.2@140':'edit_spelling',
    '5.2.1@141':'affixes_postoffice',
    '5.2.2@142':'compound_words_services',
    '1.2.2@143':'role_model',
    '2.3.1@144':'business_pantun',
    '3.3.2@145':'edit_punctuation',
    '5.3.1@146':'family_restaurant',
    '1.2.2@147':'sports_shirt_compare',
    '2.3.2@148':'make_choice_story',
    '3.2.3@149':'jamil_money_table',
    '5.3.2@150':'single_compound_money'
  };

  function mode(m){
    if(subjectKey(m)!=='bm'||year(m)!==1)return'';
    return ROUTES[`${mainSp(m)}@${page(m)}`]||'';
  }

  const C={
    money_for_aimi:{
      sourceTitle:'Wang untuk Aimi',
      objective:p=>`Pada akhir PdP, murid dapat bertutur berdasarkan situasi pengurusan wang pada ${p} dengan sebutan yang jelas, intonasi yang sesuai dan bahasa yang bertatasusila.`,
      criteria:'Murid memberikan sekurang-kurangnya tiga respons lisan yang sesuai tentang menerima, mengira, menyimpan atau menggunakan wang secara berhemah.',
      induction:'Guru menunjukkan beberapa kad wang mainan dan sebuah tabung. Murid menyatakan tindakan yang sesuai apabila menerima wang saku.',
      support:[
        step('bm1-138-s1','Pilih Respons Sesuai','Murid memilih kad respons yang sesuai untuk situasi menerima wang saku, menyimpan wang dan menggunakan baki wang secara berhemah.','Buku Teks m/s 138; kad situasi; kad respons','Guided Speaking'),
        step('bm1-138-s2','Lakon Dialog Pendek','Secara berpasangan, murid melakonkan dialog ibu–Aimi menggunakan rangka ayat sopan seperti “Baik, ibu” dan “Terima kasih”.','kad dialog; tabung; wang mainan','Role Play')
      ],
      core:[
        step('bm1-138-c1','Baca Situasi dan Bertutur','Murid meneliti dialog serta arahan pada Buku Teks m/s 138 dan melengkapkan respons yang sesuai tentang jumlah wang, simpanan dan penggunaan baki.','Buku Teks m/s 138; wang mainan; tabung','Think-Pair-Speak'),
        step('bm1-138-c2','Jurucakap Berhemah','Pasangan menerangkan satu cara menggunakan wang saku secara berhemah dengan sebutan, intonasi dan bahasa yang sesuai.','Buku Teks m/s 138; kad idea','Pair Presentation')
      ],
      challenge:[
        step('bm1-138-h1','Bina Dialog Kendiri','Murid membina dialog ringkas tentang menerima wang saku, menyimpan sebahagian wang dan menerangkan apa yang akan dilakukan dengan baki.','Buku Teks m/s 138','Independent Speaking'),
        step('bm1-138-h2','Beri Alasan','Murid memilih antara menyimpan atau berbelanja untuk satu situasi dan memberikan alasan yang munasabah secara bertatasusila.','kad situasi wang','Reasoning Talk')
      ],
      close:'Murid melengkapkan ayat secara lisan: “Apabila menerima wang saku, saya akan … kerana …”.',
      bbm:['Buku Teks m/s 138','wang mainan','tabung','kad situasi']
    },
    save_money:{
      sourceTitle:'Rajin Menabung',
      objective:p=>`Pada akhir PdP, murid dapat menyatakan sekurang-kurangnya dua idea tersurat dan dua idea tersirat daripada teks “Rajin Menabung” pada ${p} dengan betul.`,
      criteria:'Murid membezakan fakta yang dinyatakan dalam teks dengan kesimpulan yang dibuat daripada fakta tersebut serta memberikan bukti teks bagi sekurang-kurangnya satu idea tersirat.',
      induction:'Guru menunjukkan dua kad: “Rani menyimpan RM0.50” dan “Rani berjimat-cermat”. Murid meneka yang mana satu dinyatakan secara terus dan yang mana satu perlu difikirkan.',
      support:[
        step('bm1-139-s1','Cari Ayat Terus','Guru membimbing murid mencari ayat yang menyatakan simpanan, baki, pembelian dan derma secara terus dalam teks.','Buku Teks m/s 139; penanda teks','Guided Reading'),
        step('bm1-139-s2','Padan Tersurat–Tersirat','Murid memadankan kad fakta seperti “menyimpan sebelum berbelanja” dengan idea tersirat seperti “berjimat-cermat”.','kad fakta; kad idea','Matching')
      ],
      core:[
        step('bm1-139-c1','Baca, Tanda, Bezakan','Secara berpasangan, murid membaca teks dan menandakan dua idea tersurat. Kemudian mereka menulis atau menyatakan idea tersirat yang boleh disimpulkan daripada setiap fakta.','Buku Teks m/s 139; lembaran dua lajur','Pair Reading'),
        step('bm1-139-c2','Buktikan Idea','Pasangan berkongsi satu idea tersirat dan menunjukkan ayat dalam teks yang menjadi bukti kepada kesimpulan tersebut.','Buku Teks m/s 139','Evidence Talk')
      ],
      challenge:[
        step('bm1-139-h1','Inferens Tanpa Pilihan','Murid menghasilkan dua idea tersirat sendiri daripada fakta tentang menabung, memilih makanan dan menderma.','Buku Teks m/s 139','Independent Inference'),
        step('bm1-139-h2','Nilai Sikap','Murid memilih satu sikap Rani dan abangnya lalu menerangkan bagaimana perbuatan dalam teks menunjukkan sikap tersebut.','Buku Teks m/s 139','Reasoning')
      ],
      close:'Murid memberikan satu contoh idea tersurat dan satu idea tersirat daripada teks.',
      bbm:['Buku Teks m/s 139','kad fakta','kad idea','lembaran dua lajur']
    },
    edit_spelling:{
      sourceTitle:'Membeli Alat Tulis',
      objective:p=>`Pada akhir PdP, murid dapat mengenal pasti dan membetulkan sekurang-kurangnya lima kesalahan ejaan dalam teks “Membeli Alat Tulis” pada ${p} dengan betul.`,
      criteria:'Murid menandakan perkataan salah eja, menulis bentuk ejaan yang betul dan membaca semula ayat yang telah dimurnikan.',
      induction:'Guru memaparkan satu pasangan perkataan betul dan salah daripada konteks teks, kemudian murid memilih ejaan yang tepat.',
      support:[
        step('bm1-140-s1','Cari Perkataan Pelik','Guru memberi senarai perkataan sasaran daripada teks seperti “latehan”, “tingal”, “aya”, “pikir”, “cukop” dan “kentin”. Murid mencari perkataan tersebut dalam halaman.','Buku Teks m/s 140; kad perkataan','Error Hunt'),
        step('bm1-140-s2','Pilih Ejaan Betul','Murid memilih ejaan betul daripada dua pilihan kemudian menggantikan perkataan salah dalam ayat.','kad pilihan ejaan','Guided Editing')
      ],
      core:[
        step('bm1-140-c1','Detektif Ejaan','Murid membaca teks dan menandakan kesalahan ejaan yang sengaja terdapat pada halaman sebelum menulis pembetulan di tepi teks atau lembaran.','Buku Teks m/s 140; lembaran edit','Error Analysis'),
        step('bm1-140-c2','Semak Silang Editor','Pasangan bertukar hasil, menyemak perkataan yang dibetulkan dan membaca semula ayat untuk memastikan ejaan baharu sesuai dengan konteks.','hasil murid; senarai semak','Peer Editing')
      ],
      challenge:[
        step('bm1-140-h1','Edit Tanpa Senarai','Murid mencari dan membetulkan kesalahan tanpa senarai perkataan sasaran.','Buku Teks m/s 140','Independent Editing'),
        step('bm1-140-h2','Jelaskan Pembetulan','Murid memilih dua pembetulan dan menerangkan perubahan huruf yang dibuat daripada ejaan salah kepada ejaan betul.','hasil edit murid','Metalinguistic Talk')
      ],
      close:'Guru memaparkan tiga perkataan asal daripada teks dan murid menulis bentuk ejaan yang betul pada kad jawapan.',
      bbm:['Buku Teks m/s 140','kad perkataan','lembaran edit','senarai semak']
    },
    affixes_postoffice:{
      sourceTitle:'Di Pejabat Pos',
      objective:p=>`Pada akhir PdP, murid dapat mengenal pasti dan menggunakan sekurang-kurangnya empat perkataan berimbuhan awalan atau akhiran dalam perbualan berdasarkan situasi pejabat pos pada ${p}.`,
      criteria:'Murid membezakan imbuhan awalan dan akhiran serta menggunakan perkataan berimbuhan yang sesuai dalam sekurang-kurangnya tiga ayat atau respons lisan.',
      induction:'Guru menunjukkan kata dasar “bayar” dan “ambil”, kemudian menambah imbuhan untuk membentuk “bayaran” dan “mengambil”. Murid menyatakan bahagian yang berubah.',
      support:[
        step('bm1-141-s1','Pisah Kata dan Imbuhan','Murid memadankan kata dasar dengan imbuhan untuk membentuk perkataan seperti mengambil, membilang, mencari dan bayaran.','Buku Teks m/s 141; kad kata dasar; kad imbuhan','Word Building'),
        step('bm1-141-s2','Cakap Ikut Gambar','Murid menggunakan satu perkataan berimbuhan dalam rangka ayat berdasarkan urutan di pejabat pos.','kad gambar; rangka ayat','Guided Speaking')
      ],
      core:[
        step('bm1-141-c1','Jejak Imbuhan di Pejabat Pos','Pasangan meneliti urutan aktiviti di pejabat pos dan mengelaskan perkataan berimbuhan kepada awalan atau akhiran.','Buku Teks m/s 141; jadual dua lajur','Classification'),
        step('bm1-141-c2','Dialog Pejabat Pos','Pasangan berbual berdasarkan gambar dan perlu menggunakan sekurang-kurangnya empat perkataan berimbuhan daripada halaman secara tepat.','Buku Teks m/s 141; kad peranan','Role Play')
      ],
      challenge:[
        step('bm1-141-h1','Bina Perkataan Baharu','Murid membina dua perkataan berimbuhan lain daripada kata dasar yang diberi dan menggunakannya dalam ayat konteks perkhidmatan.','kad kata dasar','Word Extension'),
        step('bm1-141-h2','Terangkan Kedudukan Imbuhan','Murid menerangkan mengapa satu perkataan ialah imbuhan awalan dan satu lagi imbuhan akhiran dengan menunjukkan kedudukan imbuhan.','hasil murid','Grammar Reasoning')
      ],
      close:'Murid menyebut satu perkataan berimbuhan awalan dan satu perkataan berimbuhan akhiran daripada pelajaran.',
      bbm:['Buku Teks m/s 141','kad kata dasar','kad imbuhan','kad peranan']
    },
    compound_words_services:{
      sourceTitle:'Barangan dan Perkhidmatan',
      objective:p=>`Pada akhir PdP, murid dapat mengenal pasti sekurang-kurangnya lima kata majmuk rangkai kata bebas dan membina sekurang-kurangnya tiga ayat berdasarkan ${p} dengan betul.`,
      criteria:'Murid menyenaraikan kata majmuk daripada bahan dan menggunakan sekurang-kurangnya tiga kata majmuk dalam ayat yang gramatis serta sesuai dengan konteks.',
      induction:'Guru menunjukkan dua kad perkataan seperti “nasi” + “ayam” dan “alat” + “tulis”. Murid mencantumkan kad untuk membentuk kata majmuk yang terdapat dalam konteks halaman.',
      support:[
        step('bm1-142-s1','Cantum Dua Kata','Murid memadankan dua kad untuk membentuk kata majmuk seperti nasi ayam, tukang gunting, pasar raya, beg tangan, tali pinggang dan alat tulis.','Buku Teks m/s 142; kad perkataan','Matching'),
        step('bm1-142-s2','Lengkap Ayat','Murid melengkapkan rangka ayat dengan kata majmuk yang sesuai berdasarkan gambar.','kad gambar; rangka ayat','Guided Grammar')
      ],
      core:[
        step('bm1-142-c1','Buruan Kata Majmuk','Pasangan mencari kata majmuk pada halaman, menyalinnya dan memadankan dengan gambar atau situasi barangan/perkhidmatan yang betul.','Buku Teks m/s 142; lembaran kata majmuk','Pair Search'),
        step('bm1-142-c2','Bina Ayat Konteks','Murid memilih tiga kata majmuk dan membina ayat berdasarkan situasi pada halaman seperti salun, pasar raya atau tempat letak kereta.','Buku Teks m/s 142; lembaran ayat','Think-Write-Pair')
      ],
      challenge:[
        step('bm1-142-h1','Kata Majmuk Baharu','Murid mencadangkan dua kata majmuk lain yang sesuai dengan situasi membeli-belah atau perkhidmatan lalu membina ayat.','kad situasi','Vocabulary Extension'),
        step('bm1-142-h2','Uji Konteks','Murid menukar satu kata majmuk dalam ayat dan menilai sama ada ayat baharu masih sesuai dengan konteks.','hasil tulisan','Reasoning')
      ],
      close:'Murid menyebut satu kata majmuk dan menggunakannya dalam satu ayat ringkas.',
      bbm:['Buku Teks m/s 142','kad perkataan','kad gambar','lembaran ayat']
    },
    role_model:{
      sourceTitle:'Jadikan Teladan',
      objective:p=>`Pada akhir PdP, murid dapat menyampaikan sekurang-kurangnya tiga maklumat penting tentang tokoh dalam bahan “Jadikan Teladan” pada ${p} dengan betul.`,
      criteria:'Murid mengenal pasti siapa tokoh, sebab tokoh dianggap berjaya dan sekurang-kurangnya satu sifat yang wajar dicontohi lalu menyampaikannya dengan jelas.',
      induction:'Guru bertanya, “Apakah sifat seorang peniaga yang patut kita contohi?” sebelum murid meneliti bahan tentang Datuk Bahari.',
      support:[
        step('bm1-143-s1','Cari Siapa–Apa–Mengapa','Murid menggunakan tiga kad panduan untuk mencari siapa tokoh, apa kejayaannya dan mengapa sifatnya patut dicontohi.','Buku Teks m/s 143; kad soalan','Guided Retrieval'),
        step('bm1-143-s2','Cakap Ikut Rangka','Murid melengkapkan rangka “Datuk Bahari ialah… Beliau berjaya kerana… Kita boleh mencontohi sifat…”','kad rangka ayat','Guided Speaking')
      ],
      core:[
        step('bm1-143-c1','Kenal Pasti Maklumat','Pasangan meneliti bahan dan menulis tiga maklumat penting tentang Datuk Bahari termasuk sifat suka menolong orang susah.','Buku Teks m/s 143; lembaran 3 fakta','Pair Reading'),
        step('bm1-143-c2','Sampaikan Teladan','Setiap pasangan menyampaikan tiga maklumat tersebut dan menerangkan satu sifat yang boleh dicontohi dalam kehidupan sekolah.','Buku Teks m/s 143','Think-Pair-Share')
      ],
      challenge:[
        step('bm1-143-h1','Ringkasan Lisan','Murid menyampaikan ringkasan bahan dalam tiga atau empat ayat tanpa rangka.','Buku Teks m/s 143','Independent Speaking'),
        step('bm1-143-h2','Hubung dengan Diri','Murid memilih satu sifat tokoh dan memberikan contoh tindakan sebenar yang boleh diamalkan oleh murid.','kad nilai','Application')
      ],
      close:'Murid menyebut satu sifat yang patut dicontohi daripada tokoh dan satu sebab.',
      bbm:['Buku Teks m/s 143','kad soalan','lembaran 3 fakta','kad nilai']
    },
    business_pantun:{
      sourceTitle:'Sikap Baik dalam Berniaga',
      objective:p=>`Pada akhir PdP, murid dapat membaca pantun pada ${p} dengan sebutan dan intonasi yang sesuai serta menyatakan maksud sekurang-kurangnya dua rangkap dengan betul.`,
      criteria:'Murid melafazkan pantun dengan jelas, memadankan sekurang-kurangnya dua rangkap dengan maksud yang tepat dan menunjukkan frasa yang menyokong tafsiran.',
      induction:'Guru menunjukkan tiga kad sifat: membantu, tekun dan bercita-cita tinggi. Murid meramal sifat yang mungkin muncul dalam pantun tentang peniaga berjaya.',
      support:[
        step('bm1-144-s1','Baca Rangkap Berpandu','Guru membimbing murid melafazkan setiap rangkap dan menandakan frasa isi seperti membantu guru, tekun menjaga kedai dan ingin menjadi peniaga berjaya.','Buku Teks m/s 144; kad kata kunci','Guided Reading'),
        step('bm1-144-s2','Padan Rangkap–Sifat','Murid memadankan rangkap dengan kad maksud atau sifat yang sesuai.','kad rangkap; kad sifat','Matching')
      ],
      core:[
        step('bm1-144-c1','Lafaz dan Tafsir','Pasangan melafazkan pantun, kemudian menyatakan maksud setiap rangkap menggunakan kata sendiri berdasarkan tindakan Aimi dalam pantun.','Buku Teks m/s 144','Pair Reading'),
        step('bm1-144-c2','Detektif Sikap Peniaga','Guru menunjukkan satu sifat. Kumpulan memilih rangkap yang paling jelas menunjukkan sifat tersebut dan memberikan bukti frasa daripada pantun.','kad sifat; kad rangkap','Game-Based Learning')
      ],
      challenge:[
        step('bm1-144-h1','Tafsir Tanpa Kad','Murid menyatakan maksud dua rangkap tanpa pilihan jawapan.','Buku Teks m/s 144','Independent Interpretation'),
        step('bm1-144-h2','Buktikan Nilai','Murid memilih satu sifat Aimi dan menerangkan mengapa sifat itu penting kepada seorang peniaga dengan merujuk pantun.','Buku Teks m/s 144','Reasoning Talk')
      ],
      close:'Murid memilih satu rangkap dan menyatakan satu sikap baik yang terkandung di dalamnya.',
      bbm:['Buku Teks m/s 144','kad rangkap','kad sifat','kad maksud']
    },
    edit_punctuation:{
      sourceTitle:'Cita-cita Saya',
      objective:p=>`Pada akhir PdP, murid dapat mengenal pasti dan membetulkan sekurang-kurangnya lima kesalahan tanda baca dan huruf besar dalam teks “Cita-cita Saya” pada ${p} dengan betul.`,
      criteria:'Murid menandakan tempat yang perlu dimurnikan, menulis semula bentuk yang betul dan membaca semula ayat selepas pembetulan.',
      induction:'Guru memaparkan dua ayat pendek, satu menggunakan huruf besar/tanda baca yang betul dan satu lagi tidak. Murid memilih ayat yang lebih tepat.',
      support:[
        step('bm1-145-s1','Cari Mula Ayat','Murid menandakan kata pada awal ayat yang perlu menggunakan huruf besar seperti “mereka”, “kata” dan “oleh”.','Buku Teks m/s 145; pen penanda','Guided Editing'),
        step('bm1-145-s2','Letak Tanda Baca','Murid memilih noktah atau koma yang sesuai pada beberapa ayat yang dipilih guru.','kad tanda baca','Editing Drill')
      ],
      core:[
        step('bm1-145-c1','Editor Cita-cita','Murid membaca teks dan menandakan kesalahan huruf besar serta tanda baca yang sengaja terdapat pada halaman.','Buku Teks m/s 145; lembaran edit','Error Analysis'),
        step('bm1-145-c2','Semak dan Baca Semula','Pasangan bertukar hasil, menyemak pembetulan dan membaca semula teks untuk memastikan ayat bermula serta berakhir dengan tanda yang sesuai.','hasil murid; senarai semak','Peer Editing')
      ],
      challenge:[
        step('bm1-145-h1','Edit Tanpa Petunjuk','Murid memurnikan keseluruhan petikan sasaran tanpa tanda bantuan.','Buku Teks m/s 145','Independent Editing'),
        step('bm1-145-h2','Jelaskan Fungsi Tanda','Murid memilih dua pembetulan dan menerangkan fungsi huruf besar atau tanda baca yang digunakan.','hasil edit','Metalinguistic Reasoning')
      ],
      close:'Guru membaca satu ayat tanpa tanda baca dan murid mencadangkan pembetulan secara lisan.',
      bbm:['Buku Teks m/s 145','lembaran edit','kad tanda baca','senarai semak']
    },
    family_restaurant:{
      sourceTitle:'Restoran Keluarga',
      objective:p=>`Pada akhir PdP, murid dapat membina sekurang-kurangnya tiga ayat penyata berdasarkan gambar dan frasa pada ${p} dengan betul.`,
      criteria:'Murid menghasilkan ayat yang membuat pernyataan jelas tentang ahli keluarga, pelanggan atau tugas di restoran serta menggunakan huruf besar dan noktah dengan betul.',
      induction:'Guru menunjukkan gambar situasi restoran dan meminta murid menyatakan satu perkara yang sedang berlaku dalam bentuk pernyataan.',
      support:[
        step('bm1-146-s1','Padan Siapa–Buat Apa','Murid memadankan kad watak seperti Ibu Aimi, Pak Long atau pelanggan dengan frasa tindakan yang sesuai.','Buku Teks m/s 146; kad watak; kad frasa','Matching'),
        step('bm1-146-s2','Lengkap Ayat Penyata','Murid melengkapkan rangka ayat berdasarkan pasangan gambar dan frasa yang telah dipilih.','rangka ayat; kad gambar','Guided Writing')
      ],
      core:[
        step('bm1-146-c1','Baca Gambar dan Frasa','Murid meneliti gambar serta frasa pada halaman dan membina tiga ayat penyata tentang tugas atau keadaan di restoran.','Buku Teks m/s 146; lembaran ayat','Think-Write'),
        step('bm1-146-c2','Semak Pernyataan','Pasangan bertukar ayat dan menyemak sama ada ayat benar-benar membuat pernyataan yang sepadan dengan gambar serta mempunyai noktah.','hasil murid; senarai semak','Peer Check')
      ],
      challenge:[
        step('bm1-146-h1','Ayat Penyata Tanpa Frasa','Murid membina ayat penyata tambahan berdasarkan gambar tanpa menggunakan rangka ayat.','Buku Teks m/s 146','Independent Writing'),
        step('bm1-146-h2','Kembangkan Maklumat','Murid menambah satu maklumat relevan pada ayat penyata tanpa menukar maksud gambar.','hasil murid','Sentence Expansion')
      ],
      close:'Murid membaca satu ayat penyata dan kelas menyemak sama ada ayat itu benar-benar menyatakan sesuatu.',
      bbm:['Buku Teks m/s 146','kad watak','kad frasa','senarai semak']
    },
    sports_shirt_compare:{
      sourceTitle:'Membeli Baju Sukan',
      objective:p=>`Pada akhir PdP, murid dapat menyampaikan sekurang-kurangnya tiga persamaan atau perbezaan antara baju sukan Wira dan Juara berdasarkan ${p} dengan betul.`,
      criteria:'Murid menggunakan maklumat harga, pilihan warna, ciri dan tawaran untuk membuat perbandingan serta menyatakan satu pilihan dengan alasan berdasarkan bahan.',
      induction:'Guru menunjukkan dua kad produk dengan harga dan ciri berbeza. Murid menyatakan maklumat yang perlu dibandingkan sebelum membeli.',
      support:[
        step('bm1-147-s1','Isi Jadual Banding','Murid melengkapkan jadual Wira–Juara menggunakan kad maklumat harga, warna dan ciri daripada halaman.','Buku Teks m/s 147; jadual banding; kad maklumat','Guided Comparison'),
        step('bm1-147-s2','Pilih dan Cakap','Murid melengkapkan rangka “Saya memilih baju ___ kerana ___.” dengan satu alasan berdasarkan bahan.','kad pilihan; rangka ayat','Guided Speaking')
      ],
      core:[
        step('bm1-147-c1','Banding Wira–Juara','Pasangan membaca semua maklumat pada dua baju sukan dan merekod sekurang-kurangnya tiga perbezaan termasuk harga atau tawaran.','Buku Teks m/s 147; jadual banding','Pair Analysis'),
        step('bm1-147-c2','Pembeli Bijak','Setiap pasangan memilih satu baju dan menyampaikan alasan berdasarkan sekurang-kurangnya dua ciri sebenar pada bahan.','Buku Teks m/s 147; kad keputusan','Decision Talk')
      ],
      challenge:[
        step('bm1-147-h1','Nilai Tawaran','Murid membandingkan bukan hanya harga tetapi juga ciri dan tawaran seperti potongan harga atau diskaun pembeli terawal.','Buku Teks m/s 147','Reasoning'),
        step('bm1-147-h2','Pertahan Pilihan','Murid mempertahankan pilihan apabila rakan memilih produk lain dengan menggunakan bukti daripada bahan.','kad hujah','Mini Debate')
      ],
      close:'Murid menyatakan satu perbezaan dan satu pilihan baju dengan alasan.',
      bbm:['Buku Teks m/s 147','jadual banding','kad maklumat','kad keputusan'],
      discrepancy:'RPT asal mencatat BA 774, manakala nota pemetaan sumber dan Buku Teks merujuk BA 77. Blueprint tidak mengubah rujukan Lesson Map; isu BA kekal untuk audit.'
    },
    make_choice_story:{
      sourceTitle:'Membuat Pilihan',
      objective:p=>`Pada akhir PdP, murid dapat membaca dan menceritakan semula kandungan teks “Membuat Pilihan” pada ${p} dengan urutan dan aksi yang sesuai.`,
      criteria:'Murid menyampaikan sekurang-kurangnya tiga peristiwa utama secara berurutan dan menunjukkan keputusan Aimi untuk tidak membeli barang yang tidak diperlukan.',
      induction:'Guru menunjukkan dua kad: “keperluan” dan “kehendak”. Murid mengelaskan buku latihan dan bekas minuman berdasarkan situasi Aimi.',
      support:[
        step('bm1-148-s1','Susun Tiga Peristiwa','Murid menyusun kad gambar/ayat: datang membeli buku latihan → tertarik pada bekas minuman → memilih tidak membelinya.','Buku Teks m/s 148; kad urutan','Sequencing'),
        step('bm1-148-s2','Cerita Ikut Kad','Murid menceritakan semula menggunakan tiga kad urutan dan aksi mudah.','kad urutan','Guided Retelling')
      ],
      core:[
        step('bm1-148-c1','Baca dan Tandai Keputusan','Pasangan membaca teks dan menandakan bahagian yang menunjukkan apa yang Aimi mahu, apa yang dia perlukan dan keputusan akhirnya.','Buku Teks m/s 148; penanda teks','Pair Reading'),
        step('bm1-148-c2','Teater Cerita Ringkas','Kumpulan kecil menceritakan semula kandungan dengan aksi yang sesuai mengikut urutan teks tanpa menambah peristiwa baharu.','Buku Teks m/s 148','Reader Action')
      ],
      challenge:[
        step('bm1-148-h1','Cerita Tanpa Kad','Murid menceritakan semula peristiwa utama tanpa kad urutan.','Buku Teks m/s 148','Independent Retelling'),
        step('bm1-148-h2','Jelaskan Keputusan','Murid menerangkan mengapa keputusan Aimi tidak membeli bekas minuman dianggap rasional berdasarkan teks.','Buku Teks m/s 148','Decision Reasoning')
      ],
      close:'Murid menyatakan satu pengajaran daripada keputusan Aimi dengan merujuk peristiwa dalam teks.',
      bbm:['Buku Teks m/s 148','kad keperluan/kehendak','kad urutan']
    },
    jamil_money_table:{
      sourceTitle:'Catatan Jamil',
      objective:p=>`Pada akhir PdP, murid dapat mencatat maklumat wang masuk, wang keluar dan baki daripada teks “Catatan Jamil” ke dalam jadual pada ${p} dengan betul.`,
      criteria:'Murid memindahkan sekurang-kurangnya empat maklumat kewangan daripada teks ke lajur yang betul dan memastikan jumlah RM10.00 sepadan dengan perbelanjaan serta baki.',
      induction:'Guru menunjukkan tiga kad: “wang masuk”, “wang keluar” dan “baki”. Murid menentukan kategori bagi satu contoh mudah.',
      support:[
        step('bm1-149-s1','Cari Nilai Wang','Guru membimbing murid menandakan semua nilai wang dalam teks: RM5.00, RM5.00, RM5.00, RM2.80 dan RM2.20.','Buku Teks m/s 149; penanda teks','Guided Retrieval'),
        step('bm1-149-s2','Masuk Lajur Betul','Murid memadankan kad peristiwa dengan lajur wang masuk, wang keluar atau baki sebelum menyalin ke jadual.','kad peristiwa; jadual','Classification')
      ],
      core:[
        step('bm1-149-c1','Jejak Aliran Wang Jamil','Pasangan membaca catatan dan memindahkan maklumat wang daripada ayah/ibu, hadiah, majalah dan baki ke jadual yang betul.','Buku Teks m/s 149; jadual wang','Pair Data Extraction'),
        step('bm1-149-c2','Semak Jumlah','Murid menyemak bahawa wang masuk RM10.00 dapat diterangkan oleh wang keluar dan baki yang dicatat, kemudian membetulkan jadual jika tidak sepadan.','jadual wang; kad semak','Pair Check')
      ],
      challenge:[
        step('bm1-149-h1','Catat Tanpa Kad','Murid melengkapkan jadual terus daripada teks tanpa kad peristiwa.','Buku Teks m/s 149','Independent Note Taking'),
        step('bm1-149-h2','Jelaskan Baki','Murid menerangkan dengan ayat sendiri bagaimana baki RM2.20 diperoleh berdasarkan catatan perbelanjaan.','Buku Teks m/s 149','Reasoning Talk')
      ],
      close:'Murid menyebut satu contoh wang masuk, satu wang keluar dan baki daripada Catatan Jamil.',
      bbm:['Buku Teks m/s 149','jadual wang','kad peristiwa','kad semak']
    },
    single_compound_money:{
      sourceTitle:'Ayat Tunggal dan Ayat Majmuk',
      objective:p=>`Pada akhir PdP, murid dapat membina sekurang-kurangnya dua ayat tunggal dan dua ayat majmuk berdasarkan bahan pengurusan wang pada ${p} dengan betul.`,
      criteria:'Murid membezakan ayat tunggal dengan ayat majmuk dan menggunakan kata hubung seperti “dan”, “tetapi” atau “atau” untuk menggabungkan idea yang sesuai.',
      induction:'Guru memaparkan dua ayat pendek tentang Aimi menyimpan wang, kemudian menunjukkan bagaimana kedua-duanya boleh dicantumkan menggunakan kata hubung.',
      support:[
        step('bm1-150-s1','Pilih Tunggal atau Majmuk','Murid mengelaskan kad ayat kepada ayat tunggal atau ayat majmuk dengan bantuan warna.','Buku Teks m/s 150; kad ayat','Classification'),
        step('bm1-150-s2','Cantum dengan Kata Hubung','Murid memadankan dua frasa/tindakan dan memilih “dan”, “tetapi” atau “atau” untuk membentuk ayat majmuk mudah.','kad tindakan; kad kata hubung','Guided Sentence Building')
      ],
      core:[
        step('bm1-150-c1','Bina daripada Catatan Wang','Murid memilih tindakan pada halaman seperti membeli beg, menyimpan wang, menyimpan resit atau mencatat perbelanjaan lalu membina dua ayat tunggal.','Buku Teks m/s 150; lembaran ayat','Think-Write'),
        step('bm1-150-c2','Gabung Idea Berhemat','Murid menggabungkan pasangan ayat menggunakan “dan”, “tetapi” atau “atau” untuk menghasilkan dua ayat majmuk yang masih sesuai dengan konteks pengurusan wang.','Buku Teks m/s 150; kad kata hubung','Sentence Combining')
      ],
      challenge:[
        step('bm1-150-h1','Ubah Bentuk Ayat','Murid menukar satu ayat tunggal menjadi ayat majmuk dengan menambah idea kedua yang relevan.','hasil murid','Sentence Transformation'),
        step('bm1-150-h2','Buktikan Jenis Ayat','Murid menerangkan mengapa satu ayat dikategorikan sebagai tunggal dan satu lagi sebagai majmuk dengan merujuk struktur dan kata hubung.','hasil murid','Grammar Reasoning')
      ],
      close:'Murid memberikan satu contoh ayat tunggal dan satu ayat majmuk tentang mengurus wang.',
      bbm:['Buku Teks m/s 150','kad ayat','kad tindakan','kad kata hubung'],
      discrepancy:'Buku Teks m/s 150 mencetak kod 5.3.3 (i)(ii), sedangkan DSKP Tahun 1 yang dibekalkan menggunakan 5.3.2 untuk ayat tunggal dan ayat majmuk. Blueprint mengekalkan SP Lesson Map/DSKP 5.3.2 tanpa mengubah mapping.'
    }
  };

  function objectivePair(m){
    const c=C[mode(m)];if(!c)return null;
    return {objective:c.objective(pageLabel(m)),criteria:c.criteria};
  }

  function blueprint(m){
    const md=mode(m),c=C[md];if(!c)return null;
    const p=pageLabel(m),pair=objectivePair(m);
    const discrepancy=c.discrepancy||'';
    return {
      method:'Aktiviti source-first berdasarkan RPT + DSKP + Buku Teks',
      pakDetail:`Isi aktiviti datang daripada tugasan sebenar pada ${p}; Activity Library hanya boleh memvariasikan cara pelaksanaan tanpa mengganti tugasan sumber.`,
      anchor:`${c.sourceTitle} — ${p}`,
      kind:'source_task',
      bbmList:c.bbm,
      groupBbm:{support:c.bbm.join('; '),core:c.bbm.join('; '),challenge:c.bbm.join('; ')},
      mainSp:mainSp(m),page:p,topic:c.sourceTitle,
      setInduksi:c.induction,
      inductionData:{name:'Set Induksi Sumber',text:c.induction,bbm:p,pak21:'Think-Pair-Share'},
      librarySteps:{support:c.support,core:c.core,challenge:c.challenge},
      diffSupport:'Tugasan halaman yang sama dengan kad petunjuk, rangka atau pilihan terhad.',
      diffCore:'Melaksanakan tugasan Buku Teks sebenar dan menyemak hasil dengan bukti halaman.',
      diffChallenge:'Melaksanakan tugasan yang sama secara lebih kendiri serta menerangkan alasan atau bukti.',
      diffSupportAct:c.support.map(x=>x.text).join(' '),
      diffCoreAct:c.core.map(x=>x.text).join(' '),
      diffChallengeAct:c.challenge.map(x=>x.text).join(' '),
      pbdEvidence:{method:'Pemerhatian + hasil tugasan sumber + penerangan murid',evidence:'Respons lisan/tulisan/persembahan yang boleh disemak terus dengan halaman Buku Teks.',criterion:pair.criteria},
      penutup:c.close,
      sourceDiscrepancy:discrepancy
    };
  }

  const originalEffective=window.effectiveRphLessonMap;
  if(typeof originalEffective==='function')window.effectiveRphLessonMap=function(map,ev,built){
    const out=originalEffective(map,ev,built)||map,pair=objectivePair(out);if(!pair)return out;
    const md=mode(out),c=C[md];
    return {...out,objective:pair.objective,success_criteria:pair.criteria,_runtime_bm_source_blueprint:true,_runtime_bm_source_mode:md,_runtime_source_title:c?.sourceTitle||out.title,_runtime_source_discrepancy:c?.discrepancy||''};
  };

  const originalPedagogy=window.buildSourceAwarePedagogy;
  if(typeof originalPedagogy==='function')window.buildSourceAwarePedagogy=function(map,ev,built){
    const out=blueprint(map);return out||originalPedagogy(map,ev,built);
  };

  window.bmYear1Units2224SourceBlueprintMode=mode;
  window.bmYear1Units2224SourceBlueprint=blueprint;
})();
