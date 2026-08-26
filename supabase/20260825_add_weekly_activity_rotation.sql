-- Compact 42-week activity rotation for source-first RPH generation.
-- The rotation is a delivery wrapper only.  RPT, DSKP, textbook evidence and
-- a verified Lesson Map remain mandatory before any activity can be used.

alter table public.rph_subject_pedagogy
  add column if not exists weekly_activity_rotation jsonb
  not null default '{}'::jsonb;

comment on column public.rph_subject_pedagogy.weekly_activity_rotation is
  'Compact 42-slot games/PAK21/BBM rotation. Never replaces Lesson Map source activities.';

with rotation as (
  select jsonb_build_object(
    'version', 1,
    'source_first', true,
    'slot_count', 42,
    'weeks', (
      select jsonb_agg(
        jsonb_build_object(
          'slot', n,
          'move', moves[n],
          'name_ms', names_ms[n],
          'name_en', names_en[n],
          'pak21', pak21[n]
        ) order by n
      )
      from generate_series(1, 42) as g(n)
    ),
    'year_profiles', jsonb_build_object(
      '1', jsonb_build_object(
        'response_count', 2,
        'support_move_ms', 'Guru memodelkan satu contoh; murid menggunakan gambar, objek atau kad petunjuk sebelum memberi dua respons.',
        'support_move_en', 'The teacher models one example; pupils use pictures, objects or cue cards before giving two responses.'
      ),
      '2', jsonb_build_object(
        'response_count', 3,
        'support_move_ms', 'Murid bekerja berpasangan dengan pembahagian peranan dan merekod sekurang-kurangnya tiga respons daripada sumber.',
        'support_move_en', 'Pupils work in pairs with assigned roles and record at least three responses from the source.'
      ),
      '3', jsonb_build_object(
        'response_count', 4,
        'support_move_ms', 'Murid melaksanakan tugasan dengan lebih kendiri, memilih empat bukti dan memberikan sebab atau inferens yang disokong sumber.',
        'support_move_en', 'Pupils work more independently, select four pieces of evidence and give a source-supported reason or inference.'
      )
    )
  ) as profile
  from (
    select
      array[
        'clue_hunt','quick_match','evidence_hunt','think_pair_share','card_sort','mini_whiteboard','station_rotation',
        'quiz_quiz_trade','domino_chain','mystery_box','hot_seat','gallery_walk','role_play','source_bingo',
        'answer_relay','four_corners','sequence_race','spot_the_error','memory_match','question_wheel','jigsaw',
        'information_gap','true_false_fix','odd_one_out','concept_map','mini_debate','peer_coach','source_board_game',
        'treasure_trail','source_puzzle','draw_and_label','data_detective','model_demo','pass_the_message','source_charades',
        'find_someone_who','exit_ticket_swap','one_minute_challenge','traffic_light_check','teach_back','escape_cards','source_showcase'
      ]::text[] as moves,
      array[
        'Jejak Petunjuk','Padanan Pantas','Jejak Bukti','Fikir-Pasang-Kongsi','Susun Kad','Papan Mini Serentak','Stesen Sumber',
        'Kuiz-Tukar-Kad','Rantaian Domino','Kotak Misteri','Kerusi Pakar','Galeri Bukti','Lakon dan Respons','Bingo Sumber',
        'Lari Berganti Jawapan','Empat Penjuru','Perlumbaan Urutan','Kesan dan Baiki','Padanan Ingatan','Roda Soalan','Jigsaw Sumber',
        'Jurang Maklumat','Betul-Salah dan Baiki','Yang Mana Berbeza','Peta Konsep','Debat Mini Berbukti','Rakan Pembimbing','Papan Permainan Sumber',
        'Jejak Harta Karun','Puzzle Sumber','Lukis dan Label','Detektif Data','Demonstrasi Model','Sampaikan Tepat','Lakonan Senyap Sumber',
        'Cari Rakan yang Tahu','Tukar Tiket Keluar','Cabaran Satu Minit','Semakan Lampu Isyarat','Ajar Semula','Kad Lepas Kunci','Pameran Hasil Sumber'
      ]::text[] as names_ms,
      array[
        'Clue Hunt','Quick Match','Evidence Hunt','Think-Pair-Share','Card Sort','Show Me Boards','Source Stations',
        'Quiz-Quiz-Trade','Domino Chain','Mystery Box','Hot Seat','Evidence Gallery','Role-play and Respond','Source Bingo',
        'Answer Relay','Four Corners','Sequence Race','Spot and Fix','Memory Match','Question Wheel','Source Jigsaw',
        'Information Gap','True-False and Fix','Odd One Out','Concept Map','Evidence Mini Debate','Peer Coach','Source Board Game',
        'Treasure Trail','Source Puzzle','Draw and Label','Data Detective','Model Demonstration','Pass It Accurately','Source Charades',
        'Find Someone Who','Exit Ticket Swap','One-minute Challenge','Traffic-light Check','Teach Back','Unlock the Cards','Source Showcase'
      ]::text[] as names_en,
      array[
        'Think-Pair-Share','Pair Check','Evidence Hunt','Think-Pair-Share','Cooperative Learning','Show Me','Learning Stations',
        'Quiz-Quiz-Trade','Round Robin','Team Challenge','Hot Seat','Gallery Walk','Role Play','Bingo',
        'Team Relay','Four Corners','Team Challenge','Pair Check','Matching Game','Random Picker','Jigsaw',
        'Information Gap','Think-Pair-Share','Round Robin','Mind Mapping','Mini Debate','Peer Coaching','Board Game',
        'Team Challenge','Cooperative Learning','Show Me','Evidence Hunt','Presentation','Round Robin','Charades',
        'Find Someone Who','Exit Ticket','Timed Challenge','Traffic Light','Peer Teaching','Escape Cards','Gallery Walk'
      ]::text[] as pak21
  ) seed
)
insert into public.rph_subject_pedagogy (
  subject_key, subject_name, language_code, direction, pedagogy_notes,
  preferred_methods, preferred_bbm, active, weekly_activity_rotation
)
select
  v.subject_key,
  v.subject_name,
  v.language_code,
  'ltr',
  v.pedagogy_notes,
  v.preferred_methods,
  v.preferred_bbm,
  true,
  rotation.profile || jsonb_build_object('subject_key', v.subject_key)
