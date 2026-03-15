const express = require("express");
const router = express.Router();

const {
  markAttendance,
  getAttendance,
  getStudentAttendance,
  getAttendanceReport,
  getAttendanceHistory
} = require("../controllers/attendanceController");

router.post("/", markAttendance);
router.get("/", getAttendance);
router.get("/student/:id", getStudentAttendance);
router.get("/history/:id", getAttendanceHistory);
router.get("/report", getAttendanceReport);

module.exports = router;
