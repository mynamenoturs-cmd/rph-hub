import fs from 'node:fs';
import assert from 'node:assert/strict';

const src=fs.readFileSync(new URL('../rph-english-year2-unit8-source-blueprint-hotfix.js',import.meta.url),'utf8');
const loader=fs.readFileSync(new URL('../app-v03334.js',import.meta.url),'utf8');

const routes=[
  "1.2.1@94|W23|S1","2.1.1@94|W23|S2","3.2.2@94|W23|S3","4.2.4@95|W23|S4",
  "1.2.2@95|W24|S1","2.1.4@95|W24|S2","3.2.3@96|W24|S3","4.3.1@96|W24|S4",
  "1.2.3@96|W25|S1","2.1.5@97|W25|S2","3.2.4@97|W25|S3","4.3.2@97|W25|S4",
  "1.2.5@98|W26|S1","2.2.1@98|W26|S2","3.2.2@98|W26|S3","4.3.3@99|W26|S4",
  "1.3.1@99|W27|S1","2.2.2@99|W27|S2","3.2.3@100|W27|S3","4.2.4@100|W27|S4",
  "1.2.1@100|W28|S1","2.1.1@101|W28|S2","3.2.4@101|W28|S3","4.3.1@101|W28|S4",
  "1.2.2@102|W29|S1","2.1.4@102|W29|S2","3.2.2@102|W29|S3","4.3.2@103|W29|S4",
  "1.2.3@103|W30|S1","2.1.5@103|W30|S2","3.2.3@104|W30|S3","4.3.3@104|W30|S4",
  "1.2.5@104|W31|S1","2.2.1@105|W31|S2","3.2.4@105|W31|S3","4.2.4@105|W31|S4"
];
for(const r of routes)assert.ok(src.includes(`'${r}'`),`missing route ${r}`);

const alignmentReview=[
  "1.2.1@94|W23|S1","2.1.1@94|W23|S2","3.2.2@94|W23|S3","4.2.4@95|W23|S4",
  "3.2.3@96|W24|S3","4.3.1@96|W24|S4","1.2.3@96|W25|S1","2.1.5@97|W25|S2",
  "3.2.4@97|W25|S3","4.3.2@97|W25|S4","1.2.5@98|W26|S1","2.2.1@98|W26|S2",
  "4.3.3@99|W26|S4","1.3.1@99|W27|S1","2.2.2@99|W27|S2","3.2.3@100|W27|S3",
  "4.2.4@100|W27|S4","1.2.1@100|W28|S1","2.1.1@101|W28|S2","3.2.4@101|W28|S3",
  "2.1.4@102|W29|S2","4.3.2@103|W29|S4","1.2.3@103|W30|S1","3.2.3@104|W30|S3",
  "1.2.5@104|W31|S1","2.2.1@105|W31|S2","3.2.4@105|W31|S3"
];
for(const r of alignmentReview)assert.ok(src.includes(`'${r}'`),`missing alignment-review route ${r}`);

assert.ok(src.includes("topic:'Unit 8: The Robot'"));
assert.ok(src.includes("mappingStatus:'DERIVED_NEEDS_TEACHER_REVIEW'"));
assert.ok(src.includes('_runtime_english_year2_unit8_mode'));
assert.ok(src.includes('_runtime_english_year2_alignment_review_required'));
assert.ok(src.includes('Activity Library may vary delivery only and must not determine lesson content'));
assert.ok(src.includes('Workbook activity content is not invented'));
assert.ok(src.includes('Student’s Book p. 94'));
assert.ok(src.includes('Student’s Book p. 105'));
assert.ok(src.includes('The Problem — Story'));
assert.ok(src.includes('The Skeleton — Listen, Read and Match'));
assert.ok(src.includes('Create That! — Robot Pet'));
assert.ok(src.includes('Our Body — Poster and Memory Game'));
assert.ok(src.includes('standalone Year 2 DSKP file was not found'));
assert.equal(src.includes('Math.random'),false);
assert.equal(src.includes("mappingStatus:'VERIFIED'"),false);

const unit7=loader.indexOf('rph-english-year2-unit7-source-blueprint-hotfix.js');
const unit8=loader.indexOf('rph-english-year2-unit8-source-blueprint-hotfix.js');
const quality=loader.indexOf('rph-english-quality-hotfix.js');
assert.ok(unit7>=0,'Unit 7 loader missing');
assert.ok(unit8>unit7,'Unit 8 must load after Unit 7');
assert.ok(quality>unit8,'Unit 8 must load before English quality fallback');

console.log('English Year 2 Unit 8 source-first blueprint static guard passed:',routes.length,'routes; alignment review:',alignmentReview.length);