import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const loader=fs.readFileSync(new URL('../app-v03334.js',import.meta.url),'utf8');
const src=fs.readFileSync(new URL('../rph-bm-year2-units16-18-blueprint-hotfix.js',import.meta.url),'utf8');

test('loader includes BM Year 2 units 16-18 patch in BM chain',()=>{
  assert.match(loader,/rph-bm-year2-units16-18-blueprint-hotfix\.js/);
  assert.ok(loader.indexOf('rph-bm-year2-units16-18-blueprint-hotfix.js')>loader.indexOf('rph-bm-year2-units13-15-blueprint-hotfix.js'));
  assert.ok(loader.indexOf('rph-bm-year2-units16-18-blueprint-hotfix.js')<loader.indexOf('rph-science-quality-hotfix.js'));
});

test('exact source routes are guarded',()=>{
  for(const route of [
    '1.1.2@22|W27|S1','2.3.2@24|W27|S2','3.3.2@25|W27|S3','4.3.1@26|W27|S4','5.2.2@27|W27|S5','5.2.3@28|W28|S1',
    '1.1.3@29|W28|S2','2.3.2@30|W28|S3','3.2.1@31|W28|S4','4.3.1@32|W28|S5','5.3.1@33|W29|S1','5.3.1@34|W29|S2',
    '1.1.3@35|W29|S3','2.3.2@36|W29|S4','3.2.2@37|W29|S5','5.3.1@38|W30|S1','5.3.1@39|W30|S2'
  ]) assert.ok(src.includes(`'${route}'`),route);
});

test('source-specific tasks and differentiation remain explicit',()=>{
  assert.match(src,/Sena Terselamat/);
  assert.match(src,/Tasik Biru/);
  assert.match(src,/tong biru, coklat dan jingga/i);
  assert.match(src,/kereta lebih ringan → kurang petrol → kurang asap/);
  assert.match(src,/kurangkan masa mandi/);
  assert.match(src,/Activity Library hanya memvariasikan cara pelaksanaan/);
  assert.match(src,/librarySteps/);
});

test('mismatched W30 S3 slot is review-only, not fabricated',()=>{
  assert.match(src,/2\.3\.2@41\|W30\|S3/);
  assert.match(src,/Budaya Sekolah Elis/);
  assert.match(src,/_runtime_bm_year2_source_review_required/);
});
