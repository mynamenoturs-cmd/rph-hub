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
const runtimeRelease = 'safe-history-20261007f';

assert.ok(indexHtml.includes(`app-v03334.js?v=${runtimeRelease}`), 'HTML shell must request the current runtime release');
for (const runtimeFile of ['rph-record-versions.js','rph-approved-library.js','app-v03334-original.js','rph-record-history-ui.js']) {
  assert.ok(loader.includes(`${runtimeFile}?v=${runtimeRelease}`), `${runtimeFile} must use the current runtime release tag`);
}
assert.ok(serviceWorker.includes("const CACHE='erph-pbd-v03334-20261007f'"), 'Service-worker cache namespace must move with the runtime release');
assert.ok(serviceWorker.includes("const isRuntimeJs=/\\/(?:app-v[^/]+|rph-[^/]+)\\.js$/"), 'Service worker must treat app/rph JavaScript as network-first runtime files');
assert.ok(serviceWorker.includes("cache:'no-store'"), 'Runtime shell fetches must bypass HTTP cache');
assert.match(headersFile, /\/\*\.js\s+Cache-Control: no-store, max-age=0/, 'Cloudflare must not retain stale root JavaScript');
console.log('RPH runtime cache/version contract passed');
