import fs from 'node:fs';
import assert from 'node:assert/strict';

const file='rph-science-year1-unit7-source-blueprint-hotfix.js';
const src=fs.readFileSync(new URL(`../${file}`,import.meta.url),'utf8');
const loader=fs.readFileSync(new URL('../app-v03334.js',import.meta.url),'utf8');

const routeBlock=(src.match(/const ROUTES=\{([\s\S]*?)\n\};/)||[])[1]||'';
const routes=[...routeBlock.matchAll(/"([^"]+)":"w\d+s\d+"/g)].map(m=>m[1]);
const reviewBlock=(src.match(/const REVIEW=new Set\(\[([\s\S]*?)\]\);/)||[])[1]||'';
const reviews=[...reviewBlock.matchAll(/"([^"]+)"/g)].map(m=>m[1]);
const conditionalBlock=(src.match(/const CONDITIONAL=new Set\(\[([\s\S]*?)\]\);/)||[])[1]||'';
const conditionals=[...conditionalBlock.matchAll(/"([^"]+)"/g)].map(m=>m[1]);

assert.equal(routes.length,15,'Unit 7 must expose exactly 15 W28-W30 routes');
assert.equal(new Set(routes).size,15,'Unit 7 routes must be unique');
assert.equal(reviews.length,6,'Unit 7 must keep exactly 6 alignment-review routes');
assert.equal(conditionals.length,5,'Unit 7 must keep exactly 5 W30 conditional routes');
assert.ok(conditionals.every(r=>/\|W30\|S[1-5]$/.test(r)),'Only W30 routes may be conditional');
assert.ok(routes.every(r=>/\|W(28|29|30)\|S[1-5]$/.test(r)),'Only W28-W30 routes are allowed');
assert.ok(routes.every(r=>['61','62','64','65','67','68','69','70'].includes((r.match(/@(\d+)\|/)||[])[1])),'Only exact mapped pages are allowed');
for(const p of ['63','66']) assert.ok(!routes.some(r=>r.includes(`@${p}|`)),`Do not invent route for BT p.${p}`);
assert.ok(src.includes('Cuti Maulud Nabi'));
assert.ok(src.includes("flag=cond?'CONDITIONAL':'YES'"));
assert.ok(src.includes('Helper magnet lama kekal sebagai fallback topik'));
assert.ok(src.includes('Activity Library may vary delivery only and must not determine lesson content'));
assert.ok(!src.includes('Math.random'));
assert.ok(!src.includes("mappingStatus:'VERIFIED'"));
assert.ok(!src.includes('mappingStatus:"VERIFIED"'));

const marker='rph-science-year1-unit7-source-blueprint-hotfix.js?v=20260905a';
assert.equal(loader.split(marker).length-1,1,'Loader must include Unit 7 exactly once');
const legacy=loader.indexOf('rph-science-magnet-blueprint-hotfix.js?v=20260904a');
const u6=loader.indexOf('rph-science-year1-unit6-source-blueprint-hotfix.js?v=20260905a');
const u7=loader.indexOf(marker);
const english=loader.indexOf('rph-english-year2-unit5-source-blueprint-hotfix.js?v=20260905a');
assert.ok(legacy>=0&&u6>legacy&&u7>u6&&english>u7,'Loader order must keep legacy magnet helper before Unit 6 -> Unit 7 -> English');

console.log(`Science Year 1 Unit 7 source-first blueprint static guard passed: ${routes.length} routes; alignment review: ${reviews.length} conditional: ${conditionals.length}`);