import { useEffect, useState } from "react";
import axios from "axios";

function Timetable() {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await axios.get("http://localhost:5000/timetable");

        console.log("Timetable:", res.data);
        setTimetable(res.data);
      } catch (error) {
        console.error("Error fetching timetable:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, []);

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>Timetable</h2>

      {loading && <p>Loading...</p>}

      {!loading && timetable.length === 0 && <p>No timetable found</p>}

      {!loading && timetable.length > 0 && (
        <ul>
          {timetable.map((t) => (
            <li key={t._id}>
              {t.day} → {t.subject} ({t.time})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Timetable;