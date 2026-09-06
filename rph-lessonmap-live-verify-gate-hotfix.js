(function(){
'use strict';
const FIELD_IDS=['mapTitle','mapSk','mapSp','mapMainSp','mapComplementarySp','mapObjective','mapCriteria','mapBtStart','mapBtEnd','mapBaPage','mapActivities'];

// The canonical validator was too narrow: valid DSKP verbs such as
// "memerihalkan" were not recognised as observable actions, so a genuinely
// measurable objective could still show as ✕. Keep the anti-generic rules and
// measurement requirement, but recognise a broader official action-verb set.
const OBJECTIVE_BANNED=/(?:menunjukkan\s+penguasaan\s+SP|evidens\s+yang\s+selaras\s+dengan\s+SP|demonstrate\s+Learning\s+Standard|observable\s+evidence\s+that\s+matches|mengikut\s+objektif|according\s+to\s+the\s+objective|kehendak\s+tugasan|respons\s+tepat\s+yang\s+boleh\s+disemak|tugasan\s+[“"]?sumber[”"]?|the\s+(?:source|listening|reading|writing|learning)\s+task)/i;
const OBJECTIVE_OBSERVABLE=/(?:menyatakan|menyenaraikan|memberikan|mengenal\s*pasti|mengelaskan|membanding(?:kan)?|memerhati|mengukur|merekod|melabel|melukis|membina|menghasilkan|menjelaskan|memerihalkan|menerangkan|menghuraikan|menamakan|memilih|menggunakan|menunjukkan|melaksanakan|mendemonstrasikan|mencipta|menghubungkaitkan|menulis|membaca|memadankan|menentukan|menyusun|mengitlak|menyelesaikan|melengkapkan|menyampaikan|menyanyikan|menyebut|melafazkan|menceritakan|mengikuti|menjawab|respons|identify|classify|compare|observe|measure|record|label|draw|build|produce|explain|describe|state|list|name|choose|select|use|show|demonstrate|create|write|read|spell|reproduce|complete|respond|response|give|locate|point|follow|answer)/i;
const OBJECTIVE_MEASURABLE=/(?:sekurang-kurangnya|\b(?:satu|dua|tiga|empat|lima|enam)\b|dengan\s+tepat|\b(?:tepat|betul|sesuai|relevan|tersusun|berfungsi)\b|\b\d+\b|at\s+least|accurately|correct(?:ly)?|appropriate(?:ly)?|relevant|intelligibly|successfully|\b(?:one|two|three|four|five|six)\b)/i;
function improvedLogicalObjectiveText(text=''){
  const s=String(text||'').trim();
  if(s.length<28||OBJECTIVE_BANNED.test(s))return false;
  return OBJECTIVE_OBSERVABLE.test(s)&&OBJECTIVE_MEASURABLE.test(s);
}
try{window.isLogicalObjectiveText=improvedLogicalObjectiveText;if(typeof isLogicalObjectiveText!=='undefined')isLogicalObjectiveText=improvedLogicalObjectiveText}catch{window.isLogicalObjectiveText=improvedLogicalObjectiveText}

// Science textbook OCR repair.
// The stored Year 3 Science PDF was OCR'd with the English engine, so Malay
// questions can be split across lines and mixed with diagram glyphs. Rebuild
// only complete question blocks from the exact matched page; never invent the
// missing tail of a broken OCR fragment.
const QUESTION_START=/^(?:Apakah|Bagaimanakah|Mengapakah|Bolehkah|Adakah|Di\s+manakah)\b/i;
const QUESTION_FOLLOW=/^(?:Yang\s+manakah|Mengapa\b|Bagaimana\b|Lebih\b|Adakah\b)/i;
function cleanScienceOcrLine(raw=''){
  let s=String(raw||'').trim();
  if(!s)return '';
  const cut=s.search(/[|\\=<>]/);
  if(cut>=0){s=s.slice(0,cut).trim().replace(/\b[A-Za-z]{1,2}\s*$/,'').trim()}
  s=s.replace(/[^A-Za-zÀ-ž0-9\s?!,.'’():;\/-]+/g,' ').replace(/\s+/g,' ').trim();
  s=s.replace(/\?\s*[A-Za-z0-9]{1,2}$/,'?').replace(/\s+([?.,;:])/g,'$1');
  return s;
}
function reconstructScienceQuestionTasks(text='',limit=4){
  const lines=String(text||'').replace(/\r/g,'').split(/\n+/).map(cleanScienceOcrLine).filter(Boolean),out=[];
  for(let i=0;i<lines.length&&out.length<limit;i++){
    if(!QUESTION_START.test(lines[i]))continue;
    const parts=[lines[i]];let j=i+1;
    while(j<lines.length&&parts.join(' ').length<360){
      const joined=parts.join(' '),next=lines[j];
      if(QUESTION_START.test(next))break;
      if(joined.includes('?')&&!QUESTION_FOLLOW.test(next))break;
      if(!/[A-Za-zÀ-ž]{2,}/.test(next)){j++;continue}
      parts.push(next);j++;
      if((parts.join(' ').match(/\?/g)||[]).length>=3)break;
    }
    let q=parts.join(' ').replace(/\s+/g,' ').replace(/\s+([?.,;:])/g,'$1').trim();
    if(!q.includes('?'))continue;
    q=q.replace(/\b[A-Za-z]\b(?=\s+[A-Za-zÀ-ž])/g,'').replace(/\s+/g,' ').trim();
    if(q.length<18||q.length>360)continue;
    out.push(`Murid menjawab soalan sumber: ${q}`);i=Math.max(i,j-1);
  }
  return [...new Set(out)].slice(0,limit);
}
function scienceMap(map){
  try{return typeof rphSubjectKey==='function'&&rphSubjectKey(map?.subject_id)==='science'}catch{return false}
}
function brokenScienceTask(s=''){
  const t=String(s||'');
  return /\\\s*\d|[|]/.test(t)||/\?\s*[A-Za-z0-9]{1,2}(?:\s|$)/.test(t)||/\b(?:dari|yang|dan|atau|dengan|tanpa|kepada|pada)\s*[”"']?$/i.test(t);
}
try{
  const prevTruncated=window.isTruncatedSourceActivity;
  if(typeof prevTruncated==='function'){
    const stricter=function(s=''){const t=String(s||'').trim();return prevTruncated(s)||/\b(?:dari|tanpa)\s*[.,;:]?$/i.test(t)||/\?\s*[A-Za-z0-9]{1,2}\s*$/i.test(t)};
    window.isTruncatedSourceActivity=stricter;
    try{isTruncatedSourceActivity=stricter}catch{}
  }
  const prevScienceQuestions=window.scienceSourceQuestionTasks;
  if(typeof prevScienceQuestions==='function'){
    const repaired=function(text='',limit=3){const q=reconstructScienceQuestionTasks(text,limit);return q.length?q:prevScienceQuestions(text,limit)};
    window.scienceSourceQuestionTasks=repaired;
    try{scienceSourceQuestionTasks=repaired}catch{}
  }
  const prevBuild=window.buildSourceActivities;
  if(typeof prevBuild==='function'){
    const repairedBuild=function(map,ev,classId){
      const base=prevBuild(map,ev,classId);
      if(!scienceMap(map)||!Array.isArray(ev?.bt)||!ev.bt.length)return base;
      const fresh=[];
      for(const p of ev.bt){
        const pg=p.printed_page||p.page_no;
        for(const q of reconstructScienceQuestionTasks(p.content||'',4))fresh.push(`BT m/s ${pg}: ${q}`);
      }
      const unique=[...new Set(fresh)];
      const old=Array.isArray(base?.activities)?base.activities:[];
      if(!unique.length||(!old.some(brokenScienceTask)&&old.length))return base;
      return {...base,activities:unique.slice(0,6),exactTextbookCount:Math.max(Number(base?.exactTextbookCount||0),unique.length),_runtime_science_ocr_question_reconstructed:true};
    };
    window.buildSourceActivities=repairedBuild;
    try{buildSourceActivities=repairedBuild}catch{}
  }
}catch(err){console.warn('Science OCR question repair:',err)}

function blockerList(p){
  const ev=p?.source_evidence||p?.evidence||{},meta=ev?.meta||{},out=[];
  let disposition={blocked:false,reason:''};
  try{if(typeof lessonMapWeekDisposition==='function')disposition=lessonMapWeekDisposition(p)||disposition}catch{}
  if(disposition.blocked)out.push(disposition.reason||'Minggu bukan PdP biasa');
  if(Number(p?.confidence_score||0)<85)out.push('Skor sumber di bawah 85%');
  if(!p?.week_exact)out.push('Minggu RPT belum tepat');
  if(!meta.session_exact)out.push('Sesi belum dipadankan tepat');
  if(!p?.sp_crosscheck)out.push('SK/SP belum selesai cross-check');
  if(!ev?.textbook)out.push('Buku Teks belum disahkan engine');
  const base=(typeof state!=='undefined'&&state.lessonCandidate)||{};
  const pageOk=Boolean(meta.page_route_verified||base?.printed_page_mapping?.textbook?.verified);
  if(!pageOk)out.push('Muka surat tepat belum disahkan');
  try{if(typeof suspiciousTitle==='function'&&suspiciousTitle(p?.title||''))out.push('Tajuk perlu semakan')}catch{}
  const allSp=String(p?.sp||'').split(',').map(x=>x.trim()).filter(Boolean),mainSp=String(meta.main_sp||'').trim();
  try{if(!(typeof validSpCode==='function'&&validSpCode(mainSp)&&allSp.includes(mainSp)))out.push('SP Utama belum sah')}catch{if(!mainSp||!allSp.includes(mainSp))out.push('SP Utama belum sah')}
  try{if(!(typeof isLogicalObjectiveText==='function'&&isLogicalObjectiveText(p?.objective)&&isLogicalObjectiveText(p?.success_criteria)))out.push('Objektif/Kriteria belum boleh ukur')}catch{}
  if(String(p?.source_activities||'').trim().length<=12)out.push('Aktiviti sumber belum lengkap');
  if(meta.week_coverage_enforced&&!meta.week_source_complete)out.push(`Liputan minggu belum lengkap ${meta.week_source_complete_count||0}/${meta.week_expected_sessions||0}`);
  return [...new Set(out)];
}
function annotate(p){
  const gate=document.querySelector('#mapAccuracyGate');if(!gate)return;
  let note=document.querySelector('#mapVerifyLiveNote');
  if(!note){note=document.createElement('div');note.id='mapVerifyLiveNote';note.className='field-note';gate.appendChild(note)}
  const blockers=blockerList(p);
  note.textContent=blockers.length?`Belum boleh disahkan: ${blockers.join(' • ')}`:'✓ Semua syarat pengesahan lengkap. Butang Sahkan Lesson Map aktif.';
}
function refresh(){
  try{
    if(typeof state==='undefined'||!state.lessonCandidate||typeof formLessonPayload!=='function'||typeof renderMapGate!=='function')return;
    const p=formLessonPayload('draft');
    const base=state.lessonCandidate||{};
    p.printed_page_mapping=base.printed_page_mapping||p.printed_page_mapping;
    p.weeklySourceComplete=p.source_evidence?.meta?.week_source_complete;
    renderMapGate(p,false);
    annotate(p);
  }catch(err){console.warn('Lesson Map live verify gate:',err)}
}
function bind(){
  FIELD_IDS.forEach(id=>{const el=document.getElementById(id);if(!el||el.dataset.liveVerifyGate==='1')return;el.dataset.liveVerifyGate='1';el.addEventListener('input',refresh);el.addEventListener('change',refresh)});
  const btn=document.getElementById('buildLessonCandidate');if(btn&&!btn.dataset.liveVerifyGate){btn.dataset.liveVerifyGate='1';btn.addEventListener('click',()=>setTimeout(refresh,0))}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{bind();setTimeout(refresh,0)});else{bind();setTimeout(refresh,0)}
window.__RPH_LESSONMAP_LIVE_VERIFY_GATE__={version:'2026-09-06c',fields:FIELD_IDS.slice(),objectiveValidator:'expanded-dskp-verbs-strict-measurable',scienceOcrQuestionRepair:true};
console.info('RPH Lesson Map live verification gate active.');
})();