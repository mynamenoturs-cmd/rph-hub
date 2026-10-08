// CI regression test — format jadual DOCX production (buildDocxBlob).
// WAJIB berjalan tanpa rph-library/ (gitignored). Fixture sintetik: tests/fixtures/.
// Menjalankan LOGIK sebenar app-v03334-original.js + rph-approved-library.js
// (verifyDataset -> armLocal -> chosenContext -> materialize -> buildDocxBlob).
// Tiada kebergantungan luar: DOM minimal + stub JSZip; production tidak disalin.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';

const ROOT = new URL('../', import.meta.url);
const FIX = new URL('fixtures/approved-library-synthetic.json', import.meta.url);
if (!fs.existsSync(FIX)) {
  console.log(JSON.stringify({status: 'SKIP', reason: 'tests/fixtures/approved-library-synthetic.json absent'}));
  process.exit(0);
}

// --- DOM minimal ---
const els = new Map();
const mkEl = (id = '') => ({id, value: '', innerHTML: '', textContent: '', disabled: false,
  attributes: {}, style: {}, classList: {add() {}, remove() {}},
  setAttribute(k, v) { this.attributes[k] = v; }, getAttribute(k) { return this.attributes[k] ?? null; },
  removeAttribute(k) { delete this.attributes[k]; },
  querySelector: () => null, querySelectorAll: () => [], appendChild() {}, remove() {},
  cloneNode: () => mkEl(id), closest: () => null, addEventListener() {}});
const doc = {getElementById: id => els.get(id) || (els.set(id, mkEl(id)), els.get(id)),
  querySelector: s => (s.startsWith('#') ? doc.getElementById(s.slice(1)) : null),
  querySelectorAll: () => [], createElement: () => mkEl(), body: mkEl('body'),
  addEventListener() {}, documentElement: mkEl('html')};

// --- stub JSZip (menangkap document.xml tanpa menghasilkan ZIP sebenar) ---
class JSZip {
  constructor() { this.files = {}; }
  folder(name) {
    const self = this;
    return {file: (n, c) => { self.files[name + '/' + n] = c; return self; }, folder: m => self.folder(name + '/' + m)};
  }
  file(name, content) { this.files[name] = content; return this; }
  async generateAsync() {
    const xml = this.files['word/document.xml'] || '';
    return {size: xml.length, async arrayBuffer() { return Buffer.from(xml, 'utf8'); }, _xml: xml};
  }
}

const c = {console, crypto: webcrypto, TextEncoder, TextDecoder, Blob, URL, Date, JSON, Map, Set, WeakSet,
  Uint8Array, ArrayBuffer, Promise, Math, Number, String, Object, Array, RegExp, Error, TypeError,
  setTimeout, clearTimeout, setInterval: () => 0, clearInterval() {},
  JSZip, DOMException: class extends Error {}, localStorage: {getItem: () => null, setItem() {}, removeItem() {}},
  navigator: {userAgent: 'node'}, location: {href: 'https://example.invalid/'},
  document: doc, fetch: async () => ({ok: true, text: async () => '{}'})};
c.window = c; c.globalThis = c;
vm.createContext(c);

// --- ekstrak fungsi production (brace-matching; lompat senarai parameter dahulu) ---
function bodyStart(src, from) {
  let d = 0;
  for (let i = from; i < src.length; i++) {
    const ch = src[i];
    if (ch === '"' || ch === "'" || ch === '`') { const q = ch; for (i++; i < src.length; i++) { if (src[i] === '\\') { i++; continue; } if (src[i] === q) break; } continue; }
    if (ch === '(') d++;
    else if (ch === ')') { d--; if (d === 0) { for (let k = i + 1; k < src.length; k++) { if (src[k] === '{') return k; if (src[k] === ';') return -1; } } }
  }
  return -1;
}
function extractFunctions(src, names) {
  const out = [];
  for (const name of names) {
    const m = new RegExp('^(?:async\\s+)?function\\s+' + name + '\\s*\\(', 'm').exec(src);
    if (!m) continue;
    const ps = src.indexOf('(', m.index + m[0].length - 1);
    const i = bodyStart(src, ps);
    if (i < 0) continue;
    let depth = 0, j = i;
    for (; j < src.length; j++) {
      const ch = src[j];
      if (ch === '"' || ch === "'" || ch === '`') { const q = ch; for (j++; j < src.length; j++) { if (src[j] === '\\') { j++; continue; } if (src[j] === q) break; } continue; }
      if (ch === '/' && src[j + 1] === '/') { while (j < src.length && src[j] !== '\n') j++; continue; }
      if (ch === '/' && src[j + 1] === '*') { j = src.indexOf('*/', j) + 1; continue; }
      if (ch === '{') depth++;
      else if (ch === '}') { depth--; if (depth === 0) break; }
    }
    out.push(src.slice(m.index, j + 1));
  }
  return out.join('\n');
}
function extractConsts(src, names) {
  const out = [];
  for (const n of names) {
    const m = new RegExp('^const\\s+' + n + '\\s*=\\s*(.*?);\\s*$', 'm').exec(src);
    if (m) out.push('const ' + n + '=' + m[1] + ';');
  }
  return out.join('\n');
}
const wanted = ['buildDocxBlob','generatedRphExportContext','rphDocxParagraph','rphDocxCell','rphDocxRow',
  'rphDocxTable','rphDocxSection','rphDocxLabelRow','rphDocxActivityTable','currentReflectionData',
  'getClass','getSubject','stageLabel','xmlEscape','escapeHtml','rphLaneDetailRows',
  'rphAssessmentDetailRows','rphClosureDetailRows','rphContentStatusLabel'];
