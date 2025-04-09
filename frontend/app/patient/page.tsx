"use client";

import { useEffect, useState } from "react";

export default function PatientPage() {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    blood_sugar: "",
    meal_info: "",
    medication_dose: ""
  });

  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;


  const fetchData = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/glucose-data`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to load glucose data");

      const result = await res.json();
      setData(result);
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
      fetchData(); // reload data
    } else {
      alert("Failed to submit entry.");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-center">Patient Glucose Data</h1>

      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded">
        <div className="grid gap-2">
          <label className="font-semibold">Blood Sugar (mg/dL)</label>
          <input
            type="number"
            name="blood_sugar"
            value={form.blood_sugar}
            onChange={handleChange}
            required
            className="border p-2 rounded"
          />
        </div>
        <div className="grid gap-2">
          <label className="font-semibold">Meal Info</label>
          <select
            name="meal_info"
            value={form.meal_info}
            onChange={handleChange}
            required
            className="border p-2 rounded"
          >
            <option value="">Select</option>
            <option value="Breakfast">Breakfast</option>
            <option value="Lunch">Lunch</option>
            <option value="Dinner">Dinner</option>
          </select>
        </div>
        <div className="grid gap-2">
          <label className="font-semibold">Medication Dose</label>
          <input
            type="number"
            step="0.1"
            name="medication_dose"
            value={form.medication_dose}
            onChange={handleChange}
            required
            className="border p-2 rounded"
          />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Submit Today’s Data
        </button>
      </form>

      <div className="pt-6">
        <h2 className="text-lg font-semibold">Recent Glucose Readings</h2>
        {data.length === 0 ? (
          <p className="text-gray-500">No data available.</p>
        ) : (
          <ul className="space-y-2">
            {data.map((item, index) => (
              <li key={index} className="border rounded p-2 shadow-sm">
                <div><strong>Date:</strong> {new Date(item.timestamp).toLocaleString()}</div>
                <div><strong>Blood Sugar:</strong> {item.blood_sugar} mg/dL</div>
                <div><strong>Meal:</strong> {item.meal}</div>
                <div><strong>Dose:</strong> {item.dose} units</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
