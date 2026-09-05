(function(){
'use strict';
const sk=m=>{try{return window.rphSubjectKey?.(m?.subject_id)||''}catch{return''}};
const sp=m=>String(m?.source_evidence?.meta?.main_sp||m?.source_evidence?.meta?.main_ls||m?.learning_standard||String(m?.sp||'').split(',')[0]||'').trim();
const yr=m=>Number(m?.year||0)||0,wk=m=>Number(m?.week_no||m?.week||0)||0,se=m=>Number(m?.session_no||m?.session||0)||0,pg=m=>Number(m?.textbook_page_start||0)||0;
const key=m=>`${sp(m)}@${pg(m)}|W${wk(m)}|S${se(m)}`;
const sourceKey=m=>`${pg(m)}|${sp(m)}`;
const step=(key,name,text,bbm,pak21)=>({key,name,text,bbm,pak21,phase:'source'});
const ROUTES={
"10.1.1@89|W36|S1":"w36s1","10.1.1@89|W36|S2":"w36s2",
"10.1.2@90|W36|S3":"w36s3","10.1.2@90|W36|S4":"w36s4",
"10.1.3@92|W36|S5":"w36s5",
"10.1.3@95|W37|S1":"w37s1","10.1.4@95|W37|S2":"w37s2",
"10.1.4@96|W37|S3":"w37s3","10.1.5@96|W37|S4":"w37s4","10.1.5@97|W37|S5":"w37s5"
};
const REVIEW=new Set([
"10.1.1@89|W36|S1","10.1.1@89|W36|S2",
"10.1.2@90|W36|S3","10.1.2@90|W36|S4",
"10.1.3@95|W37|S1"
]);
const SOURCE={
"89|10.1.1":{title:"Pengenalan Unit 10 — Asas Binaan",task:"Perhatikan model istana dan ikan pada Buku Teks m/s 89. Kenal pasti bentuk asas yang dapat dilihat pada model dan bincangkan bagaimana bentuk-bentuk itu digunakan dalam binaan sumber.",induction:"Guru memaparkan model istana dan ikan pada m/s 89 lalu meminta murid menyebut bentuk yang dapat dilihat tanpa memberi semua nama terlebih dahulu.",support:"Murid menunjuk sekurang-kurangnya dua bentuk pada model sumber dan memilih kad nama yang sesuai dengan bimbingan.",core:"Murid mengenal pasti beberapa bentuk pada model istana dan ikan serta menerangkan bahagian model yang menggunakan bentuk tersebut.",challenge:"Murid membandingkan penggunaan dua bentuk pada model sumber dan menerangkan perbezaannya berdasarkan gambar.",closure:"Murid menyebut dua bentuk yang dapat dilihat pada model sumber.",pak21:"Visual Evidence Talk / Think-Pair-Share",evidence:"mengenal pasti sekurang-kurangnya dua bentuk asas pada model sumber dan menunjukkan bahagian yang sepadan"},
"90|10.1.2":{title:"Bentuk Asas 2D — Route Perlu Semakan",task:"Kekalkan tugasan sebenar Buku Teks m/s 90 dan sambungan m/s 91: kenal pasti segitiga, segi empat sama, segi empat tepat dan bulatan pada kad/objek, kumpulkan gambar objek mengikut bentuk asas dan jelaskan hasil kerja. Jangan tukar halaman ini kepada aktiviti bongkah 3D untuk memaksa SP route.",induction:"Guru menunjukkan kad ucapan m/s 90 dan meminta murid mencari bentuk asas yang kelihatan.",support:"Murid memadankan empat bentuk asas dengan gambar objek menggunakan kad bentuk.",core:"Murid mengelaskan gambar objek mengikut empat bentuk asas seperti aktiviti sumber dan menyemak hasil dengan kumpulan.",challenge:"Murid menerangkan satu perbezaan antara pengelasan kumpulan berdasarkan gambar yang dikumpulkan.",closure:"Murid menyebut empat bentuk asas 2D yang digunakan dalam aktiviti sumber.",pak21:"Sorting / Gallery Check",evidence:"menyelesaikan aktiviti pengelasan bentuk asas 2D pada halaman sumber dengan sekurang-kurangnya empat padanan yang betul"},
"92|10.1.3":{title:"Bongkah Bentuk Asas → Membina Robot",task:"Mulakan bahagian Bongkah Bentuk Asas pada Buku Teks m/s 92 dan ikuti sambungan sumber hingga aktiviti Membina Robot pada m/s 94: kenal pasti bongkah yang digunakan di sekeliling, lakar reka bentuk robot, bentukkan bongkah menggunakan tanah liat, cantum menjadi robot dan jelaskan hasil binaan.",induction:"Guru menunjukkan beberapa objek pada bahagian Bongkah Bentuk Asas dan meminta murid menamakan bongkah yang dapat dikenal pasti.",support:"Murid memilih beberapa bongkah bentuk asas dan melakar robot mudah dengan templat/bimbingan sebelum membina.",core:"Murid mengikuti aktiviti sumber: melakar reka bentuk, membentuk bongkah asas, mencantumkannya menjadi robot dan menerangkan bongkah yang digunakan.",challenge:"Selepas tugasan sumber siap, murid membandingkan dua pilihan bongkah pada robot dan menerangkan bagaimana perubahan bongkah mengubah rupa atau kestabilan binaan berdasarkan hasil sebenar.",closure:"Murid mempamerkan robot dan menamakan sekurang-kurangnya dua bongkah yang digunakan.",pak21:"Design-and-Build / Gallery Walk",evidence:"menghasilkan satu binaan robot daripada beberapa bongkah bentuk asas dan menamakan sekurang-kurangnya dua bongkah yang digunakan"},
"95|10.1.3":{title:"Pentingnya Bentuk Bongkah — Route Perlu Semakan",task:"Kekalkan tugasan sebenar Buku Teks m/s 95: perhatikan contoh bola sfera dan jam meja kuboid, kemudian bincangkan mengapa bentuk bongkah dipilih mengikut kegunaan objek. Jangan tukar halaman ini kepada aktiviti mereka bentuk untuk memaksa SP route.",induction:"Guru menunjukkan bola dan jam meja daripada m/s 95 lalu bertanya mengapa kedua-duanya menggunakan bentuk yang berbeza.",support:"Murid memadankan dua objek dengan bentuk bongkah dan memilih alasan yang sesuai berdasarkan situasi sumber.",core:"Murid menerangkan mengapa sfera sesuai untuk bola dan kuboid sesuai untuk jam meja dengan merujuk contoh sumber.",challenge:"Murid membandingkan dua bentuk bongkah pada situasi sumber dan menjelaskan kesan jika bentuknya ditukar.",closure:"Murid melengkapkan ayat 'Bentuk ___ sesuai untuk ___ kerana ___' berdasarkan sumber.",pak21:"Scenario Talk / Pair Check",evidence:"menerangkan sekurang-kurangnya dua hubungan antara bentuk bongkah dan kegunaan objek berdasarkan situasi sumber"},
"95|10.1.4":{title:"Pentingnya Bentuk Bongkah",task:"Gunakan Buku Teks m/s 95 untuk menaakul kepentingan pelbagai bentuk bongkah berdasarkan contoh bola berbentuk sfera dan jam meja berbentuk kuboid serta kesannya terhadap kegunaan objek.",induction:"Guru menunjukkan dua bentuk objek daripada sumber dan meminta murid meramal bentuk yang lebih sesuai untuk kegunaan tertentu.",support:"Murid memadankan objek dengan bongkah dan menyatakan satu sebab berdasarkan gambar sumber.",core:"Murid menerangkan kepentingan sfera dan kuboid dalam contoh sumber dengan menghubungkan bentuk kepada fungsi.",challenge:"Murid menerangkan apa yang berlaku jika bentuk objek dalam contoh ditukar dan menyokong jawapan dengan ciri yang diperhatikan.",closure:"Murid menyatakan satu bentuk bongkah dan sebab bentuk itu sesuai untuk kegunaan objek.",pak21:"Reason-and-Share",evidence:"memberikan sekurang-kurangnya dua alasan tentang kepentingan bentuk bongkah berdasarkan kegunaan objek dalam sumber"},
"96|10.1.4":{title:"Mari Ulang Kaji — Bentuk dan Bongkah",task:"Selesaikan item Mari Ulang Kaji Buku Teks m/s 96: nyatakan bentuk asas/bongkah bagi objek, kenal pasti bentuk pada jam, dan pilih kotak yang lebih sesuai untuk menyimpan buku dengan memberikan sebab.",induction:"Guru menjalankan kuiz pantas menggunakan satu item bentuk asas dan satu item bongkah daripada m/s 96.",support:"Murid menjawab item dengan kad pilihan dan menerangkan satu sebab menggunakan rangka ayat.",core:"Murid menyelesaikan item ulang kaji dan menerangkan sebab pemilihan kotak yang sesuai berdasarkan bentuk/kegunaan.",challenge:"Murid mempertahankan jawapan item sebab dengan merujuk bentuk dan kegunaan, bukan tekaan.",closure:"Murid berkongsi satu jawapan ulang kaji dan alasan ringkas.",pak21:"Quiz / Evidence Talk",evidence:"menjawab sekurang-kurangnya tiga item ulang kaji dan memberikan satu alasan yang menghubungkan bentuk bongkah dengan kegunaan"},
"96|10.1.5":{title:"Mari Ulang Kaji — Komunikasi Pemerhatian",task:"Gunakan item Mari Ulang Kaji m/s 96 sebagai bukti untuk menjelaskan pemerhatian tentang bentuk dan hasil binaan melalui lisan, lakaran atau penulisan, termasuk alasan memilih bentuk kotak yang sesuai.",induction:"Guru meminta murid memilih satu item ulang kaji dan menerangkan apa yang diperhatikan pada bentuk objek.",support:"Murid melengkapkan satu jawapan dengan rangka ayat atau lakaran berlabel.",core:"Murid menjawab item sumber dan menerangkan sekurang-kurangnya satu pemerhatian tentang bentuk/bongkah secara lisan atau bertulis.",challenge:"Murid menghasilkan penerangan berlabel yang menghubungkan bentuk, kegunaan dan bukti daripada item sumber.",closure:"Murid berkongsi satu penerangan atau lakaran berlabel daripada ulang kaji.",pak21:"Evidence Talk / Exit Ticket",evidence:"menjelaskan sekurang-kurangnya satu pemerhatian tentang bentuk atau bongkah melalui lisan, lakaran atau penulisan berdasarkan item sumber"},
"97|10.1.5":{title:"Ingat Semula / Rekreasi Sains — Bekas Alat Tulis",task:"Gunakan Buku Teks m/s 97 untuk mengingat semula bentuk/bongkah dan menghasilkan Bekas Alat Tulis daripada kotak terbuang seperti arahan Rekreasi Sains; selepas binaan siap, jelaskan hasil melalui lisan, lakaran atau penulisan.",induction:"Guru menunjukkan beberapa kotak terbuang dan meminta murid menamakan bongkah bentuk asas yang dapat dilihat.",support:"Murid membina bekas alat tulis dengan bimbingan dan menamakan sekurang-kurangnya satu bongkah yang digunakan.",core:"Murid menghasilkan bekas alat tulis berdasarkan arahan sumber dan menerangkan bongkah yang digunakan serta hasil binaan.",challenge:"Murid menghasilkan lakaran berlabel atau penerangan ringkas tentang hasil binaan dan alasan pemilihan satu bongkah selepas projek sumber siap.",closure:"Murid mempamerkan bekas alat tulis dan menerangkan sekurang-kurangnya satu pemerhatian tentang hasil binaan.",pak21:"Project-Based Learning / Gallery Walk",evidence:"menghasilkan bekas alat tulis dan menjelaskan sekurang-kurangnya satu pemerhatian tentang hasil binaan melalui lisan, lakaran atau penulisan"}
};
const REVIEW_NOTE='Padanan SP/halaman perlu semakan guru. Kekalkan tugasan sebenar Buku Teks; jangan cipta aktiviti lain untuk memaksa padanan.';
function mode(m){return sk(m)==='science'&&yr(m)===1?(ROUTES[key(m)]||''):''}
function blueprint(m){
 const md=mode(m);if(!md)return null;
 const p=pg(m),src=SOURCE[sourceKey(m)];if(!src)return null;
 const route=key(m),align=REVIEW.has(route),bt=`Buku Teks Sains Tahun 1 m/s ${p}`,criterion=`Murid dapat ${src.evidence}.`;
 const provenance={
  route,rpt:'RPT_Sains_Tahun1_2026_KumpulanB_Murni.docx',mapping:'RPT_Sains_Tahun1_2026_KumpulanB_Mapping.xlsx',
  dskp:'DSKP KSSR SAINS TAHUN 1 (SEMAKAN 2017).pdf',textbook:'sains-tahun-1-sk.pdf',textbookAnchor:bt,generateFlag:'YES',
  unit:'Unit 10: Asas Binaan',weekPolicy:'Blueprint ini hanya W36-W37.',
  sourceContinuationPolicy:'Route p.92 menggunakan bahagian sumber yang bermula pada m/s 92 dan bersambung hingga aktiviti Membina Robot m/s 94; halaman sambungan bukan route baharu.',
  revisionPolicy:'W38 ialah Revision CONDITIONAL tanpa SP/page anchor khusus. Guru pilih SP/sumber sebenar berdasarkan PBD; blueprint Unit 10 tidak auto-route W38.',
  assessmentPolicy:'W39-W40 ialah UASA NO; W41-W42 Pengurusan Akhir Tahun NO. Tiada RPH Sains biasa diroute di sini.',
  mappingPolicy:'Gunakan exact SP@BT-printed-page|Wweek|Ssession daripada mapping; jangan bina semula Lesson Mapping.',
  activityBookPolicy:'Buku Aktiviti tidak digunakan sebagai sumber kandungan dalam blueprint ini; jangan reka aktiviti Buku Aktiviti.',
  alignmentReviewRequired:align,alignmentReviewNote:align?REVIEW_NOTE:'',
  verificationPolicy:'Blueprint runtime ini tidak mengubah Lesson Mapping atau verification status.'
 };
 const mk=(tier,text)=>[step(`sc1-u10-${md}-${tier}`,tier==='s'?'Sokongan':tier==='c'?'Tugasan Sumber':'Cabaran',text,bt,tier==='s'?'Bimbingan Berstruktur':tier==='c'?src.pak21:'Cabaran Kendiri')];
 return{
  method:'Source-first Sains Tahun 1 Unit 10 menggunakan RPT + DSKP + tugasan sebenar Buku Teks',
  source:'RPT Sains Tahun 1 + DSKP Sains Tahun 1 + Buku Teks Sains Tahun 1',provenance,generateFlag:'YES',conditional:false,
  reviewRequired:align,alignmentReviewRequired:align,alignmentReviewNote:align?REVIEW_NOTE:'',
  anchor:`${src.title} — ${bt}`,kind:'source_blueprint',
  objective:`Pada akhir PdP, murid dapat ${src.evidence}.`,successCriteria:criterion,criteria:criterion,
  induction:src.induction,support:mk('s',src.support),core:mk('c',src.core),challenge:mk('h',src.challenge),
  sourceTask:src.task,exactSourceTask:src.task,
  activityLibraryPolicy:'Activity Library may vary delivery only and must not determine lesson content',
  activityBookPolicy:provenance.activityBookPolicy,pak21:src.pak21,bbm:[bt,'RPT Sains Tahun 1 (Kumpulan B)'],
  pbdEvidence:`Perhatikan sama ada ${criterion.toLowerCase()}`,pbd:{method:'Pemerhatian guru dan bukti tugasan sumber',evidence:criterion},
  closure:src.closure,_runtime_science_year1_unit10_mode:md,_runtime_science_year1_unit10_source_blueprint:true,
  _runtime_science_year1_unit10_alignment_review_required:align
 };
}
const oe=window.effectiveRphLessonMap;
if(typeof oe==='function')window.effectiveRphLessonMap=function(map,...args){
 const out=oe.call(this,map,...args),bp=blueprint(out);if(!bp)return out;
 return{...out,objective:bp.objective,success_criteria:bp.successCriteria,successCriteria:bp.successCriteria,
 source_evidence:{...(out?.source_evidence||{}),runtime_science_year1_unit10:{source:bp.source,anchor:bp.anchor,source_task:bp.sourceTask,provenance:bp.provenance}},
 _runtime_science_year1_unit10_mode:bp._runtime_science_year1_unit10_mode,_runtime_science_year1_unit10_source_blueprint:true,
 _runtime_science_year1_unit10_alignment_review_required:bp.alignmentReviewRequired};
};
const op=window.buildSourceAwarePedagogy;
if(typeof op==='function')window.buildSourceAwarePedagogy=function(map,...args){return blueprint(map)||op.call(this,map,...args)};
window.rphScienceYear1Unit10SourceBlueprint=blueprint;
})();