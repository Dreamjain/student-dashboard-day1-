const express = require("express");
const router = express.Router();
const { authenticate, requireRole, requireSelf } = require("../middleware/auth");

const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentSummary,
  loginStudent
} = require("../controllers/studentController");

router.post("/login", loginStudent);
router.post("/", authenticate, requireRole("faculty"), createStudent);
router.get("/summary/:id", authenticate, requireSelf("id"), getStudentSummary);
router.get("/", authenticate, requireRole("faculty"), getStudents);
router.get("/:id", authenticate, requireRole("faculty"), getStudentById);
router.put("/:id", authenticate, requireRole("faculty"), updateStudent);
router.delete("/:id", authenticate, requireRole("faculty"), deleteStudent);

module.exports = router;
