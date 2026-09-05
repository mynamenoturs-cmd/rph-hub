(function(){
'use strict';

const subjectKey=m=>{try{return window.rphSubjectKey?.(m?.subject_id)||''}catch{return''}};
const mainLs=m=>String(
  m?.source_evidence?.meta?.main_ls||
  m?.source_evidence?.meta?.main_sp||
  m?.learning_standard||
  m?.ls||
  String(m?.sp||'').split(',')[0]||
  ''
).trim();
const year=m=>Number(m?.year||0)||0;
const week=m=>Number(m?.week_no||m?.week||0)||0;
const session=m=>Number(m?.session_no||m?.session||0)||0;
const page=m=>Number(m?.textbook_page_start||0)||0;
const routeKey=m=>`${mainLs(m)}@${page(m)}|W${week(m)}|S${session(m)}`;
const step=(key,name,text,bbm,pak21)=>({key,name,text,bbm,pak21,phase:'source'});

const ROUTES={
  '1.1.1@70|W11|S1':'w11s1','2.1.1@70|W11|S2':'w11s2','3.1.2@71|W11|S3':'w11s3','4.2.1@71|W11|S4':'w11s4',
  '1.2.1@72|W12|S1':'w12s1','2.1.2@72|W12|S2':'w12s2','3.1.3@73|W12|S3':'w12s3','4.2.3@73|W12|S4':'w12s4',
  '1.2.2@74|W13|S1':'w13s1','2.1.3@74|W13|S2':'w13s2','3.1.4@75|W13|S3':'w13s3','4.2.4@75|W13|S4':'w13s4',
  '1.2.3@76|W14|S1':'w14s1','2.1.5@76|W14|S2':'w14s2','3.2.1@77|W14|S3':'w14s3','4.2.5@77|W14|S4':'w14s4',
  '1.2.5@78|W15|S1':'w15s1','2.2.1@79|W15|S2':'w15s2','3.2.2@80|W15|S3':'w15s3','4.3.1@81|W15|S4':'w15s4'
};

const ALIGNMENT_REVIEW=new Set([
  '2.1.1@70|W11|S2','4.2.1@71|W11|S4',
  '2.1.2@72|W12|S2','3.1.3@73|W12|S3','4.2.3@73|W12|S4',
  '2.1.3@74|W13|S2','1.2.3@76|W14|S1',
  '2.2.1@79|W15|S2','3.2.2@80|W15|S3','4.3.1@81|W15|S4'
]);
const REVIEW_NOTE='The draft LS/page pairing needs teacher review. This runtime blueprint preserves the exact Student’s Book task and does not fabricate a different activity to force LS alignment.';

const PAGE_TASKS={
  70:{title:'The Old House — Rooms',task:'Listen and look, then listen and say the room words; listen and chant.',induction:'Show the labelled house on Student’s Book p. 70 and ask pupils to name rooms they already know.',support:'Point to each labelled room, listen and repeat with teacher modelling.',core:'Complete the source tasks: listen and look, say the room words, then listen and chant.',challenge:'Identify six rooms from the house and use the source language to ask or answer about one room.',closure:'Name two rooms and locate one in the house.',pak21:'Think-Pair-Share'},
  71:{title:'Monsters and Bedrooms',task:'Listen and match the monsters with bedrooms; practise there is/there are; play the description game.',induction:'Show the four bedrooms on Student’s Book p. 71 and ask pupils to notice one object in each.',support:'Use picture cues and the there is/there are model while matching and describing.',core:'Listen and match the monsters to bedrooms, practise the grammar model and play the source description game.',challenge:'Give two accurate room descriptions for a partner to identify.',closure:'Say one there is/there are sentence about a source picture.',pak21:'Description Game'},
  72:{title:'The Old House Song',task:'Listen and sing, then listen again and number the pictures.',induction:'Show the house illustration on Student’s Book p. 72 and ask pupils to predict animals and rooms they may hear.',support:'Track the pictures while listening and repeat selected room/animal phrases.',core:'Listen and sing the source song, then listen again and number the pictures.',challenge:'Recall three room-and-animal details after listening.',closure:'State one correct room-and-animal detail.',pak21:'Think-Pair-Share'},
  73:{title:'Park Picture — Is/Are/How Many',task:'Listen, look and stick; practise is/are/how many questions and answers; ask and answer about the picture.',induction:'Study the park picture on Student’s Book p. 73 and predict one yes/no or how-many question.',support:'Use the printed question frames and point to the relevant object before answering.',core:'Complete the source listening/sticker task, practise the grammar model, then ask and answer about the picture.',challenge:'Ask three new source-based questions using is, are or how many.',closure:'Perform one complete question-and-answer exchange.',pak21:'Pair Interview'},
  74:{title:'At the House — Story',task:'Listen to and follow the first part of the picture story at the old house.',induction:'Show the first story panel on Student’s Book p. 74 and ask pupils to predict whether the characters will enter the house.',support:'Follow the numbered panels and point to characters and locations as the story is heard.',core:'Listen to and follow the source story, identifying the setting, characters and important events.',challenge:'Retell two story events in sequence using visual support.',closure:'State one important story detail.',pak21:'Think-Pair-Share'},
  75:{title:'At the House — Story Check and Phonics',task:'Make sentences with a friend, find who says a line in the story, then listen and say the phonics sentence.',induction:'Show two story panels on Student’s Book p. 75 and ask pupils to make one simple sentence about what they can see.',support:'Use a sentence frame to describe one numbered picture and repeat the phonics line in chunks.',core:'Complete the source tasks: make picture sentences, identify the speaker of the quoted line, then listen and say the phonics sentence.',challenge:'Create two accurate picture sentences and segment or sound out selected source words with support.',closure:'Say one picture sentence and one target sound/word.',pak21:'Pair Share'},
  76:{title:'Reading and Speaking — Quantities',task:'Look, read and match statements to pictures, then ask and answer how-many questions.',induction:'Show the four quantity pictures on Student’s Book p. 76 and ask which items pupils can identify.',support:'Underline the number and noun in each sentence before matching it to a picture.',core:'Read and match the source statements to pictures, then ask and answer how-many questions with a partner.',challenge:'Create two new accurate how-many questions from the source pictures.',closure:'Read one matched statement and give its picture letter.',pak21:'Check-Pair-Compare'},
  77:{title:'Listening and Writing — My House',task:'Listen and tick the correct house picture, then write about your house using the source model.',induction:'Compare two house pictures on Student’s Book p. 77 and identify one visible difference.',support:'Use the model paragraph and a room word bank to plan two sentences.',core:'Complete the source listening choice, then write a short description of a house using the model.',challenge:'Add one connected sentence using a basic coordinating conjunction while keeping the description accurate.',closure:'Read one sentence from the house description.',pak21:'Think-Write-Pair-Share'},
  78:{title:'Habitats',task:'Identify colours and features of habitats and answer what is found in each habitat.',induction:'Show two habitat photographs on Student’s Book p. 78 and ask pupils to name one visible colour or feature.',support:'Match habitat labels to photos and use the printed response model.',core:'Complete the source questions about habitat colours and what can be found in the habitats.',challenge:'Compare two habitats using two accurate source details.',closure:'Name one habitat and one thing found there.',pak21:'Think-Pair-Share'},
  79:{title:'Animals and Habitats Project',task:'Identify where the animals are found, then make a habitat project.',induction:'Show two animal pictures on Student’s Book p. 79 and ask pupils to predict their habitats.',support:'Use the habitat labels from the previous page to match animals before starting the project.',core:'Complete the source animal-habitat task, then make the habitat project shown on the page.',challenge:'Explain two animal-habitat choices while showing the project.',closure:'Name one animal and its habitat.',pak21:'Collaborative Project'},
  80:{title:'Create That! — My House',task:'Listen and imagine, draw a house picture, then show it to friends and respond to questions.',induction:'Look at the sample drawings on Student’s Book p. 80 and identify one feature that can be described.',support:'Listen with a simple drawing checklist and use the printed sentence/question frames when sharing.',core:'Complete the source creativity task: listen and imagine, draw the picture, then show it and respond to friends.',challenge:'Describe three features of the drawing and answer two peer questions.',closure:'Show one feature and describe it in one sentence.',pak21:'Gallery Walk'},
  81:{title:'Quiz Time — The Old House',task:'Complete the eight-item source quiz reviewing rooms, there is/are, animals, sounds and habitats.',induction:'Scan Student’s Book p. 81 and predict which Unit 6 topics will be reviewed.',support:'Complete the quiz in small chunks and point to the visual clue for each answer.',core:'Complete all source quiz items and check answers against the page content from Unit 6.',challenge:'Explain the evidence for three answers and correct one error after peer checking.',closure:'Share one quiz answer and the clue or rule used.',pak21:'Quiz-Quiz-Trade'}
};

const OUTCOMES={
  w11s1:{o:'recognise and reproduce at least six room words intelligibly while completing the listening and chant task',c:'Pupils correctly identify and say at least six room words from Student’s Book p. 70.'},
  w11s2:{o:'give at least two simple spoken statements about rooms or what is in them using the source language',c:'Pupils give at least two relevant spoken statements based on Student’s Book p. 70; LS/page alignment remains under review.'},
  w11s3:{o:'sound out at least four familiar source words with support while completing the room-description task',c:'Pupils sound out at least four familiar words from Student’s Book p. 71 with beginning, medial or final sounds recognisable.'},
  w11s4:{o:'produce at least two supported question-and-statement pairs while using the source description game',c:'Pupils produce at least two understandable question/statement pairs from Student’s Book p. 71; LS/page alignment remains under review.'},
  w12s1:{o:'understand the main idea of the old-house song and identify at least three correct room-and-animal details',c:'Pupils state the main idea and identify at least three details from Student’s Book p. 72.'},
  w12s2:{o:'ask at least two basic questions linked to the source topic and respond with relevant information',c:'Pupils complete two supported exchanges based on Student’s Book p. 72; LS/page alignment remains under review.'},
  w12s3:{o:'blend at least four selected familiar source words with teacher support',c:'Pupils blend at least four selected words from the Unit 6 source set; the draft LS/page pairing for Student’s Book p. 73 remains under review.'},
  w12s4:{o:'produce at least two short supported instructions linked to the source picture task',c:'Pupils produce at least two understandable instructions using familiar source language; the Student’s Book p. 73 LS/page pairing remains under review.'},
  w13s1:{o:'understand at least three specific details from the “At the House” picture story',c:'Pupils identify at least three correct story details from Student’s Book p. 74.'},
  w13s2:{o:'give a short sequence of two basic instructions using familiar Unit 6 language with support',c:'Pupils give two instructions in a logical sequence; the draft LS/page pairing for Student’s Book p. 74 remains under review.'},
  w13s3:{o:'segment at least four selected familiar words and reproduce the phonics sentence with support',c:'Pupils segment at least four source words and say the phonics line intelligibly using Student’s Book p. 75.'},
  w13s4:{o:'describe at least three objects, people or picture details using suitable familiar words and phrases',c:'Pupils produce at least three accurate descriptions based on Student’s Book p. 75.'},
  w14s1:{o:'identify at least four specific quantity details from the source sentences and pictures',c:'Pupils correctly match at least four statements to pictures on Student’s Book p. 76; the narrative LS/page pairing remains under review.'},
  w14s2:{o:'describe at least four source objects or quantities using suitable words and phrases',c:'Pupils give at least four accurate spoken descriptions or how-many responses from Student’s Book p. 76.'},
  w14s3:{o:'understand the main idea of the sample house description and identify at least three supporting details',c:'Pupils state the main idea and identify at least three details from the model on Student’s Book p. 77.'},
  w14s4:{o:'connect at least three familiar words or phrases using a basic coordinating conjunction in the house description',c:'Pupils write at least three accurate connected phrases or sentences based on Student’s Book p. 77.'},
  w15s1:{o:'understand and answer at least three short supported questions about habitats',c:'Pupils answer at least three source questions accurately using Student’s Book p. 78.'},
  w15s2:{o:'keep a short project exchange going using at least two suitable non-verbal responses while sharing habitat choices',c:'Pupils use at least two suitable non-verbal responses during the Student’s Book p. 79 project exchange; LS/page alignment remains under review.'},
  w15s3:{o:'identify at least three specific details communicated during the picture-sharing task',c:'Pupils identify at least three details from Student’s Book p. 80 sharing activity; the reading LS/page pairing remains under review.'},
  w15s4:{o:'complete the source quiz accurately and review sentence-level capitalisation or full stops where relevant',c:'Pupils complete at least six of eight quiz items correctly; the guided-writing LS/page pairing for Student’s Book p. 81 remains under review.'}
};

function mode(m){if(subjectKey(m)!=='en'||year(m)!==2)return'';return ROUTES[routeKey(m)]||''}
function pair(m){const x=OUTCOMES[mode(m)];return x?{objective:`By the end of the lesson, pupils can ${x.o}.`,criteria:x.c}:null}
function needsAlignmentReview(m){return ALIGNMENT_REVIEW.has(routeKey(m))}

function blueprint(m){
  const md=mode(m),pc=pair(m);if(!md||!pc)return null;
  const p=page(m),src=PAGE_TASKS[p];if(!src)return null;
  const sb=`Super Minds 1 Student’s Book p. ${p}`;
  const wb=`Super Minds 1 Workbook p. ${p} (optional page anchor only)`;
  const bbm=[sb,wb,'RPT English Year 2 (Kumpulan B)'];
  const alignReview=needsAlignmentReview(m);
  const mk=(tier,text)=>[step(`en2-u6-${md}-${tier}`,tier==='s'?'Support':tier==='c'?'Source Task':'Challenge',text,sb,tier==='s'?'Guided Practice':tier==='c'?src.pak21:'Independent Challenge')];
  const provenance={
    route:routeKey(m),
    rpt:'RPT ENGLISH YEAR 2 (SK) 2025-2026 by RozayusAcademy (Kump B).docx',
    mappingDraft:'RPT_English_Year2_2025-2026_KumpulanB_4Sesi_SourceFirst_DRAFT.docx',
    textbook:'190_1- Super Minds 1. Student’s Book_2015 -130p.pdf',
    textbookAnchor:sb,
    workbookAnchor:wb,
    mappingStatus:'DERIVED_NEEDS_TEACHER_REVIEW',
    alignmentReviewRequired:alignReview,
    alignmentReviewNote:alignReview?REVIEW_NOTE:'',
    reviewPolicy:'This runtime source blueprint does not mark Lesson Mapping as verified; teacher review remains required.'
  };
  return{
    method:'Source-first English Year 2 Unit 6 using RPT + exact Super Minds 1 Student’s Book task',
    source:'RPT English Year 2 + Super Minds 1 Student’s Book',
    provenance,
    mappingStatus:'DERIVED_NEEDS_TEACHER_REVIEW',
    reviewRequired:true,
    alignmentReviewRequired:alignReview,
    alignmentReviewNote:alignReview?REVIEW_NOTE:'',
    anchor:`${src.title} — ${sb}`,
    kind:'source_task',
    exactSourceTask:src.task,
    mainLs:mainLs(m),
    page:sb,
    workbookReference:wb,
    topic:'Unit 6: The Old House',
    setInduksi:src.induction,
    inductionData:{name:'Source Induction',text:src.induction,bbm:sb,pak21:'Think-Pair-Share'},
    bbmList:bbm,
    groupBbm:{support:bbm.join('; '),core:bbm.join('; '),challenge:bbm.join('; ')},
    pakDetail:`Lesson content is locked to the exact task on ${sb}. Activity Library may vary delivery only and must not determine lesson content. Workbook p. ${p} is an optional page anchor only; Workbook activity content is not invented.${alignReview?' '+REVIEW_NOTE:''}`,
    librarySteps:{support:mk('s',src.support),core:mk('c',src.core),challenge:mk('h',src.challenge)},
    diffSupport:'Use the same Student’s Book source task with visual prompts, modelling, sentence frames or reduced response load.',
    diffCore:'Complete the actual Student’s Book task and produce evidence that can be checked directly against the source.',
    diffChallenge:'Complete the same source task more independently and add one accurate response, explanation, comparison or performance using source language.',
    diffSupportAct:src.support,
    diffCoreAct:src.core,
    diffChallengeAct:src.challenge,
    pbdEvidence:{
      method:'Observation + source-task response/product',
      evidence:`Check the pupil response directly against ${sb} and the printed source instruction. Workbook content is not assumed.${alignReview?' LS/page alignment remains flagged for teacher review.':''}`,
      criterion:pc.criteria
    },
    penutup:src.closure,
    _runtime_english_year2_source_blueprint:true,
    _runtime_english_year2_unit6_mode:md,
    _runtime_english_year2_mapping_review_required:true,
    _runtime_english_year2_mapping_status:'DERIVED_NEEDS_TEACHER_REVIEW',
    _runtime_english_year2_alignment_review_required:alignReview
  };
}

const originalEffective=window.effectiveRphLessonMap;
if(typeof originalEffective==='function')window.effectiveRphLessonMap=function(map,...args){
  const out=originalEffective.call(this,map,...args)||map;
  const pc=pair(out);if(!pc)return out;
  return{
    ...out,
    objective:pc.objective,
    success_criteria:pc.criteria,
    _runtime_english_year2_source_blueprint:true,
    _runtime_english_year2_unit6_mode:mode(out),
    _runtime_english_year2_mapping_review_required:true,
    _runtime_english_year2_mapping_status:'DERIVED_NEEDS_TEACHER_REVIEW',
    _runtime_english_year2_alignment_review_required:needsAlignmentReview(out)
  };
};
const originalPedagogy=window.buildSourceAwarePedagogy;
if(typeof originalPedagogy==='function')window.buildSourceAwarePedagogy=function(map,ev,built){
  const out=blueprint(map);return out||originalPedagogy(map,ev,built);
};
window.englishYear2Unit6SourceBlueprintMode=mode;
window.englishYear2Unit6SourceBlueprint=blueprint;
})();