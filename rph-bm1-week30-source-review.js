// RPH BM Tahun 1, Minggu 30: aktiviti ulang kaji berasaskan bukti Lesson Map.
// Sesi 1 dan 2 sahaja. Sesi 3 (ayat majmuk) masih memerlukan semakan kod SP
// Buku Teks 5.3.3(ii) berbanding RPT/DSKP 5.3.2; jangan tukar kod secara automatik.
// KANDUNGAN INI BUKAN TRANSKRIP DOKUMEN WORD YANG DILULUSKAN GURU.
(function(root){
'use strict';
const VERSION='BM1-W30-SOURCE-REVIEW-20261009a';
const norm=s=>String(s??'').replace(/\s+/g,' ').trim();
const join=a=>Array.isArray(a)?a.filter(Boolean).join('\n'):String(a??'');
const phase=(name,teacher,pupils,check,resources)=>({name,teacher,pupils,check,resources});
const lane=(label,description,task,materials,teacher,pupilSteps,teacherExample,pupilExample,product,criterion,nextStep)=>({
  label,support_description:description,task,materials,teacher,pupil_steps:pupilSteps,
  example:{teacher:teacherExample,pupil:pupilExample},product,criterion,next_step:nextStep
});
const plans={
  1:{
    title:'Penyiram Pokok Inovasi (Ulangkaji)',page:109,sp:'1.2.2',
    anchors:['penyiram pokok inovasi','menjimatkan air','benamkan'],
    sourceTask:'Mengulang kaji penyampaian maklumat lisan tentang cara dan keistimewaan penyiram pokok berdasarkan gambar Buku Teks m/s 109.',
    pak21:'Baca–Semak–Terang berpasangan: murid membandingkan penerangan dengan gambar, kemudian menyampaikan jawapan sendiri.',
    phases:[
      phase('Imbas semula tujuan penyiram',[
        'Minta murid mengingat tujuan penyiram pokok tanpa membekalkan jawapan terlebih dahulu.',
        'Buka Buku Teks m/s 109 dan semak penerangan awal menggunakan gambar dan tajuk yang sebenar.'
      ],['Menyebut tujuan alat dalam ayat sendiri.','Membetulkan satu fakta selepas merujuk gambar.'],
      'Respons awal dibandingkan dengan sumber, bukan diberikan markah PBD secara automatik.',['Buku Teks m/s 109']),
      phase('Semak semula label dan urutan gambar',[
        'Minta murid membaca semula label botol plastik, isikan air, tebuk lubang dan benamkan dalam tanah pada halaman sumber.',
        'Bimbing murid merujuk susunan gambar fizikal kerana OCR tidak memastikan urutan visual yang lengkap.'
      ],['Menunjuk label yang dapat dijumpai pada sumber.','Menentukan urutan penerangan berdasarkan gambar, bukan hafalan daripada sesi lalu.'],
      'Guru mengesahkan urutan hanya melalui gambar sebenar m/s 109.',['Buku Teks m/s 109']),
      phase('Pasangan membandingkan penerangan',[
        'Minta murid A menerangkan cara menggunakan penyiram kepada murid B sambil B menjejak bukti pada gambar.',
        'Tukar peranan supaya kedua-dua murid bercakap dan menyemak.'
      ],['Menerangkan secara bergilir.','Meminta satu penjelasan jika pasangan tertinggal maklumat bergambar.'],
      'Pasangan menyemak bukti; penguasaan lisan dinilai daripada suara murid sendiri.',['Buku Teks m/s 109']),
      phase('Tapis fakta keistimewaan',[
        'Minta murid mengasingkan keistimewaan yang benar-benar tertulis: menjimatkan air, tahan lama, mudah digunakan, tidak perlu siram setiap hari, bahan terbuang, menjimatkan wang dan tenaga.',
        'Minta murid memilih dua maklumat daripada senarai asal dan menyatakannya dalam ayat lengkap.'
      ],['Memilih dua keistimewaan yang tertera pada halaman.','Menolak jawapan yang hanya tekaan tanpa bukti daripada buku.'],
      'Sekurang-kurangnya dua keistimewaan disahkan pada teks, bukan ditokok tambah.',['Buku Teks m/s 109']),
      phase('Cuba semula dan semak lisan individu',[
        'Dengar penerangan baharu setiap murid tentang cara/tujuan serta dua keistimewaan.',
        'Catat pembetulan berbanding respons awal, kejelasan sebutan dan sokongan yang masih diperlukan.'
      ],['Menerangkan secara individu dengan rujukan gambar.','Membaiki semula satu fakta atau urutan yang belum tepat.'],
      'PBD berdasarkan respons lisan semasa ulang kaji, bukan penyalinan atau kejayaan membina alat.',['Buku Teks m/s 109']),
      phase('Penutup: satu pembaikan bermakna',[
        'Minta murid menyebut satu perkara yang telah dibetulkan selepas menyemak gambar atau label.',
        'Rumuskan maklumat tujuan, cara dan keistimewaan yang disahkan oleh teks.'
      ],['Menyatakan satu maklumat yang kini lebih tepat.','Menunjukkan bahagian gambar yang menyokong pembetulan.'],
      'Bukti penutup mencatat penambahbaikan dalam penerangan sesi ulang kaji.',['Buku Teks m/s 109'])
    ],
    differentiation:{
      support:lane('Peneroka','Ulang kaji melalui petunjuk visual dan pembetulan satu fakta pada satu masa.',
        'Sebut tujuan dan dua keistimewaan berpandukan halaman selepas latihan.',
        ['Buku Teks m/s 109'],[
          'Berikan pilihan perkataan sebenar daripada label dan senarai keistimewaan.',
          'Dengar ulang penerangan murid secara berasingan selepas sokongan dikurangkan.'
        ],['Tunjuk botol plastik dalam gambar.','Jelaskan satu langkah.','Sebut dua keistimewaan.','Cuba semula dengan kurang bantuan.'],
        'Bolehkah kamu sebut satu keistimewaan daripada senarai ini?',
        'Penyiram ini menjimatkan air.',
        'Penerangan individu selepas ulang kaji serta bantuan dicatat.',
        'Cara dijelaskan dengan rujukan gambar dan dua keistimewaan sumber disebut dengan tepat.',
        'Ulang ayat yang masih kurang lengkap tanpa menambah fakta baharu.'),
      core:lane('Pembina','Murid menilai ketepatan penerangan rakan sebelum memberi respons sendiri.',
        'Terangkan cara/tujuan dan dua keistimewaan secara tersusun selepas semakan pasangan.',
        ['Buku Teks m/s 109'],[
          'Minta pasangan menunjukkan bukti gambar bagi penerangan yang diterima.',
          'Pastikan semakan lisan individu dibuat selepas perbincangan.'
        ],['Bandingkan jawapan awal dengan gambar.','Terangkan kepada pasangan.','Betulkan urutan/isi.','Terangkan sekali lagi kepada guru.'],
        'Mengapa alat ini memudahkan penjagaan pokok?',
        'Kita tidak perlu menyiram setiap hari.',
        'Penerangan individu tersusun berserta penambahbaikan.',
        'Urutan dan dua keistimewaan sepadan dengan halaman asal; sebutan jelas.',
        'Beri respons sekali lagi pada bahagian yang masih tidak tepat.'),
      challenge:lane('Pencabar','Perincikan penerangan dengan bukti bertulis pada sumber yang sama.',
        'Terangkan urutan dan kaitkan tiga keistimewaan dengan penjagaan pokok tanpa menambah ciri rekaan.',
        ['Buku Teks m/s 109'],[
          'Minta murid membetulkan satu penyataan yang tidak disokong teks.',
          'Minta murid menghubungkan penjelasan kepada gambar dan senarai asal.'
        ],['Tentukan fakta yang boleh dibuktikan.','Terangkan cara dalam ayat sendiri.','Nyatakan tiga keistimewaan.','Jelaskan satu pembetulan terhadap jawapan awal.'],
        'Apakah bukti penyiram itu dapat menjimatkan masa?',
        'Sumber menyatakan tidak perlu menyiram setiap hari.',
        'Penerangan yang membetulkan salah faham berdasarkan bukti.',
        'Semua perincian dapat disokong gambar dan senarai keistimewaan m/s 109.',
        'Perkemas cara menyampaikan maklumat tanpa mencipta langkah baharu.')
    },
    assessment:{
      method:'Pemerhatian respons lisan individu sebelum dan selepas semakan sumber.',
      evidence:'Murid menyampaikan cara/tujuan serta sekurang-kurangnya dua keistimewaan yang boleh ditunjuk pada gambar dan senarai halaman 109.',
      criterion:'Penerangan mengikut bukti gambar dengan dua keistimewaan tepat dan sebutan jelas.'
    },
    reflection:'Bilangan murid disemak: ____ / ____. Penerangan selepas pembetulan tepat: ____. Dua keistimewaan tepat: ____. Masih perlukan bimbingan: ____. Susulan: ____.'
  },
  2:{
    title:'Wah, Mudahnya! (Ulangkaji)+PKJR',page:111,sp:'3.2.1',
    anchors:['penanda buku pintar','jadual waktu','kalang'],
    sourceTask:'Mengulang kaji penulisan ayat berdasarkan jadual buku sekolah Kalang pada Buku Teks m/s 111; elemen PKJR memerlukan sumber berasingan.',
    pak21:'Semak–Baiki–Tulis: pasangan menyemak padanan jadual, tetapi tiga ayat terakhir ditulis oleh setiap murid sendiri.',
    phases:[
      phase('Imbas semula kegunaan penanda buku pintar',[
        'Baca tajuk pada Buku Teks m/s 111 dan tanya masalah membawa buku yang dihadapi Kalang.',
        'Minta murid menyatakan bagaimana jadual membantu Kalang menyediakan beg sekolah.'
      ],['Menunjukkan rajah jadual.','Menyebut tujuan penanda buku pintar berdasarkan petikan.'],
      'Penerangan berdasarkan sumber Kalang, bukan andaian sistem penjadualan baharu.',['Buku Teks m/s 111']),
      phase('Kesankan padanan hari–buku daripada rajah',[
        'Tunjukkan hari Isnin hingga Khamis seperti pada halaman asal.',
        'Ulang contoh yang nyata daripada teks: Isnin, Bahasa Melayu dan Bahasa Inggeris.',
        'Bagi hari lain, minta murid menunjuk padanan terus dalam rajah bercetak; teks OCR tidak mengekalkan kedudukan jadual.'
      ],['Menjejak lajur hari dan buku yang sepadan.','Mengenal pasti satu rujukan tepat dengan menunjuk rajah.'],
      'Padanan hari dan mata pelajaran diperiksa pada rajah asal.',['Buku Teks m/s 111']),
      phase('Kenal pasti ayat yang perlu dibetulkan',[
        'Tunjuk ayat contoh yang sudah ditulis murid atau ayat latihan berdasarkan data jadual.',
        'Minta murid mengesan tiga perkara: kesesuaian hari–buku, huruf besar awal ayat dan tanda noktah.'
      ],['Mengenal pasti satu ayat yang belum lengkap/tepat.','Menerangkan pembetulan berdasarkan jadual.'],
      'Tidak mencipta mata pelajaran untuk hari yang tidak jelas dalam OCR.',['Buku Teks m/s 111']),
      phase('Tulis semula tiga ayat tepat',[
        'Minta murid membina tiga ayat baharu atau membaiki ayat lama menggunakan padanan yang disemak pada rajah.',
        'Ingatkan rangka Pada hari ____, Kalang membawa buku ____. sebagai bantuan sahaja.'
      ],['Menulis tiga ayat individu.','Memeriksa ketepatan fakta dan tanda baca sebelum berkongsi.'],
      'Sasaran ialah tiga ayat yang tepat mengikut jadual, bukan hanya menyalin contoh hari Isnin.',['Buku Teks m/s 111']),
      phase('Semakan rakan diikuti PBD individu',[
        'Minta pasangan menyemak kesilapan jadual/huruf besar/noktah, kemudian setiap murid membetulkan sendiri.',
        'Semak sekurang-kurangnya tiga ayat secara individu dan catat bilangan yang benar-benar tepat.'
      ],['Menyemak hasil rakan dengan rujukan rajah.','Membetulkan sendiri kesilapan yang ditemui.'],
      'Rekod PBD daripada hasil tulisan sendiri, bukan jawapan pasangan.',['Buku Teks m/s 111']),
      phase('Rumusan dan satu bukti pembetulan',[
        'Minta murid menunjukkan satu ayat yang diperbaiki serta sebab pembetulannya.',
        'Rumuskan kegunaan jadual dan unsur ayat yang tepat.'
      ],['Membaca satu ayat yang telah diperbaiki.','Menunjukkan padanan hari–buku pada rajah.'],
      'Rumusan berdasarkan kualiti ayat selepas ulang kaji.',['Buku Teks m/s 111'])
    ],
    differentiation:{
      support:lane('Peneroka','Gunakan rangka ayat dan semak satu padanan hari–buku pada satu masa.',
        'Lengkapkan tiga ayat sendiri berdasarkan padanan rajah selepas bimbingan.',
        ['Buku Teks m/s 111'],[
          'Mulakan dengan ayat Isnin yang memang disebut dalam petikan.',
          'Bantu murid menemui maklumat hari lain dalam rajah, tetapi jangan isikan jawapan sepenuhnya.'
        ],['Tunjuk hari pada rajah.','Baca rangka ayat.','Lengkapkan ayat dengan padanan sebenar.','Semak huruf besar dan noktah.'],
        'Apakah buku yang dibawa pada hari Isnin?',
        'Kalang membawa buku Bahasa Melayu dan Bahasa Inggeris pada hari Isnin.',
        'Ayat hasil murid dan bilangan pembetulan yang diperlukan.',
        'Padanan daripada rajah, ayat lengkap dan tanda baca tepat; bantuan direkod.',
        'Semak semula satu ayat dengan petunjuk secara beransur kurang.'),
      core:lane('Pembina','Murid menggunakan semakan pasangan untuk membaiki ayat sendiri.',
        'Tulis tiga ayat mengikut jadual kemudian betulkan sendiri satu kesalahan jika ada.',
        ['Buku Teks m/s 111'],[
          'Minta murid menunjukkan tempat padanan jadual apabila menyemak.',
          'Beri semakan selepas murid membaiki hasil tulisan secara sendiri.'
        ],['Teliti hari dan buku pada rajah.','Tulis tiga ayat sendiri.','Semak bersama pasangan.','Membaiki kesilapan tanda baca atau padanan.'],
        'Bagaimana kamu memastikan hari dan buku tepat?',
        'Saya semak maklumat itu pada jadual dalam Buku Teks.',
        'Tiga ayat tepat selepas semakan dan pembetulan.',
        'Ayat sepadan hari/mata pelajaran, huruf besar dan noktah betul.',
        'Baiki ayat yang tersilap dengan merujuk semula rajah.'),
      challenge:lane('Pencabar','Jelaskan mengapa sesuatu ayat dipinda berdasarkan bukti sumber.',
        'Tulis tiga atau lebih ayat dan huraikan bukti pembetulan.',
        ['Buku Teks m/s 111'],[
          'Minta justifikasi padanan hari dan buku berpandukan rajah.',
          'Jangan menambah maklumat PKJR atau mata pelajaran yang tidak dibekalkan.'
        ],['Tulis ayat berpandukan rajah.','Kenal pasti satu ralat padanan/tanda baca.','Jelaskan bukti pindaan.','Serahkan ayat yang telah dibetulkan.'],
        'Mengapa kamu membetulkan ayat itu?',
        'Saya rujuk hari dan buku pada jadual; ayat awal tidak sepadan.',
        'Ayat disemak dengan penjelasan berdasarkan rajah.',
        'Sekurang-kurangnya tiga ayat tepat serta satu pembetulan yang dapat dijelaskan.',
        'Tingkatkan kejelasan ayat tanpa mencipta fakta jadual.')
    },
    assessment:{
      method:'Semakan tiga ayat bertulis individu selepas ulang kaji dan semakan pasangan.',
      evidence:'Tiga ayat berdasarkan padanan hari–buku sebenar pada rajah; catatan pembetulan padanan, huruf besar dan noktah.',
      criterion:'Sekurang-kurangnya tiga ayat sepadan dengan jadual dan mempunyai tanda baca yang betul.'
    },
    reflection:'Murid disemak: ____ / ____. Tiga ayat tepat: ____. Berjaya membaiki padanan jadual: ____. Kesalahan tanda baca masih berlaku: ____. Susulan: ____.'
  }
};
function applies(map,opts={}){
  const p=plans[Number(map?.session_no)];
  if(!p)return false;
  const key=opts.subjectKey||map?.subject_key||(typeof root.rphSubjectKey==='function'?root.rphSubjectKey(map?.subject_id):'');
  const meta=map?.source_evidence?.meta||{};
  const txt=norm(map?.source_evidence?.textbook?.text).toLowerCase();
  return key==='bm'&&Number(map?.year)===1&&Number(map?.academic_year)===2026
    &&Number(map?.week_no)===30&&map?.verification_status==='verified'
    &&map?.week_exact===true&&map?.sp_crosscheck===true&&meta.session_exact===true
    &&meta.page_route_verified===true&&norm(meta.main_sp||map?.sp)===p.sp
    &&norm(map?.sp)===p.sp&&Number(map?.textbook_page_start)===p.page
    &&Number(map?.textbook_page_end||p.page)===p.page
    &&norm(map?.title).toLowerCase()===p.title.toLowerCase()
    &&p.anchors.every(x=>txt.includes(x));
}
function stepText(p){return 'Tindakan guru: '+join(p.teacher)+'\nTindakan murid: '+join(p.pupils)+'\nSemakan: '+p.check+'\nBahan: '+join(p.resources);}
function build(map,opts={}){
  if(!applies(map,opts))throw Error('BM1_WEEK30_SOURCE_REVIEW_SCOPE_MISMATCH');
  const p=plans[Number(map.session_no)];
  const canonical=root.BmYear1CanonicalRph?.build(map,opts);
  if(!canonical)throw Error('BM1_CANONICAL_ENGINE_REQUIRED');
  const phases=p.phases.map(x=>({...x}));
  const steps=phases.map((x,i)=>({key:'bm1-w30-review-s'+map.session_no+'-step-'+(i+1),
    name:x.name,text:stepText(x),bbm:join(x.resources),pak21:p.pak21,phase:'source-review'}));
  const groups={};
  for(const k of ['support','core','challenge']){
    const x=p.differentiation[k];
    groups[k]=[{key:'bm1-w30-review-s'+map.session_no+'-'+k,name:x.label,
      text:'Tugasan sumber: '+x.task,bbm:join(x.materials),pak21:p.pak21,phase:'source-review'}];
  }
  const first=phases[0],last=phases.at(-1);
  return {...canonical,canonicalBm1:true,sourcePlanBm1:true,
    sourcePlanReviewStatus:'LESSON_MAP_EVIDENCE_NOT_WORD_APPROVED',
    canonicalVersion:VERSION,sourcePlanVersion:VERSION,sourcePlanSession:'BM1-2026B-W30-S'+map.session_no,
    sourceTask:p.sourceTask,anchor:p.sourceTask,phases,sourceSteps:steps,classroomFlow:steps,
    librarySteps:groups,differentiation:p.differentiation,
    groupBbm:{support:join(p.differentiation.support.materials),core:join(p.differentiation.core.materials),
      challenge:join(p.differentiation.challenge.materials)},
    bbmList:['Buku Teks m/s '+p.page],pak21:p.pak21,pakDetail:p.pak21,
    pbd:p.assessment,pbdEvidence:p.assessment,reflection:p.reflection,intervention:[],
    inductionData:{name:first.name,text:stepText(first),bbm:join(first.resources),pak21:p.pak21},
    setInduksi:stepText(first),penutup:stepText(last),
    diffSupportAct:p.differentiation.support.task,diffCoreAct:p.differentiation.core.task,
    diffChallengeAct:p.differentiation.challenge.task,
    page:'m/s '+p.page,mainSp:p.sp,topic:p.title,
    pkjrStatus:Number(map.session_no)===2?'PKJR_TITLE_ONLY_NO_VERIFIED_PKJR_SOURCE':null
  };
}
root.BmYear1Week30SourceReview={VERSION,availableSessions:[1,2],applies,build};
try{if(typeof module!=='undefined'&&module.exports)module.exports=root.BmYear1Week30SourceReview}catch{}
})(typeof window!=='undefined'?window:globalThis);
