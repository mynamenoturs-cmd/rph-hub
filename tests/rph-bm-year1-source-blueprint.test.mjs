import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const blueprint = await fs.readFile(new URL('../rph-bm-year1-source-blueprint-hotfix.js', import.meta.url), 'utf8');
const loader = await fs.readFile(new URL('../app-v03334.js', import.meta.url), 'utf8');

assert.ok(loader.includes('rph-bm-year1-source-blueprint-hotfix.js?v=20260904a'), 'Production loader must load BM Year 1 source blueprint');
assert.ok(loader.indexOf('rph-quality-hotfix.js') < loader.indexOf('rph-bm-year1-source-blueprint-hotfix.js'), 'BM source blueprint must load after the general BM quality repair');

for (const route of ['1.2.2@109','2.3.1@110','3.2.1@111','4.2.2@112','5.3.2@113','5.3.2@114']) {
  assert.ok(blueprint.includes(`'${route}'`), `Missing BM source route ${route}`);
}

assert.ok(blueprint.includes('Padan Rangkap–Gambar–Maksud'), 'Pantun lesson must use the real meaning-from-picture task');
assert.ok(blueprint.includes('Detektif Maksud Pantun'), 'Pantun game must reinforce the actual textbook task');
assert.ok(blueprint.includes('Baca Jadual, Bina Ayat'), 'Writing lesson must build sentences from the actual timetable');
assert.ok(blueprint.includes('Persembahan Kumpulan'), 'Song lesson must assess pronunciation and intonation through performance');
assert.ok(blueprint.includes('Bedah Ayat Tunggal'), 'Grammar lesson must inspect single-sentence structure');
assert.ok(blueprint.includes('Bina Ayat Dusun Durian'), 'Compound-sentence lesson must use the durian-page context');
assert.ok(blueprint.includes('murid tidak menggunakan alat tajam'), 'Sprinkler project must keep puncturing/cutting as teacher-prepared only');
assert.ok(blueprint.includes('murid tidak menghasilkan campuran perangkap nyamuk'), 'Grammar lesson must not turn the mosquito-trap context into a making activity');
assert.ok(blueprint.includes('BT m/s 113-114 memaparkan kod 5.3.3'), 'Known textbook-vs-RPT/DSKP SP discrepancy must remain visible');
assert.ok(blueprint.includes('_runtime_bm_source_blueprint'), 'Generated map must remain traceable to BM source blueprint');
assert.ok(blueprint.includes('Activity Library hanya boleh memvariasikan cara pelaksanaan tanpa mengganti tugasan sumber'), 'Activity Library must remain secondary to the source task');

console.log('BM Year 1 source-first blueprint tests passed');
