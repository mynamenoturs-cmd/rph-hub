(function(){
  'use strict';
  const subjectKey=m=>{try{return window.rphSubjectKey?.(m?.subject_id)||''}catch{return''}};
  const mainSp=m=>String(m?.source_evidence?.meta?.main_sp||String(m?.sp||'').split(',')[0]||'').trim();
  const year=m=>Number(m?.year||0)||0;
  const page=m=>Number(m?.textbook_page_start||0)||0;
  const pageLabel=m=>page(m)?`Buku Teks m/s ${page(m)}`:'Buku Teks';
  const step=(key,name,text,bbm,pak21)=>({key,name,text,bbm,pak21,phase:'source'});

  function mode(m){
    if(subjectKey(m)!=='bm'||year(m)!==1)return'';
    return ({
      '1.2.1@103':'electronic_dictionary',
      '2.3.1@104':'machines_help',
      '3.2.1@106':'automatic_gate',
      '4.2.1@107':'technology_pantun',
      '5.3.1@108':'solar_exclamation'
    })[`${mainSp(m)}@${page(m)}`]||'';
  }

  const C={
    electronic_dictionary:{
      objective:p=>`Pada akhir PdP, murid dapat bertutur tentang sekurang-kurangnya tiga kelebihan kamus elektronik berdasarkan gambar dan maklumat pada ${p} dengan sebutan yang jelas dan intonasi yang sesuai.`,
      criteria:'Murid menyatakan sekurang-kurangnya tiga kelebihan kamus elektronik dengan bahasa yang sopan, sebutan jelas dan maklumat yang tepat daripada sumber.',
      induction:'Guru menunjukkan gambar kamus bercetak dan kamus elektronik. Murid menyatakan satu perbezaan yang dapat dilihat sebelum guru membuka Buku Teks m/s 103.',
      support:[
        step('bm1-103-s1','Pilih Kelebihan','Murid memilih tiga kad maklumat seperti capaian pantas, ringan atau mempunyai ayat contoh dan memadankannya dengan gambar kamus elektronik.','Buku Teks m/s 103; kad kelebihan','Matching'),
        step('bm1-103-s2','Cakap Ikut Rangka','Murid menggunakan rangka “Kamus elektronik ini __ kerana __.” untuk menerangkan satu kelebihan kepada pasangan.','kad rangka ayat','Guided Speaking')
      ],
      core:[
        step('bm1-103-c1','Detektif Maklumat','Secara berpasangan, murid meneliti maklumat bernombor dan berhuruf pada Buku Teks m/s 103 lalu memilih sekurang-kurangnya tiga kelebihan yang hendak diterangkan.','Buku Teks m/s 103','Pair Reading'),
        step('bm1-103-c2','Jurucakap Teknologi','Murid menerangkan kelebihan kamus elektronik kepada pasangan dengan sebutan dan intonasi yang sesuai; pasangan menyemak sama ada maklumat itu benar-benar terdapat pada halaman sumber.','Buku Teks m/s 103; kad semak','Think-Pair-Share')
      ],
      challenge:[
        step('bm1-103-h1','Pilih Kelebihan Terbaik','Murid memilih satu kelebihan yang paling membantu pengguna dan memberikan sebab berdasarkan maklumat sumber.','Buku Teks m/s 103','Reasoning Talk'),
        step('bm1-103-h2','Banding Secara Lisan','Murid membuat satu perbandingan ringkas antara kamus elektronik dengan kamus bercetak tanpa menambah fakta yang tidak terdapat dalam bahan atau pengalaman kelas.','gambar dua jenis kamus','Oral Comparison')
      ],
      close:'Murid menyebut satu kelebihan kamus elektronik dan satu sebab kelebihan itu berguna.',
      bbm:['Buku Teks m/s 103','kad kelebihan','kad rangka ayat']
    },
    machines_help:{
      objective:p=>`Pada akhir PdP, murid dapat membaca dan mengenal pasti kandungan cerita tentang sekurang-kurangnya tiga peralatan elektrik pada ${p} dengan betul.`,
      criteria:'Murid melengkapkan grafik peralatan–kegunaan–keistimewaan bagi sekurang-kurangnya tiga peralatan menggunakan maklumat yang tepat daripada teks.',
      induction:'Guru menunjukkan gambar mesin basuh, pembersih vakum, pengisar elektrik dan seterika. Murid meneka kegunaan setiap peralatan sebelum membaca teks.',
      support:[
        step('bm1-104-s1','Baca Ikut Watak','Guru membimbing murid membaca satu perenggan bagi setiap peralatan dan menandakan perkataan yang menerangkan kegunaannya.','Buku Teks m/s 104-105; kad kata kunci','Guided Reading'),
        step('bm1-104-s2','Isi Grafik Berpandu','Murid memilih jawapan daripada kad kegunaan dan keistimewaan untuk melengkapkan grafik peralatan–kegunaan–keistimewaan.','lembaran grafik; kad jawapan','Graphic Organizer')
      ],
      core:[
        step('bm1-104-c1','Buru Maklumat Peralatan','Pasangan membaca teks m/s 104-105 dan mencari tiga perkara bagi setiap peralatan: nama, kegunaan dan keistimewaan.','Buku Teks m/s 104-105; penanda teks','Pair Reading'),
        step('bm1-104-c2','Pindah ke Grafik','Murid memindahkan maklumat yang ditemui ke dalam jadual atau peta grafik, kemudian menyemak setiap isi dengan ayat dalam teks.','lembaran grafik','Information Transfer')
      ],
      challenge:[
        step('bm1-104-h1','Banding Dua Peralatan','Murid memilih dua peralatan dan menerangkan persamaan atau perbezaan kegunaannya berdasarkan teks.','Buku Teks m/s 104-105','Compare and Contrast'),
        step('bm1-104-h2','Bukti Teks','Murid menunjukkan ayat dalam teks yang menyokong satu maklumat pada grafik dan menerangkan hubungannya.','Buku Teks m/s 104-105','Evidence Talk')
      ],
      close:'Murid menamakan satu peralatan dan menyatakan kegunaan serta satu keistimewaannya.',
      bbm:['Buku Teks m/s 104-105','lembaran grafik','kad peralatan']
    },
    automatic_gate:{
      objective:p=>`Pada akhir PdP, murid dapat membina dan menulis sekurang-kurangnya tiga ayat berdasarkan gambar dan frasa pada ${p} dengan betul.`,
      criteria:'Murid menulis sekurang-kurangnya tiga ayat yang sepadan dengan gambar/frasa tentang pintu pagar automatik serta menggunakan huruf besar dan tanda baca dengan betul.',
      induction:'Guru menunjukkan situasi hujan dan gambar pintu pagar. Murid mencadangkan satu cara teknologi boleh memudahkan keluarga membuka pagar.',
      support:[
        step('bm1-106-s1','Padan Gambar–Frasa','Murid memadankan gambar dengan frasa “pasang pintu pagar automatik”, “guna alat kawalan jauh”, “buka secara automatik” dan “tutup secara automatik”.','Buku Teks m/s 106; kad frasa','Matching'),
        step('bm1-106-s2','Lengkapkan Ayat','Murid melengkapkan rangka ayat berdasarkan satu gambar dan satu frasa sebelum menyalin ayat lengkap.','rangka ayat; kad frasa','Guided Writing')
      ],
      core:[
        step('bm1-106-c1','Dari Frasa ke Ayat','Murid memilih tiga frasa sumber dan membina satu ayat lengkap bagi setiap frasa berdasarkan gambar serta cerita pada halaman.','Buku Teks m/s 106','Think-Write'),
        step('bm1-106-c2','Editor Pagar Automatik','Pasangan menyemak sama ada ayat benar-benar sepadan dengan gambar/frasa, kemudian menyemak huruf besar, susunan perkataan dan tanda noktah.','hasil tulisan; senarai semak','Peer Review')
      ],
      challenge:[
        step('bm1-106-h1','Ayat Tanpa Rangka','Murid membina tiga ayat lengkap tanpa rangka ayat dan memastikan setiap ayat membawa maklumat yang berbeza daripada halaman.','Buku Teks m/s 106','Independent Writing'),
        step('bm1-106-h2','Ayat Sebab','Murid menambah satu ayat yang menerangkan mengapa pintu pagar automatik memudahkan kerja berdasarkan situasi dalam teks.','Buku Teks m/s 106','Reasoning Writing')
      ],
      close:'Murid membaca satu ayat dan rakan menunjukkan gambar atau frasa yang menyokong ayat tersebut.',
      bbm:['Buku Teks m/s 106','kad gambar/frasa','senarai semak']
    },
    technology_pantun:{
      objective:p=>`Pada akhir PdP, murid dapat melengkapkan pantun empat kerat secara terkawal dan melafazkannya dengan sebutan serta intonasi yang betul berdasarkan ${p}.`,
      criteria:'Murid melengkapkan sekurang-kurangnya dua bahagian pantun menggunakan pilihan yang sesuai dan melafazkan sekurang-kurangnya satu rangkap dengan intonasi yang betul.',
      induction:'Guru membaca satu rangkap pantun daripada halaman dengan intonasi yang jelas. Murid mengenal pasti baris pembayang dan baris maksud secara berpandu.',
      support:[
        step('bm1-107-s1','Pilih Baris Sesuai','Murid memilih baris daripada dua pilihan untuk melengkapkan ruang kosong pantun berdasarkan maksud dan rima yang paling sesuai.','Buku Teks m/s 107; kad pilihan baris','Guided Completion'),
        step('bm1-107-s2','Lafaz Ikut Guru','Murid melafazkan satu rangkap secara panggil-balas dengan bimbingan sebutan, jeda dan intonasi.','Buku Teks m/s 107','Echo Recitation')
      ],
      core:[
        step('bm1-107-c1','Bengkel Lengkap Pantun','Pasangan melengkapkan baris yang kosong secara terkawal dengan merujuk konteks kebaikan teknologi dan pola pantun empat kerat pada halaman.','Buku Teks m/s 107; kad kata/frasa','Pair Composition'),
        step('bm1-107-c2','Pentasan Pantun','Pasangan melafazkan pantun yang telah lengkap. Rakan menyemak dua aspek: sebutan jelas dan intonasi sesuai.','kad semak persembahan','Peer Performance')
      ],
      challenge:[
        step('bm1-107-h1','Cipta Baris Berpandu','Murid menghasilkan satu baris alternatif yang masih sesuai dengan maksud teknologi dan pola pantun secara terkawal.','Buku Teks m/s 107; bank kata','Creative Writing'),
        step('bm1-107-h2','Nyatakan Kebaikan','Murid menyatakan satu kebaikan sains atau teknologi yang disampaikan melalui pantun dan menunjukkan rangkap yang menjadi bukti.','Buku Teks m/s 107','Evidence Talk')
      ],
      close:'Murid melafazkan satu rangkap dan menyebut satu kebaikan teknologi daripada pantun.',
      bbm:['Buku Teks m/s 107','kad pilihan baris','bank kata','kad semak']
    },
    solar_exclamation:{
      objective:p=>`Pada akhir PdP, murid dapat mengenal pasti dan membina sekurang-kurangnya tiga ayat seruan berdasarkan gambar pada ${p} menggunakan kata seru yang sesuai.`,
      criteria:'Murid memilih kata seru yang sesuai dengan perasaan/konteks dan membina sekurang-kurangnya tiga ayat seruan dengan tanda seru yang betul.',
      induction:'Guru menunjukkan gambar basikal solar dan memberikan dua reaksi dengan nada berbeza. Murid mengenal pasti perasaan seperti kagum, terkejut atau hairan.',
      support:[
        step('bm1-108-s1','Padan Kata Seru','Murid memadankan kata seru “wah”, “eh”, “oh” dan “amboi” dengan kad situasi atau perasaan berpandukan contoh pada halaman.','Buku Teks m/s 108; kad kata seru; kad situasi','Matching'),
        step('bm1-108-s2','Lengkapkan Ayat Seruan','Murid memilih kata seru dan melengkapkan rangka ayat berdasarkan gambar basikal atau kereta solar.','rangka ayat; gambar sumber','Guided Grammar')
      ],
      core:[
        step('bm1-108-c1','Jejak Ayat Seruan','Murid membaca dialog pada Buku Teks m/s 108 dan menandakan kata seru serta tanda seru yang digunakan dalam contoh.','Buku Teks m/s 108; penanda teks','Grammar Discovery'),
        step('bm1-108-c2','Roda Kata Seru','Guru menunjukkan gambar atau situasi; murid memilih kata seru yang sesuai dan membina ayat seruan. Mata hanya diberi jika kata seru, konteks dan tanda seru semuanya tepat.','kad gambar; kad kata seru','Game-Based Learning')
      ],
      challenge:[
        step('bm1-108-h1','Ubah Perasaan, Ubah Ayat','Murid membina dua ayat seruan berbeza bagi gambar yang sama dengan menukar kata seru dan perasaan yang hendak dilahirkan.','Buku Teks m/s 108','Grammar Reasoning'),
        step('bm1-108-h2','Semak Rakan','Murid menilai satu ayat rakan dan menerangkan sama ada kata seru yang dipilih sesuai dengan konteks.','kad semak','Peer Reasoning')
      ],
      close:'Murid menghasilkan satu ayat seruan lisan berdasarkan gambar dan menyatakan kata seru yang digunakan.',
      bbm:['Buku Teks m/s 108','kad kata seru','kad gambar/situasi']
    }
  };

  function objectivePair(m){const c=C[mode(m)];return c?{objective:c.objective(pageLabel(m)),criteria:c.criteria}:null;}
  function blueprint(m){
    const md=mode(m),c=C[md];if(!c)return null;const p=pageLabel(m),pair=objectivePair(m);
    return {
      method:'Aktiviti source-first berdasarkan RPT + DSKP + Buku Teks',
      pakDetail:`Isi aktiviti datang daripada tugasan sebenar pada ${p}; Activity Library hanya memvariasikan cara pelaksanaan tanpa mengganti tugasan sumber.`,
      anchor:`${m.title||md} — ${p}`,kind:'source_task',bbmList:c.bbm,
      groupBbm:{support:c.bbm.join('; '),core:c.bbm.join('; '),challenge:c.bbm.join('; ')},
      mainSp:mainSp(m),page:p,topic:m.title||md,setInduksi:c.induction,
      inductionData:{name:'Set Induksi Sumber',text:c.induction,bbm:p,pak21:'Think-Pair-Share'},
      librarySteps:{support:c.support,core:c.core,challenge:c.challenge},
      diffSupport:'Tugasan halaman yang sama dengan kad petunjuk, rangka atau pilihan terhad.',
      diffCore:'Melaksanakan tugasan Buku Teks sebenar dan menyemak hasil dengan bukti halaman.',
      diffChallenge:'Melaksanakan tugasan yang sama secara lebih kendiri serta menerangkan alasan atau bukti.',
      diffSupportAct:c.support.map(x=>x.text).join(' '),diffCoreAct:c.core.map(x=>x.text).join(' '),diffChallengeAct:c.challenge.map(x=>x.text).join(' '),
      pbdEvidence:{method:'Pemerhatian + hasil tugasan sumber + penerangan murid',evidence:'Respons lisan, grafik, tulisan atau persembahan yang boleh disemak terus dengan halaman Buku Teks.',criterion:pair.criteria},
      penutup:c.close
    };
  }

  const originalEffective=window.effectiveRphLessonMap;
  if(typeof originalEffective==='function')window.effectiveRphLessonMap=function(map,ev,built){
    const out=originalEffective(map,ev,built)||map,pair=objectivePair(out);if(!pair)return out;
    return {...out,objective:pair.objective,success_criteria:pair.criteria,_runtime_bm_unit17_source_blueprint:true,_runtime_bm_unit17_mode:mode(out)};
  };
  const originalPedagogy=window.buildSourceAwarePedagogy;
  if(typeof originalPedagogy==='function')window.buildSourceAwarePedagogy=function(map,ev,built){const out=blueprint(map);return out||originalPedagogy(map,ev,built);};
  window.bmYear1Unit17BlueprintMode=mode;
  window.bmYear1Unit17Blueprint=blueprint;
})();
