// Read-only review cards for the original Hermes BM Year 2 R1/R2 Word content.
// This module never modifies a Lesson Map, source evidence, approval status, RPH
// record, generator state, or the verified Accuracy Gate.
(function(root){
'use strict';
const DATA_URL='data/bm2-hermes-m31-m37-candidates.json';
const EXPECTED_WEEKS={31:5,32:4,33:5,34:4,35:5,36:5,37:5};
const REVISIONS=['r1','r2'];
let pending=null;
const fail=message=>{throw Error('BM2_HERMES_REVIEW: '+message)};
const norm=v=>String(v==null?'':v).replace(/\s+/g,' ').trim();
const mainSp=v=>(norm(v).match(/^(\d+\.\d+\.\d+)/)||[])[1]||'';
const number=v=>Number(v);
const getState=()=>{try{return typeof state!=='undefined'?state:root.state}catch{return root.state}};
function validateDataset(d){
 if(!d||d.status!=='NOT_IMPORTED; REVIEW_REQUIRED'||d.count_unique_sessions!==33||d.count_original_docx!==66||!Array.isArray(d.lessons)||d.lessons.length!==33)fail('Bilangan calon atau status import tidak sah');
 const keys=new Set(),counts={};
 for(const row of d.lessons){
  const w=number(row.week_no),s=number(row.session_no),key='BM2-M'+w+'-S'+s,meta=row.lesson_map||{};
  if(!EXPECTED_WEEKS[w]||s<1||s>5||keys.has(key)||row.session_id!==key)fail('Sesi salah atau berganda: '+key);
  keys.add(key);counts[w]=(counts[w]||0)+1;
  if(meta.verification_status!=='needs_review'||!norm(meta.title)||!mainSp(meta.sp)||!(number(meta.page)>0))fail('Maklumat Lesson Map calon tidak sah: '+key);
  for(const rev of REVISIONS){
   const plan=row[rev],m=plan?.metadata_for_import||{};
   if(!plan||plan.revision!==rev||plan.approved!==false||plan.import_status!=='DRAFT_CANDIDATE_ONLY'||plan.lesson_map_review_status!=='needs_review')fail('Status kelulusan tidak sah: '+key+' '+rev);
   if(m.subject_key!=='bm'||m.year!==2||m.academic_year!==2026||m.week_no!==w||m.session_no!==s||m.lesson_date!==null||m.class_id!==null||m.teacher_id!==null)fail('Metadata salah: '+key+' '+rev);
   if(norm(plan.title_original)!==norm(meta.title)||mainSp(plan.sp_original)!==mainSp(meta.sp))fail('Tajuk atau SP bercanggah: '+key+' '+rev);
   if(number((norm(plan.textbook_pages_original).match(/\d+/)||[])[0])!==number(meta.page))fail('Halaman BT bercanggah: '+key+' '+rev);
   if(!/^[0-9a-f]{64}$/.test(plan.source_docx_sha256||''))fail('Hash rujukan Word tiada: '+key+' '+rev);
   if(!Array.isArray(plan.six_phases_original)||plan.six_phases_original.length!==6||plan.six_phases_original.some(x=>!norm(x.phase_original)||!norm(x.execution_original)))fail('Enam langkah tidak lengkap: '+key+' '+rev);
   if(['peneroka','pembina','pencabar'].some(t=>!norm(plan.differentiation_original?.[t]?.implementation_original)))fail('Pembezaan tidak lengkap: '+key+' '+rev);
   if(!norm(plan.pbd_original?.Evidens)||!norm(plan.reflection_original))fail('PBD atau refleksi tiada: '+key+' '+rev);
  }
 }
 for(const [w,total] of Object.entries(EXPECTED_WEEKS))if(counts[w]!==total)fail('Bilangan sesi Minggu '+w+' salah');
 return d;
}
async function loadDataset(fetcher){
 if(pending)return pending;
 const request=fetcher||root.fetch?.bind(root);
 if(!request)fail('Pelayar tidak menyokong muat turun data');
 pending=(async()=>{
  const result=await request(DATA_URL,{credentials:'same-origin',cache:'no-store'});
  if(!result?.ok)fail('Fail sumber Hermes belum tersedia pada server ('+(result?.status||'network')+')');
  return validateDataset(await result.json());
 })();
 try{return await pending}catch(e){pending=null;throw e}
}
function block(kind,title,text){return {kind,title,text:String(text??'')}}
function blocksFor(row,rev){
 if(!row||!REVISIONS.includes(rev))fail('Pilihan sesi/versi tidak sah');
 const d=row[rev],m=d?.metadata_for_import;
 if(!d||!m||d.approved!==false||d.import_status!=='DRAFT_CANDIDATE_ONLY'||row.lesson_map?.verification_status!=='needs_review'||m.subject_key!=='bm'||m.year!==2||m.week_no!==row.week_no||m.session_no!==row.session_no||mainSp(d.sp_original)!==mainSp(row.lesson_map.sp))fail('Kandungan tidak boleh dianggap diluluskan');
 const b=[
  block('title','RPH Hermes '+rev.toUpperCase()+' — DRAF SEMAKAN','Belum diluluskan atau diimport ke penjana RPH Hub'),
  block('h2','A. MAKLUMAT PENGAJARAN','Subjek: Bahasa Melayu | Tahun: 2 | Minggu: '+row.week_no+' | Sesi: '+row.session_no+'\nTarikh dan kelas: diisi mengikut pelaksanaan sebenar; tarikh Word lama tidak digunakan\nSumber asal: '+d.source_file_path),
  block('h2','B. PENJAJARAN KURIKULUM','Tajuk: '+d.title_original+'\nSK: '+d.sk_original+'\nSP: '+d.sp_original+'\nSP sokongan: '+d.sp_support_original+'\nObjektif: '+d.objective_original+'\nKriteria kejayaan: '+d.success_criteria_original+'\nBuku Teks: '+d.textbook_pages_original),
  block('h2','C. BAHAN DAN PERSEDIAAN','Rujukan induksi: '+(d.induction_original?.['BBM/ABM']||'Buku Teks')+'\nPAK-21: '+(d.induction_original?.['PAK-21']||'Rujuk pelaksanaan langkah PdP')),
  block('h2','D. LANGKAH PENGAJARAN DAN PEMBELAJARAN','Enam langkah asal Hermes dipaparkan tanpa penjanaan semula.')
 ];
 for(const item of d.six_phases_original){
  b.push(block('h3',item.phase_original,item.execution_original));
  b.push(block('p','BBM dan PAK-21',item.aids_and_pak21_original));
 }
 b.push(block('h2','E. PENGAJARAN DAN PEMBELAJARAN TERBEZA','Setiap laluan mengekalkan tugasan, bimbingan, tindakan murid serta hasil individu asal.'));
 for(const tier of ['peneroka','pembina','pencabar']){
  const lane=d.differentiation_original[t];
  b.push(block('h3',lane.label,lane.implementation_original));
  b.push(block('p','BBM dan PAK-21',lane.aids_and_pak21_original));
 }
 b.push(block('h2','F. PENTAKSIRAN BILIK DARJAH (PBD)','Kaedah: '+(d.pbd_original['Kaedah Pentaksiran']||'')+'\nEvidens: '+d.pbd_original.Evidens+'\nKriteria kejayaan: '+(d.pbd_original['Kriteria Kejayaan']||'')));
 b.push(block('h2','G. PENUTUP DAN REFLEKSI','Penutup:\n'+d.closure_original+'\n\nRefleksi selepas pelaksanaan:\n'+d.reflection_original));
 b.push(block('h2','STATUS SEMAKAN','DRAF HERMES — bukti sumber dan Lesson Map memerlukan semakan guru.\nTidak boleh dianggap RPH diluluskan, dijana atau disimpan dalam sistem hanya kerana kad ini dipaparkan.\nHash dokumen Word asal: '+d.source_docx_sha256));
 return b;
}
function mk(tag,content,className){
 const e=root.document.createElement(tag);
 if(content!==undefined&&content!==null)e.textContent=content;
 if(className)e.className=className;
 return e;
}
function field(wrapper,label,element){
 const outer=mk('label');outer.appendChild(mk('span',label));outer.appendChild(element);wrapper.appendChild(outer);
}
function updateSessionOptions(week,select,dataset){
 select.replaceChildren();
 for(const row of dataset.lessons.filter(x=>x.week_no===Number(week)).sort((a,b)=>a.session_no-b.session_no)){
  const option=mk('option','Sesi '+row.session_no+' — '+row.lesson_map.title);
  option.value=row.session_id;select.appendChild(option);
 }
}
function appendCard(host,blocks){
 const card=mk('article',null,'card rph-preview');
 card.setAttribute('data-hermes-review-only','true');
 for(const b of blocks){
  const tag=b.kind==='title'?'h3':b.kind==='h2'?'h4':b.kind==='h3'?'h5':'p';
  const head=mk(tag,b.title);card.appendChild(head);
  const val=mk('p',b.text);
  val.style.whiteSpace='pre-wrap';
  card.appendChild(val);
 }
 host.appendChild(card);
}
function init(){
 if(!root.document||root.document.getElementById('bm2HermesReview'))return;
 const host=root.document.getElementById('rph');if(!host)return;
 const panel=mk('section',null,'card');panel.id='bm2HermesReview';
 panel.setAttribute('data-review-scope','BM2-M31-M37-DRAFT-ONLY');
 panel.appendChild(mk('h3','Semakan RPH Hermes — BM Tahun 2, Minggu 31–37'));
 panel.appendChild(mk('p','Kandungan Word asal R1/R2. Draf ini bukan RPH yang diluluskan; penjanaan dan Accuracy Gate RPH Hub kekal berasingan.','muted'));
 const controls=mk('div',null,'filters');
 const week=mk('select');week.id='bm2HermesWeek';
 for(const w of Object.keys(EXPECTED_WEEKS)){const op=mk('option','Minggu '+w);op.value=w;week.appendChild(op)}
 field(controls,'Minggu',week);
 const session=mk('select');session.id='bm2HermesSession';field(controls,'Sesi',session);
 const version=mk('select');version.id='bm2HermesVersion';
 for(const v of REVISIONS){const option=mk('option',v.toUpperCase()+(v==='r1'?' — terperinci':' — ringkas'));option.value=v;version.appendChild(option)}
 field(controls,'Versi Hermes',version);
 const compareLabel=mk('label');const compare=mk('input');compare.type='checkbox';compare.id='bm2HermesCompare';compareLabel.appendChild(compare);compareLabel.appendChild(root.document.createTextNode(' Bandingkan R1 dan R2'));controls.appendChild(compareLabel);
 const button=mk('button','Paparkan draf Hermes untuk semakan','ghost');button.type='button';controls.appendChild(button);
 panel.appendChild(controls);
 const status=mk('p','Pilih minggu dan sesi, kemudian buka draf. Tidak ada perubahan pada rekod RPH.','muted');status.id='bm2HermesStatus';status.setAttribute('role','status');panel.appendChild(status);
 const preview=mk('div');preview.id='bm2HermesPreview';panel.appendChild(preview);
 let dataset=null;
 function setStatus(message){status.textContent=message}
 async function ensureData(){
  if(dataset)return dataset;
  const result=await loadDataset();
  dataset=result;updateSessionOptions(week.value,session,dataset);
  return dataset;
 }
 week.addEventListener('change',()=>{preview.replaceChildren();if(dataset)updateSessionOptions(week.value,session,dataset)});
 button.addEventListener('click',async()=>{
  preview.replaceChildren();
  if(!getState()?.user){setStatus('Sila log masuk dahulu untuk menyemak draf RPH Hermes.');return}
  button.disabled=true;setStatus('Membaca kandungan Hermes...');
  try{
   const ds=await ensureData();
   const row=ds.lessons.find(x=>x.session_id===session.value);
   if(!row||row.week_no!==Number(week.value))fail('Sesi belum dipilih dengan betul');
   for(const rev of (compare.checked?REVISIONS:[version.value]))appendCard(preview,blocksFor(row,rev));
   setStatus('Draf '+row.session_id+' dipaparkan. Kandungan tidak disimpan atau dijana semula; status Lesson Map kekal needs_review.');
  }catch(error){setStatus('Gagal membuka draf: '+error.message);preview.replaceChildren()}
  finally{button.disabled=false}
 });
 host.appendChild(panel);
}
root.Bm2HermesReview={validateDataset,loadDataset,blocksFor,updateSessionOptions,init,mainSp,DATA_URL};
if(typeof module!=='undefined'&&module.exports)module.exports=root.Bm2HermesReview;
if(root.document){
 if(root.document.readyState==='loading')root.document.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
}
})(typeof window!=='undefined'?window:globalThis);
