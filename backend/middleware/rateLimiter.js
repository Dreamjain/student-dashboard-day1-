const crypto = require("crypto");

const REDIS_REST_URL = process.env.REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_REST_TOKEN = process.env.REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redisConfigured = Boolean(REDIS_REST_URL && REDIS_REST_TOKEN);

const redisRateLimitScript = `
local current = redis.call("INCR", KEYS[1])
if current == 1 then
  redis.call("PEXPIRE", KEYS[1], ARGV[1])
end
local ttl = redis.call("PTTL", KEYS[1])
return { current, ttl }
`;

const localLimiters = new Set();

const getClientKey = (req) => {
  const address = req.ip || req.socket?.remoteAddress || "unknown";
  return crypto.createHash("sha256").update(address).digest("hex");
};

const createLocalRateLimiter = ({ windowMs, max, message }) => {
  const attempts = new Map();
  localLimiters.add(attempts);

  return (req, res, next) => {
    const key = getClientKey(req);
    const now = Date.now();
    const current = attempts.get(key);

    // Prevent stale entries from accumulating indefinitely in long-lived processes.
    if (attempts.size > 10_000) {
      for (const [clientKey, record] of attempts) {
        if (now >= record.resetAt) attempts.delete(clientKey);
      }
    }

    if (!current || now >= current.resetAt) {
      attempts.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (current.count >= max) {
      const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
      res.setHeader("Retry-After", String(retryAfterSeconds));
      return res.status(429).json({ message });
    }

    current.count += 1;
    return next();
  };
};

const executeRedisRateLimit = async ({ key, windowMs, max }) => {
  const response = await fetch(REDIS_REST_URL, {
    method: "POST",
    headers: {
      authorization: `Bearer ${REDIS_REST_TOKEN}`,
      "content-type": "application/json"
    },
    body: JSON.stringify([
      "EVAL",
      redisRateLimitScript,
      "1",
      key,
      String(windowMs)
    ])
  });

  if (!response.ok) {
    throw new Error(`Redis rate-limit request failed with HTTP ${response.status}`);
  }

  const payload = await response.json();

  if (payload.error) {
    throw new Error(`Redis rate-limit command failed: ${payload.error}`);
  }

  const [count, ttlMs] = payload.result || [];
  if (!Number.isFinite(Number(count)) || !Number.isFinite(Number(ttlMs))) {
    throw new Error("Redis rate-limit response was invalid");
  }

  return {
    allowed: Number(count) <= max,
    retryAfterSeconds: Math.max(1, Math.ceil(Number(ttlMs) / 1000))
  };
};

const createRedisRateLimiter = ({ windowMs, max, message }) => async (req, res, next) => {
  try {
    const key = `student-dashboard:rate-limit:${getClientKey(req)}`;
    const result = await executeRedisRateLimit({ key, windowMs, max });

    if (!result.allowed) {
      res.setHeader("Retry-After", String(result.retryAfterSeconds));
      return res.status(429).json({ message });
    }

    return next();
  } catch (error) {
    // Do not silently fall back to a process-local limiter when Redis is configured.
    // A production outage should fail closed for the protected login endpoint.
    console.error("Redis rate limiter unavailable", error.message);
    return res.status(503).json({
      message: "Rate limiting service unavailable. Please try again later."
    });
  }
};

const createRateLimiter = (options) => {
  if (redisConfigured) return createRedisRateLimiter(options);

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Redis rate limiting is required in production. Configure REDIS_REST_URL and REDIS_REST_TOKEN."
    );
  }

  return createLocalRateLimiter(options);
};

const loginRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 5,
  message: "Too many login attempts. Please try again later."
});

const checkRedisHealth = async () => {
  if (!redisConfigured) return { configured: false, healthy: true };

  try {
    const response = await fetch(REDIS_REST_URL, {
      method: "POST",
      headers: {
        authorization: `Bearer ${REDIS_REST_TOKEN}`,
        "content-type": "application/json"
      },
      body: JSON.stringify(["PING"])
    });

    if (!response.ok) return { configured: true, healthy: false };

    const payload = await response.json();
    return { configured: true, healthy: payload.result === "PONG" };
  } catch {
    return { configured: true, healthy: false };
  }
};

const isRedisConfigured = () => redisConfigured;

module.exports = {
  createRateLimiter,
  loginRateLimiter,
  checkRedisHealth,
  isRedisConfigured
};
