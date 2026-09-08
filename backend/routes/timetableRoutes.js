const express = require("express");
const router = express.Router();
const { authenticate, requireRole } = require("../middleware/auth");

const { addTimetable, getTimetable } = require("../controllers/timetableController");

router.use(authenticate);
router.post("/", requireRole("faculty"), addTimetable);
router.get("/", getTimetable);

module.exports = router;
