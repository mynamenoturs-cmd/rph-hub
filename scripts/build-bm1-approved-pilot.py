#!/usr/bin/env python3
"""Make isolated inactive candidates from approved bytes; never regenerate lessons."""
from pathlib import Path
import sys,json,hashlib,runpy
ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/'rph-library/generated/bm1-library-safe-pilot-r1'
APPROVED=ROOT/'rph-library/generated/bm-year1-m29-m37-review-r1'
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def canonical(v):return json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(',',':'))
def main():
 sys.dont_write_bytecode=True;sys.path.insert(0,str(APPROVED));sys.modules.pop('pack_config',None)
 verified=runpy.run_path(str(APPROVED/'verify-feedback.py'))['verify_feedback']()
 receipt=json.loads((APPROVED/'teacher-approval-r1.json').read_text());manifest=json.loads((APPROVED/'review-pack/manifest.json').read_text());scope=json.loads((APPROVED/'scope.json').read_text())
 assert receipt['feedback_sha256']==verified['feedback_sha256'] and receipt['manifest_sha256']==verified['manifest_sha256']
 assert receipt['accepted_ids']==verified['accepted_ids']and set(receipt['accepted_ids'])=={s['id']for s in manifest['sessions']}
 out=WORK/'app';out.mkdir(exist_ok=True)
 rows=[]
 for s in manifest['sessions']:
  i=s['id'];raw=(APPROVED/'drafts'/(i+'.json')).read_text();d=json.loads(raw);assert hashlib.sha256(raw.encode()).hexdigest()==s['content_sha256']
  bs=json.loads((APPROVED/'review-pack'/(i+'-blocks.json')).read_text());pages=d['book_pdf_pages'];printed=[p-8 for p in pages]
  rows.append({'id':i,'subject_key':'bm','year':1,'academic_year':2026,'week':d['week'],'session':d['session'],'duration':d['minutes'],'sp':d['sp_code'],'sp_focus':d['sp_focus'],'sp_display':d['sp_display'],'printed_pages':printed,'source_row_id':d['source_row_id'],'content_origin_version':d['version'],'approval_version':manifest['version'],'content_sha256':s['content_sha256'],'raw_lesson_json':raw,'lesson':d,'reviewed_blocks':bs,'reviewed_blocks_sha256':hashlib.sha256(canonical(bs).encode()).hexdigest(),'approval_status':'ACCEPTED_FROM_DOWNLOADED_CATATAN','active':False,'source_conditional':s['source_conditional'],'requires_teacher_singing_model':i=='BM1-2026B-W29-S4','limits':{'source_hold':s['source_hold'],'adaptation_note':s['adaptation_note'],'source_images_verified':False,'audio_verified':False,'ba_verified':False,'classroom_trial_performed':False}})
 blocked=[{'id':s['id'],'week':s['week'],'session':s['session'],'reason':s['cell_raw'],'status':'SPECIAL_OR_UNSUPPORTED'}for s in scope['special_or_unsupported']]
 blocked.append({'id':'BM1-2026B-W34-S3','week':34,'session':3,'reason':'RPT subfokus cerita tidak sepadan dengan petikan fakta BT136. Tidak termasuk kelulusan kandungan.','status':'HELD_SUBFOCUS'})
 data={'schema':'rph-approved-library-v1','subject_key':'bm','year':1,'academic_year':2026,'version':manifest['version'],'scope':'LOCAL_INACTIVE_CANDIDATES_ONLY','active':False,'teacher_content_approved':True,'manifest_sha256':manifest['manifest_sha256'],'approval_receipt_sha256':sha(APPROVED/'teacher-approval-r1.json'),'feedback_sha256':receipt['feedback_sha256'],'source_hashes':json.loads((APPROVED/'source-hashes.json').read_text()),'entries':rows,'blocked_routes':blocked,'reviewed_count':len(rows),'regular_sessions_per_week':5,'minutes_per_session':60}
 raw=json.dumps(data,ensure_ascii=False,indent=2)+'\n';target=out/'approved-bm1-library.json';target.write_text(raw)
 report={'status':'APPROVED_INACTIVE_CANDIDATES_BUILT','file':str(target),'file_sha256':sha(target),'approved_ids':[r['id']for r in rows],'entry_count':len(rows),'blocked_route_count':len(blocked),'pilot_ids':[r['id']for r in rows if r['week']==29],'approval_receipt_sha256':data['approval_receipt_sha256'],'source_manifest_sha256':manifest['manifest_sha256'],'production_write_performed':False,'approved_payload_unchanged':True}
 (WORK/'candidate-manifest.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps({k:report[k]for k in ['status','file','file_sha256','entry_count','blocked_route_count','pilot_ids','production_write_performed']}))
if __name__=='__main__':main()
