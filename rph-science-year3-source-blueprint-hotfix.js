(function(){
  'use strict';

  const subjectKey=m=>{try{return typeof window.rphSubjectKey==='function'?window.rphSubjectKey(m?.subject_id):''}catch{return ''}};
  const mainSp=m=>String(m?.source_evidence?.meta?.main_sp||String(m?.sp||'').split(',')[0]||'').trim();
  const year=m=>Number(m?.year||0)||0;
  const page=m=>Number(m?.textbook_page_start||0)||0;
  const pageLabel=m=>page(m)?`Buku Teks m/s ${page(m)}`:'Buku Teks';
  const step=(key,name,text,bbm,pak21)=>({key,name,text,bbm,pak21,phase:'source'});

  function mode(m){
    if(subjectKey(m)!=='science'||year(m)!==3)return '';
    const s=mainSp(m),p=page(m);
    if(s==='2.1.1'&&p===24)return 'science_rules';
    if(s==='3.1.1'&&p===30)return 'teeth_types';
    if(s==='3.1.2'&&p===32)return 'teeth_structure';
    if(s==='3.2.4'&&p===47)return 'unbalanced_food';
    if(s==='3.3.2'&&p===50)return 'digestion_order';
    if(s==='3.3.4'&&p===54)return 'digestion_effects';
    if(s==='4.1.1'&&p===62)return 'animal_diet_classify';
    if(s==='4.1.2'&&p===62)return 'animal_diet_explain';
    if(s==='5.1.1'&&p===72)return 'plant_reproduction';
    if(s==='5.1.2'&&p===74)return 'plant_importance';
    return '';
  }

  function objectivePair(m){
    const p=pageLabel(m);
    switch(mode(m)){
      case 'science_rules': return {
        objective:`Pada akhir PdP, murid dapat mengenal pasti sekurang-kurangnya empat amalan yang mematuhi peraturan bilik sains dan memberi sebab bagi sekurang-kurangnya dua amalan berdasarkan ${p}.`,
        criteria:'Murid mengelaskan sekurang-kurangnya empat situasi dengan betul dan memberi dua sebab yang berkaitan dengan keselamatan atau pengurusan bilik sains.'
      };
      case 'teeth_types': return {
        objective:`Pada akhir PdP, murid dapat memerihalkan tiga jenis gigi iaitu gigi kacip, gigi taring dan gigi geraham serta memadankan setiap jenis dengan fungsinya berdasarkan ${p}.`,
        criteria:'Murid memadankan ketiga-tiga jenis gigi dengan fungsi memotong, mengoyakkan dan melumatkan makanan dengan betul.'
      };
      case 'teeth_structure': return {
        objective:`Pada akhir PdP, murid dapat melabelkan sekurang-kurangnya empat struktur pada keratan rentas gigi berpandukan rajah dalam ${p}.`,
        criteria:'Murid menggunakan istilah pada rajah sumber dan meletakkan sekurang-kurangnya empat label pada bahagian yang betul.'
      };
      case 'unbalanced_food': return {
        objective:`Pada akhir PdP, murid dapat menaakul sekurang-kurangnya dua kesan pengambilan makanan yang tidak seimbang berdasarkan situasi dalam ${p}.`,
        criteria:'Murid mengenal pasti tabiat dalam situasi sumber, menghubungkannya dengan sekurang-kurangnya dua kesan kesihatan dan memberi alasan yang munasabah.'
      };
      case 'digestion_order': return {
        objective:`Pada akhir PdP, murid dapat menyusun aliran makanan semasa pencernaan mengikut urutan mulut, esofagus, perut, usus dan dubur berdasarkan ${p}.`,
        criteria:'Murid menyusun kelima-lima bahagian mengikut urutan yang betul dan menerangkan sekurang-kurangnya satu perubahan yang berlaku sepanjang aliran tersebut.'
      };
      case 'digestion_effects': return {
        objective:`Pada akhir PdP, murid dapat menjelaskan sekurang-kurangnya dua perbuatan dalam situasi ${p} yang boleh mengganggu pencernaan serta kesannya.`,
        criteria:'Murid mengenal pasti sekurang-kurangnya dua perbuatan daripada situasi sumber dan memasangkan setiap perbuatan dengan kesan yang munasabah terhadap pencernaan.'
      };
      case 'animal_diet_classify': return {
        objective:`Pada akhir PdP, murid dapat mengelaskan sekurang-kurangnya enam haiwan kepada herbivor, karnivor atau omnivor berdasarkan tabiat pemakanan pada ${p}.`,
        criteria:'Murid mengelaskan sekurang-kurangnya lima daripada enam haiwan dengan betul berdasarkan jenis makanan yang dimakan.'
      };
      case 'animal_diet_explain': return {
        objective:`Pada akhir PdP, murid dapat menjelaskan tabiat pemakanan herbivor, karnivor dan omnivor dengan sekurang-kurangnya satu contoh haiwan bagi setiap kumpulan berdasarkan ${p}.`,
        criteria:'Murid memberi satu contoh yang tepat bagi setiap kumpulan dan menyatakan bukti makanan yang menyokong pengelasan tersebut.'
      };
      case 'plant_reproduction': return {
        objective:`Pada akhir PdP, murid dapat memadankan sekurang-kurangnya empat contoh tumbuhan dengan cara pembiakannya berdasarkan ${p} dan maklumat DSKP.`,
        criteria:'Murid membezakan sekurang-kurangnya empat cara pembiakan seperti biji benih, spora, keratan batang, daun, anak pokok atau batang bawah tanah dengan contoh yang sesuai.'
      };
      case 'plant_importance': return {
        objective:`Pada akhir PdP, murid dapat menaakul sekurang-kurangnya dua kepentingan pembiakan tumbuh-tumbuhan kepada hidupan berdasarkan dua situasi dalam ${p}.`,
        criteria:'Murid menerangkan sekurang-kurangnya dua kepentingan seperti mengekalkan spesies serta memastikan sumber makanan atau habitat terus tersedia dengan merujuk situasi sumber.'
      };
      default:return null;
    }
  }

  function blueprint(m,btRef){
    const md=mode(m),p=btRef||pageLabel(m),pair=objectivePair(m);
    if(!md||!pair)return null;

    if(md==='science_rules'){
      const common=`${p}; kad situasi bilik sains; kad PATUH/TIDAK PATUH; kad sebab`;
      const support=[
        step('y3-rules-s1','Cari Amalan Selamat','Murid meneliti dua situasi jelas pada halaman sumber seperti membuka pintu/tingkap dan memakai kasut bertutup, kemudian memilih kad PATUH atau TIDAK PATUH.',common,'Guided Observation'),
        step('y3-rules-s2','Padan Sebab','Murid memadankan setiap amalan dengan sebab yang sesuai menggunakan pilihan jawapan bergambar.','kad situasi; kad sebab','Matching'),
        step('y3-rules-s3','Sebut dan Semak','Secara pasangan, murid menyebut satu peraturan dan sebabnya; pasangan menyemak semula pada halaman sumber.',`${p}; kad semak`,'Pair Check')
      ];
      const core=[
        step('y3-rules-c1','Audit Bilik Sains','Kumpulan meneliti beberapa kad situasi sebelum, semasa dan selepas aktiviti bilik sains lalu mengelaskan kepada PATUH atau TIDAK PATUH.',common,'Collaborative Classification'),
        step('y3-rules-c2','Bukti daripada Sumber','Bagi setiap keputusan, kumpulan menunjukkan petunjuk pada halaman sumber atau peraturan yang berkaitan sebelum mendapat mata.','kad situasi; halaman sumber','Evidence Talk'),
        step('y3-rules-c3','Apa Tindakan Saya?','Kumpulan memilih satu situasi yang menyalahi peraturan dan mencadangkan tindakan pembetulan yang sesuai.','kad situasi; kad tindakan','Problem Solving')
      ];
      const challenge=[
        step('y3-rules-h1','Nilai Situasi Baharu','Murid menilai dua situasi baharu yang diberikan guru dan menentukan peraturan yang berkaitan.','kad situasi baharu; senarai peraturan','Decision Making'),
        step('y3-rules-h2','Terangkan Risiko','Murid menerangkan kemungkinan kesan jika peraturan tersebut tidak dipatuhi tanpa mereka kejadian yang tiada dalam situasi.','kad bukti; lembaran alasan','Reasoning'),
        step('y3-rules-h3','Bina Pesanan Keselamatan','Murid menulis satu pesanan ringkas yang menyatakan peraturan, sebab dan tindakan yang betul.','kad mesej; pen marker','Communication')
      ];
      return makeResult(m,p,pair,'Audit peraturan bilik sains + klasifikasi situasi + penaakulan',common,support,core,challenge,'Guru menunjukkan dua kad situasi: membuka pintu/tingkap sebelum aktiviti dan memakai kasut bertutup. Murid menentukan amalan yang perlu dilakukan dan sebabnya.','Pemerhatian klasifikasi + alasan lisan','Keputusan PATUH/TIDAK PATUH, sebab dan tindakan pembetulan.','Murid menyebut satu peraturan bilik sains dan satu sebab mengapa peraturan itu perlu dipatuhi.');
    }

    if(md==='teeth_types'){
      const common=`${p}; rajah gigi kacip, taring dan geraham; kad fungsi MEMOTONG/MENGOYAKKAN/MELUMATKAN; kad makanan bergambar`;
      const support=[
        step('y3-teeth-type-s1','Kenal Tiga Jenis Gigi','Murid menunjuk gigi kacip, taring dan geraham pada rajah sumber dengan bimbingan guru.',common,'Guided Observation'),
        step('y3-teeth-type-s2','Padan Jenis dan Fungsi','Murid memadankan tiga kad jenis gigi dengan kad fungsi berdasarkan halaman sumber.',common,'Matching'),
        step('y3-teeth-type-s3','Semak dengan Gambar Makanan','Murid memilih satu kad makanan dan menentukan jenis gigi yang paling berkaitan dengan tindakan memotong, mengoyakkan atau melumatkan.','kad makanan; kad gigi','Think-Pair-Share')
      ];
      const core=[
        step('y3-teeth-type-c1','Stesen Tiga Gigi','Kumpulan bergerak pada tiga stesen gigi kacip, taring dan geraham lalu mencatat fungsi setiap jenis berdasarkan sumber.',common,'Station Rotation'),
        step('y3-teeth-type-c2','Kad Fungsi Pantas','Guru menunjukkan kad fungsi secara rawak; kumpulan mengangkat kad jenis gigi dan memberikan bukti daripada halaman sumber.','kad jenis gigi; kad fungsi','Game-Based Learning'),
        step('y3-teeth-type-c3','Terangkan Proses Mengunyah','Murid menggunakan ketiga-tiga kad gigi untuk menerangkan bagaimana jenis gigi yang berbeza membantu proses makan.','kad gigi; rajah sumber','Evidence Talk')
      ];
      const challenge=[
        step('y3-teeth-type-h1','Situasi Makanan','Murid menerima dua kad makanan dan menghuraikan tindakan gigi yang berlaku daripada mula hingga makanan dilumatkan.','kad makanan; rajah gigi','Reasoning'),
        step('y3-teeth-type-h2','Banding Fungsi','Murid membandingkan dua jenis gigi dari segi bentuk umum pada rajah dan fungsi yang ditunjukkan sumber.','rajah sumber; jadual banding beza','Compare-Contrast'),
        step('y3-teeth-type-h3','Terangkan dengan Bukti','Murid membentangkan satu contoh hubungan jenis gigi-fungsi-makanan dan menunjukkan rujukan pada sumber.','kad bukti; halaman sumber','Presentation')
      ];
      return makeResult(m,p,pair,'Padanan jenis gigi-fungsi + stesen + penerangan berbukti',common,support,core,challenge,'Guru menunjukkan tiga kad tindakan: memotong, mengoyakkan dan melumatkan. Murid meramal jenis gigi yang melakukan setiap tindakan.','Padanan kad + penerangan lisan','Jenis gigi, fungsi dan contoh tindakan semasa makan.','Murid melengkapkan ayat: gigi kacip untuk memotong, gigi taring untuk mengoyakkan dan gigi geraham untuk melumatkan makanan.');
    }

    if(md==='teeth_structure'){
      const common=`${p}; rajah keratan rentas struktur gigi; kad label menggunakan istilah pada sumber; lembaran rajah tanpa label`;
      const support=[
        step('y3-teeth-structure-s1','Jejak Struktur','Murid meneliti rajah keratan rentas dan mengikuti garisan petunjuk daripada label ke struktur dengan bimbingan guru.',common,'Guided Observation'),
        step('y3-teeth-structure-s2','Padan Label','Murid meletakkan kad label yang diambil terus daripada istilah pada rajah sumber pada lembaran bergambar.','kad label sumber; lembaran rajah','Matching'),
        step('y3-teeth-structure-s3','Semak dengan Sumber','Pasangan menyemak kedudukan label dengan membuka semula halaman buku dan membetulkan kesilapan.','lembaran berlabel; halaman sumber','Pair Check')
      ];
      const core=[
        step('y3-teeth-structure-c1','Label Tanpa Petunjuk','Murid melabel rajah keratan rentas menggunakan kad istilah daripada sumber tanpa nombor bantuan.','rajah tanpa label; kad istilah','Hands-on Labeling'),
        step('y3-teeth-structure-c2','Galeri Struktur Gigi','Kumpulan mempamerkan rajah dan kumpulan lain menandakan satu label tepat serta satu label yang perlu disemak.','hasil kumpulan; nota pelekat','Gallery Walk'),
        step('y3-teeth-structure-c3','Betulkan Berdasarkan Bukti','Kumpulan membuat pembetulan hanya selepas membandingkan hasil dengan rajah Buku Teks.','hasil kumpulan; halaman sumber','Evidence Check')
      ];
      const challenge=[
        step('y3-teeth-structure-h1','Lakar Semula','Murid melakar keratan rentas ringkas berdasarkan rajah sumber dan meletakkan label utama.','kertas lakaran; halaman sumber','Draw-and-Label'),
        step('y3-teeth-structure-h2','Petunjuk Struktur','Murid menghasilkan satu petunjuk deskriptif bagi satu struktur tanpa menyebut namanya; rakan meneka menggunakan rajah.','kad petunjuk; rajah','Quiz-Quiz-Trade'),
        step('y3-teeth-structure-h3','Pertahankan Label','Murid menerangkan mengapa label diletakkan pada bahagian tertentu dengan merujuk kedudukan pada rajah sumber.','rajah berlabel; halaman sumber','Evidence Talk')
      ];
      return makeResult(m,p,pair,'Pelabelan rajah sumber + semakan rakan + lakaran',common,support,core,challenge,'Guru menunjukkan gambar sebatang gigi dan bertanya: “Jika gigi dibuat keratan rentas, apakah bahagian yang boleh kita lihat di dalamnya?”','Semakan rajah berlabel + penerangan','Rajah keratan rentas dengan sekurang-kurangnya empat label tepat.','Murid menunjuk satu label pada rajah dan menyebut nama struktur tersebut berdasarkan sumber.');
    }

    if(md==='unbalanced_food'){
      const common=`${p}; kad situasi makanan daripada halaman sumber; kad TABIAT/KESAN; Piramid Makanan Malaysia sebagai rujukan`;
      const support=[
        step('y3-food-s1','Baca Situasi','Murid meneliti dua situasi pada halaman sumber dan mengenal pasti tabiat pemakanan yang ditunjukkan.',common,'Guided Observation'),
        step('y3-food-s2','Padan Tabiat dan Kesan','Murid memadankan kad tabiat dengan kad kesan yang ditunjukkan oleh situasi sumber.','kad tabiat; kad kesan','Matching'),
        step('y3-food-s3','Pilih Cadangan Lebih Seimbang','Murid memilih satu perubahan mudah pada pilihan makanan dengan merujuk Piramid Makanan Malaysia.','Piramid Makanan Malaysia; kad pilihan','Decision Making')
      ];
      const core=[
        step('y3-food-c1','Detektif Tabiat Makan','Kumpulan mengenal pasti tabiat, kesan dan petunjuk visual bagi setiap situasi pada halaman sumber.','halaman sumber; jadual tabiat-kesan-bukti','Evidence Hunt'),
        step('y3-food-c2','Rantaian Sebab-Kesan','Murid menyusun kad Tabiat → Kesan → Cadangan supaya hubungan setiap situasi dapat diterangkan secara logik.','kad sebab-kesan-cadangan','Cause-and-Effect'),
        step('y3-food-c3','Semak dengan Piramid','Kumpulan membandingkan cadangan mereka dengan prinsip pemilihan makanan seimbang berdasarkan Piramid Makanan Malaysia.','Piramid Makanan Malaysia; hasil kumpulan','Peer Review')
      ];
      const challenge=[
        step('y3-food-h1','Analisis Situasi Baharu','Murid menganalisis satu situasi pemakanan baharu yang diberi guru dan mengenal pasti kemungkinan ketidakseimbangan.','kad situasi baharu; piramid makanan','Case Analysis'),
        step('y3-food-h2','Berikan Justifikasi','Murid memberi alasan mengapa perubahan tertentu menjadikan pilihan makanan lebih seimbang tanpa membuat dakwaan perubatan di luar sumber.','lembaran alasan; piramid makanan','Reasoning'),
        step('y3-food-h3','Bina Cadangan Menu','Murid menyusun satu cadangan hidangan ringkas yang lebih seimbang menggunakan kategori dalam Piramid Makanan Malaysia.','kad makanan bergambar; piramid makanan','Problem Solving')
      ];
      return makeResult(m,p,pair,'Analisis situasi + sebab-kesan + rujukan Piramid Makanan Malaysia',common,support,core,challenge,'Guru menunjukkan dua pilihan makanan berbeza dan meminta murid memilih yang lebih seimbang serta memberi satu alasan.','Analisis situasi + jadual sebab-kesan','Tabiat, kesan, bukti sumber dan cadangan yang lebih seimbang.','Murid menyatakan satu tabiat pemakanan yang perlu dielakkan dan satu pilihan yang lebih seimbang berdasarkan sumber.');
    }

    if(md==='digestion_order'){
      const common=`${p}; kad MULUT/ESOFAGUS/PERUT/USUS/DUBUR; rajah aliran makanan; anak panah urutan`;
      const support=[
        step('y3-digest-order-s1','Kenal Lima Bahagian','Murid menunjuk lima bahagian pada rajah sumber sambil menyebut nama bahagian bersama guru.',common,'Guided Observation'),
        step('y3-digest-order-s2','Susun Kad Aliran','Murid menyusun kad mulut, esofagus, perut, usus dan dubur dengan bantuan anak panah.','kad urutan; anak panah','Sequencing'),
        step('y3-digest-order-s3','Semak dengan Lagu/Rajah','Murid menyemak urutan menggunakan rajah dan teks/lagu proses pencernaan pada halaman sumber.','halaman sumber; urutan murid','Self Check')
      ];
      const core=[
        step('y3-digest-order-c1','Laluan Makanan','Kumpulan menyusun lima stesen mengikut laluan makanan dan meletakkan anak panah arah pergerakan.','kad stesen; anak panah; halaman sumber','Station Sequencing'),
        step('y3-digest-order-c2','Relay Urutan','Setiap ahli mengambil satu kad bahagian dan perlu berdiri dalam urutan yang betul; mata diberi apabila kumpulan boleh menerangkan urutan tersebut.','kad bahagian badan','Game-Based Learning'),
        step('y3-digest-order-c3','Bukti daripada Rajah','Kumpulan membandingkan urutan mereka dengan rajah Buku Teks lalu membetulkan kedudukan yang tidak tepat.','rajah sumber; kad urutan','Evidence Check')
      ];
      const challenge=[
        step('y3-digest-order-h1','Urutan Tanpa Kad Nama','Murid menyusun gambar bahagian tanpa label kemudian menambah label selepas urutan siap.','gambar tanpa label; kad label','Problem Solving'),
        step('y3-digest-order-h2','Terangkan Perjalanan','Murid menerangkan perjalanan satu cebisan makanan dari mulut hingga keluar melalui dubur berdasarkan urutan sumber.','rajah aliran; kad penanda','Story Sequence'),
        step('y3-digest-order-h3','Bina Rajah Alir','Murid menghasilkan rajah alir lima bahagian lengkap dengan anak panah dan satu ayat penerangan.','kertas A4; pen marker','Graphic Organizer')
      ];
      return makeResult(m,p,pair,'Urutan aliran makanan + relay + rajah alir',common,support,core,challenge,'Guru menunjukkan lima kad bahagian pencernaan secara bercampur. Murid meramal bahagian pertama dan terakhir dalam laluan makanan.','Semakan urutan + penerangan lisan','Urutan lima bahagian dan rajah alir murid.','Murid menyebut semula urutan: mulut → esofagus → perut → usus → dubur.');
    }

    if(md==='digestion_effects'){
      const common=`${p}; kad situasi daripada halaman sumber; jadual PERBUATAN/KESAN; kad cadangan amalan`;
      const support=[
        step('y3-digest-effects-s1','Cari Perbuatan','Murid meneliti situasi pada halaman sumber dan menandakan perbuatan yang berkaitan dengan proses makan/pencernaan.',common,'Guided Observation'),
        step('y3-digest-effects-s2','Padan dengan Kesan','Murid memilih kesan yang munasabah daripada kad pilihan dan memasangkannya dengan perbuatan yang dikenal pasti.','kad perbuatan; kad kesan','Matching'),
        step('y3-digest-effects-s3','Pilih Tindakan Lebih Baik','Murid memilih satu tindakan alternatif yang lebih sesuai bagi setiap situasi.','kad tindakan','Decision Making')
      ];
      const core=[
        step('y3-digest-effects-c1','Bukti pada Situasi','Kumpulan menulis sekurang-kurangnya dua pasangan Perbuatan → Kesan berdasarkan apa yang benar-benar ditunjukkan pada halaman sumber.','jadual perbuatan-kesan; halaman sumber','Evidence Hunt'),
        step('y3-digest-effects-c2','Rantaian Sebab dan Kesan','Murid menyusun kad perbuatan, kesan dan tindakan pembetulan dalam urutan logik.','kad sebab-kesan-tindakan','Cause-and-Effect'),
        step('y3-digest-effects-c3','Semak Rakan','Pasangan lain menyemak sama ada setiap kesan benar-benar berkaitan dengan perbuatan yang dipilih.','hasil kumpulan; kad semak','Peer Check')
      ];
      const challenge=[
        step('y3-digest-effects-h1','Kes Baharu','Murid menilai satu situasi baharu yang berkaitan dengan tabiat makan dan menerangkan kesannya terhadap proses pencernaan berdasarkan pengetahuan sesi.','kad kes baharu','Case Analysis'),
        step('y3-digest-effects-h2','Justifikasi Cadangan','Murid mencadangkan tindakan lebih baik dan memberi alasan yang berkaitan dengan proses pencernaan.','lembaran alasan','Reasoning'),
        step('y3-digest-effects-h3','Poster Dua Mesej','Murid menghasilkan poster mini dua mesej: elakkan satu perbuatan dan amalkan satu tindakan yang lebih sesuai.','kertas A5; pen marker','Communication')
      ];
      return makeResult(m,p,pair,'Analisis situasi pencernaan + sebab-kesan + tindakan pembetulan',common,support,core,challenge,'Guru menunjukkan satu situasi makan daripada halaman sumber dan bertanya: “Apakah perbuatan yang kamu nampak, dan apakah kesannya?”','Jadual perbuatan-kesan + penerangan','Dua perbuatan, dua kesan dan cadangan tindakan yang disokong sumber.','Murid menyatakan satu perbuatan yang boleh mengganggu pencernaan dan satu tindakan yang lebih sesuai.');
    }

    if(md==='animal_diet_classify'||md==='animal_diet_explain'){
      const explain=md==='animal_diet_explain';
      const common=`${p}; kad arnab, harimau dan ayam daripada contoh sumber; kad haiwan tambahan; kad HERBIVOR/KARNIVOR/OMNIVOR; kad makanan`;
      const support=[
        step('y3-animal-diet-s1','Tiga Contoh Utama','Murid memadankan arnab, harimau dan ayam dengan makanan yang ditunjukkan dalam sumber.',common,'Guided Matching'),
        step('y3-animal-diet-s2','Masuk Kumpulan','Murid meletakkan tiga haiwan pada ruang herbivor, karnivor atau omnivor dengan bimbingan guru.','kad haiwan; tiga ruang kategori','Classification'),
        step('y3-animal-diet-s3',explain?'Lengkapkan Sebab':'Semak Berdasarkan Makanan',explain?'Murid melengkapkan ayat “___ ialah ___ kerana makan ___.” menggunakan kad pilihan.':'Murid menunjukkan kad makanan sebagai bukti bagi setiap pengelasan.','kad rangka ayat; kad makanan','Pair Check')
      ];
      const core=[
        step('y3-animal-diet-c1','Safari Pemakanan','Kumpulan mengelaskan enam kad haiwan kepada herbivor, karnivor dan omnivor berdasarkan makanan yang dimakan.','enam kad haiwan; tiga label kategori','Collaborative Classification'),
        step('y3-animal-diet-c2','Bukti Sebelum Mata','Setiap pengelasan hanya mendapat mata apabila kumpulan menunjukkan bukti jenis makanan haiwan tersebut.','kad makanan; kad bukti','Game-Based Learning'),
        step('y3-animal-diet-c3',explain?'Terangkan Tiga Kumpulan':'Semak dan Betulkan',explain?'Kumpulan menerangkan maksud tiga kumpulan menggunakan sekurang-kurangnya satu contoh bagi setiap kumpulan.':'Kumpulan menyemak keputusan dengan contoh arnab, harimau dan ayam pada halaman sumber.','halaman sumber; hasil kumpulan','Evidence Talk')
      ];
      const challenge=[
        step('y3-animal-diet-h1','Haiwan Misteri','Murid menerima maklumat makanan bagi haiwan tanpa nama dan membuat inferens kumpulan pemakanannya.','kad makanan haiwan misteri','Inference'),
        step('y3-animal-diet-h2','Pertahankan Pengelasan','Murid memberi alasan mengapa haiwan tertentu tidak sesuai diletakkan dalam dua kumpulan yang lain.','kad haiwan; jadual alasan','Reasoning'),
        step('y3-animal-diet-h3','Bina Kad Contoh Baharu','Murid menghasilkan satu kad haiwan lain dengan gambar/nama, makanan dan kategori yang tepat.','kad kosong; sumber rujukan guru','Create-and-Explain')
      ];
      return makeResult(m,p,pair,'Pengelasan tabiat pemakanan + bukti makanan + inferens',common,support,core,challenge,'Guru menunjukkan kad arnab, harimau dan ayam. Murid meramal perbezaan makanan ketiga-tiga haiwan.','Pengelasan kad + alasan lisan','Kategori haiwan dan bukti makanan bagi setiap pengelasan.','Murid memberi satu contoh herbivor, karnivor dan omnivor serta menyatakan makanan yang menjadi bukti.');
    }

    if(md==='plant_reproduction'){
      const common=`${p}; kad cara pembiakan BIJI BENIH/SPORA/KERATAN BATANG/DAUN/ANAK POKOK/BATANG BAWAH TANAH; gambar contoh tumbuhan daripada sumber atau bahan guru`;
      const support=[
        step('y3-plant-repro-s1','Kenal Cara Pembiakan','Murid meneliti gambar pada halaman sumber dan memadankan contoh dengan kad cara pembiakan yang disediakan guru.',common,'Guided Matching'),
        step('y3-plant-repro-s2','Dua Cara Dahulu','Murid membandingkan dua contoh jelas dan menerangkan perbezaan bahagian tumbuhan yang menghasilkan pokok baharu.','dua kad contoh; halaman sumber','Compare-Contrast'),
        step('y3-plant-repro-s3','Semak dengan Senarai DSKP','Murid menyemak nama cara pembiakan dengan senarai yang dipaparkan guru.','senarai cara pembiakan; kad contoh','Self Check')
      ];
      const core=[
        step('y3-plant-repro-c1','Stesen Pembiakan','Kumpulan bergerak antara stesen gambar tumbuhan dan memadankan contoh kepada cara pembiakan yang sesuai.','kad gambar; kad kaedah; stesen','Station Rotation'),
        step('y3-plant-repro-c2','Padan Cepat Berbukti','Kumpulan memadankan kad tumbuhan dan kad cara pembiakan; mata diberi apabila alasan merujuk bahagian tumbuhan yang berkaitan.','kad tumbuhan; kad kaedah','Game-Based Learning'),
        step('y3-plant-repro-c3','Peta Cara Pembiakan','Kumpulan menghasilkan peta ringkas yang menghubungkan sekurang-kurangnya empat cara dengan contoh tumbuhan.','kertas mahjong/A3; kad contoh','Graphic Organizer')
      ];
      const challenge=[
        step('y3-plant-repro-h1','Satu Tumbuhan Banyak Cara','Murid meneliti maklumat tambahan guru untuk mengenal pasti tumbuhan yang boleh membiak melalui lebih daripada satu cara tanpa mengubah SP utama sesi.','kad maklumat guru; DSKP','Reasoning'),
        step('y3-plant-repro-h2','Bukti Bahagian Tumbuhan','Murid menerangkan bahagian tumbuhan yang terlibat bagi setiap kaedah yang dipilih.','kad bahagian tumbuhan; hasil peta','Evidence Talk'),
        step('y3-plant-repro-h3','Bina Kad Kuiz','Murid menghasilkan satu kad soalan contoh tumbuhan → cara pembiakan untuk dijawab oleh rakan.','kad kosong; sumber rujukan','Quiz-Quiz-Trade')
      ];
      return makeResult(m,p,pair,'Padanan contoh tumbuhan-cara pembiakan + stesen + peta konsep',common,support,core,challenge,'Guru menunjukkan dua gambar tumbuhan baharu yang muncul dengan cara berbeza. Murid meramal bahagian tumbuhan yang terlibat dalam pembiakan.','Padanan contoh + peta konsep + penerangan','Sekurang-kurangnya empat contoh tumbuhan dipadankan dengan cara pembiakan yang sesuai.','Murid memilih satu tumbuhan dan menyatakan cara pembiakannya berdasarkan sumber.');
    }

    if(md==='plant_importance'){
      const common=`${p}; dua situasi pada halaman sumber; kad MAKANAN/HABITAT/KEKALKAN SPESIES; jadual situasi-bukti-kepentingan`;
      const support=[
        step('y3-plant-important-s1','Baca Dua Situasi','Murid meneliti dua situasi pada halaman sumber tentang tumbuhan yang terus tumbuh semula dan mengenal pasti benda hidup yang mendapat manfaat.',common,'Guided Observation'),
        step('y3-plant-important-s2','Padan Kepentingan','Murid memadankan situasi dengan kad kepentingan seperti sumber makanan, habitat atau mengekalkan spesies.','kad situasi; kad kepentingan','Matching'),
        step('y3-plant-important-s3','Lengkapkan Sebab','Murid melengkapkan ayat “Pembiakan tumbuhan penting kerana ___.” dengan satu bukti daripada situasi.','rangka ayat; halaman sumber','Pair Check')
      ];
      const core=[
        step('y3-plant-important-c1','Situasi → Bukti → Kepentingan','Kumpulan melengkapkan jadual tiga lajur menggunakan dua situasi pada halaman sumber.','jadual tiga lajur; halaman sumber','Evidence Organizer'),
        step('y3-plant-important-c2','Rantai Hidupan','Kumpulan menghubungkan pembiakan tumbuhan kepada kesinambungan tumbuhan, sumber makanan dan tempat perlindungan menggunakan kad hubungan.','kad hubungan; kad hidupan','Concept Mapping'),
        step('y3-plant-important-c3','Pilih Alasan Terkuat','Setiap kumpulan memilih dua alasan paling kukuh dan membentangkan bukti daripada situasi sumber.','hasil kumpulan; halaman sumber','Evidence Talk')
      ];
      const challenge=[
        step('y3-plant-important-h1','Jika Tumbuhan Tidak Membiak','Murid meramal satu kesan kepada hidupan jika tumbuhan tertentu tidak dapat membiak, kemudian mengaitkan jawapan dengan situasi sumber.','kad senario; lembaran alasan','Prediction'),
        step('y3-plant-important-h2','Hubung Kait Ekosistem Ringkas','Murid membina rantaian mudah tumbuhan → makanan/habitat → hidupan untuk menunjukkan kepentingan pembiakan.','kad tumbuhan; kad haiwan; anak panah','Systems Thinking'),
        step('y3-plant-important-h3','Pesanan Pemuliharaan','Murid menghasilkan satu mesej ringkas yang menerangkan mengapa pembiakan tumbuhan penting kepada hidupan.','kad mesej; pen marker','Communication')
      ];
      return makeResult(m,p,pair,'Analisis dua situasi + peta hubungan + penaakulan kepentingan',common,support,core,challenge,'Guru menunjukkan dua gambar: kawasan dengan tumbuhan yang terus tumbuh dan kawasan habitat yang berkurang. Murid menyatakan siapa yang bergantung pada tumbuhan.','Jadual situasi-bukti-kepentingan + penerangan','Dua kepentingan pembiakan tumbuhan dengan bukti daripada situasi sumber.','Murid menyebut dua sebab pembiakan tumbuhan penting kepada hidupan.');
    }

    return null;
  }

  function makeResult(m,p,pair,method,common,support,core,challenge,induction,pbdMethod,pbdEvidence,closure){
    return {
      method,
      pakDetail:'Isi aktiviti datang daripada tugasan Buku Teks dan tuntutan SP/DSKP; variasi PAK-21 hanya digunakan untuk cara murid melaksanakan tugasan sebenar.',
      anchor:`Laksanakan tugasan sebenar pada ${p} selaras dengan SP ${mainSp(m)}.`,
      kind:'source_blueprint',
      bbmList:[p,...common.split(';').map(x=>x.trim()).filter(Boolean).slice(1)],
      groupBbm:{support:common,core:common,challenge:common},
      mainSp:mainSp(m),page:p,topic:m.title||'Sains Tahun 3',
      setInduksi:induction,
      inductionData:{name:'Cetusan Sumber',text:induction,bbm:p,pak21:'Think-Pair-Share'},
      librarySteps:{support,core,challenge},
      diffSupport:'Tugasan sumber yang sama dengan sokongan visual, pilihan jawapan dan bilangan item lebih kecil.',
      diffCore:'Tugasan sumber penuh dengan bukti, rekod atau penerangan yang boleh diperhatikan.',
      diffChallenge:'Tugasan sumber yang sama diperluas dengan penaakulan, inferens atau komunikasi berbukti tanpa menukar SP.',
      diffSupportAct:support.map(x=>x.text).join(' '),
      diffCoreAct:core.map(x=>x.text).join(' '),
      diffChallengeAct:challenge.map(x=>x.text).join(' '),
      pbdEvidence:{method:pbdMethod,evidence:pbdEvidence,criterion:pair.criteria},
      penutup:closure,
      _runtime_science_year3_blueprint:mode(m)
    };
  }

  const previousEffective=window.effectiveRphLessonMap;
  if(typeof previousEffective==='function')window.effectiveRphLessonMap=function(m,ev,built){
    const out=previousEffective(m,ev,built)||m;
    if(!mode(out))return out;
    const pair=objectivePair(out);
    return {...out,objective:pair.objective,success_criteria:pair.criteria,_runtime_science_source_blueprint:`year3_${mode(out)}`};
  };

  const previousPedagogy=window.buildSourceAwarePedagogy;
  if(typeof previousPedagogy==='function')window.buildSourceAwarePedagogy=function(m,activities,btRef,uiEn,classId=null){
    const base=previousPedagogy(m,activities,btRef,uiEn,classId);
    if(uiEn)return base;
    const bp=blueprint(m,btRef);
    return bp?{...base,...bp}:base;
  };

  window.__RPH_SCIENCE_YEAR3_SOURCE_BLUEPRINT__={
    version:'2026-09-04a',
    modes:['science_rules','teeth_types','teeth_structure','unbalanced_food','digestion_order','digestion_effects','animal_diet_classify','animal_diet_explain','plant_reproduction','plant_importance']
  };
  console.info('RPH Science Year 3 source-first blueprints active.');
})();