import { useState } from "react";
import { Link } from "react-router-dom";

const CATEGORIES = [
  { name: "Food", icon: "🍔" },
  { name: "Education", icon: "🎓" },
  { name: "Shopping", icon: "🛍️" },
  { name: "Entertainment", icon: "🎬" },
  { name: "Travel", icon: "🚗" },
  { name: "Health", icon: "💊" },
  { name: "Salary", icon: "💼" },
  { name: "Other", icon: "📦" }
];

function AddTransaction() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [type, setType] = useState("expense");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API = "http://localhost:5000/api/expenses";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !amount || Number(amount) <= 0) {
      setMessage("Please enter a valid title and positive amount.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          amount: Number(amount),
          category,
          type,
          date: new Date(date).toISOString(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.message || "Transaction save nahi hui.");
        return;
      }

      setMessage("Transaction successfully saved! ✅");
      setTitle("");
      setAmount("");
      setCategory("Food");
      setType("expense");
      setDate(new Date().toISOString().split("T")[0]);

      setTimeout(() => {
        setMessage("");
      }, 4000);
    } catch (error) {
      setMessage("Backend se connection nahi ho raha.");
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <h1>➕ Add Transaction</h1>
        <Link to="/" style={{ color: "#2563eb", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>
          ← Back to Dashboard
        </Link>
      </div>
      <p>Apni income ya expense ka record add karein.</p>

      {message && (
        <div className={`message ${message.includes("✅") ? "success" : "error"}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Segmented Type Controller */}
        <label>Transaction Type</label>
        <div className="type-toggle-switch">
          <button
            type="button"
            className={`type-toggle-btn ${type === "expense" ? "active expense" : ""}`}
            onClick={() => {
              setType("expense");
              if (category === "Salary") setCategory("Food");
            }}
          >
            <span>🔴</span> Expense
          </button>
          <button
            type="button"
            className={`type-toggle-btn ${type === "income" ? "active income" : ""}`}
            onClick={() => {
              setType("income");
              setCategory("Salary");
            }}
          >
            <span>🟢</span> Income
          </button>
        </div>

        {/* Title */}
        <label>Transaction Title</label>
        <input
          type="text"
          placeholder={type === "expense" ? "Example: Grocery, Fuel, Dinner" : "Example: Monthly Salary, Freelance"}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        {/* 2-Column: Amount & Date */}
        <div className="form-row-2">
          <div>
            <label>Amount (PKR)</label>
            <div className="currency-input-wrap">
              <span>Rs.</span>
              <input
                type="number"
                placeholder="0.00"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Category Picker Chips */}
        <label>Category</label>
        <div className="category-chips-grid">
          {CATEGORIES.map((cat) => (
            <button
              type="button"
              key={cat.name}
              className={`category-chip ${category === cat.name ? "selected" : ""}`}
              onClick={() => setCategory(cat.name)}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Live Preview Summary Bar */}
        <div className="form-preview-card">
          <div>
            <strong style={{ color: "#1e293b" }}>{title || "Untitled Transaction"}</strong>
            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
              {category} • {new Date(date).toLocaleDateString("en-PK", { month: "short", day: "numeric", year: "numeric" })}
            </div>
          </div>
          <div
            style={{
              fontSize: "16px",
              fontWeight: 800,
              color: type === "income" ? "#10b981" : "#ef4444"
            }}
          >
            {type === "income" ? "+" : "-"} Rs. {amount ? Number(amount).toLocaleString("en-PK") : "0"}
          </div>
        </div>

        <button
          type="submit"
          style={{ width: "100%", padding: "14px", fontSize: "15px" }}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving Transaction..." : "Save Transaction"}
        </button>
      </form>
    </div>
  );
}

export default AddTransaction;