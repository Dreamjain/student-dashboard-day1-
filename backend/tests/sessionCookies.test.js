const test = require("node:test");
const assert = require("node:assert/strict");

process.env.JWT_SECRET = "test-secret-that-is-at-least-32-characters-long";

const {
  CSRF_COOKIE,
  parseCookies,
  createCsrfToken,
  verifyCsrfToken,
  setSessionCookies,
  clearSessionCookies
} = require("../utils/sessionCookies");

const makeResponse = () => {
  const headers = [];
  return {
    append(name, value) {
      headers.push([name, value]);
    },
    headers
  };
};

test("parseCookies decodes cookie values and ignores malformed parts", () => {
  assert.deepEqual(parseCookies("a=hello%20world; malformed; b=two"), {
    a: "hello world",
    b: "two"
  });
});

test("CSRF tokens are bound to their session value", () => {
  const token = createCsrfToken("refresh-token");
  assert.equal(verifyCsrfToken(token, "refresh-token"), true);
  assert.equal(verifyCsrfToken(token, "different-refresh-token"), false);
});

test("session cookies set HttpOnly auth cookies and a readable CSRF cookie", () => {
  const response = makeResponse();
  setSessionCookies(response, {
    accessToken: "access-token",
    refreshToken: "refresh-token"
  });

  assert.equal(response.headers.length, 3);
  assert.match(response.headers[0][1], /^studentDashboardAuth=/);
  assert.match(response.headers[0][1], /HttpOnly/);
  assert.match(response.headers[1][1], /^studentDashboardRefresh=/);
  assert.match(response.headers[1][1], /HttpOnly/);
  assert.match(response.headers[2][1], new RegExp(`^${CSRF_COOKIE}=`));
  assert.doesNotMatch(response.headers[2][1], /HttpOnly/);
});

test("clearSessionCookies expires all session cookies", () => {
  const response = makeResponse();
  clearSessionCookies(response);

  assert.equal(response.headers.length, 3);
  for (const [, value] of response.headers) {
    assert.match(value, /Max-Age=0/);
  }
});
