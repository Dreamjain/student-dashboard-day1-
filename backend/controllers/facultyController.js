const Faculty = require("../models/facultyModel");
const { verifyPassword } = require("../utils/password");
const { issueSession } = require("../utils/sessionManager");
const { normalizeEmail, validateFacultyInput } = require("../utils/validation");
const { setSessionCookies } = require("../utils/sessionCookies");

const loginFaculty = async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password ?? "");

  if (!email || !password) return res.status(400).json({ message: "Email and password are required" });
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: "A valid email address is required" });
  }

  const faculty = await Faculty.findOne({ email }).select("+password");
  if (!faculty || !(await verifyPassword(password, faculty.password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const session = await issueSession(faculty._id, "faculty");
  setSessionCookies(res, session);
  res.json({ message: "Login successful", facultyId: faculty._id });
};

const registerFaculty = async (req, res) => {
  const validation = validateFacultyInput(req.body);
  if (!validation.valid) return res.status(400).json({ message: validation.message });

  const faculty = await Faculty.create(validation.data);
  res.status(201).json({ message: "Faculty registered successfully", facultyId: faculty._id });
};

module.exports = { loginFaculty, registerFaculty };
