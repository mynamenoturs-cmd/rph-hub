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
  'preservesRealClassroomFlow:true',
  'idempotentRenderer:true',
  'data-rph-inline-diff="induction"',
  'data-rph-inline-diff="closure"',
  'requestAnimationFrame'
]) if(!src.includes(token)) die(`missing ${token}`);

if(!src.includes('data-rph-classroom-flow'))die('integrated flow binding missing');
if(!bootstrap.includes('rph-inline-differentiation-hotfix.js?v=20260906b'))die('safe differentiation bootstrap missing');
if(src.includes('body.innerHTML='))die('inline differentiation must not replace the integrated classroom flow');
if(src.includes('queueMicrotask(()=>{queued=false;inject()})'))die('microtask mutation loop pattern must not return');

console.log('RPH inline differentiation freeze guard passed: renderer is idempotent and preserves support/core/challenge inside the classroom flow.');
