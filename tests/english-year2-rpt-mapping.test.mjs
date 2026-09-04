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

const week35 = [
  "Mapping_ID: EN2-2025B-W35-S1 | Generate_Flag: REVIEW | Module: Unit 9: At the Beach | Learning_Standard: 1.2.2 | SB_Printed_Page: 110 | WB_Printed_Page: 110 | Mapping_Status: DERIVED_NEEDS_TEACHER_REVIEW | Source_Task: Read and use the exact task on SB p. 110; WB p. 110 is optional.",
  "Mapping_ID: EN2-2025B-W35-S2 | Generate_Flag: REVIEW | Module: Unit 9: At the Beach | Learning_Standard: 2.1.3 | SB_Printed_Page: 111 | WB_Printed_Page: 111 | Mapping_Status: DERIVED_NEEDS_TEACHER_REVIEW | Source_Task: Read and use the exact task on SB p. 111; WB p. 111 is optional.",
].join('\n');

const rows = extractWorkbookMappedSessions(week35, 35);
assert.equal(rows.length, 2, 'All four-session-style rows for the requested English week must be discoverable');
assert.equal(rows[0].raw, 'EN2-2025B-W35-S1');
assert.equal(rows[0].spCode, '1.2.2');
assert.equal(rows[0].titleHint, 'At the Beach');
assert.deepEqual(rows[0].bt.pages, [110]);
assert.equal(rows[0].bt.raw, "Student's Book p. 110");
assert.deepEqual(rows[0].ba.pages, [110]);
assert.equal(rows[0].ba.raw, 'Workbook p. 110');
assert.equal(rows[0].activity, 'Read and use the exact task on SB p. 110; WB p. 110 is optional.');

assert.equal(extractWorkbookMappedSessions(week35, 34).length, 0, 'A held partial week must not borrow mappings from another week');
assert.match(source, /const activity=marks\[i\]\.activity\|\|murniActivityFromBlock\(context\)/, 'Exact Source_Task must survive Lesson Map extraction');
assert.match(source, /ba=marks\[i\]\.ba\|\|declaredBookRefs\(context,'BA'\)/, 'Explicit Workbook page must survive Lesson Map extraction');

console.log('English Year 2 RPT mapping tests passed');
