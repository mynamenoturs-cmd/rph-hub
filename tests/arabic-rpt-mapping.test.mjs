import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const source = await fs.readFile(new URL('../app-v03334-original.js', import.meta.url), 'utf8');
const start = source.indexOf('function mappedRptField');
const end = source.indexOf('function englishMurniWeekTitle', start);
assert.ok(start >= 0 && end > start, 'Workbook-style mapping parser must exist');

const normalizeText = value => String(value || '').replace(/\r/g, '').replace(/[ \t]+/g, ' ').trim();
const cleanLessonTitle = value => String(value || '').trim();
const validSpCode = value => /^\d{1,2}\.\d{1,2}\.\d{1,2}$/.test(String(value || '').trim());
const extractWorkbookMappedSessions = new Function(
  'normalizeText',
  'cleanLessonTitle',
  'validSpCode',
  `${source.slice(start, end)}; return extractWorkbookMappedSessions;`,
)(normalizeText, cleanLessonTitle, validSpCode);

const rpt = [
  'Mapping_ID: BA1-2026B-W39-S1 | Module: Unit 4: Menyalin nombor 1-10 | Learning_Standard: 3.4.1 | BT_Printed_Page: 49 | Source_Task: Salin angka dan perkataan nombor 1-10.',
  'Mapping_ID: BA1-2026B-W40-S1 | Module: Unit 4: Nombor 1-5 | Learning_Standard: 1.5.1 | BT_Printed_Page: 47 | Source_Task: Dengar, sebut dan susun nombor 1-5.',
].join('\n');

const rows = extractWorkbookMappedSessions(rpt, 40);
assert.equal(rows.length, 1, 'Only the requested Bahasa Arab week should be returned');
assert.equal(rows[0].session, 1);
assert.equal(rows[0].spCode, '1.5.1');
assert.deepEqual(rows[0].bt.pages, [47]);
assert.equal(rows[0].bt.raw, 'BT m/s 47');
assert.equal(rows[0].activity, 'Dengar, sebut dan susun nombor 1-5.');

console.log('Arabic RPT mapping tests passed');
