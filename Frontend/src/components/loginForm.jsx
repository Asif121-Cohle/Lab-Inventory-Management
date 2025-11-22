import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../pages/CSS/styling.css";


const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    navigate("/dashboard");
   /* try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { username, password ,role});
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.msg || "Login failed");
    }
   */
  };

return (
    <form className="container" onSubmit={handleSubmit}>
      {error && <p className="error">{error}</p>}

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <div className="role-section">
        <label>
          <input
            type="radio"
            name="role"
            value="lab_assistant"
            checked={role === "lab_assistant"}
            onChange={(e) => setRole(e.target.value)}
            required
          />
          Lab Assistant
        </label>

        <label>
          <input
            type="radio"
            name="role"
            value="professor"
            checked={role === "professor"}
            onChange={(e) => setRole(e.target.value)}
            required
          />
          Professor
        </label>

        <label>
          <input
            type="radio"
            name="role"
            value="student"
            checked={role === "student"}
            onChange={(e) => setRole(e.target.value)}
            required
          />
          Student
        </label>
      </div>

      <button className="btns" type="submit" >
      Login</button>
    
    <p className="signup-text">
        Don't have an account?{" "}
        <span className="signup-link" onClick={() => navigate("/signupForm")}>
          Sign up
        </span>
    </p>
    </form>
  );
};

export default LoginForm;