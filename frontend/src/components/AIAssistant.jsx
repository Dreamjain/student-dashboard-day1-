import { useState } from "react";
import { FaLightbulb, FaSyncAlt } from "react-icons/fa";
import api from "../api/client";
import { getApiErrorMessage } from "../api/errors";
import "./ai-assistant.css";
import "./ai-tools.css";

function AIAssistant() {
  const [result, setResult] = useState(null);
  const [planner, setPlanner] = useState("");
  const [attendance, setAttendance] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");

  const run = async (key, request, assign) => {
    setLoading(key); setError("");
    try { const response = await request(); assign(response.data); }
    catch (e) { setError(getApiErrorMessage(e, "AI request could not be completed.")); }
    finally { setLoading(""); }
  };

  const analyze = () => run("analysis", () => api.get("/api/ai/analysis"), setResult);
  const getAttendance = () => run("attendance", () => api.get("/api/ai/attendance"), setAttendance);
  const getPlanner = () => run("planner", () => api.get("/api/ai/planner"), (data) => setPlanner(data.plan));
  const getTrends = () => run("trends", () => api.get("/api/ai/trends"), setTrends);

  const ask = async (event) => {
    event.preventDefault();
    if (!question.trim()) return;
    await run("chat", () => api.post("/api/ai/chat", { message: question }), (data) => {
      setAnswer(data.answer); setQuestion("");
    });
  };

  return (
    <section className="ai-assistant" aria-labelledby="ai-title">
      <div className="ai-hero">
        <div className="ai-icon" aria-hidden="true"><FaLightbulb /></div>
        <div>
          <p className="eyebrow">AI Academic Copilot</p>
          <h1 id="ai-title">Your academic data, turned into action.</h1>
          <p>AI is only called when you request a feature. Exact academic metrics remain calculated by the application.</p>
        </div>
      </div>

      <div className="ai-tools">
        <button type="button" onClick={analyze} disabled={!!loading}><FaSyncAlt /> Performance analysis</button>
        <button type="button" onClick={getAttendance} disabled={!!loading}><FaSyncAlt /> Attendance intelligence</button>
        <button type="button" onClick={getPlanner} disabled={!!loading}><FaSyncAlt /> 7-day study plan</button>
        <button type="button" onClick={getTrends} disabled={!!loading}><FaSyncAlt /> Academic trends</button>
      </div>

      {loading && <div className="ai-alert" role="status">Generating {loading}...</div>}
      {error && <div className="ai-alert" role="alert">{error}</div>}

      {result && <div className="ai-result"><h2>Performance analysis</h2><div className="ai-metrics"><span>Attendance <strong>{result.metrics.attendancePercentage}%</strong></span><span>Average marks <strong>{result.metrics.averageMarks}</strong></span></div><div className="ai-text">{result.analysis}</div></div>}
      {attendance && <div className="ai-result"><h2>Attendance intelligence</h2><div className="ai-text">{attendance.analysis}</div></div>}
      {planner && <div className="ai-result"><h2>Your 7-day study plan</h2><div className="ai-text">{planner}</div></div>}
      {trends && <div className="ai-result"><h2>Academic trends</h2><div className="ai-metrics"><span>Strongest <strong>{trends.strongestSubjects.length}</strong></span><span>Weakest <strong>{trends.weakestSubjects.length}</strong></span><span>Attendance risk <strong>{trends.attendanceRiskSubjects.length}</strong></span></div></div>}

      <div className="ai-card">
        <div><h2>Ask your Academic Copilot</h2><p>Ask about your current marks, attendance, or study priorities.</p></div>
        <form onSubmit={ask} className="ai-chat-form">
          <input aria-label="Ask Academic Copilot" value={question} onChange={(e) => setQuestion(e.target.value)} maxLength={2000} placeholder="e.g. What should I focus on this week?" />
          <button type="submit" disabled={!!loading || !question.trim()}>Ask</button>
        </form>
        {answer && <div className="ai-text">{answer}</div>}
      </div>
    </section>
  );
}

export default AIAssistant;
