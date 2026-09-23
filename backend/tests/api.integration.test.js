const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const { app } = require("../server");
const Student = require("../models/studentModel");
const Faculty = require("../models/facultyModel");
const Marks = require("../models/marksModel");
const Attendance = require("../models/attendanceModel");
const Timetable = require("../models/timetableModel");

const hasMongo = Boolean(process.env.MONGO_URI);
const integrationTest = hasMongo ? test : test.skip;

let server;
let baseUrl;
let student;
let otherStudent;
let studentSession;
let facultySession;

const request = (path, options) => fetch(`${baseUrl}${path}`, options);

const getSetCookies = (response) =>
  typeof response.headers.getSetCookie === "function"
    ? response.headers.getSetCookie()
    : [];

const getCookie = (setCookies, name) => {
  const value = setCookies.find((cookie) => cookie.startsWith(`${name}=`));
  return value ? value.split(";", 1)[0] : "";
};

const loginSession = async (path, body) => {
  const csrfResponse = await request("/auth/csrf");
  assert.equal(csrfResponse.status, 200);
  const preAuthCsrfCookie = getCookie(getSetCookies(csrfResponse), "studentDashboardCsrf");
  assert.ok(preAuthCsrfCookie);

  const loginResponse = await request(path, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      cookie: preAuthCsrfCookie,
      "x-csrf-token": decodeURIComponent(preAuthCsrfCookie.slice(preAuthCsrfCookie.indexOf("=") + 1))
    },
    body: JSON.stringify(body)
  });
  assert.equal(loginResponse.status, 200);

  const responseBody = await loginResponse.json();
  const setCookies = getSetCookies(loginResponse);
  const authCookie = getCookie(setCookies, "studentDashboardAuth");
  const sessionCsrfCookie = getCookie(setCookies, "studentDashboardCsrf");
  assert.ok(authCookie);
  assert.ok(sessionCsrfCookie);

  return {
    cookie: `${authCookie}; ${sessionCsrfCookie}`,
    csrf: decodeURIComponent(sessionCsrfCookie.slice(sessionCsrfCookie.indexOf("=") + 1)),
    body: responseBody
  };
};

const jsonRequest = (path, method, body, auth) => request(path, {
  method,
  headers: {
    "content-type": "application/json",
    ...(auth?.cookie
      ? { cookie: auth.cookie, "x-csrf-token": auth.csrf }
      : auth
        ? { authorization: auth }
        : {})
  },
  body: JSON.stringify(body)
});

const authRequest = (path, session, options = {}) => request(path, {
  ...options,
  headers: {
    ...(options.headers || {}),
    cookie: session.cookie,
    "x-csrf-token": session.csrf
  }
});

test.before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;

  if (!hasMongo) return;

  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([
    Student.deleteMany({ rollNumber: /^INTEGRATION-/ }),
    Faculty.deleteMany({ email: /@integration\.test$/ }),
    Marks.deleteMany({}),
    Attendance.deleteMany({}),
    Timetable.deleteMany({})
  ]);

  [student, otherStudent] = await Student.create([
    {
      name: "Integration Student",
      rollNumber: "INTEGRATION-STUDENT",
      department: "CSE",
      year: 3,
      password: "studentpass123"
    },
    {
      name: "Other Integration Student",
      rollNumber: "INTEGRATION-OTHER",
      department: "CSE",
      year: 2,
      password: "studentpass123"
    }
  ]);

  const faculty = await Faculty.create({
    name: "Integration Faculty",
    email: "faculty@integration.test",
    password: "facultypass123"
  });

  studentSession = await loginSession("/students/login", {
    rollNumber: "integration-student",
    password: "studentpass123"
  });

  facultySession = await loginSession("/api/faculty/login", {
    email: faculty.email,
    password: "facultypass123"
  });
});

test.after(async () => {
  if (server) {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
  if (hasMongo) await mongoose.disconnect();
});

test("GET /health returns a healthy service response", async () => {
  const response = await request("/health");
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok" });
});

integrationTest("GET /health/ready reports database readiness", async () => {
  const response = await request("/health/ready");
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    status: "ready",
    database: "connected"
  });
});

test("GET / returns the API service status", async () => {
  const response = await request("/");
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    service: "Student Dashboard API",
    status: "running"
  });
});

test("unknown routes return the standardized 404 response", async () => {
  const response = await request("/does-not-exist");
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { message: "Route not found" });
});

test("protected student route rejects requests without authentication", async () => {
  const response = await request("/students");
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { message: "Authentication required" });
});

test("malformed JSON is rejected by the API middleware stack", async () => {
  const response = await request("/students/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{invalid"
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { message: "Invalid JSON payload" });
});

integrationTest("student login returns a safe user payload and cookie session", async () => {
  const session = await loginSession("/students/login", {
    rollNumber: "INTEGRATION-STUDENT",
    password: "studentpass123"
  });

  assert.equal(session.body.user.rollNumber, "INTEGRATION-STUDENT");
  assert.equal(session.body.user.password, undefined);
  assert.ok(session.cookie);
});

integrationTest("student JWT can access its own summary but not another student's summary", async () => {
  const ownResponse = await authRequest(`/students/summary/${student._id}`, studentSession);
  assert.equal(ownResponse.status, 200);
  assert.deepEqual(await ownResponse.json(), {
    name: "Integration Student",
    attendancePercentage: 0,
    averageMarks: 0
  });

  const otherResponse = await authRequest(`/students/summary/${otherStudent._id}`, studentSession);
  assert.equal(otherResponse.status, 403);
});

