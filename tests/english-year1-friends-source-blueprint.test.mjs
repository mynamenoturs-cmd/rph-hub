import fs from 'node:fs';
import assert from 'node:assert/strict';

const src=fs.readFileSync(new URL('../rph-english-year1-friends-source-blueprint-hotfix.js',import.meta.url),'utf8');
const loader=fs.readFileSync(new URL('../app-v03334.js',import.meta.url),'utf8');

const routes=[
  '1.2.2@4|W5|S1','2.1.1@4|W5|S2','3.1.1@4|W5|S3','4.1.2@4|W5|S4','5.1.1@5|W5|S5',
  '1.2.3@5|W6|S1','2.1.4@5|W6|S2','3.1.2@6|W6|S3','4.2.1@6|W6|S4','5.1.2@6|W6|S5',
  '1.2.4@7|W8|S1','2.1.5@7|W8|S2','3.1.3@7|W8|S3','4.3.1@7|W8|S4','5.1.1@8|W8|S5',
  '1.2.5@8|W9|S1','2.3.1@8|W9|S2','3.2.2@9|W9|S3','4.1.2@9|W9|S4','5.1.2@9|W9|S5'
];
for(const r of routes)assert.ok(src.includes(`'${r}'`),`missing route ${r}`);

const alignmentReview=[
  '3.1.1@4|W5|S3','4.1.2@4|W5|S4','5.1.1@5|W5|S5',
  '1.2.3@5|W6|S1','2.1.4@5|W6|S2','4.2.1@6|W6|S4',
  '3.1.3@7|W8|S3','4.3.1@7|W8|S4','5.1.1@8|W8|S5',
  '2.3.1@8|W9|S2','4.1.2@9|W9|S4','5.1.2@9|W9|S5'
];
for(const r of alignmentReview)assert.ok(src.includes(`'${r}'`),`missing alignment-review route ${r}`);

const conditional=['3.2.2@9|W9|S3','4.1.2@9|W9|S4','5.1.2@9|W9|S5'];
for(const r of conditional)assert.ok(src.includes(`'${r}'`),`missing conditional route ${r}`);

assert.ok(src.includes("method:'Source-first English Year 1 Introductory Unit: Friends"));
assert.ok(src.includes('RPT_English_Year1_2025-2026_KumpulanB_Mapping.xlsx'));
assert.ok(src.includes('DSKP KSSR English Year 1 SK (Semakan 2017)'));
assert.ok(src.includes('Activity Library may vary delivery only and must not determine lesson content'));
assert.ok(src.includes('Workbook activity content is not invented'));
assert.ok(src.includes('W7 is Cuti Perayaan with Generate_Flag NO'));
assert.ok(src.includes('W9 S3-S5 remain CONDITIONAL'));
assert.ok(src.includes('Student’s Book p. 4'));
assert.ok(src.includes('Student’s Book p. 9'));
assert.ok(src.includes('Meet the Super Friends — Story'));
assert.equal(src.includes('Math.random'),false);
assert.equal(src.includes("mappingStatus:'VERIFIED'"),false);
assert.equal(src.includes("Generate_Flag:'YES'"),false);
assert.equal(src.includes('|W7|'),false);

const unit9=loader.indexOf('rph-english-year2-unit9-source-blueprint-hotfix.js');
const y1=loader.indexOf('rph-english-year1-friends-source-blueprint-hotfix.js');
const quality=loader.indexOf('rph-english-quality-hotfix.js');
assert.ok(unit9>=0,'English Year 2 Unit 9 loader missing');
assert.ok(y1>unit9,'English Year 1 Friends must load after English Year 2 Unit 9');
assert.ok(quality>y1,'English Year 1 Friends must load before English quality fallback');

console.log('English Year 1 Friends source-first blueprint static guard passed:',routes.length,'routes; alignment review:',alignmentReview.length,'conditional:',conditional.length);