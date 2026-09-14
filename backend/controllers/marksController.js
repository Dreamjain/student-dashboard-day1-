const mongoose = require("mongoose");
const Marks = require("../models/marksModel");
const { validateMarksInput } = require("../utils/validation");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const addMarks = async (req, res) => {
  const validation = validateMarksInput(req.body);
  if (!validation.valid) return res.status(400).json({ message: validation.message });
  if (!isValidId(validation.data.studentId)) {
    return res.status(400).json({ message: "A valid studentId is required" });
  }

  const marks = await Marks.create(validation.data);
  res.status(201).json(marks);
};

const getStudentMarks = async (req, res) => {
  const { id: studentId } = req.params;
  if (!isValidId(studentId)) return res.status(400).json({ message: "Invalid student id" });

  const marks = await Marks.find({ studentId }).select("subject score createdAt").sort({ createdAt: -1 });
  res.json(marks);
};

module.exports = { addMarks, getStudentMarks };
