import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login({ onLoginSuccess, darkMode, toggleTheme }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save token and user in localStorage
        localStorage.setItem("expense_token", data.token);
        localStorage.setItem("expense_user", JSON.stringify(data.user));

        if (onLoginSuccess) {
          onLoginSuccess(data.user);
        }

        navigate("/dashboard");
      } else {
        setError(data.message || "Invalid email or password.");
      }
    } catch (err) {
      console.error("Login request error:", err);
      setError("Cannot connect to server. Please check your backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Theme Toggle Button */}
      {toggleTheme && (
        <button
          type="button"
          className="auth-theme-toggle"
          onClick={toggleTheme}
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle theme"
        >
          <span>{darkMode ? "☀️" : "🌙"}</span>
          <span>{darkMode ? "Light" : "Dark"}</span>
        </button>
      )}

      <div className="auth-card">
        <h1>💰 Expense Tracker</h1>

        <h2>Welcome Back</h2>
        <p>Please enter your details to sign in</p>

        {error && <div className="auth-alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label htmlFor="login-email">Email Address</label>
          <input
            id="login-email"
            type="email"
            placeholder="name@example.com"
            required
            name="email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
          />

          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            placeholder="••••••••"
            required
            name="password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
          />

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="auth-link">
          Don't have an account? <Link to="/signup">Create an Account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
