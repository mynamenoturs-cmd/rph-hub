(function(){
'use strict';

const VERSION='2026-09-06b';
function appState(){try{return typeof state!=='undefined'?state:window.state}catch{return window.state}}
function esc(v=''){try{if(typeof escapeHtml==='function')return escapeHtml(String(v??''))}catch{}return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}
function norm(v=''){return String(v||'').replace(/\s+/g,' ').trim()}
function isEnglish(map){try{return typeof lessonLanguage==='function'&&lessonLanguage(map?.subject_id)==='en'}catch{return false}}
function pageLabel(map,ped,en=false){if(ped?.page&&ped.page!=='—')return ped.page;const p=Number(map?.textbook_page_start||0);return p?(en?`Student's Book p. ${p}`:`Buku Teks m/s ${p}`):(en?"Student's Book":'Buku Teks')}
function sourceQuestion(ped){
  for(const step of ped?.sourceSteps||[]){
    let s=norm(step?.rawText||step?.text||'');
    const q=s.match(/[“"]([^”"]{8,220})[”"]/);if(q?.[1])return q[1];
    s=s.replace(/^(?:Arahan buku|Book instruction)\s*:\s*/i,'').replace(/^Murid\s+/i,'').replace(/^Pupils?\s+/i,'');
    if(s.length>=8)return s;
  }
  return norm(ped?.anchor||'');
}
function kindFromStep(step){
  const s=norm(`${step?.key||''} ${step?.name||''}`).toLowerCase();
  if(/kotak|poison/.test(s))return'kotak';
  if(/radio|broken/.test(s))return'radio';
  if(/bola|ball/.test(s))return'ball';
  if(/kerusi|hot seat|hotseat/.test(s))return'hotseat';
  if(/lumba|relay/.test(s))return'relay';
  if(/pancing|fishing/.test(s))return'fishing';
  if(/baca|read|think|pair/.test(s))return'open';
  if(/cabaran kumpulan|team challenge/.test(s))return'team';
  if(/tunjuk|show me|jawapan/.test(s))return'check';
  return'general';
}
function diffForStep(step,map,ped,en=false){
  const page=pageLabel(map,ped,en),q=sourceQuestion(ped),kind=kindFromStep(step);
  const ms={
    open:{support:`Baca soalan bersama rakan pembimbing. Gunakan satu kad kata kunci/gambar daripada ${page} dan rangka ayat sebelum menjawab.`,core:`Baca dan jawab ${q?`“${q}”`:'tugasan'} bersama pasangan tanpa pilihan jawapan, kemudian tunjuk bahagian pada ${page} yang menyokong jawapan.`,challenge:'Jawab secara kendiri, tambah satu sebab atau contoh baharu dan terangkan mengapa contoh itu sesuai dengan konsep pelajaran.'},
    kotak:{support:'Gunakan kad petunjuk atau dua pilihan jawapan serta satu “talian hayat” daripada rakan sebelum menjawab.',core:'Jawab kad yang diperoleh dalam 10 saat tanpa pilihan jawapan; kumpulan hanya boleh menambah satu pembetulan.',challenge:'Jawab, beri sebab, kemudian cipta satu soalan bonus untuk pemain seterusnya.'},
    radio:{support:'Gunakan mesej pendek 5–7 perkataan berserta satu petunjuk gambar/kata kunci.',core:'Sampaikan satu ayat lengkap berkaitan pelajaran sekali sahaja dari murid ke murid dan bandingkan mesej akhir dengan kad asal.',challenge:'Gunakan mesej dua bahagian; murid terakhir mengenal pasti idea yang berubah dan membetulkannya dengan sebab.'},
    ball:{support:'Gunakan kad petunjuk dan satu bantuan rakan sebelum memberikan jawapan.',core:'Jawab soalan terus apabila bola berhenti dan dengar satu tambahan atau pembetulan daripada rakan.',challenge:'Jawab serta tambah satu sebab, contoh atau soalan “apa akan berlaku jika…”.'},
    hotseat:{support:'Dapatkan tiga kad petunjuk dan satu kata kunci sebelum meneka.',core:'Teka berdasarkan dua petunjuk lisan dan kaitkan jawapan dengan tugasan pelajaran.',challenge:'Berikan petunjuk kepada rakan, kemudian terangkan bagaimana jawapan itu berkaitan dengan konsep.'},
    relay:{support:'Lengkapkan satu bahagian pendek menggunakan bank kata atau rangka jawapan.',core:'Lengkapkan bahagian yang ditetapkan tanpa contoh siap dan serahkan giliran kepada rakan seterusnya.',challenge:'Semak keseluruhan jawapan kumpulan, cari satu kesilapan dan baiki sebelum dihantar.'},
    fishing:{support:'Pilih satu daripada dua jawapan yang disediakan selepas memancing kad.',core:'Jawab kad tanpa pilihan jawapan dan tunjuk bukti yang menyokong jawapan.',challenge:'Jawab, berikan bukti sokongan dan tambah satu soalan susulan untuk mata bonus.'},
    team:{support:'Bekerja dengan rakan pembimbing menggunakan kad kata kunci/gambar dan rangka jawapan separa lengkap.',core:'Laksanakan tugasan asal dengan bahan biasa dan buat satu semakan pasangan.',challenge:'Laksanakan tugasan yang sama kemudian tambah satu contoh, penerangan atau soalan “apa akan berlaku jika…”.'},
    check:{support:'Gunakan rangka ayat atau kad kata kunci untuk menyediakan jawapan akhir.',core:'Tulis jawapan lengkap pada papan mini dan angkat serentak apabila diberi isyarat.',challenge:'Tunjuk jawapan dan bersedia memberikan justifikasi atau menambah baik jawapan kumpulan lain.'},
    general:{support:'Gunakan petunjuk ringkas, contoh awal atau bantuan rakan.',core:'Laksanakan tugasan yang sama secara kendiri atau dengan perbincangan biasa.',challenge:'Laksanakan tugasan yang sama dan kembangkan dengan sebab, contoh atau penerangan.'}
  };
  const enBank={
    open:{support:`Read with a buddy and use one key-word or picture cue from ${page} plus a sentence starter.`,core:`Answer ${q?`“${q}”`:'the task'} with a partner without answer choices, then point to the evidence in ${page}.`,challenge:'Answer independently, add one reason or new example, and explain why it fits the lesson idea.'},
    kotak:{support:'Use a cue card or two answer choices and one teammate lifeline.',core:'Answer the drawn question within 10 seconds without choices.',challenge:'Answer, justify the response, then create one bonus question for the next player.'},
    radio:{support:'Use a short 5–7 word message plus a picture or key-word cue.',core:'Pass one complete lesson sentence once from pupil to pupil and compare it with the original.',challenge:'Use a two-part message; identify what changed and correct it with a reason.'},
    ball:{support:'Use a prompt card and one buddy hint.',core:'Answer directly when the ball stops and listen for one peer correction.',challenge:'Answer and add a reason, example or “what if” extension.'},
    hotseat:{support:'Receive three clue cards and one key word.',core:'Guess from two oral clues and link the answer to the lesson.',challenge:'Give clues to classmates, then explain the concept link.'},
    relay:{support:'Complete one short part using a word bank or sentence frame.',core:'Complete the assigned part without a model and pass the turn.',challenge:'Check the full team response, identify one error and improve it.'},
    fishing:{support:'Choose between two possible answers.',core:'Answer the drawn card without choices and show evidence.',challenge:'Answer, give evidence and add a follow-up question.'},
    team:{support:'Work with a buddy using key-word or picture cards and a partly completed response frame.',core:'Complete the original task with normal materials and peer-check once.',challenge:'Complete the same task, then add a new example, explanation or “what if” question.'},
    check:{support:'Use a sentence starter or key-word card for the final answer.',core:'Write the full answer on the mini whiteboard and show it at the signal.',challenge:'Show the answer and justify or improve another team’s response.'},
    general:{support:'Use a short cue, model or buddy support.',core:'Complete the same task with normal peer discussion.',challenge:'Extend the same task with a reason, example or explanation.'}
  };
  return (en?enBank:ms)[kind]||(en?enBank.general:ms.general);
}
function inductionDiff(en=false){return en?{support:'Use the picture plus one key-word clue before making a prediction.',core:'Make one prediction from the picture or clues and explain it to a partner.',challenge:'Make a prediction and justify it using two visible clues.'}:{support:'Gunakan gambar dan satu kad kata kunci sebelum membuat tekaan.',core:'Buat satu tekaan daripada gambar atau petunjuk dan terangkan kepada pasangan.',challenge:'Buat tekaan dan justifikasikan menggunakan dua petunjuk yang dapat dilihat.'}}
function closureDiff(en=false){return en?{support:'Complete “Today I learned…” using one key word.',core:'State one thing learned and one correct answer from the lesson.',challenge:'State the key idea, give a reason or example and answer one peer question.'}:{support:'Lengkapkan rangka ayat “Hari ini saya belajar…” menggunakan satu kata kunci.',core:'Nyatakan satu perkara yang dipelajari dan satu jawapan tepat daripada aktiviti.',challenge:'Nyatakan idea utama, beri satu sebab atau contoh dan jawab satu soalan daripada rakan.'}}

const previousBuild=typeof window.buildSourceAwarePedagogy==='function'?window.buildSourceAwarePedagogy:(typeof buildSourceAwarePedagogy==='function'?buildSourceAwarePedagogy:null);
if(typeof previousBuild==='function'){
  const enhanced=function(map,activities,btRef,uiEn,classId=null){
    const ped=previousBuild.apply(this,arguments),en=!!uiEn;
    try{
      ped.classroomFlow=(ped.classroomFlow||[]).map(step=>({...step,differentiation:diffForStep(step,map,ped,en)}));
      ped.inductionDifferentiation=inductionDiff(en);
      ped.closureDifferentiation=closureDiff(en);
      ped.inlineDifferentiation=true;
    }catch(err){console.warn('RPH inline differentiation:',err)}
    return ped;
  };
  window.buildSourceAwarePedagogy=enhanced;try{buildSourceAwarePedagogy=enhanced}catch{}
}
function diffHtml(d,en=false,marker='step'){
  if(!d)return'';
  return `<div class="rph-inline-diff" data-rph-inline-diff="${esc(marker)}"><div class="rph-step-meta"><b>${en?'Differentiated learning in this activity':'PdP Terbeza dalam aktiviti ini'}</b></div><div class="rph-inline-diff-grid"><div><b>${en?'Support':'Sokongan'}</b><br>${esc(d.support||'')}</div><div><b>${en?'Core':'Teras'}</b><br>${esc(d.core||'')}</div><div><b>${en?'Challenge':'Pengayaan'}</b><br>${esc(d.challenge||'')}</div></div></div>`;
}
let injecting=false;
function inject(){
  if(injecting)return;
  injecting=true;
  try{
    const ctx=appState()?.currentGeneratedRph,ped=ctx?.pedagogy,preview=document.querySelector('#rphPreview');if(!ctx||!ped||!preview)return;
    const en=!!ctx.uiEn;
    const steps=[...preview.querySelectorAll('[data-rph-classroom-flow="1"] .rph-flow-step')];
    steps.forEach((el,i)=>{
      const marker=`step-${i}`;
      if(!el.querySelector(`[data-rph-inline-diff="${marker}"]`)&&ped.classroomFlow?.[i]?.differentiation){
        el.insertAdjacentHTML('beforeend',diffHtml(ped.classroomFlow[i].differentiation,en,marker));
      }
    });
    const sections=[...preview.querySelectorAll('.rph-section')];
    const induction=sections.find(x=>/Set Induksi|Set Induction/i.test(x.querySelector('h3')?.textContent||''));
    const closure=sections.find(x=>/Penutup|Closure/i.test(x.querySelector('h3')?.textContent||''));
    const inductionBody=induction?.querySelector('.rph-section-body');
    if(inductionBody&&!inductionBody.querySelector('[data-rph-inline-diff="induction"]')&&ped.inductionDifferentiation){
      inductionBody.insertAdjacentHTML('beforeend',diffHtml(ped.inductionDifferentiation,en,'induction'));
    }
    const closureBody=closure?.querySelector('.rph-section-body');
    if(closureBody&&!closureBody.querySelector('[data-rph-inline-diff="closure"]')&&ped.closureDifferentiation){
      closureBody.insertAdjacentHTML('beforeend',diffHtml(ped.closureDifferentiation,en,'closure'));
    }
    ctx.html=preview.innerHTML;
  }catch(err){console.warn('RPH inline differentiation injection:',err)}finally{injecting=false}
}
let queued=false;
function queue(){
  if(queued)return;queued=true;
  requestAnimationFrame(()=>{queued=false;inject()});
}
function start(){
  const p=document.querySelector('#rphPreview');if(!p)return;
  const observer=new MutationObserver(mutations=>{
    if(injecting)return;
    if(!mutations.some(m=>m.addedNodes&&m.addedNodes.length))return;
    queue();
  });
  observer.observe(p,{childList:true,subtree:true});
  queue();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.__RPH_INLINE_DIFFERENTIATION__={version:VERSION,inline:true,levels:['support','core','challenge'],preservesRealClassroomFlow:true,idempotentRenderer:true};
console.info('RPH inline differentiation active.');
})();
