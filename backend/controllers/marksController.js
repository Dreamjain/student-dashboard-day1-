const mongoose = require("mongoose");
const Marks = require("../models/marksModel");
const { validateMarksInput } = require("../utils/validation");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const addMarks = async (req, res) => {
  try {
    const validation = validateMarksInput(req.body);
    if (!validation.valid) return res.status(400).json({ message: validation.message });
    if (!isValidId(validation.data.studentId)) {
      return res.status(400).json({ message: "A valid studentId is required" });
    }

    const marks = new Marks(validation.data);
    const savedMarks = await marks.save();
    res.status(201).json(savedMarks);
  } catch (error) {
    console.error("Error adding marks:", error);
    res.status(500).json({ message: "Unable to save marks" });
  }
};

const getStudentMarks = async (req, res) => {
  try {
    const { id: studentId } = req.params;
    if (!isValidId(studentId)) return res.status(400).json({ message: "Invalid student id" });

    const marks = await Marks.find({ studentId }).select("subject score createdAt").sort({ createdAt: -1 });
    res.json(marks);
  } catch (error) {
    console.error("Error fetching marks:", error);
    res.status(500).json({ message: "Unable to fetch marks" });
  }
};

module.exports = { addMarks, getStudentMarks };
