import { useEffect, useState } from "react";
import api from "../api/client";

const SUBJECTS = ["DBMS", "DAA", "PQT", "DTM", "Soc.Eng", "AI"];

function FacultyDashboard({ onLogout }) {
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [marks, setMarks] = useState("");
  const [attendance, setAttendance] = useState("");
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const selectedStudent = students.find((student) => student._id === studentId);

  useEffect(() => {
    const fetchStudents = async () => {
      setError("");
      try {
        const res = await api.get("/students");
        setStudents(Array.isArray(res.data) ? res.data : []);
      } catch (requestError) {
        console.error("Error fetching students:", requestError);
        setError("Could not load students. Please refresh and try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const addMarks = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    const score = Number(marks);

    if (!studentId || !subject || !Number.isFinite(score) || score < 0 || score > 100) {
      setError("Select a student and subject, then enter marks from 0 to 100.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/marks", { studentId, subject, score });
      setMessage("Marks added successfully.");
      setMarks("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to add marks.");
    } finally {
      setSubmitting(false);
    }
  };

  const addAttendance = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!studentId || !subject || !attendance) {
      setError("Select a student, subject, and attendance status.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/attendance", {
        studentId,
        subject,
        date: new Date().toISOString(),
        status: attendance
      });
      setMessage("Attendance added successfully.");
      setAttendance("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to add attendance.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Faculty Dashboard</h2>
        <button type="button" onClick={onLogout}>Logout</button>
      </div>

      {loading && <p>Loading students...</p>}
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}

      <label>
        Student
        <select value={studentId} onChange={(e) => setStudentId(e.target.value)} disabled={loading || submitting}>
          <option value="">Select Student</option>
          {students.map((student) => (
            <option key={student._id} value={student._id}>
              {student.name} ({student.rollNumber})
            </option>
          ))}
        </select>
      </label>

      <label>
        Subject
        <select value={subject} onChange={(e) => setSubject(e.target.value)} disabled={submitting}>
          <option value="">Select Subject</option>
          {SUBJECTS.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>

      {selectedStudent && (
        <div style={{ marginTop: "10px" }}>
          <p>Name: {selectedStudent.name}</p>
          <p>Roll: {selectedStudent.rollNumber}</p>
          <p>Department: {selectedStudent.department}</p>
        </div>
      )}

      <form onSubmit={addMarks}>
        <input
          type="number"
          min="0"
          max="100"
          step="0.01"
          placeholder="Marks (0-100)"
          value={marks}
          onChange={(e) => setMarks(e.target.value)}
          disabled={submitting}
        />
        <button type="submit" disabled={submitting}>Add Marks</button>
      </form>

      <form onSubmit={addAttendance}>
        <select value={attendance} onChange={(e) => setAttendance(e.target.value)} disabled={submitting}>
          <option value="">Attendance Status</option>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
        </select>
        <button type="submit" disabled={submitting}>Add Attendance</button>
      </form>
    </div>
  );
}

export default FacultyDashboard;
