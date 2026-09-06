# Aider RPH Hub Context

## Repository
- Production branch: `main`
- Main app loader: `app-v03334.js`
- Canonical app: `app-v03334-original.js`
- RPH hotfixes include:
  - `rph-interactive-enrichment-hotfix.js`
  - `rph-inline-differentiation-hotfix.js`
  - `rph-export-parity-hotfix.js`

## RPH Library in Supabase
The runtime RPH libraries are stored in Supabase, not as normal source files in this repository:
- `public.rph_activity_library`
- `public.rph_induction_library`
- `public.rph_subject_pedagogy`

A local complete snapshot can be created with:

```bash
./scripts/sync-rph-library.sh
```

The snapshot is stored under `rph-library/` and is intentionally ignored by git so production/library data and secrets are not committed.

## How Aider should inspect the library
Do **not** add the entire multi-megabyte CSV dataset to the chat context unless absolutely necessary. Search only the relevant records:

```bash
./scripts/rphlib-search.sh "Kotak Beracun"
./scripts/rphlib-search.sh "science_y3"
./scripts/rphlib-search.sh "subject_key"
```

Then inspect only the matching lines or a small relevant CSV range.

## Source-first RPH rules
1. RPT determines week/session/topic/SK-SP routing.
2. DSKP verifies curriculum standards.
3. Textbook / activity book provides the real task and page evidence.
4. Lesson Map must follow the teacher's actual timetable sessions.
5. Activity Library changes the teaching method/activity mechanics; it must not replace the real source task.
6. Preserve real classroom activity flow and explicit differentiated groups.
7. Preview, Word download, Google Drive and Google Classroom must serialize the same RPH content.
8. Do not rebuild Lesson Map, Supabase Auth, or Accuracy Gate unless the task specifically requires it.

## Database changes
Treat `rph-library/*.csv` as snapshots only. Do not edit them and assume production changed.
For production library changes, prepare SQL explicitly and review it before running against Supabase.
Never commit database passwords, service-role keys, access tokens or connection strings.

## Before changing code
- `git status`
- inspect current hotfix loader/cache-bust chain
- keep patches minimal
- preserve existing RPH functions unrelated to the reported bug
- run syntax/static tests available in `tests/`

## After changing code
- verify preview behavior
- verify Word/export parity
- verify no MutationObserver/render loop regression
- verify differentiated groups are still present when required
- report files changed and commit SHA accurately
