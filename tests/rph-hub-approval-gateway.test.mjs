import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

// No network or real RPH/Drive/Cloudflare writes. All upstream calls are mocked.
const source=readFileSync(new URL('../functions/api/rph-approval.js',import.meta.url),'utf8');
const api=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const frontend=readFileSync(new URL('../rph-hub-approval.js',import.meta.url),'utf8');
assert.doesNotMatch(frontend,/RPH_QUEUE_ACTION_KEY|RPH_ACTION_KEY|RPH_POLL_KEY/);

const uid='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const vid='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const cid='cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const sid='dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const mid='eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
const hash='a'.repeat(64);
const file='10dNZR6DCtYZlkvrcvN-X1xpmfHEyod8A';
const env={
  RPH_APPROVAL_ENABLED:'true',
  RPH_SUPABASE_URL:'https://example.supabase.co',
  RPH_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_fake_for_test_only',
  RPH_QUEUE_GATEWAY_URL:'https://rph-gateway.example.workers.dev',
  RPH_QUEUE_ACTION_KEY:'test-action-key-only-on-server-'.padEnd(40,'z')
};
const mockJson=(body,status=200)=>Response.json(body,{status});
let calls=[];
let overrides={};
const savedFetch=globalThis.fetch;
globalThis.fetch=async (url,options={})=>{
  const u=new URL(String(url)),headers=new Headers(options.headers);
  calls.push({url:u.href,method:options.method||'GET',authorization:headers.get('authorization'),body:options.body||null});
  const p=u.pathname;
  if(p==='/auth/v1/user')return mockJson({id:uid,email:overrides.email||'g-test@moe-dl.edu.my'});
  if(p==='/rest/v1/authorized_users')
    return mockJson([{email:'g-test@moe-dl.edu.my',user_id:uid,status:overrides.status||'allowed'}]);
  if(p==='/rest/v1/rph_record_versions')
    return mockJson([{id:vid,teacher_id:uid,class_id:cid,subject_id:sid,lesson_map_id:mid,
      lesson_date:'2026-10-14',academic_year:2026,week_no:30,session_no:2,snapshot_sha256:hash}]);
  if(p==='/rest/v1/classes')
    return mockJson([{id:cid,teacher_id:uid,name:'2 Sapphire',year:2,academic_year:2026}]);
  if(p==='/rest/v1/subjects')
    return mockJson([{id:sid,teacher_id:uid,name:'Bahasa Melayu'}]);
  if(p==='/rest/v1/lesson_maps')
    return mockJson([{id:mid,teacher_id:uid,subject_id:sid,year:2,academic_year:2026,
      week_no:30,session_no:2,verification_status:overrides.mapStatus||'verified'}]);
  if(p==='/v1/queue/status')
    return mockJson({ok:true,found:true,item:{kod_rph:'RPH-'+vid,status:'COMPLETED',error_message:null}});
  if(p==='/v1/queue/enqueue')
    return mockJson({ok:true,created:true,status:'PENDING'},201);
  throw Error('Unexpected external request '+url);
};
const makeReq=(body,method='POST')=>new Request('https://hub.example/api/rph-approval',{
  method,headers:{origin:'https://hub.example',authorization:'Bearer jwt-test','content-type':'application/json'},
  ...(method==='POST'?{body:JSON.stringify(body)}:{})
});
const requestBody={approvalPhrase:'LULUS',versionId:vid,snapshotSha256:hash,driveFile:file};
try{
  let r=await api.onRequestGet({request:new Request('https://hub.example/api/rph-approval'),env:{
    ...env,RPH_APPROVAL_ENABLED:'false'}});
  assert.deepEqual(await r.json(),{ok:true,enabled:false});
  assert.equal(calls.length,0,'No external fetch when disabled');

  r=await api.onRequestPost({request:makeReq(requestBody),env:{...env,RPH_APPROVAL_ENABLED:'false'}});
  assert.equal(r.status,503);
  assert.equal(calls.length,0,'No external writes when disabled');

  r=await api.onRequestPost({request:makeReq({...requestBody,approvalPhrase:'DRAF'}),env});
  assert.equal(r.status,400);
  assert.equal(calls.length,0,'Approval phrase required before reading external systems');

  overrides.email='user@gmail.com';
  r=await api.onRequestPost({request:makeReq(requestBody),env});
  assert.equal(r.status,403,'Non-DELIMa user denied');
  overrides.email='g-test@moe-dl.edu.my';

  overrides.status='pending';
  r=await api.onRequestPost({request:makeReq(requestBody),env});
  assert.equal(r.status,403,'Unapproved DELIMa user denied');
  overrides.status='allowed';

  calls=[];
  r=await api.onRequestPost({request:makeReq({...requestBody,snapshotSha256:'b'.repeat(64)}),env});
  assert.equal(r.status,409,'Mismatch saved snapshot blocked');
  assert.ok(!calls.some(x=>x.url.includes('/v1/queue/enqueue')),'No queue write for edited snapshot');

  overrides.mapStatus='needs_review';
  calls=[];
  r=await api.onRequestPost({request:makeReq(requestBody),env});
  assert.equal(r.status,409,'Unverified Lesson Map blocked');
  assert.ok(!calls.some(x=>x.url.includes('/v1/queue/enqueue')),'No queue write for unverified map');
  overrides.mapStatus='verified';

  calls=[];
  r=await api.onRequestPost({request:makeReq(requestBody),env});
  assert.equal(r.status,201,'Verified request accepted');
  const ok=await r.json();
  assert.equal(ok.code,'RPH-'+vid);
  assert.equal(ok.autoTurnIn,false);
  const outbound=calls.find(x=>x.url.endsWith('/v1/queue/enqueue'));
  assert.ok(outbound,'Queue called after verification');
  assert.equal(outbound.authorization,'Bearer '+env.RPH_QUEUE_ACTION_KEY,'Secret stays on server');
  const payload=JSON.parse(outbound.body);
  assert.equal(payload.approvalPhrase,'LULUS');
  assert.deepEqual(payload.record,{
    code:'RPH-'+vid,driveFile:file,academicYear:2026,year:2,week:30,
    day:'Rabu',className:'2 Sapphire',subject:'Bahasa Melayu',session:'S2',assignmentId:''
  });
  assert.ok(calls.every(x=>!x.url.includes('classroom.googleapis.com')),'No Classroom submission');

  calls=[];
  r=await api.onRequestGet({request:new Request('https://hub.example/api/rph-approval?versionId='+vid,
    {headers:{authorization:'Bearer jwt-test'}}),env});
  assert.equal(r.status,200);
  assert.equal((await r.json()).status,'COMPLETED');
  assert.ok(calls.some(x=>x.url.includes('/v1/queue/status?code=RPH-')),'Status endpoint works');

  console.log('PASS: feature switch OFF, DELIMa access, stored version, verified source, queue payload, status read, Classroom guard');
}finally{globalThis.fetch=savedFetch;}
