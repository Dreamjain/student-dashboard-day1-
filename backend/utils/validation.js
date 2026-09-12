const normalizeRollNumber = (value) => String(value ?? "").trim().toUpperCase();

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

  if (normalizedName.length < 2) {
    return { valid: false, message: "Name must be at least 2 characters" };
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

module.exports = { normalizeRollNumber, validateCredentials, validateStudentInput };
