(function(){
'use strict';
const sk=m=>{try{return window.rphSubjectKey?.(m?.subject_id)||''}catch{return''}};
const sp=m=>String(m?.source_evidence?.meta?.main_sp||m?.source_evidence?.meta?.main_ls||m?.learning_standard||String(m?.sp||'').split(',')[0]||'').trim();
const yr=m=>Number(m?.year||0)||0,wk=m=>Number(m?.week_no||m?.week||0)||0,se=m=>Number(m?.session_no||m?.session||0)||0,pg=m=>Number(m?.textbook_page_start||m?.textbook_page||0)||0;
const key=m=>`${sp(m)}@${pg(m)}|W${wk(m)}|S${se(m)}`,sourceKey=m=>`${pg(m)}|${sp(m)}`;
const step=(key,name,text,bbm,pak21)=>({key,name,text,bbm,pak21,phase:'source'});
const ROUTES={};
const standards=[['9.1.1',116],['9.1.2',119],['9.1.3',122],['9.1.4',124],['9.1.5',125]];
for(const w of [33,34,35])standards.forEach(([s,p],i)=>ROUTES[`${s}@${p}|W${w}|S${i+1}`]=`w${w}s${i+1}`);
const REVIEW=new Set(['9.1.2@119|W33|S2','9.1.2@119|W34|S2','9.1.2@119|W35|S2']);
const SOURCE={
'116|9.1.1':{title:'Ahli Sistem Suria',task:'Gunakan Buku Teks m/s 116: teliti ilustrasi Sistem Suria, kenal pasti Matahari sebagai pusat Sistem Suria, senaraikan ahli Sistem Suria dan susun planet mengikut urutan dari Matahari berdasarkan maklumat pada halaman.',support:'Murid memadankan label Matahari, planet, satelit semula jadi, asteroid, meteoroid dan komet pada ilustrasi sumber dengan bimbingan.',core:'Murid menyenaraikan ahli Sistem Suria dan menyusun lapan planet mengikut urutan dari Matahari berdasarkan ilustrasi dan teks sumber.',challenge:'Murid menerangkan kedudukan Matahari sebagai pusat Sistem Suria dan mempertahankan urutan planet menggunakan ilustrasi sumber.',evidence:'menyenaraikan ahli Sistem Suria dan menyusun planet mengikut urutan dari Matahari berdasarkan pemerhatian sumber',pak21:'Source Sequencing'},
'119|9.1.2':{title:'Kad Interaktif Planet — alignment review',task:'Kekalkan tugasan sebenar Buku Teks m/s 119: hasilkan kad interaktif bagi planet/ahli Sistem Suria menggunakan gambar dan maklumat planet pada sumber. Halaman ini tidak menerangkan pola suhu planet secara langsung; jangan ubah page anchor dan jangan cipta aktiviti suhu untuk memaksa SP 9.1.2.',support:'Murid melengkapkan satu kad interaktif planet menggunakan gambar, nama dan satu maklumat yang diperoleh daripada halaman sumber.',core:'Murid menghasilkan kad interaktif planet dan menulis maklumat planet berdasarkan sumber, kemudian berkongsi hasil dengan pasangan.',challenge:'Murid membandingkan maklumat dua kad planet dan menerangkan persamaan atau perbezaan berdasarkan maklumat yang direkod daripada sumber.',evidence:'menghasilkan dan menerangkan kad interaktif planet berdasarkan maklumat sebenar pada Buku Teks m/s 119; penjajaran dengan SP 9.1.2 memerlukan semakan guru',pak21:'Interactive Planet Card'},
'122|9.1.3':{title:'Orbit Planet',task:'Gunakan Buku Teks m/s 122: teliti penerangan bahawa planet bergerak mengelilingi Matahari mengikut laluan yang dipanggil orbit dan bahawa orbit berbentuk elips; gunakan ilustrasi sumber untuk memerihalkan pergerakan planet.',support:'Murid memadankan istilah planet, Matahari dan orbit pada ilustrasi sumber serta melengkapkan ayat berpandu.',core:'Murid memerihalkan bahawa planet beredar mengelilingi Matahari mengikut orbit masing-masing berdasarkan ilustrasi dan penerangan sumber.',challenge:'Murid menerangkan bentuk orbit dan membezakan orbit sebagai laluan planet daripada planet itu sendiri menggunakan bukti ilustrasi.',evidence:'memerihalkan planet beredar mengelilingi Matahari mengikut orbit berdasarkan penerangan dan ilustrasi sumber',pak21:'Concept Explanation'},
'124|9.1.4':{title:'Masa Peredaran Planet',task:'Gunakan Buku Teks m/s 124: bandingkan orbit Bumi dan Marikh, kaitkan jarak planet dari Matahari dengan panjang laluan dan masa satu peredaran lengkap, kemudian rumuskan hubungan yang ditunjukkan sumber.',support:'Murid melengkapkan perbandingan Bumi dan Marikh menggunakan frasa lebih dekat/jauh dan lebih singkat/lama berpandukan rajah.',core:'Murid menerangkan hubungan jarak kedudukan planet dari Matahari dengan masa peredaran menggunakan contoh Bumi dan Marikh daripada sumber.',challenge:'Murid membuat rumusan umum bahawa semakin bertambah jarak kedudukan planet dari Matahari, semakin bertambah masa peredarannya, dengan bukti daripada rajah sumber.',evidence:'menghubung kait kedudukan planet dari Matahari dengan masa planet beredar mengelilingi Matahari berdasarkan perbandingan sumber',pak21:'Evidence Relationship'},
'125|9.1.5':{title:'Santai Sains — Tanglung Planet Saya',task:'Gunakan Buku Teks m/s 125: hasilkan Tanglung Planet Saya dengan maklumat planet pada jalur kertas seperti tugasan sumber, kemudian gunakan hasil tersebut untuk menerangkan pemerhatian tentang Sistem Suria secara kreatif.',support:'Murid melengkapkan tanglung planet dengan nama planet dan satu maklumat berpandukan contoh serta label sumber.',core:'Murid menghasilkan tanglung planet yang memaparkan maklumat planet dan menerangkan hasil secara lisan atau penulisan.',challenge:'Murid mempersembahkan tanglung planet dan menghubungkan sekurang-kurangnya dua maklumat Sistem Suria daripada sumber dalam penerangannya.',evidence:'menjelaskan pemerhatian tentang Sistem Suria secara kreatif melalui hasil Tanglung Planet Saya berpandukan sumber',pak21:'Creative Communication'}
};
function mode(m){return sk(m)==='science'&&yr(m)===3?(ROUTES[key(m)]||''):''}
function blueprint(m){
  const md=mode(m); if(!md)return null;
  const src=SOURCE[sourceKey(m)]; if(!src)return null;
  const route=key(m),p=pg(m),bt=`Buku Teks Sains Tahun 3 m/s ${p}`,review=REVIEW.has(route);
  const criterion=`Murid dapat ${src.evidence}.`;
  const provenance={
    route,
    rpt:'RPT_Sains_Tahun3_2026_KumpulanB_Murni.docx',
    mapping:'RPT_Sains_Tahun3_2026_KumpulanB_Mapping.xlsx',
    dskp:'DSKP KSSR SAINS TAHUN 3 (SEMAKAN 2017).pdf',
    textbook:'sains_tahun_3_sk.pdf',
    textbookAnchor:bt,
    generateFlag:'YES',
    unit:'Unit 9: Sistem Suria',
    weekPolicy:'Blueprint ini meliputi W33-W35 sahaja. W36 bermula Unit 10 Mesin.',
    mappingPolicy:'Gunakan exact SP@BT-printed-page|Wweek|Ssession daripada mapping; jangan bina semula Lesson Mapping.',
    alignmentPolicy:'Jika SP dan halaman Buku Teks kurang sepadan, kekalkan tugasan sebenar halaman, tandakan alignmentReviewRequired dan jangan tukar page anchor secara senyap.',
    activityLibraryPolicy:'Activity Library may vary delivery only and must not determine lesson content',
    activityBookPolicy:'Buku Aktiviti tidak digunakan sebagai sumber kandungan blueprint ini; jangan reka aktiviti Buku Aktiviti.',
    alignmentReviewRequired:review,
    verificationPolicy:'Blueprint runtime ini tidak mengubah Lesson Mapping atau verification status.'
  };
  const mk=(tier,text)=>[step(`sc3-u9-${md}-${tier}`,tier==='s'?'Sokongan':tier==='c'?'Tugasan Sumber':'Cabaran',text,bt,tier==='s'?'Bimbingan Berstruktur':tier==='c'?src.pak21:'Cabaran Kendiri')];
  return{
    method:'Source-first Sains Tahun 3 Unit 9 menggunakan RPT + DSKP + tugasan sebenar Buku Teks',
    source:'RPT Sains Tahun 3 + DSKP Sains Tahun 3 + Buku Teks Sains Tahun 3',
    provenance,
    generateFlag:'YES',
    conditional:false,
    reviewRequired:review,
    alignmentReviewRequired:review,
    anchor:`${src.title} — ${bt}`,
    kind:'source_blueprint',
    objective:`Pada akhir PdP, murid dapat ${src.evidence}.`,
    successCriteria:criterion,
    criteria:criterion,
    induction:`Guru membuka ${bt} dan menggunakan situasi, ilustrasi atau tugasan sebenar pada halaman sebagai set induksi.`,
    support:mk('s',src.support),
    core:mk('c',src.core),
    challenge:mk('h',src.challenge),
    librarySteps:{support:mk('s',src.support),core:mk('c',src.core),challenge:mk('h',src.challenge)},
    pbdEvidence:{method:'Pemerhatian tugasan sumber + semakan hasil/rekod + penerangan murid',evidence:src.evidence,criterion},
    penutup:review?'Guru menandakan penjajaran halaman-SP untuk semakan dan murid merumuskan maklumat yang benar-benar diperoleh daripada halaman sumber.':'Murid menyatakan satu dapatan utama daripada tugasan sumber dan guru mengukuhkan kaitannya dengan Sistem Suria.'
  };
}
const prevEffective=window.effectiveRphLessonMap;
if(typeof prevEffective==='function')window.effectiveRphLessonMap=function(m,ev,built){
  const out=prevEffective(m,ev,built)||m;
  if(!mode(out))return out;
  const bp=blueprint(out); if(!bp)return out;
  return{...out,objective:bp.objective,success_criteria:bp.successCriteria,_runtime_science_source_blueprint:`year3_unit9_${mode(out)}`,_runtime_science_year3_unit9_alignment_review_required:bp.alignmentReviewRequired};
};
const prevPed=window.buildSourceAwarePedagogy;
if(typeof prevPed==='function')window.buildSourceAwarePedagogy=function(m,a,bt,en,classId=null){
  const base=prevPed(m,a,bt,en,classId);
  if(en)return base;
  const bp=blueprint(m);
  return bp?{...base,...bp}:base;
};
window.rphScienceYear3Unit9SourceBlueprint=blueprint;
window.__RPH_SCIENCE_YEAR3_UNIT9_SOURCE_BLUEPRINT__={version:'2026-09-06a',routes:Object.keys(ROUTES).length,review:[...REVIEW],conditional:[]};
console.info('RPH Science Year 3 Unit 9 exact source-first blueprint active.');
})();