(function(){
  'use strict';
  const subjectKey=m=>{try{return typeof window.rphSubjectKey==='function'?window.rphSubjectKey(m?.subject_id):''}catch{return ''}};
  const sp=m=>String(m?.source_evidence?.meta?.main_sp||String(m?.sp||'').split(',')[0]||'').trim();
  const year=m=>Number(m?.year||0)||0;
  const pg=m=>Number(m?.textbook_page_start||0)||0;
  const label=m=>pg(m)?`Buku Teks m/s ${pg(m)}`:'Buku Teks';
  const step=(key,name,text,bbm,pak21)=>({key,name,text,bbm,pak21,phase:'source'});
  function mode(m){
    if(subjectKey(m)!=='science'||year(m)!==2)return '';
    if(sp(m)==='7.1.3'&&pg(m)===78)return 'build';
    if(sp(m)==='7.1.4'&&(pg(m)===79||pg(m)===80))return 'diagnose';
    return '';
  }
  function pair(m){
    const p=label(m);
    if(mode(m)==='build')return{
      objective:`Pada akhir PdP, murid dapat membina sekurang-kurangnya satu litar elektrik lengkap menggunakan sel kering, mentol, suis dan wayar penyambung berpandukan ${p}.`,
      criteria:'Murid memilih semua komponen yang betul, menyambungkannya menjadi satu laluan lengkap dan menunjukkan mentol menyala apabila suis ditutup.'
    };
    return{
      objective:`Pada akhir PdP, murid dapat mengenal pasti sekurang-kurangnya dua punca mentol tidak menyala dalam litar yang dibina dan mencadangkan pembetulan berdasarkan ${p}.`,
      criteria:'Murid memeriksa sambungan dan komponen secara sistematik, mengenal pasti sekurang-kurangnya dua kemungkinan punca dan membetulkan litar sehingga lengkap.'
    };
  }
  function build(m,btRef){
    const p=btRef||label(m),common=`${p}; sel kering; mentol dan pemegang; suis; wayar penyambung; kad semak litar`;
    const support=[
      step('source-electric-build-s1','Kenal Empat Komponen','Murid memadankan kad nama dengan sel kering, mentol, suis dan wayar penyambung sebelum membina litar.',common,'Matching'),
      step('source-electric-build-s2','Sambung Ikut Laluan','Dengan bimbingan guru, murid menyambungkan komponen satu demi satu mengikut rajah sumber dan menyemak setiap sambungan sebelum suis ditutup.',common,'Inkuiri berpandu'),
      step('source-electric-build-s3','Semak Mentol Menyala','Murid menutup suis, memerhati mentol dan menggunakan kad semak untuk memastikan litar mempunyai satu laluan lengkap.','litar murid; kad semak','Pair Check')
    ];
    const core=[
      step('source-electric-build-c1','Susun Sebelum Sambung','Kumpulan menyusun sel kering, mentol, suis dan wayar mengikut urutan litar pada Buku Teks sebelum membuat sambungan.',common,'Think-Pair-Share'),
      step('source-electric-build-c2','Bina Litar Lengkap','Murid membina litar lengkap dan menguji fungsi suis. Mentol perlu menyala apabila litar ditutup dan padam apabila litar dibuka.',common,'Hands-on Investigation'),
      step('source-electric-build-c3','Cabaran Semak Rakan','Pasangan bertukar litar dan menyemak empat komponen serta kesinambungan sambungan menggunakan senarai semak tanpa mengubah litar rakan terlebih dahulu.','litar murid; senarai semak','Peer Check')
    ];
    const challenge=[
      step('source-electric-build-h1','Bina Tanpa Rajah Siap','Murid memilih sendiri susunan komponen yang boleh menghasilkan litar lengkap, kemudian menguji mentol dan suis.',common,'Problem Solving'),
      step('source-electric-build-h2','Lukis Litar yang Dibina','Murid melakar susunan sebenar komponen selepas litar berfungsi dan melabel sel kering, mentol, suis dan wayar.','litar murid; kertas lakaran','Draw-and-Label'),
      step('source-electric-build-h3','Terangkan Laluan Lengkap','Murid menerangkan mengapa mentol menyala dengan menunjukkan laluan sambungan yang lengkap pada binaan mereka.','litar murid; lakaran','Evidence Talk')
    ];
    return {
      method:'Pembinaan litar voltan rendah + uji fungsi + semakan rakan',
      pakDetail:'Murid membina litar sebenar menggunakan komponen yang ditetapkan dalam SP. Semua aktiviti menggunakan sel kering voltan rendah sahaja; tiada sambungan kepada bekalan elektrik rumah.',
      anchor:`Bina litar elektrik lengkap pada ${p} menggunakan sel kering, mentol, suis dan wayar penyambung.`,kind:'build_model',
      bbmList:[p,'sel kering','mentol','suis','wayar penyambung','kad semak'],groupBbm:{support:common,core:common,challenge:common},mainSp:'7.1.3',page:p,topic:m.title||'Membina Litar Elektrik',
      setInduksi:'Guru menunjukkan empat komponen litar. Murid meramal komponen yang mesti disambung supaya mentol boleh menyala.',
      inductionData:{name:'Apa yang Diperlukan?',text:'Guru menunjukkan sel kering, mentol, suis dan wayar. Murid mengenal pasti nama komponen dan meramal bagaimana komponen perlu disambungkan.',bbm:'sel kering; mentol; suis; wayar',pak21:'Think-Pair-Share'},
      librarySteps:{support,core,challenge},diffSupport:'Bina litar berpandukan susunan komponen dan kad semak.',diffCore:'Bina litar lengkap, uji suis dan semak litar rakan.',diffChallenge:'Bina secara lebih kendiri, lakar binaan dan terangkan laluan lengkap.',
      diffSupportAct:support.map(x=>x.text).join(' '),diffCoreAct:core.map(x=>x.text).join(' '),diffChallengeAct:challenge.map(x=>x.text).join(' '),
      pbdEvidence:{method:'Pemerhatian pembinaan + ujian fungsi + semakan hasil',evidence:'Susunan komponen, litar lengkap, nyalaan mentol dan penerangan murid.',criterion:pair(m).criteria},
      penutup:'Murid menunjuk satu komponen pada litar dan menyatakan fungsinya. Guru mengukuhkan bahawa litar perlu lengkap untuk membolehkan mentol menyala.'
    };
  }
  function diagnose(m,btRef){
    const p=btRef||label(m),common=`${p}; litar sel kering voltan rendah; mentol; suis; wayar; kad semak sambungan`;
    const support=[
      step('source-electric-fault-s1','Cari Sambungan Terbuka','Guru menyediakan litar latihan dengan satu sambungan terbuka. Murid menelusuri wayar dengan jari tanpa menyentuh bahagian logam terdedah dan menandakan lokasi sambungan yang belum lengkap.',common,'Guided Discovery'),
      step('source-electric-fault-s2','Betulkan Satu Punca','Dengan bimbingan guru, murid membetulkan sambungan yang dikenal pasti lalu menguji sama ada mentol menyala.','litar latihan; kad semak','Inkuiri berpandu'),
      step('source-electric-fault-s3','Nyatakan Sebab','Murid melengkapkan ayat “Mentol tidak menyala kerana ___; kami membetulkan dengan ___.”','rangka ayat; hasil ujian','Pair Check')
    ];
    const core=[
      step('source-electric-fault-c1','Diagnos Satu Demi Satu','Kumpulan memeriksa sel kering, mentol, suis dan setiap sambungan mengikut senarai semak, bukan menukar semua komponen serentak.',common,'Troubleshooting'),
      step('source-electric-fault-c2','Uji Selepas Pembetulan','Murid membetulkan satu kemungkinan punca pada satu masa dan menguji litar selepas setiap pembetulan supaya punca sebenar dapat dikenal pasti.',common,'Hands-on Investigation'),
      step('source-electric-fault-c3','Kad Punca dan Bukti','Kumpulan memadankan kad punca dengan bukti daripada litar, contohnya sambungan terbuka atau suis tidak melengkapkan litar.','kad punca; kad bukti; litar','Evidence Match')
    ];
    const challenge=[
      step('source-electric-fault-h1','Litar Misteri','Guru menyediakan litar latihan dengan satu kesilapan yang selamat. Murid meramal punca sebelum memeriksa komponen secara sistematik.',common,'Problem Solving'),
      step('source-electric-fault-h2','Catat Urutan Diagnos','Murid merekod urutan pemeriksaan dan keputusan setiap langkah sebelum membuat pembetulan.','lembaran diagnos; litar latihan','Data Log'),
      step('source-electric-fault-h3','Pertahankan Punca','Murid menerangkan bukti yang menunjukkan punca sebenar dan mengapa pembetulan tertentu menyebabkan litar berfungsi.','rekod diagnos; litar','Evidence Talk')
    ];
    return {
      method:'Troubleshooting litar voltan rendah + ramalan + uji satu pemboleh ubah',pakDetail:'Murid mencari punca litar tidak berfungsi secara sistematik. Aktiviti hanya menggunakan sel kering voltan rendah dan litar latihan guru; bekalan elektrik rumah tidak digunakan.',
      anchor:`Kenal pasti sebab mentol tidak menyala pada ${p} dan baiki litar berdasarkan pemeriksaan komponen serta sambungan.`,kind:'investigation',bbmList:[p,'litar latihan sel kering','kad semak','kad punca'],groupBbm:{support:common,core:common,challenge:common},mainSp:'7.1.4',page:p,topic:m.title||'Mengapakah Mentol Tidak Menyala?',
      setInduksi:'Guru menunjukkan satu litar sel kering yang mentolnya tidak menyala. Murid memberikan satu ramalan punca sebelum sebarang pembetulan dibuat.',inductionData:{name:'Apa Puncanya?',text:'Guru menunjukkan satu litar sel kering yang mentolnya tidak menyala. Murid memberikan satu ramalan punca sebelum sebarang pembetulan dibuat.',bbm:'litar latihan voltan rendah',pak21:'Predict-Observe-Explain'},
      librarySteps:{support,core,challenge},diffSupport:'Cari dan betulkan satu punca dengan kad semak.',diffCore:'Periksa komponen satu demi satu dan uji selepas setiap pembetulan.',diffChallenge:'Rekod urutan diagnos dan pertahankan punca berdasarkan bukti.',diffSupportAct:support.map(x=>x.text).join(' '),diffCoreAct:core.map(x=>x.text).join(' '),diffChallengeAct:challenge.map(x=>x.text).join(' '),
      pbdEvidence:{method:'Pemerhatian troubleshooting + semakan rekod + penerangan lisan',evidence:'Ramalan punca, urutan pemeriksaan, pembetulan dan hasil ujian litar.',criterion:pair(m).criteria},
      penutup:'Murid menyatakan satu punca mentol tidak menyala dan satu cara membetulkannya. Guru merumuskan bahawa pemeriksaan perlu dibuat satu demi satu.'
    };
  }
  const prevEffective=window.effectiveRphLessonMap;
  if(typeof prevEffective==='function')window.effectiveRphLessonMap=function(m,ev,built){const out=prevEffective(m,ev,built)||m;if(!mode(out))return out;const p=pair(out);return {...out,objective:p.objective,success_criteria:p.criteria,_runtime_science_source_blueprint:`electric_${mode(out)}`};};
  const prevPed=window.buildSourceAwarePedagogy;
  if(typeof prevPed==='function')window.buildSourceAwarePedagogy=function(m,a,bt,en,classId=null){const base=prevPed(m,a,bt,en,classId);if(en)return base;if(mode(m)==='build')return {...base,...build(m,bt)};if(mode(m)==='diagnose')return {...base,...diagnose(m,bt)};return base;};
  window.__RPH_SCIENCE_ELECTRIC_BLUEPRINT__={version:'2026-09-04a',standards:['7.1.3','7.1.4']};
  console.info('RPH Science electric circuit blueprints active.');
})();