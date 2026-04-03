import { useEffect, useState } from "react";
import axios from "axios";

function FacultyDashboard() {
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [marks, setMarks] = useState("");
  const [attendance, setAttendance] = useState("");
  const [subject, setSubject] = useState("");

  const selectedStudent = students.find(
  (s) => s._id === studentId
);

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.get("http://localhost:5000/students");
        setStudents(res.data);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    fetchStudents();
  }, []);

  const addMarks = async () => {
    try {
      await axios.post("http://localhost:5000/api/marks", {
        studentId: studentId,
        subject,
        score: marks
      });

      alert("Marks added");
    } catch (error) {
      console.error(error);
    }
  };

  const addAttendance = async () => {
    if (!studentId) {
      alert("Please select a student first!");
      return;
    }
    
    if (!subject) {
      alert("Please select a subject!");
      return;
    }

    if (!attendance) {
      alert("Please enter attendance status!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/attendance", {
        studentId: studentId,
        subject,
        status: attendance.toLowerCase()
      });

      console.log("Success:", response.data);
      alert("Attendance added successfully!");
      setAttendance(""); // Clear the input
    } catch (error) {
      console.error("Full error:", error);
      const errorMsg = error.response?.data?.message || error.message || "Unknown error";
      alert("Error: " + errorMsg);
    }
  };

  return (
    <div>
      <h2>Faculty Dashboard</h2>

      {/* Dropdown */}
      <select onChange={(e) => setStudentId(e.target.value)}>
  <option>Select Student</option>
  {students.map((s) => (
    <option key={s._id} value={s._id}>
      {s.name} ({s.rollNumber})
    </option>
  ))}
</select>

      <select onChange={(e) => setSubject(e.target.value)}>
        <option>Select Subject</option>
        <option>DBMS</option>
        <option>DAA</option>
        <option>PQT</option>
        <option>DTM</option>
        <option>Soc.Eng</option>
        <option>AI</option>
      </select>
      {selectedStudent && (
  <div style={{ marginTop: "10px", color: "white" }}>
    <p>Name: {selectedStudent.name}</p>
    <p>Roll: {selectedStudent.rollNumber}</p>
    <p>Department: {selectedStudent.department}</p>
  </div>
)}

      <br /><br />

      {/* Marks */}
      <input
        placeholder="Marks"
        onChange={(e) => setMarks(e.target.value)}
      />
      <button onClick={addMarks}>Add Marks</button>

      <br /><br />

      {/* Attendance */}
      <input
        placeholder="Attendance (Present/Absent)"
        onChange={(e) => setAttendance(e.target.value)}
      />
      <button onClick={addAttendance}>Add Attendance</button>

    </div>
  );
}

export default FacultyDashboard;