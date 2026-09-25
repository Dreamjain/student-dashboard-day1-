const { verify } = require("../utils/jwt");
const {
  AUTH_COOKIE,
  REFRESH_COOKIE,
  CSRF_COOKIE,
  parseCookies,
  verifyCsrfToken
} = require("../utils/sessionCookies");

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

const csrfProtection = (req, res, next) => {
  if (SAFE_METHODS.has(req.method)) return next();

  const cookies = parseCookies(req.headers.cookie);
  const authToken = cookies[AUTH_COOKIE];
  const refreshToken = cookies[REFRESH_COOKIE];
  const hasBearerAuth = /^Bearer\s+\S+$/i.test(req.headers.authorization || "");

  if (!authToken && !refreshToken && hasBearerAuth) return next();

  const isLoginRequest = req.method === "POST" && (
    req.path === "/students/login" || req.path === "/api/faculty/login"
  );
  const isRefreshRequest = req.method === "POST" && req.path === "/auth/refresh";

  if (!authToken && !refreshToken && !isLoginRequest) return next();

  const csrfCookie = cookies[CSRF_COOKIE];
  const csrfHeader = req.get("X-CSRF-Token");

  if (!csrfCookie || !csrfHeader) {
    return res.status(403).json({ message: "CSRF protection required" });
  }

  let binding = "preauth";

  if (isRefreshRequest && refreshToken) {
    binding = refreshToken;
  } else if (authToken) {
    try {
      verify(authToken);
      binding = authToken;
    } catch {
      // Expired access tokens are allowed to refresh through the refresh-token binding.
      binding = refreshToken || "preauth";
    }
  }

  if (!verifyCsrfToken(csrfCookie, binding) || csrfHeader !== csrfCookie) {
    return res.status(403).json({ message: "Invalid CSRF token" });
  }

  return next();
};

module.exports = csrfProtection;
