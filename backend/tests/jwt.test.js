const test = require("node:test");
const assert = require("node:assert/strict");
const { sign, verify } = require("../utils/jwt");

process.env.JWT_SECRET = "test-secret-that-is-at-least-32-characters-long";

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
