import React, { useEffect, useState } from "react";

function TotalEarningsCard() {

  const [total, setTotal] = useState(0);

  const fetchTotal = async () => {
    try {

      const res = await fetch("http://localhost:5000/api/earnings");
      const data = await res.json();

      const totalSum = data.reduce((sum, item) => sum + item.amount, 0);

      setTotal(totalSum);

    } catch (err) {
      console.error("Total earnings fetch error:", err);
    }
  };

  useEffect(() => {
    fetchTotal();
  }, []);

  return (
    <div style={{ flex: 1, background: "#1cc88a", color: "#fff", padding: "25px", borderRadius: "10px" }}>
      <div style={{ fontSize: "12px", fontWeight: "bold" }}>TOTAL EARNINGS</div>
      <div style={{ fontSize: "28px", fontWeight: "bold" }}>
        ${total.toLocaleString()}
      </div>
    </div>
  );
}

export default TotalEarningsCard;