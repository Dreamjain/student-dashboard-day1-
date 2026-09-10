const test = require("node:test");
const assert = require("node:assert/strict");
const { sign } = require("../utils/jwt");
const {
  authenticate,
  requireRole,
  requireSelf,
  requireSelfOrRole,
} = require("../middleware/auth");

process.env.JWT_SECRET = "test-secret-that-is-at-least-32-characters-long";

const createResponse = () => {
  const response = {
    statusCode: 200,
    body: null,
    status(code) {
      response.statusCode = code;
      return response;
    },
    json(body) {
      response.body = body;
      return response;
    },
  };
  return response;
};

test("authenticate accepts a valid Bearer JWT", () => {
  const token = sign({ id: "student-123", role: "student" });
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = createResponse();
  let nextCalled = false;

  authenticate(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(req.user.id, "student-123");
  assert.equal(req.user.role, "student");
  assert.equal(res.statusCode, 200);
});

test("authenticate accepts a Bearer JWT with flexible whitespace", () => {
  const token = sign({ id: "student-456", role: "student" });
  const req = { headers: { authorization: `Bearer   ${token}` } };
  const res = createResponse();
  let nextCalled = false;

  authenticate(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(req.user.id, "student-456");
});

test("authenticate rejects a missing Authorization header", () => {
  const req = { headers: {} };
  const res = createResponse();
  let nextCalled = false;

  authenticate(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.message, "Authentication required");
});

test("authenticate rejects unsupported or incomplete authorization headers", () => {
  for (const authorization of ["Basic credentials", "Bearer", "Bearer token extra"]) {
    const req = { headers: { authorization } };
    const res = createResponse();
    let nextCalled = false;

    authenticate(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.message, "Authentication required");
  }
});

test("authenticate rejects an invalid Bearer token", () => {
  const req = { headers: { authorization: "Bearer invalid-token" } };
  const res = createResponse();
  let nextCalled = false;

  authenticate(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.message, "Invalid or expired token");
});

test("requireRole allows permitted roles and rejects others", () => {
  const allowedReq = { user: { role: "faculty" } };
  const allowedRes = createResponse();
  let allowedNext = false;
  requireRole("faculty")(allowedReq, allowedRes, () => {
    allowedNext = true;
  });

  assert.equal(allowedNext, true);
  assert.equal(allowedRes.statusCode, 200);

  const deniedReq = { user: { role: "student" } };
  const deniedRes = createResponse();
  let deniedNext = false;
  requireRole("faculty")(deniedReq, deniedRes, () => {
    deniedNext = true;
  });

  assert.equal(deniedNext, false);
  assert.equal(deniedRes.statusCode, 403);
  assert.equal(deniedRes.body.message, "Insufficient permissions");
});

test("requireSelf only allows a student to access their own resource", () => {
  const allowedReq = { user: { id: "student-123", role: "student" }, params: { id: "student-123" } };
  const allowedRes = createResponse();
  let allowedNext = false;
  requireSelf()(allowedReq, allowedRes, () => {
    allowedNext = true;
  });

  assert.equal(allowedNext, true);

  const otherStudentReq = { user: { id: "student-123", role: "student" }, params: { id: "student-456" } };
  const otherStudentRes = createResponse();
  let otherStudentNext = false;
  requireSelf()(otherStudentReq, otherStudentRes, () => {
    otherStudentNext = true;
  });

  assert.equal(otherStudentNext, false);
  assert.equal(otherStudentRes.statusCode, 403);

  const facultyReq = { user: { id: "faculty-1", role: "faculty" }, params: { id: "student-123" } };
  const facultyRes = createResponse();
  let facultyNext = false;
  requireSelf()(facultyReq, facultyRes, () => {
    facultyNext = true;
  });

  assert.equal(facultyNext, false);
  assert.equal(facultyRes.statusCode, 403);
});

test("requireSelfOrRole allows the owner or an authorized role", () => {
  const ownerReq = { user: { id: "student-123", role: "student" }, params: { id: "student-123" } };
  const ownerRes = createResponse();
  let ownerNext = false;
  requireSelfOrRole("id", "faculty")(ownerReq, ownerRes, () => {
    ownerNext = true;
  });
  assert.equal(ownerNext, true);

  const facultyReq = { user: { id: "faculty-1", role: "faculty" }, params: { id: "student-123" } };
  const facultyRes = createResponse();
  let facultyNext = false;
  requireSelfOrRole("id", "faculty")(facultyReq, facultyRes, () => {
    facultyNext = true;
  });
  assert.equal(facultyNext, true);

  const deniedReq = { user: { id: "student-456", role: "student" }, params: { id: "student-123" } };
  const deniedRes = createResponse();
  let deniedNext = false;
  requireSelfOrRole("id", "faculty")(deniedReq, deniedRes, () => {
    deniedNext = true;
  });

  assert.equal(deniedNext, false);
  assert.equal(deniedRes.statusCode, 403);
  assert.equal(deniedRes.body.message, "You do not have access to this student data");
});
