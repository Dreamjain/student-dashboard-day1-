const Marks = require("../models/marksModel");

const addMarks = async (req, res) => {
  try {
    const marks = new Marks(req.body);
    const savedMarks = await marks.save();
    res.status(201).json(savedMarks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStudentMarks = async (req, res) => {
  try {
    const studentId = req.params.id;

    const marks = await Marks.find({ studentId }).populate("studentId");

    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addMarks,
  getStudentMarks
};