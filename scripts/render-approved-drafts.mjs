// Jana DOCX format RPH Hub (A–G) terus daripada draf murni yang telah diluluskan guru.
// Sumber: rph-library/generated/<kumpulan>/drafts/*.json  (di luar Git — data guru, tidak disalin ke repo)
// Guna penjana PRODUCTION sebenar (app-v03334-original.js) — tiada penjana kedua.
// Guna: node scripts/render-approved-drafts.mjs [--out DIR] [--limit N]
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';

const HOME = process.env.HOME;
const ROOT = path.join(HOME, 'rph-hub');
const GEN = path.join(ROOT, 'rph-library', 'generated');
const args = process.argv.slice(2);
const argOf = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const OUT = argOf('--out', path.join(HOME, '.hermes', '_approved_render'));
const LIMIT = Number(argOf('--limit', '0')) || 0;

// ---- DOM minimal + stub JSZip (sama seperti ujian CI) ----
const els = new Map();
const mkEl = (id = '') => ({id, value: '', innerHTML: '', textContent: '', disabled: false, attributes: {}, style: {},
  classList: {add() {}, remove() {}}, setAttribute(k, v) { this.attributes[k] = v; }, getAttribute(k) { return this.attributes[k] ?? null; },
  removeAttribute(k) { delete this.attributes[k]; }, querySelector: () => null, querySelectorAll: () => [], appendChild() {},
  remove() {}, cloneNode: () => mkEl(id), closest: () => null, addEventListener() {}});
const doc = {getElementById: id => els.get(id) || (els.set(id, mkEl(id)), els.get(id)),
  querySelector: s => (s.startsWith('#') ? doc.getElementById(s.slice(1)) : null), querySelectorAll: () => [],
  createElement: () => mkEl(), body: mkEl('body'), addEventListener() {}, documentElement: mkEl('html')};
class JSZip {
  constructor() { this.files = {}; }
  folder(n) { const self = this; return {file: (a, b) => { self.files[n + '/' + a] = b; return self; }, folder: m => self.folder(n + '/' + m)}; }
  file(n, c) { this.files[n] = c; return this; }
  async generateAsync() { const xml = this.files['word/document.xml'] || ''; return {size: xml.length, async arrayBuffer() { return Buffer.from(xml, 'utf8'); }, _xml: xml}; }
}
// JSZip sebenar (npm di .tooling) bila ada supaya DOCX = ZIP sah; fallback stub di atas.
const c = {console, crypto: webcrypto, TextEncoder, TextDecoder, Blob, URL, Date, JSON, Map, Set, WeakSet, Uint8Array,
  ArrayBuffer, Promise, Math, Number, String, Object, Array, RegExp, Error, TypeError, setTimeout, clearTimeout,
  setInterval: () => 0, clearInterval() {}, JSZip, DOMException: class ExtErr extends Error {},
  localStorage: {getItem: () => null, setItem() {}, removeItem() {}}, navigator: {userAgent: 'node'},
  location: {href: 'https://example.invalid/'}, document: doc, fetch: async () => ({ok: true, text: async () => '{}'})};
c.window = c; c.globalThis = c;
for (const g of fs.readdirSync(GEN)) {
  const p = path.join(GEN, g, '.tooling', 'node_modules', 'jszip');
  if (fs.existsSync(p)) { c.JSZip = (await import('file://' + path.join(p, 'lib', 'index.js'))).default; break; }
}
vm.createContext(c);

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
      if (ch === '{') depth++; else if (ch === '}') { depth--; if (depth === 0) break; }
    }
    out.push(src.slice(m.index, j + 1));
  }
  return out.join('\n');
}
const appSrc = fs.readFileSync(path.join(ROOT, 'app-v03334-original.js'), 'utf8');
const cm = /^const\s+DOCX_MIME\s*=\s*(.*?);\s*$/m.exec(appSrc);
vm.runInContext('const DOCX_MIME=' + cm[1] + ';', c);
vm.runInContext(extractFunctions(appSrc, ['buildDocxBlob','generatedRphExportContext','rphDocxParagraph','rphDocxCell',
  'rphDocxRow','rphDocxTable','rphDocxSection','rphDocxLabelRow','rphDocxActivityTable','currentReflectionData',
  'getClass','getSubject','stageLabel','xmlEscape','escapeHtml']), c, {filename: 'app-helpers.js'});
for (const f of ['rph-record-versions.js', 'rph-approved-library.js']) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), c, {filename: f});
}

