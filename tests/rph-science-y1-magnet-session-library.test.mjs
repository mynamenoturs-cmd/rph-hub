import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../rph-science-y1-magnet-session-library-hotfix.js',import.meta.url),'utf8');
const classObj={id:'c1',name:'1 Crystal',year:1};
const sandbox={console:{info(){},warn(){}},getClass:()=>classObj,rphSubjectKey:()=> 'science'};
sandbox.window=sandbox;sandbox.globalThis=sandbox;
vm.runInNewContext(source,sandbox,{filename:'rph-science-y1-magnet-session-library-hotfix.js'});
const api=sandbox.__RPH_SCIENCE_Y1_MAGNET_SESSION_LIBRARY__;

function readyRow(route){
  return {
    active:true,requires_source:true,activity_key:route.activityKey,
    activity_name:'Makmal mini magnet dengan rekod individu',activity_type:'learning',phase:'guided',
    pedagogy_key:'source_first_science_exact_session_v1',subject_key:'science',skill_key:'science',
    subskill_key:`magnet_${route.sp.replaceAll('.','_')}`,
    source_keywords:['science','year:1',`week:${route.week}`,`session:${route.session}`,`sp:${route.sp}`,`duration:${route.duration}`,`anchor:${route.anchor}`,'class:1 crystal'],
    activity_template:'1. Ramal dua objek (5 minit): Murid membuat ramalan.\n2. Belajar merekod pemerhatian (8 minit): Guru menunjukkan cara merekod.\n3. Uji lima objek secara bergilir (20 minit): Murid menguji dan merekod.\n4. Kelaskan kad mengikut bukti (12 minit): Murid mengelaskan.\n5. Semak setiap murid (10 minit): Guru menyemak individu.\n6. Sampaikan bukti dan kemas (5 minit): Murid membuat rumusan.',
    bbm_template:'Buku Teks m/s 65–66; magnet; lima objek; lembaran individu',pak21:'Penyiasatan kumpulan',
    example_text:'Objektif: Murid menguji lima objek dan merekod hasil.\nKriteria kejayaan: Lima keputusan direkod dan sekurang-kurangnya empat pengelasan tepat.\nPeneroka: Bimbing satu objek pada satu masa.\nPembina: Uji lima objek dan kelaskan.\nPencabar: Jelaskan bukti yang mengubah ramalan.\nPBD: Semak jadual dan rumusan individu.'
  };
}
const r=api.ROUTES.find(x=>x.week===29&&x.session===2),row=readyRow(r);
const map={id:'m29s2',subject_key:'science',subject_id:'science-id',class_name:'1 Crystal',year:1,academic_year:2026,week_no:29,session_no:2,sp:'7.1.3',textbook_page_start:65,verification_status:'verified'};
const schedule={day_of_week:3,start_time:'14:30:00',end_time:'15:30:00',class_name:'1 Crystal'};
const select=(patch={})=>api.selectExact({map:{...map,...(patch.map||{})},classId:'c1',lessonDate:patch.lessonDate??'2026-09-09',schedule:patch.schedule===undefined?schedule:patch.schedule,rows:patch.rows??[row],history:patch.history??[]});

assert.equal(select().status,'SELECTED');
assert.equal(select({map:{sp:'7.1.4'}}).code,'SP_MISMATCH');
assert.equal(select({map:{textbook_page_start:64}}).code,'PAGE_MISMATCH');
assert.equal(select({map:{verification_status:'needs_review'}}).status,'LESSON_MAP_NOT_VERIFIED');
assert.equal(select({schedule:{...schedule,end_time:'15:00:00'}}).status,'TIMETABLE_MISMATCH');
assert.equal(select({lessonDate:'2026-09-08'}).status,'TIMETABLE_MISMATCH');
assert.equal(select({rows:[]}).status,'PILOT_LIBRARY_ROW_NOT_READY');
assert.equal(select({rows:[{...row,pedagogy_key:null,skill_key:'general',subskill_key:'general',source_keywords:[]}]}).status,'PILOT_LIBRARY_ROW_NOT_READY');
const blocked={...map,id:'m29s1',session_no:1,textbook_page_start:64,sp:'7.1.3'};
assert.equal(api.selectExact({map:blocked,classId:'c1',lessonDate:'2026-09-07',schedule:{day_of_week:1,start_time:'16:30',end_time:'17:00'},rows:[row],history:[]}).status,'BLOCKED_SOURCE_CONFLICT');
assert.equal(api.selectExact({map:{...map,week_no:27},classId:'c1',lessonDate:'2026-09-09',schedule,rows:[row]}).status,'OUT_OF_SCOPE');
assert.equal(select({history:[{lesson_map_id:'other',lesson_date:'2026-09-02',week_no:28,rph_json:{activity_library_keys:[row.activity_key]}}]}).status,'REPEATED_ACTIVITY');
assert.equal(select({history:[{lesson_map_id:'m29s2',lesson_date:'2026-09-09',week_no:29,rph_json:{activity_library_keys:[row.activity_key]}}]}).status,'SELECTED');
assert.equal(api.phaseTotal(api.parsePhases(row.activity_template)),60);
for(const key of ['objective','criteria','support','core','challenge','pbd'])assert.ok(api.parseLabels(row.example_text)[key],key);
const ped=api.materializePedagogy({},row,r);
assert.equal(ped.sourceSteps.reduce((n,x)=>n+x.minutes,0),60);
assert.equal(ped.librarySteps.core[0].key,row.activity_key);
assert.equal(ped.activityLibrarySelection.route,'M29/S2');
for(const route of api.ROUTES)assert.equal(api.rowReady(readyRow(route),route),true,`route M${route.week}/S${route.session}`);

console.log('RPH Science Y1 Magnet session library: PASS');
