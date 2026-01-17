import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";
import "../pages/CSS/styling.css";


const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const res = await authAPI.login({ username, password, role });
      
      // Store user data and token using AuthContext
      // Use role from response data, not from form state
      login(res.data.user, res.data.token, res.data.user.role);
      
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.msg || "Login failed");
    } finally {
      setLoading(false);
    }
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

      <button className="login-btn" type="submit" disabled={loading}>
      {loading ? "Logging in..." : "Login"}</button>
    
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