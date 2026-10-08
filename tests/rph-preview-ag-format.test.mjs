import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../app-v03334-original.js',import.meta.url),'utf8');
const start=source.indexOf('const html=`<div class="rph-title"');
const end=source.indexOf("$('#rphPreview').innerHTML=html",start);
assert.ok(start>=0&&end>start,'Canonical live RPH preview template must exist');
const preview=source.slice(start,end);
assert.ok(preview.includes('data-rph-renderer="ag-v1"'),'Live preview must identify A-G renderer');
assert.ok(preview.includes('BM1 SOURCE-FLOW V3'),'Live preview must expose the BM1 source-flow v3 marker when the runtime BM blueprint is active');
assert.ok(preview.includes('EXACT-SESSION'),'Live preview must expose exact-session marker when a BM1 session variant is active');
for(const section of ['A','B','C','D','E','F','G']){
  assert.ok(preview.includes(`data-rph-section="${section}"`),`Missing A-G section ${section}`);
  assert.ok(preview.includes(`rph-section-num">${section}</span>`),`Missing visible A-G letter ${section}`);
}
for(const legacy of ['rph-section-num">1</span>','rph-section-num">2</span>','rph-section-num">3</span>','rph-section-num">4</span>']) assert.ok(!preview.includes(legacy),`Legacy section remains: ${legacy}`);
for(const label of ['Maklumat Pengajaran','Penjajaran Kurikulum','Aktiviti Sumber daripada Buku','PdP Terbeza','Pentaksiran Bilik Darjah (PBD)','Penutup dan Refleksi']) assert.ok(preview.includes(label),`Missing canonical label: ${label}`);
assert.ok(preview.indexOf('data-rph-section="D"')<preview.indexOf('data-rph-section="E"'),'Source activity must precede differentiation');
assert.ok(preview.indexOf('data-rph-section="E"')<preview.indexOf('data-rph-section="F"'),'Differentiation must precede PBD');
console.log('RPH live preview A-G format tests passed');
