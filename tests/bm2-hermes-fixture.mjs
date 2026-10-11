import fs from 'node:fs';
const manifest=JSON.parse(fs.readFileSync(new URL('../data/bm2-hermes-review-manifest.json',import.meta.url),'utf8'));
export {manifest};
export function fixture(){
 const d={
  status:'NOT_IMPORTED; REVIEW_REQUIRED',
  count_unique_sessions:33,count_original_docx:66,
  default_candidate_revision:'r1',alternative_revision:'r2',
  lessons:[]
 };
 for(const item of manifest.lessons){
  const row={session_id:item.session_id,week_no:item.week_no,session_no:item.session_no,
   lesson_map:{title:item.title,sp:item.sp,page:item.page,verification_status:'needs_review'}};
  for(const rev of ['r1','r2']){
   row[rev]={
    revision:rev,approved:false,import_status:'DRAFT_CANDIDATE_ONLY',
    lesson_map_review_status:'needs_review',source:'Hermes DOCX',
    title_original:item.title,sp_original:item.sp,sk_original:'Standard Kandungan',
    sp_support_original:'—',objective_original:'Objektif sesi '+item.session_id,
    success_criteria_original:'Kriteria sesi '+item.session_id,
    textbook_pages_original:'m/s '+item.page,source_file_path:'Fixture/'+item.session_id+'.docx',
    source_docx_sha256:item.source_sha256[rev],
    metadata_for_import:{subject_key:'bm',year:2,academic_year:2026,
     week_no:item.week_no,session_no:item.session_no,lesson_date:null,class_id:null,teacher_id:null},
    induction_original:{'BBM/ABM':'Buku Teks','PAK-21':'Perbincangan'},
    six_phases_original:Array.from({length:6},(_,i)=>({phase_original:'Langkah '+(i+1),execution_original:'Tindakan guru dan murid '+(i+1),aids_and_pak21_original:'Buku Teks'})),
    differentiation_original:Object.fromEntries(['peneroka','pembina','pencabar'].map(label=>[label,{label,implementation_original:'Latihan '+label,aids_and_pak21_original:'Buku Teks'}])),
    pbd_original:{'Kaedah Pentaksiran':'Semakan individu','Evidens':'Hasil individu','Kriteria Kejayaan':'Tepat'},
    closure_original:'Penutup khusus sesi',reflection_original:'Refleksi individu selepas PdP'
   };
  }
  d.lessons.push(row);
 }
 return d;
}
