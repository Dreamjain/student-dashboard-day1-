const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: String,
  rollNumber: {
    type: String,
    UNIQUE: true
  },
  department: String,
  year: Number,
  Password: {
    type: String,
    default: "123456"
  }
});
const Student = mongoose.model("Student", studentSchema);

module.exports = Student;