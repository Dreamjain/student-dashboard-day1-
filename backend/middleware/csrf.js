const { verify } = require("../utils/jwt");
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

  const isLoginRequest = req.method === "POST" && (
    req.path === "/students/login" || req.path === "/api/faculty/login"
  );

  // Unauthenticated protected routes should reach their authentication middleware
  // and return 401. Login endpoints are the exception and use a pre-auth CSRF token.
  if (!authToken && !isLoginRequest) return next();

  const csrfCookie = cookies[CSRF_COOKIE];
  const csrfHeader = req.get("X-CSRF-Token");

  if (!csrfCookie || !csrfHeader) {
    return res.status(403).json({ message: "CSRF protection required" });
  }

  let binding = "preauth";
  if (authToken) {
    try {
      verify(authToken);
      binding = authToken;
    } catch {
      // An expired/invalid session cookie must not prevent a fresh login or logout.
      binding = "preauth";
    }
  }

  if (!verifyCsrfToken(csrfCookie, binding) || csrfHeader !== csrfCookie) {
    return res.status(403).json({ message: "Invalid CSRF token" });
  }

  return next();
};

module.exports = csrfProtection;
