// Pelan PdP BM Tahun 1 Kumpulan B 2026 — Minggu 28. Buku Teks 103–108.
// Direka berpandukan tugas sumber dan lesson_maps verified; bukan Word guru diluluskan.
// Jangan membina pantun yang hilang dalam OCR, mencipta kandungan PKJR, atau
// menukar RPT/DSKP, Lesson Map, Accuracy Gate, Auth/RLS dan snapshot approved.
(function(root){
'use strict';
const VERSION='BM1-W28-SOURCE-PLANS-20261009i';
const norm=v=>String(v??'').replace(/\s+/g,' ').trim();
const S=(name,teacher,pupils,check)=>({name,teacher,pupils,check});
const G=(description,task,teacher,pupil_steps,question,answer,product,criterion,next_step)=>({
 description,task,teacher,pupil_steps,question,answer,product,criterion,next_step
});
const lessons={
1:{
 title:'Kamus Elektronik',sp:'1.2.1',page:103,
 anchors:['kamus elektronik','sebutan perkataan tepat','pelbagai bahasa'],
 task:'Bertutur dengan sebutan dan intonasi sesuai untuk menyampaikan tiga maklumat/kebaikan kamus elektronik berdasarkan gambar dan senarai Buku Teks m/s 103.',
 pak:'Lihat–Pilih–Terang: pasangan menguji kesepadanan fakta pada senarai, murid menyampaikan tiga respons sendiri.',
 stages:[
 S('Kenal kegunaan kamus elektronik',
 ['Buka Buku Teks m/s 103 dan tunjuk perbualan tentang kamus elektronik.','Ajukan soalan “Boleh ceritakan kelebihan kamus ini?” yang dicetak pada halaman.'],
 ['Menyebut nama peralatan.','Mengenal soalan yang perlu dijawab dengan maklumat sumber.'],
 'Respons awal belum dikira bukti penguasaan sebelum merujuk senarai.'),
 S('Cari empat maklumat daripada bahan',
 ['Bimbing murid menjejak empat maklumat nyata: sebutan perkataan tepat, pantas mencari makna, makna pelbagai bahasa dan mempunyai ayat contoh.','Minta murid menunjuk perkataan asal yang menyokong setiap ciri.'],
 ['Membaca frasa maklumat terpilih.','Menunjuk sekurang-kurangnya tiga frasa dengan betul.'],
 'Ciri disebut berdasarkan senarai sumber, bukan fungsi tambahan yang direka.'),
 S('Bezakan fungsi dengan sifat alat',
 ['Tunjukkan sifat lain yang dicatat: kuasa bateri, tahan lasak, ringan, mesra pengguna dan capaian pantas.','Bimbing murid memilih satu fungsi dan satu sifat tanpa menyamakan semuanya sebagai tindakan yang dilakukan alat.'],
 ['Menunjuk satu fungsi kamus.','Memilih satu sifat fizikal atau cara penggunaan daripada senarai.'],
 'Dua jenis maklumat dipilih daripada sumber sebenar.'),
 S('Latih tiga respons secara santun',
 ['Minta murid berlatih menjawab soalan tentang kelebihan kamus dengan sebutan dan intonasi jelas.','Modelkan pembuka “Kamus ini boleh ...” dan pastikan pasangan bergilir memberi respons, bukan mengulang jawapan sama.'],
 ['Menyatakan sekurang-kurangnya tiga maklumat yang berbeza.','Mendengar pasangan dan membetulkan sebutan kurang jelas.'],
 'Kandungan benar, tutur santun dan setiap respons dapat difahami.'),
 S('Semakan bertutur individu',
 ['Dengar setiap murid menyampaikan tiga respons sendiri dan catat kejelasan sebutan, intonasi dan kesahihan fakta.','Beri peluang cubaan kedua jika murid menggunakan ciri yang tidak wujud dalam senarai.'],
 ['Memberikan tiga respons lisan secara individu.','Menyemak semula satu respons dengan halaman 103.'],
 'PBD bertutur individu bukan hanya pengulangan suara pasangan.'),
 S('Rumusan manfaat kamus',
 ['Rumuskan kegunaan kamus sebagai alat mencari makna dan sebutan berpandukan buku.','Minta murid memilih satu maklumat yang paling membantu pembelajaran Bahasa Melayu serta menyatakan sebab ringkas.'],
 ['Menyebut satu manfaat berasaskan buku.','Memberi alasan yang boleh dikaitkan dengan senarai.'],
 'Rumusan tidak mewajibkan murid menggunakan peranti elektronik sebenar.')
 ],
 groups:{
 support:G('Petunjuk baris dan frasa yang lebih pendek.',
 'Sebut tiga kelebihan dengan bantuan teks dan rekod sokongan.',
 ['Tunjuk satu frasa pada satu masa.','Beri permulaan ayat tanpa melengkapkan tiga jawapan murid.'],
 ['Dengar soalan.','Jejak tiga ciri sumber.','Nyatakan tiga respons sendiri.'],
 'Kamus elektronik boleh membantu sebutan bagaimana?','Sebutan perkataan menjadi tepat.',
 'Tiga respons lisan dengan bantuan dicatat.','Tiga isi bersumber dan sebutan dapat difahami.',
 'Ulang respons salah sambil menunjuk bukti sebenar.'),
 core:G('Latihan berpasangan diikuti respons individu.',
 'Terangkan tiga fungsi/sifat kamus dengan ayat sendiri.',
 ['Minta tiga maklumat berbeza daripada senarai.','Dengar setiap murid tanpa bantuan pasangan.'],
 ['Teliti gambar dan senarai.','Pilih tiga maklumat.','Terangkan secara sendiri.'],
 'Apakah satu kelebihan mencari makna?', 'Pantas mencari makna perkataan.',
 'Tiga ayat respons lisan dengan fakta tepat.','Maklumat, intonasi dan kesantunan sesuai.',
 'Perkemas ayat yang maknanya kurang jelas.'),
 challenge:G('Bandingkan kelebihan penggunaan tanpa mendakwa ciri luar buku.',
 'Sampaikan tiga manfaat dan jelaskan satu sebab pilihan.',
 ['Minta bukti senarai bagi setiap manfaat.','Semak alasan murid berpunca daripada maklumat yang ditunjuk.'],
 ['Pilih tiga maklumat.','Terangkan kepada guru.','Jelaskan satu manfaat dengan alasan.'],
 'Mengapa makna pelbagai bahasa berguna?', 'Kamus menyediakan makna perkataan dalam pelbagai bahasa.',
 'Tiga maklumat dan satu alasan ringkas.','Isi disokong bahan dan sebab munasabah.',
 'Baiki justifikasi yang tiada bukti.')
 },
 pbd:{method:'Pemerhatian tiga respons bertutur individu tentang kamus elektronik.',
 evidence:'Tiga ciri/fungsi yang tercatat pada Buku Teks m/s 103, dengan sebutan, intonasi dan kesantunan yang diperhatikan.',
 criterion:'Tiga maklumat tepat, disampaikan jelas dan santun.'},
 reflection:'Murid disemak: ____ / ____. Tiga respons tepat: ____. Sebutan/intonasi jelas: ____. Bantuan diperlukan: ____. Susulan: ____.'
},
2:{
 title:'Kami Memudahkan Kerja',sp:'2.3.1',page:104,
 anchors:['kami memudahkan kerja','mesin basuh','pembersih vakum','habuk'],
 task:'Membaca teks mesin basuh dan pembersih vakum serta mengenal pasti tiga maklumat tentang fungsi, sumber tenaga dan keistimewaan peralatan berdasarkan Buku Teks m/s 104.',
 pak:'Baca–Banding–Buktikan: murid membanding kegunaan dua peralatan dan menunjukkan bukti pada ayat sumber.',
 stages:[
 S('Kenal dua peralatan dalam teks',
 ['Buka Buku Teks m/s 104 dan baca tajuk Kami Memudahkan Kerja.','Tunjukkan watak “Aku” mesin basuh serta pembersih vakum dalam petikan.'],
 ['Menamakan dua peralatan.','Menunjuk bahagian teks setiap peralatan.'],
 'Peralatan tidak disamakan: mesin basuh pakaian, pembersih vakum untuk habuk/sampah.'),
 S('Baca fungsi mesin basuh',
 ['Bimbing murid membaca perenggan mesin basuh yang menggunakan elektrik.','Arahkan murid mencari maklumat membasuh dengan cepat dan mengeringkan pakaian.'],
 ['Membaca frasa terpilih.','Menyatakan fungsi mesin basuh dengan bukti.'],
 'Fungsi dan sumber kuasa disokong ayat perenggan mesin basuh.'),
 S('Baca fungsi pembersih vakum',
 ['Bimbing bacaan bahawa pembersih vakum menyedut habuk dan sampah.','Minta murid menunjukkan ayat tentang membersihkan lantai dan siling rumah serta tenaga elektrik.'],
 ['Membaca bahagian vakum.','Menyebut kegunaan vakum dengan tepat.'],
 'Tidak mencampur fungsi vakum dengan fungsi pengering pakaian.'),
 S('Padankan peralatan, kegunaan dan keistimewaan',
 ['Rujuk carta/label pada halaman asal untuk memadankan nama alat dengan kegunaan dan keistimewaan.','Gunakan tiga padanan yang boleh dibuktikan melalui teks, tanpa menyimpulkan kedudukan carta daripada OCR sahaja.'],
 ['Memadankan maklumat dengan peralatan sebenar.','Menyebut satu persamaan dan satu perbezaan kegunaan.'],
 'Padanan diuji dengan frasa asal; susun atur carta perlu diperiksa pada buku bercetak.'),
 S('Semakan membaca dan tiga isi individu',
 ['Dengar murid membaca frasa daripada kedua-dua bahagian, kemudian menyebut tiga isi tepat.','Rekod bacaan, kefahaman tiga maklumat dan bantuan yang diterima secara individu.'],
 ['Membaca bahagian terpilih.','Menyatakan tiga maklumat dan menunjukkan bukti ayat.'],
 'PBD individu bukannya jawapan kumpulan yang dibaca bersama.'),
 S('Rumuskan peralatan membantu kerja',
 ['Rumuskan perbezaan kerja mesin basuh dengan pembersih vakum berdasarkan sumber.','Minta murid menyebut satu sebab kedua-duanya memudahkan kerja manusia.'],
 ['Menyatakan satu kegunaan dan satu manfaat.','Menunjuk ayat yang menyokong rumusan.'],
 'Penutup berpaut pada teks, bukan penggunaan peralatan elektrik sebenar.')
 ],
 groups:{
 support:G('Petikan dibahagi kepada peralatan berasingan.',
 'Baca frasa terpilih dan nyatakan tiga maklumat alat dengan bimbingan.',
 ['Tunjuk nama alat dan ayat kegunaan.','Dengar bacaan sendiri selepas model perlahan.'],
 ['Baca frasa mesin basuh.','Sebut fungsi.','Baca frasa vakum.','Lengkapkan tiga isi.'],
 'Apakah kerja pembersih vakum?', 'Menyedut habuk dan sampah.',
 'Bacaan dan tiga isi sendiri dengan bantuan direkod.','Maklumat alat tidak bercampur.',
 'Ulang satu frasa yang tersalah fungsi.'),
 core:G('Pasangan menyemak fakta, PBD tetap individu.',
 'Baca dan banding tiga fungsi/keistimewaan.',
 ['Minta murid mencari satu ayat bukti bagi setiap alat.','Semak isi individu selepas latihan.'],
 ['Baca kedua-dua perenggan.','Cari tiga fakta.','Terangkan satu beza kegunaan.'],
 'Peralatan mana membasuh pakaian dengan cepat?', 'Mesin basuh.',
 'Tiga fakta dan bukti bacaan individu.','Kegunaan serta peralatan dipadankan betul.',
 'Betulkan satu isi yang tersalah alat.'),
 challenge:G('Bandingkan alat menggunakan bukti tanpa menambah fungsi rekaan.',
 'Terangkan sekurang-kurangnya tiga fakta dan satu persamaan tenaga.',
 ['Minta murid tunjuk kedua-dua ayat tentang elektrik.','Bezakan jenis kerja walaupun kedua-duanya membantu manusia.'],
 ['Baca teks.','Pilih tiga isi.','Terangkan persamaan dan perbezaan.'],
 'Apakah persamaan kedua-dua alat?', 'Kedua-duanya menggunakan tenaga elektrik.',
 'Tiga isi serta satu perbandingan terbukti.','Maklumat disokong frasa buku.',
 'Perkemas perbandingan yang tidak mempunyai bukti.')
 },
 pbd:{method:'Semakan bacaan dan tiga maklumat teks secara individu.',
 evidence:'Tiga isi benar tentang mesin basuh/pembersih vakum, kegunaan dan tenaga elektrik, dengan ayat bukti pada m/s 104.',
 criterion:'Murid membaca bahagian dipilih dan menyatakan tiga maklumat tepat.'},
 reflection:'Murid disemak: ____ / ____. Bacaan jelas: ____. Tiga isi tepat: ____. Keliru fungsi dua alat: ____. Susulan: ____.'
},
3:{
 title:'Pintu Pagar Automatik + PKJR',sp:'3.2.1',page:106,
 anchors:['pintu pagar automatik','kawalan jauh','hujan','automatik'],
 task:'Membina dan menulis ayat berdasarkan gambar dan empat frasa “pasang pintu pagar automatik”, “guna alat kawalan jauh”, “buka secara automatik”, “tutup secara automatik” dalam Buku Teks m/s 106.',
 pak:'Baca–Rujuk–Tulis: pasangan menyemak kesepadanan frasa–gambar, kemudian murid menulis ayat sendiri.',
 stages:[
 S('Fahami masalah hujan dalam cerita',
 ['Buka Buku Teks m/s 106 dan bacakan petikan keluarga yang tiba di rumah ketika hujan lebat.','Tanya sebab ibu basah kuyup walaupun menggunakan payung.'],
 ['Membaca petikan awal.','Menyebut masalah membuka pintu pagar.'],
 'Masalah yang dinyatakan ialah membuka pintu pagar semasa hujan.'),
 S('Cari idea ayah berdasarkan gambar',
 ['Baca ayat tentang ayah mendapat idea.','Tunjukkan empat frasa yang dicetak berkaitan pemasangan, alat kawalan jauh serta pembukaan dan penutupan automatik.'],
 ['Menunjuk perkataan kunci frasa.','Menyatakan kaitan alat dengan masalah ibu.'],
 'Murid berpandu kepada gambar dan frasa, bukan merancang pemasangan sebenar.'),
 S('Padankan frasa kepada urutan gambar',
 ['Minta murid meneliti urutan gambar bercetak dan label frasa yang sesuai.','Jelaskan OCR hanya menangkap teks, jadi susunan imej mesti disahkan pada buku asal.'],
 ['Memadankan empat frasa dengan gambar.','Menyebut urutan menurut imej asal.'],
 'Susunan gambar diperiksa pada halaman, bukan diteka melalui turutan OCR.'),
 S('Bina dan tulis sekurang-kurangnya tiga ayat',
 ['Modelkan satu rangka daripada frasa “guna alat kawalan jauh” dan minta murid membina ayat sendiri.','Minta murid menulis sekurang-kurangnya tiga ayat lengkap yang sesuai dengan gambar, huruf besar dan noktah.'],
 ['Membina ayat lisan sebelum menulis.','Menulis tiga ayat individu dan menyemak tanda baca.'],
 'Ayat lengkap berasaskan gambar/frasa, bukan menyenaraikan frasa tanpa ayat.'),
 S('Semak tulisan secara individu',
 ['Semak tiga ayat dan padanan imej–frasa bagi setiap murid.','Minta murid membetulkan fakta gambar atau struktur ayat yang kurang lengkap.'],
 ['Membaca hasil tulisan sendiri.','Membetulkan satu ayat selepas maklum balas.'],
 'PBD berdasarkan hasil murid, bukan pembinaan pagar automatik secara fizikal.'),
 S('Rumusan teknologi memudahkan kerja',
 ['Rumuskan tujuan pintu pagar automatik dan ayat yang ditulis murid.','Ingatkan bahawa tajuk +PKJR tidak menyediakan bukti unit PKJR khusus bagi sesi ini.'],
 ['Menyatakan satu sebab teknologi memudahkan keluarga.','Membaca satu ayat yang telah dibetulkan.'],
 'Penutup pada kemahiran menulis SP 3.2.1 dan halaman 106.')
 ],
 groups:{
 support:G('Rangka ayat berdasarkan satu gambar setiap giliran.',
 'Tulis tiga ayat dari frasa sumber dengan sokongan.',
 ['Baca satu frasa bersama murid.','Beri petunjuk subjek/predikat, bukan jawapan lengkap.'],
 ['Cari gambar sesuai.','Baca frasa.','Lengkapkan dan tulis tiga ayat.'],
 'Apakah alat yang digunakan untuk membuka pagar?', 'Alat kawalan jauh.',
 'Tiga ayat individu dengan bantuan dicatat.','Tiga ayat lengkap dan padan gambar.',
 'Ulang satu ayat yang belum bersesuaian.'),
 core:G('Padankan frasa dengan gambar dan tulis ayat secara individu.',
 'Tulis sekurang-kurangnya tiga ayat berbeza dengan fakta tepat.',
 ['Semak padanan frasa-gambar berdasarkan buku.','Beri maklum balas pada struktur ayat individu.'],
 ['Teliti gambar.','Pilih tiga frasa.','Tulis tiga ayat.','Semak noktah.'],
 'Bagaimanakah pintu pagar dibuka?', 'Pintu pagar dibuka dengan alat kawalan jauh.',
 'Tiga ayat hasil sendiri.','Maklumat sepadan gambar dan tanda baca betul.',
 'Baiki ayat yang tidak menyatakan idea lengkap.'),
 challenge:G('Huraikan urutan yang sebenar pada gambar tanpa mereka-reka teknologi.',
 'Bina tiga ayat dan jelaskan satu hubungan tindakan dalam cerita.',
 ['Minta bukti gambar bagi satu turutan.','Pastikan murid tidak mencipta fungsi teknikal tambahan.'],
 ['Tulis tiga ayat.','Jelaskan kaitan dengan masalah hujan.','Tunjuk bukti frasa.'],
 'Mengapakah keluarga memerlukan pintu pagar automatik?', 'Untuk memudahkan mereka membuka pagar ketika hujan.',
 'Tiga ayat dan satu alasan berasaskan situasi.','Ayat tepat dan alasan berpandukan petikan.',
 'Perkemas ayat yang menambah fungsi tidak disebut.')
 },
 pbd:{method:'Semakan tiga ayat bertulis individu berdasarkan gambar dan frasa halaman 106.',
 evidence:'Tiga ayat lengkap berasaskan pemasangan pagar automatik, alat kawalan jauh, pembukaan atau penutupan automatik.',
 criterion:'Tiga ayat yang gramatis, sepadan gambar/frasa dan mempunyai tanda baca yang betul.'},
 reflection:'Murid disemak: ____ / ____. Tiga ayat tepat: ____. Padanan gambar/frasa: ____. Bantuan struktur ayat: ____. Susulan: ____.'
},
4:{
 title:'Hebat Teknologi',sp:'4.2.1',page:107,
 anchors:['hebat teknologi','pantun empat kerat','teknologi','kerja yang berat menjadi ringan'],
 task:'Membina atau melengkapkan pantun empat kerat secara terkawal menggunakan baris yang bercetak pada Buku Teks m/s 107 dan melafazkannya dengan sebutan serta intonasi yang betul.',
 pak:'Baca–Lengkap–Lafaz: murid semak kerat yang benar-benar dicetak dan mempersembahkan pantun sendiri.',
 stages:[
 S('Kenal bentuk pantun empat kerat',
 ['Buka Buku Teks m/s 107 dan baca tajuk Hebat Teknologi.','Tunjuk empat kerat pada rangkap yang lengkap sebagai model, kemudian bezakan bahagian berisi tempat kosong.'],
 ['Menunjuk rangkap lengkap dan bahagian yang perlu dilengkapkan.','Menyatakan satu kegunaan teknologi daripada baris isi.'],
 'Empat baris satu rangkap; jangan cipta teks kerat asal yang tiada dalam OCR.'),
 S('Baca kerat bercetak dan kenal tema',
 ['Bimbing murid melafazkan baris bercetak seperti “Kerja yang lambat menjadi cepat” dan “Kerja yang berat menjadi ringan”.','Tanya isi manfaat teknologi yang dikandung oleh rangkap.'],
 ['Melafazkan satu rangkap lengkap dengan bimbingan.','Menyebut satu makna daripada isi rangkap.'],
 'Bacaan berdasarkan teks sumber dan bukan tambahan pantun ciptaan guru.'),
 S('Periksa pantun yang mempunyai ruang kosong',
 ['Tunjukkan rangkap yang belum lengkap dan minta murid merujuk sajak bunyi serta konteks asal pada halaman.','Bimbing idea calon baris; jelaskan murid menghasilkan pelengkap baharu, bukan memulihkan baris asal yang tidak muncul dalam OCR.'],
 ['Membaca kerat yang ada.','Mencadangkan kerat pelengkap dalam ayat ringkas.'],
 'Baris yang ditambah dilabel hasil murid, bukan petikan literal teks.'),
 S('Bina dan semak satu rangkap sendiri',
 ['Beri peluang setiap murid melengkapkan sekurang-kurangnya satu rangkap menggunakan kerat dan petunjuk pada buku asal.','Semak bilangan kerat dan hubungan makna serta rima secara asas, tanpa menyalin jawapan murid lain.'],
 ['Menulis/memilih pelengkap sendiri.','Menyemak kesesuaian makna dan kerat.'],
 'Satu rangkap terkawal terhasil dengan isi berkaitan teknologi.'),
 S('Semakan lafaz individu',
 ['Dengar murid melafazkan pantun yang lengkap dengan sebutan dan intonasi.','Catat baris yang boleh dilafaz jelas, kelengkapan rangkap dan bantuan yang digunakan.'],
 ['Melafazkan rangkap sendiri.','Membaiki sebutan dan intonasi selepas maklum balas.'],
 'PBD ialah lafaz pantun individu dan hasil pelengkap terkawal.'),
 S('Rumusan manfaat teknologi',
 ['Minta murid menyatakan satu kebaikan teknologi daripada isi pantun yang disebut sumber.','Rumuskan perbezaan kerat sumber dan pelengkap ciptaan murid.'],
 ['Menyatakan satu isi pantun tepat.','Menunjukkan satu kerat hasil sendiri.'],
 'Penutup berasaskan pembinaan dan lafaz pantun, bukan persembahan lagu.')
 ],
 groups:{
 support:G('Baca satu kerat pada satu masa dan gunakan rangka pelengkap.',
 'Melengkapkan satu rangkap serta melafazkannya dengan bantuan.',
 ['Tunjukkan baris bercetak dan tempat kosong.','Beri pilihan tema/rima mudah dan kurangkan bantuan.'],
 ['Baca kerat sumber.','Pilih pelengkap yang sesuai.','Lafaz satu rangkap.'],
 'Apakah isi manfaat teknologi dalam pantun?', 'Kerja yang berat menjadi ringan.',
 'Rangkap lengkap serta lafaz individu dengan bantuan dicatat.','Kerat lengkap dan sebutan boleh difahami.',
 'Ulang kerat sukar mengikut model guru.'),
 core:G('Murid menyemak kerat bersama pasangan sebelum melafaz sendiri.',
 'Membina pelengkap pantun satu rangkap dan melafazkannya.',
 ['Semak empat kerat dan isi berkaitan teknologi.','Dengar lafaz individu selepas latihan.'],
 ['Baca teks.','Lengkapkan satu rangkap.','Semak makna.','Lafaz sendiri.'],
 'Apakah tema dalam rangkap ini?', 'Teknologi memudahkan kerja manusia.',
 'Pantun lengkap dan lafaz individu.','Empat kerat, tema relevan, sebutan dan intonasi sesuai.',
 'Perkemas pelengkap yang tidak membawa maksud.'),
 challenge:G('Perjelas sebab kerat pelengkap sesuai dengan tema dan rima.',
 'Melengkapkan rangkap dan menerangkan satu pilihan baris.',
 ['Minta alasan mudah tentang makna/rima calon kerat.','Pastikan pelengkap tidak disalah anggap petikan asal.'],
 ['Baca kerat bercetak.','Cadangkan pelengkap.','Jelaskan maksud.','Lafazkan dengan jelas.'],
 'Mengapakah kerat ini sesuai?', 'Kerat itu masih menerangkan manfaat teknologi.',
 'Rangkap sendiri dengan justifikasi satu kerat dan lafaz.','Makna berkaitan teknologi dan kerat sepadan dalam rangkap.',
 'Perbaiki kerat yang maknanya menyimpang daripada tema.')
 },
 pbd:{method:'Semakan pantun terkawal individu dan pemerhatian lafaz dengan sebutan/intonasi.',
 evidence:'Sekurang-kurangnya satu rangkap empat kerat yang dilengkapkan serta dilafazkan sendiri menggunakan teks sumber dan pelengkap yang dikenal pasti sebagai karya murid.',
 criterion:'Rangkap lengkap, tema jelas dan lafaz mempunyai sebutan serta intonasi sesuai.'},
 reflection:'Murid disemak: ____ / ____. Rangkap lengkap: ____. Lafaz jelas: ____. Bantuan pelengkap: ____. Susulan: ____.'
},
5:{
 title:'Basikal Solar',sp:'5.3.1',page:108,
 anchors:['basikal solar','ayat seruan','amboi','cahaya matahari'],
 task:'Membina sekurang-kurangnya tiga ayat seruan berdasarkan gambar basikal solar dan kata seru wah, eh, oh serta amboi pada Buku Teks m/s 108.',
 pak:'Cari–Padan–Bina: murid membezakan ayat seruan tercetak dan ayat baharu, kemudian menulis sendiri.',
 stages:[
 S('Kenal gambar dan teknologi basikal solar',
 ['Buka Buku Teks m/s 108 dan baca tajuk Basikal Solar serta dialog Mariah, Kanang dan Kalang.','Tanya sumber tenaga basikal yang dinyatakan sebagai cahaya matahari.'],
 ['Menunjuk gambar.','Menyebut satu maklumat basikal daripada dialog.'],
 'Keterangan tenaga berasal daripada bahan, bukan andaian tentang pembinaan basikal.'),
 S('Cari kata seru dan ayat bercetak',
 ['Tunjukkan wah, eh, oh dan amboi serta ayat “Wah, hebatnya basikal solar ini!” dan “Amboi, laju sungguh basikal solar ini!”.','Baca ayat dengan intonasi sesuai dan cari tanda seru.'],
 ['Membaca dua ayat seruan yang dicetak.','Menunjukkan kata seru yang digunakan.'],
 'Ayat tanya “Apakah yang kamu berdua lihat?” bukan ayat seruan.'),
 S('Padankan ungkapan dengan perasaan',
 ['Terangkan fungsi ayat seruan seperti hairan atau kagum berdasarkan contoh pada halaman.','Minta murid menunjukkan ujaran sumber yang mencerminkan rasa kagum atau terkejut.'],
 ['Memilih kata seru daripada senarai.','Menyatakan perasaan yang bersesuaian dengan ujaran.'],
 'Perasaan relevan konteks dan ayat mempunyai tanda seru.'),
 S('Bina tiga ayat seruan baharu',
 ['Minta murid membina sekurang-kurangnya tiga ayat seruan baharu berpandukan gambar dan maklumat teks.','Ingatkan kata seru sesuai, penggunaan koma jika perlu, tanda seru dan perbezaan ayat binaan daripada petikan asal.'],
 ['Menulis tiga ayat seruan sendiri.','Menyemak bentuk dan makna setiap ayat.'],
 'Ayat menyatakan perasaan dan bukan pertanyaan atau pernyataan biasa.'),
 S('Semakan ayat dan lafaz individu',
 ['Semak tiga ayat baharu serta satu lafaz dengan intonasi sesuai bagi setiap murid.','Minta murid membetulkan satu ayat tersalah fungsi atau tanda baca.'],
 ['Membaca salah satu ayat seruan sendiri.','Membaiki ayat yang perlu disemak.'],
 'PBD ialah tiga ayat seruan hasil murid dan lafaz, bukan hanya mencari kata wah.'),
 S('Rumusan fungsi seruan',
 ['Rumuskan fungsi ayat seruan dan tanda seru dengan contoh daripada dialog basikal solar.','Minta murid menyatakan satu beza ayat seruan dengan ayat tanya pada halaman.'],
 ['Menyebut satu contoh kata seru.','Menjelaskan sebab ia digunakan.'],
 'Penutup fokus SP tatabahasa ayat seruan.')
 ],
 groups:{
 support:G('Bantu pilih kata seru daripada senarai dan rangka ayat.',
 'Bina tiga ayat seruan dengan bantuan yang dicatat.',
 ['Baca dua contoh bercetak.','Beri rangka tanpa mengisi semua jawapan murid.'],
 ['Pilih kata seru.','Tulis tiga ayat.','Baca satu ayat sendiri.'],
 'Apakah kata seru dalam ayat “Wah, hebatnya basikal solar ini!”?', 'Wah.',
 'Tiga ayat hasil sendiri dan bantuan direkod.','Ayat menunjukkan perasaan dan bertanda seru.',
 'Ulang satu ayat yang masih berbentuk ayat tanya.'),
 core:G('Pasangan mencari contoh, tetapi ayat akhir ialah tulisan sendiri.',
 'Bina tiga ayat seruan berlainan berdasarkan gambar.',
 ['Semak fungsi kata seru.','Dengar murid melafaz satu ayat sendiri.'],
 ['Teliti contoh.','Pilih tiga kata seru.','Tulis tiga ayat.','Semak tanda seru.'],
 'Apakah kata seru yang boleh menunjukkan rasa kagum?', 'Amboi.',
 'Tiga ayat seruan individu.','Fungsi dan tanda baca sesuai konteks.',
 'Perkemas satu ayat yang kurang tepat.'),
 challenge:G('Jelaskan perbezaan ayat tanya dan seruan tanpa mengubah tugasan.',
 'Tulis tiga ayat seruan dengan perasaan berlainan dan jelaskan satu fungsi.',
 ['Banding ayat Apakah yang kamu berdua lihat? dengan ayat wah.','Minta alasan bagi kata seru dipilih.'],
 ['Tulis tiga ayat seruan.','Baca dengan intonasi.','Jelaskan fungsi satu ayat.'],
 'Mengapakah “Apakah yang kamu berdua lihat?” bukan ayat seruan?', 'Ayat itu ialah ayat tanya yang meminta jawapan.',
 'Tiga ayat dan satu penjelasan jenis ayat.','Pilihan kata seru dan intonasi tepat.',
 'Semak semula ayat yang tiada unsur perasaan.')
 },
 pbd:{method:'Semakan tiga ayat seruan individu dan bacaan berintonasi.',
 evidence:'Tiga ayat baharu yang menzahirkan perasaan menggunakan kata seru yang sesuai berpandukan basikal solar dan gambar halaman 108.',
 criterion:'Tiga ayat seruan tepat dengan tanda seru dan satu ayat dilafaz jelas.'},
 reflection:'Murid disemak: ____ / ____. Tiga ayat seruan tepat: ____. Intonasi sesuai: ____. Keliru ayat tanya: ____. Susulan: ____.'
}
};
function applies(map,opts={}){
 const p=lessons[Number(map?.session_no)];if(!p)return false;
 const meta=map?.source_evidence?.meta||{},key=opts.subjectKey||map?.subject_key
  ||(typeof root.rphSubjectKey==='function'?root.rphSubjectKey(map?.subject_id):'');
 const book=norm(map?.source_evidence?.textbook?.text).toLowerCase();
 return key==='bm'&&Number(map?.year)===1&&Number(map?.academic_year)===2026
  &&Number(map?.week_no)===28&&map?.verification_status==='verified'
  &&map?.week_exact===true&&map?.sp_crosscheck===true&&meta.session_exact===true
  &&meta.page_route_verified===true&&norm(meta.main_sp||map?.sp)===p.sp
  &&norm(map?.sp)===p.sp&&Number(map?.textbook_page_start)===p.page
  &&Number(map?.textbook_page_end||p.page)===p.page
  &&norm(map?.title).toLowerCase()===p.title.toLowerCase()
  &&p.anchors.every(a=>book.includes(a));
}
function format(p,page){
 return 'Tindakan guru: '+p.teacher.join('\n')+'\nTindakan murid: '+p.pupils.join('\n')
 +'\nSemakan: '+p.check+'\nBahan: Buku Teks m/s '+page;
}
function build(map,opts={}){
 if(!applies(map,opts))throw Error('BM1_WEEK28_SOURCE_PLAN_SCOPE_MISMATCH');
 const p=lessons[Number(map.session_no)],canonical=root.BmYear1CanonicalRph?.build(map,opts);
 if(!canonical)throw Error('BM1_CANONICAL_ENGINE_REQUIRED');
 const phases=p.stages.map(x=>({...x,resources:['Buku Teks m/s '+p.page]}));
 const sourceSteps=phases.map((x,i)=>({key:'bm1-w28-s'+map.session_no+'-step-'+(i+1),
  name:x.name,text:format(x,p.page),bbm:'Buku Teks m/s '+p.page,pak21:p.pak,
  phase:'source-specific-teacher-design'}));
 const differentiation={},librarySteps={};
 for(const key of ['support','core','challenge']){
  const g=p.groups[key],label={support:'Peneroka',core:'Pembina',challenge:'Pencabar'}[key];
  differentiation[key]={label,support_description:g.description,task:g.task,
   materials:['Buku Teks m/s '+p.page],teacher:g.teacher,pupil_steps:g.pupil_steps,
   example:{teacher:g.question,pupil:g.answer},product:g.product,criterion:g.criterion,next_step:g.next_step};
  librarySteps[key]=[{key:'bm1-w28-s'+map.session_no+'-'+key,name:label,
   text:'Tugasan sumber: '+g.task,bbm:'Buku Teks m/s '+p.page,pak21:p.pak,phase:'source-specific-teacher-design'}];
 }
 const first=phases[0],last=phases[phases.length-1];
 return {...canonical,canonicalBm1:true,sourcePlanBm1:true,
  sourcePlanReviewStatus:'LESSON_MAP_EVIDENCE_NOT_WORD_APPROVED',
  sourcePlanTeacherReviewNeeded:true,sourcePlanSession:'BM1-2026B-W28-S'+map.session_no,
  sourcePlanVersion:VERSION,canonicalVersion:VERSION,sourceTask:p.task,anchor:p.task,
  phases,sourceSteps,classroomFlow:sourceSteps,librarySteps,differentiation,
  groupBbm:{support:'Buku Teks m/s '+p.page,core:'Buku Teks m/s '+p.page,challenge:'Buku Teks m/s '+p.page},
  bbmList:['Buku Teks m/s '+p.page],pak21:p.pak,pakDetail:p.pak,pbd:p.pbd,pbdEvidence:p.pbd,
  reflection:p.reflection,intervention:[],
  inductionData:{name:first.name,text:format(first,p.page),bbm:'Buku Teks m/s '+p.page,pak21:p.pak},
  setInduksi:format(first,p.page),penutup:format(last,p.page),
  diffSupportAct:differentiation.support.task,diffCoreAct:differentiation.core.task,
  diffChallengeAct:differentiation.challenge.task,
  page:'m/s '+p.page,mainSp:p.sp,topic:p.title,
  pkjrStatus:Number(map.session_no)===3?'PKJR_TITLE_ONLY_NO_VERIFIED_PKJR_SOURCE':null
 };
}
root.BmYear1Week28SourcePlans={VERSION,availableSessions:[1,2,3,4,5],applies,build};
try{if(typeof module!=='undefined'&&module.exports)module.exports=root.BmYear1Week28SourcePlans}catch{}
})(typeof window!=='undefined'?window:globalThis);
