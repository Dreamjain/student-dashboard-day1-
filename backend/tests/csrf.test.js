const test = require("node:test");
const assert = require("node:assert/strict");
const {
  createCsrfToken,
  verifyCsrfToken
} = require("../utils/sessionCookies");

process.env.JWT_SECRET = "test-secret-that-is-at-least-32-characters-long";

test("signed CSRF token verifies only for its bound session", () => {
  const token = createCsrfToken("session-123");
  assert.equal(verifyCsrfToken(token, "session-123"), true);
  assert.equal(verifyCsrfToken(token, "session-456"), false);
});

test("CSRF token tampering is rejected", () => {
  const token = createCsrfToken("session-123");
  const [nonce, mac] = token.split(".");
  const replacement = `${mac[0] === "0" ? "1" : "0"}${mac.slice(1)}`;
  assert.equal(verifyCsrfToken(`${nonce}.${replacement}`, "session-123"), false);
  assert.equal(verifyCsrfToken("invalid", "session-123"), false);
});
