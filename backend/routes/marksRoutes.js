const express = require("express");
const router = express.Router();
const { authenticate, requireRole, requireSelfOrRole } = require("../middleware/auth");
const { addMarks, getStudentMarks } = require("../controllers/marksController");

router.post("/", authenticate, requireRole("faculty"), addMarks);
router.get("/student/:id", authenticate, requireSelfOrRole("id", "faculty"), getStudentMarks);

module.exports = router;
