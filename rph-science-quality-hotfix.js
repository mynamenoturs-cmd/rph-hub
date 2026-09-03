(function(){
  'use strict';
  const norm=v=>String(v||'').replace(/\s+/g,' ').replace(/\s+([,.;:!?])/g,'$1').trim();
  const pageLabel=map=>Number(map?.textbook_page_start||0)?`Buku Teks m/s ${Number(map.textbook_page_start)}`:'Buku Teks';
  const subjectKey=map=>{try{return typeof window.rphSubjectKey==='function'?window.rphSubjectKey(map?.subject_id):''}catch{return ''}};
  const bad=v=>{const s=norm(v);return !s||/menunjukkan penguasaan SP|melalui tugasan|evidens yang selaras dengan SP|Kriteria kejayaan dicapai apabila|SP\s*\d+(?:\.\d+){1,2}/i.test(s)};
  function sourceTask(map,ev,built){
    const lines=[];
    String(map?.source_activities||'').split(/\n+/).forEach(x=>x&&lines.push(x));
    (built?.activities||[]).forEach(x=>x&&lines.push(x));
    const pageText=String((ev?.bt||[]).map(x=>x?.content||'').join(' ')||map?.source_evidence?.textbook?.text||'');
    let m=pageText.match(/\bAktiviti\s+([^.!?]{8,180}[.!?])/i);if(m)lines.unshift(m[1]);
    m=pageText.match(/\bBimbing\s+murid\s+([^.!?]{8,180}[.!?])/i);if(m)lines.unshift(m[1]);
    return norm(lines.map(x=>norm(x).replace(/^(?:BT|Buku\s*Teks)\s*(?:m\/s|ms)?\s*\d+\s*[:\-–]?\s*/i,'').replace(/^Murid\s+/i,'')).filter(x=>x.length>=8&&x.length<=190).sort((a,b)=>{
      const sa=/^(menyatakan|mengenal pasti|memerhati|mengelaskan|membandingkan|mengukur|merekod|meramal|membina|menyiasat|menjawab|melukis|menerangkan|menjelaskan)\b/i.test(a)?20:0;
      const sb=/^(menyatakan|mengenal pasti|memerhati|mengelaskan|membandingkan|mengukur|merekod|meramal|membina|menyiasat|menjawab|melukis|menerangkan|menjelaskan)\b/i.test(b)?20:0;
      return sb-sa||a.length-b.length;
    })[0]||'');
  }
  function sciencePair(map,task){
    const page=pageLabel(map),t=norm(task).replace(/[.!?]+$/,'');
    const hay=t.toLowerCase();
    if(/apakah yang dapat kamu perhatikan|perhatikan.*gambar|memerhati|pemerhatian/.test(hay))return{
      objective:`Pada akhir PdP, murid dapat membuat pemerhatian berdasarkan gambar pada ${page} dan menyatakan sekurang-kurangnya dua perkara yang diperhatikan dengan betul.`,
      criteria:`Murid dapat menyatakan sekurang-kurangnya dua pemerhatian yang boleh dikenal pasti terus daripada gambar pada ${page} tanpa menambah maklumat yang tiada pada sumber.`
    };
    const verb=/mengelaskan|kelaskan/.test(hay)?'mengelaskan':/membandingkan|bandingkan/.test(hay)?'membandingkan':/mengukur|ukur/.test(hay)?'mengukur':/merekod|rekod/.test(hay)?'merekod':/meramal|ramal/.test(hay)?'meramal':/mengenal pasti|kenal pasti/.test(hay)?'mengenal pasti':/membina model|bina model/.test(hay)?'membina model':/menyiasat|penyiasatan/.test(hay)?'menjalankan penyiasatan':/menjelaskan|menerangkan/.test(hay)?'menerangkan':'melaksanakan';
    return{
      objective:`Pada akhir PdP, murid dapat ${verb} tugasan sains “${t}” pada ${page} dengan betul berdasarkan bukti daripada aktiviti yang dijalankan.`,
      criteria:`Murid dapat melengkapkan tugasan pada ${page}, merekod atau menyatakan hasil yang diperlukan dan menunjukkan bukti yang sepadan dengan pemerhatian, data atau bahan yang digunakan.`
    };
  }
  const original=window.effectiveRphLessonMap;
  if(typeof original==='function')window.effectiveRphLessonMap=function(map,ev,built){
    const out=original(map,ev,built)||map;
    if(subjectKey(out)!=='science')return out;
    const task=sourceTask(out,ev,built);if(!task)return out;
    const pair=sciencePair(out,task);
    return {...out,objective:bad(out.objective)?pair.objective:out.objective,success_criteria:bad(out.success_criteria)?pair.criteria:out.success_criteria,_runtime_science_quality_repaired:true};
  };
  window.__RPH_SCIENCE_QUALITY_HOTFIX__={version:'2026-09-04a'};
  console.info('RPH Science quality hotfix active.');
})();
