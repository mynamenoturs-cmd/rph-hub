(function(){
  'use strict';

  const subjectKey=m=>{try{return typeof window.rphSubjectKey==='function'?window.rphSubjectKey(m?.subject_id):''}catch{return''}};
  const mainSp=m=>String(m?.source_evidence?.meta?.main_sp||String(m?.sp||'').split(',')[0]||'').trim();
  const year=m=>Number(m?.year||0)||0;
  const page=m=>Number(m?.textbook_page_start||0)||0;
  const pageLabel=m=>page(m)?`Buku Teks m/s ${page(m)}`:'Buku Teks';
  const step=(key,name,text,bbm,pak21)=>({key,name,text,bbm,pak21,phase:'source'});

  function mode(m){
    if(subjectKey(m)!=='bm'||year(m)!==1)return'';
    const k=`${mainSp(m)}@${page(m)}`;
    return ({
      '1.2.2@109':'sprinkler',
      '2.3.1@110':'trailer_pantun',
      '3.2.1@111':'smart_bookmark',
      '4.2.2@112':'toothbrush_song',
      '5.3.2@113':'single_sentence',
      '5.3.2@114':'compound_sentence'
    })[k]||'';
  }

  const C={
    sprinkler:{
      objective:p=>`Pada akhir PdP, murid dapat menyampaikan sekurang-kurangnya tiga maklumat tentang cara dan keistimewaan penyiram pokok inovasi berdasarkan gambar pada ${p} dengan sebutan yang jelas.`,
      criteria:'Murid menyampaikan urutan cara membuat atau menggunakan penyiram serta sekurang-kurangnya dua keistimewaannya berdasarkan gambar sumber.',
      induction:'Guru menunjukkan gambar penyiram pokok inovasi dan sebuah botol contoh yang telah disediakan selamat oleh guru. Murid meneka cara alat itu membantu pokok mendapat air.',
      support:[
        step('bm1-109-s1','Susun Gambar Langkah','Dengan tiga kad gambar utama dan kata bantu “mula-mula”, “kemudian” dan “akhir sekali”, murid menyusun urutan penyediaan penyiram berdasarkan Buku Teks.','Buku Teks m/s 109; kad gambar; kad kata urutan','Sequencing'),
        step('bm1-109-s2','Cakap Ikut Rangka','Murid melengkapkan rangka lisan “Mula-mula… Kemudian… Akhir sekali…” dan memilih dua kad keistimewaan seperti menjimatkan air atau mudah digunakan.','kad rangka ayat; kad keistimewaan','Guided Speaking')
      ],
      core:[
        step('bm1-109-c1','Jejak Cara Penyiram','Secara berpasangan, murid meneliti gambar pada Buku Teks m/s 109 dan menyusun langkah penyediaan serta penggunaan penyiram. Botol yang memerlukan lubang telah disediakan lebih awal oleh guru; murid tidak menggunakan alat tajam.','Buku Teks m/s 109; botol contoh yang telah disediakan guru; kad urutan','Pair Sequencing'),
        step('bm1-109-c2','Jurucakap Inovasi','Setiap pasangan menerangkan urutan cara menggunakan penyiram dan memilih sekurang-kurangnya dua keistimewaan daripada halaman sumber untuk diterangkan kepada kelas.','Buku Teks m/s 109; kad keistimewaan','Think-Pair-Share')
      ],
      challenge:[
        step('bm1-109-h1','Terangkan Tanpa Kad','Murid menerangkan urutan penggunaan penyiram berdasarkan gambar tanpa kad ayat, kemudian menyemak semula urutan dengan Buku Teks.','Buku Teks m/s 109','Independent Speaking'),
        step('bm1-109-h2','Pilih Keistimewaan Terbaik','Murid memilih satu keistimewaan yang paling berguna dan memberikan sebab berdasarkan cara alat itu berfungsi.','Buku Teks m/s 109; kad alasan','Reasoning Talk')
      ],
      close:'Murid menyebut satu langkah penggunaan penyiram dan satu keistimewaan alat tersebut.',
      bbm:['Buku Teks m/s 109','kad urutan','botol contoh yang telah disediakan guru']
    },
    trailer_pantun:{
      objective:p=>`Pada akhir PdP, murid dapat menyatakan maksud sekurang-kurangnya tiga rangkap pantun berdasarkan gambar pada ${p} dengan betul.`,
      criteria:'Murid memadankan sekurang-kurangnya tiga rangkap dengan maksud yang sesuai dan menunjukkan gambar atau frasa yang menyokong sekurang-kurangnya satu jawapan.',
      induction:'Guru menunjukkan gambar treler motosikal pada halaman sumber dan bertanya kegunaannya. Murid memberikan idea sebelum mengaitkannya dengan pantun.',
      support:[
        step('bm1-110-s1','Baca Rangkap Berpandu','Guru membimbing murid membaca pantun rangkap demi rangkap sambil menandakan kata atau frasa penting yang berkaitan dengan gambar.','Buku Teks m/s 110; kad kata kunci','Guided Reading'),
        step('bm1-110-s2','Pilih Maksud','Murid memilih maksud yang sesuai daripada dua kad pilihan bagi setiap rangkap dan menunjukkan gambar yang membantu mereka membuat pilihan.','kad maksud; gambar sumber','Match and Share')
      ],
      core:[
        step('bm1-110-c1','Padan Rangkap–Gambar–Maksud','Secara berpasangan, murid memadankan nombor rangkap dengan gambar dan kad maksud yang sesuai berdasarkan Buku Teks m/s 110.','Buku Teks m/s 110; kad rangkap; kad gambar; kad maksud','Pair Matching'),
        step('bm1-110-c2','Detektif Maksud Pantun','Guru menunjukkan satu gambar atau maksud. Kumpulan mengangkat kad rangkap yang sepadan dan hanya mendapat mata apabila dapat memberikan sebab berdasarkan pantun atau gambar.','kad rangkap; kad gambar','Game-Based Learning')
      ],
      challenge:[
        step('bm1-110-h1','Tafsir dengan Kata Sendiri','Murid menyatakan maksud rangkap menggunakan ayat sendiri tanpa kad pilihan.','Buku Teks m/s 110','Independent Response'),
        step('bm1-110-h2','Buktikan Tafsiran','Murid memilih satu frasa pantun atau unsur gambar yang menyokong tafsiran dan menerangkan hubungannya kepada rakan.','Buku Teks m/s 110; kad bukti','Evidence Talk')
      ],
      close:'Seorang murid memilih satu rangkap, menyatakan maksudnya dan seorang rakan menunjukkan bukti daripada gambar atau pantun.',
      bbm:['Buku Teks m/s 110','kad rangkap','kad gambar','kad maksud']
    },
    smart_bookmark:{
      objective:p=>`Pada akhir PdP, murid dapat membina dan menulis sekurang-kurangnya tiga ayat berdasarkan jadual pada ${p} dengan betul.`,
      criteria:'Murid menulis sekurang-kurangnya tiga ayat yang sepadan dengan hari dan mata pelajaran dalam jadual serta menggunakan huruf besar dan tanda noktah dengan betul.',
      induction:'Guru menunjukkan sebuah beg sekolah dan kad jadual waktu. Murid memilih buku yang perlu dibawa bagi satu hari contoh.',
      support:[
        step('bm1-111-s1','Padan Hari dengan Buku','Murid memadankan kad hari dengan kad mata pelajaran berdasarkan jadual pada Buku Teks.','Buku Teks m/s 111; kad hari; kad mata pelajaran','Matching'),
        step('bm1-111-s2','Lengkapkan Rangka Ayat','Murid melengkapkan rangka “Pada hari __, Kalang membawa buku __.” sebelum menyalin ayat lengkap.','rangka ayat; jadual sumber','Guided Writing')
      ],
      core:[
        step('bm1-111-c1','Baca Jadual, Bina Ayat','Murid membaca jadual Isnin hingga Khamis dan membina ayat berdasarkan pasangan hari–mata pelajaran yang ditunjukkan.','Buku Teks m/s 111; jadual','Think-Write'),
        step('bm1-111-c2','Editor Jadual','Pasangan bertukar hasil dan menyemak sama ada hari serta mata pelajaran dalam ayat benar-benar sepadan dengan jadual, kemudian menyemak huruf besar dan noktah.','hasil tulisan; senarai semak','Peer Review')
      ],
      challenge:[
        step('bm1-111-h1','Ayat Lengkap Tanpa Rangka','Murid membina sekurang-kurangnya tiga ayat lengkap terus daripada jadual tanpa rangka ayat.','Buku Teks m/s 111','Independent Writing'),
        step('bm1-111-h2','Terangkan Pilihan Buku','Murid memilih satu hari dan menulis satu ayat tambahan yang menjelaskan mengapa penanda buku pintar membantu Kalang membawa buku yang betul.','Buku Teks m/s 111','Reasoning Writing')
      ],
      close:'Murid membaca satu ayat yang ditulis dan kelas menyemak padanannya dengan jadual.',
      bbm:['Buku Teks m/s 111','kad hari','kad mata pelajaran','senarai semak']
    },
    toothbrush_song:{
      objective:p=>`Pada akhir PdP, murid dapat menyanyikan lagu rakyat pada ${p} dengan sebutan yang jelas dan intonasi yang sesuai mengikut melodi sumber.`,
      criteria:'Murid menyanyikan sekurang-kurangnya satu bahagian lagu dengan sebutan perkataan yang jelas, tempo terkawal dan intonasi yang sesuai.',
      induction:'Guru menunjukkan gambar berus gigi inovasi dan meminta murid menyatakan ciri yang menjadikannya istimewa sebelum aktiviti nyanyian.',
      support:[
        step('bm1-112-s1','Sebut Sebelum Nyanyi','Guru membimbing murid menyebut frasa pendek daripada teks lagu secara berirama tanpa menyanyikan keseluruhan lagu. Murid meniru sebutan dan tekanan suara.','Buku Teks m/s 112','Echo Reading'),
        step('bm1-112-s2','Nyanyi Ikut Guru','Murid menyanyikan bahagian pendek secara panggil-balas mengikut melodi yang dinyatakan dalam Buku Teks.','Buku Teks m/s 112','Call and Response')
      ],
      core:[
        step('bm1-112-c1','Latihan Sebutan dan Irama','Dalam kumpulan kecil, murid menandakan perkataan yang perlu disebut jelas dan berlatih mengikut irama sumber sebelum persembahan.','Buku Teks m/s 112; kad tempo','Cooperative Rehearsal'),
        step('bm1-112-c2','Persembahan Kumpulan','Kumpulan menyanyikan lagu dengan sebutan dan intonasi yang sesuai. Rakan menggunakan dua kriteria mudah: “jelas” dan “ikut irama”.','Buku Teks m/s 112; kad semak','Peer Feedback')
      ],
      challenge:[
        step('bm1-112-h1','Pemimpin Irama','Murid mengetuai kumpulan mengekalkan tempo serta memberikan isyarat mula dan berhenti semasa latihan.','Buku Teks m/s 112','Student Leadership'),
        step('bm1-112-h2','Baiki Sebutan','Selepas persembahan, murid mengenal pasti satu perkataan atau frasa yang perlu diperjelas lalu membuat persembahan semula bahagian tersebut.','kad refleksi','Self-Improvement')
      ],
      close:'Murid menyatakan satu ciri nyanyian yang baik: sebutan jelas, intonasi sesuai atau tempo terkawal.',
      bbm:['Buku Teks m/s 112','kad tempo','kad semak persembahan']
    },
    single_sentence:{
      objective:p=>`Pada akhir PdP, murid dapat mengenal pasti dan membina sekurang-kurangnya tiga ayat tunggal berdasarkan gambar dan maklumat pada ${p} dengan betul.`,
      criteria:'Murid mengenal pasti ayat yang mempunyai satu subjek dan satu predikat serta membina sekurang-kurangnya tiga ayat tunggal yang sesuai dengan gambar.',
      induction:'Guru menunjukkan dua ayat pendek daripada konteks gambar perangkap nyamuk dan meminta murid mengenal siapa atau apa yang diceritakan serta perbuatannya.',
      support:[
        step('bm1-113-s1','Cari Siapa + Buat Apa','Murid menggunakan dua warna kad untuk memadankan subjek dengan predikat bagi ayat mudah berdasarkan gambar.','Buku Teks m/s 113; kad subjek; kad predikat','Sentence Building'),
        step('bm1-113-s2','Bina Satu Ayat','Murid memilih satu gambar urutan dan melengkapkan rangka ayat tunggal sebelum membaca ayat kepada pasangan.','kad gambar; rangka ayat','Guided Grammar')
      ],
      core:[
        step('bm1-113-c1','Bedah Ayat Tunggal','Murid membaca ayat contoh pada halaman dan menandakan bahagian subjek serta predikat. Aktiviti hanya menggunakan konteks gambar; murid tidak menghasilkan campuran perangkap nyamuk.','Buku Teks m/s 113; penanda dua warna','Grammar Discovery'),
        step('bm1-113-c2','Bina Ayat daripada Gambar','Murid memilih tiga gambar atau tindakan pada halaman dan membina tiga ayat tunggal yang mempunyai satu subjek dan satu predikat.','Buku Teks m/s 113; lembaran ayat','Think-Write-Pair')
      ],
      challenge:[
        step('bm1-113-h1','Uji Struktur Ayat','Murid membina ayat tunggal sendiri, kemudian menggariskan subjek sekali dan predikat dua kali untuk membuktikan strukturnya.','lembaran ayat','Grammar Reasoning'),
        step('bm1-113-h2','Baiki Ayat','Murid menerima satu ayat tidak lengkap dan membaikinya supaya mempunyai subjek serta predikat yang jelas.','kad pembetulan','Error Analysis')
      ],
      close:'Murid melengkapkan secara lisan: “Ayat tunggal mempunyai satu ___ dan satu ___.”',
      bbm:['Buku Teks m/s 113','kad subjek/predikat','kad gambar']
    },
    compound_sentence:{
      objective:p=>`Pada akhir PdP, murid dapat mengenal pasti dan membina sekurang-kurangnya tiga ayat majmuk berdasarkan gambar dan maklumat pada ${p} dengan betul.`,
      criteria:'Murid menggabungkan dua ayat tunggal atau lebih menggunakan kata hubung yang sesuai dan menghasilkan sekurang-kurangnya tiga ayat majmuk yang menepati konteks gambar.',
      induction:'Guru memaparkan dua ayat tunggal berkaitan dusun durian dan meminta murid mencari cara mencantumkannya menjadi satu ayat yang lebih lengkap.',
      support:[
        step('bm1-114-s1','Cantum Dua Ayat','Murid memadankan dua ayat tunggal dengan kad kata hubung seperti “dan”, “tetapi” atau “atau” berdasarkan contoh pada halaman.','Buku Teks m/s 114; kad ayat; kad kata hubung','Sentence Matching'),
        step('bm1-114-s2','Baca Ayat Cantuman','Murid membaca ayat majmuk yang telah dibina dan menyemak sama ada kedua-dua maklumat asal masih kekal.','kad ayat','Pair Check')
      ],
      core:[
        step('bm1-114-c1','Cari Ayat Majmuk dalam Teks','Murid meneliti petikan dan contoh pada Buku Teks m/s 114 untuk mengenal pasti ayat yang mengandungi dua maklumat yang dicantumkan.','Buku Teks m/s 114; penanda teks','Text Hunt'),
        step('bm1-114-c2','Bina Ayat Dusun Durian','Murid membina sekurang-kurangnya tiga ayat majmuk berdasarkan gambar atau maklumat tentang dusun, treler motosikal dan urusan membawa atau menjual buah.','Buku Teks m/s 114; kad kata hubung','Collaborative Writing')
      ],
      challenge:[
        step('bm1-114-h1','Pilih Kata Hubung Tepat','Murid membina ayat majmuk menggunakan sekurang-kurangnya dua kata hubung berbeza dan menerangkan mengapa kata hubung itu sesuai.','Buku Teks m/s 114; kad kata hubung','Grammar Reasoning'),
        step('bm1-114-h2','Pecah dan Cantum Semula','Murid memecahkan satu ayat majmuk kepada ayat tunggal, kemudian mencantumkannya semula menggunakan kata hubung yang sesuai tanpa mengubah makna utama.','lembaran ayat','Transform and Explain')
      ],
      close:'Murid menyatakan satu perbezaan antara ayat tunggal dan ayat majmuk serta memberikan satu kata hubung.',
      bbm:['Buku Teks m/s 114','kad ayat','kad kata hubung']
    }
  };

  function objectivePair(m){
    const c=C[mode(m)];if(!c)return null;
    return {objective:c.objective(pageLabel(m)),criteria:c.criteria};
  }

  function blueprint(m){
    const md=mode(m),c=C[md];if(!c)return null;
    const p=pageLabel(m),pair=objectivePair(m);
    const discrepancy=(md==='single_sentence'||md==='compound_sentence')
      ?'RPT/DSKP menggunakan SP 5.3.2, manakala kod SP tercetak pada Buku Teks m/s 113-114 ialah 5.3.3. Blueprint mengekalkan SP Lesson Map/RPT/DSKP dan menggunakan tugasan sebenar halaman sebagai kandungan aktiviti.'
      :'';
    return {
      method:'Aktiviti source-first berdasarkan RPT + DSKP + Buku Teks',
      pakDetail:`Isi aktiviti datang daripada tugasan sebenar pada ${p}; Activity Library hanya boleh memvariasikan cara pelaksanaan tanpa mengganti tugasan sumber.`,
      anchor:`${m.title||md} — ${p}`,
      kind:'source_task',
      bbmList:c.bbm,
      groupBbm:{support:c.bbm.join('; '),core:c.bbm.join('; '),challenge:c.bbm.join('; ')},
      mainSp:mainSp(m),page:p,topic:m.title||md,
      setInduksi:c.induction,
      inductionData:{name:'Set Induksi Sumber',text:c.induction,bbm:p,pak21:'Think-Pair-Share'},
      librarySteps:{support:c.support,core:c.core,challenge:c.challenge},
      diffSupport:'Tugasan halaman yang sama dengan kad petunjuk, rangka atau pilihan terhad.',
      diffCore:'Melaksanakan tugasan Buku Teks sebenar dan menyemak hasil dengan bukti halaman.',
      diffChallenge:'Melaksanakan tugasan yang sama secara lebih kendiri serta menerangkan alasan atau bukti.',
      diffSupportAct:c.support.map(x=>x.text).join(' '),
      diffCoreAct:c.core.map(x=>x.text).join(' '),
      diffChallengeAct:c.challenge.map(x=>x.text).join(' '),
      pbdEvidence:{method:'Pemerhatian + hasil tugasan sumber + penerangan murid',evidence:'Respons lisan/tulisan/persembahan yang boleh disemak terus dengan halaman Buku Teks.',criterion:pair.criteria},
      penutup:c.close,
      sourceDiscrepancy:discrepancy
    };
  }

  const originalEffective=window.effectiveRphLessonMap;
  if(typeof originalEffective==='function')window.effectiveRphLessonMap=function(map,ev,built){
    const out=originalEffective(map,ev,built)||map;
    const pair=objectivePair(out);if(!pair)return out;
    const md=mode(out),discrepancy=(md==='single_sentence'||md==='compound_sentence')?'BT m/s 113-114 memaparkan kod 5.3.3, sedangkan RPT/DSKP/Lesson Map menggunakan 5.3.2; kandungan aktiviti halaman tetap digunakan tanpa mengubah Lesson Map.':'';
    return {...out,objective:pair.objective,success_criteria:pair.criteria,_runtime_bm_source_blueprint:true,_runtime_bm_source_mode:md,_runtime_source_discrepancy:discrepancy};
  };

  const originalPedagogy=window.buildSourceAwarePedagogy;
  if(typeof originalPedagogy==='function')window.buildSourceAwarePedagogy=function(map,ev,built){
    const out=blueprint(map);return out||originalPedagogy(map,ev,built);
  };

  window.bmYear1SourceBlueprintMode=mode;
  window.bmYear1SourceBlueprint=blueprint;
})();