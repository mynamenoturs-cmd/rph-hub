import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const loader=await fs.readFile(new URL('../app-v03334.js',import.meta.url),'utf8');
const electric=await fs.readFile(new URL('../rph-science-electric-blueprint-hotfix.js',import.meta.url),'utf8');
const mixture=await fs.readFile(new URL('../rph-science-mixture-blueprint-hotfix.js',import.meta.url),'utf8');
const earth=await fs.readFile(new URL('../rph-science-earth-soil-blueprint-hotfix.js',import.meta.url),'utf8');

for(const file of [
  'rph-science-electric-blueprint-hotfix.js?v=20260904a',
  'rph-science-mixture-blueprint-hotfix.js?v=20260904a',
  'rph-science-earth-soil-blueprint-hotfix.js?v=20260904a'
]) assert.ok(loader.includes(file),`Production loader must include ${file}`);

assert.ok(electric.includes("sp(m)==='7.1.3'&&pg(m)===78"),'Electric build must be scoped to Year 2 SP 7.1.3 / BT 78');
assert.ok(electric.includes("sp(m)==='7.1.4'&&(pg(m)===79||pg(m)===80)"),'Electric troubleshooting must be scoped to SP 7.1.4 / BT 79-80');
assert.ok(electric.includes('sel kering, mentol, suis dan wayar penyambung'),'Electric objective must preserve DSKP components');
assert.ok(electric.includes('Bina Litar Lengkap'),'Core activity must build the actual circuit');
assert.ok(electric.includes('bekalan elektrik rumah tidak digunakan'),'Electric blueprint must explicitly stay on low-voltage classroom circuits');

assert.ok(mixture.includes("sp(m)==='8.1.1'&&pg(m)===88"),'Mixture description must be scoped to SP 8.1.1 / BT 88');
assert.ok(mixture.includes("sp(m)==='8.1.2'&&(pg(m)===90||pg(m)===92)"),'Mixture reasoning must be scoped to SP 8.1.2 / BT 90/92');
assert.ok(mixture.includes('Stesen Tiga Campuran'),'Mixture lesson must execute separation activities');
assert.ok(mixture.includes('magnet'),'Mixture lesson must support magnetic separation from DSKP examples');
assert.ok(mixture.includes('ayak/penapis'),'Mixture lesson must support size/filter separation');
assert.ok(mixture.includes('Saya pilih ___ kerana ___'),'Reasoning lesson must require an explicit reason for method choice');

assert.ok(earth.includes("sp(m)==='9.1.1'&&pg(m)===82"),'Landform lesson must be scoped to SP 9.1.1 / BT 82');
assert.ok(earth.includes("sp(m)==='9.2.1'&&pg(m)===85"),'Soil-type lesson must be scoped to SP 9.2.1 / BT 85');
assert.ok(earth.includes("sp(m)==='9.2.2'&&pg(m)===86"),'Soil-content lesson must be scoped to SP 9.2.2 / BT 86');
assert.ok(earth.includes('gunung, pantai, bukit, lembah, sungai, kolam, tasik dan laut'),'Landform names must follow DSKP');
assert.ok(earth.includes('tanah kebun, tanah liat dan pasir'),'Soil types must follow DSKP');
assert.ok(earth.includes('digoncang dalam bekas bertutup dan dibiarkan mendap'),'Soil-content investigation must reflect the source process');
assert.ok(earth.includes('dua sampel tanah'),'Soil-content lesson must compare at least two samples');

for(const text of [electric,mixture,earth]){
  assert.ok(text.includes('previous')||text.includes('prevPed'),'Blueprint must wrap existing pedagogy, not replace Lesson Mapping');
  assert.ok(text.includes('librarySteps'),'Blueprint must provide concrete differentiated steps');
}

console.log('Science electric, mixture and Earth source blueprint tests passed');
