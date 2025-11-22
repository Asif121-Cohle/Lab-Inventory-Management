import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../pages/CSS/styling.css"; 

const SignupForm = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match");
    }

    navigate("/dashboard");

    /*
    try {
      const res = await axios.post("http://localhost:5000/api/auth/signup", form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.msg || "Signup failed");
    }
    */
  };

  return (
    <form className="signup-container" onSubmit={handleSubmit}>
      <h2 className="login-title">Create Account</h2>

      {error && <p className="error">{error}</p>}

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

      <button type="submit" className="login-btn">
        Sign Up
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
