const Attendance = require("../models/attendanceModel");

const markAttendance = async (req, res) => {
  try {
    const attendance = new Attendance(req.body);
    const savedAttendance = await attendance.save();
    res.status(201).json(savedAttendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStudentAttendance = async (req, res) => {
  try {
    const studentId = req.params.id;

    const records = await Attendance.find({ studentId });

    const totalClasses = records.length;

    const present = records.filter(
      (record) => record.status === "present"
    ).length;

    const percentage =
      totalClasses === 0 ? 0 : (present / totalClasses) * 100;

    res.json({
      studentId,
      totalClasses,
      present,
      percentage: percentage.toFixed(2)
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAttendance = async (req, res) => {
  try {
    const records = await Attendance.find().populate("studentId");
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAttendanceReport = async (req, res) => {
  try {
    const students = await Attendance.aggregate([
      {
        $group: {
          _id: "$studentId",
          totalClasses: { $sum: 1 },
          present: {
            $sum: {
              $cond: [{ $eq: ["$status", "present"] }, 1, 0]
            }
          }
        }
      }
    ]);

    res.json(students);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAttendanceHistory = async (req, res) => {
  try {

    const studentId = req.params.id;

    const records = await Attendance.find({ studentId })
      .select("date status")
      .sort({ date: -1 });

    res.json(records);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  markAttendance,
  getAttendance,
  getStudentAttendance,
  getAttendanceReport,
  getAttendanceHistory
};
