import json
from pathlib import Path

base = Path('/data/data/com.termux/files/home/rph-hub/rph-library/generated/bm-year3-source-review-r1/drafts')
ids = ['BM3-2026B-W35-S5'] + [f'BM3-2026B-W36-S{i}' for i in range(1,6)] + [f'BM3-2026B-W37-S{i}' for i in range(1,4)]

def q_for(d):
    t=d['title']
    obj=d['objective']
    return [
        f'Apakah tajuk bahan pada BT Jilid 2 m/s {d["book_pages"][0]}?',
        f'Apakah satu maklumat atau tindakan yang dapat kamu nyatakan tentang “{t}” berdasarkan bahan?',
        'Bahagian manakah pada halaman yang menjadi bukti jawapan kamu?'
    ]

def example_for(d):
    t=d['title']
    if t == 'Kad Diskaun': return 'Contoh: guru menunjukkan tajuk “Kad Diskaun”, kemudian murid menunjuk maklumat yang dilihat pada kad dalam BT m/s 70.'
    if t == 'Bijak Berniaga': return 'Contoh: murid menggunakan kata atau frasa yang dipilih daripada bahan “Bijak Berniaga” untuk menyampaikan satu maklumat mudah.'
    if t == 'Perusahaan Salun': return 'Contoh: murid membaca bahagian tentang “Perusahaan Salun”, memilih maklumat penting dan menyebutnya kepada pasangan.'
    if t == 'Di Mana Ada Kemahuan, di Situ Ada Jalan': return 'Contoh: murid memilih kata kunci daripada bahan dan menulis satu ayat mudah tentang usaha mencapai kejayaan.'
    if t == 'Usahawan Berjaya': return 'Contoh: murid mengikut bacaan guru pada bahan “Usahawan Berjaya”, kemudian melafazkan baris atau ayat yang dipelajari dengan sebutan jelas.'
    if t == 'Berusaha Bersama-sama': return 'Contoh: murid mengenal pasti kata terbitan yang terdapat pada bahan dan menggunakannya dalam satu ayat mudah.'
    if t == 'Oh, Inspirasiku!': return 'Contoh: murid menyatakan satu idea mudah tentang individu yang menjadi inspirasi berdasarkan bahan pada BT m/s 76.'
    if t == 'Hasil Menabung': return 'Contoh: murid membaca maklumat pada BT m/s 77 dan menyebut satu hasil menabung yang dinyatakan dalam bahan.'
    if t == 'Pantun Sikap Berjimat': return 'Contoh: guru membaca pantun pada BT m/s 78 dengan sebutan jelas, kemudian murid mengikut bacaan guru.'
    return f'Contoh: murid menggunakan maklumat daripada bahan “{t}” untuk menghasilkan satu respons mudah.'

def phase_data(d):
    t=d['title']; p=d['book_pages'][0]; obj=d['objective']; qs=q_for(d); ex=example_for(d)
    res=f'BT Bahasa Melayu Jilid 2 m/s {p}, papan putih, kad kata atau kad gambar, lembaran tugasan ringkas'
    skill = {
      'Set induksi': [f'Tunjukkan tajuk “{t}” dan bahan pada BT Jilid 2 m/s {p}.', f'Baca atau sebut tajuk bersama murid.', f'Tanya: “{qs[0]}” dan “Apakah yang kamu tahu tentang tajuk ini?”'],
      'Guru tunjuk': [ex, f'Modelkan satu langkah untuk mencapai objektif: {obj[0].lower()+obj[1:]}.', f'Tunjukkan cara mencari bukti pada halaman dan tanya, “{qs[2]}”'],
      'Cuba bersama': [f'Pimpin murid menjawab soalan: “{qs[1]}” berdasarkan bahan.', 'Susun kata kunci atau jawapan di papan putih.', 'Baca semula respons kelas dan betulkan satu kesilapan dengan alasan mudah.'],
      'Latihan pasangan': [f'Beri tugasan berpasangan tentang “{t}” menggunakan bahan halaman yang sama.', 'Tanya pasangan secara bergilir: “Apakah bukti jawapan kamu?”', 'Bimbing pasangan yang memerlukan kad kata, gambar atau bacaan contoh.'],
      'Cubaan individu': [f'Beri satu tugasan individu yang terus berkaitan dengan “{t}”.', 'Minta murid merujuk halaman dan menghasilkan respons sendiri.', 'Semak hasil, beri satu maklum balas dan minta murid membaiki satu bahagian.'],
      'Penutup dan refleksi': ['Minta dua atau tiga murid berkongsi respons atau hasil.', 'Tanya: “Apakah satu perkara yang kamu pelajari hari ini?”', 'Rumus kemahiran, catat murid yang perlu intervensi dan nyatakan latihan susulan.']
    }
    pupils = {
      'Set induksi': [f'Lihat tajuk “{t}” dan bahan pada halaman {p}.', 'Sebut atau tunjuk satu perkara yang diketahui.', 'Jawab satu soalan awal dengan ayat mudah.'],
      'Guru tunjuk': ['Dengar bacaan atau penerangan guru.', 'Ikut contoh guru langkah demi langkah.', 'Tunjuk perkataan, ayat atau bahagian halaman yang menjadi bukti.'],
      'Cuba bersama': ['Beri satu jawapan secara lisan atau dengan kad.', 'Bincang jawapan dengan rakan sekelas.', 'Semak dan baiki jawapan selepas maklum balas guru.'],
      'Latihan pasangan': ['Bergilir membaca, menunjuk atau melakukan tugasan.', 'Tanya pasangan satu soalan tentang bukti pada halaman.', 'Semak hasil pasangan dan beri satu pujian atau cadangan.'],
      'Cubaan individu': ['Buat tugasan sendiri dengan merujuk bahan sumber.', 'Gunakan kad bantuan jika perlu.', 'Baiki satu bahagian selepas semakan guru.'],
      'Penutup dan refleksi': ['Kongsi satu jawapan atau hasil.', 'Sebut kemahiran yang dipelajari.', 'Tunjukkan isyarat boleh sendiri atau masih perlukan bantuan.']
    }
    phases=[]
    mins=[5,10,15,15,10,5]
    for (name, minutes) in zip(skill, mins):
        phases.append({'name':name,'minutes':minutes,'teacher':skill[name],'pupils':pupils[name], 'check':f'Semak respons murid tentang “{t}”, bukti daripada BT m/s {p}, ketepatan tugasan dan bantuan yang digunakan.', 'resources':res})
    return phases

