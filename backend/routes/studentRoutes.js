const express = require("express");
const router = express.Router();

const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentSummary,
  loginStudent,
  getAllStudents
} = require("../controllers/studentController");

router.post("/", createStudent);
router.get("/", getStudents);
router.get("/:id", getStudentById);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);
router.get("/summary/:id", getStudentSummary);
router.post("/login", loginStudent);
router.delete("/:id", deleteStudent);
router.get("/", getAllStudents);
module.exports = router;