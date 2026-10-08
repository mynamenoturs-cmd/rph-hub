import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../rph-bm-year1-canonical-production.js',import.meta.url),'utf8');
const sandbox={console:{info(){},warn(){}},rphSubjectKey:id=>id==='bm-id'?'bm':'science'};
sandbox.window=sandbox;sandbox.globalThis=sandbox;
vm.runInNewContext(source,sandbox,{filename:'rph-bm-year1-canonical-production.js'});
const api=sandbox.BmYear1CanonicalRph;
assert.ok(api,'Canonical BM1 content API must load');
assert.equal(typeof api.render,'undefined','Canonical BM1 module must not expose a second renderer');

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
assert.equal(ped.canonicalVersion,'BM1-CANONICAL-20261008h');
assert.equal(ped.totalMinutes,60);
assert.equal(ped.phases.reduce((sum,p)=>sum+p.minutes,0),60,'Timed phases must equal the lesson duration');
assert.equal(ped.sourceSteps.length,3,'Native D card should receive three focused source steps');
assert.equal(ped.inductionData.name,'Pencetus dan orientasi sumber','Native C card should receive the canonical induction');

for(const level of ['support','core','challenge']){
  assert.equal(ped.librarySteps[level].length,3,level+' native group card must contain three clear steps');
  for(const step of ped.librarySteps[level]){
    assert.ok(step.name,level+' step requires a name');
    assert.ok(step.text,level+' step requires concise content');
    assert.ok(step.bbm,level+' step requires BBM');
    assert.ok(step.pak21,level+' step requires PAK-21');
  }
}
assert.match(ped.pbdEvidence.method,/lisan/i,'Native F card should receive skill-specific PBD');
assert.match(ped.penutup,/Intervensi:/,'Native G card should include follow-up intervention without creating a new card');

const short=api.build(map,{lessonTime:'08:00–08:30'});
assert.equal(short.totalMinutes,30);
assert.equal(short.phases.reduce((sum,p)=>sum+p.minutes,0),30);

console.log('BM Year 1 canonical content-to-native-cards tests passed');
