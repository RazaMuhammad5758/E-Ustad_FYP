import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPass, setShowPass] = useState(false);
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
    <div className="relative min-h-screen flex items-center justify-center px-4 py-10">
      {/* background (same family as app) */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50 via-sky-50 to-slate-100" />
        <div className="absolute -top-40 right-[-170px] h-[560px] w-[560px] rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute -bottom-52 left-[-210px] h-[640px] w-[640px] rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.07)_1px,transparent_0)] [background-size:26px_26px] opacity-30" />
      </div>

      <form
        onSubmit={onSubmit}
        className="w-full max-w-md space-y-5 rounded-3xl border border-white/60 bg-white/80 p-6 shadow-sm backdrop-blur-[2px]"
      >
        {/* header */}
        <div className="space-y-1 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700">
            <span className="h-2 w-2 rounded-full bg-indigo-600" />
            Admin Portal
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Admin Login
          </h1>
          <p className="text-sm text-slate-600">
            Sign in to manage approvals, users & stats.
          </p>
        </div>

        {/* email */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-600">
            Admin Email
          </label>
          <input
            type="email"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />
        </div>

        {/* password */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-600">
              Admin Password
            </label>

            {/* always visible */}
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              className="text-xs font-semibold text-indigo-700 hover:underline"
            >
              {showPass ? "Hide" : "Show"} password
            </button>
          </div>

          <input
            type={showPass ? "text" : "password"}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
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
          {loading ? "Logging in..." : "Admin Login"}
        </button>

        {/* footer */}
        <div className="text-center text-xs text-slate-500">
          <Link to="/" className="font-semibold text-indigo-700 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </form>
    </div>
  );
}
