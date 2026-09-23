require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const { buildCorsOptions } = require("./utils/cors");
const securityHeaders = require("./middleware/securityHeaders");
const errorHandler = require("./middleware/errorHandler");
const csrfProtection = require("./middleware/csrf");
const { setPreAuthCsrfCookie, clearSessionCookies } = require("./utils/sessionCookies");
const studentRoutes = require("./routes/studentRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const marksRoutes = require("./routes/marksRoutes");
const timetableRoutes = require("./routes/timetableRoutes");
const facultyRoutes = require("./routes/facultyRoutes");

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.set("trust proxy", process.env.TRUST_PROXY === "true" ? 1 : false);

app.disable("x-powered-by");
app.use(securityHeaders);
app.use(cors(buildCorsOptions()));
app.use(express.json({ limit: "100kb" }));
app.use(csrfProtection);

app.get("/", (_req, res) => {
  res.json({ service: "Student Dashboard API", status: "running" });
});

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/health/ready", (_req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;

  if (!databaseReady) {
    return res.status(503).json({
      status: "not_ready",
      database: "disconnected"
    });
  }

  return res.status(200).json({
    status: "ready",
    database: "connected"
  });
});

app.get("/auth/csrf", (_req, res) => {
  setPreAuthCsrfCookie(res);
  res.json({ message: "CSRF token ready" });
});

app.post("/auth/logout", (_req, res) => {
  clearSessionCookies(res);
  res.status(204).end();
});

app.use("/students", studentRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/marks", marksRoutes);
app.use("/timetable", timetableRoutes);
app.use("/api/faculty", facultyRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on 0.0.0.0:${PORT}`);
    });

    const shutdown = (signal) => {
      console.log(`${signal} received. Shutting down gracefully...`);

      server.close(async (error) => {
        if (error) {
          console.error("HTTP server shutdown failed", error.message);
          process.exitCode = 1;
        }

        try {
          await mongoose.disconnect();
        } catch (disconnectError) {
          console.error("MongoDB shutdown failed", disconnectError.message);
          process.exitCode = 1;
        } finally {
          process.exit();
        }
      });
    };

    process.once("SIGTERM", () => shutdown("SIGTERM"));
    process.once("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    console.error("Server startup failed ❌", error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
