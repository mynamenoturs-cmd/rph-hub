// Server proxy for private Supabase-admin-guarded Hermes review function.
// No Hermes Word content or teacher data must be committed into this public repo.
const EDGE_URL='https://syqhegxtwsjnkoutlwno.supabase.co/functions/v1/rph-bm2-hermes-review';
const PUBLISHABLE_KEY="sb_publishable_OeKcLCfDnw7FlWrSjUXGfg_t1YAD-zP";
const json=(payload,status=200)=>Response.json(payload,{status,headers:{'cache-control':'private, no-store, max-age=0','x-content-type-options':'nosniff'}});
export async function onRequestGet({request}){
 const token=String(request.headers.get('authorization')||'');
 if(!/^Bearer \S+$/.test(token))return json({error:'Sila log masuk untuk menyemak RPH Hermes.'},401);
 try{
  const result=await fetch(EDGE_URL,{method:'GET',headers:{authorization:token,apikey:PUBLISHABLE_KEY},cache:'no-store'});
  if(!result.ok){
   const error=await result.json().catch(()=>({}));
   const fallback=result.status===401?'Sesi login tidak sah. Sila log masuk semula.':result.status===403?'Akaun ini belum mempunyai akses admin.':'Sumber Hermes tidak dapat dicapai buat masa ini.';
   return json({error:typeof error?.error==='string'?error.error:fallback},result.status);
  }
  const data=await result.json();
  if(!data||data.status!=='NOT_IMPORTED; REVIEW_REQUIRED'||data.count_unique_sessions!==33||data.count_original_docx!==66||data.lessons?.length!==33)return json({error:'Format data Hermes tidak sah; import dihentikan.'},502);
  return json(data);
 }catch(_){
  return json({error:'Sambungan ke semakan Hermes tidak tersedia. Cuba semula.'},503);
 }
}
