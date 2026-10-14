// Feature-gated RPH Hub approval. Executed as a classic script after the
// canonical app; does not replace its renderer, save flow, or Classroom UI.
(function(root){
'use strict';
let active=false;
let busy=false;
const el=id=>document.getElementById(id);
function message(value,isError=false){
  const target=el('rphApprovalQueueStatus');
  if(!target)return;
  target.textContent=value;
  target.style.color=isError?'#b91c1c':'#0f766e';
}
function button(){
  if(!active)return;
  const actions=document.querySelector('#rphPreview .rph-action-grid');
  if(!actions||el('approveRphQueue'))return;
  const b=document.createElement('button');
  b.id='approveRphQueue';
  b.type='button';
  b.className='ghost';
  b.textContent='✓ LULUS & Arkib Word';
  b.addEventListener('click',approve);
  actions.appendChild(b);
  const note=document.createElement('p');
  note.id='rphApprovalQueueStatus';
  note.className='field-note';
  note.style.gridColumn='1 / -1';
  note.textContent='Simpan versi RPH terlebih dahulu, semak kandungan dan tekan LULUS apabila benar-benar diluluskan.';
  actions.appendChild(note);
}
async function api(method,path,token,payload){
  const result=await fetch(path,{
    method,
    headers:{authorization:'Bearer '+token,...(payload?{'content-type':'application/json'}:{})},
    ...(payload?{body:JSON.stringify(payload)}:{}),
    cache:'no-store',
    credentials:'same-origin'
  });
  const data=await result.json().catch(()=>({}));
  if(!result.ok||data.ok!==true){
    throw Error(String(data.error||'Sambungan integrasi gagal')+' (HTTP '+result.status+')');
  }
  return data;
}
async function verifySavedSnapshot(ctx){
  if(typeof state==='undefined'||!state.user||!state.connected)throw Error('Log masuk DELIMa diperlukan.');
  if(ctx.validation?.checks?.some(x=>!x.ok)||ctx.map?.verification_status!=='verified')
    throw Error('Accuracy Gate atau Lesson Map belum disahkan.');
  const saved=ctx.savedRecordVersion;
  if(!saved?.id||!saved?.snapshot_sha256)
    throw Error('Klik Simpan RPH dahulu supaya versi tidak boleh ditimpa direkodkan.');
  const record=window.RphRecordVersions;
  if(!record)throw Error('Modul versi RPH tidak tersedia.');
  const exportCtx=generatedRphExportContext(ctx);
  const reflection=currentReflectionData();
  const approved=window.RphApprovedLibrary;
  const exportBlocks=exportCtx.approvedLibrary&&approved?approved.contextBlocks(exportCtx,reflection):null;
  const exportLines=exportBlocks?exportBlocks.map(b=>b.text):buildRphExportLines(exportCtx);
  const preview=document.querySelector('#rphPreview')?.cloneNode(true);
  preview?.querySelectorAll('.no-print-export,button,input,select,textarea').forEach(n=>n.remove());
  const snapshot=record.snapshotFromContext(exportCtx,{
    teacherId:state.user.id,
    classInfo:getClass(exportCtx.classId),
    subjectInfo:getSubject(exportCtx.subjectId),
    reflection,exportLines,exportBlocks:exportBlocks||[],
    previewHtml:preview?.innerHTML||exportCtx.html||''
  });
  const hash=await record.sha256(record.stable(snapshot));
  if(hash!==saved.snapshot_sha256)
    throw Error('RPH telah berubah selepas disimpan. Klik Simpan RPH sekali lagi sebelum LULUS.');
  return {saved,hash};
}
async function bearer(){
  const session=await state.client.auth.getSession();
  const token=session?.data?.session?.access_token;
  if(!token)throw Error('Sesi login tamat. Sila log masuk semula.');
  return token;
}
function statusText(data){
  if(!data?.found)return 'Belum dihantar ke giliran Cloudflare.';
  const s=String(data.status||'UNKNOWN');
  if(s==='COMPLETED')return 'COMPLETED — salinan arkib telah dilaporkan berjaya. Sila sahkan pautan Word dalam Google Sheet.';
  if(s==='FAILED')return 'FAILED — '+String(data.error||'Semak Apps Script dan D1.').slice(0,160);
  if(s==='PENDING'||s==='PROCESSING')return s+' — menunggu/berjalan dalam Apps Script (setiap 10 minit).';
  return s;
}
async function approve(){
  if(busy)return;
  const ctx=state.currentGeneratedRph;
  if(!ctx){message('Jana RPH terlebih dahulu.',true);return;}
  busy=true;
  const btn=el('approveRphQueue');
  if(btn)btn.disabled=true;
  try{
    // No Google writes until the teacher explicitly confirms.
    const {saved,hash}=await verifySavedSnapshot(ctx);
    const token=await bearer();
    const path='/api/rph-approval?versionId='+encodeURIComponent(saved.id);
    const existing=await api('GET',path,token);
    if(existing.found){message(statusText(existing),existing.status==='FAILED');return;}
    const detail=[
      'Anda mengesahkan versi RPH yang telah disimpan.',
      'RPH: '+String(saved.id),
      'Fail Word akan dimuat naik ke Drive dan dihantar ke giliran arkib.',
      'Google Classroom Turn in TIDAK dilakukan.',
      '',
      'Teruskan kelulusan LULUS?'
    ].join('\n');
    if(!window.confirm(detail)){message('Kelulusan dibatalkan; tiada permintaan dihantar.');return;}
    message('Mengesahkan akaun Drive dan menyediakan Word…');
    const googleToken=await requestDriveToken('current');
    const about=await googleJson('https://www.googleapis.com/drive/v3/about?fields=user(emailAddress)',googleToken,{method:'GET'});
    if(String(about?.user?.emailAddress||'').toLowerCase()!==String(state.user.email||'').toLowerCase())
      throw Error('Akaun Drive bukan akaun DELIMa login semasa. Sambungkan akaun Google yang sama.');
    // Re-check once more before the irreversible Drive upload.
    await verifySavedSnapshot(ctx);
    const {file}=await ensureGeneratedRphDriveFile(ctx,googleToken);
    if(!/^[A-Za-z0-9_-]{15,}$/.test(String(file?.id||'')))
      throw Error('Muat naik Word tidak memulangkan ID fail yang sah.');
    message('Word tersedia di Drive. Menghantar kelulusan ke Cloudflare…');
    const queued=await api('POST','/api/rph-approval',token,{
      approvalPhrase:'LULUS',versionId:saved.id,
      snapshotSha256:hash,driveFile:file.id
    });
    message('Kelulusan diterima: '+queued.status+'. Arkib diproses melalui Apps Script. Semak Google Sheet untuk pautan akhir.');
  }catch(error){
    message('Kelulusan belum disahkan: '+String(error?.message||'Ralat tidak diketahui').slice(0,220),true);
  }finally{busy=false;if(btn)btn.disabled=false;}
}
async function enable(){
  try{
    const r=await fetch('/api/rph-approval',{cache:'no-store',credentials:'same-origin'});
    const data=await r.json();
    active=r.ok&&data?.enabled===true;
  }catch{active=false;}
  if(!active)return;
  const host=el('rphPreview');
  if(!host)return;
  const observer=new MutationObserver(button);
  observer.observe(host,{childList:true,subtree:true});
  button();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enable,{once:true});
else enable();
})(typeof window!=='undefined'?window:globalThis);
