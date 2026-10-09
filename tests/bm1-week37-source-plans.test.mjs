import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const base=new URL('../',import.meta.url);
const c={console:{info(){},warn(){}},rphSubjectKey:()=> 'bm'};
c.window=c;c.globalThis=c;vm.createContext(c);
for(const name of ['rph-bm-year1-canonical-production.js','rph-bm1-week37-source-plans.js'])
 vm.runInContext(fs.readFileSync(new URL(name,base),'utf8'),c,{filename:name});
const api=c.BmYear1Week37SourcePlans;
assert.equal(api.VERSION,'BM1-W37-SOURCE-PLANS-20261009h');
assert.deepEqual(Array.from(api.availableSessions),[1,2,3]);
const cases=[
 {session:1,title:'Membeli Baju Sukan',sp:'1.2.2',page:147,
  text:'Membeli Baju Sukan. Hardip dan Aimi. Baju sukan Wira dan Juara. Potongan harga 1 0 peratus RM8.90 dan RM9.90.',
  checks:[/tiga perbandingan/i,/juara/i,/wira/i,/warna/i,/potongan 10 peratus/i]},
 {session:2,title:'Membuat Pilihan',sp:'2.3.2',page:148,
  text:'Membuat Pilihan. Aimi hendak membeli buku latihan. Bekas air berwarna warni masih elok, ibu. Dia meletakkannya semula.',
  checks:[/tiga peristiwa/i,/tidak membeli bekas air/i,/aksi/i]},
 {session:3,title:'Catatan Jamil',sp:'3.2.3',page:149,
  text:'Catatan Jamil. Ayah RM5.00 dan ibu RM5.00. Hadiah RM5.00, majalah RM2.80. Baki RM2.20.',
  checks:[/rm10.00/i,/rm5.00/i,/rm2.80/i,/rm2.20/i,/lajur/i]}
];
const built=[];
for(const x of cases){
 const map={subject_key:'bm',year:1,academic_year:2026,week_no:37,session_no:x.session,title:x.title,
  sk:x.sp.split('.').slice(0,2).join('.'),sp:x.sp,textbook_page_start:x.page,textbook_page_end:x.page,
  verification_status:'verified',week_exact:true,sp_crosscheck:true,confidence_score:100,
  objective:'Objektif tepat sumber W37 S'+x.session,success_criteria:'Kriteria kejayaan asal',
  source_activities:'Buku Teks m/s '+x.page+': '+x.title,
  source_evidence:{meta:{main_sp:x.sp,session_exact:true,page_route_verified:true,
   mapping_status:'bulk-draft-needs-teacher-review'},textbook:{text:x.text}}
 };
 const opts={subjectKey:'bm',lessonTime:'08:00–08:30'};
 assert.equal(api.applies(map,opts),true,'W37 S'+x.session+' must match exact evidence');
 const p=api.build(map,opts);built.push(p);
 assert.equal(p.canonicalBm1,true);
 assert.equal(p.sourcePlanBm1,true);
 assert.equal(p.reviewedReferenceBm1,undefined);
 assert.equal(p.sourcePlanReviewStatus,'LESSON_MAP_EVIDENCE_NOT_WORD_APPROVED');
 assert.equal(p.sourcePlanTeacherReviewNeeded,true);
 assert.equal(p.sourcePlanSession,'BM1-2026B-W37-S'+x.session);
 assert.equal(p.sourceSteps.length,6);
 assert.ok(p.sourceSteps.every(z=>z.key.includes('w37-s'+x.session)));
 assert.ok(p.sourceSteps.every(z=>!('minutes' in z)),'No invented per-step minutes');
 assert.ok(p.sourceSteps.every(z=>z.text.includes('Tindakan guru:')&&z.text.includes('Tindakan murid:')
  &&z.text.includes('Semakan:')&&z.bbm==='Buku Teks m/s '+x.page));
 assert.ok(p.pbdEvidence.method&&p.pbdEvidence.evidence&&p.pbdEvidence.criterion);
 assert.ok(p.reflection.includes('Susulan:'));
 assert.equal(p.page,'m/s '+x.page);
 assert.equal(p.mainSp,x.sp);
 for(const k of ['support','core','challenge']){
  const d=p.differentiation[k];
  assert.ok(d.task&&d.teacher.length>=2&&d.pupil_steps.length>=3&&d.product&&d.criterion&&d.next_step);
  assert.ok(d.example.teacher&&d.example.pupil);
  assert.equal(p.librarySteps[k].length,1);
  assert.ok(p.librarySteps[k][0].text.includes(d.task));
 }
 for(const pat of x.checks)assert.match(JSON.stringify(p),pat);
 if(x.session===1)assert.ok(JSON.stringify(p).includes('OCR'),'Price/logo association must refer to source graphic');
 if(x.session===2)assert.ok(!JSON.stringify(p).includes('Aimi membayar bekas'),'Do not invent a purchase');
 if(x.session===3)assert.ok(p.pbdEvidence.evidence.includes('RM2.20'));
 for(const [label,bad] of [
  ['week',{...map,week_no:36}],
  ['session',{...map,session_no:x.session===3?1:x.session+1}],
  ['subject',{...map,subject_key:'en'}],
  ['year',{...map,year:2}],
  ['sp',{...map,sp:'9.9.9'}],
  ['page',{...map,textbook_page_start:159}],
  ['title',{...map,title:'Wrong book'}],
  ['verified',{...map,verification_status:'needs_review'}],
  ['route',{...map,source_evidence:{meta:{...map.source_evidence.meta,page_route_verified:false},textbook:{text:x.text}}}],
  ['text',{...map,source_evidence:{meta:map.source_evidence.meta,textbook:{text:'Some unrelated textbook'}}}]
 ]){
  const checkedOpts=label==='subject'?{subjectKey:'en'}:opts;
  assert.equal(api.applies(bad,checkedOpts),false,'W37 S'+x.session+' reject '+label);
  assert.throws(()=>api.build(bad,checkedOpts),/BM1_WEEK37_SOURCE_PLAN_SCOPE_MISMATCH/);
 }
}
assert.notEqual(built[0].sourceTask,built[1].sourceTask);
assert.notEqual(built[1].sourceTask,built[2].sourceTask);
assert.notEqual(built[0].pbdEvidence.method,built[2].pbdEvidence.method);
const app=fs.readFileSync(new URL('app-v03334-original.js',base),'utf8');
const loader=fs.readFileSync(new URL('app-v03334.js',base),'utf8');
assert.ok(loader.includes('rph-bm1-week37-source-plans.js?v=20261009h'));
assert.ok(app.includes('if(needsW37Plan&&!w37Plans?.applies('));
assert.ok(app.includes('if(needsW37Plan)pedagogy=w37Plans.build('));
assert.ok(app.includes('if(isBm1W37&&Number(map.session_no)===4)'),'S4 SP conflict must be blocked visibly');
assert.ok(app.includes('5.3.2 tetapi Buku Teks m/s 150 mencetak SP 5.3.3'),'SP mismatch must be explained');
assert.ok(app.indexOf('const validation=validateRphMap(map,ev,built)')<app.indexOf('const needsW37Plan='));
assert.ok(app.includes('if(exactWordSession)pedagogy=reviewedBm1.build('));
assert.ok(app.includes('data-rph-renderer="ag-v1"'));
console.log('BM1 Week37 S1–S3 specific-source, A–G, teacher-review and SP-conflict regression PASS');
