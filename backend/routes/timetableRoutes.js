const express = require("express");
const router = express.Router();

const {
  addTimetable,
  getTimetable
} = require("../controllers/timetableController");

router.post("/", addTimetable);
router.get("/", getTimetable);

module.exports = router;