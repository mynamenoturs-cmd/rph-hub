(function(){
'use strict';

const VERSION='2026-09-06c';
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
function groupRows(flow=[],level='support'){
  return flow.map((step,i)=>({key:`group-${level}-${i+1}`,name:step?.name||`Langkah ${i+1}`,text:step?.differentiation?.[level]||'',bbm:step?.bbm||'',pak21:step?.pak21||''})).filter(x=>norm(x.text));
}

const previousBuild=typeof window.buildSourceAwarePedagogy==='function'?window.buildSourceAwarePedagogy:(typeof buildSourceAwarePedagogy==='function'?buildSourceAwarePedagogy:null);
if(typeof previousBuild==='function'){
  const enhanced=function(map,activities,btRef,uiEn,classId=null){
    const ped=previousBuild.apply(this,arguments),en=!!uiEn;
    try{
      ped.classroomFlow=(ped.classroomFlow||[]).map(step=>({...step,differentiation:diffForStep(step,map,ped,en)}));
      ped.groupDifferentiation={support:groupRows(ped.classroomFlow,'support'),core:groupRows(ped.classroomFlow,'core'),challenge:groupRows(ped.classroomFlow,'challenge')};
      ped.inlineDifferentiation=false;ped.groupedDifferentiation=true;
    }catch(err){console.warn('RPH grouped differentiation:',err)}
    return ped;
  };
  window.buildSourceAwarePedagogy=enhanced;try{buildSourceAwarePedagogy=enhanced}catch{}
}
function groupItems(rows=[]){return rows.map((row,i)=>`<div class="rph-group-step"><b>${i+1}. ${esc(row.name||'')}</b><br><span>${esc(row.text||'')}</span></div>`).join('')}
function groupedHtml(ped,en=false){
  const groups=ped?.groupDifferentiation||{};if(!(groups.support?.length||groups.core?.length||groups.challenge?.length))return'';
  return `<div class="rph-activity-block rph-grouped-differentiation" data-rph-group-differentiation="1"><div class="rph-activity-label">${en?'Differentiated Instruction (3 Groups)':'PdP Terbeza (3 Kumpulan)'}</div><div class="rph-source-badge">${en?'Same lesson activities • different levels of scaffolding':'Aktiviti pelajaran yang sama • tahap bimbingan berbeza'}</div><div class="group-suggestion"><div class="group-card group-explorer"><b>${en?'Explorer Group':'Kelompok Peneroka'}</b><br><small>${en?'guided support':'bimbingan / sokongan'}</small><div>${groupItems(groups.support)}</div></div><div class="group-card group-builder"><b>${en?'Builder Group':'Kelompok Pembina'}</b><br><small>${en?'standard task':'tugasan standard'}</small><div>${groupItems(groups.core)}</div></div><div class="group-card group-challenger"><b>${en?'Challenger Group':'Kelompok Pencabar'}</b><br><small>${en?'extension / higher-order thinking':'pengayaan / KBAT'}</small><div>${groupItems(groups.challenge)}</div></div></div></div>`;
}
let injecting=false;
function inject(){
  if(injecting)return;injecting=true;
  try{
    const ctx=appState()?.currentGeneratedRph,ped=ctx?.pedagogy,preview=document.querySelector('#rphPreview');if(!ctx||!ped||!preview)return;
    preview.querySelectorAll('[data-rph-inline-diff]').forEach(x=>x.remove());
    const flow=preview.querySelector('[data-rph-classroom-flow="1"]');if(!flow)return;
    const body=flow.closest('.rph-section-body')||flow.parentElement;if(!body)return;
    if(!body.querySelector('[data-rph-group-differentiation="1"]'))flow.insertAdjacentHTML('afterend',groupedHtml(ped,!!ctx.uiEn));
    ctx.html=preview.innerHTML;
  }catch(err){console.warn('RPH grouped differentiation injection:',err)}finally{injecting=false}
}
let queued=false;function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;inject()})}
function start(){const p=document.querySelector('#rphPreview');if(!p)return;const observer=new MutationObserver(mutations=>{if(injecting)return;if(!mutations.some(m=>m.addedNodes&&m.addedNodes.length))return;queue()});observer.observe(p,{childList:true,subtree:true});queue()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.__RPH_INLINE_DIFFERENTIATION__={version:VERSION,inline:false,grouped:true,levels:['support','core','challenge'],preservesRealClassroomFlow:true,idempotentRenderer:true};
console.info('RPH grouped differentiation active.');
})();
