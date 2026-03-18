import React, { useEffect, useState, useCallback } from "react";

const ReportsPage = () => {
  const [amount, setAmount] = useState("");
  const [submissions, setSubmissions] = useState([]);
  
  // Kunin ang user mula sa localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  const fetchSubmissions = useCallback(async () => {
    try {
      // TAMA: /api/earnings (hindi earnings-history)
      const res = await fetch("http://localhost:5000/api/earnings");
      
      if (!res.ok) throw new Error("Server error");

      const data = await res.json();
      
      // TAMA: Ang backend mo ay nagbabalik ng Array ([...])
      // I-filter para yung email lang ni 'rei' o ng user ang lumabas
      const filtered = data.filter(item => item.employeeEmail === user?.email);
      
      setSubmissions(filtered);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }, [user?.email]);

  useEffect(() => {
    if (user?.email) {
      fetchSubmissions();
    }
  }, [fetchSubmissions, user?.email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount) return;

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
        setAmount("");
        // REFRESH: Tawagin ulit para magpakita ang bagong entry sa table
        await fetchSubmissions(); 
        alert("Earnings submitted successfully!");
      }
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  const deleteRecord = async (id) => {
    if (window.confirm("Delete this record?")) {
      await fetch(`http://localhost:5000/api/earnings/${id}`, {
        method: "DELETE"
      });
      fetchSubmissions();
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Submit Earnings</h2>
      <p>Logged in as: <strong>{user?.email}</strong></p>

      <form onSubmit={handleSubmit} style={{ marginBottom: "30px" }}>
        <input
          type="number"
          placeholder="Enter earnings"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <button type="submit" style={{ 
          marginLeft: "10px", 
          padding: "8px 20px", 
          backgroundColor: "#2563eb", 
          color: "white", 
          border: "none", 
          borderRadius: "4px",
          cursor: "pointer" 
        }}>
          Submit
        </button>
      </form>

      <hr />

      <h3>Your Submission History</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "2px solid #333" }}>
            <th style={{ padding: "10px" }}>Email</th>
            <th style={{ padding: "10px" }}>Amount</th>
            <th style={{ padding: "10px" }}>Date</th>
            <th style={{ padding: "10px" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {submissions.length > 0 ? (
            submissions.map((item) => (
              <tr key={item._id} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "10px" }}>{item.employeeEmail}</td>
                <td style={{ padding: "10px" }}>₱{item.amount.toLocaleString()}</td>
                <td style={{ padding: "10px" }}>
                   {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString()}
                </td>
                <td style={{ padding: "10px" }}>
                  <button onClick={() => deleteRecord(item._id)} style={{ color: "red" }}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ padding: "20px", textAlign: "center" }}>No submissions found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ReportsPage;