const Timetable = require("../models/timetableModel");

const addTimetable = async (req, res) => {
  try {
    const timetable = new Timetable(req.body);
    const savedTimetable = await timetable.save();
    res.status(201).json(savedTimetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.find().sort({ day: 1 });
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addTimetable,
  getTimetable
};