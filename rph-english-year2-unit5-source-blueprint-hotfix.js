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
  '1.1.1@58|W4|S1':'w4s1','2.1.1@58|W4|S2':'w4s2','3.1.1@59|W4|S3':'w4s3','4.2.1@59|W4|S4':'w4s4',
  '1.2.1@60|W5|S1':'w5s1','2.1.2@60|W5|S2':'w5s2','3.1.2@61|W5|S3':'w5s3','4.2.3@61|W5|S4':'w5s4',
  '1.2.2@62|W6|S1':'w6s1','2.1.3@62|W6|S2':'w6s2','3.1.3@63|W6|S3':'w6s3','4.2.5@63|W6|S4':'w6s4',
  '1.2.3@64|W8|S1':'w8s1','2.2.2@64|W8|S2':'w8s2','3.2.2@65|W8|S3':'w8s3','4.3.1@65|W8|S4':'w8s4',
  '1.2.4@66|W9|S1':'w9s1','2.3.1@67|W9|S2':'w9s2','3.2.3@68|W9|S3':'w9s3','4.3.2@69|W9|S4':'w9s4'
};

const PAGE_TASKS={
  58:{
    title:'Free Time — Days of the Week',
    task:'Listen and look, then listen and say the days of the week; listen and chant.',
    induction:'Show the weekly timetable on Student’s Book p. 58. Pupils identify familiar days before listening.',
    support:'Point to each day in the timetable, listen and repeat the day words with teacher modelling.',
    core:'Complete the Student’s Book tasks: listen and look, listen and say the day words, then listen and chant.',
    challenge:'Repeat the chant more independently and identify which days are school days and which are weekend days from the source.',
    closure:'Say two days of the week and one activity shown or mentioned on the page.',
    pak21:'Think-Pair-Share'
  },
  59:{
    title:'Free Time Activities',
    task:'Listen and stick; listen and say the grammar model; ask and answer about weekly activities.',
    induction:'Show the activity pictures on Student’s Book p. 59. Pupils predict one activity and the day it may happen.',
    support:'Use the model “I … on Mondays.” and a day/activity word bank while completing the page task.',
    core:'Complete the Student’s Book sequence: listen and stick, listen and say the model, then ask and answer with a partner.',
    challenge:'Ask and answer about two different days and activities using the page model without reading the full prompt.',
    closure:'Give one complete sentence linking an activity to a day.',
    pak21:'Pair Interview'
  },
  60:{
    title:'A Busy Week',
    task:'Listen and sing; point to the pictures and say the day of the week.',
    induction:'Show two activity pictures from Student’s Book p. 60 and ask pupils to predict the matching days.',
    support:'Point to the pictures as the song is played and repeat the day/activity pairs after the teacher.',
    core:'Listen and sing the source song, then point to the pictures and say the correct day of the week.',
    challenge:'Recall two activity-and-day pairs from the song without looking at the written lines.',
    closure:'State one activity and its matching day from the song.',
    pak21:'Think-Pair-Share'
  },
  61:{
    title:'Weekend Activities',
    task:'Listen and circle the answer; listen and say the yes/no question model; play the question game.',
    induction:'Show the TV and computer-game pictures on Student’s Book p. 61. Pupils predict a yes/no question.',
    support:'Use question cards and the model “Do you … at the weekend?” with Yes, I do / No, I don’t.',
    core:'Listen and circle the answers, practise the grammar model, then play the source question game.',
    challenge:'Ask two classmates different weekend questions and respond using the source yes/no pattern.',
    closure:'Perform one complete question-and-answer exchange.',
    pak21:'Question Game'
  },
  62:{
    title:'We’re Lost!',
    task:'Listen to and follow the picture story, identifying the problem, speakers and useful expressions.',
    induction:'Show the first story panel on Student’s Book p. 62 and ask pupils to predict the problem.',
    support:'Follow the numbered panels and point to the speaker while the story is heard or read.',
    core:'Listen to and follow the source story, identify what happens and use the expressions shown in the panels.',
    challenge:'Retell the main event in two supported sentences and identify one expression for asking for or offering help.',
    closure:'State the story problem and one useful expression from the page.',
    pak21:'Think-Pair-Share'
  },
  63:{
    title:'Story Check and Phonics',
    task:'Choose the correct sentence from the picture, find who says a line in the story, then listen and say the phonics sentence.',
    induction:'Show the balance picture on Student’s Book p. 63. Pupils choose which short sentence best matches the visual.',
    support:'Choose from the four printed options with visual clues and repeat the phonics line in chunks.',
    core:'Complete the source checks: choose the correct sentence, find who says the quoted line, then listen and say the phonics sentence.',
    challenge:'Explain one visual clue that supports an answer and reproduce the phonics sentence clearly.',
    closure:'Give one correct source sentence and the visual clue that supports it.',
    pak21:'Think-Pair-Share'
  },
  64:{
    title:'Listening Skills — Mark’s School',
    task:'Look at the school picture, listen and write a name or a number for each question.',
    induction:'Study the school picture on Student’s Book p. 64 and classify sample answers as either a name or a number.',
    support:'Mark each item as “name” or “number” before listening and use the picture to locate likely information.',
    core:'Look at the picture, listen and write the required name or number for the source questions.',
    challenge:'After answering, point to one visual detail that helps confirm a response.',
    closure:'Share one answer and state whether the question required a name or a number.',
    pak21:'Check-Pair-Compare'
  },
  65:{
    title:'My Perfect Week',
    task:'Read and say the poem, then write a personalised “My perfect week” poem.',
    induction:'Look at the activity pictures on Student’s Book p. 65 and predict which day/activity pairs may appear in the poem.',
    support:'Read the poem line by line and complete one personalised line using the printed frame.',
    core:'Read and say the source poem, identify activity-day details, then write a personalised version using the page frame.',
    challenge:'Add extra accurate lines for different days while keeping the same simple pattern.',
    closure:'Read one personalised line aloud.',
    pak21:'Read-Pair-Share'
  },
  66:{
    title:'I’m Healthy!',
    task:'Listen and read the healthy-life poster, ask and answer, then classify the pictures as healthy or unhealthy.',
    induction:'Show the healthy-life poster on Student’s Book p. 66. Pupils name one healthy action they can see.',
    support:'Use the poster phrases to answer one question and match one picture to healthy or unhealthy.',
    core:'Listen and read, ask and answer the source questions, then draw lines to classify the pictures as healthy or unhealthy.',
    challenge:'Give one simple reason for a healthy/unhealthy classification using language from the page.',
    closure:'State one healthy habit from the source.',
    pak21:'Think-Pair-Share'
  },
  67:{
    title:'Class Survey — Free Time',
    task:'Ask and answer the class survey, tick the boxes, make a bar chart and show it to friends.',
    induction:'Look at the survey table on Student’s Book p. 67 and predict which activity may get the most responses.',
    support:'Ask one survey question to a partner and record the answer in the correct box.',
    core:'Carry out the source class survey, record responses, make the bar chart and show the result to friends.',
    challenge:'Present two survey findings and make one simple comparison between activities.',
    closure:'Report one survey result in a complete sentence.',
    pak21:'Class Survey'
  },
  68:{
    title:'Do That! — Instructions',
    task:'Listen and act out, number the pictures, read and number the story sentences, then listen to a friend and act out.',
    induction:'Show two action pictures on Student’s Book p. 68 and ask pupils to match each with a likely instruction.',
    support:'Match one printed instruction to its picture and act it out with teacher modelling.',
    core:'Complete the source sequence: listen and act, number the pictures, read and number the story sentences, then follow a friend’s instruction.',
    challenge:'Give two source-style instructions to a partner and check that the actions match.',
    closure:'Say one instruction and demonstrate the matching action.',
    pak21:'Role Play'
  },
  69:{
    title:'Our Week — Revision Poster',
    task:'Make an “Our week” poster by writing the days and adding weekly activities, then ask and answer about the posters.',
    induction:'Look at the sample poster on Student’s Book p. 69 and identify the information each entry contains.',
    support:'Write two days and add one supported activity for each using the sample as a model.',
    core:'Complete the source poster task, then look at the posters and ask and answer about the day for each activity.',
    challenge:'Ask and answer three poster questions without using the printed dialogue frame.',
    closure:'Share one poster entry and answer one partner question about it.',
    pak21:'Gallery Walk'
  }
};

