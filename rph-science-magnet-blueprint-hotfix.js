(function(){
  'use strict';

  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
  const subjectKey=map=>{try{return typeof window.rphSubjectKey==='function'?window.rphSubjectKey(map?.subject_id):''}catch{return ''}};
  const mainSp=map=>String(map?.source_evidence?.meta?.main_sp||String(map?.sp||'').split(',')[0]||'').trim();
  const pageLabel=map=>Number(map?.textbook_page_start||0)?`Buku Teks m/s ${Number(map.textbook_page_start)}`:'Buku Teks';
  const sourceText=(map,activities=[])=>norm([
    map?.title,map?.source_activities,map?.source_evidence?.textbook?.text,
    map?.source_evidence?.dskp?.text,map?.source_evidence?.rpt?.text,
    ...(activities||[])
  ].filter(Boolean).join(' ')).toLowerCase();
  const step=(name,text,bbm,pak21)=>({key:'source-task-magnet-strength',name,text,bbm,pak21,phase:'source'});

  function isMagnetStrength(map,activities=[]){
    if(subjectKey(map)!=='science'||mainSp(map)!=='7.1.5')return false;
    const s=sourceText(map,activities);
    return /kekuatan\s+magnet/.test(s)&&/(klip\s+kertas|paper\s*clip)/.test(s);
  }

  function pair(map){
    const page=pageLabel(map);
    return{
      objective:`Pada akhir PdP, murid dapat menentukan kekuatan magnet dengan membandingkan bilangan klip kertas yang dapat ditarik oleh sekurang-kurangnya dua magnet melalui penyiasatan yang adil berpandukan ${page}.`,
      criteria:'Murid dapat menjalankan ujian dengan cara yang sama bagi setiap magnet, merekod bilangan klip kertas yang ditarik, membandingkan keputusan dan mengenal pasti magnet yang lebih kuat berdasarkan bukti.'
    };
  }

  function blueprint(map,btRef){
    const page=btRef||pageLabel(map);
    const common=`${page}; magnet yang sama bentuk dan saiz; klip kertas yang sama jenis dan saiz; dulang; jadual rekod; kad nombor`;
    return{
      method:'Penyiasatan adil + Predict-Observe-Explain + Pair Check',
      pakDetail:'Murid membandingkan kekuatan magnet menggunakan bukti sebenar daripada bilangan klip kertas yang dapat ditarik. Bentuk dan saiz magnet serta jenis klip dikekalkan sama supaya perbandingan adil. Aktiviti permainan hanya digunakan untuk mengukuhkan bacaan data selepas penyiasatan.',
      anchor:`Siasat kekuatan magnet pada ${page} dengan membandingkan bilangan klip kertas yang dapat ditarik dalam keadaan ujian yang sama.`,
      kind:'investigation',
      bbmList:[page,'magnet yang sama bentuk dan saiz','klip kertas yang sama jenis dan saiz','dulang','jadual rekod','kad nombor'],
      groupBbm:{support:common,core:common,challenge:common},
      mainSp:'7.1.5',page,topic:map.title||'Kekuatan Magnet',
      setInduksi:`Guru menunjukkan dua magnet yang masing-masing menarik bilangan klip kertas yang berbeza. Murid membuat ramalan magnet yang lebih kuat dan menerangkan sebab ramalan tanpa diberitahu jawapan.`,
      inductionData:{name:'Magnet Mana Lebih Kuat?',text:'Guru menunjukkan dua magnet yang masing-masing menarik bilangan klip kertas yang berbeza. Murid membuat ramalan magnet yang lebih kuat dan menerangkan sebab ramalan tanpa diberitahu jawapan.',bbm:'dua magnet demonstrasi; klip kertas; Buku Teks',pak21:'Predict-Observe-Explain'},
      librarySteps:{
        support:[
          step('Ramalkan Bilangan Klip',`Murid melihat dua magnet yang sama bentuk dan saiz lalu menandakan ramalan magnet yang akan menarik lebih banyak klip kertas.`,`${page}; dua magnet; kad ramalan`,'Predict-Observe-Explain'),
          step('Uji dengan Cara yang Sama',`Dengan bimbingan guru, murid menguji satu magnet pada satu masa menggunakan klip kertas yang sama jenis dan saiz. Murid mengira bilangan klip yang berjaya ditarik dan merekod nombor dalam jadual bergambar.`,`dua magnet; klip kertas; jadual bergambar`,'Inkuiri berpandu'),
          step('Pilih Magnet Lebih Kuat',`Murid membandingkan dua nombor dalam jadual dan memilih magnet yang lebih kuat. Pasangan menyemak pilihan dengan menunjukkan bilangan klip sebagai bukti.`,`jadual keputusan; kad lebih banyak / lebih sedikit`,'Pair Check')
        ],
        core:[
          step('Tetapkan Ujian Adil',`Kumpulan memastikan magnet yang dibandingkan sama bentuk dan saiz, klip kertas sama jenis dan saiz serta cara ujian dikekalkan sama. Murid membuat ramalan sebelum ujian.`,`${page}; magnet; klip kertas; jadual ramalan`,'Inkuiri saintifik'),
          step('Cabaran Kekuatan Magnet',`Murid menguji setiap magnet satu demi satu, mengira bilangan klip kertas yang dapat ditarik dan merekod keputusan. Setiap ujian diulang dengan cara yang sama sebelum murid membandingkan hasil.`,`magnet; klip kertas; dulang; jadual keputusan`,'Hands-on Investigation'),
          step('Susun dari Lemah ke Kuat',`Kumpulan menyusun kad magnet mengikut bilangan klip kertas yang berjaya ditarik, daripada paling sedikit kepada paling banyak. Wakil kumpulan menerangkan susunan menggunakan data sebenar.`,`kad magnet; kad nombor; jadual keputusan`,'Data Challenge')
        ],
        challenge:[
          step('Ulang dan Semak Ketekalan',`Murid mengulangi ujian setiap magnet sekurang-kurangnya dua kali dengan keadaan yang sama dan membandingkan sama ada keputusan hampir konsisten.`,`magnet; klip kertas; jadual dua percubaan`,'Fair Test'),
          step('Uji Pemboleh Ubah Jarak',`Selepas perbandingan bilangan klip selesai, murid menguji satu magnet pada dua jarak yang ditetapkan guru sambil mengekalkan bahan lain sama, kemudian merekod perubahan tarikan.`,`magnet; klip kertas; pembaris; jadual jarak`,'Variable Control'),
          step('Bina Kesimpulan Berbukti',`Murid menyatakan magnet yang lebih kuat dan menyokong kesimpulan menggunakan bilangan klip atau jarak tarikan yang direkod, bukan berdasarkan rupa magnet.`,`jadual keputusan murid`,'Evidence Talk')
        ]
      },
      diffSupport:'Murid membandingkan dua magnet dengan jadual bergambar dan bantuan mengira klip.',
      diffCore:'Murid menjalankan ujian adil, merekod bilangan klip dan menyusun magnet mengikut kekuatan.',
      diffChallenge:'Murid mengulangi ujian, mengawal pemboleh ubah dan menambah perbandingan jarak sebelum membuat kesimpulan berbukti.',
      diffSupportAct:'Murid menguji dua magnet dengan bimbingan, mengira klip menggunakan sokongan visual dan memilih magnet lebih kuat berdasarkan nombor.',
      diffCoreAct:'Murid membandingkan magnet dalam keadaan ujian yang sama, merekod bilangan klip dan menentukan magnet lebih kuat berdasarkan data.',
      diffChallengeAct:'Murid mengulangi ujian untuk menyemak ketekalan, menguji kesan jarak secara terkawal dan menerangkan kesimpulan menggunakan data.',
      pbdEvidence:{method:'Pemerhatian penyiasatan + semakan jadual data + penerangan lisan',evidence:'Ramalan, bilangan klip kertas bagi setiap magnet, susunan kekuatan magnet dan alasan berdasarkan data.',criterion:'Murid menjalankan perbandingan secara adil, merekod keputusan dengan betul dan menentukan magnet lebih kuat berdasarkan bilangan klip atau jarak tarikan.'},
      penutup:'Murid melengkapkan ayat: “Magnet ___ lebih kuat kerana dapat menarik ___ klip kertas.” Guru meminta dua murid menunjukkan data yang menyokong jawapan dan menegaskan bahawa kekuatan magnet mesti ditentukan melalui penyiasatan yang adil.'
    };
  }

  const previousEffective=window.effectiveRphLessonMap;
  if(typeof previousEffective==='function')window.effectiveRphLessonMap=function(map,ev,built){
    const out=previousEffective(map,ev,built)||map;
    if(!isMagnetStrength(out,built?.activities||[]))return out;
    const p=pair(out);
    return {...out,objective:p.objective,success_criteria:p.criteria,_runtime_science_source_blueprint:'magnet_strength'};
  };

  const previousPedagogy=window.buildSourceAwarePedagogy;
  if(typeof previousPedagogy==='function')window.buildSourceAwarePedagogy=function(map,activities,btRef,uiEn,classId=null){
    const base=previousPedagogy(map,activities,btRef,uiEn,classId);
    if(uiEn||!isMagnetStrength(map,activities))return base;
    return {...base,...blueprint(map,btRef)};
  };

  window.__RPH_SCIENCE_MAGNET_BLUEPRINT__={version:'2026-09-04a'};
  console.info('RPH Science magnet-strength blueprint active.');
})();
