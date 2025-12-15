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

function toWhatsApp(phone) {
  if (!phone) return "";
  const digits = String(phone).replace(/[^\d]/g, "");
  if (digits.startsWith("0")) return "92" + digits.slice(1);
  if (digits.startsWith("92")) return digits;
  return digits;
}

export default function Requests() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

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
    } catch {
      toast.error("Action failed");
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Booking Requests</h1>
          <Link to="/dashboard" className="underline text-sm">
            Dashboard
          </Link>
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
                : "/default-avatar.png";

              return (
                <div key={b._id} className="bg-white border rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={dp}
                        alt="dp"
                        className="w-10 h-10 rounded-full object-cover border"
                        onError={(e) => {
                          e.currentTarget.src = "/default-avatar.png";
                        }}
                      />
                      <div>
                        <div className="font-bold">{b.clientId?.name || "Client"}</div>
                        <div className="text-xs text-gray-500">
                          Sent: {new Date(b.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <span className={badge(b.status)}>
                      {String(b.status || "").toUpperCase()}
                    </span>
                  </div>

                  {/* ✅ Phone privacy */}
                  <div className="text-sm text-gray-600">
                    Phone:{" "}
                    {b.status === "accepted" ? (
                      <span className="font-semibold">{phone || "-"}</span>
                    ) : (
                      <span className="italic">Hidden until accepted</span>
                    )}
                  </div>

                  {/* ✅ Call / WhatsApp only on accepted */}
                  {b.status === "accepted" && phone && (
                    <div className="flex gap-2">
                      <a
                        href={`tel:${phone}`}
                        className="px-3 py-2 rounded bg-black text-white text-sm"
                      >
                        Call
                      </a>
                      <a
                        href={`https://wa.me/${wa}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 rounded border text-sm"
                      >
                        WhatsApp
                      </a>
                    </div>
                  )}

                  <div className="text-sm">
                    <b>Client Message:</b> {b.message || "-"}
                  </div>

                  {/* ✅ NEW: show booking picture (if uploaded) */}
                  {b.attachment && (
                    <div className="pt-2">
                      <div className="text-sm font-semibold mb-1">Client Uploaded Picture</div>
                      <a
                        href={`${BASE}/uploads/${b.attachment}`}
                        target="_blank"
                        rel="noreferrer"
                        className="underline text-sm"
                      >
                        View Full Image
                      </a>

                      <img
                        src={`${BASE}/uploads/${b.attachment}`}
                        alt="attachment"
                        className="mt-2 w-full max-h-64 object-cover rounded border"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
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
