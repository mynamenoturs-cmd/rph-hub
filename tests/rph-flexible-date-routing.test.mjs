import assert from 'node:assert/strict';
import {createRequire} from 'node:module';

const require=createRequire(import.meta.url);
const mod=require('../rph-flexible-date-routing-hotfix.js');

assert.equal(mod.shouldPreserveManualWeek('manual',29),true);
assert.equal(mod.shouldPreserveManualWeek('rpt-date',29),false);

const maps=[
  {id:'s1',session_no:1,verification_status:'verified',blocked:false},
  {id:'s2',session_no:2,verification_status:'verified',blocked:false}
];

assert.equal(mod.selectMapPure(maps,'s2',1)?.id,'s2','manual session choice must win over date/timetable route');
assert.equal(mod.selectMapPure(maps,'',1)?.id,'s1','timetable may still suggest a session when teacher has not chosen one');
assert.equal(mod.selectMapPure(maps,'',null),null,'multiple verified sessions require an explicit choice when there is no route suggestion');
assert.equal(mod.selectMapPure([maps[1]],'',null)?.id,'s2','a single verified session may auto-select');

const blocks=mod.mergeTeachingBlocks([
  {id:'a',class_id:'c',subject_id:'s',day_of_week:3,start_time:'14:30',end_time:'15:00'},
  {id:'b',class_id:'c',subject_id:'s',day_of_week:3,start_time:'15:00',end_time:'15:30'},
  {id:'c',class_id:'c',subject_id:'s',day_of_week:5,start_time:'10:00',end_time:'10:30'}
]);

assert.equal(blocks.length,2,'adjacent timetable periods must merge into one teaching session');
assert.equal(blocks[0].start_time,'14:30');
assert.equal(blocks[0].end_time,'15:30');
assert.equal(mod.routeForMap({session_no:2},blocks).entry.id,'c','session ordinal must follow the weekly timetable, not the chosen calendar date');

console.log('RPH flexible-date routing: PASS');
