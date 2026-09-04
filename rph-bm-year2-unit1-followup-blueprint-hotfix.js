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

  function mode(m){
    if(subjectKey(m)!=='bm'||year(m)!==2||mainSp(m)!=='5.1.1'||page(m)!==6||week(m)!==3)return'';
    return session(m)===1?'common_noun_explore':session(m)===2?'common_noun_apply':'';
  }

  const C={
    common_noun_explore:{
      objective:p=>`Pada akhir PdP, murid dapat mengenal pasti kata nama am dalam gambar “Kejutan untuk Ibu” pada ${p} dan menggunakannya untuk membina ayat yang sesuai.`,
      criteria:'Murid mengelaskan kata nama am kepada benda, manusia, tempat atau haiwan dan membina ayat yang menggunakan kata nama am mengikut konteks gambar.',
      induction:'Guru menunjukkan gambar kejutan hari lahir dan meminta murid menamakan benda, manusia, tempat atau haiwan yang dapat dilihat.',
      support:[
        step('bm2-6-s1','Empat Bakul Kata','Murid memadankan kad kata daripada gambar ke empat bakul kategori: benda, manusia, tempat dan haiwan.','Buku Teks m/s 6; kad kata; kad kategori','Card Sort'),
        step('bm2-6-s2','Ayat Ikut Rangka','Murid memilih satu kad kata nama am dan melengkapkan rangka ayat mudah berdasarkan gambar.','kad kata; rangka ayat','Guided Grammar')
      ],
      core:[
        step('bm2-6-c1','Cari Kata Nama Am','Secara berpasangan, murid meneliti gambar dan teks “Kejutan untuk Ibu”, menyenaraikan kata nama am yang ditemui, kemudian mengelaskan setiap kata kepada benda, manusia, tempat atau haiwan.','Buku Teks m/s 6; lembaran empat kategori','Pair Classification'),
        step('bm2-6-c2','Bina Ayat daripada Gambar','Setiap murid memilih beberapa kata nama am daripada senarai dan membina ayat yang benar-benar sepadan dengan situasi gambar. Pasangan menyemak sama ada kata yang digunakan ialah kata nama am.','Buku Teks m/s 6; lembaran ayat','Think-Write-Pair')
      ],
      challenge:[
        step('bm2-6-h1','Buktikan Kategori','Murid memilih satu kata bagi setiap kategori yang dapat dikenal pasti pada bahan dan menerangkan mengapa kata itu termasuk dalam kategori tersebut.','Buku Teks m/s 6','Reasoning Talk'),
        step('bm2-6-h2','Ayat Lebih Lengkap','Murid membina ayat lebih lengkap menggunakan dua kata nama am daripada konteks gambar tanpa menukar situasi sumber.','Buku Teks m/s 6','Independent Writing')
      ],
      close:'Guru menyebut satu kata daripada halaman. Murid mengangkat kad benda, manusia, tempat atau haiwan dan memberikan satu ayat lisan.',
      bbm:['Buku Teks m/s 6','kad kategori kata nama am','kad kata','lembaran ayat']
    },
    common_noun_apply:{
      objective:p=>`Pada akhir PdP, murid dapat mengaplikasikan penggunaan kata nama am daripada ${p} dalam latihan susulan BA1 m/s 6–8 dengan tepat.`,
      criteria:'Murid mengenal pasti kata nama am dalam latihan susulan, memilih kategori yang sesuai dan menggunakannya dalam ayat berdasarkan konteks.',
      induction:'Guru memaparkan empat kad kategori tanpa contoh. Murid memberi satu contoh kata nama am bagi setiap kategori berdasarkan pelajaran sebelumnya.',
      support:[
        step('bm2-6a-s1','Kad Bantuan Kategori','Murid menggunakan kad ikon benda, manusia, tempat dan haiwan semasa melaksanakan latihan BA1 m/s 6–8.','BA1 m/s 6–8; kad kategori','Guided Practice'),
        step('bm2-6a-s2','Semak dengan Halaman Sumber','Jika murid keliru, mereka merujuk semula definisi dan contoh pada Buku Teks m/s 6 sebelum memilih jawapan.','Buku Teks m/s 6; BA1 m/s 6–8','Source Check')
      ],
      core:[
        step('bm2-6a-c1','BA sebagai Evidens','Murid menyiapkan latihan BA1 m/s 6–8 secara kendiri sebagai aplikasi kemahiran kata nama am, bukan mengulang aktiviti pengelasan sesi pertama.','BA1 m/s 6–8','Independent Practice'),
        step('bm2-6a-c2','Semak dan Jelaskan','Pasangan menyemak dua jawapan pilihan dan menerangkan kategori kata nama am yang digunakan sebelum membuat pembetulan jika perlu.','BA1 m/s 6–8; kad kategori','Peer Check')
      ],
      challenge:[
        step('bm2-6a-h1','Tukar Konteks, Kekal Kata','Murid memilih satu kata nama am daripada latihan dan membina satu ayat baharu yang masih menggunakan kata itu dengan betul.','BA1 m/s 6–8','Transfer Practice'),
        step('bm2-6a-h2','Cari Bukan Kata Nama Am','Murid memilih satu perkataan daripada ayat latihan yang bukan kata nama am dan menerangkan perbezaannya daripada kata nama am yang dikenal pasti.','BA1 m/s 6–8','Compare and Explain')
      ],
      close:'Murid melengkapkan lisan: “Kata nama am ialah nama umum bagi ___, ___, ___ atau ___.”',
      bbm:['Buku Teks m/s 6','BA1 m/s 6–8','kad kategori','senarai semak']
    }
  };

  function pair(m){const c=C[mode(m)];return c?{objective:c.objective(pageLabel(m)),criteria:c.criteria}:null;}
  function blueprint(m){
    const md=mode(m),c=C[md];if(!c)return null;
    const p=pageLabel(m),q=pair(m);
    return {
      method:'Aktiviti source-first BM Tahun 2 berdasarkan RPT + DSKP + Buku Teks',
      pakDetail:`Tugasan kata nama am datang terus daripada gambar dan aktiviti pada ${p}; sesi kedua menggunakan BA sebagai aplikasi supaya aktiviti tidak berulang.`,
      anchor:`${m.title||'Kejutan untuk Ibu'} — ${p}`,
      kind:'source_task',bbmList:c.bbm,groupBbm:{support:c.bbm.join('; '),core:c.bbm.join('; '),challenge:c.bbm.join('; ')},
      mainSp:mainSp(m),page:p,topic:m.title||'Kejutan untuk Ibu',setInduksi:c.induction,
      inductionData:{name:'Set Induksi Sumber',text:c.induction,bbm:p,pak21:'Think-Pair-Share'},
      librarySteps:{support:c.support,core:c.core,challenge:c.challenge},
      diffSupport:'Menggunakan kad kategori, ikon dan rangka ayat untuk tugasan sumber yang sama.',
      diffCore:'Mengenal pasti dan menggunakan kata nama am berdasarkan gambar atau latihan sumber.',
      diffChallenge:'Mengelaskan, memberikan alasan dan memindahkan penggunaan kata nama am ke ayat baharu.',
      diffSupportAct:c.support.map(x=>x.text).join(' '),diffCoreAct:c.core.map(x=>x.text).join(' '),diffChallengeAct:c.challenge.map(x=>x.text).join(' '),
      pbdEvidence:{method:'Pemerhatian + pengelasan + ayat murid',evidence:'Jawapan boleh disemak dengan kategori kata nama am dan konteks gambar/BA.',criterion:q.criteria},
      penutup:c.close,_runtime_bm_year2_source_blueprint:true,_runtime_bm_year2_source_mode:md
    };
  }

  const originalEffective=window.effectiveRphLessonMap;
  if(typeof originalEffective==='function')window.effectiveRphLessonMap=function(map,...args){
    const out=originalEffective.call(this,map,...args),q=pair(out);if(!q)return out;
    return {...out,objective:q.objective,success_criteria:q.criteria,_runtime_bm_year2_source_blueprint:true,_runtime_bm_year2_source_mode:mode(out)};
  };
  const originalPedagogy=window.buildSourceAwarePedagogy;
  if(typeof originalPedagogy==='function')window.buildSourceAwarePedagogy=function(map,ev,built){const out=blueprint(map);return out||originalPedagogy(map,ev,built);};

  window.bmYear2Unit1FollowupSourceBlueprintMode=mode;
  window.bmYear2Unit1FollowupSourceBlueprint=blueprint;
})();