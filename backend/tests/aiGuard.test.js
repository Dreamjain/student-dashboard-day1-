const test = require("node:test");
const assert = require("node:assert/strict");

const {
  MAX_CHAT_CHARS,
  MAX_CONTEXT_CHARS,
  sanitizeChatMessage,
  validateChatMessage,
  limitContext
} = require("../services/aiGuard");

test("sanitizeChatMessage removes control characters and trims input", () => {
  assert.equal(sanitizeChatMessage("  hello\u0000\nworld  "), "hello  world");
});

test("validateChatMessage accepts bounded messages", () => {
  assert.deepEqual(validateChatMessage("What should I study?"), {
    valid: true,
    value: "What should I study?"
  });
});

test("validateChatMessage rejects empty and oversized messages", () => {
  assert.equal(validateChatMessage("   ").valid, false);
  assert.equal(validateChatMessage("x".repeat(MAX_CHAT_CHARS + 1)).valid, false);
});

test("limitContext preserves small contexts", () => {
  const context = { metrics: { averageMarks: 80 } };
  assert.deepEqual(limitContext(context), context);
});

test("limitContext bounds oversized serialized contexts", () => {
  const context = { marks: "x".repeat(MAX_CONTEXT_CHARS + 100) };
  const limited = limitContext(context);
  assert.equal(limited.notice, "Academic context was truncated for safety and cost control.");
  assert.ok(limited.data.length <= MAX_CONTEXT_CHARS);
});
