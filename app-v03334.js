const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const today = new Date().toISOString().slice(0,10);
const SOURCE_TYPES = {
  rpt:'RPT', dskp:'DSKP', rph_example:'Contoh RPH', textbook:'Buku Teks', activity_book:'Buku Aktiviti',
  timetable:'Jadual Waktu', transit_template:'Borang Transit', other:'Lain-lain'
};
const MAX_INDEX_CHARS = 1_200_000;
const OCR_BATCH_PAGES = 12;
let OCR_WORKER = null;
let OCR_WORKER_LANG = '';

if (window.pdfjsLib) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

let state={client:null,connected:false,user:null,profile:null,access:null,authBusy:false,currentSessionId:null,currentSessionStartedAt:null,heartbeatTimer:null,adminUsers:[],sessionLogs:[],classes:[],subjects:[],standards:[],students:[],transit:[],books:[],rpt:[],sources:[],sourceChunks:[],sourcePages:[],timetable:[],lessonMaps:[],rphRecords:[],activityHistory:[],studentPreview:[],detectedStandards:[],lessonCandidate:null,rphActivityLibrary:[],rphSubjectPedagogy:[],rphInductionLibrary:[]};
let unsavedDirty=false;
let referenceLibrariesLoaded=false;
// Source text can be large (especially OCR). Keep it in-memory for the active
// browser session so changing Lesson Map fields does not re-download the same book.
const sourceReadCache={chunks:new Map(),pages:new Map()};
function clearSourceReadCache(){sourceReadCache.chunks.clear();sourceReadCache.pages.clear()}
function sourceReadCacheKey(kind,docs=[]){return `${kind}|${docs.map(d=>`${d.id}:${d.updated_at||d.created_at||''}:${d.extracted_chars||0}`).sort().join('|')}`}
function cachedSourceRead(bucket,key,load){if(bucket.has(key))return bucket.get(key);const pending=Promise.resolve().then(load).catch(error=>{bucket.delete(key);throw error});bucket.set(key,pending);return pending}
function withTimeout(promise,ms,label='Operasi'){
  let timer;
  const timeout=new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error(`${label} melebihi ${Math.ceil(ms/1000)} saat.`)),ms)});
  return Promise.race([Promise.resolve(promise),timeout]).finally(()=>clearTimeout(timer));
}
// PostgREST/Supabase mengehadkan 1000 baris setiap permintaan; ambil semua halaman ikut julat.
async function fetchAllRows(query,pageSize=1000,maxPages=50){
  const out=[];let from=0;
  for(let i=0;i<maxPages;i++){
    const {data,error}=await withTimeout(query.range(from,from+pageSize-1),20000,'Bacaan Supabase');
    if(error)return {data:out,error};
    if(!data||!data.length)break;
    out.push(...data);
    if(data.length<pageSize)break;
    from+=pageSize;
  }
  return {data:out,error:null};
}
async function loadRphActivityLibrary(force=false){
  if(!state.connected||!state.user){
    state.rphActivityLibrary=[];
    state.rphSubjectPedagogy=[];
    state.rphInductionLibrary=[];
    referenceLibrariesLoaded=false;
    return;
  }
  if(referenceLibrariesLoaded&&!force)return;

  const lib=await fetchAllRows(
    state.client
      .from('rph_activity_library')
      .select('*')
      .eq('active',true)
      .order('priority',{ascending:true})
  );

  if(lib.error){
    console.warn('RPH Activity Library:',lib.error);
    state.rphActivityLibrary=[];
  }else{
    state.rphActivityLibrary=lib.data||[];
  }

  const ped=await fetchAllRows(
    state.client
      .from('rph_subject_pedagogy')
      .select('*')
      .eq('active',true)
  );

  if(ped.error){
    console.warn('RPH Subject Pedagogy:',ped.error);
    state.rphSubjectPedagogy=[];
  }else{
    state.rphSubjectPedagogy=ped.data||[];
  }

  const ind=await fetchAllRows(
    state.client
      .from('rph_induction_library')
      .select('*')
      .eq('active',true)
      .order('priority',{ascending:true})
  );

  if(ind.error){
    console.warn('RPH Induction Library:',ind.error);
    state.rphInductionLibrary=[];
  }else{
    state.rphInductionLibrary=ind.data||[];
  }

  console.info(
    'RPH Activity Library loaded:',
    state.rphActivityLibrary.length,
    'activities /',
    state.rphSubjectPedagogy.length,
    'subject profiles'
  );
  referenceLibrariesLoaded=true;
}

async function reloadDataScopes(scopes=[]){
  if(!requireAuth())return;
  const c=state.client, wanted=new Set(scopes), jobs=[];
  const add=(scope,load,apply)=>{if(wanted.has(scope))jobs.push(Promise.resolve().then(load).then(result=>{if(result?.error)throw result.error;apply(result?.data||[])}))};
  add('transit',()=>fetchAllRows(c.from('transit_records').select('*').order('assessment_date',{ascending:false})),rows=>state.transit=rows);
  add('books',()=>fetchAllRows(c.from('book_checks').select('*').order('check_date',{ascending:false})),rows=>state.books=rows);
  add('sources',()=>fetchAllRows(c.from('source_documents').select('*').order('created_at',{ascending:false})),rows=>{state.sources=rows;clearSourceReadCache()});
  add('lessonMaps',()=>fetchAllRows(c.from('lesson_maps').select('*').order('academic_year',{ascending:false}).order('week_no').order('session_no')),rows=>state.lessonMaps=rows);
  await Promise.all(jobs);hydrate();
}
async function safeRealtimeReload(label='Data',scopes=[]){
  if(unsavedDirty){toast(`${label} baharu tersedia. Simpan kerja semasa dahulu, kemudian muat semula.`,4000);return}
  try{await reloadDataScopes(scopes)}catch(error){console.warn(`Realtime ${label}:`,error);toast(`${label} gagal disegerakkan. Cuba muat semula aplikasi.`,5000)}
}

function toast(msg,ms=3600){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove('show'),ms)}
function escapeHtml(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
const DEFAULT_SUPABASE_CONFIG={
  url:'https://syqhegxtwsjnkoutlwno.supabase.co',
  key:'sb_publishable_OeKcLCfDnw7FlWrSjUXGfg_t1YAD-zP'
};
const GOOGLE_DRIVE_CLIENT_ID='1054114776616-gnahe84n279ohk4vbpnogj8pnjs79hfg.apps.googleusercontent.com';
const GOOGLE_WORKSPACE_SCOPES=[
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.courseworkmaterials',
  'https://www.googleapis.com/auth/classroom.topics.readonly'
].join(' ');
const DOCX_MIME='application/vnd.openxmlformats-officedocument.wordprocessingml.document';
let DRIVE_ACCESS_TOKEN='';
let DRIVE_TOKEN_EXPIRES_AT=0;
let CLASSROOM_COURSES=[];
function localCfg(){
  try{
    const saved=JSON.parse(localStorage.getItem('erph_supabase')||'null');
    return saved?.url&&saved?.key?saved:DEFAULT_SUPABASE_CONFIG;
  }catch{return DEFAULT_SUPABASE_CONFIG}
}
function median(a){if(!a.length)return null;const x=[...a].sort((a,b)=>a-b),m=Math.floor(x.length/2);return x.length%2?x[m]:(x[m-1]+x[m])/2}
function weekFromDate(dateStr){const d=new Date(dateStr+'T00:00:00');const start=new Date(d.getFullYear(),0,1);return Math.ceil((((d-start)/86400000)+start.getDay()+1)/7)}

// v0.3.3.34: hard stable-session lock: one RPT session = one SP/title/BT ref; known book profiles applied globally; no cross-volume/page fallback.
// This fixes BM weekly session contamination (e.g. S2 inheriting S3 SP) and BT2 m/s 34 falling back to unrelated printed p.1.
// v0.3.3.33: strict RPT session isolation + exact printed-page lock + BM SP subfocus lock.
// When a stable RPT session declares BT2 m/s 34, the engine may use only printed page 34 from the matching book volume.
// It no longer falls back to an unrelated page when the exact printed page cannot be found.
// BM subitems such as 5.3.1(ii) ayat penyata remain session-specific; neighbouring subitems/sessions are not merged.
// v0.3.3.32: RPT-session-first activity orchestration + textbook enrichment + timetable session routing.
// Stable RPT session IDs are authoritative for title, SK/SP, activity anchor and BT reference.
// Textbook tasks enrich/verify the RPT activity instead of replacing it; BA remains optional.
// RPH auto-selects the verified Lesson Map by the teacher's weekly timetable ordinal so different teaching sessions do not keep reusing Sesi 1.
// v0.3.3.30: Source-aware PAK-21 + non-PBD differentiation + teacher timetable auto-route + BM OCR.
// v0.3.3.29: Weekly RPT coverage gate + exact session ID routing + declared BT/BA volume/page routing.
// A verified week must have enough source-grounded SK/SP + distinct activities for every stable RPT session before session Lesson Maps can be verified.
// v0.3.3.28: Google Drive OAuth client aligned with the Web OAuth client configured for rphtransitproject.pages.dev.
// Drive folder hierarchy from v0.3.3.28 remains: academic session > year level > class > week > subject.
// Google Drive account routing from v0.3.3.26 remains unchanged.
// v0.3.3.25: Reflection + Word export + Google Drive upload + Print.
// v0.3.3.24: English RPH output language lock.
// When English is selected, the generated lesson-plan content is rendered fully in English.
// Official PBD/TP codes are preserved.
// v0.3.3.23: RPH weeks must come from the uploaded RPT/Scheme of Work date ranges,
// never from ISO/calendar week. ISO week is retained only for legacy Lesson Map initial UI fallback.
function parseRptDateToken(v=''){
  const t=String(v||'').trim();let m;
  if((m=t.match(/^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})$/))){const [,d,mo,y]=m;return `${y}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}`}
  if((m=t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/))){const [,y,mo,d]=m;return `${y}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}`}
  return null;
}
function dateKeyInRange(dateKey,startKey,endKey){return !!dateKey&&!!startKey&&!!endKey&&dateKey>=startKey&&dateKey<=endKey}
function extractRptWeekRanges(text='',doc=null){
  const src=String(text||'').replace(/\r/g,'\n');const markers=[];
  const re=/(?:\b(?:MINGGU|WEEK)\s*(\d{1,2})\b)|(?:^|\n)\s*(\d{1,2})\s*(?=\n?\s*Kump(?:ulan)?\s*A\s*:)/gmi;let m;
  while((m=re.exec(src)))markers.push({week:Number(m[1]||m[2]),index:m.index});
  const out=[];const dateRe=/\b(?:\d{1,2}[.\/-]\d{1,2}[.\/-]\d{4}|\d{4}-\d{1,2}-\d{1,2})\b/g;
  markers.forEach((mk,i)=>{
    const block=src.slice(mk.index,markers[i+1]?.index??Math.min(src.length,mk.index+1800));
    const b=block.search(/(?:Kump(?:ulan)?|Group)\s*B\s*:/i);let scope=b>=0?block.slice(b):block;
    // Do not let Group B scope spill into unrelated metadata after a very long block.
    if(scope.length>900)scope=scope.slice(0,900);
    let dates=[...scope.matchAll(dateRe)].map(x=>parseRptDateToken(x[0])).filter(Boolean);
    if(dates.length<2)dates=[...block.matchAll(dateRe)].map(x=>parseRptDateToken(x[0])).filter(Boolean);
    if(dates.length>=2)out.push({week:mk.week,start:dates[0],end:dates[1],group:b>=0?'B':'unspecified',doc});
  });
  return out;
}
async function getRptWeekRangesForRph(subjectId,year,academicYear){
  if(!subjectId||!year)return[];
  let docs=state.sources.filter(d=>d.source_type==='rpt'&&d.subject_id===subjectId&&Number(d.year)===Number(year));
  const exact=docs.filter(d=>!academicYear||Number(d.academic_year)===Number(academicYear));if(exact.length)docs=exact;
  if(!docs.length)return[];const ids=docs.map(d=>d.id);let rows=[];
  if(state.connected&&state.user){
    const r2Docs=docs.filter(d=>d.metadata?.r2_index_path),legacyDocs=docs.filter(d=>!d.metadata?.r2_index_path);
    const indexes=await Promise.all(r2Docs.map(async d=>({doc:d,index:await loadSourceIndex(d)})));
    indexes.forEach(({doc,index})=>(index.chunks||[]).forEach(chunk=>rows.push({...chunk,document_id:doc.id})));
    if(legacyDocs.length){const {data,error}=await fetchAllRows(state.client.from('source_chunks').select('document_id,chunk_no,content').in('document_id',legacyDocs.map(d=>d.id)).order('chunk_no'));if(error){console.warn('RPT week resolver',error);return[]}rows.push(...(data||[]))}
  }
  const grouped=new Map();rows.sort((a,b)=>Number(a.chunk_no||0)-Number(b.chunk_no||0)).forEach(r=>{const a=grouped.get(r.document_id)||[];a.push(String(r.content||''));grouped.set(r.document_id,a)});
  const out=[];for(const d of docs){const text=(grouped.get(d.id)||[]).join('\n');out.push(...extractRptWeekRanges(text,d))}return out;
}
function verifiedRphMaps(classId,subjectId){
  const cls=getClass(classId);if(!cls||!subjectId)return[];const ay=Number(cls.academic_year||String($('#rphDate')?.value||today).slice(0,4));
  return state.lessonMaps.filter(x=>x.subject_id===subjectId&&Number(x.year)===Number(cls.year)&&Number(x.academic_year)===ay&&x.verification_status==='verified').sort((a,b)=>Number(a.week_no)-Number(b.week_no)||Number(a.session_no)-Number(b.session_no));
}
function setRphWeekHint(text='',kind=''){
  const el=$('#rphWeekHint');if(!el)return;el.textContent=text||'Minggu ditentukan daripada julat tarikh RPT, bukan ISO/calendar week.';el.dataset.kind=kind||'';
}
async function syncRphWeekFromDate({silent=false}={}){
  const date=$('#rphDate')?.value,classId=$('#rphClass')?.value,subjectId=$('#rphSubject')?.value,cls=getClass(classId);if(!date||!cls||!subjectId){renderRphClassHelper();return null}
  const ay=Number(cls.academic_year||String(date).slice(0,4));const ranges=await getRptWeekRangesForRph(subjectId,cls.year,ay);const hits=ranges.filter(r=>dateKeyInRange(date,r.start,r.end));
  if(hits.length){const hit=hits.find(x=>x.group==='B')||hits[0];$('#rphWeek').value=hit.week;$('#rphWeek').dataset.source='rpt-date';setRphWeekHint(`✓ Tarikh ${date} dipadankan kepada Minggu RPT ${hit.week}${hit.group==='B'?' • Kumpulan B':''}.`,'ok');renderRphBadges();renderRphLessonOptions();if(!silent)toast(`Minggu RPT ${hit.week} dikesan daripada julat tarikh sumber.`);return hit.week}
  const maps=verifiedRphMaps(classId,subjectId);const weeks=[...new Set(maps.map(x=>Number(x.week_no)))];
  if(weeks.length===1){$('#rphWeek').value=weeks[0];$('#rphWeek').dataset.source='verified-map';setRphWeekHint(`Tarikh ini tidak mempunyai julat RPT yang sepadan. Menggunakan satu-satunya Lesson Map disahkan: Minggu ${weeks[0]}.`,'warn');renderRphBadges();renderRphLessonOptions();return weeks[0]}
  $('#rphWeek').dataset.source='manual';setRphWeekHint(ranges.length?'Tiada julat tarikh RPT yang sepadan dengan tarikh ini. Pilih Minggu RPT secara manual; sistem tidak menggunakan ISO week.':'Julat tarikh RPT belum dapat dibaca. Pilih Minggu RPT secara manual; sistem tidak menggunakan ISO week.','warn');renderRphBadges();renderRphLessonOptions();return null;
}
function inferRphQuickYear(){
  const sub=$('#rphSubject')?.value,week=Number($('#rphWeek')?.value||0);let maps=state.lessonMaps.filter(x=>x.verification_status==='verified'&&(!sub||x.subject_id===sub));if(week){const exact=maps.filter(x=>Number(x.week_no)===week);if(exact.length)maps=exact}const years=[...new Set(maps.map(x=>Number(x.year)).filter(Boolean))];return years.length===1?years[0]:(years[0]||1)
}
function renderRphClassHelper(){
  const el=$('#rphClassHelper');if(!el)return;const targetYear=inferRphQuickYear(),sub=$('#rphSubject')?.value,week=Number($('#rphWeek')?.value||0);const relevant=state.lessonMaps.filter(x=>x.verification_status==='verified'&&(!sub||x.subject_id===sub)&&(!week||Number(x.week_no)===week));const explicitYears=[...new Set(relevant.map(x=>Number(x.year)).filter(Boolean))];const missingAll=!state.classes.length,missingTarget=explicitYears.length>0&&!state.classes.some(c=>explicitYears.includes(Number(c.year)));const show=missingAll||missingTarget;el.classList.toggle('hidden',!show);if(show&&$('#rphQuickYear'))$('#rphQuickYear').value=String(explicitYears.length===1?explicitYears[0]:targetYear);const msg=el.querySelector('div');if(msg)msg.innerHTML=missingAll?'<b>Belum ada kelas dalam database.</b><small>Tambah kelas sebenar supaya RPH boleh disimpan bersama rekod PBD.</small>':`<b>Tiada kelas Tahun ${explicitYears.join('/')} untuk Lesson Map ini.</b><small>Tambah kelas yang sepadan; Lesson Map tidak perlu dibina semula untuk setiap kelas.</small>`;if($('#rphClass')&&missingAll&&!$('#rphClass').options.length)$('#rphClass').innerHTML='<option value="">Belum ada kelas — tambah di bawah</option>'
}
function bytes(n){if(n===null||n===undefined)return '—';if(n<1024)return n+' B';if(n<1048576)return (n/1024).toFixed(1)+' KB';return (n/1048576).toFixed(1)+' MB'}
function safeName(s){return String(s||'file').normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g,'_').replace(/_+/g,'_').slice(0,150)}
function normalizeText(s){return String(s||'').replace(/\u0000/g,'').replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n').trim()}
function getSubject(id){return state.subjects.find(x=>x.id===id)}
function uniqueSubjects(){const u=state.user?.id,src=new Map(),mp=new Map();state.sources.forEach(s=>{src.set(s.subject_id,(src.get(s.subject_id)||0)+1)});state.lessonMaps.forEach(m=>{mp.set(m.subject_id,(mp.get(m.subject_id)||0)+1)});const by=new Map();state.subjects.forEach(s=>{const k=(s.name||'').toLowerCase().trim()+'|'+(s.code||'').toLowerCase().trim();if(!by.has(k))by.set(k,[]);by.get(k).push(s)});const out=[];for(const list of by.values()){if(list.length===1){out.push(list[0]);continue}list.sort((a,b)=>{const wa=(src.get(a.id)||0)+(mp.get(a.id)||0),wb=(src.get(b.id)||0)+(mp.get(b.id)||0);if(wa!==wb)return wb-wa;if(u&&a.teacher_id===u)return-1;if(u&&b.teacher_id===u)return 1;return 0});out.push(list[0])}return out}
function getClass(id){return state.classes.find(x=>x.id===id)}
function optionList(el,items,label='name',first=''){if(!el)return;const previous=el.value;el.innerHTML=(first?`<option value="">${escapeHtml(first)}</option>`:'')+items.map(x=>`<option value="${x.id}">${escapeHtml(x[label])}</option>`).join('');if([...el.options].some(o=>o.value===previous))el.value=previous}
function roleLabel(){return state.profile?.role==='admin'?'ADMIN':'GURU'}
function isAdmin(){return state.profile?.role==='admin'}
const DELIMA_DOMAIN='moe-dl.edu.my';
function normEmail(v=''){return String(v||'').trim().toLowerCase()}
function isDelimaTeacherEmail(v=''){return /^g-[^@]+@moe-dl\.edu\.my$/i.test(normEmail(v))}
function delimaId(v=''){return normEmail(v).split('@')[0]||''}
function decodeJwt(token=''){try{const p=token.split('.')[1];const b=p.replace(/-/g,'+').replace(/_/g,'/');return JSON.parse(decodeURIComponent(escape(atob(b))))}catch{return {}}}
function accessLabel(){const s=state.access?.status;return s==='allowed'?'DILULUSKAN':s==='pending'?'MENUNGGU ADMIN':s==='blocked'?'DIBLOK':'BELUM DIKENAL'}
function setGateStatus(msg,type=''){const el=$('#gateStatus');if(!el)return;el.textContent=msg;el.className='auth-status'+(type?' '+type:'')}
function setPill(){
  const p=$('#connectionPill'),role=$('#rolePill');
  if(state.connected&&state.user){p.textContent='SUPABASE LIVE';p.classList.remove('demo');role.textContent=roleLabel();role.classList.remove('hidden');$('#authButton').textContent='👤 Akaun'}
  else{p.textContent=state.connected?'DIKUNCI • LOGIN':'OFFLINE';p.classList.add('demo');role.classList.add('hidden');$('#authButton').textContent='👤 Login'}
}
function clearProtectedState(){
  clearSourceReadCache();
  referenceLibrariesLoaded=false;
  state.classes=[];state.subjects=[];state.standards=[];state.students=[];state.transit=[];state.books=[];state.rpt=[];state.sources=[];state.sourceChunks=[];state.sourcePages=[];state.timetable=[];state.lessonMaps=[];state.rphRecords=[];state.activityHistory=[];state.studentPreview=[];state.detectedStandards=[];state.lessonCandidate=null;state.adminUsers=[];state.sessionLogs=[];
}
function lockApp(message='Login guru diperlukan.'){
  clearProtectedState();document.body.classList.add('auth-locked');$('#authGate').hidden=false;$('#authGateMessage').textContent=message;setPill();
}
function unlockApp(){document.body.classList.remove('auth-locked');$('#authGate').hidden=true;setPill()}
function requireAuth(){if(!state.connected||!state.user){lockApp('Sesi anda belum aktif. Sila login dengan Google DELIMa.');return false}if(state.access?.status!=='allowed'){lockApp(state.access?.status==='pending'?'Akaun DELIMa anda sedang menunggu kelulusan Admin.':'Akaun ini tidak dibenarkan mengakses sistem.');return false}return true}
async function loadProfile(){
  if(!state.client||!state.user)return null;
  const {data,error}=await state.client.from('profiles').select('user_id,full_name,school_name,role,delima_id,access_status,force_logout_at').eq('user_id',state.user.id).maybeSingle();
  if(error)throw error;if(!data)throw new Error('Profil pengguna belum tersedia. Jalankan SQL upgrade v0.3.3 Google DELIMa terlebih dahulu.');
  state.profile=data;return data;
}
async function loadAccess(){
  if(!state.client||!state.user)return null;
  const email=normEmail(state.user.email);
  if(!isDelimaTeacherEmail(email))return {email,status:'blocked',display_name:'',role:'teacher'};
  let {data,error}=await state.client.from('authorized_users').select('email,status,display_name,role,user_id,updated_at').eq('email',email).maybeSingle();
  if(error)throw error;
  if(!data){await new Promise(r=>setTimeout(r,450));({data,error}=await state.client.from('authorized_users').select('email,status,display_name,role,user_id,updated_at').eq('email',email).maybeSingle());if(error)throw error}
  state.access=data||{email,status:'pending',display_name:'',role:'teacher'};return state.access;
}
function sessionMeta(session){const p=decodeJwt(session?.access_token||'');return {sessionId:p.session_id||null,startedAt:p.iat?new Date(p.iat*1000).toISOString():new Date().toISOString()}}
async function recordSession(session,status='active'){
  if(!state.client||!state.user||!session)return;
  const m=sessionMeta(session);state.currentSessionId=m.sessionId;state.currentSessionStartedAt=m.startedAt;
  if(!m.sessionId)return;
  const row={session_id:m.sessionId,user_id:state.user.id,email:normEmail(state.user.email),delima_id:delimaId(state.user.email),full_name:state.profile?.full_name||state.user.user_metadata?.full_name||state.user.user_metadata?.name||'',login_at:m.startedAt,last_seen_at:new Date().toISOString(),status,user_agent:navigator.userAgent.slice(0,500),platform:(navigator.userAgentData?.platform||navigator.platform||'').slice(0,120)};
  const {error}=await state.client.from('login_sessions').upsert(row,{onConflict:'session_id'});if(error)console.warn('session log',error);
  clearInterval(state.heartbeatTimer);state.heartbeatTimer=setInterval(()=>heartbeatSession(),60000);
}
async function heartbeatSession(){if(!state.client||!state.currentSessionId||!state.user)return;await state.client.from('login_sessions').update({last_seen_at:new Date().toISOString(),status:state.access?.status==='allowed'?'active':(state.access?.status||'active')}).eq('session_id',state.currentSessionId).eq('user_id',state.user.id)}
async function endSessionLog(status='logout'){clearInterval(state.heartbeatTimer);if(state.client&&state.currentSessionId&&state.user){try{await state.client.from('login_sessions').update({last_seen_at:new Date().toISOString(),logout_at:new Date().toISOString(),status}).eq('session_id',state.currentSessionId).eq('user_id',state.user.id)}catch{}}state.currentSessionId=null}
async function securityExit(message,status='blocked'){
  await endSessionLog(status);try{await state.client.auth.signOut({scope:'local'})}catch{}state.user=null;state.profile=null;state.access=null;lockApp(message);setGateStatus(message,'bad');
}
function applyRoleUi(){
  const role=roleLabel();$('#rolePill').textContent=role;
  $('#accountEmail').textContent=state.user?.email||'—';$('#accountName').textContent=state.profile?.full_name||state.access?.display_name||state.user?.user_metadata?.full_name||'Akaun Guru';$('#accountRole').textContent=role;
  if($('#accountAccess'))$('#accountAccess').textContent=accessLabel();
  const setup=$('#openSetup');if(setup)setup.classList.toggle('hidden',!isAdmin());
  $$('.admin-only').forEach(el=>el.classList.toggle('hidden',!isAdmin()));
}
async function handleSession(session,event='INITIAL_SESSION'){
  if(state.authBusy&&event!=='SIGNED_OUT')return;
  if(!session){state.user=null;state.profile=null;state.access=null;lockApp('Sila login dengan Google DELIMa untuk mengakses RPH, data murid dan PBD.');setGateStatus(state.connected?'Supabase bersedia. Gunakan akaun Google DELIMa guru.':'Sambungan Supabase belum tersedia.');return}
  state.authBusy=true;
  try{
    const {data,error}=await state.client.auth.getUser();if(error||!data?.user)throw error||new Error('Sesi login tidak sah.');
    state.user=data.user;
    if(!isDelimaTeacherEmail(state.user.email)){await recordSession(session,'rejected');return await securityExit('Akses ditolak. Hanya ID DELIMa guru g-...@moe-dl.edu.my dibenarkan.','rejected')}
    await loadAccess();await loadProfile();applyRoleUi();await recordSession(session,state.access?.status==='allowed'?'active':(state.access?.status||'pending'));subscribeRealtime();
    if(state.access?.status==='pending'){lockApp('Akaun DELIMa anda sah tetapi masih menunggu kelulusan Admin. Anda akan mendapat akses selepas Admin meluluskan akaun ini.');setGateStatus('Menunggu kelulusan Admin.','bad');return}
    if(state.access?.status==='blocked')return await securityExit('Akaun DELIMa ini telah diblok oleh Admin.','blocked');
    unlockApp();setGateStatus('Login Google DELIMa berjaya.','ok');await loadAll();
    if(event==='SIGNED_IN'||event==='INITIAL_SESSION')toast(`Login berjaya • ${roleLabel()} • ${delimaId(state.user.email)}`);
  }catch(e){console.error(e);state.user=null;state.profile=null;state.access=null;lockApp('Sesi tidak dapat disahkan. Sila login semula.');setGateStatus(e?.message||'Login gagal.','bad')}
  finally{state.authBusy=false;setPill()}
}
async function connect(){
  const cfg=localCfg();lockApp('Menyemak sesi guru…');
  if(!cfg?.url||!cfg?.key||!window.supabase){state.connected=false;setGateStatus('Konfigurasi Supabase tidak lengkap.','bad');setPill();return}
  try{
    state.client=window.supabase.createClient(cfg.url,cfg.key);state.connected=true;setPill();
    state.client.auth.onAuthStateChange((event,session)=>{setTimeout(()=>handleSession(session,event),0)});
    const {data:{session},error}=await state.client.auth.getSession();if(error)throw error;await handleSession(session,'INITIAL_SESSION');
  }catch(e){console.error(e);state.connected=false;state.user=null;state.profile=null;lockApp('Supabase tidak dapat disambungkan. Data sistem kekal dikunci.');setGateStatus('Sambungan gagal: '+(e?.message||'Ralat tidak diketahui'),'bad');setPill()}
}

async function loadAll(){if(!requireAuth())return;
  const c=state.client;
  await loadRphActivityLibrary();
  const qs=await Promise.all([
    fetchAllRows(c.from('classes').select('*').order('year').order('name')),
    fetchAllRows(c.from('subjects').select('*').order('name')),
    fetchAllRows(c.from('curriculum_standards').select('*').order('year').order('code')),
    fetchAllRows(c.from('students').select('*').eq('is_active',true).order('name')),
    fetchAllRows(c.from('transit_records').select('*').order('assessment_date',{ascending:false})),
    fetchAllRows(c.from('book_checks').select('*').order('check_date',{ascending:false})),
    fetchAllRows(c.from('rpt_lessons').select('*').order('week_no')),
    fetchAllRows(c.from('source_documents').select('*').order('created_at',{ascending:false})),
    fetchAllRows(c.from('timetable_entries').select('*').order('day_of_week').order('start_time')),
    fetchAllRows(c.from('lesson_maps').select('*').order('academic_year',{ascending:false}).order('week_no').order('session_no')),
    c.from('rph_records').select('id,subject_id,class_id,lesson_date,rph_json').order('lesson_date',{ascending:false}).limit(500),
    c.from('rph_activity_history').select('subject_id,class_id,activity_text,lesson_date').order('lesson_date',{ascending:false}).limit(300)
  ]);
  const [classes,subjects,standards,students,transit,books,rpt,sources,timetable,lessonMaps,rphRecords,activityHistory]=qs;
  const errs=qs.filter(x=>x.error);if(errs.length)console.warn(errs.map(x=>x.error));
  state.classes=classes.data||[];state.subjects=subjects.data||[];state.standards=standards.data||[];state.students=students.data||[];state.transit=transit.data||[];state.books=books.data||[];state.rpt=rpt.data||[];state.sources=sources.data||[];clearSourceReadCache();state.timetable=timetable.data||[];state.lessonMaps=lessonMaps.data||[];state.rphRecords=rphRecords.data||[];state.activityHistory=activityHistory.data||[];
  const legacyTimetable=state.timetable;
  await loadMySchoolTimetable(legacyTimetable);
  hydrate();
}
function subscribeRealtime(){
  if(!state.client||!state.user)return;state.client.removeAllChannels();
  state.client.channel('hub-live')
    .on('postgres_changes',{event:'*',schema:'public',table:'transit_records'},()=>state.access?.status==='allowed'&&safeRealtimeReload('Transit PBD',['transit']))
    .on('postgres_changes',{event:'*',schema:'public',table:'book_checks'},()=>state.access?.status==='allowed'&&safeRealtimeReload('Semakan Buku',['books']))
    .on('postgres_changes',{event:'*',schema:'public',table:'source_documents'},()=>state.access?.status==='allowed'&&safeRealtimeReload('Pustaka Sumber',['sources']))
    .on('postgres_changes',{event:'*',schema:'public',table:'lesson_maps'},()=>state.access?.status==='allowed'&&safeRealtimeReload('Lesson Map',['lessonMaps'])).subscribe();
  const email=normEmail(state.user.email);
  state.client.channel('my-security')
    .on('postgres_changes',{event:'UPDATE',schema:'public',table:'authorized_users',filter:`email=eq.${email}`},async payload=>{state.access=payload.new;applyRoleUi();if(payload.new.status==='allowed'){toast('Akses anda telah diluluskan oleh Admin.');unlockApp();await loadAll()}else if(payload.new.status==='blocked'){await securityExit('Akaun anda telah diblok oleh Admin.','blocked')}else{lockApp('Akaun anda sedang menunggu kelulusan Admin.')}})
    .on('postgres_changes',{event:'UPDATE',schema:'public',table:'profiles',filter:`user_id=eq.${state.user.id}`},async payload=>{state.profile={...state.profile,...payload.new};applyRoleUi();const kick=payload.new.force_logout_at;if(kick&&state.currentSessionStartedAt&&new Date(kick)>new Date(state.currentSessionStartedAt))await securityExit('Sesi anda telah ditamatkan (kick) oleh Admin.','kicked')}).subscribe();
  if(isAdmin())state.client.channel('admin-security').on('postgres_changes',{event:'*',schema:'public',table:'authorized_users'},()=>loadAdminData()).on('postgres_changes',{event:'*',schema:'public',table:'login_sessions'},()=>loadAdminData()).subscribe();
}

function renderRphAccessSelectors(){
  const c=$('#rphClass'),sub=$('#rphSubject');
  if(!c||!sub)return;

  if(isAdmin()){
    optionList(c,state.classes);
    optionList(sub,uniqueSubjects());
    return;
  }

  const ay=Number(String($('#rphDate')?.value||today).slice(0,4));
  const own=state.timetable.filter(x=>
    (!state.user||!x.teacher_id||x.teacher_id===state.user.id)&&
    (!x.academic_year||Number(x.academic_year)===ay)
  );

  const classIds=new Set(own.map(x=>x.class_id).filter(Boolean));
  const subjectIds=new Set(own.map(x=>x.subject_id).filter(Boolean));

  optionList(c,state.classes.filter(x=>classIds.has(x.id)),'name','Pilih kelas jadual');
  optionList(sub,uniqueSubjects().filter(x=>subjectIds.has(x.id)),'name','Pilih subjek jadual');
}

function hydrate(){
  const classSelectors=['#transitClass','#bookClass','#rphClass','#analyticsClass','#studentImportClass'];classSelectors.forEach(s=>optionList($(s),state.classes));
  optionList($('#sourceClass'),state.classes,'name','Semua kelas');
  const _us=uniqueSubjects();['#transitSubject','#bookSubject','#rphSubject','#analyticsSubject','#sourceSubject','#mapSubject'].forEach(s=>optionList($(s),_us));
  renderRphAccessSelectors();
  ['#transitDate','#bookDate','#rphDate'].forEach(s=>{if($(s)&&!$(s).value)$(s).value=today});
  if($('#rphWeek')&&!$('#rphWeek').dataset.init){const only=[...new Set(state.lessonMaps.filter(x=>x.verification_status==='verified').map(x=>Number(x.week_no)))];$('#rphWeek').value=only.length===1?only[0]:1;$('#rphWeek').dataset.init='1';$('#rphWeek').dataset.source=only.length===1?'verified-map':'manual'}
  if($('#mapWeek')&&!$('#mapWeek').dataset.init){$('#mapWeek').value=weekFromDate(today);$('#mapWeek').dataset.init='1'}if($('#sourceAcademicYear')&&!$('#sourceAcademicYear').value)$('#sourceAcademicYear').value=getClass($('#rphClass')?.value)?.academic_year||new Date().getFullYear();if($('#mapAcademicYear')&&!$('#mapAcademicYear').value)$('#mapAcademicYear').value=new Date().getFullYear();
  syncTimetableDelimaAccount();renderTransitLessonOptions();renderTransitRows();renderBookRows();renderDashboard();renderAnalytics();renderSources();renderSetupLists();renderSourceReadiness();renderLessonMaps();renderRphClassHelper();renderRphBadges();renderRphLessonOptions();renderTeacherScheduleForDate({autoPick:true,silent:true});setTimeout(()=>syncRphWeekFromDate({silent:true}),0);
}

function latestTpRows(classId,subjectId){
  const list=state.transit.filter(x=>(!classId||x.class_id===classId)&&(!subjectId||x.subject_id===subjectId)&&x.tp);
  const map=new Map();list.sort((a,b)=>String(b.assessment_date).localeCompare(String(a.assessment_date))).forEach(x=>{if(!map.has(x.student_id))map.set(x.student_id,x)});return [...map.values()]
}
function tpCounts(rows){const c=[0,0,0,0,0,0];rows.forEach(x=>{if(x.tp>=1&&x.tp<=6)c[x.tp-1]++});return c}
function barsHtml(counts){const max=Math.max(1,...counts);return counts.map((n,i)=>`<div class="tp-row"><b>TP${i+1}</b><div class="bar"><i style="width:${Math.round(n/max*100)}%"></i></div><span>${n}</span></div>`).join('')}
function renderDashboard(){
  $('#statSubjects').textContent=state.subjects.length;$('#statSources').textContent=state.sources.length;$('#statStudents').textContent=state.students.length;
  const rows=latestTpRows();const med=median(rows.map(x=>Number(x.tp)));$('#statTp').textContent=med?`TP${med}`:'—';$('#tpBars').innerHTML=barsHtml(tpCounts(rows));
  const counts={};Object.keys(SOURCE_TYPES).forEach(k=>counts[k]=state.sources.filter(x=>x.source_type===k).length);
  $('#sourceSummary').innerHTML=Object.entries(SOURCE_TYPES).map(([k,v])=>`<span class="ready-chip ${counts[k]?'yes':'no'}">${counts[k]?'✓':'○'} ${v}: ${counts[k]}</span>`).join('');
}
function renderSetupLists(){
  $('#subjectList').innerHTML=uniqueSubjects().map(x=>`<div class="mini-item"><span><b>${escapeHtml(x.code||'')}</b> ${escapeHtml(x.name)}</span></div>`).join('')||'<div class="muted">Belum ada subjek.</div>';
  $('#classList').innerHTML=state.classes.map(x=>`<div class="mini-item"><span>${escapeHtml(x.name)}</span><span>Tahun ${x.year}</span></div>`).join('')||'<div class="muted">Belum ada kelas.</div>';
}

function refreshStandards(){const el=$('#transitStandard');if(!el)return;const subject=$('#transitSubject').value,cls=getClass($('#transitClass').value);if(!cls)return;const arr=state.standards.filter(x=>x.subject_id===subject&&Number(x.year)===Number(cls.year));el.innerHTML=arr.length?arr.map(x=>`<option value="${x.id}">${escapeHtml(x.code)} — ${escapeHtml(x.description)}</option>`).join(''):'<option value="">Belum ada SP — upload DSKP/RPT dan Auto Detect</option>'}
function renderTransitLessonOptions(){const cls=getClass($('#transitClass').value),sub=$('#transitSubject').value;if(!cls||!sub)return;const maps=state.lessonMaps.filter(x=>x.verification_status==='verified'&&x.subject_id===sub&&Number(x.year)===Number(cls.year));const sel=$('#transitLesson');if(!sel)return;const prev=sel.value;sel.innerHTML='<option value="">Pilih tajuk daripada Lesson Map</option>'+maps.map(x=>`<option value="${x.id}">M${x.week_no}/${x.session_no} — ${escapeHtml(x.title)}</option>`).join('');if(prev&&[...sel.options].some(o=>o.value===prev))sel.value=prev;
const map=maps.find(x=>x.id===sel.value);renderTransitMeta(map);renderTransitRows()}
function renderTransitMeta(map){const el=$('#transitMeta');if(!el)return;if(!map){el.classList.add('hidden');return}const teacherName=state.user?.display_name||state.user?.email||'Guru';const skList=map.sk?map.sk.split(/\n/).filter(Boolean):[];const spList=map.sp?map.sp.split(/\n/).filter(Boolean):[];
el.innerHTML=`<div class="transit-meta-card"><div class="transit-meta-item"><span class="eyebrow">TAJUK</span><b>${escapeHtml(map.title||'—')}</b></div><div class="transit-meta-item"><span class="eyebrow">SK</span><b>${skList.length?escapeHtml(skList[0]):escapeHtml(map.sk||'—')}</b></div><div class="transit-meta-item"><span class="eyebrow">SP</span><b>${spList.length?escapeHtml(spList[0]):escapeHtml(map.sp||'—')}</b></div><div class="transit-meta-item"><span class="eyebrow">GURU</span><b>${escapeHtml(teacherName)}</b></div><div class="transit-meta-item"><span class="eyebrow">MINGGU / SESI</span><b>Minggu ${map.week_no} / Sesi ${map.session_no}</b></div><div class="transit-meta-item"><span class="eyebrow">OBJEKTIF</span><b>${escapeHtml(map.objective||'—')}</b></div></div>`;el.classList.remove('hidden')}
function classStudents(classId){return state.students.filter(x=>x.class_id===classId)}
function renderTransitRows(){unsavedDirty=false;const list=classStudents($('#transitClass').value);const mapId=$('#transitLesson')?.value||'';const map=mapId?state.lessonMaps.find(x=>x.id===mapId):null;const mapInfo=map?`<div class="transit-context"><span class="source-badge have">${escapeHtml(map.title)} • SP: ${escapeHtml(map.sp||'—')}</span></div>`:'';const rowsHtml=list.map((s,i)=>`<tr data-student="${s.id}"><td>${i+1}</td><td><b>${escapeHtml(s.name)}</b></td><td><select class="tp"><option value="">—</option>${[1,2,3,4,5,6].map(n=>`<option value="${n}">TP${n}</option>`).join('')}</select></td><td><input class="note" placeholder="Evidens / pemerhatian ringkas"></td></tr>`).join('')||'<tr><td colspan="4">Tiada murid untuk kelas ini. Import murid di HUD Setup Data.</td></tr>';$('#transitRows').innerHTML=mapInfo+rowsHtml}
function suggestedTp(score){const n=Number(score);if(Number.isNaN(n))return '';if(n>=9)return 6;if(n>=8)return 5;if(n>=6)return 4;if(n>=4)return 3;if(n>=2)return 2;return 1}
function renderBookRows(){unsavedDirty=false;const list=classStudents($('#bookClass').value);$('#bookRows').innerHTML=list.map((s,i)=>`<tr data-student="${s.id}"><td>${i+1}</td><td><b>${escapeHtml(s.name)}</b></td><td><select class="status"><option>Lengkap</option><option>Separa lengkap</option><option>Tidak lengkap</option><option>Tidak hadir</option></select></td><td><input class="score" type="number" min="0" max="10" step="1" value="10"></td><td class="suggest">TP6</td><td><input class="note" placeholder="Catatan"></td></tr>`).join('')||'<tr><td colspan="6">Tiada murid untuk kelas ini.</td></tr>';$$('#bookRows .score').forEach(inp=>inp.addEventListener('input',e=>e.target.closest('tr').querySelector('.suggest').textContent='TP'+suggestedTp(e.target.value)))}

async function saveTransit(){if(!requireAuth())return;
  const mapId=$('#transitLesson')?.value||null;
  const map=mapId?state.lessonMaps.find(x=>x.id===mapId):null;
  const rows=$$('#transitRows tr[data-student]');const items=rows.map(r=>({student_id:r.dataset.student,class_id:$('#transitClass').value,subject_id:$('#transitSubject').value,standard_id:map?null:null,assessment_date:$('#transitDate').value,tp:Number(r.querySelector('.tp').value)||null,evidence_note:r.querySelector('.note').value.trim(),source_type:'transit',lesson_map_id:mapId||null,teacher_name:state.user?.display_name||state.user?.email||null,tajuk:map?.title||null,sk:map?.sk||null,sp:map?.sp||null})).filter(x=>x.tp);
  if(!items.length)return toast('Pilih sekurang-kurangnya satu TP.');
  if(state.connected&&state.user){items.forEach(x=>x.teacher_id=state.user.id);const {error}=await state.client.from('transit_records').upsert(items,{onConflict:'student_id,subject_id,standard_id,assessment_date'});if(error)return toast('Gagal simpan: '+error.message);await logAudit('SAVE_TRANSIT',{count:items.length,lesson_map_id:mapId});await loadAll()}
  toast(`${items.length} rekod Transit PBD berjaya disimpan.`)
}
async function saveBooks(){if(!requireAuth())return;
  const rows=$$('#bookRows tr[data-student]');const items=rows.map(r=>({student_id:r.dataset.student,class_id:$('#bookClass').value,subject_id:$('#bookSubject').value,check_date:$('#bookDate').value,book_type:$('#bookType').value,task_ref:$('#bookTask').value.trim(),completion_status:r.querySelector('.status').value,score:Number(r.querySelector('.score').value),suggested_tp:suggestedTp(r.querySelector('.score').value),note:r.querySelector('.note').value.trim()}));
  if(!items.length)return toast('Tiada murid untuk disimpan.');
  if(state.connected&&state.user){items.forEach(x=>x.teacher_id=state.user.id);const {error}=await state.client.from('book_checks').insert(items);if(error)return toast('Gagal simpan: '+error.message);await logAudit('SAVE_BOOK_CHECK',{count:items.length});await loadAll()}
  toast(`${items.length} semakan buku berjaya disimpan.`)
}
async function logAudit(action,details){if(state.client&&state.user)await state.client.from('audit_logs').insert({teacher_id:state.user.id,action,details})}

function renderAnalytics(){const cls=$('#analyticsClass').value,sub=$('#analyticsSubject').value;const rows=latestTpRows(cls,sub);const counts=tpCounts(rows);$('#analyticsBars').innerHTML=barsHtml(counts);const low=counts[0]+counts[1],mid=counts[2]+counts[3],high=counts[4]+counts[5];$('#groupSuggestion').innerHTML=`<div class="group-card"><b>Pemulihan TP1–2: ${low}</b><br>Bimbingan rapat, contoh konkrit dan latihan berperingkat.</div><div class="group-card"><b>Pengukuhan TP3–4: ${mid}</b><br>Aktiviti pasangan/kumpulan dengan tugasan aras sederhana.</div><div class="group-card"><b>Pengayaan TP5–6: ${high}</b><br>Tugasan KBAT, penerangan kendiri dan cabaran tambahan.</div>`;const byStudent=new Map(rows.map(x=>[x.student_id,x]));$('#analyticsRows').innerHTML=classStudents(cls).map(s=>{const r=byStudent.get(s.id);return `<tr><td>${escapeHtml(s.name)}</td><td>${r?`TP${r.tp}`:'—'}</td><td>${r?escapeHtml(r.source_type||'transit'):'—'}</td><td>${r?escapeHtml(r.assessment_date):'—'}</td></tr>`}).join('')}

async function addSubject(){if(!requireAuth())return;const code=$('#newSubjectCode').value.trim().toUpperCase(),name=$('#newSubjectName').value.trim();if(!code||!name)return toast('Masukkan kod dan nama subjek.');if(state.connected&&state.user){const {error}=await state.client.from('subjects').insert({teacher_id:state.user.id,code,name});if(error)return toast('Gagal tambah subjek: '+error.message);await loadAll()}$('#newSubjectCode').value='';$('#newSubjectName').value='';toast('Subjek berjaya ditambah.')}
async function addClass(){if(!requireAuth())return;const year=Number($('#newClassYear').value),name=$('#newClassName').value.trim();if(!name)return toast('Masukkan nama kelas.');if(state.connected&&state.user){const {error}=await state.client.from('classes').insert({teacher_id:state.user.id,name,year,academic_year:new Date().getFullYear()});if(error)return toast('Gagal tambah kelas: '+error.message);await loadAll()}$('#newClassName').value='';toast('Kelas berjaya ditambah.')}
async function addRphClassQuick(){
  if(!requireAuth())return;const year=Number($('#rphQuickYear')?.value||inferRphQuickYear()),name=$('#rphQuickClassName')?.value.trim();if(!name)return toast('Masukkan nama kelas, contoh 2 Sapphire.');
  const sub=$('#rphSubject')?.value,week=Number($('#rphWeek')?.value||0);const related=state.lessonMaps.filter(x=>x.verification_status==='verified'&&Number(x.year)===year&&(!sub||x.subject_id===sub)&&(!week||Number(x.week_no)===week));const ay=Number(related[0]?.academic_year||String($('#rphDate')?.value||today).slice(0,4)||new Date().getFullYear());let created;
  if(state.connected&&state.user){const {data,error}=await state.client.from('classes').insert({teacher_id:state.user.id,name,year,academic_year:ay}).select().single();if(error)return toast('Gagal tambah kelas: '+error.message);created=data;await loadAll()}
  if(created&&$('#rphClass'))$('#rphClass').value=created.id;if($('#rphQuickClassName'))$('#rphQuickClassName').value='';renderRphClassHelper();await syncRphWeekFromDate({silent:true});applyTimetableSuggestion();renderRphBadges();renderRphLessonOptions();toast(`Kelas ${name} berjaya ditambah dan dipilih.`)
}

async function parseWorkbook(file){
  const ext=file.name.split('.').pop().toLowerCase();
  if(ext==='csv'){const text=await file.text();if(!window.XLSX)throw new Error('Library XLSX belum dimuatkan.');const wb=XLSX.read(text,{type:'string'});return workbookToRows(wb)}
  if(!window.XLSX)throw new Error('Library XLSX belum dimuatkan.');const ab=await file.arrayBuffer();const wb=XLSX.read(ab,{type:'array'});return workbookToRows(wb)
}
function workbookToRows(wb){const out=[];wb.SheetNames.forEach(sheet=>{const rows=XLSX.utils.sheet_to_json(wb.Sheets[sheet],{defval:''});rows.forEach(r=>out.push({...r,__sheet:sheet}))});return out}
function keyFind(obj,candidates){const keys=Object.keys(obj);const norm=k=>k.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();for(const c of candidates){const hit=keys.find(k=>norm(k)===c||norm(k).includes(c));if(hit)return hit}return null}
async function previewStudents(){const f=$('#studentImportFile').files[0];if(!f)return toast('Pilih fail CSV/XLSX dahulu.');try{const rows=await parseWorkbook(f);if(!rows.length)throw new Error('Tiada baris data.');const sample=rows[0],nameKey=keyFind(sample,['nama murid','nama','name','murid']),noKey=keyFind(sample,['bil','no','nombor','number']),idKey=keyFind(sample,['id delima','delima','email','emel','id']);if(!nameKey)throw new Error('Kolum nama murid tidak dapat dikesan.');state.studentPreview=rows.map((r,i)=>({name:String(r[nameKey]||'').trim(),student_no:Number(r[noKey])||i+1,delima_id:String(r[idKey]||'').trim()})).filter(x=>x.name);$('#studentPreviewRows').innerHTML=state.studentPreview.slice(0,300).map((x,i)=>`<tr><td>${x.student_no||i+1}</td><td>${escapeHtml(x.name)}</td><td>${escapeHtml(x.delima_id||'—')}</td></tr>`).join('');$('#studentPreviewCount').textContent=state.studentPreview.length+' murid';$('#studentPreviewCard').classList.remove('hidden');$('#importStudents').classList.toggle('hidden',!state.studentPreview.length);toast(`${state.studentPreview.length} murid dikesan.`)}catch(e){console.error(e);toast('Preview gagal: '+e.message,5000)}}
async function importStudents(){if(!requireAuth())return;const classId=$('#studentImportClass').value;if(!classId||!state.studentPreview.length)return toast('Pilih kelas dan buat preview dahulu.');if(state.connected&&state.user){const payload=state.studentPreview.map(x=>({...x,class_id:classId,is_active:true}));const {error}=await state.client.from('students').upsert(payload,{onConflict:'class_id,name'});if(error)return toast('Import gagal: '+error.message);await logAudit('IMPORT_STUDENTS',{count:payload.length,class_id:classId});await loadAll()}else{state.studentPreview.forEach(x=>state.students.push({id:crypto.randomUUID(),class_id:classId,...x}));hydrate()}toast(`${state.studentPreview.length} murid berjaya diimport.`);state.studentPreview=[];$('#importStudents').classList.add('hidden')}

async function extractTextFromFile(file,onStep=()=>{}){
  const ext=file.name.split('.').pop().toLowerCase();onStep('Membaca '+file.name+'...');
  if(['txt','csv','md','json'].includes(ext)){const text=normalizeText(await file.text());return {text,pageCount:null,method:'text',pages:text?[{page_no:1,content:text,kind:'section'}]:[]}}
  if(ext==='docx'){
    if(!window.mammoth)throw new Error('Mammoth DOCX belum dimuatkan.');const ab=await file.arrayBuffer();const res=await mammoth.extractRawText({arrayBuffer:ab});const text=normalizeText(res.value);return {text,pageCount:null,method:'docx',pages:text?[{page_no:1,content:text,kind:'section'}]:[]}
  }
  if(['xlsx','xls'].includes(ext)){
    const rows=await parseWorkbook(file);const text=rows.map(r=>Object.entries(r).filter(([k])=>k!=='__sheet').map(([k,v])=>`${k}: ${v}`).join(' | ')).join('\n');const clean=normalizeText(text);return {text:clean,pageCount:null,method:'spreadsheet',pages:clean?[{page_no:1,content:clean,kind:'sheet'}]:[]}
  }
  if(ext==='pdf'){
    if(!window.pdfjsLib)throw new Error('PDF.js belum dimuatkan.');const ab=await file.arrayBuffer();const pdf=await pdfjsLib.getDocument({data:ab}).promise;const maxPages=Math.min(pdf.numPages,260);let parts=[],pages=[];for(let i=1;i<=maxPages;i++){if(i===1||i%10===0)onStep(`Ekstrak PDF ${i}/${maxPages} halaman...`);const p=await pdf.getPage(i);const tc=await p.getTextContent();const content=normalizeText(tc.items.map(x=>x.str).join(' '));parts.push(`[HALAMAN ${i}]\n`+content);pages.push({page_no:i,content,kind:'page'});}if(pdf.numPages>maxPages)parts.push(`\n[INDEKS DIPENDEKKAN: ${pdf.numPages-maxPages} halaman seterusnya belum diekstrak pada peranti ini.]`);return {text:normalizeText(parts.join('\n\n')),pageCount:pdf.numPages,method:'pdf',pages}
  }
  if(['png','jpg','jpeg','webp'].includes(ext))return {text:'',pageCount:null,method:'image-no-ocr',pages:[]};
  return {text:'',pageCount:null,method:'unsupported',pages:[]}
}
function chunkText(text,size=5200,overlap=400){const clean=normalizeText(text).slice(0,MAX_INDEX_CHARS);if(!clean)return[];const chunks=[];let start=0,n=0;while(start<clean.length){let end=Math.min(clean.length,start+size);if(end<clean.length){const nl=clean.lastIndexOf('\n',end);if(nl>start+size*.65)end=nl}chunks.push({chunk_no:n++,content:clean.slice(start,end),char_start:start,char_end:end});if(end>=clean.length)break;start=Math.max(end-overlap,start+1)}return chunks}
function showUploadProgress(title,detail='',pct=0){const box=$('#uploadProgress');box.classList.remove('hidden');box.innerHTML=`<b>${escapeHtml(title)}</b><div class="progress-track"><i style="width:${Math.max(0,Math.min(100,pct))}%"></i></div><small>${escapeHtml(detail)}</small>`}
function hideUploadProgress(){setTimeout(()=>$('#uploadProgress').classList.add('hidden'),1200)}

async function uploadBinary(file,path,onProgress){
  if(!state.client||!state.user)return {path:null,status:'demo'};
  const {data:{session}}=await state.client.auth.getSession();const token=session?.access_token;
  if(!token)throw new Error('Sesi login tamat. Login semula.');
  const headers={authorization:`Bearer ${token}`},apiPath='/api/source-files/'+path.split('/').map(encodeURIComponent).join('/');
  const readError=async r=>{let msg='';try{const body=await r.json();msg=body?.error||''}catch{try{msg=await r.text()}catch{}}return msg||`HTTP ${r.status}`};
  if(file.size<=8*1024*1024){
    const form=new FormData();form.append('path',path);form.append('file',file,file.name);
    const r=await fetch('/api/source-files',{method:'POST',headers,body:form});
    if(!r.ok)throw new Error(`Cloudflare R2 gagal: ${await readError(r)}. Semak binding RPH_SOURCE_FILES.`);
    onProgress(100);return await r.json();
  }
  const create=await fetch(`${apiPath}?action=mpu-create`,{method:'POST',headers:{...headers,'x-file-content-type':file.type||'application/octet-stream'}});
  if(!create.ok)throw new Error(`Cloudflare R2 gagal: ${await readError(create)}. Semak binding RPH_SOURCE_FILES.`);
  const {uploadId}=await create.json();if(!uploadId)throw new Error('Cloudflare R2 tidak memulangkan uploadId.');
  const partSize=8*1024*1024,total=Math.ceil(file.size/partSize),parts=[];
  try{
    for(let i=0;i<total;i++){
      const chunk=file.slice(i*partSize,Math.min(file.size,(i+1)*partSize));let response=null;
      for(let attempt=1;attempt<=3;attempt++){
        response=await fetch(`${apiPath}?action=mpu-uploadpart&uploadId=${encodeURIComponent(uploadId)}&partNumber=${i+1}`,{method:'PUT',headers,body:chunk});
        if(response.ok)break;if(attempt===3)throw new Error(`Bahagian ${i+1}/${total} gagal: ${await readError(response)}`);
        await new Promise(resolve=>setTimeout(resolve,attempt*700));
      }
      parts.push(await response.json());onProgress(Math.round((i+1)/total*96));
    }
    const complete=await fetch(`${apiPath}?action=mpu-complete&uploadId=${encodeURIComponent(uploadId)}`,{method:'POST',headers:{...headers,'content-type':'application/json'},body:JSON.stringify({parts})});
    if(!complete.ok)throw new Error(`Cloudflare R2 gagal melengkapkan upload: ${await readError(complete)}`);
    onProgress(100);return await complete.json();
  }catch(error){
    fetch(`${apiPath}?action=mpu-abort&uploadId=${encodeURIComponent(uploadId)}`,{method:'DELETE',headers}).catch(()=>{});
    throw error;
  }
}

async function r2Fetch(path,{method='GET',body=null,headers={}}={}){
  const {data:{session}}=await state.client.auth.getSession(),token=session?.access_token;
  if(!token)throw new Error('Sesi login tamat. Login semula.');
  const url='/api/source-files/'+String(path||'').split('/').map(encodeURIComponent).join('/');
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);let response;
  try{response=await fetch(url,{method,body,signal:controller.signal,headers:{authorization:`Bearer ${token}`,...headers}})}catch(error){if(error?.name==='AbortError')throw new Error('Bacaan Cloudflare R2 melebihi 20 saat.');throw error}finally{clearTimeout(timer)}
  if(!response.ok){let message='';try{message=(await response.json())?.error||''}catch{try{message=await response.text()}catch{}}throw new Error(message||`Cloudflare R2 HTTP ${response.status}`)}
  return response;
}

async function loadSourceIndex(doc){
  const path=doc?.metadata?.r2_index_path;if(!path)return {version:1,chunks:[],pages:[]};
  const response=await r2Fetch(path);const index=await response.json();
  return {version:Number(index?.version||1),chunks:Array.isArray(index?.chunks)?index.chunks:[],pages:Array.isArray(index?.pages)?index.pages:[]};
}

async function saveSourceIndex(doc,index,onProgress=()=>{}){
  const path=doc?.metadata?.r2_index_path;if(!path)throw new Error('Path indeks R2 tiada.');
  const file=new File([JSON.stringify({...index,version:1,updated_at:new Date().toISOString()})],path.split('/').pop()||'source-index.json',{type:'application/json'});
  return uploadBinary(file,path,onProgress);
}


function normKey(v){return String(v||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
const SUBJECT_SOURCE_ALIASES={
  english:['english','bahasa inggeris','super minds','super mind','supermind','get smart','pulse','close up','close-up'],
  'bahasa inggeris':['english','bahasa inggeris','super minds','super mind','supermind','get smart','pulse','close up','close-up'],
  'bahasa melayu':['bahasa melayu','buku teks bahasa melayu'],
  mathematics:['mathematics','maths','math','matematik'],matematik:['mathematics','maths','math','matematik'],
  science:['science','sains'],sains:['science','sains'],
  'pendidikan jasmani':['pendidikan jasmani','physical education'],
  'pendidikan kesihatan':['pendidikan kesihatan','health education'],
  'pendidikan islam':['pendidikan islam'],
  'pendidikan moral':['pendidikan moral','moral']
};
function subjectSourceTerms(subjectId){const sub=getSubject(subjectId);if(!sub)return[];const name=normKey(sub.name),code=normKey(sub.code);const terms=new Set([name]);if(code.length>=3)terms.add(code);Object.entries(SUBJECT_SOURCE_ALIASES).forEach(([k,vals])=>{if(name===k||name.includes(k)||vals.some(v=>name.includes(normKey(v))))vals.forEach(v=>terms.add(normKey(v)))});return [...terms].filter(x=>x.length>1)}
function sourceAcademicSpanIncludes(doc,academicYear){
  const target=Number(academicYear);if(!target)return false;
  const text=String(`${doc?.file_name||''} ${doc?.title||''}`);
  const m=/(?:^|[^\d])(20\d{2})\s*[-–—\/ ]\s*(20\d{2})(?!\d)/.exec(text);if(!m)return false;
  const a=Number(m[1]),b=Number(m[2]);return target>=Math.min(a,b)&&target<=Math.max(a,b);
}
function sourceDocMatchScore(doc,subjectId,year,academicYear=null){if(Number(doc.year)!==Number(year))return -999;let score=0;if(doc.subject_id===subjectId)score+=100;const hay=normKey(`${doc.file_name||''} ${doc.title||''}`);for(const t of subjectSourceTerms(subjectId)){if(t&&hay.includes(t))score+=30}const strictSession=['rpt','timetable'].includes(doc.source_type);if(academicYear){if(Number(doc.academic_year)===Number(academicYear))score+=20;else if(sourceAcademicSpanIncludes(doc,academicYear))score+=14;else if(strictSession)return -999;else score-=5}return score}
function smartSourceDocs(subjectId,year,academicYear=null,types=null){const allowed=types?new Set(types):null;const scored=state.sources.map(d=>({...d,_smartScore:sourceDocMatchScore(d,subjectId,year,academicYear),_autoLinked:d.subject_id!==subjectId}));const filtered=scored.filter(d=>(!allowed||allowed.has(d.source_type))&&d._smartScore>=30);if(filtered.length||types)return filtered.sort((a,b)=>b._smartScore-a._smartScore||String(b.created_at||'').localeCompare(String(a.created_at||'')));return scored.filter(d=>(!allowed||allowed.has(d.source_type))&&d._smartScore>=-50).sort((a,b)=>b._smartScore-a._smartScore||String(b.created_at||'').localeCompare(String(a.created_at||'')))}
function sourceRef(doc,extra=''){if(!doc)return extra;const bits=[doc.file_name||doc.title||'Sumber'];if(doc._autoLinked)bits.push('auto-padan subjek');if(extra)bits.push(extra);return bits.join(' • ')}
function parseDay(v){const s=normKey(v);const days={isnin:1,monday:1,selasa:2,tuesday:2,rabu:3,wednesday:3,khamis:4,thursday:4,jumaat:5,jumat:5,friday:5,sabtu:6,saturday:6,ahad:7,sunday:7};for(const [k,n] of Object.entries(days))if(s.includes(k))return n;const num=Number(v);return num>=1&&num<=7?num:null}
function parseClock(v){if(v===null||v===undefined||v==='')return null;if(typeof v==='number'&&v>=0&&v<1){const mins=Math.round(v*24*60);return `${String(Math.floor(mins/60)%24).padStart(2,'0')}:${String(mins%60).padStart(2,'0')}`}const s=String(v).trim().toLowerCase().replace(/\s+/g,' ');let m=s.match(/(\d{1,2})[:.](\d{2})/);if(!m)return null;let h=Number(m[1]),min=Number(m[2]);if(/pm/.test(s)&&h<12)h+=12;if(/am/.test(s)&&h===12)h=0;if(h>23||min>59)return null;return `${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}`}
function parseTimetableClock(v){
  const out=parseClock(v);
  if(!out)return null;

  const raw=String(v??'').toLowerCase();

  if(!/[ap]m/.test(raw)){
    let [h,m]=out.split(':').map(Number);
    if(h>=1&&h<=6)h+=12;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
  }

  return out;
}

function matchClassValue(v,fallback){const s=normKey(v);if(s){const hit=state.classes.find(c=>s===normKey(c.name)||s.includes(normKey(c.name))||normKey(c.name).includes(s));if(hit)return hit.id}return fallback||null}
function matchSubjectValue(v,fallback){const s=normKey(v);if(s){const hit=uniqueSubjects().find(x=>s===normKey(x.code)||s===normKey(x.name)||s.includes(normKey(x.name))||s.includes(normKey(x.code)));if(hit)return hit.id}return fallback||null}
function delimaTeacherDisplayName(){
  return String(
    state.profile?.full_name||
    state.access?.display_name||
    state.user?.user_metadata?.full_name||
    state.user?.user_metadata?.name||
    ''
  ).trim();
}

function teacherNameKey(v=''){
  return normKey(v)
    .replace(/\b(kpm|guru|teacher|cikgu)\b/g,' ')
    .replace(/\b(mohammad|muhammad|mohamad|mohd|md)\b/g,'mohd')
    .replace(/\bridhwan\b/g,'ridwan')
    .replace(/\s+/g,' ')
    .trim();
}

function matchDelimaTeacherName(accountName,names=[]){
  const target=teacherNameKey(accountName);
  if(!target)return null;

  const exact=names.find(n=>teacherNameKey(n)===target);
  if(exact)return exact;

  const targetParts=new Set(target.split(' ').filter(x=>x.length>1));

  const ranked=names.map(name=>{
    const parts=teacherNameKey(name).split(' ').filter(x=>x.length>1);
    const overlap=parts.filter(x=>targetParts.has(x)).length;
    const score=overlap/Math.max(targetParts.size,parts.length,1);
    return {name,score};
  }).sort((a,b)=>b.score-a.score);

  const best=ranked[0];
  const second=ranked[1];

  if(!best||best.score<0.75)return null;
  if(second&&best.score-second.score<0.15)return null;

  return best.name;
}

function syncTimetableDelimaAccount(){
  const el=$('#timetableTeacherName');
  if(!el)return;

  const name=delimaTeacherDisplayName();
  el.value=name||'Nama DELIMa tidak tersedia';
}

async function loadMySchoolTimetable(legacyRows=[]){
  if(!state.client||!state.user){
    state.timetable=legacyRows;
    return;
  }

  const dateYear=Number(
    String($('#rphDate')?.value||today).slice(0,4)
  );

  const ay=dateYear||new Date().getFullYear();
  const status=$('#myTimetableStatus');

  const {data,error}=await state.client.rpc(
    'get_my_school_timetable',
    {p_academic_year:ay}
  );

  if(error){
    console.warn('get_my_school_timetable',error);
    state.timetable=legacyRows;
    if(status)status.textContent='Jadual Induk gagal dibaca.';
    return;
  }

  const raw=data||[];

  if(!raw.length){
    state.timetable=legacyRows;
    if(status)status.textContent=`Tiada jadual ditemui untuk ${ay}.`;
    return;
  }

  const mapped=raw.map(r=>({
    ...r,
    id:`school:${r.id}`,
    teacher_id:state.user.id,
    class_id:matchClassValue(r.class_name,null),
    subject_id:matchSubjectValue(r.subject_code,null),
    _schoolMaster:true
  })).filter(r=>r.class_id&&r.subject_id);

  state.timetable=mapped;

  if(status)status.textContent=
    `✓ ${mapped.length} sesi ditemui melalui akaun DELIMa`;

  console.info(
    'Jadual Induk DELIMa:',
    mapped.length,
    'daripada',
    raw.length,
    'sesi'
  );
}

async function importGlobalTimetableFile(file){
  if(!requireAuth())return 0;
  if(!file)return toast('Pilih fail jadual CSV/XLSX dahulu.');

  const ext=file.name.split('.').pop().toLowerCase();
  if(!['xlsx','xls','csv'].includes(ext))
    return toast('Jadual global hanya menerima XLSX/XLS/CSV.');

  try{
    const rows=await parseWorkbook(file);
    if(!rows.length)throw new Error('Tiada baris jadual dikesan.');

    const sample=rows[0];
    const teacherKey=keyFind(sample,['guru','nama guru','teacher']);
    const dayKey=keyFind(sample,['hari','day']);
    const classKey=keyFind(sample,['kelas','class']);
    const subjectKey=keyFind(sample,['subjek','subject','mata pelajaran']);
    const timeKey=keyFind(sample,['masa','time','waktu']);
    const startKey=keyFind(sample,['mula','start','masa mula']);
    const endKey=keyFind(sample,['tamat','end','masa tamat']);

    if(!teacherKey)throw new Error('Kolum Guru tidak ditemui.');
    if(!dayKey||!classKey||!subjectKey)
      throw new Error('Kolum Hari/Kelas/Subjek tidak lengkap.');

    const names=[...new Set(
      rows.map(r=>String(r[teacherKey]||'').trim()).filter(Boolean)
    )];

    const accountName=delimaTeacherDisplayName();

    if(!accountName){
      throw new Error('Nama akaun DELIMa tidak dapat dibaca. Login semula.');
    }

    const wanted=matchDelimaTeacherName(accountName,names);

    if(!wanted){
      if($('#timetableImportHint'))
        $('#timetableImportHint').textContent=
          `Akaun DELIMa "${accountName}" tidak dapat dipadankan dengan kolum Guru dalam fail.`;

      throw new Error(
        `Nama akaun DELIMa "${accountName}" tidak ditemui dengan padanan yang selamat.`
      );
    }

    const target=teacherNameKey(wanted);

    const mine=rows.filter(r=>
      teacherNameKey(r[teacherKey])===target
    );

    syncTimetableDelimaAccount();

    if($('#timetableImportHint'))
      $('#timetableImportHint').textContent=
        `Akaun DELIMa "${accountName}" → jadual "${wanted}"`;

    const ay=Number(
      $('#sourceAcademicYear')?.value||
      new Date().getFullYear()
    );

    const items=[];
    const missingClasses=new Set();
    const missingSubjects=new Set();
    let badTime=0;

    for(const r of mine){
      const day=parseDay(r[dayKey]);
      const rawClass=String(r[classKey]||'').trim();
      const rawSubject=String(r[subjectKey]||'').trim();

      // Aktiviti seperti PERHIMPUNAN/KOKUM tanpa kelas bukan sesi RPH.
      if(!day||!rawClass||!rawSubject)continue;

      const classId=matchClassValue(rawClass,null);
      if(!classId){
        missingClasses.add(rawClass);
        continue;
      }

      const subjectId=matchSubjectValue(rawSubject,null);
      if(!subjectId){
        missingSubjects.add(rawSubject);
        continue;
      }

      let start=null,end=null;

      if(timeKey&&r[timeKey]!==undefined){
        const parts=String(r[timeKey]).split(/\s*[-–—]\s*/);
        start=parseTimetableClock(parts[0]);
        end=parseTimetableClock(parts[1]);
      }

      if(!start&&startKey)start=parseTimetableClock(r[startKey]);
      if(!end&&endKey)end=parseTimetableClock(r[endKey]);

      if(!start||!end){
        badTime++;
        continue;
      }

      items.push({
        teacher_id:state.user.id,
        class_id:classId,
        subject_id:subjectId,
        day_of_week:day,
        start_time:start,
        end_time:end,
        academic_year:ay,
        source_document_id:null,
        notes:`Import jadual guru global: ${wanted}`
      });
    }

    if(!items.length)
      throw new Error('Tiada sesi dapat dipadankan kepada kelas/subjek dalam database.');

    if(state.connected&&state.user){
      // Buang hanya import automatik lama guru ini; rekod manual tidak disentuh.
      for(const pattern of [
        'Import automatik dari jadual%',
        'Import jadual guru global%'
      ]){
        const {error}=await state.client
          .from('timetable_entries')
          .delete()
          .eq('teacher_id',state.user.id)
          .eq('academic_year',ay)
          .ilike('notes',pattern);

        if(error)throw error;
      }

      const {error}=await state.client
        .from('timetable_entries')
        .upsert(items,{
          onConflict:'teacher_id,class_id,subject_id,day_of_week,start_time,academic_year'
        });

      if(error)throw error;

      await loadAll();
    }

    syncTimetableDelimaAccount();

    const extra=[];
    if(missingClasses.size)
      extra.push(`Kelas belum wujud: ${[...missingClasses].join(', ')}`);
    if(missingSubjects.size)
      extra.push(`Subjek belum wujud: ${[...missingSubjects].join(', ')}`);
    if(badTime)
      extra.push(`Masa gagal dibaca: ${badTime}`);

    const msg=`${items.length} sesi "${wanted}" berjaya diimport untuk ${ay}.`;

    const hint=$('#timetableImportHint');
    if(hint)hint.textContent=msg+(extra.length?' '+extra.join(' • '):'');

    toast(msg,6500);
    return items.length;

  }catch(e){
    console.error('importGlobalTimetableFile',e);
    toast('Import jadual gagal: '+e.message,7500);
    return 0;
  }
}

async function importSchoolMasterTimetable(file){
  if(!requireAuth()||!isAdmin())return toast('Admin sahaja.');
  try{
    const rows=await parseWorkbook(file);
    if(!rows.length)throw new Error('Fail jadual kosong.');

    const x=rows[0];
    const g=keyFind(x,['guru','nama guru']);
    const d=keyFind(x,['hari']);
    const sl=keyFind(x,['slot']);
    const k=keyFind(x,['kelas']);
    const sb=keyFind(x,['subjek aktiviti','subjek']);
    const tm=keyFind(x,['masa']);

    if(!g||!d||!k||!sb||!tm)
      throw new Error('Kolum Guru/Hari/Kelas/Subjek/Masa tidak lengkap.');

    const list=[];

    for(const r of rows){
      const teacher=String(r[g]||'').trim();
      const cls=String(r[k]||'').trim();
      const sub=String(r[sb]||'').trim();
      const day=parseDay(r[d]);
      const t=String(r[tm]||'').split(/\s*[-–—]\s*/);

      const start=parseTimetableClock(t[0]);
      const end=parseTimetableClock(t[1]);

      if(!teacher||!cls||!sub||!day||!start||!end)continue;

      list.push({
        teacher_name:teacher,
        day_of_week:day,
        slot:sl?(Number(r[sl])||null):null,
        start_time:start,
        end_time:end,
        class_name:cls,
        subject_code:sub
      });
    }

    const unique=[...new Map(list.map(v=>[
      `${teacherNameKey(v.teacher_name)}|${v.day_of_week}|${v.start_time}|${normKey(v.class_name)}|${normKey(v.subject_code)}`,v
    ])).values()];

    const ay=Number($('#schoolTimetableYear')?.value||2026);

    const {data,error}=await state.client.rpc(
      'admin_replace_school_timetable',
      {p_academic_year:ay,p_source_file:file.name,p_rows:unique}
    );

    if(error)throw error;

    toast(`Jadual Induk berjaya: ${data??unique.length} sesi.`);
    await loadAll();
    return data??unique.length;

  }catch(e){
    console.error('importSchoolMasterTimetable',e);
    toast('Import gagal: '+e.message,7000);
    return 0;
  }
}

async function attemptTimetableImport(file,documentId,subjectFallback,classFallback){
  const ext=file.name.split('.').pop().toLowerCase();if(!['xlsx','xls','csv'].includes(ext))return 0;
  try{
    const rows=await parseWorkbook(file);if(!rows.length){toast('Jadual: tiada baris data dikesan dalam fail.',5000);return 0}const sample=rows[0];
    const dayKey=keyFind(sample,['hari','day']),classKey=keyFind(sample,['kelas','class']),subjectKey=keyFind(sample,['subjek','subject','mata pelajaran']),timeKey=keyFind(sample,['masa','time','waktu']),startKey=keyFind(sample,['mula','start','masa mula']),endKey=keyFind(sample,['tamat','end','masa tamat']);
    if(!dayKey){toast('Jadual: kolum Hari/hari tidak dijumpai dalam fail.',5000);return 0}const items=[];
    for(const r of rows){const day=parseDay(r[dayKey]);const classId=matchClassValue(classKey?r[classKey]:'',classFallback);const subjectId=matchSubjectValue(subjectKey?r[subjectKey]:'',subjectFallback);if(!day||!classId||!subjectId)continue;let start=null,end=null;if(timeKey&&r[timeKey]!==undefined){const parts=String(r[timeKey]).split(/\s*[-–—]\s*/);start=parseClock(parts[0]);end=parseClock(parts[1])}if(!start&&startKey)start=parseClock(r[startKey]);if(!end&&endKey)end=parseClock(r[endKey]);items.push({teacher_id:state.user?.id||'demo',class_id:classId,subject_id:subjectId,day_of_week:day,start_time:start,end_time:end,academic_year:new Date().getFullYear(),source_document_id:documentId||null,notes:'Import automatik dari jadual XLSX/CSV'})}
    if(!items.length){toast('Jadual: tiada sesi dapat dipadankan. Pastikan nama Kelas dan Subjek dalam fail sepadan dengan senarai kelas/subjek anda.',6000);return 0}
    if(state.connected&&state.user){const {error}=await state.client.from('timetable_entries').upsert(items,{onConflict:'teacher_id,class_id,subject_id,day_of_week,start_time,academic_year'});if(error){console.warn('timetable import',error);toast('Import jadual gagal: '+error.message,7000);return 0}}
    toast(`${items.length} sesi jadual berjaya dikesan daripada ${file.name}.`);return items.length;
  }catch(e){console.warn('attemptTimetableImport',e);toast('Import jadual gagal: '+e.message,7000);return 0}
}
function teacherTimetableSessionsForDate(date){
  if(!date)return[];const d=new Date(date+'T00:00:00'),js=d.getDay(),day=js===0?7:js,ay=Number(String(date).slice(0,4));
  return state.timetable.filter(x=>Number(x.day_of_week)===day&&(!state.user||!x.teacher_id||x.teacher_id===state.user.id)&&(!x.academic_year||Number(x.academic_year)===ay)).sort((a,b)=>String(a.start_time||'99:99').localeCompare(String(b.start_time||'99:99')))
}
function scheduleTimeLabel(s){const a=String(s?.start_time||'').slice(0,5),b=String(s?.end_time||'').slice(0,5);return a&&b?`${a}–${b}`:(a||b||'Masa belum ditetapkan')}
function renderTeacherScheduleForDate({autoPick=true,silent=false}={}){
  const el=$('#rphSchedule'),date=$('#rphDate')?.value;if(!el||!date)return null;
  if(isAdmin()){
    el.innerHTML='<option value="">ADMIN — akses semua kelas / subjek</option>';
    if($('#rphTime'))$('#rphTime').value='';
    return null;
  }
  const sessions=teacherTimetableSessionsForDate(date);
  el.innerHTML=sessions.length?'<option value="">Pilih sesi jadual guru</option>'+sessions.map(s=>{const c=getClass(s.class_id),sub=getSubject(s.subject_id);return `<option value="${s.id}">${escapeHtml(scheduleTimeLabel(s))} • ${escapeHtml(c?.name||'Kelas')} • ${escapeHtml(sub?.name||'Subjek')}</option>`}).join(''):'<option value="">Tiada sesi jadual pada tarikh ini — pilih manual</option>';
  if(!sessions.length){if($('#rphTime'))$('#rphTime').value='';return null}
  let pick=null;
  if(autoPick){
    if(sessions.length===1)pick=sessions[0];
    else if(date===today){const now=new Date(),nowMin=now.getHours()*60+now.getMinutes();pick=[...sessions].sort((a,b)=>{const m=x=>{const [h,mi]=String(x.start_time||'23:59').slice(0,5).split(':').map(Number);return h*60+mi};return Math.abs(m(a)-nowMin)-Math.abs(m(b)-nowMin)})[0]}
    else pick=sessions[0];
    if(pick){el.value=pick.id;applyTeacherScheduleSession(pick,{silent:true})}
  }
  if(!silent&&sessions.length>1)toast(`${sessions.length} sesi jadual guru ditemui untuk tarikh ini. Sesi terdekat dipilih; anda boleh tukar pada senarai Sesi Jadual Guru.` ,5500);
  return pick
}
function applyTeacherScheduleSession(session,{silent=false}={}){
  if(!session)return;const classEl=$('#rphClass'),subEl=$('#rphSubject'),timeEl=$('#rphTime');
  if(classEl)classEl.value=session.class_id||'';if(subEl)subEl.value=session.subject_id||'';if(timeEl)timeEl.value=scheduleTimeLabel(session);
  renderRphClassHelper();renderRphBadges();renderRphLessonOptions();
  if(!silent){const c=getClass(session.class_id),sub=getSubject(session.subject_id);toast(`Jadual guru: ${scheduleTimeLabel(session)} • ${c?.name||''} • ${sub?.name||''}`,4500)}
}
function applyTimetableSuggestion(){return renderTeacherScheduleForDate({autoPick:true,silent:true})}

async function handleSourceFiles(type,files){if(!requireAuth())return;
  const subjectId=$('#sourceSubject').value,year=Number($('#sourceYear').value),academicYear=Number($('#sourceAcademicYear').value||new Date().getFullYear()),classId=$('#sourceClass').value||null;if(!subjectId)return toast('Pilih subjek dahulu.');if(!files.length)return;
  const card=$(`.upload-card[data-type="${type}"]`);card?.classList.add('busy');
  for(const file of files){
    let extraction={text:'',pageCount:null,method:'none',pages:[]},storagePath=null,storageStatus='pending',storageBucket='r2',savedDocId=null;
    try{
      showUploadProgress(`Memproses ${SOURCE_TYPES[type]}`,file.name,5);
      extraction=await extractTextFromFile(file,msg=>showUploadProgress(`Memproses ${SOURCE_TYPES[type]}`,msg,20));
      const wasTruncated=extraction.text.length>MAX_INDEX_CHARS;const chunks=chunkText(extraction.text);
      if(state.connected&&state.user){
        const stamp=Date.now(),path=`${state.user.id}/${subjectId}/${type}/${stamp}_${safeName(file.name)}`;
        const up=await uploadBinary(file,path,p=>showUploadProgress(`Upload ${file.name}`,p+'% ke Cloudflare R2',20+Math.round(p*.35)));storagePath=up.path;storageStatus=up.status;storageBucket='r2';
        const indexPath=`${state.user.id}/${subjectId}/indexes/${stamp}_${safeName(file.name)}.json`;
        const indexFile=new File([JSON.stringify({version:1,chunks,pages:(extraction.pages||[]).filter(p=>p.content)})],`${safeName(file.name)}.json`,{type:'application/json'});
        await uploadBinary(indexFile,indexPath,p=>showUploadProgress(`Indeks ${file.name}`,p+'% ke Cloudflare R2',55+Math.round(p*.17)));
        showUploadProgress(`Indeks ${file.name}`,`${chunks.length} bahagian teks`,72);
        const {data:doc,error}=await state.client.from('source_documents').insert({teacher_id:state.user.id,subject_id:subjectId,class_id:classId,year,academic_year:academicYear,source_type:type,title:file.name.replace(/\.[^.]+$/,''),file_name:file.name,mime_type:file.type||'',file_size:file.size,storage_bucket:storageBucket,storage_path:storagePath,extraction_status:chunks.length?(wasTruncated?'indexed_partial':'indexed'):(extraction.method==='image-no-ocr'?'stored_no_ocr':'stored_only'),extracted_chars:Math.min(extraction.text.length,MAX_INDEX_CHARS),page_count:extraction.pageCount,notes:null,metadata:{method:extraction.method,page_indexed:(extraction.pages||[]).length,r2_index_path:indexPath,r2_index_version:1}}).select().single();if(error)throw error;
        savedDocId=doc.id;
        await logAudit('UPLOAD_SOURCE',{document_id:doc.id,source_type:type,file_name:file.name,storage_status:storageStatus,chunks:chunks.length});
      }
      if(type==='timetable')await attemptTimetableImport(file,savedDocId,subjectId,classId);
      showUploadProgress(`Siap: ${file.name}`,`${chunks.length} bahagian teks disimpan di Cloudflare R2`,100);toast(`${file.name} selesai diproses.`)
    }catch(e){console.error(e);toast(`Gagal proses ${file.name}: ${e.message}`,6000)}
  }
  card?.classList.remove('busy');hideUploadProgress();if(state.connected&&state.user)await loadAll();else{renderSources();renderDashboard();renderSourceReadiness();renderRphBadges()}
}

function textDensity(doc){const pages=Math.max(1,Number(doc?.page_count||1));return Math.round(Number(doc?.extracted_chars||0)/pages)}
function isLowTextPdf(doc){return /pdf/i.test(String(doc?.mime_type||doc?.file_name||''))&&Number(doc?.page_count||0)>3&&textDensity(doc)<80}
function ocrProgressMeta(doc){const m=doc?.metadata||{};return {next:Number(m.ocr_next_page||1),done:Number(m.ocr_pages_done||0),complete:Boolean(m.ocr_complete)}}
function ocrLanguageForDoc(doc){
  const sub=getSubject(doc?.subject_id),name=normKey(`${sub?.code||''} ${sub?.name||''}`);
  if(/\b(pendidikan islam|pendidikan agama islam|p islam|pai|pi|bahasa arab|arabic|arab|ba)\b/.test(name))return'ara+msa+eng';
  return name.includes('bahasa melayu')||/\bbm\b/.test(name)?'msa+eng':'eng';
}
async function ensureOcrWorker(doc=null){
  const wanted=ocrLanguageForDoc(doc);if(OCR_WORKER&&OCR_WORKER_LANG===wanted)return OCR_WORKER;
  if(OCR_WORKER){try{await OCR_WORKER.terminate()}catch{}OCR_WORKER=null;OCR_WORKER_LANG=''}
  const label=wanted==='msa+eng'?'Bahasa Melayu + English':wanted==='ara+msa+eng'?'Arab/Jawi + Bahasa Melayu + English':'English';
  if(!window.Tesseract)throw new Error('Tesseract OCR belum dimuatkan. Pastikan internet aktif.');toast(`Memuatkan enjin OCR ${label}...`,5000);
  const opts={logger:m=>{if(m.status&&m.progress)showUploadProgress('OCR sumber',`${m.status} ${Math.round(m.progress*100)}%`,Math.round(m.progress*100))}};
  try{const langs=wanted.includes('+')?wanted.split('+'):wanted;OCR_WORKER=await Tesseract.createWorker(langs,1,opts);OCR_WORKER_LANG=wanted}
  catch(e){console.warn('OCR language fallback',e);OCR_WORKER=await Tesseract.createWorker('eng',1,opts);OCR_WORKER_LANG='eng';toast(`Paket OCR ${label} gagal dimuatkan; OCR diteruskan dengan English.`,5000)}
  return OCR_WORKER
}
async function loadStoredPdf(doc){if(!state.client||!state.user)throw new Error('Sambungan Supabase diperlukan.');if(!doc.storage_path)throw new Error('Fail asal tiada dalam Storage. Upload semula sumber ini.');let r;if(doc.storage_bucket==='r2'){const {data:{session}}=await state.client.auth.getSession();r=await fetch('/api/source-files/'+doc.storage_path.split('/').map(encodeURIComponent).join('/'),{headers:{authorization:`Bearer ${session?.access_token||''}`}})}else{const {data,error}=await state.client.storage.from(doc.storage_bucket||'source-files').createSignedUrl(doc.storage_path,900);if(error)throw error;r=await fetch(data.signedUrl)}if(!r.ok)throw new Error('Gagal mengambil PDF asal dari Storage.');const ab=await r.arrayBuffer();return await pdfjsLib.getDocument({data:ab}).promise}
async function saveOcrPage(doc,pageNo,text,r2Index=null){
  const clean=normalizeText(text);if(clean.length<8)return 0;
  if(r2Index){
    const pages=Array.isArray(r2Index.pages)?r2Index.pages:(r2Index.pages=[]),existing=pages.find(p=>Number(p.page_no)===Number(pageNo));
    const old=normalizeText(existing?.content||'');if(old.length>=120&&old.length>=clean.length*.85)return 0;
    const replacement={page_no:pageNo,content:clean,kind:'ocr',metadata:{kind:'ocr',ocr:true,engine:OCR_WORKER_LANG||'tesseract'}};
    if(existing)pages.splice(pages.indexOf(existing),1,replacement);else pages.push(replacement);pages.sort((a,b)=>Number(a.page_no)-Number(b.page_no));return clean.length;
  }
  const {data:existing}=await state.client.from('source_pages').select('content').eq('document_id',doc.id).eq('page_no',pageNo).maybeSingle();
  const old=normalizeText(existing?.content||'');
  // Buku teks digital biasanya mempunyai teks yang lebih tepat daripada OCR. OCR dijalankan sebagai semakan,
  // tetapi teks sedia ada dikekalkan jika lebih lengkap supaya indeks tidak merosot.
  if(old.length>=120&&old.length>=clean.length*.85)return 0;
  await state.client.from('source_pages').delete().eq('document_id',doc.id).eq('page_no',pageNo);const {error}=await state.client.from('source_pages').insert({document_id:doc.id,page_no:pageNo,content:clean,metadata:{kind:'ocr',ocr:true,engine:OCR_WORKER_LANG||'tesseract'}});if(error)throw error;return clean.length
}
async function ocrSourceBatch(id){if(!requireAuth())return;const doc=state.sources.find(x=>x.id===id);if(!doc)return toast('Sumber tidak ditemui.');if(!isLowTextPdf(doc)&&ocrProgressMeta(doc).complete)return toast('Sumber ini sudah mempunyai teks/OCR yang mencukupi.');if(!window.pdfjsLib)return toast('PDF.js belum dimuatkan.');try{const worker=await ensureOcrWorker(doc),pdf=await loadStoredPdf(doc),meta=ocrProgressMeta(doc),start=Math.max(1,meta.next),end=Math.min(pdf.numPages,start+OCR_BATCH_PAGES-1),r2Index=doc.metadata?.r2_index_path?await loadSourceIndex(doc):null;let chars=0,done=meta.done;for(let n=start;n<=end;n++){showUploadProgress(`OCR ${doc.file_name}`,`Halaman ${n}/${pdf.numPages}`,Math.round((n-start)/(Math.max(1,end-start+1))*100));const page=await pdf.getPage(n);const viewport=page.getViewport({scale:1.35});const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d',{willReadFrequently:true});canvas.width=Math.max(1,Math.floor(viewport.width));canvas.height=Math.max(1,Math.floor(viewport.height));await page.render({canvasContext:ctx,viewport}).promise;const res=await worker.recognize(canvas);chars+=await saveOcrPage(doc,n,res?.data?.text||'',r2Index);done++;canvas.width=1;canvas.height=1}
      if(r2Index)await saveSourceIndex(doc,r2Index,p=>showUploadProgress(`Simpan indeks OCR ${doc.file_name}`,`${p}% ke Cloudflare R2`,p));const complete=end>=pdf.numPages,next=complete?pdf.numPages+1:end+1,oldMeta=doc.metadata||{};const {error}=await state.client.from('source_documents').update({metadata:{...oldMeta,ocr_next_page:next,ocr_pages_done:done,ocr_complete:complete,ocr_engine:OCR_WORKER_LANG||'tesseract',r2_index_updated_at:r2Index?new Date().toISOString():oldMeta.r2_index_updated_at},extracted_chars:Number(doc.extracted_chars||0)+chars,extraction_status:complete?'indexed_ocr':'indexed_ocr_partial'}).eq('id',doc.id);if(error)throw error;hideUploadProgress();await loadAll();toast(complete?`OCR selesai untuk ${doc.file_name}. Analisis Lesson Map semula.`:`OCR halaman ${start}–${end} siap. Tekan Sambung OCR untuk halaman seterusnya.`,6500)}catch(e){hideUploadProgress();console.error(e);toast('OCR gagal: '+e.message,7000)}}

function renderSources(){
  const subId=$('#sourceSubject')?.value,year=Number($('#sourceYear')?.value||0),ay=Number($('#sourceAcademicYear')?.value||0);const docs=state.sources.filter(x=>(!subId||x.subject_id===subId)&&(!year||Number(x.year)===year)&&(!ay||Number(x.academic_year||ay)===ay));
  const selectedSubject=getSubject(subId);const emptyMsg=`Belum ada fail untuk ${escapeHtml(selectedSubject?.name||'subjek ini')} • Tahun ${year||'—'} • Sesi ${ay||'—'}. Jumlah fail semua subjek: ${state.sources.length}.`;
  $('#sourceRows').innerHTML=docs.map(d=>{const s=getSubject(d.subject_id),low=isLowTextPdf(d),om=ocrProgressMeta(d);let status=d.storage_path?`<span class="status-ok">${d.storage_bucket==='r2'?'R2':'Cloud'} ✓</span>`:state.connected?'<span class="status-warn">Teks sahaja</span>':'<span class="status-warn">Sesi demo</span>';if(low&&!om.complete)status+='<br><span class="status-warn">⚠ PDF scan / OCR perlu</span>';if(om.complete)status+='<br><span class="status-ok">OCR ✓</span>';const ocrEligible=['textbook','activity_book','dskp','rpt'].includes(d.source_type);const ocrBtn=state.connected&&d.storage_path&&/pdf/i.test(String(d.mime_type||d.file_name||''))&&!om.complete&&(low||om.done||ocrEligible)?`<button class="ghost ocr-source" data-id="${d.id}">${om.done?'Sambung OCR':(low?'OCR 12 hlm':'OCR pilihan')}</button>`:'';return `<tr><td>${escapeHtml(SOURCE_TYPES[d.source_type]||d.source_type)}</td><td><b>${escapeHtml(d.file_name||d.title)}</b></td><td>${escapeHtml(s?.name||'—')}<br><small>Tahun ${d.year||'—'} • Sesi ${d.academic_year||'—'}</small></td><td>${bytes(d.file_size)}</td><td>${Number(d.extracted_chars||0).toLocaleString()} aksara${d.page_count?`<br><small>${d.page_count} halaman • ${textDensity(d)} aks/hlm</small>`:''}</td><td>${status}<br><small>${escapeHtml(d.extraction_status||'—')}</small></td><td><div class="row-actions">${ocrBtn}<button class="danger delete-source" data-id="${d.id}">Buang</button></div></td></tr>`}).join('')||`<tr><td colspan="7">${emptyMsg}</td></tr>`;
  $$('.delete-source').forEach(b=>b.addEventListener('click',()=>deleteSource(b.dataset.id)));$$('.ocr-source').forEach(b=>b.addEventListener('click',()=>ocrSourceBatch(b.dataset.id)));
}
async function deleteSource(id){const d=state.sources.find(x=>x.id===id);if(!d)return;if(!confirm(`Buang sumber ${d.file_name||d.title}?`))return;if(state.connected&&state.user){try{if(d.storage_path){if(d.storage_bucket==='r2')await r2Fetch(d.storage_path,{method:'DELETE'});else{const {error:se}=await state.client.storage.from(d.storage_bucket||'source-files').remove([d.storage_path]);if(se)throw se}}if(d.metadata?.r2_index_path)await r2Fetch(d.metadata.r2_index_path,{method:'DELETE'});const {error}=await state.client.from('source_documents').delete().eq('id',id);if(error)throw error;await loadAll()}catch(e){return toast('Gagal buang: '+e.message)}}toast('Sumber dibuang.')}
async function migrateLegacySourcesToR2(){
  if(!requireAuth())return;
  const docs=state.sources.filter(d=>!d.metadata?.r2_index_path&&(!d.teacher_id||d.teacher_id===state.user.id));
  if(!docs.length)return toast('Semua sumber akaun ini sudah menggunakan indeks Cloudflare R2.');
  if(!confirm(`Pindahkan ${docs.length} sumber lama ke Cloudflare R2? Proses ini membaca setiap fail sekali daripada Supabase sebelum salinan lama dibuang.`))return;
  let done=0;
  for(const doc of docs){
    try{
      showUploadProgress('Migrasi Cloudflare R2',`${done+1}/${docs.length} • ${doc.file_name||doc.title}`,Math.round(done/docs.length*100));
      const [chunkResult,pageResult]=await Promise.all([
        fetchAllRows(state.client.from('source_chunks').select('chunk_no,content,char_start,char_end').eq('document_id',doc.id).order('chunk_no')),
        fetchAllRows(state.client.from('source_pages').select('page_no,content,metadata').eq('document_id',doc.id).order('page_no'))
      ]);
      if(chunkResult.error)throw chunkResult.error;if(pageResult.error)throw pageResult.error;
      const stamp=Date.now(),base=`${state.user.id}/${doc.subject_id||'unassigned'}`,indexPath=`${base}/indexes/${stamp}_${safeName(doc.file_name||doc.title||doc.id)}.json`;
      const indexFile=new File([JSON.stringify({version:1,chunks:chunkResult.data||[],pages:pageResult.data||[]})],`${safeName(doc.file_name||doc.id)}.json`,{type:'application/json'});
      await uploadBinary(indexFile,indexPath,()=>{});
      let storagePath=doc.storage_path,storageBucket=doc.storage_bucket;
      if(doc.storage_path&&doc.storage_bucket!=='r2'){
        const {data,error}=await state.client.storage.from(doc.storage_bucket||'source-files').createSignedUrl(doc.storage_path,900);if(error)throw error;
        const response=await fetch(data.signedUrl);if(!response.ok)throw new Error(`Fail asal tidak dapat dibaca (HTTP ${response.status}).`);
        const blob=await response.blob(),file=new File([blob],doc.file_name||'source.bin',{type:doc.mime_type||blob.type||'application/octet-stream'}),newPath=`${base}/${doc.source_type||'other'}/${stamp}_${safeName(doc.file_name||'source.bin')}`;
        const uploaded=await uploadBinary(file,newPath,()=>{});storagePath=uploaded.path;storageBucket='r2';
      }
      const metadata={...(doc.metadata||{}),r2_index_path:indexPath,r2_index_version:1,r2_migrated_at:new Date().toISOString()};
      const {error:updateError}=await state.client.from('source_documents').update({storage_path:storagePath,storage_bucket:storageBucket,metadata}).eq('id',doc.id);if(updateError)throw updateError;
      const [deleteChunks,deletePages]=await Promise.all([state.client.from('source_chunks').delete().eq('document_id',doc.id),state.client.from('source_pages').delete().eq('document_id',doc.id)]);if(deleteChunks.error)throw deleteChunks.error;if(deletePages.error)throw deletePages.error;
      if(doc.storage_path&&doc.storage_bucket!=='r2'){const {error}=await state.client.storage.from(doc.storage_bucket||'source-files').remove([doc.storage_path]);if(error)console.warn('Buang salinan Storage lama:',error)}
      done++;
    }catch(error){console.error('Migrasi R2',doc.id,error);hideUploadProgress();toast(`Migrasi berhenti pada ${doc.file_name||doc.title}: ${error.message}`,7000);await loadAll();return}
  }
  clearSourceReadCache();hideUploadProgress();await loadAll();toast(`${done} sumber berjaya dipindahkan ke Cloudflare R2.`,6000);
}
function sourceCount(type,subjectId,year,academicYear=null){return smartSourceDocs(subjectId,year,academicYear,[type]).length}
function renderSourceReadiness(){const sub=$('#sourceSubject')?.value,year=Number($('#sourceYear')?.value||1),ay=Number($('#sourceAcademicYear')?.value||new Date().getFullYear());if(!sub)return;$('#sourceReadiness').innerHTML=Object.entries(SOURCE_TYPES).filter(([k])=>!['timetable','other'].includes(k)).map(([k,v])=>{const n=sourceCount(k,sub,year,ay);return `<span class="ready-chip ${n?'yes':'no'}">${n?'✓':'○'} ${v}${n?` (${n})`:''}</span>`}).join('')}
function renderRphBadges(){const sub=$('#rphSubject')?.value,cls=getClass($('#rphClass')?.value),year=cls?.year,ay=Number(cls?.academic_year||String($('#rphDate')?.value||today).slice(0,4)||new Date().getFullYear());renderRphClassHelper();if(!sub||!year){if($('#rphSourceBadges'))$('#rphSourceBadges').innerHTML=!state.classes.length?'<span class="source-badge">○ Tambah kelas untuk aktifkan RPH</span>':'';renderRphGate(null);return}const required=['rpt','dskp','textbook'],ttCount=state.timetable.filter(x=>
  x.class_id===$('#rphClass')?.value&&
  x.subject_id===sub&&
  (!state.user||!x.teacher_id||x.teacher_id===state.user.id)&&
  (!x.academic_year||Number(x.academic_year)===ay)
).length,baCount=sourceCount('activity_book',sub,year,ay),week=Number($('#rphWeek')?.value||1),maps=state.lessonMaps.filter(x=>x.subject_id===sub&&Number(x.year)===Number(year)&&Number(x.academic_year)===ay&&Number(x.week_no)===week&&x.verification_status==='verified').length;$('#rphSourceBadges').innerHTML=required.map(k=>{const n=sourceCount(k,sub,year,ay);return `<span class="source-badge ${n?'have':''}">${n?'✓':'○'} ${SOURCE_TYPES[k]}${n?` ${n}`:''}</span>`}).join('')+`<span class="source-badge ${ttCount?'have':''}">${ttCount?'✓':'○'} Jadual Waktu${ttCount?` ${ttCount}`:''} <small>(opsyenal — auto-route)</small></span>`+`<span class="source-badge ${baCount?'have':''}">${baCount?'✓':'○'} Buku Aktiviti${baCount?` ${baCount}`:''} <small>(opsyenal)</small></span>`+`<span class="source-badge ${maps?'have':''}">${maps?'✓':'○'} Lesson Map Disahkan ${maps}</span>`;renderRphLessonOptions();renderRphGate(null)}

async function getChunksForSubject(subjectId,year,academicYear=null){
  let docs=smartSourceDocs(subjectId,year,academicYear);if(!docs.length)docs=smartSourceDocs(subjectId,year,null);if(!docs.length)docs=smartSourceDocs(null,year,academicYear);docs=docs.filter(d=>['rpt','dskp'].includes(d.source_type));if(!docs.length)return[];const ids=docs.map(x=>x.id),cacheKey=sourceReadCacheKey('chunks',docs);
  if(state.connected&&state.user)return cachedSourceRead(sourceReadCache.chunks,cacheKey,async()=>{
    const r2Docs=docs.filter(d=>d.metadata?.r2_index_path),legacyDocs=docs.filter(d=>!d.metadata?.r2_index_path);let chunks=[],pages=[];
    const indexes=await Promise.all(r2Docs.map(async doc=>({doc,index:await loadSourceIndex(doc)})));
    indexes.forEach(({doc,index})=>{chunks.push(...(index.chunks||[]).map(row=>({...row,document_id:doc.id})));pages.push(...(index.pages||[]).map(row=>({...row,document_id:doc.id,metadata:row.metadata||{kind:row.kind||'page'}})))});
    if(legacyDocs.length){
      const legacyIds=legacyDocs.map(d=>d.id),[chunkResult,pageResult]=await Promise.all([
        fetchAllRows(state.client.from('source_chunks').select('document_id,chunk_no,content').in('document_id',legacyIds).order('chunk_no')),
        fetchAllRows(state.client.from('source_pages').select('document_id,page_no,content,metadata').in('document_id',legacyIds).order('page_no'))
      ]);
      if(chunkResult.error)console.warn(chunkResult.error);if(pageResult.error)console.warn(pageResult.error);chunks.push(...(chunkResult.data||[]));pages.push(...(pageResult.data||[]));
    }
    const out=chunks.map(c=>({...c,doc:docs.find(d=>d.id===c.document_id)}));
    const pageRows=pages.filter(p=>String(p.content||'').trim()).map(p=>({document_id:p.document_id,chunk_no:100000+Number(p.page_no||0),content:p.content,metadata:p.metadata||{},_page_no:p.page_no,doc:docs.find(d=>d.id===p.document_id)}));
    return out.concat(pageRows);
  });
  return [];
}

async function getPagesForSubject(subjectId,year,types=['textbook','activity_book'],academicYear=null,pageNos=null){
  let docs=smartSourceDocs(subjectId,year,academicYear,types);if(!docs.length)docs=smartSourceDocs(subjectId,year,null,types);if(!docs.length)docs=smartSourceDocs(null,year,academicYear,types);if(!docs.length)return[];const ids=docs.map(x=>x.id),wanted=[...new Set((pageNos||[]).map(Number).filter(Boolean))],cacheKey=sourceReadCacheKey(`pages:${[...types].sort().join(',')}:${wanted.sort((a,b)=>a-b).join(',')||'all'}`,docs);
  if(state.connected&&state.user)return cachedSourceRead(sourceReadCache.pages,cacheKey,async()=>{
    const r2Docs=docs.filter(d=>d.metadata?.r2_index_path),legacyDocs=docs.filter(d=>!d.metadata?.r2_index_path);let rows=[];
    const indexes=await Promise.all(r2Docs.map(async doc=>({doc,index:await loadSourceIndex(doc)})));
    indexes.forEach(({doc,index})=>{
      const pages=(index.pages||[])
        .filter(p=>!wanted.length||wanted.includes(Number(p.page_no)))
        .map(p=>({...p,document_id:doc.id,metadata:p.metadata||{kind:p.kind||'page'}}));
      rows.push(...pages);
    });
    if(legacyDocs.length){let query=state.client.from('source_pages').select('document_id,page_no,content,metadata').in('document_id',legacyDocs.map(d=>d.id));if(wanted.length)query=query.in('page_no',wanted);const {data,error}=await fetchAllRows(query.order('page_no'));if(error)console.warn(error);else rows.push(...(data||[]))}
    return applyKnownBookProfilePages(annotatePrintedPages(rows.map(p=>({...p,doc:docs.find(d=>d.id===p.document_id)}))));
  });
  return []
}
const STOPWORDS=new Set('yang dan untuk dengan dalam pada daripada kepada adalah ini itu murid guru tahun minggu standard pembelajaran kandungan aktiviti serta boleh akan atau sebagai telah buku teks muka surat halaman the and for with from into this that pupils students teacher teachers year week standard learning content activity activities lesson lessons scheme work school class listening speaking reading writing language arts topic unit based book page pages'.split(' '));
function keywordSet(text){return [...new Set(normalizeText(text).toLowerCase().replace(/[^a-z0-9À-ž\s]/gi,' ').split(/\s+/).filter(w=>w.length>3&&!/^\d+$/.test(w)&&!STOPWORDS.has(w)))].slice(0,45)}
function textScore(text,keywords){const t=' '+normalizeText(text).toLowerCase()+' ';let score=0;keywords.forEach(k=>{if(t.includes(k))score+=1});return score}
function bestPages(pages,query,limit=4){const keys=keywordSet(query);return pages.map(p=>({...p,match:textScore(p.content,keys)})).filter(p=>p.match>0).sort((a,b)=>b.match-a.match||Number(a.printed_page||a.page_no)-Number(b.printed_page||b.page_no)).slice(0,limit)}
function numericPageCandidates(text,pdfPage){const nums=[...String(text||'').matchAll(/(?:^|[^\d.])(\d{1,3})(?![\d.])/g)].map(m=>Number(m[1])).filter(n=>n>0&&n<400&&Math.abs(n-Number(pdfPage))<=12);return [...new Set(nums)]}
function inferPrintedOffset(items){const votes=new Map(),pagesByOffset=new Map();for(const p of items){const pdf=Number(p.page_no);if(!pdf||pdf<4)continue;for(const n of numericPageCandidates(p.content,pdf)){const off=n-pdf;if(Math.abs(off)>12)continue;const k=String(off);if(!pagesByOffset.has(k))pagesByOffset.set(k,new Set());const set=pagesByOffset.get(k);if(set.has(pdf))continue;set.add(pdf);let weight=1;if(Math.abs(off)<=6)weight+=2;if(pdf>=20&&n>=15)weight+=2;if(pdf>=50&&n>=40)weight+=2;votes.set(k,(votes.get(k)||0)+weight)}}const ranked=[...votes.entries()].map(([k,score])=>({offset:Number(k),score,pages:pagesByOffset.get(k)?.size||0})).filter(x=>x.pages>=3).sort((a,b)=>b.score-a.score||b.pages-a.pages||Math.abs(a.offset)-Math.abs(b.offset));const best=ranked[0];return best&&best.score>=10?{offset:best.offset,confidence:Math.min(99,45+best.pages*7),method:'numeric-mode',votes:best.pages}:{offset:0,confidence:0,method:'unmapped',votes:0}}
function annotatePrintedPages(rows){const groups=new Map();for(const p of rows){if(!groups.has(p.document_id))groups.set(p.document_id,[]);groups.get(p.document_id).push(p)}const out=[];for(const items of groups.values()){const inferred=inferPrintedOffset(items);for(const p of items){const meta=p.metadata||{};const explicit=Number(meta.printed_page||0);const printed=explicit||Number(p.page_no)+Number(inferred.offset||0);out.push({...p,printed_page:printed>0?printed:Number(p.page_no),page_offset:explicit?explicit-Number(p.page_no):inferred.offset,page_mapping_confidence:explicit?100:inferred.confidence,page_mapping_method:explicit?'metadata':inferred.method})}}return out}
function pageDisplay(p,prefix='m/s'){if(!p)return '';const printed=Number(p.printed_page||p.page_no),pdf=Number(p.page_no);return `${prefix} ${printed}${pdf&&printed!==pdf?` (PDF hlm ${pdf})`:''}`}
const KNOWN_BOOK_PROFILES=[
  {name:'Super Minds 1 Student’s Book',family:'super-minds-1',test:d=>/super\s*minds?\s*1[\s._-]*.*student/i.test(String(d?.file_name||d?.title||'')),offset:-2,units:{1:[10,21],2:[22,33],3:[34,45],4:[46,57],5:[58,69],6:[70,81],7:[82,93],8:[94,105],9:[106,117]}},
  {name:'Super Minds 1 Workbook',family:'super-minds-1',test:d=>/super\s*minds?\s*1[\s._-]*.*workbook/i.test(String(d?.file_name||d?.title||'')),offset:0,units:{1:[10,21],2:[22,33],3:[34,45],4:[46,57],5:[58,69],6:[70,81],7:[82,93],8:[94,105],9:[106,117]}},
  // Verified against Get Smart Plus 3 Student's Book p. 91: printed page = PDF page.
  {name:'Get Smart Plus 3 Student’s Book',family:'get-smart-plus-3',test:d=>/get\s*smart\s*plus\s*3[\s._-]*.*student/i.test(String(d?.file_name||d?.title||'')),offset:0,units:{}},
  {name:'Get Smart Plus 3 Workbook',family:'get-smart-plus-3',test:d=>/get\s*smart\s*plus\s*3[\s._-]*.*workbook/i.test(String(d?.file_name||d?.title||'')),offset:0,units:{}},
  // Verified against the user-provided BM Tahun 2 PDFs: printed page = PDF page + offset.
  {name:'Bahasa Melayu Tahun 2 SK Jilid 1',family:'bm-y2-j1',test:d=>/bahasa[_\s-]*melayu.*tahun[_\s-]*2.*jilid[_\s-]*1/i.test(String(d?.file_name||d?.title||'')),offset:-7,units:{}},
  {name:'Bahasa Melayu Tahun 2 SK Jilid 2',family:'bm-y2-j2',test:d=>/bahasa[_\s-]*melayu.*tahun[_\s-]*2.*jilid[_\s-]*2/i.test(String(d?.file_name||d?.title||'')),offset:-5,units:{}},
  // Verified against the supplied Sains SK PDFs. These are page-number maps
  // only; the actual task still has to be read from the OCR text on that page.
  {name:'Sains Tahun 1 SK',family:'sains-y1',test:d=>/sains[_\s-]*tahun[_\s-]*1(?:[\s_.()_-]|$)/i.test(String(d?.file_name||d?.title||'')),offset:-8,units:{}},
  {name:'Sains Tahun 2 SK',family:'sains-y2',test:d=>/sains[_\s-]*tahun[_\s-]*2(?:[\s_.()_-]|$)/i.test(String(d?.file_name||d?.title||'')),offset:-6,units:{}},
  {name:'Sains Tahun 3 SK',family:'sains-y3',test:d=>/sains[_\s-]*tahun[_\s-]*3(?:[\s_.()_-]|$)/i.test(String(d?.file_name||d?.title||'')),offset:-8,units:{}}
];
const ENGLISH_Y2_SUPERMINDS_WEEK_GROUPS={
  5:[4,5,6,7,8,9,10],
  6:[10,11,12,13,14,15],
  7:[16,17,18,19,20,21,22],
  8:[23,24,25,26,27,28,29,30,31],
  9:[32,33,34,35,36]
};
function knownBookProfile(doc,unitNo=null){const hit=KNOWN_BOOK_PROFILES.find(x=>x.test(doc));if(!hit)return null;const r=unitNo&&hit.units[Number(unitNo)]?{start:hit.units[Number(unitNo)][0],end:hit.units[Number(unitNo)][1],method:'verified-book-profile'}:null;return {...hit,unitRange:r}}
function applyKnownBookProfilePages(rows=[]){return (rows||[]).map(p=>{const profile=knownBookProfile(p.doc);if(!profile)return p;const printed=Number(p.page_no)+Number(profile.offset||0);return {...p,printed_page:printed>0?printed:Number(p.printed_page||p.page_no),page_offset:Number(profile.offset||0),page_mapping_confidence:100,page_mapping_method:'verified-book-profile-global'};})}
function bookFamilyForDoc(doc){const n=normKey(`${doc?.file_name||''} ${doc?.title||''}`);if(/super\s*minds?\s*1/.test(n))return'super-minds-1';if(/get\s*smart\s*plus\s*3/.test(n))return'get-smart-plus-3';if(/linus\s*book\s*2/.test(n))return'linus-book-2';return''}
function sourceFamilyFromContext(text='',unit=null,subjectId=null){
  const n=normKey(text);
  if(/orientation\s*week/.test(n))return{id:'no-textbook',label:'Orientation Week',explicit:true,noBook:true};
  // Super Minds is an English-only book family. Science (and every other
  // subject) may also use "Unit 8" in its RPT, so unit numbers alone must
  // never route those subjects to an English textbook.
  if(lessonLanguage(subjectId)!=='en')return null;
  if(/linus\s*book\s*2/.test(n))return{id:'linus-book-2',label:'LINUS Book 2',explicit:true};
  if(/get\s*smart\s*plus\s*3/.test(n))return{id:'get-smart-plus-3',label:'Get Smart Plus 3',explicit:true};
  if(/super\s*minds?\s*1/.test(n))return{id:'super-minds-1',label:'Super Minds 1',explicit:true};
  const superTitles=/\bfree\s*time\b|\bthe\s*old\s*house\b|\bget\s*dressed\b|\bthe\s*robot\b|\bat\s*the\s*beach\b/.test(n);
  if((unit?.number>=5&&unit?.number<=9)||superTitles)return{id:'super-minds-1',label:'Super Minds 1',explicit:false};
  return null;
}
function filterPagesForSourceFamily(pages=[],family=null){if(!family?.id)return pages;if(family.noBook)return[];return pages.filter(p=>bookFamilyForDoc(p.doc)===family.id)}
function extractUnitInfo(text=''){
  const clean=normalizeText(text);const hits=[...clean.matchAll(/\b(?:unit|topic)\s*0?(\d{1,2})\b\s*(?:[|:\-–—]\s*|\n\s*)?([^\n|]{0,140})/ig)];
  for(const m of hits){let topic=cleanLessonTitle(m[2]||'').replace(/\btheme\b[\s\S]*$/i,'').replace(/\(\s*LP\s*\d+\s*[-–—]\s*\d+\s*\)/ig,'').trim();if(suspiciousTitle(topic))topic='';const number=Number(m[1]);if(number>=1&&number<=20)return {number,topic,source:/^topic/i.test(m[0])?'topic-number':'unit-number'}}
  return {number:null,topic:'',source:''}
}
function extractWeekGroup(text='',week){const vals=[...String(text||'').matchAll(/\b(?:minggu(?:\s*ke)?|week|wk)\s*[-:#.]?\s*0?(\d{1,2})\b/ig)].map(m=>Number(m[1])).filter(n=>n>=1&&n<=53);const weeks=[...new Set(vals)].sort((a,b)=>a-b);const pos=weeks.indexOf(Number(week));return {weeks,count:weeks.length,position:pos>=0?pos+1:null,grouped:weeks.length>1&&pos>=0,method:'rpt-context'}}
function resolveWeekGroup(text='',week,unit=null,subjectId=null,family=null){
  if(lessonLanguage(subjectId)==='en'&&family?.id==='super-minds-1'&&unit?.number&&ENGLISH_Y2_SUPERMINDS_WEEK_GROUPS[Number(unit.number)]){
    const weeks=ENGLISH_Y2_SUPERMINDS_WEEK_GROUPS[Number(unit.number)];const pos=weeks.indexOf(Number(week));
    if(pos>=0)return {weeks:[...weeks],count:weeks.length,position:pos+1,grouped:true,method:'rpt-unit-sequence'};
  }
  return extractWeekGroup(text,week);
}
function weekUnitCandidates(items=[],week){
  const ordered=[...items].filter(x=>Number(x.chunk_no||0)<100000).sort((a,b)=>Number(a.chunk_no||0)-Number(b.chunk_no||0));
  const full=ordered.map(x=>x.content||'').join('\n');const out=[];
  for(const ctx of extractAllWeekContexts(full,week)){const u=extractUnitInfo(ctx);if(!u.number)continue;const key=`${u.number}|${normKey(u.topic)}`;if(!out.some(x=>x.key===key))out.push({key,unit:u,context:ctx})}
  return out;
}
function ensureProfileUnitPages(pages=[],doc=null,profile=null,unitNo=null){
  const r=profile?.units?.[Number(unitNo)];if(!r||!doc)return pages;const byPrinted=new Map(pages.map(p=>[Number(p.printed_page||p.page_no),p]));const out=[...pages];
  for(let n=Number(r[0]);n<=Number(r[1]);n++){if(byPrinted.has(n))continue;out.push({document_id:doc.id,page_no:n-Number(profile.offset||0),content:'',metadata:{virtual:true,structural_page:true},doc,printed_page:n,page_offset:Number(profile.offset||0),page_mapping_confidence:100,page_mapping_method:'verified-book-profile-virtual'})}
  return out.sort((a,b)=>Number(a.printed_page||a.page_no)-Number(b.printed_page||b.page_no));
}
function topicMatchScore(text,topic=''){const keys=keywordSet(topic);if(!keys.length)return 0;const norm=normKey(text);let score=0;for(const k of keys){if(norm.includes(normKey(k)))score+=8}if(norm.includes(normKey(topic)))score+=24;return score}
function declaredUnitRange(items,unit){if(!unit?.topic)return null;for(const p of items){const text=normalizeText(p.content||'');if(topicMatchScore(text,unit.topic)<8)continue;const near=text.toLowerCase();let m=near.match(/pages?\s*[:.]?\s*(\d{1,3})\s*[-–—]\s*(\d{1,3})/i);if(m){const a=Number(m[1]),b=Number(m[2]);if(a>0&&b>=a&&b-a<=40)return {start:a,end:b,source_pdf_page:Number(p.page_no),method:'declared-range'}}const idx=near.indexOf(normKey(unit.topic));const seg=idx>=0?near.slice(Math.max(0,idx-90),idx+180):near;const nums=[...seg.matchAll(/\b(\d{1,3})\b/g)].map(x=>Number(x[1])).filter(n=>n>3&&n<300);for(let i=0;i<nums.length;i++)for(let j=i+1;j<nums.length;j++){const a=Math.min(nums[i],nums[j]),b=Math.max(nums[i],nums[j]);if(b-a>=5&&b-a<=30)return {start:a,end:b,source_pdf_page:Number(p.page_no),method:'near-topic-range'}}}return null}
function unitHeadingPage(items,unit){if(!unit?.topic)return null;const ranked=items.map(p=>{const text=String(p.content||'');let score=topicMatchScore(text,unit.topic);const head=normalizeText(text).slice(0,450);if(unit.number&&new RegExp(`(?:^|\\s)${unit.number}(?:\\s|$)`).test(head))score+=16;if(/contents|map of the book/i.test(head))score-=18;return {...p,_unitScore:score}}).filter(p=>p._unitScore>0).sort((a,b)=>b._unitScore-a._unitScore||Number(a.page_no)-Number(b.page_no));return ranked[0]||null}
function applyDocOffset(items,offset,method='unit-calibrated',confidence=96){return items.map(p=>({...p,printed_page:Number(p.page_no)+Number(offset||0),page_offset:Number(offset||0),page_mapping_method:method,page_mapping_confidence:confidence}))}
function groundUnitPages(items,unit,weekGroup){if(!items.length)return {pages:items,unitRange:null,weekRange:null,mapping:null};const groups=new Map();for(const p of items){if(!groups.has(p.document_id))groups.set(p.document_id,[]);groups.get(p.document_id).push(p)}let best=null;for(const raw of groups.values()){let pages=[...raw];const doc=raw[0]?.doc;const profile=knownBookProfile(doc,unit?.number);let declared=profile?.unitRange||declaredUnitRange(pages,unit);let heading=unitHeadingPage(pages,unit);let mapping=null;if(profile){pages=applyDocOffset(pages,profile.offset,'verified-book-profile',100);pages=ensureProfileUnitPages(pages,doc,profile,unit?.number);mapping={offset:profile.offset,method:'verified-book-profile',confidence:100,profile:profile.name};heading=unitHeadingPage(pages,unit)}else if(declared&&heading){const off=Number(declared.start)-Number(heading.page_no);if(Math.abs(off)<=20){pages=applyDocOffset(pages,off,'unit-range+heading',99);mapping={offset:off,method:'unit-range+heading',confidence:99}}}if(!mapping){const inf=inferPrintedOffset(pages);pages=applyDocOffset(pages,inf.offset,inf.method,inf.confidence);mapping=inf}const groundedHeading=unitHeadingPage(pages,unit);let unitRange=declared;if(!unitRange&&groundedHeading){const start=Number(groundedHeading.printed_page||groundedHeading.page_no);unitRange={start,end:start+15,method:'heading-window'}}if(unitRange){const max=Math.max(...pages.map(p=>Number(p.printed_page||p.page_no)).filter(Boolean));unitRange.end=Math.min(unitRange.end,max||unitRange.end)}const score=(groundedHeading?groundedHeading._unitScore:0)+(declared?45:0)+(mapping.confidence||0)/5+(profile?80:0);if(!best||score>best.score)best={score,pages,unitRange,mapping,heading:groundedHeading,profile}}if(!best)return {pages:items,unitRange:null,weekRange:null,mapping:null};let weekRange=null;if(best.unitRange&&weekGroup?.grouped&&weekGroup.position){const len=best.unitRange.end-best.unitRange.start+1;const a=best.unitRange.start+Math.floor((weekGroup.position-1)*len/weekGroup.count);const b=best.unitRange.start+Math.max(0,Math.floor(weekGroup.position*len/weekGroup.count)-1);weekRange={start:a,end:Math.max(a,b),method:'unit-progression',position:weekGroup.position,count:weekGroup.count}}return {...best,weekRange}}
function pageInRange(p,r){const n=Number(p.printed_page||p.page_no);return !r||(n>=Number(r.start)&&n<=Number(r.end))}
function weekPattern(week){return new RegExp(`\\b(?:minggu(?:\\s*ke)?|week|wk)\\s*[-:#.]?\\s*0?${Number(week)}\\b`,'i')}
function exactWeekInText(text,week){return weekPattern(week).test(normalizeText(text))}
function extractWeekContext(text,week){const clean=normalizeText(text);const re=weekPattern(week),m=re.exec(clean);if(!m)return '';const start=m.index,after=m.index+m[0].length,tail=clean.slice(after);const next=/\b(?:minggu(?:\s*ke)?|week|wk)\s*[-:#.]?\s*(\d{1,2})\b/ig;let nm,end=Math.min(clean.length,m.index+5200);while((nm=next.exec(tail))){if(Number(nm[1])!==Number(week)){end=after+nm.index;break}}return clean.slice(start,end)}
function extractAllWeekContexts(text,week){
  const clean=normalizeText(text);if(!clean)return[];const re=new RegExp(weekPattern(week).source,'ig');const hits=[];let m;while((m=re.exec(clean))){const start=m.index,after=m.index+m[0].length,tail=clean.slice(after);const next=/\b(?:minggu(?:\s*ke)?|week|wk)\s*[-:#.]?\s*(\d{1,2})\b/ig;let nm,end=Math.min(clean.length,start+9000);while((nm=next.exec(tail))){if(Number(nm[1])!==Number(week)){end=after+nm.index;break}}hits.push(clean.slice(start,end));if(hits.length>=20)break}return hits}
function contextQuality(ctx){const cc=extractSkSp(ctx);let score=cc.spCodes.length*24+cc.skCodes.length*9+Math.min(18,Math.floor(String(ctx||'').length/350));if(/learning standard|content standard|standard pembelajaran|standard kandungan|lesson|activity|activities|objective|objektif|topic|theme|unit/i.test(ctx))score+=12;return score}
function dateTokens(text=''){const clean=normalizeText(text);const out=[];const re=/\b(\d{1,2}[.\/-]\d{1,2}[.\/-](?:\d{2}|\d{4}))\b/g;let m;while((m=re.exec(clean))){out.push(m[1].replace(/[\/-]/g,'.'));if(out.length>=6)break}return [...new Set(out)]}
function contextAroundIndex(full,index,radiusBefore=1800,radiusAfter=6200){const a=Math.max(0,index-radiusBefore),b=Math.min(full.length,index+radiusAfter);return full.slice(a,b)}
function bestWeekContextForDoc(items,week){
  const ordered=[...items].sort((a,b)=>Number(a.chunk_no||0)-Number(b.chunk_no||0));
  const full=ordered.map(x=>x.content||'').join('\n');
  const candidates=[];
  for(const ctx of extractAllWeekContexts(full,week))candidates.push({ctx,bonus:20,why:'week-block'});
  const re=new RegExp(weekPattern(week).source,'ig');let m;
  while((m=re.exec(full))){
    const around=contextAroundIndex(full,m.index,900,7600);candidates.push({ctx:around,bonus:14,why:'week-neighbour'});
    const tokens=dateTokens(around).slice(0,2);
    if(tokens.length){
      const normalizedFull=full.replace(/[\/-]/g,'.');
      let pos=0,hits=0;
      while((pos=normalizedFull.indexOf(tokens[0],pos))>=0&&hits<12){
        const w=contextAroundIndex(full,pos,1200,7600);const hasSecond=tokens.length<2||w.replace(/[\/-]/g,'.').includes(tokens[1]);
        if(hasSecond)candidates.push({ctx:w,bonus:28,why:'date-range-repeat'});pos+=tokens[0].length;hits++;
      }
    }
    if(candidates.length>40)break;
  }
  ordered.forEach((it,i)=>{if(exactWeekInText(it.content||'',week)){const a=Math.max(0,i-2),b=Math.min(ordered.length,i+6);candidates.push({ctx:ordered.slice(a,b).map(x=>x.content||'').join('\n'),bonus:18,why:'item-window'})}});
  if(!candidates.length)return '';
  const scored=candidates.map(x=>{const cc=extractSkSp(x.ctx);const uniqueWeeks=[...new Set((x.ctx.match(/\b(?:minggu(?:\s*ke)?|week|wk)\s*[-:#.]?\s*(\d{1,2})\b/ig)||[]).map(v=>(v.match(/(\d{1,2})\s*$/)||[])[1]).filter(Boolean))];const bleed=Math.max(0,uniqueWeeks.length-2)*12;return {...x,score:contextQuality(x.ctx)+x.bonus+cc.spCodes.length*18-bleed}}).sort((a,b)=>b.score-a.score||b.ctx.length-a.ctx.length);
  return scored[0]?.ctx||'';
}
function extractPageRefs(text){const clean=normalizeText(text);const out=[];const re=/(?:page|pages|pg|pp\.?|p\.|m\/?s|ms|hlm|halaman|hal)\s*[:.]?\s*(\d{1,3})(?:\s*[-–—]\s*(\d{1,3}))?/ig;let m;while((m=re.exec(clean))){let a=Number(m[1]),b=Number(m[2]||m[1]);if(a>0&&a<500&&b>=a&&b-a<=8){for(let n=a;n<=b;n++)out.push(n)}}const re2=/\b(?:super\s*minds?|student(?:'s)?\s*book|buku\s*teks|textbook|\bsb\b)\b[^0-9]{0,14}(?:[1-2]\s*[:.]\s*)?(\d{1,3})\s*[-–—]\s*(\d{1,3})\b/ig;while((m=re2.exec(clean))){let a=Number(m[1]),b=Number(m[2]);if(a>0&&a<500&&b>=a&&b-a<=12){for(let n=a;n<=b;n++)out.push(n)}}return [...new Set(out)].slice(0,14)}

function cleanLessonTitle(raw=''){let t=normalizeText(raw).replace(/^[-–—:•\s]+/,'').trim();t=t.replace(/^\d{1,2}\s+(?=[A-Za-z])/,'').trim();t=t.replace(/\s+\b(?:theme|tema)\b[\s\S]*$/i,'').trim();t=t.replace(/\b\d{1,2}\.\d{1,2}\.\d{1,2}\b[\s\S]*$/,'').trim();t=t.replace(/\b(?:content|learning)\s+standard[\s\S]*$/i,'').trim();t=t.replace(/\b(?:standard kandungan|standard pembelajaran)[\s\S]*$/i,'').trim();t=t.replace(/\b(?:listening|speaking|reading|writing|language arts)\b[\s\S]*$/i,'').trim();t=t.replace(/^[a-z]\s+(?:and|or)\s+/,'').trim();return t.replace(/[|:;,\-–—\s]+$/,'').trim()}
function suspiciousTitle(t=''){const x=String(t||'').trim();return !x||x.length<4||x.length>110||/^[a-z]/.test(x)||/^s\s+and\b/i.test(x)||/^[\/|\-–—\s]*(?:week|wk|minggu)[\s\/|\-–—]*(?:topic|tajuk|theme|tema)?[\s\/|\-–—]*$/i.test(x)||/^(?:week|wk|minggu|topic|tajuk|theme|tema|unit)(?:\s*\/\s*(?:week|wk|minggu|topic|tajuk|theme|tema|unit))*$/i.test(x)||/\b(?:understand|recognise|recognize|identify|describe|specific information|main idea)\b/i.test(x)||/\d{1,2}\.\d{1,2}\.\d{1,2}/.test(x)}
function detectTitleFromContext(text,week){const clean=normalizeText(text);if(!clean)return '';const labelled=[...clean.matchAll(/(?:topic|tajuk|tema|theme|unit)\s*[:\-–—]?\s*([^|\n]{4,140})/ig)].map(m=>cleanLessonTitle(m[1])).find(t=>!suspiciousTitle(t));if(labelled)return labelled;const lines=clean.split('\n').map(x=>x.trim()).filter(Boolean);const bad=/^(\[halaman|minggu|week|wk|tarikh|date|standard|sk\b|sp\b|objektif|aktiviti|cadangan|tema|theme|topic|unit\s*\d*$|scheme of work|listening|speaking|reading|writing|language arts|content standard|learning standard)/i;for(const l of lines){if(l.length>=5&&l.length<=120&&!bad.test(l)&&!new RegExp(`\\b${week}\\b`).test(l)&&!(/^(\d+[.\-/]\d+|\d{1,2}\s+[A-Za-z]+)/.test(l))){const t=cleanLessonTitle(l);if(!suspiciousTitle(t))return t}}return ''}
function detectBookHeading(text=''){const lines=normalizeText(text).split('\n').map(x=>x.trim()).filter(Boolean);for(const l of lines.slice(0,22)){const t=cleanLessonTitle(l);if(t.length>=4&&t.length<=90&&!suspiciousTitle(t)&&!/^(page|student|pupil|teacher|activity|lesson|read|listen|write|speak|look|match|complete|answer|unit\s*\d+)/i.test(t))return t}return ''}
function standardDetails(context=''){const clean=normalizeText(context);const re=/\b(\d{1,2}\.\d{1,2}\.\d{1,2})\b/g;const hits=[];let m;while((m=re.exec(clean))){if(validSpCode(m[1]))hits.push({code:m[1],index:m.index,end:re.lastIndex});if(hits.length>=30)break}return hits.map((h,i)=>{let desc=clean.slice(h.end,(hits[i+1]?.index??Math.min(clean.length,h.end+420))).replace(/^[\s:;,.\-–—]+/,'').replace(/\s+/g,' ').trim();desc=desc.split(/(?:\b(?:week|lesson|activity|activities|content standard|learning standard)\b)/i)[0].trim();if(desc.length>260)desc=desc.slice(0,260).replace(/\s+\S*$/,'')+'…';return {code:h.code,description:desc}}).filter(x=>x.description.length>=8)}
function codeRegex(code=''){const parts=String(code).split('.').map(x=>x.replace(/[^0-9]/g,''));if(parts.length!==3||parts.some(x=>!x))return null;return new RegExp(`(?:^|[^0-9])${parts[0]}\\s*\\.\\s*${parts[1]}\\s*\\.\\s*${parts[2]}(?:[^0-9]|$)`,'i')}
function dskpDetailForCode(content='',code=''){
  const clean=normalizeText(content);const parts=String(code).split('.').map(x=>x.replace(/[^0-9]/g,''));if(!clean||parts.length!==3)return null;
  const core=new RegExp(`${parts[0]}\\s*\\.\\s*${parts[1]}\\s*\\.\\s*${parts[2]}`,'i');const m=core.exec(clean);if(!m)return null;
  let tail=clean.slice(m.index+m[0].length,Math.min(clean.length,m.index+m[0].length+620)).replace(/^[\s:;,.-–—]+/,'').trim();
  const next=tail.search(/\b\d{1,2}\s*\.\s*\d{1,2}\s*\.\s*\d{1,2}\b/);if(next>8)tail=tail.slice(0,next).trim();
  tail=tail.replace(/\s+/g,' ').replace(/^(?:learning standard|standard pembelajaran)\s*/i,'').trim();if(tail.length>320)tail=tail.slice(0,320).replace(/\s+\S*$/,'')+'…';
  return {code,description:tail.length>=8?tail:''};
}
function crosscheckDskpCodes(codes=[],chunks=[]){
  const wanted=[...new Set(codes)].filter(validSpCode),matches=[],missing=[];
  for(const code of wanted){const rx=codeRegex(code);const hits=rx?chunks.filter(x=>rx.test(normalizeText(x.content||''))):[];if(!hits.length){missing.push(code);continue}
    const ranked=hits.map(x=>{const d=dskpDetailForCode(x.content,code);let score=(d?.description?.length||0)+(/learning standard|standard pembelajaran/i.test(x.content||'')?60:0);return {...x,_detail:d,_dscore:score}}).sort((a,b)=>b._dscore-a._dscore);
    matches.push({code,chunk:ranked[0],detail:ranked[0]?._detail||null});
  }
  const details=matches.map(x=>x.detail).filter(x=>x?.description);const ok=wanted.length>0&&missing.length===0;
  const text=matches.map(x=>`${x.code} — ${x.detail?.description||snippet(x.chunk?.content||'',360)}`).join('\\n');
  const refs=[...new Set(matches.map(x=>sourceRef(x.chunk?.doc)).filter(Boolean))];
  return {ok,wanted,matches,missing,details,text,ref:refs.join(' / '),coverage:wanted.length?matches.length/wanted.length:0};
}
function lessonProfile(subjectId){
  const sub=getSubject(subjectId);
  const key=normKey(`${sub?.code||''} ${sub?.name||''}`);

  if(/\b(english|bahasa inggeris|bi|eng)\b/.test(key))
    return {lang:'en',dir:'ltr',script:'latin'};

  if(/\b(bahasa arab|arabic|arab|ba)\b/.test(key))
    return {lang:'ar',dir:'rtl',script:'arabic'};

  if(/\b(pendidikan islam|pendidikan agama islam|p islam|pai|pi)\b/.test(key))
    return {lang:'jawi',dir:'rtl',script:'jawi'};

  return {lang:'ms',dir:'ltr',script:'latin'};
}

function lessonLanguage(subjectId){
  return lessonProfile(subjectId).lang;
}
const ENGLISH_LS_CANONICAL={
  '1.1.1':'Recognise and reproduce with support a range of high frequency target language phonemes',
  '1.2.2':'Understand with support specific information and details of simple sentences',
  '3.2.2':'Understand specific information and details of simple sentences',
  '3.2.3':'Reread a word, phrase or sentence to understand meaning',
  '4.3.1':'Use capital letters and full stops appropriately in guided writing at sentence level',
  '4.3.2':'Spell a narrow range of familiar high frequency words accurately in guided writing',
  '4.3.3':'Plan, draft and write simple sentences'
};
function canonicalStandardDescription(detail=null,subjectId=null){if(!detail)return '';const raw=String(detail.description||'').trim();if(lessonLanguage(subjectId)==='en'&&ENGLISH_LS_CANONICAL[detail.code])return ENGLISH_LS_CANONICAL[detail.code];return raw}
function lowerFirstSentence(s=''){const x=String(s||'').trim().replace(/[.]+$/,'');return x?x.charAt(0).toLowerCase()+x.slice(1):''}
function cleanTaskForObjective(s=''){return String(s||'').replace(/^[\s\d.)-]+/,'').replace(/\s+/g,' ').replace(/[.]+$/,'').trim()}
function domainOfInstruction(s=''){const t=String(s||'').toLowerCase();const out=[];if(/\blisten(?:ing)?\b|\bhear\b|\baudio\b/.test(t))out.push(1);if(/\bsay\b|\bspeak(?:ing)?\b|\bask and answer\b|\btalk\b|\bact out\b|\brole[- ]?play\b|\btell\b|\bpresent\b/.test(t))out.push(2);if(/\bread(?:ing)?\b|\breread\b|\bfind who says\b/.test(t))out.push(3);if(/\bwrite\b|\bwriting\b|\bspell\b|\bcomplete (?:the )?(?:sentence|sentences|text|table|chart)\b|\bdraw and write\b/.test(t))out.push(4);if(/\bsong\b|\brhyme\b|\bpoem\b|\bstory\b|\bimagin(?:e|ative)\b|\bchant\b/.test(t))out.push(5);return out}
function sourceTaskForDomain(text='',domain=null){const acts=cleanInstructionSentences(text);if(!acts.length)return '';const hit=acts.find(a=>domainOfInstruction(a).includes(Number(domain)));return cleanTaskForObjective(hit||acts[0])}
function sourceTaskForStandard(detail=null,text='',subjectId=null){if(!detail?.code)return '';const acts=cleanInstructionSentences(text),domain=Number(String(detail.code).split('.')[0]),desc=canonicalStandardDescription(detail,subjectId).toLowerCase(),code=String(detail.code);let pool=acts.filter(a=>domainOfInstruction(a).includes(domain));if(!pool.length)pool=acts;if(!pool.length)return '';const score=a=>{const t=a.toLowerCase();let sc=textScore(a,keywordSet(desc))*2;if((code==='1.2.2'||/specific information|details/.test(desc))&&/(listen).*(tick|write|answer|match|choose|find|number)/i.test(a))sc+=28;if((code==='3.2.2'||/specific information|details/.test(desc))&&/(read).*(write|answer|match|choose|find|number|tick)/i.test(a))sc+=26;if(code==='3.2.3'&&/reread/i.test(a))sc+=35;if(code==='4.3.3'||/plan, draft and write|write simple sentences/.test(desc)){if(/\bwrite about\b/i.test(a))sc+=60;if(/\bwrite (?:a|your|simple)\b|\bdraw and write\b/i.test(a))sc+=35;if(/^read and write\b/i.test(a))sc+=4}if(code==='4.3.2'||/spell|spelling/.test(desc)){if(/spell|missing letters|write the words|write the names/i.test(a))sc+=30}if(code==='4.3.1'||/capital letters|full stops/.test(desc)){if(/capital|full stop|punctuat/i.test(a))sc+=30}if(code==='1.1.1'||/phoneme|recognise and reproduce/.test(desc)){if(/phonics|sound|repeat|listen and say/i.test(a))sc+=28}return sc};pool.sort((a,b)=>score(b)-score(a));return cleanTaskForObjective(pool[0])}

function cleanLearningStandardStatement(desc=''){
  let s=normalizeText(desc)
    .replace(/^Murid\s+(?:(?:boleh|dapat)\s*:?\s*)?/i,'')
    .replace(/\s+/g,' ')
    .trim();
  const stop=s.search(/\.\s+(?=(?:Murid|STANDARD|TAHAP|TP\s*\d|Cadangan|Catatan)\b)/i);
  if(stop>8)s=s.slice(0,stop+1);
  s=s.replace(/\s+(?:STANDARD PRESTASI|TAHAP PENGUASAAN|CATATAN)\b[\s\S]*$/i,'').trim();
  return s.replace(/[.;,:\s]+$/,'').trim();
}

function isUsableStandardDescription(detail=null,subjectId=null){
  if(!detail?.code)return false;
  const s=cleanLearningStandardStatement(canonicalStandardDescription(detail,subjectId));
  if(s.length<10||/(?:STANDARD PRESTASI|TAHAP PENGUASAAN|PERFORMANCE LEVEL|DESCRIPTORS?)/i.test(s))return false;
  const foreignCodes=(s.match(/\b\d{1,2}\.\d{1,2}\.\d{1,2}\b/g)||[]).filter(code=>code!==String(detail.code));
  if(foreignCodes.length)return false;
  if(lessonLanguage(subjectId)==='en')return /^(?:recognise|recognize|understand|give|find|name|describe|introduce|keep|ask|identify|blend|segment|read|use|spell|plan|draft|write|respond|express|connect|communicate|enjoy|predict|follow|listen|say|tell|compare|classify|complete)\b/i.test(s);
  return /^(?:membanding|mengenal|membuat|menjalankan|menyelesaikan|mereka|menghasilkan|mengitlak|menghubungkaitkan|menyatakan|menyenaraikan|menamakan|memberi|mengelaskan|menyusun|mengukur|merekod|memerhati|memerihalkan|menerangkan|menentukan|mengecam|memadankan|melukis|melabel|membina|menjelaskan|menghuraikan|berkomunikasi|membaca|menulis|mendengar|bertutur|melengkapkan|menjawab|memilih|menyalin|menyebut|melafazkan|menyanyikan|menceritakan)\b/i.test(s);
}

function standardDescriptionForObjective(detail=null,bookText='',subjectId=null){
  if(isUsableStandardDescription(detail,subjectId))return canonicalStandardDescription(detail,subjectId);
  const task=exactBookTaskLines(bookText,5).find(x=>!isTruncatedSourceActivity(x)&&!isGenericBookReference(x));
  if(task){return cleanSourceActivityPhrase(task)
    .replace(/^(?:Bimbing|Minta)\s+murid\s+(?:untuk\s+)?/i,'')
    .replace(/^Murid\s+/i,'')
    .trim()}
  return canonicalStandardDescription(detail,subjectId);
}

function standardActionParts(desc=''){
  const statement=cleanLearningStandardStatement(desc);
  const rx=/^(membina\s+dan\s+menulis|membaca\s+dan\s+memahami|mendengar\s+dan\s+bertutur|membandingkan\s+dan\s+membezakan|membanding\s+beza|membandingkan|mengenal\s+pasti|membuat\s+inferens|membuat\s+ramalan|membuat\s+kesimpulan|membuat\s+urutan|menjalankan\s+penyiasatan|menyelesaikan\s+masalah|mereka\s+bentuk|menghasilkan|mengitlak|menghubungkaitkan|menyatakan|menyenaraikan|menamakan|memberi\s+contoh|mengelaskan|menyusun|mengukur|merekodkan?|memerhati|memerihalkan|menerangkan|menentukan|mengecam|memadankan|melukis|melabel|membina|menjelaskan|menghuraikan|berkomunikasi|membaca|menulis|mendengar|bertutur|melengkapkan|menjawab|memilih|menyalin|menyebut|melafazkan|menyanyikan|menceritakan)\s+(.+)$/i;
  const m=rx.exec(statement);
  let focus=(m?.[2]||statement)
    .replace(/\s+seperti\s+[\s\S]*$/i,'')
    .replace(/\s+dengan\s+menjalankan\s+[\s\S]*$/i,'')
    .replace(/[.;,:\s]+$/,'')
    .trim();
  let verb=(m?.[1]||'').toLowerCase().replace(/\s+/g,' ');
  if(/^(?:membandingkan dan membezakan|membandingkan)$/.test(verb))verb='membanding beza';
  return {statement,verb,focus};
}

function objectiveTargetCount(year=1,writing=false){
  const y=Math.max(1,Math.min(6,Number(year)||1));
  return writing?Math.min(4,y+1):Math.min(4,y+2);
}

function isLogicalObjectiveText(text=''){
  const s=String(text||'').trim();
  if(s.length<28)return false;
  if(/(?:menunjukkan\s+penguasaan\s+SP|evidens\s+yang\s+selaras\s+dengan\s+SP|demonstrate\s+Learning\s+Standard|observable\s+evidence\s+that\s+matches|mengikut\s+objektif|according\s+to\s+the\s+objective|kehendak\s+tugasan|respons\s+tepat\s+yang\s+boleh\s+disemak|tugasan\s+[“"]?sumber[”"]?|the\s+(?:source|listening|reading|writing|learning)\s+task)/i.test(s))return false;
  const observable=/(?:menyatakan|menyenaraikan|memberikan|mengenal pasti|mengelaskan|membanding|memerhati|mengukur|merekod|melabel|melukis|membina|menghasilkan|menjelaskan|menulis|membaca|memadankan|menentukan|menyusun|mengitlak|menyelesaikan|melengkapkan|menyampaikan|menyanyikan|menyebut|melafazkan|menceritakan|mengikuti|menjawab|respons|identify|classify|compare|observe|measure|record|label|draw|build|produce|explain|write|read|spell|reproduce|complete|respond|response|give|select|locate|point|follow|answer)/i.test(s);
  const measurable=/(?:sekurang-kurangnya|\b(?:satu|dua|tiga|empat)\b|dengan tepat|\b(?:tepat|betul|sesuai|relevan|tersusun|berfungsi)\b|boleh disemak|\b\d+\b|at least|accurately|correct|appropriate|relevant|intelligibly|can be checked)/i.test(s);
  return observable&&measurable;
}

function measurableObjective(mainDetail=null,bookText='',btPage=null,subjectId=null,year=1){
  if(!mainDetail?.code)return '';
  const lang=lessonLanguage(subjectId),code=String(mainDetail.code);
  const desc=standardDescriptionForObjective(mainDetail,bookText,subjectId);
  const d=cleanLearningStandardStatement(desc).toLowerCase();
  const ref=btPage?(lang==='en'?` using the source on Student's Book p. ${btPage}`:` berpandukan sumber pada Buku Teks m/s ${btPage}`):'';
  const count=objectiveTargetCount(year,false),writingCount=objectiveTargetCount(year,true);
  if(lang==='en'){
    if(code==='4.3.3'||/plan, draft and write|write simple sentences/.test(d))return `By the end of the lesson, pupils will be able to plan and write at least ${writingCount} relevant simple sentences${ref}.`;
    if(code==='4.3.2'||/spell/.test(d))return `By the end of the lesson, pupils will be able to spell at least ${count} familiar target words accurately${ref}.`;
    if(code==='4.3.1'||/capital letters|full stops|punctuation/.test(d))return `By the end of the lesson, pupils will be able to write at least ${writingCount} simple sentences using capital letters and full stops appropriately${ref}.`;
    if(code==='1.1.1'||/phoneme|recognise and reproduce/.test(d))return `By the end of the lesson, pupils will be able to recognise and reproduce at least ${count} target sounds or words intelligibly${ref}.`;
    if(code==='1.2.4'||/classroom instructions/.test(d))return `By the end of the lesson, pupils will be able to follow at least ${count} short supported classroom instructions correctly${ref}.`;
    if(/main idea/.test(d))return `By the end of the lesson, pupils will be able to identify the main idea and at least one relevant supporting detail${ref}.`;
    if(/supported questions|simple questions/.test(d))return `By the end of the lesson, pupils will be able to answer at least ${count} supported questions correctly${ref}.`;
    if(/narratives?|story/.test(d))return `By the end of the lesson, pupils will be able to identify and sequence at least ${count} key events from the short text${ref}.`;
    if(/name or describe objects|describe objects/.test(d))return `By the end of the lesson, pupils will be able to name or describe at least ${count} objects using suitable words or phrases${ref}.`;
    if(/personal information/.test(d))return `By the end of the lesson, pupils will be able to ask for or give at least ${count} pieces of personal information using suitable phrases${ref}.`;
    if(/specific information|details/.test(d))return `By the end of the lesson, pupils will be able to identify at least ${count} required pieces of information accurately${ref}.`;
    if(/reread/.test(d))return `By the end of the lesson, pupils will be able to reread the relevant words, phrases or sentences and give at least ${count} accurate responses${ref}.`;
    const action=lowerFirstSentence(cleanLearningStandardStatement(desc));
    return action?`By the end of the lesson, pupils will be able to ${action}${ref} and complete at least ${count} responses that can be checked.`:'';
  }
  const {statement,verb,focus}=standardActionParts(desc);
  if(/^(?:menyatakan|menyenaraikan|menamakan|memberi contoh|mengenal pasti|mengelaskan|menentukan|mengecam|memadankan)$/.test(verb))return `Pada akhir PdP, murid dapat ${verb} sekurang-kurangnya ${count} ${focus}${ref} dengan tepat.`;
  if(/^(?:melengkapkan|menjawab|memilih|menyalin)$/.test(verb))return `Pada akhir PdP, murid dapat ${verb} sekurang-kurangnya ${count} ${focus}${ref} dengan tepat.`;
  if(verb==='memerhati')return `Pada akhir PdP, murid dapat memerhati ${focus}${ref} dan merekod sekurang-kurangnya ${count} pemerhatian yang berkaitan.`;
  if(verb==='membanding beza')return `Pada akhir PdP, murid dapat membanding beza ${focus}${ref} dengan merekod sekurang-kurangnya dua persamaan atau perbezaan yang tepat.`;
  if(/penyiasatan|menyiasat/.test(`${verb} ${focus}`))return `Pada akhir PdP, murid dapat menjalankan penyiasatan tentang ${focus.replace(/^penyiasatan\s+(?:tentang\s+)?/i,'')}${ref} mengikut urutan serta merekod sekurang-kurangnya satu hasil yang sah.`;
  if(/^(?:merekod|merekodkan|mengukur)$/.test(verb))return `Pada akhir PdP, murid dapat ${verb} ${focus}${ref} dalam jadual atau bentuk rekod yang betul.`;
  if(/^(?:menyusun|membuat urutan)$/.test(verb))return `Pada akhir PdP, murid dapat ${verb} sekurang-kurangnya ${count} ${focus}${ref} mengikut urutan yang betul.`;
  if(/^(?:melukis|melabel|membina|mereka bentuk)$/.test(verb))return `Pada akhir PdP, murid dapat ${verb} ${focus}${ref} dengan sekurang-kurangnya ${count} ciri atau label yang tepat.`;
  if(/^(?:membina dan menulis|menulis)$/.test(verb)&&/ayat|karangan|teks|respons|frasa|perkataan/.test(focus))return `Pada akhir PdP, murid dapat ${verb} sekurang-kurangnya ${writingCount} ${focus}${ref} dengan isi yang relevan dan bahasa yang dapat difahami.`;
  if(/^(?:membaca dan memahami|membaca)$/.test(verb))return `Pada akhir PdP, murid dapat ${verb} ${focus}${ref} dan memberikan sekurang-kurangnya ${count} respons yang tepat.`;
  if(/^(?:menyebut|melafazkan|menceritakan|bertutur|mendengar dan bertutur)$/.test(verb))return `Pada akhir PdP, murid dapat ${verb} ${focus}${ref} dengan sekurang-kurangnya ${count} respons lisan yang jelas dan tepat.`;
  if(verb==='menyanyikan')return `Pada akhir PdP, murid dapat menyanyikan ${focus}${ref} dengan sebutan, intonasi dan tempo yang sesuai.`;
  if(verb==='menyelesaikan masalah'){const problemFocus=/^(?:bagi|untuk)\b/i.test(focus)?focus:`berkaitan ${focus}`;return `Pada akhir PdP, murid dapat menyelesaikan masalah ${problemFocus}${ref} dengan mencadangkan satu penyelesaian dan memberikan sekurang-kurangnya satu alasan berdasarkan bukti.`}
  if(/^(?:menjelaskan|menghuraikan|memerihalkan|menerangkan|berkomunikasi|membuat inferens|membuat ramalan|membuat kesimpulan|mengitlak|menghubungkaitkan)$/.test(verb))return `Pada akhir PdP, murid dapat ${verb} ${focus}${ref} dengan menyatakan sekurang-kurangnya dua dapatan atau bukti yang berkaitan.`;
  if(/^(?:menghasilkan)$/.test(verb)&&/ayat|karangan|teks|respons/.test(focus))return `Pada akhir PdP, murid dapat ${verb} sekurang-kurangnya ${writingCount} ${focus}${ref} dengan isi yang relevan dan bahasa yang dapat difahami.`;
  const action=lowerFirstSentence(statement);
  return action?`Pada akhir PdP, murid dapat ${action}${ref} dan menghasilkan sekurang-kurangnya ${count} respons tepat yang boleh disemak.`:'';
}
function complementaryEvidenceText(details=[],bookText='',btPage=null,subjectId=null){if(!details?.length)return '';const lang=lessonLanguage(subjectId),lines=[];for(const original of details.slice(0,3)){const d={...original,description:canonicalStandardDescription(original,subjectId)},desc=String(d.description||'').toLowerCase(),task=sourceTaskForStandard(d,bookText,subjectId),code=String(d.code||'');if(lang==='en'){let evidence='';if(code==='1.2.2')evidence=task?`Pupils identify specific information and details in “${task}”.`:'Pupils identify specific information and details from the listening input.';else if(code==='3.2.2')evidence=task?`Pupils identify specific information and details in “${task}”.`:'Pupils identify specific information and details from the reading text.';else if(code==='3.2.3')evidence=task?`Pupils reread relevant words, phrases or sentences to complete “${task}”.`:'Pupils reread relevant words, phrases or sentences to confirm meaning.';else if(code==='4.3.2')evidence=task?`Pupils spell familiar high-frequency words accurately while completing “${task}”.`:'Pupils spell familiar high-frequency words accurately in guided writing.';else if(code==='4.3.1')evidence='Pupils use capital letters and full stops appropriately in their written response.';else if(code==='1.1.1')evidence=task?`Pupils reproduce target language phonemes intelligibly during “${task}”.`:'Pupils reproduce target language phonemes intelligibly.';else evidence=task?`Pupils show evidence of Learning Standard ${code} through “${task}”.`:`Pupils show observable evidence of Learning Standard ${code}.`;lines.push(`LS ${code}: ${evidence}`)}else{let evidence='';if(/maklumat|butiran/i.test(desc))evidence=task?`Murid mengenal pasti maklumat yang diperlukan dalam “${task}”.`:'Murid mengenal pasti maklumat yang diperlukan daripada sumber.';else evidence=task?`Murid menunjukkan evidens SP ${code} melalui “${task}”.`:`Murid menunjukkan evidens yang boleh diperhatikan bagi SP ${code}.`;lines.push(`SP ${code}: ${evidence}`)}}return lines.join('\n')}
function measurableCriteria(mainDetail=null,complementaryDetails=[],bookText='',btPage=null,subjectId=null,year=1){
  if(!mainDetail?.code)return '';
  const lang=lessonLanguage(subjectId),code=String(mainDetail.code);
  const desc=standardDescriptionForObjective(mainDetail,bookText,subjectId);
  const d=cleanLearningStandardStatement(desc).toLowerCase();
  const ref=btPage?(lang==='en'?` from Student's Book p. ${btPage}`:` dengan merujuk Buku Teks m/s ${btPage}`):(lang==='en'?' from the source':' dengan merujuk sumber');
  const count=objectiveTargetCount(year,false),writingCount=objectiveTargetCount(year,true);
  if(lang==='en'){
    if(code==='4.3.3'||/plan, draft and write|write simple sentences/.test(d))return `Success is achieved when pupils produce at least ${writingCount} relevant and understandable simple sentences${ref}.`;
    if(code==='4.3.2'||/spell/.test(d))return `Success is achieved when pupils spell at least ${count} familiar target words accurately${ref}.`;
    if(code==='4.3.1'||/capital letters|full stops|punctuation/.test(d))return `Success is achieved when pupils write at least ${writingCount} simple sentences with appropriate capital letters and full stops${ref}.`;
    if(code==='1.1.1'||/phoneme|recognise and reproduce/.test(d))return `Success is achieved when pupils reproduce at least ${count} target sounds or words intelligibly${ref}.`;
    if(code==='1.2.4'||/classroom instructions/.test(d))return `Success is achieved when pupils respond correctly to at least ${count} short supported classroom instructions${ref}.`;
    if(/main idea/.test(d))return `Success is achieved when pupils identify the main idea and at least one relevant supporting detail${ref}.`;
    if(/supported questions|simple questions/.test(d))return `Success is achieved when pupils answer at least ${count} supported questions correctly${ref}.`;
    if(/narratives?|story/.test(d))return `Success is achieved when pupils place at least ${count} key events in the correct sequence${ref}.`;
    if(/name or describe objects|describe objects/.test(d))return `Success is achieved when pupils name or describe at least ${count} objects using suitable words or phrases${ref}.`;
    if(/personal information/.test(d))return `Success is achieved when pupils exchange at least ${count} pieces of personal information using suitable phrases${ref}.`;
    if(/specific information|details|reread/.test(d))return `Success is achieved when pupils give at least ${count} accurate responses and point to the relevant information${ref}.`;
    return `Success is achieved when pupils complete the required source task and provide an accurate, observable response linked to ${code}.`;
  }
  const {verb,focus}=standardActionParts(desc);
  if(/^(?:menyatakan|menyenaraikan|menamakan|memberi contoh|mengenal pasti|mengelaskan|menentukan|mengecam|memadankan)$/.test(verb))return `Kriteria kejayaan dicapai apabila murid memberikan sekurang-kurangnya ${count} jawapan yang tepat tentang ${focus}${ref}.`;
  if(/^(?:melengkapkan|menjawab|memilih|menyalin)$/.test(verb))return `Kriteria kejayaan dicapai apabila murid melengkapkan sekurang-kurangnya ${count} respons yang tepat tentang ${focus}${ref}.`;
  if(verb==='memerhati')return `Kriteria kejayaan dicapai apabila murid merekod sekurang-kurangnya ${count} pemerhatian yang tepat tentang ${focus}${ref}.`;
  if(verb==='membanding beza')return `Kriteria kejayaan dicapai apabila murid merekod sekurang-kurangnya dua persamaan atau perbezaan yang tepat tentang ${focus}${ref}.`;
  if(/penyiasatan|menyiasat/.test(`${verb} ${focus}`))return `Kriteria kejayaan dicapai apabila murid mengikuti langkah penyiasatan dengan selamat, merekod hasil dan membuat satu kesimpulan berdasarkan bukti${ref}.`;
  if(/^(?:merekod|merekodkan|mengukur)$/.test(verb))return `Kriteria kejayaan dicapai apabila murid melengkapkan rekod ${focus} dengan nilai, unit atau catatan yang betul${ref}.`;
  if(/^(?:menyusun|membuat urutan)$/.test(verb))return `Kriteria kejayaan dicapai apabila murid menyusun sekurang-kurangnya ${count} item dalam urutan yang betul${ref}.`;
  if(/^(?:melukis|melabel|membina|mereka bentuk)$/.test(verb))return `Kriteria kejayaan dicapai apabila murid menghasilkan satu hasil kerja dengan sekurang-kurangnya ${count} ciri atau label yang tepat${ref}.`;
  if(/^(?:membina dan menulis|menulis)$/.test(verb)&&/ayat|karangan|teks|respons|frasa|perkataan/.test(focus))return `Kriteria kejayaan dicapai apabila murid menghasilkan sekurang-kurangnya ${writingCount} ${focus} yang relevan, tersusun dan dapat difahami${ref}.`;
  if(/^(?:membaca dan memahami|membaca)$/.test(verb))return `Kriteria kejayaan dicapai apabila murid memberikan sekurang-kurangnya ${count} respons tepat berdasarkan bahan yang dibaca${ref}.`;
  if(/^(?:menyebut|melafazkan|menceritakan|bertutur|mendengar dan bertutur)$/.test(verb))return `Kriteria kejayaan dicapai apabila murid menyampaikan sekurang-kurangnya ${count} respons lisan dengan sebutan yang jelas dan isi yang tepat${ref}.`;
  if(verb==='menyanyikan')return `Kriteria kejayaan dicapai apabila murid menyanyikan bahan sumber dengan sebutan, intonasi dan tempo yang sesuai${ref}.`;
  if(verb==='menyelesaikan masalah')return `Kriteria kejayaan dicapai apabila murid menghasilkan satu penyelesaian yang berfungsi dan menerangkan sekurang-kurangnya satu alasan berdasarkan bukti${ref}.`;
  if(/^(?:menjelaskan|menghuraikan|memerihalkan|menerangkan|berkomunikasi|membuat inferens|membuat ramalan|membuat kesimpulan|mengitlak|menghubungkaitkan)$/.test(verb))return `Kriteria kejayaan dicapai apabila murid menyampaikan sekurang-kurangnya dua dapatan yang berkaitan dan menyokongnya dengan bukti${ref}.`;
  if(/^(?:menghasilkan)$/.test(verb)&&/ayat|karangan|teks|respons/.test(focus))return `Kriteria kejayaan dicapai apabila murid menghasilkan sekurang-kurangnya ${writingCount} respons yang relevan, tersusun dan dapat difahami${ref}.`;
  return `Kriteria kejayaan dicapai apabila murid melengkapkan kehendak tugasan dan menghasilkan respons tepat yang boleh disemak${ref}.`;
}


function validSpCode(code=''){const m=String(code).match(/^(\d{1,2})\.(\d{1,2})\.(\d{1,2})$/);if(!m)return false;const a=Number(m[1]),b=Number(m[2]),c=Number(m[3]);return a>=1&&a<=20&&b>=0&&b<=30&&c>=0&&c<=99}
function extractSkSp(context){const raw=[...new Set(context.match(/\b\d{1,2}\.\d{1,2}\.\d{1,2}\b/g)||[])].filter(validSpCode);const spCodes=raw.slice(0,16);const skCodes=[...new Set(spCodes.map(x=>x.split('.').slice(0,2).join('.')))];return {spCodes,skCodes:skCodes.slice(0,10)}}
function sessionSpecificContext(context,sessionNo=1){const clean=normalizeText(context);if(!clean)return {text:'',exact:false,method:'none'};const lines=clean.split('\n').map(x=>x.trim()).filter(Boolean);const marker=/^(?:lesson|pelajaran|session|sesi)\s*[-:#.]?\s*\d+\b|^(?:monday|tuesday|wednesday|thursday|friday|isnin|selasa|rabu|khamis|jumaat)\b/i;const starts=[];lines.forEach((l,i)=>{if(marker.test(l))starts.push(i)});if(starts.length>=sessionNo){const a=starts[sessionNo-1],b=starts[sessionNo]??lines.length;const seg=lines.slice(a,b).join('\n');if(extractSkSp(seg).spCodes.length)return {text:seg,exact:true,method:'lesson-marker'}}const matches=[...clean.matchAll(/\b(\d{1,2})\.(\d{1,2})\.(\d{1,2})\b/g)].filter(m=>validSpCode(m[0]));const domains=[];for(const m of matches){const d=m[1];if(!domains.includes(d))domains.push(d)}if(domains.length>=sessionNo){const d=domains[sessionNo-1],first=matches.find(m=>m[1]===d),next=matches.find(m=>m.index>first.index&&m[1]!==d);const start=Math.max(0,first.index-500),end=next?Math.min(clean.length,next.index+120):Math.min(clean.length,first.index+2400);return {text:clean.slice(start,end),exact:true,method:'standard-domain'}}return {text:clean,exact:false,method:'week-fallback'}}

function trimTargetWeekBlock(text='',targetWeek){
  const clean=normalizeText(text);if(!clean)return clean;
  const ms=[...clean.matchAll(/\b(?:minggu(?:\s*ke)?|week|wk)\s*[-:#.]?\s*0?(\d{1,2})\b/ig)].map(m=>({n:Number(m[1]),i:m.index})).filter(x=>x.n>=1&&x.n<=53);
  const ti=ms.findIndex(x=>x.n===Number(targetWeek));if(ti<0||ms.length<2)return clean;
  let a=ti,b=ti;
  // Week markers inside one RPT row are close together. A large text gap normally means
  // we crossed a row/unit boundary and must not inherit standards from the previous unit.
  while(a>0&&ms[a].i-ms[a-1].i<=900)a--;
  while(b+1<ms.length&&ms[b+1].i-ms[b].i<=900)b++;
  const start=ms[a].i;
  const end=(b+1<ms.length)?ms[b+1].i:clean.length;
  const block=clean.slice(start,end).trim();
  return block.length>=120?block:clean;
}
function domainEvidenceFromBook(text=''){
  const acts=cleanInstructionSentences(text),scores={1:0,2:0,3:0,4:0,5:0},first={};
  acts.forEach((a,i)=>{const weight=Math.max(2,7-Math.min(i,5));for(const d of domainOfInstruction(a)){scores[d]+=weight;if(first[d]===undefined)first[d]=i}});
  const t=String(text||'').toLowerCase();if(/reading[, /].*listening|reading skills?/.test(t))scores[3]+=2;if(/writing skills?|reading[, /].*writing/.test(t))scores[4]+=2;if(/listening skills?/.test(t))scores[1]+=2;if(/speaking skills?/.test(t))scores[2]+=2;if(/language arts|song|rhyme|poem/.test(t))scores[5]+=1;
  const domains=Object.keys(scores).map(Number).filter(d=>scores[d]>0).sort((a,b)=>scores[b]-scores[a]||((first[a]??99)-(first[b]??99))||a-b);
  return {scores,first,domains,activities:acts};
}
function skillDomainsFromBook(text=''){return domainEvidenceFromBook(text).domains}
function taskStandardBoost(code='',description='',bookText=''){const d=String(description||'').toLowerCase(),t=String(bookText||'').toLowerCase();let b=0;const has=(r)=>r.test(t),desc=(r)=>r.test(d);if(has(/\bread\b[^.\n]{0,60}\b(write|answer|match|tick|choose|find|number)\b/)&&desc(/specific information|details/))b+=12;if(has(/\breread\b/)&&desc(/reread/))b+=15;if(has(/\bsound out|phonics|phoneme/)&&desc(/sound|phoneme/))b+=14;if(!has(/\bsound out|phonics|phoneme|repeat the sound/)&&desc(/phoneme/))b-=10;if(has(/\blisten\b[^.\n]{0,50}\b(tick|number|write|match|choose)\b/)&&desc(/specific information|details/))b+=12;if(has(/\bwrite about\b|\bwrite (?:a|the|your|simple)\b/)&&desc(/write simple sentences|guided writing|plan, draft and write|draft and write/))b+=14;if(has(/\bspell\b|missing letters|write the words/)&&desc(/spell|spelling/))b+=12;if(!has(/\bspell\b|missing letters|write the words/)&&desc(/spell a narrow range/))b-=5;if(has(/capital letters|full stops?/)&&desc(/capital letters|full stops/))b+=14;if(!has(/capital letters|full stops?|punctuat/)&&desc(/capital letters|full stops/))b-=8;if(has(/\bjoin\b|conjunction/)&&desc(/conjunction/))b+=12;if(!has(/\bjoin\b|conjunction/)&&desc(/conjunction/))b-=8;if(has(/\bmain idea\b/)&&desc(/main idea/))b+=14;if(has(/\bask and answer\b|\btalk\b|\bspeak\b/)&&desc(/personal information|ask(?:ing)? basic questions|describe objects|interaction/))b+=8;return b}
function selectRptStandardsByBook(rptContext='',bookText='',fallbackCodes=[]){
  const all=standardDetails(rptContext),ev=domainEvidenceFromBook(bookText),keys=keywordSet(bookText),fallback=new Set(fallbackCodes||[]);
  const scored=all.map(x=>{const domain=Number(String(x.code).split('.')[0]);let score=(ev.scores[domain]||0)*5+textScore(x.description,keys)*3+(fallback.has(x.code)?2:0)+taskStandardBoost(x.code,x.description,bookText);const desc=String(x.description||'').toLowerCase(),task=sourceTaskForDomain(bookText,domain).toLowerCase();if(task){for(const k of keywordSet(task)){if(desc.includes(k))score+=2}}return {...x,_domain:domain,_score:score}}).filter(x=>x._score>0).sort((a,b)=>b._score-a._score||a.code.localeCompare(b.code,undefined,{numeric:true}));
  const main=scored[0]||all.find(x=>fallback.has(x.code))||null;const complementary=[];
  for(const x of scored){if(!main||x.code===main.code)continue;if(complementary.some(y=>y.code===x.code))continue;const newDomain=!complementary.some(y=>y._domain===x._domain)&&x._domain!==main._domain;if(newDomain||complementary.length===0)complementary.push(x);if(complementary.length>=2)break}
  if(main){const chosen=[main,...complementary];return {details:chosen,codes:chosen.map(x=>x.code),main,complementary,domains:ev.domains,domain_scores:ev.scores,method:'book-activity-role-match'}}
  const safe=[...new Set(fallbackCodes)].slice(0,3),details=all.filter(x=>safe.includes(x.code));return {details,codes:safe,main:details[0]||null,complementary:details.slice(1),domains:ev.domains,domain_scores:ev.scores,method:'rpt-fallback'};
}
function chooseProgressionPage(pages=[],weekRange=null,sessionNo=1){
  let xs=[...pages].sort((a,b)=>Number(a.printed_page||a.page_no)-Number(b.printed_page||b.page_no));
  if(weekRange)xs=xs.filter(p=>pageInRange(p,weekRange));
  if(!xs.length)return null;
  const idx=Math.max(0,Math.min(xs.length-1,Number(sessionNo||1)-1));
  return xs[idx];
}
function pageLearningFitScore(page=null,rptContext='',codes=[],query=''){
  if(!page||!String(page.content||'').trim())return -999;
  const text=String(page.content||''),details=standardDetails(rptContext).filter(d=>(codes||[]).includes(d.code));
  let score=textScore(text,keywordSet(query))*2;
  const ev=domainEvidenceFromBook(text);
  for(const d of details){const domain=Number(String(d.code).split('.')[0]);score+=(ev.scores?.[domain]||0)*2;score+=Math.max(-12,taskStandardBoost(d.code,d.description,text))*2}
  score+=sourceActivityLines(text,4).length*3;
  return score;
}
function routeBookPage(structuralPages=[],readablePages=[],weekRange=null,sessionNo=1,rptContext='',codes=[],query='',explicitRefs=[]){
  const structural=[...structuralPages].filter(p=>!weekRange||pageInRange(p,weekRange)).sort((a,b)=>Number(a.printed_page||a.page_no)-Number(b.printed_page||b.page_no));
  const readable=[...readablePages].filter(p=>!weekRange||pageInRange(p,weekRange));
  const explicit=[...new Set((explicitRefs||[]).map(Number).filter(Boolean))];
  if(explicit.length){
    const hit=structural.find(p=>explicit.includes(Number(p.printed_page||p.page_no)));
    // v0.3.3.33: an explicit RPT printed-page reference is a hard lock.
    // If that printed page is not available, return null instead of silently routing to an unrelated page.
    return hit?{...hit,match:180,_pageMethod:'rpt-page-ref-strict',_pageVerified:true,_routeScore:180}:null;
  }
  const scored=readable.map(p=>({...p,_routeScore:pageLearningFitScore(p,rptContext,codes,query)})).sort((a,b)=>b._routeScore-a._routeScore||Number(a.printed_page||a.page_no)-Number(b.printed_page||b.page_no));
  if(scored[0]&&scored[0]._routeScore>=12)return {...scored[0],match:Math.max(2,scored[0]._routeScore),_pageMethod:'ocr-content-standard-match',_pageVerified:true};
  const fallback=chooseProgressionPage(structural,weekRange,sessionNo);
  return fallback?{...fallback,match:0,_pageMethod:'structural-candidate',_pageVerified:false,_routeScore:0}:null;
}
function lessonStageFromPageRoute(page=null,unitRange=null,weekGroup=null,sessionNo=1){
  if(page&&unitRange&&Number(unitRange.end)>Number(unitRange.start)){const pg=Number(page.printed_page||page.page_no),a=Number(unitRange.start),b=Number(unitRange.end);if(pg>=a&&pg<=b){const stages=['introduction','guided','application','assessment','enrichment'];const idx=Math.max(0,Math.min(4,Math.round(((pg-a)/(b-a))*4)));return stages[idx]}}
  return lessonStageFromProgress(weekGroup,sessionNo);
}
function lessonStageFromProgress(weekGroup=null,sessionNo=1){
  const stages=['introduction','guided','application','assessment','enrichment'];
  const count=Number(weekGroup?.count||0),position=Number(weekGroup?.position||0);
  if(count>1&&position>=1&&position<=count){
    if(count===2)return position===1?'introduction':'application';
    if(count===3)return ['introduction','application','assessment'][position-1];
    if(count===4)return ['introduction','guided','application','assessment'][position-1];
    const idx=Math.max(0,Math.min(4,Math.round((position-1)*4/(count-1))));
    return stages[idx];
  }
  return stages[Math.max(0,Math.min(4,(Number(sessionNo||1)-1)%5))];
}
function parallelBookPage(pages=[],printedPage=null,weekRange=null){
  if(!printedPage)return null;const xs=pages.filter(p=>!weekRange||pageInRange(p,weekRange));
  return xs.find(p=>Number(p.printed_page||p.page_no)===Number(printedPage))||null;
}
function cleanSourceActivityPhrase(s=''){
  return String(s||'')
    .replace(/[|¦£€¥₹]+/g,' ')
    .replace(/[<>]+/g,' ')
    // Discard isolated OCR glyph fragments such as "L { 7 y".  Do not
    // complete or invent the missing source words; preserve only readable text.
    .replace(/\s+[A-Za-zÀ-ž]\s*\{\s*\d+\s*[A-Za-zÀ-ž]\b/g,' ')
    .replace(/\s*&\s*/g,' and ')
    .replace(/\bor\s+and\b/gi,' and ')
    .replace(/\band\s+and\b/gi,' and ')
    .replace(/^\s*(?:and|&|then)\s+(?=(?:listen|read|write|look|match|complete|answer|choose|find|say|speak|ask|draw|tick|number|circle|colour|color|play|make|watch|repeat|practise|practice)\b)/i,'')
    .replace(/^\s*[^A-Za-zÀ-ž0-9(]+/,'')
    .replace(/\s+/g,' ')
    .trim();
}
function isTruncatedSourceActivity(s=''){
  const t=cleanSourceActivityPhrase(s);
  if(!t)return true;
  // A source task ending in a connector is incomplete OCR, not a usable
  // classroom instruction. Block it rather than invent missing words.
  return /\b(?:yang|dan|atau|untuk|dengan|daripada|kepada|di|ke|dalam|pada|the|a|an|to|with|from|in|on|at|and|or)\s*[.,;:]?$/i.test(t)
    || /\b(?:write|choose|circle|tick|match|complete|select)\s+(?:the\s+)?(?:correct|following|missing|given)\s*[.,;:]?$/i.test(t);
}
function isThinSourceActivity(s=''){
  const t=cleanSourceActivityPhrase(s).replace(/^(?:RPT\s*\+\s*)?(?:BT|Buku\s*Teks|Student['’]?s\s+Book)\s*(?:(?:m\/?s|ms|p\.?|page|halaman)\s*)?\d{1,3}(?:\s*[-–—]\s*\d{1,3})?\s*:\s*/i,'').trim();
  return /^(?:Murid\s+)?(?:Perhatikan|memerhati)\s+apa\s+yang\s+berlaku(?:\.\s*[A-Za-zÀ-ž]{2,}(?:\s+[A-Za-zÀ-ž]{2,}){0,5})?[.!]?$/i.test(t)
    || /^(?:Pupils?\s+)?(?:look|listen\s+and\s+look)\s+at\s+(?:the\s+)?(?:page|picture|pictures)[.!]?$/i.test(t);
}
function isGenericBookReference(s=''){
  const t=cleanSourceActivityPhrase(s);
  if(!t)return true;
  if(/^(?:BT|Buku\s*Teks|Student['’]?s\s+Book)(?:\s+(?:(?:m\/?s|ms|p\.?|page|halaman)\s*)?\d{1,3}(?:\s*[-–—]\s*\d{1,3})?)?\s*:?\s*$/i.test(t))return true;
  if(!/\b(?:murid|pupils?|listen|read|write|look|match|complete|answer|choose|find|say|speak|ask|draw|tick|number|circle|colour|color|play|make|watch|repeat|practise|practice|menyatakan|menyenaraikan|membaca|menulis|memerhati|memadankan|menjawab|melukis|menyanyi|mendengar|mengelaskan|merekod|menyiasat|membina|mendekatkan|mengulangi)\b/i.test(t))return true;
  // These are generator placeholders, not the actual instruction on the page.
  return /(?:complete|carry out|use).{0,90}(?:learning task|according to the objective)|(?:melaksanakan|menggunakan).{0,90}(?:tugasan pembelajaran|mengikut objektif)/i.test(t);
}
function isManualReviewActivityPlaceholder(text=''){
  const s=normalizeText(text).toLowerCase().replace(/\s+/g,' ').trim();
  if(!s)return false;
  return /^(?:rpt\s+sesi\s*:?\s*)?(?:perlu\s+)?semakan\s+manual\b/i.test(s)
    || /^semak\s+secara\s+manual\b/i.test(s)
    || /^perlu\s+semak\s+sumber\b/i.test(s)
    || /^conditional[.!]?$/i.test(s);
}
function cleanInstructionSentences(text=''){
  return instructionSentences(text).map(s=>cleanSourceActivityPhrase(s)).filter(s=>{
    const words=s.match(/[A-Za-zÀ-ž]{2,}/g)||[];const singles=(s.match(/\b[A-Za-z]\b/g)||[]).length;const odd=(s.match(/[^A-Za-zÀ-ž0-9\s.,!?()'’\-]/g)||[]).length;
    return words.length>=3&&singles<=Math.max(3,Math.floor(words.length/2))&&odd<=Math.max(3,Math.floor(s.length*.08))&&!/^[A-Z]\s+[A-Z]\s+/i.test(s);
  }).map(s=>cleanSourceActivityPhrase(s.replace(/^\(?\d+\)?\s*/,'').replace(/^\s*[-–—]+\s*/,''))).filter(Boolean);
}
function sourceActivityLines(text='',limit=4){
  const acts=uniqueSentences(cleanInstructionSentences(text)).map(cleanSourceActivityPhrase).filter(a=>a&&!/^(?:watch the whales|theme|world of|unit\s+\d+)/i.test(a));
  return acts.slice(0,limit);
}
function exactBookTaskLines(text='',limit=8){
  const src=normalizeText(text);if(!src)return [];
  const lines=src.split(/\n+/).map(x=>cleanSourceActivityPhrase(x)).filter(Boolean);
  const meta=/^(?:strategi|emk|nota guru|info bahasa|aktiviti|mendengar dan bertutur\s*$|membaca\s*$|menulis\s*$|seni bahasa\s*$|tatabahasa\s*$|unit\s+\d+|tema\s+\d+|ba\s*[12]?\s*:|bt\s*[12]?\s*:|\d{1,2}\.\d{1,2}(?:\.\d{1,2})?(?:\s|$))/i;
  const task=/^(?:bimbing\s+murid|minta\s+murid|murid\s+|baca(?:lah)?\b|jawab\b|tulis\b|padankan\b|lengkapkan\b|bina\b|kenal\s+pasti\b|lakukan\b|gunakan\b|salin\b|nyatakan\b|senaraikan\b|jelaskan\b|pilih\b|bulatkan\b|gariskan\b|warnakan\b|susun\b|catat\b|dengar\b|sebut\b|tutur\b|ceritakan\b|lakonkan\b|simulasikan\b|perhati(?:kan)?\b|dekatkan\b|ulangi\b|mengamati\b|kelaskan\b|mengelaskan\b|bandingkan\b|mengukur\b|sukat\b|rekod(?:kan)?\b|menyiasat\b|siasat\b|uji\b|meramal\b|buat\s+inferens\b|membina\b|menulis\b|membaca\b|memberikan\b|mengenal\b|mempersembahkan\b|melafazkan\b|menyanyikan\b|bercerita\b|bertutur\b|menjawab\b|melengkapkan\b|memadankan\b|menggunakan\b|menyusun\b|mencatat\b|menghasilkan\b|create\b|read\b|write\b|answer\b|match\b|complete\b|identify\b|observe\b|classify\b|compare\b|sequence\b|measure\b|record\b|investigate\b|test\b|infer\b|predict\b|draw\b|label\b|build\b|design\b|communicate\b|solve\b|listen\b|say\b|ask\b|tell\b|choose\b|tick\b|circle\b|look\b|work\b|practise\b|practice\b|role[- ]?play\b|present\b)/i;
  const boiler=/pembelajaran\s+(?:konstruktivisme|kontekstual)|kemahiran\s+berfikir|nilai\s+murni|verbal[- ]linguistik|interpersonal|mengembangkan\s+idea|menjanakan\s+idea/i;
  let out=[];
  for(const line of lines){const s=line.replace(/^[-–—•▪◦\s]+/,'').trim();if(!s||s.length<12||s.length>360||meta.test(s)||boiler.test(s))continue;if(task.test(s))out.push(s)}
  for(const s0 of cleanInstructionSentences(src)){const s=cleanSourceActivityPhrase(s0);if(!s||meta.test(s)||boiler.test(s))continue;if(task.test(s))out.push(s)}
  const expanded=[];const secondVerb=/^(?:membina|menulis|membaca|mengenal|memberikan|mempersembahkan|melafazkan|menyanyikan|bercerita|bertutur|menjawab|melengkapkan|memadankan|menghasilkan|menyusun|mencatat|menggunakan)\b/i;
  for(const s of uniqueSentences(out)){const parts=s.split(/\s+dan\s+(?=(?:membina|menulis|membaca|mengenal|memberikan|mempersembahkan|melafazkan|menyanyikan|bercerita|bertutur|menjawab|melengkapkan|memadankan|menghasilkan|menyusun|mencatat|menggunakan)\b)/i);if(parts.length===2&&secondVerb.test(parts[1]))expanded.push(parts[0],parts[1]);else expanded.push(s)}
  const candidates=uniqueSentences(expanded.map(cleanSourceActivityPhrase)),pruned=[];for(const s of candidates){const S=new Set(normalizeActivity(s).split(' ').filter(Boolean));if(S.size>=3&&pruned.some(x=>{const X=new Set(normalizeActivity(x).split(' ').filter(Boolean));return [...S].every(t=>X.has(t))}))continue;pruned.push(s)}return pruned.slice(0,limit);
}
function studentizeSourceTask(task='',uiEn=false){
  let s=cleanSourceActivityPhrase(task);if(!s)return '';
  if(uiEn){s=s.replace(/^(?:ask|guide)\s+(?:the\s+)?pupils?\s+(?:to\s+)?/i,'Pupils ');if(!/^pupils?\b/i.test(s))s='Pupils '+s.charAt(0).toLowerCase()+s.slice(1);return s.replace(/\s+/g,' ').trim()}
  s=s.replace(/^Bimbing\s+murid\s+(?:untuk\s+)?/i,'Murid ').replace(/^Minta\s+murid\s+(?:untuk\s+)?/i,'Murid ');
  const transforms=[[/^Baca(?:lah)?\b/i,'Murid membaca'],[/^Jawab\b/i,'Murid menjawab'],[/^Tulis\b/i,'Murid menulis'],[/^Padankan\b/i,'Murid memadankan'],[/^Lengkapkan\b/i,'Murid melengkapkan'],[/^Bina\b/i,'Murid membina'],[/^Kenal\s+pasti\b/i,'Murid mengenal pasti'],[/^Lakukan\b/i,'Murid melakukan'],[/^Gunakan\b/i,'Murid menggunakan'],[/^Salin\b/i,'Murid menyalin'],[/^Nyatakan\b/i,'Murid menyatakan'],[/^Senaraikan\b/i,'Murid menyenaraikan'],[/^Jelaskan\b/i,'Murid menjelaskan'],[/^Pilih\b/i,'Murid memilih'],[/^Susun\b/i,'Murid menyusun'],[/^Catat(?:kan)?\b/i,'Murid mencatat'],[/^Rekod(?:kan)?\b/i,'Murid merekod'],[/^Perhati(?:kan)?\b/i,'Murid memerhati'],[/^Dekatkan\b/i,'Murid mendekatkan'],[/^Ulangi\b/i,'Murid mengulangi'],[/^Dengar\b/i,'Murid mendengar'],[/^Sebut\b/i,'Murid menyebut']];
  for(const [re,r] of transforms){if(re.test(s)){s=s.replace(re,r);break}}
  if(!/^Murid\b/i.test(s)&&/^(?:Membina|Menulis|Membaca|Memberikan|Mengenal|Mempersembahkan|Melafazkan|Menyanyikan|Bercerita|Bertutur|Menjawab|Melengkapkan|Memadankan|Menghasilkan|Menyusun|Mencatat|Menggunakan)\b/i.test(s))s='Murid '+s.charAt(0).toLowerCase()+s.slice(1);
  return s.replace(/\s+/g,' ').trim();
}
function scienceSourceQuestionTasks(text='',limit=3){
  // A Science page can contain a source-grounded KBAT prompt before the
  // practical steps appear on the following page.  Preserve that page's own
  // question as the task; never borrow an experiment from another page.
  const lines=normalizeText(text).split(/\n+/).map(x=>cleanSourceActivityPhrase(x)).filter(Boolean);
  const prompts=lines.filter(s=>/^(?:Bolehkah|Bagaimanakah|Mengapakah|Apakah|Nyatakan|Senaraikan)\b/i.test(s)&&s.length>=18&&s.length<=360&&!isTruncatedSourceActivity(s))
    .map(s=>/^(?:Nyatakan|Senaraikan)\b/i.test(s)?studentizeSourceTask(s,false):`Murid menjawab soalan sumber: ${s}`);
  return uniqueSentences(prompts).slice(0,limit);
}
function scienceExactBookTaskLines(text='',limit=8){
  // Science textbooks frequently label a real task with Mari Uji / Mari
  // Mengelas, followed by short imperative OCR lines. This fallback is used
  // only after the shared exact-task parser finds nothing.
  const lines=normalizeText(text).split(/\n+/).map(x=>cleanSourceActivityPhrase(x)).filter(Boolean);
  const task=/^(?:Mari(?:lah)?\s+(?:Uji|Mengelas|Menyiasat|Mengkaji|Mencipta|Membina|kita\s+(?:lihat|kenali|susun|uji|cuba|kaji|selidiki|perhatikan|bandingkan|bina|cipta))|Lihat(?:lah)?|Ceritakan|Minta|Perhatikan|Dekatkan|Senaraikan|Nyatakan|Rekodkan|Catatkan|Ulang(?:i)?|Labelkan|Lakarkan|Titiskan|Taburkan|Tuangkan|Masukkan|Letakkan|Tinggikan|Kumpulkan|Rangkakan|Tampalkan|Kongsikan|Gunting|Lekatkan|Cantumkan|Keluarkan|Susunkan|Dapatkan|Ramalkan|Sebutan|Sebutkan|Namakan|Tandakan|Berikan|Hasilkan|Rancang(?:kan)?|Pasang(?:kan)?|Buka|Simpan|Cuba)\b/i;
  const boiler=/^(?:Info\s*,?\s*Guru|Nota\s+Guru|Alat\s+dan\s+Bahan|Langkah-langkah|Aktiviti\s*(?:Kumpulan|Berkumpulan|Berpasangan)?|Pemerhatian|Jadual\s*[A-Z]?|Soalan)\b/i;
  const direct=lines.filter(s=>s.length>=12&&s.length<=360&&task.test(s)&&!boiler.test(s)&&!isTruncatedSourceActivity(s));
  // OCR frequently joins a page heading and its instruction into one long
  // line. Split exact source sentences as well, so “Perhatikan situasi di
  // bawah.” remains a source task instead of being lost behind the heading.
  const sentences=normalizeText(text).split(/(?<=[.!?])\s+|\n+/).map(s=>cleanSourceActivityPhrase(s)).filter(s=>
    s.length>=12&&s.length<=360&&task.test(s)&&!boiler.test(s)&&!isTruncatedSourceActivity(s)
  );
  return uniqueSentences([...direct,...sentences]).slice(0,limit);
}
function readablePageContentClue(text='',title=''){
  const titleKeys=keywordSet(title);
  const boiler=/(?:cambridge university press|copyright|all rights reserved|isbn|contents|learning standard|standard pembelajaran|nota guru|halaman|buku aktiviti)/i;
  const lines=normalizeText(text).split(/\n+|(?<=[.!?])\s+/).map(cleanSourceActivityPhrase).filter(s=>{
    const words=s.match(/[A-Za-zÀ-ž]{2,}/g)||[];
    const odd=(s.match(/[^A-Za-zÀ-ž0-9\s.,!?()'’\-]/g)||[]).length;
    return s.length>=22&&s.length<=170&&words.length>=5&&odd<=Math.max(2,Math.floor(s.length*.06))&&!boiler.test(s)&&!isTruncatedSourceActivity(s);
  });
  return lines.sort((a,b)=>textScore(b,titleKeys)-textScore(a,titleKeys)||b.length-a.length)[0]||'';
}
function groundedPageContentTask(bt=null,codes=[],title='',subjectId=null){
  const content=String(bt?.content||''),clue=readablePageContentClue(content,title);if(!clue)return '';
  const en=lessonLanguage(subjectId)==='en',domain=Number(String(codes?.[0]||'').split('.')[0]||0),short=clue.length>120?clue.slice(0,117).replace(/\s+\S*$/,'')+'…':clue;
  if(en){
    if(domain===1)return `Pupils listen to and follow the illustrated source text containing “${short}”, then identify at least two specific details stated or shown on the page.`;
    if(domain===2)return `Pupils use the illustrated source text containing “${short}” to give at least two relevant spoken responses.`;
    if(domain===4)return `Pupils use the illustrated source text containing “${short}” to write at least two relevant responses.`;
    return `Pupils read the illustrated source text containing “${short}” and identify at least two details from the page.`;
  }
  if(isScienceSubject(subjectId))return `Murid meneliti bahan sumber yang mengandungi “${short}”, kemudian merekod sekurang-kurangnya dua pemerhatian atau maklumat yang dapat dibuktikan pada halaman tersebut.`;
  if(domain===1||domain===2)return `Murid mendengar atau meneliti bahan sumber yang mengandungi “${short}”, kemudian memberikan sekurang-kurangnya dua respons lisan yang berkaitan.`;
  if(domain===3)return `Murid membaca bahan sumber yang mengandungi “${short}” dan mengenal pasti sekurang-kurangnya dua maklumat daripada halaman tersebut.`;
  return `Murid meneliti bahan sumber yang mengandungi “${short}”, kemudian menghasilkan sekurang-kurangnya dua respons yang berkaitan.`;
}
function optionalActivityBookAvailable(subjectId,year,academicYear){return smartSourceDocs(subjectId,year,academicYear).some(d=>d.source_type==='activity_book')}
function stripOptionalBaInstruction(text='',hasBA=false){
  let s=cleanSourceActivityPhrase(text);if(hasBA||!s)return s;
  s=s.replace(/(?:\s*[.。]?\s*)?(?:Kukuhkan|Pengukuhan|Latihan susulan)\s+(?:dengan|menggunakan)\s+BA\s*[12]?\s*(?:m\/?s|ms)?\s*[:.]?\s*\d{1,3}(?:\s*[-–—]\s*\d{1,3})?\s*[.]?/ig,' ');
  s=s.replace(/\bBA\s*[12]?\s*(?:m\/?s|ms)?\s*[:.]?\s*\d{1,3}(?:\s*[-–—]\s*\d{1,3})?\b/ig,' ');
  return cleanSourceActivityPhrase(s.replace(/\s+[.]\s*/g,'. ').replace(/\s+/g,' '));
}
function rptSessionActivityAnchor(structured=null,sessionContext='',subjectId=null,opts={}){
  const en=lessonLanguage(subjectId)==='en',exact=opts?.exactRptSession||null,hasBA=Boolean(opts?.hasActivityBook);let raw='';
  if(exact?.activity&&!isManualReviewActivityPlaceholder(exact.activity))raw=exact.activity;
  else if(structured?.suggested_activities&&!isManualReviewActivityPlaceholder(structured.suggested_activities))raw=structured.suggested_activities;
  else raw=sourceActivityLines(sessionContext,2).filter(x=>!isManualReviewActivityPlaceholder(x)).join(' ');
  raw=stripOptionalBaInstruction(raw,hasBA);if(!raw||isManualReviewActivityPlaceholder(raw))return '';
  const student=studentizeSourceTask(raw,en);return cleanSourceActivityPhrase(student||raw);
}
function taskDomainMatchesCodes(task='',codes=[]){const domains=domainOfInstruction(task);if(!domains.length||!codes?.length)return true;const wanted=new Set(codes.map(c=>Number(String(c).split('.')[0])).filter(Boolean));return domains.some(d=>wanted.has(Number(d)))}
function rankedBookTasksForRpt(bt=null,rptActivity='',codes=[],title='',subjectId=null,limit=4){
  if(!bt)return [];const exact=exactBookTaskLines(bt.content||'',10),scienceExact=isScienceSubject(subjectId)?scienceExactBookTaskLines(bt.content||'',8):[],scienceQuestions=isScienceSubject(subjectId)?scienceSourceQuestionTasks(bt.content||'',4):[],combined=uniqueSentences([...exact,...scienceExact,...scienceQuestions]).filter(x=>!isTruncatedSourceActivity(x)&&!isThinSourceActivity(x)&&!isGenericBookReference(studentizeSourceTask(x,lessonLanguage(subjectId)==='en'))),fallback=groundedPageContentTask(bt,codes,title,subjectId),all=combined.length?combined:(fallback?[fallback]:[]),keys=keywordSet(`${title} ${rptActivity}`),domainCodes=codes||[];
  return all.map(task=>{let score=jaccard(task,rptActivity)*100+textScore(task,keys)*2;if(taskDomainMatchesCodes(task,domainCodes))score+=25;else score-=20;return {task,score}}).sort((a,b)=>b.score-a.score).map(x=>x.task).filter((x,i,a)=>a.findIndex(y=>normalizeActivity(y)===normalizeActivity(x))===i).slice(0,limit);
}
function sourceActivityBundle(bt=null,ba=null,structured=null,sessionContext='',subjectId=null,opts={}){
  const out=[],en=lessonLanguage(subjectId)==='en',exact=opts?.exactRptSession||null,hasBA=Boolean(opts?.hasActivityBook&&ba),codes=opts?.codes||exact?.spCodes||[],title=opts?.title||exact?.title||'',rptAct=rptSessionActivityAnchor(structured,sessionContext,subjectId,{exactRptSession:exact,hasActivityBook:hasBA});
  const btActs=rankedBookTasksForRpt(bt,rptAct,codes,title,subjectId,4),pg=bt?.printed_page||bt?.page_no||null;let rptMerged=false;
  for(const task of btActs){const stud=studentizeSourceTask(task,en);if(!stud)continue;const sim=rptAct?jaccard(stud,rptAct):0;if(rptAct&&sim>=0.52&&!rptMerged){out.push(`${en?'RPT + Student\'s Book':'RPT + BT'}${pg?` ${en?'p.':'m/s'} ${pg}`:''}: ${stud}`);rptMerged=true}else out.push(`${en?"Student's Book":'BT'}${pg?` ${en?'p.':'m/s'} ${pg}`:''}: ${stud}`)}
  // Keep the actual textbook task first. RPT remains trace evidence, not the RPH task anchor.
  if(rptAct&&!rptMerged)out.push(`${en?'RPT lesson':'RPT sesi'}${exact?.session?` S${exact.session}`:''}: ${rptAct}`);
  if(hasBA){const baPg=ba?.printed_page||ba?.page_no||null;for(const task of rankedBookTasksForRpt(ba,rptAct,codes,title,subjectId,2)){const stud=studentizeSourceTask(task,en);if(stud)out.push(`${en?'Workbook':'BA'}${baPg?` ${en?'p.':'m/s'} ${baPg}`:''}: ${stud}`)}}
  if(!out.length&&rptAct)out.push(`${en?'RPT lesson':'RPT sesi'}${exact?.session?` S${exact.session}`:''}: ${rptAct}`);
  // Fallback: if still no activities from BT/BA, extract directly from RPT session context
  if(!out.length&&sessionContext){const rptFallbackActs=sourceActivityLines(sessionContext,4);for(const a of rptFallbackActs){const stud=studentizeSourceTask(a,en);if(stud)out.push(`${en?'RPT session':'RPT sesi'}${exact?.session?` S${exact.session}`:''}: ${stud}`)}}
  return uniqueSentences(out).filter(Boolean).slice(0,7);
}
function compactRptEvidence(context='',week=null,unitInfo=null,codes=[]){
  const clean=normalizeText(context);if(!clean)return '';const out=[];
  const wr=weekPattern(week),m=wr.exec(clean);if(m){const tail=clean.slice(m.index);const next=/\b(?:minggu(?:\s*ke)?|week|wk)\s*[-:#.]?\s*(\d{1,2})\b/ig;next.lastIndex=m[0].length;let n,end=Math.min(tail.length,180);while((n=next.exec(tail))){if(Number(n[1])!==Number(week)){end=n.index;break}}out.push(tail.slice(0,end).replace(/\s+/g,' ').trim())}
  if(unitInfo?.number||unitInfo?.topic)out.push(`${unitInfo?.number?`Unit ${unitInfo.number}`:'Unit'}${unitInfo?.topic?` • ${unitInfo.topic}`:''}`);
  const details=standardDetails(clean);for(const code of [...new Set(codes)].slice(0,4)){const d=details.find(x=>x.code===code);out.push(d?.description?`${code} — ${d.description}`:code)}
  return out.filter(Boolean).join('\n');
}

function updateLessonMapLanguageUI(){const lang=lessonLanguage($('#mapSubject')?.value),en=lang==='en';const set=(id,ms,enText)=>{const el=$(id);if(el)el.textContent=en?enText:ms};set('#mapLabelTitle','Tajuk','Topic');set('#mapLabelSk','Standard Kandungan','Content Standard');set('#mapLabelSp','Standard Pembelajaran','Learning Standard(s)');set('#mapLabelMainSp','SP Utama / Main Learning Standard','Main Learning Standard');set('#mapLabelCompSp','SP Sokongan / Complementary LS','Complementary Learning Standard(s)');set('#mapLabelObjective','Objektif','Learning Objective');set('#mapLabelCriteria','Kriteria Kejayaan','Success Criteria');set('#mapLabelCompEvidence','Evidens Sokongan / Complementary Evidence','Complementary Evidence');set('#mapLabelBtStart','BT m/s bercetak mula',"Student's Book — printed page start");set('#mapLabelBtEnd','BT m/s bercetak akhir',"Student's Book — printed page end");set('#mapLabelBa','BA m/s bercetak (opsyenal)','Workbook — printed page (optional)');set('#mapLabelProgression','Tahap Perkembangan','Stage of Learning');set('#mapLabelActivities','Aktiviti khusus sumber','Source-based Activities');const role=$('#mapRoleNote');if(role)role.innerHTML=en?'If the Scheme of Work does not explicitly identify Main/Complementary standards, these roles are <b>engine-matched</b> from the source-page activity and DSKP cross-check. The teacher still verifies the Lesson Map before saving.':'Jika RPT tidak menandakan Main/Complementary secara eksplisit, peranan ini ialah <b>padanan engine</b> berdasarkan aktiviti halaman buku dan cross-check DSKP. Guru masih mengesahkan sebelum Lesson Map disimpan.';const note=$('#mapPageNote');if(note)note.innerHTML=en?'These are <b>printed book page numbers</b>, not PDF file page numbers. The engine maps PDF → printed page only when evidence is sufficient.':'Nombor ini ialah muka surat bercetak dalam buku, bukan nombor halaman fail PDF. Engine akan memetakan PDF → m/s buku apabila bukti mencukupi.';const prog=$('#mapProgression');if(prog){const labels=en?{introduction:'Introduction',guided:'Guided practice',application:'Application',assessment:'Assessment / Reinforcement',enrichment:'Enrichment'}:{introduction:'Pengenalan',guided:'Latihan berpandu',application:'Aplikasi',assessment:'PBD / Pengukuhan',enrichment:'Pengayaan'};[...prog.options].forEach(o=>o.textContent=labels[o.value]||o.textContent)}const a=$('#mapActivities');if(a)a.placeholder=en?"Actual activities from the Student's Book; Workbook only if uploaded":'Aktiviti sebenar daripada Buku Teks; BA hanya jika diupload';const ce=$('#mapComplementaryEvidence');if(ce)ce.placeholder=en?'Observable evidence from the complementary learning standards':'Evidens daripada SP sokongan';const draft=$('#saveLessonDraft');if(draft)draft.textContent=en?'Save Draft':'Simpan Draf';const verify=$('#verifyLessonMap');if(verify)verify.textContent=en?'✓ Verify Lesson Map':'✓ Sahkan Lesson Map'}

function stageLabel(v){return ({introduction:'Pengenalan',guided:'Latihan berpandu',application:'Aplikasi',assessment:'PBD / Pengukuhan',enrichment:'Pengayaan'})[v]||v||'Aplikasi'}
function instructionSentences(text){const action=/(murid|baca|lihat|perhati|bincang|jawab|lengkap|tulis|bina|lakukan|hasilkan|kenal|padan|warnakan|kira|ukur|nyatakan|jelaskan|demonstrasi|latihan|aktiviti|permainan|simulasi|cuba|praktis|pupils?|students?|read|listen|look|say|speak|write|answer|match|circle|underline|complete|identify|describe|discuss|ask|tell|draw|colou?r|choose|point|repeat|practi[cs]e|play|work|compare|tick|number|label|make|create|present|role[- ]?play)/i;return normalizeText(text).split(/(?<=[.!?])\s+|\n+|\s+[•▪◦]\s+/).map(s=>s.trim().replace(/^[-–—•▪◦\d.)\s]+/,'')).filter(s=>s.length>14&&s.length<320&&action.test(s)&&!/^\d{1,2}\.\d{1,2}\.\d{1,2}\b/.test(s));}
function uniqueSentences(list){const out=[];for(const s of list){const n=normalizeActivity(s);if(n&&!out.some(x=>normalizeActivity(x)===n))out.push(s)}return out}
function normalizeActivity(s){return normalizeText(s).toLowerCase().replace(/\b(murid|guru|secara|aktiviti|kemudian|seterusnya|dan|yang|untuk|dengan|pada|dalam)\b/g,' ').replace(/[^a-z0-9À-ž\s]/gi,' ').replace(/\s+/g,' ').trim()}
function jaccard(a,b){const A=new Set(normalizeActivity(a).split(' ').filter(Boolean)),B=new Set(normalizeActivity(b).split(' ').filter(Boolean));if(!A.size||!B.size)return 0;let inter=0;A.forEach(x=>B.has(x)&&inter++);return inter/(A.size+B.size-inter)}
function maxActivitySimilarity(text,subjectId,classId){const hist=state.activityHistory.filter(x=>x.subject_id===subjectId&&(!classId||x.class_id===classId)).slice(0,18);return hist.reduce((m,h)=>Math.max(m,jaccard(text,h.activity_text||'')),0)}
function lessonMapKey(m){return `${m.subject_id}|${m.year}|${m.academic_year}|${m.week_no}|${m.session_no}`}

let currentWeekCoverage=null;
function declaredBookRefs(text='',kind='BT'){
  const src=normalizeText(text),out={kind:String(kind||'BT').toUpperCase(),volume:null,pages:[],raw:''};
  const tag=out.kind==='BA'?'BA':'BT';
  const re=new RegExp('(?<![0-9.])'+tag+'\\s*([12])?\\s*(?:(?:m\\/?s|ms|hlm|halaman)\\s*)?[:.]?\\s*(\\d{1,3})(?:\\s*[-–—]\\s*(\\d{1,3}))?','ig');let m;
  while((m=re.exec(src))){const a=Number(m[2]),b=Number(m[3]||m[2]);if(!a||a>=500||b<a||b-a>12)continue;if(!out.volume&&m[1])out.volume=Number(m[1]);for(let n=a;n<=b;n++)if(!out.pages.includes(n))out.pages.push(n);out.raw=m[0];break}
  return out;
}
function declaredBookVolumeForDoc(doc){const k=normKey(`${doc?.file_name||''} ${doc?.title||''}`);let m=k.match(/(?:jilid|volume|vol)\s*([12])\b/);if(m)return Number(m[1]);m=k.match(/(?:^|\s)(?:bt|ba)\s*([12])(?:\s|$)/);return m?Number(m[1]):null}
function filterPagesByDeclaredVolume(pages=[],volume=null){if(!volume)return pages;return pages.filter(p=>declaredBookVolumeForDoc(p.doc)===Number(volume))}
function routeExactDeclaredBookPage(pages=[],declared={}){const refs=[...new Set((declared?.pages||[]).map(Number).filter(Boolean))];if(!refs.length)return null;const volume=Number(declared?.volume||0)||null;const pool=filterPagesByDeclaredVolume(applyKnownBookProfilePages(pages),volume);for(const ref of refs){const hit=pool.find(p=>Number(p.printed_page||p.page_no)===Number(ref));if(hit)return {...hit,match:250,_pageMethod:'stable-rpt-exact-page',_pageVerified:true,_routeScore:250,page_mapping_confidence:100}}return null}
function murniActivityFromBlock(block=''){
  const lines=normalizeText(block).split('\n').map(x=>x.trim()).filter(Boolean);
  // Refined RPT tables use a stable layout: title -> BT/BA reference -> one unique activity -> evidence/status.
  const refIndex=lines.findIndex(x=>/(?<![0-9.])BT\s*[12]?\s*(?:m\/?s|ms|:)/i.test(x));
  if(refIndex>=0&&lines[refIndex+1]&&!/^(?:Status\s*:|Integrasi\s*:|BM\d+-M\d+-S\d+)/i.test(lines[refIndex+1])){const exact=cleanSourceActivityPhrase(lines[refIndex+1]);if(exact.length>12&&!isManualReviewActivityPlaceholder(exact))return exact}
  let start=-1;for(let i=0;i<lines.length;i++){if(/^(?:Penerokaan sumber|Aplikasi susulan|Bimbing murid|Minta murid|Murid\b|Laksanakan tugasan|Pemulihan\b|Pengayaan\b|Penilaian\b|Jawab\b|Baca\b|Bina\b|Tulis\b|Lengkapkan\b|Nyatakan\b|Jelaskan\b|Persembahkan\b)/i.test(lines[i])){start=i;break}}
  if(start>=0){const out=[];for(let i=start;i<lines.length;i++){if(i>start&&/^(?:Respons\s*\/|Bacaan\b|Hasil\b|Persembahan\b|Penggunaan\b|Status\s*:|Integrasi\s*:|BM\d+-M\d+-S\d+)/i.test(lines[i]))break;out.push(lines[i]);if(out.join(' ').length>850)break}const a=cleanSourceActivityPhrase(out.join(' '));if(a.length>12)return a}
  const acts=sourceActivityLines(block,3);return acts.join(' | ');
}
function murniTitleFromBlock(block='',spFocus=''){
  const src=normalizeText(block),lines=src.split('\n').map(x=>x.trim()).filter(Boolean);let ref=-1;
  const btHit=/(?<![0-9.])BT\s*[12]?\s*(?:(?:m\/?s|ms|hlm|halaman)\s*)?[:.]?\s*\d{1,3}/i.exec(src);
  if(btHit&&spFocus){const before=src.slice(0,btHit.index);const pos=before.toLowerCase().lastIndexOf(String(spFocus).toLowerCase());if(pos>=0){let tail=before.slice(pos+String(spFocus).length).replace(/^[\s;:,.\-–—]+/,'').trim();tail=tail.split('\n').map(x=>x.trim()).filter(Boolean).pop()||tail;const anchored=cleanLessonTitle(tail);if(anchored.length>2&&!suspiciousTitle(anchored))return anchored;}}
  const btRe=/(?<![0-9.])BT\s*[12]?\s*(?:(?:m\/?s|ms|hlm|halaman)\s*)?[:.]?\s*\d{1,3}/i;
  for(let i=0;i<lines.length;i++){if(btRe.test(lines[i])){ref=i;break}}
  const bad=/^(?:BM\d+-M\d+-S\d+|Sesi\s+\d+|Penerokaan|Aplikasi|Pembelajaran Utama|Penilaian|Pengukuhan|Pengayaan|Tema\s+\d+|Unit\s+\d+|\d\.\d(?:\.\d)?\b|→)/i;
  // Mammoth may keep the title and BT reference in the same table-cell line.
  if(ref>=0){
    const sameLine=cleanLessonTitle(lines[ref].replace(/(?<![0-9.])BT\s*[12]?[\s\S]*$/i,'').trim());
    if(sameLine.length>2&&!bad.test(sameLine)&&!validSpCode(sameLine.split(/\s/)[0]))return sameLine;
  }
  if(ref>0){for(let i=ref-1;i>=0;i--){const l=lines[i];if(l.length>2&&!bad.test(l)&&!validSpCode(l.split(/\s/)[0]))return cleanLessonTitle(l)}}
  // Last-resort title immediately before the BT marker, but never return Tema/Unit/SP prose.
  const m=src.match(/([^\n|]{3,100}?)\s*(?<![0-9.])BT\s*[12]?\s*(?:(?:m\/?s|ms|hlm|halaman)\s*)?[:.]?\s*\d{1,3}/i);
  if(m){const t=cleanLessonTitle(m[1]);if(t&&!bad.test(t)&&!suspiciousTitle(t))return t}
  return '';
}
function murniSpFocusFromBlock(block='',spCodes=[]){
  const src=normalizeText(block),code=String((spCodes||[])[0]||'').trim();if(!src||!code)return '';
  const esc=code.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');const m=new RegExp(esc+'[\\s\\S]{0,420}?\\(([ivx]+)\\)\\s*([^\\n|;]{2,100})','i').exec(src);
  if(!m)return '';
  let label=cleanSourceActivityPhrase(m[2]||'').replace(/(?<![0-9.])(?:BT|BA)\s*[12]?[\s\S]*$/i,'').trim();
  label=label.replace(/\b(?:Bilik Darjah|Mural|Jimatkan|Gunakan|Amalan)\b[\s\S]*$/i,'').trim()||cleanSourceActivityPhrase(m[2]||'').trim();
  return `(${String(m[1]).toLowerCase()}) ${label}`.trim();
}
function focusedStandardDetail(session=null,detail=null){
  if(!session?.spFocus)return detail;
  const focus=String(session.spFocus).replace(/^\([^)]+\)\s*/,'').trim();if(!focus)return detail;
  return {code:session.spCodes?.[0]||detail?.code||'',description:focus};
}
function extractMurniSummaryTableMarks(src='',weekNo=null,maxSessions=5){
  const w=Number(weekNo);if(!w)return [];
  // DOCX table extraction may put the week number and date range on separate
  // lines. Science RPT uses this table form (SP n.n.n | BT n), rather than
  // the BMx-Mxx-Sx stable marker form.
  const date='\\d{1,2}[.\\/-]\\d{1,2}[.\\/-]\\d{4}';
  // Some DOCX tables place the end date in a lower table row, after the
  // teaching cells. The week number + start-date pair is still a stable row
  // anchor; the SP/BT pairs below are required before a session is accepted.
  const re=new RegExp('(?:^|\\n)\\s*'+w+'\\s*(?:\\n|\\s)+'+date+'\\s*[-–—]','i');
  const hit=re.exec(src);if(!hit)return [];
  const next=new RegExp('(?:^|\\n)\\s*\\d{1,2}\\s*(?:\\n|\\s)+'+date+'\\s*[-–—]','g');
  next.lastIndex=hit.index+hit[0].length;
  const n=next.exec(src);
  const block=src.slice(hit.index,n?n.index:src.length);
  const er=/\bSP\s+(\d+\.\d+\.\d+)\s*(?:\|\s*)?BT\s+(\d{1,3})(?:\s*\(Jilid\s*(\d)\))?(?:\s*\|\s*([^|\n]{3,140}))?/gi;
  return [...block.matchAll(er)].slice(0,Math.max(1,Number(maxSessions)||5)).map((m,i)=>({
    raw:`M${String(w).padStart(2,'0')}-S${i+1}`,
    week:w,session:i+1,index:hit.index+(m.index||0),
    context:[`SP ${m[1]}`,`BT ${m[2]}${m[3]?` (Jilid ${m[3]})`:''}`,m[4]].filter(Boolean).join('\n'),
    titleHint:cleanLessonTitle(m[4]||''),
    spCode:m[1],
    bt:{raw:`BT ${m[2]}`,volume:m[3]?Number(m[3]):null,pages:[Number(m[2])]}
  }));
}
function mappedRptField(row='',label=''){
  const re=new RegExp('(?:^|\\|\\s*)'+label+'\\s*:\\s*([^|\\n]*)','i');
  return normalizeText(re.exec(row)?.[1]||'').trim();
}
function extractWorkbookMappedSessions(src='',weekNo=null){
  const w=Number(weekNo);if(!w)return [];
  // RPT mapping workbooks are indexed as one labelled row per session, e.g.
  // Mapping_ID: EN1-2025B-W34-S1 | Learning_Standard: 1.2.4 |
  // SB_Printed_Page: 54. Treat the row itself as the RPT evidence; no page
  // is inferred from a range and the Student's Book task is still read from
  // the exact OCR page.
  const out=[];
  for(const [index,line] of normalizeText(src).split('\n').entries()){
    const id=/\b(?:Mapping_ID\s*:\s*)?([A-Z]{2,}\d*(?:-[A-Z0-9]+)+-W(\d{1,2})-S(\d{1,2}))\b/i.exec(line);
    if(!id||Number(id[2])!==w)continue;
    const sp=(mappedRptField(line,'Learning_Standard')||mappedRptField(line,'LS')).match(/\b\d{1,2}\.\d{1,2}\.\d{1,2}\b/)?.[0]||'';
    const pageText=mappedRptField(line,'SB_Printed_Page')||mappedRptField(line,"Student(?:[’']s)?_Book_Page")||'';
    const page=Number(pageText.match(/\b\d{1,3}\b/)?.[0]||0);
    if(!validSpCode(sp)||!page)continue;
    const module=mappedRptField(line,'Module');
    const title=cleanLessonTitle(module.replace(/^Unit\s*\d+\s*:\s*/i,''));
    const focus=mappedRptField(line,'LS_Description')||mappedRptField(line,'Learning_Standard_Description');
    out.push({
      raw:id[1],week:w,session:Number(id[3]),index,
      context:line,titleHint:title,spCode:sp,spFocus:focus,
      bt:{raw:"Student's Book p. "+page,volume:null,pages:[page]}
    });
  }
  return out;
}
function englishMurniWeekTitle(header=''){
  const lines=normalizeText(header).split('\n').map(x=>x.trim()).filter(Boolean);
  for(let i=lines.length-1;i>=0;i--){
    let text=lines[i]
      .replace(/^\d{1,2}\s+\d{1,2}[.\/-]\d{1,2}[.\/-]\d{4}\s*[-–—]\s*\d{1,2}[.\/-]\d{1,2}[.\/-]\d{4}\s*/,'')
      .replace(/^(?:Teaching|Partial teaching week|Teaching \(partial before break\)|Teaching \(state.?specific[^)]*\))\s*/i,'')
      .replace(/^Civic Edu\s*:\s*\w+\s*/i,'')
      .trim();
    if(!text||/^(?:Sabah|Sarawak|Partial week|generate only|state.?aware|week)\b/i.test(text))continue;
    text=text.replace(/^Unit\s*\d+\s*:\s*/i,'').trim();
    if(text.length>=3&&!/^(?:Teaching|Revision|UASA|Orientation)\b/i.test(text)&&!suspiciousTitle(text))return cleanLessonTitle(text);
  }
  return '';
}
function extractEnglishMurniTableSessions(src='',weekNo=null){
  const w=Number(weekNo);if(!w)return [];
  // English RPT Murni tables anchor each lesson in a weekly row instead of a
  // Mapping_ID: the sequence is Skill -> LS -> SB/WB printed page.  Each
  // row below is RPT evidence only; the task itself remains extracted from
  // the locked Student's Book page.
  const text=normalizeText(src);
  const date='\\d{1,2}[.\\/-]\\d{1,2}[.\\/-]\\d{4}';
  const startRe=new RegExp('(?:^|\\n)\\s*'+w+'\\s+'+date+'\\s*[-–—]','i');
  const hit=startRe.exec(text);if(!hit)return [];
  const nextRe=new RegExp('(?:^|\\n)\\s*\\d{1,2}\\s+'+date+'\\s*[-–—]','g');
  nextRe.lastIndex=hit.index+hit[0].length;
  const next=nextRe.exec(text),block=text.slice(hit.index,next?next.index:text.length);
  const firstSkill=block.search(/(?:^|\n)(?:Listening|Speaking|Reading|Writing|Language Arts)\s*(?:\n|LS\b|\|\s*LS\b|$)/i);
  const title=englishMurniWeekTitle(firstSkill>=0?block.slice(0,firstSkill):block);
  const rows=[];
  const skillRe=/(?:^|\n)(Listening|Speaking|Reading|Writing|Language Arts)\s*\n\s*(?:LS|Learning Standard)\s*(\d{1,2}\.\d{1,2}\.\d{1,2})\s*\n\s*SB\s*(\d{1,3})(?:\s*[-–—]\s*(\d{1,3}))?(?:\s*\|\s*WB\s*(\d{1,3})(?:\s*[-–—]\s*(\d{1,3}))?)?/gi;
  let m;while((m=skillRe.exec(block))&&rows.length<5){
    const sbStart=Number(m[3]),sbEnd=Number(m[4]||m[3]),wbStart=Number(m[5]||0),wbEnd=Number(m[6]||m[5]||0);
    if(!validSpCode(m[2])||!sbStart||sbEnd<sbStart||sbEnd-sbStart>12)continue;
    const sbPages=[];for(let n=sbStart;n<=sbEnd;n++)sbPages.push(n);
    const wbPages=[];for(let n=wbStart;n&&n<=wbEnd;n++)wbPages.push(n);
    const start=m.index||0,end=block.indexOf('\n'+m[1],start+Math.max(1,m[0].length));
    rows.push({
      raw:`EN-M${String(w).padStart(2,'0')}-S${rows.length+1}`,week:w,session:rows.length+1,index:hit.index+start,
      context:block.slice(start,end>start?end:block.length).trim(),titleHint:title,spCode:m[2],
      bt:{raw:`Student's Book p. ${sbStart}${sbEnd!==sbStart?`-${sbEnd}`:''}`,volume:null,pages:sbPages},
      ba:wbPages.length?{raw:`Workbook p. ${wbStart}${wbEnd!==wbStart?`-${wbEnd}`:''}`,volume:null,pages:wbPages}:{kind:'BA',volume:null,pages:[],raw:''}
    });
  }
  // Some DOCX extractions collapse each English row into one line, e.g.
  // “ListeningLS 1.2.2SB 91 | WB 73”. The same RPT row remains the anchor;
  // only the parser becomes tolerant of the collapsed separators.
  if(!rows.length){
    const compactRe=/(?:^|\n)(Listening|Speaking|Reading|Writing|Language Arts)\s*(?:\|\s*)?(?:LS|Learning Standard)\s*(\d{1,2}\.\d{1,2}\.\d{1,2})\s*(?:\|\s*)?(?:SB|Student(?:['’]s)? Book)\s*(\d{1,3})(?:\s*[-–—]\s*(\d{1,3}))?(?:\s*\|\s*(?:WB|Workbook)\s*(\d{1,3})(?:\s*[-–—]\s*(\d{1,3}))?)?/gi;
    while((m=compactRe.exec(block))&&rows.length<5){
      const sbStart=Number(m[3]),sbEnd=Number(m[4]||m[3]),wbStart=Number(m[5]||0),wbEnd=Number(m[6]||m[5]||0);
      if(!validSpCode(m[2])||!sbStart||sbEnd<sbStart||sbEnd-sbStart>12)continue;
      const sbPages=[];for(let n=sbStart;n<=sbEnd;n++)sbPages.push(n);
      const wbPages=[];for(let n=wbStart;n&&n<=wbEnd;n++)wbPages.push(n);
      const start=m.index||0,end=block.indexOf('\n'+m[1],start+Math.max(1,m[0].length));
      rows.push({
        raw:`EN-M${String(w).padStart(2,'0')}-S${rows.length+1}`,week:w,session:rows.length+1,index:hit.index+start,
        context:block.slice(start,end>start?end:block.length).trim(),titleHint:title,spCode:m[2],
        bt:{raw:`Student's Book p. ${sbStart}${sbEnd!==sbStart?`-${sbEnd}`:''}`,volume:null,pages:sbPages},
        ba:wbPages.length?{raw:`Workbook p. ${wbStart}${wbEnd!==wbStart?`-${wbEnd}`:''}`,volume:null,pages:wbPages}:{kind:'BA',volume:null,pages:[],raw:''}
      });
    }
  }
  return rows;
}
function isGenericRptSessionTitle(v=''){
  const t=cleanLessonTitle(v);
  return !t||/^(?:pdp|teaching|unit\s*\d+\b|minggu\s*\d+\b|week\s*\d+\b|revision|ulang\s*kaji|cuti|uasa|orientasi)\b/i.test(t);
}
function extractMurniWeekSessions(text='',weekNo=null,opts={}){
  const src=normalizeText(text);
  const maxSessions=Math.max(0,Number(opts.maxSessions||0));
  // Primary format: BM1-M01-S1 (RPT murni with stable session IDs)
  const bmMarks=[...src.matchAll(/\bBM\d+\s*-\s*M(\d{2})\s*-\s*S(\d{1,2})(?!\d)/gi)];
  let marks=bmMarks.map(m=>({raw:m[0],week:Number(m[1]),session:Number(m[2]),index:m.index}));
  if(!marks.length)marks=extractWorkbookMappedSessions(src,weekNo);
  if(!marks.length)marks=extractEnglishMurniTableSessions(src,weekNo);
  if(!marks.length)marks=extractMurniSummaryTableMarks(src,weekNo,maxSessions||5);
  // Fallback formats when BM-M-S not found: Sesi/Lesson/Pelajaran/Nombor markers
  if(!marks.length){
    const sesiRe=/(?:^|\n)\s*(?:Sesi|Session|Lesson|Pelajaran)\s*[-:#.]?\s*(\d{1,2})\b/gi;let m;while((m=sesiRe.exec(src))){marks.push({raw:m[0].trim(),week:Number(weekNo||1),session:Number(m[1]),index:m.index})}
    // Day markers: Isnin/Selasa/Rabu/Khamis/Jumaat
    if(!marks.length){const dayRe=/(?:^|\n)\s*(?:Isnin|Selasa|Rabu|Khamis|Jumaat|Monday|Tuesday|Wednesday|Thursday|Friday)\b/gi;let m3;let dayCount=0;while((m3=dayRe.exec(src))&&dayCount<6){dayCount++;marks.push({raw:m3[0].trim(),week:Number(weekNo||1),session:dayCount,index:m3.index})}}
  }
  const out=[];
  for(let i=0;i<marks.length;i++){const w=Number(marks[i].week||weekNo),session=Number(marks[i].session);if(Number(weekNo)!==w)continue;const start=marks[i].index,end=marks[i+1]?.index??src.length;const context=marks[i].context||src.slice(start,end).trim();const codes=extractSkSp(context);const firstSp=marks[i].spCode||(codes.spCodes||[]).find(validSpCode)||'';const spCodes=firstSp?[firstSp]:[];const spFocus=marks[i].spFocus||murniSpFocusFromBlock(context,spCodes);const bt=marks[i].bt||declaredBookRefs(context,'BT'),ba=declaredBookRefs(context,'BA');const activity=murniActivityFromBlock(context);const hinted=marks[i].titleHint&&!suspiciousTitle(marks[i].titleHint)?marks[i].titleHint:'';const inferred=murniTitleFromBlock(context,spFocus);const title=!isGenericRptSessionTitle(hinted)?hinted:(!isGenericRptSessionTitle(inferred)?inferred:'');const skCodes=firstSp?[firstSp.split('.').slice(0,2).join('.')]:[];
    // RPT determines when, SK/SP and the exact BT page. The actual activity
    // is deliberately recovered from that BT page, so it is not a requirement
    // for recognising a valid Sains/English RPT session.
    out.push({id:marks[i].raw.replace(/\s+/g,''),week:w,session,context,title,spCodes,spFocus,skCodes,activity,bt,ba,complete:Boolean(spCodes.length&&skCodes.length&&bt.pages.length)})}
  const ded=[];for(const row of out.sort((a,b)=>a.session-b.session)){const prev=ded.find(x=>x.session===row.session);if(!prev){ded.push(row);continue}const score=x=>(x.complete?100:0)+(x.title?20:0)+(x.bt?.pages?.length?20:0)+(x.activity?.length>12?20:0);if(score(row)>score(prev))ded[ded.indexOf(prev)]=row}
  return maxSessions?ded.slice(0,maxSessions):ded;
}
function subjectRPTSessionLimit(subjectId){
  const sub=getSubject(subjectId),key=normKey([sub?.code,sub?.name].filter(Boolean).join(' '));
  // Science timetable at this school is two periods weekly. Its supplied
  // Murni RPT table is a five-column source pool, not five real timetabled
  // lessons. Only S1/S2 may become Lesson Maps; S3–S5 remain source context.
  return /(?:^| )(?:sains|science|sn)(?: |$)/.test(key)?2:0;
}
function weekCoverageFromRptChunks(rptChunks=[],f=currentMapFilter()){
  const byDoc=new Map();for(const x of rptChunks){if(!byDoc.has(x.document_id))byDoc.set(x.document_id,[]);byDoc.get(x.document_id).push(x)}let best=null;
  const sessionLimit=subjectRPTSessionLimit(f.subject_id);
  for(const items of byDoc.values()){const sorted=[...items].sort((a,b)=>Number(a.chunk_no||0)-Number(b.chunk_no||0));const full=sorted.map(x=>x.content||'').join('\n');const sessions=extractMurniWeekSessions(full,f.week_no,{maxSessions:sessionLimit});if(!sessions.length)continue;const completeCount=sessions.filter(x=>x.complete).length;const activityKeys=sessions.map(x=>normalizeActivity(x.activity)).filter(Boolean);const uniqueActivities=new Set(activityKeys).size;const sourceComplete=completeCount===sessions.length;const quality=sessions.length?completeCount/sessions.length:0;const sourceTime=Date.parse(sorted[0]?.doc?.updated_at||sorted[0]?.doc?.created_at||'')||0;const score=Math.round(quality*1000)+uniqueActivities;const row={mode:'stable-session-id',enforce:true,week:f.week_no,sessions,expected:sessions.length,completeCount,uniqueActivities,sourceComplete,doc:sorted[0]?.doc,sessionLimit,score,quality,sourceTime};if(!best||row.quality>best.quality||(row.quality===best.quality&&row.sourceTime>best.sourceTime))best=row}
  if(!best){
    // v0.3.3.37: Collect raw RPT text for the selected week so teachers can manually verify during mapping.
    const weekTexts=[];const weekRe=new RegExp('(?:\\b(?:MINGGU|WEEK)\\s*'+f.week_no+'\\b)','i');
    for(const items of byDoc.values()){
      const sorted=[...items].sort((a,b)=>Number(a.chunk_no||0)-Number(b.chunk_no||0));
      const full=sorted.map(x=>x.content||'').join('\n');
      const m=weekRe.exec(full);
      if(m){weekTexts.push(full.slice(m.index,Math.min(full.length,m.index+2400)).trim())}
    }
    return {mode:'legacy-rpt',enforce:false,week:f.week_no,sessions:[],expected:0,completeCount:0,uniqueActivities:0,sourceComplete:true,doc:null,score:0,rawWeekText:weekTexts.join('\n\n').slice(0,4800)};
  }
  const verified=state.lessonMaps.filter(x=>x.subject_id===f.subject_id&&Number(x.year)===Number(f.year)&&Number(x.academic_year)===Number(f.academic_year)&&Number(x.week_no)===Number(f.week_no)&&x.verification_status==='verified');best.verifiedSessions=[...new Set(verified.map(x=>Number(x.session_no)))];best.verifiedCount=best.sessions.filter(s=>best.verifiedSessions.includes(s.session)).length;return best;
}
// v0.3.3.37: Render RPT text with clickable SP codes, titles, and BT/BA references for auto-fill.
function renderInteractiveRptText(text='',weekNo=null){
  if(!text)return '';
  const lines=normalizeText(text).split('\n');
  const processed=lines.map(line=>{
    let h=escapeHtml(line);
    // 1) Wrap SP codes like 3.2.2 in clickable spans
    h=h.replace(/\b(\d{1,2}\.\d{1,2}\.\d{1,2})\b/g,(m,code)=>validSpCode(code)?`<span class="rpt-clickable rpt-sp" data-sp="${code}" title="Klik untuk isi SP: ${code}">${code}</span>`:m);
    // 2) Wrap title-like labels (Tajuk/Topic/Tema/Unit)
    const titleMatch=h.match(/^(?:Topic|Tajuk|Tema|Theme|Unit)\s*[:\-\u2013\u2014]?\s*(.{4,120})$/i);
    if(titleMatch){const raw=titleMatch[1].trim();if(!suspiciousTitle(raw))h=h.replace(raw,`<span class="rpt-clickable rpt-title" data-title="${raw.replace(/"/g,'&quot;')}" title="Klik untuk isi Tajuk">${raw}</span>`) }
    // 3) Wrap BT/BA page references
    h=h.replace(/(?<![0-9.])BT\s*[12]?\s*(?:m\/?s|ms)?\s*[:.]?\s*(\d{1,3}(?:\s*[-\u2013\u2014]\s*\d{1,3})?)/gi,(m,pages)=>`<span class="rpt-clickable rpt-bt" data-pages="${pages}" title="Klik untuk isi BT m/s ${pages}">${m}</span>`);
    return h;
  });
  return processed.join('\n');
}
// v0.3.3.37: Event handler for interactive RPT preview clicks.
function onRptPreviewClick(e){
  const t=e.target.closest('.rpt-clickable');if(!t)return;
  if(t.classList.contains('rpt-sp')){
    const code=t.dataset.sp;if(!code)return;
    const spEl=$('#mapSp'),skEl=$('#mapSk');
    const existing=String(spEl?.value||'').split(',').map(x=>x.trim()).filter(Boolean);
    if(!existing.includes(code)){existing.push(code);spEl.value=existing.join(', ')}
    const skCode=code.split('.').slice(0,2).join('.');const existingSk=String(skEl?.value||'').split(',').map(x=>x.trim()).filter(Boolean);
    if(!existingSk.includes(skCode)){existingSk.push(skCode);skEl.value=existingSk.join(', ')}
    toast(`SP ${code} ditambah ke Senarai Standard Pembelajaran.`);
  }else if(t.classList.contains('rpt-title')){
    const title=t.dataset.title;if(!title)return;
    $('#mapTitle').value=cleanLessonTitle(title);
    toast(`Tajuk: "${cleanLessonTitle(title)}" diisi.`);
  }else if(t.classList.contains('rpt-bt')){
    const pages=t.dataset.pages;if(!pages)return;
    const parts=pages.split(/\s*[-\u2013\u2014]\s*/).map(Number).filter(Boolean);
    if(parts[0])$('#mapBtStart').value=parts[0];
    if(parts[1])$('#mapBtEnd').value=parts[1];
    toast(`BT m/s ${pages} diisi.`);
  }
  e.preventDefault();e.stopPropagation();
}
function renderWeekCoverage(cov=currentWeekCoverage,f=currentMapFilter()){
  const box=$('#mapWeekCoverage');if(!box)return;if(!f.subject_id){box.innerHTML='<div class="empty-small">Pilih subjek untuk semak liputan mingguan.</div>';return}
  const en=lessonLanguage(f.subject_id)==='en';if(!cov||!cov.enforce){const rawText=cov?.rawWeekText||'';box.innerHTML=`<div class="week-coverage-head"><div><div class="eyebrow">${en?'WEEKLY SOURCE COVERAGE':'LIPUTAN SUMBER MINGGUAN'}</div><h3>${en?'Stable session IDs not detected':'ID sesi stabil belum dikesan'}</h3></div><span class="pill demo">INFO</span></div><p class="field-note">${en?'This Scheme of Work does not expose stable per-session IDs, so weekly completeness is not enforced.':'RPT ini tidak mempunyai ID seperti BM2-M29-S1. Sistem tidak akan meneka jumlah sesi; gunakan RPT murni untuk semakan liputan penuh.'}</p>${rawText?`<details class="rpt-week-preview"><summary>${en?'View RPT content for Week '+f.week_no:'Lihat kandungan RPT Minggu '+f.week_no}</summary><pre class="rpt-interactive">${renderInteractiveRptText(rawText,f.week_no)}</pre><p class="field-note">${en?'Click SP codes, titles or BT references to auto-fill Lesson Map fields.':'Klik kod SP, tajuk atau rujukan BT untuk auto isi medan Lesson Map.'}</p></details>`:''}`;return}
  const expected=cov.expected||0,complete=cov.completeCount||0,verified=cov.verifiedCount||0,ok=Boolean(cov.sourceComplete);const status=ok?(en?'RPT ANCHORS COMPLETE':'JANGKAR RPT LENGKAP'):(en?'INCOMPLETE':'BELUM LENGKAP');
  box.innerHTML=`<div class="week-coverage-head"><div><div class="eyebrow">${en?'WEEKLY SOURCE COVERAGE':'LIPUTAN SUMBER MINGGUAN'}</div><h3>${en?'Week':'Minggu'} ${f.week_no}: ${complete}/${expected} ${en?'sessions have LS + Student’s Book references':'sesi ada SK/SP + rujukan Buku Teks'}</h3><p>${verified}/${expected} ${en?'Lesson Maps verified':'Lesson Map telah disahkan'} • ${cov.uniqueActivities}/${expected} ${en?'RPT activity anchors':'jangkar aktiviti RPT'}</p></div><span class="pill ${ok?'':'demo'}">${status}</span></div><div class="week-session-grid">${cov.sessions.map(s=>{const ver=cov.verifiedSessions?.includes(s.session);const refs=[s.bt?.raw,s.ba?.raw].filter(Boolean).join(' • ');return `<button type="button" class="week-session-card ${s.complete?'ok':'miss'}${Number(f.session_no)===s.session?' active':''}" data-week-session="${s.session}"><b>S${s.session} ${s.complete?'✓':'✕'} ${escapeHtml(s.title||'')}</b><small>${s.spCodes.length?'SP '+escapeHtml(s.spCodes.join(', ')):'✕ SP'} • ${s.activity?'✓ Aktiviti RPT':'✓ Rujukan Buku Teks'}${refs?' • '+escapeHtml(refs):''}</small><span>${ver?'✓ '+(en?'Verified':'Disahkan'):(en?'○ Not verified':'○ Belum disahkan')}</span></button>`}).join('')}</div>${ok?'':`<div class="week-coverage-warning">⚠ ${en?'Verification is blocked until every RPT session in this week has a valid LS and Student’s Book reference. The actual activity is then read from the exact book page.':'Sahkan Lesson Map disekat sehingga setiap sesi RPT minggu ini mempunyai SK/SP yang sah dan rujukan Buku Teks. Aktiviti sebenar kemudian mesti dibaca daripada halaman buku yang tepat.'}</div>`}`;
  const input=$('#mapSession');if(input&&expected){input.max=String(expected);if(Number(input.value)>expected){input.value='1';f.session_no=1}}
  $$('#mapWeekCoverage [data-week-session]').forEach(btn=>btn.addEventListener('click',()=>{const n=Number(btn.dataset.weekSession);if($('#mapSession'))$('#mapSession').value=String(n);invalidateLessonAnalysis('session-card');renderWeekCoverage(cov,{...currentMapFilter(),session_no:n});toast(`${en?'Session':'Sesi'} ${n} dipilih • tekan Analisis Sumber.`)}));
}
async function refreshWeekCoverage({silent=false}={}){const f=currentMapFilter();if(!f.subject_id){currentWeekCoverage=null;renderWeekCoverage(null,f);return null}try{const chunks=await getChunksForSubject(f.subject_id,f.year,f.academic_year);const cov=weekCoverageFromRptChunks(chunks.filter(x=>x.doc?.source_type==='rpt'),f);currentWeekCoverage=cov;renderWeekCoverage(cov,f);if(!silent&&cov.enforce)toast(`Minggu ${f.week_no}: ${cov.completeCount}/${cov.expected} sesi sumber lengkap.`);return cov}catch(e){console.warn('weekly coverage',e);currentWeekCoverage=null;renderWeekCoverage(null,f);return null}}

function currentMapFilter(){return {subject_id:$('#mapSubject')?.value,year:Number($('#mapYear')?.value||1),academic_year:Number($('#mapAcademicYear')?.value||new Date().getFullYear()),week_no:Number($('#mapWeek')?.value||1),session_no:Number($('#mapSession')?.value||1)}}

function invalidateLessonAnalysis(reason='filter-change'){
  const hadCandidate=!!state.lessonCandidate;
  state.lessonCandidate=null;
  const ids=['mapTitle','mapSk','mapSp','mapMainSp','mapComplementarySp','mapObjective','mapCriteria','mapComplementaryEvidence','mapBtStart','mapBtEnd','mapBaPage','mapActivities'];
  ids.forEach(id=>{const el=$('#'+id);if(el)el.value=''});
  const prog=$('#mapProgression');if(prog)prog.value='introduction';
  const evidence=$('#mapEvidence');if(evidence)evidence.innerHTML='<div class="evidence-card miss"><div><b>Analisis sumber diperlukan</b></div><p>Pilihan Subjek/Tahun/Sesi/Minggu telah berubah. Tekan <b>Analisis Sumber</b> untuk membina padanan baharu. Keputusan lama sengaja dibuang supaya tidak terbawa ke minggu lain.</p></div>';
  renderMapGate(null,false);
  const pill=$('#mapStatusPill');if(pill){pill.textContent='DRAF';pill.className='pill demo'}
  if(hadCandidate&&reason!=='silent') toast('Pilihan Lesson Map berubah • keputusan lama dibersihkan. Jalankan Analisis Sumber semula.',3800);
}

function calcCandidateConfidence(c){let score=0;if(c.evidence?.rpt)score+=25;if(c.weekExact)score+=10;if(c.spCrosscheck)score+=15;if(c.evidence?.dskp)score+=10;if(c.evidence?.textbook)score+=30;if(c.title)score+=5;if(c.evidence?.activity_book)score+=5;const hasActivities=String(c.source_activities||'').trim().length>15;if(hasActivities)score+=8;if(c.textbook_page_start)score+=4;return Math.min(100,score)}
function evidenceCard(label,ev,ok,diagnostic=''){return `<div class="evidence-card ${ok?'ok':'miss'}"><div><b>${ok?'✓':'○'} ${escapeHtml(label)}</b>${ev?.ref?`<span>${escapeHtml(ev.ref)}</span>`:''}</div><p>${ev?.text?escapeHtml(snippet(ev.text,800)):diagnostic?`⚠ ${escapeHtml(diagnostic)}`:'Belum dipadankan.'}</p></div>`}

async function buildLessonCandidate(){if(!requireAuth())return;
  const f=currentMapFilter();if(!f.subject_id)return toast('Pilih subjek dahulu.');$('#mapEvidence').innerHTML='<div class="empty-small">Sedang cross-check sumber...</div>';
  const chunks=await getChunksForSubject(f.subject_id,f.year,f.academic_year);const rptChunks=chunks.filter(x=>x.doc?.source_type==='rpt');const dskpChunks=chunks.filter(x=>x.doc?.source_type==='dskp');
  const weeklyCoverage=weekCoverageFromRptChunks(rptChunks,f);currentWeekCoverage=weeklyCoverage;renderWeekCoverage(weeklyCoverage,f);const exactRptSession=weeklyCoverage.sessions?.find(x=>Number(x.session)===Number(f.session_no))||null;if(weeklyCoverage.enforce&&!exactRptSession){state.lessonCandidate=null;renderMapGate(null,false);return toast(`Sesi ${f.session_no} tidak ditemui dalam RPT murni Minggu ${f.week_no}. Sistem tidak akan jatuh balik ke sesi/jadual lain.`,6000)};
  const structured=state.rpt.find(x=>x.subject_id===f.subject_id&&Number(x.year)===f.year&&Number(x.week_no)===f.week_no);
  const byDoc=new Map();for(const x of rptChunks){if(!byDoc.has(x.document_id))byDoc.set(x.document_id,[]);byDoc.get(x.document_id).push(x)}
  const rptRank=[...byDoc.values()].map(items=>{const ctx=bestWeekContextForDoc(items,f.week_no);const cc=extractSkSp(ctx);const first=items[0];return {...first,ctx,match:ctx?contextQuality(ctx):0}}).filter(x=>x.ctx).sort((a,b)=>b.match-a.match);
  const rptTop=rptRank[0];const rptRaw=exactRptSession?.context||(structured?[structured.title,structured.sk,structured.sp,structured.objective,structured.success_criteria,structured.suggested_activities].filter(Boolean).join('\n'):rptTop?.ctx||'');
  const rptContext=exactRptSession?rptRaw:(structured?rptRaw:trimTargetWeekBlock(rptRaw,f.week_no));
  const sessionPick=exactRptSession?{text:rptContext,exact:true,method:'stable-session-id'}:(structured?{text:rptContext,exact:true,method:'structured'}:sessionSpecificContext(rptContext,f.session_no));const sessionContext=sessionPick.text||rptContext;let codes=extractSkSp(sessionContext);if(!codes.spCodes.length)codes=extractSkSp(rptContext);if(!codes.spCodes.length&&structured){const sc=extractSkSp([structured.sp,structured.sk].filter(Boolean).join(' '));if(sc.spCodes.length)codes=sc}let dskpTop=null;
  const unitInfo=extractUnitInfo(rptContext);const sourceFamily=sourceFamilyFromContext(rptContext,unitInfo,f.subject_id);const weekGroup=resolveWeekGroup(rptContext,f.week_no,unitInfo,f.subject_id,sourceFamily);const unitCandidates=weekUnitCandidates(rptRank.flatMap(x=>byDoc.get(x.document_id)||[]),f.week_no);const distinctUnitNos=[...new Set(unitCandidates.map(x=>x.unit.number).filter(Boolean))];const unitAmbiguous=!exactRptSession&&distinctUnitNos.length>1;
  let title=cleanLessonTitle(exactRptSession?.title||(exactRptSession?'':structured?.title||detectTitleFromContext(sessionContext,f.week_no)||detectTitleFromContext(rptContext,f.week_no)||unitInfo.topic||''));if(!exactRptSession&&suspiciousTitle(title)&&unitInfo.topic)title=unitInfo.topic;const query=[title,unitInfo.topic,exactRptSession?.activity||'',sessionContext,codes.spCodes.join(' ')].filter(Boolean).join(' ');
  const hasActivityBook=optionalActivityBookAvailable(f.subject_id,f.year,f.academic_year),requestedBookTypes=hasActivityBook?['textbook','activity_book']:['textbook'];const allPages=await getPagesForSubject(f.subject_id,f.year,requestedBookTypes,f.academic_year);const familyPages=filterPagesForSourceFamily(allPages,sourceFamily);const sourceFamilyMissing=Boolean(sourceFamily?.id&&!sourceFamily?.noBook&&!familyPages.length);const pages=sourceFamily?.id?familyPages:allPages;
  // Exact RPT refs outrank mathematical week splitting. BT and BA are parsed separately so BA page numbers cannot hijack BT routing.
  const declaredBt=exactRptSession?.bt||declaredBookRefs(rptContext,'BT'),declaredBa=hasActivityBook?(exactRptSession?.ba||declaredBookRefs(rptContext,'BA')):{kind:'BA',volume:null,pages:[],raw:''};
  const textbookPages=filterPagesByDeclaredVolume(pages.filter(p=>p.doc?.source_type==='textbook'),declaredBt.volume);const activityPages=hasActivityBook?filterPagesByDeclaredVolume(pages.filter(p=>p.doc?.source_type==='activity_book'),declaredBa.volume):[];
  const rawPageRefs=declaredBt.pages.length?[...declaredBt.pages]:extractPageRefs(rptContext);
  const btGround=groundUnitPages(textbookPages,unitInfo,weekGroup);const baGround=groundUnitPages(activityPages,unitInfo,weekGroup);
  const pageRefs=declaredBt.pages.length?[...declaredBt.pages]:rawPageRefs.filter(n=>!btGround.unitRange||pageInRange({printed_page:n},btGround.unitRange));
  let btPool=btGround.pages||[];if(btGround.unitRange&&!declaredBt.pages.length)btPool=btPool.filter(p=>pageInRange(p,btGround.unitRange));const btStructuralPool=[...btPool];const btReadablePool=btPool.filter(p=>String(p.content||'').trim().length>20&&(!isLowTextPdf(p.doc)||p.metadata?.ocr||pageRefs.includes(Number(p.printed_page||p.page_no))));
  const bt=exactRptSession&&declaredBt.pages.length?routeExactDeclaredBookPage(textbookPages,declaredBt):routeBookPage(btStructuralPool,btReadablePool,declaredBt.pages.length?null:btGround.weekRange,f.session_no,rptContext,codes.spCodes,query,pageRefs);
  let ba=null;if(hasActivityBook){let baPool=baGround.pages||[];if(baGround.unitRange&&!declaredBa.pages.length)baPool=baPool.filter(p=>pageInRange(p,baGround.unitRange));const baStructuralPool=[...baPool];const baReadablePool=baPool.filter(p=>String(p.content||'').trim().length>20&&(!isLowTextPdf(p.doc)||p.metadata?.ocr||declaredBa.pages.includes(Number(p.printed_page||p.page_no))));ba=exactRptSession&&declaredBa.pages.length?routeExactDeclaredBookPage(activityPages,declaredBa):routeBookPage(baStructuralPool,baReadablePool,declaredBa.pages.length?null:baGround.weekRange,f.session_no,rptContext,codes.spCodes,query,declaredBa.pages)}
  const bookHeading=detectBookHeading(bt?.content||'');if(suspiciousTitle(title)&&bookHeading)title=bookHeading;if(suspiciousTitle(title)&&unitInfo.topic)title=unitInfo.topic;if(exactRptSession?.title)title=cleanLessonTitle(exactRptSession.title);
  const bookText=[bt?.content||'',ba?.content||''].join('\n');const picked=selectRptStandardsByBook(rptContext,bookText,codes.spCodes);let shownSpCodes=(exactRptSession?.spCodes?.length?exactRptSession.spCodes.slice(0,1):picked.codes.slice(0,3));let details=standardDetails(sessionContext).filter(d=>shownSpCodes.includes(d.code));if(!details.length)details=picked.details.length?picked.details:standardDetails(rptContext).filter(d=>shownSpCodes.includes(d.code));
  // Confirm candidate standards individually against DSKP. If the top activity match is not in DSKP,
  // fall back to the next source-grounded candidate instead of silently keeping an unverified code.
  const verified=[];for(const d of details){const one=crosscheckDskpCodes([d.code],dskpChunks);if(one.ok)verified.push(one.details[0]||d)}if(verified.length){details=verified.slice(0,3);shownSpCodes=details.map(d=>d.code)}
  const dskpCheck=crosscheckDskpCodes(shownSpCodes,dskpChunks);dskpTop=dskpCheck.matches[0]?.chunk||null;
  const groundedDetails=dskpCheck.details.length?shownSpCodes.map(code=>dskpCheck.details.find(d=>d.code===code)||details.find(d=>d.code===code)).filter(Boolean):details;
  const mainCode=shownSpCodes[0]||'';const mainDetail=groundedDetails.find(d=>d.code===mainCode)||groundedDetails[0]||null;const focusedMainDetail=focusedStandardDetail(exactRptSession,mainDetail);const complementaryCodes=exactRptSession?shownSpCodes.slice(1):shownSpCodes.filter(x=>x!==mainCode);const complementaryDetails=groundedDetails.filter(d=>complementaryCodes.includes(d.code));const primaryBookText=bt?.content||bookText;const structuredObjective=String(structured?.objective||'').trim();const structuredCriteria=String(structured?.success_criteria||'').trim();const objective=isLogicalObjectiveText(structuredObjective)?structuredObjective:measurableObjective(focusedMainDetail,primaryBookText,bt?.printed_page||bt?.page_no||null,f.subject_id,f.year);const successCriteria=isLogicalObjectiveText(structuredCriteria)?structuredCriteria:measurableCriteria(focusedMainDetail,complementaryDetails,primaryBookText,bt?.printed_page||bt?.page_no||null,f.subject_id,f.year);const complementaryEvidence=complementaryEvidenceText(complementaryDetails,primaryBookText,bt?.printed_page||bt?.page_no||null,f.subject_id);const spFinal=shownSpCodes.join(', ');const skFinal=[...new Set(shownSpCodes.map(x=>x.split('.').slice(0,2).join('.')))].join(', ');
  title=cleanLessonTitle(title);if((suspiciousTitle(title)||/\btheme\b/i.test(title))&&unitInfo.topic)title=cleanLessonTitle(unitInfo.topic);
  // Keep two checks separate: (1) whether the selected SP codes are truly present in DSKP,
  // and (2) whether this lesson session is grounded strongly enough. v0.3.3.16 fixed a prior session-gate mismatch; v0.3.3.19 also invalidates stale analysis whenever lesson filters change
  // required the obsolete method name 'book-skill', which made a valid book-grounded session
  // appear as ✕ and also forced SK/SP cross-check to ✕.
  const bookSessionGrounded=Boolean(bt&&btGround.weekRange&&dskpCheck.ok&&shownSpCodes.length&&validSpCode(mainCode)&&picked.method==='book-activity-role-match'&&exactBookTaskLines(bt?.content||'',1).length);
  const sessionExact=!unitAmbiguous&&!sourceFamilyMissing&&Boolean(exactRptSession||structured||pageRefs.length||sessionPick.exact||bookSessionGrounded);
  const sessionBasis=sourceFamilyMissing?'required-source-missing':unitAmbiguous?'rpt-unit-ambiguous':exactRptSession?'stable-session-id':structured?'rpt-structured':pageRefs.length?'rpt-page-ref':sessionPick.exact?sessionPick.method:bookSessionGrounded?'book-week-activity-grounded':'unresolved';
  const sessionAmbiguous=!sessionExact||!shownSpCodes.length||unitAmbiguous||sourceFamilyMissing;
  const spCrosscheck=!!(dskpCheck.ok&&shownSpCodes.length);const weekExact=!!(exactRptSession||structured||rptTop?.ctx);
  const sourceActs=sourceActivityBundle(bt,ba,structured,sessionContext,f.subject_id,{exactRptSession,codes:shownSpCodes,title,hasActivityBook});
  const matchingDocs=smartSourceDocs(f.subject_id,f.year,f.academic_year);const lowDskp=matchingDocs.find(d=>d.source_type==='dskp'&&isLowTextPdf(d));const lowBt=matchingDocs.find(d=>d.source_type==='textbook'&&isLowTextPdf(d));const lowBa=hasActivityBook?matchingDocs.find(d=>d.source_type==='activity_book'&&isLowTextPdf(d)):null;
  const baseRptDiagnostic=sessionAmbiguous?`Minggu ${f.week_no} dijumpai tetapi sesi belum mempunyai bukti yang cukup. Sistem tidak akan menganggap semua SK/SP dalam blok RPT sebagai satu sesi.`:(!codes.spCodes.length?`Minggu ${f.week_no} dijumpai, tetapi kod Standard Pembelajaran belum ditemui dalam konteks sesi.`:'');
  const familyDiagnostic=sourceFamilyMissing?`RPT menetapkan sumber ${sourceFamily?.label||sourceFamily?.id}, tetapi fail sumber itu belum diupload untuk English Tahun ${f.year}. Sistem sengaja TIDAK menggunakan buku lain sebagai ganti.`:(sourceFamily?.noBook?'RPT menandakan Orientation Week; halaman buku tidak akan dipaksa.':'');
  const unitDiagnostic=unitAmbiguous?`Minggu ${f.week_no} muncul di lebih daripada satu blok unit/topik dalam RPT (${distinctUnitNos.map(n=>'Unit '+n).join(' / ')}). Pilih/semak blok yang betul sebelum Lesson Map disahkan.`:'';
  const rptDiagnostic=[baseRptDiagnostic,familyDiagnostic,unitDiagnostic].filter(Boolean).join(' ');
  const mappingNote=bt?`${pageDisplay(bt)} • ${bt._pageMethod||bt.page_mapping_method||'page-map'}${bt._pageVerified?' • exact':' • candidate'}${bt.page_mapping_confidence?` ${bt.page_mapping_confidence}%`:''}`:'';const weekGroundNote=btGround.weekRange?` • julat calon minggu ${btGround.weekRange.start}–${btGround.weekRange.end} • urutan ${weekGroup.position}/${weekGroup.count} • sesi ${f.session_no}`:'';
  const rptEvidenceText=exactRptSession?[exactRptSession.id,exactRptSession.title,`SP ${exactRptSession.spCodes.join(', ')}`,exactRptSession.activity,exactRptSession.bt?.raw].filter(Boolean).join('\n'):(compactRptEvidence(rptContext,f.week_no,unitInfo,shownSpCodes)||sessionContext);
  const progressionStage=lessonStageFromPageRoute(bt,btGround.unitRange,weekGroup,f.session_no);const uiEnglish=lessonLanguage(f.subject_id)==='en';const baPage=ba?.printed_page||ba?.page_no||null;const activityBookRef=baPage?(uiEnglish?String(baPage):`m/s ${baPage}`):'';
  const evidence={rpt:rptContext?{text:rptEvidenceText,ref:(structured?.source_ref||sourceRef(rptTop?.doc,'Minggu '+f.week_no))+` • Sesi ${f.session_no} • ${sessionBasis}${exactRptSession?.bt?.pages?.length?` • LOCK ${exactRptSession.bt.volume?'BT'+exactRptSession.bt.volume:'BT'}:${exactRptSession.bt.pages.join('-')}`:''}`}:null,dskp:dskpCheck.matches.length?{text:dskpCheck.text,ref:`${dskpCheck.ref}${dskpCheck.ref?' • ':''}padan ${dskpCheck.matches.length}/${dskpCheck.wanted.length} kod`}:null,textbook:bt?{text:bt.content,ref:sourceRef(bt.doc,`${mappingNote} • skor ${bt.match}${weekGroundNote}`)}:null,activity_book:ba?{text:ba.content,ref:sourceRef(ba.doc,`${pageDisplay(ba)} • skor ${ba.match}`)}:null,meta:{session_exact:sessionExact,session_method:sessionBasis,session_inferred:sessionBasis==='book-week-activity-grounded'||sessionBasis==='standard-domain',unit_number:unitInfo.number,unit_topic:unitInfo.topic,week_group:weekGroup.weeks,week_group_position:weekGroup.position,week_group_count:weekGroup.count,progression_stage:progressionStage,progression_method:weekGroup.grouped?'unit-week-position':'session-fallback',dskp_codes_matched:dskpCheck.matches.map(x=>x.code),dskp_codes_missing:dskpCheck.missing,textbook_pdf_page:bt?.page_no||null,textbook_printed_page:bt?.printed_page||null,textbook_page_offset:bt?.page_offset??null,textbook_mapping_method:bt?.page_mapping_method||null,textbook_mapping_confidence:bt?.page_mapping_confidence||0,page_route_method:bt?._pageMethod||null,page_route_verified:Boolean(bt?._pageVerified),page_route_score:Number(bt?._routeScore||0),page_candidate_range:btGround.weekRange||null,unit_range:btGround.unitRange||null,week_page_range:btGround.weekRange||null,main_sp:mainCode,complementary_sp:complementaryCodes,complementary_evidence:complementaryEvidence,standard_role_method:exactRptSession?'rpt-stable-session':picked.method,standard_role_note:exactRptSession?'SP utama diambil terus daripada sesi RPT murni; DSKP dan Buku Teks digunakan untuk mengesahkan, bukan menggantikan SP RPT.':'Jika RPT tidak menandakan Main/Complementary secara eksplisit, peranan ini ialah padanan engine berdasarkan aktiviti halaman buku dan perlu disahkan guru.',rpt_activity:exactRptSession?.activity||rptSessionActivityAnchor(structured,sessionContext,f.subject_id,{hasActivityBook}),rpt_title:exactRptSession?.title||title,rpt_sp_codes:exactRptSession?.spCodes||shownSpCodes,rpt_session_authoritative:Boolean(exactRptSession),source_family:sourceFamily?.id||null,source_family_label:sourceFamily?.label||null,source_family_missing:sourceFamilyMissing,unit_ambiguous:unitAmbiguous,unit_candidates:distinctUnitNos,week_group_method:weekGroup.method||null,stable_session_id:exactRptSession?.id||null,rpt_sp_focus:exactRptSession?.spFocus||null,declared_bt_volume:declaredBt.volume||null,declared_bt_pages:declaredBt.pages||[],declared_ba_volume:declaredBa.volume||null,declared_ba_pages:declaredBa.pages||[],activity_book_optional:true,activity_book_uploaded:Boolean(hasActivityBook),week_coverage_enforced:Boolean(weeklyCoverage.enforce),week_expected_sessions:Number(weeklyCoverage.expected||0),week_source_complete_count:Number(weeklyCoverage.completeCount||0),week_unique_activities:Number(weeklyCoverage.uniqueActivities||0),week_source_complete:Boolean(weeklyCoverage.sourceComplete)}};
  const exactBtStart=exactRptSession?.bt?.pages?.length?Number(exactRptSession.bt.pages[0]):null,exactBtEnd=exactRptSession?.bt?.pages?.length?Number(exactRptSession.bt.pages[exactRptSession.bt.pages.length-1]):null;const candidate={...f,title,sk:skFinal,sp:spFinal,main_sp:mainCode,complementary_sp:complementaryCodes.join(', '),objective,success_criteria:successCriteria,complementary_evidence:complementaryEvidence,weeklySourceComplete:!weeklyCoverage.enforce||Boolean(weeklyCoverage.sourceComplete),textbook_page_start:exactBtStart||(bt?.printed_page||bt?.page_no||null),textbook_page_end:exactBtEnd||(bt?.printed_page||bt?.page_no||null),activity_book_ref:activityBookRef,progression_stage:progressionStage,source_activities:sourceActs.join('\n'),weekExact,spCrosscheck,sessionExact,sessionAmbiguous,target_page_refs:pageRefs,printed_page_mapping:{textbook:bt?{pdf_page:bt.page_no,printed_page:bt.printed_page,offset:bt.page_offset,method:bt._pageMethod||bt.page_mapping_method,confidence:bt.page_mapping_confidence,verified:Boolean(bt._pageVerified),route_score:Number(bt._routeScore||0)}:null,activity_book:ba?{pdf_page:ba.page_no,printed_page:ba.printed_page,offset:ba.page_offset,method:ba._pageMethod||ba.page_mapping_method,confidence:ba.page_mapping_confidence,verified:Boolean(ba._pageVerified),route_score:Number(ba._routeScore||0)}:null},diagnostics:{rpt:rptDiagnostic+(weekGroup.grouped?` RPT mengumpulkan Minggu ${weekGroup.weeks.join(', ')} di bawah ${unitInfo.number?'Unit '+unitInfo.number+' ':''}${unitInfo.topic||'unit yang sama'}. Halaman dipilih mengikut urutan Unit → Minggu → Sesi dan kemudian disemak terhadap kandungan/OCR; guru masih perlu mengesahkan Lesson Map.`:''),title:suspiciousTitle(title)?'Tajuk belum dapat dikenal pasti dengan yakin daripada RPT/Buku Teks. Jangan sahkan sehingga tajuk disemak.':'',dskp:!dskpCheck.ok?(lowDskp?`DSKP dijumpai tetapi PDF hampir tiada teks (${textDensity(lowDskp)} aksara/halaman). Jalankan OCR pada Pustaka Sumber.`:(shownSpCodes.length?`DSKP berjaya menyemak ${dskpCheck.matches.length}/${shownSpCodes.length} kod. ${dskpCheck.missing.length?'Belum ditemui: '+dskpCheck.missing.join(', ')+'. ':''}Cross-check kini dibuat merentas semua halaman/chunk DSKP, bukan memaksa semua SP berada pada halaman yang sama.`:`DSKP tidak boleh dicross-check kerana RPT sesi ini belum menghasilkan kod SP yang sah.`)):'',textbook:bt&&!bt._pageVerified?`Muka surat ${bt.printed_page||bt.page_no} ialah CALON struktur untuk ${btGround.weekRange?`julat ${btGround.weekRange.start}–${btGround.weekRange.end}`:'unit ini'} (sesi ${f.session_no}), bukan padanan exact. OCR muka surat calon ini untuk cross-check aktiviti + Learning Standard. Engine v0.3.3.21 tidak lagi menganggap pembahagian minggu secara matematik sebagai bukti halaman.`:bt&&(!String(bt.content||'').trim()||bt.metadata?.virtual)?`Halaman bercetak ${bt.printed_page||bt.page_no} belum mempunyai teks yang boleh dibaca. OCR halaman tepat ini untuk mengesahkan aktiviti.`:(!bt?(sourceFamilyMissing?`RPT memerlukan ${sourceFamily?.label||'sumber buku yang lain'}, tetapi sumber tersebut belum diupload. Buku lain tidak digunakan sebagai pengganti.`:(lowBt?`Buku Teks dijumpai tetapi PDF hampir tiada teks (${textDensity(lowBt)} aksara/halaman). ${btGround.unitRange?`Unit ${unitInfo.number||''} ${unitInfo.topic||''} telah dipetakan kepada m/s ${btGround.unitRange.start}–${btGround.unitRange.end}. `:''}${pageRefs.length?'RPT merujuk m/s '+pageRefs.join(', ')+'. ':''}Jalankan OCR pada halaman unit/sasaran supaya aktiviti sebenar boleh dibaca; engine tidak akan memilih halaman hanya daripada nombor PDF.`:`Buku Teks ada tetapi belum ada halaman dengan padanan kandungan yang cukup kuat. ${pageRefs.length?'RPT merujuk m/s '+pageRefs.join(', ')+'.':''}`)):''),activity_book:hasActivityBook&&!ba&&lowBa?`Buku Aktiviti dijumpai tetapi PDF hampir tiada teks (${textDensity(lowBa)} aksara/halaman). BA opsyenal; OCR hanya jika mahu digunakan.`:'',activities:sourceActs.length?'':(hasActivityBook?'Tiada arahan aktiviti khusus yang berjaya diekstrak daripada Buku Teks/Buku Aktiviti atau RPT.':'Tiada aktiviti sesi yang berjaya dibaca daripada RPT murni atau Buku Teks. Semak RPT sesi dan halaman BT yang dipadankan; BA tidak diperlukan.')},evidence,source_document_ids:[...new Set([rptTop?.doc?.id,...dskpCheck.matches.map(x=>x.chunk?.doc?.id),bt?.doc?.id,ba?.doc?.id].filter(Boolean))]};candidate.confidence_score=calcCandidateConfidence(candidate);if(sessionAmbiguous)candidate.confidence_score=Math.min(candidate.confidence_score,74);if(bt&&Number(bt.page_mapping_confidence||0)<55)candidate.confidence_score=Math.min(candidate.confidence_score,84);if(bt&&!bt._pageVerified)candidate.confidence_score=Math.min(candidate.confidence_score,84);else if(weekGroup.grouped&&!pageRefs.length&&btGround.weekRange)candidate.confidence_score=Math.min(candidate.confidence_score,96);state.lessonCandidate=candidate;fillLessonCandidate(candidate);const aliasNote=[rptTop?.doc,dskpTop?.doc,bt?.doc,ba?.doc].some(d=>d?._autoLinked)?' • sumber alias dipaut automatik':'';toast(`Analisis siap • skor padanan ${candidate.confidence_score}%${aliasNote}${sessionAmbiguous?' • sesi RPT perlu semakan':''}`)
}

function fillLessonCandidate(c){const meta=(c.evidence||c.source_evidence||{}).meta||{},en=lessonLanguage(c?.subject_id||$('#mapSubject')?.value)==='en';$('#mapTitle').value=c.title||'';$('#mapSk').value=c.sk||'';$('#mapSp').value=c.sp||'';$('#mapMainSp').value=c.main_sp||meta.main_sp||String(c.sp||'').split(',')[0]?.trim()||'';$('#mapComplementarySp').value=c.complementary_sp||((meta.complementary_sp||[]).join?meta.complementary_sp.join(', '):meta.complementary_sp)||'';$('#mapObjective').value=c.objective||'';$('#mapCriteria').value=c.success_criteria||'';$('#mapComplementaryEvidence').value=c.complementary_evidence||meta.complementary_evidence||'';updateLessonMapLanguageUI();$('#mapBtStart').value=c.textbook_page_start||'';$('#mapBtEnd').value=c.textbook_page_end||'';$('#mapBaPage').value=en?String(c.activity_book_ref||'').replace(/^m\/s\s*/i,''):c.activity_book_ref||'';$('#mapProgression').value=c.progression_stage||meta.progression_stage||'application';$('#mapActivities').value=c.source_activities||'';const parserNotes=[c.diagnostics?.title,c.diagnostics?.activities].filter(Boolean),E=en?{rpt:'Scheme of Work • week/LS',dskp:'DSKP • standards cross-check',bt:"Student's Book • verified page",ba:'Workbook • reinforcement',review:'⚠ Parser review'}:{rpt:'RPT • minggu/SK/SP',dskp:'DSKP • cross-check standard',bt:'Buku Teks • halaman sebenar',ba:'Buku Aktiviti • pengukuhan',review:'⚠ Semakan parser'};$('#mapEvidence').innerHTML=evidenceCard(E.rpt,c.evidence?.rpt,!!c.evidence?.rpt,c.diagnostics?.rpt||'')+evidenceCard(E.dskp,c.evidence?.dskp,!!c.evidence?.dskp,c.diagnostics?.dskp||'')+evidenceCard(E.bt,c.evidence?.textbook,!!c.evidence?.textbook,c.diagnostics?.textbook||'')+(meta.activity_book_uploaded?evidenceCard(E.ba,c.evidence?.activity_book,!!c.evidence?.activity_book,c.diagnostics?.activity_book||''):'')+(parserNotes.length?`<div class="evidence-card miss"><div><b>${E.review}</b></div><p>${escapeHtml(parserNotes.join(' '))}</p></div>`:'');renderMapGate(c,false)}
function renderMapGate(c,verified){const score=Number(c?.confidence_score||0),cls=score>=90?'good':score>=85?'warn':'bad',ev=c?.evidence||c?.source_evidence||{},meta=ev?.meta||{},en=lessonLanguage(c?.subject_id||$('#mapSubject')?.value)==='en';const weekOk=Boolean(c?.weekExact??c?.week_exact),spOk=Boolean(c?.spCrosscheck??c?.sp_crosscheck),sessionOk=Boolean(c?.sessionExact??meta.session_exact),pageOk=Boolean(meta.page_route_verified||c?.printed_page_mapping?.textbook?.verified),titleOk=!suspiciousTitle(c?.title||''),activityOk=String(c?.source_activities||'').trim().length>12,objOk=isLogicalObjectiveText(c?.objective)&&isLogicalObjectiveText(c?.success_criteria),mainSp=String(c?.main_sp||meta.main_sp||'').trim(),allSp=String(c?.sp||'').split(',').map(x=>x.trim()).filter(Boolean),mainOk=validSpCode(mainSp)&&allSp.includes(mainSp),weeklyEnforced=Boolean(meta.week_coverage_enforced),weeklyOk=!weeklyEnforced||Boolean(c?.weeklySourceComplete??meta.week_source_complete);const ready=score>=85&&weekOk&&sessionOk&&spOk&&Boolean(ev?.textbook)&&pageOk&&titleOk&&objOk&&activityOk&&mainOk&&weeklyOk;const L=en?{week:'RPT week',coverage:'Week coverage',session:'Session grounded',sp:'LS/DSKP cross-check',book:"Student's Book",page:'Exact page',title:'Topic',main:'Main LS',obj:'Measurable Objective/Criteria',act:'Source activities',yes:'Teacher verified',no:'Not verified',verified:'VERIFIED',draft:'DRAFT'}:{week:'Minggu RPT',coverage:'Liputan minggu',session:'Sesi dipadankan',sp:'SK/SP cross-check',book:'Buku Teks',page:'Muka surat tepat',title:'Tajuk',main:'SP Utama',obj:'Objektif/Kriteria boleh ukur',act:'Aktiviti sumber',yes:'Disahkan guru',no:'Belum disahkan',verified:'DISAHKAN',draft:'DRAF'};$('#mapAccuracyGate').innerHTML=`<div class="gate-score ${cls}"><strong>${score}%</strong><span>Source Match</span></div><div class="gate-checks"><span>${weekOk?'✓':'✕'} ${L.week}</span>${weeklyEnforced?`<span>${weeklyOk?'✓':'✕'} ${L.coverage} ${meta.week_source_complete_count||0}/${meta.week_expected_sessions||0}</span>`:''}<span>${sessionOk?'✓':'✕'} ${L.session}</span><span>${spOk?'✓':'✕'} ${L.sp}</span><span>${ev?.textbook?'✓':'✕'} ${L.book}</span><span>${pageOk?'✓':'○'} ${L.page}</span><span>${titleOk?'✓':'✕'} ${L.title}</span><span>${mainOk?'✓':'✕'} ${L.main}</span><span>${objOk?'✓':'✕'} ${L.obj}</span><span>${activityOk?'✓':'✕'} ${L.act}</span><span>${verified?'✓ '+L.yes:'○ '+L.no}</span></div>`;$('#mapStatusPill').textContent=verified?L.verified:L.draft;$('#mapStatusPill').classList.toggle('demo',!verified);const btn=$('#verifyLessonMap');if(btn){btn.disabled=!ready&&!verified;btn.title=ready?(en?'All source-first requirements are complete':'Semua syarat source-first lengkap'):(weeklyEnforced&&!weeklyOk?(en?'Complete every RPT session in this week first':'Lengkapkan SK/SP dan aktiviti setiap sesi RPT minggu ini dahulu'):(en?'Complete the Main LS, Topic, measurable Objective/Criteria and Source Activities before verification':'Lengkapkan SP Utama, Tajuk, Objektif/Kriteria boleh ukur dan Aktiviti sumber sebelum sahkan'))}}

function formLessonPayload(status='draft'){const f=currentMapFilter(),base=state.lessonCandidate||{},mainSp=$('#mapMainSp').value.trim(),compSp=$('#mapComplementarySp').value.split(',').map(x=>x.trim()).filter(Boolean),compEvidence=$('#mapComplementaryEvidence')?.value.trim()||'',sourceActivities=$('#mapActivities').value.trim(),oldMeta=((base.evidence||base.source_evidence||{}).meta||{}),sciencePattern=scienceTaskPattern({subject_id:f.subject_id,title:$('#mapTitle').value.trim(),objective:$('#mapObjective').value.trim(),success_criteria:$('#mapCriteria').value.trim()},sourceActivities.split('\n'));const payload={...f,teacher_id:state.user?.id||'demo',title:$('#mapTitle').value.trim(),sk:$('#mapSk').value.trim(),sp:$('#mapSp').value.trim(),objective:$('#mapObjective').value.trim(),success_criteria:$('#mapCriteria').value.trim(),textbook_page_start:Number($('#mapBtStart').value)||null,textbook_page_end:Number($('#mapBtEnd').value)||null,activity_book_ref:$('#mapBaPage').value.trim(),progression_stage:$('#mapProgression').value,source_activities:sourceActivities,confidence_score:Number(base.confidence_score||0),verification_status:status,verified_at:status==='verified'?new Date().toISOString():null,source_evidence:{...(base.evidence||base.source_evidence||{}),meta:{...oldMeta,session_exact:Boolean(base.sessionExact??oldMeta.session_exact),main_sp:mainSp,complementary_sp:compSp,complementary_evidence:compEvidence,science_task_pattern:sciencePattern||undefined}},source_document_ids:base.source_document_ids||[],week_exact:Boolean(base.weekExact??base.week_exact),sp_crosscheck:Boolean(base.spCrosscheck??base.sp_crosscheck)};return payload}
async function saveLessonMap(status='draft'){if(!requireAuth())return;const p=formLessonPayload(status);if(!p.subject_id||!p.title||!p.sp)return toast('Tajuk dan Standard Pembelajaran perlu lengkap.');const allSp=String(p.sp||'').split(',').map(x=>x.trim()).filter(Boolean),mainSp=String(p.source_evidence?.meta?.main_sp||'').trim(),compSp=p.source_evidence?.meta?.complementary_sp||[];if(status==='verified'&&(!validSpCode(mainSp)||!allSp.includes(mainSp)))return toast('Pilih SP Utama yang sah dan pastikan kod itu terdapat dalam senarai Standard Pembelajaran.',5200);if(status==='verified'&&compSp.some(x=>x===mainSp||!allSp.includes(x)))return toast('SP Sokongan mesti berbeza daripada SP Utama dan mesti berada dalam senarai Standard Pembelajaran.',5200);if(status==='verified'&&p.confidence_score<85)return toast('Skor sumber perlu sekurang-kurangnya 85% untuk disahkan. Lengkapkan RPT/DSKP/Buku Teks dahulu.',5500);if(status==='verified'&&(!p.week_exact||!p.sp_crosscheck||!p.source_evidence?.meta?.session_exact))return toast('Minggu, pemetaan sesi dan SK/SP mesti berjaya dipadankan sebelum Lesson Map disahkan.',5500);if(status==='verified'&&p.source_evidence?.meta?.week_coverage_enforced&&!p.source_evidence?.meta?.week_source_complete)return toast(`Liputan Minggu ${p.week_no} belum lengkap: ${p.source_evidence?.meta?.week_source_complete_count||0}/${p.source_evidence?.meta?.week_expected_sessions||0} sesi mempunyai SK/SP + aktiviti yang sah.`,6500);if(status==='verified'&&(!p.textbook_page_start||!p.source_evidence?.textbook))return toast('Lesson Map accurate memerlukan padanan Buku Teks yang disahkan oleh engine, bukan nombor halaman manual sahaja.',5500);if(status==='verified'&&suspiciousTitle(p.title))return toast('Tajuk belum cukup yakin. Semak tajuk berdasarkan RPT/Buku Teks sebelum sahkan.',5000);if(status==='verified'&&(!isLogicalObjectiveText(p.objective)||!isLogicalObjectiveText(p.success_criteria)))return toast('Objektif dan Kriteria Kejayaan mesti khusus, boleh diukur dan sepadan dengan SP serta tugasan sumber.',6000);if(status==='verified'&&!String(p.source_activities||'').trim())return toast('Aktiviti khusus sumber wajib ada. Sistem tidak akan sahkan Lesson Map generik.',5500);if(state.connected&&state.user){const {error}=await state.client.from('lesson_maps').upsert(p,{onConflict:'teacher_id,subject_id,year,academic_year,week_no,session_no'});if(error)return toast('Simpan Lesson Map gagal: '+error.message);await logAudit(status==='verified'?'VERIFY_LESSON_MAP':'SAVE_LESSON_DRAFT',{subject_id:p.subject_id,year:p.year,week:p.week_no,session:p.session_no,confidence:p.confidence_score});await loadAll()}renderMapGate(p,status==='verified');toast(status==='verified'?'Lesson Map berjaya DISAHKAN.':'Draf Lesson Map disimpan.')}
function renderLessonMaps(){const sub=$('#mapSubject')?.value||state.subjects[0]?.id,year=Number($('#mapYear')?.value||1),ay=Number($('#mapAcademicYear')?.value||new Date().getFullYear());const rows=state.lessonMaps.filter(x=>x.subject_id===sub&&Number(x.year)===year&&Number(x.academic_year)===ay).sort((a,b)=>Number(a.week_no)-Number(b.week_no)||Number(a.session_no)-Number(b.session_no));const el=$('#lessonMapRows');if(!el)return;el.innerHTML=rows.map(x=>`<tr><td>${x.week_no}</td><td>${x.session_no}</td><td><b>${escapeHtml(x.title)}</b><br><small>${escapeHtml(stageLabel(x.progression_stage))}</small></td><td>${escapeHtml(x.sk||'—')}<br><small>${escapeHtml(x.sp||'—')}</small></td><td>BT ${x.textbook_page_start||'—'}${x.textbook_page_end&&x.textbook_page_end!==x.textbook_page_start?'–'+x.textbook_page_end:''}<br><small>${x.source_evidence?.meta?.activity_book_uploaded?escapeHtml(x.activity_book_ref||'BA —'):'BA opsyenal'}</small></td><td>${x.confidence_score||0}%</td><td>${x.verification_status==='verified'?'<span class="status-ok">✓ Disahkan</span>':'<span class="status-warn">Draf</span>'}</td><td><button class="ghost open-map" data-id="${x.id}">Buka</button></td></tr>`).join('')||'<tr><td colspan="8">Belum ada Lesson Map untuk pilihan ini.</td></tr>';$$('.open-map').forEach(b=>b.addEventListener('click',()=>openLessonMap(b.dataset.id)))}
function openLessonMap(id){const x=state.lessonMaps.find(m=>m.id===id);if(!x)return;$('#mapSubject').value=x.subject_id;$('#mapYear').value=x.year;$('#mapAcademicYear').value=x.academic_year;$('#mapWeek').value=x.week_no;$('#mapSession').value=x.session_no;state.lessonCandidate={...x,evidence:x.source_evidence||{},weekExact:Boolean(x.week_exact),spCrosscheck:Boolean(x.sp_crosscheck)};fillLessonCandidate(state.lessonCandidate);renderMapGate(x,x.verification_status==='verified')}
function renderRphLessonOptions(){
  const cls=getClass($('#rphClass')?.value),
        sub=$('#rphSubject')?.value,
        week=Number($('#rphWeek')?.value||1),
        el=$('#rphLessonMap'),
        timetableRoute=timetableLessonRoute(cls?.id,sub,$('#rphDate')?.value),
        route=isAdmin()?{available:false,session_no:null,total:timetableRoute.total,entry:null}:timetableRoute;

  if(!el)return;

  const ay=Number(
    cls?.academic_year||
    String($('#rphDate')?.value||today).slice(0,4)||
    new Date().getFullYear()
  );

  const maps=state.lessonMaps
    .filter(x=>
      x.subject_id===sub &&
      Number(x.year)===Number(cls?.year) &&
      Number(x.academic_year)===ay &&
      Number(x.week_no)===week
    )
    .sort((a,b)=>Number(a.session_no)-Number(b.session_no));

  if(!maps.length){
    el.innerHTML=
      '<option value="">Auto ikut jadual guru + sesi RPT</option>'+
      `<option value="" disabled>${route.available&&route.session_no?`Tiada Lesson Map Sesi ${route.session_no}/${route.total} untuk jadual ini`:'Tiada Lesson Map untuk Tahun/Subjek/Minggu ini'}</option>`;
    return;
  }

  el.innerHTML=
    '<option value="">Auto ikut jadual guru + sesi RPT</option>'+
    maps.map(x=>{
      const verified=x.verification_status==='verified';
      const scheduled=route.available&&route.session_no;
      const matchesSchedule=!scheduled||Number(x.session_no)===Number(route.session_no);
      const status=verified?'✓ Disahkan':'○ Belum disahkan';
      return `<option value="${x.id}" ${verified&&matchesSchedule?'':'disabled'}>
        Sesi ${x.session_no}${scheduled&&matchesSchedule?' • ikut jadual':''} • ${escapeHtml(x.title||'Tanpa tajuk')} • ${status}
      </option>`;
    }).join('');

  // A timetable route is authoritative. Do not leave an old/manual lesson-map
  // selection active when it belongs to another weekly session.
  if(route.available&&route.session_no){
    const exact=maps.find(x=>Number(x.session_no)===Number(route.session_no)&&x.verification_status==='verified');
    el.value=exact?.id||'';
  }
}
function syncSelectedRphSchedule(){
  const date=$('#rphDate')?.value;
  const classId=$('#rphClass')?.value;
  const subjectId=$('#rphSubject')?.value;
  const el=$('#rphSchedule');
  const timeEl=$('#rphTime');

  if(!date||!el)return null;

  const sessions=teacherTimetableSessionsForDate(date);
  const hit=sessions.find(x=>
    x.class_id===classId &&
    x.subject_id===subjectId
  );

  if(hit){
    el.value=hit.id;
    if(timeEl)timeEl.value=scheduleTimeLabel(hit);
    return hit;
  }

  el.value='';
  if(timeEl)timeEl.value='';
  return null;
}
function timetableWeeklySessions(classId,subjectId,date){
  if(!classId||!subjectId||!date)return[];
  const ay=Number(String(date).slice(0,4));
  return state.timetable.filter(x=>
    x.class_id===classId&&x.subject_id===subjectId&&
    (!state.user||!x.teacher_id||x.teacher_id===state.user.id)&&
    (!x.academic_year||Number(x.academic_year)===ay)
  ).sort((a,b)=>Number(a.day_of_week)-Number(b.day_of_week)||String(a.start_time||'99:99').localeCompare(String(b.start_time||'99:99')))
}
function selectedRphSchedule(){
  const id=$('#rphSchedule')?.value;
  if(id)return state.timetable.find(x=>x.id===id)||null;
  const date=$('#rphDate')?.value,classId=$('#rphClass')?.value,subjectId=$('#rphSubject')?.value;
  const matches=teacherTimetableSessionsForDate(date).filter(x=>x.class_id===classId&&x.subject_id===subjectId);
  return matches.length===1?matches[0]:null;
}
function timetableLessonRoute(classId,subjectId,date){
  const weekly=timetableWeeklySessions(classId,subjectId,date);
  if(!weekly.length)return {available:false,session_no:null,total:0,entry:null};
  const day=date?(new Date(date+'T00:00:00').getDay()||7):null;
  const selected=selectedRphSchedule();
  let entry=selected&&selected.class_id===classId&&selected.subject_id===subjectId?selected:null;
  if(!entry){
    const sameDay=weekly.filter(x=>Number(x.day_of_week)===day);
    // A same-subject double period needs an explicit timetable selection; never guess.
    if(sameDay.length===1)entry=sameDay[0];
  }
  const index=entry?weekly.findIndex(x=>x.id===entry.id):-1;
  return {available:true,session_no:index>=0?index+1:null,total:weekly.length,entry:entry||null};
}
function timetableLessonOrdinal(classId,subjectId,date){return timetableLessonRoute(classId,subjectId,date).session_no}
function selectVerifiedLessonMap(classId,subjectId,week,date){
  const cls=getClass(classId),chosen=$('#rphLessonMap')?.value;
  const ay=Number(cls?.academic_year||String(date||today).slice(0,4)||new Date().getFullYear());
  const maps=state.lessonMaps.filter(x=>x.subject_id===subjectId&&Number(x.year)===Number(cls?.year)&&Number(x.academic_year)===ay&&Number(x.week_no)===Number(week)&&x.verification_status==='verified').sort((a,b)=>Number(a.session_no)-Number(b.session_no));
  if(!maps.length)return null;
  const route=timetableLessonRoute(classId,subjectId,date);
  if(!isAdmin()&&route.available){
    // A timetable exists: a RPH must use its exact ordinal RPT session.
    if(!route.session_no)return null;
    const exact=maps.find(x=>Number(x.session_no)===Number(route.session_no))||null;
    if(!exact)return null;
    if(chosen&&chosen!==exact.id)return null;
    return exact;
  }
  if(chosen)return maps.find(x=>x.id===chosen)||null;
  const day=date?((new Date(date+'T00:00:00').getDay()||7)):null;
  const dayHit=maps.find(x=>Number(x.day_of_week)===day);
  return dayHit||maps[0]
}
function savedLessonEvidencePage(map,key='textbook'){
  const evidence=map?.source_evidence?.[key],meta=map?.source_evidence?.meta||{};
  if(!String(evidence?.text||'').trim())return null;
  const textbook=key==='textbook',pdfPage=Number(textbook?meta.textbook_pdf_page:0)||Number(map?.textbook_page_start||1),printedPage=Number(textbook?meta.textbook_printed_page:0)||Number(map?.textbook_page_start||pdfPage);
  return {document_id:null,page_no:pdfPage,printed_page:printedPage,content:String(evidence.text),metadata:{kind:'lesson-map-snapshot'},doc:{file_name:textbook?'Bukti Buku Teks dalam Lesson Map':'Bukti Buku Aktiviti dalam Lesson Map'},_fromLessonMap:true};
}
async function lessonPageEvidence(map){
  const hasBA=optionalActivityBookAvailable(map.subject_id,map.year,map.academic_year),meta=map.source_evidence?.meta||{},pdfPage=Number(meta.textbook_pdf_page||0),printedPage=Number(meta.textbook_printed_page||0);let btPages=[];
  try{btPages=await withTimeout(getPagesForSubject(map.subject_id,map.year,['textbook'],map.academic_year,pdfPage?[pdfPage]:null),12000,'Bacaan halaman Buku Teks')}catch(error){clearSourceReadCache();const saved=savedLessonEvidencePage(map,'textbook');if(!saved)throw error;console.warn('Menggunakan bukti Buku Teks tersimpan selepas bacaan langsung gagal:',error);btPages=[saved]}
  if(!btPages.length){const saved=savedLessonEvidencePage(map,'textbook');if(saved)btPages=[saved]}
  // Verified maps persist the PDF-to-printed-page link. Reapply it after a
  // one-page read because offset inference needs multiple pages to vote.
  const mappedBt=pdfPage&&printedPage?btPages.map(p=>Number(p.page_no)===pdfPage?{...p,printed_page:printedPage,page_mapping_confidence:100,page_mapping_method:'lesson-map-evidence'}:p):btPages;
  const bt=mappedBt.filter(p=>Number(p.printed_page||p.page_no)>=Number(map.textbook_page_start||0)&&Number(p.printed_page||p.page_no)<=Number(map.textbook_page_end||map.textbook_page_start||0));
  let ba=[];if(hasBA){const nums=String(map.activity_book_ref||'').match(/\d+/g)?.map(Number)||[];if(nums.length){const a=nums[0],b=nums[1]||a;let baPages=[];try{baPages=await withTimeout(getPagesForSubject(map.subject_id,map.year,['activity_book'],map.academic_year),8000,'Bacaan halaman Buku Aktiviti')}catch(error){clearSourceReadCache();const saved=savedLessonEvidencePage(map,'activity_book');if(saved)baPages=[saved];console.warn('Buku Aktiviti opsyenal tidak dapat dibaca secara langsung:',error)}ba=baPages.filter(p=>Number(p.printed_page||p.page_no)>=a&&Number(p.printed_page||p.page_no)<=b)}}return {bt,ba,hasBA}}
function rphStandardDetailFromSources(map,code=''){
  const wanted=String(code||'').trim();if(!wanted)return null;
  const row=state.standards.find(x=>x.subject_id===map.subject_id&&Number(x.year)===Number(map.year)&&String(x.code)===wanted);
  const dskpText=String(map.source_evidence?.dskp?.text||'');
  const evidenceDetail=standardDetails(dskpText).find(x=>x.code===wanted);
  return {code:wanted,description:row?.description||evidenceDetail?.description||''};
}
function sourceActivityActionClause(activity='',uiEn=false){
  let s=cleanSourceActivityPhrase(activity).replace(/^(?:RPT\s*\+\s*)?(?:BT|Buku\s*Teks|Student['’]?s\s+Book|BA|Buku\s*Aktiviti|Workbook)\s*(?:(?:m\/?s|ms|p\.?|page|halaman)\s*)?\d{1,3}(?:\s*[-–—]\s*\d{1,3})?\s*:\s*/i,'').trim();
  if(!s||isTruncatedSourceActivity(s)||isThinSourceActivity(s))return '';
  const sentences=s.split(/(?<=[.!?])\s+/).map(x=>x.trim()).filter(Boolean);
  s=sentences.slice(0,2).join(' ').replace(/[.!?]+$/,'').trim();
  if(uiEn)return s.replace(/^Pupils?\s+/i,'').replace(/^Students?\s+/i,'').replace(/^to\s+/i,'').trim();
  return s.replace(/^Murid\s+/i,'').replace(/^Pelajar\s+/i,'').replace(/^untuk\s+/i,'').trim();
}
function measurablePairFromSourceActivities(map,built){
  const uiEn=lessonLanguage(map.subject_id)==='en',page=Number(map.textbook_page_start||0)||null,count=objectiveTargetCount(map.year,false);
  const source=(built?.activities||[]).filter(x=>/\bBT\b|Buku\s*Teks|Student['’]?s\s+Book/i.test(String(x||''))&&!isGenericBookReference(x)).map(x=>({raw:x,action:sourceActivityActionClause(x,uiEn)})).find(x=>x.action);
  const action=source?.action||'';if(!action)return {objective:'',successCriteria:''};
  if(uiEn){
    const lower=action.charAt(0).toLowerCase()+action.slice(1),ref=page?` on Student's Book p. ${page}`:'';
    return {
      objective:`By the end of the lesson, pupils will be able to ${lower}, then record at least ${count} accurate observations or responses${ref}.`,
      successCriteria:`Success is achieved when pupils ${lower} and produce at least ${count} accurate observations or responses supported by details${ref}.`
    };
  }
  const lower=action.charAt(0).toLowerCase()+action.slice(1),ref=page?` pada Buku Teks m/s ${page}`:'';
  return {
    objective:`Pada akhir PdP, murid dapat ${lower}, kemudian merekod sekurang-kurangnya ${count} pemerhatian atau respons yang tepat${ref}.`,
    successCriteria:`Kriteria kejayaan dicapai apabila murid ${lower} serta menghasilkan sekurang-kurangnya ${count} pemerhatian atau respons yang tepat berdasarkan bukti${ref}.`
  };
}
function effectiveRphLessonMap(map,ev,built){
  const mainCode=String(map.source_evidence?.meta?.main_sp||String(map.sp||'').split(',')[0]||'').trim();
  const complementaryCodes=Array.isArray(map.source_evidence?.meta?.complementary_sp)?map.source_evidence.meta.complementary_sp:[];
  const mainDetail=rphStandardDetailFromSources(map,mainCode),complementaryDetails=complementaryCodes.map(code=>rphStandardDetailFromSources(map,code)).filter(Boolean);
  const bookText=(ev.bt||[]).map(p=>p.content||'').join('\n');
  const page=map.textbook_page_start||null;
  const sourcePair=measurablePairFromSourceActivities(map,built);
  const rebuiltObjective=measurableObjective(mainDetail,bookText,page,map.subject_id,map.year);
  const rebuiltCriteria=measurableCriteria(mainDetail,complementaryDetails,bookText,page,map.subject_id,map.year);
  const objective=isLogicalObjectiveText(map.objective)?map.objective:(isLogicalObjectiveText(rebuiltObjective)?rebuiltObjective:sourcePair.objective);
  const successCriteria=isLogicalObjectiveText(map.success_criteria)?map.success_criteria:(isLogicalObjectiveText(rebuiltCriteria)?rebuiltCriteria:sourcePair.successCriteria);
  const recoveredActivities=(built.activities||[]).join('\n');
  return {...map,objective:objective||map.objective,success_criteria:successCriteria||map.success_criteria,source_activities:recoveredActivities||map.source_activities,_runtime_source_repaired:Boolean(recoveredActivities&&recoveredActivities!==String(map.source_activities||'')),_runtime_objective_repaired:objective!==map.objective||successCriteria!==map.success_criteria};
}
function siblingWeekActivityLines(map){return state.lessonMaps.filter(x=>x.subject_id===map.subject_id&&Number(x.year)===Number(map.year)&&Number(x.academic_year)===Number(map.academic_year)&&Number(x.week_no)===Number(map.week_no)&&Number(x.session_no)!==Number(map.session_no)&&x.verification_status==='verified').flatMap(x=>String(x.source_activities||'').split('\n')).map(cleanSourceActivityPhrase).filter(Boolean)}
function buildSourceActivities(map,ev,classId){
  const uiEn=lessonLanguage(map.subject_id)==='en',title=cleanLessonTitle(map.title||''),mapActs=String(map.source_activities||'').split('\n').map(cleanSourceActivityPhrase).filter(Boolean),chosen=[];
  const isTextbookTask=s=>(/\bBT\b|Buku\s*Teks|Student['’]s Book/i.test(String(s||'')))&&!isTruncatedSourceActivity(s)&&!isThinSourceActivity(s)&&!isGenericBookReference(s);
  // Source tasks must survive even when a neighbouring session uses the same book routine.
  // Anti-repeat belongs to Activity Library / induction wrapping, never to the source task itself.
  const add=s=>{s=cleanSourceActivityPhrase(s);if(!s||isTruncatedSourceActivity(s)){if(s)console.warn('RPH SOURCE TASK REJECTED: incomplete OCR',s);return}const same=chosen.some(x=>jaccard(s,x)>=0.88);if(same)return;chosen.push(s)};
  // Lesson Map activities already contain the RPT-session anchor plus textbook enrichment. Keep that order.
  // v0.3.3.36: When no BA uploaded, strip BA/Workbook entries from saved Lesson Map activities.
  const filteredActs=ev.hasBA?mapActs:mapActs.filter(s=>!/^(?:BA\b|Workbook\b|Buku\s*Aktiviti\b)/i.test(s));
  filteredActs.forEach(add);
  // Recover an instruction from the exact book page when an older map has
  // only a page reference or a generator placeholder.  A real instruction
  // always outranks a generic reference in the RPH source-task panel.
  const hasUsableTextbookTask=chosen.some(isTextbookTask);
  if(!hasUsableTextbookTask){for(const p of ev.bt||[]){const pg=p.printed_page||p.page_no;for(const task of rankedBookTasksForRpt(p,map.source_evidence?.meta?.rpt_activity||mapActs[0]||'',String(map.sp||'').split(',').map(x=>x.trim()).filter(Boolean),title,map.subject_id,3)){const t=studentizeSourceTask(task,uiEn);if(t)add(`${uiEn?"Student's Book":'BT'} ${uiEn?'p.':'m/s'} ${pg}: ${t}`)}}}
  if(ev.hasBA&&!mapActs.some(x=>/^BA\b|^Workbook\b/i.test(x))){for(const p of ev.ba||[]){const pg=p.printed_page||p.page_no;for(const task of rankedBookTasksForRpt(p,map.source_evidence?.meta?.rpt_activity||'',String(map.sp||'').split(',').map(x=>x.trim()).filter(Boolean),title,map.subject_id,2)){const t=studentizeSourceTask(task,uiEn);if(t)add(`${uiEn?'Workbook':'BA'} ${uiEn?'p.':'m/s'} ${pg}: ${t}`)}}}
  // v0.3.3.38: Fallback — if no activities found from BT/BA, try RPT-sourced activities from the Lesson Map
  if(!chosen.length){const rptActs=String(map.source_evidence?.meta?.rpt_activity||'').split(/[|;\n]/).map(cleanSourceActivityPhrase).filter(Boolean);rptActs.forEach(add)}
  const usableTextbook=chosen.filter(isTextbookTask);
  const ordered=usableTextbook.length?[...usableTextbook,...chosen.filter(x=>!usableTextbook.includes(x)&&!(/\bBT\b|Student['’]s Book/i.test(x)&&isGenericBookReference(x)))]:chosen;
  const detectedExactTextbookCount=ordered.filter(isTextbookTask).length;
  const verifiedVisualTask=Boolean(
    (ev.bt||[]).length&&rphVerifiedVisualContext(
      map,
      mapActs.join(' ')||ordered.join(' '),
      `${uiEn?'p.':'m/s'} ${map.textbook_page_start||''}`,
      uiEn
    )
  );
  const exactTextbookCount=detectedExactTextbookCount||(verifiedVisualTask?1:0);
  return {activities:ordered.slice(0,6),similarity:ordered.reduce((m,s)=>Math.max(m,maxActivitySimilarity(s,map.subject_id,classId)),0),exactTextbookCount,usedActivityBook:ordered.some(x=>/^BA\b|^Workbook\b/i.test(x))}
}
function validateRphMap(map,ev,acts){const hasBtActivities=Number(acts.exactTextbookCount||0)>=1;const hasBtPages=Array.isArray(ev.bt)&&ev.bt.length>0;const checks=[{n:'Lesson Map disahkan',ok:map.verification_status==='verified'},{n:'Source Match ≥ 85%',ok:Number(map.confidence_score)>=85},{n:'Buku Teks berhalaman',ok:!!map.textbook_page_start&&hasBtPages},{n:'Tugasan Buku Teks sebenar dikesan',ok:hasBtActivities},{n:'Minggu & SK/SP cross-check',ok:Boolean(map.week_exact)&&Boolean(map.sp_crosscheck)},{n:'SK/SP tersedia',ok:!!map.sk&&!!map.sp},{n:'SP Utama ditetapkan',ok:!!(map.source_evidence?.meta?.main_sp)},{n:'Objektif & kriteria khusus dan boleh ukur',ok:isLogicalObjectiveText(map.objective)&&isLogicalObjectiveText(map.success_criteria)},{n:'Aktiviti khusus sumber',ok:acts.activities.length>=1},{n:'Anti-repeat membungkus, bukan mengganti sumber',ok:true}];if(ev.hasBA)checks.push({n:'Buku Aktiviti opsyenal',ok:true});const score=Math.round(checks.filter(x=>x.ok).length/checks.length*100);return {checks,score}}
function renderRphGate(v){const el=$('#rphAccuracyGate');if(!el)return;if(!v){el.innerHTML='<b>Accuracy Gate:</b> pilih kelas/subjek/minggu. RPH hanya boleh dijana daripada Lesson Map yang disahkan.';return}const cls=v.score>=90?'good':v.score>=75?'warn':'bad';el.innerHTML=`<div class="gate-score ${cls}"><strong>${v.score}%</strong><span>Validation</span></div><div class="gate-checks">${v.checks.map(x=>`<span>${x.ok?'✓':'✕'} ${escapeHtml(x.n)}</span>`).join('')}</div>`}

function scoreChunk(chunk,week,focus=''){const text=chunk.content.toLowerCase();let score=0;const type=chunk.doc?.source_type;if(type==='rpt')score+=3;if(type==='dskp')score+=2;if(type==='textbook'||type==='activity_book'||type==='rph_example')score+=1;[`minggu ${week}`,`minggu ke-${week}`,`week ${week}`].forEach(q=>{if(text.includes(q))score+=10});if(focus){focus.toLowerCase().split(/\s+/).filter(x=>x.length>2).forEach(t=>{if(text.includes(t))score+=2})}return score}
function snippet(text,max=900){const t=normalizeText(text);return t.length>max?t.slice(0,max)+'…':t}
function extractCodes(text){return [...new Set((text.match(/\b\d{1,2}\.\d{1,2}\.\d{1,2}\b/g)||[]))].slice(0,8)}
function findActivityText(text){const lines=normalizeText(text).split('\n').map(x=>x.trim()).filter(Boolean);const hits=lines.filter(l=>/aktiviti|cadangan|murid|permainan|latihan|simulasi|perbincangan|lembaran|buku aktiviti/i.test(l)&&l.length>20);return hits.slice(0,5).join('\n')}


function safeFileName(v=''){return String(v||'RPH').replace(/[\\/:*?"<>|]+/g,'-').replace(/\s+/g,'_').replace(/_+/g,'_').replace(/^_+|_+$/g,'').slice(0,120)||'RPH'}
function xmlEscape(v=''){return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;')}
function reflectionLabels(uiEn){return uiEn?{title:'Post-lesson Reflection',total:'Total pupils',present:'Present',achieved:'Achieved objective',active:'Completed activities / active',note:'Intervention / notes',generate:'Generate Reflection',placeholder:'Optional follow-up or intervention notes',empty:'Enter the post-lesson numbers first.',save:'Save to Database',word:'Download Word (.docx)',drive:'Upload to Google Drive',print:'Print RPH'}:{title:'Refleksi Selepas PdP',total:'Jumlah murid',present:'Hadir',achieved:'Mencapai objektif',active:'Lengkap aktiviti / aktif',note:'Intervensi / catatan',generate:'Jana Refleksi',placeholder:'Catatan tindakan susulan atau intervensi (opsyenal)',empty:'Masukkan bilangan selepas PdP dahulu.',save:'Simpan ke Database',word:'Download Word (.docx)',drive:'Upload ke Google Drive',print:'Print RPH'}}
function currentReflectionData(){const c=state.currentGeneratedRph||{};const num=id=>{const el=$(id);return el&&el.value!==''?Number(el.value):null};return {total:num('#rphRefTotal'),present:num('#rphRefPresent'),achieved:num('#rphRefAchieved'),active:num('#rphRefActive'),note:($('#rphRefNote')?.value||'').trim(),text:($('#rphReflectionText')?.value||'').trim(),language:c.uiEn?'en':'ms'}}
function generateReflectionText(){const c=state.currentGeneratedRph;if(!c)return '';const uiEn=!!c.uiEn,d=currentReflectionData();if(d.total===null||d.present===null||d.achieved===null||d.active===null){toast(uiEn?'Enter all reflection numbers first.':'Masukkan semua bilangan refleksi dahulu.');return ''}const absent=Math.max(0,d.total-d.present),need=Math.max(0,d.present-d.achieved);let text;if(uiEn){text=`${d.achieved} of ${d.present} pupils present achieved the learning objective. ${d.active} pupils completed the planned activities / participated actively.`;if(need>0)text+=` ${need} pupils require further support or reinforcement.`;if(absent>0)text+=` ${absent} pupils were absent.`;if(d.note)text+=` Follow-up / intervention: ${d.note}.`}else{text=`${d.achieved} daripada ${d.present} murid yang hadir mencapai objektif pembelajaran. ${d.active} murid melengkapkan aktiviti yang dirancang / terlibat aktif.`;if(need>0)text+=` ${need} murid memerlukan bimbingan atau pengukuhan lanjut.`;if(absent>0)text+=` ${absent} murid tidak hadir.`;if(d.note)text+=` Tindakan susulan / intervensi: ${d.note}.`}const out=$('#rphReflectionText');if(out)out.value=text;const view=$('#rphReflectionView');if(view){view.textContent=text;view.classList.remove('hidden')}return text}
function rphPushExportGroup(lines,label,steps,fallback,uiEn){
  lines.push(label);

  if(steps?.length){
    steps.forEach((x,i)=>{
      lines.push(`${uiEn?'Step':'Langkah'} ${i+1} — ${x.name||''}`);
      lines.push(`  ${x.text||''}`);
      if(x.bbm)lines.push(`  ${uiEn?'Teaching Aids':'BBM/ABM'}: ${x.bbm}`);
      if(x.pak21)lines.push(`  ${uiEn?'21st Century Learning':'PAK-21'}: ${x.pak21}`);
    });
  }else{
    lines.push(`  ${fallback||''}`);
  }

  lines.push('');
}

function buildRphExportLines(ctx){const {map,classId,subjectId,date,week,activities}=ctx,cls=getClass(classId),sub=getSubject(subjectId),uiEn=!!ctx.uiEn,ped=ctx.pedagogy||buildSourceAwarePedagogy(map,activities,ctx.btRef,uiEn,classId);const refl=currentReflectionData(),comp=(map.source_evidence?.meta?.complementary_sp||[]),lines=[];lines.push(uiEn?'DAILY LESSON PLAN':'RANCANGAN PENGAJARAN HARIAN');lines.push(`${uiEn?'Teacher':'Guru'}: ${ctx.teacherName||state.profile?.full_name||state.user?.email||''}`);lines.push(`${uiEn?'Subject':'Subjek'}: ${sub?.name||''}`);lines.push(`${uiEn?'Class':'Kelas'}: ${cls?.name||''}`);lines.push(`${uiEn?'Year':'Tahun'}: ${cls?.year||''}`);lines.push(`${uiEn?'Date':'Tarikh'}: ${date}`);lines.push(`${uiEn?'Teaching time':'Masa Mengajar'}: ${ctx.lessonTime||'—'}`);lines.push(`${uiEn?'Week':'Minggu'}: ${week}`);lines.push(`${uiEn?'Lesson':'Sesi'}: ${map.session_no||1}`);lines.push('');lines.push(`${uiEn?'Topic':'Tajuk'}: ${map.title||''}`);lines.push(`${uiEn?'Content Standard':'Standard Kandungan'}: ${map.sk||''}`);lines.push(`${uiEn?'Main Learning Standard':'SP Utama'}: ${map.source_evidence?.meta?.main_sp||String(map.sp||'').split(',')[0]||''}`);lines.push(`${uiEn?'Complementary Learning Standard(s)':'SP Sokongan'}: ${Array.isArray(comp)?comp.join(', '):comp||''}`);lines.push(`${uiEn?'All Learning Standards':'Semua Standard Pembelajaran'}: ${map.sp||''}`);lines.push(`${uiEn?'Learning Objective':'Objektif'}: ${map.objective||''}`);lines.push(`${uiEn?'Success Criteria':'Kriteria Kejayaan'}: ${map.success_criteria||''}`);lines.push(`${uiEn?"Student's Book":'Buku Teks'}: ${ctx.btRef||''}`);if(map.source_evidence?.meta?.activity_book_uploaded)lines.push(`${uiEn?'Workbook':'Buku Aktiviti'}: ${map.activity_book_ref||'—'}`);lines.push('');lines.push(uiEn?'SET INDUCTION':'SET INDUKSI');

if(ped.inductionData){
  lines.push(ped.inductionData.name||'');
  lines.push(ped.inductionData.text||ped.setInduksi);
  if(ped.inductionData.bbm)
    lines.push(`${uiEn?'Teaching Aids':'BBM/ABM'}: ${ped.inductionData.bbm}`);
  if(ped.inductionData.pak21)
    lines.push(`${uiEn?'21st Century Learning':'PAK-21'}: ${ped.inductionData.pak21}`);
}else{
  lines.push(ped.setInduksi);
}
lines.push('');
lines.push(uiEn?'LEARNING ACTIVITIES':'AKTIVITI PDP');
if(ped.sourceSteps?.length){
  lines.push(uiEn?'SOURCE ACTIVITIES FROM THE BOOK':'AKTIVITI SUMBER DARIPADA BUKU');
  ped.sourceSteps.forEach((step,i)=>{
    lines.push(`${uiEn?'Source activity':'Aktiviti sumber'} ${i+1} — ${step.name||''}`);
    lines.push(`  ${step.text||''}`);
    if(step.bbm)lines.push(`  ${uiEn?'Book reference':'Rujukan buku'}: ${step.bbm}`);
  });
}else{
  lines.push(`${uiEn?'Source Task':'Tugasan Asas Sumber'}: ${ped.anchor}`);
}
lines.push('');lines.push(uiEn?'DIFFERENTIATED LEARNING (3 GROUPS)':'PDP TERBEZA (3 KUMPULAN)');

rphPushExportGroup(
  lines,
  uiEn?'EXPLORER GROUP':'KELOMPOK PENEROKA',
  ped.librarySteps?.support,
  ped.diffSupportAct,
  uiEn
);

rphPushExportGroup(
  lines,
  uiEn?'BUILDER GROUP':'KELOMPOK PEMBINA',
  ped.librarySteps?.core,
  ped.diffCoreAct,
  uiEn
);

rphPushExportGroup(
  lines,
  uiEn?'CHALLENGER GROUP':'KELOMPOK PENCABAR',
  ped.librarySteps?.challenge,
  ped.diffChallengeAct,
  uiEn
);

lines.push('');
lines.push(uiEn?'CLASSROOM ASSESSMENT (PBD)':'PBD');
lines.push(`${uiEn?'Assessment Method':'Kaedah Pentaksiran'}: ${ped.pbdEvidence?.method||''}`);
lines.push(`${uiEn?'Evidence':'Evidens'}: ${ped.pbdEvidence?.evidence||''}`);
lines.push(`${uiEn?'Success Criterion':'Kriteria Kejayaan'}: ${ped.pbdEvidence?.criterion||map.success_criteria||''}`);
lines.push('');
lines.push(uiEn?'CLOSURE':'PENUTUP');
lines.push(ped.penutup);
if(refl.text){lines.push('');lines.push(uiEn?'POST-LESSON REFLECTION':'REFLEKSI SELEPAS PDP');lines.push(refl.text)}return lines}
function rphDocxParagraph(value='',opts={}){
  const text=String(value??'').split(/\r?\n/);
  const runs=text.map((line,i)=>`${i?'<w:r><w:br/></w:r>':''}<w:r><w:rPr>${opts.bold?'<w:b/>':''}${opts.italic?'<w:i/>':''}<w:sz w:val="${opts.size||20}"/><w:szCs w:val="${opts.size||20}"/><w:color w:val="${opts.color||'1F2937'}"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Arial"/></w:rPr><w:t xml:space="preserve">${xmlEscape(line||' ')}</w:t></w:r>`).join('');
  return `<w:p><w:pPr><w:jc w:val="${opts.align||'left'}"/><w:spacing w:before="${opts.before||0}" w:after="${opts.after??70}" w:line="${opts.line||270}" w:lineRule="auto"/>${opts.keepNext?'<w:keepNext/>':''}</w:pPr>${runs}</w:p>`;
}
function rphDocxCell(content='',opts={}){
  const paragraphs=Array.isArray(content)?content: [rphDocxParagraph(content,{bold:opts.bold,size:opts.size,color:opts.color,align:opts.align,after:opts.after})];
  return `<w:tc><w:tcPr><w:tcW w:w="${opts.width||2400}" w:type="dxa"/>${opts.span?`<w:gridSpan w:val="${opts.span}"/>`:''}${opts.shade?`<w:shd w:val="clear" w:color="auto" w:fill="${opts.shade}"/>`:''}<w:vAlign w:val="${opts.vAlign||'top'}"/><w:tcMar><w:top w:w="100" w:type="dxa"/><w:left w:w="120" w:type="dxa"/><w:bottom w:w="100" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tcMar></w:tcPr>${paragraphs.join('')}</w:tc>`;
}
function rphDocxRow(cells,opts={}){
  return `<w:tr><w:trPr>${opts.header?'<w:tblHeader/>':''}${opts.allowSplit?'':'<w:cantSplit/>'}</w:trPr>${cells.join('')}</w:tr>`;
}
function rphDocxTable(rows,widths=[]){
  const grid=widths.length?`<w:tblGrid>${widths.map(w=>`<w:gridCol w:w="${w}"/>`).join('')}</w:tblGrid>`:'';
  return `<w:tbl><w:tblPr><w:tblW w:w="9638" w:type="dxa"/><w:tblLayout w:type="fixed"/><w:tblBorders><w:top w:val="single" w:sz="8" w:color="6B7280"/><w:left w:val="single" w:sz="8" w:color="6B7280"/><w:bottom w:val="single" w:sz="8" w:color="6B7280"/><w:right w:val="single" w:sz="8" w:color="6B7280"/><w:insideH w:val="single" w:sz="6" w:color="9CA3AF"/><w:insideV w:val="single" w:sz="6" w:color="9CA3AF"/></w:tblBorders><w:tblCellMar><w:top w:w="80" w:type="dxa"/><w:left w:w="100" w:type="dxa"/><w:bottom w:w="80" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tblCellMar></w:tblPr>${grid}${rows.join('')}</w:tbl>${rphDocxParagraph('',{size:8,after:25})}`;
}
function rphDocxSection(title,uiEn=false){
  return rphDocxTable([rphDocxRow([rphDocxCell(title,{width:9638,shade:'0F766E',bold:true,size:22,color:'FFFFFF'})])],[9638]);
}
function rphDocxLabelRow(label,value){
  return rphDocxRow([rphDocxCell(label,{width:2450,shade:'E8F3F0',bold:true}),rphDocxCell(value||'—',{width:7188})]);
}
function rphDocxActivityTable(steps,fallback,uiEn){
  const L=uiEn?{step:'Step / Activity',activity:'Teaching and Learning Activity',support:'Teaching Aids / PAK-21'}:{step:'Langkah / Aktiviti',activity:'Pelaksanaan Aktiviti PdP',support:'BBM/ABM / PAK-21'};
  const rows=[rphDocxRow([
    rphDocxCell(L.step,{width:1900,shade:'D9EDE8',bold:true,color:'0F4F49'}),
    rphDocxCell(L.activity,{width:5438,shade:'D9EDE8',bold:true,color:'0F4F49'}),
    rphDocxCell(L.support,{width:2300,shade:'D9EDE8',bold:true,color:'0F4F49'})
  ],{header:true})];
  if(steps?.length){
    steps.forEach((step,i)=>{
      const stepLabel=`${uiEn?'Step':'Langkah'} ${i+1}${step.name?`\n${step.name}`:''}`;
      const support=[step.bbm?`${uiEn?'Teaching Aids':'BBM/ABM'}: ${step.bbm}`:'',step.pak21?`${uiEn?'21st Century Learning':'PAK-21'}: ${step.pak21}`:''].filter(Boolean).join('\n');
      rows.push(rphDocxRow([
        rphDocxCell(stepLabel,{width:1900,shade:'F3F8F6',bold:true,color:'115E59'}),
        rphDocxCell(step.text||'—',{width:5438}),
        rphDocxCell(support||'—',{width:2300})
      ],{allowSplit:false}));
    });
  }else{
    rows.push(rphDocxRow([rphDocxCell(uiEn?'Activity':'Aktiviti',{width:1900,shade:'F3F8F6',bold:true}),rphDocxCell(fallback||'—',{width:5438}),rphDocxCell('—',{width:2300})]));
  }
  return rphDocxTable(rows,[1900,5438,2300]);
}
async function buildDocxBlob(ctx){
  if(!window.JSZip)throw new Error('JSZip belum dimuatkan. Pastikan internet aktif dan cuba semula.');
  const zip=new JSZip(),{map,classId,subjectId,date,week,activities}=ctx,cls=getClass(classId),sub=getSubject(subjectId),uiEn=!!ctx.uiEn,ped=ctx.pedagogy||buildSourceAwarePedagogy(map,activities,ctx.btRef,uiEn,classId),refl=currentReflectionData(),comp=map.source_evidence?.meta?.complementary_sp||[];
  const mainSp=map.source_evidence?.meta?.main_sp||String(map.sp||'').split(',')[0]||'—';
  const compSp=Array.isArray(comp)?comp.join(', '):String(comp||'');
  const stage=uiEn?({introduction:'Introduction',guided:'Guided practice',application:'Application',assessment:'Assessment / Reinforcement',enrichment:'Enrichment'}[map.progression_stage]||map.progression_stage||'—'):stageLabel(map.progression_stage);
  const title=uiEn?'DAILY LESSON PLAN':'RANCANGAN PENGAJARAN HARIAN';
  const body=[];
  body.push(rphDocxParagraph(title,{bold:true,size:30,color:'0F5F58',align:'center',after:70,keepNext:true}));
  body.push(rphDocxParagraph(`${sub?.name||''} • ${cls?.name||''} • ${uiEn?'Week':'Minggu'} ${week} • ${uiEn?'Lesson':'Sesi'} ${map.session_no||1}`,{bold:true,size:21,color:'374151',align:'center',after:180,keepNext:true}));
  body.push(rphDocxSection(uiEn?'A. LESSON INFORMATION':'A. MAKLUMAT PENGAJARAN',uiEn));
  body.push(rphDocxTable([
    rphDocxRow([rphDocxCell(uiEn?'Teacher':'Guru',{width:1700,shade:'E8F3F0',bold:true}),rphDocxCell(ctx.teacherName||'—',{width:3119}),rphDocxCell(uiEn?'Date':'Tarikh',{width:1500,shade:'E8F3F0',bold:true}),rphDocxCell(date||'—',{width:3319})]),
    rphDocxRow([rphDocxCell(uiEn?'Subject':'Subjek',{width:1700,shade:'E8F3F0',bold:true}),rphDocxCell(sub?.name||'—',{width:3119}),rphDocxCell(uiEn?'Time':'Masa',{width:1500,shade:'E8F3F0',bold:true}),rphDocxCell(ctx.lessonTime||'—',{width:3319})]),
    rphDocxRow([rphDocxCell(uiEn?'Class / Year':'Kelas / Tahun',{width:1700,shade:'E8F3F0',bold:true}),rphDocxCell(`${cls?.name||'—'} / ${uiEn?'Year':'Tahun'} ${cls?.year||'—'}`,{width:3119}),rphDocxCell(uiEn?'Week / Lesson':'Minggu / Sesi',{width:1500,shade:'E8F3F0',bold:true}),rphDocxCell(`${week} / ${map.session_no||1}`,{width:3319})])
  ],[1700,3119,1500,3319]));
  body.push(rphDocxSection(uiEn?'B. CURRICULUM ALIGNMENT':'B. PENJAJARAN KURIKULUM',uiEn));
  body.push(rphDocxTable([
    rphDocxLabelRow(uiEn?'Topic / Focus':'Tajuk / Fokus',map.title),
    rphDocxLabelRow(uiEn?'Content Standard':'Standard Kandungan',map.sk),
    rphDocxLabelRow(uiEn?'Main Learning Standard':'SP Utama',mainSp),
    rphDocxLabelRow(uiEn?'Complementary Standard(s)':'SP Sokongan',compSp||'—'),
    rphDocxLabelRow(uiEn?'All Learning Standards':'Semua Standard Pembelajaran',map.sp),
    rphDocxLabelRow(uiEn?'Learning Objective':'Objektif Pembelajaran',map.objective),
    rphDocxLabelRow(uiEn?'Success Criteria':'Kriteria Kejayaan',map.success_criteria),
    rphDocxLabelRow(uiEn?'Stage of Learning':'Perkembangan Pelajaran',stage),
    rphDocxLabelRow(uiEn?"Student's Book":'Buku Teks',ctx.btRef||'—'),
    ...(map.source_evidence?.meta?.activity_book_uploaded?[rphDocxLabelRow(uiEn?'Workbook':'Buku Aktiviti',map.activity_book_ref||'—')]:[])
  ],[2450,7188]));
  body.push(rphDocxSection(uiEn?'C. SET INDUCTION':'C. SET INDUKSI',uiEn));
  body.push(rphDocxTable([
    rphDocxLabelRow(uiEn?'Activity':'Aktiviti',ped.inductionData?.text||ped.setInduksi||'—'),
    rphDocxLabelRow(uiEn?'Teaching Aids':'BBM/ABM',ped.inductionData?.bbm||'—'),
    rphDocxLabelRow(uiEn?'21st Century Learning':'PAK-21',ped.inductionData?.pak21||'—')
  ],[2450,7188]));
  body.push(rphDocxSection(uiEn?'D. SOURCE ACTIVITIES FROM THE BOOK':'D. AKTIVITI SUMBER DARIPADA BUKU',uiEn));
  body.push(rphDocxActivityTable(ped.sourceSteps,ped.anchor,uiEn));
  body.push(rphDocxSection(uiEn?'E. DIFFERENTIATED TEACHING AND LEARNING':'E. PDP TERBEZA',uiEn));
  const groups=uiEn?[
    ['Explorer Group — guided support',ped.librarySteps?.support,ped.diffSupportAct,'EAF2FF'],
    ['Builder Group — standard task',ped.librarySteps?.core,ped.diffCoreAct,'EAF8EE'],
    ['Challenger Group — extension',ped.librarySteps?.challenge,ped.diffChallengeAct,'FFF5D6']
  ]:[
    ['Kelompok Peneroka — bimbingan',ped.librarySteps?.support,ped.diffSupportAct,'EAF2FF'],
    ['Kelompok Pembina — tugasan standard',ped.librarySteps?.core,ped.diffCoreAct,'EAF8EE'],
    ['Kelompok Pencabar — pengayaan',ped.librarySteps?.challenge,ped.diffChallengeAct,'FFF5D6']
  ];
  groups.forEach(([label,steps,fallback,shade])=>{
    body.push(rphDocxTable([rphDocxRow([rphDocxCell(label,{width:9638,shade,bold:true,size:21,color:'1F2937'})])],[9638]));
    body.push(rphDocxActivityTable(steps,fallback,uiEn));
  });
  body.push(rphDocxSection(uiEn?'F. CLASSROOM ASSESSMENT (PBD)':'F. PENTAKSIRAN BILIK DARJAH (PBD)',uiEn));
  body.push(rphDocxTable([
    rphDocxLabelRow(uiEn?'Assessment Method':'Kaedah Pentaksiran',ped.pbdEvidence?.method||'—'),
    rphDocxLabelRow(uiEn?'Evidence':'Evidens',ped.pbdEvidence?.evidence||'—'),
    rphDocxLabelRow(uiEn?'Success Criterion':'Kriteria Kejayaan',ped.pbdEvidence?.criterion||map.success_criteria||'—')
  ],[2450,7188]));
  body.push(rphDocxSection(uiEn?'G. CLOSURE AND REFLECTION':'G. PENUTUP DAN REFLEKSI',uiEn));
  body.push(rphDocxTable([
    rphDocxLabelRow(uiEn?'Closure':'Penutup',ped.penutup||'—'),
    rphDocxLabelRow(uiEn?'Post-lesson Reflection':'Refleksi Selepas PdP',refl.text||'\n\n')
  ],[2450,7188]));
  if(ctx.evidenceRefs?.length){
    body.push(rphDocxTable([rphDocxRow([rphDocxCell(uiEn?'Source trail':'Jejak sumber',{width:2450,shade:'F3F4F6',bold:true,size:17,color:'4B5563'}),rphDocxCell(ctx.evidenceRefs.join(' • '),{width:7188,size:17,color:'4B5563'})])],[2450,7188]));
  }
  const doc=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body.join('')}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="850" w:right="850" w:bottom="850" w:left="850" w:header="360" w:footer="360"/></w:sectPr></w:body></w:document>`;
  const contentTypes='<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>';
  const styles='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Arial"/><w:sz w:val="20"/><w:szCs w:val="20"/><w:lang w:val="ms-MY"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="70" w:line="270" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults></w:styles>';
  zip.file('[Content_Types].xml',contentTypes);
  zip.folder('_rels').file('.rels','<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
  zip.folder('word').file('document.xml',doc);
  zip.folder('word').file('styles.xml',styles);
  zip.folder('word').folder('_rels').file('document.xml.rels','<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>');
  return await zip.generateAsync({type:'blob',mimeType:DOCX_MIME,compression:'DEFLATE'});
}
function generatedRphFileName(ctx){const cls=getClass(ctx.classId),sub=getSubject(ctx.subjectId);return safeFileName(`RPH_${sub?.name||'Subjek'}_${cls?.name||'Kelas'}_M${ctx.week}_${ctx.date}`)+'.docx'}
async function downloadGeneratedRph(){const ctx=state.currentGeneratedRph;if(!ctx)return toast('Generate RPH dahulu.');try{const blob=await buildDocxBlob(ctx),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=generatedRphFileName(ctx);document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1200);toast(ctx.uiEn?'Word file downloaded.':'Fail Word berjaya dimuat turun.')}catch(e){toast('Word gagal: '+e.message,5000)}}
function printGeneratedRph(){const ctx=state.currentGeneratedRph;if(!ctx)return toast('Generate RPH dahulu.');const preview=$('#rphPreview')?.cloneNode(true);if(!preview)return;preview.querySelectorAll('.no-print-export,.setup-actions,button,input,select,textarea').forEach(el=>el.remove());const reflection=currentReflectionData().text;if(reflection){const h=document.createElement('h3');h.textContent=ctx.uiEn?'Post-lesson Reflection':'Refleksi Selepas PdP';const p=document.createElement('p');p.textContent=reflection;preview.append(h,p)}const w=window.open('','_blank');if(!w)return toast(ctx.uiEn?'Print window was blocked. Allow pop-ups and try again.':'Tetingkap print disekat. Benarkan pop-up dan cuba lagi.');w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(generatedRphFileName(ctx).replace(/\.docx$/,''))}</title><style>body{font-family:Arial,sans-serif;color:#111;padding:28px;line-height:1.45}h1,h2,h3{margin:16px 0 8px}.rph-grid{display:grid;grid-template-columns:220px 1fr;border:1px solid #bbb}.rph-grid>div{padding:8px;border-bottom:1px solid #ddd}.rph-grid>div:nth-child(odd){font-weight:700;background:#f3f3f3}.source-trace{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}.source-trace span{border:1px solid #bbb;padding:5px 8px;border-radius:12px}.group-card,.activity,.source-proof{border:1px solid #ccc;padding:10px;margin:8px 0;border-radius:8px}.rph-step-table{width:100%;border-collapse:collapse;margin:8px 0}.rph-step-table th,.rph-step-table td{border:1px solid #aaa;padding:8px;vertical-align:top;text-align:left}.rph-step-table th{width:29%;background:#f3f3f3}.rph-step-table th small{display:block;margin-top:3px}.rph-step-meta{margin-top:7px;padding-top:7px;border-top:1px dashed #aaa}details{display:none}@page{size:A4;margin:12mm}</style></head><body>${preview.innerHTML}</body></html>`);w.document.close();w.focus();setTimeout(()=>w.print(),350)}
function loadGoogleIdentity(){if(window.google?.accounts?.oauth2)return Promise.resolve();return new Promise((resolve,reject)=>{let s=document.querySelector('script[data-drive-gis]');if(s){s.addEventListener('load',()=>resolve(),{once:true});s.addEventListener('error',()=>reject(new Error('Google Identity Services gagal dimuatkan.')),{once:true});return}s=document.createElement('script');s.src='https://accounts.google.com/gsi/client';s.async=true;s.defer=true;s.dataset.driveGis='1';s.onload=()=>resolve();s.onerror=()=>reject(new Error('Google Identity Services gagal dimuatkan.'));document.head.appendChild(s)})}
function driveAccountMode(){return $('#rphDriveAccountMode')?.value||'current'}
function resetDriveToken(){DRIVE_ACCESS_TOKEN='';DRIVE_TOKEN_EXPIRES_AT=0;CLASSROOM_COURSES=[];const course=$('#rphClassroomCourse'),topic=$('#rphClassroomTopic');if(course)course.innerHTML='<option value="">Hubungkan Classroom dahulu</option>';if(topic)topic.innerHTML='<option value="">Tiada topik dipilih</option>'}
async function requestDriveToken(mode='current'){
  if(mode==='current'&&DRIVE_ACCESS_TOKEN&&Date.now()<DRIVE_TOKEN_EXPIRES_AT-60000)return DRIVE_ACCESS_TOKEN;
  if(mode!=='current')resetDriveToken();
  await loadGoogleIdentity();
  const email=String(state.user?.email||'').trim();
  return await new Promise((resolve,reject)=>{
    let settled=false;
    const config={
      client_id:GOOGLE_DRIVE_CLIENT_ID,
      scope:GOOGLE_WORKSPACE_SCOPES,
      include_granted_scopes:true,
      callback:(resp)=>{
        settled=true;
        if(resp?.error)return reject(new Error(resp.error_description||resp.error));
        if(!resp?.access_token)return reject(new Error('Google tidak memulangkan access token.'));
        DRIVE_ACCESS_TOKEN=resp.access_token;
        DRIVE_TOKEN_EXPIRES_AT=Date.now()+(Number(resp.expires_in||3600)*1000);
        resolve(DRIVE_ACCESS_TOKEN)
      },
      error_callback:(err)=>{
        if(settled)return;
        const t=err?.type||'';
        if(t==='popup_closed')return reject(new Error('Popup Google ditutup sebelum kebenaran Google Workspace diterima.'));
        if(t==='popup_failed_to_open')return reject(new Error('Popup Google gagal dibuka. Benarkan pop-up untuk laman ini.'));
        reject(new Error(err?.message||t||'Google Workspace OAuth gagal.'))
      }
    };
    if(mode==='current'&&email){config.login_hint=email;config.hd=DELIMA_DOMAIN}
    const client=google.accounts.oauth2.initTokenClient(config);
    const override=mode==='other'?{prompt:'select_account'}:{prompt:'',login_hint:email||undefined};
    client.requestAccessToken(override)
  })
}
async function googleJson(url,token,options={}){const r=await fetch(url,{...options,headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json',...(options.headers||{})}});if(!r.ok){let msg='';try{msg=(await r.json())?.error?.message||''}catch{}throw new Error(msg||`Google API HTTP ${r.status}`)}return await r.json()}
async function driveJson(url,token,options={}){return googleJson(url,token,options)}
function driveQ(v=''){return String(v).replace(/\\/g,'\\\\').replace(/'/g,"\\'")}
async function ensureDriveFolder(token,name,parentId='root'){const q=`name='${driveQ(name)}' and mimeType='application/vnd.google-apps.folder' and trashed=false and '${driveQ(parentId)}' in parents`;const url='https://www.googleapis.com/drive/v3/files?spaces=drive&pageSize=20&fields=files(id,name)&q='+encodeURIComponent(q);const found=await driveJson(url,token,{method:'GET',headers:{'Content-Type':'application/json'}});if(found.files?.[0])return found.files[0].id;const created=await driveJson('https://www.googleapis.com/drive/v3/files?fields=id,name',token,{method:'POST',body:JSON.stringify({name,mimeType:'application/vnd.google-apps.folder',parents:[parentId]})});return created.id}
async function uploadBlobToDrive(token,blob,name,parentId){const boundary='erph_'+Math.random().toString(36).slice(2);const meta=JSON.stringify({name,mimeType:DOCX_MIME,parents:[parentId]});const body=new Blob([`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n--${boundary}\r\nContent-Type: ${DOCX_MIME}\r\n\r\n`,blob,`\r\n--${boundary}--`],{type:`multipart/related; boundary=${boundary}`});const r=await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':`multipart/related; boundary=${boundary}`},body});if(!r.ok){let msg='';try{msg=(await r.json())?.error?.message||''}catch{}throw new Error(msg||`Google Drive HTTP ${r.status}`)}return await r.json()}
function driveFolderParts(ctx){
  const cls=getClass(ctx.classId),sub=getSubject(ctx.subjectId);
  const academicYear=String(cls?.academic_year||String(ctx.date||today).slice(0,4)||new Date().getFullYear());
  const yearLevel=`Tahun ${cls?.year||'Tidak Ditetapkan'}`;
  const className=String(cls?.name||'Kelas Tidak Ditetapkan').trim();
  const weekName=`Minggu ${ctx.week||'Tidak Ditetapkan'}`;
  const subjectName=String(sub?.name||'Subjek Tidak Ditetapkan').trim();
  return ['e-RPH',academicYear,yearLevel,className,weekName,subjectName];
}
function showDriveSuccess(ctx,file,route){
  const dlg=$('#driveSuccessDialog');
  if(!dlg)return toast(ctx.uiEn?`Uploaded to Google Drive: ${route} / ${file.name}`:`Berjaya upload ke Google Drive: ${route} / ${file.name}`,8000);
  $('#driveSuccessTitle').textContent=ctx.uiEn?'Upload Successful':'Upload Berjaya';
  $('#driveSuccessMsg').textContent=ctx.uiEn?'Your RPH file was uploaded to Google Drive:':'Fail RPH anda berjaya dimuat naik ke Google Drive:';
  $('#driveSuccessFile').textContent=file.name||'';
  $('#driveSuccessRoute').textContent=route||'';
  const link=$('#driveOpenLink');
  if(file.webViewLink){link.hidden=false;link.dataset.href=file.webViewLink}else{link.hidden=true}
  dlg.showModal();
}
async function ensureGeneratedRphDriveFile(ctx,token){
  const cacheKey=`${generatedRphFileName(ctx)}|${currentReflectionData().text||''}`;
  if(ctx.googleDriveFile&&ctx.googleDriveFileCacheKey===cacheKey)return {file:ctx.googleDriveFile,route:ctx.googleDriveRoute||''};
  const blob=await buildDocxBlob(ctx);let parent='root';const parts=driveFolderParts(ctx);for(const part of parts)parent=await ensureDriveFolder(token,part,parent);
  const file=await uploadBlobToDrive(token,blob,generatedRphFileName(ctx),parent);ctx.googleDriveFile=file;ctx.googleDriveFileCacheKey=cacheKey;ctx.googleDriveRoute=parts.join(' / ');return {file,route:ctx.googleDriveRoute};
}
async function uploadGeneratedRphToDrive(){const ctx=state.currentGeneratedRph;if(!ctx)return toast('Generate RPH dahulu.');const btn=$('#uploadRphDrive');if(btn)btn.disabled=true;try{const mode=driveAccountMode();const current=String(state.user?.email||'').trim();toast(ctx.uiEn?(mode==='current'?`Connecting as ${current||'signed-in account'}…`:'Choose a Google account…'):(mode==='current'?`Menyambung sebagai ${current||'akaun login semasa'}…`:'Pilih akaun Google…'),5000);const token=await requestDriveToken(mode),{file,route}=await ensureGeneratedRphDriveFile(ctx,token);showDriveSuccess(ctx,file,route)}catch(e){const raw=String(e?.message||'');const origin=/origin_mismatch/i.test(raw)?(ctx.uiEn?' Add this site to Google OAuth Authorized JavaScript origins.':' Tambahkan laman ini pada Google OAuth Authorized JavaScript origins.') : '';toast((ctx.uiEn?'Google Drive upload failed: ':'Upload Google Drive gagal: ')+raw+origin,8000)}finally{if(btn)btn.disabled=false}}

async function listTeacherClassrooms(token){
  const courses=[];let pageToken='';
  do{const params=new URLSearchParams({teacherId:'me',courseStates:'ACTIVE',pageSize:'100',fields:'courses(id,name,section,room,courseState,alternateLink),nextPageToken'});if(pageToken)params.set('pageToken',pageToken);const data=await googleJson(`https://classroom.googleapis.com/v1/courses?${params}`,token,{method:'GET'});courses.push(...(data.courses||[]));pageToken=data.nextPageToken||''}while(pageToken);
  return courses.sort((a,b)=>String(a.name||'').localeCompare(String(b.name||''),'ms'));
}
async function listClassroomTopics(token,courseId){
  const topics=[];let pageToken='';
  do{const params=new URLSearchParams({pageSize:'100'});if(pageToken)params.set('pageToken',pageToken);const data=await googleJson(`https://classroom.googleapis.com/v1/courses/${encodeURIComponent(courseId)}/topics?${params}`,token,{method:'GET'});topics.push(...(data.topic||[]));pageToken=data.nextPageToken||''}while(pageToken);
  return topics.sort((a,b)=>String(a.name||'').localeCompare(String(b.name||''),'ms'));
}
function setClassroomStatus(message='',kind=''){const el=$('#rphClassroomStatus');if(!el)return;el.textContent=message;el.dataset.kind=kind}
async function refreshClassroomTopics(){
  const courseId=$('#rphClassroomCourse')?.value,topic=$('#rphClassroomTopic');if(!topic)return;topic.innerHTML='<option value="">Tiada topik dipilih</option>';if(!courseId)return;
  try{const token=await requestDriveToken(driveAccountMode()),topics=await listClassroomTopics(token,courseId);topic.innerHTML='<option value="">Tiada topik dipilih</option>'+topics.map(x=>`<option value="${escapeHtml(x.topicId)}">${escapeHtml(x.name)}</option>`).join('');setClassroomStatus(topics.length?`${topics.length} topik ditemui.`:'Classroom ini belum mempunyai topik.','ok')}catch(error){setClassroomStatus(`Topik gagal dimuatkan: ${error.message}`,'bad')}
}
async function connectGoogleClassroom(){
  const btn=$('#loadClassrooms');if(btn)btn.disabled=true;setClassroomStatus('Menyambung ke Google Classroom…');
  try{const token=await requestDriveToken(driveAccountMode());CLASSROOM_COURSES=await listTeacherClassrooms(token);const select=$('#rphClassroomCourse');if(!select)return;select.innerHTML='<option value="">Pilih Google Classroom</option>'+CLASSROOM_COURSES.map(x=>`<option value="${escapeHtml(x.id)}">${escapeHtml(x.name)}${x.section?` — ${escapeHtml(x.section)}`:''}</option>`).join('');if(CLASSROOM_COURSES.length===1){select.value=CLASSROOM_COURSES[0].id;await refreshClassroomTopics()}setClassroomStatus(CLASSROOM_COURSES.length?`${CLASSROOM_COURSES.length} Classroom aktif ditemui.`:'Tiada Classroom aktif yang anda ajar.','ok')}catch(error){const admin=/access_denied|admin_policy_enforced|unauthorized_client/i.test(String(error.message));setClassroomStatus((admin?'Pentadbir DELIMa perlu meluluskan Google Classroom API. ':'')+error.message,'bad');toast('Google Classroom gagal disambungkan: '+error.message,8000)}finally{if(btn)btn.disabled=false}
}
function classroomMaterialPayload(ctx,file,topicId=''){
  const cls=getClass(ctx.classId),sub=getSubject(ctx.subjectId),title=`RPH ${sub?.name||'Subjek'} — ${cls?.name||'Kelas'} — ${ctx.date}`;
  const payload={title,description:`Minggu ${ctx.week} • ${ctx.map?.title||''}`.trim(),materials:[{driveFile:{driveFile:{id:file.id,title:file.name},shareMode:'VIEW'}}],state:'DRAFT'};if(topicId)payload.topicId=topicId;return payload;
}
async function createClassroomDraft(token,courseId,ctx,file,topicId=''){
  return googleJson(`https://classroom.googleapis.com/v1/courses/${encodeURIComponent(courseId)}/courseWorkMaterials`,token,{method:'POST',body:JSON.stringify(classroomMaterialPayload(ctx,file,topicId))});
}
async function sendGeneratedRphToClassroom({auto=false}={}){
  const ctx=state.currentGeneratedRph;if(!ctx)return toast('Generate RPH dahulu.');const courseId=$('#rphClassroomCourse')?.value,topicId=$('#rphClassroomTopic')?.value||'';if(!courseId){toast(auto?'Auto hantar belum dijalankan. Hubungkan dan pilih Google Classroom dahulu.':'Hubungkan dan pilih Google Classroom dahulu.',6000);return false}if(ctx.classroomDraftCourses?.includes(courseId)){toast('RPH ini sudah dihantar sebagai draf ke Classroom yang dipilih.',5000);return true}
  const btn=$('#sendRphClassroom');if(btn)btn.disabled=true;setClassroomStatus('Upload RPH dan cipta Material draf…');
  try{const token=await requestDriveToken(driveAccountMode()),{file}=await ensureGeneratedRphDriveFile(ctx,token),material=await createClassroomDraft(token,courseId,ctx,file,topicId),course=CLASSROOM_COURSES.find(x=>x.id===courseId);ctx.classroomDraftCourses=[...(ctx.classroomDraftCourses||[]),courseId];setClassroomStatus(`Draf berjaya dihantar ke ${course?.name||'Google Classroom'}.`,'ok');toast(`Draf Google Classroom berjaya: ${course?.name||material.title}`,7000);return true}catch(error){setClassroomStatus(`Hantar gagal: ${error.message}`,'bad');toast('Google Classroom gagal: '+error.message,8000);return false}finally{if(btn)btn.disabled=false}
}

function cleanSourceAnchor(v=''){return String(v||'').replace(/^\s*(?:RPT|BT|BA|Student['’]s Book|Workbook)\s*(?:m\/s|p\.)?\s*\d*\s*[:•-]?\s*/i,'').replace(/\s+/g,' ').trim()}
function isScienceSubject(subjectId){const sub=getSubject(subjectId),key=normKey(`${sub?.code||''} ${sub?.name||''}`);return /\bsains\b|\bscience\b/.test(key)}
function isPhysicalEducationSubject(subjectId){const sub=getSubject(subjectId),key=normKey(`${sub?.code||''} ${sub?.name||''}`);return /\bpendidikan jasmani\b|\bphysical education\b|\bpj\b/.test(key)}
function isHealthEducationSubject(subjectId){const sub=getSubject(subjectId),key=normKey(`${sub?.code||''} ${sub?.name||''}`);return /\bpendidikan kesihatan\b|\bhealth education\b|\bpk\b/.test(key)}
function isIslamicEducationSubject(subjectId){const sub=getSubject(subjectId),key=normKey(`${sub?.code||''} ${sub?.name||''}`);return /\bpendidikan islam\b|\bpendidikan agama islam\b|\bp islam\b|\bpai\b|\bpi\b/.test(key)}
function isMoralEducationSubject(subjectId){const sub=getSubject(subjectId),key=normKey(`${sub?.code||''} ${sub?.name||''}`);return /\bpendidikan moral\b|\bmoral education\b|\bmoral\b/.test(key)}
function isArabicLanguageSubject(subjectId){const sub=getSubject(subjectId),key=normKey(`${sub?.code||''} ${sub?.name||''}`);return /\bbahasa arab\b|\barabic(?: language)?\b|\bb arab\b|\barab\b|\bba\b/.test(key)}
const SCIENCE_TASK_PATTERNS=[
  ['problem_solve',/(?:bolehkah|bagaimanakah).*(?:jelaskan|terangkan|sebab)|menyelesaikan masalah|selesaikan masalah|problem solve/],
  ['compare_conditions',/banding.*keadaan|banding.*kondisi|compare.*conditions/],['test_material',/menguji.*bahan|uji.*(?:bahan|objek)|test.*material/],['represent_data',/mewakilkan data|persembah.*data|graf|piktograf|represent data|chart/],['record_data',/merekod|rekodkan|catat.*(?:data|pemerhatian)|record data|table.*data/],['draw_label',/melukis.*label|lukis.*label|draw.*label/],['build_model',/membina model|bina model|hasilkan.*model|build.*model/],['design_create',/mereka bentuk|mencipta|hasilkan.*(?:risalah|produk|roket)|design.*create|design.*make/],['cause_effect',/sebab dan akibat|punca dan kesan|cause.*effect/],['problem_solve',/menyelesaikan masalah|selesaikan masalah|bagaimana.*(?:asing|selesai)|problem solve/],['review_game',/ulang kaji.*permainan|kuiz|review game|quiz/],['investigate',/menyiasat|penyiasatan|mari kita kaji|investigate/],['infer',/membuat inferens|buat inferens|kesimpulan.*penyiasatan|infer/],['predict',/meramal|ramal|predict/],['measure',/mengukur|sukat|ukur|measure/],['sequence',/menyusun.*urutan|susun.*urutan|sequence|order.*steps/],['classify',/mengelaskan|dikelaskan|kelaskan|classify|group.*according/],['compare',/membandingkan|bandingkan|compare/],['identify',/mengenal pasti|kenal pasti|identify/],['observe',/memerhati|pemerhatian|observe|look closely/],['communicate',/berkomunikasi|kongsikan|persembahkan|membentang|communicate|present.*findings/]
];
function scienceTaskPattern(map,activities=[]){if(!isScienceSubject(map?.subject_id))return'';const source=(activities||[]).filter(x=>/\bBT\b|Student['’]s Book/i.test(String(x)));const hay=normKey((source.length?source:(activities||[])).join(' ')||[map?.title||'',map?.objective||'',map?.success_criteria||''].join(' '));return SCIENCE_TASK_PATTERNS.find(([,re])=>re.test(hay))?.[0]||''}
function sciencePatternLabel(pattern='',uiEn=false){const labels={observe:['Pemerhatian','Observation'],identify:['Mengenal pasti','Identification'],classify:['Pengelasan','Classification'],compare:['Perbandingan','Comparison'],sequence:['Urutan','Sequencing'],measure:['Pengukuran','Measurement'],record_data:['Rekod data','Data recording'],represent_data:['Perwakilan data','Data representation'],investigate:['Penyiasatan','Investigation'],test_material:['Uji bahan','Material testing'],compare_conditions:['Banding keadaan','Compare conditions'],infer:['Inferens','Inference'],predict:['Ramalan','Prediction'],cause_effect:['Sebab dan akibat','Cause and effect'],draw_label:['Lukis dan label','Draw and label'],build_model:['Bina model','Build a model'],design_create:['Reka dan cipta','Design and create'],communicate:['Komunikasi dapatan','Communicate findings'],problem_solve:['Penyelesaian masalah','Problem solving'],review_game:['Ulang kaji','Review']};return labels[pattern]?.[uiEn?1:0]||''}
function scienceDifferentiation(pattern,task,page,uiEn){const label=sciencePatternLabel(pattern,uiEn)|| (uiEn?'science task':'tugasan sains');const evidence=uiEn?'state the observation, measurement, result or evidence from the same task':'menyatakan pemerhatian, ukuran, hasil atau bukti daripada tugasan yang sama';return uiEn?{support:`With teacher guidance, pupils complete the same ${label.toLowerCase()} task “${task}” on ${page} in smaller steps using a prompt sheet, labelled example or partially prepared table.`,core:`Pupils complete the original textbook ${label.toLowerCase()} task “${task}” on ${page} and record the required result independently or with a partner.`,challenge:`After completing the same task “${task}”, pupils ${evidence} and explain or justify their conclusion without changing the investigation, material or Learning Standard.`}:{support:`Dengan bimbingan guru, murid melaksanakan tugasan ${label.toLowerCase()} yang sama “${task}” pada ${page} secara langkah demi langkah menggunakan petunjuk, contoh berlabel atau jadual separa siap.`,core:`Murid melaksanakan tugasan ${label.toLowerCase()} asal Buku Teks “${task}” pada ${page} dan merekod hasil yang diperlukan secara kendiri atau bersama pasangan.`,challenge:`Selepas melengkapkan tugasan yang sama “${task}”, murid ${evidence} serta menerangkan atau menjustifikasikan kesimpulan tanpa mengubah penyiasatan, bahan atau Standard Pembelajaran.`}}
const PHYSICAL_EDUCATION_PATTERNS=[
  ['aquatic_confidence',/kolam renang|bobbing|apung(?:an)? tiarap|meluncur|luncur lancar|kemahiran.*air|keyakinan.*air/],
  ['growth_tracking',/ketinggian|berat badan|pertumbuhan fizikal|ukur tinggi|mengukur tinggi|rekod berat|menimbang berat/],
  ['core_stability',/otot teras|core muscle|mengempis abdomen|angkat badan sisi|tekan tubi bersiku/],
  ['creative_build',/istana pasir|plastisin|blok mainan|mereka cipta objek|bina.*objek/],
  ['animal_movement',/pergerakan haiwan|berjalan gajah|berjalan tikus|merangkak buaya|melompat arnab|berjalan ketam|melompat kijang|melompat katak|berjalan beruang/],
  ['hand_dribble',/kelecek tangan|mengelecek bola berterusan menggunakan satu tangan|bola emas/],
  ['foot_dribble',/kelecek bola|mengelecek bola.*bahagian dalam kaki|lengkok skital/],
  ['balloon_strike',/pukul belon|memukul belon|titik kontak.*belon/],
  ['kick_ball',/tendang bola|menendang bola|kaki sokong.*bola/],
  ['self_toss_catch',/lambung dan tangkap|bola yang dilambung sendiri|lambung.*bola.*tangkap/],
  ['overarm_throw',/balingan atas kepala|siapa kuat.*baling|tangan yang tidak membaling/],
  ['throw_catch',/baling dan tangkap|balingan bawah tangan|menangkap.*objek|menerima objek.*dibaling/],
  ['jump_rope',/lompat tali|tali yang diayun|ayun dan lompat/],
  ['jump_land',/melompat.*kedua-dua belah kaki|melompat.*sebelah kaki|mendarat.*lutut|gerak ruang.*stesen/],
  ['non_locomotor',/bukan lokomotor|membongkok|mengayun|memusing|mengilas|meregang|menolak|menarik/],
  ['locomotor',/pergerakan lokomotor|berjalan.*berlari.*melompat|mencongklang|menggelongsor|berskip/],
  ['force_control',/daya.*ringan.*berat|penggunaan daya|sukan rakyat/],
  ['pathway_speed',/laluan lurus|berlengkok|spiral|zig.?zag|kawal kelajuan|pelbagai.*laluan.*kelajuan/],
  ['direction_signal',/gerak isyarat|arah depan|arah belakang|pusing ke kiri|isyarat.*tempo|menukar arah/],
  ['space_awareness',/ruang diri|ruang am|batasan ruang|pulang ke rumah|aras rendah.*sederhana.*tinggi/],
  ['body_awareness',/kesedaran tubuh|bentuk badan|pemindahan berat badan|layangan|gerak cabaran/],
  ['strategy_game',/\bcatur\b|\bdam\b|strategi permainan|buah catur|papan dam/],
  ['traditional_game',/tarik upih|batak lampung|batu seremban|karom|permainan tradisional/],
  ['warmup_pulse',/memanaskan badan|pemanasan badan|kadar nadi|denyutan nadi/],
  ['cooldown_hydration',/menyejukkan badan|penyejukan badan|hidrasi|pengambilan air/],
  ['aerobic',/aerobik|daya tahan kardiovaskular|jantung dan paru|talk test/],
  ['flexibility',/kelenturan|regangan dinamik|regangan statik|regang dan tahan/],
  ['muscular_fitness',/kekuatan otot|daya tahan otot|tekan tubi|bangkit tubi/],
  ['rhythmic_movement',/pergerakan berirama|ikut langkah|ikut gerak|rangkaian pergerakan|muzik/],
  ['invasion_game',/menghantar.*bola|menerima.*bola|mengadang|mengelecek|menjaring|permainan kategori serangan/],
  ['net_game',/permainan kategori jaring|voli|menyangga|servis bawah|servis atas|pukulan pepat|pukulan kilas/],
  ['striking_fielding',/memukul bola|menahan bola|balingan atas kepala|balingan bawah tangan|permainan kategori pukul/],
  ['spring_landing',/hambur|melonjak|mendarat|kanggaru|kaki ke tangan|tangan ke kaki/],
  ['rotation',/guling|putaran badan|tenggiling/],
  ['balance',/imbangan|dirian tangan|kereta sorong|tapak sokongan/],
  ['running',/berlari|lari pecut|kelajuan larian|jarak larian/],
  ['jumping',/melompat|lompatan|melepasi halangan|lonjak/],
  ['throwing',/membaling|melontar|melempar|baling.*objek|lempar.*objek/]
];
function physicalEducationPattern(map,activities=[]){if(!isPhysicalEducationSubject(map?.subject_id))return'';const source=(activities||[]).filter(x=>/\bBT\b|Buku Teks/i.test(String(x)));const hay=normKey((source.length?source:(activities||[])).join(' ')||[map?.title||'',map?.objective||'',map?.success_criteria||''].join(' '));return PHYSICAL_EDUCATION_PATTERNS.find(([,re])=>re.test(hay))?.[0]||'general'}
function physicalEducationDifferentiation(pattern,task,page,uiEn){const safety=uiEn?'after checking the activity area, equipment and safe distance':'selepas menyemak ruang aktiviti, alatan dan jarak selamat';return uiEn?{support:`With teacher guidance, pupils practise the same movement task “${task}” from ${page} in short parts ${safety}. The teacher demonstrates one key action and a partner uses a simple technique card.`,core:`Pupils perform the original movement task “${task}” from ${page} in pairs or small groups, following the stated technique, rules and safety routine.`,challenge:`After completing the same task “${task}”, pupils repeat it with a decision, accuracy or consistency target and explain one technique cue; the height, equipment and Learning Standard are not changed.`}:{support:`Dengan bimbingan guru, murid berlatih tugasan pergerakan yang sama “${task}” daripada ${page} secara bahagian kecil ${safety}. Guru menunjukkan satu aksi utama dan pasangan menggunakan kad semak teknik mudah.`,core:`Murid melaksanakan tugasan pergerakan asal “${task}” daripada ${page} secara berpasangan atau kumpulan kecil dengan mematuhi teknik, peraturan dan rutin keselamatan yang dinyatakan.`,challenge:`Selepas melengkapkan tugasan yang sama “${task}”, murid mengulanginya dengan sasaran membuat keputusan, ketepatan atau konsistensi serta menerangkan satu petunjuk teknik; ketinggian, alatan dan Standard Pembelajaran tidak diubah.`}}
const HEALTH_EDUCATION_PATTERNS=[
  ['personal_hygiene',/kebersihan fizikal|jaga kebersihan|mandi|cuci.*selepas.*tandas|potong kuku|alatan keperluan diri/],
  ['family_boundaries',/batas sentuhan.*keluarga|sentuhan.*kekeluargaan|perhubungan kekeluargaan/],
  ['personal_boundaries',/anggota seksual|kehormatan diri|kehormatan anggota|sentuhan selamat|sentuhan tidak selamat|peraturan sentuhan/],
  ['body_knowledge',/anggota tubuh|bahagian tubuh|rambut|mata|telinga|hidung|mulut|deria/],
  ['medicine_safety',/ubat|preskripsi doktor|ahli farmasi|tarikh luput|penyimpanan ubat/],
  ['needs_wants',/keperluan dan kehendak|keperluan.*kehendak/],
  ['emotion_management',/meluahkan emosi|mengurus emosi|jaga emosi/],
  ['emotion_identification',/pelbagai emosi|emosi.*gembira|sedih.*takut.*marah.*malu|teka-teki emosi/],
  ['family_roles',/peranan ahli keluarga|peranan.*penjaga|peranan.*di rumah|keluarga angkat/],
  ['family_uniqueness',/keistimewaan diri|keistimewaan.*keluarga|keluarga saya/],
  ['family_respect',/menghormati.*keluarga|adab.*di rumah|bantu-membantu|berkomunikasi.*keluarga/],
  ['relationship_refusal',/batas perhubungan|jangan sentuh saya|berkata tidak.*sentuh|lari.*tempat selamat/],
  ['healthy_relationships',/hubungan yang sihat|menjalin hubungan|etika perhubungan|hormat-menghormati/],
  ['disease_prevention',/mencegah penyakit|elak penyakit|cuci tangan|tutup mulut.*batuk|sapu tangan.*bersin/],
  ['germ_disease',/penyakit.*kuman|bawaan kuman|batuk.*bersin|penyakit kulit|cirit-birit/],
  ['germ_spread',/maksud kuman|kuman.*merebak|jejak kuman|sentuhan dan udara/],
  ['bullying_prevention',/buli|pembuli|dibuli|jangan ganggu saya/],
  ['food_storage',/menyimpan makanan|penyimpanan makanan|peti sejuk|almari makanan|makanan.*ditutup/],
  ['healthy_mealtimes',/waktu makan|sarapan.*makan tengah hari.*makan malam|menu makanan berkhasiat/],
  ['nutritious_food',/makanan berkhasiat|makanan tidak berkhasiat|jenis makanan|mari pergi ke pasar/],
  ['emergency_response',/situasi kecemasan|minta bantuan|talian kecemasan|ambulans|polis.*bantuan/],
  ['smoke_refusal',/merokok|rokok|perokok pasif|asap rokok|berkata tidak.*rokok/],
  ['self_confidence',/keyakinan diri|amalan positif|yakin boleh/],
  ['conflict_management',/konflik|berselisih faham|berbeza pendapat|bertolak ansur|menghormati perasaan/],
  ['mosquito_disease',/demam denggi|demam malaria|penyakit bawaan nyamuk|pembiakan nyamuk|nyamuk aedes|nyamuk tiruk/],
  ['environmental_safety',/ancaman sekeliling|mengancam keselamatan|orang tidak dikenali|tempat sunyi|keselamatan diri/],
  ['nutritious_snacks',/snek berkhasiat|pilihan snek|gula.*garam.*lemak|pemakanan sihat/],
  ['minor_first_aid',/kecederaan ringan|luka kecil|calar|lebam|melecet|bantu mula|pertolongan cemas/]
];
function healthEducationPattern(map,activities=[]){if(!isHealthEducationSubject(map?.subject_id))return'';const source=(activities||[]).filter(x=>/\bBT\b|Buku Teks/i.test(String(x)));const hay=normKey((source.length?source:(activities||[])).join(' ')||[map?.title||'',map?.objective||'',map?.success_criteria||''].join(' '));return HEALTH_EDUCATION_PATTERNS.find(([,re])=>re.test(hay))?.[0]||'general'}
function healthEducationDifferentiation(pattern,task,page){const focus={personal_hygiene:'memilih amalan kebersihan fizikal, pakaian dan alatan diri serta menerangkan kesannya',body_knowledge:'mengenal pasti anggota tubuh dan memadankannya dengan fungsi atau deria yang betul',family_boundaries:'menentukan batas selamat dan memilih tindakan berkata TIDAK, beredar serta memberitahu orang dewasa yang dipercayai berdasarkan situasi rekaan',personal_boundaries:'mengenal pasti peraturan menjaga privasi dan memilih tindakan selamat berdasarkan kad situasi rekaan',medicine_safety:'memilih penggunaan dan penyimpanan ubat yang betul berdasarkan label, arahan doktor atau ahli farmasi',needs_wants:'membezakan keperluan dengan kehendak dan memberikan alasan mudah',emotion_management:'memilih cara meluahkan dan mengurus emosi yang sesuai dengan situasi',emotion_identification:'mengenal pasti emosi daripada ekspresi atau situasi dan memberikan sebab',family_roles:'mengenal pasti peranan diri, ahli keluarga dan penjaga dalam kehidupan harian',family_uniqueness:'menceritakan keistimewaan diri atau keluarga dengan bahasa yang menghormati perbezaan',family_respect:'memilih adab komunikasi dan tindakan bantu-membantu yang menghormati ahli keluarga',relationship_refusal:'mempraktikkan ayat tegas, beredar ke tempat selamat dan memberitahu orang dewasa yang dipercayai',healthy_relationships:'memadankan hubungan sihat dengan etika komunikasi yang sesuai',disease_prevention:'memilih dan menunjukkan amalan kebersihan yang dapat mengurangkan penyebaran penyakit',germ_disease:'memadankan penyakit bawaan kuman dengan petunjuk umum dan langkah pencegahan',germ_spread:'menerangkan maksud kuman dan mengelaskan cara kuman boleh merebak',bullying_prevention:'mengenal pasti perlakuan buli dan menyusun tindakan berkata TIDAK, beredar serta mendapatkan bantuan',food_storage:'memilih cara menyimpan makanan dan minuman supaya bersih serta selamat',healthy_mealtimes:'menyusun pilihan makanan berkhasiat mengikut waktu makan yang sesuai',nutritious_food:'mengelaskan makanan berkhasiat dan memberikan sebab berdasarkan fungsi makanan',emergency_response:'mengenal pasti situasi kecemasan dan menyusun tindakan meminta bantuan dengan betul',smoke_refusal:'mempraktikkan urutan berkata TIDAK, beredar dan mendapatkan bantuan orang dewasa tanpa menggunakan bahan sebenar',self_confidence:'mengenal pasti amalan positif dan menerangkan bagaimana amalan itu membantu keyakinan diri',conflict_management:'mengenal pasti punca atau tanda konflik dan memilih langkah mengurusnya secara berhemah',mosquito_disease:'membandingkan maklumat penyakit bawaan nyamuk serta memilih tindakan mencegah pembiakan nyamuk',environmental_safety:'mengesan petunjuk ancaman dan memilih laluan atau tindakan selamat dalam situasi rekaan',nutritious_snacks:'menilai pilihan snek berdasarkan jenis makanan, keperluan dan pengambilan gula, garam serta lemak secara sederhana',minor_first_aid:'mengenal pasti kecederaan ringan dan menyusun tindakan mendapatkan bantuan serta bantu mula menggunakan bahan simulasi'}[pattern]||'melaksanakan tugasan kesihatan sebenar pada halaman sumber dan memberikan sebab bagi pilihan yang dibuat';return{support:`Dengan bimbingan guru, murid melaksanakan tugasan yang sama “${task}” pada ${page} menggunakan gambar, kata kunci dan dua pilihan jawapan. Murid ${focus}; situasi peribadi murid tidak diminta atau dikongsi.`,core:`Murid melaksanakan tugasan asal “${task}” pada ${page} secara berpasangan, memilih tindakan atau jawapan yang sesuai dan menyokong pilihan dengan satu bukti daripada halaman tersebut.`,challenge:`Selepas tugasan yang sama selesai, murid ${focus}, kemudian menjelaskan akibat dan tindakan susulan yang selamat tanpa mengubah Standard Pembelajaran atau mereka pengalaman peribadi.`}}
function sourceTaskKind(activities=[],subjectId=null){const science=scienceTaskPattern({subject_id:subjectId},activities);if(science)return'science';if(isPhysicalEducationSubject(subjectId))return'physical';if(isHealthEducationSubject(subjectId))return'health';if(isIslamicEducationSubject(subjectId))return'islamic';if(isArabicLanguageSubject(subjectId))return'arabic';const hay=normKey(activities.join(' '));if(/simulasi|lakon|dialog|bertutur|bercerita|respons|soalan bercapah/.test(hay))return'oral';if(/baca|membaca|petikan|idea utama|idea sampingan|isi tersurat|isi tersirat/.test(hay))return'reading';if(/tulis|menulis|bina ayat|membina ayat|catat|karangan|imlak|salin/.test(hay))return'writing';if(/kata kerja|kata nama|kata adjektif|kata majmuk|kata ganda|ayat tunggal|ayat majmuk|tatabahasa|kenal pasti|padan/.test(hay))return'language';if(/lagu|nyanyi|pantun|sajak|persembah|cerita haiwan|cerita jenaka/.test(hay))return'arts';if(/poster|peta minda|lukis|hasilkan|bina model/.test(hay))return'product';return'general'}
function recentPak21(subjectId,classId,limit=6){
  return state.rphRecords
    .filter(x=>x.subject_id===subjectId&&(!classId||x.class_id===classId))
    .slice(0,limit)
    .map(x=>x.rph_json?.pak21)
    .filter(Boolean);
}

function chooseSourcePak21(kind,map,classId){
  const pools={
    oral:['Role Play','Rally Robin','Think-Pair-Share','Hot Seat'],
    reading:['Pair Reading','Jigsaw Reading','Evidence Hunt','Think-Pair-Share'],
    writing:['Think-Write-Pair-Share','Peer Review','Round Table','Gallery Walk'],
    language:['Card Sort','Pair Check','Word Hunt','Quiz-Quiz-Trade'],
    arts:['Performance Circle','Gallery Walk','Round Robin'],
    product:['Gallery Walk','Team Presentation','Peer Review'],
    science:['Think-Pair-Share','Evidence Hunt','Round Robin','Gallery Walk'],
    physical:['Demonstrate-Practise-Check','Skill Stations','Team Challenge','Peer Coaching'],
    health:['Scenario Sort','Think-Pair-Share','Decision Cards','Round Robin'],
    islamic:['Talaqqi Musyafahah','Pair Check','Think-Pair-Share','Round Robin'],
    arabic:['Listen-and-Repeat','Pair Check','Matching Game','Round Robin'],
    general:['Think-Pair-Share','Round Robin','Pair Check','Gallery Walk']
  };

  const pool=pools[kind]||pools.general;
  const recent=new Set(recentPak21(map.subject_id,classId));
  const fresh=pool.filter(x=>!recent.has(x));
  const choices=fresh.length?fresh:pool;

  const seed=`${map.source_evidence?.meta?.main_sp||map.sp}|${map.textbook_page_start||0}|${map.session_no||1}`;
  let n=0;
  for(const c of seed)n=(n*31+c.charCodeAt(0))>>>0;

  return choices[n%choices.length];
}

function recentRphInductionKeys(subjectId,classId,limit=6){
  return new Set(
    state.rphRecords
      .filter(x=>x.subject_id===subjectId&&(!classId||x.class_id===classId))
      .sort((a,b)=>String(b.lesson_date||'').localeCompare(String(a.lesson_date||'')))
      .slice(0,limit)
      .map(x=>x.rph_json?.induction_key)
      .filter(Boolean)
  );
}

function pickLibraryInduction(subjectId,map,activities,classId=null){
  const subjectKey=rphSubjectKey(subjectId);
  const skillKey=rphSkillKey(map,activities);
  const subskillKey=rphSubskillKey(map,activities);
  const year=Number(getClass(classId)?.year||map.year||1);
  const hay=normKey(`${map.title||''} ${map.objective||''} ${map.success_criteria||''} ${activities.join(' ')}`);
  const avoid=recentRphInductionKeys(subjectId,classId);

  let rows=state.rphInductionLibrary
    .filter(x=>x.subject_key===subjectKey)
    .filter(x=>x.skill_key===skillKey||x.skill_key==='general')
    .filter(x=>year>=Number(x.year_min||1)&&year<=Number(x.year_max||6));

  const exactSub=rows.filter(x=>x.subskill_key===subskillKey);
  const generalSub=rows.filter(x=>(x.subskill_key||'general')==='general');

  // An induction is a source-aware entry routine, so a general induction is
  // safe as a variation alongside a matching subskill—not a replacement for
  // the mapped source task that follows.
  rows=exactSub.length ? [...exactSub,...generalSub] : generalSub;

  if(!rows.length)return null;

  rows=rows.map(x=>{
    const keys=[...(x.objective_keywords||[]),...(x.source_keywords||[])];
    const match=keys.filter(k=>hay.includes(normKey(k))).length;
    return {...x,_score:match*20+Number(x.selection_weight||100)-Number(x.priority||100)};
  }).sort((a,b)=>b._score-a._score);

  const fresh=rows.filter(x=>!avoid.has(x.induction_key));
  const pool=(fresh.length?fresh:rows).slice(0,Math.min(4,rows.length));
  const seed=`${map.id||''}|${map.session_no||1}|${map.textbook_page_start||0}|induction`;

  return pool[rphActivityHash(seed)%pool.length]||null;
}

function rphTaskProfile(map,activities=[]){
  const subskill=rphSubskillKey(map,activities);
  const skill=rphSkillKey(map,activities);
  if(isScienceSubject(map.subject_id))return `science:${map.source_evidence?.meta?.science_task_pattern||scienceTaskPattern(map,activities)||'general'}`;
  if(isPhysicalEducationSubject(map.subject_id))return `physical:${physicalEducationPattern(map,activities)||'general'}`;
  if(isHealthEducationSubject(map.subject_id))return `health:${healthEducationPattern(map,activities)||'general'}`;
  if(isArabicLanguageSubject(map.subject_id))return `arabic:${arabicLanguagePattern(map,activities)||'general'}`;
  if(subskill==='nyanyian')return'song';
  if(subskill==='pantun'||subskill==='sajak')return'poetry';
  if(subskill==='dialog'||subskill==='lakonan')return'dialogue';
  if(subskill==='cerita')return'story';
  if(skill==='writing_sentence')return'writing';
  if(skill==='grammar')return'grammar';
  if(skill==='reading')return'reading';
  if(skill==='listening_speaking')return'oral';
  return'general';
}

function rphInductionText(row,map,activities=[],page='',uiEn=false){
  const profile=rphTaskProfile(map,activities);
  const variant=rphActivityHash(`${row?.induction_key||''}|${map.session_no||1}`)%2;
  const ms={
    song:[
      `Guru memainkan atau membacakan satu baris pendek daripada lagu/chant pada ${page}. Murid menepuk rentak dan menyebut semula bunyi atau perkataan yang didengar sebelum aktiviti utama bermula.`,
      `Guru memaparkan perkataan penting daripada lagu/chant pada ${page}. Murid meneka perkataan yang mungkin didengar, kemudian menyemak jawapan apabila guru memainkan atau membacakan petikan ringkas.`
    ],
    poetry:[
      `Guru membacakan dua baris awal daripada bahan pada ${page} dengan intonasi yang jelas. Murid memilih perkataan atau gambaran yang menarik perhatian mereka dan berkongsi dengan pasangan.`,
      `Guru memaparkan satu perkataan atau frasa daripada bahan pada ${page}. Murid membuat jangkaan tentang maksud atau suasana bahan sebelum membacanya bersama-sama.`
    ],
    dialogue:[
      `Guru membacakan satu ujaran ringkas daripada dialog pada ${page} dengan dua intonasi berbeza. Murid memilih respons yang sesuai dan menyebutnya bersama pasangan.`,
      `Guru memaparkan situasi ringkas daripada ${page}. Murid berbincang dengan pasangan tentang ungkapan yang sesuai sebelum meneliti dialog asal.`
    ],
    story:[
      `Guru menunjukkan tajuk atau ayat pembuka cerita pada ${page}. Murid membuat satu ramalan tentang watak atau peristiwa, kemudian memberikan sebab ringkas.`,
      `Guru membaca permulaan cerita pada ${page} dan berhenti pada satu bahagian penting. Murid berbincang dengan pasangan tentang perkara yang mungkin berlaku seterusnya.`
    ],
    writing:[
      `Guru memaparkan contoh ayat atau perkataan penting daripada ${page}. Murid menyebut perkataan penting dan menyusun dua kad perkataan untuk membina idea awal.`,
      `Guru menunjukkan satu ayat yang belum lengkap berdasarkan ${page}. Murid mencadangkan perkataan yang sesuai, kemudian guru mengaitkannya dengan ayat yang akan dibina.`
    ],
    grammar:[
      `Guru memaparkan dua contoh bahasa daripada ${page}. Murid mengangkat kad untuk memilih contoh yang mempunyai bentuk bahasa sasaran, kemudian menerangkan pilihan mereka secara ringkas.`,
      `Guru menulis dua perkataan atau frasa daripada ${page}. Murid berbincang dengan pasangan tentang persamaan atau perbezaannya sebelum mengenal pasti fokus bahasa hari ini.`
    ],
    reading:[
      `Guru memaparkan tajuk atau dua kata kunci daripada ${page}. Murid membuat jangkaan tentang isi bahan dan mencari bukti apabila membaca.`,
      `Guru memilih satu ayat pendek daripada ${page}. Murid membaca secara berpasangan dan menandakan perkataan yang membantu mereka memahami maksudnya.`
    ],
    oral:[
      `Guru membacakan satu situasi atau ujaran daripada ${page}. Murid menyebut satu respons lisan yang sesuai kepada pasangan sebelum berkongsi dengan kelas.`,
      `Guru menyebut satu ungkapan daripada ${page}. Murid mengulanginya dengan intonasi yang sesuai dan memilih respons yang sepadan daripada kad ujaran.`
    ],
    general:[]
  };
  const en={
    song:[
      `The teacher plays or reads one short line from the song or chant on ${page}. Pupils clap the beat and echo the sounds or words they hear before the main task begins.`,
      `The teacher shows a key word from the song or chant on ${page}. Pupils predict what they may hear, then check their ideas after a short extract is played or read.`
    ],
    poetry:[
      `The teacher reads two opening lines from the text on ${page} with clear expression. Pupils choose one word or image that stands out and share it with a partner.`,
      `The teacher shows one word or phrase from the text on ${page}. Pupils predict its meaning or mood before reading the text together.`
    ],
    dialogue:[
      `The teacher reads one short line from the dialogue on ${page} using two different tones. Pupils choose a suitable response and practise it with a partner.`,
      `The teacher shows a short situation from ${page}. Pupils discuss a suitable expression with a partner before examining the original dialogue.`
    ],
    story:[
      `The teacher shows the story title or opening line on ${page}. Pupils make one prediction about a character or event and give a brief reason.`,
      `The teacher reads the opening of the story on ${page} and pauses at a key moment. Pupils discuss with a partner what might happen next.`
    ],
    writing:[
      `The teacher shows a model sentence or key words from ${page}. Pupils name key words and arrange two word cards to form an initial idea.`,
      `The teacher shows an incomplete sentence based on ${page}. Pupils suggest a suitable word before the teacher links it to the sentence-building task.`
    ],
    grammar:[
      `The teacher shows two language examples from ${page}. Pupils hold up a card to choose the example with the target language form, then give a brief reason.`,
      `The teacher writes two words or phrases from ${page}. Pupils discuss one similarity or difference before identifying the language focus for the lesson.`
    ],
    reading:[
      `The teacher shows the title or two key words from ${page}. Pupils predict what the text is about and look for evidence when they read.`,
      `The teacher selects one short sentence from ${page}. Pupils read it with a partner and underline the words that help them understand its meaning.`
    ],
    oral:[
      `The teacher reads a situation or expression from ${page}. Pupils give one suitable spoken response to a partner before sharing with the class.`,
      `The teacher says one expression from ${page}. Pupils repeat it with suitable intonation and choose a matching situation card.`
    ],
    general:[]
  };
  if(profile.startsWith('science:')){
    const pattern=profile.split(':')[1];
    const action={observe:['meneliti bahan sains pada halaman tersebut dengan teliti','examine the science material on the page closely'],identify:['mengenal pasti ciri penting pada bahan yang dipaparkan','identify a key feature in the displayed material'],classify:['mengelaskan dua contoh menggunakan kad kategori','sort two examples using category cards'],compare:['membandingkan dua contoh dan menyatakan satu perbezaan','compare two examples and state one difference'],measure:['membuat anggaran ukuran sebelum menyemak dengan alat atau skala','estimate a measurement before checking it with a tool or scale'],investigate:['menyatakan apa yang mungkin berlaku dalam penyiasatan','state what may happen in the investigation'],record_data:['membaca satu jadual kosong dan meramalkan data yang perlu direkodkan','look at an empty table and predict what data will be recorded'],infer:['memilih satu bukti yang boleh membantu membuat inferens','choose one piece of evidence that could support an inference'],predict:['membuat satu ramalan dan memberi sebab','make one prediction and give a reason']}[pattern]||['meneliti bahan sains pada halaman tersebut dan berkongsi satu idea awal','examine the science material on the page and share one initial idea'];
    return uiEn?`The teacher displays the material on ${page}. Pupils ${action[1]}, then compare their ideas with a partner before the source task begins.`:`Guru memaparkan bahan pada ${page}. Murid ${action[0]}, kemudian membandingkan idea dengan pasangan sebelum tugasan sumber dimulakan.`;
  }
  if(profile.startsWith('physical:')){
    const pattern=profile.split(':')[1];
    const action={body_awareness:'membentuk satu posisi tubuh dan menyebut bahagian badan yang menjadi tapak sokongan',space_awareness:'menunjukkan ruang diri dengan mendepakan tangan dan memilih aras pergerakan yang selamat',direction_signal:'memadankan kad arah dengan satu pergerakan kecil mengikut isyarat guru',pathway_speed:'menjejak laluan lurus, berlengkok, spiral atau zig-zag dengan jari sebelum bergerak',force_control:'membezakan satu lakuan ringan dan satu lakuan berat melalui demonstrasi terkawal',locomotor:'memadankan kad berjalan, berlari, melompat, mencongklang, menggelongsor atau berskip dengan aksi yang betul',jump_land:'meniru posisi mendarat dengan kedua-dua kaki dan lutut difleksi pada ruang sendiri',jump_rope:'menyusun peranan pemegang tali, pelompat dan pencatat kiraan sebelum mencuba',non_locomotor:'memilih satu aksi membongkok, mengayun, memusing, mengilas, meregang, menolak atau menarik tanpa berpindah tempat',throw_catch:'menunjukkan arah balingan dan posisi tangan sedia menangkap menggunakan pundi kacang',overarm_throw:'menunjukkan tangan membaling dan tangan bantuan sebelum membuat balingan',self_toss_catch:'membentuk jari dan tangan seperti mangkuk sebelum melambung bola ringan',kick_ball:'meletakkan kaki sokong di sisi bola dan menunjukkan arah tendangan tanpa menendang kuat',balloon_strike:'mengenal pasti titik sentuh pada belon dan memilih anggota atau alat pemukul yang selamat',foot_dribble:'menunjukkan bahagian dalam kaki dan laluan skital yang akan digunakan',hand_dribble:'menunjukkan sentuhan jari pada bola dan kawasan selamat untuk mengelecek',animal_movement:'memadankan satu gambar haiwan dengan aras, laluan dan pemindahan berat yang sesuai',aquatic_confidence:'menyusun kad peraturan kolam serta urutan masuk air, berdiri, berjalan, bobbing, apungan tiarap dan luncur di bawah pengawasan guru',creative_build:'meneliti bentuk contoh dan memilih bahan untuk membina objek yang stabil',core_stability:'mengenal pasti bahagian otot teras dan posisi mula bagi satu senaman terkawal',balance:'menunjukkan bentuk tapak sokongan yang stabil tanpa melakukan kemahiran penuh',spring_landing:'meniru posisi lutut dan tangan untuk pendaratan terkawal',rotation:'menyusun tiga kad fasa mula, putaran dan akhir',rhythmic_movement:'mengikut empat kiraan gerak asas tanpa bergerak jauh',invasion_game:'memilih ruang atau rakan sasaran bagi hantaran yang selamat',net_game:'menunjukkan posisi sedia dan arah pukulan menggunakan peralatan ringan',striking_fielding:'memilih kawasan sasaran serta posisi sedia sebelum memukul atau menangkap',running:'membezakan isyarat mula, perubahan kelajuan dan berhenti',jumping:'menandakan tempat lonjakan dan pendaratan yang selamat',throwing:'menunjukkan arah badan serta kawasan sasaran sebelum balingan',traditional_game:'mengenal pasti alatan dan satu peraturan keselamatan permainan',strategy_game:'merancang satu gerakan awal pada papan contoh',warmup_pulse:'membandingkan kadar nadi sebelum aktiviti melalui pemerhatian kendiri yang ringkas',cooldown_hydration:'memilih tindakan penyejukan badan dan pengambilan air yang betul',aerobic:'mengikut gerak aerobik mudah selama beberapa kiraan pada intensiti sederhana',flexibility:'membezakan regangan dinamik dan statik melalui demonstrasi guru',muscular_fitness:'menunjukkan posisi badan yang betul bagi satu latihan terkawal',growth_tracking:'mengenal pasti alat serta unit yang sesuai untuk merekod ketinggian dan berat'}[pattern]||'mengenal pasti aksi utama, alatan dan peraturan keselamatan daripada bahan yang dipaparkan';
    return `Guru menunjukkan gambar, alatan atau satu demonstrasi terkawal daripada ${page}. Murid ${action}, kemudian berkongsi satu petunjuk teknik atau keselamatan dengan pasangan sebelum aktiviti utama bermula.`;
  }
  if(profile.startsWith('health:')){
    const pattern=profile.split(':')[1];
    const action={personal_hygiene:'memadankan gambar mandi, mencuci tangan, memakai pakaian bersih dan memotong kuku dengan sebab kebersihannya',body_knowledge:'memadankan kad anggota tubuh dengan fungsi atau deria yang sesuai',family_boundaries:'mengelaskan dua kad situasi rekaan kepada tindakan selamat dan tindakan yang perlu dihentikan tanpa berkongsi pengalaman peribadi',personal_boundaries:'memilih kad tindakan berkata TIDAK, beredar dan memberitahu orang dewasa yang dipercayai',medicine_safety:'mengelaskan label dan gambar ubat kepada penggunaan atau penyimpanan yang betul dan selamat',needs_wants:'meletakkan dua kad barang dalam kategori keperluan atau kehendak dan memberikan sebab',emotion_management:'memadankan satu emosi dengan cara meluah atau mengurusnya secara sesuai',emotion_identification:'meneka emosi pada kad ekspresi dan menyatakan satu petunjuk yang dilihat',family_roles:'memadankan ahli keluarga atau penjaga dengan satu peranan harian',family_uniqueness:'memilih satu kad kebolehan atau minat untuk menerangkan keistimewaan watak rekaan',family_respect:'menyusun dua kad dialog kepada komunikasi yang sopan dan menghormati',relationship_refusal:'menyusun kad berkata TIDAK, beredar ke tempat selamat dan memberitahu orang dewasa yang dipercayai',healthy_relationships:'memadankan watak dengan satu etika perhubungan yang sesuai',disease_prevention:'memilih satu amalan kebersihan yang dapat mengurangkan penyebaran penyakit',germ_disease:'memadankan kad penyakit bawaan kuman dengan satu petunjuk umum',germ_spread:'mengelaskan gambar cara kuman merebak melalui sentuhan, udara, makanan atau minuman yang tercemar',bullying_prevention:'menyusun kad tindakan berkata TIDAK, beredar dan memaklumkan guru atau penjaga bagi situasi buli rekaan',food_storage:'memadankan makanan atau minuman dengan tempat penyimpanan yang bersih dan selamat',healthy_mealtimes:'menyusun kad sarapan, makan tengah hari dan makan malam mengikut waktu',nutritious_food:'memilih dua gambar makanan berkhasiat dan memberikan satu sebab',emergency_response:'memadankan satu situasi kecemasan rekaan dengan orang dewasa atau perkhidmatan bantuan yang sesuai',smoke_refusal:'menyusun tiga kad tindakan menolak pelawaan, beredar dan mendapatkan bantuan orang dewasa',self_confidence:'memilih satu amalan positif yang boleh membantu melaksanakan tugasan dengan yakin',conflict_management:'memadankan satu situasi konflik rekaan dengan respons yang sopan dan berhemah',mosquito_disease:'memadankan gambar nyamuk, petunjuk penyakit dan satu tindakan pencegahan',environmental_safety:'mengenal pasti satu petunjuk ancaman dan menunjuk kad tindakan selamat',nutritious_snacks:'mengelaskan gambar snek dan memberikan satu sebab bagi pilihan berkhasiat tanpa membandingkan tubuh murid',minor_first_aid:'memadankan gambar kecederaan ringan dengan tindakan meminta bantuan atau bahan bantu mula yang sesuai'}[pattern]||'meneliti bahan kesihatan dan memilih satu tindakan yang selamat';
    return `Guru memaparkan satu gambar atau kad situasi rekaan berdasarkan ${page}. Murid ${action}, kemudian menyemak alasan bersama pasangan sebelum tugasan Buku Teks dimulakan.`;
  }
  const pool=(uiEn?en:ms)[profile]||[];
  return pool[variant]||sourceSetInduction(map,page,map.title||'',uiEn);
}

function renderLibraryInduction(row,map,activities=[],page=''){
  if(!row)return null;
  const uiEn=lessonLanguage(map.subject_id)==='en';
  const raw=String(row.induction_template||'');
  const generic=/mapped|dipadankan|source task|tugasan sumber/i.test(raw);
  return {
    key:row.induction_key,
    name:row.induction_name,
    text:generic?rphInductionText(row,map,activities,page,uiEn):raw.replaceAll('{{topic}}',map.title||'tajuk pembelajaran').replaceAll('{{page}}',page||''),
    bbm:generic?(uiEn?`Student’s Book ${page}, response cards`:`Buku Teks ${page}, kad respons`):(row.bbm_template||''),
    pak21:row.pak21||''
  };
}

function sourceSetInduction(map,page,topic,uiEn){
  const seed=`${map.source_evidence?.meta?.main_sp||map.sp}|${map.textbook_page_start||0}|${map.session_no||1}`;
  let n=0;for(const c of seed)n=(n*31+c.charCodeAt(0))>>>0;
  const ms=[
    `Guru memaparkan bahan utama pada ${page}. Murid memerhati dan menyatakan perkara yang mereka nampak atau faham sebelum guru mengaitkannya dengan tajuk “${topic}”.`,
    `Guru meminta murid meneliti ${page} seketika tanpa menerangkan isi pelajaran. Murid berbincang dengan pasangan tentang maklumat yang mereka jangka akan dipelajari.`,
    `Guru memilih satu contoh, perkataan atau bahagian penting daripada ${page}. Murid memberikan respons awal dan guru menghubungkan jawapan mereka dengan fokus “${topic}”.`
  ];
  const en=[
    `The teacher displays the main material on ${page}. Pupils observe it and share what they notice before the teacher links their responses to “${topic}”.`,
    `Pupils examine ${page} briefly before the lesson is explained. They discuss with a partner what they think they are going to learn.`,
    `The teacher highlights one example, key word or key part from ${page}. Pupils give an initial response before it is linked to the focus “${topic}”.`
  ];
  return (uiEn?en:ms)[n%3];
}

function sourceClosure(map,page,topic,uiEn){
  const seed=`${map.source_evidence?.meta?.main_sp||map.sp}|${map.textbook_page_start||0}|${map.session_no||1}|closure`;
  let n=0;for(const c of seed)n=(n*31+c.charCodeAt(0))>>>0;

  const ms=[
    `Murid menyatakan satu perkara yang dipelajari daripada tugasan pada ${page}. Guru memilih beberapa respons untuk merumuskan fokus “${topic}”.`,
    `Murid membandingkan jawapan akhir dengan pasangan dan membetulkan satu kesilapan jika ada. Guru kemudian merumuskan isi utama berdasarkan SP yang dipelajari.`,
    `Murid memberikan satu contoh atau jawapan daripada aktiviti pada ${page} sebagai bukti pembelajaran. Guru membuat rumusan ringkas dan memberi maklum balas akhir.`
  ];

  const en=[
    `Pupils state one thing they learned from the task on ${page}. The teacher uses selected responses to recap the focus “${topic}”.`,
    `Pupils compare their final responses with a partner and correct one error if necessary. The teacher then summarises the key learning linked to the Learning Standard.`,
    `Pupils give one example or response from the task on ${page} as evidence of learning. The teacher gives a short recap and final feedback.`
  ];

  return (uiEn?en:ms)[n%3];
}

function rphSubjectKey(subjectId){
  const sub=getSubject(subjectId);
  const k=normKey(`${sub?.code||''} ${sub?.name||''}`);
  if(/bahasa melayu|\bbm\b/.test(k))return'bm';
  if(/english|bahasa inggeris|\bbi\b/.test(k))return'en';
  if(/\bsains\b|\bscience\b/.test(k))return'science';
  if(/\bpendidikan jasmani\b|\bphysical education\b|\bpj\b/.test(k))return'pe';
  if(/\bpendidikan kesihatan\b|\bhealth education\b|\bpk\b/.test(k))return'health';
  if(/\bpendidikan islam\b|\bpendidikan agama islam\b|\bp islam\b|\bpai\b|\bpi\b/.test(k))return'islamic_education';
  if(/\bbahasa arab\b|\barabic(?: language)?\b|\bb arab\b|\bba\b/.test(k))return'arabic_language';
  return'general';
}

function rphSkillKey(map,activities=[]){
  const k=normKey(`${map.objective||''} ${map.success_criteria||''} ${map.title||''} ${activities.join(' ')}`);

  if(isScienceSubject(map?.subject_id))return'science';
  if(isPhysicalEducationSubject(map?.subject_id))return'physical_education';
  if(isHealthEducationSubject(map?.subject_id))return'health_education';
  if(isIslamicEducationSubject(map?.subject_id))return'islamic_education';
  if(isArabicLanguageSubject(map?.subject_id))return'arabic_language';

  if(/membina ayat|menulis ayat|bina ayat|write sentence|construct sentence/.test(k))
    return'writing_sentence';

  if(/language arts|literary|poem|rhyme|song|chant|role play|drama|storytelling|respond imaginatively|personal response/.test(k))
    return'language_arts';

  if(/mendengar|bertutur|berdialog|bercerita|memberikan respons|speaking|listening|dialogue/.test(k))
    return'listening_speaking';

  if(/pantun|sajak|syair|seni bahasa|lakon|nyanyian|cerita kreatif/.test(k))
    return'language_arts';

  if(/membaca|memahami petikan|bacaan|reading|read/.test(k))
    return'reading';

  if(/kata nama|kata kerja|kata adjektif|kata ganda|kata majmuk|tatabahasa|mengelaskan/.test(k))
    return'grammar';

  if(/menghasilkan|membuat|mencipta|model|projek|produk/.test(k))
    return'product_project';

  return'general';
}

const ISLAMIC_EDUCATION_PATTERNS=[
  ['quran_tilawah_annas',/surah an nas|سورة الناس/],
  ['quran_tilawah_alfalaq',/surah al falaq|سورة الفلق/],
  ['quran_hifz_annas',/hafaz.*an nas|حفظ.*الناس/],
  ['quran_hifz_alfalaq',/hafaz.*al falaq|حفظ.*الفلق/],
  ['quran_mad_asli',/mad asli|مد اصلي/],
  ['quran_nun_mim_syaddah',/nun.*mim.*syaddah|نون.*ميم.*شدة/],
  ['akidah_sifat_allah',/sifat.*allah|صفت.*الله/],
  ['akidah_ahad_samad',/al ahad|as samad|الأحد|الصمد/],
  ['akidah_malaikat',/malaikat|ملائكة/],
  ['ibadah_istinja',/istinja|استنجاء/],
  ['ibadah_syarat_solat',/syarat.*solat|شرط.*صلاة/],
  ['ibadah_bacaan_wajib',/bacaan wajib.*solat|باچاءن واجب.*صلاة/],
  ['ibadah_bacaan_sunat',/bacaan.*sunat.*solat|باچاءن.*سنة.*صلاة/],
  ['sirah_belah_dada',/belah dada|ممبله دادا/],
  ['sirah_amanah',/amanah.*nabi|امانه.*نبي/],
  ['sirah_sahabat',/sahabat.*nabi|صحابت.*نبي/],
  ['adab_makan_minum',/adab.*makan.*minum|ادب.*ماكن.*مينوم/],
  ['adab_bersahabat',/adab.*bersahabat|ادب.*برصحابت/],
  ['adab_berdoa',/adab.*berdoa|ادب.*بردعاء/],
  ['adab_cinta_rasul',/mengasihi.*rasul|مغاسيهي.*رسول/],
  ['jawi_multisyllable',/tiga suku kata|تيݢ سوكو كات/],
  ['jawi_word_phrases',/rangkai kata|رڠكاي كات/],
  ['jawi_short_text',/teks pendek|تيك س ڤينديق/]
];
const ISLAMIC_EDUCATION_YEAR3_PATTERNS=[
  ['quran_tilawah_alkafirun',/tilawah.*surah al[- ]?kafirun|tilawah.*سورة الكافرون/],
  ['quran_tilawah_alasr',/tilawah.*surah al[- ]?asr|tilawah.*سورة العصر/],
  ['quran_hifz_alkafirun',/hafaz.*al[- ]?kafirun|حفظ.*الكافرون/],
  ['quran_hifz_alasr',/hafaz.*al[- ]?asr|حفظ.*العصر/],
  ['quran_kefahaman_alfatihah',/kefahaman.*al[- ]?fatihah|كفهمن.*الفاتحة/],
  ['quran_nun_sakinah_tanwin',/nun sakinah|nun mati|tanwin|نون ساكنة|تنوين/],
  ['hadith_young_old',/muda.*dikasihi.*tua.*dihormati|مودا.*دكاسيهي.*توا.*دحرمتي/],
  ['akidah_alim_hakim',/al alim|al hakim|العليم|الحكيم/],
  ['akidah_books',/beriman.*kitab|برايمان.*كتاب/],
  ['ibadah_hadas',/bersuci.*hadas|برسوچي.*حدث/],
  ['ibadah_solat_sempurna',/solat.*sempurna|صلاة.*سمفورنا/],
  ['ibadah_sunat_abad_haiat',/sunat.*ab.?ad.*hai.?at|سنة.*أبعاض.*هيئات/],
  ['sirah_wahyu',/wahyu.*teragung|وحي.*تراضوڠ/],
  ['sirah_tabligh',/sifat.*tabligh|صيفت.*تبليغ/],
  ['sirah_makkah',/masyarakat.*makkah|مشاركت.*مكة/],
  ['adab_sleep',/adab.*tidur|ادب.*تيدور/],
  ['adab_knowledge',/menuntut ilmu|ilmu.*dituntut|منونتوت.*علمو|علمو.*دتونتوت/],
  ['adab_gratitude',/bersyukur|mari.*bersyukur|برشكور/],
  ['adab_sunnah',/sunnah.*rasul|سنّة.*رسول/],
  ['jawi_prefixes',/imbuhan awalan|ايمبوهن اولن|اميبوهن اولن/],
  ['jawi_suffixes',/imbuhan akhiran|ايمبوهن اخيرن|اميبوهن اخيرن/],
  ['jawi_circumfixes',/imbuhan apitan|ايمبوهن افيتن|اميبوهن افيتن/]
];
function islamicEducationPattern(map,activities=[]){
  if(!isIslamicEducationSubject(map?.subject_id))return'';
  const year=Number(map?.year||0);
  const standardMaps={2:{
    '1.1':'quran_tilawah_annas','1.2':'quran_tilawah_alfalaq','1.3':'quran_hifz_annas','1.4':'quran_hifz_alfalaq','1.5':'quran_mad_asli','1.6':'quran_nun_mim_syaddah',
    '2.1':'akidah_sifat_allah','2.2':'akidah_ahad_samad','2.3':'akidah_malaikat',
    '3.1':'ibadah_istinja','3.2':'ibadah_syarat_solat','3.3':'ibadah_bacaan_wajib','3.4':'ibadah_bacaan_sunat',
    '4.1':'sirah_belah_dada','4.2':'sirah_amanah','4.3':'sirah_sahabat',
    '5.1':'adab_makan_minum','5.2':'adab_bersahabat','5.3':'adab_berdoa','5.4':'adab_cinta_rasul',
    '6.1':'jawi_multisyllable','6.2':'jawi_word_phrases','6.3':'jawi_short_text'
  },3:{
    '1.1':'quran_tilawah_alkafirun','1.2':'quran_tilawah_alasr','1.3':'quran_hifz_alkafirun','1.4':'quran_hifz_alasr','1.5':'quran_kefahaman_alfatihah','1.6':'quran_nun_sakinah_tanwin',
    '2.1':'hadith_young_old',
    '3.1':'akidah_alim_hakim','3.2':'akidah_books',
    '4.1':'ibadah_hadas','4.2':'ibadah_solat_sempurna','4.3':'ibadah_sunat_abad_haiat',
    '5.1':'sirah_wahyu','5.2':'sirah_tabligh','5.3':'sirah_makkah',
    '6.1':'adab_sleep','6.2':'adab_knowledge','6.3':'adab_gratitude','6.4':'adab_sunnah',
    '7.1':'jawi_prefixes','7.2':'jawi_suffixes','7.3':'jawi_circumfixes'
  }};
  const standardText=String(map.source_evidence?.meta?.main_sp||map.sp||map.sk||'');
  const standard=standardText.match(/\b([1-7]\.[1-6])(?:\.\d+)?\b/)?.[1];
  const standardMap=standardMaps[year]||{};
  if(standard&&standardMap[standard])return standardMap[standard];
  const raw=`${map.sk||''} ${map.sp||''} ${map.title||''} ${map.objective||''} ${map.success_criteria||''} ${activities.join(' ')}`.toLowerCase();
  const patterns=year===3?ISLAMIC_EDUCATION_YEAR3_PATTERNS:ISLAMIC_EDUCATION_PATTERNS;
  return patterns.find(([,re])=>re.test(raw))?.[0]||'general';
}

function moralEducationPattern(map,activities=[]){
  if(!isMoralEducationSubject(map?.subject_id))return'';
  const year=Number(map?.year||0);
  if(![1,2,3].includes(year))return'general';
  const prefix=`moral_y${year}_`;
  const standard=String(map.source_evidence?.meta?.main_sp||map.sp||map.sk||'').match(/\b((?:[1-9]|1[0-4])\.[1-5])(?:\.\d+)?\b/)?.[1];
  const unit=Number(standard?.split('.')[0]||0);
  const byUnit={1:'belief',2:'kindness',3:'responsibility',4:'gratitude',5:'courtesy',6:'self_respect',7:'self_love',8:'justice',9:'courage',10:'honesty',11:'diligence',12:'cooperation',13:'moderation',14:'tolerance'};
  if(byUnit[unit])return prefix+byUnit[unit];
  const raw=`${map.sk||''} ${map.sp||''} ${map.title||''} ${map.objective||''} ${map.success_criteria||''} ${activities.join(' ')}`.toLowerCase();
  const patterns=[
    ['belief',/pegangan hidup|agama atau kepercayaan|ajaran agama|kepercayaan kepada tuhan|perayaan warga sekolah|kepelbagaian perayaan/],
    ['kindness',/baik hati|bantuan secara ikhlas|bantuan kepada warga sekolah|bantuan kepada keluarga/],
    ['responsibility',/tanggungjawab/],
    ['gratitude',/terima kasih|berterima kasih|penghargaan/],
    ['courtesy',/budi bahasa|bersopan|hemah tinggi|beradab sopan/],
    ['self_respect',/hormati diri|menghormati diri|hormati semua|hormati keluarga|ahli keluarga|warga sekolah dan pelawat/],
    ['self_love',/sayangi diri|kasih sayang.*diri|keluarga bahagia|sekolah kebanggaanku|sayangi sekolah/],
    ['justice',/adil|keadilan/],
    ['courage',/berani|keberanian|maruah diri|hadapi cabaran/],
    ['honesty',/jujur|kejujuran/],
    ['diligence',/rajin|kerajinan/],
    ['cooperation',/kerjasama|bekerjasama/],
    ['moderation',/sederhana|kesederhanaan|tidak keterlaluan|amalan hidup di sekolah/],
    ['tolerance',/toleransi|bertolak ansur|bersabar/]
  ];
  const pattern=patterns.find(([,re])=>re.test(raw))?.[0];
  return pattern?prefix+pattern:'general';
}

function arabicLanguagePattern(map,activities=[]){
  if(!isArabicLanguageSubject(map?.subject_id))return'';
  const raw=`${map.sk||''} ${map.sp||''} ${map.title||''} ${map.objective||''} ${map.success_criteria||''} ${activities.join(' ')}`.toLowerCase();
  const year=Number(map?.year||0);
  const standard=String(map.source_evidence?.meta?.main_sp||map.sp||map.sk||'').match(/\b([1-3]\.[1-5])(?:\.\d+)?\b/)?.[1];
  if(year===3){
    if(/nombor\s*(?:21|dua puluh satu).*31|21\s*[-–]\s*31|الأرقام|الأعداد|واحد وعشرون|إحدى وثلاثون/.test(raw))return'arabic_y3_numbers_21_31';
    if(/huruf fokus|fokus huruf|suku kata|kedudukan huruf/.test(raw))return'arabic_y3_focused_letters';
    if(/تفضل.*إلى.*الفصل|bilik darjah|dalam kelas|مقعد|سبورة|مكتب/.test(raw))return'arabic_y3_classroom';
    if(/ملابسي.*الجميلة|pakaian|قميص|سروال|فستان|حذاء/.test(raw))return'arabic_y3_clothes';
    if(/الألوان.*حولنا|warna|ما لون|أحمر|أزرق|أخضر|أصفر/.test(raw))return'arabic_y3_colours';
    if(/الوقت.*كالذهب|masa|waktu|hari dalam seminggu|صباح|مساء|اليوم|غد|أمس/.test(raw))return'arabic_y3_time';
    if(['1.5','2.5','3.5'].includes(standard))return'arabic_y3_numbers_21_31';
    if(['1.1','1.2','2.1','2.2','3.1','3.2'].includes(standard))return'arabic_y3_focused_letters';
    return'general';
  }
  if(year===2){
    if(/nombor\s*(?:11|sebelas).*20|11\s*[-–]\s*20|الأرقام|الأعداد|عشرون|harga/.test(raw))return'arabic_y2_numbers_11_20';
    if(/huruf fokus|fokus huruf|suku kata|kedudukan huruf/.test(raw))return'arabic_y2_focused_letters';
    if(/هيا.*نتعارف|suai kenal|pengenalan diri|ما اسمك|كم عمرك|أين تسكن/.test(raw))return'arabic_y2_acquaintance';
    if(/أحب.*أسرتي|keluarga|ahli keluarga|من هذا|من هذه/.test(raw))return'arabic_y2_family';
    if(/جسمي.*السليم|anggota badan|badan|هذا عين|هذه أذن/.test(raw))return'arabic_y2_body';
    if(/أحافظ.*الأدوات.*الدراسية|alat persekolahan|alat tulis|قلم|كتاب|دفتر|مسطرة/.test(raw))return'arabic_y2_school_tools';
    if(['1.5','2.5','3.5'].includes(standard))return'arabic_y2_numbers_11_20';
    if(['1.1','1.2','2.1','2.2','3.1','3.2'].includes(standard))return'arabic_y2_focused_letters';
    return'general';
  }
  if(/كيف.*نحيي.*نرحب|تحيات|ترحيبات|ucapan|salam|selamat datang/.test(raw))return'arabic_y1_greetings';
  if(/نمرح.*بالأرقام|ارقام|أرقام|nombor|membilang|1\s*[-–]\s*10/.test(raw))return'arabic_y1_numbers_1_10';
  if(/هيا.*نركز|fokus huruf|kedudukan huruf|suku kata/.test(raw))return'arabic_y1_focused_letters';
  if(/هيا.*نتعرف.*الحروف|huruf hijaiyah|huruf arab|dengar.*sebut.*huruf|salin.*huruf/.test(raw))return'arabic_y1_alphabet';
  if(['1.4','2.4'].includes(standard))return'arabic_y1_greetings';
  if(['1.5','2.5','3.4'].includes(standard))return'arabic_y1_numbers_1_10';
  if(['1.2','2.2','2.3','3.2'].includes(standard))return'arabic_y1_focused_letters';
  if(['1.1','2.1','3.1'].includes(standard))return'arabic_y1_alphabet';
  return'general';
}

function rphSubskillKey(map,activities=[]){
  const k=normKey(`${map.title||''} ${map.objective||''} ${map.success_criteria||''} ${activities.join(' ')}`);

  // Science patterns are metadata for selecting a delivery wrapper.  The
  // underlying textbook task remains the fixed source-task anchor.
  const sciencePattern=scienceTaskPattern(map,activities);
  if(sciencePattern)return sciencePattern;
  const pePattern=physicalEducationPattern(map,activities);
  if(pePattern)return pePattern;
  const healthPattern=healthEducationPattern(map,activities);
  if(healthPattern)return healthPattern;
  const islamicPattern=islamicEducationPattern(map,activities);
  if(islamicPattern)return islamicPattern;
  const moralPattern=moralEducationPattern(map,activities);
  if(moralPattern)return moralPattern;
  const arabicPattern=arabicLanguagePattern(map,activities);
  if(arabicPattern)return arabicPattern;

  if(/pantun/.test(k))return'pantun';
  if(/sajak|puisi|poem|rhyme/.test(k))return'sajak';
  if(/lakon|lakonan|role play|roleplay|drama/.test(k))return'lakonan';
  if(/dialog|berdialog|perbualan|dialogue/.test(k))return'dialog';
  if(/cerita|bercerita|jalan cerita|watak|story|storytelling/.test(k))return'cerita';
  if(/nyanyian|lagu|menyanyi|song|chant/.test(k))return'nyanyian';

  return'general';
}

function rphLibraryCandidates(subjectKey,skillKey,subskillKey,levelKey,year=1){
  const subjectRows=state.rphActivityLibrary
    .filter(x=>x.subject_key===subjectKey)
    .filter(x=>year>=Number(x.year_min||1)&&year<=Number(x.year_max||6));

  const exactSkill=subjectRows.filter(x=>x.skill_key===skillKey);
  const generalSkill=subjectRows.filter(x=>x.skill_key==='general');
  let rows=exactSkill.length ? [...exactSkill,...generalSkill] : generalSkill;

  // Keep the source-relevant skill/subskill first, but retain general
  // delivery wrappers as extra candidates. They only change how the mapped
  // source task is run; they never replace the source task itself.
  const exactSub=rows.filter(x=>x.subskill_key===subskillKey);
  const generalSub=rows.filter(x=>(x.subskill_key||'general')==='general');
  rows=exactSub.length ? [...exactSub,...generalSub] : generalSub;

  const exactLevel=rows.filter(x=>x.level_key===levelKey);
  const shared=rows.filter(x=>x.level_key==='all');

  return [...exactLevel,...shared]
    .filter((x,i,a)=>a.findIndex(y=>y.activity_key===x.activity_key)===i)
    .sort((a,b)=>(a.priority||100)-(b.priority||100));
}

function recentRphLibraryKeys(subjectId,classId,limit=6){
  const rows=state.rphRecords
    .filter(x=>x.subject_id===subjectId&&(!classId||x.class_id===classId))
    .sort((a,b)=>String(b.lesson_date||'').localeCompare(String(a.lesson_date||'')))
    .slice(0,limit);

  return new Set(
    rows.flatMap(x=>x.rph_json?.activity_library_keys||[])
      .filter(Boolean)
  );
}

function rphActivityTypesFromSteps(librarySteps){
  if(!librarySteps)return [];

  const steps=[
    ...(librarySteps.support||[]),
    ...(librarySteps.core||[]),
    ...(librarySteps.challenge||[])
  ].filter(x=>x?.key&&!String(x.key).startsWith('source-'));

  return [...new Set(
    steps.map(step=>step.activity_type||
      state.rphActivityLibrary.find(
        x=>x.activity_key===step.key
      )?.activity_type
    ).filter(Boolean)
  )];
}

function recentRphLibraryTypes(subjectId,classId,limit=5){
  const rows=state.rphRecords
    .filter(x=>x.subject_id===subjectId&&(!classId||x.class_id===classId))
    .sort((a,b)=>String(b.lesson_date||'').localeCompare(String(a.lesson_date||'')))
    .slice(0,limit);

  const types=[];

  rows.forEach(r=>{
    const saved=r.rph_json?.activity_library_types||[];

    if(saved.length){
      types.push(...saved);
      return;
    }

    const keys=r.rph_json?.activity_library_keys||[];

    keys.forEach(key=>{
      const hit=state.rphActivityLibrary.find(
        x=>x.activity_key===key
      );

      if(hit?.activity_type)
        types.push(hit.activity_type);
    });
  });

  return new Set(types.filter(Boolean));
}

function rphActivityHash(v=''){
  let n=0;
  for(const c of String(v))n=(n*31+c.charCodeAt(0))>>>0;
  return n;
}

function rphLibraryRelevance(row,relevanceText=''){
  const hay=normKey(relevanceText);
  if(!hay)return 0;
  const keywords=[
    ...(Array.isArray(row.objective_keywords)?row.objective_keywords:[]),
    ...(Array.isArray(row.source_keywords)?row.source_keywords:[])
  ].map(normKey).filter(Boolean);
  return keywords.reduce((score,keyword)=>{
    if(hay.includes(keyword))return score+24;
    const tokens=keyword.split(/\s+/).filter(x=>x.length>=4);
    return score+tokens.filter(x=>hay.includes(x)).length*5;
  },0);
}

function rphPickActivity(rows,phases,seed,used=new Set(),avoid=new Set(),avoidTypes=new Set(),relevanceText=''){
  const available=rows.filter(x=>phases.includes(x.phase)&&!used.has(x.activity_key));
  if(!available.length)return null;

  const fresh=available.filter(x=>!avoid.has(x.activity_key));
  const pool=fresh.length?fresh:available;

  const varied=pool.filter(x=>{
    const type=String(x.activity_type||'').trim();

    return !type||(
      !avoidTypes.has(type)&&
      !used.has(`type:${type}`)
    );
  });

  const choicePool=varied.length?varied:pool;

  const weighted=[...choicePool].sort((a,b)=>
    rphLibraryRelevance(b,relevanceText)-rphLibraryRelevance(a,relevanceText) ||
    Number(b.selection_weight||100)-Number(a.selection_weight||100) ||
    Number(a.priority||100)-Number(b.priority||100)
  );

  const top=weighted.slice(0,Math.min(4,weighted.length));
  return top[rphActivityHash(seed)%top.length]||null;
}

function rphBuildLibrarySteps(subjectId,map,activities,levelKey,classId=null,usedAcrossGroups=new Set()){
  const subjectKey=rphSubjectKey(subjectId);
  const skillKey=rphSkillKey(map,activities);
  const subskillKey=rphSubskillKey(map,activities);
  const year=Number(getClass(classId)?.year||map.year||1);
  const rows=rphLibraryCandidates(subjectKey,skillKey,subskillKey,levelKey,year);
  const avoid=recentRphLibraryKeys(subjectId,classId);
  const avoidTypes=recentRphLibraryTypes(subjectId,classId);
  const relevanceText=`${map.title||''} ${map.objective||''} ${map.success_criteria||''} ${activities.join(' ')}`;

  const phases={
    support:[
      ['input'],
      ['guided','practice'],
      ['game'],
      ['evidence','sharing']
    ],
    core:[
      ['input'],
      ['practice','guided'],
      ['game'],
      ['sharing','evidence']
    ],
    challenge:[
      ['input'],
      ['practice'],
      ['game'],
      ['sharing','evidence']
    ]
  }[levelKey]||[['input'],['practice'],['game'],['sharing']];

  const used=new Set(usedAcrossGroups);
  const out=[];
  const base=`${map.id||''}|${map.session_no||1}|${map.textbook_page_start||0}|${levelKey}`;

  const variation=rphActivityHash(`${base}|step-count`)%2;

  const maxLibrarySteps=
    levelKey==='support' ? 3 :
    levelKey==='core' ? 2+variation :
    levelKey==='challenge' ? 2+variation :
    2+variation;

  let phasePlan;

  if(skillKey==='reading'){
    if(levelKey==='support'){
      phasePlan=[
        ['input'],
        ['guided'],
        ['evidence']
      ];
    }else if(levelKey==='core'){
      phasePlan=maxLibrarySteps>=3
        ? [['practice'],['game'],['sharing']]
        : [['practice'],['sharing']];
    }else if(levelKey==='challenge'){
      phasePlan=maxLibrarySteps>=3
        ? [['practice'],['game'],['evidence','sharing']]
        : [['practice'],['evidence','sharing']];
    }else{
      phasePlan=phases.slice(0,maxLibrarySteps);
    }
  }else if(skillKey==='listening_speaking'){
    if(levelKey==='support'){
      phasePlan=[
        ['input'],
        ['guided'],
        ['game','evidence']
      ];
    }else if(levelKey==='core'){
      phasePlan=maxLibrarySteps>=3
        ? [['practice'],['game'],['sharing']]
        : [['practice'],['sharing']];
    }else if(levelKey==='challenge'){
      phasePlan=maxLibrarySteps>=3
        ? [['practice'],['game'],['evidence','sharing']]
        : [['practice'],['evidence','sharing']];
    }else{
      phasePlan=phases.slice(0,maxLibrarySteps);
    }
  }else if(skillKey==='writing_sentence'){
    if(levelKey==='support'){
      phasePlan=[
        ['input'],
        ['guided'],
        ['evidence']
      ];
    }else if(levelKey==='core'){
      phasePlan=maxLibrarySteps>=3
        ? [['practice'],['game'],['sharing']]
        : [['practice'],['sharing']];
    }else if(levelKey==='challenge'){
      phasePlan=maxLibrarySteps>=3
        ? [['practice'],['game'],['evidence']]
        : [['practice'],['evidence']];
    }else{
      phasePlan=phases.slice(0,maxLibrarySteps);
    }
  }else if(skillKey==='grammar'){
    if(levelKey==='support'){
      phasePlan=[
        ['input'],
        ['guided'],
        ['practice','evidence']
      ];
    }else if(levelKey==='core'){
      phasePlan=maxLibrarySteps>=3
        ? [['practice'],['game'],['sharing']]
        : [['practice'],['sharing']];
    }else if(levelKey==='challenge'){
      phasePlan=maxLibrarySteps>=3
        ? [['practice'],['game'],['evidence','sharing']]
        : [['practice'],['evidence','sharing']];
    }else{
      phasePlan=phases.slice(0,maxLibrarySteps);
    }
  }else if(skillKey==='product_project'){
    if(levelKey==='support'){
      phasePlan=[
        ['input'],
        ['guided'],
        ['evidence','sharing']
      ];
    }else if(levelKey==='core'){
      phasePlan=maxLibrarySteps>=3
        ? [['practice'],['game'],['sharing']]
        : [['practice'],['sharing']];
    }else if(levelKey==='challenge'){
      phasePlan=maxLibrarySteps>=3
        ? [['practice'],['game'],['evidence','sharing']]
        : [['practice'],['evidence','sharing']];
    }else{
      phasePlan=phases.slice(0,maxLibrarySteps);
    }
  }else if(levelKey==='support'){
    phasePlan=[
      ['input'],
      variation ? ['game'] : ['guided','practice'],
      ['evidence','sharing']
    ];
  }else if(levelKey==='core'){
    phasePlan=[
      ['practice','guided'],
      ...(maxLibrarySteps>=3
        ? [variation ? ['game'] : ['input']]
        : []),
      ['sharing','evidence']
    ];
  }else if(levelKey==='challenge'){
    phasePlan=[
      ['practice'],
      ...(maxLibrarySteps>=3 ? [['game']] : []),
      ['sharing','evidence']
    ];
  }else{
    phasePlan=phases.slice(0,maxLibrarySteps);
  }

  phasePlan.slice(0,maxLibrarySteps).forEach((group,i)=>{
    const row=rphPickActivity(
      rows,group,`${base}|${i}`,used,avoid,avoidTypes,relevanceText
    );

    if(row){
      used.add(row.activity_key);
      usedAcrossGroups.add(row.activity_key);

      if(row.activity_type){
        used.add(`type:${row.activity_type}`);
        usedAcrossGroups.add(`type:${row.activity_type}`);
      }

      out.push(row);
    }
  });

  return {subjectKey,skillKey,activities:out};
}

function rphBookStepLead(anchorText='',page='',uiEn=false,phase='practice'){
  const task=cleanSourceAnchor(anchorText).replace(/\s+/g,' ').trim();
  const short=task.length>115?task.slice(0,112).replace(/\s+\S*$/,'')+'…':task;
  const label=uiEn?`Student’s Book ${page||'source page'}`:`Buku Teks ${page||'halaman sumber'}`;
  if(!short)return uiEn?`The group follows the instruction on ${label}.`:`Kumpulan mengikuti arahan pada ${label}.`;
  const en={
    input:`The group starts with the instruction “${short}” on ${label}.`,
    guided:`The group continues the same instruction on ${label} with a partner.`,
    practice:`The group now completes the full instruction from ${label}.`,
    game:`After completing the instruction from ${label},`,
    evidence:`Using the completed ${label} task,`,
    sharing:`Using the completed ${label} task,`
  };
  const ms={
    input:`Kumpulan memulakan aktiviti dengan arahan “${short}” pada ${label}.`,
    guided:`Kumpulan meneruskan arahan yang sama pada ${label} bersama pasangan.`,
    practice:`Kumpulan kini melengkapkan keseluruhan arahan daripada ${label}.`,
    game:`Selepas melengkapkan arahan daripada ${label},`,
    evidence:`Berdasarkan tugasan ${label} yang telah dilengkapkan,`,
    sharing:`Berdasarkan tugasan ${label} yang telah dilengkapkan,`
  };
  return (uiEn?en:ms)[phase]||(uiEn?en.practice:ms.practice);
}

function rphPrintedPageNumber(page=''){
  const m=String(page||'').match(/\d{1,3}/);
  return m?Number(m[0]):null;
}

// A small, verified visual-context registry for scanned textbook pages whose
// printed prompt refers to a picture but OCR cannot describe the picture.
// Each entry is based on a page that has been visually checked.  It enriches
// the classroom script; it never changes the RPT, SK/SP or source task.
function rphVerifiedVisualContext(map,anchorText='',page='',uiEn=false){
  const pg=rphPrintedPageNumber(page);
  const year=Number(map?.year||0);
  const hay=normKey(`${map?.title||''} ${map?.objective||''} ${map?.success_criteria||''} ${anchorText||''}`);

  if(isScienceSubject(map?.subject_id)&&year===1&&pg===81&&/(?:bumi|unit 9|perhatikan.*gambar|observe.*picture)/.test(hay)){
    const sourceText=uiEn
      ? 'Pupils examine the Earth landscape photograph, identify visible features such as mountains, snow-covered areas, a waterfall, a river, rocks and plants, then record at least three observations in a “Feature - Evidence in the picture” table.'
      : 'Murid meneliti gambar landskap Bumi yang menunjukkan gunung, kawasan bersalji, air terjun, sungai, batuan dan tumbuhan. Murid mengenal pasti sekurang-kurangnya tiga ciri dan merekodnya dalam jadual “Ciri - Bukti dalam gambar”.';
    const names=uiEn?{
      input:'Look, Point and Name',guided:'Guided Earth Feature Hunt',practice:'Record Earth Observations',game:'Earth Feature Trail',evidence:'Evidence from the Picture',sharing:'Share Earth Findings'
    }:{
      input:'Lihat, Tunjuk dan Sebut',guided:'Cari Ciri Bumi Berpandu',practice:'Rekod Pemerhatian Bumi',game:'Jejak Ciri Bumi',evidence:'Bukti daripada Gambar',sharing:'Kongsi Dapatan Bumi'
    };
    const moves=uiEn?{
      input:'The teacher displays the photograph on Student’s Book p. 81. Pupils scan it from the upper part to the lower part, point to one visible feature and name it. Each pair agrees on three features before recording them.',
      guided:'Using word cards for mountain, waterfall, river, rocks and plants, pupils locate the matching feature in the photograph. They place each card beside the correct part of the page and say, “I can see …”.',
      practice:'Pupils study the photograph and complete a two-column table: “Feature” and “Evidence in the picture”. They record at least three features and describe the visible clue for each one.',
      game:'Groups play “Earth Feature Trail”. The teacher names or shows a feature card; one pupil points to it on p. 81, a second pupil names the visible clue, and a third records the group’s answer. A point is awarded only when the answer is supported by the photograph.',
      evidence:'Pupils select one entry from their table, point to the same feature in the photograph and explain the visual evidence that supports their observation.',
      sharing:'A representative presents three recorded features while pointing to them on p. 81. Other groups compare the list with their own table and add one accurate feature that was missed.'
    }:{
      input:'Guru memaparkan gambar pada Buku Teks m/s 81. Murid meneliti gambar dari bahagian atas ke bahagian bawah, menunjuk satu ciri yang kelihatan dan menamakannya. Setiap pasangan bersetuju tentang tiga ciri sebelum mencatat jawapan.',
      guided:'Murid menggunakan kad perkataan gunung, air terjun, sungai, batuan dan tumbuhan. Mereka mencari ciri yang sepadan dalam gambar, meletakkan kad berhampiran bahagian yang betul dan menyebut, “Saya dapat melihat …”.',
      practice:'Murid meneliti gambar dan melengkapkan jadual dua lajur, iaitu “Ciri” dan “Bukti dalam gambar”. Mereka merekod sekurang-kurangnya tiga ciri serta menerangkan petunjuk visual bagi setiap ciri.',
      game:'Kumpulan menjalankan permainan “Jejak Ciri Bumi”. Guru menyebut atau menunjukkan satu kad ciri; murid pertama menunjuk ciri itu pada m/s 81, murid kedua menyatakan bukti yang kelihatan dan murid ketiga merekod jawapan kumpulan. Mata diberikan hanya apabila jawapan disokong oleh gambar.',
      evidence:'Murid memilih satu catatan daripada jadual, menunjuk ciri yang sama dalam gambar dan menerangkan bukti visual yang menyokong pemerhatian tersebut.',
      sharing:'Wakil kumpulan membentangkan tiga ciri yang direkod sambil menunjukkannya pada m/s 81. Kumpulan lain membandingkan dapatan dengan jadual sendiri dan menambah satu ciri tepat yang belum disebut.'
    };
    const levelAdds=uiEn?{
      support:' The teacher provides picture-word cards and models the first example only.',
      core:' Pupils complete the observation and recording with a partner without a completed example.',
      challenge:' Pupils also compare two features and explain one clear difference using evidence from the same photograph.'
    }:{
      support:' Guru menyediakan kad gambar-perkataan dan memodelkan contoh pertama sahaja.',
      core:' Murid melengkapkan pemerhatian dan rekod bersama pasangan tanpa contoh jawapan yang telah siap.',
      challenge:' Murid turut membandingkan dua ciri dan menerangkan satu perbezaan yang jelas menggunakan bukti daripada gambar yang sama.'
    };
    const pak21={input:'Think-Pair-Share',guided:'Talking Partners',practice:'Round Table',game:'Team Challenge',evidence:'Show Me',sharing:'Gallery Walk'};
    return {
      sourceText,
      move(phase='practice',levelKey='core'){
        const p=moves[phase]||moves.practice;
        return {
          name:names[phase]||names.practice,
          text:`${p}${levelAdds[levelKey]||''}`.trim(),
          bbm:uiEn?'Student’s Book p. 81, feature word cards, observation table':'Buku Teks m/s 81, kad perkataan ciri, jadual pemerhatian',
          pak21:pak21[phase]||'Think-Pair-Share'
        };
      }
    };
  }
  return null;
}

function rphConcreteSourceMove(map,anchorText='',page='',phase='practice',levelKey='core',uiEn=false){
  return rphVerifiedVisualContext(map,anchorText,page,uiEn)?.move(phase,levelKey)||null;
}

function rphWeeklyActivityPlan(subjectId,map,classId=null){
  const subjectKey=rphSubjectKey(subjectId);
  const profile=state.rphSubjectPedagogy.find(x=>x.subject_key===subjectKey);
  const rotation=profile?.weekly_activity_rotation;
  const weeks=Array.isArray(rotation?.weeks)?rotation.weeks:[];
  if(!weeks.length||rotation?.source_first!==true)return null;

  const year=Math.max(1,Math.min(3,Number(getClass(classId)?.year||map.year||1)));
  const week=Math.max(1,Math.min(42,Number(map.week_no||1)));
  const session=Math.max(1,Number(map.session_no||1));
  const avoidTypes=recentRphLibraryTypes(subjectId,classId);
  const start=(week-1+(session-1)*11+(year-1)*7)%weeks.length;
  let picked=weeks[start];
  for(let i=0;i<weeks.length;i++){
    const candidate=weeks[(start+i)%weeks.length];
    if(candidate&&!avoidTypes.has(candidate.move)){
      picked=candidate;
      break;
    }
  }
  if(!picked)return null;
  return {
    ...picked,
    subjectKey,
    year,
    week,
    session,
    yearProfile:rotation.year_profiles?.[String(year)]||{},
    key:`annual-${subjectKey}-y${year}-w${String(week).padStart(2,'0')}-s${session}-${picked.move}`
  };
}

function rphWeeklyMoveFamily(move=''){
  const groups={
    match:['quick_match','domino_chain','memory_match','source_puzzle','odd_one_out'],
    hunt:['clue_hunt','evidence_hunt','treasure_trail','escape_cards'],
    sort:['card_sort','four_corners','true_false_fix','spot_the_error'],
    quiz:['quiz_quiz_trade','hot_seat','source_bingo','question_wheel','source_board_game'],
    rotate:['station_rotation','jigsaw','information_gap','find_someone_who'],
    sequence:['answer_relay','sequence_race','pass_the_message','one_minute_challenge'],
    present:['mini_whiteboard','gallery_walk','think_pair_share','peer_coach','traffic_light_check','teach_back','source_showcase','exit_ticket_swap'],
    create:['role_play','concept_map','mini_debate','draw_and_label','model_demo','source_charades'],
    data:['data_detective']
  };
  return Object.keys(groups).find(k=>groups[k].includes(move))||'present';
}

function rphSourceCue(anchorText='',topic='',uiEn=false){
  const cleaned=cleanSourceAnchor(anchorText).replace(/\s+/g,' ').trim();
  if(!cleaned||isTruncatedSourceActivity(cleaned)||isThinSourceActivity(cleaned)||isGenericBookReference(cleaned)){
    return uiEn?`the verified “${topic}” source task`:`tugasan sumber “${topic}” yang telah disahkan`;
  }
  const words=cleaned.split(/\s+/).slice(0,18);
  const cue=words.join(' ').replace(/[,:;\-–—]+$/,'').trim();
  return uiEn?`the source instruction “${cue}”`:`arahan sumber “${cue}”`;
}

function rphWeeklyVariationStep(plan,map,anchorText='',page='',levelKey='core',uiEn=false){
  if(!plan)return null;
  const family=rphWeeklyMoveFamily(plan.move);
  const cue=rphSourceCue(anchorText,map.title||'',uiEn);
  const label=uiEn?`Student’s Book ${page}`:`Buku Teks ${page}`;
  const count=Math.max(2,Number(plan.yearProfile?.response_count||plan.year||2));
  const science=isScienceSubject(map.subject_id);
  const profile=rphTaskProfile(map,[anchorText]);
  const product=uiEn
    ? (science?'observations, measurements, data or results':profile==='writing'?'words and sentences':profile==='dialogue'||profile==='oral'?'spoken responses':'answers and evidence')
    : (science?'pemerhatian, ukuran, data atau hasil':profile==='writing'?'perkataan dan ayat':profile==='dialogue'||profile==='oral'?'respons lisan':'jawapan dan bukti');
  const intro=uiEn
    ? `After completing ${cue} in ${label}, pupils use ${count} accurate ${product} from the same task.`
    : `Selepas melengkapkan ${cue} dalam ${label}, murid menggunakan ${count} ${product} yang tepat daripada tugasan yang sama.`;
  const moves=uiEn?{
    match:'They prepare matching cards, mix them, then take turns pairing each response with the correct clue from the book. A pair earns the card only after pointing to the supporting part of the source.',
    hunt:'The teacher places clue cards around the learning area. Groups follow each clue, locate the matching evidence in the completed book task and record it before moving to the next clue.',
    sort:'Groups sort prepared response cards into the required categories, compare the arrangement with the source and correct one inaccurate placement with an explanation.',
    quiz:'Each group turns its completed responses into short question cards. Pupils answer in turns and receive a point only when the answer and its book evidence are both accurate.',
    rotate:'Each station contains one part of the completed source task. Pupils rotate with assigned reader, recorder and checker roles, adding one accurate response before checking the previous group’s work.',
    sequence:'Groups arrange task steps, events, words, observations or answers in the order required by the source. The final pupil checks the whole sequence against the book before the group submits it.',
    present:'Pairs select their strongest completed response, rehearse a concise explanation and present it. Listeners use the same source to agree, question or suggest one precise improvement.',
    create:'Groups transform the completed source response into a short diagram, model, dialogue, action or concept map without changing the original learning task. They explain how every added part comes from the source.',
    data:'Groups inspect the recorded results, identify one pattern or difference and display it on a mini board. Another group checks the claim against the original table, picture or observation.'
  }:{
    match:'Kumpulan menyediakan kad padanan, mencampurkannya dan bergilir-gilir memadankan setiap respons dengan petunjuk yang betul dalam buku. Kad hanya dikira apabila murid menunjukkan bahagian sumber yang menyokong padanan.',
    hunt:'Guru meletakkan kad petunjuk di beberapa lokasi pembelajaran. Kumpulan mengikuti petunjuk, mencari bukti yang sepadan dalam tugasan buku yang telah dilengkapkan dan merekodnya sebelum bergerak ke petunjuk seterusnya.',
    sort:'Kumpulan mengelaskan kad respons mengikut kategori yang diperlukan, membandingkan susunan dengan sumber dan membetulkan satu kad yang tidak tepat berserta alasan.',
    quiz:'Setiap kumpulan menukar respons yang telah dilengkapkan kepada kad soalan ringkas. Murid menjawab secara bergilir dan memperoleh mata hanya apabila jawapan serta bukti daripada buku kedua-duanya tepat.',
    rotate:'Setiap stesen mengandungi satu bahagian tugasan sumber yang telah dilengkapkan. Murid bergerak mengikut peranan pembaca, pencatat dan penyemak, menambah satu respons tepat lalu menyemak hasil kumpulan sebelumnya.',
    sequence:'Kumpulan menyusun langkah, peristiwa, perkataan, pemerhatian atau jawapan mengikut urutan yang dikehendaki sumber. Murid terakhir menyemak keseluruhan urutan dengan buku sebelum kumpulan menghantar jawapan.',
    present:'Pasangan memilih respons terbaik daripada hasil kerja, berlatih memberikan penerangan ringkas dan membentangkannya. Murid lain merujuk sumber yang sama untuk bersetuju, menyoal atau mencadangkan satu pembaikan yang khusus.',
    create:'Kumpulan menukar respons sumber kepada rajah, model, dialog, aksi atau peta konsep ringkas tanpa menukar tugasan asal. Mereka menerangkan bagaimana setiap bahagian tambahan diperoleh daripada sumber.',
    data:'Kumpulan meneliti hasil yang direkod, mengenal pasti satu pola atau perbezaan dan memaparkannya pada papan mini. Kumpulan lain menyemak pernyataan tersebut dengan jadual, gambar atau pemerhatian asal.'
  };
  const levels=uiEn?{
    support:'The teacher provides visual cues or sentence frames and checks the first response only.',
    core:'Pupils share roles and complete the challenge with a partner or small group before a peer check.',
    challenge:'Pupils add a justified reason, comparison, inference or new example that remains supported by the same source.'
  }:{
    support:'Guru menyediakan petunjuk visual atau rangka jawapan dan menyemak respons pertama sahaja.',
    core:'Murid membahagikan peranan dan melengkapkan cabaran bersama pasangan atau kumpulan kecil sebelum semakan rakan.',
    challenge:'Murid menambah sebab, perbandingan, inferens atau contoh baharu yang masih disokong oleh sumber yang sama.'
  };
  const book=uiEn?'Student’s Book':'Buku Teks';
  const workbook=map.activity_book_ref&&map.source_evidence?.meta?.activity_book_uploaded
    ? (uiEn?', Workbook':', Buku Aktiviti')
    : '';
  const bbmByFamily=uiEn?{
    match:'matching cards, clue cards',hunt:'clue cards, evidence sheet',sort:'category cards, response cards',quiz:'question cards, score board',rotate:'station cards, role cards, recording sheet',sequence:'sequence cards, answer strip',present:'mini whiteboards, peer-feedback cards',create:'plain cards, marker pens, presentation sheet',data:'recording table, mini whiteboards'
  }:{
    match:'kad padanan, kad petunjuk',hunt:'kad petunjuk, lembaran bukti',sort:'kad kategori, kad respons',quiz:'kad soalan, papan skor',rotate:'kad stesen, kad peranan, lembaran rekod',sequence:'kad urutan, jalur jawapan',present:'papan mini, kad maklum balas rakan',create:'kad kosong, pen penanda, lembaran pembentangan',data:'jadual rekod, papan mini'
  };
  return {
    key:plan.key,
    name:uiEn?plan.name_en:plan.name_ms,
    text:`${intro} ${moves[family]} ${levels[levelKey]||levels.core}`,
    bbm:`${book}${workbook}, ${bbmByFamily[family]}`,
    pak21:plan.pak21||'',
    phase:'game',
    activity_type:plan.move,
    weekly_slot:plan.slot
  };
}

function rphRotationWrapperText(row,map,levelKey='',anchorText='',page=''){
  const uiEn=lessonLanguage(map.subject_id)==='en';
  const phase=String(row.phase||'practice');
  const science=isScienceSubject(map.subject_id);
  const topic=map.title|| (uiEn?'this lesson':'tajuk ini');
  const profile=rphTaskProfile(map,[anchorText]);
  const focus=science?(uiEn?'the observation or investigation':'pemerhatian atau penyiasatan'):(uiEn?'the key information, language or idea':'maklumat, bahasa atau idea penting');
  const levelNotes=uiEn?{
    support:{input:'The teacher models the first response only.',guided:'The teacher checks the first response before pupils continue.',practice:'Pupils use the prompt card only when they need help.',game:'The teacher gives one cue if a group is unsure.',evidence:'Pupils point to the part they completed with support.',sharing:'The teacher affirms one accurate response before inviting the next group.'},
    core:{input:'Pupils agree on the action required by the instruction.',guided:'Partners check that they are following the same instruction.',practice:'The group compares responses before recording one agreed answer.',game:'Groups take turns fairly and check each response against the book task.',evidence:'Pupils select evidence from their completed work.',sharing:'Listeners identify one point that matches the book task.'},
    challenge:{input:'Pupils identify one detail they will need to explain later.',guided:'Pupils choose a strategy without a teacher model.',practice:'Pupils add a reason or comparison while keeping the same book task.',game:'Groups explain why their choice is the strongest one.',evidence:'Pupils justify their response with a specific part of the completed task.',sharing:'Pupils respond to one question from another group using evidence.'}
  }:{
    support:{input:'Guru memodelkan respons pertama sahaja.',guided:'Guru menyemak respons pertama sebelum murid meneruskan.',practice:'Murid menggunakan kad petunjuk hanya apabila memerlukan bantuan.',game:'Guru memberikan satu petunjuk jika kumpulan tidak pasti.',evidence:'Murid menunjukkan bahagian yang dilengkapkan dengan sokongan.',sharing:'Guru mengukuhkan satu respons yang tepat sebelum menjemput kumpulan seterusnya.'},
    core:{input:'Murid bersetuju tentang tindakan yang diminta oleh arahan.',guided:'Pasangan menyemak bahawa mereka mengikuti arahan yang sama.',practice:'Kumpulan membandingkan respons sebelum merekod satu jawapan yang dipersetujui.',game:'Kumpulan mengambil giliran dengan adil dan menyemak setiap respons dengan tugasan buku.',evidence:'Murid memilih bukti daripada hasil kerja yang telah dilengkapkan.',sharing:'Murid yang mendengar mengenal pasti satu perkara yang sepadan dengan tugasan buku.'},
    challenge:{input:'Murid mengenal pasti satu butiran yang perlu diterangkan kemudian.',guided:'Murid memilih strategi tanpa contoh guru.',practice:'Murid menambah sebab atau perbandingan sambil mengekalkan tugasan buku yang sama.',game:'Kumpulan menerangkan sebab pilihan mereka paling kukuh.',evidence:'Murid menjustifikasikan respons menggunakan bahagian khusus tugasan yang telah dilengkapkan.',sharing:'Murid menjawab satu soalan daripada kumpulan lain menggunakan bukti.'}
  };
  const ms={
    input:`Murid meneliti ${focus} bagi tajuk ${topic}, kemudian menyatakan langkah kerja dan hasil yang perlu diperhatikan.`,
    guided:`Murid menggunakan kad petunjuk untuk melaksanakan satu bahagian tugasan sumber. Mereka menyemak ${science?'pemerhatian atau dapatan':'jawapan atau maklumat'} bersama pasangan.`,
    practice:`Murid menyelesaikan tugasan sumber dalam kumpulan dan merekod ${science?'pemerhatian, perbandingan atau dapatan':'jawapan, contoh atau maklumat penting'} pada lembaran kerja.`,
    game:`Setiap kumpulan menyelesaikan satu cabaran ringkas berdasarkan hasil tugasan, kemudian menerangkan bukti yang menyokong pilihan mereka.`,
    evidence:`Murid memilih satu hasil kerja atau dapatan sebagai bukti, lalu menerangkan kaitannya dengan objektif pembelajaran.`,
    sharing:`Wakil kumpulan berkongsi dapatan. Kumpulan lain memberi maklum balas menggunakan bukti daripada hasil kerja mereka.`
  };
  const en={
    input:`Pupils identify ${focus} for ${topic}, then state the working steps and what they need to notice.`,
    guided:`Pupils use prompt cards to complete one part of the source task. They check their ${science?'observation or finding':'answer or information'} with a partner.`,
    practice:`Pupils complete the source task in groups and record their ${science?'observation, comparison or finding':'answer, example or key information'} on the worksheet.`,
    game:`Each group completes a short challenge based on the completed task, then explains the evidence for its choice.`,
    evidence:`Pupils select one completed response or finding as evidence and explain how it meets the learning objective.`,
    sharing:`A group representative shares the finding. Other groups give feedback using evidence from their work.`
  };
  const specialisedMs={
    song:{
      input:'Murid mendengar atau mengikut satu bahagian pendek lagu/chant sambil menepuk rentak. Mereka menyebut semula perkataan sasaran dengan jelas.',
      guided:'Murid menggunakan kad perkataan atau kad frasa untuk memadankan perkataan yang didengar dengan petunjuk yang sesuai, kemudian berlatih bersama pasangan.',
      practice:'Murid berlatih menyanyi atau menyebut bahagian lagu/chant secara bergilir dalam kumpulan dan menandakan perkataan sasaran pada bahan yang disediakan.',
      game:'Setiap kumpulan mengambil kad perkataan atau frasa daripada lagu/chant. Kumpulan menyebut atau menyanyikan respons yang sepadan sebelum giliran diberikan kepada kumpulan lain.',
      evidence:'Murid memilih dua perkataan atau bunyi sasaran yang dapat disebut dengan betul dan menunjukkan bukti melalui respons lisan.',
      sharing:'Setiap kumpulan mempersembahkan satu bahagian pendek lagu/chant. Kumpulan lain mendengar dan memberi maklum balas terhadap sebutan atau rentak.'
    },
    poetry:{
      input:'Murid membaca dua baris bahan dengan intonasi yang sesuai dan menandakan satu perkataan atau gambaran yang menarik perhatian mereka.',
      guided:'Murid berbincang dengan pasangan tentang maksud satu frasa menggunakan kata kunci sebagai petunjuk.',
      practice:'Murid membaca bahan dalam kumpulan, memilih bukti daripada teks dan mencatat maksud atau respons mereka.',
      game:'Kumpulan memadankan kad frasa dengan maksud atau gambaran yang sesuai. Mereka menerangkan sebab satu padanan dipilih.',
      evidence:'Murid menunjukkan satu frasa daripada bahan dan menerangkan maksudnya menggunakan bukti yang dibaca.',
      sharing:'Wakil kumpulan mendeklamasikan atau membaca satu bahagian dengan intonasi, kemudian berkongsi satu respons terhadap bahan.'
    },
    dialogue:{
      input:'Murid mendengar model dialog ringkas dan mengenal pasti ungkapan yang sesuai untuk situasi tersebut.',
      guided:'Murid berlatih satu pasangan ujaran menggunakan kad dialog atau rangka ayat sebelum bertukar peranan.',
      practice:'Murid melaksanakan dialog bersama pasangan dengan menggunakan ungkapan daripada sumber dan menambah respons yang sesuai.',
      game:'Kumpulan mencabut kad situasi dan memilih ungkapan yang sesuai sebelum melakonkan respons ringkas.',
      evidence:'Murid menunjukkan satu ujaran yang digunakan dan menerangkan mengapa ujaran itu sesuai dengan situasi.',
      sharing:'Pasangan terpilih mempersembahkan dialog ringkas. Rakan memberi maklum balas tentang sebutan, intonasi atau kesesuaian respons.'
    },
    story:{
      input:'Murid meneliti tajuk atau ayat pembuka cerita dan membuat satu ramalan tentang watak atau peristiwa.',
      guided:'Murid menggunakan kad soalan untuk mencari maklumat tentang watak, tempat atau peristiwa daripada bahagian cerita yang dipilih.',
      practice:'Murid membaca atau meneliti semula bahagian cerita dalam kumpulan dan merekod bukti yang menyokong jawapan mereka.',
      game:'Kumpulan menyusun kad peristiwa atau memadankan watak dengan tindakan yang sesuai berdasarkan cerita.',
      evidence:'Murid memilih satu peristiwa atau tindakan watak dan menerangkan jawapan menggunakan bukti daripada cerita.',
      sharing:'Wakil kumpulan menceritakan semula satu peristiwa penting dan menjelaskan sebab peristiwa itu dipilih.'
    },
    writing:{
      input:'Murid mengenal pasti perkataan penting daripada contoh ayat sebelum mula membina ayat.',
      guided:'Murid menyusun kad perkataan menggunakan rangka ayat dan membaca ayat yang dibina bersama pasangan.',
      practice:'Murid membina ayat berdasarkan bahan sumber, kemudian menyemak huruf besar, ejaan dan tanda baca bersama rakan.',
      game:'Kumpulan menyusun kad perkataan menjadi ayat yang betul dalam masa yang ditetapkan dan menyemak hasil kumpulan lain.',
      evidence:'Murid memilih satu ayat lengkap dan menerangkan bahagian yang menjadikan ayat itu tepat.',
      sharing:'Murid membacakan ayat terbaik kumpulan dan rakan memberi satu cadangan penambahbaikan yang membina.'
    },
    grammar:{
      input:'Murid meneliti contoh bahasa dan menandakan bentuk bahasa yang menjadi fokus pelajaran.',
      guided:'Murid menggunakan kod warna atau kad kategori untuk mengelaskan contoh bahasa dengan bimbingan guru.',
      practice:'Murid mengenal pasti dan mengelaskan contoh bahasa daripada sumber, kemudian membandingkan jawapan dalam kumpulan.',
      game:'Kumpulan berlumba menyusun kad contoh ke dalam kategori yang betul dan memberikan sebab bagi satu pilihan.',
      evidence:'Murid menunjukkan satu contoh bahasa yang betul dan menerangkan ciri yang membuktikan pilihannya.',
      sharing:'Wakil kumpulan menerangkan satu kategori atau contoh baharu kepada kelas.'
    },
    reading:{
      input:'Murid meneliti tajuk atau kata kunci dan membuat jangkaan tentang isi bahan.',
      guided:'Murid membaca bahagian pendek bersama pasangan dan menandakan perkataan yang membantu mereka memahami maksud.',
      practice:'Murid membaca bahan, mencari maklumat yang diperlukan dan merekod jawapan berserta bukti daripada teks.',
      game:'Kumpulan menjalankan permainan cari-bukti dengan mencari ayat atau frasa yang menjawab kad soalan.',
      evidence:'Murid menunjukkan ayat atau frasa yang menyokong jawapan mereka.',
      sharing:'Wakil kumpulan berkongsi jawapan dan membaca bukti daripada teks kepada kelas.'
    }
  };
  const specialisedEn={
    song:{
      input:'Pupils listen to or join in with one short part of the song or chant while clapping the beat. They echo the target words clearly.',
      guided:'Pupils use word or phrase cards to match what they hear with a suitable clue, then practise with a partner.',
      practice:'Pupils take turns singing or saying part of the song or chant in groups and mark the target words on the prepared material.',
      game:'Each group picks a word or phrase card from the song or chant. The group says or sings the matching response before another group takes a turn.',
      evidence:'Pupils choose two target words or sounds they can say accurately and show this through an oral response.',
      sharing:'Each group performs one short part of the song or chant. Other groups listen and give feedback on pronunciation or rhythm.'
    },
    poetry:{
      input:'Pupils read two lines with suitable expression and mark one word or image that stands out to them.',
      guided:'Pupils discuss the meaning of one phrase with a partner using key words as clues.',
      practice:'Pupils read the text in groups, choose evidence from it and record their meaning or response.',
      game:'Groups match phrase cards to suitable meanings or images and explain one match.',
      evidence:'Pupils show one phrase from the text and explain its meaning using what they have read.',
      sharing:'A group representative recites or reads one part with expression, then shares one response to the text.'
    },
    dialogue:{
      input:'Pupils listen to a short model dialogue and identify an expression that suits the situation.',
      guided:'Pupils practise one exchange using dialogue cards or a sentence frame before changing roles.',
      practice:'Pupils carry out the dialogue with a partner using expressions from the source and adding a suitable response.',
      game:'Groups pick a situation card, choose a suitable expression and act out a short response.',
      evidence:'Pupils show one expression they used and explain why it suits the situation.',
      sharing:'Selected pairs perform a short dialogue. Classmates give feedback on pronunciation, intonation or suitable responses.'
    },
    story:{
      input:'Pupils examine the story title or opening line and make one prediction about a character or event.',
      guided:'Pupils use question cards to find information about a character, setting or event in a selected part of the story.',
      practice:'Pupils reread or revisit the story section in groups and record evidence that supports their answer.',
      game:'Groups sequence event cards or match characters to suitable actions based on the story.',
      evidence:'Pupils choose one event or character action and explain their answer with evidence from the story.',
      sharing:'A group representative retells one key event and explains why the group chose it.'
    },
    writing:{
      input:'Pupils identify key words from the model sentence before building a sentence.',
      guided:'Pupils arrange word cards with a sentence frame and read their completed sentence with a partner.',
      practice:'Pupils write a sentence from the source material, then check capital letters, spelling and punctuation with a partner.',
      game:'Groups race to arrange word cards into a correct sentence, then check another group’s result.',
      evidence:'Pupils choose one complete sentence and explain what makes it accurate.',
      sharing:'Pupils read their group’s best sentence and classmates give one constructive improvement.'
    },
    grammar:{
      input:'Pupils examine language examples and mark the language form that is the lesson focus.',
      guided:'Pupils use colour coding or category cards to sort language examples with teacher guidance.',
      practice:'Pupils identify and classify language examples from the source, then compare answers in their group.',
      game:'Groups race to sort example cards into the correct categories and give a reason for one choice.',
      evidence:'Pupils show one correct language example and explain the feature that proves their choice.',
      sharing:'A group representative explains one category or new example to the class.'
    },
    reading:{
      input:'Pupils examine the title or key words and predict what the text will be about.',
      guided:'Pupils read a short section with a partner and underline words that help them understand the meaning.',
      practice:'Pupils read the material, find the required information and record an answer with evidence from the text.',
      game:'Groups play an evidence hunt by finding the sentence or phrase that answers a question card.',
      evidence:'Pupils show the sentence or phrase that supports their answer.',
      sharing:'A group representative shares the answer and reads the supporting evidence to the class.'
    }
  };
  let text=(uiEn?specialisedEn:specialisedMs)[profile]?.[phase];
  if(!text&&profile.startsWith('science:')){
    const pattern=profile.split(':')[1];
    const thing={observe:uiEn?'what they observe':'apa yang diperhatikan',identify:uiEn?'the feature they identify':'ciri yang dikenal pasti',classify:uiEn?'the category they choose':'kategori yang dipilih',compare:uiEn?'the comparison they make':'perbandingan yang dibuat',measure:uiEn?'the measurement they obtain':'ukuran yang diperoleh',investigate:uiEn?'the result of the investigation':'hasil penyiasatan',record_data:uiEn?'the data they record':'data yang direkodkan',infer:uiEn?'the inference they make':'inferens yang dibuat',predict:uiEn?'the prediction they make':'ramalan yang dibuat'}[pattern]||(uiEn?'their science finding':'dapatan sains mereka');
    const scienceText=uiEn?{
      input:'Pupils look closely at the science material and state what they need to observe or find out.',
      guided:'Pupils follow the prompt sheet to complete one part of the investigation or observation with a partner.',
      practice:'Pupils carry out the textbook science task and record the required observation or result in a simple table.',
      game:'Groups sort evidence cards from the completed task and explain which card best supports their finding.',
      evidence:`Pupils show ${thing} and explain which observation or result supports it.`,
      sharing:'A group representative presents the finding. Other groups compare it with their own recorded evidence.'
    }:{
      input:'Murid meneliti bahan sains dan menyatakan perkara yang perlu diperhatikan atau diketahui.',
      guided:'Murid menggunakan lembaran petunjuk untuk melaksanakan satu bahagian pemerhatian atau penyiasatan bersama pasangan.',
      practice:'Murid melaksanakan tugasan sains Buku Teks dan merekod pemerhatian atau hasil yang diperlukan dalam jadual mudah.',
      game:'Kumpulan mengelaskan kad bukti daripada tugasan yang telah dilengkapkan dan menerangkan kad yang paling menyokong dapatan mereka.',
      evidence:`Murid menunjukkan ${thing} dan menerangkan pemerhatian atau hasil yang menyokongnya.`,
      sharing:'Wakil kumpulan membentangkan dapatan. Kumpulan lain membandingkannya dengan bukti yang direkodkan.'
    };
    text=scienceText[phase];
  }
  text=text||(uiEn?en:ms)[phase]||(uiEn?en.practice:ms.practice);
  const lead=rphBookStepLead(anchorText,page,uiEn,phase);
  return `${lead} ${text} ${(levelNotes[levelKey]?.[phase]||'')}`.trim();
}

function rphRotationBbm(row,map){
  const uiEn=lessonLanguage(map.subject_id)==='en';
  const phase=String(row.phase||'practice');
  const science=isScienceSubject(map.subject_id);
  const ms={
    input:'Buku Teks, kad arahan',
    guided:'Buku Teks, kad petunjuk, penanda warna',
    practice:science?'Buku Teks, bahan tugasan, lembaran rekod':'Buku Teks, lembaran kerja, kad kata',
    game:'Buku Teks, kad cabaran, papan jawapan',
    evidence:'Buku Teks, hasil kerja murid, kad bukti',
    sharing:'Buku Teks, hasil kerja murid, papan mini'
  };
  const en={
    input:'Student’s Book, instruction cards',
    guided:'Student’s Book, prompt cards, colour markers',
    practice:science?'Student’s Book, task materials, recording sheet':'Student’s Book, worksheet, word cards',
    game:'Student’s Book, challenge cards, answer board',
    evidence:'Student’s Book, pupils’ work, evidence cards',
    sharing:'Student’s Book, pupils’ work, mini whiteboard'
  };
  return (uiEn?en:ms)[phase]||(uiEn?en.practice:ms.practice);
}

function rphRenderLibraryActivity(row,map,anchorText,page,levelKey=''){
  if(!row)return null;

  const topic=map.title||'tajuk pembelajaran';
  let text=String(row.activity_template||'')
    .replaceAll('{{topic}}',topic)
    .replaceAll('{{page}}',page||'')
    .replaceAll('{{source_activity}}',anchorText||'');

  // The source task is already shown once above the differentiated groups.
  // Any library row which interpolates it is a delivery wrapper, so render the
  // actual classroom move instead of copying the whole task into every step.
  const sourceTemplate=/\{\{source_activity\}\}/.test(String(row.activity_template||''));
  const wrapper=/_rotation_/.test(String(row.activity_key||''))||sourceTemplate;
  const concrete=wrapper?rphConcreteSourceMove(
    map,anchorText,page,String(row.phase||'practice'),levelKey,
    lessonLanguage(map.subject_id)==='en'
  ):null;
  if(wrapper) text=concrete?.text||rphRotationWrapperText(row,map,levelKey,anchorText,page);

  let bbm=String(row.bbm_template||'')
    .replaceAll('{{topic}}',topic)
    .replaceAll('{{page}}',page||'')
    .replaceAll('{{source_activity}}',anchorText||'');
  if(wrapper) bbm=concrete?.bbm||rphRotationBbm(row,map);

  return {
    key:row.activity_key,
    name:concrete?.name||row.activity_name||'Aktiviti',
    text,
    bbm,
    pak21:concrete?.pak21||row.pak21||'',
    phase:row.phase||''
  };
}

function rphLibraryLessonSteps(subjectId,map,activities,levelKey,anchorText,page,classId=null,usedAcrossGroups=new Set()){
  const picked=rphBuildLibrarySteps(subjectId,map,activities,levelKey,classId,usedAcrossGroups);

  const expectedSubskill=rphSubskillKey(map,activities);

  const safeActivities=picked.activities.filter(x=>{
    const actual=x.subskill_key||'general';
    return expectedSubskill==='general'
      ? actual==='general'
      : actual===expectedSubskill||(
        actual==='general'&&x.requires_source===true&&
        /\{\{source_activity\}\}/.test(String(x.activity_template||''))
      );
  });

  const rejected=picked.activities.filter(x=>!safeActivities.includes(x));
  if(rejected.length){
    console.warn(
      'RPH SUBSKILL GUARD',
      {expectedSubskill,rejected:rejected.map(x=>({
        key:x.activity_key,
        subskill:x.subskill_key,
        name:x.activity_name
      }))}
    );
  }

  const steps=safeActivities
    .map(x=>rphRenderLibraryActivity(x,map,anchorText,page,levelKey))
    .filter(Boolean);

  return steps;
}

function rphGeneralSourceTaskText(map,source,levelKey='core',uiEn=false){
  const task=String(source?.text||'').trim();
  const profile=rphTaskProfile(map,[task]);
  const pattern=profile.startsWith('science:')?profile.split(':')[1]:'';
  const msActions={
    reading:'Murid membaca bahagian yang berkaitan, menandakan kata atau ayat yang mengandungi maklumat penting, kemudian menjawab menggunakan bukti daripada bahan yang sama.',
    writing:'Murid meneliti contoh atau bahan rangsangan, merancang respons, menulis jawapan yang diminta dan menyemak ejaan, huruf besar serta tanda baca.',
    grammar:'Murid menandakan bentuk bahasa yang menjadi fokus, mengelaskan contoh yang ditemui dan memberikan sebab bagi sekurang-kurangnya satu jawapan.',
    dialogue:'Murid mengenal pasti ujaran penting, berlatih secara berpasangan, bertukar peranan dan menyampaikan dialog dengan sebutan serta intonasi yang sesuai.',
    oral:'Murid mendengar atau meneliti bahan, menyediakan respons lisan dan menyampaikannya kepada pasangan sebelum berkongsi dengan kelas.',
    song:'Murid mendengar atau mengikut bahagian yang ditetapkan, menyebut perkataan sasaran dengan jelas dan menunjukkan pemahaman melalui respons lisan.',
    poetry:'Murid membaca bahan dengan intonasi yang sesuai, memilih perkataan atau frasa penting dan menerangkan maksudnya berdasarkan teks.',
    story:'Murid membaca bahagian cerita, mengenal pasti watak, peristiwa atau maklumat yang diminta dan menunjukkan ayat yang menyokong jawapan.',
    general:'Murid meneliti bahan, melaksanakan setiap arahan mengikut urutan dan menghasilkan jawapan atau hasil kerja yang boleh disemak.'
  };
  const enActions={
    reading:'Pupils read the relevant section, mark the words or sentences containing key information, and answer with evidence from the same text.',
    writing:'Pupils examine the model or stimulus, plan a response, write the required answer, and check spelling, capital letters and punctuation.',
    grammar:'Pupils mark the target language form, sort the examples they find, and give a reason for at least one answer.',
    dialogue:'Pupils identify the key expressions, practise in pairs, change roles, and present the dialogue with suitable pronunciation and intonation.',
    oral:'Pupils listen to or examine the material, prepare an oral response, and tell a partner before sharing with the class.',
    song:'Pupils listen to or join in with the selected part, say the target words clearly, and show understanding through an oral response.',
    poetry:'Pupils read with suitable expression, select key words or phrases, and explain their meaning with evidence from the text.',
    story:'Pupils read the story section, identify the required character, event or information, and show the sentence supporting the answer.',
    general:'Pupils examine the material, follow every instruction in sequence, and produce an answer or outcome that can be checked.'
  };
  const scienceMs={
    observe:'Murid memerhati objek, gambar atau perubahan yang dinyatakan dalam sumber, mencatat perkara yang benar-benar dilihat dan membezakan pemerhatian daripada tekaan.',
    identify:'Murid mencari ciri yang diminta dalam sumber, menandakan setiap contoh dan menyebut ciri yang membuktikan jawapan.',
    classify:'Murid menyenaraikan item daripada sumber, meletakkannya dalam kumpulan yang betul dan menyatakan satu sebab bagi setiap kumpulan.',
    compare:'Murid merekod persamaan dan perbezaan dalam jadual perbandingan menggunakan maklumat atau hasil daripada sumber.',
    sequence:'Murid menyusun langkah atau peristiwa mengikut urutan sumber dan menerangkan petunjuk yang menentukan susunan.',
    measure:'Murid menggunakan alat dan unit yang dinyatakan dalam sumber, mengambil ukuran serta merekod bacaan dengan betul.',
    record_data:'Murid melaksanakan tugasan sumber dan memasukkan setiap pemerhatian atau bacaan ke dalam jadual sebelum membuat rumusan.',
    investigate:'Murid menyemak bahan dan pemboleh ubah yang dinyatakan, menjalankan langkah penyiasatan mengikut urutan serta merekod hasil tanpa menukar tugasan asal.',
    infer:'Murid menggunakan pemerhatian atau data daripada sumber untuk membina inferens dan menyatakan bukti yang menyokongnya.',
    predict:'Murid membuat ramalan sebelum tugasan diteruskan, kemudian membandingkan ramalan dengan hasil sebenar.',
    draw_label:'Murid melukis berdasarkan sumber, menambah label yang diperlukan dan menyemak kedudukan setiap label.',
    build_model:'Murid menyediakan bahan yang dinyatakan, mengikuti langkah pembinaan satu demi satu, menguji hasil dan membetulkan bahagian yang belum berfungsi.',
    design_create:'Murid mengikuti batas tugasan sumber untuk menghasilkan produk, menguji satu ciri dan merekod penambahbaikan yang dibuat.',
    general:'Murid meneliti bahan sains, melaksanakan arahan mengikut urutan dan merekod pemerhatian atau hasil yang boleh diperiksa.'
  };
  const scienceEn={
    observe:'Pupils observe the object, picture or change named in the source, record only what they can see, and distinguish observations from guesses.',
    identify:'Pupils locate the required features in the source, mark each example, and state the feature proving the answer.',
    classify:'Pupils list the source items, place them in the correct groups, and give one reason for each group.',
    compare:'Pupils record similarities and differences in a comparison table using information or results from the source.',
    sequence:'Pupils arrange the steps or events in source order and explain the clue determining the sequence.',
    measure:'Pupils use the tool and unit named in the source, take the measurement, and record the reading correctly.',
    record_data:'Pupils carry out the source task and enter every observation or reading in a table before forming a conclusion.',
    investigate:'Pupils check the stated materials and variables, follow the investigation steps in order, and record the result without changing the original task.',
    infer:'Pupils use the source observation or data to form an inference and state the evidence supporting it.',
    predict:'Pupils make a prediction before continuing the task and compare it with the actual result.',
    draw_label:'Pupils draw from the source, add the required labels, and check the position of every label.',
    build_model:'Pupils prepare the stated materials, follow the construction steps, test the outcome, and correct a part that does not yet work.',
    design_create:'Pupils work within the source-task limits to produce an outcome, test one feature, and record an improvement.',
    general:'Pupils examine the science material, follow the instructions in order, and record an observation or result that can be checked.'
  };
  const action=pattern
    ? ((uiEn?scienceEn:scienceMs)[pattern]||(uiEn?scienceEn.general:scienceMs.general))
    : ((uiEn?enActions:msActions)[profile]||(uiEn?enActions.general:msActions.general));
  const levels=uiEn?{
    support:'The teacher divides the task into short parts, supplies key-word or sentence cues, and models only the first response.',
    core:'Pupils complete the original task with a partner, compare answers, and correct the work by referring to the same source.',
    challenge:'Pupils complete the same task independently, add a reason, comparison or supporting example, and justify it from the same source.'
  }:{
    support:'Guru membahagikan tugasan kepada bahagian pendek, menyediakan kata kunci atau rangka jawapan dan memodelkan respons pertama sahaja.',
    core:'Murid melengkapkan tugasan asal bersama pasangan, membandingkan jawapan dan membetulkan hasil dengan merujuk sumber yang sama.',
    challenge:'Murid melengkapkan tugasan yang sama secara kendiri, menambah sebab, perbandingan atau contoh sokongan dan menjustifikasikannya daripada sumber yang sama.'
  };
  return uiEn
    ? `Book instruction: “${task}” ${action} ${levels[levelKey]||levels.core}`
    : `Arahan buku: “${task}” ${action} ${levels[levelKey]||levels.core}`;
}

function rphSourceOutcomeStep(map,source,levelKey='core',uiEn=false){
  const task=String(source?.text||'').trim();
  const profile=rphTaskProfile(map,[task]);
  const criterion=String(map.success_criteria||'').trim();
  const ms={
    reading:'Murid menanda jawapan dan ayat bukti pada bahan sebelum semakan pasangan.',
    writing:'Murid membaca semula hasil penulisan dan menggunakan senarai semak isi, ejaan serta tanda baca.',
    grammar:'Murid menyemak pengelasan atau jawapan dengan contoh dalam sumber dan membetulkan item yang tidak tepat.',
    dialogue:'Pasangan mempersembahkan respons, kemudian rakan menyemak sebutan, intonasi dan kesesuaian ujaran.',
    oral:'Murid menyampaikan respons lisan dan rakan merekod satu isi yang tepat daripada penyampaian.',
    song:'Murid membuat persembahan ringkas dan rakan mengenal pasti perkataan atau bunyi sasaran yang disebut dengan jelas.',
    poetry:'Murid membaca atau mendeklamasikan bahagian pilihan dan menerangkan satu frasa berdasarkan bahan.',
    story:'Murid berkongsi jawapan bersama ayat atau peristiwa yang menjadi bukti.',
    general:'Murid mempamerkan hasil, menerangkan cara jawapan diperoleh dan membuat pembetulan selepas maklum balas.'
  };
  const en={
    reading:'Pupils mark each answer and its supporting sentence before a partner check.',
    writing:'Pupils reread their writing and use a checklist for content, spelling and punctuation.',
    grammar:'Pupils check the classification or answer against the source examples and correct inaccurate items.',
    dialogue:'Pairs present the response while classmates check pronunciation, intonation and suitable expressions.',
    oral:'Pupils give the oral response while a partner records one accurate point from it.',
    song:'Pupils give a short performance while classmates identify target words or sounds produced clearly.',
    poetry:'Pupils read or recite a selected part and explain one phrase from the material.',
    story:'Pupils share the answer together with the sentence or event used as evidence.',
    general:'Pupils display the outcome, explain how they obtained the answer, and improve it after feedback.'
  };
  const science=profile.startsWith('science:');
  const base=science
    ? (uiEn?'Pupils show the recorded observation, data or outcome, point to the source evidence, and correct any statement not supported by the task.':'Murid menunjukkan pemerhatian, data atau hasil yang direkod, menunjuk bukti daripada sumber dan membetulkan pernyataan yang tidak disokong oleh tugasan.')
    : ((uiEn?en:ms)[profile]||(uiEn?en.general:ms.general));
  const check=criterion
    ? (uiEn?` The teacher checks the outcome against this success criterion: ${criterion}`:` Guru menyemak hasil berdasarkan kriteria kejayaan berikut: ${criterion}`)
    : '';
  return `${base}${check}`;
}

function rphSourceFirstGroupSteps(map,sourceSteps=[],librarySteps=[],levelKey='core',uiEn=false){
  if(!sourceSteps.length)return (librarySteps||[]).slice(0,2);
  const main=sourceSteps.slice(0,2).map((source,i)=>{
    const ref=source.bbm||'';
    const sourceTask=source.rawText||source.text;
    const concrete=rphConcreteSourceMove(map,sourceTask,ref,i===0?'practice':'guided',levelKey,uiEn);
    return {
      key:`source-task-${levelKey}-${i+1}`,
      name:concrete?.name||source.name||(uiEn?'Book Activity':'Aktiviti Buku'),
      text:concrete?.text||rphGeneralSourceTaskText(map,{...source,text:sourceTask},levelKey,uiEn),
      bbm:concrete?.bbm||ref,
      pak21:'',
      phase:'source'
    };
  });
  if(main.length===1){
    const source=sourceSteps[0];
    const sourceTask=source.rawText||source.text;
    const concrete=rphConcreteSourceMove(map,sourceTask,source.bbm||'','evidence',levelKey,uiEn);
    main.push({
      key:`source-evidence-${levelKey}`,
      name:concrete?.name||(uiEn?'Check the Book Outcome':'Semak Hasil Tugasan Buku'),
      text:concrete?.text||rphSourceOutcomeStep(map,{...source,text:sourceTask},levelKey,uiEn),
      bbm:concrete?.bbm||source.bbm||'',
      pak21:concrete?.pak21||'Pair Check',
      phase:'evidence'
    });
  }
  const extras=(librarySteps||[]).filter(x=>x?.key&&!String(x.key).startsWith('source-'));
  const variation=extras.find(x=>['game','sharing','evidence'].includes(String(x.phase||'')))||extras[0]||null;
  if(variation){
    main.push({...variation,name:uiEn?`Optional variation - ${variation.name}`:`Variasi pilihan - ${variation.name}`});
  }
  return main.slice(0,3);
}

function rphGroupStepsHtml(steps,fallback,uiEn){
  if(!steps?.length){
    return `<table class="rph-step-table"><tbody><tr><th>${uiEn?'Activity':'Aktiviti'}</th><td>${escapeHtml(fallback||'')}</td></tr></tbody></table>`;
  }

  return `<table class="rph-step-table"><tbody>${steps.map((x,i)=>`
    <tr><th>${uiEn?'Step':'Langkah'} ${i+1}<small>${escapeHtml(x.name||'')}</small></th><td>${escapeHtml(x.text||'')}${x.bbm?`<div class="rph-step-meta"><b>${uiEn?'Teaching Aids':'BBM/ABM'}:</b> ${escapeHtml(x.bbm)}</div>`:''}${x.pak21?`<div class="rph-step-meta"><b>${uiEn?'21st Century Learning':'PAK-21'}:</b> ${escapeHtml(x.pak21)}</div>`:''}</td></tr>`).join('')}</tbody></table>`;
}

function rphSourceStepsHtml(steps,fallback,uiEn){
  if(!steps?.length){
    return `<div class="activity">${escapeHtml(fallback||'')}</div>`;
  }
  return `<table class="rph-step-table"><tbody>${steps.map((x,i)=>`
    <tr><th>${uiEn?'Source activity':'Aktiviti sumber'} ${i+1}<small>${escapeHtml(x.name||'')}</small></th><td>${escapeHtml(x.text||'')}${x.bbm?`<div class="rph-step-meta"><b>${uiEn?'Book reference':'Rujukan buku'}:</b> ${escapeHtml(x.bbm)}</div>`:''}</td></tr>`).join('')}</tbody></table>`;
}

function rphInductionHtml(ped,uiEn){
  const d=ped?.inductionData;

  if(!d){
    return `<div class="rph-induction">${escapeHtml(ped?.setInduksi||'')}</div>`;
  }

  return `<div class="rph-induction">
    <div class="rph-activity-label">${escapeHtml(d.name||(
      uiEn?'Set Induction':'Set Induksi'
    ))}</div>
    <div>${escapeHtml(d.text||ped.setInduksi||'')}</div>
    ${d.bbm?`<div><b>${uiEn?'Teaching Aids:':'BBM/ABM:'}</b> ${escapeHtml(d.bbm)}</div>`:''}
    ${d.pak21?`<div><b>${uiEn?'21st Century Learning:':'PAK-21:'}</b> ${escapeHtml(d.pak21)}</div>`:''}
  </div>`;
}

function rphBuildClosure(map,activities,librarySteps,uiEn){
  const skill=rphSkillKey(map,activities);
  const subskill=rphSubskillKey(map,activities);

  const names=[...new Set([
    ...(librarySteps?.support||[]),
    ...(librarySteps?.core||[]),
    ...(librarySteps?.challenge||[])
  ]
    .filter(x=>x?.key&&!String(x.key).startsWith('source-'))
    .map(x=>x.name)
    .filter(Boolean)
  )];

  // Penutup ialah rumusan seluruh kelas.
  // Jangan kaitkan dengan nama aktiviti sesuatu kumpulan sahaja.

  const ms={
    pantun:[
      'Murid memilih satu bahagian pantun daripada sumber dan menyatakan perkara yang telah difahami. Beberapa murid berkongsi respons sebelum guru merumuskan pembelajaran.',
      'Murid membaca semula bahagian pantun yang dipelajari dan berkongsi satu maksud atau dapatan berdasarkan sumber. Guru memberi maklum balas dan membuat rumusan.',
      'Secara berpasangan, murid berkongsi satu perkara yang dipelajari daripada pantun. Guru memilih beberapa respons sebagai rumusan akhir.'
    ],
    sajak:[
      'Murid menyampaikan semula satu bahagian sajak dan berkongsi maksud, mesej atau perasaan yang difahami berdasarkan sumber. Guru merumuskan pembelajaran.',
      'Murid menyatakan satu dapatan daripada sajak yang dipelajari. Beberapa respons dikongsi sebelum guru memberikan maklum balas akhir.',
      'Murid membuat perkongsian ringkas tentang sajak berdasarkan aktiviti yang telah dijalankan. Guru mengaitkan respons dengan fokus pembelajaran.'
    ],
    dialog:[
      'Murid melakukan satu pertukaran ujaran dan respons ringkas berdasarkan konteks sumber. Guru memberi maklum balas tentang kesesuaian respons dan merumuskan pembelajaran.',
      'Beberapa pasangan menunjukkan semula satu bahagian dialog. Murid lain menyatakan perkara yang dipelajari sebelum guru membuat rumusan.',
      'Murid berkongsi satu contoh respons yang sesuai berdasarkan dialog yang dipelajari. Guru memberi pengukuhan akhir.'
    ],
    lakonan:[
      'Beberapa murid menunjukkan semula aksi atau ujaran penting daripada situasi yang dipelajari. Rakan menyatakan perkara yang difahami sebelum guru membuat rumusan.',
      'Murid berkongsi satu perkara yang dipelajari melalui lakonan. Guru menghubungkan respons dengan sumber dan memberikan maklum balas akhir.',
      'Murid menyatakan bagaimana aksi, watak atau ujaran dalam aktiviti membantu mereka memahami pembelajaran. Guru merumuskan isi utama.'
    ],
    nyanyian:[
      'Murid menyampaikan semula bahagian lagu yang dipelajari dan berkongsi satu maksud atau mesej berdasarkan lirik sumber. Guru membuat rumusan.',
      'Murid menyatakan satu perkataan, frasa atau idea yang dipelajari daripada lagu. Guru memilih beberapa respons untuk pengukuhan akhir.',
      'Murid berkongsi perkara yang difahami melalui nyanyian atau lirik. Guru memberikan maklum balas dan merumuskan fokus pembelajaran.'
    ]
  };

  const en={
    pantun:[
      'Pupils revisit one part of the pantun and share what they understood from the source. Selected responses are used for the final recap.',
      'Pupils reread part of the pantun and share one meaning or learning point based on the source. The teacher gives final feedback.',
      'In pairs, pupils share one thing learned from the pantun before selected responses are used for the lesson recap.'
    ],
    sajak:[
      'Pupils revisit a line or stanza from the poem or rhyme and share one meaning, feeling or idea they understood. The teacher uses selected responses for the final recap.',
      'Pupils reread or recite a short part of the poem or rhyme and state one word, phrase or message they learned. The teacher gives brief final feedback.',
      'In pairs, pupils share one line or idea they remember from the poem or rhyme and explain what they understood. Selected responses are used to recap the lesson.'
    ],
    nyanyian:[
      'Pupils repeat a short line from the song or chant and share one word, phrase or message they learned. The teacher gives final feedback.',
      'Pupils recall part of the song or chant and state one thing they understood from the lyrics or language used. Selected responses are used for the final recap.',
      'In pairs, pupils share a word, phrase or idea they remember from the song or chant. The teacher highlights selected responses and summarises the learning.'
    ],
    cerita:[
      'Pupils name one character, event or idea from the story and share what they understood. The teacher uses selected responses for the final recap.',
      'Pupils retell one important event from the story in a simple sentence and state what they learned from it. The teacher gives final feedback.',
      'In pairs, pupils share one character, event or message they remember from the story. Selected responses are used to summarise the lesson.'
    ],
    lakonan:[
      'Pupils reflect on the role play or drama by sharing one line, action or response they used during the activity. The teacher gives final feedback.',
      'Pupils state one thing they learned from performing or watching the role play or drama. Selected responses are used for the final recap.',
      'In pairs, pupils share one useful expression, action or idea from the role play or drama. The teacher highlights selected responses and summarises the learning.'
    ]
  };

  let pool=(uiEn?en[subskill]:ms[subskill])||null;

  const enFallback={
    writing_sentence:[
      'Pupils share one sentence from their work and make one correction if needed before the final recap.'
    ],
    reading:[
      'Pupils share one important piece of information from the text and show the part that supports their answer.'
    ],
    listening_speaking:[
      'Pupils share one appropriate oral response based on the listening or speaking task before the final recap.'
    ],
    grammar:[
      'Pupils give one example of the target language form and explain how it is used correctly.'
    ],
    product_project:[
      'Pupils show their completed work and share one important step or improvement from the task.'
    ],
    general:[
      'Pupils share one piece of evidence from the source task that shows what they learned.'
    ]
  };

  if(!pool&&uiEn)pool=enFallback[skill]||enFallback.general;

  if(!pool){
    if(skill==='writing_sentence'){
      pool=[
        'Murid membaca semula satu hasil ayat mereka, membuat pembetulan jika perlu dan berkongsi satu contoh sebelum guru merumuskan pembelajaran.',
        'Murid menyemak hasil penulisan dengan pasangan dan memilih satu ayat sebagai bukti pembelajaran. Guru memberikan maklum balas akhir.'
      ];
    }else if(skill==='reading'){
      pool=[
        'Murid berkongsi satu maklumat penting daripada bacaan dan menunjukkan bahagian teks yang menyokong jawapan. Guru merumuskan strategi mencari maklumat berdasarkan sumber.',
        'Secara berpasangan, murid menyatakan satu dapatan daripada bacaan serta bukti yang menyokong dapatan tersebut. Beberapa respons dikongsi sebelum guru membuat rumusan.',
        'Murid menyatakan satu perkara yang dipelajari daripada teks dan menerangkan bagaimana mereka menemukan maklumat tersebut. Guru memberikan pengukuhan akhir.'
      ];
    }else if(skill==='listening_speaking'){
      pool=[
        'Murid berkongsi satu respons lisan berdasarkan situasi atau maklumat yang didengar. Guru membimbing kelas menilai kesesuaian respons sebelum membuat rumusan.',
        'Secara berpasangan, murid menyatakan semula satu maklumat yang didengar dan memberikan respons yang sesuai. Beberapa pasangan berkongsi sebelum guru membuat rumusan.',
        'Murid memberikan satu respons lisan dan menerangkan sebab respons tersebut sesuai dengan konteks. Guru memberikan pengukuhan akhir.'
      ];
    }else if(skill==='product_project'){
      pool=[
        'Murid mempamerkan hasil tugasan dan menyatakan satu langkah penting yang telah dilaksanakan. Beberapa murid berkongsi sebelum guru merumuskan pembelajaran.',
        'Secara berpasangan, murid menyemak hasil berdasarkan arahan sumber dan berkongsi satu perkara yang telah dilakukan dengan baik serta satu penambahbaikan yang boleh dibuat.',
        'Murid menerangkan secara ringkas hasil yang dihasilkan dan bagaimana langkah sumber membantu menyiapkan tugasan. Guru memberikan maklum balas dan membuat rumusan.'
      ];
    }else if(skill==='grammar'){
      pool=[
        'Murid memberikan satu contoh penggunaan bahasa daripada aktiviti yang dijalankan. Guru menyemak respons dan merumuskan peraturan atau fokus bahasa.',
        'Murid berkongsi satu jawapan dan menerangkan sebab pemilihannya. Guru membetulkan kekeliruan dan membuat rumusan.'
      ];
    }else{
      pool=[
        'Murid berkongsi satu bukti pembelajaran daripada tugasan sumber. Guru memberikan maklum balas dan merumuskan fokus pembelajaran.',
        'Murid menyatakan satu perkara yang telah dipelajari dan satu hasil daripada aktiviti. Guru membuat pengukuhan akhir.'
      ];
    }
  }

  const seed=`${map.id||''}|${map.session_no||1}|${map.textbook_page_start||0}|closure`;
  let text=pool[rphActivityHash(seed)%pool.length];

  text+=uiEn
    ? ' The teacher links the recap to the learning objective.'
    : ' Guru mengaitkan rumusan dengan objektif pembelajaran.';

  return text;
}

function rphBuildPbdEvidence(map,activities,librarySteps,uiEn){
  const skill=rphSkillKey(map,activities);
  const subskill=rphSubskillKey(map,activities);
  const mainSp=map.source_evidence?.meta?.main_sp
    ||String(map.sp||'').split(',')[0]
    ||'';

  const names=[...new Set([
    ...(librarySteps?.support||[]),
    ...(librarySteps?.core||[]),
    ...(librarySteps?.challenge||[])
  ]
    .filter(x=>x?.key&&!String(x.key).startsWith('source-'))
    .map(x=>x.name)
    .filter(Boolean)
  )].slice(0,5);

  let methodMs='Pemerhatian, soal jawab dan semakan hasil tugasan murid.';
  let methodEn='Observation, questioning and review of pupils’ task evidence.';

  if(subskill==='pantun'){
    methodMs='Pemerhatian bacaan pantun, respons lisan tentang maksud pantun dan hasil aktiviti murid.';
    methodEn='Observation of pantun recitation, oral responses about meaning and pupils’ activity evidence.';
  }else if(subskill==='sajak'){
    methodMs='Pemerhatian deklamasi sajak, respons tentang maksud atau mesej dan hasil aktiviti murid.';
    methodEn='Observation of poem recital, responses about meaning or message and pupils’ activity evidence.';
  }else if(subskill==='cerita'){
    methodMs='Pemerhatian kefahaman cerita, respons tentang watak atau peristiwa dan keupayaan murid menyokong respons berdasarkan sumber.';
    methodEn='Observation of story understanding, responses about characters or events, and pupils’ ability to support responses using the source.';
  }else if(subskill==='dialog'){
    methodMs='Pemerhatian sebutan, intonasi, giliran bercakap dan kesesuaian respons semasa dialog.';
    methodEn='Observation of pronunciation, intonation, turn-taking and appropriateness of responses during dialogue.';
  }else if(subskill==='lakonan'){
    methodMs='Pemerhatian aksi, ekspresi, ujaran dan kefahaman murid semasa lakonan.';
    methodEn='Observation of actions, expression, speech and understanding during role-play.';
  }else if(subskill==='nyanyian'){
    methodMs='Pemerhatian sebutan, irama, penyampaian dan kefahaman murid terhadap lirik atau mesej lagu.';
    methodEn='Observation of pronunciation, rhythm, performance and understanding of the song lyrics or message.';
  }else if(skill==='writing_sentence'){
    methodMs='Semakan hasil penulisan murid serta pemerhatian semasa membina dan memperbaiki ayat.';
    methodEn='Review of pupils’ written work and observation while constructing and improving sentences.';
  }else if(skill==='reading'){
    methodMs='Pemerhatian bacaan, ketepatan mengenal pasti maklumat dan keupayaan murid menunjukkan bukti daripada teks.';
    methodEn='Observation of reading, accuracy in identifying information and pupils’ ability to locate supporting evidence in the text.';
  }else if(skill==='listening_speaking'){
    methodMs='Pemerhatian keupayaan murid mendengar, memahami konteks dan memberikan respons lisan yang sesuai.';
    methodEn='Observation of pupils’ ability to listen, understand the context and give an appropriate oral response.';
  }else if(skill==='grammar'){
    methodMs='Pemerhatian penggunaan bahasa dan semakan jawapan murid dalam aktiviti tatabahasa.';
    methodEn='Observation of language use and review of pupils’ answers in grammar activities.';
  }else if(skill==='product_project'){
    methodMs='Pemerhatian proses, semakan hasil/produk dan penerangan murid tentang tugasan yang dilaksanakan.';
    methodEn='Observation of the process, review of the product and pupils’ explanation of the completed task.';
  }

  let evidence;

  if(subskill==='pantun'){
    evidence=uiEn
      ? `Evidence: pupils' pantun reading, oral responses about its meaning, and completion of the textbook/source task aligned with Learning Standard ${mainSp}.`
      : `Evidens: bacaan pantun murid, respons lisan tentang maksud pantun dan hasil tugasan Buku Teks/sumber yang selaras dengan SP ${mainSp}.`;
  }else if(subskill==='sajak'){
    evidence=uiEn
      ? `Evidence: pupils' poem recital, responses about meaning or message, and completion of the source task aligned with Learning Standard ${mainSp}.`
      : `Evidens: deklamasi sajak, respons tentang maksud atau mesej dan hasil tugasan sumber yang selaras dengan SP ${mainSp}.`;
  }else if(subskill==='cerita'){
    evidence=uiEn
      ? `Pupils' responses about characters or events, story retelling or interpretation, and completion of the source task aligned with Learning Standard ${mainSp}.`
      : `Respons murid tentang watak atau peristiwa, penceritaan semula atau tafsiran cerita dan hasil tugasan sumber yang selaras dengan SP ${mainSp}.`;
  }else if(subskill==='dialog'){
    evidence=uiEn
      ? `Evidence: pupils' spoken responses, turn-taking and completion of the dialogue/source task aligned with Learning Standard ${mainSp}.`
      : `Evidens: respons lisan, giliran bercakap dan hasil tugasan dialog/sumber yang selaras dengan SP ${mainSp}.`;
  }else if(subskill==='lakonan'){
    evidence=uiEn
      ? `Evidence: pupils' actions, speech, participation and completion of the role-play/source task aligned with Learning Standard ${mainSp}.`
      : `Evidens: aksi, ujaran, penglibatan dan hasil tugasan lakonan/sumber yang selaras dengan SP ${mainSp}.`;
  }else if(subskill==='nyanyian'){
    evidence=uiEn
      ? `Evidence: pupils' singing, responses about the lyrics or message, and completion of the source task aligned with Learning Standard ${mainSp}.`
      : `Evidens: nyanyian murid, respons tentang lirik atau mesej dan hasil tugasan sumber yang selaras dengan SP ${mainSp}.`;
  }else if(skill==='writing_sentence'){
    evidence=uiEn
      ? `Pupils' written sentences and completed source task aligned with Learning Standard ${mainSp}.`
      : `Hasil ayat murid dan tugasan sumber yang lengkap serta selaras dengan SP ${mainSp}.`;
  }else if(skill==='reading'){
    evidence=uiEn
      ? `Evidence: pupils' reading responses, identified information and supporting evidence from the source, aligned with Learning Standard ${mainSp}.`
      : `Evidens: respons bacaan murid, maklumat yang dikenal pasti dan bukti sokongan daripada sumber yang selaras dengan SP ${mainSp}.`;
  }else if(skill==='listening_speaking'){
    evidence=uiEn
      ? `Evidence: pupils' oral responses, appropriateness of responses to the source context and completion of the source task aligned with Learning Standard ${mainSp}.`
      : `Evidens: respons lisan murid, kesesuaian respons berdasarkan konteks sumber dan hasil tugasan yang selaras dengan SP ${mainSp}.`;
  }else if(skill==='grammar'){
    evidence=uiEn
      ? `Evidence: pupils' identification and correct use of the target language form, including corrections made to the source task, aligned with Learning Standard ${mainSp}.`
      : `Evidens: keupayaan murid mengenal pasti dan menggunakan bentuk bahasa dengan betul serta membuat pembetulan dalam tugasan sumber yang selaras dengan SP ${mainSp}.`;
  }else if(skill==='product_project'){
    evidence=uiEn
      ? `Evidence: pupils' completed product or task, adherence to the source steps and explanation of the completed work, aligned with Learning Standard ${mainSp}.`
      : `Evidens: hasil produk atau tugasan murid, pematuhan terhadap langkah sumber dan penerangan tentang hasil yang disiapkan, selaras dengan SP ${mainSp}.`;
  }else{
    evidence=uiEn
      ? `Evidence is taken from pupils' observable responses and the completed textbook/source task aligned with Learning Standard ${mainSp}.`
      : `Evidens diambil daripada respons murid yang boleh diperhatikan dan hasil tugasan Buku Teks/sumber yang selaras dengan SP ${mainSp}.`;
  }

  const criterion=map.success_criteria||(
    uiEn
      ? `Pupils demonstrate observable evidence aligned with Learning Standard ${mainSp}.`
      : `Murid menunjukkan evidens yang boleh diperhatikan selaras dengan SP ${mainSp}.`
  );

  evidence=String(evidence||'')
    .replace(/^(Evidence|Evidens):\s*/i,'');

  return {
    method:uiEn?methodEn:methodMs,
    evidence,
    criterion
  };
}

function rphSourceTaskInstruction(map,activities,rawAnchor,page,uiEn){
  const objective=normKey(`${map.objective||''} ${map.success_criteria||''}`);
  const subskill=rphSubskillKey(map,activities);
  const skill=rphSkillKey(map,activities);
  const ref=page||'';

  // Keep the complete, readable instruction extracted from the matched book
  // page.  Subject patterns below are only safe fallbacks for old maps that
  // saved a page reference but not the task itself.
  if(rawAnchor&&!isGenericBookReference(rawAnchor))return rawAnchor;

  if(subskill==='pantun'){
    if(/maksud/.test(objective)&&/gambar/.test(objective)){
      return uiEn
        ? `Pupils read the pantun on ${ref}, observe the source picture and state the meaning of the pantun based on the picture.`
        : `Murid membaca pantun pada ${ref}, memerhati gambar dalam sumber dan menyatakan maksud pantun berdasarkan gambar tersebut.`;
    }

    if(/maksud/.test(objective)){
      return uiEn
        ? `Pupils read the pantun on ${ref} and state its meaning based on the source.`
        : `Murid membaca pantun pada ${ref} dan menyatakan maksud pantun berdasarkan bahan sumber.`;
    }

    return uiEn
      ? `Pupils read the pantun on ${ref} and complete the source task according to the learning objective.`
      : `Murid membaca pantun pada ${ref} dan melaksanakan tugasan sumber mengikut objektif pembelajaran.`;
  }

  if(subskill==='sajak'){
    return uiEn
      ? `Pupils read or recite the poem on ${ref} and respond according to the source task and learning objective.`
      : `Murid membaca atau mendeklamasikan sajak pada ${ref} dan memberikan respons berdasarkan tugasan sumber serta objektif pembelajaran.`;
  }

  if(subskill==='dialog'){
    return uiEn
      ? `Pupils read and perform the dialogue on ${ref}, then respond according to the source context.`
      : `Murid membaca dan melaksanakan dialog pada ${ref}, kemudian memberikan respons berdasarkan konteks sumber.`;
  }

  if(subskill==='nyanyian'){
    return uiEn
      ? `Pupils listen to the song or chant on ${ref}, join in with the repeated lines and practise the target sounds or words clearly.`
      : `Murid mendengar lagu atau chant pada ${ref}, mengikut baris berulang dan berlatih menyebut bunyi atau perkataan sasaran dengan jelas.`;
  }

  if(subskill==='cerita'){
    return uiEn
      ? `Pupils read, listen to or revisit the story on ${ref}, identify relevant characters or events, and respond according to the source task and learning objective.`
      : `Murid membaca, mendengar atau meneliti semula cerita pada ${ref}, mengenal pasti watak atau peristiwa yang berkaitan dan memberikan respons berdasarkan tugasan sumber serta objektif pembelajaran.`;
  }

  if(subskill==='lakonan'){
    return uiEn
      ? `Pupils perform the role play or drama based on ${ref}, using the relevant expressions, actions or responses required by the source task.`
      : `Murid melaksanakan lakonan atau main peranan berdasarkan ${ref} dengan menggunakan ujaran, aksi atau respons yang diperlukan oleh tugasan sumber.`;
  }

  if(skill==='writing_sentence'){
    return uiEn
      ? `Pupils refer to the material on ${ref} and construct sentences according to the source task.`
      : `Murid merujuk bahan pada ${ref} dan membina ayat mengikut tugasan sumber.`;
  }

  if(skill==='reading'){
    return uiEn
      ? `Pupils read the material on ${ref} and respond using information from the text.`
      : `Murid membaca bahan pada ${ref} dan memberikan respons berdasarkan maklumat dalam teks.`;
  }

  if(skill==='listening_speaking'){
    return uiEn
      ? `Pupils listen to or examine the source on ${ref}, then give an appropriate oral response according to the learning objective.`
      : `Murid mendengar atau meneliti bahan pada ${ref}, kemudian memberikan respons lisan yang sesuai berdasarkan objektif pembelajaran.`;
  }

  if(skill==='grammar'){
    return uiEn
      ? `Pupils examine the language examples on ${ref}, identify the target language form and use it correctly according to the source task.`
      : `Murid meneliti contoh bahasa pada ${ref}, mengenal pasti bentuk bahasa yang menjadi fokus dan menggunakannya dengan betul mengikut tugasan sumber.`;
  }

  if(skill==='product_project'){
    return uiEn
      ? `Pupils examine the instructions on ${ref}, follow the source steps to produce the required outcome and check the completed work according to the learning objective.`
      : `Murid meneliti arahan pada ${ref}, mengikuti langkah sumber untuk menghasilkan tugasan yang diperlukan dan menyemak hasil berdasarkan objektif pembelajaran.`;
  }

  return rawAnchor;
}

function rphSourceActivitySteps(map,activities=[],page='',uiEn=false){
  const hasBa=Boolean(map.source_evidence?.meta?.activity_book_uploaded);
  const seen=new Set(),out=[];
  const add=(raw,kind)=>{
    const text=cleanSourceAnchor(raw);
    const key=normalizeActivity(text);
    const isBa=kind==='ba';
    const verified=!isBa?rphVerifiedVisualContext(map,text,page,uiEn):null;
    if(!text||(!verified&&isGenericBookReference(text))||seen.has(key))return;
    seen.add(key);
    const ref=isBa
      ? (uiEn?`Workbook ${map.activity_book_ref||''}`:`Buku Aktiviti ${map.activity_book_ref||''}`)
      : (uiEn?`Student’s Book ${page}`:`Buku Teks ${page}`);
    out.push({
      key:`source-${kind}-${out.length+1}`,
      name:isBa
        ? (uiEn?'Workbook Reinforcement':'Pengukuhan Buku Aktiviti')
        : (uiEn?'Student’s Book Activity':'Aktiviti Buku Teks'),
      text:verified?.sourceText||rphGeneralSourceTaskText(map,{text},'core',uiEn),
      rawText:text,
      bbm:ref.trim(),
      pak21:'',
      phase:'source'
    });
  };

  // Retain the order in which real tasks were found on the verified source
  // pages.  Workbook work is included only when that book is uploaded and
  // supplied an actual instruction for this lesson.
  activities.filter(x=>/\bBT\b|Student['’]s Book/i.test(String(x))).forEach(x=>add(x,'bt'));
  if(hasBa)activities.filter(x=>/^(?:BA\b|Workbook\b)/i.test(String(x).trim())).forEach(x=>add(x,'ba'));
  return out.slice(0,4);
}

function buildSourceAwarePedagogy(map,activities,btRef,uiEn,classId=null){const clean=activities.map(cleanSourceAnchor).filter(Boolean),textbookTask=activities.find(x=>/\bBT\b|Student['’]s Book/i.test(x)),rawAnchor=cleanSourceAnchor(textbookTask)||clean[0]||cleanSourceAnchor(map.source_activities)||map.title||'',page=btRef||'—',anchorBase=rphSourceTaskInstruction(map,activities,rawAnchor,page,uiEn),sourceSteps=rphSourceActivitySteps(map,activities,page,uiEn),anchor=sourceSteps[0]?.rawText||anchorBase,kind=sourceTaskKind([map.objective||'',map.success_criteria||'',...clean],map.subject_id),sciencePattern=map.source_evidence?.meta?.science_task_pattern||scienceTaskPattern(map,activities),pePattern=physicalEducationPattern(map,activities),healthPattern=healthEducationPattern(map,activities),topic=map.title||'',mainSp=map.source_evidence?.meta?.main_sp||String(map.sp||'').split(',')[0]||'',method=chooseSourcePak21(kind,map,classId);const bbmList=extractBBM(map,activities,btRef,uiEn);
const groupBbm={
  support:uiEn
    ? `${page}; cue cards / highlighted source / teacher model`
    : `${page}; kad petunjuk / sumber bertanda / contoh guru`,
  core:uiEn
    ? `${page}; textbook source and task materials`
    : `${page}; sumber buku teks dan bahan tugasan`,
  challenge:uiEn
    ? `${page}; textbook source and extension response material`
    : `${page}; sumber buku teks dan bahan pengayaan`
};const task=`\u201c${anchor}\u201d`;let pakDetail,diffSupport,diffCore,diffChallenge,diffSupportAct,diffCoreAct,diffChallengeAct,setInduksi,penutup;if(uiEn){pakDetail=`Pupil-Active Learning (PAK-21): ${method}. Pupils use the exact textbook task ${task} (${page}) as the base. Each group engages in a different21st-century skill: Explorer Group usesCollaboration & Communication (pair-check with cue cards), Builder Group usesCritical Thinking & Problem-Solving (complete source task with evidence from the page), Challenger Group usesCreativity & Innovation (extend the task with a new example and explain reasoning). All groups share findings on the same Learning Standard ${mainSp}.`;
diffSupport=`Explorer Group — Guided practice with scaffolded support: reduce the number of items/examples from the same textbook page (${page}), provide cue words, word banks, or one worked model. Pupils complete the simplified version of ${task} using the BT page as reference, then check answers with a partner.`;diffCore=`Builder Group — Standard independent task: complete ${task} exactly as required on ${page}, using the examples/text on the textbook page as evidence. Pupils work individually first, then compare results with a partner.`;diffChallenge=`Challenger Group — Extension & enrichment: after completing ${task}, pupils create one new example/response in the same \u201c${topic}\u201d context, explain their reasoning, and connect it to SP ${mainSp}. No change to the Learning Standard.`;diffSupportAct=`With teacher guidance, pupils complete ${task} on ${page} in smaller steps using cues, examples or highlighted parts of the source before attempting it independently.`;diffCoreAct=`Pupils complete the actual task ${task} on ${page}, using the text, pictures or examples on the page to produce their response, then check their work with a partner.`;diffChallengeAct=`After ${task}, create new example in \u201c${topic}\u201d context, explain reasoning, connect to SP ${mainSp}.`;
setInduksi=`Teacher displays a ${kind==='oral'?'short dialogue clip':'visual related to'} \u201c${topic}\u201d from ${page}. Pupils observe and share prior knowledge via Think-Pair-Share. Teacher probes with 2-3 guiding questions to activate schemata. BBM: textbook page ${page} projected on screen.`;penutup=`Teacher recaps the main SP ${mainSp} using a quick-check: each group presents one key takeaway using their completed task as evidence. Teacher distributes a self-reflection slip (\u201cI can...\u201d statement) and assigns follow-up practice if needed.`}else{pakDetail=`Pembelajaran Aktif Murid (PAK-21): ${method}. Murid menggunakan tugasan sebenar buku teks ${task} (${page}) sebagai asas. Setiap kumpulan melibatkan kemahiran abad ke-21 yang berbeza: Kelompok Peneroka menggunakanKerjasama & Komunikasi (semak pasangan dengan kad kata kunci), Kelompok Pembina menggunakanBerfikir Kritis & Menyelesaikan Masalah (lengkapkan tugasan sumber dengan bukti daripada halaman), Kelompok Pencabar menggunakanKreativiti & Inovasi (kembangkan tugasan dengan contoh baru dan jelaskan penaakulan). Semua kumpulan berkongsi penemuan pada SP yang sama ${mainSp}.`;
diffSupport=`Kelompok Peneroka — Latihan berbimbingan dengan sokongan berstruktur: kurangkan bilangan item/contoh daripada halaman buku teks yang sama (${page}), beri kata kunci, bank kata, atau satu contoh yang telah diselesaikan. Murid melengkapkan versi tugasan yang dipermudahkan ${task} menggunakan halaman BT sebagai rujukan, kemudian semak jawapan dengan pasangan.`;diffCore=`Kelompok Pembina — Tugasan standard bebas: lengkapkan ${task} seperti arahan pada ${page} dengan menggunakan contoh/teks pada halaman buku teks sebagai bukti. Murid bekerja secara individu dahulu, kemudian bandingkan hasil dengan pasangan.`;diffChallenge=`Kelompok Pencabar — Pengayaan & pengembangan: selepas melengkapkan ${task}, murid menghasilkan satu contoh/respons baru dalam konteks \u201c${topic}\u201d, menjelaskan penaakulan, dan mengaitkan dengan SP ${mainSp}. Tidak mengubah Standard Pembelajaran.`;diffSupportAct=`Dengan bimbingan guru, murid melaksanakan ${task} pada ${page} secara berperingkat menggunakan petunjuk, contoh atau bahagian sumber yang ditandakan sebelum mencuba sendiri.`;diffCoreAct=`Murid melaksanakan tugasan sebenar ${task} pada ${page}, menggunakan teks, gambar atau contoh pada halaman tersebut untuk menghasilkan jawapan, kemudian menyemak hasil dengan pasangan.`;diffChallengeAct=`Selepas ${task}, hasilkan contoh baru dalam konteks \u201c${topic}\u201d, jelaskan penaakulan, kaitkan dengan SP ${mainSp}.`;
setInduksi=`Guru memaparkan ${kind==='oral'?'klip dialog pendek':'bahan visual berkaitan'} \u201c${topic}\u201d daripada ${page}. Murid memerhati dan berkongsi pengetahuan sedia ada melalui Think-Pair-Share. Guru bertanya 2-3 soalan bimbingan untuk mencetuskan pemikiran. BBM: halaman buku teks ${page} dipaparkan pada skrin.`;penutup=`Guru merumuskan semula SP utama ${mainSp} melalui kuiz pantas: setiap kumpulan membentangkan satu hasil pembelajaran utama menggunakan tugasan yang telah dilengkapkan sebagai bukti. Guru mengagihkan borang refleksi kendiri (\u201cSaya boleh...\u201d) dan memberikan latihan susulan jika perlu.`}
const objKey=normKey(`${map.objective||''} ${map.success_criteria||''}`);
const taskProfile=rphTaskProfile(map,activities);

// Fallbacks are used only when a suitable library row is unavailable.  They
// still read like a real lesson and keep the same source task for all groups.
if(taskProfile==='song'){
  if(uiEn){
    diffSupportAct=`With teacher guidance, pupils echo short repeated lines from the song or chant, using word and phrase cues to practise the target sounds clearly.`;
    diffCoreAct=`Pupils sing or say the selected part of the song or chant in a small group, then complete a lyric-and-phrase matching challenge based on the same page.`;
    diffChallengeAct=`Pupils perform a short part of the song or chant with clear rhythm and pronunciation, then explain which target words they can hear and use.`;
    groupBbm.support=`Student’s Book ${page}; word cues; phrase cards`;
    groupBbm.core=`Student’s Book ${page}; lyric / phrase cards`;
    groupBbm.challenge=`Student’s Book ${page}; performance and evidence cards`;
  }else{
    diffSupportAct=`Dengan bimbingan guru, murid mengikut baris pendek yang berulang daripada lagu atau chant menggunakan kad perkataan dan kad frasa untuk berlatih menyebut bunyi sasaran dengan jelas.`;
    diffCoreAct=`Murid menyanyi atau menyebut bahagian lagu atau chant yang dipilih dalam kumpulan kecil, kemudian menyelesaikan cabaran memadankan lirik dengan frasa berdasarkan halaman yang sama.`;
    diffChallengeAct=`Murid mempersembahkan bahagian pendek lagu atau chant dengan sebutan dan rentak yang jelas, kemudian menerangkan perkataan sasaran yang mereka dengar dan gunakan.`;
    groupBbm.support=`Buku Teks ${page}; kad perkataan; kad frasa`;
    groupBbm.core=`Buku Teks ${page}; kad lirik / frasa`;
    groupBbm.challenge=`Buku Teks ${page}; kad persembahan dan bukti`;
  }
}

if(taskProfile==='poetry'||taskProfile==='story'||taskProfile==='dialogue'){
  const label=taskProfile==='poetry'?(uiEn?'text':'bahan puisi/pantun'):taskProfile==='story'?(uiEn?'story':'cerita'):(uiEn?'dialogue':'dialog');
  if(uiEn){
    diffSupportAct=`With teacher guidance, pupils work with a partner to read or practise a short part of the ${label}, using highlighted words and a prompt card.`;
    diffCoreAct=`Pupils complete the source task from the ${label}, then play a short evidence-card challenge by matching an answer to the correct line, event or expression.`;
    diffChallengeAct=`Pupils complete the same ${label} task, select evidence from the source and present a clear explanation or short performance to the class.`;
  }else{
    diffSupportAct=`Dengan bimbingan guru, murid bekerja secara berpasangan untuk membaca atau melatih bahagian pendek ${label} menggunakan perkataan bertanda dan kad petunjuk.`;
    diffCoreAct=`Murid melaksanakan tugasan sumber daripada ${label}, kemudian bermain cabaran kad bukti dengan memadankan jawapan kepada baris, peristiwa atau ujaran yang betul.`;
    diffChallengeAct=`Murid melaksanakan tugasan ${label} yang sama, memilih bukti daripada sumber dan membentangkan penjelasan atau persembahan ringkas kepada kelas.`;
  }
}

if(/membina ayat|bina ayat|menulis ayat|build sentence|write sentence|construct sentence/.test(objKey)){
  if(uiEn){
    diffSupportAct=`With teacher guidance, pupils use word cards and a simple sentence frame to build a correct sentence related to “${topic}”. Pupils read the completed sentence aloud with the teacher.`;
    diffCoreAct=`Pupils use the picture or idea from “${topic}” to build a simple sentence with minimal teacher guidance, then check spelling and punctuation with a partner.`;
    diffChallengeAct=`Pupils independently build a complete sentence related to “${topic}”, add relevant details, then present the sentence to the class and explain their word choices.`;

    diffSupport=`Guided sentence construction using word cards, sentence frames and teacher modelling.`;
    diffCore=`Simple sentence construction with limited support and peer checking.`;
    diffChallenge=`Independent sentence construction followed by presentation and explanation.`;

    groupBbm.support=`word cards; sentence frame; picture prompt`;
    groupBbm.core=`picture / text prompt; word list`;
    groupBbm.challenge=`source prompt; presentation card`;
  }else{
    diffSupportAct=`Dengan bimbingan guru, murid memilih perkataan mudah berpola KV+KV atau KV+KVK daripada kad kata berkaitan “${topic}”, menyusun perkataan mengikut rangka ayat dan membina ayat mudah berpandukan contoh guru.`;
    diffCoreAct=`Murid menggunakan gambar atau idea berkaitan “${topic}” untuk membina ayat mudah dengan bimbingan minimum guru, kemudian menyemak ejaan dan tanda baca bersama pasangan.`;
    diffChallengeAct=`Murid membina ayat lengkap berkaitan “${topic}” tanpa bimbingan, menambah maklumat yang sesuai, kemudian membentangkan ayat kepada kelas dan menerangkan pilihan perkataan mereka.`;

    diffSupport=`Pembinaan ayat secara berpandu menggunakan kad kata, rangka ayat dan contoh guru.`;
    diffCore=`Pembinaan ayat mudah dengan sokongan minimum dan semakan pasangan.`;
    diffChallenge=`Pembinaan ayat lengkap secara kendiri diikuti pembentangan hasil.`;

    groupBbm.support=`kad kata KV+KV / KV+KVK; rangka ayat; gambar`;
    groupBbm.core=`gambar / bahan rangsangan; senarai kosa kata`;
    groupBbm.challenge=`bahan rangsangan; kad pembentangan`;
  }
}

if(/menghasilkan|membina model|membuat|mencipta|produce|create|make|build/.test(objKey)&&!/ayat|sentence/.test(objKey)){
  if(uiEn){
    diffSupportAct=`With teacher guidance, pupils follow the source steps one by one to assemble the product related to “${topic}”. The teacher checks each stage before pupils continue.`;
    diffCoreAct=`Pupils follow the source instructions to make the product, test whether it performs its intended function, and make a simple correction if needed.`;
    diffChallengeAct=`Pupils complete the product with minimal guidance, improve one feature, test its function, then demonstrate and explain their improvement to the class.`;
  }else{
    diffSupportAct=`Dengan bimbingan guru, murid mengikuti langkah dalam sumber satu demi satu untuk menghasilkan “${topic}”. Guru menyemak setiap peringkat sebelum murid meneruskan langkah berikutnya.`;
    diffCoreAct=`Murid mengikuti arahan sumber untuk menghasilkan “${topic}”, menguji sama ada hasil tersebut berfungsi mengikut tujuan dan membuat pembetulan mudah jika perlu.`;
    diffChallengeAct=`Murid menghasilkan “${topic}” dengan bimbingan minimum, menambah baik satu ciri, menguji fungsinya, kemudian membuat demonstrasi dan menerangkan penambahbaikan kepada kelas.`;
  }
}

if(/membaca|memahami petikan|bacaan|read|reading|understand text/.test(objKey)){
  if(uiEn){
    diffSupportAct=`With teacher guidance, pupils read the selected text in short parts, identify key words using visual or word cues, and answer simple questions based directly on the text.`;
    diffCoreAct=`Pupils read the text independently or with a partner, identify key information and answer comprehension questions by referring to evidence in the text.`;
    diffChallengeAct=`Pupils read the text independently, identify explicit and relevant supporting information, explain their answers using textual evidence, then share their findings with the class.`;
  }else{
    diffSupportAct=`Dengan bimbingan guru, murid membaca petikan secara bahagian demi bahagian, mengenal pasti perkataan penting menggunakan gambar atau kad petunjuk dan menjawab soalan mudah berdasarkan maklumat yang dinyatakan secara langsung.`;
    diffCoreAct=`Murid membaca petikan secara kendiri atau berpasangan, mengenal pasti maklumat penting dan menjawab soalan pemahaman dengan merujuk bukti dalam petikan.`;
    diffChallengeAct=`Murid membaca petikan secara kendiri, mengenal pasti maklumat utama dan bukti sokongan, menerangkan jawapan berdasarkan petikan kemudian berkongsi dapatan dengan kelas.`;
  }
}

if(/bertutur|berdialog|berkomunikasi|bercerita|speaking|speak|dialogue|conversation|communicate/.test(objKey)){
  if(uiEn){
    diffSupportAct=`With teacher guidance, pupils use a short model sentence or dialogue frame to practise the target expression with a partner.`;
    diffCoreAct=`Pupils carry out a simple dialogue with a partner using suitable expressions, with minimal teacher support.`;
    diffChallengeAct=`Pupils conduct a complete dialogue independently, add relevant information, then present or role-play it to the class.`;
  }else{
    diffSupportAct=`Dengan bimbingan guru, murid menggunakan ayat contoh atau rangka dialog ringkas untuk berlatih menyebut ungkapan sasaran bersama pasangan.`;
    diffCoreAct=`Murid menjalankan dialog mudah bersama pasangan menggunakan ungkapan yang sesuai dengan bimbingan minimum guru.`;
    diffChallengeAct=`Murid menjalankan dialog lengkap secara kendiri, menambah maklumat yang sesuai kemudian mempersembahkan atau melakonkan dialog di hadapan kelas.`;
  }
}

if(/kata nama|kata kerja|kata adjektif|kata ganda|kata majmuk|ayat tunggal|ayat majmuk|tatabahasa|mengenal pasti|mengelaskan|identify|classify|grammar|noun|verb|adjective/.test(objKey)){
  if(uiEn){
    diffSupportAct=`With teacher guidance, pupils identify the target language item from selected examples using colour coding, matching cards or a simple category guide.`;
    diffCoreAct=`Pupils identify and classify the target language items from the given text or examples, then compare their answers with a partner.`;
    diffChallengeAct=`Pupils identify and classify the target language items independently, justify their choices, then create new examples and present them to the class.`;
  }else{
    diffSupportAct=`Dengan bimbingan guru, murid mengenal pasti unsur bahasa sasaran daripada contoh terpilih menggunakan kod warna, kad padanan atau panduan kategori yang mudah.`;
    diffCoreAct=`Murid mengenal pasti dan mengelaskan unsur bahasa sasaran daripada teks atau contoh yang diberi, kemudian membandingkan jawapan bersama pasangan.`;
    diffChallengeAct=`Murid mengenal pasti dan mengelaskan unsur bahasa sasaran secara kendiri, menerangkan sebab pemilihan, kemudian membina contoh baharu dan membentangkannya kepada kelas.`;
  }
}

if(sciencePattern){
  const scienceDiff=scienceDifferentiation(sciencePattern,anchor,page,uiEn);
  diffSupport=diffSupportAct=scienceDiff.support;
  diffCore=diffCoreAct=scienceDiff.core;
  diffChallenge=diffChallengeAct=scienceDiff.challenge;
}
if(pePattern){
  const peDiff=physicalEducationDifferentiation(pePattern,anchor,page,uiEn);
  diffSupport=diffSupportAct=peDiff.support;
  diffCore=diffCoreAct=peDiff.core;
  diffChallenge=diffChallengeAct=peDiff.challenge;
  groupBbm.support=`Buku Teks ${page}; alatan aktiviti; penanda ruang; kad semak teknik`;
  groupBbm.core=`Buku Teks ${page}; alatan aktiviti; kon / penanda ruang; kad peraturan`;
  groupBbm.challenge=`Buku Teks ${page}; alatan aktiviti; sasaran ketepatan; kad refleksi teknik`;
}
if(healthPattern){
  const healthDiff=healthEducationDifferentiation(healthPattern,anchor,page);
  diffSupport=diffSupportAct=healthDiff.support;
  diffCore=diffCoreAct=healthDiff.core;
  diffChallenge=diffChallengeAct=healthDiff.challenge;
  groupBbm.support=`Buku Teks ${page}; kad gambar; kad kata kunci; kad pilihan tindakan`;
  groupBbm.core=`Buku Teks ${page}; kad situasi rekaan; papan jawapan; hasil tugasan murid`;
  groupBbm.challenge=`Buku Teks ${page}; kad sebab dan akibat; kad keputusan; kad refleksi peribadi`;
}

const inductionRow=pickLibraryInduction(
  map.subject_id,map,activities,classId
);
const inductionData=renderLibraryInduction(inductionRow,map,activities,page);

setInduksi=inductionData?.text
  ||sourceSetInduction(map,page,topic,uiEn);

penutup=sourceClosure(map,page,topic,uiEn);

const usedAcrossGroups=new Set();
const weeklyPlan=rphWeeklyActivityPlan(map.subject_id,map,classId);
const weeklySteps={
  support:rphWeeklyVariationStep(weeklyPlan,map,anchor,page,'support',uiEn),
  core:rphWeeklyVariationStep(weeklyPlan,map,anchor,page,'core',uiEn),
  challenge:rphWeeklyVariationStep(weeklyPlan,map,anchor,page,'challenge',uiEn)
};

const libraryCandidates={
  support:[weeklySteps.support,...rphLibraryLessonSteps(
    map.subject_id,map,activities,'support',anchor,page,classId,usedAcrossGroups
  )].filter(Boolean),
  core:[weeklySteps.core,...rphLibraryLessonSteps(
    map.subject_id,map,activities,'core',anchor,page,classId,usedAcrossGroups
  )].filter(Boolean),
  challenge:[weeklySteps.challenge,...rphLibraryLessonSteps(
    map.subject_id,map,activities,'challenge',anchor,page,classId,usedAcrossGroups
  )].filter(Boolean)
};

// Source-first composition: every group works from the real book task first.
// The Activity Library contributes at most one optional variation after the
// source execution and its evidence/checking step.
const librarySteps={
  support:rphSourceFirstGroupSteps(map,sourceSteps,libraryCandidates.support,'support',uiEn),
  core:rphSourceFirstGroupSteps(map,sourceSteps,libraryCandidates.core,'core',uiEn),
  challenge:rphSourceFirstGroupSteps(map,sourceSteps,libraryCandidates.challenge,'challenge',uiEn)
};

const pbdEvidence=rphBuildPbdEvidence(
  map,activities,librarySteps,uiEn
);

penutup=rphBuildClosure(
  map,activities,librarySteps,uiEn
);

return {method,pakDetail,diffSupport,diffCore,diffChallenge,diffSupportAct,diffCoreAct,diffChallengeAct,setInduksi,penutup,anchor,sourceSteps,kind,bbmList,groupBbm,mainSp,page,topic,librarySteps,weeklyPlan,inductionData,pbdEvidence}}
function extractBBM(map,activities,btRef,uiEn){const bbm=[];const page=btRef||'';const topic=map.title||'';const mainSp=map.source_evidence?.meta?.main_sp||'';bbm.push(uiEn?`Student's Book ${page}`:`Buku Teks ${page}`);if(map.activity_book_ref&&map.source_evidence?.meta?.activity_book_uploaded)bbm.push(uiEn?`Workbook ${map.activity_book_ref}`:`Buku Aktiviti ${map.activity_book_ref}`);if(map.source_evidence?.textbook)bbm.push(uiEn?'Source pages from uploaded documents':'Petikan halaman daripada dokumen yang diupload');const hay=normKey(activities.join(' '));if(/poster|peta minda|lukis/.test(hay))bbm.push(uiEn?`Poster / mind map on "${topic}"`:`Poster / peta minda tentang \u201c${topic}\u201d`);if(/kad|card|matching/.test(hay))bbm.push(uiEn?`Flashcards / matching cards for "${topic}"`:`Kad imlak / kad padanan untuk \u201c${topic}\u201d`);if(/lagu|nyanyi|audio/.test(hay))bbm.push(uiEn?`Audio / song clip related to "${topic}"`:`Audio / klip lagu berkaitan \u201c${topic}\u201d`);if(/video|klip|tayang/.test(hay))bbm.push(uiEn?`Video clip on "${topic}"`:`Klip video tentang \u201c${topic}\u201d`);bbm.push(uiEn?`Worksheet / exercise paper for SP ${mainSp}`:`Lembaran kerja untuk SP ${mainSp}`);bbm.push(uiEn?`Word bank / cue cards based on ${page}`:`Bank kata / kad kata kunci berdasarkan ${page}`);bbm.push(uiEn?`Teacher's guide from DSKP (SP ${mainSp})`:`Panduan guru daripada DSKP (SP ${mainSp})`);return bbm}
function selectedTeacherSchedule(){if(isAdmin())return null;return selectedRphSchedule()}
async function generateRph(){
  if(!requireAuth())return;
  const btn=$('#generateRph');if(btn)btn.disabled=true;
  try{
    await withTimeout(generateRphContent(),25000,'Penjanaan RPH');
    const preview=$('#rphPreview');
    if(preview&&!preview.classList.contains('hidden'))preview.scrollIntoView({behavior:'smooth',block:'start'});
  }catch(error){
    console.error('Generate RPH failed:',error);
    state.currentGeneratedRph=null;
    clearSourceReadCache();
    const raw=String(error?.message||'Ralat tidak diketahui.');
    const sourceIssue=/RPH_SOURCE_FILES|Cloudflare R2|Google API|HTTP 5\d\d|failed to fetch|network|melebihi/i.test(raw);
    const hint=sourceIssue?' Fail sumber tidak dapat dibaca. Semak sambungan internet dan binding Cloudflare R2 (RPH_SOURCE_FILES), kemudian cuba lagi.':'';
    const empty=$('#rphEmpty'),preview=$('#rphPreview');
    if(empty){empty.innerHTML=`<b>RPH tidak dapat dipaparkan.</b><br>${escapeHtml(raw)}${escapeHtml(hint)}<br><button id="retryGenerateRph" class="ghost" type="button">Cuba Jana Semula</button>`;empty.classList.remove('hidden')}
    if(preview)preview.classList.add('hidden');
    $('#retryGenerateRph')?.addEventListener('click',generateRph,{once:true});
    toast('Jana RPH gagal: '+raw,8000);
  }finally{if(btn)btn.disabled=false}
}
async function generateRphContent(){
  const classId=$('#rphClass').value,subjectId=$('#rphSubject').value,cls=getClass(classId),sub=getSubject(subjectId),week=Number($('#rphWeek').value),date=$('#rphDate').value,schedule=selectedRphSchedule(),route=timetableLessonRoute(classId,subjectId,date),lessonTime=$('#rphTime')?.value||(schedule?scheduleTimeLabel(schedule):''),scheduleRequired=!isAdmin();if(!cls||!sub)return toast('Pilih kelas dan subjek atau pilih Sesi Jadual Guru.');
  let map=selectVerifiedLessonMap(classId,subjectId,week,date);if(!map){const routeNote=!isAdmin()&&route.available?` Jadual menetapkan Sesi ${route.session_no||'?'} daripada ${route.total}; sahkan Lesson Map sesi itu, bukan sesi lain.`:'';renderRphGate(null);$('#rphEmpty').innerHTML=`<b>RPH tidak dijana.</b><br>Tiada Lesson Map yang DISAHKAN untuk ${escapeHtml(sub.name)} Tahun ${cls.year}, Minggu ${week}.${escapeHtml(routeNote)}<br><button class="ghost" data-go-inline="lessonmap">Bina Lesson Map</button>`;$('#rphEmpty').classList.remove('hidden');$('#rphPreview').classList.add('hidden');$('[data-go-inline="lessonmap"]')?.addEventListener('click',()=>{$('#mapSubject').value=subjectId;$('#mapYear').value=cls.year;$('#mapWeek').value=week;$('#mapSession').value=route.session_no||1;go('lessonmap')});return toast('Accuracy Gate menghalang RPH generik. Sahkan Lesson Map sesi jadual dahulu.',5000)}
  $('#rphEmpty').textContent='Membaca aktiviti sebenar pada halaman Buku Teks dan membina PdP source-first...';$('#rphEmpty').classList.remove('hidden');$('#rphPreview').classList.add('hidden');
  const ev=await lessonPageEvidence(map);const built=buildSourceActivities(map,ev,classId);map=effectiveRphLessonMap(map,ev,built);const validation=validateRphMap(map,ev,built);
  if(scheduleRequired)validation.checks.push({n:'Jadual guru dipadankan',ok:!!schedule&&schedule.class_id===classId&&schedule.subject_id===subjectId&&!!String(schedule.start_time||'').trim()});
  if(!isAdmin()&&route.available)validation.checks.push({n:`Sesi RPT ikut jadual (${route.session_no||'?'} / ${route.total})`,ok:!!route.entry&&Number(map.session_no)===Number(route.session_no)});
  validation.score=Math.round(validation.checks.filter(x=>x.ok).length/validation.checks.length*100);
  renderRphGate(validation);if(validation.checks.some(x=>!x.ok)){$('#rphEmpty').innerHTML='<b>Accuracy Gate gagal.</b><br>Semua semakan mesti lulus sebelum RPH accurate boleh dijana. Buka Lesson Map dan baiki item bertanda ✕.';return toast('RPH disekat: masih ada semakan accuracy yang gagal.',5000)}
  const uiEn=lessonLanguage(subjectId)==='en';const btRef=map.textbook_page_start?`${uiEn?'p.':'m/s'} ${map.textbook_page_start}${map.textbook_page_end&&map.textbook_page_end!==map.textbook_page_start?'–'+map.textbook_page_end:''}`:'—';let activities=built.activities.length?built.activities:(map.source_activities?[map.source_activities].filter(Boolean):[]);if(!activities.length&&map.source_evidence?.meta?.rpt_activity){activities=map.source_evidence.meta.rpt_activity.split(/[|;\n]/).map(s=>s.trim()).filter(s=>s.length>5)}const pedagogy=buildSourceAwarePedagogy(map,activities,btRef,uiEn,classId);
  const numbered=activities.map((a,i)=>`${i+1}. ${a}`).join('\n');const evidenceRefs=[...ev.bt.map(p=>`${p.doc?.file_name} ${uiEn?'p.':'m/s'} ${p.printed_page||p.page_no}`),...ev.ba.map(p=>`${p.doc?.file_name} ${uiEn?'p.':'m/s'} ${p.printed_page||p.page_no}`)];const teacherName=state.profile?.full_name||state.access?.display_name||state.user?.email||'—';
  const html=`<div class="rph-title"><div class="eyebrow">${uiEn?'DAILY LESSON PLAN':'RANCANGAN PENGAJARAN HARIAN'} • SOURCE-FIRST</div><h2>${escapeHtml(sub.name)}</h2><b>${escapeHtml(cls.name)} • ${escapeHtml(date)} • ${escapeHtml(lessonTime||'—')} • ${uiEn?'Week':'Minggu'} ${week} • ${uiEn?'Lesson':'Sesi'} ${map.session_no}</b></div>
  <div class="source-trace"><span>✓ ${uiEn?'Verified Lesson Map':'Lesson Map disahkan'}</span><span>Source Match ${map.confidence_score}%</span><span>${uiEn?"Student's Book":'BT'} ${escapeHtml(btRef)}</span><span>${uiEn?'Teacher timetable':'Jadual guru'} ✓</span></div>
  <div class="rph-grid"><div>${uiEn?'Teacher':'Guru'}</div><div>${escapeHtml(teacherName)}</div><div>${uiEn?'Date':'Tarikh'}</div><div>${escapeHtml(date)}</div><div>${uiEn?'Teaching time':'Masa Mengajar'}</div><div>${escapeHtml(lessonTime||'—')}</div><div>${uiEn?'Week':'Minggu'}</div><div>${week}</div><div>${uiEn?'Subject':'Subjek'}</div><div>${escapeHtml(sub.name)}</div><div>${uiEn?'Class / Year':'Kelas / Tahun'}</div><div>${escapeHtml(cls.name)} / ${uiEn?'Year':'Tahun'} ${cls.year}</div><div>${uiEn?'Topic / Focus':'Tajuk/Fokus'}</div><div>${escapeHtml(map.title)}</div><div>${uiEn?'Content Standard':'Standard Kandungan'}</div><div>${escapeHtml(map.sk)}</div><div>${uiEn?'Main Learning Standard':'SP Utama / Main LS'}</div><div>${escapeHtml(map.source_evidence?.meta?.main_sp||String(map.sp||'').split(',')[0]||'—')}</div><div>${uiEn?'Complementary Learning Standard(s)':'SP Sokongan / Complementary LS'}</div><div>${escapeHtml((map.source_evidence?.meta?.complementary_sp||[]).join?map.source_evidence.meta.complementary_sp.join(', '):(map.source_evidence?.meta?.complementary_sp||'—'))}</div><div>${uiEn?'All Learning Standards':'Semua Standard Pembelajaran'}</div><div>${escapeHtml(map.sp)}</div><div>${uiEn?'Learning Objective':'Objektif'}</div><div>${escapeHtml(map.objective||(uiEn?'Complete the Learning Objective in the verified Lesson Map.':'Objektif perlu dilengkapkan pada Lesson Map berdasarkan SP.'))}</div><div>${uiEn?'Success Criteria':'Kriteria Kejayaan'}</div><div>${escapeHtml(map.success_criteria||(uiEn?'Complete the Success Criteria in the verified Lesson Map.':'Kriteria kejayaan perlu dilengkapkan pada Lesson Map.'))}</div><div>${uiEn?'Stage of Learning':'Perkembangan Pelajaran'}</div><div>${escapeHtml(uiEn?({introduction:'Introduction',guided:'Guided practice',application:'Application',assessment:'Assessment / Reinforcement',enrichment:'Enrichment'}[map.progression_stage]||map.progression_stage):stageLabel(map.progression_stage))}</div><div>${uiEn?"Student's Book reference":'Rujukan Buku Teks'}</div><div>${escapeHtml(btRef)}</div>${map.source_evidence?.meta?.activity_book_uploaded?`<div>${uiEn?'Workbook':'Buku Aktiviti'}</div><div>${escapeHtml(map.activity_book_ref||'—')}</div>`:''}</div>
  <div class="rph-section">
  <div class="rph-section-header"><span class="rph-section-num">1</span><h3>${uiEn?'Set Induction':'Set Induksi'}</h3></div><div class="rph-section-body">${rphInductionHtml(pedagogy,uiEn)}</div></div>

  <div class="rph-section">
  <div class="rph-section-header"><span class="rph-section-num">2</span><h3>${uiEn?'Learning Activities':'Aktiviti PdP'}</h3></div><div class="rph-section-body">
  <div class="rph-activity-block"><div class="rph-activity-label">${uiEn?'Source Activities from the Book':'Aktiviti Sumber daripada Buku'}</div><div class="rph-source-badge">📖 ${uiEn?'Based on':'Berdasarkan'} ${escapeHtml(btRef)}</div>${rphSourceStepsHtml(pedagogy.sourceSteps,pedagogy.anchor,uiEn)}<div class="rph-source-links"><span class="rph-source-tag">${uiEn?'RPT':'RPT'}</span><span class="rph-source-tag">${uiEn?'DSKP':'DSKP'}</span><span class="rph-source-tag">${uiEn?'Student\'s Book':'Buku Teks'}</span>${map.source_evidence?.meta?.activity_book_uploaded?`<span class="rph-source-tag">${uiEn?'Workbook':'Buku Aktiviti'}</span>`:''}</div></div>

  <div class="rph-activity-block"><div class="rph-activity-label">${uiEn?'Differentiated Instruction (3 Groups)':'PdP Terbeza (3 Kumpulan)'}</div><div class="group-suggestion"><div class="group-card group-explorer"><b>${uiEn?'Explorer Group':'Kelompok Peneroka'}</b><br><small>${uiEn?'(guided support — collaboration & communication)':'(bimbingan — kerjasama & komunikasi)'}</small><br>${rphGroupStepsHtml(pedagogy.librarySteps?.support,pedagogy.diffSupportAct,uiEn)}</div><div class="group-card group-builder"><b>${uiEn?'Builder Group':'Kelompok Pembina'}</b><br><small>${uiEn?'(standard task — critical thinking & problem-solving)':'(tugasan standard — berfikir kritis & menyelesaikan masalah)'}</small><br>${rphGroupStepsHtml(pedagogy.librarySteps?.core,pedagogy.diffCoreAct,uiEn)}</div><div class="group-card group-challenger"><b>${uiEn?'Challenger Group':'Kelompok Pencabar'}</b><br><small>${uiEn?'(extension — creativity & innovation)':'(pengayaan — kreativiti & inovasi)'}</small><br>${rphGroupStepsHtml(pedagogy.librarySteps?.challenge,pedagogy.diffChallengeAct,uiEn)}</div></div></div>

  </div></div>

  <div class="rph-section">
  <div class="rph-section-header"><span class="rph-section-num">3</span><h3>${uiEn?'Classroom Assessment (PBD)':'Pentaksiran Bilik Darjah (PBD)'}</h3></div><div class="rph-section-body">
  <table class="rph-step-table rph-pbd-table"><tbody><tr><th>${uiEn?'Assessment Method':'Kaedah Pentaksiran'}</th><td>${escapeHtml(pedagogy.pbdEvidence?.method||'')}</td></tr><tr><th>${uiEn?'Evidence':'Evidens'}</th><td>${escapeHtml(pedagogy.pbdEvidence?.evidence||'')}</td></tr><tr><th>${uiEn?'Success Criterion':'Kriteria Kejayaan'}</th><td>${escapeHtml(pedagogy.pbdEvidence?.criterion||map.success_criteria||'')}</td></tr></tbody></table>
</div></div>

  <div class="rph-section">
  <div class="rph-section-header"><span class="rph-section-num">4</span><h3>${uiEn?'Closure':'Penutup'}</h3></div><div class="rph-section-body"><div class="rph-closure">${escapeHtml(pedagogy.penutup)}</div></div></div>

  <div class="source-proof"><b>${uiEn?'Source trail':'Jejak sumber'}</b><p>${escapeHtml(evidenceRefs.join(' • ')||(uiEn?'Page evidence is stored in the Lesson Map.':'Bukti halaman disimpan dalam Lesson Map.'))}</p><details><summary>${uiEn?'View page excerpts':'Lihat petikan halaman'}</summary><pre>${escapeHtml([...ev.bt,...ev.ba].map(p=>`[${p.doc?.file_name} • ${uiEn?'p.':'m/s'} ${p.printed_page||p.page_no}]\n${snippet(p.content,650)}`).join('\n\n'))}</pre></details></div>
  ${(()=>{const L=reflectionLabels(uiEn);const total=state.students.filter(s=>s.class_id===classId).length;const email=escapeHtml(state.user?.email||'');const driveLabel=uiEn?'Google Workspace account':'Akaun Google Workspace';const currentLabel=uiEn?`Use signed-in DELIMa account${email?': '+email:''}`:`Guna akaun DELIMa login semasa${email?': '+email:''}`;const otherLabel=uiEn?'Choose another Google account':'Pilih akaun Google lain';return `<section class="rph-reflection no-print-export"><h3>${L.title}</h3><div class="reflection-grid"><label>${L.total}<input id="rphRefTotal" type="number" min="0" value="${total}"></label><label>${L.present}<input id="rphRefPresent" type="number" min="0" value="${total}"></label><label>${L.achieved}<input id="rphRefAchieved" type="number" min="0"></label><label>${L.active}<input id="rphRefActive" type="number" min="0"></label></div><label>${L.note}<textarea id="rphRefNote" rows="2" placeholder="${L.placeholder}"></textarea></label><button id="generateRphReflection" type="button" class="ghost">✨ ${L.generate}</button><textarea id="rphReflectionText" rows="4" placeholder="${L.empty}"></textarea><div id="rphReflectionView" class="reflection-output-view hidden"></div></section><div class="drive-account-picker no-print-export"><label>${driveLabel}<select id="rphDriveAccountMode"><option value="current">${currentLabel}</option><option value="other">${otherLabel}</option></select></label></div><div class="classroom-picker no-print-export"><div class="classroom-picker-head"><div><b>Google Classroom</b><small>${uiEn?'Send this RPH as a teacher-only draft first.':'Hantar RPH ini sebagai draf yang hanya boleh dilihat guru dahulu.'}</small></div><button id="loadClassrooms" class="ghost" type="button">🔗 ${uiEn?'Connect Classroom':'Hubungkan Classroom'}</button></div><div class="classroom-picker-grid"><label>${uiEn?'Classroom':'Google Classroom'}<select id="rphClassroomCourse"><option value="">${uiEn?'Connect Classroom first':'Hubungkan Classroom dahulu'}</option></select></label><label>${uiEn?'Topic (optional)':'Topik (opsyenal)'}<select id="rphClassroomTopic"><option value="">${uiEn?'No topic selected':'Tiada topik dipilih'}</option></select></label></div><label class="classroom-auto"><input id="rphClassroomAuto" type="checkbox"> <span>${uiEn?'Automatically create a draft after saving the RPH':'Auto cipta draf selepas Simpan RPH'}</span></label><small id="rphClassroomStatus" class="classroom-status">${uiEn?'PBD and student data are not sent.':'Data PBD dan murid tidak dihantar.'}</small></div><div class="rph-action-grid no-print-export"><button id="saveGeneratedRph" class="primary" type="button">💾 ${L.save}</button><button id="downloadRphWord" class="ghost" type="button">📄 ${L.word}</button><button id="uploadRphDrive" class="ghost" type="button">☁️ ${L.drive}</button><button id="sendRphClassroom" class="ghost" type="button">🏫 ${uiEn?'Send Classroom Draft':'Hantar Draf Classroom'}</button><button id="printGeneratedRph" class="ghost" type="button">🖨️ ${L.print}</button></div>`})()}`;
  $('#rphPreview').innerHTML=html;$('#rphPreview').classList.remove('hidden');$('#rphEmpty').classList.add('hidden');
  state.currentGeneratedRph={map,classId,subjectId,date,week,lessonTime,teacherName,activities,validation,built,html,uiEn,btRef,pedagogy,evidenceRefs};
  $('#generateRphReflection')?.addEventListener('click',generateReflectionText);$('#saveGeneratedRph')?.addEventListener('click',()=>saveGeneratedRphAndMaybeClassroom(state.currentGeneratedRph));$('#downloadRphWord')?.addEventListener('click',downloadGeneratedRph);$('#uploadRphDrive')?.addEventListener('click',uploadGeneratedRphToDrive);$('#loadClassrooms')?.addEventListener('click',connectGoogleClassroom);$('#rphClassroomCourse')?.addEventListener('change',refreshClassroomTopics);$('#sendRphClassroom')?.addEventListener('click',()=>sendGeneratedRphToClassroom());$('#rphDriveAccountMode')?.addEventListener('change',resetDriveToken);$('#printGeneratedRph')?.addEventListener('click',printGeneratedRph);
}
async function saveGeneratedRphRecord(ctx){const {map,classId,subjectId,date,week,activities,validation,built}=ctx;const reflection=currentReflectionData();const payload={teacher_id:state.user?.id||'demo',class_id:classId,subject_id:subjectId,lesson_date:date,week_no:week,lesson_map_id:map.id||null,title:map.title,rph_json:{lesson_map_id:map.id,source_match:map.confidence_score,validation_score:validation.score,activities,bt:[map.textbook_page_start,map.textbook_page_end],ba:map.activity_book_ref,progression_stage:map.progression_stage,lesson_time:ctx.lessonTime||null,teacher_name:ctx.teacherName||null,pak21:ctx.pedagogy?.method||null,
induction_key:ctx.pedagogy?.inductionData?.key||null,
activity_library_types:rphActivityTypesFromSteps(
  ctx.pedagogy?.librarySteps
),
activity_library_keys:ctx.pedagogy?.librarySteps
  ? [...new Set([
      ...(ctx.pedagogy.librarySteps.support||[]),
      ...(ctx.pedagogy.librarySteps.core||[]),
      ...(ctx.pedagogy.librarySteps.challenge||[])
    ].map(x=>x.key).filter(x=>x&&!String(x).startsWith('source-')))]
  : [],differentiation:ctx.pedagogy?{support:ctx.pedagogy.diffSupport,core:ctx.pedagogy.diffCore,challenge:ctx.pedagogy.diffChallenge,support_act:ctx.pedagogy.diffSupportAct,core_act:ctx.pedagogy.diffCoreAct,challenge_act:ctx.pedagogy.diffChallengeAct}:null,main_sp:map.source_evidence?.meta?.main_sp||null,complementary_sp:map.source_evidence?.meta?.complementary_sp||[],complementary_evidence:map.source_evidence?.meta?.complementary_evidence||'',reflection},source_match_score:map.confidence_score,validation_score:validation.score};if(state.connected&&state.user){const {data,error}=await state.client.from('rph_records').upsert(payload,{onConflict:'teacher_id,class_id,subject_id,lesson_date'}).select().single();if(error){toast('Simpan RPH gagal: '+error.message);return false}const hist=activities.map((a,i)=>({teacher_id:state.user.id,class_id:classId,subject_id:subjectId,lesson_date:date,week_no:week,lesson_map_id:map.id,rph_record_id:data.id,activity_no:i+1,activity_text:a,activity_fingerprint:normalizeActivity(a),similarity_to_recent:Math.round(maxActivitySimilarity(a,subjectId,classId)*10000)/10000}));await state.client.from('rph_activity_history').delete().eq('rph_record_id',data.id);if(hist.length)await state.client.from('rph_activity_history').insert(hist);await logAudit('SAVE_ACCURATE_RPH',{rph_record_id:data.id,lesson_map_id:map.id,validation:validation.score,similarity:built.similarity});await loadAll()}toast(ctx.uiEn?'Lesson plan saved. Activity history is now used for anti-repeat.':'RPH berjaya disimpan. Sejarah aktiviti kini digunakan untuk anti-repeat.');return true}

async function saveGeneratedRphAndMaybeClassroom(ctx){
  const auto=Boolean($('#rphClassroomAuto')?.checked),saved=await saveGeneratedRphRecord(ctx);if(!saved||!auto)return saved;
  if(!DRIVE_ACCESS_TOKEN||Date.now()>=DRIVE_TOKEN_EXPIRES_AT-60000){toast('RPH sudah disimpan. Hubungkan Google Classroom dahulu untuk mengaktifkan auto hantar.',6500);return true}
  await sendGeneratedRphToClassroom({auto:true});return true;
}

async function detectStandards(){if(!requireAuth())return;
  const subjectId=$('#sourceSubject').value,year=Number($('#sourceYear').value),ay=Number($('#sourceAcademicYear').value||new Date().getFullYear());if(!subjectId)return toast('Pilih subjek.');const chunks=await getChunksForSubject(subjectId,year,ay);const usable=chunks.filter(x=>['dskp','rpt'].includes(x.doc?.source_type));if(!usable.length)return toast('Upload DSKP atau RPT dahulu.');
  const map=new Map();usable.forEach(ch=>{const text=normalizeText(ch.content);const re=/\b(\d{1,2}\.\d{1,2}\.\d{1,2})\b/g;let m;while((m=re.exec(text))){const code=m[1];let tail=text.slice(m.index+code.length,m.index+code.length+260).split(/\n|\r|\.{2,}/)[0].trim().replace(/^[-:–—\s]+/,'');if(tail.length<8)tail=text.slice(m.index+code.length,m.index+code.length+180).trim();if(!map.has(code)||map.get(code).description.length<tail.length)map.set(code,{code,description:tail.slice(0,220),source:ch.doc?.file_name||''})}});
  state.detectedStandards=[...map.values()].slice(0,120);if(!state.detectedStandards.length)return toast('Tiada pola kod SP dikesan. Anda masih boleh tambah SP secara manual kemudian.');
  $('#detectedStandards').innerHTML=state.detectedStandards.map((x,i)=>`<label class="detect-item"><input type="checkbox" class="detect-check" data-i="${i}" checked><input type="text" class="detect-code" data-i="${i}" value="${escapeHtml(x.code)}"><input type="text" class="detect-desc" data-i="${i}" value="${escapeHtml(x.description)}"></label>`).join('');$('#importDetectedStandards').classList.remove('hidden');toast(`${state.detectedStandards.length} kemungkinan SP dikesan. Semak sebelum import.`)
}
async function importDetectedStandards(){if(!requireAuth())return;const subjectId=$('#sourceSubject').value,year=Number($('#sourceYear').value);const selected=$$('.detect-check:checked').map(cb=>{const i=cb.dataset.i,code=$(`.detect-code[data-i="${i}"]`).value.trim(),description=$(`.detect-desc[data-i="${i}"]`).value.trim();return {subject_id:subjectId,year,code,description:description||'Perlu semakan guru',sk_code:code.split('.').slice(0,2).join('.'),source_ref:'Auto-detect daripada fail upload'}}).filter(x=>x.code);if(!selected.length)return toast('Tiada SP dipilih.');if(state.connected&&state.user){const {error}=await state.client.from('curriculum_standards').upsert(selected,{onConflict:'subject_id,year,code'});if(error)return toast('Import SP gagal: '+error.message);await logAudit('IMPORT_STANDARDS',{count:selected.length,subject_id:subjectId,year});await loadAll()}else{selected.forEach(x=>{if(!state.standards.some(s=>s.subject_id===x.subject_id&&s.year===x.year&&s.code===x.code))state.standards.push({id:crypto.randomUUID(),...x})});hydrate()}toast(`${selected.length} SP berjaya diimport.`)}

function go(id){if(!requireAuth())return;$$('.view').forEach(v=>v.classList.toggle('active',v.id===id));$$('.hud-nav button,.bottom-nav button').forEach(b=>b.classList.toggle('active',b.dataset.go===id));const labels={dashboard:'Dashboard',sources:'Sumber & Upload',lessonmap:'Lesson Map',setupdata:'Setup Data',rph:'RPH Generator',transit:'Transit PBD',books:'Semakan Buku',analytics:'Analisis PBD',admin:'Admin Akses'};$('#pageTitle').textContent=labels[id]||'e-RPH & PBD Hub';$('#hud').classList.remove('open');$('#hudOverlay').classList.remove('show');updateToggleIcon();if(id==='analytics')renderAnalytics();if(id==='sources'){renderSources();renderSourceReadiness()}if(id==='lessonmap'){renderLessonMaps();updateLessonMapLanguageUI();if(!$('#mapWeek').value)$('#mapWeek').value=weekFromDate(today);setTimeout(()=>refreshWeekCoverage({silent:true}),0)}if(id==='rph'){renderRphClassHelper();renderTeacherScheduleForDate({autoPick:true,silent:true});renderRphBadges();renderRphLessonOptions();setTimeout(()=>syncRphWeekFromDate({silent:true}),0)}if(id==='transit'){renderTransitLessonOptions()}if(id==='admin'){if(!isAdmin())return toast('Akses Admin diperlukan.');loadAdminData()};window.scrollTo({top:0,behavior:'smooth'})}

$$('[data-go]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.go)));
// v0.3.3.37: Delegate clicks inside the RPT week preview for auto-fill.
$('#mapWeekCoverage')?.addEventListener('click',onRptPreviewClick);
// v0.3.3.37: Drag-to-fill — track last focused Lesson Map field.
let _rptActiveField=null;
const MAP_FIELD_IDS=['mapTitle','mapSk','mapSp','mapMainSp','mapComplementarySp','mapObjective','mapCriteria','mapBtStart','mapBtEnd','mapBaPage','mapActivities'];
MAP_FIELD_IDS.forEach(id=>{const el=$('#'+id);if(el)el.addEventListener('focusin',()=>{_rptActiveField=id})});
$('#mapWeekCoverage')?.addEventListener('mouseup',()=>{
  const sel=window.getSelection();const text=sel?.toString().trim();
  if(!text||text.length<2)return;
  const target=_rptActiveField||'mapTitle';
  const el=$('#'+target);if(!el)return;
  if(el.tagName==='TEXTAREA'||el.tagName==='INPUT'){
    const start=el.selectionStart,end=el.selectionEnd,old=el.value;
    el.value=old.slice(0,start)+text+old.slice(end);el.selectionStart=el.selectionEnd=start+text.length;el.dispatchEvent(new Event('input',{bubbles:true}));
  }else{el.value=text}
  el.classList.add('rpt-field-flash');setTimeout(()=>el.classList.remove('rpt-field-flash'),900);
  toast(`"${text.slice(0,40)}${text.length>40?'…':''}" → ${el.closest('label')?.querySelector('span')?.textContent||target}`);
});
function updateToggleIcon(){const btn=$('#toggleHud'),isMobile=window.innerWidth<=820;const isOpen=isMobile?$('#hud').classList.contains('open'):!document.body.classList.contains('hud-closed');btn.textContent=isOpen?'✕':'☰';btn.title=isOpen?'Tutup menu':'Buka menu'}
function toggleHud(){const hud=$('#hud'),overlay=$('#hudOverlay'),isMobile=window.innerWidth<=820;if(isMobile){hud.classList.toggle('open');overlay.classList.toggle('show',hud.classList.contains('open'));localStorage.setItem('rph-hud-mobile',hud.classList.contains('open')?'1':'0')}else{document.body.classList.toggle('hud-closed');localStorage.setItem('rph-hud-desktop',document.body.classList.contains('hud-closed')?'1':'0')}updateToggleIcon()}
function restoreHudState(){const isMobile=window.innerWidth<=820;if(isMobile&&localStorage.getItem('rph-hud-mobile')==='1'){$('#hud').classList.add('open');$('#hudOverlay').classList.add('show')}if(!isMobile&&localStorage.getItem('rph-hud-desktop')==='1'){document.body.classList.add('hud-closed')}updateToggleIcon()}
$('#toggleHud').addEventListener('click',toggleHud);$('#hudOverlay').addEventListener('click',()=>{$('#hud').classList.remove('open');$('#hudOverlay').classList.remove('show');localStorage.setItem('rph-hud-mobile','0');updateToggleIcon()});
$('#transitClass').addEventListener('change',()=>{renderTransitLessonOptions()});$('#transitSubject').addEventListener('change',()=>{renderTransitLessonOptions()});$('#transitLesson')?.addEventListener('change',()=>{const map=state.lessonMaps.find(x=>x.id===$('#transitLesson').value);renderTransitMeta(map);renderTransitRows()});$('#refreshTransitStandards').addEventListener('click',()=>{renderTransitLessonOptions()});
$('#transitRows').addEventListener('input',()=>{unsavedDirty=true});$('#bookRows').addEventListener('input',()=>{unsavedDirty=true});
$('#bookClass').addEventListener('change',renderBookRows);$('#analyticsClass').addEventListener('change',renderAnalytics);$('#analyticsSubject').addEventListener('change',renderAnalytics);
$('#rphDate').addEventListener('change',async()=>{renderTeacherScheduleForDate({autoPick:true});await syncRphWeekFromDate()});$('#rphSchedule')?.addEventListener('change',async()=>{const s=state.timetable.find(x=>x.id===$('#rphSchedule').value);if(s){applyTeacherScheduleSession(s);await syncRphWeekFromDate({silent:true});renderRphLessonOptions()}});$('#rphClass').addEventListener('change',async()=>{renderRphClassHelper();const s=selectedTeacherSchedule();if(s&&s.class_id!==$('#rphClass').value){if($('#rphSchedule'))$('#rphSchedule').value='';if($('#rphTime'))$('#rphTime').value=''}syncSelectedRphSchedule();await syncRphWeekFromDate({silent:true});renderRphLessonOptions()});$('#rphSubject').addEventListener('change',async()=>{const s=selectedTeacherSchedule();if(s&&s.subject_id!==$('#rphSubject').value){if($('#rphSchedule'))$('#rphSchedule').value='';if($('#rphTime'))$('#rphTime').value=''}renderRphClassHelper();syncSelectedRphSchedule();await syncRphWeekFromDate({silent:true});renderRphLessonOptions()});$('#rphWeek').addEventListener('change',()=>{$('#rphWeek').dataset.source='manual';setRphWeekHint('Minggu RPT dipilih manual. Sistem tidak menggunakan ISO/calendar week.','manual');renderRphBadges();renderRphLessonOptions()});
$('#sourceSubject').addEventListener('change',()=>{renderSources();renderSourceReadiness()});$('#sourceYear').addEventListener('change',()=>{renderSources();renderSourceReadiness()});$('#sourceAcademicYear').addEventListener('change',()=>{renderSources();renderSourceReadiness()});$('#mapSubject').addEventListener('change',()=>{invalidateLessonAnalysis();renderLessonMaps();updateLessonMapLanguageUI();refreshWeekCoverage({silent:true})});$('#mapYear').addEventListener('change',()=>{invalidateLessonAnalysis();renderLessonMaps();refreshWeekCoverage({silent:true})});$('#mapAcademicYear').addEventListener('change',()=>{invalidateLessonAnalysis();renderLessonMaps();refreshWeekCoverage({silent:true})});$('#mapWeek').addEventListener('change',()=>{invalidateLessonAnalysis();refreshWeekCoverage({silent:true})});$('#mapSession').addEventListener('change',()=>{invalidateLessonAnalysis();renderWeekCoverage(currentWeekCoverage,currentMapFilter())});$('#buildLessonCandidate').addEventListener('click',buildLessonCandidate);$('#saveLessonDraft').addEventListener('click',()=>saveLessonMap('draft'));$('#verifyLessonMap').addEventListener('click',()=>saveLessonMap('verified'));$('#runAccuracyTest').addEventListener('click',()=>{if(!state.lessonCandidate)return toast('Analisis sumber dahulu.');const p=formLessonPayload(state.lessonCandidate.verification_status||'draft');p.source_evidence=state.lessonCandidate.evidence||state.lessonCandidate.source_evidence||{};renderMapGate(p,p.verification_status==='verified');toast(p.confidence_score>=85&&p.week_exact&&p.sp_crosscheck&&p.source_evidence?.meta?.session_exact&&isLogicalObjectiveText(p.objective)&&isLogicalObjectiveText(p.success_criteria)?'Semakan Lesson Map lengkap. Boleh disahkan.':'Masih ada item yang perlu dilengkapkan sebelum sahkan.',4500)});$('#refreshLessonMaps').addEventListener('click',async()=>{if(requireAuth())await loadAll()});
$('#saveTransit').addEventListener('click',saveTransit);$('#saveBooks').addEventListener('click',saveBooks);$('#generateRph').addEventListener('click',generateRph);$('#detectStandards').addEventListener('click',detectStandards);$('#importDetectedStandards').addEventListener('click',importDetectedStandards);$('#migrateSourcesR2')?.addEventListener('click',migrateLegacySourcesToR2);$('#refreshSources').addEventListener('click',async()=>{if(requireAuth())await loadAll()});
$('#addSubject').addEventListener('click',addSubject);$('#addClass').addEventListener('click',addClass);$('#rphQuickAddClass')?.addEventListener('click',addRphClassQuick);$('#previewStudents').addEventListener('click',previewStudents);$('#importStudents').addEventListener('click',importStudents);
$('#markAllComplete').addEventListener('click',()=>{$$('#bookRows .status').forEach(x=>x.value='Lengkap');$$('#bookRows .score').forEach(x=>{x.value=10;x.dispatchEvent(new Event('input',{bubbles:true}))})});
syncTimetableDelimaAccount();

$('#timetableImportBtn')?.addEventListener('click',async()=>{
  const inp=$('#timetableGlobalFile');
  const file=inp?.files?.[0];

  if(!file)return toast('Pilih fail jadual CSV/XLSX dahulu.');

  const btn=$('#timetableImportBtn');
  if(btn)btn.disabled=true;

  try{
    await importGlobalTimetableFile(file);
  }finally{
    if(btn)btn.disabled=false;
    if(inp)inp.value='';
  }
});

$('#schoolTimetableImportBtn')?.addEventListener('click',async()=>{
  const inp=$('#schoolTimetableFile');
  const file=inp?.files?.[0];

  if(!file)return toast('Pilih fail Jadual Induk dahulu.');

  const btn=$('#schoolTimetableImportBtn');
  if(btn)btn.disabled=true;

  try{
    await importSchoolMasterTimetable(file);
  }finally{
    if(btn)btn.disabled=false;
    if(inp)inp.value='';
  }
});

$$('.source-file').forEach(inp=>inp.addEventListener('change',async e=>{const files=[...e.target.files];await handleSourceFiles(e.target.dataset.type,files);e.target.value=''}));

const dlg=$('#setupDialog');
$('#openSetup').addEventListener('click',()=>{if(!requireAuth())return;if(!isAdmin())return toast('Tetapan database hanya untuk Admin.');const c=localCfg()||DEFAULT_SUPABASE_CONFIG;$('#setupUrl').value=c.url||'';$('#setupKey').value=c.key||'';dlg.showModal()});
$('#saveConfig').addEventListener('click',()=>{if(!requireAuth()||!isAdmin())return toast('Akses Admin diperlukan.');const url=$('#setupUrl').value.trim(),key=$('#setupKey').value.trim();if(!url||!key)return toast('Masukkan URL dan publishable/anon key.');localStorage.setItem('erph_supabase',JSON.stringify({url,key}));dlg.close();location.reload()});
$('#resetConfig').addEventListener('click',()=>{if(!requireAuth()||!isAdmin())return;localStorage.removeItem('erph_supabase');dlg.close();location.reload()});
$('#driveOpenLink')?.addEventListener('click',()=>{const link=$('#driveOpenLink');if(link?.dataset.href)window.open(link.dataset.href,'_blank','noopener')});

async function signInGoogleDelima(){
  if(!state.client||!state.connected){setGateStatus('Supabase belum bersambung.','bad');return}
  const btn=$('#gateGoogleLogin');btn.disabled=true;btn.textContent='Membuka Google…';setGateStatus('Membuka login Google DELIMa…');
  try{
    const {error}=await state.client.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+location.pathname,queryParams:{hd:DELIMA_DOMAIN,prompt:'select_account'}}});
    if(error)throw error;
  }catch(e){setGateStatus('Login Google gagal: '+(e?.message||'Ralat tidak diketahui'),'bad');btn.disabled=false;btn.innerHTML='<span class="google-g">G</span><span>Teruskan dengan Google DELIMa</span>'}
}
$('#gateGoogleLogin').addEventListener('click',signInGoogleDelima);

async function loadAdminData(){
  if(!requireAuth()||!isAdmin())return;
  const [u,l]=await Promise.all([state.client.from('authorized_users').select('*').order('updated_at',{ascending:false}),state.client.from('login_sessions').select('*').order('login_at',{ascending:false}).limit(500)]);
  if(u.error)return toast('Gagal muat pengguna: '+u.error.message);if(l.error)console.warn(l.error);state.adminUsers=u.data||[];state.sessionLogs=l.data||[];renderAdminData();
}
function fmtDt(v){if(!v)return '—';try{return new Date(v).toLocaleString('ms-MY')}catch{return v}}
function recentSession(x){return x.status==='active'&&x.last_seen_at&&(Date.now()-new Date(x.last_seen_at).getTime()<150000)}
function renderAdminData(){
  const lastByEmail={};for(const x of state.sessionLogs){const e=normEmail(x.email);if(!lastByEmail[e])lastByEmail[e]=x}
  $('#adminUsersRows').innerHTML=state.adminUsers.map(u=>{const last=lastByEmail[normEmail(u.email)];return `<tr><td><b>${escapeHtml(u.display_name||u.email)}</b><br><small>${escapeHtml(delimaId(u.email))}<br>${escapeHtml(u.email)}</small></td><td><span class="access-badge ${escapeHtml(u.status)}">${u.status==='allowed'?'Diluluskan':u.status==='blocked'?'Diblok':'Menunggu'}</span></td><td>${u.role==='admin'?'ADMIN':'GURU'}</td><td>${last?fmtDt(last.login_at):'—'}</td><td class="admin-actions"><button class="mini allow-user" data-email="${escapeHtml(u.email)}">✓ Allow</button><button class="mini danger block-user" data-email="${escapeHtml(u.email)}">Block</button>${u.user_id?`<button class="mini ghost kick-user" data-user="${u.user_id}">Kick</button>`:''}</td></tr>`}).join('')||'<tr><td colspan="5">Belum ada pengguna.</td></tr>';
  $('#sessionLogRows').innerHTML=state.sessionLogs.map(x=>`<tr><td>${fmtDt(x.login_at)}</td><td>${escapeHtml(x.full_name||'—')}</td><td>${escapeHtml(x.delima_id||delimaId(x.email))}</td><td><span class="session-dot ${recentSession(x)?'online':''}"></span>${recentSession(x)?'Aktif':escapeHtml(x.status||'—')}</td><td>${fmtDt(x.last_seen_at)}</td><td><small>${escapeHtml(x.platform||'')}${x.user_agent?'<br>'+escapeHtml(x.user_agent.slice(0,80)):''}</small></td></tr>`).join('')||'<tr><td colspan="6">Belum ada log sesi.</td></tr>';
}
async function adminSetAccess(email,status,role='teacher',displayName=''){
  if(!isAdmin())return toast('Akses Admin diperlukan.');email=normEmail(email);if(!isDelimaTeacherEmail(email))return toast('Hanya ID DELIMa guru g-...@moe-dl.edu.my dibenarkan.');
  const {error}=await state.client.rpc('admin_set_user_access',{target_email:email,new_status:status,new_role:role,new_display_name:displayName||null,new_note:null});if(error)return toast('Gagal kemas kini akses: '+error.message);toast(status==='allowed'?'Akaun diluluskan.':'Akaun diblok.');await loadAdminData();
}
$('#adminApprove').addEventListener('click',()=>adminSetAccess($('#adminEmail').value,$('#adminRole').value==='admin'?'allowed':'allowed',$('#adminRole').value,$('#adminDisplayName').value));
$('#refreshAdmin').addEventListener('click',loadAdminData);
$('#adminUsersRows').addEventListener('click',async e=>{const allow=e.target.closest('.allow-user'),block=e.target.closest('.block-user'),kick=e.target.closest('.kick-user');if(allow){const u=state.adminUsers.find(x=>normEmail(x.email)===normEmail(allow.dataset.email));return adminSetAccess(u.email,'allowed',u.role,u.display_name)}if(block){const u=state.adminUsers.find(x=>normEmail(x.email)===normEmail(block.dataset.email));return adminSetAccess(u.email,'blocked',u.role,u.display_name)}if(kick){const {error}=await state.client.rpc('admin_kick_user',{target_user_id:kick.dataset.user});if(error)return toast('Kick gagal: '+error.message);toast('Arahan kick dihantar.');await loadAdminData()}});
const accountDlg=$('#accountDialog');
$('#authButton').addEventListener('click',()=>{if(!state.user)return lockApp('Sila login dahulu.');applyRoleUi();accountDlg.showModal()});
$('#signOut').addEventListener('click',async()=>{if(!state.client)return;await endSessionLog('logout');const {error}=await state.client.auth.signOut({scope:'local'});if(error)return toast('Log keluar gagal: '+error.message);accountDlg.close();state.user=null;state.profile=null;state.access=null;lockApp('Anda telah log keluar. Login semula dengan Google DELIMa.');setGateStatus('Anda telah log keluar.','ok')});

if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(console.warn));
restoreHudState();
connect();
