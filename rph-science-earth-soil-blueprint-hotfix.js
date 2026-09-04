(function(){
  'use strict';
  const subjectKey=m=>{try{return typeof window.rphSubjectKey==='function'?window.rphSubjectKey(m?.subject_id):''}catch{return ''}};
  const sp=m=>String(m?.source_evidence?.meta?.main_sp||String(m?.sp||'').split(',')[0]||'').trim();
  const year=m=>Number(m?.year||0)||0,pg=m=>Number(m?.textbook_page_start||0)||0;
  const label=m=>pg(m)?`Buku Teks m/s ${pg(m)}`:'Buku Teks';
  const step=(key,name,text,bbm,pak21)=>({key,name,text,bbm,pak21,phase:'source'});
  function mode(m){
    if(subjectKey(m)!=='science'||year(m)!==1)return '';
    if(sp(m)==='9.1.1'&&pg(m)===82)return 'landform';
    if(sp(m)==='9.2.1'&&pg(m)===85)return 'soiltype';
    if(sp(m)==='9.2.2'&&pg(m)===86)return 'soilcontent';
    return '';
  }
  function pair(m){
    const p=label(m);
    if(mode(m)==='landform')return{
      objective:`Pada akhir PdP, murid dapat mengenal pasti dan menamakan sekurang-kurangnya enam bentuk muka Bumi daripada gunung, pantai, bukit, lembah, sungai, kolam, tasik dan laut berdasarkan ${p}.`,
      criteria:'Murid memadankan sekurang-kurangnya enam bentuk muka Bumi dengan gambar/model yang betul dan menyebut namanya dengan tepat.'
    };
    if(mode(m)==='soiltype')return{
      objective:`Pada akhir PdP, murid dapat menyatakan tiga jenis tanah iaitu tanah kebun, tanah liat dan pasir serta memadankan setiap jenis dengan sampel pada ${p}.`,
      criteria:'Murid mengenal pasti tanah kebun, tanah liat dan pasir daripada sampel/gambar serta menyatakan sekurang-kurangnya satu ciri yang diperhatikan bagi setiap jenis.'
    };
    return{
      objective:`Pada akhir PdP, murid dapat membanding beza kandungan sekurang-kurangnya dua jenis tanah melalui penyiasatan berpandukan ${p}.`,
      criteria:'Murid memerhati dua sampel tanah, merekod sekurang-kurangnya tiga kandungan yang ditemui dan menyatakan sekurang-kurangnya satu persamaan atau perbezaan berdasarkan rekod.'
    };
  }
  function landform(m,btRef){
    const p=btRef||label(m),names='gunung, pantai, bukit, lembah, sungai, kolam, tasik dan laut',common=`${p}; gambar/model bentuk muka Bumi; kad nama ${names}; papan padanan`;
    const support=[
      step('source-earth-land-s1','Lihat dan Tunjuk','Guru menunjukkan empat gambar/model bentuk muka Bumi. Murid menunjuk bentuk yang disebut guru dan memadankan kad nama.',common,'Guided Discovery'),
      step('source-earth-land-s2','Padan Gambar dan Nama','Murid bekerja berpasangan memadankan sekurang-kurangnya empat kad gambar dengan kad nama menggunakan Buku Teks sebagai rujukan.','kad gambar; kad nama; Buku Teks','Matching'),
      step('source-earth-land-s3','Sebut dan Semak','Setiap murid memilih dua kad dan menyebut nama bentuk muka Bumi. Pasangan menyemak dengan sumber.','kad bentuk muka Bumi; Buku Teks','Pair Check')
    ];
    const core=[
      step('source-earth-land-c1','Jejak Lapan Bentuk','Kumpulan mencari dan menamakan gunung, pantai, bukit, lembah, sungai, kolam, tasik dan laut pada gambar/model sumber.',common,'Observation Hunt'),
      step('source-earth-land-c2','Peta Padanan','Murid menyusun lapan kad nama pada papan gambar/model dan membetulkan padanan dengan merujuk Buku Teks.',common,'Collaborative Matching'),
      step('source-earth-land-c3','Teka Bentuk Muka Bumi','Seorang murid menerangkan satu ciri yang dapat dilihat tanpa menyebut nama; ahli kumpulan meneka bentuk muka Bumi dan menunjukkan bukti pada sumber.','kad nama; gambar/model sumber','Game-Based Learning')
    ];
    const challenge=[
      step('source-earth-land-h1','Banding Dua Bentuk','Murid memilih dua bentuk muka Bumi daripada sumber dan merekod satu persamaan serta satu perbezaan yang dapat diperhatikan.','gambar/model; jadual banding beza','Compare-and-Contrast'),
      step('source-earth-land-h2','Bina Laluan Ciri','Murid menyusun beberapa kad bentuk muka Bumi menjadi satu laluan cerita ringkas dan menerangkan setiap bentuk yang dilalui tanpa mengubah fakta sumber.','kad bentuk muka Bumi; papan urutan','Creative Communication'),
      step('source-earth-land-h3','Bukti pada Sumber','Murid membentangkan tiga bentuk dan menunjuk bahagian gambar/model yang menyokong jawapan.','Buku Teks; kad bukti','Evidence Talk')
    ];
    return {method:'Pemerhatian gambar/model + padanan + komunikasi berbukti',pakDetail:'DSKP menekankan perbincangan melalui pemerhatian model muka Bumi. Aktiviti memerlukan murid menunjuk, menamakan dan membandingkan ciri yang benar-benar kelihatan pada sumber.',anchor:`Kenal pasti bentuk muka Bumi pada ${p}: ${names}.`,kind:'observe',bbmList:[p,'gambar/model bentuk muka Bumi','kad nama','papan padanan'],groupBbm:{support:common,core:common,challenge:common},mainSp:'9.1.1',page:p,topic:m.title||'Bentuk Muka Bumi',setInduksi:'Guru menunjukkan dua gambar bentuk muka Bumi yang jelas berbeza. Murid menyatakan apa yang mereka nampak sebelum nama bentuk diperkenalkan.',inductionData:{name:'Apa yang Kamu Nampak?',text:'Guru menunjukkan dua gambar bentuk muka Bumi. Murid menyebut ciri yang dapat dilihat dan membuat padanan awal.',bbm:'dua gambar bentuk muka Bumi',pak21:'Think-Pair-Share'},librarySteps:{support,core,challenge},diffSupport:'Padan empat bentuk dengan bimbingan.',diffCore:'Kenal pasti dan padan sehingga lapan bentuk.',diffChallenge:'Banding dua bentuk dan bentang bukti daripada sumber.',diffSupportAct:support.map(x=>x.text).join(' '),diffCoreAct:core.map(x=>x.text).join(' '),diffChallengeAct:challenge.map(x=>x.text).join(' '),pbdEvidence:{method:'Pemerhatian padanan + soal jawab + semakan gambar/model',evidence:'Nama bentuk muka Bumi, padanan gambar dan penerangan ciri yang dilihat.',criterion:pair(m).criteria},penutup:'Murid memilih satu kad bentuk muka Bumi, menyebut namanya dan menunjuk contoh pada gambar/model. Guru merumuskan lapan bentuk utama dalam SP.'};
  }
  function soiltype(m,btRef){
    const p=btRef||label(m),common=`${p}; sampel guru dalam bekas lutsinar: tanah kebun, tanah liat, pasir; kad nama; kanta tangan jika ada`;
    const support=[
      step('source-earth-soiltype-s1','Lihat Tiga Sampel','Murid memerhati tiga sampel tanah dalam bekas lutsinar dan menyebut perbezaan warna, saiz butiran atau rupa yang dapat dilihat.',common,'Guided Observation'),
      step('source-earth-soiltype-s2','Padan Nama Tanah','Dengan bimbingan guru, murid memadankan kad tanah kebun, tanah liat dan pasir dengan sampel yang betul.',common,'Matching'),
      step('source-earth-soiltype-s3','Sebut Satu Ciri','Murid memilih satu sampel dan menyatakan satu ciri yang dapat diperhatikan tanpa meneka kandungan yang tidak kelihatan.','sampel dalam bekas; kad ciri','Pair Check')
    ];
    const core=[
      step('source-earth-soiltype-c1','Stesen Tiga Tanah','Kumpulan memerhati tanah kebun, tanah liat dan pasir di tiga stesen menggunakan bekas lutsinar. Murid merekod ciri yang benar-benar dapat dilihat.',common,'Station Rotation'),
      step('source-earth-soiltype-c2','Kad Identiti Tanah','Murid melengkapkan kad identiti bagi setiap sampel: nama tanah dan sekurang-kurangnya satu ciri pemerhatian.','kad identiti; sampel tanah','Collaborative Recording'),
      step('source-earth-soiltype-c3','Teka Sampel','Guru menunjukkan satu sampel tanpa nama. Kumpulan memilih kad nama dan menunjukkan ciri pemerhatian yang menyokong pilihan.','sampel tanpa label; kad nama','Evidence Game')
    ];
    const challenge=[
      step('source-earth-soiltype-h1','Banding Tiga Sampel','Murid membina jadual tiga lajur dan merekod persamaan/perbezaan yang dapat dilihat antara tanah kebun, tanah liat dan pasir.','tiga sampel; jadual banding beza','Compare-and-Contrast'),
      step('source-earth-soiltype-h2','Sampel Misteri','Guru menyediakan satu sampel berlabel rahsia daripada salah satu jenis yang dipelajari. Murid mengenal pasti jenis berdasarkan ciri pemerhatian dan kemudian menyemak label.','sampel misteri; kad bukti','Inference Challenge'),
      step('source-earth-soiltype-h3','Terangkan Pilihan','Murid membentangkan jenis sampel dan sekurang-kurangnya dua bukti pemerhatian.','jadual pemerhatian; sampel','Evidence Talk')
    ];
    return {method:'Pemerhatian sampel tanah + pengelasan + bukti visual',pakDetail:'Sampel tanah disediakan guru dalam bekas lutsinar. Murid memerhati dan membandingkan tanpa perlu menyentuh tanah secara langsung.',anchor:`Kenal pasti tanah kebun, tanah liat dan pasir pada ${p} melalui pemerhatian sampel.`,kind:'identify',bbmList:[p,'sampel tanah kebun','tanah liat','pasir','bekas lutsinar','kad nama'],groupBbm:{support:common,core:common,challenge:common},mainSp:'9.2.1',page:p,topic:m.title||'Tanah',setInduksi:'Guru menunjukkan tiga bekas lutsinar berisi sampel tanah yang berbeza. Murid menyatakan perbezaan yang dapat dilihat sebelum nama sampel diberikan.',inductionData:{name:'Tanah Sama atau Berbeza?',text:'Guru menunjukkan tiga sampel tanah dalam bekas lutsinar. Murid menyatakan perbezaan yang dapat diperhatikan.',bbm:'tiga sampel tanah dalam bekas lutsinar',pak21:'See-Think-Wonder'},librarySteps:{support,core,challenge},diffSupport:'Padan tiga nama tanah dan sebut satu ciri.',diffCore:'Bina kad identiti bagi tiga jenis tanah.',diffChallenge:'Banding sampel dan kenal pasti sampel misteri berdasarkan bukti.',diffSupportAct:support.map(x=>x.text).join(' '),diffCoreAct:core.map(x=>x.text).join(' '),diffChallengeAct:challenge.map(x=>x.text).join(' '),pbdEvidence:{method:'Pemerhatian sampel + padanan + penerangan lisan',evidence:'Nama jenis tanah dan ciri pemerhatian setiap sampel.',criterion:pair(m).criteria},penutup:'Murid mengangkat satu kad nama tanah dan menunjuk sampel yang sepadan. Guru meminta satu ciri pemerhatian sebagai bukti.'};
  }
  function soilcontent(m,btRef){
    const p=btRef||label(m),common=`${p}; dua sampel tanah guru dari lokasi berbeza; dua botol/bekas lutsinar bertutup; air; label; jadual kandungan`;
    const support=[
      step('source-earth-soilcontent-s1','Perhati Sebelum Air','Murid melihat dua sampel tanah dan menandakan kandungan yang dapat dilihat seperti daun, ranting, batu atau pasir menggunakan kad gambar.',common,'Guided Observation'),
      step('source-earth-soilcontent-s2','Goncang dan Biarkan','Guru atau murid di bawah pengawasan memasukkan air ke dalam bekas tanah bertutup, menggoncang secara terkawal dan membiarkannya seketika supaya kandungan dapat diperhatikan melalui bekas.',common,'Hands-on Observation'),
      step('source-earth-soilcontent-s3','Tanda Sama atau Berbeza','Murid membandingkan dua bekas dan menandakan sekurang-kurangnya satu persamaan atau perbezaan pada jadual bergambar.','dua bekas tanah; jadual bergambar','Pair Check')
    ];
    const core=[
      step('source-earth-soilcontent-c1','Ramalkan Kandungan','Kumpulan membuat ramalan kandungan bagi dua sampel tanah sebelum air ditambah dan merekod ramalan.',common,'Predict-Observe-Explain'),
      step('source-earth-soilcontent-c2','Penyiasatan Kandungan Tanah','Murid memerhati proses tanah dicampur air, digoncang dalam bekas bertutup dan dibiarkan mendap. Mereka merekod kandungan yang kelihatan seperti ranting, daun, batu dan pasir.',common,'Hands-on Investigation'),
      step('source-earth-soilcontent-c3','Jadual Banding Beza','Kumpulan melengkapkan jadual Sampel A/Sampel B dan menyatakan sekurang-kurangnya satu persamaan serta satu perbezaan berdasarkan pemerhatian sebenar.','dua sampel; jadual banding beza','Compare-and-Contrast')
    ];
    const challenge=[
      step('source-earth-soilcontent-h1','Rekod Lebih Terperinci','Murid merekod kandungan yang kelihatan bagi setiap sampel dan mengelaskan kepada bahan organik yang kelihatan, batu/pasir atau bahan lain yang dapat dikenal pasti.','bekas tanah; jadual klasifikasi','Data Detective'),
      step('source-earth-soilcontent-h2','Banding Lokasi','Murid membandingkan dua sampel daripada lokasi berbeza yang disediakan guru dan memilih bukti paling jelas yang membezakan kandungannya.','dua sampel berlabel lokasi; kad bukti','Evidence Hunt'),
      step('source-earth-soilcontent-h3','Kesimpulan Berbukti','Murid menyatakan bahawa kandungan tanah boleh berbeza antara sampel dan menyokong kesimpulan dengan sekurang-kurangnya dua pemerhatian daripada jadual.','jadual banding beza; hasil pemerhatian','Evidence Talk')
    ];
    return {method:'Penyiasatan kandungan tanah + mendapan + banding beza',pakDetail:'Selaras dengan DSKP, tanah dicampur air, digoncang dan dibiarkan seketika untuk melihat kandungan. Sampel dan bekas disediakan guru; murid memerhati melalui bekas bertutup dan mencuci tangan selepas aktiviti.',anchor:`Banding beza kandungan dua jenis tanah pada ${p} melalui pemerhatian selepas tanah dicampur air dan dibiarkan mendap.`,kind:'investigation',bbmList:[p,'dua sampel tanah','bekas lutsinar bertutup','air','jadual banding beza'],groupBbm:{support:common,core:common,challenge:common},mainSp:'9.2.2',page:p,topic:m.title||'Kandungan Tanah',setInduksi:'Guru menunjukkan dua bekas sampel tanah dari lokasi berbeza. Murid meramal sama ada kandungannya sama atau berbeza dan menyatakan sebab berdasarkan rupa awal.',inductionData:{name:'Apa Ada Dalam Tanah?',text:'Guru menunjukkan dua sampel tanah dalam bekas lutsinar. Murid meramal kandungan yang mungkin dapat dilihat selepas penyiasatan.',bbm:'dua sampel tanah dalam bekas lutsinar',pak21:'Predict-Observe-Explain'},librarySteps:{support,core,challenge},diffSupport:'Kenal pasti kandungan dengan kad gambar dan catat satu perbezaan.',diffCore:'Jalankan pemerhatian mendapan dan lengkapkan jadual banding beza.',diffChallenge:'Klasifikasikan kandungan dan bina kesimpulan berdasarkan dua bukti.',diffSupportAct:support.map(x=>x.text).join(' '),diffCoreAct:core.map(x=>x.text).join(' '),diffChallengeAct:challenge.map(x=>x.text).join(' '),pbdEvidence:{method:'Pemerhatian penyiasatan + semakan jadual banding beza',evidence:'Ramalan, kandungan yang diperhatikan pada dua sampel dan persamaan/perbezaan yang direkod.',criterion:pair(m).criteria},penutup:'Murid menyatakan satu perbezaan kandungan antara dua sampel dan menunjukkan catatan yang menjadi bukti. Guru merumuskan bahawa tanah dari tempat berbeza boleh mempunyai kandungan berbeza.'};
  }
  const prevEffective=window.effectiveRphLessonMap;
  if(typeof prevEffective==='function')window.effectiveRphLessonMap=function(m,ev,built){const out=prevEffective(m,ev,built)||m;if(!mode(out))return out;const p=pair(out);return {...out,objective:p.objective,success_criteria:p.criteria,_runtime_science_source_blueprint:`earth_${mode(out)}`};};
  const prevPed=window.buildSourceAwarePedagogy;
  if(typeof prevPed==='function')window.buildSourceAwarePedagogy=function(m,a,bt,en,classId=null){const base=prevPed(m,a,bt,en,classId);if(en)return base;const md=mode(m);if(md==='landform')return {...base,...landform(m,bt)};if(md==='soiltype')return {...base,...soiltype(m,bt)};if(md==='soilcontent')return {...base,...soilcontent(m,bt)};return base;};
  window.__RPH_SCIENCE_EARTH_SOIL_BLUEPRINT__={version:'2026-09-04a',standards:['9.1.1','9.2.1','9.2.2']};
  console.info('RPH Science Earth and soil blueprints active.');
})();