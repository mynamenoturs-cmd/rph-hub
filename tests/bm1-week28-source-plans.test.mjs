// Week28 source-first regression. Five exact lessons; no invented PKJR or pantun.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const root=new URL('../',import.meta.url);
const box={console:{info(){},warn(){}},rphSubjectKey:()=> 'bm'};
box.window=box;box.globalThis=box;
vm.createContext(box);
for(const f of ['rph-bm-year1-canonical-production.js','rph-bm1-week28-source-plans.js']){
 vm.runInContext(fs.readFileSync(new URL(f,root),'utf8'),box,{filename:f});
}
const api=box.BmYear1Week28SourcePlans;
assert.ok(api);
assert.equal(api.VERSION,'BM1-W28-SOURCE-PLANS-20261009i');
assert.deepEqual(Array.from(api.availableSessions),[1,2,3,4,5]);
const cases=[
 {n:1,title:'Kamus Elektronik',sp:'1.2.1',page:103,
  text:'Kamus Elektronik: sebutan perkataan tepat, pantas mencari makna perkataan, makna dalam pelbagai bahasa. Ringan dan mesra pengguna.',
  expect:[/sebutan perkataan tepat/i,/tiga respons/i,/bateri/i]},
 {n:2,title:'Kami Memudahkan Kerja',sp:'2.3.1',page:104,
  text:'Kami Memudahkan Kerja. Mesin basuh membasuh pakaian. Pembersih vakum dapat menyedut habuk. Kedua-dua menggunakan tenaga elektrik.',
  expect:[/mesin basuh/i,/pembersih vakum/i,/tiga maklumat/i]},
 {n:3,title:'Pintu Pagar Automatik + PKJR',sp:'3.2.1',page:106,
  text:'Pintu Pagar Automatik. Walaupun ibu menggunakan payung ketika hujan, badannya basah. Guna alat kawalan jauh untuk buka dan tutup secara automatik.',
  expect:[/tiga ayat/i,/kawalan jauh/i,/hujan/i]},
 {n:4,title:'Hebat Teknologi',sp:'4.2.1',page:107,
  text:'Hebat Teknologi. Membina pantun empat kerat dan melafazkan pantun. Teknologi berguna, kerja yang berat menjadi ringan.',
  expect:[/pantun empat kerat/i,/lafaz/i,/pelengkap/i]},
 {n:5,title:'Basikal Solar',sp:'5.3.1',page:108,
  text:'Basikal Solar. Ayat seruan. Wah, hebatnya basikal solar! Amboi, laju sungguh. Tenaga daripada cahaya matahari.',
  expect:[/ayat seruan/i,/tiga ayat/i,/amboi/i]}
];
for(const c of cases){
 const map={subject_key:'bm',year:1,academic_year:2026,week_no:28,session_no:c.n,
  title:c.title,sk:c.sp.split('.').slice(0,2).join('.'),sp:c.sp,
  textbook_page_start:c.page,textbook_page_end:c.page,verification_status:'verified',
  week_exact:true,sp_crosscheck:true,
  objective:'Objektif sah',success_criteria:'Kriteria sah',
  source_activities:'Buku Teks m/s '+c.page+': '+c.title,
  source_evidence:{meta:{main_sp:c.sp,session_exact:true,page_route_verified:true,
    mapping_status:'bulk-draft-needs-teacher-review'},textbook:{text:c.text}}
 };
 const opts={subjectKey:'bm',lessonTime:'08:00–08:30'};
 assert.equal(api.applies(map,opts),true,'W28 S'+c.n+' exact match');
 const out=api.build(map,opts);
 assert.equal(out.sourcePlanBm1,true);
 assert.equal(out.canonicalBm1,true);
 assert.equal(out.sourcePlanTeacherReviewNeeded,true);
 assert.equal(out.sourcePlanReviewStatus,'LESSON_MAP_EVIDENCE_NOT_WORD_APPROVED');
 assert.equal(out.reviewedReferenceBm1,undefined);
 assert.equal(out.sourcePlanSession,'BM1-2026B-W28-S'+c.n);
 assert.equal(out.sourceSteps.length,6);
 assert.ok(out.sourceSteps.every(p=>p.key.includes('w28-s'+c.n)&&!('minutes' in p)));
 assert.ok(out.sourceSteps.every(p=>p.text.includes('Tindakan guru:')&&p.text.includes('Tindakan murid:')
   &&p.text.includes('Semakan:')&&p.bbm==='Buku Teks m/s '+c.page));
 assert.equal(out.page,'m/s '+c.page);
 assert.equal(out.mainSp,c.sp);
 assert.ok(out.penutup.includes('Tindakan guru:'));
 assert.ok(out.pbdEvidence.method&&out.pbdEvidence.evidence&&out.pbdEvidence.criterion);
 assert.ok(out.reflection.includes('Susulan:'));
 for(const g of ['support','core','challenge']){
  const x=out.differentiation[g];
  assert.ok(x.teacher.length>=2&&x.pupil_steps.length>=3&&x.example.pupil);
  assert.ok(x.product&&x.criterion&&x.next_step);
  assert.equal(out.librarySteps[g].length,1);
 }
 for(const re of c.expect)assert.match(JSON.stringify(out),re);
 if(c.n===3){
  assert.equal(out.pkjrStatus,'PKJR_TITLE_ONLY_NO_VERIFIED_PKJR_SOURCE');
  assert.ok(!JSON.stringify(out).includes('peraturan jalan raya'),'No invented PKJR');
 }else assert.equal(out.pkjrStatus,null);
 if(c.n===4)assert.match(JSON.stringify(out),/bukan petikan literal/i,'No invented missing pantun lines');
 if(c.n===5)assert.match(JSON.stringify(out),/Ayat tanya/i,'Question must not count as seruan');
 for(const [why,bad] of [
  ['week',{...map,week_no:29}],['year',{...map,year:2}],
  ['session',{...map,session_no:c.n===5?1:c.n+1}],
  ['title',{...map,title:'Bukan buku'}],
  ['sp',{...map,sp:'9.9.9'}],
  ['page',{...map,textbook_page_start:999}],
  ['verified',{...map,verification_status:'needs_review'}],
  ['route',{...map,source_evidence:{meta:{...map.source_evidence.meta,page_route_verified:false},textbook:{text:c.text}}}],
  ['book',{...map,source_evidence:{meta:map.source_evidence.meta,textbook:{text:'tiada rujukan'}}}]
 ]){
  assert.equal(api.applies(bad,opts),false,'Reject '+why+' W28 S'+c.n);
  assert.throws(()=>api.build(bad,opts),/BM1_WEEK28_SOURCE_PLAN_SCOPE_MISMATCH/);
 }
 assert.equal(api.applies(map,{subjectKey:'en'}),false);
}
const app=fs.readFileSync(new URL('app-v03334-original.js',root),'utf8');
const loader=fs.readFileSync(new URL('app-v03334.js',root),'utf8');
assert.ok(loader.includes('rph-bm1-week28-source-plans.js?v=20261009j'));
assert.ok(app.includes('if(needsW28Plan&&!w28Plans?.applies('));
assert.ok(app.includes('if(needsW28Plan)pedagogy=w28Plans.build('));
assert.ok(app.indexOf('const validation=validateRphMap(map,ev,built)')<app.indexOf('const needsW28Plan='));
assert.ok(app.includes('if(exactWordSession)pedagogy=reviewedBm1.build('));
assert.ok(app.includes('if(needsW37Plan)pedagogy=w37Plans.build('));
assert.ok(app.includes('data-rph-renderer="ag-v1"'));
assert.ok(app.includes('PERLU SEMAKAN GURU'));
console.log('BM1 W28 S1–S5 exact BT evidence, native A–G, PBD and PKJR safety PASS');
