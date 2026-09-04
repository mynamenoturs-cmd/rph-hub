import fs from 'node:fs';
import assert from 'node:assert/strict';

const src=fs.readFileSync(new URL('../rph-bm-year3-units19-21-blueprint-hotfix.js',import.meta.url),'utf8');
const loader=fs.readFileSync(new URL('../app-v03334.js',import.meta.url),'utf8');

const routes=[
  '1.1.2@43|W31|S1','2.2.1@45|W31|S2','3.2.3@46|W31|S3','4.3.1@47|W31|S4','5.1.3@48|W31|S5',
  '5.1.4@50|W32|S1','1.1.3@51|W32|S2','2.2.1@52|W32|S3','3.2.4@53|W32|S4',
  '5.1.4@54|W33|S1','5.1.4@55|W33|S2','5.1.4@56|W33|S3','1.1.3@57|W33|S4','2.3.1@58|W33|S5',
  '3.3.1@59|W34|S1','4.3.2@60|W34|S2','5.1.4@61|W34|S3','5.1.4@62|W34|S4'
];
for(const r of routes)assert.ok(src.includes(`'${r}'`),`missing route ${r}`);

assert.ok(src.includes("const CONDITIONAL=new Set(['3.3.1@59|W34|S1'])"));
assert.ok(src.includes("const NORMALIZED_PAGE=new Set(['3.3.1@59|W34|S1'])"));
assert.ok(src.includes('_runtime_bm_year3_source_page_normalized'));
assert.ok(src.includes('_runtime_bm_year3_source_conditional'));
assert.ok(src.includes("_runtime_bm_year3_textbook_volume:'Jilid 2'"));
assert.ok(src.includes('_runtime_bm_year3_source_snapshot_stale'));
assert.ok(src.includes('RPT asal menyatakan BT55'));
assert.ok(src.includes('Buku Teks Jilid 2 m/s 59 (PDF hlm 63)'));
assert.ok(src.includes('Activity Library hanya memvariasikan cara pelaksanaan dan tidak menentukan kandungan pelajaran'));
assert.ok(src.includes('kandungan Buku Aktiviti tidak direka'));
assert.ok(src.includes('tiada bahan salutan nano, bahan kimia atau prosedur coating dikendalikan'));
assert.ok(src.includes('tiada telur ikan, ikan hidup atau peralatan pengeraman dikendalikan'));
assert.ok(src.includes('tiada penyediaan makanan ternakan, pemeraman, fermentasi atau merasa bahan dijalankan'));
assert.ok(src.includes('tiada penggunaan pisau, gunting, alat tajam atau aktiviti memotong tumbuhan'));
assert.ok(src.includes('murid tidak merasa atau menyediakan makanan'));
assert.ok(src.includes('tiada aktiviti memasak, menyediakan atau merasa makanan'));
assert.ok(src.includes('Kandungan PKJR tidak direka dalam modul BM ini'));
assert.equal(src.includes('Math.random'),false);
assert.ok(loader.includes('rph-bm-year3-units19-21-blueprint-hotfix.js?v=20260905a'));

console.log('BM Year 3 Units 19-21 source-first blueprint static guard passed:',routes.length,'routes');