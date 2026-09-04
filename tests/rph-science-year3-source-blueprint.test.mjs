import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const blueprint = await fs.readFile(new URL('../rph-science-year3-source-blueprint-hotfix.js', import.meta.url), 'utf8');
const loader = await fs.readFile(new URL('../app-v03334.js', import.meta.url), 'utf8');

assert.ok(loader.includes('rph-science-year3-source-blueprint-hotfix.js?v=20260904a'), 'Production loader must load Year 3 Science source blueprint');
assert.match(blueprint, /year\(m\)!==3/, 'Blueprint must be limited to Science Year 3');
assert.match(blueprint, /2\.1\.1.*24/, 'Must cover Science-room rules at BT 24');
assert.match(blueprint, /3\.1\.1.*30/, 'Must cover teeth types/functions at BT 30');
assert.match(blueprint, /3\.1\.2.*32/, 'Must cover tooth structure at BT 32');
assert.match(blueprint, /3\.2\.4.*47/, 'Must cover unbalanced-food effects at BT 47');
assert.match(blueprint, /3\.3\.2.*50/, 'Must cover digestion order at BT 50');
assert.match(blueprint, /3\.3\.4.*54/, 'Must cover digestion-effect source task at BT 54');
assert.match(blueprint, /4\.1\.1.*62/, 'Must cover animal diet classification at BT 62');
assert.match(blueprint, /4\.1\.2.*62/, 'Must cover animal diet explanation at BT 62');
assert.match(blueprint, /5\.1\.1.*72/, 'Must cover plant reproduction at BT 72');
assert.match(blueprint, /5\.1\.2.*74/, 'Must cover importance of plant reproduction at BT 74');
assert.ok(blueprint.includes('gigi kacip'), 'Teeth blueprint must use actual source content');
assert.ok(blueprint.includes('mulut → esofagus → perut → usus → dubur'), 'Digestion blueprint must preserve actual source sequence');
assert.ok(blueprint.includes('arnab, harimau dan ayam'), 'Animal-diet blueprint must use textbook examples');
assert.ok(blueprint.includes('BIJI BENIH/SPORA/KERATAN BATANG/DAUN/ANAK POKOK/BATANG BAWAH TANAH'), 'Plant-reproduction blueprint must use DSKP methods');
assert.ok(blueprint.includes('librarySteps'), 'Blueprint must provide differentiated concrete source steps');
assert.ok(blueprint.includes('previousPedagogy'), 'Blueprint must wrap existing pedagogy and leave Lesson Mapping untouched');
assert.ok(blueprint.includes('_runtime_science_source_blueprint:`year3_${mode(out)}`'), 'Generated RPH must expose traceable Year 3 blueprint marker');

console.log('Science Year 3 source blueprint tests passed');