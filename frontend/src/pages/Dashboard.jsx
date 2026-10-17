import { useEffect, useState } from "react";

function Dashboard() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/expenses")
      .then((res) => res.json())
      .then((result) => {
        setTransactions(
          Array.isArray(result) ? result : result.data || []
        );
      })
      .catch((error) => console.error("Error:", error));
  }, []);

  const income = transactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const expenses = transactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  return (
    <div className="page">
      <h1>💰 Expense Tracker Dashboard</h1>

      <div className="cards">
        <div className="card">
          <h3>Total Income</h3>
          <h2>Rs. {income}</h2>
        </div>

        <div className="card">
          <h3>Total Expenses</h3>
          <h2>Rs. {expenses}</h2>
        </div>

        <div className="card">
          <h3>Balance</h3>
          <h2>Rs. {income - expenses}</h2>
        </div>
      </div>

      <h2>Recent Transactions</h2>

      {transactions.length === 0 ? (
        <p>No transactions available.</p>
      ) : (
        transactions.slice(-5).reverse().map((item) => (
          <div className="transaction" key={item._id}>
            <span>{item.title} — {item.category}</span>
            <strong>Rs. {item.amount}</strong>
          </div>
        ))
      )}
    </div>
  );
}

export default Dashboard;