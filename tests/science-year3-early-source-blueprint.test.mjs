import fs from 'node:fs';
import assert from 'node:assert/strict';
const p='rph-science-year3-early-source-blueprint-hotfix.js';
const s=fs.readFileSync(p,'utf8');
const loader=fs.readFileSync('app-v03334.js','utf8');

assert.match(s,/window\.rphScienceYear3EarlySourceBlueprint=blueprint/);
assert.match(s,/W2-W11/);
assert.match(s,/W1 dan W6 ialah NO/);
assert.match(s,/W12 bermula Unit 3 Manusia/);
assert.match(s,/Activity Library may vary delivery only and must not determine lesson content/);
assert.match(s,/Buku Aktiviti tidak digunakan sebagai sumber kandungan blueprint ini/);
assert.doesNotMatch(s,/Math\.random/);
assert.doesNotMatch(s,/mappingStatus\s*:\s*['"]VERIFIED['"]/);
assert.doesNotMatch(s,/Generate_Flag\s*=\s*['"]CONDITIONAL['"]/);
assert.match(s,/generateFlag:'YES'/);
assert.match(s,/conditional:false/);

const routeAdds=[...s.matchAll(/addWeek\((\d+),'([^']+)',(\d+)\)/g)];
assert.equal(routeAdds.length,7,'expected 7 five-session week route groups');
const generated=routeAdds.length*5 + 10;
assert.equal(generated,45,'expected 45 exact routes');
assert.match(s,/for\(const w of \[10,11\]\)/);
assert.match(s,/REVIEW=new Set\(Object\.keys\(ROUTES\)\.filter/);
assert.match(s,/W\(\?:10\|11\)/);
assert.match(s,/Kekalkan tugasan sebenar Buku Teks m\/s 15/);
assert.match(s,/jangan cipta aktiviti lain untuk memaksa padanan/);

const iOld=loader.indexOf('rph-science-year3-source-blueprint-hotfix.js');
const iFuture=loader.indexOf('rph-science-year3-future-blueprint-hotfix.js');
const iNew=loader.indexOf(p);
const iEnglish=loader.indexOf('rph-english-year2-unit5-source-blueprint-hotfix.js');
assert.ok(iOld>=0 && iFuture>=0 && iNew>=0 && iEnglish>=0);
assert.ok(iOld<iNew && iFuture<iNew && iNew<iEnglish,'loader order must keep old Year3 helpers as fallback, then exact Year3 early, then English');
assert.equal(loader.split(p).length-1,1,'loader should include Year3 early exactly once');

console.log('Science Year 3 W2-W11 source-first blueprint static guard passed: 45 routes; alignment review: 10 conditional: 0');