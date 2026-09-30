const crypto = require("crypto");

const REDACTED_KEYS = /password|token|secret|authorization|cookie|mongo(uri)?|redis.*token|jwt/i;

const sanitize = (value) => {
  if (!value || typeof value !== "object") return value;

  if (Array.isArray(value)) return value.map(sanitize);

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      REDACTED_KEYS.test(key) ? "[REDACTED]" : sanitize(entry)
    ])
  );
};

const write = (level, message, fields = {}) => {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    service: "student-dashboard-api",
    message,
    ...sanitize(fields)
  };

  const output = JSON.stringify(entry);
  if (level === "error") {
    console.error(output);
  } else {
    console.log(output);
  }
};

const createRequestId = () => crypto.randomUUID();

const logger = {
  info: (message, fields) => write("info", message, fields),
  warn: (message, fields) => write("warn", message, fields),
  error: (message, fields) => write("error", message, fields),
  createRequestId
};

module.exports = logger;
