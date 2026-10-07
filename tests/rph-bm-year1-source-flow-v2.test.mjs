import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const cases=[
 ['rph-bm-year1-source-blueprint-hotfix.js','1.2.2',109,'Penyiram Pokok Inovasi','Menyampaikan maklumat berdasarkan gambar.'],
 ['rph-bm-year1-unit19-blueprint-hotfix.js','1.1.2',118,'Uruslah Saya','Memberikan respons terhadap soalan berdasarkan bahan.'],
 ['rph-bm-year1-unit20-blueprint-hotfix.js','1.1.2',123,'Sayangi Haiwan','Memberikan respons terhadap suruhan berdasarkan bahan.'],
 ['rph-bm-year1-unit21-blueprint-hotfix.js','1.1.2',129,'Program Hari Hijau','Memberikan respons terhadap pesanan berdasarkan bahan.'],
 ['rph-bm-year1-units22-24-blueprint-hotfix.js','1.2.1',138,'Wang untuk Aimi','Bertutur berdasarkan bahan dengan sebutan dan intonasi yang sesuai.']
];
for(const [file,sp,page,title,task] of cases){
 let forwarded=null;
 const s={console,window:null,rphSubjectKey:()=> 'bm',effectiveRphLessonMap:m=>m,buildSourceAwarePedagogy:(...args)=>{forwarded=args;return {fallback:true}}};s.window=s;
 vm.runInNewContext(fs.readFileSync(new URL('../'+file,import.meta.url),'utf8'),s,{filename:file});
 const map={subject_id:'subject',year:1,textbook_page_start:page,title,sp,source_evidence:{meta:{main_sp:sp}}};
 const out=s.buildSourceAwarePedagogy(map,[task],`m/s ${page}`,false,'class-1');
 assert.equal(out.sourceSteps.length,3,file+' sourceSteps');
 assert.equal(out.classroomFlow,out.sourceSteps,file+' classroomFlow');
 assert.equal(out.anchor,task,file+' source task anchor');
 assert.ok(out.sourceSteps[0].text.includes(task),file+' task visible');
 forwarded=null;s.buildSourceAwarePedagogy({...map,year:2},['outside'],'BT',true,'class-2');
 assert.equal(forwarded.length,5,file+' must preserve 5 args');
 assert.equal(forwarded[4],'class-2',file+' must preserve classId');
}
console.log('BM Year 1 source-flow v2 tests passed');
