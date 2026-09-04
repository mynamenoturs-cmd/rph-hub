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
      '1.1.2@118':'waste_response',
      '2.3.1@119':'river_song',
      '3.2.2@120':'focused_answers',
      '5.2.2@121':'compound_words',
      '5.2.3@122':'reduplication'
    })[`${mainSp(m)}@${page(m)}`]||'';
  }

  const C={
    waste_response:{
      objective:p=>`Pada akhir PdP, murid dapat memberikan sekurang-kurangnya tiga respons lisan yang sesuai terhadap soalan berdasarkan bahan pada ${p}.`,
      criteria:'Murid menjawab soalan tentang sebab dan cara mengurus sampah menggunakan maklumat pada gambar serta urutan yang sesuai.',
      induction:'Guru menunjukkan dua gambar keadaan rumah bersih dan kawasan berselerak. Murid memilih keadaan yang lebih baik dan memberikan sebab ringkas.',
      support:[
        step('bm1-u19-118-s1','Susun Cara Urus Sampah','Murid menyusun kad gambar urutan seperti mengasingkan sampah mengikut jenis dan mengikat beg sebelum membuangnya.','Buku Teks m/s 118; kad gambar urutan','Sequencing'),
        step('bm1-u19-118-s2','Jawab dengan Rangka','Dengan rangka “Kita perlu… kerana…” dan “Mula-mula… kemudian…”, murid memberikan respons terhadap soalan berdasarkan bahan.','kad rangka ayat; gambar sumber','Guided Speaking')
      ],
      core:[
        step('bm1-u19-118-c1','Soalan Mengapa dan Bagaimana','Secara berpasangan, murid meneliti dialog dan gambar pada Buku Teks m/s 118 lalu menjawab soalan tentang sebab membuang sampah serta cara menguruskannya.','Buku Teks m/s 118','Think-Pair-Share'),
        step('bm1-u19-118-c2','Respons Bergilir','Seorang murid menjadi penanya dan seorang lagi memberikan respons lengkap berdasarkan bahan. Mereka bertukar peranan dan menyemak sama ada jawapan benar-benar disokong oleh halaman sumber.','kad soalan; Buku Teks m/s 118','Role Rotation')
      ],
      challenge:[
        step('bm1-u19-118-h1','Respons Tanpa Rangka','Murid menjawab soalan berdasarkan bahan tanpa kad rangka dan menggunakan kata urutan yang sesuai.','Buku Teks m/s 118','Independent Speaking'),
        step('bm1-u19-118-h2','Tambah Sebab','Murid memberikan satu alasan tambahan yang munasabah tentang kepentingan mengurus sampah tanpa mengubah maklumat utama halaman.','kad alasan','Reasoning Talk')
      ],
      close:'Murid melengkapkan secara lisan satu ayat tentang sebab rumah perlu bersih dan satu langkah mengurus sampah.',
      bbm:['Buku Teks m/s 118','kad gambar urutan','kad soalan']
    },
    river_song:{
      objective:p=>`Pada akhir PdP, murid dapat menyatakan sekurang-kurangnya tiga maklumat daripada seni kata lagu pada ${p} sambil membuat gerakan yang sepadan.`,
      criteria:'Murid mengenal pasti sekurang-kurangnya tiga maklumat daripada lagu dan memadankan setiap maklumat dengan gerakan yang sesuai.',
      induction:'Guru menunjukkan gambar aliran sungai dari kawasan tinggi ke laut. Murid meneka arah aliran dan perkara yang mungkin berlaku sepanjang perjalanan air.',
      support:[
        step('bm1-u19-119-s1','Cari Kata Kunci Lagu','Guru membimbing murid menandakan kata atau frasa penting pada seni kata lagu tanpa menyalin keseluruhan lagu.','Buku Teks m/s 119; kad kata kunci','Guided Reading'),
        step('bm1-u19-119-s2','Padan Maklumat dengan Gerakan','Murid memilih kad gerakan mudah yang sesuai dengan maklumat utama seperti aliran sungai atau peredaran masa.','kad gerakan; Buku Teks m/s 119','Kinesthetic Matching')
      ],
      core:[
        step('bm1-u19-119-c1','Baca, Faham, Pilih Maklumat','Secara kumpulan kecil, murid membaca seni kata pada Buku Teks m/s 119 dan memilih tiga maklumat utama yang dapat dinyatakan semula dengan kata sendiri.','Buku Teks m/s 119; kad catatan','Collaborative Reading'),
        step('bm1-u19-119-c2','Gerak dan Nyata','Kumpulan mempersembahkan gerakan yang sepadan dengan maklumat terpilih. Selepas setiap gerakan, seorang ahli menyatakan maklumat yang diwakili.','Buku Teks m/s 119','Kinesthetic Presentation')
      ],
      challenge:[
        step('bm1-u19-119-h1','Maklumat Tanpa Kad','Murid menyatakan tiga maklumat daripada seni kata dengan bahasa sendiri tanpa kad petunjuk.','Buku Teks m/s 119','Independent Response'),
        step('bm1-u19-119-h2','Jelaskan Hubungan Gerakan','Murid menerangkan mengapa satu gerakan sesuai untuk mewakili maklumat tertentu daripada lagu.','kad refleksi','Reasoning Talk')
      ],
      close:'Murid menyebut satu maklumat daripada lagu dan menunjukkan satu gerakan yang sepadan.',
      bbm:['Buku Teks m/s 119','kad kata kunci','kad gerakan']
    },
    focused_answers:{
      objective:p=>`Pada akhir PdP, murid dapat membina dan menulis sekurang-kurangnya empat jawapan bertumpu berdasarkan petikan pada ${p} dengan betul.`,
      criteria:'Murid menjawab soalan apa, di mana, bila dan berapa menggunakan maklumat tepat daripada petikan serta menulis jawapan dalam ayat yang lengkap.',
      induction:'Guru menunjukkan empat kad kata tanya: apa, di mana, bila dan berapa. Murid memadankan setiap kad dengan jenis maklumat yang perlu dicari.',
      support:[
        step('bm1-u19-120-s1','Cari Jawapan Berwarna','Murid menandakan empat jenis maklumat dalam petikan menggunakan kod simbol atau warna: benda, tempat, masa dan bilangan.','Buku Teks m/s 120; penanda simbol','Guided Scanning'),
        step('bm1-u19-120-s2','Lengkapkan Jawapan','Murid melengkapkan rangka ayat bagi soalan bertumpu menggunakan maklumat yang telah ditandakan.','rangka jawapan; Buku Teks m/s 120','Guided Writing')
      ],
      core:[
        step('bm1-u19-120-c1','Baca dan Jejak Bukti','Murid membaca petikan Kolam Ikan Indira, menjawab empat soalan bertumpu dan menggariskan ayat sumber yang menyokong setiap jawapan.','Buku Teks m/s 120; lembaran jawapan','Evidence Reading'),
        step('bm1-u19-120-c2','Semak Empat Kata Tanya','Pasangan menyemak sama ada jawapan untuk apa, di mana, bila dan berapa menepati soalan serta maklumat dalam petikan.','lembaran jawapan; kad semak','Pair Check')
      ],
      challenge:[
        step('bm1-u19-120-h1','Jawab dalam Ayat Lengkap','Murid menulis semua jawapan tanpa rangka dan memastikan setiap respons menjadi ayat yang lengkap.','Buku Teks m/s 120','Independent Writing'),
        step('bm1-u19-120-h2','Bina Satu Soalan Baru','Murid membina satu soalan bertumpu baharu berdasarkan maklumat lain dalam petikan dan memberikan jawapannya.','kad soalan','Question Generation')
      ],
      close:'Guru membaca satu kata tanya secara rawak dan murid menyatakan jenis maklumat yang perlu dicari dalam teks.',
      bbm:['Buku Teks m/s 120','kad kata tanya','lembaran jawapan']
    },
    compound_words:{
      objective:p=>`Pada akhir PdP, murid dapat mengenal pasti dan menggunakan sekurang-kurangnya empat kata majmuk daripada konteks pada ${p} dalam ayat yang betul.`,
      criteria:'Murid mengenal pasti kata majmuk rangkai kata bebas dalam bahan dan membina sekurang-kurangnya tiga ayat yang sesuai dengan konteks kegunaan rumput.',
      induction:'Guru memaparkan dua kad perkataan yang apabila digabungkan membentuk satu rangkai kata bermakna, lalu murid meneka contoh lain daripada halaman sumber.',
      support:[
        step('bm1-u19-121-s1','Cantum Dua Kad','Murid memadankan kad perkataan untuk membentuk kata majmuk yang terdapat dalam bahan seperti taman bunga atau padang bola.','Buku Teks m/s 121; kad perkataan','Word Matching'),
        step('bm1-u19-121-s2','Lengkapkan Ayat','Murid melengkapkan ayat berdasarkan gambar menggunakan kata majmuk yang telah dipadankan.','kad ayat; gambar sumber','Guided Grammar')
      ],
      core:[
        step('bm1-u19-121-c1','Jejak Kata Majmuk','Murid meneliti bahan pada Buku Teks m/s 121 dan menyenaraikan kata majmuk yang digunakan untuk menerangkan lokasi atau kegunaan rumput.','Buku Teks m/s 121','Text Mining'),
        step('bm1-u19-121-c2','Bina Ayat Konteks','Murid membina sekurang-kurangnya tiga ayat baharu menggunakan kata majmuk yang sama dan memastikan ayat masih sesuai dengan konteks halaman.','lembaran ayat','Think-Write-Pair')
      ],
      challenge:[
        step('bm1-u19-121-h1','Kategori Kata Majmuk','Murid mengelaskan kata majmuk mengikut kegunaan, tempat atau jenis objek dalam konteks halaman.','kad kategori','Classification'),
        step('bm1-u19-121-h2','Ayat Tanpa Rangka','Murid membina ayat sendiri menggunakan sekurang-kurangnya empat kata majmuk tanpa rangka ayat.','lembaran ayat','Independent Writing')
      ],
      close:'Murid menyebut satu kata majmuk dan menggunakannya dalam satu ayat ringkas.',
      bbm:['Buku Teks m/s 121','kad perkataan','lembaran ayat']
    },
    reduplication:{
      objective:p=>`Pada akhir PdP, murid dapat mengenal pasti sekurang-kurangnya lima kata ganda daripada teks pada ${p} dan membina sekurang-kurangnya tiga ayat yang betul.`,
      criteria:'Murid mengecam kata ganda dalam teks Kebun Mini dan menggunakan sekurang-kurangnya tiga daripadanya dalam ayat mengikut konteks.',
      induction:'Guru menunjukkan pasangan kad kata biasa dan kata ganda. Murid mengenal perbezaan bentuk kedua-duanya.',
      support:[
        step('bm1-u19-122-s1','Cari Kata Berulang','Murid menandakan kata ganda dalam petikan menggunakan bantuan kad contoh.','Buku Teks m/s 122; kad contoh','Guided Identification'),
        step('bm1-u19-122-s2','Padan dengan Gambar','Murid memadankan kata ganda seperti yang merujuk siput, daun, kayu, pokok atau cili dengan gambar yang sesuai.','kad kata ganda; gambar','Matching')
      ],
      core:[
        step('bm1-u19-122-c1','Pemburu Kata Ganda','Secara berpasangan, murid membaca petikan Kebun Mini dan menyenaraikan semua kata ganda yang ditemui.','Buku Teks m/s 122; senarai catatan','Pair Reading'),
        step('bm1-u19-122-c2','Bina Ayat Kata Ganda','Murid memilih sekurang-kurangnya tiga kata ganda daripada teks dan membina ayat baharu yang masih sesuai dengan konteks kebun.','lembaran ayat','Think-Write')
      ],
      challenge:[
        step('bm1-u19-122-h1','Ubah Bentuk, Ubah Makna','Murid membandingkan bentuk tunggal dan kata ganda yang terdapat dalam teks serta menerangkan perubahan makna secara mudah.','kad pasangan kata','Language Reasoning'),
        step('bm1-u19-122-h2','Ayat Pelbagai Kata Ganda','Murid membina ayat menggunakan lebih daripada satu kata ganda dengan struktur yang masih jelas dan betul.','lembaran ayat','Challenge Writing')
      ],
      close:'Murid menyebut satu kata ganda daripada teks dan satu ayat yang menggunakan kata tersebut.',
      bbm:['Buku Teks m/s 122','kad kata ganda','gambar kebun']
    }
  };

  function objectivePair(m){const c=C[mode(m)];return c?{objective:c.objective(pageLabel(m)),criteria:c.criteria}:null;}
  function blueprint(m){
    const md=mode(m),c=C[md];if(!c)return null;const p=pageLabel(m),pair=objectivePair(m);
    return {method:'Aktiviti source-first berdasarkan RPT + DSKP + Buku Teks',pakDetail:`Isi aktiviti datang daripada tugasan sebenar pada ${p}; Activity Library hanya memvariasikan cara pelaksanaan.`,anchor:`${m.title||md} — ${p}`,kind:'source_task',bbmList:c.bbm,groupBbm:{support:c.bbm.join('; '),core:c.bbm.join('; '),challenge:c.bbm.join('; ')},mainSp:mainSp(m),page:p,topic:m.title||md,setInduksi:c.induction,inductionData:{name:'Set Induksi Sumber',text:c.induction,bbm:p,pak21:'Think-Pair-Share'},librarySteps:{support:c.support,core:c.core,challenge:c.challenge},diffSupport:'Tugasan sumber yang sama dengan petunjuk, rangka atau pilihan terhad.',diffCore:'Melaksanakan tugasan sebenar Buku Teks dan menyemak jawapan dengan bukti halaman.',diffChallenge:'Melaksanakan tugasan yang sama secara kendiri serta menjelaskan alasan atau bukti.',diffSupportAct:c.support.map(x=>x.text).join(' '),diffCoreAct:c.core.map(x=>x.text).join(' '),diffChallengeAct:c.challenge.map(x=>x.text).join(' '),pbdEvidence:{method:'Pemerhatian + hasil tugasan sumber + penerangan murid',evidence:'Respons lisan/tulisan yang boleh disemak terus dengan halaman Buku Teks.',criterion:pair.criteria},penutup:c.close};
  }

  const originalEffective=window.effectiveRphLessonMap;
  if(typeof originalEffective==='function')window.effectiveRphLessonMap=function(map,ev,built){const out=originalEffective(map,ev,built)||map,pair=objectivePair(out);return pair?{...out,objective:pair.objective,success_criteria:pair.criteria,_runtime_bm_source_blueprint:true,_runtime_bm_source_mode:mode(out)}:out;};
  const originalPedagogy=window.buildSourceAwarePedagogy;
  if(typeof originalPedagogy==='function')window.buildSourceAwarePedagogy=function(map,ev,built){return blueprint(map)||originalPedagogy(map,ev,built);};
  window.bmYear1Unit19BlueprintMode=mode;
  window.bmYear1Unit19Blueprint=blueprint;
})();