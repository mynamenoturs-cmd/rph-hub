import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const source = await fs.readFile(
  new URL('../app-v03334.js', import.meta.url),
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
