import { useState } from "react";
import api from "../api/client";

function Login({ setStudentId }) {
  const [rollNumber, setRollNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");

    if (!rollNumber.trim() || !password) {
      setError("Enter both roll number and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/students/login", {
        rollNumber: rollNumber.trim(),
        password
      });

      if (!res.data?.id) {
        throw new Error("Login response did not include a student id.");
      }

      setStudentId(res.data.id);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to sign in. Check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} style={{ marginTop: "50px" }}>
      <h2>Student Login</h2>

      <input
        type="text"
        placeholder="Enter roll number"
        value={rollNumber}
        onChange={(e) => setRollNumber(e.target.value)}
        autoComplete="username"
        disabled={loading}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        disabled={loading}
      />

      <br /><br />

      <button type="submit" disabled={loading}>
        {loading ? "Signing in..." : "Login"}
      </button>

      {error && <p role="alert">{error}</p>}
    </form>
  );
}

export default Login;
