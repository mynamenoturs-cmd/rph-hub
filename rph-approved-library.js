(function(root){
'use strict';
const datasets=new WeakSet();let armed=null;
const api=()=>{if(!root.RphRecordVersions)throw Error('Modul snapshot belum tersedia.');return root.RphRecordVersions;};
const flat=v=>typeof v==='string'?v:Array.isArray(v)?v.map(flat).join(' '):v&&typeof v==='object'?Object.values(v).map(flat).join(' '):v==null?'':String(v);
const norm=s=>String(s??'').replace(/\s+/g,' ').trim();
const fail=(code,message)=>{const e=Error(message||code);e.code=code;throw e;};
function deepFreeze(v){if(v&&typeof v==='object'){Object.values(v).forEach(deepFreeze);Object.freeze(v);}return v;}
async function verifyDataset(data){
 const a=api(),d=a.clone(data);
 if(d.schema!=='rph-approved-library-v1'||d.scope!=='LOCAL_INACTIVE_CANDIDATES_ONLY'||d.active!==false)fail('DATASET_SCOPE');
 if(d.subject_key!==String(d.subject_key||'').trim()||!d.subject_key||!Number.isInteger(d.year)||!Number.isInteger(d.academic_year))fail('DATASET_SUBJECT');
 const idPrefix=String(d.id_prefix||'').replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const idRe=idPrefix?new RegExp('^'+idPrefix+'-W\\d+-S\\d+$'):/^[A-Z0-9]+-\d{4}B-W\d+-S\d+$/;
 const ids=d.entries?.map(r=>r.id)||[];
 if(ids.length!==d.reviewed_count||new Set(ids).size!==ids.length)fail('DATASET_COUNT');
 for(const e of d.entries){
  if(!idRe.test(e.id)||e.active!==false||e.approval_status!=='ACCEPTED_FROM_DOWNLOADED_CATATAN')fail('ENTRY_APPROVAL');
  if(e.subject_key!==d.subject_key||e.year!==d.year||e.academic_year!==d.academic_year)fail('ENTRY_SUBJECT');
  if(!/^[0-9a-f]{64}$/.test(e.content_sha256)||await a.sha256(e.raw_lesson_json)!==e.content_sha256)fail('ENTRY_HASH');
  const raw=JSON.parse(e.raw_lesson_json);
  if(a.stable(raw)!==a.stable(e.lesson)||raw.id!==e.id||raw.week!==e.week||raw.session!==e.session||raw.minutes!==e.duration)fail('ENTRY_PAYLOAD');
  if(raw.sp_code!==e.sp||raw.sp_focus!==e.sp_focus||raw.sp_display!==e.sp_display||e.duration!==raw.minutes)fail('ENTRY_CURRICULUM');
  if(await a.sha256(a.stable(e.reviewed_blocks))!==e.reviewed_blocks_sha256)fail('BLOCK_HASH');
 }
 if(d.blocked_routes.some(r=>ids.includes(r.id)))fail('BLOCKED_ROUTE_INCLUDED');
 deepFreeze(d);datasets.add(d);return d;
}
async function loadDataset(url,expectedSha256){
 if(!/^[0-9a-f]{64}$/.test(expectedSha256||''))fail('TRUST_ANCHOR_REQUIRED');
 const r=await fetch(url,{cache:'no-store'});if(!r.ok)fail('DATASET_FETCH','Pakej diluluskan tidak dapat dibaca: HTTP '+r.status);
 const raw=await r.text();if(await api().sha256(raw)!==expectedSha256)fail('DATASET_HASH','Hash pakej tidak sepadan; penjanaan disekat.');
 return verifyDataset(JSON.parse(raw));
}
function entryFor(data,map){return data.entries.find(e=>e.week===Number(map.week_no)&&e.session===Number(map.session_no));}
function subjectFor(map,explicit){if(explicit)return explicit;try{return root.rphSubjectKey(map.subject_id);}catch{return map.subject_key||'';}}
function select(data,map,options={}){
 if(!datasets.has(data))fail('UNVERIFIED_DATASET');
 if(subjectFor(map,options.subjectKey)!==data.subject_key||Number(map.year)!==data.year||Number(map.academic_year)!==data.academic_year)return {status:'OUT_OF_SCOPE'};
 const w=Number(map.week_no),s=Number(map.session_no),blocked=data.blocked_routes.find(x=>x.week===w&&x.session===s);
 if(blocked)fail(blocked.status,blocked.reason);
 const e=entryFor(data,map);if(!e)return {status:'OUT_OF_SCOPE'};
 if(map.verification_status!=='verified'||!map.week_exact||!map.sp_crosscheck)fail('LESSON_MAP_NOT_VERIFIED','Lesson Map sesi ini belum disahkan.');
 const meta=map.source_evidence?.meta||{};
 if(!meta.session_exact||!meta.page_route_verified)fail('SOURCE_ROUTE_UNVERIFIED');
 if(!map.source_evidence?.textbook)fail('TEXTBOOK_EVIDENCE_REQUIRED');
 if(String(meta.main_sp||String(map.sp||'').split(',')[0])!==e.sp)fail('SP_MISMATCH');
 const codes=String(map.sp||'').split(',').map(x=>x.trim());if(codes.length!==1||codes[0]!==e.sp)fail('SP_SCOPE_MISMATCH');
 if(norm(meta.sp_focus)!==norm(e.sp_focus))fail('SP_SUBFOCUS_MISMATCH','Subfokus SP tidak sepadan dengan versi diluluskan.');
 if(Number(map.textbook_page_start)!==e.printed_pages[0]||Number(map.textbook_page_end||map.textbook_page_start)!==e.printed_pages.at(-1))fail('PAGE_MISMATCH');
 if(meta.reviewed_lesson_id!==e.id||meta.reviewed_content_sha256!==e.content_sha256||meta.approval_manifest_sha256!==data.manifest_sha256)fail('MAP_APPROVAL_BINDING_MISSING','Lesson Map belum dipautkan kepada versi RPH yang diluluskan.');
 if(!options.localPilot&&meta.verification_scope==='LOCAL_PILOT_DERIVED_SOURCE')fail('LOCAL_MAP_NOT_REMOTE_VERIFIED');
 if(!Number.isInteger(options.duration)||options.duration!==e.duration)fail('DURATION_MISMATCH');
 if(!api().validDate(options.date))fail('INVALID_DATE');
 if(e.source_conditional&&options.confirmConditional!==true)fail('CONDITIONAL_CALENDAR_CONFIRMATION','Sahkan tarikh pelaksanaan bagi sesi RPT bersyarat ini.');
 if(e.requires_teacher_singing_model&&options.confirmSingingModel!==true)fail('TEACHER_SINGING_MODEL_REQUIRED','Guru perlu menyediakan model nyanyian Wau Bulan; bacaan lirik sahaja bukan bukti menyanyi.');
 return {status:'SELECTED',entry:e};
}
function phaseText(p){return ['Tindakan guru: '+flat(p.teacher),'Tindakan murid: '+flat(p.pupils),'Semakan: '+p.check,'Bahan: '+flat(p.resources)].join('\n');}
function laneText(l){return [l.support_description,'Tugasan: '+l.task,'Bahan: '+flat(l.materials),'Bimbingan guru: '+flat(l.teacher),'Langkah murid: '+flat(l.pupil_steps),'Contoh guru: '+l.example.teacher,'Contoh respons murid: '+l.example.pupil,'Hasil individu: '+l.product,'Kriteria: '+l.criterion,'Susulan: '+l.next_step].join('\n');}
function materialize(entry,data){
 const d=api().clone(entry.lesson),sourceSteps=d.phases.map((p,i)=>({key:entry.id+'-step-'+(i+1),name:p.name,text:phaseText(p),rawText:phaseText(p),minutes:p.minutes,duration:p.minutes+' minit',phase:'source',bbm:flat(p.resources),pak21:d.pak21}));
 const groups={};for(const k of ['support','core','challenge'])groups[k]=[{key:entry.id,name:d.differentiation[k].label,text:laneText(d.differentiation[k]),bbm:flat(d.differentiation[k].materials),pak21:d.pak21,libraryDriven:true,libraryActivityKey:entry.id}];
 return {exactSessionLibrary:true,approvedContentLocked:true,sourceSteps,classroomFlow:sourceSteps,librarySteps:groups,method:d.activity_name,pakDetail:d.pak21,groupBbm:Object.fromEntries(Object.keys(groups).map(k=>[k,groups[k][0].bbm])),bbmList:(d.materials||d.equipment||[]).map(m=>m.item+' — '+m.use),mainSp:d.sp_code,page:'m/s '+d.book_pages_text,topic:d.source_title,anchor:d.source_task,kind:'source_task',diffSupport:groups.support[0].text,diffCore:groups.core[0].text,diffChallenge:groups.challenge[0].text,diffSupportAct:groups.support[0].text,diffCoreAct:groups.core[0].text,diffChallengeAct:groups.challenge[0].text,inductionData:{name:d.phases[0].name,text:phaseText(d.phases[0]),bbm:flat(d.phases[0].resources),pak21:d.pak21},setInduksi:phaseText(d.phases[0]),penutup:phaseText(d.phases.at(-1)),pbdEvidence:{method:flat(d.pbd.method),evidence:flat(d.pbd.evidence),criterion:flat(d.pbd.criterion)},activityLibrarySelection:{activity_key:entry.id,source:'HASH_BOUND_APPROVED_LIBRARY',version:data.version,content_sha256:entry.content_sha256,exactSession:true}};
}
function chosenContext(data,map,options){
 const result=select(data,map,options);if(result.status!=='SELECTED')fail('OUT_OF_SCOPE');const e=result.entry,d=e.lesson;
 const adjusted={...api().clone(map),title:d.source_title,sk:d.sk_code+' '+d.sk_text,objective:d.objective,success_criteria:flat(d.success_criteria)};
 return {map:adjusted,classId:options.classId,subjectId:map.subject_id,date:options.date,week:e.week,lessonTime:options.lessonTime||'60 minit',teacherName:options.teacherName||'',className:options.className||'',uiEn:false,btRef:'m/s '+d.book_pages_text,activities:[d.source_task],pedagogy:materialize(e,data),edited:{},approvedLibrary:{id:e.id,version:data.version,content_sha256:e.content_sha256,manifest_sha256:data.manifest_sha256,approval_status:e.approval_status,lesson:api().clone(d),reviewed_blocks:api().clone(e.reviewed_blocks),limits:api().clone(e.limits)}};
}
const CANONICAL_SECTION={'A. Maklumat pengajaran':'A. MAKLUMAT PENGAJARAN','B. Standard dan hasil pembelajaran':'B. PENJAJARAN KURIKULUM','C. Bahan dan persediaan':'C. ALATAN DAN PERSEDIAAN','C. Alatan, persediaan dan keselamatan':'C. ALATAN DAN PERSEDIAAN','D. Langkah PdP':'D. AKTIVITI SUMBER DARIPADA BUKU','E. PdP terbeza':'E. PDP TERBEZA','F. Pentaksiran Bilik Darjah':'F. PENTAKSIRAN BILIK DARJAH (PBD)','G. Refleksi dan intervensi':'G. PENUTUP DAN REFLEKSI'};
function contextBlocks(ctx,reflection={}){
 const a=ctx.approvedLibrary;if(!a)fail('APPROVED_CONTEXT_REQUIRED');
 // Exact approved teaching blocks stay intact. Actual class/date/reflection are separate metadata.
 const meta=[{kind:'h2',text:'Maklumat pelaksanaan sebenar'},{kind:'p',text:'Guru: '+(ctx.teacherName||'Belum diisi')+' | Kelas: '+(ctx.className||'Belum diisi')+' | Tarikh: '+ctx.date+' | Waktu: '+(ctx.lessonTime||'60 minit')},{kind:'p',text:'Versi kandungan diluluskan: '+a.version+' | ID: '+a.id+' | SHA-256: '+a.content_sha256}];
 const bs=[...meta,...api().clone(a.reviewed_blocks)].map(b=>b.kind==='h2'&&CANONICAL_SECTION[b.text]?{...b,text:CANONICAL_SECTION[b.text]}:b);
 if(reflection.text)bs.push({kind:'h2',text:'Refleksi selepas PdP yang diisi guru'},{kind:'p',text:String(reflection.text)});
 if(reflection.note)bs.push({kind:'p',text:'Catatan pelaksanaan: '+reflection.note});
 return bs;
}
function mapTemplate(data,e){return {subject_key:data.subject_key,year:data.year,academic_year:data.academic_year,week_no:e.week,session_no:e.session,title:e.lesson.source_title,sk:e.lesson.sk_code,sp:e.sp,objective:e.lesson.objective,success_criteria:flat(e.lesson.success_criteria),textbook_page_start:e.printed_pages[0],textbook_page_end:e.printed_pages.at(-1),week_exact:true,sp_crosscheck:true,verification_status:'needs_review',source_document_ids:[],source_evidence:{textbook:false,meta:{main_sp:e.sp,complementary_sp:[],complementary_evidence:'',sp_focus:e.sp_focus,session_exact:true,page_route_verified:true,reviewed_lesson_id:e.id,reviewed_content_sha256:e.content_sha256,approval_manifest_sha256:data.manifest_sha256,verification_scope:'CANDIDATE_REQUIRES_LIVE_SOURCE_BINDING',source_limits:e.limits}}};}
function armLocal(data,{enabledIds}={}){if(!datasets.has(data))fail('UNVERIFIED_DATASET');if(!enabledIds?.length||enabledIds.some(i=>!data.entries.some(e=>e.id===i)))fail('EXPLICIT_ENABLED_IDS_REQUIRED');armed={data,enabledIds:new Set(enabledIds)};return {scope:'LOCAL_PILOT_ONLY',count:enabledIds.length};}
function disarm(){armed=null;}
function currentSelection(map,opts){
 if(!armed||subjectFor(map,opts?.subjectKey)!==armed.data.subject_key||Number(map.year)!==armed.data.year||Number(map.academic_year)!==armed.data.academic_year)return null;
 const blocked=armed.data.blocked_routes.find(r=>r.week===Number(map.week_no)&&r.session===Number(map.session_no));
 if(blocked)fail(blocked.status,blocked.reason);
 const e=entryFor(armed.data,map);if(!e)return null;
 if(!armed.enabledIds.has(e.id))fail('PILOT_ROUTE_NOT_ENABLED','Sesi ini belum dibuka dalam pilot; tiada fallback kepada blueprint lama.');
 return chosenContext(armed.data,map,opts);
}
function runtimeOptions(ctx){
 const time=String(ctx.lessonTime||''),m=time.match(/^(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})$/);
 let duration=null;
 if(m){const [h1,n1,h2,n2]=m.slice(1).map(Number);if(h1<24&&h2<24&&n1<60&&n2<60)duration=(h2*60+n2)-(h1*60+n1);}
 return {...ctx,duration,localPilot:false,confirmConditional:root.rphApprovedPreflight?.conditional===true,confirmSingingModel:root.rphApprovedPreflight?.singingModel===true};
}
function acceptedObjectivePair(ctx){const d=ctx?.approvedLibrary?.lesson;return !!d&&ctx.map.objective===d.objective&&ctx.map.success_criteria===flat(d.success_criteria);}
function renderContext(ctx,reflection={}){const escape=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));return '<article class="rph-preview">'+contextBlocks(ctx,reflection).map(b=>{const tag={title:'h1',subtitle:'p',h2:'h2',h3:'h3',label:'h4'}[b.kind]||'p';return '<'+tag+'>'+escape(b.text)+'</'+tag+'>';}).join('\\n')+'</article>'; }

root.RphApprovedLibrary={verifyDataset,loadDataset,select,materialize,chosenContext,contextBlocks,mapTemplate,armLocal,disarm,currentSelection,runtimeOptions,acceptedObjectivePair,renderContext,flat};
if(typeof module!=='undefined'&&module.exports)module.exports=root.RphApprovedLibrary;
})(typeof window!=='undefined'?window:globalThis);
