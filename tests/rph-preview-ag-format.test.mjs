import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync(new URL('../app-v03334-original.js',import.meta.url),'utf8');
const canonical=fs.readFileSync(new URL('../rph-bm-year1-canonical-production.js',import.meta.url),'utf8');

assert.ok(app.includes('window.BmYear1CanonicalRph?.applies'),'BM1 generation must check the canonical content route');
assert.ok(app.includes('window.BmYear1CanonicalRph.build'),'BM1 canonical content builder must feed the Hub renderer');
assert.ok(!app.includes('window.BmYear1CanonicalRph.render('),'BM1 must not invoke a second renderer');
assert.ok(!canonical.includes('data-rph-renderer="bm1-canonical-r2"'),'Canonical BM1 module must not contain its own card renderer');
assert.ok(canonical.includes("root.BmYear1CanonicalRph={VERSION,applies,sourceTask,build,durationMinutes}"),'Canonical BM1 module must expose content generation only');

const start=app.indexOf('const html=`<div class="rph-title" data-rph-renderer="ag-v1"');
const end=app.indexOf("$('#rphPreview').innerHTML=html",start);
assert.ok(start>=0&&end>start,'Native RPH Hub preview template must remain active');
const preview=app.slice(start,end);
for(const section of ['A','B','C','D','E','F','G']){
  assert.ok(preview.includes(`data-rph-section="${section}"`),`Native Hub preview missing section ${section}`);
}
for(const label of ['Maklumat Pengajaran','Penjajaran Kurikulum','Set Induksi','Aktiviti Sumber daripada Buku','PdP Terbeza','Pentaksiran Bilik Darjah (PBD)','Penutup dan Refleksi']){
  assert.ok(preview.includes(label),'Native Hub renderer missing label: '+label);
}
assert.ok(preview.includes('RPH HUB • 20261008h'),'Native Hub renderer must expose runtime 20261008h');
assert.ok(preview.includes('BM1 CANONICAL CONTENT'),'Native Hub renderer must show when canonical BM1 content is active');

console.log('Canonical BM1 content uses the native RPH Hub card structure');
