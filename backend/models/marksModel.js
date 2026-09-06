const mongoose = require("mongoose");

const marksSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    }
  },
  { timestamps: true }
);

marksSchema.index({ studentId: 1, subject: 1 });

module.exports = mongoose.model("Marks", marksSchema);
