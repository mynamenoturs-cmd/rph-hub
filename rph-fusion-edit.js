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
    if(el)return el;
    el=document.createElement('div');
    el.id='fusionPanel';
    el.className='fusion-panel hidden';
    el.innerHTML=`
      <div class="fusion-head"><b>🧠 Sunting dengan Fusion</b><button type="button" id="fusionClose" class="icon-btn" title="Tutup">✕</button></div>
      <label class="fusion-label">Arahan untuk RPH ini
        <textarea id="fusionInstruction" rows="3" placeholder="cth. Ringkaskan langkah PdP dan pastikan setiap langkah ada masanya. Kekalkan kod SK/SP."></textarea>
      </label>
      <div class="fusion-actions">
        <button type="button" id="fusionRun" class="primary">Minta suntingan</button>
        <button type="button" id="fusionApply" class="ghost" disabled>Guna hasil</button>
        <span id="fusionStatus" class="muted"></span>
      </div>
      <div id="fusionResult"></div>`;
    document.body.appendChild(el);
    return el;
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
    if(!host||host.classList.contains('hidden'))return toast('Jana RPH dahulu sebelum menyunting.');
    const instruction=document.getElementById('fusionInstruction').value.trim();
    if(!instruction)return toast('Masukkan arahan suntingan.');
    const status=document.getElementById('fusionStatus');
    const {blocks,nodes}=collect(host);
    if(!blocks.length)return toast('Tiada kandungan PdP untuk disunting dalam pratonton.');
    if(blocks.length>80)return toast('Terlalu banyak bahagian RPH untuk satu suntingan. Sila ringkaskan dahulu.');
    const t=await sessionToken();
    if(!t)return toast('Sesi DELIMa tidak dijumpai. Log masuk semula sebelum menyunting.');
    let batches;
    try{batches=splitBatches(blocks)}
    catch(e){return toast(e.message,6000)}
    const previous=state.currentGeneratedRph;
    const runButton=document.getElementById('fusionRun');
    const applyButton=document.getElementById('fusionApply');
    runButton.disabled=true;applyButton.disabled=true;
    lastResult=null;lastNodes=null;
    const merged={ok:true,blocks:blocks.map(b=>({...b})),changed:[],violations:[],ms:0};
    try{
      for(let i=0;i<batches.length;i++){
        const batch=batches[i];
        status.textContent='Menyunting bahagian '+(i+1)+'/'+batches.length+'…';
        const response=await fetch(BRIDGE,{
          method:'POST',
          headers:{'content-type':'application/json',authorization:'Bearer '+t},
          body:JSON.stringify({blocks:batch.blocks,instruction})
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
      }
      // Do not apply results to another newly-generated RPH.
      if(!host.isConnected||state.currentGeneratedRph!==previous)throw Error('RPH telah berubah semasa Fusion berjalan. Jana semula dan cuba lagi.');
      lastResult=merged;lastNodes=nodes;
      document.getElementById('fusionResult').innerHTML=renderDiff(host,merged,nodes);
      applyButton.disabled=!merged.changed.length;
      status.textContent=merged.changed.length+' bahagian berubah · '+Math.round(merged.ms/1000)+'s';
    }catch(e){
      status.textContent='';
      document.getElementById('fusionResult').innerHTML='<p class="fusion-bad">Gagal: '+esc(e.message)+'</p>';
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

    if(ready)toolbar();
    document.getElementById('fusionOpen')?.addEventListener('click',open);
    document.getElementById('fusionClose')?.addEventListener('click',close);
    document.getElementById('fusionRun')?.addEventListener('click',run);
    document.getElementById('fusionApply')?.addEventListener('click',apply);
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
  .fusion-actions{display:flex;gap:8px;align-items:center;margin:8px 0}
  .fusion-scroll{max-height:42vh;overflow:auto}
  .fusion-diff{width:100%;border-collapse:collapse;font-size:12px}
  .fusion-diff th,.fusion-diff td{border:1px solid #d6dee8;padding:6px;vertical-align:top;text-align:left}
  .fusion-diff th{background:#f1f5f9}
  .fusion-ok{color:#046c4e;font-size:12px}.fusion-bad{color:#a1121b;font-size:12px}
  @media(min-width:760px){.fusion-panel{left:50%;transform:translateX(-50%);width:720px}}`;
  document.head.appendChild(style);
})();
