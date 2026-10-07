// Ujian PostgreSQL sebenar, setempat sahaja; semua identiti/kandungan ialah TEST_ONLY.
// Jalankan: node tests/rph-record-versions-db.test.mjs
// Tiada HTTP, Supabase jauh, model, pemasangan pakej atau fail DB di luar skop.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const taskroot = resolve(repo, 'rph-library/generated/bm1-library-safe-pilot-r1');
const migrationPath = resolve(repo, 'supabase/20261005_add_rph_record_versions.sql');
const baselinePath = resolve(repo, 'supabase_schema_v0.3.3_NEW_PROJECT.sql');
const reportPath = resolve(taskroot, 'db-test-report.json');
const requireTool = createRequire(resolve(taskroot, '.tooling/package.json'));
const { PGlite } = requireTool('@electric-sql/pglite');
const { pgcrypto } = requireTool('@electric-sql/pglite/contrib/pgcrypto');
const hash = value => createHash('sha256').update(value).digest('hex');
const clone = value => structuredClone(value);
const canonical = value => {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${canonical(value[k])}`).join(',')}}`;
  }
  return JSON.stringify(value);
};
const uuid = (prefix, n) => `${prefix}0000000-0000-4000-8000-${n.toString(16).padStart(12, '0')}`;
const ID = {
  owner: '11111111-1111-4111-8111-111111111111',
  other: '22222222-2222-4222-8222-222222222222',
  blocked: '33333333-3333-4333-8333-333333333333',
  pending: '44444444-4444-4444-8444-444444444444',
  class1: uuid('1', 1), classOther: uuid('1', 2), classYear2: uuid('1', 3),
  class2027: uuid('1', 4), classSecond: uuid('1', 5),
  subject1: uuid('2', 1), subjectOther: uuid('2', 2), subjectSecond: uuid('2', 3),
  map1: uuid('3', 1), map2: uuid('3', 2), mapDraft: uuid('3', 3), mapOther: uuid('3', 4),
  mapSubject: uuid('3', 5), mapYear2: uuid('3', 6), map2027: uuid('3', 7),
  mapWeek30: uuid('3', 8), mapReview: uuid('3', 9), mapBoundary: uuid('3', 10),
  legacy1: uuid('4', 1), legacyNoMap: uuid('4', 2), legacyOther: uuid('4', 3),
  legacyWrongClass: uuid('4', 4), legacyNullWeek: uuid('4', 5), missing: uuid('8', 999),
};
const report = {
  schema: 'rph-record-versions-db-test-v1',
  started_at: new Date().toISOString(),
  status: 'BERJALAN',
  language: 'ms',
  local_only: true,
  real_postgresql: true,
  fixture_label: 'TEST_ONLY — bukan data/kelulusan guru sebenar',
  paths: { migration: migrationPath, test: fileURLToPath(import.meta.url), report: reportPath },
  migration_executions: 0,
  tests: [], expected_rejections: [],
  limits: [
    'PGlite satu sambungan: burst diproses bersiri; perebutan kunci multiproses PostgreSQL/Supabase belum diuji.',
    'auth.uid/auth.jwt dan Storage ialah shim setempat; RLS, role, transaksi, FK, SHA-256 dan PL/pgSQL ialah PostgreSQL sebenar.',
    'Skema v0.3.3 sebenar dilaksanakan tanpa mengubah teks SQL; fixture berlabel TEST_ONLY sahaja.',
    'Tiada migrasi jauh/production, PostgREST, OAuth/JWT sebenar atau UI pelayar diuji oleh fail ini.',
    'Legacy tidak dimutasi oleh migrasi/RPC; keizinan legacy sedia ada sengaja tidak diubah.',
    'Hash provenance klien bukan tandatangan kelulusan guru; tiada kelulusan sebenar direka.',
    'Pengguna DB istimewa masih boleh mengubah DDL. Trigger bukan jaminan WORM terhadap superuser.',
  ],
};
let db;
let requestCounter = 0;
let baselineSql;
let migrationSql;
let oldState;
let oldRows;
let baseTables;
let v1, v2, foreign, revision2, revision3, legacyClone, restored;
let p1, p2, pRevision2;
let lastSnapshot;
let fatal;

