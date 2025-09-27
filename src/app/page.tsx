"use client";

import { useState } from "react";

export default function LoginPage() {
  const [login, setLogin] = useState("");

  async function handleLogin() {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ login }),
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      window.location.href = "/receipts";
    } else {
      alert("Błąd logowania");
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-2xl font-bold">Logowanie</h1>
      <input
        type="text"
        placeholder="Login"
        value={login}
        onChange={(e) => setLogin(e.target.value)}
        className="border p-2"
      />
      <button onClick={handleLogin} className="bg-blue-600 text-white px-4 py-2">
        Zaloguj
      </button>
    </div>
  );
}
