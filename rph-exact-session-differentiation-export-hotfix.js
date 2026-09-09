(function(){
'use strict';

const VERSION='2026-09-09b';
const root=typeof window!=='undefined'?window:globalThis;
const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
const LEVELS={
  support:{label:'Peneroka',field:'diffSupportAct',base:'diffSupport',source:'Peneroka'},
  core:{label:'Pembina',field:'diffCoreAct',base:'diffCore',source:'Pembina'},
  challenge:{label:'Pencabar',field:'diffChallengeAct',base:'diffChallenge',source:'Pencabar'}
};

function appState(){
  try{return typeof state!=='undefined'?state:root.state}catch{return root.state}
}
function isExact(ped){
  return !!(ped&&(ped.exactSessionLibrary===true||ped._exactSessionLibrary===true||ped.sessionLibraryExact===true||ped?.librarySelection?.exactSession===true));
}
function cloneStep(step,i,label){
  return {...step,key:step?.key||`exact-diff-${i+1}`,name:step?.name||label,text:norm(step?.text||step?.rawText||''),bbm:step?.bbm||'',pak21:step?.pak21||''};
}
function activityKey(ped){
  return String(ped?.activityLibrarySelection?.activity_key||ped?.librarySelection?.activity_key||ped?.activity_library_key||'').trim();
}
function activityRow(ped){
  const key=activityKey(ped);if(!key)return null;
  return (appState()?.rphActivityLibrary||[]).find(row=>String(row?.activity_key||'')===key)||null;
}
function escapeRe(s){return String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
function labelText(exampleText,label){
  const labels=['Objektif','Kriteria kejayaan','Peneroka','Pembina','Pencabar','PBD'];
  const i=labels.indexOf(label),next=labels.slice(i+1).map(x=>`${escapeRe(x)}\\s*:`).join('|');
  const re=new RegExp(`${escapeRe(label)}\\s*:\\s*([\\s\\S]*?)${next?`(?=${next}|$)`:'$'}`,'i');
  return norm(String(exampleText||'').replace(/\r/g,'').match(re)?.[1]||'');
}
function existingText(ped,level){
  const meta=LEVELS[level],pools=[ped?.librarySteps?.[level],ped?.groupDifferentiation?.[level]];
  for(const pool of pools){for(const step of (Array.isArray(pool)?pool:[])){const text=norm(step?.text||step?.rawText||'');if(text)return text}}
  const direct=norm(ped?.[meta.field]||ped?.[meta.base]||ped?.differentiation?.[level]||'');
  if(direct)return direct;
  return labelText(activityRow(ped)?.example_text,meta.source);
}
function hydrate(ped){
  if(!isExact(ped))return ped;
  const groups={support:[],core:[],challenge:[]};
  for(const [level,meta] of Object.entries(LEVELS)){
    const text=existingText(ped,level);
    if(text){
      const source=(ped?.librarySteps?.[level]||[]).find(x=>norm(x?.text||x?.rawText||''));
      groups[level]=[cloneStep(source||{key:`exact-${level}`,name:meta.label,text},0,meta.label)];
      groups[level][0].text=text;
      ped[meta.field]=text;
      if(!norm(ped[meta.base]))ped[meta.base]=text;
    }
  }
  ped.librarySteps={...(ped.librarySteps||{}),...groups};
  ped.groupDifferentiation={
    support:groups.support.map((x,i)=>cloneStep(x,i,'Peneroka')),
    core:groups.core.map((x,i)=>cloneStep(x,i,'Pembina')),
    challenge:groups.challenge.map((x,i)=>cloneStep(x,i,'Pencabar'))
  };
  ped.groupedDifferentiation=false;
  ped.inlineDifferentiation=true;
  ped._exactSessionDocxDifferentiationHydrated=true;
  ped._exactSessionDifferentiationMissing=Object.keys(LEVELS).filter(level=>!existingText(ped,level));
  return ped;
}
function assertComplete(ped){
  hydrate(ped);
  const missing=ped?._exactSessionDifferentiationMissing||[];
  if(isExact(ped)&&missing.length){
    throw new Error(`EXACT_SESSION_DIFFERENTIATION_MISSING:${missing.join(',')}`);
  }
  return ped;
}
function wrapExportContext(){
  const previous=typeof root.generatedRphExportContext==='function'?root.generatedRphExportContext:null;
  if(!previous||previous.__exactDiffExportWrapped)return false;
  const wrapped=function(){
    const out=previous.apply(this,arguments);
    if(out?.pedagogy)hydrate(out.pedagogy);
    return out;
  };
  wrapped.__exactDiffExportWrapped=true;
  root.generatedRphExportContext=wrapped;
  try{generatedRphExportContext=wrapped}catch{}
  return true;
}
function wrapDocx(){
  const previous=typeof root.buildDocxBlob==='function'?root.buildDocxBlob:null;
  if(!previous||previous.__exactDiffExportWrapped)return false;
  const wrapped=async function(ctx){
    if(ctx?.pedagogy)assertComplete(ctx.pedagogy);
    return previous.apply(this,arguments);
  };
  wrapped.__exactDiffExportWrapped=true;
  root.buildDocxBlob=wrapped;
  try{buildDocxBlob=wrapped}catch{}
  return true;
}
function hydrateCurrent(){
  const ped=appState()?.currentGeneratedRph?.pedagogy;
  if(ped)hydrate(ped);
}
function install(){wrapExportContext();wrapDocx();hydrateCurrent()}
install();
if(typeof document!=='undefined'){
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  setTimeout(install,0);
}
root.__RPH_EXACT_SESSION_DIFFERENTIATION_EXPORT__={VERSION,isExact,hydrate,assertComplete};
try{if(typeof module!=='undefined'&&module.exports)module.exports=root.__RPH_EXACT_SESSION_DIFFERENTIATION_EXPORT__}catch{}
root.console?.info?.(`RPH exact-session differentiation export guard active (${VERSION}).`);
})(typeof window!=='undefined'?window:globalThis);
