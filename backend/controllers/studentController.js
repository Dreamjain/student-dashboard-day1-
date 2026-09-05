const Student = require("../models/studentModel");
const Attendance = require("../models/attendanceModel");
const Marks = require("../models/marksModel");

const handleError = (res, error) => {
  if (error.name === "ValidationError") {
    return res.status(400).json({ message: error.message });
  }

  if (error.name === "CastError") {
    return res.status(400).json({ message: "Invalid student id" });
  }

  console.error(error);
  return res.status(500).json({ message: "Internal server error" });
};

exports.createStudent = async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (error) {
    handleError(res, error);
  }
};

exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ rollNumber: 1 });
    res.json(students);
  } catch (error) {
    handleError(res, error);
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);
  } catch (error) {
    handleError(res, error);
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(updatedStudent);
  } catch (error) {
    handleError(res, error);
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);

    if (!deletedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    handleError(res, error);
  }
};

exports.getStudentSummary = async (req, res) => {
  try {
    const { id: studentId } = req.params;
    const student = await Student.findById(studentId).select("name");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const [attendanceRecords, marksRecords] = await Promise.all([
      Attendance.find({ studentId }).select("status -_id"),
      Marks.find({ studentId }).select("score -_id")
    ]);

    const totalClasses = attendanceRecords.length;
    const present = attendanceRecords.filter(
      (record) => record.status === "present"
    ).length;

    const attendancePercentage = totalClasses === 0
      ? 0
      : (present / totalClasses) * 100;

    const totalMarks = marksRecords.reduce((sum, mark) => sum + mark.score, 0);
    const averageMarks = marksRecords.length === 0
      ? 0
      : totalMarks / marksRecords.length;

    res.json({
      name: student.name,
      attendancePercentage: Number(attendancePercentage.toFixed(2)),
      averageMarks: Number(averageMarks.toFixed(2))
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.loginStudent = async (req, res) => {
  try {
    const { rollNumber, password } = req.body;

    if (!rollNumber || !password) {
      return res.status(400).json({ message: "Roll number and password are required" });
    }

    const student = await Student.findOne({ rollNumber }).select("+password");

    if (!student || student.password !== password) {
      return res.status(401).json({ message: "Invalid roll number or password" });
    }

    res.json({
      id: student._id,
      name: student.name,
      rollNumber: student.rollNumber,
      department: student.department,
      year: student.year
    });
  } catch (error) {
    handleError(res, error);
  }
};
