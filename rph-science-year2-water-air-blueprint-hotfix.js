(function(){
  'use strict';

  const subjectKey=m=>{try{return typeof window.rphSubjectKey==='function'?window.rphSubjectKey(m?.subject_id):''}catch{return ''}};
  const sp=m=>String(m?.source_evidence?.meta?.main_sp||String(m?.sp||'').split(',')[0]||'').trim();
  const year=m=>Number(m?.year||0)||0;
  const pg=m=>Number(m?.textbook_page_start||0)||0;
  const label=m=>pg(m)?`Buku Teks m/s ${pg(m)}`:'Buku Teks';
  const step=(key,name,text,bbm,pak21)=>({key,name,text,bbm,pak21,phase:'source'});

  function mode(m){
    if(subjectKey(m)!=='science'||year(m)!==2)return '';
    if(sp(m)==='9.1.1'&&(pg(m)===101||pg(m)===102))return 'water_sources';
    if(sp(m)==='9.1.2'&&(pg(m)===103||pg(m)===104))return 'water_flow';
    if(sp(m)==='9.1.3'&&(pg(m)===105||pg(m)===106))return 'natural_flow';
    if(sp(m)==='9.1.4'&&(pg(m)===107||pg(m)===108))return 'water_cycle';
    if(sp(m)==='9.1.5'&&(pg(m)===108||pg(m)===109))return 'water_cycle_explain';
    if(sp(m)==='9.2.3'&&pg(m)===113)return 'wind';
    if(sp(m)==='9.2.4'&&pg(m)===114)return 'wind_effect';
    return '';
  }

  function pair(m){
    const p=label(m);
    switch(mode(m)){
      case 'water_sources': return {
        objective:`Pada akhir PdP, murid dapat menyatakan sekurang-kurangnya empat daripada lima sumber air semula jadi iaitu hujan, sungai, tasik, laut dan mata air berpandukan ${p}.`,
        criteria:'Murid mengenal pasti sekurang-kurangnya empat sumber air semula jadi dengan betul dan memadankan setiap sumber dengan gambar atau situasi yang sesuai.'
      };
      case 'water_flow': return {
        objective:`Pada akhir PdP, murid dapat menentukan arah aliran air dari tempat tinggi ke tempat rendah melalui aktiviti dulang berpandukan ${p}.`,
        criteria:'Murid menjalankan aktiviti dengan satu hujung dulang ditinggikan, memerhati arah pergerakan air dan menyatakan bahawa air mengalir dari tempat tinggi ke tempat rendah.'
      };
      case 'natural_flow': return {
        objective:`Pada akhir PdP, murid dapat mengitlak arah aliran air secara semula jadi dengan memberikan sekurang-kurangnya dua contoh seperti sungai atau air terjun berdasarkan ${p}.`,
        criteria:'Murid mengenal pasti bahagian tinggi dan rendah pada sekurang-kurangnya dua contoh aliran air semula jadi dan menerangkan arah aliran dengan betul.'
      };
      case 'water_cycle': return {
        objective:`Pada akhir PdP, murid dapat menyusun sekurang-kurangnya empat peringkat kitar air semula jadi mengikut urutan yang betul berpandukan ${p}.`,
        criteria:'Murid menyusun urutan air dari sungai atau laut menjadi wap air, membentuk awan, menghasilkan hujan dan kembali mengalir ke sungai atau laut dengan betul.'
      };
      case 'water_cycle_explain': return {
        objective:`Pada akhir PdP, murid dapat menjelaskan kitar air semula jadi melalui lakaran atau penerangan lisan yang mengandungi sekurang-kurangnya empat peringkat berdasarkan ${p}.`,
        criteria:'Murid menghasilkan lakaran atau penerangan yang menunjukkan urutan wap air, awan, hujan dan aliran semula ke sungai atau laut serta menggunakan anak panah arah yang sesuai.'
      };
      case 'wind': return {
        objective:`Pada akhir PdP, murid dapat menunjukkan bahawa udara yang bergerak ialah angin melalui sekurang-kurangnya dua pemerhatian berpandukan ${p}.`,
        criteria:'Murid menghasilkan pergerakan udara, memerhati kesannya pada bahan ringan atau kincir dan menyatakan bahawa udara yang bergerak ialah angin berdasarkan pemerhatian.'
      };
      case 'wind_effect': return {
        objective:`Pada akhir PdP, murid dapat menjana sekurang-kurangnya tiga idea tentang kesan atau kegunaan udara yang bergerak dalam kehidupan manusia berdasarkan aktiviti pada ${p}.`,
        criteria:'Murid menghubungkaitkan udara bergerak dengan sekurang-kurangnya tiga contoh yang munasabah seperti kincir angin, kapal layar atau model roket angin dan menerangkan kesannya.'
      };
      default:return null;
    }
  }

  function sources(m,btRef){
    const p=btRef||label(m),common=`${p}; kad gambar hujan, sungai, tasik, laut dan mata air; kad label; peta buih`;
    const support=[
      step('source-y2-water-sources-s1','Cari Lima Sumber','Murid memadankan kad gambar dengan label hujan, sungai, tasik, laut dan mata air dengan bimbingan guru.',common,'Matching'),
      step('source-y2-water-sources-s2','Asingkan Semula Jadi','Murid memilih gambar yang menunjukkan sumber air semula jadi dan meletakkannya pada peta buih.','kad gambar; peta buih','Pair Check'),
      step('source-y2-water-sources-s3','Sebut dan Tunjuk','Murid menyebut nama sekurang-kurangnya empat sumber sambil menunjukkan kad gambar yang sepadan.','kad gambar; kad label','Show-and-Tell')
    ];
    const core=[
      step('source-y2-water-sources-c1','Gallery Sumber Air','Kumpulan memerhati lima gambar sumber air semula jadi dan menulis nama setiap sumber pada nota kecil.',common,'Gallery Walk'),
      step('source-y2-water-sources-c2','Padan Situasi','Kumpulan memadankan situasi ringkas seperti air turun dari langit atau air keluar dari celah batu dengan sumber yang betul.','kad situasi; kad sumber','Collaborative Matching'),
      step('source-y2-water-sources-c3','Peta Buih Lima Sumber','Murid membina peta buih yang mengandungi lima sumber air semula jadi dan menyemak dengan Buku Teks.','peta buih; kad sumber','Think-Pair-Share')
    ];
    const challenge=[
      step('source-y2-water-sources-h1','Bukti Persekitaran','Murid memberikan contoh tempatan bagi sekurang-kurangnya dua sumber air yang pernah dilihat dan menerangkan bagaimana mereka mengenal pasti sumber tersebut.','kad gambar; lembaran catatan','Evidence Talk'),
      step('source-y2-water-sources-h2','Bezakan Sumber dan Simpanan','Murid membandingkan gambar sumber air semula jadi dengan bekas simpanan air buatan manusia dan menerangkan perbezaannya.','kad gambar campuran','Compare-and-Contrast'),
      step('source-y2-water-sources-h3','Kuiz Lima Sumber','Pasangan saling memberi petunjuk tanpa menyebut nama sumber dan pasangan meneka sumber air yang dimaksudkan.','kad petunjuk','Quiz-Quiz-Trade')
    ];
    return pack(m,p,'Sumber Air Semula Jadi','Pemerhatian gambar + pengelasan + penerangan bukti',common,support,core,challenge,
      'Guru menunjukkan lima gambar air dan bertanya yang manakah datang daripada sumber semula jadi.',
      'Murid menyebut satu sumber air semula jadi dan satu ciri atau contoh yang membantu mereka mengenal pastinya.');
  }

  function flow(m,btRef,natural=false){
    const p=btRef||label(m),common=`${p}; dulang cetek; air; blok untuk meninggikan satu hujung; penitis; tuala kecil; kad TINGGI/RENDAH; anak panah arah`;
    const support=[
      step('source-y2-water-flow-s1','Tanda Tinggi dan Rendah','Murid meletakkan kad TINGGI pada hujung dulang yang ditinggikan dan kad RENDAH pada hujung yang satu lagi.',common,'Guided Discovery'),
      step('source-y2-water-flow-s2','Titis dan Perhati','Guru atau murid menitiskan sedikit air pada bahagian tinggi. Murid memerhati dan menunjuk arah pergerakan air dengan anak panah.','dulang; air; penitis; anak panah','Predict-Observe-Explain'),
      step('source-y2-water-flow-s3','Lengkapkan Kesimpulan','Murid melengkapkan ayat “Air mengalir dari tempat ___ ke tempat ___.”','rangka ayat; hasil pemerhatian','Pair Check')
    ];
    const core=[
      step('source-y2-water-flow-c1','Ramalkan Arah Air','Kumpulan menandakan arah ramalan pada gambar dulang sebelum air dititiskan.',common,'Predict-Observe-Explain'),
      step('source-y2-water-flow-c2','Uji Dulang Condong','Murid meninggikan satu hujung dulang, menitiskan air pada bahagian tinggi dan merekod arah aliran sebenar. Ujian diulang selepas hujung tinggi ditukar.','dulang; air; blok; jadual dua ujian','Hands-on Investigation'),
      step('source-y2-water-flow-c3','Sambung kepada Alam','Murid memadankan pemerhatian dulang dengan gambar sungai atau air terjun dan menunjukkan bahagian tinggi serta rendah.','gambar sungai/air terjun; hasil ujian','Connect-to-Context')
    ];
    const challenge=[
      step('source-y2-water-flow-h1','Ubah Cerun','Murid membandingkan dua kedudukan ketinggian dulang dan merekod sama ada arah aliran berubah.','dulang; dua blok ketinggian; jadual','Variable Check'),
      step('source-y2-water-flow-h2','Lakar Laluan Air','Murid melakar dulang dari sisi, melabel tinggi/rendah dan menambah anak panah arah aliran.','kertas lakaran; pensel','Draw-and-Label'),
      step('source-y2-water-flow-h3','Jelaskan Pola Alam','Murid menggunakan bukti dulang untuk menerangkan mengapa air sungai dan air terjun bergerak ke kawasan yang lebih rendah.','hasil ujian; gambar media','Evidence Talk')
    ];
    return pack(m,p,natural?'Air Mengalir Secara Semula Jadi':'Arah Aliran Air','Penyiasatan dulang + Predict-Observe-Explain + hubung kait alam',common,support,core,challenge,
      'Guru meninggikan satu hujung dulang kosong dan meminta murid meramal arah air sebelum air dititiskan.',
      'Murid menunjukkan bahagian tinggi dan rendah lalu menyatakan arah aliran air menggunakan satu bukti daripada aktiviti.');
  }

  function cycle(m,btRef,explain=false){
    const p=btRef||label(m),common=`${p}; kad sungai/laut; kad wap air; kad awan; kad hujan; anak panah; lembaran kitar air`;
    const support=[
      step('source-y2-water-cycle-s1','Susun Empat Kad','Dengan bimbingan, murid menyusun kad sungai/laut → wap air → awan → hujan.',common,'Sequencing'),
      step('source-y2-water-cycle-s2','Tambah Anak Panah','Murid meletakkan anak panah antara kad untuk menunjukkan urutan pergerakan air.','kad urutan; anak panah','Pair Check'),
      step('source-y2-water-cycle-s3','Ceritakan Semula','Murid menggunakan rangka ayat untuk menerangkan urutan kitar air dari kad pertama hingga kembali ke sungai atau laut.','rangka ayat; kad urutan','Story Retell')
    ];
    const core=[
      step('source-y2-water-cycle-c1','Kad Kitar Air Berselerak','Kumpulan menerima kad peringkat dalam susunan rawak dan menyusunnya tanpa melihat jawapan terlebih dahulu.',common,'Collaborative Sequencing'),
      step('source-y2-water-cycle-c2','Bina Kitar Lengkap','Murid menambah anak panah dan label supaya urutan menunjukkan air dari sungai/laut menjadi wap air, membentuk awan, turun sebagai hujan dan mengalir semula.','kad peringkat; anak panah; label','Model Building'),
      step('source-y2-water-cycle-c3','Semak Rakan','Kumpulan bertukar hasil dan menyemak sama ada semua peringkat serta arah anak panah berada pada urutan yang betul.','hasil kumpulan; senarai semak','Peer Review')
    ];
    const challenge=[
      step('source-y2-water-cycle-h1','Lakar Tanpa Kad','Murid melakar sendiri sekurang-kurangnya empat peringkat kitar air dan menambah anak panah arah.','kertas lakaran; pensel warna','Draw-and-Label'),
      step('source-y2-water-cycle-h2','Terangkan Satu Pusingan','Murid menerangkan satu pusingan lengkap bermula dari sungai atau laut sehingga air kembali ke sumber tersebut.','lakaran murid','Evidence Talk'),
      step('source-y2-water-cycle-h3','Baiki Urutan Salah','Guru memberikan satu urutan yang salah. Murid mengenal pasti kesalahan dan membetulkannya dengan alasan.','kad urutan salah','Error Analysis')
    ];
    return pack(m,p,explain?'Menjelaskan Kitar Air':'Kitar Air Semula Jadi','Pembinaan urutan + visual model + penerangan lisan',common,support,core,challenge,
      'Guru menunjukkan empat kad peringkat kitar air dalam susunan bercampur. Murid meramal kad yang patut berada dahulu.',
      'Murid menerangkan kitar air dalam satu pusingan ringkas sambil menunjuk anak panah pada hasil sendiri.');
  }

  function wind(m,btRef,effect=false){
    const p=btRef||label(m),common=`${p}; kipas tangan atau kipas kertas; jalur kertas/tisu; kincir angin kertas; kad pemerhatian; gambar kapal layar dan kincir angin`;
    const support=[
      step('source-y2-wind-s1','Gerakkan Udara','Murid mengipas jalur kertas dengan kipas tangan dan memerhati pergerakannya.',common,'Observe-Explain'),
      step('source-y2-wind-s2','Lihat Kincir Bergerak','Murid menghalakan udara bergerak kepada kincir kertas dan merekod sama ada kincir bergerak.','kincir kertas; kipas tangan','Hands-on Observation'),
      step('source-y2-wind-s3','Lengkapkan Ayat','Murid melengkapkan ayat “Udara yang bergerak ialah ___.”','rangka ayat; kad pemerhatian','Pair Check')
    ];
    const core=[
      step('source-y2-wind-c1','Ramalkan Kesan Udara','Kumpulan meramal apa yang berlaku kepada jalur kertas, kincir dan layar kecil apabila udara digerakkan.',common,'Predict-Observe-Explain'),
      step('source-y2-wind-c2',effect?'Stesen Kegunaan Angin':'Uji Udara Bergerak',effect?'Murid bergerak di stesen kincir, layar kecil dan model roket angin untuk memerhati bagaimana udara bergerak menghasilkan gerakan.':'Murid menghasilkan aliran udara menggunakan kipas tangan dan memerhati pergerakan bahan ringan serta kincir. Semua pemerhatian direkod sebelum kesimpulan dibuat.',common,'Hands-on Investigation'),
      step('source-y2-wind-c3',effect?'Peta Kesan Angin':'Bina Kesimpulan','Kumpulan merekod sekurang-kurangnya tiga kesan atau kegunaan udara bergerak dan memadankan setiap contoh dengan pemerhatian.','kad contoh; peta buih; rekod pemerhatian','Think-Pair-Share')
    ];
    const challenge=[
      step('source-y2-wind-h1','Banding Hembusan','Murid membandingkan hembusan perlahan dan lebih kuat pada kincir atau jalur kertas tanpa mengubah objek.','kipas tangan; kincir; jadual pemerhatian','Compare-and-Contrast'),
      step('source-y2-wind-h2','Cadang Kegunaan Baharu','Murid mencadangkan satu alat atau situasi lain yang menggunakan udara bergerak dan menerangkan kesan yang dijangka.','lembaran idea; gambar rujukan','Design Thinking'),
      step('source-y2-wind-h3','Pertahankan Idea','Murid menerangkan bukti daripada aktiviti yang menyokong idea bahawa udara yang bergerak boleh menghasilkan gerakan atau melakukan kerja mudah.','hasil ujian; lembaran idea','Evidence Talk')
    ];
    return pack(m,p,effect?'Kesan Udara Bergerak':'Udara Bergerak ialah Angin','Pemerhatian udara bergerak + Predict-Observe-Explain + aplikasi',common,support,core,challenge,
      effect?'Guru menunjukkan gambar kincir angin, kapal layar dan model roket angin. Murid meramal persamaan yang menyebabkan ketiga-tiganya boleh bergerak.':'Guru mengipas jalur kertas tanpa menyentuhnya. Murid menerangkan apa yang menyebabkan jalur itu bergerak.',
      effect?'Murid menyatakan satu kegunaan udara bergerak dan menerangkan kesannya berdasarkan aktiviti.':'Murid melengkapkan ayat “Udara yang bergerak ialah angin” dan menunjukkan satu pemerhatian yang membuktikannya.');
  }

  function pack(m,p,topic,method,common,support,core,challenge,setInduksi,penutup){
    const pr=pair(m);
    return {
      method,pakDetail:'Aktiviti utama kekal pada tugasan sumber dan bukti pemerhatian. Permainan atau kad hanya digunakan selepas murid memperoleh data atau memahami urutan konsep.',
      anchor:`Laksanakan tugasan sumber ${topic} pada ${p} dan gunakan hasil pemerhatian atau susunan murid sebagai bukti pembelajaran.`,kind:'investigation',
      bbmList:[p,...common.split(';').slice(1).map(x=>x.trim()).filter(Boolean)],groupBbm:{support:common,core:common,challenge:common},mainSp:sp(m),page:p,topic:m.title||topic,
      setInduksi,inductionData:{name:topic,text:setInduksi,bbm:common,pak21:'Predict-Observe-Explain'},librarySteps:{support,core,challenge},
      diffSupport:support.map(x=>x.name).join(' → '),diffCore:core.map(x=>x.name).join(' → '),diffChallenge:challenge.map(x=>x.name).join(' → '),
      diffSupportAct:support.map(x=>x.text).join(' '),diffCoreAct:core.map(x=>x.text).join(' '),diffChallengeAct:challenge.map(x=>x.text).join(' '),
      pbdEvidence:{method:'Pemerhatian aktiviti + semakan hasil murid + penerangan lisan',evidence:'Ramalan, rekod pemerhatian, susunan/lakaran dan penerangan berdasarkan bukti.',criterion:pr?.criteria||''},penutup
    };
  }

  const prevEffective=window.effectiveRphLessonMap;
  if(typeof prevEffective==='function')window.effectiveRphLessonMap=function(m,ev,built){
    const out=prevEffective(m,ev,built)||m;
    if(!mode(out))return out;
    const pr=pair(out);
    return {...out,objective:pr.objective,success_criteria:pr.criteria,_runtime_science_source_blueprint:`year2_${mode(out)}`};
  };

  const prevPed=window.buildSourceAwarePedagogy;
  if(typeof prevPed==='function')window.buildSourceAwarePedagogy=function(m,a,bt,en,classId=null){
    const base=prevPed(m,a,bt,en,classId);
    if(en)return base;
    switch(mode(m)){
      case 'water_sources':return {...base,...sources(m,bt)};
      case 'water_flow':return {...base,...flow(m,bt,false)};
      case 'natural_flow':return {...base,...flow(m,bt,true)};
      case 'water_cycle':return {...base,...cycle(m,bt,false)};
      case 'water_cycle_explain':return {...base,...cycle(m,bt,true)};
      case 'wind':return {...base,...wind(m,bt,false)};
      case 'wind_effect':return {...base,...wind(m,bt,true)};
      default:return base;
    }
  };

  window.__RPH_SCIENCE_YEAR2_WATER_AIR_BLUEPRINT__={version:'2026-09-04a',standards:['9.1.1','9.1.2','9.1.3','9.1.4','9.1.5','9.2.3','9.2.4']};
  console.info('RPH Science Year 2 water/air source blueprints active.');
})();