(function(){
  'use strict';

  const norm=v=>String(v||'').replace(/\s+/g,' ').replace(/\s+([,.;:!?])/g,'$1').trim();
  const subjectKey=map=>{try{return typeof window.rphSubjectKey==='function'?window.rphSubjectKey(map?.subject_id):''}catch{return ''}};
  const pageLabel=map=>Number(map?.textbook_page_start||0)?`Buku Teks m/s ${Number(map.textbook_page_start)}`:'Buku Teks';
  const mainSp=map=>String(map?.source_evidence?.meta?.main_sp||String(map?.sp||'').split(',')[0]||'').trim();
  const sourceText=(map,activities=[])=>norm([
    map?.title,
    map?.source_activities,
    map?.source_evidence?.textbook?.text,
    map?.source_evidence?.dskp?.text,
    map?.source_evidence?.rpt?.text,
    ...(activities||[])
  ].filter(Boolean).join(' '));
  const step=(name,text,bbm,pak21)=>({key:'source-task',name,text,bbm,pak21});

  function patternFor(map,activities=[]){
    const s=sourceText(map,activities).toLowerCase();
    const sp=mainSp(map);
    if(/konduktor|penebat/.test(s)&&/mentol|litar/.test(s)&&/^7\.1\.[56]$/.test(sp))return'conductor_insulator';
    if(/apakah yang dapat kamu perhatikan dalam gambar|lihat gambar\.?.*ceritakan|membuat pemerhatian/.test(s))return'observe_image';
    return'';
  }

  function objectivePair(map,pattern){
    const page=pageLabel(map);
    if(pattern==='conductor_insulator')return{
      objective:'Pada akhir PdP, murid dapat mengitlak bahawa objek yang membolehkan mentol menyala ialah konduktor dan objek yang tidak membolehkan mentol menyala ialah penebat berdasarkan hasil ujian sekurang-kurangnya empat objek.',
      criteria:'Murid dapat merekod keputusan ujian sekurang-kurangnya empat objek, mengelaskan objek kepada konduktor atau penebat dengan betul, dan menyatakan satu kesimpulan berdasarkan nyalaan mentol.'
    };
    if(pattern==='observe_image')return{
      objective:`Pada akhir PdP, murid dapat membuat pemerhatian berdasarkan gambar pada ${page} dan menyatakan sekurang-kurangnya dua perkara yang dapat diperhatikan dengan betul.`,
      criteria:`Murid dapat menyatakan sekurang-kurangnya dua pemerhatian yang dapat dikenal pasti terus daripada gambar pada ${page} tanpa menambah maklumat yang tiada pada sumber.`
    };
    return null;
  }

  function conductorBlueprint(map,btRef){
    const page=btRef||pageLabel(map);
    const baseBbm=`${page}; litar sel kering yang telah disediakan guru; mentol; wayar penyambung; klip kertas; pemadam; paku; duit syiling; pensil; kad K/P; jadual rekod`;
    return{
      method:'Inkuiri berpandu + Pair Check + Game-Based Learning',
      pakDetail:'Murid menjalankan penyiasatan sebenar menggunakan litar sel kering yang telah disediakan guru, merekod sama ada mentol menyala, kemudian menggunakan bukti itu untuk mengitlak konduktor dan penebat. Aktiviti permainan hanya mengukuhkan dapatan penyiasatan dan tidak menggantikan tugasan sumber.',
      anchor:`Uji objek yang dicadangkan dalam sumber dengan menggantikan suis dalam litar, rekod sama ada mentol menyala, kemudian tentukan objek yang merupakan konduktor atau penebat. (${page})`,
      kind:'investigation',
      bbmList:[page,'litar sel kering yang telah disediakan guru','mentol dan wayar penyambung','klip kertas, pemadam, paku, duit syiling dan pensil','kad K/P','jadual rekod'],
      groupBbm:{support:baseBbm,core:baseBbm,challenge:baseBbm},
      mainSp:mainSp(map),page,topic:map.title||'Konduktor dan Penebat',
      setInduksi:`Guru menunjukkan klip kertas dan pemadam seperti contoh pada ${page}. Murid meramal objek yang akan membolehkan mentol menyala apabila digunakan untuk melengkapkan litar. Guru mencatat ramalan tanpa memberi jawapan terlebih dahulu.`,
      inductionData:{name:'Ramalan Klip Kertas atau Pemadam?',text:`Guru menunjukkan klip kertas dan pemadam seperti contoh pada ${page}. Murid meramal objek yang akan membolehkan mentol menyala apabila digunakan untuk melengkapkan litar. Guru mencatat ramalan tanpa memberi jawapan terlebih dahulu.`,bbm:`${page}; klip kertas; pemadam; litar demonstrasi guru`,pak21:'Think-Pair-Share'},
      librarySteps:{
        support:[
          step('Ramalkan dan Kenal Objek',`Dengan bimbingan guru, murid menamakan tiga objek yang akan diuji dan menandakan ramalan “menyala” atau “tidak menyala” menggunakan simbol pada jadual.`,`${page}; kad gambar; jadual simbol`,'Bimbingan berstruktur'),
          step('Uji Satu Demi Satu',`Murid menggunakan litar sel kering yang telah disediakan guru untuk menguji satu objek pada satu masa. Selepas setiap ujian, murid menanda sama ada mentol menyala atau tidak.`,`litar sel kering guru; tiga objek terpilih; jadual rekod`,'Inkuiri berpandu'),
          step('Padan K atau P',`Murid memadankan objek yang telah diuji kepada kad KONDUKTOR atau PENEBAT. Pasangan menyemak padanan dengan merujuk keputusan nyalaan mentol, bukan tekaan.`,`kad K/P; objek yang diuji; jadual rekod`,'Pair Check')
        ],
        core:[
          step('Ramalan Sebelum Ujian',`Secara berkumpulan, murid membuat ramalan bagi klip kertas, pemadam, paku, duit syiling dan pensil sebelum penyiasatan dijalankan.`,`${page}; objek ujian; jadual ramalan`,'Think-Pair-Share'),
          step('Detektif Konduktor',`Murid menguji objek satu demi satu dalam litar sel kering yang telah disediakan guru dan merekod keputusan sebenar nyalaan mentol. Murid kemudian mengelaskan setiap objek kepada konduktor atau penebat berdasarkan bukti tersebut.`,`litar sel kering guru; mentol; wayar; objek ujian; jadual keputusan`,'Inkuiri berkumpulan'),
          step('Kad K–P',`Guru menunjukkan semula satu objek yang telah diuji. Setiap kumpulan mengangkat kad K atau P dan seorang wakil menerangkan keputusan dengan ayat “Objek ini ialah ___ kerana mentol ___ semasa diuji.”`,`kad K/P; objek ujian`,'Game-Based Learning')
        ],
        challenge:[
          step('Uji dan Jelaskan Bukti',`Murid melaksanakan ujian objek sumber secara kendiri dalam kumpulan kecil, merekod keputusan dan menerangkan hubungan antara nyalaan mentol dengan pengelasan konduktor atau penebat.`,`litar sel kering guru; objek ujian; jadual rekod`,'Evidence Talk'),
          step('Ramalan Objek Tambahan',`Selepas tugasan sumber selesai, murid mencadangkan satu objek kelas yang selamat untuk diuji dengan kelulusan guru, membuat ramalan terlebih dahulu, kemudian membandingkan ramalan dengan keputusan sebenar.`,`objek tambahan yang diluluskan guru; jadual ramalan dan keputusan`,'Predict-Observe-Explain'),
          step('Bina Kesimpulan',`Murid menulis atau menyatakan kesimpulan: objek yang membolehkan mentol menyala ialah konduktor, manakala objek yang tidak membolehkan mentol menyala ialah penebat, lalu menyokong kesimpulan dengan sekurang-kurangnya dua contoh daripada ujian.`,`jadual keputusan murid`,'Komunikasi saintifik')
        ]
      },
      diffSupport:'Murid menguji bilangan objek yang lebih kecil dengan simbol nyalaan dan kad kategori sebagai sokongan.',
      diffCore:'Murid menguji objek sumber, merekod keputusan dan mengelaskan berdasarkan bukti nyalaan mentol.',
      diffChallenge:'Murid menguji objek sumber, menerangkan bukti dan menjalankan satu ujian tambahan yang diluluskan guru sebelum membina kesimpulan.',
      diffSupportAct:'Murid menguji tiga objek dengan bimbingan, merekod nyalaan mentol menggunakan simbol dan memadankan objek kepada konduktor atau penebat.',
      diffCoreAct:'Murid menguji objek sumber satu demi satu, merekod keputusan sebenar dan mengelaskan objek kepada konduktor atau penebat berdasarkan nyalaan mentol.',
      diffChallengeAct:'Murid melaksanakan ujian sumber, menguji satu objek tambahan yang diluluskan guru dan menerangkan kesimpulan menggunakan bukti daripada keputusan ujian.',
      pbdEvidence:{method:'Pemerhatian semasa penyiasatan + semakan jadual rekod + penerangan lisan',evidence:'Jadual ramalan dan keputusan ujian, pengelasan K/P, serta penerangan murid berdasarkan nyalaan mentol.',criterion:'Murid merekod keputusan sekurang-kurangnya empat objek dengan betul, mengelaskan objek kepada konduktor atau penebat dan menyatakan kesimpulan berdasarkan bukti ujian.'},
      penutup:'Guru menunjukkan semula klip kertas dan pemadam. Murid melengkapkan ayat secara lisan: “Objek yang membolehkan mentol menyala ialah konduktor. Objek yang tidak membolehkan mentol menyala ialah penebat.” Dua orang murid memberikan satu contoh bagi setiap kategori berdasarkan keputusan kelas.'
    };
  }

  function observationBlueprint(map,btRef){
    const page=btRef||pageLabel(map),bbm=`${page}; gambar pada halaman; kad kata pemerhatian`;
    return{
      method:'Pemerhatian berpandu + Think-Pair-Share',
      pakDetail:'Murid memerhati gambar sebenar pada halaman sumber, menyatakan apa yang benar-benar dilihat dan membezakan pemerhatian daripada tekaan.',
      anchor:`Perhatikan gambar pada ${page} dan nyatakan perkara yang dapat dilihat berdasarkan bukti dalam gambar.`,
      kind:'observe',bbmList:[page,'gambar pada halaman','kad kata pemerhatian'],groupBbm:{support:bbm,core:bbm,challenge:bbm},mainSp:mainSp(map),page,topic:map.title||'Pemerhatian',
      setInduksi:`Guru memaparkan gambar pada ${page} selama beberapa saat tanpa penerangan. Murid menyebut satu perkara yang benar-benar dapat dilihat.`,
      inductionData:{name:'Apa yang Kamu Nampak?',text:`Guru memaparkan gambar pada ${page} selama beberapa saat tanpa penerangan. Murid menyebut satu perkara yang benar-benar dapat dilihat.`,bbm:page,pak21:'Think-Pair-Share'},
      librarySteps:{
        support:[step('Cari Dua Ciri',`Guru membimbing murid meneliti dua bahagian gambar. Murid memilih kad kata yang sepadan dengan perkara yang benar-benar dilihat.`,bbm,'Bimbingan visual'),step('Sebut Pemerhatian',`Murid melengkapkan rangka ayat “Saya nampak ___.” berdasarkan gambar dan berkongsi dengan pasangan.`,bbm,'Pair Share')],
        core:[step('Perhati dan Catat',`Murid meneliti gambar pada ${page} dan mencatat sekurang-kurangnya dua pemerhatian yang dapat dibuktikan terus daripada gambar.`,page,'Pemerhatian saintifik'),step('Semak Bukti',`Pasangan bertukar pemerhatian dan menunjuk bahagian gambar yang menjadi bukti bagi setiap pernyataan.`,page,'Pair Check')],
        challenge:[step('Pemerhatian Tepat',`Murid menghasilkan sekurang-kurangnya tiga pemerhatian menggunakan bahasa yang jelas dan khusus berdasarkan gambar.`,page,'Pembelajaran kendiri'),step('Bezakan Pemerhatian dan Inferens',`Murid memilih satu ayat yang merupakan pemerhatian dan satu ayat yang merupakan tekaan/inferens, kemudian menerangkan perbezaannya dengan merujuk gambar.`,page,'Pemikiran kritis')]
      },
      diffSupport:'Murid menggunakan kad kata dan rangka ayat untuk menyatakan dua pemerhatian.',diffCore:'Murid mencatat dua pemerhatian dan menunjukkan bukti pada gambar.',diffChallenge:'Murid menghasilkan pemerhatian lebih terperinci dan membezakan pemerhatian daripada inferens.',
      diffSupportAct:'Murid menggunakan kad kata untuk menyatakan dua perkara yang dapat dilihat pada gambar.',diffCoreAct:'Murid mencatat dua pemerhatian dan menunjukkan bukti terus pada gambar.',diffChallengeAct:'Murid menyatakan sekurang-kurangnya tiga pemerhatian dan membezakan pemerhatian daripada tekaan atau inferens.',
      pbdEvidence:{method:'Pemerhatian guru + respons lisan/bertulis',evidence:'Senarai pemerhatian murid dan bukti yang ditunjukkan pada gambar.',criterion:'Murid menyatakan sekurang-kurangnya dua pemerhatian yang dapat dikenal pasti terus daripada gambar.'},
      penutup:'Murid menyebut satu pemerhatian baharu menggunakan rangka “Saya perhatikan ___ kerana saya dapat melihat ___ pada gambar.” Guru menegaskan bahawa pemerhatian mesti berdasarkan apa yang dapat dilihat atau dikesan, bukan tekaan.'
    };
  }

  function blueprint(map,activities,btRef){
    const pattern=patternFor(map,activities);
    if(pattern==='conductor_insulator')return conductorBlueprint(map,btRef);
    if(pattern==='observe_image')return observationBlueprint(map,btRef);
    return null;
  }

  const previousEffective=window.effectiveRphLessonMap;
  if(typeof previousEffective==='function')window.effectiveRphLessonMap=function(map,ev,built){
    const out=previousEffective(map,ev,built)||map;
    if(subjectKey(out)!=='science')return out;
    const pattern=patternFor(out,built?.activities||[]),pair=objectivePair(out,pattern);
    if(!pair)return out;
    return {...out,objective:pair.objective,success_criteria:pair.criteria,_runtime_science_source_blueprint:pattern};
  };

  const previousPedagogy=window.buildSourceAwarePedagogy;
  if(typeof previousPedagogy==='function')window.buildSourceAwarePedagogy=function(map,activities,btRef,uiEn,classId=null){
    const base=previousPedagogy(map,activities,btRef,uiEn,classId);
    if(subjectKey(map)!=='science'||uiEn)return base;
    const sourceBlueprint=blueprint(map,activities,btRef);
    if(!sourceBlueprint)return base;
    return {...base,...sourceBlueprint,_sourceBlueprint:true,_sourceBlueprintVersion:'2026-09-04a'};
  };

  window.__RPH_SCIENCE_SOURCE_BLUEPRINT__={version:'2026-09-04a',patterns:['conductor_insulator','observe_image']};
  console.info('RPH Science source blueprint active.');
})();
