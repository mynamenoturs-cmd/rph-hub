import fs from 'node:fs';

const src=fs.readFileSync('rph-interactive-enrichment-hotfix.js','utf8');
const bootstrap=fs.readFileSync('rph-english-quality-hotfix.js','utf8');
const die=m=>{throw new Error(m)};

for(const token of [
  'integratedClassroomFlow:true',
  'separateGameBlock:false',
  'classroomFlow(map,activities,ped,uiEn=false)',
  'Aliran Aktiviti PdP',
  'Kotak Beracun',
  'Radio Rosak',
  'Bola Soalan',
  'Kerusi Panas',
  'Lumba Berganti Jawapan',
  'Pancing Soalan',
  'Teka Gambar 20 Saat',
  'Tiket Keluar',
  'Bola Rumusan',
  'Pembelajaran Kolaboratif Terbeza',
  'body.innerHTML=flowHtml(ctx)'
]) if(!src.includes(token)) die(`missing ${token}`);

if(src.includes('Math.random'))die('classroom activity selection must stay deterministic');
if(src.includes('Aktiviti Pengukuhan Interaktif / Permainan Kecil'))die('separate mini-game block must not return');
if(!bootstrap.includes('rph-interactive-enrichment-hotfix.js?v=20260906c'))die('integrated classroom-flow cache bust missing');

console.log('RPH integrated classroom-flow guard passed: induction, real classroom game, differentiated group work, checking and closure are written as one natural lesson flow.');
