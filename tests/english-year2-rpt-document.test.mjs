import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const docxPath = fileURLToPath(new URL(
  '../curriculum/rpt/RPT_English_Year2_2025-2026_KumpulanB_4Sesi_SourceFirst_DRAFT.docx',
  import.meta.url,
));
const xml = execFileSync('unzip', ['-p', docxPath, 'word/document.xml'], {
  encoding: 'utf8',
  maxBuffer: 8 * 1024 * 1024,
});

const decodeXml = value => String(value || '')
  .replace(/<w:tab\/>/g, '\t')
  .replace(/<w:br\/>/g, '\n')
  .replace(/<[^>]+>/g, '')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&apos;/g, "'");

const paragraphs = [...xml.matchAll(/<w:p(?:\s[^>]*)?>([\s\S]*?)<\/w:p>/g)]
  .map(match => decodeXml(match[1]).trim())
  .filter(Boolean);
const rows = paragraphs.filter(text => text.includes('Mapping_ID: EN2-2025B-'));

assert.equal(rows.length, 120, 'The English Year 2 draft must contain 30 teaching weeks × 4 sessions');

const ids = new Set();
const sessionsByWeek = new Map();
const unitPageRanges = new Map([
  [5, [58, 69]],
  [6, [70, 81]],
  [7, [82, 93]],
  [8, [94, 105]],
  [9, [106, 117]],
]);

for (const row of rows) {
  const id = /Mapping_ID:\s*(EN2-2025B-W(\d{2})-S([1-4]))\b/.exec(row);
  assert.ok(id, `Every record needs a valid four-session Mapping_ID: ${row.slice(0, 100)}`);
  assert.ok(!ids.has(id[1]), `Duplicate Mapping_ID detected: ${id[1]}`);
  ids.add(id[1]);

  const week = Number(id[2]);
  const sessions = sessionsByWeek.get(week) || new Set();
  sessions.add(Number(id[3]));
  sessionsByWeek.set(week, sessions);

  assert.match(row, /Generate_Flag:\s*REVIEW\b/, `${id[1]} must remain teacher-review only`);
  assert.match(row, /Learning_Standard:\s*\d{1,2}\.\d{1,2}\.\d{1,2}\b/, `${id[1]} needs one Learning Standard`);
  assert.match(row, /Mapping_Status:\s*DERIVED_NEEDS_TEACHER_REVIEW\b/, `${id[1]} must not be marked verified`);
  assert.match(row, /Source_Task:\s*[^|]+/, `${id[1]} needs a source-task instruction`);

  const unit = Number(/Module:\s*Unit\s*(\d+)/i.exec(row)?.[1] || 0);
  const sbPage = Number(/SB_Printed_Page:\s*(\d{1,3})\b/.exec(row)?.[1] || 0);
  const wbPage = Number(/WB_Printed_Page:\s*(\d{1,3})\b/.exec(row)?.[1] || 0);
  const range = unitPageRanges.get(unit);
  assert.ok(range, `${id[1]} must use a known Super Minds 1 unit`);
  assert.ok(sbPage >= range[0] && sbPage <= range[1], `${id[1]} SB page must stay inside Unit ${unit}`);
  assert.equal(wbPage, sbPage, `${id[1]} optional Workbook page must follow the declared draft mapping`);
}

const expectedTeachingWeeks = [
  4, 5, 6, 8, 9,
  11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
  26, 27, 28, 29, 30, 31, 32, 33, 35, 36,
];
assert.deepEqual([...sessionsByWeek.keys()].sort((a, b) => a - b), expectedTeachingWeeks);
for (const week of expectedTeachingWeeks) {
  assert.deepEqual([...sessionsByWeek.get(week)].sort(), [1, 2, 3, 4], `Week ${week} must contain S1–S4`);
}
for (const heldWeek of [2, 3, 10, 34, 37]) {
  assert.ok(!sessionsByWeek.has(heldWeek), `Held Week ${heldWeek} must not generate fabricated sessions`);
}

console.log('English Year 2 RPT document contract tests passed');
