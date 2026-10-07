-- Sejarah RPH append-only; jalankan selepas supabase_schema_v0.3.3_NEW_PROJECT.sql.
-- PostgreSQL 15+ / Supabase. Tiada migrasi balik, salin pukal, UPDATE, DROP atau
-- upsert pada rph_records, lesson_maps, rph_activity_history atau jadual lama.
-- RPC sahaja menulis jadual baharu; UI menggabungkan bacaan legacy dan versi.
--
-- Kontrak save_rph_record_version(p_payload jsonb):
--   Wajib: teacher_id, class_id, subject_id, lesson_date (YYYY-MM-DD),
--   academic_year, week_no, session_no, lesson_map_id, source_mapping_key,
--   snapshot (objek), snapshot_text (JSON bersiri kanonik klien),
--   snapshot_sha256 (heks huruf kecil 64 aksara), request_id.
--   Pilihan: snapshot_schema (lalai rph-record-snapshot-v1), library_version,
--   library_content_sha256, approval_manifest_sha256, parent_version_id,
--   legacy_record_id. UUID menggunakan bentuk bersempang huruf kecil.
--   id, revision_no, parent lalai, created_at dan request_payload_sha256 dijana
--   pelayan. Pulangan JSONB ialah SELURUH baris, termasuk snapshot_text asal.
--   request_payload_sha256 ialah cap jari JSONB permintaan asal (bukan hash
--   snapshot): kekunci tersusun semula diterima, tetapi medan tambah/buang,
--   null berbanding medan tiada, atau teks snapshot berubah ditolak pada retry.
--
-- parent_version_id jika dibekalkan mesti versi terkini dalam slot tepat.
-- Jika tiada/null, pelayan merantaikan versi terkini secara automatik. Untuk
-- restore, letakkan rujukan versi sumber di DALAM snapshot, bukan parent lama.
-- legacy_record_id hanya boleh mengait rekod milik sendiri pada tarikh/kelas/
-- subjek sama dan lesson_map_id asal yang tepat. Legacy tanpa map kekal boleh
-- dibaca tetapi tidak ditukar kepada sesi rekaan. SEMUA simpanan baharu,
-- termasuk restore/clone, memerlukan map verified. Tiada fallback legacy-write.
--
-- Snapshot ialah muatan lengkap dan tidak dijana semula daripada library hidup.
-- SHA-256 mengikat bait UTF-8 snapshot_text tepat; pelayan tidak menserialkan
-- semula teks itu. Hash library/manifest ialah provenance klien, BUKAN tandatangan
-- atau pengesahan kelulusan guru oleh pangkalan data. Gate kelulusan aplikasi
-- v0.3.3 (is_access_allowed) dan pemilikan tetap diwajibkan.
-- FK RESTRICT menghalang pemadaman parent memadam sejarah melalui CASCADE.
-- Pemilik DB/superuser masih boleh mengubah DDL; ini bukan stor WORM terhadap DBA.

begin;

