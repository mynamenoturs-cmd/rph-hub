(function(){
'use strict';

const VERSION='2026-09-09a';
const root=typeof window!=='undefined'?window:globalThis;
const norm=v=>String(v||'').replace(/\s+/g,' ').trim();

function isExactSessionPedagogy(ped){
  return !!(ped && (ped.exactSessionLibrary===true || ped._exactSessionLibrary===true || ped.sessionLibraryExact===true || ped?.librarySelection?.exactSession===true));
}

function cloneStep(step,i){
  return {
    ...step,
    key:step?.key||`exact-session-step-${i+1}`,
    name:step?.name||`Langkah ${i+1}`,
    text:step?.text||step?.rawText||'',
    duration:step?.duration||'',
    bbm:step?.bbm||'',
    pak21:step?.pak21||''
  };
}

function groupRowFromPed(ped,level,label){
  const direct={
    support:ped?.diffSupportAct||ped?.differentiation?.support,
    core:ped?.diffCoreAct||ped?.differentiation?.core,
    challenge:ped?.diffChallengeAct||ped?.differentiation?.challenge
  }[level];
  const text=norm(typeof direct==='string'?direct:(direct?.text||direct?.activity||''));
  return text?[{key:`exact-${level}`,name:label,text,bbm:'',pak21:''}]:[];
}

function applyGoldLock(ped){
  if(!isExactSessionPedagogy(ped))return ped;
  const locked=(Array.isArray(ped.sourceSteps)?ped.sourceSteps:[]).map(cloneStep).filter(x=>norm(x.text));
  if(!locked.length)return ped;
  ped.classroomFlow=locked;
  ped._goldStandardLocked=true;
  ped._genericEnrichmentBypassed=true;
  ped.inlineDifferentiation=true;
  ped.groupedDifferentiation=false;
  ped.groupDifferentiation={support:[],core:[],challenge:[]};
  ped.librarySteps={
    support:groupRowFromPed(ped,'support','Peneroka'),
    core:groupRowFromPed(ped,'core','Pembina'),
    challenge:groupRowFromPed(ped,'challenge','Pencabar')
  };
  return ped;
}

function wrapBuilder(){
  const previous=typeof root.buildSourceAwarePedagogy==='function'?root.buildSourceAwarePedagogy:null;
  if(!previous||previous.__exactSessionGoldWrapped)return false;
  const wrapped=function(){
    const ped=previous.apply(this,arguments);
    return applyGoldLock(ped);
  };
  wrapped.__exactSessionGoldWrapped=true;
  root.buildSourceAwarePedagogy=wrapped;
  try{buildSourceAwarePedagogy=wrapped}catch{}
  return true;
}

function wrapExport(){
  const previous=typeof root.generatedRphExportContext==='function'?root.generatedRphExportContext:null;
  if(!previous||previous.__exactSessionGoldWrapped)return false;
  const wrapped=function(){
    const out=previous.apply(this,arguments);
    const ped=out?.pedagogy;
    if(!isExactSessionPedagogy(ped)||!ped?._goldStandardLocked)return out;
    const copy={...ped};
    copy.sourceSteps=(ped.sourceSteps||[]).map(cloneStep);
    copy.classroomFlow=(ped.sourceSteps||[]).map(cloneStep);
    copy.groupDifferentiation={support:[],core:[],challenge:[]};
    copy.groupedDifferentiation=false;
    copy.inlineDifferentiation=true;
    copy._exportExactSessionGold=true;
    return {...out,pedagogy:copy,_exportPreviewParity:true,_exactSessionGold:true};
  };
  wrapped.__exactSessionGoldWrapped=true;
  root.generatedRphExportContext=wrapped;
  try{generatedRphExportContext=wrapped}catch{}
  return true;
}

function purgeGroupedPreview(){
  const ctx=root.state?.currentGeneratedRph;
  const ped=ctx?.pedagogy;
  if(!isExactSessionPedagogy(ped)||!ped?._goldStandardLocked)return;
  document?.querySelectorAll?.('[data-rph-group-differentiation="1"]').forEach(el=>el.remove());
  if(ctx?.html){
    try{
      const box=document.createElement('div');box.innerHTML=ctx.html;
      box.querySelectorAll('[data-rph-group-differentiation="1"]').forEach(el=>el.remove());
      ctx.html=box.innerHTML;
    }catch{}
  }
}

function install(){
  wrapBuilder();
  wrapExport();
  try{purgeGroupedPreview()}catch{}
}

install();
if(typeof document!=='undefined'){
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  const preview=document.querySelector?.('#rphPreview');
  if(preview&&typeof MutationObserver!=='undefined'){
    const observer=new MutationObserver(()=>{try{purgeGroupedPreview()}catch{}});
    observer.observe(preview,{childList:true,subtree:true});
  }
}

root.__RPH_EXACT_SESSION_GOLD_STANDARD__={
  VERSION,
  isExactSessionPedagogy,
  applyGoldLock,
  rule:'Exact-session Activity Library is authoritative; generic classroom enrichment must not overwrite sourceSteps.'
};
try{if(typeof module!=='undefined'&&module.exports)module.exports=root.__RPH_EXACT_SESSION_GOLD_STANDARD__}catch{}
root.console?.info?.(`RPH exact-session gold standard lock active (${VERSION}).`);
})(typeof window!=='undefined'?window:globalThis);
