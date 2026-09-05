import fs from 'node:fs';
import assert from 'node:assert/strict';

const src=fs.readFileSync(new URL('../rph-english-year1-unit2-source-blueprint-hotfix.js',import.meta.url),'utf8');
const loader=fs.readFileSync(new URL('../app-v03334.js',import.meta.url),'utf8');

const routes=[
  "1.1.1@22|W16|S1","2.1.1@22|W16|S2","3.1.1@22|W16|S3","4.2.1@23|W16|S4","5.1.1@23|W16|S5",
  "1.2.1@23|W17|S1","2.1.2@24|W17|S2","3.1.2@24|W17|S3","4.2.3@24|W17|S4","5.2.1@25|W17|S5",
  "1.2.2@25|W18|S1","2.1.3@25|W18|S2","3.1.3@26|W18|S3","4.2.4@26|W18|S4","5.3.1@26|W18|S5",
  "1.2.3@27|W19|S1","2.1.5@27|W19|S2","3.1.4@27|W19|S3","4.3.1@28|W19|S4","5.1.1@28|W19|S5",
  "1.2.4@28|W20|S1","2.2.2@29|W20|S2","3.2.1@29|W20|S3","4.3.2@29|W20|S4","5.2.1@30|W20|S5",
  "1.2.5@30|W21|S1","2.3.1@30|W21|S2","3.2.2@31|W21|S3","4.3.3@31|W21|S4","5.3.1@31|W21|S5",
  "1.3.1@32|W22|S1","2.1.1@32|W22|S2","3.2.3@32|W22|S3","4.2.1@33|W22|S4","5.1.1@33|W22|S5"
];
for(const r of routes)assert.ok(src.includes(`"${r}"`)||src.includes(`'${r}'`),`missing route ${r}`);

const alignmentReview=[
  "1.2.4@28|W20|S1","1.2.5@30|W21|S1","1.3.1@32|W22|S1","2.1.1@22|W16|S2","2.1.1@32|W22|S2","2.1.2@24|W17|S2","2.1.3@25|W18|S2","2.1.5@27|W19|S2","2.2.2@29|W20|S2","2.3.1@30|W21|S2","3.1.1@22|W16|S3","3.1.2@24|W17|S3","3.1.3@26|W18|S3","3.2.1@29|W20|S3","3.2.2@31|W21|S3","3.2.3@32|W22|S3","4.2.1@23|W16|S4","4.2.1@33|W22|S4","4.2.3@24|W17|S4","4.2.4@26|W18|S4","4.3.1@28|W19|S4","4.3.3@31|W21|S4","5.1.1@23|W16|S5","5.1.1@28|W19|S5","5.1.1@33|W22|S5","5.3.1@26|W18|S5"
];
for(const r of alignmentReview)assert.ok(src.includes(`"${r}"`)||src.includes(`'${r}'`),`missing alignment-review route ${r}`);

const conditional=[
  "1.1.1@22|W16|S1","2.1.1@22|W16|S2","2.1.1@32|W22|S2","3.1.1@22|W16|S3","3.2.3@32|W22|S3","4.2.1@23|W16|S4","4.2.1@33|W22|S4","5.1.1@23|W16|S5","5.1.1@33|W22|S5"
];
for(const r of conditional)assert.ok(src.includes(`"${r}"`)||src.includes(`'${r}'`),`missing conditional route ${r}`);
assert.equal(routes.length,35);assert.equal(alignmentReview.length,26);assert.equal(conditional.length,9);
for(const p of Array.from({length:12},(_,i)=>i+22))assert.ok(src.includes(`"${p}":{`)||src.includes(`"${p}": {`)||src.includes(`${p}:{`)||src.includes(`${p}: {`),`missing page task ${p}`);
assert.ok(src.includes("Unit 2: Let’s Play!"));
assert.ok(src.includes("DSKP KSSR ENGLISH YEAR 1 SK (SEMAKAN 2017).pdf"));
assert.ok(src.includes("Let's Play! — Toys and Chant"));
assert.ok(src.includes("The Go-Kart Race — Story"));
assert.ok(src.includes("Toy Descriptions — Reading"));
assert.ok(src.includes("Favourite Toys — Integrated Skills"));
assert.ok(src.includes("Tangram Project"));
assert.ok(src.includes("Creativity — Fantastic Toy"));
assert.ok(src.includes("The Spelling Game — Revision"));
assert.ok(src.includes("Activity Library may vary delivery only and must not determine lesson content"));
assert.ok(src.includes("Workbook activity content is not invented"));
assert.ok(src.includes("W16 is a partial teaching week and all five Unit 2 routes remain CONDITIONAL"));
assert.ok(src.includes("W22 S1 retains LP78 and Generate_Flag YES; W22 S2-S5"));
assert.ok(src.includes("no separate civic lesson content is fabricated"));
assert.ok(src.includes("_runtime_english_year1_unit2_source_blueprint"));
assert.equal(src.includes("Math.random"),false);
assert.equal(src.includes("mappingStatus:'VERIFIED'"),false);
assert.equal(src.includes('mappingStatus:"VERIFIED"'),false);
const unit1=loader.indexOf('rph-english-year1-unit1-source-blueprint-hotfix.js');
const unit2=loader.indexOf('rph-english-year1-unit2-source-blueprint-hotfix.js');
const quality=loader.indexOf('rph-english-quality-hotfix.js');
assert.ok(unit1>=0,'English Year 1 Unit 1 loader missing');
assert.ok(unit2>unit1,'English Year 1 Unit 2 must load after Unit 1');
assert.ok(quality>unit2,'English Year 1 Unit 2 must load before English quality fallback');
console.log('English Year 1 Unit 2 source-first blueprint static guard passed:',routes.length,'routes; alignment review:',alignmentReview.length,'conditional:',conditional.length);
