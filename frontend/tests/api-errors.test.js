import test from "node:test";
import assert from "node:assert/strict";
import { getApiErrorMessage } from "../src/api/errors.js";

test("uses a server-provided message", () => {
  assert.equal(
    getApiErrorMessage({ response: { status: 400, data: { message: "Invalid marks" } } }),
    "Invalid marks"
  );
});

test("explains rate-limit retry timing", () => {
  assert.equal(
    getApiErrorMessage({
      response: {
        status: 429,
        data: { message: "Too many login attempts." },
        headers: { "retry-after": "12" }
      }
    }),
    "Too many login attempts. Please wait 12 seconds and try again."
  );
});

test("maps common HTTP failures to actionable messages", () => {
  assert.equal(
    getApiErrorMessage({ response: { status: 403, data: {} } }),
    "You do not have permission to perform this action."
  );
  assert.equal(
    getApiErrorMessage({ response: { status: 404, data: {} } }),
    "The requested resource was not found."
  );
  assert.equal(
    getApiErrorMessage({ response: { status: 503, data: {} } }),
    "The server is unavailable right now. Please try again."
  );
});

test("handles network and timeout failures", () => {
  assert.equal(
    getApiErrorMessage({ code: "ETIMEDOUT" }),
    "The request timed out. Please check your connection and try again."
  );
  assert.equal(
    getApiErrorMessage({ request: {} }),
    "Unable to reach the server. Check your connection and try again."
  );
});

test("falls back when the error has no useful details", () => {
  assert.equal(getApiErrorMessage(new Error("unknown"), "Custom fallback"), "Custom fallback");
});
