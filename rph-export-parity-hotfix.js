(function(){
'use strict';

const VERSION='2026-09-06b';
const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
function groupRows(flow=[],level='support'){
  return (flow||[]).map((step,i)=>({key:`export-${level}-${i+1}`,name:step?.name||`Langkah ${i+1}`,text:norm(step?.differentiation?.[level]||''),bbm:step?.bbm||'',pak21:step?.pak21||''})).filter(x=>x.text);
}
function integratedPedagogy(out){
  const ped=out?.pedagogy;if(!ped||!Array.isArray(ped.classroomFlow)||!ped.classroomFlow.length)return out;
  const en=!!out.uiEn;
  const copy={
    ...ped,
    inductionData:ped.inductionData?{...ped.inductionData}:ped.inductionData,
    pbdEvidence:ped.pbdEvidence?{...ped.pbdEvidence}:ped.pbdEvidence,
    sourceSteps:ped.classroomFlow.map((step,i)=>({...step,key:step.key||`classroom-flow-${i+1}`,name:step.name||`${en?'Step':'Langkah'} ${i+1}`,text:step.text||''})),
    librarySteps:{support:groupRows(ped.classroomFlow,'support'),core:groupRows(ped.classroomFlow,'core'),challenge:groupRows(ped.classroomFlow,'challenge')}
  };
  copy.anchor='';copy.diffSupportAct='';copy.diffCoreAct='';copy.diffChallengeAct='';
  copy._exportIntegratedClassroomFlow=true;copy._exportGroupedDifferentiation=true;
  return {...out,pedagogy:copy,_exportPreviewParity:true};
}

const previousExportContext=(typeof window.generatedRphExportContext==='function')?window.generatedRphExportContext:(typeof generatedRphExportContext==='function'?generatedRphExportContext:null);
if(typeof previousExportContext==='function'){
  const wrapped=function(ctx){return integratedPedagogy(previousExportContext.apply(this,arguments));};
  window.generatedRphExportContext=wrapped;try{generatedRphExportContext=wrapped}catch{}
}

const previousSection=(typeof window.rphDocxSection==='function')?window.rphDocxSection:(typeof rphDocxSection==='function'?rphDocxSection:null);
if(typeof previousSection==='function'){
  const wrapped=function(title,uiEn=false){
    const t=String(title||'');
    if(/^D\.\s*(?:AKTIVITI SUMBER DARIPADA BUKU|SOURCE ACTIVITIES FROM THE BOOK)/i.test(t))return previousSection(uiEn?'D. CLASSROOM ACTIVITY FLOW':'D. ALIRAN AKTIVITI PDP',uiEn);
    return previousSection.apply(this,arguments);
  };
  window.rphDocxSection=wrapped;try{rphDocxSection=wrapped}catch{}
}

const previousActivityTable=(typeof window.rphDocxActivityTable==='function')?window.rphDocxActivityTable:(typeof rphDocxActivityTable==='function'?rphDocxActivityTable:null);
if(typeof previousActivityTable==='function'){
  const wrapped=function(steps,fallback,uiEn){if((!Array.isArray(steps)||!steps.length)&&!String(fallback||'').trim())return'';return previousActivityTable.apply(this,arguments)};
  window.rphDocxActivityTable=wrapped;try{rphDocxActivityTable=wrapped}catch{}
}

window.__RPH_EXPORT_PARITY__={version:VERSION,previewEqualsDocxContent:true,driveAndClassroomUseSameDocx:true,integratedFlow:true,groupedDifferentiation:true};
console.info('RPH export parity hotfix active.');
})();
