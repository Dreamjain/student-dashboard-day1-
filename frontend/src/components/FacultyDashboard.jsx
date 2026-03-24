import { useState } from "react";
import axios from "axios";

function FacultyDashboard() {
  const [studentId, setStudentId] = useState("");
  const [marks, setMarks] = useState("");
  const [attendance, setAttendance] = useState("");

  const addMarks = async () => {
    await axios.post("http://localhost:5000/api/marks", {
      studentId,
      subject: "DBMS",
      score: marks
    });

    alert("Marks added");
  };

  const addAttendance = async () => {
    await axios.post("http://localhost:5000/api/attendance", {
      studentId,
      status: attendance
    });

    alert("Attendance added");
  };

  return (
    <div>
      <h2>Faculty Dashboard</h2>

      <input
        placeholder="Student ID"
        onChange={(e) => setStudentId(e.target.value)}
      />

      <input
        placeholder="Marks"
        onChange={(e) => setMarks(e.target.value)}
      />

      <button onClick={addMarks}>Add Marks</button>

      <input
        placeholder="Attendance (Present/Absent)"
        onChange={(e) => setAttendance(e.target.value)}
      />

      <button onClick={addAttendance}>Add Attendance</button>
    </div>
  );
}

export default FacultyDashboard;