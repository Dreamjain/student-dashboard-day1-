const test = require("node:test");
const assert = require("node:assert/strict");
const { sign, verify } = require("../utils/jwt");

const TEST_SECRET = "test-secret-that-is-at-least-32-characters-long";
process.env.JWT_SECRET = TEST_SECRET;

test("JWT contains identity claims and verifies successfully", () => {
  const token = sign({ id: "student-123", role: "student" });
  const payload = verify(token);

  assert.equal(payload.id, "student-123");
  assert.equal(payload.role, "student");
  assert.ok(payload.iat);
  assert.ok(payload.exp > payload.iat);
});

test("JWT verification rejects a tampered token", () => {
  const token = sign({ id: "student-123", role: "student" });
  const tamperedToken = `${token.slice(0, -1)}${token.endsWith("a") ? "b" : "a"}`;

  assert.throws(() => verify(tamperedToken), /Invalid token/);
});

test("JWT verification rejects expired tokens", () => {
  const token = sign({ id: "student-123", role: "student" }, -1);

  assert.throws(() => verify(token), /Token expired/);
});

test("JWT verification rejects malformed tokens", () => {
  assert.throws(() => verify("not-a-jwt"), /Invalid token/);
  assert.throws(() => verify("header.payload"), /Invalid token/);
});

test("JWT verification rejects tokens signed with a different secret", () => {
  const token = sign({ id: "student-123", role: "student" });

  process.env.JWT_SECRET = "another-test-secret-that-is-at-least-32-chars";
  assert.throws(() => verify(token), /Invalid token/);

  process.env.JWT_SECRET = TEST_SECRET;
});

test("JWT signing rejects an undersized secret", () => {
  const previousSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = "too-short";

  assert.throws(
    () => sign({ id: "student-123", role: "student" }),
    /JWT_SECRET must be configured with at least 32 characters/
  );

  process.env.JWT_SECRET = previousSecret;
});
