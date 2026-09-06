(function(){
'use strict';
const FALLBACK_SCIENCE_SESSIONS=2;
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
function scienceSubject(subjectId){
  try{
    const sub=typeof getSubject==='function'?getSubject(subjectId):null;
    const key=String([sub?.code,sub?.name].filter(Boolean).join(' ')).toLowerCase();
    return /(^|\s)(sn|sains|science)(\s|$)/.test(key);
  }catch{return false}
}
function currentYear(){
  const el=document.querySelector('#mapYear');
  return Number(el?.value||0)||0;
}
function timetableCount(subjectId,year){
  try{
    if(typeof state==='undefined'||!Array.isArray(state.timetable)||!state.timetable.length)return 0;
    const rows=state.timetable.filter(x=>x.subject_id===subjectId&&(!x.academic_year||Number(x.academic_year)===2026));
    if(!rows.length)return 0;
    const byClass=new Map();
    for(const row of rows){
      const cls=typeof getClass==='function'?getClass(row.class_id):null;
      if(year&&Number(cls?.year)!==Number(year))continue;
      const k=row.class_id||'__unknown__',a=byClass.get(k)||new Set();
      a.add(`${row.day_of_week}|${row.start_time||''}|${row.end_time||''}`);byClass.set(k,a);
    }
    const counts=[...byClass.values()].map(s=>s.size).filter(Boolean);
    return counts.length?Math.max(...counts):0;
  }catch{return 0}
}
const prevLimit=window.subjectRPTSessionLimit;
if(typeof prevLimit==='function')window.subjectRPTSessionLimit=function(subjectId){
  if(!scienceSubject(subjectId))return prevLimit(subjectId);
  const year=currentYear();
  const live=timetableCount(subjectId,year);
  return live||FALLBACK_SCIENCE_SESSIONS;
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
window.__RPH_SCIENCE_YEAR3_TIMETABLE_SESSION_POLICY__={version:'2026-09-06a',actualSessionsPerWeek:FALLBACK_SCIENCE_SESSIONS,sourcePoolSessions:5,source:'BIL_5_2026_GURU.csv',year3Ranges:YEAR3_RANGES};
console.info('RPH Science Year 3 timetable session policy active: 2 actual sessions/week; S1-S5 retained as source pool only.');
})();
