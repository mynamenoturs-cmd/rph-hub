(function(root){
'use strict';

const VERSION='2026-09-09a';
const norm=v=>String(v??'').replace(/\s+/g,' ').trim();
const hhmm=v=>String(v??'').slice(0,5);
const esc=v=>{
  try{if(typeof root.escapeHtml==='function')return root.escapeHtml(String(v??''))}catch{}
  return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
};
function appState(){try{return typeof state!=='undefined'?state:root.state}catch{return root.state}}
function byTime(a,b){return Number(a.day_of_week||99)-Number(b.day_of_week||99)||String(a.start_time||'99:99').localeCompare(String(b.start_time||'99:99'))}
function toMinutes(t=''){const m=/^(\d{1,2}):(\d{2})/.exec(String(t||''));return m?Number(m[1])*60+Number(m[2]):NaN}
function mergeTeachingBlocks(entries=[]){
  const rows=(entries||[]).map(e=>({...e,_start:toMinutes(e.start_time),_end:toMinutes(e.end_time)}))
    .filter(e=>Number.isFinite(e._start)&&Number.isFinite(e._end)&&e._end>e._start)
    .sort(byTime);
  const out=[];
  for(const e of rows){
    const p=out.at(-1);
    const same=!!p&&String(p.class_id||'')===String(e.class_id||'')&&String(p.subject_id||'')===String(e.subject_id||'')&&Number(p.day_of_week)===Number(e.day_of_week);
    if(same&&p._end===e._start){p._end=e._end;p.end_time=e.end_time;p._merged_ids=[...(p._merged_ids||[p.id]).filter(Boolean),e.id].filter(Boolean)}
    else out.push({...e,_merged_ids:e.id?[e.id]:[]});
  }
  return out.map(({_start,_end,...e})=>e);
}
function classInfo(classId){
  try{if(typeof root.getClass==='function')return root.getClass(classId)||null}catch{}
  return (appState()?.classes||[]).find(x=>String(x.id||'')===String(classId||''))||null;
}
function academicYearFor(classId,date=''){
  const cls=classInfo(classId);return Number(cls?.academic_year||String(date||'').slice(0,4)||new Date().getFullYear());
}
function weeklyEntries(classId,subjectId,date=''){
  const st=appState()||{},ay=academicYearFor(classId,date),uid=st.user?.id;
  return mergeTeachingBlocks((st.timetable||[]).filter(x=>
    String(x.class_id||'')===String(classId||'')&&
    String(x.subject_id||'')===String(subjectId||'')&&
    (!uid||!x.teacher_id||String(x.teacher_id)===String(uid))&&
    (!x.academic_year||Number(x.academic_year)===ay)
  )).sort(byTime);
}
function mapDispositionBlocked(map){
  try{return !!root.lessonMapWeekDisposition?.(map)?.blocked}catch{return false}
}
function scopedMaps(classId,subjectId,week,date=''){
  const cls=classInfo(classId),ay=academicYearFor(classId,date);
  return (appState()?.lessonMaps||[]).filter(x=>
    String(x.subject_id||'')===String(subjectId||'')&&
    Number(x.year)===Number(cls?.year||0)&&
    Number(x.academic_year)===ay&&
    Number(x.week_no)===Number(week)
  ).sort((a,b)=>Number(a.session_no)-Number(b.session_no));
}
function selectableMaps(classId,subjectId,week,date=''){
  return scopedMaps(classId,subjectId,week,date).filter(x=>x.verification_status==='verified'&&!mapDispositionBlocked(x));
}
function selectMapPure(maps=[],chosenId='',routeSession=null){
  const ready=(maps||[]).filter(x=>x&&x.verification_status==='verified'&&!x.blocked);
  if(chosenId){const chosen=ready.find(x=>String(x.id)===String(chosenId));if(chosen)return chosen}
  if(routeSession){const exact=ready.find(x=>Number(x.session_no)===Number(routeSession));if(exact)return exact}
  return ready.length===1?ready[0]:null;
}
function shouldPreserveManualWeek(source,currentWeek){return String(source||'')==='manual'&&Number(currentWeek)>0}
function routeForMap(map,entries=[]){
  if(!map)return null;const session=Number(map.session_no||0),rows=entries||[],entry=session>0?rows[session-1]||null:null;
  return {available:!!entry,session_no:session||null,total:rows.length,entry};
}
function currentDomScope(){
  const d=root.document;if(!d)return{};
  return {
    classId:d.querySelector('#rphClass')?.value||'',
    subjectId:d.querySelector('#rphSubject')?.value||'',
    week:Number(d.querySelector('#rphWeek')?.value||0),
    date:d.querySelector('#rphDate')?.value||'',
    chosenId:d.querySelector('#rphLessonMap')?.value||''
  };
}
function chosenOrSingleMap(scope=currentDomScope()){
  const maps=selectableMaps(scope.classId,scope.subjectId,scope.week,scope.date);
  return selectMapPure(maps.map(x=>({...x,blocked:false})),scope.chosenId,null);
}

const previousSyncWeek=root.syncRphWeekFromDate;
if(typeof previousSyncWeek==='function')root.syncRphWeekFromDate=async function flexibleSyncRphWeekFromDate(opts={}){
  const d=root.document,weekEl=d?.querySelector('#rphWeek'),date=d?.querySelector('#rphDate')?.value||'';
  if(weekEl&&shouldPreserveManualWeek(weekEl.dataset.source,weekEl.value)){
    try{root.setRphWeekHint?.(`Tarikh ${date||'PdP'} adalah fleksibel. Minggu RPT ${weekEl.value} kekal dipilih secara manual; kandungan ditentukan oleh Minggu + Sesi + Lesson Map disahkan.`,'manual')}catch{}
    try{root.renderRphBadges?.();root.renderRphLessonOptions?.()}catch{}
    return Number(weekEl.value);
  }
  const result=await previousSyncWeek.apply(this,arguments);
  if(weekEl&&result){
    try{root.setRphWeekHint?.(`Cadangan automatik: tarikh ${date} sepadan dengan Minggu RPT ${result}. Anda masih boleh memilih Minggu RPT lain secara manual; tarikh RPH kekal fleksibel.`,'ok')}catch{}
  }
  return result;
};

const previousRenderSchedule=root.renderTeacherScheduleForDate;
if(typeof previousRenderSchedule==='function')root.renderTeacherScheduleForDate=function flexibleRenderTeacherScheduleForDate(opts={}){
  return previousRenderSchedule.call(this,{...(opts||{}),autoPick:false});
};

const previousTimetableRoute=root.timetableLessonRoute;
if(typeof previousTimetableRoute==='function')root.timetableLessonRoute=function flexibleTimetableLessonRoute(classId,subjectId,date){
  const scope=currentDomScope();
  if(String(scope.classId)===String(classId||'')&&String(scope.subjectId)===String(subjectId||'')&&scope.week){
    const map=chosenOrSingleMap(scope),entries=weeklyEntries(classId,subjectId,date);
    if(map){const route=routeForMap(map,entries);if(route)return {...route,flexible_date:true}}
  }
  return previousTimetableRoute.apply(this,arguments);
};

const previousSelectedTeacherSchedule=root.selectedTeacherSchedule;
if(typeof previousSelectedTeacherSchedule==='function')root.selectedTeacherSchedule=function flexibleSelectedTeacherSchedule(){
  const scope=currentDomScope(),map=chosenOrSingleMap(scope),entries=weeklyEntries(scope.classId,scope.subjectId,scope.date),route=routeForMap(map,entries);
  // Apabila sesi Lesson Map dipilih, masa mengikuti ordinal sesi mingguan itu,
  // bukan hari kalendar yang kebetulan dipilih pada medan tarikh.
  if(route?.entry)return {...route.entry,_flexibleDateSchedule:true};
  let actual=null;try{actual=previousSelectedTeacherSchedule.apply(this,arguments)}catch{}
  if(actual&&!map)return actual;
  if(map){
    const time=norm(root.document?.querySelector('#rphTime')?.value||'');
    const m=time.match(/(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})/);
    return {class_id:scope.classId,subject_id:scope.subjectId,start_time:m?.[1]||'00:00',end_time:m?.[2]||'00:00',_flexibleDateSchedule:true,_noWeeklyTimetable:!entries.length};
  }
  return actual;
};

const previousScheduleTimeLabel=root.scheduleTimeLabel;
if(typeof previousScheduleTimeLabel==='function')root.scheduleTimeLabel=function flexibleScheduleTimeLabel(s){
  if(s?._flexibleDateSchedule&&hhmm(s.start_time)==='00:00'&&hhmm(s.end_time)==='00:00')return 'Masa fleksibel';
  return previousScheduleTimeLabel.apply(this,arguments);
};

const previousSelectMap=root.selectVerifiedLessonMap;
if(typeof previousSelectMap==='function')root.selectVerifiedLessonMap=function flexibleSelectVerifiedLessonMap(classId,subjectId,week,date){
  const maps=selectableMaps(classId,subjectId,week,date),chosen=root.document?.querySelector('#rphLessonMap')?.value||'';
  const route=root.timetableLessonRoute?.(classId,subjectId,date)||{};
  const selected=selectMapPure(maps.map(x=>({...x,blocked:false})),chosen,route.session_no);
  return selected||null;
};

const previousRenderOptions=root.renderRphLessonOptions;
if(typeof previousRenderOptions==='function')root.renderRphLessonOptions=function flexibleRenderRphLessonOptions(){
  const d=root.document,el=d?.querySelector('#rphLessonMap');if(!el)return;
  const scope=currentDomScope(),all=scopedMaps(scope.classId,scope.subjectId,scope.week,scope.date),old=el.value;
  if(!all.length){el.innerHTML='<option value="">Tiada Lesson Map untuk Tahun/Subjek/Minggu ini</option>';return}
  const ready=all.filter(x=>x.verification_status==='verified'&&!mapDispositionBlocked(x));
  el.innerHTML='<option value="">Pilih sesi Lesson Map • tarikh fleksibel</option>'+all.map(x=>{
    const blocked=mapDispositionBlocked(x),verified=x.verification_status==='verified',disabled=!verified||blocked;
    const status=blocked?'NO RPH':(verified?'✓ Disahkan':'○ Belum disahkan');
    return `<option value="${esc(x.id)}" ${disabled?'disabled':''}>Sesi ${Number(x.session_no)||'?'} • ${esc(x.title||'Tanpa tajuk')} • ${status}</option>`;
  }).join('');
  if(old&&ready.some(x=>String(x.id)===String(old))){el.value=old;return}
  const route=root.timetableLessonRoute?.(scope.classId,scope.subjectId,scope.date)||{};
  const auto=selectMapPure(ready.map(x=>({...x,blocked:false})),'',route.session_no);
  el.value=auto?.id||'';
};

root.__RPH_FLEXIBLE_DATE_ROUTING__={VERSION,mergeTeachingBlocks,weeklyEntries,selectMapPure,shouldPreserveManualWeek,routeForMap};
try{if(typeof module!=='undefined'&&module.exports)module.exports=root.__RPH_FLEXIBLE_DATE_ROUTING__}catch{}
root.console?.info?.(`RPH flexible-date routing active (${VERSION}).`);
})(typeof window!=='undefined'?window:globalThis);
