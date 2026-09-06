import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const src=fs.readFileSync(new URL('../rph-science-year3-timetable-session-hotfix.js',import.meta.url),'utf8');

const expected={BM:5,BI:4,SN:2,PJ:2,PK:1,MATH:3,BA:2,PI:4,PM:4,PSV:1,MZ:1};
for(const [code,count] of Object.entries(expected)){
  test(`${code} uses ${count} timetable session(s) per week`,()=>{
    assert.match(src,new RegExp(`\\b${code}:${count}\\b`));
  });
}

test('global lesson-map limit uses audited timetable policy',()=>{
  assert.match(src,/subjectRPTSessionLimit=function\(subjectId\)/);
  assert.match(src,/return audited\|\|prevLimit\(subjectId\)/);
});

test('stale out-of-timetable maps cannot be saved or selected',()=>{
  assert.match(src,/sessionNo>limit/);
  assert.match(src,/sessionAllowed\(subjectId,map\?\.session_no\)/);
});

test('Science Year 3 retains source-pool projection while using two actual sessions',()=>{
  assert.match(src,/FALLBACK_SCIENCE_SESSIONS=2/);
  assert.match(src,/sourcePoolSessions:5/);
  assert.match(src,/SC3\\s\*-\\s\*2026B/);
});
