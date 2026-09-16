const express = require("express");
const router = express.Router();
const { authenticate, requireRole } = require("../middleware/auth");
const { loginRateLimiter } = require("../middleware/rateLimiter");

const { loginFaculty, registerFaculty } = require("../controllers/facultyController");

router.post("/login", loginRateLimiter, loginFaculty);
router.post("/register", authenticate, requireRole("faculty"), registerFaculty);

module.exports = router;
