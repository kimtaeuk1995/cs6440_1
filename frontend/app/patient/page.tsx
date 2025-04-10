"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function PatientPage() {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState("");

  const fetchData = async () => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;

    if (!token) {
      setError("You must be logged in to view glucose data.");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/glucose-data`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to load glucose data");

      const result = await res.json();

      // Sort data by timestamp ascending
      const sorted = [...result].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      setData(sorted);
    } catch (err) {
      setError("Failed to load data.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-center">Patient Glucose Data</h1>

      {error && <p className="text-red-500">{error}</p>}

      {/* 📊 Line Chart for Glucose Levels */}
      <div className="pt-4">
        <h2 className="text-lg font-semibold mb-2">Glucose Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(val) => new Date(val).toLocaleDateString()}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(val) => new Date(val).toLocaleString()}
              formatter={(value: number) => [`${value} mg/dL`, "Blood Sugar"]}
            />
            <Line
              type="monotone"
              dataKey="blood_sugar"
              stroke="#3182ce"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 🔁 Data List for reference */}
      <div className="pt-4">
        <h2 className="text-lg font-semibold">Recent Glucose Readings</h2>
        {data.length === 0 ? (
          <p className="text-gray-500">No data available.</p>
        ) : (
          <ul className="space-y-2 mt-2">
            {data.map((item, index) => (
              <li key={index} className="border p-2 rounded shadow-sm">
                <div>
                  <strong>Date:</strong>{" "}
                  {new Date(item.timestamp).toLocaleString()}
                </div>
                <div>
                  <strong>Blood Sugar:</strong> {item.blood_sugar} mg/dL
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
