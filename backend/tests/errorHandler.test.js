const test = require("node:test");
const assert = require("node:assert/strict");
const errorHandler = require("../middleware/errorHandler");

const runHandler = (error) => {
  const response = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };

  errorHandler(error, {}, response, () => {});
  return response;
};

test("errorHandler returns 400 for malformed JSON", () => {
  const error = new SyntaxError("Unexpected token");
  error.status = 400;
  error.body = "{";

  const response = runHandler(error);
  assert.equal(response.statusCode, 400);
  assert.deepEqual(response.body, { message: "Invalid JSON payload" });
});

test("errorHandler maps validation errors to 400", () => {
  const response = runHandler({ name: "ValidationError", message: "Name is required" });
  assert.equal(response.statusCode, 400);
  assert.deepEqual(response.body, { message: "Name is required" });
});

test("errorHandler maps duplicate key errors to 409", () => {
  const response = runHandler({ code: 11000 });
  assert.equal(response.statusCode, 409);
  assert.deepEqual(response.body, { message: "Resource already exists" });
});

test("errorHandler hides unexpected internal error details", () => {
  const response = runHandler({ name: "DatabaseError", message: "connection string contains secret" });
  assert.equal(response.statusCode, 500);
  assert.deepEqual(response.body, { message: "Internal server error" });
});
