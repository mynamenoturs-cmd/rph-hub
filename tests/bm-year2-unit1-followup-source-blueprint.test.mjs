import fs from 'node:fs';
import assert from 'node:assert/strict';

const code = fs.readFileSync(new URL('../rph-bm-year2-unit1-followup-blueprint-hotfix.js', import.meta.url), 'utf8');
const loader = fs.readFileSync(new URL('../app-v03334.js', import.meta.url), 'utf8');

assert.ok(code.includes("mainSp(m)!=='5.1.1'||page(m)!==6||week(m)!==3"), 'follow-up must target only BM Year 2 Unit 1 page 6');
assert.ok(code.includes("session(m)===1?'common_noun_explore':session(m)===2?'common_noun_apply'"), 'duplicate Unit 1 sessions must have distinct modes');
assert.ok(code.includes('benda, manusia, tempat atau haiwan'), 'kata nama am categories must be source-aligned');
assert.ok(code.includes('BA1 m/s 6–8'), 'application session must preserve RPT BA reference');
assert.ok(loader.includes('rph-bm-year2-unit1-followup-blueprint-hotfix.js'), 'production loader must include Unit 1 follow-up blueprint');
assert.ok(!code.includes('Math.random('), 'source blueprint must remain deterministic');

console.log('BM Year 2 Unit 1 follow-up source blueprint guards passed');