const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db.js");

const app = express();

connectDB(); // connects backend to MongoDB

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Student Dashboard Backend Running 🚀");
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});