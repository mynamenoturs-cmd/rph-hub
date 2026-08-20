Warning: truncated output (original token count: 80337)
Total output lines: 3057

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
// Source text can be large (especially OCR). Keep it in-memory for the active
// browser session so changing Lesson Map fields does not re-download the same book.
const sourceReadCache={chunks:new Map(),pages:new Map()};
function clearSourceReadCache(){sourceReadCache.chunks.clear();sourceReadCache.pages.clear()}
function sourceReadCacheKey(kind,docs=[]){return `${kind}|${docs.map(d=>`${d.id}:${d.updated_at||d.created_at||''}:${d.extracted_chars||0}`).sort().join('|')}`}
function cachedSourceRead(bucket,key,load){if(bucket.has(key))return bucket.get(key);const pending=Promise.resolve().then(load).catch(error=>{bucket.delete(key);throw error});bucket.set(key,pending);return pending}
// PostgREST/Supabase mengehadkan 1000 baris setiap permintaan; ambil semua halaman ikut julat.
async function fetchAllRows(query,pageSize=1000,maxPages=50){
  const out=[];let from=0;
  for(let i=0;i<maxPages;i++){
    const {data,error}=await query.range(from,from+pageSize-1);
    if(error)return {data:out,error};
    if(!data||!data.length)break;
    out.push(...data);
    if(data.length<pageSize)break;
    from+=pageSize;
  }
  return {data:out,error:null};
}
async function loadRphActivityLibrary(){
  if(!state.connected||!state.user){
    state.rphActivityLibrary=[];
    state.rphSubjectPedagogy=[];
    return;
  }

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
}

function safeRealtimeReload(label='Data'){
  if(unsavedDirty){toast(`${label} baharu tersedia. Simpan kerja semasa dahulu, kemudian muat semula.`,4000);return}
  loadAll();
}

function toast(msg,ms=3600){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove('show'),ms)}
function escapeHtml(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
const DEFAULT_SUPABASE_CONFIG={
  url:'https://syqhegxtwsjnkoutlwno.supabase.co',
  key:'sb_publishable_OeKcLCfDnw7FlWrSjUXGfg_t1YAD-zP'
};
const GOOGLE_DRIVE_CLIENT_ID='1054114776616-gnahe84n279ohk4vbpnogj8pnjs79hfg.apps.googleusercontent.com';
const DOCX_MIME='application/vnd.openxmlformats-officedocument.wordprocessingml.document';
let DRIVE_ACCESS_TOKEN='';
let DRIVE_TOKEN_EXPIRES_AT=0;
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
  if(state.connected&&state.user){const {data,error}=await fetchAllRows(state.client.from('source_chunks').select('document_id,chunk_no,content').in('document_id',ids).order('chunk_no'));if(error){console.warn('RPT week resolver',error);return[]}rows=data||[]}
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
    .on('postgres_changes',{event:'*',schema:'public',table:'transit_records'},()=>state.access?.status==='allowed'&&safeRealtimeReload('Transit PBD'))
    .on('postgres_changes',{event:'*',schema:'public',table:'book_checks'},()=>state.access?.status==='allowed'&&safeRealtimeReload('Semakan Buku'))
    .on('postgres_changes',{event:'*',schema:'public',table:'source_documents'},()=>state.access?.status==='allowed'&&safeRealtimeReload('Pustaka Sumber'))
    .on('postgres_changes',{event:'*',schema:'public',table:'lesson_maps'},()=>state.access?.status==='allowed'&&safeRealtimeReload('Lesson Map')).subscribe();
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
  // R2 is optional during migration. A missing Pages binding falls back safely.
  // Pages Functions have a request-body ceiling, so oversized files keep using resumable Storage for now.
  if(file.size<=95*1024*1024)try{const {data:{session}}=await state.client.auth.getSession();if(session?.access_token){const form=new FormData();form.append('path',path);form.append('file',file,file.name);const r=await fetch('/api/source-files',{method:'POST',headers:{authorization:`Bearer ${session.access_token}`},body:form});if(r.ok){onProgress(100);return await r.json()}}}catch(e){console.info('R2 upload fallback:',e?.message||e)}
  if(file.size<=6*1024*1024){const {data,error}=await state.client.storage.from('source-files').upload(path,file,{contentType:file.type||undefined,upsert:false});if(error)throw error;onProgress(100);return {path:data.path,status:'uploaded'}}
  if(!window.tus)throw new Error('TUS resumable upload belum dimuatkan.');
  const cfg=localCfg();const projectRef=new URL(cfg.url).hostname.split('.')[0];const {data:{session}}=await state.client.auth.getSession();if(!session?.access_token)throw new Error('Sesi login tamat. Login semula.');
  return await new Promise((resolve,reject)=>{const up=new tus.Upload(file,{endpoint:`https://${projectRef}.storage.supabase.co/storage/v1/upload/resumable`,retryDelays:[0,3000,5000,10000,20000],headers:{authorization:`Bearer ${session.access_token}`},uploadDataDuringCreation:true,removeFingerprintOnSuccess:true,metadata:{bucketName:'source-files',objectName:path,contentType:file.type||'application/octet-stream',cacheControl:'3600'},chunkSize:6*1024*1024,onError:reject,onProgress:(u,t)=>onProgress(t?Math.round(u/t*100):0),onSuccess:()=>resolve({path,status:'uploaded-resumable'})});up.findPreviousUploads().then(prev=>{if(prev.length)up.resumeFromPreviousUpload(prev[0]);up.start()}).catch(reject)})
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
function sourceDocMatchScore(doc,subjectId,year,academicYear=null){if(Number(doc.year)!==Number(year))return -999;let score=0;if(doc.subject_id===subjectId)score+=100;const hay=normKey(`${doc.file_name||''} ${doc.title||''}`);for(const t of subjectSourceTerms(subjectId)){if(t&&hay.includes(t))score+=30}const strictSession=['rpt','timetable'].includes(doc.source_type);if(academicYear){if(Number(doc.academic_year)===Number(academicYear))score+=20;else if(strictSession)return -999;else score-=5}return score}
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
    let extraction={text:'',pageCount:null,method:'none',pages:[]},storagePath=null,storageStatus='pending',storageBucket='source-files',uploadError='',savedDocId=null;
    try{
      showUploadProgress(`Memproses ${SOURCE_TYPES[type]}`,file.name,5);
      extraction=await extractTextFromFile(file,msg=>showUploadProgress(`Memproses ${SOURCE_TYPES[type]}`,msg,20));
      const wasTruncated=extraction.text.length>MAX_INDEX_CHARS;const chunks=chunkText(extraction.text);
      if(state.connected&&state.user){
        const path=`${state.user.id}/${subjectId}/${type}/${Date.now()}_${safeName(file.name)}`;
        try{const up=await uploadBinary(file,path,p=>showUploadProgress(`Upload ${file.name}`,p+'% ke Cloud Storage',20+Math.round(p*.45)));storagePath=up.path;storageStatus=up.status;storageBucket=up.bucket||'source-files'}catch(e){console.warn('storage upload',e);uploadError=e.message;storageStatus='upload_failed'}
        showUploadProgress(`Indeks ${file.name}`,`${chunks.length} bahagian teks`,72);
        const {data:doc,error}=await state.client.from('source_documents').insert({teacher_id:state.user.id,subject_id:subjectId,class_id:classId,year,academic_year:academicYear,source_type:type,title:file.name.replace(/\.[^.]+$/,''),file_name:file.name,mime_type:file.type||'',file_size:file.size,storage_bucket:storageBucket||'source-files',storage_path:storagePath,extraction_status:chunks.length?(wasTruncated?'indexed_partial':'indexed'):(extraction.method==='image-no-ocr'?'stored_no_ocr':'stored_only'),extracted_chars:Math.min(extraction.text.length,MAX_INDEX_CHARS),page_count:extraction.pageCount,notes:uploadError?`Storage: ${uploadError}`:null,metadata:{method:extraction.method,page_indexed:(extraction.pages||[]).length}}).select().single();if(error)throw error;
        savedDocId=doc.id;
        if(chunks.length){for(let i=0;i<chunks.length;i+=50){const batch=chunks.slice(i,i+50).map(x=>({document_id:doc.id,chunk_no:x.chunk_no,content:x.content,char_start:x.char_start,char_end:x.char_end}));const {error:ce}=await state.client.from('source_chunks').insert(batch);if(ce)throw ce}}
        if(extraction.pages?.length){for(let i=0;i<extraction.pages.length;i+=80){const batch=extraction.pages.slice(i,i+80).filter(p=>p.content).map(p=>({document_id:doc.id,page_no:p.page_no,content:p.content,metadata:{kind:p.kind||'page'}}));if(batch.length){const {error:pe}=await state.client.from('source_pages').insert(batch);if(pe)throw pe}}}
        await logAudit('UPLOAD_SOURCE',{document_id:doc.id,source_type:type,file_name:file.name,storage_status:storageStatus,chunks:chunks.length});
      }
      if(type==='timetable')await attemptTimetableImport(file,savedDocId,subjectId,classId);
      showUploadProgress(`Siap: ${file.name}`,storageStatus==='upload_failed'?`Teks diindeks, tetapi fail asal gagal upload: ${uploadError}`:`${chunks.length} bahagian teks diindeks`,100);toast(`${file.name} selesai diproses.`)
    }catch(e){console.error(e);toast(`Gagal proses ${file.name}: ${e.message}`,6000)}
  }
  card?.classList.remove('busy');hideUploadProgress();if(state.connected&&state.user)await loadAll();else{renderSources();renderDashboard();renderSourceReadiness();renderRphBadges()}
}

