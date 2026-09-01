import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const source = await fs.readFile(
  new URL('../app-v03334.js', import.meta.url),
  'utf8',
);

const start = source.indexOf('function rptWeekDisposition');
const end = source.indexOf('function lessonMapWeekDisposition', start);
assert.ok(start >= 0 && end > start, 'RPT week disposition helper must exist');

const normalizeText = value => String(value || '').replace(/\r/g, '').replace(/[ \t]+/g, ' ').trim();
const extractWeekContext = (value, week) => {
  const text = normalizeText(value);
  const current = new RegExp(`\\b(?:MINGGU|WEEK)\\s*0?${Number(week)}\\b`, 'i').exec(text);
  if (!current) return '';
  const tail = text.slice(current.index + current[0].length);
  const next = /\b(?:MINGGU|WEEK)\s*0?(\d{1,2})\b/i.exec(tail);
  return text.slice(current.index, next ? current.index + current[0].length + next.index : text.length);
};

const rptWeekDisposition = new Function(
  'normalizeText',
  'extractWeekContext',
  `${source.slice(start, end)}; return rptWeekDisposition;`,
)(normalizeText, extractWeekContext);

assert.equal(
  rptWeekDisposition('MINGGU 39\nUjian Akhir Sesi Akademik\nNO - UASA', 39).blocked,
  true,
  'UASA weeks must be blocked from regular RPH generation',
);
assert.equal(
  rptWeekDisposition('MINGGU 41\nPengurusan Akhir Tahun\nPemulihan dan pengayaan', 41).blocked,
  true,
  'Year-end management weeks must be blocked',
);
assert.equal(
  rptWeekDisposition('MINGGU 39\nUnit 4\nSP 1.5.1\nBT m/s 98-99', 39).blocked,
  false,
  'A real teaching week after Week 38 must remain eligible',
);
assert.equal(
  rptWeekDisposition('MINGGU 40\nPengayaan Minggu Bahasa Arab\nSP terpilih', 40).blocked,
  false,
  'Enrichment remains eligible but must pass the normal source-first gate',
);
assert.equal(
  rptWeekDisposition('MINGGU 38\nUnit 14\nBT m/s 111-112\nMINGGU 39\nUASA', 38).blocked,
  false,
  'A following UASA row must not contaminate the selected teaching week',
);

assert.ok(source.includes('NO RPH BIASA'), 'Lesson Map UI must explain the non-teaching-week block');
assert.ok(source.includes('RPH biasa tidak dijana.'), 'RPH Generator must show an explicit blocked-week result');
assert.match(source, /const disposition=lessonMapWeekDisposition\(map\);if\(disposition\.blocked\)/, 'Generation must enforce the block for existing verified maps');

console.log('Non-teaching RPH week tests passed');
