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
      '1.1.2@123':'animal_roleplay',
      '2.3.2@124':'reader_theatre',
      '3.2.3@126':'diary_graphic',
      '5.1.4@127':'conjunctions',
      '5.3.1@128':'declarative_sentences'
    })[`${mainSp(m)}@${page(m)}`]||'';
  }

  const C={
    animal_roleplay:{
      objective:p=>`Pada akhir PdP, murid dapat memberikan sekurang-kurangnya tiga respons yang sesuai terhadap suruhan semasa melakonkan dialog berdasarkan ${p}.`,
      criteria:'Murid memahami suruhan dalam dialog, memberikan respons yang sesuai dan melakonkan sekurang-kurangnya satu bahagian dialog dengan sebutan yang jelas.',
      induction:'Guru menunjukkan gambar haiwan yang memerlukan bantuan dan meminta murid memberikan satu respons yang sesuai apabila rakan mengajak membantu.',
      support:[
        step('bm1-u20-123-s1','Padan Suruhan dengan Respons','Murid memadankan kad suruhan dengan kad respons yang sesuai berdasarkan situasi dialog pada Buku Teks.','Buku Teks m/s 123; kad suruhan; kad respons','Matching'),
        step('bm1-u20-123-s2','Lakon dengan Kad Dialog','Murid melakonkan dialog pendek menggunakan kad watak dan petunjuk respons.','kad watak; Buku Teks m/s 123','Guided Role Play')
      ],
      core:[
        step('bm1-u20-123-c1','Kenal Pasti Suruhan','Secara berpasangan, murid membaca dialog dan menandakan bahagian yang mengandungi suruhan serta respons yang sepadan.','Buku Teks m/s 123','Pair Reading'),
        step('bm1-u20-123-c2','Lakon dan Respons','Pasangan melakonkan situasi berdasarkan dialog. Seorang memberikan suruhan dan seorang lagi memberikan respons yang sesuai sebelum bertukar peranan.','Buku Teks m/s 123; kad peranan','Role Play')
      ],
      challenge:[
        step('bm1-u20-123-h1','Respons Baharu yang Sesuai','Murid menghasilkan satu respons lain yang masih sesuai dengan suruhan dan konteks cerita.','kad situasi','Creative Response'),
        step('bm1-u20-123-h2','Jelaskan Pilihan Respons','Murid menerangkan mengapa respons yang dipilih sesuai dengan situasi dan nilai kasih sayang terhadap haiwan.','kad alasan','Reasoning Talk')
      ],
      close:'Murid menyebut satu contoh suruhan dan satu respons yang sesuai.',
      bbm:['Buku Teks m/s 123','kad suruhan/respons','kad watak']
    },
    reader_theatre:{
      objective:p=>`Pada akhir PdP, murid dapat membaca, memahami dan mempersembahkan cerita pada ${p} melalui teater pembaca dengan sebutan dan intonasi yang sesuai.`,
      criteria:'Murid memahami peranan watak, membaca bahagian sendiri dengan jelas dan menyampaikan sekurang-kurangnya satu maklumat penting daripada cerita.',
      induction:'Guru menunjukkan gambar sungai bersih dan sungai tercemar. Murid memilih keadaan yang lebih baik untuk haiwan dan memberi sebab.',
      support:[
        step('bm1-u20-124-s1','Kenal Watak dan Dialog','Guru membantu murid mengenal watak serta membahagikan dialog kepada bahagian pendek.','Buku Teks m/s 124-125; kad watak','Guided Reading'),
        step('bm1-u20-124-s2','Latihan Suara Watak','Murid membaca bahagian watak secara panggil-balas dengan fokus pada sebutan jelas dan intonasi mudah.','kad dialog','Echo Reading')
      ],
      core:[
        step('bm1-u20-124-c1','Baca untuk Faham Cerita','Kumpulan membaca cerita Haiwan yang Prihatin dan mengenal pasti masalah sungai serta tindakan yang dicadangkan oleh watak.','Buku Teks m/s 124-125; kad catatan','Collaborative Reading'),
        step('bm1-u20-124-c2','Teater Pembaca','Setiap ahli memainkan watak atau pencerita dan mempersembahkan cerita tanpa perlu menghafal. Selepas persembahan, kumpulan menyatakan satu mesej penting daripada cerita.','Buku Teks m/s 124-125; kad watak','Reader’s Theatre')
      ],
      challenge:[
        step('bm1-u20-124-h1','Intonasi Mengikut Watak','Murid menyesuaikan intonasi dengan emosi atau tujuan watak ketika membaca bahagian masing-masing.','Buku Teks m/s 124-125','Expressive Reading'),
        step('bm1-u20-124-h2','Simpulkan Mesej Cerita','Murid menerangkan hubungan antara kebersihan sungai dengan kehidupan haiwan berdasarkan peristiwa dalam cerita.','kad refleksi','Inference Talk')
      ],
      close:'Murid menyebut satu tindakan watak yang membantu menjaga kebersihan sungai.',
      bbm:['Buku Teks m/s 124-125','kad watak','kad catatan']
    },
    diary_graphic:{
      objective:p=>`Pada akhir PdP, murid dapat mencatat sekurang-kurangnya empat maklumat daripada catatan lawatan pada ${p} ke dalam pengurusan grafik dengan betul.`,
      criteria:'Murid memilih maklumat penting daripada bahan, memindahkannya ke pengurusan grafik dan membezakan sekurang-kurangnya empat peristiwa atau fakta lawatan.',
      induction:'Guru menunjukkan empat ikon: taklimat, pokok besar, tumbuhan unik dan haiwan liar. Murid meneka jenis maklumat yang mungkin dicatat dalam diari lawatan.',
      support:[
        step('bm1-u20-126-s1','Cari Empat Maklumat','Murid menandakan empat bahagian maklumat dengan bantuan ikon dan kata kunci.','Buku Teks m/s 126; kad ikon','Guided Scanning'),
        step('bm1-u20-126-s2','Lengkap Grafik','Murid memindahkan maklumat yang telah ditandakan ke dalam kotak pengurusan grafik separa lengkap.','lembaran grafik; Buku Teks m/s 126','Graphic Organizer')
      ],
      core:[
        step('bm1-u20-126-c1','Baca dan Catat','Murid membaca catatan Diari Abang dan mengenal pasti peristiwa utama seperti taklimat renjer, pemerhatian pokok dan hidupan liar.','Buku Teks m/s 126','Information Extraction'),
        step('bm1-u20-126-c2','Peta Lawatan','Murid memindahkan maklumat kepada pengurusan grafik mengikut urutan atau kategori, kemudian pasangan menyemak ketepatan dengan teks asal.','lembaran grafik','Pair Check')
      ],
      challenge:[
        step('bm1-u20-126-h1','Catat Tanpa Rangka','Murid memilih sendiri kategori pengurusan grafik dan mencatat maklumat penting tanpa kotak petunjuk.','Buku Teks m/s 126','Independent Note Taking'),
        step('bm1-u20-126-h2','Pilih Maklumat Paling Penting','Murid memilih satu maklumat yang dianggap paling penting dalam lawatan dan memberikan sebab berdasarkan bahan.','kad alasan','Reasoning Talk')
      ],
      close:'Murid menyebut satu fakta atau peristiwa daripada diari dan kategori tempat maklumat itu dicatat.',
      bbm:['Buku Teks m/s 126','kad ikon','pengurusan grafik']
    },
    conjunctions:{
      objective:p=>`Pada akhir PdP, murid dapat membina sekurang-kurangnya tiga ayat menggunakan kata hubung dan, tetapi atau berdasarkan jadual pada ${p} dengan betul.`,
      criteria:'Murid memilih kata hubung yang sesuai dengan hubungan makna dan menghasilkan sekurang-kurangnya tiga ayat lengkap berdasarkan jadual sumber.',
      induction:'Guru menunjukkan dua gambar aktiviti dan tiga kad kata hubung: dan, tetapi, atau. Murid memilih kata yang paling sesuai untuk mencantum idea.',
      support:[
        step('bm1-u20-127-s1','Pilih Kata Hubung','Murid memilih kad dan, tetapi atau bagi pasangan frasa yang disediakan guru berdasarkan jadual.','Buku Teks m/s 127; kad kata hubung','Choice Matching'),
        step('bm1-u20-127-s2','Cantum dengan Rangka','Murid melengkapkan rangka ayat menggunakan kata hubung yang dipilih.','rangka ayat; jadual sumber','Guided Grammar')
      ],
      core:[
        step('bm1-u20-127-c1','Baca Jadual Hubungan','Murid meneliti baris dalam jadual dan menentukan sama ada idea perlu digabung, dibezakan atau diberi pilihan.','Buku Teks m/s 127','Meaning Sort'),
        step('bm1-u20-127-c2','Bina Ayat dan Semak','Murid membina ayat menggunakan dan, tetapi atau, kemudian pasangan menyemak sama ada kata hubung menepati hubungan makna.','lembaran ayat; kad semak','Pair Check')
      ],
      challenge:[
        step('bm1-u20-127-h1','Ayat Tanpa Jadual Lengkap','Murid membina ayat baharu berdasarkan konteks taman menggunakan ketiga-tiga kata hubung tanpa rangka.','kad situasi','Independent Grammar'),
        step('bm1-u20-127-h2','Terangkan Fungsi Kata Hubung','Murid menerangkan secara mudah mengapa dan, tetapi atau dipilih dalam satu ayat.','kad alasan','Grammar Reasoning')
      ],
      close:'Guru membaca satu ayat tidak lengkap dan murid mengangkat kad kata hubung yang sesuai.',
      bbm:['Buku Teks m/s 127','kad kata hubung','lembaran ayat']
    },
    declarative_sentences:{
      objective:p=>`Pada akhir PdP, murid dapat mengenal pasti dan membina sekurang-kurangnya tiga ayat penyata berdasarkan bahan pada ${p} dengan betul.`,
      criteria:'Murid mengenal pasti ayat yang membuat pernyataan dan membina sekurang-kurangnya tiga ayat penyata berdasarkan maklumat tentang pokok periuk kera.',
      induction:'Guru menyebut satu pernyataan dan satu soalan. Murid menentukan ayat yang hanya menyampaikan maklumat.',
      support:[
        step('bm1-u20-128-s1','Pilih Ayat Penyata','Murid memilih ayat yang membuat pernyataan daripada beberapa kad contoh dan memadankannya dengan gambar sumber.','Buku Teks m/s 128; kad ayat','Sentence Sort'),
        step('bm1-u20-128-s2','Lengkap Ayat Maklumat','Murid melengkapkan rangka ayat berdasarkan fakta mudah tentang pokok periuk kera.','kad fakta; rangka ayat','Guided Writing')
      ],
      core:[
        step('bm1-u20-128-c1','Jejak Pernyataan dalam Bahan','Murid membaca maklumat pada Buku Teks m/s 128 dan menandakan contoh ayat penyata.','Buku Teks m/s 128','Grammar Discovery'),
        step('bm1-u20-128-c2','Bina Ayat daripada Fakta','Murid memilih tiga fakta daripada bahan lalu membina tiga ayat penyata sendiri.','lembaran ayat','Think-Write-Pair')
      ],
      challenge:[
        step('bm1-u20-128-h1','Pernyataan Baharu','Murid menggabungkan dua fakta yang berkaitan untuk membina ayat penyata yang lebih lengkap.','Buku Teks m/s 128','Sentence Expansion'),
        step('bm1-u20-128-h2','Buktikan Jenis Ayat','Murid menerangkan mengapa satu ayat yang dibina ialah ayat penyata berdasarkan fungsinya sebagai pernyataan.','kad alasan','Grammar Reasoning')
      ],
      close:'Murid menyebut satu ayat penyata tentang pokok periuk kera.',
      bbm:['Buku Teks m/s 128','kad fakta','kad ayat']
    }
  };

  function objectivePair(m){const c=C[mode(m)];return c?{objective:c.objective(pageLabel(m)),criteria:c.criteria}:null;}
  function blueprint(m){const md=mode(m),c=C[md];if(!c)return null;const p=pageLabel(m),pair=objectivePair(m);return{method:'Aktiviti source-first berdasarkan RPT + DSKP + Buku Teks',pakDetail:`Isi aktiviti datang daripada tugasan sebenar pada ${p}; Activity Library hanya memvariasikan cara pelaksanaan.`,anchor:`${m.title||md} — ${p}`,kind:'source_task',bbmList:c.bbm,groupBbm:{support:c.bbm.join('; '),core:c.bbm.join('; '),challenge:c.bbm.join('; ')},mainSp:mainSp(m),page:p,topic:m.title||md,setInduksi:c.induction,inductionData:{name:'Set Induksi Sumber',text:c.induction,bbm:p,pak21:'Think-Pair-Share'},librarySteps:{support:c.support,core:c.core,challenge:c.challenge},diffSupport:'Tugasan sumber yang sama dengan petunjuk, rangka atau pembahagian peranan.',diffCore:'Melaksanakan tugasan sebenar Buku Teks dan menyemak hasil dengan bukti halaman.',diffChallenge:'Melaksanakan tugasan yang sama secara lebih kendiri serta menjelaskan alasan atau mesej.',diffSupportAct:c.support.map(x=>x.text).join(' '),diffCoreAct:c.core.map(x=>x.text).join(' '),diffChallengeAct:c.challenge.map(x=>x.text).join(' '),pbdEvidence:{method:'Pemerhatian + hasil tugasan sumber + persembahan/penerangan murid',evidence:'Hasil yang boleh disemak terus dengan halaman Buku Teks.',criterion:pair.criteria},penutup:c.close};}

  const originalEffective=window.effectiveRphLessonMap;
  if(typeof originalEffective==='function')window.effectiveRphLessonMap=function(map,ev,built){const out=originalEffective(map,ev,built)||map,pair=objectivePair(out);return pair?{...out,objective:pair.objective,success_criteria:pair.criteria,_runtime_bm_source_blueprint:true,_runtime_bm_source_mode:mode(out)}:out;};
  const originalPedagogy=window.buildSourceAwarePedagogy;
  if(typeof originalPedagogy==='function')window.buildSourceAwarePedagogy=function(map,ev,built){return blueprint(map)||originalPedagogy(map,ev,built);};
  window.bmYear1Unit20BlueprintMode=mode;
  window.bmYear1Unit20Blueprint=blueprint;
})();