const appSrc = fs.readFileSync(new URL('app-v03334-original.js', ROOT), 'utf8');
const extracted = extractConsts(appSrc, ['DOCX_MIME']) + '\n' + extractFunctions(appSrc, wanted);
for (const n of wanted) if (!extracted.includes('function ' + n + '(')) { console.error('extractor gagal: ' + n); process.exit(1); }
vm.runInContext(extracted, c, {filename: 'app-helpers.js'});
for (const f of ['rph-record-versions.js', 'rph-approved-library.js']) {
  const p = new URL(f, ROOT);
  if (!fs.existsSync(p)) { console.error('modul diperlukan hilang: ' + f); process.exit(1); }
  vm.runInContext(fs.readFileSync(p, 'utf8'), c, {filename: f});
}

// --- fixture sintetik -> dataset PRODUCTION (verifyDataset), bukan ctx tiruan ---
const fixture = JSON.parse(fs.readFileSync(FIX, 'utf8'));
const b = c.RphApprovedLibrary, rv = c.RphRecordVersions;
for (const e of fixture.entries) {
  e.content_sha256 = await rv.sha256(e.raw_lesson_json);
  e.reviewed_blocks_sha256 = await rv.sha256(rv.stable(e.reviewed_blocks));
}
const data = await b.verifyDataset(fixture);
b.armLocal(data, {enabledIds: data.entries.map(e => e.id)});

c.RphApprovedLibrary.contextBlocks = () => [
  {kind: 'title', text: 'Sintetik'}, {kind: 'subtitle', text: 'Sintetik R1'}, {kind: 'p', text: 'ID: SYN-2026B-W29-S1'},
  {kind: 'p', text: 'Maklumat pelaksanaan sebenar'},
  {kind: 'p', text: 'Guru: Guru ujian | Kelas: Kelas ujian | Tarikh: 2026-10-05 | Waktu: 08:00–08:30'},
  {kind: 'p', text: 'Versi kandungan diluluskan: SYN-R1 | ID: SYN-2026B-W29-S1 | SHA-256: ' + 'a'.repeat(64)},
];
c.currentReflectionData = () => ({total: 10, present: 9, achieved: 8, active: 7, note: '', text: 'Refleksi selepas PdP.', language: 'ms'});
c.getClass = () => ({id: 'c1', name: 'Kelas Sintetik', year: 1});
c.getSubject = () => ({id: 's1', name: 'Sintetik', code: 'SYN'});

function ctxFrom(entry) {
  const L = entry.lesson;
  const map = {...b.mapTemplate(data, entry), id: 'map-' + entry.id, subject_id: 's1',
    verification_status: 'verified', confidence_score: 100,
    source_evidence: {textbook: true, meta: {...b.mapTemplate(data, entry).source_evidence.meta,
      verification_scope: 'VM_TEST_FIXTURE'}}};
  const ctx = b.chosenContext(data, map, {subjectKey: 'syn', classId: 'c1', subjectId: 's1',
    date: '2026-10-05', duration: L.minutes, lessonTime: L.minutes + ' minit', teacherName: 'Guru ujian', className: 'Kelas Sintetik'});
  ctx.btRef = 'm/s ' + L.book_pages_text;
  return ctx;
}

