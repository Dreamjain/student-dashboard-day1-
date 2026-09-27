import { useCallback, useEffect, useState } from "react";
import api from "../api/client";
import { getApiErrorMessage } from "../api/errors";
import "./data-pages.css";

function Marks({ studentId }) {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMarks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/marks/student/${studentId}`);
      setMarks(Array.isArray(res.data) ? res.data : []);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Could not load marks. Please try again."));
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchMarks();
  }, [fetchMarks]);

  return (
    <div style={{ marginTop: "20px" }}>
      <div className="data-page-header"><div><p className="eyebrow">Academic performance</p><h2>Marks</h2><p>Review your latest subject scores.</p></div><button className="refresh-button" onClick={fetchMarks} disabled={loading} type="button">{loading ? "Refreshing..." : "Refresh"}</button></div>

      <button onClick={fetchMarks} disabled={loading} style={{ marginBottom: "20px" }}>
        {loading ? "Refreshing..." : "🔄 Refresh"}
      </button>

      {loading && <p>Loading marks...</p>}
      {!loading && error && <p role="alert">{error}</p>}
      {!loading && !error && marks.length === 0 && <p>No marks found.</p>}

      {!loading && !error && marks.length > 0 && (
        <div className="data-list">
          {marks.map((mark) => (
            <li key={mark._id}>
              {mark.subject} → {mark.score}
            </li>
          ))}
        </div>
      )}
    </div>
  );
}

export default Marks;
