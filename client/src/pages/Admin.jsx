import { useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";

export default function Admin() {
  const [pending, setPending] = useState([]);
  const [admin, setAdmin] = useState({ email: "", password: "" });
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const BASE = "http://localhost:5000";

  async function load() {
    try {
      setLoading(true);
      const res = await api.get("/admin/pending-professionals", {
        headers: {
          "x-admin-email": admin.email,
          "x-admin-password": admin.password,
        },
      });
      setPending(res.data.pending || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Admin auth failed");
    } finally {
      setLoading(false);
    }
  }

  async function approve(id) {
    try {
      await api.post(
        `/admin/approve/${id}`,
        {},
        {
          headers: {
            "x-admin-email": admin.email,
            "x-admin-password": admin.password,
          },
        }
      );
      toast.success("Approved!");
      setSelected(null);
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Approve failed");
    }
  }

  async function reject(id) {
    try {
      await api.post(
        `/admin/reject/${id}`,
        {},
        {
          headers: {
            "x-admin-email": admin.email,
            "x-admin-password": admin.password,
          },
        }
      );
      toast.success("Rejected!");
      setSelected(null);
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Reject failed");
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Admin Panel</h1>

      <div className="bg-white p-4 rounded border grid md:grid-cols-3 gap-3">
        <input
          className="border p-2 rounded"
          placeholder="Admin Email"
          value={admin.email}
          onChange={(e) => setAdmin({ ...admin, email: e.target.value })}
        />
        <input
          type="password"
          className="border p-2 rounded"
          placeholder="Admin Password"
          value={admin.password}
          onChange={(e) => setAdmin({ ...admin, password: e.target.value })}
        />
        <button
          onClick={load}
          className="bg-black text-white rounded p-2 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Loading..." : "Load Pending"}
        </button>
      </div>

      <div className="space-y-3">
        {pending.map((p) => (
          <div
            key={p._id}
            className="bg-white p-4 rounded border flex items-center justify-between"
          >
            <div>
              <div className="font-bold">
                {p.name} — {p.email}
              </div>
              <div className="text-sm text-gray-600">
                Category: {p.professional?.category || "-"} | Phone: {p.phone}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelected(p)}
                className="bg-gray-800 text-white px-3 py-2 rounded"
              >
                View More
              </button>
              <button
                onClick={() => approve(p._id)}
                className="bg-green-600 text-white px-3 py-2 rounded"
              >
                Approve
              </button>
              <button
                onClick={() => reject(p._id)}
                className="bg-red-600 text-white px-3 py-2 rounded"
              >
                Reject
              </button>
            </div>
          </div>
        ))}

        {pending.length === 0 && (
          <div className="text-gray-500">No pending approvals</div>
        )}
      </div>

      {/* ✅ VIEW MORE MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-xl p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Professional Details</h2>
              <button
                onClick={() => setSelected(null)}
                className="text-sm underline"
              >
                Close
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-2 text-sm">
              <div>
                <b>Name:</b> {selected.name}
              </div>
              <div>
                <b>Email:</b> {selected.email}
              </div>
              <div>
                <b>Phone:</b> {selected.phone}
              </div>
              <div>
                <b>Category:</b> {selected.professional?.category || "-"}
              </div>
            </div>

            <div className="text-sm">
              <b>Short Intro:</b>
              <div className="border rounded p-2 mt-1">
                {selected.professional?.shortIntro || "-"}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              {selected.profilePic && (
                <div>
                  <div className="text-xs font-semibold mb-1">Profile Pic</div>
                  <img
                    className="w-full h-40 object-cover rounded border"
                    src={`${BASE}/uploads/${selected.profilePic}`}
                    alt="profile"
                  />
                </div>
              )}

              {selected.professional?.cnicPic && (
                <div>
                  <div className="text-xs font-semibold mb-1">CNIC Pic</div>
                  <img
                    className="w-full h-40 object-cover rounded border"
                    src={`${BASE}/uploads/${selected.professional.cnicPic}`}
                    alt="cnic"
                  />
                </div>
              )}

              {selected.professional?.feeScreenshot && (
                <div>
                  <div className="text-xs font-semibold mb-1">
                    Fee Screenshot
                  </div>
                  <img
                    className="w-full h-40 object-cover rounded border"
                    src={`${BASE}/uploads/${selected.professional.feeScreenshot}`}
                    alt="fee"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => approve(selected._id)}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Approve
              </button>
              <button
                onClick={() => reject(selected._id)}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
