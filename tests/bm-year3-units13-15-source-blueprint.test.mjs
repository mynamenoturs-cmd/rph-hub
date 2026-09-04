import fs from 'node:fs';
import assert from 'node:assert/strict';

const src=fs.readFileSync(new URL('../rph-bm-year3-units13-15-blueprint-hotfix.js',import.meta.url),'utf8');
const loader=fs.readFileSync(new URL('../app-v03334.js',import.meta.url),'utf8');

const routes=[
'1.1.3@1|W23|S1','2.3.1@4|W23|S2','3.1.1@5|W23|S3','5.2.3@6|W23|S4','5.2.3@6|W23|S5',
'1.1.3@7|W24|S1','2.3.2@8|W24|S2','3.3.2@9|W24|S3','4.2.3@10|W24|S4','5.2.3@11|W24|S5','5.2.3@12|W25|S1',
'1.2.1@13|W25|S2','2.3.2@14|W25|S3','3.3.2@15|W25|S4','5.3.1@16|W25|S5','5.3.1@17|W26|S1','5.3.1@18|W26|S2','3.3.2@19|W26|S3','3.3.1@20|W26|S4'];
for(const r of routes)assert.ok(src.includes(`'${r}'`),`missing route ${r}`);

assert.ok(src.includes("_runtime_bm_year3_textbook_volume:'Jilid 2'"));
assert.ok(src.includes('_runtime_bm_year3_source_snapshot_stale'));
assert.ok(src.includes('_runtime_bm_year3_source_conditional'));
assert.ok(src.includes("'5.2.3@6|W23|S4':'galah_explore'"));
assert.ok(src.includes("'5.2.3@6|W23|S5':'galah_apply'"));
assert.ok(src.includes('kata ganda berentak'));
assert.ok(src.includes('kata ganda separa'));
assert.ok(src.includes('selampai manik'));
assert.ok(src.includes('Pemerah Santan Tradisional'));
assert.ok(src.includes('Tan Sri S.M. Salim'));
assert.ok(src.includes('Tangga Batu Rumah Tradisional Melaka'));
assert.ok(src.includes('Activity Library hanya memvariasikan cara pelaksanaan'));
assert.ok(src.includes('Rujukan BA kekal sebagai page anchor sahaja dan kandungan BA tidak direka'));
assert.equal(src.includes('Math.random'),false);
assert.ok(loader.includes('rph-bm-year3-units13-15-blueprint-hotfix.js?v=20260905a'));

console.log('BM Year 3 Units 13-15 source-first blueprint static guard passed:',routes.length,'routes');