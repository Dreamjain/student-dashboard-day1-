const Faculty = require("../models/facultyModel");
const { verifyPassword } = require("../utils/password");

// LOGIN
const loginFaculty = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const faculty = await Faculty.findOne({ email }).select("+password");

    if (!faculty || !(await verifyPassword(password, faculty.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      message: "Login successful",
      facultyId: faculty._id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const registerFaculty = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const faculty = await Faculty.create({ name, email, password });

    res.status(201).json({
      message: "Faculty registered successfully",
      facultyId: faculty._id
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Faculty email already exists" });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { loginFaculty, registerFaculty };
