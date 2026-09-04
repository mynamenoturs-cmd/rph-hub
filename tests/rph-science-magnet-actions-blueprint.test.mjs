import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const blueprint = await fs.readFile(
  new URL('../rph-science-magnet-actions-blueprint-hotfix.js', import.meta.url),
  'utf8',
);
const loader = await fs.readFile(
  new URL('../app-v03334.js', import.meta.url),
  'utf8',
);

assert.ok(
  loader.includes('rph-science-magnet-actions-blueprint-hotfix.js?v=20260904b'),
  'The production loader must load the Year 1 magnet-action blueprint',
);
assert.ok(
  loader.indexOf('rph-science-blueprint-hotfix.js') < loader.indexOf('rph-science-magnet-actions-blueprint-hotfix.js'),
  'The specialised magnet-action blueprint must load after the general Science blueprint',
);
assert.ok(blueprint.includes("mainSp(map)==='7.1.3'&&pageNo(map)===65"), 'Hebatnya Magnet must be scoped to SP 7.1.3 and BT p.65');
assert.ok(blueprint.includes("mainSp(map)==='7.1.4'&&pageNo(map)===67"), 'Tarikan dan Tolakan Magnet must be scoped to SP 7.1.4 and BT p.67');
assert.ok(blueprint.includes('Detektif Tindakan Magnet'), 'SP 7.1.3 must include a real object test');
assert.ok(blueprint.includes('Cabaran Dua Zon'), 'SP 7.1.3 must classify from observed evidence');
assert.ok(blueprint.includes('Uji Tarikan dan Tolakan'), 'SP 7.1.4 must include a real pole investigation');
assert.ok(blueprint.includes('U-U, S-S, U-S dan S-U'), 'The pole investigation must test all four pairings');
assert.ok(blueprint.includes('kutub sama menolak dan kutub berlainan menarik'), 'The conclusion must be evidence-based and scientifically correct');
assert.ok(blueprint.includes('Predict-Observe-Explain'), 'Prediction must occur before observation');
assert.ok(blueprint.includes('librarySteps'), 'The blueprint must provide concrete differentiated steps');
assert.ok(blueprint.includes('previousPedagogy'), 'The patch must wrap the existing pedagogy rather than change Lesson Mapping');
assert.ok(blueprint.includes("standards:['7.1.3','7.1.4']"), 'The runtime marker must expose both standards');

console.log('Science Year 1 magnet action source blueprint tests passed');
