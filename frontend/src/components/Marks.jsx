import { useEffect, useState } from "react";
import axios from "axios";

function Marks({studentId}) {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    const fetchMarks = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/marks/student/${studentId}`
        );

        console.log("Marks data:", res.data); // debug
        setMarks(res.data);
      } catch (error) {
        console.error("Error fetching marks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarks();
  }, []);

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>Marks</h2>

      {loading && <p>Loading...</p>}

      {!loading && marks.length === 0 && <p>No marks found</p>}

      {!loading && marks.length > 0 && (
        <ul>
          {marks.map((m) => (
            <li key={m._id}>
              {m.subject} → {m.score}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Marks;