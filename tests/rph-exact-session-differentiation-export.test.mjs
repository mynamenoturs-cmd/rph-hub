import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const src=fs.readFileSync(new URL('../rph-exact-session-differentiation-export-hotfix.js',import.meta.url),'utf8');
const key='science_y1_w29_s2_stesen_ujian_magnet_ditarik_atau_tidak_f7fdc9c8';
const exampleText=`Objektif: Uji objek dan buat rumusan.\nKriteria kejayaan: Rekod dan kelas dengan tepat.\nPeneroka: Guru membimbing satu objek pada satu masa menggunakan jadual bergambar.\nPembina: Murid merekod lima keputusan dan mengelaskan objek dengan bantuan minimum.\nPencabar: Murid mengulang satu pengujian yang diragui dan menerangkan bukti.\nPBD: Semak evidens individu.`;
const sandbox={console,setTimeout:fn=>fn(),globalThis:{},state:{rphActivityLibrary:[{activity_key:key,example_text:exampleText}]}};
sandbox.globalThis=sandbox;
sandbox.globalThis.state=sandbox.state;
vm.createContext(sandbox);
vm.runInContext(src,sandbox,{filename:'rph-exact-session-differentiation-export-hotfix.js'});
const api=sandbox.__RPH_EXACT_SESSION_DIFFERENTIATION_EXPORT__;
assert.ok(api,'export guard API should load');

const ped={
  exactSessionLibrary:true,
  activityLibrarySelection:{activity_key:key},
  librarySteps:{support:[],core:[],challenge:[]},
  groupDifferentiation:{support:[],core:[],challenge:[]},
  diffSupportAct:'',diffCoreAct:'',diffChallengeAct:''
};
api.hydrate(ped);
for(const level of ['support','core','challenge']){
  assert.equal(ped.librarySteps[level].length,1,`${level}: compact library row`);
  assert.ok(ped.librarySteps[level][0].text.trim(),`${level}: library text`);
  assert.equal(ped.groupDifferentiation[level].length,1,`${level}: compatibility group row`);
  assert.ok(ped.groupDifferentiation[level][0].text.trim(),`${level}: compatibility text`);
}
assert.ok(ped.diffSupportAct.trim(),'Peneroka fallback');
assert.ok(ped.diffCoreAct.trim(),'Pembina fallback');
assert.ok(ped.diffChallengeAct.trim(),'Pencabar fallback');
assert.doesNotThrow(()=>api.assertComplete(ped));

sandbox.state.rphActivityLibrary=[];
const broken={exactSessionLibrary:true,activityLibrarySelection:{activity_key:'missing'},librarySteps:{support:[],core:[],challenge:[]},groupDifferentiation:{support:[],core:[],challenge:[]},diffSupportAct:'',diffCoreAct:'',diffChallengeAct:''};
assert.throws(()=>api.assertComplete(broken),/EXACT_SESSION_DIFFERENTIATION_MISSING:support,core,challenge/);

console.log('RPH exact-session differentiation export hydration: PASS');
