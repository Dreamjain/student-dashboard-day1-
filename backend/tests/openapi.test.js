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

  const protectedAiOperations = [
    ["/api/ai/analysis", "get"],
    ["/api/ai/attendance", "get"],
    ["/api/ai/planner", "get"],
    ["/api/ai/trends", "get"],
    ["/api/ai/chat", "post"]
  ];

  for (const [route, method] of protectedAiOperations) {
    const operation = spec.paths[route][method];
    assert.ok(operation, `missing documented AI operation: ${method.toUpperCase()} ${route}`);
    assert.ok(operation.security?.length, `AI operation must require authentication: ${route}`);
    assert.ok(operation.responses["401"], `AI operation must document 401: ${route}`);
    assert.ok(operation.responses["403"], `AI operation must document 403: ${route}`);
    assert.ok(operation.responses["429"], `AI operation must document rate limiting: ${route}`);
  }

  const chatSchema = spec.paths["/api/ai/chat"].post.requestBody.content["application/json"].schema;
  assert.equal(spec.paths["/api/ai/chat"].post.requestBody.required, true);
  assert.ok(chatSchema.required.includes("message"));
  assert.equal(chatSchema.properties.message.type, "string");
  assert.equal(chatSchema.properties.message.minLength, 1);
  assert.equal(chatSchema.properties.message.maxLength, 2000);
});

test("Swagger UI page is available without exposing credentials", async () => {
  const response = await fetch(`${baseUrl}/docs`);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /swagger-ui-dist@5\.29\.4/);
  assert.match(html, /\/openapi\.json/);
  assert.doesNotMatch(html, /JWT_SECRET|MONGO_URI|REDIS_REST_TOKEN/);
});
