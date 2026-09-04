import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const source = await fs.readFile(
  new URL('../app-v03334-original.js', import.meta.url),
  'utf8',
);

const called = new Set(
  [...source.matchAll(/\b(is[A-Z][A-Za-z0-9]*Subject)\s*\(/g)].map(match => match[1]),
);
const defined = new Set(
  [...source.matchAll(/function\s+(is[A-Z][A-Za-z0-9]*Subject)\s*\(/g)].map(match => match[1]),
);
const missing = [...called].filter(name => !defined.has(name)).sort();

assert.deepEqual(missing, [], `Undefined subject predicate(s): ${missing.join(', ')}`);
assert.ok(defined.has('isArabicLanguageSubject'), 'Arabic subject detection must be defined');

const arabicPredicateSource = source.match(/function isArabicLanguageSubject\(subjectId\)\{[^\n]+\}/)?.[0];
assert.ok(arabicPredicateSource, 'Arabic subject predicate source must be extractable');
const subjects = {
  english: { code: 'BI', name: 'English Language' },
  englishMs: { code: 'BI', name: 'Bahasa Inggeris' },
  arabic: { code: 'BA', name: 'Bahasa Arab' },
};
const normalizeKey = value => String(value || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
const isArabicLanguageSubject = new Function(
  'getSubject',
  'normKey',
  `${arabicPredicateSource}; return isArabicLanguageSubject;`,
)(id => subjects[id], normalizeKey);

assert.equal(isArabicLanguageSubject('english'), false, 'English Language must not be classified as Arabic');
assert.equal(isArabicLanguageSubject('englishMs'), false, 'Bahasa Inggeris must not be classified as Arabic');
assert.equal(isArabicLanguageSubject('arabic'), true, 'Bahasa Arab must be classified as Arabic');

console.log('Subject predicate tests passed');
