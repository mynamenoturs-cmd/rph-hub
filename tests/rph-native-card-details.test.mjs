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
assert.ok(source.includes('data-rph-renderer="ag-v1"'), 'Native A-G renderer must be preserved');
assert.ok(!source.includes('BmYear1CanonicalRph.render('), 'A second renderer must not return');
console.log('Native detailed-card preview / Word parity checks passed');
