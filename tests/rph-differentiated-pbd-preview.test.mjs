import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const api=require('../rph-differentiated-pbd-preview-hotfix.js');

const ped={
  librarySteps:{
    support:[{text:'Guru mengecilkan pilihan kepada dua atau tiga bentuk dan murid memadankan dengan bimbingan.'}],
    core:[{text:'Murid memadankan enam bentuk dan menamakan sekurang-kurangnya empat secara individu.'}],
    challenge:[{text:'Murid memilih dua bentuk yang mudah tertukar dan menerangkan satu perbezaan rupa.'}]
  },
  pbdEvidence:{
    method:'Pemerhatian guru dan soal jawab lisan.',
    evidence:'Respons individu dan hasil padanan.',
    criterion:'Sekurang-kurangnya empat daripada enam bentuk dikenal pasti dengan betul.'
  }
};
const out=api.deriveDifferentiatedPbd(ped);
assert.equal(out.complete,true);
assert.match(out.groups.support.evidence,/bimbingan/i);
assert.match(out.groups.core.evidence,/empat/i);
assert.match(out.groups.challenge.evidence,/perbezaan rupa/i);
const html=api.blockHtml(ped,false);
assert.match(html,/PBD Terbeza Mengikut Kelompok/);
assert.match(html,/Peneroka/);
assert.match(html,/Pembina/);
assert.match(html,/Pencabar/);
assert.match(html,/Kriteria kejayaan teras kekal selari/);
const exportText=api.differentiatedEvidenceText(ped,false);
assert.match(exportText,/PBD Terbeza/);
assert.match(exportText,/Peneroka/);
console.log('RPH differentiated PBD preview: PASS');
