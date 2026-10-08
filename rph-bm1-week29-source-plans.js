// BM Tahun 1, Minggu 29: rancangan aktiviti khusus berpandukan Lesson Map
// VERIFIED dan teks Buku Teks yang direkod dalam source_evidence (BT109/111/112).
// BUKAN Word yang telah disemak guru, bukan kelulusan rph-approved-library.
// M29 S2 kekal melalui rph-bm1-w29s2-word-reference.js. M29 S5 perlu
// semakan ketidakpadanan kod SP buku (5.3.3 i) berbanding RPT/DSKP (5.3.2).
(function(root){
'use strict';
const VERSION='BM1-W29-SOURCE-PLANS-20261008n';
const norm=x=>String(x||'').replace(/\s+/g,' ').trim();
const lines=x=>Array.isArray(x)?x.filter(Boolean).join('\n'):String(x||'');
const T=(name,teacher,pupils,check,resources)=>({name,teacher,pupils,check,resources});
const L=(label,description,task,materials,teacher,pupils,question,answer,product,criterion,next)=>({
 label,support_description:description,task,materials,teacher,pupil_steps:pupils,
 example:{teacher:question,pupil:answer},product,criterion,next_step:next
});
const base={
  1:{title:'Penyiram Pokok Inovasi',sp:'1.2.2',page:109,
    anchors:['penyiram pokok inovasi','menjimatkan air'],
    task:'Menyampaikan maklumat berdasarkan gambar tentang cara membuat dan keistimewaan penyiram pokok inovasi.',
    pak21:'Think–Pair–Share: teliti gambar, susun maklumat dan jelaskan kepada pasangan; setiap murid tetap memberi respons sendiri.',
    stages:[
      T('Kenali gambar dan tajuk',[
        'Buka Buku Teks m/s 109 dan baca tajuk bersama murid.',
        'Tanya kegunaan alat penyiram pokok dan minta murid merujuk gambar sebelum menjawab.'
      ],['Menunjukkan objek yang berkaitan pada halaman.','Menyebut penyiram pokok dan kegunaannya dengan ayat pendek.'],
      'Respons awal diambil daripada gambar, bukan andaian cara alat berfungsi.', ['Buku Teks m/s 109']),
      T('Teliti bahan dan label langkah',[
        'Minta murid meneliti botol plastik dan arahan ringkas yang tercetak pada gambar halaman 109.',
        'Baca arahan yang tertera bersama murid; elakkan mewajibkan pembinaan alat untuk menilai SP bertutur.'
      ],['Menunjukkan bahan dan bahagian bergambar.','Menyebut label yang dibaca dengan bimbingan guru.'],
      'Murid mengenal pasti label gambar; turutan yang tidak jelas dalam teks OCR disahkan daripada gambar asal.', ['Buku Teks m/s 109']),
      T('Ceritakan cara berdasarkan gambar',[
        'Minta murid menyusun penerangan tentang cara menggunakan atau membuat penyiram mengikut gambar sebenar.',
        'Bimbing penggunaan penanda wacana seperti mula-mula dan kemudian tanpa memberi jawapan lengkap.'
      ],['Menerangkan cara secara lisan mengikut gambar.','Membetulkan susunan penerangan selepas mendengar soalan guru.'],
      'Guru menyemak turutan penerangan terhadap gambar, bukan meneka langkah yang tidak kelihatan.', ['Buku Teks m/s 109']),
      T('Kenal pasti keistimewaan',[
        'Tunjukkan senarai keistimewaan yang dicetak pada halaman: menjimatkan air, tahan lama, mudah digunakan, tidak perlu siram setiap hari, guna bahan terbuang, menjimatkan wang dan tenaga.',
        'Minta murid memilih dua keistimewaan daripada senarai itu untuk diterangkan kepada pasangan.'
      ],['Menyebut dua keistimewaan yang terdapat pada teks.','Menyampaikan maklumat secara bergilir tanpa bergantung kepada jawapan pasangan.'],
      'Dua keistimewaan mesti berasal daripada senarai halaman buku.', ['Buku Teks m/s 109']),
      T('Semakan pertuturan individu',[
        'Dengar setiap murid yang sempat disemak menyampaikan cara serta sekurang-kurangnya dua keistimewaan.',
        'Catat isi yang tepat, sebutan dan bantuan yang diterima; murid yang belum disemak diberi giliran susulan.'
      ],['Menyampaikan penerangan sendiri sambil merujuk gambar.','Membaiki satu maklumat selepas maklum balas.'],
      'Bukti PBD ialah respons lisan individu berdasarkan gambar, bukan hasil pemasangan alat.', ['Buku Teks m/s 109','Senarai semak guru']),
      T('Rumuskan kegunaan inovasi',[
        'Rumuskan tujuan penyiram pokok serta keistimewaan yang disebut daripada buku.',
        'Minta seorang murid menyatakan satu sebab alat ini memudahkan penjagaan pokok.'
      ],['Menyebut satu perkara yang dipelajari.','Menutup dan menyimpan buku dengan tertib.'],
      'Rumusan kekal pada cara dan keistimewaan yang ada pada sumber.', ['Buku Teks m/s 109'])
    ],
    lanes:{
      support:L('Peneroka','Bimbingan dengan gambar dan pilihan kata sumber.',
        'Nyatakan cara atau kegunaan penyiram dan dua keistimewaan berdasarkan gambar.',
        ['Buku Teks m/s 109'],['Tunjukkan satu bahagian gambar pada satu masa.','Beri dua pilihan kata yang memang wujud pada halaman.'],
        ['Tunjuk gambar penyiram pokok.','Sebut kegunaannya dengan ayat mudah.','Pilih dua keistimewaan daripada senarai buku.'],
        'Apakah satu keistimewaan penyiram ini?','Penyiram ini menjimatkan air.',
        'Penerangan lisan sendiri dengan bantuan dicatat.',
        'Isi merujuk gambar dan sekurang-kurangnya dua keistimewaan; bantuan direkod.',
        'Ulang penerangan dengan petunjuk secara beransur kurang.'),
      core:L('Pembina','Respons berpasangan diikuti penerangan individu.',
        'Susun penerangan cara dan jelaskan dua keistimewaan penyiram.',
        ['Buku Teks m/s 109'],['Minta murid meneliti gambar secara berpasangan.','Semak susunan dan keistimewaan melalui soalan individu.'],
        ['Teliti label gambar.','Terangkan urutan cara kepada pasangan.','Sebut dua keistimewaan dengan jelas kepada guru.'],
        'Apakah dua keistimewaan alat ini?','Mudah digunakan dan menjimatkan wang.',
        'Penerangan lisan individu tentang cara dan dua keistimewaan.',
        'Urutan dan keistimewaan sepadan dengan gambar dan teks buku.',
        'Bimbing semula ayat yang kurang jelas dan cuba ulang secara sendiri.'),
      challenge:L('Pencabar','Huraikan keistimewaan dengan alasan daripada senarai sumber tanpa tugas projek tambahan.',
        'Terangkan cara dan kaitkan lebih daripada dua keistimewaan.',
        ['Buku Teks m/s 109'],['Minta bukti bagi setiap keistimewaan yang disebut.','Elakkan menambah ciri alat yang tidak diterangkan oleh buku.'],
        ['Terangkan cara berdasarkan gambar.','Pilih tiga keistimewaan daripada sumber.','Sampaikan kaitan keistimewaan itu dengan penjagaan pokok.'],
        'Mengapa alat ini membantu menjimatkan masa?','Kita tidak perlu menyiram pokok setiap hari.',
        'Penerangan lisan lebih jelas dengan bukti daripada teks.',
        'Perincian masih berpunca daripada senarai keistimewaan pada halaman.',
        'Perkemas ayat yang kurang tepat tanpa menambah maklumat rekaan.')
    },
    pbd:{method:'Pemerhatian dan soal jawab pertuturan individu berdasarkan gambar m/s 109.',
      evidence:'Murid menerangkan cara membuat atau menggunakan penyiram serta menyebut sekurang-kurangnya dua keistimewaan daripada halaman sumber.',
      criterion:'Turutan maklumat mengikut gambar dan sekurang-kurangnya dua keistimewaan disebut dengan jelas.'},
    reflection:'Murid disemak: ____ / ____. Dapat menyatakan cara: ____. Dapat menyebut dua keistimewaan: ____. Bantuan: ____. Susulan: ____.'
  },
  3:{title:'Wah, Mudahnya!',sp:'3.2.1',page:111,
    anchors:['penanda buku pintar','jadual waktu'],
    task:'Membina dan menulis ayat berdasarkan rajah jadual waktu untuk buku sekolah Kalang.',
    pak21:'Think–Pair–Check: murid membaca jadual dan menyemak padanan hari–mata pelajaran secara berpasangan sebelum menulis sendiri.',
    stages:[
      T('Kenal tujuan penanda buku pintar',[
        'Buka Buku Teks m/s 111 dan baca tajuk bersama kelas.',
        'Tanya mengapa Kalang menggunakan penanda buku pintar berdasarkan petikan.'
      ],['Menyebut tujuan alat untuk membawa buku mengikut jadual.','Menunjuk rajah jadual pada halaman.'],
      'Jawapan disokong petikan: Kalang tidak perlu membawa semua buku dan begnya menjadi ringan.', ['Buku Teks m/s 111']),
      T('Baca jadual hari dan mata pelajaran',[
        'Tunjuk lajur hari Isnin, Selasa, Rabu dan Khamis serta baris mata pelajaran dalam rajah.',
        'Baca contoh yang dinyatakan jelas dalam petikan: Kalang membawa buku Bahasa Melayu dan Bahasa Inggeris pada hari Isnin.'
      ],['Menjejak hari dan mata pelajaran dalam rajah.','Membaca ayat contoh hari Isnin dengan guru.'],
      'Murid dapat menghubungkan perkataan hari dengan bahagian jadual yang betul.', ['Buku Teks m/s 111']),
      T('Bina ayat daripada jadual',[
        'Minta murid memilih maklumat hari lain terus daripada rajah yang sedang dilihat, bukan meneka mata pelajaran daripada OCR.',
        'Modelkan rangka ayat: Pada hari ____, Kalang membawa buku ____.'
      ],['Merujuk rajah bagi mata pelajaran hari pilihan.','Membina ayat secara lisan sebelum menulisnya.'],
      'Padanan hari dan buku mesti diperiksa pada rajah asal.', ['Buku Teks m/s 111']),
      T('Tulis sekurang-kurangnya tiga ayat',[
        'Minta murid menulis tiga ayat berdasarkan hari dan buku yang sebenar pada halaman.',
        'Ingatkan huruf besar pada awal ayat dan tanda noktah pada akhir ayat.'
      ],['Menulis sekurang-kurangnya tiga ayat individu.','Semak huruf besar, noktah dan padanan hari–mata pelajaran.'],
      'Ayat lengkap merujuk data rajah, bukan ayat umum tentang teknologi.', ['Buku Teks m/s 111','Buku latihan']),
      T('Semakan tulisan individu',[
        'Bandingkan setiap ayat dengan jadual pada buku; tanda ayat yang tepat dan salah padanan.',
        'Minta murid membetulkan satu ayat yang belum lengkap tanpa menyalin jawapan rakan.'
      ],['Membaca ayat sendiri kepada guru.','Membetulkan ayat yang tidak sepadan dengan jadual.'],
      'Catat bilangan ayat yang tepat dan pembetulan huruf besar atau noktah.', ['Buku Teks m/s 111','Hasil tulisan murid']),
      T('Rumusan: buku mengikut jadual',[
        'Rumuskan fungsi penanda buku pintar dan kepentingan merujuk jadual sebelum menyediakan beg sekolah.',
        'Pilih satu ayat lengkap yang dihasilkan murid untuk mengukuhkan contoh.'
      ],['Menyebut satu manfaat menggunakan jadual.','Menyemak dan menyimpan tugasan.'],
      'Rumusan berasaskan petikan Kalang, bukan menambah mata pelajaran yang tidak kelihatan.', ['Buku Teks m/s 111'])
    ],
    lanes:{
      support:L('Peneroka','Rangka ayat dan semakan jadual satu hari pada satu masa.',
        'Tulis ayat mengikut maklumat rajah menggunakan rangka yang sama.',
        ['Buku Teks m/s 111','Buku latihan'],['Tunjukkan contoh Isnin yang disahkan pada petikan.','Bimbing murid menjejak padanan hari untuk ayat berikutnya.'],
        ['Baca ayat contoh Isnin.','Pilih hari daripada rajah.','Lengkapkan rangka ayat dengan maklumat yang ditunjukkan.','Cuba hasil tulisan sendiri.'],
        'Buku apakah yang dibawa Kalang pada Isnin?','Kalang membawa buku Bahasa Melayu dan Bahasa Inggeris.',
        'Ayat bertulis sendiri; tahap bantuan dan bilangan ayat tepat direkod.',
        'Padanan betul berdasarkan rajah dan format ayat bermula huruf besar serta berakhir noktah.',
        'Baca dan lengkapkan semula bahagian ayat yang belum jelas.'),
      core:L('Pembina','Tulis ayat penuh berdasarkan jadual selepas perbincangan.',
        'Tulis sekurang-kurangnya tiga ayat yang sepadan dengan hari dan buku.',
        ['Buku Teks m/s 111','Buku latihan'],['Tanya padanan bagi hari pilihan murid.','Semak setiap ayat dengan rajah sebelum memberi maklum balas.'],
        ['Rujuk jadual.','Bina ayat bagi sekurang-kurangnya tiga hari.','Semak huruf besar, noktah dan ketepatan hari.'],
        'Mengapa Kalang tidak perlu membawa semua buku?', 'Dia membawa buku mengikut jadual waktu.',
        'Tiga ayat bertulis secara individu berserta pembetulan.',
        'Sekurang-kurangnya tiga ayat tepat menurut jadual dan tanda baca.',
        'Betulkan padanan jadual atau tanda baca yang tersilap.'),
      challenge:L('Pencabar','Perincian ditingkatkan pada tugas membina ayat yang sama.',
        'Bina ayat lengkap untuk beberapa hari dan jelaskan padanan dari rajah.',
        ['Buku Teks m/s 111','Buku latihan'],['Minta murid menunjukkan bukti jadual bagi setiap ayat.','Elakkan mencipta mata pelajaran atau hari di luar rajah.'],
        ['Tulis tiga atau lebih ayat berdasarkan rajah.','Tunjukkan bahagian jadual yang menyokong setiap ayat.','Semak hubungan hari dan bahan sendiri.'],
        'Di manakah bukti untuk ayat ini?','Pada bahagian hari dan mata pelajaran dalam jadual.',
        'Ayat tepat dengan bukti padanan jadual.',
        'Ayat gramatis, huruf besar dan noktah betul serta padanan berasas sumber.',
        'Ubah ayat yang kurang jelas tanpa menambah fakta daripada luar halaman.')
    },
    pbd:{method:'Semakan tulisan individu dan soal jawab tentang rajah m/s 111.',
      evidence:'Sekurang-kurangnya tiga ayat bertulis yang dipadankan kepada hari serta mata pelajaran pada jadual; pembetulan ditanda.',
      criterion:'Tiga ayat tepat berdasarkan jadual dengan huruf besar dan noktah yang betul.'},
    reflection:'Murid disemak: ____ / ____. Tiga ayat tepat: ____. Padanan jadual perlu dibetulkan: ____. Kesalahan huruf besar/noktah: ____. Susulan: ____.'
  },
  4:{title:'Berus Gigiku Hebat',sp:'4.2.2',page:112,
    anchors:['berus gigiku hebat','wau bulan'],
    task:'Menyanyikan lagu “Berus Gigiku Hebat” dengan sebutan dan intonasi yang betul mengikut irama Wau Bulan.',
    pak21:'Latihan bergilir dalam kumpulan kecil; penilaian nyanyian mesti didengar daripada murid sendiri, bukan hanya nyanyian berkumpulan.',
    stages:[
      T('Perkenalkan tema lagu',[
        'Buka Buku Teks m/s 112 dan bacakan tajuk “Berus Gigiku Hebat”.',
        'Tanya perkara yang murid ketahui tentang berus gigi; kaitkan kepada penjagaan kebersihan.'
      ],['Menunjuk tajuk lagu.','Menyebut tema penjagaan gigi secara ringkas.'],
      'Respons awal hanya untuk pencetus, bukan bukti murid sudah boleh menyanyi.', ['Buku Teks m/s 112']),
      T('Guru memperdengarkan model irama',[
        'Sediakan dan nyanyikan contoh dengan irama Wau Bulan seperti tercatat pada Buku Teks m/s 112.',
        'Jelaskan tempo dan intonasi melalui model suara; bacaan lirik sahaja bukan pengganti nyanyian.'
      ],['Mendengar contoh nyanyian sebenar guru.','Menjejak bahagian teks lagu sambil mendengar.'],
      'Murid boleh mengenal bahagian yang perlu dinyanyikan; sumber tidak membekalkan fail audio secara automatik.', ['Buku Teks m/s 112','Model suara guru']),
      T('Latih sebutan dan intonasi',[
        'Nyanyikan satu bahagian pendek; minta murid mengulang dengan sebutan yang jelas.',
        'Bantu perkataan yang sukar melalui ulangan perlahan sebelum kembali kepada tempo lagu.'
      ],['Meniru contoh nyanyian bagi bahagian terpilih.','Cuba semula sebutan dan intonasi selepas bimbingan.'],
      'Perhatikan sebutan kata dan intonasi apabila dinyanyikan, bukan apabila dibaca sahaja.', ['Buku Teks m/s 112','Model suara guru']),
      T('Nyanyian secara giliran',[
        'Susun latihan pasangan atau kumpulan kecil dengan giliran nyanyian yang jelas.',
        'Pastikan setiap murid mencuba sekurang-kurangnya satu bahagian lagu sendiri.'
      ],['Menyanyikan bahagian lagu secara bergilir.','Mendengar rakan, kemudian membaiki tempo atau sebutan sendiri.'],
      'Nyanyian berkumpulan menyokong latihan tetapi belum mencukupi sebagai PBD individu.', ['Buku Teks m/s 112','Model suara guru']),
      T('Semakan nyanyian individu',[
        'Dengar murid yang belum disemak menyanyikan bahagian pilihan mengikut irama yang dimodelkan.',
        'Catat sebutan, tempo, intonasi dan bantuan yang diterima; jadualkan giliran susulan bagi yang belum sempat.'
      ],['Menyanyikan sekurang-kurangnya satu bahagian untuk semakan guru.','Mencuba semula dengan bimbingan jika perlu.'],
      'Evidens ialah nyanyian individu mengikut melodi, bukan hafalan teks secara lisan.', ['Buku Teks m/s 112','Senarai semak guru']),
      T('Penutup lagu dan kebersihan',[
        'Rumuskan amalan menjaga kebersihan gigi yang menjadi tema lagu.',
        'Berikan maklum balas ringkas berdasarkan nyanyian yang betul-betul telah didengar.'
      ],['Menyebut satu amalan kebersihan gigi.','Menyimpan buku dengan tertib.'],
      'Kesimpulan pada tema dan kemahiran menyanyi mengikut irama sumber.', ['Buku Teks m/s 112'])
    ],
    lanes:{
      support:L('Peneroka','Guru memodelkan frasa pendek sebelum murid menyanyi semula.',
        'Nyanyikan sekurang-kurangnya satu bahagian pendek dengan bantuan suara guru.',
        ['Buku Teks m/s 112','Model suara guru'],['Nyanyikan frasa pendek dengan tempo perlahan.','Dengar cubaan murid seorang demi seorang dan beri peluang ulang.'],
        ['Jejak teks bahagian terpilih.','Nyanyikan frasa bersama model guru.','Cuba semula bahagian yang sama secara sendiri.'],
        'Bolehkah kamu nyanyikan bahagian ini mengikut contoh?', 'Murid menyanyikan bahagian terpilih mengikut model.',
        'Cubaan nyanyian sendiri; bantuan dicatat.',
        'Sebut kata dengan jelas dan cuba intonasi lagu mengikut model; keperluan bantuan direkod.',
        'Ulang bahagian yang sukar dengan sokongan guru kemudian cuba lagi.'),
      core:L('Pembina','Latihan kumpulan diikuti semakan nyanyian sendiri.',
        'Nyanyikan satu bahagian lagu dengan sebutan, tempo dan intonasi yang sesuai.',
        ['Buku Teks m/s 112','Model suara guru'],['Tetapkan giliran murid supaya setiap suara dapat didengar.','Semak tempo dan intonasi setiap murid berdasarkan model.'],
        ['Dengar contoh irama.','Latih bahagian yang dipilih.','Nyanyikan sendiri kepada guru.'],
        'Bagaimanakah tempo bahagian ini?', 'Murid menunjukkan tempo melalui nyanyian.',
        'Nyanyian individu sekurang-kurangnya satu bahagian.',
        'Sebutan jelas, tempo terkawal dan intonasi sesuai mengikut irama Wau Bulan.',
        'Cuba ulang bahagian dengan pembetulan intonasi.'),
      challenge:L('Pencabar','Kemaskan penyampaian dalam kemahiran menyanyi yang sama.',
        'Nyanyikan bahagian terpilih dengan sebutan jelas serta aliran tempo konsisten.',
        ['Buku Teks m/s 112','Model suara guru'],['Minta murid menunjukkan perubahan intonasi melalui nyanyian.','Jangan menambah tugas mencipta lirik atau irama yang tidak diminta.'],
        ['Latih bahagian lebih panjang jika mampu.','Nyanyikan sendiri dengan tempo stabil.','Betulkan satu sebutan atau intonasi selepas maklum balas.'],
        'Bolehkah kamu kekalkan tempo apabila menyanyi?', 'Murid menunjukkan tempo yang stabil melalui nyanyian.',
        'Nyanyian individu yang jelas dan konsisten.',
        'Tempo, sebutan dan intonasi sesuai dengan melodi contoh.',
        'Kukuhkan bahagian yang masih lemah tanpa menambah SP baharu.')
    },
    pbd:{method:'Pemerhatian dan pendengaran nyanyian individu berdasarkan irama Wau Bulan.',
      evidence:'Nyanyian sebenar sekurang-kurangnya satu bahagian lagu dengan sebutan, tempo dan intonasi yang diperhatikan guru.',
      criterion:'Nyanyian mengikut melodi sumber; sebutan jelas, tempo terkawal dan intonasi sesuai; bantuan dicatat.'},
    reflection:'Murid disemak menyanyi: ____ / ____. Sebutan jelas: ____. Tempo/intonasi sesuai: ____. Bantuan model: ____. Giliran susulan: ____.'
  }
};
function applies(map,opts={}){
 const plan=base[Number(map?.session_no)];
 if(!plan)return false;
 const key=opts.subjectKey||map?.subject_key||(typeof root.rphSubjectKey==='function'?root.rphSubjectKey(map?.subject_id):'');
 const meta=map?.source_evidence?.meta||{};
 const text=norm(map?.source_evidence?.textbook?.text).toLowerCase();
 return key==='bm'&&Number(map?.year)===1&&Number(map?.academic_year)===2026
   &&Number(map?.week_no)===29&&map?.verification_status==='verified'
   &&map?.week_exact===true&&map?.sp_crosscheck===true
   &&meta.session_exact===true&&meta.page_route_verified===true
   &&norm(meta.main_sp||map?.sp)===plan.sp&&norm(map?.sp)===plan.sp
   &&Number(map?.textbook_page_start)===plan.page
   &&Number(map?.textbook_page_end||plan.page)===plan.page
   &&norm(map?.title).toLowerCase()===plan.title.toLowerCase()
   &&plan.anchors.every(x=>text.includes(x));
}
function toText(p){
 return 'Tindakan guru: '+lines(p.teacher)+'\nTindakan murid: '+lines(p.pupils)+'\nSemakan: '+p.check+'\nBahan: '+lines(p.resources);
}
function build(map,opts={}){
 if(!applies(map,opts))throw Error('BM1_WEEK29_SOURCE_PLAN_SCOPE_OR_EVIDENCE_MISMATCH');
 const plan=base[Number(map.session_no)];
 const canonical=root.BmYear1CanonicalRph?.build(map,opts);
 if(!canonical)throw Error('BM1_CANONICAL_ENGINE_REQUIRED');
 const phases=plan.stages.map(x=>({...x}));
 const sourceSteps=phases.map((p,i)=>({
   key:'bm1-w29-evidence-s'+map.session_no+'-step-'+(i+1),
   name:p.name,text:toText(p),bbm:lines(p.resources),pak21:plan.pak21,phase:'source-evidence-plan'
 }));
 const differentiation=plan.lanes;
 const librarySteps={};
 for(const key of ['support','core','challenge']){
   const g=differentiation[key];
   librarySteps[key]=[{
     key:'bm1-w29-evidence-s'+map.session_no+'-'+key,
     name:g.label,text:'Tugasan sumber: '+g.task,bbm:lines(g.materials),pak21:plan.pak21,
     phase:'source-evidence-plan'
   }];
 }
 const induction=phases[0],closing=phases.at(-1);
 return {...canonical,
   canonicalBm1:true,sourcePlanBm1:true,sourcePlanReviewStatus:'LESSON_MAP_EVIDENCE_NOT_WORD_APPROVED',
   canonicalVersion:VERSION,sourcePlanVersion:VERSION,sourcePlanSession:'BM1-2026B-W29-S'+map.session_no,
   sourceTask:plan.task,anchor:plan.task,phases,sourceSteps,classroomFlow:sourceSteps,librarySteps,
   differentiation,groupBbm:{
     support:lines(differentiation.support.materials),core:lines(differentiation.core.materials),
     challenge:lines(differentiation.challenge.materials)
   },
   bbmList:['Buku Teks m/s '+plan.page],pak21:plan.pak21,pakDetail:plan.pak21,
   pbd:plan.pbd,pbdEvidence:plan.pbd,reflection:plan.reflection,intervention:[],
   inductionData:{name:induction.name,text:toText(induction),bbm:lines(induction.resources),pak21:plan.pak21},
   setInduksi:toText(induction),penutup:toText(closing),
   diffSupportAct:differentiation.support.task,diffCoreAct:differentiation.core.task,
   diffChallengeAct:differentiation.challenge.task,
   page:'m/s '+plan.page,mainSp:plan.sp,topic:plan.title
 };
}
root.BmYear1Week29SourcePlans={VERSION,availableSessions:[1,3,4],applies,build};
try{if(typeof module!=='undefined'&&module.exports)module.exports=root.BmYear1Week29SourcePlans}catch{}
})(typeof window!=='undefined'?window:globalThis);
