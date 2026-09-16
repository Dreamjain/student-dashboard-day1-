const test = require("node:test");
const assert = require("node:assert/strict");
const { createRateLimiter } = require("../middleware/rateLimiter");

const makeResponse = () => ({
  statusCode: null,
  headers: {},
  body: null,
  setHeader(name, value) {
    this.headers[name] = value;
  },
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  }
});

test("rate limiter allows requests up to the configured limit", () => {
  const limiter = createRateLimiter({ windowMs: 60_000, max: 2 });
  let nextCalls = 0;

  const next = () => { nextCalls += 1; };
  limiter({ ip: "10.0.0.1" }, makeResponse(), next);
  limiter({ ip: "10.0.0.1" }, makeResponse(), next);

  assert.equal(nextCalls, 2);
});

test("rate limiter returns 429 and Retry-After after the limit is exceeded", () => {
  const limiter = createRateLimiter({ windowMs: 60_000, max: 2, message: "Rate limit exceeded" });
  let nextCalls = 0;
  const next = () => { nextCalls += 1; };

  limiter({ ip: "10.0.0.2" }, makeResponse(), next);
  limiter({ ip: "10.0.0.2" }, makeResponse(), next);
  const response = makeResponse();
  limiter({ ip: "10.0.0.2" }, response, next);

  assert.equal(nextCalls, 2);
  assert.equal(response.statusCode, 429);
  assert.equal(response.body.message, "Rate limit exceeded");
  assert.ok(Number(response.headers["Retry-After"]) >= 1);
});

test("rate limiter tracks clients independently", () => {
  const limiter = createRateLimiter({ windowMs: 60_000, max: 1 });
  let nextCalls = 0;
  const next = () => { nextCalls += 1; };

  limiter({ ip: "10.0.0.3" }, makeResponse(), next);
  limiter({ ip: "10.0.0.4" }, makeResponse(), next);

  assert.equal(nextCalls, 2);
});
