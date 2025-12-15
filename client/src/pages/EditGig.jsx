import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";

const BASE = "http://localhost:5000";

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

  async function loadGig() {
    try {
      setLoading(true);

      // ✅ no new backend endpoint needed:
      // fetch my gigs and find by id
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
    if (!Number.isFinite(priceNum) || priceNum < 0) return toast.error("Valid price required");

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
    <div className="min-h-screen bg-gray-100 flex justify-center p-6">
      <form onSubmit={save} className="bg-white border rounded-xl p-5 w-full max-w-lg space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Edit Gig</h1>
          <Link to="/dashboard" className="text-sm underline">Back</Link>
        </div>

        <input
          className="border p-2 rounded w-full"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <textarea
          className="border p-2 rounded w-full"
          rows={4}
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <input
          type="number"
          min="0"
          className="border p-2 rounded w-full"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />

        {/* Current image */}
        {gig.image && !removeImage && !image && (
          <img
            src={currentImageUrl}
            className="w-full h-44 object-cover rounded border"
            alt="gig"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        )}

        <div className="text-sm space-y-2">
          <div className="font-semibold">Update Image (optional)</div>
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />

          {gig.image && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={removeImage}
                onChange={(e) => {
                  setRemoveImage(e.target.checked);
                  if (e.target.checked) setImage(null);
                }}
              />
              Remove current image
            </label>
          )}
        </div>

        <button disabled={saving} className="bg-black text-white w-full p-2 rounded disabled:opacity-60">
          {saving ? "Saving..." : "Save Changes"}
        </button>

        <button
          type="button"
          onClick={deleteGig}
          className="w-full border border-red-600 text-red-600 p-2 rounded"
        >
          Delete Gig
        </button>
      </form>
    </div>
  );
}
