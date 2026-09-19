import { useState } from "react";
import api, { USER_KEY, ensureCsrf } from "../api/client";
import { getApiErrorMessage } from "../api/errors";

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
      await ensureCsrf();
      const res = await api.post("/students/login", { rollNumber: rollNumber.trim(), password });
      if (!res.data?.user?.id) throw new Error("Invalid login response");
      sessionStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
      setStudentId(res.data.user.id);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to sign in. Check your credentials and try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} style={{ marginTop: "50px" }}>
      <h2>Student Login</h2>
      <input type="text" placeholder="Enter roll number" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} autoComplete="username" disabled={loading} />
      <br /><br />
      <input type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" disabled={loading} />
      <br /><br />
      <button type="submit" disabled={loading}>{loading ? "Signing in..." : "Login"}</button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}

export default Login;
