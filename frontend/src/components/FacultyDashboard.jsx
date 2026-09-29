import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import { getApiErrorMessage } from "../api/errors";
import "./faculty-dashboard.css";

const SUBJECTS = ["DBMS", "DAA", "PQT", "DTM", "Soc.Eng", "AI"];
const EMPTY_STUDENT = { name: "", rollNumber: "", department: "", year: "", password: "" };

function FacultyDashboard({ onLogout }) {
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [marks, setMarks] = useState("");
  const [attendance, setAttendance] = useState("");
  const [subject, setSubject] = useState("");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("students");
  const [studentForm, setStudentForm] = useState(EMPTY_STUDENT);
  const [editingId, setEditingId] = useState(null);
  const [timetable, setTimetable] = useState({ day: "", subject: "", time: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const selectedStudent = students.find((student) => student._id === studentId);
  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return students;
    return students.filter((student) =>
      [student.name, student.rollNumber, student.department].some((value) =>
        String(value || "").toLowerCase().includes(query)
      )
    );
  }, [students, search]);

  const notify = (nextMessage = "", nextError = "") => {
    setMessage(nextMessage);
    setError(nextError);
  };

  const fetchStudents = async () => {
    setError("");
    try {
      const res = await api.get("/students");
      setStudents(Array.isArray(res.data) ? res.data : []);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Could not load students. Please refresh and try again."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, []);

  const resetStudentForm = () => {
    setStudentForm(EMPTY_STUDENT);
    setEditingId(null);
  };

  const saveStudent = async (event) => {
    event.preventDefault();
    notify();
    const payload = {
      ...studentForm,
      year: Number(studentForm.year)
    };
    if (!payload.name || !payload.rollNumber || !payload.department || !Number.isInteger(payload.year) || payload.year < 1) {
      setError("Enter name, roll number, department, and a valid year.");
      return;
    }
    if (!editingId && payload.password.length < 8) {
      setError("A new student password must be at least 8 characters.");
      return;
    }
    if (editingId && !payload.password) delete payload.password;

    setSubmitting(true);
    try {
      const res = editingId
        ? await api.put(`/students/${editingId}`, payload)
        : await api.post("/students", payload);
      setStudents((current) =>
        editingId ? current.map((student) => student._id === editingId ? res.data : student) : [...current, res.data]
      );
      setStudentId(res.data._id);
      notify(editingId ? "Student updated successfully." : "Student created successfully.");
      resetStudentForm();
      setTab("students");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to save the student."));
    } finally {
      setSubmitting(false);
    }
  };

  const editStudent = (student) => {
    setStudentForm({
      name: student.name || "",
      rollNumber: student.rollNumber || "",
      department: student.department || "",
      year: student.year || "",
      password: ""
    });
    setEditingId(student._id);
    setTab("add");
    notify();
  };

  const deleteStudent = async (id) => {
    const student = students.find((item) => item._id === id);
    if (!student || !window.confirm(`Delete ${student.name}? This cannot be undone.`)) return;
    notify();
    setSubmitting(true);
    try {
      await api.delete(`/students/${id}`);
      setStudents((current) => current.filter((item) => item._id !== id));
      if (studentId === id) setStudentId("");
      notify("Student deleted successfully.");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to delete the student."));
    } finally {
      setSubmitting(false);
    }
  };

  const addMarks = async (event) => {
    event.preventDefault();
    notify();
    const score = Number(marks);
    if (!studentId || !subject || !Number.isFinite(score) || score < 0 || score > 100) {
      setError("Select a student and subject, then enter marks from 0 to 100.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/marks", { studentId, subject, score });
      setMarks("");
      notify("Marks added successfully.");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to add marks."));
    } finally { setSubmitting(false); }
  };

  const addAttendance = async (event) => {
    event.preventDefault();
    notify();
    if (!studentId || !subject || !attendance) {
      setError("Select a student, subject, and attendance status.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/attendance", { studentId, subject, date: new Date().toISOString(), status: attendance });
      setAttendance("");
      notify("Attendance recorded successfully.");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to record attendance."));
    } finally { setSubmitting(false); }
  };

  const addTimetable = async (event) => {
    event.preventDefault();
    notify();
    if (!timetable.day || !timetable.subject || !timetable.time) {
      setError("Enter day, subject, and time.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/timetable", timetable);
      setTimetable({ day: "", subject: "", time: "" });
      notify("Timetable entry added successfully.");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to add timetable entry."));
    } finally { setSubmitting(false); }
  };

  return (
    <section className="faculty-page">
      <header className="faculty-header">
        <div>
          <p className="eyebrow">Faculty workspace</p>
          <h1>Academic management</h1>
          <p className="faculty-subtitle">Manage students, marks, attendance, and the timetable from one place.</p>
        </div>
        <div className="faculty-actions">
          <button className="faculty-button" onClick={fetchStudents} disabled={loading || submitting} type="button">Refresh</button>
          <button className="faculty-button danger" onClick={onLogout} type="button">Logout</button>
        </div>
      </header>

      <nav className="faculty-tabs" aria-label="Faculty management">
        {[["students", "Students"], ["add", editingId ? "Edit student" : "Add student"], ["records", "Marks & attendance"], ["timetable", "Timetable"]].map(([value, label]) => (
          <button key={value} className={tab === value ? "active" : ""} onClick={() => setTab(value)} type="button">{label}</button>
        ))}
      </nav>

      {error && <div className="faculty-notice error" role="alert">{error}</div>}
      {message && <div className="faculty-notice success" role="status">{message}</div>}

      {tab === "students" && (
        <div className="faculty-panel">
          <div className="faculty-toolbar">
            <input className="faculty-search" aria-label="Search students" placeholder="Search name, roll number, or department..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <button className="faculty-button" onClick={() => { resetStudentForm(); setTab("add"); }} type="button">+ Add student</button>
          </div>
          {loading ? <p>Loading students...</p> : filteredStudents.length === 0 ? <p>No matching students found.</p> : (
            <div className="student-table">
              <div className="student-row header"><span>Name</span><span>Roll number</span><span>Department</span><span>Year</span><span>Actions</span></div>
              {filteredStudents.map((student) => (
                <div className="student-row" key={student._id}>
                  <strong>{student.name}</strong><span>{student.rollNumber}</span><span>{student.department}</span><span>{student.year}</span>
                  <div className="row-actions">
                    <button onClick={() => editStudent(student)} type="button">Edit</button>
                    <button className="delete" onClick={() => deleteStudent(student._id)} type="button">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "add" && (
        <div className="faculty-panel">
          <h2>{editingId ? "Edit student" : "Add student"}</h2>
          <p>{editingId ? "Update academic details. Leave password empty to keep the current password." : "Create a student account for academic access."}</p>
          <form className="faculty-form" onSubmit={saveStudent}>
            {["name", "rollNumber", "department", "year", "password"].map((field) => (
              <label key={field}>{field === "rollNumber" ? "Roll number" : field.charAt(0).toUpperCase() + field.slice(1)}
                <input type={field === "password" ? "password" : field === "year" ? "number" : "text"} min={field === "year" ? "1" : undefined} value={studentForm[field]} onChange={(e) => setStudentForm({ ...studentForm, [field]: e.target.value })} placeholder={field === "password" ? (editingId ? "Optional" : "Minimum 8 characters") : ""} disabled={submitting} />
              </label>
            ))}
            <button className="faculty-button" type="submit" disabled={submitting}>{submitting ? "Saving..." : editingId ? "Save changes" : "Create student"}</button>
            {editingId && <button className="faculty-button" type="button" onClick={resetStudentForm}>Cancel</button>}
          </form>
        </div>
      )}

      {tab === "records" && (
        <div className="faculty-panel">
          <h2>Marks & attendance</h2>
          <p>Choose a student, then record academic results.</p>
          <label className="faculty-form" style={{ display: "block" }}>
            <span style={{ color: "#94a3b8", fontSize: "12px", fontWeight: 700 }}>Student</span>
            <select className="faculty-search" value={studentId} onChange={(e) => setStudentId(e.target.value)} disabled={loading || submitting}>
              <option value="">Select student</option>
              {students.map((student) => <option key={student._id} value={student._id}>{student.name} ({student.rollNumber})</option>)}
            </select>
          </label>
          {selectedStudent && <div className="student-summary"><div><strong>{selectedStudent.name}</strong><br /><span>{selectedStudent.rollNumber} · {selectedStudent.department} · Year {selectedStudent.year}</span></div></div>}
          <form className="faculty-form" onSubmit={addMarks}>
            <label>Subject<select value={subject} onChange={(e) => setSubject(e.target.value)} disabled={submitting}><option value="">Select subject</option>{SUBJECTS.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>Score<input type="number" min="0" max="100" step="0.01" value={marks} onChange={(e) => setMarks(e.target.value)} disabled={submitting} /></label>
            <button className="faculty-button" type="submit" disabled={submitting}>Add marks</button>
          </form>
          <form className="faculty-form" onSubmit={addAttendance}>
            <label>Subject<select value={subject} onChange={(e) => setSubject(e.target.value)} disabled={submitting}><option value="">Select subject</option>{SUBJECTS.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>Status<select value={attendance} onChange={(e) => setAttendance(e.target.value)} disabled={submitting}><option value="">Select status</option><option value="present">Present</option><option value="absent">Absent</option></select></label>
            <button className="faculty-button" type="submit" disabled={submitting}>Record attendance</button>
          </form>
        </div>
      )}

      {tab === "timetable" && (
        <div className="faculty-panel">
          <h2>Timetable management</h2>
          <p>Add a class slot to the shared academic timetable.</p>
          <form className="faculty-form" onSubmit={addTimetable}>
            <label>Day<input value={timetable.day} onChange={(e) => setTimetable({ ...timetable, day: e.target.value })} placeholder="Monday" disabled={submitting} /></label>
            <label>Subject<input value={timetable.subject} onChange={(e) => setTimetable({ ...timetable, subject: e.target.value })} placeholder="Cloud Computing" disabled={submitting} /></label>
            <label>Time<input value={timetable.time} onChange={(e) => setTimetable({ ...timetable, time: e.target.value })} placeholder="10:00 AM" disabled={submitting} /></label>
            <button className="faculty-button" type="submit" disabled={submitting}>Add timetable slot</button>
          </form>
        </div>
      )}
    </section>
  );
}

export default FacultyDashboard;