def lane(d,label,mode):
    t=d['title']; p=d['book_pages'][0]
    if mode=='support': task=f'Gunakan BT Jilid 2 m/s {p}, gambar dan kad kata untuk melakukan tugasan “{t}”. Guru beri pilihan jawapan dan contoh lisan.'; product=f'Respons mudah tentang “{t}” dengan bantuan gambar atau kata kunci.'
    elif mode=='core': task=f'Gunakan BT Jilid 2 m/s {p} untuk melakukan tugasan “{t}” dan hasilkan respons sendiri selepas latihan bersama.'; product=f'Respons atau hasil tugasan tentang “{t}” berdasarkan bukti pada halaman.'
    else: task=f'Gunakan BT Jilid 2 m/s {p} untuk melakukan tugasan “{t}”, kemudian tambah satu sebab, contoh atau penjelasan ringkas yang masih berpandukan bahan.'; product=f'Respons tentang “{t}” dengan satu sebab, contoh atau penjelasan ringkas berdasarkan bahan.'
    return {'label':label,'task':task,'materials':[f'BT Jilid 2 m/s {p}','papan putih','kad kata atau kad gambar','lembaran tugasan ringkas'], 'teacher':['Tunjukkan langkah pertama dengan contoh daripada halaman.','Beri soalan pandu dan minta murid menunjuk bukti.','Semak produk dan beri maklum balas khusus.','Minta murid membaiki satu bahagian.'], 'pupil_steps':['Lihat, baca atau dengar bahan sumber.','Pilih maklumat, kata atau bahagian halaman yang diperlukan.','Lakukan tugasan bersama pasangan dan jelaskan bukti.','Buat satu cubaan sendiri dan baiki respons.'], 'product':product,'criterion':'Kemahiran utama ditunjukkan dengan tepat; bantuan yang digunakan direkodkan.','next_step':'Ulang item yang belum tepat menggunakan halaman, contoh dan soalan pandu yang sama.'}

for ident in ids:
    path=base/(ident+'.json')
    with path.open(encoding='utf-8') as f: d=json.load(f)
    d['phases']=phase_data(d)
    d['differentiation']={'support':lane(d,'Peneroka — Dengan gambar dan kata kunci','support'),'core':lane(d,'Pembina — Dengan bahan sumber','core'),'challenge':lane(d,'Pencabar — Dengan penjelasan ringkas','challenge')}
    d['pbd']={'method':'Pemerhatian, soal jawab dan semakan produk individu.','evidence':f'Respons lisan, bacaan, tulisan atau hasil tugasan berkaitan “{d["title"]}” dan BT Jilid 2 m/s {d["book_pages"][0]}.','criterion':'Kemahiran utama dilakukan dengan tepat atau dengan bantuan yang direkod.','recording':'Boleh sendiri, boleh dengan bantuan, belum diperhatikan.','sample_checklist':[{'item':f'Murid merujuk bahan “{d["title"]}”.','boleh_sendiri':'☐','dengan_bantuan':'☐','belum_diperhatikan':'☐'},{'item':'Murid memberi respons atau menghasilkan tugasan yang berkaitan.','boleh_sendiri':'☐','dengan_bantuan':'☐','belum_diperhatikan':'☐'},{'item':'Murid membaiki satu respons selepas maklum balas.','boleh_sendiri':'☐','dengan_bantuan':'☐','belum_diperhatikan':'☐'}]}
    d['reflection']='____ / ____ murid mencapai objektif; ____ memerlukan bimbingan; ____ belum diperhatikan. Bukti yang jelas: ____. Perkara yang masih keliru: ____.'
    d['intervention']=f'Ulang tugasan “{d["title"]}” dengan bahan BT m/s {d["book_pages"][0]}, satu contoh guru, kad kata atau gambar. Jalankan cuba bersama, kemudian beri satu item individu dan rekod bantuan.'
    with path.open('w',encoding='utf-8',newline='\n') as f: json.dump(d,f,ensure_ascii=False,indent=2); f.write('\n')
    print('WROTE', path.name)
