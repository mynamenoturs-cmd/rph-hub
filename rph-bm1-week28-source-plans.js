// BM1 2026 Kumpulan B Minggu 28: exact textbook task, teacher-designed phases.
// Not a copy of teacher-reviewed Word and not a modification of Lesson Maps.
(function(root){
'use strict';
const VERSION='BM1-W28-SOURCE-PLANS-20261009i';
const norm=x=>String(x??'').replace(/\s+/g,' ').trim();
const P=(name,teacher,pupils,check)=>({name,teacher,pupils,check});
const G=(description,task,teacher,pupils,question,answer,product,criterion,next)=>({
 description,task,teacher,pupils,question,answer,product,criterion,next
});
const plans={
 1:{
  title:'Kamus Elektronik',sp:'1.2.1',page:103,
  anchors:['kamus elektronik','sebutan perkataan tepat','pantas mencari makna'],
  task:'Bertutur berdasarkan iklan kamus elektronik dengan tiga isi sah tentang fungsi/keistimewaannya; sebutan, intonasi dan bahasa santun dinilai secara individu.',
  pak:'Cari–Pilih–Terang: pasangan membanding bukti brosur, kemudian murid menerangkan tiga isi sendiri.',
  phases:[
   P('Kenal fungsi kamus elektronik',
    ['Buka Buku Teks m/s 103 dan bacakan dialog tentang kamus elektronik.','Tanya maksud soalan “Boleh ceritakan kelebihan kamus ini?” dengan merujuk gambar.'],
    ['Menamakan alat yang dilihat.','Menyebut tujuan kamus untuk mencari makna perkataan.'],
    'Tujuan alat dapat disokong maklumat pada halaman.'),
   P('Jejak fungsi kamus dalam iklan',
    ['Tunjukkan empat fungsi yang bercetak: sebutan tepat, pantas mencari makna, makna dalam pelbagai bahasa dan ayat contoh.','Minta murid menyebut fungsi menggunakan ayat pendek dengan sebutan yang jelas.'],
    ['Menunjuk tiga fungsi pada teks.','Membaca frasa fungsi dengan bimbingan.'],
    'Isi dipilih daripada fungsi yang benar-benar tercetak.'),
   P('Bezakan ciri dengan fungsi',
    ['Bincang senarai ciri: kuasa bateri, tahan lasak, ringan, mesra pengguna dan capaian pantas.','Bimbing murid membezakan ciri alat daripada fungsi mencari makna dan sebutan.'],
    ['Mengenal satu ciri serta satu fungsi.','Menunjukkan ayat sumber untuk kedua-duanya.'],
    'Murid tidak mereka-reka fungsi AI, internet atau terjemahan suara yang tidak dinyatakan.'),
   P('Rancang tiga respons bertutur',
    ['Minta setiap murid memilih tiga fungsi atau keistimewaan berlainan yang boleh ditunjuk pada halaman.','Modelkan bingkai tutur “Kamus ini ...” dan ingatkan penggunaan bahasa santun sewaktu menjawab soalan.'],
    ['Membina tiga respons secara lisan.','Mencuba menerangkan kepada pasangan dan menyemak fakta.'],
    'Tiga isi lisan berbeza dan mempunyai bukti dalam brosur.'),
   P('PBD pertuturan individu',
    ['Tanya “Apakah tiga kelebihan kamus elektronik?” dan dengar jawapan setiap murid.','Catat fakta, sebutan, intonasi dan tahap bantuan secara individu, bukan rekod kumpulan.'],
    ['Menyebut tiga maklumat sendiri.','Memperbaik satu ayat selepas maklum balas guru.'],
    'Bukti PBD respons sebenar murid mengikut SP bertutur.'),
   P('Rumusan kelebihan teknologi',
    ['Rumuskan tiga fungsi yang telah disebut daripada halaman 103.','Minta murid memberi satu contoh kegunaan kamus elektronik tanpa mendakwa mereka telah menguji peralatan.'],
    ['Menyatakan satu kelebihan berdasarkan sumber.','Menyebutnya semula dengan sebutan jelas.'],
    'Penutup fokus komunikasi berdasarkan brosur, bukan demonstrasi alat.')
  ],
  groups:{
   support:G('Bimbingan satu frasa iklan pada satu masa.',
    'Berikan tiga respons pendek tentang fungsi kamus dengan petunjuk.',
    ['Tunjukkan tiga poin pada halaman.','Berikan rangka ayat yang tidak mengisi jawapan murid.'],
    ['Tunjuk poin fungsi.','Sebut satu fungsi setiap giliran.','Cuba respons semula selepas bantuan dikurangkan.'],
    'Apakah yang dibantu oleh kamus elektronik?', 'Mencari makna perkataan dengan pantas.',
    'Tiga respons lisan individu; bantuan dicatat.',
    'Isi tepat dan disebut dengan jelas berdasarkan iklan.',
    'Ulang isi yang kurang tepat menggunakan petunjuk teks.'),
   core:G('Latih bergilir dan semak fungsi sebenar daripada brosur.',
    'Sampaikan tiga fungsi atau ciri dengan bahasa santun dan jelas.',
    ['Minta murid tunjuk bukti setiap maklumat.','Dengar penyampaian sendiri selepas latihan berpasangan.'],
    ['Baca brosur.','Pilih tiga isi.','Terangkan kepada pasangan.','Ulang kepada guru secara sendiri.'],
    'Nyatakan dua ciri lain kamus elektronik.', 'Ringan dan mesra pengguna.',
    'Penyampaian tiga isi bersumberkan buku.',
    'Sebutan, intonasi dan kesantunan sesuai serta fakta benar.',
    'Perkemas ayat yang kurang jelas.'),
   challenge:G('Jelaskan kaitan ciri dengan faedah tanpa menambah keupayaan rekaan.',
    'Sampaikan tiga isi dan terangkan satu manfaat berdasarkan sumber.',
    ['Tanya mengapa fungsi ayat contoh membantu pengguna memahami perkataan.','Minta murid menyebut fungsi asal sebagai bukti.'],
    ['Pilih tiga maklumat.','Sampaikan dengan jelas.','Berikan satu penjelasan ringkas daripada teks.'],
    'Bagaimanakah ayat contoh membantu pengguna?', 'Kamus mempunyai ayat-ayat contoh untuk perkataan.',
    'Tiga respons dan satu penerangan bermakna.',
    'Maklumat berasal daripada buku, bukan keupayaan yang diandaikan.',
    'Baiki satu penjelasan supaya tepat dengan frasa sumber.')
  },
  pbd:{method:'Pemerhatian dan soal jawab bertutur individu daripada iklan kamus elektronik.',
   evidence:'Tiga respons tentang fungsi/ciri sumber seperti mencari makna dengan pantas, sebutan tepat, pelbagai bahasa atau ayat contoh.',
   criterion:'Tiga respons yang tepat dengan sebutan, intonasi dan kesantunan sesuai.'},
  reflection:'Murid disemak: ____ / ____. Tiga isi tepat: ____. Sebutan/intonasi baik: ____. Bantuan diperlukan: ____. Susulan: ____.'
 },
 2:{
  title:'Kami Memudahkan Kerja',sp:'2.3.1',page:104,
  anchors:['kami memudahkan kerja','mesin basuh','pembersih','vakum'],
  task:'Membaca teks mesin basuh dan pembersih vakum serta mengenal pasti tiga atau lebih isi berkenaan kegunaan, tenaga dan keistimewaan peralatan.',
  pak:'Baca–Cari–Padan: pasangan membezakan isi dua peralatan, kemudian guru menyemak bacaan dan isi individu.',
  phases:[
   P('Kenal dua peralatan rumah',
    ['Buka Buku Teks m/s 104 dan baca tajuk Kami Memudahkan Kerja.','Tunjukkan mesin basuh dan pembersih vakum pada bahan.'],
    ['Menamakan kedua-dua peralatan.','Menyebut satu kegunaan yang diketahui berdasarkan teks.'],
    'Pengenalan tidak dianggap bukti kefahaman sebelum membaca.'),
   P('Baca cerita mesin basuh',
    ['Modelkan bacaan perenggan “Aku pula mesin basuh” dan minta murid mengulang frasa.','Tunjukkan maklumat menggunakan elektrik, membasuh dengan cepat dan dapat mengeringkan pakaian.'],
    ['Membaca bahagian mesin basuh.','Menandakan dua kegunaan atau ciri.'],
    'Bacaan disemak pada teks m/s 104, bukan demonstrasi mesin.'),
   P('Baca cerita pembersih vakum',
    ['Modelkan bacaan ujaran “Hai, aku pembersih vakum!” dengan intonasi sesuai.','Minta murid cari aktiviti menyedut habuk/sampah, membersihkan lantai dan siling serta tenaga elektrik.'],
    ['Membaca petikan vakum.','Menyatakan dua fungsi daripada teks.'],
    'Tidak mencampurkan fungsi mengeringkan pakaian dengan pembersih vakum.'),
   P('Banding kegunaan dan keistimewaan',
    ['Tunjukkan ruang Peralatan/Kegunaan/Keistimewaan pada halaman asal dan bezakan tiga kategori itu.','Bimbing murid menyebut persamaan kedua-duanya menggunakan elektrik dan perbezaan tugas mencuci dengan menyedut habuk.'],
    ['Memadankan peralatan dengan fungsinya.','Menyebut sekurang-kurangnya tiga fakta berbeza.'],
    'Isi boleh disemak pada teks; kedudukan jadual disahkan daripada buku bercetak.'),
   P('Semak bacaan dan tiga isi individu',
    ['Dengar setiap murid membaca bahagian pilihan dan menjawab soalan peralatan, kegunaan dan keistimewaan.','Catat tiga isi yang tepat serta bantuan membaca yang diperlukan.'],
    ['Membaca dan menyatakan tiga isi secara sendiri.','Membetulkan satu fakta yang tersalah padan.'],
    'PBD bukan jawapan yang disampaikan pasangan sahaja.'),
   P('Rumusan memudahkan kerja rumah',
    ['Rumuskan bahawa kedua-dua alat membantu tugasan rumah dengan fungsi berlainan.','Minta murid menyebut satu beza yang dinyatakan sumber.'],
    ['Menyatakan perbezaan kegunaan kedua-dua alat.','Menunjukkan ayat teks yang menyokongnya.'],
    'Penutup mengekalkan kemahiran membaca dan mengenal pasti maklumat.')
  ],
  groups:{
   support:G('Gunakan petunjuk perenggan alat satu demi satu.',
    'Baca bahagian pendek dan nyatakan tiga maklumat dengan bantuan.',
    ['Tunjukkan nama peralatan sebelum membaca.','Bimbing murid mencari frasa fungsi dalam ayat masing-masing.'],
    ['Baca tajuk.','Cari kegunaan mesin basuh.','Cari kegunaan vakum.','Sebut satu persamaan.'],
    'Alat mana membasuh pakaian?', 'Mesin basuh.',
    'Bacaan terbimbing dan tiga isi individu.',
    'Fakta boleh ditunjuk dalam petikan dan bantuan direkod.',
    'Ulang bacaan frasa yang kurang jelas.'),
   core:G('Bezakan tugas kedua-dua alat secara berpasangan dahulu.',
    'Baca petikan dan sampaikan tiga isi tentang kedua-dua peralatan.',
    ['Minta murid menunjukkan bukti tentang tenaga elektrik.','Semak padanan alat–fungsi setiap murid.'],
    ['Baca dua perenggan.','Pilih tiga isi.','Banding kegunaan.','Jawab guru sendiri.'],
    'Apakah fungsi pembersih vakum?', 'Menyedut habuk dan sampah.',
    'Tiga isi tepat berserta bacaan individu.',
    'Isi tepat, termasuk beza alat mencuci dengan alat menyedut habuk.',
    'Baiki satu pertukaran fungsi yang tersalah.'),
   challenge:G('Jelaskan hubungan fungsi alat dengan kerja manusia menggunakan petikan.',
    'Sebut tiga atau lebih isi serta huraikan satu perbezaan kegunaan.',
    ['Minta murid menyokong perbezaan dengan ayat dari kedua-dua perenggan.','Elakkan menambah fungsi atau spesifikasi di luar sumber.'],
    ['Baca dua petikan.','Banding fungsi.','Jelaskan satu perbezaan dengan bukti.'],
    'Apakah persamaan tenaga kedua-dua alat?', 'Kedua-duanya menggunakan tenaga elektrik.',
    'Tiga isi dengan satu penjelasan berasaskan bacaan.',
    'Huraian merujuk ayat sumber dan tidak mereka-reka ciri peralatan.',
    'Perkemas satu jawapan yang kabur.')
  },
  pbd:{method:'Pemerhatian bacaan dan soal jawab fakta individu tentang dua peralatan.',
   evidence:'Tiga maklumat sah tentang kegunaan/tenaga/keistimewaan mesin basuh serta pembersih vakum pada halaman 104.',
   criterion:'Murid membaca petikan dan menyebut sekurang-kurangnya tiga fakta tepat tanpa menukar fungsi peralatan.'},
  reflection:'Murid disemak: ____ / ____. Tiga isi tepat: ____. Fungsi alat tidak bercampur: ____. Bantuan bacaan: ____. Susulan: ____.'
 },
 3:{
  title:'Pintu Pagar Automatik + PKJR',sp:'3.2.1',page:106,
  anchors:['pintu pagar automatik','alat kawalan jauh','buka secara automatik'],
  task:'Membina dan menulis sekurang-kurangnya tiga ayat berdasarkan cerita ibu dalam hujan dan frasa memasang serta menggunakan pintu pagar automatik pada Buku Teks m/s 106. PKJR berasingan belum disahkan.',
  pak:'Baca–Susun–Tulis: murid merujuk cerita dan frasa sebelum menghasilkan ayat secara individu.',
  phases:[
   P('Baca masalah pintu pagar ketika hujan',
    ['Buka Buku Teks m/s 106 dan baca cerita keluarga pulang ketika hujan lebat.','Tanya apa yang berlaku kepada ibu ketika membuka pintu pagar.'],
    ['Menunjukkan ayat ibu basah kuyup.','Menyatakan masalah yang dihadapi ibu.'],
    'Masalah berdasarkan petikan dan bukan ramalan fungsi alat moden.'),
   P('Kenal cadangan ayah dan frasa bercetak',
    ['Tunjukkan ayat Ayah mendapat suatu idea.','Baca frasa pasang pintu pagar automatik, guna alat kawalan jauh, buka dan tutup secara automatik.'],
    ['Menjejak empat frasa sumber.','Menyebut satu faedah cadangan berdasarkan cerita.'],
    'Frasa diambil daripada halaman 106.'),
   P('Bina ayat lisan mengikut maklumat',
    ['Tunjuk satu frasa pada satu masa dan modelkan perbezaan frasa dengan ayat lengkap.','Minta murid membina ayat lisan tentang memasang pagar atau menggunakan alat kawalan jauh.'],
    ['Melengkapkan subjek serta predikat secara lisan.','Menyemak kesesuaian ayat dengan petikan.'],
    'Ayat tidak mendakwa terdapat jenama, sensor atau sambungan telefon yang tidak disebut.'),
   P('Tulis tiga ayat berdasarkan gambar/frasa',
    ['Minta murid menghasilkan tiga ayat bertulis dengan sekurang-kurangnya tiga frasa daripada sumber.','Ingatkan huruf besar, noktah dan hubungan ayat dengan situasi keluarga dalam cerita.'],
    ['Menulis tiga ayat sendiri.','Membetulkan tanda baca selepas menyemak.'],
    'Tiga ayat yang lengkap dan tidak semata-mata menyalin frasa.'),
   P('PBD tulisan individu',
    ['Semak setiap ayat untuk isi sumber, kelengkapan ayat dan tanda baca.','Minta murid menunjukkan frasa atau gambar yang menyokong satu ayat.'],
    ['Membaca ayat sendiri.','Membetulkan ayat kurang lengkap.'],
    'PBD ialah tiga ayat bertulis individu dan tahap bantuan, bukan tugasan memasang alat.'),
   P('Rumusan teknologi membantu kerja',
    ['Rumuskan bagaimana penggunaan pintu pagar automatik dalam cerita mengurangkan kesusahan ketika hujan.','Minta murid menyebut satu ayat sumber yang digunakan dalam penulisan.'],
    ['Membaca satu ayat lengkap.','Menunjukkan frasa yang disokong buku.'],
    'Penutup tidak mendakwa pengajaran PKJR lain telah dipenuhi.')
  ],
  groups:{
   support:G('Beri rangka ayat dengan satu frasa setiap kali.',
    'Tulis tiga ayat berdasarkan frasa dengan sokongan.',
    ['Modelkan perbezaan frasa daripada ayat lengkap.','Bimbing tanda baca dan kurangkan petunjuk secara bertahap.'],
    ['Pilih satu frasa.','Bina ayat lisan.','Tulis ayat.','Ulang sehingga tiga ayat.'],
    'Apakah alat yang boleh digunakan untuk membuka pagar?', 'Alat kawalan jauh.',
    'Tiga ayat individu dan bantuan dicatat.',
    'Ayat lengkap dan maklumat bersumber daripada halaman.',
    'Baiki satu ayat yang masih berupa frasa.'),
   core:G('Semak frasa secara berpasangan, tulis ayat secara sendiri.',
    'Tulis tiga ayat lengkap berdasarkan cerita dan frasa.',
    ['Minta murid menunjukkan frasa yang digunakan.','Semak ayat serta tanda baca.'],
    ['Baca sumber.','Pilih tiga frasa.','Tulis tiga ayat sendiri.','Semak dan baiki.'],
    'Mengapa keluarga mahu memasang pintu pagar automatik?', 'Supaya pintu pagar mudah dibuka tanpa ibu perlu turun ketika hujan.',
    'Tiga ayat lengkap individu.',
    'Ayat berhubung dengan situasi dan frasa Buku Teks.',
    'Baiki fakta atau tanda baca yang tersasar.'),
   challenge:G('Jelaskan kesinambungan masalah dan cadangan sumber dalam penulisan.',
    'Tulis tiga atau lebih ayat yang menyambungkan masalah, penyelesaian dan faedah.',
    ['Minta murid membuktikan setiap isi daripada petikan atau frasa.','Elakkan menambah spesifikasi alat yang tidak tercatat.'],
    ['Nyatakan masalah.','Bina ayat berdasarkan tiga frasa.','Semak kaitan dan tanda baca.'],
    'Apakah kelebihan pagar yang boleh dibuka automatik?', 'Dapat memudahkan keluarga membuka pintu pagar.',
    'Ayat yang lebih tersusun dengan fakta bersumber.',
    'Urutan bermakna, ayat lengkap dan tiada ciri alat rekaan.',
    'Perkemas hubungan sebab-akibat dalam ayat.')
  },
  pbd:{method:'Semakan penulisan tiga ayat individu daripada cerita dan frasa Buku Teks.',
   evidence:'Ayat tentang pemasangan pintu pagar automatik, alat kawalan jauh serta buka/tutup automatik yang benar-benar tercatat.',
   criterion:'Sekurang-kurangnya tiga ayat lengkap, tepat dan bertanda baca sesuai.'},
  reflection:'Murid disemak: ____ / ____. Tiga ayat lengkap: ____. Frasa sumber tepat: ____. Tanda baca perlu dibaiki: ____. Susulan: ____.',
  pkjr:true
 },
 4:{
  title:'Hebat Teknologi',sp:'4.2.1',page:107,
  anchors:['hebat teknologi','pantun empat kerat','melafazkan pantun'],
  task:'Membina dan melengkapkan pantun empat kerat secara terkawal daripada rangkap separa pada Buku Teks m/s 107 serta melafazkannya dengan sebutan dan intonasi sesuai.',
  pak:'Baca–Lengkap–Lafaz: murid meneliti rangkap, melengkapkan bahagian yang disahkan guru dan melafazkan sendiri.',
  phases:[
   P('Kenali bentuk pantun dan tema teknologi',
    ['Buka Buku Teks m/s 107 dan baca tajuk Hebat Teknologi.','Tunjukkan bentuk rangkap empat kerat serta tema kegunaan teknologi.'],
    ['Mengira empat baris pada satu rangkap bercetak.','Menyatakan satu manfaat teknologi daripada teks.'],
    'Contoh rangkap penuh disemak pada imej halaman, bukan disusun semula daripada OCR.'),
   P('Dengar dan jejak lafaz pantun contoh',
    ['Pilih satu rangkap yang lengkap pada halaman dan modelkan lafaz dengan jeda serta intonasi.','Tanya isi seperti teknologi membantu kerja berat menjadi ringan atau menjimatkan masa.'],
    ['Menjejak empat baris sewaktu guru melafaz.','Meniru sebutan satu baris dengan bantuan.'],
    'Lafaz bersumberkan baris tepat dalam Buku Teks, bukan rangkap rekaan.'),
   P('Kenal ruang pantun yang perlu dilengkapkan',
    ['Tunjukkan ruang kosong pada rangkap dalam buku cetakan asal; OCR tidak mengekalkan kedudukan baris.','Minta murid mengenal isi/pembayang yang diperlukan melalui konteks dan bimbingan guru.'],
    ['Menunjukkan ruang kosong pada buku.','Menyebut cadangan perkataan atau baris yang sesuai dalam tema.'],
    'Baris cadangan murid ditandakan sebagai ciptaan murid, bukan petikan buku.'),
   P('Lengkapkan pantun empat kerat secara terkawal',
    ['Beri bimbingan kosa kata dan rima berpandukan rangkap/gambar yang sebenar; jangan mendakwa teks lengkap tertentu dicetak dalam sumber.','Minta murid menyiapkan sekurang-kurangnya satu rangkap yang dipilih.'],
    ['Menulis bahagian kosong secara sendiri.','Menyemak empat kerat dan rima secara terbimbing.'],
    'Pantun murid lengkap empat baris dan berkaitan manfaat teknologi.'),
   P('PBD bina dan lafaz individu',
    ['Dengar murid melafaz satu rangkap lengkap hasil bimbingan serta semak perkataan yang dilengkapkan.','Catat sebutan, intonasi dan keperluan bantuan; tidak menganggap lafaz berkumpulan sebagai bukti individu.'],
    ['Melafazkan satu rangkap sendiri.','Membetulkan sebutan atau satu bahagian pantun dengan maklum balas.'],
    'Bukti PBD ialah pantun lengkap dan lafaz individu yang didengar.'),
   P('Rumusan isi pantun teknologi',
    ['Rumuskan manfaat teknologi yang dinyatakan oleh rangkap seperti memudahkan kerja atau menjimatkan masa.','Minta murid menyebut satu isi dan satu ciri pantun empat kerat.'],
    ['Menyebut isi rangkap.','Menunjuk rangkap yang dipilih pada buku.'],
    'Penutup tidak menggunakan rangkap lengkap yang tidak disahkan oleh sumber.')
  ],
  groups:{
   support:G('Beri satu rangkap lengkap sebagai contoh dan pilihan perkataan bagi ruang kosong.',
    'Lengkapkan satu rangkap dan lafaz secara terbimbing.',
    ['Tunjukkan ruang kosong daripada halaman cetak.','Modelkan jeda tiap baris sebelum murid mencuba sendiri.'],
    ['Jejak baris contoh.','Lengkapkan bahagian kosong dengan bantuan.','Lafaz empat baris.'],
    'Apakah manfaat teknologi yang disebut?', 'Kerja berat menjadi ringan.',
    'Satu rangkap disiapkan serta satu lafaz sendiri, tahap bantuan dicatat.',
    'Empat baris bertema teknologi dan lafaz dapat difahami.',
    'Ulang sebutan satu baris yang sukar selepas contoh guru.'),
   core:G('Bina secara terkawal dan latih lafaz berpasangan sebelum penilaian sendiri.',
    'Lengkapkan pantun empat kerat serta lafaz dengan sebutan dan intonasi yang betul.',
    ['Bimbing murid semak empat baris dan rima.','Dengar setiap murid secara berasingan.'],
    ['Baca rangkap sumber.','Lengkapkan bahagian kosong.','Semak rima.','Lafaz sendiri.'],
    'Apakah satu faedah teknologi dalam pantun?', 'Kerja yang lambat menjadi cepat.',
    'Pantun lengkap dan lafaz individu.',
    'Isi sesuai, empat baris serta sebutan/intonasi sesuai.',
    'Perkemas perkataan pada baris yang belum lancar.'),
   challenge:G('Perkemas rima dan gaya lafaz sambil kekal pada tugas pantun.',
    'Lengkapkan satu rangkap dan jelaskan satu manfaat teknologi daripada maksud pantun.',
    ['Minta alasan pemilihan satu perkataan penutup baris.','Bezakan baris ciptaan murid daripada baris tercetak.'],
    ['Lengkapkan rangkap.','Lafaz dengan intonasi.','Nyatakan satu kebaikan teknologi berdasarkan rangkap.'],
    'Mengapa isi ini berkaitan dengan tema?', 'Kerana pantun menyatakan teknologi memudahkan kerja.',
    'Pantun dan lafaz sendiri dengan penjelasan isi.',
    'Rima dikawal dan manfaat bersumber pada maksud pantun.',
    'Baiki pemilihan kata supaya lebih sesuai dengan makna dan rima.')
  },
  pbd:{method:'Semakan satu rangkap pantun lengkap dan pemerhatian lafaz individu.',
   evidence:'Pantun empat kerat yang dilengkapkan secara terkawal daripada halaman 107 serta lafaz individu dengan sebutan dan intonasi sesuai.',
   criterion:'Satu rangkap empat baris lengkap dan dapat dilafaz dengan jelas; bantuan dicatat.'},
  reflection:'Murid disemak: ____ / ____. Rangkap lengkap: ____. Lafaz jelas: ____. Bantuan rima/perkataan: ____. Susulan: ____.'
 },
 5:{
  title:'Basikal Solar',sp:'5.3.1',page:108,
  anchors:['basikal solar','ayat seruan','amboi','wah'],
  task:'Mengenal ayat seruan daripada dialog Basikal Solar dan membina tiga ayat seruan berdasarkan gambar serta kata seru wah, eh, oh atau amboi pada Buku Teks m/s 108.',
  pak:'Baca–Kenal–Bina: pasangan mengenal kata seru pada dialog dan murid membina tiga ayat sendiri.',
  phases:[
   P('Kenal tema basikal solar',
    ['Buka Buku Teks m/s 108 dan baca tajuk serta dialog Mariah, Kanang dan Kalang.','Tanyakan perkara yang menarik perhatian watak pada basikal solar.'],
    ['Menyebut tajuk dan watak.','Menunjuk satu ungkapan perasaan daripada dialog.'],
    'Tema dan perasaan mesti berpunca daripada dialog.'),
   P('Jejak contoh kata seru sebenar',
    ['Tunjukkan contoh “Wah, hebatnya basikal solar ini!”, “Eh, kamu rupanya, Kalang!”, “Oh, begini rupanya basikal solar!” dan “Amboi, laju sungguh basikal solar ini!”.','Baca secara berintonasi dan tunjuk penggunaan tanda seru.'],
    ['Membaca contoh bercetak.','Mengenal kata seru wah, eh, oh dan amboi.'],
    'Contoh dianggap petikan buku, bukan ayat baharu murid.'),
   P('Bezakan ayat seruan dan ayat tanya',
    ['Tunjukkan ayat tanya Kalang “Apakah yang kamu berdua lihat?” yang bercetak dalam dialog.','Banding tujuan ayat tanya dengan ungkapan terkejut/kagum yang menggunakan kata seru.'],
    ['Menunjukkan tanda tanya dan tanda seru.','Menyatakan perbezaan tujuan kedua-dua jenis ayat.'],
    'Ayat tanya tidak dinilai sebagai ayat seruan.'),
   P('Bina tiga ayat seruan berdasarkan gambar',
    ['Minta murid meneliti gambar asal pada halaman 108 dan memilih kata seru yang sesuai dengan situasi.','Minta tiga ayat baharu yang berkaitan gambar dan jelas berfungsi melahirkan perasaan; jangan mencipta keupayaan teknikal basikal yang tiada.'],
    ['Menulis tiga ayat seruan sendiri.','Menyemak kata seru dan tanda baca.'],
    'Ayat murid dibezakan daripada dialog bercetak dan semua tiga menunjukkan perasaan.'),
   P('PBD ayat seruan individu',
    ['Semak tiga ayat binaan murid dan dengar seorang demi seorang membacakan satu ayat dengan intonasi sesuai.','Catat kesilapan jenis ayat, tanda baca dan penggunaan kata seru.'],
    ['Membaca satu ayat seruan sendiri.','Membaiki penggunaan kata seru atau tanda baca.'],
    'PBD penulisan individu, bukan hanya pengecaman daripada dialog.'),
   P('Rumusan ayat seruan',
    ['Rumuskan tujuan kata seru untuk menyatakan perasaan serta penggunaan tanda seru.','Minta murid membaca satu contoh baharu yang telah diperiksa.'],
    ['Menyatakan satu kata seru dan perasaan.','Membaca ayat sendiri yang sesuai.'],
    'Penutup mengekalkan SP jenis ayat seruan.')
  ],
  groups:{
   support:G('Beri pilihan kata seru berdasarkan gambar dan contoh.',
    'Tulis tiga ayat seruan dengan rangka dan bimbingan yang dicatat.',
    ['Tunjukkan dua ayat contoh wah dan oh dahulu.','Bimbing murid melengkapkan rangka ayat sendiri.'],
    ['Jejak kata seru.','Pilih perasaan sesuai.','Bina tiga ayat.','Baca semula dengan intonasi.'],
    'Apakah kata seru yang menunjukkan rasa kagum dalam dialog?', 'Wah.',
    'Tiga ayat binaan individu dan bantuan dicatat.',
    'Ayat melahirkan perasaan dan menggunakan tanda seru.',
    'Ulang menulis satu ayat yang masih berbentuk penyata.'),
   core:G('Kenal contoh dalam dialog dan bina tiga ayat baharu.',
    'Tulis tiga ayat seruan dengan kata seru sesuai berdasarkan gambar.',
    ['Minta murid menunjukkan bukti penggunaan kata seru dalam teks.','Semak ayat baharu individu dan tanda baca.'],
    ['Cari tiga contoh.','Pilih kata seru.','Bina tiga ayat sendiri.','Baca dengan intonasi sesuai.'],
    'Apakah kata seru dalam “Amboi, laju sungguh basikal solar ini!”?', 'Amboi.',
    'Tiga ayat seruan baharu yang tepat.',
    'Kata seru dan tanda seru sesuai dengan perasaan.',
    'Perkemas satu ayat yang belum membawa maksud seruan.'),
   challenge:G('Terangkan kesesuaian kata seru dan perasaan pada ayat.',
    'Bina tiga ayat seruan berlainan serta jelaskan sebab satu kata seru dipilih.',
    ['Minta murid membanding ayat tanya dengan ayat seruan.','Semak bahawa ayat tentang basikal solar tidak menambah ciri alat rekaan.'],
    ['Pilih tiga perasaan.','Tulis ayat baharu.','Jelaskan satu fungsi kata seru.'],
    'Mengapa “Apakah yang kamu berdua lihat?” bukan ayat seruan?', 'Kerana ayat itu bertanya.',
    'Tiga ayat seruan dengan satu penjelasan perbezaan.',
    'Ayat seruan tepat dan tidak dikelirukan dengan ayat tanya.',
    'Baiki satu fungsi kata seru yang kurang sesuai.')
  },
  pbd:{method:'Semakan tiga ayat seruan baharu bertulis individu dan pembacaan satu ayat.',
   evidence:'Tiga ayat sendiri berdasarkan gambar basikal solar dengan kata seru dan tanda seru yang sesuai, dibezakan daripada dialog asal.',
   criterion:'Tiga ayat seruan yang tepat, menunjukkan perasaan serta tanda baca yang sesuai.'},
  reflection:'Murid disemak: ____ / ____. Tiga ayat seruan tepat: ____. Intonasi sesuai: ____. Keliru ayat tanya: ____. Susulan: ____.'
 }
};
function applies(map,opts={}){
 const p=plans[Number(map?.session_no)];if(!p)return false;
 const meta=map?.source_evidence?.meta||{};
 const subject=opts.subjectKey||map?.subject_key||(typeof root.rphSubjectKey==='function'?root.rphSubjectKey(map?.subject_id):'');
 const text=norm(map?.source_evidence?.textbook?.text).toLowerCase();
 return subject==='bm'&&Number(map?.year)===1&&Number(map?.academic_year)===2026
  &&Number(map?.week_no)===28&&map?.verification_status==='verified'
  &&map?.week_exact===true&&map?.sp_crosscheck===true
  &&meta.session_exact===true&&meta.page_route_verified===true
  &&norm(meta.main_sp||map?.sp)===p.sp&&norm(map?.sp)===p.sp
  &&Number(map?.textbook_page_start)===p.page
  &&Number(map?.textbook_page_end||p.page)===p.page
  &&norm(map?.title).toLowerCase()===p.title.toLowerCase()
  &&p.anchors.every(a=>text.includes(a));
}
const stepText=(p,page)=>'Tindakan guru: '+p.teacher.join('\n')
 +'\nTindakan murid: '+p.pupils.join('\n')+'\nSemakan: '+p.check+'\nBahan: Buku Teks m/s '+page;
function build(map,opts={}){
 if(!applies(map,opts))throw Error('BM1_WEEK28_SOURCE_PLAN_SCOPE_MISMATCH');
 const p=plans[Number(map.session_no)];
 const canonical=root.BmYear1CanonicalRph?.build(map,opts);
 if(!canonical)throw Error('BM1_CANONICAL_ENGINE_REQUIRED');
 const phases=p.phases.map(x=>({...x,resources:['Buku Teks m/s '+p.page]}));
 const sourceSteps=phases.map((x,i)=>({key:'bm1-w28-s'+map.session_no+'-step-'+(i+1),
  name:x.name,text:stepText(x,p.page),bbm:'Buku Teks m/s '+p.page,pak21:p.pak,
  phase:'source-specific-teacher-design'}));
 const differentiation={},librarySteps={};
 for(const k of ['support','core','challenge']){
  const g=p.groups[k],label={support:'Peneroka',core:'Pembina',challenge:'Pencabar'}[k];
  differentiation[k]={label,support_description:g.description,task:g.task,
   materials:['Buku Teks m/s '+p.page],teacher:g.teacher,pupil_steps:g.pupils,
   example:{teacher:g.question,pupil:g.answer},product:g.product,criterion:g.criterion,next_step:g.next};
  librarySteps[k]=[{key:'bm1-w28-s'+map.session_no+'-'+k,name:label,text:'Tugasan sumber: '+g.task,
   bbm:'Buku Teks m/s '+p.page,pak21:p.pak,phase:'source-specific-teacher-design'}];
 }
 const first=phases[0],last=phases[phases.length-1];
 return {...canonical,canonicalBm1:true,sourcePlanBm1:true,
  sourcePlanReviewStatus:'LESSON_MAP_EVIDENCE_NOT_WORD_APPROVED',sourcePlanTeacherReviewNeeded:true,
  sourcePlanSession:'BM1-2026B-W28-S'+map.session_no,sourcePlanVersion:VERSION,canonicalVersion:VERSION,
  sourceTask:p.task,anchor:p.task,phases,sourceSteps,classroomFlow:sourceSteps,differentiation,librarySteps,
  groupBbm:{support:'Buku Teks m/s '+p.page,core:'Buku Teks m/s '+p.page,challenge:'Buku Teks m/s '+p.page},
  bbmList:['Buku Teks m/s '+p.page],pak21:p.pak,pakDetail:p.pak,
  pbd:p.pbd,pbdEvidence:p.pbd,reflection:p.reflection,intervention:[],
  inductionData:{name:first.name,text:stepText(first,p.page),bbm:'Buku Teks m/s '+p.page,pak21:p.pak},
  setInduksi:stepText(first,p.page),penutup:stepText(last,p.page),
  diffSupportAct:differentiation.support.task,diffCoreAct:differentiation.core.task,
  diffChallengeAct:differentiation.challenge.task,
  page:'m/s '+p.page,mainSp:p.sp,topic:p.title,
  pkjrStatus:p.pkjr?'PKJR_TITLE_ONLY_NO_VERIFIED_PKJR_SOURCE':null
 };
}
root.BmYear1Week28SourcePlans={VERSION,availableSessions:[1,2,3,4,5],applies,build};
try{if(typeof module!=='undefined'&&module.exports)module.exports=root.BmYear1Week28SourcePlans}catch{}
})(typeof window!=='undefined'?window:globalThis);
