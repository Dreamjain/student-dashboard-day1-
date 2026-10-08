import { useState } from "react";
import { FaLightbulb, FaSyncAlt } from "react-icons/fa";
import api from "../api/client";
import { getApiErrorMessage } from "../api/errors";
import "./ai-assistant.css";

function AIAssistant() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyze = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/api/ai/analysis");
      setResult(response.data);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Could not generate your academic analysis."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="ai-assistant" aria-labelledby="ai-title">
      <div className="ai-hero">
        <div className="ai-icon" aria-hidden="true"><FaLightbulb /></div>
        <div>
          <p className="eyebrow">AI Academic Copilot</p>
          <h1 id="ai-title">Turn your academic data into a plan.</h1>
          <p>
            Get evidence-based guidance from your current marks and attendance.
            AI is only called when you ask for an analysis.
          </p>
        </div>
      </div>

      <div className="ai-card">
        <div>
          <h2>Performance analysis</h2>
          <p>Find your strongest areas, identify what needs attention, and get three prioritized actions.</p>
        </div>
        <button type="button" onClick={analyze} disabled={loading}>
          <FaSyncAlt aria-hidden="true" className={loading ? "spin" : ""} />
          {loading ? "Analyzing..." : result ? "Analyze again" : "Analyze my performance"}
        </button>
      </div>

      {error && <div className="ai-alert" role="alert">{error}</div>}

      {result && (
        <div className="ai-result">
          <div className="ai-result-header">
            <h2>Your AI analysis</h2>
            <span>Based on current dashboard data</span>
          </div>
          <div className="ai-metrics">
            <span>Attendance <strong>{result.metrics.attendancePercentage}%</strong></span>
            <span>Average marks <strong>{result.metrics.averageMarks}</strong></span>
          </div>
          <div className="ai-text">{result.analysis}</div>
        </div>
      )}
    </section>
  );
}

export default AIAssistant;
