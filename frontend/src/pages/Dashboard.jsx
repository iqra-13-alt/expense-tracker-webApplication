import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const CATEGORY_ICONS = {
  Food: "🍔",
  Education: "🎓",
  Shopping: "🛍️",
  Entertainment: "🎬",
  Travel: "🚗",
  Health: "💊",
  Salary: "💼",
  Other: "📦"
};

const CATEGORY_COLORS = {
  Food: "#f97316",
  Education: "#14b8a6",
  Shopping: "#ec4899",
  Entertainment: "#8b5cf6",
  Travel: "#3b82f6",
  Health: "#06b6d4",
  Salary: "#10b981",
  Other: "#64748b"
};

function Dashboard() {
  const [transactions, setTransactions] = useState([]);

  // Edit Modal State
  const [editingItem, setEditingItem] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("Food");
  const [editType, setEditType] = useState("expense");
  const [editDate, setEditDate] = useState("");

  const fetchTransactions = () => {
    fetch("http://localhost:5000/api/expenses")
      .then((res) => res.json())
      .then((result) => {
        setTransactions(
          Array.isArray(result) ? result : result.data || []
        );
      })
      .catch((error) => console.error("Error:", error));
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Delete transaction
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;
    try {
      await fetch(`http://localhost:5000/api/expenses/${id}`, { method: "DELETE" });
    } catch (e) {
      console.error(e);
    }
    setTransactions((prev) => prev.filter((t) => t._id !== id));
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditAmount(item.amount);
    setEditCategory(item.category || "Food");
    setEditType(item.type || "expense");
    setEditDate(
      item.date ? new Date(item.date).toISOString().split("T")[0] : ""
    );
  };

  // Save Edit via API
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    const updatedData = {
      title: editTitle,
      amount: Number(editAmount),
      category: editCategory,
      type: editType,
      date: editDate ? new Date(editDate).toISOString() : new Date().toISOString()
    };

    try {
      await fetch(`http://localhost:5000/api/expenses/${editingItem._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
      });
    } catch (error) {
      console.error("Edit error:", error);
    }

    setTransactions((prev) =>
      prev.map((t) => (t._id === editingItem._id ? { ...t, ...updatedData } : t))
    );

    setEditingItem(null);
  };

  // Calculations
  const incomeItems = transactions.filter((item) => item.type === "income");
  const expenseItems = transactions.filter((item) => item.type === "expense");

  const totalIncome = incomeItems.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalExpense = expenseItems.reduce((sum, item) => sum + Number(item.amount), 0);
  const balance = totalIncome - totalExpense;

  // Category-wise Breakdown for Expenses
  const categoryTotals = expenseItems.reduce((acc, item) => {
    const cat = item.category || "Other";
    acc[cat] = (acc[cat] || 0) + Number(item.amount);
    return acc;
  }, {});

  const categoryList = Object.entries(categoryTotals)
    .map(([catName, amount]) => {
      const percentage = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
      return {
        name: catName,
        amount,
        percentage,
        icon: CATEGORY_ICONS[catName] || "📦",
        color: CATEGORY_COLORS[catName] || "#64748b"
      };
    })
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="page">
      {/* Header with Quick Action */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "8px" }}>
        <div>
          <h1>💰 Expense Tracker Dashboard</h1>
          <p>Apne kharchon aur aamdan ka mukammal jaiza dekhein.</p>
        </div>
        <Link to="/add-transaction" className="btn-add-quick">
          ➕ Add Transaction
        </Link>
      </div>

      {/* 3 SUMMARY CARDS */}
      <div className="cards">
        <div className="card">
          <div className="card-top-row">
            <h3>Total Income</h3>
            <span>🟢</span>
          </div>
          <h2 style={{ color: "#10b981" }}>+ Rs. {totalIncome.toLocaleString("en-PK")}</h2>
          <div className="card-meta-text">
            {incomeItems.length} {incomeItems.length === 1 ? "entry" : "entries"} recorded
          </div>
        </div>

        <div className="card">
          <div className="card-top-row">
            <h3>Total Expenses</h3>
            <span>🔴</span>
          </div>
          <h2 style={{ color: "#ef4444" }}>- Rs. {totalExpense.toLocaleString("en-PK")}</h2>
          <div className="card-meta-text">
            {expenseItems.length} {expenseItems.length === 1 ? "entry" : "entries"} recorded
          </div>
        </div>

        <div className="card">
          <div className="card-top-row">
            <h3>Net Balance</h3>
            <span>💼</span>
          </div>
          <h2 style={{ color: balance >= 0 ? "#0f2d59" : "#ef4444" }}>
            Rs. {balance.toLocaleString("en-PK")}
          </h2>
          <div className="card-meta-text">
            {balance >= 0 ? "Positive Cashflow ✅" : "Deficit Warning ⚠️"}
          </div>
        </div>
      </div>

      {/* CATEGORY SPENDING BREAKDOWN */}
      {categoryList.length > 0 && (
        <div className="dashboard-breakdown-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <h2 style={{ margin: 0, fontSize: "17px" }}>📊 Spending by Category</h2>
            <span style={{ fontSize: "13px", color: "#64748b" }}>
              Total Expenses: <strong>Rs. {totalExpense.toLocaleString("en-PK")}</strong>
            </span>
          </div>

          <div>
            {categoryList.slice(0, 5).map((cat) => (
              <div className="cat-progress-item" key={cat.name}>
                <div className="cat-progress-labels">
                  <span>
                    <span style={{ marginRight: "6px" }}>{cat.icon}</span>
                    {cat.name}
                  </span>
                  <span style={{ color: "#475569" }}>
                    Rs. {cat.amount.toLocaleString("en-PK")} ({cat.percentage}%)
                  </span>
                </div>
                <div className="cat-progress-track">
                  <div
                    className="cat-progress-fill"
                    style={{
                      width: `${cat.percentage}%`,
                      backgroundColor: cat.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RECENT TRANSACTIONS HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "24px 0 16px" }}>
        <h2 style={{ margin: 0 }}>Recent Activity</h2>
        <Link to="/history" style={{ color: "#2563eb", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>
          View All History →
        </Link>
      </div>

      {/* RECENT TRANSACTIONS LIST */}
      {transactions.length === 0 ? (
        <div style={{ padding: "30px", background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", textAlign: "center" }}>
          <p style={{ color: "#64748b", margin: 0 }}>No transactions available yet.</p>
          <Link
            to="/add-transaction"
            className="btn-add-quick"
            style={{ marginTop: "14px", display: "inline-flex" }}
          >
            + Add First Entry
          </Link>
        </div>
      ) : (
        transactions.slice(-5).reverse().map((item) => (
          <div className="transaction" key={item._id}>
            <div>
              <strong>
                <span style={{ marginRight: "6px" }}>{CATEGORY_ICONS[item.category] || "📦"}</span>
                {item.title}
              </strong>
              <p>
                <span className="category-tag">{item.category}</span>
                <span>•</span>
                <span style={{ textTransform: "capitalize" }}>{item.type}</span>
                <span>•</span>
                <span>
                  {new Date(item.date || Date.now()).toLocaleDateString("en-PK", {
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                  })}
                </span>
              </p>
            </div>

            <strong
              style={{
                color: item.type === "income" ? "#10b981" : "#ef4444",
                fontSize: "17px"
              }}
            >
              {item.type === "income" ? "+" : "-"} Rs. {Number(item.amount).toLocaleString("en-PK")}
            </strong>

            <div className="transaction-actions">
              <button
                type="button"
                className="btn-edit"
                onClick={() => handleOpenEdit(item)}
              >
                ✏️ Edit
              </button>
              <button
                type="button"
                className="btn-delete"
                onClick={() => handleDelete(item._id)}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))
      )}

      {/* EDIT MODAL DIALOG */}
      {editingItem && (
        <div className="modal-overlay" onClick={() => setEditingItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>✏️ Edit Transaction</h3>
            <form onSubmit={handleSaveEdit}>
              <label>Transaction Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
              />

              <label>Amount (Rs.)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                required
              />

              <label>Date</label>
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                required
              />

              <label>Type</label>
              <select
                value={editType}
                onChange={(e) => setEditType(e.target.value)}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>

              <label>Category</label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
              >
                <option value="Food">Food</option>
                <option value="Education">Education</option>
                <option value="Shopping">Shopping</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Travel">Travel</option>
                <option value="Health">Health</option>
                <option value="Salary">Salary</option>
                <option value="Other">Other</option>
              </select>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setEditingItem(null)}
                >
                  Cancel
                </button>
                <button type="submit">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;