(function(){
'use strict';

const VERSION='2026-09-06b';
function appState(){try{return typeof state!=='undefined'?state:window.state}catch{return window.state}}

function esc(value=''){
  try{if(typeof escapeHtml==='function')return escapeHtml(String(value??''))}catch{}
  return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
function subjectKey(map){
  try{if(typeof rphSubjectKey==='function')return rphSubjectKey(map?.subject_id)}catch{}
  return String(map?.subject_key||'').trim();
}
function lessonYear(map){
  const direct=Number(map?.year||map?.year_level||0);if(direct)return direct;
  try{const cls=typeof getClass==='function'?getClass(map?.class_id):null;if(Number(cls?.year))return Number(cls.year)}catch{}
  return 1;
}
function isEnglish(map){
  try{return typeof lessonLanguage==='function'&&lessonLanguage(map?.subject_id)==='en'}catch{return false}
}
function stableHash(seed=''){
  try{if(typeof rphActivityHash==='function')return rphActivityHash(seed)}catch{}
  let h=2166136261;for(const c of String(seed)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0;
}
function usedKeys(ped){
  return new Set([...(ped?.librarySteps?.support||[]),...(ped?.librarySteps?.core||[]),...(ped?.librarySteps?.challenge||[])].map(x=>String(x?.key||'')).filter(Boolean));
}
function existingGame(ped){
  const rows=[...(ped?.librarySteps?.core||[]),...(ped?.librarySteps?.support||[]),...(ped?.librarySteps?.challenge||[])];
  return rows.find(x=>x&&!String(x.key||'').startsWith('source-')&&(String(x.phase||'').toLowerCase()==='game'||/game|quiz|bingo|relay|challenge|hunt|misteri|dadu|padan|lumba|gallery|station/i.test(`${x.name||''} ${x.pak21||''}`)))||null;
}
function languageOk(row,map){
  const lang=String(row?.language_code||'').toLowerCase();if(!lang)return true;
  if(isEnglish(map))return lang==='en';
  const sk=subjectKey(map);if(sk==='arabic_language')return lang==='ar';if(sk==='islamic_education')return lang==='jawi'||lang==='ms';return lang==='ms';
}
function chooseGameRow(map,activities,ped){
  const rows=Array.isArray(appState()?.rphActivityLibrary)?appState().rphActivityLibrary:[];if(!rows.length)return null;
  const sk=subjectKey(map),year=lessonYear(map),used=usedKeys(ped);let subskill='general',skill='';
  try{subskill=typeof rphSubskillKey==='function'?rphSubskillKey(map,activities):'general'}catch{}
  try{skill=typeof rphSkillKey==='function'?rphSkillKey(map,activities):''}catch{}
  const scored=rows.filter(row=>row&&row.active!==false&&String(row.subject_key||'')===sk&&languageOk(row,map)&&Number(row.year_min||1)<=year&&Number(row.year_max||99)>=year&&(row.is_game===true||String(row.phase||'').toLowerCase()==='game'||/game|quiz|bingo|relay|challenge|hunt|mystery|rotation/i.test(`${row.activity_type||''} ${row.activity_key||''} ${row.activity_name||''}`))).map(row=>{
    const rs=String(row.subskill_key||'general'),rk=String(row.skill_key||'');let score=0;
    if(rs===subskill)score+=80;else if(rs==='general')score+=35;else score-=55;
    if(rk&&rk===skill)score+=25;if(String(row.level_key||'')==='core')score+=18;if(row.requires_source===true)score+=25;
    if(/\{\{source_activity\}\}/.test(String(row.activity_template||'')))score+=18;if(String(row.phase||'')==='game')score+=16;
    score+=Math.min(15,Number(row.selection_weight||0)/10);score-=Math.max(0,Number(row.priority||30)-30)/5;if(used.has(String(row.activity_key||'')))score-=15;
    return {row,score};
  }).filter(x=>x.score>=25).sort((a,b)=>b.score-a.score||String(a.row.activity_key||'').localeCompare(String(b.row.activity_key||'')));
  if(!scored.length)return null;const best=scored[0].score,top=scored.filter(x=>x.score>=best-10).slice(0,6);
  return top[stableHash(`${map?.id||''}|${map?.week_no||map?.week||''}|${map?.session_no||1}|${sk}|interactive`)%top.length]?.row||top[0].row;
}
function fallbackGame(map,ped){
  const page=ped?.page||'',anchor=String(ped?.anchor||ped?.sourceSteps?.[0]?.rawText||'').trim();if(!anchor)return null;
  if(isEnglish(map))return {key:'runtime-source-mini-game',name:'Quick Source Challenge',text:`In teams, pupils answer 4–6 quick prompts using only information, pictures or results already found in the verified source task. A point is awarded only when the team can show supporting evidence on ${page||'the verified source page'}.`,bbm:`${page||"Student's Book"}; mini whiteboards / answer cards`,pak21:'Team Quiz',phase:'game',duration:'5–8 min',sourceGrounded:true};
  return {key:'runtime-source-mini-game',name:'Cabaran Pantas Sumber',text:`Secara berkumpulan, murid menjawab 4–6 cabaran ringkas menggunakan hanya fakta, gambar atau dapatan yang telah muncul dalam tugasan sumber yang disahkan. Mata hanya diberikan apabila kumpulan dapat menunjukkan bukti pada ${page||'halaman sumber yang disahkan'}.`,bbm:`${page||'Buku Teks'}; papan mini / kad jawapan`,pak21:'Team Quiz',phase:'game',duration:'5–8 min',sourceGrounded:true};
}
function buildInteractive(map,activities,ped){
  const current=existingGame(ped);if(current)return {...current,duration:current.duration||'5–8 min',sourceGrounded:true,_fromExistingLibrary:true};
  const row=chooseGameRow(map,activities,ped);
  if(row){
    try{if(typeof rphRenderLibraryActivity==='function'){const step=rphRenderLibraryActivity(row,map,ped?.anchor||'',ped?.page||'','core');if(step)return {...step,duration:'5–8 min',sourceGrounded:true,_activityLibraryKey:row.activity_key}}}catch(err){console.warn('RPH interactive library render:',err)}
  }
  return fallbackGame(map,ped);
}

const previousBuild=typeof window.buildSourceAwarePedagogy==='function'?window.buildSourceAwarePedagogy:(typeof buildSourceAwarePedagogy==='function'?buildSourceAwarePedagogy:null);
if(typeof previousBuild==='function'){
  const enhanced=function(map,activities,btRef,uiEn,classId=null){
    const ped=previousBuild.apply(this,arguments);
    try{ped.interactiveStep=buildInteractive(map,activities,ped);ped.interactiveDuration=ped.interactiveStep?.duration||'5–8 min'}catch(err){console.warn('RPH interactive enrichment:',err)}
    return ped;
  };
  window.buildSourceAwarePedagogy=enhanced;try{buildSourceAwarePedagogy=enhanced}catch{}
}

const previousExport=typeof window.generatedRphExportContext==='function'?window.generatedRphExportContext:(typeof generatedRphExportContext==='function'?generatedRphExportContext:null);
if(typeof previousExport==='function'){
  const enhancedExport=function(ctx){
    const out=previousExport.apply(this,arguments),ped=out?.pedagogy,step=ped?.interactiveStep||ctx?.pedagogy?.interactiveStep;
    if(!ped?.librarySteps||!step||step._fromExistingLibrary)return out;
    const all=[...(ped.librarySteps.support||[]),...(ped.librarySteps.core||[]),...(ped.librarySteps.challenge||[])];
    if(all.some(x=>String(x?.key||'')===String(step.key||'')))return out;
    ped.librarySteps.core=[...(ped.librarySteps.core||[]),{...step,name:(out.uiEn?'Interactive reinforcement — ':'Pengukuhan interaktif — ')+(step.name||'')}];
    return out;
  };
  window.generatedRphExportContext=enhancedExport;try{generatedRphExportContext=enhancedExport}catch{}
}

function blockHtml(ctx){
  const step=ctx?.pedagogy?.interactiveStep;if(!step)return '';
  const en=!!ctx.uiEn,page=ctx.btRef||ctx.pedagogy?.page||'';
  return `<div class="rph-activity-block rph-interactive-enrichment" data-rph-interactive-enrichment="1"><div class="rph-activity-label">🎲 ${en?'Interactive Reinforcement / Mini Game':'Aktiviti Pengukuhan Interaktif / Permainan Kecil'}</div><div class="rph-source-badge">${esc(step.duration||'5–8 min')} • ${en?'source-grounded':'berasaskan sumber'} • ${esc(page)}</div><table class="rph-step-table"><tbody><tr><th>${en?'Activity':'Aktiviti'}<br><small>${en?'21st Century Learning':'PAK-21'}</small></th><td><b>${esc(step.name||'')}</b>${step.pak21?`<div class="rph-step-meta">PAK-21: ${esc(step.pak21)}</div>`:''}</td></tr><tr><th>${en?'How to run it':'Cara pelaksanaan'}</th><td>${esc(step.text||'')}</td></tr><tr><th>${en?'Teaching aids':'BBM/ABM'}</th><td>${esc(step.bbm||page||'—')}</td></tr></tbody></table><div class="field-note">${en?'This activity enriches delivery only; the learning evidence still comes from the verified source task.':'Aktiviti ini mengayakan cara PdP sahaja; evidens pembelajaran masih berpunca daripada tugasan sumber yang telah disahkan.'}</div></div>`;
}
function inject(){
  try{
    const preview=document.querySelector('#rphPreview'),ctx=appState()?.currentGeneratedRph;if(!preview||!ctx?.pedagogy?.interactiveStep||preview.querySelector('[data-rph-interactive-enrichment="1"]'))return;
    const section=[...preview.querySelectorAll('.rph-section')].find(sec=>/Aktiviti PdP|Learning Activities/i.test(sec.querySelector('h3')?.textContent||'')),body=section?.querySelector('.rph-section-body'),source=body?.querySelector('.rph-activity-block');if(!source)return;
    source.insertAdjacentHTML('afterend',blockHtml(ctx));ctx.html=preview.innerHTML;
  }catch(err){console.warn('RPH interactive block injection:',err)}
}
let queued=false;function queueInject(){if(queued)return;queued=true;queueMicrotask(()=>{queued=false;inject()})}
function start(){const preview=document.querySelector('#rphPreview');if(preview)new MutationObserver(queueInject).observe(preview,{childList:true,subtree:true});queueInject()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

window.__RPH_INTERACTIVE_ENRICHMENT__={version:VERSION,sourceFirst:true,oneMiniGamePerLesson:true,duration:'5–8 min',chooser:'activity-library-deterministic',exportIncluded:true};
console.info('RPH interactive enrichment active.');
})();
