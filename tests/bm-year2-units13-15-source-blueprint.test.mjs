import fs from 'node:fs';
import assert from 'node:assert/strict';

const code = fs.readFileSync(new URL('../rph-bm-year2-units13-15-blueprint-hotfix.js', import.meta.url), 'utf8');
const loader = fs.readFileSync(new URL('../app-v03334.js', import.meta.url), 'utf8');

for (const route of [
  '1.1.2@2|W23|S1','2.3.1@3|W23|S2','3.3.1@4|W23|S3','5.2.1@6|W23|S5',
  '1.1.2@7|W24|S1','2.3.1@8|W24|S2','3.3.2@9|W24|S3','5.2.1@11|W24|S5',
  '5.2.1@12|W25|S1','1.1.2@13|W25|S2','2.3.2@14|W25|S3','3.3.2@15|W25|S4','4.2.3@16|W25|S5',
  '5.2.1@17|W26|S1','5.2.1@18|W26|S2','2.3.2@14|W26|S3','4.2.3@16|W26|S4'
]) assert.ok(code.includes(route), `missing route ${route}`);

assert.ok(code.includes("subjectKey(m)!=='bm'||year(m)!==2"), 'must stay isolated to BM Year 2');
assert.ok(code.includes('romah→rumah') && code.includes('berkenelan→berkenalan'), 'Galeri Keluarga must preserve source spelling-edit task');
assert.ok(code.includes('1 Disember 1951') && code.includes('Kampung Lanai'), 'Sekolah Kebanggaanku must use source facts');
assert.ok(code.includes('bertuah_rakyat_explore') && code.includes('bertuah_rakyat_apply'), 'repeated song sessions must differ');
assert.ok(code.includes('sajak_identiti_explore') && code.includes('sajak_identiti_apply'), 'repeated poetry sessions must differ');
assert.ok(code.includes('kata dasar, kata tunggal serta kata berimbuhan awalan dan akhiran'), 'Malam Kemerdekaan must cover source word-formation task');
assert.ok(code.includes('Activity Library hanya memvariasikan cara pelaksanaan'), 'Activity Library must remain secondary');
assert.ok(loader.includes('rph-bm-year2-units13-15-blueprint-hotfix.js'), 'production loader must include units 13-15 patch');
assert.ok(!code.includes('Math.random('), 'source blueprint must remain deterministic');

console.log('BM Year 2 Units 13-15 source blueprint guards passed');