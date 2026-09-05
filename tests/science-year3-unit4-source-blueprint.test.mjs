import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const f=new URL('../rph-science-year3-unit4-source-blueprint-hotfix.js',import.meta.url);
const s=fs.readFileSync(f,'utf8');
const window={
  rphSubjectKey:()=> 'science',
  effectiveRphLessonMap:m=>m,
  buildSourceAwarePedagogy:()=>({})
};
const sandbox={window,console:{info(){}}};
vm.createContext(sandbox);
vm.runInContext(s,sandbox);
assert.equal(window.__RPH_SCIENCE_YEAR3_UNIT4_SOURCE_BLUEPRINT__.routes,10,'must have exactly 10 exact routes');
assert.equal(window.__RPH_SCIENCE_YEAR3_UNIT4_SOURCE_BLUEPRINT__.review.length,0,'review must be zero');
for(const w of [17,18]){
  const expected=[['4.1.1',62],['4.1.2',62],['4.1.3',62],['4.1.4',64],['4.1.5',67]];
  expected.forEach(([standard,page],i)=>{
    const m={subject_id:'science',year:3,week_no:w,session_no:i+1,textbook_page_start:page,sp:standard};
    const bp=window.rphScienceYear3Unit4SourceBlueprint(m);
    assert.ok(bp,`missing route ${standard}@${page}|W${w}|S${i+1}`);
    assert.equal(bp.generateFlag,'YES');
    assert.equal(bp.conditional,false);
    assert.equal(bp.alignmentReviewRequired,false);
  });
}
for(const w of [16,19]){
  const m={subject_id:'science',year:3,week_no:w,session_no:1,textbook_page_start:62,sp:'4.1.1'};
  assert.equal(window.rphScienceYear3Unit4SourceBlueprint(m),null,`must not route W${w}`);
}
assert.match(s,/sourceContinuationPolicy:/);
assert.match(s,/Activity Library may vary delivery only and must not determine lesson content/);
assert.match(s,/Buku Aktiviti tidak digunakan sebagai sumber kandungan blueprint ini; jangan reka aktiviti Buku Aktiviti\./);
assert.doesNotMatch(s,/Math\.random/);
assert.doesNotMatch(s,/mappingStatus\s*:\s*['"]VERIFIED['"]/);
assert.doesNotMatch(s,/verificationStatus\s*:\s*['"]VERIFIED['"]/);
console.log('Science Year 3 Unit 4 source-first blueprint static guard passed: 10 routes; alignment review: 0 conditional: 0');