integrationTest("cookie-authenticated state changes require a valid CSRF header", async () => {
  const missingToken = await request("/students", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      cookie: facultySession.cookie
    },
    body: JSON.stringify({
      name: "CSRF Test",
      rollNumber: "INTEGRATION-CSRF",
      department: "CSE",
      year: 1,
      password: "csrfpass123"
    })
  });
  assert.equal(missingToken.status, 403);

  const invalidToken = await request("/students", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      cookie: facultySession.cookie,
      "x-csrf-token": "invalid"
    },
    body: JSON.stringify({
      name: "CSRF Test",
      rollNumber: "INTEGRATION-CSRF",
      department: "CSE",
      year: 1,
      password: "csrfpass123"
    })
  });
  assert.equal(invalidToken.status, 403);
});

integrationTest("faculty JWT can list students while student JWT is forbidden", async () => {
  const facultyResponse = await authRequest("/students", facultySession);
  assert.equal(facultyResponse.status, 200);
  assert.equal((await facultyResponse.json()).length, 2);

  const studentResponse = await authRequest("/students", studentSession);
  assert.equal(studentResponse.status, 403);
});

integrationTest("faculty can create, update, and delete a student through the API", async () => {
  const createResponse = await jsonRequest("/students", "POST", {
    name: "CRUD Integration Student",
    rollNumber: "INTEGRATION-CRUD",
    department: "ECE",
    year: 1,
    password: "crudpass123"
  }, facultySession);
  assert.equal(createResponse.status, 201);
  const created = await createResponse.json();
  assert.equal(created.rollNumber, "INTEGRATION-CRUD");
  assert.equal(created.password, undefined);

  const updateResponse = await jsonRequest(`/students/${created._id}`, "PUT", {
    department: "CSE"
  }, facultySession);
  assert.equal(updateResponse.status, 200);
  assert.equal((await updateResponse.json()).department, "CSE");

  const weakPasswordResponse = await jsonRequest(`/students/${created._id}`, "PUT", {
    password: "1234567"
  }, facultySession);
  assert.equal(weakPasswordResponse.status, 400);

  const unsupportedFieldResponse = await jsonRequest(`/students/${created._id}`, "PUT", {
    isAdmin: true
  }, facultySession);
  assert.equal(unsupportedFieldResponse.status, 400);

  const deleteResponse = await authRequest(`/students/${created._id}`, facultySession, { method: "DELETE" });
  assert.equal(deleteResponse.status, 200);
  assert.deepEqual(await deleteResponse.json(), { message: "Student deleted successfully" });
});

integrationTest("marks API supports create, read, duplicate protection, and validation", async () => {
  const createResponse = await jsonRequest("/marks", "POST", {
    studentId: String(student._id),
    subject: "Database Systems",
    score: 91
  }, facultySession);
  assert.equal(createResponse.status, 201);

  const readResponse = await authRequest(`/marks/student/${student._id}`, studentSession);
  assert.equal(readResponse.status, 200);
  assert.equal((await readResponse.json())[0].score, 91);

  const duplicateResponse = await jsonRequest("/marks", "POST", {
    studentId: String(student._id),
    subject: "Database Systems",
    score: 88
  }, facultySession);
  assert.equal(duplicateResponse.status, 409);
  assert.deepEqual(await duplicateResponse.json(), { message: "Resource already exists" });

  const invalidResponse = await jsonRequest("/marks", "POST", {
    studentId: String(student._id),
    subject: "DB",
    score: 101
  }, facultySession);
  assert.equal(invalidResponse.status, 400);
});

integrationTest("attendance API supports create, student read, duplicate protection, and history", async () => {
  const createResponse = await jsonRequest("/attendance", "POST", {
    studentId: String(student._id),
    subject: "Computer Networks",
    status: "present",
    date: "2026-09-10"
  }, facultySession);
  assert.equal(createResponse.status, 201);

  const summaryResponse = await authRequest(`/attendance/student/${student._id}`, studentSession);
  assert.equal(summaryResponse.status, 200);
  assert.deepEqual(await summaryResponse.json(), {
    studentId: String(student._id),
    totalClasses: 1,
    present: 1,
    percentage: 100
  });

  const historyResponse = await authRequest(`/attendance/history/${student._id}`, studentSession);
  assert.equal(historyResponse.status, 200);
  assert.equal((await historyResponse.json())[0].subject, "Computer Networks");

  const duplicateResponse = await jsonRequest("/attendance", "POST", {
    studentId: String(student._id),
    subject: "Computer Networks",
    status: "absent",
    date: "2026-09-10"
  }, facultySession);
  assert.equal(duplicateResponse.status, 409);
});

integrationTest("timetable API enforces faculty writes and allows authenticated reads", async () => {
  const facultyResponse = await jsonRequest("/timetable", "POST", {
    day: "monday",
    subject: "Cloud Computing",
    time: "10:00 AM"
  }, facultySession);
  assert.equal(facultyResponse.status, 201);

  const studentResponse = await authRequest("/timetable", studentSession);
  assert.equal(studentResponse.status, 200);
  assert.equal((await studentResponse.json())[0].subject, "Cloud Computing");

  const forbiddenWrite = await jsonRequest("/timetable", "POST", {
    day: "tuesday",
    subject: "Operating Systems",
    time: "11:00 AM"
  }, studentSession);
  assert.equal(forbiddenWrite.status, 403);
});

integrationTest("faculty registration and login work through the API", async () => {
  const registerResponse = await jsonRequest("/api/faculty/register", "POST", {
    name: "Second Integration Faculty",
    email: "second@integration.test",
    password: "secondpass123"
  }, facultySession);
  assert.equal(registerResponse.status, 201);

  const loginSessionResponse = await loginSession("/api/faculty/login", {
    email: "second@integration.test",
    password: "secondpass123"
  });
  assert.ok(loginSessionResponse.body.facultyId);
});