from rotation
cross join (
  values
    (
      'bm', 'Bahasa Melayu', 'ms',
      'Aktiviti mingguan membungkus tugasan sebenar Buku Teks. Fokus pada bahasa lisan, bacaan, penulisan, tatabahasa dan seni bahasa mengikut SK/SP.',
      array['Think-Pair-Share','Role Play','Hot Seat','Cari Pasangan','Kotak Misteri','Gallery Walk','Pair Check']::text[],
      array['Buku Teks','Buku Aktiviti jika disahkan','kad perkataan','kad gambar','rangka ayat','papan mini','bahan maujud']::text[]
    ),
    (
      'en', 'English', 'en',
      'Weekly activities wrap the verified Student''s Book task. Listening, speaking, reading, writing, grammar and language arts remain tied to the Learning Standards.',
      array['Think-Pair-Share','Role Play','Information Gap','Quiz-Quiz-Trade','Hot Seat','Gallery Walk','Pair Check']::text[],
      array['Student''s Book','Workbook when verified','word cards','picture cards','sentence frames','mini whiteboards','realia']::text[]
    ),
    (
      'science', 'Sains', 'ms',
      'Aktiviti mingguan membungkus pemerhatian, pengelasan, pengukuran, penyiasatan, rekod data dan komunikasi daripada tugasan Buku Teks yang disahkan.',
      array['Think-Pair-Share','Pair Check','Evidence Hunt','Round Robin','Gallery Walk','Quiz-Quiz-Trade','Learning Stations']::text[],
      array['Buku Teks','bahan sebenar tugasan','objek maujud','kad bukti','jadual pemerhatian','alat dan bahan sains','papan mini']::text[]
    )
) as v(subject_key, subject_name, language_code, pedagogy_notes, preferred_methods, preferred_bbm)
on conflict (subject_key) do update set
  subject_name = excluded.subject_name,
  language_code = excluded.language_code,
  pedagogy_notes = excluded.pedagogy_notes,
  preferred_methods = excluded.preferred_methods,
  preferred_bbm = excluded.preferred_bbm,
  weekly_activity_rotation = excluded.weekly_activity_rotation,
  active = true;

