import { useCallback, useEffect, useState } from "react";
import api from "../api/client";

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
      console.error("Error fetching attendance:", requestError);
      setError("Could not load attendance. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>Attendance History</h2>

      <button onClick={fetchAttendance} disabled={loading} style={{ marginBottom: "20px" }}>
        {loading ? "Refreshing..." : "🔄 Refresh"}
      </button>

      {loading && <p>Loading attendance...</p>}
      {!loading && error && <p role="alert">{error}</p>}
      {!loading && !error && attendance.length === 0 && <p>No attendance records found.</p>}

      {!loading && !error && attendance.length > 0 && (
        <ul>
          {attendance.map((record) => (
            <li key={record._id}>
              {record.subject || "Class"} → {new Date(record.date).toLocaleDateString()} ({record.status})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Attendance;
