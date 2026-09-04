(function(){
  'use strict';

  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
  const subjectKey=map=>{try{return typeof window.rphSubjectKey==='function'?window.rphSubjectKey(map?.subject_id):''}catch{return ''}};
  const mainSp=map=>String(map?.source_evidence?.meta?.main_sp||String(map?.sp||'').split(',')[0]||'').trim();
  const yearOf=map=>Number(map?.year||0)||0;
  const pageNo=map=>Number(map?.textbook_page_start||0)||0;
  const pageLabel=map=>pageNo(map)?`Buku Teks m/s ${pageNo(map)}`:'Buku Teks';
  const sourceText=(map,activities=[])=>norm([
    map?.title,map?.source_activities,map?.source_evidence?.textbook?.text,
    map?.source_evidence?.dskp?.text,map?.source_evidence?.rpt?.text,
    ...(activities||[])
  ].filter(Boolean).join(' ')).toLowerCase();
  const mk=(key,name,text,bbm,pak21,phase='source')=>({key,name,text,bbm,pak21,phase});

  function isObjectAction(map,activities=[]){
    if(subjectKey(map)!=='science'||yearOf(map)!==1||mainSp(map)!=='7.1.3'||pageNo(map)!==65)return false;
    const s=sourceText(map,activities);
    return /(magnet|hebatnya)/.test(s);
  }

  function isPoleAction(map,activities=[]){
    if(subjectKey(map)!=='science'||yearOf(map)!==1||mainSp(map)!=='7.1.4'||pageNo(map)!==67)return false;
    const s=sourceText(map,activities);
    return /(magnet|tarikan|tolakan|kutub)/.test(s);
  }

  function objectivePair(map){
    const page=pageLabel(map),sp=mainSp(map);
    if(sp==='7.1.3')return{
      objective:`Pada akhir PdP, murid dapat menguji tindakan magnet terhadap sekurang-kurangnya enam objek dan mengelaskan objek kepada ditarik atau tidak ditarik oleh magnet berdasarkan pemerhatian pada ${page}.`,
      criteria:'Murid menguji sekurang-kurangnya enam objek satu demi satu dengan cara yang sama, merekod keputusan dan mengelaskan sekurang-kurangnya lima objek dengan betul berdasarkan pemerhatian sebenar.'
    };
    return{
      objective:`Pada akhir PdP, murid dapat menentukan tindakan tarikan atau tolakan bagi sekurang-kurangnya empat pasangan kutub magnet dan membuat kesimpulan berdasarkan penyiasatan pada ${page}.`,
      criteria:'Murid menguji pasangan kutub U-U, S-S, U-S dan S-U, merekod tindakan setiap pasangan dan menyatakan bahawa kutub sama menolak manakala kutub berlainan menarik berdasarkan bukti penyiasatan.'
    };
  }

  function objectBlueprint(map,btRef){
    const page=btRef||pageLabel(map);
    const objects='klip kertas, paku besi, pensel kayu, pemadam, penutup botol plastik dan batang aiskrim';
    const common=`${page}; magnet; ${objects}; dulang; jadual ramalan dan keputusan; kad DITARIK/TIDAK DITARIK`;
    const support=[
      mk('source-magnet-object-support-1','Ramalkan Ditarik atau Tidak',`Guru menyediakan empat objek daripada set ujian. Murid memegang kad “DITARIK” atau “TIDAK DITARIK” sebagai ramalan sebelum magnet didekatkan.`,`${page}; magnet; empat objek; kad ramalan`,'Predict-Observe-Explain'),
      mk('source-magnet-object-support-2','Uji Satu Demi Satu',`Dengan bimbingan guru, murid mendekatkan magnet kepada setiap objek tanpa menukar cara ujian. Murid memerhati sama ada objek bergerak ke arah magnet dan menandakan keputusan dalam jadual bergambar.`,`magnet; empat objek; jadual bergambar`,'Inkuiri berpandu'),
      mk('source-magnet-object-support-3','Asingkan Dua Kumpulan',`Murid meletakkan kad objek pada dua ruang, iaitu “ditarik magnet” dan “tidak ditarik magnet”. Pasangan menyemak setiap kad dengan keputusan ujian sebelum guru meminta satu kesimpulan ringkas.`,`kad objek; dua label kategori; jadual keputusan`,'Pair Check')
    ];
    const core=[
      mk('source-magnet-object-core-1','Bina Jadual Ramalan',`Kumpulan menyenaraikan ${objects} dan membuat ramalan bagi setiap objek sebelum ujian. Murid menetapkan satu cara ujian yang sama untuk semua objek.`,`${page}; magnet; enam objek; jadual ramalan`,'Predict-Observe-Explain'),
      mk('source-magnet-object-core-2','Detektif Tindakan Magnet',`Murid menguji keenam-enam objek satu demi satu dengan mendekatkan magnet dan merekod “ditarik” atau “tidak ditarik”. Pemerhatian yang tidak jelas diuji semula sebelum jawapan diterima.`,common,'Hands-on Investigation'),
      mk('source-magnet-object-core-3','Cabaran Dua Zon',`Kumpulan mengelaskan kad semua objek kepada zon “ditarik” dan “tidak ditarik”. Satu mata hanya diberikan apabila murid dapat menunjukkan keputusan ujian yang menyokong kedudukan kad tersebut.`,`kad objek; dua zon kategori; jadual keputusan`,'Game-Based Learning')
    ];
    const challenge=[
      mk('source-magnet-object-challenge-1','Uji dan Sahkan',`Murid menguji set objek yang sama dan mengulangi sekurang-kurangnya dua keputusan bagi memastikan pengelasan dibuat berdasarkan pemerhatian yang konsisten.`,common,'Evidence Check'),
      mk('source-magnet-object-challenge-2','Objek Misteri',`Guru memberikan dua objek tambahan yang belum diuji. Murid membuat ramalan, menjalankan ujian dengan cara yang sama dan menambah keputusan ke dalam jadual tanpa mengubah kategori asal sesuka hati.`,`magnet; dua objek tambahan guru; jadual rekod`,'Predict-Test-Explain'),
      mk('source-magnet-object-challenge-3','Bina Pengitlakan Berbukti',`Murid menyatakan pola berdasarkan semua keputusan yang diperoleh dan memberikan sekurang-kurangnya dua contoh objek sebagai bukti. Murid diingatkan supaya tidak membuat kesimpulan tentang objek yang belum diuji.`,`jadual keputusan lengkap; kad bukti`,'Evidence Talk')
    ];
    const criterion=objectivePair(map).criteria;
    return{
      method:'Penyiasatan objek + Predict-Observe-Explain + pengelasan berbukti',
      pakDetail:'Murid menguji tindakan magnet terhadap pelbagai objek secara langsung. Ramalan dibuat sebelum ujian, tetapi pengelasan akhir mesti berdasarkan pemerhatian sebenar. Permainan dua zon hanya digunakan selepas data diperoleh supaya aktiviti tidak menggantikan tugasan sumber.',
      anchor:`Uji tindakan magnet terhadap pelbagai objek pada ${page} dan kelaskan keputusan kepada ditarik atau tidak ditarik berdasarkan pemerhatian.`,
      kind:'investigation',bbmList:[page,'magnet','set objek ujian','dulang','jadual ramalan dan keputusan','kad kategori'],
      groupBbm:{support:common,core:common,challenge:common},mainSp:'7.1.3',page,topic:map.title||'Hebatnya Magnet',
      setInduksi:'Guru menunjukkan satu klip kertas dan satu penutup botol plastik. Murid meramal objek yang akan bertindak balas apabila magnet didekatkan dan memberikan sebab sebelum demonstrasi dibuat.',
      inductionData:{name:'Magnet Pilih Yang Mana?',text:'Guru menunjukkan satu klip kertas dan satu penutup botol plastik. Murid meramal objek yang akan bertindak balas apabila magnet didekatkan dan memberikan sebab sebelum demonstrasi dibuat.',bbm:'magnet; klip kertas; penutup botol plastik',pak21:'Predict-Observe-Explain'},
      librarySteps:{support,core,challenge},
      diffSupport:'Uji empat objek dengan jadual bergambar dan bimbingan mengelaskan.',
      diffCore:'Uji sekurang-kurangnya enam objek, rekod semua keputusan dan kelaskan berdasarkan bukti.',
      diffChallenge:'Tambah dua objek baharu, ulang keputusan yang meragukan dan bina pengitlakan berdasarkan data.',
      diffSupportAct:support.map(x=>x.text).join(' '),diffCoreAct:core.map(x=>x.text).join(' '),diffChallengeAct:challenge.map(x=>x.text).join(' '),
      pbdEvidence:{method:'Pemerhatian hands-on + semakan jadual keputusan + penerangan lisan',evidence:'Ramalan, keputusan ujian setiap objek, pengelasan ditarik/tidak ditarik dan alasan berdasarkan pemerhatian.',criterion},
      penutup:'Murid memilih satu objek yang ditarik dan satu objek yang tidak ditarik, kemudian melengkapkan ayat “Magnet menarik ___ tetapi tidak menarik ___ berdasarkan ujian kami.” Guru meminta murid menunjukkan rekod sebagai bukti.'
    };
  }

  function poleBlueprint(map,btRef){
    const page=btRef||pageLabel(map);
    const common=`${page}; dua magnet bar dengan kutub U/S ditanda; kad U dan S; jadual U-U, S-S, U-S, S-U; anak panah tarikan/tolakan`;
    const support=[
      mk('source-magnet-pole-support-1','Kenal Kutub Sebelum Uji',`Guru membimbing murid mengenal pasti tanda U dan S pada dua magnet. Murid memadankan kad U dan S dengan kutub yang betul sebelum membuat ramalan.`,`${page}; dua magnet berlabel; kad U/S`,'Guided Discovery'),
      mk('source-magnet-pole-support-2','Uji Dua Pasangan',`Murid menguji satu pasangan kutub sama dan satu pasangan kutub berlainan. Mereka memegang satu magnet tetap, mendekatkan magnet kedua perlikut perlahan-lahan dan merekod sama ada magnet bergerak mendekat atau menjauh.`,`dua magnet; jadual dua pasangan; kad tarik/tolak`,'Inkuiri berpandu'),
      mk('source-magnet-pole-support-3','Lengkapkan Ayat Kesimpulan',`Murid melengkapkan rangka ayat “Kutub yang sama ___” dan “Kutub yang berlainan ___” berdasarkan dua pemerhatian yang telah direkod.`,`rangka ayat; jadual keputusan`,'Pair Check')
    ];
    const core=[
      mk('source-magnet-pole-core-1','Ramalkan Empat Pasangan',`Kumpulan membuat ramalan bagi pasangan U-U, S-S, U-S dan S-U sebelum penyiasatan. Setiap ramalan direkod tanpa mengubahnya selepas ujian bermula.`,`${page}; dua magnet berlabel; jadual ramalan empat pasangan`,'Predict-Observe-Explain'),
      <|DELIM_QTYKdgkU|>step_type<|DELIM_QTYKdgkU|>step_content<|DELIM_QTYKdgkU|>content_hash<|DELIM_QTYKdgkU|>provenance
      mk('source-magnet-pole-core-2','Uji Tarikan dan Tolakan',`Murid menguji keempat-empat pasangan kutub. Untuk setiap ujian, satu magnet dipegang tetap dan magnet kedua didekatkan pada jarak yang sama; murid merekod “tarik” atau “tolak” berdasarkan gerakan magnet.`,common,'Hands-on Investigation'),
      mk('source-magnet-pole-core-3','Kad Kutub Pantas',`Selepas jadual lengkap, guru menunjukkan kad pasangan kutub secara rawak. Kumpulan mengangkat kad “TARIK” atau “TOLAK” dan mendapat mata hanya apabila jawapan sepadan dengan data penyiasatan mereka.`,`kad pasangan U-U/S-S/U-S/S-U; kad TARIK/TOLAK; jadual keputusan`,'Game-Based Learning')
    ];
    const challenge=[
      mk('source-magnet-pole-challenge-1','Ulang Ujian Silang',`Murid mengulangi U-U, S-S, U-S dan S-U sekurang-kurangnya sekali untuk menyemak sama ada tindakan kekal sama.`,common,'Reliability Check'),
      mk('source-magnet-pole-challenge-2','Teka Kutub daripada Tindakan',`Guru menutup satu label kutub pada magnet kedua. Berdasarkan tindakan tarik atau tolak terhadap kutub rujukan yang diketahui, murid membuat inferens tentang kutub tersembunyi dan kemudian membuka label untuk menyemak.`,`dua magnet berlabel; penutup label; jadual inferens`,'Inference Challenge'),
      mk('source-magnet-pole-challenge-3','Bina Kesimpulan Umum',`Murid menggunakan empat keputusan untuk menerangkan pola: pasangan kutub yang sama menghasilkan tolakan dan pasangan kutub berlainan menghasilkan tarikan. Setiap pernyataan mesti disokong oleh sekurang-kurangnya satu baris data.`,`jadual empat pasangan; kad bukti`,'Evidence Talk')
    ];
    const criterion=objectivePair(map).criteria;
    return{
      method:'Penyiasatan kutub magnet + Predict-Observe-Explain + inferens berbukti',
      pakDetail:'Murid menguji pasangan kutub magnet satu demi satu dan merekod gerakan tarik atau tolak. Kesimpulan dibuat selepas keempat-empat pasangan diuji. Aktiviti kad dan inferens digunakan untuk mengukuhkan pola yang telah dibuktikan oleh penyiasatan.',
      anchor:`Siasat tarikan dan tolakan antara kutub magnet pada ${page} dengan menguji pasangan U-U, S-S, U-S dan S-U.`,
      kind:'investigation',bbmList:[page,'dua magnet bar berlabel U/S','kad U/S','jadual empat pasangan','kad TARIK/TOLAK'],
      groupBbm:{support:common,core:common,challenge:common},mainSp:'7.1.4',page,topic:map.title||'Tarikan dan Tolakan Magnet',
      setInduksi:'Guru mendekatkan dua hujung magnet tanpa menunjukkan label kutub. Murid memerhati sama ada magnet saling mendekat atau menjauh dan meramal jenis pasangan kutub yang mungkin digunakan.',
      inductionData:{name:'Tarik atau Tolak?',text:'Guru mendekatkan dua hujung magnet tanpa menunjukkan label kutub. Murid memerhati sama ada magnet saling mendekat atau menjauh dan meramal jenis pasangan kutub yang mungkin digunakan.',bbm:'dua magnet bar; penutup label kutub',pak21:'Predict-Observe-Explain'},
      librarySteps:{support,core,challenge},
      diffSupport:'Uji satu pasangan kutub sama dan satu pasangan berlainan menggunakan kad warna serta rangka ayat.',
      diffCore:'Uji keempat-empat pasangan kutub, rekod tindakan dan bina kesimpulan daripada data.',
      diffChallenge:'Ulang ujian, infer kutub tersembunyi daripada tindakan magnet dan pertahankan kesimpulan menggunakan data.',
      diffSupportAct:support.map(x=>x.text).join(' '),diffCoreAct:core.map(x=>x.text).join(' '),diffChallengeAct:challenge.map(x=>x.text).join(' '),
      pbdEvidence:{method:'Pemerhatian penyiasatan + semakan jadual empat pasangan + penerangan lisan',evidence:'Ramalan, keputusan U-U/S-S/U-S/S-U dan kesimpulan tarikan/tolakan berdasarkan pola data.',criterion},
      penutup:'Murid melengkapkan dua pernyataan: “Kutub sama ___” dan “Kutub berlainan ___”. Dua orang murid dipilih untuk menunjukkan satu pasangan magnet yang membuktikan setiap pernyataan.'
    };
  }

  const previousEffective=window.effectiveRphLessonMap;
  if(typeof previousEffective==='function')window.effectiveRphLessonMap=function(map,ev,built){
    const out=previousEffective(map,ev,built)||map;
    if(!isObjectAction(out,built?.activities||[])&&!isPoleAction(out,built?.activities||[]))return out;
    const p=objectivePair(out);
    return {...out,objective:p.objective,success_criteria:p.criteria,_runtime_science_source_blueprint:`magnet_${mainSp(out).replaceAll('.','_')}`};
  };

  const previousPedagogy=window.buildSourceAwarePedagogy;
  if(typeof previousPedagogy==='function')window.buildSourceAwarePedagogy=function(map,activities,btRef,uiEn,classId=null){
    const base=previousPedagogy(map,activities,btRef,uiEn,classId);
    if(uiEn)return base;
    if(isObjectAction(map,activities))return {...base,...objectBlueprint(map,btRef)};
    if(isPoleAction(map,activities))return {...base,...poleBlueprint(map,btRef)};
    return base;
  };

  window.__RPH_SCIENCE_MAGNET_ACTIONS_BLUEPRINT__={version:'2026-09-04a',standards:['7.1.3','7.1.4']};
  console.info('RPH Science magnet object/pole blueprints active.');
})();
