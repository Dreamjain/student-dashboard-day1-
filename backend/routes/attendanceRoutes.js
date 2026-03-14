const express = require("express");
const router = express.Router();

const {
  markAttendance,
  getAttendance,
  getStudentAttendance
} = require("../controllers/attendanceController");

router.post("/", markAttendance);
router.get("/", getAttendance);
router.get("/student/:id", getStudentAttendance);

module.exports = router;
