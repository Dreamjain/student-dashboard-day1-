const Faculty = require("../models/facultyModel");
const { verifyPassword } = require("../utils/password");
const { sign } = require("../utils/jwt");

const loginFaculty = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

  const faculty = await Faculty.findOne({ email }).select("+password");
  if (!faculty || !(await verifyPassword(password, faculty.password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = sign({ id: String(faculty._id), role: "faculty" });
  res.json({ message: "Login successful", token, facultyId: faculty._id });
};

const registerFaculty = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }

  const faculty = await Faculty.create({ name, email, password });
  res.status(201).json({ message: "Faculty registered successfully", facultyId: faculty._id });
};

module.exports = { loginFaculty, registerFaculty };
