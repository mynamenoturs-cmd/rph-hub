import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const root=new URL('../',import.meta.url);
const ctx={console:{warn(){}},rphSubjectKey:()=> 'bm'};
ctx.window=ctx;ctx.globalThis=ctx;
ctx.effectiveRphLessonMap=map=>map;
ctx.buildSourceAwarePedagogy=()=>({existingSourceBlueprint:true,inductionData:{name:'Tiga Petunjuk',text:'Guru memberikan tiga petunjuk generik',bbm:'kad petunjuk'},setInduksi:'Guru memberikan tiga petunjuk generik'});
vm.createContext(ctx);
const load=file=>vm.runInContext(fs.readFileSync(new URL(file,root),'utf8'),ctx);
load('rph-bm2-week29-source-plans.js');
const source=ctx.BmYear2Week29SourcePlans;
assert.ok(source);
const previous=ctx.buildSourceAwarePedagogy;
ctx.buildSourceAwarePedagogy=(m,...args)=>{
 const ped=previous(m,...args);
 // Simulate any later generic enrichment overwriting the approved source card.
 return {...ped,inductionData:{name:'Tiga Petunjuk',text:'Guru memberikan tiga petunjuk generik',bbm:'3 kad petunjuk',pak21:'Think-Pair-Share'},setInduksi:'Guru memberikan tiga petunjuk generik'};
};
load('rph-bm2-week29-card-parity.js');
const guard=ctx.Bm2Week29CardParity;
assert.ok(guard);
const examples=[
 [1,'Mural Penutup Botol','5.3.1',33,'Mural Penutup Botol Cikgu Munirah Frasa Nama mereka membantu Cikgu Munirah'],
 [2,'Bilik Darjah Mesra Alam','5.3.1',34,'Bilik Darjah Mesra Alam Ayat Penyata Elis membawa pokok bunga'],
 [3,'Jimatkan Petrol','1.1.3',35,'Jimatkan Petrol Kereta menjadi berat Banyak asap'],
 [4,'Gunakan Air Secara Berhemat','2.3.2',36,'Gunakan Air Secara Berhemat Kurangkan masa mandi Pili'],
 [5,'Amalan Hijau dalam Kehidupan','3.2.2',37,'Amalan Hijau dalam Kehidupan Peralatan elektrik cekap tenaga Baja kompos']
];
const make=([session,title,sp,page,body],status='verified')=>({
 subject_id:'subject-bm',year:2,academic_year:2026,week_no:29,session_no:session,
 title,sp,sk:sp.slice(0,3),textbook_page_start:page,textbook_page_end:page,
 verification_status:status,week_exact:true,sp_crosscheck:true,
 source_evidence:{meta:{main_sp:sp,session_exact:true,page_route_verified:true},textbook:{text:body}}
});
for(const sample of examples){
 const map=make(sample),ped=ctx.buildSourceAwarePedagogy(map,['real activity'],'m/s '+sample[3],false,'class-id');
 assert.equal(guard.isTarget(map),true);
 assert.equal(ped.sourcePlanBm2,true);
 assert.equal(ped.inductionData.name,source.plans[sample[0]].phases[0].name);
 assert.equal(ped.inductionData.text.includes('Tindakan guru:'),true);
 assert.equal(ped.inductionData.text.includes('Tindakan murid:'),true);
 assert.equal(ped.inductionData.text.includes('Guru memberikan tiga petunjuk generik'),false);
 assert.equal(ped.sourceSteps.length,6);
 assert.equal(ped.classroomFlow.length,6);
 assert.equal(ped.setInduksi,ped.inductionData.text);
 assert.equal(ped.bbmList[0],'Buku Teks m/s '+sample[3]);
 assert.equal(ped.sourcePlanReviewStatus,'LESSON_MAP_EVIDENCE_NOT_WORD_APPROVED');
 assert.ok(ped.pbdEvidence.evidence);
 for(const broken of [
  make(sample,'needs_review'),
  {...map,sp:'9.9.9'},
  {...map,source_evidence:{...map.source_evidence,textbook:{text:'tiada sumber'}}}
 ])assert.throws(()=>ctx.buildSourceAwarePedagogy(broken),/bukti Buku Teks\/SP atau status Lesson Map/);
}
const unrelated={...make(examples[0]),week_no:30};
assert.equal(guard.isTarget(unrelated),false);
assert.equal(ctx.buildSourceAwarePedagogy(unrelated).inductionData.name,'Tiga Petunjuk','Guard must not affect other routes');
const main=fs.readFileSync(new URL('app-v03334.js',root),'utf8');
assert.ok(main.includes('rph-bm2-week29-card-parity.js'));
assert.ok(main.lastIndexOf('rph-bm2-week29-card-parity.js')>main.indexOf('rph-bm2-hermes-review.js'));
const review=fs.readFileSync(new URL('rph-bm2-hermes-review.js',root),'utf8');
assert.ok(review.includes("host.insertBefore(panel,before)"),'Hermes controls must be visible before generator filters');
assert.ok(!review.includes('host.appendChild(panel);return'),'Check panel injection');
console.log('BM2 M29: generic induction is replaced with exact source for 5 sessions; evidence gate stays locked.');