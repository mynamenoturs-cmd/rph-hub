import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../app-v03334-original.js',import.meta.url),'utf8');
const start=source.indexOf('async function buildDocxBlob(ctx)');
const end=source.indexOf('function generatedRphFileName',start);
assert.ok(start>=0&&end>start,'DOCX generator must exist');
const docx=source.slice(start,end);

assert.ok(!docx.includes('if(ped?.canonicalBm1){'),'BM1 must not use a separate Word renderer');
for(const label of [
  'C. SET INDUKSI',
  'D. AKTIVITI SUMBER DARIPADA BUKU',
  'E. PDP TERBEZA',
  'F. PENTAKSIRAN BILIK DARJAH (PBD)',
  'G. PENUTUP DAN REFLEKSI'
]){
  assert.ok(docx.includes(label),'Native RPH Hub Word layout missing '+label);
}
assert.ok(docx.includes('ped.inductionData'),'Word C card must use the same induction content as preview');
assert.ok(docx.includes('ped.sourceSteps'),'Word D card must use the same source steps as preview');
assert.ok(docx.includes('ped.librarySteps?.support'),'Word E card must use the same Peneroka content as preview');
assert.ok(docx.includes('ped.librarySteps?.core'),'Word E card must use the same Pembina content as preview');
assert.ok(docx.includes('ped.librarySteps?.challenge'),'Word E card must use the same Pencabar content as preview');
assert.ok(docx.includes('ped.pbdEvidence'),'Word F card must use the same PBD content as preview');
assert.ok(docx.includes('ped.penutup'),'Word G card must use the same closure/follow-up content as preview');

console.log('BM Year 1 native RPH Hub preview/Word parity tests passed');
