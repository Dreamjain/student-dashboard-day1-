const mongoose = require("mongoose");
const { hashPassword, isPasswordHash } = require("../utils/password");

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2
    },
    rollNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    department: {
      type: String,
      required: true,
      trim: true
    },
    year: {
      type: Number,
      required: true,
      min: 1,
      max: 8
    },
    password: {
      type: String,
      required: true,
      default: "123456",
      minlength: 6,
      select: false
    }
  },
  { timestamps: true }
);

studentSchema.pre("save", async function hashStudentPassword(next) {
  if (!this.isModified("password") || isPasswordHash(this.password)) {
    return next();
  }

  this.password = await hashPassword(this.password);
  return next();
});

studentSchema.pre("findOneAndUpdate", async function hashUpdatedStudentPassword() {
  const update = this.getUpdate();
  const password = update?.$set?.password ?? update?.password;

  if (!password || isPasswordHash(password)) return;

  const hashedPassword = await hashPassword(password);

  if (update.$set) {
    update.$set.password = hashedPassword;
  } else {
    update.password = hashedPassword;
  }
});

studentSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model("Student", studentSchema);
