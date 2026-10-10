const mongoose = require("mongoose");

// Timetable is intentionally institution/class-wide in the current product contract.
// It is not student-owned data, so authenticated students read the shared schedule.
const timetableSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80
    },
    time: {
      type: String,
      required: true,
      trim: true,
      match: /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i
    }
  },
  { timestamps: true }
);

timetableSchema.index({ day: 1, time: 1 });

module.exports = mongoose.model("Timetable", timetableSchema);
