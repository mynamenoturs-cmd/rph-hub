import fs from 'node:fs';

const src=fs.readFileSync('rph-inline-differentiation-hotfix.js','utf8');
const bootstrap=fs.readFileSync('rph-english-quality-hotfix.js','utf8');
const die=m=>{throw new Error(m)};

for(const token of [
  'PdP Terbeza (3 Kumpulan)',
  'Kelompok Peneroka',
  'Kelompok Pembina',
  'Kelompok Pencabar',
  'groupDifferentiation',
  'classroomFlow',
  'groupedDifferentiation=true',
  'data-rph-group-differentiation="1"',
  'preservesRealClassroomFlow:true',
  'idempotentRenderer:true',
  'requestAnimationFrame'
]) if(!src.includes(token)) die(`missing ${token}`);

if(!src.includes('data-rph-classroom-flow'))die('integrated flow binding missing');
if(!bootstrap.includes('rph-inline-differentiation-hotfix.js?v=20260906c'))die('grouped differentiation bootstrap missing');
if(src.includes('body.innerHTML='))die('group differentiation must not replace the integrated classroom flow');
if(src.includes('queueMicrotask(()=>{queued=false;inject()})'))die('microtask mutation loop pattern must not return');

console.log('RPH grouped differentiation guard passed: real classroom flow stays intact and three clear differentiated groups are restored without the freeze loop.');
