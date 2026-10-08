(function(){
  'use strict';

  const subjectKey=m=>{try{return typeof window.rphSubjectKey==='function'?window.rphSubjectKey(m?.subject_id):''}catch{return''}};
  const year=m=>Number(m?.year||0)||0;
  const week=m=>Number(m?.week_no||0)||0;
  const session=m=>Number(m?.session_no||0)||0;
  const page=m=>Number(m?.textbook_page_start||0)||0;
  const mainSp=m=>String(m?.source_evidence?.meta?.main_sp||String(m?.sp||'').split(',')[0]||'').trim();
  const step=(key,name,text,bbm,pak21)=>({key,name,text,bbm,pak21,phase:'source'});
  const cloneSteps=a=>(a||[]).map(x=>({...x}));

  function variantKey(m){
    if(subjectKey(m)!=='bm'||year(m)!==1)return'';
    const route=`${mainSp(m)}@${page(m)}`;
    if(week(m)===30&&session(m)===1&&route==='1.2.2@109')return'review-sprinkler';
    if(week(m)===30&&session(m)===2&&route==='3.2.1@111')return'review-smart-bookmark';
    if(week(m)===36&&session(m)===5&&route==='5.3.1@146')return'assessment-family-restaurant';
    return'';
  }

  function applyVariant(map,ped){
    const key=variantKey(map);if(!key||!ped)return ped;
    const out={
      ...ped,
      sourceSteps:cloneSteps(ped.sourceSteps),
      classroomFlow:cloneSteps(ped.classroomFlow||ped.sourceSteps),
      librarySteps:{
        support:cloneSteps(ped.librarySteps?.support),
        core:cloneSteps(ped.librarySteps?.core),
        challenge:cloneSteps(ped.librarySteps?.challenge)
      },
      pbdEvidence:{...(ped.pbdEvidence||{})},
      inductionData:{...(ped.inductionData||{})}
    };

    if(key==='review-sprinkler'){
      out.inductionData={name:'Imbas Semula Sumber',text:'Guru memaparkan tiga gambar langkah penyiram dalam susunan bercampur. Murid mengingat semula urutan tanpa melihat jawapan terlebih dahulu.',bbm:'Buku Teks m/s 109; kad gambar bercampur',pak21:'Recall–Pair–Check'};
      out.setInduksi=out.inductionData.text;
      out.librarySteps.support=[
        step('bm1-w30s1-s1','Pilih Urutan Betul','Murid memilih urutan langkah yang betul daripada dua pilihan, kemudian menggunakan kata bantu “mula-mula”, “kemudian” dan “akhir sekali” untuk menerangkan semula.','Buku Teks m/s 109; dua set kad urutan','Guided Recall'),
        step('bm1-w30s1-s2','Padan Keistimewaan','Murid memadankan sekurang-kurangnya dua keistimewaan penyiram dengan gambar atau cara alat itu berfungsi.','kad keistimewaan; gambar sumber','Matching')
      ];
      out.librarySteps.core=[
        step('bm1-w30s1-c1','Susun Tanpa Rangka','Pasangan menyusun gambar langkah tanpa rangka ayat, kemudian menerangkan urutan penggunaan penyiram dengan bahasa sendiri.','Buku Teks m/s 109; kad gambar','Pair Recall'),
        step('bm1-w30s1-c2','Semak Silang Halaman','Pasangan membuka semula Buku Teks m/s 109, membandingkan penerangan dengan sumber dan membetulkan maklumat yang tertinggal.','Buku Teks m/s 109; senarai semak','Peer Check')
      ];
      out.librarySteps.challenge=[
        step('bm1-w30s1-h1','Penerangan 30 Saat','Murid menerangkan cara dan keistimewaan penyiram secara individu tanpa kad ayat dalam masa kira-kira 30 saat.','Buku Teks m/s 109','Independent Speaking'),
        step('bm1-w30s1-h2','Soal Balas Inovasi','Rakan bertanya satu soalan “mengapa” tentang keistimewaan alat dan murid menjawab menggunakan bukti daripada halaman sumber.','Buku Teks m/s 109','Question–Answer')
      ];
      out.pbdEvidence={method:'Pentaksiran lisan individu semasa ulang kaji',evidence:'Penerangan individu tentang sekurang-kurangnya tiga maklumat urutan/cara dan dua keistimewaan penyiram berdasarkan gambar.',criterion:ped.pbdEvidence?.criterion||map.success_criteria||''};
      out.penutup='Exit ticket: setiap murid menyebut satu langkah dan satu keistimewaan penyiram yang belum disebut oleh rakan sebelumnya.';
    }

    if(key==='review-smart-bookmark'){
      out.inductionData={name:'Imbas Jadual Pantas',text:'Guru menunjukkan satu hari pada jadual Buku Teks m/s 111 selama beberapa saat. Murid menyebut buku yang perlu dibawa, kemudian menyemak semula pada sumber.',bbm:'Buku Teks m/s 111; kad hari',pak21:'Quick Recall'};
      out.setInduksi=out.inductionData.text;
      out.librarySteps.support=[
        step('bm1-w30s2-s1','Padan Hari–Buku Semula','Murid memadankan kad hari dengan mata pelajaran menggunakan pilihan terhad, kemudian membaca pasangan jawapan dengan kuat.','Buku Teks m/s 111; kad hari; kad mata pelajaran','Guided Matching'),
        step('bm1-w30s2-s2','Baiki Ayat','Murid menerima dua ayat yang salah padanan hari/buku dan membetulkannya berdasarkan jadual sumber.','kad ayat; jadual sumber','Error Correction')
      ];
      out.librarySteps.core=[
        step('bm1-w30s2-c1','Bina Ayat Tanpa Rangka','Murid memilih tiga hari pada jadual dan menulis tiga ayat lengkap tanpa menggunakan rangka ayat.','Buku Teks m/s 111; lembaran tulisan','Independent Writing'),
        step('bm1-w30s2-c2','Semak Fakta Jadual','Pasangan bertukar ayat dan menyemak padanan hari, mata pelajaran, huruf besar dan noktah terus dengan Buku Teks.','Buku Teks m/s 111; senarai semak','Peer Review')
      ];
      out.librarySteps.challenge=[
        step('bm1-w30s2-h1','Tukar Hari, Kekalkan Struktur','Murid menukar hari dalam satu ayat lalu menyesuaikan mata pelajaran supaya ayat kekal benar berdasarkan jadual.','Buku Teks m/s 111','Transfer'),
        step('bm1-w30s2-h2','Jelaskan Kegunaan Penanda','Murid menulis satu ayat tambahan yang menerangkan bagaimana penanda buku pintar membantu Kalang mengurus buku mengikut jadual.','Buku Teks m/s 111','Reasoning Writing')
      ];
      out.pbdEvidence={method:'Semakan tulisan individu',evidence:'Tiga ayat lengkap yang sepadan dengan jadual Buku Teks m/s 111 dan menggunakan huruf besar serta noktah dengan betul.',criterion:ped.pbdEvidence?.criterion||map.success_criteria||''};
      out.penutup='Murid membaca satu ayat ulang kaji; rakan menyatakan sama ada fakta hari dan buku sepadan dengan jadual.';
    }

    if(key==='assessment-family-restaurant'){
      out.inductionData={name:'Semak Pantas Ayat Penyata',text:'Guru memaparkan dua ayat tentang situasi restoran. Murid memilih ayat yang benar-benar membuat pernyataan dan memberikan satu sebab.',bbm:'Buku Teks m/s 146; dua kad ayat',pak21:'Think–Vote–Explain'};
      out.setInduksi=out.inductionData.text;
      out.sourceSteps=[
        step('bm1-w36s5-src1','Teliti Gambar Pentaksiran','Murid meneliti semula gambar dan frasa pada Buku Teks m/s 146 serta mengenal pasti sekurang-kurangnya tiga maklumat yang boleh dijadikan ayat penyata.','Buku Teks m/s 146','Observe'),
        step('bm1-w36s5-src2','Hasilkan Ayat Individu','Setiap murid membina tiga ayat penyata secara individu berdasarkan gambar/frasa tanpa menyalin ayat rakan.','Buku Teks m/s 146; lembaran individu','Individual Task'),
        step('bm1-w36s5-src3','Semak Kriteria','Murid menyemak setiap ayat menggunakan tiga kriteria: membuat pernyataan, sepadan dengan gambar, dan menggunakan huruf besar serta noktah.','senarai semak individu','Self Check')
      ];
      out.classroomFlow=cloneSteps(out.sourceSteps);
      out.librarySteps.support=[
        step('bm1-w36s5-s1','Pentaksiran dengan Pilihan Frasa','Murid memilih tiga frasa daripada set yang disediakan dan membina satu ayat penyata bagi setiap frasa dengan bimbingan minimum.','Buku Teks m/s 146; kad frasa','Scaffolded Assessment')
      ];
      out.librarySteps.core=[
        step('bm1-w36s5-c1','Pentaksiran Tiga Ayat','Murid membina tiga ayat penyata secara individu terus daripada gambar dan frasa sumber.','Buku Teks m/s 146; lembaran individu','Individual Assessment')
      ];
      out.librarySteps.challenge=[
        step('bm1-w36s5-h1','Pentaksiran Ayat Diperkaya','Murid membina tiga ayat penyata dan memperkaya sekurang-kurangnya satu ayat dengan maklumat tambahan yang masih selaras dengan gambar.','Buku Teks m/s 146; lembaran individu','Extension Assessment')
      ];
      out.pbdEvidence={method:'Pentaksiran individu berasaskan hasil tulisan',evidence:'Tiga ayat penyata individu berdasarkan Buku Teks m/s 146; guru merekod ketepatan jenis ayat, kesepadanan maklumat dan tanda baca.',criterion:ped.pbdEvidence?.criterion||map.success_criteria||''};
      out.penutup='Refleksi individu: murid menandakan satu ayat terbaik mereka dan menyatakan satu perkara yang telah dibaiki daripada latihan sebelumnya.';
    }

    out.diffSupportAct=out.librarySteps.support.map(x=>x.text).join(' ');
    out.diffCoreAct=out.librarySteps.core.map(x=>x.text).join(' ');
    out.diffChallengeAct=out.librarySteps.challenge.map(x=>x.text).join(' ');
    out._bmExactSessionVariant=key;
    return out;
  }

  const originalEffective=window.effectiveRphLessonMap;
  if(typeof originalEffective==='function')window.effectiveRphLessonMap=function(map,ev,built){
    const out=originalEffective(map,ev,built)||map;
    const key=variantKey(out);
    return key?{...out,_runtime_bm_session_variant:key}:out;
  };

  const originalPedagogy=window.buildSourceAwarePedagogy;
  if(typeof originalPedagogy==='function')window.buildSourceAwarePedagogy=function(map,activities,btRef,uiEn,classId){
    return applyVariant(map,originalPedagogy(map,activities,btRef,uiEn,classId));
  };

  window.bmYear1ExactSessionVariantKey=variantKey;
  window.bmYear1ApplyExactSessionVariant=applyVariant;
})();
