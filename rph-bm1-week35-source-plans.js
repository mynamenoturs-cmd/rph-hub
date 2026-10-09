// BM Tahun 1 2026 Kumpulan B — Minggu 35, BT 138–142, lima sesi.
// Enam fasa ialah reka bentuk PdP berdasarkan tugasan Buku Teks (BUKAN enam
// langkah literal yang dicetak dalam buku). BUKAN Word diluluskan guru.
(function(root){
'use strict';
const VERSION='BM1-W35-SOURCE-PLANS-20261009f';
const norm=x=>String(x??'').replace(/\s+/g,' ').trim();
const P=(name,teacher,pupils,check)=>({name,teacher,pupils,check});
const G=(task,teacher,pupils,example,product,criterion,next)=>({task,teacher,pupils,example,product,criterion,next});
const plans={
1:{
title:'Wang untuk Aimi',sp:'1.2.1',page:138,
anchors:['wang untuk aimi','wang saku','tabung','berhemah'],
task:'Bertutur dengan sebutan, intonasi dan kesantunan sesuai melalui tiga respons kepada ibu tentang wang saku, menyimpan wang dan menggunakannya secara berhemah berdasarkan BT m/s 138.',
pak:'Simulasi dialog ibu–Aimi; bertukar peranan dengan rakan, tetapi PBD daripada respons individu.',
steps:[
P('Kenal dialog tentang wang saku',
 ['Buka Buku Teks m/s 138, baca tajuk Wang untuk Aimi dan tunjuk dialog ibu dengan Aimi.','Soal apa yang ibu berikan kepada Aimi dan mengapa perbualan itu berkaitan wang.'],
 ['Menunjuk watak ibu dan Aimi.','Menyebut wang saku berdasarkan dialog.'],
 'Respons bermula daripada dialog, bukan jumlah wang yang tidak kelihatan dalam OCR.'),
P('Dengar sebutan dan kesantunan',
 ['Modelkan ungkapan “Terima kasih, ibu”, “Baiklah, ibu” serta pesanan menggunakan wang secara berhemah.','Latih sebutan, intonasi dan adab ketika bertutur dengan orang lebih tua.'],
 ['Mendengar contoh lisan guru.','Mengulang ungkapan sopan dengan nada sesuai.'],
 'Guru menyemak sebutan serta nada, bukan hanya hafalan teks.'),
P('Respons kepada pesanan menyimpan wang',
 ['Baca pesanan ibu tentang menyimpan wang lebih di dalam tabung.','Minta murid menjawab kepada ibu dengan ayat sendiri sambil kekal pada fakta sumber.'],
 ['Memberikan respons tentang menyimpan wang.','Menjelaskan fungsi tabung dalam konteks perbualan.'],
 'Respons menunjukkan faham pesan menyimpan wang.'),
P('Latih tiga respons secara berpasangan',
 ['Minta pasangan bergilir menjadi ibu dan Aimi, melibatkan tiga rangsangan: menerima wang saku, menyimpan lebihan, berbelanja berhemah.','Jumlah wang yang perlu dikira dalam gambar asal mesti dirujuk terus pada gambar; jangan mereka-reka nilai syiling daripada OCR.'],
 ['Bertukar watak bagi tiga rangsangan.','Menjawab dengan ungkapan sopan dan intonasi sesuai.'],
 'Setiap respons sesuai situasi dan tidak mengandaikan angka yang hilang.'),
P('Semakan lisan individu',
 ['Dengar setiap murid menjawab tiga pesanan tanpa bantuan pasangan.','Catat kejelasan sebutan, ketepatan isi, intonasi dan tahap bantuan; beri peluang membaiki satu respons.'],
 ['Menyampaikan tiga respons sendiri.','Membaiki ungkapan yang kurang sesuai.'],
 'PBD diperoleh daripada tiga respons individu, bukan kerja kumpulan.'),
P('Penutup: penggunaan wang berhemah',
 ['Rumuskan kesantunan berkomunikasi serta pesanan menyimpan dan menggunakan wang berhemah.','Minta murid menyebut satu respons sopan yang dipelajari.'],
 ['Mengulang satu ayat respons lengkap.','Menjelaskan pesanan ibu dengan ayat ringkas.'],
 'Rumusan mengekalkan fokus SP bertutur 1.2.1.')
],
groups:{
support:G('Berikan tiga respons mudah dengan petunjuk frasa daripada dialog.',
 ['Bacakan satu pesanan ibu pada satu masa.','Beri dua pilihan ungkapan sopan sumber lalu kurangkan bantuan.'],
 ['Dengar pesanan.','Jawab secara ringkas.','Cuba tiga respons sendiri.'],
 ['Apakah yang Aimi ucap selepas menerima wang saku?','Terima kasih, ibu.'],
 'Tiga respons lisan sendiri dengan bantuan direkod.','Ungkapan sepadan dengan pesanan dan sebutan jelas.','Ulang satu respons dengan petunjuk beransur kurang.'),
core:G('Simulasi tiga pesanan ibu kemudian berikan respons sendiri.',
 ['Pasangkan murid untuk bertukar peranan ibu dan Aimi.','Semak jawapan individu selepas simulasi.'],
 ['Terima pesanan.','Jawab dengan intonasi sesuai.','Sampaikan tiga respons individu.'],
 ['Apakah Aimi lakukan dengan wang lebih?','Saya akan menyimpan wang lebih di dalam tabung.'],
 'Tiga respons tepat dan sopan.','Respons berkaitan wang saku, simpanan dan berhemah.','Baiki satu ungkapan atau nada.'),
challenge:G('Terangkan mengapa satu respons sesuai sambil bertutur sopan.',
 ['Minta alasan tentang simpanan berdasarkan pesanan ibu.','Tidak mewajibkan pengiraan syiling apabila imej sumber belum disemak.'],
 ['Beri tiga respons.','Jelaskan satu pilihan ungkapan.','Tunjukkan baris pesanan yang menyokongnya.'],
 ['Mengapakah Aimi perlu menggunakan wang secara berhemah?','Supaya wang tidak dibelanjakan sesuka hati.'],
 'Tiga respons serta alasan ringkas.','Isi dan alasan sepadan dengan dialog, intonasi sesuai.','Perkemas jawapan dengan bahasa bertatasusila.')
},
pbd:{method:'Pemerhatian tiga respons pertuturan individu dalam dialog ibu–Aimi.',
 evidence:'Tiga respons tentang menerima wang saku, menyimpan lebihan di tabung dan menggunakan wang berhemah; sebutan/intonasi dan bantuan dicatat.',
 criterion:'Tiga respons sesuai dengan dialog, sebutan jelas dan intonasi bertatasusila.'},
reflection:'Murid disemak: ____ / ____. Tiga respons tepat: ____. Sebutan/intonasi sesuai: ____. Bantuan diperlukan: ____. Susulan: ____.'
},
2:{
title:'Rajin Menabung',sp:'2.2.1',page:139,
anchors:['rajin menabung','rani','idea tersurat','idea tersirat'],
task:'Membaca Rajin Menabung lalu menyatakan sekurang-kurangnya dua idea tersurat dan dua idea tersirat dengan merujuk bukti petikan BT m/s 139.',
pak:'Baca–Buktikan–Tafsir: pasangan membanding idea sumber dan inferens sebelum setiap murid memberi jawapan individu.',
steps:[
P('Kenal maksud tersurat dan tersirat',
 ['Buka BT m/s 139 dan baca tajuk Rajin Menabung.','Tunjuk contoh buku: idea tersurat Rani dan abang menyimpan wang sebelum berbelanja; idea tersirat mereka berjimat cermat.'],
 ['Membaca contoh dengan bimbingan.','Menyatakan beza fakta yang disebut dengan kesimpulan daripada fakta.'],
 'Murid tidak menganggap kedua-dua jenis idea sama.'),
P('Baca kisah Rani dan abangnya',
 ['Bimbing bacaan petikan tentang menyimpan wang, membeli roti dan susu, serta bercadang mendermakan wang.','Elakkan membuat inferens tentang jumlah wang saku asal yang tidak jelas akibat OCR.'],
 ['Membaca petikan mengikut giliran.','Menjejak bahagian tentang simpanan dan derma.'],
 'Respons bacaan dan pencarian bukti direkod.'),
P('Pilih dua idea tersurat',
 ['Minta murid memilih dua fakta yang disebut secara jelas, seperti menyimpan dalam tabung sebelum berbelanja dan bercadang mendermakan simpanan.','Minta murid menandakan ayat bukti bagi setiap fakta.'],
 ['Menyatakan dua maklumat jelas daripada petikan.','Menunjukkan ayat sumber yang relevan.'],
 'Dua idea tersurat disebut dan boleh dikesan pada teks.'),
P('Bina dua idea tersirat daripada bukti',
 ['Bimbing murid membuat kesimpulan bahawa menyimpan wang sebelum berbelanja mencerminkan berjimat cermat.','Minta murid menafsir rancangan mendermakan wang sebagai tanda prihatin atau pemurah, dan nyatakan ayat sumber yang menyokongnya.'],
 ['Memberi dua tafsiran dengan ayat sendiri.','Mengaitkan setiap tafsiran dengan satu fakta sumber.'],
 'Tafsiran munasabah, bukan fakta baharu yang diada-adakan.'),
P('PBD pembezaan idea individu',
 ['Minta setiap murid menyampaikan dua tersurat dan dua tersirat secara sendiri.','Rekod betul/salah serta bukti bagi sekurang-kurangnya satu tafsiran dan sokongan yang digunakan.'],
 ['Menjawab empat idea tanpa menyalin rakan.','Membetulkan tafsiran yang tidak berasas.'],
 'Penguasaan dinilai pada beza fakta–tafsiran dan bukti individu.'),
P('Penutup: fakta dan kesimpulan',
 ['Rumuskan contoh tersurat dan tersirat daripada cerita, tanpa menjadikan pengiraan wang sebagai PBD membaca.','Minta murid menerangkan satu pasangan fakta dan tafsiran.'],
 ['Menyebut satu fakta.','Memberi satu tafsiran yang sepadan.'],
 'Penutup kekal fokus bacaan 2.2.1.')
],
groups:{
support:G('Padankan dua fakta dengan dua kesimpulan melalui ayat bukti yang ditunjuk.',
 ['Baca ayat simpanan dan derma satu demi satu.','Beri pilihan tafsiran lalu minta murid menerangkan pasangan.'],
 ['Tunjuk dua ayat.','Sebut dua fakta.','Pilih dua tafsiran dan nyatakan secara sendiri.'],
 ['Apakah idea tersirat daripada menyimpan sebelum berbelanja?','Rani dan abangnya berjimat cermat.'],
 'Dua tersurat, dua tersirat dengan tahap bantuan direkod.','Kedua-dua tafsiran berkaitan fakta yang benar-benar terdapat pada halaman.','Ulang padanan bukti untuk tafsiran yang kurang tepat.'),
core:G('Kenal dua fakta dan buat dua kesimpulan dengan bukti.',
 ['Tanya murid lokasi ayat bukti.','Dengar empat idea individu selepas latihan pasangan.'],
 ['Baca teks.','Pilih dua fakta.','Tafsir dua sikap.','Nyatakan bukti satu tafsiran.'],
 ['Apa yang menunjukkan Rani dan abangnya prihatin?','Mereka bercadang mendermakan wang simpanan.'],
 'Empat idea individu dengan satu bukti.','Dua idea tersurat dan dua idea tersirat dipisahkan tepat.','Betulkan tafsiran yang tidak dapat disokong teks.'),
challenge:G('Jelaskan hubungan dua inferens dengan ayat bukti yang berlainan.',
 ['Minta murid menjelaskan mengapa satu kesimpulan bukan petikan langsung.','Bimbing alasan yang berpunca daripada fakta, bukan andaian lain.'],
 ['Baca dua fakta.','Nyatakan dua kesimpulan.','Hujahkan kedua-duanya dengan bukti.'],
 ['Mengapa rancangan menderma menunjukkan sifat prihatin?','Kerana mereka mahu membantu orang melalui simpanan.'],
 'Dua fakta dan dua tafsiran dengan justifikasi.','Bukti dan tafsiran dipadankan secara tepat.','Perhalusi alasan yang masih tidak bersumber.')
},
pbd:{method:'Semakan bacaan dan respons individu dua idea tersurat serta dua tersirat.',
 evidence:'Dua fakta petikan tentang tabung/derma serta dua tafsiran yang disokong bukti, contohnya berjimat cermat dan prihatin.',
 criterion:'Dua tersurat dan dua tersirat tepat; sekurang-kurangnya satu idea tersirat diberi bukti teks.'},
reflection:'Murid disemak: ____ / ____. Dua tersurat betul: ____. Dua tersirat berasas: ____. Bukti diberikan: ____. Susulan: ____.'
},
3:{
title:'Membeli Alat Tulis',sp:'3.3.2',page:140,
anchors:['membeli alat tulis','jamil','latehan','tingal','kentin'],
task:'Menyunting sekurang-kurangnya lima kesalahan ejaan dalam petikan Membeli Alat Tulis di BT m/s 140 tanpa mengubah tugasan kepada pengiraan matematik.',
pak:'Kesan–Bukti–Sunting: pasangan mengenal kesalahan, kemudian setiap murid membetulkan ejaan secara individu.',
steps:[
P('Baca petikan dan kenal fokus suntingan',
 ['Buka BT m/s 140 dan bacakan arahan “Mengedit ejaan dalam teks”.','Terangkan bahawa angka harga barang ialah konteks cerita, bukan tugasan utama murid.'],
 ['Membaca petikan Jamil membeli alat tulis.','Mencari perkataan yang kelihatan janggal dari segi ejaan.'],
 'Murid jelas bahawa SP 3.3.2(i) ialah menyunting ejaan.'),
P('Modelkan cara mengesan ejaan salah',
 ['Tunjuk contoh sumber “latehan” dan bincang ejaan standard “latihan”.','Beri peluang murid mencari contoh lain tanpa menukar semua kesalahan di depan kelas.'],
 ['Menyemak contoh latehan–latihan.','Menggariskan kesalahan lain pada petikan.'],
 'Kesalahan dikenal pasti pada halaman bercetak, bukan kesalahan OCR pemisahan angka.'),
P('Cari sekurang-kurangnya lima perkataan salah',
 ['Arahkan murid mengesan kata yang dicetak “tingal”, “aya”, “pikir”, “cukop” dan “kentin” selain “latehan”.','Bimbing pemeriksaan pada Buku Teks asal sekiranya bentuk OCR nampak terpisah.'],
 ['Menandakan lima atau lebih perkataan yang tersalah eja.','Menyemak perkataan dalam konteks ayat.'],
 'Kata sasaran ialah ejaan dalam teks, bukan nombor harga yang dipecah OCR.'),
P('Tulis pembetulan individu',
 ['Minta murid membetulkan sekurang-kurangnya lima kesalahan: latihan, tinggal, saya, fikir, cukup, kantin mengikut contoh yang ditemui.','Minta murid menulis semula ayat pilihan selepas pembetulan.'],
 ['Membuat pembetulan ejaan individu.','Membaca ayat yang sudah dimurnikan.'],
 'Setiap pembetulan dibandingkan dengan perkataan asal yang dicetak.'),
P('PBD suntingan lima kesalahan',
 ['Semak jumlah kesalahan dikenal pasti, pembetulan tepat dan satu ayat dibaca semula.','Bezakan kesilapan ejaan daripada kiraan wang dalam petikan yang mungkin tidak konsisten.'],
 ['Menyerahkan hasil suntingan sendiri.','Membaiki pembetulan yang masih salah.'],
 'PBD lima ejaan individu, bukan kebolehan menghitung baki wang.'),
P('Penutup proses menyunting',
 ['Rumuskan cara mengenal pasti, membetulkan dan menyemak semula ejaan dengan merujuk sumber.','Minta murid membaca satu ayat yang kini betul ejaannya.'],
 ['Menyebut satu ejaan yang dibetulkan.','Membaca ayat yang telah disunting.'],
 'Penutup mengukuhkan SP 3.3.2(i).')
],
groups:{
support:G('Tandakan lima kata dan berikan petunjuk huruf untuk murid membetulkan sendiri.',
 ['Tunjuk kata salah dalam baris tertentu.','Beri rangka ejaan yang memerlukan murid melengkapkannya.'],
 ['Jejak lima kata.','Tulis ejaan yang betul.','Baca semula satu ayat.'],
 ['Apakah ejaan betul bagi “latehan”?','Latihan.'],
 'Lima pembetulan ejaan individu dengan bantuan dicatat.','Lima ejaan diperbetul tepat daripada teks.','Ulang perkataan yang masih keliru.'),
core:G('Kesan dan betulkan lima kesalahan ejaan tanpa menyalin jawapan pasangan.',
 ['Tanya lokasi kata salah dalam halaman.','Semak lima pembetulan setiap murid.'],
 ['Baca petikan.','Gariskan kesalahan.','Betulkan lima ejaan.','Baca ayat selepas disunting.'],
 ['Bagaimana ejaan betul “kentin”?','Kantin.'],
 'Lima kata salah dan pembetulan individu.','Sekurang-kurangnya lima pembetulan tepat.','Baiki baki perkataan yang masih salah.'),
challenge:G('Kenal pasti enam ejaan salah dan jelaskan dua pembetulan.',
 ['Minta murid memeriksa bentuk kata standard yang ditulis.','Jangan menambah tugasan pengiraan baki wang di luar SP.'],
 ['Kesan enam kesalahan jika mampu.','Tulis ejaan betul.','Terangkan pembetulan dua kata.'],
 ['Apakah ejaan standard “pikir”?','Fikir.'],
 'Enam ejaan disemak serta dua justifikasi ringkas.','Sekurang-kurangnya lima pembetulan tepat dengan penerangan jelas.','Perhalusi ejaan yang belum tepat.')
},
pbd:{method:'Analisis lima pembetulan ejaan dalam hasil tulisan individu.',
 evidence:'Kesalahan sumber seperti latehan→latihan, tingal→tinggal, aya→saya, pikir→fikir, cukop→cukup atau kentin→kantin.',
 criterion:'Sekurang-kurangnya lima kesalahan ejaan dikenal pasti dan ditulis dalam ejaan standard dengan tepat.'},
reflection:'Murid disemak: ____ / ____. Lima ejaan tepat: ____. Boleh membaca ayat suntingan: ____. Masih keliru: ____. Susulan: ____.'
},
4:{
title:'Di Pejabat Pos',sp:'5.2.1',page:141,
anchors:['di pejabat pos','imbuhan awalan dan akhiran','nombor gilir','bayar an'],
task:'Berbual berdasarkan gambar Di Pejabat Pos dengan sekurang-kurangnya empat perkataan berimbuhan awalan/akhiran dari BT m/s 141.',
pak:'Jejak–Kelaskan–Berbual: pasangan mengenal imbuhan sumber lalu menghasilkan respons lisan mengikut giliran.',
steps:[
P('Kenal situasi ayah Hardip di pejabat pos',
 ['Buka BT m/s 141 dan baca petikan Hardip bersama ayahnya untuk membayar bil.','Tunjuk gambar aktiviti mengambil nombor giliran, membilang wang dan mencari tempat duduk.'],
 ['Menyebut tujuan di pejabat pos.','Menunjuk dua perbuatan dalam gambar.'],
 'Respons bersumber daripada petikan dan gambar asal.'),
P('Bezakan awalan dengan akhiran',
 ['Tunjuk bahagian Bijak Bahasa: imbuhan awalan di depan kata dasar dan imbuhan akhiran di hujung.','Jelaskan OCR memisahkan suku kata seperti “mem bayar” untuk perkataan membayar dan “bayar an” untuk bayaran; rujuk ejaan standard.'],
 ['Menyatakan kedudukan awalan/akhiran.','Menyebut contoh membayar dan bayaran.'],
 'Murid tidak menyalin ejaan berjarak akibat OCR sebagai ejaan betul.'),
P('Kenal empat kata berimbuhan',
 ['Bimbing murid mencari mengambil, membilang atau mencari sebagai kata berawalan dan giliran, bayaran atau layanan sebagai kata berakhiran.','Minta murid mengelaskan sekurang-kurangnya empat contoh selepas merujuk teks/gambar bercetak.'],
 ['Menunjukkan empat perkataan pada sumber.','Mengelaskan berdasarkan imbuhan awal atau akhir.'],
 'Kata dipilih benar-benar wujud pada halaman 141.'),
P('Berbual dengan kata berimbuhan',
 ['Minta pasangan melakonkan perbualan ayah–Hardip menggunakan empat kata berimbuhan daripada sumber.','Bantu murid membina sekurang-kurangnya tiga ayat/respons, tanpa menganggap skrip baharu sebagai dialog asal buku.'],
 ['Bertukar peranan dalam dialog.','Menggunakan perkataan berimbuhan secara lisan dalam tiga respons.'],
 'Penggunaan dalam konteks pejabat pos tepat dan jelas.'),
P('PBD perbualan individu',
 ['Dengar setiap murid memberi tiga respons serta menggunakan empat kata berimbuhan yang sesuai.','Catat perkataan digunakan, jenis imbuhan, kejelasan respons dan bantuan yang diterima.'],
 ['Menyampaikan respons sendiri.','Membetulkan satu penggunaan imbuhan yang salah.'],
 'PBD individu, bukan hanya pengecaman imbuhan secara menulis.'),
P('Rumusan bentuk kata',
 ['Rumuskan fungsi awalan dan akhiran dengan contoh daripada pejabat pos.','Minta murid menyebut satu contoh bagi setiap jenis imbuhan.'],
 ['Menyebut satu kata berawalan dan satu berakhiran.','Menggunakan salah satu dalam ayat ringkas.'],
 'Penutup kekal pada tatabahasa dan pertuturan 5.2.1.')
],
groups:{
support:G('Gunakan petunjuk perkataan berwarna/ditunjuk dan rangka dialog.',
 ['Beri dua kata berawalan dan dua berakhiran dari halaman.','Bimbing satu respons pada satu masa sebelum murid mencuba sendiri.'],
 ['Sebut empat contoh.','Kenal tempat imbuhan.','Berbual tiga giliran mudah.'],
 ['Apakah perkataan berakhiran daripada “bayar”?','Bayaran.'],
 'Respons sendiri dan empat contoh dengan tahap bantuan direkod.','Sekurang-kurangnya empat contoh dikenal dan digunakan dengan bantuan sesuai.','Ulang perbualan dengan petunjuk semakin kurang.'),
core:G('Berbual menggunakan empat kata berimbuhan dan nyatakan jenisnya.',
 ['Minta pasangan berlatih situasi gambar.','Dengar respons setiap murid secara individu.'],
 ['Kenal kata imbuhan.','Bina tiga respons.','Gunakan empat contoh.','Semak fungsi imbuhan.'],
 ['Apakah ayah Hardip lakukan di pejabat pos?','Ayah Hardip membuat bayaran bil.'],
 'Tiga respons dan empat kata berimbuhan.','Penggunaan awalan/akhiran sesuai dengan ayat dan situasi.','Baiki satu ayat yang tersalah imbuhan.'),
challenge:G('Jelaskan dua beza awalan/akhiran dalam dialog sendiri.',
 ['Minta murid menghuraikan kedudukan dua contoh yang digunakan.','Betulkan ejaan kata yang dipecah akibat OCR.'],
 ['Bina tiga respons.','Gunakan sekurang-kurangnya empat kata.','Jelaskan dua bentuk imbuhan.'],
 ['Apakah beza “membayar” dengan “bayaran”?','Membayar memakai awalan, bayaran memakai akhiran.'],
 'Tiga respons beserta penjelasan dua contoh.','Penggunaan kata tepat, pengelasan imbuhan jelas.','Perkemas bentuk kata yang masih dikelirukan.')
},
pbd:{method:'Pemerhatian perbualan individu dengan sekurang-kurangnya empat kata berimbuhan.',
 evidence:'Tiga respons lisan yang sesuai dengan pejabat pos, menggunakan perkataan seperti mengambil, mencari, bayaran dan giliran; awalan/akhiran dikenal pasti.',
 criterion:'Empat kata berimbuhan digunakan dengan sesuai dan sekurang-kurangnya tiga respons dapat difahami.'},
reflection:'Murid disemak: ____ / ____. Empat imbuhan digunakan: ____. Tiga respons jelas: ____. Salah awalan/akhiran: ____. Susulan: ____.'
},
5:{
title:'Barangan dan Perkhidmatan',sp:'5.2.2',page:142,
anchors:['barangan dan perkhidmatan','kata majmuk','pasar raya','tali pinggang','alat tulis'],
task:'Mengenal pasti sekurang-kurangnya lima kata majmuk rangkai kata bebas dalam petikan BT m/s 142, kemudian membina tiga ayat individu menggunakannya.',
pak:'Cari–Buktikan–Bina: pasangan menjejak kata majmuk pada sumber, kemudian murid menulis tiga ayat sendiri.',
steps:[
P('Kenal konteks membeli-belah',
 ['Buka BT m/s 142 dan baca tajuk Barangan dan Perkhidmatan.','Tunjuk cerita Sui Lian bersama ibu di pasar raya serta barang yang dibeli.'],
 ['Menyebut satu tempat/objek yang disebut.','Menunjukkan tajuk kata majmuk dalam buku.'],
 'Maklumat berasal daripada cerita dan gambar.'),
P('Jejak kata majmuk dalam teks',
 ['Tunjukkan contoh nasi ayam, tengah hari, pasar raya, tukang gunting, beg tangan, tali pinggang dan alat tulis yang muncul pada halaman.','Minta murid menunjukkan lokasi setiap frasa sebagai satu ungkapan bermakna.'],
 ['Membaca beberapa contoh sumber.','Menandakan frasa yang terdiri daripada lebih satu perkataan.'],
 'Contoh kata majmuk dibezakan daripada perkataan bersempang “membeli-belah”.'),
P('Pilih sekurang-kurangnya lima kata majmuk',
 ['Minta murid mengumpul lima kata majmuk rangkai kata bebas dan menyebut makna ringkas setiap contoh.','Semak pilihan dari halaman, termasuk frasa panjang “tempat letak kereta” jika sesuai.'],
 ['Memilih lima frasa daripada petikan.','Menyebut konteks setiap frasa.'],
 'Lima contoh wujud dalam halaman 142.'),
P('Bina tiga ayat menggunakan kata majmuk',
 ['Modelkan satu ayat konteks menggunakan “alat tulis” sebagai contoh guru.','Minta murid memilih tiga kata majmuk daripada senarai sendiri lalu menulis tiga ayat yang sesuai.'],
 ['Menulis tiga ayat sendiri.','Menyemak kesesuaian kata majmuk dan tanda baca.'],
 'Ayat bermakna dan bukan senarai frasa semata-mata.'),
P('Semakan pengecaman dan ayat individu',
 ['Semak lima contoh yang dikenal dan tiga ayat individu secara berasingan.','Minta murid membetulkan frasa yang bukan kata majmuk atau ayat yang tidak sesuai.'],
 ['Menunjuk bukti kata majmuk dalam teks.','Membaiki satu ayat hasil sendiri.'],
 'PBD mencatat lima pengenalpastian dan tiga penggunaan.'),
P('Rumusan kata majmuk dalam kehidupan',
 ['Rumuskan maksud kata majmuk dan contoh barang/perkhidmatan dalam bahan.','Minta murid membaca satu ayat sendiri dan menamakan kata majmuk di dalamnya.'],
 ['Membaca satu ayat sendiri.','Menunjukkan kata majmuk yang digunakan.'],
 'Penutup berfokus pada SP 5.2.2(i).')
],
groups:{
support:G('Tunjuk lima contoh pada halaman dan bimbing ayat mudah satu demi satu.',
 ['Bantu menjejak kata majmuk pada teks asal.','Beri rangka ayat dengan ruang yang mesti murid isi sendiri.'],
 ['Tunjuk lima frasa.','Baca bersama guru.','Bina tiga ayat dengan petunjuk.'],
 ['Apakah dua perkataan yang membentuk “alat tulis”?','Alat dan tulis.'],
 'Lima kata majmuk dan tiga ayat bertulis berbimbing.','Contoh bersumber dan ayat mempunyai maksud sesuai.','Ulang ayat yang tersalah pilih frasa.'),
core:G('Cari lima kata majmuk dan hasilkan tiga ayat sendiri.',
 ['Minta bukti lokasi setiap contoh pada buku.','Semak hasil penulisan individu selepas perbincangan.'],
 ['Baca petikan.','Kenal pasti lima frasa.','Tulis tiga ayat.','Semak tanda baca.'],
 ['Di manakah Sui Lian membeli-belah?','Di pasar raya.'],
 'Lima contoh dan tiga ayat individu.','Kata majmuk dan penggunaan ayat tepat.','Perbaiki frasa/ayat yang tidak sepadan konteks.'),
challenge:G('Jelaskan penggunaan tiga kata majmuk berlainan dalam ayat.',
 ['Bimbing murid membezakan membeli-belah daripada kata majmuk rangkai kata bebas yang dipilih.','Minta murid menjustifikasikan penggunaan satu frasa dalam ayat.'],
 ['Cari lima contoh.','Bina tiga ayat dengan frasa berlainan.','Jelaskan satu kesesuaian pilihan kata.'],
 ['Mengapa “tali pinggang” sesuai bagi ayat tentang ayah Sui Lian?','Kerana ibu Sui Lian membelinya untuk ayah.'],
 'Lima frasa dan tiga ayat dengan satu alasan.','Kata majmuk dari teks serta ayat gramatis.','Perkemas ayat yang tidak menunjukkan maksud frasa.')
},
pbd:{method:'Semakan lima kata majmuk yang dikenal pasti dan tiga ayat bertulis individu.',
 evidence:'Contoh kata majmuk nasi ayam, tengah hari, pasar raya, tukang gunting, tali pinggang atau alat tulis disahkan pada sumber dan tiga ayat digunakan secara tepat.',
 criterion:'Lima kata majmuk sumber dikenal pasti dan tiga ayat menggunakannya dengan betul.'},
reflection:'Murid disemak: ____ / ____. Lima kata majmuk tepat: ____. Tiga ayat betul: ____. Tersalah beza jenis kata: ____. Susulan: ____.'
}
};
function applies(map,opts={}){
 const p=plans[Number(map?.session_no)];
 if(!p)return false;
 const meta=map?.source_evidence?.meta||{};
 const key=opts.subjectKey||map?.subject_key||(typeof root.rphSubjectKey==='function'?root.rphSubjectKey(map?.subject_id):'');
 const book=norm(map?.source_evidence?.textbook?.text).toLowerCase();
 return key==='bm'&&Number(map?.year)===1&&Number(map?.academic_year)===2026
  &&Number(map?.week_no)===35&&map?.verification_status==='verified'
  &&map?.week_exact===true&&map?.sp_crosscheck===true
  &&meta.session_exact===true&&meta.page_route_verified===true
  &&norm(meta.main_sp||map?.sp)===p.sp&&norm(map?.sp)===p.sp
  &&Number(map?.textbook_page_start)===p.page&&Number(map?.textbook_page_end||p.page)===p.page
  &&norm(map?.title).toLowerCase()===p.title.toLowerCase()
  &&p.anchors.every(a=>book.includes(a));
}
function textStep(s,page){
 return 'Tindakan guru: '+s.teacher.join('\n')+'\nTindakan murid: '+s.pupils.join('\n')
   +'\nSemakan: '+s.check+'\nBahan: Buku Teks m/s '+page;
}
function build(map,opts={}){
 if(!applies(map,opts))throw Error('BM1_WEEK35_SOURCE_PLAN_SCOPE_MISMATCH');
 const p=plans[Number(map.session_no)];
 const canonical=root.BmYear1CanonicalRph?.build(map,opts);
 if(!canonical)throw Error('BM1_CANONICAL_ENGINE_REQUIRED');
 const phases=p.steps.map(s=>({...s,resources:['Buku Teks m/s '+p.page]}));
 const sourceSteps=phases.map((s,i)=>({key:'bm1-w35-s'+map.session_no+'-step-'+(i+1),
  name:s.name,text:textStep(s,p.page),bbm:'Buku Teks m/s '+p.page,
  pak21:p.pak,phase:'source-specific-teacher-plan'}));
 const differentiation={},librarySteps={};
 for(const key of ['support','core','challenge']){
  const g=p.groups[key],label={support:'Peneroka',core:'Pembina',challenge:'Pencabar'}[key];
  differentiation[key]={label,support_description:g.description,task:g.task,
   materials:['Buku Teks m/s '+p.page],teacher:g.teacher,pupil_steps:g.pupils,
   example:{teacher:g.example[0],pupil:g.example[1]},product:g.product,criterion:g.criterion,next_step:g.next};
  librarySteps[key]=[{key:'bm1-w35-s'+map.session_no+'-'+key,name:label,
   text:'Tugasan sumber: '+g.task,bbm:'Buku Teks m/s '+p.page,pak21:p.pak,phase:'source-specific-teacher-plan'}];
 }
 const first=phases[0],last=phases[phases.length-1];
 return {...canonical,canonicalBm1:true,sourcePlanBm1:true,
  sourcePlanReviewStatus:'LESSON_MAP_EVIDENCE_NOT_WORD_APPROVED',
  sourcePlanTeacherReviewNeeded:true,sourcePlanVersion:VERSION,canonicalVersion:VERSION,
  sourcePlanSession:'BM1-2026B-W35-S'+map.session_no,
  sourceTask:p.task,anchor:p.task,phases,sourceSteps,classroomFlow:sourceSteps,
  librarySteps,differentiation,
  groupBbm:{support:'Buku Teks m/s '+p.page,core:'Buku Teks m/s '+p.page,challenge:'Buku Teks m/s '+p.page},
  bbmList:['Buku Teks m/s '+p.page],pak21:p.pak,pakDetail:p.pak,
  pbd:p.pbd,pbdEvidence:p.pbd,reflection:p.reflection,intervention:[],
  inductionData:{name:first.name,text:textStep(first,p.page),bbm:'Buku Teks m/s '+p.page,pak21:p.pak},
  setInduksi:textStep(first,p.page),penutup:textStep(last,p.page),
  diffSupportAct:differentiation.support.task,diffCoreAct:differentiation.core.task,
  diffChallengeAct:differentiation.challenge.task,
  page:'m/s '+p.page,mainSp:p.sp,topic:p.title
 };
}
root.BmYear1Week35SourcePlans={VERSION,availableSessions:[1,2,3,4,5],applies,build};
try{if(typeof module!=='undefined'&&module.exports)module.exports=root.BmYear1Week35SourcePlans}catch{}
})(typeof window!=='undefined'?window:globalThis);
