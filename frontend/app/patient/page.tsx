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

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token")
      : null;

  const fetchData = async () => {
    if (!token) {
      setError("You must be logged in to view glucose data.");
      return;
    }

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

    if (!token) {
      alert("Not logged in.");
      return;
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/submit_today/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    });

    if (res.ok) {
      setForm({ blood_sugar: "", meal_info: "", medication_dose: "" });
      fetchData(); // Reload the updated data
    } else {
      alert("Failed to submit new glucose reading.");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-center">Patient Glucose Data</h1>

      {/* Submit Today's Data Form */}
      <form onSubmit={handleSubmit} className="border p-4 rounded space-y-4">
        <div>
          <label className="block font-medium">Blood Sugar (mg/dL)</label>
          <input
            name="blood_sugar"
            type="number"
            value={form.blood_sugar}
            onChange={handleChange}
            className="w-full border p-2 rounded mt-1"
            required
          />
        </div>
        <div>
          <label className="block font-medium">Meal Info</label>
          <select
            name="meal_info"
            value={form.meal_info}
            onChange={handleChange}
            className="w-full border p-2 rounded mt-1"
            required
          >
            <option value="">Select</option>
            <option value="Breakfast">Breakfast</option>
            <option value="Lunch">Lunch</option>
            <option value="Dinner">Dinner</option>
          </select>
        </div>
        <div>
          <label className="block font-medium">Medication Dose (units)</label>
          <input
            name="medication_dose"
            type="number"
            step="0.1"
            value={form.medication_dose}
            onChange={handleChange}
            className="w-full border p-2 rounded mt-1"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit Today’s Data
        </button>
      </form>

      {/* Glucose Readings Display */}
      <div className="pt-6">
        <h2 className="text-lg font-semibold">Recent Glucose Readings</h2>
        {data.length === 0 ? (
          <p className="text-gray-500">No data available.</p>
        ) : (
          <ul className="space-y-2 mt-2">
            {data.map((item, index) => (
              <li key={index} className="border p-3 rounded shadow-sm">
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
