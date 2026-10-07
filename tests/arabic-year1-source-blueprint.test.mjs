import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const csvPath = new URL('../rph-library/generated/arabic-y1/arabic-y1-source-blueprint-draft.csv', import.meta.url);
const rptPath = fileURLToPath(new URL('../curriculum/rpt/RPT_Bahasa_Arab_Tahun1_2026_KumpulanB_SourceFirst.docx', import.meta.url));

const expectedHeader = [
  'week',
  'session',
  'title',
  'sk',
  'sp',
  'textbook_page',
  'source_task',
  'source_status',
  'notes',
];

const normalize = value => String(value || '').replace(/\s+/g, ' ').trim();
const normalizeLoose = value => normalize(value).replace(/[.,;:]+$/g, '').toLowerCase();
const internalTerm = /\b(?:OCR|LOCAL_PROPOSED|LOCAL_VERIFIED|metadata|source evidence)\b/i;

function parseCsv(text) {
  const rows = [];
  let field = '';
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      continue;
    }

    if (ch === ',') {
      row.push(field);
      field = '';
      continue;
    }

    if (ch === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      continue;
    }

    if (ch !== '\r') field += ch;
  }

  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter(cols => cols.some(v => v.length > 0));
}

const csvRaw = await fs.readFile(csvPath, 'utf8');
const parsed = parseCsv(csvRaw);
assert.ok(parsed.length > 1, 'CSV mesti ada header + data');
assert.deepEqual(parsed[0], expectedHeader, 'Header blueprint mesti ikut kontrak');

const rows = parsed.slice(1).map(cols => Object.fromEntries(expectedHeader.map((k, i) => [k, cols[i] ?? ''])));
assert.equal(rows.length, 43, 'Blueprint Bahasa Arab Tahun 1 mesti ada 43 sesi (M1-M43, S1 sahaja)');

const weeks = rows.map(r => Number(r.week));
const sessions = rows.map(r => Number(r.session));
assert.deepEqual([...new Set(weeks)].sort((a, b) => a - b), Array.from({ length: 43 }, (_, i) => i + 1));
assert.ok(sessions.every(s => s === 1), 'Setiap minggu mesti satu sesi (S1)');

const keySet = new Set();
for (const r of rows) {
  const key = `${r.week}-${r.session}`;
  assert.ok(!keySet.has(key), `Duplicate week+session: ${key}`);
  keySet.add(key);
}

const statusCounts = { SOURCE_LOCKED: 0, REVIEW: 0, NEEDS_TEXTBOOK_EVIDENCE: 0 };

for (const r of rows) {
  const week = Number(r.week);
  const page = normalize(r.textbook_page).replace(/\s+/g, '');
  const task = normalize(r.source_task);
  const status = normalize(r.source_status).toUpperCase();

  assert.ok(['SOURCE_LOCKED', 'REVIEW', 'NEEDS_TEXTBOOK_EVIDENCE'].includes(status), `Status tidak sah M${week}: ${r.source_status}`);
  statusCounts[status] += 1;

  assert.ok(!page || /^\d+(?:-\d+)?$/.test(page), `Format textbook_page tidak sah M${week}: ${r.textbook_page}`);

  const payload = [r.title, r.sk, r.sp, r.textbook_page, r.source_task, r.notes].map(normalize).join(' | ');
  assert.ok(!internalTerm.test(payload), `Istilah dalaman dikesan M${week}`);

  const teaching = !/program transisi|cuti|pentaksiran/i.test(normalize(r.title));
  if (teaching) {
    assert.ok(normalize(r.sk) && normalize(r.sk) !== '-', `SK mesti ada untuk sesi pengajaran M${week}`);
    assert.ok(normalize(r.sp) && normalize(r.sp) !== '-', `SP mesti ada untuk sesi pengajaran M${week}`);
  }

  if (status === 'SOURCE_LOCKED') {
    assert.ok(page && task, `SOURCE_LOCKED wajib ada page+task M${week}`);
  }
  if (status === 'NEEDS_TEXTBOOK_EVIDENCE') {
    assert.equal(task, '', `NEEDS_TEXTBOOK_EVIDENCE mesti kosongkan source_task M${week}`);
  }

  if (week <= 38) {
    assert.equal(status, 'NEEDS_TEXTBOOK_EVIDENCE', `M${week} mesti kekal NEEDS_TEXTBOOK_EVIDENCE`);
    assert.equal(page, '', `M${week} tidak boleh lock halaman tepat`);
  } else {
    assert.equal(status, 'REVIEW', `M${week} mesti REVIEW`);
    assert.ok(page, `M${week} wajib ada textbook_page tepat`);
    assert.ok(task, `M${week} wajib ada source_task`);
  }
}

assert.deepEqual(statusCounts, {
  SOURCE_LOCKED: 0,
  REVIEW: 5,
  NEEDS_TEXTBOOK_EVIDENCE: 38,
});

const xml = execFileSync('unzip', ['-p', rptPath, 'word/document.xml'], {
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
const mappingLines = [...xml.matchAll(/<w:p(?:\s[^>]*)?>([\s\S]*?)<\/w:p>/g)]
  .map(match => decodeXml(match[1]).trim())
  .filter(line => line.includes('Mapping_ID: BA1-2026B-W'));
assert.equal(mappingLines.length, 5, 'RPT mesti ada 5 mapping sesi tepat (M39-M43)');

for (const line of mappingLines) {
  const m = /Mapping_ID:\s*BA1-2026B-W(\d+)-S(\d+)\s*\|[\s\S]*?Learning_Standard:\s*([^|]+?)\s*\|[\s\S]*?BT_Printed_Page:\s*(\d+)\s*\|[\s\S]*?Source_Task:\s*(.+)$/.exec(line);
  assert.ok(m, `Baris mapping RPT tidak sah: ${line}`);
  const week = Number(m[1]);
  const session = Number(m[2]);
  const sp = normalize(m[3]);
  const page = normalize(m[4]);
  const task = normalize(m[5]);

  const row = rows.find(r => Number(r.week) === week && Number(r.session) === session);
  assert.ok(row, `Row CSV untuk M${week}S${session} mesti wujud`);
  assert.equal(normalize(row.sp), sp, `SP CSV mesti ikut mapping RPT M${week}S${session}`);
  assert.equal(normalize(row.textbook_page), page, `textbook_page CSV mesti ikut mapping RPT M${week}S${session}`);
  assert.equal(normalize(row.source_status), 'REVIEW', `Status M${week}S${session} mesti REVIEW`);
  assert.ok(normalizeLoose(row.source_task).includes(normalizeLoose(task).slice(0, 24)), `source_task M${week}S${session} mesti kekal source-grounded`);
}

console.log('Arabic Year 1 source blueprint draft static guard passed: 43 sesi; REVIEW=5; NEEDS_TEXTBOOK_EVIDENCE=38; SOURCE_LOCKED=0.');
