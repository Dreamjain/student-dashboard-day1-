const Faculty = require("../models/facultyModel");

// LOGIN
const loginFaculty = async (req, res) => {
  const { email, password } = req.body;

  try {
    const faculty = await Faculty.findOne({ email });

    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    if (faculty.password !== password) {
      return res.status(400).json({ message: "Invalid password" });
    }

    res.json({
      message: "Login successful",
      facultyId: faculty._id
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const registerFaculty = async (req, res) => {
  try {
    const faculty = new Faculty(req.body);
    const savedFaculty = await faculty.save();

    res.status(201).json(savedFaculty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { loginFaculty, registerFaculty };