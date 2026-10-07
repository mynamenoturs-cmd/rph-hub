#!/usr/bin/env bash
set -euo pipefail

ROOT="/data/data/com.termux/files/home/rph-hub"
cd "$ROOT"

echo "[release-smoke] start"

node tests/google-classroom-integration.test.mjs
node tests/rph-differentiated-pbd-preview.test.mjs
node tests/rph-exact-session-differentiation-export.test.mjs
node tests/rph-exact-session-gold-standard.test.mjs
node tests/rph-export-parity.test.mjs
node tests/rph-flexible-date-routing.test.mjs
node tests/lessonmap-live-verify-gate.test.mjs
node tests/rph-generation-ui.test.mjs
node tests/cloudflare-r2-source-files.test.mjs
node tests/all-subject-timetable-session-policy.test.mjs

echo "[release-smoke] PASS"