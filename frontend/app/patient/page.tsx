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
  const [form, setForm] = useState({
    blood_sugar: "",
    meal_info: "",
    medication_dose: "",
  });

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token")
      : null;

  const fetchData = async () => {
    if (!token) return;

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

      const sorted = [...result].sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      setData(sorted);
    } catch (err) {
      setError("Failed to load data.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!token) return alert("Not logged in");

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/submit_today/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setForm({ blood_sugar: "", meal_info: "", medication_dose: "" });
      fetchData();
    } else {
      alert("Failed to submit glucose reading.");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-center">Patient Glucose Dashboard</h1>

      {/* 📝 Submit New Reading */}
      <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded shadow">
        <h2 className="text-lg font-semibold">Submit Today’s Glucose Data</h2>

        <div className="flex flex-col sm:flex-row sm:gap-4">
          <div className="flex-1">
            <label className="text-sm">Blood Sugar</label>
            <input
              type="number"
              name="blood_sugar"
              value={form.blood_sugar}
              onChange={handleChange}
              required
              className="w-full border p-1 text-sm rounded"
              placeholder="mg/dL"
            />
          </div>
          <div className="flex-1">
            <label className="text-sm">Meal</label>
            <select
              name="meal_info"
              value={form.meal_info}
              onChange={handleChange}
              required
              className="w-full border p-1 text-sm rounded"
            >
              <option value="">Select</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="text-sm">Dose</label>
            <input
              type="number"
              step="0.1"
              name="medication_dose"
              value={form.medication_dose}
              onChange={handleChange}
              required
              className="w-full border p-1 text-sm rounded"
              placeholder="units"
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
        >
          Submit
        </button>
      </form>

      {/* 📊 Glucose Trend Chart */}
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
              stroke="#4f46e5"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 📋 Recent Readings List */}
      <div>
        <h2 className="text-lg font-semibold">Recent Glucose Readings</h2>
        {data.length === 0 ? (
          <p className="text-gray-500">No data available.</p>
        ) : (
          <ul className="space-y-2 mt-2">
            {data.map((item, index) => (
              <li key={index} className="border p-2 rounded shadow-sm text-sm">
                <div><strong>Date:</strong> {new Date(item.timestamp).toLocaleString()}</div>
                <div><strong>Blood Sugar:</strong> {item.blood_sugar} mg/dL</div>
                <div><strong>Meal:</strong> {item.meal_info}</div>
                <div><strong>Dose:</strong> {item.medication_dose} units</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
