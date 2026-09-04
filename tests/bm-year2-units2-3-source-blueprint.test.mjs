import fs from 'node:fs';
import assert from 'node:assert/strict';

const code = fs.readFileSync(new URL('../rph-bm-year2-units2-3-blueprint-hotfix.js', import.meta.url), 'utf8');
const loader = fs.readFileSync(new URL('../app-v03334.js', import.meta.url), 'utf8');

for (const route of [
  '1.1.1@7|W3|S3',
  '2.1.1@8|W3|S4',
  '3.1.1@9|W4|S1',
  '4.1.1@10|W4|S2',
  '5.1.1@11|W4|S3',
  '5.1.1@11|W4|S4',
  '5.1.1@12|W4|S5',
  '1.1.1@13|W5|S1',
  '2.1.2@14|W5|S2',
  '2.1.2@14|W5|S3',
  '3.1.1@15|W5|S4',
  '4.1.1@16|W5|S5'
]) assert.ok(code.includes(route), `missing route ${route}`);

assert.ok(code.includes("subjectKey(m)!=='bm'||year(m)!==2"), 'blueprint must be isolated to BM Year 2');
assert.ok(code.includes('proper_nouns_explore') && code.includes('proper_nouns_apply'), 'Hamster sessions must be distinct exploration/application modes');
assert.ok(code.includes('chores_read_explore') && code.includes('chores_read_apply'), 'Agihan Tugas sessions must be distinct exploration/application modes');
assert.ok(code.includes('otak cair') && code.includes('panjang akal') && code.includes('ringan tulang'), 'simpulan bahasa must come from textbook source');
assert.ok(code.includes('indah seperti mahligai') && code.includes('lembut bak sutera') && code.includes('rajin macam semut'), 'bandingan semacam must come from textbook source');
assert.ok(code.includes('menyapu') && code.includes('mengelap') && code.includes('menyusun') && code.includes('menyidai'), 'Agihan Tugas source verbs must be preserved');
assert.ok(code.includes('Activity Library hanya memvariasikan cara pelaksanaan'), 'Activity Library must remain secondary');
assert.ok(loader.includes('rph-bm-year2-units2-3-blueprint-hotfix.js'), 'production loader must include BM Year 2 Units 2-3 blueprint');
assert.ok(!code.includes('Math.random('), 'source blueprint must be deterministic');

console.log('BM Year 2 Units 2-3 source blueprint guards passed');