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
  '1.1.1@82|W16|S1':'w16s1','2.1.2@82|W16|S2':'w16s2','3.1.1@83|W16|S3':'w16s3','4.2.3@83|W16|S4':'w16s4',
  '1.2.2@84|W17|S1':'w17s1','2.1.3@84|W17|S2':'w17s2','3.1.2@85|W17|S3':'w17s3','4.2.4@85|W17|S4':'w17s4',
  '1.2.3@86|W18|S1':'w18s1','2.1.5@86|W18|S2':'w18s2','3.1.3@87|W18|S3':'w18s3','4.2.5@87|W18|S4':'w18s4',
  '1.2.4@88|W19|S1':'w19s1','2.2.1@88|W19|S2':'w19s2','3.1.4@89|W19|S3':'w19s3','4.3.1@89|W19|S4':'w19s4',
  '1.2.5@90|W20|S1':'w20s1','2.3.1@90|W20|S2':'w20s2','3.2.1@91|W20|S3':'w20s3','4.3.2@91|W20|S4':'w20s4',
  '1.3.1@92|W21|S1':'w21s1','2.1.2@92|W21|S2':'w21s2','3.2.2@93|W21|S3':'w21s3','4.3.3@93|W21|S4':'w21s4',
  '1.1.1@92|W22|S1':'w22s1','2.1.3@93|W22|S2':'w22s2','3.2.3@92|W22|S3':'w22s3','4.2.3@93|W22|S4':'w22s4'
};

const ALIGNMENT_REVIEW=new Set([
  '2.1.2@82|W16|S2','3.1.1@83|W16|S3','4.2.3@83|W16|S4',
  '3.1.2@85|W17|S3','4.2.5@87|W18|S4',
  '1.2.4@88|W19|S1','2.2.1@88|W19|S2','3.1.4@89|W19|S3',
  '1.2.5@90|W20|S1','2.3.1@90|W20|S2','3.2.1@91|W20|S3',
  '2.1.2@92|W21|S2','3.2.2@93|W21|S3','4.3.3@93|W21|S4',
  '1.1.1@92|W22|S1','4.2.3@93|W22|S4'
]);
const REVIEW_NOTE='The draft LS/page pairing needs teacher review. This runtime blueprint preserves the exact Student’s Book task and does not fabricate a different activity to force LS alignment.';

