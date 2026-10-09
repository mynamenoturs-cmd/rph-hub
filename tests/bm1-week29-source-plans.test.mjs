import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const root=new URL('../',import.meta.url);
const sandbox={console:{info(){},warn(){}},rphSubjectKey:()=> 'bm'};
sandbox.window=sandbox;sandbox.globalThis=sandbox;
vm.createContext(sandbox);
for(const file of ['rph-bm-year1-canonical-production.js','rph-bm1-week29-source-plans.js','rph-bm1-w29s2-word-reference.js']){
  vm.runInContext(fs.readFileSync(new URL(file,root),'utf8'),sandbox,{filename:file});
}
const api=sandbox.BmYear1Week29SourcePlans;
assert.ok(api);
assert.equal(api.VERSION,'BM1-W29-SOURCE-PLANS-20261008n');

const cases=[
  {session:1,title:'Penyiram Pokok Inovasi',sp:'1.2.2',page:109,
    evidence:'109 Penyiram Pokok Inovasi: botol plastik. Keistimewaan: menjimatkan air dan tahan lama. Menyampaikan maklumat berdasarkan gambar.',
    objective:'Murid dapat menyampaikan cara dan dua keistimewaan penyiram.',
    success:'Murid menyampaikan cara dan sekurang-kurangnya dua keistimewaan.',
    test:[/urutan cara/,/dua keistimewaan/,/respons lisan individu/]},
  {session:3,title:'Wah, Mudahnya!',sp:'3.2.1',page:111,
    evidence:'111 Wah, Mudahnya! penanda buku pintar ini memudahkan Kalang membawa buku ke sekolah mengikut jadual waktu.',
    objective:'Murid membina dan menulis tiga ayat berdasarkan jadual.',
    success:'Murid menulis tiga ayat yang sepadan dengan jadual.',
    test:[/jadual waktu/,/tiga ayat/,/tulisan individu/]},
  {session:4,title:'Berus Gigiku Hebat',sp:'4.2.2',page:112,
    evidence:'112 Berus Gigiku Hebat Menyanyikan lagu dengan sebutan dan intonasi yang betul. Irama lagu: Wau Bulan.',
    objective:'Murid menyanyikan lagu mengikut irama Wau Bulan.',
    success:'Murid menyanyikan satu bahagian lagu dengan sebutan dan intonasi yang betul.',
    test:[/Wau Bulan/,/nyanyian individu/,/nyanyian sebenar/]}
];
for(const c of cases){
 const map={
  subject_id:'bm-id',year:1,academic_year:2026,week_no:29,session_no:c.session,
  verification_status:'verified',week_exact:true,sp_crosscheck:true,title:c.title,
  sk:c.sp.split('.').slice(0,2).join('.'),sp:c.sp,textbook_page_start:c.page,textbook_page_end:c.page,
  objective:c.objective,success_criteria:c.success,confidence_score:100,
  source_activities:'Buku Teks m/s '+c.page+': '+c.title,
  source_evidence:{meta:{main_sp:c.sp,session_exact:true,page_route_verified:true},textbook:{text:c.evidence}}
 };
 const opts={subjectKey:'bm',lessonTime:'08:00–09:00'};
 assert.equal(api.applies(map,opts),true,'Expected exact evidence plan for S'+c.session);
 const ped=api.build(map,opts);
 assert.equal(ped.canonicalBm1,true);
 assert.equal(ped.sourcePlanBm1,true);
 assert.equal(ped.reviewedReferenceBm1,undefined,'Word approval is not inferred from a Lesson Map');
 assert.equal(ped.sourcePlanReviewStatus,'LESSON_MAP_EVIDENCE_NOT_WORD_APPROVED');
 assert.equal(ped.sourceSteps.length,6,'Six fully described source-specific D steps expected for S'+c.session);
 assert.equal(ped.classroomFlow.length,6);
 for(const x of ped.sourceSteps){
  assert.ok(x.text.includes('Tindakan guru:'));
  assert.ok(x.text.includes('Tindakan murid:'));
  assert.ok(x.text.includes('Semakan:'));
  assert.ok(x.text.includes('Bahan:'));
  assert.ok(x.bbm.includes('Buku Teks m/s '+c.page),'Source page retained in every step');
  assert.equal(x.minutes,undefined,'No made-up step duration from textbook OCR');
 }
 for(const group of ['support','core','challenge']){
  const lane=ped.differentiation[group];
  assert.ok(lane.task&&lane.teacher.length&&lane.pupil_steps.length&&lane.product&&lane.criterion&&lane.next_step);
  assert.equal(ped.librarySteps[group].length,1);
  assert.ok(ped.librarySteps[group][0].text.includes(lane.task));
 }
 assert.ok(ped.inductionData.text.includes(ped.sourceSteps[0].name)===false);
 assert.ok(ped.penutup.includes('Tindakan guru:'));
 assert.ok(ped.reflection.includes('Susulan:')||ped.reflection.includes('susulan:'));
 assert.equal(ped.mainSp,c.sp);
 assert.equal(ped.page,'m/s '+c.page);
 assert.equal(ped.pbdEvidence.method,ped.pbd.method);
 assert.equal(ped.canonicalVersion,api.VERSION);
 for(const pattern of c.test)assert.ok(pattern.test(JSON.stringify(ped)),pattern+' missing from session plan '+c.session);

 // Never apply another session's plan to the correct book page.
 for(const [label,wrong] of [
  ['wrong week',{...map,week_no:30}],
  ['wrong session',{...map,session_no:2}],
  ['wrong page',{...map,textbook_page_start:1}],
  ['wrong SP',{...map,sp:'9.9.9'}],
  ['wrong source',{...map,source_evidence:{meta:map.source_evidence.meta,textbook:{text:'unrelated'}}}],
  ['unverified',{...map,verification_status:'needs_review'}],
  ['unverified route',{...map,source_evidence:{meta:{...map.source_evidence.meta,page_route_verified:false},textbook:{text:c.evidence}}}],
  ['wrong subject',{...map,subject_key:'en'}],
 ]){
   const wrongOpts=label==='wrong subject'?{subjectKey:'en',lessonTime:'08:00–09:00'}:opts;
   assert.equal(api.applies(wrong,wrongOpts),false,'Wrong scope '+label+' S'+c.session);
   assert.throws(()=>api.build(wrong,wrongOpts),/BM1_WEEK29_SOURCE_PLAN_SCOPE_OR_EVIDENCE_MISMATCH/);
 }
}
assert.deepEqual(Array.from(api.availableSessions),[1,3,4],'M29 S2 must use Word, not a generic new lesson plan');
const source=fs.readFileSync(new URL('app-v03334-original.js',root),'utf8');
const loader=fs.readFileSync(new URL('app-v03334.js',root),'utf8');
assert.ok(source.includes('if(needsW29Plan)pedagogy=w29Plans.build('));
assert.ok(source.includes('if(needsW29Plan&&!w29Plans?.applies('),'No silent generic fallback for these sessions');
assert.ok(source.includes("if(exactWordSession)pedagogy=reviewedBm1.build("),'Proven Word route must remain intact');
assert.ok(source.indexOf('const validation=validateRphMap(map,ev,built)')<source.indexOf('const needsW29Plan='),'Accuracy Gate must precede source-plan routing');
assert.ok(loader.includes('rph-bm1-week29-source-plans.js?v=20261009i'));
assert.ok(source.includes("if(ped?.sourcePlanBm1)"),'Pedagogy provenance must be apparent');
console.log('BM1 Week 29 source-grounded session 1,3,4 native cards, PBD and source scope PASS');
