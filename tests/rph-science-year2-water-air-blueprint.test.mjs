import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const blueprint = await fs.readFile(new URL('../rph-science-year2-water-air-blueprint-hotfix.js', import.meta.url), 'utf8');
const loader = await fs.readFile(new URL('../app-v03334.js', import.meta.url), 'utf8');

assert.ok(loader.includes('rph-science-year2-water-air-blueprint-hotfix.js?v=20260904a'), 'Production loader must load Year 2 water/air blueprint');
assert.ok(loader.indexOf('rph-science-earth-soil-blueprint-hotfix.js') < loader.indexOf('rph-science-year2-water-air-blueprint-hotfix.js'), 'Year 2 water/air blueprint should load after earlier Science source patches');
assert.ok(loader.indexOf('rph-science-year2-water-air-blueprint-hotfix.js') < loader.indexOf('rph-english-quality-hotfix.js'), 'Science patch must remain before English quality isolation patch');

for (const standard of ['9.1.1','9.1.2','9.1.3','9.1.4','9.1.5','9.2.3','9.2.4']) {
  assert.ok(blueprint.includes(`'${standard}'`), `Blueprint must cover ${standard}`);
}
assert.ok(blueprint.includes('satu hujung dulang ditinggikan'), 'Water-flow activity must preserve the DSKP tray investigation');
assert.ok(blueprint.includes('dari tempat tinggi ke tempat rendah'), 'Water-flow conclusion must be evidence based');
assert.ok(blueprint.includes('hujan, sungai, tasik, laut dan mata air'), 'Natural water sources must follow DSKP examples');
assert.ok(blueprint.includes('wap air'), 'Water-cycle sequence must include water vapour');
assert.ok(blueprint.includes('membentuk awan'), 'Water-cycle sequence must include cloud formation');
assert.ok(blueprint.includes('kincir angin'), 'Air movement application must include a DSKP-aligned model example');
assert.ok(blueprint.includes('kapal layar'), 'Air movement application must include a DSKP-aligned life example');
assert.ok(blueprint.includes('librarySteps'), 'Blueprint must provide differentiated concrete steps');
assert.ok(blueprint.includes('prevPed'), 'Patch must wrap existing pedagogy rather than replace Lesson Mapping');
assert.ok(!blueprint.includes('saveLessonMap('), 'Blueprint must not save or mutate Lesson Mapping');
assert.ok(!blueprint.includes("verification_status='verified'"), 'Blueprint must never auto-verify Lesson Maps');

console.log('Science Year 2 water/air source blueprint tests passed');
