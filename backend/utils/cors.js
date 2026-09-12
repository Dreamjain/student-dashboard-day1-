const normalizeOrigins = (value) => {
  if (!value) return [];

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const buildCorsOptions = (configuredOrigins = process.env.CLIENT_ORIGIN) => {
  const allowedOrigins = normalizeOrigins(configuredOrigins);

  return {
    origin: (requestOrigin, callback) => {
      // Non-browser clients and same-origin requests do not send an Origin header.
      if (!requestOrigin) return callback(null, true);
      if (allowedOrigins.includes(requestOrigin)) return callback(null, true);
      return callback(null, false);
    }
  };
};

module.exports = { buildCorsOptions, normalizeOrigins };
