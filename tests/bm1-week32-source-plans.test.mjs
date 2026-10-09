// BM1 Week32: ensure exact RPT/SP/BT matching, four distinct lessons,
// individual PBD, teacher-review labels and native A–G renderer.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const root=new URL('../',import.meta.url);
const c={console:{warn(){},info(){}},rphSubjectKey:()=> 'bm'};c.window=c;c.globalThis=c;
vm.createContext(c);
for(const name of ['rph-bm-year1-canonical-production.js','rph-bm1-week32-source-plans.js'])
 vm.runInContext(fs.readFileSync(new URL(name,root),'utf8'),c,{filename:name});
const api=c.BmYear1Week32SourcePlans;
assert.ok(api);
assert.equal(api.VERSION,'BM1-W32-SOURCE-PLANS-20261009c');
assert.deepEqual(Array.from(api.availableSessions),[1,2,3,4]);
const fixtures=[
 {s:1,title:'Sayangi Haiwan',sp:'1.1.2',page:123,
  text:'Sayangi Haiwan. Indira dan Hana menemui seekor kucing. Cik gu Hadi bertanya sebab mereka lewat ke sekolah. Indira menjawab: Baiklah Hana.',
  expected:[/respons lisan/i,/suruhan/i,/lakonkan|melakonkan/i]},
 {s:2,title:'Haiwan yang Prihatin',sp:'2.3.2',page:124,
  text:'Haiwan yang Prihatin. Sang Kancil bertemu haiwan lain. Pencerita berkata mereka membantu sungai. Saya boleh memungut sampah dengan paruh.',
  expected:[/teater pembaca/i,/pencerita/i,/intonasi/i]},
 {s:3,title:'Diari Abang + PKJR',sp:'3.2.3',page:126,
  text:'Diari Abang. Indira dan keluarga pergi ke Taman Negara. Encik Kamal renjer yang bertugas. Mendengar taklimat. Mereka melihat tenggiling.',
  expected:[/empat maklumat/i,/pengurusan grafik/i,/encik kamal/i]},
 {s:4,title:'Taman Botani',sp:'5.1.4',page:127,
  text:'Taman Botani. Kata hubung dan tetapi atau. Indira dan abang ingin berjoging. Indira ke taman botani atau ke taman tema air?',
  expected:[/dan/i,/tetapi/i,/atau/i,/tiga ayat/i]}
];
for(const f of fixtures){
 const m={
  subject_key:'bm',year:1,academic_year:2026,week_no:32,session_no:f.s,
  title:f.title,sk:f.sp.split('.').slice(0,2).join('.'),sp:f.sp,
  textbook_page_start:f.page,textbook_page_end:f.page,
  verification_status:'verified',week_exact:true,sp_crosscheck:true,
  source_activities:'Buku Teks m/s '+f.page+': '+f.title,
  objective:'Objektif asal RPT berasaskan SP '+f.sp,
  success_criteria:'Kriteria mengikut buku m/s '+f.page,
  source_evidence:{meta:{main_sp:f.sp,session_exact:true,page_route_verified:true,
    mapping_status:'bulk-draft-needs-teacher-review'},textbook:{text:f.text}}
 };
 const opt={subjectKey:'bm',lessonTime:'30 minit'};
 assert.equal(api.applies(m,opt),true,'Verified exact session must match S'+f.s);
 const ped=api.build(m,opt);
 assert.equal(ped.canonicalBm1,true);
 assert.equal(ped.sourcePlanBm1,true);
 assert.equal(ped.reviewedReferenceBm1,undefined,'Word approval must not be inferred');
 assert.equal(ped.sourcePlanTeacherReviewNeeded,true,'All W32 maps retain review flags');
 assert.equal(ped.sourcePlanReviewStatus,'LESSON_MAP_EVIDENCE_NOT_WORD_APPROVED');
 assert.equal(ped.sourcePlanSession,'BM1-2026B-W32-S'+f.s);
 assert.equal(ped.sourceSteps.length,6,'Six purpose-built phases required S'+f.s);
 assert.ok(ped.sourceSteps.every(x=>x.key.includes('w32-s'+f.s)));
 assert.ok(ped.sourceSteps.every(x=>x.minutes===undefined),'Do not invent phase duration');
 assert.ok(ped.sourceSteps.every(x=>x.text.includes('Tindakan guru:')
   &&x.text.includes('Tindakan murid:')&&x.text.includes('Semakan:')
   &&x.bbm==='Buku Teks m/s '+f.page));
 assert.ok(ped.pbdEvidence.method&&ped.pbdEvidence.evidence&&ped.pbdEvidence.criterion);
 assert.ok(ped.reflection.includes('Susulan:'));
 assert.equal(ped.page,'m/s '+f.page);
 assert.equal(ped.mainSp,f.sp);
 assert.equal(ped.canonicalVersion,api.VERSION);
 assert.ok(ped.penutup.includes('Tindakan guru:'));
 for(const key of ['support','core','challenge']){
  const lane=ped.differentiation[key];
  assert.ok(lane.teacher.length>=2&&lane.pupil_steps.length>=3);
  assert.ok(lane.task&&lane.example.teacher&&lane.example.pupil);
  assert.ok(lane.product&&lane.criterion&&lane.next_step);
  assert.equal(ped.librarySteps[key].length,1);
  assert.ok(ped.librarySteps[key][0].text.includes(lane.task));
 }
 for(const exp of f.expected)assert.match(JSON.stringify(ped),exp);
 if(f.s===1){
  assert.ok(JSON.stringify(ped).includes('tanpa menyuruh murid meniru penyelamatan haiwan sebenar'));
  assert.equal(ped.pkjrStatus,null);
 }
 if(f.s===2){
  assert.ok(JSON.stringify(ped).includes('jangan tetapkan spesies'));
  assert.ok(JSON.stringify(ped).includes('jangan menyatakan kesudahan')||JSON.stringify(ped).includes('tidak menyatakan kesudahan'));
 }
 if(f.s===3){
  assert.equal(ped.pkjrStatus,'PKJR_TITLE_ONLY_NO_VERIFIED_PKJR_SOURCE');
  assert.ok(ped.sourceTask.includes('PKJR belum mempunyai sumber khusus'));
  assert.ok(!JSON.stringify(ped).includes('latihan melintas jalan'),'No unsupported PKJR content');
 }else assert.equal(ped.pkjrStatus,null);
 if(f.s===4){
  assert.ok(JSON.stringify(ped).includes('OCR'));
 }
 for(const [label,bad] of [
  ['week',{...m,week_no:31}],['year',{...m,year:2}],
  ['session',{...m,session_no:f.s===4?1:f.s+1}],
  ['title',{...m,title:'Buku berbeza'}],
  ['SP',{...m,sp:'9.9.9'}],
  ['page',{...m,textbook_page_start:999}],
  ['unverified',{...m,verification_status:'needs_review'}],
  ['route',{...m,source_evidence:{meta:{...m.source_evidence.meta,page_route_verified:false},textbook:{text:f.text}}}],
  ['missing source',{...m,source_evidence:{meta:m.source_evidence.meta,textbook:{text:'Tidak ada petikan buku'}}}]
 ]){
  assert.equal(api.applies(bad,opt),false,'Negative '+label+' must reject S'+f.s);
  assert.throws(()=>api.build(bad,opt),/BM1_WEEK32_SOURCE_PLAN_SCOPE_MISMATCH/);
 }
 assert.equal(api.applies(m,{subjectKey:'en'}),false);
}
const source=fs.readFileSync(new URL('app-v03334-original.js',root),'utf8');
const loader=fs.readFileSync(new URL('app-v03334.js',root),'utf8');
assert.ok(loader.includes('rph-bm1-week32-source-plans.js?v=20261009h'));
assert.ok(source.includes('if(needsW32Plan&&!w32Plans?.applies('),'M32 evidence mismatch must fail closed');
assert.ok(source.includes('if(needsW32Plan)pedagogy=w32Plans.build('));
assert.ok(source.indexOf('const validation=validateRphMap(map,ev,built)')<source.indexOf('const needsW32Plan='),'Original Accuracy Gate must run before routing');
assert.ok(source.includes('if(exactWordSession)pedagogy=reviewedBm1.build('),'Previous Word reference must remain');
assert.ok(source.includes("pedagogy.sourcePlanTeacherReviewNeeded?' • PERLU SEMAKAN GURU'"));
assert.ok(source.includes('data-rph-renderer="ag-v1"'),'No duplicate renderer');
console.log('BM1 W32 four exact verified sessions, source-first PBD and review labels PASS');
