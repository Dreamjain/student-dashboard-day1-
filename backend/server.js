require("dotenv").config();

const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const { buildCorsOptions } = require("./utils/cors");
const securityHeaders = require("./middleware/securityHeaders");
const errorHandler = require("./middleware/errorHandler");
const csrfProtection = require("./middleware/csrf");
const { REFRESH_COOKIE, parseCookies, setPreAuthCsrfCookie, setSessionCookies, clearSessionCookies } = require("./utils/sessionCookies");
const { rotateRefreshToken, revokeRefreshToken } = require("./utils/sessionManager");
const { checkRedisHealth, isRedisConfigured } = require("./middleware/rateLimiter");
const logger = require("./utils/logger");
const studentRoutes = require("./routes/studentRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const marksRoutes = require("./routes/marksRoutes");
const timetableRoutes = require("./routes/timetableRoutes");
const facultyRoutes = require("./routes/facultyRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();
const openapiSpec = JSON.parse(fs.readFileSync(path.join(__dirname, "../docs/openapi.json"), "utf8"));
const PORT = Number(process.env.PORT) || 5000;
const metrics = { startedAt: Date.now(), requests: 0, errors: 0 };

app.set("trust proxy", process.env.TRUST_PROXY === "true" ? 1 : false);

app.disable("x-powered-by");
app.use(securityHeaders);
app.use(cors(buildCorsOptions()));
app.use(express.json({ limit: "100kb" }));

app.use((req, res, next) => {
  const requestId = req.headers["x-request-id"] || logger.createRequestId();
  const startedAt = process.hrtime.bigint();

  req.requestId = requestId;
  metrics.requests += 1;
  res.setHeader("X-Request-ID", requestId);

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
    const fields = {
      requestId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs: Math.round(durationMs * 100) / 100
    };

    if (res.statusCode >= 500) {
      metrics.errors += 1;
      logger.error("HTTP request completed", fields);
    } else if (res.statusCode >= 400) {
      logger.warn("HTTP request completed", fields);
    } else {
      logger.info("HTTP request completed", fields);
    }
  });

  next();
});

app.use(csrfProtection);

app.get("/", (_req, res) => {
  res.json({ service: "Student Dashboard API", status: "running" });
});

app.get("/openapi.json", (_req, res) => {
  res.json(openapiSpec);
});

app.get("/docs", (_req, res) => {
  res.sendFile(path.join(__dirname, "../docs/swagger.html"));
});

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/health/metrics", (_req, res) => {
  const memory = process.memoryUsage();

  res.json({
    status: "ok",
    uptimeSeconds: Math.floor(process.uptime()),
    startedAt: new Date(metrics.startedAt).toISOString(),
    requests: metrics.requests,
    errors: metrics.errors,
    memory: {
      rssBytes: memory.rss,
      heapUsedBytes: memory.heapUsed,
      heapTotalBytes: memory.heapTotal
    }
  });
});

app.get("/health/ready", async (_req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;

  if (!databaseReady) {
    return res.status(503).json({
      status: "not_ready",
      database: "disconnected"
    });
  }

  if (!isRedisConfigured()) {
    return res.status(200).json({
      status: "ready",
      database: "connected"
    });
  }

  const redis = await checkRedisHealth();

  if (!redis.healthy) {
    return res.status(503).json({
      status: "not_ready",
      database: "connected",
      rateLimitStore: "disconnected"
    });
  }

  return res.status(200).json({
    status: "ready",
    database: "connected",
    rateLimitStore: "connected"
  });
});

app.get("/auth/csrf", (_req, res) => {
  setPreAuthCsrfCookie(res);
  res.json({ message: "CSRF token ready" });
});

app.post("/auth/refresh", async (req, res, next) => {
  const cookies = parseCookies(req.headers.cookie);
  const refreshToken = cookies[REFRESH_COOKIE];

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh session required" });
  }

  try {
    const session = await rotateRefreshToken(refreshToken);
    setSessionCookies(res, session);
    return res.json({ message: "Session refreshed" });
  } catch (error) {
    if (error.message === "Invalid or expired refresh token") {
      clearSessionCookies(res);
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }
    return next(error);
  }
});

app.post("/auth/logout", async (req, res, next) => {
  const cookies = parseCookies(req.headers.cookie);

  try {
    await revokeRefreshToken(cookies[REFRESH_COOKIE]);
    clearSessionCookies(res);
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
});

app.use("/students", studentRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/marks", marksRoutes);
app.use("/timetable", timetableRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/ai", aiRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  metrics.errors += 1;
  logger.error("Unhandled application error", {
    requestId: req.requestId,
    errorName: err.name,
    errorMessage: err.message
  });
  next(err);
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, "0.0.0.0", () => {
      logger.info("Server started", { host: "0.0.0.0", port: PORT, nodeEnv: process.env.NODE_ENV || "development" });
    });

    const shutdown = (signal) => {
      logger.info("Graceful shutdown started", { signal });

      server.close(async (error) => {
        if (error) {
          logger.error("HTTP server shutdown failed", { errorMessage: error.message });
          process.exitCode = 1;
        }

        try {
          await mongoose.disconnect();
        } catch (disconnectError) {
          logger.error("MongoDB shutdown failed", { errorMessage: disconnectError.message });
          process.exitCode = 1;
        } finally {
          process.exit();
        }
      });
    };

    process.once("SIGTERM", () => shutdown("SIGTERM"));
    process.once("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    logger.error("Server startup failed", { errorMessage: error.message });
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