const OUTCOMES={
  w4s1:{o:'recognise and reproduce at least five day-of-the-week words intelligibly while completing the listening and chant task',c:'Pupils correctly identify and say at least five day words from Student’s Book p. 58.'},
  w4s2:{o:'give at least two simple spoken responses about days or weekly activities using the language on the page',c:'Pupils give at least two relevant spoken responses using a day and/or activity from Student’s Book p. 58.'},
  w4s3:{o:'recognise and read at least four familiar printed day or activity words in the page task',c:'Pupils correctly identify and read at least four familiar words while completing Student’s Book p. 59.'},
  w4s4:{o:'write at least two simple supported responses about a day and weekly activity using the page model',c:'Pupils write at least two understandable day/activity responses that follow the model on Student’s Book p. 59.'},
  w5s1:{o:'understand the main idea of the weekly-activities song and match at least three activities to the correct days',c:'Pupils identify the weekly-routine idea and correctly match at least three activity-day pairs from Student’s Book p. 60.'},
  w5s2:{o:'ask and respond about at least two weekly activities or days using supported language from the source',c:'Pupils complete at least two relevant spoken exchanges about activities and days using Student’s Book p. 60 language.'},
  w5s3:{o:'recognise at least three familiar printed words or question patterns while completing the weekend activity task',c:'Pupils correctly identify at least three familiar words or patterns on Student’s Book p. 61.'},
  w5s4:{o:'write at least two basic weekend or activity responses using the yes/no question pattern as support',c:'Pupils produce at least two understandable written responses that fit the weekend context on Student’s Book p. 61.'},
  w6s1:{o:'understand at least two specific details from the “We’re Lost!” picture story',c:'Pupils identify at least two correct story details that can be checked against Student’s Book p. 62.'},
  w6s2:{o:'express at least one basic response about the story problem or characters and support it with one source detail',c:'Pupils give one relevant spoken response and one supporting detail from Student’s Book p. 62.'},
  w6s3:{o:'read selected story words and reproduce the phonics sentence with support',c:'Pupils complete the page check and say the phonics sentence intelligibly using Student’s Book p. 63.'},
  w6s4:{o:'connect familiar words or names using “and” in at least two short written combinations linked to the source task',c:'Pupils write at least two correct combinations using “and” and familiar language from Student’s Book p. 63.'},
  w8s1:{o:'understand specific information in the supported listening task and record at least four correct names or numbers',c:'Pupils write at least four correct names or numbers from the listening task on Student’s Book p. 64.'},
  w8s2:{o:'use a suitable fixed phrase to ask for attention or help during a paired source task',c:'Pupils use at least one suitable fixed phrase for attention/help and respond appropriately during the Student’s Book p. 64 task.'},
  w8s3:{o:'read the poem and identify at least three correct activity-day details',c:'Pupils identify at least three details that can be pointed to in the poem on Student’s Book p. 65.'},
  w8s4:{o:'use capital letters and full stops appropriately in at least three personalised poem lines',c:'Pupils write at least three understandable lines with appropriate capital letters and full stops based on Student’s Book p. 65.'},
  w9s1:{o:'respond correctly to at least three supported questions, instructions or details in the healthy-life activity',c:'Pupils give at least three responses that match the listening/reading and picture task on Student’s Book p. 66.'},
  w9s2:{o:'present at least two simple class-survey findings to a small group or the class',c:'Pupils report at least two findings that match their survey record or bar chart from Student’s Book p. 67.'},
  w9s3:{o:'reread the printed instructions and story sentences to determine meaning and sequence at least four items correctly',c:'Pupils correctly match or number at least four items after rereading Student’s Book p. 68.'},
  w9s4:{o:'spell at least five familiar day or activity words accurately while producing the “Our week” poster',c:'Pupils spell at least five familiar source words accurately and complete a poster entry that matches Student’s Book p. 69.'}
};

