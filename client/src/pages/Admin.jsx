import { useEffect, useMemo, useRef, useState } from "react";
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

function StatPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 backdrop-blur-[2px]">
      <div className="text-xs font-semibold text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-extrabold tracking-tight text-slate-900">
        {value}
      </div>
    </div>
  );
}

function SectionCard({ title, desc, right, children, innerRef }) {
  return (
    <div
      ref={innerRef}
      className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur-[2px]"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-lg font-extrabold tracking-tight text-slate-900">
            {title}
          </div>
          {desc ? <div className="mt-1 text-sm text-slate-600">{desc}</div> : null}
        </div>
        {right ? <div className="flex items-center gap-2">{right}</div> : null}
      </div>

      <div className="mt-4">{children}</div>
    </div>
  );
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/45"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/30 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="text-base font-extrabold tracking-tight text-slate-900">
            {title}
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Close
          </button>
        </div>
        <div className="max-h-[70vh] overflow-auto p-5">{children}</div>
      </div>
    </div>
  );
}

function ActionBtn({ variant = "default", children, ...props }) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60";

  const styles = {
    default: "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
    dark:
      "bg-slate-900 text-white hover:bg-slate-800 focus:ring-offset-white",
    primary:
      "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800",
    success:
      "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800",
    danger:
      "bg-gradient-to-r from-rose-600 to-rose-700 text-white hover:from-rose-700 hover:to-rose-800",
  };

  return (
    <button className={`${base} ${styles[variant] || styles.default}`} {...props}>
      {children}
    </button>
  );
}

function Badge({ status }) {
  const s = String(status || "").toLowerCase();
  const base =
    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold";

  if (s === "accepted" || s === "approved")
    return <span className={`${base} bg-emerald-50 text-emerald-700`}>APPROVED</span>;
  if (s === "rejected")
    return <span className={`${base} bg-rose-50 text-rose-700`}>REJECTED</span>;
  if (s === "pending")
    return <span className={`${base} bg-amber-50 text-amber-700`}>PENDING</span>;

  return <span className={`${base} bg-slate-100 text-slate-700`}>{s || "-"}</span>;
}

function Chip({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700">
      {children}
    </span>
  );
}

