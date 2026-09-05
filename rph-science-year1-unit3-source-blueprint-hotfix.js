(function(){
'use strict';
const sk=m=>{try{return window.rphSubjectKey?.(m?.subject_id)||''}catch{return''}};
const sp=m=>String(m?.source_evidence?.meta?.main_sp||m?.source_evidence?.meta?.main_ls||m?.learning_standard||String(m?.sp||'').split(',')[0]||'').trim();
const yr=m=>Number(m?.year||0)||0,wk=m=>Number(m?.week_no||m?.week||0)||0,se=m=>Number(m?.session_no||m?.session||0)||0,pg=m=>Number(m?.textbook_page_start||0)||0;
const key=m=>`${sp(m)}@${pg(m)}|W${wk(m)}|S${se(m)}`;
const step=(key,name,text,bbm,pak21)=>({key,name,text,bbm,pak21,phase:'source'});

const ROUTES={
"3.1.1@17|W13|S1":"w13s1","3.1.1@17|W13|S2":"w13s2","3.1.1@17|W13|S3":"w13s3","3.1.1@17|W13|S4":"w13s4","3.1.1@18|W13|S5":"w13s5",
"3.1.1@18|W14|S1":"w14s1","3.1.1@18|W14|S2":"w14s2","3.1.1@18|W14|S3":"w14s3","3.1.2@20|W14|S4":"w14s4","3.1.2@20|W14|S5":"w14s5",
"3.1.2@20|W15|S1":"w15s1","3.1.2@20|W15|S2":"w15s2","3.1.2@24|W15|S3":"w15s3","3.1.2@24|W15|S4":"w15s4","3.1.2@24|W15|S5":"w15s5",
"3.2.1@26|W16|S1":"w16s1","3.2.1@26|W16|S2":"w16s2","3.2.2@26|W16|S3":"w16s3","3.2.2@26|W16|S4":"w16s4","3.2.3@29|W16|S5":"w16s5",
"3.2.3@29|W17|S1":"w17s1","3.2.4@29|W17|S2":"w17s2","3.2.4@30|W17|S3":"w17s3","3.2.5@30|W17|S4":"w17s4","3.2.5@30|W17|S5":"w17s5"
};

const DIRECT=new Set([
"3.1.1@18|W13|S5","3.1.1@18|W14|S1","3.1.1@18|W14|S2","3.1.1@18|W14|S3",
"3.1.2@24|W15|S3","3.1.2@24|W15|S4","3.1.2@24|W15|S5",
"3.2.1@26|W16|S1","3.2.1@26|W16|S2","3.2.2@26|W16|S3","3.2.2@26|W16|S4",
"3.2.5@30|W17|S4","3.2.5@30|W17|S5"
]);

const PAGES={
"17":{
 title:"Pengenalan Unit 3 — Benda Hidup dan Benda Bukan Hidup",
 task:"Perhatikan gambar pembukaan Unit 3 pada Buku Teks m/s 17 dan bincangkan perbezaan yang dapat dikenal pasti antara manusia dengan robot sebagai pencetus idea benda hidup dan benda bukan hidup.",
 induction:"Guru memaparkan manusia dan robot pada halaman sumber. Murid menyebut satu persamaan dan satu perbezaan yang benar-benar dapat diperhatikan.",
 support:"Dengan bimbingan, murid menunjuk ciri yang dapat dilihat pada manusia dan robot lalu melengkapkan rangka ayat persamaan/perbezaan.",
 core:"Murid membandingkan manusia dan robot berdasarkan bukti pada gambar dan menerangkan mengapa perbandingan itu membantu memulakan perbincangan tentang benda hidup dan bukan hidup.",
 challenge:"Murid menghasilkan dua persamaan dan dua perbezaan berdasarkan gambar serta menandakan mana yang hanya pemerhatian dan mana yang memerlukan penjelasan lanjut.",
 closure:"Murid menyatakan satu perbezaan manusia dan robot berdasarkan gambar sumber.",
 pak21:"Think-Pair-Share / Compare-Contrast",
 evidence:"membandingkan manusia dan robot menggunakan sekurang-kurangnya dua bukti daripada gambar sumber"
},
"18":{
 title:"Hidup atau Bukan Hidup",
 task:"Gunakan Buku Teks m/s 18 untuk mengenal pasti contoh benda hidup dan benda bukan hidup, kemudian namakan contoh lain bagi setiap kumpulan berdasarkan ciri yang telah dipelajari.",
 induction:"Guru menunjukkan beberapa objek dalam gambar halaman sumber dan murid mengangkat kad HIDUP atau BUKAN HIDUP.",
 support:"Murid mengelaskan empat contoh daripada halaman sumber menggunakan kad kategori dengan bimbingan.",
 core:"Murid mengelaskan contoh sumber kepada benda hidup atau benda bukan hidup dan memberi alasan ringkas bagi setiap pilihan.",
 challenge:"Murid menambah dua contoh baharu daripada persekitaran dan mempertahankan pengelasan menggunakan ciri benda hidup.",
 closure:"Murid memberi satu contoh benda hidup dan satu benda bukan hidup berserta alasan.",
 pak21:"Classification / Pair Check",
 evidence:"mengelaskan sekurang-kurangnya empat contoh kepada benda hidup atau benda bukan hidup dengan alasan yang munasabah"
},
"20":{
 title:"Ciri Benda Hidup",
 task:"Perhatikan ciri benda hidup yang ditunjukkan pada Buku Teks m/s 20 dan kenal pasti ciri seperti bergerak, membesar, membiak, bernafas serta memerlukan air dan makanan berdasarkan bukti pada halaman.",
 induction:"Guru meminta murid mencari satu ciri benda hidup yang dapat dikenal pasti pada halaman sumber.",
 support:"Murid memadankan kad ciri dengan gambar atau petunjuk yang ditunjukkan pada halaman sumber.",
 core:"Murid mengenal pasti beberapa ciri benda hidup daripada halaman dan menerangkan bukti bagi setiap ciri.",
 challenge:"Murid membandingkan dua contoh pada halaman dan menjelaskan ciri mana yang menunjukkan sesuatu itu benda hidup.",
 closure:"Murid menyebut dua ciri benda hidup yang dapat dikenal pasti daripada sumber.",
 pak21:"Evidence Hunt / Pair Share",
 evidence:"mengenal pasti sekurang-kurangnya tiga ciri benda hidup berdasarkan bukti pada halaman sumber"
},
"24":{
 title:"Kecil dan Besar",
 task:"Ikuti aktiviti Buku Teks m/s 24: susun contoh haiwan mengikut saiz daripada besar kepada kecil dan kecil kepada besar, kemudian susun contoh tumbuhan daripada kecil kepada besar.",
 induction:"Guru menunjukkan tiga contoh haiwan pada halaman sumber dan murid meramal urutan saiznya.",
 support:"Murid menyusun tiga kad gambar haiwan atau tumbuhan mengikut saiz dengan panduan visual.",
 core:"Murid menyusun contoh haiwan dan tumbuhan daripada halaman sumber mengikut urutan saiz yang diminta dan menyemak dengan rakan.",
 challenge:"Murid menerangkan kaedah perbandingan saiz yang digunakan serta membetulkan satu urutan yang sengaja disalah susun.",
 closure:"Murid menyatakan urutan tiga contoh daripada kecil kepada besar.",
 pak21:"Sequencing / Pair Check",
 evidence:"menyusun sekurang-kurangnya empat contoh benda hidup mengikut urutan saiz dengan betul"
},
"26":{
 title:"Keperluan Asas Benda Hidup",
 task:"Gunakan Buku Teks m/s 26 untuk menyatakan makanan, air dan udara sebagai keperluan asas benda hidup serta membandingkan cara manusia, haiwan dan tumbuhan memperoleh atau menggunakan keperluan tersebut.",
 induction:"Guru menunjukkan ikon makanan, air dan udara. Murid mengenal pasti mana yang diperlukan oleh benda hidup pada halaman sumber.",
 support:"Murid memadankan makanan, air dan udara dengan manusia, haiwan dan tumbuhan menggunakan kad bergambar.",
 core:"Murid menerangkan keperluan makanan, air dan udara bagi manusia, haiwan dan tumbuhan berdasarkan maklumat halaman sumber.",
 challenge:"Murid membandingkan cara manusia/haiwan dengan tumbuhan mendapatkan makanan dan air menggunakan bukti sumber.",
 closure:"Murid menyebut tiga keperluan asas benda hidup dan satu perbezaan cara mendapatkannya.",
 pak21:"Matching / Compare-Contrast",
 evidence:"menyatakan makanan, air dan udara sebagai keperluan asas serta menerangkan sekurang-kurangnya satu perbezaan cara benda hidup mendapatkannya"
},
"29":{
 title:"Biji Benih Bercambah + Mari Ulang Kaji",
 task:"Jalankan aktiviti kumpulan Buku Teks m/s 29 menggunakan dua bekas, tisu, air dan kacang hijau: bandingkan keadaan biji selepas tiga hari, lakarkan perubahan, nyatakan ciri benda hidup dan keperluan asas yang dapat diperhatikan; kemudian jawab item ulang kaji pada halaman yang sama.",
 induction:"Guru menunjukkan dua bekas kacang hijau dengan keadaan air yang berbeza atau gambar sumber dan meminta murid meramal perubahan selepas beberapa hari.",
 support:"Dengan bimbingan guru, murid mengikuti langkah sumber, membuat satu lakaran perubahan dan memilih keperluan asas yang berkaitan.",
 core:"Kumpulan menjalankan penyiasatan seperti sumber, merekod perubahan selepas tempoh pemerhatian, melakar dan menjawab soalan tentang ciri benda hidup serta keperluan asas.",
 challenge:"Murid membandingkan hasil kedua-dua bekas dan menerangkan hubungan antara air, perubahan biji dan ciri benda hidup berdasarkan dapatan.",
 closure:"Murid menyatakan satu perubahan biji dan satu keperluan asas yang disokong oleh pemerhatian.",
 pak21:"Predict-Observe-Explain / Collaborative Inquiry",
 evidence:"merekod perubahan biji kacang hijau dan menghubungkannya dengan sekurang-kurangnya satu ciri benda hidup serta satu keperluan asas"
},
"30":{
 title:"Ingat Semula + Rekreasi Sains",
 task:"Gunakan Buku Teks m/s 30 untuk mengingat semula keperluan asas benda hidup dan kepentingan tempat perlindungan, kemudian hasilkan penanda buku yang memaparkan ciri-ciri benda hidup seperti tugasan Rekreasi Sains.",
 induction:"Guru memaparkan ringkasan keperluan asas pada halaman sumber dan meminta murid melengkapkan satu fakta yang hilang.",
 support:"Murid melengkapkan peta ringkas keperluan asas dan menghasilkan penanda buku menggunakan pilihan frasa ciri yang disediakan.",
 core:"Murid menerangkan ringkasan keperluan asas daripada halaman dan menghasilkan penanda buku yang menyampaikan ciri-ciri benda hidup dengan tepat.",
 challenge:"Murid menghasilkan penanda buku yang menggabungkan beberapa ciri benda hidup serta satu nota ringkas tentang keperluan asas atau perlindungan berdasarkan sumber.",
 closure:"Murid berkongsi satu fakta daripada penanda buku dan menunjukkan sumbernya pada halaman.",
 pak21:"Product Creation / Gallery Walk",
 evidence:"menyampaikan sekurang-kurangnya tiga fakta yang tepat tentang ciri atau keperluan asas benda hidup melalui hasil bertulis atau lisan"
}
};

const REVIEW_NOTE='Padanan SP dengan dominant task halaman kurang langsung. Kekalkan tugasan sebenar Buku Teks dan tandakan semakan guru; jangan cipta aktiviti lain untuk memaksa alignment.';
function mode(m){return sk(m)==='science'&&yr(m)===1?(ROUTES[key(m)]||''):''}
function blueprint(m){
 const md=mode(m); if(!md)return null;
 const route=key(m),p=pg(m),src=PAGES[String(p)]; if(!src)return null;
 const align=!DIRECT.has(route),sb=`Buku Teks Sains Tahun 1 m/s ${p}`,criterion=`Murid dapat ${src.evidence}.`;
 const provenance={
  route,rpt:'RPT_Sains_Tahun1_2026_KumpulanB_Murni.docx',
  mapping:'RPT_Sains_Tahun1_2026_KumpulanB_Mapping.xlsx',
  dskp:'DSKP KSSR SAINS TAHUN 1 (SEMAKAN 2017).pdf',
  textbook:'sains-tahun-1-sk.pdf',textbookAnchor:sb,generateFlag:'YES',
  unit:'Unit 3: Benda Hidup dan Benda Bukan Hidup',
  calendarPolicy:'W15 menggunakan tarikh Kumpulan B yang dinormalisasi kepada 27-30.04.2026 seperti Mapping; blueprint tidak mengubah tarikh atau status Mapping.',
  mappingPolicy:'Gunakan exact SP@BT-printed-page|Wweek|Ssession daripada Mapping; jangan membina semula Lesson Mapping atau mencipta page route yang tiada.',
  activityBookPolicy:'Tiada Buku Aktiviti berasingan digunakan untuk menentukan kandungan; jangan reka aktiviti Buku Aktiviti.',
  alignmentReviewRequired:align,alignmentReviewNote:align?REVIEW_NOTE:'',
  verificationPolicy:'Blueprint runtime ini tidak mengubah Lesson Mapping atau verification status.'
 };
 const mk=(tier,text)=>[step(`sc1-u3-${md}-${tier}`,tier==='s'?'Sokongan':tier==='c'?'Tugasan Sumber':'Cabaran',text,sb,tier==='s'?'Bimbingan Berstruktur':tier==='c'?src.pak21:'Cabaran Kendiri')];
 return{
  method:'Source-first Sains Tahun 1 Unit 3 menggunakan RPT + DSKP + tugasan sebenar Buku Teks',
  source:'RPT Sains Tahun 1 + DSKP Sains Tahun 1 + Buku Teks Sains Tahun 1',provenance,
  generateFlag:'YES',conditional:false,reviewRequired:align,alignmentReviewRequired:align,alignmentReviewNote:align?REVIEW_NOTE:'',
  anchor:`${src.title} — ${sb}`,kind:'source_blueprint',
  objective:`Pada akhir PdP, murid dapat ${src.evidence}.`,successCriteria:criterion,criteria:criterion,
  induction:src.induction,support:mk('s',src.support),core:mk('c',src.core),challenge:mk('h',src.challenge),
  sourceTask:src.task,exactSourceTask:src.task,
  activityLibraryPolicy:'Activity Library may vary delivery only and must not determine lesson content',
  activityBookPolicy:provenance.activityBookPolicy,pak21:src.pak21,bbm:[sb,'RPT Sains Tahun 1 (Kumpulan B)'],
  pbdEvidence:`Perhatikan sama ada ${criterion.toLowerCase()}`,pbd:{method:'Pemerhatian guru dan bukti tugasan sumber',evidence:criterion},
  closure:src.closure,_runtime_science_year1_unit3_mode:md,_runtime_science_year1_unit3_source_blueprint:true,
  _runtime_science_year1_unit3_alignment_review_required:align
 };
}
const oe=window.effectiveRphLessonMap;
if(typeof oe==='function')window.effectiveRphLessonMap=function(map,...args){
 const out=oe.call(this,map,...args),bp=blueprint(out); if(!bp)return out;
 return{...out,objective:bp.objective,success_criteria:bp.successCriteria,successCriteria:bp.successCriteria,
  source_evidence:{...(out?.source_evidence||{}),runtime_science_year1_unit3:{source:bp.source,anchor:bp.anchor,source_task:bp.sourceTask,provenance:bp.provenance}},
  _runtime_science_year1_unit3_mode:bp._runtime_science_year1_unit3_mode,_runtime_science_year1_unit3_source_blueprint:true,
  _runtime_science_year1_unit3_alignment_review_required:bp.alignmentReviewRequired};
};
const op=window.buildSourceAwarePedagogy;
if(typeof op==='function')window.buildSourceAwarePedagogy=function(map,...args){return blueprint(map)||op.call(this,map,...args)};
window.rphScienceYear1Unit3SourceBlueprint=blueprint;
})();
