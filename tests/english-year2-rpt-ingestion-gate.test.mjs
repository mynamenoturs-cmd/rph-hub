import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const appSource = await fs.readFile(new URL('../app-v03334-original.js', import.meta.url), 'utf8');
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
const rptText = [...xml.matchAll(/<w:p(?:\s[^>]*)?>([\s\S]*?)<\/w:p>/g)]
  .map(match => decodeXml(match[1]).trim())
  .filter(Boolean)
  .join('\n');

const mappedStart = appSource.indexOf('function mappedRptField');
const mappedEnd = appSource.indexOf('function englishMurniWeekTitle', mappedStart);
const sessionsStart = appSource.indexOf('function isGenericRptSessionTitle');
const sessionsEnd = appSource.indexOf('function subjectRPTSessionLimit', sessionsStart);
assert.ok(mappedStart >= 0 && mappedEnd > mappedStart, 'Mapped RPT parser block must exist');
assert.ok(sessionsStart >= 0 && sessionsEnd > sessionsStart, 'Session parser block must exist');

const normalizeText = value => String(value || '').replace(/\r/g, '').replace(/[ \t]+/g, ' ').trim();
const cleanLessonTitle = value => String(value || '').trim();
const validSpCode = value => /^\d{1,2}\.\d{1,2}\.\d{1,2}$/.test(String(value || '').trim());
const extractSkSp = context => {
  const spCodes = [...new Set(String(context || '').match(/\b\d{1,2}\.\d{1,2}\.\d{1,2}\b/g) || [])]
    .filter(validSpCode);
  return { spCodes, skCodes: [...new Set(spCodes.map(code => code.split('.').slice(0, 2).join('.')))] };
};
const emptyBookRef = kind => ({ kind, volume: null, pages: [], raw: '' });

const extractMurniWeekSessions = new Function(
  'normalizeText',
  'cleanLessonTitle',
  'validSpCode',
  'extractEnglishMurniTableSessions',
  'extractMurniSummaryTableMarks',
  'extractSkSp',
  'murniSpFocusFromBlock',
  'declaredBookRefs',
  'murniActivityFromBlock',
  'suspiciousTitle',
  'murniTitleFromBlock',
  `${appSource.slice(mappedStart, mappedEnd)}\n${appSource.slice(sessionsStart, sessionsEnd)}; return extractMurniWeekSessions;`,
)(
  normalizeText,
  cleanLessonTitle,
  validSpCode,
  () => [],
  () => [],
  extractSkSp,
  () => '',
  (_text, kind) => emptyBookRef(kind),
  () => '',
  () => false,
  () => '',
);

const week35 = extractMurniWeekSessions(rptText, 35);
assert.equal(week35.length, 4, 'DOCX Week 35 must ingest as four distinct Lesson Map sessions');
assert.deepEqual(week35.map(row => row.session), [1, 2, 3, 4]);
assert.ok(week35.every(row => row.complete), 'Every supported Week 35 session needs SP/SK and an exact SB page');
assert.deepEqual(week35[0].bt.pages, [110]);
assert.deepEqual(week35[0].ba.pages, [110]);
assert.equal(week35[0].spCodes[0], '1.2.2');
assert.equal(week35[0].title, 'At the Beach');
assert.match(week35[0].activity, /exact task on SB p\. 110/i);

const placeholderStart = appSource.indexOf('function isManualReviewActivityPlaceholder');
const placeholderEnd = appSource.indexOf('function cleanInstructionSentences', placeholderStart);
assert.ok(placeholderStart >= 0 && placeholderEnd > placeholderStart, 'Manual-review placeholder filter must exist');
const isManualReviewActivityPlaceholder = new Function(
  'normalizeText',
  `${appSource.slice(placeholderStart, placeholderEnd)}; return isManualReviewActivityPlaceholder;`,
)(normalizeText);
assert.equal(
  isManualReviewActivityPlaceholder(week35[0].activity),
  true,
  'The bridge instruction must not qualify as an actual Student’s Book activity',
);
assert.equal(
  isManualReviewActivityPlaceholder('Read the story and answer questions 1–3.'),
  false,
  'A concrete textbook instruction must remain eligible as source evidence',
);

for (const heldWeek of [2, 3, 10, 34, 37]) {
  assert.equal(
    extractMurniWeekSessions(rptText, heldWeek).length,
    0,
    `Held Week ${heldWeek} must not become a DOCX-ingested Lesson Map`,
  );
}

const validationStart = appSource.indexOf('function validateRphMap');
const validationEnd = appSource.indexOf('function renderRphGate', validationStart);
assert.ok(validationStart >= 0 && validationEnd > validationStart, 'RPH accuracy gate must exist');
const validateRphMap = new Function(
  'isLogicalObjectiveText',
  `${appSource.slice(validationStart, validationEnd)}; return validateRphMap;`,
)(text => String(text || '').trim().length >= 20);

const ingestedDraft = {
  verification_status: 'draft',
  confidence_score: 70,
  textbook_page_start: week35[0].bt.pages[0],
  week_exact: true,
  sp_crosscheck: true,
  sk: week35[0].skCodes.join(', '),
  sp: week35[0].spCodes.join(', '),
  objective: 'Pupils complete the exact source task accurately.',
  success_criteria: 'Pupils provide at least two accurate responses.',
  source_evidence: { meta: { main_sp: week35[0].spCodes[0] } },
};
const beforeBookVerification = validateRphMap(
  ingestedDraft,
  { bt: [], hasBA: false },
  { exactTextbookCount: 0, activities: [] },
);
assert.ok(beforeBookVerification.score < 100, 'DOCX ingestion alone must not pass the RPH accuracy gate');
assert.equal(beforeBookVerification.checks.find(check => check.n === 'Lesson Map disahkan')?.ok, false);
assert.equal(beforeBookVerification.checks.find(check => check.n === 'Source Match ≥ 85%')?.ok, false);
assert.equal(beforeBookVerification.checks.find(check => check.n === 'Tugasan Buku Teks sebenar dikesan')?.ok, false);

const afterTeacherAndBookVerification = validateRphMap(
  { ...ingestedDraft, verification_status: 'verified', confidence_score: 90 },
  { bt: [{ printed_page: 110 }], hasBA: false },
  { exactTextbookCount: 1, activities: ['Student source task verified from the declared page.'] },
);
assert.equal(afterTeacherAndBookVerification.score, 100, 'Only verified map + real textbook evidence may pass');

console.log('English Year 2 DOCX ingestion and RPH gate tests passed');
