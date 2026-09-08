const express = require("express");
const router = express.Router();
const { authenticate, requireRole, requireSelfOrRole } = require("../middleware/auth");

const {
  markAttendance,
  getAttendance,
  getStudentAttendance,
  getAttendanceReport,
  getAttendanceHistory
} = require("../controllers/attendanceController");

router.use(authenticate);
router.post("/", requireRole("faculty"), markAttendance);
router.get("/", requireRole("faculty"), getAttendance);
router.get("/student/:id", requireSelfOrRole("id", "faculty"), getStudentAttendance);
router.get("/history/:id", requireSelfOrRole("id", "faculty"), getAttendanceHistory);
router.get("/report", requireRole("faculty"), getAttendanceReport);

module.exports = router;
