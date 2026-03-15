const express = require("express");
const router = express.Router();

const {
  addMarks,
  getStudentMarks
} = require("../controllers/marksController");

router.post("/", addMarks);
router.get("/student/:id", getStudentMarks);

module.exports = router;