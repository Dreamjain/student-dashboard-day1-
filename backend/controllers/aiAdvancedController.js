const { buildAcademicContext } = require("./aiController");
const { requestAI, isAIConfigured } = require("../services/aiService");
const { validateChatMessage, limitContext } = require("../services/aiGuard");

const run = (task, data, output) => requestAI(JSON.stringify({ task, output, academicData: limitContext(data) }));

const requireAI = (res) => {
  if (isAIConfigured()) return true;
  res.status(503).json({ message: "AI assistant is not configured yet." });
  return false;
};

exports.attendance = async (req, res, next) => {
  if (!requireAI(res)) return;
  try {
    const data = await buildAcademicContext(req.user.id);
    if (!data) return res.status(404).json({ message: "Student not found" });
    const result = await run("Explain attendance risk from the supplied records.", data, ["Prioritize subjects.", "Give practical actions.", "Use only supplied facts."]);
    res.json({ analysis: result.text, attendance: data.attendanceBySubject });
  } catch (error) { next(error); }
};

exports.planner = async (req, res, next) => {
  if (!requireAI(res)) return;
  try {
    const data = await buildAcademicContext(req.user.id);
    if (!data) return res.status(404).json({ message: "Student not found" });
    const result = await run("Create a personalized seven-day study plan.", data, ["Prioritize weak areas.", "Use timetable data.", "Keep sessions practical."]);
    res.json({ plan: result.text });
  } catch (error) { next(error); }
};

exports.chat = async (req, res, next) => {
  if (!requireAI(res)) return;
  const checked = validateChatMessage(req.body?.message);
  if (!checked.valid) return res.status(400).json({ message: checked.message });
  try {
    const data = await buildAcademicContext(req.user.id);
    if (!data) return res.status(404).json({ message: "Student not found" });
    const result = await run("Answer the student's academic question using supplied dashboard facts.", { question: checked.value, data }, ["Answer directly.", "Use only supplied facts.", "Say when information is unavailable."]);
    res.json({ answer: result.text });
  } catch (error) { next(error); }
};
