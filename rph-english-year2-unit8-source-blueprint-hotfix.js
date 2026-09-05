(function(){
'use strict';
const subjectKey=m=>{try{return window.rphSubjectKey?.(m?.subject_id)||''}catch{return''}};
const mainLs=m=>String(m?.source_evidence?.meta?.main_ls||m?.source_evidence?.meta?.main_sp||m?.learning_standard||m?.ls||String(m?.sp||'').split(',')[0]||'').trim();
const year=m=>Number(m?.year||0)||0,week=m=>Number(m?.week_no||m?.week||0)||0,session=m=>Number(m?.session_no||m?.session||0)||0,page=m=>Number(m?.textbook_page_start||0)||0;
const routeKey=m=>`${mainLs(m)}@${page(m)}|W${week(m)}|S${session(m)}`;
const step=(key,name,text,bbm,pak21)=>({key,name,text,bbm,pak21,phase:'source'});
const ROUTES={
  '1.2.1@94|W23|S1':'w23s1', '2.1.1@94|W23|S2':'w23s2', '3.2.2@94|W23|S3':'w23s3', '4.2.4@95|W23|S4':'w23s4',
  '1.2.2@95|W24|S1':'w24s1', '2.1.4@95|W24|S2':'w24s2', '3.2.3@96|W24|S3':'w24s3', '4.3.1@96|W24|S4':'w24s4',
  '1.2.3@96|W25|S1':'w25s1', '2.1.5@97|W25|S2':'w25s2', '3.2.4@97|W25|S3':'w25s3', '4.3.2@97|W25|S4':'w25s4',
  '1.2.5@98|W26|S1':'w26s1', '2.2.1@98|W26|S2':'w26s2', '3.2.2@98|W26|S3':'w26s3', '4.3.3@99|W26|S4':'w26s4',
  '1.3.1@99|W27|S1':'w27s1', '2.2.2@99|W27|S2':'w27s2', '3.2.3@100|W27|S3':'w27s3', '4.2.4@100|W27|S4':'w27s4',
  '1.2.1@100|W28|S1':'w28s1', '2.1.1@101|W28|S2':'w28s2', '3.2.4@101|W28|S3':'w28s3', '4.3.1@101|W28|S4':'w28s4',
  '1.2.2@102|W29|S1':'w29s1', '2.1.4@102|W29|S2':'w29s2', '3.2.2@102|W29|S3':'w29s3', '4.3.2@103|W29|S4':'w29s4',
  '1.2.3@103|W30|S1':'w30s1', '2.1.5@103|W30|S2':'w30s2', '3.2.3@104|W30|S3':'w30s3', '4.3.3@104|W30|S4':'w30s4',
  '1.2.5@104|W31|S1':'w31s1', '2.2.1@105|W31|S2':'w31s2', '3.2.4@105|W31|S3':'w31s3', '4.2.4@105|W31|S4':'w31s4'
};
const ALIGNMENT_REVIEW=new Set([
  '1.2.1@94|W23|S1', '2.1.1@94|W23|S2', '3.2.2@94|W23|S3', '4.2.4@95|W23|S4',
  '3.2.3@96|W24|S3', '4.3.1@96|W24|S4', '1.2.3@96|W25|S1', '2.1.5@97|W25|S2',
  '3.2.4@97|W25|S3', '4.3.2@97|W25|S4', '1.2.5@98|W26|S1', '2.2.1@98|W26|S2',
  '4.3.3@99|W26|S4', '1.3.1@99|W27|S1', '2.2.2@99|W27|S2', '3.2.3@100|W27|S3',
  '4.2.4@100|W27|S4', '1.2.1@100|W28|S1', '2.1.1@101|W28|S2', '3.2.4@101|W28|S3',
  '2.1.4@102|W29|S2', '4.3.2@103|W29|S4', '1.2.3@103|W30|S1', '3.2.3@104|W30|S3',
  '1.2.5@104|W31|S1', '2.2.1@105|W31|S2', '3.2.4@105|W31|S3'
]);
const REVIEW_NOTE='The draft LS/page pairing needs teacher review. This runtime blueprint preserves the exact Student’s Book task and does not fabricate a different activity to force LS alignment.';
const PAGE_TASKS={
  94:{title:'The Robot — Body Words',task:'Listen and look at the labelled body parts, listen and say the words, then listen and chant.',sourceObjective:'identify and say at least six body-part words',sourceCriteria:'Pupils correctly identify and say at least six body-part words.',pak21:'Listen-Pair-Repeat'},
  95:{title:'Misty — Can and Can’t',task:'Look and listen to what Misty can do, read and stick the ability statements, practise can/can’t, then make sentences.',sourceObjective:'complete the can/can’t tasks and produce at least three accurate ability statements',sourceCriteria:'Pupils produce at least three accurate ability statements.',pak21:'Pair Share'},
  96:{title:'Who Am I? — Ability Song',task:'Listen and sing the animal-ability song, then listen again and say what the animals can do.',sourceObjective:'identify at least four correct animal abilities',sourceCriteria:'Pupils state at least four correct animal-and-ability combinations.',pak21:'Think-Pair-Share'},
  97:{title:'Can You…? — Ability Questions',task:'Look and say the activities, listen and tick or cross, practise can-questions, then play the action game.',sourceObjective:'complete the listening/action-game tasks and at least three accurate ability exchanges',sourceCriteria:'Pupils complete at least three accurate can-ability exchanges.',pak21:'Action Game'},
  98:{title:'The Problem — Story',task:'Listen to and follow the picture story about building the robot and discovering the problem.',sourceObjective:'identify the robot-building problem and at least three story details',sourceCriteria:'Pupils identify the problem and at least three correct story details.',pak21:'Think-Pair-Share'},
  99:{title:'The Problem — Story Check and Phonics',task:'Follow the end of the story, solve the robot’s jumbled words, identify who says a line, then listen and say the phonics sentence.',sourceObjective:'solve at least three robot words and identify one story detail',sourceCriteria:'Pupils correctly solve at least three robot words and identify one story detail.',pak21:'Pair Check'},
  100:{title:'Skills — Listening and Speaking',task:'Listen and tick the correct ability picture, then ask friends what they can do and record names.',sourceObjective:'complete the listening task and record at least three accurate friend-ability responses',sourceCriteria:'Pupils select the listening answers and record at least three accurate survey responses.',pak21:'Class Survey'},
  101:{title:'Funny Animals — Reading and Writing',task:'Read four funny-animal descriptions and match them to pictures, then draw and write about a funny animal.',sourceObjective:'match at least three descriptions and write at least three sentences about a funny animal',sourceCriteria:'Pupils correctly match at least three descriptions and write at least three source-modelled sentences.',pak21:'Read-Draw-Share'},
  102:{title:'The Skeleton — Listen, Read and Match',task:'Listen and read about skeletons, write the body words, then match animals with their skeletons.',sourceObjective:'write at least four body words and correctly match at least four animal skeletons',sourceCriteria:'Pupils write at least four correct body words and make at least four correct skeleton matches.',pak21:'Check-Pair-Compare'},
  103:{title:'Bones — Read, Find and Build',task:'Read and answer the bone questions, locate the pictured bones in the body, then assemble the skeleton project.',sourceObjective:'answer the bone questions and identify at least four correct body/bone locations',sourceCriteria:'Pupils answer the source questions and identify at least four correct body/bone locations.',pak21:'Collaborative Project'},
  104:{title:'Create That! — Robot Pet',task:'Listen and imagine, draw a picture, write about the picture, then listen to friends and guess.',sourceObjective:'draw a robot pet and write at least three accurate source-modelled sentences',sourceCriteria:'Pupils produce a drawing and at least three understandable source-based sentences.',pak21:'Gallery Share'},
  105:{title:'Our Body — Poster and Memory Game',task:'Make the Our Body poster by finding and adding body-part pictures, then play the memory game.',sourceObjective:'complete the poster and accurately recall at least four body-part or picture details',sourceCriteria:'Pupils complete the poster and recall at least four accurate details during the memory game.',pak21:'Collaborative Poster'}
};
const LS_OUTCOMES={
  '1.2.1':{o:'state the main idea of the source listening/text and give at least two supporting details',c:'Pupils state a relevant main idea and at least two accurate supporting details.'},
  '2.1.1':{o:'give at least two items of very basic personal information using fixed phrases',c:'Pupils give at least two understandable personal-information statements using fixed phrases.'},
  '3.2.2':{o:'identify at least four specific information details from the source sentences or story',c:'Pupils identify at least four correct specific details from the source.'},
  '4.2.4':{o:'name or describe at least four source objects using suitable words from the topic word set',c:'Pupils accurately name or describe at least four source objects.'},
  '1.2.2':{o:'identify at least four specific details from the source listening',c:'Pupils identify at least four correct specific details from the source listening.'},
  '2.1.4':{o:'ask and answer at least three questions about ability using can/can’t',c:'Pupils complete at least three accurate ability exchanges.'},
  '3.2.3':{o:'reread source words or sentences to resolve the meaning of at least three items',c:'Pupils use rereading to explain or correctly respond to at least three source items.'},
  '4.3.1':{o:'write at least three guided source-based sentences using capital letters and full stops appropriately',c:'Pupils write at least three guided sentences with appropriate capital letters and full stops.'},
  '1.2.3':{o:'identify and sequence at least three events from a very short simple narrative',c:'Pupils identify and sequence at least three correct narrative events.'},
  '2.1.5':{o:'describe at least four source objects using suitable familiar words and phrases',c:'Pupils give at least four accurate source-based descriptions.'},
  '3.2.4':{o:'use a picture dictionary to find and categorise at least six Unit 8 words',c:'Pupils find and categorise at least six relevant Unit 8 words using a picture dictionary.'},
  '4.3.2':{o:'spell at least six familiar high-frequency or Unit 8 words accurately in guided writing',c:'Pupils spell at least six familiar words accurately in guided writing.'},
  '1.2.5':{o:'answer at least four short supported questions about the source topic',c:'Pupils answer at least four supported source-based questions accurately.'},
  '2.2.1':{o:'keep a short exchange going using at least three suitable non-verbal responses',c:'Pupils use at least three suitable non-verbal responses during a short exchange.'},
  '4.3.3':{o:'plan and write at least three simple source-based sentences',c:'Pupils plan and write at least three understandable simple sentences.'},
  '1.3.1':{o:'use visual clues to understand at least three spoken messages from the source task',c:'Pupils respond appropriately to at least three spoken messages using visual clues.'},
  '2.2.2':{o:'ask for attention or help appropriately at least twice using one word or a fixed phrase',c:'Pupils use an appropriate help/attention word or fixed phrase at least twice.'}
};
function mode(m){if(subjectKey(m)!=='en'||year(m)!==2)return'';return ROUTES[routeKey(m)]||''}
function needsAlignmentReview(m){return ALIGNMENT_REVIEW.has(routeKey(m))}
function pair(m){if(!mode(m))return null;const p=page(m),src=PAGE_TASKS[p];if(!src)return null;const ls=LS_OUTCOMES[mainLs(m)],review=needsAlignmentReview(m);return review||!ls?{objective:`By the end of the lesson, pupils can ${src.sourceObjective} while completing the exact task on Student’s Book p. ${p}.`,criteria:`${src.sourceCriteria} LS/page alignment remains under teacher review.`}:{objective:`By the end of the lesson, pupils can ${ls.o} while completing the exact task on Student’s Book p. ${p}.`,criteria:`${ls.c} Evidence must come from the exact Student’s Book p. ${p} task.`};}
function blueprint(m){
  const md=mode(m),pc=pair(m);if(!md||!pc)return null;const p=page(m),src=PAGE_TASKS[p];if(!src)return null;
  const sb=`Super Minds 1 Student’s Book p. ${p}`,wb=`Super Minds 1 Workbook p. ${p} (optional page anchor only)`,review=needsAlignmentReview(m),bbm=[sb,wb,'RPT English Year 2 (Kumpulan B)'];
  const induction=`Show ${sb} (${src.title}) and ask pupils to identify one visible clue or familiar word before starting the printed task.`;
  const support=`Complete the same printed task on ${sb} in small chunks with modelling, picture cues and sentence frames; do not replace the source content.`;
  const core=`Complete the exact source task: ${src.task}`;
  const challenge='Complete the same source task more independently, then add one accurate source-based explanation, comparison, sentence or performance.';
  const mk=(tier,text)=>[step(`en2-u8-${md}-${tier}`,tier==='s'?'Support':tier==='c'?'Source Task':'Challenge',text,sb,tier==='s'?'Guided Practice':tier==='c'?src.pak21:'Independent Challenge')];
  const provenance={route:routeKey(m),rpt:'RPT ENGLISH YEAR 2 (SK) 2025-2026 by RozayusAcademy (Kump B).docx',mappingDraft:'RPT_English_Year2_2025-2026_KumpulanB_4Sesi_SourceFirst_DRAFT.docx',textbook:'190_1- Super Minds 1. Student’s Book_2015 -130p.pdf',textbookAnchor:sb,workbookAnchor:wb,mappingStatus:'DERIVED_NEEDS_TEACHER_REVIEW',alignmentReviewRequired:review,alignmentReviewNote:review?REVIEW_NOTE:'',curriculumAudit:'The supplied Year 2 RPT preserves the Year 2 LS wording. A standalone Year 2 DSKP file was not found in the available Library during this audit, so verification remains teacher-review only.',reviewPolicy:'This runtime source blueprint does not mark Lesson Mapping as verified; teacher review remains required.'};
  return{method:'Source-first English Year 2 Unit 8 using RPT + exact Super Minds 1 Student’s Book task',source:'RPT English Year 2 + Super Minds 1 Student’s Book',provenance,mappingStatus:'DERIVED_NEEDS_TEACHER_REVIEW',reviewRequired:true,alignmentReviewRequired:review,alignmentReviewNote:review?REVIEW_NOTE:'',anchor:`${src.title} — ${sb}`,kind:'source_task',exactSourceTask:src.task,mainLs:mainLs(m),page:sb,workbookReference:wb,topic:'Unit 8: The Robot',setInduksi:induction,inductionData:{name:'Source Induction',text:induction,bbm:sb,pak21:'Think-Pair-Share'},bbmList:bbm,groupBbm:{support:bbm.join('; '),core:bbm.join('; '),challenge:bbm.join('; ')},pakDetail:`Lesson content is locked to the exact task on ${sb}. Activity Library may vary delivery only and must not determine lesson content. Workbook p. ${p} is an optional page anchor only; Workbook activity content is not invented.${review?' '+REVIEW_NOTE:''}`,librarySteps:{support:mk('s',support),core:mk('c',core),challenge:mk('h',challenge)},diffSupport:support,diffCore:core,diffChallenge:challenge,diffSupportAct:support,diffCoreAct:core,diffChallengeAct:challenge,pbdEvidence:{method:'Observation + source-task response/product',evidence:`Check the pupil response directly against ${sb} and the printed source instruction. Workbook content is not assumed.${review?' LS/page alignment remains flagged for teacher review.':''}`,criterion:pc.criteria},penutup:`Share one checked response from ${src.title} and state the evidence used.`,_runtime_english_year2_source_blueprint:true,_runtime_english_year2_unit8_mode:md,_runtime_english_year2_mapping_review_required:true,_runtime_english_year2_mapping_status:'DERIVED_NEEDS_TEACHER_REVIEW',_runtime_english_year2_alignment_review_required:review};
}
const originalEffective=window.effectiveRphLessonMap;
if(typeof originalEffective==='function')window.effectiveRphLessonMap=function(map,...args){const out=originalEffective.call(this,map,...args),pc=pair(out);if(!pc)return out;return{...out,objective:pc.objective,success_criteria:pc.criteria,_runtime_english_year2_source_blueprint:true,_runtime_english_year2_unit8_mode:mode(out),_runtime_english_year2_mapping_review_required:true,_runtime_english_year2_mapping_status:'DERIVED_NEEDS_TEACHER_REVIEW',_runtime_english_year2_alignment_review_required:needsAlignmentReview(out)};};
const originalPedagogy=window.buildSourceAwarePedagogy;
if(typeof originalPedagogy==='function')window.buildSourceAwarePedagogy=function(map,ev,built){const out=blueprint(map);return out||originalPedagogy(map,ev,built);};
window.englishYear2Unit8SourceBlueprintMode=mode;window.englishYear2Unit8SourceBlueprint=blueprint;
})();
