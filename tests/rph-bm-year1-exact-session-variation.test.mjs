import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const s={console,window:null,rphSubjectKey:()=> 'bm'};
s.window=s;
s.effectiveRphLessonMap=m=>m;
s.buildSourceAwarePedagogy=(map)=>({
  sourceSteps:[{key:'src',name:'Sumber',text:'Tugasan sumber',bbm:'Buku Teks',pak21:'Pair'}],
  classroomFlow:[{key:'src',name:'Sumber',text:'Tugasan sumber',bbm:'Buku Teks',pak21:'Pair'}],
  librarySteps:{
    support:[{key:'s',name:'Support asal',text:'support asal'}],
    core:[{key:'c',name:'Core asal',text:'core asal'}],
    challenge:[{key:'h',name:'Challenge asal',text:'challenge asal'}]
  },
  pbdEvidence:{method:'asal',evidence:'asal',criterion:'kriteria'},
  inductionData:{name:'asal',text:'asal',bbm:'asal',pak21:'asal'},
  setInduksi:'asal',penutup:'asal'
});
vm.runInNewContext(fs.readFileSync(new URL('../rph-bm-year1-exact-session-variation-hotfix.js',import.meta.url),'utf8'),s);

const map=(week,session,sp,page,title)=>({
  subject_id:'bm',year:1,academic_year:2026,week_no:week,session_no:session,
  sp,title,textbook_page_start:page,source_evidence:{meta:{main_sp:sp}}
});

const original=s.buildSourceAwarePedagogy(map(29,1,'1.2.2',109,'Penyiram Pokok Inovasi'),[],null,false,null);
const review=s.buildSourceAwarePedagogy(map(30,1,'1.2.2',109,'Penyiram Pokok Inovasi (Ulangkaji)'),[],null,false,null);
assert.equal(original._bmExactSessionVariant,undefined,'Original W29 source lesson must remain unmodified');
assert.equal(review._bmExactSessionVariant,'review-sprinkler');
assert.notDeepEqual(review.librarySteps.core,original.librarySteps.core,'W30 review must not repeat W29 implementation');
assert.match(review.pbdEvidence.method,/ulangan|ulang kaji|individu/i);

const writingOriginal=s.buildSourceAwarePedagogy(map(29,3,'3.2.1',111,'Wah, Mudahnya!'),[],null,false,null);
const writingReview=s.buildSourceAwarePedagogy(map(30,2,'3.2.1',111,'Wah, Mudahnya! (Ulangkaji)'),[],null,false,null);
assert.equal(writingReview._bmExactSessionVariant,'review-smart-bookmark');
assert.notDeepEqual(writingReview.librarySteps.core,writingOriginal.librarySteps.core,'W30 S2 must not repeat W29 S3');
assert.match(writingReview.pbdEvidence.evidence,/Tiga ayat lengkap/i);

const practice=s.buildSourceAwarePedagogy(map(36,4,'5.3.1',146,'Restoran Keluarga'),[],null,false,null);
const assessment=s.buildSourceAwarePedagogy(map(36,5,'5.3.1',146,'Restoran Keluarga'),[],null,false,null);
assert.equal(practice._bmExactSessionVariant,undefined,'W36 S4 remains practice/reinforcement');
assert.equal(assessment._bmExactSessionVariant,'assessment-family-restaurant');
assert.notDeepEqual(assessment.sourceSteps,practice.sourceSteps,'W36 S5 assessment source flow must differ from S4 practice');
assert.match(assessment.pbdEvidence.method,/Pentaksiran individu/i);
assert.match(assessment.pbdEvidence.evidence,/Tiga ayat penyata individu/i);

const effective=s.effectiveRphLessonMap(map(36,5,'5.3.1',146,'Restoran Keluarga'));
assert.equal(effective._runtime_bm_session_variant,'assessment-family-restaurant','Preview context must expose exact-session marker');

const outside=s.buildSourceAwarePedagogy({...map(36,5,'5.3.1',146,'Restoran Keluarga'),year:2},[],null,false,null);
assert.equal(outside._bmExactSessionVariant,undefined,'Patch must stay isolated to BM Year 1');

console.log('BM Year 1 exact-session anti-repeat tests passed');
