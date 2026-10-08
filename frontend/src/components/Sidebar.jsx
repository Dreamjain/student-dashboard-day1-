import "./sidebar.css";
import { FaHome, FaChartBar, FaClock, FaClipboardCheck, FaSignOutAlt, FaRobot } from "react-icons/fa";

function Sidebar({ setActiveTab, setStudentId, activeTab }) {
  const handleLogout = () => {
    setStudentId(null);
    setActiveTab(null);
  };

  const navigation = [
    [null, "Dashboard", <FaHome aria-hidden="true" />],
    ["marks", "Marks", <FaChartBar aria-hidden="true" />],
    ["attendance", "Attendance", <FaClipboardCheck aria-hidden="true" />],
    ["timetable", "Timetable", <FaClock aria-hidden="true" />],
    ["ai", "AI Assistant", <FaRobot aria-hidden="true" />]
  ];

  return (
    <aside className="sidebar" aria-label="Student navigation">
      <div className="sidebar-brand"><span>🎓</span><div><strong>Campus</strong><small>Academics</small></div></div>
      <span className="sidebar-section">Navigation</span>
      {navigation.map(([tab, label, icon]) => (
        <button
          key={label}
          className={activeTab === tab ? "active" : ""}
          onClick={() => setActiveTab(tab)}
          type="button"
          aria-current={activeTab === tab ? "page" : undefined}
        >
          {icon}
          {label}
        </button>
      ))}
      <button className="logout-btn" onClick={handleLogout} type="button">
        <FaSignOutAlt aria-hidden="true" />
        Logout
      </button>
    </aside>
  );
}

export default Sidebar;
