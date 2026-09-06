const mongoose = require("mongoose");
const Marks = require("../models/marksModel");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const addMarks = async (req, res) => {
  try {
    const { studentId, subject, score } = req.body;
    const numericScore = Number(score);

    if (!studentId || !isValidId(studentId)) {
      return res.status(400).json({ message: "A valid studentId is required" });
    }
    if (!subject || typeof subject !== "string" || !subject.trim()) {
      return res.status(400).json({ message: "Subject is required" });
    }
    if (!Number.isFinite(numericScore) || numericScore < 0 || numericScore > 100) {
      return res.status(400).json({ message: "Score must be a number between 0 and 100" });
    }

    const marks = new Marks({ studentId, subject: subject.trim(), score: numericScore });
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
