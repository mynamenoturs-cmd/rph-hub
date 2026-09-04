import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const blueprint = await fs.readFile(
  new URL('../rph-science-magnet-blueprint-hotfix.js', import.meta.url),
  'utf8',
);
const loader = await fs.readFile(
  new URL('../app-v03334.js', import.meta.url),
  'utf8',
);

assert.ok(
  loader.includes('rph-science-magnet-blueprint-hotfix.js?v=20260904a'),
  'The production loader must load the magnet-strength blueprint',
);
assert.ok(
  loader.indexOf('rph-science-blueprint-hotfix.js') < loader.indexOf('rph-science-magnet-blueprint-hotfix.js'),
  'The specialised magnet blueprint must load after the general Science blueprint',
);

assert.match(blueprint, /mainSp\(map\)!=='7\.1\.5'/, 'The blueprint must be limited to Science SP 7.1.5');
assert.match(blueprint, /kekuatan\\s\+magnet/, 'The blueprint must require the Kekuatan Magnet source context');
assert.match(blueprint, /klip\\s\+kertas/, 'The blueprint must require paper-clip evidence from the source');
assert.ok(blueprint.includes('magnet yang sama bentuk dan saiz'), 'Fair-test controls must keep magnet shape and size constant');
assert.ok(blueprint.includes('klip kertas yang sama jenis dan saiz'), 'Fair-test controls must keep paper clips comparable');
assert.ok(blueprint.includes('Predict-Observe-Explain'), 'The lesson must include prediction before evidence is observed');
assert.ok(blueprint.includes('Cabaran Kekuatan Magnet'), 'The core group must conduct the actual magnet-strength investigation');
assert.ok(blueprint.includes('Susun dari Lemah ke Kuat'), 'The core group must interpret recorded data, not merely complete a generic task');
assert.ok(blueprint.includes('Ulang dan Semak Ketekalan'), 'The challenge group must repeat the test to check consistency');
assert.ok(blueprint.includes('Uji Pemboleh Ubah Jarak'), 'The challenge group must extend the fair test through controlled distance');
assert.ok(blueprint.includes('bilangan klip kertas'), 'Objective/PBD must be measurable using actual investigation data');
assert.ok(blueprint.includes('librarySteps'), 'The specialised blueprint must provide concrete differentiated steps');
assert.ok(blueprint.includes("_runtime_science_source_blueprint:'magnet_strength'"), 'Generated RPH must be traceable to the magnet-strength source blueprint');
assert.ok(blueprint.includes('previousPedagogy'), 'The patch must wrap the existing pedagogy rather than replace Lesson Mapping');

console.log('Science magnet-strength source blueprint tests passed');
