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
window.__RPH_LESSONMAP_LIVE_VERIFY_GATE__={version:'2026-09-06b',fields:FIELD_IDS.slice(),objectiveValidator:'expanded-dskp-verbs-strict-measurable'};
console.info('RPH Lesson Map live verification gate active.');
})();