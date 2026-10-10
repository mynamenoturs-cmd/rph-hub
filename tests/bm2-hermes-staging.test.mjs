import assert from 'node:assert/strict';
import fs from 'node:fs';

const root=new URL('../',import.meta.url);
const moduleSource=fs.readFileSync(new URL('functions/api/bm2-hermes-review.js',root),'utf8');
const marker='const HERMES_CANDIDATES = ',end=';\n\nfunction response(';
const begin=moduleSource.indexOf(marker),finish=moduleSource.indexOf(end,begin);
assert.ok(begin>=0&&finish>begin,'Protected Hermes dataset missing');
const dataset=JSON.parse(moduleSource.slice(begin+marker.length,finish));
assert.equal(dataset.count_unique_sessions,33);
assert.equal(dataset.count_original_docx,66);
assert.equal(dataset.default_candidate_revision,'r1');
assert.equal(dataset.alternative_revision,'r2');
assert.equal(dataset.status,'NOT_IMPORTED; REVIEW_REQUIRED');
const countByWeek=new Map(),seen=new Set();
for(const row of dataset.lessons){
  const id='BM2-M'+row.week_no+'-S'+row.session_no;
  assert.equal(row.session_id,id);
  assert.equal(seen.has(id),false,'Duplicate session '+id);
  seen.add(id);
  assert.ok(row.week_no>=31&&row.week_no<=37);
  assert.ok(row.session_no>=1&&row.session_no<=5);
  assert.equal(row.lesson_map.verification_status,'needs_review');
  countByWeek.set(row.week_no,(countByWeek.get(row.week_no)||0)+1);
  for(const revision of ['r1','r2']){
    const doc=row[revision];
    assert.equal(doc.revision,revision);
    assert.equal(doc.title_original,row.lesson_map.title);
    assert.equal(doc.source,'Hermes DOCX');
    assert.equal(doc.approved,false);
    assert.equal(doc.import_status,'DRAFT_CANDIDATE_ONLY');
    assert.equal(doc.lesson_map_review_status,'needs_review');
    assert.equal(doc.metadata_for_import.subject_key,'bm');
    assert.equal(doc.metadata_for_import.year,2);
    assert.equal(doc.metadata_for_import.academic_year,2026);
    assert.equal(doc.metadata_for_import.week_no,row.week_no);
    assert.equal(doc.metadata_for_import.session_no,row.session_no);
    assert.equal(doc.metadata_for_import.lesson_date,null);
    assert.equal(doc.metadata_for_import.class_id,null);
    assert.equal(doc.metadata_for_import.teacher_id,null);
    assert.equal(doc.six_phases_original.length,6);
    for(const step of doc.six_phases_original){
      assert.ok(step.phase_original?.trim());
      assert.ok(step.execution_original?.trim());
    }
    for(const tier of ['peneroka','pembina','pencabar'])
      assert.ok(doc.differentiation_original[tier]?.implementation_original?.trim());
    assert.ok(doc.pbd_original?.Evidens?.trim());
    assert.ok(doc.reflection_original?.trim());
    assert.ok(doc.source_docx_sha256?.length===64);
  }
}
assert.deepEqual([...countByWeek].sort((a,b)=>a[0]-b[0]),[[31,5],[32,4],[33,5],[34,4],[35,5],[36,5],[37,5]]);
console.log('BM2 Hermes staging: 33 exact sessions, both versions and review locks verified.');
