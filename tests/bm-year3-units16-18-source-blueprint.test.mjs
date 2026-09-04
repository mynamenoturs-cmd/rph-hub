import fs from 'node:fs';
import assert from 'node:assert/strict';

const src=fs.readFileSync(new URL('../rph-bm-year3-units16-18-blueprint-hotfix.js',import.meta.url),'utf8');
const loader=fs.readFileSync(new URL('../app-v03334.js',import.meta.url),'utf8');

const routes=[
  '1.2.2@22|W27|S1','2.3.2@23|W27|S2','3.3.2@24|W27|S3','4.2.3@25|W27|S4','5.3.1@26|W27|S5',
  '1.2.3@27|W28|S1','2.3.2@28|W28|S2','3.2.2@29|W28|S3','5.3.2@30|W28|S4','5.3.2@31|W28|S5',
  '5.1.1@32|W29|S1','1.1.2@33|W29|S2','2.2.1@34|W29|S3','3.2.2@35|W29|S4','4.3.1@36|W29|S5',
  '5.1.1@37|W30|S1','5.1.2@39|W30|S2','5.1.2@38|W30|S3'
];
for(const r of routes)assert.ok(src.includes(`'${r}'`),`missing route ${r}`);

assert.ok(src.includes("'5.1.2@39|W30|S2':'semburan_kabut'"));
assert.ok(src.includes("'5.1.2@38|W30|S3':'hutan_borneo'"));
assert.ok(src.includes("p:'Buku Teks Jilid 2 m/s 38'"));
assert.ok(src.includes("p:'Buku Teks Jilid 2 m/s 39'"));
assert.ok(src.includes('_runtime_bm_year3_source_page_discrepancy'));
assert.ok(src.includes('_runtime_bm_year3_source_focus_discrepancy'));
assert.ok(src.includes("'3.2.2@35|W29|S4'"));
assert.ok(src.includes('soalan bertumpu, sedangkan arahan aktiviti Buku Teks menyebut soalan bercapah'));
assert.ok(src.includes('Activity Library hanya memvariasikan cara pelaksanaan dan tidak menentukan kandungan pelajaran'));
assert.ok(src.includes('kandungan Buku Aktiviti tidak direka'));
assert.ok(src.includes('sambil, lalu, dan atau atau'));
assert.ok(src.includes('berucap, menyembur, membuka dan berkumpul'));
assert.ok(src.includes('diarahkan, terlihat dan dicatat'));
assert.ok(src.includes('sepasang, rumpun, sebatang, sekawan'));
assert.ok(src.includes('Tiada aktiviti penyemburan, fogging atau pengendalian bahan kimia dijalankan'));
assert.ok(src.includes("_runtime_bm_year3_textbook_volume:'Jilid 2'"));
assert.ok(src.includes('_runtime_bm_year3_source_snapshot_stale'));
assert.equal(src.includes('Math.random'),false);
assert.ok(loader.includes('rph-bm-year3-units16-18-blueprint-hotfix.js?v=20260905a'));

console.log('BM Year 3 Units 16-18 source-first blueprint static guard passed:',routes.length,'routes');