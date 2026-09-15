const test = require("node:test");
const assert = require("node:assert/strict");
const { app } = require("../server");

let server;
let baseUrl;

test.before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

test.after(async () => {
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
});

const request = (path, options) => fetch(`${baseUrl}${path}`, options);

test("GET /health returns a healthy service response", async () => {
  const response = await request("/health");
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok" });
});

test("GET / returns the API service status", async () => {
  const response = await request("/");
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    service: "Student Dashboard API",
    status: "running"
  });
});

test("unknown routes return the standardized 404 response", async () => {
  const response = await request("/does-not-exist");
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { message: "Route not found" });
});

test("protected student route rejects requests without authentication", async () => {
  const response = await request("/students");
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { message: "Authentication required" });
});

test("malformed JSON is rejected by the API middleware stack", async () => {
  const response = await request("/students/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{invalid"
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { message: "Invalid JSON payload" });
});
