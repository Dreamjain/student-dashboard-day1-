const express = require("express");
const router = express.Router();
const { authenticate, requireRole } = require("../middleware/auth");

const { loginFaculty, registerFaculty } = require("../controllers/facultyController");

router.post("/login", loginFaculty);
router.post("/register", authenticate, requireRole("faculty"), registerFaculty);

module.exports = router;
