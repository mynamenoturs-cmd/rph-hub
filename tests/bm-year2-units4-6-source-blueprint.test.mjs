import fs from 'node:fs';
import assert from 'node:assert/strict';

const code = fs.readFileSync(new URL('../rph-bm-year2-units4-6-blueprint-hotfix.js', import.meta.url), 'utf8');
const loader = fs.readFileSync(new URL('../app-v03334.js', import.meta.url), 'utf8');

for (const route of [
  '1.1.2@21|W8|S1','2.1.2@23|W8|S2','3.2.1@24|W8|S3','4.1.1@25|W8|S4','5.1.2@26|W8|S5',
  '1.1.2@27|W9|S1','2.2.1@28|W9|S2','3.2.1@29|W9|S3','4.2.1@30|W9|S4','5.1.2@31|W9|S5',
  '2.2.1@28|W10|S1','3.2.1@29|W10|S2','4.2.1@30|W10|S3','5.1.3@32|W10|S4',
  '1.1.2@33|W11|S1','2.2.1@34|W11|S2','3.2.1@36|W11|S3','5.1.3@37|W11|S4','5.1.3@38|W11|S5'
]) assert.ok(code.includes(route), `missing route ${route}`);

assert.ok(code.includes("subjectKey(m)!=='bm'||year(m)!==2"), 'must be isolated to BM Year 2');
assert.ok(code.includes('majlis_kosa_explore') && code.includes('majlis_kosa_apply'), 'repeated vocabulary sessions must differ');
assert.ok(code.includes('orang_berbudi_explore') && code.includes('orang_berbudi_apply'), 'repeated picture-sequence sessions must differ');
assert.ok(code.includes('seia_sekata_explore') && code.includes('seia_sekata_apply'), 'repeated pantun sessions must differ');
assert.ok(code.includes('Activity Library hanya memvariasikan cara pelaksanaan'), 'Activity Library must remain secondary');
assert.ok(code.includes('bagai isi dengan kuku') && code.includes('seperti aur dengan tebing'), 'source perumpamaan must be preserved');
assert.ok(code.includes('empuk, sejuk, lembut, jernih dan ligat'), 'source adjective-sifat vocabulary must be preserved');
assert.ok(loader.includes('rph-bm-year2-units4-6-blueprint-hotfix.js'), 'production loader must include units 4-6 blueprint');
assert.ok(!code.includes('Math.random('), 'source blueprint must be deterministic');

console.log('BM Year 2 units 4-6 source blueprint guards passed');