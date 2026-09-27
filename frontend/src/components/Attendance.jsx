import { useCallback, useEffect, useState } from "react";
import api from "../api/client";
import { getApiErrorMessage } from "../api/errors";
import "./data-pages.css";

function Attendance({ studentId }) {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/attendance/history/${studentId}`);
      setAttendance(Array.isArray(res.data) ? res.data : []);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Could not load attendance. Please try again."));
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  return (
    <div style={{ marginTop: "20px" }}>
      <div className="data-page-header"><div><p className="eyebrow">Attendance</p><h2>Attendance history</h2><p>Track your class participation over time.</p></div><button className="refresh-button" onClick={fetchAttendance} disabled={loading} type="button">{loading ? "Refreshing..." : "Refresh"}</button></div>

      <button onClick={fetchAttendance} disabled={loading} style={{ marginBottom: "20px" }}>
        {loading ? "Refreshing..." : "🔄 Refresh"}
      </button>

      {loading && <p>Loading attendance...</p>}
      {!loading && error && <p role="alert">{error}</p>}
      {!loading && !error && attendance.length === 0 && <p>No attendance records found.</p>}

      {!loading && !error && attendance.length > 0 && (
        <div className="data-list">
          {attendance.map((record) => (
            <li key={record._id}>
              {record.subject || "Class"} → {new Date(record.date).toLocaleDateString()} ({record.status})
            </li>
          ))}
        </div>
      )}
    </div>
  );
}

export default Attendance;
