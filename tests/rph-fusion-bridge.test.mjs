import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

const bridgeSource=await fs.readFile('functions/api/fusion/[[path]].js','utf8');
const editorSource=await fs.readFile('rph-fusion-edit.js','utf8');
new vm.Script(editorSource, {filename:'rph-fusion-edit.js'});
const {bridge}=await import('data:text/javascript;charset=utf-8,'+encodeURIComponent(bridgeSource));
const env={
  FUSION_API_URL:'https://fusion-test.example.workers.dev',
  FUSION_SERVICE_TOKEN_V2:'not-a-real-secret-for-tests'
};
const previousFetch=globalThis.fetch;
const calls=[];
try {
  globalThis.fetch=async (url,init={})=>{
    calls.push({url:String(url),init});
    if(String(url).endsWith('/auth/v1/user')){
      if(init.headers?.authorization!=='Bearer test-teacher-jwt')return Response.json({error:'invalid'}, {status:401});
      return Response.json({id:'teacher-1',email:'teacher@moe-dl.edu.my'});
    }
    if(String(url).includes('/rest/v1/authorized_users')){
      const status=globalThis.__testTeacherStatus ?? 'allowed';
      return Response.json([{status}]);
    }
    if(String(url).endsWith('/v1/skills/rph/edit/health')){
      return Response.json({ok:true,ready:true});
    }
    if(String(url).endsWith('/v1/skills/rph/edit')){
      assert.equal(init.headers.authorization,'Bearer '+env.FUSION_SERVICE_TOKEN_V2);
      const request=JSON.parse(init.body);
      assert.deepEqual(request.blocks,[{kind:'p',text:'Peneroka membaca ayat.'}]);
      return Response.json({ok:true,blocks:[{kind:'p',text:'Peneroka membaca dan menggariskan ayat.'}],changed:[0],violations:[],ms:200});
    }
    throw Error('Unexpected URL: '+url);
  };
  const health=await bridge(new Request('https://rph-hub.pages.dev/api/fusion/health'),env);
  assert.equal(health.status,200);
  assert.equal((await health.json()).ok,true);

  const unauthorized=await bridge(new Request('https://rph-hub.pages.dev/api/fusion/edit',{
    method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({blocks:[{kind:'p',text:'x'}],instruction:'Ringkaskan'})
  }),env);
  assert.equal(unauthorized.status,401);

  globalThis.__testTeacherStatus='active';
  const denied=await bridge(new Request('https://rph-hub.pages.dev/api/fusion/edit',{
    method:'POST',headers:{authorization:'Bearer test-teacher-jwt','content-type':'application/json'},
    body:JSON.stringify({blocks:[{kind:'p',text:'Peneroka membaca ayat.'}],instruction:'Perincikan'})
  }),env);
  assert.equal(denied.status,401);

  globalThis.__testTeacherStatus='allowed';
  const edited=await bridge(new Request('https://rph-hub.pages.dev/api/fusion/edit',{
    method:'POST',headers:{authorization:'Bearer test-teacher-jwt','content-type':'application/json'},
    body:JSON.stringify({blocks:[{kind:'p',text:'Peneroka membaca ayat.'}],instruction:'Perincikan'})
  }),env);
  assert.equal(edited.status,200);
  const payload=await edited.json();
  assert.equal(payload.blocks[0].text,'Peneroka membaca dan menggariskan ayat.');
  assert.equal(payload.teacher,'teacher@moe-dl.edu.my');
  assert.ok(calls.find(c=>c.url.endsWith('/auth/v1/user')));
  assert.ok(calls.find(c=>c.url.includes('/authorized_users')));
  assert.ok(calls.find(c=>c.url.endsWith('/v1/skills/rph/edit')));
  assert.match(editorSource,/querySelectorAll\('\[data-rph-edit\]'\)/);
  assert.match(editorSource,/splitBatches/);
  assert.match(editorSource,/fusionDraftFromApproved/);
  assert.match(bridgeSource,/rows\[0\]\?\.status !== 'allowed'/);
  console.log('RPH Fusion bridge auth + table editing regression PASS');
} finally {
  globalThis.fetch=previousFetch;
  delete globalThis.__testTeacherStatus;
}