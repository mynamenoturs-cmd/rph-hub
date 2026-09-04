import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const blueprint = await fs.readFile(
  new URL('../rph-science-absorption-blueprint-hotfix.js', import.meta.url),
  'utf8',
);
const loader = await fs.readFile(
  new URL('../app-v03334.js', import.meta.url),
  'utf8',
);

assert.ok(loader.includes('rph-science-absorption-blueprint-hotfix.js?v=20260904a'), 'Production loader must load the absorption blueprint');
assert.ok(loader.indexOf('rph-science-magnet-blueprint-hotfix.js') < loader.indexOf('rph-science-absorption-blueprint-hotfix.js'), 'Source-specific Science blueprints must load after the general Science blueprint');
assert.match(blueprint, /\['8\.1\.2','8\.1\.3'\]/, 'Blueprint must be limited to the mapped absorption Learning Standards');
assert.ok(blueprint.includes('pageNo(map)!==72'), 'Blueprint must stay locked to the verified textbook page 72');
assert.ok(blueprint.includes('sapu tangan, kertas tisu, kertas, klip kertas, guli dan penutup botol'), 'Concrete source objects must be named in the activity');
assert.ok(blueprint.includes('jumlah air yang sama'), 'Classification investigation must compare objects under the same water condition');
assert.ok(blueprint.includes('sampel bersaiz sama'), 'Absorption-capacity investigation must keep sample size constant as required by DSKP');
assert.ok(blueprint.includes('Detektif Penyerapan'), 'Core pupils must conduct the actual absorption investigation');
assert.ok(blueprint.includes('Cabaran Dua Bakul'), 'Game activity must reinforce evidence-based classification after testing');
assert.ok(blueprint.includes('Susun Paling Sedikit ke Paling Banyak'), 'SP 8.1.3 must require interpretation of recorded absorption data');
assert.ok(blueprint.includes('Predict-Observe-Explain'), 'Prediction must precede observation');
assert.ok(blueprint.includes('librarySteps'), 'The source blueprint must supply differentiated lesson steps directly');
assert.ok(blueprint.includes('_runtime_science_source_blueprint'), 'Generated RPH must remain traceable to its source blueprint');

console.log('Science absorption source blueprint tests passed');
