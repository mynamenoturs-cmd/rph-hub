(function(){
  'use strict';

  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
  const subjectKey=map=>{try{return typeof window.rphSubjectKey==='function'?window.rphSubjectKey(map?.subject_id):''}catch{return ''}};
  const mainSp=map=>String(map?.source_evidence?.meta?.main_sp||String(map?.sp||'').split(',')[0]||'').trim();
  const pageNo=map=>Number(map?.textbook_page_start||0)||0;
  const pageLabel=map=>pageNo(map)?`Buku Teks m/s ${pageNo(map)}`:'Buku Teks';
  const sourceText=(map,activities=[])=>norm([
    map?.title,map?.source_activities,map?.source_evidence?.textbook?.text,
    map?.source_evidence?.dskp?.text,map?.source_evidence?.rpt?.text,
    ...(activities||[])
  ].filter(Boolean).join(' ')).toLowerCase();
  const mk=(key,name,text,bbm,pak21,phase='source')=>({key,name,text,bbm,pak21,phase});

  function isAbsorption(map,activities=[]){
    if(subjectKey(map)!=='science'||pageNo(map)!==72)return false;
    if(!['8.1.2','8.1.3'].includes(mainSp(map)))return false;
    const s=sourceText(map,activities);
    return /(menyerap|penyerapan|absorb)/.test(s);
  }

  function pair(map){
    const page=pageLabel(map),sp=mainSp(map);
    if(sp==='8.1.2')return{
      objective:`Pada akhir PdP, murid dapat mengelaskan sekurang-kurangnya enam objek kepada objek yang boleh menyerap air dan tidak boleh menyerap air berdasarkan hasil ujian pada ${page}.`,
      criteria:'Murid menguji objek menggunakan jumlah air yang sama, merekod pemerhatian dan mengelaskan sekurang-kurangnya lima daripada enam objek dengan betul berdasarkan bukti.'
    };
    return{
      objective:`Pada akhir PdP, murid dapat memerihalkan keupayaan sekurang-kurangnya tiga bahan menyerap air berdasarkan hasil penyiasatan menggunakan sampel bersaiz sama berpandukan ${page}.`,
      criteria:'Murid menggunakan sampel bersaiz sama dan jumlah air yang sama, merekod hasil setiap bahan, membandingkan keupayaan menyerap air dan menyatakan bahan yang menyerap lebih banyak air berdasarkan data.'
    };
  }

  function blueprint(map,btRef){
    const page=btRef||pageLabel(map),sp=mainSp(map),classify=sp==='8.1.2';
    const objects='sapu tangan, kertas tisu, kertas, klip kertas, guli dan penutup botol';
    const common=`${page}; air berwarna; penitis; ${objects}; dulang; jadual rekod`;
    const support=classify?[
      mk('source-absorb-support-1','Ramalan Serap atau Tidak',`Guru menunjukkan empat objek daripada ${page}. Murid meletakkan kad ramalan “SERAP” atau “TIDAK SERAP” sebelum ujian dijalankan.`,`${page}; empat objek; kad SERAP/TIDAK SERAP`,'Predict-Observe-Explain'),
      mk('source-absorb-support-2','Uji Empat Objek',`Dengan bimbingan guru, murid menitiskan jumlah air yang sama pada setiap objek di atas dulang. Murid memerhati sama ada air masuk ke dalam bahan atau kekal pada permukaan, kemudian menandakan keputusan dalam jadual bergambar.`,common,'Inkuiri berpandu'),
      mk('source-absorb-support-3','Asingkan Dua Kumpulan',`Murid meletakkan kad objek pada dua ruang, iaitu “boleh menyerap air” dan “tidak boleh menyerap air”. Pasangan menyemak setiap kad menggunakan keputusan ujian, bukan tekaan.`,`kad objek; dua label kategori; jadual keputusan`,'Pair Check')
    ]:[
      mk('source-absorb-support-1','Banding Dua Bahan',`Guru menyediakan dua sampel bahan bersaiz sama. Murid membuat ramalan bahan yang menyerap lebih banyak air.`,`dua sampel bersaiz sama; kad ramalan`,'Predict-Observe-Explain'),
      mk('source-absorb-support-2','Titis dan Kira',`Murid menitiskan jumlah air yang sama pada setiap sampel dengan bimbingan guru dan merekod bilangan titisan yang diserap sebelum permukaan kelihatan basah atau air bertakung.`,`sampel bersaiz sama; penitis; air berwarna; jadual bergambar`,'Inkuiri berpandu'),
      mk('source-absorb-support-3','Pilih yang Lebih Menyerap',`Murid membandingkan rekod dua sampel dan melengkapkan ayat “___ menyerap lebih banyak air daripada ___ kerana ___.”`,`jadual keputusan; rangka ayat`,'Pair Check')
    ];
    const core=classify?[
      mk('source-absorb-core-1','Tetapkan Ujian yang Sama',`Kumpulan menyediakan ${objects} seperti dalam sumber. Murid memastikan setiap objek diuji dengan jumlah titisan air yang sama dan membuat ramalan sebelum ujian.`,common,'Inkuiri saintifik'),
      mk('source-absorb-core-2','Detektif Penyerapan',`Murid menguji setiap objek satu demi satu, memerhati keadaan air pada bahan dan merekod “menyerap” atau “tidak menyerap”. Mereka mengulangi pemerhatian yang tidak jelas sebelum membuat keputusan.`,common,'Hands-on Investigation'),
      mk('source-absorb-core-3','Cabaran Dua Bakul',`Kumpulan mengelaskan kad keenam-enam objek kepada dua bakul kategori. Satu mata hanya diberikan apabila murid dapat menunjukkan keputusan ujian yang menyokong pengelasan tersebut.`,`kad objek; dua bekas kategori; jadual keputusan`,'Game-Based Learning')
    ]:[
      mk('source-absorb-core-1','Sediakan Perbandingan Adil',`Kumpulan menggunakan sekurang-kurangnya tiga sampel bahan bersaiz sama. Mereka menetapkan jumlah air dan cara menitis yang sama untuk setiap sampel sebelum membuat ramalan.`,`sampel bahan bersaiz sama; penitis; air berwarna; jadual ramalan`,'Fair Test'),
      mk('source-absorb-core-2','Ukur Keupayaan Menyerap',`Murid menguji setiap sampel menggunakan titisan standard, merekod jumlah air yang dapat diserap dan memastikan prosedur yang sama digunakan untuk semua bahan.`,`sampel bersaiz sama; penitis; air berwarna; dulang; jadual data`,'Hands-on Investigation'),
      mk('source-absorb-core-3','Susun Paling Sedikit ke Paling Banyak',`Kumpulan menyusun kad bahan mengikut keupayaan menyerap air berdasarkan rekod, kemudian menerangkan pola antara jenis bahan dan jumlah air yang diserap.`,`kad bahan; kad nombor; jadual data`,'Data Challenge')
    ];
    const challenge=classify?[
      mk('source-absorb-challenge-1','Buktikan Pengelasan',`Murid menguji semua objek dan mencatat bukti yang membezakan objek menyerap dengan tidak menyerap, contohnya air meresap ke dalam bahan atau kekal pada permukaan.`,common,'Evidence Hunt'),
      mk('source-absorb-challenge-2','Tambah Satu Objek Baharu',`Murid memilih satu objek tambahan yang disediakan guru, membuat ramalan, mengujinya dengan prosedur yang sama dan memasukkannya ke kategori yang betul.`,`objek tambahan yang disediakan guru; penitis; jadual rekod`,'Predict-Test-Explain'),
      mk('source-absorb-challenge-3','Jelaskan Berdasarkan Bahan',`Murid membandingkan dua objek daripada bahan berbeza dan menerangkan mengapa keputusan ujian menyokong pengelasan mereka tanpa meneka berdasarkan rupa semata-mata.`,`hasil ujian murid; kad bukti`,'Evidence Talk')
    ]:[
      mk('source-absorb-challenge-1','Ulang Ujian dan Semak',`Murid mengulangi penyiasatan bagi setiap sampel dalam keadaan yang sama dan menyemak sama ada susunan keupayaan menyerap air kekal konsisten.`,`sampel bersaiz sama; penitis; jadual dua percubaan`,'Fair Test'),
      mk('source-absorb-challenge-2','Data Detective',`Murid membandingkan dua percubaan, mencari satu persamaan atau perbezaan dan mengenal pasti data yang paling kuat menyokong bahan yang menyerap lebih banyak air.`,`jadual dua percubaan; kad data`,'Data Detective'),
      mk('source-absorb-challenge-3','Kesimpulan Jenis Bahan',`Murid menyusun sekurang-kurangnya tiga bahan daripada paling kurang kepada paling banyak menyerap air dan menerangkan susunan menggunakan data penyiasatan.`,`kad bahan; jadual keputusan`,'Evidence Talk')
    ];

    return{
      method:'Penyiasatan bahan + Predict-Observe-Explain + pengelasan/data',
      pakDetail:classify
        ?'Murid menguji objek sebenar daripada sumber, merekod apa yang berlaku kepada air dan mengelaskan objek hanya selepas memperoleh bukti. Permainan dua kategori digunakan selepas penyiasatan sebagai pengukuhan.'
        :'Murid menjalankan perbandingan adil menggunakan sampel bersaiz sama dan jumlah air yang sama, merekod data dan memerihalkan keupayaan bahan menyerap air berdasarkan keputusan.',
      anchor:classify?`Uji dan kelaskan objek menyerap/tidak menyerap air pada ${page}.`:`Banding keupayaan bahan menyerap air pada ${page} melalui penyiasatan adil.`,
      kind:'investigation',bbmList:[page,'air berwarna','penitis','objek/bahan sumber','dulang','jadual rekod'],
      groupBbm:{support:common,core:common,challenge:common},mainSp:sp,page,topic:map.title||'Penyerapan',
      setInduksi:'Guru menitiskan jumlah air yang sama pada sekeping tisu dan satu objek tidak menyerap. Murid membuat ramalan tentang apa yang akan berlaku kepada air dan memberikan sebab.',
      inductionData:{name:'Air Pergi Ke Mana?',text:'Guru menitiskan jumlah air yang sama pada sekeping tisu dan satu objek tidak menyerap. Murid membuat ramalan tentang apa yang akan berlaku kepada air dan memberikan sebab.',bbm:'tisu; objek tidak menyerap; air berwarna; penitis',pak21:'Predict-Observe-Explain'},
      librarySteps:{support,core,challenge},
      diffSupport:classify?'Uji empat objek dengan jadual bergambar dan bimbingan pengelasan.':'Banding dua bahan menggunakan sampel bersaiz sama dan rangka ayat.',
      diffCore:classify?'Uji sekurang-kurangnya enam objek, rekod hasil dan kelaskan berdasarkan bukti.':'Banding sekurang-kurangnya tiga bahan dalam ujian adil dan susun keupayaan berdasarkan data.',
      diffChallenge:classify?'Tambah satu objek baharu dan pertahankan pengelasan menggunakan bukti ujian.':'Ulang ujian, semak ketekalan dan bina kesimpulan berdasarkan dua set data.',
      diffSupportAct:support.map(x=>x.text).join(' '),diffCoreAct:core.map(x=>x.text).join(' '),diffChallengeAct:challenge.map(x=>x.text).join(' '),
      pbdEvidence:{method:'Pemerhatian penyiasatan + semakan jadual rekod + penerangan lisan',evidence:classify?'Ramalan, keputusan ujian setiap objek dan pengelasan menyerap/tidak menyerap.':'Data penyerapan bagi sampel bersaiz sama, susunan keupayaan dan alasan berdasarkan data.',criterion:pair(map).criteria},
      penutup:classify?'Murid memilih satu objek daripada setiap kategori dan melengkapkan ayat “___ menyerap air kerana…” dan “___ tidak menyerap air kerana…”. Guru meminta murid merujuk keputusan ujian sebagai bukti.':'Murid menyatakan bahan yang paling banyak menyerap air dalam ujian dan menyebut satu nombor atau rekod yang menyokong kesimpulan. Guru menegaskan bahawa perbandingan mesti menggunakan keadaan ujian yang sama.'
    };
  }

  const previousEffective=window.effectiveRphLessonMap;
  if(typeof previousEffective==='function')window.effectiveRphLessonMap=function(map,ev,built){
    const out=previousEffective(map,ev,built)||map;
    if(!isAbsorption(out,built?.activities||[]))return out;
    const p=pair(out);
    return {...out,objective:p.objective,success_criteria:p.criteria,_runtime_science_source_blueprint:`absorption_${mainSp(out).replaceAll('.','_')}`};
  };

  const previousPedagogy=window.buildSourceAwarePedagogy;
  if(typeof previousPedagogy==='function')window.buildSourceAwarePedagogy=function(map,activities,btRef,uiEn,classId=null){
    const base=previousPedagogy(map,activities,btRef,uiEn,classId);
    if(uiEn||!isAbsorption(map,activities))return base;
    return {...base,...blueprint(map,btRef)};
  };

  window.__RPH_SCIENCE_ABSORPTION_BLUEPRINT__={version:'2026-09-04a'};
  console.info('RPH Science absorption blueprint active.');
})();
