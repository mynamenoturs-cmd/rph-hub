import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const blueprint = await fs.readFile(new URL('../rph-science-year2-technology-blueprint-hotfix.js', import.meta.url), 'utf8');
const loader = await fs.readFile(new URL('../app-v03334.js', import.meta.url), 'utf8');

assert.ok(loader.includes('rph-science-year2-technology-blueprint-hotfix.js?v=20260904a'), 'Production loader must load Year 2 technology blueprint');
assert.ok(loader.indexOf('rph-science-year2-water-air-blueprint-hotfix.js') < loader.indexOf('rph-science-year2-technology-blueprint-hotfix.js'), 'Technology blueprint should load after Year 2 water/air blueprint');
assert.ok(loader.indexOf('rph-science-year2-technology-blueprint-hotfix.js') < loader.indexOf('rph-english-quality-hotfix.js'), 'Science patch must remain before English quality patch');

for (const standard of ['10.1.1','10.1.2','10.1.3','10.1.4','10.1.5']) {
  assert.ok(blueprint.includes(`'${standard}'`), `Blueprint must cover ${standard}`);
}
assert.ok(blueprint.includes('manual bergambar'), 'Technology activities must use the supplied pictorial manual');
assert.ok(blueprint.includes('Jurutera Cilik'), 'Assembly blueprint must preserve the textbook Jurutera Cilik context');
assert.ok(blueprint.includes('Saya Kreatif'), 'Creative-build blueprint must preserve the textbook Saya Kreatif context');
assert.ok(blueprint.includes('Buka dan Simpan'), 'Dismantle-and-store blueprint must preserve the textbook source context');
assert.ok(blueprint.includes('fungsi binaan'), 'New construction must include an explainable function as required by the DSKP note');
assert.ok(blueprint.includes('bekas penyimpanan'), 'Dismantling must end with component storage');
assert.ok(blueprint.includes('librarySteps'), 'Blueprint must provide differentiated concrete steps');
assert.ok(blueprint.includes('prevPed'), 'Patch must wrap existing pedagogy rather than replace Lesson Mapping');
assert.ok(!blueprint.includes("sp(m)==='10.1.6'"), 'Do not silently repair or specialise ambiguous DSKP 10.1.6 wording');
assert.ok(!blueprint.includes('saveLessonMap('), 'Blueprint must not mutate Lesson Mapping');

console.log('Science Year 2 technology source blueprint tests passed');
