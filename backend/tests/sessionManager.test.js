const test = require("node:test");
const assert = require("node:assert/strict");

process.env.JWT_SECRET = "test-secret-that-is-at-least-32-characters-long";

const RefreshSession = require("../models/refreshSessionModel");
const {
  issueSession,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeUserSessions,
  hashRefreshToken
} = require("../utils/sessionManager");
const { verify } = require("../utils/jwt");

const original = {
  create: RefreshSession.create,
  findOneAndUpdate: RefreshSession.findOneAndUpdate,
  findOne: RefreshSession.findOne,
  updateOne: RefreshSession.updateOne,
  updateMany: RefreshSession.updateMany
};

test.afterEach(() => {
  Object.assign(RefreshSession, original);
});

test("issueSession stores a hashed refresh token and returns an access token", async () => {
  let created;
  RefreshSession.create = async (data) => {
    created = data;
    return data;
  };

  const session = await issueSession("student-123", "student");

  assert.ok(session.accessToken);
  assert.ok(session.refreshToken);
  assert.notEqual(created.tokenHash, session.refreshToken);
  assert.equal(created.tokenHash, hashRefreshToken(session.refreshToken));
  assert.equal(created.userId, "student-123");
  assert.equal(created.role, "student");

  const payload = verify(session.accessToken);
  assert.equal(payload.id, "student-123");
  assert.equal(payload.role, "student");
});

test("rotateRefreshToken revokes the old token and creates a replacement in the same family", async () => {
  const originalSession = {
    _id: "session-1",
    tokenHash: hashRefreshToken("refresh-token-original"),
    userId: "student-123",
    role: "student",
    familyId: "family-1",
    revokedAt: null,
    expiresAt: new Date(Date.now() + 60_000)
  };
  let replacement;
  let replacementLink;

  RefreshSession.findOneAndUpdate = async () => {
    originalSession.revokedAt = new Date();
    return originalSession;
  };
  RefreshSession.create = async (data) => {
    replacement = data;
    return data;
  };
  RefreshSession.updateOne = async (filter, update) => {
    assert.equal(filter._id, "session-1");
    replacementLink = update.$set.replacedByHash;
    return {};
  };

  const result = await rotateRefreshToken("refresh-token-original");

  assert.ok(result.accessToken);
  assert.ok(result.refreshToken);
  assert.equal(originalSession.revokedAt instanceof Date, true);
  assert.equal(replacement.userId, "student-123");
  assert.equal(replacement.role, "student");
  assert.equal(replacement.familyId, "family-1");
  assert.equal(replacement.tokenHash, hashRefreshToken(result.refreshToken));
  assert.equal(replacementLink, replacement.tokenHash);
});

test("reusing a revoked refresh token revokes the remaining session family", async () => {
  let familyRevoked = false;

  RefreshSession.findOneAndUpdate = async () => null;
  RefreshSession.findOne = async () => ({
    tokenHash: hashRefreshToken("reused-token"),
    familyId: "family-reuse",
    revokedAt: new Date()
  });
  RefreshSession.updateMany = async (filter, update) => {
    assert.equal(filter.familyId, "family-reuse");
    assert.equal(filter.revokedAt, null);
    assert.ok(update.$set.revokedAt instanceof Date);
    familyRevoked = true;
    return {};
  };

  await assert.rejects(
    () => rotateRefreshToken("reused-token"),
    /Invalid or expired refresh token/
  );
  assert.equal(familyRevoked, true);
});

test("revokeRefreshToken only revokes the matching active token", async () => {
  let filter;
  let update;

  RefreshSession.updateOne = async (receivedFilter, receivedUpdate) => {
    filter = receivedFilter;
    update = receivedUpdate;
    return {};
  };

  await revokeRefreshToken("refresh-token");

  assert.equal(filter.tokenHash, hashRefreshToken("refresh-token"));
  assert.equal(filter.revokedAt, null);
  assert.ok(update.$set.revokedAt instanceof Date);
});

test("revokeUserSessions revokes all active sessions for a user", async () => {
  let filter;
  let update;

  RefreshSession.updateMany = async (receivedFilter, receivedUpdate) => {
    filter = receivedFilter;
    update = receivedUpdate;
    return {};
  };

  await revokeUserSessions("student-123");

  assert.deepEqual(filter, { userId: "student-123", revokedAt: null });
  assert.ok(update.$set.revokedAt instanceof Date);
});

test("refresh rotation rejects malformed tokens before database access", async () => {
  let databaseCalled = false;
  RefreshSession.findOneAndUpdate = async () => {
    databaseCalled = true;
    return null;
  };

  await assert.rejects(
    () => rotateRefreshToken("short"),
    /Invalid refresh token/
  );
  assert.equal(databaseCalled, false);
});
