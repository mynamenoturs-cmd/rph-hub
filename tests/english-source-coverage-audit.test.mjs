import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const loaderPath=path.join(root,'app-v03334.js');
const loader=fs.readFileSync(loaderPath,'utf8');

const GROUPS={
  y1:[
    'rph-english-year1-friends-source-blueprint-hotfix.js',
    'rph-english-year1-unit1-source-blueprint-hotfix.js',
    'rph-english-year1-unit2-source-blueprint-hotfix.js',
    'rph-english-year1-unit3-source-blueprint-hotfix.js',
    'rph-english-year1-unit4-source-blueprint-hotfix.js',
    'rph-english-year1-revision-source-blueprint-hotfix.js'
  ],
  y2:[
    'rph-english-year2-unit5-source-blueprint-hotfix.js',
    'rph-english-year2-unit6-source-blueprint-hotfix.js',
    'rph-english-year2-unit7-source-blueprint-hotfix.js',
    'rph-english-year2-unit8-source-blueprint-hotfix.js',
    'rph-english-year2-unit9-source-blueprint-hotfix.js'
  ],
  y3:Array.from({length:10},(_,i)=>`rph-english-year3-module${i+1}-source-blueprint-hotfix.js`)
};

const routeBlock=src=>{
  const m=src.match(/const\s+ROUTES\s*=\s*\{([\s\S]*?)\n?\};/);
  assert.ok(m,'ROUTES block must exist');
  return m[1];
};
const routeKeys=src=>[...routeBlock(src).matchAll(/['"]([^'"]+@[^'"]+\|W\d+\|S\d+)['"]\s*:/g)].map(m=>m[1]);
const conditionalKeys=src=>{
  const m=src.match(/const\s+CONDITIONAL\s*=\s*new\s+Set\s*\(\s*\[([\s\S]*?)\]\s*\)/);
  return m?[...m[1].matchAll(/['"]([^'"]+@[^'"]+\|W\d+\|S\d+)['"]/g)].map(x=>x[1]):[];
};
const slot=k=>{
  const m=k.match(/\|W(\d+)\|S(\d+)$/);
  assert.ok(m,`route has valid week/session suffix: ${k}`);
  return `W${Number(m[1])}|S${Number(m[2])}`;
};
const slotsFor=(weeks,sessions)=>weeks.flatMap(w=>sessions.map(s=>`W${w}|S${s}`));
const sorted=x=>[...x].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
const assertSameSet=(actual,expected,label)=>assert.deepEqual(sorted(new Set(actual)),sorted(new Set(expected)),label);
const count=(text,needle)=>text.split(needle).length-1;

const allSources={};
for(const files of Object.values(GROUPS)) for(const f of files){
  const p=path.join(root,f);
  assert.ok(fs.existsSync(p),`source module exists: ${f}`);
  const src=fs.readFileSync(p,'utf8');
  allSources[f]=src;
  assert.equal(count(loader,f),1,`loader contains ${f} exactly once`);
  assert.ok(src.includes('Activity Library may vary delivery only and must not determine lesson content'),`${f}: Activity Library remains delivery-only`);
  assert.ok(src.includes('Workbook activity content is not invented'),`${f}: Workbook content is not invented`);
  assert.ok(!src.includes('Math.random'),`${f}: no Math.random`);
  assert.ok(!/mappingStatus\s*:\s*['"]VERIFIED['"]/.test(src),`${f}: does not force VERIFIED mapping status`);
}

for(const y of ['y1','y2','y3']){
  const seenRoute=new Map(),seenSlot=new Map();
  for(const f of GROUPS[y]) for(const r of routeKeys(allSources[f])){
    assert.ok(!seenRoute.has(r),`${y}: duplicate exact route ${r} in ${seenRoute.get(r)} and ${f}`);
    seenRoute.set(r,f);
    const s=slot(r);
    assert.ok(!seenSlot.has(s),`${y}: overlapping slot ${s} in ${seenSlot.get(s)} and ${f}`);
    seenSlot.set(s,f);
  }
}

const y1Routes=GROUPS.y1.flatMap(f=>routeKeys(allSources[f]));
const y2Routes=GROUPS.y2.flatMap(f=>routeKeys(allSources[f]));
const y3Routes=GROUPS.y3.flatMap(f=>routeKeys(allSources[f]));
assert.equal(y1Routes.length,160,'Year 1 has 160 scheduled source-first routes');
assert.equal(y2Routes.length,120,'Year 2 has 120 source-first routes backed by the supplied draft');
assert.equal(y3Routes.length,175,'Year 3 has 175 scheduled source-first routes');

assertSameSet(y1Routes.map(slot),slotsFor(Array.from({length:33},(_,i)=>i+5).filter(w=>w!==7),[1,2,3,4,5]),'Year 1 covers W5-W37 except W7 exactly');
const y2Weeks=[4,5,6,8,9,...Array.from({length:23},(_,i)=>i+11),35,36];
assertSameSet(y2Routes.map(slot),slotsFor(y2Weeks,[1,2,3,4]),'Year 2 covers only sourced slots; W10/W34/W37 remain intentionally unresolved');
assertSameSet(y3Routes.map(slot),slotsFor(Array.from({length:36},(_,i)=>i+2).filter(w=>w!==7),[1,2,3,4,5]),'Year 3 covers W2-W37 except W7 exactly');

for(const w of [1,2,3,7,10,34,37,38,39,40,41,42]) assert.ok(!y2Routes.map(slot).some(s=>s.startsWith(`W${w}|`)),`Year 2 intentionally has no W${w} auto-route`);
for(const w of [38,39,40,41,42]) assert.ok(!y1Routes.map(slot).some(s=>s.startsWith(`W${w}|`)),`Year 1 has no normal RPH route in W${w}`);
for(const w of [38,39,40,41,42]) assert.ok(!y3Routes.map(slot).some(s=>s.startsWith(`W${w}|`)),`Year 3 has no normal RPH route in W${w}`);

const y1Conditional=GROUPS.y1.flatMap(f=>conditionalKeys(allSources[f]));
const expectedY1Conditional=[...slotsFor([15,16,34],[1,2,3,4,5]),...slotsFor([9],[3,4,5]),...slotsFor([22],[2,3,4,5])];
assertSameSet(y1Conditional.map(slot),expectedY1Conditional,'Year 1 conditional route semantics remain exact');
const y3Conditional=GROUPS.y3.flatMap(f=>conditionalKeys(allSources[f]));
assertSameSet(y3Conditional.map(slot),slotsFor([15,16,28,34],[1,2,3,4,5]),'Year 3 conditional state/partial-week semantics remain exact');

for(let i=5;i<=9;i++) assert.ok(!loader.includes(`rph-english-year1-unit${i}-source-blueprint-hotfix.js`),`Year 1 Unit ${i} remains inactive because it is not scheduled in supplied RPT`);
for(let i=1;i<=4;i++) assert.ok(!loader.includes(`rph-english-year2-unit${i}-source-blueprint-hotfix.js`),`Year 2 Unit ${i} is not fabricated without a source-first route set`);

const englishFiles=[...GROUPS.y2,...GROUPS.y1,...GROUPS.y3];
let previous=-1;
for(const f of englishFiles){
  const at=loader.indexOf(f);
  assert.ok(at>previous,`loader order is stable at ${f}`);
  previous=at;
}
const fallback=loader.indexOf('rph-english-quality-hotfix.js');
assert.ok(fallback>previous,'English quality fallback loads after all source-first English modules');

console.log(`English source coverage audit passed: Y1 ${y1Routes.length} routes; Y2 ${y2Routes.length} routes; Y3 ${y3Routes.length} routes; Y1 conditional ${new Set(y1Conditional.map(slot)).size}; Y3 conditional ${new Set(y3Conditional.map(slot)).size}.`);