function mode(m){
  if(subjectKey(m)!=='en'||year(m)!==2)return'';
  return ROUTES[routeKey(m)]||'';
}
function outcome(m){return OUTCOMES[mode(m)]||null}
function pair(m){
  const x=outcome(m);
  return x?{
    objective:`By the end of the lesson, pupils can ${x.o}.`,
    criteria:x.c
  }:null;
}
function blueprint(m){
  const md=mode(m),pc=pair(m);
  if(!md||!pc)return null;
  const p=page(m),src=PAGE_TASKS[p];
  if(!src)return null;
  const sb=`Super Minds 1 Student’s Book p. ${p}`;
  const wb=`Super Minds 1 Workbook p. ${p} (optional page anchor only)`;
  const bbm=[sb,wb,'RPT English Year 2 (Kumpulan B)'];
  const mk=(tier,text)=>[step(
    `en2-u5-${md}-${tier}`,
    tier==='s'?'Support':tier==='c'?'Source Task':'Challenge',
    text,
    sb,
    tier==='s'?'Guided Practice':tier==='c'?src.pak21:'Independent Challenge'
  )];
  const provenance={
    route:routeKey(m),
    rpt:'RPT ENGLISH YEAR 2 (SK) 2025-2026 by RozayusAcademy (Kump B).docx',
    mappingDraft:'RPT_English_Year2_2025-2026_KumpulanB_4Sesi_SourceFirst_DRAFT.docx',
    textbook:'190_1- Super Minds 1. Student’s Book_2015 -130p.pdf',
    textbookAnchor:sb,
    workbookAnchor:wb,
    mappingStatus:'DERIVED_NEEDS_TEACHER_REVIEW',
    reviewPolicy:'This runtime source blueprint does not mark Lesson Mapping as verified; teacher review remains required.'
  };
  return{
    method:'Source-first English Year 2 Unit 5 using RPT + exact Super Minds 1 Student’s Book task',
    source:'RPT English Year 2 + Super Minds 1 Student’s Book',
    provenance,
    mappingStatus:'DERIVED_NEEDS_TEACHER_REVIEW',
    reviewRequired:true,
    anchor:`${src.title} — ${sb}`,
    kind:'source_task',
    exactSourceTask:src.task,
    mainLs:mainLs(m),
    page:sb,
    workbookReference:wb,
    topic:'Unit 5: Free Time',
    setInduksi:src.induction,
    inductionData:{name:'Source Induction',text:src.induction,bbm:sb,pak21:'Think-Pair-Share'},
    bbmList:bbm,
    groupBbm:{support:bbm.join('; '),core:bbm.join('; '),challenge:bbm.join('; ')},
    pakDetail:`Lesson content is locked to the exact task on ${sb}. Activity Library may vary delivery only and must not determine lesson content. Workbook p. ${p} is an optional page anchor only; Workbook activity content is not invented.`,
    librarySteps:{support:mk('s',src.support),core:mk('c',src.core),challenge:mk('h',src.challenge)},
    diffSupport:'Use the same Student’s Book source task with teacher modelling, visual prompts, sentence frames or reduced response load.',
    diffCore:'Complete the actual Student’s Book task and produce evidence that can be checked directly against the source.',
    diffChallenge:'Complete the same source task more independently and add one accurate response, explanation, comparison or performance using source language.',
    diffSupportAct:src.support,
    diffCoreAct:src.core,
    diffChallengeAct:src.challenge,
    pbdEvidence:{
      method:'Observation + source-task response/product',
      evidence:`Check the pupil’s listening, speaking, reading or writing response directly against ${sb} and the source instruction. Workbook content is not assumed.`,
      criterion:pc.criteria
    },
    penutup:src.closure,
    _runtime_english_year2_source_blueprint:true,
    _runtime_english_year2_unit5_mode:md,
    _runtime_english_year2_mapping_review_required:true,
    _runtime_english_year2_mapping_status:'DERIVED_NEEDS_TEACHER_REVIEW'
  };
}

const originalEffective=window.effectiveRphLessonMap;
if(typeof originalEffective==='function')window.effectiveRphLessonMap=function(map,...args){
  const out=originalEffective.call(this,map,...args)||map;
  const pc=pair(out);
  if(!pc)return out;
  return{
    ...out,
    objective:pc.objective,
    success_criteria:pc.criteria,
    _runtime_english_year2_source_blueprint:true,
    _runtime_english_year2_unit5_mode:mode(out),
    _runtime_english_year2_mapping_review_required:true,
    _runtime_english_year2_mapping_status:'DERIVED_NEEDS_TEACHER_REVIEW'
  };
};

const originalPedagogy=window.buildSourceAwarePedagogy;
if(typeof originalPedagogy==='function')window.buildSourceAwarePedagogy=function(map,ev,built){
  const out=blueprint(map);
  return out||originalPedagogy(map,ev,built);
};

window.englishYear2Unit5SourceBlueprintMode=mode;
window.englishYear2Unit5SourceBlueprint=blueprint;
})();