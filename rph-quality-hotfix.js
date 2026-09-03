(function(){
  'use strict';

  function norm(v=''){return String(v||'').replace(/\s+/g,' ').replace(/\s+([,.;:!?])/g,'$1').trim()}
  function lowerFirst(v=''){const s=norm(v).replace(/[.!?]+$/,'');return s?s.charAt(0).toLowerCase()+s.slice(1):''}
  function subjectKey(map){try{return typeof window.rphSubjectKey==='function'?window.rphSubjectKey(map?.subject_id):''}catch{return ''}}
  function pageNo(map){return Number(map?.textbook_page_start||0)||null}
  function pageLabel(map,uiEn=false){const p=pageNo(map);return p?(uiEn?`Student's Book p. ${p}`:`Buku Teks m/s ${p}`):(uiEn?"Student's Book":'Buku Teks')}
  function evidenceText(map,ev=null){const direct=(ev?.bt||[]).map(x=>x?.content||'').filter(Boolean).join(' ');return norm(direct||map?.source_evidence?.textbook?.text||'')}
  function sourceLines(map,built=null){const lines=[];String(map?.source_activities||'').split(/\n+/).forEach(x=>{if(norm(x))lines.push(norm(x))});(built?.activities||[]).forEach(x=>{if(norm(x))lines.push(norm(x))});return [...new Set(lines)]}
  function stripSourcePrefix(v=''){
    return norm(v)
      .replace(/^(?:BT|Buku\s*Teks)\s*(?:m\/s|ms|p\.?|page)?\s*\d+(?:\s*[–-]\s*\d+)?\s*[:\-–]?\s*/i,'')
      .replace(/^(?:Student['’]?s\s+Book)\s*(?:p\.?|page)?\s*\d+(?:\s*[–-]\s*\d+)?\s*[:\-–]?\s*/i,'')
      .replace(/^Murid\s+/i,'').replace(/^Pupils?\s+/i,'').replace(/^Students?\s+/i,'').trim()
  }
  function instructionScore(v=''){
    const s=stripSourcePrefix(v);if(!s)return -999;let score=0;
    if(/^(?:menyatakan|mengenal pasti|menjelaskan|menerangkan|memadankan|menyusun|melengkapkan|menjawab|menulis|membina|menghasilkan|mengelaskan|membandingkan|mengukur|merekod|memerhati|membaca dan|membaca untuk|state|identify|explain|match|arrange|complete|answer|write|construct|produce|classify|compare|measure|record|observe|read and|read to)\b/i.test(s))score+=80;
    if(/\b(?:berdasarkan|menggunakan|daripada|based on|using|from)\b/i.test(s))score+=15;
    if(s.length>=18&&s.length<=150)score+=20;
    if(/[;]{1,}/.test(s))score-=35;if((s.match(/,/g)||[]).length>=3)score-=25;if(s.length>190)score-=45;
    if(/^membaca\s+[A-Z].{35,}[;,]/.test(s))score-=70;return score
  }
  function bookInstruction(map,ev=null,built=null){
    const text=evidenceText(map,ev),candidates=[];let m;
    const guided=/\bBimbing\s+murid\s+([^.!?]{8,180}[.!?])/gi;while((m=guided.exec(text)))candidates.push({text:m[1],score:120});
    const activity=/\bAktiviti\s+([^.!?]{8,180}[.!?])/gi;while((m=activity.exec(text)))candidates.push({text:m[1],score:110});
    sourceLines(map,built).forEach(line=>candidates.push({text:stripSourcePrefix(line),score:instructionScore(line)}));
    const best=candidates.map(x=>({text:norm(x.text).replace(/^murid\s+/i,'').replace(/^pupils?\s+/i,''),score:x.score+instructionScore(x.text)})).filter(x=>x.text.length>=8&&x.text.length<=190).sort((a,b)=>b.score-a.score)[0];
    return best?.text?norm(best.text).replace(/[.!?]+$/,''):''
  }
  function looksGeneratedObjective(v=''){
    const s=norm(v);if(!s)return true;
    if(/\bmenunjukkan\s+penguasaan\s+SP\b|\bmelalui\s+tugasan\b|\bevidens\s+yang\s+selaras\s+dengan\s+SP\b/i.test(s))return true;
    if(/\bSP\s*\d+(?:\.\d+){1,2}\b/i.test(s))return true;
    if(/sekurang-kurangnya\s+\d+\s+respons\s+yang\s+tepat/i.test(s))return true;
    if(/(?:membaca|read).{55,}[;].{20,}/i.test(s))return true;
    return s.length>220
  }
  function bmSkill(map,intent=''){
    const main=String(map?.source_evidence?.meta?.main_sp||map?.sp||'').trim(),first=Number((main.match(/^(\d+)/)||[])[1]||0);
    if(/pantun/i.test(intent))return'pantun';if(/sajak|syair/i.test(intent))return'puisi';if(first===1)return'oral';if(first===2)return'reading';if(first===3)return'writing';if(first===4)return'arts';if(first===5)return'grammar';return'general'
  }
  function bmObjectivePair(map,intent=''){
    const task=lowerFirst(intent);if(!task)return{objective:'',criteria:''};const page=pageLabel(map,false),skill=bmSkill(map,task);
    const ref=/\b(?:gambar|teks|petikan|pantun|sajak|cerita|dialog|jadual|bahan)\b/i.test(task)?` pada ${page}`:` berpandukan ${page}`;
    const objective=`Pada akhir PdP, murid dapat ${task}${ref} dengan betul.`;let criteria=`Murid dapat ${task} dengan betul berdasarkan bahan pada ${page}.`;
    if(skill==='pantun')criteria='Murid dapat menyatakan maksud pantun dengan kata sendiri dan memberikan sekurang-kurangnya satu bukti daripada gambar atau rangkap pantun untuk menyokong jawapan.';
    else if(skill==='reading')criteria=`Murid dapat melaksanakan tugasan bacaan dengan betul dan menunjukkan sekurang-kurangnya satu maklumat atau bahagian teks yang menyokong jawapan.`;
    else if(skill==='writing')criteria=`Murid dapat menghasilkan jawapan atau ayat yang menepati arahan pada ${page} serta menyemak ejaan dan tanda baca dengan betul.`;
    else if(skill==='oral')criteria=`Murid dapat memberikan respons lisan yang sesuai dengan konteks pada ${page} menggunakan sebutan yang jelas dan maklumat yang tepat.`;
    else if(skill==='grammar')criteria=`Murid dapat mengenal pasti atau menggunakan bentuk bahasa yang menjadi fokus pada ${page} dengan betul dalam konteks yang diberikan.`;
    return{objective,criteria}
  }
  function englishObjectivePair(map,intent=''){
    const task=lowerFirst(intent);if(!task)return{objective:'',criteria:''};const page=pageLabel(map,true);
    return{objective:`By the end of the lesson, pupils can ${task} using the source on ${page} accurately.`,criteria:`Pupils complete the source task accurately and give at least one answer or piece of evidence that can be checked against ${page}.`}
  }

  const originalEffective=window.effectiveRphLessonMap;
  if(typeof originalEffective==='function')window.effectiveRphLessonMap=function(map,ev,built){
    const out=originalEffective(map,ev,built)||map,key=subjectKey(out),intent=bookInstruction(out,ev,built);if(!intent)return out;
    const pair=key==='bm'?bmObjectivePair(out,intent):(key==='en'?englishObjectivePair(out,intent):null);if(!pair)return out;
    const badObjective=looksGeneratedObjective(out.objective),badCriteria=looksGeneratedObjective(out.success_criteria)||/\bKriteria kejayaan dicapai apabila\b/i.test(norm(out.success_criteria));
    if(!badObjective&&!badCriteria)return out;
    return{...out,objective:badObjective&&pair.objective?pair.objective:out.objective,success_criteria:(badCriteria||badObjective)&&pair.criteria?pair.criteria:out.success_criteria,_runtime_human_quality_repaired:true,_runtime_teaching_intent:intent}
  };

  function bmScripts(map,intent,levelKey='core'){
    const page=pageLabel(map,false),skill=bmSkill(map,intent),task=lowerFirst(intent),commonBbm=page;
    if(skill==='pantun'){
      const support=[{name:'Bacaan Pantun Berpandu',text:`Guru membimbing murid membaca pantun pada ${page} rangkap demi rangkap sambil meneliti gambar. Murid menyebut kata atau frasa penting yang membantu memahami maksud rangkap.`,bbm:`${commonBbm}; gambar pada halaman; kad kata kunci`,pak21:'Bacaan berpandu'},{name:'Padankan Maksud',text:'Murid memilih maksud yang sesuai dengan bantuan kad petunjuk, kemudian menyatakan jawapan menggunakan ayat mudah. Guru meminta murid menunjukkan gambar atau frasa pantun yang membantu mereka membuat pilihan.',bbm:`${commonBbm}; kad maksud; kad petunjuk`,pak21:'Match and Share'}];
      const core=[{name:'Baca dan Tafsir',text:`Secara berpasangan, murid membaca pantun pada ${page}, meneliti gambar dan berbincang tentang maksud setiap rangkap menggunakan kata sendiri.`,bbm:`${commonBbm}; gambar pada halaman`,pak21:'Pair Reading'},{name:'Buktikan Maksud',text:'Setiap pasangan menyatakan maksud pantun dan menunjukkan frasa atau gambar yang menyokong jawapan. Pasangan lain memberi respons ringkas sebelum guru membuat peneguhan.',bbm:commonBbm,pak21:'Think-Pair-Share'}];
      const challenge=[{name:'Tafsir Secara Kendiri',text:`Murid membaca pantun pada ${page} secara kendiri dan menulis atau menyatakan maksud rangkap menggunakan bahasa sendiri tanpa mengubah maksud asal.`,bbm:commonBbm,pak21:'Pembelajaran kendiri'},{name:'Jelaskan Bukti',text:'Murid memilih satu frasa atau gambar yang paling kuat menyokong tafsiran mereka dan menerangkan hubungannya dengan maksud pantun kepada rakan.',bbm:`${commonBbm}; kad bukti`,pak21:'Pemikiran kritis dan komunikasi'}];
      return levelKey==='support'?support:(levelKey==='challenge'?challenge:core)
    }
    if(skill==='reading'){
      const support=[{name:'Bacaan Berpandu',text:`Guru membimbing murid membaca bahagian yang diperlukan pada ${page} dan membantu murid mengenal pasti perkataan atau maklumat utama yang berkaitan dengan tugasan “${task}”.`,bbm:`${commonBbm}; kad kata kunci`,pak21:'Bacaan berpandu'},{name:'Jawab dengan Petunjuk',text:'Murid menjawab tugasan menggunakan kata kunci atau pilihan jawapan yang disediakan. Guru meminta murid menunjuk bahagian teks yang membantu mereka mendapatkan jawapan.',bbm:`${commonBbm}; kad petunjuk`,pak21:'Guided response'}];
      const core=[{name:'Baca dan Cari Maklumat',text:`Secara berpasangan, murid membaca bahan pada ${page} dan melaksanakan tugasan “${task}”. Murid menandakan maklumat yang benar-benar digunakan untuk menjawab.`,bbm:`${commonBbm}; penanda teks`,pak21:'Pair Reading'},{name:'Semak dengan Bukti',text:'Pasangan membandingkan jawapan dan menyemak semula bahagian teks yang menjadi bukti. Murid membetulkan jawapan jika bukti tidak menyokong respons asal.',bbm:commonBbm,pak21:'Pair Check'}];
      const challenge=[{name:'Baca Secara Kendiri',text:`Murid melaksanakan tugasan “${task}” pada ${page} secara kendiri dan memilih maklumat yang paling relevan untuk menyokong jawapan.`,bbm:commonBbm,pak21:'Pembelajaran kendiri'},{name:'Jelaskan Pilihan',text:'Murid menerangkan mengapa maklumat yang dipilih sesuai sebagai bukti dan membandingkan jawapan dengan seorang rakan sebelum membuat pembetulan akhir.',bbm:commonBbm,pak21:'Pemikiran kritis'}];
      return levelKey==='support'?support:(levelKey==='challenge'?challenge:core)
    }
    if(skill==='writing'){
      const support=[{name:'Bina Bersama Guru',text:`Guru menunjukkan satu contoh berdasarkan ${page}. Murid memilih perkataan penting dan melengkapkan rangka ayat sebelum menulis jawapan sendiri.`,bbm:`${commonBbm}; kad perkataan; rangka ayat`,pak21:'Modelling'},{name:'Semak Ayat',text:'Murid membaca semula ayat bersama guru dan menyemak susunan perkataan, ejaan serta tanda baca menggunakan senarai semak ringkas.',bbm:`${commonBbm}; senarai semak`,pak21:'Self-check'}];
      const core=[{name:'Fikir dan Tulis',text:`Murid meneliti bahan pada ${page}, memilih maklumat yang diperlukan dan melaksanakan tugasan “${task}” secara individu.`,bbm:commonBbm,pak21:'Think-Write'},{name:'Editor Pasangan',text:'Murid bertukar hasil dengan pasangan untuk menyemak sama ada ayat menepati arahan, ejaan dan tanda baca sebelum membuat pembetulan.',bbm:'hasil tulisan murid; senarai semak',pak21:'Peer Review'}];
      const challenge=[{name:'Tulis dan Kembangkan',text:`Murid melaksanakan tugasan “${task}” pada ${page} dan menambah satu maklumat yang relevan untuk menjadikan ayat lebih jelas atau lengkap.`,bbm:commonBbm,pak21:'Kreativiti'},{name:'Semak dan Terangkan',text:'Murid menyemak hasil sendiri kemudian menerangkan satu penambahbaikan yang dibuat dari segi isi atau bahasa.',bbm:'hasil tulisan murid; kad semak',pak21:'Pemikiran kritis'}];
      return levelKey==='support'?support:(levelKey==='challenge'?challenge:core)
    }
    const support=[{name:'Bimbingan Berfokus',text:`Guru memecahkan tugasan “${task}” pada ${page} kepada langkah pendek dan memberi satu contoh sebelum murid mencuba.`,bbm:`${commonBbm}; kad petunjuk`,pak21:'Bimbingan guru'},{name:'Cuba dengan Sokongan',text:'Murid melaksanakan tugasan dengan bantuan kata kunci, contoh atau soalan panduan yang sesuai dengan keperluan mereka.',bbm:`${commonBbm}; bahan sokongan`,pak21:'Pembelajaran terbeza'}];
    const core=[{name:'Laksanakan Tugasan Buku',text:`Murid melaksanakan tugasan “${task}” pada ${page} mengikut arahan sumber dan berbincang dengan pasangan apabila perlu.`,bbm:commonBbm,pak21:'Kolaborasi'},{name:'Semak Hasil',text:'Murid menyemak hasil dengan merujuk semula bahan yang sama dan membuat pembetulan sebelum berkongsi jawapan.',bbm:commonBbm,pak21:'Pair Check'}];
    const challenge=[{name:'Pengayaan',text:`Murid melaksanakan tugasan “${task}” pada ${page} secara kendiri kemudian menerangkan alasan atau strategi yang digunakan.`,bbm:commonBbm,pak21:'Pemikiran kritis'},{name:'Kongsi dan Pertahan Jawapan',text:'Murid berkongsi hasil dengan rakan dan mempertahankan jawapan menggunakan maklumat daripada sumber.',bbm:commonBbm,pak21:'Komunikasi'}];
    return levelKey==='support'?support:(levelKey==='challenge'?challenge:core)
  }

  const originalSourceSteps=window.rphSourceActivitySteps;
  if(typeof originalSourceSteps==='function')window.rphSourceActivitySteps=function(map,activities=[],page='',uiEn=false){
    if(subjectKey(map)!=='bm')return originalSourceSteps(map,activities,page,uiEn);const intent=bookInstruction(map,null,{activities});if(!intent)return originalSourceSteps(map,activities,page,uiEn);const ref=page||pageLabel(map,false);
    return[{key:'source-bm-true-task',name:'Aktiviti Buku Teks',text:`Murid ${lowerFirst(intent)} pada ${ref}.`,rawText:intent,bbm:ref,pak21:'',phase:'source'}]
  };

  const originalGeneral=window.rphGeneralSourceTaskText;
  if(typeof originalGeneral==='function')window.rphGeneralSourceTaskText=function(map,source,levelKey='core',uiEn=false){
    if(subjectKey(map)!=='bm')return originalGeneral(map,source,levelKey,uiEn);const intent=bookInstruction(map,null,{activities:[source?.text||'']})||stripSourcePrefix(source?.text||'');if(!intent)return originalGeneral(map,source,levelKey,uiEn);return bmScripts(map,intent,levelKey)[0]?.text||originalGeneral(map,source,levelKey,uiEn)
  };

  const originalGroupSteps=window.rphSourceFirstGroupSteps;
  if(typeof originalGroupSteps==='function')window.rphSourceFirstGroupSteps=function(map,sourceSteps=[],librarySteps=[],levelKey='core',uiEn=false){
    if(subjectKey(map)!=='bm')return originalGroupSteps(map,sourceSteps,librarySteps,levelKey,uiEn);const intent=bookInstruction(map,null,{activities:sourceSteps.map(x=>x?.rawText||x?.text||'')});if(!intent)return originalGroupSteps(map,sourceSteps,librarySteps,levelKey,uiEn);
    const main=bmScripts(map,intent,levelKey).map((x,i)=>({key:`human-bm-${levelKey}-${i+1}`,name:x.name,text:x.text,bbm:x.bbm,pak21:x.pak21,phase:'source'}));
    const extras=(librarySteps||[]).filter(x=>x?.key&&!String(x.key).startsWith('source-'));const variation=extras.find(x=>String(x.phase||'')==='game')||extras.find(x=>['sharing','evidence'].includes(String(x.phase||'')))||null;
    if(variation){let name=norm(variation.name||'Aktiviti Pengukuhan').replace(/^Variasi pilihan\s*[-–:]\s*/i,'').replace(/^Optional variation\s*[-–:]\s*/i,'');if(/^Ajar Semula$/i.test(name))name='Bimbingan Kumpulan Kecil';main.push({...variation,name})}
    return main.slice(0,3)
  };

  window.__RPH_HUMAN_QUALITY_HOTFIX__={version:'2026-09-04a',objectiveRepair:true,bmSourceTaskRewrite:true,generatedLabelsRemoved:true};
  console.info('RPH human-quality hotfix active.');
})();