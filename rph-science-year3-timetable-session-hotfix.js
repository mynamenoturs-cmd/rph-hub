(function(){
'use strict';
const FALLBACK_SCIENCE_SESSIONS=2;
const TIMETABLE_SOURCE='BIL_5_2026_GURU.csv';
// Audited from the deduplicated timetable teaching blocks (consecutive periods
// for the same class/subject/day are one RPH session). These are the canonical
// weekly Lesson Map / RPH session counts for the 2026 timetable.
const AUDITED_SESSION_POLICY={
  BM:5,
  BI:4,
  SN:2,
  PJ:2,
  PK:1,
  MATH:3,
  BA:2,
  PI:4,
  PM:4,
  PSV:1,
  MZ:1
};
const YEAR3_RANGES=[
  {start:2,end:2,unit:'2'},
  {start:3,end:11,unit:'1'},
  {start:12,end:16,unit:'3'},
  {start:17,end:18,unit:'4'},
  {start:19,end:22,unit:'5'},
  {start:23,end:26,unit:'6'},
  {start:27,end:29,unit:'7'},
  {start:30,end:32,unit:'8'},
  {start:33,end:35,unit:'9'},
  {start:36,end:37,unit:'10'}
];
const uniq=a=>[...new Set((a||[]).filter(Boolean))];
function subjectIdentity(subjectId){
  try{
    const sub=typeof getSubject==='function'?getSubject(subjectId):null;
    const code=String(sub?.code||'').trim().toUpperCase().replace(/[^A-Z0-9.]/g,'');
    const name=String(sub?.name||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
    return {code,name};
  }catch{return {code:'',name:''}}
}
function auditedSessions(subjectId){
  const {code,name}=subjectIdentity(subjectId);
  if(AUDITED_SESSION_POLICY[code])return AUDITED_SESSION_POLICY[code];
  if(/(^| )bahasa melayu( |$)/.test(name))return AUDITED_SESSION_POLICY.BM;
  if(/(^| )(english|bahasa inggeris)( |$)/.test(name))return AUDITED_SESSION_POLICY.BI;
  if(/(^| )(sains|science)( |$)/.test(name))return AUDITED_SESSION_POLICY.SN;
  if(/(^| )pendidikan jasmani( |$)/.test(name))return AUDITED_SESSION_POLICY.PJ;
  if(/(^| )pendidikan kesihatan( |$)/.test(name))return AUDITED_SESSION_POLICY.PK;
  if(/(^| )(matematik|mathematics|math)( |$)/.test(name))return AUDITED_SESSION_POLICY.MATH;
  if(/(^| )bahasa arab( |$)/.test(name))return AUDITED_SESSION_POLICY.BA;
  if(/(^| )pendidikan islam( |$)/.test(name))return AUDITED_SESSION_POLICY.PI;
  if(/(^| )(pendidikan moral|moral)( |$)/.test(name))return AUDITED_SESSION_POLICY.PM;
  if(/(^| )(pendidikan seni visual|seni visual|psv)( |$)/.test(name))return AUDITED_SESSION_POLICY.PSV;
  if(/(^| )(pendidikan muzik|muzik|music)( |$)/.test(name))return AUDITED_SESSION_POLICY.MZ;
  return 0;
}
function scienceSubject(subjectId){return auditedSessions(subjectId)===FALLBACK_SCIENCE_SESSIONS&&/(^|\s)(sn|sains|science)(\s|$)/i.test(String([subjectIdentity(subjectId).code,subjectIdentity(subjectId).name].join(' ')))}
function currentYear(){
  const el=document.querySelector('#mapYear');
  return Number(el?.value||0)||0;
}
function sessionAllowed(subjectId,sessionNo){
  const limit=auditedSessions(subjectId);
  return !limit||Number(sessionNo||0)<=limit;
}
const prevLimit=window.subjectRPTSessionLimit;
if(typeof prevLimit==='function')window.subjectRPTSessionLimit=function(subjectId){
  const audited=auditedSessions(subjectId);
  return audited||prevLimit(subjectId);
};
// Prevent stale S5/S6 maps from being verified or selected after the timetable
// policy is applied. Historical rows remain in the database for audit, but do
// not participate in current RPH generation.
const prevSaveLessonMap=window.saveLessonMap;
if(typeof prevSaveLessonMap==='function')window.saveLessonMap=async function(status='draft'){
  const subjectId=document.querySelector('#mapSubject')?.value||'';
  const sessionNo=Number(document.querySelector('#mapSession')?.value||1);
  const limit=auditedSessions(subjectId);
  if(limit&&sessionNo>limit){
    if(typeof toast==='function')toast(`Sesi ${sessionNo} tidak wujud dalam jadual sebenar. Subjek ini mempunyai ${limit} sesi seminggu.`,6500);
    return;
  }
  return prevSaveLessonMap(status);
};
const prevVerifiedRphMaps=window.verifiedRphMaps;
if(typeof prevVerifiedRphMaps==='function')window.verifiedRphMaps=function(classId,subjectId){
  return (prevVerifiedRphMaps(classId,subjectId)||[]).filter(x=>sessionAllowed(subjectId,x?.session_no));
};
const prevSelectVerifiedLessonMap=window.selectVerifiedLessonMap;
if(typeof prevSelectVerifiedLessonMap==='function')window.selectVerifiedLessonMap=function(classId,subjectId,week,date){
  const map=prevSelectVerifiedLessonMap(classId,subjectId,week,date);
  return map&&sessionAllowed(subjectId,map?.session_no)?map:null;
};
function year3Range(week){return YEAR3_RANGES.find(r=>week>=r.start&&week<=r.end)||null}
function sourceSlotsForActual(week,actualSession){
  const r=year3Range(week);if(!r)return [actualSession];
  const total=(r.end-r.start+1)*FALLBACK_SCIENCE_SESSIONS;
  const ordinal=(week-r.start)*FALLBACK_SCIENCE_SESSIONS+(actualSession-1);
  if(total===2)return actualSession===1?[1]:[5];
  if(total===4)return ordinal===3?[4,5]:[ordinal+1];
  const slot=Math.min(5,Math.max(1,Math.ceil(((ordinal+1)*5)/total)));
  return [slot];
}
function mergeSession(rows,week,actualSession,slots){
  const valid=rows.filter(Boolean);if(!valid.length)return null;
  const first=valid[0];
  if(valid.length===1)return {...first,session:actualSession,id:`SC3-2026B-W${String(week).padStart(2,'0')}-A${actualSession}-SRC${slots.join('+')}`,sourcePoolSession:slots[0],sourcePoolSessions:slots,actualTimetableSession:true};
  const pages=uniq(valid.flatMap(x=>x.bt?.pages||[])).map(Number).filter(Boolean).sort((a,b)=>a-b);
  const raw=valid.map(x=>x.bt?.raw).filter(Boolean).join(' + ');
  return {...first,session:actualSession,id:`SC3-2026B-W${String(week).padStart(2,'0')}-A${actualSession}-SRC${slots.join('+')}`,context:valid.map(x=>x.context).filter(Boolean).join('\n'),title:uniq(valid.map(x=>x.title)).join(' + '),spCodes:uniq(valid.flatMap(x=>x.spCodes||[])),skCodes:uniq(valid.flatMap(x=>x.skCodes||[])),activity:valid.map(x=>x.activity).filter(Boolean).join(' Kemudian, '),bt:{...(first.bt||{}),pages,raw:raw||`BT m/s ${pages.join(' & ')}`},complete:Boolean(uniq(valid.flatMap(x=>x.spCodes||[])).length&&uniq(valid.flatMap(x=>x.skCodes||[])).length&&pages.length),sourcePoolSession:slots[0],sourcePoolSessions:slots,actualTimetableSession:true};
}
const prevExtract=window.extractMurniWeekSessions;
if(typeof prevExtract==='function')window.extractMurniWeekSessions=function(text='',weekNo=null,opts={}){
  const max=Number(opts?.maxSessions||0);
  // Science Year 3 needs an explicit 5-slot source-pool projection so Unit 10
  // does not lose later SPs when the real timetable only has two lessons.
  if(max!==FALLBACK_SCIENCE_SESSIONS||!/\bSC3\s*-\s*2026B\s*-\s*W\d{2}\s*-\s*S\d\b/i.test(String(text||'')))return prevExtract(text,weekNo,opts);
  const week=Number(weekNo||0),range=year3Range(week);
  if(!range)return prevExtract(text,weekNo,opts);
  const pool=prevExtract(text,weekNo,{...opts,maxSessions:0});
  if(!Array.isArray(pool)||!pool.length)return pool;
  const bySource=new Map(pool.map(x=>[Number(x.session),x]));
  const actual=[];
  for(let s=1;s<=FALLBACK_SCIENCE_SESSIONS;s++){
    const slots=sourceSlotsForActual(week,s),row=mergeSession(slots.map(n=>bySource.get(n)),week,s,slots);
    if(row)actual.push(row);
  }
  return actual.length?actual:pool.slice(0,FALLBACK_SCIENCE_SESSIONS);
};
function sourceSlotsFromMap(m){
  const id=String(m?.source_evidence?.meta?.stable_session_id||'');
  const hit=id.match(/-SRC(\d)(?:\+(\d))?/i);
  return hit?[Number(hit[1]),Number(hit[2])].filter(Boolean):[];
}
function scienceYear3Map(m){
  try{return scienceSubject(m?.subject_id)&&Number(m?.year)===3}catch{return false}
}
const prevEffective=window.effectiveRphLessonMap;
if(typeof prevEffective==='function')window.effectiveRphLessonMap=function(m,ev,built){
  const slots=scienceYear3Map(m)?sourceSlotsFromMap(m):[];
  if(!slots.length)return prevEffective(m,ev,built);
  const actualSession=Number(m?.session_no||m?.session||0)||1;
  const fake={...m,session_no:slots[0],session:slots[0]};
  const out=prevEffective(fake,ev,built)||fake;
  return {...out,session_no:actualSession,session:actualSession,_runtime_science_year3_actual_session:true,_runtime_science_year3_source_pool_slots:slots};
};
const prevPed=window.buildSourceAwarePedagogy;
if(typeof prevPed==='function')window.buildSourceAwarePedagogy=function(m,a,bt,en,classId=null){
  const slots=scienceYear3Map(m)?sourceSlotsFromMap(m):[];
  if(!slots.length)return prevPed(m,a,bt,en,classId);
  const fake={...m,session_no:slots[0],session:slots[0]};
  const base=prevPed(fake,a,bt,en,classId);
  return {...base,provenance:{...(base?.provenance||{}),actualTimetableSessionsPerWeek:FALLBACK_SCIENCE_SESSIONS,sourcePoolSlots:slots,sessionPolicy:'S1-S5 dalam RPT ialah source-pool mapping sahaja; Lesson Map/RPH menggunakan 2 sesi sebenar seminggu berdasarkan BIL_5_2026_GURU.csv.'}};
};
window.rphAuditedTimetableSessions=auditedSessions;
window.__RPH_TIMETABLE_SESSION_POLICY__={
  version:'2026-09-06b',
  source:TIMETABLE_SOURCE,
  method:'deduplicate timetable rows; merge consecutive periods of the same class/subject/day into one RPH session; use the modal class count where duplicate teacher rows exist',
  sessions:{...AUDITED_SESSION_POLICY},
  labels:{BM:'Bahasa Melayu',BI:'English',SN:'Sains',PJ:'Pendidikan Jasmani',PK:'Pendidikan Kesihatan',MATH:'Matematik',BA:'Bahasa Arab',PI:'Pendidikan Islam',PM:'Pendidikan Moral',PSV:'Pendidikan Seni Visual',MZ:'Muzik'}
};
window.__RPH_SCIENCE_YEAR3_TIMETABLE_SESSION_POLICY__={version:'2026-09-06b',actualSessionsPerWeek:FALLBACK_SCIENCE_SESSIONS,sourcePoolSessions:5,source:TIMETABLE_SOURCE,year3Ranges:YEAR3_RANGES};
console.info('RPH timetable session policy active:',window.__RPH_TIMETABLE_SESSION_POLICY__.sessions);
})();
