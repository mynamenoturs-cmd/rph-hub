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
  '1.1.1@106|W32|S1':'w32s1','2.1.1@106|W32|S2':'w32s2','3.1.2@107|W32|S3':'w32s3','4.2.5@107|W32|S4':'w32s4',
  '1.2.1@108|W33|S1':'w33s1','2.1.2@108|W33|S2':'w33s2','3.2.1@109|W33|S3':'w33s3','4.3.1@109|W33|S4':'w33s4',
  '1.2.2@110|W35|S1':'w35s1','2.1.3@111|W35|S2':'w35s2','3.2.2@112|W35|S3':'w35s3','4.3.2@113|W35|S4':'w35s4',
  '1.2.3@114|W36|S1':'w36s1','2.1.5@115|W36|S2':'w36s2','3.2.3@116|W36|S3':'w36s3','4.3.3@117|W36|S4':'w36s4'
};

const ALIGNMENT_REVIEW=new Set([
  '2.1.1@106|W32|S2','3.1.2@107|W32|S3','4.2.5@107|W32|S4',
  '2.1.2@108|W33|S2','4.3.1@109|W33|S4',
  '2.1.3@111|W35|S2','4.3.2@113|W35|S4',
  '1.2.3@114|W36|S1','2.1.5@115|W36|S2','4.3.3@117|W36|S4'
]);
const REVIEW_NOTE='The draft LS/page pairing needs teacher review. This runtime blueprint preserves the actual Student’s Book task and does not fabricate a different activity to force LS alignment.';

const PAGE_TASKS={
  106:{title:'At the Beach — Holiday Activities',task:'Use the beach scene to listen to, identify and say holiday activity phrases, then perform the source chant.',induction:'Show the beach scene on Student’s Book p. 106 and ask pupils to identify two activities they already know.',support:'Point to each labelled activity, listen and repeat in short chunks with teacher modelling.',core:'Complete the source listening, word-repetition and chant tasks using the beach activity scene.',challenge:'Identify all eight pictured activities and use three of them in short source-based oral phrases.',closure:'Name three beach activities from the page.',pak21:'Listen-Pair-Repeat'},
  107:{title:'Suggestions at the Beach',task:'Listen and sequence the pictures, complete the activity words, practise the suggestion-response model, then act out source-based exchanges.',induction:'Show two suggestion pictures on Student’s Book p. 107 and ask pupils which activity each pair is discussing.',support:'Use the printed suggestion-response frames and picture cues before taking a speaking turn.',core:'Complete the source listening/numbering and word-completion tasks, practise the response model and act out exchanges.',challenge:'Create three accurate suggestion-response exchanges using activities from the page.',closure:'Perform one complete suggestion-response exchange.',pak21:'Pair Role-Play'},
  108:{title:'Happy Holiday Song',task:'Listen to and sing the holiday song, then listen again and sequence the pictures.',induction:'Scan the holiday pictures on Student’s Book p. 108 and predict two activities that may appear in the song.',support:'Track the pictures while listening and repeat short phrases before singing with the class.',core:'Complete the source song and picture-sequencing tasks.',challenge:'Recall four correct activity details from the song after listening.',closure:'State one activity heard in the song.',pak21:'Think-Pair-Share'},
  109:{title:"Where's / Where are",task:'Listen and read location questions, select the matching pictures, practise singular/plural location forms, then play the source question game.',induction:'Show one object-in-container picture from Student’s Book p. 109 and ask where the object is.',support:'Use the printed question-answer model and point to the container before responding.',core:'Complete the source picture-choice task, practise the grammar model and play the location question game.',challenge:'Ask and answer four accurate location questions using singular and plural forms.',closure:'Perform one complete location question-and-answer exchange.',pak21:'Question Game'},
  110:{title:'The Top of the Hill — Story',task:'Listen to and follow the first part of the picture story, identifying the race, the problem and key events.',induction:'Show the first story panel on Student’s Book p. 110 and ask pupils to predict what the characters plan to do.',support:'Follow the numbered panels and point to the characters and actions while listening.',core:'Listen to and follow the source story, identifying important details and the developing problem.',challenge:'Retell three story events in sequence using the pictures.',closure:'State one important event from the story.',pak21:'Think-Pair-Share'},
  111:{title:'The Top of the Hill — Story Check and Phonics',task:'Read story statements and identify the speakers, locate a quoted line, then listen to and practise the phonics sentence.',induction:'Show the ending panels on Student’s Book p. 111 and ask pupils how the race ends.',support:'Use picture clues to match statements to characters and repeat the phonics line in short chunks.',core:'Complete the source story-check, speaker-identification and phonics tasks.',challenge:'Explain two character statements and reproduce selected target-sound words clearly.',closure:'State one story fact and one target sound or word.',pak21:'Pair Check'},
  112:{title:'Countries — Reading, Listening and Writing',task:'Read short country descriptions and match them to pictures, listen and identify countries, then write a short source-modelled description of the pupil’s country.',induction:'Show the three country pictures on Student’s Book p. 112 and ask pupils what clues identify each place.',support:'Underline place/activity clues before matching each description to a picture.',core:'Complete the source reading/matching and listening tasks, then write a short country description using the model.',challenge:'Add two accurate details to the country description using source vocabulary.',closure:'Share one country and one supporting detail.',pak21:'Read-Pair-Check'},
  113:{title:'Beach Scene — Listen, Stick and Describe',task:'Listen to teacher cues and place stickers on the beach scene, then describe visible items or positions from the completed picture.',induction:'Study the beach picture on Student’s Book p. 113 and identify three visible objects or actions.',support:'Use one teacher cue at a time and locate the matching visual position before placing a sticker.',core:'Complete the source listening-and-sticker task, then orally describe selected details from the picture.',challenge:'Give four precise source-based picture descriptions for a partner to verify.',closure:'Describe one detail from the completed beach scene.',pak21:'Listen-Do-Check'},
  114:{title:'Holiday Weather — Map',task:'Talk about weather symbols, read weather sentences and place country names on the map.',induction:'Show the weather icons on Student’s Book p. 114 and ask pupils to name two conditions.',support:'Match one icon at a time to its weather phrase before reading the map sentences.',core:'Complete the source weather discussion and country-on-map reading task.',challenge:'Compare the weather in two countries using accurate source details.',closure:'Name one country and its weather.',pak21:'Think-Pair-Share'},
  115:{title:'Weather Postcards and Diary',task:'Read the short postcards, match each one to the correct holiday picture/country, then create a simple weather diary following the source project.',induction:'Show the three holiday pictures on Student’s Book p. 115 and ask which weather condition each suggests.',support:'Highlight weather words in each postcard before matching it to a picture.',core:'Complete the source postcard matching task and begin the weather diary project.',challenge:'Add two accurate weather-and-place sentences to the diary.',closure:'Read one weather sentence from the diary.',pak21:'Project-Based Learning'},
  116:{title:'Creativity — Beach Story Role-Play',task:'Listen and act out the source sequence, listen again and number the pictures, read and number the story sentences, then act it out with a friend.',induction:'Show the six action pictures on Student’s Book p. 116 and ask pupils to predict the first two events.',support:'Act one teacher-modelled event at a time and use the pictures to sequence meaning.',core:'Complete the source listening/acting, picture-numbering and sentence-numbering tasks, then role-play with a partner.',challenge:'Reread and sequence the story independently, then perform it with clear actions and key phrases.',closure:'State or act one event from the sequence.',pak21:'Role Play'},
  117:{title:'Quiz Time — At the Beach',task:'Complete the eight-item source quiz reviewing beach activities, locations, story details, phonics, countries and weather.',induction:'Scan Student’s Book p. 117 and predict which Unit 9 topics will be reviewed.',support:'Complete the quiz in small chunks and use the visual clue provided for each item.',core:'Complete all source quiz items and check answers against Unit 9 source pages.',challenge:'Explain the evidence for three answers and correct one error after peer checking.',closure:'Share one quiz answer and the clue used.',pak21:'Quiz-Quiz-Trade'}
};

