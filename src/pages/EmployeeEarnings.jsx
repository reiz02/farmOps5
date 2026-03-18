import React, { useState, useEffect, useCallback } from "react";

const EmployeeEarnings = () => {
  // Safe parsing of user data
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [amount, setAmount] = useState("");
  const [submissions, setSubmissions] = useState([]);

  const fetchSubmissions = useCallback(async () => {
    if (!user.email) return;
    
    try {
      // TAMA: /api/earnings ang gamit sa backend, hindi /api/earnings-history
      const res = await fetch("http://localhost:5000/api/earnings");
      
      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();

      // TAMA: Ang backend ay nagbabalik ng Array ([...])
      // I-filter natin para yung submissions lang ni 'rei' ang lumabas
      const userSubmissions = data.filter(
        (item) => item.employeeEmail === user.email
      );
      
      setSubmissions(userSubmissions);
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
    }
  }, [user.email]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const submit = async () => {
    if (!amount) return alert("Please enter earnings");

    try {
      const response = await fetch("http://localhost:5000/api/earnings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeEmail: user.email,
          amount: Number(amount)
        })
      });

      if (response.ok) {
        alert("Earnings submitted successfully");
        setAmount("");
        // REFRESH ang table matapos ang submission
        fetchSubmissions(); 
      } else {
        alert("Failed to submit earnings");
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert("Error connecting to server");
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Submit Earnings</h2>
      <p style={{ color: "#666" }}>Welcome, {user.firstName || user.email}</p>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="number"
          placeholder="Enter earnings"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <button 
          onClick={submit} 
          style={{ 
            marginLeft: "10px", 
            padding: "8px 20px", 
            backgroundColor: "#2563eb", 
            color: "white", 
            border: "none", 
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Submit
        </button>
      </div>

      <div style={{ marginTop: "40px" }}>
        <h3>Your Submissions</h3>
        {submissions.length === 0 ? (
          <p>No submissions yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #000", textAlign: "left" }}>
                <th style={{ padding: "10px" }}>Date</th>
                <th style={{ padding: "10px" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((item) => (
                <tr key={item._id} style={{ borderBottom: "1px solid #ccc" }}>
                  <td style={{ padding: "10px" }}>
                    {new Date(item.createdAt).toLocaleString()}
                  </td>
                  <td style={{ padding: "10px" }}>₱{item.amount.toLocaleString()}</td>
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