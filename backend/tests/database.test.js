const test = require("node:test");
const assert = require("node:assert/strict");
const Marks = require("../models/marksModel");
const Attendance = require("../models/attendanceModel");
const Student = require("../models/studentModel");

const hasUniqueIndex = (schema, fields) =>
  schema.indexes().some(([indexFields, options]) => {
    return options.unique === true && JSON.stringify(indexFields) === JSON.stringify(fields);
  });

test("marks schema enforces one record per student and subject", () => {
  assert.equal(
    hasUniqueIndex(Marks.schema, { studentId: 1, subject: 1 }),
    true
  );
});

test("attendance schema prevents duplicate student subject date records", () => {
  assert.equal(
    hasUniqueIndex(Attendance.schema, { studentId: 1, subject: 1, date: 1 }),
    true
  );
});

test("student schema indexes the unique roll number lookup", () => {
  assert.equal(
    hasUniqueIndex(Student.schema, { rollNumber: 1 }),
    true
  );
});

test("attendance schema keeps a descending student date index for history queries", () => {
  const hasHistoryIndex = Attendance.schema.indexes().some(([fields]) =>
    JSON.stringify(fields) === JSON.stringify({ studentId: 1, date: -1 })
  );

  assert.equal(hasHistoryIndex, true);
});
