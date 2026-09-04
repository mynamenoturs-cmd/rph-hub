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
    '1.1.2@44|W13|S1':'bersih_kemas',
    '2.2.1@45|W13|S2':'kebersihan_tersirat',
    '3.2.2@46|W13|S3':'basuh_sebelum_makan',
    '4.2.1@47|W13|S4':'pantun_rima_jeda',
    '5.1.3@48|W13|S5':'adjektif_bentuk',

    '1.1.3@49|W14|S1':'kesihatan_mata',
    '2.2.1@50|W14|S2':'menu_seimbang_explore',
    '3.2.2@51|W14|S3':'minum_air_explore',
    '4.2.1@52|W14|S4':'pantun_format_explore',
    '5.1.3@53|W14|S5':'adjektif_waktu',

    '2.2.1@50|W15|S1':'menu_seimbang_apply',
    '3.2.2@51|W15|S2':'minum_air_apply',
    '4.2.1@52|W15|S3':'pantun_format_apply',
    '5.1.4@54|W15|S4':'kata_hubung',

    '1.1.3@55|W16|S1':'langkah_sihat',
    '2.2.1@56|W16|S2':'mari_naik_tangga',
    '3.2.3@57|W16|S3':'rutin_yahya',
    '5.1.4@58|W16|S4':'kata_sendi_explore',
    '5.1.4@58|W16|S5':'kata_sendi_apply'
  };

  function mode(m){
    if(subjectKey(m)!=='bm'||year(m)!==2)return'';
    return ROUTES[routeKey(m)]||'';
  }

  const C={
    bersih_kemas:{
      objective:p=>`Pada akhir PdP, murid dapat mendengar dan memberikan respons yang sesuai terhadap sekurang-kurangnya tiga permintaan dalam situasi “Bersih dan Kemas” pada ${p}.`,
      criteria:'Murid mengenal pasti permintaan, memberikan respons sopan dan melakonkan satu situasi dengan tindakan yang sepadan.',
      induction:'Guru membuat satu permintaan mudah berkaitan kebersihan kelas. Murid membezakan permintaan dengan suruhan biasa melalui kata seperti “tolong” dan “harap”.',
      bbm:['Buku Teks m/s 44','BA1 m/s 49','kad permintaan','kad respons'],
      support:[step('u7-44-s','Dengar dan Pilih Respons','Murid mendengar permintaan seperti melap kepala katil, menukar cadar atau memasukkan langsir ke mesin basuh lalu memilih respons sopan yang sesuai.','kad permintaan; kad respons','Guided Listening')],
      core:[step('u7-44-c','Lakon Bersih dan Kemas','Pasangan memainkan peranan ibu–Hana. Seorang menyampaikan permintaan daripada halaman sumber dan seorang lagi memberikan respons serta menyatakan tindakan yang akan dilakukan.','Buku Teks m/s 44','Role Play')],
      challenge:[step('u7-44-h','Bina Permintaan Sopan','Murid membina satu permintaan baharu yang masih berkaitan dengan menjaga kebersihan bilik, kemudian rakan memberikan respons lengkap.','kad situasi','Speaking Extension')],
      close:'Guru menyebut satu permintaan; murid memberikan respons sopan dan menyatakan tindakan yang sesuai.'
    },
    kebersihan_tersirat:{
      objective:p=>`Pada akhir PdP, murid dapat menyatakan sekurang-kurangnya tiga isi tersirat berdasarkan isi tersurat dalam petikan “Kebersihan Milik Bersama” pada ${p}.`,
      criteria:'Murid memadankan isi tersurat dengan nilai atau tindakan tersirat dan menunjukkan ayat teks yang menjadi bukti.',
      induction:'Guru memaparkan ayat “Setiap ahli keluarga mempunyai tugas masing-masing.” Murid meneka nilai yang tersirat daripada tindakan itu.',
      bbm:['Buku Teks m/s 45','BA1 m/s 50–51','kad tersurat–tersirat'],
      support:[step('u7-45-s','Padan Tersurat–Tersirat','Murid memadankan ayat sumber dengan pilihan seperti bekerjasama, mematuhi arahan dan bertanggungjawab.','kad ayat; kad nilai','Matching')],
      core:[step('u7-45-c','Bukti Teks','Pasangan memilih tiga isi tersurat, menulis isi tersirat yang munasabah dan menggariskan bukti dalam petikan.','Buku Teks m/s 45','Text Evidence Pair Check')],
      challenge:[step('u7-45-h','Jelaskan Inferens','Murid menerangkan bagaimana satu ayat petikan membawa kepada isi tersirat tanpa menambah fakta di luar teks.','Buku Teks m/s 45','Inference Talk')],
      close:'Murid melengkapkan ayat: “Daripada ayat ___, saya dapat memahami bahawa keluarga Hana ___.”'
    },
    basuh_sebelum_makan:{
      objective:p=>`Pada akhir PdP, murid dapat menulis jawapan bagi soalan bertumpu dan bercapah berdasarkan teks “Basuh Sebelum Makan” pada ${p} dengan bukti yang sesuai.`,
      criteria:'Murid menjawab sekurang-kurangnya tiga soalan, termasuk satu soalan sebab/akibat, menggunakan maklumat teks.',
      induction:'Guru menunjukkan gambar buah jambu dan bertanya perkara yang perlu dilakukan sebelum buah dimakan.',
      bbm:['Buku Teks m/s 46','BA1 m/s 52–53','kad soalan','jalur bukti'],
      support:[step('u7-46-s','Cari Jawapan dalam Teks','Murid menggunakan kata kunci soalan seperti siapa, apa dan mengapa untuk mencari ayat bukti sebelum melengkapkan jawapan.','Buku Teks m/s 46; kad kata kunci','Guided Comprehension')],
      core:[step('u7-46-c','Jawab dan Buktikan','Pasangan menulis jawapan untuk soalan pada halaman, kemudian menunjukkan ayat teks yang menyokong jawapan mereka.','Buku Teks m/s 46','Pair Evidence Check')],
      challenge:[step('u7-46-h','Sebab dan Akibat','Murid menjawab soalan bercapah tentang akibat tidak membasuh buah dengan alasan yang masih berasaskan maklumat kebersihan dalam teks.','Buku Teks m/s 46','Reasoning Writing')],
      close:'Satu soalan dibaca semula; murid menyebut jawapan dan bukti teks dalam dua ayat ringkas.'
    },
    pantun_rima_jeda:{
      objective:p=>`Pada akhir PdP, murid dapat melafazkan pantun pada ${p} serta mengenal pasti rima akhir dan jeda dengan betul.`,
      criteria:'Murid menandakan jeda pada baris pantun, memadankan sekurang-kurangnya dua pasangan rima akhir dan melafazkan satu rangkap dengan sebutan serta intonasi sesuai.',
      induction:'Guru membaca satu baris pantun dua kali—sekali tanpa jeda dan sekali dengan jeda. Murid menyatakan bacaan yang lebih jelas.',
      bbm:['Buku Teks m/s 47','BA1 m/s 54','kad rima akhir','jalur pantun'],
      support:[step('u7-47-s','Tanda Jeda','Murid menggunakan simbol / pada tempat hentian yang ditunjukkan guru dan membulatkan kata akhir setiap baris.','jalur pantun; pen penanda','Guided Poetry')],
      core:[step('u7-47-c','Jejak Rima','Kumpulan mencari bunyi akhir yang sama pada rangkap dan melafazkan pantun mengikut jeda yang telah ditanda.','Buku Teks m/s 47','Cooperative Reading')],
      challenge:[step('u7-47-h','Semak Rakan','Murid melafazkan satu rangkap tanpa tanda bantuan; rakan menyemak jeda dan rima menggunakan sumber.','Buku Teks m/s 47; senarai semak','Peer Assessment')],
      close:'Kelas menyebut dua kata akhir yang berima dan melafazkan satu baris dengan jeda yang tepat.'
    },
    adjektif_bentuk:{
      objective:p=>`Pada akhir PdP, murid dapat mengenal pasti dan menggunakan kata adjektif bentuk daripada “Kemas di Dapur” pada ${p} dalam ayat yang tepat.`,
      criteria:'Murid memadankan sekurang-kurangnya empat bentuk dengan objek dapur dan membina sekurang-kurangnya dua ayat menggunakan kata adjektif bentuk.',
      induction:'Guru menunjukkan bentuk segi tiga, silinder, bulat dan segi empat sama; murid menamakan objek yang mempunyai bentuk tersebut.',
      bbm:['Buku Teks m/s 48','BA1 m/s 55–56','kad bentuk','kad objek'],
      support:[step('u7-48-s','Padan Bentuk–Objek','Murid memadankan jam–segi tiga, tong–silinder, penutup–bulat dan span–segi empat sama berdasarkan teks.','kad bentuk; kad objek','Matching')],
      core:[step('u7-48-c','Lengkap Cerita Dapur','Murid melengkapkan bahagian teks dengan kata adjektif bentuk yang sesuai dan membaca ayat lengkap kepada pasangan.','Buku Teks m/s 48','Pair Check')],
      challenge:[step('u7-48-h','Bina Ayat Bentuk','Murid memilih dua objek lain dalam persekitaran dan membina ayat menggunakan kata adjektif bentuk dengan tepat.','buku latihan','Grammar Transfer')],
      close:'Guru menunjukkan satu objek; murid menjawab dalam bentuk ayat “___ berbentuk ___.”'
    },
    kesihatan_mata:{
      objective:p=>`Pada akhir PdP, murid dapat memberikan respons dengan membuat tafsiran terhadap sekurang-kurangnya tiga soalan bercapah berdasarkan panduan kesihatan mata pada ${p}.`,
      criteria:'Murid menggunakan maklumat panduan untuk menjelaskan kesan menonton dalam gelap, menonton terlalu lama dan cara menjaga kesihatan mata.',
      induction:'Guru bertanya sama ada sesuai menonton televisyen dalam bilik gelap dan meminta murid memberi sebab.',
      bbm:['Buku Teks m/s 49','BA1 m/s 57','kad panduan kesihatan mata','kad soalan'],
      support:[step('u8-49-s','Baca Petunjuk Dahulu','Murid memilih ayat panduan yang berkaitan sebelum memberi respons kepada soalan bercapah.','Buku Teks m/s 49; kad petunjuk','Guided Interpretation')],
      core:[step('u8-49-c','Soalan–Bukti–Tafsiran','Pasangan menjawab soalan ayah dalam dialog menggunakan pola: maklumat panduan → apa yang mungkin berlaku → sebab.','Buku Teks m/s 49','Think-Pair-Explain')],
      challenge:[step('u8-49-h','Nasihat Berasas','Murid memberi satu nasihat tambahan tentang tabiat menonton berdasarkan prinsip yang terdapat dalam panduan tanpa mereka fakta kesihatan baharu.','Buku Teks m/s 49','Reasoning Talk')],
      close:'Murid menyatakan satu amalan menjaga mata dan satu sebab berdasarkan panduan.'
    },
    menu_seimbang_explore:{
      objective:p=>`Pada akhir PdP, murid dapat mengenal pasti idea utama daripada teks dan bahan grafik “Menu Seimbang” pada ${p} dengan betul.`,
      criteria:'Murid menyatakan idea utama dan sekurang-kurangnya tiga maklumat sokongan tentang kumpulan makanan atau pembahagian Pinggan Sihat Malaysia.',
      induction:'Guru memaparkan empat kumpulan makanan dan meminta murid meneka apakah idea yang menyatukan semua maklumat tersebut.',
      bbm:['Buku Teks m/s 50','BA1 m/s 58–59','kad kumpulan makanan','peta idea utama'],
      support:[step('u8-50-s','Pilih Idea Utama','Murid memilih antara beberapa pernyataan dan memadankan maklumat seperti hasil bijirin, buah/sayur dan protein kepada idea utama.','kad idea; kad makanan','Guided Main Idea')],
      core:[step('u8-50-c','Idea Utama + Bukti','Pasangan membaca teks/grafik dan melengkapkan peta: idea utama di tengah, maklumat sokongan di sekeliling.','Buku Teks m/s 50; peta grafik','Graphic Organizer')],
      challenge:[step('u8-50-h','Bezakan Utama dan Sampingan','Murid menerangkan mengapa satu pernyataan ialah idea utama manakala maklumat kumpulan makanan ialah sokongan.','Buku Teks m/s 50','Reasoning Talk')],
      close:'Murid menyebut satu ayat idea utama dan satu bukti sokongan daripada halaman.'
    },
    minum_air_explore:{
      objective:p=>`Pada akhir PdP, murid dapat membina dan menulis jawapan bagi soalan bercapah berdasarkan teks “Minumlah Air untuk Cergas dan Cerdas” pada ${p}.`,
      criteria:'Murid menjawab sekurang-kurangnya tiga soalan dengan menggunakan fakta teks dan sebab yang berkaitan.',
      induction:'Guru bertanya mengapa murid perlu minum air walaupun tidak berasa dahaga.',
      bbm:['Buku Teks m/s 51','BA1 m/s 60–61','kad soalan','jalur fakta'],
      support:[step('u8-51-s','Cari Fakta Kunci','Murid menanda fakta seperti enam hingga lapan gelas, lesu, mengantuk dan gangguan tumpuan sebelum membina jawapan.','Buku Teks m/s 51; jalur fakta','Guided Reading')],
      core:[step('u8-51-c','Jawab dengan Bukti','Pasangan menjawab soalan pada halaman dengan menggabungkan satu fakta dan satu penjelasan yang logik daripada teks.','Buku Teks m/s 51','Pair Writing')],
      challenge:[step('u8-51-h','Hubung Sebab–Akibat','Murid menerangkan rangkaian kekurangan air → lesu/mengantuk → tumpuan terganggu menggunakan ayat sendiri.','Buku Teks m/s 51','Cause-Effect Reasoning')],
      close:'Murid menulis satu pesanan ringkas tentang minum air yang disokong oleh fakta halaman.'
    },
    pantun_format_explore:{
      objective:p=>`Pada akhir PdP, murid dapat mengenal pasti format penulisan pantun pada ${p} dan melafazkan sekurang-kurangnya satu rangkap dengan sebutan serta intonasi yang sesuai.`,
      criteria:'Murid mengenal pasti rangkap dan empat baris pantun serta menyusun satu rangkap dalam format yang betul.',
      induction:'Guru memaparkan empat baris pantun tanpa susunan. Murid meneka bagaimana baris perlu disusun menjadi satu rangkap.',
      bbm:['Buku Teks m/s 52','BA1 m/s 62','jalur baris pantun','kad format'],
      support:[step('u8-52-s','Susun Empat Baris','Murid menyusun empat jalur baris mengikut model rangkap pada halaman dan menomborkan baris 1–4.','jalur pantun; Buku Teks m/s 52','Sequencing')],
      core:[step('u8-52-c','Kenal Format dan Lafaz','Kumpulan menanda sempadan rangkap, bilangan baris dan melafazkan satu rangkap mengikut susunan yang betul.','Buku Teks m/s 52','Cooperative Poetry')],
      challenge:[step('u8-52-h','Semak Format','Murid menerima contoh pantun yang formatnya bercampur dan membetulkannya berdasarkan model sumber.','kad pantun','Peer Editing')],
      close:'Murid menjawab: satu rangkap pantun dalam sumber ini mempunyai berapa baris, kemudian melafazkan satu baris pilihan.'
    },
    adjektif_waktu:{
      objective:p=>`Pada akhir PdP, murid dapat mengenal pasti dan menggunakan kata adjektif waktu daripada “Program Sihat dan Cergas” pada ${p} mengikut konteks.`,
      criteria:'Murid mengenal pasti sekurang-kurangnya tiga kata adjektif waktu dan membina dua ayat yang menggunakannya dengan tepat.',
      induction:'Guru memaparkan kata “awal”, “lewat” dan “singkat”. Murid menerangkan perbezaan makna mengikut masa.',
      bbm:['Buku Teks m/s 53','BA1 m/s 63','kad kata adjektif waktu'],
      support:[step('u8-53-s','Cari Kata Waktu','Murid mencari dan membulatkan kata seperti awal, lewat dan singkat dalam teks dengan bantuan petunjuk perenggan.','Buku Teks m/s 53','Text Hunt')],
      core:[step('u8-53-c','Lengkap Peta Perenggan','Pasangan mengisi kata berkaitan waktu yang sesuai bagi perenggan, kemudian membina ayat berdasarkan program senamrobik.','Buku Teks m/s 53','Pair Check')],
      challenge:[step('u8-53-h','Ayat Konteks Baharu','Murid menggunakan dua kata adjektif waktu dalam situasi sekolah yang berbeza tanpa mengubah maknanya.','buku latihan','Grammar Transfer')],
      close:'Guru menyebut satu situasi masa; murid memilih kata adjektif waktu yang paling sesuai.'
    },
    menu_seimbang_apply:{
      objective:p=>`Pada akhir PdP, murid dapat mengaplikasikan kemahiran mengenal pasti idea utama daripada ${p} dalam BA1 m/s 58–59 tanpa mengulang aktiviti penerokaan.`,
      criteria:'Murid menyiapkan latihan BA dan mempertahankan satu jawapan dengan bukti daripada teks atau grafik Buku Teks.',
      induction:'Murid mengingat kembali idea utama Menu Seimbang dalam satu ayat tanpa melihat nota.',
      bbm:['Buku Teks m/s 50','BA1 m/s 58–59','kad bukti'],
      support:[step('u8-50a-s','BA dengan Peta Bantuan','Murid menggunakan peta idea utama yang telah separa lengkap untuk membantu menjawab BA.','BA1 m/s 58–59; peta bantuan','Guided Application')],
      core:[step('u8-50a-c','BA + Buktikan','Murid melengkapkan BA, memilih satu jawapan dan menunjukkan bahagian teks/grafik yang menyokongnya.','BA1 m/s 58–59; Buku Teks m/s 50','Evidence Check')],
      challenge:[step('u8-50a-h','Ringkas Idea Utama','Murid menulis semula idea utama dalam ayat sendiri tanpa mengubah maksud sumber.','Buku Teks m/s 50','Independent Summary')],
      close:'Murid berkongsi satu jawapan BA dan satu bukti sumber.'
    },
    minum_air_apply:{
      objective:p=>`Pada akhir PdP, murid dapat mengaplikasikan kemahiran menjawab soalan bercapah daripada ${p} dalam BA1 m/s 60–61 dengan alasan berasaskan teks.`,
      criteria:'Murid menyiapkan latihan BA dan membaiki sekurang-kurangnya satu jawapan selepas semakan bukti.',
      induction:'Guru memaparkan fakta “6–8 gelas” dan “lesu/mengantuk”. Murid menghubungkan kedua-duanya kepada kepentingan minum air.',
      bbm:['Buku Teks m/s 51','BA1 m/s 60–61','senarai semak jawapan'],
      support:[step('u8-51a-s','Pilih Bukti Sebelum Jawab','Murid memilih satu daripada dua ayat bukti sebelum menulis jawapan BA.','BA1 m/s 60–61; kad bukti','Guided Application')],
      core:[step('u8-51a-c','Semak Jawapan dengan Teks','Pasangan menukar jawapan BA dan menyemak sama ada setiap jawapan mempunyai fakta atau sebab yang disokong teks.','BA1 m/s 60–61; Buku Teks m/s 51','Peer Review')],
      challenge:[step('u8-51a-h','Baiki Jawapan Lemah','Murid menerima satu jawapan terlalu umum dan membaikinya dengan memasukkan fakta tepat daripada teks.','kad jawapan contoh','Editing for Evidence')],
      close:'Murid membaca satu jawapan yang telah diperbaiki dan menyebut bukti yang ditambah.'
    },
    pantun_format_apply:{
      objective:p=>`Pada akhir PdP, murid dapat mengaplikasikan kefahaman format pantun daripada ${p} dalam BA1 m/s 62 serta melafazkan pantun tanpa bantuan penomboran baris.`,
      criteria:'Murid menyiapkan latihan BA, menyusun format pantun dengan betul dan melafazkan satu rangkap secara lebih kendiri.',
      induction:'Guru menunjukkan empat baris tanpa nombor; murid menyusun secara pantas berdasarkan pengetahuan sesi sebelumnya.',
      bbm:['Buku Teks m/s 52','BA1 m/s 62','jalur pantun'],
      support:[step('u8-52a-s','Rujuk Model Ringkas','Murid menggunakan kad model 4 baris ketika menyiapkan BA jika perlu.','BA1 m/s 62; kad model','Guided Application')],
      core:[step('u8-52a-c','BA + Persembahan Mini','Murid menyiapkan BA kemudian melafazkan satu rangkap kepada pasangan; pasangan menyemak susunan dan kelancaran.','BA1 m/s 62; Buku Teks m/s 52','Peer Performance')],
      challenge:[step('u8-52a-h','Editor Format Pantun','Murid membetulkan satu contoh format pantun yang sengaja disusun salah dan menerangkan pembetulannya.','kad pantun salah','Editing Challenge')],
      close:'Satu pasangan menunjukkan format betul dan melafazkan rangkap pilihan.'
    },
    kata_hubung:{
      objective:p=>`Pada akhir PdP, murid dapat mengenal pasti dan menggunakan kata hubung daripada “Cantik dan Sihat” pada ${p} untuk membina ayat yang gramatis.`,
      criteria:'Murid menggunakan sekurang-kurangnya tiga kata hubung seperti dan, sambil, kerana atau mengikut konteks.',
      induction:'Guru menulis dua ayat pendek dan meminta murid mencantumkannya menggunakan “dan”.',
      bbm:['Buku Teks m/s 54','BA1 m/s 64','kad kata hubung','jalur ayat'],
      support:[step('u8-54-s','Pilih Kata Hubung','Murid memilih kata hubung daripada kad untuk melengkapkan ayat situasi klinik pergigian.','Buku Teks m/s 54; kad kata hubung','Guided Grammar')],
      core:[step('u8-54-c','Cantum Dua Ayat','Pasangan mencantum pasangan ayat sumber menggunakan dan, sambil, kerana atau kata hubung lain yang diberikan sumber.','jalur ayat; Buku Teks m/s 54','Pair Construction')],
      challenge:[step('u8-54-h','Banding Makna','Murid mencuba dua kata hubung pada satu pasangan ayat dan menerangkan mana yang lebih sesuai berdasarkan hubungan makna.','kad kata hubung','Grammar Reasoning')],
      close:'Murid menyebut satu kata hubung dan membina satu ayat ringkas berkaitan penjagaan gigi.'
    },
    langkah_sihat:{
      objective:p=>`Pada akhir PdP, murid dapat memberikan respons dengan membuat tafsiran terhadap pesanan dalam “Langkah yang Sihat” pada ${p}.`,
      criteria:'Murid menyampaikan semula sekurang-kurangnya dua butiran pesanan dan menjelaskan tindakan yang perlu dibuat berdasarkan pesanan tersebut.',
      induction:'Guru menyampaikan satu pesanan dua langkah kepada seorang murid. Murid itu menyampaikan semula kepada rakan tanpa mengubah maksud.',
      bbm:['Buku Teks m/s 55','BA1 m/s 65','kad pesanan','kad tindakan'],
      support:[step('u9-55-s','Susun Pesanan','Murid menyusun kad butiran seperti tunggu di rumah, berjalan kaki bersama dan ajak Hana sebelum menyampaikan semula.','kad pesanan','Guided Listening')],
      core:[step('u9-55-c','Telefon Rosak Berbukti','Pesanan dihantar melalui tiga murid; murid terakhir menyampaikan semula dan kumpulan menyemak dengan teks sumber untuk melihat butiran yang kekal atau berubah.','Buku Teks m/s 55','Cooperative Listening')],
      challenge:[step('u9-55-h','Tafsiran Tindakan','Murid menerangkan tindakan yang perlu dilakukan selepas menerima pesanan dan sebab tindakan itu sesuai.','Buku Teks m/s 55','Reasoning Talk')],
      close:'Murid menyatakan dua butiran pesanan tanpa melihat teks dan menyemak semula dengan sumber.'
    },
    mari_naik_tangga:{
      objective:p=>`Pada akhir PdP, murid dapat mengenal pasti idea sampingan yang menyokong idea utama teks “Mari Naik Tangga” pada ${p}.`,
      criteria:'Murid menyatakan sekurang-kurangnya tiga idea sampingan tentang faedah atau cara menaiki tangga dan memadankannya dengan idea utama.',
      induction:'Guru memaparkan idea utama “Menaiki tangga ialah aktiviti yang sihat dan mudah.” Murid meramal maklumat sokongan yang mungkin terdapat dalam teks.',
      bbm:['Buku Teks m/s 56','BA1 m/s 66','kad idea utama/sampingan'],
      support:[step('u9-56-s','Pilih Idea Sampingan','Murid memilih ayat sokongan seperti meningkatkan degupan jantung, membakar lemak dan menambah kecergasan.','kad ayat; Buku Teks m/s 56','Guided Main-Support')],
      core:[step('u9-56-c','Peta Utama–Sampingan','Pasangan mengisi peta dengan idea utama di tengah dan idea sampingan daripada petikan di cabang.','Buku Teks m/s 56; peta grafik','Graphic Organizer')],
      challenge:[step('u9-56-h','Bukti Hubungan','Murid menerangkan bagaimana satu idea sampingan menyokong pernyataan bahawa menaiki tangga baik untuk kesihatan.','Buku Teks m/s 56','Evidence Reasoning')],
      close:'Murid menyebut satu idea utama dan satu idea sampingan tanpa membaca terus daripada teks.'
    },
    rutin_yahya:{
      objective:p=>`Pada akhir PdP, murid dapat menyusun dan mencatat maklumat bermakna daripada teks “Rutin Mingguan Yahya” pada ${p} ke dalam peta sebelum–semasa–selepas.`,
      criteria:'Murid mencatat sekurang-kurangnya dua maklumat bagi setiap fasa dengan urutan yang tepat.',
      induction:'Guru memaparkan tiga kad “Sebelum”, “Semasa” dan “Selepas”. Murid meletakkan contoh tindakan membasuh basikal pada fasa yang sesuai.',
      bbm:['Buku Teks m/s 57','BA1 m/s 67','peta sebelum–semasa–selepas','kad urutan'],
      support:[step('u9-57-s','Susun Kad Urutan','Murid menyusun kad seperti menyediakan peralatan, membasuh badan basikal, mencuci jejari/tayar, mengelap hingga kering dan minum air.','kad urutan','Sequencing')],
      core:[step('u9-57-c','Catat dalam Peta','Pasangan membaca teks dan memindahkan maklumat kepada peta sebelum–semasa–selepas menggunakan frasa ringkas.','Buku Teks m/s 57; peta grafik','Note Taking')],
      challenge:[step('u9-57-h','Ringkas Tanpa Hilang Urutan','Murid menulis tiga ayat ringkas—satu bagi setiap fasa—dengan penanda urutan yang sesuai.','buku latihan','Independent Note Synthesis')],
      close:'Murid menyebut urutan lengkap membasuh basikal dalam tiga fasa.'
    },
    kata_sendi_explore:{
      objective:p=>`Pada akhir PdP, murid dapat mengenal pasti dan menggunakan kata sendi nama daripada “Berkemas sambil Bersenam” pada ${p} untuk membina ayat mengikut konteks.`,
      criteria:'Murid menggunakan sekurang-kurangnya empat kata sendi nama seperti di, ke, dari/daripada, pada atau kepada dengan tepat.',
      induction:'Guru meletakkan satu objek di atas, di bawah dan di dalam kotak. Murid membina frasa tempat berdasarkan kedudukan objek.',
      bbm:['Buku Teks m/s 58','BA1 m/s 68','kad kata sendi','kad lokasi'],
      support:[step('u9-58-s','Padan Kata Sendi–Lokasi','Murid memadankan di/ke/dari/daripada/pada/kepada dengan frasa lokasi atau arah yang sesuai daripada situasi bilik Hana.','kad kata sendi; kad lokasi','Matching')],
      core:[step('u9-58-c','Lengkap Cerita Berkemas','Pasangan melengkapkan ayat pada halaman dengan kata sendi nama yang tepat kemudian membaca semula ayat lengkap.','Buku Teks m/s 58','Pair Check')],
      challenge:[step('u9-58-h','Bina Ayat Lokasi','Murid membina tiga ayat baharu tentang kedudukan barang di kelas menggunakan kata sendi yang berbeza.','buku latihan','Grammar Transfer')],
      close:'Guru menyebut frasa nama; murid memilih kata sendi yang sesuai dan membina satu frasa lengkap.'
    },
    kata_sendi_apply:{
      objective:p=>`Pada akhir PdP, murid dapat mengaplikasikan penggunaan kata sendi nama daripada ${p} dalam BA1 m/s 68 tanpa mengulang aktiviti penerokaan.`,
      criteria:'Murid menyiapkan BA1 m/s 68 dan membaiki penggunaan sekurang-kurangnya satu kata sendi selepas semakan rakan.',
      induction:'Guru memaparkan tiga ayat dengan kata sendi kosong. Murid melengkapkannya secara pantas sebagai imbas kembali.',
      bbm:['Buku Teks m/s 58','BA1 m/s 68','senarai semak kata sendi'],
      support:[step('u9-58a-s','BA dengan Bank Kata','Murid menggunakan bank kata sendi yang terhad untuk melengkapkan latihan BA.','BA1 m/s 68; bank kata','Guided Application')],
      core:[step('u9-58a-c','BA + Semak Sebab','Pasangan menukar hasil BA dan menanda kata sendi; bagi satu jawapan, murid menerangkan mengapa kata sendi itu sesuai dengan konteks.','BA1 m/s 68; Buku Teks m/s 58','Peer Review')],
      challenge:[step('u9-58a-h','Editor Kata Sendi','Murid membetulkan tiga ayat contoh yang menggunakan kata sendi tidak tepat dan menerangkan pembetulan.','kad ayat salah','Editing Challenge')],
      close:'Murid menunjukkan satu pembaikan pada BA dan menyatakan sebab kata sendi baharu lebih tepat.'
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
      pakDetail:`Isi PdP datang daripada tugasan sebenar pada ${p}. Jika tajuk/halaman diulang pada minggu berikutnya, sesi aplikasi dibezakan dan BA digunakan sebagai evidens pengukuhan. Activity Library hanya memvariasikan cara pelaksanaan.`,
      anchor:`${m.title||md} — ${p}`,
      kind:'source_task',
      bbmList:c.bbm,
      groupBbm:{support:c.bbm.join('; '),core:c.bbm.join('; '),challenge:c.bbm.join('; ')},
      mainSp:mainSp(m),page:p,topic:m.title||md,
      setInduksi:c.induction,
      inductionData:{name:'Set Induksi Sumber',text:c.induction,bbm:p,pak21:'Think-Pair-Share'},
      librarySteps:{support:c.support,core:c.core,challenge:c.challenge},
      diffSupport:'Tugasan sumber yang sama dengan pilihan jawapan, kad petunjuk, model atau peta separa lengkap.',
      diffCore:'Melaksanakan tugasan sebenar Buku Teks dan menunjukkan bukti daripada teks/grafik atau hasil bahasa.',
      diffChallenge:'Melaksanakan tugasan yang sama secara lebih kendiri dengan penerangan sebab, bukti atau pembetulan.',
      diffSupportAct:c.support.map(x=>x.text).join(' '),
      diffCoreAct:c.core.map(x=>x.text).join(' '),
      diffChallengeAct:c.challenge.map(x=>x.text).join(' '),
      pbdEvidence:{method:'Pemerhatian + respons lisan/bacaan/hasil tulisan sumber',evidence:'Prestasi murid disemak terus terhadap tugasan Buku Teks dan BA apabila RPT menetapkannya sebagai aplikasi.',criterion:pair.criteria},
      penutup:c.close,
      _runtime_bm_year2_units7_9_source_blueprint:true,
      _runtime_bm_year2_units7_9_mode:md
    };
  }

  const originalEffective=window.effectiveRphLessonMap;
  if(typeof originalEffective==='function')window.effectiveRphLessonMap=function(map,...args){
    const out=originalEffective.call(this,map,...args);
    const pair=objectivePair(out);
    if(!pair)return out;
    return {...out,objective:pair.objective,success_criteria:pair.criteria,_runtime_bm_year2_units7_9_source_blueprint:true,_runtime_bm_year2_units7_9_mode:mode(out)};
  };

  const originalPedagogy=window.buildSourceAwarePedagogy;
  if(typeof originalPedagogy==='function')window.buildSourceAwarePedagogy=function(map,ev,built){
    const out=blueprint(map);
    return out||originalPedagogy(map,ev,built);
  };

  window.bmYear2Units79SourceBlueprintMode=mode;
  window.bmYear2Units79SourceBlueprint=blueprint;
})();