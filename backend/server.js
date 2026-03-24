const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const studentRoutes = require("./routes/studentRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const marksRoutes = require("./routes/marksRoutes");
const timetableRoutes = require("./routes/timetableRoutes");
const facultyRoutes = require("./routes/facultyRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Student Dashboard Backend Running 🚀");
});

app.use("/students", studentRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/marks", marksRoutes);
app.use("/timetable", timetableRoutes);
app.use("/api/faculty", facultyRoutes);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
