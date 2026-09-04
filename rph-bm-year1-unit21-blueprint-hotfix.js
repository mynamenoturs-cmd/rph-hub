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
      '1.1.2@129':'green_day_message',
      '2.3.1@130':'save_energy_story',
      '3.3.1@131':'eco_bag_writing',
      '5.3.1@132':'commuter_commands',
      '5.3.1@133':'newspaper_exclamations',
      '5.3.1@134':'declarative_enrichment',
      '2.3.1@136':'recycling_bins'
    })[`${mainSp(m)}@${page(m)}`]||'';
  }

  const C={
    green_day_message:{
      objective:p=>`Pada akhir PdP, murid dapat memberikan sekurang-kurangnya tiga respons yang sesuai terhadap pesanan berdasarkan perbualan pada ${p}.`,
      criteria:'Murid mengenal pasti perkara yang perlu dibawa atau dilakukan dan memberikan respons lisan yang sesuai dalam simulasi Program Hari Hijau.',
      induction:'Guru menunjukkan kad Program Hari Hijau dan beberapa gambar bahan kelas. Murid meneka bahan yang sesuai dibawa untuk aktiviti kebersihan atau hiasan.',
      support:[
        step('bm1-u21-129-s1','Padan Pesanan dengan Respons','Murid memadankan kad pesanan guru dengan kad respons yang sesuai.','Buku Teks m/s 129; kad pesanan; kad respons','Matching'),
        step('bm1-u21-129-s2','Simulasi Berpandu','Murid melakonkan perbualan pendek menggunakan kad watak dan rangka respons seperti “Baik, cikgu. Saya akan…”.','kad watak; rangka respons','Guided Simulation')
      ],
      core:[
        step('bm1-u21-129-c1','Dengar, Faham, Respons','Secara berpasangan, murid membaca atau mendengar pesanan dalam perbualan pada Buku Teks m/s 129 dan menyatakan tindakan yang perlu dibuat.','Buku Teks m/s 129','Listen-Respond'),
        step('bm1-u21-129-c2','Simulasi Hari Hijau','Kumpulan membuat simulasi guru menyampaikan pesanan dan murid memberikan respons yang sesuai. Rakan menyemak sama ada respons menepati pesanan asal.','kad peranan; Buku Teks m/s 129','Role Play')
      ],
      challenge:[
        step('bm1-u21-129-h1','Pesanan Baharu','Murid mencipta satu pesanan tambahan yang sesuai dengan Program Hari Hijau dan seorang rakan memberikan respons.','kad situasi','Creative Speaking'),
        step('bm1-u21-129-h2','Terangkan Tindakan','Murid menerangkan mengapa tindakan yang dipilih sesuai dengan pesanan dan tujuan program.','kad alasan','Reasoning Talk')
      ],
      close:'Murid menyebut satu pesanan daripada aktiviti dan satu respons yang sesuai.',
      bbm:['Buku Teks m/s 129','kad pesanan/respons','kad peranan']
    },
    save_energy_story:{
      objective:p=>`Pada akhir PdP, murid dapat mengenal pasti sekurang-kurangnya tiga maklumat penting daripada cerita pada ${p} dan menceritakan dua cara menjimatkan tenaga elektrik di sekolah.`,
      criteria:'Murid mencatat maklumat penting daripada cerita dan menyatakan sekurang-kurangnya dua amalan menjimatkan elektrik yang sesuai untuk sekolah.',
      induction:'Guru menunjukkan gambar lampu dan kipas yang masih terpasang dalam bilik kosong. Murid menyatakan tindakan yang patut dibuat.',
      support:[
        step('bm1-u21-130-s1','Cari Cara Jimat','Murid menandakan maklumat dalam cerita yang menunjukkan cara menjimatkan elektrik dengan bantuan ikon suis.','Buku Teks m/s 130; kad ikon','Guided Scanning'),
        step('bm1-u21-130-s2','Cakap Ikut Kad','Murid memilih dua kad situasi sekolah dan melengkapkan rangka “Saya akan… supaya…”.','kad situasi; rangka ayat','Guided Speaking')
      ],
      core:[
        step('bm1-u21-130-c1','Baca dan Catat Maklumat Penting','Murid membaca cerita dan mencatat cara menjimatkan tenaga yang disebut dalam bahan.','Buku Teks m/s 130; kad catatan','Intensive Reading'),
        step('bm1-u21-130-c2','Jimat Tenaga di Sekolah','Pasangan memilih dua situasi sekolah dan menceritakan tindakan menjimatkan elektrik berdasarkan prinsip yang dipelajari daripada cerita.','kad situasi sekolah','Think-Pair-Share')
      ],
      challenge:[
        step('bm1-u21-130-h1','Bezakan Perlu dan Membazir','Murid mengelaskan beberapa situasi sebagai penggunaan perlu atau pembaziran tenaga dan memberi sebab.','kad situasi','Classification'),
        step('bm1-u21-130-h2','Pesanan Jimat Tenaga','Murid menghasilkan satu pesanan ringkas untuk warga kelas berdasarkan maklumat daripada cerita.','kad mesej','Message Creation')
      ],
      close:'Murid menyebut satu tindakan menjimatkan elektrik yang boleh dilakukan sebelum meninggalkan kelas.',
      bbm:['Buku Teks m/s 130','kad ikon suis','kad situasi sekolah']
    },
    eco_bag_writing:{
      objective:p=>`Pada akhir PdP, murid dapat menghasilkan satu karangan terkawal tentang Beg Mesra Alam menggunakan sekurang-kurangnya lima maklumat pada ${p}.`,
      criteria:'Murid memilih sekurang-kurangnya lima fakta sumber, menyusunnya secara logik dan menulis karangan pendek dengan ayat yang lengkap serta tanda baca asas yang betul.',
      induction:'Guru menunjukkan gambar dua jenis beg dan meminta murid meneka beg yang lebih sesuai digunakan semula serta sebabnya.',
      support:[
        step('bm1-u21-131-s1','Susun Kad Fakta','Murid mengasingkan maklumat sumber kepada bahan, ciri dan kegunaan dengan bantuan tiga ruang kategori.','Buku Teks m/s 131; kad fakta','Information Sort'),
        step('bm1-u21-131-s2','Tulis Ikut Rangka','Murid menggunakan rangka karangan tiga bahagian dan memilih sekurang-kurangnya empat fakta sumber untuk melengkapkannya.','rangka karangan; kad fakta','Guided Writing')
      ],
      core:[
        step('bm1-u21-131-c1','Pilih Lima Maklumat','Murid meneliti senarai ciri Beg Mesra Alam dan memilih sekurang-kurangnya lima maklumat yang akan digunakan dalam karangan.','Buku Teks m/s 131; peta isi','Planning'),
        step('bm1-u21-131-c2','Tulis dan Semak Karangan','Murid menulis karangan terkawal berdasarkan maklumat terpilih, kemudian pasangan menyemak ketepatan isi, ayat lengkap dan tanda baca.','lembaran karangan; senarai semak','Peer Review')
      ],
      challenge:[
        step('bm1-u21-131-h1','Susun Isi Sendiri','Murid menentukan sendiri urutan isi tanpa rangka kategori dan menulis karangan yang lebih lancar.','Buku Teks m/s 131','Independent Writing'),
        step('bm1-u21-131-h2','Ayat Penutup Bermakna','Murid menambah satu ayat penutup tentang sebab penggunaan beg mesra alam membantu menjaga alam sekitar.','lembaran karangan','Reasoning Writing')
      ],
      close:'Murid membaca satu ayat daripada karangan dan menyatakan maklumat sumber yang digunakan.',
      bbm:['Buku Teks m/s 131','kad fakta','peta isi','senarai semak']
    },
    commuter_commands:{
      objective:p=>`Pada akhir PdP, murid dapat mengenal pasti dan membina sekurang-kurangnya empat ayat perintah berdasarkan dialog pada ${p} dengan betul.`,
      criteria:'Murid mengenal pasti fungsi ayat perintah dalam dialog dan membina ayat perintah baharu menggunakan kata seperti sila, jangan dan tolong mengikut konteks.',
      induction:'Guru menunjukkan tiga kad kata: sila, jangan dan tolong. Murid menyatakan jenis tindakan yang biasanya disampaikan oleh setiap kata.',
      support:[
        step('bm1-u21-132-s1','Cari Kata Perintah','Murid menandakan kata perintah dalam dialog dan memadankannya dengan tujuan seperti larangan, permintaan atau arahan sopan.','Buku Teks m/s 132; kad kata','Guided Grammar'),
        step('bm1-u21-132-s2','Lengkap Ayat Perintah','Murid melengkapkan rangka ayat berdasarkan situasi perjalanan menggunakan salah satu kata perintah yang sesuai.','rangka ayat; kad situasi','Sentence Completion')
      ],
      core:[
        step('bm1-u21-132-c1','Jejak Ayat Perintah','Murid membaca dialog Menaiki Komuter dan mengenal pasti ayat yang bertujuan menimbulkan tindakan.','Buku Teks m/s 132','Grammar Discovery'),
        step('bm1-u21-132-c2','Bina Ayat Perintah Baharu','Murid membina sekurang-kurangnya empat ayat perintah lain yang sesuai dengan konteks perjalanan dan keselamatan.','kad situasi; lembaran ayat','Think-Write-Pair')
      ],
      challenge:[
        step('bm1-u21-132-h1','Kelas Fungsi Perintah','Murid mengelaskan ayat kepada larangan, permintaan atau arahan sopan berdasarkan kata yang digunakan.','kad ayat','Classification'),
        step('bm1-u21-132-h2','Ubah Nada, Kekal Tujuan','Murid membina dua ayat perintah berbeza yang mempunyai tujuan tindakan yang sama tetapi menggunakan kata perintah berlainan secara sesuai.','kad cabaran','Grammar Reasoning')
      ],
      close:'Guru menyebut satu situasi dan murid membina satu ayat perintah yang sesuai.',
      bbm:['Buku Teks m/s 132','kad kata perintah','kad situasi']
    },
    newspaper_exclamations:{
      objective:p=>`Pada akhir PdP, murid dapat mengenal pasti dan membina sekurang-kurangnya tiga ayat seruan berdasarkan bahan pada ${p} dengan betul.`,
      criteria:'Murid mengenal pasti ayat yang melahirkan perasaan dan membina sekurang-kurangnya tiga ayat seruan yang sesuai dengan situasi dalam bahan.',
      induction:'Guru menunjukkan tiga ekspresi emosi seperti gembira, sakit dan kagum. Murid memilih kata seru atau ayat seruan yang sesuai.',
      support:[
        step('bm1-u21-133-s1','Padan Emosi dan Ayat','Murid memadankan gambar emosi dengan ayat seruan yang sesuai daripada bahan.','Buku Teks m/s 133; kad emosi','Matching'),
        step('bm1-u21-133-s2','Lengkap Seruan','Murid melengkapkan rangka ayat seruan berdasarkan situasi kitar semula surat khabar.','rangka ayat; gambar sumber','Guided Grammar')
      ],
      core:[
        step('bm1-u21-133-c1','Cari Ayat Seruan','Murid membaca bahan Aku Senaskhah Surat Khabar dan mengenal pasti ayat yang menunjukkan perasaan seperti kagum, sakit atau gembira.','Buku Teks m/s 133','Grammar Discovery'),
        step('bm1-u21-133-c2','Bina Seruan daripada Situasi','Murid memilih tiga situasi daripada bahan dan membina ayat seruan yang sesuai.','kad situasi; lembaran ayat','Think-Write')
      ],
      challenge:[
        step('bm1-u21-133-h1','Bezakan Perasaan','Murid menerangkan perasaan yang diwakili oleh ayat seruan dan mengapa ayat itu sesuai dengan situasi.','kad emosi','Reasoning Talk'),
        step('bm1-u21-133-h2','Seruan Baharu','Murid membina ayat seruan baharu untuk satu situasi kitar semula lain tanpa menyalin ayat sumber.','kad situasi baharu','Creative Grammar')
      ],
      close:'Murid memberikan satu ayat seruan dan menyebut perasaan yang ditunjukkan.',
      bbm:['Buku Teks m/s 133','kad emosi','kad situasi']
    },
    declarative_enrichment:{
      objective:p=>`Pada akhir PdP, murid dapat menulis sekurang-kurangnya tiga ayat penyata berdasarkan gambar dan frasa pada ${p} dengan betul.`,
      criteria:'Murid menulis ayat penyata yang lengkap dan sepadan dengan gambar atau frasa serta menggunakan huruf besar dan tanda noktah dengan betul.',
      induction:'Guru menunjukkan satu gambar aktiviti menjaga pokok dan meminta murid menyatakan satu fakta dalam bentuk ayat penyata.',
      support:[
        step('bm1-u21-134-s1','Padan Gambar dan Frasa','Murid memadankan gambar dengan frasa tindakan sebelum menulis ayat.','Buku Teks m/s 134; kad gambar/frasa','Matching'),
        step('bm1-u21-134-s2','Lengkap Ayat Penyata','Murid menggunakan rangka ayat untuk membina pernyataan lengkap berdasarkan padanan.','rangka ayat','Guided Writing')
      ],
      core:[
        step('bm1-u21-134-c1','Tulis daripada Gambar','Murid memilih gambar dan frasa pada halaman lalu menulis sekurang-kurangnya tiga ayat penyata lengkap.','Buku Teks m/s 134','Independent Writing'),
        step('bm1-u21-134-c2','Semak Fakta dan Tanda Baca','Pasangan menyemak sama ada ayat benar-benar menyatakan maklumat pada gambar dan mempunyai huruf besar serta noktah.','senarai semak','Peer Review')
      ],
      challenge:[
        step('bm1-u21-134-h1','Kembangkan Pernyataan','Murid menambah satu maklumat relevan pada ayat tanpa mengubah fakta utama gambar.','lembaran ayat','Sentence Expansion'),
        step('bm1-u21-134-h2','Bina Pernyataan Baharu','Murid membina satu ayat penyata baharu tentang penjagaan alam berdasarkan konteks halaman.','kad cabaran','Creative Writing')
      ],
      close:'Murid membaca satu ayat penyata dan rakan menyatakan fakta yang disampaikan.',
      bbm:['Buku Teks m/s 134','kad gambar/frasa','senarai semak']
    },
    recycling_bins:{
      objective:p=>`Pada akhir PdP, murid dapat mengenal pasti sekurang-kurangnya enam maklumat penting daripada bacaan tentang tong kitar semula pada ${p} dan mengelaskan bahan mengikut tong yang betul.`,
      criteria:'Murid memadankan warna tong dengan jenis bahan yang diterima dan memberikan sekurang-kurangnya satu bukti daripada teks bagi setiap kategori.',
      induction:'Guru menunjukkan tiga kad warna tong kitar semula tanpa label. Murid meneka jenis bahan yang mungkin dimasukkan berdasarkan pengetahuan awal.',
      support:[
        step('bm1-u21-136-s1','Cari Warna dan Bahan','Murid menandakan nama warna tong dan contoh bahan dalam teks menggunakan kod simbol.','Buku Teks m/s 136; kad simbol','Guided Scanning'),
        step('bm1-u21-136-s2','Padan Bahan ke Tong','Murid memadankan kad bahan seperti kertas, kaca, aluminium dan plastik dengan kad warna berdasarkan maklumat teks.','kad bahan; kad warna tong','Matching')
      ],
      core:[
        step('bm1-u21-136-c1','Baca dan Bina Jadual','Murid membaca teks Tong Kitar Semula dan mengisi jadual warna tong, kategori bahan dan contoh.','Buku Teks m/s 136; jadual maklumat','Information Extraction'),
        step('bm1-u21-136-c2','Cabaran Kelas Tong','Kumpulan menerima kad bahan secara rawak, memilih tong yang betul dan menunjukkan ayat atau bahagian teks yang menyokong keputusan.','kad bahan; kad tong','Evidence Classification')
      ],
      challenge:[
        step('bm1-u21-136-h1','Jelaskan Sistem Kitar Semula','Murid menerangkan bagaimana pengasingan bahan kepada tong berbeza membantu pengurusan sampah.','Buku Teks m/s 136','Reasoning Talk'),
        step('bm1-u21-136-h2','Semak Kad Mengelirukan','Murid menilai kad bahan yang hampir sama dan mempertahankan pilihan tong menggunakan bukti teks.','kad cabaran','Evidence Talk')
      ],
      close:'Guru menunjukkan satu kad bahan dan murid menyatakan tong yang betul serta satu sebab berdasarkan bacaan.',
      bbm:['Buku Teks m/s 136','kad bahan','kad warna tong','jadual maklumat']
    }
  };

  function objectivePair(m){const c=C[mode(m)];return c?{objective:c.objective(pageLabel(m)),criteria:c.criteria}:null;}
  function blueprint(m){const md=mode(m),c=C[md];if(!c)return null;const p=pageLabel(m),pair=objectivePair(m);return{method:'Aktiviti source-first berdasarkan RPT + DSKP + Buku Teks',pakDetail:`Isi aktiviti datang daripada tugasan sebenar pada ${p}; Activity Library hanya memvariasikan cara pelaksanaan.`,anchor:`${m.title||md} — ${p}`,kind:'source_task',bbmList:c.bbm,groupBbm:{support:c.bbm.join('; '),core:c.bbm.join('; '),challenge:c.bbm.join('; ')},mainSp:mainSp(m),page:p,topic:m.title||md,setInduksi:c.induction,inductionData:{name:'Set Induksi Sumber',text:c.induction,bbm:p,pak21:'Think-Pair-Share'},librarySteps:{support:c.support,core:c.core,challenge:c.challenge},diffSupport:'Tugasan sumber yang sama dengan petunjuk, rangka atau pengelasan lebih kecil.',diffCore:'Melaksanakan tugasan sebenar Buku Teks dan menyemak hasil dengan bukti halaman.',diffChallenge:'Melaksanakan tugasan yang sama secara lebih kendiri serta menjelaskan alasan atau menghasilkan respons lanjutan.',diffSupportAct:c.support.map(x=>x.text).join(' '),diffCoreAct:c.core.map(x=>x.text).join(' '),diffChallengeAct:c.challenge.map(x=>x.text).join(' '),pbdEvidence:{method:'Pemerhatian + hasil tugasan sumber + penerangan murid',evidence:'Hasil yang boleh disemak terus dengan halaman Buku Teks.',criterion:pair.criteria},penutup:c.close};}

  const originalEffective=window.effectiveRphLessonMap;
  if(typeof originalEffective==='function')window.effectiveRphLessonMap=function(map,ev,built){const out=originalEffective(map,ev,built)||map,pair=objectivePair(out);return pair?{...out,objective:pair.objective,success_criteria:pair.criteria,_runtime_bm_source_blueprint:true,_runtime_bm_source_mode:mode(out)}:out;};
  const originalPedagogy=window.buildSourceAwarePedagogy;
  if(typeof originalPedagogy==='function')window.buildSourceAwarePedagogy=function(map,ev,built){return blueprint(map)||originalPedagogy(map,ev,built);};
  window.bmYear1Unit21BlueprintMode=mode;
  window.bmYear1Unit21Blueprint=blueprint;
})();