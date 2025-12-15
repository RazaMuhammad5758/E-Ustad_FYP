import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // ✅ FIX

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
    <div className="relative min-h-screen flex items-center justify-center px-4">
      {/* background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50 via-sky-50 to-slate-100" />
        <div className="absolute -top-32 right-[-120px] h-[420px] w-[420px] rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute -bottom-40 left-[-140px] h-[520px] w-[520px] rounded-full bg-sky-200/40 blur-3xl" />
      </div>

      <form
        onSubmit={submit}
        className="w-full max-w-sm space-y-5 rounded-3xl border border-white/60 bg-white/80 p-6 shadow-sm backdrop-blur-[2px]"
      >
        {/* header */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Welcome back
          </h2>
          <p className="text-sm text-slate-600">
            Login to continue using e-Ustad
          </p>
        </div>

        {/* email */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-600">
            Email address
          </label>
          <input
            type="email"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        {/* password */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-600">
            Password
          </label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"} // ✅ FIX
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 pr-10 text-sm outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />

            {/* 👁 show / hide button (ALWAYS visible) */}
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-2 flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {/* submit */}
        <button
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-xl
          bg-gradient-to-r from-indigo-600 to-indigo-700
          px-4 py-2.5 text-sm font-semibold text-white
          transition-all duration-300
          hover:from-indigo-700 hover:to-indigo-800
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
          disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* footer */}
        <p className="text-center text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-indigo-700 hover:underline"
          >
            Register here
          </Link>
        </p>
      </form>
    </div>
  );
}
