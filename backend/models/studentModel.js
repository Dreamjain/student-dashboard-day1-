const mongoose = require("mongoose");
const { hashPassword, isPasswordHash } = require("../utils/password");

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    rollNumber: { type: String, required: true, unique: true, trim: true, uppercase: true, index: true },
    department: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    year: { type: Number, required: true, min: 1, max: 8 },
    password: { type: String, required: true, minlength: 8, select: false }
  },
  { timestamps: true }
);

studentSchema.pre("save", async function hashStudentPassword() {
  if (!this.isModified("password") || isPasswordHash(this.password)) return;
  this.password = await hashPassword(this.password);
});

studentSchema.pre("findOneAndUpdate", async function hashUpdatedStudentPassword() {
  const update = this.getUpdate();
  const password = update?.$set?.password ?? update?.password;
  if (!password || isPasswordHash(password)) return;

  const hashedPassword = await hashPassword(password);
  if (update.$set) update.$set.password = hashedPassword;
  else update.password = hashedPassword;
});

studentSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model("Student", studentSchema);
