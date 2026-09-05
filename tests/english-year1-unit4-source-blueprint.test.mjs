import fs from 'node:fs';
import assert from 'node:assert/strict';

const src=fs.readFileSync(new URL('../rph-english-year1-unit4-source-blueprint-hotfix.js',import.meta.url),'utf8');
const loader=fs.readFileSync(new URL('../app-v03334.js',import.meta.url),'utf8');

const routes=["1.1.1@46|W30|S1", "2.1.1@46|W30|S2", "3.1.3@46|W30|S3", "4.3.2@47|W30|S4", "5.1.1@47|W30|S5", "1.2.1@48|W31|S1", "2.1.2@48|W31|S2", "3.2.1@48|W31|S3", "4.3.3@49|W31|S4", "5.2.1@49|W31|S5", "1.2.2@50|W32|S1", "2.1.4@50|W32|S2", "3.2.2@50|W32|S3", "4.3.2@51|W32|S4", "5.1.1@51|W32|S5", "1.2.3@52|W33|S1", "2.1.5@52|W33|S2", "3.2.3@52|W33|S3", "4.3.3@53|W33|S4", "5.2.1@53|W33|S5", "1.2.4@54|W34|S1", "2.1.1@54|W34|S2", "3.1.3@54|W34|S3", "4.3.2@55|W34|S4", "5.1.1@55|W34|S5", "1.2.5@56|W35|S1", "2.1.2@56|W35|S2", "3.2.1@56|W35|S3", "4.3.3@57|W35|S4", "5.2.1@57|W35|S5"];
for(const r of routes)assert.ok(src.includes(JSON.stringify(r)),`missing route ${r}`);

const alignmentReview=["1.2.3@52|W33|S1", "1.2.4@54|W34|S1", "1.2.5@56|W35|S1", "2.1.1@46|W30|S2", "2.1.2@48|W31|S2", "2.1.2@56|W35|S2", "2.1.4@50|W32|S2", "3.1.3@46|W30|S3", "3.1.3@54|W34|S3", "3.2.1@48|W31|S3", "3.2.1@56|W35|S3", "3.2.3@52|W33|S3", "4.3.2@47|W30|S4", "4.3.2@51|W32|S4", "4.3.2@55|W34|S4", "4.3.3@49|W31|S4", "4.3.3@53|W33|S4", "4.3.3@57|W35|S4", "5.1.1@47|W30|S5", "5.1.1@51|W32|S5", "5.1.1@55|W34|S5", "5.2.1@49|W31|S5"];
for(const r of alignmentReview)assert.ok(src.includes(JSON.stringify(r)),`missing alignment-review route ${r}`);

const conditional=["1.2.4@54|W34|S1", "2.1.1@54|W34|S2", "3.1.3@54|W34|S3", "4.3.2@55|W34|S4", "5.1.1@55|W34|S5"];
for(const r of conditional)assert.ok(src.includes(JSON.stringify(r)),`missing conditional route ${r}`);

assert.equal(routes.length,30);
assert.equal(alignmentReview.length,22);
assert.equal(conditional.length,5);
assert.ok(src.includes("Unit 4: Lunchtime"));
assert.ok(src.includes("DSKP KSSR ENGLISH YEAR 1 SK (SEMAKAN 2017).pdf"));
assert.ok(src.includes("Lunchtime — Food Vocabulary and Chant"));
assert.ok(src.includes("The Pizza — Story"));
assert.ok(src.includes("Numbers 11–20 and Shopping Lists"));
assert.ok(src.includes("Fruit and Vegetables — Favourites and Classification"));
assert.ok(src.includes("The Lunchbox Game — Revision"));
assert.ok(src.includes("Activity Library may vary delivery only and must not determine lesson content"));
assert.ok(src.includes("Workbook activity content is not invented"));
assert.ok(src.includes("W34 is a partial teaching week and all five Unit 4 routes remain CONDITIONAL"));
assert.ok(src.includes("no LP number is stated; do not invent an LP number"));
assert.ok(src.includes("no separate civic lesson content is fabricated"));
assert.ok(src.includes("_runtime_english_year1_unit4_source_blueprint"));
assert.equal(src.includes("Math.random"),false);
assert.equal(src.includes("mappingStatus:'VERIFIED'"),false);

const unit3=loader.indexOf('rph-english-year1-unit3-source-blueprint-hotfix.js');
const unit4=loader.indexOf('rph-english-year1-unit4-source-blueprint-hotfix.js');
const quality=loader.indexOf('rph-english-quality-hotfix.js');
assert.ok(unit3>=0,'English Year 1 Unit 3 loader missing');
assert.ok(unit4>unit3,'English Year 1 Unit 4 must load after Unit 3');
assert.ok(quality>unit4,'English Year 1 Unit 4 must load before English quality fallback');

console.log('English Year 1 Unit 4 source-first blueprint static guard passed:',routes.length,'routes; alignment review:',alignmentReview.length,'conditional:',conditional.length);
