const express = require("express");
const router = express.Router();

const { loginFaculty, registerFaculty } = require("../controllers/facultyController");

router.post("/login", loginFaculty);
router.post("/register", registerFaculty);

module.exports = router;