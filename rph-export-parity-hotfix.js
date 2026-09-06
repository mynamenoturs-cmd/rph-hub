(function(){
'use strict';

const VERSION='2026-09-06a';
const norm=v=>String(v||'').replace(/\s+/g,' ').trim();

function diffText(d,en=false){
  if(!d)return'';
  return en
    ? `Differentiated learning in this activity\nSupport: ${norm(d.support)}\nCore: ${norm(d.core)}\nChallenge: ${norm(d.challenge)}`
    : `PdP Terbeza dalam aktiviti ini\nSokongan: ${norm(d.support)}\nTeras: ${norm(d.core)}\nPengayaan: ${norm(d.challenge)}`;
}
function appendOnce(base,extra){
  const a=String(base||'').trim(),b=String(extra||'').trim();
  if(!b)return a;
  if(a.includes(b))return a;
  return [a,b].filter(Boolean).join('\n\n');
}
function integratedPedagogy(out){
  const ped=out?.pedagogy;if(!ped||!Array.isArray(ped.classroomFlow)||!ped.classroomFlow.length)return out;
  const en=!!out.uiEn;
  const copy={
    ...ped,
    inductionData:ped.inductionData?{...ped.inductionData}:ped.inductionData,
    pbdEvidence:ped.pbdEvidence?{...ped.pbdEvidence}:ped.pbdEvidence,
    librarySteps:{support:[],core:[],challenge:[]}
  };
  if(copy.inductionData&&ped.inductionDifferentiation){
    copy.inductionData.text=appendOnce(copy.inductionData.text,diffText(ped.inductionDifferentiation,en));
    copy.setInduksi=copy.inductionData.text;
  }
  copy.sourceSteps=ped.classroomFlow.map((step,i)=>({
    ...step,
    key:step.key||`classroom-flow-${i+1}`,
    name:step.name||`${en?'Step':'Langkah'} ${i+1}`,
    text:appendOnce(step.text,diffText(step.differentiation,en))
  }));
  copy.anchor='';
  copy.diffSupportAct='';
  copy.diffCoreAct='';
  copy.diffChallengeAct='';
  if(ped.closureDifferentiation){
    copy.penutup=appendOnce(ped.penutup,diffText(ped.closureDifferentiation,en));
  }
  copy._exportIntegratedClassroomFlow=true;
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
    if(/^E\.\s*(?:PDP TERBEZA|DIFFERENTIATED TEACHING AND LEARNING)/i.test(t))return'';
    if(/^D\.\s*(?:AKTIVITI SUMBER DARIPADA BUKU|SOURCE ACTIVITIES FROM THE BOOK)/i.test(t)){
      return previousSection(uiEn?'D. CLASSROOM ACTIVITY FLOW':'D. ALIRAN AKTIVITI PDP',uiEn);
    }
    if(/^F\.\s*CLASSROOM ASSESSMENT/i.test(t))return previousSection('E. CLASSROOM ASSESSMENT (PBD)',uiEn);
    if(/^F\.\s*PENTAKSIRAN BILIK DARJAH/i.test(t))return previousSection('E. PENTAKSIRAN BILIK DARJAH (PBD)',uiEn);
    if(/^G\.\s*CLOSURE AND REFLECTION/i.test(t))return previousSection('F. CLOSURE AND REFLECTION',uiEn);
    if(/^G\.\s*PENUTUP DAN REFLEKSI/i.test(t))return previousSection('F. PENUTUP DAN REFLEKSI',uiEn);
    return previousSection.apply(this,arguments);
  };
  window.rphDocxSection=wrapped;try{rphDocxSection=wrapped}catch{}
}

const previousTable=(typeof window.rphDocxTable==='function')?window.rphDocxTable:(typeof rphDocxTable==='function'?rphDocxTable:null);
if(typeof previousTable==='function'){
  const wrapped=function(rows,widths){
    const joined=Array.isArray(rows)?rows.join(''):String(rows||'');
    if(/Kelompok Peneroka|Kelompok Pembina|Kelompok Pencabar|Explorer Group|Builder Group|Challenger Group/i.test(joined))return'';
    return previousTable.apply(this,arguments);
  };
  window.rphDocxTable=wrapped;try{rphDocxTable=wrapped}catch{}
}

const previousActivityTable=(typeof window.rphDocxActivityTable==='function')?window.rphDocxActivityTable:(typeof rphDocxActivityTable==='function'?rphDocxActivityTable:null);
if(typeof previousActivityTable==='function'){
  const wrapped=function(steps,fallback,uiEn){
    if((!Array.isArray(steps)||!steps.length)&&!String(fallback||'').trim())return'';
    return previousActivityTable.apply(this,arguments);
  };
  window.rphDocxActivityTable=wrapped;try{rphDocxActivityTable=wrapped}catch{}
}

window.__RPH_EXPORT_PARITY__={version:VERSION,previewEqualsDocxContent:true,driveAndClassroomUseSameDocx:true,integratedFlow:true,inlineDifferentiation:true};
console.info('RPH export parity hotfix active.');
})();
