// BM Tahun 1 / Kumpulan B / Minggu 31, source-specific lesson plans.
// Evidence: verified Lesson Map + textbook text from BT m/s 118-122 + RPT/DSKP.
// The six pedagogical phases are teacher-designed, NOT six printed textbook steps.
// NOT a teacher-approved Word snapshot and does not mutate Lesson Map or approval state.
(function(root){
'use strict';
const VERSION='BM1-W31-SOURCE-PLANS-20261009b';
const norm=x=>String(x??'').replace(/\s+/g,' ').trim();
const join=x=>Array.isArray(x)?x.filter(Boolean).join('\n'):String(x??'');
const P=(name,teacher,pupils,check)=>({name,teacher,pupils,check});
const plans={
  1:{
    title:'Uruslah Saya',sp:'1.1.2',page:118,anchors:['uruslah saya','buangkan','sampah','asingkan'],
    task:'Memberikan respons lisan terhadap soalan tentang sebab dan cara mengurus sampah berdasarkan dialog ibu dan Indira pada Buku Teks m/s 118.',
    pak21:'Dengar–Respons–Semak: pasangan bergilir menjadi penanya dan pemberi respons, kemudian guru mendengar jawapan individu.',
    phases:[
      P('Cetus respons tentang pengurusan sampah',[
        'Paparkan dialog “Uruslah Saya” pada halaman 118 dan minta murid memerhati situasi ibu meminta Indira membuang sampah.',
        'Tanya siapa bercakap dan suruhan yang diberi tanpa menambah langkah yang tidak ditulis di buku.'
      ],['Menunjukkan watak ibu dan Indira.','Menyebut tindakan yang diminta ibu.'],
        'Murid mengenal situasi suruhan dan respons awal yang sesuai.'),
      P('Dengar dialog dan kenal pasti soalan',[
        'Bacakan dialog ibu dan Indira dengan sebutan yang jelas, kemudian ulang bahagian soalan yang muncul dalam petikan.',
        'Bimbing murid mengenal pasti soalan sebab (mengapakah) dan cara (bagaimanakah).'
      ],['Mendengar dialog dan menjejak baris.','Membezakan soalan sebab dan soalan cara dengan menunjukkan bahagian teks.'],
        'Murid memadankan soalan kepada maklumat yang disoal, bukan menghafal jawapan.'),
      P('Respons tentang sebab membuang sampah',[
        'Ajukan soalan mengapa sampah perlu dibuang dan minta murid mencari sebab dalam dialog.',
        'Bimbing murid menjawab menggunakan maklumat kebersihan rumah, kemudian minta ayat lengkap sendiri.'
      ],['Menyebut sebab sampah perlu dibuang.','Menunjukkan bahagian dialog tentang rumah bersih.'],
        'Jawapan tepat berdasarkan dialog: supaya rumah bersih.'),
      P('Jelaskan cara mengurus sampah',[
        'Tunjukkan label mengasingkan sampah mengikut jenis dan mengikat beg plastik yang dicatat pada gambar sumber.',
        'Minta murid memberi respons terhadap soalan cara mengurus sampah mengikut maklumat yang dapat disahkan pada halaman.'
      ],['Menunjuk dua petunjuk yang terdapat pada gambar.','Menerangkan cara dengan urutan mudah tanpa mereka-reka sambungan ayat kosong.'],
        'Maklumat urutan dinilai berdasarkan bukti bercetak; tempat kosong dalam OCR bukan bukti langkah tambahan.'),
      P('Giliran respons individu',[
        'Dengar setiap murid memberikan tiga respons: suruhan ibu, sebab membuang sampah dan satu cara yang ditunjukkan sumber.',
        'Catat maklumat tepat dan bantuan yang diterima, kemudian beri peluang pembetulan lisan.'
      ],['Menjawab tiga soalan secara sendiri.','Membaiki respons yang kurang sesuai selepas petunjuk guru.'],
        'PBD ialah respons lisan murid sendiri; jawapan pasangan tidak dianggap bukti individu.'),
      P('Penutup: tanggungjawab menjaga kebersihan',[
        'Rumuskan cara mengurus sampah yang tercatat dan kaitkan kepada kebersihan rumah.',
        'Minta murid menyatakan satu respons lengkap tentang amalan yang dipelajari.'
      ],['Menyebut satu sebab menjaga kebersihan.','Menyatakan satu cara mengurus sampah berdasarkan sumber.'],
        'Rumusan kembali kepada soalan dan respons daripada dialog m/s 118.')
    ],
    groups:{
      support:{
        desc:'Soalan sebab dan cara diberikan satu demi satu dengan petunjuk dialog.',
        task:'Memberikan tiga respons pendek berpandukan dialog dengan bantuan yang dicatat.',
        teacher:['Bacakan soalan satu demi satu dan tunjukkan perkataan penting pada halaman.','Berikan rangka ayat tanpa menjawab bagi pihak murid.'],
        pupils:['Dengar soalan dan tunjuk bahagian dialog.','Jawab dengan ayat pendek.','Ulang tiga respons selepas bantuan dikurangkan.'],
        question:'Mengapakah kita membuang sampah?',answer:'Supaya rumah bersih.',
        product:'Tiga respons lisan individu; tahap bantuan direkod.',criterion:'Respons sepadan dengan dialog tentang suruhan, sebab dan cara.',next:'Ulang soalan yang tidak dapat dijawab sambil menunjuk bukti pada halaman.'
      },
      core:{
        desc:'Pasangan menyemak soalan dan isi sebelum setiap murid menjawab sendiri.',
        task:'Menjawab soalan suruhan, sebab dan cara dengan ayat sesuai berdasarkan teks.',
        teacher:['Minta pasangan bertanya dan menjawab dengan merujuk dialog.','Dengar respons akhir setiap murid tanpa pembayang jawapan rakan.'],
        pupils:['Dengar dan kenal soalan.','Jawab sebab dan cara.','Tukar peranan pasangan.','Jawab sendiri kepada guru.'],
        question:'Bagaimanakah cara mengurus sampah menurut halaman ini?',answer:'Asingkan sampah mengikut jenisnya.',
        product:'Tiga jawapan lisan yang jelas berdasarkan petikan.',criterion:'Maklumat tentang suruhan, sebab dan cara tepat serta mudah difahami.',next:'Baiki satu respons yang tidak lengkap dengan merujuk semula dialog.'
      },
      challenge:{
        desc:'Murid membandingkan kesesuaian respons tanpa menambah aktiviti di luar SP.',
        task:'Menjawab tiga soalan dan menjelaskan satu bukti bagi cara mengurus sampah.',
        teacher:['Minta murid menunjukkan bahagian dialog atau gambar yang menyokong jawapan.','Bezakan respons sopan terhadap suruhan dan respons kepada soalan.'],
        pupils:['Berikan respons terhadap suruhan.','Jelaskan sebab dan cara.','Tunjukkan bukti petikan bagi satu jawapan.'],
        question:'Apakah respons sopan Indira apabila ibu meminta pertolongan?',answer:'Baik, ibu. Saya akan membuang sampah itu.',
        product:'Respons lisan lengkap berserta satu petunjuk teks.',criterion:'Jawapan sesuai konteks dan bersandarkan dialog sebenar.',next:'Perkemas ayat jawapan tanpa menambah maklumat yang tidak ada dalam petikan.'
      }
    },
    pbd:{method:'Pemerhatian serta soal jawab lisan individu tentang soalan berdasarkan dialog.',
      evidence:'Tiga respons individu yang menyatakan suruhan, sebab membuang sampah dan cara mengurusnya; bantuan direkod.',
      criterion:'Jawapan relevan dengan dialog/gambar dan urutan sebab serta cara dapat dijelaskan.'},
    reflection:'Murid disemak: ____ / ____. Tiga respons tepat: ____. Membezakan soalan sebab/cara: ____. Bantuan dialog diperlukan: ____. Susulan: ____.'
  },
  2:{
    title:'Sungai',sp:'2.3.1',page:119,anchors:['sungai','gunung','gerakan','laut'],
    task:'Membaca dan menyatakan maklumat daripada seni kata lagu “Sungai” serta membuat gerakan yang sepadan dengan maksud pada Buku Teks m/s 119.',
    pak21:'Baca–Tafsir–Gerak: pasangan menjelaskan maksud ringkas baris lagu, kemudian setiap murid menunjukkan gerakan sendiri.',
    phases:[
      P('Kenal tajuk serta tema sungai',[
        'Tunjukkan halaman 119 dan baca tajuk “Sungai” bersama kelas.',
        'Tanya perkara yang dapat diketahui tentang sungai tanpa menggantikan maklumat daripada teks lagu.'
      ],['Menunjuk tajuk dan bahan bacaan.','Menyebut satu pemerhatian awal tentang sungai.'],
        'Pencetus bukan penilaian kefahaman sebelum membaca teks.'),
      P('Membaca teks lagu mengikut frasa',[
        'Baca teks lagu secara berfrasa dan beri murid peluang menjejak baris; fokus pada kemahiran membaca SP 2.3.1.',
        'Modelkan sebutan kata tentang aliran sungai, gunung dan laut tanpa mewajibkan nyanyian sebagai PBD.'
      ],['Membaca bahagian pilihan dengan bimbingan.','Menjejak perkataan yang membayangkan pergerakan sungai.'],
        'Guru mencatat cubaan bacaan individu yang didengar.'),
      P('Cari tiga maklumat daripada seni kata',[
        'Bimbing murid mengenal maklumat bahawa air datang dari gunung, terus mengalir dan akhirnya sampai ke laut.',
        'Minta murid menyatakan isi dengan kata sendiri sambil menunjuk bukti pada halaman.'
      ],['Menunjukkan perkataan kunci di tempat yang betul.','Menyebut tiga maklumat ringkas daripada teks.'],
        'Ketiga-tiga maklumat bersumber pada seni kata, bukan fakta geografi tambahan.'),
      P('Padankan maklumat dengan gerakan',[
        'Tunjukkan gerakan tangan mudah yang menggambarkan air mengalir dari tempat tinggi ke laut.',
        'Minta pasangan memilih gerakan yang sepadan untuk setiap maklumat, bukan gerakan bebas tanpa maksud.'
      ],['Melakukan gerakan aliran dari gunung.','Menunjukkan gerakan berterusan dan sampai ke laut sambil menyebut maksudnya.'],
        'Gerakan dikaitkan secara lisan kepada isi yang dipilih.'),
      P('Semak bacaan, maklumat dan gerakan individu',[
        'Dengar murid membaca bahagian sesuai, menyatakan tiga isi dan menunjukkan gerakan yang sepadan.',
        'Rekod kefahaman dan padanan gerakan individu; jika ada murid belum sempat, tetapkan giliran susulan.'
      ],['Membaca bahagian yang dipilih.','Menyebut isi dan menunjukkan tiga gerakan yang berkaitan.'],
        'Tidak menyamakan persembahan gerakan kumpulan dengan penguasaan individu.'),
      P('Rumusan aliran dan pengajaran lagu',[
        'Rumuskan aliran sungai berdasarkan tiga bukti dalam teks dan mesej menggunakan masa dengan baik.',
        'Minta murid memilih satu isi yang paling mudah diingat serta menunjukkan gerakannya.'
      ],['Menyebut satu pengajaran atau maklumat lagu.','Menunjuk satu gerakan yang dapat dijelaskan.'],
        'Penutup berasaskan teks dan gerakan, bukan aktiviti menyanyi baharu.')
    ],
    groups:{
      support:{
        desc:'Baca frasa pendek dengan penunjuk baris dan petunjuk gerakan bertahap.',
        task:'Menyatakan isi aliran sungai dan membuat gerakan selepas membaca.',
        teacher:['Bantu bacaan frasa yang mengandungi maklumat gunung, aliran dan laut.','Modelkan satu gerakan pada satu masa sebelum meminta cubaan sendiri.'],
        pupils:['Jejak frasa terpilih.','Sebut isi berdasarkan perkataan kunci.','Buat gerakan yang sepadan dan cuba semula.'],
        question:'Dari manakah sungai ini mengalir menurut lagu?',answer:'Dari gunung.',
        product:'Bacaan terbimbing, isi dan gerakan individu dengan sokongan direkod.',criterion:'Isi dan gerakan masih sepadan dengan teks, bukan hafalan gerakan sahaja.',next:'Ulang bacaan frasa dan tunjuk hubungan isi-gerakan dengan bantuan dikurangkan.'
      },
      core:{
        desc:'Latihan berpasangan diikuti padanan isi-gerakan individu.',
        task:'Menyatakan tiga isi daripada teks lagu dan menghasilkan tiga gerakan berpadanan.',
        teacher:['Tanya pasangan perkataan sumber yang menyokong gerakan.','Semak isi dan gerakan individu secara bergilir.'],
        pupils:['Baca teks lagu.','Pilih tiga isi yang jelas.','Bina tiga gerakan.','Tunjuk dan terangkan sendiri.'],
        question:'Ke manakah aliran sungai sampai pada akhir teks?',answer:'Ke laut.',
        product:'Tiga isi individu dan tiga padanan gerakan.',criterion:'Tiga isi tepat daripada teks dan setiap gerakan dijelaskan maksudnya.',next:'Betulkan satu gerakan yang kurang menggambarkan maklumat lagu.'
      },
      challenge:{
        desc:'Huraian hubungan maklumat dan makna gerakan diperkemas tanpa menukar SP membaca.',
        task:'Menyatakan tiga isi dan menjelaskan sebab memilih gerakan tertentu.',
        teacher:['Minta murid menunjukkan frasa sumber sebelum menerangkan gerakan.','Dorong penjelasan dengan ayat sendiri tanpa menambah fakta di luar lagu.'],
        pupils:['Baca bahagian sesuai dengan jelas.','Tunjuk tiga gerakan.','Jelaskan kaitan satu atau lebih gerakan dengan isi teks.'],
        question:'Mengapa kamu membuat gerakan tangan berterusan?',answer:'Kerana sungai tetap mengalir dalam lagu.',
        product:'Maklumat, gerakan dan justifikasi ringkas berdasarkan lagu.',criterion:'Perincian gerakan dapat dikesan kembali kepada baris yang dibaca.',next:'Perjelas hubungan teks dan gerak pada isi yang kurang tepat.'
      }
    },
    pbd:{method:'Pemerhatian bacaan dan soal jawab maklumat serta padanan gerakan individu.',
      evidence:'Murid membaca bahagian lagu, menyatakan tiga isi yang tepat dan memadankan gerakan yang boleh diterangkan.',
      criterion:'Tiga maklumat lagu dikenal pasti dan masing-masing disertakan gerakan yang sesuai.'},
    reflection:'Murid disemak: ____ / ____. Tiga isi tepat: ____. Padanan gerakan tepat: ____. Bacaan masih berbimbing: ____. Susulan: ____.'
  },
  3:{
    title:'Kolam Ikan Indira',sp:'3.2.2',page:120,anchors:['kolam ikan indira','belakang rumah','waktu petang','10 ekor ikan koi'],
    task:'Membaca petikan “Kolam Ikan Indira” dan menulis jawapan bertumpu kepada empat soalan apa, di mana, bila dan berapa pada Buku Teks m/s 120.',
    pak21:'Baca–Cari Bukti–Tulis: pasangan menyemak lokasi jawapan, tetapi setiap murid menulis empat jawapan sendiri.',
    phases:[
      P('Teliti tajuk dan soalan bertumpu',[
        'Buka Buku Teks m/s 120; perkenalkan empat kata tanya apa, di mana, bila dan berapa.',
        'Beri contoh beza jenis maklumat yang diperlukan tanpa memberi empat jawapan sekaligus.'
      ],['Menyebut tajuk.','Menunjuk empat kata tanya yang tercetak pada halaman.'],
        'Murid mengenal bentuk soalan yang akan dijawab.'),
      P('Baca petikan untuk mendapatkan bukti',[
        'Baca petikan tentang kolam ikan milik Indira secara berfrasa, kemudian beri giliran murid membaca.',
        'Bantu murid menandakan butiran tempat kolam, masa pembersihan dan bilangan ikan.'
      ],['Membaca petikan dan menjejak ayat.','Mengesan perkataan penting dalam bahan.'],
        'Bukti jawapan mesti ditemui dalam petikan sebelum murid menulis.'),
      P('Padankan empat soalan dengan fakta',[
        'Tanya satu demi satu soalan yang memang dicetak pada halaman: apa, di mana, bila dan berapa.',
        'Semak bahawa jawapannya ialah kolam ikan, belakang rumah, waktu petang, dan 10 ekor ikan koi.'
      ],['Menunjuk ayat yang menyokong setiap jawapan.','Menyatakan empat jawapan pendek secara lisan.'],
        'Empat padanan soalan dan fakta tepat menurut petikan.'),
      P('Tulis empat jawapan bertumpu',[
        'Bimbing murid menulis jawapan dalam ayat yang lengkap berdasarkan empat fakta tadi.',
        'Minta murid menyemak penggunaan kata dan tanda noktah, bukan menyalin jawapan pasangan.'
      ],['Menulis empat jawapan dalam ayat.','Menyemak jawapan terhadap petikan sumber.'],
        'Jawapan tepat dan lengkap berdasarkan soalan bertumpu.'),
      P('Semakan hasil individu',[
        'Semak empat ayat jawapan murid; rekod secara berasingan ketepatan isi dan kelengkapan ayat.',
        'Minta murid membetulkan satu jawapan yang tidak tepat dengan merujuk ayat petikan.'
      ],['Menyerahkan empat jawapan bertulis.','Membetulkan sendiri jawapan yang tersasar.'],
        'PBD daripada hasil bertulis individu, bukan jawapan kuat kumpulan.'),
      P('Penutup empat jenis kata tanya',[
        'Rumuskan cara memilih bukti jawapan bagi apa, di mana, bila dan berapa.',
        'Minta murid menunjukkan satu ayat petikan yang menyokong jawapan mereka.'
      ],['Membaca satu jawapan yang betul.','Menunjukkan bukti kepada guru.'],
        'Rumusan fokus penulisan jawapan pemahaman bertumpu.')
    ],
    groups:{
      support:{
        desc:'Tandakan perkataan bukti pada petikan dan berikan rangka ayat bagi setiap soalan.',
        task:'Menulis empat jawapan bertumpu dengan bimbingan beransur kurang.',
        teacher:['Tunjuk satu soalan dan ayat bukti pada satu masa.','Modelkan rangka jawapan tanpa melengkapkan kesemua jawapan murid.'],
        pupils:['Baca soalan.','Cari bukti dalam petikan.','Lengkapkan ayat jawapan.','Ulang untuk empat soalan.'],
        question:'Di manakah kolam ikan Indira?',answer:'Kolam ikan Indira terletak di belakang rumah.',
        product:'Empat ayat jawapan bertumpu dengan tahap bantuan dicatat.',criterion:'Isi tepat mengikut petikan dan jawapan ditulis dalam ayat.',next:'Rujuk semula ayat bukti bagi satu jawapan yang masih tidak tepat.'
      },
      core:{
        desc:'Cari ayat sokongan sendiri dan semak jawapan secara berpasangan.',
        task:'Menulis empat jawapan lengkap berdasarkan petikan m/s 120.',
        teacher:['Minta murid menandakan ayat sumber bagi setiap kata tanya.','Semak hasil individu selepas pasangan selesai membanding bukti.'],
        pupils:['Baca petikan.','Cari bukti bagi empat soalan.','Tulis empat ayat sendiri.','Semak dan baiki.'],
        question:'Bilakah ayah membersihkan kolam ikan?',answer:'Ayah Indira membersihkan kolam pada waktu petang.',
        product:'Empat jawapan bertulis individu disertai bukti petikan.',criterion:'Semua empat fakta betul serta ayat lengkap dan jelas.',next:'Baiki kesilapan fakta atau ayat sebelum membuat semakan akhir.'
      },
      challenge:{
        desc:'Jelaskan perbezaan empat kata tanya dengan bukti daripada teks tanpa menambah soalan di luar SP.',
        task:'Tulis empat ayat tepat dan tunjuk bukti bagi setiap jawapan.',
        teacher:['Minta murid menerangkan mengapa fakta tertentu menjawab kata tanya yang dipilih.','Elak jawapan tekaan tentang kolam di luar petikan.'],
        pupils:['Baca empat soalan.','Tulis jawapan lengkap.','Tunjukkan ayat sumber.','Terangkan satu pilihan bukti.'],
        question:'Berapa ekorkah ikan yang dibela Indira?',answer:'Indira membela 10 ekor ikan koi.',
        product:'Empat jawapan lengkap dengan justifikasi rujukan ayat.',criterion:'Isi tepat, ayat gramatis dan bukti boleh ditunjuk pada petikan.',next:'Perjelas satu justifikasi yang tidak sepadan dengan teks.'
      }
    },
    pbd:{method:'Semakan empat jawapan pemahaman bertulis individu.',
      evidence:'Jawapan apa=kolam ikan, di mana=belakang rumah, bila=waktu petang, berapa=10 ekor ikan koi, ditulis sebagai ayat murid sendiri.',
      criterion:'Keempat-empat jawapan tepat berdasarkan petikan dan ditulis dalam ayat lengkap.'},
    reflection:'Murid disemak: ____ / ____. Empat isi tepat: ____. Empat ayat lengkap: ____. Kesilapan kata tanya: ____. Susulan: ____.',
    reviewNote:'Lesson Map verified tetapi metadata mapping_status=bulk-draft-needs-teacher-review; guru perlu mengesahkan kandungan RPH sebelum dianggap Word diluluskan.'
  },
  4:{
    title:'Kegunaan Rumput',sp:'5.2.2',page:121,anchors:['kegunaan rumput','padang bola','taman permainan','rumah teres'],
    task:'Meneliti bahan “Kegunaan Rumput”, mengenal pasti kata majmuk rangkai kata bebas dan membina tiga ayat berdasarkan Buku Teks m/s 121.',
    pak21:'Jejak–Padan–Tulis: pasangan mencari kata majmuk pada teks dan rajah sebelum murid menulis ayat individu.',
    phases:[
      P('Kenal lokasi penanaman rumput',[
        'Buka Buku Teks m/s 121 dan baca tajuk “Kegunaan Rumput”.',
        'Minta murid menyebut tempat yang tercatat pada halaman, seperti taman permainan dan padang bola.'
      ],['Memerhati ayat dan rajah sumber.','Menyatakan satu kegunaan rumput.'],
        'Jawapan awal berpunca daripada lokasi yang tercatat, bukan lokasi rekaan.'),
      P('Teliti kata majmuk pada halaman',[
        'Tunjuk contoh frasa berkaitan seperti taman bunga, padang bola, taman permainan, rumah banglo dan rumah teres pada bahan.',
        'Terangkan bahawa gabungan perkataan dalam konteks tersebut menyampaikan maksud tertentu.'
      ],['Menjejak rangkai kata dalam halaman.','Menyebut contoh yang ditemui bersama pasangan.'],
        'Setiap kata majmuk yang dipilih boleh dijumpai pada teks sumber.'),
      P('Kenal pasti sekurang-kurangnya empat kata majmuk',[
        'Minta murid mencari empat kata majmuk rangkai kata bebas yang digunakan dalam teks.',
        'Semak pilihan murid pada buku asal; jangan menerima frasa yang ditambah di luar konteks.'
      ],['Menunjuk empat contoh pada buku.','Menyatakan maksud mudah berdasarkan konteks gambar atau ayat.'],
        'Empat contoh benar-benar muncul dalam bahan m/s 121.'),
      P('Bina tiga ayat tentang kegunaan rumput',[
        'Modelkan satu ayat konteks menggunakan kata majmuk daripada buku tanpa melengkapkan keseluruhan latihan.',
        'Minta setiap murid menghasilkan tiga ayat sendiri menggunakan contoh yang dipilih.'
      ],['Menulis tiga ayat berkaitan rumput atau tempat yang ditunjukkan.','Memastikan penggunaan kata majmuk sesuai dengan maksud.'],
        'Ayat sesuai konteks, bukan deretan kata majmuk tanpa hubungan.'),
      P('Semakan kata majmuk dan ayat individu',[
        'Semak empat kata majmuk yang dikenal pasti serta tiga ayat tulisan murid.',
        'Minta murid membetulkan pemilihan perkataan atau susunan ayat jika tersasar.'
      ],['Menyerahkan contoh dan ayat sendiri.','Membaiki satu ayat selepas menyemak buku.'],
        'PBD dibezakan antara pengecaman empat contoh dan penghasilan tiga ayat.'),
      P('Penutup: penggunaan kata majmuk',[
        'Pilih satu ayat yang tepat untuk dibaca dan cari kata majmuk di dalamnya.',
        'Rumuskan kaitan frasa tersebut dengan lokasi kegunaan rumput dalam sumber.'
      ],['Membaca satu ayat sendiri.','Menunjuk kata majmuk yang digunakan.'],
        'Rumusan pada kemahiran tatabahasa 5.2.2, bukan projek penanaman.')
    ],
    groups:{
      support:{
        desc:'Guru menandakan beberapa rangkai kata yang benar-benar muncul pada halaman.',
        task:'Cari empat contoh dan tulis tiga ayat dengan rangka yang membantu.',
        teacher:['Tunjukkan frasa sumber satu demi satu.','Beri rangka ayat, kemudian minta murid mengisi frasa yang sesuai sendiri.'],
        pupils:['Cari empat frasa pada buku.','Baca frasa dengan guru.','Lengkapkan tiga ayat.','Semak sendiri.'],
        question:'Di manakah rumput boleh ditanam menurut bahan?',answer:'Rumput boleh ditanam di padang bola.',
        product:'Empat frasa yang ditunjukkan dan tiga ayat hasil murid.',criterion:'Frasa wujud pada sumber dan ayat mempunyai maksud yang tepat.',next:'Ulang bacaan satu frasa dan pembinaan satu ayat dengan bantuan dikurangkan.'
      },
      core:{
        desc:'Kenal pasti frasa secara berpasangan, tetapi hasil ayat mesti individu.',
        task:'Kesan empat kata majmuk dan bina tiga ayat dalam konteks kegunaan rumput.',
        teacher:['Minta murid menjejak frasa asal pada teks.','Semak kegunaan frasa dalam tiga ayat bertulis individu.'],
        pupils:['Tandakan empat kata majmuk.','Bina tiga ayat sendiri.','Semak dan baiki pemilihan frasa.'],
        question:'Nyatakan satu kata majmuk daripada petikan.',answer:'Taman permainan.',
        product:'Empat contoh daripada teks serta tiga ayat bertulis.',criterion:'Empat kata majmuk dan tiga ayat sesuai dengan konteks.',next:'Baiki satu ayat yang kurang tepat sebelum dihantar.'
      },
      challenge:{
        desc:'Jelaskan pemilihan frasa untuk tiga ayat dengan konteks yang berbeza pada halaman.',
        task:'Gunakan empat kata majmuk dan hasilkan tiga ayat yang dapat disokong teks/gambar.',
        teacher:['Minta bukti frasa sumber dan maksud dalam setiap ayat.','Kekalkan kata majmuk rangkai kata bebas sebagai fokus, bukan ajar kategori lain.'],
        pupils:['Cari contoh dalam buku.','Tulis tiga ayat dengan pilihan frasa.','Jelaskan satu penggunaan yang sesuai.'],
        question:'Mengapa frasa padang bola sesuai dalam ayat kamu?',answer:'Buku menunjukkan rumput ditanam di padang bola.',
        product:'Empat frasa dan tiga ayat yang mempunyai justifikasi.',criterion:'Pilihan kata majmuk tepat serta hubungan ayat dengan sumber jelas.',next:'Perkemas ayat yang belum menunjukkan konteks kata majmuk.')
      }
    },
    pbd:{method:'Semakan empat kata majmuk yang dikenal pasti dan tiga ayat bertulis individu.',
      evidence:'Kata majmuk seperti taman bunga, padang bola, taman permainan, rumah banglo atau rumah teres serta tiga ayat sesuai konteks.',
      criterion:'Sekurang-kurangnya empat kata majmuk tepat dan tiga ayat penggunaan yang sesuai dengan bahan.'},
    reflection:'Murid disemak: ____ / ____. Empat contoh tepat: ____. Tiga ayat tepat: ____. Bantuan frasa: ____. Susulan: ____.'
  },
  5:{
    title:'Kebun Mini',sp:'5.2.3',page:122,anchors:['kebun mini','siput-siput','kayu-kayu','cili-cili'],
    task:'Mengenal pasti sekurang-kurangnya lima kata ganda dalam teks “Kebun Mini” dan membina tiga ayat menggunakan kata ganda pada Buku Teks m/s 122.',
    pak21:'Baca–Kesan–Bina: pasangan mengesan kata ganda dalam teks, kemudian setiap murid menulis tiga ayat sendiri.',
    phases:[
      P('Imbas suasana kebun mini',[
        'Buka Buku Teks m/s 122 dan baca tajuk “Kebun Mini” bersama kelas.',
        'Minta murid menyebut aktiviti Indira dan keluarganya berdasarkan petikan.'
      ],['Membaca tajuk dan beberapa ayat terpilih.','Menyebut satu kerja membersihkan kebun.'],
        'Maklumat awal berasal daripada petikan keluarga Indira.'),
      P('Cari bentuk berulang dalam teks',[
        'Baca semula ayat dan modelkan cara mengecam perkataan berulang dengan sempang.',
        'Tunjuk contoh yang benar-benar terdapat dalam sumber seperti pagi-pagi dan siput-siput.'
      ],['Menjejak perkataan berganda.','Menunjuk sempang pada contoh yang ditemui.'],
        'Murid membezakan kata ganda daripada perkataan lain dalam ayat.'),
      P('Senaraikan lima atau lebih kata ganda',[
        'Bimbing murid mencari contoh siput-siput, daun-daun, kayu-kayu, pokok-pokok dan cili-cili pada teks.',
        'Minta murid menyemak ejaan contoh yang ditandakan dengan halaman sumber.'
      ],['Membaca lima kata ganda daripada teks.','Menyenaraikan atau menandakan lima contoh sendiri.'],
        'Sekurang-kurangnya lima contoh wujud dalam petikan.'),
      P('Bina tiga ayat menggunakan kata ganda',[
        'Modelkan satu ayat baharu berkaitan situasi kebun tanpa meminta murid menyalin semua ayat buku.',
        'Minta murid memilih tiga kata ganda untuk menghasilkan tiga ayat tersendiri dalam konteks yang sesuai.'
      ],['Membina tiga ayat individu.','Memastikan setiap kata ganda digunakan dengan maksud yang jelas.'],
        'Ayat bermakna dan penggunaan kata ganda sesuai, bukan senarai perkataan semata-mata.'),
      P('PBD mengecam dan membina ayat',[
        'Semak senarai sekurang-kurangnya lima kata ganda serta tiga ayat individu.',
        'Catat pemisahan antara kesalahan mengecam, mengeja dan penggunaan kata ganda.'
      ],['Menyemak ejaan kata ganda.','Membaiki satu ayat yang belum menggunakan kata ganda dengan tepat.'],
        'PBD individu mempunyai bukti pengecaman serta bukti penulisan.'),
      P('Penutup: kata ganda dalam ayat',[
        'Minta beberapa murid membaca satu ayat sendiri dan menunjukkan kata gandanya.',
        'Rumuskan kegunaan kata ganda dalam petikan kebun keluarga Indira.'
      ],['Membaca satu ayat dan menyebut kata gandanya.','Menyimpan tugasan selepas semakan.'],
        'Rumusan kekal dalam SP kata ganda, tanpa berpindah kepada projek berkebun.')
    ],
    groups:{
      support:{
        desc:'Petunjuk visual pada perkataan bersempang dengan rangka ayat.',
        task:'Kesan lima kata ganda daripada teks dan bina tiga ayat dengan bimbingan.',
        teacher:['Tunjukkan dua contoh awal tanpa melengkapkan senarai lima.','Berikan rangka ayat untuk murid lengkapkan menggunakan perkataan yang dipilih.'],
        pupils:['Tandakan perkataan yang berulang.','Pilih lima contoh daripada petikan.','Lengkapkan tiga ayat sendiri.'],
        question:'Apakah kata ganda bagi benda yang dikutip Indira?',answer:'Siput-siput.',
        product:'Lima contoh kata ganda dan tiga ayat dengan bantuan direkod.',criterion:'Contoh wujud dalam petikan dan ayat lengkap menepati maksud.',next:'Ulang ejaan kata ganda yang belum tepat sebelum menulis semula ayat.'
      },
      core:{
        desc:'Pasangan membandingkan perkataan, tetapi tiga ayat ditulis sendiri.',
        task:'Kenal pasti sekurang-kurangnya lima kata ganda dan bina tiga ayat.',
        teacher:['Minta murid menunjukkan lokasi setiap contoh dalam petikan.','Semak makna tiga ayat individu dan cara ejaan kata ganda.'],
        pupils:['Baca petikan.','Senaraikan lima contoh.','Tulis tiga ayat.','Semak ejaan sempang dan makna.'],
        question:'Apakah kata ganda bagi daun yang disapu?',answer:'Daun-daun.',
        product:'Senarai lima kata ganda dan tiga ayat individu.',criterion:'Kata ganda dikenal pasti betul dan digunakan secara sesuai dalam tiga ayat.',next:'Betulkan satu ejaan atau penggunaan yang tersilap.'
      },
      challenge:{
        desc:'Pilih kata ganda berbeza daripada teks dan jelaskan kesesuaian penggunaan.',
        task:'Kenal pasti lima atau lebih kata ganda dan bina tiga ayat yang pelbagai konteks.',
        teacher:['Minta murid merujuk petikan bagi setiap kata ganda.','Semak sama ada ayat baharu masih sesuai dengan makna sumber.'],
        pupils:['Kenal pasti contoh daripada teks.','Tulis tiga ayat dengan kata ganda berbeza.','Jelaskan satu pilihan kata dalam konteks ayat.'],
        question:'Bagaimanakah kamu menggunakan kata ganda pokok-pokok?',answer:'Pokok-pokok terung itu tumbuh subur.',
        product:'Tiga ayat individu dengan penggunaan kata ganda yang jelas.',criterion:'Contoh tepat, ejaan bersempang betul dan ayat mempunyai maksud sesuai.',next:'Perkemas ayat yang kurang tepat tanpa menukar kemahiran tatabahasa.')
      }
    },
    pbd:{method:'Semakan kata ganda dalam teks dan tiga ayat bertulis individu.',
      evidence:'Sekurang-kurangnya lima kata ganda yang benar-benar wujud pada halaman 122 serta tiga ayat bermakna hasil murid.',
      criterion:'Murid mengecam lima kata ganda dan menggunakan tiga daripadanya dalam ayat dengan betul.'},
    reflection:'Murid disemak: ____ / ____. Lima kata ganda tepat: ____. Tiga ayat tepat: ____. Kesilapan sempang: ____. Susulan: ____.'
  }
};
function applies(map,opts={}){
  const p=plans[Number(map?.session_no)];
  if(!p)return false;
  const meta=map?.source_evidence?.meta||{};
  const key=opts.subjectKey||map?.subject_key||(typeof root.rphSubjectKey==='function'?root.rphSubjectKey(map?.subject_id):'');
  const txt=norm(map?.source_evidence?.textbook?.text).toLowerCase();
  return key==='bm'&&Number(map?.year)===1&&Number(map?.academic_year)===2026
    &&Number(map?.week_no)===31&&map?.verification_status==='verified'
    &&map?.week_exact===true&&map?.sp_crosscheck===true
    &&meta.session_exact===true&&meta.page_route_verified===true
    &&norm(meta.main_sp||map?.sp)===p.sp&&norm(map?.sp)===p.sp
    &&Number(map?.textbook_page_start)===p.page
    &&Number(map?.textbook_page_end||p.page)===p.page
    &&norm(map?.title).toLowerCase()===p.title.toLowerCase()
    &&p.anchors.every(a=>txt.includes(a));
}
function stepText(p,page){
  return 'Tindakan guru: '+join(p.teacher)+'\nTindakan murid: '+join(p.pupils)+'\nSemakan: '+p.check+'\nBahan: Buku Teks m/s '+page;
}
function build(map,opts={}){
  if(!applies(map,opts))throw Error('BM1_WEEK31_SOURCE_PLAN_SCOPE_MISMATCH');
  const p=plans[Number(map.session_no)];
  const canonical=root.BmYear1CanonicalRph?.build(map,opts);
  if(!canonical)throw Error('BM1_CANONICAL_ENGINE_REQUIRED');
  const phases=p.phases.map(x=>({...x,resources:['Buku Teks m/s '+p.page]}));
  const steps=phases.map((x,i)=>({key:'bm1-w31-s'+map.session_no+'-step-'+(i+1),
    name:x.name,text:stepText(x,p.page),bbm:'Buku Teks m/s '+p.page,
    pak21:p.pak21,phase:'source-specific-teacher-design'}));
  const differentiation={},librarySteps={};
  for(const key of ['support','core','challenge']){
    const g=p.groups[key];
    const label={support:'Peneroka',core:'Pembina',challenge:'Pencabar'}[key];
    const lane={label,support_description:g.desc,task:g.task,materials:['Buku Teks m/s '+p.page],
      teacher:g.teacher,pupil_steps:g.pupils,example:{teacher:g.question,pupil:g.answer},
      product:g.product,criterion:g.criterion,next_step:g.next};
    differentiation[key]=lane;
    librarySteps[key]=[{key:'bm1-w31-s'+map.session_no+'-'+key,name:label,
      text:'Tugasan sumber: '+g.task,bbm:'Buku Teks m/s '+p.page,pak21:p.pak21,
      phase:'source-specific-teacher-design'}];
  }
  const first=phases[0],last=phases.at(-1);
  return {...canonical,canonicalBm1:true,sourcePlanBm1:true,
    sourcePlanReviewStatus:'LESSON_MAP_EVIDENCE_NOT_WORD_APPROVED',
    sourcePlanSession:'BM1-2026B-W31-S'+map.session_no,
    sourcePlanVersion:VERSION,canonicalVersion:VERSION,
    sourceTask:p.task,anchor:p.task,phases,sourceSteps:steps,classroomFlow:steps,
    librarySteps,differentiation,
    groupBbm:{support:'Buku Teks m/s '+p.page,core:'Buku Teks m/s '+p.page,
      challenge:'Buku Teks m/s '+p.page},
    bbmList:['Buku Teks m/s '+p.page],pak21:p.pak21,pakDetail:p.pak21,
    pbd:p.pbd,pbdEvidence:p.pbd,reflection:p.reflection,intervention:[],
    inductionData:{name:first.name,text:stepText(first,p.page),
      bbm:'Buku Teks m/s '+p.page,pak21:p.pak21},
    setInduksi:stepText(first,p.page),penutup:stepText(last,p.page),
    diffSupportAct:differentiation.support.task,diffCoreAct:differentiation.core.task,
    diffChallengeAct:differentiation.challenge.task,
    page:'m/s '+p.page,mainSp:p.sp,topic:p.title,
    sourcePlanTeacherReviewNeeded:Boolean(p.reviewNote||map?.source_evidence?.meta?.mapping_status==='bulk-draft-needs-teacher-review')
  };
}
root.BmYear1Week31SourcePlans={VERSION,availableSessions:[1,2,3,4,5],applies,build};
try{if(typeof module!=='undefined'&&module.exports)module.exports=root.BmYear1Week31SourcePlans}catch{}
})(typeof window!=='undefined'?window:globalThis);
