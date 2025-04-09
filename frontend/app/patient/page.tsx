"use client";

import { useEffect, useState } from "react";

export default function PatientDashboard() {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("No token found.");
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/glucose-data`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setData(data);
        } else {
          setError("Unexpected data format");
        }
      })
      .catch((err) => {
        setError("Failed to fetch data");
        console.error(err);
      });
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h1>Patient Glucose Data</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {Array.isArray(data) && data.length > 0 ? (
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
