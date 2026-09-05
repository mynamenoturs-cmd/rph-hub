import fs from 'node:fs';
import assert from 'node:assert/strict';

const modulePath='rph-science-year1-unit1-source-blueprint-hotfix.js';
const loaderPath='app-v03334.js';
assert.ok(fs.existsSync(modulePath),`${modulePath} missing`);
const src=fs.readFileSync(modulePath,'utf8');
const loader=fs.readFileSync(loaderPath,'utf8');

const expected=[
'1.1.1@1|W5|S1','1.1.1@1|W5|S2','1.1.1@2|W5|S3','1.1.1@2|W5|S4','1.1.1@3|W5|S5',
'1.1.2@4|W7|S1','1.1.2@4|W7|S2','1.1.2@4|W7|S3','1.1.2@5|W7|S4','1.1.2@5|W7|S5'
];
for(const route of expected) assert.ok(src.includes(`"${route}"`),`missing route ${route}`);
const routeMatches=[...src.matchAll(/"\d+\.\d+\.\d+@\d+\|W\d+\|S\d+"/g)].map(m=>m[0]);
assert.equal(new Set(routeMatches).size,10,'must contain exactly 10 unique Unit 1 routes');
assert.ok(!src.includes('|W6|'),'W6 is NO and must not have a route');
assert.ok(!src.includes('|W1|')&&!src.includes('|W2|')&&!src.includes('|W3|')&&!src.includes('|W4|'),'transition weeks must not have routes');
for(const phrase of ['Memerhati Alat Muzik','Berkomunikasi — Menyampaikan Maklumat','Membina Model Biri-biri','Activity Library may vary delivery only and must not determine lesson content','Tiada buku aktiviti berasingan dibekalkan']) assert.ok(src.includes(phrase),`missing policy/source phrase: ${phrase}`);
assert.ok(!src.includes('Math.random'),'must not use Math.random');
assert.ok(!/mappingStatus\s*:\s*['"]VERIFIED['"]/.test(src),'must not force VERIFIED');
const loaderLine='rph-science-year1-unit1-source-blueprint-hotfix.js?v=20260905a';
assert.equal(loader.split(loaderLine).length-1,1,'loader must include Unit 1 exactly once');
assert.ok(loader.indexOf('rph-science-year3-future-blueprint-hotfix.js') < loader.indexOf(loaderLine),'Unit 1 loader should follow existing science blueprints');
assert.ok(loader.indexOf(loaderLine) < loader.indexOf('rph-english-year2-unit5-source-blueprint-hotfix.js'),'Unit 1 loader should stay inside science block');
console.log('Science Year 1 Unit 1 source-first guard passed: 10 routes; W6 excluded.');
