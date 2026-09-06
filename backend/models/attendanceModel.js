const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80
    },
    date: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ["present", "absent"],
      required: true,
      lowercase: true
    }
  },
  { timestamps: true }
);

attendanceSchema.index({ studentId: 1, date: -1 });

module.exports = mongoose.model("Attendance", attendanceSchema);
