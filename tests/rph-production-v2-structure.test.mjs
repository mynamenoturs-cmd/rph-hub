import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../rph-production-v2-structure-hotfix.js',import.meta.url),'utf8');
const basePed={
  anchor:'Menyampaikan maklumat berdasarkan gambar.',
  page:'m/s 109',
  topic:'Penyiram Pokok Inovasi',
  mainSp:'1.2.2',
  method:'Think-Pair-Share',
  groupBbm:{
    support:'Buku Teks m/s 109; kad petunjuk',
    core:'Buku Teks m/s 109; sumber buku teks',
    challenge:'Buku Teks m/s 109; kad pengayaan'
  },
  pbdEvidence:{method:'Pemerhatian lisan',evidence:'Respons individu',criterion:'Murid menyampaikan sekurang-kurangnya tiga maklumat tepat.'},
  librarySteps:{
    support:[
      {key:'source-task-support-1',name:'Teliti gambar',text:'Murid meneliti gambar dan menyebut maklumat dengan bimbingan.',bbm:'Buku Teks m/s 109',phase:'source'},
      {key:'game-1',name:'Kad urutan',text:'Murid menyusun kad urutan dan menerangkan semula.',bbm:'kad urutan',pak21:'Pair Check',phase:'game',activity_type:'game'}
    ],
    core:[
      {key:'source-task-core-1',name:'Huraikan gambar',text:'Murid menerangkan urutan dan keistimewaan alat berdasarkan gambar.',bbm:'Buku Teks m/s 109',phase:'source'}
    ],
    challenge:[
      {key:'source-task-challenge-1',name:'Jelaskan bukti',text:'Murid menerangkan maklumat dan memberikan sebab berdasarkan gambar.',bbm:'Buku Teks m/s 109',phase:'source'}
    ]
  },
  diffSupportAct:'lama support',
  diffCoreAct:'lama core',
  diffChallengeAct:'lama challenge'
};

const sandbox={console:{info(){},warn(){}},buildSourceAwarePedagogy:()=>structuredClone(basePed)};
sandbox.window=sandbox;sandbox.globalThis=sandbox;
vm.runInNewContext(source,sandbox,{filename:'rph-production-v2-structure-hotfix.js'});
const api=sandbox.__RPH_PRODUCTION_V2_STRUCTURE__;
assert.ok(api,'Production v2 API must load');

const map={
  title:'Penyiram Pokok Inovasi',
  objective:'Murid menyampaikan maklumat berdasarkan gambar.',
  success_criteria:'Murid menyampaikan sekurang-kurangnya tiga maklumat tepat.',
  sp:'1.2.2',
  source_evidence:{meta:{main_sp:'1.2.2'}}
};
const ped=sandbox.buildSourceAwarePedagogy(map,[],'m/s 109',false,'c1');
assert.equal(ped.productionRphVersion,'2026-10-08e');
for(const level of ['support','core','challenge']){
  assert.equal(ped.librarySteps[level].length,1,level+' must render as one structured production block');
  const text=ped.librarySteps[level][0].text;
  for(const label of ['Penerangan sokongan:','Tugasan:','Bahan:','Bimbingan guru:','Langkah murid:','Hasil individu:','Kriteria:','Susulan:']){
    assert.ok(text.includes(label),level+' missing '+label);
  }
  assert.ok(text.includes('Menyampaikan maklumat berdasarkan gambar.'),level+' must preserve exact source task');
  assert.ok(text.includes('1.2.2')||text.includes('tiga maklumat tepat'),level+' must remain aligned to SP/criterion');
}
assert.notEqual(ped.librarySteps.support[0].text.match(/Susulan: ([\s\S]*)/)?.[1],ped.librarySteps.core[0].text.match(/Susulan: ([\s\S]*)/)?.[1],'Support/Core follow-up must differ');
assert.notEqual(ped.librarySteps.core[0].text.match(/Susulan: ([\s\S]*)/)?.[1],ped.librarySteps.challenge[0].text.match(/Susulan: ([\s\S]*)/)?.[1],'Core/Challenge follow-up must differ');
assert.equal(ped.librarySteps.support[0].key,'game-1','Real Activity Library key must be preserved for anti-repeat history');
assert.equal(ped.librarySteps.support[0].activity_type,'game','Activity type must be preserved');

const approved={...basePed,approvedContentLocked:true,exactSessionLibrary:true};
const untouched=api.structurePedagogy(map,approved,false);
assert.equal(untouched,approved,'Approved exact-session content must not be rewritten');

console.log('RPH production v2 ordinary-generation structure: PASS');