/** Recharts tooltip (theme-matched, no harsh colors) */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/95 px-3 py-2 text-sm shadow-sm">
      <div className="text-xs font-semibold text-slate-500">{label}</div>
      <div className="mt-0.5 font-extrabold text-slate-900">
        {p?.name || "Count"}: {p?.value ?? 0}
      </div>
    </div>
  );
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
  const [activeTab, setActiveTab] = useState(""); // pending | clients | professionals | stats

  const statsRef = useRef(null);
  const pendingRef = useRef(null);
  const clientsRef = useRef(null);
  const professionalsRef = useRef(null);

  function scrollTo(ref) {
    setTimeout(() => {
      ref?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
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
    const ok = window.confirm(
      "Are you sure you want to DELETE this user permanently?"
    );
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

  const topCounts = useMemo(() => {
    const pCount = professionals.length;
    const cCount = clients.length;
    const pendingCount = pending.length;
    const catTotal = catStats.reduce((a, x) => a + (x.count || 0), 0);
    return { pCount, cCount, pendingCount, catTotal };
  }, [professionals.length, clients.length, pending.length, catStats]);

  if (checking) {
    return (
      <div className="relative min-h-screen px-4 py-10">
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-50 via-sky-50 to-slate-100" />
          <div className="absolute -top-40 right-[-180px] h-[560px] w-[560px] rounded-full bg-indigo-200/40 blur-3xl" />
          <div className="absolute -bottom-48 left-[-200px] h-[620px] w-[620px] rounded-full bg-sky-200/40 blur-3xl" />
        </div>
        <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white/80 p-6 backdrop-blur-[2px]">
          <div className="text-lg font-extrabold text-slate-900">
            Checking admin session…
          </div>
          <div className="mt-2 text-sm text-slate-600">
            Please wait while we verify access.
          </div>
        </div>
      </div>
    );
  }

  const tabBtn = (key, label, icon) => {
    const active = activeTab === key;
    return (
      <button
        onClick={() => {
          if (key === "pending") return loadPending();
          if (key === "clients") return loadClients();
          if (key === "professionals") return loadProfessionals();
          if (key === "stats") return loadStats();
        }}
        disabled={loading}
        className={[
          "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition",
          "border",
          active
            ? "border-indigo-200 bg-indigo-50 text-indigo-800"
            : "border-slate-200 bg-white/70 text-slate-700 hover:bg-white",
          loading && active ? "opacity-70" : "",
        ].join(" ")}
      >
        <span className="text-base">{icon}</span>
        {loading && active ? "Loading…" : label}
      </button>
    );
  };

  return (
    <div className="relative min-h-screen px-4 py-8 text-slate-900">
      {/* background (same theme family) */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50 via-sky-50 to-slate-100" />
        <div className="absolute -top-44 right-[-180px] h-[560px] w-[560px] rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute -bottom-52 left-[-210px] h-[640px] w-[640px] rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.07)_1px,transparent_0)] [background-size:26px_26px] opacity-30" />
      </div>

      <div className="mx-auto max-w-6xl space-y-5">
        {/* top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Admin Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Manage approvals, users and analytics in one place.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <ActionBtn variant="default" onClick={() => nav("/")}>
              ← Back to site
            </ActionBtn>
            <ActionBtn variant="danger" onClick={adminLogout}>
              Logout
            </ActionBtn>
          </div>
        </div>

        {/* quick stats (optional nice look) */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatPill label="Pending approvals" value={topCounts.pendingCount} />
          <StatPill label="Clients loaded" value={topCounts.cCount} />
          <StatPill label="Professionals loaded" value={topCounts.pCount} />
          <StatPill label="Category count total" value={topCounts.catTotal} />
        </div>

        {/* tabs */}
        <div className="flex flex-wrap gap-2">
          {tabBtn("pending", "Pending", "⏳")}
          {tabBtn("clients", "Clients", "👥")}
          {tabBtn("professionals", "Professionals", "🧰")}
          {tabBtn("stats", "Stats", "📊")}
        </div>

        {/* stats charts */}
        <div ref={statsRef} className="grid gap-4 md:grid-cols-2">
          <SectionCard
            title="Professionals by Category"
            desc="How many approved professionals exist per category."
            right={
              catStats?.length ? (
                <Chip>Total: {catStats.reduce((a, x) => a + (x.count || 0), 0)}</Chip>
              ) : (
                <Chip>No data</Chip>
              )
            }
          >
            <div className="h-72 rounded-2xl border border-slate-200 bg-white p-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={catStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 12, fill: "#334155" }}
                    axisLine={{ stroke: "#cbd5e1" }}
                    tickLine={{ stroke: "#cbd5e1" }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: "#334155" }}
                    axisLine={{ stroke: "#cbd5e1" }}
                    tickLine={{ stroke: "#cbd5e1" }}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" fill="#4f46e5" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {catStats.length === 0 && (
              <div className="mt-2 text-sm text-slate-500">
                Click <span className="font-semibold">Stats</span> to load chart data.
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Bookings by Category"
            desc="Distribution of booking requests across categories."
            right={
              bookingStats?.length ? (
                <Chip>
                  Total: {bookingStats.reduce((a, x) => a + (x.count || 0), 0)}
                </Chip>
              ) : (
                <Chip>No data</Chip>
              )
            }
          >
            <div className="h-72 rounded-2xl border border-slate-200 bg-white p-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bookingStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 12, fill: "#334155" }}
                    axisLine={{ stroke: "#cbd5e1" }}
                    tickLine={{ stroke: "#cbd5e1" }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: "#334155" }}
                    axisLine={{ stroke: "#cbd5e1" }}
                    tickLine={{ stroke: "#cbd5e1" }}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" fill="#0ea5e9" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {bookingStats.length === 0 && (
              <div className="mt-2 text-sm text-slate-500">
                Click <span className="font-semibold">Stats</span> to load chart data.
              </div>
            )}
          </SectionCard>
        </div>

        {/* Pending */}
        <SectionCard
          innerRef={pendingRef}
          title="Pending Professionals"
          desc="Review profiles, verify documents and approve or reject."
          right={
            <Chip>
              Pending: <span className="ml-1 font-extrabold">{pending.length}</span>
            </Chip>
          }
        >
          <div className="space-y-3">
            {pending.map((p) => (
              <div
                key={p._id}
                className="rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={imgUrl(p.profilePic)}
                      onError={onImgError}
                      className="h-12 w-12 rounded-full object-cover border border-slate-200"
                      alt="dp"
                    />
                    <div>
                      <div className="font-extrabold text-slate-900">
                        {p.name}{" "}
                        <span className="text-sm font-semibold text-slate-500">
                          • {p.email}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <Chip>{p.professional?.category || "—"}</Chip>
                        <Chip>{p.phone || "—"}</Chip>
                        <Chip>{p.city || "—"}</Chip>
                      </div>
                      <div className="mt-1 text-sm text-slate-600">
                        <span className="font-semibold">Address:</span>{" "}
                        {p.address?.trim() ? p.address : "—"}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <ActionBtn variant="default" onClick={() => setSelected(p)}>
                      View More
                    </ActionBtn>
                    <ActionBtn variant="success" onClick={() => approve(p._id)}>
                      Approve
                    </ActionBtn>
                    <ActionBtn variant="danger" onClick={() => reject(p._id)}>
                      Reject
                    </ActionBtn>
                  </div>
                </div>
              </div>
            ))}

            {pending.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-600">
                <div className="text-base font-extrabold text-slate-900">
                  No pending approvals
                </div>
                <div className="mt-1 text-sm">You’re all caught up ✅</div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Clients */}
        <SectionCard
          innerRef={clientsRef}
          title="Clients"
          desc="All registered clients (delete only if needed)."
          right={<Chip>Loaded: {clients.length}</Chip>}
        >
          <div className="overflow-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Address</th>
                  <th className="px-4 py-3 w-56">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c._id} className="border-t border-slate-200 align-top">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={imgUrl(c.profilePic)}
                          onError={onImgError}
                          className="h-9 w-9 rounded-full object-cover border border-slate-200"
                          alt="dp"
                        />
                        <div className="leading-tight">
                          <div className="font-semibold text-slate-900">{c.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{c.phone || "—"}</td>
                    <td className="px-4 py-3 text-slate-700">{c.email || "—"}</td>
                    
                    <td className="px-4 py-3 text-slate-700 max-w-[320px]">
                      {c.address?.trim() ? c.address : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <ActionBtn variant="default" onClick={() => setSelected(c)}>
                          View Profile
                        </ActionBtn>
                        <ActionBtn variant="danger" onClick={() => deleteUser(c._id)}>
                          Delete
                        </ActionBtn>
                      </div>
                    </td>
                  </tr>
                ))}

                {clients.length === 0 && (
                  <tr>
                    <td className="px-4 py-4 text-slate-500" colSpan={5}>
                      No clients loaded. Click <b>Clients</b> to load.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* Professionals */}
        <SectionCard
          innerRef={professionalsRef}
          title="Professionals"
          desc="All professionals (approved, rejected, pending)."
          right={<Chip>Loaded: {professionals.length}</Chip>}
        >
          <div className="overflow-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Address</th>
                  <th className="px-4 py-3 w-56">Actions</th>
                </tr>
              </thead>
              <tbody>
                {professionals.map((p) => (
                  <tr key={p._id} className="border-t border-slate-200 align-top">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={imgUrl(p.profilePic)}
                          onError={onImgError}
                          className="h-9 w-9 rounded-full object-cover border border-slate-200"
                          alt="dp"
                        />
                        <div className="leading-tight">
                          <div className="font-semibold text-slate-900">{p.name}</div>
                          <div className="text-xs text-slate-500">{p.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{p.phone || "—"}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {p.professional?.category || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-700 max-w-[320px]">
                      {p.address?.trim() ? p.address : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <ActionBtn variant="default" onClick={() => setSelected(p)}>
                          View Profile
                        </ActionBtn>
                        <ActionBtn variant="danger" onClick={() => deleteUser(p._id)}>
                          Delete
                        </ActionBtn>
                      </div>
                    </td>
                  </tr>
                ))}

                {professionals.length === 0 && (
                  <tr>
                    <td className="px-4 py-4 text-slate-500" colSpan={6}>
                      No professionals loaded. Click <b>Professionals</b> to load.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* modal */}
        <Modal
          open={!!selected}
          onClose={() => setSelected(null)}
          title="User Details"
        >
          {selected && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <img
                  src={imgUrl(selected.profilePic)}
                  onError={onImgError}
                  className="h-14 w-14 rounded-full border border-slate-200 object-cover"
                  alt="dp"
                />
                <div className="flex-1">
                  <div className="text-lg font-extrabold text-slate-900">
                    {selected.name}
                  </div>
                  <div className="text-sm text-slate-600">{selected.email}</div>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <Chip>{selected.role || "—"}</Chip>
                    <Chip>{selected.phone || "—"}</Chip>
                    {selected.status ? <Chip>{selected.status}</Chip> : null}
                    {selected.city ? <Chip>{selected.city}</Chip> : null}
                  </div>
                </div>
              </div>

              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold text-slate-500">Address</div>
                  <div className="mt-1 font-semibold text-slate-900">
                    {selected.address?.trim() ? selected.address : "—"}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold text-slate-500">Category</div>
                  <div className="mt-1 font-semibold text-slate-900">
                    {selected.professional?.category || "Client"}
                  </div>
                </div>
              </div>

              {selected?.professional && (
                <div className="rounded-2xl border border-slate-200 bg-white p-3">
                  <div className="text-xs font-semibold text-slate-500">Intro</div>
                  <div className="mt-1 text-sm text-slate-700">
                    {selected.professional.shortIntro?.trim() || "—"}
                  </div>
                </div>
              )}

              <div className="grid gap-3 md:grid-cols-3">
                {selected.profilePic && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-3">
                    <div className="text-xs font-semibold text-slate-500">
                      Profile Pic
                    </div>
                    <img
                      className="mt-2 h-40 w-full rounded-2xl border border-slate-200 object-cover"
                      src={imgUrl(selected.profilePic)}
                      alt="profile"
                      onError={onImgError}
                    />
                  </div>
                )}

                {selected.professional?.cnicPic && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-3">
                    <div className="text-xs font-semibold text-slate-500">CNIC Pic</div>
                    <img
                      className="mt-2 h-40 w-full rounded-2xl border border-slate-200 object-cover"
                      src={`${BASE}/uploads/${selected.professional.cnicPic}`}
                      alt="cnic"
                      onError={onImgError}
                    />
                  </div>
                )}

                {selected.professional?.feeScreenshot && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-3">
                    <div className="text-xs font-semibold text-slate-500">
                      Fee Screenshot
                    </div>
                    <img
                      className="mt-2 h-40 w-full rounded-2xl border border-slate-200 object-cover"
                      src={`${BASE}/uploads/${selected.professional.feeScreenshot}`}
                      alt="fee"
                      onError={onImgError}
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-wrap justify-end gap-2 pt-2">
                {selected.role === "professional" && selected.status === "pending" && (
                  <>
                    <ActionBtn variant="success" onClick={() => approve(selected._id)}>
                      Approve
                    </ActionBtn>
                    <ActionBtn variant="danger" onClick={() => reject(selected._id)}>
                      Reject
                    </ActionBtn>
                  </>
                )}
                <ActionBtn variant="danger" onClick={() => deleteUser(selected._id)}>
                  Delete User
                </ActionBtn>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
