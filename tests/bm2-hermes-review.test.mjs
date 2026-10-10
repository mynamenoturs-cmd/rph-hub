import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const root=new URL('../',import.meta.url);
const moduleSource=fs.readFileSync(new URL('functions/api/bm2-hermes-review.js',root),'utf8');
const marker='const HERMES_CANDIDATES = ',end=';\n\nfunction response(';
const begin=moduleSource.indexOf(marker),finish=moduleSource.indexOf(end,begin);
assert.ok(begin>=0&&finish>begin,'Protected Hermes dataset missing');
const dataset=JSON.parse(moduleSource.slice(begin+marker.length,finish));
const data=dataset;
const ctx={console};ctx.globalThis=ctx;ctx.window=ctx;vm.createContext(ctx);
const source=fs.readFileSync(new URL('rph-bm2-hermes-review.js',root),'utf8');
vm.runInContext(source,ctx);
const api=ctx.Bm2HermesReview;
assert.ok(api,'Hermes review API should be available without a browser');
assert.equal(api.validateDataset(data),data);
assert.equal(data.lessons.length,33);
assert.equal(data.lessons.reduce((n,row)=>n+['r1','r2'].length,0),66);
const sessions=new Set(data.lessons.map(r=>r.session_id));
assert.equal(sessions.size,33);
for(const row of data.lessons){
 for(const rev of ['r1','r2']){
  const original=row[rev];
  const blocks=api.blocksFor(row,rev);
  assert.equal(blocks[0].kind,'title');
  assert.match(blocks[0].title,/DRAF SEMAKAN/);
  assert.match(blocks[1].text,/Tahun: 2/);
  assert.ok(!blocks[1].text.includes('2026-10-05'),'Old Word date must not become lesson date');
  assert.ok(!blocks[1].text.includes('Kelas / Tahun 1'),'Year 1 placeholder must not be shown as actual class');
  assert.ok(blocks.some(b=>b.title==='B. PENJAJARAN KURIKULUM'&&b.text.includes(original.objective_original)));
  assert.ok(blocks.some(b=>b.title==='E. PENGAJARAN DAN PEMBELAJARAN TERBEZA'));
  assert.ok(blocks.some(b=>b.title==='F. PENTAKSIRAN BILIK DARJAH (PBD)'&&b.text.includes(original.pbd_original.Evidens)));
  assert.ok(blocks.some(b=>b.title==='G. PENUTUP DAN REFLEKSI'&&b.text.includes(original.reflection_original)));
  for(const phase of original.six_phases_original){
   assert.ok(blocks.some(b=>b.title===phase.phase_original&&b.text===phase.execution_original),'Word step content changed in '+row.session_id);
  }
  for(const tier of ['peneroka','pembina','pencabar']){
   const lane=original.differentiation_original[tier];
   assert.ok(blocks.some(b=>b.title===lane.label&&b.text===lane.implementation_original),'Original differentiation missing: '+row.session_id+' '+tier);
  }
 }
}
const copy=()=>JSON.parse(JSON.stringify(data));
const rejects=(mutate)=>{
 const bad=copy();mutate(bad);
 assert.throws(()=>api.validateDataset(bad),/BM2_HERMES_REVIEW/);
};
rejects(x=>x.lessons[0].r1.approved=true);
rejects(x=>x.lessons[0].r2.import_status='APPROVED');
rejects(x=>x.lessons[0].lesson_map.verification_status='verified');
rejects(x=>x.lessons[0].r1.metadata_for_import.year=1);
rejects(x=>x.lessons[0].r1.sp_original='9.9.9');
rejects(x=>x.lessons[0].r1.textbook_pages_original='m/s 99');
rejects(x=>x.lessons[0].r1.six_phases_original.pop());
rejects(x=>x.lessons[0].r1.differentiation_original.peneroka.implementation_original='');
rejects(x=>x.lessons[1].session_id=x.lessons[0].session_id);
const fake=copy();fake.lessons[0].r1.approved=true;
assert.throws(()=>api.blocksFor(fake.lessons[0],'r1'),/BM2_HERMES_REVIEW/);
assert.throws(()=>api.blocksFor(data.lessons[0],'nonexistent'),/BM2_HERMES_REVIEW/);
const loader=fs.readFileSync(new URL('app-v03334.js',root),'utf8');
assert.ok(loader.includes('rph-bm2-hermes-review.js'));
assert.ok(source.includes("/api/bm2-hermes-review"));
assert.ok(!source.includes("data/bm2-hermes-m31-m37-candidates.json"));
assert.ok(!source.includes('verification_status='),'Review module must not set Lesson Map approval flags');
assert.ok(!source.includes("from('lesson_maps')"),'Review module must not mutate database Lesson Map rows');
console.log('BM2 Hermes: 33 R1/R2 draft cards preserve source text and never bypass verification.');
