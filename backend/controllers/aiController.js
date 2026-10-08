const Student = require("../models/studentModel");
const Attendance = require("../models/attendanceModel");
const Marks = require("../models/marksModel");
const { requestAI, isAIConfigured } = require("../services/aiService");

const round = (value) => Number(value.toFixed(2));

const buildAcademicContext = async (studentId) => {
  const [student, attendanceRecords, marksRecords] = await Promise.all([
    Student.findById(studentId).select("name department year"),
    Attendance.find({ studentId }).select("subject date status -_id").sort({ date: -1 }),
    Marks.find({ studentId }).select("subject score -_id").sort({ score: 1 })
  ]);

  if (!student) return null;

  const totalClasses = attendanceRecords.length;
  const presentClasses = attendanceRecords.filter((record) => record.status === "present").length;
  const attendancePercentage = totalClasses === 0 ? 0 : round((presentClasses / totalClasses) * 100);
  const averageMarks = marksRecords.length === 0
    ? 0
    : round(marksRecords.reduce((sum, mark) => sum + mark.score, 0) / marksRecords.length);

  const subjectAttendance = {};
  for (const record of attendanceRecords) {
    const key = record.subject;
    if (!subjectAttendance[key]) subjectAttendance[key] = { total: 0, present: 0 };
    subjectAttendance[key].total += 1;
    if (record.status === "present") subjectAttendance[key].present += 1;
  }

  const attendanceBySubject = Object.entries(subjectAttendance).map(([subject, value]) => ({
    subject,
    totalClasses: value.total,
    present: value.present,
    percentage: value.total === 0 ? 0 : round((value.present / value.total) * 100)
  }));

  return {
    student: {
      name: student.name,
      department: student.department,
      year: student.year
    },
    metrics: {
      totalAttendanceClasses: totalClasses,
      presentClasses,
      attendancePercentage,
      averageMarks
    },
    attendanceBySubject,
    marks: marksRecords.map((mark) => ({
      subject: mark.subject,
      score: mark.score
    }))
  };
};

exports.getAcademicAnalysis = async (req, res, next) => {
  if (!isAIConfigured()) {
    return res.status(503).json({
      message: "AI assistant is not configured yet. Add OPENAI_API_KEY on the server."
    });
  }

  try {
    const context = await buildAcademicContext(req.user.id);

    if (!context) {
      return res.status(404).json({ message: "Student not found" });
    }

    const result = await requestAI(JSON.stringify({
      task: "Analyze this student's current academic performance.",
      output: [
        "Summarize the strongest areas.",
        "Identify the most important areas needing attention.",
        "Give 3 prioritized actions for the next 1-2 weeks.",
        "Keep the advice specific to the supplied data."
      ],
      academicData: context
    }));

    return res.json({
      generatedBy: "academic-copilot",
      model: result.model,
      analysis: result.text,
      metrics: context.metrics
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { buildAcademicContext, getAcademicAnalysis: exports.getAcademicAnalysis };
