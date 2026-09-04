import assert from 'node:assert/strict';
import fs from 'node:fs';

const src=fs.readFileSync(new URL('../rph-bm-year3-units10-12-blueprint-hotfix.js',import.meta.url),'utf8');
const loader=fs.readFileSync(new URL('../app-v03334.js',import.meta.url),'utf8');

const routes=[
  '1.2.3@62|W18|S2','2.3.1@63|W18|S3','3.3.1@64|W18|S4','3.3.1@64|W19|S3','5.1.4@68|W19|S5',
  '1.1.2@69|W20|S1','2.3.1@70|W20|S2','3.3.1@71|W20|S3','4.2.2@72|W20|S4','5.2.1@73|W21|S1','5.2.1@74|W21|S2',
  '1.1.2@75|W21|S3','3.1.1@77|W22|S1','5.2.1@78|W22|S2','5.2.2@79|W22|S3','2.3.1@80|W22|S4','3.3.1@81|W22|S5'
];
for(const route of routes) assert.ok(src.includes(`'${route}'`),`missing route ${route}`);

const reviewRoutes=['5.1.4@66|W18|S5','5.1.4@62|W19|S2','2.3.1@71|W21|S4'];
for(const route of reviewRoutes) assert.ok(src.includes(`'${route}'`),`missing review route ${route}`);

assert.ok(src.includes("subjectKey(m)!=='bm'||year(m)!==3"),'must isolate BM Year 3');
assert.ok(src.includes('Activity Library hanya memvariasikan cara pelaksanaan'),'Activity Library boundary missing');
assert.ok(src.includes('_runtime_bm_year3_source_review_required'),'review-required runtime guard missing');
assert.ok(src.includes('PKJR tidak ditambah'),'PKJR source boundary missing');
assert.ok(src.includes('tidak diminta menyertai rondaan malam sebenar'),'night-patrol safety guard missing');
assert.ok(src.includes('tanpa menggunakan akaun atau kata laluan sebenar'),'real credential safety guard missing');
assert.ok(!src.includes('Math.random'),'blueprint routing must be deterministic');
assert.ok(loader.includes('rph-bm-year3-units10-12-blueprint-hotfix.js?v=20260905a'),'loader missing Units 10-12 module');

console.log(`BM Year 3 Units 10-12 guard OK: ${routes.length} active routes + ${reviewRoutes.length} review routes`);
