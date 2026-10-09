import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const base=new URL('../',import.meta.url);
const c={console:{warn(){},info(){}},rphSubjectKey:()=> 'bm'};c.window=c;c.globalThis=c;
vm.createContext(c);
for(const file of ['rph-bm-year1-canonical-production.js','rph-bm1-week27-source-plans.js'])
 vm.runInContext(fs.readFileSync(new URL(file,base),'utf8'),c,{filename:file});
const api=c.BmYear1Week27SourcePlans;
assert.equal(api.VERSION,'BM1-W27-SOURCE-PLANS-20261009j');
assert.deepEqual(Array.from(api.availableSessions),[1,2,3,4,5]);
const fixtures=[
 {s:1,title:'Ingat Pesanan Cikgu',sp:'1.1.2',page:98,
  text:'Ingat Pesanan Cikgu. Esok bawa batu kecil, gelas plastik, duit syiling, penyedut minuman dan tudung botol. Kita akan melakukan uji kaji sains.',
  expected:[/pesanan/i,/respons lisan/i,/gelas plastik/i]},
 {s:2,title:'Tenggelam dan Timbul',sp:'2.2.1',page:99,
  text:'Tenggelam dan Timbul. Batu dan duit syiling tenggelam dalam air. Penyedut minuman dan tudung botol timbul di permukaan.',
  expected:[/inferens/i,/tenggelam/i,/timbul/i]},
 {s:3,title:'Kenali Anggota Badan Kita',sp:'3.2.1',page:100,
  text:'Kenali Anggota Badan Kita. Badan kita terdiri daripada kepala, badan, tangan dan kaki. Mari kita labelkan.',
  expected:[/empat perkataan/i,/kepala/i,/tangan/i,/kaki/i]},
 {s:4,title:'Menulis + PKJR',sp:'3.2.1',page:101,
  text:'Membina dan menulis frasa. Mata ialah deria lihat. Telinga ialah deria dengar. Tangan ialah deria sentuh. Hidung deria bau, lidah deria rasa.',
  expected:[/empat frasa/i,/deria bau/i,/deria dengar/i]},
 {s:5,title:'Sains Perubatan',sp:'5.3.1',page:102,
  text:'Sains Perubatan. Ayat Perintah. Sila makan ubat mengikut aturan. Jangan minum minuman berais. Tolong simpan ubat di tempat selamat.',
  expected:[/ayat perintah/i,/sila/i,/jangan/i,/tolong/i]}
];
const built=[];
for(const f of fixtures){
 const map={subject_key:'bm',year:1,academic_year:2026,week_no:27,session_no:f.s,title:f.title,
  sp:f.sp,sk:f.sp.slice(0,3),textbook_page_start:f.page,textbook_page_end:f.page,
  verification_status:'verified',week_exact:true,sp_crosscheck:true,objective:'Verified objective',
  success_criteria:'Verified criterion',source_activities:'Buku Teks m/s '+f.page+': '+f.title,
  source_evidence:{meta:{main_sp:f.sp,session_exact:true,page_route_verified:true,
    mapping_status:'bulk-draft-needs-teacher-review'},textbook:{text:f.text}}
 };
 const opts={subjectKey:'bm',lessonTime:'08:00–08:30'};
 assert.equal(api.applies(map,opts),true,'Expected exact verified W27 S'+f.s);
 const p=api.build(map,opts);built.push(p);
 assert.equal(p.canonicalBm1,true);
 assert.equal(p.sourcePlanBm1,true);
 assert.equal(p.sourcePlanSession,'BM1-2026B-W27-S'+f.s);
 assert.equal(p.sourcePlanReviewStatus,'LESSON_MAP_EVIDENCE_NOT_WORD_APPROVED');
 assert.equal(p.sourcePlanTeacherReviewNeeded,true);
 assert.equal(p.reviewedReferenceBm1,undefined);
 assert.equal(p.sourceSteps.length,6);
 assert.ok(p.sourceSteps.every(x=>x.key.includes('w27-s'+f.s)));
 assert.ok(p.sourceSteps.every(x=>x.minutes===undefined));
 assert.ok(p.sourceSteps.every(x=>x.text.includes('Tindakan guru:')
    &&x.text.includes('Tindakan murid:')&&x.text.includes('Semakan:')
    &&x.bbm==='Buku Teks m/s '+f.page));
 assert.ok(p.pbdEvidence.method&&p.pbdEvidence.evidence&&p.pbdEvidence.criterion);
 assert.ok(p.reflection.includes('Susulan:'));
 assert.equal(p.page,'m/s '+f.page);
 assert.equal(p.mainSp,f.sp);
 for(const lane of ['support','core','challenge']){
   const x=p.differentiation[lane];
   assert.ok(x.task&&x.teacher.length>=2&&x.pupil_steps.length>=3&&x.example.teacher&&x.example.pupil);
   assert.ok(x.product&&x.criterion&&x.next_step);
   assert.equal(p.librarySteps[lane].length,1);
 }
 for(const term of f.expected)assert.match(JSON.stringify(p),term);
 assert.equal(p.pkjrStatus,f.s===4?'PKJR_TITLE_ONLY_NO_VERIFIED_PKJR_SOURCE':null);
 if(f.s===2)assert.match(JSON.stringify(p),/bukan hukum sejagat/);
 if(f.s===3)assert.match(JSON.stringify(p),/OCR/);
 if(f.s===5){
   assert.match(JSON.stringify(p),/bukan nasihat perubatan/i);
   assert.ok(!JSON.stringify(p).includes('dos ubat atau amalan rawatan')||
    JSON.stringify(p).includes('jangan mereka-reka'));
 }
 for(const [label,bad] of [
  ['year',{...map,year:2}],['week',{...map,week_no:28}],
  ['session',{...map,session_no:f.s===5?1:f.s+1}],
  ['SP',{...map,sp:'9.9.9'}],['title',{...map,title:'Buku berbeza'}],
  ['page',{...map,textbook_page_start:999}],['unverified',{...map,verification_status:'needs_review'}],
  ['missing-evidence',{...map,source_evidence:{meta:map.source_evidence.meta,textbook:{text:'Unrelated'}}}],
  ['route',{...map,source_evidence:{meta:{...map.source_evidence.meta,page_route_verified:false},textbook:{text:f.text}}}]
 ]){
  assert.equal(api.applies(bad,opts),false,'Reject '+label+' S'+f.s);
  assert.throws(()=>api.build(bad,opts),/BM1_WEEK27_SOURCE_PLAN_SCOPE_MISMATCH/);
 }
 assert.equal(api.applies(map,{subjectKey:'en'}),false);
}
assert.notEqual(built[0].sourceTask,built[1].sourceTask);
assert.notEqual(built[2].sourceTask,built[3].sourceTask);
assert.notEqual(built[3].pbdEvidence.method,built[4].pbdEvidence.method);
const app=fs.readFileSync(new URL('app-v03334-original.js',base),'utf8');
const loader=fs.readFileSync(new URL('app-v03334.js',base),'utf8');
assert.ok(loader.includes('rph-bm1-week27-source-plans.js?v=20261009j'));
assert.ok(app.includes('if(needsW27Plan&&!w27Plans?.applies('));
assert.ok(app.includes('if(needsW27Plan)pedagogy=w27Plans.build('));
assert.ok(app.indexOf('const validation=validateRphMap(map,ev,built)')<app.indexOf('const needsW27Plan='));
assert.ok(app.includes('if(exactWordSession)pedagogy=reviewedBm1.build('));
assert.ok(app.includes('data-rph-renderer="ag-v1"'));
assert.ok(app.includes('PERLU SEMAKAN GURU'));
console.log('BM1 W27 S1–S5 exact source tasks and individual PBD regression PASS');
