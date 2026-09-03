(function(){
  'use strict';

  const SOURCE_OK='source_consistent_2026_rpt';
  const CALENDAR_REVIEW='calendar_source_review_required';

  function currentPayload(){
    try{
      return typeof window.formLessonPayload==='function'?window.formLessonPayload('draft'):null;
    }catch(error){
      console.warn('Lesson Map review payload:',error);
      return null;
    }
  }

  function revalidationStatus(map){
    return String(map?.source_evidence?.meta?.revalidation_status||'');
  }

  function logical(text){
    return typeof window.isLogicalObjectiveText==='function'
      ? window.isLogicalObjectiveText(text)
      : String(text||'').trim().length>=12;
  }

  function appendReviewNotice(message,kind='ok'){
    const gate=document.querySelector('#mapAccuracyGate');
    if(!gate||gate.querySelector('[data-review-hotfix]'))return;
    const note=document.createElement('div');
    note.dataset.reviewHotfix='1';
    note.className=kind==='warn'?'source-selection-note':'field-note';
    note.style.marginTop='10px';
    note.textContent=message;
    gate.appendChild(note);
  }

  function renderCurrentGate(map){
    if(typeof window.renderMapGate!=='function')return;
    const refreshed=currentPayload();
    if(!refreshed)return;
    refreshed.source_evidence=map.source_evidence||refreshed.source_evidence||{};
    refreshed.week_exact=map.week_exact;
    refreshed.sp_crosscheck=map.sp_crosscheck;
    refreshed.verification_status=map.verification_status||'needs_review';
    window.renderMapGate(refreshed,false);
  }

  async function hydrateSourceConsistentReview(){
    const map=currentPayload();
    if(!map)return;
    const status=revalidationStatus(map);

    if(status===CALENDAR_REVIEW){
      const verify=document.querySelector('#verifyLessonMap');
      if(verify){
        verify.disabled=true;
        verify.title='Sumber kalender/RPT English perlu disahkan dahulu sebelum Lesson Map boleh disahkan.';
      }
      appendReviewNotice('⚠ English: sumber RPT/calendar masih perlu semakan. Lesson Map tidak akan auto-disahkan atau diubah.','warn');
      return;
    }

    if(status!==SOURCE_OK)return;

    const objective=document.querySelector('#mapObjective');
    const criteria=document.querySelector('#mapCriteria');
    const activities=document.querySelector('#mapActivities');
    if(!objective||!criteria)return;

    if(logical(objective.value)&&logical(criteria.value)){
      renderCurrentGate(map);
      appendReviewNotice('Sumber 2026 telah disemak semula. Semak butiran dan tekan Sahkan Lesson Map jika semuanya tepat.');
      return;
    }

    if(typeof window.lessonPageEvidence!=='function'||
       typeof window.buildSourceActivities!=='function'||
       typeof window.effectiveRphLessonMap!=='function'){
      appendReviewNotice('Sumber konsisten, tetapi pembina Objektif/Kriteria belum tersedia pada sesi aplikasi ini.','warn');
      return;
    }

    try{
      const ev=await window.lessonPageEvidence(map);
      const built=window.buildSourceActivities(map,ev,'lesson-map-review')||{};
      const repaired=window.effectiveRphLessonMap(map,ev,built)||map;
      let changed=false;

      if(!logical(objective.value)&&logical(repaired.objective)){
        objective.value=repaired.objective;
        changed=true;
      }
      if(!logical(criteria.value)&&logical(repaired.success_criteria)){
        criteria.value=repaired.success_criteria;
        changed=true;
      }
      if(activities&&!String(activities.value||'').trim()&&String(repaired.source_activities||'').trim()){
        activities.value=repaired.source_activities;
        changed=true;
      }

      renderCurrentGate(map);
      appendReviewNotice(changed
        ? '✓ Objektif dan Kriteria Kejayaan dicadangkan semula daripada SP + aktiviti Buku Teks. Semak seperti guru sebenar sebelum tekan Sahkan.'
        : 'Sumber 2026 konsisten. Semak Objektif, Kriteria Kejayaan dan aktiviti sebelum pengesahan.');

      if(changed&&typeof window.toast==='function'){
        window.toast('Objektif/Kriteria telah dibina semula daripada sumber. Semak dahulu sebelum Sahkan.',5000);
      }
    }catch(error){
      console.warn('Lesson Map source-consistent review hydration:',error);
      appendReviewNotice('Sumber konsisten tetapi Objektif/Kriteria tidak dapat dibina automatik. Tekan Analisis Sumber untuk bina semula tanpa mengubah mapping.','warn');
    }
  }

  // Original table handler opens the saved map first. Run this after bubbling so
  // the existing Lesson Map fields are already on screen before we hydrate them.
  document.addEventListener('click',event=>{
    const button=event.target?.closest?.('.open-map');
    if(!button)return;
    setTimeout(()=>hydrateSourceConsistentReview(),0);
  });

  // Hard guard for English maps whose current RPT/calendar source is still under review.
  // Capture phase prevents the original verify handler from running accidentally.
  document.addEventListener('click',event=>{
    const button=event.target?.closest?.('#verifyLessonMap');
    if(!button)return;
    const map=currentPayload();
    if(revalidationStatus(map)!==CALENDAR_REVIEW)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    button.disabled=true;
    if(typeof window.toast==='function'){
      window.toast('English belum boleh disahkan: semak dahulu RPT/calendar yang dipaut untuk sesi ini.',6000);
    }
  },true);

  window.__LESSONMAP_REVIEW_HOTFIX__={version:'2026-09-04a',hydrate:hydrateSourceConsistentReview};
  console.info('Lesson Map teacher-review hotfix active.');
})();
