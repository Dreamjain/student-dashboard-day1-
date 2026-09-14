const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const Marks = require("../models/marksModel");
const Attendance = require("../models/attendanceModel");

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

test("MongoDB rejects duplicate marks for the same student and subject", { skip: !mongoUri }, async () => {
  await mongoose.connect(mongoUri);
  try {
    await Marks.deleteMany({});
    await Marks.syncIndexes();

    const studentId = new mongoose.Types.ObjectId();
    await Marks.create({ studentId, subject: "Database Systems", score: 85 });

    await assert.rejects(
      Marks.create({ studentId, subject: "Database Systems", score: 90 }),
      (error) => error?.code === 11000
    );
  } finally {
    await Marks.deleteMany({});
    await mongoose.disconnect();
  }
});

test("MongoDB rejects duplicate attendance for the same student, subject and date", { skip: !mongoUri }, async () => {
  await mongoose.connect(mongoUri);
  try {
    await Attendance.deleteMany({});
    await Attendance.syncIndexes();

    const studentId = new mongoose.Types.ObjectId();
    const date = new Date("2026-09-14T00:00:00.000Z");
    await Attendance.create({ studentId, subject: "Computer Networks", date, status: "present" });

    await assert.rejects(
      Attendance.create({ studentId, subject: "Computer Networks", date, status: "absent" }),
      (error) => error?.code === 11000
    );
  } finally {
    await Attendance.deleteMany({});
    await mongoose.disconnect();
  }
});
