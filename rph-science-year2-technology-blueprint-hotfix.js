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
    if(sp(m)==='10.1.1'&&pg(m)>=117&&pg(m)<=119)return 'choose';
    if(sp(m)==='10.1.2'&&pg(m)>=120&&pg(m)<=121)return 'identify';
    if(sp(m)==='10.1.3'&&pg(m)>=122&&pg(m)<=124)return 'assemble';
    if(sp(m)==='10.1.4'&&(pg(m)===124||pg(m)===125))return 'create';
    if(sp(m)==='10.1.5'&&pg(m)>=126&&pg(m)<=128)return 'dismantle';
    return '';
  }

  function pair(m){
    const p=label(m);
    switch(mode(m)){
      case 'choose':return {objective:`Pada akhir PdP, murid dapat memilih satu binaan daripada set binaan dan menyatakan komponen utama yang diperlukan berpandukan ${p}.`,criteria:'Murid memilih satu model yang jelas, merujuk manual bergambar dan menyenaraikan sekurang-kurangnya tiga komponen yang diperlukan sebelum pembinaan.'};
      case 'identify':return {objective:`Pada akhir PdP, murid dapat mengenal pasti sekurang-kurangnya empat komponen binaan dengan berpandukan manual bergambar pada ${p}.`,criteria:'Murid memadankan sekurang-kurangnya empat komponen sebenar dengan gambar atau label dalam manual dan memilih komponen yang betul untuk model.'};
      case 'assemble':return {objective:`Pada akhir PdP, murid dapat memasang satu model menggunakan komponen set binaan mengikut urutan manual bergambar pada ${p}.`,criteria:'Murid mengikuti urutan manual, memilih komponen yang betul, menyiapkan binaan yang stabil dan menerangkan sekurang-kurangnya satu langkah utama.'};
      case 'create':return {objective:`Pada akhir PdP, murid dapat mencipta satu binaan baharu yang tidak terdapat dalam manual dan menerangkan sekurang-kurangnya satu fungsi binaan tersebut berdasarkan ${p}.`,criteria:'Murid menghasilkan binaan baharu yang boleh berdiri atau berfungsi seperti dirancang, menggunakan komponen set dengan sesuai dan menerangkan fungsi ciptaan.'};
      case 'dismantle':return {objective:`Pada akhir PdP, murid dapat membuka hasil binaan mengikut urutan dan menyimpan semua komponen ke dalam bekas yang betul berpandukan ${p}.`,criteria:'Murid membuka binaan tanpa merosakkan komponen, mengasingkan komponen mengikut jenis dan memastikan semua komponen dikembalikan ke bekas penyimpanan.'};
      default:return null;
    }
  }

  function blueprint(m,btRef){
    const p=btRef||label(m),md=mode(m),common=`${p}; set binaan; manual bergambar; dulang komponen; kad semak; bekas penyimpanan`;
    const maps={
      choose:{topic:'Pilih Binaan Saya',support:[
        step('source-y2-tech-choose-s1','Lihat Pilihan Model','Murid meneliti dua atau tiga model dalam manual bergambar dan menunjuk satu binaan yang ingin dibuat.',common,'Guided Choice'),
        step('source-y2-tech-choose-s2','Cari Komponen Utama','Dengan bimbingan guru, murid mencari sekurang-kurangnya tiga komponen yang ditunjukkan dalam manual untuk model pilihan.','manual; set binaan; dulang komponen','Matching'),
        step('source-y2-tech-choose-s3','Semak Sebelum Mula','Pasangan menyemak model pilihan dan komponen menggunakan kad semak sebelum pembinaan dimulakan.','kad semak; komponen','Pair Check')],core:[
        step('source-y2-tech-choose-c1','Banding Dua Binaan','Kumpulan membandingkan dua model dalam manual dari segi bentuk dan komponen yang diperlukan sebelum memilih satu.','manual bergambar; kad perbandingan','Compare-and-Contrast'),
        step('source-y2-tech-choose-c2','Senarai Komponen','Murid menyediakan senarai komponen bagi binaan yang dipilih dan mengumpulkan komponen di dalam dulang kumpulan.','manual; set binaan; dulang','Planning'),
        step('source-y2-tech-choose-c3','Justifikasi Pilihan','Murid menerangkan mengapa model itu dipilih dan menunjukkan komponen yang menyokong pilihan.','model pilihan; komponen','Think-Pair-Share')],challenge:[
        step('source-y2-tech-choose-h1','Rancang Tanpa Ambil Berlebihan','Murid mengira anggaran komponen yang diperlukan berdasarkan manual sebelum mengambil komponen.','manual; lembaran perancangan','Resource Planning'),
        step('source-y2-tech-choose-h2','Semak Risiko Reka Bentuk','Murid mengenal pasti satu bahagian model yang mungkin memerlukan sokongan lebih kukuh dan mencadangkan cara memasang dengan stabil.','manual; kad idea','Design Thinking'),
        step('source-y2-tech-choose-h3','Terangkan Pelan','Murid membentangkan model, komponen utama dan urutan awal pembinaan secara ringkas.','pelan murid','Mini Presentation')]},
      identify:{topic:'Kenali Komponen',support:[
        step('source-y2-tech-id-s1','Padan Gambar dan Komponen','Murid memadankan empat komponen sebenar dengan gambar yang sama dalam manual.',common,'Matching'),
        step('source-y2-tech-id-s2','Cari Ikut Arahan','Guru menyebut satu komponen dan murid mencarinya pada manual dahulu sebelum memilih komponen sebenar.','manual; set binaan','Guided Discovery'),
        step('source-y2-tech-id-s3','Semak Empat Komponen','Pasangan menyemak nama atau bentuk empat komponen menggunakan kad semak.','kad semak; komponen','Pair Check')],core:[
        step('source-y2-tech-id-c1','Detektif Manual','Murid mengenal pasti simbol atau gambar komponen pada satu langkah manual dan mencari komponen sebenar yang sepadan.',common,'Visual Literacy'),
        step('source-y2-tech-id-c2','Susun Mengikut Jenis','Kumpulan mengasingkan komponen yang diperlukan mengikut jenis atau bentuk supaya mudah digunakan semasa pemasangan.','dulang komponen; label kategori','Classification'),
        step('source-y2-tech-id-c3','Komponen Mana Hilang?','Guru menutup satu komponen dalam set contoh. Kumpulan menggunakan manual untuk menentukan komponen yang hilang.','manual; set contoh','Game-Based Learning')],challenge:[
        step('source-y2-tech-id-h1','Cari Pengganti Sesuai','Murid mengenal pasti dua komponen yang hampir sama dan menerangkan mengapa hanya satu sesuai dengan langkah manual.','manual; komponen serupa','Compare-and-Contrast'),
        step('source-y2-tech-id-h2','Bina Inventori Mini','Murid merekod nama/ciri komponen dan kuantiti yang digunakan dalam model.','lembaran inventori','Data Recording'),
        step('source-y2-tech-id-h3','Semak Rakan','Murid mengaudit dulang komponen kumpulan lain berdasarkan satu halaman manual.','manual; dulang rakan; senarai semak','Peer Review')]},
      assemble:{topic:'Jurutera Cilik',support:[
        step('source-y2-tech-asm-s1','Ikut Satu Langkah Sekali','Guru membimbing murid membaca satu gambar langkah, memilih komponen dan memasang sebelum bergerak ke langkah seterusnya.',common,'Guided Construction'),
        step('source-y2-tech-asm-s2','Semak Selepas Tiga Langkah','Murid berhenti selepas beberapa langkah dan membandingkan binaan dengan gambar manual.','manual; binaan murid','Checkpoint'),
        step('source-y2-tech-asm-s3','Uji Kestabilan','Murid memastikan binaan tidak mudah terlerai dan membetulkan sambungan yang longgar.','binaan murid; kad semak','Pair Check')],core:[
        step('source-y2-tech-asm-c1','Baca-Susun-Pasang','Kumpulan membaca satu langkah manual, menyusun komponen yang diperlukan dan memasang mengikut urutan tanpa melangkau langkah.',common,'Cooperative Construction'),
        step('source-y2-tech-asm-c2','Jurutera Cilik','Murid menyiapkan model berpandukan manual bergambar dan menandakan setiap langkah yang telah selesai.','manual; set binaan; penanda langkah','Hands-on Build'),
        step('source-y2-tech-asm-c3','Audit Model','Pasangan membandingkan model siap dengan gambar manual dan mengenal pasti satu pembetulan jika ada.','model; manual; kad audit','Peer Review')],challenge:[
        step('source-y2-tech-asm-h1','Bina dengan Rujukan Minimum','Murid melihat setiap langkah hanya apabila perlu dan cuba mengingati urutan sambungan antara semakan.','manual; set binaan','Independent Build'),
        step('source-y2-tech-asm-h2','Catat Langkah Kritikal','Murid memilih dua langkah yang paling penting untuk kestabilan model dan menerangkan sebabnya.','lembaran refleksi; model','Evidence Talk'),
        step('source-y2-tech-asm-h3','Bantu Tanpa Memasang','Murid memberi arahan lisan kepada rakan yang menghadapi masalah tanpa memasang model rakan.','model rakan; manual','Peer Coaching')]},
      create:{topic:'Saya Kreatif',support:[
        step('source-y2-tech-create-s1','Ubah Satu Bahagian','Murid mengubah satu bahagian model sedia ada dengan komponen lain untuk menghasilkan bentuk baharu.','set binaan; model contoh; kad idea','Guided Design'),
        step('source-y2-tech-create-s2','Nyatakan Fungsi','Murid memilih fungsi mudah bagi binaan baharu dan melengkapkan ayat “Binaan saya digunakan untuk ___.”','rangka ayat; binaan','Design Talk'),
        step('source-y2-tech-create-s3','Semak Boleh Berdiri','Murid menguji kestabilan binaan dan membetulkan sambungan yang longgar.','binaan; kad semak','Pair Check')],core:[
        step('source-y2-tech-create-c1','Lakar Idea Baharu','Murid melakar binaan yang tidak terdapat dalam manual dan melabel komponen utama sebelum membina.','kertas lakaran; set binaan','Design Thinking'),
        step('source-y2-tech-create-c2','Bina dan Uji','Murid membina ciptaan sendiri, menguji kestabilan atau fungsi dan membuat sekurang-kurangnya satu penambahbaikan.','set binaan; kad ujian','Prototype-Test-Improve'),
        step('source-y2-tech-create-c3','Pamer Fungsi','Kumpulan mempamerkan binaan dan menerangkan fungsi serta satu keputusan ujian kepada rakan.','binaan; kad fungsi','Gallery Walk')],challenge:[
        step('source-y2-tech-create-h1','Tetapkan Kriteria','Murid menetapkan dua kriteria seperti stabil dan boleh bergerak/menyokong sebelum membina.','lembaran kriteria','Engineering Design'),
        step('source-y2-tech-create-h2','Iterasi Kedua','Selepas ujian pertama, murid mengubah sekurang-kurangnya satu bahagian dan membandingkan hasil sebelum dan selepas.','binaan; rekod ujian','Iterative Design'),
        step('source-y2-tech-create-h3','Pertahankan Reka Bentuk','Murid menerangkan mengapa komponen tertentu dipilih untuk menyokong fungsi ciptaan.','binaan; lakaran','Evidence Talk')]},
      dismantle:{topic:'Buka dan Simpan',support:[
        step('source-y2-tech-open-s1','Buka Ikut Arah','Guru membimbing murid membuka binaan dari langkah akhir ke langkah awal dengan satu bahagian pada satu masa.',common,'Reverse Sequencing'),
        step('source-y2-tech-open-s2','Asing Ikut Bekas','Murid meletakkan komponen yang dibuka terus ke ruang atau bekas mengikut jenis.','bekas berlabel; komponen','Classification'),
        step('source-y2-tech-open-s3','Kira dan Semak','Pasangan menyemak meja dan dulang supaya tiada komponen tertinggal sebelum bekas ditutup.','kad semak; bekas','Pair Check')],core:[
        step('source-y2-tech-open-c1','Rancang Urutan Buka','Kumpulan mengenal pasti bahagian yang perlu dibuka dahulu dan merekod tiga langkah awal pembukaan.','binaan; manual; kad urutan','Planning'),
        step('source-y2-tech-open-c2','Buka Tanpa Rosak','Murid membuka model secara sistematik tanpa memaksa sambungan dan terus mengasingkan komponen mengikut jenis.','binaan; dulang; bekas','Hands-on Procedure'),
        step('source-y2-tech-open-c3','Audit Bekas','Kumpulan menyemak komponen, ruang kerja dan bekas sebelum mengesahkan semua item telah disimpan.','senarai semak; bekas','Team Audit')],challenge:[
        step('source-y2-tech-open-h1','Catat Urutan Terbalik','Murid menulis urutan pembukaan sebagai songsang kepada urutan pemasangan.','manual; lembaran urutan','Sequencing'),
        step('source-y2-tech-open-h2','Jejak Komponen','Murid mengira beberapa jenis komponen sebelum dan selepas disimpan untuk memastikan tiada kehilangan.','lembaran inventori; komponen','Data Check'),
        step('source-y2-tech-open-h3','Cadang Sistem Simpanan','Murid mencadangkan satu penambahbaikan pada label atau susunan bekas supaya komponen lebih mudah dicari pada masa akan datang.','bekas; label kosong','Design Thinking')]}
    };
    const cfg=maps[md]; if(!cfg)return null;
    const induction={choose:'Guru menunjukkan dua model dalam manual dan meminta murid memilih satu serta memberi sebab.',identify:'Guru menunjukkan satu komponen sebenar dan meminta murid mencari gambar yang sepadan dalam manual.',assemble:'Guru menunjukkan model separuh siap dan meminta murid menentukan langkah seterusnya berdasarkan manual.',create:'Guru menunjukkan satu model daripada manual dan bertanya bagaimana model itu boleh diubah menjadi binaan baharu dengan fungsi berbeza.',dismantle:'Guru menunjukkan model siap dan bekas penyimpanan lalu meminta murid meramal cara membuka tanpa merosakkan komponen.'}[md];
    const closing={choose:'Murid menyatakan model pilihan dan tiga komponen utama.',identify:'Murid menunjukkan satu komponen dan mencari padanannya dalam manual.',assemble:'Murid menerangkan satu langkah pemasangan yang penting.',create:'Murid menyatakan fungsi binaan baharu dan satu penambahbaikan selepas ujian.',dismantle:'Murid menunjukkan bekas tersusun dan menyatakan satu aturan semasa membuka binaan.'}[md];
    const pr=pair(m);
    return {method:'Pembelajaran berasaskan reka bentuk + manual bergambar + bina-uji-semakan',pakDetail:'Aktiviti mengikuti set binaan dan manual bergambar sebenar. Murid merancang, memilih komponen, membina atau membuka mengikut SP; permainan hanya sebagai semakan selepas tugasan sumber.',anchor:`Laksanakan tugasan ${cfg.topic} pada ${p} menggunakan set binaan dan manual bergambar sebagai sumber utama.`,kind:md==='create'?'design_build':'build_model',bbmList:[p,'set binaan','manual bergambar','dulang komponen','kad semak','bekas penyimpanan'],groupBbm:{support:common,core:common,challenge:common},mainSp:sp(m),page:p,topic:m.title||cfg.topic,setInduksi:induction,inductionData:{name:cfg.topic,text:induction,bbm:'set binaan; manual bergambar',pak21:'Think-Pair-Share'},librarySteps:{support:cfg.support,core:cfg.core,challenge:cfg.challenge},diffSupport:cfg.support.map(x=>x.name).join(' → '),diffCore:cfg.core.map(x=>x.name).join(' → '),diffChallenge:cfg.challenge.map(x=>x.name).join(' → '),diffSupportAct:cfg.support.map(x=>x.text).join(' '),diffCoreAct:cfg.core.map(x=>x.text).join(' '),diffChallengeAct:cfg.challenge.map(x=>x.text).join(' '),pbdEvidence:{method:'Pemerhatian proses + semakan hasil + penerangan murid',evidence:'Pilihan komponen, pematuhan urutan manual, kualiti binaan/penyimpanan dan penerangan fungsi.',criterion:pr.criteria},penutup:closing};
  }

  const prevEffective=window.effectiveRphLessonMap;
  if(typeof prevEffective==='function')window.effectiveRphLessonMap=function(m,ev,built){const out=prevEffective(m,ev,built)||m;if(!mode(out))return out;const pr=pair(out);return {...out,objective:pr.objective,success_criteria:pr.criteria,_runtime_science_source_blueprint:`year2_technology_${mode(out)}`};};
  const prevPed=window.buildSourceAwarePedagogy;
  if(typeof prevPed==='function')window.buildSourceAwarePedagogy=function(m,a,bt,en,classId=null){const base=prevPed(m,a,bt,en,classId);if(en||!mode(m))return base;return {...base,...blueprint(m,bt)};};

  window.__RPH_SCIENCE_YEAR2_TECHNOLOGY_BLUEPRINT__={version:'2026-09-04a',standards:['10.1.1','10.1.2','10.1.3','10.1.4','10.1.5']};
  console.info('RPH Science Year 2 technology source blueprints active.');
})();