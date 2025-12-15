import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      await login(form);
      toast.success("Logged in!");
      nav("/dashboard");
    } catch (e) {
      toast.error(e.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form onSubmit={submit} className="bg-white p-6 rounded w-full max-w-sm space-y-4">
        <h2 className="text-xl font-bold">Login</h2>

        <input
          className="border p-2 w-full rounded"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          className="border p-2 w-full rounded"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button
          disabled={loading}
          className="bg-black text-white w-full p-2 rounded disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* ✅ NEW line */}
        <p className="text-sm text-gray-600 text-center">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="underline font-semibold">
            Please register
          </Link>
        </p>
      </form>
    </div>
  );
}
