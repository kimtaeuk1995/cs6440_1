"use client";

import { useEffect, useState } from "react";

export default function PatientPage() {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("No access token found.");
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/glucose-data`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((json) => {
        if (Array.isArray(json)) {
          setData(json);
        } else {
          setError("Unexpected response format.");
        }
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError("Failed to load glucose data.");
      });
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Patient Glucose Data</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {Array.isArray(data) ? (
          data.map((item: any, index: number) => (
            <li key={index}>
              {item.timestamp}: {item.blood_sugar} mg/dL
            </li>
          ))
        ) : (
          <p>No data available.</p>
        )}
      </ul>
    </div>
  );
}
