import { useState } from "react";
import axios from "axios";

function FacultyLogin({ setFacultyId }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/faculty/login",
        { email, password }
      );

      setFacultyId(res.data.facultyId);
    } catch (error) {
      alert("Login failed");
    }
  };

  return (
    <div>
      <h2>Faculty Login</h2>

      <input
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default FacultyLogin;