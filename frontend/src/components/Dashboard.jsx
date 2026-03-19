import { useEffect, useState } from "react";
import axios from "axios";
import { FaChartBar, FaCalendar, FaClock } from "react-icons/fa";
import "./dashboard.css";

function Dashboard({ studentId, setActiveTab }) {
  const [summary, setSummary] = useState(null);

  useEffect(() => {  
    const fetchSummary = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/students/summary/${studentId}`
        );

        console.log("Summary:", res.data);
        setSummary(res.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchSummary();
  }, [studentId]);

  if (!summary) return <p>Loading...</p>;

  return (
    
    <div className="dashboard">
      
      <h1 className="title">dream-verse</h1>

      <div className="user">
        <span className="dot"></span>
        {summary.name}
      </div>

      <div className="grid">

       <div className="card" onClick={() => setActiveTab("attendance")}>
           Attendance: {summary.attendancePercentage}%
       </div>

        <div className="card" onClick={() => setActiveTab("timetable")}>
           Timetable
       </div>

        <div className="card" onClick={() => setActiveTab("marks")}>
          Avg Marks: {summary.averageMarks}
        </div>

        <div className="card">
          Calendar <FaCalendar />
        </div>

      </div>

    </div>
  );
}

export default Dashboard;