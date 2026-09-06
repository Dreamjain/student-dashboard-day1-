const mongoose = require("mongoose");
const Attendance = require("../models/attendanceModel");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const markAttendance = async (req, res) => {
  try {
    const { studentId, date, status, subject } = req.body;

    if (!studentId || !isValidId(studentId)) {
      return res.status(400).json({ message: "A valid studentId is required" });
    }
    if (!subject || typeof subject !== "string" || !subject.trim()) {
      return res.status(400).json({ message: "Subject is required" });
    }
    if (!["present", "absent"].includes(String(status).toLowerCase())) {
      return res.status(400).json({ message: "Status must be present or absent" });
    }
    if (!date || Number.isNaN(new Date(date).getTime())) {
      return res.status(400).json({ message: "A valid date is required" });
    }

    const attendance = new Attendance({
      studentId,
      date,
      subject: subject.trim(),
      status: String(status).toLowerCase()
    });
    const savedAttendance = await attendance.save();
    res.status(201).json(savedAttendance);
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({ message: "Unable to save attendance" });
  }
};

const getStudentAttendance = async (req, res) => {
  try {
    const { id: studentId } = req.params;
    if (!isValidId(studentId)) return res.status(400).json({ message: "Invalid student id" });

    const records = await Attendance.find({ studentId });
    const totalClasses = records.length;
    const present = records.filter((record) => record.status === "present").length;
    const percentage = totalClasses === 0 ? 0 : (present / totalClasses) * 100;

    res.json({ studentId, totalClasses, present, percentage: Number(percentage.toFixed(2)) });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ message: "Unable to fetch attendance" });
  }
};

const getAttendance = async (_req, res) => {
  try {
    const records = await Attendance.find().populate("studentId").sort({ date: -1 });
    res.json(records);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ message: "Unable to fetch attendance" });
  }
};

const getAttendanceReport = async (_req, res) => {
  try {
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
  } catch (error) {
    console.error("Error creating attendance report:", error);
    res.status(500).json({ message: "Unable to create attendance report" });
  }
};

const getAttendanceHistory = async (req, res) => {
  try {
    const { id: studentId } = req.params;
    if (!isValidId(studentId)) return res.status(400).json({ message: "Invalid student id" });

    const records = await Attendance.find({ studentId })
      .select("date status subject")
      .sort({ date: -1 });
    res.json(records);
  } catch (error) {
    console.error("Error fetching attendance history:", error);
    res.status(500).json({ message: "Unable to fetch attendance history" });
  }
};

module.exports = {
  markAttendance,
  getAttendance,
  getStudentAttendance,
  getAttendanceReport,
  getAttendanceHistory
};