function requestId() { return uuid('9', ++requestCounter); }
function refreshSnapshot(payload) {
  payload.snapshot_text = canonical(payload.snapshot);
  payload.snapshot_sha256 = hash(payload.snapshot_text);
  return payload;
}
function payload(overrides = {}, editSnapshot) {
  const value = {
    teacher_id: ID.owner, class_id: ID.class1, subject_id: ID.subject1,
    lesson_date: '2026-10-05', academic_year: 2026, week_no: 29, session_no: 1,
    lesson_map_id: ID.map1, source_mapping_key: 'TEST_ONLY|bm|y1|2026|w29|s1',
    library_version: 'TEST_ONLY-library-v1',
    library_content_sha256: hash('TEST_ONLY library bytes'),
    approval_manifest_sha256: hash('TEST_ONLY manifest, bukan kelulusan guru'),
    snapshot_schema: 'rph-record-snapshot-v1', request_id: requestId(), ...overrides,
  };
  const context = Object.fromEntries([
    'teacher_id','class_id','subject_id','lesson_date','academic_year','week_no','session_no','lesson_map_id',
  ].map(k => [k, value[k]]));
  value.snapshot = {
    schema: 'rph-record-snapshot-v1',
    context: { ...context, title: 'TEST_ONLY — Bunyi dan perkataan', teacher_name: 'Guru TEST_ONLY',
      class_name: '1 TEST_ONLY', subject_name: 'BM TEST_ONLY', duration_minutes: 60 },
    lesson: { label: 'TEST_ONLY', objective: 'Objektif fixture, bukan pelajaran diluluskan.',
      activities: [{ minute: 10, teacher: 'Guru fixture', pupil: 'Murid fixture', evidence: 'Bukti fixture' }],
      differentiation: { Peneroka: ['Kad fixture'], Pembina: ['Ayat fixture'], Pencabar: ['Cerita fixture'] },
      unicode: 'Bahasa Melayu ✓ — جawi — 文 — 🌱 — e\u0301', full_approved_draft: { fixture_only: true, nested: [null, 0, false] } },
    map: { id: value.lesson_map_id, title: 'TEST_ONLY map snapshot', verification_status: 'verified',
      source_evidence: { TEST_ONLY: 'Petikan snapshot kekal' } },
    pedagogy: { pak21: 'TEST_ONLY pair', bbm: ['Kad TEST_ONLY'],
      pbd: { method: 'Pemerhatian fixture', evidence: 'Kad fixture', criterion: 'Kriteria fixture' } },
    export_lines: ['TEST_ONLY RPH', 'Teks asal ✓', 'Baris baharu\nTab\tPetikan “asal”'],
    preview_html: '<article data-test-only="true"><h1>TEST_ONLY ✓</h1><p>Snapshot asal.</p></article>',
    reflection: { attendance: 20, absent: 1, notes: 'Refleksi TEST_ONLY', next_step: null },
    provenance: { source_mapping_key: value.source_mapping_key, library_version: value.library_version,
      library_content_sha256: value.library_content_sha256, approval_manifest_sha256: value.approval_manifest_sha256,
      approval_status: 'TEST_ONLY_NOT_REAL_TEACHER_APPROVAL', fixture_only: true },
    extension_fields: { retained: ['Semua medan tambahan snapshot dikekalkan', { nested: true }] },
  };
  if (editSnapshot) editSnapshot(value.snapshot);
  return refreshSnapshot(value);
}
function errorData(error) {
  return Object.fromEntries(['name','code','message','detail','constraint','table','where'].filter(k => error[k] !== undefined).map(k => [k, error[k]]));
}
async function test(name, fn) {
  const started = performance.now();
  try {
    const evidence = await fn();
    report.tests.push({ name, status: 'LULUS', duration_ms: Math.round(performance.now() - started), ...(evidence === undefined ? {} : { evidence }) });
    console.log(`LULUS ${report.tests.length}: ${name}`);
  } catch (error) {
    report.tests.push({ name, status: 'GAGAL', duration_ms: Math.round(performance.now() - started), error: errorData(error) });
    console.error(`GAGAL: ${name}: ${error.message}`);
    throw error;
  }
}
async function roleQuery(role, uid, fn) {
  assert(['authenticated', 'anon', 'postgres'].includes(role));
  return db.transaction(async tx => {
    await tx.exec(`set local role ${role}`);
    await tx.query("select set_config('request.jwt.claim.sub', $1, true)", [uid ?? '']);
    await tx.query("select set_config('request.jwt.claims', $1, true)", [JSON.stringify({ sub: uid })]);
    return fn(tx);
  });
}
async function save(value, uid = ID.owner, role = 'authenticated') {
  return roleQuery(role, uid, async tx => (await tx.query(
    'select public.save_rph_record_version($1::jsonb) as receipt', [JSON.stringify(value)]
  )).rows[0].receipt);
}
async function versions() {
  return (await db.query('select to_jsonb(v)::text as row_text from public.rph_record_versions v order by id')).rows.map(r => r.row_text);
}
async function rejectOperation(fn, code, message) {
  const before = await versions();
  let error;
  try { await fn(); } catch (caught) { error = caught; }
  assert(error, 'Operasi mesti ditolak oleh PostgreSQL, bukan diluluskan.');
  assert((Array.isArray(code) ? code : [code]).includes(error.code), `SQLSTATE sebenar ${error.code}: ${error.message}`);
  assert.match(error.message, message);
  const after = await versions();
  assert.deepEqual(after, before, 'Ralat tidak boleh meninggalkan baris/menukar versi.');
  const evidence = { ...errorData(error), rows_before: before.length, rows_after: after.length, versions_unchanged: true };
  report.expected_rejections.push(evidence);
  return evidence;
}
async function rejectPayload(name, make, code, message, uid = ID.owner, role = 'authenticated') {
  await test(name, async () => rejectOperation(() => save(make(), uid, role), code, message));
}
async function collectRows(tables) {
  const rows = {};
  for (const { schemaname, tablename } of tables) {
    assert.match(schemaname + tablename, /^[a-z_]+$/);
    rows[`${schemaname}.${tablename}`] = (await db.query(
      `select to_jsonb(t)::text as row_text from "${schemaname}"."${tablename}" t order by 1`
    )).rows.map(r => r.row_text);
  }
  return rows;
}
async function schemaState(tables) {
  const tableNames = tables.map(t => `${t.schemaname}.${t.tablename}`);
  const result = {};
  result.tables = (await db.query(`select n.nspname as schema, c.relname, c.relkind, c.relrowsecurity,
    c.relforcerowsecurity, c.relacl::text from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where n.nspname || '.' || c.relname = any($1::text[]) order by 1,2`, [tableNames])).rows;
  result.columns = (await db.query(`select n.nspname as schema, c.relname, a.attnum, a.attname,
    format_type(a.atttypid,a.atttypmod) as type, a.attnotnull, a.attidentity,
    pg_get_expr(d.adbin,d.adrelid) as default_value
    from pg_attribute a join pg_class c on c.oid=a.attrelid join pg_namespace n on n.oid=c.relnamespace
    left join pg_attrdef d on d.adrelid=c.oid and d.adnum=a.attnum
    where a.attnum>0 and not a.attisdropped and n.nspname || '.' || c.relname = any($1::text[])
    order by 1,2,3`, [tableNames])).rows;
  result.constraints = (await db.query(`select n.nspname as schema, c.relname, x.conname, x.contype,
    pg_get_constraintdef(x.oid) as definition from pg_constraint x
    join pg_class c on c.oid=x.conrelid join pg_namespace n on n.oid=c.relnamespace
    where n.nspname || '.' || c.relname = any($1::text[]) order by 1,2,3`, [tableNames])).rows;
  result.indexes = (await db.query(`select schemaname,tablename,indexname,indexdef from pg_indexes
    where schemaname || '.' || tablename = any($1::text[]) order by 1,2,3`, [tableNames])).rows;
  result.policies = (await db.query(`select * from pg_policies
    where schemaname || '.' || tablename = any($1::text[]) order by schemaname,tablename,policyname`, [tableNames])).rows;
  result.user_triggers = (await db.query(`select n.nspname as schema, c.relname, t.tgname,
    pg_get_triggerdef(t.oid) as definition from pg_trigger t join pg_class c on c.oid=t.tgrelid
    join pg_namespace n on n.oid=c.relnamespace
    where not t.tgisinternal and n.nspname || '.' || c.relname = any($1::text[]) order by 1,2,3`, [tableNames])).rows;
  return result;
}
function rowAudit(before, after) {
  return Object.fromEntries(Object.keys(before).sort().map(key => [key, {
    count_before: before[key].length, count_after: after[key].length,
    sha256_before: hash(canonical(before[key])), sha256_after: hash(canonical(after[key])),
    exact_row_text_equal: canonical(before[key]) === canonical(after[key]),
  }]));
}

// Shim Supabase sahaja. Skema aplikasi sebenar dibaca terus, tidak disalin/dipendekkan.
const shimSql = `
create role anon nologin nosuperuser nobypassrls;
create role authenticated nologin nosuperuser nobypassrls;
create role supabase_auth_admin nologin nosuperuser nobypassrls;
create schema auth;
create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
create function auth.jwt() returns jsonb language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb
$$;
grant usage on schema auth to anon, authenticated;
create schema storage;
create table storage.buckets (id text primary key, name text, public boolean);
create table storage.objects (id uuid primary key, bucket_id text, name text);
create function storage.foldername(text) returns text[] language sql immutable as $$
  select string_to_array($1, '/')
$$;
create publication supabase_realtime;
`;

