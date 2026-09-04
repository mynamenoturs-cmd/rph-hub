import assert from 'node:assert/strict';
import fs from 'node:fs';

const src = fs.readFileSync(new URL('../rph-bm-year1-units22-24-blueprint-hotfix.js', import.meta.url), 'utf8');
const loader = fs.readFileSync(new URL('../app-v03334.js', import.meta.url), 'utf8');

const routes = [
  '1.2.1@138','2.2.1@139','3.3.2@140','5.2.1@141','5.2.2@142',
  '1.2.2@143','2.3.1@144','3.3.2@145','5.3.1@146',
  '1.2.2@147','2.3.2@148','3.2.3@149','5.3.2@150'
];
for (const route of routes) assert.ok(src.includes(route), `missing BM source route ${route}`);

for (const marker of [
  'Wang untuk Aimi','Rajin Menabung','Membeli Alat Tulis','Di Pejabat Pos','Barangan dan Perkhidmatan',
  'Jadikan Teladan','Sikap Baik dalam Berniaga','Cita-cita Saya','Restoran Keluarga',
  'Membeli Baju Sukan','Membuat Pilihan','Catatan Jamil','Ayat Tunggal dan Ayat Majmuk'
]) assert.ok(src.includes(marker), `missing source-specific marker: ${marker}`);

assert.ok(src.includes('Activity Library hanya boleh memvariasikan cara pelaksanaan tanpa mengganti tugasan sumber.'));
assert.ok(src.includes('RPT asal mencatat BA 774'));
assert.ok(src.includes('Buku Teks m/s 150 mencetak kod 5.3.3'));
assert.ok(src.includes('Blueprint mengekalkan SP Lesson Map/DSKP 5.3.2 tanpa mengubah mapping.'));
assert.ok(!src.includes('Variasi pilihan - Ajar Semula'));
assert.ok(loader.includes('rph-bm-year1-units22-24-blueprint-hotfix.js?v=20260904a'));

console.log('BM Year 1 units 22-24 source blueprint guards passed');
