import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";

function starsText(avg = 0) {
  const a = Number(avg || 0);
  return `${a.toFixed(1)}★`;
}

export default function Book() {
  const { id } = useParams();
  const nav = useNavigate();

  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ NEW: professional info for rating display
  const [pro, setPro] = useState(null);
  const [loadingPro, setLoadingPro] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoadingPro(true);
        const res = await api.get(`/professionals/${id}`);
        setPro(res.data?.user || null);
      } catch (e) {
        toast.error("Failed to load professional info");
      } finally {
        setLoadingPro(false);
      }
    })();
  }, [id]);

  async function submit(e) {
    e.preventDefault();

    if (!message.trim() && !attachment) {
      return toast.error("Please write description or upload a picture");
    }

    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("professionalId", id);
      fd.append("message", message || "");
      if (attachment) fd.append("attachment", attachment);

      await api.post("/bookings", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Booking request sent!");
      nav("/my-bookings");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to send booking");
    } finally {
      setLoading(false);
    }
  }

  const avg = Number(pro?.ratingAvg || 0);
  const count = Number(pro?.ratingCount || 0);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Top */}
        <div className="mb-4 flex items-center justify-between">
          <Link
            to="/professionals"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
          >
            ← Back
          </Link>
        </div>

        {/* Card */}
        <form
          onSubmit={submit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
        >
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
              Book Professional
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Describe your problem and send a booking request.
            </p>
          </div>

          {/* ✅ PROFESSIONAL RATING INFO */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            {loadingPro ? (
              <div className="text-sm text-slate-500">Loading professional info…</div>
            ) : pro ? (
              <>
                <div className="text-sm font-semibold text-slate-900">
                  {pro.name}
                </div>

                <div className="mt-1 flex items-center gap-2 text-sm">
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                    {starsText(avg)} ({count})
                  </span>

                  {count === 0 && (
                    <span className="text-xs text-slate-500">
                      No ratings yet
                    </span>
                  )}
                </div>
              </>
            ) : (
              <div className="text-sm text-red-500">
                Professional not found
              </div>
            )}
          </div>

          {/* Message */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">
              Problem Description
            </label>
            <textarea
              rows={4}
              placeholder="Describe your problem..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          {/* File upload */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">
              Upload Problem Image{" "}
              <span className="text-slate-400">(optional)</span>
            </label>

            <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                className="text-sm text-slate-600"
              />
            </div>

            {attachment && (
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                📎 {attachment.name}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Booking Request"}
          </button>

          <p className="text-xs text-slate-500 text-center">
            Your contact details will be shared only after acceptance.
          </p>
        </form>
      </div>
    </div>
  );
}
