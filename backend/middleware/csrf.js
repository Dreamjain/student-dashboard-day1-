const {
  AUTH_COOKIE,
  CSRF_COOKIE,
  parseCookies,
  verifyCsrfToken
} = require("../utils/sessionCookies");

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

const csrfProtection = (req, res, next) => {
  if (SAFE_METHODS.has(req.method)) return next();

  const cookies = parseCookies(req.headers.cookie);
  const authToken = cookies[AUTH_COOKIE];
  const hasBearerAuth = /^Bearer\s+\S+$/i.test(req.headers.authorization || "");

  // Bearer tokens are not automatically attached by browsers, so CSRF does not apply
  // to clients using Authorization headers. Cookie-authenticated browser sessions do.
  if (!authToken && hasBearerAuth) return next();

  const csrfCookie = cookies[CSRF_COOKIE];
  const csrfHeader = req.get("X-CSRF-Token");

  if (!csrfCookie || !csrfHeader) {
    return res.status(403).json({ message: "CSRF protection required" });
  }

  const binding = authToken || "preauth";

  if (!verifyCsrfToken(csrfCookie, binding) || csrfHeader !== csrfCookie) {
    return res.status(403).json({ message: "Invalid CSRF token" });
  }

  return next();
};

module.exports = csrfProtection;
