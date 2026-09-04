(function(){
  'use strict';

  const subjectKey=m=>{try{return window.rphSubjectKey?.(m?.subject_id)||''}catch{return''}};
  const mainSp=m=>String(m?.source_evidence?.meta?.main_sp||String(m?.sp||'').split(',')[0]||'').trim();
  const year=m=>Number(m?.year||0)||0;
  const week=m=>Number(m?.week_no||m?.week||0)||0;
  const session=m=>Number(m?.session_no||m?.session||0)||0;
  const page=m=>Number(m?.textbook_page_start||0)||0;
  const pageLabel=m=>page(m)?`Buku Teks m/s ${page(m)}`:'Buku Teks';
  const step=(key,name,text,bbm,pak21)=>({key,name,text,bbm,pak21,phase:'source'});

  const ROUTES={
    '1.1.1@2|W2|S1':'ceria_explore',
    '1.1.1@2|W2|S2':'ceria_apply',
    '2.1.1@4|W2|S3':'read_ingredients',
    '3.1.1@5|W2|S4':'write_recipe_explore',
    '3.1.1@5|W2|S5':'write_recipe_apply'
  };

  function mode(m){
    if(subjectKey(m)!=='bm'||year(m)!==2)return'';
    return ROUTES[`${mainSp(m)}@${page(m)}|W${week(m)}|S${session(m)}`]||'';
  }

  const C={
    ceria_explore:{
      objective:p=>`Pada akhir PdP, murid dapat mendengar, mengecam dan menyebut frasa daripada situasi Ceria Pagi pada ${p} dengan sebutan yang betul dan tepat.`,
      criteria:'Murid mengecam frasa yang disebut guru, memadankannya dengan gambar yang betul dan menyebut semula frasa tersebut dengan jelas.',
      induction:'Guru menunjukkan gambar suasana pagi keluarga pada halaman sumber. Murid menyebut perkara yang mereka nampak sebelum guru memperkenalkan frasa utama.',
      support:[
        step('bm2-2-s1-a','Dengar dan Tunjuk','Guru menyebut satu frasa pada satu masa seperti “memesin rumput”, “pagar batu”, “atap genting” dan “pokok bunga”. Murid menunjuk gambar atau kad yang sepadan.','Buku Teks m/s 2–3; kad gambar; kad frasa','Listen and Point'),
        step('bm2-2-s1-b','Sebut Ikut Rentak','Murid mengulang frasa secara panggil-balas dengan guru sambil menepuk satu rentak bagi setiap frasa. Fokus pada sebutan yang jelas, bukan kelajuan.','kad frasa','Echo Reading')
      ],
      core:[
        step('bm2-2-s1-c','Detektif Frasa','Secara berpasangan, seorang murid mengambil kad frasa dan membacanya perlahan; pasangan memilih gambar yang sepadan berdasarkan Buku Teks. Mereka bertukar peranan sehingga semua frasa sumber digunakan.','Buku Teks m/s 2–3; kad frasa; kad gambar','Pair Check'),
        step('bm2-2-s1-d','Dengar–Pilih–Sebut','Guru menyebut frasa tanpa menunjukkan kad. Kumpulan memilih kad gambar yang betul dan seorang wakil menyebut semula frasa dengan sebutan tepat untuk mendapatkan mata.','kad gambar; kad frasa','Game-Based Learning')
      ],
      challenge:[
        step('bm2-2-s1-e','Frasa dalam Ayat Lisan','Murid memilih satu frasa sumber dan menggunakannya dalam satu ayat lisan mudah berdasarkan gambar.','Buku Teks m/s 2–3','Independent Speaking'),
        step('bm2-2-s1-f','Pembetul Sebutan','Murid mendengar sebutan rakan, mengenal pasti satu bahagian yang kurang jelas jika ada, kemudian mengulang frasa dengan sebutan yang lebih tepat.','kad semak sebutan','Peer Feedback')
      ],
      close:'Guru menyebut empat frasa sumber secara rawak. Murid menunjukkan gambar yang sepadan dan menyebut semula frasa tersebut.',
      bbm:['Buku Teks m/s 2–3','kad frasa','kad gambar Ceria Pagi']
    },
    ceria_apply:{
      objective:p=>`Pada akhir PdP, murid dapat menggunakan kemahiran mendengar, mengecam dan menyebut frasa daripada ${p} dalam latihan pengukuhan tanpa mengulang langkah sesi pertama.`,
      criteria:'Murid memilih frasa yang sesuai berdasarkan rangsangan, menyebutnya dengan tepat dan menyiapkan latihan pengukuhan BA1 m/s 1 sebagai evidens aplikasi.',
      induction:'Guru memaparkan semula dua gambar Ceria Pagi secara pantas. Murid menyebut frasa yang masih diingati tanpa bantuan kad perkataan.',
      support:[
        step('bm2-2-s2-a','Jejak Frasa','Murid menerima pilihan dua frasa bagi setiap gambar dan memilih frasa yang tepat sebelum menyebutnya kepada pasangan.','Buku Teks m/s 2–3; kad pilihan frasa','Guided Recall'),
        step('bm2-2-s2-b','BA dengan Bimbingan','Selepas semakan lisan, murid melaksanakan item pengukuhan yang berkaitan pada BA1 m/s 1 dengan bantuan kad frasa jika perlu.','BA1 m/s 1; kad frasa','Guided Practice')
      ],
      core:[
        step('bm2-2-s2-c','Cabaran Ingatan Gambar','Guru menunjukkan gambar tanpa teks. Pasangan menyatakan frasa yang sesuai, kemudian menyemak jawapan dengan Buku Teks sebelum meneruskan ke BA1 m/s 1.','Buku Teks m/s 2–3; BA1 m/s 1','Think-Pair-Check'),
        step('bm2-2-s2-d','Pasangan Semak Sebutan','Pasangan bertukar jawapan BA dan meminta rakan menyebut frasa yang dipilih. Mereka menanda dua perkara: frasa tepat dan sebutan jelas.','BA1 m/s 1; senarai semak','Peer Assessment')
      ],
      challenge:[
        step('bm2-2-s2-e','Frasa Baharu daripada Gambar','Murid mencari satu lagi frasa yang sesuai daripada gambar sumber dan menyebutnya dalam konteks yang betul tanpa menukar isi halaman.','Buku Teks m/s 2–3','Source Extension'),
        step('bm2-2-s2-f','Terangkan Pilihan','Murid menerangkan mengapa frasa yang dipilih sepadan dengan gambar menggunakan satu ayat mudah.','Buku Teks m/s 2–3','Reasoning Talk')
      ],
      close:'Murid menyebut satu frasa yang paling mereka ingat dan menunjukkan bahagian gambar yang membuktikan pilihan tersebut.',
      bbm:['Buku Teks m/s 2–3','BA1 m/s 1','kad frasa','senarai semak']
    },
    read_ingredients:{
      objective:p=>`Pada akhir PdP, murid dapat membaca perkataan dan ayat dalam petikan “Membeli Bahan Kek” pada ${p} dengan sebutan yang betul dan intonasi yang sesuai.`,
      criteria:'Murid membaca perkataan penting dalam petikan, membaca ayat lengkap tanpa mengubah perkataan sumber dan menggunakan intonasi yang sesuai pada akhir ayat.',
      induction:'Guru menunjukkan kad telur, mentega, gula, esen vanila dan tepung gandum. Murid menamakan bahan yang dikenal sebelum membuka halaman sumber.',
      support:[
        step('bm2-4-s1','Baca Perkataan Bertanda','Guru membimbing murid membaca perkataan sumber seperti “telur”, “mentega”, “gula”, “esen vanila”, “tepung gandum”, “troli” dan “kaunter” secara latih tubi bermakna.','Buku Teks m/s 4; kad perkataan','Guided Reading'),
        step('bm2-4-s2','Potong Ayat kepada Frasa','Ayat daripada petikan dipaparkan dalam jalur frasa. Murid membaca setiap bahagian, kemudian mencantumkan semula dan membaca ayat penuh.','jalur ayat daripada Buku Teks m/s 4','Sentence Strip')
      ],
      core:[
        step('bm2-4-c1','Baca Bergilir Petikan','Dalam kumpulan kecil, murid membaca petikan secara bergilir. Rakan menjejak teks dengan jari dan membantu jika terdapat perkataan yang tersangkut.','Buku Teks m/s 4','Cooperative Reading'),
        step('bm2-4-c2','Cari Perkataan dalam Cerita','Guru menyebut satu perkataan sumber; kumpulan mencari perkataan itu dalam petikan, membaca ayat yang mengandunginya dan menerangkan secara ringkas apa yang berlaku dalam ayat tersebut.','Buku Teks m/s 4; kad perkataan','Text Hunt')
      ],
      challenge:[
        step('bm2-4-h1','Baca dengan Intonasi','Murid membaca keseluruhan petikan secara lebih kendiri sambil memberi jeda pada tanda baca dan mengekalkan intonasi ayat penyata.','Buku Teks m/s 4','Independent Reading'),
        step('bm2-4-h2','Susun Urutan Petikan','Murid menyusun tiga kad peristiwa: mencari bahan → memasukkan barang ke troli → membuat bayaran, kemudian membaca ayat sumber yang menyokong urutan.','kad peristiwa; Buku Teks m/s 4','Sequencing')
      ],
      close:'Seorang murid membaca satu ayat pilihan. Rakan menyatakan satu perkataan utama daripada ayat tersebut dan maksudnya dalam konteks.',
      bbm:['Buku Teks m/s 4','kad bahan kek','kad perkataan','jalur ayat','BA1 m/s 2–3']
    },
    write_recipe_explore:{
      objective:p=>`Pada akhir PdP, murid dapat menulis perkataan dan ayat daripada bahan “Kek Hari Lahir” pada ${p} secara mekanis dengan bentuk tulisan yang kemas dan mudah dibaca.`,
      criteria:'Murid menyalin perkataan dan ayat sumber dengan ejaan yang sama seperti bahan, jarak antara perkataan yang sesuai dan tulisan yang kemas.',
      induction:'Guru menunjukkan tajuk “Kek Mentega Istimewa” serta bahagian “Bahan-bahan” dan “Cara membuat”. Murid mengenal pasti bahagian yang mengandungi perkataan dan ayat untuk ditulis.',
      support:[
        step('bm2-5-s1','Jejak dan Salin Perkataan','Murid menjejak bentuk beberapa perkataan sumber pada kad contoh, kemudian menyalinnya ke buku dengan jarak huruf yang jelas.','Buku Teks m/s 5; kad contoh tulisan','Guided Handwriting'),
        step('bm2-5-s2','Salin Ayat Berpetak','Murid menyalin satu ayat sumber menggunakan garis panduan atau petak tulisan, kemudian menyemak ejaan dengan model asal.','Buku Teks m/s 5; lembaran garis panduan','Self-Check')
      ],
      core:[
        step('bm2-5-c1','Pilih–Baca–Tulis','Murid memilih perkataan dan ayat daripada halaman, membacanya dahulu, kemudian menyalinnya ke buku latihan dengan tulisan kemas.','Buku Teks m/s 5; buku latihan','Read-Write'),
        step('bm2-5-c2','Semak Tiga Perkara','Pasangan menyemak hasil menggunakan tiga kriteria: ejaan sama seperti sumber, jarak perkataan sesuai dan tulisan boleh dibaca. Murid membaiki bahagian yang ditandakan.','hasil tulisan; senarai semak','Peer Review')
      ],
      challenge:[
        step('bm2-5-h1','Salin Ayat Tanpa Putus','Murid menyalin ayat penuh secara kendiri dengan mengekalkan tanda baca dan bentuk huruf yang konsisten.','Buku Teks m/s 5','Independent Writing'),
        step('bm2-5-h2','Editor Mekanis','Murid membandingkan tulisannya dengan sumber dan membulatkan sendiri satu huruf, jarak atau tanda baca yang perlu diperbaiki sebelum menulis semula.','Buku Teks m/s 5; pensel','Self-Editing')
      ],
      close:'Murid memilih satu perkataan yang paling kemas ditulis dan menerangkan kriteria yang menjadikannya kemas.',
      bbm:['Buku Teks m/s 5','buku latihan','kad contoh tulisan','senarai semak','BA1 m/s 4–5']
    },
    write_recipe_apply:{
      objective:p=>`Pada akhir PdP, murid dapat mengaplikasikan kemahiran menulis mekanis daripada ${p} dalam latihan susulan dengan ejaan, jarak perkataan dan tulisan yang kemas.`,
      criteria:'Murid menyiapkan latihan susulan BA1 m/s 4–5 dan membaiki sekurang-kurangnya satu aspek tulisan berdasarkan semakan kendiri atau rakan.',
      induction:'Guru memaparkan dua contoh tulisan perkataan yang sama, satu kemas dan satu sukar dibaca. Murid menyatakan ciri tulisan yang lebih mudah dibaca.',
      support:[
        step('bm2-5a-s1','Semak Model Sebelum Tulis','Sebelum menjawab BA, murid merujuk semula satu contoh perkataan dan satu contoh ayat pada Buku Teks sebagai model ejaan serta bentuk tulisan.','Buku Teks m/s 5; BA1 m/s 4–5','Guided Practice'),
        step('bm2-5a-s2','Bimbingan Satu Baris','Guru membimbing satu baris pertama bersama murid; murid meneruskan latihan susulan secara kendiri dengan kad semak ringkas.','BA1 m/s 4–5; kad semak','Scaffolded Writing')
      ],
      core:[
        step('bm2-5a-c1','Latihan BA Berasaskan Model','Murid melaksanakan latihan BA1 m/s 4–5 sebagai aplikasi, menggunakan Buku Teks m/s 5 hanya untuk menyemak ejaan atau bentuk perkataan apabila perlu.','BA1 m/s 4–5; Buku Teks m/s 5','Independent Practice'),
        step('bm2-5a-c2','Galeri Tulisan Kemas','Pasangan memilih satu baris terbaik daripada hasil masing-masing, menerangkan sebab pilihan berdasarkan ejaan, jarak dan kekemasan, kemudian memperbaiki satu baris yang kurang kemas.','hasil tulisan; senarai semak','Gallery Check')
      ],
      challenge:[
        step('bm2-5a-h1','Salin dengan Ketepatan Penuh','Murid menyalin satu ayat tambahan daripada sumber secara kendiri dan menyemak tanda baca serta jarak tanpa bantuan guru.','Buku Teks m/s 5','Independent Accuracy'),
        step('bm2-5a-h2','Mentor Tulisan','Murid membantu rakan menyemak satu aspek sahaja—ejaan, jarak atau bentuk huruf—tanpa menulis jawapan untuk rakan.','kad semak','Peer Coaching')
      ],
      close:'Murid menunjukkan satu pembaikan yang dibuat pada tulisan sendiri dan menyatakan aspek yang diperbaiki.',
      bbm:['Buku Teks m/s 5','BA1 m/s 4–5','senarai semak tulisan','buku latihan']
    }
  };

  function objectivePair(m){
    const c=C[mode(m)];
    if(!c)return null;
    return {objective:c.objective(pageLabel(m)),criteria:c.criteria};
  }

  function blueprint(m){
    const md=mode(m),c=C[md];
    if(!c)return null;
    const p=pageLabel(m),pair=objectivePair(m);
    return {
      method:'Aktiviti source-first BM Tahun 2 berdasarkan RPT + DSKP + Buku Teks',
      pakDetail:`Isi PdP datang daripada tugasan sebenar pada ${p}. Bagi sesi pengukuhan, BA digunakan sebagai evidens aplikasi tanpa mengulangi langkah sesi penerokaan. Activity Library hanya memvariasikan cara pelaksanaan.`,
      anchor:`${m.title||md} — ${p}`,
      kind:'source_task',
      bbmList:c.bbm,
      groupBbm:{support:c.bbm.join('; '),core:c.bbm.join('; '),challenge:c.bbm.join('; ')},
      mainSp:mainSp(m),page:p,topic:m.title||md,
      setInduksi:c.induction,
      inductionData:{name:'Set Induksi Sumber',text:c.induction,bbm:p,pak21:'Think-Pair-Share'},
      librarySteps:{support:c.support,core:c.core,challenge:c.challenge},
      diffSupport:'Tugasan sumber yang sama dengan kad petunjuk, model tulisan atau pilihan terhad.',
      diffCore:'Melaksanakan tugasan sebenar Buku Teks dan latihan pengukuhan yang dirujuk oleh RPT.',
      diffChallenge:'Melaksanakan tugasan yang sama secara lebih kendiri serta menerangkan bukti, urutan atau pembaikan.',
      diffSupportAct:c.support.map(x=>x.text).join(' '),
      diffCoreAct:c.core.map(x=>x.text).join(' '),
      diffChallengeAct:c.challenge.map(x=>x.text).join(' '),
      pbdEvidence:{method:'Pemerhatian + hasil lisan/bacaan/tulisan sumber',evidence:'Prestasi murid boleh disemak terus dengan tugasan Buku Teks dan, bagi sesi aplikasi, latihan BA yang dirujuk RPT.',criterion:pair.criteria},
      penutup:c.close,
      _runtime_bm_year2_source_blueprint:true,
      _runtime_bm_year2_source_mode:md
    };
  }

  const originalEffective=window.effectiveRphLessonMap;
  if(typeof originalEffective==='function')window.effectiveRphLessonMap=function(map,...args){
    const out=originalEffective.call(this,map,...args);
    const pair=objectivePair(out);
    if(!pair)return out;
    return {...out,objective:pair.objective,success_criteria:pair.criteria,_runtime_bm_year2_source_blueprint:true,_runtime_bm_year2_source_mode:mode(out)};
  };

  const originalPedagogy=window.buildSourceAwarePedagogy;
  if(typeof originalPedagogy==='function')window.buildSourceAwarePedagogy=function(map,ev,built){
    const out=blueprint(map);
    return out||originalPedagogy(map,ev,built);
  };

  window.bmYear2Unit1SourceBlueprintMode=mode;
  window.bmYear2Unit1SourceBlueprint=blueprint;
})();