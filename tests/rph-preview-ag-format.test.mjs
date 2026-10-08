import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync(new URL('../app-v03334-original.js',import.meta.url),'utf8');
const canonical=fs.readFileSync(new URL('../rph-bm-year1-canonical-production.js',import.meta.url),'utf8');

assert.ok(app.includes('window.BmYear1CanonicalRph?.applies'),'BM1 generation must check the canonical production route');
assert.ok(app.includes('pedagogy?.canonicalBm1&&window.BmYear1CanonicalRph?window.BmYear1CanonicalRph.render'),'BM1 canonical renderer must replace, not append to, the legacy renderer');
assert.ok(canonical.includes('data-rph-renderer="bm1-canonical-r2"'),'BM1 preview must expose the canonical renderer identity');
assert.ok(canonical.includes('BM1 CANONICAL RPH • 20261008f'),'BM1 preview must expose the canonical release marker');

for(const section of ['A','B','C','D','E','F','G']){
  assert.ok(canonical.includes("section('"+section+"'"),'Canonical BM1 renderer missing section '+section);
}
for(const label of ['Maklumat Pengajaran','Penjajaran Kurikulum','Alatan dan Persediaan','Langkah PdP','PdP Terbeza','Pentaksiran Bilik Darjah (PBD)','Refleksi dan Intervensi']){
  assert.ok(canonical.includes(label),'Canonical BM1 renderer missing label: '+label);
}
assert.ok(!canonical.includes("section('C','Set Induksi'"),'BM1 canonical section C must not fall back to the old Set Induksi layout');
assert.ok(!canonical.includes("section('D','Aktiviti Sumber daripada Buku'"),'BM1 canonical section D must be the complete timed lesson flow, not the old source-only block');
assert.ok(canonical.indexOf("section('C','Alatan dan Persediaan'")<canonical.indexOf("section('D','Langkah PdP'"),'Equipment/preparation must precede lesson steps');
assert.ok(canonical.indexOf("section('D','Langkah PdP'")<canonical.indexOf("section('E','PdP Terbeza'"),'Lesson steps must precede differentiation');
assert.ok(canonical.indexOf("section('F','Pentaksiran Bilik Darjah (PBD)'")<canonical.indexOf("section('G','Refleksi dan Intervensi'"),'PBD must precede reflection/intervention');

console.log('BM Year 1 canonical RPH preview structure tests passed');
