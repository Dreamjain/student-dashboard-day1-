const MAX_CHAT_CHARS = 2000;
const MAX_CONTEXT_CHARS = 12000;
const MAX_OUTPUT_TOKENS = 700;
const MAX_OUTPUT_CHARS = 12000;

const sanitizeChatMessage = (value) => String(value ?? "").replace(/[\u0000-\u001F\u007F]/g, " ").trim();

const validateChatMessage = (value) => {
  const message = sanitizeChatMessage(value);
  if (!message) return { valid: false, message: "Message is required" };
  if (message.length > MAX_CHAT_CHARS) return { valid: false, message: `Message must be ${MAX_CHAT_CHARS} characters or fewer` };
  return { valid: true, value: message };
};

const limitContext = (context) => {
  const serialized = JSON.stringify(context);
  return serialized.length <= MAX_CONTEXT_CHARS
    ? context
    : { notice: "Academic context was truncated for safety and cost control.", data: serialized.slice(0, MAX_CONTEXT_CHARS) };
};

module.exports = { MAX_CHAT_CHARS, MAX_CONTEXT_CHARS, MAX_OUTPUT_TOKENS, MAX_OUTPUT_CHARS, sanitizeChatMessage, validateChatMessage, limitContext };
