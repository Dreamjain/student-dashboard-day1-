import { useState } from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Marks from "./components/Marks";
import Timetable from "./components/Timetable";

function App() {
  const [studentId, setStudentId] = useState(null);
  const [activeTab, setActiveTab] = useState(null);

  return (
    <div style={{
      position: "relative", 
      
      padding: "20px",
      fontFamily: "Arial",
      backgroundColor: "#190c45",
      minHeight: "100vh"
    }}>
      <h1 style={{ textAlign: "center" }}>🎓 Academics</h1>

      {!studentId ? (
        <Login setStudentId={setStudentId} />
      ) : (
        <div style={{
          maxWidth: "800px",
          margin: "auto"
        }}>
        {/* Back Button */}
{activeTab && (
  <button onClick={() => setActiveTab(null)}>
    ⬅ Back
  </button>
)}

{/* Show Dashboard when nothing selected */}
{!activeTab && (
  <Dashboard 
    studentId={studentId} 
    setActiveTab={setActiveTab} 
  />
)}

{/* Show Marks */}
{activeTab === "marks" && (
  <Marks studentId={studentId} />
)}

{/* Show Timetable */}
{activeTab === "timetable" && (
  <Timetable />
)}
{studentId && (
   <button
    onClick={() => setStudentId(null)}
    style={{
      position: "absolute",
      top: "20px",
      right: "20px",
      padding: "10px 20px",
      background: "yellow",
      color: "black",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)"
      
    }}
  >
    Logout
  </button>

  
)}
        </div>
      )}
    </div>
  );

}

export default App;