const crypto = require("crypto");
const connectDB = require("./config/db");
const Student = require("./models/studentModel");
const { hashPassword } = require("./utils/password");
const students = require("./students.json");

const generateSeedPassword = () => crypto.randomBytes(18).toString("base64url");

const importData = async () => {
  try {
    await connectDB();
    console.log("DB Connected for seeding...");

    await Student.deleteMany();

    const credentials = [];
    const studentsWithHashedPasswords = await Promise.all(
      students.map(async (student) => {
        const password = generateSeedPassword();
        credentials.push({ rollNumber: student.rollNumber, password });
        return {
          ...student,
          password: await hashPassword(password)
        };
      })
    );

    await Student.insertMany(studentsWithHashedPasswords);

    console.log("Demo student credentials (store securely and do not use in production):");
    credentials.forEach(({ rollNumber, password }) => {
      console.log(`  ${rollNumber}: ${password}`);
    });
    console.log("Students Added Successfully ✅");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

importData();
