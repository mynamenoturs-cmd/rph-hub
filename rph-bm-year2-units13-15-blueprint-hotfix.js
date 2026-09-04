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
    // Unit 13 — Bersikap Mulia
    '1.1.2@2|W23|S1':'amalan_baik',
    '2.3.1@3|W23|S2':'bangga_bm',
    '3.3.1@4|W23|S3':'sekolah_bangga',
    '5.2.1@6|W23|S5':'sehari_sekolah',

    // Unit 14 — Hidup Berbakti
    '1.1.2@7|W24|S1':'ayah_guru',
    '2.3.1@8|W24|S2':'berbakti_anak_bangsa',
    '3.3.2@9|W24|S3':'galeri_keluarga',
    '5.2.1@11|W24|S5':'jasa_nenek',
    '5.2.1@12|W25|S1':'tok_batin',

    // Unit 15 — Oh, Malaysiaku!
    '1.1.2@13|W25|S2':'keselamatan_penduduk',
    '2.3.2@14|W25|S3':'bertuah_rakyat_explore',
    '3.3.2@15|W25|S4':'warganegara_edit',
    '4.2.3@16|W25|S5':'sajak_identiti_explore',
    '5.2.1@17|W26|S1':'jiwa_patriotik',
    '5.2.1@18|W26|S2':'malam_kemerdekaan',
    '2.3.2@14|W26|S3':'bertuah_rakyat_apply',
    '4.2.3@16|W26|S4':'sajak_identiti_apply'
  };

  function mode(m){
    if(subjectKey(m)!=='bm'||year(m)!==2)return'';
    return ROUTES[routeKey(m)]||'';
  }

  const C={
    amalan_baik:{
      title:'Amalan yang Baik',
      objective:p=>`Pada akhir PdP, murid dapat mendengar dan memberikan respons terhadap sekurang-kurangnya tiga soalan berdasarkan gambar pada ${p} dengan sesuai.`,
      criteria:'Murid melengkapkan tiga respons berkaitan bangga akan negara, menghormati bapa dan menyelesaikan perselisihan faham dengan jawapan yang relevan.',
      induction:'Guru menunjukkan tiga gambar sumber tanpa dialog. Murid meneka amalan baik yang ditunjukkan sebelum mendengar soalan.',
      bbm:['Buku Teks m/s 2','BA2 m/s 1','kad gambar amalan baik'],
      support:[step('u13-2-s','Pilih Respons','Murid memilih respons sesuai daripada dua pilihan bagi setiap soalan gambar, kemudian menyebut ayat penuh.','BT m/s 2; kad respons','Guided Response')],
      core:[step('u13-2-c','Soal–Jawab Bergambar','Pasangan membaca situasi Hasan, Elis dan Komala, kemudian melengkapkan respons menggunakan petunjuk gambar: membawa bendera, menghormati bapa dan saling bermaafan.','BT m/s 2','Think-Pair-Share')],
      challenge:[step('u13-2-h','Sebab Pilihan','Murid menjawab satu soalan tambahan dengan memberi sebab mengapa amalan tersebut baik.','BT m/s 2','Reasoning Talk')],
      close:'Murid menyebut satu amalan baik dan satu sebab amalan itu wajar diamalkan.'
    },
    bangga_bm:{
      title:'Aku Bangga Berbahasa Melayu',
      objective:p=>`Pada akhir PdP, murid dapat membaca dan menyatakan nilai daripada sekurang-kurangnya tiga pantun pada ${p} dengan bukti daripada maksud pantun.`,
      criteria:'Murid memadankan sekurang-kurangnya tiga pantun dengan nilai yang tepat dan menunjukkan baris yang menyokong nilai tersebut.',
      induction:'Guru memaparkan frasa “bahasa kebangsaan”, “sayang akan negara” dan “pelihara bahasa”. Murid meramal nilai utama bahan.',
      bbm:['Buku Teks m/s 3','BA2 m/s 2–3','kad nilai','jalur pantun'],
      support:[step('u13-3-s','Padan Pantun–Nilai','Murid memadankan rangkap dengan kad nilai seperti cinta akan negara dan menghargai bahasa kebangsaan.','BT m/s 3; kad nilai','Matching')],
      core:[step('u13-3-c','Nilai dan Bukti','Pasangan membaca pantun, menyatakan nilai dan menggariskan baris yang menjadi bukti.','BT m/s 3','Text Evidence')],
      challenge:[step('u13-3-h','Terangkan Nilai','Murid menerangkan bagaimana penggunaan bahasa Melayu membuktikan rasa bangga terhadap negara.','BT m/s 3','Evidence Reasoning')],
      close:'Setiap kumpulan menyebut satu nilai dan satu baris pantun yang menyokongnya.'
    },
    sekolah_bangga:{
      title:'Sekolah Kebanggaanku',
      objective:p=>`Pada akhir PdP, murid dapat menghasilkan penulisan separa terkawal tentang sekolah berdasarkan fakta pada ${p} dengan susunan yang jelas.`,
      criteria:'Murid menghasilkan sekurang-kurangnya satu perenggan yang memasukkan fakta tarikh/lokasi, tujuan sekolah dan sekurang-kurangnya satu kejayaan dengan tepat.',
      induction:'Guru menyusun empat kad fakta: 1 Disember 1951, Kampung Lanai, membasmi buta huruf dan satu kejayaan sekolah. Murid mengelaskan fakta kepada latar, tujuan dan kejayaan.',
      bbm:['Buku Teks m/s 4–5','BA2 m/s 4–5','kad fakta','rangka perenggan'],
      support:[step('u13-4-s','Rangka Tiga Bahagian','Murid melengkapkan rangka “Sekolah ini... / Tujuannya... / Antara kejayaannya...” menggunakan kad fakta.','BT m/s 4–5; rangka','Guided Writing')],
      core:[step('u13-4-c','Fakta Menjadi Perenggan','Murid menukar maklumat titik kepada satu perenggan separa terkawal tanpa mengubah fakta sumber.','BT m/s 4–5','Write-Pair-Check')],
      challenge:[step('u13-4-h','Ikrar Penutup','Murid menambah satu ayat penutup tentang meneruskan kejayaan atau mengekalkan kecemerlangan berdasarkan bahan.','BT m/s 4–5','Extended Writing')],
      close:'Murid membaca satu ayat terbaik dan rakan menyatakan fakta sumber yang digunakan.'
    },
    sehari_sekolah:{
      title:'Sehari di Sekolah',
      objective:p=>`Pada akhir PdP, murid dapat mengenal pasti dan menggunakan kata dasar daripada perkataan dalam ${p} untuk melengkapkan ayat mengikut konteks.`,
      criteria:'Murid memperoleh sekurang-kurangnya lima kata dasar yang tepat dan menggunakan sekurang-kurangnya tiga dalam ayat sumber.',
      induction:'Guru menunjukkan “membawa, memberikan, membuka”. Murid menanggalkan imbuhan secara lisan untuk mendapatkan “bawa, beri, buka”.',
      bbm:['Buku Teks m/s 6','BA2 m/s 6–8','kad kata berimbuhan/kata dasar'],
      support:[step('u13-6-s','Buka Imbuhan','Murid memadankan membawa→bawa, memberikan→beri dan membuka→buka sebelum mencari contoh lain pada halaman.','kad kata','Word Sort')],
      core:[step('u13-6-c','Lengkap Ayat Sekolah','Murid mengenal pasti kata dasar dan melengkapkan ayat bergambar tentang aktiviti Hasan di sekolah.','BT m/s 6','Pair Check')],
      challenge:[step('u13-6-h','Bina Ayat Baharu','Murid memilih dua kata dasar dan membina ayat baharu yang masih dalam konteks sekolah.','buku latihan','Sentence Transfer')],
      close:'Guru menyebut kata berimbuhan; murid menyebut kata dasarnya secara pantas.'
    },
    ayah_guru:{
      title:'Ayahku Guru',
      objective:p=>`Pada akhir PdP, murid dapat mendengar suruhan dalam dialog ${p} dan memberikan sekurang-kurangnya tiga respons yang tepat.`,
      criteria:'Murid memberi respons sesuai terhadap “sila lihat”, “minta bercerita” dan “harap bercerita” serta melaksanakan satu simulasi.',
      induction:'Guru memberi satu suruhan mudah. Murid membezakan antara mendengar suruhan dan memberikan respons.',
      bbm:['Buku Teks m/s 7','BA2 m/s 9','kad suruhan'],
      support:[step('u14-7-s','Suruhan–Respons','Murid memadankan tiga suruhan sumber dengan respons seperti “Baiklah...” sebelum menyebutnya.','BT m/s 7; kad respons','Guided Listening')],
      core:[step('u14-7-c','Simulasi Slaid','Pasangan memainkan watak Hasan dan Elis menggunakan urutan suruhan pada halaman, kemudian bertukar peranan.','BT m/s 7','Role Play')],
      challenge:[step('u14-7-h','Respons Lengkap','Murid memberikan respons lengkap yang turut menyebut perkara yang akan dilakukan selepas menerima suruhan.','BT m/s 7','Extended Response')],
      close:'Murid menerangkan satu ciri respons yang tepat terhadap suruhan.'
    },
    berbakti_anak_bangsa:{
      title:'Berbakti demi Anak Bangsa',
      objective:p=>`Pada akhir PdP, murid dapat membaca petikan ${p} dan menyatakan sekurang-kurangnya tiga nilai dengan bukti peristiwa dalam teks.`,
      criteria:'Murid memadankan nilai seperti cekal, kasih sayang dan bertanggungjawab dengan pernyataan yang tepat daripada petikan.',
      induction:'Guru memaparkan tiga kata nilai: cekal, bertanggungjawab dan kasih sayang. Murid meramal tindakan guru yang menunjukkan nilai itu.',
      bbm:['Buku Teks m/s 8','BA2 m/s 10','kad nilai/pernyataan'],
      support:[step('u14-8-s','Padan Nilai','Murid memadankan nilai dengan pernyataan seperti berjauhan dengan keluarga, mengajar dengan kasih sayang dan mementingkan kejayaan murid.','BT m/s 8; kad nilai','Matching')],
      core:[step('u14-8-c','Nilai–Peristiwa–Bukti','Pasangan memilih tiga peristiwa dalam petikan dan menulis nilai yang sepadan.','BT m/s 8','Evidence Table')],
      challenge:[step('u14-8-h','Nilai Terpenting','Murid memilih satu nilai paling penting bagi Cikgu Muzalfah dan mempertahankan pilihan menggunakan dua bukti teks.','BT m/s 8','Reasoning Talk')],
      close:'Murid melengkapkan ayat: “Cikgu Muzalfah menunjukkan nilai ___ apabila ___.”'
    },
    galeri_keluarga:{
      title:'Galeri Keluarga',
      objective:p=>`Pada akhir PdP, murid dapat mengedit dan memurnikan teks ${p} dari aspek ejaan dengan membetulkan sekurang-kurangnya lapan kesalahan.`,
      criteria:'Murid mengenal pasti dan membetulkan ejaan seperti romah→rumah, berkenelan→berkenalan, mesrenya→mesranya, kagom→kagum, dibena→dibina dan memasoki→memasuki.',
      induction:'Guru memaparkan dua pasangan kata betul/salah daripada teks. Murid memilih bentuk ejaan yang tepat dan menerangkan cara menyemak.',
      bbm:['Buku Teks m/s 9','BA2 m/s 11','pen penanda','kad ejaan'],
      support:[step('u14-9-s','Cari Ejaan Pelik','Murid menggunakan kad pasangan ejaan untuk mengesan enam kesalahan dalam teks.','BT m/s 9; kad ejaan','Guided Editing')],
      core:[step('u14-9-c','Editor Galeri','Murid menggariskan kesalahan, menulis pembetulan di atasnya dan membaca semula ayat yang telah dimurnikan.','BT m/s 9','Peer Editing')],
      challenge:[step('u14-9-h','Semak Tanpa Senarai','Murid mencari dua lagi kesalahan tanpa kad bantuan dan menerangkan perubahan huruf yang dibuat.','BT m/s 9','Independent Editing')],
      close:'Pasangan berkongsi satu ejaan salah, pembetulan dan sebab bentuk baharu lebih tepat.'
    },
    jasa_nenek:{
      title:'Jasa Nenekku terhadap Negara',
      objective:p=>`Pada akhir PdP, murid dapat mengenal pasti dan menggunakan sekurang-kurangnya lima kata tunggal daripada ${p} dalam ayat yang sesuai.`,
      criteria:'Murid memilih kata tunggal sumber seperti pingat, bangga, doa, wanita, cuaca atau zink dan membina sekurang-kurangnya tiga ayat yang gramatis.',
      induction:'Guru menunjukkan “pingat”, “wanita” dan “zink”. Murid menentukan bahawa setiap satu membawa makna sebagai satu kata tunggal.',
      bbm:['Buku Teks m/s 11','BA2 m/s 13–14','kad kata tunggal'],
      support:[step('u14-11-s','Cari Kata Tunggal','Murid memilih kata tunggal daripada senarai sumber dan memadankannya dengan gambar/konteks.','BT m/s 11; kad kata','Guided Sort')],
      core:[step('u14-11-c','Ayat Jasa Nenek','Murid melengkapkan penerangan tentang nenek dengan kata tunggal yang sesuai dan membina tiga ayat.','BT m/s 11','Pair Write')],
      challenge:[step('u14-11-h','Kembangkan Cerita','Murid menggunakan tiga kata tunggal dalam rangkaian ayat ringkas tentang jasa nenek tanpa menambah fakta yang bercanggah dengan sumber.','BT m/s 11','Extended Writing')],
      close:'Murid menyebut satu kata tunggal dan ayat yang menggunakan kata itu.'
    },
    tok_batin:{
      title:'Tok Batin yang Dihormati',
      objective:p=>`Pada akhir PdP, murid dapat mengenal pasti dan menggunakan kata berimbuhan awalan berdasarkan ${p} untuk melengkapkan teks dengan tepat.`,
      criteria:'Murid melengkapkan sekurang-kurangnya lima perkataan berawalan yang sesuai berdasarkan konteks Tok Batin.',
      induction:'Guru menunjukkan bentuk “jadi→menjadi” dan “jalan→berjalan”. Murid mengenal pasti imbuhan yang hadir di awal kata dasar.',
      bbm:['Buku Teks m/s 12','BA2 m/s 15–16','kad kata dasar/awalan'],
      support:[step('u14-12-s','Pasang Awalan','Murid memadankan kata dasar seperti bual, cari, dapat, tanya, janji dan bantu dengan awalan sesuai menggunakan pilihan terhad.','kad kata','Word Building')],
      core:[step('u14-12-c','Lengkap Teks Tok Batin','Murid melengkapkan tempat kosong dalam petikan dengan perkataan berimbuhan awalan yang sesuai, kemudian menyemak makna ayat.','BT m/s 12','Pair Check')],
      challenge:[step('u14-12-h','Dasar dan Terbitan','Murid menyenaraikan kata dasar bagi lima perkataan berimbuhan yang telah digunakan dan membina satu ayat baharu.','BT m/s 12','Word Analysis')],
      close:'Guru menyebut kata dasar; murid memberi satu bentuk berimbuhan awalan yang sesuai.'
    },
    keselamatan_penduduk:{
      title:'Menjaga Keselamatan Penduduk',
      objective:p=>`Pada akhir PdP, murid dapat mendengar dan menyampaikan semula sekurang-kurangnya tiga butiran pesanan daripada ${p} dengan tepat.`,
      criteria:'Murid menyampaikan butiran masa, tempat dan barang yang perlu dibawa tanpa menukar maksud pesanan.',
      induction:'Guru menyampaikan pesanan tiga butiran sekali sahaja. Murid menyatakan maklumat yang perlu diingat apabila menyampaikan pesanan.',
      bbm:['Buku Teks m/s 13','BA2 m/s 17','kad pesanan'],
      support:[step('u15-13-s','Susun Butiran Pesanan','Murid menyusun kad “malam esok”, “datang awal”, “pondok kawalan” dan “lampu picit” sebelum menyampaikan pesanan.','BT m/s 13; kad butiran','Guided Recall')],
      core:[step('u15-13-c','Rantai Pesanan Tepat','Pasangan memainkan watak Pak Cik Hairi dan Hasan; seorang memberi pesanan, seorang menyampaikan semula dengan butiran lengkap.','BT m/s 13','Role Play')],
      challenge:[step('u15-13-h','Semak Ketepatan','Murid mendengar pesanan rakan dan menyemak sama ada semua butiran penting dikekalkan.','kad semak','Peer Assessment')],
      close:'Murid menyebut tiga perkara yang mesti dikekalkan ketika menyampaikan pesanan.'
    },
    bertuah_rakyat_explore:{
      title:'Bertuahnya Rakyat Malaysia',
      objective:p=>`Pada akhir PdP, murid dapat membaca dan mempersembahkan lagu kanak-kanak pada ${p} dengan sebutan, intonasi dan irama yang sesuai.`,
      criteria:'Murid membaca sekurang-kurangnya dua rangkap dengan sebutan jelas, irama konsisten dan jeda yang sesuai.',
      induction:'Guru membaca satu rangkap tanpa irama kemudian dengan irama. Murid membandingkan perbezaan persembahan.',
      bbm:['Buku Teks m/s 14','BA2 m/s 18','teks lagu','audio/tepukan irama jika tersedia'],
      support:[step('u15-14-s','Echo Reading Berirama','Murid mengikut guru baris demi baris sambil menepuk irama perlahan.','BT m/s 14','Echo Reading')],
      core:[step('u15-14-c','Persembahan Rangkap','Kumpulan membahagikan rangkap dan mempersembahkan lagu mengikut irama yang dinyatakan pada sumber.','BT m/s 14','Group Performance')],
      challenge:[step('u15-14-h','Kawal Suara dan Irama','Murid mempersembahkan satu rangkap secara kendiri dengan kawalan sebutan, intonasi, suara dan kelancaran.','BT m/s 14','Solo Performance')],
      close:'Kelas menggunakan tiga kriteria sumber: sebutan, intonasi/suara dan kelancaran/irama untuk memberi satu maklum balas.'
    },
    bertuah_rakyat_apply:{
      title:'Bertuahnya Rakyat Malaysia — Aplikasi',
      objective:p=>`Pada akhir PdP, murid dapat mempersembahkan semula bahan ${p} dengan peningkatan pada sebutan, intonasi dan kelancaran berdasarkan maklum balas sesi terdahulu.`,
      criteria:'Murid menunjukkan sekurang-kurangnya satu pembaikan yang dapat diperhatikan pada persembahan kali kedua.',
      induction:'Pasangan mengingat kembali satu kekuatan dan satu aspek yang perlu dibaiki daripada persembahan sebelumnya.',
      bbm:['Buku Teks m/s 14','BA2 m/s 18','kad rubrik tiga kriteria'],
      support:[step('u15-14a-s','Latih Bahagian Sukar','Murid mengulang dua baris yang sukar dengan model sebutan guru sebelum persembahan.','BT m/s 14','Targeted Practice')],
      core:[step('u15-14a-c','Persembahan Kedua','Kumpulan mempersembahkan bahan semula dan rakan menilai menggunakan rubrik sebutan, intonasi/suara dan kelancaran/irama.','BT m/s 14; rubrik','Peer Assessment')],
      challenge:[step('u15-14a-h','Refleksi Persembahan','Murid menjelaskan satu pembaikan yang dibuat dan menunjukkan bahagian teks yang paling berjaya dipersembahkan.','rubrik','Reflection')],
      close:'Murid melengkapkan “Kali ini saya memperbaiki ___ dengan cara ___.”'
    },
    warganegara_edit:{
      title:'Aku Warganegara Malaysia',
      objective:p=>`Pada akhir PdP, murid dapat mengedit dan memurnikan teks ${p} dari aspek tanda baca dengan sekurang-kurangnya lapan pembetulan yang tepat.`,
      criteria:'Murid membetulkan tanda soal, tanda seru, koma, noktah dan tanda petik mengikut jenis ayat serta dialog.',
      induction:'Guru memaparkan satu ayat tanya tanpa tanda soal dan satu ayat seruan tanpa tanda seru. Murid membetulkannya.',
      bbm:['Buku Teks m/s 15','BA2 m/s 19–20','kad tanda baca','pen warna'],
      support:[step('u15-15-s','Pilih Tanda','Murid memilih tanda baca daripada kad ? ! , . “ ” untuk melengkapkan beberapa ayat dialog.','BT m/s 15; kad tanda','Guided Editing')],
      core:[step('u15-15-c','Editor Warganegara','Murid menandakan kesalahan tanda baca dalam situasi rumah dan sekolah, membaiki teks, kemudian membaca dialog dengan intonasi yang sepadan.','BT m/s 15','Peer Editing')],
      challenge:[step('u15-15-h','Jelaskan Fungsi','Murid memilih tiga pembetulan dan menerangkan mengapa tanda tersebut diperlukan.','BT m/s 15','Editing Reasoning')],
      close:'Guru memaparkan satu ayat; murid memilih tanda akhir yang tepat dan memberi sebab.'
    },
    sajak_identiti_explore:{
      title:'Kad Pengenalan dan Sijil Kelahiran',
      objective:p=>`Pada akhir PdP, murid dapat mendeklamasikan sajak pada ${p} dan membezakan sajak berangkap dengan sajak bentuk bebas.`,
      criteria:'Murid mengenal pasti bahawa Sajak 1 mempunyai tiga rangkap manakala Sajak 2 berbentuk bebas, serta mendeklamasikan satu bahagian dengan sebutan sesuai.',
      induction:'Guru memaparkan bentuk dua sajak tanpa tajuk. Murid menyatakan perbezaan susun atur yang dapat dilihat.',
      bbm:['Buku Teks m/s 16','BA2 m/s 21–22','kad ciri sajak'],
      support:[step('u15-16-s','Banding Bentuk','Murid memadankan kad “tiga rangkap” dan “bentuk bebas” dengan Sajak 1 dan Sajak 2.','BT m/s 16; kad ciri','Compare-Contrast')],
      core:[step('u15-16-c','Deklamasi dan Ciri','Pasangan mendeklamasikan bahagian pilihan, kemudian melengkapkan jadual perbandingan ciri dua sajak.','BT m/s 16','Pair Performance')],
      challenge:[step('u15-16-h','Bukti Ciri','Murid menunjukkan bukti visual daripada susunan baris/rangkap untuk menyokong klasifikasi sajak.','BT m/s 16','Evidence Talk')],
      close:'Murid menyebut satu perbezaan antara sajak berangkap dan sajak bentuk bebas.'
    },
    sajak_identiti_apply:{
      title:'Kad Pengenalan dan Sijil Kelahiran — Aplikasi',
      objective:p=>`Pada akhir PdP, murid dapat mendeklamasikan semula sajak ${p} dengan lebih yakin serta mengenal pasti cirinya tanpa bantuan penuh.`,
      criteria:'Murid mendeklamasikan sekurang-kurangnya satu bahagian dan mengelaskan kedua-dua sajak kepada berangkap/bentuk bebas dengan alasan yang tepat.',
      induction:'Guru menunjukkan dua kad “berangkap” dan “bebas”. Murid menentukan kad yang sepadan dengan Sajak 1 dan Sajak 2 tanpa melihat nota ciri.',
      bbm:['Buku Teks m/s 16','BA2 m/s 21–22','rubrik deklamasi'],
      support:[step('u15-16a-s','Latih Baris Pilihan','Murid berlatih dua hingga empat baris dengan tanda jeda dan model sebutan sebelum deklamasi.','BT m/s 16','Guided Recital')],
      core:[step('u15-16a-c','Deklamasi Kedua','Murid mendeklamasikan sajak pilihan dan rakan menyemak sebutan, intonasi serta klasifikasi ciri.','BT m/s 16; rubrik','Peer Performance')],
      challenge:[step('u15-16a-h','Banding dan Hujah','Murid menerangkan dua perbezaan struktur antara Sajak 1 dan Sajak 2 menggunakan bukti halaman.','BT m/s 16','Compare-Reason')],
      close:'Murid menyatakan ciri sajak yang dipersembahkan dan satu bukti daripada bentuk teks.'
    },
    jiwa_patriotik:{
      title:'Jiwa Patriotik',
      objective:p=>`Pada akhir PdP, murid dapat mengenal pasti dan menggunakan imbuhan akhiran berdasarkan ${p} untuk melengkapkan perkataan mengikut konteks.`,
      criteria:'Murid melengkapkan sekurang-kurangnya lima perkataan dengan akhiran -kan, -i atau -an secara sesuai dan mengenal pasti kata dasarnya.',
      induction:'Guru menunjukkan “tampal→tampalkan”, “hormat→hormati” dan “bulat→bulatan”. Murid mengenal pasti bahagian yang ditambah di akhir kata.',
      bbm:['Buku Teks m/s 17','BA2 m/s 23–24','kad kata dasar/akhiran'],
      support:[step('u15-17-s','Pasang Akhiran','Murid memadankan kata dasar dengan -kan, -i atau -an menggunakan contoh sumber.','kad kata','Word Building')],
      core:[step('u15-17-c','Lengkap Buku Skrap','Murid melengkapkan dialog projek buku skrap dengan perkataan berimbuhan akhiran yang sesuai, kemudian menyemak kata dasar.','BT m/s 17','Pair Check')],
      challenge:[step('u15-17-h','Ubah Bentuk','Murid memilih tiga kata dasar dan menghasilkan bentuk berakhiran yang sesuai dalam ayat baharu.','BT m/s 17','Word Transfer')],
      close:'Murid menyebut satu kata berakhiran, kata dasar dan akhiran yang digunakan.'
    },
    malam_kemerdekaan:{
      title:'Malam Kemerdekaan',
      objective:p=>`Pada akhir PdP, murid dapat menggunakan kata dasar, kata tunggal serta kata berimbuhan awalan dan akhiran untuk melengkapkan teks ${p} mengikut konteks.`,
      criteria:'Murid melengkapkan sekurang-kurangnya enam tempat kosong dengan bentuk kata yang sesuai dan dapat mengelaskan contoh kepada sekurang-kurangnya tiga kategori pembentukan kata.',
      induction:'Guru menyediakan empat label: kata dasar, kata tunggal, awalan dan akhiran. Murid mengelaskan empat contoh mudah sebelum membaca teks.',
      bbm:['Buku Teks m/s 18','kad kategori kata','jalur perkataan'],
      support:[step('u15-18-s','Sort Empat Kategori','Murid memadankan pilihan perkataan dengan kategori kata sebelum memasukkannya ke dalam ayat.','kad kategori; kad perkataan','Word Sort')],
      core:[step('u15-18-c','Lengkap Malam Kemerdekaan','Murid melengkapkan teks sambutan kemerdekaan, kemudian menandai jenis pembentukan bagi jawapan utama.','BT m/s 18','Pair Check')],
      challenge:[step('u15-18-h','Terangkan Pembentukan','Murid memilih tiga jawapan dan menerangkan kata dasar/imbuhan atau sebab perkataan itu kata tunggal.','BT m/s 18','Grammar Reasoning')],
      close:'Guru menyebut satu perkataan daripada teks; murid mengangkat kad kategori yang sesuai.'
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
      method:'Aktiviti source-first BM Tahun 2 berdasarkan RPT + DSKP + Buku Teks',
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
      diffChallenge:'Tugasan sumber yang sama secara lebih kendiri dengan alasan, bukti atau pemurnian tambahan.',
      diffSupportAct:c.support.map(x=>x.text).join(' '),
      diffCoreAct:c.core.map(x=>x.text).join(' '),
      diffChallengeAct:c.challenge.map(x=>x.text).join(' '),
      pbdEvidence:{method:'Pemerhatian + hasil lisan/bacaan/tulisan sumber',evidence:'Prestasi murid disemak terus terhadap tugasan Buku Teks dan evidens BA yang dirujuk RPT.',criterion:pair.criteria},
      penutup:c.close,
      _runtime_bm_year2_source_blueprint:true,
      _runtime_bm_year2_units13_15_mode:md
    };
  }

  const originalEffective=window.effectiveRphLessonMap;
  if(typeof originalEffective==='function')window.effectiveRphLessonMap=function(map,...args){
    const out=originalEffective.call(this,map,...args);
    const pair=objectivePair(out);
    if(!pair)return out;
    return {...out,objective:pair.objective,success_criteria:pair.criteria,_runtime_bm_year2_source_blueprint:true,_runtime_bm_year2_units13_15_mode:mode(out)};
  };

  const originalPedagogy=window.buildSourceAwarePedagogy;
  if(typeof originalPedagogy==='function')window.buildSourceAwarePedagogy=function(map,ev,built){
    const out=blueprint(map);
    return out||originalPedagogy(map,ev,built);
  };

  window.bmYear2Units13To15SourceBlueprintMode=mode;
  window.bmYear2Units13To15SourceBlueprint=blueprint;
})();