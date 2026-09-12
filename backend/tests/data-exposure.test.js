const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const readBackendFile = (relativePath) =>
  fs.readFileSync(path.join(__dirname, "..", relativePath), "utf8");

test("student model excludes password from default queries and JSON responses", () => {
  const source = readBackendFile("models/studentModel.js");

  assert.match(source, /password:\s*\{[\s\S]*?select:\s*false/);
  assert.match(source, /delete ret\.password/);
});

test("faculty model excludes password from default queries and JSON responses", () => {
  const source = readBackendFile("models/facultyModel.js");

  assert.match(source, /password:\s*\{[\s\S]*?select:\s*false/);
  assert.match(source, /delete ret\.password/);
});

test("attendance population uses an explicit public student projection", () => {
  const source = readBackendFile("controllers/attendanceController.js");

  assert.match(
    source,
    /\.populate\("studentId",\s*"name rollNumber department year"\)/
  );
  assert.doesNotMatch(source, /\.populate\("studentId"\)/);
});

test("student login response contains only non-sensitive profile fields", () => {
  const source = readBackendFile("controllers/studentController.js");

  assert.match(source, /user:\s*\{[\s\S]*?rollNumber:[\s\S]*?department:[\s\S]*?year:[\s\S]*?\}/);
  assert.doesNotMatch(source, /user:\s*\{[\s\S]*?password/);
});

test("faculty registration response does not expose the created faculty record", () => {
  const source = readBackendFile("controllers/facultyController.js");

  assert.match(source, /res\.status\(201\)\.json\(\{\s*message:[\s\S]*?facultyId:/);
  assert.doesNotMatch(source, /res\.status\(201\)\.json\(faculty\)/);
});
