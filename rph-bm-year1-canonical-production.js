(function(root){
'use strict';
const VERSION='BM1-CANONICAL-20261008h';
const clean=v=>String(v==null?'':v).replace(/\s+/g,' ').trim();
const esc=v=>clean(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const arr=v=>Array.isArray(v)?v.filter(Boolean):v?[v]:[];
function subjectKey(map,explicit){if(explicit)return explicit;try{return root.rphSubjectKey(map?.subject_id)}catch{return String(map?.subject_key||'')}}
function applies(map,opts={}){return subjectKey(map,opts.subjectKey)==='bm'&&Number(map?.year||0)===1&&Number(map?.academic_year||0)===2026&&map?.verification_status==='verified'}
function sp(map){return clean(map?.source_evidence?.meta?.main_sp||String(map?.sp||'').split(',')[0])}
function page(map){return Number(map?.textbook_page_start||0)||0}
function actionFallback(map){
 const code=sp(map),title=clean(map?.title)||'bahan sumber';
 const d=code.split('.')[0];
 if(code==='1.1.1')return 'Mengajuk dan menyebut bahasa sasaran berdasarkan bahan “'+title+'”.';
 if(code==='1.1.2')return 'Mendengar bahan “'+title+'” dan memberikan respons yang sesuai.';
 if(code==='1.2.1')return 'Bertutur untuk menyampaikan respons berdasarkan bahan “'+title+'”.';
 if(code==='1.2.2')return 'Menyampaikan maklumat berdasarkan bahan “'+title+'”.';
 if(code==='2.1.1'||code==='2.1.2')return 'Membaca bahan “'+title+'” dengan sebutan yang betul dan intonasi yang sesuai.';
 if(code==='2.2.1')return 'Membaca, memahami dan menyatakan maklumat daripada bahan “'+title+'”.';
 if(code==='2.3.1')return 'Membaca dan mengenal pasti kandungan penting daripada bahan “'+title+'”.';
 if(code==='2.3.2')return 'Membaca, memahami dan mempersembahkan semula kandungan bahan “'+title+'”.';
 if(code==='3.1.1')return 'Menulis bahasa sasaran daripada bahan “'+title+'” dengan betul dan kemas.';
 if(code==='3.2.1')return 'Membina dan menulis perkataan, frasa atau ayat berdasarkan bahan “'+title+'”.';
 if(code==='3.2.2')return 'Menulis jawapan atau ayat bermakna berdasarkan bahan “'+title+'”.';
 if(code==='3.2.3')return 'Mencatat maklumat penting daripada bahan “'+title+'”.';
 if(code==='3.2.4')return 'Menulis perkataan secara imlak berdasarkan bahan “'+title+'”.';
 if(code==='3.3.1')return 'Menghasilkan penulisan terkawal berdasarkan bahan “'+title+'”.';
 if(code==='3.3.2')return 'Mengedit kesalahan ejaan atau tanda baca dalam bahan “'+title+'”.';
 if(d==='4')return 'Melaksanakan dan mempersembahkan aktiviti seni bahasa daripada bahan “'+title+'”.';
 if(code==='5.1.1')return 'Mengenal pasti dan menggunakan kata nama atau kata ganti nama berdasarkan bahan “'+title+'”.';
 if(code==='5.1.2')return 'Mengenal pasti dan menggunakan kata kerja berdasarkan bahan “'+title+'”.';
 if(code==='5.1.3')return 'Mengenal pasti dan menggunakan kata adjektif berdasarkan bahan “'+title+'”.';
 if(code==='5.1.4')return 'Mengenal pasti dan menggunakan kata tugas berdasarkan bahan “'+title+'”.';
 if(code==='5.2.1')return 'Mengenal pasti dan menggunakan kata berimbuhan berdasarkan bahan “'+title+'”.';
 if(code==='5.2.2')return 'Mengenal pasti dan menggunakan kata majmuk berdasarkan bahan “'+title+'”.';
 if(code==='5.2.3')return 'Mengenal pasti dan menggunakan kata ganda berdasarkan bahan “'+title+'”.';
 if(code==='5.3.1'||code==='5.3.2'||code==='5.3.3')return 'Mengenal pasti dan membina ayat mengikut konteks bahan “'+title+'”.';
 return 'Melaksanakan tugasan sebenar berdasarkan bahan “'+title+'”.';
}
function sourceTask(map){
 const raw=clean([map?.source_activities,map?.source_evidence?.textbook?.text].filter(Boolean).join(' '));
 if(!raw)return actionFallback(map);
 const action=/^(?:mengajuk|menyebut|mendengar|memberikan|bersoal|bertutur|menyampaikan|membaca|memahami|menaakul|menyatakan|menceritakan|mempersembahkan|menulis|membina|mencatat|mengedit|melengkapkan|menghasilkan|menyanyikan|melafazkan|bercerita|mengenal pasti|menggunakan|memadankan|menjawab)\b/i;
 const bad=/^(?:bijak bahasa|unit\b|tema\b|ba\s*:|kb\s*[-:]|emk\s*:)/i;
 const parts=raw.split(/(?<=[.!?])\s+|\s+[•▪◦]\s+/).map(s=>clean(s.replace(/^\d+\s*[.)-]?\s*/,'').replace(/^Aktiviti\s+/i,''))).filter(Boolean);
 const scored=parts.map((s,i)=>({s,i,score:(action.test(s)?8:0)+(s.length>=18&&s.length<=190?3:0)+(/Aktiviti/i.test(parts[Math.max(0,i-1)]||'')?2:0)-(bad.test(s)?10:0)})).filter(x=>x.score>3).sort((a,b)=>b.score-a.score||a.i-b.i);
 const pick=scored[0]?.s;
 return pick&&pick.length<=220?pick.replace(/\s+/g,' '):actionFallback(map);
}
function durationMinutes(time){
 const m=String(time||'').match(/(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/);
 if(!m)return 60;
 const a=Number(m[1])*60+Number(m[2]),b=Number(m[3])*60+Number(m[4]),d=b-a;
 return d>0&&d<=180?d:60;
}
function allocations(total){
 if(total<=30)return [3,5,12,7,3];
 if(total<=40)return [4,6,16,10,4];
 if(total<=50)return [5,8,20,12,5];
 return [5,10,25,15,5];
}
function product(map,level){
 const d=sp(map).split('.')[0],title=clean(map?.title),n=level==='support'?'sekurang-kurangnya dua':level==='challenge'?'sekurang-kurangnya empat':'sekurang-kurangnya tiga';
 if(d==='1')return n+' respons lisan individu berdasarkan “'+title+'”.';
 if(d==='2')return n+' bukti bacaan/pemahaman individu berdasarkan bahan sumber.';
 if(d==='3')return n+' hasil tulisan individu yang boleh disemak.';
 if(d==='4')return 'Satu persembahan individu atau kumpulan kecil dengan bukti penguasaan sendiri.';
 return n+' contoh penggunaan bahasa yang betul dalam konteks.';
}
function guidance(map,level){
 const task=sourceTask(map);
 if(level==='support')return ['Guru memecahkan tugasan kepada langkah kecil dan menunjukkan satu contoh daripada halaman sumber.','Guru menyediakan petunjuk visual/kata kunci tetapi tidak memberi jawapan akhir.'];
 if(level==='challenge')return ['Guru mengekalkan tugasan dan SP yang sama, kemudian meminta murid menjelaskan bukti atau menghasilkan satu contoh baharu.','Guru tidak menambah SP baharu atau menggantikan tugasan buku.'];
 return ['Guru menjelaskan arahan sebenar buku dan memodelkan satu contoh sahaja.','Guru memantau murid melaksanakan tugasan penuh dengan bantuan minimum.'];
}
function pupilSteps(map,level){
 const task=sourceTask(map),p='Buku Teks m/s '+page(map);
 if(level==='support')return ['Teliti '+p+' dan tandakan kata/gambar penting.','Laksanakan bahagian pertama tugasan “'+task+'” menggunakan petunjuk yang diberi.','Lengkapkan respons sendiri dan semak dengan guru/rakan.'];
 if(level==='challenge')return ['Laksanakan tugasan penuh “'+task+'” berdasarkan '+p+'.','Tunjukkan bukti daripada sumber yang menyokong jawapan.','Hasilkan satu respons/contoh lanjutan yang masih berada dalam SP '+sp(map)+'.'];
 return ['Baca/teliti arahan pada '+p+'.','Laksanakan tugasan penuh “'+task+'” secara individu atau berpasangan mengikut keperluan.','Semak hasil menggunakan kriteria kejayaan dan baiki satu bahagian jika perlu.'];
}
function lane(map,level){
 const label={support:'Peneroka',core:'Pembina',challenge:'Pencabar'}[level];
 const desc={support:'Bimbingan berstruktur pada tugasan sumber yang sama; beban respons dikurangkan tanpa menukar SP.',core:'Tugasan sumber penuh dengan bantuan minimum dan semakan bukti.',challenge:'Tugasan sumber penuh diikuti pengayaan berasaskan bukti tanpa menukar SP.'}[level];
 const materials=['Buku Teks m/s '+page(map)];
 if(level==='support')materials.push('kad petunjuk / penanda visual');
 if(level==='core')materials.push('lembaran respons individu');
 if(level==='challenge')materials.push('kad soalan pengayaan');
 return {label,support_description:desc,task:sourceTask(map),materials,teacher:guidance(map,level),pupil_steps:pupilSteps(map,level),example:{teacher:level==='support'?'Apakah maklumat pertama yang kamu nampak pada sumber?':level==='challenge'?'Apakah bukti pada sumber yang menyokong jawapan kamu?':'Apakah arahan utama yang perlu kamu lengkapkan?',pupil:level==='support'?'Saya pilih maklumat yang ditunjukkan pada gambar/teks.':level==='challenge'?'Saya merujuk bahagian ini sebagai bukti.':'Saya melaksanakan tugasan mengikut arahan pada halaman buku.'},product:product(map,level),criterion:clean(map?.success_criteria)||'Hasil menepati tugasan sumber dan SP '+sp(map)+'.',next_step:level==='support'?'Ulang satu item dengan petunjuk dikurangkan sehingga murid boleh mencuba sendiri.':level==='challenge'?'Gunakan satu contoh baharu dalam konteks yang sama dan jelaskan bukti daripada sumber.':'Baiki satu respons yang belum tepat dan cuba satu item baharu daripada sumber yang sama.'};
}
function pbd(map){
 const d=sp(map).split('.')[0],criterion=clean(map?.success_criteria);
 if(d==='1')return {method:'Pemerhatian dan soal jawab lisan individu.',evidence:'Respons lisan murid semasa melaksanakan tugasan sumber.',criterion};
 if(d==='2')return {method:'Bacaan individu dan soal jawab pemahaman.',evidence:'Bacaan serta jawapan/maklumat yang dikenal pasti daripada sumber.',criterion};
 if(d==='3')return {method:'Semakan hasil tulisan individu.',evidence:'Hasil tulisan murid yang boleh ditanda dan dibandingkan dengan sumber.',criterion};
 if(d==='4')return {method:'Pemerhatian persembahan dan respons individu.',evidence:'Sebutan, intonasi, aksi atau hasil seni bahasa yang ditunjukkan murid.',criterion};
 return {method:'Semakan respons tatabahasa individu.',evidence:'Contoh perkataan/ayat yang dibina atau dikenal pasti oleh murid.',criterion};
}
function intervention(map){
 const d=sp(map).split('.')[0];
 if(d==='1')return ['Murid yang belum mencapai kriteria mengulang satu respons dengan kad petunjuk, kemudian mencuba semula tanpa kad.'];
 if(d==='2')return ['Murid yang belum mencapai kriteria membaca semula bahagian sumber yang ditandakan dan menjawab satu soalan fokus sebelum mencuba semula.'];
 if(d==='3')return ['Murid yang belum mencapai kriteria membetulkan satu hasil menggunakan senarai semak, kemudian menulis semula secara kendiri.'];
 if(d==='4')return ['Murid yang belum mencapai kriteria berlatih satu bahagian pendek dengan model guru sebelum mempersembahkan semula.'];
 return ['Murid yang belum mencapai kriteria membetulkan satu contoh dengan bimbingan, kemudian membina satu contoh baharu secara kendiri.'];
}
function build(map,opts={}){
 const total=durationMinutes(opts.lessonTime),mins=allocations(total),task=sourceTask(map),p='Buku Teks m/s '+page(map),criterion=clean(map?.success_criteria);
 const materials=[p,'paparan halaman sumber','lembaran respons individu'];
 if(map?.source_evidence?.meta?.activity_book_uploaded&&map?.activity_book_ref)materials.push('Buku Aktiviti '+clean(map.activity_book_ref));
 const phases=[
  {name:'Pencetus dan orientasi sumber',minutes:mins[0],teacher:['Guru memaparkan tajuk/gambar utama daripada '+p+' dan mengaktifkan pengetahuan sedia ada dengan dua soalan ringkas.','Guru menyatakan objektif dan kriteria kejayaan dalam bahasa mudah.'],pupils:['Murid memerhati sumber dan memberikan respons awal.','Murid menyatakan apa yang perlu mereka pelajari pada sesi ini.'],check:'Murid dapat menyatakan fokus pembelajaran sebelum tugasan utama bermula.',resources:[p]},
  {name:'Teliti arahan dan bukti sumber',minutes:mins[1],teacher:['Guru menunjukkan arahan sebenar: “'+task+'”','Guru memodelkan satu contoh tanpa menyelesaikan keseluruhan tugasan.'],pupils:['Murid meneliti teks/gambar/contoh pada halaman sumber.','Murid mengenal pasti maklumat atau bentuk respons yang diperlukan.'],check:'Murid memahami tugasan dan dapat menunjukkan bahagian sumber yang akan digunakan.',resources:[p,'paparan halaman sumber']},
  {name:'Laksanakan tugasan sebenar buku',minutes:mins[2],teacher:['Guru membimbing pelaksanaan tugasan mengikut SP '+sp(map)+' dan memantau hasil individu.','Guru menggunakan soalan bimbingan jika murid tersekat tetapi tidak menggantikan tugasan buku.'],pupils:['Murid melaksanakan tugasan “'+task+'” berdasarkan '+p+'.','Murid menghasilkan respons individu sebelum semakan pasangan/kumpulan kecil.'],check:'Hasil murid kekal berpunca daripada tugasan dan bukti pada halaman sumber.',resources:materials},
  {name:'Semak, terbeza dan PBD',minutes:mins[3],teacher:['Guru memberi bimbingan Peneroka/Pembina/Pencabar mengikut keperluan tanpa memindahkan murid melalui tiga aktiviti berasingan.','Guru merekod bukti individu berdasarkan kriteria kejayaan.'],pupils:['Murid menyemak hasil dengan kriteria kejayaan.','Murid membaiki satu bahagian dan menunjukkan hasil kepada guru.'],check:criterion||'Guru mempunyai bukti individu yang boleh disemak.',resources:['senarai semak guru','hasil murid',p]},
  {name:'Penutup dan refleksi murid',minutes:mins[4],teacher:['Guru memilih beberapa hasil untuk rumusan dan mengaitkan semula dengan SP '+sp(map)+'.','Guru memberi susulan kepada murid yang belum mencapai kriteria.'],pupils:['Murid menyatakan satu perkara yang dipelajari atau menunjukkan satu hasil akhir.','Murid membuat pembetulan terakhir jika diperlukan.'],check:'Rumusan berdasarkan hasil sebenar sesi, bukan aktiviti generik.',resources:['hasil murid']}
 ];
 const differentiation={support:lane(map,'support'),core:lane(map,'core'),challenge:lane(map,'challenge')};
 const assessment=pbd(map);
 const blocks=[
  {kind:'h2',text:'A. MAKLUMAT PENGAJARAN'},
  {kind:'h2',text:'B. PENJAJARAN KURIKULUM'},
  {kind:'h2',text:'C. ALATAN DAN PERSEDIAAN'},
  {kind:'h2',text:'D. LANGKAH PDP'},
  {kind:'h2',text:'E. PDP TERBEZA'},
  {kind:'h2',text:'F. PENTAKSIRAN BILIK DARJAH (PBD)'},
  {kind:'h2',text:'G. REFLEKSI DAN INTERVENSI'}
 ];
 const sourceSteps=phases.slice(1,4).map((x,i)=>({key:'bm1-hub-source-'+(i+1),name:x.name,text:x.teacher.join(' ')+' '+x.pupils.join(' ')+' Semakan: '+x.check,minutes:x.minutes,duration:x.minutes+' minit',bbm:x.resources.join('; '),phase:'source'}));
 const librarySteps={};
 ['support','core','challenge'].forEach(k=>{
   const l=differentiation[k];
   librarySteps[k]=[
     {key:'bm1-hub-'+k+'-1',name:'Tugasan & Bahan',text:l.support_description+' Tugasan: '+l.task,bbm:l.materials.join('; '),pak21:'Pembelajaran terbeza berasaskan tugasan sumber',phase:'group'},
     {key:'bm1-hub-'+k+'-2',name:'Bimbingan & Langkah Murid',text:'Bimbingan guru: '+l.teacher.join(' ')+' Langkah murid: '+l.pupil_steps.join(' '),bbm:l.materials.join('; '),pak21:'Bimbingan mengikut keperluan',phase:'group'},
     {key:'bm1-hub-'+k+'-3',name:'Hasil, Kriteria & Susulan',text:'Hasil individu: '+l.product+' Kriteria: '+l.criterion+' Susulan: '+l.next_step,bbm:l.materials.join('; '),pak21:'Semakan hasil individu',phase:'group'}
   ];
 });
 return {canonicalBm1:true,canonicalVersion:VERSION,totalMinutes:total,sourceTask:task,materials,preparation:['Paparkan '+p+' dengan jelas.','Sediakan ruang respons individu dan senarai semak guru.','Pastikan tugasan, SP dan kriteria kejayaan dipaparkan sebelum aktiviti bermula.'],pak21:'Think–Pair–Check / semakan rakan secara terkawal',values:'Bertanggungjawab, bekerjasama dan menghargai hasil sendiri serta rakan.',phases,differentiation,pbd:assessment,reflection:'Murid yang mencapai kriteria: ____ / ____. Murid yang memerlukan bimbingan lanjut: ____. Catatan guru: ____________________.',intervention:intervention(map),reviewedBlocks:blocks,sourceSteps,classroomFlow:sourceSteps,librarySteps,mainSp:sp(map),page:p,topic:clean(map?.title),anchor:task,kind:'source_task',groupBbm:{support:differentiation.support.materials.join('; '),core:differentiation.core.materials.join('; '),challenge:differentiation.challenge.materials.join('; ')},bbmList:materials,pbdEvidence:assessment,inductionData:{name:phases[0].name,text:phases[0].teacher.join(' ')+' '+phases[0].pupils.join(' '),bbm:phases[0].resources.join('; '),pak21:'Respons pantas'},setInduksi:phases[0].teacher.join(' ')+' '+phases[0].pupils.join(' '),penutup:phases.at(-1).teacher.join(' ')+' '+phases.at(-1).pupils.join(' ')+' Intervensi: '+intervention(map).join(' '),diffSupportAct:librarySteps.support.map(x=>x.text).join(' '),diffCoreAct:librarySteps.core.map(x=>x.text).join(' '),diffChallengeAct:librarySteps.challenge.map(x=>x.text).join(' ')};
}
function rows(items){return '<ul>'+arr(items).map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>'}
function section(letter,title,body){return '<div class="rph-section" data-rph-section="'+letter+'"><div class="rph-section-header"><span class="rph-section-num">'+letter+'</span><h3>'+esc(title)+'</h3></div><div class="rph-section-body">'+body+'</div></div>'}
function grid(pairs){return '<div class="rph-grid">'+pairs.map(x=>'<div>'+esc(x[0])+'</div><div'+(x[2]?' data-rph-edit="'+x[2]+'"':'')+'>'+esc(x[1])+'</div>').join('')+'</div>'}
function renderLane(l){
 return '<div class="rph-activity-block"><div class="rph-activity-label">'+esc(l.label)+'</div><p>'+esc(l.support_description)+'</p>'+
 grid([['Tugasan',l.task],['Bahan',l.materials.join('; ')],['Bimbingan guru',l.teacher.join(' ')],['Langkah murid',l.pupil_steps.join(' ')],['Contoh guru',l.example.teacher],['Contoh respons murid',l.example.pupil],['Hasil individu',l.product],['Kriteria',l.criterion],['Susulan',l.next_step]])+'</div>';
}
function render(ctx){
 const map=ctx.map,ped=ctx.pedagogy;
 const trace='<div class="source-trace"><span>BM1 CANONICAL RPH • 20261008h</span><span>✓ Lesson Map disahkan</span><span>Source Match '+esc(map.confidence_score||100)+'%</span><span>BT '+esc(ctx.btRef||('m/s '+page(map)))+'</span></div>';
 const title='<div class="rph-title" data-rph-renderer="bm1-canonical-r2"><div class="eyebrow">RANCANGAN PENGAJARAN HARIAN • SOURCE-FIRST</div><h2>'+esc(ctx.subjectName||'Bahasa Melayu')+'</h2><b>'+esc(ctx.className)+' • '+esc(ctx.date)+' • '+esc(ctx.lessonTime||'—')+' • Minggu '+esc(ctx.week)+' • Sesi '+esc(map.session_no)+'</b></div>';
 const A=section('A','Maklumat Pengajaran',grid([['Guru',ctx.teacherName||'—'],['Tarikh',ctx.date||'—'],['Masa',ctx.lessonTime||'—'],['Minggu / Sesi',String(ctx.week)+' / '+String(map.session_no||1)],['Subjek',ctx.subjectName||'Bahasa Melayu'],['Kelas / Tahun',(ctx.className||'—')+' / Tahun '+String(ctx.year||1)]]));
 const B=section('B','Penjajaran Kurikulum',grid([['Tajuk / Fokus',map.title||'','title'],['Standard Kandungan',map.sk||'','sk'],['Standard Pembelajaran',map.sp||'','allSp'],['Objektif Pembelajaran',map.objective||'','objective'],['Kriteria Kejayaan',map.success_criteria||'','successCriteria'],['Buku Teks',ctx.btRef||('m/s '+page(map))]]));
 const C=section('C','Alatan dan Persediaan',grid([['BBM / ABM',ped.materials.join('; ')],['Persediaan guru',ped.preparation.join(' ')],['PAK-21',ped.pak21],['Nilai',ped.values]]));
 const phaseHtml=ped.phases.map((p,i)=>'<div class="rph-activity-block"><div class="rph-activity-label">Langkah '+(i+1)+': '+esc(p.name)+' — '+esc(p.minutes)+' minit</div>'+grid([['Tindakan guru',p.teacher.join(' ')],['Tindakan murid',p.pupils.join(' ')],['Semakan',p.check],['Bahan',p.resources.join('; ')]])+'</div>').join('');
 const D=section('D','Langkah PdP',phaseHtml+'<div class="rph-step-meta"><b>Jumlah masa:</b> '+esc(ped.totalMinutes)+' minit</div>');
 const E=section('E','PdP Terbeza',renderLane(ped.differentiation.support)+renderLane(ped.differentiation.core)+renderLane(ped.differentiation.challenge));
 const F=section('F','Pentaksiran Bilik Darjah (PBD)',grid([['Kaedah',ped.pbd.method],['Evidens',ped.pbd.evidence],['Kriteria',ped.pbd.criterion||map.success_criteria||'—'],['Rekod guru','Catat hanya bukti yang benar-benar diperhatikan atau dihasilkan oleh murid.']]));
 const G=section('G','Refleksi dan Intervensi',grid([['Penutup',ped.penutup],['Refleksi selepas PdP',ped.reflection],['Intervensi',ped.intervention.join(' ')]]));
 const proof=ctx.evidenceRefs?.length?'<div class="source-proof"><b>Jejak sumber</b><p>'+esc(ctx.evidenceRefs.join(' • '))+'</p></div>':'';
 const total=Number(ctx.totalStudents||0)||0;
 const controls='<section class="rph-reflection no-print-export"><h3>Refleksi Selepas PdP</h3><div class="reflection-grid"><label>Jumlah murid<input id="rphRefTotal" type="number" min="0" value="'+total+'"></label><label>Hadir<input id="rphRefPresent" type="number" min="0" value="'+total+'"></label><label>Mencapai objektif<input id="rphRefAchieved" type="number" min="0"></label><label>Aktif<input id="rphRefActive" type="number" min="0"></label></div><label>Catatan<textarea id="rphRefNote" rows="2" placeholder="Catatan ringkas pelaksanaan"></textarea></label><button id="generateRphReflection" type="button" class="ghost">✨ Jana Refleksi</button><textarea id="rphReflectionText" rows="4" placeholder="Refleksi selepas PdP"></textarea><div id="rphReflectionView" class="reflection-output-view hidden"></div></section><div class="rph-action-grid no-print-export"><button id="editGeneratedRph" class="ghost" type="button">✏️ Edit RPH</button><button id="saveGeneratedRph" class="primary" type="button">💾 Simpan RPH</button><button id="downloadRphWord" class="ghost" type="button">📄 Muat Turun Word</button><button id="uploadRphDrive" class="ghost" type="button">☁️ Hantar ke Drive</button><button id="sendRphClassroom" class="ghost" type="button">🏫 Hantar Draf Classroom</button><button id="printGeneratedRph" class="ghost" type="button">🖨️ Cetak</button></div>';
 return title+trace+A+B+C+D+E+F+G+proof+controls;
}
root.BmYear1CanonicalRph={VERSION,applies,sourceTask,build,render,durationMinutes};
try{if(typeof module!=='undefined'&&module.exports)module.exports=root.BmYear1CanonicalRph}catch{}
root.console?.info?.('BM Year 1 canonical RPH active ('+VERSION+').');
})(typeof window!=='undefined'?window:globalThis);
