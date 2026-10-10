const test = require("node:test");
const assert = require("node:assert/strict");
const { app } = require("../server");

let server;
let baseUrl;

test.before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
});

test("OpenAPI document is exposed and contains the documented API surface", async () => {
  const response = await fetch(`${baseUrl}/openapi.json`);
  assert.equal(response.status, 200);

  const spec = await response.json();
  assert.equal(spec.openapi, "3.0.3");
  assert.equal(spec.info.title, "Student Dashboard API");

  for (const route of [
    "/health",
    "/health/ready",
    "/health/metrics",
    "/auth/csrf",
    "/auth/refresh",
    "/auth/logout",
    "/students",
    "/students/{id}",
    "/students/summary/{id}",
    "/attendance",
    "/attendance/student/{id}",
    "/attendance/history/{id}",
    "/attendance/report",
    "/marks",
    "/marks/student/{id}",
    "/timetable",
    "/api/faculty/login",
    "/api/faculty/register",
    "/api/ai/analysis",
    "/api/ai/attendance",
    "/api/ai/planner",
    "/api/ai/trends",
    "/api/ai/chat"
  ]) {
    assert.ok(spec.paths[route], `missing OpenAPI path: ${route}`);
  }

  assert.equal(spec.paths["/api/ai/analysis"].get.security.length, 2);
  assert.equal(spec.paths["/api/ai/chat"].post.requestBody.required, true);
  assert.equal(spec.paths["/api/ai/chat"].post.requestBody.content["application/json"].schema.properties.message.maxLength, 2000);
});

test("Swagger UI page is available without exposing credentials", async () => {
  const response = await fetch(`${baseUrl}/docs`);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /swagger-ui-dist@5\.29\.4/);
  assert.match(html, /\/openapi\.json/);
  assert.doesNotMatch(html, /JWT_SECRET|MONGO_URI|REDIS_REST_TOKEN/);
});