const PAGE_TASKS={
  82:{title:'Get Dressed! — Clothes',task:'Listen and look at the labelled clothes, listen and say the words, then listen and chant.',induction:'Show the clothes picture on Student’s Book p. 82 and ask pupils to point to two items they already know.',support:'Point to the labelled clothes, listen and repeat in short chunks with teacher modelling.',core:'Complete the source listening, word-repetition and chant tasks using the clothes picture.',challenge:'Identify at least eight clothes items and perform the source chant with clear pronunciation.',closure:'Name three clothes items from the page.',pak21:'Listen-Pair-Repeat'},
  83:{title:'Do You Like These?',task:'Match picture exchanges, listen and check, practise the this/these grammar model, then ask and answer about the pictured clothes.',induction:'Show two single/plural clothes pictures on Student’s Book p. 83 and ask pupils what changes in the question.',support:'Use the printed question-and-answer model while pointing to one item or a pair.',core:'Complete the source matching/listening task, practise the grammar model, then ask and answer about the pictured clothes.',challenge:'Complete four accurate partner exchanges using this or these appropriately.',closure:'Perform one complete like/dislike exchange.',pak21:'Pair Interview'},
  84:{title:'Cool Cats Song',task:'Listen and sing the clothes song, then identify and say the colours of clothes in the picture.',induction:'Show the colourful clothes on Student’s Book p. 84 and ask pupils to predict two colour words they may hear.',support:'Track the clothes pictures while listening and repeat short clothing/colour phrases.',core:'Listen and sing the source song, then say the colours of the clothes shown on the page.',challenge:'Recall four correct clothes-and-colour combinations after the song.',closure:'State one clothes-and-colour combination.',pak21:'Think-Pair-Share'},
  85:{title:'What Are They Wearing?',task:'Listen and write the names, practise the wearing grammar model, then play the source guessing game.',induction:'Study the people on Student’s Book p. 85 and describe one visible item of clothing.',support:'Use the printed wearing sentence model and point to the person before answering.',core:'Complete the source listening/name task, practise the grammar model and play the guessing game.',challenge:'Give three accurate clues about what a person is wearing for a partner to identify.',closure:'Say one complete wearing sentence.',pak21:'Guessing Game'},
  86:{title:'The Cap — Story',task:'Listen to and follow the picture story about a missing cap and the characters’ responses.',induction:'Show the first story panel on Student’s Book p. 86 and ask pupils to predict what problem the character has.',support:'Follow the numbered panels and point to the cap, characters and actions as the story is heard.',core:'Listen to and follow the source story, identifying the problem, key actions and outcome.',challenge:'Retell three story events in sequence using the pictures.',closure:'State the story problem and one event.',pak21:'Think-Pair-Share'},
  87:{title:'The Cap — Story Check and Phonics',task:'Complete the story-check sentence task, identify who says a line, then listen and say the phonics sentence.',induction:'Show the final story panels on Student’s Book p. 87 and ask pupils what happens to the cap.',support:'Use picture cues to choose a sentence and repeat the phonics line in manageable chunks.',core:'Complete the source story-check tasks, identify the speaker and practise the phonics sentence.',challenge:'Give two accurate story statements and blend selected source words from the phonics task.',closure:'Say one story fact and one target sound/word.',pak21:'Pair Check'},
  88:{title:'Reading — Clothes at the Bus',task:'Look and read six clothes statements, then write yes or no for each statement.',induction:'Show the people in the bus picture on Student’s Book p. 88 and ask pupils to notice one clothing detail.',support:'Read one statement at a time, point to the named person and locate the clothing evidence.',core:'Complete the six source yes/no reading statements using evidence from the picture.',challenge:'Correct two false statements using accurate source details.',closure:'Share one answer and its visual evidence.',pak21:'Check-Pair-Compare'},
  89:{title:'Skills — Clothes and Actions',task:'Ask and answer about shadow pictures, listen and check, choose and write a description, then play the source mime guessing game.',induction:'Show one shadow picture on Student’s Book p. 89 and ask pupils to guess the action.',support:'Use the printed question frame and the model description while pointing to picture clues.',core:'Complete the source ask-answer, listening/checking, description-writing and mime-game tasks.',challenge:'Write one accurate extra clothes/action sentence and give two mime clues to a partner.',closure:'Read one source-based description aloud.',pak21:'Mime and Guess'},
  90:{title:'Materials',task:'Listen, read and match clothes to source materials, then say which material is used for each pictured item.',induction:'Show cotton, leather and wool pictures on Student’s Book p. 90 and ask pupils where they may come from.',support:'Match one material at a time using the picture and sentence clues.',core:'Complete the source listen-read-match task, then say the material for the pictured clothes.',challenge:'Give three accurate item-and-material statements from the page.',closure:'Name one material and one item made from it.',pak21:'Think-Pair-Share'},
  91:{title:'Materials — Properties and Project',task:'Read and complete the material-property words, then make the source poster using different materials.',induction:'Show the words cool, strong and warm on Student’s Book p. 91 and ask pupils to match one to a material.',support:'Use the three printed options and picture clues before completing each sentence.',core:'Complete the source property-word task, then make the poster with different materials.',challenge:'Label the poster accurately and explain two material choices using source words.',closure:'Name one material and its property.',pak21:'Collaborative Project'},
  92:{title:'Creativity — Act Out the Story',task:'Listen and act out with the teacher, listen again and number the pictures, read and number the story sentences, then listen to a friend and act out.',induction:'Show the six action pictures on Student’s Book p. 92 and ask pupils to predict the order of two actions.',support:'Follow the teacher model, act one instruction at a time and use the pictures to sequence the story.',core:'Complete the source listening/acting, picture-numbering and sentence-numbering tasks, then act out with a friend.',challenge:'Give a partner three source-based action cues in the correct story order.',closure:'State or act one story instruction from the page.',pak21:'Role Play'},
  93:{title:'The Dressing Game',task:'Play the source revision game using clothes pictures around the board.',induction:'Scan the clothes around Student’s Book p. 93 and name three items before the game starts.',support:'Use picture labels from Unit 7 and a sentence frame while taking turns in the game.',core:'Play the source dressing game and respond to the clothing prompt reached on each turn.',challenge:'Use a full clothes sentence or short instruction on each turn instead of naming only the item.',closure:'Name two clothes items encountered during the game.',pak21:'Board Game'}
};

