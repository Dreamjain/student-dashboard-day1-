const test = require("node:test");
const assert = require("node:assert/strict");
const logger = require("../utils/logger");

test("logger creates unique request ids", () => {
  const first = logger.createRequestId();
  const second = logger.createRequestId();

  assert.match(first, /^[0-9a-f-]{36}$/i);
  assert.notEqual(first, second);
});

test("logger does not expose sensitive values", () => {
  const originalLog = console.log;
  let output = "";
  console.log = (value) => {
    output = value;
  };

  try {
    logger.info("test", {
      password: "secret-password",
      token: "secret-token",
      nested: { apiSecret: "secret-api-value" },
      safe: "visible"
    });
  } finally {
    console.log = originalLog;
  }

  assert.match(output, /\[REDACTED\]/);
  assert.doesNotMatch(output, /secret-password|secret-token|secret-api-value/);
  assert.match(output, /visible/);
});
