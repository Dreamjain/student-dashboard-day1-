const { buildAcademicContext } = require("./aiController");

exports.trends = async (req, res, next) => {
  try {
    const data = await buildAcademicContext(req.user.id);
    if (!data) return res.status(404).json({ message: "Student not found" });
    res.json({
      metrics: data.metrics,
      strongestSubjects: data.strongestSubjects,
      weakestSubjects: data.weakestSubjects,
      attendanceRiskSubjects: data.attendanceBySubject.filter((x) => x.percentage < 75)
    });
  } catch (error) { next(error); }
};
