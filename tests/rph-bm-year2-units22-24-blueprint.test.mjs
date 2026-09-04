import assert from 'node:assert/strict';
import fs from 'node:fs';

const loader=fs.readFileSync('app-v03334.js','utf8');
const src=fs.readFileSync('rph-bm-year2-units22-24-blueprint-hotfix.js','utf8');

assert.match(loader,/rph-bm-year2-units22-24-blueprint-hotfix\.js/);

const routes=[
  '1.1.1@64|W35|S1','2.2.1@65|W35|S2','3.2.3@66|W35|S3','4.3.3@67|W35|S4','5.2.2@68|W35|S5',
  '1.2.1@69|W36|S1','2.3.1@70|W36|S2','3.3.2@71|W36|S3','4.3.3@72|W36|S4','5.2.3@73|W36|S5',
  '1.2.2@75|W37|S1','2.3.2@76|W37|S2','3.3.2@77|W37|S3','5.3.2@78|W37|S4','5.2.3@80|W37|S5'
];
for(const route of routes) assert.ok(src.includes(route),`missing route ${route}`);

for(const phrase of [
  'Cerita Dino','Gigih demi Kejayaan','Elis yang Jujur','Pesan Ibu Ayah','Sehari dalam Kehidupan Elis',
  'Minta Maaf, Cikgu','Marilah Kawan-kawanku','Menghargai Masa','Amal Sikap Terpuji','Menjaga Adab di Perpustakaan',
  'Hargailah Kemudahan','Anugerah Murid Contoh','Bas Kita','Elis yang Baik Hati','Si Tompok',
  'Activity Library hanya memvariasikan cara pelaksanaan','_runtime_bm_year2_units22_24_mode'
]) assert.ok(src.includes(phrase),`missing source-first guard: ${phrase}`);

assert.ok(src.includes('tanpa menyalin'), 'song activities should avoid reproducing complete lyrics');
assert.ok(!src.includes('index.html'), 'blueprint must not touch index shell');

console.log('BM Year 2 Units 22-24 source blueprint static guards passed');