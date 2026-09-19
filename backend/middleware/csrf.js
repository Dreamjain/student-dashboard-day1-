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
  const csrfCookie = cookies[CSRF_COOKIE];
  const csrfHeader = req.get("X-CSRF-Token");

  if (!csrfCookie || !csrfHeader) {
    return res.status(403).json({ message: "CSRF protection required" });
  }

  let binding = "preauth";
  if (authToken) {
    binding = authToken;
  } else {
    binding = req.get("X-CSRF-Binding") || "";
  }

  if (!verifyCsrfToken(csrfCookie, binding) || csrfHeader !== csrfCookie) {
    return res.status(403).json({ message: "Invalid CSRF token" });
  }

  return next();
};

module.exports = csrfProtection;
