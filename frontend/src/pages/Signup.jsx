import { Link } from "react-router-dom";
import{useNavigate} from "react-router-dom";
import { useState } from "react";

function Signup() {
  const navigate = useNavigate();
  const [message, setMessage] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setMessage((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  
   const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Submitting signup form with data:", message);
      const response = await fetch("http://localhost:5000/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });
      const data = await response.json();
      if (response.ok) {
        console.log("Signup successful:", data);
        navigate("/dashboard");
      } else {
        console.error("Signup failed:", data);
      }
    } catch (error) {
      console.error("Error submitting signup form:", error);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>💰 Expense Tracker</h1>

        <h2>Create Account</h2>
        <p>Start managing your money smarter!</p>

        <form onSubmit={handleSubmit}>
          <label>Full Name</label>
          <input
            type="text"
            placeholder="Enter your full name"
            required
            name="name"
            value={message.name}
            onChange={handleChange}
          />

          <label>Email Address</label>
          <input
            type="email"
            placeholder="Enter your email"
            required
            name="email"
            value={message.email}
            onChange={handleChange}
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Create a password"
            required
            name="password"
            value={message.password}
            onChange={handleChange}
          />

          <button type="submit" className="auth-button">
            Create Account
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;