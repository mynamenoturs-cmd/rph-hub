// Pages server-side bridge for the RPH MASTER AI D1 queue.
// Never expose RPH_QUEUE_ACTION_KEY to the browser.
// Feature is OFF unless RPH_APPROVAL_ENABLED=true and all server vars exist.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SHA = /^[0-9a-f]{64}$/;
const DRIVE_ID = /^[A-Za-z0-9_-]{15,}$/;
const DELIMA = /^g-[^@]+@moe-dl\.edu\.my$/i;
const DAY = ['Ahad','Isnin','Selasa','Rabu','Khamis','Jumaat','Sabtu'];
const headers = {'cache-control':'private, no-store, max-age=0','x-content-type-options':'nosniff'};
const reply = (data,status=200) => Response.json(data,{status,headers});
const configured = env => env.RPH_APPROVAL_ENABLED === 'true'
  && /^https:\/\/[^/]+\.supabase\.co\/?$/.test(String(env.RPH_SUPABASE_URL||''))
  && String(env.RPH_SUPABASE_PUBLISHABLE_KEY||'').length >= 20
  && /^https:\/\/[^/]+$/.test(String(env.RPH_QUEUE_GATEWAY_URL||''))
  && String(env.RPH_QUEUE_ACTION_KEY||'').length >= 32;
