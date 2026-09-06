import "./sidebar.css";
import { FaHome, FaChartBar, FaClock, FaClipboardCheck, FaSignOutAlt } from "react-icons/fa";

function Sidebar({ setActiveTab, setStudentId, activeTab }) {
  const handleLogout = () => {
    setStudentId(null);
    setActiveTab(null);
  };

  const navigation = [
    [null, "Dashboard", FaHome],
    ["marks", "Marks", FaChartBar],
    ["attendance", "Attendance", FaClipboardCheck],
    ["timetable", "Timetable", FaClock]
  ];

  return (
    <aside className="sidebar" aria-label="Student navigation">
      <h2>🎓 Campus</h2>
      {navigation.map(([tab, label, Icon]) => (
        <button
          key={label}
          className={activeTab === tab ? "active" : ""}
          onClick={() => setActiveTab(tab)}
          type="button"
          aria-current={activeTab === tab ? "page" : undefined}
        >
          <Icon aria-hidden="true" />
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
