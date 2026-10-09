import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const base=new URL('../',import.meta.url),ctx={console:{info(){},warn(){}},rphSubjectKey:()=> 'bm'};
ctx.window=ctx;ctx.globalThis=ctx;vm.createContext(ctx);
for(const name of ['rph-bm-year1-canonical-production.js','rph-bm1-week34-source-plans.js']){
 vm.runInContext(fs.readFileSync(new URL(name,base),'utf8'),ctx,{filename:name});
}
const api=ctx.BmYear1Week34SourcePlans;
assert.equal(api.VERSION,'BM1-W34-SOURCE-PLANS-20261009e');
assert.deepEqual(Array.from(api.availableSessions),[1,2,3]);
const fixtures=[
 {s:1,title:'Aku Senaskhah Surat Khabar',sp:'5.3.1',page:133,
  txt:'Aku Senaskhah Surat Khabar. Ayat Seruan. Hai, kawan! Wah, cantiknya saya! Aduh, sakitnya saya! Gembiranya saya telah berbakti!',
  expected:[/ayat seruan/i,/tanda seru/i,/tiga ayat/i]},
 {s:2,title:'Pengayaan – Ayat Penyata',sp:'5.3.1',page:134,
  txt:'Pemulihan Pengayaan. Tulis ayat penyata berdasarkan gambar. Menanam anak pokok, menyiram dengan air hujan yang ditadah, pokok dibaja hidup subur.',
  expected:[/ayat penyata/i,/gambar/i,/tiga ayat/i]},
 {s:3,title:'Tong Kitar Semula + PKJR',sp:'2.3.1',page:136,
  txt:'Tong Kitar Semula. Tiga tong kitar semula warna biru untuk kertas, coklat untuk kaca, jingga untuk aluminium dan plastik. Tong ini menjaga kebersihan.',
  expected:[/tong kitar semula/i,/biru/i,/coklat/i,/jingga/i,/tiga maklumat/i]}
];
for(const f of fixtures){
 const map={subject_key:'bm',year:1,academic_year:2026,week_no:34,session_no:f.s,
  title:f.title,sk:f.sp.slice(0,3),sp:f.sp,verification_status:'verified',
  week_exact:true,sp_crosscheck:true,textbook_page_start:f.page,textbook_page_end:f.page,
  objective:'Objektif sebenar Lesson Map',success_criteria:'Kriteria berasaskan Buku Teks',
  source_activities:'Buku Teks m/s '+f.page,
  source_evidence:{meta:{main_sp:f.sp,session_exact:true,page_route_verified:true,
    mapping_status:'bulk-draft-needs-teacher-review'},textbook:{text:f.txt}}
 };
 const opts={subjectKey:'bm',lessonTime:'30 minit'};
 assert.equal(api.applies(map,opts),true,'Verified W34 match S'+f.s);
 const p=api.build(map,opts);
 assert.equal(p.sourcePlanSession,'BM1-2026B-W34-S'+f.s);
 assert.equal(p.sourcePlanTeacherReviewNeeded,true);
 assert.equal(p.sourcePlanReviewStatus,'LESSON_MAP_EVIDENCE_NOT_WORD_APPROVED');
 assert.equal(p.reviewedReferenceBm1,undefined);
 assert.equal(p.canonicalBm1,true);assert.equal(p.sourcePlanBm1,true);
 assert.equal(p.sourceSteps.length,6);
 assert.ok(p.sourceSteps.every(x=>x.key.includes('w34-s'+f.s)));
 assert.ok(p.sourceSteps.every(x=>x.minutes===undefined),'No invented phase minutes');
 assert.ok(p.sourceSteps.every(x=>x.text.includes('Tindakan guru:')&&x.text.includes('Tindakan murid:')
  &&x.text.includes('Semakan:')&&x.bbm==='Buku Teks m/s '+f.page));
 assert.equal(p.page,'m/s '+f.page);assert.equal(p.mainSp,f.sp);
 assert.ok(p.pbdEvidence.evidence&&p.pbdEvidence.method&&p.pbdEvidence.criterion);
 assert.ok(p.reflection.includes('Susulan:'));
 for(const key of ['support','core','challenge']){
  const g=p.differentiation[key];
  assert.ok(g.teacher.length===2&&g.pupil_steps.length>=3);
  assert.ok(g.task&&g.example.teacher&&g.example.pupil);
  assert.ok(g.product&&g.criterion&&g.next_step);
  assert.equal(p.librarySteps[key].length,1);
 }
 for(const re of f.expected)assert.match(JSON.stringify(p),re);
 if(f.s===1){
  assert.ok(JSON.stringify(p).includes('Apa khabar?'),'S1 must contrast a question with exclamations');
 }else if(f.s===2){
  assert.ok(JSON.stringify(p).includes('OCR'),'Image-to-phrase visual alignment must be guarded');
 }else{
  assert.equal(p.pkjrStatus,'PKJR_TITLE_ONLY_NO_VERIFIED_PKJR_SOURCE');
  assert.ok(p.sourceTask.includes('kandungan PKJR berasingan belum disahkan'));
 }
 for(const [label,bad] of [
  ['week',{...map,week_no:33}],
  ['year',{...map,year:2}],
  ['session',{...map,session_no:f.s===3?1:f.s+1}],
  ['title',{...map,title:'Buku berlainan'}],
  ['page',{...map,textbook_page_start:999}],
  ['sp',{...map,sp:'9.9.9'}],
  ['verification',{...map,verification_status:'needs_review'}],
  ['route',{...map,source_evidence:{meta:{...map.source_evidence.meta,page_route_verified:false},textbook:{text:f.txt}}}],
  ['textbook',{...map,source_evidence:{meta:map.source_evidence.meta,textbook:{text:'tiada petikan'}}}]
 ]){
  assert.equal(api.applies(bad,opts),false,'Reject '+label+' S'+f.s);
  assert.throws(()=>api.build(bad,opts),/BM1_WEEK34_SOURCE_PLAN_SCOPE_MISMATCH/);
 }
 assert.equal(api.applies(map,{subjectKey:'en'}),false);
}
const app=fs.readFileSync(new URL('app-v03334-original.js',base),'utf8');
const loader=fs.readFileSync(new URL('app-v03334.js',base),'utf8');
assert.ok(loader.includes('rph-bm1-week34-source-plans.js?v=20261009e'));
assert.ok(app.includes('if(needsW34Plan&&!w34Plans?.applies('));
assert.ok(app.includes('if(needsW34Plan)pedagogy=w34Plans.build('));
assert.ok(app.indexOf('const validation=validateRphMap(map,ev,built)')<app.indexOf('const needsW34Plan='));
assert.ok(app.includes('if(needsW33Plan)pedagogy=w33Plans.build('));
assert.ok(app.includes('data-rph-renderer="ag-v1"'));
console.log('BM1 W34 S1-S3 source evidence, differentiated PBD and native A-G PASS');
