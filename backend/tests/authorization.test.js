const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");

process.env.JWT_SECRET = "test-secret-that-is-at-least-32-characters-long";

const { app } = require("../server");
const { sign } = require("../utils/jwt");

const request = (server, { method, path, token } = {}) => new Promise((resolve, reject) => {
  const req = http.request(server, {
    method,
    path,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  }, (res) => {
    res.resume();
    res.on("end", () => resolve(res.statusCode));
  });

  req.on("error", reject);
  req.end();
});

test("protected routes reject unauthenticated requests", async (t) => {
  const server = app.listen(0);
  t.after(() => server.close());

  const protectedRoutes = [
    ["POST", "/students"],
    ["GET", "/students/507f1f77bcf86cd799439011"],
    ["PUT", "/students/507f1f77bcf86cd799439011"],
    ["DELETE", "/students/507f1f77bcf86cd799439011"],
    ["POST", "/attendance"],
    ["GET", "/attendance"],
    ["GET", "/attendance/student/507f1f77bcf86cd799439011"],
    ["GET", "/attendance/history/507f1f77bcf86cd799439011"],
    ["GET", "/attendance/report"],
    ["POST", "/marks"],
    ["GET", "/marks/student/507f1f77bcf86cd799439011"],
    ["GET", "/timetable"],
    ["POST", "/timetable"],
    ["POST", "/api/faculty/register"],
  ];

  for (const [method, path] of protectedRoutes) {
    const status = await request(server, { method, path });
    assert.equal(status, 401, `${method} ${path} should require authentication`);
  }
});

test("student tokens cannot access faculty-only routes", async (t) => {
  const server = app.listen(0);
  t.after(() => server.close());

  const studentToken = sign({ id: "student-123", role: "student" });
  const facultyOnlyRoutes = [
    ["POST", "/students"],
    ["GET", "/students"],
    ["GET", "/students/507f1f77bcf86cd799439011"],
    ["PUT", "/students/507f1f77bcf86cd799439011"],
    ["DELETE", "/students/507f1f77bcf86cd799439011"],
    ["POST", "/attendance"],
    ["GET", "/attendance"],
    ["GET", "/attendance/report"],
    ["POST", "/marks"],
    ["POST", "/timetable"],
    ["POST", "/api/faculty/register"],
  ];

  for (const [method, path] of facultyOnlyRoutes) {
    const status = await request(server, { method, path, token: studentToken });
    assert.equal(status, 403, `${method} ${path} should reject student role`);
  }
});

test("students cannot access another student's protected data", async (t) => {
  const server = app.listen(0);
  t.after(() => server.close());

  const studentToken = sign({ id: "student-123", role: "student" });
  const otherStudentRoutes = [
    ["GET", "/students/summary/student-456"],
    ["GET", "/marks/student/student-456"],
    ["GET", "/attendance/student/student-456"],
    ["GET", "/attendance/history/student-456"],
  ];

  for (const [method, path] of otherStudentRoutes) {
    const status = await request(server, { method, path, token: studentToken });
    assert.equal(status, 403, `${method} ${path} should reject cross-student access`);
  }
});
