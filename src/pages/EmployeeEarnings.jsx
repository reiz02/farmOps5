import React, { useState, useEffect, useCallback } from "react";

const EmployeeEarnings = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [amount, setAmount] = useState("");
  const [submissions, setSubmissions] = useState([]);

  const fetchSubmissions = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/earnings-history");
      const data = await res.json();
      const userSubmissions = data.dailySubmissions.filter(
        (item) => item.employeeEmail === user.email
      );
      setSubmissions(userSubmissions);
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
    }
  }, [user.email]); // <-- dependency on user.email

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]); // <-- now safe

  const submit = async () => {
    if (!amount) return alert("Please enter earnings");

    await fetch("http://localhost:5000/api/earnings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeEmail: user.email,
        amount: Number(amount)
      })
    });

    alert("Earnings submitted successfully");
    setAmount("");
    fetchSubmissions(); // Refresh the submissions table
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Submit Earnings</h2>

      <input
        type="number"
        placeholder="Enter earnings"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <button onClick={submit} style={{ marginLeft: "10px" }}>
        Submit
      </button>

      <div style={{ marginTop: "40px" }}>
        <h3>Your Submissions</h3>
        {submissions.length === 0 ? (
          <p>No submissions yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #000" }}>
                <th>Date</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((item) => (
                <tr key={item._id} style={{ borderBottom: "1px solid #ccc" }}>
                  <td>{new Date(item.createdAt).toLocaleString()}</td>
                  <td>${item.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default EmployeeEarnings;