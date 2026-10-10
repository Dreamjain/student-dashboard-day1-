const Timetable = require("../models/timetableModel");

const addTimetable = async (req, res) => {
  const timetable = new Timetable(req.body);
  const savedTimetable = await timetable.save();
  res.status(201).json(savedTimetable);
};

// Timetable is shared academic schedule data; do not scope this query to req.user.id.\nconst getTimetable = async (_req, res) => {
  const timetable = await Timetable.find().sort({ day: 1 });
  res.json(timetable);
};

module.exports = {
  addTimetable,
  getTimetable
};
