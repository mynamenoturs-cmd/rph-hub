import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../app-v03334-original.js',import.meta.url),'utf8');
const start=source.indexOf('async function buildDocxBlob(ctx)');
const end=source.indexOf('function generatedRphFileName',start);
assert.ok(start>=0&&end>start,'DOCX generator must exist');
const docx=source.slice(start,end);

assert.ok(!docx.includes('if(ped?.canonicalBm1){'),'BM1 must not switch to a second DOCX layout');
for(const label of [
  'C. SET INDUCTION',
  'D. SOURCE ACTIVITIES FROM THE BOOK',
  'E. DIFFERENTIATED TEACHING AND LEARNING',
  'F. CLASSROOM ASSESSMENT (PBD)',
  'G. CLOSURE AND REFLECTION'
]){
  assert.ok(docx.includes(label),'Native RPH Hub DOCX missing '+label);
}
assert.ok(docx.includes('rphDocxActivityTable(ped.sourceSteps,ped.anchor,uiEn)'),'BM1 source steps must use the native RPH Hub Word table');
assert.ok(docx.includes('ped.librarySteps?.support'),'BM1 support steps must use the native differentiated table');
assert.ok(docx.includes('ped.librarySteps?.core'),'BM1 core steps must use the native differentiated table');
assert.ok(docx.includes('ped.librarySteps?.challenge'),'BM1 challenge steps must use the native differentiated table');
assert.ok(docx.includes('ped.pbdEvidence?.method'),'BM1 PBD must use the native RPH Hub Word section');
assert.ok(docx.includes('ped.penutup'),'BM1 closure must use the native RPH Hub Word section');

console.log('BM Year 1 Word export follows native RPH Hub structure');
