const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");

process.env.JWT_SECRET = "test-secret-that-is-at-least-32-characters-long";

const { app } = require("../server");

const startTestServer = () => new Promise((resolve) => {
  const server = app.listen(0, () => resolve(server));
});

test("API responses include baseline HTTP security headers", async (t) => {
  const server = await startTestServer();
  t.after(() => server.close());

  const response = await new Promise((resolve, reject) => {
    const req = http.request({
      hostname: "127.0.0.1",
      port: server.address().port,
      path: "/health",
      method: "GET"
    }, resolve);
    req.on("error", reject);
    req.end();
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.headers["x-powered-by"], undefined);
  assert.equal(response.headers["x-content-type-options"], "nosniff");
  assert.equal(response.headers["x-frame-options"], "DENY");
  assert.equal(response.headers["referrer-policy"], "no-referrer");
  assert.equal(response.headers["permissions-policy"], "geolocation=(), camera=(), microphone=()");
  assert.equal(response.headers["cross-origin-resource-policy"], "same-origin");
});
