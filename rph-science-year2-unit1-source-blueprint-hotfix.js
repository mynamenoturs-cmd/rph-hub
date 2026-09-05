(function(){
'use strict';
const sk=m=>{try{return window.rphSubjectKey?.(m?.subject_id)||''}catch{return''}};
const sp=m=>String(m?.source_evidence?.meta?.main_sp||m?.source_evidence?.meta?.main_ls||m?.learning_standard||String(m?.sp||'').split(',')[0]||'').trim();
const yr=m=>Number(m?.year||0)||0,wk=m=>Number(m?.week_no||m?.week||0)||0,se=m=>Number(m?.session_no||m?.session||0)||0,pg=m=>Number(m?.textbook_page_start||0)||0;
const key=m=>`${sp(m)}@${pg(m)}|W${wk(m)}|S${se(m)}`;
const ROUTES={
"1.1.1@1|W2|S1":"w2s1","1.1.1@2|W2|S2":"w2s2","1.1.1@2|W2|S3":"w2s3","1.1.1@3|W2|S4":"w2s4","1.1.1@4|W2|S5":"w2s5",
"1.1.2@5|W3|S1":"w3s1","1.1.2@6|W3|S2":"w3s2","1.1.2@6|W3|S3":"w3s3","1.1.2@6|W3|S4":"w3s4","1.1.2@7|W3|S5":"w3s5",
"1.1.3@8|W4|S1":"w4s1","1.1.3@8|W4|S2":"w4s2","1.1.3@8|W4|S3":"w4s3","1.1.3@9|W4|S4":"w4s4","1.1.3@9|W4|S5":"w4s5",
"1.1.4@10|W5|S1":"w5s1","1.1.4@10|W5|S2":"w5s2","1.1.4@10|W5|S3":"w5s3","1.1.4@11|W5|S4":"w5s4","1.1.4@11|W5|S5":"w5s5",
"1.1.4@10|W7|S1":"w7s1","1.1.4@10|W7|S2":"w7s2","1.1.4@10|W7|S3":"w7s3","1.1.4@11|W7|S4":"w7s4","1.1.4@11|W7|S5":"w7s5",
"1.2.1@12|W8|S1":"w8s1","1.2.1@12|W8|S2":"w8s2","1.2.1@12|W8|S3":"w8s3","1.2.2@13|W8|S4":"w8s4","1.2.2@13|W8|S5":"w8s5",
"1.2.2@14|W9|S1":"w9s1","1.2.3@14|W9|S2":"w9s2","1.2.3@14|W9|S3":"w9s3","1.2.3@15|W9|S4":"w9s4","1.2.4@15|W9|S5":"w9s5",
"1.2.4@16|W10|S1":"w10s1","1.2.4@16|W10|S2":"w10s2","1.2.5@16|W10|S3":"w10s3","1.2.5@16|W10|S4":"w10s4","1.2.5@16|W10|S5":"w10s5"
};
const CONDITIONAL=new Set(Object.keys(ROUTES).filter(k=>k.includes('|W10|')));
const REVIEW=new Set([
"1.1.1@1|W2|S1","1.2.2@13|W8|S4","1.2.2@13|W8|S5","1.2.3@15|W9|S4","1.2.4@15|W9|S5",
"1.2.4@16|W10|S1","1.2.4@16|W10|S2","1.2.5@16|W10|S3","1.2.5@16|W10|S4","1.2.5@16|W10|S5"
]);
const PAGE={
1:{title:'Pengenalan Kemahiran Saintifik',task:'Perhatikan situasi pembukaan Buku Teks m/s 1 dan nyatakan apa yang sedang dilakukan oleh murid dalam gambar sebagai pencetus kepada kemahiran memerhati.',support:'Murid menunjuk dua perkara yang dapat dilihat dan menyebut pemerhatian dengan bantuan soalan guru.',core:'Murid menyenaraikan sekurang-kurangnya tiga pemerhatian daripada gambar dan membina satu soalan berdasarkan apa yang dilihat.',challenge:'Murid membezakan pemerhatian daripada andaian menggunakan bukti pada gambar.',evidence:'tiga pemerhatian yang berpunca daripada gambar sumber'},
2:{title:'Memerhati — Proses Membuat Roti',task:'Ikuti urutan membuat roti pada Buku Teks m/s 2 dan perhatikan perubahan bahan dari penyediaan hingga doh mengembang.',support:'Murid menyusun tiga kad urutan utama dan menyebut satu perubahan yang dilihat.',core:'Murid merekod urutan proses dan sekurang-kurangnya dua perubahan yang dapat diperhatikan.',challenge:'Murid menerangkan bukti perubahan doh sebelum dan selepas dibiarkan berdasarkan sumber.',evidence:'urutan proses dan sekurang-kurangnya dua perubahan yang diperhatikan'},
3:{title:'Memerhati Menggunakan Deria',task:'Gunakan Buku Teks m/s 3 untuk mengenal pasti deria yang digunakan ketika melihat perubahan adunan, menghidu roti, merasa, menyentuh dan mendengar bunyi ketuhar.',support:'Murid memadankan tiga tindakan dengan deria yang sesuai.',core:'Murid mengenal pasti deria bagi situasi sumber dan menerangkan maklumat yang diperoleh melalui deria tersebut.',challenge:'Murid membandingkan maklumat yang diperoleh melalui dua deria berbeza.',evidence:'padanan deria dan maklumat pemerhatian yang tepat'},
4:{title:'Memerhatikan Ciri-ciri Bahan',task:'Jalankan aktiviti sumber Buku Teks m/s 4 menggunakan bekas bertutup: perhatikan bahan melalui deria yang sesuai, buat ramalan, buka bekas dan bandingkan ramalan dengan bahan sebenar.',support:'Murid memerhati dua bekas dengan bimbingan dan merekod satu ciri setiap bahan.',core:'Murid membuat pemerhatian, ramalan dan semakan terhadap bahan sebenar bagi semua bekas.',challenge:'Murid menerangkan deria yang paling membantu untuk setiap pemerhatian dan sebabnya.',evidence:'rekod pemerhatian, ramalan dan semakan bahan sebenar'},
5:{title:'Mengelas Haiwan',task:'Perhatikan ciri anggota badan haiwan pada Buku Teks m/s 5 dan kenal pasti ciri sepunya serta ciri berbeza.',support:'Murid memadankan haiwan kepada kad berkepak/tidak berkepak.',core:'Murid mengenal pasti ciri sepunya dan berbeza lalu mengelaskan haiwan berdasarkan bukti sumber.',challenge:'Murid mencadangkan satu ciri lain yang dapat digunakan untuk mengelas kumpulan yang sama.',evidence:'pengelasan haiwan berdasarkan sekurang-kurangnya satu ciri sepunya atau berbeza'},
6:{title:'Mengelas Mengikut Ciri Sepunya dan Berbeza',task:'Gunakan Buku Teks m/s 6 untuk mengelaskan haiwan kepada kumpulan berdasarkan ciri sepunya dan berbeza seperti berkepak/tidak berkepak.',support:'Murid meletakkan kad haiwan pada dua kumpulan yang telah dilabel.',core:'Murid menghasilkan pengelasan lengkap dan menerangkan ciri yang digunakan.',challenge:'Murid mengelaskan semula haiwan menggunakan satu ciri lain dan membandingkan hasil.',evidence:'pengelasan lengkap dengan sebab berdasarkan ciri'},
7:{title:'Mengelaskan Tumbuh-tumbuhan',task:'Ikuti aktiviti Buku Teks m/s 7 untuk mengenal pasti ciri tumbuhan, mengasingkan berbunga/tidak berbunga dan menghasilkan carta pengelasan berbentuk mobail sebelum menerangkan ciri yang digunakan.',support:'Murid mengasingkan gambar tumbuhan kepada dua kumpulan dengan panduan.',core:'Murid menghasilkan carta pengelasan dan menerangkan ciri yang digunakan.',challenge:'Murid membina pengelasan kedua menggunakan satu ciri tumbuhan yang lain.',evidence:'carta pengelasan tumbuhan dan penerangan ciri'},
8:{title:'Mengukur dan Menggunakan Nombor — Berat',task:'Gunakan bahagian Mengukur dan Menggunakan Nombor pada Buku Teks m/s 8 untuk membaca ukuran berat menggunakan alat penimbang dan membandingkan nilai yang direkod.',support:'Murid membaca dua nilai berat dengan bimbingan.',core:'Murid merekod ukuran berat menggunakan nombor dan unit yang sesuai lalu membuat perbandingan.',challenge:'Murid menerangkan perbezaan dua ukuran berdasarkan nilai yang direkod.',evidence:'bacaan ukuran dengan nombor dan unit yang betul'},
9:{title:'Mengukur Ukur Lilit Kepala',task:'Jalankan aktiviti Buku Teks m/s 9: ukur ukur lilit kepala menggunakan reben, tandakan panjang, ukur dengan pembaris, rekodkan data dan bandingkan hasil dengan pasangan.',support:'Murid mengukur dengan bimbingan menggunakan reben dan pembaris.',core:'Murid mengambil ukuran, merekod nilai dan membandingkan dengan pasangan.',challenge:'Murid menilai satu alat lain yang sesuai untuk mengukur ukur lilit kepala dan memberi sebab.',evidence:'ukuran, rekod nombor dan perbandingan data pasangan'},
10:{title:'Berkomunikasi — Jadual Tugas',task:'Perhatikan jadual tugas Kelas 2 Arif pada Buku Teks m/s 10 dan gunakan maklumat jadual untuk menjawab soalan serta menyampaikan dapatan.',support:'Murid mencari dua maklumat mudah daripada jadual dengan bimbingan.',core:'Murid membaca jadual dan menyampaikan jawapan lengkap berdasarkan data.',challenge:'Murid membina satu soalan baharu yang boleh dijawab menggunakan jadual.',evidence:'jawapan yang tepat berdasarkan maklumat dalam jadual'},
11:{title:'Berkomunikasi dalam Pelbagai Bentuk',task:'Gunakan Buku Teks m/s 11 untuk menjawab soalan berdasarkan jadual, membacakan jawapan dan mengenal bentuk komunikasi seperti carta, graf, gambar atau model.',support:'Murid menjawab dua soalan dan memilih bentuk komunikasi yang sesuai.',core:'Murid merekod jawapan dan menyampaikan maklumat secara lisan atau visual.',challenge:'Murid menukar satu maklumat jadual kepada bentuk komunikasi lain yang sesuai.',evidence:'maklumat yang direkod dan disampaikan dalam bentuk yang sesuai'},
12:{title:'Kemahiran Manipulatif',task:'Perhatikan amalan kemahiran manipulatif pada Buku Teks m/s 12, termasuk menggunakan peralatan/bahan dengan betul dan mengendalikan spesimen dengan cermat.',support:'Murid mengenal pasti dua amalan yang betul daripada gambar sumber.',core:'Murid menerangkan cara mengendalikan peralatan, bahan dan spesimen berdasarkan contoh sumber.',challenge:'Murid membandingkan satu amalan betul dengan satu risiko jika amalan tidak dipatuhi.',evidence:'pengenalpastian dan penerangan amalan manipulatif yang betul'},
13:{title:'Melakar, Membersih dan Menyimpan',task:'Gunakan Buku Teks m/s 13 untuk memerhati contoh melakar spesimen/peralatan, membersihkan peralatan dan menyimpan peralatan serta bahan sains dengan betul.',support:'Murid memadankan tiga gambar dengan tindakan melakar, membersih atau menyimpan.',core:'Murid menerangkan urutan amalan yang betul bagi contoh pada sumber.',challenge:'Murid mengenal pasti tindakan yang berkaitan dengan SP route dan menerangkan bukti pada halaman.',evidence:'penerangan amalan manipulatif berdasarkan gambar sumber'},
14:{title:'Kenali Siput',task:'Jalankan aktiviti Buku Teks m/s 14: kendalikan siput kebun dengan cermat, gunakan kanta pembesar untuk memerhati, lakar dan label, lepaskan semula ke habitat, kemudian bersihkan tangan/peralatan.',support:'Murid mengikuti langkah pengendalian dan menghasilkan lakaran mudah dengan bimbingan.',core:'Murid mengendalikan spesimen dengan cermat, memerhati, melakar dan melabel mengikut langkah sumber.',challenge:'Murid menerangkan sebab menggunakan kanta pembesar dan sebab spesimen perlu dilepaskan semula.',evidence:'pengendalian spesimen dan lakaran berlabel berdasarkan pemerhatian'},
15:{title:'Rekreasi Sains / Saya Ingat',task:'Gunakan Buku Teks m/s 15 untuk menjalankan Rekreasi Sains Kertas Pelangi dan menyemak semula senarai Kemahiran Proses Sains serta Kemahiran Manipulatif dalam bahagian Saya Ingat.',support:'Murid mengikuti langkah utama aktiviti dan memilih kemahiran yang digunakan.',core:'Murid menjalankan aktiviti sumber dan memadankan tindakannya dengan kemahiran manipulatif yang relevan.',challenge:'Murid menerangkan kemahiran yang digunakan dengan bukti daripada langkah aktiviti.',evidence:'penerangan kemahiran berdasarkan aktiviti dan bahagian Saya Ingat'},
16:{title:'Saya Jawab — Kemahiran Saintifik',task:'Gunakan Buku Teks m/s 16 untuk menjawab soalan ulang kaji tentang deria, pengelasan, ukuran dan kemahiran manipulatif. Kekalkan tugasan Saya Jawab; jangan cipta penyiasatan baharu untuk memaksa SP route.',support:'Murid menjawab item terpilih dengan panduan visual.',core:'Murid menyelesaikan item Saya Jawab dan menerangkan alasan bagi jawapan berkaitan kemahiran manipulatif.',challenge:'Murid membetulkan satu jawapan menggunakan bukti daripada unit dan menerangkan sebab pembetulan.',evidence:'jawapan ulang kaji yang disokong bukti daripada kandungan unit'}
};
const OBJ={
'1.1.1@1':['menyatakan sekurang-kurangnya tiga pemerhatian berdasarkan gambar pembukaan','tiga pemerhatian berpunca daripada bukti visual'],
'1.1.1@2':['merekod urutan proses dan sekurang-kurangnya dua perubahan yang diperhatikan','urutan dan perubahan direkod dengan tepat'],
'1.1.1@3':['mengenal pasti deria yang digunakan dan maklumat yang diperoleh','sekurang-kurangnya empat padanan deria tepat'],
'1.1.1@4':['membuat pemerhatian dan ramalan bahan sebelum menyemak bahan sebenar','rekod pemerhatian dan ramalan dibandingkan dengan bahan sebenar'],
'1.1.2@5':['mengelaskan haiwan berdasarkan ciri sepunya dan berbeza','pengelasan disokong sekurang-kurangnya satu ciri'],
'1.1.2@6':['mengelaskan haiwan kepada kumpulan berdasarkan ciri yang dipilih','kumpulan dan sebab pengelasan tepat'],
'1.1.2@7':['mengelaskan tumbuhan dan menghasilkan carta pengelasan','carta membezakan kumpulan berdasarkan ciri yang dinyatakan'],
'1.1.3@8':['membaca dan merekod ukuran menggunakan nombor serta unit yang sesuai','bacaan ukuran dan unit dicatat dengan betul'],
'1.1.3@9':['mengukur, merekod dan membandingkan ukur lilit kepala','ukuran direkod dan dibandingkan dengan betul'],
'1.1.4@10':['mendapatkan dan menyampaikan maklumat berdasarkan jadual','jawapan boleh dijejaki kepada data jadual'],
'1.1.4@11':['merekod serta menyampaikan maklumat dalam bentuk yang sesuai','maklumat disampaikan dengan tepat dalam sekurang-kurangnya satu bentuk'],
'1.2.1@12':['mengenal pasti amalan menggunakan peralatan dan bahan sains dengan betul','sekurang-kurangnya tiga amalan diterangkan dengan tepat'],
'1.2.2@13':['menyelesaikan tugasan sumber tentang melakar, membersih dan menyimpan sambil mengenal tindakan pengendalian yang relevan','jawapan berpunca daripada contoh sebenar pada halaman'],
'1.2.2@14':['mengendalikan spesimen siput dengan betul dan cermat','langkah pengendalian spesimen dipatuhi dan diterangkan'],
'1.2.3@14':['melakar dan melabel siput berdasarkan pemerhatian','lakaran mempunyai label berdasarkan pemerhatian sebenar'],
'1.2.3@15':['menyelesaikan aktiviti sumber dan mengenal kemahiran manipulatif yang digunakan','kemahiran yang disebut disokong langkah aktiviti'],
'1.2.4@15':['mengenal amalan membersihkan peralatan melalui aktiviti dan Saya Ingat','penerangan merujuk langkah atau ringkasan sumber'],
'1.2.4@16':['menjawab item Saya Jawab berkaitan kemahiran manipulatif','jawapan ulang kaji tepat dan disokong bukti'],
'1.2.5@16':['menjawab item Saya Jawab berkaitan penyimpanan/peralatan secara tepat','jawapan ulang kaji tepat dan disokong bukti']
};
const REVIEW_NOTE='Padanan SP/halaman perlu semakan guru. Kekalkan tugasan sebenar Buku Teks; jangan cipta aktiviti lain untuk memaksa padanan.';
function mode(m){return sk(m)==='science'&&yr(m)===2?(ROUTES[key(m)]||''):''}
function blueprint(m){
 const md=mode(m);if(!md)return null;const route=key(m),p=pg(m),src=PAGE[p],pair=OBJ[`${sp(m)}@${p}`];if(!src||!pair)return null;
 const review=REVIEW.has(route),conditional=CONDITIONAL.has(route),ref=`Buku Teks m/s ${p}`;
 const mk=(suffix,name,text,pak21)=>({key:`science-y2-u1-${md}-${suffix}`,name,text,bbm:ref,pak21,phase:'source'});
 return {
   method:'Source-first Sains Tahun 2',kind:'source',topic:src.title,mainSp:sp(m),page:ref,
   sourceTask:src.task,anchor:src.task,setInduksi:src.induction||src.task,
   inductionData:{name:src.title,text:src.induction||src.task,bbm:ref,pak21:'Think-Pair-Share'},
   librarySteps:{support:[mk('support','Sokongan Sumber',src.support,'Guided Practice')],core:[mk('core','Tugas Teras Sumber',src.core,'Source Investigation')],challenge:[mk('challenge','Cabaran Berbukti',src.challenge,'Evidence Talk')]},
   diffSupport:src.support,diffCore:src.core,diffChallenge:src.challenge,diffSupportAct:src.support,diffCoreAct:src.core,diffChallengeAct:src.challenge,
   pbdEvidence:{method:'Pemerhatian + hasil tugasan sumber + komunikasi murid',evidence:src.evidence,criterion:pair[1]},
   objective:`Pada akhir PdP, murid dapat ${pair[0]} berpandukan ${ref}.`,successCriteria:`Murid berjaya apabila ${pair[1]}.`,
   penutup:`Murid berkongsi satu bukti daripada ${ref} yang menunjukkan apa yang dipelajari dalam tugasan sumber.`,
   generateFlag:conditional?'CONDITIONAL':'YES',conditional,conditionalNote:conditional?'W10 ialah partial teaching week; jana hanya jika kelas sebenar berlangsung mengikut jadual guru.':'',
   alignmentReviewRequired:review,alignmentReviewNote:review?REVIEW_NOTE:'',
   provenance:{mappingPolicy:'Gunakan exact SP@BT-printed-page|Wweek|Ssession daripada RPT Sains Tahun 2 versi murni; blueprint ini tidak membina semula Lesson Mapping.',sourcePolicy:'Aktiviti sebenar Buku Teks menentukan kandungan RPH; tajuk seksyen sahaja tidak boleh menggantikan tugasan sumber.',activityLibraryPolicy:'Activity Library may vary delivery only and must not determine lesson content',activityBookPolicy:'Tiada buku aktiviti berasingan dibekalkan untuk batch ini; jangan reka kandungan Buku Aktiviti.',week6Policy:'W6 ialah cuti Tahun Baru Cina dan tidak mempunyai route RPH biasa.',week10Policy:'W10 kekal CONDITIONAL kerana minggu pengajaran separa; semak jadual sebenar sebelum penjanaan.',verificationPolicy:'Blueprint runtime ini tidak mengubah Lesson Mapping atau verification status.'}
 };
}
const prevEff=window.effectiveRphLessonMap;
if(typeof prevEff==='function')window.effectiveRphLessonMap=function(map,ev,built){const out=prevEff(map,ev,built)||map,bp=blueprint(out);if(!bp)return out;return {...out,objective:bp.objective,success_criteria:bp.successCriteria,_runtime_science_year2_unit1_source_blueprint:mode(out),_source_first_alignment_review:bp.alignmentReviewRequired,_source_first_conditional:bp.conditional};};
const prevPed=window.buildSourceAwarePedagogy;
if(typeof prevPed==='function')window.buildSourceAwarePedagogy=function(map,activities,btRef,uiEn,classId=null){const base=prevPed(map,activities,btRef,uiEn,classId),bp=blueprint(map);if(uiEn||!bp)return base;return {...base,...bp};};
window.scienceYear2Unit1SourceBlueprint=blueprint;
window.__RPH_SCIENCE_YEAR2_UNIT1_SOURCE_BLUEPRINT__={version:'2026-09-05a',routes:Object.keys(ROUTES).length};
console.info('RPH Science Year 2 Unit 1 source-first blueprint active.');
})();
