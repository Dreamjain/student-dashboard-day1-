import "./sidebar.css";
import { FaHome, FaChartBar, FaClock, FaClipboardCheck, FaSignOutAlt } from "react-icons/fa";

function Sidebar({ setActiveTab, setStudentId, activeTab }) {
  const handleLogout = () => {
    setStudentId(null);
    setActiveTab(null);
  };

  const navigation = [
    [null, "Dashboard", <FaHome aria-hidden="true" />],
    ["marks", "Marks", <FaChartBar aria-hidden="true" />],
    ["attendance", "Attendance", <FaClipboardCheck aria-hidden="true" />],
    ["timetable", "Timetable", <FaClock aria-hidden="true" />]
  ];

  return (
    <aside className="sidebar" aria-label="Student navigation">
      <h2>🎓 Campus</h2>
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
