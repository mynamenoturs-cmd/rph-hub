// Kandungan rujukan sesi khusus daripada DOCX BM1-2026B-W29-S2 (1).docx.
// Ini ialah rujukan guru; bukan entri rph-approved-library / kelulusan hash-manifest.
// Dokumen asal menyatakan 60 minit keseluruhan, TANPA tempoh bagi setiap langkah.
// Jangan mereka-reka minit, mengubah Lesson Map DB atau mengguna pakai pada sesi lain.
(function(root){
'use strict';
const VERSION='BM1-2026B-W29-W37-60MIN-R1';
const DOCUMENT_SHA256='ce66d08db9c1c713a7986ff802abddca506805b9a3bc52b8ba222b4dc63825d1';
const PAK21='Baca–Dengar–Terang berpasangan. Seorang membaca satu rangkap dan menyebut maklumat; pasangan mendengar serta bertanya soalan mudah, kemudian bertukar.';
const WORD_OBJECTIVE='Murid dapat membaca pantun dan mengenal pasti maklumat tentang treler motosikal.';
const WORD_CRITERIA='Membaca satu rangkap pantun dengan bantuan mengikut keperluan.; Menyebut satu maklumat yang betul daripada bahagian maksud rangkap yang dibaca.';
const flat=v=>Array.isArray(v)?v.join('\n'):String(v||'');
const phase=(name,teacher,pupils,check,resources)=>({name,teacher,pupils,check,resources});
function applies(map,opts={}){
  const key=opts.subjectKey||map?.subject_key||'';
  const total=root.BmYear1CanonicalRph?.durationMinutes?.(opts.lessonTime||'60 minit')||60;
  const meta=map?.source_evidence?.meta||{};
  return key==='bm'&&Number(map?.year)===1&&Number(map?.academic_year)===2026
    &&Number(map?.week_no)===29&&Number(map?.session_no)===2
    &&map?.verification_status==='verified'&&map?.week_exact===true&&map?.sp_crosscheck===true
    &&meta.session_exact===true&&meta.page_route_verified===true
    &&String(meta.main_sp||map?.sp||'').trim()==='2.3.1'
    &&Number(map?.textbook_page_start)===110&&Number(map?.textbook_page_end||110)===110
    &&String(map?.title||'').replace(/\s+/g,' ').trim().toLowerCase()==='treler motosikal datuk'
    &&!!map?.source_evidence?.textbook&&total===60;
}
function mapForPreview(map){
  return {...map,sk:'2.3 Membaca dan mengapresiasi karya sastera dan bukan sastera',
    objective:WORD_OBJECTIVE,success_criteria:WORD_CRITERIA,progression_stage:'application'};
}
function phaseText(p){
  return 'Tindakan guru: '+flat(p.teacher)+'\nTindakan murid: '+flat(p.pupils)+'\nSemakan: '+p.check+'\nBahan: '+flat(p.resources);
}
function lane(label,description,task,materials,teacher,pupilSteps,prompt,response,product,criterion,next){
  return {label,support_description:description,task,materials,teacher,pupil_steps:pupilSteps,
    example:{teacher:prompt,pupil:response},product,criterion,next_step:next};
}
function build(map,opts={}){
  if(!applies(map,opts))throw Error('BM1_W29_S2_REFERENCE_SCOPE_MISMATCH');
  const phases=[
    phase('Kenal tajuk dan perkataan',[
      'Buka halaman 110 dan baca tajuk bersama murid.',
      'Jelaskan treler sebagai alat yang disambungkan untuk membawa barang; tanya perkataan yang sudah dikenali pada halaman.'
    ],[
      'Menunjuk tajuk.','Menyebut perkataan seperti motosikal, datuk atau tayar.'
    ],'Dapatkan gambaran awal penguasaan kata tanpa meneka butiran gambar.',['BT110','Kata bantu papan']),
    phase('Dengar dan jejak bacaan guru',[
      'Baca keempat-empat rangkap dengan jeda yang sesuai. Minta murid menjejak baris.',
      'Modelkan sebutan kata sukar dan ulang satu baris bersama kelas.',
      'Terangkan secara ringkas perbezaan pembayang dan dua baris yang menyampaikan maklumat treler.'
    ],[
      'Menjejak baris dalam buku sambil mendengar.','Mencuba sebutan kata dan satu baris selepas contoh guru.'
    ],'Ulangan serentak menyokong latihan tetapi belum menjadi bacaan individu yang disahkan.',['BT110','Penunjuk baris']),
    phase('Baca satu rangkap dengan bantuan',[
      'Berikan pilihan rangkap satu atau dua kepada pasangan. Baca semula rangkap itu secara perlahan jika perlu.',
      'Minta murid A membaca sambil menunjuk, kemudian murid B. Jangan biarkan seorang membaca bagi kedua-duanya.',
      'Dengar murid yang memerlukan bimbingan dahulu; bantu suku kata atau frasa dan beri peluang mencuba semula.'
    ],[
      'Membaca satu rangkap sambil menjejak perkataan.',
      'Mendengar rakan dan bertukar giliran.',
      'Mencuba semula perkataan yang tersangkut dengan bimbingan.'
    ],'Catat sama ada satu rangkap atau beberapa baris sahaja telah dibaca; bantuan tidak disembunyikan.',['BT110','Kata bantu','Penunjuk baris']),
    phase('Cari maklumat dalam pantun',[
      'Tanya satu soalan mengikut rangkap yang dibaca: siapa mencipta, bahan apa, membawa apa atau siapa tertarik.',
      'Minta murid menunjuk kata pada dua baris akhir dan menyatakan maklumat dengan ayat pendek.',
      'Bincangkan maklumat rangkap tiga dan empat bersama kelas tanpa mewajibkan semua murid membaca semua rangkap untuk semakan awal ini.'
    ],[
      'Menunjuk perkataan yang menyokong jawapan.',
      'Menyebut satu maklumat daripada rangkap yang dibaca.',
      'Bertanya dan menjawab satu soalan mudah dengan pasangan.'
    ],'Jawapan berkaitan treler, bukan perkataan pembayang seperti rambut atau belimbing sahaja.',['BT110','Soalan papan']),
    phase('Semakan bacaan dan isi individu',[
      'Dengar murid yang belum disemak membaca satu rangkap pilihan.',
      'Tanya satu maklumat daripada rangkap yang sama dan catat respons sebenar.',
      'Jika belum sempat, senaraikan giliran susulan; jangan mengisi penguasaan daripada bacaan kuat rakan.'
    ],[
      'Membaca sendiri kepada guru dengan bantuan yang diperlukan.',
      'Menyebut maklumat daripada rangkap dan menunjuk perkataan yang berkaitan.'
    ],'Bacaan individu dan maklumat dinilai berasingan; salah satu sahaja belum memenuhi sasaran sesi.',['BT110','Senarai kelas guru']),
    phase('Rumusan pantun',[
      'Rumuskan kegunaan treler, bahan, tayar dan hasil tanaman berdasarkan teks.',
      'Minta beberapa murid berkongsi satu maklumat yang difahami dan puji usaha membaca.'
    ],[
      'Menyebut satu isi yang dipelajari.','Menyimpan buku dan penunjuk dengan tertib.'
    ],'Tidak menambah butiran rupa atau prestasi treler yang tiada dalam teks.',['BT110'])
  ];
  const differentiation={
    support:lane('Peneroka','Contoh dan kata bantu diberi satu demi satu.',
      'Baca satu rangkap pendek dengan bimbingan dan sebut satu maklumat.',
      ['BT110, rangkap satu atau dua','Penunjuk baris','Dua pilihan jawapan guru'],[
        'Baca frasa perlahan, kemudian minta murid membaca semula sambil menjejak perkataan.',
        'Bantu mengenal datuk atau besi; berikan rangka Treler ini… tanpa menjawab seluruh ayat bagi murid.'
      ],['Jejak baris rangkap yang dipilih.','Baca satu rangkap sedikit demi sedikit dengan guru.',
        'Tunjuk perkataan tentang treler.','Sebut satu maklumat dengan rangka ayat.'],
      'Siapakah pencipta treler dalam rangkap ini?','Datuk mencipta treler motosikal.',
      'Bacaan rangkap dan satu maklumat lisan, dengan bantuan dicatat.',
      'Murid mencuba bacaan sendiri dan menyatakan isi yang sepadan; baris belum dibaca ditandai untuk susulan.',
      'Ulang frasa yang sukar sebelum kembali kepada rangkap penuh.'),
    core:lane('Pembina','Murid mencuba dengan pasangan, kemudian memberi respons sendiri.',
      'Baca satu rangkap dan terangkan satu maklumat kepada pasangan.',
      ['BT110','Kata bantu papan'],[
        'Minta kedua-dua murid mengambil giliran membaca.',
        'Tanya soalan yang sepadan dengan rangkap dan minta murid menunjukkan kata jawapan.'
      ],['Pilih satu rangkap.','Baca sambil menjejak perkataan.','Cari maklumat pada dua baris akhir.','Sebut isi dan tukar giliran.'],
      'Mengapa tayar dipasang pada treler?','Supaya treler senang bergerak.',
      'Bacaan individu serta satu ayat maklumat daripada rangkap.',
      'Isi berdasarkan teks; jawapan pasangan tidak menggantikan bacaan sendiri.',
      'Modelkan semula perkataan atau frasa yang belum jelas.'),
    challenge:lane('Pencabar','Murid memperjelas satu maklumat dalam kemahiran yang sama.',
      'Baca satu rangkap dengan jelas dan perkemas satu maklumat.',
      ['BT110','Kata bantu jika perlu'],[
        'Semak rangkap pilihan tanpa menambah tugasan mencipta pantun.',
        'Minta murid memperjelas satu isi menggunakan frasa dalam teks.'
      ],['Baca rangkap pilihan.','Tunjuk baris yang menyampaikan maksud.','Sebut satu maklumat tentang treler.',
        'Tambah satu butiran daripada rangkap yang sama jika sesuai.'],
      'Treler disangkut pada apa, dan untuk membawa apa?',
      'Treler disangkut pada motosikal untuk membawa hasil tanaman.',
      'Bacaan rangkap serta maklumat yang lebih jelas.',
      'Perincian datang daripada teks, bukan tekaan gambar atau hafalan.',
      'Kekalkan bimbingan sebutan jika murid masih memerlukannya.')
  };
  const sourceSteps=phases.map((p,i)=>({
    key:'bm1-word-w29-s2-source-'+(i+1),name:p.name,text:phaseText(p),
    bbm:flat(p.resources),pak21:PAK21,phase:'reviewed-reference'
  }));
  const librarySteps={};
  for(const key of ['support','core','challenge']){
    const g=differentiation[key];
    librarySteps[key]=[{key:'bm1-word-w29-s2-'+key,name:g.label,
      text:g.support_description,bbm:flat(g.materials),pak21:PAK21,phase:'reviewed-reference'}];
  }
  const first=phases[0],last=phases.at(-1);
  const pbd={method:'Bacaan individu dan soal jawab berdasarkan rangkap yang sama.',
    evidence:'Satu rangkap yang dibaca oleh murid sendiri serta satu maklumat yang dinyatakan dan ditunjuk pada teks. Ini bukan hafalan jawapan tanpa bacaan.',
    criterion:'Murid mencuba rangkap penuh dan mengenal satu isi yang tepat; bimbingan serta baris yang belum dibaca dicatat.'};
  const reflection='Murid yang disemak: ____ daripada ____. Dapat membaca satu rangkap: ____. Dapat menyebut satu maklumat: ____. Bantuan atau baris belum dibaca: ____. Susulan: ____.';
  return {canonicalBm1:true,reviewedReferenceBm1:true,canonicalVersion:VERSION,
    reviewDocumentSha256:DOCUMENT_SHA256,reviewDocument:'BM1-2026B-W29-S2 (1).docx',
    totalMinutes:60,sourceTask:'Membaca pantun dan mengenal pasti maklumat tentang treler motosikal.',
    materials:['BT110','Kata bantu papan','Penunjuk baris','Soalan papan','Senarai kelas guru'],
    phases,differentiation,sourceSteps,classroomFlow:sourceSteps,librarySteps,
    pak21:PAK21,pakDetail:PAK21,reflection,
    pbd,pbdEvidence:pbd,
    inductionData:{name:first.name,text:phaseText(first),bbm:flat(first.resources),pak21:PAK21},
    setInduksi:phaseText(first),penutup:phaseText(last),
    anchor:'Membaca pantun dan mengenal pasti maklumat tentang treler motosikal.',
    mainSp:'2.3.1',page:'m/s 110',topic:'Treler Motosikal Datuk',
    kind:'source_task',
    diffSupportAct:differentiation.support.task,
    diffCoreAct:differentiation.core.task,diffChallengeAct:differentiation.challenge.task,
    groupBbm:{support:flat(differentiation.support.materials),core:flat(differentiation.core.materials),challenge:flat(differentiation.challenge.materials)},
    bbmList:['BT110'],intervention:[],
    sourceTrace:'WORD_REFERENCE_UNHASHED_APPROVAL',
    sourceId:'BM1-2026B-W29-S2',reviewVersion:VERSION};
}
root.BmYear1W29S2Reference={VERSION,DOCUMENT_SHA256,applies,mapForPreview,build};
try{if(typeof module!=='undefined'&&module.exports)module.exports=root.BmYear1W29S2Reference}catch{}
})(typeof window!=='undefined'?window:globalThis);
