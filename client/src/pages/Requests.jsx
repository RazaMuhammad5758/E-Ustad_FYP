import { useEffect, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function Requests() {
  const [items, setItems] = useState([]);

  async function load() {
    const res = await api.get("/bookings/professional");
    setItems(res.data.bookings || []);
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
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Booking Requests</h1>

      {items.map(b => (
        <div key={b._id} className="bg-white border rounded p-4 space-y-2">
          <div className="font-bold">{b.clientId.name}</div>
          <div className="text-sm text-gray-600">Phone: {b.clientId.phone}</div>
          <div className="text-sm">{b.message || "-"}</div>
          <div className="text-sm font-semibold">Status: {b.status}</div>

          {b.status === "pending" && (
            <div className="flex gap-2">
              <button
                onClick={() => update(b._id, "accepted")}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                Accept
              </button>
              <button
                onClick={() => update(b._id, "rejected")}
                className="bg-red-600 text-white px-3 py-1 rounded"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      ))}

      {items.length === 0 && <div className="text-gray-500">No requests yet</div>}
    </div>
  );
}
