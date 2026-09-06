(function(){
'use strict';

const VERSION='2026-09-06c';
function appState(){try{return typeof state!=='undefined'?state:window.state}catch{return window.state}}
function esc(value=''){
  try{if(typeof escapeHtml==='function')return escapeHtml(String(value??''))}catch{}
  return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
function norm(v=''){return String(v||'').replace(/\s+/g,' ').replace(/\s+([,.;:!?])/g,'$1').trim()}
function subjectKey(map){try{return typeof rphSubjectKey==='function'?rphSubjectKey(map?.subject_id):String(map?.subject_key||'')}catch{return String(map?.subject_key||'')}}
function isEnglish(map){try{return typeof lessonLanguage==='function'&&lessonLanguage(map?.subject_id)==='en'}catch{return false}}
function stableHash(seed=''){
  try{if(typeof rphActivityHash==='function')return rphActivityHash(seed)}catch{}
  let h=2166136261;for(const c of String(seed)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0;
}
function pageLabel(map,ped,uiEn=false){
  if(ped?.page&&ped.page!=='—')return ped.page;
  const p=Number(map?.textbook_page_start||0);return p?(uiEn?`Student's Book p. ${p}`:`Buku Teks m/s ${p}`):(uiEn?"Student's Book":'Buku Teks');
}
function cleanTask(v=''){
  let s=norm(v);
  const quoted=s.match(/[“"]([^”"]{6,240})[”"]/);if(quoted?.[1])s=quoted[1];
  s=s.replace(/^(?:Arahan buku|Book instruction)\s*:\s*/i,'')
    .replace(/^(?:BT|Buku Teks|Student['’]?s Book)\s*(?:m\/s|ms|p\.?|page)?\s*\d+(?:\s*[–-]\s*\d+)?\s*[:\-–]?\s*/i,'')
    .replace(/^Murid\s+/i,'').replace(/^Pupils?\s+/i,'').replace(/^Students?\s+/i,'')
    .replace(/^menjawab soalan sumber\s*:\s*/i,'')
    .replace(/^answer(?:s|ing)? the source question\s*:\s*/i,'');
  return norm(s).replace(/[.!]+$/,'');
}
function sourceTasks(ped){
  const out=[];
  for(const step of ped?.sourceSteps||[]){
    const raw=step?.rawText||step?.text||'';const t=cleanTask(raw);if(t&&t.length>=6&&!out.includes(t))out.push(t);
  }
  if(!out.length){const t=cleanTask(ped?.anchor||'');if(t)out.push(t)}
  return out.slice(0,4);
}
function taskSummary(tasks,uiEn=false){
  if(!tasks.length)return uiEn?'the textbook task':'tugasan buku teks';
  if(tasks.length===1)return `“${tasks[0]}”`;
  return tasks.slice(0,2).map(x=>`“${x}”`).join(uiEn?' and ':' dan ');
}
function gamePool(map,tasks){
  const joined=norm(tasks.join(' ')).toLowerCase(),sk=subjectKey(map);
  if(/dengar|sebut|ujar|dialog|nyanyi|listen|say|speak|dialogue|chant|song/.test(joined))return ['radio','kotak','hotseat'];
  if(/susun|urutan|langkah|sequence|order/.test(joined))return ['radio','relay','kotak'];
  if(/tulis|ayat|perkataan|write|sentence|word/.test(joined))return ['relay','kotak','hotseat'];
  if(sk==='science'||/apakah|mengapa|bagaimana|what|why|how|\?/.test(joined))return ['kotak','ball','hotseat','fishing'];
  return ['kotak','radio','ball','hotseat','relay','fishing'];
}
function gameStep(kind,map,tasks,ped,uiEn=false){
  const page=pageLabel(map,ped,uiEn),focus=tasks[0]||'',second=tasks[1]||focus;
  if(uiEn){
    const en={
      radio:{name:'Broken Radio',text:`Pupils form teams of 5–6 in a line. The first pupil reads one short message or key idea prepared from ${page}. The message may be whispered only once to the next pupil. The last pupil writes what was heard on a mini whiteboard. The team compares it with the original wording, corrects any changed word, and explains the correct idea.`,bbm:`${page}; message cards; mini whiteboards`,pak21:'Communication • Collaboration'},
      kotak:{name:'Poison Box',text:`Pupils pass a small box while a short music clip or teacher clap is played. When it stops, the pupil holding the box draws a question card. Questions are taken from the lesson, for example ${focus?`“${focus}”`:'the textbook task'}. The pupil has 10 seconds to think, may ask one teammate for help, then answers. A correct answer earns the team one point.`,bbm:`${page}; small box; question cards`,pak21:'Team Quiz • Communication'},
      ball:{name:'Question Ball',text:`Pupils stand or sit in a circle and pass a soft ball. When the teacher claps twice, the pupil holding the ball answers one prepared question such as ${focus?`“${focus}”`:'the current task'}. Another pupil may add or correct one detail. Play continues for 4–6 turns.`,bbm:`${page}; soft ball; prompt cards`,pak21:'Active Recall • Communication'},
      hotseat:{name:'Hot Seat',text:`One pupil sits in the hot seat facing the class. The teacher shows the class a word, picture or idea taken from ${page}; classmates give clues without saying the exact answer. After guessing, the pupil must connect the answer to ${focus?`“${focus}”`:'the lesson task'}. Rotate 3–4 pupils.`,bbm:`${page}; clue cards`,pak21:'Hot Seat • Speaking'},
      relay:{name:'Answer Relay',text:`Each team receives one answer sheet at the front of the class. One pupil at a time moves to the sheet, completes one part of ${focus?`“${focus}”`:'the task'}, returns, and tags the next teammate. The final pupil checks the team's answers against ${page} before the sheet is submitted.`,bbm:`${page}; team answer sheets; markers`,pak21:'Team Relay • Collaboration'},
      fishing:{name:'Fishing for Questions',text:`Question cards are placed face down with paper clips. Pupils take turns using a simple magnetic fishing rod or draw a card by hand. The card contains a lesson question such as ${second?`“${second}”`:'a question from the page'}. The pupil answers, and the group may add one supporting idea for a bonus point.`,bbm:`${page}; question cards; simple fishing set`,pak21:'Question Game • Collaboration'}
    };return {...en[kind],key:`classroom-${kind}`,phase:'game',duration:'6–8 min'};
  }
  const ms={
    radio:{name:'Radio Rosak',text:`Murid dibahagikan kepada kumpulan 5–6 orang dan berbaris. Murid pertama membaca satu kad mesej atau idea ringkas yang diambil daripada isi pada ${page}. Mesej hanya boleh dibisik sekali kepada rakan di belakang. Murid terakhir menulis mesej yang diterima pada papan mini. Kumpulan membandingkan mesej akhir dengan kad asal, membetulkan perkataan yang berubah dan menerangkan idea yang betul.`,bbm:`${page}; kad mesej; papan mini`,pak21:'Komunikasi • Kolaborasi'},
    kotak:{name:'Kotak Beracun',text:`Murid mengedarkan sebuah kotak kecil sambil muzik pendek dimainkan atau guru menepuk rentak. Apabila muzik/rentak berhenti, murid yang memegang kotak mengambil satu kad soalan. Soalan menggunakan isi pelajaran hari ini, contohnya ${focus?`“${focus}”`:'soalan pada halaman buku'}. Murid diberi 10 saat untuk berfikir, boleh meminta satu “talian hayat” daripada ahli kumpulan, kemudian menjawab. Jawapan tepat mendapat satu mata untuk kumpulan.`,bbm:`${page}; kotak kecil; kad soalan`,pak21:'Kuiz Kumpulan • Komunikasi'},
    ball:{name:'Bola Soalan',text:`Murid duduk atau berdiri dalam bulatan dan menghantar bola lembut dari seorang ke seorang. Apabila guru menepuk tangan dua kali, murid yang memegang bola menjawab satu kad soalan seperti ${focus?`“${focus}”`:'soalan pelajaran'}. Seorang rakan boleh menambah atau membetulkan satu maklumat. Aktiviti diteruskan selama 4–6 pusingan.`,bbm:`${page}; bola lembut; kad soalan`,pak21:'Imbas Kembali Aktif • Komunikasi'},
    hotseat:{name:'Kerusi Panas',text:`Seorang murid duduk di “kerusi panas” menghadap kelas. Guru menunjukkan kepada murid lain satu perkataan, gambar atau idea daripada ${page}. Rakan sekelas memberikan petunjuk tanpa menyebut jawapan tepat. Selepas berjaya meneka, murid tersebut mengaitkan jawapan dengan ${focus?`“${focus}”`:'tugasan pelajaran'}. Tukar pemain selepas setiap pusingan.`,bbm:`${page}; kad petunjuk`,pak21:'Hot Seat • Komunikasi'},
    relay:{name:'Lumba Berganti Jawapan',text:`Setiap kumpulan mempunyai satu lembaran jawapan di hadapan kelas. Seorang murid pada satu masa bergerak ke lembaran tersebut, melengkapkan satu bahagian ${focus?`“${focus}”`:'tugasan'}, kembali ke kumpulan dan menyentuh tangan rakan seterusnya. Murid terakhir menyemak jawapan kumpulan dengan ${page} sebelum dihantar.`,bbm:`${page}; lembaran kumpulan; pen marker`,pak21:'Team Relay • Kolaborasi'},
    fishing:{name:'Pancing Soalan',text:`Kad soalan diletakkan terbalik dan dipasangkan klip kertas. Murid bergilir memancing satu kad menggunakan batang pancing magnet ringkas atau mengambil kad secara rawak. Kad mengandungi soalan pelajaran seperti ${second?`“${second}”`:'soalan pada halaman buku'}. Murid menjawab dan ahli kumpulan boleh menambah satu idea sokongan untuk mata bonus.`,bbm:`${page}; kad soalan; set pancing ringkas`,pak21:'Permainan Soal Jawab • Kolaborasi'}
  };
  return {...ms[kind],key:`classroom-${kind}`,phase:'game',duration:'6–8 min'};
}
function induction(map,ped,uiEn=false){
  const page=pageLabel(map,ped,uiEn),topic=norm(map?.title||'');
  const pick=stableHash(`${map?.id||''}|${map?.session_no||1}|induction`)%2;
  if(uiEn){
    if(pick===0)return {name:'20-Second Picture Guess',text:`The teacher shows only the picture or a small part of the material on ${page} for 20 seconds without reading the title. Pupils tell a partner what they notice and make one guess about today's focus${topic?` (${topic})`:''}. Two or three pupils share their guesses before the teacher reveals the task.`,bbm:page,pak21:'See-Think-Share'};
    return {name:'Three Clues',text:`The teacher gives three short clues taken from the title, picture or key words on ${page}, one clue at a time. Pupils guess the lesson focus after each clue and briefly explain why. The teacher then reveals ${page} and links the guesses to the lesson task.`,bbm:`${page}; 3 clue cards`,pak21:'Think-Pair-Share'};
  }
  if(pick===0)return {name:'Teka Gambar 20 Saat',text:`Guru memaparkan hanya gambar atau sebahagian kecil bahan pada ${page} selama 20 saat tanpa membaca tajuk. Murid memberitahu pasangan perkara yang mereka nampak dan membuat satu tekaan tentang fokus pelajaran${topic?` “${topic}”`:''}. Dua atau tiga murid berkongsi tekaan sebelum guru membuka halaman penuh dan memulakan aktiviti.`,bbm:page,pak21:'Lihat-Fikir-Kongsi'};
  return {name:'Tiga Petunjuk',text:`Guru memberikan tiga petunjuk pendek daripada tajuk, gambar atau kata kunci pada ${page}, satu demi satu. Selepas setiap petunjuk, murid meneka fokus pelajaran dan memberikan sebab ringkas. Guru kemudian membuka ${page} dan mengaitkan tekaan murid dengan tugasan hari ini.`,bbm:`${page}; 3 kad petunjuk`,pak21:'Think-Pair-Share'};
}
function classroomFlow(map,activities,ped,uiEn=false){
  const tasks=sourceTasks(ped),page=pageLabel(map,ped,uiEn),summary=taskSummary(tasks,uiEn);
  const pool=gamePool(map,tasks),kind=pool[stableHash(`${map?.id||''}|${map?.week_no||map?.week||''}|${map?.session_no||1}|${subjectKey(map)}|game`)%pool.length];
  const game=gameStep(kind,map,tasks,ped,uiEn);
  if(uiEn)return [
    {key:'flow-open',name:'Read, Think, Pair',duration:'5–7 min',text:`The teacher asks pupils to open ${page}. Pupils read ${summary}, think silently for about 30 seconds, then discuss an answer with a partner. Two or three pairs share before the teacher confirms the important idea.`,bbm:page,pak21:'Think-Pair-Share'},
    game,
    {key:'flow-team',name:'Team Challenge',duration:'10–12 min',text:`Pupils complete the remaining textbook task in teams of 3–4. Pupils who need support receive a key-word or picture cue and work with a buddy; most pupils complete the task normally; early finishers add one new example, explanation or “what if” question connected to the same lesson. The teacher moves between teams, asks short probing questions and checks misconceptions immediately.`,bbm:`${page}; prompt cards; pupils' work`,pak21:'Differentiated Collaborative Learning'},
    {key:'flow-check',name:'Show Me Your Answer',duration:'4–5 min',text:`Each team writes one final answer on a mini whiteboard and holds it up at the same time. The teacher quickly compares responses, invites one team to explain its thinking and allows teams to correct their own work before moving to the closure.`,bbm:'mini whiteboards / answer cards',pak21:'Show Me • Peer Check'}
  ];
  return [
    {key:'flow-open',name:'Baca, Fikir dan Bincang',duration:'5–7 min',text:`Guru meminta murid membuka ${page}. Murid membaca ${summary}, berfikir sendiri kira-kira 30 saat kemudian berbincang jawapan dengan pasangan. Dua atau tiga pasangan berkongsi jawapan dan guru menegaskan idea penting sebelum aktiviti seterusnya.`,bbm:page,pak21:'Think-Pair-Share'},
    game,
    {key:'flow-team',name:'Cabaran Kumpulan',duration:'10–12 min',text:`Murid melengkapkan baki tugasan dalam kumpulan 3–4 orang. Murid yang masih memerlukan bantuan menerima kad kata kunci/gambar dan bekerja bersama rakan pembimbing; murid lain menyelesaikan tugasan seperti biasa; murid yang siap awal menambah satu contoh, penerangan atau soalan “apa akan berlaku jika...” yang berkaitan. Guru bergerak dari kumpulan ke kumpulan, menyoal secara ringkas dan membetulkan salah faham serta-merta.`,bbm:`${page}; kad petunjuk; hasil kerja murid`,pak21:'Pembelajaran Kolaboratif Terbeza'},
    {key:'flow-check',name:'Tunjuk Jawapan',duration:'4–5 min',text:`Setiap kumpulan menulis satu jawapan akhir pada papan mini dan mengangkatnya serentak. Guru membandingkan respons dengan cepat, memilih satu kumpulan untuk menerangkan cara berfikir dan memberi peluang semua kumpulan membetulkan jawapan sendiri sebelum masuk ke penutup.`,bbm:'papan mini / kad jawapan',pak21:'Show Me • Semakan Rakan'}
  ];
}
function closure(map,ped,uiEn=false){
  const tasks=sourceTasks(ped),focus=tasks[0]||'',pick=stableHash(`${map?.id||''}|${map?.session_no||1}|closure`)%2;
  if(uiEn){
    if(pick===0)return `Closure — Exit Ticket (3–4 min): Before leaving the activity, each pupil writes one short answer to ${focus?`“${focus}”`:'the main lesson question'} and one thing learned today on a small slip. The teacher reads two or three responses aloud, corrects any final misunderstanding and collects the slips for a quick check.`;
    return `Closure — Pass the Ball (3–4 min): The teacher tosses a soft ball to a pupil. The pupil states one thing learned or gives one answer from today's task, then passes the ball to another pupil. After 4–5 responses, the teacher gives the final summary and checks the success criterion.`;
  }
  if(pick===0)return `Penutup — Tiket Keluar (3–4 minit): Sebelum tamat, setiap murid menulis satu jawapan ringkas bagi ${focus?`“${focus}”`:'soalan utama pelajaran'} dan satu perkara yang dipelajari hari ini pada sekeping kertas kecil. Guru membaca dua atau tiga respons, membetulkan kekeliruan terakhir dan mengumpulkan tiket untuk semakan pantas.`;
  return `Penutup — Bola Rumusan (3–4 minit): Guru melontar bola lembut kepada seorang murid. Murid menyatakan satu perkara yang dipelajari atau satu jawapan daripada aktiviti hari ini, kemudian menghantar bola kepada rakan lain. Selepas 4–5 respons, guru membuat rumusan akhir dan menyemak kriteria kejayaan.`;
}
function naturalPbd(map,ped,uiEn=false){
  const criterion=map?.success_criteria||ped?.pbdEvidence?.criterion||'';
  return uiEn?{
    method:'Teacher observation, oral questioning and review of pupils’ answers/work during the activity.',
    evidence:'Pupils’ spoken answers, mini-whiteboard responses, completed textbook work and participation in the group activity.',criterion
  }:{
    method:'Pemerhatian guru, soal jawab lisan dan semakan jawapan/hasil kerja murid sepanjang aktiviti.',
    evidence:'Respons lisan murid, jawapan pada papan mini, tugasan Buku Teks yang disiapkan dan penglibatan semasa aktiviti kumpulan.',criterion
  };
}

const previousBuild=typeof window.buildSourceAwarePedagogy==='function'?window.buildSourceAwarePedagogy:(typeof buildSourceAwarePedagogy==='function'?buildSourceAwarePedagogy:null);
if(typeof previousBuild==='function'){
  const enhanced=function(map,activities,btRef,uiEn,classId=null){
    const ped=previousBuild.apply(this,arguments);
    try{
      ped.inductionData=induction(map,ped,uiEn);ped.setInduksi=ped.inductionData.text;
      ped.classroomFlow=classroomFlow(map,activities,ped,uiEn);
      ped.penutup=closure(map,ped,uiEn);
      ped.pbdEvidence=naturalPbd(map,ped,uiEn);
      ped.integratedClassroomFlow=true;
    }catch(err){console.warn('RPH integrated classroom flow:',err)}
    return ped;
  };
  window.buildSourceAwarePedagogy=enhanced;try{buildSourceAwarePedagogy=enhanced}catch{}
}

function flowHtml(ctx){
  const ped=ctx?.pedagogy||{},steps=ped.classroomFlow||[],en=!!ctx.uiEn,page=ctx.btRef||ped.page||'';
  if(!steps.length)return '';
  return `<div class="rph-activity-block rph-classroom-flow" data-rph-classroom-flow="1"><div class="rph-activity-label">${en?'Classroom Activity Flow':'Aliran Aktiviti PdP'}</div><div class="rph-source-badge">${esc(page)} • ${en?'one continuous lesson flow':'satu aliran aktiviti berterusan'}</div><div class="rph-classroom-flow-list">${steps.map((s,i)=>`<div class="rph-flow-step"><div class="rph-flow-title"><b>${i+1}. ${esc(s.name||'')}</b><span>${esc(s.duration||'')}</span></div><div class="rph-flow-text">${esc(s.text||'')}</div><div class="rph-step-meta"><b>BBM/ABM:</b> ${esc(s.bbm||'—')}</div><div class="rph-step-meta"><b>PAK-21:</b> ${esc(s.pak21||'—')}</div></div>`).join('')}</div></div>`;
}
function inject(){
  try{
    const preview=document.querySelector('#rphPreview'),ctx=appState()?.currentGeneratedRph;if(!preview||!ctx?.pedagogy?.classroomFlow?.length)return;
    const section=[...preview.querySelectorAll('.rph-section')].find(sec=>/Aktiviti PdP|Learning Activities/i.test(sec.querySelector('h3')?.textContent||'')),body=section?.querySelector('.rph-section-body');if(!body)return;
    if(body.querySelector('[data-rph-classroom-flow="1"]'))return;
    body.innerHTML=flowHtml(ctx);ctx.html=preview.innerHTML;
  }catch(err){console.warn('RPH classroom flow injection:',err)}
}
let queued=false;function queueInject(){if(queued)return;queued=true;queueMicrotask(()=>{queued=false;inject()})}
function start(){const preview=document.querySelector('#rphPreview');if(preview)new MutationObserver(queueInject).observe(preview,{childList:true,subtree:true});queueInject()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

window.__RPH_INTERACTIVE_ENRICHMENT__={version:VERSION,integratedClassroomFlow:true,separateGameBlock:false,realClassroomMechanics:['Kotak Beracun','Radio Rosak','Bola Soalan','Kerusi Panas','Lumba Berganti Jawapan','Pancing Soalan']};
console.info('RPH integrated classroom activity flow active.');
})();
