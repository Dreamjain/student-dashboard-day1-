import { useState } from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Marks from "./components/Marks";
import Timetable from "./components/Timetable";
import Sidebar from "./components/Sidebar";

function App() {
  const [studentId, setStudentId] = useState(null);
  const [activeTab, setActiveTab] = useState(null);

  return (
  <div
    style={{
      position: "relative",
      padding: "20px",
      fontFamily: "Arial",
      backgroundColor: "linear-gradient(135deg, #0f172a, #020617)",
      minHeight: "100vh"
    }}
  >
    <h1 style={{ textAlign: "center" }}>🎓 Academics</h1>

    {!studentId ? (
      <Login setStudentId={setStudentId} />
    ) : (
      <>
        {/* Sidebar */}
        <Sidebar
          setActiveTab={setActiveTab}
          setStudentId={setStudentId}
          activeTab = {activeTab}
        />

        {/* Main Content */}
        <div style={{ marginLeft: "220px", padding: "20px" }}>

          {/* Back Button */}
          {activeTab && (
            <button onClick={() => setActiveTab(null)}>
              ⬅ Back
            </button>
          )}

          {/* Dashboard */}
          {!activeTab && (
            <Dashboard
              studentId={studentId}
              setActiveTab={setActiveTab}
            />
          )}

          {/* Marks */}
          {activeTab === "marks" && (
            <Marks studentId={studentId} />
          )}

          {/* Timetable */}
          {activeTab === "timetable" && (
            <Timetable />
          )}

        </div>
      </>
    )}
  </div>
);
}

export default App;