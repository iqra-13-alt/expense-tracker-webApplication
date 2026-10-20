import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Signup({ onSignupSuccess, darkMode, toggleTheme }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
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

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save token and user in localStorage
        localStorage.setItem("expense_token", data.token);
        localStorage.setItem("expense_user", JSON.stringify(data.user));

        if (onSignupSuccess) {
          onSignupSuccess(data.user);
        }

        navigate("/dashboard");
      } else {
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Signup error:", err);
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

        <h2>Create Account</h2>
        <p>Start tracking your expenses and savings</p>

        {error && <div className="auth-alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label htmlFor="signup-name">Full Name</label>
          <input
            id="signup-name"
            type="text"
            placeholder="John Doe"
            required
            name="name"
            value={formData.name}
            onChange={handleChange}
            autoComplete="name"
          />

          <label htmlFor="signup-email">Email Address</label>
          <input
            id="signup-email"
            type="email"
            placeholder="name@example.com"
            required
            name="email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
          />

          <label htmlFor="signup-password">Password</label>
          <input
            id="signup-password"
            type="password"
            placeholder="Min. 6 characters"
            required
            name="password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
            minLength={6}
          />

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;