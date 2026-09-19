const mongoose = require("mongoose");
const { hashPassword, isPasswordHash } = require("../utils/password");

const facultySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 254, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    password: { type: String, required: true, minlength: 8, select: false }
  },
  { timestamps: true }
);

facultySchema.pre("save", async function hashFacultyPassword() {
  if (!this.isModified("password") || isPasswordHash(this.password)) return;
  this.password = await hashPassword(this.password);
});

facultySchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model("Faculty", facultySchema);
