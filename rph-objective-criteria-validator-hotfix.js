(function(){
'use strict';
const BANNED=/(?:menunjukkan\s+penguasaan\s+SP|evidens\s+yang\s+selaras\s+dengan\s+SP|demonstrate\s+Learning\s+Standard|observable\s+evidence\s+that\s+matches|mengikut\s+objektif|according\s+to\s+the\s+objective|kehendak\s+tugasan|respons\s+tepat\s+yang\s+boleh\s+disemak|tugasan\s+[“"]?sumber[”"]?|the\s+(?:source|listening|reading|writing|learning)\s+task)/i;
const OBSERVABLE=/(?:menyatakan|menyenaraikan|memberikan|mengenal\s*pasti|mengelaskan|membanding(?:kan)?|memerhati|mengukur|merekod|melabel|melukis|membina|menghasilkan|menjelaskan|memerihalkan|menerangkan|menghuraikan|menamakan|memilih|menggunakan|menunjukkan|melaksanakan|mendemonstrasikan|mencipta|menghubungkaitkan|menulis|membaca|memadankan|menentukan|menyusun|mengitlak|menyelesaikan|melengkapkan|menyampaikan|menyanyikan|menyebut|melafazkan|menceritakan|mengikuti|menjawab|respons|identify|classify|compare|observe|measure|record|label|draw|build|produce|explain|describe|state|list|name|choose|select|use|show|demonstrate|create|write|read|spell|reproduce|complete|respond|response|give|locate|point|follow|answer)/i;
const MEASURABLE=/(?:sekurang-kurangnya|\b(?:satu|dua|tiga|empat|lima|enam)\b|dengan\s+tepat|\b(?:tepat|betul|sesuai|relevan|tersusun|berfungsi)\b|\b\d+\b|at\s+least|accurately|correct(?:ly)?|appropriate(?:ly)?|relevant|intelligibly|successfully|\b(?:one|two|three|four|five|six)\b)/i;
function improved(text=''){
  const s=String(text||'').trim();
  if(s.length<28||BANNED.test(s))return false;
  return OBSERVABLE.test(s)&&MEASURABLE.test(s);
}
try{window.isLogicalObjectiveText=improved;if(typeof isLogicalObjectiveText!=='undefined')isLogicalObjectiveText=improved}catch{window.isLogicalObjectiveText=improved}
function refreshCurrent(){
  try{
    if(typeof state==='undefined'||!state.lessonCandidate)return;
    const o=document.getElementById('mapObjective'),c=document.getElementById('mapCriteria');
    if(o)o.dispatchEvent(new Event('input',{bubbles:true}));
    if(c)c.dispatchEvent(new Event('input',{bubbles:true}));
    if(typeof formLessonPayload==='function'&&typeof renderMapGate==='function')renderMapGate(formLessonPayload('draft'),false);
  }catch(err){console.warn('Objective/criteria validator refresh:',err)}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(refreshCurrent,0));else setTimeout(refreshCurrent,0);
window.__RPH_OBJECTIVE_CRITERIA_VALIDATOR__={version:'2026-09-06a',strict:true,addedMalayVerbs:['memerihalkan','menerangkan','menghuraikan','menamakan','memilih','menggunakan','menunjukkan','melaksanakan','mendemonstrasikan','mencipta','menghubungkaitkan']};
console.info('RPH objective/criteria validator hotfix active.');
})();
