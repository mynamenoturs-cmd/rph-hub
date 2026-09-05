import fs from 'node:fs';
import assert from 'node:assert/strict';

const src=fs.readFileSync(new URL('../rph-english-year2-unit9-source-blueprint-hotfix.js',import.meta.url),'utf8');
const loader=fs.readFileSync(new URL('../app-v03334.js',import.meta.url),'utf8');

const routes=[
  '1.1.1@106|W32|S1','2.1.1@106|W32|S2','3.1.2@107|W32|S3','4.2.5@107|W32|S4',
  '1.2.1@108|W33|S1','2.1.2@108|W33|S2','3.2.1@109|W33|S3','4.3.1@109|W33|S4',
  '1.2.2@110|W35|S1','2.1.3@111|W35|S2','3.2.2@112|W35|S3','4.3.2@113|W35|S4',
  '1.2.3@114|W36|S1','2.1.5@115|W36|S2','3.2.3@116|W36|S3','4.3.3@117|W36|S4'
];
for(const r of routes)assert.ok(src.includes(`'${r}'`),`missing route ${r}`);

const alignmentReview=[
  '2.1.1@106|W32|S2','3.1.2@107|W32|S3','4.2.5@107|W32|S4',
  '2.1.2@108|W33|S2','4.3.1@109|W33|S4',
  '2.1.3@111|W35|S2','4.3.2@113|W35|S4',
  '1.2.3@114|W36|S1','2.1.5@115|W36|S2','4.3.3@117|W36|S4'
];
for(const r of alignmentReview)assert.ok(src.includes(`'${r}'`),`missing alignment-review route ${r}`);

assert.ok(src.includes("topic:'Unit 9: At the Beach'"));
assert.ok(src.includes("mappingStatus:'DERIVED_NEEDS_TEACHER_REVIEW'"));
assert.ok(src.includes('_runtime_english_year2_unit9_mode'));
assert.ok(src.includes('_runtime_english_year2_alignment_review_required'));
assert.ok(src.includes('Activity Library may vary delivery only and must not determine lesson content'));
assert.ok(src.includes('Workbook activity content is not invented'));
assert.ok(src.includes('Student’s Book p. 106'));
assert.ok(src.includes('Student’s Book p. 117'));
assert.ok(src.includes('The Top of the Hill — Story'));
assert.ok(src.includes('Weather Postcards and Diary'));
assert.ok(src.includes('Quiz Time — At the Beach'));
assert.ok(src.includes('No Unit 9 runtime route is created for W34'));
assert.ok(src.includes('standalone Year 2 DSKP file was not found'));
assert.equal(src.includes('|W34|'),false);
assert.equal(src.includes('Math.random'),false);
assert.equal(src.includes("mappingStatus:'VERIFIED'"),false);

const unit8=loader.indexOf('rph-english-year2-unit8-source-blueprint-hotfix.js');
const unit9=loader.indexOf('rph-english-year2-unit9-source-blueprint-hotfix.js');
const quality=loader.indexOf('rph-english-quality-hotfix.js');
assert.ok(unit8>=0,'Unit 8 loader missing');
assert.ok(unit9>unit8,'Unit 9 must load after Unit 8');
assert.ok(quality>unit9,'Unit 9 must load before English quality fallback');

console.log('English Year 2 Unit 9 source-first blueprint static guard passed:',routes.length,'routes; alignment review:',alignmentReview.length);