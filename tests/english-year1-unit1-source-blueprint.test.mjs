import fs from 'node:fs';
import assert from 'node:assert/strict';

const src=fs.readFileSync(new URL('../rph-english-year1-unit1-source-blueprint-hotfix.js',import.meta.url),'utf8');
const loader=fs.readFileSync(new URL('../app-v03334.js',import.meta.url),'utf8');

const routes=[
  '1.1.1@10|W10|S1',
  '2.1.1@10|W10|S2',
  '3.1.2@10|W10|S3',
  '4.2.2@11|W10|S4',
  '5.1.1@11|W10|S5',
  '1.2.1@12|W11|S1',
  '2.1.2@12|W11|S2',
  '3.1.3@12|W11|S3',
  '4.2.4@13|W11|S4',
  '5.1.2@13|W11|S5',
  '1.2.2@14|W12|S1',
  '2.1.4@14|W12|S2',
  '3.1.4@14|W12|S3',
  '4.2.5@15|W12|S4',
  '5.2.1@15|W12|S5',
  '1.2.3@16|W13|S1',
  '2.1.5@16|W13|S2',
  '3.2.1@16|W13|S3',
  '4.3.1@17|W13|S4',
  '5.3.1@17|W13|S5',
  '1.2.4@18|W14|S1',
  '2.2.2@18|W14|S2',
  '3.2.2@18|W14|S3',
  '4.3.2@19|W14|S4',
  '5.1.1@19|W14|S5',
  '1.2.5@20|W15|S1',
  '2.1.1@20|W15|S2',
  '3.2.4@20|W15|S3',
  '4.2.2@21|W15|S4',
  '5.1.2@21|W15|S5'
];
for(const r of routes)assert.ok(src.includes(`'${r}'`),`missing route ${r}`);

const alignmentReview=[
  '2.1.1@10|W10|S2',
  '3.1.2@10|W10|S3',
  '4.2.2@11|W10|S4',
  '5.1.1@11|W10|S5',
  '2.1.2@12|W11|S2',
  '3.1.3@12|W11|S3',
  '5.1.2@13|W11|S5',
  '2.1.4@14|W12|S2',
  '3.1.4@14|W12|S3',
  '4.2.5@15|W12|S4',
  '1.2.3@16|W13|S1',
  '2.1.5@16|W13|S2',
  '3.2.1@16|W13|S3',
  '4.3.1@17|W13|S4',
  '1.2.4@18|W14|S1',
  '2.2.2@18|W14|S2',
  '4.3.2@19|W14|S4',
  '5.1.1@19|W14|S5',
  '1.2.5@20|W15|S1',
  '2.1.1@20|W15|S2',
  '3.2.4@20|W15|S3',
  '4.2.2@21|W15|S4',
  '5.1.2@21|W15|S5'
];
for(const r of alignmentReview)assert.ok(src.includes(`'${r}'`),`missing alignment-review route ${r}`);

const conditional=[
  '1.2.5@20|W15|S1',
  '2.1.1@20|W15|S2',
  '3.2.4@20|W15|S3',
  '4.2.2@21|W15|S4',
  '5.1.2@21|W15|S5'
];
for(const r of conditional)assert.ok(src.includes(`'${r}'`),`missing conditional route ${r}`);

assert.ok(src.includes("Unit 1: At School"));
assert.ok(src.includes("DSKP KSSR ENGLISH YEAR 1 SK (SEMAKAN 2017).pdf"));
assert.ok(src.includes("10:{title:'At School — Classroom Objects'"));
assert.ok(src.includes("21:{title:'Colours at School — Poster Revision'"));
assert.ok(src.includes("Watch Out, Flash! — Story"));
assert.ok(src.includes("At School — Reading, Speaking and Writing Skills"));
assert.ok(src.includes("Colours at School — Poster Revision"));
assert.ok(src.includes("Activity Library may vary delivery only and must not determine lesson content"));
assert.ok(src.includes("Workbook activity content is not invented"));
assert.ok(src.includes("W15 is a partial teaching week and remains CONDITIONAL"));
assert.ok(src.includes("no separate civic lesson content is fabricated"));
assert.ok(src.includes("_runtime_english_year1_unit1_source_blueprint"));
assert.equal(src.includes("Math.random"),false);
assert.equal(src.includes("mappingStatus:'VERIFIED'"),false);
assert.equal(src.includes("Generate_Flag:'YES'"),false);

const friends=loader.indexOf('rph-english-year1-friends-source-blueprint-hotfix.js');
const unit1=loader.indexOf('rph-english-year1-unit1-source-blueprint-hotfix.js');
const quality=loader.indexOf('rph-english-quality-hotfix.js');
assert.ok(friends>=0,'English Year 1 Friends loader missing');
assert.ok(unit1>friends,'English Year 1 Unit 1 must load after Friends');
assert.ok(quality>unit1,'English Year 1 Unit 1 must load before English quality fallback');

console.log('English Year 1 Unit 1 source-first blueprint static guard passed:',routes.length,'routes; alignment review:',alignmentReview.length,'conditional:',conditional.length);
