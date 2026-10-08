// Regression: Screenshot RPH Runtime 20261008l, ADMIN, BM1 W29 S2, empty
// visible time but generator picked a hidden 30-minute timetable slot.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const root=new URL('../',import.meta.url);
const source=fs.readFileSync(new URL('app-v03334-original.js',root),'utf8');
function section(start,end){
 const a=source.indexOf(start),b=source.indexOf(end,a+start.length);
 assert.ok(a>=0&&b>a, 'Missing production section: '+start);
 return source.slice(a,b);
}
const funcs=[
 section('function syncSelectedRphSchedule(){','function timetableWeeklySessions('),
 section('function selectedRphSchedule(){','function rphResolvedLessonTime('),
 section('function rphResolvedLessonTime(','function timetableLessonRoute(')
].join('\n');
let admin=true,hiddenReads=0;
const schedule={id:'30-minute-db-slot',class_id:'class1',subject_id:'subject1',start_time:'08:00',end_time:'08:30'};
const controls={
 '#rphSchedule':{value:''}, '#rphDate':{value:'2026-10-08'},
 '#rphClass':{value:'class1'}, '#rphSubject':{value:'subject1'},
 '#rphTime':{value:''}
};
const sandbox={
 console:{info(){},warn(){}},
 state:{timetable:[schedule]},
 isAdmin:()=>admin,
 $:selector=>controls[selector]||null,
 rphSubjectKey:()=> 'bm',
 teacherTimetableSessionsForDate:()=>{hiddenReads++;return [schedule]},
 scheduleTimeLabel:s=>s.start_time+'–'+s.end_time
};
sandbox.window=sandbox;sandbox.globalThis=sandbox;
vm.createContext(sandbox);
for(const path of ['rph-bm-year1-canonical-production.js','rph-bm1-w29s2-word-reference.js']){
 vm.runInContext(fs.readFileSync(new URL(path,root),'utf8'),sandbox,{filename:path});
}
vm.runInContext(funcs,sandbox,{filename:'selected-real-production-time-functions.js'});
const verified={
 subject_key:'bm',year:1,academic_year:2026,week_no:29,session_no:2,
 verification_status:'verified',week_exact:true,sp_crosscheck:true,
 title:'Treler Motosikal Datuk',sp:'2.3.1',
 textbook_page_start:110,textbook_page_end:110,
 source_evidence:{meta:{main_sp:'2.3.1',session_exact:true,page_route_verified:true},textbook:{text:'Pantun Treler Motosikal Datuk'}}
};

// Admin UI renders only a blank option. The database has a matching teacher
// slot, but it must not be secretly read as the Admin selection.
controls['#rphTime'].value='08:00–08:30'; // stale hidden state from an earlier view
assert.equal(vm.runInContext('selectedRphSchedule()',sandbox),null);
assert.equal(hiddenReads,0);
assert.equal(vm.runInContext('rphResolvedLessonTime(verified,"subject1",null)',sandbox),'60 minit',
 'Verified BM1 W29 S2 should take its explicit 60 minutes from Word, not the hidden teacher slot');
assert.equal(vm.runInContext('rphResolvedLessonTime({...verified,session_no:3},"subject1",null)',sandbox),'',
 'Word duration is NOT universal for all Admin RPH sessions');
controls['#rphSchedule'].value='stale-admin-value';
vm.runInContext('syncSelectedRphSchedule()',sandbox);
assert.equal(controls['#rphSchedule'].value,'');
assert.equal(controls['#rphTime'].value,'');
assert.equal(hiddenReads,0,'Admin must never infer a selected schedule from the timetable');

// Teacher selection remains authoritative; do not stretch real 30-minute
// lessons to a 60-minute reviewed Word RPH.
admin=false;
assert.equal(vm.runInContext('selectedRphSchedule()',sandbox)?.id,schedule.id);
controls['#rphTime'].value='';
const selected=vm.runInContext('selectedRphSchedule()',sandbox);
assert.equal(vm.runInContext('rphResolvedLessonTime(verified,"subject1",selected)',sandbox),'08:00–08:30');
assert.equal(sandbox.BmYear1W29S2Reference.applies(verified,{subjectKey:'bm',lessonTime:'08:00–08:30'}),false,
 'Teacher 30-minute timetable may not silently receive 60-minute approved source content');

// Duration resolution must occur after exact map selection and before the
// pre-existing accuracy gate, without bypassing it.
const mapPos=source.indexOf('let map=selectVerifiedLessonMap(classId,subjectId,week,date)');
const timePos=source.indexOf('const lessonTime=rphResolvedLessonTime(map,subjectId,schedule)');
const gatePos=source.indexOf('const validation=validateRphMap(map,ev,built)');
assert.ok(mapPos>=0&&timePos>mapPos&&gatePos>timePos);
assert.ok(source.includes('if(scheduleRequired)validation.checks.push'),'Teacher timetable accuracy gate still required');
assert.ok(source.includes('if(wordSessionSelected&&!approvedContext&&!exactWordSession)'),'No silent generic fallback for Word session');
console.log('RPH Admin Word 60-minute vs teacher hidden 30-minute timetable regression PASS');
