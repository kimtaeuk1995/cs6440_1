"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Header from "./header";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiBaseUrl) {
      setError("API URL is not set in environment variables.");
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("access_token", data.access_token);
        router.push("/patient");
      } else {
        console.error("Login failed:", data);
        setError(data.detail || "Invalid credentials.");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError("Server error. Check backend connection.");
    }
  };

  return (
    <>
      <Header />
      <form onSubmit={handleLogin} style={{ textAlign: "center", marginTop: "2rem" }}>
        <h2>Login to your dashboard</h2>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
          style={{ display: "block", margin: "1rem auto", padding: "0.5rem" }}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          style={{ display: "block", margin: "1rem auto", padding: "0.5rem" }}
        />
        <button type="submit" style={{ padding: "0.5rem 1rem" }}>
          Login
        </button>
        {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
      </form>
    </>
  );
}
