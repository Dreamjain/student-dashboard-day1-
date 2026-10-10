const express = require("express");
const { authenticate, requireRole } = require("../middleware/auth");
const { createRateLimiter } = require("../middleware/rateLimiter");
const { getAcademicAnalysis } = require("../controllers/aiController");
const { attendance, planner, chat } = require("../controllers/aiAdvancedController");
const { trends } = require("../controllers/aiTrendsController");

const router = express.Router();

const aiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: "Too many AI requests. Please try again later.",
  keyGenerator: (req) => `student:${req.user.id}`
});

router.get("/analysis", authenticate, requireRole("student"), aiRateLimiter, getAcademicAnalysis);
router.get("/attendance", authenticate, requireRole("student"), aiRateLimiter, attendance);
router.get("/planner", authenticate, requireRole("student"), aiRateLimiter, planner);
router.post("/chat", authenticate, requireRole("student"), aiRateLimiter, chat);
router.get("/trends", authenticate, requireRole("student"), aiRateLimiter, trends);

module.exports = router;
