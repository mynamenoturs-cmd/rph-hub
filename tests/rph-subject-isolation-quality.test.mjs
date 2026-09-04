import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const engine = await fs.readFile(new URL('../app-v03334-original.js', import.meta.url), 'utf8');
const loader = await fs.readFile(new URL('../app-v03334.js', import.meta.url), 'utf8');

const candidateStart = engine.indexOf('function rphLibraryCandidates');
const candidateEnd = engine.indexOf('\n}', candidateStart) + 2;
assert.ok(candidateStart >= 0 && candidateEnd > candidateStart, 'RPH library selector must exist');
const candidates = engine.slice(candidateStart, candidateEnd);
assert.match(candidates, /filter\(x=>x\.subject_key===subjectKey\)/, 'Activity Library must be hard-filtered by subject_key');
assert.doesNotMatch(candidates, /subject_key===['"]general['"]/, 'Selector must not cross-fallback to a general subject library');

const subjectKeyStart = engine.indexOf('function rphSubjectKey');
const subjectKeyEnd = engine.indexOf('\n}', subjectKeyStart) + 2;
assert.ok(subjectKeyStart >= 0 && subjectKeyEnd > subjectKeyStart, 'Subject key resolver must exist');
const subjectKeySource = engine.slice(subjectKeyStart, subjectKeyEnd);
for (const key of ['bm','en','science','pe','health','islamic_education','arabic_language']) {
  assert.ok(subjectKeySource.includes(`return'${key}'`), `Subject key resolver must include ${key}`);
}

for (const arabicSubskill of [
  'arabic_y1_alphabet','arabic_y1_greetings','arabic_y1_numbers_1_10',
  'arabic_y2_acquaintance','arabic_y2_family','arabic_y2_body','arabic_y2_school_tools','arabic_y2_numbers_11_20',
  'arabic_y3_classroom','arabic_y3_clothes','arabic_y3_colours','arabic_y3_time','arabic_y3_numbers_21_31',
]) {
  assert.ok(engine.includes(arabicSubskill), `Arabic source router must include ${arabicSubskill}`);
}

assert.match(loader, /rph-quality-hotfix\.js/, 'BM human-quality hotfix must load');
assert.match(loader, /rph-science-quality-hotfix\.js/, 'Science human-quality hotfix must load');
assert.match(loader, /rph-english-quality-hotfix\.js/, 'English human-quality hotfix must load');

console.log('RPH subject isolation and quality routing tests passed');
