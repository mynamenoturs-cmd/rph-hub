import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const blueprint = await fs.readFile(new URL('../rph-bm-year1-unit16-blueprint-hotfix.js', import.meta.url), 'utf8');
const loader = await fs.readFile(new URL('../app-v03334.js', import.meta.url), 'utf8');

assert.ok(loader.includes('rph-bm-year1-unit16-blueprint-hotfix.js?v=20260904a'), 'Production loader must load BM Year 1 Unit 16 blueprint');
for (const route of ['1.1.2@98','2.2.1@99','3.2.1@100','3.2.1@101','5.3.1@102']) {
  assert.ok(blueprint.includes(`'${route}'`), `Missing source route ${route}`);
}
assert.ok(blueprint.includes('Rantaian Pesanan'), 'Pesanan activity must remain explicit');
assert.ok(blueprint.includes('Bukti → Idea Tersirat'), 'Reading activity must require evidence-based inference');
assert.ok(blueprint.includes('kepala, badan, tangan dan kaki'), 'Body-word source vocabulary must be preserved');
assert.ok(blueprint.includes('deria dengar, deria sentuh, deria rasa dan deria bau'), 'Sense phrases must be source-specific');
assert.ok(blueprint.includes('Doktor Berkata'), 'Ayat perintah activity must stay tied to the medical source context');
assert.ok(blueprint.includes('Activity Library hanya memvariasikan cara pelaksanaan'), 'Activity Library must remain secondary');
assert.ok(blueprint.includes('_runtime_bm_unit16_source_blueprint'), 'Runtime output must remain traceable');

console.log('BM Year 1 Unit 16 source blueprint tests passed');
