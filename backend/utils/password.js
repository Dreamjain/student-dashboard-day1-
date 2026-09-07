const crypto = require("crypto");
const { promisify } = require("util");

const scrypt = promisify(crypto.scrypt);
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;
const SCRYPT_OPTIONS = {
  N: 16384,
  r: 8,
  p: 1
};
const HASH_PREFIX = "scrypt";

const isPasswordHash = (value) =>
  typeof value === "string" && value.startsWith(`${HASH_PREFIX}$`);

const hashPassword = async (password) => {
  if (typeof password !== "string" || password.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }

  const salt = crypto.randomBytes(SALT_LENGTH).toString("hex");
  const derivedKey = await scrypt(password, salt, KEY_LENGTH, SCRYPT_OPTIONS);

  return `${HASH_PREFIX}$${SCRYPT_OPTIONS.N}$${SCRYPT_OPTIONS.r}$${SCRYPT_OPTIONS.p}$${salt}$${derivedKey.toString("hex")}`;
};

const verifyPassword = async (password, storedHash) => {
  if (!isPasswordHash(storedHash)) return false;

  const [, n, r, p, salt, keyHex] = storedHash.split("$");
  const expectedKey = Buffer.from(keyHex || "", "hex");

  if (!salt || expectedKey.length !== KEY_LENGTH) return false;

  try {
    const derivedKey = await scrypt(password, salt, KEY_LENGTH, {
      N: Number(n),
      r: Number(r),
      p: Number(p)
    });

    return crypto.timingSafeEqual(derivedKey, expectedKey);
  } catch {
    return false;
  }
};

module.exports = { hashPassword, verifyPassword, isPasswordHash };
