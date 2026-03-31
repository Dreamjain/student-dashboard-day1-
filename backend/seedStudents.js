const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Student = require("./models/studentModel");
const students = require("./students.json");

const importData = async () => {
  try {
    await connectDB(); // connect DB

    console.log("DB Connected for seeding...");

    await Student.deleteMany();

    await Student.insertMany(students);

    console.log("Students Added Successfully ✅");

    process.exit();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

importData();