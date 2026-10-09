// BM Tahun 1, Kumpulan B 2026, Minggu 37: lesson-specific pedagogi berasaskan
// Lesson Map verified + bukti Buku Teks m/s 147–149. BELUM Word approved.
// M37 S4 DITAHAN: RPT/DSKP map SP 5.3.2 tetapi Buku Teks m/s 150
// mencetak 5.3.3(i)(ii). Jangan secara automatik membetulkan SP.
(function(root){
'use strict';
const VERSION='BM1-W37-SOURCE-PLANS-20261009h';
const norm=x=>String(x??'').replace(/\s+/g,' ').trim();
const phase=(name,teacher,pupils,check)=>({name,teacher,pupils,check});
const lane=(description,task,teacher,pupils,question,answer,product,criterion,next)=>({
 description,task,teacher,pupils,question,answer,product,criterion,next
});
const plans={
  1:{
    title:'Membeli Baju Sukan',sp:'1.2.2',page:147,
    anchors:['membeli baju sukan','baju sukan wira','baju sukan juara','rm8.90','rm9.90'],
    task:'Menyampaikan sekurang-kurangnya tiga persamaan/perbezaan Wira dan Juara serta memilih satu baju dengan alasan daripada bahan m/s 147.',
    pak:'Banding–Bincang–Sampaikan: pasangan membaca iklan, lalu setiap murid membentangkan pilihan sendiri.',
    stages:[
      phase('Kenal iklan dua baju sukan',[
       'Buka Buku Teks m/s 147 dan bacakan dialog Hardip dan Aimi tentang membeli baju sukan.',
       'Minta murid mengenal dua nama produk Wira dan Juara; bezakan maklumat iklan daripada pendapat sendiri.'
      ],['Menunjukkan tajuk serta nama kedua-dua baju.','Menyatakan mengapa Aimi/Hardip membanding pilihan dalam dialog.'],
      'Murid mengenal produk yang hendak dibanding, bukan sekadar meneka harga.'),
      phase('Cari maklumat iklan secara teliti',[
       'Minta murid membaca kotak iklan Wira: tiga warna biru/putih/merah, corak menarik dan diskaun untuk 10 pembeli terawal.',
       'Minta murid membaca iklan Juara: dua warna putih/biru, lengan panjang atau pendek, cetak nama serta potongan harga 10%.',
      ],['Menunjukkan bukti tiga ciri Wira.','Menunjukkan bukti ciri Juara dalam kotak iklan yang berbeza.'],
      'Jangan kelirukan diskaun 10 pembeli terawal dengan potongan harga 10%.'),
      phase('Kenal pasti persamaan dan perbezaan',[
       'Bimbing murid mengenal persamaan warna biru/putih pada kedua-dua iklan serta perbezaan pilihan warna dan tawaran.',
       'Tunjukkan harga RM8.90/RM9.90 yang direkod dalam teks; minta murid mengesahkan setiap harga pada iklan bergambar sebelum memadankan dengan jenama.'
      ],['Menyampaikan sekurang-kurangnya satu persamaan.','Menyampaikan sekurang-kurangnya dua perbezaan dengan bukti iklan.'],
      'Harga tidak dipadankan kepada jenama daripada susun atur OCR semata-mata.'),
      phase('Bincang dan buat pilihan beralasan',[
       'Minta pasangan memilih baju mengikut ciri yang benar-benar ada dalam iklan.',
       'Modelkan rangka “Saya memilih ... kerana ...”, kemudian minta kedua-dua murid menyatakan pilihan sendiri.'
      ],['Berbincang kelebihan ciri setiap baju.','Menyatakan pilihan sendiri berserta satu alasan daripada iklan.'],
      'Pilihan boleh berbeza; alasan mesti sah daripada bahan, bukan andaian kualiti kain.'),
      phase('Pentaksiran penyampaian individu',[
       'Dengar setiap murid menyebut sekurang-kurangnya tiga persamaan/perbezaan dan satu pilihan beralasan.',
       'Catat isi yang tepat dan bantuan, serta galakkan pembetulan setelah murid menunjuk bukti sendiri.'
      ],['Menyampaikan perbandingan individu.','Menyatakan sebab memilih Wira atau Juara dan menunjuk bukti iklan.'],
      'PBD ialah respons murid sendiri; perbincangan pasangan bukan ganti pentaksiran.'),
      phase('Rumusan belanja berdasarkan maklumat',[
       'Rumuskan perbezaan antara ciri baju, harga yang disahkan pada gambar dan tawaran kedua-dua jenama.',
       'Minta murid berkongsi satu maklumat yang membantunya membuat pilihan.'
      ],['Menyebut satu persamaan atau perbezaan yang tepat.','Menyatakan cara memilih menggunakan bukti sumber.'],
      'Rumusan tidak menokok tambah ciri yang tidak tercetak.')
    ],
    groups:{
      support:lane('Bantu membaca satu kotak iklan pada satu masa dengan petunjuk warna/tawaran.',
       'Sebut tiga ciri untuk dibanding dan pilih baju dengan alasan ringkas.',
       ['Tunjuk warna bagi kedua-dua baju secara berasingan.','Sediakan rangka ayat pilihan tanpa menjawab bagi murid.'],
       ['Baca satu kotak iklan.','Kenal satu persamaan dan dua perbezaan.','Sebut satu pilihan dan sebab.'],
       'Apakah warna yang ada pada kedua-dua baju?', 'Biru dan putih.',
       'Perbandingan lisan sendiri dengan bantuan dicatat.',
       'Tiga maklumat tepat, pilihan mempunyai bukti daripada iklan.',
       'Ulang frasa iklan yang masih disalah kaitkan antara Wira dan Juara.'),
      core:lane('Banding dua iklan melalui perbincangan sebelum respons individu.',
       'Nyatakan tiga persamaan/perbezaan dan alasan memilih salah satu baju.',
       ['Minta murid menunjukkan maklumat yang menyokong tiga perbandingan.','Dengar pilihan murid tanpa memberikan keputusan yang wajib.'],
       ['Baca kotak iklan.','Banding pilihan warna, lengan dan tawaran.','Sampaikan pilihan dengan alasan sendiri.'],
       'Apakah perbezaan tawaran Wira dan Juara?', 'Wira menawarkan diskaun kepada 10 pembeli terawal; Juara menawarkan potongan harga 10%.',
       'Tiga perbandingan serta satu pilihan beralasan individu.',
       'Maklumat tawaran tidak tertukar dan pilihan disokong ciri yang wujud.',
       'Semak kembali tawaran atau ciri yang masih keliru.'),
      challenge:lane('Perincikan alasan pilihan dan banding jenis tawaran tanpa mengira diskaun yang tidak cukup data.',
       'Jelaskan tiga perbandingan dan alasan pilihan menggunakan beberapa ciri sumber.',
       ['Minta bukti untuk setiap ciri yang dibanding.','Ingatkan 10 orang pembeli awal bukan 10 peratus, serta pengiraan harga akhir tidak diwajibkan.'],
       ['Senaraikan maklumat iklan yang relevan.','Bina tiga perbandingan.','Jelaskan satu pilihan dengan dua sebab bersumber.'],
       'Bolehkah cetak nama pada kedua-dua baju?', 'Iklan menyebut boleh cetak nama pada baju Juara sahaja.',
       'Perbandingan lebih terperinci dan pilihan yang boleh dijustifikasikan.',
       'Setiap sebab disandarkan pada iklan, bukan dakwaan mutu produk yang tidak dinyatakan.',
       'Perkemas hujah yang belum menyokong pilihan.')
    },
    pbd:{method:'Pemerhatian tiga isi perbandingan dan pilihan beralasan dalam penyampaian lisan individu.',
      evidence:'Sekurang-kurangnya tiga persamaan/perbezaan sah (warna, ciri atau tawaran) dan satu pilihan beralasan daripada iklan Buku Teks m/s 147.',
      criterion:'Tiga maklumat tepat dan satu pilihan yang disokong sekurang-kurangnya satu alasan bersumber.'},
    reflection:'Murid disemak: ____ / ____. Tiga isi tepat: ____. Pilihan dengan alasan sah: ____. Keliru tawaran/harga: ____. Susulan: ____.'
  },
  2:{
    title:'Membuat Pilihan',sp:'2.3.2',page:148,
    anchors:['membuat pilihan','aimi','bekas air saya masih elok','buku latihan'],
    task:'Membaca dan menceritakan semula tiga peristiwa Aimi membeli buku latihan dan menolak bekas minuman yang tidak diperlukan menggunakan aksi daripada teks m/s 148.',
    pak:'Baca–Susun–Aksi: pasangan memadankan urutan cerita sebelum setiap murid menceritakan semula dengan aksi sendiri.',
    stages:[
      phase('Kenal tujuan Aimi ke pasar raya',[
       'Buka Buku Teks m/s 148 dan baca tajuk Membuat Pilihan.',
       'Minta murid menunjukkan ayat yang menyatakan Aimi ke pasar raya bersama ibu untuk membeli buku latihan.'
      ],['Menunjukkan watak dan tempat.','Menyatakan tujuan Aimi membeli barang.'],
      'Tujuan utama Aimi ialah membeli buku latihan, bukan bekas air.'),
      phase('Baca cerita mengikut peristiwa',[
       'Bimbing murid membaca petikan tentang bekas minuman berwarna-warni di sebelah rak buku.',
       'Modelkan dialog ibu mengizinkan Aimi membeli, serta jawapan Aimi bahawa bekas airnya masih elok.'
      ],['Membaca sebahagian teks bergilir.','Menunjukkan maklumat perubahan keputusan Aimi.'],
      'Murid dapat mengenal tiga bahagian cerita daripada ayat bercetak.'),
      phase('Susun tiga peristiwa utama',[
       'Bincang susunan: pergi membeli buku latihan; Aimi tertarik dan membelek bekas air; Aimi menolak pembelian dan meletakkan semula bekas itu.',
       'Minta murid menunjukkan ayat yang menyokong setiap peristiwa, bukan mencipta pembelian tambahan.'
      ],['Menyebut tiga peristiwa mengikut urutan.','Menjejak baris bagi tiap-tiap peristiwa.'],
      'Urutan dan sebab keputusan sepadan dengan teks halaman 148.'),
      phase('Latihan penceritaan dengan aksi',[
       'Modelkan aksi berpura-pura memerhati dan meletakkan semula bekas air tanpa alat sebenar.',
       'Minta murid menggunakan aksi yang sesuai sambil menceritakan tiga peristiwa; aksi tidak menggantikan isi yang perlu disebut.'
      ],['Menceritakan semula petikan dengan gerakan sederhana.','Menunjukkan keputusan menolak pembelian dengan aksi dan kata sendiri.'],
      'Aksi menggambarkan teks, bukan persembahan yang mengubah plot.'),
      phase('PBD penceritaan individu',[
       'Dengar setiap murid menceritakan sekurang-kurangnya tiga peristiwa dengan urutan dan aksi sepadan.',
       'Catat sama ada sebab Aimi tidak membeli bekas disebut dengan betul dan tahap bimbingan.'
      ],['Menceritakan secara individu.','Menyatakan bahawa bekas airnya masih elok dan pembelian tambahan membazir.'],
      'Bukti utama ialah urutan penceritaan dan aksi yang dilakukan murid sendiri.'),
      phase('Rumusan membuat pilihan berhemat',[
       'Rumuskan sebab Aimi kekal membeli barang yang diperlukan dan tidak membazir.',
       'Minta murid menyatakan satu pengajaran yang boleh dibuktikan dalam cerita.'
      ],['Menyebut satu pengajaran daripada keputusan Aimi.','Membaca satu bukti dalam teks.'],
      'Penutup tidak mengubah fokus SP membaca dan menceritakan semula.')
    ],
    groups:{
      support:lane('Petunjuk baris dan tiga peristiwa disusun secara berperingkat.',
       'Ceritakan tiga peristiwa dengan aksi selepas bacaan terbimbing.',
       ['Tunjuk peristiwa satu demi satu.','Modelkan gerakan mudah, kemudian minta murid bercerita dengan bantuan berkurang.'],
       ['Baca frasa cerita.','Susun tiga peristiwa.','Ceritakan sambil menunjukkan dua aksi.'],
       'Apakah yang Aimi hendak beli pada awal cerita?', 'Buku latihan.',
       'Penceritaan tiga peristiwa dan aksi individu dengan tahap bantuan.',
       'Peristiwa tepat dan menunjukkan Aimi tidak membeli bekas air.',
       'Latih semula satu peristiwa yang tertinggal dengan petunjuk ayat sumber.'),
      core:lane('Semak urutan bersama pasangan, tetapi bercerita sendiri.',
       'Ceritakan tiga peristiwa Aimi dengan dua atau lebih aksi dan sebab keputusan.',
       ['Tanya urutan dan sebab keputusan dalam petikan.','Dengar penceritaan individu dan catat kata kunci yang digunakan.'],
       ['Baca petikan.','Susun tiga isi.','Ceritakan semula dengan aksi.','Sebut sebab tidak membeli bekas.'],
       'Mengapa Aimi tidak membeli bekas air?', 'Bekas airnya masih elok dan membeli yang baharu membazir.',
       'Penceritaan individu lengkap dengan aksi dan satu sebab.',
       'Urutan, aksi serta keputusan Aimi sepadan dengan cerita.',
       'Betulkan urutan atau sebab jika tidak sepadan dengan teks.'),
      challenge:lane('Kembangkan hubungan sebab dan keputusan melalui penceritaan yang sama.',
       'Ceritakan tiga peristiwa dengan aksi dan terangkan satu sebab keputusan Aimi berhemah.',
       ['Minta murid menunjukkan ayat bagi keputusan akhir.','Elakkan menambah adegan pembelian atau watak yang tiada dalam sumber.'],
       ['Ceritakan tiga peristiwa.','Tunjukkan aksi bagi perubahan fikiran.','Terangkan sebab keputusan itu sesuai.'],
       'Apakah bukti Aimi mengutamakan keperluan?', 'Dia meletakkan semula bekas air dan hanya mahu membeli buku latihan.',
       'Cerita tiga peristiwa dengan aksi serta alasan bersumber.',
       'Plot tepat, urutan jelas dan sebab berlandaskan petikan.',
       'Perkemas penerangan tanpa menambah kejadian.')
    },
    pbd:{method:'Pemerhatian bacaan dan penceritaan semula tiga peristiwa dengan aksi oleh setiap murid.',
      evidence:'Tiga peristiwa tepat berurutan (tujuan membeli buku; tertarik bekas air; meletakkan semula) dan alasan bahawa bekas masih elok.',
      criterion:'Penceritaan menggunakan aksi sepadan, urutan betul dan keputusan Aimi diterangkan tanpa maklumat rekaan.'},
    reflection:'Murid disemak: ____ / ____. Tiga peristiwa mengikut urutan: ____. Aksi sesuai: ____. Sebab keputusan tepat: ____. Susulan: ____.'
  },
  3:{
    title:'Catatan Jamil',sp:'3.2.3',page:149,
    anchors:['catatan jamil','rm5.00','rm2.80','rm2.20','wang masuk'],
    task:'Mencatat sumber wang ayah/ibu, hadiah ayah, majalah dan baki Jamil ke dalam jadual wang masuk dan wang keluar Buku Teks m/s 149.',
    pak:'Baca–Kesan–Catat: murid membanding ayat petikan dengan lajur jadual, kemudian melengkapkan catatan individu.',
    stages:[
      phase('Kenal catatan Jamil tentang wang',[
       'Buka Buku Teks m/s 149 dan baca tajuk Catatan Jamil bersama murid.',
       'Tunjukkan lajur Wang Masuk dan Wang Keluar pada jadual bercetak; jelaskan bahawa baki disimpan selepas perbelanjaan.'
      ],['Membaca tajuk dan petikan ringkas.','Menunjukkan dua kategori catatan dalam jadual.'],
      'Murid membezakan wang diterima dan wang dibelanjakan.'),
      phase('Jejak sumber wang masuk',[
       'Bimbing bacaan petikan: ayah memberi RM5.00 dan ibu memberi RM5.00 kerana pencapaian Jamil.',
       'Minta murid menunjukkan dua sumber wang dan jumlah RM10.00 dalam petikan.'
      ],['Menunjuk RM5.00 bagi ayah dan RM5.00 bagi ibu.','Menyebut jumlah wang diterima RM10.00.'],
      'Jumlah daripada ayat petikan, bukan daripada susunan lajur OCR yang mungkin tersalah.'),
      phase('Jejak perbelanjaan dan baki',[
       'Bimbing murid mendapatkan dua perbelanjaan: hadiah untuk ayah RM5.00 dan majalah Bintang RM2.80.',
       'Tunjuk catatan baki RM2.20 yang disimpan, lalu kaitkan kepada keseluruhan wang RM10.00.'
      ],['Menyebut nilai hadiah dan majalah.','Menunjukkan baki RM2.20 serta cara membezakannya daripada perbelanjaan.'],
      'RM5.00 + RM2.80 + RM2.20 bersamaan RM10.00; baki bukan wang diterima tambahan.'),
      phase('Pindahkan maklumat ke jadual sendiri',[
       'Minta murid mengisi wang daripada ayah, ibu, belanja hadiah, majalah dan baki di ruangan betul seperti jadual bercetak.',
       'Tekankan menyalin maklumat **daripada petikan** kepada jadual, bukan mencipta urus niaga baharu atau tugasan Matematik berasingan.'
      ],['Mengisi sekurang-kurangnya empat maklumat wang dalam jadual sendiri.','Memeriksa lajur dan ejaan ringkas berdasarkan buku.'],
      'Sekurang-kurangnya empat catatan tepat dan lajur Wang Masuk/Wang Keluar sesuai.'),
      phase('PBD catatan individu serta semakan baki',[
       'Semak empat atau lebih catatan individu dan keselarasan wang diterima RM10.00 dengan perbelanjaan serta baki.',
       'Minta murid membetulkan satu maklumat/lajur tidak sepadan setelah menunjuk ayat petikan yang berkaitan.'
      ],['Menunjukkan jadual hasil sendiri.','Membetulkan lajur yang salah dan menyemak baki RM2.20.'],
      'PBD daripada jadual individu; bantuan dan catatan yang belum benar direkod.'),
      phase('Rumusan berbelanja dan menyimpan',[
       'Rumuskan tujuan Jamil menggunakan sebahagian wang untuk hadiah, membeli majalah dan menyimpan bakinya.',
       'Minta murid menunjukkan satu catatan wang masuk dan satu wang keluar daripada jadual mereka.'
      ],['Menyebut satu perkara yang Jamil beli.','Menunjukkan baki yang disimpan dalam petikan.'],
      'Rumusan berasaskan pengurusan wang dan kemahiran mencatat SP 3.2.3.')
    ],
    groups:{
      support:lane('Petunjuk petikan dibaca satu demi satu sebelum mengisi jadual.',
       'Catat sekurang-kurangnya empat maklumat wang dengan bimbingan dan semak baki.',
       ['Bantu cari dua wang masuk dahulu sebelum dua wang keluar.','Tunjukkan lajur yang perlu dipilih tanpa melengkapkan keseluruhan jadual murid.'],
       ['Baca jumlah pemberian ibu/ayah.','Catat penerimaan dan belanja di lajur betul.','Semak baki RM2.20.'],
       'Berapakah jumlah wang diberi oleh ayah dan ibu?', 'RM10.00.',
       'Jadual wang masuk/keluar individu dengan bantuan dicatat.',
       'Empat isi tepat mengikut petikan dan sekurang-kurangnya satu baki dikenal.',
       'Ulang satu baris yang dimasukkan dalam lajur tidak sepadan.'),
      core:lane('Pasangan semak bacaan petikan; jadual akhir disiapkan sendiri.',
       'Isi jadual wang masuk/keluar dengan empat atau lebih fakta dan semak baki.',
       ['Minta murid menunjukkan ayat untuk setiap catatan.','Semak kategori wang masuk, perbelanjaan dan baki hasil kerja individu.'],
       ['Cari dua sumber wang.','Cari dua perbelanjaan dan baki.','Isi jadual sendiri.','Semak jumlah RM10.00.'],
       'Berapa baki wang Jamil selepas membeli hadiah dan majalah?', 'RM2.20.',
       'Jadual catatan individu dengan sekurang-kurangnya empat fakta tepat.',
       'Penerimaan RM10.00 dan catatan belanja/baki mengikut jumlah sumber.',
       'Baiki kesilapan wang masuk atau wang keluar.'),
      challenge:lane('Jelaskan sebab baki tidak dikelaskan sebagai pemberian wang baharu.',
       'Lengkapkan jadual dan terangkan hubungan dua perbelanjaan dengan baki.',
       ['Bimbing murid menerangkan kategori baki menggunakan petikan.','Jangan menganggap OCR lajur “Wang daripada ibu -” mengatasi ayat cerita bahawa ibu memberi RM5.00.'],
       ['Isi jadual sendiri.','Banding sumber wang dan perbelanjaan.','Jelaskan jumlah RM10.00 serta baki RM2.20.'],
       'Mengapa baki RM2.20 bukan wang baharu?', 'Baki ialah wang yang tinggal daripada RM10.00 selepas hadiah RM5.00 dan majalah RM2.80.',
       'Jadual lengkap dan penerangan ringkas baki berasaskan sumber.',
       'Catatan dan kategori tepat tanpa menambah penerimaan atau pembelian yang tidak dinyatakan.',
       'Semak semula kaitan ayat petikan dan lajur yang masih keliru.')
    },
    pbd:{method:'Semakan jadual wang masuk, wang keluar dan baki yang dilengkapkan oleh murid secara individu.',
      evidence:'Wang ayah RM5.00, ibu RM5.00, hadiah ayah RM5.00, majalah Bintang RM2.80 dan baki RM2.20 dipadankan dengan ruang sesuai.',
      criterion:'Sekurang-kurangnya empat maklumat tepat, wang diterima RM10.00 dan baki RM2.20 disemak dengan betul.'},
    reflection:'Murid disemak: ____ / ____. Empat catatan tepat: ____. Lajur wang masuk/keluar betul: ____. Baki RM2.20 tepat: ____. Susulan: ____.'
  }
};
function applies(map,opts={}){
 const p=plans[Number(map?.session_no)];if(!p)return false;
 const meta=map?.source_evidence?.meta||{};
 const key=opts.subjectKey||map?.subject_key||(typeof root.rphSubjectKey==='function'?root.rphSubjectKey(map?.subject_id):'');
 const book=norm(map?.source_evidence?.textbook?.text).toLowerCase();
 return key==='bm'&&Number(map?.year)===1&&Number(map?.academic_year)===2026
  &&Number(map?.week_no)===37&&map?.verification_status==='verified'
  &&map?.week_exact===true&&map?.sp_crosscheck===true
  &&meta.session_exact===true&&meta.page_route_verified===true
  &&norm(meta.main_sp||map?.sp)===p.sp&&norm(map?.sp)===p.sp
  &&Number(map?.textbook_page_start)===p.page&&Number(map?.textbook_page_end||p.page)===p.page
  &&norm(map?.title).toLowerCase()===p.title.toLowerCase()
  &&p.anchors.every(a=>book.includes(a));
}
const stepText=(x,page)=>'Tindakan guru: '+x.teacher.join('\n')+'\nTindakan murid: '+x.pupils.join('\n')
 +'\nSemakan: '+x.check+'\nBahan: Buku Teks m/s '+page;
function build(map,opts={}){
 if(!applies(map,opts))throw Error('BM1_WEEK37_SOURCE_PLAN_SCOPE_MISMATCH');
 const p=plans[Number(map.session_no)],canon=root.BmYear1CanonicalRph?.build(map,opts);
 if(!canon)throw Error('BM1_CANONICAL_ENGINE_REQUIRED');
 const phases=p.stages.map(x=>({...x,resources:['Buku Teks m/s '+p.page]}));
 const sourceSteps=phases.map((x,i)=>({key:'bm1-w37-s'+map.session_no+'-step-'+(i+1),
  name:x.name,text:stepText(x,p.page),bbm:'Buku Teks m/s '+p.page,pak21:p.pak,
  phase:'source-specific-teacher-design'}));
 const differentiation={},librarySteps={};
 for(const key of ['support','core','challenge']){
  const d=p.groups[key],label={support:'Peneroka',core:'Pembina',challenge:'Pencabar'}[key];
  differentiation[key]={label,support_description:d.description,task:d.task,
   materials:['Buku Teks m/s '+p.page],teacher:d.teacher,pupil_steps:d.pupils,
   example:{teacher:d.question,pupil:d.answer},product:d.product,criterion:d.criterion,next_step:d.next};
  librarySteps[key]=[{key:'bm1-w37-s'+map.session_no+'-'+key,name:label,
   text:'Tugasan sumber: '+d.task,bbm:'Buku Teks m/s '+p.page,pak21:p.pak,
   phase:'source-specific-teacher-design'}];
 }
 const first=phases[0],last=phases.at(-1);
 return {...canon,canonicalBm1:true,sourcePlanBm1:true,
  sourcePlanVersion:VERSION,canonicalVersion:VERSION,
  sourcePlanReviewStatus:'LESSON_MAP_EVIDENCE_NOT_WORD_APPROVED',
  sourcePlanTeacherReviewNeeded:true,sourcePlanSession:'BM1-2026B-W37-S'+map.session_no,
  sourceTask:p.task,anchor:p.task,phases,sourceSteps,classroomFlow:sourceSteps,
  differentiation,librarySteps,groupBbm:{support:'Buku Teks m/s '+p.page,
   core:'Buku Teks m/s '+p.page,challenge:'Buku Teks m/s '+p.page},
  bbmList:['Buku Teks m/s '+p.page],pak21:p.pak,pakDetail:p.pak,
  pbd:p.pbd,pbdEvidence:p.pbd,reflection:p.reflection,intervention:[],
  inductionData:{name:first.name,text:stepText(first,p.page),bbm:'Buku Teks m/s '+p.page,pak21:p.pak},
  setInduksi:stepText(first,p.page),penutup:stepText(last,p.page),
  diffSupportAct:differentiation.support.task,diffCoreAct:differentiation.core.task,
  diffChallengeAct:differentiation.challenge.task,page:'m/s '+p.page,mainSp:p.sp,topic:p.title
 };
}
root.BmYear1Week37SourcePlans={VERSION,availableSessions:[1,2,3],applies,build};
try{if(typeof module!=='undefined'&&module.exports)module.exports=root.BmYear1Week37SourcePlans}catch{}
})(typeof window!=='undefined'?window:globalThis);
