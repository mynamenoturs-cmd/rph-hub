import fs from 'node:fs';

const src=fs.readFileSync('rph-inline-differentiation-hotfix.js','utf8');
const bootstrap=fs.readFileSync('rph-english-quality-hotfix.js','utf8');
const die=m=>{throw new Error(m)};

for(const token of [
  'PdP Terbeza dalam aktiviti ini',
  'Sokongan',
  'Teras',
  'Pengayaan',
  'Kotak Beracun',
  'Radio Rosak',
  'classroomFlow',
  'inductionDifferentiation',
  'closureDifferentiation',
  'preservesRealClassroomFlow:true'
]) if(!src.includes(token)) die(`missing ${token}`);

if(!src.includes("data-rph-classroom-flow"))die('integrated flow binding missing');
if(!bootstrap.includes('rph-inline-differentiation-hotfix.js?v=20260906a'))die('inline differentiation bootstrap missing');
if(src.includes('body.innerHTML='))die('inline differentiation must not replace the integrated classroom flow');

console.log('RPH inline differentiation guard passed: support/core/challenge stay inside the real classroom activity flow from induction to closure.');
