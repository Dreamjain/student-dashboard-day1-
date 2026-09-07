const connectDB = require("./config/db");
const Student = require("./models/studentModel");
const { hashPassword } = require("./utils/password");
const students = require("./students.json");

const importData = async () => {
  try {
    await connectDB();

    console.log("DB Connected for seeding...");

    await Student.deleteMany();

    const studentsWithHashedPasswords = await Promise.all(
      students.map(async (student) => ({
        ...student,
        password: await hashPassword(student.password || "123456")
      }))
    );

    await Student.insertMany(studentsWithHashedPasswords);

    console.log("Students Added Successfully ✅");

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

importData();
