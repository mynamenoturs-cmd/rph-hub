import fs from 'node:fs';
import assert from 'node:assert/strict';

const src=fs.readFileSync(new URL('../rph-bm-year3-units22-24-blueprint-hotfix.js',import.meta.url),'utf8');
const loader=fs.readFileSync(new URL('../app-v03334.js',import.meta.url),'utf8');

const routes=[
'1.2.1@66|W35|S1','2.3.1@67|W35|S2','3.3.1@68|W35|S3','5.2.1@69|W35|S4','5.2.2@70|W35|S5',
'1.2.2@71|W36|S1','2.3.1@72|W36|S2','3.3.2@73|W36|S3','4.3.3@74|W36|S4','5.2.3@75|W36|S5',
'5.3.1@76|W37|S1','1.2.3@77|W37|S2','2.3.1@78|W37|S3','3.3.2@79|W37|S4','5.3.1@80|W37|S5',
'5.3.2@81|W38|S1'
];
for(const r of routes)assert.ok(src.includes(`'${r}'`),`missing route ${r}`);

assert.ok(src.includes('Activity Library hanya memvariasikan cara pelaksanaan dan tidak menentukan kandungan pelajaran'));
assert.ok(src.includes("textbook:'bahasa_melayu_tahun_3_sk_jilid_2.pdf'"));
assert.ok(src.includes("rpt:'RPT_BM_Tahun3_2026_KumpulanB_Murni.docx'"));
assert.ok(src.includes("mapping:'RPT_BM_Tahun3_2026_KumpulanB_Mapping.xlsx'"));
assert.ok(src.includes('BA_Reference ialah page anchor sahaja; kandungan Buku Aktiviti tidak direka.'));
assert.ok(src.includes('kandungan PKJR tidak direka dalam modul ini'));
assert.ok(src.includes('W36 kepada 12–16 Oktober 2026'));
assert.ok(src.includes('W37 kepada 19–23 Oktober 2026'));
assert.equal(src.includes('|W38|S2'),false,'Sivik W38 S2 must not be routed as normal BM');
assert.equal(src.includes('|W38|S3'),false,'Ulangkaji W38 S3 must not be routed as normal BM');
assert.equal(src.includes('|W38|S4'),false,'Ulangkaji W38 S4 must not be routed as normal BM');
assert.equal(src.includes('|W38|S5'),false,'Ulangkaji W38 S5 must not be routed as normal BM');
assert.equal(src.includes('Math.random'),false);
assert.ok(loader.includes('rph-bm-year3-units22-24-blueprint-hotfix.js?v=20260905a'));
assert.ok(loader.indexOf('rph-bm-year3-units19-21-blueprint-hotfix.js') < loader.indexOf('rph-bm-year3-units22-24-blueprint-hotfix.js'));
assert.ok(loader.indexOf('rph-bm-year3-units22-24-blueprint-hotfix.js') < loader.indexOf('rph-science-quality-hotfix.js'));

console.log('BM Year 3 Units 22-24 source-first blueprint static guard passed:',routes.length,'routes');