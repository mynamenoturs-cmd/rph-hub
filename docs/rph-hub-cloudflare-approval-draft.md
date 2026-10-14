# DRAF — RPH Hub → Cloudflare D1 → Apps Script DELimA → Drive

Status: **REVIEW ONLY. DO NOT ENABLE IN PRODUCTION BEFORE OWNER APPROVAL.**

## Audit

- Current generator requires a verified Lesson Map through the Accuracy Gate and generates Word via buildDocxBlob.
- Existing rph_record_versions uses immutable snapshots and SHA-256.
- Existing ensureGeneratedRphDriveFile uploads a generated Word using DELimA Google OAuth.
- The Cloudflare Worker v1.3.1 accepts POST /v1/queue/enqueue; Apps Script polls D1 every 10 minutes.
- Classroom Turn in is separate and remains manual.

## Proposed feature

- rph-hub-approval.js: optional LULUS button, only rendered if the server feature flag reports enabled. It requires an existing saved immutable version, checks the current preview fingerprint, asks explicit confirmation, verifies Google Drive account identity, uploads Word into Drive staging, and enqueues approval.
- functions/api/rph-approval.js: Cloudflare Pages server-only bridge. Validates Supabase Auth token, approved DELimA user, immutable RPH version, class/subject ownership, and currently verified Lesson Map. Derives authoritative metadata from Supabase, not browser input.
- tests/rph-hub-approval-gateway.test.mjs: mocked-only coverage. No real external writes.

## Server-side configuration (Cloudflare Pages, NOT browser or Git)

The feature is OFF by default. Provide the following Pages environment variables:

| Name | Meaning |
|---|---|
| RPH_APPROVAL_ENABLED | Keep false / unset until user approves production |
| RPH_SUPABASE_URL | Existing RPH Hub Supabase project URL |
| RPH_SUPABASE_PUBLISHABLE_KEY | Corresponding project publishable / anon key |
| RPH_QUEUE_GATEWAY_URL | HTTPS origin of existing rph-master-gateway Worker (no path) |
| RPH_QUEUE_ACTION_KEY | **Secret**: identical to Worker's RPH_ACTION_KEY (not the poll key) |

Never expose RPH_QUEUE_ACTION_KEY, RPH_ACTION_KEY, or RPH_QUEUE_POLL_KEY in browser code.
Ensure Preview environment is also OFF during code review.

## Intended teacher flow

1. Open actual scheduled session, verify RPT/DSKP/book evidence, correct class and year/week/session, three groups and Accuracy Gate.
2. Save RPH version using existing Simpan RPH; re-save if content or reflection changes.
3. Click LULUS & Arkib Word and confirm explicitly.
4. App queries queue for the same immutable version. Existing record stops duplicate Drive upload.
5. New requests verify the Drive email is the logged-in DELimA email, upload Word to staging, and POST to Pages server bridge.
6. Pages bridge derives metadata from immutable version + verified Lesson Map and sends to Worker POST /v1/queue/enqueue using server secret.
7. Apps Script polls, archives Word and updates Sheet, then acknowledges D1.
8. Verify D1 COMPLETED, new Sheet row, accessible archived Word and correct folder path.
9. Classroom Turn in remains MANUAL.

## Safeguards

- 201 means enqueued, not yet archived.
- Queue code RPH-<immutable-version-uuid> enforces stable idempotency.
- Pages cannot inspect bytes of the private Google Drive file; Google Apps Script verifies access/type but not semantic equality to the saved snapshot. Verify the archived Word manually.
- Upload staging may remain if queue call fails; do not automatically delete or overwrite it.
- Different signed-in Google account is blocked.
- Revoked / mismatched Lesson Map or changed snapshot hash is blocked.
- Existing D1, Supabase records, Sheets and Classroom are NOT touched by creating this draft branch.
- A FAILED queue item needs explicit reconciliation, never a new arbitrary code to bypass idempotency.

## Review checklist before activation

- [ ] GitHub PR checks green.
- [ ] Confirm Pages project and server-only env setup; flag remains off.
- [ ] Confirm live Worker v1.3.1 endpoint contract and Supabase RLS.
- [ ] Verify the generated DOCX follows supplied master RPH template.
- [ ] Test one fresh technical document with user approval (not prior Week 34 submissions).
- [ ] Verify Sheet/Drive archive and no Classroom Turn in.
- [ ] Obtain user LULUS before production activation.

## Rollback

Set RPH_APPROVAL_ENABLED=false in Pages. New LULUS actions stop without deleting existing records.
