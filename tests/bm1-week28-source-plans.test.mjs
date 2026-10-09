import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const base=new URL('../',import.meta.url),ctx={console:{warn(){},info(){}},rphSubjectKey:()=> 'bm'};
ctx.window=ctx;ctx.globalThis=ctx;vm.createContext(ctx);
for(const file of ['rph-bm-year1-canonical-production.js','rph-bm1-week28-source-plans.js'])
 vm.runInContext(fs.readFileSync(new URL(file,base),'utf8'),ctx,{filename:file});
const api=ctx.BmYear1Week28SourcePlans;
assert.equal(api.VERSION,'BM1-W28-SOURCE-PLANS-20261009i');
assert.deepEqual(Array.from(api.availableSessions),[1,2,3,4,5]);
const fixtures=[
 {s:1,title:'Kamus Elektronik',sp:'1.2.1',page:103,
  text:'Kamus Elektronik: sebutan perkataan tepat, pantas mencari makna perkataan, pelbagai bahasa dan ayat contoh. Tahan lasak, ringan, mesra pengguna.',
  terms:[/tiga respons/i,/sebutan/i,/ciri/i]},
 {s:2,title:'Kami Memudahkan Kerja',sp:'2.3.1',page:104,
  text:'Kami Memudahkan Kerja. Mesin basuh menggunakan elektrik untuk membasuh pakaian dan pembersih vakum menyedut habuk.',
  terms:[/mesin basuh/i,/pembersih vakum/i,/membaca/i]},
 {s:3,title:'Pintu Pagar Automatik + PKJR',sp:'3.2.1',page:106,
  text:'Pintu Pagar Automatik. Ibu basah kuyup selepas hujan. Ayah cadang guna alat kawalan jauh untuk buka secara automatik, tutup secara automatik.',
  terms:[/tiga ayat/i,/frasa/i,/hujan/i]},
 {s:4,title:'Hebat Teknologi',sp:'4.2.1',page:107,
  text:'Hebat Teknologi. Membina pantun empat kerat dan melafazkan pantun dengan sebutan dan intonasi betul. Kerja yang berat menjadi ringan.',
  terms:[/pantun empat kerat/i,/melafaz/i,/rima/i]},
 {s:5,title:'Basikal Solar',sp:'5.3.1',page:108,
  text:'Basikal Solar. Ayat Seruan, Amboi laju sungguh basikal solar! Wah hebatnya! Oh begitu! Eh kamu rupanya!',
  terms:[/ayat seruan/i,/tanda seru/i,/tiga ayat/i]}
];
const built=[];
for(const f of fixtures){
 const map={subject_key:'bm',year:1,academic_year:2026,week_no:28,session_no:f.s,
  title:f.title,sk:f.sp.slice(0,3),sp:f.sp,textbook_page_start:f.page,textbook_page_end:f.page,
  verification_status:'verified',week_exact:true,sp_crosscheck:true,objective:'Verified lesson objective',
  success_criteria:'Verified criteria',source_activities:'Buku Teks m/s '+f.page,
  source_evidence:{meta:{main_sp:f.sp,session_exact:true,page_route_verified:true,
    mapping_status:'bulk-draft-needs-teacher-review'},textbook:{text:f.text}}
 };
 const opts={subjectKey:'bm',lessonTime:'30 minit'};
 assert.equal(api.applies(map,opts),true,'Source W28 S'+f.s+' must match exactly');
 const ped=api.build(map,opts);built.push(ped);
 assert.equal(ped.sourcePlanBm1,true);
 assert.equal(ped.canonicalBm1,true);
 assert.equal(ped.sourcePlanTeacherReviewNeeded,true);
 assert.equal(ped.sourcePlanReviewStatus,'LESSON_MAP_EVIDENCE_NOT_WORD_APPROVED');
 assert.equal(ped.reviewedReferenceBm1,undefined);
 assert.equal(ped.sourcePlanSession,'BM1-2026B-W28-S'+f.s);
 assert.equal(ped.sourcePlanVersion,api.VERSION);
 assert.equal(ped.sourceSteps.length,6);
 assert.equal(ped.classroomFlow.length,6);
 assert.ok(ped.sourceSteps.every(x=>x.key.includes('w28-s'+f.s)));
 assert.ok(ped.sourceSteps.every(x=>x.minutes===undefined),'No fabricated individual timings');
 assert.ok(ped.sourceSteps.every(x=>x.text.includes('Tindakan guru:')
   &&x.text.includes('Tindakan murid:')&&x.text.includes('Semakan:')
   &&x.bbm==='Buku Teks m/s '+f.page));
 assert.ok(ped.penutup.includes('Tindakan guru:'));
 assert.ok(ped.pbdEvidence.method&&ped.pbdEvidence.evidence&&ped.pbdEvidence.criterion);
 assert.ok(ped.reflection.includes('Susulan:'));
 assert.equal(ped.page,'m/s '+f.page);
 assert.equal(ped.mainSp,f.sp);
 for(const g of ['support','core','challenge']){
  const x=ped.differentiation[g];
  assert.ok(x.teacher.length>=2&&x.pupil_steps.length>=3);
  assert.ok(x.task&&x.example.teacher&&x.example.pupil&&x.product&&x.criterion&&x.next_step);
  assert.equal(ped.librarySteps[g].length,1);
 }
 for(const term of f.terms)assert.match(JSON.stringify(ped),term,'Missing task-specific evidence '+f.s);
 if(f.s===3){
  assert.equal(ped.pkjrStatus,'PKJR_TITLE_ONLY_NO_VERIFIED_PKJR_SOURCE');
  assert.ok(!JSON.stringify(ped).includes('lintasan zebra'),'Do not fabricate PKJR chapter');
 }else assert.equal(ped.pkjrStatus,null);
 if(f.s===4){
  assert.match(JSON.stringify(ped),/OCR/);
  assert.ok(!JSON.stringify(ped).includes('pantun lengkap tertentu dicetak dalam sumber')||
    JSON.stringify(ped).includes('jangan mendakwa'),'Do not invent verified text completions');
 }
 if(f.s===5)assert.match(JSON.stringify(ped),/ayat tanya/i,'Differentiate question from exclamation');
 for(const [label,bad] of [
  ['year',{...map,year:2}],['week',{...map,week_no:29}],
  ['session',{...map,session_no:f.s===5?1:f.s+1}],
  ['sp',{...map,sp:'9.9.9'}],['title',{...map,title:'Wrong title'}],
  ['page',{...map,textbook_page_start:999}],
  ['unverified',{...map,verification_status:'needs_review'}],
  ['week-map',{...map,week_exact:false}],
  ['route',{...map,source_evidence:{meta:{...map.source_evidence.meta,page_route_verified:false},textbook:{text:f.text}}}],
  ['missing-evidence',{...map,source_evidence:{meta:map.source_evidence.meta,textbook:{text:'No matching evidence'}}}]
 ]){
  assert.equal(api.applies(bad,opts),false,'Scope '+label+' rejected for S'+f.s);
  assert.throws(()=>api.build(bad,opts),/BM1_WEEK28_SOURCE_PLAN_SCOPE_MISMATCH/);
 }
 assert.equal(api.applies(map,{subjectKey:'en'}),false);
}
assert.notEqual(built[0].sourceTask,built[1].sourceTask,'Do not reuse generic source task');
assert.notEqual(built[3].sourceTask,built[4].sourceTask,'Pantun and ayat seruan are not equivalent');
const app=fs.readFileSync(new URL('app-v03334-original.js',base),'utf8');
const loader=fs.readFileSync(new URL('app-v03334.js',base),'utf8');
assert.ok(loader.includes('rph-bm1-week28-source-plans.js?v=20261009i'));
assert.ok(app.includes('if(needsW28Plan&&!w28Plans?.applies('));
assert.ok(app.includes('if(needsW28Plan)pedagogy=w28Plans.build('));
assert.ok(app.indexOf('const validation=validateRphMap(map,ev,built)')<app.indexOf('const needsW28Plan='));
assert.ok(app.includes('if(exactWordSession)pedagogy=reviewedBm1.build('));
assert.ok(app.includes('data-rph-renderer="ag-v1"'));
assert.ok(app.includes('PERLU SEMAKAN GURU'));
console.log('BM1 W28 S1–S5 source-specific steps, differentiated PBD and exact routing PASS');
