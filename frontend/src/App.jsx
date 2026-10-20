import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AddTransaction from "./pages/AddTransaction";
import History from "./pages/History";
import "./App.css";
import Signup from "./pages/Signup";




function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("expense_tracker_theme");
    if (saved) return saved === "dark";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("expense_tracker_theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("expense_tracker_theme", "light");
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <BrowserRouter>
      <div className="app">
        <nav className="navbar">
          <h2>💰 Expense Tracker</h2>

          <div className="nav-right">
            <div className="nav-links">
            <Link to="/signup">Signup</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/add-transaction">Add Transaction</Link>
            <Link to="/history">History</Link>
              
            </div>

            {/* Dark Mode Toggle Button */}
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Dark/Light Mode"
            >
              <span className="theme-toggle-icon">{darkMode ? "☀️" : "🌙"}</span>
              <span className="theme-toggle-text">{darkMode ? "Light" : "Dark"}</span>
            </button>
          </div>
        </nav>

        <Routes>
          <Route path="/signup" element={<Signup />} />
           <Route path="/dashboard" element={<Dashboard />} />
           <Route
           path="/add-transaction"
            element={<AddTransaction />}/>
          <Route path="/history" element={<History />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;