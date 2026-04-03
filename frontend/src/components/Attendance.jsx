import { useEffect, useState } from "react";
import axios from "axios";

function Attendance({studentId}) {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/attendance/history/${studentId}`
      );

      console.log("Attendance data:", res.data);
      setAttendance(res.data);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [studentId]);

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>Attendance History</h2>

      <button onClick={fetchAttendance} disabled={loading} style={{ marginBottom: "20px" }}>
        {loading ? "Refreshing..." : "🔄 Refresh"}
      </button>

      {loading && <p>Loading...</p>}

      {!loading && attendance.length === 0 && <p>No attendance records found</p>}

      {!loading && attendance.length > 0 && (
        <ul>
          {attendance.map((record) => (
            <li key={record._id}>
              {record.subject} → {new Date(record.date).toLocaleDateString()} ({record.status})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Attendance;
