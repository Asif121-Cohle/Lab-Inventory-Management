import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import "../pages/CSS/styling.css"; 

const SignupForm = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student"
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match");
    }

    if (form.password.length < 6) {
      return setError("Password must be at least 6 characters long");
    }

    setLoading(true);

    try {
      await authAPI.signup({
        username: form.username,
        email: form.email,
        password: form.password,
        role: form.role
      });
      
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.msg || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="signup-container" onSubmit={handleSubmit}>
      <h2 className="login-title">Create Account</h2>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">Account created! Redirecting to login...</p>}

      <input
        type="text"
        name="username"
        placeholder="Choose a username"
        value={form.username}
        onChange={handleChange}
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Enter your email"
        value={form.email}
        onChange={handleChange}
        required
      />

      <div className="role-section">
        <label>Select Role:</label>
        <label>
          <input
            type="radio"
            name="role"
            value="student"
            checked={form.role === "student"}
            onChange={handleChange}
          />
          Student
        </label>
        <label>
          <input
            type="radio"
            name="role"
            value="professor"
            checked={form.role === "professor"}
            onChange={handleChange}
          />
          Professor
        </label>
        <label>
          <input
            type="radio"
            name="role"
            value="lab_assistant"
            checked={form.role === "lab_assistant"}
            onChange={handleChange}
          />
          Lab Assistant
        </label>
      </div>

      <input
        type="password"
        name="password"
        placeholder="Create password"
        value={form.password}
        onChange={handleChange}
        required
      />

      <input
        type="password"
        name="confirmPassword"
        placeholder="Confirm password"
        value={form.confirmPassword}
        onChange={handleChange}
        required
      />

      <button type="submit" className="login-btn" disabled={loading}>
        {loading ? "Creating Account..." : "Sign Up"}
      </button>

      <p className="signup-text">
        Already have an account?{" "}
        <span className="signup-link" onClick={() => navigate("/login")}>
          Login
        </span>
      </p>
    </form>
  );
};

export default SignupForm;
