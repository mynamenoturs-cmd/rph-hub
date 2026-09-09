(function(){
'use strict';

const VERSION='2026-09-09a';
const root=typeof window!=='undefined'?window:globalThis;
const norm=v=>String(v||'').replace(/\s+/g,' ').trim();

function appState(){
  try{return typeof state!=='undefined'?state:root.state}catch{return root.state}
}
function esc(v=''){
  return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}
const LEVELS={
  support:{label:'Peneroka',en:'Explorer',help:'Bimbingan',helpEn:'Guided support',field:'diffSupportAct',base:'diffSupport'},
  core:{label:'Pembina',en:'Builder',help:'Bantuan minimum',helpEn:'Minimal support',field:'diffCoreAct',base:'diffCore'},
  challenge:{label:'Pencabar',en:'Challenger',help:'Pengayaan selepas tugasan teras',helpEn:'Extension after the core task',field:'diffChallengeAct',base:'diffChallenge'}
};
function firstStepText(pool){
  for(const step of (Array.isArray(pool)?pool:[])){
    const text=norm(step?.text||step?.rawText||step?.activity||'');
    if(text)return text;
  }
  return '';
}
function groupText(ped,level){
  const meta=LEVELS[level];
  return firstStepText(ped?.librarySteps?.[level])||
    firstStepText(ped?.groupDifferentiation?.[level])||
    norm(ped?.[meta.field]||ped?.[meta.base]||ped?.differentiation?.[level]||'');
}
function deriveDifferentiatedPbd(ped){
  if(!ped)return null;
  const groups={};
  let count=0;
  for(const [level,meta] of Object.entries(LEVELS)){
    const evidence=groupText(ped,level);
    groups[level]={...meta,evidence};
    if(evidence)count++;
  }
  if(!count)return null;
  return {
    groups,
    method:norm(ped?.pbdEvidence?.method||''),
    evidence:norm(ped?.pbdEvidence?.evidence||''),
    criterion:norm(ped?.pbdEvidence?.criterion||''),
    complete:count===3
  };
}
function cardHtml(level,data,uiEn){
  const classes={support:'group-explorer',core:'group-builder',challenge:'group-challenger'};
  const title=uiEn?data.en:data.label;
  const help=uiEn?data.helpEn:data.help;
  const missing=uiEn?'No differentiated evidence is available for this group.':'Tiada evidens terbeza tersedia untuk kelompok ini.';
  return `<div class="group-card ${classes[level]}"><b>${esc(title)}</b><br><small>${esc(uiEn?'Assessment access':'Akses pentaksiran')}: ${esc(help)}</small><br><div style="margin-top:6px"><b>${esc(uiEn?'Specific evidence':'Evidens khusus')}:</b> ${esc(data.evidence||missing)}</div></div>`;
}
function blockHtml(ped,uiEn=false){
  const diff=deriveDifferentiatedPbd(ped);if(!diff)return '';
  const criterion=diff.criterion||'';
  return `<div class="rph-activity-block" data-rph-differentiated-pbd="1"><div class="rph-activity-label">${uiEn?'Differentiated PBD':'PBD Terbeza Mengikut Kelompok'}</div><div class="group-suggestion">${cardHtml('support',diff.groups.support,uiEn)}${cardHtml('core',diff.groups.core,uiEn)}${cardHtml('challenge',diff.groups.challenge,uiEn)}</div>${criterion?`<div style="margin-top:10px"><small><b>${esc(uiEn?'Core success criterion remains aligned':'Kriteria kejayaan teras kekal selari')}:</b> ${esc(criterion)} ${esc(uiEn?'The differentiation is in support level and evidence form, not a different curriculum standard.':'Perbezaan ialah tahap bantuan dan bentuk evidens, bukan Standard Pembelajaran yang berbeza.')}</small></div>`:''}</div>`;
}
function isEnglishContext(ctx){
  const ped=ctx?.pedagogy||{};
  return ped?.language==='en'||ped?.language_code==='en'||ctx?.language==='en';
}
function decoratePreview(){
  if(typeof document==='undefined')return false;
  const ctx=appState()?.currentGeneratedRph;
  const ped=ctx?.pedagogy;if(!ped)return false;
  const table=document.querySelector('#rphPreview .rph-pbd-table');if(!table)return false;
  const body=table.closest('.rph-section-body')||table.parentElement;if(!body)return false;
  body.querySelectorAll('[data-rph-differentiated-pbd="1"]').forEach(el=>el.remove());
  const html=blockHtml(ped,isEnglishContext(ctx));if(!html)return false;
  table.insertAdjacentHTML('afterend',html);
  return true;
}
function decorateStoredHtml(){
  const ctx=appState()?.currentGeneratedRph;if(!ctx?.html||typeof document==='undefined')return;
  try{
    const box=document.createElement('div');box.innerHTML=ctx.html;
    const table=box.querySelector('.rph-pbd-table');if(!table)return;
    const body=table.closest('.rph-section-body')||table.parentElement;
    body?.querySelectorAll?.('[data-rph-differentiated-pbd="1"]').forEach(el=>el.remove());
    const html=blockHtml(ctx.pedagogy,isEnglishContext(ctx));if(html)table.insertAdjacentHTML('afterend',html);
    ctx.html=box.innerHTML;
  }catch(error){root.console?.warn?.('Differentiated PBD stored preview:',error)}
}
function differentiatedEvidenceText(ped,uiEn=false){
  const diff=deriveDifferentiatedPbd(ped);if(!diff)return '';
  const rows=Object.entries(diff.groups).filter(([,g])=>g.evidence).map(([,g])=>`${uiEn?g.en:g.label} (${uiEn?g.helpEn:g.help}): ${g.evidence}`);
  if(!rows.length)return '';
  return `${uiEn?'Differentiated PBD':'PBD Terbeza'} — ${rows.join(' | ')}`;
}
function wrapExport(){
  const previous=typeof root.generatedRphExportContext==='function'?root.generatedRphExportContext:null;
  if(!previous||previous.__differentiatedPbdWrapped)return false;
  const wrapped=function(){
    const out=previous.apply(this,arguments);const ped=out?.pedagogy;if(!ped)return out;
    const extra=differentiatedEvidenceText(ped,isEnglishContext(out));if(!extra)return out;
    const base=norm(ped?.pbdEvidence?.evidence||'');
    ped.pbdEvidence={...(ped.pbdEvidence||{}),evidence:[base,extra].filter(Boolean).join('\n')};
    ped._differentiatedPbdExport=true;
    return out;
  };
  wrapped.__differentiatedPbdWrapped=true;
  root.generatedRphExportContext=wrapped;
  try{generatedRphExportContext=wrapped}catch{}
  return true;
}
function install(){
  wrapExport();
  try{decoratePreview();decorateStoredHtml()}catch(error){root.console?.warn?.('Differentiated PBD preview:',error)}
}
install();
if(typeof document!=='undefined'){
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  setTimeout(install,0);
  const preview=document.querySelector?.('#rphPreview');
  if(preview&&typeof MutationObserver!=='undefined'){
    let busy=false;
    new MutationObserver(()=>{if(busy)return;busy=true;try{decoratePreview();decorateStoredHtml()}finally{setTimeout(()=>{busy=false},0)}}).observe(preview,{childList:true,subtree:true});
  }
}
root.__RPH_DIFFERENTIATED_PBD_PREVIEW__={VERSION,deriveDifferentiatedPbd,blockHtml,differentiatedEvidenceText};
try{if(typeof module!=='undefined'&&module.exports)module.exports=root.__RPH_DIFFERENTIATED_PBD_PREVIEW__}catch{}
root.console?.info?.(`RPH differentiated PBD preview active (${VERSION}).`);
})(typeof window!=='undefined'?window:globalThis);
