import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const patch = readFileSync(new URL('../rph-bm-year2-units19-21-blueprint-hotfix.js', import.meta.url), 'utf8');
const loader = readFileSync(new URL('../app-v03334.js', import.meta.url), 'utf8');

const routes = [
  '1.2.1@43|W31|S1','2.2.1@45|W31|S2','3.2.3@46|W31|S3','4.3.2@47|W31|S4','5.3.1@48|W31|S5',
  '1.2.2@49|W32|S1','2.2.1@50|W32|S2','3.2.4@51|W32|S3','4.3.2@52|W32|S4',
  '5.3.2@53|W33|S1','5.3.2@54|W33|S2','1.1.3@55|W33|S3','2.2.1@56|W33|S4','3.3.1@57|W33|S5',
  '5.3.2@58|W34|S1','5.1.2@59|W34|S2','5.3.2@60|W34|S3','5.3.2@62|W34|S4'
];

test('loader includes Year 2 units 19-21 patch after units 16-18', () => {
  const a = loader.indexOf('rph-bm-year2-units16-18-blueprint-hotfix.js');
  const b = loader.indexOf('rph-bm-year2-units19-21-blueprint-hotfix.js');
  const c = loader.indexOf('rph-science-quality-hotfix.js');
  assert.ok(a >= 0 && b > a && c > b);
});

test('all source routes are exact and present', () => {
  for (const route of routes) assert.ok(patch.includes(`'${route}'`), route);
  assert.match(patch, /routeCount:Object\.keys\(ROUTES\)\.length/);
});

test('source tasks retain subject-year locks and source-first pedagogy', () => {
  assert.match(patch, /subjectKey\(m\)!=='bm'\|\|year\(m\)!==2/);
  assert.match(patch, /Activity Library hanya memvariasikan cara pelaksanaan/);
  assert.match(patch, /librarySteps:\{support:c\.support,core:c\.core,challenge:c\.challenge\}/);
  assert.match(patch, /_runtime_bm_year2_units19_21_mode/);
});

test('key textbook tasks are protected', () => {
  assert.match(patch, /Sang Pokok Kembali Ceria/);
  assert.match(patch, /kandang kambing/);
  assert.match(patch, /Rumput Napier/);
  assert.match(patch, /ayat majmuk/);
  assert.match(patch, /kata kerja aktif transitif/);
  assert.match(patch, /murid tidak menyediakan atau menyembur bahan/);
  assert.match(patch, /bahan telah dipotong\/disediakan guru; murid tidak melakukan kerja memotong/);
});
