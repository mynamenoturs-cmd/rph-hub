import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const source = await fs.readFile(
  new URL('../app-v03334.js', import.meta.url),
  'utf8',
);

const requiredScopes = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.courseworkmaterials',
  'https://www.googleapis.com/auth/classroom.topics.readonly',
];

for (const scope of requiredScopes) {
  assert.ok(source.includes(scope), `Missing required OAuth scope: ${scope}`);
}

assert.ok(source.includes("teacherId:'me'"), 'A separate teacher-course query is required for publish permission');
assert.ok(source.includes("courseStates:'ACTIVE'"), 'Only active Classroom courses should be listed');
assert.ok(source.includes('async function listAccessibleClassrooms'), 'All active courses visible to the account must be listed');
assert.ok(source.includes("canPublish:teacherIds.has(x.id)"), 'Teacher courses must be distinguished from participant-only courses');
assert.ok(source.includes("x.canPublish?'':' disabled'"), 'Participant-only courses must be visible but not selectable');
assert.ok(source.includes('peserta sahaja'), 'Participant-only courses must be labelled clearly');
assert.ok(source.includes("if(!course?.canPublish)"), 'Publishing must be blocked for courses where the user is not a teacher');
assert.ok(source.includes('/courseWorkMaterials'), 'Material creation endpoint is missing');
assert.ok(source.includes("state:'DRAFT'"), 'Classroom material must be created as a draft');
assert.ok(source.includes("shareMode:'VIEW'"), 'Drive attachment must be view-only');

assert.ok(!source.includes('classroom.rosters'), 'Roster scope must not be requested');
assert.ok(!source.includes('classroom.coursework.students'), 'Student coursework scope must not be requested');

console.log('Google Classroom integration tests passed');
