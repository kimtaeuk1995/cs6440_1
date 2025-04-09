"use client";

import { useEffect, useState } from "react";

export default function PatientPage() {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("Unauthorized");
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/get_data/testuser`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then(setData)
      .catch(() => setError("Failed to fetch data"));
  }, []);

  return (
    <div>
      <h1>Patient Glucose Data</h1>
      {error && <p>{error}</p>}
      <ul>
        {Array.isArray(data) ? (
          data.map((item: any, index) => (
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
  