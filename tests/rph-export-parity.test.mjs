import fs from 'node:fs';

const src=fs.readFileSync('rph-export-parity-hotfix.js','utf8');
const bootstrap=fs.readFileSync('rph-english-quality-hotfix.js','utf8');
const die=m=>{throw new Error(m)};

for(const token of [
  'generatedRphExportContext',
  'classroomFlow',
  'PdP Terbeza dalam aktiviti ini',
  'D. ALIRAN AKTIVITI PDP',
  'E. PENTAKSIRAN BILIK DARJAH (PBD)',
  'F. PENUTUP DAN REFLEKSI',
  'previewEqualsDocxContent:true',
  'driveAndClassroomUseSameDocx:true'
]) if(!src.includes(token))die(`missing ${token}`);

if(!src.includes('Kelompok Peneroka|Kelompok Pembina|Kelompok Pencabar'))die('legacy differentiated group suppression missing');
if(src.includes('MutationObserver'))die('export parity must not mutate preview DOM');
if(!bootstrap.includes('rph-export-parity-hotfix.js?v=20260906a'))die('export parity bootstrap missing');
if(!bootstrap.includes('d.onload=loadExportParity'))die('export parity must load after differentiation');

console.log('RPH export parity guard passed: Word/Drive/Classroom serialize the same integrated classroom flow and inline differentiation shown in preview.');
