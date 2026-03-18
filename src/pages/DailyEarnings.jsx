import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

function DailyEarnings({ data = [] }) {

  const formattedData = data.map(item => {
    const d = new Date(item.date);

    const fullDate = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });

    return {
      date: fullDate,
      amount: item.amount   // ✅ FIXED
    };
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={formattedData}>
        <CartesianGrid stroke="#eee" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="amount"
          stroke="#4e73df"
          strokeWidth={3}
          dot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default DailyEarnings;