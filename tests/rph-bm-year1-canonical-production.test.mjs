import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../rph-bm-year1-canonical-production.js',import.meta.url),'utf8');
const sandbox={console:{info(){},warn(){}},rphSubjectKey:id=>id==='bm-id'?'bm':'science'};
sandbox.window=sandbox;sandbox.globalThis=sandbox;
vm.runInNewContext(source,sandbox,{filename:'rph-bm-year1-canonical-production.js'});
const api=sandbox.BmYear1CanonicalRph;
assert.ok(api,'BM1 content API must load');

const map={
  subject_id:'bm-id',
  year:1,
  academic_year:2026,
  verification_status:'verified',
  week_no:30,
  session_no:1,
  title:'Penyiram Pokok Inovasi (Ulangkaji)',
  sk:'1.2',
  sp:'1.2.2',
  objective:'Pada akhir PdP, murid dapat menyampaikan sekurang-kurangnya tiga maklumat penting daripada bahan “Penyiram Pokok Inovasi” pada Buku Teks m/s 109 dengan jelas dan tepat.',
  success_criteria:'Murid menyampaikan sekurang-kurangnya tiga maklumat tepat daripada Buku Teks m/s 109 secara tersusun dan jelas.',
  textbook_page_start:109,
  confidence_score:100,
  source_activities:'Buku Teks m/s 109 — Penyiram Pokok Inovasi. Menyampaikan maklumat berdasarkan gambar. Aktiviti Bimbing murid menghasilkan alat penyiram pokok.',
  source_evidence:{meta:{main_sp:'1.2.2',session_exact:true,page_route_verified:true},textbook:{text:'Penyiram Pokok Inovasi. Menyampaikan maklumat berdasarkan gambar. Aktiviti Bimbing murid menghasilkan alat penyiram pokok.'}}
};

assert.equal(api.applies(map,{subjectKey:'bm'}),true);
assert.equal(api.applies({...map,year:2},{subjectKey:'bm'}),false);
assert.equal(api.applies({...map,subject_id:'science-id'},{subjectKey:'science'}),false);

const task=api.sourceTask(map);
assert.match(task,/Menyampaikan maklumat berdasarkan gambar/i,'Exact textbook task should be preferred');

const ped=api.build(map,{lessonTime:'08:00–09:00',btRef:'m/s 109'});
assert.equal(ped.canonicalBm1,true);
assert.equal(ped.canonicalVersion,'BM1-CONTENT-20261008h');
assert.equal(ped.totalMinutes,60);
assert.equal(ped.phases.reduce((sum,p)=>sum+p.minutes,0),60,'Timed phases must equal the lesson duration');
assert.equal(ped.phases.length,5);
for(const p of ped.phases){
  assert.ok(p.teacher.length,'Every phase needs teacher actions');
  assert.ok(p.pupils.length,'Every phase needs pupil actions');
  assert.ok(p.check,'Every phase needs a check');
}
for(const level of ['support','core','challenge']){
  const lane=ped.differentiation[level];
  for(const key of ['label','support_description','task','materials','teacher','pupil_steps','product','criterion','next_step']) assert.ok(lane[key],level+' missing '+key);
  assert.match(lane.task,/Menyampaikan maklumat berdasarkan gambar/i,level+' must keep the same source task');
}
assert.notEqual(ped.differentiation.support.next_step,ped.differentiation.core.next_step);
assert.notEqual(ped.differentiation.core.next_step,ped.differentiation.challenge.next_step);
assert.match(ped.pbd.method,/lisan/i);
assert.ok(ped.intervention.length);

assert.equal(typeof api.render,'undefined','BM1 module must not expose a custom renderer');
assert.equal(ped.sourceSteps.length,4,'Native source card should receive four concise source steps');
for(const step of ped.sourceSteps){
  assert.ok(step.name&&step.text,'Every source-card step needs a name and text');
  assert.ok(step.bbm,'Every source-card step needs BBM aligned to the source');
}
for(const level of ['support','core','challenge']){
  assert.equal(ped.librarySteps[level].length,3,level+' group card should receive three concise steps');
  for(const step of ped.librarySteps[level]){
    assert.ok(step.name&&step.text,'Every differentiated card step needs a name and text');
  }
}
const short=api.build(map,{lessonTime:'08:00–08:30'});
assert.equal(short.totalMinutes,30);
assert.equal(short.phases.reduce((sum,p)=>sum+p.minutes,0),30);

console.log('BM Year 1 canonical production generator tests passed');
