// BM Tahun 2 Minggu 29: prevent generic induction from replacing exact
// textbook-sourced plan cards. Always retain the original Accuracy Gate.
(function(root){
'use strict';
const guardVersion='BM2-W29-CARD-PARITY-20261010b';
const subjectKey=m=>{try{return root.rphSubjectKey?.(m?.subject_id)||m?.subject_key||''}catch{return m?.subject_key||''}};
const isTarget=m=>subjectKey(m)==='bm'
  &&Number(m?.year)===2&&Number(m?.academic_year)===2026
  &&Number(m?.week_no)===29&&Number(m?.session_no)>=1&&Number(m?.session_no)<=5;
function enforce(map,ped){
 if(!isTarget(map))return ped;
 const source=root.BmYear2Week29SourcePlans;
 if(!source?.applies(map,{subjectKey:'bm'}))throw Error(
  'BM2 M29 S'+map.session_no+': bukti Buku Teks/SP atau status Lesson Map belum disahkan. Aktiviti generik tidak boleh menggantikan RPH bersumber.'
 );
 // Restore the same reviewed source steps, individual PBD and specific
 // induction together. No Lesson Map or approval status is modified here.
 const fixed=source.prepare(map,ped,{subjectKey:'bm'});
 const opening=fixed.phases?.[0];
 if(!opening||fixed.inductionData?.name!==opening.name
   ||!fixed.inductionData?.text?.includes('Tindakan murid:')
   ||fixed.sourceSteps?.length!==6)throw Error('BM2 M29: kandungan kad tidak sepadan dengan pelan sumber.');
 return fixed;
}
const previous=root.buildSourceAwarePedagogy;
if(typeof previous==='function'){
 root.buildSourceAwarePedagogy=function(map,...args){
  return enforce(map,previous.call(this,map,...args));
 };
 try{if(typeof buildSourceAwarePedagogy!=='undefined')buildSourceAwarePedagogy=root.buildSourceAwarePedagogy}catch{}
}
root.Bm2Week29CardParity={version:guardVersion,isTarget,enforce};
if(typeof module!=='undefined'&&module.exports)module.exports=root.Bm2Week29CardParity;
})(typeof window!=='undefined'?window:globalThis);
