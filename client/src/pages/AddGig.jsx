import { useMemo, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";

export default function AddGig() {
  const nav = useNavigate();
  const [form, setForm] = useState({ title: "", description: "", price: "" });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const preview = useMemo(() => (image ? URL.createObjectURL(image) : ""), [image]);

  async function submit(e) {
    e.preventDefault();

    if (!form.title.trim()) return toast.error("Title required");

    const priceNum = Number(form.price);
    if (!Number.isFinite(priceNum) || priceNum < 0)
      return toast.error("Valid price required");

    const fd = new FormData();
    fd.append("title", form.title.trim());
    fd.append("description", form.description || "");
    fd.append("price", String(priceNum));
    if (image) fd.append("image", image);

    try {
      setLoading(true);
      await api.post("/gigs", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Gig added!");
      nav("/dashboard");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-10">
      {/* background (same family as home/login) */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50 via-sky-50 to-slate-100" />
        <div className="absolute -top-40 right-[-160px] h-[540px] w-[540px] rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute -bottom-52 left-[-200px] h-[620px] w-[620px] rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.07)_1px,transparent_0)] [background-size:26px_26px] opacity-30" />
      </div>

      <form
        onSubmit={submit}
        className="w-full max-w-xl space-y-5 rounded-3xl border border-white/60 bg-white/80 p-6 shadow-sm backdrop-blur-[2px]"
      >
        {/* top */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Add a Gig
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Create a service card for clients to book you.
            </p>
          </div>

          <Link
            to="/dashboard"
            className="rounded-xl bg-white/70 px-4 py-2 text-sm font-semibold text-indigo-700 ring-1 ring-slate-200/70 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            ← Back
          </Link>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-600">Title</label>
          <input
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
            placeholder="e.g., AC Gas Refill / Wiring Fix / Home Tutor"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-600">
            Description
          </label>
          <textarea
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
            rows={4}
            placeholder="Write what you offer, time estimate, what client should provide, etc."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        {/* Price + image */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">
              Price/hr (PKR)
            </label>
            <input
              type="number"
              min="0"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
              placeholder="e.g., 1500"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
            <p className="text-[11px] text-slate-500">
              Tip: Keep pricing clear and fair.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-600">
              Gig Image (optional)
            </div>

            <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/70 px-4 py-4 text-sm text-slate-700 transition hover:bg-white">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
              />
              {image ? "Change Image" : "Upload Image"}
            </label>

            {image && (
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/70 p-3">
                <img
                  src={preview}
                  alt="preview"
                  className="h-14 w-14 rounded-xl object-cover border border-slate-200"
                />
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-900">
                    {image.name}
                  </div>
                  <button
                    type="button"
                    onClick={() => setImage(null)}
                    className="mt-1 text-xs font-semibold text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
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
          {loading ? "Saving..." : "Save Gig"}
        </button>
      </form>
    </div>
  );
}
