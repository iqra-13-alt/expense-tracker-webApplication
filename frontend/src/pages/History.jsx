import { useEffect, useState, useCallback } from "react";

function History() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [category, setCategory] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const [editingItem, setEditingItem] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("Food");
  const [editType, setEditType] = useState("expense");
  const [editDate, setEditDate] = useState("");

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (type !== "all") params.append("type", type);
      if (category !== "all") params.append("category", category);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (sortBy) params.append("sortBy", sortBy);

      const url = `http://localhost:5000/api/expenses?${params.toString()}`;
      const res = await fetch(url);
      const result = await res.json();

      setTransactions(Array.isArray(result) ? result : result.data || []);
    } catch (error) {
      console.error("API error, using local fallback:", error);
    } finally {
      setLoading(false);
    }
  }, [search, type, category, startDate, endDate, sortBy]);

    useEffect(() => {
    const timer = setTimeout(() => {
      fetchTransactions();
    }, 250);

    return () => clearTimeout(timer);
  }, [fetchTransactions]);

  // Export to CSV / Excel
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      alert("No transactions available to download.");
      return;
    }

    const headers = ["Title", "Type", "Category", "Amount (PKR)", "Date"];
    const rows = transactions.map((t) => [
      `"${(t.title || "").replace(/"/g, '""')}"`,
      t.type || "",
      t.category || "",
      t.amount || 0,
      new Date(t.date || Date.now()).toLocaleDateString("en-PK")
    ]);

    // \uFEFF BOM ensures MS Excel displays UTF-8 cleanly
    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const dateStamp = new Date().toISOString().split("T")[0];
    link.setAttribute("download", `expenses_statement_${dateStamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Delete transaction via API
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/expenses/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Could not delete from backend");
      }

      setTransactions((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      console.error("Delete error:", error);
      setTransactions((prev) => prev.filter((item) => item._id !== id));
    }
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

  // Save Edit via PUT API
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
      console.error("Edit API error:", error);
    }

    setTransactions((prev) =>
      prev.map((t) => (t._id === editingItem._id ? { ...t, ...updatedData } : t))
    );

    setEditingItem(null);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearch("");
    setType("all");
    setCategory("all");
    setStartDate("");
    setEndDate("");
    setSortBy("newest");
  };

  // Summary stats
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const netBalance = totalIncome - totalExpense;

  return (
    <div className="page">
      {/* Top Header with Download Button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "8px" }}>
        <div>
          <h1>📊 Transaction History</h1>
          <p>Apni tamam income aur expenses dekhein aur filter karein.</p>
        </div>
        <button
          type="button"
          className="btn-download"
          onClick={handleExportCSV}
        >
          📥 Download Excel (CSV)
        </button>
      </div>

      {/* FILTER CONTROLS TOOLBAR */}
      <div className="filter-card">
        <div className="filter-grid">
          {/* Search */}
          <div className="filter-field">
            <label>Search</label>
            <input
              type="text"
              placeholder="Title ya Category search karein..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Type Filter */}
          <div className="filter-field">
            <label>Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="all">All Types</option>
              <option value="income">Income Only</option>
              <option value="expense">Expenses Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="filter-field">
            <label>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="Food">Food</option>
              <option value="Education">Education</option>
              <option value="Shopping">Shopping</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Travel">Travel</option>
              <option value="Health">Health</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* From Date */}
          <div className="filter-field">
            <label>From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          {/* To Date */}
          <div className="filter-field">
            <label>To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {/* Sort By */}
          <div className="filter-field">
            <label>Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Date: Newest First</option>
              <option value="oldest">Date: Oldest First</option>
              <option value="highest">Amount: High to Low</option>
              <option value="lowest">Amount: Low to High</option>
            </select>
          </div>

          {/* Reset Button */}
          <div className="filter-field">
            <button
              type="button"
              className="btn-reset"
              onClick={handleResetFilters}
            >
              🔄 Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* SUMMARY STATS BAR */}
      <div className="summary-stats-bar">
        <div className="stat-item">
          Total Entries: <strong>{transactions.length}</strong>
        </div>
        <div className="stat-item">
          Income: <strong style={{ color: "#10b981" }}>+ Rs. {totalIncome.toLocaleString("en-PK")}</strong>
        </div>
        <div className="stat-item">
          Expenses: <strong style={{ color: "#ef4444" }}>- Rs. {totalExpense.toLocaleString("en-PK")}</strong>
        </div>
        <div className="stat-item">
          Net:{" "}
          <strong style={{ color: netBalance >= 0 ? "#10b981" : "#ef4444" }}>
            {netBalance >= 0 ? "+" : "-"} Rs. {Math.abs(netBalance).toLocaleString("en-PK")}
          </strong>
        </div>
      </div>

      {/* TRANSACTION LIST */}
      {loading ? (
        <p style={{ textAlign: "center", padding: "20px" }}>Loading transactions...</p>
      ) : transactions.length === 0 ? (
        <div style={{ textAlign: "center", padding: "30px", background: "white", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <p style={{ fontSize: "16px", color: "#64748b" }}>
            No transactions found matching your filters.
          </p>
          <button
            type="button"
            className="btn-reset"
            style={{ marginTop: "12px" }}
            onClick={handleResetFilters}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        transactions.map((item) => (
          <div className="transaction" key={item._id}>
            <div>
              <strong>{item.title}</strong>
              <p>
                <span className="category-tag">{item.category}</span>
                {" "} | {item.type} |{" "}
                {new Date(item.date || Date.now()).toLocaleDateString("en-PK", {
                  year: "numeric",
                  month: "short",
                  day: "numeric"
                })}
              </p>
            </div>

            <strong
              style={{
                color: item.type === "income" ? "#10b981" : "#ef4444",
                fontSize: "18px"
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

      {/* EDIT MODAL POPUP */}
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

export default History;