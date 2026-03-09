const Student = require("./models/studentModel");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db.js");

const app = express();
console.log("SERVER FILE LOADED");

connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Student Dashboard Backend Running 🚀");
});

app.get("/students", async (req, res) => {
  console.log("GET /students route hit");

  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/students/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/students", async (req, res) => {
  try {
    const student = new Student(req.body);

    const savedStudent = await student.save();

    res.status(201).json(savedStudent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = 5000;

app.put("/students/:id", async (req, res) => {
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
});

app.delete("/students/:id", async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);

    if (!deletedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});