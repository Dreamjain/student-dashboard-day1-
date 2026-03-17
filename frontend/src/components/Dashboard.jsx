import { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {
  const [summary, setSummary] = useState(null);

  const studentId = "69ac40da5d14dbf58fbba148";

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/students/summary/${studentId}`
        );

        console.log("API DATA:", res.data); // debug
        setSummary(res.data);
      } catch (error) {
        console.error("API ERROR:", error);
      }
    };

    fetchSummary();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Dashboard</h2>

      {!summary && <p>Loading...</p>}

      {summary && (
        <div>
          <p>Name: {summary.name}</p>
          <p>Attendance: {summary.attendancePercentage}%</p>
          <p>Average Marks: {summary.averageMarks}</p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;