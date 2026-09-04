import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const blueprint = await fs.readFile(new URL('../rph-bm-year1-unit17-blueprint-hotfix.js', import.meta.url), 'utf8');
const loader = await fs.readFile(new URL('../app-v03334.js', import.meta.url), 'utf8');

assert.ok(loader.includes('rph-bm-year1-unit17-blueprint-hotfix.js?v=20260904a'), 'Production loader must load BM Year 1 Unit 17 blueprint');
for (const route of ['1.2.1@103','2.3.1@104','3.2.1@106','4.2.1@107','5.3.1@108']) {
  assert.ok(blueprint.includes(`'${route}'`), `Missing source route ${route}`);
}
assert.ok(blueprint.includes('Kamus Elektronik'), 'Kamus elektronik source task must be explicit');
assert.ok(blueprint.includes('peralatan–kegunaan–keistimewaan'), 'Reading task must transfer actual text content into a graphic organizer');
assert.ok(blueprint.includes('pasang pintu pagar automatik'), 'Automatic gate source phrases must be preserved');
assert.ok(blueprint.includes('Bengkel Lengkap Pantun'), 'Pantun source activity must be explicit');
assert.ok(blueprint.includes('Roda Kata Seru'), 'Ayat seruan practice must stay tied to source context');
assert.ok(blueprint.includes('Activity Library hanya memvariasikan cara pelaksanaan'), 'Activity Library must remain secondary to source task');
assert.ok(!blueprint.includes('melaksanakan tugasan sumber dan berbincang'), 'Generic activity wording must not return');
assert.ok(blueprint.includes('_runtime_bm_unit17_source_blueprint'), 'Runtime output must remain traceable to the Unit 17 blueprint');

console.log('BM Year 1 Unit 17 source blueprint tests passed');
