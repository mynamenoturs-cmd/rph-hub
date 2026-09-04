import assert from 'node:assert/strict';

globalThis.window=globalThis;
window.rphSubjectKey=()=> 'science';
window.effectiveRphLessonMap=map=>({...map});
window.buildSourceAwarePedagogy=()=>({method:'legacy',librarySteps:{support:[],core:[],challenge:[]}});

await import('../rph-science-blueprint-hotfix.js');

const map={
  subject_id:'sn',
  title:'Konduktor dan Penebat',
  sp:'7.1.6',
  textbook_page_start:83,
  source_activities:'BT m/s 83: Murid menyatakan dua objek lain yang merupakan konduktor dan penebat elektrik.',
  source_evidence:{
    meta:{main_sp:'7.1.6'},
    textbook:{text:'Klip kertas membenarkan arus elektrik mengalir kerana saya ialah konduktor. Pemadam tidak membenarkan arus elektrik mengalir kerana saya ialah penebat.'},
    dskp:{text:'7.1.6 Mengitlak objek yang boleh menyalakan mentol dalam litar adalah konduktor dan yang tidak menyalakan mentol adalah penebat.'}
  }
};

const repaired=window.effectiveRphLessonMap(map,null,{activities:[map.source_activities]});
assert.match(repaired.objective,/mengitlak/i);
assert.match(repaired.success_criteria,/empat objek/i);

const ped=window.buildSourceAwarePedagogy(repaired,[map.source_activities],'m/s 83',false,'class-1');
assert.equal(ped._sourceBlueprint,true);
assert.match(ped.setInduksi,/klip kertas/i);
assert.match(ped.setInduksi,/pemadam/i);
assert.ok(ped.librarySteps.core.some(step=>/Detektif Konduktor/.test(step.name)));
assert.ok(ped.librarySteps.core.some(step=>/Kad K–P/.test(step.name)));
assert.match(ped.pbdEvidence.evidence,/jadual ramalan dan keputusan ujian/i);
assert.match(ped.penutup,/konduktor/i);
assert.match(ped.penutup,/penebat/i);

console.log('Science source blueprint tests passed');
