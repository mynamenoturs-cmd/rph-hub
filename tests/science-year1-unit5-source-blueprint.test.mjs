import fs from 'node:fs';
import assert from 'node:assert/strict';

const file='rph-science-year1-unit5-source-blueprint-hotfix.js';
const src=fs.readFileSync(new URL(`../${file}`,import.meta.url),'utf8');
const loader=fs.readFileSync(new URL('../app-v03334.js',import.meta.url),'utf8');

const routeBlock=(src.match(/const ROUTES=\{([\s\S]*?)\n\};/)||[])[1]||'';
const routes=[...routeBlock.matchAll(/"([^"]+)":"w\d+s\d+"/g)].map(m=>m[1]);
const reviewBlock=(src.match(/const REVIEW=new Set\(\[([\s\S]*?)\]\);/)||[])[1]||'';
const reviews=[...reviewBlock.matchAll(/"([^"]+)"/g)].map(m=>m[1]);

assert.equal(routes.length,15,'Unit 5 must expose exactly 15 W22-W24 routes');
assert.equal(new Set(routes).size,15,'Unit 5 routes must be unique');
assert.equal(reviews.length,10,'Unit 5 must keep exactly 10 alignment-review routes');
assert.ok(reviews.every(r=>routes.includes(r)),'Every review route must exist in ROUTES');
assert.ok(routes.every(r=>/\|W(22|23|24)\|S[1-5]$/.test(r)),'Only W22-W24 routes are allowed');
assert.ok(!routes.some(r=>/\|W25\|/.test(r)),'W25 belongs to Unit 6');
assert.ok(routes.every(r=>['41','42','46','48','49','50'].includes((r.match(/@(\d+)\|/)||[])[1])),'Only exact mapped printed pages are allowed');
for(const p of ['43','44','45','47']) assert.ok(!routes.some(r=>r.includes(`@${p}|`)),`Do not invent route for BT p.${p}`);
for(const marker of ['Pengenalan Unit 5','Bahagian Tubuh Haiwan','Kepentingan Bahagian Tubuh','Eh, Kita Serupa!','Mari Ulang Kaji','Poskad Haiwan']) assert.ok(src.includes(marker),`Missing audited source marker: ${marker}`);
assert.ok(src.includes('Activity Library may vary delivery only and must not determine lesson content'));
assert.ok(src.includes('Buku Aktiviti tidak digunakan sebagai sumber kandungan'));
assert.ok(!src.includes('Math.random'));
assert.ok(!src.includes("mappingStatus:'VERIFIED'"));
assert.ok(!src.includes('mappingStatus:"VERIFIED"'));
assert.ok(src.includes("generateFlag:'YES'"));
assert.ok(src.includes('conditional:false'));

const marker='rph-science-year1-unit5-source-blueprint-hotfix.js?v=20260905a';
assert.equal(loader.split(marker).length-1,1,'Loader must include Unit 5 exactly once');
const a=loader.indexOf('rph-science-year1-unit4-source-blueprint-hotfix.js?v=20260905a');
const b=loader.indexOf(marker);
const c=loader.indexOf('rph-english-year2-unit5-source-blueprint-hotfix.js?v=20260905a');
assert.ok(a>=0&&b>a&&c>b,'Loader order must be Unit 4 -> Unit 5 -> English');

console.log(`Science Year 1 Unit 5 source-first blueprint static guard passed: ${routes.length} routes; alignment review: ${reviews.length} conditional: 0`);