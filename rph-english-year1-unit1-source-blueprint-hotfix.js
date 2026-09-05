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
  '1.1.1@10|W10|S1':'w10s1','2.1.1@10|W10|S2':'w10s2','3.1.2@10|W10|S3':'w10s3','4.2.2@11|W10|S4':'w10s4','5.1.1@11|W10|S5':'w10s5',
  '1.2.1@12|W11|S1':'w11s1','2.1.2@12|W11|S2':'w11s2','3.1.3@12|W11|S3':'w11s3','4.2.4@13|W11|S4':'w11s4','5.1.2@13|W11|S5':'w11s5',
  '1.2.2@14|W12|S1':'w12s1','2.1.4@14|W12|S2':'w12s2','3.1.4@14|W12|S3':'w12s3','4.2.5@15|W12|S4':'w12s4','5.2.1@15|W12|S5':'w12s5',
  '1.2.3@16|W13|S1':'w13s1','2.1.5@16|W13|S2':'w13s2','3.2.1@16|W13|S3':'w13s3','4.3.1@17|W13|S4':'w13s4','5.3.1@17|W13|S5':'w13s5',
  '1.2.4@18|W14|S1':'w14s1','2.2.2@18|W14|S2':'w14s2','3.2.2@18|W14|S3':'w14s3','4.3.2@19|W14|S4':'w14s4','5.1.1@19|W14|S5':'w14s5',
  '1.2.5@20|W15|S1':'w15s1','2.1.1@20|W15|S2':'w15s2','3.2.4@20|W15|S3':'w15s3','4.2.2@21|W15|S4':'w15s4','5.1.2@21|W15|S5':'w15s5'
};

const CONDITIONAL=new Set([
  '1.2.5@20|W15|S1','2.1.1@20|W15|S2','3.2.4@20|W15|S3','4.2.2@21|W15|S4','5.1.2@21|W15|S5'
]);

const ALIGNMENT_REVIEW=new Set([
  '2.1.1@10|W10|S2','3.1.2@10|W10|S3','4.2.2@11|W10|S4','5.1.1@11|W10|S5',
  '2.1.2@12|W11|S2','3.1.3@12|W11|S3','5.1.2@13|W11|S5',
  '2.1.4@14|W12|S2','3.1.4@14|W12|S3','4.2.5@15|W12|S4',
  '1.2.3@16|W13|S1','2.1.5@16|W13|S2','3.2.1@16|W13|S3','4.3.1@17|W13|S4',
  '1.2.4@18|W14|S1','2.2.2@18|W14|S2','4.3.2@19|W14|S4','5.1.1@19|W14|S5',
  '1.2.5@20|W15|S1','2.1.1@20|W15|S2','3.2.4@20|W15|S3','4.2.2@21|W15|S4','5.1.2@21|W15|S5'
]);
const REVIEW_NOTE='The LS/page pairing is not a direct match to the dominant Student’s Book task. Preserve the actual source task and keep this route available for teacher review instead of fabricating a different activity.';

