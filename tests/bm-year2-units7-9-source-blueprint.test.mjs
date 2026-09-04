import fs from 'node:fs';
import assert from 'node:assert/strict';

const code=fs.readFileSync(new URL('../rph-bm-year2-units7-9-blueprint-hotfix.js', import.meta.url),'utf8');
const loader=fs.readFileSync(new URL('../app-v03334.js', import.meta.url),'utf8');

const routes=[
'1.1.2@44|W13|S1','2.2.1@45|W13|S2','3.2.2@46|W13|S3','4.2.1@47|W13|S4','5.1.3@48|W13|S5',
'1.1.3@49|W14|S1','2.2.1@50|W14|S2','3.2.2@51|W14|S3','4.2.1@52|W14|S4','5.1.3@53|W14|S5',
'2.2.1@50|W15|S1','3.2.2@51|W15|S2','4.2.1@52|W15|S3','5.1.4@54|W15|S4',
'1.1.3@55|W16|S1','2.2.1@56|W16|S2','3.2.3@57|W16|S3','5.1.4@58|W16|S4','5.1.4@58|W16|S5'];
for(const route of routes) assert.ok(code.includes(route),`missing route ${route}`);
assert.ok(code.includes("subjectKey(m)!=='bm'||year(m)!==2"),'must be isolated to BM Year 2');
for(const token of ['menu_seimbang_explore','menu_seimbang_apply','minum_air_explore','minum_air_apply','pantun_format_explore','pantun_format_apply','kata_sendi_explore','kata_sendi_apply']) assert.ok(code.includes(token),`missing ${token}`);
for(const sourceToken of ['isi tersirat','rima akhir','jeda','enam hingga lapan gelas','Pinggan Sihat Malaysia','kata adjektif waktu','kata hubung','idea sampingan','sebelum–semasa–selepas','kata sendi nama']) assert.ok(code.includes(sourceToken),`missing source anchor ${sourceToken}`);
assert.ok(code.includes('Activity Library hanya memvariasikan cara pelaksanaan'),'Activity Library must remain secondary');
assert.ok(loader.includes('rph-bm-year2-units7-9-blueprint-hotfix.js'),'production loader must include module');
assert.ok(!code.includes('Math.random('),'source blueprint must be deterministic');
console.log('BM Year 2 units 7-9 source blueprint guards passed');