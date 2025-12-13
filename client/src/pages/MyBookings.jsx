import { useEffect, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

function badge(status) {
  const base = "text-xs px-2 py-1 rounded font-semibold";
  if (status === "accepted") return `${base} bg-green-100 text-green-700`;
  if (status === "rejected") return `${base} bg-red-100 text-red-700`;
  return `${base} bg-yellow-100 text-yellow-700`;
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
          <Link to="/dashboard" className="underline text-sm">Dashboard</Link>
        </div>

        {items.map((b) => (
          <div key={b._id} className="bg-white border rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center">
              <div className="font-bold">{b.professionalId?.name || "Professional"}</div>
              <span className={badge(b.status)}>{b.status.toUpperCase()}</span>
            </div>

            <div className="text-sm text-gray-600">
              Phone: {b.professionalId?.phone || "-"}
            </div>

            <div className="text-sm">
              <b>Your Message:</b> {b.message || "-"}
            </div>

            <div className="text-xs text-gray-500">
              Sent: {new Date(b.createdAt).toLocaleString()}
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-gray-500">No booking requests yet.</div>
        )}
      </div>
    </div>
  );
}
