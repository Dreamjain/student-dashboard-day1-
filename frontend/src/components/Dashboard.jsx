import { useCallback, useEffect, useMemo, useState } from "react";
import { FaCalendar, FaChartBar, FaClipboardCheck, FaClock, FaSyncAlt } from "react-icons/fa";
import "./dashboard.css";
import Charts from "./Charts";
import api from "../api/client";
import { getApiErrorMessage } from "../api/errors";

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
      setError(getApiErrorMessage(requestError, "Could not load your dashboard data. Please try again."));
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const attendanceStatus = useMemo(() => {
    const value = Number(summary?.attendancePercentage);
    if (!Number.isFinite(value)) return "Not available";
    if (value >= 85) return "On track";
    if (value >= 75) return "Watch";
    return "Needs attention";
  }, [summary]);

  if (loading && !summary) {
    return (
      <section className="dashboard dashboard-state" aria-live="polite">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-wide" />
        <div className="dashboard-grid">
          {[1, 2, 3, 4].map((item) => <div className="skeleton skeleton-card" key={item} />)}
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard">
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">Student portal</p>
          <h1 className="title">Good to see you, {summary?.name || "Student"}.</h1>
          <p className="subtitle">Keep an eye on your attendance, marks, and weekly schedule.</p>
        </div>
        <button className="refresh-button" onClick={fetchSummary} disabled={loading} type="button">
          <FaSyncAlt aria-hidden="true" className={loading ? "spin" : ""} />
          {loading ? "Refreshing" : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="dashboard-alert" role="alert">
          <strong>We couldn't refresh your dashboard.</strong>
          <span>{error}</span>
          <button onClick={fetchSummary} type="button">Try again</button>
        </div>
      )}

      {summary && (
        <>
          <div className="profile-strip">
            <div className="avatar" aria-hidden="true">{summary.name?.charAt(0)?.toUpperCase() || "S"}</div>
            <div>
              <strong>{summary.name}</strong>
              <span>Academic overview</span>
            </div>
            <span className="status-pill">{attendanceStatus}</span>
          </div>

          <div className="dashboard-grid">
            <button className="metric-card metric-primary" onClick={() => setActiveTab("attendance")} type="button">
              <span className="metric-icon"><FaClipboardCheck aria-hidden="true" /></span>
              <span className="metric-copy">
                <span>Attendance</span>
                <strong>{summary.attendancePercentage}%</strong>
                <small>View attendance history</small>
              </span>
            </button>

            <button className="metric-card" onClick={() => setActiveTab("marks")} type="button">
              <span className="metric-icon"><FaChartBar aria-hidden="true" /></span>
              <span className="metric-copy">
                <span>Average marks</span>
                <strong>{summary.averageMarks}</strong>
                <small>Review subject scores</small>
              </span>
            </button>

            <button className="metric-card" onClick={() => setActiveTab("timetable")} type="button">
              <span className="metric-icon"><FaClock aria-hidden="true" /></span>
              <span className="metric-copy">
                <span>Timetable</span>
                <strong>Weekly schedule</strong>
                <small>Check today's classes</small>
              </span>
            </button>

            <button className="metric-card" onClick={() => setActiveTab("timetable")} type="button">
              <span className="metric-icon"><FaCalendar aria-hidden="true" /></span>
              <span className="metric-copy">
                <span>Calendar</span>
                <strong>Academic planner</strong>
                <small>Open your schedule</small>
              </span>
            </button>
          </div>

          <div className="section-heading">
            <div>
              <p className="eyebrow">Performance</p>
              <h2>Academic snapshot</h2>
            </div>
            <button className="text-button" onClick={() => setActiveTab("marks")} type="button">View marks →</button>
          </div>

          <Charts />
        </>
      )}
    </section>
  );
}

export default Dashboard;
