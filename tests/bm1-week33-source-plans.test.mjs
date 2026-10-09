import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const root=new URL('../',import.meta.url);
const c={console:{warn(){},info(){}},rphSubjectKey:()=> 'bm'};
c.window=c;c.globalThis=c;vm.createContext(c);
for(const file of ['rph-bm-year1-canonical-production.js','rph-bm1-week33-source-plans.js']){
 vm.runInContext(fs.readFileSync(new URL(file,root),'utf8'),c,{filename:file});
}
const api=c.BmYear1Week33SourcePlans;
assert.ok(api);
assert.equal(api.VERSION,'BM1-W33-SOURCE-PLANS-20261009d');
assert.deepEqual(Array.from(api.availableSessions),[1,2,3,4,5]);
const fixtures=[
 {session:1,title:'Buku Skrap Kakak',page:128,sp:'5.3.1',
  txt:'Buku Skrap Kakak. Ayat Penyata. Pokok Periuk Kera ialah sejenis tumbuhan liar. Pokok ini tumbuh dalam hutan di Malaysia. Kita perlu memelihara pokok ini.',
  expect:[/ayat penyata/i,/pokok periuk kera/i,/tiga ayat/i]},
 {session:2,title:'Program Hari Hijau',page:129,sp:'1.1.2',
  txt:'Program Hari Hijau. Anita kamu boleh juga membawa bunga untuk hiasan atas meja. Murid-murid esok ada program, kamu perlu membawa kain lap.',
  expect:[/pesanan/i,/kain lap/i,/anita/i]},
 {session:3,title:'Jimatkan Tenaga + PKJR',page:130,sp:'2.3.1',
  txt:'Jimatkan Tenaga. Indira dan ayah berbual tentang cara menjimat elektrik. Kita hendaklah menutup suis lampu dan kipas apabila meninggalkan rumah.',
  expect:[/tiga maklumat/i,/dua amalan/i,/suis lampu/i]},
 {session:4,title:'Beg Mesra Alam',page:131,sp:'3.3.1',
  txt:'Beg Mesra Alam. Beg ini diperbuat daripada tumbuhan. Beg ringan dan nipis mudah dibawa. Boleh dicuci dan dikitar semula.',
  expect:[/karangan terkawal/i,/lima fakta/i,/boleh dicuci/i]},
 {session:5,title:'Menaiki Komuter',page:132,sp:'5.3.1',
  txt:'Menaiki Komuter. Ayat Perintah. Jangan bangun lewat. Sila beratur sebelum menaiki komuter. Abang tolong beli tiket di kaunter.',
  expect:[/ayat perintah/i,/jangan bangun lewat/i,/sila beratur/i,/tolong beli/i]}
];
for(const f of fixtures){
 const m={subject_key:'bm',year:1,academic_year:2026,week_no:33,session_no:f.session,
  title:f.title,sp:f.sp,sk:f.sp.split('.').slice(0,2).join('.'),
  textbook_page_start:f.page,textbook_page_end:f.page,
  verification_status:'verified',week_exact:true,sp_crosscheck:true,
  objective:'Objektif sebenar Lesson Map BM1 M33 S'+f.session,
  success_criteria:'Kriteria sebenar Lesson Map mengikut buku',
  source_activities:'Buku Teks m/s '+f.page+': '+f.title,
  source_evidence:{meta:{main_sp:f.sp,session_exact:true,page_route_verified:true,
   mapping_status:'bulk-draft-needs-teacher-review'},textbook:{text:f.txt}}
 };
 const opt={subjectKey:'bm',lessonTime:'08:00–08:30'};
 assert.equal(api.applies(m,opt),true,'Verified exact W33 evidence must match S'+f.session);
 const p=api.build(m,opt);
 assert.equal(p.sourcePlanSession,'BM1-2026B-W33-S'+f.session);
 assert.equal(p.sourcePlanVersion,api.VERSION);
 assert.equal(p.sourcePlanTeacherReviewNeeded,true);
 assert.equal(p.sourcePlanReviewStatus,'LESSON_MAP_EVIDENCE_NOT_WORD_APPROVED');
 assert.equal(p.reviewedReferenceBm1,undefined);
 assert.equal(p.canonicalBm1,true);
 assert.equal(p.sourcePlanBm1,true);
 assert.equal(p.sourceSteps.length,6);
 assert.ok(p.sourceSteps.every(x=>x.key.includes('w33-s'+f.session)));
 assert.ok(p.sourceSteps.every(x=>x.minutes===undefined),'No invented phase timings');
 assert.ok(p.sourceSteps.every(x=>x.text.includes('Tindakan guru:')&&x.text.includes('Tindakan murid:')
   &&x.text.includes('Semakan:')&&x.bbm==='Buku Teks m/s '+f.page));
 assert.ok(p.penutup.includes('Tindakan guru:'));
 assert.ok(p.pbdEvidence.method&&p.pbdEvidence.evidence&&p.pbdEvidence.criterion);
 assert.ok(p.reflection.includes('Susulan:'));
 assert.equal(p.page,'m/s '+f.page);assert.equal(p.mainSp,f.sp);
 for(const key of ['support','core','challenge']){
  const d=p.differentiation[key];
  assert.ok(d.teacher.length===2&&d.pupil_steps.length>=3);
  assert.ok(d.task&&d.example.teacher&&d.example.pupil);
  assert.ok(d.product&&d.criterion&&d.next_step);
  assert.equal(p.librarySteps[key].length,1);
 }
 for(const re of f.expect)assert.match(JSON.stringify(p),re);
 if(f.session===3){
  assert.equal(p.pkjrStatus,'PKJR_TITLE_ONLY_NO_VERIFIED_PKJR_SOURCE');
  assert.ok(p.sourceTask.includes('PKJR belum dibuktikan'));
  assert.ok(!JSON.stringify(p).includes('latihan lintasan zebra'),'No fabricated PKJR');
 }else assert.equal(p.pkjrStatus,null);
 if(f.session===5){
  assert.ok(p.sourceSteps[3].text.includes('ayat murid'));
  assert.ok(p.sourceSteps[0].text.includes('ayat tanya'));
 }
 for(const [label,bad] of [
  ['subject',{...m,subject_key:'en'}],
  ['year',{...m,year:2}],
  ['week',{...m,week_no:32}],
  ['session',{...m,session_no:f.session===5?1:f.session+1}],
  ['title',{...m,title:'Lain'}],
  ['SP',{...m,sp:'9.9.9'}],
  ['BT',{...m,textbook_page_start:999}],
  ['verified',{...m,verification_status:'needs_review'}],
  ['route',{...m,source_evidence:{meta:{...m.source_evidence.meta,page_route_verified:false},textbook:{text:f.txt}}}],
  ['source',{...m,source_evidence:{meta:m.source_evidence.meta,textbook:{text:'Bahan lain'}}}]
 ]){
  const checkedOpt=label==='subject'?{subjectKey:'en',lessonTime:'08:00–08:30'}:opt;
  assert.equal(api.applies(bad,checkedOpt),false,'Must reject wrong '+label+' S'+f.session);
  assert.throws(()=>api.build(bad,checkedOpt),/BM1_WEEK33_SOURCE_PLAN_SCOPE_MISMATCH/);
 }
}
const app=fs.readFileSync(new URL('app-v03334-original.js',root),'utf8');
const loader=fs.readFileSync(new URL('app-v03334.js',root),'utf8');
assert.ok(loader.includes('rph-bm1-week33-source-plans.js?v=20261009g'));
assert.ok(app.includes('if(needsW33Plan&&!w33Plans?.applies('));
assert.ok(app.includes('if(needsW33Plan)pedagogy=w33Plans.build('));
assert.ok(app.indexOf('const validation=validateRphMap(map,ev,built)')<app.indexOf('const needsW33Plan='));
assert.ok(app.includes('if(exactWordSession)pedagogy=reviewedBm1.build('));
assert.ok(app.includes('if(needsW32Plan)pedagogy=w32Plans.build('));
assert.ok(app.includes('data-rph-renderer="ag-v1"'));
assert.ok(app.includes('PERLU SEMAKAN GURU'));
console.log('BM1 Week33 S1-S5 textbook evidence, PBD, A-G and teacher review tests PASS');