create table if not exists public.rph_record_versions (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on update restrict on delete restrict,
  class_id uuid not null references public.classes(id) on update restrict on delete restrict,
  subject_id uuid not null references public.subjects(id) on update restrict on delete restrict,
  lesson_date date not null,
  academic_year integer not null check (academic_year between 1 and 9999),
  week_no integer not null check (week_no between 1 and 53),
  session_no integer not null check (session_no between 1 and 10),
  revision_no integer not null check (revision_no >= 1),
  lesson_map_id uuid not null references public.lesson_maps(id) on update restrict on delete restrict,
  source_mapping_key text not null check (pg_catalog.btrim(source_mapping_key) <> ''),
  library_version text check (library_version is null or pg_catalog.btrim(library_version) <> ''),
  library_content_sha256 text check (library_content_sha256 ~ '^[0-9a-f]{64}$'),
  approval_manifest_sha256 text check (approval_manifest_sha256 ~ '^[0-9a-f]{64}$'),
  snapshot_schema text not null default 'rph-record-snapshot-v1'
    check (snapshot_schema = 'rph-record-snapshot-v1'),
  snapshot jsonb not null,
  snapshot_text text not null,
  snapshot_sha256 text not null check (snapshot_sha256 ~ '^[0-9a-f]{64}$'),
  request_id uuid not null,
  request_payload_sha256 text not null check (request_payload_sha256 ~ '^[0-9a-f]{64}$'),
  parent_version_id uuid references public.rph_record_versions(id) on update restrict on delete restrict,
  legacy_record_id uuid references public.rph_records(id) on update restrict on delete restrict,
  created_at timestamptz not null default pg_catalog.statement_timestamp(),
  constraint rph_record_versions_slot_revision_key unique
    (teacher_id, class_id, subject_id, lesson_date, academic_year, week_no, session_no, revision_no),
  constraint rph_record_versions_teacher_request_key unique (teacher_id, request_id),
  constraint rph_record_versions_not_self_parent check (parent_version_id is distinct from id),
  constraint rph_record_versions_snapshot_text_equal check (snapshot_text::jsonb = snapshot),
  constraint rph_record_versions_snapshot_digest_equal check (
    snapshot_sha256 = pg_catalog.encode(
      pg_catalog.sha256(pg_catalog.convert_to(snapshot_text, 'UTF8')), 'hex')
  ),
  constraint rph_record_versions_snapshot_shape check ((
    pg_catalog.jsonb_typeof(snapshot) = 'object'
    and snapshot->>'schema' = snapshot_schema
    and pg_catalog.jsonb_typeof(snapshot->'context') = 'object'
    and pg_catalog.jsonb_typeof(snapshot->'lesson') = 'object'
    and pg_catalog.jsonb_typeof(snapshot->'map') = 'object'
    and pg_catalog.jsonb_typeof(snapshot->'pedagogy') = 'object'
    and pg_catalog.jsonb_typeof(snapshot->'export_lines') = 'array'
    and pg_catalog.jsonb_typeof(snapshot->'preview_html') = 'string'
    and pg_catalog.jsonb_typeof(snapshot->'reflection') = 'object'
    and pg_catalog.jsonb_typeof(snapshot->'provenance') = 'object'
    and pg_catalog.jsonb_typeof(snapshot#>'{context,title}') = 'string'
    and pg_catalog.jsonb_typeof(snapshot#>'{context,teacher_name}') = 'string'
    and pg_catalog.jsonb_typeof(snapshot#>'{context,class_name}') = 'string'
    and pg_catalog.jsonb_typeof(snapshot#>'{context,subject_name}') = 'string'
    and pg_catalog.jsonb_typeof(snapshot#>'{provenance,approval_status}') = 'string'
  ) is true),
  constraint rph_record_versions_snapshot_context check ((
    snapshot->'context' @> pg_catalog.jsonb_build_object(
      'teacher_id', teacher_id, 'class_id', class_id, 'subject_id', subject_id,
      'lesson_date', lesson_date, 'academic_year', academic_year,
      'week_no', week_no, 'session_no', session_no, 'lesson_map_id', lesson_map_id
    )
  ) is true),
  constraint rph_record_versions_snapshot_provenance check (
    (snapshot#>>'{provenance,source_mapping_key}') is not distinct from source_mapping_key
    and (snapshot#>>'{provenance,library_version}') is not distinct from library_version
    and (snapshot#>>'{provenance,library_content_sha256}') is not distinct from library_content_sha256
    and (snapshot#>>'{provenance,approval_manifest_sha256}') is not distinct from approval_manifest_sha256
  )
);

create index if not exists rph_record_versions_teacher_history_idx
  on public.rph_record_versions (teacher_id, lesson_date desc, created_at desc, id);

create or replace function public.rph_record_versions_reject_mutation()
returns trigger
language plpgsql
set search_path = pg_catalog
as $function$
begin
  raise exception using errcode = '55000',
    message = 'RPH_VERSIONS_IMMUTABLE: tambah revisi baharu; sejarah tidak boleh ditulis semula atau dipadam';
end;
$function$;

create or replace trigger rph_record_versions_immutable
  before update or delete on public.rph_record_versions
  for each row execute function public.rph_record_versions_reject_mutation();
create or replace trigger rph_record_versions_no_truncate
  before truncate on public.rph_record_versions
  for each statement execute function public.rph_record_versions_reject_mutation();

alter table public.rph_record_versions enable row level security;
do $policy$
begin
  if not exists (
    select 1 from pg_catalog.pg_policy
    where polrelid = 'public.rph_record_versions'::pg_catalog.regclass
      and polname = 'rph_record_versions_select_own'
  ) then
    create policy rph_record_versions_select_own on public.rph_record_versions
      for select to authenticated
      using (teacher_id = (select auth.uid()) and (select public.is_access_allowed()));
  end if;
end;
$policy$;
alter policy rph_record_versions_select_own on public.rph_record_versions
  to authenticated
  using (teacher_id = (select auth.uid()) and (select public.is_access_allowed()));

create or replace function public.save_rph_record_version(p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
set datestyle = 'ISO, YMD'
as $function$
declare
  v_uid uuid := auth.uid();
  v_key text;
  v_request_hash text;
  v_context jsonb;
  v_new public.rph_record_versions%rowtype;
  v_existing public.rph_record_versions%rowtype;
  v_latest public.rph_record_versions%rowtype;
  v_class public.classes%rowtype;
  v_subject public.subjects%rowtype;
  v_map public.lesson_maps%rowtype;
  v_legacy public.rph_records%rowtype;
begin
  if v_uid is null then
    raise exception using errcode = '28000', message = 'RPH_AUTH_REQUIRED';
  end if;
  if public.is_access_allowed() is not true then
    raise exception using errcode = '42501', message = 'RPH_ACCESS_DENIED';
  end if;
  if pg_catalog.jsonb_typeof(p_payload) is distinct from 'object' then
    raise exception using errcode = '22023', message = 'RPH_INVALID_PAYLOAD: objek JSON diperlukan';
  end if;

  for v_key in select pg_catalog.jsonb_object_keys(p_payload) loop
    if v_key <> all (array[
      'teacher_id','class_id','subject_id','lesson_date','academic_year','week_no','session_no',
      'lesson_map_id','source_mapping_key','library_version','library_content_sha256',
      'approval_manifest_sha256','snapshot_schema','snapshot','snapshot_text','snapshot_sha256',
      'request_id','parent_version_id','legacy_record_id'
    ]) then
      raise exception using errcode = '22023', message = 'RPH_INVALID_PAYLOAD: medan tidak diterima: ' || v_key;
    end if;
  end loop;

  foreach v_key in array array[
    'teacher_id','class_id','subject_id','lesson_date','lesson_map_id',
    'source_mapping_key','snapshot_text','snapshot_sha256','request_id'
  ] loop
    if pg_catalog.jsonb_typeof(p_payload->v_key) is distinct from 'string'
      or pg_catalog.btrim(p_payload->>v_key) = '' then
      raise exception using errcode = '22023', message = 'RPH_INVALID_PAYLOAD: teks wajib: ' || v_key;
    end if;
  end loop;
  foreach v_key in array array[
    'library_version','library_content_sha256','approval_manifest_sha256',
    'snapshot_schema','parent_version_id','legacy_record_id'
  ] loop
    if p_payload ? v_key and p_payload->v_key <> 'null'::jsonb then
      if pg_catalog.jsonb_typeof(p_payload->v_key) is distinct from 'string'
        or pg_catalog.btrim(p_payload->>v_key) = '' then
        raise exception using errcode = '22023', message = 'RPH_INVALID_PAYLOAD: teks pilihan: ' || v_key;
      end if;
    end if;
  end loop;
  foreach v_key in array array[
    'teacher_id','class_id','subject_id','lesson_map_id','request_id','parent_version_id','legacy_record_id'
  ] loop
    if p_payload->>v_key is not null and (p_payload->>v_key) !~
      '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
      raise exception using errcode = '22023', message = 'RPH_INVALID_UUID: ' || v_key;
    end if;
  end loop;
  foreach v_key in array array['academic_year','week_no','session_no'] loop
    if pg_catalog.jsonb_typeof(p_payload->v_key) is distinct from 'number'
      or (p_payload->>v_key) !~ '^[0-9]+$' then
      raise exception using errcode = '22023', message = 'RPH_INVALID_PAYLOAD: integer wajib: ' || v_key;
    end if;
  end loop;
  foreach v_key in array array['snapshot_sha256','library_content_sha256','approval_manifest_sha256'] loop
    if p_payload->>v_key is not null and (p_payload->>v_key) !~ '^[0-9a-f]{64}$' then
      raise exception using errcode = '22023', message = 'RPH_INVALID_SHA256: ' || v_key;
    end if;
  end loop;
  if (p_payload->>'lesson_date') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then
    raise exception using errcode = '22023', message = 'RPH_INVALID_DATE: YYYY-MM-DD diperlukan';
  end if;

  v_new.teacher_id := (p_payload->>'teacher_id')::uuid;
  if v_new.teacher_id <> v_uid then
    raise exception using errcode = '42501', message = 'RPH_TEACHER_MISMATCH';
  end if;
  v_new.class_id := (p_payload->>'class_id')::uuid;
  v_new.subject_id := (p_payload->>'subject_id')::uuid;
  v_new.lesson_date := (p_payload->>'lesson_date')::date;
  v_new.academic_year := (p_payload->>'academic_year')::integer;
  v_new.week_no := (p_payload->>'week_no')::integer;
  v_new.session_no := (p_payload->>'session_no')::integer;
  if v_new.academic_year not between 1 and 9999
    or v_new.week_no not between 1 and 53 or v_new.session_no not between 1 and 10 then
    raise exception using errcode = '22023', message = 'RPH_INVALID_SLOT_RANGE';
  end if;
  v_new.lesson_map_id := (p_payload->>'lesson_map_id')::uuid;
  v_new.source_mapping_key := p_payload->>'source_mapping_key';
  v_new.library_version := p_payload->>'library_version';
  v_new.library_content_sha256 := p_payload->>'library_content_sha256';
  v_new.approval_manifest_sha256 := p_payload->>'approval_manifest_sha256';
  v_new.snapshot_schema := coalesce(p_payload->>'snapshot_schema', 'rph-record-snapshot-v1');
  if (p_payload ? 'snapshot_schema' and p_payload->'snapshot_schema' = 'null'::jsonb)
    or v_new.snapshot_schema <> 'rph-record-snapshot-v1' then
    raise exception using errcode = '22023', message = 'RPH_INVALID_SNAPSHOT_SCHEMA';
  end if;
  v_new.snapshot := p_payload->'snapshot';
  v_new.snapshot_text := p_payload->>'snapshot_text';
  v_new.snapshot_sha256 := p_payload->>'snapshot_sha256';
  v_new.request_id := (p_payload->>'request_id')::uuid;
  v_new.parent_version_id := (p_payload->>'parent_version_id')::uuid;
  v_new.legacy_record_id := (p_payload->>'legacy_record_id')::uuid;

  if v_new.snapshot_sha256 <> pg_catalog.encode(
    pg_catalog.sha256(pg_catalog.convert_to(v_new.snapshot_text, 'UTF8')), 'hex') then
    raise exception using errcode = '22023', message = 'RPH_SNAPSHOT_HASH_MISMATCH';
  end if;
  if v_new.snapshot_text::jsonb is distinct from v_new.snapshot then
    raise exception using errcode = '22023', message = 'RPH_SNAPSHOT_TEXT_MISMATCH';
  end if;
  if pg_catalog.jsonb_typeof(v_new.snapshot) is distinct from 'object'
    or v_new.snapshot->>'schema' is distinct from v_new.snapshot_schema then
    raise exception using errcode = '22023', message = 'RPH_INVALID_SNAPSHOT_SCHEMA';
  end if;
  foreach v_key in array array['context','lesson','map','pedagogy','reflection','provenance'] loop
    if pg_catalog.jsonb_typeof(v_new.snapshot->v_key) is distinct from 'object' then
      raise exception using errcode = '22023', message = 'RPH_INVALID_SNAPSHOT: objek wajib: ' || v_key;
    end if;
  end loop;
  if pg_catalog.jsonb_typeof(v_new.snapshot->'export_lines') is distinct from 'array'
    or pg_catalog.jsonb_typeof(v_new.snapshot->'preview_html') is distinct from 'string'
    or pg_catalog.jsonb_typeof(v_new.snapshot#>'{provenance,approval_status}') is distinct from 'string' then
    raise exception using errcode = '22023', message = 'RPH_INVALID_SNAPSHOT: eksport/pratonton/provenance tidak lengkap';
  end if;
  foreach v_key in array array['title','teacher_name','class_name','subject_name'] loop
    if pg_catalog.jsonb_typeof(v_new.snapshot->'context'->v_key) is distinct from 'string' then
      raise exception using errcode = '22023', message = 'RPH_INVALID_SNAPSHOT: konteks teks wajib: ' || v_key;
    end if;
  end loop;
  v_context := pg_catalog.jsonb_build_object(
    'teacher_id', v_new.teacher_id, 'class_id', v_new.class_id, 'subject_id', v_new.subject_id,
    'lesson_date', v_new.lesson_date, 'academic_year', v_new.academic_year,
    'week_no', v_new.week_no, 'session_no', v_new.session_no, 'lesson_map_id', v_new.lesson_map_id
  );
  if (v_new.snapshot->'context' @> v_context) is not true then
    raise exception using errcode = '22023', message = 'RPH_SNAPSHOT_CONTEXT_MISMATCH';
  end if;
  foreach v_key in array array[
    'source_mapping_key','library_version','library_content_sha256','approval_manifest_sha256'
  ] loop
    if (v_new.snapshot->'provenance'->>v_key) is distinct from (p_payload->>v_key) then
      raise exception using errcode = '22023', message = 'RPH_SNAPSHOT_PROVENANCE_MISMATCH: ' || v_key;
    end if;
  end loop;

  -- Kunci request dahulu: request sama yang cuba slot lain tidak boleh berlumba.
  v_request_hash := pg_catalog.encode(
    pg_catalog.sha256(pg_catalog.convert_to(p_payload::text, 'UTF8')), 'hex');
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(
    'rph-record-version/request/' || v_uid::text || '/' || v_new.request_id::text, 0));
  select * into v_existing from public.rph_record_versions
    where teacher_id = v_uid and request_id = v_new.request_id;
  if found then
    if v_existing.request_payload_sha256 <> v_request_hash then
      raise exception using errcode = '23505', message = 'RPH_REQUEST_REUSE: request_id sudah digunakan untuk muatan lain';
    end if;
    -- Retry sejarah tidak bergantung pada perubahan map/library selepas simpan.
    return pg_catalog.to_jsonb(v_existing);
  end if;

  -- FOR SHARE juga mengunci medan pemilikan/status, bukan hanya kekunci FK.
  select * into v_class from public.classes
    where id = v_new.class_id and teacher_id = v_uid for share;
  if not found then
    raise exception using errcode = '42501', message = 'RPH_CLASS_NOT_OWNED';
  end if;
  select * into v_subject from public.subjects
    where id = v_new.subject_id and teacher_id = v_uid for share;
  if not found then
    raise exception using errcode = '42501', message = 'RPH_SUBJECT_NOT_OWNED';
  end if;
  if v_class.academic_year <> v_new.academic_year then
    raise exception using errcode = '22023', message = 'RPH_CLASS_ACADEMIC_YEAR_MISMATCH';
  end if;
  select * into v_map from public.lesson_maps
    where id = v_new.lesson_map_id and teacher_id = v_uid for share;
  if not found then
    raise exception using errcode = '42501', message = 'RPH_MAP_NOT_OWNED';
  end if;
  if v_map.verification_status <> 'verified' then
    raise exception using errcode = '22023', message = 'RPH_MAP_UNVERIFIED';
  end if;
  if v_map.subject_id <> v_new.subject_id or v_map.year <> v_class.year
    or v_map.academic_year <> v_class.academic_year
    or v_map.academic_year <> v_new.academic_year
    or v_map.week_no <> v_new.week_no or v_map.session_no <> v_new.session_no then
    raise exception using errcode = '22023', message = 'RPH_MAP_SLOT_MISMATCH';
  end if;

  if v_new.legacy_record_id is not null then
    select * into v_legacy from public.rph_records
      where id = v_new.legacy_record_id and teacher_id = v_uid for share;
    if not found then
      raise exception using errcode = '42501', message = 'RPH_LEGACY_NOT_OWNED';
    end if;
    if v_legacy.class_id <> v_new.class_id or v_legacy.subject_id <> v_new.subject_id
      or v_legacy.lesson_date <> v_new.lesson_date
      or (v_legacy.week_no is not null and v_legacy.week_no <> v_new.week_no) then
      raise exception using errcode = '22023', message = 'RPH_LEGACY_SLOT_MISMATCH';
    end if;
    if v_legacy.lesson_map_id is null then
      raise exception using errcode = '22023', message = 'RPH_LEGACY_MAP_REQUIRED: sesi legacy tidak boleh diteka';
    end if;
    if v_legacy.lesson_map_id <> v_new.lesson_map_id then
      raise exception using errcode = '22023', message = 'RPH_LEGACY_MAP_MISMATCH';
    end if;
  end if;

  -- Slot penuh merangkumi sesi: dua sesi pada tarikh yang sama tidak bertindih.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(
    'rph-record-version/slot/' || v_uid::text || '/' || v_new.class_id::text || '/'
    || v_new.subject_id::text || '/' || v_new.lesson_date::text || '/'
    || v_new.academic_year::text || '/' || v_new.week_no::text || '/' || v_new.session_no::text, 0));
  select * into v_latest from public.rph_record_versions
    where teacher_id = v_uid and class_id = v_new.class_id and subject_id = v_new.subject_id
      and lesson_date = v_new.lesson_date and academic_year = v_new.academic_year
      and week_no = v_new.week_no and session_no = v_new.session_no
    order by revision_no desc limit 1;
  if v_new.parent_version_id is not null then
    if not exists (
      select 1 from public.rph_record_versions p
      where p.id = v_new.parent_version_id and p.teacher_id = v_uid
        and p.class_id = v_new.class_id and p.subject_id = v_new.subject_id
        and p.lesson_date = v_new.lesson_date and p.academic_year = v_new.academic_year
        and p.week_no = v_new.week_no and p.session_no = v_new.session_no
    ) then
      raise exception using errcode = '42501', message = 'RPH_PARENT_NOT_OWNED_OR_SLOT_MISMATCH';
    end if;
    if v_new.parent_version_id is distinct from v_latest.id then
      raise exception using errcode = '40001', message = 'RPH_PARENT_NOT_LATEST: muat semula sejarah dahulu';
    end if;
  end if;

  v_new.id := pg_catalog.gen_random_uuid();
  v_new.revision_no := coalesce(v_latest.revision_no, 0) + 1;
  v_new.parent_version_id := v_latest.id;
  v_new.request_payload_sha256 := v_request_hash;
  v_new.created_at := pg_catalog.statement_timestamp();
  insert into public.rph_record_versions values (v_new.*) returning * into v_new;
  return pg_catalog.to_jsonb(v_new);
end;
$function$;

-- PUBLIC/Supabase default privileges tidak boleh membuka laluan tulis terus.
revoke all on table public.rph_record_versions from public, anon, authenticated;
grant select on table public.rph_record_versions to authenticated;
revoke all on function public.rph_record_versions_reject_mutation() from public, anon, authenticated;
revoke all on function public.save_rph_record_version(jsonb) from public, anon, authenticated;
grant execute on function public.save_rph_record_version(jsonb) to authenticated;

comment on table public.rph_record_versions is
  'Sejarah append-only. Baca snapshot asal; jangan jana semula daripada library semasa. Legacy kekal berasingan.';
comment on column public.rph_record_versions.request_payload_sha256 is
  'SHA-256 pelayan bagi JSONB permintaan asal; mengekalkan idempotensi walaupun parent lalai dijana pelayan.';
comment on column public.rph_record_versions.snapshot_text is
  'JSON bersiri klien dikekalkan bait demi bait; hash UTF-8 asli PostgreSQL dan kesamaan JSONB disemak.';

commit;