async function seed() {
  const users = [[ID.owner,'owner','teacher','allowed'], [ID.other,'foreign-admin','admin','allowed'],
    [ID.blocked,'blocked','teacher','blocked'], [ID.pending,'pending','teacher','pending']];
  for (const [id, label, role, status] of users) {
    const email = `g-test-only-${label}@moe-dl.edu.my`;
    await db.query('insert into public.authorized_users(email,display_name,role,status) values($1,$2,$3,$4)',
      [email, `TEST_ONLY ${label}`, role, status]);
    await db.query('insert into auth.users(id,email,raw_user_meta_data) values($1,$2,$3::jsonb)',
      [id, email, JSON.stringify({ full_name: `TEST_ONLY ${label}` })]);
  }
  for (const [id, teacher, code] of [[ID.subject1,ID.owner,'TEST_BM'],[ID.subjectOther,ID.other,'TEST_BM'],[ID.subjectSecond,ID.owner,'TEST_ALT']]) {
    await db.query('insert into public.subjects(id,teacher_id,code,name) values($1,$2,$3,$4)', [id,teacher,code,`TEST_ONLY ${code}`]);
  }
  for (const [id, teacher, year, academicYear] of [[ID.class1,ID.owner,1,2026],[ID.classOther,ID.other,1,2026],
    [ID.classYear2,ID.owner,2,2026],[ID.class2027,ID.owner,1,2027],[ID.classSecond,ID.owner,1,2026]]) {
    await db.query('insert into public.classes(id,teacher_id,name,year,academic_year) values($1,$2,$3,$4,$5)',
      [id,teacher,`TEST_ONLY ${id}`,year,academicYear]);
  }
  const maps = [
    [ID.map1,ID.owner,ID.subject1,1,2026,29,1,'verified'],
    [ID.map2,ID.owner,ID.subject1,1,2026,29,2,'verified'],
    [ID.mapDraft,ID.owner,ID.subject1,1,2026,29,3,'draft'],
    [ID.mapOther,ID.other,ID.subjectOther,1,2026,29,1,'verified'],
    [ID.mapSubject,ID.owner,ID.subjectSecond,1,2026,29,1,'verified'],
    [ID.mapYear2,ID.owner,ID.subject1,2,2026,29,1,'verified'],
    [ID.map2027,ID.owner,ID.subject1,1,2027,29,1,'verified'],
    [ID.mapWeek30,ID.owner,ID.subject1,1,2026,30,1,'verified'],
    [ID.mapReview,ID.owner,ID.subject1,1,2026,29,4,'needs_review'],
    [ID.mapBoundary,ID.owner,ID.subject1,1,2026,53,10,'verified'],
  ];
  for (const row of maps) {
    await db.query(`insert into public.lesson_maps(id,teacher_id,subject_id,year,academic_year,week_no,session_no,verification_status,title,sp,source_evidence)
      values($1,$2,$3,$4,$5,$6,$7,$8,'TEST_ONLY map','TEST_ONLY SP','{"fixture_only":true,"text":"Bukti asal ✓"}'::jsonb)`, row);
  }
  const legacy = [
    [ID.legacy1,ID.owner,ID.class1,ID.subject1,'2026-10-05',29,ID.map1],
    [ID.legacyNoMap,ID.owner,ID.class1,ID.subject1,'2026-10-06',29,null],
    [ID.legacyOther,ID.other,ID.classOther,ID.subjectOther,'2026-10-05',29,ID.mapOther],
    [ID.legacyWrongClass,ID.owner,ID.classSecond,ID.subject1,'2026-10-05',29,ID.map1],
    [ID.legacyNullWeek,ID.owner,ID.class1,ID.subject1,'2026-10-08',null,ID.map1],
  ];
  for (const [index, row] of legacy.entries()) {
    await db.query(`insert into public.rph_records(id,teacher_id,class_id,subject_id,lesson_date,week_no,lesson_map_id,title,rph_json,drive_file_id,source_match_score,validation_score,created_at,updated_at)
      values($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,97.25,98.50,'2026-01-01T00:00:00Z','2026-01-02T00:00:00Z')`,
      [...row, `TEST_ONLY legacy ${index}`, JSON.stringify({ test_only: true, title: `RPH asal ${index}`,
        full_export: ['Jangan tulis semula ✓', 'Asal \n tidak boleh hilang'], reflection: { text: 'Kekal', value: null },
        preview_html: '<p>LEGACY TEST_ONLY</p>', arbitrary_nested: [1, false, 'جawi'] }), `TEST_ONLY_DRIVE_${index}`]);
    await db.query(`insert into public.rph_activity_history(teacher_id,class_id,subject_id,lesson_date,week_no,lesson_map_id,rph_record_id,activity_no,activity_text,activity_fingerprint,similarity_to_recent,created_at)
      values($1,$2,$3,$4,$5,$6,$7,1,'TEST_ONLY aktiviti asal ✓','TEST_ONLY fingerprint',0.12345,'2026-01-03T00:00:00Z')`,
      [row[1],row[2],row[3],row[4],row[5],row[6],row[0]]);
  }
}

