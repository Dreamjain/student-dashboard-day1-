import { useState } from "react";
import api, { USER_KEY, ensureCsrf } from "../api/client";
import { getApiErrorMessage } from "../api/errors";

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
      await ensureCsrf();
      const res = await api.post("/api/faculty/login", { email: email.trim().toLowerCase(), password });
      if (!res.data?.facultyId) throw new Error("Invalid login response");
      sessionStorage.setItem(USER_KEY, JSON.stringify({ id: res.data.facultyId, role: "faculty" }));
      setFacultyId(res.data.facultyId);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to sign in. Check your credentials and try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Faculty Login</h2>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" disabled={loading} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" disabled={loading} />
      <button type="submit" disabled={loading}>{loading ? "Signing in..." : "Login"}</button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}

export default FacultyLogin;
