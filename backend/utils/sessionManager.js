const crypto = require("crypto");
const RefreshSession = require("../models/refreshSessionModel");
const { sign } = require("./jwt");

const ACCESS_TOKEN_TTL_SECONDS = Number(process.env.ACCESS_TOKEN_TTL_SECONDS) || 15 * 60;
const REFRESH_TOKEN_TTL_SECONDS = Number(process.env.REFRESH_TOKEN_TTL_SECONDS) || 7 * 24 * 60 * 60;

const hashRefreshToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const createRefreshToken = () =>
  crypto.randomBytes(48).toString("base64url");

const issueSession = async (userId, role) => {
  const refreshToken = createRefreshToken();
  const tokenHash = hashRefreshToken(refreshToken);
  const familyId = crypto.randomBytes(24).toString("hex");

  await RefreshSession.create({
    tokenHash,
    userId: String(userId),
    role,
    familyId,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000)
  });

  return {
    accessToken: sign({ id: String(userId), role }, ACCESS_TOKEN_TTL_SECONDS),
    refreshToken
  };
};

const rotateRefreshToken = async (refreshToken) => {
  if (typeof refreshToken !== "string" || refreshToken.length < 40) {
    throw new Error("Invalid refresh token");
  }

  const tokenHash = hashRefreshToken(refreshToken);
  const now = new Date();

  const session = await RefreshSession.findOneAndUpdate(
    { tokenHash, revokedAt: null, expiresAt: { $gt: now } },
    { $set: { revokedAt: now } },
    { new: true }
  );

  if (!session) {
    const existing = await RefreshSession.findOne({ tokenHash });
    if (existing?.revokedAt) {
      await RefreshSession.updateMany(
        { familyId: existing.familyId, revokedAt: null },
        { $set: { revokedAt: now } }
      );
    }
    throw new Error("Invalid or expired refresh token");
  }

  const nextRefreshToken = createRefreshToken();
  const nextHash = hashRefreshToken(nextRefreshToken);

  await RefreshSession.create({
    tokenHash: nextHash,
    userId: session.userId,
    role: session.role,
    familyId: session.familyId,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000)
  });

  await RefreshSession.updateOne(
    { _id: session._id },
    { $set: { replacedByHash: nextHash } }
  );

  return {
    accessToken: sign(
      { id: session.userId, role: session.role },
      ACCESS_TOKEN_TTL_SECONDS
    ),
    refreshToken: nextRefreshToken
  };
};

const revokeRefreshToken = async (refreshToken) => {
  if (typeof refreshToken !== "string" || !refreshToken) return;
  await RefreshSession.updateOne(
    { tokenHash: hashRefreshToken(refreshToken), revokedAt: null },
    { $set: { revokedAt: new Date() } }
  );
};

module.exports = {
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_TTL_SECONDS,
  hashRefreshToken,
  issueSession,
  rotateRefreshToken,
  revokeRefreshToken
};