const bad = (code,status=400) => reply({ok:false,error:code},status);
function scopedUrl(base,path,params={}) {
  const u = new URL(path,String(base).replace(/\/+$/,'')+'/');
  for (const [k,v] of Object.entries(params)) u.searchParams.set(k,String(v));
  return u.toString();
}
function config(env) {
  return {
    supabase: String(env.RPH_SUPABASE_URL).replace(/\/+$/,''),
    key: String(env.RPH_SUPABASE_PUBLISHABLE_KEY),
    gateway: String(env.RPH_QUEUE_GATEWAY_URL).replace(/\/+$/,''),
    actionKey: String(env.RPH_QUEUE_ACTION_KEY)
  };
}
async function supabaseJson(c,token,path,params) {
  const url=scopedUrl(c.supabase,path,params);
  const r=await fetch(url,{headers:{apikey:c.key,authorization:'Bearer '+token,accept:'application/json'},cache:'no-store'});
  if(!r.ok) throw Object.assign(Error('SUPABASE_ACCESS_FAILED'),{status:r.status===401?401:403});
  return r.json();
}
async function identity(request,c){
  const bearer=/^Bearer ([^\s]+)$/.exec(request.headers.get('authorization')||'');
  if(!bearer) throw Object.assign(Error('LOGIN_REQUIRED'),{status:401});
  const token=bearer[1];
  const user=await supabaseJson(c,token,'/auth/v1/user');
  const email=String(user?.email||'').toLowerCase();
  if(!UUID.test(user?.id||'')||!DELIMA.test(email)) throw Object.assign(Error('DELIMA_REQUIRED'),{status:403});
  const access=await supabaseJson(c,token,'/rest/v1/authorized_users',{
    select:'email,user_id,status',email:'eq.'+email,limit:1
  });
  const row=access?.[0];
  if(row?.status!=='allowed'||(row.user_id&&row.user_id!==user.id))
    throw Object.assign(Error('USER_NOT_APPROVED'),{status:403});
  return {id:user.id,email,token};
}
async function onlyOne(c,user,table,select,filters){
  const list=await supabaseJson(c,user.token,'/rest/v1/'+table,{
    select,...filters,limit:1
  });
  if(!Array.isArray(list)||!list.length)
    throw Object.assign(Error('SOURCE_NOT_FOUND_OR_DENIED'),{status:404});
  return list[0];
}
async function versionContext(c,user,versionId){
  if(!UUID.test(versionId)) throw Object.assign(Error('INVALID_VERSION'),{status:400});
  const version=await onlyOne(c,user,'rph_record_versions',
    'id,teacher_id,class_id,subject_id,lesson_map_id,lesson_date,academic_year,week_no,session_no,snapshot_sha256',
    {id:'eq.'+versionId,teacher_id:'eq.'+user.id});
  const [cls,sub,map]=await Promise.all([
    onlyOne(c,user,'classes','id,teacher_id,name,year,academic_year',
      {id:'eq.'+version.class_id,teacher_id:'eq.'+user.id}),
    onlyOne(c,user,'subjects','id,teacher_id,name',
      {id:'eq.'+version.subject_id,teacher_id:'eq.'+user.id}),
    onlyOne(c,user,'lesson_maps',
      'id,teacher_id,subject_id,year,academic_year,week_no,session_no,verification_status',
      {id:'eq.'+version.lesson_map_id,teacher_id:'eq.'+user.id})
  ]);
  if(map.verification_status!=='verified'||map.subject_id!==sub.id
    ||Number(map.year)!==Number(cls.year)||Number(map.academic_year)!==Number(version.academic_year)
    ||Number(map.week_no)!==Number(version.week_no)
    ||Number(map.session_no)!==Number(version.session_no)
    ||Number(cls.academic_year)!==Number(version.academic_year))
    throw Object.assign(Error('LESSON_MAP_NOT_VERIFIED_OR_MISMATCH'),{status:409});
  return {version,cls,sub};
}
function dayForDate(value){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(value))throw Error('INVALID_LESSON_DATE');
  const d=new Date(value+'T12:00:00Z');
  if(Number.isNaN(d.getTime())||d.toISOString().slice(0,10)!==value)throw Error('INVALID_LESSON_DATE');
  return DAY[d.getUTCDay()];
}
async function worker(c,method,path,body){
  const r=await fetch(c.gateway+path,{
    method,
    headers:{authorization:'Bearer '+c.actionKey,...(body?{'content-type':'application/json'}:{})},
    ...(body?{body:JSON.stringify(body)}:{}),
    cache:'no-store'
  });
  const data=await r.json().catch(()=>({}));
  if(!r.ok||data.ok!==true)
    throw Object.assign(Error(typeof data.error==='string'?data.error.slice(0,120):'QUEUE_UNAVAILABLE'),
      {status:r.status===409?409:502});
  return data;
}
const fail = error => {
  const known=/^(LOGIN_REQUIRED|DELIMA_REQUIRED|USER_NOT_APPROVED|SOURCE_NOT_FOUND_OR_DENIED|INVALID_VERSION|LESSON_MAP_NOT_VERIFIED_OR_MISMATCH|INVALID_LESSON_DATE|SUPABASE_ACCESS_FAILED|APPROVAL_REQUIRED|INVALID_FILE|VERSION_CHANGED|INVALID_BODY|INVALID_ORIGIN|INVALID_FIELDS|CONFLICT.*)$/;
  const code=String(error?.message||'SERVER_ERROR');
  return bad(known.test(code)?code:'SERVER_ERROR',error?.status||500);
};
export async function onRequestGet({request,env}){
  if(!configured(env))return reply({ok:true,enabled:false});
  const c=config(env),url=new URL(request.url),versionId=url.searchParams.get('versionId');
  if(!versionId)return reply({ok:true,enabled:true});
  try{
    const user=await identity(request,c);
    const {version}=await versionContext(c,user,versionId);
    const code='RPH-'+version.id;
    const status=await worker(c,'GET','/v1/queue/status?code='+encodeURIComponent(code));
    return reply({ok:true,enabled:true,found:status.found===true,code,
      status:status.item?.status||null,error:status.item?.error_message||null});
  }catch(error){return fail(error)}
}
export async function onRequestPost({request,env}){
  if(!configured(env))return bad('APPROVAL_INACTIVE',503);
  const origin=request.headers.get('origin');
  if(origin&&origin!==new URL(request.url).origin)return bad('INVALID_ORIGIN',403);
  if(Number(request.headers.get('content-length')||0)>4000)return bad('INVALID_BODY');
  try{
    const raw=await request.text();
    if(raw.length>4000)return bad('INVALID_BODY');
    const body=JSON.parse(raw);
    if(!body||typeof body!=='object'||Array.isArray(body))return bad('INVALID_BODY');
    if(body.approvalPhrase!=='LULUS')return bad('APPROVAL_REQUIRED');
    const versionId=String(body.versionId||'');
    const driveFile=String(body.driveFile||'');
    const hash=String(body.snapshotSha256||'');
    if(!DRIVE_ID.test(driveFile))return bad('INVALID_FILE');
    if(!SHA.test(hash))return bad('INVALID_BODY');
    const c=config(env),user=await identity(request,c);
    const {version,cls,sub}=await versionContext(c,user,versionId);
    if(version.snapshot_sha256!==hash)return bad('VERSION_CHANGED',409);
    const payload={approvalPhrase:'LULUS',record:{
      code:'RPH-'+version.id,driveFile,academicYear:Number(version.academic_year),
      year:Number(cls.year),week:Number(version.week_no),day:dayForDate(version.lesson_date),
      className:String(cls.name||''),subject:String(sub.name||''),
      session:'S'+Number(version.session_no),assignmentId:''
    }};
    const result=await worker(c,'POST','/v1/queue/enqueue',payload);
    return reply({ok:true,code:payload.record.code,created:result.created===true,
      status:result.status||'PENDING',autoTurnIn:false},result.created?201:200);
  }catch(error){return fail(error)}
}
