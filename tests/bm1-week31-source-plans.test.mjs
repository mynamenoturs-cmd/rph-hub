// Week 31 source-first regression. Five distinct tasks, no cross-session leakage,
// no approved Word claims, and the original Accuracy Gate must remain before routing.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const root=new URL('../',import.meta.url);
const sandbox={console:{info(){},warn(){}},rphSubjectKey:()=> 'bm'};
sandbox.window=sandbox;sandbox.globalThis=sandbox;
vm.createContext(sandbox);
for(const file of ['rph-bm-year1-canonical-production.js','rph-bm1-week29-source-plans.js','rph-bm1-week30-source-review.js','rph-bm1-week31-source-plans.js']){
  vm.runInContext(fs.readFileSync(new URL(file,root),'utf8'),sandbox,{filename:file});
}
const api=sandbox.BmYear1Week31SourcePlans;
assert.equal(api.VERSION,'BM1-W31-SOURCE-PLANS-20261009b');
assert.deepEqual(Array.from(api.availableSessions),[1,2,3,4,5]);
const fixtures=[
 {session:1,title:'Uruslah Saya',sp:'1.1.2',page:118,
  textbook:'Uruslah Saya. Indira, bolehkan menolong ibu buangkan sampah? Mula-mula asingkan sampah mengikut jenisnya.',
  expected:[/mengapa/i,/rumah bersih/i,/respons lisan individu/i]},
 {session:2,title:'Sungai',sp:'2.3.1',page:119,
  textbook:'Sungai: Membuat gerakan berdasarkan seni kata lagu. Airmu mengalir Dari gunung jauh di sana Hingga sampai di laut nanti.',
  expected:[/dari gunung/i,/ke laut/i,/tiga gerakan/i]},
 {session:3,title:'Kolam Ikan Indira',sp:'3.2.2',page:120,
  textbook:'Kolam Ikan Indira di belakang rumah. Ayah membersihkan kolam pada waktu petang. Indira membela 10 ekor ikan koi.',
  expected:[/belakang rumah/i,/waktu petang/i,/10 ekor ikan koi/i,/apa.*di mana.*bila.*berapa/i]},
 {session:4,title:'Kegunaan Rumput',sp:'5.2.2',page:121,
  textbook:'Kegunaan Rumput. Rumput hiasan mengindahkan taman bunga. Ditanam di padang bola dan di taman permainan, rumah banglo dan rumah teres.',
  expected:[/kata majmuk rangkai kata bebas/i,/empat kata majmuk/i,/tiga ayat/i]},
 {session:5,title:'Kebun Mini',sp:'5.2.3',page:122,
  textbook:'Kebun Mini. Indira mengutip siput-siput, ayah memacakkan kayu-kayu dan ibu memetik cili-cili. Daun-daun di kebun.',
  expected:[/kata ganda/i,/lima kata ganda/i,/tiga ayat/i]}
];
for(const f of fixtures){
 const map={
   subject_id:'bm-id',subject_key:'bm',year:1,academic_year:2026,
   week_no:31,session_no:f.session,title:f.title,sk:f.sp.slice(0,3),sp:f.sp,
   textbook_page_start:f.page,textbook_page_end:f.page,
   verification_status:'verified',week_exact:true,sp_crosscheck:true,
   objective:'Objektif asal berdasarkan SP '+f.sp,
   success_criteria:'Kriteria asal berasaskan Buku Teks m/s '+f.page,
   source_activities:'Buku Teks m/s '+f.page+': '+f.title,
   source_evidence:{meta:{main_sp:f.sp,session_exact:true,page_route_verified:true,
      ...(f.session===3?{mapping_status:'bulk-draft-needs-teacher-review'}:{})},
      textbook:{text:f.textbook}}
 };
 const opts={subjectKey:'bm',lessonTime:'08:00–09:00'};
 assert.equal(api.applies(map,opts),true,'Correct matching verified source for S'+f.session);
 const ped=api.build(map,opts);
 assert.equal(ped.canonicalBm1,true);
 assert.equal(ped.sourcePlanBm1,true);
 assert.equal(ped.reviewedReferenceBm1,undefined,'Word approval may not be invented');
 assert.equal(ped.sourcePlanReviewStatus,'LESSON_MAP_EVIDENCE_NOT_WORD_APPROVED');
 assert.equal(ped.sourcePlanSession,'BM1-2026B-W31-S'+f.session);
 assert.equal(ped.sourceSteps.length,6,'Each lesson must have 6 purpose-built phases');
 assert.equal(ped.classroomFlow.length,6);
 assert.equal(ped.sourceSteps.every(x=>x.key.includes('w31-s'+f.session)),true);
 assert.equal(ped.sourceSteps.every(x=>!('minutes' in x)),true,'Do not invent lesson-step minutes');
 assert.equal(ped.sourceSteps.every(x=>x.text.includes('Tindakan guru:')&&x.text.includes('Tindakan murid:')
    &&x.text.includes('Semakan:')&&x.bbm.includes('Buku Teks m/s '+f.page)),true);
 assert.ok(ped.inductionData.text.includes('Tindakan guru:'));
 assert.ok(ped.penutup.includes('Tindakan murid:'));
 assert.ok(ped.pbdEvidence.method&&ped.pbdEvidence.evidence&&ped.pbdEvidence.criterion);
 assert.ok(ped.reflection.includes('Susulan:'));
 assert.equal(ped.mainSp,f.sp);
 assert.equal(ped.page,'m/s '+f.page);
 assert.equal(ped.canonicalVersion,api.VERSION);
 assert.equal(ped.sourcePlanTeacherReviewNeeded,f.session===3);
 for(const key of ['support','core','challenge']){
   const lane=ped.differentiation[key];
   assert.ok(lane.teacher.length===2&&lane.pupil_steps.length>=3&&lane.example.teacher&&lane.example.pupil);
   assert.ok(lane.product&&lane.criterion&&lane.next_step);
   assert.equal(ped.librarySteps[key].length,1);
   assert.ok(ped.librarySteps[key][0].text.includes(lane.task));
 }
 const dump=JSON.stringify(ped);
 for(const re of f.expected)assert.match(dump,re);
 assert.ok(!dump.includes('PKJR BELUM BERBUKTI'), 'Do not import unrelated PKJR content');
 // Provenance and exact scope, so a W31 lesson cannot be swapped with another.
 for(const [name,bad] of [
  ['wrong week',{...map,week_no:30}],
  ['wrong session',{...map,session_no:f.session===5?1:f.session+1}],
  ['wrong title',{...map,title:'Subjek lain'}],
  ['wrong year',{...map,year:2}],
  ['wrong page',{...map,textbook_page_start:999}],
  ['wrong SP',{...map,sp:'9.9.9'}],
  ['unverified',{...map,verification_status:'needs_review'}],
  ['no full mapping',{...map,week_exact:false}],
  ['no route',{...map,source_evidence:{meta:{...map.source_evidence.meta,page_route_verified:false},textbook:{text:f.textbook}}}],
  ['no source',{...map,source_evidence:{meta:map.source_evidence.meta,textbook:{text:'tiada bukti'}}}],
 ]){
   assert.equal(api.applies(bad,opts),false,name+' must not match S'+f.session);
   assert.throws(()=>api.build(bad,opts),/BM1_WEEK31_SOURCE_PLAN_SCOPE_MISMATCH/);
 }
 assert.equal(api.applies(map,{subjectKey:'en'}),false);
}
const source=fs.readFileSync(new URL('app-v03334-original.js',root),'utf8');
const loader=fs.readFileSync(new URL('app-v03334.js',root),'utf8');
assert.ok(loader.includes('rph-bm1-week31-source-plans.js?v=20261009f'));
assert.ok(source.includes('if(needsW31Plan&&!w31Plans?.applies('),'Evidence mismatch must fail closed');
assert.ok(source.includes('if(needsW31Plan)pedagogy=w31Plans.build('));
assert.ok(source.indexOf('const validation=validateRphMap(map,ev,built)')<source.indexOf('const needsW31Plan='),'Accuracy Gate must precede W31 override');
assert.ok(source.includes("if(exactWordSession)pedagogy=reviewedBm1.build("));
assert.ok(source.includes("if(needsW30Review)pedagogy=w30Review.build("));
assert.ok(source.includes('PERLU SEMAKAN GURU'),'Teacher-review metadata must remain visible');
assert.ok(source.includes('data-rph-renderer="ag-v1"'));
console.log('BM1 W31 S1-S5 verified textbook activity and native A–G evidence parity PASS');
