const crypto = require("crypto");

const AUTH_COOKIE = process.env.NODE_ENV === "production"
  ? "__Host-student-dashboard"
  : "studentDashboardAuth";
const CSRF_COOKIE = process.env.NODE_ENV === "production"
  ? "__Host-student-dashboard-csrf"
  : "studentDashboardCsrf";

const isSecure = process.env.COOKIE_SECURE === "true" || process.env.NODE_ENV === "production";
const sameSite = (process.env.COOKIE_SAMESITE || "lax").toLowerCase();

if (!["strict", "lax", "none"].includes(sameSite)) {
  throw new Error("COOKIE_SAMESITE must be strict, lax, or none");
}
if (sameSite === "none" && !isSecure) {
  throw new Error("COOKIE_SAMESITE=none requires secure cookies");
}

const cookieOptions = (httpOnly) => [
  "Path=/",
  httpOnly ? "HttpOnly" : "",
  isSecure ? "Secure" : "",
  `SameSite=${sameSite.charAt(0).toUpperCase() + sameSite.slice(1)}`
].filter(Boolean).join("; ");

const parseCookies = (header = "") =>
  header.split(";").reduce((cookies, part) => {
    const index = part.indexOf("=");
    if (index < 0) return cookies;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (key) {
      try { cookies[key] = decodeURIComponent(value); } catch { /* ignore malformed cookie values */ }
    }
    return cookies;
  }, {});

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) throw new Error("JWT_SECRET must be configured");
  return secret;
};

const createCsrfToken = (sessionBinding) => {
  const nonce = crypto.randomBytes(32).toString("hex");
  const mac = crypto.createHmac("sha256", getSecret())
    .update(`student-dashboard-csrf:v1:${sessionBinding}:${nonce}`)
    .digest("hex");
  return `${nonce}.${mac}`;
};

const verifyCsrfToken = (token, sessionBinding) => {
  if (typeof token !== "string") return false;
  const [nonce, providedMac] = token.split(".");
  if (!/^[a-f0-9]{64}$/.test(nonce) || !/^[a-f0-9]{64}$/.test(providedMac || "")) return false;

  const expectedMac = crypto.createHmac("sha256", getSecret())
    .update(`student-dashboard-csrf:v1:${sessionBinding}:${nonce}`)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(providedMac), Buffer.from(expectedMac));
};

const setCookie = (res, name, value, httpOnly) => {
  res.append("Set-Cookie", `${name}=${encodeURIComponent(value)}; ${cookieOptions(httpOnly)}`);
};

const clearCookie = (res, name, httpOnly) => {
  res.append("Set-Cookie", `${name}=; Max-Age=0; ${cookieOptions(httpOnly)}`);
};

const setSessionCookies = (res, token) => {
  setCookie(res, AUTH_COOKIE, token, true);
  setCookie(res, CSRF_COOKIE, createCsrfToken(token), false);
};

const setPreAuthCsrfCookie = (res) => {
  const token = createCsrfToken("preauth");
  setCookie(res, CSRF_COOKIE, token, false);
  return token;
};

const clearSessionCookies = (res) => {
  clearCookie(res, AUTH_COOKIE, true);
  clearCookie(res, CSRF_COOKIE, false);
};

module.exports = {
  AUTH_COOKIE,
  CSRF_COOKIE,
  parseCookies,
  createCsrfToken,
  verifyCsrfToken,
  setSessionCookies,
  setPreAuthCsrfCookie,
  clearSessionCookies
};
