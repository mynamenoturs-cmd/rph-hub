import fs from 'node:fs';
import assert from 'node:assert/strict';

const code = fs.readFileSync(new URL('../rph-bm-year2-units10-12-blueprint-hotfix.js', import.meta.url), 'utf8');
const loader = fs.readFileSync(new URL('../app-v03334.js', import.meta.url), 'utf8');

for (const route of [
  '1.2.1@63|W18|S1','1.2.1@63|W19|S1',
  '2.2.1@65|W18|S2','2.2.1@65|W19|S2',
  '3.2.4@66|W18|S3','3.2.4@66|W19|S3',
  '5.1.4@68|W18|S5',
  '1.2.2@69|W19|S5','2.3.1@70|W20|S1','3.2.4@71|W20|S2','5.1.2@74|W20|S4',
  '1.1.1@75|W21|S1','2.3.1@76|W21|S2','3.3.1@77|W21|S3','5.1.4@78|W21|S4',
  '5.1.4@79|W22|S1','1.1.1@75|W22|S2','2.3.1@76|W22|S3','3.3.1@77|W22|S4','1.2.1@81|W22|S5'
]) assert.ok(code.includes(route), `missing source-first route ${route}`);

assert.ok(code.includes("subjectKey(m)!=='bm'||year(m)!==2"), 'must remain isolated to BM Year 2');
assert.ok(code.includes("'2.2.1@67|W19|S4'"), 'page 67 mismatch must be guarded');
assert.ok(code.includes('SP 4.2.2(i)'), 'page 67 review reason must preserve textbook SP evidence');
assert.ok(code.includes("'5.1.2@72|W20|S3'"), 'page 72 mismatch must be guarded');
assert.ok(code.includes('Kata Perintah'), 'page 72 review reason must state source task');
assert.ok(code.includes('Activity Library hanya memvariasikan pelaksanaan'), 'Activity Library must remain secondary');
assert.ok(code.includes('dabus_explore') && code.includes('dabus_apply'), 'Dabus repeated sessions must differ');
assert.ok(code.includes('ambeng_explore') && code.includes('ambeng_apply'), 'Nasi Ambeng repeated sessions must differ');
assert.ok(code.includes('amplang_explore') && code.includes('amplang_apply'), 'Amplang repeated sessions must differ');
assert.ok(code.includes('budi_bahasa_explore') && code.includes('budi_bahasa_apply'), 'Unit 12 repeated listening sessions must differ');
assert.ok(code.includes('teater_explore') && code.includes('teater_apply'), 'Teater repeated writing sessions must differ');
assert.ok(loader.includes('rph-bm-year2-units10-12-blueprint-hotfix.js'), 'production loader must include Units 10-12 blueprint');
assert.ok(!code.includes('Math.random('), 'source blueprint must be deterministic');

console.log('BM Year 2 Units 10-12 source blueprint guards passed');