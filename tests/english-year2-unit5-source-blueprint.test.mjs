import fs from 'node:fs';
import assert from 'node:assert/strict';

const src=fs.readFileSync(new URL('../rph-english-year2-unit5-source-blueprint-hotfix.js',import.meta.url),'utf8');
const loader=fs.readFileSync(new URL('../app-v03334.js',import.meta.url),'utf8');

const routes=[
  '1.1.1@58|W4|S1','2.1.1@58|W4|S2','3.1.1@59|W4|S3','4.2.1@59|W4|S4',
  '1.2.1@60|W5|S1','2.1.2@60|W5|S2','3.1.2@61|W5|S3','4.2.3@61|W5|S4',
  '1.2.2@62|W6|S1','2.1.3@62|W6|S2','3.1.3@63|W6|S3','4.2.5@63|W6|S4',
  '1.2.3@64|W8|S1','2.2.2@64|W8|S2','3.2.2@65|W8|S3','4.3.1@65|W8|S4',
  '1.2.4@66|W9|S1','2.3.1@67|W9|S2','3.2.3@68|W9|S3','4.3.2@69|W9|S4'
];
for(const route of routes)assert.ok(src.includes(`'${route}'`),`missing route ${route}`);

assert.equal(src.includes('|W7|'),false,'W7 holiday must not be routed');
assert.equal(src.includes('|W10|'),false,'W10 overlap/review must not be routed');
assert.ok(src.includes("mappingStatus:'DERIVED_NEEDS_TEACHER_REVIEW'"));
assert.ok(src.includes('reviewRequired:true'));
assert.ok(src.includes('does not mark Lesson Mapping as verified'));
assert.ok(src.includes('Activity Library may vary delivery only and must not determine lesson content'));
assert.ok(src.includes('Workbook activity content is not invented'));
assert.ok(src.includes('Super Minds 1 Student’s Book p. ${p}'));
assert.ok(src.includes('58:{'));
assert.ok(src.includes('69:{'));
assert.equal(src.includes('Math.random'),false);
assert.equal(/verification_status\s*:/.test(src),false);
assert.equal(/verified\s*:\s*true/.test(src),false);

const moduleTag='rph-english-year2-unit5-source-blueprint-hotfix.js?v=20260905a';
const qualityTag='rph-english-quality-hotfix.js?v=20260904a';
assert.ok(loader.includes(moduleTag),'English Year 2 Unit 5 module missing from loader');
assert.ok(loader.includes(qualityTag),'English quality hotfix missing from loader');
assert.ok(loader.indexOf(moduleTag)<loader.indexOf(qualityTag),'source blueprint must load before English quality hotfix');

console.log('English Year 2 Unit 5 source-first blueprint static guard passed:',routes.length,'routes');
