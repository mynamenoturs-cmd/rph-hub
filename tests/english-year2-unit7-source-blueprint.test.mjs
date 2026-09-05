import fs from 'node:fs';
import assert from 'node:assert/strict';

const src=fs.readFileSync(new URL('../rph-english-year2-unit7-source-blueprint-hotfix.js',import.meta.url),'utf8');
const loader=fs.readFileSync(new URL('../app-v03334.js',import.meta.url),'utf8');

const routes=[
  '1.1.1@82|W16|S1','2.1.2@82|W16|S2','3.1.1@83|W16|S3','4.2.3@83|W16|S4',
  '1.2.2@84|W17|S1','2.1.3@84|W17|S2','3.1.2@85|W17|S3','4.2.4@85|W17|S4',
  '1.2.3@86|W18|S1','2.1.5@86|W18|S2','3.1.3@87|W18|S3','4.2.5@87|W18|S4',
  '1.2.4@88|W19|S1','2.2.1@88|W19|S2','3.1.4@89|W19|S3','4.3.1@89|W19|S4',
  '1.2.5@90|W20|S1','2.3.1@90|W20|S2','3.2.1@91|W20|S3','4.3.2@91|W20|S4',
  '1.3.1@92|W21|S1','2.1.2@92|W21|S2','3.2.2@93|W21|S3','4.3.3@93|W21|S4',
  '1.1.1@92|W22|S1','2.1.3@93|W22|S2','3.2.3@92|W22|S3','4.2.3@93|W22|S4'
];
for(const r of routes)assert.ok(src.includes(`'${r}'`),`missing route ${r}`);

const alignmentReview=[
  '2.1.2@82|W16|S2','3.1.1@83|W16|S3','4.2.3@83|W16|S4',
  '3.1.2@85|W17|S3','4.2.5@87|W18|S4',
  '1.2.4@88|W19|S1','2.2.1@88|W19|S2','3.1.4@89|W19|S3',
  '1.2.5@90|W20|S1','2.3.1@90|W20|S2','3.2.1@91|W20|S3',
  '2.1.2@92|W21|S2','3.2.2@93|W21|S3','4.3.3@93|W21|S4',
  '1.1.1@92|W22|S1','4.2.3@93|W22|S4'
];
for(const r of alignmentReview)assert.ok(src.includes(`'${r}'`),`missing alignment-review route ${r}`);

assert.ok(src.includes("topic:'Unit 7: Get Dressed!'"));
assert.ok(src.includes("mappingStatus:'DERIVED_NEEDS_TEACHER_REVIEW'"));
assert.ok(src.includes('_runtime_english_year2_unit7_mode'));
assert.ok(src.includes('_runtime_english_year2_alignment_review_required'));
assert.ok(src.includes('Activity Library may vary delivery only and must not determine lesson content'));
assert.ok(src.includes('Workbook activity content is not invented'));
assert.ok(src.includes('Student’s Book p. 82'));
assert.ok(src.includes('Student’s Book p. 93'));
assert.ok(src.includes('The Cap — Story'));
assert.ok(src.includes('Materials — Properties and Project'));
assert.ok(src.includes('The Dressing Game'));
assert.equal(src.includes('Math.random'),false);
assert.equal(src.includes("mappingStatus:'VERIFIED'"),false);

const unit6=loader.indexOf('rph-english-year2-unit6-source-blueprint-hotfix.js');
const unit7=loader.indexOf('rph-english-year2-unit7-source-blueprint-hotfix.js');
const quality=loader.indexOf('rph-english-quality-hotfix.js');
assert.ok(unit6>=0,'Unit 6 loader missing');
assert.ok(unit7>unit6,'Unit 7 must load after Unit 6');
assert.ok(quality>unit7,'Unit 7 must load before English quality fallback');

console.log('English Year 2 Unit 7 source-first blueprint static guard passed:',routes.length,'routes; alignment review:',alignmentReview.length);