import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const root=new URL('../',import.meta.url);
const ctx={console:{warn(){}},rphSubjectKey:()=> 'bm'};
ctx.window=ctx;ctx.globalThis=ctx;
ctx.effectiveRphLessonMap=map=>map;
ctx.buildSourceAwarePedagogy=map=>({existingSourceBlueprint:true,topic:map.title});
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(new URL('rph-bm2-week29-source-plans.js',root),'utf8'),ctx);
const api=ctx.BmYear2Week29SourcePlans;
assert.ok(api);
assert.equal(api.VERSION,'BM2-W29-SOURCE-PLANS-20261009a');
const sample=[
 [1,'Mural Penutup Botol','5.3.1',33,'Mural Penutup Botol Cikgu Munirah Frasa Nama mereka membantu Cikgu Munirah'],
 [2,'Bilik Darjah Mesra Alam','5.3.1',34,'Bilik Darjah Mesra Alam Ayat Penyata Elis membawa pokok bunga'],
 [3,'Jimatkan Petrol','1.1.3',35,'Jimatkan Petrol Kereta menjadi berat Banyak asap'],
 [4,'Gunakan Air Secara Berhemat','2.3.2',36,'Gunakan Air Secara Berhemat Kurangkan masa mandi Pili'],
 [5,'Amalan Hijau dalam Kehidupan','3.2.2',37,'Amalan Hijau dalam Kehidupan Peralatan elektrik cekap tenaga Baja kompos']
];
const make=(s,title,sp,page,text,status='verified')=>({
 subject_id:'subject-bm',year:2,academic_year:2026,week_no:29,session_no:s,
 title,sp,sk:sp.slice(0,3),textbook_page_start:page,textbook_page_end:page,
 verification_status:status,week_exact:true,sp_crosscheck:true,
 source_evidence:{meta:{main_sp:sp,session_exact:true,page_route_verified:true},textbook:{text}}
});
for(const [s,title,sp,page,text] of sample){
 const map=make(s,title,sp,page,text);
 assert.equal(api.applies(map),true,'s'+s);
 const effective=ctx.effectiveRphLessonMap(map);
 assert.ok(effective.objective.includes('Pada akhir PdP'));
 assert.ok(effective.success_criteria.includes('Murid'));
 const built=ctx.buildSourceAwarePedagogy(map,['activity'],'m/s '+page,false,'class-a');
 assert.equal(built.existingSourceBlueprint,true,'retain prior BP');
 assert.equal(built.sourcePlanBm2,true);
 assert.equal(built.sourcePlanTeacherReviewNeeded,true);
 assert.equal(built.sourcePlanReviewStatus,'LESSON_MAP_EVIDENCE_NOT_WORD_APPROVED');
 assert.equal(built.sourceSteps.length,6);
 assert.equal(built.classroomFlow.length,6);
 assert.equal(built.bbmList[0],'Buku Teks m/s '+page);
 assert.equal(built.sourcePlanSession,'BM2-M29-S'+s);
 for(const step of built.sourceSteps){
  assert.ok(step.text.includes('Tindakan guru:')&&step.text.includes('Tindakan murid:')&&step.text.includes('Semakan:')&&step.text.includes('Bahan:'));
  assert.ok(step.bbm.includes('Buku Teks m/s '+page));
  assert.equal(step.minutes,undefined,'Do not invent source durations');
 }
 for(const level of ['support','core','challenge']){
  assert.ok(built.differentiation[level].task);
  assert.ok(built.differentiation[level].teacher.length);
  assert.ok(built.differentiation[level].pupil_steps.length);
  assert.equal(built.librarySteps[level].length,1);
  assert.equal(built.groupBbm[level],'Buku Teks m/s '+page);
 }
 assert.ok(built.pbd.method&&built.pbd.evidence&&built.pbd.criterion);
 assert.match(built.reflection,/Susulan:/);
 for(const wrong of [
  {...map,week_no:28},{...map,year:1},
  {...map,session_no:99},{...map,textbook_page_start:page+1},
  {...map,sp:'9.9.9'},{...map,title:'tajuk palsu'},
  {...map,verification_status:'needs_review'},
  {...map,source_evidence:{...map.source_evidence,textbook:{text:'tiada buku'}}},
  {...map,source_evidence:{...map.source_evidence,meta:{...map.source_evidence.meta,page_route_verified:false}}}
 ]) {
  assert.equal(api.applies(wrong),false,'reject route/evidence/status');
  assert.throws(()=>api.prepare(wrong,{}),/BM2_WEEK29_EVIDENCE_OR_APPROVAL_GATE_REQUIRED/);
  assert.equal(ctx.buildSourceAwarePedagogy(wrong).sourcePlanBm2,undefined,'No bypassed generation');
 }
}
assert.equal(ctx.buildSourceAwarePedagogy({...make(...sample[0]),year:3}).sourcePlanBm2,undefined);
const wrapper=fs.readFileSync(new URL('app-v03334.js',root),'utf8');
assert.match(wrapper,/rph-bm2-week29-source-plans\.js/);
const html=fs.readFileSync(new URL('index.html',root),'utf8');
assert.match(html,/app-v03334\.js\?v=safe-history-20261009j/);
console.log('BM2 W29: five source-specific drafts guarded by verified Lesson Map and six-phase/PBD checks passed');
