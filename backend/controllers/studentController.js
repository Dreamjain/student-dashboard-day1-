const Student = require("../models/studentModel");

// Create student
exports.createStudent = async (req, res) => {
  try {
    const student = new Student(req.body);
    const savedStudent = await student.save();
    res.status(201).json(savedStudent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all students
exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student by id
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update student
exports.updateStudent = async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete student
exports.deleteStudent = async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);

    if (!deletedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

exports.getStudentSummary = async (req, res) => {
  try {

    const studentId = req.params.id;

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const attendanceRecords = await Attendance.find({ studentId });

    const totalClasses = attendanceRecords.length;

    const present = attendanceRecords.filter(
      (record) => record.status === "present"
    ).length;

    const attendancePercentage =
      totalClasses === 0 ? 0 : (present / totalClasses) * 100;

    const marksRecords = await Marks.find({ studentId });

    const totalMarks = marksRecords.reduce(
      (sum, mark) => sum + mark.score,
      0
    );

    const averageMarks =
      marksRecords.length === 0
        ? 0
        : totalMarks / marksRecords.length;

    res.json({
      name: student.name,
      attendancePercentage: attendancePercentage.toFixed(2),
      averageMarks: averageMarks.toFixed(2)
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.loginStudent = async (req, res) => {
  try {
    const { rollNumber, password } = req.body;

    const student = await Student.findOne({ rollNumber });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (student.Password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};