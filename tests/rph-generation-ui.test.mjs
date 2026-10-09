import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const source = await fs.readFile(
  new URL('../app-v03334-original.js', import.meta.url),
  'utf8',
);

assert.match(source, /async function generateRph\(\)[\s\S]*?withTimeout\(generateRphContent\(\),25000,'Penjanaan RPH'\)/);
assert.ok(source.includes("withTimeout(generateRphContent(),25000,'Penjanaan RPH')"), 'Generation must not wait forever');
assert.ok(source.includes("savedLessonEvidencePage(map,'textbook')"), 'Verified Lesson Map evidence must recover a slow source read');
assert.ok(source.includes("metadata:{kind:'lesson-map-snapshot'}"), 'Recovered evidence must be explicitly marked as a Lesson Map snapshot');
assert.ok(source.includes("state.currentGeneratedRph=null"), 'Failed generation must clear stale RPH state');
assert.match(source, /state\.currentGeneratedRph=null;\s*clearSourceReadCache\(\)/, 'A failed or timed-out source read must be retryable');
assert.ok(source.includes('RPH tidak dapat dipaparkan.'), 'Generation errors must be visible in the preview area');
assert.ok(source.includes('retryGenerateRph'), 'Generation errors must offer a retry action');
assert.ok(source.includes("preview.classList.add('hidden')"), 'A stale preview must be hidden after failure');
assert.ok(source.includes("preview.scrollIntoView({behavior:'smooth',block:'start'})"), 'A successful RPH must be brought into view');

console.log('RPH generation UI recovery tests passed');


const loader = await fs.readFile(new URL('../app-v03334.js', import.meta.url), 'utf8');
const indexHtml = await fs.readFile(new URL('../index.html', import.meta.url), 'utf8');
const serviceWorker = await fs.readFile(new URL('../sw.js', import.meta.url), 'utf8');
const headersFile = await fs.readFile(new URL('../_headers', import.meta.url), 'utf8');
const runtimeRelease = 'safe-history-20261009f';

assert.ok(indexHtml.includes(`app-v03334.js?v=${runtimeRelease}`), 'HTML shell must request the current runtime release');
for (const runtimeFile of ['rph-record-versions.js','rph-approved-library.js','app-v03334-original.js','rph-record-history-ui.js']) {
  assert.ok(loader.includes(`${runtimeFile}?v=${runtimeRelease}`), `${runtimeFile} must use the current runtime release tag`);
}
assert.ok(serviceWorker.includes("const CACHE='erph-pbd-v03334-20261009f'"), 'Service-worker cache namespace must move with the runtime release');
assert.ok(serviceWorker.includes("const isRuntimeJs=/\\/(?:app-v[^/]+|rph-[^/]+)\\.js$/"), 'Service worker must treat app/rph JavaScript as network-first runtime files');
assert.ok(serviceWorker.includes("cache:'no-store'"), 'Runtime shell fetches must bypass HTTP cache');
assert.match(headersFile, /\/\*\.js\s+Cache-Control: no-store, max-age=0/, 'Cloudflare must not retain stale root JavaScript');
console.log('RPH runtime cache/version contract passed');


assert.ok(source.includes("RPH approved library out of scope; fallback to source-first."), 'OUT_OF_SCOPE from an approved/pilot selector must fall back to normal source-first generation');
assert.ok(source.includes("approvedEngine.disarm?.()"), 'A stale approved-library arm must be cleared after OUT_OF_SCOPE');
assert.ok(source.includes("const RPH_RUNTIME_RELEASE='20261009f'"), 'Visible runtime release marker must be embedded in the app');
assert.ok(source.includes("navigator.serviceWorker.register('./sw.js?v=20261009f',{updateViaCache:'none'})"), 'PWA must bypass cached service-worker scripts');
assert.ok(source.includes("await reg.update()"), 'PWA must explicitly check for a newer service worker');
assert.ok(source.includes("controllerchange"), 'PWA must reload once when the new service-worker controller takes over');
assert.ok(source.includes("rphRuntimeBadge"), 'RPH page must expose its live runtime build before generation');
assert.ok(loader.includes('rph-bm-year1-canonical-production.js?v=20261009f'), 'Canonical BM1 production generator must be loaded');
assert.ok(loader.includes('rph-bm1-w29s2-word-reference.js?v=20261009f'), 'Exact source-verified BM1 W29 S2 Word reference must be loaded');
assert.ok(loader.includes('rph-bm1-week29-source-plans.js?v=20261009f'), 'BM1 W29 session-specific source plans must be loaded');
assert.ok(loader.includes('rph-bm1-week30-source-review.js?v=20261009f'), 'BM1 W30 source-grounded revision sessions must be loaded');
assert.ok(loader.includes('rph-bm1-week31-source-plans.js?v=20261009f'), 'BM1 W31 source-specific lessons must be loaded');
assert.ok(loader.includes('rph-bm1-week32-source-plans.js?v=20261009f'), 'BM1 W32 distinct source sessions must be loaded');
assert.ok(loader.includes('rph-bm1-week33-source-plans.js?v=20261009f'), 'BM1 W33 source-specific session plans must be loaded');
assert.ok(loader.includes('rph-bm1-week34-source-plans.js?v=20261009f'), 'BM1 W34 source-specific session plans must be loaded');
assert.ok(loader.includes('rph-bm1-week35-source-plans.js?v=20261009f'), 'BM1 W35 source-specific session plans must be loaded');
assert.ok(source.includes('const exactWordSession=!approvedContext&&Boolean(reviewedBm1?.applies'), 'Exact source version must never override approved library');
assert.ok(source.includes('if(exactWordSession)map=reviewedBm1.mapForPreview(map)'), 'Word reference objective must be substituted only after map validation');
assert.ok(source.includes('if(exactWordSession)pedagogy=reviewedBm1.build('), 'Native A-G cards must receive exact Word session steps');
assert.ok(source.includes('const lessonTime=rphResolvedLessonTime(map,subjectId,schedule)'), 'RPH duration must be resolved after exact Lesson Map selection');
assert.ok(source.includes("if(isAdmin()&&$('#rphTime'))$('#rphTime').value=lessonTime"), 'Admin should visibly see effective Word duration');

for (const legacy of ['rph-bm-year1-source-blueprint-hotfix.js','rph-bm-year1-unit19-blueprint-hotfix.js','rph-bm-year1-unit20-blueprint-hotfix.js','rph-bm-year1-unit21-blueprint-hotfix.js','rph-bm-year1-units22-24-blueprint-hotfix.js','rph-bm-year1-exact-session-variation-hotfix.js']) {
  assert.ok(!loader.includes(legacy), `Legacy BM1 runtime must not be loaded: ${legacy}`);
}
assert.ok(source.includes('window.BmYear1CanonicalRph?.applies'), 'generateRph must route verified BM1 lessons to the canonical production generator');
assert.ok(!source.includes('window.BmYear1CanonicalRph.render('), 'BM1 canonical content must use the native RPH Hub renderer, not a custom renderer');
assert.ok(source.includes('const html=`<div class="rph-title" data-rph-renderer="ag-v1">'), 'Native RPH Hub A-G renderer must remain the single preview renderer');
console.log('RPH stale-PWA, OUT_OF_SCOPE fallback and native-card BM1 routing tests passed');
