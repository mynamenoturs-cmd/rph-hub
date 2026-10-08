import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../app-v03334-original.js',import.meta.url),'utf8');
const start=source.indexOf('async function buildDocxBlob(ctx)');
const end=source.indexOf('function generatedRphFileName',start);
assert.ok(start>=0&&end>start,'DOCX generator must exist');
const docx=source.slice(start,end);

assert.ok(docx.includes('if(ped?.canonicalBm1){'),'BM1 canonical export branch must exist');
for(const label of [
  'C. ALATAN DAN PERSEDIAAN',
  'D. LANGKAH PDP',
  'E. PDP TERBEZA',
  'F. PENTAKSIRAN BILIK DARJAH (PBD)',
  'G. REFLEKSI DAN INTERVENSI'
]){
  assert.ok(docx.includes(label),'Canonical BM1 DOCX missing '+label);
}
for(const field of [
  'Persediaan guru',
  'Tindakan guru',
  'Tindakan murid',
  'Semakan',
  'Penerangan sokongan',
  'Bimbingan guru',
  'Langkah murid',
  'Hasil individu',
  'Susulan',
  'Intervensi'
]){
  assert.ok(docx.includes(field),'Canonical BM1 DOCX missing field '+field);
}
assert.ok(docx.includes('ped.phases||[]'),'BM1 DOCX must use timed canonical phases');
assert.ok(docx.includes('ped.differentiation?.support'),'BM1 DOCX must use canonical differentiated lanes');
assert.ok(docx.includes('ped.intervention||[]'),'BM1 DOCX must preserve interventions');
assert.ok(docx.indexOf("C. ALATAN DAN PERSEDIAAN")<docx.indexOf("D. LANGKAH PDP"),'Canonical DOCX section C must precede D');
assert.ok(docx.indexOf("D. LANGKAH PDP")<docx.indexOf("E. PDP TERBEZA"),'Canonical DOCX section D must precede E');
assert.ok(docx.indexOf("F. PENTAKSIRAN BILIK DARJAH (PBD)")<docx.indexOf("G. REFLEKSI DAN INTERVENSI"),'Canonical DOCX PBD must precede reflection/intervention');

console.log('BM Year 1 canonical preview/Word export parity tests passed');
