const express = require("express");
const { authenticate, requireRole } = require("../middleware/auth");
const { createRateLimiter } = require("../middleware/rateLimiter");
const { getAcademicAnalysis } = require("../controllers/aiController");

const router = express.Router();

const aiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: "Too many AI requests. Please try again later."
});

router.get("/analysis", authenticate, requireRole("student"), aiRateLimiter, getAcademicAnalysis);

module.exports = router;
