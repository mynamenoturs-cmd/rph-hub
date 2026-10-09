import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const base=new URL('../',import.meta.url),env={console:{warn(){},info(){}},rphSubjectKey:()=> 'bm'};
env.window=env;env.globalThis=env;vm.createContext(env);
for(const file of ['rph-bm-year1-canonical-production.js','rph-bm1-week36-source-plans.js']){
 vm.runInContext(fs.readFileSync(new URL(file,base),'utf8'),env,{filename:file});
}
const api=env.BmYear1Week36SourcePlans;
assert.equal(api.VERSION,'BM1-W36-SOURCE-PLANS-20261009g');
assert.deepEqual(Array.from(api.availableSessions),[1,2,3,4,5]);
const fixtures=[
 {session:1,title:'Jadikan Teladan',sp:'1.2.2',page:143,
  text:'Jadikan Teladan. Wah rupanya Datuk Bahari ialah bekas murid sekolah kita. Beliau peniaga berjaya dan suka menolong orang susah.',
  terms:[/datuk bahari/i,/tiga maklumat/i,/menolong/i]},
 {session:2,title:'Sikap Baik dalam Berniaga',sp:'2.3.1',page:144,
  text:'Sikap Baik dalam Berniaga. Aimi rajin menjaga kedai buku. Membaca memahami menyatakan maksud pantun. Aimi membantu guru di kedai buku sewaktu rehat.',
  terms:[/pantun/i,/dua rangkap/i,/kedai buku/i]},
 {session:3,title:'Cita-cita Saya',sp:'3.3.2',page:145,
  text:'Cita-cita Saya. Aktiviti Mengedit teks dengan tanda baca yang betul. Saya hendak menjual basikal. mereka dapat bersenam beriadah. oleh itu saya belajar.',
  terms:[/tanda baca/i,/huruf besar/i,/mereka/i,/oleh itu/i]},
 {session:4,title:'Restoran Keluarga',sp:'5.3.1',page:146,
  text:'Restoran Keluarga. Ahli keluarga Aimi membuka restoran. Ayah Aimi pengurus restoran. Ibu Aimi membantu pelanggan mengelap meja.',
  terms:[/sesi pengenalan/i,/tiga ayat/i,/S4/i]},
 {session:5,title:'Restoran Keluarga',sp:'5.3.1',page:146,
  text:'Restoran Keluarga. Ahli keluarga Aimi membuka restoran. Ayah Aimi pengurus restoran. Ibu Aimi membantu pelanggan mengelap meja.',
  terms:[/pengukuhan/i,/pembetulan/i,/S5/i]}
];
const built=[];
for(const f of fixtures){
 const map={
  subject_key:'bm',year:1,academic_year:2026,week_no:36,session_no:f.session,
  title:f.title,sk:f.sp.split('.').slice(0,2).join('.'),sp:f.sp,
  verification_status:'verified',week_exact:true,sp_crosscheck:true,
  textbook_page_start:f.page,textbook_page_end:f.page,
  objective:'Objektif asal Lesson Map untuk SP '+f.sp,
  success_criteria:'Kriteria sumber pada BT m/s '+f.page,
  source_activities:'Buku Teks m/s '+f.page+' — '+f.title,
  source_evidence:{meta:{main_sp:f.sp,session_exact:true,page_route_verified:true,
   mapping_status:'bulk-draft-needs-teacher-review'},textbook:{text:f.text}}
 };
 const opts={subjectKey:'bm',lessonTime:'08:00–08:30'};
 assert.equal(api.applies(map,opts),true,'Exact verified S'+f.session);
 const p=api.build(map,opts);
 built.push(p);
 assert.equal(p.sourcePlanSession,'BM1-2026B-W36-S'+f.session);
 assert.equal(p.canonicalBm1,true);
 assert.equal(p.sourcePlanBm1,true);
 assert.equal(p.reviewedReferenceBm1,undefined);
 assert.equal(p.sourcePlanTeacherReviewNeeded,true);
 assert.equal(p.sourcePlanReviewStatus,'LESSON_MAP_EVIDENCE_NOT_WORD_APPROVED');
 assert.equal(p.sourceSteps.length,6);
 assert.ok(p.sourceSteps.every(x=>x.key.includes('w36-s'+f.session)));
 assert.ok(p.sourceSteps.every(x=>x.minutes===undefined),'No made-up minutes');
 assert.ok(p.sourceSteps.every(x=>x.text.includes('Tindakan guru:')&&x.text.includes('Tindakan murid:')
  &&x.text.includes('Semakan:')&&x.bbm==='Buku Teks m/s '+f.page));
 assert.ok(p.pbdEvidence.method&&p.pbdEvidence.criterion&&p.pbdEvidence.evidence);
 assert.ok(p.reflection.includes('Susulan:'));
 assert.equal(p.page,'m/s '+f.page);assert.equal(p.mainSp,f.sp);
 for(const key of ['support','core','challenge']){
   const d=p.differentiation[key];
   assert.ok(d.task&&d.teacher.length>=2&&d.pupil_steps.length>=3);
   assert.ok(d.example.teacher&&d.example.pupil&&d.product&&d.criterion&&d.next_step);
   assert.equal(p.librarySteps[key].length,1);
 }
 for(const term of f.terms)assert.match(JSON.stringify(p),term);
 for(const [label,bad] of [
  ['year',{...map,year:2}],['week',{...map,week_no:35}],
  ...(f.session===4?[]:[['session',{...map,session_no:f.session===5?1:f.session+1}]]),
  ['title',{...map,title:'Tajuk lain'}],
  ['page',{...map,textbook_page_start:888}],
  ['sp',{...map,sp:'9.9.9'}],
  ['verification',{...map,verification_status:'needs_review'}],
  ['source',{...map,source_evidence:{meta:map.source_evidence.meta,textbook:{text:'Buku lain'}}}],
  ['meta',{...map,source_evidence:{meta:{...map.source_evidence.meta,page_route_verified:false},textbook:{text:f.text}}}]
 ]){
   assert.equal(api.applies(bad,opts),false,'Reject '+label+' S'+f.session);
   assert.throws(()=>api.build(bad,opts),/BM1_WEEK36_SOURCE_PLAN_SCOPE_MISMATCH/);
 }
 assert.equal(api.applies(map,{subjectKey:'en'}),false,'Other subject must not match');
}
const s4=built[3],s5=built[4];
assert.notEqual(s4.sourceTask,s5.sourceTask);
assert.notEqual(s4.sourceSteps[0].name,s5.sourceSteps[0].name);
assert.notEqual(s4.sourceSteps[3].text,s5.sourceSteps[3].text);
assert.notEqual(s4.pbdEvidence.method,s5.pbdEvidence.method);
assert.notEqual(s4.reflection,s5.reflection);
assert.equal(s4.sourcePlanAntiRepeatNote,'S4/S5: SAME_TEXTBOOK_DIFFERENT_LESSON_PROGRESS');
assert.equal(s5.sourcePlanAntiRepeatNote,'S4/S5: SAME_TEXTBOOK_DIFFERENT_LESSON_PROGRESS');
assert.match(s5.pbdEvidence.evidence,/tidak menggunakan markah S4 semata-mata/);
assert.match(s4.pbdEvidence.method,/set pertama/);
assert.match(s5.pbdEvidence.method,/set akhir/);
assert.ok(s5.sourceSteps[0].text.includes('jika ada'),'S5 must not assume S4 work exists');
const source=fs.readFileSync(new URL('app-v03334-original.js',base),'utf8');
const loader=fs.readFileSync(new URL('app-v03334.js',base),'utf8');
assert.ok(loader.includes('rph-bm1-week36-source-plans.js?v=20261009i'));
assert.ok(source.includes('if(needsW36Plan&&!w36Plans?.applies('));
assert.ok(source.includes('if(needsW36Plan)pedagogy=w36Plans.build('));
assert.ok(source.indexOf('const validation=validateRphMap(map,ev,built)')<source.indexOf('const needsW36Plan='));
assert.ok(source.includes('if(exactWordSession)pedagogy=reviewedBm1.build('));
assert.ok(source.includes('data-rph-renderer="ag-v1"'));
assert.ok(source.includes('PERLU SEMAKAN GURU'));
console.log('BM1 W36 S1–S5 exact-source, duplicate S4/S5 anti-repeat and native A–G regression PASS');
