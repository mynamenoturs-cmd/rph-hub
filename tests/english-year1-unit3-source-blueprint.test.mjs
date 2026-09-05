import fs from 'node:fs';
import assert from 'node:assert/strict';

const src=fs.readFileSync(new URL('../rph-english-year1-unit3-source-blueprint-hotfix.js',import.meta.url),'utf8');
const loader=fs.readFileSync(new URL('../app-v03334.js',import.meta.url),'utf8');

const routes=[
  '1.1.1@34|W23|S1',
  '2.1.2@34|W23|S2',
  '3.1.3@34|W23|S3',
  '4.2.1@35|W23|S4',
  '5.1.1@35|W23|S5',
  '1.2.1@35|W24|S1',
  '2.1.3@36|W24|S2',
  '3.1.4@36|W24|S3',
  '4.2.3@36|W24|S4',
  '5.1.2@37|W24|S5',
  '1.2.2@37|W25|S1',
  '2.1.5@37|W25|S2',
  '3.2.2@38|W25|S3',
  '4.2.4@38|W25|S4',
  '5.3.1@38|W25|S5',
  '1.2.3@39|W26|S1',
  '2.2.2@39|W26|S2',
  '3.2.3@39|W26|S3',
  '4.2.5@40|W26|S4',
  '5.1.1@40|W26|S5',
  '1.2.4@40|W27|S1',
  '2.1.2@41|W27|S2',
  '3.2.4@41|W27|S3',
  '4.3.1@41|W27|S4',
  '5.1.2@42|W27|S5',
  '1.2.5@42|W28|S1',
  '2.1.3@42|W28|S2',
  '3.3.1@43|W28|S3',
  '4.3.2@43|W28|S4',
  '5.3.1@43|W28|S5',
  '1.3.1@44|W29|S1',
  '2.1.5@44|W29|S2',
  '3.1.3@44|W29|S3',
  '4.3.3@45|W29|S4',
  '5.1.1@45|W29|S5',
];
for(const r of routes)assert.ok(src.includes(`'${r}'`),`missing route ${r}`);

const directAlignment=[
  '1.1.1@34|W23|S1',
  '1.2.1@35|W24|S1',
  '1.2.2@37|W25|S1',
  '1.2.3@39|W26|S1',
  '1.2.5@42|W28|S1',
  '3.2.3@39|W26|S3',
  '4.2.5@40|W26|S4',
  '5.3.1@43|W28|S5',
];
for(const r of directAlignment)assert.ok(src.includes(`'${r}'`),`missing direct-alignment route ${r}`);
assert.equal(routes.length,35);
assert.equal(routes.length-directAlignment.length,27);

assert.ok(src.includes("Unit 3: Pet Show"));
assert.ok(src.includes("DSKP KSSR ENGLISH YEAR 1 SK (SEMAKAN 2017).pdf"));
assert.ok(src.includes('Pet Show — Animal Words and Chant'));
assert.ok(src.includes('The Spider — Story'));
assert.ok(src.includes('Camouflage — Habitat Project'));
assert.ok(src.includes('Pet Show — Quiz Time'));
assert.ok(src.includes("Activity Library may vary delivery only and must not determine lesson content"));
assert.ok(src.includes("Workbook activity content is not invented"));
assert.ok(src.includes("no LP number is stated; do not invent an LP number"));
assert.ok(src.includes("July and August Civic_Edu markers are provenance metadata only"));
assert.ok(src.includes("_runtime_english_year1_unit3_source_blueprint"));
assert.equal(src.includes("Math.random"),false);
assert.equal(src.includes("mappingStatus:'VERIFIED'"),false);
assert.equal(src.includes("Generate_Flag:'CONDITIONAL'"),false);

const unit2=loader.indexOf('rph-english-year1-unit2-source-blueprint-hotfix.js');
const unit3=loader.indexOf('rph-english-year1-unit3-source-blueprint-hotfix.js');
const quality=loader.indexOf('rph-english-quality-hotfix.js');
assert.ok(unit2>=0,'English Year 1 Unit 2 loader missing');
assert.ok(unit3>unit2,'English Year 1 Unit 3 must load after Unit 2');
assert.ok(quality>unit3,'English Year 1 Unit 3 must load before English quality fallback');

console.log('English Year 1 Unit 3 source-first blueprint static guard passed:',routes.length,'routes; alignment review:',routes.length-directAlignment.length,'conditional: 0');
