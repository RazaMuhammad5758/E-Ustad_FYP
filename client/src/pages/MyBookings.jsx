// client/src/pages/MyBookings.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";

const BASE = "http://localhost:5000";

function badge(status) {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide";

  if (status === "accepted") return `${base} bg-emerald-100 text-emerald-700`;
  if (status === "rejected") return `${base} bg-red-100 text-red-700`;
  return `${base} bg-amber-100 text-amber-700`;
}

function taskBadge(taskStatus) {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide";

  if (taskStatus === "completed")
    return `${base} bg-emerald-100 text-emerald-700`;
  if (taskStatus === "pending") return `${base} bg-indigo-100 text-indigo-700`;
  return `${base} bg-slate-100 text-slate-700`;
}

function toWhatsApp(phone) {
  if (!phone) return "";
  const digits = String(phone).replace(/[^\d]/g, "");
  if (digits.startsWith("0")) return "92" + digits.slice(1);
  if (digits.startsWith("92")) return digits;
  return digits;
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
            "text-lg leading-none select-none",
            disabled
              ? "cursor-not-allowed opacity-60"
              : "hover:scale-110 transition",
            n <= value ? "text-amber-500" : "text-slate-300",
          ].join(" ")}
          aria-label={`Rate ${n}`}
          title={`Rate ${n}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function SectionTitle({ title, subtitle }) {
  return (
    <div className="space-y-1">
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
        {title}
      </h1>
      <p className="text-sm text-slate-600">{subtitle}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-xl">
        📭
      </div>
      <div className="text-base font-semibold text-slate-900">
        No booking requests yet
      </div>
      <div className="mt-1 text-sm text-slate-600">
        Your requests will appear here once you book a professional.
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
      <div className="mx-auto mb-3 h-10 w-10 animate-pulse rounded-2xl bg-slate-200/70" />
      Loading bookings…
    </div>
  );
}

export default function MyBookings() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ rating local state per booking
  const [rateVal, setRateVal] = useState({});
  const [rateLoading, setRateLoading] = useState({});

  async function load() {
    try {
      setLoading(true);
      const res = await api.get("/bookings/client");
      setItems(res.data.bookings || []);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }

  async function submitRating(bookingId) {
    const rating = rateVal[bookingId];
    if (!rating) return toast.error("Select stars first");

    try {
      setRateLoading((p) => ({ ...p, [bookingId]: true }));
      await api.post(`/bookings/${bookingId}/rate/client`, { rating });
      toast.success("Rating submitted");
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to submit rating");
    } finally {
      setRateLoading((p) => ({ ...p, [bookingId]: false }));
    }
  }
const [previewImg, setPreviewImg] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const sortedItems = useMemo(() => items, [items]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* soft background accents */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 via-sky-50/30 to-slate-100/60" />
        <div className="absolute -top-40 right-[-180px] h-[520px] w-[520px] rounded-full bg-indigo-200/30 blur-3xl" />
        <div className="absolute -bottom-56 left-[-220px] h-[620px] w-[620px] rounded-full bg-sky-200/30 blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <SectionTitle
            title="My Booking Requests"
            subtitle="Track the status of your service requests."
          />

          <button
            onClick={load}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <span className="text-base">↻</span> Refresh
          </button>
        </div>

        {loading ? (
          <LoadingState />
        ) : sortedItems.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4">
            {sortedItems.map((b) => {
              // ✅ safer: try multiple possible fields
              const phone =
                b.status === "accepted"
                  ? b.professionalPhone || b.professionalId?.phone || null
                  : null;

              const wa = toWhatsApp(phone);

              // ✅ safe default: accepted -> pending if missing
              const safeTaskStatus =
                b.status === "accepted"
                  ? b.taskStatus || "pending"
                  : b.taskStatus || "none";

              const canRate =
                b.status === "accepted" &&
                safeTaskStatus === "completed" &&
                b.clientRating == null;

              return (
                <div
                  key={b._id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm transition hover:shadow-md"
                >
                  {/* header */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 line-clamp-1">
                          {b.professionalId?.name || "Professional"}
                        </div>

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

                      <div className="mt-1 text-sm text-slate-600">
                        Sent:{" "}
                        <span className="font-semibold text-slate-800">
                          {new Date(b.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* actions */}
                    {b.status === "accepted" && phone ? (
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={`tel:${phone}`}
                          className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
                    ) : (
                      <div className="text-sm text-slate-600">
                        <span className="font-semibold text-slate-800">
                          Phone:
                        </span>{" "}
                        <span className="italic text-slate-500">
                          Hidden until accepted
                        </span>
                      </div>
                    )}
                  </div>

                  {/* details grid */}
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                      <div className="text-xs font-semibold text-slate-500">
                        Contact
                      </div>
                      <div className="mt-1 text-sm">
                        <span className="font-semibold text-slate-900">
                          Phone:
                        </span>{" "}
                        {b.status === "accepted" ? (
                          <span className="font-semibold text-slate-900">
                            {phone || "-"}
                          </span>
                        ) : (
                          <span className="italic text-slate-500">
                            Hidden until accepted
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                      <div className="text-xs font-semibold text-slate-500">
                        Your Message
                      </div>
                      <div className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">
                        {b.message || "-"}
                      </div>
                    </div>
                  </div>

                  {/* attachment */}
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

                  {/* rating */}
                  {b.status === "accepted" && safeTaskStatus === "completed" && (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <div className="text-sm font-semibold text-slate-900">
                            Rate this Professional
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            Rating becomes permanent once submitted.
                          </div>
                        </div>

                        {b.clientRating != null && (
                          <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-800 border border-slate-200">
                            You rated: {b.clientRating}★
                          </div>
                        )}
                      </div>

                      {b.clientRating == null && (
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                          <Stars
                            value={rateVal[b._id] || 0}
                            onChange={(v) =>
                              setRateVal((p) => ({ ...p, [b._id]: v }))
                            }
                          />

                          <button
                            onClick={() => submitRating(b._id)}
                            disabled={!canRate || rateLoading[b._id]}
                            className="rounded-2xl bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-900 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
                          >
                            {rateLoading[b._id]
                              ? "Submitting..."
                              : "Submit Rating"}
                          </button>
                        </div>
                      )}

                      {!canRate && b.clientRating == null && (
                        <div className="mt-2 text-xs text-slate-500">
                          Rating available only after task is completed.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