const OUTCOMES={
  w16s1:{o:'recognise and reproduce at least six familiar clothes words intelligibly during the listening and chant task',c:'Pupils correctly identify and say at least six clothes words from Student’s Book p. 82.'},
  w16s2:{o:'ask at least two supported basic questions using familiar Unit 7 language while taking part in the source clothes task',c:'Pupils complete at least two supported spoken exchanges based on Student’s Book p. 82; LS/page alignment remains under review.'},
  w16s3:{o:'identify and name selected letters from familiar clothes words while completing the source page task',c:'Pupils identify at least four target letters in familiar Unit 7 words; the draft Reading LS/page pairing for Student’s Book p. 83 remains under review.'},
  w16s4:{o:'produce at least two short familiar instructions linked to dressing or handling the source clothes pictures',c:'Pupils produce at least two understandable instructions; the Writing LS/page pairing for Student’s Book p. 83 remains under review.'},
  w17s1:{o:'understand at least four specific clothing or colour details from the source song',c:'Pupils identify at least four correct details from Student’s Book p. 84.'},
  w17s2:{o:'give a short sequence of at least three basic dressing instructions using familiar source language',c:'Pupils give at least three instructions in a logical sequence using clothes from Student’s Book p. 84.'},
  w17s3:{o:'sound out at least four selected familiar clothes words with support',c:'Pupils recognise beginning, medial or final sounds in at least four Unit 7 words; the draft Reading LS/page pairing for Student’s Book p. 85 remains under review.'},
  w17s4:{o:'name or describe at least four people or clothes items using suitable familiar words',c:'Pupils produce at least four accurate source-based descriptions using Student’s Book p. 85.'},
  w18s1:{o:'understand at least three specific events from the very short picture story',c:'Pupils identify at least three correct events from Student’s Book p. 86.'},
  w18s2:{o:'describe at least three source objects or characters using suitable familiar words and phrases',c:'Pupils give at least three accurate descriptions based on Student’s Book p. 86.'},
  w18s3:{o:'blend at least four selected familiar source words while completing the phonics task',c:'Pupils blend at least four source words or sound combinations from Student’s Book p. 87 with support.'},
  w18s4:{o:'connect at least two familiar words or phrases using a basic coordinating conjunction in a source-based response',c:'Pupils produce at least two connected phrases or sentences; the draft Writing LS/page pairing for Student’s Book p. 87 remains under review.'},
  w19s1:{o:'respond correctly to at least three short supported classroom instructions while using the source reading page',c:'Pupils follow at least three teacher instructions linked to Student’s Book p. 88; the Listening LS/page pairing remains under review.'},
  w19s2:{o:'use at least two suitable non-verbal responses to keep a short peer exchange going while checking the source task',c:'Pupils use at least two appropriate non-verbal responses during peer checking; the draft Speaking LS/page pairing for Student’s Book p. 88 remains under review.'},
  w19s3:{o:'segment at least four selected familiar Unit 7 words into phonemes with support',c:'Pupils segment at least four selected words; the Reading LS/page pairing for Student’s Book p. 89 remains under review.'},
  w19s4:{o:'write at least three source-based sentences with appropriate capital letters and full stops',c:'Pupils produce at least three guided sentences based on Student’s Book p. 89 using capital letters and full stops appropriately.'},
  w20s1:{o:'answer at least three short supported questions about materials using source information',c:'Pupils answer at least three source-based questions accurately; the Listening LS/page pairing for Student’s Book p. 90 remains under review.'},
  w20s2:{o:'use fixed phrases to introduce themselves or a partner before sharing one source-based material fact',c:'Pupils complete one short supported introduction and source-based statement; the Speaking LS/page pairing for Student’s Book p. 90 remains under review.'},
  w20s3:{o:'state the main idea of the materials task and identify at least two supporting details',c:'Pupils state a reasonable main idea and two correct details from Student’s Book p. 91; the Reading LS/page pairing remains under review.'},
  w20s4:{o:'spell at least six familiar source words accurately while completing the material-property and poster tasks',c:'Pupils spell at least six familiar words accurately in the guided work on Student’s Book p. 91.'},
  w21s1:{o:'use the source pictures as visual clues to understand and act out at least four spoken messages or instructions',c:'Pupils respond appropriately to at least four spoken cues using Student’s Book p. 92.'},
  w21s2:{o:'ask at least two basic questions using familiar source language during the partner acting task',c:'Pupils complete two supported questions; the personal-information Speaking LS/page pairing for Student’s Book p. 92 remains under review.'},
  w21s3:{o:'identify at least three specific details while participating in the source revision game',c:'Pupils identify at least three correct clothing details; the Reading LS/page pairing for Student’s Book p. 93 remains under review.'},
  w21s4:{o:'plan and write at least three simple source-based sentences after the revision game',c:'Pupils produce at least three simple sentences; the Writing LS/page pairing for Student’s Book p. 93 remains under review.'},
  w22s1:{o:'recognise and reproduce at least four selected target sounds from familiar Unit 7 words while using the source creativity page',c:'Pupils reproduce at least four selected target sounds; the Listening LS/page pairing for Student’s Book p. 92 remains under review.'},
  w22s2:{o:'give a short sequence of at least three familiar dressing instructions during the source revision game',c:'Pupils give at least three understandable instructions in sequence while using Student’s Book p. 93.'},
  w22s3:{o:'reread source words or sentences to confirm meaning and correctly sequence at least four story actions',c:'Pupils use rereading and visual clues to sequence at least four items from Student’s Book p. 92.'},
  w22s4:{o:'write at least two short familiar dressing instructions based on the source game',c:'Pupils write at least two understandable instructions; the Writing LS/page pairing for Student’s Book p. 93 remains under review.'}
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
  const mk=(tier,text)=>[step(`en2-u7-${md}-${tier}`,tier==='s'?'Support':tier==='c'?'Source Task':'Challenge',text,sb,tier==='s'?'Guided Practice':tier==='c'?src.pak21:'Independent Challenge')];
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
    method:'Source-first English Year 2 Unit 7 using RPT + exact Super Minds 1 Student’s Book task',
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
    topic:'Unit 7: Get Dressed!',
    setInduksi:src.induction,
    inductionData:{name:'Source Induction',text:src.induction,bbm:sb,pak21:'Think-Pair-Share'},
    bbmList:bbm,
    groupBbm:{support:bbm.join('; '),core:bbm.join('; '),challenge:bbm.join('; ')},
    pakDetail:`Lesson content is locked to the exact task on ${sb}. Activity Library may vary delivery only and must not determine lesson content. Workbook p. ${p} is an optional page anchor only; Workbook activity content is not invented.${alignReview?' '+REVIEW_NOTE:''}`,
    librarySteps:{support:mk('s',src.support),core:mk('c',src.core),challenge:mk('h',src.challenge)},
    diffSupport:'Use the same Student’s Book source task with visual prompts, modelling, sentence frames or reduced response load.',
    diffCore:'Complete the actual Student’s Book task and produce evidence that can be checked directly against the source.',
    diffChallenge:'Complete the same source task more independently and add one accurate response, explanation or performance using source language.',
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
    _runtime_english_year2_unit7_mode:md,
    _runtime_english_year2_mapping_review_required:true,
    _runtime_english_year2_mapping_status:'DERIVED_NEEDS_TEACHER_REVIEW',
    _runtime_english_year2_alignment_review_required:alignReview
  };
}

const originalEffective=window.effectiveRphLessonMap;
if(typeof originalEffective==='function')window.effectiveRphLessonMap=function(map,...args){
  const out=originalEffective.call(this,map,...args),pc=pair(out);if(!pc)return out;
  return{
    ...out,
    objective:pc.objective,
    success_criteria:pc.criteria,
    _runtime_english_year2_source_blueprint:true,
    _runtime_english_year2_unit7_mode:mode(out),
    _runtime_english_year2_mapping_review_required:true,
    _runtime_english_year2_mapping_status:'DERIVED_NEEDS_TEACHER_REVIEW',
    _runtime_english_year2_alignment_review_required:needsAlignmentReview(out)
  };
};
const originalPedagogy=window.buildSourceAwarePedagogy;
if(typeof originalPedagogy==='function')window.buildSourceAwarePedagogy=function(map,ev,built){
  const out=blueprint(map);return out||originalPedagogy(map,ev,built);
};
window.englishYear2Unit7SourceBlueprintMode=mode;
window.englishYear2Unit7SourceBlueprint=blueprint;
})();