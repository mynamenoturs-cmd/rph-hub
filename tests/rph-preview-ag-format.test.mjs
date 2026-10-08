import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync(new URL('../app-v03334-original.js',import.meta.url),'utf8');
const contentEngine=fs.readFileSync(new URL('../rph-bm-year1-canonical-production.js',import.meta.url),'utf8');

assert.ok(app.includes('window.BmYear1CanonicalRph?.applies'),'BM1 generation must use the verified content engine');
assert.ok(!app.includes('BmYear1CanonicalRph.render'),'BM1 content engine must never replace the native RPH Hub card renderer');
assert.ok(!contentEngine.includes('function render('),'BM1 module must be content-only and contain no alternate renderer');

const start=app.indexOf('const html=`<div class="rph-title" data-rph-renderer="ag-v1">');
const end=app.indexOf("$('#rphPreview').innerHTML=html",start);
assert.ok(start>=0&&end>start,'Native RPH Hub renderer must exist');
const preview=app.slice(start,end);

for(const section of ['A','B','C','D','E','F','G']){
  assert.ok(preview.includes(`data-rph-section="${section}"`),'Native RPH Hub renderer missing section '+section);
}
for(const label of ['Maklumat Pengajaran','Penjajaran Kurikulum','Set Induksi','Aktiviti Sumber daripada Buku','PdP Terbeza','Pentaksiran Bilik Darjah (PBD)','Penutup dan Refleksi']){
  assert.ok(preview.includes(label),'Native RPH Hub card renderer missing label: '+label);
}
assert.ok(preview.includes('rphInductionHtml(pedagogy,uiEn)'),'BM1 induction content must flow into the native induction card');
assert.ok(preview.includes('rphSourceStepsHtml(pedagogy.sourceSteps'),'BM1 source content must flow into the native source card');
assert.ok(preview.includes('rphGroupStepsHtml(pedagogy.librarySteps?.support'),'BM1 differentiated content must flow into the native group cards');
assert.ok(preview.includes('pedagogy.pbdEvidence?.method'),'BM1 PBD content must flow into the native PBD card');
assert.ok(preview.includes('pedagogy.penutup'),'BM1 closure content must flow into the native closure card');

console.log('BM Year 1 content follows native RPH Hub card structure');
