// BM1 Kumpulan B 2026 Minggu 27: source-grounded native A–G lesson plans.
// Six phases per session are teacher-designed, not six printed instructions.
// S4 +PKJR lacks verified PKJR materials. No Word/approved content is implied.
(function(root){
'use strict';
const VERSION='BM1-W27-SOURCE-PLANS-20261009j';
const norm=x=>String(x??'').replace(/\s+/g,' ').trim();
const P=(name,teacher,pupils,check)=>({name,teacher,pupils,check});
const G=(description,task,teacher,pupils,question,answer,product,criterion,next)=>({
 description,task,teacher,pupils,question,answer,product,criterion,next
});
const plans={
 1:{
  title:'Ingat Pesanan Cikgu',sp:'1.1.2',page:98,
  anchors:['ingat pesanan cikgu','batu kecil','gelas plastik','duit syiling'],
  task:'Mendengar pesanan Cikgu kepada Kalang dan memberi sekurang-kurangnya tiga respons lisan yang tepat berkaitan tujuan pesanan serta lima bahan yang perlu disampaikan kepada rakan.',
  pak:'Dengar–Ulang–Sampaikan: pasangan menyampaikan pesanan melalui main peranan dan setiap murid memberi respons sendiri.',
  phases:[
   P('Kenali situasi pesanan daripada guru',
    ['Buka Buku Teks m/s 98, baca tajuk serta perbualan cikgu dengan Kalang.','Tanya siapa pemberi pesanan dan siapa diminta menyampaikannya.'],
    ['Menunjukkan watak dalam dialog.','Menyebut tujuan menyampaikan pesanan kepada rakan.'],
    'Murid mengenal pemberi dan penerima pesanan mengikut teks.'),
   P('Dengar dan kenal senarai bahan',
    ['Bacakan senarai yang dicetak: batu kecil, gelas plastik, duit syiling, penyedut minuman dan tudung botol.','Minta murid mendengar dan menjejak perkataan bahan pada halaman; aktiviti BM ini tidak mensyaratkan menjalankan uji kaji.'],
    ['Menunjukkan lima nama bahan pada teks.','Menyebut semula nama bahan yang didengar.'],
    'Kelima-lima nama berpunca daripada pesanan sebenar.'),
   P('Kenali soalan Kalang dan tujuan pesanan',
    ['Baca soalan Kalang tentang apa yang perlu dibawa dan aktiviti yang akan dibuat.','Jelaskan cikgu menyatakan mereka akan membuat uji kaji sains menurut dialog.'],
    ['Mengenal dua soalan daripada dialog.','Memberi respons tentang bahan dan tujuan secara sopan.'],
    'Murid tidak menjelaskan hasil uji kaji kerana itu bukan bahan yang dipaparkan pada halaman.'),
   P('Main peranan penyampai pesanan',
    ['Agihkan peranan cikgu, Kalang dan rakan secara bergilir berdasarkan dialog.','Minta murid menyampaikan pesanan dengan jelas serta mengesahkan senarai bahan menggunakan halaman.'],
    ['Menyampaikan pesanan kepada pasangan.','Menukar peranan dan menjawab pertanyaan mudah.'],
    'Tiap murid mencuba pertuturan, bukan hanya menerima jawapan pasangan.'),
   P('Semak tiga respons lisan individu',
    ['Dengar jawapan setiap murid tentang siapa pemberi pesanan, tujuan dan tiga atau lebih bahan yang perlu dibawa.','Catat ketepatan isi, sebutan serta kesantunan; bantuan direkod secara individu.'],
    ['Memberi tiga respons sendiri.','Membetulkan satu bahan yang tersilap selepas maklum balas.'],
    'Evidens ialah respons lisan murid sendiri tentang pesanan yang benar-benar wujud.'),
   P('Rumusan menerima dan menyampaikan pesanan',
    ['Rumuskan cara memberi respons yang jelas dan menghormati arahan guru.','Minta murid menyebut satu pesanan menggunakan ayat lengkap.'],
    ['Mengulang satu pesanan yang tepat.','Menunjukkan frasa yang menyokongnya.'],
    'Penutup pada kemahiran mendengar/memberi respons, bukan menjalankan eksperimen.')
  ],
  groups:{
   support:G('Bimbing dengan petunjuk baris dan pilihan bahan sumber.',
    'Berikan tiga respons lisan tentang pesanan dengan bantuan bertahap.',
    ['Bacakan satu pesanan dahulu dan tunjuk bahagian teksnya.','Kurangkan petunjuk bagi setiap cubaan jawapan.'],
    ['Dengar ayat cikgu.','Tunjuk nama bahan.','Sebut tiga respons dalam ayat pendek.'],
    'Apakah satu bahan yang diminta guru?', 'Gelas plastik.',
    'Tiga respons lisan dan bantuan yang dicatat.',
    'Isi berdasarkan dialog serta sebutan boleh difahami.',
    'Ulang sebutan bahan yang masih tertukar.'),
   core:G('Pasangan menyemak pesanan sebelum jawapan individu.',
    'Sampaikan tujuan dan bahan melalui tiga respons sopan.',
    ['Minta pasangan bergilir menjadi guru dan murid.','Dengar jawapan sendiri pada akhir aktiviti.'],
    ['Jejak pesanan.','Latih main peranan.','Nyatakan tujuan uji kaji serta bahan kepada guru.'],
    'Mengapakah bahan itu perlu dibawa?', 'Untuk uji kaji sains yang akan dibuat oleh kelas.',
    'Tiga respons lisan individu berdasarkan dialog.',
    'Isi pesanan tidak tertinggal atau ditambah daripada luar buku.',
    'Baiki pesanan yang tidak lengkap dengan merujuk senarai sumber.'),
   challenge:G('Perincikan kandungan pesanan dalam bahasa yang sopan.',
    'Sampaikan pesanan lengkap dan jelaskan satu sebab pentingnya mengingat maklumat.',
    ['Tanya murid membezakan tujuan uji kaji dengan senarai bahan.','Pastikan jawapan tidak mendakwa keputusan eksperimen.'],
    ['Sampaikan tiga respons.','Sebut beberapa bahan dengan tepat.','Jelaskan sebab menyampaikan pesanan kepada rakan.'],
    'Siapakah yang perlu menerima pesanan daripada Kalang?', 'Kawan-kawan Kalang.',
    'Pesanan lebih lengkap serta satu penjelasan yang berasas.',
    'Maklumat penerima, tujuan dan bahan berasal daripada dialog.',
    'Perkemas penyampaian yang masih tertinggal item.')
  },
  pbd:{method:'Pemerhatian respons mendengar dan bertutur individu semasa main peranan pesanan.',
   evidence:'Tiga respons yang menjelaskan siapa menyampaikan pesanan, tujuan uji kaji dan bahan seperti gelas plastik/batu kecil/duit syiling.',
   criterion:'Sekurang-kurangnya tiga respons lisan tepat, jelas dan sopan berdasarkan pesanan pada halaman 98.'},
  reflection:'Murid disemak: ____ / ____. Tiga respons tepat: ____. Senarai bahan tidak tertukar: ____. Bantuan pertuturan: ____. Susulan: ____.'
 },
 2:{
  title:'Tenggelam dan Timbul',sp:'2.2.1',page:99,
  anchors:['tenggelam dan timbul','batu dan duit syiling','penyedut minuman'],
  task:'Membaca petikan serta grafik hasil uji kaji pada Buku Teks m/s 99, kemudian menyatakan tiga maklumat tepat dan membuat satu inferens terbimbing daripada pemerhatian.',
  pak:'Baca–Lihat Grafik–Simpul: murid merujuk ayat bukti sebelum menjelaskan inferens secara sendiri.',
  phases:[
   P('Baca tajuk dan kenal pemerhatian',
    ['Buka Buku Teks m/s 99 dan baca tajuk Tenggelam dan Timbul.','Terangkan bahawa bacaan memaparkan hasil pemerhatian uji kaji kelas Cikgu Amar, bukan arahan melakukan uji kaji BM yang baharu.'],
    ['Membaca tajuk.','Menunjukkan bahagian teks hasil uji kaji.'],
    'PBD belum diambil daripada andaian sebelum membaca.'),
   P('Jejak urutan eksperimen dalam teks',
    ['Bacakan petikan mengisi air ke dalam gelas dan memasukkan beberapa objek.','Tunjuk perkataan duit syiling, tudung botol, batu kecil dan penyedut minuman yang dipotong pendek.'],
    ['Membaca frasa peristiwa mengikut giliran.','Menyebut empat objek pada bacaan.'],
    'Murid memahami urutan petikan tanpa menjalankan eksperimen fizikal.'),
   P('Kenal objek yang tenggelam',
    ['Minta murid membaca ayat “Batu dan duit syiling tenggelam di dalam air”.','Bimbing murid menyatakan dua objek yang diperhatikan tenggelam pada contoh ini.'],
    ['Menunjuk ayat tersebut.','Menyebut batu kecil dan duit syiling.'],
    'Dua objek dinyatakan sebagaimana hasil uji kaji dalam bahan.'),
   P('Kenal objek yang timbul dan isi tersirat',
    ['Minta murid mencari ayat penyedut minuman dan tudung botol timbul di permukaan air.','Bantu murid melengkapkan pernyataan kosong daripada petikan dengan kata “timbul” sambil menerangkan bahawa hubungan berat/ringan pada contoh buku bukan hukum sejagat untuk semua bahan.'],
    ['Menunjukkan dua objek yang timbul dalam teks.','Menyatakan satu inferens yang disokong oleh grafik bacaan.'],
    'Inferens dibatasi kepada hasil yang dipaparkan; tidak membuat dakwaan semua objek berat pasti tenggelam.'),
   P('PBD bacaan dan tiga maklumat individu',
    ['Dengar murid membaca bahagian pilihan dan menyatakan tiga maklumat daripada bacaan serta grafik.','Catat ketepatan hasil tenggelam/timbul dan satu inferens yang sesuai, dengan bantuan yang diterima.'],
    ['Membaca satu bahagian sendiri.','Menyatakan tiga isi dan bukti teks.'],
    'Bukti PBD ialah pemahaman bacaan dan inferens, bukan hasil eksperimen murid.'),
   P('Rumusan inferens berdasarkan bukti',
    ['Rumuskan hasil batu/duit syiling tenggelam dan penyedut/tudung botol timbul dalam uji kaji yang diceritakan.','Minta murid menunjukkan ayat yang menyokong satu rumusan.'],
    ['Menyatakan satu hasil pemerhatian.','Menunjukkan bukti ayat bacaan.'],
    'Penutup kekal pada bacaan dan penaakulan berdasarkan grafik.')
  ],
  groups:{
   support:G('Petunjuk warna/baris untuk beza dua hasil yang tercetak.',
    'Baca frasa terpilih dan nyatakan tiga maklumat dengan bantuan.',
    ['Tunjuk satu ayat hasil pada satu masa.','Modelkan cara menunjuk bukti sebelum memberi jawapan.'],
    ['Baca ayat batu.','Cari ayat penyedut.','Sebut tiga hasil berdasarkan teks.'],
    'Apakah yang tenggelam dalam uji kaji yang diceritakan?', 'Batu dan duit syiling.',
    'Tiga maklumat bacaan individu dengan bantuan direkod.',
    'Maklumat tepat mengikut petikan dan dapat ditunjukkan bukti.',
    'Baca semula ayat yang tersalah dikelaskan.'),
   core:G('Rujuk teks/grafik berpasangan, kemudian terangkan sendiri.',
    'Nyatakan tiga maklumat dan satu inferens daripada hasil uji kaji yang dibaca.',
    ['Minta murid menunjukkan lokasi hasil yang dinyatakan.','Semak inferens masih terbatas pada contoh buku.'],
    ['Baca petikan.','Kelaskan objek tenggelam/timbul.','Sebut tiga isi sendiri.'],
    'Apakah yang timbul di permukaan air?', 'Penyedut minuman dan tudung botol.',
    'Tiga isi daripada buku serta satu inferens ringkas.',
    'Jawapan berdasarkan grafik dan tidak mengubah jenis objek.',
    'Perbetul inferens yang tidak berasaskan bukti.'),
   challenge:G('Jelaskan sebab inferens mesti berpunca daripada pemerhatian.',
    'Menyampaikan hasil empat objek dan membuat rumusan terhad kepada bukti.',
    ['Minta murid bezakan pemerhatian dengan ramalan umum.','Tanya bukti grafik yang digunakan untuk membuat kesimpulan.'],
    ['Baca dua ayat keputusan.','Nyatakan empat objek mengikut hasil.','Terangkan batas inferens contoh.'],
    'Adakah semua objek berat mesti tenggelam?', 'Teks ini hanya menunjukkan hasil objek yang diuji dalam cerita.',
    'Penjelasan hasil dengan inferens yang berpada.',
    'Tiada generalisasi sains yang tidak disokong oleh halaman.',
    'Kembalikan penjelasan kepada dua ayat keputusan dalam bacaan.')
  },
  pbd:{method:'Pemerhatian bacaan dan soal jawab tiga isi/inferens individu daripada grafik.',
   evidence:'Batu dan duit syiling tenggelam; penyedut minuman dan tudung botol timbul berdasarkan hasil uji kaji yang diceritakan.',
   criterion:'Tiga fakta atau idea tepat dan sekurang-kurangnya satu inferens dengan sokongan bacaan.'},
  reflection:'Murid disemak: ____ / ____. Tiga isi tepat: ____. Bezakan hasil tenggelam/timbul: ____. Bantuan bacaan/inferens: ____. Susulan: ____.'
 },
 3:{
  title:'Kenali Anggota Badan Kita',sp:'3.2.1',page:100,
  anchors:['kenali anggota badan kita','kepala','tangan','kaki'],
  task:'Membina dan menulis empat perkataan kepala, badan, tangan dan kaki berdasarkan gambar berlabel pada Buku Teks m/s 100.',
  pak:'Teliti–Label–Semak: murid membanding gambar asal dengan perkataan lalu menulis label sendiri.',
  phases:[
   P('Kenal empat bahagian anggota badan',
    ['Buka Buku Teks m/s 100 dan baca tajuk Kenali Anggota Badan Kita.','Tunjukkan ayat yang menyatakan empat bahagian: kepala, badan, tangan, kaki.'],
    ['Menyebut empat perkataan daripada petikan.','Menunjukkan gambar asal pada buku.'],
    'Aktiviti menumpukan penulisan label, bukan penilaian rupa atau fizikal murid.'),
   P('Baca dan jejak ejaan label',
    ['Modelkan sebutan dan ejaan kepala, badan, tangan, kaki menggunakan bahan bacaan.','Bimbing murid mengenal perkataan dan bilangan huruf tanpa menyemak fizikal seseorang.'],
    ['Membaca empat label.','Menjejak ejaan setiap perkataan pada teks.'],
    'Murid boleh membezakan ejaan empat label.'),
   P('Padankan label kepada grafik yang betul',
    ['Tunjuk nombor label 1–4 pada gambar asal dan minta murid mengaitkan kedudukan dengan empat perkataan.','Semak padanan melalui imej Buku Teks kerana OCR tidak menjamin susunan nombor 1–4 yang tepat.'],
    ['Menunjuk lokasi label pada gambar buku.','Menyebut perkataan yang sesuai bagi setiap bahagian.'],
    'Nombor tidak dipadankan berdasarkan susunan teks OCR sahaja.'),
   P('Tulis empat perkataan pada tempatnya',
    ['Minta murid menulis keempat-empat label pada bahagian gambar masing-masing.','Ingatkan ejaan yang betul dan tulisan jelas dalam ruang yang tersedia.'],
    ['Menulis empat perkataan sendiri.','Menyemak ejaan dan tempat label.'],
    'Keempat-empat label benar menurut gambar dan perkataan sumber.'),
   P('PBD padanan dan ejaan individu',
    ['Semak empat label pada hasil murid dan bezakan kesilapan padanan daripada kesilapan ejaan.','Minta murid membetulkan perkataan yang salah dengan merujuk halaman.'],
    ['Membaca satu label yang ditulis.','Membetulkan label sendiri jika perlu.'],
    'Bukti PBD ialah tulisan individu; tidak menggantikan tugas dengan cerita tentang anggota badan.'),
   P('Rumusan kosa kata anggota badan',
    ['Rumuskan ejaan empat nama bahagian yang ditulis.','Minta murid menyebut satu label yang sudah berjaya dibetulkan.'],
    ['Menyatakan satu perkataan tepat.','Menunjukkan label pada buku.'],
    'Penutup kekal pada kemahiran membina serta menulis perkataan.')
  ],
  groups:{
   support:G('Bimbing satu label/gambar pada satu masa.',
    'Menulis empat perkataan dengan petunjuk ejaan dan gambar.',
    ['Tunjuk perkataan bercetak untuk dibaca dahulu.','Kurangkan bantuan sewaktu murid menulis semula label.'],
    ['Baca perkataan.','Cari lokasi pada grafik.','Tulis empat label.'],
    'Apakah perkataan bagi bahagian atas pada gambar?', 'Kepala.',
    'Empat label individu dengan bantuan yang direkod.',
    'Perkataan dan kedudukannya tepat pada grafik.',
    'Ulang tulisan label yang ejaannya belum betul.'),
   core:G('Teliti gambar dan tulis setiap label tanpa menyalin hasil rakan.',
    'Padan serta tulis empat bahagian anggota badan dengan ejaan tepat.',
    ['Minta murid semak setiap label kepada gambar asal.','Semak hasil tulisan individu selepas perbincangan.'],
    ['Baca empat kata.','Padankan kepada imej.','Tulis sendiri.','Semak ejaan.'],
    'Nyatakan empat bahagian yang dicatat pada teks.', 'Kepala, badan, tangan dan kaki.',
    'Empat label bertulis dengan padanan tepat.',
    'Empat perkataan betul dan jelas serta sepadan dengan gambar.',
    'Betulkan satu tempat label yang tersilap.'),
   challenge:G('Terangkan bukti padanan dan semak ejaan sendiri.',
    'Tulis empat label tepat serta jelaskan satu padanan berpandukan gambar.',
    ['Minta murid merujuk kedudukan sebenar dalam buku.','Elakkan memaksa murid menyusun label menurut OCR yang rosak.'],
    ['Baca kata sumber.','Tulis empat label.','Jelaskan satu padanan kepada guru.'],
    'Bagaimanakah kamu menentukan label tangan?', 'Saya melihat bahagian pada gambar sumber.',
    'Empat label dan satu penjelasan visual.',
    'Ejaan serta padanan benar mengikut bahan cetakan.',
    'Perkemas label yang kurang jelas.')
  },
  pbd:{method:'Semakan empat label bertulis individu berdasarkan grafik Buku Teks.',
   evidence:'Empat perkataan kepala, badan, tangan, kaki ditempatkan pada bahagian gambar yang sepadan dan dieja tepat.',
   criterion:'Keempat-empat label ditulis dengan ejaan tepat pada ruang yang sesuai.'},
  reflection:'Murid disemak: ____ / ____. Empat ejaan tepat: ____. Empat padanan tepat: ____. Bantuan penulisan: ____. Susulan: ____.'
 },
 4:{
  title:'Menulis + PKJR',sp:'3.2.1',page:101,
  anchors:['membina dan menulis frasa','deria lihat','deria dengar','deria sentuh'],
  task:'Melengkapkan dan menulis empat frasa deria bagi hidung, telinga, lidah dan tangan menggunakan pilihan perkataan sumber Buku Teks m/s 101. Tajuk + PKJR belum mempunyai bukti PKJR khusus.',
  pak:'Baca–Padan–Lengkap: pasangan meneliti pasangan anggota dan deria, setiap murid melengkapkan frasa sendiri.',
  phases:[
   P('Kenal ayat deria yang bercetak',
    ['Buka Buku Teks m/s 101 dan baca contoh “Mata ialah deria lihat kita”.','Jelaskan bahawa sasaran ialah melengkapkan frasa, bukan menjalankan eksperimen atau menguji deria seseorang.'],
    ['Membaca ayat contoh.','Menunjukkan perkataan deria lihat pada halaman.'],
    'Murid faham tugasan mengisi ruang yang kosong.'),
   P('Baca pilihan frasa deria',
    ['Tunjuk empat frasa yang disediakan: deria dengar, deria sentuh, deria rasa, deria bau.','Bimbing murid membaca perkataan yang sering tertukar.'],
    ['Membaca pilihan frasa.','Membezakan kata dengar, sentuh, rasa dan bau.'],
    'Pilihan frasa diambil daripada buku, bukan tambahan istilah anatomi luar.'),
   P('Padan hidung dan telinga dengan fungsinya',
    ['Rujuk ayat sumber “Kita menghidu melaluinya” untuk hidung dan “Kita menggunakannya untuk mendengar” untuk telinga.','Bimbing murid memilih deria bau dan deria dengar berdasarkan fungsi tersebut.'],
    ['Menunjukkan dua petunjuk kata kerja.','Menyatakan dua padanan yang sepadan.'],
    'Padanan hidung–bau dan telinga–dengar tepat mengikut ayat buku.'),
   P('Padan lidah dan tangan lalu lengkapkan frasa',
    ['Rujuk ayat lidah digunakan untuk merasa dan tangan digunakan untuk menyentuh.','Minta murid menulis semua empat frasa sendiri pada tempat kosong dalam halaman/buku latihan.'],
    ['Melengkapkan empat ruang kosong.','Menyemak ejaan setiap frasa.'],
    'Padanan lidah–rasa dan tangan–sentuh tepat; tugasan berasaskan tulisan murid.'),
   P('PBD empat frasa individu',
    ['Semak keempat-empat frasa dan ejaan yang ditulis murid.','Bimbing pembetulan satu padanan yang tersalah dengan merujuk kata kerja dalam ayat sumber.'],
    ['Membaca satu ayat yang telah dilengkapkan.','Membaiki padanan atau ejaan dalam hasil tulisan sendiri.'],
    'Bukti individu ialah empat frasa tulisan; +PKJR tidak didakwa selesai tanpa sumber.'),
   P('Rumusan padanan anggota dan deria',
    ['Rumuskan lima padanan lengkap termasuk contoh mata–lihat.','Minta murid menyatakan satu contoh petunjuk kata kerja yang membantu memilih deria.'],
    ['Menyebut satu pasangan anggota–deria.','Menunjukkan ayat sokongan pada teks.'],
    'Penutup fokus membina frasa SP 3.2.1 (ii).')
  ],
  groups:{
   support:G('Pilihan frasa dikurangkan kepada dua pada satu masa.',
    'Lengkapkan empat ruang frasa dengan bantuan yang dicatat.',
    ['Bacakan ayat dan tekankan kata kerja seperti menghidu atau mendengar.','Minta murid memilih dan menulis frasa sendiri.'],
    ['Baca petunjuk.','Pilih deria sesuai.','Lengkapkan empat frasa.'],
    'Deria manakah digunakan oleh hidung?', 'Deria bau.',
    'Empat frasa tulisan individu dengan bantuan.',
    'Keempat-empat pasangan sepadan dengan ayat bercetak.',
    'Ulang padanan kata kerja dan deria yang belum jelas.'),
   core:G('Pasangan menyemak pilihan, tetapi setiap murid menulis sendiri.',
    'Lengkapkan empat frasa dengan ejaan dan padanan tepat.',
    ['Minta murid tunjuk kata kerja sokongan.','Semak semua frasa tulisan individu.'],
    ['Baca lima ayat.','Pilih frasa bagi empat ruang kosong.','Tulis dan semak sendiri.'],
    'Deria manakah untuk telinga?', 'Deria dengar.',
    'Empat frasa lengkap serta bukti kata kerja.',
    'Padanan betul dan ejaan frasa jelas.',
    'Betulkan satu ruang menggunakan petunjuk ayat.'),
   challenge:G('Jelaskan kaitan kata kerja dengan padanan frasa.',
    'Lengkapkan empat frasa dan terangkan dua sebab pilihan.',
    ['Tanya kata kerja yang menyokong setiap deria.','Kekalkan penjelasan pada pilihan frasa asal.'],
    ['Lengkapkan empat ruang.','Jejak kata kerja sokongan.','Terangkan dua padanan.'],
    'Mengapa lidah dipadankan dengan deria rasa?', 'Ayat menyatakan lidah digunakan untuk merasa.',
    'Empat frasa tepat dan dua alasan sumber.',
    'Alasan benar daripada ayat dan ejaan tepat.',
    'Perkemas penjelasan yang tidak disokong kata kerja.')
  },
  pbd:{method:'Semakan empat frasa deria bertulis individu pada halaman 101.',
   evidence:'Hidung–deria bau, telinga–deria dengar, lidah–deria rasa, tangan–deria sentuh; contoh mata–deria lihat tersedia.',
   criterion:'Empat ruang dilengkapkan dengan pilihan frasa tepat serta ejaan yang betul.'},
  reflection:'Murid disemak: ____ / ____. Empat frasa tepat: ____. Ejaan tepat: ____. Bantuan kosa kata: ____. Susulan: ____.',
  pkjr:true
 },
 5:{
  title:'Sains Perubatan',sp:'5.3.1',page:102,
  anchors:['sains perubatan','ayat perintah','sila makan ubat','jangan minum'],
  task:'Mengenal ayat perintah dalam dialog Sains Perubatan dan membina tiga ayat perintah yang sesuai berdasarkan kata sila, tolong dan jangan sebagai latihan bahasa, bukan arahan rawatan.',
  pak:'Baca–Kelaskan–Bina: pasangan mencari fungsi ayat perintah dan setiap murid menulis ayat contoh sendiri.',
  phases:[
   P('Kenal dialog lawatan Kalang ke klinik',
    ['Buka Buku Teks m/s 102 dan baca tajuk Sains Perubatan serta penerangan jenis ayat perintah.','Tunjukkan dialog Kalang dan Doktor Mira sebagai konteks pembelajaran bahasa, bukan nasihat perubatan untuk murid.'],
    ['Menunjuk tajuk dan contoh kata perintah.','Menyatakan bahawa ayat perintah meminta tindakan.'],
    'Pelajaran fokus tatabahasa, tidak mengajar murid mengambil ubat secara sendiri.'),
   P('Baca tiga pola ayat perintah',
    ['Baca contoh “Tolong simpan ubat ...”, “Sila ambil ubat ...” dan “Jangan minum ...” sebagai petikan dialog.','Minta murid mengenal perkataan tolong, sila dan jangan serta tanda baca.'],
    ['Membaca tiga contoh bercetak.','Menandakan kata perintah pada dialog.'],
    'Ayat petikan dikenali sebagai bahan bahasa, bukan arahan rawatan peribadi.'),
   P('Bezakan fungsi suruhan, permintaan dan larangan',
    ['Bincang fungsi sila untuk suruhan sopan, tolong untuk permintaan dan jangan untuk larangan.','Banding ayat penyata “Kamu demam” dengan ayat perintah “Tolong buka mulut kamu” dalam konteks buku.'],
    ['Mengenal tiga fungsi kata perintah.','Membezakan ayat penyata dan ayat perintah.'],
    'Ayat penyata tentang keadaan watak tidak dikelaskan sebagai perintah.'),
   P('Bina tiga ayat perintah baharu dalam konteks bacaan',
    ['Minta murid mencipta tiga ayat bahasa berdasarkan situasi komunikasi sopan dan selamat pada gambar; jangan mereka-reka dos ubat atau amalan rawatan.','Bimbing penggunaan kata sila, tolong dan jangan dengan tanda baca tepat.'],
    ['Menulis tiga ayat perintah sendiri.','Menyemak fungsi dan tanda baca.'],
    'Ayat baharu dibezakan daripada petikan sumber dan tidak memberi petua perubatan.'),
   P('PBD ayat perintah individu',
    ['Semak tiga ayat murid dari segi fungsi, kesantunan dan kejelasan.','Minta murid membaiki ayat yang hanya menyatakan maklumat tanpa meminta tindakan.'],
    ['Membaca satu ayat baharu sendiri.','Membetulkan penggunaan kata perintah yang kurang tepat.'],
    'Bukti ialah tiga ayat perintah individu, bukan hafalan dialog doktor semata-mata.'),
   P('Rumusan ayat perintah',
    ['Rumuskan fungsi kata sila, tolong dan jangan dalam komunikasi.','Minta murid menunjukkan satu ayat yang tepat daripada hasil sendiri.'],
    ['Menyatakan satu fungsi kata perintah.','Membaca satu ayat yang telah disemak.'],
    'Penutup tatabahasa tidak memberi nasihat penggunaan ubat.')
  ],
  groups:{
   support:G('Baca frasa sumber dan gunakan rangka ayat tanpa arahan perubatan baharu.',
    'Tulis tiga ayat perintah mudah dengan bantuan.',
    ['Tunjukkan pola sila/tolong/jangan satu demi satu.','Gunakan contoh komunikasi harian yang selamat untuk latihan ayat.'],
    ['Pilih kata perintah.','Lengkapkan ayat mudah.','Tulis tiga ayat sendiri.'],
    'Apakah kata perintah yang menunjukkan larangan?', 'Jangan.',
    'Tiga ayat perintah individu dengan bantuan direkod.',
    'Setiap ayat meminta atau melarang tindakan secara jelas.',
    'Ulang satu ayat yang masih berbentuk penyata.'),
   core:G('Kenal fungsi daripada dialog dan bina ayat tersendiri.',
    'Tulis tiga ayat menggunakan sila, tolong dan jangan dengan fungsi sesuai.',
    ['Minta murid menunjukkan kata perintah asal.','Semak ayat sendiri yang dibina tanpa menambah fakta perubatan.'],
    ['Baca dialog.','Kelaskan kata perintah.','Tulis tiga ayat baharu.','Semak maknanya.'],
    'Apakah fungsi kata tolong?', 'Untuk membuat permintaan dengan sopan.',
    'Tiga ayat baharu yang tepat.',
    'Fungsi dan kesantunan sesuai, tanda baca betul.',
    'Perkemas kata perintah yang tidak sepadan dengan maksud.'),
   challenge:G('Jelaskan perbezaan fungsi tiga kata perintah.',
    'Bina tiga ayat perintah dan jelaskan dua fungsi berbeza.',
    ['Banding kata sila dan jangan pada dialog.','Bezakan contoh sumber daripada ayat binaan murid.'],
    ['Kenal fungsi.','Bina tiga ayat.','Jelaskan dua pilihan kata.'],
    'Bagaimanakah sila berbeza daripada jangan?', 'Sila meminta dilakukan, jangan melarang tindakan.',
    'Tiga ayat perintah dengan dua penjelasan fungsi.',
    'Semua ayat mempunyai fungsi perintah jelas dan selamat sebagai latihan bahasa.',
    'Ulang ayat yang keliru antara penyata dan perintah.')
  },
  pbd:{method:'Semakan tiga ayat perintah bertulis individu berdasarkan konteks dialog.',
   evidence:'Tiga ayat baharu yang menggunakan kata sila, tolong, jangan mengikut fungsi dan kesantunan yang betul.',
   criterion:'Tiga ayat perintah yang gramatis dan menunjukkan fungsi suruhan/permintaan/larangan dengan jelas.'},
  reflection:'Murid disemak: ____ / ____. Tiga ayat perintah tepat: ____. Membezakan fungsi kata: ____. Bantuan ejaan/tanda baca: ____. Susulan: ____.'
 }
};
function applies(map,opts={}){
 const p=plans[Number(map?.session_no)];if(!p)return false;
 const meta=map?.source_evidence?.meta||{};
 const subject=opts.subjectKey||map?.subject_key||(typeof root.rphSubjectKey==='function'?root.rphSubjectKey(map?.subject_id):'');
 const text=norm(map?.source_evidence?.textbook?.text).toLowerCase();
 return subject==='bm'&&Number(map?.year)===1&&Number(map?.academic_year)===2026
  &&Number(map?.week_no)===27&&map?.verification_status==='verified'
  &&map?.week_exact===true&&map?.sp_crosscheck===true
  &&meta.session_exact===true&&meta.page_route_verified===true
  &&norm(meta.main_sp||map?.sp)===p.sp&&norm(map?.sp)===p.sp
  &&Number(map?.textbook_page_start)===p.page
  &&Number(map?.textbook_page_end||p.page)===p.page
  &&norm(map?.title).toLowerCase()===p.title.toLowerCase()
  &&p.anchors.every(a=>text.includes(a));
}
const detail=(p,page)=>'Tindakan guru: '+p.teacher.join('\n')
 +'\nTindakan murid: '+p.pupils.join('\n')+'\nSemakan: '+p.check+'\nBahan: Buku Teks m/s '+page;
function build(map,opts={}){
 if(!applies(map,opts))throw Error('BM1_WEEK27_SOURCE_PLAN_SCOPE_MISMATCH');
 const p=plans[Number(map.session_no)],canonical=root.BmYear1CanonicalRph?.build(map,opts);
 if(!canonical)throw Error('BM1_CANONICAL_ENGINE_REQUIRED');
 const phases=p.phases.map(x=>({...x,resources:['Buku Teks m/s '+p.page]}));
 const sourceSteps=phases.map((x,i)=>({key:'bm1-w27-s'+map.session_no+'-step-'+(i+1),name:x.name,
  text:detail(x,p.page),bbm:'Buku Teks m/s '+p.page,pak21:p.pak,phase:'source-specific-teacher-design'}));
 const differentiation={},librarySteps={};
 for(const k of ['support','core','challenge']){
  const g=p.groups[k],label={support:'Peneroka',core:'Pembina',challenge:'Pencabar'}[k];
  differentiation[k]={label,support_description:g.description,task:g.task,
    materials:['Buku Teks m/s '+p.page],teacher:g.teacher,pupil_steps:g.pupils,
    example:{teacher:g.question,pupil:g.answer},product:g.product,criterion:g.criterion,next_step:g.next};
  librarySteps[k]=[{key:'bm1-w27-s'+map.session_no+'-'+k,name:label,
    text:'Tugasan sumber: '+g.task,bbm:'Buku Teks m/s '+p.page,pak21:p.pak,phase:'source-specific-teacher-design'}];
 }
 const first=phases[0],last=phases[phases.length-1];
 return {...canonical,canonicalBm1:true,sourcePlanBm1:true,
  sourcePlanReviewStatus:'LESSON_MAP_EVIDENCE_NOT_WORD_APPROVED',
  sourcePlanTeacherReviewNeeded:true,sourcePlanSession:'BM1-2026B-W27-S'+map.session_no,
  sourcePlanVersion:VERSION,canonicalVersion:VERSION,sourceTask:p.task,anchor:p.task,
  phases,sourceSteps,classroomFlow:sourceSteps,differentiation,librarySteps,
  groupBbm:{support:'Buku Teks m/s '+p.page,core:'Buku Teks m/s '+p.page,challenge:'Buku Teks m/s '+p.page},
  bbmList:['Buku Teks m/s '+p.page],pak21:p.pak,pakDetail:p.pak,
  pbd:p.pbd,pbdEvidence:p.pbd,reflection:p.reflection,intervention:[],
  inductionData:{name:first.name,text:detail(first,p.page),bbm:'Buku Teks m/s '+p.page,pak21:p.pak},
  setInduksi:detail(first,p.page),penutup:detail(last,p.page),
  diffSupportAct:differentiation.support.task,diffCoreAct:differentiation.core.task,
  diffChallengeAct:differentiation.challenge.task,page:'m/s '+p.page,mainSp:p.sp,topic:p.title,
  pkjrStatus:p.pkjr?'PKJR_TITLE_ONLY_NO_VERIFIED_PKJR_SOURCE':null
 };
}
root.BmYear1Week27SourcePlans={VERSION,availableSessions:[1,2,3,4,5],applies,build};
try{if(typeof module!=='undefined'&&module.exports)module.exports=root.BmYear1Week27SourcePlans}catch{}
})(typeof window!=='undefined'?window:globalThis);
