import fs from 'node:fs';
import assert from 'node:assert/strict';

const modulePath='rph-science-year1-w8-w12-source-blueprint-hotfix.js';
const loaderPath='app-v03334.js';
const src=fs.readFileSync(modulePath,'utf8');
const loader=fs.readFileSync(loaderPath,'utf8');

const routeBlock=src.match(/const ROUTES=\{([\s\S]*?)\};\nconst ALIGNMENT_REVIEW/);
assert(routeBlock,'ROUTES block missing');
const routes=[...routeBlock[1].matchAll(/"([^"]+@(?:6|7|8|9|10|11|12|13|14|16)\|W(?:8|9|10|11|12)\|S[1-5])"/g)].map(m=>m[1]);
assert.equal(routes.length,25,`expected 25 routes, got ${routes.length}`);
assert.equal(new Set(routes).size,25,'duplicate route keys detected');

for(const w of [8,9,10,11,12]){
  const count=routes.filter(r=>r.includes(`|W${w}|`)).length;
  assert.equal(count,5,`W${w} expected 5 routes, got ${count}`);
}
assert(!routes.some(r=>r.includes('|W6|')),'W6 must remain NO and unrouted');
assert(!routes.some(r=>/@15\|/.test(r)),'BT p.15 must not be invented because exact mapping has no p.15 route');

const alignBlock=src.match(/const ALIGNMENT_REVIEW=new Set\(\[([\s\S]*?)\]\);/);
assert(alignBlock,'ALIGNMENT_REVIEW block missing');
const align=[...alignBlock[1].matchAll(/"([^"]+)"/g)].map(m=>m[1]);
assert.equal(align.length,9,`expected 9 alignment-review routes, got ${align.length}`);
for(const r of align) assert(routes.includes(r),`alignment route missing from ROUTES: ${r}`);

for(const page of ['"6":','"7":','"8":','"9":','"10":','"11":','"12":','"13":','"14":','"16":']) assert(src.includes(page),`missing source page ${page}`);
assert(src.includes('Mari Uji — Cantiknya Bawang'),'Cantiknya Bawang source task missing');
assert(src.includes('Kajian Lapangan Daun'),'leaf field-study source task missing');
assert(src.includes('Dadu Peraturan Bilik Sains'),'science-room-rules dice source task missing');
assert(src.includes('Activity Library may vary delivery only and must not determine lesson content'),'Activity Library policy missing');
assert(src.includes('Tiada buku aktiviti berasingan dibekalkan'),'activity-book no-invention policy missing');
assert(src.includes('Tiada route BT m/s 15'),'p.15 no-route policy missing');
assert(!src.includes('Math.random'),'Math.random is forbidden');
assert(!/mappingStatus\s*:\s*['"]VERIFIED['"]/.test(src),'must not force VERIFIED mapping status');

const loaderLine='rph-science-year1-w8-w12-source-blueprint-hotfix.js?v=20260905a';
assert.equal(loader.split(loaderLine).length-1,1,'loader must include W8-W12 blueprint exactly once');
const prev=loader.indexOf('rph-science-year1-unit1-source-blueprint-hotfix.js?v=20260905a');
const cur=loader.indexOf(loaderLine);
const eng=loader.indexOf('rph-english-year2-unit5-source-blueprint-hotfix.js?v=20260905a');
assert(prev>=0&&cur>prev&&eng>cur,'loader order must be Science Y1 Unit1 -> Science Y1 W8-W12 -> English');

console.log(`Science Year 1 W8-W12 source-first static guard passed: ${routes.length} routes; alignment review: ${align.length}; conditional: 0`);
