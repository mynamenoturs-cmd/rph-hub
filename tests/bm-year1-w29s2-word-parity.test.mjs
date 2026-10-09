// Padanan kandungan DOCX BM1-2026B-W29-S2, bukan snapshot yang diluluskan.
// Fail asal tidak diperlukan dalam CI: semak ID, skop, sumber, 6 langkah, 3 kumpulan,
// tujuan pembelajaran, penilaian individu, refleksi dan tiada minit langkah yang direka.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const files=['rph-bm-year1-canonical-production.js','rph-bm1-w29s2-word-reference.js'];
const c={console:{info(){},warn(){}}};c.window=c;c.globalThis=c;
vm.createContext(c);
for(const name of files)vm.runInContext(fs.readFileSync(new URL('../'+name,import.meta.url),'utf8'),c,{filename:name});
const ref=c.BmYear1W29S2Reference;
assert.ok(ref);
assert.equal(ref.VERSION,'BM1-2026B-W29-W37-60MIN-R1');
assert.equal(ref.DOCUMENT_SHA256,'ce66d08db9c1c713a7986ff802abddca506805b9a3bc52b8ba222b4dc63825d1');
const original={
 subject_key:'bm',year:1,academic_year:2026,week_no:29,session_no:2,
 verification_status:'verified',week_exact:true,sp_crosscheck:true,
 title:'Treler Motosikal Datuk',sp:'2.3.1',sk:'2.3',
 textbook_page_start:110,textbook_page_end:110,
 objective:'Pada akhir PdP, murid dapat menyatakan maksud sekurang-kurangnya tiga rangkap pantun.',
 success_criteria:'Murid memadankan sekurang-kurangnya tiga rangkap dengan maksud yang sesuai.',
 source_evidence:{meta:{main_sp:'2.3.1',session_exact:true,page_route_verified:true},textbook:{text:'Pantun treler motosikal datuk'}}
};
const opts={subjectKey:'bm',lessonTime:'60 minit'};
assert.equal(ref.applies(original,opts),true);
const changed=ref.mapForPreview(original);
assert.equal(original.objective.startsWith('Pada akhir PdP'),true,'Do not mutate original verified Lesson Map');
assert.equal(changed.objective,'Murid dapat membaca pantun dan mengenal pasti maklumat tentang treler motosikal.');
assert.match(changed.success_criteria,/Membaca satu rangkap pantun/);
assert.match(changed.success_criteria,/Menyebut satu maklumat yang betul/);
assert.equal(changed.progression_stage,'application');
assert.equal(changed.sk,'2.3 Membaca dan mengapresiasi karya sastera dan bukan sastera');
const ped=ref.build(changed,opts);
assert.equal(ped.reviewedReferenceBm1,true);
assert.equal(ped.totalMinutes,60);
assert.equal(ped.reviewDocumentSha256,ref.DOCUMENT_SHA256);
assert.equal(ped.sourceSteps.length,6,'Word source has six distinct D steps');
assert.deepEqual(Array.from(ped.sourceSteps,x=>x.name),[
 'Kenal tajuk dan perkataan','Dengar dan jejak bacaan guru',
 'Baca satu rangkap dengan bantuan','Cari maklumat dalam pantun',
 'Semakan bacaan dan isi individu','Rumusan pantun'
]);
for(const step of ped.sourceSteps){
 assert.ok(step.text.includes('Tindakan guru:')&&step.text.includes('Tindakan murid:'));
 assert.ok(step.text.includes('Semakan:')&&step.text.includes('Bahan:'));
 assert.ok(step.pak21.includes('Baca–Dengar–Terang'));
 assert.equal(step.minutes,undefined,'Do not invent per-step minutes missing from source DOCX');
}
assert.match(ped.sourceSteps[4].text,/jangan mengisi penguasaan daripada bacaan kuat rakan/);
assert.match(ped.sourceSteps[3].text,/bukan perkataan pembayang/);
assert.equal(ped.librarySteps.support.length,1);
assert.equal(ped.librarySteps.core.length,1);
assert.equal(ped.librarySteps.challenge.length,1);
assert.equal(ped.differentiation.support.example.pupil,'Datuk mencipta treler motosikal.');
assert.equal(ped.differentiation.core.example.pupil,'Supaya treler senang bergerak.');
assert.equal(ped.differentiation.challenge.example.pupil,'Treler disangkut pada motosikal untuk membawa hasil tanaman.');
assert.match(ped.differentiation.support.criterion,/baris belum dibaca/);
assert.match(ped.differentiation.challenge.criterion,/bukan tekaan gambar/);
assert.match(ped.pbdEvidence.evidence,/Ini bukan hafalan jawapan tanpa bacaan/);
assert.match(ped.penutup,/Rumuskan kegunaan treler/);
assert.match(ped.reflection,/Dapat membaca satu rangkap/);
assert.match(ped.reflection,/Dapat menyebut satu maklumat/);

