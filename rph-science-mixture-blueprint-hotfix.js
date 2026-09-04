(function(){
  'use strict';
  const subjectKey=m=>{try{return typeof window.rphSubjectKey==='function'?window.rphSubjectKey(m?.subject_id):''}catch{return ''}};
  const sp=m=>String(m?.source_evidence?.meta?.main_sp||String(m?.sp||'').split(',')[0]||'').trim();
  const year=m=>Number(m?.year||0)||0,pg=m=>Number(m?.textbook_page_start||0)||0;
  const label=m=>pg(m)?`Buku Teks m/s ${pg(m)}`:'Buku Teks';
  const step=(key,name,text,bbm,pak21)=>({key,name,text,bbm,pak21,phase:'source'});
  function mode(m){
    if(subjectKey(m)!=='science'||year(m)!==2)return '';
    if(sp(m)==='8.1.1'&&pg(m)===88)return 'describe';
    if(sp(m)==='8.1.2'&&(pg(m)===90||pg(m)===92))return 'reason';
    return '';
  }
  function pair(m){
    const p=label(m);
    if(mode(m)==='describe')return{
      objective:`Pada akhir PdP, murid dapat memerihalkan sekurang-kurangnya tiga kaedah mengasingkan campuran dan memadankan setiap kaedah dengan campuran yang sesuai berdasarkan ${p}.`,
      criteria:'Murid memilih sekurang-kurangnya tiga kaedah yang sesuai seperti mengutip dengan tangan, mengayak/menapis atau menggunakan magnet serta menunjukkan hasil pengasingan.'
    };
    return{
      objective:`Pada akhir PdP, murid dapat memilih kaedah yang sesuai untuk mengasingkan sekurang-kurangnya tiga campuran dan memberikan satu alasan bagi setiap pilihan berdasarkan ${p}.`,
      criteria:'Murid mengenal pasti ciri bahan dalam campuran, memilih alat atau kaedah yang sesuai dan memberikan alasan yang berkaitan dengan saiz, sifat magnet atau keadaan bahan.'
    };
  }
  function describe(m,btRef){
    const p=btRef||label(m),common=`${p}; campuran contoh; magnet; penapis/ayak; dua bekas; kad kaedah`;
    const support=[
      step('source-mixture-desc-s1','Lihat dan Namakan Campuran','Murid meneliti tiga campuran mudah yang disediakan guru dan menyebut bahan yang dapat dikenal pasti dalam setiap campuran.',common,'Think-Pair-Share'),
      step('source-mixture-desc-s2','Cuba Satu Kaedah','Dengan bimbingan guru, murid menggunakan satu kaedah yang sesuai seperti mengutip dengan tangan, mengayak atau menggunakan magnet dan memerhati bahan yang berjaya diasingkan.',common,'Inkuiri berpandu'),
      step('source-mixture-desc-s3','Padan Kaedah dengan Campuran','Murid memadankan kad campuran dengan kad kaedah berdasarkan hasil sebenar aktiviti.','kad campuran; kad kaedah; hasil pengasingan','Matching')
    ];
    const core=[
      step('source-mixture-desc-c1','Stesen Tiga Campuran','Kumpulan bergerak melalui tiga stesen: bahan besar bercampur yang boleh diambil tangan, bahan berlainan saiz untuk diayak, dan campuran yang mengandungi objek yang boleh ditarik magnet.',common,'Station Rotation'),
      step('source-mixture-desc-c2','Asing dan Rekod','Di setiap stesen murid memilih alat, mengasingkan campuran dan merekod nama kaedah serta bahan yang diperoleh selepas pengasingan.',common,'Hands-on Investigation'),
      step('source-mixture-desc-c3','Cabaran Kaedah Tepat','Guru menunjukkan satu kad campuran. Kumpulan memilih kad kaedah dan mendapat mata selepas menerangkan bukti daripada stesen yang menyokong pilihan.','kad campuran; kad kaedah; rekod stesen','Game-Based Learning')
    ];
    const challenge=[
      step('source-mixture-desc-h1','Banding Dua Kaedah','Murid memilih satu campuran dan membandingkan dua kaedah yang mungkin digunakan, kemudian menentukan kaedah yang lebih sesuai berdasarkan hasil.','campuran guru; dua alat pengasingan; jadual banding beza','Compare-and-Contrast'),
      step('source-mixture-desc-h2','Reka Urutan Pengasingan','Bagi satu campuran yang mempunyai lebih daripada dua bahan, murid menyusun urutan kaedah untuk mengasingkan bahan satu demi satu.','campuran berbilang bahan; kad urutan','Problem Solving'),
      step('source-mixture-desc-h3','Terangkan Bukti','Murid menerangkan bagaimana setiap kaedah memanfaatkan ciri bahan yang boleh diperhatikan tanpa menambah bahan yang tidak terdapat dalam tugasan.','hasil pengasingan; kad bukti','Evidence Talk')
    ];
    return {method:'Stesen pengasingan campuran + pemilihan alat + bukti hasil',pakDetail:'Murid memerihalkan kaedah selepas mencuba pengasingan sebenar. Aktiviti permainan hanya mengukuhkan pilihan kaedah berdasarkan hasil stesen.',anchor:`Cuba dan perihalkan kaedah mengasingkan campuran pada ${p}.`,kind:'investigation',bbmList:[p,'campuran contoh','magnet','ayak/penapis','bekas','kad kaedah'],groupBbm:{support:common,core:common,challenge:common},mainSp:'8.1.1',page:p,topic:m.title||'Kaedah Mengasingkan Campuran',setInduksi:'Guru menunjukkan satu bekas campuran dua bahan dan bertanya bagaimana bahan itu boleh dipisahkan tanpa membuang kedua-duanya.',inductionData:{name:'Bagaimana Hendak Asingkan?',text:'Guru menunjukkan satu bekas campuran dua bahan dan meminta murid mencadangkan cara mengasingkannya.',bbm:'campuran contoh; bekas lutsinar',pak21:'Think-Pair-Share'},librarySteps:{support,core,challenge},diffSupport:'Cuba satu kaedah dengan bimbingan dan padankan dengan campuran.',diffCore:'Jalankan tiga stesen dan rekod kaedah serta hasil.',diffChallenge:'Banding kaedah dan reka urutan pengasingan berbilang langkah.',diffSupportAct:support.map(x=>x.text).join(' '),diffCoreAct:core.map(x=>x.text).join(' '),diffChallengeAct:challenge.map(x=>x.text).join(' '),pbdEvidence:{method:'Pemerhatian stesen + semakan rekod + penerangan lisan',evidence:'Kaedah yang digunakan, bahan yang berjaya diasingkan dan padanan kaedah-campuran.',criterion:pair(m).criteria},penutup:'Murid memilih satu campuran dan menyatakan kaedah yang digunakan serta hasil pengasingannya. Guru menekankan bahawa kaedah dipilih berdasarkan ciri bahan.'};
  }
  function reason(m,btRef){
    const p=btRef||label(m),common=`${p}; magnet; ayak/penapis; bekas; campuran objek berlainan saiz; campuran mengandungi objek magnetik; lembaran alasan`;
    const support=[
      step('source-mixture-reason-s1','Cari Ciri Bahan','Murid memilih antara kad BESAR/KECIL dan DITARIK MAGNET/TIDAK DITARIK untuk menerangkan ciri bahan dalam dua campuran.','kad ciri; dua campuran','Guided Discovery'),
      step('source-mixture-reason-s2','Pilih Alat','Dengan bimbingan guru, murid memilih magnet atau ayak/penapis berdasarkan ciri bahan lalu menguji pilihan tersebut.',common,'Inkuiri berpandu'),
      step('source-mixture-reason-s3','Lengkapkan Kerana','Murid melengkapkan rangka “Saya pilih ___ kerana ___.” menggunakan hasil pengasingan sebagai bukti.','rangka ayat; hasil aktiviti','Pair Check')
    ];
    const core=[
      step('source-mixture-reason-c1','Teka Kaedah Sebelum Uji','Kumpulan memerhati setiap campuran, mengenal pasti perbezaan saiz atau sifat magnet dan meramal kaedah yang paling sesuai.',common,'Predict-Observe-Explain'),
      step('source-mixture-reason-c2','Uji Pilihan Kaedah','Murid menjalankan kaedah yang dipilih dan merekod sama ada campuran berjaya diasingkan dengan jelas.',common,'Hands-on Investigation'),
      step('source-mixture-reason-c3','Buktikan Pilihan','Kumpulan membentangkan satu pilihan kaedah dengan format “Kaedah - Ciri bahan - Bukti hasil”.','lembaran alasan; hasil pengasingan','Evidence Talk')
    ];
    const challenge=[
      step('source-mixture-reason-h1','Masalah Campuran Baharu','Guru memberi campuran baharu yang selamat seperti batu berlainan saiz atau klip kertas bercampur pasir. Murid memilih kaedah tanpa diberi nama alat.','campuran masalah; alat pengasingan','Problem Solving'),
      step('source-mixture-reason-h2','Nilai Kaedah Kurang Sesuai','Murid mencuba atau mensimulasikan satu kaedah yang kurang sesuai, mengenal pasti sebab ia tidak berkesan dan mencadangkan kaedah yang lebih tepat.','kad kaedah; lembaran banding','Critical Thinking'),
      step('source-mixture-reason-h3','Bina Peraturan Pemilihan','Murid membina dua peraturan mudah, contohnya gunakan magnet apabila salah satu bahan tertarik magnet dan gunakan ayak apabila saiz bahan berbeza.','kad rumusan; rekod aktiviti','Concept Map')
    ];
    return {method:'Penyelesaian masalah campuran + uji kaedah + alasan berbukti',pakDetail:'Murid tidak sekadar menamakan kaedah; mereka mengenal pasti ciri bahan, menguji pilihan dan memberi sebab berdasarkan hasil pengasingan.',anchor:`Pilih dan naakul kaedah mengasingkan campuran pada ${p} berdasarkan ciri bahan.`,kind:'investigation',bbmList:[p,'magnet','ayak/penapis','campuran masalah','lembaran alasan'],groupBbm:{support:common,core:common,challenge:common},mainSp:'8.1.2',page:p,topic:m.title||'Kaedah Mengasingkan Campuran',setInduksi:'Guru menunjukkan dua campuran berbeza dan dua alat pengasingan. Murid meramal alat yang lebih sesuai untuk setiap campuran dan menyatakan sebab.',inductionData:{name:'Alat Mana Lebih Sesuai?',text:'Guru menunjukkan dua campuran dan dua alat. Murid memadankan secara awal sebelum keputusan diuji.',bbm:'dua campuran; magnet; ayak/penapis',pak21:'Predict-Observe-Explain'},librarySteps:{support,core,challenge},diffSupport:'Kenal pasti ciri bahan, pilih alat dan lengkapkan ayat alasan.',diffCore:'Ramalkan, uji kaedah dan bentangkan alasan berbukti.',diffChallenge:'Selesaikan campuran baharu dan bina peraturan pemilihan kaedah.',diffSupportAct:support.map(x=>x.text).join(' '),diffCoreAct:core.map(x=>x.text).join(' '),diffChallengeAct:challenge.map(x=>x.text).join(' '),pbdEvidence:{method:'Pemerhatian penyelesaian masalah + semakan lembaran alasan',evidence:'Ciri bahan, kaedah dipilih, hasil pengasingan dan alasan murid.',criterion:pair(m).criteria},penutup:'Murid melengkapkan ayat “Saya memilih ___ untuk campuran ___ kerana ___.” Guru memilih beberapa alasan yang benar-benar merujuk ciri bahan.'};
  }
  const prevEffective=window.effectiveRphLessonMap;
  if(typeof prevEffective==='function')window.effectiveRphLessonMap=function(m,ev,built){const out=prevEffective(m,ev,built)||m;if(!mode(out))return out;const p=pair(out);return {...out,objective:p.objective,success_criteria:p.criteria,_runtime_science_source_blueprint:`mixture_${mode(out)}`};};
  const prevPed=window.buildSourceAwarePedagogy;
  if(typeof prevPed==='function')window.buildSourceAwarePedagogy=function(m,a,bt,en,classId=null){const base=prevPed(m,a,bt,en,classId);if(en)return base;if(mode(m)==='describe')return {...base,...describe(m,bt)};if(mode(m)==='reason')return {...base,...reason(m,bt)};return base;};
  window.__RPH_SCIENCE_MIXTURE_BLUEPRINT__={version:'2026-09-04a',standards:['8.1.1','8.1.2']};
  console.info('RPH Science mixture separation blueprints active.');
})();