function textDensity(doc){const pages=Math.max(1,Number(doc?.page_count||1));return Math.round(Number(doc?.extracted_chars||0)/pages)}
function isLowTextPdf(doc){return /pdf/i.test(String(doc?.mime_type||doc?.file_name||''))&&Number(doc?.page_count||0)>3&&textDensity(doc)<80}
function ocrProgressMeta(doc){const m=doc?.metadata||{};return {next:Number(m.ocr_next_page||1),done:Number(m.ocr_pages_done||0),complete:Boolean(m.ocr_complete)}}
function ocrLanguageForDoc(doc){const sub=getSubject(doc?.subject_id),name=normKey(sub?.name||'');return name.includes('bahasa melayu')||name==='bm'?'msa+eng':'eng'}
async function ensureOcrWorker(doc=null){
  const wanted=ocrLanguageForDoc(doc);if(OCR_WORKER&&OCR_WORKER_LANG===wanted)return OCR_WORKER;
  if(OCR_WORKER){try{await OCR_WORKER.terminate()}catch{}OCR_WORKER=null;OCR_WORKER_LANG=''}
  if(!window.Tesseract)throw new Error('Tesseract OCR belum dimuatkan. Pastikan internet aktif.');toast(`Memuatkan enjin OCR ${wanted==='msa+eng'?'Bahasa Melayu + English':'English'}...`,5000);
  const opts={logger:m=>{if(m.status&&m.progress)showUploadProgress('OCR sumber',`${m.status} ${Math.round(m.progress*100)}%`,Math.round(m.progress*100))}};
  try{OCR_WORKER=await Tesseract.createWorker(wanted==='msa+eng'?['msa','eng']:'eng',1,opts);OCR_WORKER_LANG=wanted}
  catch(e){console.warn('OCR language fallback',e);OCR_WORKER=await Tesseract.createWorker('eng',1,opts);OCR_WORKER_LANG='eng';toast('Paket OCR Bahasa Melayu gagal dimuatkan; OCR diteruskan dengan English.',5000)}
  return OCR_WORKER
}
async function loadStoredPdf(doc){if(!state.client||!state.user)throw new Error('Sambungan Supabase diperlukan.');if(!doc.storage_path)throw new Error('Fail asal tiada dalam Storage. Upload semula sumber ini.');let r;if(doc.storage_bucket==='r2'){const {data:{session}}=await state.client.auth.getSession();r=await fetch('/api/source-files/'+doc.storage_path.split('/').map(encodeURIComponent).join('/'),{headers:{authorization:`Bearer ${session?.access_token||''}`}})}else{const {data,error}=await state.client.storage.from(doc.storage_bucket||'source-files').createSignedUrl(doc.storage_path,900);if(error)throw error;r=await fetch(data.signedUrl)}if(!r.ok)throw new Error('Gagal mengambil PDF asal dari Storage.');const ab=await r.arrayBuffer();return await pdfjsLib.getDocument({data:ab}).promise}
async function saveOcrPage(doc,pageNo,text){
  const clean=normalizeText(text);if(clean.length<8)return 0;
  const {data:existing}=await state.client.from('source_pages').select('content').eq('document_id',doc.id).eq('page_no',pageNo).maybeSingle();
  const old=normalizeText(existing?.content||'');
  // Buku teks digital biasanya mempunyai teks yang lebih tepat daripada OCR. OCR dijalankan sebagai semakan,
  // tetapi teks sedia ada dikekalkan jika lebih lengkap supaya indeks tidak merosot.
  if(old.length>=120&&old.length>=clean.length*.85)return 0;
  await state.client.from('source_pages').delete().eq('document_id',doc.id).eq('page_no',pageNo);const {error}=await state.client.from('source_pages').insert({document_id:doc.id,page_no:pageNo,content:clean,metadata:{kind:'ocr',ocr:true,engine:OCR_WORKER_LANG||'tesseract'}});if(error)throw error;return clean.length
}
async function ocrSourceBatch(id){if(!requireAuth())return;const doc=state.sources.find(x=>x.id===id);if(!doc)return toast('Sumber tidak ditemui.');if(!isLowTextPdf(doc)&&ocrProgressMeta(doc).complete)return toast('Sumber ini sudah mempunyai teks/OCR yang mencukupi.');if(!window.pdfjsLib)return toast('PDF.js belum dimuatkan.');try{const worker=await ensureOcrWorker(doc),pdf=await loadStoredPdf(doc),meta=ocrProgressMeta(doc),start=Math.max(1,meta.next),end=Math.min(pdf.numPages,start+OCR_BATCH_PAGES-1);let chars=0,done=meta.done;for(let n=start;n<=end;n++){showUploadProgress(`OCR ${doc.file_name}`,`Halaman ${n}/${pdf.numPages}`,Math.round((n-start)/(Math.max(1,end-start+1))*100));const page=await pdf.getPage(n);const viewport=page.getViewport({scale:1.35});const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d',{willReadFrequently:true});canvas.width=Math.max(1,Math.floor(viewport.width));canvas.height=Math.max(1,Math.floor(viewport.height));await page.render({canvasContext:ctx,viewport}).promise;const res=await worker.recognize(canvas);chars+=await saveOcrPage(doc,n,res?.data?.text||'');done++;canvas.width=1;canvas.height=1}
      const complete=end>=pdf.numPages,next=complete?pdf.numPages+1:end+1,oldMeta=doc.metadata||{};const {error}=await state.client.from('source_documents').update({metadata:{...oldMeta,ocr_next_page:next,ocr_pages_done:done,ocr_complete:complete,ocr_engine:OCR_WORKER_LANG||'tesseract'},extracted_chars:Number(doc.extracted_chars||0)+chars,extraction_status:complete?'indexed_ocr':'indexed_ocr_partial'}).eq('id',doc.id);if(error)throw error;hideUploadProgress();await loadAll();toast(complete?`OCR selesai untuk ${doc.file_name}. Analisis Lesson Map semula.`:`OCR halaman ${start}–${end} siap. Tekan Sambung OCR untuk halaman seterusnya.`,6500)}catch(e){hideUploadProgress();console.error(e);toast('OCR gagal: '+e.message,7000)}}

function renderSources(){
  const subId=$('#sourceSubject')?.value,year=Number($('#sourceYear')?.value||0),ay=Number($('#sourceAcademicYear')?.value||0);const docs=state.sources.filter(x=>(!subId||x.subject_id===subId)&&(!year||Number(x.year)===year)&&(!ay||Number(x.academic_year||ay)===ay));
  const selectedSubject=getSubject(subId);const emptyMsg=`Belum ada fail untuk ${escapeHtml(selectedSubject?.name||'subjek ini')} • Tahun ${year||'—'} • Sesi ${ay||'—'}. Jumlah fail semua subjek: ${state.sources.length}.`;
  $('#sourceRows').innerHTML=docs.map(d=>{const s=getSubject(d.subject_id),low=isLowTextPdf(d),om=ocrProgressMeta(d);let status=d.storage_path?`<span class="status-ok">${d.storage_bucket==='r2'?'R2':'Cloud'} ✓</span>`:state.connected?'<span class="status-warn">Teks sahaja</span>':'<span class="status-warn">Sesi demo</span>';if(low&&!om.complete)status+='<br><span class="status-warn">⚠ PDF scan / OCR perlu</span>';if(om.complete)status+='<br><span class="status-ok">OCR ✓</span>';const ocrEligible=['textbook','activity_book','dskp','rpt'].includes(d.source_type);const ocrBtn=state.connected&&d.storage_path&&/pdf/i.test(String(d.mime_type||d.file_name||''))&&!om.complete&&(low||om.done||ocrEligible)?`<button class="ghost ocr-source" data-id="${d.id}">${om.done?'Sambung OCR':(low?'OCR 12 hlm':'OCR pilihan')}</button>`:'';return `<tr><td>${escapeHtml(SOURCE_TYPES[d.source_type]||d.source_type)}</td><td><b>${escapeHtml(d.file_name||d.title)}</b></td><td>${escapeHtml(s?.name||'—')}<br><small>Tahun ${d.year||'—'} • Sesi ${d.academic_year||'—'}</small></td><td>${bytes(d.file_size)}</td><td>${Number(d.extracted_chars||0).toLocaleString()} aksara${d.page_count?`<br><small>${d.page_count} halaman • ${textDensity(d)} aks/hlm</small>`:''}</td><td>${status}<br><small>${escapeHtml(d.extraction_status||'—')}</small></td><td><div class="row-actions">${ocrBtn}<button class="danger delete-source" data-id="${d.id}">Buang</button></div></td></tr>`}).join('')||`<tr><td colspan="7">${emptyMsg}</td></tr>`;
  $$('.delete-source').forEach(b=>b.addEventListener('click',()=>deleteSource(b.dataset.id)));$$('.ocr-source').forEach(b=>b.addEventListener('click',()=>ocrSourceBatch(b.dataset.id)));
}
async function deleteSource(id){const d=state.sources.find(x=>x.id===id);if(!d)return;if(!confirm(`Buang sumber ${d.file_name||d.title}?`))return;if(state.connected&&state.user){try{if(d.storage_path){if(d.storage_bucket==='r2'){const {data:{session}}=await state.client.auth.getSession(),r=await fetch('/api/source-files/'+d.storage_path.split('/').map(encodeURIComponent).join('/'),{method:'DELETE',headers:{authorization:`Bearer ${session?.access_token||''}`}});if(!r.ok)throw new Error('Fail R2 tidak dapat dibuang.')}else{const {error:se}=await state.client.storage.from(d.storage_bucket||'source-files').remove([d.storage_path]);if(se)throw se}}const {error}=await state.client.from('source_documents').delete().eq('id',id);if(error)throw error;await loadAll()}catch(e){return toast('Gagal buang: '+e.message)}}toast('Sumber dibuang.')}
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
    const [{data:chunks,error:ce},{data:pages,error:pe}]=await Promise.all([
      fetchAllRows(state.client.from('source_chunks').select('document_id,chunk_no,content').in('document_id',ids).order('chunk_no')),
      fetchAllRows(state.client.from('source_pages').select('document_id,page_no,content,metadata').in('document_id',ids).order('page_no'))
    ]);
    if(ce)console.warn(ce);if(pe)console.warn(pe);
    const out=(chunks||[]).map(c=>({...c,doc:docs.find(d=>d.id===c.document_id)}));
    const pageRows=(pages||[]).filter(p=>String(p.content||'').trim()).map(p=>({document_id:p.document_id,chunk_no:100000+Number(p.page_no||0),content:p.content,metadata:p.metadata||{},_page_no:p.page_no,doc:docs.find(d=>d.id===p.document_id)}));
    return out.concat(pageRows);
  });
  return [];
}

