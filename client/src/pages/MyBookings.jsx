import { useEffect, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const BASE = "http://localhost:5000";

function badge(status) {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold";
  if (status === "accepted")
    return `${base} bg-emerald-100 text-emerald-700`;
  if (status === "rejected")
    return `${base} bg-red-100 text-red-700`;
  return `${base} bg-amber-100 text-amber-700`;
}

function toWhatsApp(phone) {
  if (!phone) return "";
  const digits = String(phone).replace(/[^\d]/g, "");
  if (digits.startsWith("0")) return "92" + digits.slice(1);
  if (digits.startsWith("92")) return digits;
  return digits;
}

export default function MyBookings() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      const res = await api.get("/bookings/client");
      setItems(res.data.bookings || []);
    } catch (e) {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              My Booking Requests
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Track the status of your service requests.
            </p>
          </div>

          
        </div>

        {/* Content */}
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-600 shadow-sm">
            Loading bookings…
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((b) => {
              const phone =
                b.status === "accepted" ? b.professionalPhone : null;
              const wa = toWhatsApp(phone);

              return (
                <div
                  key={b._id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  {/* Top row */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-lg font-extrabold tracking-tight">
                      {b.professionalId?.name || "Professional"}
                    </div>
                    <span className={badge(b.status)}>
                      {String(b.status || "").toUpperCase()}
                    </span>
                  </div>

                  {/* Phone */}
                  <div className="mt-2 text-sm text-slate-600">
                    Phone:{" "}
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

                  {/* Actions */}
                  {b.status === "accepted" && phone && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a
                        href={`tel:${phone}`}
                        className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        📞 Call
                      </a>

                      <a
                        href={`https://wa.me/${wa}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        💬 WhatsApp
                      </a>
                    </div>
                  )}

                  {/* Message */}
                  <div className="mt-4 text-sm">
                    <span className="font-semibold text-slate-900">
                      Your Message:
                    </span>{" "}
                    <span className="text-slate-700">{b.message || "-"}</span>
                  </div>

                  {/* Attachment */}
                  {b.attachment && (
                    <div className="mt-4">
                      <div className="text-sm font-semibold text-slate-900 mb-1">
                        Uploaded Picture
                      </div>

                      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                        <img
                          src={`${BASE}/uploads/${b.attachment}`}
                          alt="attachment"
                          className="w-full max-h-64 object-cover"
                          onError={(e) =>
                            (e.currentTarget.style.display = "none")
                          }
                        />
                      </div>

                      <a
                        href={`${BASE}/uploads/${b.attachment}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-block text-xs font-semibold text-indigo-700 hover:underline"
                      >
                        View full image →
                      </a>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-4 text-xs text-slate-500">
                    Sent: {new Date(b.createdAt).toLocaleString()}
                  </div>
                </div>
              );
            })}

            {items.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-600 shadow-sm">
                <div className="text-base font-semibold text-slate-900">
                  No booking requests yet
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  Your requests will appear here once you book a professional.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
