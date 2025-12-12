import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";

export default function SetPassword() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const token = params.get("token") || "";
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e){
    e.preventDefault();
    if (!token) return toast.error("Invalid link");
    if (pw.length < 6) return toast.error("Password min 6 chars");

    try{
      setLoading(true);
      await api.post("/auth/set-password", { token, password: pw });
      toast.success("Password set! You can login now.");
      nav("/login");
    }catch(err){
      toast.error(err?.response?.data?.message || "Failed");
    }finally{
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form onSubmit={submit} className="bg-white p-6 rounded-xl shadow w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Set Password</h1>
        <input type="password" className="border p-2 rounded w-full" placeholder="New password"
          value={pw} onChange={(e)=>setPw(e.target.value)} />
        <button disabled={loading} className="w-full bg-black text-white p-2 rounded disabled:opacity-60">
          {loading ? "Saving..." : "Set Password"}
        </button>
      </form>
    </div>
  );
}
