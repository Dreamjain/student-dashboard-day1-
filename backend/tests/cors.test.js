const test = require("node:test");
const assert = require("node:assert/strict");
const { buildCorsOptions, normalizeOrigins } = require("../utils/cors");

const checkOrigin = (configuredOrigins, requestOrigin) =>
  new Promise((resolve, reject) => {
    buildCorsOptions(configuredOrigins).origin(requestOrigin, (error, allowed) => {
      if (error) return reject(error);
      resolve(allowed);
    });
  });

test("normalizeOrigins supports comma-separated configuration", () => {
  assert.deepEqual(normalizeOrigins(" http://localhost:5173, https://app.example.com "), [
    "http://localhost:5173",
    "https://app.example.com"
  ]);
});

test("configured frontend origins are allowed", async () => {
  assert.equal(await checkOrigin("http://localhost:5173,https://app.example.com", "https://app.example.com"), true);
});

test("unconfigured browser origins are rejected", async () => {
  assert.equal(await checkOrigin("https://app.example.com", "https://evil.example.com"), false);
});

test("missing Origin headers remain allowed for non-browser clients", async () => {
  assert.equal(await checkOrigin("https://app.example.com", undefined), true);
});

test("no configured origins deny cross-origin browser requests", async () => {
  assert.equal(await checkOrigin("", "https://example.com"), false);
});
