import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../app-v03334-original.js',import.meta.url),'utf8');
const start=source.indexOf('async function buildDocxBlob(ctx)');
const end=source.indexOf('function generatedRphFileName',start);
assert.ok(start>=0&&end>start,'DOCX generator must exist');
const docx=source.slice(start,end);

assert.ok(!docx.includes('if(ped?.canonicalBm1){'),'BM1 must not use a second export layout');
for(const label of [
  'C. SET INDUKSI',
  'D. AKTIVITI SUMBER DARIPADA BUKU',
  'E. PDP TERBEZA',
  'F. PENTAKSIRAN BILIK DARJAH (PBD)',
  'G. PENUTUP DAN REFLEKSI'
]){assert.ok(docx.includes(label),'Native RPH Hub DOCX missing '+label);}
assert.ok(docx.includes('ped.sourceSteps'),'Native Hub DOCX must export canonical source content through its standard source table');
assert.ok(docx.includes('ped.librarySteps?.support'),'Native Hub DOCX must export canonical Peneroka content through the standard group card structure');
assert.ok(docx.includes('ped.librarySteps?.core'),'Native Hub DOCX must export canonical Pembina content through the standard group card structure');
assert.ok(docx.includes('ped.librarySteps?.challenge'),'Native Hub DOCX must export canonical Pencabar content through the standard group card structure');
assert.ok(docx.includes('ped.pbdEvidence?.method'),'Native Hub DOCX must use the standard PBD block');
assert.ok(docx.includes('ped.penutup'),'Native Hub DOCX must use the standard closure/reflection block');

console.log('BM Year 1 canonical content uses native RPH Hub Word/export structure');
