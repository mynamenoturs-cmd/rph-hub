import fs from 'node:fs';
import assert from 'node:assert/strict';

const file='rph-science-year1-unit4-source-blueprint-hotfix.js';
const src=fs.readFileSync(new URL(`../${file}`,import.meta.url),'utf8');
const loader=fs.readFileSync(new URL('../app-v03334.js',import.meta.url),'utf8');

const routeBlock=(src.match(/const ROUTES=\{([\s\S]*?)\n\};/)||[])[1]||'';
const routes=[...routeBlock.matchAll(/"([^"]+)":"w\d+s\d+"/g)].map(m=>m[1]);
const reviewBlock=(src.match(/const REVIEW=new Set\(\[([\s\S]*?)\]\);/)||[])[1]||'';
const reviews=[...reviewBlock.matchAll(/"([^"]+)"/g)].map(m=>m[1]);

assert.equal(routes.length,20,'Unit 4 must expose exactly 20 W18-W21 routes');
assert.equal(new Set(routes).size,20,'Unit 4 routes must be unique');
assert.equal(reviews.length,12,'Unit 4 must keep exactly 12 alignment-review routes');
assert.ok(reviews.every(r=>routes.includes(r)),'Every review route must exist in ROUTES');
assert.ok(routes.every(r=>/\|W(18|19|20|21)\|S[1-5]$/.test(r)),'Only W18-W21 routes are allowed');
assert.ok(!routes.some(r=>/\|W22\|/.test(r)),'W22 belongs to Unit 5');
assert.ok(routes.every(r=>['31','32','34','37','39','40'].includes((r.match(/@(\d+)\|/)||[])[1])),'Only exact mapped printed pages are allowed');
for(const p of ['33','35','36','38']) assert.ok(!routes.some(r=>r.includes(`@${p}|`)),`Do not invent route for BT p.${p}`);
assert.ok(src.includes('sourceSectionAudit'), 'Must preserve p.34 source-section audit');
assert.ok(src.includes('Mari Mengelas'), 'Actual p.34 source task must be retained');
assert.ok(src.includes('Buku Besar Bahagian Deria Saya'), 'p.40 project must be source-locked');
assert.ok(src.includes('Activity Library may vary delivery only and must not determine lesson content'));
assert.ok(!src.includes('Math.random'));
assert.ok(!src.includes("mappingStatus:'VERIFIED'"));
assert.ok(!src.includes('mappingStatus:"VERIFIED"'));
assert.ok(src.includes("generateFlag:'YES'"));
assert.ok(src.includes('conditional:false'));

const marker='rph-science-year1-unit4-source-blueprint-hotfix.js?v=20260905a';
assert.equal(loader.split(marker).length-1,1,'Loader must include Unit 4 exactly once');
const a=loader.indexOf('rph-science-year1-unit3-source-blueprint-hotfix.js?v=20260905a');
const b=loader.indexOf(marker);
const c=loader.indexOf('rph-english-year2-unit5-source-blueprint-hotfix.js?v=20260905a');
assert.ok(a>=0&&b>a&&c>b,'Loader order must be Unit 3 -> Unit 4 -> English');

console.log(`Science Year 1 Unit 4 source-first blueprint static guard passed: ${routes.length} routes; alignment review: ${reviews.length} conditional: 0`);
