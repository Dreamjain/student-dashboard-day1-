const test = require("node:test");
const assert = require("node:assert/strict");
const {
  normalizeRollNumber,
  validateCredentials,
  validateStudentInput,
  validateStudentUpdate,
  validateMarksInput,
  validateAttendanceInput,
} = require("../utils/validation");

test("normalizeRollNumber trims whitespace and normalizes casing", () => {
  assert.equal(normalizeRollNumber("  ra123abc  "), "RA123ABC");
});

test("validateCredentials rejects missing credentials", () => {
  assert.deepEqual(validateCredentials({}), {
    valid: false,
    message: "Roll number and password are required",
  });
});

test("validateCredentials rejects weak passwords", () => {
  const result = validateCredentials({ rollNumber: "ra123", password: "1234567" });
  assert.equal(result.valid, false);
  assert.equal(result.message, "Password must be at least 8 characters");
});

test("validateCredentials returns normalized credentials", () => {
  assert.deepEqual(validateCredentials({ rollNumber: " ra123 ", password: "password123" }), {
    valid: true,
    rollNumber: "RA123",
    password: "password123",
  });
});

test("validateStudentInput rejects an invalid academic year", () => {
  const result = validateStudentInput({
    name: "Dream",
    rollNumber: "RA123",
    department: "CSE",
    year: 0,
    password: "password123",
  });

  assert.equal(result.valid, false);
  assert.equal(result.message, "Year must be an integer between 1 and 8");
});

test("validateStudentInput returns sanitized student data", () => {
  const result = validateStudentInput({
    name: "  Dream Pachori ",
    rollNumber: " ra123 ",
    department: " CSE ",
    year: 3,
    password: "password123",
  });

  assert.deepEqual(result, {
    valid: true,
    data: {
      name: "Dream Pachori",
      rollNumber: "RA123",
      department: "CSE",
      year: 3,
      password: "password123",
    },
  });
});

test("validateStudentUpdate enforces password strength and allowlists fields", () => {
  assert.equal(
    validateStudentUpdate({ password: "1234567" }).message,
    "Password must be at least 8 characters"
  );
  assert.equal(
    validateStudentUpdate({ __v: 1 }).message,
    "Unsupported student fields"
  );
  assert.deepEqual(validateStudentUpdate({ department: " CSE " }), {
    valid: true,
    data: { department: "CSE" }
  });
});

test("validateFacultyInput enforces consistent name, email, and password rules", () => {
  const { validateFacultyInput } = require("../utils/validation");
  assert.equal(validateFacultyInput({ name: "A", email: "a@b.com", password: "12345678" }).valid, false);
  assert.equal(validateFacultyInput({ name: "Faculty", email: "bad-email", password: "12345678" }).valid, false);
  assert.equal(validateFacultyInput({ name: "Faculty", email: "faculty@example.com", password: "1234567" }).valid, false);
  assert.deepEqual(validateFacultyInput({
    name: " Faculty ",
    email: "FACULTY@EXAMPLE.COM",
    password: "password123"
  }), {
    valid: true,
    data: { name: "Faculty", email: "faculty@example.com", password: "password123" }
  });
});

test("validateMarksInput rejects scores outside the 0-100 range", () => {
  const result = validateMarksInput({ studentId: "507f1f77bcf86cd799439011", subject: "DBMS", score: 101 });
  assert.equal(result.valid, false);
  assert.equal(result.message, "Score must be a number between 0 and 100");
});

test("validateMarksInput trims subjects and normalizes numeric scores", () => {
  const result = validateMarksInput({ studentId: "507f1f77bcf86cd799439011", subject: "  DBMS ", score: "88" });
  assert.deepEqual(result, {
    valid: true,
    data: { studentId: "507f1f77bcf86cd799439011", subject: "DBMS", score: 88 },
  });
});

test("validateAttendanceInput rejects future attendance dates", () => {
  const result = validateAttendanceInput({
    studentId: "507f1f77bcf86cd799439011",
    date: "2099-01-01",
    subject: "DBMS",
    status: "present",
  });
  assert.equal(result.valid, false);
  assert.equal(result.message, "Attendance date cannot be in the future");
});

test("validateAttendanceInput normalizes status and subject", () => {
  const result = validateAttendanceInput({
    studentId: "507f1f77bcf86cd799439011",
    date: "2026-09-01",
    subject: "  DBMS ",
    status: "PRESENT",
  });
  assert.equal(result.valid, true);
  assert.deepEqual(result.data, {
    studentId: "507f1f77bcf86cd799439011",
    date: "2026-09-01",
    subject: "DBMS",
    status: "present",
  });
});
