// RPH Bahasa Melayu Tahun 1 Kumpulan B 2026 — Minggu 33, Buku Teks m/s 128–132.
// Sesi-spesifik berdasarkan source_evidence Lesson Map verified, BUKAN dokumen Word
// yang disahkan guru. Enam langkah ialah reka bentuk PdP daripada tugasan buku,
// bukan dakwaan bahawa buku mencetak enam langkah berurutan.
(function(root){
'use strict';
const VERSION='BM1-W33-SOURCE-PLANS-20261009d';
const n=x=>String(x??'').replace(/\s+/g,' ').trim();
const ph=(name,teacher,pupils,check)=>({name,teacher,pupils,check});
const group=(description,task,teacher,pupils,question,answer,product,criterion,next)=>({
 description,task,teacher,pupils,question,answer,product,criterion,next
});
const plans={
  1:{
    title:'Buku Skrap Kakak',page:128,sp:'5.3.1',
    anchors:['buku skrap kakak','pokok periuk kera','ayat penyata','tumbuhan liar'],
    task:'Mengenal pasti dan membina tiga ayat penyata berdasarkan maklumat pokok periuk kera di Buku Teks m/s 128.',
    pak:'Cari–Padan–Bina: pasangan menyemak fakta sumber sebelum setiap murid menulis tiga ayat sendiri.',
    steps:[
      ph('Kenal buku skrap dan ayat penyata',
        ['Buka Buku Teks m/s 128 dan baca tajuk Buku Skrap Kakak serta tajuk Pokok Periuk Kera.','Tunjukkan takrif ayat penyata sebagai ayat yang menyampaikan pernyataan.'],
        ['Menunjukkan tajuk dan contoh ayat penyata.','Menyebut satu perkara yang dinyatakan oleh teks.'],
        'Murid membezakan pernyataan daripada soalan atau suruhan.'),
      ph('Baca maklumat benar pada halaman',
        ['Bimbing bacaan maklumat bahawa pokok periuk kera ialah tumbuhan liar yang tumbuh di hutan Malaysia.','Tunjuk contoh tercetak “Kita perlu memelihara pokok ini agar tidak pupus” sebagai ayat penyata.'],
        ['Membaca dua contoh ayat sumber.','Menunjukkan maklumat yang dinyatakan dalam setiap ayat.'],
        'Murid menunjuk bukti teks, tidak menokok tambah kegunaan tumbuhan.'),
      ph('Bezakan fakta dan bentuk ayat penyata',
        ['Minta murid memilih maklumat dari halaman seperti tumbuhan liar, tempat tumbuh atau bentuk unik.','Soal bagaimana ayat penyata memberi maklumat, bukan meminta jawapan.'],
        ['Memilih tiga maklumat yang boleh ditunjukkan pada bahan.','Mengucapkan setiap fakta dengan ayat lengkap.'],
        'Tiga fakta boleh dirujuk semula kepada halaman 128.'),
      ph('Bina tiga ayat penyata individu',
        ['Beri satu contoh rangka ayat “Pokok periuk kera ...”, kemudian minta ayat baharu murid berdasarkan sumber.','Ingatkan huruf besar dan noktah; jangan mewajibkan murid mengulang dakwaan perubatan sebagai nasihat kesihatan.'],
        ['Menulis tiga ayat penyata sendiri.','Menyemak ejaan dan tanda noktah.'],
        'Tiga ayat menyampaikan pernyataan dan merujuk kandungan sumber.'),
      ph('Semak bentuk ayat dan bukti individu',
        ['Periksa tiga ayat setiap murid untuk fungsi penyata, ketepatan fakta dan tanda baca.','Minta murid membetulkan ayat yang berbentuk soalan atau mengandungi fakta tidak disokong teks.'],
        ['Membaca satu ayat yang ditulis.','Menunjuk sumber bagi fakta dan membetulkan ayat sendiri.'],
        'PBD daripada tiga ayat individu, bukan contoh papan atau kerja pasangan.'),
      ph('Rumusan ayat penyata',
        ['Rumuskan maksud ayat penyata dan satu cara memilih maklumat sumber.','Pilih murid yang berbeza untuk berkongsi ayat lengkap yang sudah disemak.'],
        ['Menyebut ciri ayat penyata.','Membaca satu ayat sendiri yang tepat.'],
        'Penutup menunjukkan pemahaman fungsi ayat penyata.')
    ],
    lanes:{
      support:group('Gunakan petunjuk baris dan rangka ayat; bantuan dikurangkan secara bertahap.',
        'Mencari tiga maklumat dan menghasilkan tiga ayat penyata terbimbing.',
        ['Tunjuk fakta sumber satu demi satu.','Berikan rangka ayat pendek tanpa melengkapkannya bagi murid.'],
        ['Tunjuk fakta pada halaman.','Lengkapkan rangka ayat.','Tulis dan baca tiga ayat.'],
        'Pokok periuk kera ialah sejenis apa?','Pokok periuk kera ialah sejenis tumbuhan liar.',
        'Tiga ayat penyata individu dengan tahap bantuan direkod.',
        'Ayat lengkap dan maklumat disokong teks; gunakan noktah.',
        'Baca semula ayat yang masih mempunyai bentuk atau fakta tidak tepat.'),
      core:group('Pasangan membanding maklumat sebelum menulis secara sendiri.',
        'Menulis tiga ayat penyata berlainan tentang pokok periuk kera.',
        ['Minta bukti halaman bagi maklumat yang dipilih.','Semak ayat murid secara individu selepas perbincangan.'],
        ['Pilih tiga fakta berlainan.','Bina tiga ayat dengan ayat sendiri.','Semak fungsi penyata dan tanda baca.'],
        'Di manakah pokok periuk kera tumbuh?','Pokok ini tumbuh di hutan di Malaysia.',
        'Tiga ayat penyata dengan fakta dan tanda baca tepat.',
        'Ayat penyata menyatakan maklumat yang benar-benar tercatat pada sumber.',
        'Baiki satu ayat yang belum berbentuk penyata.'),
      challenge:group('Jelaskan bukti bagi fakta sambil kekal dalam kemahiran ayat penyata.',
        'Menulis tiga ayat berbeza dan membuktikan kaitan dengan halaman 128.',
        ['Minta murid tunjuk tiga bukti berlainan dari sumber.','Semak ayat tidak berubah menjadi seruan atau soalan.'],
        ['Pilih fakta yang berbeza.','Bina ayat penyata sendiri.','Terangkan bukti bagi satu ayat.'],
        'Mengapakah ayat ini ayat penyata?','Ayat ini menyatakan bahawa pokok itu tumbuh di hutan.',
        'Tiga ayat berasaskan fakta disertai penjelasan satu fungsi ayat.',
        'Keterangan tepat dan jenis ayat kekal penyata.',
        'Perkemas ayat kabur tanpa menambah fakta luar buku.')
    },
    pbd:{method:'Semakan tiga ayat penyata bertulis individu.',
      evidence:'Tiga ayat yang menyatakan maklumat pokok periuk kera daripada halaman 128, dengan tanda baca dan fakta yang boleh ditunjuk.',
      criterion:'Tiga ayat penyata lengkap, menyampaikan fakta sumber serta menggunakan huruf besar dan noktah.'},
    reflection:'Murid disemak: ____ / ____. Tiga ayat penyata tepat: ____. Fakta sumber tepat: ____. Tanda baca perlu dibetulkan: ____. Susulan: ____.'
  },
  2:{
    title:'Program Hari Hijau',page:129,sp:'1.1.2',
    anchors:['program hari hijau','kain lap','anita','membawa bunga'],
    task:'Memberi sekurang-kurangnya tiga respons lisan yang sesuai terhadap pesanan tentang Program Hari Hijau dalam dialog Buku Teks m/s 129.',
    pak:'Simulasi pesanan: murid bergilir menjadi guru dan penerima pesanan; respons akhir dicatat daripada suara sendiri.',
    steps:[
      ph('Kenal suasana Program Hari Hijau',
        ['Buka Buku Teks m/s 129 dan jelaskan bahawa guru menyampaikan pesanan tentang program esok.','Minta murid mengenal peserta perbualan dan tujuan pesanan.'],
        ['Menyebut nama program.','Menunjukkan watak pemberi pesanan dan penerima.'],
        'Murid dapat mengenali konteks pesanan yang ditulis.'),
      ph('Dengar pesanan membawa kain lap',
        ['Baca pesanan guru bahawa murid perlu membawa kain lap.','Modelkan respons “Ya, cikgu. Saya akan bawa kain lap” berdasarkan halaman.'],
        ['Mendengar ayat pesanan.','Menyampaikan respons yang sesuai dengan arahan.'],
        'Respons berkaitan kain lap, bukan menyebut objek yang tiada.'),
      ph('Kenali pesanan kepada Anita',
        ['Baca ujaran guru yang meminta Anita membawa bunga untuk hiasan meja.','Bimbing murid membezakan pesanan membawa kain lap dan pesanan bunga untuk Anita.'],
        ['Menunjukkan bahagian dialog tentang Anita.','Menyebut perkara yang diminta dibawa.'],
        'Murid dapat membanding dua pesanan tanpa bercampur watak.'),
      ph('Simulasi pesanan berpasangan',
        ['Agihkan giliran watak guru/murid bagi dialog sumber.','Minta respons sopan dan jelas; jangan tambah tugasan fizikal membawa bahan sebenar.'],
        ['Menyampaikan pesanan menggunakan dialog buku.','Menukar giliran dan memberi respons sesuai.'],
        'Latihan berpasangan tidak menggantikan penguasaan individu.'),
      ph('Semak tiga respons individu',
        ['Tanyakan tiga pesanan atau soalan mudah berdasarkan dialog: program, kain lap, bunga Anita.','Dengar setiap murid memberi respons dan catat kejelasan/sepadan dengan pesanan.'],
        ['Menjawab tiga rangsangan secara sendiri.','Membetulkan respons yang tersasar selepas maklum balas.'],
        'Bukti PBD ialah respons individu terhadap maklumat pesanan sebenar.'),
      ph('Penutup: terima dan respons pesanan',
        ['Rumuskan cara mendengar dan memberikan respons terhadap pesanan dengan hormat.','Minta murid menyatakan satu respons daripada dialog yang difahami.'],
        ['Menyebut satu respons sopan.','Menyatakan pesanan yang dijawabnya.'],
        'Penutup berasaskan SP mendengar dan bertutur.')
    ],
    lanes:{
      support:group('Pilihan dua respons berdasarkan petikan dan latihan sebutan berulang.',
        'Memberi tiga respons yang sesuai dengan petunjuk pesanan.',
        ['Baca pesanan dengan nada perlahan.','Tunjuk bahagian dialog yang menyokong respons murid.'],
        ['Dengar pesanan.','Pilih respons sepadan.','Sebut tiga respons sendiri.'],
        'Apakah respons terhadap pesanan membawa kain lap?','Ya, cikgu. Saya akan bawa kain lap.',
        'Tiga respons lisan individu dan bantuan dicatat.',
        'Respons sepadan dengan pesanan dan difahami pendengar.',
        'Ulang satu pesanan dengan petunjuk semakin kurang.'),
      core:group('Latihan simulasi diikuti semakan respons setiap murid.',
        'Memberi tiga respons sopan terhadap pesan guru dan Anita.',
        ['Susun giliran simulasi supaya kedua-dua murid bercakap.','Semak kesepadanan jawapan mengikut penerima pesanan.'],
        ['Baca dialog sumber.','Berlakon secara bergilir.','Beri tiga respons kepada guru secara sendiri.'],
        'Siapakah diminta membawa bunga?','Anita.',
        'Tiga respons lisan yang tepat dalam konteks.',
        'Pesanan berbeza tidak dicampurkan dan respons disampaikan jelas.',
        'Baiki respons yang tersalah mengaitkan watak.'),
      challenge:group('Terangkan maksud pesanan melalui respons yang lebih lengkap.',
        'Memberi tiga respons dan menjelaskan satu sebab respons itu sesuai.',
        ['Minta murid menjelaskan barang yang perlu dibawa oleh watak tertentu.','Kekalkan konteks dialog dan elakkan maklumat penganjuran rekaan.'],
        ['Dengar pesanan.','Balas dengan lengkap.','Tunjukkan bukti dialog bagi satu respons.'],
        'Mengapa respons “Saya akan bawa kain lap” sesuai?','Kerana guru meminta murid membawa kain lap.',
        'Tiga respons tepat dan satu penjelasan ringkas.',
        'Maklumat pesanan dan penerimanya jelas dengan adab pertuturan.',
        'Perkemas respons agar lebih lengkap tanpa menukar jenis tugasan.')
    },
    pbd:{method:'Pemerhatian tiga respons lisan individu dalam simulasi pesanan.',
      evidence:'Jawapan sendiri tentang Program Hari Hijau, kain lap dan bunga Anita, dinilai mengikut kesesuaian pesanan.',
      criterion:'Sekurang-kurangnya tiga respons lisan sesuai, sopan dan berpunca daripada perbualan sumber.'},
    reflection:'Murid disemak: ____ / ____. Tiga respons sesuai: ____. Dapat membezakan pesanan: ____. Bantuan pertuturan: ____. Susulan: ____.'
  },
  3:{
    title:'Jimatkan Tenaga + PKJR',page:130,sp:'2.3.1',
    anchors:['jimatkan tenaga','suis lampu','kipas','indira'],
    task:'Membaca cerita Jimatkan Tenaga dan mengenal pasti tiga maklumat penting, kemudian menceritakan dua amalan menjimatkan elektrik di sekolah berdasarkan sumber m/s 130; PKJR belum dibuktikan.',
    pak:'Baca–Cari Bukti–Cerita: pasangan membanding isi cerita sebelum murid menyebut cara menjimatkan elektrik secara sendiri.',
    steps:[
      ph('Kenal tema jimat elektrik',
        ['Buka Buku Teks m/s 130 dan baca tajuk Jimatkan Tenaga.','Tanya mengapa Indira berbual dengan ayahnya menurut pengenalan cerita.'],
        ['Menunjukkan tajuk dan watak Indira/ayah.','Menyatakan isu yang ditanyakan oleh Indira.'],
        'Respons berdasarkan soalan tentang penggunaan elektrik dalam cerita.'),
      ph('Baca dialog Indira dan ayah',
        ['Modelkan bacaan berfrasa bagi dialog selepas makan malam.','Minta murid menjejak ayat yang menerangkan cara menjimatkan tenaga, bukannya menghafal amalan tanpa membaca.'],
        ['Membaca bahagian dialog yang dipilih.','Menunjuk ayat sumber yang mengandungi amalan.'],
        'Bukti bacaan individu dan maklumat utama direkod berasingan.'),
      ph('Kutip tiga maklumat daripada cerita',
        ['Semak maklumat daripada teks: tutup suis lampu apabila hari cerah, tutup lampu apabila keluar rumah, tutup kipas apabila keluar rumah.','Minta murid menunjukkan ayat yang menyokong maklumat, tanpa menambah angka penggunaan elektrik.'],
        ['Menyebut tiga maklumat dengan ayat mudah.','Menunjukkan frasa sokongan pada teks.'],
        'Tiga maklumat benar-benar bersumberkan cerita m/s 130.'),
      ph('Kaitkan dua amalan dengan sekolah',
        ['Tanya dua cara menjimatkan tenaga elektrik yang sesuai di sekolah berdasarkan prinsip menutup suis apabila tidak diperlukan.','Bincang respons contoh sebagai pemahaman, bukan meminta murid mengendalikan peralatan elektrik tanpa arahan guru.'],
        ['Menyatakan dua amalan yang sesuai di sekolah.','Membanding tindakan sekolah dengan cerita keluarga Indira.'],
        'Cadangan ialah aplikasi munasabah daripada prinsip teks dan dinyatakan sebagai cadangan murid.'),
      ph('Semak bacaan dan penerangan individu',
        ['Dengar murid membaca bahagian cerita, menyebut tiga fakta dan dua cara menjimatkan elektrik di sekolah.','Rekod siapa telah dibaca/ditanya sendiri dan bantuan yang diberi; jangan anggap jawapan pasangan sebagai bukti.'],
        ['Membaca bahagian pilihan sendiri.','Menyatakan isi dan dua cadangan sekolah secara individu.'],
        'Bukti PBD membezakan kefahaman cerita dan cadangan aplikasi.'),
      ph('Rumusan amalan bijak tenaga',
        ['Rumuskan nasihat ayah yang berkaitan dengan penggunaan lampu serta kipas.','Minta murid menyebut satu isi tepat dan satu tindakan yang sesuai untuk sekolah.'],
        ['Menyebut satu isi daripada dialog.','Menyatakan satu cadangan sekolah dengan jelas.'],
        'Penutup kekal pada membaca cerita; kandungan PKJR tidak ditokok tambah.')
    ],
    lanes:{
      support:group('Bimbing murid mencari frasa lampu dan kipas sebelum menyebut isi.',
        'Membaca petikan terbimbing dan menyatakan tiga isi serta dua amalan sekolah dengan bantuan dicatat.',
        ['Tunjuk ayat nasihat ayah satu demi satu.','Beri rangka “Kita menutup ... apabila ...” tanpa menyebut semua jawapan.'],
        ['Baca ayat pilihan.','Cari tiga isi sumber.','Sebut dua cara sesuai untuk sekolah.'],
        'Apakah yang perlu dilakukan apabila hari sudah cerah?','Tutup suis lampu.',
        'Bacaan serta maklumat dan cadangan individu dengan bantuan direkod.',
        'Isi berasal daripada cerita dan dua cadangan sekolah relevan.',
        'Baca semula ayat yang belum difahami sebelum menyebut cadangan.'),
      core:group('Murid berbincang isi dan kemudian membuktikan pemahaman sendiri.',
        'Membaca cerita, mengemukakan tiga isi tepat dan dua amalan sekolah.',
        ['Minta murid menunjukkan baris cerita yang berkaitan.','Tanya aplikasi sekolah selepas kefahaman isi disahkan.'],
        ['Baca petikan.','Tandakan tiga maklumat.','Ceritakan dua cadangan sekolah.','Jawab guru sendiri.'],
        'Apa dilakukan sebelum meninggalkan rumah dalam cerita?','Tutup suis lampu dan kipas.',
        'Tiga fakta cerita dan dua amalan sekolah yang diterangkan individu.',
        'Perbezaan sumber cerita dengan cadangan sekolah dinyatakan jelas.',
        'Perkemas isi yang belum mempunyai bukti dalam dialog.'),
      challenge:group('Menjelaskan hubungan antara bukti cerita dengan cadangan sekolah.',
        'Membaca dan menyebut tiga isi, kemudian menjelaskan dua amalan sekolah berdasarkan isi teks.',
        ['Minta alasan mengapa cadangan sekolah berkaitan dengan nasihat ayah.','Tunjukkan perbezaan fakta buku dan contoh aplikasi murid.'],
        ['Rujuk petikan.','Nyatakan tiga fakta.','Cadangkan dua amalan sekolah.','Jelaskan satu kaitan dengan dialog.'],
        'Mengapa menutup lampu bilik darjah ketika tidak diperlukan sesuai dengan cerita?','Ayah Indira menasihati supaya lampu ditutup apabila tidak diperlukan.',
        'Tiga isi dan dua cadangan dengan satu alasan tepat.',
        'Fakta tidak direka dan cadangan boleh dihubungkan kepada prinsip cerita.',
        'Baiki alasan yang kurang tepat tanpa menambah data elektrik luar sumber.')
    },
    pbd:{method:'Pemerhatian bacaan individu, tiga maklumat cerita dan dua respons aplikasi sekolah.',
      evidence:'Tiga isi yang dikenal pasti daripada dialog nasihat ayah, serta dua amalan sekolah yang murid jelaskan sebagai cadangan sendiri.',
      criterion:'Tiga maklumat cerita tepat dan dua cara menjimatkan tenaga elektrik di sekolah sesuai dengan mesej teks.'},
    reflection:'Murid disemak: ____ / ____. Tiga isi cerita tepat: ____. Dua cadangan sekolah tepat: ____. Bacaan memerlukan bantuan: ____. Susulan: ____.'
  },
  4:{
    title:'Beg Mesra Alam',page:131,sp:'3.3.1',
    anchors:['beg mesra alam','diperbuat daripada tumbuhan','ringan dan nipis','boleh dicuci'],
    task:'Menghasilkan karangan terkawal Beg Mesra Alam menggunakan sekurang-kurangnya lima maklumat daripada nota pada Buku Teks m/s 131.',
    pak:'Pilih–Susun–Tulis: rakan membantu menyemak senarai sumber tetapi karangan dihasilkan oleh setiap murid sendiri.',
    steps:[
      ph('Kenal bahan karangan Beg Mesra Alam',
        ['Buka Buku Teks m/s 131 dan baca tajuk serta dua ayat pembukaan yang bercetak.','Tunjuk bahawa halaman menyediakan nota ringkas tentang ciri beg untuk dikembangkan menjadi karangan.'],
        ['Membaca tajuk dan ayat pembukaan.','Mengenal bahawa bahan berupa nota untuk karangan.'],
        'Murid mengenal tujuan penulisan terkawal.'),
      ph('Pilih lima fakta dari nota',
        ['Minta murid mencari fakta nota: diperbuat daripada tumbuhan, pelbagai bentuk/warna, ringan/nipis, mudah dibawa, boleh dikitar semula, boleh dicuci, cepat kering.','Bezakan antara fakta bercetak dengan pujian atau sifat baharu yang tidak tercatat.'],
        ['Menunjuk sekurang-kurangnya lima maklumat pada buku.','Mencatat kata kunci fakta yang dipilih.'],
        'Lima fakta boleh dibuktikan terus pada m/s 131.'),
      ph('Susun fakta untuk penulisan terkawal',
        ['Modelkan turutan: pengenalan beg, ciri fizikal, kegunaan atau kebaikan berdasarkan nota.','Minta murid mengatur lima fakta sendiri tanpa mencipta maklumat proses pembuatan.'],
        ['Menyusun isi daripada umum kepada perincian.','Menyatakan turutan ayat secara lisan.'],
        'Turutan isi menghasilkan karangan pendek yang berkaitan.'),
      ph('Tulis karangan pendek individu',
        ['Minta murid menulis karangan terkawal bertajuk Beg Mesra Alam menggunakan sekurang-kurangnya lima fakta sumber.','Ingatkan huruf besar, noktah, ayat lengkap dan kesinambungan isi.'],
        ['Menghasilkan karangan pendek sendiri.','Menyemak ejaan dan tanda baca.'],
        'Penulisan memuatkan lima fakta yang dipilih, bukan menyalin keseluruhan nota.'),
      ph('Semakan karangan dan pembetulan',
        ['Semak sama ada setiap karangan menggunakan sekurang-kurangnya lima fakta dan urutan yang dapat difahami.','Minta murid membetulkan ayat atau tanda baca serta fakta yang tersasar.'],
        ['Menunjukkan lima isi dalam hasil karangan.','Membaiki kesalahan sendiri selepas maklum balas.'],
        'PBD ialah karangan individu dengan bukti lima isi sumber.'),
      ph('Rumusan penulisan bersumber',
        ['Pilih satu ayat baik untuk dibaca dan tunjuk nota yang menyokongnya.','Rumuskan cara menukar nota kepada ayat lengkap tanpa menambah fakta.'],
        ['Membaca satu ayat sendiri.','Menyebut satu ciri beg yang terbukti pada nota.'],
        'Penutup fokus penghasilan karangan terkawal SP 3.3.1.')
    ],
    lanes:{
      support:group('Gunakan rangka ayat dan senarai fakta yang ditunjukkan satu demi satu.',
        'Menghasilkan karangan terkawal menggunakan lima fakta dengan bimbingan.',
        ['Tunjukkan dua ayat pembukaan buku sebagai rujukan.','Beri rangka ayat untuk tiga fakta tambahan tanpa melengkapkannya bagi murid.'],
        ['Pilih lima nota sebenar.','Susun isi.','Lengkapkan ayat dalam karangan sendiri.'],
        'Apakah satu ciri beg mesra alam?','Beg ini ringan dan nipis.',
        'Karangan individu dengan sekurang-kurangnya lima fakta serta bantuan dicatat.',
        'Ayat jelas, fakta disokong halaman dan isi saling berkaitan.',
        'Ulang pembinaan satu ayat menggunakan nota yang belum jelas.'),
      core:group('Pasangan menyemak pemilihan fakta; penulisan tetap individu.',
        'Tulis karangan terkawal berasaskan lima atau lebih fakta dalam urutan jelas.',
        ['Semak pemilihan lima fakta sebelum murid menulis.','Beri maklum balas pada sambungan ayat dan ketepatan bukti.'],
        ['Pilih lima fakta.','Susun fakta.','Tulis karangan sendiri.','Semak dengan halaman buku.'],
        'Apakah kebaikan beg yang dinyatakan pada halaman?','Beg boleh dikitar semula dan boleh dicuci.',
        'Karangan pendek dengan lima fakta yang tepat.',
        'Isi lengkap, urutan logik dan tanda baca asas betul.',
        'Baiki ayat yang tidak bersambung atau kurang tepat.'),
      challenge:group('Memantapkan aliran karangan tanpa menambah maklumat yang bukan sumber.',
        'Tulis karangan terkawal dengan lebih daripada lima fakta yang saling berhubung.',
        ['Minta murid menjelaskan turutan isi berdasarkan nota.','Semak penggunaan maklumat tepat dan kesimpulan yang tidak menokok tambah fakta.'],
        ['Pilih enam atau lebih fakta jika sesuai.','Tulis ayat yang saling berkaitan.','Buktikan dua fakta yang dipilih.'],
        'Mengapakah ayat tentang beg mudah dibawa sesuai selepas ayat ringan dan nipis?','Kedua-duanya menerangkan ciri beg berdasarkan nota.',
        'Karangan lebih lancar dengan sekurang-kurangnya lima fakta sumber.',
        'Semua ciri boleh dikesan pada nota dan ayat mempunyai kesinambungan.',
        'Perkemas peralihan isi tanpa menambah ciri rekaan.')
    },
    pbd:{method:'Semakan karangan terkawal individu menggunakan nota Buku Teks m/s 131.',
      evidence:'Sebuah karangan pendek dengan sekurang-kurangnya lima fakta bercetak, seperti bahan daripada tumbuhan, ringan, mudah dibawa, boleh dicuci atau dikitar semula.',
      criterion:'Sekurang-kurangnya lima fakta tepat dalam ayat lengkap yang tersusun serta mempunyai tanda baca asas.'},
    reflection:'Murid disemak: ____ / ____. Lima fakta tepat: ____. Karangan tersusun: ____. Ayat/tanda baca perlu diperbaiki: ____. Susulan: ____.'
  },
  5:{
    title:'Menaiki Komuter',page:132,sp:'5.3.1',
    anchors:['menaiki komuter','ayat perintah','sila beratur','jangan bangun lewat','tolong beli'],
    task:'Mengenal pasti empat ayat perintah dalam dialog Menaiki Komuter dan membina ayat perintah baharu menggunakan sila, jangan serta tolong mengikut konteks pada m/s 132.',
    pak:'Cari–Kategorikan–Bina: pasangan mengesan perintah dan respons pada teks; murid menghasilkan ayat baharu secara individu.',
    steps:[
      ph('Kenal dialog menaiki komuter',
        ['Buka Buku Teks m/s 132 dan baca tajuk Menaiki Komuter serta definisi ayat perintah yang dicetak.','Tanya perbezaan ayat yang meminta tindakan dengan soalan “Apakah kelebihan menaiki komuter?”.'],
        ['Menyebut tajuk serta maksud ringkas ayat perintah.','Menunjukkan satu ujaran suruhan.'],
        'Murid tidak tersalah klasifikasi ayat tanya sebagai ayat perintah.'),
      ph('Cari ayat perintah dalam dialog',
        ['Bimbing murid mencari “Jangan bangun lewat”, “Sila beratur sebelum menaiki komuter”, “Abang, tolong beli tiket di kaunter” dan “Minta ayah kamu terangkan”.','Baca bersama murid sambil membezakan kata yang menggesa atau meminta tindakan.'],
        ['Menunjukkan empat ayat perintah yang wujud dalam teks.','Membaca ayat dengan sebutan jelas.'],
        'Empat contoh benar-benar muncul dalam dialog sumber.'),
      ph('Bezakan larangan, permintaan dan suruhan',
        ['Tunjuk fungsi jangan sebagai larangan, sila sebagai suruhan sopan, serta tolong/minta sebagai permintaan.','Minta murid memadankan fungsi dengan ayat sumber tanpa mengubah maksud dialog.'],
        ['Mengelaskan contoh yang telah ditemui.','Menjelaskan tindakan yang diminta oleh setiap ayat.'],
        'Fungsi ayat dapat dijelaskan berdasarkan perkataan yang digunakan.'),
      ph('Bina ayat perintah baharu individu',
        ['Minta murid membina sekurang-kurangnya empat ayat perintah baharu yang sesuai dengan konteks menaiki pengangkutan awam.','Contoh binaan baharu perlu ditandakan sebagai ayat murid, bukan petikan literal buku; tidak meminta murid mempraktikkan arahan di landasan atau tren sebenar.'],
        ['Menulis empat ayat perintah sendiri.','Menyemak penggunaan sila, jangan atau tolong serta tanda baca.'],
        'Ayat merupakan perintah yang sesuai konteks, bukan soalan atau penyata.'),
      ph('Semakan contoh sumber dan binaan murid',
        ['Semak empat ayat yang dikenal pasti daripada dialog secara berasingan daripada ayat baharu murid.','Catat kesalahan fungsi, kata perintah atau tanda baca dan minta murid membetulkan sendiri.'],
        ['Mengenal empat ayat sumber.','Membaca ayat sendiri dan membetulkan yang tersalah jenis.'],
        'PBD membezakan pengecaman ayat bercetak dengan kebolehan membina ayat baharu.'),
      ph('Rumusan fungsi ayat perintah',
        ['Rumuskan fungsi ayat perintah untuk meminta orang melakukan atau mengelakkan tindakan.','Minta murid membaca satu ayat perintah baharu yang sesuai.'],
        ['Menyatakan satu kata perintah dan fungsinya.','Membaca satu ayat binaan sendiri.'],
        'Rumusan kekal pada jenis ayat perintah SP 5.3.1.')
    ],
    lanes:{
      support:group('Tunjuk kata perintah dahulu, kemudian bina ayat dengan rangka mudah.',
        'Kenal empat contoh sumber dan bina ayat perintah baharu dengan petunjuk.',
        ['Tunjukkan perkataan sila, jangan, tolong dalam dialog.','Beri rangka ayat pendek serta peluang mencuba sendiri.'],
        ['Tandakan contoh ayat bercetak.','Pilih kata perintah.','Lengkapkan ayat sendiri.'],
        'Apakah kata dalam ayat “Jangan bangun lewat” yang menunjukkan larangan?','Jangan.',
        'Pengecaman empat contoh dan ayat binaan dengan bantuan dicatat.',
        'Ayat benar-benar meminta tindakan atau melarang tindakan.',
        'Ulang membezakan ayat tanya dan ayat perintah dengan contoh pada buku.'),
      core:group('Kenal empat ayat bercetak dan hasilkan empat ayat baharu sendiri.',
        'Bezakan empat ayat sumber dan bina empat ayat perintah mengikut konteks.',
        ['Minta murid menunjukkan bukti dialog bagi setiap contoh.','Semak kesesuaian ayat binaan individu.'],
        ['Cari empat ayat perintah.','Tentukan fungsi setiap ayat.','Bina empat ayat sendiri.','Semak tanda baca.'],
        'Apakah maksud ayat “Sila beratur sebelum menaiki komuter”?','Ayat itu meminta penumpang beratur dengan sopan.',
        'Empat ayat baharu individu selepas mengenal empat contoh.',
        'Fungsi perintah dan pilihan kata sesuai dengan situasi.',
        'Baiki ayat yang kurang sesuai dan tunjuk kata perintahnya.'),
      challenge:group('Perincikan ketepatan fungsi dan kesantunan ayat binaan.',
        'Bina empat ayat perintah yang bervariasi dan jelaskan fungsi dua daripadanya.',
        ['Minta murid membezakan larangan dan permintaan sopan pada dua ayat pilihan.','Jangan menerima pernyataan biasa sebagai ayat perintah.'],
        ['Cari contoh sumber.','Bina empat ayat sendiri.','Jelaskan fungsi dua ayat yang ditulis.'],
        'Apakah perbezaan “Sila” dan “Jangan” dalam dialog?',
        'Sila meminta sesuatu dilakukan, manakala jangan melarang perbuatan.',
        'Empat ayat perintah serta dua penjelasan fungsi.',
        'Ayat gramatis, sesuai konteks, fungsi jelas dan tidak mengelirukan jenis ayat.',
        'Perkemas kata perintah pada satu ayat yang belum tepat.')
    },
    pbd:{method:'Semakan pengecaman empat ayat perintah daripada dialog dan ayat binaan baharu individu.',
      evidence:'Empat ayat bercetak yang dikesan serta empat ayat perintah baharu yang menggunakan kata sesuai mengikut konteks.',
      criterion:'Murid mengenal empat ayat perintah dan membina ayat baharu yang mempunyai fungsi perintah yang betul.'},
    reflection:'Murid disemak: ____ / ____. Empat ayat sumber dikenal pasti: ____. Ayat baharu tepat: ____. Keliru ayat tanya/penyata: ____. Susulan: ____.'
  }
};
function applies(map,opts={}){
  const p=plans[Number(map?.session_no)];
  if(!p)return false;
  const key=opts.subjectKey||map?.subject_key||(typeof root.rphSubjectKey==='function'?root.rphSubjectKey(map?.subject_id):'');
  const meta=map?.source_evidence?.meta||{};
  const txt=n(map?.source_evidence?.textbook?.text).toLowerCase();
  return key==='bm'&&Number(map?.year)===1&&Number(map?.academic_year)===2026
    &&Number(map?.week_no)===33&&map?.verification_status==='verified'
    &&map?.week_exact===true&&map?.sp_crosscheck===true
    &&meta.session_exact===true&&meta.page_route_verified===true
    &&n(meta.main_sp||map?.sp)===p.sp&&n(map?.sp)===p.sp
    &&Number(map?.textbook_page_start)===p.page
    &&Number(map?.textbook_page_end||p.page)===p.page
    &&n(map?.title).toLowerCase()===p.title.toLowerCase()
    &&p.anchors.every(a=>txt.includes(a));
}
function textPhase(p,page){
 return 'Tindakan guru: '+p.teacher.join('\n')+'\nTindakan murid: '+p.pupils.join('\n')
   +'\nSemakan: '+p.check+'\nBahan: Buku Teks m/s '+page;
}
function build(map,opts={}){
 if(!applies(map,opts))throw Error('BM1_WEEK33_SOURCE_PLAN_SCOPE_MISMATCH');
 const p=plans[Number(map.session_no)];
 const canonical=root.BmYear1CanonicalRph?.build(map,opts);
 if(!canonical)throw Error('BM1_CANONICAL_ENGINE_REQUIRED');
 const phases=p.steps.map(s=>({...s,resources:['Buku Teks m/s '+p.page]}));
 const sourceSteps=phases.map((s,i)=>({key:'bm1-w33-s'+map.session_no+'-step-'+(i+1),
   name:s.name,text:textPhase(s,p.page),bbm:'Buku Teks m/s '+p.page,
   pak21:p.pak,phase:'source-specific-teacher-plan'}));
 const differentiation={},librarySteps={};
 for(const key of ['support','core','challenge']){
  const a=p.lanes[key],label={support:'Peneroka',core:'Pembina',challenge:'Pencabar'}[key];
  differentiation[key]={label,support_description:a.description,task:a.task,
    materials:['Buku Teks m/s '+p.page],teacher:a.teacher,pupil_steps:a.pupils,
    example:{teacher:a.question,pupil:a.answer},product:a.product,criterion:a.criterion,next_step:a.next};
  librarySteps[key]=[{key:'bm1-w33-s'+map.session_no+'-'+key,name:label,
    text:'Tugasan sumber: '+a.task,bbm:'Buku Teks m/s '+p.page,pak21:p.pak,
    phase:'source-specific-teacher-plan'}];
 }
 const first=phases[0],last=phases[phases.length-1];
 return {...canonical,canonicalBm1:true,sourcePlanBm1:true,
   sourcePlanReviewStatus:'LESSON_MAP_EVIDENCE_NOT_WORD_APPROVED',
   sourcePlanTeacherReviewNeeded:true,
   sourcePlanSession:'BM1-2026B-W33-S'+map.session_no,
   sourcePlanVersion:VERSION,canonicalVersion:VERSION,sourceTask:p.task,anchor:p.task,
   phases,sourceSteps,classroomFlow:sourceSteps,librarySteps,differentiation,
   groupBbm:{support:'Buku Teks m/s '+p.page,core:'Buku Teks m/s '+p.page,challenge:'Buku Teks m/s '+p.page},
   bbmList:['Buku Teks m/s '+p.page],pak21:p.pak,pakDetail:p.pak,
   pbd:p.pbd,pbdEvidence:p.pbd,reflection:p.reflection,intervention:[],
   inductionData:{name:first.name,text:textPhase(first,p.page),bbm:'Buku Teks m/s '+p.page,pak21:p.pak},
   setInduksi:textPhase(first,p.page),penutup:textPhase(last,p.page),
   diffSupportAct:differentiation.support.task,diffCoreAct:differentiation.core.task,
   diffChallengeAct:differentiation.challenge.task,page:'m/s '+p.page,mainSp:p.sp,topic:p.title,
   pkjrStatus:Number(map.session_no)===3?'PKJR_TITLE_ONLY_NO_VERIFIED_PKJR_SOURCE':null
 };
}
root.BmYear1Week33SourcePlans={VERSION,availableSessions:[1,2,3,4,5],applies,build};
try{if(typeof module!=='undefined'&&module.exports)module.exports=root.BmYear1Week33SourcePlans}catch{}
})(typeof window!=='undefined'?window:globalThis);
