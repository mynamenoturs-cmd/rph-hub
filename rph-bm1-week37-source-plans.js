// BM1 Kumpulan B 2026, Minggu 37 S1–S3: evidence-backed, teacher-designed PdP.
// RPT/DSKP + verified Lesson Map + Buku Teks m/s 147,148,149. NOT approved Word.
// S4 is intentionally excluded: RPT SP 5.3.2 vs printed BT150 SP 5.3.3(i)(ii).
(function(root){
'use strict';
const VERSION='BM1-W37-SOURCE-PLANS-20261009h';
const norm=x=>String(x??'').replace(/\s+/g,' ').trim();
const P=(name,teacher,pupils,check)=>({name,teacher,pupils,check});
const G=(description,task,teacher,pupil_steps,question,answer,product,criterion,next_step)=>({
 description,task,teacher,pupil_steps,question,answer,product,criterion,next_step
});
const plans={
 1:{
   title:'Membeli Baju Sukan',sp:'1.2.2',page:147,
   anchors:['membeli baju sukan','wira','juara','10 peratus'],
   task:'Menyampaikan tiga persamaan/perbezaan baju sukan Wira dan Juara berdasarkan harga, pilihan warna, ciri serta tawaran dalam Buku Teks m/s 147.',
   pak:'Lihat–Banding–Terang: pasangan mencari fakta iklan, kemudian setiap murid menyampaikan pilihannya sendiri.',
   phases:[
    P('Kenal dua pilihan baju sukan',
     ['Buka Buku Teks m/s 147 dan baca dialog Aimi serta Hardip.','Tunjukkan dua iklan Wira dan Juara; tanyakan sebab Hardip membanding pilihan sebelum membeli.'],
     ['Menamakan dua jenis baju.','Menunjukkan tempat maklumat tertera dalam iklan.'],
     'Pengenalan berdasarkan iklan sebenar, bukan reka bentuk baju yang tiada dalam buku.'),
    P('Jejak warna dan ciri yang dicatat',
     ['Tunjukkan Wira mempunyai tiga warna biru, putih, merah; Juara dua warna putih dan biru.','Bimbing murid mencari ciri Wira bercorak menarik, manakala Juara mempunyai pilihan lengan dan cetakan nama.'],
     ['Menyatakan satu ciri Wira dan satu ciri Juara.','Mencari perbezaan bilangan pilihan warna.'],
     'Maklumat warna serta ciri mesti ditunjuk dalam iklan.'),
    P('Banding harga dan promosi dengan teliti',
     ['Bimbing murid membaca dua label harga RM8.90 dan RM9.90 serta tawaran diskaun pertama 10 pembeli dan potongan 10 peratus.','Minta murid melihat imej halaman asal untuk memastikan label harga/tawaran benar-benar dipadankan kepada produk; OCR mungkin mengubah susun atur iklan.'],
     ['Membaca dua harga yang tertera.','Memadankan tawaran kepada produk selepas menyemak imej sebenar.'],
     'Jangan menganggap potongan 10 peratus sama dengan diskaun untuk 10 pembeli terawal.'),
    P('Bina tiga isi perbandingan lisan',
     ['Minta murid membanding tiga perkara daripada iklan: warna, ciri dan tawaran atau harga.','Modelkan ayat berkontras seperti Wira mempunyai tiga pilihan warna, manakala Juara dua pilihan; jangan lengkapkan semua jawapan murid.'],
     ['Menyusun tiga persamaan/perbezaan.','Mencuba menerangkannya kepada pasangan.'],
     'Tiga isi berbeza dan boleh dibuktikan dengan iklan halaman 147.'),
    P('Semak pilihan dan alasan individu',
     ['Dengar setiap murid menyampaikan tiga isi dan satu pilihan baju dengan alasan yang bersumber daripada iklan.','Catat ketepatan fakta, sebutan dan bantuan; tidak memaksa satu jenama dianggap lebih baik untuk semua murid.'],
     ['Menerangkan tiga fakta sendiri.','Menyatakan pilihan baju disertai satu alasan yang terbukti pada iklan.'],
     'PBD ialah penyampaian lisan individu, bukan pilihan yang dianggap betul secara mutlak.'),
    P('Rumusan membuat perbandingan',
     ['Rumuskan bahawa pilihan barangan boleh dibanding berdasarkan ciri, warna, harga dan tawaran.','Minta murid membetulkan satu isi yang kurang tepat dengan merujuk iklan.'],
     ['Menyebut satu perbezaan tepat.','Menunjukkan bukti pada halaman.'],
     'Penutup kekal dalam kemahiran menyampaikan maklumat SP 1.2.2.')
   ],
   lanes:{
    support:G('Petunjuk visual dan pilihan kata diberikan satu demi satu.',
     'Sampaikan tiga isi perbandingan dengan bimbingan yang dicatat.',
     ['Tunjuk iklan Wira dan Juara berasingan.','Beri rangka ayat tetapi biarkan murid mengisi maklumat sumber sendiri.'],
     ['Sebut nama kedua-dua baju.','Banding bilangan warna.','Cari dua ciri/tawaran lain.','Nyatakan pilihan dengan alasan mudah.'],
     'Baju mana mempunyai tiga pilihan warna?','Baju sukan Wira.',
     'Tiga isi lisan dan satu alasan, dengan bantuan direkod.',
     'Sekurang-kurangnya tiga fakta yang disebut sepadan dengan iklan.',
     'Ulang isi yang salah sambil menunjukkan iklan asal.'),
    core:G('Berbincang berpasangan sebelum membuat perbandingan sendiri.',
     'Terangkan tiga perbandingan dan satu pilihan beralasan.',
     ['Semak bilangan warna, ciri dan tawaran yang dipilih pasangan.','Dengar tiga isi daripada setiap murid secara individu.'],
     ['Teliti kedua-dua iklan.','Nyatakan tiga beza/persamaan.','Pilih satu baju berdasarkan cirinya.','Sampaikan secara sendiri.'],
     'Apakah pilihan warna yang ada pada Juara?','Putih dan biru.',
     'Tiga isi perbandingan serta satu pilihan individu.',
     'Alasan disokong ciri/tawaran halaman dan bukannya tekaan harga selepas diskaun.',
     'Perkemas satu isi yang tersalah dipadankan kepada jenama.'),
    challenge:G('Hujahkan pilihan menggunakan bukti tanpa membuat andaian promosi.',
     'Sampaikan tiga perbandingan dan jelaskan bagaimana satu tawaran mempengaruhi pilihan.',
     ['Bezakan diskaun pelanggan terawal dengan potongan peratus.','Minta murid merujuk label yang sebenar apabila menyebut harga.'],
     ['Cari fakta iklan.','Banding tiga kriteria.','Nyatakan pilihan.','Jelaskan satu alasan daripada sumber.'],
     'Apakah beza potongan 10 peratus dengan diskaun untuk 10 pembeli terawal?',
     'Satu berkaitan kadar potongan, manakala satu berkaitan bilangan pembeli awal.',
     'Penerangan perbandingan dengan justifikasi tepat.',
     'Tiga isi dan alasan dapat dikesan kepada iklan serta tidak meneka harga akhir.',
     'Bimbing semakan harga dan tawaran pada imej asal jika masih bercampur.')
   },
   pbd:{method:'Pemerhatian penyampaian maklumat lisan individu tentang dua iklan baju sukan.',
    evidence:'Tiga perbandingan warna/ciri/harga/tawaran yang boleh disemak pada halaman 147 serta pilihan dengan satu alasan.',
    criterion:'Tiga isi perbandingan tepat dan satu pilihan dengan alasan bersumberkan bahan.'},
   reflection:'Murid disemak: ____ / ____. Tiga perbandingan tepat: ____. Pilihan beralasan: ____. Keliru promosi/harga: ____. Susulan: ____.'
  },
  2:{
   title:'Membuat Pilihan',sp:'2.3.2',page:148,
   anchors:['membuat pilihan','aimi','bekas air','buku latihan'],
   task:'Membaca cerita Membuat Pilihan, menyusun sekurang-kurangnya tiga peristiwa dan menceritakan semula dengan aksi sesuai tentang keputusan Aimi.',
   pak:'Baca–Susun–Lakon: pasangan menyemak turutan sebelum setiap murid menceritakan semula secara individu.',
   phases:[
    P('Cetus persoalan pilihan Aimi',
     ['Buka Buku Teks m/s 148 dan baca tajuk Membuat Pilihan.','Tanya tujuan sebenar Aimi bersama ibunya ke pasar raya.'],
     ['Menyatakan Aimi mahu membeli buku latihan.','Menunjuk pengenalan cerita.'],
     'Tujuan pembelian dipetik daripada teks, bukan anggapan Aimi membeli minuman.'),
    P('Baca urutan awal di pasar raya',
     ['Baca petikan tentang rak buku dan bekas minuman berwarna-warni.','Minta murid menunjuk bahagian Aimi membelek bekas air yang menarik minatnya.'],
     ['Membaca bahagian terpilih dengan bimbingan.','Menyatakan peristiwa melihat bekas air.'],
     'Aksi yang dilakonkan membezakan melihat daripada benar-benar membeli.'),
    P('Fahami pertimbangan Aimi',
     ['Baca perbualan ibu yang membenarkan pilihan Aimi dan jawapan Aimi bahawa bekas airnya masih elok.','Tanya mengapa Aimi tidak membeli bekas baharu; kaitkan kepada mengelakkan pembaziran mengikut teks.'],
     ['Menunjukkan ujaran alasan Aimi.','Menyatakan sebab dia tidak perlu bekas baharu.'],
     'Alasan Aimi berasal daripada cerita, bukan penilaian peribadi tentang kemampuan keluarga.'),
    P('Susun tiga atau lebih peristiwa dan aksi',
     ['Bimbing urutan: mahu beli buku latihan; melihat bekas air; memikirkan keperluan; meletakkannya semula.','Modelkan aksi mudah meneliti bekas dan meletakkan kembali tanpa melakonkan pembelian yang tidak berlaku.'],
     ['Menyusun kad urutan secara lisan dengan merujuk teks.','Mencuba aksi yang sepadan dengan cerita.'],
     'Urutan cerita dan aksi sepadan; tiada adegan membayar bekas air yang tidak berlaku.'),
    P('Cerita semula dan semakan individu',
     ['Dengar setiap murid menceritakan tiga peristiwa berurutan dengan aksi yang sesuai.','Catat sama ada keputusan Aimi tidak membeli bekas air diceritakan dengan betul serta bantuan yang diperlukan.'],
     ['Menceritakan tiga peristiwa secara sendiri.','Melakukan aksi sederhana dan menjelaskan keputusan Aimi.'],
     'PBD ialah penceritaan individu bersama aksi, bukan lakonan kumpulan sahaja.'),
    P('Penutup membuat pilihan berhemat',
     ['Rumuskan bahawa Aimi kekal pada tujuan membeli buku latihan dan tidak membeli bekas yang masih baik.','Minta murid menyebut satu sebab keputusan itu bersesuaian dengan cerita.'],
     ['Menyatakan satu keputusan watak yang tepat.','Menunjuk ayat petikan yang menyokongnya.'],
     'Pengajaran berkait tindakan sebenar watak dalam teks.')
   ],
   lanes:{
    support:G('Baca bahagian terpilih dan susun peristiwa dengan petunjuk awal/akhir.',
     'Ceritakan tiga peristiwa pilihan dengan sokongan dan aksi mudah.',
     ['Tunjuk bahagian awal, tengah dan akhir teks.','Modelkan satu aksi sahaja sebelum murid melengkapkan penceritaan.'],
     ['Baca frasa terpilih.','Sebut tujuan Aimi.','Susun tiga peristiwa.','Lakonkan satu gerakan dan ceritakan keputusan.'],
     'Apakah yang Aimi hendak beli pada mulanya?','Buku latihan.',
     'Cerita tiga peristiwa dan aksi sendiri; bantuan dicatat.',
     'Turutan tepat dan Aimi tidak didakwa membeli bekas air.',
     'Ulang bahagian peristiwa yang terbalik dengan merujuk teks.'),
    core:G('Latih urutan berpasangan dan lakukan penceritaan sendiri.',
     'Menceritakan tiga peristiwa serta keputusan watak dengan aksi berpadanan.',
     ['Minta pasangan semak urutan pada teks.','Dengar penceritaan individu tanpa jawapan dibantu rakan.'],
     ['Baca cerita.','Susun tiga peristiwa.','Lakonkan aksi yang sesuai.','Nyatakan sebab keputusan Aimi.'],
     'Mengapa Aimi tidak membeli bekas air?', 'Kerana bekas airnya masih elok.',
     'Penceritaan individu dan sekurang-kurangnya satu aksi sesuai.',
     'Peristiwa berurutan dan keputusan watak sesuai dengan petikan.',
     'Baiki aksi atau urutan yang kurang tepat.'),
    challenge:G('Gunakan variasi intonasi serta jelaskan satu sebab keputusan watak.',
     'Ceritakan sekurang-kurangnya empat peristiwa dengan aksi dan satu alasan daripada teks.',
     ['Minta murid menyokong keputusan dengan ujaran Aimi.','Semak turutan dan aksi tanpa menokok tambah peristiwa di pasar raya.'],
     ['Pilih empat peristiwa.','Ceritakan dengan aksi.','Jelaskan sebab tindakan akhir Aimi.'],
     'Apakah yang Aimi lakukan dengan bekas air itu?', 'Dia meletakkannya semula di tempat asal.',
     'Penceritaan beraksi yang menunjukkan sebab dan akibat keputusan.',
     'Urutan, aksi dan alasan dapat diperiksa pada cerita.',
     'Perkemas kaitan antara alasan tidak membazir dan tindakan akhir watak.')
   },
   pbd:{method:'Pemerhatian bacaan serta penceritaan semula tiga peristiwa dengan aksi individu.',
    evidence:'Sekurang-kurangnya tiga peristiwa disampaikan berurutan, aksi sesuai dan keputusan tidak membeli bekas air dinyatakan.',
    criterion:'Urutan benar, aksi menggambarkan petikan dan alasan Aimi berdasarkan teks.'},
   reflection:'Murid disemak: ____ / ____. Urutan tiga peristiwa tepat: ____. Aksi sesuai: ____. Keputusan Aimi difahami: ____. Susulan: ____.'
  },
  3:{
   title:'Catatan Jamil',sp:'3.2.3',page:149,
   anchors:['catatan jamil','rm5.00','rm2.80','rm2.20'],
   task:'Mencatat wang masuk, wang keluar dan baki Jamil dalam lajur jadual Buku Teks m/s 149; semak bahawa RM10.00 bersamaan jumlah perbelanjaan dan baki.',
   pak:'Baca–Kelas–Semak: pasangan meneliti maklumat sumber, kemudian setiap murid mencatat jadual sendiri.',
   phases:[
    P('Kenal catatan wang Jamil',
     ['Buka Buku Teks m/s 149 dan baca tajuk Catatan Jamil.','Tunjukkan jadual Wang dan Perbelanjaan Jamil; terangkan lajur wang masuk dan wang keluar.'],
     ['Menunjuk dua lajur dan ruang baki.','Menyatakan sumber wang dalam petikan.'],
     'Murid mengetahui tugas mencatat, bukan diminta meniru aktiviti pembelian sebenar.'),
    P('Cari dua sumber wang masuk',
     ['Bimbing murid membaca bahawa ayah menghadiahkan RM5.00 dan ibu memberikan RM5.00.','Minta murid menunjukkan ayat bukti dan tempat sesuai dalam lajur wang masuk.'],
     ['Menyebut dua wang masuk.','Mencatat dua entri RM5.00 secara berasingan.'],
     'Jumlah wang masuk sepatutnya RM10.00.'),
    P('Kenal dua perbelanjaan Jamil',
     ['Baca rancangan Jamil membeli hadiah ayah RM5.00 dan majalah Bintang RM2.80.','Tunjukkan bahawa kedua-dua belanja ialah wang keluar dan perlu dicatat sebagai baris berlainan.'],
     ['Menunjuk dua transaksi keluar.','Memasukkan RM5.00 dan RM2.80 pada lajur wang keluar.'],
     'Wang untuk hadiah dan majalah bukan wang masuk.'),
    P('Lengkapkan baki dan semakan keseluruhan',
     ['Bimbing murid membaca baki RM2.20 yang akan disimpan dan jumlah RM10.00 dalam jadual.','Semak hubungan RM5.00 + RM2.80 + RM2.20 = RM10.00 sebagai pengesahan rekod, tanpa mengubah tugasan utama daripada mencatat kepada latihan aritmetik panjang.'],
     ['Mencatat baki RM2.20 pada ruang yang sesuai.','Menyemak jumlah dua penerimaan serta perbelanjaan dan baki.'],
     'RM10.00 diterangkan sebagai wang asal; RM2.20 ialah baki selepas belanja.'),
    P('PBD jadual perbelanjaan individu',
     ['Semak sekurang-kurangnya empat catatan transaksi individu dan baki yang dicatat.','Catat ralat lajur, pertukaran amaun atau ketidakserasian jumlah dan beri peluang murid membetulkan sendiri.'],
     ['Menunjuk bukti setiap catatan pada petikan.','Membaiki satu catatan salah dalam jadual sendiri.'],
     'PBD berasaskan hasil catatan individu dan lajur yang tepat, bukan semakan pasangan sahaja.'),
    P('Penutup menyusun catatan berhemat',
     ['Rumuskan wang masuk, wang keluar dan baki berdasarkan catatan Jamil.','Minta murid menyatakan satu catatan tepat dan tempatnya dalam jadual.'],
     ['Menyebut satu wang masuk atau keluar.','Menerangkan baki yang disimpan dalam ayat mudah.'],
     'Penutup kekal pada kemahiran mencatat maklumat SP 3.2.3.')
   ],
   lanes:{
    support:G('Gunakan dua lajur yang ditunjuk dan semak transaksi satu demi satu.',
     'Mencatat empat transaksi dan baki dengan bimbingan yang direkod.',
     ['Bacakan ayat wang masuk dahulu, kemudian belanja.','Beri petunjuk lajur tanpa mengisi jadual bagi murid.'],
     ['Baca sumber ayah dan ibu.','Catat RM5.00 dua kali pada tempat sesuai.','Catat hadiah dan majalah.','Nyatakan baki.'],
     'Berapakah wang yang diberikan oleh ibu?', 'RM5.00.',
     'Jadual individu dengan empat transaksi dan baki; bantuan direkod.',
     'Amaun dan jenis transaksi tidak tertukar lajur.',
     'Ulang semakan satu baris salah dengan merujuk teks.'),
    core:G('Pasangan membanding fakta tetapi jadual akhir dilengkapkan sendiri.',
     'Catat wang masuk, dua perbelanjaan dan baki dengan lajur tepat.',
     ['Minta murid menunjukkan ayat sumber bagi setiap amaun.','Semak jadual individu setelah murid lengkapkan sendiri.'],
     ['Baca catatan.','Kenal empat transaksi.','Tulis amaun pada lajur betul.','Semak baki RM2.20.'],
     'Berapakah harga majalah Bintang?', 'RM2.80.',
     'Jadual individu dengan wang masuk RM10.00 dan baki RM2.20.',
     'Wang masuk, wang keluar dan baki benar menurut petikan.',
     'Betulkan amaun yang tersalah lajur.'),
    challenge:G('Terangkan padanan amaun dan baki secara ringkas tanpa menambah tugasan matematik lain.',
     'Lengkapkan jadual dengan tepat dan jelaskan mengapa baki tinggal RM2.20.',
     ['Minta bukti dua penerimaan dan dua perbelanjaan.','Semak kesetaraan belanja campur baki dengan jumlah wang awal.'],
     ['Catat semua urus niaga.','Semak empat amaun.','Tulis baki.','Jelaskan semakan RM10.00.'],
     'Mengapakah baki RM2.20?', 'RM10.00 ditolak RM5.00 hadiah dan RM2.80 majalah.',
     'Jadual tepat berserta alasan baki berdasarkan petikan.',
     'Semua amaun dan lajur benar serta baki dapat diterangkan.',
     'Perjelas beza wang keluar dan baki jika masih keliru.')
   },
   pbd:{method:'Semakan penulisan catatan kewangan individu menggunakan jadual halaman 149.',
    evidence:'Dua penerimaan RM5.00, hadiah RM5.00, majalah RM2.80 dan baki simpan RM2.20 dicatat pada lajur berkaitan; RM10.00 disemak.',
    criterion:'Sekurang-kurangnya empat transaksi masuk/keluar tepat dan baki RM2.20 diisi dengan betul.'},
   reflection:'Murid disemak: ____ / ____. Empat transaksi tepat: ____. Baki RM2.20 tepat: ____. Keliru lajur wang masuk/keluar: ____. Susulan: ____.'
  }
};
function applies(map,opts={}){
 const p=plans[Number(map?.session_no)];if(!p)return false;
 const meta=map?.source_evidence?.meta||{};
 const key=opts.subjectKey||map?.subject_key||(typeof root.rphSubjectKey==='function'?root.rphSubjectKey(map?.subject_id):'');
 const source=norm(map?.source_evidence?.textbook?.text).toLowerCase();
 return key==='bm'&&Number(map?.year)===1&&Number(map?.academic_year)===2026
  &&Number(map?.week_no)===37&&map?.verification_status==='verified'
  &&map?.week_exact===true&&map?.sp_crosscheck===true
  &&meta.session_exact===true&&meta.page_route_verified===true
  &&norm(meta.main_sp||map?.sp)===p.sp&&norm(map?.sp)===p.sp
  &&Number(map?.textbook_page_start)===p.page&&Number(map?.textbook_page_end||p.page)===p.page
  &&norm(map?.title).toLowerCase()===p.title.toLowerCase()
  &&p.anchors.every(a=>source.includes(a));
}
function detail(x,page){return 'Tindakan guru: '+x.teacher.join('\n')+'\nTindakan murid: '+x.pupils.join('\n')
 +'\nSemakan: '+x.check+'\nBahan: Buku Teks m/s '+page;}
function build(map,opts={}){
 if(!applies(map,opts))throw Error('BM1_WEEK37_SOURCE_PLAN_SCOPE_MISMATCH');
 const p=plans[Number(map.session_no)],canonical=root.BmYear1CanonicalRph?.build(map,opts);
 if(!canonical)throw Error('BM1_CANONICAL_ENGINE_REQUIRED');
 const phases=p.phases.map(x=>({...x,resources:['Buku Teks m/s '+p.page]}));
 const sourceSteps=phases.map((x,i)=>({key:'bm1-w37-s'+map.session_no+'-step-'+(i+1),
  name:x.name,text:detail(x,p.page),bbm:'Buku Teks m/s '+p.page,pak21:p.pak,phase:'source-specific-teacher-design'}));
 const differentiation={},librarySteps={};
 for(const key of ['support','core','challenge']){
  const g=p.lanes[key],label={support:'Peneroka',core:'Pembina',challenge:'Pencabar'}[key];
  differentiation[key]={label,support_description:g.description,task:g.task,
   materials:['Buku Teks m/s '+p.page],teacher:g.teacher,pupil_steps:g.pupil_steps,
   example:{teacher:g.question,pupil:g.answer},product:g.product,criterion:g.criterion,next_step:g.next_step};
  librarySteps[key]=[{key:'bm1-w37-s'+map.session_no+'-'+key,name:label,
   text:'Tugasan sumber: '+g.task,bbm:'Buku Teks m/s '+p.page,pak21:p.pak,phase:'source-specific-teacher-design'}];
 }
 const first=phases[0],last=phases[phases.length-1];
 return {...canonical,canonicalBm1:true,sourcePlanBm1:true,
  sourcePlanReviewStatus:'LESSON_MAP_EVIDENCE_NOT_WORD_APPROVED',sourcePlanTeacherReviewNeeded:true,
  sourcePlanSession:'BM1-2026B-W37-S'+map.session_no,sourcePlanVersion:VERSION,canonicalVersion:VERSION,
  sourceTask:p.task,anchor:p.task,phases,sourceSteps,classroomFlow:sourceSteps,
  differentiation,librarySteps,groupBbm:{support:'Buku Teks m/s '+p.page,
   core:'Buku Teks m/s '+p.page,challenge:'Buku Teks m/s '+p.page},
  bbmList:['Buku Teks m/s '+p.page],pak21:p.pak,pakDetail:p.pak,
  pbd:p.pbd,pbdEvidence:p.pbd,reflection:p.reflection,intervention:[],
  inductionData:{name:first.name,text:detail(first,p.page),bbm:'Buku Teks m/s '+p.page,pak21:p.pak},
  setInduksi:detail(first,p.page),penutup:detail(last,p.page),
  diffSupportAct:differentiation.support.task,diffCoreAct:differentiation.core.task,
  diffChallengeAct:differentiation.challenge.task,page:'m/s '+p.page,mainSp:p.sp,topic:p.title
 };
}
root.BmYear1Week37SourcePlans={VERSION,availableSessions:[1,2,3],applies,build};
try{if(typeof module!=='undefined'&&module.exports)module.exports=root.BmYear1Week37SourcePlans}catch{}
})(typeof window!=='undefined'?window:globalThis);
