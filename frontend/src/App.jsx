import { useEffect, useState } from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Marks from "./components/Marks";
import Attendance from "./components/Attendance";
import Timetable from "./components/Timetable";
import Sidebar from "./components/Sidebar";
import FacultyLogin from "./components/FacultyLogin";
import FacultyDashboard from "./components/FacultyDashboard";
import ErrorBoundary from "./components/ErrorBoundary";
import { USER_KEY } from "./api/client";
import "./app.css";

function App() {
  const [studentId, setStudentId] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [facultyId, setFacultyId] = useState(null);

  useEffect(() => {
    const restoreSession = () => {
      const rawUser = sessionStorage.getItem(USER_KEY);
      if (!rawUser) return;

      try {
        const user = JSON.parse(rawUser);
        if (user.role === "faculty" && user.id) setFacultyId(user.id);
        if (user.role === "student" && user.id) setStudentId(user.id);
      } catch {
        sessionStorage.removeItem(USER_KEY);
      }
    };

    restoreSession();

    const handleExpired = () => {
      setStudentId(null);
      setFacultyId(null);
      setActiveTab(null);
    };

    window.addEventListener("auth:expired", handleExpired);
    return () => window.removeEventListener("auth:expired", handleExpired);
  }, []);

  const logout = async () => {
    try { await import("./api/client").then(({ default: client }) => client.post("/auth/logout")); } catch { /* clear local session even if server is unavailable */ }
    sessionStorage.removeItem(USER_KEY);
    setStudentId(null);
    setFacultyId(null);
    setActiveTab(null);
  };

  return (
    <ErrorBoundary>
      <div className="app-shell">
        <h1 className="app-heading">🎓 Academics</h1>
        {!studentId && !facultyId ? (
          <div className="login-grid">
            <Login setStudentId={setStudentId} />
            <FacultyLogin setFacultyId={setFacultyId} />
          </div>
        ) : studentId ? (
          <>
            <Sidebar setActiveTab={setActiveTab} setStudentId={logout} activeTab={activeTab} />
            <main className="main-content">
              {activeTab && <button onClick={() => setActiveTab(null)} type="button">⬅ Back</button>}
              {!activeTab && <Dashboard studentId={studentId} setActiveTab={setActiveTab} />}
              {activeTab === "marks" && <Marks studentId={studentId} />}
              {activeTab === "attendance" && <Attendance studentId={studentId} />}
              {activeTab === "timetable" && <Timetable />}
            </main>
          </>
        ) : (
          <main className="main-content">
            <FacultyDashboard facultyId={facultyId} onLogout={logout} />
          </main>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
