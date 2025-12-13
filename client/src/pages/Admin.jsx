import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const BASE = "http://localhost:5000";

export default function Admin() {
  const [admin, setAdmin] = useState({ email: "", password: "" });

  // pending approvals
  const [pending, setPending] = useState([]);
  const [selected, setSelected] = useState(null);

  // tables
  const [clients, setClients] = useState([]);
  const [professionals, setProfessionals] = useState([]);

  // stats
  const [catStats, setCatStats] = useState([]);
  const [bookingStats, setBookingStats] = useState([]);

  const [loading, setLoading] = useState(false);

  const headers = useMemo(
    () => ({
      "x-admin-email": admin.email,
      "x-admin-password": admin.password,
    }),
    [admin.email, admin.password]
  );

  async function loadPending() {
    try {
      setLoading(true);
      const res = await api.get("/admin/pending-professionals", { headers });
      setPending(res.data.pending || []);
      toast.success("Pending loaded");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Admin auth failed");
    } finally {
      setLoading(false);
    }
  }

  async function loadClients() {
    try {
      setLoading(true);
      const res = await api.get("/admin/clients", { headers });
      setClients(res.data.clients || []);
      toast.success("Clients loaded");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load clients");
    } finally {
      setLoading(false);
    }
  }

  async function loadProfessionals() {
    try {
      setLoading(true);
      const res = await api.get("/admin/professionals", { headers });
      setProfessionals(res.data.professionals || []);
      toast.success("Professionals loaded");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load professionals");
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      setLoading(true);
      const [a, b] = await Promise.all([
        api.get("/admin/stats/categories", { headers }),
        api.get("/admin/stats/bookings-by-category", { headers }),
      ]);
      setCatStats(a.data.categories || []);
      setBookingStats(b.data.bookings || []);
      toast.success("Stats loaded");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load stats");
    } finally {
      setLoading(false);
    }
  }

  async function approve(id) {
    try {
      await api.post(`/admin/approve/${id}`, {}, { headers });
      toast.success("Approved!");
      setSelected(null);
      await loadPending();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Approve failed");
    }
  }

  async function reject(id) {
    try {
      await api.post(`/admin/reject/${id}`, {}, { headers });
      toast.success("Rejected!");
      setSelected(null);
      await loadPending();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Reject failed");
    }
  }

  async function deleteUser(id) {
    const ok = window.confirm(
      "Are you sure you want to DELETE this user permanently?"
    );
    if (!ok) return;

    try {
      await api.delete(`/admin/users/${id}`, { headers });
      toast.success("User deleted");
      setSelected(null);

      // refresh whatever is loaded
      await Promise.all([
        loadClients(),
        loadProfessionals(),
        loadPending(),
        loadStats(),
      ]);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  }

  useEffect(() => {}, []);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Admin Panel</h1>

      {/* Admin Credentials */}
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
          onClick={loadPending}
          className="bg-black text-white rounded p-2 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Loading..." : "Load Pending"}
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={loadClients}
          className="bg-white border rounded px-4 py-2 text-sm"
          disabled={loading}
        >
          Load Clients
        </button>
        <button
          onClick={loadProfessionals}
          className="bg-white border rounded px-4 py-2 text-sm"
          disabled={loading}
        >
          Load Professionals
        </button>
        <button
          onClick={loadStats}
          className="bg-white border rounded px-4 py-2 text-sm"
          disabled={loading}
        >
          Load Stats
        </button>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white border rounded-xl p-4">
          <div className="font-bold mb-2">Professionals by Category</div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={catStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {catStats.length === 0 && (
            <div className="text-sm text-gray-500 mt-2">No data</div>
          )}
        </div>

        <div className="bg-white border rounded-xl p-4">
          <div className="font-bold mb-2">Bookings by Category</div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookingStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {bookingStats.length === 0 && (
            <div className="text-sm text-gray-500 mt-2">No data</div>
          )}
        </div>
      </div>

      {/* Pending Approvals */}
      <div className="bg-white border rounded-xl p-4 space-y-3">
        <div className="font-bold">Pending Professionals</div>

        {pending.map((p) => (
          <div
            key={p._id}
            className="border rounded p-4 flex items-center justify-between gap-3"
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
          <div className="text-gray-500 text-sm">No pending approvals</div>
        )}
      </div>

      {/* Clients Table */}
      <div className="bg-white border rounded-xl p-4">
        <div className="font-bold mb-3">Clients</div>

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th className="w-56">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c._id} className="border-b">
                  <td className="py-2">{c.name}</td>
                  <td>{c.phone || "-"}</td>
                  <td>{c.email}</td>
                  <td className="py-2 flex gap-2">
                    {/* ✅ FIXED: open modal instead of toast */}
                    <button
                      onClick={() => setSelected(c)}
                      className="border rounded px-3 py-1"
                    >
                      View Profile
                    </button>

                    <button
                      onClick={() => deleteUser(c._id)}
                      className="bg-red-600 text-white rounded px-3 py-1"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr>
                  <td className="py-2 text-gray-500" colSpan={4}>
                    No clients loaded. Click “Load Clients”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Professionals Table */}
      <div className="bg-white border rounded-xl p-4">
        <div className="font-bold mb-3">Professionals</div>

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Name</th>
                <th>Phone</th>
                <th>Category</th>
                <th>Status</th>
                <th className="w-56">Actions</th>
              </tr>
            </thead>
            <tbody>
              {professionals.map((p) => (
                <tr key={p._id} className="border-b">
                  <td className="py-2 flex items-center gap-2">
                    {p.profilePic && (
                      <img
                        src={`${BASE}/uploads/${p.profilePic}`}
                        className="w-9 h-9 rounded-full object-cover border"
                        alt="dp"
                      />
                    )}
                    <span>{p.name}</span>
                  </td>
                  <td>{p.phone || "-"}</td>
                  <td>{p.professional?.category || "-"}</td>
                  <td>{p.status || "-"}</td>
                  <td className="py-2 flex gap-2">
                    <button
                      onClick={() => setSelected(p)}
                      className="border rounded px-3 py-1"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => deleteUser(p._id)}
                      className="bg-red-600 text-white rounded px-3 py-1"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {professionals.length === 0 && (
                <tr>
                  <td className="py-2 text-gray-500" colSpan={5}>
                    No professionals loaded. Click “Load Professionals”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ VIEW MORE MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-xl p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              {/* ✅ Title improved */}
              <h2 className="text-xl font-bold">
                {selected.role === "client" ? "Client Details" : "User Details"}
              </h2>
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
                <b>Phone:</b> {selected.phone || "-"}
              </div>
              <div>
                <b>Role:</b> {selected.role || "-"}
              </div>
              <div>
                <b>Status:</b> {selected.status || "-"}
              </div>
              {selected.professional?.category && (
                <div>
                  <b>Category:</b> {selected.professional.category}
                </div>
              )}
            </div>

            {selected.professional?.shortIntro && (
              <div className="text-sm">
                <b>Intro:</b>
                <div className="border rounded p-2 mt-1">
                  {selected.professional.shortIntro}
                </div>
              </div>
            )}

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
              {selected.role === "professional" &&
                selected.status === "pending" && (
                  <>
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
                  </>
                )}

              <button
                onClick={() => deleteUser(selected._id)}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
