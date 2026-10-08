(function(root){
'use strict';

const VERSION='2026-10-08e';
const LEVELS={
  support:{ms:'Kelompok Peneroka',en:'Explorer Group',helpMs:'bimbingan berstruktur',helpEn:'structured support'},
  core:{ms:'Kelompok Pembina',en:'Builder Group',helpMs:'bantuan minimum',helpEn:'minimal support'},
  challenge:{ms:'Kelompok Pencabar',en:'Challenger Group',helpMs:'pengayaan',helpEn:'extension'}
};

const norm=v=>String(v??'').replace(/\s+/g,' ').trim();
const cut=(v,n=260)=>{const s=norm(v);return s.length>n?s.slice(0,n-1).trim()+'…':s};
const uniq=items=>[...new Set(items.map(norm).filter(Boolean))];

function taskProfile(map,ped){
  const hay=norm([map?.objective,map?.success_criteria,map?.title,ped?.anchor].join(' ')).toLowerCase();
  if(/membaca|bacaan|petikan|read|reading/.test(hay))return'reading';
  if(/menulis|tulis|catat|ejaan|tanda baca|write|writing/.test(hay))return'writing';
  if(/bertutur|berdialog|bercerita|menyampaikan|lisan|speak|speaking|oral|dialog/.test(hay))return'oral';
  if(/tatabahasa|kata nama|kata kerja|kata adjektif|kata majmuk|ayat tunggal|ayat majmuk|mengenal pasti|mengelaskan|grammar|identify|classify/.test(hay))return'grammar';
  if(/sains|memerhati|mengelas|mengukur|meramal|eksperimen|uji|science|observe|measure|predict/.test(hay))return'science';
  if(/menghasilkan|membina|mencipta|membuat|produce|create|build|make/.test(hay))return'product';
  return'general';
}
function materials(ped,level,steps){
  const fromSteps=(steps||[]).flatMap(x=>String(x?.bbm||'').split(/[;|\n]/));
  const fromGroup=String(ped?.groupBbm?.[level]||'').split(/[;|\n]/);
  return uniq([...fromGroup,...fromSteps]).slice(0,6).join('; ');
}
function existingSteps(steps){
  return (steps||[]).map(x=>cut(x?.text||x?.rawText||'',260)).filter(Boolean).slice(0,3);
}
function teacherGuidance(map,ped,level,uiEn){
  const task=cut(ped?.anchor||map?.title||'',180),page=norm(ped?.page||''),sp=norm(ped?.mainSp||map?.source_evidence?.meta?.main_sp||String(map?.sp||'').split(',')[0]);
  if(uiEn){
    if(level==='support')return `Teacher models one example from ${page||'the verified source'}, highlights the evidence needed for “${task}”, then releases pupils one step at a time.`;
    if(level==='core')return `Teacher clarifies the success criterion for SP ${sp||'the lesson'}, then monitors while pupils complete “${task}” with minimal prompts.`;
    return `Teacher sets the extension boundary so pupils remain on SP ${sp||'the same Learning Standard'}, asks for evidence, and avoids giving the answer directly.`;
  }
  if(level==='support')return `Guru memodelkan satu contoh daripada ${page||'sumber yang disahkan'}, menandakan bukti yang diperlukan untuk tugasan “${task}”, kemudian melepaskan murid mengikut langkah kecil.`;
  if(level==='core')return `Guru menjelaskan kriteria kejayaan bagi SP ${sp||'sesi ini'}, kemudian memantau semasa murid melaksanakan tugasan “${task}” dengan petunjuk minimum.`;
  return `Guru menetapkan had pengayaan supaya murid kekal pada SP ${sp||'yang sama'}, meminta bukti daripada sumber dan tidak memberikan jawapan secara langsung.`;
}
function productText(map,ped,level,uiEn){
  const p=taskProfile(map,ped),topic=norm(map?.title||ped?.topic||'tugasan'),page=norm(ped?.page||'');
  const ms={
    reading:`Jawapan individu yang menyatakan maklumat utama serta sekurang-kurangnya satu bukti daripada ${page||'bahan sumber'}.`,
    writing:`Hasil penulisan individu berkaitan “${topic}” yang telah disemak dari segi isi, ejaan dan tanda baca.`,
    oral:`Respons lisan individu berkaitan “${topic}” yang boleh diperhatikan dan direkod oleh guru.`,
    grammar:`Set jawapan/pengelasan individu yang menunjukkan penggunaan unsur bahasa sasaran dalam konteks “${topic}”.`,
    science:`Rekod pemerhatian/data individu serta satu rumusan yang disokong oleh bukti tugasan.`,
    product:`Hasil individu “${topic}” yang siap, boleh diperiksa dan disertai penerangan ringkas tentang proses/hasil.`,
    general:`Hasil individu yang boleh disemak terus terhadap tugasan sumber dan kriteria kejayaan.`
  };
  const en={
    reading:`An individual response stating the key information and at least one piece of evidence from ${page||'the source'}.`,
    writing:`An individual written product for “${topic}” checked for content, spelling and punctuation.`,
    oral:`An individual oral response for “${topic}” that the teacher can observe and record.`,
    grammar:`An individual answer/classification set showing the target language item in the “${topic}” context.`,
    science:`An individual observation/data record plus one evidence-based conclusion.`,
    product:`A completed individual “${topic}” product with a short explanation of process/outcome.`,
    general:`An individual outcome that can be checked directly against the source task and success criterion.`
  };
  let base=(uiEn?en:ms)[p]||(uiEn?en.general:ms.general);
  if(level==='support')base+=(uiEn?' Scaffolds used are recorded.':' Sokongan yang digunakan direkod.');
  if(level==='challenge')base+=(uiEn?' The extension includes an explanation of evidence/reasoning.':' Pengayaan disertai penjelasan bukti/penaakulan.');
  return base;
}
function followUp(map,ped,level,uiEn){
  const p=taskProfile(map,ped),page=norm(ped?.page||''),topic=norm(map?.title||ped?.topic||'tugasan'),sp=norm(ped?.mainSp||map?.source_evidence?.meta?.main_sp||String(map?.sp||'').split(',')[0]);
  if(uiEn){
    if(level==='support'){
      if(p==='reading')return `If the criterion is not met, reread one short part of ${page||'the same source'} with highlighted evidence, then answer one item without the highlight.`;
      if(p==='writing')return `If the criterion is not met, correct one sentence from “${topic}” with a checklist, then rewrite it independently.`;
      if(p==='oral')return `If the criterion is not met, rehearse one response with a cue card, then repeat it without the cue.`;
      return `If the criterion is not met, repeat one item from the same source with one scaffold, then retry without the scaffold.`;
    }
    if(level==='core')return `After checking the core task, pupils correct one inaccurate part and complete one fresh item from the same source with minimal help.`;
    return `When the criterion is met, pupils create one new example/question still aligned to SP ${sp||'the same standard'} and justify it using source evidence.`;
  }
  if(level==='support'){
    if(p==='reading')return `Jika kriteria belum dicapai, murid membaca semula satu bahagian pendek ${page||'sumber yang sama'} dengan bukti ditandakan, kemudian menjawab satu item tanpa tanda bantuan.`;
    if(p==='writing')return `Jika kriteria belum dicapai, murid membetulkan satu ayat berkaitan “${topic}” menggunakan senarai semak, kemudian menulis semula secara kendiri.`;
    if(p==='oral')return `Jika kriteria belum dicapai, murid melatih satu respons menggunakan kad petunjuk, kemudian mengulang respons tanpa kad.`;
    return `Jika kriteria belum dicapai, murid mengulang satu item daripada sumber yang sama dengan satu bentuk sokongan, kemudian mencuba semula tanpa sokongan itu.`;
  }
  if(level==='core')return `Selepas semakan tugasan teras, murid membetulkan satu bahagian yang tidak tepat dan melaksanakan satu item baharu daripada sumber yang sama dengan bantuan minimum.`;
  return `Apabila kriteria dicapai, murid membina satu contoh/soalan baharu yang masih selari dengan SP ${sp||'yang sama'} dan menjelaskan jawapan menggunakan bukti daripada sumber.`;
}
function supportDescription(level,uiEn){
  if(uiEn)return level==='support'?'Structured access to the same source task with reduced load and visible cues.':level==='core'?'The full source task with minimal teacher support and peer checking.':'The full source task plus an evidence-based extension without changing the Learning Standard.';
  return level==='support'?'Akses berstruktur kepada tugasan sumber yang sama dengan beban dikurangkan dan petunjuk yang jelas.':level==='core'?'Tugasan sumber penuh dengan bantuan minimum guru serta semakan pasangan.':'Tugasan sumber penuh diikuti pengayaan berasaskan bukti tanpa mengubah Standard Pembelajaran.';
}
function laneText(map,ped,level,steps,uiEn){
  const labels=uiEn
    ?{support:'Support description',task:'Task',materials:'Materials',teacher:'Teacher guidance',pupils:'Pupil steps',product:'Individual product',criterion:'Criterion',follow:'Follow-up'}
    :{support:'Penerangan sokongan',task:'Tugasan',materials:'Bahan',teacher:'Bimbingan guru',pupils:'Langkah murid',product:'Hasil individu',criterion:'Kriteria',follow:'Susulan'};
  const task=norm(ped?.anchor||map?.title||'');
  const pupils=existingSteps(steps);
  const pupilText=pupils.length?pupils.map((x,i)=>`${i+1}. ${x}`).join(' '):(uiEn?`Complete the verified source task “${task}”.`:`Laksanakan tugasan sumber yang disahkan “${task}”.`);
  const criterion=norm(ped?.pbdEvidence?.criterion||map?.success_criteria||'—');
  return [
    `${labels.support}: ${supportDescription(level,uiEn)}`,
    `${labels.task}: ${task||'—'}`,
    `${labels.materials}: ${materials(ped,level,steps)||'—'}`,
    `${labels.teacher}: ${teacherGuidance(map,ped,level,uiEn)}`,
    `${labels.pupils}: ${pupilText}`,
    `${labels.product}: ${productText(map,ped,level,uiEn)}`,
    `${labels.criterion}: ${criterion}`,
    `${labels.follow}: ${followUp(map,ped,level,uiEn)}`
  ].join('\n');
}
function structurePedagogy(map,ped,uiEn=false){
  if(!ped||ped.approvedContentLocked||ped.exactSessionLibrary)return ped;
  const groups={};
  for(const level of ['support','core','challenge']){
    const old=Array.isArray(ped?.librarySteps?.[level])?ped.librarySteps[level]:[];
    const variation=old.find(x=>x?.key&&!String(x.key).startsWith('source-'))||null;
    const meta=LEVELS[level];
    groups[level]=[{
      key:variation?.key||`source-production-v2-${level}`,
      name:uiEn?meta.en:meta.ms,
      text:laneText(map,ped,level,old,uiEn),
      bbm:materials(ped,level,old),
      pak21:norm(variation?.pak21||ped?.method||''),
      phase:variation?.phase||'production-v2',
      activity_type:variation?.activity_type||null,
      libraryDriven:!!variation,
      libraryActivityKey:variation?.libraryActivityKey||variation?.key||null,
      productionV2:true
    }];
  }
  return {
    ...ped,
    librarySteps:groups,
    diffSupport:groups.support[0].text,
    diffCore:groups.core[0].text,
    diffChallenge:groups.challenge[0].text,
    diffSupportAct:groups.support[0].text,
    diffCoreAct:groups.core[0].text,
    diffChallengeAct:groups.challenge[0].text,
    productionRphVersion:VERSION
  };
}

const previous=typeof root.buildSourceAwarePedagogy==='function'?root.buildSourceAwarePedagogy:null;
if(previous){
  const wrapped=function(map,activities,btRef,uiEn,classId=null){
    return structurePedagogy(map,previous.apply(this,arguments),uiEn);
  };
  wrapped.__productionV2Wrapped=true;
  root.buildSourceAwarePedagogy=wrapped;
  try{buildSourceAwarePedagogy=wrapped}catch{}
}

root.__RPH_PRODUCTION_V2_STRUCTURE__={VERSION,structurePedagogy,laneText,followUp,productText};
try{if(typeof module!=='undefined'&&module.exports)module.exports=root.__RPH_PRODUCTION_V2_STRUCTURE__}catch{}
root.console?.info?.(`RPH production v2 structure active (${VERSION}).`);
})(typeof window!=='undefined'?window:globalThis);
