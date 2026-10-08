import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../rph-bm-year1-canonical-production.js',import.meta.url),'utf8');
const sandbox={console:{info(){},warn(){}},rphSubjectKey:id=>id==='bm-id'?'bm':'science'};
sandbox.window=sandbox;sandbox.globalThis=sandbox;
vm.runInNewContext(source,sandbox,{filename:'rph-bm-year1-canonical-production.js'});
const api=sandbox.BmYear1CanonicalRph;
assert.ok(api,'Canonical BM1 API must load');
assert.equal(typeof api.render,'undefined','Canonical BM1 module must not expose its own renderer');

const map={
  subject_id:'bm-id',year:1,academic_year:2026,verification_status:'verified',week_no:30,session_no:1,
  title:'Penyiram Pokok Inovasi (Ulangkaji)',sk:'1.2',sp:'1.2.2',
  objective:'Pada akhir PdP, murid dapat menyampaikan sekurang-kurangnya tiga maklumat penting daripada bahan “Penyiram Pokok Inovasi” pada Buku Teks m/s 109 dengan jelas dan tepat.',
  success_criteria:'Murid menyampaikan sekurang-kurangnya tiga maklumat tepat daripada Buku Teks m/s 109 secara tersusun dan jelas.',
  textbook_page_start:109,confidence_score:100,
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
assert.equal(ped.canonicalVersion,'BM1-CANONICAL-20261008h');
assert.equal(ped.totalMinutes,60);
assert.equal(ped.phases.reduce((sum,p)=>sum+p.minutes,0),60,'Internal timing must equal lesson duration');
assert.equal(ped.sourceSteps.length,3,'Native Hub source card should receive three concise source steps');
for(const step of ped.sourceSteps){assert.ok(step.name&&step.text&&step.bbm,'Every source step must fit the native Hub source table');}
for(const level of ['support','core','challenge']){
  assert.equal(ped.librarySteps[level].length,3,level+' must fit the native Hub card as three readable rows');
  assert.match(ped.librarySteps[level][0].name,/Tugasan & Bahan/);
  assert.match(ped.librarySteps[level][1].name,/Bimbingan & Langkah Murid/);
  assert.match(ped.librarySteps[level][2].name,/Hasil, Kriteria & Susulan/);
  assert.ok(ped.librarySteps[level].every(x=>x.text&&x.bbm),'Every group row needs content and BBM');
}
assert.match(ped.inductionData.text,/Guru|Murid/,'Set Induksi must populate the native Hub card');
assert.match(ped.pbdEvidence.method,/lisan/i);
assert.match(ped.penutup,/Intervensi:/,'Native Hub closure card must carry intervention follow-up');
assert.ok(ped.intervention.length);

const short=api.build(map,{lessonTime:'08:00–08:30'});
assert.equal(short.totalMinutes,30);
assert.equal(short.phases.reduce((sum,p)=>sum+p.minutes,0),30);

console.log('BM Year 1 canonical content adapter tests passed');
