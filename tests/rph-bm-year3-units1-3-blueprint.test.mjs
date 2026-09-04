import assert from 'node:assert/strict';
import fs from 'node:fs';

const loader=fs.readFileSync('app-v03334.js','utf8');
const src=fs.readFileSync('rph-bm-year3-units1-3-blueprint-hotfix.js','utf8');

assert.match(loader,/rph-bm-year3-units1-3-blueprint-hotfix\.js/);

const routes=[
  '1.1.1@2|W2|S1','2.1.1@3|W2|S2','3.1.1@4|W2|S3','4.1.1@5|W2|S4','5.1.1@6|W2|S5','5.1.1@6|W3|S2',
  '1.1.1@7|W3|S3','2.1.1@8|W3|S4','3.2.1@9|W4|S1','4.1.1@10|W4|S2','5.1.1@11|W4|S3','5.1.1@11|W4|S4','5.1.1@12|W4|S5','3.2.1@9|W5|S1',
  '1.1.1@13|W5|S3','2.1.1@14|W5|S4','3.2.1@15|W5|S5','5.1.2@16|W7|S1','5.1.2@18|W7|S2','2.1.1@19|W7|S3','5.1.1@20|W7|S4'
];
for(const route of routes) assert.ok(src.includes(route),`missing route ${route}`);

for(const phrase of [
  'Suria Pagi','Bantu-membantu di Dapur','Butang Kenangan','Siapa Pantas?','Kenangan Indah semasa Bercuti',
  'Kejayaan Kita Bersama','Kilang Batik Nenek','Usaha Gigih Datuk','Mari Bersepakat','Kita Boleh!','Mari Cuba',
  'Penghubung Kasih','Kem Bestari','Kenangan di Kem Bestari','Alangkah Seronoknya','Lawatan ke Taman Herba','Pemulihan','Pengayaan — Kata Nama',
  'Activity Library hanya memvariasikan cara pelaksanaan','_runtime_bm_year3_units1_3_mode'
]) assert.ok(src.includes(phrase),`missing source-first guard: ${phrase}`);

assert.ok(src.includes('kandungan PKJR tidak direka')||src.includes('kandungan PKJR tidak ditambah'), 'expected explicit PKJR non-invention guard');
assert.ok(src.includes('murid tidak mengendalikan gunting atau jarum'), 'expected classroom-safety guard for Mari Cuba');
assert.ok(!src.includes('index.html'), 'blueprint must not touch index shell');

console.log('BM Year 3 Units 1-3 source blueprint static guards passed');
