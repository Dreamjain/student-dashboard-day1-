import { useCallback, useEffect, useState } from "react";
import axios from "axios";

function Marks({ studentId }) {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMarks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/marks/student/${studentId}`
      );

      setMarks(res.data);
    } catch (error) {
      console.error("Error fetching marks:", error);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchMarks();
  }, [fetchMarks]);

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>Marks</h2>

      <button
        onClick={fetchMarks}
        disabled={loading}
        style={{ marginBottom: "20px" }}
      >
        {loading ? "Refreshing..." : "🔄 Refresh"}
      </button>

      {loading && <p>Loading...</p>}

      {!loading && marks.length === 0 && <p>No marks found</p>}

      {!loading && marks.length > 0 && (
        <ul>
          {marks.map((mark) => (
            <li key={mark._id}>
              {mark.subject} → {mark.score}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Marks;
