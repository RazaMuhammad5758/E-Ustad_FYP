import { useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function AddGig() {
  const nav = useNavigate();
  const [form, setForm] = useState({ title: "", description: "", price: "" });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Title required");
    if (form.price === "" || Number(form.price) < 0) return toast.error("Valid price required");

    const fd = new FormData();
    fd.append("title", form.title.trim());
    fd.append("description", form.description);
    fd.append("price", form.price);
    if (image) fd.append("image", image);

    try {
      setLoading(true);
      await api.post("/gigs", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Gig added!");
      nav("/dashboard");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center p-6">
      <form onSubmit={submit} className="bg-white border rounded-xl p-5 w-full max-w-lg space-y-3">
        <h1 className="text-2xl font-bold">Add Gig</h1>

        <input className="border p-2 rounded w-full" placeholder="Title"
          value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} />

        <textarea className="border p-2 rounded w-full" rows={4} placeholder="Description"
          value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} />

        <input className="border p-2 rounded w-full" placeholder="Price"
          value={form.price} onChange={(e)=>setForm({...form,price:e.target.value})} />

        <input type="file" accept="image/*" onChange={(e)=>setImage(e.target.files?.[0] || null)} />

        <button disabled={loading} className="bg-black text-white w-full p-2 rounded disabled:opacity-60">
          {loading ? "Saving..." : "Save Gig"}
        </button>
      </form>
    </div>
  );
}
