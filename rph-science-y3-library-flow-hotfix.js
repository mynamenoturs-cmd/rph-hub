(function(){
'use strict';

const VERSION='2026-09-08b';
const EXPECTED_LIBRARY_ROWS=70;
const YEAR3_WEEKS=Array.from({length:36},(_,i)=>i+2).filter(w=>w!==6);

function appState(){try{return typeof state!=='undefined'?state:window.state}catch{return window.state}}
function norm(v=''){return String(v??'').replace(/\s+/g,' ').replace(/\s+([,.;:!?])/g,'$1').trim()}
function esc(v=''){try{if(typeof escapeHtml==='function')return escapeHtml(String(v??''))}catch{}return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}
function stableHash(seed=''){
  try{if(typeof rphActivityHash==='function')return rphActivityHash(seed)}catch{}
  let h=2166136261;for(const c of String(seed)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0;
}
function subjectKey(map){
  try{if(typeof rphSubjectKey==='function')return String(rphSubjectKey(map?.subject_id)||'').toLowerCase()}catch{}
  return String(map?.subject_key||'').toLowerCase();
}
function classYear(map,classId=null){
  const direct=Number(map?.year||map?.year_level||map?.grade||map?.class_year||0);
  if(direct)return direct;
  try{
    const c=(appState()?.classes||[]).find(x=>String(x?.id||'')===String(classId||map?.class_id||''));
    const y=Number(c?.year||c?.year_level||c?.grade||c?.class_year||0);if(y)return y;
    const m=String(c?.name||c?.class_name||'').match(/(?:tahun|year)?\s*([1-6])\b/i);if(m)return Number(m[1]);
  }catch{}
  const id=String(map?.id||'');const m=id.match(/(?:SC|SCIENCE|SAINS)\s*3\b/i);return m?3:0;
}
function isScienceY3(map,classId=null){return subjectKey(map)==='science'&&classYear(map,classId)===3}
function mapPageLabel(map){
  const start=Number(map?.textbook_page_start||map?.textbook_page||0),end=Number(map?.textbook_page_end||0);
  if(start&&end&&end!==start)return `Buku Teks m/s ${start}–${end}`;
  return start?`Buku Teks m/s ${start}`:'Buku Teks';
}
function pageLabel(map,ped){
  const raw=norm(ped?.page||'');
  if(raw&&raw!=='—'&&!/^(?:page|p\.?|m\/s|ms|buku teks)$/i.test(raw)){
    if(/^m\/s\s*\d/i.test(raw))return `Buku Teks ${raw}`;
    if(/^page\s*\d/i.test(raw))return `Buku Teks m/s ${raw.match(/\d+(?:\s*[–-]\s*\d+)?/)?.[0]||''}`.trim();
    if(/\d/.test(raw))return raw;
  }
  return mapPageLabel(map);
}
function cleanTask(v=''){
  let s=norm(v);
  const q=s.match(/[“"]([^”"]{6,320})[”"]/);if(q?.[1])s=q[1];
  s=s.replace(/^(?:Arahan buku|Book instruction)\s*:\s*/i,'')
    .replace(/^(?:BT|Buku Teks|Student['’]?s Book)\s*(?:m\/s|ms|p\.?|page)?\s*\d+(?:\s*[–-]\s*\d+)?\s*[:\-–]?\s*/i,'')
    .replace(/^Murid\s+/i,'').replace(/^Pupils?\s+/i,'').replace(/^Students?\s+/i,'')
    .replace(/^menjawab soalan sumber\s*:\s*/i,'')
    .replace(/^answer(?:s|ing)? the source question\s*:\s*/i,'')
    .replace(/\b(?:teks\s+OCR|dialog\s+OCR|OCR|source\s+task|source\s+evidence|LOCAL_PROPOSED|LOCAL_VERIFIED)\b/gi,'')
    .replace(/\s*\)\s*\d+\b/g,'')
    .replace(/\bP\s*=\s*:\s*\d+\b/gi,'')
    .replace(/\bJ\s*\)/g,'')
    .replace(/\s+and\s+/gi,' dan ');
  return norm(s).replace(/[.!]+$/,'');
}
function usableTask(s=''){
  const t=norm(s);if(t.length<8)return false;
  if(/(?:P\s*=\s*:|\bJ\s*\)|\)\s*\d+\b|\b(?:OCR|LOCAL_PROPOSED|LOCAL_VERIFIED)\b)/i.test(t))return false;
  const opens=(t.match(/\(/g)||[]).length,closes=(t.match(/\)/g)||[]).length;if(Math.abs(opens-closes)>1)return false;
  return true;
}
function trustedSourceRows(ped){
  const rows=[];
  const pools=[ped?.core,ped?.librarySteps?.core];
  for(const pool of pools){
    for(const step of pool||[]){
      const key=String(step?.key||'').toLowerCase(),phase=String(step?.phase||'').toLowerCase();
      if(!(key.startsWith('sc3-')||phase==='source'))continue;
      const t=cleanTask(step?.rawText||step?.text||'');if(usableTask(t)&&!rows.includes(t))rows.push(t);
    }
  }
  return rows;
}
function sourceTasks(ped){
  const trusted=trustedSourceRows(ped);if(trusted.length)return trusted.slice(0,3);
  const out=[];
  for(const step of ped?.sourceSteps||[]){
    const t=cleanTask(step?.rawText||step?.text||'');if(usableTask(t)&&!out.includes(t))out.push(t);
  }
  if(!out.length){const t=cleanTask(ped?.anchor||'');if(usableTask(t))out.push(t)}
  return out.slice(0,4);
}
function taskSummary(tasks=[]){
  if(!tasks.length)return '';
  if(tasks.length===1)return `“${tasks[0]}”`;
  return tasks.slice(0,2).map(x=>`“${x}”`).join(' dan ');
}
function truthy(v){return v===true||/^(?:true|1|yes|ya)$/i.test(String(v||''))}
function libraryRows(map,classId=null){
  if(!isScienceY3(map,classId))return [];
  const rows=(appState()?.rphActivityLibrary||[]).filter(r=>{
    const key=String(r?.activity_key||'').toLowerCase();
    const min=Number(r?.year_min||0),max=Number(r?.year_max||99);
    return r?.active!==false&&key.startsWith('science_y3_')&&String(r?.subject_key||'').toLowerCase()==='science'&&min<=3&&max>=3&&truthy(r?.requires_source);
  });
  return rows.sort((a,b)=>{
    const ah=stableHash(`${a.activity_key}|science-y3-v3`),bh=stableHash(`${b.activity_key}|science-y3-v3`);
    return ah-bh||String(a.activity_key).localeCompare(String(b.activity_key));
  });
}
function sessionOrdinal(map){
  const week=Number(map?.week_no||map?.week||0),session=Math.max(1,Number(map?.session_no||map?.session||1));
  const wi=YEAR3_WEEKS.indexOf(week);return wi>=0?(wi*2+Math.min(1,session-1)):-1;
}
function chooseLibraryRow(map,classId=null){
  const rows=libraryRows(map,classId);if(rows.length<EXPECTED_LIBRARY_ROWS)return null;
  const ordinal=sessionOrdinal(map);
  const idx=ordinal>=0?ordinal%rows.length:stableHash(`${map?.id||''}|${map?.week_no||''}|${map?.session_no||1}|science-y3-library`)%rows.length;
  return rows[idx]||null;
}
function materialize(v,tasks=[],page=''){
  const summary=taskSummary(tasks),first=tasks[0]||'';
  return norm(String(v||'')
    .replace(/\{\{\s*source_activity\s*\}\}/gi,summary||first)
    .replace(/\{\{\s*(?:page|source_page|textbook_page|source_ref)\s*\}\}/gi,page));
}
function cleanBbm(v,page){
  const s=norm(v);
  if(!s||/^(?:page|p\.?|m\/s|ms|buku teks)$/i.test(s))return page;
  if(/^m\/s\s*\d/i.test(s))return `Buku Teks ${s}`;
  return s.replace(/^page\s+(\d+(?:\s*[–-]\s*\d+)?)/i,'Buku Teks m/s $1');
}
function parseDifferentiation(example=''){
  const s=norm(example),pick=(label,next)=>{
    const re=new RegExp(`${label}\\s*:\\s*(.*?)(?=${next?`${next}\\s*:`:'$'})`,'i');
    return norm(s.match(re)?.[1]||'').replace(/^[;,.\s]+|[;,.\s]+$/g,'');
  };
  return {support:pick('Peneroka','Pembina'),core:pick('Pembina','Pencabar'),challenge:pick('Pencabar','')};
}
function fallbackDiff(page,tasks=[]){
  const q=taskSummary(tasks)||'tugasan pada Buku Teks';
  return {
    support:`Gunakan kad kata kunci/gambar, contoh separuh siap dan bimbingan rakan untuk menyelesaikan ${q}.`,
    core:`Laksanakan ${q} secara berpasangan atau kumpulan menggunakan bahan biasa dan semak satu jawapan bersama rakan.`,
    challenge:`Laksanakan ${q}, kemudian tambah satu sebab, bukti, perbandingan, aplikasi atau justifikasi yang berkaitan dengan ${page}.`
  };
}
function durationFor(phase='practice'){
  return ({input:'6–8 min',guided:'12–15 min',practice:'15–20 min',game:'8–10 min',evidence:'6–8 min',sharing:'8–10 min'})[phase]||'12–15 min';
}
function libraryMainStep(row,map,ped,tasks=[]){
  const page=pageLabel(map,ped),phase=String(row?.phase||'practice').toLowerCase();
  const parsed=parseDifferentiation(materialize(row?.example_text,tasks,page)),fallback=fallbackDiff(page,tasks);
  const diff={support:cleanTask(parsed.support)||fallback.support,core:cleanTask(parsed.core)||fallback.core,challenge:cleanTask(parsed.challenge)||fallback.challenge};
  const base=cleanTask(materialize(row?.activity_template,tasks,page));
  const rawBbm=materialize(row?.bbm_template,tasks,page),bbm=cleanBbm(rawBbm,page);
  return {key:String(row?.activity_key||'science-y3-library'),name:norm(row?.activity_name||'Aktiviti Sains'),phase,duration:durationFor(phase),text:base,bbm,pak21:norm(row?.pak21||'Kolaborasi • Komunikasi'),differentiation:diff,libraryActivityKey:row?.activity_key||'',libraryDriven:true};
}
function openStep(map,ped,tasks=[]){
  const page=pageLabel(map,ped),summary=taskSummary(tasks);
  return {key:'science-y3-source-open',name:'Fikir, Semak dan Jelaskan',duration:'5–7 min',text:`Guru meminta murid membuka ${page}. Murid meneliti ${summary}, berfikir sendiri selama kira-kira 30 saat, kemudian menyemak idea dengan pasangan. Dua atau tiga murid menerangkan jawapan awal sebelum guru memulakan aktiviti utama.`,bbm:page,pak21:'Think-Pair-Share'};
}
function checkStep(map,ped,tasks=[]){
  const page=pageLabel(map,ped),focus=tasks[0]||'tugasan pelajaran';
  return {key:'science-y3-source-check',name:'Semak Hasil dan Kongsi',duration:'5–7 min',text:`Kumpulan menunjukkan hasil atau jawapan akhir secara serentak. Seorang wakil menerangkan cara kumpulan menyelesaikan “${focus}”. Rakan menyemak satu perkara yang tepat dan satu perkara yang perlu dibaiki, kemudian murid membetulkan hasil sendiri dengan merujuk ${page}.`,bbm:`${page}; hasil kerja murid / papan mini`,pak21:'Semakan Rakan • Komunikasi'};
}
function libraryFlow(row,map,ped,tasks=[]){
  const main=libraryMainStep(row,map,ped,tasks),open=openStep(map,ped,tasks),check=checkStep(map,ped,tasks);
  if(main.phase==='input')return [main,open,check];
  if(main.phase==='sharing'||main.phase==='evidence')return [open,check,main];
  return [open,main,check];
}

const previousBuild=typeof window.buildSourceAwarePedagogy==='function'?window.buildSourceAwarePedagogy:(typeof buildSourceAwarePedagogy==='function'?buildSourceAwarePedagogy:null);
if(typeof previousBuild==='function'){
  const enhanced=function(map,activities,btRef,uiEn,classId=null){
    const ped=previousBuild.apply(this,arguments);
    try{
      if(uiEn||!isScienceY3(map,classId))return ped;
      const tasks=sourceTasks(ped),row=chooseLibraryRow(map,classId);
      if(!tasks.length||!row)return ped;
      ped.page=pageLabel(map,ped);
      ped.classroomFlow=libraryFlow(row,map,ped,tasks);
      ped.groupDifferentiation={support:[],core:[],challenge:[]};
      ped.inlineDifferentiation=true;ped.groupedDifferentiation=false;
      ped.activityLibrarySelection={activity_key:row.activity_key,activity_name:row.activity_name,phase:row.phase,source:'rph_activity_library',taskSource:trustedSourceRows(ped).length?'verified_science_blueprint':'verified_source_step',version:VERSION};
      ped.integratedClassroomFlow=true;ped.scienceY3LibraryDriven=true;
    }catch(err){console.warn('RPH Science Y3 Activity Library flow:',err)}
    return ped;
  };
  window.buildSourceAwarePedagogy=enhanced;try{buildSourceAwarePedagogy=enhanced}catch{}
}

function diffHtml(diff){
  if(!diff||!(diff.support||diff.core||diff.challenge))return'';
  return `<div class="rph-inline-diff-visible" data-rph-inline-diff-visible="1"><div class="rph-inline-diff-heading">PdP Terbeza dalam aktiviti yang sama</div><div class="rph-inline-diff-row"><b>Peneroka</b><span>${esc(diff.support||'—')}</span></div><div class="rph-inline-diff-row"><b>Pembina</b><span>${esc(diff.core||'—')}</span></div><div class="rph-inline-diff-row"><b>Pencabar</b><span>${esc(diff.challenge||'—')}</span></div></div>`;
}
function ensureStyle(){
  if(document.querySelector('#rph-science-y3-flow-style'))return;
  const st=document.createElement('style');st.id='rph-science-y3-flow-style';st.textContent=`
  .rph-classroom-flow .rph-flow-title{display:flex;align-items:baseline;gap:.55rem;flex-wrap:wrap}
  .rph-inline-diff-visible{margin:.75rem 0 .15rem;padding:.7rem .8rem;border:1px solid rgba(20,126,112,.22);border-radius:12px;background:rgba(20,126,112,.055)}
  .rph-inline-diff-heading{font-weight:800;color:#167e70;margin-bottom:.45rem}
  .rph-inline-diff-row{display:grid;grid-template-columns:82px 1fr;gap:.55rem;padding:.38rem 0;border-top:1px dashed rgba(0,0,0,.12)}
  .rph-inline-diff-row:first-of-type{border-top:0}.rph-inline-diff-row b{color:#263936}.rph-inline-diff-row span{min-width:0}
  @media(max-width:520px){.rph-inline-diff-row{grid-template-columns:1fr;gap:.08rem}}
  `;(document.head||document.documentElement).appendChild(st);
}
function normalizeBadge(preview,ped){
  const badge=preview.querySelector('[data-rph-classroom-flow="1"] .rph-source-badge');if(!badge)return;
  const current=norm(badge.textContent||'');if(!/^(?:page|p\.?|m\/s|ms)(?:\s*•|$)/i.test(current))return;
  const first=ped?.classroomFlow?.find(x=>/Buku Teks m\/s\s*\d/i.test(String(x?.bbm||'')));
  const p=String(first?.bbm||ped?.page||'').match(/Buku Teks m\/s\s*\d+(?:\s*[–-]\s*\d+)?/i)?.[0];if(p)badge.textContent=`${p} • satu aliran aktiviti berterusan`;
}
let injecting=false;
function injectVisibleDiff(){
  if(injecting)return;injecting=true;
  try{
    const ctx=appState()?.currentGeneratedRph,ped=ctx?.pedagogy,preview=document.querySelector('#rphPreview');if(!ctx||!ped?.scienceY3LibraryDriven||!preview)return;
    ensureStyle();normalizeBadge(preview,ped);
    const nodes=[...preview.querySelectorAll('[data-rph-classroom-flow="1"] .rph-flow-step')];
    nodes.forEach((node,i)=>{
      node.querySelectorAll('[data-rph-inline-diff-visible="1"]').forEach(x=>x.remove());
      const step=ped.classroomFlow?.[i],html=diffHtml(step?.differentiation);if(!html)return;
      const text=node.querySelector('.rph-flow-text');if(text)text.insertAdjacentHTML('afterend',html);
    });
    ctx.html=preview.innerHTML;
  }catch(err){console.warn('RPH Science Y3 visible differentiation:',err)}finally{injecting=false}
}
let queued=false;function queueInject(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;injectVisibleDiff()})}
function start(){const preview=document.querySelector('#rphPreview');if(!preview)return;new MutationObserver(m=>{if(injecting)return;if(m.some(x=>x.addedNodes?.length))queueInject()}).observe(preview,{childList:true,subtree:true});queueInject()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

window.__RPH_SCIENCE_Y3_LIBRARY_FLOW__={version:VERSION,subject:'science',year:3,expectedRows:EXPECTED_LIBRARY_ROWS,libraryDeterminesMethod:true,sourceDeterminesContent:true,forcedGameEverySession:false,separateDifferentiationBlock:false,visibleInlineDifferentiation:true,repairsBrokenOcrTasks:true,normalizesPageLabel:true};
console.info('RPH Science Year 3 library-driven classroom flow active.');
})();
