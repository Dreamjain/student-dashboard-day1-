const test = require("node:test");
const assert = require("node:assert/strict");

const originalApiKey = process.env.OPENAI_API_KEY;
const originalModel = process.env.OPENAI_MODEL;
const { MAX_OUTPUT_TOKENS } = require("../services/aiGuard");

test.after(() => {
  if (originalApiKey === undefined) delete process.env.OPENAI_API_KEY;
  else process.env.OPENAI_API_KEY = originalApiKey;

  if (originalModel === undefined) delete process.env.OPENAI_MODEL;
  else process.env.OPENAI_MODEL = originalModel;
});

test("AI service reports an unconfigured provider without making a network request", async () => {
  delete process.env.OPENAI_API_KEY;

  const { isAIConfigured, requestAI } = require("../services/aiService");

  assert.equal(isAIConfigured(), false);
  await assert.rejects(
    () => requestAI("test"),
    (error) => error.code === "AI_NOT_CONFIGURED"
  );
});

test("AI service sends academic context to the Responses API and returns output text", async () => {
  process.env.OPENAI_API_KEY = "test-key";
  process.env.OPENAI_MODEL = "test-model";

  const { requestAI, OPENAI_API_URL } = require("../services/aiService");

  let request;
  const fakeFetch = async (url, options) => {
    request = { url, options };
    return {
      ok: true,
      async json() {
        return { model: "test-model", output_text: "Focus on the two weakest subjects." };
      }
    };
  };

  const result = await requestAI('{"academicData":{"averageMarks":72}}', {
    fetchImpl: fakeFetch
  });

  assert.equal(result.text, "Focus on the two weakest subjects.");
  assert.equal(result.model, "test-model");
  assert.equal(request.url, OPENAI_API_URL);
  assert.equal(request.options.method, "POST");
  assert.equal(request.options.headers.authorization, "Bearer test-key");

  const body = JSON.parse(request.options.body);
  assert.equal(body.model, "test-model");
  assert.equal(body.input, '{"academicData":{"averageMarks":72}}');
  assert.match(body.instructions, /Academic Copilot/);
  assert.equal(body.max_output_tokens, MAX_OUTPUT_TOKENS);
});

test("AI service rejects unsuccessful provider responses", async () => {
  process.env.OPENAI_API_KEY = "test-key";

  const { requestAI } = require("../services/aiService");

  await assert.rejects(
    () => requestAI("test", {
      fetchImpl: async () => ({
        ok: false,
        status: 429,
        async text() { return "rate limited"; }
      })
    }),
    (error) => error.status === 429 && /provider request failed/.test(error.message)
  );
});
