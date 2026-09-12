const test = require("node:test");
const assert = require("node:assert/strict");
const {
  normalizeRollNumber,
  validateCredentials,
  validateStudentInput,
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