try {
  baselineSql = await readFile(baselinePath, 'utf8');
  migrationSql = await readFile(migrationPath, 'utf8');
  report.sql_sha256 = hash(migrationSql);
  report.baseline_schema_sha256 = hash(baselineSql);
  report.test_sha256 = hash(await readFile(fileURLToPath(import.meta.url)));
  report.node_version = process.version;
  db = new PGlite({ extensions: { pgcrypto } });
  await test('PGlite melaksanakan skema v0.3.3 sebenar dan fixture TEST_ONLY', async () => {
    await db.exec(shimSql);
    const results = await db.exec(baselineSql);
    await seed();
    report.engine = (await db.query('select version() as version, current_user as db_owner')).rows[0];
    report.authenticated_role = (await db.query("select rolname,rolsuper,rolbypassrls from pg_roles where rolname='authenticated'")).rows[0];
    assert.equal(report.authenticated_role.rolsuper, false);
    assert.equal(report.authenticated_role.rolbypassrls, false);
    baseTables = (await db.query("select schemaname,tablename from pg_tables where schemaname in ('public','auth','storage') order by 1,2")).rows;
    oldRows = await collectRows(baseTables);
    oldState = await schemaState(baseTables);
    report.baseline_statement_results = results.length;
    return { actual_schema_executed: true, statement_results: results.length, baseline_table_count: baseTables.length };
  });
  await test('Migrasi tambahan pertama berjaya; tiada tulis/ubah/padam pada jadual lama', async () => {
    const code = migrationSql.replace(/--[^\n]*/g, '');
    assert.doesNotMatch(code, /\bdrop\s+(table|column|trigger|policy|function|index)\b/i);
    assert.doesNotMatch(code, /\b(?:update|delete\s+from|insert\s+into|alter\s+table|truncate)\s+(?:public\.)?(?:rph_records|rph_activity_history|lesson_maps|classes|subjects)\b/i);
    await db.exec(migrationSql);
    report.migration_executions++;
    assert.deepEqual(await versions(), []);
    assert.deepEqual(await collectRows(baseTables), oldRows);
    assert.deepEqual(await schemaState(baseTables), oldState);
    return { legacy_schema_and_rows_unchanged: true };
  });
  await test('SHA-256 UTF-8 asli PostgreSQL sama dengan Node; tiada digest palsu', async () => {
    const text = 'Teks ✓ — جawi — 文 — 🌱 — e\u0301';
    const actual = (await db.query("select encode(pg_catalog.sha256(convert_to($1,'UTF8')),'hex') as hash", [text])).rows[0].hash;
    assert.equal(actual, hash(text));
    return { text, server_sha256: actual, node_sha256: hash(text) };
  });
  await test('RPC SECURITY DEFINER, search_path tetap, SELECT-own sahaja dan hak tulis ditutup', async () => {
    const fn = (await db.query("select prosecdef,proconfig from pg_proc where oid='public.save_rph_record_version(jsonb)'::regprocedure")).rows[0];
    assert.equal(fn.prosecdef, true);
    assert(fn.proconfig.includes('search_path=pg_catalog'));
    const policies = (await db.query("select policyname,roles,cmd,qual,with_check from pg_policies where schemaname='public' and tablename='rph_record_versions'")).rows;
    assert.equal(policies.length, 1);
    assert.equal(policies[0].cmd, 'SELECT');
    assert.match(policies[0].qual, /teacher_id.*auth\.uid/s);
    assert.match(policies[0].qual, /is_access_allowed/);
    const privileges = (await db.query(`select r as role, has_table_privilege(r,'public.rph_record_versions','SELECT') as can_select,
      has_table_privilege(r,'public.rph_record_versions','INSERT') as can_insert,
      has_table_privilege(r,'public.rph_record_versions','UPDATE') as can_update,
      has_table_privilege(r,'public.rph_record_versions','DELETE') as can_delete,
      has_table_privilege(r,'public.rph_record_versions','TRUNCATE') as can_truncate,
      has_function_privilege(r,'public.save_rph_record_version(jsonb)','EXECUTE') as can_rpc
      from unnest(array['anon','authenticated']) as r order by r`)).rows;
    for (const p of privileges) {
      for (const field of ['can_insert','can_update','can_delete','can_truncate']) assert.equal(p[field], false);
      assert.equal(p.can_select, p.role === 'authenticated');
      assert.equal(p.can_rpc, p.role === 'authenticated');
    }
    return { function: fn, policies, privileges };
  });

  await rejectPayload('Tanpa auth.uid ditolak dan transaksi tidak menambah baris', () => payload(), '28000', /RPH_AUTH_REQUIRED/, null);
  await rejectPayload('Role anon tidak boleh memanggil RPC', () => payload(), '42501', /permission denied for function/, null, 'anon');
  await rejectPayload('Akaun blocked tidak boleh memintas gate v0.3.3', () => payload({ teacher_id: ID.blocked }), '42501', /RPH_ACCESS_DENIED/, ID.blocked);
  await rejectPayload('Akaun pending tidak boleh memintas gate v0.3.3', () => payload({ teacher_id: ID.pending }), '42501', /RPH_ACCESS_DENIED/, ID.pending);
  await rejectPayload('Penyamaran teacher_id ditolak', () => payload({ teacher_id: ID.other }), '42501', /RPH_TEACHER_MISMATCH/);
  await rejectPayload('Kelas guru lain ditolak', () => payload({ class_id: ID.classOther }), '42501', /RPH_CLASS_NOT_OWNED/);
  await rejectPayload('Subjek guru lain ditolak', () => payload({ subject_id: ID.subjectOther }), '42501', /RPH_SUBJECT_NOT_OWNED/);
  await rejectPayload('Map guru lain ditolak', () => payload({ lesson_map_id: ID.mapOther }), '42501', /RPH_MAP_NOT_OWNED/);
  await rejectPayload('ID map tidak wujud ditolak', () => payload({ lesson_map_id: ID.missing }), '42501', /RPH_MAP_NOT_OWNED/);
  await rejectPayload('Map draft ditolak', () => payload({ lesson_map_id: ID.mapDraft, session_no: 3 }), '22023', /RPH_MAP_UNVERIFIED/);
  await rejectPayload('Map needs_review ditolak', () => payload({ lesson_map_id: ID.mapReview, session_no: 4 }), '22023', /RPH_MAP_UNVERIFIED/);
  await rejectPayload('Simpan baharu tanpa lesson_map_id ditolak', () => { const p = payload(); delete p.lesson_map_id; return p; }, '22023', /lesson_map_id/);
  for (const [name, fields] of [
    ['sesi', { session_no: 2 }], ['minggu', { week_no: 30 }],
    ['subjek milik sendiri tetapi tidak sepadan', { subject_id: ID.subjectSecond }],
    ['tahun kelas', { class_id: ID.classYear2 }],
    ['tahun map', { lesson_map_id: ID.mapYear2 }],
    ['tahun akademik map', { lesson_map_id: ID.map2027 }],
  ]) await rejectPayload(`Slot salah: ${name}`, () => payload(fields), '22023', /RPH_MAP_SLOT_MISMATCH/);
  await rejectPayload('Tahun akademik kelas tidak sepadan ditolak', () => payload({ academic_year: 2027, lesson_map_id: ID.map2027 }), '22023', /RPH_CLASS_ACADEMIC_YEAR_MISMATCH/);
  for (const [name, fields] of [
    ['minggu sifar', { week_no: 0 }], ['minggu 54', { week_no: 54 }],
    ['sesi sifar', { session_no: 0 }], ['sesi 11', { session_no: 11 }], ['tahun sifar', { academic_year: 0 }],
  ]) await rejectPayload(`Julat ditolak: ${name}`, () => payload(fields), '22023', /RPH_INVALID_SLOT_RANGE/);
  await rejectPayload('Integer bukan nombor bulat ditolak', () => payload({ session_no: 1.5 }), '22023', /integer wajib/);
  await rejectPayload('Integer berbentuk string tidak dinormalisasi senyap', () => payload({ week_no: '29' }), '22023', /integer wajib/);
  await rejectPayload('Tarikh tidak wujud ditolak oleh jenis date PostgreSQL', () => payload({ lesson_date: '2026-02-30' }), '22008', /date\/time field value out of range/);
  await rejectPayload('Format tarikh tidak formal ditolak', () => payload({ lesson_date: '2026-2-3' }), '22023', /RPH_INVALID_DATE/);
  await rejectPayload('UUID tanpa sempang tidak dibaiki senyap', () => payload({ class_id: ID.class1.replaceAll('-', '') }), '22023', /RPH_INVALID_UUID/);
  await rejectPayload('Hash besar huruf/tidak hex64 ditolak', () => { const p = payload(); p.library_content_sha256 = 'A'.repeat(64); return p; }, '22023', /RPH_INVALID_SHA256/);
  await rejectPayload('Medan revision_no tidak boleh disuntik klien', () => ({ ...payload(), revision_no: 999 }), '22023', /medan tidak diterima: revision_no/);
  await rejectPayload('Muatan JSON bukan objek ditolak', () => [], '22023', /RPH_INVALID_PAYLOAD/);
  await rejectPayload('Hash snapshot salah ditolak', () => ({ ...payload(), snapshot_sha256: '0'.repeat(64) }), '22023', /RPH_SNAPSHOT_HASH_MISMATCH/);
  await rejectPayload('snapshot tidak sama dengan snapshot_text ditolak', () => { const p = payload(); p.snapshot.lesson.objective = 'UBAH'; return p; }, '22023', /RPH_SNAPSHOT_TEXT_MISMATCH/);
  await rejectPayload('Teks JSON rosak walaupun digest betul ditolak', () => { const p = payload(); p.snapshot_text = '{broken'; p.snapshot_sha256 = hash(p.snapshot_text); return p; }, '22P02', /invalid input syntax for type json/);
  await rejectPayload('Snapshot schema lain ditolak', () => payload({}, s => { s.schema = 'unknown'; }), '22023', /RPH_INVALID_SNAPSHOT_SCHEMA/);
  await rejectPayload('snapshot_schema null ditolak', () => payload({ snapshot_schema: null }), '22023', /RPH_INVALID_SNAPSHOT_SCHEMA/);
  await rejectPayload('Konteks snapshot tersalah guru ditolak', () => payload({}, s => { s.context.teacher_id = ID.other; }), '22023', /RPH_SNAPSHOT_CONTEXT_MISMATCH/);
  await rejectPayload('Konteks snapshot tersalah sesi ditolak', () => payload({}, s => { s.context.session_no = 2; }), '22023', /RPH_SNAPSHOT_CONTEXT_MISMATCH/);
  await rejectPayload('Provenance snapshot tidak sepadan ditolak', () => payload({}, s => { s.provenance.library_version = 'OTHER'; }), '22023', /RPH_SNAPSHOT_PROVENANCE_MISMATCH/);
  for (const key of ['lesson','map','pedagogy','reflection','provenance','context','preview_html','export_lines']) {
    await rejectPayload(`Snapshot separa tanpa ${key} ditolak`, () => payload({}, s => { delete s[key]; }), '22023', /RPH_INVALID_SNAPSHOT/);
  }
  await rejectPayload('Konteks tanpa nama guru ditolak', () => payload({}, s => { delete s.context.teacher_name; }), '22023', /konteks teks wajib/);
  await rejectPayload('Provenance tanpa approval_status ditolak', () => payload({}, s => { delete s.provenance.approval_status; }), '22023', /RPH_INVALID_SNAPSHOT/);

  await test('Simpan sesi pertama mengembalikan seluruh baris dan dua advisory lock aktif', async () => {
    p1 = payload();
    const result = await roleQuery('authenticated', ID.owner, async tx => {
      const row = (await tx.query('select public.save_rph_record_version($1::jsonb) as receipt', [JSON.stringify(p1)])).rows[0].receipt;
      const locks = (await tx.query("select locktype,mode,granted from pg_locks where locktype='advisory' and pid=pg_backend_pid() order by classid,objid")).rows;
      return { row, locks };
    });
    v1 = result.row;
    assert.equal(v1.revision_no, 1);
    assert.equal(v1.parent_version_id, null);
    assert.equal(v1.legacy_record_id, null);
    assert.equal(v1.snapshot_text, p1.snapshot_text);
    assert.deepEqual(v1.snapshot, p1.snapshot);
    assert.match(v1.request_payload_sha256, /^[0-9a-f]{64}$/);
    assert(result.locks.length >= 2);
    assert(result.locks.every(lock => lock.granted && lock.mode === 'ExclusiveLock'));
    const stored = (await db.query('select to_jsonb(v) as receipt from public.rph_record_versions v where id=$1', [v1.id])).rows[0].receipt;
    assert.deepEqual(v1, stored);
    return { id: v1.id, revision_no: v1.revision_no, full_receipt_fields: Object.keys(v1).sort(), actual_locks: result.locks };
  });
  await test('Sesi 1 dan 2 pada tarikh/kelas/subjek sama wujud bersama', async () => {
    p2 = payload({ session_no: 2, lesson_map_id: ID.map2, source_mapping_key: 'TEST_ONLY|bm|y1|2026|w29|s2' });
    v2 = await save(p2);
    assert.equal(v2.lesson_date, v1.lesson_date);
    assert.equal(v2.revision_no, 1);
    assert.equal(v2.parent_version_id, null);
    const slots = (await db.query('select lesson_date::text,session_no,revision_no from public.rph_record_versions order by session_no')).rows;
    assert.deepEqual(slots.map(r => [r.session_no,r.revision_no]), [[1,1],[2,1]]);
    return { rows: slots };
  });
  await test('request_id sama dibenarkan untuk guru berbeza tanpa bocor resit', async () => {
    foreign = await save(payload({ teacher_id: ID.other, class_id: ID.classOther, subject_id: ID.subjectOther,
      lesson_map_id: ID.mapOther, request_id: p1.request_id }), ID.other);
    assert.notEqual(foreign.id, v1.id);
    assert.equal(foreign.request_id, v1.request_id);
    assert.equal(foreign.teacher_id, ID.other);
    return { owner_id: v1.id, foreign_id: foreign.id, request_id: v1.request_id };
  });
  await test('Retry muatan/request sama memulangkan resit sama tanpa pendua', async () => {
    const before = await versions();
    assert.deepEqual(await save(clone(p1)), v1);
    assert.deepEqual(await versions(), before);
    return { id: v1.id, rows_before: before.length, rows_after: before.length };
  });
  await test('Susunan kunci objek permintaan sahaja tidak memecah idempotensi JSONB', async () => {
    assert.deepEqual(await save(Object.fromEntries(Object.entries(p1).reverse())), v1);
    return { same_id: v1.id };
  });
  await rejectPayload('request_id digunakan semula dengan kandungan berubah ditolak', () => {
    const p = clone(p1); p.snapshot.reflection.notes = 'BERUBAH'; return refreshSnapshot(p);
  }, '23505', /RPH_REQUEST_REUSE/);
  await rejectPayload('request_id digunakan semula pada slot berbeza ditolak', () => ({ ...clone(p2), request_id: p1.request_id }), '23505', /RPH_REQUEST_REUSE/);
  await rejectPayload('request_id sama tetapi bait teks berbeza ditolak walaupun JSON sama', () => {
    const p = clone(p1); p.snapshot_text += '\n'; p.snapshot_sha256 = hash(p.snapshot_text); return p;
  }, '23505', /RPH_REQUEST_REUSE/);
  await rejectPayload('request_id sama tetapi null tambahan tidak diabaikan senyap', () => ({ ...clone(p1), legacy_record_id: null }), '23505', /RPH_REQUEST_REUSE/);

  await test('Kandungan berubah menghasilkan revisi 2; revisi 1 kekal lengkap', async () => {
    pRevision2 = payload({ parent_version_id: v1.id }, s => { s.lesson.objective = 'Objektif TEST_ONLY revisi kedua'; s.reflection.notes = 'Revisi 2'; });
    revision2 = await save(pRevision2);
    assert.equal(revision2.revision_no, 2);
    assert.equal(revision2.parent_version_id, v1.id);
    assert.notEqual(revision2.snapshot_sha256, v1.snapshot_sha256);
    const original = (await db.query('select to_jsonb(v) as receipt from public.rph_record_versions v where id=$1', [v1.id])).rows[0].receipt;
    assert.deepEqual(original, v1);
    return { revision1_id: v1.id, revision2_id: revision2.id, original_snapshot_unchanged: true };
  });
  await rejectPayload('Parent basi dalam slot sama ditolak', () => payload({ parent_version_id: v1.id }), '40001', /RPH_PARENT_NOT_LATEST/);
  await rejectPayload('Parent guru lain ditolak', () => payload({ parent_version_id: foreign.id }), '42501', /RPH_PARENT_NOT_OWNED_OR_SLOT_MISMATCH/);
  await rejectPayload('Parent sesi lain pada tarikh sama ditolak', () => payload({ parent_version_id: v2.id }), '42501', /RPH_PARENT_NOT_OWNED_OR_SLOT_MISMATCH/);
  await rejectPayload('Parent tidak wujud ditolak', () => payload({ parent_version_id: ID.missing }), '42501', /RPH_PARENT_NOT_OWNED_OR_SLOT_MISMATCH/);
  await test('Parent tidak dibekalkan dirantai kepada versi terkini', async () => {
    revision3 = await save(payload({}, s => { s.reflection.notes = 'Revisi 3 tanpa parent klien'; }));
    assert.equal(revision3.revision_no, 3);
    assert.equal(revision3.parent_version_id, revision2.id);
    return { id: revision3.id, parent_version_id: revision3.parent_version_id };
  });
  await test('Retry resit lama selepas revisi baharu tidak ditolak sebagai parent basi', async () => {
    const before = await versions();
    assert.deepEqual(await save(p1), v1);
    assert.deepEqual(await save(pRevision2), revision2);
    assert.deepEqual(await versions(), before);
    return { original_receipt_id: v1.id, revision2_receipt_id: revision2.id };
  });
  await rejectPayload('Rujukan legacy guru lain ditolak', () => payload({ legacy_record_id: ID.legacyOther }), '42501', /RPH_LEGACY_NOT_OWNED/);
  await rejectPayload('Rujukan legacy kelas salah ditolak', () => payload({ legacy_record_id: ID.legacyWrongClass }), '22023', /RPH_LEGACY_SLOT_MISMATCH/);
  await rejectPayload('Rujukan legacy tarikh salah ditolak', () => payload({ legacy_record_id: ID.legacy1, lesson_date: '2026-10-09' }), '22023', /RPH_LEGACY_SLOT_MISMATCH/);
  await rejectPayload('Rujukan legacy minggu salah ditolak', () => payload({ legacy_record_id: ID.legacy1, lesson_map_id: ID.mapWeek30, week_no: 30 }), '22023', /RPH_LEGACY_SLOT_MISMATCH/);
  await rejectPayload('Rujukan legacy map/sesi lain tidak dipalsukan', () => payload({ legacy_record_id: ID.legacy1, session_no: 2, lesson_map_id: ID.map2 }), '22023', /RPH_LEGACY_MAP_MISMATCH/);
  await rejectPayload('Legacy tanpa map tidak diberikan sesi rekaan', () => payload({ legacy_record_id: ID.legacyNoMap, lesson_date: '2026-10-06' }), '22023', /RPH_LEGACY_MAP_REQUIRED/);
  await test('Clone legacy dengan pautan map tepat menyimpan muatan asal tanpa mengubah legacy', async () => {
    const legacy = (await db.query('select to_jsonb(r) as row from public.rph_records r where id=$1', [ID.legacy1])).rows[0].row;
    const p = payload({ legacy_record_id: ID.legacy1 }, s => {
      s.lesson.legacy_rph_json = clone(legacy.rph_json);
      s.provenance.legacy_record_id = legacy.id;
    });
    legacyClone = await save(p);
    assert.equal(legacyClone.parent_version_id, revision3.id);
    assert.equal(legacyClone.legacy_record_id, ID.legacy1);
    assert.deepEqual(legacyClone.snapshot.lesson.legacy_rph_json, legacy.rph_json);
    assert.deepEqual(await collectRows(baseTables), oldRows);
    return { id: legacyClone.id, legacy_record_id: ID.legacy1, full_legacy_json_retained: true };
  });
  await test('Restore versi lama menambah revisi; parent masih versi terkini', async () => {
    const p = clone(p1); p.request_id = requestId();
    p.snapshot.provenance.restore_from_version_id = v1.id;
    restored = await save(refreshSnapshot(p));
    assert.equal(restored.parent_version_id, legacyClone.id);
    assert.deepEqual(restored.snapshot.lesson, v1.snapshot.lesson);
    assert.equal(restored.snapshot.provenance.restore_from_version_id, v1.id);
    return { id: restored.id, revision_no: restored.revision_no, parent_version_id: restored.parent_version_id, restore_from_version_id: v1.id };
  });
  await test('Legacy minggu null hanya boleh dikait apabila map asal tepat', async () => {
    const receipt = await save(payload({ legacy_record_id: ID.legacyNullWeek, lesson_date: '2026-10-08' }));
    assert.equal(receipt.legacy_record_id, ID.legacyNullWeek);
    assert.equal(receipt.lesson_map_id, ID.map1);
    assert.equal(receipt.session_no, 1);
    return { id: receipt.id, original_legacy_week: null, exact_original_map: receipt.lesson_map_id };
  });
  await test('Had sah minggu 53/sesi 10 diterima dengan map verified sepadan', async () => {
    const receipt = await save(payload({ lesson_date: '2026-12-31', week_no: 53, session_no: 10, lesson_map_id: ID.mapBoundary }));
    assert.equal(receipt.week_no, 53); assert.equal(receipt.session_no, 10);
    return { id: receipt.id, week_no: receipt.week_no, session_no: receipt.session_no };
  });
  await test('Provenance pilihan boleh tiada; default schema dan teks bersiri kekal tepat', async () => {
    const p = payload({ lesson_date: '2026-10-07' });
    for (const field of ['library_version','library_content_sha256','approval_manifest_sha256']) {
      delete p[field]; delete p.snapshot.provenance[field];
    }
    delete p.snapshot_schema;
    refreshSnapshot(p);
    const receipt = await save(p);
    assert.equal(receipt.snapshot_schema, 'rph-record-snapshot-v1');
    assert.equal(receipt.library_version, null);
    assert.equal(receipt.library_content_sha256, null);
    assert.equal(receipt.approval_manifest_sha256, null);
    assert.equal(receipt.snapshot_text, p.snapshot_text);
    assert.deepEqual(await save(p), receipt);
    return { id: receipt.id, optional_provenance: null, retry_same_id: true };
  });
  await test('Burst retry dikendalikan bersiri oleh PGlite tanpa pendua', async () => {
    const p = payload({ lesson_date: '2026-10-10' });
    const before = (await versions()).length;
    const receipts = await Promise.all(Array.from({ length: 5 }, () => save(clone(p))));
    assert.equal(new Set(receipts.map(r => r.id)).size, 1);
    assert.equal((await versions()).length, before + 1);
    return { calls: receipts.length, distinct_receipts: 1, serialized_single_connection_only: true };
  });
  await test('RLS menyembunyikan baris guru lain, termasuk daripada admin aplikasi', async () => {
    const ownerRows = await roleQuery('authenticated', ID.owner, async tx => (await tx.query('select id,teacher_id from public.rph_record_versions')).rows);
    const otherRows = await roleQuery('authenticated', ID.other, async tx => {
      assert.equal((await tx.query('select public.is_admin() as admin')).rows[0].admin, true);
      return (await tx.query('select id,teacher_id from public.rph_record_versions')).rows;
    });
    assert(ownerRows.length > 0 && ownerRows.every(r => r.teacher_id === ID.owner));
    assert.deepEqual(otherRows, [{ id: foreign.id, teacher_id: ID.other }]);
    assert.equal((await roleQuery('authenticated', ID.other, async tx => tx.query('select id from public.rph_record_versions where id=$1', [v1.id]))).rows.length, 0);
    const total = (await versions()).length;
    assert.equal(ownerRows.length + otherRows.length, total);
    return { owner_visible: ownerRows.length, foreign_admin_visible: otherRows.length, total, cross_teacher_visible: 0 };
  });
  await test('RLS tanpa UID/pending/blocked tidak memulangkan sejarah', async () => {
    for (const uid of [null, ID.pending, ID.blocked]) {
      const rows = await roleQuery('authenticated', uid, async tx => (await tx.query('select id from public.rph_record_versions')).rows);
      assert.deepEqual(rows, []);
    }
    return { no_uid: 0, pending: 0, blocked: 0 };
  });
  await test('Anon tidak boleh SELECT jadual versi', async () => rejectOperation(
    () => roleQuery('anon', null, tx => tx.query('select * from public.rph_record_versions')), '42501', /permission denied for table/));

  const insertFull = `insert into public.rph_record_versions select (jsonb_populate_record(null::public.rph_record_versions,$1::jsonb)).*`;
  for (const [name, sql, params] of [
    ['INSERT terus', insertFull, [JSON.stringify(v1)]],
    ['UPSERT terus', `${insertFull} on conflict(id) do update set snapshot=excluded.snapshot`, [JSON.stringify(v1)]],
    ['UPDATE terus', 'update public.rph_record_versions set snapshot=snapshot where id=$1', [v1.id]],
    ['DELETE terus', 'delete from public.rph_record_versions where id=$1', [v1.id]],
    ['TRUNCATE terus', 'truncate public.rph_record_versions', []],
  ]) await test(`Authenticated tidak boleh ${name}`, async () => rejectOperation(
    () => roleQuery('authenticated', ID.owner, tx => tx.query(sql, params)), '42501', /permission denied for table/));
  await test('Tanpa polisi INSERT, RLS tetap menolak walaupun grant tersilap dalam transaksi ujian', async () => rejectOperation(
    () => db.transaction(async tx => {
      await tx.exec('grant insert on public.rph_record_versions to authenticated; set local role authenticated');
      await tx.query("select set_config('request.jwt.claim.sub',$1,true)", [ID.owner]);
      const copy = { ...v1, id: uuid('7', 1), revision_no: 999, request_id: requestId() };
      return tx.query(insertFull, [JSON.stringify(copy)]);
    }), '42501', /row-level security policy/));
  for (const [name, sql] of [
    ['UPDATE', 'update public.rph_record_versions set snapshot=snapshot where id=$1'],
    ['DELETE', 'delete from public.rph_record_versions where id=$1'],
  ]) await test(`Trigger immutable juga menolak ${name} oleh pemilik DB`, async () => rejectOperation(
    () => db.query(sql, [v1.id]), '55000', /RPH_VERSIONS_IMMUTABLE/));
  await test('Trigger immutable juga menolak TRUNCATE oleh pemilik DB', async () => rejectOperation(
    () => db.exec('truncate public.rph_record_versions'), '55000', /RPH_VERSIONS_IMMUTABLE/));
  await test('Constraint SQL menolak revisi pendua dalam slot sama', async () => rejectOperation(
    () => db.query(insertFull, [JSON.stringify({ ...v1, id: uuid('7', 2), request_id: requestId() })]),
    '23505', /rph_record_versions_slot_revision_key/));
  await test('Constraint SQL menolak teacher/request pendua', async () => rejectOperation(
    () => db.query(insertFull, [JSON.stringify({ ...v1, id: uuid('7', 3), revision_no: 999 })]),
    '23505', /rph_record_versions_teacher_request_key/));
  await test('Constraint digest pada jadual turut menolak tulis istimewa yang rosak', async () => rejectOperation(
    () => db.query(insertFull, [JSON.stringify({ ...v1, id: uuid('7', 4), revision_no: 999,
      request_id: requestId(), snapshot_sha256: '0'.repeat(64) })]), '23514', /snapshot_digest_equal/));
  await test('Foreign key baharu RESTRICT; tidak memadam versi melalui CASCADE', async () => {
    const constraints = (await db.query("select conname,confdeltype,confupdtype from pg_constraint where conrelid='public.rph_record_versions'::regclass and contype='f' order by conname")).rows;
    assert.equal(constraints.length, 6);
    assert(constraints.every(c => c.confdeltype === 'r' && c.confupdtype === 'r'));
    return { foreign_keys: constraints };
  });
  await test('Rekod legacy dirujuk tidak boleh dipadam melalui FK', async () => rejectOperation(
    // PostgreSQL 18 melapor restrict_violation 23001; versi terdahulu boleh 23503.
    () => db.query('delete from public.rph_records where id=$1', [ID.legacy1]), ['23001','23503'], /foreign key constraint/));
  await test('Kekangan unik legacy teacher/class/subject/date kekal asal', async () => rejectOperation(
    () => db.query(`insert into public.rph_records(teacher_id,class_id,subject_id,lesson_date)
      values($1,$2,$3,'2026-10-05')`, [ID.owner,ID.class1,ID.subject1]), '23505', /duplicate key value violates unique constraint/));
  await test('Kegagalan kedua dalam transaksi menggulung balik simpanan pertama', async () => {
    const before = await versions();
    const good = payload({ lesson_date: '2026-10-11' });
    const bad = payload({ lesson_date: '2026-10-11', lesson_map_id: ID.mapDraft, session_no: 3 });
    const evidence = await rejectOperation(() => roleQuery('authenticated', ID.owner, async tx => {
      await tx.query('select public.save_rph_record_version($1::jsonb)', [JSON.stringify(good)]);
      assert.equal((await tx.query('select count(*)::int as n from public.rph_record_versions where request_id=$1', [good.request_id])).rows[0].n, 1);
      await tx.query('select public.save_rph_record_version($1::jsonb)', [JSON.stringify(bad)]);
    }), '22023', /RPH_MAP_UNVERIFIED/);
    assert.deepEqual(await versions(), before);
    assert.equal((await db.query('select count(*)::int as n from public.rph_record_versions where request_id=$1', [good.request_id])).rows[0].n, 0);
    return { ...evidence, first_insert_visible_inside_transaction: true, first_insert_absent_after_rollback: true };
  });
  await test('Search path penyerang/temp table tidak mengalih sasaran SECURITY DEFINER', async () => {
    const before = await versions();
    const receipt = await roleQuery('authenticated', ID.owner, async tx => {
      await tx.exec('create temp table rph_record_versions (id text); set local search_path = pg_temp, public');
      return (await tx.query('select public.save_rph_record_version($1::jsonb) as receipt', [JSON.stringify(p1)])).rows[0].receipt;
    });
    assert.deepEqual(receipt, v1);
    assert.deepEqual(await versions(), before);
    return { same_saved_id: receipt.id, temp_table_not_used: true };
  });
  await test('Migrasi kedua dengan data tersimpan idempoten; semua resit/legacy kekal', async () => {
    const before = await versions();
    await db.exec(migrationSql);
    report.migration_executions++;
    assert.deepEqual(await versions(), before);
    assert.deepEqual(await collectRows(baseTables), oldRows);
    assert.deepEqual(await schemaState(baseTables), oldState);
    assert.equal((await db.query("select count(*)::int as n from pg_policies where tablename='rph_record_versions' and schemaname='public'")).rows[0].n, 1);
    return { executions: report.migration_executions, versions_before: before.length, versions_after: before.length, schema_and_legacy_equal: true };
  });
  await test('Tutup dan muat semula DB sebenar mengekalkan seluruh snapshot/teks/eksport/refleksi', async () => {
    lastSnapshot = await versions();
    const dump = await db.dumpDataDir('none');
    const dumpBytes = Buffer.from(await dump.arrayBuffer());
    report.reload_dump = { bytes: dumpBytes.length, sha256: hash(dumpBytes), storage: 'Blob dalam memori; tiada fail DB luar skop' };
    await db.close();
    db = new PGlite({ extensions: { pgcrypto }, loadDataDir: dump });
    await db.waitReady;
    assert.deepEqual(await versions(), lastSnapshot);
    assert.deepEqual(await save(p1), v1);
    const reloaded = (await roleQuery('authenticated', ID.owner, tx => tx.query(
      'select snapshot,snapshot_text,snapshot_sha256 from public.rph_record_versions where id=$1', [v1.id]
    ))).rows[0];
    assert.deepEqual(reloaded.snapshot, p1.snapshot);
    assert(Buffer.from(reloaded.snapshot_text, 'utf8').equals(Buffer.from(p1.snapshot_text, 'utf8')));
    assert.equal(hash(reloaded.snapshot_text), reloaded.snapshot_sha256);
    for (const key of ['lesson','map','pedagogy','export_lines','preview_html','reflection','provenance','extension_fields']) {
      assert.deepEqual(reloaded.snapshot[key], p1.snapshot[key]);
    }
    return { full_row_texts_unchanged: true, full_snapshot_retained: true, utf8_bytes_equal: true, snapshot_sha256: reloaded.snapshot_sha256 };
  });
  await test('RLS dan immutable kekal selepas muat semula DB', async () => {
    const foreignRead = (await roleQuery('authenticated', ID.other, tx => tx.query('select id from public.rph_record_versions where id=$1', [v1.id]))).rows;
    assert.deepEqual(foreignRead, []);
    return rejectOperation(() => db.query('update public.rph_record_versions set snapshot=snapshot where id=$1', [v1.id]), '55000', /RPH_VERSIONS_IMMUTABLE/);
  });
  await test('Semua nilai baris/skema legacy dan fail skema asal kekal tepat', async () => {
    const afterRows = await collectRows(baseTables);
    const afterState = await schemaState(baseTables);
    assert.deepEqual(afterRows, oldRows);
    assert.deepEqual(afterState, oldState);
    assert.equal(await readFile(baselinePath, 'utf8'), baselineSql);
    report.legacy_audit = rowAudit(oldRows, afterRows);
    report.legacy_schema = {
      sha256_before: hash(canonical(oldState)), sha256_after: hash(canonical(afterState)), equal: true,
      coverage: ['columns','types','defaults','nullability','constraints','indexes','RLS policies','table ACL','non-internal triggers'],
      note: 'FK jadual baharu menambah trigger RI dalaman pada parent; skema/trigger pengguna lama tidak diubah.',
    };
    report.legacy_rows = Object.fromEntries(['public.rph_records','public.rph_activity_history'].map(key => [key, {
      before: oldRows[key], after: afterRows[key], exact_equal: true,
    }]));
    return { tables_audited: baseTables.length, exact_row_text_equal: true, legacy_schema_equal: true, source_sql_bytes_equal: true };
  });
  const columns = (await db.query(`select column_name,data_type,is_nullable,column_default
    from information_schema.columns where table_schema='public' and table_name='rph_record_versions' order by ordinal_position`)).rows;
  report.interface = {
    rpc: 'public.save_rph_record_version(p_payload jsonb) returns jsonb',
    required: ['teacher_id','class_id','subject_id','lesson_date','academic_year','week_no','session_no','lesson_map_id',
      'source_mapping_key','snapshot','snapshot_text','snapshot_sha256','request_id'],
    optional: ['snapshot_schema','library_version','library_content_sha256','approval_manifest_sha256','parent_version_id','legacy_record_id'],
    receipt: 'Seluruh baris. Medan tambahan request_payload_sha256 dijana pelayan; jangan hantar medan resit sebagai payload.',
    columns,
    snapshot_schema: 'rph-record-snapshot-v1',
    hash_contract: 'SHA-256 heks kecil 64 aksara bagi bait UTF-8 snapshot_text tepat; snapshot_text::jsonb mesti sama dengan snapshot.',
    idempotency: 'Gunakan payload dan request_id asal pada retry. Key order JSONB sahaja boleh berubah; medan tambahan/tiada/null dikira perubahan.',
    parent: 'Parent pilihan mesti versi terkini slot tepat; tiada/null dirantai pelayan. Restore source disimpan dalam snapshot.',
    legacy: 'Rujukan memerlukan pemilik/kelas/subjek/tarikh sama dan map asal tepat yang masih verified; tiada tekaan sesi.',
    reads: 'SELECT-own public.rph_record_versions; UI boleh gabung dengan bacaan legacy sendiri. Tiada view baharu.',
  };
  report.final_rows = (await db.query(`select id,teacher_id,class_id,subject_id,lesson_date::text,academic_year,week_no,session_no,
    revision_no,parent_version_id,legacy_record_id,request_id,snapshot_sha256,created_at::text
    from public.rph_record_versions order by teacher_id,lesson_date,week_no,session_no,revision_no`)).rows;
  report.final_count = report.final_rows.length;
  assert.equal(report.final_count, (await db.query('select count(*)::int as n from public.rph_record_versions')).rows[0].n);
  report.status = 'LULUS';
} catch (error) {
  fatal = error;
  report.status = 'GAGAL';
  report.fatal_error = errorData(error);
  process.exitCode = 1;
} finally {
  if (db) {
    try { await db.close(); } catch (error) { report.close_error = errorData(error); report.status = 'GAGAL'; process.exitCode = 1; }
  }
  report.finished_at = new Date().toISOString();
  report.totals = {
    executed: report.tests.length,
    passed: report.tests.filter(t => t.status === 'LULUS').length,
    failed: report.tests.filter(t => t.status === 'GAGAL').length,
    expected_sql_rejections: report.expected_rejections.length,
  };
  try {
    const prior = JSON.parse(await readFile(reportPath, 'utf8'));
    if (prior.schema === report.schema) {
      report.previous_runs = [...(prior.previous_runs ?? []), {
        started_at: prior.started_at, finished_at: prior.finished_at, status: prior.status,
        sql_sha256: prior.sql_sha256, test_sha256: prior.test_sha256, totals: prior.totals,
        fatal_error: prior.fatal_error ?? null,
      }];
    }
  } catch (error) {
    if (error.code !== 'ENOENT') report.previous_report_read_error = errorData(error);
  }
  await writeFile(reportPath, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ status: report.status, ...report.totals, migration_executions: report.migration_executions,
    final_count: report.final_count, sql_sha256: report.sql_sha256, report: reportPath }));
  if (fatal) console.error(JSON.stringify(errorData(fatal)));
}
