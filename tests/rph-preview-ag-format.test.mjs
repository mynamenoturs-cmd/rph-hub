import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync(new URL('../app-v03334-original.js',import.meta.url),'utf8');
const canonical=fs.readFileSync(new URL('../rph-bm-year1-canonical-production.js',import.meta.url),'utf8');

assert.ok(app.includes('window.BmYear1CanonicalRph?.applies'),'BM1 generation must use canonical content when the verified map is in scope');
assert.ok(!app.includes('window.BmYear1CanonicalRph.render('),'BM1 must not replace the RPH Hub renderer with a custom renderer');
assert.ok(app.includes('data-rph-renderer="ag-v1"'),'Native RPH Hub A-G renderer must remain active');

for(const label of ['Maklumat Pengajaran','Penjajaran Kurikulum','Set Induksi','Aktiviti Sumber daripada Buku','PdP Terbeza','Pentaksiran Bilik Darjah (PBD)','Penutup dan Refleksi']){
  assert.ok(app.includes(label),'Native RPH Hub layout missing label: '+label);
}
assert.ok(canonical.includes("const VERSION='BM1-CANONICAL-20261008h'"),'Canonical BM1 content version must be current');
assert.ok(!canonical.includes('function render('),'Canonical BM1 module must be content-only and must not carry a second renderer');
assert.ok(canonical.includes('sourceSteps'),'Canonical content must populate native source-step cards');
assert.ok(canonical.includes('librarySteps'),'Canonical content must populate native differentiated group cards');
assert.ok(canonical.includes('pbdEvidence'),'Canonical content must populate native PBD card');
assert.ok(canonical.includes('inductionData'),'Canonical content must populate native induction card');
assert.ok(canonical.includes('penutup'),'Canonical content must populate native closure card');

console.log('BM Year 1 native RPH Hub card-layout tests passed');
