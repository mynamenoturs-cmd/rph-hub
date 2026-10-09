// BM Tahun 2, Minggu 29, Kumpulan B 2026: pelan sesi khusus daripada
// RPT murni + DSKP + Buku Teks Jilid 2 m/s 33-37 (source_evidence.textbook).
// M29 S1 verified; S2-S5 masih needs_review. Modul TIDAK menaikkan status.
// Aktivasi hanya selepas Accuracy Gate asal dan bukti halaman/sesi/SP padan.
// BUKAN salinan Word diluluskan atau penggantian approved snapshot.
(function(root){
'use strict';
const VERSION='BM2-W29-SOURCE-PLANS-20261009a';
const norm=v=>String(v==null?'':v).replace(/\s+/g,' ').trim();
const phase=(name,teacher,pupil,check)=>({name,teacher,pupil,check});
const P={
 1:{
  title:'Mural Penutup Botol',sp:'5.3.1',page:33,anchors:['mural penutup botol','cikgu munirah','frasa nama'],
  task:'Kenal pasti pola FN+FN, FN+FA, FN+FK dan FN+FS daripada contoh halaman 33, kemudian bina ayat yang menepati pola dipilih.',
  objective:'Pada akhir PdP, murid dapat mengenal pasti empat pola ayat dan membina sekurang-kurangnya tiga ayat berdasarkan frasa pada Buku Teks m/s 33.',
  criteria:'Murid mengelaskan sekurang-kurangnya tiga contoh ayat mengikut pola yang betul dan membina tiga ayat gramatis dengan pola yang dapat dijelaskan.',
  phases:[
   phase('Perhatikan projek mural','Minta murid meneliti tajuk Mural Penutup Botol dan gambar/prosa tentang Elis, rakan-rakannya dan Cikgu Munirah.','Nyatakan aktiviti menghias dinding kantin dengan penutup botol.','Jawapan berpunca daripada cerita projek mural, bukan meneka hasil projek lain.'),
   phase('Baca contoh dan asingkan dua bahagian','Tunjukkan contoh “Cikgu Munirah guru Pendidikan Seni” dan “Mereka sangat teruja”; bimbing murid mengenal frasa subjek serta predikat.','Baca kedua-dua contoh dan tunjuk bahagian Frasa Nama serta Frasa Nama/Adjektif.','Bezakan FN+FN daripada FN+FA pada contoh asal.'),
   phase('Kesan FN+FK dan FN+FS','Rujuk contoh “Mereka membantu Cikgu Munirah” dan “Elis dan rakan-rakannya ke sekolah”; jelaskan fungsi bahagian selepas FN.','Padankan contoh kepada FN+FK dan FN+FS dengan merujuk jadual buku.','Padanan pola disemak pada jadual m/s 33.'),
   phase('Bina ayat berdasarkan frasa','Minta murid memilih sekurang-kurangnya tiga pola daripada jadual dan membina ayat baharu yang menepati fungsi frasa.','Tulis tiga ayat sendiri dan catat pola masing-masing; gunakan cerita projek mural sebagai konteks.','Ayat murid ialah hasil latihan, bukan ayat yang didakwa tercetak pada buku.'),
   phase('Semak tulisan individu','Semak subjek/predikat dan pola setiap ayat; tandakan kesalahan pola dan minta pembetulan.','Baca ayat sendiri, kenal pasti pola, baiki satu ayat selepas maklum balas.','Rekod bilangan pola tepat dan ayat yang menepati pola secara individu.'),
   phase('Rumus empat pola','Ajak murid menyebut FN+FN, FN+FA, FN+FK dan FN+FS menggunakan contoh yang benar-benar dibaca.','Pilih satu pola dan nyatakan satu contoh ayat yang telah disemak.','Penutup kekal pada kemahiran membina ayat, bukan kerja menghasilkan mural.')
  ],
  lanes:{
   support:['Padankan empat ayat contoh kepada pola berlabel sebelum membina dua atau tiga ayat berpandu.','Tunjuk contoh satu demi satu; beri rangka subjek tanpa membekalkan predikat lengkap.','Padankan frasa, pilih pola, bina ayat sendiri dengan bantuan direkod.','Padanan pola dan sekurang-kurangnya satu ayat betul; bantuan dicatat.'],
   core:['Bina tiga ayat menggunakan sekurang-kurangnya tiga pola daripada Buku Teks m/s 33.','Semak subjek dan jenis frasa predikat berdasarkan jadual asal.','Baca empat contoh, tulis tiga ayat dan labelkan pola setiap ayat.','Tiga ayat gramatis dan pola sepadan.'],
   challenge:['Bina empat ayat, satu bagi setiap pola FN+FN, FN+FA, FN+FK, FN+FS; huraikan satu pilihan pola.','Minta bukti jenis frasa daripada ayat dan jadual buku, bukan fakta tambahan.','Tulis empat ayat, labelkan setiap pola, jelaskan subjek dan predikat satu ayat.','Keempat-empat pola tepat dan huraian berpandukan ciri frasa.']
  },
  pbd:{method:'Semakan lembaran ayat individu dan penjelasan lisan tentang pola.',evidence:'Tiga ayat bertulis murid dengan label pola serta pembetulan yang dibuat selepas semakan.',criterion:'Padanan sekurang-kurangnya tiga pola dan tiga ayat gramatis; tahap bantuan direkod.'},
  reflection:'Disemak: ____ / ____. Padanan pola tepat: ____. Ayat lengkap: ____. Perlu bimbingan FN/FA/FK/FS: ____. Susulan: ____.'
 },
 2:{
  title:'Bilik Darjah Mesra Alam',sp:'5.3.1',page:34,anchors:['bilik darjah mesra alam','ayat penyata','elis membawa pokok bunga'],
  task:'Kenal pasti ayat penyata pada petikan landskap bilik darjah, kemudian lengkapkan dua ayat penyata yang masih kosong dengan keterangan tepat.',
  objective:'Pada akhir PdP, murid dapat mengenal pasti sekurang-kurangnya tiga ayat penyata dan menulis dua ayat penyata untuk melengkapkan aktiviti Buku Teks m/s 34.',
  criteria:'Murid memilih tiga ayat yang menyatakan maklumat dan menulis dua ayat penyata gramatis berkaitan landskap bilik darjah.',
  phases:[
   phase('Baca situasi landskap','Buka Buku Teks m/s 34 dan baca tujuan projek landskap mesra alam yang diterangkan Cikgu Hanum.','Nyatakan tujuan membawa pokok bunga dan barangan kitar semula.','Isi disebut pada petikan, bukan andaian tentang hiasan lain.'),
   phase('Kenal fungsi ayat penyata','Tunjukkan Info Bahasa: ayat penyata menyatakan atau memberikan keterangan.','Terangkan dengan ayat mudah fungsi ayat penyata dan baca satu contoh daripada halaman.','Bezakan menyatakan maklumat daripada bertanya atau menyuruh.'),
   phase('Jejak ayat pokok bunga','Baca contoh Elis membawa pokok bunga, Komala membawa pasu dan murid menyusun tanaman pada satu sudut.','Gariskan sekurang-kurangnya tiga ayat penyata pada bahan.','Ayat yang dipilih mestilah wujud pada m/s 34.'),
   phase('Lengkapkan dua ayat kosong','Tunjukkan dua tempat kosong pada senarai aktiviti; minta murid menulis ayat penyata berkaitan susun atur bahan yang dipaparkan.','Tulis dua ayat ciptaan sendiri berdasarkan gambar/petikan, bukan menyalin jawapan rakan.','Kedua-dua ayat memberikan maklumat, bukan soalan atau ayat perintah.'),
   phase('Semakan individu ayat penyata','Semak tiga contoh dipilih dan dua ayat baharu; minta pembetulan subjek, predikat atau tanda noktah.','Baca ayat dan baiki satu kesalahan berdasarkan maklum balas.','Catat jumlah ayat tepat dan bantuan individu.'),
   phase('Rumus bahasa dan alam sekitar','Pilih satu ayat murid yang tepat untuk menerangkan landskap mesra alam.','Sebut satu contoh ayat penyata yang menyampaikan maklumat daripada halaman.','Penutup berfokus ayat penyata dalam konteks bilik darjah.')
  ],
  lanes:{
   support:['Kenal pasti dua contoh ayat penyata dan lengkapkan dua ayat menggunakan rangka berpandu.','Tunjukkan satu ayat contoh dan rangka subjek berkaitan pokok bunga.','Jejak contoh dalam buku, isi predikat sendiri dan semak bersama guru.','Ayat memberi keterangan lengkap; bantuan dicatat.'],
   core:['Pilih tiga ayat penyata dan tulis dua ayat baharu untuk dua tempat kosong.','Semak fungsi menyatakan maklumat dan kaitan dengan petikan/gambar.','Gariskan tiga contoh, lengkapkan dua tempat kosong dan semak noktah.','Tiga contoh betul dan dua ayat baharu gramatis.'],
   challenge:['Tulis dua ayat penyata yang menambah maklumat berlainan tentang landskap bilik darjah.','Minta murid menerangkan mengapa kedua-dua ayat tersebut ayat penyata.','Tulis dua ayat, jelaskan subjek/predikat dan banding maklumat yang disampaikan.','Kedua-dua ayat lengkap dan alasan berkaitan fungsi ayat penyata.']
  },
  pbd:{method:'Semakan tulisan individu dan soal jawab mengenal fungsi ayat penyata.',evidence:'Tiga ayat penyata daripada bahan dan dua ayat murid pada tempat kosong.',criterion:'Ayat yang dikenal pasti serta dibina menyatakan maklumat dan ditulis secara gramatis.'},
  reflection:'Disemak: ____ / ____. Kenal ayat penyata: ____. Dua ayat lengkap: ____. Bantuan: ____. Susulan: ____.'
 },
 3:{
  title:'Jimatkan Petrol',sp:'1.1.3',page:35,anchors:['jimatkan petrol','kereta menjadi berat','banyak asap'],
  task:'Dengar pesanan ayah dalam dialog Elis, tafsir sebab mengeluarkan barang daripada kereta dan simulasikan pesanan kepada abang.',
  objective:'Pada akhir PdP, murid dapat memberikan sekurang-kurangnya tiga respons tepat tentang pesanan ayah dan sebab penjimatan petrol melalui simulasi dialog.',
  criteria:'Murid menyatakan arahan mengeluarkan barang, hubungan berat kereta dengan penggunaan petrol dan kesan asap kepada udara.',
  phases:[
   phase('Kenal pesanan ayah','Tunjukkan dialog Elis bersama ayah pada m/s 35; bacakan bahagian pesanan dengan jelas.','Dengar dan nyatakan siapa perlu mengeluarkan barang daripada kereta.','Pesanan ditujukan kepada abang melalui Elis.'),
   phase('Kesan sebab kereta berat','Baca bahagian menerangkan barang banyak menjadikan kereta berat.','Sebut akibat kereta yang berat terhadap penggunaan petrol.','Murid menghubungkan berat kereta dengan keperluan petrol yang lebih banyak.'),
   phase('Tafsir kesan asap','Bimbing murid meneliti ayat tentang banyak asap dan udara menjadi kotor.','Terangkan mengapa mengurangkan barang membantu alam sekitar menurut dialog.','Tafsiran tidak menambah angka penggunaan petrol yang tiada pada bahan.'),
   phase('Sambung dialog pesanan','Paparkan tempat kosong dalam dialog abang dan Elis; berikan contoh giliran bercakap, bukan jawapan penuh.','Lengkapkan secara lisan pesanan ayah kepada abang dengan kata sendiri.','Isi pesanan mengandungi mengeluarkan barang dan menyimpan di bilik stor.'),
   phase('Simulasi dan respons individu','Pasangkan murid menjadi Elis dan abang; tukar peranan dan dengar respons individu.','Sampaikan pesanan dan jawab mengapa barang perlu dikeluarkan.','Rekod tiga isi utama, ketepatan respons dan sokongan yang diperlukan.'),
   phase('Rumus pesanan dan amanah','Minta murid menyebut kembali tindakan yang patut dibuat selepas menerima pesanan ayah.','Nyatakan tindakan mengeluarkan barang dengan satu sebab.','Penutup mengekalkan nilai amanah daripada situasi sumber.')
  ],
  lanes:{
   support:['Sampaikan pesanan ayah kepada abang menggunakan dua petunjuk dialog buku.','Bacakan frasa dialog satu demi satu; petik kata kunci kereta berat, petrol dan asap.','Dengar pesanan, ulang dengan kata sendiri, jawab satu soalan sebab.','Mesej utama tepat dan bantuan direkod.'],
   core:['Simulasikan dialog Elis–abang dan nyatakan tiga isi pesan serta sebab.','Dengar pertuturan setiap murid walaupun latihan dilakukan berpasangan.','Baca dialog sumber, sampaikan pesanan dan jawab dua soalan sebab-akibat.','Tiga maklumat tepat disampaikan secara individu.'],
   challenge:['Tafsir hubungan barang banyak, penggunaan petrol dan pencemaran udara tanpa menambah fakta luar.','Tanya bukti ayat yang menyokong setiap tafsiran.','Sampaikan pesanan lengkap dan beri dua penjelasan sebab-akibat.','Tiga isi disokong maklumat dialog sebenar.']
  },
  pbd:{method:'Pemerhatian pertuturan individu ketika simulasi pesanan.',evidence:'Pesanan kepada abang, sebab kereta berat menggunakan lebih petrol dan kesan banyak asap.',criterion:'Tiga maklumat penting tepat serta respons sesuai dan difahami.'},
  reflection:'Disemak bertutur: ____ / ____. Isi pesan tepat: ____. Tafsiran sebab-akibat: ____. Bantuan: ____. Susulan: ____.'
 },
 4:{
  title:'Gunakan Air Secara Berhemat',sp:'2.3.2',page:36,anchors:['gunakan air secara berhemat','kurangkan masa mandi','pili'],
  task:'Baca dan persembahkan petikan syarahan tentang penjimatan air dengan sebutan, intonasi dan gaya yang sesuai.',
  objective:'Pada akhir PdP, murid dapat membaca petikan syarahan m/s 36 dengan sebutan serta intonasi sesuai dan mempersembahkan sekurang-kurangnya satu bahagian secara individu.',
  criteria:'Murid membaca satu bahagian syarahan dengan sebutan jelas, jeda tanda baca dan gaya penyampaian yang sepadan.',
  phases:[
   phase('Kenal bentuk syarahan','Buka m/s 36 dan tunjuk salam hormat, tajuk syarahan dan penutup “Sekian, terima kasih”.','Kenal pasti pembukaan, isi dan penutup syarahan.','Ketiga-tiga bahagian diambil daripada teks.'),
   phase('Model suara syarahan','Bacakan pembukaan sebagai model dengan sebutan, jeda serta intonasi yang sesuai.','Dengar dan tandakan tempat berhenti dalam teks.','Model suara disediakan oleh guru; tiada audio sumber diandaikan.'),
   phase('Jejak tiga cara berjimat','Arahkan murid mencari isi pertama, kedua dan ketiga: mandi singkat, tadah air, tutup pili.','Nyatakan tiga isi mengikut turutan buku sebelum latihan pembacaan.','Respons mengikut isi sebenar tanpa mengubah maksud.'),
   phase('Latih persembahan petikan','Minta murid berlatih satu bahagian syarahan dengan rakan; bimbing tekanan dan jeda pada penanda “Pertama”, “Kedua”, “Ketiga”.','Baca dengan gaya syarahan bukan membaca laju tanpa jeda.','Pemerhatian memberi tumpuan gaya bacaan dan intonasi.'),
   phase('Semakan bacaan individu','Dengar setiap murid membaca pembukaan atau perenggan pilihan secara sendiri.','Persembahkan bahagian dipilih dan baiki sebutan selepas maklum balas.','Catat sebutan, intonasi dan penguasaan giliran individu.'),
   phase('Tutup syarahan','Tunjukkan kesimpulan bahawa penggunaan air berhemat mengelakkan pembaziran.','Sampaikan satu isi penjimatan air dengan intonasi syarahan.','Pengajaran dan PBD kekal kepada kemahiran bacaan/persembahan.')
  ],
  lanes:{
   support:['Baca satu perenggan pendek dengan penanda jeda dan contoh suara guru.','Modelkan pembukaan, latih frasa sukar dan dengar percubaan individu.','Ikut model, baca sendiri bahagian pendek, ulang selepas pembetulan.','Sebutan dapat difahami; jeda asas dan bantuan direkod.'],
   core:['Baca satu bahagian syarahan yang mempunyai isi dan penanda wacana.','Perhatikan kejelasan sebutan dan intonasi semasa murid membaca sendiri.','Kenal struktur syarahan, berlatih dan baca satu perenggan.','Sebutan tepat dan intonasi sesuai dengan jenis teks.'],
   challenge:['Persembahkan pembukaan dan satu isi syarahan dengan gaya yakin serta penekanan bermakna.','Semak jeda, penekanan pada isi dan tempo tanpa memanjangkan teks rekaan.','Berlatih dua bahagian, baca dengan penekanan dan semak kesan kepada pendengar.','Sebutan, jeda, intonasi dan gaya penyampaian sesuai.']
  },
  pbd:{method:'Pemerhatian bacaan syarahan individu.',evidence:'Bacaan sebenar satu bahagian syarahan dengan sebutan, jeda dan intonasi.',criterion:'Sebutan jelas dan gaya persembahan sepadan dengan petikan bukan sastera.'},
  reflection:'Disemak membaca: ____ / ____. Sebutan jelas: ____. Intonasi/gaya sesuai: ____. Giliran susulan: ____. Susulan: ____.'
 },
 5:{
  title:'Amalan Hijau dalam Kehidupan',sp:'3.2.2',page:37,anchors:['amalan hijau dalam kehidupan','peralatan elektrik cekap','baja kompos'],
  task:'Jawab empat soalan bertumpu dan bercapah pada m/s 37 berdasarkan amalan keluarga Elis serta bukti pada gambar/teks.',
  objective:'Pada akhir PdP, murid dapat menulis jawapan bagi empat soalan pemahaman pada Buku Teks m/s 37 dengan fakta yang sesuai dan satu alasan.',
  criteria:'Murid menjawab soalan tentang amalan hijau keluarga Elis, peralatan cekap tenaga, penilaian keberkesanan amalan dan satu amalan diri.',
  phases:[
   phase('Baca tiga amalan keluarga Elis','Buka m/s 37 dan teliti kisah ibu, abang sepupu dan pak cik Elis.','Nyatakan penggunaan alat elektrik cekap tenaga, pengangkutan awam dan baja kompos.','Tiga amalan dirujuk pada gambar serta teks, bukan amalan tambahan.'),
   phase('Padan sebab dan kesan','Tunjukkan label menjimatkan elektrik, kurang asap kenderaan dan kurang bahan kimia.','Padankan setiap amalan dengan sebab yang dicetak pada buku.','Maklumat sebab/kesan diambil terus daripada sumber.'),
   phase('Jawab soalan fakta pertama dan kedua','Baca dua soalan awal buku tentang amalan keluarga dan tujuan menggunakan alat cekap tenaga.','Tulis dua jawapan sendiri berdasarkan petikan dan label.','Dua jawapan tepat menyebut isi yang benar-benar disediakan.'),
   phase('Tulis alasan soalan ketiga','Bimbing murid membaca soalan “Setujukah kamu…? Mengapa?” dan tunjuk cara menyokong pendirian dengan isi sumber.','Tulis pendirian serta satu alasan daripada tiga amalan tersebut.','Alasan boleh disemak pada gambar/teks, bukan pendapat tanpa bukti.'),
   phase('Respons individu soalan keempat','Minta murid menjawab tentang amalan hijau sendiri dan semak semua empat respons secara individu.','Tulis satu amalan diri sebagai jawapan terbuka; semak ayat dan ejaan.','Bezakan jawapan berdasarkan sumber dengan contoh pengalaman murid.'),
   phase('Kongsi satu tindakan hijau','Minta murid menyimpulkan satu amalan hijau yang telah dibincang dan satu manfaatnya.','Baca satu jawapan berserta alasannya.','Penutup mengukuhkan kemahiran menulis jawapan, bukan projek hijau baharu.')
  ],
  lanes:{
   support:['Jawab empat soalan buku dengan penanda fakta dan rangka jawapan ringkas.','Tunjukkan lokasi isi ibu, abang sepupu, pak cik serta tiga label sebab.','Jejak fakta, tulis jawapan berpandu dan nyatakan satu alasan daripada sumber.','Jawapan fakta tepat; ayat terbuka sendiri; bantuan dicatat.'],
   core:['Tulis empat jawapan pemahaman; sertakan satu alasan jelas untuk soalan ketiga.','Baca semula setiap soalan dan padankan dengan bukti halaman.','Jawab soalan 1 hingga 4 dan semak jawapan dengan petikan.','Empat jawapan relevan dan alasan disokong bukti.'],
   challenge:['Jawab empat soalan dengan penjelasan dua sebab daripada amalan hijau keluarga Elis.','Minta bukti berasingan untuk kesan penggunaan tenaga dan asap kenderaan.','Tulis empat jawapan dan huraikan hubungan satu amalan dengan kesannya.','Fakta sumber tidak terbalik dan huraian mempunyai sebab yang jelas.']
  },
  pbd:{method:'Semakan empat jawapan tulisan individu dan alasan bersumber.',evidence:'Jawapan empat soalan m/s 37 termasuk sebab alat cekap tenaga dan pendirian beralasan.',criterion:'Fakta tepat, alasan jelas dan jawapan pengalaman diri ditandakan sebagai contoh murid.'},
  reflection:'Disemak menulis: ____ / ____. Empat jawapan lengkap: ____. Alasan bersumber: ____. Bantuan: ____. Susulan: ____.'
 }
};
function key(m,opts={}){
 if(opts.subjectKey)return opts.subjectKey;
 try{return root.rphSubjectKey?.(m?.subject_id)||m?.subject_key||''}catch{return m?.subject_key||''}
}
function selected(m,opts={}){
 if(key(m,opts)!=='bm'||Number(m?.year)!==2||Number(m?.academic_year)!==2026||Number(m?.week_no)!==29)return null;
 const p=P[Number(m.session_no)]; if(!p)return null;
 return p;
}
function applies(m,opts={}){
 const p=selected(m,opts),meta=m?.source_evidence?.meta||{};
 if(!p)return false;
 const text=norm(m?.source_evidence?.textbook?.text).toLowerCase();
 return m?.verification_status==='verified'&&m?.week_exact===true&&m?.sp_crosscheck===true
   &&meta.session_exact===true&&meta.page_route_verified===true
   &&norm(meta.main_sp)===p.sp&&norm(m.sp)===p.sp
   &&Number(m.textbook_page_start)===p.page&&Number(m.textbook_page_end||p.page)===p.page
   &&norm(m.title).toLowerCase()===p.title.toLowerCase()
   &&p.anchors.every(a=>text.includes(a));
}
function toText(x,page){
 return 'Tindakan guru: '+x.teacher+'\nTindakan murid: '+x.pupil+'\nSemakan: '+x.check+
  '\nBahan: Buku Teks m/s '+page;
}
const labels={support:'Peneroka',core:'Pembina',challenge:'Pencabar'};
function prepare(m,prior,opts={}){
 if(!applies(m,opts))throw Error('BM2_WEEK29_EVIDENCE_OR_APPROVAL_GATE_REQUIRED');
 const p=P[Number(m.session_no)],pg='Buku Teks m/s '+p.page;
 const phases=p.phases.map(x=>({...x}));
 const sourceSteps=phases.map((x,i)=>({
  key:'bm2-w29-s'+m.session_no+'-source-'+(i+1),
  name:x.name,text:toText(x,p.page),bbm:pg,phase:'source-evidence-plan',
  pak21:'Teliti–Bincang–Laksana–Semak: latihan pasangan tidak mengganti evidens individu.'
 }));
 const differentiation={},librarySteps={},groupBbm={};
 for(const level of ['support','core','challenge']){
  const lane=p.lanes[level],task=lane[0];
  differentiation[level]={label:labels[level],support_description:'Tugasan halaman yang sama; bantuan dan tahap cabaran berbeza tanpa menukar SP.',
   task,materials:[pg],teacher:[lane[1]],pupil_steps:[lane[2]],
   example:{teacher:'Apakah bukti jawapan pada Buku Teks?',pupil:'Saya merujuk bahan pada halaman.'},
   product:lane[2],criterion:lane[3],next_step:'Semak semula sumber dan ulang tugasan berdasarkan maklum balas individu.'};
  librarySteps[level]=[{key:'bm2-w29-s'+m.session_no+'-'+level,name:labels[level],
   text:'Tugasan sumber: '+task+' Tindakan guru: '+lane[1]+' Tindakan murid: '+lane[2],
   bbm:pg,phase:'source-evidence-plan'}];
  groupBbm[level]=pg;
 }
 return {...(prior||{}),sourcePlanBm2:true,sourcePlanTeacherReviewNeeded:true,
  sourcePlanReviewStatus:'LESSON_MAP_EVIDENCE_NOT_WORD_APPROVED',
  sourcePlanVersion:VERSION,sourcePlanSession:'BM2-M29-S'+m.session_no,
  sourceTask:p.task,anchor:p.task,topic:p.title,mainSp:p.sp,page:'m/s '+p.page,
  phases,sourceSteps,classroomFlow:sourceSteps,
  differentiation,librarySteps,groupBbm,bbmList:[pg],
  pak21:'Teliti–Bincang–Laksana–Semak',pakDetail:'Tugasan sesi khusus berpandukan '+pg+'; PBD diperhatikan pada setiap murid.',
  inductionData:{name:phases[0].name,text:toText(phases[0],p.page),bbm:pg},
  setInduksi:toText(phases[0],p.page),penutup:toText(phases.at(-1),p.page),
  diffSupportAct:p.lanes.support[0],diffCoreAct:p.lanes.core[0],diffChallengeAct:p.lanes.challenge[0],
  pbd:p.pbd,pbdEvidence:p.pbd,reflection:p.reflection,intervention:[]
 };
}
const prevEffective=root.effectiveRphLessonMap;
if(typeof prevEffective==='function')root.effectiveRphLessonMap=function(m,...args){
 const out=prevEffective.call(this,m,...args),p=selected(out);
 if(!p||!applies(out))return out;
 return {...out,objective:p.objective,success_criteria:p.criteria};
};
const prevPedagogy=root.buildSourceAwarePedagogy;
if(typeof prevPedagogy==='function')root.buildSourceAwarePedagogy=function(m,...args){
 const out=prevPedagogy.call(this,m,...args);
 return applies(m)?prepare(m,out):out;
};
root.BmYear2Week29SourcePlans={VERSION,availableSessions:[1,2,3,4,5],applies,prepare,plans:P};
try{if(typeof module!=='undefined'&&module.exports)module.exports=root.BmYear2Week29SourcePlans}catch{}
})(typeof window!=='undefined'?window:globalThis);
