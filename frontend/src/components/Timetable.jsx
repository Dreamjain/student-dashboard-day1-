import { useCallback, useEffect, useState } from "react";
import api from "../api/client";
import { getApiErrorMessage } from "../api/errors";

function Timetable() {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTimetable = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/timetable");
      setTimetable(Array.isArray(res.data) ? res.data : []);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Could not load the timetable. Please try again."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTimetable();
  }, [fetchTimetable]);

  return (
    <div style={{ marginTop: "20px" }}>
      <div className="data-page-header"><div><p className="eyebrow">Weekly schedule</p><h2>Timetable</h2><p>Keep your class schedule close at hand.</p></div><button className="refresh-button" onClick={fetchTimetable} disabled={loading} type="button">{loading ? "Refreshing..." : "Refresh"}</button></div>
      <button onClick={fetchTimetable} disabled={loading} style={{ marginBottom: "20px" }}>
        {loading ? "Refreshing..." : "🔄 Refresh"}
      </button>
      {loading && <p>Loading timetable...</p>}
      {!loading && error && <p role="alert">{error}</p>}
      {!loading && !error && timetable.length === 0 && <p>No timetable found.</p>}
      {!loading && !error && timetable.length > 0 && (
        <div className="data-list">
          {timetable.map((item) => (
            <li key={item._id}>
              {item.day} → {item.subject} ({item.time})
            </li>
          ))}
        </div>
      )}
    </div>
  );
}

export default Timetable;