async function getPagesForSubject(subjectId,year,types=['textbook','activity_book'],academicYear=null,pageNos=null){
  let docs=smartSourceDocs(subjectId,year,academicYear,types);if(!docs.length)docs=smartSourceDocs(subjectId,year,null,types);if(!docs.length)docs=smartSourceDocs(null,year,academicYear,types);if(!docs.length)return[];const ids=docs.map(x=>x.id),wanted=[...new Set((pageNos||[]).map(Number).filter(Boolean))],cacheKey=sourceReadCacheKey(`pages:${[...types].sort().join(',')}:${wanted.sort((a,b)=>a-b).join(',')||'all'}`,docs);
  if(state.connected&&state.user)return cachedSourceRead(sourceReadCache.pages,cacheKey,async()=>{let query=state.client.from('source_pages').select('document_id,page_no,content,metadata').in('document_id',ids);if(wanted.length)query=query.in('page_no',wanted);const {data,error}=await fetchAllRows(query.order('page_no'));if(error){console.warn(error);return[]}return applyKnownBookProfilePages(annotatePrintedPages((data||[]).map(p=>({...p,doc:docs.find(d=>d.id===p.document_id)}))))});
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
  // Verified against the user-provided BM Tahun 2 PDFs: printed page = PDF page + offset.
  {name:'Bahasa Melayu Tahun 2 SK Jilid 1',family:'bm-y2-j1',test:d=>/bahasa[_\s-]*melayu.*tahun[_\s-]*2.*jilid[_\s-]*1/i.test(String(d?.file_name||d?.title||'')),offset:-7,units:{}},
  {name:'Bahasa Melayu Tahun 2 SK Jilid 2',family:'bm-y2-j2',test:d=>/bahasa[_\s-]*melayu.*tahun[_\s-]*2.*jilid[_\s-]*2/i.test(String(d?.file_name||d?.title||'')),offset:-5,units:{}}
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
function bookFamilyForDoc(doc){const n=normKey(`${doc?.file_name||''} ${doc?.title||''}`);if(/super\s*minds?\s*1/.test(n))return'super-minds-1';if(/linus\s*book\s*2/.test(n))return'linus-book-2';return''}
function sourceFamilyFromContext(text='',unit=null){
  const n=normKey(text);
  if(/orientation\s*week/.test(n))return{id:'no-textbook',label:'Orientation Week',explicit:true,noBook:true};
  if(/linus\s*book\s*2/.test(n))return{id:'linus-book-2',label:'LINUS Book 2',explicit:true};
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
  const re=new Reg…30337 tokens truncated…ath.random().toString(36).slice(2);const meta=JSON.stringify({name,mimeType:DOCX_MIME,parents:[parentId]});const body=new Blob([`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n--${boundary}\r\nContent-Type: ${DOCX_MIME}\r\n\r\n`,blob,`\r\n--${boundary}--`],{type:`multipart/related; boundary=${boundary}`});const r=await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':`multipart/related; boundary=${boundary}`},body});if(!r.ok){let msg='';try{msg=(await r.json())?.error?.message||''}catch{}throw new Error(msg||`Google Drive HTTP ${r.status}`)}return await r.json()}
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
async function uploadGeneratedRphToDrive(){const ctx=state.currentGeneratedRph;if(!ctx)return toast('Generate RPH dahulu.');const btn=$('#uploadRphDrive');if(btn)btn.disabled=true;try{const mode=driveAccountMode();const current=String(state.user?.email||'').trim();toast(ctx.uiEn?(mode==='current'?`Connecting as ${current||'signed-in account'}…`:'Choose a Google account…'):(mode==='current'?`Menyambung sebagai ${current||'akaun login semasa'}…`:'Pilih akaun Google…'),5000);const token=await requestDriveToken(mode),blob=await buildDocxBlob(ctx);let parent='root';const parts=driveFolderParts(ctx);for(const part of parts)parent=await ensureDriveFolder(token,part,parent);const file=await uploadBlobToDrive(token,blob,generatedRphFileName(ctx),parent);const route=parts.join(' / ');showDriveSuccess(ctx,file,route)}catch(e){const raw=String(e?.message||'');const origin=/origin_mismatch/i.test(raw)?(ctx.uiEn?' Add this site to Google OAuth Authorized JavaScript origins.':' Tambahkan laman ini pada Google OAuth Authorized JavaScript origins.') : '';toast((ctx.uiEn?'Google Drive upload failed: ':'Upload Google Drive gagal: ')+raw+origin,8000)}finally{if(btn)btn.disabled=false}}

function cleanSourceAnchor(v=''){return String(v||'').replace(/^\s*(?:RPT|BT|BA|Student['’]s Book|Workbook)\s*(?:m\/s|p\.)?\s*\d*\s*[:•-]?\s*/i,'').replace(/\s+/g,' ').trim()}
function isScienceSubject(subjectId){const sub=getSubject(subjectId),key=normKey(`${sub?.code||''} ${sub?.name||''}`);return /\bsains\b|\bscience\b/.test(key)}
const SCIENCE_TASK_PATTERNS=[
  ['compare_conditions',/banding.*keadaan|banding.*kondisi|compare.*conditions/],['test_material',/menguji.*bahan|uji.*(?:bahan|objek)|test.*material/],['represent_data',/mewakilkan data|persembah.*data|graf|piktograf|represent data|chart/],['record_data',/merekod|rekodkan|catat.*(?:data|pemerhatian)|record data|table.*data/],['draw_label',/melukis.*label|lukis.*label|draw.*label/],['build_model',/membina model|bina model|hasilkan.*model|build.*model/],['design_create',/mereka bentuk|mencipta|hasilkan.*(?:risalah|produk|roket)|design.*create|design.*make/],['cause_effect',/sebab dan akibat|punca dan kesan|cause.*effect/],['problem_solve',/menyelesaikan masalah|selesaikan masalah|bagaimana.*(?:asing|selesai)|problem solve/],['review_game',/ulang kaji.*permainan|kuiz|review game|quiz/],['investigate',/menyiasat|penyiasatan|mari kita kaji|investigate/],['infer',/membuat inferens|buat inferens|kesimpulan.*penyiasatan|infer/],['predict',/meramal|ramal|predict/],['measure',/mengukur|sukat|ukur|measure/],['sequence',/menyusun.*urutan|susun.*urutan|sequence|order.*steps/],['classify',/mengelaskan|dikelaskan|kelaskan|classify|group.*according/],['compare',/membandingkan|bandingkan|compare/],['identify',/mengenal pasti|kenal pasti|identify/],['observe',/memerhati|pemerhatian|observe|look closely/],['communicate',/berkomunikasi|kongsikan|persembahkan|membentang|communicate|present.*findings/]
];
function scienceTaskPattern(map,activities=[]){if(!isScienceSubject(map?.subject_id))return'';const source=(activities||[]).filter(x=>/\bBT\b|Student['’]s Book/i.test(String(x)));const hay=normKey((source.length?source:(activities||[])).join(' ')||[map?.title||'',map?.objective||'',map?.success_criteria||''].join(' '));return SCIENCE_TASK_PATTERNS.find(([,re])=>re.test(hay))?.[0]||''}
function sciencePatternLabel(pattern='',uiEn=false){const labels={observe:['Pemerhatian','Observation'],identify:['Mengenal pasti','Identification'],classify:['Pengelasan','Classification'],compare:['Perbandingan','Comparison'],sequence:['Urutan','Sequencing'],measure:['Pengukuran','Measurement'],record_data:['Rekod data','Data recording'],represent_data:['Perwakilan data','Data representation'],investigate:['Penyiasatan','Investigation'],test_material:['Uji bahan','Material testing'],compare_conditions:['Banding keadaan','Compare conditions'],infer:['Inferens','Inference'],predict:['Ramalan','Prediction'],cause_effect:['Sebab dan akibat','Cause and effect'],draw_label:['Lukis dan label','Draw and label'],build_model:['Bina model','Build a model'],design_create:['Reka dan cipta','Design and create'],communicate:['Komunikasi dapatan','Communicate findings'],problem_solve:['Penyelesaian masalah','Problem solving'],review_game:['Ulang kaji','Review']};return labels[pattern]?.[uiEn?1:0]||''}
function scienceDifferentiation(pattern,task,page,uiEn){const label=sciencePatternLabel(pattern,uiEn)|| (uiEn?'science task':'tugasan sains');const evidence=uiEn?'state the observation, measurement, result or evidence from the same task':'menyatakan pemerhatian, ukuran, hasil atau bukti daripada tugasan yang sama';return uiEn?{support:`With teacher guidance, pupils complete the same ${label.toLowerCase()} task “${task}” on ${page} in smaller steps using a prompt sheet, labelled example or partially prepared table.`,core:`Pupils complete the original textbook ${label.toLowerCase()} task “${task}” on ${page} and record the required result independently or with a partner.`,challenge:`After completing the same task “${task}”, pupils ${evidence} and explain or justify their conclusion without changing the investigation, material or Learning Standard.`}:{support:`Dengan bimbingan guru, murid melaksanakan tugasan ${label.toLowerCase()} yang sama “${task}” pada ${page} secara langkah demi langkah menggunakan petunjuk, contoh berlabel atau jadual separa siap.`,core:`Murid melaksanakan tugasan ${label.toLowerCase()} asal Buku Teks “${task}” pada ${page} dan merekod hasil yang diperlukan secara kendiri atau bersama pasangan.`,challenge:`Selepas melengkapkan tugasan yang sama “${task}”, murid ${evidence} serta menerangkan atau menjustifikasikan kesimpulan tanpa mengubah penyiasatan, bahan atau Standard Pembelajaran.`}}
function sourceTaskKind(activities=[],subjectId=null){const science=scienceTaskPattern({subject_id:subjectId},activities);if(science)return'science';const hay=normKey(activities.join(' '));if(/simulasi|lakon|dialog|bertutur|bercerita|respons|soalan bercapah/.test(hay))return'oral';if(/baca|membaca|petikan|idea utama|idea sampingan|isi tersurat|isi tersirat/.test(hay))return'reading';if(/tulis|menulis|bina ayat|membina ayat|catat|karangan|imlak|salin/.test(hay))return'writing';if(/kata kerja|kata nama|kata adjektif|kata majmuk|kata ganda|ayat tunggal|ayat majmuk|tatabahasa|kenal pasti|padan/.test(hay))return'language';if(/lagu|nyanyi|pantun|sajak|persembah|cerita haiwan|cerita jenaka/.test(hay))return'arts';if(/poster|peta minda|lukis|hasilkan|bina model/.test(hay))return'product';return'general'}
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

  if(exactSub.length){
    rows=exactSub;
  }else{
    rows=rows.filter(x=>(x.subskill_key||'general')==='general');
  }

  if(subskillKey!=='general'){
    rows=rows.filter(
      x=>(x.subskill_key||'general')===subskillKey
    );

    if(!rows.length){
      console.warn(
        'RPH INDUCTION SUBSKILL GUARD',
        {expectedSubskill:subskillKey}
      );
      return null;
    }
  }

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

function renderLibraryInduction(row,map){
  if(!row)return null;
  return {
    key:row.induction_key,
    name:row.induction_name,
    text:String(row.induction_template||'')
      .replaceAll('{{topic}}',map.title||'tajuk pembelajaran'),
    bbm:row.bbm_template||'',
    pak21:row.pak21||''
  };
}

function sourceSetInduction(map,page,topic,uiEn){
  const seed=`${map.source_evidence?.meta?.main_sp||map.sp}|${map.textbook_page_start||0}|${map.session_no||1}`;
  let n=0;for(const c of seed)n=(n*31+c.charCodeAt(0))>>>0;
  const ms=[
    `Guru memaparkan bahan utama pada ${page}. Murid memerhati dan menyatakan perkara yang mereka nampak atau faham sebelum guru mengaitkannya dengan tajuk “${topic}”.`,
    `Guru meminta murid meneliti ${page} seketika tanpa menerangkan isi pelajaran. Murid berbincang dengan pasangan tentang maklumat yang mereka jangka akan dipelajari.`,
    `Guru memilih satu contoh, gambar atau bahagian penting daripada ${page}. Murid memberikan respons awal dan guru menghubungkan jawapan mereka dengan fokus “${topic}”.`
  ];
  const en=[
    `The teacher displays the main material on ${page}. Pupils observe it and share what they notice before the teacher links their responses to “${topic}”.`,
    `Pupils examine ${page} briefly before the lesson is explained. They discuss with a partner what they think they are going to learn.`,
    `The teacher highlights one example, picture or key part from ${page}. Pupils give an initial response before it is linked to the focus “${topic}”.`
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
  return'general';
}

function rphSkillKey(map,activities=[]){
  const k=normKey(`${map.objective||''} ${map.success_criteria||''} ${map.title||''} ${activities.join(' ')}`);

  if(isScienceSubject(map?.subject_id))return'science';

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

function rphSubskillKey(map,activities=[]){
  const k=normKey(`${map.title||''} ${map.objective||''} ${map.success_criteria||''} ${activities.join(' ')}`);

  // Science patterns are metadata for selecting a delivery wrapper.  The
  // underlying textbook task remains the fixed source-task anchor.
  const sciencePattern=scienceTaskPattern(map,activities);
  if(sciencePattern)return sciencePattern;

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

  const exactSkill=subjectRows.filter(
    x=>x.skill_key===skillKey
  );

  let rows=exactSkill.length
    ? exactSkill
    : subjectRows.filter(x=>x.skill_key==='general');

  const exactSub=rows.filter(x=>x.subskill_key===subskillKey);
  if(exactSub.length){
    rows=exactSub;
  }else{
    rows=rows.filter(x=>(x.subskill_key||'general')==='general');
  }

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

  const keys=[
    ...(librarySteps.support||[]),
    ...(librarySteps.core||[]),
    ...(librarySteps.challenge||[])
  ]
    .map(x=>x?.key)
    .filter(x=>x&&x!=='source-task');

  return [...new Set(
    keys.map(key=>
      state.rphActivityLibrary.find(
        x=>x.activity_key===key
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

function rphPickActivity(rows,phases,seed,used=new Set(),avoid=new Set(),avoidTypes=new Set()){
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
      rows,group,`${base}|${i}`,used,avoid,avoidTypes
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

function rphRenderLibraryActivity(row,map,anchorText,page){
  if(!row)return null;

  const topic=map.title||'tajuk pembelajaran';
  const text=String(row.activity_template||'')
    .replaceAll('{{topic}}',topic)
    .replaceAll('{{page}}',page||'')
    .replaceAll('{{source_activity}}',anchorText||'');

  const bbm=String(row.bbm_template||'')
    .replaceAll('{{topic}}',topic)
    .replaceAll('{{page}}',page||'')
    .replaceAll('{{source_activity}}',anchorText||'');

  return {
    key:row.activity_key,
    name:row.activity_name||'Aktiviti',
    text,
    bbm,
    pak21:row.pak21||'',
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
      : actual===expectedSubskill;
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
    .map(x=>rphRenderLibraryActivity(x,map,anchorText,page))
    .filter(Boolean);

  if(anchorText){
    const sourceStep={
      key:'source-task',
      name:lessonLanguage(subjectId)==='en'?'Textbook Activity':'Aktiviti Buku Teks',
      text:anchorText,
      bbm:page||'',
      pak21:'',
      phase:'source'
    };

    const inputIndex=steps.findIndex(x=>x.phase==='input');
    const sourceIndex=inputIndex===0 ? 1 : 0;
    steps.splice(sourceIndex,0,sourceStep);
  }

  return steps;
}

function rphGroupStepsHtml(steps,fallback,uiEn){
  if(!steps?.length){
    return `<div class="rph-diff-activity"><b>${uiEn?'Activity:':'Aktiviti:'}</b> ${escapeHtml(fallback||'')}</div>`;
  }

  return `<div class="rph-step-list">${steps.map((x,i)=>`
    <div class="rph-diff-activity">
      <b>${uiEn?'Step':'Langkah'} ${i+1} — ${escapeHtml(x.name||'')}</b>
      <div>${escapeHtml(x.text||'')}</div>
      ${x.bbm?`<div><b>${uiEn?'Teaching Aids:':'BBM/ABM:'}</b> ${escapeHtml(x.bbm)}</div>`:''}
      ${x.pak21?`<div><b>${uiEn?'21st Century Learning:':'PAK-21:'}</b> ${escapeHtml(x.pak21)}</div>`:''}
    </div>`).join('')}</div>`;
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
    .filter(x=>x?.key&&x.key!=='source-task')
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
    .filter(x=>x?.key&&x.key!=='source-task')
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
      ? `Pupils use the song or lyrics on ${ref} to complete the learning task according to the objective.`
      : `Murid menggunakan lagu atau lirik pada ${ref} untuk melaksanakan tugasan pembelajaran mengikut objektif.`;
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

function buildSourceAwarePedagogy(map,activities,btRef,uiEn,classId=null){const clean=activities.map(cleanSourceAnchor).filter(Boolean),textbookTask=activities.find(x=>/\bBT\b|Student['’]s Book/i.test(x)),rawAnchor=cleanSourceAnchor(textbookTask)||clean[0]||cleanSourceAnchor(map.source_activities)||map.title||'',page=btRef||'—',anchor=rphSourceTaskInstruction(map,activities,rawAnchor,page,uiEn),kind=sourceTaskKind([map.objective||'',map.success_criteria||'',...clean],map.subject_id),sciencePattern=map.source_evidence?.meta?.science_task_pattern||scienceTaskPattern(map,activities),topic=map.title||'',mainSp=map.source_evidence?.meta?.main_sp||String(map.sp||'').split(',')[0]||'',method=chooseSourcePak21(kind,map,classId);const bbmList=extractBBM(map,activities,btRef,uiEn);
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

const inductionRow=pickLibraryInduction(
  map.subject_id,map,activities,classId
);
const inductionData=renderLibraryInduction(inductionRow,map);

setInduksi=inductionData?.text
  ||sourceSetInduction(map,page,topic,uiEn);

penutup=sourceClosure(map,page,topic,uiEn);

const usedAcrossGroups=new Set();

const librarySteps={
  support:rphLibraryLessonSteps(
    map.subject_id,map,activities,'support',anchor,page,classId,usedAcrossGroups
  ),
  core:rphLibraryLessonSteps(
    map.subject_id,map,activities,'core',anchor,page,classId,usedAcrossGroups
  ),
  challenge:rphLibraryLessonSteps(
    map.subject_id,map,activities,'challenge',anchor,page,classId,usedAcrossGroups
  )
};

const pbdEvidence=rphBuildPbdEvidence(
  map,activities,librarySteps,uiEn
);

penutup=rphBuildClosure(
  map,activities,librarySteps,uiEn
);

return {method,pakDetail,diffSupport,diffCore,diffChallenge,diffSupportAct,diffCoreAct,diffChallengeAct,setInduksi,penutup,anchor,kind,bbmList,groupBbm,mainSp,page,topic,librarySteps,inductionData,pbdEvidence}}
function extractBBM(map,activities,btRef,uiEn){const bbm=[];const page=btRef||'';const topic=map.title||'';const mainSp=map.source_evidence?.meta?.main_sp||'';bbm.push(uiEn?`Student's Book ${page}`:`Buku Teks ${page}`);if(map.activity_book_ref&&map.source_evidence?.meta?.activity_book_uploaded)bbm.push(uiEn?`Workbook ${map.activity_book_ref}`:`Buku Aktiviti ${map.activity_book_ref}`);if(map.source_evidence?.textbook)bbm.push(uiEn?'Source pages from uploaded documents':'Petikan halaman daripada dokumen yang diupload');const hay=normKey(activities.join(' '));if(/poster|peta minda|lukis/.test(hay))bbm.push(uiEn?`Poster / mind map on "${topic}"`:`Poster / peta minda tentang \u201c${topic}\u201d`);if(/kad|card|matching/.test(hay))bbm.push(uiEn?`Flashcards / matching cards for "${topic}"`:`Kad imlak / kad padanan untuk \u201c${topic}\u201d`);if(/lagu|nyanyi|audio/.test(hay))bbm.push(uiEn?`Audio / song clip related to "${topic}"`:`Audio / klip lagu berkaitan \u201c${topic}\u201d`);if(/video|klip|tayang/.test(hay))bbm.push(uiEn?`Video clip on "${topic}"`:`Klip video tentang \u201c${topic}\u201d`);bbm.push(uiEn?`Worksheet / exercise paper for SP ${mainSp}`:`Lembaran kerja untuk SP ${mainSp}`);bbm.push(uiEn?`Word bank / cue cards based on ${page}`:`Bank kata / kad kata kunci berdasarkan ${page}`);bbm.push(uiEn?`Teacher's guide from DSKP (SP ${mainSp})`:`Panduan guru daripada DSKP (SP ${mainSp})`);return bbm}
function selectedTeacherSchedule(){if(isAdmin())return null;const id=$('#rphSchedule')?.value;if(id)return state.timetable.find(x=>x.id===id)||null;const date=$('#rphDate')?.value,classId=$('#rphClass')?.value,subjectId=$('#rphSubject')?.value;return teacherTimetableSessionsForDate(date).find(x=>x.class_id===classId&&x.subject_id===subjectId)||null}
async function generateRph(){if(!requireAuth())return;
  const classId=$('#rphClass').value,subjectId=$('#rphSubject').value,cls=getClass(classId),sub=getSubject(subjectId),week=Number($('#rphWeek').value),date=$('#rphDate').value,schedule=selectedTeacherSchedule(),lessonTime=$('#rphTime')?.value||(schedule?scheduleTimeLabel(schedule):''),scheduleRequired=!isAdmin();if(!cls||!sub)return toast('Pilih kelas dan subjek atau pilih Sesi Jadual Guru.');
  const map=selectVerifiedLessonMap(classId,subjectId,week,date);if(!map){renderRphGate(null);$('#rphEmpty').innerHTML=`<b>RPH tidak dijana.</b><br>Tiada Lesson Map yang DISAHKAN untuk ${escapeHtml(sub.name)} Tahun ${cls.year}, Minggu ${week}.<br><button class="ghost" data-go-inline="lessonmap">Bina Lesson Map</button>`;$('#rphEmpty').classList.remove('hidden');$('#rphPreview').classList.add('hidden');$('[data-go-inline="lessonmap"]')?.addEventListener('click',()=>{$('#mapSubject').value=subjectId;$('#mapYear').value=cls.year;$('#mapWeek').value=week;go('lessonmap')});return toast('Accuracy Gate menghalang RPH generik. Sahkan Lesson Map dahulu.',5000)}
  $('#rphEmpty').textContent='Membaca aktiviti sebenar pada halaman Buku Teks dan membina PdP source-first...';$('#rphEmpty').classList.remove('hidden');$('#rphPreview').classList.add('hidden');
  const ev=await lessonPageEvidence(map);const built=buildSourceActivities(map,ev,classId);const validation=validateRphMap(map,ev,built);if(scheduleRequired){validation.checks.push({n:'Jadual guru dipadankan',ok:!!schedule&&schedule.class_id===classId&&schedule.subject_id===subjectId&&!!String(schedule.start_time||'').trim()});validation.score=Math.round(validation.checks.filter(x=>x.ok).length/validation.checks.length*100)}renderRphGate(validation);if(validation.checks.some(x=>!x.ok)){$('#rphEmpty').innerHTML='<b>Accuracy Gate gagal.</b><br>Semua semakan mesti lulus sebelum RPH accurate boleh dijana. Buka Lesson Map dan baiki item bertanda ✕.';return toast('RPH disekat: masih ada semakan accuracy yang gagal.',5000)}
  const uiEn=lessonLanguage(subjectId)==='en';const btRef=map.textbook_page_start?`${uiEn?'p.':'m/s'} ${map.textbook_page_start}${map.textbook_page_end&&map.textbook_page_end!==map.textbook_page_start?'–'+map.textbook_page_end:''}`:'—';let activities=built.activities.length?built.activities:(map.source_activities?[map.source_activities].filter(Boolean):[]);if(!activities.length&&map.source_evidence?.meta?.rpt_activity){activities=map.source_evidence.meta.rpt_activity.split(/[|;\n]/).map(s=>s.trim()).filter(s=>s.length>5)}const pedagogy=buildSourceAwarePedagogy(map,activities,btRef,uiEn,classId);
  const numbered=activities.map((a,i)=>`${i+1}. ${a}`).join('\n');const evidenceRefs=[...ev.bt.map(p=>`${p.doc?.file_name} ${uiEn?'p.':'m/s'} ${p.printed_page||p.page_no}`),...ev.ba.map(p=>`${p.doc?.file_name} ${uiEn?'p.':'m/s'} ${p.printed_page||p.page_no}`)];const teacherName=state.profile?.full_name||state.access?.display_name||state.user?.email||'—';
  const html=`<div class="rph-title"><div class="eyebrow">${uiEn?'DAILY LESSON PLAN':'RANCANGAN PENGAJARAN HARIAN'} • SOURCE-FIRST</div><h2>${escapeHtml(sub.name)}</h2><b>${escapeHtml(cls.name)} • ${escapeHtml(date)} • ${escapeHtml(lessonTime||'—')} • ${uiEn?'Week':'Minggu'} ${week} • ${uiEn?'Lesson':'Sesi'} ${map.session_no}</b></div>
  <div class="source-trace"><span>✓ ${uiEn?'Verified Lesson Map':'Lesson Map disahkan'}</span><span>Source Match ${map.confidence_score}%</span><span>${uiEn?"Student's Book":'BT'} ${escapeHtml(btRef)}</span><span>${uiEn?'Teacher timetable':'Jadual guru'} ✓</span></div>
  <div class="rph-grid"><div>${uiEn?'Teacher':'Guru'}</div><div>${escapeHtml(teacherName)}</div><div>${uiEn?'Date':'Tarikh'}</div><div>${escapeHtml(date)}</div><div>${uiEn?'Teaching time':'Masa Mengajar'}</div><div>${escapeHtml(lessonTime||'—')}</div><div>${uiEn?'Week':'Minggu'}</div><div>${week}</div><div>${uiEn?'Subject':'Subjek'}</div><div>${escapeHtml(sub.name)}</div><div>${uiEn?'Class / Year':'Kelas / Tahun'}</div><div>${escapeHtml(cls.name)} / ${uiEn?'Year':'Tahun'} ${cls.year}</div><div>${uiEn?'Topic / Focus':'Tajuk/Fokus'}</div><div>${escapeHtml(map.title)}</div><div>${uiEn?'Content Standard':'Standard Kandungan'}</div><div>${escapeHtml(map.sk)}</div><div>${uiEn?'Main Learning Standard':'SP Utama / Main LS'}</div><div>${escapeHtml(map.source_evidence?.meta?.main_sp||String(map.sp||'').split(',')[0]||'—')}</div><div>${uiEn?'Complementary Learning Standard(s)':'SP Sokongan / Complementary LS'}</div><div>${escapeHtml((map.source_evidence?.meta?.complementary_sp||[]).join?map.source_evidence.meta.complementary_sp.join(', '):(map.source_evidence?.meta?.complementary_sp||'—'))}</div><div>${uiEn?'All Learning Standards':'Semua Standard Pembelajaran'}</div><div>${escapeHtml(map.sp)}</div><div>${uiEn?'Learning Objective':'Objektif'}</div><div>${escapeHtml(map.objective||(uiEn?'Complete the Learning Objective in the verified Lesson Map.':'Objektif perlu dilengkapkan pada Lesson Map berdasarkan SP.'))}</div><div>${uiEn?'Success Criteria':'Kriteria Kejayaan'}</div><div>${escapeHtml(map.success_criteria||(uiEn?'Complete the Success Criteria in the verified Lesson Map.':'Kriteria kejayaan perlu dilengkapkan pada Lesson Map.'))}</div><div>${uiEn?'Stage of Learning':'Perkembangan Pelajaran'}</div><div>${escapeHtml(uiEn?({introduction:'Introduction',guided:'Guided practice',application:'Application',assessment:'Assessment / Reinforcement',enrichment:'Enrichment'}[map.progression_stage]||map.progression_stage):stageLabel(map.progression_stage))}</div><div>${uiEn?"Student's Book reference":'Rujukan Buku Teks'}</div><div>${escapeHtml(btRef)}</div>${map.source_evidence?.meta?.activity_book_uploaded?`<div>${uiEn?'Workbook':'Buku Aktiviti'}</div><div>${escapeHtml(map.activity_book_ref||'—')}</div>`:''}</div>
  <div class="rph-section">
  <div class="rph-section-header"><span class="rph-section-num">1</span><h3>${uiEn?'Set Induction':'Set Induksi'}</h3></div><div class="rph-section-body">${rphInductionHtml(pedagogy,uiEn)}</div></div>

  <div class="rph-section">
  <div class="rph-section-header"><span class="rph-section-num">2</span><h3>${uiEn?'Learning Activities':'Aktiviti PdP'}</h3></div><div class="rph-section-body">
  <div class="rph-activity-block"><div class="rph-activity-label">${uiEn?'Source Task':'Tugasan Asas Sumber'}</div><div class="rph-source-badge">📖 ${uiEn?'Based on':'Berdasarkan'} ${escapeHtml(btRef)}</div><div class="activity">${escapeHtml(pedagogy.anchor)}</div><div class="rph-source-links"><span class="rph-source-tag">${uiEn?'RPT':'RPT'}</span><span class="rph-source-tag">${uiEn?'DSKP':'DSKP'}</span><span class="rph-source-tag">${uiEn?'Student\'s Book':'Buku Teks'}</span></div></div>

  <div class="rph-activity-block"><div class="rph-activity-label">${uiEn?'Differentiated Instruction (3 Groups)':'PdP Terbeza (3 Kumpulan)'}</div><div class="group-suggestion"><div class="group-card group-explorer"><b>${uiEn?'Explorer Group':'Kelompok Peneroka'}</b><br><small>${uiEn?'(guided support — collaboration & communication)':'(bimbingan — kerjasama & komunikasi)'}</small><br>${rphGroupStepsHtml(pedagogy.librarySteps?.support,pedagogy.diffSupportAct,uiEn)}</div><div class="group-card group-builder"><b>${uiEn?'Builder Group':'Kelompok Pembina'}</b><br><small>${uiEn?'(standard task — critical thinking & problem-solving)':'(tugasan standard — berfikir kritis & menyelesaikan masalah)'}</small><br>${rphGroupStepsHtml(pedagogy.librarySteps?.core,pedagogy.diffCoreAct,uiEn)}</div><div class="group-card group-challenger"><b>${uiEn?'Challenger Group':'Kelompok Pencabar'}</b><br><small>${uiEn?'(extension — creativity & innovation)':'(pengayaan — kreativiti & inovasi)'}</small><br>${rphGroupStepsHtml(pedagogy.librarySteps?.challenge,pedagogy.diffChallengeAct,uiEn)}</div></div></div>

  </div></div>

  <div class="rph-section">
  <div class="rph-section-header"><span class="rph-section-num">3</span><h3>${uiEn?'Classroom Assessment (PBD)':'Pentaksiran Bilik Darjah (PBD)'}</h3></div><div class="rph-section-body">
  <p><b>${uiEn?'Assessment Method':'Kaedah Pentaksiran'}:</b> ${escapeHtml(pedagogy.pbdEvidence?.method||'')}</p>
  <p><b>${uiEn?'Evidence':'Evidens'}:</b> ${escapeHtml(pedagogy.pbdEvidence?.evidence||'')}</p>
  <p><b>${uiEn?'Success Criterion':'Kriteria Kejayaan'}:</b> ${escapeHtml(pedagogy.pbdEvidence?.criterion||map.success_criteria||'')}</p>
</div></div>

  <div class="rph-section">
  <div class="rph-section-header"><span class="rph-section-num">4</span><h3>${uiEn?'Closure':'Penutup'}</h3></div><div class="rph-section-body"><div class="rph-closure">${escapeHtml(pedagogy.penutup)}</div></div></div>

  <div class="source-proof"><b>${uiEn?'Source trail':'Jejak sumber'}</b><p>${escapeHtml(evidenceRefs.join(' • ')||(uiEn?'Page evidence is stored in the Lesson Map.':'Bukti halaman disimpan dalam Lesson Map.'))}</p><details><summary>${uiEn?'View page excerpts':'Lihat petikan halaman'}</summary><pre>${escapeHtml([...ev.bt,...ev.ba].map(p=>`[${p.doc?.file_name} • ${uiEn?'p.':'m/s'} ${p.printed_page||p.page_no}]\n${snippet(p.content,650)}`).join('\n\n'))}</pre></details></div>
  ${(()=>{const L=reflectionLabels(uiEn);const total=state.students.filter(s=>s.class_id===classId).length;const email=escapeHtml(state.user?.email||'');const driveLabel=uiEn?'Google Drive account':'Akaun Google Drive';const currentLabel=uiEn?`Use signed-in DELIMa account${email?': '+email:''}`:`Guna akaun DELIMa login semasa${email?': '+email:''}`;const otherLabel=uiEn?'Choose another Google account':'Pilih akaun Google lain';return `<section class="rph-reflection no-print-export"><h3>${L.title}</h3><div class="reflection-grid"><label>${L.total}<input id="rphRefTotal" type="number" min="0" value="${total}"></label><label>${L.present}<input id="rphRefPresent" type="number" min="0" value="${total}"></label><label>${L.achieved}<input id="rphRefAchieved" type="number" min="0"></label><label>${L.active}<input id="rphRefActive" type="number" min="0"></label></div><label>${L.note}<textarea id="rphRefNote" rows="2" placeholder="${L.placeholder}"></textarea></label><button id="generateRphReflection" type="button" class="ghost">✨ ${L.generate}</button><textarea id="rphReflectionText" rows="4" placeholder="${L.empty}"></textarea><div id="rphReflectionView" class="reflection-output-view hidden"></div></section><div class="drive-account-picker no-print-export"><label>${driveLabel}<select id="rphDriveAccountMode"><option value="current">${currentLabel}</option><option value="other">${otherLabel}</option></select></label></div><div class="rph-action-grid no-print-export"><button id="saveGeneratedRph" class="primary" type="button">💾 ${L.save}</button><button id="downloadRphWord" class="ghost" type="button">📄 ${L.word}</button><button id="uploadRphDrive" class="ghost" type="button">☁️ ${L.drive}</button><button id="printGeneratedRph" class="ghost" type="button">🖨️ ${L.print}</button></div>`})()}`;
  $('#rphPreview').innerHTML=html;$('#rphPreview').classList.remove('hidden');$('#rphEmpty').classList.add('hidden');
  state.currentGeneratedRph={map,classId,subjectId,date,week,lessonTime,teacherName,activities,validation,built,html,uiEn,btRef,pedagogy,evidenceRefs};
  $('#generateRphReflection')?.addEventListener('click',generateReflectionText);$('#saveGeneratedRph')?.addEventListener('click',()=>saveGeneratedRphRecord(state.currentGeneratedRph));$('#downloadRphWord')?.addEventListener('click',downloadGeneratedRph);$('#uploadRphDrive')?.addEventListener('click',uploadGeneratedRphToDrive);$('#rphDriveAccountMode')?.addEventListener('change',resetDriveToken);$('#printGeneratedRph')?.addEventListener('click',printGeneratedRph);
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
    ].map(x=>x.key).filter(x=>x&&x!=='source-task'))]
  : [],differentiation:ctx.pedagogy?{support:ctx.pedagogy.diffSupport,core:ctx.pedagogy.diffCore,challenge:ctx.pedagogy.diffChallenge,support_act:ctx.pedagogy.diffSupportAct,core_act:ctx.pedagogy.diffCoreAct,challenge_act:ctx.pedagogy.diffChallengeAct}:null,main_sp:map.source_evidence?.meta?.main_sp||null,complementary_sp:map.source_evidence?.meta?.complementary_sp||[],complementary_evidence:map.source_evidence?.meta?.complementary_evidence||'',reflection},source_match_score:map.confidence_score,validation_score:validation.score};if(state.connected&&state.user){const {data,error}=await state.client.from('rph_records').upsert(payload,{onConflict:'teacher_id,class_id,subject_id,lesson_date'}).select().single();if(error)return toast('Simpan RPH gagal: '+error.message);const hist=activities.map((a,i)=>({teacher_id:state.user.id,class_id:classId,subject_id:subjectId,lesson_date:date,week_no:week,lesson_map_id:map.id,rph_record_id:data.id,activity_no:i+1,activity_text:a,activity_fingerprint:normalizeActivity(a),similarity_to_recent:Math.round(maxActivitySimilarity(a,subjectId,classId)*10000)/10000}));await state.client.from('rph_activity_history').delete().eq('rph_record_id',data.id);if(hist.length)await state.client.from('rph_activity_history').insert(hist);await logAudit('SAVE_ACCURATE_RPH',{rph_record_id:data.id,lesson_map_id:map.id,validation:validation.score,similarity:built.similarity});await loadAll()}toast(ctx.uiEn?'Lesson plan saved. Activity history is now used for anti-repeat.':'RPH berjaya disimpan. Sejarah aktiviti kini digunakan untuk anti-repeat.')}

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
$('#sourceSubject').addEventListener('change',()=>{renderSources();renderSourceReadiness()});$('#sourceYear').addEventListener('change',()=>{renderSources();renderSourceReadiness()});$('#sourceAcademicYear').addEventListener('change',()=>{renderSources();renderSourceReadiness()});$('#mapSubject').addEventListener('change',()=>{invalidateLessonAnalysis();renderLessonMaps();updateLessonMapLanguageUI();refreshWeekCoverage({silent:true})});$('#mapYear').addEventListener('change',()=>{invalidateLessonAnalysis();renderLessonMaps();refreshWeekCoverage({silent:true})});$('#mapAcademicYear').addEventListener('change',()=>{invalidateLessonAnalysis();renderLessonMaps();refreshWeekCoverage({silent:true})});$('#mapWeek').addEventListener('change',()=>{invalidateLessonAnalysis();refreshWeekCoverage({silent:true})});$('#mapSession').addEventListener('change',()=>{invalidateLessonAnalysis();renderWeekCoverage(currentWeekCoverage,currentMapFilter())});$('#buildLessonCandidate').addEventListener('click',buildLessonCandidate);$('#saveLessonDraft').addEventListener('click',()=>saveLessonMap('draft'));$('#verifyLessonMap').addEventListener('click',()=>saveLessonMap('verified'));$('#runAccuracyTest').addEventListener('click',()=>{if(!state.lessonCandidate)return toast('Analisis sumber dahulu.');const p=formLessonPayload(state.lessonCandidate.verification_status||'draft');p.source_evidence=state.lessonCandidate.evidence||state.lessonCandidate.source_evidence||{};renderMapGate(p,p.verification_status==='verified');toast(p.confidence_score>=85&&p.week_exact&&p.sp_crosscheck&&p.source_evidence?.meta?.session_exact&&p.objective&&p.success_criteria?'Semakan Lesson Map lengkap. Boleh disahkan.':'Masih ada item yang perlu dilengkapkan sebelum sahkan.',4500)});$('#refreshLessonMaps').addEventListener('click',async()=>{if(requireAuth())await loadAll()});
$('#saveTransit').addEventListener('click',saveTransit);$('#saveBooks').addEventListener('click',saveBooks);$('#generateRph').addEventListener('click',generateRph);$('#detectStandards').addEventListener('click',detectStandards);$('#importDetectedStandards').addEventListener('click',importDetectedStandards);$('#refreshSources').addEventListener('click',async()=>{if(requireAuth())await loadAll()});
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
