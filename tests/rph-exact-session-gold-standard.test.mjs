import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const src=fs.readFileSync(new URL('../rph-exact-session-gold-standard-hotfix.js',import.meta.url),'utf8');
const sandbox={console,globalThis:{}};
sandbox.globalThis=sandbox;
vm.createContext(sandbox);
vm.runInContext(src,sandbox,{filename:'rph-exact-session-gold-standard-hotfix.js'});
const api=sandbox.__RPH_EXACT_SESSION_GOLD_STANDARD__;
assert.ok(api,'gold standard API should load');

const ped={
  exactSessionLibrary:true,
  sourceSteps:[
    {name:'Ramalan dua objek',duration:'5 min',text:'Murid meramal tindakan magnet pada dua objek.'},
    {name:'Cara menguji',duration:'8 min',text:'Murid mempelajari cara menguji dan merekod.'},
    {name:'Uji lima objek',duration:'20 min',text:'Murid menguji lima objek dan merekod secara individu.'},
    {name:'Kelas dan buktikan',duration:'12 min',text:'Murid mengelaskan objek berdasarkan bukti.'},
    {name:'Semakan individu',duration:'10 min',text:'Setiap murid membuat semakan individu.'},
    {name:'Rumusan',duration:'5 min',text:'Murid membuat rumusan daripada pemerhatian.'}
  ],
  classroomFlow:[
    {name:'Baca, Fikir dan Bincang',text:'generic'},
    {name:'Kerusi Panas',text:'generic'}
  ],
  diffSupportAct:'Bimbing satu objek pada satu masa dan gunakan jadual bergambar.',
  diffCoreAct:'Lengkapkan pengujian dan pengelasan dengan bantuan minimum.',
  diffChallengeAct:'Jelaskan bukti yang mengubah ramalan awal.'
};

api.applyGoldLock(ped);
assert.equal(ped._goldStandardLocked,true);
assert.equal(ped._genericEnrichmentBypassed,true);
assert.deepEqual(Array.from(ped.classroomFlow,x=>x.name),[
  'Ramalan dua objek','Cara menguji','Uji lima objek','Kelas dan buktikan','Semakan individu','Rumusan'
]);
assert.equal(ped.classroomFlow.some(x=>/Kerusi Panas|Kotak Beracun|Cabaran Kumpulan|Tunjuk Jawapan/i.test(x.name)),false);
assert.equal(ped.groupedDifferentiation,false);
assert.equal(ped.inlineDifferentiation,true);
assert.equal(ped.librarySteps.support.length,1);
assert.equal(ped.librarySteps.core.length,1);
assert.equal(ped.librarySteps.challenge.length,1);

const total=ped.classroomFlow.reduce((sum,s)=>sum+(Number(String(s.duration).match(/\d+/)?.[0])||0),0);
assert.equal(total,60);
console.log('RPH exact-session gold standard: PASS');
