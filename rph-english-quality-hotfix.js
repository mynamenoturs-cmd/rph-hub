(function(){
  'use strict';
  const norm=v=>String(v||'').replace(/\s+/g,' ').replace(/\s+([,.;:!?])/g,'$1').trim();
  const subjectKey=map=>{try{return typeof window.rphSubjectKey==='function'?window.rphSubjectKey(map?.subject_id):''}catch{return ''}};
  const page=map=>Number(map?.textbook_page_start||0)?`Student's Book p. ${Number(map.textbook_page_start)}`:"Student's Book";
  const bad=v=>{const s=norm(v);return !s||/demonstrate Learning Standard|through .+Student['’]?s Book|observable evidence that matches|Success is achieved when|Learning Standard\s*\d/i.test(s)};
  function cleanTask(v=''){
    return norm(v).replace(/^(?:Student['’]?s Book)\s*(?:p\.?|page)?\s*\d+\s*[:\-–]?\s*/i,'').replace(/^Pupils?\s+/i,'').replace(/^Students?\s+/i,'').replace(/\byour\b/gi,'their').replace(/\byour friends\b/gi,"their friends");
  }
  function taskText(map,built){
    const lines=[];String(map?.source_activities||'').split(/\n+/).forEach(x=>x&&lines.push(cleanTask(x)));(built?.activities||[]).forEach(x=>x&&lines.push(cleanTask(x)));
    return lines.filter(x=>x.length>=6&&x.length<=180).sort((a,b)=>{
      const sa=/^(write|listen|read|say|ask|answer|speak|describe|draw|match|complete|choose|circle|tick|point|tell)\b/i.test(a)?20:0;
      const sb=/^(write|listen|read|say|ask|answer|speak|describe|draw|match|complete|choose|circle|tick|point|tell)\b/i.test(b)?20:0;
      return sb-sa||b.length-a.length;
    })[0]||'';
  }
  function pair(map,task){
    const p=page(map),t=cleanTask(task),h=t.toLowerCase();
    const hasWrite=/\bwrite\b/.test(h),hasListen=/\blisten\b/.test(h),hasRead=/\bread\b/.test(h),hasDraw=/\bdraw\b/.test(h),hasSpeak=/\b(?:say|ask|answer|speak|tell|describe)\b/.test(h);
    if(hasWrite&&hasListen)return{
      objective:`By the end of the lesson, pupils can write a relevant description based on the activity in ${p} and listen to a friend's description attentively.`,
      criteria:`Pupils write at least one relevant sentence based on their picture or source task and respond to at least one detail from a friend's description.`
    };
    if(hasDraw&&hasWrite)return{
      objective:`By the end of the lesson, pupils can complete the picture task in ${p} and write a relevant sentence or short description about it.`,
      criteria:`Pupils complete the picture task and write at least one relevant sentence that matches the picture and the instruction in ${p}.`
    };
    if(hasListen)return{
      objective:`By the end of the lesson, pupils can listen to the text or description in ${p} and identify at least one relevant detail correctly.`,
      criteria:`Pupils identify or respond to at least one detail that can be checked against the listening task in ${p}.`
    };
    if(hasRead)return{
      objective:`By the end of the lesson, pupils can read the material in ${p} and identify at least one relevant piece of information correctly.`,
      criteria:`Pupils give at least one correct answer and point to the word, phrase or sentence in ${p} that supports it.`
    };
    if(hasWrite)return{
      objective:`By the end of the lesson, pupils can complete the writing task in ${p} with at least one relevant and understandable sentence.`,
      criteria:`Pupils write at least one sentence that follows the instruction in ${p} and is understandable in context.`
    };
    if(hasSpeak)return{
      objective:`By the end of the lesson, pupils can give an appropriate spoken response based on the task in ${p}.`,
      criteria:`Pupils give at least one relevant spoken response using information or language from ${p}.`
    };
    return{
      objective:`By the end of the lesson, pupils can complete the task “${t.replace(/[.!?]+$/,'')}” in ${p} accurately.`,
      criteria:`Pupils complete the task in ${p} and produce an answer or response that can be checked directly against the source.`
    };
  }
  const original=window.effectiveRphLessonMap;
  if(typeof original==='function')window.effectiveRphLessonMap=function(map,ev,built){
    const out=original(map,ev,built)||map;if(subjectKey(out)!=='en')return out;const task=taskText(out,built);if(!task)return out;const q=pair(out,task);
    return {...out,objective:bad(out.objective)?q.objective:out.objective,success_criteria:bad(out.success_criteria)?q.criteria:out.success_criteria,_runtime_english_quality_repaired:true};
  };
  window.__RPH_ENGLISH_QUALITY_HOTFIX__={version:'2026-09-04a'};
  console.info('RPH English quality hotfix active.');
})();
