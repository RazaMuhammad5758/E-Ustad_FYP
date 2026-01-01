import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";

const BASE = "http://localhost:5000";
const FALLBACK_GIG = "/dp.jpg";

export default function EditGig() {
  const { id } = useParams(); // gigId
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [gig, setGig] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
  });

  const [image, setImage] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);

  const currentImageUrl = useMemo(() => {
    if (!gig?.image) return "";
    return `${BASE}/uploads/${gig.image}`;
  }, [gig]);

  const previewUrl = useMemo(() => {
    if (!image) return "";
    return URL.createObjectURL(image);
  }, [image]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function loadGig() {
    try {
      setLoading(true);

      // fetch my gigs and find by id (no new endpoint needed)
      const res = await api.get("/gigs/me");
      const list = res.data?.gigs || [];
      const found = list.find((x) => String(x._id) === String(id));

      if (!found) {
        toast.error("Gig not found");
        nav("/dashboard");
        return;
      }

      setGig(found);
      setForm({
        title: found.title || "",
        description: found.description || "",
        price: String(found.price ?? ""),
      });
      setRemoveImage(false);
      setImage(null);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load gig");
      nav("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  async function save(e) {
    e.preventDefault();

    if (!form.title.trim()) return toast.error("Title required");
    const priceNum = Number(form.price);
    if (!Number.isFinite(priceNum) || priceNum < 0)
      return toast.error("Valid price required");

    try {
      setSaving(true);

      const fd = new FormData();
      fd.append("title", form.title.trim());
      fd.append("description", form.description || "");
      fd.append("price", String(priceNum));

      // if user checked removeImage AND did not upload new one
      if (removeImage && !image) {
        fd.append("removeImage", "1");
      }

      if (image) fd.append("image", image);

      await api.put(`/gigs/${id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Gig updated");
      nav("/dashboard");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  }

  async function deleteGig() {
    const ok = window.confirm("Delete this gig permanently?");
    if (!ok) return;

    try {
      await api.delete(`/gigs/${id}`);
      toast.success("Gig deleted");
      nav("/dashboard");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Delete failed");
    }
  }

  useEffect(() => {
    loadGig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!gig) return <div className="p-6">Not found</div>;

  return (
    <div className="min-h-screen bg-transparent">
      {/* background (same family as dashboard) */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50 via-sky-50 to-slate-100" />
        <div className="absolute -top-40 right-[-170px] h-[520px] w-[520px] rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute -bottom-52 left-[-210px] h-[600px] w-[600px] rounded-full bg-sky-200/40 blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* top bar */}
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Edit Gig
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Update title, description, price and image.
            </p>
          </div>

          <Link
            to="/dashboard"
            className="rounded-xl bg-white/70 px-4 py-2 text-sm font-semibold text-indigo-700 ring-1 ring-slate-200/70 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* card */}
        <form
          onSubmit={save}
          className="grid gap-5 rounded-3xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur-[2px] md:grid-cols-2"
        >
          {/* left: form */}
          <div className="space-y-4">
            <div className="grid gap-3">
              {/* title */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">
                  Title
                </label>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
                  placeholder="e.g. AC Repair / Plumbing / Tutor"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              {/* price */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">
                  Price (Rs.)
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
                  placeholder="500"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>

              {/* description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">
                  Description
                </label>
                <textarea
                  className="min-h-[140px] w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
                  rows={6}
                  placeholder="Write a short description of what you offer..."
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
            </div>

            {/* image controls */}
            <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    Gig Image
                  </div>
                  <div className="text-xs text-slate-500">
                    Optional — upload a clear image
                  </div>
                </div>

                {gig.image && (
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={removeImage}
                      onChange={(e) => {
                        setRemoveImage(e.target.checked);
                        if (e.target.checked) setImage(null);
                      }}
                    />
                    Remove
                  </label>
                )}
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
              />

              {image && (
                <div className="text-xs text-slate-500">
                  Selected: <span className="font-semibold">{image.name}</span>
                </div>
              )}
            </div>

            {/* actions */}
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                disabled={saving}
                className="inline-flex items-center justify-center rounded-xl
                  bg-gradient-to-r from-indigo-600 to-indigo-700
                  px-4 py-2.5 text-sm font-semibold text-white
                  transition-all duration-300
                  hover:from-indigo-700 hover:to-indigo-800
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                  disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={deleteGig}
                className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Delete Gig
              </button>
            </div>
          </div>

          {/* right: preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">Preview</div>
              <div className="text-xs text-slate-500">
                This is how it’ll look on dashboard
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              {/* image preview */}
              <div className="mb-4">
                {!removeImage && (previewUrl || currentImageUrl) ? (
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                    <img
                      src={previewUrl || currentImageUrl}
                      alt="gig"
                      className="h-44 w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_GIG;
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex h-44 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
                    No image
                  </div>
                )}
              </div>

              {/* text preview */}
              <div className="space-y-2">
                <div className="text-lg font-extrabold text-slate-900 line-clamp-1">
                  {form.title?.trim() || "Gig title"}
                </div>

                <div className="inline-flex w-fit items-center rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">
                  Rs. {form.price?.trim() || "0"}
                </div>

                <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                  {form.description?.trim()
                    ? form.description
                    : "Add a short description so clients understand what you offer."}
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-500">
              Tip: Price clear rakho aur description 1-2 lines me strong likho.
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
