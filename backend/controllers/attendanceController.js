const mongoose = require("mongoose");
const Attendance = require("../models/attendanceModel");
const { validateAttendanceInput } = require("../utils/validation");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const markAttendance = async (req, res) => {
  const validation = validateAttendanceInput(req.body);
  if (!validation.valid) return res.status(400).json({ message: validation.message });
  if (!isValidId(validation.data.studentId)) {
    return res.status(400).json({ message: "A valid studentId is required" });
  }

  const attendance = await Attendance.create(validation.data);
  res.status(201).json(attendance);
};

const getStudentAttendance = async (req, res) => {
  const { id: studentId } = req.params;
  if (!isValidId(studentId)) return res.status(400).json({ message: "Invalid student id" });

  const records = await Attendance.find({ studentId });
  const totalClasses = records.length;
  const present = records.filter((record) => record.status === "present").length;
  const percentage = totalClasses === 0 ? 0 : (present / totalClasses) * 100;

  res.json({ studentId, totalClasses, present, percentage: Number(percentage.toFixed(2)) });
};

const getAttendance = async (_req, res) => {
  const records = await Attendance.find()
    .populate("studentId", "name rollNumber department year")
    .sort({ date: -1 });
  res.json(records);
};

const getAttendanceReport = async (_req, res) => {
  const students = await Attendance.aggregate([
    {
      $group: {
        _id: "$studentId",
        totalClasses: { $sum: 1 },
        present: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } }
      }
    }
  ]);
  res.json(students);
};

const getAttendanceHistory = async (req, res) => {
  const { id: studentId } = req.params;
  if (!isValidId(studentId)) return res.status(400).json({ message: "Invalid student id" });

  const records = await Attendance.find({ studentId })
    .select("date status subject")
    .sort({ date: -1 });
  res.json(records);
};

module.exports = {
  markAttendance,
  getAttendance,
  getStudentAttendance,
  getAttendanceReport,
  getAttendanceHistory
};
