(function(){
  'use strict';

  const subjectKey=map=>{try{return typeof window.rphSubjectKey==='function'?window.rphSubjectKey(map?.subject_id):''}catch{return ''}};
  const mainSp=map=>String(map?.source_evidence?.meta?.main_sp||String(map?.sp||'').split(',')[0]||'').trim();
  const year=map=>Number(map?.year||0)||0;
  const pageNo=map=>Number(map?.textbook_page_start||0)||0;
  const pageLabel=map=>pageNo(map)?`Buku Teks m/s ${pageNo(map)}`:'Buku Teks';
  const step=(key,name,text,bbm,pak21)=>({key,name,text,bbm,pak21,phase:'source'});

  function mode(map){
    if(subjectKey(map)!=='science'||year(map)!==1)return '';
    if(mainSp(map)==='7.1.3'&&pageNo(map)===65)return 'objects';
    if(mainSp(map)==='7.1.4'&&pageNo(map)===67)return 'poles';
    return '';
  }

  function pair(map){
    const page=pageLabel(map);
    if(mode(map)==='objects')return{
      objective:`Pada akhir PdP, murid dapat menguji tindakan magnet terhadap sekurang-kurangnya enam objek dan mengelaskan objek kepada ditarik atau tidak ditarik oleh magnet berdasarkan pemerhatian pada ${page}.`,
      criteria:'Murid menguji sekurang-kurangnya enam objek, merekod keputusan dan mengelaskan sekurang-kurangnya lima objek dengan betul berdasarkan pemerhatian sebenar.'
    };
    return{
      objective:`Pada akhir PdP, murid dapat menentukan tindakan tarikan atau tolakan bagi empat pasangan kutub magnet dan membuat kesimpulan berdasarkan penyiasatan pada ${page}.`,
      criteria:'Murid menguji U-U, S-S, U-S dan S-U, merekod tindakan setiap pasangan serta menyimpulkan bahawa kutub sama menolak dan kutub berlainan menarik.'
    };
  }

  function objectsBlueprint(map,btRef){
    const page=btRef||pageLabel(map);
    const common=`${page}; magnet; klip kertas; paku besi; pensel kayu; pemadam; penutup botol plastik; batang aiskrim; jadual keputusan`;
    const support=[
      step('source-magnet-objects-s1','Ramalkan Ditarik atau Tidak','Murid meramal tindakan magnet terhadap empat objek menggunakan kad DITARIK atau TIDAK DITARIK.',`${page}; magnet; empat objek; kad ramalan`,'Predict-Observe-Explain'),
      step('source-magnet-objects-s2','Uji Satu Demi Satu','Dengan bimbingan guru, murid mendekatkan magnet kepada setiap objek dengan cara yang sama dan merekod sama ada objek ditarik atau tidak ditarik.','magnet; empat objek; jadual bergambar','Inkuiri berpandu'),
      step('source-magnet-objects-s3','Asingkan Dua Kumpulan','Murid mengelaskan objek kepada ditarik magnet atau tidak ditarik magnet dan menyemak pengelasan dengan keputusan ujian.','kad objek; dua label kategori; jadual keputusan','Pair Check')
    ];
    const core=[
      step('source-magnet-objects-c1','Bina Jadual Ramalan','Kumpulan membuat ramalan bagi enam objek sebelum ujian dan menetapkan cara ujian yang sama untuk semua objek.',`${page}; magnet; enam objek; jadual ramalan`,'Predict-Observe-Explain'),
      step('source-magnet-objects-c2','Detektif Tindakan Magnet','Murid menguji keenam-enam objek satu demi satu, merekod ditarik atau tidak ditarik, dan mengulang pemerhatian yang tidak jelas.',common,'Hands-on Investigation'),
      step('source-magnet-objects-c3','Cabaran Dua Zon','Kumpulan meletakkan kad objek pada zon DITARIK atau TIDAK DITARIK. Mata diberi hanya apabila keputusan ujian dapat ditunjukkan sebagai bukti.','kad objek; dua zon kategori; jadual keputusan','Game-Based Learning')
    ];
    const challenge=[
      step('source-magnet-objects-h1','Uji dan Sahkan','Murid mengulang sekurang-kurangnya dua keputusan untuk memastikan pengelasan konsisten.',common,'Evidence Check'),
      step('source-magnet-objects-h2','Objek Misteri','Murid meramal dan menguji dua objek tambahan yang disediakan guru menggunakan prosedur yang sama.','magnet; dua objek tambahan; jadual rekod','Predict-Test-Explain'),
      step('source-magnet-objects-h3','Bina Pengitlakan Berbukti','Murid menyatakan pola daripada keputusan dan memberikan sekurang-kurangnya dua contoh objek sebagai bukti.','jadual keputusan lengkap; kad bukti','Evidence Talk')
    ];
    return{
      method:'Penyiasatan objek + Predict-Observe-Explain + pengelasan berbukti',
      pakDetail:'Ramalan dibuat sebelum ujian, tetapi pengelasan akhir mesti berdasarkan pemerhatian sebenar. Permainan digunakan selepas data diperoleh.',
      anchor:`Uji tindakan magnet terhadap pelbagai objek pada ${page} dan kelaskan keputusan kepada ditarik atau tidak ditarik.`,
      kind:'investigation',bbmList:[page,'magnet','set objek ujian','jadual keputusan','kad kategori'],
      groupBbm:{support:common,core:common,challenge:common},mainSp:'7.1.3',page,topic:map.title||'Hebatnya Magnet',
      setInduksi:'Guru menunjukkan klip kertas dan penutup botol plastik. Murid meramal objek yang akan ditarik apabila magnet didekatkan.',
      inductionData:{name:'Magnet Pilih Yang Mana?',text:'Guru menunjukkan klip kertas dan penutup botol plastik. Murid meramal objek yang akan ditarik apabila magnet didekatkan.',bbm:'magnet; klip kertas; penutup botol plastik',pak21:'Predict-Observe-Explain'},
      librarySteps:{support,core,challenge},
      diffSupport:'Uji empat objek dengan jadual bergambar.',
      diffCore:'Uji enam objek dan kelaskan berdasarkan bukti.',
      diffChallenge:'Tambah dua objek baharu dan bina pengitlakan daripada data.',
      diffSupportAct:support.map(x=>x.text).join(' '),diffCoreAct:core.map(x=>x.text).join(' '),diffChallengeAct:challenge.map(x=>x.text).join(' '),
      pbdEvidence:{method:'Pemerhatian hands-on + semakan jadual + penerangan lisan',evidence:'Ramalan, keputusan ujian dan pengelasan ditarik/tidak ditarik.',criterion:pair(map).criteria},
      penutup:'Murid menyatakan satu objek yang ditarik dan satu objek yang tidak ditarik, kemudian menunjukkan rekod ujian sebagai bukti.'
    };
  }

  function polesBlueprint(map,btRef){
    const page=btRef||pageLabel(map);
    const common=`${page}; dua magnet bar berlabel U/S; kad U/S; jadual U-U, S-S, U-S, S-U; kad TARIK/TOLAK`;
    const support=[
      step('source-magnet-poles-s1','Kenal Kutub','Murid memadankan kad U dan S dengan kutub pada dua magnet sebelum membuat ramalan.',`${page}; dua magnet; kad U/S`,'Guided Discovery'),
      step('source-magnet-poles-s2','Uji Dua Pasangan','Murid menguji satu pasangan kutub sama dan satu pasangan kutub berlainan lalu merekod sama ada magnet saling menarik atau menolak.','dua magnet; jadual dua pasangan; kad TARIK/TOLAK','Inkuiri berpandu'),
      step('source-magnet-poles-s3','Lengkapkan Kesimpulan','Murid melengkapkan ayat Kutub sama ___ dan Kutub berlainan ___ berdasarkan pemerhatian.','rangka ayat; jadual keputusan','Pair Check')
    ];
    const core=[
      step('source-magnet-poles-c1','Ramalkan Empat Pasangan','Kumpulan membuat ramalan bagi U-U, S-S, U-S dan S-U sebelum penyiasatan.',`${page}; dua magnet; jadual ramalan`,'Predict-Observe-Explain'),
      step('source-magnet-poles-c2','Uji Tarikan dan Tolakan','Murid menguji keempat-empat pasangan kutub dengan satu magnet dipegang tetap dan magnet kedua didekatkan dengan cara yang sama. Keputusan direkod sebagai tarik atau tolak.',common,'Hands-on Investigation'),
      step('source-magnet-poles-c3','Kad Kutub Pantas','Guru menunjukkan kad pasangan kutub secara rawak. Kumpulan menjawab TARIK atau TOLAK dan menunjukkan baris data yang menyokong jawapan.','kad pasangan kutub; kad TARIK/TOLAK; jadual keputusan','Game-Based Learning')
    ];
    const challenge=[
      step('source-magnet-poles-h1','Ulang Ujian','Murid mengulang U-U, S-S, U-S dan S-U untuk menyemak ketekalan tindakan.',common,'Reliability Check'),
      step('source-magnet-poles-h2','Teka Kutub Tersembunyi','Guru menutup satu label kutub. Murid membuat inferens tentang kutub tersembunyi daripada tindakan tarik atau tolak, kemudian membuka label untuk menyemak.','dua magnet; penutup label; jadual inferens','Inference Challenge'),
      step('source-magnet-poles-h3','Kesimpulan Umum','Murid menggunakan empat keputusan untuk menyimpulkan bahawa kutub sama menolak dan kutub berlainan menarik.','jadual empat pasangan; kad bukti','Evidence Talk')
    ];
    return{
      method:'Penyiasatan kutub magnet + Predict-Observe-Explain + inferens berbukti',
      pakDetail:'Kesimpulan dibuat selepas U-U, S-S, U-S dan S-U diuji. Aktiviti kad hanya mengukuhkan pola yang telah dibuktikan melalui penyiasatan.',
      anchor:`Siasat tarikan dan tolakan pada ${page} dengan menguji U-U, S-S, U-S dan S-U.`,
      kind:'investigation',bbmList:[page,'dua magnet bar berlabel U/S','kad U/S','jadual empat pasangan','kad TARIK/TOLAK'],
      groupBbm:{support:common,core:common,challenge:common},mainSp:'7.1.4',page,topic:map.title||'Tarikan dan Tolakan Magnet',
      setInduksi:'Guru mendekatkan dua hujung magnet tanpa menunjukkan label kutub. Murid meramal sama ada magnet akan menarik atau menolak.',
      inductionData:{name:'Tarik atau Tolak?',text:'Guru mendekatkan dua hujung magnet tanpa menunjukkan label kutub. Murid meramal sama ada magnet akan menarik atau menolak.',bbm:'dua magnet bar; penutup label kutub',pak21:'Predict-Observe-Explain'},
      librarySteps:{support,core,challenge},
      diffSupport:'Uji satu pasangan kutub sama dan satu pasangan berlainan.',
      diffCore:'Uji keempat-empat pasangan kutub dan bina kesimpulan daripada data.',
      diffChallenge:'Ulang ujian dan infer kutub tersembunyi daripada tindakan magnet.',
      diffSupportAct:support.map(x=>x.text).join(' '),diffCoreAct:core.map(x=>x.text).join(' '),diffChallengeAct:challenge.map(x=>x.text).join(' '),
      pbdEvidence:{method:'Pemerhatian penyiasatan + semakan jadual + penerangan lisan',evidence:'Keputusan U-U, S-S, U-S dan S-U serta kesimpulan tarikan/tolakan.',criterion:pair(map).criteria},
      penutup:'Murid melengkapkan dua ayat: Kutub sama menolak dan kutub berlainan menarik, kemudian menunjukkan satu keputusan ujian bagi setiap ayat.'
    };
  }

  const previousEffective=window.effectiveRphLessonMap;
  if(typeof previousEffective==='function')window.effectiveRphLessonMap=function(map,ev,built){
    const out=previousEffective(map,ev,built)||map;
    if(!mode(out))return out;
    const p=pair(out);
    return {...out,objective:p.objective,success_criteria:p.criteria,_runtime_science_source_blueprint:`magnet_${mainSp(out).replaceAll('.','_')}`};
  };

  const previousPedagogy=window.buildSourceAwarePedagogy;
  if(typeof previousPedagogy==='function')window.buildSourceAwarePedagogy=function(map,activities,btRef,uiEn,classId=null){
    const base=previousPedagogy(map,activities,btRef,uiEn,classId);
    if(uiEn)return base;
    if(mode(map)==='objects')return {...base,...objectsBlueprint(map,btRef)};
    if(mode(map)==='poles')return {...base,...polesBlueprint(map,btRef)};
    return base;
  };

  window.__RPH_SCIENCE_MAGNET_ACTIONS_BLUEPRINT__={version:'2026-09-04b',standards:['7.1.3','7.1.4']};
  console.info('RPH Science magnet object/pole blueprints active.');
})();
