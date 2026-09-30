const logger = require("../utils/logger");

const errorHandler = (err, _req, res, _next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ message: "Invalid JSON payload" });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid resource id" });
  }

  if (err.code === 11000) {
    return res.status(409).json({ message: "Resource already exists" });
  }

  logger.error("Unhandled request error", { requestId: _req.requestId, errorName: err.name, errorMessage: err.message });
  return res.status(500).json({ message: "Internal server error" });
};

module.exports = errorHandler;
