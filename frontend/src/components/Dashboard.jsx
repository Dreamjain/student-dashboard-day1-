import { useCallback, useEffect, useState } from "react";
import { FaCalendar } from "react-icons/fa";
import "./dashboard.css";
import Charts from "./Charts";
import api from "../api/client";

function Dashboard({ studentId, setActiveTab }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/students/summary/${studentId}`);
      setSummary(res.data);
    } catch (requestError) {
      console.error("Error fetching summary:", requestError);
      setError("Could not load your dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  if (loading && !summary) return <p>Loading dashboard...</p>;

  return (
    <div className="dashboard">
      <h1 className="title">Academics</h1>

      <button onClick={fetchSummary} disabled={loading} style={{ marginBottom: "20px" }}>
        {loading ? "Refreshing..." : "🔄 Refresh"}
      </button>

      {error && <p role="alert">{error}</p>}

      {summary && (
        <>
          <div className="user">
            <span className="dot"></span>
            {summary.name}
          </div>

          <div className="grid">
            <button className="card" onClick={() => setActiveTab("attendance")} type="button">
              Attendance: {summary.attendancePercentage}%
            </button>
            <button className="card" onClick={() => setActiveTab("timetable")} type="button">
              Timetable
            </button>
            <button className="card" onClick={() => setActiveTab("marks")} type="button">
              Avg Marks: {summary.averageMarks}
            </button>
            <div className="card">
              Calendar <FaCalendar aria-hidden="true" />
            </div>
          </div>

          <Charts />
        </>
      )}
    </div>
  );
}

export default Dashboard;
