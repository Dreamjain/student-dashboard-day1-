import { useCallback, useEffect, useState } from "react";
import api from "../api/client";

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
      console.error("Error fetching timetable:", requestError);
      setError("Could not load the timetable. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTimetable();
  }, [fetchTimetable]);

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>Timetable</h2>
      <button onClick={fetchTimetable} disabled={loading} style={{ marginBottom: "20px" }}>
        {loading ? "Refreshing..." : "🔄 Refresh"}
      </button>
      {loading && <p>Loading timetable...</p>}
      {!loading && error && <p role="alert">{error}</p>}
      {!loading && !error && timetable.length === 0 && <p>No timetable found.</p>}
      {!loading && !error && timetable.length > 0 && (
        <ul>
          {timetable.map((item) => (
            <li key={item._id}>
              {item.day} → {item.subject} ({item.time})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Timetable;
