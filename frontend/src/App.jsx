import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AddTransaction from "./pages/AddTransaction";
import History from "./pages/History";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import "./App.css";

// Navigation header: Only shown when user is logged in
// Does NOT include login/signup links
function Navigation({ darkMode, toggleTheme, user, onLogout }) {
  return (
    <nav className="navbar">
      <Link to="/dashboard" style={{ textDecoration: "none", color: "inherit" }}>
        <h2>💰 Expense Tracker</h2>
      </Link>

      <div className="nav-right">
        <div className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/add-transaction">Add Transaction</Link>
          <Link to="/history">History</Link>

          <span className="nav-user-badge" title={user?.email}>
            👤 {user?.name}
          </span>
          <button
            type="button"
            className="nav-logout-btn"
            onClick={onLogout}
          >
            Logout
          </button>
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
  );
}

// Protected Route wrapper: Redirects to /login if not logged in
function ProtectedRoute({ user, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Public Auth Route wrapper: Redirects to /dashboard if already logged in
function PublicAuthRoute({ user, children }) {
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function AppContent() {
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("expense_tracker_theme");
    // Default to Light Mode (false) unless user previously toggled to dark
    return saved === "dark";
  });

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("expense_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
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

  const handleLogout = () => {
    localStorage.removeItem("expense_token");
    localStorage.removeItem("expense_user");
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="app">
      {/* Header only renders for logged-in users; no login/signup buttons in header */}
      {user && (
        <Navigation
          darkMode={darkMode}
          toggleTheme={toggleTheme}
          user={user}
          onLogout={handleLogout}
        />
      )}

      <Routes>
        {/* Auth routes: First-time entry screen */}
        <Route
          path="/login"
          element={
            <PublicAuthRoute user={user}>
              <Login
                onLoginSuccess={(loggedInUser) => setUser(loggedInUser)}
                darkMode={darkMode}
                toggleTheme={toggleTheme}
              />
            </PublicAuthRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicAuthRoute user={user}>
              <Signup
                onSignupSuccess={(signedUpUser) => setUser(signedUpUser)}
                darkMode={darkMode}
                toggleTheme={toggleTheme}
              />
            </PublicAuthRoute>
          }
        />

        {/* Protected App Routes: Only accessible after login */}
        <Route
          path="/"
          element={
            <ProtectedRoute user={user}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-transaction"
          element={
            <ProtectedRoute user={user}>
              <AddTransaction />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute user={user}>
              <History />
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route
          path="*"
          element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;