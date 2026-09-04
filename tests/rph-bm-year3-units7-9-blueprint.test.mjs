import assert from 'node:assert/strict';
import fs from 'node:fs';

const loader=fs.readFileSync('app-v03334.js','utf8');
const src=fs.readFileSync('rph-bm-year3-units7-9-blueprint-hotfix.js','utf8');

assert.match(loader,/rph-bm-year3-units7-9-blueprint-hotfix\.js/);

const validRoutes=[
  '1.1.3@42|W13|S1','2.1.1@43|W13|S2','3.2.2@44|W13|S3','4.1.1@45|W13|S4','5.1.4@46|W13|S5','5.1.4@46|W14|S5',
  '1.2.1@47|W15|S1','2.2.1@48|W15|S2','3.2.3@50|W15|S3','5.1.4@51|W15|S4','5.1.4@52|W16|S1',
  '1.2.2@53|W16|S2','2.2.1@54|W16|S3','3.2.4@55|W16|S4','4.2.1@56|W16|S5','5.1.4@57|W17|S1','3.2.4@55|W17|S2','5.1.4@58|W17|S5','5.1.4@60|W18|S1'
];
for(const route of validRoutes) assert.ok(src.includes(route),`missing route ${route}`);

assert.ok(src.includes("'5.1.4@57|W17|S4'"),'missing Palam Pemasa review-only route');
assert.ok(src.includes('Palam Pemasa'),'missing Palam Pemasa mismatch guard');
assert.ok(src.includes('Beringat Sebelum Kena'),'missing conflicting source title in review guard');

for(const phrase of [
  'Jeriji Tingkap yang Selamat','Keselamatan Rumah Panjang di Sarawak','Tutup supaya Selamat','Tumbuhan Berbahaya','Waspada Selalu',
  'Seronoknya Berkuda','Memanjat Tembok Tiruan','Tradisional dan Moden','Usah Gentar','Wah, Seronoknya Meneroka Gua!',
  'Mangga Keselamatan','Lampu Kecemasan','Menampakkan Diri','Kamera Pintar','Hati-hati semasa Mengundur','Pengayaan — Kata Tugas',
  'Activity Library hanya memvariasikan cara pelaksanaan','_runtime_bm_year3_units7_9_mode'
]) assert.ok(src.includes(phrase),`missing source-first guard: ${phrase}`);

for(const safety of [
  'murid tidak mengendalikan jeriji sebenar',
  'murid tidak menyentuh atau mengendalikan tumbuhan',
  'murid tidak melakukan aktiviti menunggang',
  'murid tidak memanjat atau mensimulasikan sukan lasak',
  'murid tidak meneroka gua',
  'murid tidak mengendalikan pengecas, bateri atau soket',
  'murid tidak mengendalikan atau memandu kenderaan'
]) assert.ok(src.includes(safety),`missing classroom safety guard: ${safety}`);

assert.ok(!src.includes('Math.random'),'source-first blueprint must be deterministic');
assert.ok(!src.includes('index.html'),'blueprint must not touch index shell');

console.log('BM Year 3 Units 7-9 source blueprint static guards passed');