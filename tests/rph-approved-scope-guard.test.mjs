import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';

const sandbox={crypto:webcrypto,TextEncoder,TextDecoder,Blob,URL,Date,console,setTimeout,clearTimeout,JSON,Map,Set,WeakSet};
sandbox.window=sandbox;
sandbox.globalThis=sandbox;
for(const file of ['rph-record-versions.js','rph-approved-library.js']){
  vm.runInNewContext(fs.readFileSync(new URL('../'+file,import.meta.url),'utf8'),sandbox,{filename:file});
}
const api=sandbox.RphApprovedLibrary;
const fixture=JSON.parse(fs.readFileSync(new URL('./fixtures/approved-library-synthetic.json',import.meta.url),'utf8'));
const data=await api.verifyDataset(fixture);
const entry=data.entries[0];
const base=api.mapTemplate(data,entry);
const map={
  ...base,
  id:webcrypto.randomUUID(),
  subject_id:'33333333-3333-4333-8333-333333333333',
  verification_status:'verified',
  source_evidence:{
    ...base.source_evidence,
    textbook:true,
    meta:{...base.source_evidence.meta,verification_scope:'LOCAL_PILOT_DERIVED_SOURCE'}
  }
};
const options={
  localPilot:true,
  subjectKey:'syn',
  classId:'22222222-2222-4222-8222-222222222222',
  className:'Kelas ujian',
  teacherName:'Guru ujian',
  date:'2026-10-07',
  duration:entry.duration,
  lessonTime:'08:00–08:30',
  confirmConditional:true,
  confirmSingingModel:true
};

assert.equal(api.currentSelection(map,options),null,'Unarmed approved library must not affect live generation');
api.armLocal(data,{enabledIds:[entry.id]});
assert.equal(api.currentSelection(map,options).approvedLibrary.id,entry.id,'Matching academic year should select the explicitly armed route');
assert.equal(
  api.currentSelection({...map,academic_year:data.academic_year+1},options),
  null,
  'Different academic year must be treated as out of scope without throwing or blocking normal source-first generation'
);
api.disarm();
assert.equal(api.currentSelection(map,options),null,'Disarmed approved library must return control to normal generation');
console.log('RPH approved-library academic-year scope guard passed');