const PAGE_TASKS={
  10:{title:'At School — Classroom Objects',task:'Listen and look at the classroom scene, listen and say the nine school-object words, then perform the source chant.',induction:'Show the classroom scene on Student’s Book p. 10 and ask pupils to point to two school objects they already know.',support:'Point to each labelled school object, listen and repeat in short chunks with teacher modelling.',core:'Complete the source listen-and-look, word-repetition and classroom-object chant tasks.',challenge:'Identify all nine labelled objects and use at least four accurately in short oral phrases.',closure:'Name three school objects from the page.',pak21:'Listen-Pair-Repeat'},
  11:{title:'At School — Questions and Short Answers',task:'Listen and number the pictures, practise the printed question-and-short-answer model, then play the source guessing game.',induction:'Show one hidden-object picture on Student’s Book p. 11 and ask pupils to predict the object.',support:'Use the printed “What’s this?” and “Is it a …?” frames before taking a turn.',core:'Complete the source listening/numbering, grammar-focus and guessing-game tasks.',challenge:'Conduct four accurate object-guessing exchanges without reading the full model.',closure:'Perform one complete question-and-short-answer exchange.',pak21:'Guessing Game'},
  12:{title:'At School — School Things Song',task:'Listen to and sing the school-things song, then look at Joe’s desk and draw lines from the school things to the correct desk.',induction:'Show the four desks on Student’s Book p. 12 and ask which one looks untidy.',support:'Track the school objects in the picture while listening and repeat short song phrases before singing.',core:'Complete the source song and desk-matching task.',challenge:'Recall four correct school-object details from the song or desk pictures.',closure:'State one school object heard in the song and where it appears.',pak21:'Sing-and-Match'},
  13:{title:'At School — Classroom Instructions',task:'Listen and stick the correct school-object words into the four classroom instructions, listen and say the imperative models, then play the source chain game.',induction:'Show the four classroom instruction pictures on Student’s Book p. 13 and ask pupils what each pupil is being asked to do.',support:'Act out one instruction at a time and use the printed object-word bank before completing the blanks.',core:'Complete the source listen-and-stick task, practise the imperative model and play the chain game.',challenge:'Give and follow four accurate classroom instructions using source vocabulary.',closure:'Give one classroom instruction for a partner to follow.',pak21:'Chain Game'},
  14:{title:'Watch Out, Flash! — Story',task:'Listen to and follow the first six panels of the source picture story, identifying the problem, helpful actions and key classroom objects.',induction:'Show the first two story panels on Student’s Book p. 14 and ask pupils what might go wrong.',support:'Follow the numbered panels and point to the speaker and relevant object while listening.',core:'Listen to and follow the source story, identifying key events and specific details.',challenge:'Retell three events in sequence using the picture panels.',closure:'State one event and one school object from the story.',pak21:'Think-Pair-Share'},
  15:{title:'Watch Out, Flash! — Story Check and Phonics',task:'Follow the final story panels, find and circle matching pictures, identify who says the quoted line, then listen to and say the source phonics sentence.',induction:'Show the final two story panels on Student’s Book p. 15 and ask pupils what happens to Flash and the bag.',support:'Use one picture clue at a time for the story check and repeat the phonics sentence in short chunks.',core:'Complete the source story-check, speaker-identification and phonics tasks.',challenge:'Explain three picture matches and reproduce selected target-sound words clearly.',closure:'State one story fact and say one target phonics word.',pak21:'Pair Check'},
  16:{title:'At School — Listening Skills',task:'Listen to descriptions and draw lines matching the five children to the correct desks.',induction:'Study the five desks on Student’s Book p. 16 and identify two visible differences.',support:'Listen for one school-object clue at a time and point to the matching desk before drawing a line.',core:'Complete the source listening-and-matching task for the five pupils and desks.',challenge:'Justify three matches using precise school-object details from the pictures.',closure:'Describe one desk detail used to make a match.',pak21:'Listen-Compare-Check'},
  17:{title:'At School — Reading, Speaking and Writing Skills',task:'Read classroom instructions and circle the correct pictures, ask and answer about numbered school objects, then draw and write a short description of a school bag.',induction:'Show the school-bag model on Student’s Book p. 17 and ask pupils what objects and colours they can see.',support:'Read one instruction at a time, use the numbered picture bank for speaking, and follow the printed bag-description model for writing.',core:'Complete the source reading-picture choice, ask-and-answer and draw-and-write tasks.',challenge:'Write a fuller bag description with at least three accurate object or colour details.',closure:'Read one sentence from the bag description.',pak21:'Read-Pair-Write'},
  18:{title:'Colours — Primary and Secondary Colours',task:'Read and answer questions about primary colours and classroom colours, then read the colour-mixing information to identify secondary colours.',induction:'Show the three paint bottles on Student’s Book p. 18 and ask pupils to name the colours.',support:'Match each question to the relevant picture and use the colour labels before answering.',core:'Complete the source reading-and-answering and colour-mixing reading tasks.',challenge:'Explain how two secondary colours are made using the source diagram.',closure:'Name one primary colour and one secondary colour.',pak21:'Think-Pair-Share'},
  19:{title:'Colours — Art Project',task:'Look at the painting, read and answer questions about primary and secondary colours, think about lighter colour mixing, then complete the source “Make your own picture” project.',induction:'Show the painting on Student’s Book p. 19 and ask pupils to identify two colours they notice first.',support:'Use the printed colour questions and mixing examples before beginning the art task.',core:'Complete the source reading/answering, colour-thinking and make-your-own-picture project.',challenge:'Label or explain at least three colour choices in the finished picture using source concepts.',closure:'Share one colour choice and how it was made or selected.',pak21:'Project-Based Learning'},
  20:{title:'At School — Creativity Sequence',task:'Listen and act out the source action sequence, listen again and number the pictures, read and number the story sentences, then listen to a friend and act out an instruction.',induction:'Show the six action pictures on Student’s Book p. 20 and ask pupils to predict the first action.',support:'Act one teacher-modelled instruction at a time and use the pictures to sequence meaning.',core:'Complete the source listening/acting, picture-numbering, sentence-numbering and partner acting tasks.',challenge:'Sequence all six events independently and perform the instructions clearly with a partner.',closure:'Act out or state one instruction from the sequence.',pak21:'Role Play'},
  21:{title:'Colours at School — Poster Revision',task:'Make the source “Colours at school” poster by writing colour words, finding school-object pictures in different colours, cutting and sticking them, then count and recall coloured school objects.',induction:'Scan Student’s Book p. 21 and ask pupils which school objects they might include on a colours poster.',support:'Use a small set of colour words and school-object pictures before assembling the poster.',core:'Complete the source poster task and the count/colour memory activity.',challenge:'Present the poster using at least four accurate school-object and colour details.',closure:'State the number and colour of one object shown on the poster.',pak21:'Gallery Walk'}
};

