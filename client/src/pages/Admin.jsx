import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
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
const FALLBACK_DP = "/dp.jpg";

function imgUrl(file) {
  if (!file) return FALLBACK_DP;
  return `${BASE}/uploads/${file}`;
}

function onImgError(e) {
  e.currentTarget.src = FALLBACK_DP;
}

export default function Admin() {
  const nav = useNavigate();

  const [checking, setChecking] = useState(true);

  const [pending, setPending] = useState([]);
  const [selected, setSelected] = useState(null);

  const [clients, setClients] = useState([]);
  const [professionals, setProfessionals] = useState([]);

  const [catStats, setCatStats] = useState([]);
  const [bookingStats, setBookingStats] = useState([]);

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("");

  const statsRef = useRef(null);
  const pendingRef = useRef(null);
  const clientsRef = useRef(null);
  const professionalsRef = useRef(null);

  function scrollTo(ref) {
    setTimeout(() => {
      ref?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  function tabBtnClass(tabName, base) {
    const active =
      activeTab === tabName
        ? "ring-2 ring-black border-black"
        : "border-gray-200";
    return `${base} ${active}`;
  }

  useEffect(() => {
    (async () => {
      try {
        await api.get("/admin/me");
        setChecking(false);
      } catch {
        nav("/admin/login");
      }
    })();
  }, [nav]);

  async function adminLogout() {
    try {
      await api.post("/admin/logout");
      toast.success("Logged out");
      nav("/admin/login");
    } catch {
      toast.error("Logout failed");
    }
  }

  async function loadPending() {
    try {
      setLoading(true);
      setActiveTab("pending");
      const res = await api.get("/admin/pending-professionals");
      setPending(res.data.pending || []);
      toast.success("Pending loaded");
      scrollTo(pendingRef);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load pending");
    } finally {
      setLoading(false);
    }
  }

  async function loadClients() {
    try {
      setLoading(true);
      setActiveTab("clients");
      const res = await api.get("/admin/clients");
      setClients(res.data.clients || []);
      toast.success("Clients loaded");
      scrollTo(clientsRef);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load clients");
    } finally {
      setLoading(false);
    }
  }

  async function loadProfessionals() {
    try {
      setLoading(true);
      setActiveTab("professionals");
      const res = await api.get("/admin/professionals");
      setProfessionals(res.data.professionals || []);
      toast.success("Professionals loaded");
      scrollTo(professionalsRef);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load professionals");
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      setLoading(true);
      setActiveTab("stats");
      const [a, b] = await Promise.all([
        api.get("/admin/stats/categories"),
        api.get("/admin/stats/bookings-by-category"),
      ]);
      setCatStats(a.data.categories || []);
      setBookingStats(b.data.bookings || []);
      toast.success("Stats loaded");
      scrollTo(statsRef);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load stats");
    } finally {
      setLoading(false);
    }
  }

  async function approve(id) {
    try {
      await api.post(`/admin/approve/${id}`);
      toast.success("Approved!");
      setSelected(null);
      await loadPending();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Approve failed");
    }
  }

  async function reject(id) {
    try {
      await api.post(`/admin/reject/${id}`);
      toast.success("Rejected!");
      setSelected(null);
      await loadPending();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Reject failed");
    }
  }

  async function deleteUser(id) {
    const ok = window.confirm("Are you sure you want to DELETE this user permanently?");
    if (!ok) return;

    try {
      await api.delete(`/admin/users/${id}`);
      toast.success("User deleted");
      setSelected(null);

      await Promise.all([loadClients(), loadProfessionals(), loadPending(), loadStats()]);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  }

  if (checking) return <div className="p-6">Checking admin session...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button onClick={adminLogout} className="text-sm underline text-red-600">
          Logout
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={loadPending}
          className={tabBtnClass(
            "pending",
            "rounded px-4 py-2 text-sm disabled:opacity-60 " +
              (activeTab === "pending"
                ? "bg-black text-white border"
                : "bg-white border")
          )}
          disabled={loading}
        >
          {loading && activeTab === "pending" ? "Loading..." : "Load Pending"}
        </button>

        <button
          onClick={loadClients}
          className={tabBtnClass("clients", "bg-white border rounded px-4 py-2 text-sm disabled:opacity-60")}
          disabled={loading}
        >
          Load Clients
        </button>

        <button
          onClick={loadProfessionals}
          className={tabBtnClass("professionals", "bg-white border rounded px-4 py-2 text-sm disabled:opacity-60")}
          disabled={loading}
        >
          Load Professionals
        </button>

        <button
          onClick={loadStats}
          className={tabBtnClass("stats", "bg-white border rounded px-4 py-2 text-sm disabled:opacity-60")}
          disabled={loading}
        >
          Load Stats
        </button>
      </div>

      <div ref={statsRef} className="grid md:grid-cols-2 gap-4 scroll-mt-6">
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
          {catStats.length === 0 && <div className="text-sm text-gray-500 mt-2">No data</div>}
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
          {bookingStats.length === 0 && <div className="text-sm text-gray-500 mt-2">No data</div>}
        </div>
      </div>

      {/* ✅ Pending */}
      <div ref={pendingRef} className="bg-white border rounded-xl p-4 space-y-3 scroll-mt-6">
        <div className="font-bold">Pending Professionals</div>

        {pending.map((p) => (
          <div key={p._id} className="border rounded p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={p.profilePic ? `${BASE}/uploads/${p.profilePic}` : "/dp.png"}
                onError={(e) => (e.currentTarget.src = "/dp.png")}
                className="w-12 h-12 rounded-full object-cover border"
                alt="dp"
              />
              <div>
                <div className="font-bold">{p.name} — {p.email}</div>
                <div className="text-sm text-gray-600">
                  Category: {p.professional?.category || "-"} | Phone: {p.phone}
                </div>
                {/* ✅ Address show */}
                <div className="text-sm text-gray-600">
                  Address: {p.address?.trim() ? p.address : "-"}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setSelected(p)} className="bg-gray-800 text-white px-3 py-2 rounded">
                View More
              </button>
              <button onClick={() => approve(p._id)} className="bg-green-600 text-white px-3 py-2 rounded">
                Approve
              </button>
              <button onClick={() => reject(p._id)} className="bg-red-600 text-white px-3 py-2 rounded">
                Reject
              </button>
            </div>
          </div>
        ))}

        {pending.length === 0 && <div className="text-gray-500 text-sm">No pending approvals</div>}
      </div>

      {/* ✅ Clients */}
      <div ref={clientsRef} className="bg-white border rounded-xl p-4 scroll-mt-6">
        <div className="font-bold mb-3">Clients</div>

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Address</th>
                <th className="w-56">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c._id} className="border-b align-top">
                  <td className="py-2">{c.name}</td>
                  <td>{c.phone || "-"}</td>
                  <td>{c.email}</td>
                  <td className="max-w-[260px]">
                    {c.address?.trim() ? c.address : "-"}
                  </td>
                  <td className="py-2 flex gap-2">
                    <button onClick={() => setSelected(c)} className="border rounded px-3 py-1">
                      View Profile
                    </button>
                    <button onClick={() => deleteUser(c._id)} className="bg-red-600 text-white rounded px-3 py-1">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr>
                  <td className="py-2 text-gray-500" colSpan={5}>
                    No clients loaded. Click “Load Clients”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ Professionals */}
      <div ref={professionalsRef} className="bg-white border rounded-xl p-4 scroll-mt-6">
        <div className="font-bold mb-3">Professionals</div>

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Name</th>
                <th>Phone</th>
                <th>Category</th>
                <th>Status</th>
                <th>Address</th>
                <th className="w-56">Actions</th>
              </tr>
            </thead>
            <tbody>
              {professionals.map((p) => (
                <tr key={p._id} className="border-b align-top">
                  <td className="py-2 flex items-center gap-2">
                    <img
                      src={imgUrl(p.profilePic)}
                      onError={onImgError}
                      className="w-9 h-9 rounded-full object-cover border"
                      alt="dp"
                    />
                    <span>{p.name}</span>
                  </td>
                  <td>{p.phone || "-"}</td>
                  <td>{p.professional?.category || "-"}</td>
                  <td>{p.status || "-"}</td>
                  <td className="max-w-[260px]">
                    {p.address?.trim() ? p.address : "-"}
                  </td>
                  <td className="py-2 flex gap-2">
                    <button onClick={() => setSelected(p)} className="border rounded px-3 py-1">
                      View Profile
                    </button>
                    <button onClick={() => deleteUser(p._id)} className="bg-red-600 text-white rounded px-3 py-1">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {professionals.length === 0 && (
                <tr>
                  <td className="py-2 text-gray-500" colSpan={6}>
                    No professionals loaded. Click “Load Professionals”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ View modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-xl p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {selected.role === "client" ? "Client Details" : "User Details"}
              </h2>
              <button onClick={() => setSelected(null)} className="text-sm underline">
                Close
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-2 text-sm">
              <div><b>Name:</b> {selected.name}</div>
              <div><b>Email:</b> {selected.email}</div>
              <div><b>Phone:</b> {selected.phone || "-"}</div>
              <div><b>Role:</b> {selected.role || "-"}</div>
              <div><b>Status:</b> {selected.status || "-"}</div>

              {/* ✅ Address */}
              <div className="md:col-span-2">
                <b>Address:</b> {selected.address?.trim() ? selected.address : "-"}
              </div>

              {selected.professional?.category && (
                <div><b>Category:</b> {selected.professional.category}</div>
              )}
            </div>

            {selected?.professional && (
              <div className="text-sm">
                <b>Intro:</b>
                <div className="border rounded p-2 mt-1">
                  {selected.professional.shortIntro?.trim() || "-"}
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
                    onError={onImgError}
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
                    onError={onImgError}
                  />
                </div>
              )}

              {selected.professional?.feeScreenshot && (
                <div>
                  <div className="text-xs font-semibold mb-1">Fee Screenshot</div>
                  <img
                    className="w-full h-40 object-cover rounded border"
                    src={`${BASE}/uploads/${selected.professional.feeScreenshot}`}
                    alt="fee"
                    onError={onImgError}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end pt-2">
              {selected.role === "professional" && selected.status === "pending" && (
                <>
                  <button onClick={() => approve(selected._id)} className="bg-green-600 text-white px-4 py-2 rounded">
                    Approve
                  </button>
                  <button onClick={() => reject(selected._id)} className="bg-red-600 text-white px-4 py-2 rounded">
                    Reject
                  </button>
                </>
              )}

              <button onClick={() => deleteUser(selected._id)} className="bg-red-600 text-white px-4 py-2 rounded">
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
