"use client";
import { useEffect, useState } from "react";

export default function PatientPage() {
  const [token, setToken] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [form, setForm] = useState({
    blood_sugar: "",
    meal_info: "",
    medication_dose: ""
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("access_token");
      if (stored) setToken(stored);
    }
  }, []);

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/glucose-data`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        console.error("❌ Failed to fetch:", res.status);
        return setError("Failed to load data.");
      }

      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error("❌ Error fetching:", err);
      setError("Error fetching data.");
    }
  };

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
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    });

    if (res.ok) {
      setForm({ blood_sugar: "", meal_info: "", medication_dose: "" });
      fetchData();
    } else {
      const text = await res.text();
      console.error("❌ Failed to submit:", text);
      alert("Failed to submit glucose reading.");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-center">Patient Glucose Data</h1>

      {error && <p className="text-red-600">{error}</p>}

      <form onSubmit={handleSubmit} className="border p-4 rounded space-y-4">
        <div>
          <label>Blood Sugar (mg/dL)</label>
          <input
            name="blood_sugar"
            type="number"
            value={form.blood_sugar}
            onChange={handleChange}
            className="w-full border p-2 mt-1"
            required
          />
        </div>
        <div>
          <label>Meal Info</label>
          <select
            name="meal_info"
            value={form.meal_info}
            onChange={handleChange}
            className="w-full border p-2 mt-1"
            required
          >
            <option value="">Select</option>
            <option value="Breakfast">Breakfast</option>
            <option value="Lunch">Lunch</option>
            <option value="Dinner">Dinner</option>
          </select>
        </div>
        <div>
          <label>Medication Dose</label>
          <input
            name="medication_dose"
            type="number"
            step="0.1"
            value={form.medication_dose}
            onChange={handleChange}
            className="w-full border p-2 mt-1"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Submit Today's Data
        </button>
      </form>

      <div className="pt-4">
        <h2 className="text-lg font-semibold">Recent Glucose Readings</h2>
        {data.length === 0 ? (
          <p className="text-gray-500">No data available.</p>
        ) : (
          <ul className="space-y-2 mt-2">
            {data.map((item, index) => (
              <li key={index} className="border p-2 rounded shadow-sm">
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