// ---- padanan subjek -> kod app ----
const SUBJ = {bm: 'bm', english: 'bi', pj: 'pj', pk: 'pk', science: 'sains'};
function subjectKeyOf(j) {
  const s = String(j.subject || '').toLowerCase();
  if (s.includes('melayu') || s.startsWith('bm')) return 'bm';
  if (s.includes('english') || s.startsWith('en')) return 'bi';
  if (s.includes('jasmani')) return 'pj';
  if (s.includes('kesihatan')) return 'pk';
  if (s.includes('sains') || s.startsWith('sc')) return 'sains';
  return s || 'lain';
}
const stamp = t => ({kind: 'p', text: t});
// tukar nilai apa pun (rentetan/senarai/objek) jadi teks — elak '[object Object]'.
function flat2(v) {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) return v.map(flat2).filter(Boolean).join('\n');
  if (typeof v === 'object') return Object.values(v).map(flat2).filter(Boolean).join('\n');
  return String(v);
}
// pak21 boleh jadi rentetan ATAU objek {name, implementation} (English Y3) — jangan biar [object Object].
function pak21Text(v) {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) return v.map(pak21Text).filter(Boolean).join('; ');
  if (typeof v === 'object') { const p = [v.name, v.implementation, v.note, v.description].filter(Boolean).map(String); return p.join(': '); }
  return String(v);
}
function num(v, d) { const n = Number(v); return Number.isFinite(n) ? n : d; }

// bina ctx yang buildDocxBlob terima — medan sama seperti chosenContext() production
function ctxFrom(j, meta) {
  const subj = SUBJ[subjectKeyOf(j)] || subjectKeyOf(j);
  const mins = num(j.minutes ?? j.duration ?? meta.minutes ?? 30, 30);
  const phases = (j.phases || []).map((p, k) => ({
    key: (j.id || 'x') + '-s' + k, name: p.name || ('Langkah ' + (k + 1)), minutes: num(p.minutes, 0),
    text: [['Tindakan guru', p.teacher], ['Tindakan murid', p.pupils || p.pupil], ['Semakan', p.check], ['Bahan', p.resources]]
      .filter(([, v]) => v).map(([k2, v]) => k2 + ': ' + (Array.isArray(v) ? v.join('\n') : v)).join('\n'),
    bbm: flat2(p.resources), pak21: pak21Text(j.pak21)
  }));
  // Guna struktur teks yang SAMA seperti laneText() production:
  // flat() mesti terima rentetan MAUPUN senarai (draf berbeza-beza bentuk).
  const flat = v => typeof v === 'string' ? v
    : Array.isArray(v) ? v.map(flat).filter(Boolean).join('\n')
    : v && typeof v === 'object' ? Object.values(v).map(flat).filter(Boolean).join('\n')
    : v == null ? '' : String(v);
  const lane = k => {
    const l = (j.differentiation || {})[k] || {};
    const ex = l.example || {};
    const lines = [
      l.support_description || l.description || '',
      l.task ? 'Tugasan: ' + flat(l.task) : '',
      flat(l.materials) ? 'Bahan: ' + flat(l.materials) : '',
      flat(l.teacher) ? 'Bimbingan guru: ' + flat(l.teacher) : '',
      flat(l.pupil_steps) ? 'Langkah murid: ' + flat(l.pupil_steps) : '',
      flat(ex.teacher) ? 'Contoh guru: ' + flat(ex.teacher) : '',
      flat(ex.pupil) ? 'Contoh respons murid: ' + flat(ex.pupil) : '',
      flat(l.product) ? 'Hasil individu: ' + flat(l.product) : '',
      flat(l.criterion) ? 'Kriteria: ' + flat(l.criterion) : '',
      flat(l.next_step) ? 'Susulan: ' + flat(l.next_step) : ''
    ].filter(Boolean);
    return [{key: j.id || 'x', name: l.label || '', text: lines.join('\n'), bbm: flat(l.materials), pak21: pak21Text(j.pak21)}];
  };
  const semi = v => Array.isArray(v) ? v.join('; ') : (v || '');
  const comp = (j.complementary_standards || []).map(x => x.sp_code || x.main_sp || x).filter(Boolean);
  const pbd = j.pbd || {};
  const title = j.source_title || j.rpt_topic || j.title || j.activity_name || 'RPH';
  const map = {title, sk: [j.sk_code, j.sk_text].filter(Boolean).join(' '), sp: j.sp_code || semi(comp[0]) || '',
    objective: j.objective || '', success_criteria: semi(j.success_criteria), session_no: num(j.session, 1),
    week_no: num(j.week, 1), progression_stage: 'application',
    source_evidence: {meta: {main_sp: j.sp_code || '', complementary_sp: comp}}};
  return {
    map, classId: 'c1', subjectId: 's1', date: j.date || '2026-10-05',
    week: num(j.week ?? meta.week, 1), lessonTime: mins + ' minit',
    teacherName: (meta.teacher && meta.teacher.name) || '', className: (meta.className || ''),
    uiEn: false, btRef: 'm/s ' + (j.book_pages_text || j.book_pages || j.rpt_book_pages || '—'),
    activities: [j.activity_name || title],
    approvedLibrary: {id: j.id, version: meta.version || '', lesson: j, reviewed_blocks: [], limits: {}},
    pedagogy: {sourceSteps: phases, librarySteps: {support: lane('support'), core: lane('core'), challenge: lane('challenge')},
      pbdEvidence: {method: semi(pbd.method), evidence: semi(pbd.evidence), criterion: semi(pbd.criterion)},
      penutup: (phases.at(-1)?.text) || '', anchor: j.activity_name || title,
      inductionData: {text: phases[0]?.text || '', bbm: phases[0]?.bbm || '', pak21: pak21Text(j.pak21)}}
  };
}

