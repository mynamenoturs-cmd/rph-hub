import fs from 'node:fs';
const src=fs.readFileSync('rph-science-year3-unit10-source-blueprint-hotfix.js','utf8');
const die=m=>{throw new Error(m)};
for(const token of ["['10.1.1',128]","['10.1.2',129]","['10.1.3',131]","['10.1.4',133]","['10.1.5',135]"])if(!src.includes(token))die(`missing standard ${token}`);
for(const token of [
  "'10.1.1@128|W36|S1':'w36a1'",
  "'10.1.2@129|W36|S2':'w36a2'",
  "'10.1.3@131|W37|S1':'w37a1'",
  "'10.1.4@133|W37|S2':'w37a2'",
  "'10.1.5@135|W37|S2':'w37a2c'"
])if(!src.includes(token))die(`missing actual timetable route ${token}`);
if(!src.includes('timetableSessionsPerWeek:2'))die('Unit 10 must use two actual Science sessions per week');
if(!src.includes('sourcePoolSessions:5'))die('S1-S5 must remain source-pool metadata');
if(!src.includes("wk(m)===37&&se(m)===2&&sp(m)==='10.1.4'"))die('W37 S2 combined 10.1.4 + 10.1.5 pair missing');
if(!src.includes('merekod sekurang-kurangnya satu pemerhatian serta menerangkan sekurang-kurangnya satu dapatan'))die('combined W37 S2 measurable criteria missing');
if(!src.includes('const REVIEW=new Set();'))die('Unit 10 should have zero alignment review routes');
if(!src.includes('W38 ialah Revision'))die('W38 revision boundary missing');
if(/\|W(?:35|38)\|S/.test(src))die('route leaked outside W36-W37');
if(src.includes('Math.random'))die('Math.random forbidden');
if(/mappingStatus\s*:\s*['"]VERIFIED['"]/.test(src))die('must not force VERIFIED');
if(!src.includes('Activity Library may vary delivery only and must not determine lesson content'))die('activity library policy missing');
if(!src.includes('jangan reka aktiviti Buku Aktiviti'))die('activity book guard missing');
if(!src.includes('alat tajam atau kerja memotong dikendalikan atau diawasi guru'))die('model safety guard missing');
if(!src.includes('_runtime_science_year3_unit10_actual_timetable_route=true'))die('actual timetable route runtime marker missing');
if(!src.includes("window.rphScienceYear3Unit10SourceBlueprint=blueprint"))die('export missing');
if(!src.includes('conditional:[]'))die('Unit 10 conditional list must be empty');
if(!src.includes('measurableObjectives:true'))die('measurable objective metadata missing');
console.log('Science Year 3 Unit 10 guard passed: actual S1/S2 timetable routes active; S1-S5 retained as source pool; measurable pairs active.');
