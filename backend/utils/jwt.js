const crypto = require("crypto");

const base64url = (value) =>
  Buffer.from(value).toString("base64url");

const encode = (value) => base64url(JSON.stringify(value));

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 characters");
  }
  return secret;
};

const sign = (payload, expiresInSeconds = 60 * 60) => {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds
  };
  const encodedHeader = encode(header);
  const encodedPayload = encode(claims);
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(data)
    .digest("base64url");

  return `${data}.${signature}`;
};

const verify = (token) => {
  if (typeof token !== "string") throw new Error("Invalid token");

  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid token");

  const [encodedHeader, encodedPayload, signature] = parts;
  const data = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = crypto
    .createHmac("sha256", getSecret())
    .update(data)
    .digest("base64url");

  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
    throw new Error("Invalid token");
  }

  let header;
  let payload;
  try {
    header = JSON.parse(Buffer.from(encodedHeader, "base64url").toString("utf8"));
    payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
  } catch {
    throw new Error("Invalid token");
  }

  if (header.alg !== "HS256" || header.typ !== "JWT") throw new Error("Invalid token");
  if (!payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) {
    throw new Error("Token expired");
  }

  return payload;
};

module.exports = { sign, verify };