for(const [name,map,option] of [
 ['tahun2',{...original,year:2},opts],
 ['minggu30',{...original,week_no:30},opts],
 ['sesi1',{...original,session_no:1},opts],
 ['halaman109',{...original,textbook_page_start:109},opts],
 ['spLain',{...original,sp:'2.3.2',source_evidence:{meta:{...original.source_evidence.meta,main_sp:'2.3.2'},textbook:true}},opts],
 ['belumSah',{...original,verification_status:'needs_review'},opts],
 ['buktiHilang',{...original,source_evidence:{meta:original.source_evidence.meta}},opts],
 ['sesiTidakTepat',{...original,source_evidence:{meta:{...original.source_evidence.meta,session_exact:false},textbook:true}},opts],
 ['tigaPuluhMinit',original,{subjectKey:'bm',lessonTime:'08:00–08:30'}]
 ]){
 assert.equal(ref.applies(map,option),false,name+' must never use DOCX override outside evidence and timetable scope');
 assert.throws(()=>ref.build(map,option),/BM1_W29_S2_REFERENCE_SCOPE_MISMATCH/);
}
const source=fs.readFileSync(new URL('../app-v03334-original.js',import.meta.url),'utf8');
const loader=fs.readFileSync(new URL('../app-v03334.js',import.meta.url),'utf8');
assert.ok(loader.includes('rph-bm1-w29s2-word-reference.js?v=20261009i'));
assert.ok(source.indexOf('const validation=validateRphMap(map,ev,built)')<
  source.indexOf('const exactWordSession='),'Exact content may only be applied after original map validation');
assert.ok(source.indexOf('if(exactWordSession)map=reviewedBm1.mapForPreview(map)')<
  source.indexOf('if(exactWordSession)pedagogy=reviewedBm1.build('));
assert.ok(source.includes('if(!approvedContext&&window.BmYear1CanonicalRph?.applies'),'Canonical fallback must remain');
assert.ok(source.includes('if(exactWordSession)pedagogy=reviewedBm1.build('),'Word content must override generic canonical for exact match');
assert.ok(source.includes('data-rph-renderer="ag-v1"'),'RPH Hub A-G original cards must be kept');
assert.ok(source.includes("const wordSessionSelected=subjectRoute==='bm'"),'Selection is checked against the actual BM route');
assert.ok(source.includes('if(wordSessionSelected&&!approvedContext&&!exactWordSession)'), 'A matching BM1 W29 S2 must not silently fall back to generic');
assert.ok(source.includes("Sesi dipilih: "),'Actual selected timetable/lesson-map session must be visible');
assert.ok(source.includes("✓ PADAN WORD BM1 W29 S2"),'Word session route must have visible evidence on successful preview');
assert.ok(source.includes("Rujukan Word S2 tidak digunakan"),'Nonmatching BM1 W29 routes must be distinguished');
assert.ok(source.includes("RPH Word memerlukan 60 minit"),'Incorrect duration must be explained');
assert.ok(source.includes("Modul rujukan Word tiada"),'Missing runtime asset must be explained');
assert.ok(source.includes("state.currentGeneratedRph=null;"),'Invalid route must clear stale generated RPH state');
assert.ok(source.includes('function rphResolvedLessonTime(map,subjectId,schedule)'), 'Admin Word duration must have a single resolver');
assert.ok(source.includes("if(isAdmin())return null;"), 'Admin selected schedule must never fall back to hidden teacher timetable');

assert.ok(source.includes("ped?.reviewedReferenceBm1"),'Exact Word origin should be visible, not mislabeled approved');
console.log('BM1 W29 S2 Word/reference exact-scope and native A-G parity tests passed');