const OUTCOMES={
  w32s1:{o:'recognise and reproduce at least six familiar beach-activity words or phrases intelligibly during the source listening and chant task',c:'Pupils correctly identify and say at least six source items from Student’s Book p. 106.'},
  w32s2:{o:'produce at least two short supported spoken statements while taking part in the source beach-activity task',c:'Pupils give at least two understandable source-based statements; the personal-information LS/page pairing remains under review.'},
  w32s3:{o:'sound out at least four selected familiar Unit 9 words with teacher support while completing the source suggestion task',c:'Pupils sound out at least four selected source words; the phonics LS/page pairing for Student’s Book p. 107 remains under review.'},
  w32s4:{o:'connect at least two familiar source words or phrases with a basic coordinating conjunction in a supported response',c:'Pupils produce at least two connected source-based phrases; the Writing LS/page pairing for Student’s Book p. 107 remains under review.'},
  w33s1:{o:'understand the main idea of the holiday song and identify at least three supporting activity details',c:'Pupils state the main idea and identify at least three correct details from Student’s Book p. 108.'},
  w33s2:{o:'ask at least two supported questions while discussing the source holiday-song pictures',c:'Pupils complete two supported question exchanges; the personal-information LS/page pairing remains under review.'},
  w33s3:{o:'understand the main idea of at least four simple location sentences and match them to the correct source pictures',c:'Pupils correctly interpret at least four location sentences from Student’s Book p. 109.'},
  w33s4:{o:'produce at least three guided source-based sentences with appropriate capital letters and full stops',c:'Pupils produce three guided sentences; the page itself is primarily oral/listening, so LS/page alignment remains under review.'},
  w35s1:{o:'understand at least three specific details from the picture story while listening with visual support',c:'Pupils identify at least three correct story details from Student’s Book p. 110.'},
  w35s2:{o:'give a short supported sequence of three source-based actions when retelling or acting the story',c:'Pupils give three actions in a logical sequence; the instructions LS/page pairing for Student’s Book p. 111 remains under review.'},
  w35s3:{o:'understand at least three specific details from the country descriptions and match them to the correct pictures',c:'Pupils identify at least three correct details from Student’s Book p. 112.'},
  w35s4:{o:'spell at least six familiar source words accurately while recording details from the beach-picture task',c:'Pupils spell at least six familiar source words accurately; the Writing LS/page pairing for Student’s Book p. 113 remains under review.'},
  w36s1:{o:'identify at least three specific weather-and-country details while using the source weather map',c:'Pupils identify at least three accurate weather-and-country details; the narrative LS/page pairing remains under review.'},
  w36s2:{o:'give at least three simple source-based descriptions of places or weather while discussing the postcards and diary',c:'Pupils give at least three understandable descriptions; the objects-description LS/page pairing remains under review.'},
  w36s3:{o:'reread source sentences to confirm meaning and correctly sequence at least four events from the creativity story',c:'Pupils correctly sequence at least four story events after rereading Student’s Book p. 116.'},
  w36s4:{o:'complete the source review and produce at least two simple review sentences based on Unit 9 content',c:'Pupils complete at least six of eight quiz items correctly; the plan-draft-write LS/page pairing for Student’s Book p. 117 remains under review.'}
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
  const mk=(tier,text)=>[step(`en2-u9-${md}-${tier}`,tier==='s'?'Support':tier==='c'?'Source Task':'Challenge',text,sb,tier==='s'?'Guided Practice':tier==='c'?src.pak21:'Independent Challenge')];
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
    week34Policy:'No Unit 9 runtime route is created for W34 because the supplied source-first draft contains no W34 Mapping_ID records.',
    dskpAudit:'A standalone Year 2 DSKP file was not found in the available Library during this audit; Year 1/Year 3 DSKP files are not substituted. LS wording is preserved from the supplied Year 2 RPT/draft pending teacher review.',
    reviewPolicy:'This runtime source blueprint does not mark Lesson Mapping as verified; teacher review remains required.'
  };
  return{
    method:'Source-first English Year 2 Unit 9 using RPT + exact Super Minds 1 Student’s Book task',
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
    topic:'Unit 9: At the Beach',
    setInduksi:src.induction,
    inductionData:{name:'Source Induction',text:src.induction,bbm:sb,pak21:'Think-Pair-Share'},
    bbmList:bbm,
    groupBbm:{support:bbm.join('; '),core:bbm.join('; '),challenge:bbm.join('; ')},
    pakDetail:`Lesson content is locked to the actual task on ${sb}. Activity Library may vary delivery only and must not determine lesson content. Workbook p. ${p} is an optional page anchor only; Workbook activity content is not invented.${alignReview?' '+REVIEW_NOTE:''}`,
    librarySteps:{support:mk('s',src.support),core:mk('c',src.core),challenge:mk('h',src.challenge)},
    diffSupport:'Use the same Student’s Book source task with visual prompts, modelling, sentence frames or reduced response load.',
    diffCore:'Complete the actual Student’s Book task and produce evidence that can be checked directly against the source.',
    diffChallenge:'Complete the same source task more independently and add one accurate response, explanation, comparison or performance using source language.',
    diffSupportAct:src.support,
    diffCoreAct:src.core,
    diffChallengeAct:src.challenge,
    pbdEvidence:{
      method:'Observation + source-task response/product',
      evidence:`Check the pupil response directly against ${sb} and the source instruction. Workbook content is not assumed.${alignReview?' LS/page alignment remains flagged for teacher review.':''}`,
      criterion:pc.criteria
    },
    penutup:src.closure,
    _runtime_english_year2_source_blueprint:true,
    _runtime_english_year2_unit9_mode:md,
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
    _runtime_english_year2_unit9_mode:mode(out),
    _runtime_english_year2_mapping_review_required:true,
    _runtime_english_year2_mapping_status:'DERIVED_NEEDS_TEACHER_REVIEW',
    _runtime_english_year2_alignment_review_required:needsAlignmentReview(out)
  };
};

const originalPedagogy=window.buildSourceAwarePedagogy;
if(typeof originalPedagogy==='function')window.buildSourceAwarePedagogy=function(map,ev,built){
  const out=blueprint(map);return out||originalPedagogy(map,ev,built);
};

window.englishYear2Unit9SourceBlueprintMode=mode;
window.englishYear2Unit9SourceBlueprint=blueprint;
})();