// header/footer kelulusan: daripada metadata kumpulan (bukan rekaan)
function blocksFor(j, meta) {
  const t = j.source_title || j.rpt_topic || j.title || 'RPH';
  return [
    {kind: 'title', text: t},
    {kind: 'subtitle', text: `${meta.label || ''} | ${meta.minutes || num(j.minutes ?? j.duration, 30)} minit | ${meta.version || ''}`.trim()},
    {kind: 'p', text: 'ID: ' + j.id},
    {kind: 'p', text: 'Maklumat pelaksanaan sebenar'},
    {kind: 'p', text: ['Guru: ' + ((meta.teacher && meta.teacher.name) || '—'), 'Kelas: ' + (meta.className || '—'),
      'Tarikh: ' + (j.date || '—'), 'Waktu: ' + (num(j.minutes ?? j.duration, 30) + ' minit')].join(' | ')},
    {kind: 'p', text: 'Versi kandungan diluluskan: ' + (meta.version || '—') + ' | ID: ' + j.id + ' | SHA-256: ' + (j.content_sha256 || '—')}
  ];
}

// ---- jalan ----
fs.mkdirSync(OUT, {recursive: true});
const groups = fs.readdirSync(GEN).filter(d => fs.existsSync(path.join(GEN, d, 'drafts'))).sort();
const summary = [];
let n = 0, failed = 0;
const tally = {tables: 0};
for (const g of groups) {
  const dir = path.join(GEN, g, 'drafts');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
  if (!files.length) continue;
  // metadata kelulusan kumpulan (jika ada)
  let meta = {label: g, version: '', minutes: 0, teacher: null, className: ''};
  for (const cand of ['teacher-approval-r3.json','teacher-approval-r2.json','teacher-approval-r1.json','approval-verification-r2.json','approval-verification-r1.json']) {
    const p = path.join(GEN, g, cand);
    if (!fs.existsSync(p)) continue;
    try { const a = JSON.parse(fs.readFileSync(p, 'utf8')); meta.version = a.version || a.accepted_rpt_manifest_sha256?.slice(0, 12) || ''; meta.teacher = a.teacher || null; meta.minutes = a.minutes_per_session || 0; } catch {}
  }
  const outDir = path.join(OUT, g);
  fs.mkdirSync(outDir, {recursive: true});
  let okG = 0;
  for (const f of files) {
    if (LIMIT && n >= LIMIT) break;
    let j;
    try { j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch { failed++; continue; }
    try {
      c.RphApprovedLibrary.contextBlocks = () => blocksFor(j, meta);
      c.currentReflectionData = () => ({total: null, present: null, achieved: null, active: null, note: '', text: j.reflection || '', language: 'ms'});
      c.getClass = () => ({id: 'c1', name: meta.className || 'Kelas', year: num(j.year, 1)});
      c.getSubject = () => ({id: 's1', name: j.subject || 'Subjek', code: SUBJ[subjectKeyOf(j)] || ''});
      const ctx = ctxFrom(j, meta);
      const blob = await c.buildDocxBlob(c.generatedRphExportContext(ctx));
      const buf = Buffer.from(await blob.arrayBuffer());
      // sahkan ZIP + jadual dengan membaca semula (bukan bergantung kepada stub)
      const zip = await c.JSZip.loadAsync(buf);
      const xml = await zip.file('word/document.xml').async('string');
      const tbl = (xml.match(/<w:tbl>/g) || []).length;
      if (!tbl) throw new Error('tiada jadual');
      fs.writeFileSync(path.join(outDir, j.id + '.docx'), buf);
      okG++; n++;
      tally.tables += tbl;
    } catch (e) { failed++; summary.push({group: g, id: j.id, error: e.message}); }
  }
  summary.push({group: g, drafts: files.length, rendered: okG});
}
console.log(JSON.stringify({out: OUT, rendered: n, failed, avg_tables: n ? Math.round(tally.tables / n) : 0, groups: summary.filter(s => s.drafts !== undefined)}, null, 1));
if (summary.some(s => s.error)) console.log('RALAT:\n' + summary.filter(s => s.error).slice(0, 10).map(s => '  ' + s.group + ' ' + s.id + ': ' + s.error).join('\n'));
