import assert from 'node:assert/strict';
import {manifest} from './bm2-hermes-fixture.mjs';
assert.equal(manifest.schema,'bm2-hermes-review-manifest-v1');
assert.equal(manifest.scope,'PUBLIC_ROUTE_METADATA_ONLY');
assert.equal(manifest.status,'DRAFT_REVIEW_ONLY');
assert.equal(manifest.source_count,33);
assert.equal(manifest.revision_count,66);
const byWeek={},ids=new Set();
for(const row of manifest.lessons){
 assert.equal(row.session_id,'BM2-M'+row.week_no+'-S'+row.session_no);
 assert.ok(!ids.has(row.session_id),'duplicate '+row.session_id);ids.add(row.session_id);
 assert.equal(row.verification_status,'needs_review');
 assert.deepEqual(row.versions,['r1','r2']);
 for(const rev of row.versions)assert.match(row.source_sha256[rev],/^[a-f0-9]{64}$/);
 byWeek[row.week_no]=(byWeek[row.week_no]||0)+1;
}
assert.deepEqual(byWeek,manifest.weeks);
console.log('BM2 Hermes public route manifest: 33 sessions and 66 original SHA-256 references (no original Word text).');
