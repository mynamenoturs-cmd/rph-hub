import assert from 'node:assert/strict';
import fs from 'node:fs';

const loader=fs.readFileSync('app-v03334.js','utf8');
const src=fs.readFileSync('rph-bm-year3-units4-6-blueprint-hotfix.js','utf8');

assert.match(loader,/rph-bm-year3-units4-6-blueprint-hotfix\.js/);

const routes=[
  '1.1.2@22|W8|S1','2.1.2@23|W8|S2','3.2.1@24|W8|S3','5.1.3@25|W8|S4','5.1.3@26|W8|S5',
  '1.1.2@27|W9|S1','2.1.2@28|W9|S2','3.2.1@29|W9|S3','4.1.1@30|W9|S4','5.1.3@31|W9|S5',
  '5.1.4@32|W10|S1','5.1.3@31|W10|S4',
  '1.1.3@33|W11|S1','2.1.2@34|W11|S2','3.2.2@35|W11|S3','5.1.4@37|W12|S1','1.1.3@38|W12|S2',
  '1.1.2@39|W12|S4','2.1.2@40|W12|S5'
];
for(const route of routes) assert.ok(src.includes(route),`missing route ${route}`);

for(const reviewRoute of ['5.1.4@31|W11|S5','5.1.4@31|W12|S3']) {
  assert.ok(src.includes(reviewRoute),`missing review-only route ${reviewRoute}`);
}

for(const phrase of [
  'Minuman Kesihatan','Khasiat Vitamin C','Makanan Sumber Tenaga','Beriadah di Kolam Air Panas','Katakan Boleh',
  'Pilihan Tepat Kita Selamat','Mari Bersihkan Diri','Premis Makanan Pilihan Anda','Jagalah Kebersihan','Dapur Bersih','Cegah Lalat',
  'Aromaterapi','Yakin Boleh','Elakkan Kuman','Kembara Sihat','Gejala Taun','Penilaian Tema 2','Bacaan Luas — Hari Sukan Negara',
  'Activity Library hanya memvariasikan cara pelaksanaan','_runtime_bm_year3_units4_6_mode',
  '_runtime_bm_year3_source_review_required','Cergas dan Cerdas'
]) assert.ok(src.includes(phrase),`missing source-first guard: ${phrase}`);

assert.ok(src.includes('murid tidak memotong halia atau menyediakan minuman'));
assert.ok(src.includes('tidak membandingkan berat, bentuk badan atau sasaran fizikal'));
assert.ok(src.includes('tiada nyalaan lilin atau api terbuka digunakan'));
assert.ok(src.includes('Tiada aktiviti merasa bahan dijalankan'));
assert.ok(src.includes('bukan nasihat rawatan perubatan'));
assert.ok(src.includes('murid tidak membuat diagnosis atau menyediakan rawatan sendiri'));
assert.ok(!src.includes('index.html'), 'blueprint must not touch index shell');

console.log('BM Year 3 Units 4-6 source blueprint static guards passed');