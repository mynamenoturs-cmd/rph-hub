import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const blueprint = await fs.readFile(
  new URL('../rph-science-year3-future-blueprint-hotfix.js', import.meta.url),
  'utf8',
);
const loader = await fs.readFile(
  new URL('../app-v03334.js', import.meta.url),
  'utf8',
);

assert.ok(loader.includes('rph-science-year3-future-blueprint-hotfix.js?v=20260904a'), 'Production loader must load the Year 3 future source blueprint');
assert.ok(loader.indexOf('rph-science-year3-source-blueprint-hotfix.js') < loader.indexOf('rph-science-year3-future-blueprint-hotfix.js'), 'Future Year 3 unit blueprint must load after the current Year 3 source blueprint');
for (const key of ['6.1.1@80','6.1.2@81','7.1.1@96','7.1.2@98','8.1.1@106','8.1.2@109','9.1.1@116','9.1.2@119','10.1.1@128','10.1.2@129']) {
  assert.ok(blueprint.includes(`'${key}'`), `Blueprint must stay locked to RPT/DSKP/textbook route ${key}`);
}
assert.ok(blueprint.includes('petak 1 cm × 1 cm'), 'Measurement activity must use the textbook 1 cm square method');
assert.ok(blueprint.includes('bola pingpong') && blueprint.includes('duit syiling'), 'Density activity must use concrete textbook float/sink objects');
assert.ok(blueprint.includes('Tiada aktiviti merasa bahan dijalankan'), 'Acid/alkali activity must use evidence from safe litmus testing, not tasting samples');
assert.ok(blueprint.includes('satelit semula jadi, asteroid, meteoroid dan komet'), 'Solar System activity must include the DSKP members beyond planets');
assert.ok(blueprint.includes('roda beralur, tali dan gandar'), 'Pulley activity must name the actual fixed-pulley parts');
assert.ok(blueprint.includes('librarySteps'), 'Blueprint must provide differentiated source steps');
assert.ok(blueprint.includes('_runtime_science_source_blueprint'), 'Generated RPH must remain traceable to its source blueprint');

console.log('Science Year 3 future source blueprint tests passed');
