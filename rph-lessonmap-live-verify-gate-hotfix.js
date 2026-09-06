(function(){
'use strict';
const FIELD_IDS=['mapTitle','mapSk','mapSp','mapMainSp','mapComplementarySp','mapObjective','mapCriteria','mapBtStart','mapBtEnd','mapBaPage','mapActivities'];
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
window.__RPH_LESSONMAP_LIVE_VERIFY_GATE__={version:'2026-09-06a',fields:FIELD_IDS.slice()};
console.info('RPH Lesson Map live verification gate active.');
})();