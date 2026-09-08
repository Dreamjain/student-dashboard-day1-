const express = require("express");
const router = express.Router();
const { authenticate, requireRole } = require("../middleware/auth");

const { addMarks, getStudentMarks } = require("../controllers/marksController");

router.post("/", authenticate, requireRole("faculty"), addMarks);
router.get("/student/:id", authenticate, getStudentMarks);

module.exports = router;
