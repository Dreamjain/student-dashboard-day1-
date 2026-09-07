const test = require("node:test");
const assert = require("node:assert/strict");
const {
  hashPassword,
  verifyPassword,
  isPasswordHash
} = require("../utils/password");

test("password hashing produces a non-reversible stored value", async () => {
  const password = "student123";
  const hash = await hashPassword(password);

  assert.notEqual(hash, password);
  assert.equal(isPasswordHash(hash), true);
  assert.equal(hashPassword.length, 1);
});

test("password verification accepts the correct password and rejects the wrong one", async () => {
  const hash = await hashPassword("student123");

  assert.equal(await verifyPassword("student123", hash), true);
  assert.equal(await verifyPassword("wrong-password", hash), false);
});

test("different salts produce different password hashes", async () => {
  const firstHash = await hashPassword("student123");
  const secondHash = await hashPassword("student123");

  assert.notEqual(firstHash, secondHash);
  assert.equal(await verifyPassword("student123", firstHash), true);
  assert.equal(await verifyPassword("student123", secondHash), true);
});
