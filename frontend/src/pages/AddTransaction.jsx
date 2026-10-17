import { useState } from "react";

function AddTransaction() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [type, setType] = useState("expense");
  const [message, setMessage] = useState("");

  const API = "http://localhost:5000/api/expenses";

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting transaction:", { title, amount, category, type });
    

    try {
        console.log("Sending data to API:", { title, amount, category, type });
      const response = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          amount: Number(amount),
          category,
          type,
        }),
      });

      const result = await response.json();
      console.log("Status:", response.status);
      console.log("server response:", result);

      if (!response.ok) {
        setMessage(result.message || "Transaction save nahi hui.");
        return;
      }

      setMessage("Transaction successfully saved! ✅");
      setTitle("");
      setAmount("");
      setCategory("Food");
      setType("expense");
    } catch (error) {
      setMessage("Backend se connection nahi ho raha.");
      console.error("Error:", error);
    }
  };

  return (
    <div className="page">
      <h1>➕ Add Transaction</h1>
      <p>Apni income ya expense ka record add karein.</p>

      <form onSubmit={handleSubmit}>
        <label>Transaction Title</label>
        <input
          type="text"
          placeholder="Example: Salary"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <label>Amount (Rs.)</label>
        <input
          type="number"
          placeholder="Enter amount"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <label>Transaction Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <label>Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="Food">Food</option>
          <option value="Education">Education</option>
          <option value="Shopping">Shopping</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Travel">Travel</option>
          <option value="Health">Health</option>
          <option value="Other">Other</option>
        </select>
        <button type="submit">Add Transaction</button>
      </form>
      </div>
  );
}

export default AddTransaction;