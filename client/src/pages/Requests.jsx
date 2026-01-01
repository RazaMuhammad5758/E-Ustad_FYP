import { useEffect, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const BASE = "http://localhost:5000";

function badge(status) {
  const base = "text-xs px-2 py-1 rounded font-semibold";
  if (status === "accepted") return `${base} bg-green-100 text-green-700`;
  if (status === "rejected") return `${base} bg-red-100 text-red-700`;
  return `${base} bg-yellow-100 text-yellow-700`;
}

function taskBadge(taskStatus) {
  const base = "text-xs px-2 py-1 rounded font-semibold";
  if (taskStatus === "completed") return `${base} bg-emerald-100 text-emerald-700`;
  if (taskStatus === "pending") return `${base} bg-indigo-100 text-indigo-700`;
  return `${base} bg-gray-100 text-gray-700`;
}

function toWhatsApp(phone) {
  if (!phone) return "";
  const digits = String(phone).replace(/[^\d]/g, "");
  if (digits.startsWith("0")) return "92" + digits.slice(1);
  if (digits.startsWith("92")) return digits;
  return digits;
}

function starsText(avg = 0) {
  const a = Number(avg || 0);
  return `${a.toFixed(1)}★`;
}

function Stars({ value, onChange, disabled = false }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          onClick={() => onChange(n)}
          className={[
            "text-lg leading-none",
            disabled ? "cursor-not-allowed opacity-70" : "hover:scale-110 transition",
            n <= value ? "text-amber-500" : "text-gray-300",
          ].join(" ")}
          aria-label={`Rate ${n}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function Requests() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ rating local state per booking
  const [rateVal, setRateVal] = useState({});
  const [rateLoading, setRateLoading] = useState({});

  async function load() {
    try {
      setLoading(true);
      const res = await api.get("/bookings/professional");
      setItems(res.data.bookings || []);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  }

  async function update(id, status) {
    try {
      await api.post(`/bookings/${id}/status`, { status });
      toast.success(`Request ${status}`);
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Action failed");
    }
  }

  async function markCompleted(id) {
    const ok = window.confirm("Mark this task as COMPLETED?");
    if (!ok) return;

    try {
      await api.post(`/bookings/${id}/task-complete`);
      toast.success("Task marked completed");
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed");
    }
  }

  // ✅ NEW: Professional rates client
  async function submitRating(bookingId) {
    const rating = rateVal[bookingId];
    if (!rating) return toast.error("Select stars first");

    try {
      setRateLoading((p) => ({ ...p, [bookingId]: true }));
      await api.post(`/bookings/${bookingId}/rate/professional`, { rating });
      toast.success("Rating submitted");
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to submit rating");
    } finally {
      setRateLoading((p) => ({ ...p, [bookingId]: false }));
    }
  }

  useEffect(() => {
    load();
  }, []);
// function starsText(avg = 0) {
//   const a = Number(avg || 0);
//   return `${a.toFixed(1)}★`;
// }
const [previewImg, setPreviewImg] = useState(null);
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Booking Requests</h1>
          <button
            onClick={load}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <span className="text-base">↻</span> Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : (
          <>
            {items.map((b) => {
              const phone = b.status === "accepted" ? b.clientPhone : null;
              const wa = toWhatsApp(phone);

              const dp = b.clientId?.profilePic
                ? `${BASE}/uploads/${b.clientId.profilePic}`
                : "/dp.jpg";

              // ✅ safe default: accepted -> pending if missing
              const safeTaskStatus =
                b.status === "accepted"
                  ? b.taskStatus || "pending"
                  : b.taskStatus || "none";

              const canRate =
                b.status === "accepted" &&
                safeTaskStatus === "completed" &&
                b.professionalRating == null;

              return (
                <div key={b._id} className="bg-white border rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={dp}
                        alt="dp"
                        className="w-10 h-10 rounded-full object-cover border"
                        onError={(e) => {
                          e.currentTarget.src = "/dp.jpg";
                        }}
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
  <div className="font-bold">{b.clientId?.name || "Client"}</div>

  <span className="text-xs px-2 py-1 rounded font-semibold bg-amber-50 text-amber-700">
    {starsText(b.clientId?.ratingAvg || 0)} ({Number(b.clientId?.ratingCount || 0)})
  </span>
</div>

                        <div className="text-xs text-gray-500">
                          Sent: {new Date(b.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={badge(b.status)}>
                        {String(b.status || "").toUpperCase()}
                      </span>

                      {b.status === "accepted" && (
                        <span className={taskBadge(safeTaskStatus)}>
                          {safeTaskStatus === "completed"
                            ? "TASK COMPLETED"
                            : "TASK PENDING"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    Phone:{" "}
                    {b.status === "accepted" ? (
                      <span className="font-semibold">{phone || "-"}</span>
                    ) : (
                      <span className="italic">Hidden until accepted</span>
                    )}
                  </div>

                  {b.status === "accepted" && phone && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a
                        href={`tel:${phone}`}
                        className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                      >
                        📞 Call
                      </a>

                      <a
                        href={`https://wa.me/${wa}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-2xl border border-green-200 bg-green-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      >
                        💬 WhatsApp
                      </a>
                    </div>
                  )}

                  <div className="text-sm">
                    <b>Client Message:</b> {b.message || "-"}
                  </div>
                  

                  {b.attachment && (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="text-sm font-semibold text-slate-900">
                          Uploaded Picture
                        </div>

                        <button
  type="button"
  onClick={() => setPreviewImg(`${BASE}/uploads/${b.attachment}`)}
  className="ml-auto rounded-2xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
>
  View full image
</button>

                      </div>
                      {previewImg && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
    onClick={() => setPreviewImg(null)}
  >
    <div
      className="relative max-w-5xl w-full rounded-2xl bg-white shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      {/* close button */}
      <button
        onClick={() => setPreviewImg(null)}
        className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1 text-sm font-semibold text-white hover:bg-black"
      >
        ✕
      </button>

      <img
        src={previewImg}
        alt="Full Preview"
        className="max-h-[85vh] w-full object-contain rounded-2xl"
      />
    </div>
  </div>
)}


                      <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                        <img
                          src={`${BASE}/uploads/${b.attachment}`}
                          alt="attachment"
                          className="w-full max-h-72 object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {b.status === "pending" && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => update(b._id, "accepted")}
                        className="bg-green-600 text-white px-3 py-2 rounded text-sm"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => update(b._id, "rejected")}
                        className="bg-red-600 text-white px-3 py-2 rounded text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {b.status === "accepted" && safeTaskStatus !== "completed" && (
                    <div className="pt-2">
                      <button
                        onClick={() => markCompleted(b._id)}
                        className="bg-black text-white px-3 py-2 rounded text-sm"
                      >
                        Mark Task Completed
                      </button>
                    </div>
                  )}

                  {/* ✅ NEW: rating section for professional (only after completed) */}
                  {b.status === "accepted" && safeTaskStatus === "completed" && (
                    <div className="pt-3">
                      <div className="rounded-xl border bg-gray-50 p-3">
                        <div className="text-sm font-semibold">
                          Rate this Client
                        </div>

                        {b.professionalRating != null ? (
                          <div className="mt-2 text-sm text-gray-700">
                            You rated:{" "}
                            <span className="font-semibold">
                              {b.professionalRating}★
                            </span>
                          </div>
                        ) : (
                          <>
                            <div className="mt-2 flex items-center justify-between gap-3 flex-wrap">
                              <Stars
                                value={rateVal[b._id] || 0}
                                onChange={(v) =>
                                  setRateVal((p) => ({ ...p, [b._id]: v }))
                                }
                              />
                              <button
                                onClick={() => submitRating(b._id)}
                                disabled={!canRate || rateLoading[b._id]}
                                className="bg-black text-white px-3 py-2 rounded text-sm disabled:opacity-60"
                              >
                                {rateLoading[b._id]
                                  ? "Submitting..."
                                  : "Submit Rating"}
                              </button>
                            </div>

                            {!canRate && (
                              <div className="mt-2 text-xs text-gray-500">
                                Rating available only after task completion.
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {items.length === 0 && <div className="text-gray-500">No requests yet</div>}
          </>
        )}
      </div>
    </div>
  );
}
