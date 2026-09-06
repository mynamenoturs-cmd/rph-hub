(function(){
'use strict';
const isRevisionWeek=f=>{
  try{
    const subject=window.rphSubjectKey?.(f?.subject_id)||'';
    return subject==='science'&&Number(f?.year)===3&&Number(f?.academic_year)===2026&&Number(f?.week_no)===38;
  }catch{return false}
};
const revisionMessage='Minggu 38 ialah REVISION dalam RPT Sains Tahun 3. Generate_Flag kekal CONDITIONAL dan Mapping tidak menetapkan SK/SP atau halaman Buku Teks khusus. Jangan bina Lesson Map biasa secara automatik. Jika RPH ulang kaji diperlukan, pilih hanya kandungan yang telah diajar dan semak secara manual; jangan cipta SP atau page anchor baharu.';
function renderRevisionCoverage(){
  const box=document.querySelector('#mapWeekCoverage');
  if(!box)return;
  box.innerHTML='<div class="week-coverage-head"><div><div class="eyebrow">LIPUTAN SUMBER MINGGUAN</div><h3>Minggu 38: Revision</h3><p>RPT menetapkan minggu ulang kaji tanpa SK/SP dan tanpa anchor Buku Teks khusus.</p></div><span class="pill demo">CONDITIONAL</span></div><div class="week-coverage-warning">⚠ '+revisionMessage+'</div>';
}
const prevRender=window.renderWeekCoverage;
if(typeof prevRender==='function')window.renderWeekCoverage=function(cov,f){
  const filter=f||window.currentMapFilter?.();
  if(isRevisionWeek(filter)){renderRevisionCoverage();return}
  return prevRender.apply(this,arguments);
};
function blockNormalRevisionAnalysis(e){
  const target=e.target?.closest?.('#buildLessonCandidate');
  if(!target)return;
  const f=window.currentMapFilter?.();
  if(!isRevisionWeek(f))return;
  e.preventDefault();
  e.stopImmediatePropagation();
  if(window.state)window.state.lessonCandidate=null;
  const evidence=document.querySelector('#mapEvidence');
  if(evidence)evidence.innerHTML='<div class="evidence-card miss"><div><b>REVISION / CONDITIONAL • Minggu 38</b></div><p>'+revisionMessage+'</p></div>';
  try{window.renderMapGate?.(null,false)}catch{}
  renderRevisionCoverage();
  try{window.toast?.('Minggu 38 ialah Revision (CONDITIONAL). Tiada Lesson Map biasa dijana secara automatik.',6500)}catch{}
}
document.addEventListener('click',blockNormalRevisionAnalysis,true);
function refreshIfRevision(){
  try{if(isRevisionWeek(window.currentMapFilter?.()))renderRevisionCoverage()}catch{}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refreshIfRevision,{once:true});else refreshIfRevision();
window.__RPH_SCIENCE_YEAR3_REVISION_GATE__={version:'2026-09-06a',week:38,generateFlag:'CONDITIONAL',autoLessonMap:false};
console.info('RPH Science Year 3 Week 38 revision gate active.');
})();
