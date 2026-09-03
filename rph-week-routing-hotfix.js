(function(){
  'use strict';

  const DATE_TOKEN_RE=/\b(?:\d{1,2}[.\/-]\d{1,2}[.\/-]\d{4}|\d{4}-\d{1,2}-\d{1,2})\b/g;

  function parseDateToken(v=''){
    if(typeof window!=='undefined'&&typeof window.parseRptDateToken==='function')return window.parseRptDateToken(v);
    const t=String(v||'').trim();let m;
    if((m=t.match(/^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})$/))){const [,d,mo,y]=m;return `${y}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}`}
    if((m=t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/))){const [,y,mo,d]=m;return `${y}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}`}
    return null;
  }

  function plausibleWeeklyRange(start,end){
    if(!start||!end||start>end)return false;
    const a=new Date(`${start}T00:00:00`),b=new Date(`${end}T00:00:00`);
    if(Number.isNaN(a.getTime())||Number.isNaN(b.getTime()))return false;
    const days=Math.round((b-a)/86400000);
    return days>=0&&days<=10;
  }

  function weekMarkers(src){
    const markers=[];
    const push=(week,index,kind)=>{
      week=Number(week);
      if(!Number.isInteger(week)||week<1||week>53)return;
      if(markers.some(x=>Math.abs(x.index-index)<3&&x.week===week))return;
      markers.push({week,index,kind});
    };

    const explicit=/\b(?:MINGGU|WEEK)\s*(\d{1,2})\b/gmi;let m;
    while((m=explicit.exec(src)))push(m[1],m.index,'label');

    // Sesetengah RPT murni menggunakan nombor minggu berdiri sendiri,
    // contoh: "9\n09.03.2026 - 13.03.2026".
    const bare=/(?:^|\n)[ \t]*(\d{1,2})[ \t]*(?=\n)/gm;
    while((m=bare.exec(src))){
      const week=Number(m[1]);if(week<1||week>53)continue;
      const after=src.slice(bare.lastIndex,Math.min(src.length,bare.lastIndex+420));
      const firstMeaningful=after.replace(/^[\s\n]+/,'');
      const startsWithDates=/^(?:\d{1,2}[.\/-]\d{1,2}[.\/-]\d{4}|\d{4}-\d{1,2}-\d{1,2})\b/.test(firstMeaningful);
      const groupLike=/^(?:Kump(?:ulan)?|Group)\s*A\s*:/i.test(firstMeaningful);
      const dates=[...after.matchAll(DATE_TOKEN_RE)].slice(0,4).map(x=>parseDateToken(x[0])).filter(Boolean);
      if((startsWithDates||groupLike)&&dates.length>=2)push(week,m.index,'bare');
    }
    return markers.sort((a,b)=>a.index-b.index);
  }

  function extractRptWeekRangesHotfix(text='',doc=null){
    const src=String(text||'').replace(/\r/g,'\n');
    const markers=weekMarkers(src),out=[];
    markers.forEach((mk,i)=>{
      const block=src.slice(mk.index,markers[i+1]?.index??Math.min(src.length,mk.index+1800));
      const b=block.search(/(?:Kump(?:ulan)?|Group)\s*B\s*:/i);
      let scope=b>=0?block.slice(b):block;
      if(scope.length>900)scope=scope.slice(0,900);
      let dates=[...scope.matchAll(DATE_TOKEN_RE)].map(x=>parseDateToken(x[0])).filter(Boolean);
      if(dates.length<2)dates=[...block.matchAll(DATE_TOKEN_RE)].map(x=>parseDateToken(x[0])).filter(Boolean);
      const start=dates[0],end=dates[1];
      if(!plausibleWeeklyRange(start,end))return;
      out.push({week:mk.week,start,end,group:b>=0?'B':'unspecified',doc});
    });
    const seen=new Set();
    return out.filter(x=>{const k=`${x.week}|${x.start}|${x.end}|${x.group}|${x.doc?.id||''}`;if(seen.has(k))return false;seen.add(k);return true});
  }

  window.extractRptWeekRanges=extractRptWeekRangesHotfix;

  // A Lesson Map yang sudah disahkan menyimpan snapshot bukti Buku Teks.
  // Jika sumber langsung masih wujud tetapi offset/printed-page mapping berubah,
  // bacaan langsung boleh mengembalikan halaman tetapi penapis akhir menjadi kosong.
  // Dalam keadaan itu, gunakan snapshot yang telah disahkan — jangan ubah Lesson Map.
  const originalLessonPageEvidence=window.lessonPageEvidence;
  if(typeof originalLessonPageEvidence==='function'&&typeof window.savedLessonEvidencePage==='function'){
    window.lessonPageEvidence=async function lessonPageEvidenceVerifiedFallback(map){
      let ev;
      try{
        ev=await originalLessonPageEvidence(map);
      }catch(error){
        const savedBt=window.savedLessonEvidencePage(map,'textbook');
        if(!savedBt)throw error;
        console.warn('RPH verified-map fallback: menggunakan snapshot Buku Teks selepas bacaan langsung gagal.',error);
        ev={bt:[savedBt],ba:[],hasBA:false};
      }
      ev=ev||{bt:[],ba:[],hasBA:false};
      if(map?.verification_status==='verified'&&(!Array.isArray(ev.bt)||!ev.bt.length)){
        const savedBt=window.savedLessonEvidencePage(map,'textbook');
        if(savedBt){
          ev={...ev,bt:[savedBt]};
          console.info(`RPH verified-map fallback: snapshot Buku Teks digunakan untuk M${map.week_no}/S${map.session_no}.`);
        }
      }
      if(map?.verification_status==='verified'&&ev.hasBA&&(!Array.isArray(ev.ba)||!ev.ba.length)){
        const savedBa=window.savedLessonEvidencePage(map,'activity_book');
        if(savedBa)ev={...ev,ba:[savedBa]};
      }
      return ev;
    };
  }

  // Jangan gagalkan Lesson Map verified hanya kerana runtime detector baharu
  // tidak lagi mengklasifikasikan ayat sumber lama sebagai "exact textbook task".
  // Kepercayaan hanya diberi apabila snapshot Buku Teks + aktiviti sumber memang
  // tersimpan pada Lesson Map yang telah disahkan.
  const originalBuildSourceActivities=window.buildSourceActivities;
  if(typeof originalBuildSourceActivities==='function'){
    window.buildSourceActivities=function buildSourceActivitiesVerifiedFallback(map,ev,classId){
      const built=originalBuildSourceActivities(map,ev,classId)||{};
      if(Number(built.exactTextbookCount||0)>=1||map?.verification_status!=='verified')return built;
      const snapshot=String(map?.source_evidence?.textbook?.text||'').trim();
      const activities=String(map?.source_activities||'').trim();
      const explicitBookRef=/\bBT\b|Buku\s*Teks|Student['’]?s\s+Book/i.test(activities);
      const meaningful=activities.replace(/\s+/g,' ').length>=24;
      if(snapshot&&explicitBookRef&&meaningful){
        return {...built,exactTextbookCount:1,_verifiedSnapshotFallback:true};
      }
      return built;
    };
  }

  // Paparkan jumlah Lesson Map verified bagi Tahun/Subjek supaya badge "0"
  // untuk minggu semasa tidak disalah tafsir sebagai semua pengesahan hilang.
  const originalRenderRphBadges=window.renderRphBadges;
  if(typeof originalRenderRphBadges==='function'){
    window.renderRphBadges=function renderRphBadgesWithVerifiedTotal(){
      originalRenderRphBadges();
      try{
        const el=document.querySelector('#rphSourceBadges');
        const classId=document.querySelector('#rphClass')?.value;
        const subjectId=document.querySelector('#rphSubject')?.value;
        const cls=typeof window.getClass==='function'?window.getClass(classId):null;
        if(!el||!cls||!subjectId||typeof window.verifiedRphMaps!=='function')return;
        const maps=window.verifiedRphMaps(classId,subjectId)||[];
        const total=maps.length;
        const week=Number(document.querySelector('#rphWeek')?.value||0);
        const exact=maps.filter(x=>Number(x.week_no)===week).length;
        if(total>exact){
          const badge=document.createElement('span');
          badge.className='source-badge have';
          badge.textContent=`✓ Jumlah Lesson Map Disahkan ${total} • Minggu ini ${exact}`;
          el.appendChild(badge);
        }
      }catch(error){console.warn('RPH verified-map badge diagnostic:',error)}
    };
  }

  window.__RPH_WEEK_ROUTING_HOTFIX__={
    version:'2026-09-04b',
    extractRptWeekRanges:extractRptWeekRangesHotfix,
    verifiedEvidenceFallback:true,
    verifiedActivityFallback:true
  };
  console.info('RPH routing + verified-map fallback active.');
})();
