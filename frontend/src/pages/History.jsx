import { useEffect, useState } from "react";

function History() {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

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

const handleDelete= async (id) => {
    
  try {
        const response = await fetch(
            `http://localhost:5000/api/expenses/${id}`,
            { method: "DELETE" }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(" not deleted");
        } 

        setExpenses((prevExpenses) =>
            prevExpenses.filter((expense) => expense._id !== id)
        );


    } catch (error) {
        console.error("Delete error:", error);
        alert("Could not delete transaction");
    }
};

  const filteredTransactions = transactions.filter((item) => {
    const matchesType =
      filter === "all" || item.type === filter;

    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());

    return matchesType && matchesSearch;
  });

  return (
    <div className="page">
      <h1>📊 Transaction History</h1>
      <p>Apni tamam income aur expenses dekhein.</p>

      <input
        type="text"
        placeholder="Search title or category..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      >
        <option value="all">All Transactions</option>
        <option value="income">Income Only</option>
        <option value="expense">Expenses Only</option>
      </select>

      {filteredTransactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        filteredTransactions.map((item) => (
          <div className="transaction" key={item._id}>
            <div>
              <strong>{item.title}</strong>
              <p>
                {item.category} | {item.type} |{" "}
                {new Date(item.date).toLocaleDateString()}
              </p>
            </div>

            <strong>
              {item.type === "income" ? "+" : "-"} Rs. {item.amount}
            </strong>
            <button onClick={() => handleDelete(item._id)}>Delete</button>
          </div>
        ))
      )}
    </div>
  );
}

export default History;