// Sunting dengan Fusion — modul tambahan untuk RPH Hub.
// Dimuatkan selepas app-v03334-original.js (lihat app-v03334.js).
// TIDAK menulis ke pangkalan data: hasil suntingan hanya dipaparkan dalam pratonton
// sehingga guru tekan "Guna". Simpanan versi (append-only) ialah langkah berasingan.
(function(){
  if(window.__rphFusionEdit)return; window.__rphFusionEdit=true;

  const BRIDGE='/api/fusion/edit';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const toast=(m,ms=4000)=>{if(typeof window.toast==='function')return window.toast(m,ms);console.log('[fusion]',m)};

  function token(){
    // Fallback only when Supabase client session is not accessible.
    try{
      const ref=(location.origin,Object.keys(localStorage).find(k=>/^sb-.*-auth-token$/.test(k)));
      if(!ref)return null;
      const raw=JSON.parse(localStorage.getItem(ref)||'{}');
      return raw?.access_token||raw?.currentSession?.access_token||null;
    }catch{return null}
  }
  async function sessionToken(){
    try{ if(typeof state!=='undefined'&&state?.client){ const {data}=await state.client.auth.getSession(); if(data?.session?.access_token)return data.session.access_token; } }catch{}
    return token();
  }

  // Edit only the fields supported by RPH Hub's own edit/export mapping.
  // In particular, steps inside TABLE cells are intentionally included.
  // Immutable source/DSKP identifiers and textbook references are excluded.
  function collect(host){
    const nodes=[...host.querySelectorAll('[data-rph-edit]')].filter(el=>{
      const key=el.getAttribute('data-rph-edit')||'';
      return /^(objective|successCriteria|pbdMethod|pbdEvidence|pbdCriterion|inductionText|closure)$/.test(key)
        || /\.text$/.test(key) || /Fallback$/.test(key);
    });
    const blocks=nodes.map(node=>({
      kind:'p',
      text:String(node.innerText||node.textContent||'').replace(/\u00a0/g,' ').replace(/\s+/g,' ').trim()
    }));
    return {blocks,nodes};
  }

  function renderDiff(host,result,nodes){
    const before=nodes.map(n=>(n.textContent||'').replace(/\s+/g,' ').trim());
    const after=result.blocks.map(b=>b.text);
    const rows=result.changed.map(i=>`<tr><td>${i}</td><td>${esc(before[i]).slice(0,400)}</td><td>${esc(after[i]).slice(0,400)}</td></tr>`).join('');
    const viol=(result.violations||[]).length?`<p class="fusion-bad">Amaran: ${esc(result.violations.join(' · '))}</p>`:'<p class="fusion-ok">Tiada pelanggaran: kod SK/SP dan rujukan muka surat kekal.</p>';
    return `<h3>${result.changed.length} daripada ${after.length} blok berubah</h3>${viol}
      <div class="fusion-scroll"><table class="fusion-diff"><thead><tr><th>#</th><th>Sebelum</th><th>Selepas</th></tr></thead><tbody>${rows||'<tr><td colspan="3">Tiada perubahan.</td></tr>'}</tbody></table></div>`;
  }

  function panel(){
    let el=document.getElementById('fusionPanel');
    if(el){bindPanelControls(el);return el;}
    el=document.createElement('div');
    el.id='fusionPanel';
    el.className='fusion-panel hidden';
    el.innerHTML=`
      <div class="fusion-head"><b>🧠 Sunting dengan Fusion</b><button type="button" id="fusionClose" class="icon-btn" title="Tutup">✕</button></div>
      <label class="fusion-label">Arahan untuk RPH ini
        <textarea id="fusionInstruction" rows="3" placeholder="cth. Ringkaskan langkah PdP dan pastikan setiap langkah ada masanya. Kekalkan kod SK/SP."></textarea>
      </label>
      <div class="fusion-actions">
        <button type="button" id="fusionRun" class="primary">✨ Minta suntingan</button>
        <button type="button" id="fusionApply" class="ghost" disabled>Guna hasil</button>
      </div>
      <div class="fusion-progress" id="fusionProgress" data-state="idle" role="status" aria-live="polite">
        <span class="fusion-spinner" aria-hidden="true"></span>
        <span id="fusionStatus">Bersedia untuk menyunting RPH.</span>
      </div>
      <progress id="fusionProgressBar" class="fusion-progress-bar" max="1" value="0" hidden></progress>
      <div id="fusionResult"></div>`;
    document.body.appendChild(el);
    bindPanelControls(el);
    return el;
  }

  // The panel is created lazily. Handlers must be registered on its actual
  // buttons AFTER DOM insertion, not only once during boot.
  function bindPanelControls(el){
    if(el.dataset.fusionControlsBound==='1')return;
    el.querySelector('#fusionClose')?.addEventListener('click',close);
    el.querySelector('#fusionRun')?.addEventListener('click',run);
    el.querySelector('#fusionApply')?.addEventListener('click',apply);
    el.dataset.fusionControlsBound='1';
  }

  function setPhase(message,{busy=false,tone='info',done=0,total=1}={}){
    const parent=document.getElementById('fusionProgress');
    const text=document.getElementById('fusionStatus');
    const bar=document.getElementById('fusionProgressBar');
    if(text)text.textContent=message;
    if(parent)parent.dataset.state=busy?'busy':tone;
    if(bar){
      bar.max=Math.max(1,total);
      bar.value=Math.max(0,Math.min(done,total));
      bar.hidden=!busy;
    }
    const button=document.getElementById('fusionRun');
    if(button)button.textContent=busy?'⏳ Sedang menyunting…':'✨ Minta suntingan';
  }

  function showError(message){
    setPhase('Gagal: '+message,{tone:'error'});
    const result=document.getElementById('fusionResult');
    if(result)result.innerHTML='<p class="fusion-bad">'+esc(message)+'</p>';
  }

  function toolbar(){
    let bar=document.getElementById('fusionBar');
    if(bar)return bar;
    bar=document.createElement('div');
    bar.id='fusionBar';
    bar.className='fusion-bar';
    bar.innerHTML='<button type="button" id="fusionOpen" class="ghost">🧠 Sunting dengan Fusion</button>';
    const preview=document.getElementById('rphPreview');
    if(preview&&preview.parentElement)preview.parentElement.insertBefore(bar,preview);
    return bar;
  }

  let lastResult=null,lastNodes=null;

  function splitBatches(blocks){
    const batches=[];
    let offset=0;
    while(offset<blocks.length){
      const batch=[], start=offset;
      let chars=0;
      while(offset<blocks.length && batch.length<12){
        const next=blocks[offset];
        if(next.text.length>1800)throw Error('Satu bahagian RPH terlalu panjang untuk Fusion (lebih 1800 aksara). Sila pendekkan bahagian tersebut.');
        if(batch.length && chars+next.text.length>6500)break;
        batch.push(next);chars+=next.text.length;offset++;
      }
      batches.push({start,blocks:batch});
    }
    return batches;
  }

  async function run(){
    const host=document.getElementById('rphPreview');
    const instruction=document.getElementById('fusionInstruction')?.value.trim()||'';
    const runButton=document.getElementById('fusionRun');
    const applyButton=document.getElementById('fusionApply');
    const result=document.getElementById('fusionResult');
    if(!host||host.classList.contains('hidden'))return showError('Jana RPH dahulu sebelum menyunting.');
    if(!instruction)return showError('Sila masukkan arahan suntingan terlebih dahulu.');

    const {blocks,nodes}=collect(host);
    if(!blocks.length)return showError('Tiada kandungan PdP yang boleh disunting dalam pratonton.');
    if(blocks.length>80)return showError('RPH mempunyai terlalu banyak bahagian untuk satu suntingan.');
    let batches;
    try{batches=splitBatches(blocks)}
    catch(e){return showError(e.message||String(e));}

    // Visible immediately, before checking the teacher session or any network call.
    runButton.disabled=true;
    applyButton.disabled=true;
    lastResult=null;lastNodes=null;
    if(result)result.textContent='';
    setPhase('Menyemak sesi guru DELIMa…',{busy:true,done:0,total:batches.length});
    const previous=state.currentGeneratedRph;
    const merged={ok:true,blocks:blocks.map(b=>({...b})),changed:[],violations:[],ms:0};
    try{
      const t=await sessionToken();
      if(!t)throw Error('Sesi DELIMa tidak dijumpai. Log masuk semula sebelum menyunting.');
      for(let i=0;i<batches.length;i++){
        const batch=batches[i];
        setPhase('Fusion sedang menyunting bahagian '+(i+1)+' daripada '+batches.length+'…',{busy:true,done:i,total:batches.length});
        const response=await fetch(BRIDGE,{
          method:'POST',
          headers:{'content-type':'application/json',authorization:'Bearer '+t},
          body:JSON.stringify({blocks:batch.blocks,instruction}),
          signal:AbortSignal.timeout(90_000)
        });
        const data=await response.json().catch(()=>({}));
        if(!response.ok||!data.ok||!Array.isArray(data.blocks)||data.blocks.length!==batch.blocks.length){
          const detail=[data.error,data.detail].filter(Boolean).join(' — ');
          throw Error('HTTP '+response.status+': '+(detail||'Suntingan Fusion gagal.'));
        }
        for(let j=0;j<data.blocks.length;j++)merged.blocks[batch.start+j]=data.blocks[j];
        merged.changed.push(...(data.changed||[]).map(n=>n+batch.start));
        merged.violations.push(...(data.violations||[]).map(v=>String(v)));
        merged.ms+=Number(data.ms)||0;
        setPhase('Selesai bahagian '+(i+1)+' daripada '+batches.length+'.',{busy:true,done:i+1,total:batches.length});
      }
      if(!host.isConnected||state.currentGeneratedRph!==previous)throw Error('RPH telah berubah semasa Fusion berjalan. Jana semula dan cuba lagi.');
      lastResult=merged;lastNodes=nodes;
      if(result)result.innerHTML=renderDiff(host,merged,nodes);
      applyButton.disabled=!merged.changed.length;
      setPhase(merged.changed.length
        ? 'Selesai! '+merged.changed.length+' bahagian berubah. Semak dahulu, kemudian tekan Guna hasil.'
        : 'Selesai, tetapi tiada teks berubah. Cuba arahan yang lebih khusus.',
        {tone:merged.changed.length?'success':'info'});
    }catch(e){
      const raw=e?.name==='TimeoutError'||e?.name==='AbortError'
        ? 'Permintaan Fusion mengambil masa terlalu lama. Cuba sunting bahagian lebih pendek.'
        : e?.message||String(e);
      showError(raw);
    }finally{
      runButton.disabled=false;
    }
  }

  function apply(){
    if(!lastResult||!lastNodes)return;
    const host=document.getElementById('rphPreview');
    if(!host||lastNodes.some(el=>!host.contains(el))){
      return toast('Pratonton sudah berubah. Jalankan suntingan Fusion semula.');
    }
    const ctx=state.currentGeneratedRph;
    if(!ctx)return toast('Tiada RPH aktif.');

    // Approved library is immutable. An explicit teacher choice makes
    // an editable new draft from it, preserving the canonical library.
    if(ctx.approvedLibrary || host.hasAttribute('data-approved-rph')){
      if(!window.confirm(
        'RPH asal ialah kandungan diluluskan dan dikunci. Cipta salinan DRAF baharu untuk menggunakan suntingan Fusion? RPH asal tidak berubah.'
      ))return;
      if(typeof generatedRphEditableSnapshot==='function'){
        ctx.editBaseline=generatedRphEditableSnapshot();
      }
      delete ctx.approvedLibrary;
      ctx.edited={};
      ctx.fusionDraftFromApproved=true;
      host.removeAttribute('data-approved-rph');
      const edit=document.getElementById('editGeneratedRph');
      if(edit){edit.disabled=false;edit.textContent='✏️ Edit Draf RPH';}
    }else if(!ctx.editBaseline && typeof generatedRphEditableSnapshot==='function'){
      ctx.editBaseline=generatedRphEditableSnapshot();
    }

    lastResult.blocks.forEach((block,i)=>{
      const node=lastNodes[i];
      if(!node || !host.contains(node))return;
      const old=String(node.innerText||node.textContent||'').replace(/\s+/g,' ').trim();
      if(old!==block.text)node.textContent=block.text;
    });
    if(typeof syncGeneratedRphEdits==='function')syncGeneratedRphEdits();
    document.getElementById('fusionApply').disabled=true;
    toast('Suntingan digunakan pada DRAF. Semak dan tekan Simpan untuk rekod versi baharu.',6000);
  }

  function open(){
    const p=panel(); p.classList.remove('hidden');
    document.getElementById('fusionInstruction').focus();
  }
  function close(){ document.getElementById('fusionPanel')?.classList.add('hidden'); }

  async function boot(){
    // tunjuk butang hanya jika jambatan FUSION benar-benar bersambung
    let ready=false;
    try{
      const r=await fetch('/api/fusion/health',{headers:{}});
      const j=await r.json().catch(()=>({}));
      ready=Boolean(r.ok&&j.ok);
      if(!ready)console.log('[fusion] jambatan belum bersedia:',j?.error||r.status);
    }catch(e){console.log('[fusion] jambatan tidak dapat dihubungi:',e.message)}

    if(ready){
      toolbar();
      panel(); // ensure the hidden panel and its event handlers already exist
      document.getElementById('fusionOpen')?.addEventListener('click',open);
    }
    // tunjuk bar hanya bila pratonton RPH wujud
    const preview=document.getElementById('rphPreview');
    if(preview){
      new MutationObserver(()=>{
        const bar=document.getElementById('fusionBar');
        if(!bar)return;
        bar.style.display=preview.classList.contains('hidden')?'none':'flex';
      }).observe(preview,{attributes:true,attributeFilter:['class']});
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();

  const style=document.createElement('style');
  style.textContent=`
  .fusion-bar{display:flex;gap:8px;margin:10px 0;justify-content:flex-end}
  .fusion-panel{position:fixed;inset:auto 12px 12px 12px;max-height:78vh;overflow:auto;background:#fff;color:#111;border:1px solid #c9d3e0;border-radius:14px;box-shadow:0 18px 48px rgba(9,20,38,.28);padding:14px;z-index:9999}
  .fusion-panel.hidden{display:none}
  .fusion-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
  .fusion-label{display:block;font-size:13px;font-weight:600;margin-bottom:6px}
  .fusion-label textarea{width:100%;font:inherit;padding:8px;border:1px solid #c9d3e0;border-radius:8px}
  .fusion-actions{display:flex;gap:8px;align-items:center;margin:8px 0;flex-wrap:wrap}
  .fusion-actions button:disabled{opacity:.55;cursor:wait}
  .fusion-progress{display:flex;align-items:center;gap:9px;padding:10px 12px;border:1px solid #cbd5e1;background:#f8fafc;border-radius:9px;font-size:13px;line-height:1.4;margin:8px 0}
  .fusion-progress[data-state=busy]{border-color:#38bdf8;background:#eff6ff;color:#0c4a6e}
  .fusion-progress[data-state=error]{border-color:#fca5a5;background:#fef2f2;color:#991b1b}
  .fusion-progress[data-state=success]{border-color:#86efac;background:#f0fdf4;color:#166534}
  .fusion-spinner{display:none;width:16px;height:16px;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;flex-shrink:0;animation:fusionSpin .85s linear infinite}
  .fusion-progress[data-state=busy] .fusion-spinner{display:inline-block}
  .fusion-progress-bar{display:block;width:100%;height:9px;accent-color:#0284c7;margin-bottom:12px}
  .fusion-progress-bar[hidden]{display:none}
  @keyframes fusionSpin{to{transform:rotate(360deg)}}
  .fusion-scroll{max-height:42vh;overflow:auto}
  .fusion-diff{width:100%;border-collapse:collapse;font-size:12px}
  .fusion-diff th,.fusion-diff td{border:1px solid #d6dee8;padding:6px;vertical-align:top;text-align:left}
  .fusion-diff th{background:#f1f5f9}
  .fusion-ok{color:#046c4e;font-size:12px}.fusion-bad{color:#a1121b;font-size:12px}
  @media(min-width:760px){.fusion-panel{left:50%;transform:translateX(-50%);width:720px}}`;
  document.head.appendChild(style);
})();
