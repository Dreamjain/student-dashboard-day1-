const Student = require("../models/studentModel");
const Attendance = require("../models/attendanceModel");
const Marks = require("../models/marksModel");
const { verifyPassword } = require("../utils/password");
const { sign } = require("../utils/jwt");
const { validateCredentials, validateStudentInput, validateStudentUpdate } = require("../utils/validation");

exports.createStudent = async (req, res) => {
  const validation = validateStudentInput(req.body);
  if (!validation.valid) return res.status(400).json({ message: validation.message });

  res.status(201).json(await Student.create(validation.data));
};

exports.getStudents = async (req, res) => {
  res.json(await Student.find().sort({ rollNumber: 1 }));
};

exports.getStudentById = async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ message: "Student not found" });
  res.json(student);
};

exports.updateStudent = async (req, res) => {
  const validation = validateStudentUpdate(req.body);
  if (!validation.valid) return res.status(400).json({ message: validation.message });

  const updatedStudent = await Student.findByIdAndUpdate(req.params.id, validation.data, {
    new: true,
    runValidators: true
  });
  if (!updatedStudent) return res.status(404).json({ message: "Student not found" });
  res.json(updatedStudent);
};

exports.deleteStudent = async (req, res) => {
  const deletedStudent = await Student.findByIdAndDelete(req.params.id);
  if (!deletedStudent) return res.status(404).json({ message: "Student not found" });
  res.json({ message: "Student deleted successfully" });
};

exports.getStudentSummary = async (req, res) => {
  const { id: studentId } = req.params;
  const student = await Student.findById(studentId).select("name");
  if (!student) return res.status(404).json({ message: "Student not found" });

  const [attendanceRecords, marksRecords] = await Promise.all([
    Attendance.find({ studentId }).select("status -_id"),
    Marks.find({ studentId }).select("score -_id")
  ]);

  const totalClasses = attendanceRecords.length;
  const present = attendanceRecords.filter((record) => record.status === "present").length;
  const attendancePercentage = totalClasses === 0 ? 0 : (present / totalClasses) * 100;
  const totalMarks = marksRecords.reduce((sum, mark) => sum + mark.score, 0);
  const averageMarks = marksRecords.length === 0 ? 0 : totalMarks / marksRecords.length;

  res.json({
    name: student.name,
    attendancePercentage: Number(attendancePercentage.toFixed(2)),
    averageMarks: Number(averageMarks.toFixed(2))
  });
};

exports.loginStudent = async (req, res) => {
  const validation = validateCredentials(req.body);
  if (!validation.valid) return res.status(400).json({ message: validation.message });

  const student = await Student.findOne({ rollNumber: validation.rollNumber }).select("+password");
  if (!student || !(await verifyPassword(validation.password, student.password))) {
    return res.status(401).json({ message: "Invalid roll number or password" });
  }

  const token = sign({ id: String(student._id), role: "student" });
  res.json({
    token,
    user: {
      id: student._id,
      name: student.name,
      rollNumber: student.rollNumber,
      department: student.department,
      year: student.year
    }
  });
};
