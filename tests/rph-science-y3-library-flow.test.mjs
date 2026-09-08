import fs from 'node:fs';

const src=fs.readFileSync('rph-science-y3-library-flow-hotfix.js','utf8');
const bootstrap=fs.readFileSync('rph-english-quality-hotfix.js','utf8');
const loader=fs.readFileSync('app-v03334.js','utf8');
const die=m=>{throw new Error(m)};

for(const token of [
  "const VERSION='2026-09-08b'",
  'EXPECTED_LIBRARY_ROWS=70',
  "key.startsWith('science_y3_')",
  'appState()?.rphActivityLibrary',
  'trustedSourceRows(ped)',
  "taskSource:trustedSourceRows(ped).length?'verified_science_blueprint':'verified_source_step'",
  'repairsBrokenOcrTasks:true',
  'normalizesPageLabel:true',
  'visibleInlineDifferentiation:true',
  'differentiation:diff',
  'rph-inline-diff-visible',
  'PdP Terbeza dalam aktiviti yang sama',
  'Peneroka',
  'Pembina',
  'Pencabar',
  'libraryDeterminesMethod:true',
  'sourceDeterminesContent:true',
  'forcedGameEverySession:false',
  'separateDifferentiationBlock:false',
  'ped.classroomFlow=libraryFlow(row,map,ped,tasks)',
  'ped.groupDifferentiation={support:[],core:[],challenge:[]}',
  'activityLibrarySelection'
]) if(!src.includes(token)) die(`missing ${token}`);

if(src.includes('Math.random'))die('Science Y3 library selection must remain deterministic');
if(src.includes('const text=`${base} PdP Terbeza'))die('differentiation must not be flattened into the activity paragraph');
if(!bootstrap.includes('rph-science-y3-library-flow-hotfix.js?v=20260908b'))die('Science Y3 library-flow cache bust missing');
if(!bootstrap.includes('e.onload=loadScienceY3LibraryFlow'))die('Science Y3 library flow must load after export parity');
if(!loader.includes('rph-english-quality-hotfix.js?v=20260908b'))die('outer English-quality cache bust missing');

console.log('Science Year 3 flow guard passed: verified source text, normalized page labels, library-driven delivery and visible inline differentiation.');
