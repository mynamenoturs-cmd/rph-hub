(function(root){
'use strict';
const SCHEMA='rph-record-snapshot-v1',BACKUP_SCHEMA='rph-version-backup-v1';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,HASH=/^[0-9a-f]{64}$/;
const clone=x=>JSON.parse(JSON.stringify(x));
function stable(v){
 if(v===null||typeof v!=='object')return JSON.stringify(v);
 if(Array.isArray(v))return '['+v.map(x=>stable(x)??'null').join(',')+']';
 return '{'+Object.keys(v).filter(k=>v[k]!==undefined).sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')+'}';
}
async function sha256(text){
 if(!root.crypto?.subtle)throw Error('Kriptografi pelayar tidak tersedia; simpanan dihentikan.');
 const data=typeof text==='string'?new TextEncoder().encode(text):text;
 return [...new Uint8Array(await root.crypto.subtle.digest('SHA-256',data))].map(x=>x.toString(16).padStart(2,'0')).join('');
}
function validDate(s){return typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s+'T12:00:00Z'))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;}
function invariant(ok,message){if(!ok)throw Error(message);}
function validateSnapshot(s){
 invariant(s?.schema===SCHEMA,'Skema snapshot tidak sepadan.');
 const c=s.context||{};
 for(const k of ['teacher_id','class_id','subject_id','lesson_map_id'])invariant(UUID.test(c[k]||''),'ID konteks tidak sah: '+k);
 invariant(validDate(c.lesson_date),'Tarikh pengajaran tidak sah.');
 invariant(Number.isInteger(c.academic_year)&&c.academic_year>=2000&&c.academic_year<=2200,'Tahun akademik tidak sah.');
 invariant(Number.isInteger(c.week_no)&&c.week_no>=1&&c.week_no<=53,'Minggu tidak sah.');
 invariant(Number.isInteger(c.session_no)&&c.session_no>=1&&c.session_no<=10,'Sesi tidak sah; jangan mereka sesi rekod lama.');
 invariant(typeof c.title==='string'&&c.title.trim(),'Tajuk diperlukan.');
 invariant(Array.isArray(s.export_lines)&&s.export_lines.length>0&&s.export_lines.every(x=>typeof x==='string'),'Snapshot eksport lengkap diperlukan.');
 invariant(s.reflection&&typeof s.reflection==='object'&&!Array.isArray(s.reflection),'Refleksi snapshot diperlukan.');
 if(s.export_blocks)invariant(s.export_blocks.every(b=>b&&typeof b.text==='string'),'Blok eksport tidak sah.');
 for(const k of ['library_content_sha256','approval_manifest_sha256'])if(s.provenance?.[k])invariant(HASH.test(s.provenance[k]),'Format hash provenance tidak sah: '+k);
 return s;
}
function slotKey(c){return [c.teacher_id,c.class_id,c.subject_id,c.lesson_date,c.academic_year,c.week_no,c.session_no].join('|');}
async function payloadFor(snapshot,requestId=root.crypto.randomUUID(),extra={}){
 const s=clone(validateSnapshot(snapshot)),c=s.context,p=s.provenance||{},snapshotText=stable(s);
 invariant(UUID.test(requestId),'ID permintaan tidak sah.');
 return {teacher_id:c.teacher_id,class_id:c.class_id,subject_id:c.subject_id,lesson_date:c.lesson_date,academic_year:c.academic_year,week_no:c.week_no,session_no:c.session_no,lesson_map_id:c.lesson_map_id,source_mapping_key:p.source_mapping_key||'',library_version:p.library_version||null,library_content_sha256:p.library_content_sha256||null,approval_manifest_sha256:p.approval_manifest_sha256||null,snapshot_schema:SCHEMA,snapshot:s,snapshot_text:snapshotText,snapshot_sha256:await sha256(snapshotText),request_id:requestId,parent_version_id:extra.parent_version_id||null,legacy_record_id:extra.legacy_record_id||null};
}
async function verifyRecord(r){
 invariant(r&&UUID.test(r.id||'')&&HASH.test(r.snapshot_sha256||''),'Rekod versi tidak sah.');
 invariant(typeof r.snapshot_text==='string'&&await sha256(r.snapshot_text)===r.snapshot_sha256,'Hash snapshot tidak sepadan.');
 const s=JSON.parse(r.snapshot_text);validateSnapshot(s);
 invariant(stable(s)===stable(r.snapshot),'Snapshot JSON dan teks tidak sepadan.');
 for(const k of ['teacher_id','class_id','subject_id','lesson_date','academic_year','week_no','session_no','lesson_map_id'])invariant(r[k]===s.context[k],'Konteks rekod bercanggah: '+k);
 invariant(Number.isInteger(r.revision_no)&&r.revision_no>0,'Nombor versi tidak sah.');
 invariant(UUID.test(r.request_id||''),'ID permintaan rekod tidak sah.');
 for(const k of ['source_mapping_key','library_version','library_content_sha256','approval_manifest_sha256'])invariant((r[k]||'')===(s.provenance?.[k]||''),'Provenance rekod bercanggah: '+k);
 return clone(r);
}
async function appendRemote(client,payload){
 invariant(client&&typeof client.rpc==='function','Sambungan database berautentikasi diperlukan.');
 const response=await client.rpc('save_rph_record_version',{p_payload:payload});
 if(response.error){const msg=response.error.message||String(response.error);throw Error('Simpan versi gagal; rekod lama tidak ditulis semula. Pastikan migrasi versi telah dipasang. '+msg);}
 const receipt=Array.isArray(response.data)?response.data[0]:response.data;
 invariant(receipt&&UUID.test(receipt.id||''),'Database tidak memulangkan ID versi; kejayaan belum disahkan.');
 // Read the exact target before reporting a successful write.
 const back=await client.from('rph_record_versions').select('*').eq('id',receipt.id).eq('teacher_id',payload.teacher_id).single();
 if(back.error||!back.data)throw Error('Simpanan mungkin telah diterima, tetapi bacaan balik gagal. Cuba semula dengan permintaan yang sama; jangan anggap berjaya.');
 const row=await verifyRecord(back.data);
 invariant(row.snapshot_sha256===payload.snapshot_sha256&&row.snapshot_text===payload.snapshot_text,'Snapshot bacaan balik berbeza daripada yang dihantar.');
 for(const k of ['teacher_id','class_id','subject_id','lesson_date','academic_year','week_no','session_no','lesson_map_id'])invariant(row[k]===payload[k],'Bacaan balik salah sasaran: '+k);
 return row;
}
function snapshotFromContext(ctx,options={}){
 if(ctx?.frozenRecordSnapshot)return clone(validateSnapshot(ctx.frozenRecordSnapshot));
 invariant(ctx?.map,'Konteks RPH diperlukan.');
 const m=ctx.map,c=options.classInfo||{},sub=options.subjectInfo||{};
 const source=ctx.approvedLibrary||{},reflection=clone(options.reflection||{total:null,present:null,achieved:null,active:null,note:'',text:''});
 return validateSnapshot({schema:SCHEMA,context:{teacher_id:options.teacherId,class_id:ctx.classId,subject_id:ctx.subjectId,lesson_date:ctx.date,academic_year:Number(c.academic_year||m.academic_year),week_no:Number(ctx.week),session_no:Number(m.session_no),lesson_map_id:m.id,title:m.title||'',teacher_name:ctx.teacherName||'',class_name:c.name||'',subject_name:sub.name||'',lesson_time:ctx.lessonTime||''},map:clone(m),lesson:source.lesson?clone(source.lesson):null,pedagogy:clone(ctx.pedagogy||{}),activities:clone(ctx.activities||[]),edited_snapshot:clone(ctx.edited||{}),export_lines:clone(options.exportLines||[]),export_blocks:clone(options.exportBlocks||[]),preview_html:String(options.previewHtml||ctx.html||''),reflection,provenance:{source_mapping_key:source.id||m.source_evidence?.meta?.source_mapping_key||'',library_version:source.version||null,library_content_sha256:source.content_sha256||null,approval_manifest_sha256:source.manifest_sha256||null,approval_status:source.approval_status||'NOT_ASSERTED',source_limits:clone(source.limits||{}),capture_kind:'FULL_DISPLAYED_CONTENT_NOT_LIVE_POINTERS'}});
}
function openLocal(name='rph-safe-pilot-local-v1'){
 invariant(root.indexedDB,'IndexedDB tidak tersedia. Gunakan muat turun; jangan anggap rekod telah disimpan.');
 return new Promise((resolve,reject)=>{const req=root.indexedDB.open(name,1);req.onerror=()=>reject(req.error);req.onblocked=()=>reject(Error('Storan terkunci oleh tab lain.'));req.onupgradeneeded=()=>{const db=req.result;const s=db.createObjectStore('versions',{keyPath:'id'});s.createIndex('slot','slot_key');s.createIndex('owner','teacher_id');s.createIndex('request','request_key',{unique:true});s.createIndex('slot_revision',['slot_key','revision_no'],{unique:true});};req.onsuccess=()=>resolve(localStore(req.result));});
}
function localStore(db){
 function query(mode,fn){return new Promise((resolve,reject)=>{const tx=db.transaction('versions',mode),store=tx.objectStore('versions');let value,error;tx.oncomplete=()=>resolve(value);tx.onerror=()=>reject(error||tx.error);tx.onabort=()=>reject(error||tx.error||Error('Transaksi storan dibatalkan.'));try{fn(store,tx,v=>{value=v},e=>{error=e;tx.abort()});}catch(e){error=e;tx.abort();}});}
 async function get(id,owner){invariant(UUID.test(owner),'Pemilik diperlukan.');const row=await query('readonly',(s,t,done)=>{const q=s.get(id);q.onsuccess=()=>done(q.result);});invariant(row&&row.teacher_id===owner,'Rekod tidak ditemui untuk pemilik ini.');return verifyRecord(row);}
 async function list(owner){invariant(UUID.test(owner),'Pemilik diperlukan.');const rows=await query('readonly',(s,t,done)=>{const q=s.index('owner').getAll(owner);q.onsuccess=()=>done(q.result);});for(const r of rows)await verifyRecord(r);return rows.sort((a,b)=>a.created_at.localeCompare(b.created_at)||a.revision_no-b.revision_no);}
 async function append(snapshot,requestId,extra={}){
  const p=await payloadFor(snapshot,requestId,extra),slot=slotKey(p),request=p.teacher_id+'|'+p.request_id;
  const row=await query('readwrite',(store,tx,done,fail)=>{const old=store.index('request').get(request);old.onsuccess=()=>{if(old.result){if(old.result.snapshot_sha256!==p.snapshot_sha256||old.result.slot_key!==slot)return fail(Error('ID permintaan telah digunakan untuk kandungan berbeza.'));done(old.result);return;}
   const q=store.index('slot').getAll(slot);q.onsuccess=()=>{const previous=q.result.sort((a,b)=>b.revision_no-a.revision_no)[0];if(previous?.snapshot_sha256===p.snapshot_sha256){done(previous);return;}
    if(p.parent_version_id&&p.parent_version_id!==previous?.id)return fail(Error('Versi asas telah berubah; semak sejarah sebelum menyimpan.'));
    const r={...p,id:root.crypto.randomUUID(),revision_no:(previous?.revision_no||0)+1,parent_version_id:previous?.id||null,slot_key:slot,request_key:request,created_at:new Date().toISOString(),storage_scope:'LOCAL_PILOT_ONLY'};
    const add=store.add(r);add.onsuccess=()=>done(r);
   };
  };});
  return get(row.id,p.teacher_id);
 }
 async function backup(owner){const rows=await list(owner),payload={schema:BACKUP_SCHEMA,owner,scope:'LOCAL_PILOT_ONLY_NOT_PRODUCTION_BACKUP',records:rows};return {...payload,created_at:new Date().toISOString(),payload_sha256:await sha256(stable(payload))};}
 async function restore(backup,owner){
  invariant(backup?.schema===BACKUP_SCHEMA&&backup.owner===owner,'Sandaran salah skema atau pemilik.');
  const payload={schema:backup.schema,owner:backup.owner,scope:backup.scope,records:backup.records};
  invariant(HASH.test(backup.payload_sha256||'')&&await sha256(stable(payload))===backup.payload_sha256,'Hash sandaran tidak sepadan.');
  invariant(Array.isArray(backup.records)&&new Set(backup.records.map(r=>r.id)).size===backup.records.length,'ID sandaran berganda.');
  for(const r of backup.records){await verifyRecord(r);invariant(r.teacher_id===owner&&r.slot_key===slotKey(r)&&r.request_key===owner+'|'+r.request_id,'Pemilik/slot sandaran bercanggah.');}
  await query('readwrite',(store,tx,done,fail)=>{let n=0;if(!backup.records.length){done(0);return;}
   for(const row of backup.records){const q=store.get(row.id);q.onsuccess=()=>{if(q.result){if(stable(q.result)!==stable(row))return fail(Error('Pemulihan akan menimpa rekod berbeza; dihentikan.'));}else store.add(clone(row));n++;if(n===backup.records.length)done(n);};}
  });
  const restored=await list(owner);for(const r of backup.records)invariant(restored.some(x=>x.id===r.id&&stable(x)===stable(r)),'Bacaan balik pemulihan gagal.');return {verified_records:backup.records.length};
 }
 return {append,get,list,backup,restore,close:()=>db.close()};
}
async function listRemote(client,owner){
 invariant(UUID.test(owner),'Pemilik diperlukan.');const rows=[];const size=200;
 for(let start=0;;start+=size){const result=await client.from('rph_record_versions').select('*').eq('teacher_id',owner).order('created_at',{ascending:false}).order('id',{ascending:false}).range(start,start+size-1);if(result.error)throw Error(result.error.message||'Bacaan sejarah gagal');const part=result.data||[];rows.push(...part);if(part.length<size)break;}
 invariant(new Set(rows.map(x=>x.id)).size===rows.length,'Sejarah berubah semasa bacaan; cuba semula.');for(const r of rows){invariant(r.teacher_id===owner,'Pemilik sejarah bercanggah.');await verifyRecord(r);}return rows;
}
function legacyView(row){
 // Do not invent missing session numbers, phases, reflections or original HTML.
 return {origin:'LEGACY_UNCHANGED',id:row.id,teacher_id:row.teacher_id,class_id:row.class_id,subject_id:row.subject_id,lesson_date:row.lesson_date,week_no:row.week_no||null,session_no:row.session_no??row.rph_json?.session_no??null,revision_no:null,raw:clone(row),reconstructable_full_snapshot:false};
}
function latestForActivityHistory(rows){const by=new Map();for(const r of rows){const k=slotKey(r);if(!by.has(k)||r.revision_no>by.get(k).revision_no)by.set(k,r);}return [...by.values()].map(r=>({id:r.id,origin:'VERSION',subject_id:r.subject_id,class_id:r.class_id,lesson_date:r.lesson_date,lesson_map_id:r.lesson_map_id,week_no:r.week_no,session_no:r.session_no,rph_json:{activities:r.snapshot.activities||[],activity_library_keys:r.snapshot.provenance?.source_mapping_key?[r.snapshot.provenance.source_mapping_key]:[],reflection:r.snapshot.reflection,version_snapshot:r.snapshot},created_at:r.created_at}));}
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function renderSnapshot(snapshot){const s=validateSnapshot(snapshot);const bs=s.export_blocks?.length?s.export_blocks:s.export_lines.map(text=>({kind:'p',text}));return '<article class="frozen-rph" data-frozen-snapshot="1">'+bs.map(b=>{const tag={title:'h1',h2:'h2',h3:'h3',label:'h4'}[b.kind]||'p';return '<'+tag+'>'+esc(b.text)+'</'+tag+'>';}).join('\n')+'</article>';}
async function docxFromSnapshot(snapshot,Zip=root.JSZip){
 const s=validateSnapshot(snapshot);invariant(Zip,'JSZip diperlukan untuk eksport Word.');const z=new Zip(),bs=s.export_blocks?.length?s.export_blocks:s.export_lines.map(text=>({kind:'p',text}));
 const body=bs.map(b=>{const heading=['title','h2','h3','label'].includes(b.kind);return '<w:p><w:pPr><w:spacing w:after="100"/>'+(heading?'<w:keepNext/>':'')+'</w:pPr><w:r><w:rPr>'+(heading?'<w:b/>':'')+'<w:sz w:val="'+(b.kind==='title'?30:22)+'"/></w:rPr><w:t xml:space="preserve">'+esc(b.text)+'</w:t></w:r></w:p>';}).join('');
 z.file('[Content_Types].xml','<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
 z.file('_rels/.rels','<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
 z.file('word/document.xml','<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>'+body+'<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="900" w:right="950" w:bottom="900" w:left="950"/></w:sectPr></w:body></w:document>');
 return z.generateAsync({type:'blob',mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',compression:'DEFLATE'});
}
function exportName(snapshot,revision=null){const c=validateSnapshot(snapshot).context;return ['RPH',c.subject_name||'Subjek',c.class_name||'Kelas','M'+c.week_no,'S'+c.session_no,c.lesson_date,revision?'V'+revision:'DRAF'].join('_').replace(/[^A-Za-z0-9._-]+/g,'_')+'.docx';}
function downloadBlob(blob,name){invariant(root.document,'Pelayar diperlukan untuk muat turun.');const a=root.document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=name;root.document.body.appendChild(a);a.click();a.remove();root.setTimeout(()=>URL.revokeObjectURL(url),30000);}
root.RphRecordVersions={SCHEMA,BACKUP_SCHEMA,stable,sha256,clone,validDate,validateSnapshot,slotKey,payloadFor,verifyRecord,snapshotFromContext,appendRemote,listRemote,openLocal,legacyView,latestForActivityHistory,renderSnapshot,docxFromSnapshot,exportName,downloadBlob};
if(typeof module!=='undefined'&&module.exports)module.exports=root.RphRecordVersions;
})(typeof window!=='undefined'?window:globalThis);
