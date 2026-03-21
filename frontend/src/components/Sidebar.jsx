import "./sidebar.css";
import { FaHome, FaChartBar, FaClock } from "react-icons/fa";

function Sidebar({ setActiveTab, setStudentId, activeTab }) {
  return (
    <div className="sidebar">
      <h2>🎓 Campus</h2>

      <button
  className={activeTab === null ? "active" : ""}
  onClick={() => setActiveTab(null)}
>
  <FaHome/>
  Dashboard
</button>

<button
  className={activeTab === "marks" ? "active" : ""}
  onClick={() => setActiveTab("marks")}
>
  <FaChartBar/>
  Marks
</button>

<button
  className={activeTab === "timetable" ? "active" : ""}
  onClick={() => setActiveTab("timetable")}
>
  <FaClock/>
  Timetable
</button>
    </div>
  );
}

export default Sidebar;