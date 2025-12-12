import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  async function submit(e) {
    e.preventDefault();
    try {
      await login(form);
      toast.success("Logged in!");
      nav("/dashboard");
    } catch (e) {
      toast.error(e.message || "Invalid credentials");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={submit} className="bg-white p-6 rounded w-80 space-y-4">
        <h2 className="text-xl font-bold">Login</h2>

        <input
          className="border p-2 w-full"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          className="border p-2 w-full"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button className="bg-black text-white w-full p-2">Login</button>
      </form>
    </div>
  );
}