// --- helper pembacaan dokumen ---
const readDoc = xml => {
  const texts = [...xml.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map(m => m[1]);
  const rows = [...xml.matchAll(/<w:tr>[\s\S]*?<\/w:tr>/g)].map(r =>
    [...r[0].matchAll(/<w:tc>[\s\S]*?<\/w:tc>/g)].map(tc => {
      // <w:br/> = pemisah baris; <w:t> = teks sebenar
      const txt = [...tc[0].matchAll(/<w:t[^>]*>([^<]*)<\/w:t>|<w:br\s*\/>/g)]
        .map(m => m[1] !== undefined ? m[1] : '\n').join('');
      const shade = (tc[0].match(/<w:shd[^>]*w:fill="([0-9A-Fa-f]{6})"/) || [])[1] || '';
      return {text: txt, shade};
    }));
  return {texts, comb: texts.join('\n'), rows, cells: rows.flat(), xml};
};

let pass = 0;
const fails = [];
const check = async (name, fn) => { try { await fn(); pass++; } catch (e) { fails.push(name + ': ' + e.message); } };

for (const entry of fixture.entries) {
  const L = entry.lesson;
  const base = ctxFrom(entry);
  const doc1 = readDoc((await c.buildDocxBlob(c.generatedRphExportContext(base)))._xml);

  await check('jadual bersempadan ' + entry.id, () => {
    assert.ok((doc1.xml.match(/<w:tbl>/g) || []).length >= 12, 'jadual terlalu sedikit: ' + (doc1.xml.match(/<w:tbl>/g) || []).length);
    assert.ok(doc1.xml.includes('<w:tblBorders>'), 'tiada sempadan jadual');
    assert.equal((doc1.xml.match(/<w:tbl>/g) || []).length, (doc1.xml.match(/<\/w:tbl>/g) || []).length, 'jadual tidak seimbang');
  });
  await check('bahagian A-G ' + entry.id, () => {
    for (const s of ['A. MAKLUMAT PENGAJARAN', 'B. PENJAJARAN KURIKULUM', 'C. SET INDUKSI',
      'D. AKTIVITI SUMBER DARIPADA BUKU', 'E. PDP TERBEZA', 'F. PENTAKSIRAN BILIK DARJAH (PBD)',
      'G. PENUTUP DAN REFLEKSI']) assert.ok(doc1.comb.includes(s), 'hilang ' + s);
  });
  await check('Terbeza Support/Core/Challenge: tajuk sendiri + tidak kosong ' + entry.id, () => {
    for (const [lane, label] of [['support', 'Kelompok Peneroka'], ['core', 'Kelompok Pembina'], ['challenge', 'Kelompok Pencabar']]) {
      // mesti ada BARIS TAJUK berasingan (1 sel berlatar) untuk setiap kumpulan
      const titleRows = doc1.rows.filter(r => r.length === 1 && r[0].text.includes(label) && /^[0-9A-Fa-f]{6}$/.test(r[0].shade));
      assert.equal(titleRows.length, 1, lane + ': baris tajuk kumpulan tiada/berulang');
      assert.ok(doc1.comb.includes(L.differentiation[lane].label), lane + ': label kumpulan hilang');
      // teks kumpulan mesti KEKAL dalam sel tersendiri (bukan dikosongkan/digabung)
      const groupCells = doc1.cells.filter(c => c.text.includes(L.differentiation[lane].task));
      assert.equal(groupCells.length, 1, lane + ': sel kumpulan tiada/berulang');
      assert.ok(groupCells[0].text.includes(L.differentiation[lane].support_description), lane + ': perihalan sokongan hilang dari sel kumpulan');
      assert.ok(groupCells[0].text.includes('Langkah murid:'), lane + ': label langkah murid hilang');
      assert.ok(groupCells[0].text.includes(L.differentiation[lane].pupil_steps[0]), lane + ': langkah murid hilang');
      assert.ok(groupCells[0].text.includes(L.differentiation[lane].product), lane + ': hasil individu hilang');
      assert.ok(groupCells[0].text.includes(L.differentiation[lane].next_step), lane + ': susulan hilang');
    }
  });
  await check('Susulan tidak berulang ' + entry.id, () => {
    // Skop bahagian E sahaja: teks refleksi guru (bahagian G) boleh mengandungi 'Susulan: ____'.
    const e0 = doc1.comb.indexOf('E. PDP TERBEZA');
    const f0 = doc1.comb.indexOf('F. PENTAKSIRAN BILIK DARJAH (PBD)');
    assert.ok(e0 > 0 && f0 > e0, 'bahagian E/F tidak dijumpai');
    const secE = doc1.comb.slice(e0, f0);
    assert.equal((secE.match(/Susulan:/g) || []).length, 3, 'Susulan mesti tepat 3 (satu setiap kumpulan) dalam bahagian E');
  });
  await check('SP sokongan kod sahaja, tiada berulang ' + entry.id, () => {
    for (const cs of L.complementary_standards) {
      assert.ok(doc1.comb.includes(cs.sp_code), 'hilang kod SP ' + cs.sp_code);
      assert.equal((doc1.comb.match(new RegExp(cs.sp_code.replace(/\./g, '\\.'), 'g')) || []).length, 1, 'SP sokongan berulang: ' + cs.sp_code);
    }
  });
  await check('Alatan/BBM tiada cantuman atau ulangan ' + entry.id, () => {
    assert.ok(!/Keperluan:|Kegunaan:/.test(doc1.comb), 'label alat bercantum muncul semula');
    for (const m of L.bbm) assert.ok(doc1.comb.includes(m.item), 'BBM hilang: ' + m.item);
    // setiap item bahan tidak boleh muncul 2x dalam baris Bahan yang sama (cantuman berulang)
    for (const [lane, label] of [['support', 'Peneroka'], ['core', 'Pembina'], ['challenge', 'Pencabar']]) {
      const cell = doc1.cells.find(c => c.text.includes(L.differentiation[lane].task));
      assert.ok(cell, lane + ': sel kumpulan tiada');
      const bahanLine = cell.text.split('\n').find(x => x.startsWith('Bahan:')) || '';
      for (const it of L.differentiation[lane].materials) {
        const n = (bahanLine.match(new RegExp(it.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
        assert.equal(n, 1, lane + ' (' + label + '): bahan "' + it + '" muncul ' + n + ' kali dalam baris Bahan');
      }
    }
  });
  await check('masa/langkah tidak bertindih atau berulang ' + entry.id, () => {
    // Skop: bahagian D sahaja (E terbeza bermula Langkah 1 semula — itu betul).
    const dStart = doc1.comb.indexOf('D. AKTIVITI SUMBER DARIPADA BUKU');
    const eStart = doc1.comb.indexOf('E. PDP TERBEZA');
    assert.ok(dStart > 0 && eStart > dStart, 'bahagian D/E tidak dijumpai');
    const secD = doc1.comb.slice(dStart, eStart);
    for (let i = 1; i <= L.phases.length; i++) {
      const n = (secD.match(new RegExp('Langkah ' + i + '(?!\\d)', 'g')) || []).length;
      assert.equal(n, 1, 'bahagian D: Langkah ' + i + ' muncul ' + n + ' kali');
    }
    const total = L.phases.reduce((s, p) => s + p.minutes, 0);
    assert.equal(total, L.minutes, 'jumlah minit langkah tidak sepadan dengan tempoh sesi');
  });
  await check('intervensi/PBD hadir ' + entry.id, () => {
    assert.ok(doc1.comb.includes('Kaedah Pentaksiran'), 'label PBD hilang');
    assert.ok(doc1.comb.includes(L.pbd.method[0]), 'kaedah PBD hilang');
    assert.ok(doc1.comb.includes(L.pbd.evidence[0]), 'evidens PBD hilang');
    assert.ok(doc1.comb.includes('Refleksi Selepas PdP'), 'refleksi hilang');
  });
  await check('struktur perenggan DOCX kemas ' + entry.id, () => {
    const biggest = Math.max(...doc1.cells.map(x => x.text.length));
    assert.ok(biggest < 1600, 'sel terbesar ' + biggest + ' aksara');
    assert.ok(doc1.cells.length >= 60, 'sel terlalu sedikit: ' + doc1.cells.length);
    assert.ok(!/<w:tbl>\s*<\/w:tbl>/.test(doc1.xml), 'jadual kosong');
  });
  await check('preservation kandungan sumber ' + entry.id, () => {
    for (const p of L.phases) {
      assert.ok(doc1.comb.includes(p.teacher[0]), 'tindakan guru hilang: ' + p.name);
      assert.ok(doc1.comb.includes(p.pupils[0]), 'tindakan murid hilang: ' + p.name);
    }
    assert.ok(doc1.comb.includes(L.objective), 'objektif hilang');
    assert.ok(doc1.comb.includes(L.success_criteria[0]), 'kriteria kejayaan hilang');
    assert.ok(doc1.comb.includes(L.sp_code), 'SP utama hilang');
  });
  await check('source task dipelihara bila langkah kosong ' + entry.id, async () => {
    const bare = ctxFrom(entry);
    bare.pedagogy.sourceSteps = [];
    const d2 = readDoc((await c.buildDocxBlob(c.generatedRphExportContext(bare)))._xml);
    assert.ok(d2.comb.includes(L.source_task), 'source task fallback hilang');
  });
}

if (fails.length) { console.error('rph-docx-table-format: FAIL\n' + fails.map(f => '  - ' + f).join('\n')); process.exit(1); }
console.log(JSON.stringify({status: 'PASS', checks: pass, sessions: fixture.entries.length, source: 'tests/fixtures/approved-library-synthetic.json'}));
