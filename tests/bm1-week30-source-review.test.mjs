// Regression: BM1 M30 ialah ulang kaji khusus, bukan pengulangan langkah M29.
// Kesemua bukti adalah daripada Lesson Map + Buku Teks m/s 109 atau 111.
// Tiada kandungan PKJR baharu disahkan daripada judul semata-mata.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const root=new URL('../',import.meta.url);
const sandbox={console:{info(){},warn(){}},rphSubjectKey:()=> 'bm'};
sandbox.window=sandbox;sandbox.globalThis=sandbox;
vm.createContext(sandbox);
for(const f of ['rph-bm-year1-canonical-production.js','rph-bm1-week29-source-plans.js','rph-bm1-week30-source-review.js']){
  vm.runInContext(fs.readFileSync(new URL(f,root),'utf8'),sandbox,{filename:f});
}
const api=sandbox.BmYear1Week30SourceReview;
const w29=sandbox.BmYear1Week29SourcePlans;
assert.equal(api.VERSION,'BM1-W30-SOURCE-REVIEW-20261009a');
assert.deepEqual(Array.from(api.availableSessions),[1,2]);
const fixtures=[
 {session:1,title:'Penyiram Pokok Inovasi (Ulangkaji)',page:109,sp:'1.2.2',
 text:'109 Penyiram Pokok Inovasi tebuk lubang Benamkan di dalam tanah. Penyiram menjimatkan air dan tahan lama.',
 assertTerms:[/Semak semula label dan urutan gambar/,/penambahbaikan/,/respons lisan/]},
 {session:2,title:'Wah, Mudahnya! (Ulangkaji)+PKJR',page:111,sp:'3.2.1',
 text:'111 Wah, Mudahnya! Penanda buku pintar memudahkan Kalang mengikut jadual waktu. Isnin Bahasa Melayu Bahasa Inggeris.',
 assertTerms:[/tiga ayat/,/jadual/,/pembetulan/]}
];
for(const f of fixtures){
 const m={
  subject_id:'bm-id',subject_key:'bm',year:1,academic_year:2026,
  week_no:30,session_no:f.session,title:f.title,sp:f.sp,sk:f.sp.slice(0,3),
  textbook_page_start:f.page,textbook_page_end:f.page,
  verification_status:'verified',week_exact:true,sp_crosscheck:true,confidence_score:100,
  objective:'Murid dapat melaksanakan tugasan sumber m/s '+f.page+'.',
  success_criteria:'Murid melaksanakan tugasan sumber dengan tepat.',
  source_activities:'Buku Teks m/s '+f.page+': '+f.title,
  source_evidence:{meta:{main_sp:f.sp,session_exact:true,page_route_verified:true},
    textbook:{text:f.text}}
 };
 const opts={subjectKey:'bm',lessonTime:'08:00–08:30'};
 assert.equal(api.applies(m,opts),true,'Only the exact verified source map may match M30 S'+f.session);
 const ped=api.build(m,opts);
 assert.equal(ped.canonicalBm1,true);
 assert.equal(ped.sourcePlanBm1,true);
 assert.equal(ped.sourcePlanReviewStatus,'LESSON_MAP_EVIDENCE_NOT_WORD_APPROVED');
 assert.equal(ped.reviewedReferenceBm1,undefined);
 assert.equal(ped.sourceSteps.length,6,'Six distinct phases for each reviewed session');
 assert.equal(ped.sourcePlanSession,'BM1-2026B-W30-S'+f.session);
 assert.equal(ped.sourceSteps.some(s=>s.key.startsWith('bm1-w29-')),false,'Do not present old W29 phases as M30');
 assert.equal(ped.sourceSteps.every(s=>s.minutes===undefined),true,'Do not invent phase minutes from source OCR');
 assert.equal(ped.sourceSteps.every(s=>s.text.includes('Tindakan guru:')&&s.text.includes('Tindakan murid:')
    &&s.text.includes('Semakan:')&&s.bbm.includes('Buku Teks m/s '+f.page)),true);
 for(const k of ['support','core','challenge']){
   const lane=ped.differentiation[k];
   assert.ok(lane.teacher.length===2&&lane.pupil_steps.length>=3&&lane.criterion&&lane.next_step&&lane.example.pupil);
   assert.equal(ped.librarySteps[k].length,1);
 }
 assert.ok(ped.inductionData.text.includes('Tindakan guru:'));
 assert.ok(ped.penutup.includes('Tindakan murid:'));
 assert.ok(ped.pbdEvidence.evidence&&ped.pbdEvidence.method&&ped.pbdEvidence.criterion);
 assert.ok(ped.reflection.includes('Susulan:'));
 assert.equal(ped.mainSp,f.sp);
 assert.equal(ped.page,'m/s '+f.page);
 for(const re of f.assertTerms)assert.match(JSON.stringify(ped),re);
 if(f.session===1){
  assert.match(ped.sourceSteps[0].name,/Imbas semula/);
  assert.notEqual(ped.phases[0].name,'Kenali gambar dan tajuk','W30 must not repeat the W29 induction');
  assert.match(ped.pbdEvidence.method,/sebelum dan selepas/);
  assert.equal(ped.pkjrStatus,null);
 } else {
  assert.match(ped.sourceSteps[2].name,/ayat yang perlu dibetulkan/);
  assert.equal(ped.pkjrStatus,'PKJR_TITLE_ONLY_NO_VERIFIED_PKJR_SOURCE');
  assert.ok(!JSON.stringify(ped).includes('peraturan melintas jalan'),'Never invent a PKJR task without a source');
  assert.ok(ped.sourceTask.includes('memerlukan sumber berasingan'));
 }
 for(const [bad,map] of [
  ['tahun',{...m,year:2}],['minggu',{...m,week_no:29}],
  ['sesi',{...m,session_no:3}],['tajuk',{...m,title:'Bukan tajuk sah'}],
  ['SP',{...m,sp:'5.3.2'}],['page',{...m,textbook_page_start:115}],
  ['source',{...m,source_evidence:{meta:m.source_evidence.meta,textbook:{text:'tiada bukti'}}}],
  ['gate',{...m,verification_status:'needs_review'}],
  ['evidence',{...m,source_evidence:{meta:{...m.source_evidence.meta,page_route_verified:false},textbook:{text:f.text}}}]
 ]){
  assert.equal(api.applies(map,opts),false,'Scope '+bad+' rejected S'+f.session);
  assert.throws(()=>api.build(map,opts),/BM1_WEEK30_SOURCE_REVIEW_SCOPE_MISMATCH/);
 }
 assert.equal(api.applies(m,{subjectKey:'en'}),false);
}
const source=fs.readFileSync(new URL('app-v03334-original.js',root),'utf8');
const loader=fs.readFileSync(new URL('app-v03334.js',root),'utf8');
assert.ok(loader.includes('rph-bm1-week30-source-review.js?v=20261009e'));
assert.ok(source.includes('if(needsW30Review&&!w30Review?.applies('));
assert.ok(source.includes('if(needsW30Review)pedagogy=w30Review.build('));
assert.ok(source.indexOf('const validation=validateRphMap(map,ev,built)')<source.indexOf('const needsW30Review='),'Accuracy Gate must run before override');
assert.ok(source.indexOf('if(exactWordSession)pedagogy=reviewedBm1.build(')<source.indexOf('if(needsW30Review)pedagogy=w30Review.build('));
assert.ok(source.includes('PKJR BELUM BERBUKTI'),'PKJR title-only evidence must remain explicit');
assert.ok(source.includes('data-rph-renderer="ag-v1"'));
console.log('BM1 Week 30 source-grounded revision, no source invention, exact routing: PASS');
