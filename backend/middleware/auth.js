const { verify } = require("../utils/jwt");

const authenticate = (req, res, next) => {
  const authorization = req.headers.authorization || "";
  const match = authorization.match(/^Bearer\s+(\S+)$/);

  if (!match) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    req.user = verify(match[1]);
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Insufficient permissions" });
  }
  return next();
};

const requireSelf = (paramName = "id") => (req, res, next) => {
  if (req.user?.role !== "student" || String(req.user.id) !== String(req.params[paramName])) {
    return res.status(403).json({ message: "You can only access your own student data" });
  }
  return next();
};

const requireSelfOrRole = (paramName, ...roles) => (req, res, next) => {
  if (roles.includes(req.user?.role)) return next();
  if (req.user?.role === "student" && String(req.user.id) === String(req.params[paramName])) {
    return next();
  }
  return res.status(403).json({ message: "You do not have access to this student data" });
};

module.exports = { authenticate, requireRole, requireSelf, requireSelfOrRole };
