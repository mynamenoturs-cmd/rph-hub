import fs from 'node:fs';
import assert from 'node:assert/strict';

const code = fs.readFileSync(new URL('../rph-bm-year2-unit1-blueprint-hotfix.js', import.meta.url), 'utf8');
const loader = fs.readFileSync(new URL('../app-v03334.js', import.meta.url), 'utf8');

for (const route of [
  '1.1.1@2|W2|S1',
  '1.1.1@2|W2|S2',
  '2.1.1@4|W2|S3',
  '3.1.1@5|W2|S4',
  '3.1.1@5|W2|S5'
]) assert.ok(code.includes(route), `missing route ${route}`);

assert.ok(code.includes("subjectKey(m)!=='bm'||year(m)!==2"), 'blueprint must be isolated to BM Year 2');
assert.ok(code.includes('ceria_explore') && code.includes('ceria_apply'), 'Ceria Pagi sessions must have distinct exploration/application modes');
assert.ok(code.includes('write_recipe_explore') && code.includes('write_recipe_apply'), 'Kek Hari Lahir sessions must have distinct exploration/application modes');
assert.ok(code.includes('Activity Library hanya memvariasikan cara pelaksanaan'), 'Activity Library must remain secondary to source task');
assert.ok(code.includes('BA1 m/s 1') && code.includes('BA1 m/s 4–5'), 'RPT-referenced BA evidence must be preserved for application sessions');
assert.ok(loader.includes('rph-bm-year2-unit1-blueprint-hotfix.js'), 'production loader must include BM Year 2 Unit 1 blueprint');
assert.ok(!code.includes('Math.random('), 'source blueprint must be deterministic');

console.log('BM Year 2 Unit 1 source blueprint guards passed');