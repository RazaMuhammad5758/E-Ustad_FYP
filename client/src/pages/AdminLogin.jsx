import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post("/admin/login", { email, password }); // ✅ sets admin_token cookie
      toast.success("Admin logged in ✅");
      nav("/admin");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Admin login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <form
        onSubmit={onSubmit}
        className="bg-white border rounded-xl p-6 w-full max-w-md space-y-3"
      >
        <h1 className="text-2xl font-bold">Admin Login</h1>

        <input
          className="border p-2 rounded w-full"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="border p-2 rounded w-full"
          placeholder="Admin Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          disabled={loading}
          className="bg-black text-white rounded p-2 w-full disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Admin Login"}
        </button>
      </form>
    </div>
  );
}
