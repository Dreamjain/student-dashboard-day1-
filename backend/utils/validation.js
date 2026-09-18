const normalizeRollNumber = (value) => String(value ?? "").trim().toUpperCase();

const normalizeEmail = (value) => String(value ?? "").trim().toLowerCase();

const validateCredentials = ({ rollNumber, password } = {}) => {
  const normalizedRollNumber = normalizeRollNumber(rollNumber);
  const normalizedPassword = String(password ?? "");

  if (!normalizedRollNumber || !normalizedPassword) {
    return { valid: false, message: "Roll number and password are required" };
  }

  if (normalizedRollNumber.length > 30) {
    return { valid: false, message: "Roll number must be 30 characters or fewer" };
  }

  if (normalizedPassword.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters" };
  }

  return { valid: true, rollNumber: normalizedRollNumber, password: normalizedPassword };
};

const validateStudentInput = ({ name, rollNumber, department, year, password } = {}) => {
  const normalizedName = String(name ?? "").trim();
  const normalizedRollNumber = normalizeRollNumber(rollNumber);
  const normalizedDepartment = String(department ?? "").trim();
  const numericYear = Number(year);
  const normalizedPassword = String(password ?? "");

  if (!normalizedName || !normalizedRollNumber || !normalizedDepartment || year === undefined || year === null || !normalizedPassword) {
    return { valid: false, message: "Name, roll number, department, year, and password are required" };
  }

  if (normalizedName.length < 2 || normalizedName.length > 100) {
    return { valid: false, message: "Name must be between 2 and 100 characters" };
  }

  if (normalizedRollNumber.length > 30) {
    return { valid: false, message: "Roll number must be 30 characters or fewer" };
  }

  if (normalizedDepartment.length < 2 || normalizedDepartment.length > 100) {
    return { valid: false, message: "Department must be between 2 and 100 characters" };
  }

  if (!Number.isInteger(numericYear) || numericYear < 1 || numericYear > 8) {
    return { valid: false, message: "Year must be an integer between 1 and 8" };
  }

  if (normalizedPassword.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters" };
  }

  return {
    valid: true,
    data: {
      name: normalizedName,
      rollNumber: normalizedRollNumber,
      department: normalizedDepartment,
      year: numericYear,
      password: normalizedPassword,
    },
  };
};

const validateStudentUpdate = (input = {}) => {
  const allowedFields = ["name", "rollNumber", "department", "year", "password"];
  const unknownFields = Object.keys(input).filter((field) => !allowedFields.includes(field));
  if (unknownFields.length > 0) {
    return { valid: false, message: "Unsupported student fields" };
  }

  if (Object.keys(input).length === 0) {
    return { valid: false, message: "At least one student field is required" };
  }

  const data = {};

  if (Object.prototype.hasOwnProperty.call(input, "name")) {
    const value = String(input.name ?? "").trim();
    if (value.length < 2 || value.length > 100) return { valid: false, message: "Name must be between 2 and 100 characters" };
    data.name = value;
  }

  if (Object.prototype.hasOwnProperty.call(input, "rollNumber")) {
    const value = normalizeRollNumber(input.rollNumber);
    if (!value || value.length > 30) return { valid: false, message: "Roll number must be between 1 and 30 characters" };
    data.rollNumber = value;
  }

  if (Object.prototype.hasOwnProperty.call(input, "department")) {
    const value = String(input.department ?? "").trim();
    if (value.length < 2 || value.length > 100) return { valid: false, message: "Department must be between 2 and 100 characters" };
    data.department = value;
  }

  if (Object.prototype.hasOwnProperty.call(input, "year")) {
    const value = Number(input.year);
    if (!Number.isInteger(value) || value < 1 || value > 8) return { valid: false, message: "Year must be an integer between 1 and 8" };
    data.year = value;
  }

  if (Object.prototype.hasOwnProperty.call(input, "password")) {
    const value = String(input.password ?? "");
    if (value.length < 8) return { valid: false, message: "Password must be at least 8 characters" };
    data.password = value;
  }

  return { valid: true, data };
};

const validateMarksInput = ({ studentId, subject, score } = {}) => {
  const normalizedSubject = String(subject ?? "").trim();
  const numericScore = Number(score);

  if (!studentId || !normalizedSubject || score === undefined || score === null) {
    return { valid: false, message: "Student id, subject, and score are required" };
  }

  if (normalizedSubject.length < 2 || normalizedSubject.length > 80) {
    return { valid: false, message: "Subject must be between 2 and 80 characters" };
  }

  if (!Number.isFinite(numericScore) || numericScore < 0 || numericScore > 100) {
    return { valid: false, message: "Score must be a number between 0 and 100" };
  }

  return { valid: true, data: { studentId, subject: normalizedSubject, score: numericScore } };
};

const validateAttendanceInput = ({ studentId, date, status, subject } = {}) => {
  const normalizedSubject = String(subject ?? "").trim();
  const normalizedStatus = String(status ?? "").trim().toLowerCase();
  const parsedDate = new Date(date);

  if (!studentId || !normalizedSubject || !date || !normalizedStatus) {
    return { valid: false, message: "Student id, date, subject, and status are required" };
  }

  if (normalizedSubject.length < 2 || normalizedSubject.length > 80) {
    return { valid: false, message: "Subject must be between 2 and 80 characters" };
  }

  if (!["present", "absent"].includes(normalizedStatus)) {
    return { valid: false, message: "Status must be present or absent" };
  }

  if (Number.isNaN(parsedDate.getTime())) {
    return { valid: false, message: "A valid date is required" };
  }

  if (parsedDate > new Date()) {
    return { valid: false, message: "Attendance date cannot be in the future" };
  }

  return { valid: true, data: { studentId, date, subject: normalizedSubject, status: normalizedStatus } };
};

const validateFacultyInput = ({ name, email, password } = {}) => {
  const normalizedName = String(name ?? "").trim();
  const normalizedEmail = normalizeEmail(email);
  const normalizedPassword = String(password ?? "");

  if (!normalizedName || !normalizedEmail || !normalizedPassword) {
    return { valid: false, message: "Name, email, and password are required" };
  }

  if (normalizedName.length < 2 || normalizedName.length > 100) {
    return { valid: false, message: "Name must be between 2 and 100 characters" };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || normalizedEmail.length > 254) {
    return { valid: false, message: "A valid email address is required" };
  }

  if (normalizedPassword.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters" };
  }

  return { valid: true, data: { name: normalizedName, email: normalizedEmail, password: normalizedPassword } };
};

module.exports = {
  normalizeRollNumber,
  normalizeEmail,
  validateCredentials,
  validateStudentInput,
  validateStudentUpdate,
  validateMarksInput,
  validateAttendanceInput,
  validateFacultyInput,
};
