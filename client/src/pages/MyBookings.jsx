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

export default function MyBookings() {
  const [items, setItems] = useState([]);

  async function load() {
    try {
      const res = await api.get("/bookings/client");
      setItems(res.data.bookings || []);
    } catch (e) {
      toast.error("Failed to load bookings");
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Booking Requests</h1>
          <Link to="/dashboard" className="underline text-sm">
            Dashboard
          </Link>
        </div>

        {items.map((b) => {
          const phone = b.status === "accepted" ? b.professionalPhone : null;
          const wa = toWhatsApp(phone);

          return (
            <div key={b._id} className="bg-white border rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-center">
                <div className="font-bold">
                  {b.professionalId?.name || "Professional"}
                </div>
                <span className={badge(b.status)}>
                  {String(b.status || "").toUpperCase()}
                </span>
              </div>

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
                <div className="flex gap-2 pt-1">
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
                <b>Your Message:</b> {b.message || "-"}
              </div>

              {/* ✅ NEW: show booking picture (if uploaded) */}
              {b.attachment && (
                <div className="pt-2">
                  <div className="text-sm font-semibold mb-1">
                    Your Uploaded Picture
                  </div>
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

              <div className="text-xs text-gray-500">
                Sent: {new Date(b.createdAt).toLocaleString()}
              </div>
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="text-gray-500">No booking requests yet.</div>
        )}
      </div>
    </div>
  );
}
