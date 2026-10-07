import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('../app-v03334-original.js',import.meta.url),'utf8');
const save=source.slice(source.indexOf('async function saveGeneratedRphRecord('),source.indexOf('async function saveGeneratedRphAndMaybeClassroom('));
assert.ok(!save.includes("from('rph_records').upsert"),'A same-date save must not overwrite legacy RPH records');
assert.ok(save.includes('appendRemote'),'New saves must use append-only version persistence');
assert.ok(save.includes('snapshotFromContext'),'Persist the full displayed teaching snapshot, not only activity pointers');
console.log('Canonical RPH save: append-only integration guard PASS');
