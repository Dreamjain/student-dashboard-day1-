import { useState } from "react";
import axios from "axios";

function Login({ setStudentId }) {
  const [rollNumber, setRollNumber] = useState("");
  const [password, setPassword] = useState("");
  

 const handleLogin = async () => {
  try {
    const res = await axios.post("http://localhost:5000/students/login", {
      rollNumber,
      password
    });

    setStudentId(res.data._id);
  } catch (err) {
    alert("Student not found");
  }
};

  return (
    <div style={{ marginTop: "50px" }}>
      <h2>Login</h2>

      <input
        type="text"
        placeholder="Enter roll number"
        value={rollNumber}
        onChange={(e) => setRollNumber(e.target.value)}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;