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
    return ({'1.1.2@98':'teacher_message','2.2.1@99':'sink_float_inference','3.2.1@100':'body_words','3.2.1@101':'sense_phrases','5.3.1@102':'imperative_sentences'})[`${mainSp(m)}@${page(m)}`]||'';
  }

  const C={
    teacher_message:{
      objective:p=>`Pada akhir PdP, murid dapat mendengar, memahami dan memberikan respons terhadap sekurang-kurangnya tiga maklumat dalam pesanan pada ${p} dengan betul.`,
      criteria:'Murid menyatakan benda yang perlu dibawa, tujuan membawanya dan menyampaikan semula pesanan kepada rakan tanpa mengubah maklumat utama.',
      induction:'Guru menyampaikan satu pesanan ringkas secara lisan sekali sahaja. Murid menyebut maklumat yang masih diingati sebelum membandingkannya dengan pesanan Buku Teks.',
      support:[
        step('bm1-98-s1','Dengar dan Pilih','Guru membaca pesanan sumber secara perlahan. Murid memilih kad gambar batu kecil, gelas plastik, duit syiling, penyedut minuman dan tudung botol apabila disebut.','Buku Teks m/s 98; kad gambar','Listening Support'),
        step('bm1-98-s2','Sampaikan dengan Rangka','Murid menggunakan rangka “Esok kita perlu bawa __ kerana kita akan __.” untuk menyampaikan semula pesanan kepada pasangan.','kad rangka ayat','Guided Role Play')
      ],
      core:[
        step('bm1-98-c1','Tangkap Pesanan','Murid mendengar pesanan tentang bahan yang perlu dibawa untuk uji kaji lalu mencatat atau memilih maklumat penting tanpa melihat kad jawapan.','Buku Teks m/s 98; kad nota','Listen-and-Note'),
        step('bm1-98-c2','Rantaian Pesanan','Secara berpasangan, murid menyampaikan semula pesanan. Rakan menyemak senarai benda dan tujuan pesanan dengan halaman sumber.','Buku Teks m/s 98; senarai semak','Role Play')
      ],
      challenge:[
        step('bm1-98-h1','Pesanan Tanpa Petunjuk','Murid menyampaikan semula pesanan lengkap tanpa kad rangka dan mengekalkan semua maklumat utama.','Buku Teks m/s 98','Independent Speaking'),
        step('bm1-98-h2','Semak Ketepatan','Murid membandingkan pesanan rakan dengan sumber dan mengenal pasti satu maklumat yang tepat atau perlu dibetulkan.','senarai semak','Peer Verification')
      ],
      close:'Murid menyebut dua benda yang perlu dibawa dan tujuan aktiviti berdasarkan pesanan.',
      bbm:['Buku Teks m/s 98','kad gambar bahan','senarai semak pesanan']
    },
    sink_float_inference:{
      objective:p=>`Pada akhir PdP, murid dapat menyatakan sekurang-kurangnya dua idea tersirat berdasarkan teks dan grafik tentang objek tenggelam dan timbul pada ${p}.`,
      criteria:'Murid mengenal pasti hasil uji kaji dalam teks dan membuat sekurang-kurangnya dua kesimpulan tersirat yang disokong oleh maklumat grafik atau ayat sumber.',
      induction:'Guru menunjukkan dua kad keputusan: “duit syiling tenggelam” dan “tudung botol timbul”. Murid meneka pola yang boleh dirumus daripada hasil tersebut.',
      support:[
        step('bm1-99-s1','Asingkan Hasil','Murid memadankan objek kepada dua lajur “tenggelam” dan “timbul” berdasarkan keputusan yang dinyatakan dalam teks.','Buku Teks m/s 99; kad objek','Classification'),
        step('bm1-99-s2','Lengkapkan Kesimpulan','Murid melengkapkan ayat berpandu seperti “Objek yang ringan pula akan __” menggunakan bukti pada halaman.','rangka kesimpulan','Guided Inference')
      ],
      core:[
        step('bm1-99-c1','Baca Bukti Uji Kaji','Pasangan membaca teks dan mengenal pasti keputusan bagi batu, duit syiling, penyedut minuman dan tudung botol.','Buku Teks m/s 99; penanda teks','Pair Reading'),
        step('bm1-99-c2','Bukti → Idea Tersirat','Murid menggunakan keputusan sumber untuk menyatakan idea tersirat, kemudian menunjukkan ayat atau grafik yang menjadi asas kesimpulan.','lembaran bukti–inferens','Evidence Reasoning')
      ],
      challenge:[
        step('bm1-99-h1','Uji Kesimpulan','Murid menilai sama ada satu kesimpulan benar-benar disokong oleh semua contoh pada halaman dan menerangkan sebabnya.','Buku Teks m/s 99','Critical Reading'),
        step('bm1-99-h2','Bina Ayat Inferens','Murid menulis satu ayat inferens menggunakan kata “berdasarkan hasil ini…” tanpa menambah fakta di luar sumber.','lembaran inferens','Reasoning Writing')
      ],
      close:'Murid menyatakan satu hasil uji kaji dan satu idea tersirat yang diperoleh daripadanya.',
      bbm:['Buku Teks m/s 99','kad objek','lembaran bukti–inferens']
    },
    body_words:{
      objective:p=>`Pada akhir PdP, murid dapat membina dan menulis sekurang-kurangnya empat perkataan anggota badan berdasarkan bahan pada ${p} dengan betul.`,
      criteria:'Murid melabel kepala, badan, tangan dan kaki dengan ejaan yang betul serta memadankan sekurang-kurangnya empat label kepada bahagian yang tepat.',
      induction:'Guru menunjukkan siluet badan manusia dan meminta murid menamakan bahagian utama yang diketahui.',
      support:[
        step('bm1-100-s1','Padan Label','Murid memadankan kad perkataan kepala, badan, tangan dan kaki pada gambar yang betul.','Buku Teks m/s 100; kad label','Matching'),
        step('bm1-100-s2','Salin dengan Semak','Murid menyalin empat perkataan dan menyemak ejaan huruf demi huruf bersama guru atau pasangan.','kad ejaan; lembaran','Guided Writing')
      ],
      core:[
        step('bm1-100-c1','Label Sendiri','Murid meneliti gambar dan menulis sendiri label kepala, badan, tangan dan kaki pada nombor yang sesuai.','Buku Teks m/s 100','Independent Labeling'),
        step('bm1-100-c2','Semak Peta Badan','Pasangan bertukar lembaran dan menyemak kedudukan label serta ejaan setiap perkataan dengan Buku Teks.','lembaran label; Buku Teks','Peer Check')
      ],
      challenge:[
        step('bm1-100-h1','Tanpa Bank Kata','Murid menulis semua label tanpa melihat bank kata, kemudian menyemak semula dengan sumber.','Buku Teks m/s 100','Recall Writing'),
        step('bm1-100-h2','Kelas Kata Mudah','Murid memilih satu label dan membina satu frasa mudah yang berkaitan dengan anggota tersebut tanpa mengubah fokus utama latihan perkataan.','kad frasa','Extension')
      ],
      close:'Murid mengeja satu perkataan anggota badan dan menunjukkan bahagian yang betul.',
      bbm:['Buku Teks m/s 100','kad label','gambar/siluet badan']
    },
    sense_phrases:{
      objective:p=>`Pada akhir PdP, murid dapat membina dan menulis sekurang-kurangnya empat frasa deria berdasarkan bahan pada ${p} dengan betul.`,
      criteria:'Murid melengkapkan sekurang-kurangnya empat pasangan anggota deria–fungsi menggunakan frasa yang tepat seperti deria bau, deria dengar, deria rasa dan deria sentuh.',
      induction:'Guru menunjukkan kad mata, hidung, telinga, lidah dan tangan. Murid memadankan secara lisan satu anggota dengan satu fungsi deria.',
      support:[
        step('bm1-101-s1','Padan Anggota–Deria','Murid memadankan anggota dengan kad frasa deria dengar, deria sentuh, deria rasa dan deria bau berdasarkan ayat sumber.','Buku Teks m/s 101; kad frasa','Matching'),
        step('bm1-101-s2','Lengkap Ruang','Murid memilih frasa yang sesuai untuk melengkapkan ayat pada halaman sebelum menyalinnya dengan ejaan yang betul.','lembaran berpandu','Guided Writing')
      ],
      core:[
        step('bm1-101-c1','Baca Ayat, Cari Frasa','Murid membaca setiap ayat berkaitan mata, hidung, telinga, lidah dan tangan lalu menentukan frasa deria yang sesuai.','Buku Teks m/s 101','Context Reading'),
        step('bm1-101-c2','Bina dan Tulis Frasa','Murid menulis frasa yang tepat pada ruang kosong dan bertukar hasil dengan pasangan untuk menyemak berdasarkan bank kata pada halaman.','Buku Teks m/s 101; senarai semak','Peer Review')
      ],
      challenge:[
        step('bm1-101-h1','Tulis Tanpa Bank Kata','Murid melengkapkan frasa daripada ingatan sebelum menyemak dengan bank kata sumber.','Buku Teks m/s 101','Recall Writing'),
        step('bm1-101-h2','Pasang Semula Ayat','Murid memilih dua frasa dan menggunakannya dalam ayat mudah yang masih menepati fungsi anggota deria.','kad ayat','Sentence Extension')
      ],
      close:'Murid menyebut satu anggota dan frasa deria yang sesuai dengannya.',
      bbm:['Buku Teks m/s 101','kad anggota','kad frasa deria']
    },
    imperative_sentences:{
      objective:p=>`Pada akhir PdP, murid dapat mengenal pasti dan membina sekurang-kurangnya tiga ayat perintah berdasarkan gambar dan dialog pada ${p} dengan betul.`,
      criteria:'Murid mengenal pasti tujuan ayat perintah dan menggunakan sekurang-kurangnya tiga bentuk seperti sila, tolong atau jangan dalam konteks yang sesuai.',
      induction:'Guru menunjukkan tiga kad “Sila…”, “Tolong…” dan “Jangan…”. Murid meneka situasi yang sesuai bagi setiap kata perintah.',
      support:[
        step('bm1-102-s1','Warna Kata Perintah','Murid menandakan kata “sila”, “tolong” dan “jangan” dalam dialog Sains Perubatan menggunakan warna berbeza.','Buku Teks m/s 102; penanda warna','Grammar Discovery'),
        step('bm1-102-s2','Padan Ayat–Situasi','Murid memadankan ayat perintah sumber dengan gambar doktor, bilik rawatan atau kaunter ubat yang sesuai.','kad ayat; gambar sumber','Matching')
      ],
      core:[
        step('bm1-102-c1','Jejak Ayat Perintah','Pasangan membaca dialog dan mengelaskan ayat kepada permintaan sopan, arahan atau larangan berdasarkan kata perintah yang digunakan.','Buku Teks m/s 102; jadual klasifikasi','Pair Analysis'),
        step('bm1-102-c2','Doktor Berkata','Guru menunjukkan satu situasi gambar; murid membina ayat perintah yang sesuai. Mata hanya diberi jika kata perintah dan konteks sepadan.','kad situasi','Game-Based Learning')
      ],
      challenge:[
        step('bm1-102-h1','Ubah Bentuk Perintah','Murid menukar satu situasi kepada dua ayat perintah berbeza, contohnya menggunakan “sila” dan “tolong”, kemudian menerangkan perbezaan nada.','Buku Teks m/s 102','Grammar Reasoning'),
        step('bm1-102-h2','Semak Kesantunan','Murid menilai sama ada ayat rakan sesuai dan bertatasusila untuk situasi klinik yang diberikan.','kad semak','Peer Reasoning')
      ],
      close:'Murid membina satu ayat perintah lisan menggunakan “sila”, “tolong” atau “jangan” dengan konteks yang sesuai.',
      bbm:['Buku Teks m/s 102','kad kata perintah','kad situasi']
    }
  };

  function objectivePair(m){const c=C[mode(m)];return c?{objective:c.objective(pageLabel(m)),criteria:c.criteria}:null;}
  function blueprint(m){
    const md=mode(m),c=C[md];if(!c)return null;const p=pageLabel(m),pair=objectivePair(m);
    const discrepancy=md==='imperative_sentences'?'RPT asal pernah mencatat rujukan halaman yang tersasar; blueprint menggunakan halaman Buku Teks m/s 102 yang telah disahkan dalam mapping sumber tanpa mengubah Lesson Map.':'';
    return {method:'Aktiviti source-first berdasarkan RPT + DSKP + Buku Teks',pakDetail:`Isi aktiviti datang daripada tugasan sebenar pada ${p}; Activity Library hanya memvariasikan cara pelaksanaan tanpa mengganti tugasan sumber.`,anchor:`${m.title||md} — ${p}`,kind:'source_task',bbmList:c.bbm,groupBbm:{support:c.bbm.join('; '),core:c.bbm.join('; '),challenge:c.bbm.join('; ')},mainSp:mainSp(m),page:p,topic:m.title||md,setInduksi:c.induction,inductionData:{name:'Set Induksi Sumber',text:c.induction,bbm:p,pak21:'Think-Pair-Share'},librarySteps:{support:c.support,core:c.core,challenge:c.challenge},diffSupport:'Tugasan halaman yang sama dengan kad petunjuk, rangka atau pilihan terhad.',diffCore:'Melaksanakan tugasan Buku Teks sebenar dan menyemak hasil dengan bukti halaman.',diffChallenge:'Melaksanakan tugasan yang sama secara lebih kendiri serta menerangkan alasan atau bukti.',diffSupportAct:c.support.map(x=>x.text).join(' '),diffCoreAct:c.core.map(x=>x.text).join(' '),diffChallengeAct:c.challenge.map(x=>x.text).join(' '),pbdEvidence:{method:'Pemerhatian + hasil tugasan sumber + penerangan murid',evidence:'Respons lisan, inferens, label, frasa atau ayat yang boleh disemak terus dengan Buku Teks.',criterion:pair.criteria},penutup:c.close,sourceDiscrepancy:discrepancy};
  }

  const originalEffective=window.effectiveRphLessonMap;
  if(typeof originalEffective==='function')window.effectiveRphLessonMap=function(map,ev,built){const out=originalEffective(map,ev,built)||map,pair=objectivePair(out);if(!pair)return out;return {...out,objective:pair.objective,success_criteria:pair.criteria,_runtime_bm_unit16_source_blueprint:true,_runtime_bm_unit16_mode:mode(out)};};
  const originalPedagogy=window.buildSourceAwarePedagogy;
  if(typeof originalPedagogy==='function')window.buildSourceAwarePedagogy=function(map,ev,built){const out=blueprint(map);return out||originalPedagogy(map,ev,built);};
  window.bmYear1Unit16BlueprintMode=mode;
  window.bmYear1Unit16Blueprint=blueprint;
})();
