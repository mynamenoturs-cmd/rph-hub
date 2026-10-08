import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../app-v03334-original.js',import.meta.url),'utf8');
const helpers=source.match(/function rphLaneDetailRows\([\s\S]*?(?=function rphGroupStepsHtml\()/)?.[0];
assert.ok(helpers,'Source-grounded native card helper functions must be available');
const sandbox={escapeHtml:v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))};
vm.runInNewContext(helpers,sandbox,{filename:'rph-native-card-details.js'});

const lane={
  support_description:'Bimbingan berstruktur',
  task:'Menyampaikan maklumat daripada Buku Teks m/s 109',
  materials:['Buku Teks m/s 109'],
  teacher:['Guru menunjukkan satu contoh sebenar.'],
  pupil_steps:['Murid meneliti gambar.','Murid memberikan respons individu.'],
  example:{teacher:'Apakah bukti dalam gambar?',pupil:'Saya merujuk gambar.'},
  product:'Tiga respons individu',criterion:'Tiga maklumat tepat',next_step:'Baiki satu respons'
};
const details=sandbox.rphLaneDetailRows(lane,false);
assert.equal(details.length,10,'Existing ten canonical lane details are available without inventing content');
const html=sandbox.rphLaneDetailsHtml({...lane,product:'<img src=x onerror=alert(1)>'},false);
assert.ok(html.includes('Bimbingan guru'));
assert.ok(html.includes('Hasil individu'));
assert.ok(html.includes('&lt;img'),'Rendered source detail must be HTML-escaped');
assert.ok(!html.includes('<img'));
assert.equal(sandbox.rphLaneDetailsHtml(null,false),'','No fabricated detail for legacy records lacking lane evidence');
assert.equal(sandbox.rphInductionExtraHtml({phases:[{minutes:5,check:'Murid menunjukkan maklumat sumber'}]},false).includes('Semakan awal'),true);
assert.equal(sandbox.rphInductionExtraHtml({},false),'');

for(const level of ['support','core','challenge']){
  assert.ok(source.includes('rphLaneDetailsHtml(pedagogy.differentiation?.'+level+',uiEn)'),level+' detail belongs in its native E card');
  assert.ok(source.includes('ped.differentiation?.'+level),level+' DOCX lane must source the identical canonical field');
}
assert.ok(source.includes('rphLaneDetailRows(lane,uiEn)'), 'Preview and Word export must share one field list');
assert.ok(source.includes('rphInductionExtraHtml(pedagogy,uiEn)'), 'C card must expose verified opening checks');
assert.ok(source.includes('ped.phases?.[0]?.check'), 'Word export must include the same opening check');
assert.ok(source.includes('Number(x.minutes)>0'), 'D card must show source step timings when present');
assert.ok(source.includes('const duration=Number(step.minutes)>0'), 'Word export must show matching source step timings');

const ped={
  pbdEvidence:{criterion:'Tiga jawapan tepat'},
  phases:[
    {name:'Pencetus',minutes:5,check:'Respons awal'},
    {name:'Semak, terbeza dan PBD',minutes:15,check:'Semakan individu daripada tugasan sebenar'},
    {name:'Penutup',minutes:5,check:'Murid menunjukkan hasil pembelajaran'}
  ],
  differentiation:{
    support:{product:'Dua respons individu',criterion:'Tiga jawapan tepat'},
    core:{product:'Tiga respons individu',criterion:'Tiga jawapan tepat'},
    challenge:{product:'Empat respons dengan bukti',criterion:'Huraian disokong sumber'}
  },
  intervention:['Ulang item sumber dengan bimbingan beransur kurang.'],
  reflection:'Murid mencapai kriteria: ____ / ____.'
};
const pbdRows=sandbox.rphAssessmentDetailRows(ped,false);
assert.equal(pbdRows.length,4,'Native F card should include the individual check and all three group outcomes');
assert.ok(pbdRows.some(([label,value])=>label==='PBD — Peneroka'&&value.includes('Dua respons individu')));
assert.ok(pbdRows.some(([label,value])=>label==='PBD — Pencabar'&&value.includes('Kriteria: Huraian')));
const closureRows=sandbox.rphClosureDetailRows(ped,false);
assert.equal(closureRows.length,4,'Native G card should include duration, evidence, intervention and post-lesson placeholder');
assert.ok(closureRows.some(([label])=>label==='Templat refleksi (isi selepas PdP)'));
assert.equal(sandbox.rphAssessmentDetailRows({},false).length,0,'No fabricated PBD for old content lacking structure');
assert.equal(sandbox.rphClosureDetailRows({},false).length,0,'No fabricated closure for old content lacking structure');
const unsafe=sandbox.rphAdditionalRowsHtml([['<img onerror=alert(1)>','<script>alert(2)</script>']]);
assert.ok(unsafe.includes('&lt;script&gt;')&&!unsafe.includes('<script>'),'Additional card data must be HTML escaped');
assert.equal(sandbox.rphContentStatusLabel({canonicalBm1:true},false,false),'RPH kanonik Bahasa Melayu Tahun 1');
assert.equal(sandbox.rphContentStatusLabel({},true,false),'RPH diluluskan — kandungan dikunci');
assert.ok(source.includes("approvedContext?'':rphAdditionalRowsHtml(rphAssessmentDetailRows(pedagogy,uiEn))"),'Preview F must show extra detail only for editable, not approved snapshots');
assert.ok(source.includes("approvedContext?'':rphAdditionalRowsHtml(rphClosureDetailRows(pedagogy,uiEn))"),'Preview G must preserve approved snapshots');
assert.ok(source.includes("ctx.approvedLibrary?[]:rphAssessmentDetailRows(ped,uiEn)"),'Word F detail must skip approved snapshots');
assert.ok(source.includes("ctx.approvedLibrary?[]:rphClosureDetailRows(ped,uiEn)"),'Word G detail must skip approved snapshots');
assert.ok(source.includes('rphAssessmentDetailRows(ped,uiEn).forEach'),'Plain text F export should match preview');
assert.ok(source.includes('rphClosureDetailRows(ped,uiEn).forEach'),'Plain text G export should match preview');

assert.ok(source.includes('data-rph-renderer="ag-v1"'), 'Native A-G renderer must be preserved');
assert.ok(!source.includes('BmYear1CanonicalRph.render('), 'A second renderer must not return');
console.log('Native detailed-card preview / Word parity checks passed');
