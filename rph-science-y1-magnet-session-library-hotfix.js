(function(root){
'use strict';

const VERSION='2026-09-09a';
const PEDAGOGY_KEY='source_first_science_exact_session_v1';
const ROUTES=[
  {week:28,session:1,sp:'7.1.1',anchor:61,duration:30,day:1,start:'16:30',end:'17:00',className:'1 Crystal',activityKey:'science_y1_w28_s1_rahsia_ikan_terpancing_bukti_gambar_m_s_61_4e4b2f8f'},
  {week:28,session:2,sp:'7.1.1',anchor:61,duration:60,day:3,start:'14:30',end:'15:30',className:'1 Crystal',activityKey:'science_y1_w28_s2_misteri_ikan_terpancing_think_pair_share_b_fae92ba8'},
  {week:29,session:2,sp:'7.1.3',anchor:65,duration:60,day:3,start:'14:30',end:'15:30',className:'1 Crystal',activityKey:'science_y1_w29_s2_stesen_ujian_magnet_ditarik_atau_tidak_f7fdc9c8'},
  {week:30,session:1,sp:'7.1.5',anchor:68,duration:30,day:1,start:'16:30',end:'17:00',className:'1 Crystal',activityKey:'science_y1_w30_s1_ramal_kira_banding_magnet_mana_lebih_kuat_1a319d9b'},
  {week:30,session:2,sp:'7.1.5',anchor:68,duration:60,day:3,start:'14:30',end:'15:30',className:'1 Crystal',activityKey:'science_y1_w30_s2_ramal_perhati_terangkan_magnet_mana_lebih__99571893'}
];
const BLOCKED=[{week:29,session:1,sp:'7.1.3',anchor:64,code:'SOURCE_CONFLICT_W29_S1',reason:'M29 S1 ditahan: SP 7.1.3 bercanggah dengan Buku Teks m/s 64 yang berkaitan bentuk magnet / SP 7.1.2.'}];

const norm=v=>String(v??'').toLowerCase().replace(/\s+/g,' ').trim();
const truthy=v=>v===true||/^(?:true|1|yes|ya)$/i.test(String(v??''));
const hhmm=v=>String(v??'').slice(0,5);
function appState(){try{return typeof state!=='undefined'?state:root.state}catch{return root.state}}
const mainSp=map=>String(map?.source_evidence?.meta?.main_sp||String(map?.sp||'').split(',')[0]||'').trim();
const pageNo=map=>Number(map?.textbook_page_start||map?.textbook_page||0)||0;
const weekNo=map=>Number(map?.week_no||map?.week||0)||0;
const sessionNo=map=>Number(map?.session_no||map?.session||0)||0;
const academicYear=map=>Number(map?.academic_year||2026)||2026;
function subjectKey(map){
  try{if(typeof root.rphSubjectKey==='function')return String(root.rphSubjectKey(map?.subject_id)||'').toLowerCase()}catch{}
  return String(map?.subject_key||'').toLowerCase();
}
function classInfo(classId,map){
  try{
    const fn=root.getClass||(typeof getClass==='function'?getClass:null);
    const c=typeof fn==='function'?fn(classId||map?.class_id):null;
    if(c)return c;
  }catch{}
  return {name:map?.class_name||'',year:map?.year||map?.year_level||0};
}
function classYear(classId,map){return Number(classInfo(classId,map)?.year||map?.year||map?.year_level||0)||0}
function className(classId,map){const c=classInfo(classId,map);return String(c?.name||c?.class_name||map?.class_name||'').trim()}
function routeFor(map){return ROUTES.find(r=>r.week===weekNo(map)&&r.session===sessionNo(map))||null}
function blockedFor(map){return BLOCKED.find(r=>r.week===weekNo(map)&&r.session===sessionNo(map))||null}
function routeTokens(route){return [`science`,`year:1`,`week:${route.week}`,`session:${route.session}`,`sp:${route.sp}`,`duration:${route.duration}`,`anchor:${route.anchor}`,`class:${norm(route.className)}`]}
function keywordSet(row){return new Set((Array.isArray(row?.source_keywords)?row.source_keywords:[]).map(norm))}
function rowReady(row,route){
  if(!row||row.active===false||!truthy(row.requires_source))return false;
  if(String(row.activity_key||'')!==route.activityKey)return false;
  if(String(row.pedagogy_key||'')!==PEDAGOGY_KEY)return false;
  if(String(row.subject_key||'').toLowerCase()!=='science')return false;
  if(String(row.skill_key||'').toLowerCase()!=='science')return false;
  if(String(row.subskill_key||'').toLowerCase()!==`magnet_${route.sp.replaceAll('.','_')}`)return false;
  const ks=keywordSet(row);return routeTokens(route).every(t=>ks.has(norm(t)));
}
function findReadyRow(rows,route){return (rows||[]).find(r=>rowReady(r,route))||null}
function sameLesson(h,ctx){
  if(ctx.lessonMapId&&String(h?.lesson_map_id||h?.rph_json?.lesson_map_id||'')===String(ctx.lessonMapId))return true;
  return String(h?.lesson_date||'')===String(ctx.lessonDate||'')&&Number(h?.week_no||h?.week||0)===Number(ctx.route?.week||0);
}
function repeatedElsewhere(history,row,ctx){
  return (history||[]).some(h=>{
    const keys=h?.rph_json?.activity_library_keys||h?.activity_library_keys||[];
    if(!keys.includes(row.activity_key))return false;
    return !sameLesson(h,ctx);
  });
}
function validateSchedule(route,schedule,lessonDate){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(String(lessonDate||'')))return 'CALENDAR_NOT_CONFIRMED';
  const d=new Date(`${lessonDate}T12:00:00Z`);if(Number.isNaN(d.getTime())||d.getUTCDay()!==route.day)return 'TIMETABLE_MISMATCH';
  if(!schedule)return 'TIMETABLE_MISMATCH';
  if(Number(schedule.day_of_week)!==route.day||hhmm(schedule.start_time)!==route.start||hhmm(schedule.end_time)!==route.end)return 'TIMETABLE_MISMATCH';
  const [sh,sm]=route.start.split(':').map(Number),[eh,em]=route.end.split(':').map(Number);
  const duration=(eh*60+em)-(sh*60+sm);return duration===route.duration?null:'DURATION_MISMATCH';
}
function selectExact({map,classId,lessonDate,schedule,rows=[],history=[]}={}){
  if(subjectKey(map)!=='science'||classYear(classId,map)!==1||academicYear(map)!==2026)return {status:'OUT_OF_SCOPE'};
  const blocked=blockedFor(map);
  if(blocked){
    if(mainSp(map)===blocked.sp&&pageNo(map)===blocked.anchor)return {status:'BLOCKED_SOURCE_CONFLICT',code:blocked.code,reason:blocked.reason};
    return {status:'ROUTE_MISMATCH',code:'BLOCKED_ROUTE_METADATA_MISMATCH'};
  }
  const route=routeFor(map);if(!route)return {status:'OUT_OF_SCOPE'};
  if(mainSp(map)!==route.sp)return {status:'ROUTE_MISMATCH',code:'SP_MISMATCH'};
  if(pageNo(map)!==route.anchor)return {status:'ROUTE_MISMATCH',code:'PAGE_MISMATCH'};
  if(String(map?.verification_status||'')!=='verified')return {status:'LESSON_MAP_NOT_VERIFIED'};
  if(norm(className(classId,map))!==norm(route.className))return {status:'ROUTE_MISMATCH',code:'CLASS_MISMATCH'};
  const scheduleError=validateSchedule(route,schedule,lessonDate);if(scheduleError)return {status:scheduleError};
  const row=findReadyRow(rows,route);if(!row)return {status:'PILOT_LIBRARY_ROW_NOT_READY'};
  const ctx={route,lessonDate,lessonMapId:map?.id};if(repeatedElsewhere(history,row,ctx))return {status:'REPEATED_ACTIVITY'};
  return {status:'SELECTED',route,row};
}
function parseLabels(text=''){
  const src=String(text||'').replace(/\r/g,'');
  const labels=['Objektif','Kriteria kejayaan','Peneroka','Pembina','Pencabar','PBD'];
  const out={};
  labels.forEach((label,i)=>{
    const next=labels.slice(i+1).map(x=>`${x}\\s*:`).join('|');
    const re=new RegExp(`${label}\\s*:\\s*([\\s\\S]*?)${next?`(?=${next}|$)`:'$'}`,'i');
    out[label]=String(src.match(re)?.[1]||'').trim();
  });
  return {objective:out['Objektif'],criteria:out['Kriteria kejayaan'],support:out['Peneroka'],core:out['Pembina'],challenge:out['Pencabar'],pbd:out['PBD']};
}
function parsePhases(template=''){
  const src=String(template||'').replace(/\r/g,'').trim(),out=[];
  const re=/(?:^|\n)\s*\d+\.\s*([^\n:]+?)\s*\((\d+)\s*minit\)\s*:\s*([\s\S]*?)(?=\n\s*\d+\.|$)/gi;let m;
  while((m=re.exec(src)))out.push({name:String(m[1]).trim(),minutes:Number(m[2]),text:String(m[3]).trim()});
  return out;
}
function phaseTotal(phases=[]){return phases.reduce((n,p)=>n+Number(p.minutes||0),0)}
function materializePedagogy(base,row,route){
  const labels=parseLabels(row.example_text),phases=parsePhases(row.activity_template);
  if(!phases.length||phaseTotal(phases)!==route.duration)throw new Error('PILOT_PHASE_DURATION_MISMATCH');
  const bbm=String(row.bbm_template||'').trim(),pak=String(row.pak21||'').trim();
  const sourceSteps=phases.map((p,i)=>({key:`source-magnet-pilot-w${route.week}-s${route.session}-${i+1}`,name:p.name,text:p.text,rawText:p.text,bbm,pak21:pak,phase:'source',duration:`${p.minutes} minit`,minutes:p.minutes}));
  const variant=(level,text)=>({key:row.activity_key,name:`${level} — ${row.activity_name}`,text,bbm,pak21:pak,phase:row.phase||'practice',activity_type:row.activity_type||'learning',libraryActivityKey:row.activity_key,libraryDriven:true});
  const librarySteps={support:[variant('Peneroka',labels.support)],core:[variant('Pembina',labels.core)],challenge:[variant('Pencabar',labels.challenge)]};
  const closure=phases.at(-1)?.text||'';
  return {...base,
    method:row.activity_name,
    pakDetail:`Pelaksanaan sesi tepat M${route.week}/S${route.session}. Tugasan sumber dikekalkan; variasi bantuan/cabaran datang daripada Activity Library.`,
    anchor:labels.objective||base?.anchor||'',
    kind:'investigation',
    bbmList:bbm.split(';').map(x=>x.trim()).filter(Boolean),
    groupBbm:{support:bbm,core:bbm,challenge:bbm},
    mainSp:route.sp,
    page:`m/s ${route.anchor}`,
    sourceSteps,
    librarySteps,
    diffSupport:labels.support,diffCore:labels.core,diffChallenge:labels.challenge,
    diffSupportAct:labels.support,diffCoreAct:labels.core,diffChallengeAct:labels.challenge,
    pbdEvidence:{method:'Pemerhatian pelaksanaan + semakan evidens individu',evidence:labels.pbd,criterion:labels.criteria},
    setInduksi:phases[0]?.text||'',
    inductionData:{name:phases[0]?.name||'Set Induksi',text:phases[0]?.text||'',bbm,pak21:pak},
    penutup:closure,
    activityLibrarySelection:{activity_key:row.activity_key,activity_name:row.activity_name,source:'rph_activity_library',route:`M${route.week}/S${route.session}`,version:VERSION},
    exactSessionLibrary:true,
    magnetPilotVersion:VERSION
  };
}
function mergeTeachingBlocks(entries=[]){
  const toMinutes=t=>{const m=/^(\d{1,2}):(\d{2})/.exec(String(t||''));if(!m)return NaN;return Number(m[1])*60+Number(m[2])};
  const rows=(entries||[]).map(e=>({...e,_start:toMinutes(e.start_time),_end:toMinutes(e.end_time)})).filter(e=>Number.isFinite(e._start)&&Number.isFinite(e._end)&&e._end>e._start).sort((a,b)=>a._start-b._start);
  const out=[];for(const e of rows){const p=out.at(-1);if(p&&String(p.class_id||p.class_name)===String(e.class_id||e.class_name)&&String(p.subject_id||p.subject_code)===String(e.subject_id||e.subject_code)&&Number(p.day_of_week)===Number(e.day_of_week)&&p._end===e._start){p._end=e._end;p.end_time=e.end_time}else out.push({...e})}
  return out.map(({_start,_end,...e})=>e);
}
function runtimeSchedule(map,classId,lessonDate){
  let rows=[];try{if(typeof root.teacherTimetableSessionsForDate==='function')rows=root.teacherTimetableSessionsForDate(lessonDate)||[]}catch{}
  const filtered=rows.filter(x=>(!classId||String(x.class_id||'')===String(classId))&&(!map?.subject_id||String(x.subject_id||'')===String(map.subject_id)));
  const blocks=mergeTeachingBlocks(filtered);const route=routeFor(map)||blockedFor(map);if(!route)return null;
  const live=blocks.find(x=>Number(x.day_of_week)===route.day&&hhmm(x.start_time)===route.start&&hhmm(x.end_time)===route.end);
  if(live)return {...live,_magnetScheduleSource:'teacher_timetable_entries'};
  // This pilot was audited against school_timetable_entries for 1 Crystal.
  // Admin/personal timetable may legitimately have no matching row, so use the
  // reviewed pilot schedule only inside this tightly scoped 2026 Magnet route.
  return {day_of_week:route.day,start_time:route.start,end_time:route.end,class_name:route.className,_magnetScheduleSource:'audited_school_timetable_pilot_2026'};
}
function runtimeContext(map,classId){
  let lessonDate='';try{lessonDate=String(root.document?.querySelector?.('#rphDate')?.value||'')}catch{}
  return {map,classId,lessonDate,schedule:runtimeSchedule(map,classId,lessonDate),rows:(appState()?.rphActivityLibrary||[]),history:(appState()?.rphRecords||[])};
}
function failSelection(result){
  const msg=result?.reason||({LESSON_MAP_NOT_VERIFIED:'Lesson Map sesi Magnet belum disahkan.',TIMETABLE_MISMATCH:'Jadual sesi Magnet tidak sepadan dengan sesi yang diluluskan.',CALENDAR_NOT_CONFIRMED:'Tarikh PdP belum dapat disahkan.',PILOT_LIBRARY_ROW_NOT_READY:'Rekod Activity Library Magnet belum menggunakan versi pilot yang diluluskan.',REPEATED_ACTIVITY:'Aktiviti sesi ini telah digunakan pada pelajaran lain.',ROUTE_MISMATCH:'SP/halaman/kelas tidak sepadan dengan route sesi Magnet.'}[result?.status]||`Pemilih sesi Magnet gagal: ${result?.status||'UNKNOWN'}`);
  try{if(typeof root.toast==='function')root.toast(msg,6500)}catch{}
  const err=new Error(`${result?.status||'MAGNET_SELECTOR_FAILED'}${result?.code?`:${result.code}`:''}`);err.userMessage=msg;throw err;
}

const previousEffective=root.effectiveRphLessonMap;
if(typeof previousEffective==='function')root.effectiveRphLessonMap=function(map,ev,built){
  const out=previousEffective.apply(this,arguments)||map;
  const route=routeFor(out);if(!route||String(out?.verification_status||'')!=='verified')return out;
  const row=findReadyRow(appState()?.rphActivityLibrary||[],route);if(!row)return out;
  const labels=parseLabels(row.example_text);if(!labels.objective||!labels.criteria)return out;
  return {...out,objective:labels.objective,success_criteria:labels.criteria,_runtime_science_y1_magnet_session_library:row.activity_key};
};

const previousBuild=root.buildSourceAwarePedagogy;
if(typeof previousBuild==='function')root.buildSourceAwarePedagogy=function(map,activities,btRef,uiEn,classId=null){
  const base=previousBuild.apply(this,arguments);
  if(uiEn)return base;
  const route=routeFor(map),blocked=blockedFor(map);if(!route&&!blocked)return base;
  const result=selectExact(runtimeContext(map,classId));
  if(result.status!=='SELECTED')return failSelection(result);
  return materializePedagogy(base,result.row,result.route);
};

root.__RPH_SCIENCE_Y1_MAGNET_SESSION_LIBRARY__={VERSION,ROUTES,BLOCKED,selectExact,rowReady,findReadyRow,parseLabels,parsePhases,phaseTotal,materializePedagogy,mergeTeachingBlocks};
try{if(typeof module!=='undefined'&&module.exports)module.exports=root.__RPH_SCIENCE_Y1_MAGNET_SESSION_LIBRARY__}catch{}
if(root.console?.info)root.console.info(`RPH Science Y1 Magnet exact-session Activity Library selector active (${VERSION}).`);
})(typeof window!=='undefined'?window:globalThis);
