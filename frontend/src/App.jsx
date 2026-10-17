import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AddTransaction from "./pages/AddTransaction";
import History from "./pages/History";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <nav className="navbar">
          <h2>💰 Expense Tracker</h2>

          <div className="nav-links">
            <Link to="/">Dashboard</Link>
            <Link to="/add-transaction">Add Transaction</Link>
            <Link to="/history">History</Link>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route
            path="/add-transaction"
            element={<AddTransaction />}
          />
          <Route path="/history" element={<History />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;