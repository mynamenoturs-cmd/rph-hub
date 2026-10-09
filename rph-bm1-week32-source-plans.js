// BM Tahun 1 Kumpulan B, Minggu 32: empat pelan PdP khusus bersumberkan Lesson Map
// verified dan petikan Buku Teks halaman 123,124,126,127.
// Langkah PdP ialah reka bentuk guru berdasarkan tugasan sumber, BUKAN transkrip
// langkah buku atau dokumen Word yang telah disemak/diluluskan.
(function(root){
'use strict';
const VERSION='BM1-W32-SOURCE-PLANS-20261009c';
const norm=x=>String(x??'').replace(/\s+/g,' ').trim();
const P=(name,t1,t2,p1,p2,check)=>({name,teacher:[t1,t2],pupils:[p1,p2],check});
const L=(desc,task,t1,t2,pupils,question,answer,product,criterion,next)=>({
  desc,task,teacher:[t1,t2],pupils,question,answer,product,criterion,next
});
const PLANS={
  1:{
    title:'Sayangi Haiwan',sp:'1.1.2',page:123,
    anchors:['sayangi haiwan','indira','hana','cik gu hadi'],
    task:'Membaca, memahami dan melakonkan dialog Indira dan Hana dengan memberikan respons yang sesuai terhadap suruhan pada Buku Teks m/s 123.',
    pak:'Main peranan dan semak respons: murid bertukar watak dalam dialog, kemudian menunjukkan respons lisan sendiri.',
    phases:[
      P('Kenal situasi dan watak dalam dialog',
        'Buka Buku Teks m/s 123 dan kenalkan Indira, Hana serta Cikgu Hadi sebagai watak yang muncul dalam teks.',
        'Tanya perkara yang berlaku apabila Indira dan Hana menemui seekor kucing, tanpa menyuruh murid meniru penyelamatan haiwan sebenar.',
        'Menunjuk watak dan situasi pada halaman.',
        'Menyatakan ringkas peristiwa dalam teks.',
        'Pengenalan murid bersandar pada dialog bercetak.'),
      P('Dengar contoh suruhan dan respons',
        'Baca peranan Hana yang mengajak Indira menolong kucing dan respons Indira dengan sebutan jelas.',
        'Tunjukkan ungkapan suruhan “cepat” serta respons “Baiklah, Hana. Saya bantu kamu” yang dicetak dalam teks.',
        'Menjejak giliran bercakap bagi Hana dan Indira.',
        'Mengenal satu suruhan dan satu respons sesuai.',
        'Murid memadankan suruhan dengan respons yang terdapat dalam dialog.'),
      P('Latih dua giliran watak secara berpasangan',
        'Agihkan peranan Indira dan Hana untuk bacaan dan lakonan dialog secara bergilir.',
        'Bantu sebutan dan nada respons, kemudian tukarkan watak agar kedua-dua murid mendapat giliran.',
        'Membaca dialog mengikut watak masing-masing.',
        'Bertukar watak serta mencuba respons dengan jelas.',
        'Penyertaan dinilai melalui giliran setiap murid, bukan hanya persembahan pasangan.'),
      P('Respons dalam situasi bertemu guru',
        'Bimbing murid membaca bahagian Indira dan Hana meminta maaf kepada Cikgu Hadi kerana lewat.',
        'Minta murid menyampaikan respons sesuai terhadap permintaan guru menjelaskan sebab lewat, berpandukan petikan.',
        'Menyampaikan ungkapan meminta maaf yang sesuai.',
        'Menyatakan secara lisan sebab watak lewat berdasarkan peristiwa cerita.',
        'Respons kekal pada cerita dan tidak menambah insiden baharu.'),
      P('Semakan tiga respons lisan individu',
        'Minta setiap murid memberikan tiga respons berkenaan suruhan dalam dialog dan memainkan sekurang-kurangnya satu bahagian watak.',
        'Catat ketepatan respons, sebutan dan tahap bimbingan; jika belum sempat, tetapkan giliran susulan.',
        'Memberikan respons lisan secara sendiri.',
        'Melakonkan bahagian dialog yang dipilih dengan sebutan jelas.',
        'Evidens PBD individu bukan daripada lakonan rakan semata-mata.'),
      P('Rumusan: respons sesuai dan kasih sayang',
        'Rumuskan cara watak memberi respons terhadap suruhan serta sikap prihatin yang tergambar dalam cerita.',
        'Minta murid menyatakan satu respons sopan yang dipelajari daripada dialog.',
        'Menyebut satu ungkapan respons sesuai.',
        'Menjelaskan makna respons itu dalam konteks cerita.',
        'Penutup menguatkan kemahiran mendengar dan bertutur SP 1.1.2.')
    ],
    lanes:{
      support:L('Petunjuk watak dan ungkapan diberi satu demi satu.',
        'Menyampaikan tiga respons mudah dengan bantuan, kemudian melakonkan satu bahagian dialog.',
        'Bacakan bahagian Hana terlebih dahulu supaya murid tahu masa untuk memberi respons.',
        'Kurangkan bantuan apabila murid mengulangi ungkapan sendiri.',
        ['Dengar suruhan watak.','Pilih respons dalam buku.','Sebut respons dan lakonkan peranan ringkas.'],
        'Apakah respons Indira apabila Hana meminta bantuan?',
        'Baiklah, Hana. Saya bantu kamu.',
        'Tiga respons individu dan satu cubaan lakonan; bantuan dicatat.',
        'Respons sesuai konteks, dengan sebutan yang dapat difahami.',
        'Ulang satu ungkapan dengan bantuan semakin dikurangkan.'),
      core:L('Pasangan melatih giliran bercakap sebelum semakan sendiri.',
        'Memberikan tiga respons dan mempersembahkan satu bahagian dialog dalam watak sendiri.',
        'Minta pasangan mengamati ketika suruhan dan respons berlaku.',
        'Dengar respons setiap murid secara berasingan selepas latihan.',
        ['Baca giliran watak.','Balas suruhan dengan ungkapan sesuai.','Tukar watak dan ulang.','Beri respons sendiri kepada guru.'],
        'Apakah yang dikatakan oleh Indira dan Hana kepada Cikgu Hadi?',
        'Maafkan kami, cikgu, kerana lewat.',
        'Persembahan dialog dan tiga respons lisan individu.',
        'Respons sesuai dan sebutan jelas apabila watak bertukar.',
        'Baiki ungkapan yang kurang tepat melalui pembacaan semula petikan.'),
      challenge:L('Murid mengekalkan kesantunan dan intonasi dalam tiga respons.',
        'Melakonkan bahagian dialog dengan nada yang sesuai dan menjelaskan satu sebab respons.',
        'Tanya mengapa ungkapan meminta maaf digunakan dalam situasi bertemu guru.',
        'Bantu murid menunjukkan bukti dialog sebelum menjawab, bukan mengarang cerita lain.',
        ['Baca bahagian watak dengan intonasi sesuai.','Berikan tiga respons yang relevan.','Terangkan sebab satu respons sesuai dengan situasi.'],
        'Mengapakah mereka meminta maaf kepada cikgu?',
        'Kerana mereka datang lewat ke sekolah.',
        'Respons serta satu sebab ringkas berpandukan dialog.',
        'Maklumat benar menurut teks dan ungkapan menunjukkan kesantunan.',
        'Perkemas nada dan susunan respons tanpa menambah tugasan luar sumber.')
    },
    pbd:{method:'Pemerhatian respons lisan individu dan persembahan dialog mengikut watak.',
      evidence:'Tiga respons sendiri terhadap suruhan/situasi dialog serta satu bahagian lakonan dengan sebutan yang jelas.',
      criterion:'Respons sesuai konteks dialog dan murid mencuba sekurang-kurangnya satu giliran watak.'},
    reflection:'Murid disemak: ____ / ____. Tiga respons sesuai: ____. Lakonan dialog jelas: ____. Bantuan diperlukan: ____. Susulan: ____.'
  },
  2:{
    title:'Haiwan yang Prihatin',sp:'2.3.2',page:124,
    anchors:['haiwan yang prihatin','sang kancil','pencerita','paruh'],
    task:'Membaca dan mempersembahkan bahagian cerita “Haiwan yang Prihatin” secara teater pembaca, kemudian menyatakan satu maklumat penting daripada bahan Buku Teks m/s 124.',
    pak:'Teater pembaca: peranan pencerita dan suara watak diagihkan selepas murid merujuk teks sebenar.',
    phases:[
      P('Kenal tajuk dan suara cerita',
        'Buka Buku Teks m/s 124; baca tajuk “Haiwan yang Prihatin” dan tunjuk label Pencerita yang wujud pada halaman.',
        'Tanya mengapa teks memperlihatkan haiwan bercakap; jangan tetapkan spesies bagi setiap ujaran jika OCR tidak menjelaskan pengucapnya.',
        'Menunjuk tajuk dan label Pencerita.',
        'Menyatakan satu tujuan membaca mengikut suara watak.',
        'Watak yang tidak jelas pada OCR perlu disemak pada gambar asli.'),
      P('Dengar model bacaan pencerita dan watak',
        'Guru membaca bahagian pencerita dan beberapa ujaran yang nyata pada halaman seperti cadangan mengangkat kayu atau memungut sampah.',
        'Modelkan jeda dan intonasi berdasarkan makna, bukan mereka-reka sambungan cerita yang tiada di petikan.',
        'Menjejak baris ketika guru membaca.',
        'Mengulang satu frasa dengan sebutan lebih jelas.',
        'Murid mengenal perbezaan naratif dan ujaran dalam teks.'),
      P('Cari masalah dan bantuan yang dicadangkan',
        'Minta murid mencari ujaran tentang sungai yang sakit/terjejas serta haiwan yang menawarkan pertolongan.',
        'Arahkan murid menunjukkan bukti ujaran “mengangkat kayu-kayu” atau “memungut sampah dengan paruh” pada halaman.',
        'Menunjuk satu masalah yang disebut oleh watak.',
        'Menyatakan satu cadangan bantuan berdasarkan ujaran sumber.',
        'Maklumat ialah daripada ujaran tercetak, bukan penghuraian sebab pencemaran yang tidak dinyatakan.'),
      P('Latihan teater pembaca secara bergilir',
        'Agihkan satu bahagian pendek sebagai pencerita atau ujaran watak setelah menyemak pemilik suara pada buku asal.',
        'Pastikan murid bergilir membaca, memperbaik sebutan dan intonasi tanpa meminta menghafal cerita.',
        'Membaca bahagian yang diberikan dengan jelas.',
        'Mendengar rakan kemudian menukar giliran bacaan.',
        'Setiap murid mencuba bacaan sendiri dan bukan hanya bergerak dalam kumpulan.'),
      P('Semakan bacaan dan satu isi individu',
        'Dengar setiap murid membaca satu bahagian yang bersesuaian, kemudian tanyakan satu maklumat penting daripada bahagian itu.',
        'Catat sebutan, intonasi, kefahaman isi dan bantuan yang diterima.',
        'Membaca bahagian pilihan sendiri.',
        'Menyebut satu cadangan atau masalah daripada teks.',
        'PBD mengukur bacaan individu dan satu maklumat tepat daripada teks.'),
      P('Penutup: prihatin pada alam',
        'Rumuskan cadangan haiwan seperti memungut sampah berdasarkan bahagian yang dibaca.',
        'Minta murid menyebut bagaimana suara watak menunjukkan kesediaan membantu.',
        'Menyampaikan satu isi daripada cerita.',
        'Menunjukkan ujaran yang menyokong isi itu.',
        'Rumusan tidak menyatakan kesudahan cerita yang tidak terdapat dalam snapshot halaman.')
    ],
    lanes:{
      support:L('Pilihan frasa pendek dan contoh sebutan daripada guru.',
        'Membaca satu bahagian pendek teater pembaca dengan bantuan dan menyatakan satu isi.',
        'Tunjuk ujaran pendek yang benar-benar tercetak dan modelkan jeda.',
        'Minta murid mengulang sendiri dengan sokongan dikurangkan.',
        ['Jejak satu ujaran.','Baca selepas contoh guru.','Sebut satu perkara yang dicadangkan dalam ujaran.'],
        'Apakah yang boleh dipungut menggunakan paruh menurut teks?',
        'Sampah.',
        'Cubaan bacaan dan satu isi lisan; bantuan direkod.',
        'Maklumat tepat dan bacaan semakin jelas mengikut kemampuan.',
        'Ulang frasa yang sukar sebelum membaca bahagian penuh.'),
      core:L('Latihan bacaan bergilir dan soal jawab bukti teks.',
        'Membaca peranan pencerita atau watak dengan sebutan dan intonasi sesuai serta menyatakan satu isi.',
        'Minta murid menunjukkan bahagian cetakan yang sedang dibaca.',
        'Semak seorang demi seorang selepas latihan pasangan.',
        ['Baca bahagian pilihan.','Laraskan intonasi.','Tunjuk bukti ujaran.','Sebut satu maklumat kepada guru.'],
        'Apakah satu pertolongan yang disebut?',
        'Saya boleh mengangkat kayu-kayu yang besar.',
        'Bacaan individu dengan satu isi tepat.',
        'Sebutan boleh difahami dan isi bersumber daripada bahagian dibaca.',
        'Baiki kata sukar atau intonasi pada bacaan kali kedua.'),
      challenge:L('Membezakan suara naratif dan ujaran serta menerangkan satu isi.',
        'Membaca dengan intonasi watak yang berbeza dan menjelaskan maklumat penting yang dibaca.',
        'Bimbing pemisahan suara pencerita dan watak berdasarkan kedudukan teks asal.',
        'Minta penjelasan isi yang disertakan bukti ujaran, tanpa mencipta watak baharu.',
        ['Baca bahagian pencerita atau ujaran yang telah disahkan.','Gunakan intonasi sesuai.','Jelaskan satu masalah dan satu cadangan yang terdapat dalam teks.'],
        'Bagaimanakah haiwan menunjukkan mereka mahu membantu?',
        'Ada yang menawarkan mengangkat kayu dan memungut sampah.',
        'Bacaan ekspresif dan penerangan isi yang disahkan teks.',
        'Bacaan sesuai makna dan tidak menokok tambah watak atau kesudahan cerita.',
        'Perkemas sebutan atau penjelasan pada bahagian yang kurang jelas.')
    },
    pbd:{method:'Pemerhatian bacaan teater pembaca individu dan soal jawab satu isi daripada teks.',
      evidence:'Bacaan bahagian naratif/ujaran dengan sebutan serta intonasi yang diamati guru dan satu maklumat tepat tentang masalah atau bantuan.',
      criterion:'Murid mempersembahkan bahagian dibaca dan menyatakan sekurang-kurangnya satu maklumat sah daripada halaman 124.'},
    reflection:'Murid disemak: ____ / ____. Membaca bahagian jelas: ____. Satu isi tepat: ____. Masih perlu model intonasi: ____. Susulan: ____.'
  },
  3:{
    title:'Diari Abang + PKJR',sp:'3.2.3',page:126,
    anchors:['diari abang','encik kamal','tenggiling','mendengar taklimat'],
    task:'Mencatat empat maklumat daripada catatan lawatan keluarga Indira ke Taman Negara Pahang dalam pengurusan grafik berdasarkan Buku Teks m/s 126. PKJR belum mempunyai sumber khusus yang terbukti.',
    pak:'Baca–Cari–Catat: pasangan menyemak lokasi maklumat, kemudian setiap murid melengkapkan pengurusan grafik sendiri.',
    phases:[
      P('Kenal bentuk catatan lawatan',
        'Buka Buku Teks m/s 126, baca tajuk Diari Abang dan tarikh 14 Oktober 2017 yang tercetak.',
        'Jelaskan bahawa sumber merupakan catatan lawatan keluarga Indira ke Taman Negara di Pahang.',
        'Menunjuk tajuk dan tarikh pada halaman.',
        'Menyatakan tempat lawatan berdasarkan pengenalan teks.',
        'Respons awal merujuk bahan, bukan pengalaman lawatan rekaan.'),
      P('Baca catatan untuk mengenal fakta',
        'Baca catatan yang menyebut Encik Kamal sebagai renjer, taklimat, ukur lilit pokok, pokok periuk kera dan tenggiling.',
        'Minta murid menjejak ayat dengan bukti bagi setiap peristiwa; elakkan mencipta nama atau urutan baharu.',
        'Membaca petikan secara berfrasa.',
        'Menunjuk empat butiran yang betul-betul disebut.',
        'Empat fakta berasal daripada petikan lawatan.'),
      P('Kenal isi penting pengurusan grafik',
        'Tunjuk pengurusan grafik asal dalam Buku Teks dan semak labelnya pada imej sebenar; susun atur OCR boleh bercampur.',
        'Bimbing murid memilih isi seperti mendengar taklimat, mengukur pokok, melihat periuk kera dan tenggiling.',
        'Memilih empat isi daripada petikan.',
        'Memadankan fakta dengan ruang yang sesuai pada grafik bercetak.',
        'Maklumat yang dicatat mesti tepat; slot grafik tidak direka daripada OCR.'),
      P('Catat empat maklumat sendiri',
        'Minta setiap murid mencatat sekurang-kurangnya empat maklumat penting dalam pengurusan grafik.',
        'Tekankan penulisan ringkas dan tepat, bukan menulis karangan lain atau menambah aktiviti PKJR tanpa sumber.',
        'Melengkapkan pengurusan grafik sendiri.',
        'Menyemak ejaan nama/kejadian dengan petikan.',
        'Keempat-empat maklumat berkaitan lawatan dan dikesan pada teks.'),
      P('Semak pemilihan dan catatan individu',
        'Semak empat fakta bagi setiap murid; catat mana-mana isi yang tersilap atau dimasukkan dalam kategori grafik tidak sesuai.',
        'Minta murid membetulkan sendiri maklumat setelah ditunjukkan ayat bukti.',
        'Menunjukkan empat catatan dan ayat petikan yang menyokongnya.',
        'Membetulkan fakta atau kedudukan dalam grafik yang tidak tepat.',
        'PBD ialah hasil catatan individu, bukan jawapan pasangan semata-mata.'),
      P('Rumusan menghargai maklumat diari',
        'Rumuskan faedah mengambil catatan penting selepas membaca bahan lawatan.',
        'Minta murid berkongsi satu fakta yang ditulis dan menunjukkan sumbernya.',
        'Menyebut satu catatan yang dibuat.',
        'Menunjuk bahagian petikan sebagai bukti.',
        'Penutup kekal pada kemahiran mencatat SP 3.2.3.')
    ],
    lanes:{
      support:L('Empat ayat bukti ditunjuk satu demi satu sebelum murid mencatat.',
        'Melengkapkan empat ruang maklumat berdasarkan petikan dengan bantuan yang dicatat.',
        'Bacakan satu ayat sumber, kemudian beri murid masa menulis isi sendiri.',
        'Semak padanan ruang grafik pada imej buku, bukan rajah yang diterka.',
        ['Tunjuk ayat petikan.','Pilih maklumat penting.','Catat satu fakta.','Ulang bagi empat fakta.'],
        'Siapakah renjer yang menyambut keluarga Indira?',
        'Encik Kamal.',
        'Empat catatan sendiri dalam grafik; bantuan dicatat.',
        'Fakta tepat dan ruang grafik dipilih dengan merujuk buku.',
        'Ulang cara memilih fakta daripada satu ayat yang belum tepat.'),
      core:L('Pasangan menyemak bukti sebelum murid menyiapkan grafik sendiri.',
        'Mencatat empat maklumat berlainan daripada diari dalam ruang grafik yang sepadan.',
        'Minta murid menunjukkan petikan yang membuktikan isi.',
        'Semak hasil catatan akhir individu selepas perbincangan.',
        ['Baca catatan.','Pilih empat peristiwa/fakta.','Catat sendiri dalam grafik.','Semak dengan petikan.'],
        'Apakah yang keluarga lakukan bersama Encik Kamal?',
        'Mereka mendengar taklimat daripada renjer.',
        'Empat fakta tersusun pada grafik individu.',
        'Empat fakta sumber tepat dan dipindahkan mengikut grafik asal.',
        'Baiki fakta yang tidak sepadan dan semak semula ayat sumber.'),
      challenge:L('Pilih empat fakta berbeza dan jelaskan bukti tanpa mengarang maklumat lain.',
        'Melengkapkan empat catatan dan menerangkan sebab setiap fakta dipilih.',
        'Minta murid bezakan nama, aktiviti dan haiwan/tumbuhan yang dicatat.',
        'Pastikan bukti diperoleh daripada petikan sebenar halaman 126.',
        ['Kenal empat fakta.','Catat mengikut pengurusan grafik.','Tunjukkan bukti satu fakta.','Jelaskan pilihannya.'],
        'Apakah haiwan yang dilihat oleh keluarga Indira?',
        'Seekor tenggiling.',
        'Empat catatan tepat disertai satu justifikasi sumber.',
        'Fakta tepat, tidak berulang dan boleh ditunjuk pada teks.',
        'Perincikan catatan yang kabur, tanpa menggantikan catatan dengan karangan.')
    },
    pbd:{method:'Semakan empat catatan individu daripada bahan dalam pengurusan grafik.',
      evidence:'Empat maklumat penting yang benar-benar tercatat dalam diari, contohnya taklimat Encik Kamal, mengukur pokok, periuk kera dan tenggiling.',
      criterion:'Sekurang-kurangnya empat maklumat berbeza dicatat dengan tepat berdasarkan petikan dan grafik asal.'},
    reflection:'Murid disemak: ____ / ____. Empat fakta tepat: ____. Mengisi grafik dengan betul: ____. Bimbingan bacaan: ____. Susulan: ____.'
  },
  4:{
    title:'Taman Botani',sp:'5.1.4',page:127,
    anchors:['taman botani','kata hubung','tetapi','atau'],
    task:'Memahami kata hubung gabungan “dan”, “tetapi” dan “atau” serta membina sekurang-kurangnya tiga ayat berdasarkan jadual Buku Teks m/s 127.',
    pak:'Baca–Pilih–Bina: pasangan membanding fungsi kata hubung, kemudian setiap murid menghasilkan tiga ayat sendiri.',
    phases:[
      P('Teliti tajuk dan jadual kata hubung',
        'Buka Buku Teks m/s 127 dan tunjuk tajuk Taman Botani serta jadual kata hubung dan, tetapi, atau.',
        'Minta murid memerhati pilihan frasa di dalam jadual asal sebelum membina ayat.',
        'Menunjuk ketiga-tiga kata hubung bercetak.',
        'Menyatakan satu situasi daripada jadual.',
        'Perhatian bersandarkan halaman, bukan susunan jadual hasil tekaan OCR.'),
      P('Bezakan fungsi dan, tetapi, atau',
        'Beri contoh makna gabungan, pertentangan dan pilihan melalui kata hubung yang muncul dalam halaman.',
        'Baca contoh yang jelas tercetak: Indira ke taman botani atau ke taman tema air?',
        'Membaca kata hubung dalam jadual.',
        'Menyatakan sama ada ayat menunjukkan gabungan, pertentangan atau pilihan.',
        'Murid dapat mengaitkan fungsi setiap kata hubung dengan maksud ayat.'),
      P('Rangka ayat daripada maklumat jadual',
        'Minta murid meneliti nama Indira, abang, kakak serta tindakan berjoging, bermain dan keadaan hujan yang terdapat dalam jadual.',
        'Modelkan pembinaan ayat baharu sebagai **contoh guru**, bukan mengaku semua padanan ditentukan daripada teks OCR.',
        'Menunjuk frasa yang dipilih pada buku bercetak.',
        'Membina satu ayat lisan dengan kata hubung sesuai.',
        'Guru menyemak padanan dalam jadual bercetak; OCR bukan sumber susunan lajur yang lengkap.'),
      P('Bina dan tulis tiga ayat',
        'Minta murid membina sekurang-kurangnya tiga ayat sendiri menggunakan dan, tetapi dan atau dalam konteks jadual.',
        'Ingatkan huruf besar dan noktah atau tanda tanya yang sesuai dengan bentuk ayat.',
        'Menulis tiga ayat individu yang membawa makna betul.',
        'Menyemak kata hubung dan tanda baca sendiri.',
        'Satu ayat yang betul bagi setiap fungsi kata hubung.'),
      P('Semakan ayat individu dan pembetulan',
        'Semak tiga ayat berdasarkan kesesuaian kata hubung, hubungan makna dan rujukan jadual.',
        'Minta murid membetulkan ayat yang salah pilih kata hubung atau salah tanda baca.',
        'Menjelaskan pilihan satu kata hubung.',
        'Membetulkan sekurang-kurangnya satu kesilapan jika ada.',
        'PBD berdasarkan tiga ayat murid sendiri, bukan hasil ayat pasangan.'),
      P('Penutup: pilih kata hubung mengikut makna',
        'Rumuskan beza dan (gabungan), tetapi (pertentangan) dan atau (pilihan).',
        'Minta murid membaca satu ayat sendiri serta menyatakan sebab kata hubung itu sesuai.',
        'Membaca ayat yang dibina.',
        'Menunjukkan kata hubung yang digunakan dan fungsi ringkasnya.',
        'Penutup kekal pada kata hubung gabungan mengikut SP 5.1.4.')
    ],
    lanes:{
      support:L('Tunjuk pilihan kata hubung dan bina satu ayat pada satu masa.',
        'Melengkapkan tiga ayat dengan dan, tetapi atau mengikut petunjuk makna.',
        'Berikan rangka ayat dan tunjuk perkataan daripada jadual asal.',
        'Minta murid memilih kata hubung sendiri lalu membaca ayat lengkap.',
        ['Pilih satu kata hubung.','Teliti frasa sumber.','Bina satu ayat.','Ulang untuk tiga kata hubung.'],
        'Apakah kata hubung bagi menunjukkan pilihan tempat?',
        'Atau.',
        'Tiga ayat bertulis sendiri; bimbingan dicatat.',
        'Kata hubung sepadan dengan fungsi gabungan, pertentangan atau pilihan.',
        'Ulang satu ayat dengan pilihan kata hubung yang disemak.'),
      core:L('Bina ayat sendiri selepas membanding penggunaan kata hubung secara berpasangan.',
        'Tulis tiga ayat lengkap yang menggunakan dan, tetapi dan atau.',
        'Minta murid membuktikan pilihan kata hubung melalui makna yang hendak disampaikan.',
        'Semak tiga ayat individu terhadap jadual asal.',
        ['Tentukan hubungan makna.','Pilih frasa daripada buku.','Bina tiga ayat.','Semak tanda baca dan kata hubung.'],
        'Mengapakah kita menggunakan atau dalam contoh taman botani?',
        'Untuk menunjukkan pilihan tempat.',
        'Tiga ayat individu dengan tiga fungsi kata hubung.',
        'Ayat lengkap, hubungan makna tepat dan tanda baca sesuai.',
        'Baiki ayat yang tidak menepati hubungan makna.'),
      challenge:L('Berikan alasan pilihan kata hubung sambil kekal pada tugas membina ayat.',
        'Tulis tiga ayat dengan hubungan makna jelas dan jelaskan satu pilihan kata hubung.',
        'Minta murid menghuraikan perbezaan dan dengan tetapi pada ayat baharu.',
        'Pastikan contoh guru dibezakan daripada petikan tercetak dan tidak memaksa padanan OCR.',
        ['Bina tiga ayat daripada konteks halaman.','Semak kata hubung.','Jelaskan satu hubungan makna.'],
        'Apakah beza dan dengan tetapi?',
        'Dan menggabungkan perkara; tetapi menunjukkan pertentangan.',
        'Tiga ayat tepat serta penjelasan satu fungsi kata hubung.',
        'Kata hubung sesuai dan alasan mencerminkan makna ayat.',
        'Perkemas ayat yang hubungan maknanya belum jelas.')
    },
    pbd:{method:'Semakan tiga ayat bertulis individu menggunakan kata hubung dan, tetapi, atau.',
      evidence:'Tiga ayat dengan pilihan kata hubung dan hubungan makna tepat berdasarkan konteks jadual halaman 127.',
      criterion:'Murid membina sekurang-kurangnya tiga ayat lengkap menggunakan kata hubung gabungan yang sesuai.'},
    reflection:'Murid disemak: ____ / ____. Tiga ayat tepat: ____. Fungsi dan/tetapi/atau tepat: ____. Tanda baca perlu diperbaiki: ____. Susulan: ____.'
  }
};
function applies(map,opts={}){
  const plan=PLANS[Number(map?.session_no)];
  if(!plan)return false;
  const meta=map?.source_evidence?.meta||{};
  const key=opts.subjectKey||map?.subject_key||(typeof root.rphSubjectKey==='function'?root.rphSubjectKey(map?.subject_id):'');
  const source=norm(map?.source_evidence?.textbook?.text).toLowerCase();
  return key==='bm'&&Number(map?.year)===1&&Number(map?.academic_year)===2026
    &&Number(map?.week_no)===32&&map?.verification_status==='verified'
    &&map?.week_exact===true&&map?.sp_crosscheck===true
    &&meta.session_exact===true&&meta.page_route_verified===true
    &&norm(meta.main_sp||map?.sp)===plan.sp&&norm(map?.sp)===plan.sp
    &&Number(map?.textbook_page_start)===plan.page
    &&Number(map?.textbook_page_end||plan.page)===plan.page
    &&norm(map?.title).toLowerCase()===plan.title.toLowerCase()
    &&plan.anchors.every(a=>source.includes(a));
}
function textStep(phase,page){
 return 'Tindakan guru: '+phase.teacher.join('\n')+'\nTindakan murid: '+phase.pupils.join('\n')
    +'\nSemakan: '+phase.check+'\nBahan: Buku Teks m/s '+page;
}
function build(map,opts={}){
 if(!applies(map,opts))throw Error('BM1_WEEK32_SOURCE_PLAN_SCOPE_MISMATCH');
 const plan=PLANS[Number(map.session_no)];
 const canonical=root.BmYear1CanonicalRph?.build(map,opts);
 if(!canonical)throw Error('BM1_CANONICAL_ENGINE_REQUIRED');
 const phases=plan.phases.map(x=>({...x,resources:['Buku Teks m/s '+plan.page]}));
 const sourceSteps=phases.map((x,i)=>({
   key:'bm1-w32-s'+map.session_no+'-step-'+(i+1),name:x.name,
   text:textStep(x,plan.page),bbm:'Buku Teks m/s '+plan.page,
   pak21:plan.pak,phase:'source-specific-teacher-plan'
 }));
 const differentiation={},librarySteps={};
 for(const key of ['support','core','challenge']){
   const a=plan.lanes[key],label={support:'Peneroka',core:'Pembina',challenge:'Pencabar'}[key];
   differentiation[key]={label,support_description:a.desc,task:a.task,
     materials:['Buku Teks m/s '+plan.page],teacher:a.teacher,pupil_steps:a.pupils,
     example:{teacher:a.question,pupil:a.answer},product:a.product,criterion:a.criterion,next_step:a.next};
   librarySteps[key]=[{key:'bm1-w32-s'+map.session_no+'-'+key,name:label,
     text:'Tugasan sumber: '+a.task,bbm:'Buku Teks m/s '+plan.page,pak21:plan.pak,phase:'source-specific-teacher-plan'}];
 }
 const first=phases[0],last=phases[phases.length-1];
 return {...canonical,canonicalBm1:true,sourcePlanBm1:true,
   sourcePlanReviewStatus:'LESSON_MAP_EVIDENCE_NOT_WORD_APPROVED',
   sourcePlanTeacherReviewNeeded:true,sourcePlanSession:'BM1-2026B-W32-S'+map.session_no,
   sourcePlanVersion:VERSION,canonicalVersion:VERSION,sourceTask:plan.task,anchor:plan.task,
   phases,sourceSteps,classroomFlow:sourceSteps,librarySteps,differentiation,
   groupBbm:{support:'Buku Teks m/s '+plan.page,core:'Buku Teks m/s '+plan.page,challenge:'Buku Teks m/s '+plan.page},
   bbmList:['Buku Teks m/s '+plan.page],pak21:plan.pak,pakDetail:plan.pak,
   pbd:plan.pbd,pbdEvidence:plan.pbd,reflection:plan.reflection,intervention:[],
   inductionData:{name:first.name,text:textStep(first,plan.page),bbm:'Buku Teks m/s '+plan.page,pak21:plan.pak},
   setInduksi:textStep(first,plan.page),penutup:textStep(last,plan.page),
   diffSupportAct:differentiation.support.task,diffCoreAct:differentiation.core.task,
   diffChallengeAct:differentiation.challenge.task,page:'m/s '+plan.page,mainSp:plan.sp,topic:plan.title,
   pkjrStatus:Number(map.session_no)===3?'PKJR_TITLE_ONLY_NO_VERIFIED_PKJR_SOURCE':null
 };
}
root.BmYear1Week32SourcePlans={VERSION,availableSessions:[1,2,3,4],applies,build};
try{if(typeof module!=='undefined'&&module.exports)module.exports=root.BmYear1Week32SourcePlans}catch{}
})(typeof window!=='undefined'?window:globalThis);
