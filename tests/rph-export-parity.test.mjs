import fs from 'node:fs';

const src=fs.readFileSync('rph-export-parity-hotfix.js','utf8');
const bootstrap=fs.readFileSync('rph-english-quality-hotfix.js','utf8');
const die=m=>{throw new Error(m)};

for(const token of [
  'generatedRphExportContext',
  'classroomFlow',
  'librarySteps',
  'support:groupRows',
  'core:groupRows',
  'challenge:groupRows',
  'D. ALIRAN AKTIVITI PDP',
  'groupedDifferentiation:true',
  'previewEqualsDocxContent:true',
  'driveAndClassroomUseSameDocx:true'
]) if(!src.includes(token))die(`missing ${token}`);

if(src.includes('Kelompok Peneroka|Kelompok Pembina|Kelompok Pencabar'))die('group suppression must not return');
if(src.includes("if(/^E\\.\\s*(?:PDP TERBEZA|DIFFERENTIATED TEACHING AND LEARNING)"))die('E. PdP Terbeza must not be suppressed');
if(src.includes('MutationObserver'))die('export parity must not mutate preview DOM');
if(!bootstrap.includes('rph-export-parity-hotfix.js?v=20260906b'))die('export parity bootstrap missing');
if(!bootstrap.includes('d.onload=loadExportParity'))die('export parity must load after grouped differentiation');

console.log('RPH export parity guard passed: Word/Drive/Classroom keep the integrated classroom flow plus the same three differentiated groups shown in preview.');
