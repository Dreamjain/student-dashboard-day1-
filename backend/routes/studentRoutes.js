const express = require("express");
const router = express.Router();

const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentSummary,
  loginStudent
} = require("../controllers/studentController");

router.post("/", createStudent);
router.post("/login", loginStudent);
router.get("/summary/:id", getStudentSummary);
router.get("/", getStudents);
router.get("/:id", getStudentById);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);
module.exports = router;