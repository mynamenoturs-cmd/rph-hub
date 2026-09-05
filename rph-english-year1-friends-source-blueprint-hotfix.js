(function(){
'use strict';

const subjectKey=m=>{try{return window.rphSubjectKey?.(m?.subject_id)||''}catch{return''}};
const mainLs=m=>String(m?.source_evidence?.meta?.main_ls||m?.source_evidence?.meta?.main_sp||m?.learning_standard||m?.ls||String(m?.sp||'').split(',')[0]||'').trim();
const year=m=>Number(m?.year||0)||0;
const week=m=>Number(m?.week_no||m?.week||0)||0;
const session=m=>Number(m?.session_no||m?.session||0)||0;
const page=m=>Number(m?.textbook_page_start||0)||0;
const routeKey=m=>`${mainLs(m)}@${page(m)}|W${week(m)}|S${session(m)}`;
const step=(key,name,text,bbm,pak21)=>({key,name,text,bbm,pak21,phase:'source'});

const ROUTES={
  '1.2.2@4|W5|S1':'w5s1','2.1.1@4|W5|S2':'w5s2','3.1.1@4|W5|S3':'w5s3','4.1.2@4|W5|S4':'w5s4','5.1.1@5|W5|S5':'w5s5',
  '1.2.3@5|W6|S1':'w6s1','2.1.4@5|W6|S2':'w6s2','3.1.2@6|W6|S3':'w6s3','4.2.1@6|W6|S4':'w6s4','5.1.2@6|W6|S5':'w6s5',
  '1.2.4@7|W8|S1':'w8s1','2.1.5@7|W8|S2':'w8s2','3.1.3@7|W8|S3':'w8s3','4.3.1@7|W8|S4':'w8s4','5.1.1@8|W8|S5':'w8s5',
  '1.2.5@8|W9|S1':'w9s1','2.3.1@8|W9|S2':'w9s2','3.2.2@9|W9|S3':'w9s3','4.1.2@9|W9|S4':'w9s4','5.1.2@9|W9|S5':'w9s5'
};

const CONDITIONAL=new Set(['3.2.2@9|W9|S3','4.1.2@9|W9|S4','5.1.2@9|W9|S5']);
const ALIGNMENT_REVIEW=new Set([
  '3.1.1@4|W5|S3','4.1.2@4|W5|S4','5.1.1@5|W5|S5',
  '1.2.3@5|W6|S1','2.1.4@5|W6|S2','4.2.1@6|W6|S4',
  '3.1.3@7|W8|S3','4.3.1@7|W8|S4','5.1.1@8|W8|S5',
  '2.3.1@8|W9|S2','4.1.2@9|W9|S4','5.1.2@9|W9|S5'
]);
const REVIEW_NOTE='The LS/page pairing needs teacher review. The runtime blueprint preserves the actual Student’s Book task and does not fabricate a different activity to force LS alignment.';

const PAGE_TASKS={
  4:{title:'Friends — Greetings',task:'Listen and look at the Super Friends, listen and say their names, then listen to and perform the greeting chant.',induction:'Show the four Super Friends on Student’s Book p. 4 and ask pupils to point to a character they recognise.',support:'Point to each character, listen and repeat the names and greeting phrases in short chunks.',core:'Complete the source listen-and-look, name-repetition and greeting-chant tasks.',challenge:'Introduce two characters and perform the greeting exchange with clear pronunciation.',closure:'Say one greeting and one character name from the page.',pak21:'Listen-Pair-Repeat'},
  5:{title:'Friends — Numbers and Age',task:'Listen and point to numbers 1–10, listen and write the Super Friends’ ages, then ask and answer name and age questions.',induction:'Show the numbered shirts on Student’s Book p. 5 and ask pupils to count from one to ten.',support:'Point to the numbers while listening and use the printed question-answer frames for name and age.',core:'Complete the source number listening, age listening/writing and ask-and-answer tasks.',challenge:'Complete three accurate name-and-age exchanges without reading the full model.',closure:'Answer “How old are you?” using a complete short response.',pak21:'Pair Interview'},
  6:{title:'Friends — Alphabet Song',task:'Listen and sing the alphabet song, then say the alphabet using the printed letter sequence.',induction:'Show several large letters on Student’s Book p. 6 and ask pupils to name any letters they know.',support:'Track each printed letter with a finger while listening and sing in short alphabet chunks.',core:'Complete the source alphabet song and alphabet-speaking task.',challenge:'Say the alphabet independently and identify selected beginning sounds from familiar names.',closure:'Say a short alphabet sequence selected by the teacher.',pak21:'Sing-and-Point'},
  7:{title:'Friends — Colours',task:'Listen and point to colour balloons, then listen and colour the hats, follow the lines and say the matching names.',induction:'Show the six colour balloons on Student’s Book p. 7 and ask pupils to name two colours.',support:'Point to each colour balloon and use teacher modelling before completing one hat at a time.',core:'Complete the source colour listening, colouring, line-following and speaking tasks.',challenge:'Describe four coloured hats or matched pictures using accurate colour words.',closure:'Name three colours from the page.',pak21:'Listen-Do-Check'},
  8:{title:'Meet the Super Friends — Story',task:'Listen to and follow the first six panels of the picture story, identifying characters, actions and the cat Tabby.',induction:'Show the first story panel on Student’s Book p. 8 and ask pupils what the characters are doing.',support:'Follow the numbered panels and point to each speaker while listening.',core:'Listen to and follow the source story, identifying key characters and what happens in the six panels.',challenge:'Retell three story events in sequence using the pictures.',closure:'State one character and one event from the story.',pak21:'Think-Pair-Share'},
  9:{title:'Meet the Super Friends — Story Check',task:'Follow the final story panels, then read the five short lines and number the pictures to show who says each line.',induction:'Show the final story panels on Student’s Book p. 9 and ask pupils what they notice about Tabby.',support:'Read one short line at a time and use the character pictures as clues before numbering.',core:'Complete the source listening/reading story-check task by matching the five lines to the correct pictures.',challenge:'Explain the evidence for three matches using the story panels.',closure:'Read one matched line and name the speaker.',pak21:'Pair Check'}
};

const OUTCOMES={
  w5s1:{o:'identify at least three specific details from the source greetings page while listening with support',c:'Pupils correctly identify at least three characters or greeting details from Student’s Book p. 4.'},
  w5s2:{o:'give very basic personal information in at least two supported greeting exchanges using fixed phrases',c:'Pupils complete at least two short name exchanges using the source greeting model.'},
  w5s3:{o:'identify at least four letters from familiar names while completing the source greetings task',c:'Pupils identify at least four target letters; the Reading LS/page pairing remains under review.'},
  w5s4:{o:'copy at least four familiar source words or short phrases legibly with teacher support',c:'Pupils copy at least four source words or phrases; the source page itself contains no writing task, so LS/page alignment remains under review.'},
  w5s5:{o:'respond appropriately to at least three source prompts while revising numbers and age language',c:'Pupils respond to at least three source prompts; the Language Arts LS/page pairing for Student’s Book p. 5 remains under review.'},
  w6s1:{o:'identify at least three details from the source number-and-age listening task',c:'Pupils identify at least three correct details; the narrative LS/page pairing for Student’s Book p. 5 remains under review.'},
  w6s2:{o:'use at least two suitable fixed phrases in a supported source-based exchange',c:'Pupils complete at least two understandable fixed-phrase exchanges; the greet/thanks LS/page pairing remains under review.'},
  w6s3:{o:'recognise and sound out at least six selected letters or familiar beginning sounds with support',c:'Pupils accurately identify or sound out at least six selected letters while using Student’s Book p. 6.'},
  w6s4:{o:'record at least three pieces of very basic personal information in a supported format',c:'Pupils record at least three short personal-information items; the source page is an alphabet song, so LS/page alignment remains under review.'},
  w6s5:{o:'sing or say the alphabet text with intelligible pronunciation and rhythm',c:'Pupils participate intelligibly in the source alphabet song and can say a substantial alphabet sequence.'},
  w8s1:{o:'follow at least three short supported instructions while completing the source colour task',c:'Pupils respond correctly to at least three instructions such as listen, point, colour or follow the lines.'},
  w8s2:{o:'name or describe at least four source objects using suitable colour words',c:'Pupils produce at least four accurate colour descriptions from Student’s Book p. 7.'},
  w8s3:{o:'blend at least four selected familiar words with teacher support',c:'Pupils blend at least four selected words; the phonics LS/page pairing for Student’s Book p. 7 remains under review.'},
  w8s4:{o:'use capital letters appropriately in at least three copied or guided personal names',c:'Pupils use capital letters correctly in at least three names; the source page itself is a listening/colouring task, so LS/page alignment remains under review.'},
  w8s5:{o:'show understanding of at least three events or character actions from the picture story',c:'Pupils identify at least three correct story details; the Language Arts chant/song LS/page pairing remains under review.'},
  w9s1:{o:'understand and respond to at least three short supported questions from the source story context',c:'Pupils respond appropriately to at least three questions or question-like prompts using the story pictures.'},
  w9s2:{o:'introduce themselves or a source character to a small audience using at least two fixed phrases',c:'Pupils complete one short introduction; the source page is primarily a picture story, so LS/page alignment remains under review.'},
  w9s3:{o:'understand at least four specific details from the five short story-check lines',c:'Pupils correctly match at least four of five lines to the appropriate source pictures.'},
  w9s4:{o:'copy at least four short source lines or phrases legibly and accurately',c:'Pupils copy at least four source items; this is a CONDITIONAL consolidation route and the page itself does not prescribe writing.'},
  w9s5:{o:'say at least four short source lines with intelligible pronunciation and rhythm',c:'Pupils say at least four source lines intelligibly; this CONDITIONAL Language Arts LS/page pairing remains under review.'}
};

function mode(m){if(subjectKey(m)!=='en'||year(m)!==1)return'';return ROUTES[routeKey(m)]||''}
function pair(m){const x=OUTCOMES[mode(m)];return x?{objective:`By the end of the lesson, pupils can ${x.o}.`,criteria:x.c}:null}
function needsAlignmentReview(m){return ALIGNMENT_REVIEW.has(routeKey(m))}
function isConditional(m){return CONDITIONAL.has(routeKey(m))}

function blueprint(m){
  const md=mode(m),pc=pair(m);if(!md||!pc)return null;
  const p=page(m),src=PAGE_TASKS[p];if(!src)return null;
  const sb=`Super Minds 1 Student’s Book p. ${p}`;
  const wb=`Super Minds 1 Workbook p. ${p} (optional page anchor only)`;
  const alignReview=needsAlignmentReview(m),conditional=isConditional(m);
  const bbm=[sb,wb,'RPT English Year 1 (Kumpulan B)'];
  const provenance={
    route:routeKey(m),
    rpt:'RPT_English_Year1_2025-2026_KumpulanB_Murni.docx',
    mapping:'RPT_English_Year1_2025-2026_KumpulanB_Mapping.xlsx',
    dskp:'DSKP KSSR English Year 1 SK (Semakan 2017)',
    textbook:'190_1- Super Minds 1. Student’s Book_2015 -130p.pdf',
    textbookAnchor:sb,
    workbookAnchor:wb,
    generateFlag:conditional?'CONDITIONAL':'YES',
    alignmentReviewRequired:alignReview,
    alignmentReviewNote:alignReview?REVIEW_NOTE:'',
    week7Policy:'W7 is Cuti Perayaan with Generate_Flag NO; no normal English Year 1 runtime route is created.',
    conditionalPolicy:'W9 S3-S5 remain CONDITIONAL because the supplied RPT does not state LP numbers for those consolidation slots.',
    verificationPolicy:'This runtime blueprint does not modify Lesson Mapping or verification status.'
  };
  const mk=(tier,text)=>[step(`en1-friends-${md}-${tier}`,tier==='s'?'Support':tier==='c'?'Source Task':'Challenge',text,sb,tier==='s'?'Guided Practice':tier==='c'?src.pak21:'Independent Challenge')];
  return{
    method:'Source-first English Year 1 Introductory Unit: Friends using RPT + DSKP + exact Super Minds 1 Student’s Book task',
    source:'RPT English Year 1 + DSKP Year 1 + Super Minds 1 Student’s Book',
    provenance,
    generateFlag:conditional?'CONDITIONAL':'YES',
    conditional,
    reviewRequired:alignReview||conditional,
    alignmentReviewRequired:alignReview,
    alignmentReviewNote:alignReview?REVIEW_NOTE:'',
    anchor:`${src.title} — ${sb}`,
    kind:'source_blueprint',
    objective:pc.objective,
    successCriteria:pc.criteria,
    criteria:pc.criteria,
    induction:src.induction,
    support:mk('s',src.support),
    core:mk('c',src.core),
    challenge:mk('h',src.challenge),
    sourceTask:src.task,
    exactSourceTask:src.task,
    activityLibraryPolicy:'Activity Library may vary delivery only and must not determine lesson content',
    workbookPolicy:'Workbook activity content is not invented; Workbook is an optional page anchor only',
    pak21:src.pak21,
    bbm,
    pbdEvidence:`Observe whether pupils meet this criterion: ${pc.criteria}`,
    pbd:{method:'Teacher observation and source-task evidence',evidence:pc.criteria},
    closure:src.closure,
    _runtime_english_year1_friends_mode:md,
    _runtime_english_year1_source_blueprint:true,
    _runtime_english_year1_alignment_review_required:alignReview,
    _runtime_english_year1_conditional_route:conditional
  };
}

const originalEffective=window.effectiveRphLessonMap;
if(typeof originalEffective==='function')window.effectiveRphLessonMap=function(map,...args){
  const out=originalEffective.call(this,map,...args),bp=blueprint(out);if(!bp)return out;
  return{...out,
    objective:bp.objective,
    success_criteria:bp.successCriteria,
    successCriteria:bp.successCriteria,
    source_evidence:{...(out?.source_evidence||{}),runtime_english_year1_friends:{source:bp.source,anchor:bp.anchor,source_task:bp.sourceTask,provenance:bp.provenance}},
    _runtime_english_year1_friends_mode:bp._runtime_english_year1_friends_mode,
    _runtime_english_year1_source_blueprint:true,
    _runtime_english_year1_alignment_review_required:bp.alignmentReviewRequired,
    _runtime_english_year1_conditional_route:bp.conditional
  };
};

const originalPedagogy=window.buildSourceAwarePedagogy;
if(typeof originalPedagogy==='function')window.buildSourceAwarePedagogy=function(map,ev,built){
  const out=blueprint(map);return out||originalPedagogy(map,ev,built);
};
window.englishYear1FriendsSourceBlueprintMode=mode;
window.englishYear1FriendsSourceBlueprint=blueprint;
})();