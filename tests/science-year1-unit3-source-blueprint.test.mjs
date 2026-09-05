import fs from 'node:fs';
import assert from 'node:assert/strict';

const file='rph-science-year1-unit3-source-blueprint-hotfix.js';
const src=fs.readFileSync(file,'utf8');

assert.ok(src.includes("window.rphScienceYear1Unit3SourceBlueprint=blueprint"));
assert.ok(src.includes("Activity Library may vary delivery only and must not determine lesson content"));
assert.ok(src.includes("W15 menggunakan tarikh Kumpulan B yang dinormalisasi kepada 27-30.04.2026"));
assert.ok(src.includes("tidak mengubah Lesson Mapping atau verification status"));
assert.ok(!src.includes('Math.random'));
assert.ok(!/mappingStatus\s*:\s*['\"]VERIFIED['\"]/.test(src));
assert.ok(!/mapping_status\s*:\s*['\"]VERIFIED['\"]/.test(src));
assert.ok(!/generateFlag\s*:\s*['\"]CONDITIONAL['\"]/.test(src));
assert.ok(!/@(?:19|21|22|23|25|27|28)\|W1[3-7]\|S[1-5]/.test(src));

const routeBlock=src.match(/const ROUTES=\{([\s\S]*?)\n\};/);
assert.ok(routeBlock,'ROUTES block missing');
const routes=[...routeBlock[1].matchAll(/"([^"]+)":"w\d+s\d+"/g)].map(m=>m[1]);
assert.equal(routes.length,25,'expected 25 exact routes');
assert.equal(new Set(routes).size,25,'routes must be unique');

for(const route of routes){
 const m=route.match(/^([0-9.]+)@(\d+)\|W(\d+)\|S(\d+)$/);
 assert.ok(m,`bad route ${route}`);
 const [,ls,p,w,s]=m;
 assert.ok(Number(w)>=13&&Number(w)<=17,`week out of scope ${route}`);
 assert.ok(Number(s)>=1&&Number(s)<=5,`session out of scope ${route}`);
 assert.ok([17,18,20,24,26,29,30].includes(Number(p)),`unexpected page ${route}`);
 assert.ok(['3.1.1','3.1.2','3.2.1','3.2.2','3.2.3','3.2.4','3.2.5'].includes(ls),`unexpected SP ${route}`);
}

const directBlock=src.match(/const DIRECT=new Set\(\[([\s\S]*?)\]\);/);
assert.ok(directBlock,'DIRECT block missing');
const direct=[...directBlock[1].matchAll(/"([^"]+)"/g)].map(m=>m[1]);
assert.equal(direct.length,13,'expected 13 conservative direct-alignment routes');
assert.equal(new Set(direct).size,13,'DIRECT routes must be unique');
for(const r of direct)assert.ok(routes.includes(r),`DIRECT route missing from ROUTES: ${r}`);
assert.equal(routes.length-direct.length,12,'expected 12 alignment-review routes');

const expected=[
'3.1.1@17|W13|S1','3.1.1@17|W13|S2','3.1.1@17|W13|S3','3.1.1@17|W13|S4','3.1.1@18|W13|S5',
'3.1.1@18|W14|S1','3.1.1@18|W14|S2','3.1.1@18|W14|S3','3.1.2@20|W14|S4','3.1.2@20|W14|S5',
'3.1.2@20|W15|S1','3.1.2@20|W15|S2','3.1.2@24|W15|S3','3.1.2@24|W15|S4','3.1.2@24|W15|S5',
'3.2.1@26|W16|S1','3.2.1@26|W16|S2','3.2.2@26|W16|S3','3.2.2@26|W16|S4','3.2.3@29|W16|S5',
'3.2.3@29|W17|S1','3.2.4@29|W17|S2','3.2.4@30|W17|S3','3.2.5@30|W17|S4','3.2.5@30|W17|S5'
];
assert.deepEqual(routes,expected,'route map drifted from supplied Mapping');

console.log(`Science Year 1 Unit 3 source-first blueprint static guard passed: ${routes.length} routes; alignment review: ${routes.length-direct.length}; conditional: 0`);
