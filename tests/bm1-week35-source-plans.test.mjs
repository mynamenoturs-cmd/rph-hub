import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const root=new URL('../',import.meta.url);
const env={console:{info(){},warn(){}},rphSubjectKey:()=> 'bm'};
env.window=env;env.globalThis=env;vm.createContext(env);
for(const file of ['rph-bm-year1-canonical-production.js','rph-bm1-week35-source-plans.js'])
 vm.runInContext(fs.readFileSync(new URL(file,root),'utf8'),env,{filename:file});
const api=env.BmYear1Week35SourcePlans;
assert.equal(api.VERSION,'BM1-W35-SOURCE-PLANS-20261009f');
assert.deepEqual(Array.from(api.availableSessions),[1,2,3,4,5]);
const data=[
 {session:1,title:'Wang untuk Aimi',sp:'1.2.1',page:138,
  txt:'Wang untuk Aimi. Aimi ini wang saku kamu. Saya akan menyimpan wang yang lebih dalam tabung. Gunakanlah wang ini secara berhemah.',
  terms:[/wang saku/i,/sebutan/i,/tiga respons/i,/tabung/i]},
 {session:2,title:'Rajin Menabung',sp:'2.2.1',page:139,
  txt:'Rajin Menabung. Rani dan abangnya menyimpan sebelum berbelanja. Idea tersurat: Rani menyimpan. Idea tersirat: Rani berjimat-cermat.',
  terms:[/dua idea tersurat/i,/dua idea tersirat/i,/mendermakan/i]},
 {session:3,title:'Membeli Alat Tulis',sp:'3.3.2',page:140,
  txt:'Membeli Alat Tulis. Jamil membeli buku latehan. Baki wang tingal. Jamil berkata aya fikir. Tidak cukop untuk membeli di kentin.',
  terms:[/latehan/i,/latihan/i,/tingal/i,/tinggal/i,/cukop/i,/cukup/i,/kentin/i,/kantin/i,/lima kesalahan/i]},
 {session:4,title:'Di Pejabat Pos',sp:'5.2.1',page:141,
  txt:'Di Pejabat Pos. Imbuhan Awalan dan Akhiran. Ayah Hardip mengambil nombor gilir an untuk membuat bayar an. Dia mem bayar bil.',
  terms:[/berbual/i,/awalan/i,/akhiran/i,/bayaran/i,/giliran/i]},
 {session:5,title:'Barangan dan Perkhidmatan',sp:'5.2.2',page:142,
  txt:'Barangan dan Perkhidmatan. Kata Majmuk. Pasar raya. Tali pinggang, alat tulis, nasi ayam dan tengah hari.',
  terms:[/kata majmuk/i,/lima kata majmuk/i,/tiga ayat/i,/pasar raya/i,/tali pinggang/i]}
];
for(const f of data){
 const map={
  subject_key:'bm',year:1,academic_year:2026,week_no:35,session_no:f.session,
  title:f.title,sp:f.sp,sk:f.sp.slice(0,3),
  textbook_page_start:f.page,textbook_page_end:f.page,
  verification_status:'verified',week_exact:true,sp_crosscheck:true,
  objective:'Objektif verified berdasarkan buku S'+f.session,
  success_criteria:'Kriteria buku S'+f.session,
  source_activities:'BT m/s '+f.page+' '+f.title,
  source_evidence:{meta:{main_sp:f.sp,session_exact:true,page_route_verified:true},
   textbook:{text:f.txt}}
 };
 const opts={subjectKey:'bm',lessonTime:'30 minit'};
 assert.equal(api.applies(map,opts),true,'Verified exact source W35 S'+f.session);
 const ped=api.build(map,opts);
 assert.equal(ped.sourcePlanSession,'BM1-2026B-W35-S'+f.session);
 assert.equal(ped.sourcePlanVersion,api.VERSION);
 assert.equal(ped.sourcePlanReviewStatus,'LESSON_MAP_EVIDENCE_NOT_WORD_APPROVED');
 assert.equal(ped.sourcePlanTeacherReviewNeeded,true);
 assert.equal(ped.reviewedReferenceBm1,undefined,'Never fake teacher-approved Word status');
 assert.equal(ped.canonicalBm1,true);
 assert.equal(ped.sourcePlanBm1,true);
 assert.equal(ped.sourceSteps.length,6,'Six source-specific teacher-designed phases');
 assert.ok(ped.sourceSteps.every(x=>x.key.includes('w35-s'+f.session)));
 assert.ok(ped.sourceSteps.every(x=>x.minutes===undefined),'No invented minutes for phases');
 assert.ok(ped.sourceSteps.every(x=>x.text.includes('Tindakan guru:')
  &&x.text.includes('Tindakan murid:')&&x.text.includes('Semakan:')
  &&x.bbm==='Buku Teks m/s '+f.page));
 assert.ok(ped.penutup.includes('Tindakan guru:'));
 assert.ok(ped.pbdEvidence.method&&ped.pbdEvidence.evidence&&ped.pbdEvidence.criterion);
 assert.ok(ped.reflection.includes('Susulan:'));
 assert.equal(ped.page,'m/s '+f.page);
 assert.equal(ped.mainSp,f.sp);
 for(const key of ['support','core','challenge']){
  const lane=ped.differentiation[key];
  assert.ok(lane.teacher.length>=2&&lane.pupil_steps.length>=3);
  assert.ok(lane.example.teacher&&lane.example.pupil&&lane.product&&lane.criterion&&lane.next_step);
  assert.equal(ped.librarySteps[key].length,1);
  assert.ok(ped.librarySteps[key][0].text.includes(lane.task));
 }
 for(const re of f.terms)assert.match(JSON.stringify(ped),re);
 if(f.session===1){
  assert.ok(JSON.stringify(ped).includes('jangan mereka-reka nilai syiling') ||
   JSON.stringify(ped).includes('jangan mereka-reka nilai'));
 }
 if(f.session===2){
  assert.match(ped.pbdEvidence.criterion,/tersurat/);
  assert.match(ped.pbdEvidence.criterion,/tersirat/);
 }
 if(f.session===3){
  assert.ok(JSON.stringify(ped).includes('pengiraan matematik'));
  assert.match(ped.pbdEvidence.evidence,/latehan→latihan/);
  assert.match(ped.pbdEvidence.evidence,/pikir→fikir/);
 }
 if(f.session===4){
  assert.match(ped.sourceSteps[1].text,/OCR/);
  assert.match(ped.pbdEvidence.method,/perbualan individu/);
 }
 if(f.session===5){
  assert.match(JSON.stringify(ped),/membeli-belah/);
  assert.match(ped.pbdEvidence.criterion,/tiga ayat/);
 }
 for(const [label,bad] of [
  ['year',{...map,year:2}],['week',{...map,week_no:34}],
  ['session',{...map,session_no:f.session===5?1:f.session+1}],
  ['title',{...map,title:'Subjek lain'}],
  ['SP',{...map,sp:'9.9.9'}],
  ['page',{...map,textbook_page_start:1}],
  ['unverified',{...map,verification_status:'needs_review'}],
  ['route',{...map,source_evidence:{meta:{...map.source_evidence.meta,page_route_verified:false},textbook:{text:f.txt}}}],
  ['missing textbook',{...map,source_evidence:{meta:map.source_evidence.meta,textbook:{text:'tiada bukti'}}}]
 ]){
  assert.equal(api.applies(bad,opts),false,label+' rejected W35 S'+f.session);
  assert.throws(()=>api.build(bad,opts),/BM1_WEEK35_SOURCE_PLAN_SCOPE_MISMATCH/);
 }
 assert.equal(api.applies(map,{subjectKey:'en'}),false);
}
const source=fs.readFileSync(new URL('app-v03334-original.js',root),'utf8');
const loader=fs.readFileSync(new URL('app-v03334.js',root),'utf8');
assert.ok(loader.includes('rph-bm1-week35-source-plans.js?v=20261009j'));
assert.ok(source.includes('if(needsW35Plan&&!w35Plans?.applies('));
assert.ok(source.includes('if(needsW35Plan)pedagogy=w35Plans.build('));
assert.ok(source.indexOf('const validation=validateRphMap(map,ev,built)')<source.indexOf('const needsW35Plan='));
assert.ok(source.includes('if(exactWordSession)pedagogy=reviewedBm1.build('));
assert.ok(source.includes('if(needsW34Plan)pedagogy=w34Plans.build('));
assert.ok(source.includes('data-rph-renderer="ag-v1"'));
assert.ok(source.includes('PERLU SEMAKAN GURU'));
console.log('BM1 W35 five exact source-specific tasks, PBD differentiation and A–G guards PASS');
