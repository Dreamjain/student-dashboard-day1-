const connectDB = require("../config/db");
const Student = require("../models/studentModel");
const Faculty = require("../models/facultyModel");
const { hashPassword, isPasswordHash } = require("../utils/password");

const migratePasswords = async () => {
  try {
    await connectDB();

    let studentCount = 0;
    let facultyCount = 0;

    const students = await Student.find().select("+password");
    for (const student of students) {
      if (isPasswordHash(student.password)) continue;

      await Student.updateOne(
        { _id: student._id },
        { $set: { password: await hashPassword(student.password) } }
      );
      studentCount += 1;
    }

    const facultyMembers = await Faculty.find().select("+password");
    for (const faculty of facultyMembers) {
      if (isPasswordHash(faculty.password)) continue;

      await Faculty.updateOne(
        { _id: faculty._id },
        { $set: { password: await hashPassword(faculty.password) } }
      );
      facultyCount += 1;
    }

    console.log(`Password migration complete: ${studentCount} students, ${facultyCount} faculty members.`);
    process.exit(0);
  } catch (error) {
    console.error("Password migration failed:", error);
    process.exit(1);
  }
};

migratePasswords();
