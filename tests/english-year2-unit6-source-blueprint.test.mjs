import fs from 'node:fs';
import assert from 'node:assert/strict';

const src=fs.readFileSync(new URL('../rph-english-year2-unit6-source-blueprint-hotfix.js',import.meta.url),'utf8');
const loader=fs.readFileSync(new URL('../app-v03334.js',import.meta.url),'utf8');

const routes=[
  '1.1.1@70|W11|S1','2.1.1@70|W11|S2','3.1.2@71|W11|S3','4.2.1@71|W11|S4',
  '1.2.1@72|W12|S1','2.1.2@72|W12|S2','3.1.3@73|W12|S3','4.2.3@73|W12|S4',
  '1.2.2@74|W13|S1','2.1.3@74|W13|S2','3.1.4@75|W13|S3','4.2.4@75|W13|S4',
  '1.2.3@76|W14|S1','2.1.5@76|W14|S2','3.2.1@77|W14|S3','4.2.5@77|W14|S4',
  '1.2.5@78|W15|S1','2.2.1@79|W15|S2','3.2.2@80|W15|S3','4.3.1@81|W15|S4'
];
for(const route of routes)assert.ok(src.includes(`'${route}'`),`missing route ${route}`);

assert.ok(src.includes("const ALIGNMENT_REVIEW=new Set(["));
assert.ok(src.includes('does not fabricate a different activity to force LS alignment'));
assert.ok(src.includes("mappingStatus:'DERIVED_NEEDS_TEACHER_REVIEW'"));
assert.ok(src.includes('reviewRequired:true'));
assert.ok(src.includes('alignmentReviewRequired:alignReview'));
assert.ok(src.includes('does not mark Lesson Mapping as verified'));
assert.ok(src.includes('Activity Library may vary delivery only and must not determine lesson content'));
assert.ok(src.includes('Workbook activity content is not invented'));
assert.ok(src.includes('70:{'));
assert.ok(src.includes('81:{'));
assert.equal(src.includes('Math.random'),false);
assert.equal(/verification_status\s*:/.test(src),false);
assert.equal(/verified\s*:\s*true/.test(src),false);

const unit5='rph-english-year2-unit5-source-blueprint-hotfix.js?v=20260905a';
const unit6='rph-english-year2-unit6-source-blueprint-hotfix.js?v=20260905a';
const quality='rph-english-quality-hotfix.js?v=20260904a';
assert.ok(loader.includes(unit5));
assert.ok(loader.includes(unit6));
assert.ok(loader.includes(quality));
assert.ok(loader.indexOf(unit5)<loader.indexOf(unit6));
assert.ok(loader.indexOf(unit6)<loader.indexOf(quality));

console.log('English Year 2 Unit 6 source-first blueprint static guard passed:',routes.length,'routes');
