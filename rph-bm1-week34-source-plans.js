// BM Tahun 1, Kumpulan B 2026, Minggu 34 — Buku Teks m/s 133,134,136.
// Pelan sumber sebenar dengan langkah reka bentuk PdP guru; belum diluluskan Word.
// S3 + PKJR ialah judul RPT, bukan lesen untuk mereka-reka aktiviti PKJR.
(function(root){
'use strict';
const VERSION='BM1-W34-SOURCE-PLANS-20261009e';
const norm=x=>String(x??'').replace(/\s+/g,' ').trim();
const P=(name,t1,t2,p1,p2,check)=>({name,teacher:[t1,t2],pupils:[p1,p2],check});
const L=(description,task,teacher,pupils,question,answer,product,criterion,next)=>({
  description,task,teacher,pupils,question,answer,product,criterion,next
});
const plans={
  1:{
    title:'Aku Senaskhah Surat Khabar',sp:'5.3.1',page:133,
    anchors:['aku senaskhah surat khabar','ayat seruan','wah','aduh'],
    task:'Mengenal pasti dan membina sekurang-kurangnya tiga ayat seruan berdasarkan kisah senaskhah surat khabar di Buku Teks m/s 133.',
    pak:'Baca–Pilih–Lakon suara: pasangan membezakan ungkapan perasaan dan setiap murid menghasilkan ayat seruan sendiri.',
    phases:[
      P('Kenal perjalanan surat khabar',
        'Buka Buku Teks m/s 133 dan baca tajuk Aku Senaskhah Surat Khabar.',
        'Tunjukkan bahan yang menggambarkan surat khabar menjadi tudung saji dan ungkapan perasaan dalam cerita.',
        'Menunjuk tajuk dan watak pencerita “Aku”.',
        'Menyatakan satu keadaan surat khabar dalam cerita.',
        'Murid mengaitkan emosi dengan situasi yang terdapat pada halaman.'),
      P('Baca ayat seruan daripada bahan',
        'Tunjukkan ungkapan “Hai, kawan!”, “Wah, cantiknya saya!”, “Aduh, sakitnya saya!” dan “Gembiranya, saya telah berbakti!”.',
        'Bacakan ayat dengan intonasi yang menunjukkan perasaan dan jelaskan penggunaan tanda seru.',
        'Mendengar dan membaca ungkapan mengikut giliran.',
        'Menunjukkan tanda seru dalam ayat sumber.',
        'Ayat seruan dibezakan daripada soalan “Apa khabar?” yang menggunakan tanda tanya.'),
      P('Padankan seruan dengan perasaan',
        'Bimbing murid mengenal hai sebagai sapaan, wah sebagai kagum dan aduh sebagai kesakitan dalam konteks cerita.',
        'Minta murid menunjukkan ayat sumber yang menyokong perasaan yang disebut.',
        'Memilih tiga ayat seruan.','Memadankan ayat dengan situasi atau perasaan.',
        'Perasaan disokong petikan sumber, bukan rekaan peristiwa lain.'),
      P('Bina tiga ayat seruan baharu',
        'Minta murid membina tiga ayat seruan berdasarkan situasi surat khabar, contohnya ungkapan kagum atau gembira sebagai ayat binaan murid.',
        'Bezakan secara jelas ayat contoh baharu daripada ayat asal; ingatkan tanda seru.',
        'Menulis tiga ayat seruan sendiri.','Menyemak pemilihan kata seru dan tanda baca.',
        'Tiga ayat baharu mempunyai fungsi melahirkan perasaan, bukan ayat tanya atau penyata.'),
      P('PBD ayat seruan individu',
        'Dengar murid membaca satu ayat seruan dengan intonasi sesuai dan semak tiga ayat binaan.',
        'Catat perbezaan pengecaman ayat sumber dengan pembinaan ayat individu.',
        'Membaca satu ayat dengan intonasi sesuai.','Membaiki ayat yang kurang jelas atau salah tanda baca.',
        'Bukti ialah tiga ayat seruan hasil murid serta satu bacaan individu.'),
      P('Rumusan jenis ayat seruan',
        'Rumuskan fungsi ayat seruan untuk melahirkan perasaan dan penggunaan tanda seru.',
        'Minta murid memberi satu contoh yang dapat dikaitkan dengan kisah surat khabar.',
        'Menyebut satu ciri ayat seruan.','Membaca contoh sendiri yang tepat.',
        'Penutup mengukuhkan tatabahasa SP 5.3.1(iv).')
    ],
    lanes:{
      support:L('Tunjuk ayat bercetak dan bimbing satu seruan pada satu masa.',
        'Kenal tiga ungkapan seruan serta bina tiga ayat dengan rangka dan bantuan.',
        ['Baca contoh wah/aduh secara jelas.','Sediakan rangka ungkapan tanpa melengkapkan jawapan murid.'],
        ['Tunjuk ayat seruan sumber.','Sebut perasaan yang berkaitan.','Lengkapkan tiga ayat sendiri.'],
        'Apakah perasaan dalam “Wah, cantiknya saya!”?','Kagum.',
        'Tiga ayat seruan sendiri dengan bantuan yang direkod.',
        'Ayat melahirkan perasaan dan mempunyai tanda seru.',
        'Ulang ayat yang tersalah tanda baca dengan bimbingan beransur kurang.'),
      core:L('Pasangan membincangkan perasaan tetapi ayat baharu ditulis sendiri.',
        'Kenal pasti ungkapan dan bina tiga ayat seruan berkaitan situasi dalam bahan.',
        ['Minta murid mencari bukti bagi perasaan dalam teks.','Semak fungsi dan intonasi ayat individu.'],
        ['Cari tiga ayat seruan.','Padankan perasaan.','Bina tiga ayat sendiri.','Semak tanda seru.'],
        'Mengapakah “Aduh, sakitnya saya!” bukan ayat penyata?','Ayat itu melahirkan perasaan sakit.',
        'Tiga ayat seruan hasil murid dan padanan perasaan.',
        'Fungsi seruan dan tanda baca tepat; situasi tidak menyimpang daripada bahan.',
        'Betulkan ayat yang berupa soalan atau penyata.'),
      challenge:L('Terangkan maksud emosi dan perbezaan jenis ayat.',
        'Bina tiga ayat seruan yang berbeza perasaan serta jelaskan satu pilihan.',
        ['Banding tanda tanya pada Apa khabar? dengan tanda seru dalam dialog.','Minta murid menjelaskan pilihan intonasi atau perasaan.'],
        ['Baca ayat bercetak.','Bina tiga seruan yang berbeza.','Jelaskan mengapa satu ayat melahirkan perasaan.'],
        'Apakah beza “Apa khabar?” dengan “Wah, cantiknya saya!”?',
        'Yang pertama ayat tanya, yang kedua ayat seruan.',
        'Tiga ayat seruan tepat serta satu penjelasan jenis ayat.',
        'Ayat menggambarkan emosi dan tidak disalah anggap sebagai soalan.',
        'Perkemas ayat yang belum jelas perasaannya.')
    },
    pbd:{method:'Semakan tiga ayat seruan individu dan bacaan berintonasi daripada bahan.',
      evidence:'Tiga ayat seruan baharu yang berkaitan situasi surat khabar dan menggunakan kata seru serta tanda seru sesuai.',
      criterion:'Sekurang-kurangnya tiga ayat seruan tepat, dengan tanda baca dan makna perasaan yang sesuai.'},
    reflection:'Murid disemak: ____ / ____. Tiga ayat seruan tepat: ____. Intonasi sesuai: ____. Keliru ayat tanya: ____. Susulan: ____.'
  },
  2:{
    title:'Pengayaan – Ayat Penyata',sp:'5.3.1',page:134,
    anchors:['pemulihan','pengayaan','ayat penyata','menanam anak pokok','air hujan'],
    task:'Menulis sekurang-kurangnya tiga ayat penyata berdasarkan gambar dan frasa aktiviti pengayaan pada Buku Teks m/s 134.',
    pak:'Lihat–Tulis–Semak: murid membanding padanan frasa pada gambar, kemudian menulis ayat individu.',
    phases:[
      P('Kenali bahan pemulihan/pengayaan',
        'Buka Buku Teks m/s 134 dan bezakan tajuk Pemulihan dan Pengayaan sebagai label latihan pada halaman.',
        'Terangkan fokus sesi RPT ialah membina ayat penyata, bukan berpindah kepada pelajaran sains atau berkebun.',
        'Membaca arahan menulis ayat penyata.','Menunjuk gambar/frasa yang berkaitan.',
        'Murid memahami bahawa arahan buku meminta penulisan ayat.'),
      P('Teliti maklumat bergambar',
        'Arahkan murid meneliti gambar asal dan frasa seperti menanam anak pokok, menyiram dengan air hujan yang ditadah dan pokok dibaja hingga hidup subur.',
        'Semak padanan gambar–frasa secara langsung kerana teks OCR tidak menyimpan semua hubungan visual.',
        'Menunjuk frasa pada halaman.','Menyatakan satu maklumat yang dilihat pada gambar.',
        'Padanan fakta diperiksa dengan buku asal, bukan meneka daripada urutan OCR.'),
      P('Bina ayat penyata secara lisan',
        'Tunjuk bentuk ayat penyata yang menerangkan aktiviti dengan subjek dan predikat yang jelas.',
        'Modelkan satu ayat contoh guru tentang menanam anak pokok, kemudian minta murid menghasilkan ayat sendiri.',
        'Menyampaikan ayat tentang gambar dalam bentuk penyata.','Menyemak sama ada ayat menjelaskan sesuatu perkara.',
        'Ayat bukan soalan, larangan atau seruan.'),
      P('Tulis tiga ayat hasil sendiri',
        'Minta murid menulis tiga ayat penyata berdasarkan tiga frasa/gambar yang benar-benar dipadankan pada halaman.',
        'Ingatkan huruf besar, noktah, ejaan serta makna ayat.',
        'Menghasilkan tiga ayat bertulis individu.','Memeriksa maklumat terhadap gambar.',
        'Sekurang-kurangnya tiga ayat penyata lengkap.'),
      P('Semak kesepadanan gambar dan tulisan',
        'Semak ayat murid dengan gambar asal, fungsi ayat penyata dan tanda baca.',
        'Minta murid membetulkan satu ayat yang tidak jelas atau tersalah fakta.',
        'Membaca ayat sendiri.','Membaiki ayat selepas maklum balas individu.',
        'PBD daripada ayat hasil murid, bukan menyalin jawapan pasangan.'),
      P('Rumusan penulisan ayat penyata',
        'Rumusan fokus satu ayat yang memberikan fakta berdasarkan gambar dan frasa.',
        'Pilih murid menyebut satu ayat penyata sendiri yang telah disemak.',
        'Membaca satu ayat penyata.','Menunjuk gambar/frasa sokongan.',
        'Rumusan menghubungkan sumber visual kepada penulisan tepat.')
    ],
    lanes:{
      support:L('Guna rangka ayat dan padankan satu gambar pada satu masa.',
        'Tulis tiga ayat penyata daripada frasa yang disahkan dengan bimbingan.',
        ['Bimbing satu padanan gambar–frasa dahulu.','Beri rangka ayat untuk murid lengkapkan sendiri.'],
        ['Tunjuk satu gambar.','Sebut frasa sepadan.','Lengkapkan dan tulis satu ayat.','Ulang tiga kali.'],
        'Apakah yang dilakukan dalam frasa menanam anak pokok?',
        'Mereka menanam anak pokok.',
        'Tiga ayat penyata bertulis dan bantuan direkod.',
        'Ayat lengkap, fakta sepadan dengan gambar dan ada noktah.',
        'Ulang satu ayat dengan petunjuk semakin kurang.'),
      core:L('Pasangan membanding frasa/gambar dan murid menulis sendiri.',
        'Menulis tiga ayat penyata berdasarkan tiga maklumat bergambar.',
        ['Minta murid menunjukkan bukti gambar bagi ayat.','Semak tanda baca serta kelengkapan ayat individu.'],
        ['Pilih tiga gambar/frasa.','Bina ayat sendiri.','Semak fungsi penyata dan fakta.'],
        'Apakah yang digunakan untuk menyiram menurut frasa?',
        'Air hujan yang ditadah.',
        'Tiga ayat individu yang sepadan dengan gambar.',
        'Ayat penyata lengkap serta tepat berdasarkan sumber bergambar.',
        'Betulkan padanan dan susunan ayat yang kurang jelas.'),
      challenge:L('Perincikan ayat tanpa menambah fakta yang tidak kelihatan.',
        'Bina tiga ayat penyata dan jelaskan padanan dua daripadanya dengan gambar.',
        ['Minta murid memberi sebab memilih frasa tersebut.','Pastikan kata tambahan tidak mengubah maklumat asal.'],
        ['Bina tiga ayat.','Tunjukkan gambar yang disokong.','Jelaskan dua padanan.'],
        'Mengapakah ayat kamu berkaitan gambar menyiram pokok?',
        'Ayat saya menggunakan maklumat air hujan yang ditadah.',
        'Tiga ayat penyata dan bukti padanan gambar.',
        'Fakta tepat, ayat jelas dan masih jenis penyata.',
        'Perkemas ayat yang kurang bersesuaian dengan imej.')
    },
    pbd:{method:'Semakan tiga ayat penyata bertulis individu daripada frasa dan gambar.',
      evidence:'Tiga ayat yang berpunca daripada frasa seperti menanam anak pokok, menyiram menggunakan air hujan ditadah dan pokok dibaja.',
      criterion:'Tiga ayat penyata lengkap, sepadan gambar dan frasa serta mempunyai tanda baca asas yang betul.'},
    reflection:'Murid disemak: ____ / ____. Tiga ayat tepat: ____. Gambar–frasa sepadan: ____. Tanda baca: ____. Susulan: ____.'
  },
  3:{
    title:'Tong Kitar Semula + PKJR',sp:'2.3.1',page:136,
    anchors:['tong kitar semula','biru','coklat','jingga','aluminium'],
    task:'Membaca teks bukan sastera Tong Kitar Semula dan mengenal pasti sekurang-kurangnya tiga maklumat penting tentang warna tong dan bahan yang dibuang pada halaman 136; kandungan PKJR berasingan belum disahkan.',
    pak:'Baca–Padan–Terang: pasangan membanding maklumat tong, kemudian setiap murid memberikan respons tepat sendiri.',
    phases:[
      P('Kenal teks bacaan luas kitar semula',
        'Buka Buku Teks m/s 136 dan baca tajuk Tong Kitar Semula. Jelaskan sumber ialah bahan Bacaan Luas.',
        'Tanya tujuan tong kitar semula berdasarkan pendahuluan, tanpa menambah aktiviti PKJR.',
        'Menunjukkan tajuk dan tiga warna yang disebut.','Menyatakan satu kegunaan tong kitar semula.',
        'Pengetahuan awal dinilai setelah murid merujuk bacaan.'),
      P('Baca tiga bahagian warna dan bahan',
        'Bimbing bacaan tentang tong biru untuk kertas, coklat untuk kaca dan jingga untuk aluminium serta plastik.',
        'Minta murid menjejak bukti pada ayat bercetak bagi setiap padanan.',
        'Membaca petikan secara bergilir.','Menunjukkan perkataan warna dan bahan yang dikaitkan.',
        'Murid tidak menukar padanan warna yang dinyatakan pada sumber.'),
      P('Cari tiga maklumat penting',
        'Minta murid menyebut tiga padanan tepat: biru–kertas; coklat–kaca; jingga–aluminium atau plastik.',
        'Jelaskan bahawa contoh barang datang daripada buku: akhbar/majalah, botol/balang kaca, tin/beg plastik.',
        'Menyatakan tiga maklumat berbeza.','Menunjukkan ayat sumber bagi maklumat pilihan.',
        'Padanan disemak pada petikan bukan pada skema luar yang mungkin berbeza.'),
      P('Terangkan manfaat kitar semula berdasarkan teks',
        'Baca perenggan akhir mengenai pengurusan sampah dan kebersihan persekitaran.',
        'Minta murid menjelaskan satu sebab tong-tong itu berguna dalam ayat sendiri.',
        'Menyatakan manfaat tong kitar semula.','Menghubungkan manfaat dengan bukti pada perenggan akhir.',
        'Isi tambahan tidak melebihi maksud pengurusan sampah serta kebersihan alam.'),
      P('Semakan bacaan dan tiga isi individu',
        'Dengar bacaan petikan pilihan setiap murid dan tanya tiga padanan warna–bahan.',
        'Catat ketepatan dan bantuan, serta giliran susulan bagi yang belum disemak.',
        'Membaca bahagian pilihan secara individu.','Menjawab tiga maklumat tanpa bergantung pada pasangan.',
        'PBD ialah bacaan serta tiga maklumat individu, bukan aktiviti membuang objek sebenar.'),
      P('Penutup padanan bukti bacaan',
        'Rumuskan tiga warna tong dan sebab bahan diasingkan berdasarkan teks sumber.',
        'Minta murid menyatakan satu padanan dan menunjukkan ayat bukti yang berkaitan.',
        'Menyebut satu warna dan bahan yang sesuai.','Menunjuk ayat yang menyokongnya.',
        'Rumusan kekal pada membaca teks bukan sastera dan mengenal pasti maklumat.')
    ],
    lanes:{
      support:L('Padankan warna dan bahan dengan petunjuk perkataan daripada teks.',
        'Membaca frasa terpilih dan menyebut tiga padanan yang betul dengan bantuan.',
        ['Tunjuk satu ayat warna–bahan pada satu masa.','Beri contoh kertas bagi tong biru, kemudian minta murid mencari padanan lain.'],
        ['Jejak ayat.','Sebut warna dan bahan.','Ulang bagi tiga warna.','Cuba semula tanpa bantuan penuh.'],
        'Apakah jenis barang dalam tong biru menurut buku?',
        'Kertas seperti akhbar dan buku.',
        'Tiga padanan individu dengan bantuan direkod.',
        'Biru, coklat, jingga dipadankan tepat kepada bahan yang terdapat dalam petikan.',
        'Ulang bahagian petikan yang tersalah warna–bahan.'),
      core:L('Pasangan menyemak isi, tetapi bukti akhir ialah respons sendiri.',
        'Membaca teks dan menerangkan tiga padanan warna–bahan.',
        ['Minta murid menunjukkan bahagian petikan bagi setiap padanan.','Dengar tiga respons individu dengan sebutan jelas.'],
        ['Baca teks.','Cari padanan warna–bahan.','Jelaskan tiga isi sendiri.'],
        'Untuk apakah tong coklat digunakan?',
        'Untuk mengumpulkan barang-barang kaca.',
        'Bacaan dan tiga maklumat tepat hasil individu.',
        'Tiga padanan tepat dan alasan ringkas berpandukan petikan.',
        'Betulkan padanan yang tidak sepadan dengan teks.'),
      challenge:L('Huraikan tiga padanan beserta contoh bahan yang disebut pada buku.',
        'Membaca dan menyatakan tiga maklumat dengan contoh barang serta satu manfaat.',
        ['Minta murid membuktikan setiap jenis barang melalui perenggan yang dibaca.','Semak bahawa manfaat berasal daripada perenggan akhir, bukan teori tambahan.'],
        ['Nyatakan tiga padanan.','Tambah contoh barang sumber.','Sebut satu manfaat tong kitar semula.'],
        'Tong jingga mengumpulkan jenis barang apa menurut petikan?',
        'Aluminium seperti tin serta bahan plastik.',
        'Tiga padanan dengan contoh dan satu manfaat daripada teks.',
        'Maklumat warna, bahan dan manfaat sah daripada teks m/s 136.',
        'Perjelas isi yang masih bercampur antara kertas, kaca dan aluminium.')
    },
    pbd:{method:'Pemerhatian bacaan individu dan soal jawab tiga maklumat tepat tentang tong.',
      evidence:'Bacaan bahagian pilihan dan tiga padanan biru–kertas, coklat–kaca serta jingga–aluminium/plastik berdasarkan teks.',
      criterion:'Sekurang-kurangnya tiga maklumat tepat dan boleh ditunjukkan pada teks bacaan bukan sastera.'},
    reflection:'Murid disemak: ____ / ____. Tiga warna/bahan tepat: ____. Bacaan jelas: ____. Memerlukan bantuan: ____. Susulan: ____.'
  }
};
function applies(map,opts={}){
 const p=plans[Number(map?.session_no)];
 if(!p)return false;
 const meta=map?.source_evidence?.meta||{};
 const sub=opts.subjectKey||map?.subject_key||(typeof root.rphSubjectKey==='function'?root.rphSubjectKey(map?.subject_id):'');
 const book=norm(map?.source_evidence?.textbook?.text).toLowerCase();
 return sub==='bm'&&Number(map?.year)===1&&Number(map?.academic_year)===2026
   &&Number(map?.week_no)===34&&map?.verification_status==='verified'
   &&map?.week_exact===true&&map?.sp_crosscheck===true
   &&meta.session_exact===true&&meta.page_route_verified===true
   &&norm(meta.main_sp||map?.sp)===p.sp&&norm(map?.sp)===p.sp
   &&Number(map?.textbook_page_start)===p.page
   &&Number(map?.textbook_page_end||p.page)===p.page
   &&norm(map?.title).toLowerCase()===p.title.toLowerCase()
   &&p.anchors.every(a=>book.includes(a));
}
function phaseText(p,page){return 'Tindakan guru: '+p.teacher.join('\n')
   +'\nTindakan murid: '+p.pupils.join('\n')
   +'\nSemakan: '+p.check+'\nBahan: Buku Teks m/s '+page}
function build(map,opts={}){
 if(!applies(map,opts))throw Error('BM1_WEEK34_SOURCE_PLAN_SCOPE_MISMATCH');
 const p=plans[Number(map.session_no)];
 const canonical=root.BmYear1CanonicalRph?.build(map,opts);
 if(!canonical)throw Error('BM1_CANONICAL_ENGINE_REQUIRED');
 const phases=p.phases.map(x=>({...x,resources:['Buku Teks m/s '+p.page]}));
 const steps=phases.map((x,i)=>({key:'bm1-w34-s'+map.session_no+'-step-'+(i+1),name:x.name,
   text:phaseText(x,p.page),bbm:'Buku Teks m/s '+p.page,pak21:p.pak,phase:'source-specific-teacher-plan'}));
 const differentiation={},librarySteps={};
 for(const key of ['support','core','challenge']){
   const d=p.lanes[key],label={support:'Peneroka',core:'Pembina',challenge:'Pencabar'}[key];
   differentiation[key]={label,support_description:d.description,task:d.task,
     materials:['Buku Teks m/s '+p.page],teacher:d.teacher,pupil_steps:d.pupils,
     example:{teacher:d.question,pupil:d.answer},product:d.product,criterion:d.criterion,next_step:d.next};
   librarySteps[key]=[{key:'bm1-w34-s'+map.session_no+'-'+key,name:label,
     text:'Tugasan sumber: '+d.task,bbm:'Buku Teks m/s '+p.page,pak21:p.pak,phase:'source-specific-teacher-plan'}];
 }
 const first=phases[0],last=phases[phases.length-1];
 return {...canonical,canonicalBm1:true,sourcePlanBm1:true,
   sourcePlanReviewStatus:'LESSON_MAP_EVIDENCE_NOT_WORD_APPROVED',sourcePlanTeacherReviewNeeded:true,
   sourcePlanSession:'BM1-2026B-W34-S'+map.session_no,sourcePlanVersion:VERSION,canonicalVersion:VERSION,
   sourceTask:p.task,anchor:p.task,phases,sourceSteps:steps,classroomFlow:steps,
   librarySteps,differentiation,groupBbm:{support:'Buku Teks m/s '+p.page,
     core:'Buku Teks m/s '+p.page,challenge:'Buku Teks m/s '+p.page},
   bbmList:['Buku Teks m/s '+p.page],pak21:p.pak,pakDetail:p.pak,
   pbd:p.pbd,pbdEvidence:p.pbd,reflection:p.reflection,intervention:[],
   inductionData:{name:first.name,text:phaseText(first,p.page),bbm:'Buku Teks m/s '+p.page,pak21:p.pak},
   setInduksi:phaseText(first,p.page),penutup:phaseText(last,p.page),
   diffSupportAct:differentiation.support.task,diffCoreAct:differentiation.core.task,
   diffChallengeAct:differentiation.challenge.task,
   page:'m/s '+p.page,mainSp:p.sp,topic:p.title,
   pkjrStatus:Number(map.session_no)===3?'PKJR_TITLE_ONLY_NO_VERIFIED_PKJR_SOURCE':null
 };
}
root.BmYear1Week34SourcePlans={VERSION,availableSessions:[1,2,3],applies,build};
try{if(typeof module!=='undefined'&&module.exports)module.exports=root.BmYear1Week34SourcePlans}catch{}
})(typeof window!=='undefined'?window:globalThis);
