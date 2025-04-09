"use client";

import { useEffect, useState } from "react";

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
      setData(result);
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

      <div className="pt-6">
        <h2 className="text-lg font-semibold">Recent Glucose Readings</h2>
        {data.length === 0 ? (
          <p className="text-gray-500">No data available.</p>
        ) : (
          <ul className="space-y-2">
            {data.map((item, index) => (
              <li key={index} className="border rounded p-2 shadow-sm">
                <div>
                  <strong>Date:</strong>{" "}
                  {new Date(item.timestamp).toLocaleString()}
                </div>
                <div>
                  <strong>Blood Sugar:</strong> {item.blood_sugar} mg/dL
                </div>
                <div>
                  <strong>Meal:</strong> {item.meal_info}
                </div>
                <div>
                  <strong>Dose:</strong> {item.medication_dose} units
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