const OUTCOMES={
  w10s1:{o:'recognise and reproduce at least six familiar school-object words or target sounds intelligibly during the source listening and chant',c:'Pupils correctly identify and say at least six source school-object words from Student’s Book p. 10.'},
  w10s2:{o:'take part in at least two short supported exchanges about source school objects',c:'Pupils complete two understandable source-based exchanges; the personal-information LS/page pairing remains under review.'},
  w10s3:{o:'sound out at least four selected familiar school-object words with teacher support',c:'Pupils sound out at least four selected source words; the Reading phonics LS/page pairing remains under review.'},
  w10s4:{o:'record or reproduce at least two fixed classroom phrases accurately while using the source guessing task',c:'Pupils produce at least two accurate fixed phrases; the greet/thanks Writing LS/page pairing remains under review.'},
  w10s5:{o:'respond appropriately to at least three source object-guessing prompts using actions or short answers',c:'Pupils respond to at least three source prompts; the Language Arts chant/rhyme LS/page pairing remains under review.'},
  w11s1:{o:'understand the main idea of the school-things song and identify at least three supporting details',c:'Pupils state the main idea and identify at least three correct details from Student’s Book p. 12.'},
  w11s2:{o:'ask at least two supported questions while discussing source school-object pictures',c:'Pupils complete two supported question exchanges; the personal-information LS/page pairing remains under review.'},
  w11s3:{o:'blend at least four selected familiar school-object words with teacher support',c:'Pupils blend at least four selected words; the phonics LS/page pairing for Student’s Book p. 12 remains under review.'},
  w11s4:{o:'name at least four school objects accurately while completing the source classroom-instruction task',c:'Pupils supply at least four accurate object words in or alongside the source task on Student’s Book p. 13.'},
  w11s5:{o:'say at least four classroom instruction phrases intelligibly with suitable rhythm',c:'Pupils say at least four source instruction phrases; the Language Arts song/rhyme LS/page pairing remains under review.'},
  w12s1:{o:'understand at least four specific details from the picture story while listening with visual support',c:'Pupils identify at least four correct story details from Student’s Book p. 14.'},
  w12s2:{o:'use at least two suitable fixed social phrases while discussing or acting the source story',c:'Pupils use at least two understandable fixed phrases; the greet/thanks LS/page pairing is only partially represented and remains under review.'},
  w12s3:{o:'segment at least four selected familiar source words with teacher support',c:'Pupils segment at least four selected words; the explicit phonics task occurs on the following page, so this route remains under review.'},
  w12s4:{o:'produce at least two short connected source-based phrases while completing the story-check task',c:'Pupils produce at least two connected phrases; the Writing LS/page pairing for Student’s Book p. 15 remains under review.'},
  w12s5:{o:'name at least four people, things or actions shown in the source story illustrations',c:'Pupils accurately name at least four source illustration details from Student’s Book p. 15.'},
  w13s1:{o:'identify at least three details from the source listening-and-desk matching task',c:'Pupils correctly match at least three pupils to desks; the narrative LS/page pairing remains under review.'},
  w13s2:{o:'name or describe at least four visible school objects from the source desk pictures',c:'Pupils produce at least four accurate object descriptions; the speaking LS is supported by source visuals but the page task is primarily listening.'},
  w13s3:{o:'state the main idea of the source listening task and identify at least two supporting details',c:'Pupils state the main idea and two details; the Reading LS/page pairing remains under review because Student’s Book p. 16 is primarily listening.'},
  w13s4:{o:'write at least three accurate source-based sentences using the printed bag-description model',c:'Pupils write at least three source-based sentences; the capital-letter LS/page pairing remains under review because personal/place names are not the page focus.'},
  w13s5:{o:'create and present a simple source-based bag drawing and description',c:'Pupils complete the source draw-and-write product and present at least two details intelligibly.'},
  w14s1:{o:'follow at least three source reading prompts correctly while exploring primary and secondary colours',c:'Pupils respond correctly to at least three source prompts; the Listening classroom-instructions LS/page pairing remains under review.'},
  w14s2:{o:'use at least one fixed help or attention phrase appropriately during the source colour task',c:'Pupils use a suitable help/attention phrase when needed; the source page itself does not directly teach this exchange, so alignment remains under review.'},
  w14s3:{o:'understand at least four specific colour details from the source reading and diagrams',c:'Pupils answer at least four source-based colour questions or details correctly from Student’s Book p. 18.'},
  w14s4:{o:'spell at least six familiar colour words accurately while completing or labelling the source art project',c:'Pupils spell at least six familiar colour words accurately; spelling is supporting evidence rather than the dominant page task.'},
  w14s5:{o:'respond creatively to the source art project by completing and sharing a colour picture',c:'Pupils complete and share the source picture; the chant/rhyme/song LS/page pairing remains under review.'},
  w15s1:{o:'respond appropriately to at least three short supported teacher questions about the source creativity sequence',c:'Pupils answer at least three supported questions; this CONDITIONAL route and LS/page pairing remain under review.'},
  w15s2:{o:'give at least two short source-based statements while acting or discussing the creativity sequence',c:'Pupils give at least two understandable statements; this CONDITIONAL personal-information LS/page pairing remains under review.'},
  w15s3:{o:'identify and categorise at least four familiar school words from the source sequence with teacher support',c:'Pupils identify and group at least four source words; this CONDITIONAL picture-dictionary LS/page pairing remains under review.'},
  w15s4:{o:'write at least four accurate colour words while completing the source poster',c:'Pupils write at least four colour words accurately; this CONDITIONAL greet/thanks Writing LS/page pairing remains under review.'},
  w15s5:{o:'present at least four short source-based poster phrases intelligibly',c:'Pupils present at least four source phrases; this CONDITIONAL song/rhyme Language Arts LS/page pairing remains under review.'}
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
  const bbm=[sb,wb,'RPT English Year 1 (Kumpulan B)','DSKP English Year 1'];
  const provenance={
    route:routeKey(m),
    rpt:'RPT_English_Year1_2025-2026_KumpulanB_Murni.docx',
    mapping:'RPT_English_Year1_2025-2026_KumpulanB_Mapping.xlsx',
    dskp:'DSKP KSSR ENGLISH YEAR 1 SK (SEMAKAN 2017).pdf',
    textbook:'190_1- Super Minds 1. Student’s Book_2015 -130p.pdf',
    textbookAnchor:sb,
    workbookAnchor:wb,
    generateFlag:conditional?'CONDITIONAL':'YES',
    alignmentReviewRequired:alignReview,
    alignmentReviewNote:alignReview?REVIEW_NOTE:'',
    partialWeekPolicy:'W15 is a partial teaching week and remains CONDITIONAL; generate only when the class actually meets.',
    civicPolicy:'Civic_Edu month markers remain audit metadata only; no separate civic lesson content is fabricated by this source blueprint.',
    verificationPolicy:'This runtime blueprint does not modify Lesson Mapping or verification status.'
  };
  const mk=(tier,text)=>[step(`en1-u1-${md}-${tier}`,tier==='s'?'Support':tier==='c'?'Source Task':'Challenge',text,sb,tier==='s'?'Guided Practice':tier==='c'?src.pak21:'Independent Challenge')];
  return{
    method:'Source-first English Year 1 Unit 1: At School using RPT + DSKP + exact Super Minds 1 Student’s Book task',
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
    _runtime_english_year1_unit1_mode:md,
    _runtime_english_year1_unit1_source_blueprint:true,
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
    source_evidence:{...(out?.source_evidence||{}),runtime_english_year1_unit1:{source:bp.source,anchor:bp.anchor,source_task:bp.sourceTask,provenance:bp.provenance}},
    _runtime_english_year1_unit1_mode:bp._runtime_english_year1_unit1_mode,
    _runtime_english_year1_unit1_source_blueprint:true,
    _runtime_english_year1_alignment_review_required:bp.alignmentReviewRequired,
    _runtime_english_year1_conditional_route:bp.conditional
  };
};

const originalPedagogy=window.buildSourceAwarePedagogy;
if(typeof originalPedagogy==='function')window.buildSourceAwarePedagogy=function(map,ev,built){
  const out=blueprint(map);return out||originalPedagogy(map,ev,built);
};

window.englishYear1Unit1SourceBlueprint=blueprint;
})();
