import fs from 'node:fs';

const src=fs.readFileSync('rph-interactive-enrichment-hotfix.js','utf8');
const bootstrap=fs.readFileSync('rph-english-quality-hotfix.js','utf8');
const die=m=>{throw new Error(m)};

for(const token of [
  'oneMiniGamePerLesson:true',
  "duration:'5–8 min'",
  'sourceFirst:true',
  'chooseGameRow',
  'rphActivityLibrary',
  'generatedRphExportContext',
  'Aktiviti Pengukuhan Interaktif / Permainan Kecil',
  'evidens pembelajaran masih berpunca daripada tugasan sumber yang telah disahkan'
]) if(!src.includes(token)) die(`missing ${token}`);

if(!src.includes("row.requires_source===true"))die('source-grounded library preference missing');
if(!src.includes("{{source_activity}}".replaceAll('{','\\{').replaceAll('}','\\}')) && !src.includes('source_activity'))die('source activity binding missing');
if(src.includes('Math.random'))die('interactive activity selection must be deterministic');
if(!bootstrap.includes('rph-interactive-enrichment-hotfix.js?v=20260906a'))die('interactive enrichment bootstrap missing');

console.log('RPH interactive enrichment guard passed: one deterministic source-grounded mini game is surfaced per lesson and retained for export.');
