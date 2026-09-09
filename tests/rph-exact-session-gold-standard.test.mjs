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

const forbidden=/Baca, Fikir dan Bincang|Kerusi Panas|Kotak Beracun|Cabaran Kumpulan|Tunjuk Jawapan/i;

function checkExactSession({name,steps,total}){
  const ped={
    exactSessionLibrary:true,
    sourceSteps:steps,
    classroomFlow:[
      {name:'Baca, Fikir dan Bincang',text:'generic'},
      {name:'Kerusi Panas',text:'generic'}
    ],
    librarySteps:{
      support:[{key:'pilot-support',name:'Peneroka — bimbingan',text:'Guru membimbing satu objek pada satu masa menggunakan jadual bergambar dan rangka ayat.'}],
      core:[{key:'pilot-core',name:'Pembina — standard',text:'Murid melengkapkan tugasan teras dengan bantuan minimum dan menjelaskan bukti.'}],
      challenge:[{key:'pilot-challenge',name:'Pencabar — pengayaan',text:'Murid menerangkan bukti yang mengubah ramalan atau mempertahankan keputusan pengujian.'}]
    },
    // Deliberately leave diff* blank. Exact-session librarySteps must remain authoritative.
    diffSupportAct:'',
    diffCoreAct:'',
    diffChallengeAct:''
  };

  api.applyGoldLock(ped);
  assert.equal(ped._goldStandardLocked,true,`${name}: lock`);
  assert.equal(ped._genericEnrichmentBypassed,true,`${name}: generic bypass`);
  assert.equal(ped._exactSessionDifferentiationPreserved,true,`${name}: differentiation preserved`);
  assert.equal(ped.classroomFlow.some(x=>forbidden.test(x.name)),false,`${name}: no legacy generic replacement`);
  assert.equal(ped.groupedDifferentiation,false,`${name}: no repeated per-step groups`);
  assert.equal(ped.inlineDifferentiation,true,`${name}: compact differentiation`);
  assert.equal(ped.librarySteps.support.length,1,`${name}: Peneroka`);
  assert.equal(ped.librarySteps.core.length,1,`${name}: Pembina`);
  assert.equal(ped.librarySteps.challenge.length,1,`${name}: Pencabar`);
  assert.ok(ped.librarySteps.support[0].text.trim(),`${name}: Peneroka text non-empty`);
  assert.ok(ped.librarySteps.core[0].text.trim(),`${name}: Pembina text non-empty`);
  assert.ok(ped.librarySteps.challenge[0].text.trim(),`${name}: Pencabar text non-empty`);
  const minutes=ped.classroomFlow.reduce((sum,s)=>sum+(Number(String(s.duration).match(/\d+/)?.[0])||0),0);
  assert.equal(minutes,total,`${name}: exact duration`);
  return ped;
}

const s1=checkExactSession({
  name:'M29 S1 Bentuk Magnet',
  total:30,
  steps:[
    {name:'Teka Bentuk',duration:'4 min',text:'Murid meneka dua bentuk magnet berdasarkan siluet atau magnet sebenar.'},
    {name:'Kenali Enam Bentuk',duration:'8 min',text:'Murid meneliti Buku Teks m/s 64 dan mengenal pasti enam bentuk magnet.'},
    {name:'Padan, Nama dan Buktikan',duration:'10 min',text:'Murid memadankan kad nama dengan gambar atau magnet sebenar secara bergilir.'},
    {name:'Semakan Individu',duration:'5 min',text:'Setiap murid mengenal pasti sekurang-kurangnya empat bentuk secara individu.'},
    {name:'Penutup',duration:'3 min',text:'Murid menyebut dua bentuk dan satu perbezaan rupa.'}
  ]
});
assert.deepEqual(Array.from(s1.classroomFlow,x=>x.name),['Teka Bentuk','Kenali Enam Bentuk','Padan, Nama dan Buktikan','Semakan Individu','Penutup']);

const s2=checkExactSession({
  name:'M29 S2 Hebatnya Magnet',
  total:60,
  steps:[
    {name:'Ramalan dua objek',duration:'5 min',text:'Murid meramal tindakan magnet pada dua objek.'},
    {name:'Cara menguji',duration:'8 min',text:'Murid mempelajari cara menguji dan merekod.'},
    {name:'Uji lima objek',duration:'20 min',text:'Murid menguji lima objek dan merekod secara individu.'},
    {name:'Kelas dan buktikan',duration:'12 min',text:'Murid mengelaskan objek berdasarkan bukti.'},
    {name:'Semakan individu',duration:'10 min',text:'Setiap murid membuat semakan individu.'},
    {name:'Rumusan',duration:'5 min',text:'Murid membuat rumusan daripada pemerhatian.'}
  ]
});
assert.deepEqual(Array.from(s2.classroomFlow,x=>x.name),['Ramalan dua objek','Cara menguji','Uji lima objek','Kelas dan buktikan','Semakan individu','Rumusan']);

console.log('RPH exact-session gold standard M29 S1 + S2 + differentiation: PASS');
