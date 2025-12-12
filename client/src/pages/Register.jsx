import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";

export default function Register() {
  const nav = useNavigate();
  const [role, setRole] = useState("client");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    category: "",
    shortIntro: "",
  });

  const [files, setFiles] = useState({
    profilePic: null,
    cnicPic: null,
    introVideo: null,
  });

  const [loading, setLoading] = useState(false);

  function vEmail(x){ return /^\S+@\S+\.\S+$/.test(x); }

  async function submit(e) {
    e.preventDefault();

    if (!form.name.trim()) return toast.error("Name required");
    if (!form.email.trim() || !vEmail(form.email)) return toast.error("Valid email required");
    if (!form.phone.trim()) return toast.error("Phone required");

    try {
      setLoading(true);

      if (role === "client") {
        if (form.password.length < 6) return toast.error("Password min 6 chars");
        await api.post("/auth/register/client", {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password,
        });

        toast.success("Client account created!");
        nav("/dashboard");
        return;
      }

      // professional
      if (!form.category.trim()) return toast.error("Category required");
      if (!files.profilePic) return toast.error("Profile picture required");
      if (!files.cnicPic) return toast.error("CNIC picture required");
      

      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("email", form.email.trim());
      fd.append("phone", form.phone.trim());
      fd.append("password", form.password);
        fd.append("feeScreenshot", files.feeScreenshot);
      fd.append("category", form.category.trim());
      fd.append("profilePic", files.profilePic);
      fd.append("cnicPic", files.cnicPic);
      

      const res = await api.post("/auth/register/professional", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(res.data.message || "Submitted for approval");
      nav("/login"); // pro login blocked until approved
    } catch (err) {
      toast.error(err?.response?.data?.message || "Register failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <form onSubmit={submit} className="bg-white w-full max-w-xl p-6 rounded-xl shadow space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Register</h1>
          <p className="text-sm text-gray-500">Client can login instantly. Professionals require admin approval.</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button type="button"
            onClick={() => setRole("client")}
            className={`p-2 rounded border ${role==="client" ? "bg-black text-white" : "bg-white"}`}>
            Client
          </button>
          <button type="button"
            onClick={() => setRole("professional")}
            className={`p-2 rounded border ${role==="professional" ? "bg-black text-white" : "bg-white"}`}>
            Professional
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <input className="border p-2 rounded" placeholder="Full Name"
            value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
          <input className="border p-2 rounded" placeholder="Email"
            value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
          <input className="border p-2 rounded" placeholder="Phone"
            value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/>

          {role === "client" ? (
            <input type="password" className="border p-2 rounded" placeholder="Password (min 6)"
              value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
          ) : (
            <input className="border p-2 rounded" placeholder="Category (Electrician/Plumber)"
              value={form.category} onChange={e=>setForm({...form,category:e.target.value})}/>
          )}
        </div>

        {role === "professional" && (
  <div className="space-y-3 border rounded p-3">
    <textarea className="border p-2 rounded w-full" rows={3}
      placeholder="Short intro (1-2 lines)"
      value={form.shortIntro}
      onChange={e=>setForm({...form,shortIntro:e.target.value})}
    />

    <input type="password" className="border p-2 rounded w-full"
      placeholder="Password (min 6 chars)"
      value={form.password}
      onChange={e=>setForm({...form,password:e.target.value})}
    />

    <div className="grid md:grid-cols-3 gap-3 text-sm">
      <label className="space-y-1">
        <div className="font-semibold">Profile Pic</div>
        <input type="file" accept="image/*"
          onChange={(e)=>setFiles({...files, profilePic: e.target.files?.[0] || null})}/>
      </label>

      <label className="space-y-1">
        <div className="font-semibold">CNIC Pic</div>
        <input type="file" accept="image/*"
          onChange={(e)=>setFiles({...files, cnicPic: e.target.files?.[0] || null})}/>
      </label>

      <label className="space-y-1">
        <div className="font-semibold">Fee Screenshot</div>
        <input type="file" accept="image/*"
          onChange={(e)=>setFiles({...files, feeScreenshot: e.target.files?.[0] || null})}/>
      </label>
    </div>

    <div className="text-xs text-gray-500">
      Note: Approval se pehle login nahi hoga.
    </div>
  </div>
)}


        <button disabled={loading}
          className="w-full bg-black text-white p-2 rounded disabled:opacity-60">
          {loading ? "Submitting..." : (role==="client" ? "Create & Login" : "Submit for Approval")}
        </button>

        <p className="text-sm text-gray-600">
          Already have account? <Link to="/login" className="underline font-semibold">Login</Link>
        </p>
      </form>
    </div>
  );
}
