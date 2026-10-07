import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {webcrypto} from 'node:crypto';
const work=new URL('../rph-library/generated/pj-year1-two-session-review-r1/',import.meta.url);
// CI guard: rph-library/ is gitignored. Skip honestly instead of failing when fixtures are absent.
if(!fs.existsSync(new URL('app/approved-pj1-library.json',work))||!fs.existsSync(new URL('.tooling/node_modules',work))){console.log(JSON.stringify({status:'SKIP',reason:'gitignored rph-library fixtures absent',test:'rph-pj1-canonical-preflight'}));process.exit(0);}
const req=createRequire(new URL('.tooling/package.json',work));
const acorn=req('acorn'),JSZip=req('jszip'),{parseHTML}=req('linkedom');
const source=fs.readFileSync(new URL('../app-v03334-original.js',import.meta.url),'utf8');
// Preflight: NEW approved PJ1 content through the real canonical generateRphContent + Word export.
// Scope: node VM with controlled fixtures; no remote activation, no production database.
const functions=acorn.parse(source,{ecmaVersion:'latest'}).body.filter(n=>n.type==='FunctionDeclaration').map(n=>source.slice(n.start,n.end)).join('\n');
const inputIds=['rphClass','rphSubject','rphWeek','rphDate','rphTime','rphLessonMap','rphReflectionText','rphRefNote','rphRefPresent','rphRefAchieved','rphRefActive','rphRefTotal'];
const {document,window:dom}=parseHTML('<html><body>'+inputIds.map(i=>'<input id="'+i+'">').join('')+'<div id="rphEmpty"></div><div id="rphPreview" class="hidden"></div><div id="rphAccuracyGate"></div></body></html>');
const owner='11111111-1111-4111-8111-111111111111',classId='22222222-2222-4222-8222-222222222222',subjectId='44444444-4444-4444-8444-444444444444';
const state={connected:true,user:{id:owner,email:'test@example.invalid'},access:{status:'allowed'},profile:{full_name:'ridhwan'},classes:[{id:classId,name:'Kelas ujian',year:1,academic_year:2026}],subjects:[{id:subjectId,name:'Pendidikan Jasmani',code:'PJ'}],students:[],rphRecords:[],rphLegacyRecords:[],rphRecordVersions:[],rphActivityLibrary:[]};
const c={state,document,console,crypto:webcrypto,TextEncoder,TextDecoder,Blob,URL,Date,JSON,Map,Set,WeakSet,JSZip,DOMException:dom.DOMException,setTimeout,clearTimeout,DOCX_MIME:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',$:s=>document.querySelector(s),$$:s=>[...document.querySelectorAll(s)],setInterval:()=>0,clearInterval(){}};c.window=c;c.globalThis=c;
vm.createContext(c);vm.runInContext(functions,c);
for(const f of ['rph-record-versions.js','rph-approved-library.js'])vm.runInContext(fs.readFileSync(new URL('../'+f,import.meta.url),'utf8'),c,{filename:f});
const a=c.RphRecordVersions,b=c.RphApprovedLibrary,data=await b.verifyDataset(JSON.parse(fs.readFileSync(new URL('app/approved-pj1-library.json',work),'utf8')));
const messages=[];let map,currentEntry,oldBlueprintCalls=0;
Object.assign(c,{requireAuth:()=>true,isAdmin:()=>true,selectedRphSchedule:()=>null,timetableLessonRoute:()=>({available:false}),rphSubjectKey:()=>'pj',lessonLanguage:()=>'ms',selectVerifiedLessonMap:()=>map,lessonMapWeekDisposition:()=>({blocked:false}),lessonPageEvidence:async()=>({bt:[{printed_page:currentEntry.printed_pages[0],content:currentEntry.lesson.source_task,doc:{file_name:'Real locally checked PJ1 source text'}}],ba:[],hasBA:false}),buildSourceActivities:()=>({activities:[currentEntry.lesson.source_task],exactTextbookCount:1,similarity:0}),effectiveRphLessonMap:()=>{oldBlueprintCalls++;throw Error('Old blueprint must be bypassed')},buildSourceAwarePedagogy:()=>{oldBlueprintCalls++;throw Error('Old pedagogy must be bypassed')},ensureRphClassroomBrowser(){},updateClassroomAssignmentActions(){},logAudit:async()=>{},toast:s=>messages.push(s),snippet:(s,n)=>s.slice(0,n),safeFileName:s=>s.replace(/[^A-Za-z0-9._-]/g,'_')});
for(const [id,value] of Object.entries({rphClass:classId,rphSubject:subjectId,rphWeek:'29',rphDate:'2026-10-05',rphTime:'08:00–08:30'}))document.getElementById(id).value=value;
const checks=[];const rows=[];
async function test(name,fn){await fn();checks.push(name)}
function setup(e){currentEntry=e;const t=b.mapTemplate(data,e);map={...t,id:webcrypto.randomUUID(),subject_id:subjectId,confidence_score:100,verification_status:'verified',source_evidence:{...t.source_evidence,textbook:true,meta:{...t.source_evidence.meta,verification_scope:'VM_TEST_FIXTURE_OF_VERIFIED_MAP_NOT_LIVE'}}};document.getElementById('rphWeek').value=String(e.week);}
const CANON=['rph-title','source-trace','rph-grid','rph-section','rph-step-table','group-card','rph-pbd-table','rph-reflection','rph-action-grid','Pentaksiran Bilik Darjah (PBD)','Penutup'];
await test('All 20 approved PJ1 sessions render in the canonical RPH Hub format and Word export',async()=>{
 b.armLocal(data,{enabledIds:data.entries.map(e=>e.id)});c.rphApprovedPreflight={conditional:true,singingModel:true};
 for(const e of data.entries){
  setup(e);await c.generateRphContent();
  const ctx=state.currentGeneratedRph;
  assert.equal(ctx?.approvedLibrary?.id,e.id);
  assert.equal(ctx.map.objective,e.lesson.objective);
  assert.equal(document.getElementById('rphRefPresent').value,'');
  assert.equal(document.getElementById('editGeneratedRph').disabled,true);
  const html=document.getElementById('rphPreview').innerHTML;
  for(const marker of CANON)assert.ok(html.includes(marker),`preview missing ${marker} for ${e.id}`);
  assert.ok(html.includes('PdP Terbeza (3 Kumpulan)')||html.includes('Differentiated Instruction'),`no 3-group block ${e.id}`);
  assert.ok(html.includes('Kelompok Peneroka')&&html.includes('Kelompok Pembina')&&html.includes('Kelompok Pencabar'),`group cards missing ${e.id}`);
  const blob=await c.buildDocxBlob(ctx),zip=await JSZip.loadAsync(await blob.arrayBuffer()),xml=await zip.file('word/document.xml').async('string');
  const doc=parseHTML(xml).document;
  const combined=[...doc.querySelectorAll('w\\:t')].map(x=>x.textContent).join('\n');
  // Kontrak baharu: format RPH Hub berbahagian (A-G), kandungan kelulusan dikekalkan.
  const L=e.lesson;
  assert.ok(combined.includes(L.title),`Word missing approved title (${e.id})`);
  assert.ok(combined.includes(e.id),`Word missing approved ID (${e.id})`);
  assert.ok(combined.includes(L.objective),`Word missing objective (${e.id})`);
  for(const cr of [].concat(L.success_criteria||[]))assert.ok(combined.includes(cr),`Word missing criterion (${e.id})`);
  assert.ok(combined.includes(L.sp_code),`Word missing SP utama code (${e.id})`);
  assert.ok(combined.includes(L.sk_code),`Word missing SK code (${e.id})`);
  for(const c of (L.complementary_standards||[]))assert.ok(combined.includes(c.sp_code),`Word missing complementary SP code ${c.sp_code} (${e.id})`);
  for(const lane of ['support','core','challenge']){const d=L.differentiation[lane];for(const st of (d.pupil_steps||[]))assert.ok(combined.includes(st),`Word missing ${lane} step (${e.id})`);}
  assert.ok(combined.includes('Kelompok Peneroka'),`Word missing Peneroka (${e.id})`);
  assert.ok(combined.includes('Kelompok Pembina'),`Word missing Pembina (${e.id})`);
  assert.ok(combined.includes('Kelompok Pencabar'),`Word missing Pencabar (${e.id})`);
  for(const section of ['A. MAKLUMAT PENGAJARAN','B. PENJAJARAN KURIKULUM','C. SET INDUKSI','D. AKTIVITI SUMBER DARIPADA BUKU','E. PDP TERBEZA','F. PENTAKSIRAN BILIK DARJAH (PBD)','G. PENUTUP DAN REFLEKSI'])assert.ok(combined.includes(section),`Word missing section ${section} (${e.id})`);
  rows.push({id:e.id,minutes:30,docx_bytes:blob.size,canonical_format:true});
 }
 assert.equal(oldBlueprintCalls,0);
 assert.equal(rows.length,20);
});
await test('Unknown route is OUT_OF_SCOPE at library level (no silent fallback entry)',async()=>{const t=b.mapTemplate(data,data.entries[0]);const m39={...t,id:'x',subject_id:'s',verification_status:'verified',source_evidence:{...t.source_evidence,textbook:true,meta:{...t.source_evidence.meta,verification_scope:'LOCAL_PILOT_DERIVED_SOURCE'}},week_no:39,session_no:1};const opts={localPilot:true,subjectKey:'pj',classId:'c',className:'K',teacherName:'G',date:'2026-10-05',duration:30,lessonTime:'08:00–08:30',confirmConditional:true,confirmSingingModel:true};assert.equal(b.select(data,m39,opts).status,'OUT_OF_SCOPE');assert.equal(b.currentSelection(m39,opts),null);});
await test('Out-of-scope subjects untouched',async()=>{setup(data.entries[0]);const t=b.mapTemplate(data,data.entries[0]);assert.equal(b.select(data,{...t,id:'x',subject_id:'s',verification_status:'verified',source_evidence:{...t.source_evidence,textbook:true,meta:{...t.source_evidence.meta,verification_scope:'LOCAL_PILOT_DERIVED_SOURCE'}}},{...{localPilot:true,subjectKey:'science',classId:'c',className:'K',teacherName:'G',date:'2026-10-05',duration:30,lessonTime:'08:00–08:30',confirmConditional:true,confirmSingingModel:true}}).status,'OUT_OF_SCOPE');});
const report={status:'PASS',checks:checks.length,names:checks,rows,scope:'Preflight: 20 approved PJ Tahun 1 sessions through the real canonical generateRphContent renderer and Word export in Node VM. Approved library content locked; canonical RPH Hub classes (rph-title, source-trace, rph-grid, rph-section, rph-step-table, group-card, rph-reflection, rph-action-grid) asserted. Local fixtures only; not production activation.'};
fs.writeFileSync(new URL('preflight-canonical-format-report.json',work),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:'PASS',checks:checks.length,sessions:rows.length,old_blueprint_calls:oldBlueprintCalls}));
