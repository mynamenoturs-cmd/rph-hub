import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const files = [
  ['../rph-bm-year1-unit19-blueprint-hotfix.js', ['1.1.2@118','2.3.1@119','3.2.2@120','5.2.2@121','5.2.3@122']],
  ['../rph-bm-year1-unit20-blueprint-hotfix.js', ['1.1.2@123','2.3.2@124','3.2.3@126','5.1.4@127','5.3.1@128']],
  ['../rph-bm-year1-unit21-blueprint-hotfix.js', ['1.1.2@129','2.3.1@130','3.3.1@131','5.3.1@132','5.3.1@133','5.3.1@134','2.3.1@136']],
];

const loader = await fs.readFile(new URL('../app-v03334.js', import.meta.url), 'utf8');
for (const [rel, routes] of files) {
  const src = await fs.readFile(new URL(rel, import.meta.url), 'utf8');
  const basename = rel.replace('../','');
  assert.ok(loader.includes(`${basename}?v=20260904a`), `Production loader must load ${basename}`);
  assert.ok(src.includes("subjectKey(m)!=='bm'||year(m)!==1"), `${basename} must stay isolated to BM Year 1`);
  assert.ok(src.includes("method:'Aktiviti source-first berdasarkan RPT + DSKP + Buku Teks'"), `${basename} must be source-first`);
  assert.ok(src.includes('librarySteps:{support:c.support,core:c.core,challenge:c.challenge}'), `${basename} must provide differentiated source steps`);
  assert.ok(src.includes("_runtime_bm_source_blueprint:true"), `${basename} must remain runtime-traceable`);
  for (const route of routes) assert.ok(src.includes(`'${route}'`), `${basename} missing exact route ${route}`);
}

const unit19 = await fs.readFile(new URL('../rph-bm-year1-unit19-blueprint-hotfix.js', import.meta.url), 'utf8');
assert.ok(unit19.includes('apa, di mana, bila dan berapa'), 'Kolam Ikan Indira must retain the four focused-question types');
assert.ok(unit19.includes('kata majmuk'), 'Kegunaan Rumput must teach kata majmuk');
assert.ok(unit19.includes('kata ganda'), 'Kebun Mini must teach kata ganda');

const unit20 = await fs.readFile(new URL('../rph-bm-year1-unit20-blueprint-hotfix.js', import.meta.url), 'utf8');
assert.ok(unit20.includes('Reader’s Theatre'), 'Haiwan yang Prihatin must retain reader-theatre pedagogy');
assert.ok(unit20.includes('pengurusan grafik'), 'Diari Abang must transfer information into a graphic organiser');
assert.ok(unit20.includes('dan, tetapi atau'), 'Taman Botani must use the source conjunctions');

const unit21 = await fs.readFile(new URL('../rph-bm-year1-unit21-blueprint-hotfix.js', import.meta.url), 'utf8');
assert.ok(unit21.includes('karangan terkawal'), 'Beg Mesra Alam must remain controlled writing');
assert.ok(unit21.includes('sila, jangan dan tolong'), 'Menaiki Komuter must retain imperative-word cues');
assert.ok(unit21.includes('warna tong'), 'Tong Kitar Semula must classify by bin colour and source evidence');

console.log('BM Year 1 Units 19-21 source blueprint tests passed');
