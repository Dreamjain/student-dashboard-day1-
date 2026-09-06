import { useState } from "react";
import api from "../api/client";

function FacultyLogin({ setFacultyId }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/faculty/login", {
        email: email.trim().toLowerCase(),
        password
      });
      if (!res.data?.facultyId) throw new Error("Invalid login response");
      setFacultyId(res.data.facultyId);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Faculty Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="username"
        disabled={loading}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        disabled={loading}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Signing in..." : "Login"}
      </button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}

export default FacultyLogin;
