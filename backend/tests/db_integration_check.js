const mongoose = require("mongoose");
const Marks = require("../models/marksModel");
const Attendance = require("../models/attendanceModel");

const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!uri) process.exit(0);

(async () => {
  await mongoose.connect(uri);
  try {
    await Marks.deleteMany({});
    await Attendance.deleteMany({});
    await Marks.syncIndexes();
    await Attendance.syncIndexes();
    const studentId = new mongoose.Types.ObjectId();
    await Marks.create({ studentId, subject: "Database Systems", score: 85 });
    let duplicateRejected = false;
    try { await Marks.create({ studentId, subject: "Database Systems", score: 90 }); } catch (e) { duplicateRejected = e?.code === 11000; }
    if (!duplicateRejected) throw new Error("Duplicate marks were not rejected");
    const date = new Date("2026-09-14T00:00:00.000Z");
    await Attendance.create({ studentId, subject: "Computer Networks", date, status: "present" });
    duplicateRejected = false;
    try { await Attendance.create({ studentId, subject: "Computer Networks", date, status: "absent" }); } catch (e) { duplicateRejected = e?.code === 11000; }
    if (!duplicateRejected) throw new Error("Duplicate attendance was not rejected");
    console.log("MongoDB duplicate-record constraints verified");
  } finally {
    await Marks.deleteMany({});
    await Attendance.deleteMany({});
    await mongoose.disconnect();
  }
})();
