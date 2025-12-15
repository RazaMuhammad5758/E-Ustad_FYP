import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const BASE = "http://localhost:5000";
const FALLBACK_DP = "/dp.jpg";

const COUNTRY_CODES = [
  { code: "+92", label: "PK", flag: "🇵🇰", max: 10 },
  { code: "+91", label: "IN", flag: "🇮🇳", max: 10 },
  { code: "+971", label: "AE", flag: "🇦🇪", max: 9 },
  { code: "+966", label: "SA", flag: "🇸🇦", max: 9 },
  { code: "+44", label: "UK", flag: "🇬🇧", max: 10 },
  { code: "+1", label: "US", flag: "🇺🇸", max: 10 },
];

function splitPhone(phone) {
  const raw = String(phone || "").trim();
  if (!raw.startsWith("+")) {
    return { cc: "+92", national: raw.replace(/[^\d]/g, "").replace(/^0/, "") };
  }
  const m = raw.match(/^\+(\d{1,3})(\d+)$/);
  return m ? { cc: `+${m[1]}`, national: m[2] } : { cc: "+92", national: raw };
}

export default function ProProfile() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [edit, setEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profilePic, setProfilePic] = useState(null);

  const [form, setForm] = useState({
    name: "",
    phoneCountryCode: "+92",
    phone: "",
    city: "",
    address: "",
    category: "",
    shortIntro: "",
  });

  const phoneRule = useMemo(
    () => COUNTRY_CODES.find((c) => c.code === form.phoneCountryCode) || COUNTRY_CODES[0],
    [form.phoneCountryCode]
  );

  function setPhoneDigits(v) {
    const d = String(v || "").replace(/[^\d]/g, "");
    setForm((p) => ({ ...p, phone: d.slice(0, phoneRule.max) }));
  }

  async function load() {
    try {
      setLoading(true);
      const res = await api.get("/professional/me");
      setData(res.data);

      const u = res.data?.user || {};
      const p = res.data?.professional || {};
      const { cc, national } = splitPhone(u.phone);

      setForm({
        name: u.name || "",
        phoneCountryCode: u.phoneCountryCode || cc,
        phone: u.phoneNational || national || "",
        city: u.city || "",
        address: u.address || "",
        category: p.category || "",
        shortIntro: p.shortIntro || "",
      });
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile() {
    if (!form.city) return toast.error("City required");

    try {
      setSaving(true);
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (profilePic) fd.append("profilePic", profilePic);

      await api.put("/auth/me", fd);
      toast.success("Profile updated");
      setEdit(false);
      setProfilePic(null);
      await load();
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!data) return <div className="p-6">Not found</div>;

  const { user, professional, stats } = data;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-sky-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-slate-900">Professional Profile</h1>
          <div className="flex gap-4 text-sm font-semibold text-indigo-700">
            <Link to="/dashboard" className="hover:underline">Dashboard</Link>
            <Link to="/add-gig" className="hover:underline">Add Gig</Link>
          </div>
        </div>

        {/* Card */}
        <div className="grid md:grid-cols-3 gap-6 rounded-3xl bg-white/80 border border-white/60 p-6 backdrop-blur">

          {/* Left */}
          <div className="md:col-span-2 space-y-4">
            {!edit ? (
              <>
                <div>
                  <h2 className="text-xl font-bold">{user.name}</h2>
                  <p className="text-sm text-slate-600">{professional?.category}</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div><b>Email:</b> {user.email}</div>
                  <div><b>Phone:</b> {user.phone}</div>
                  <div><b>City:</b> {user.city || "-"}</div>
                  <div><b>Address:</b> {user.address || "-"}</div>
                </div>

                <div className="text-sm">
                  <b>Intro:</b>
                  <div className="mt-1 rounded-xl border p-3 bg-slate-50">
                    {professional?.shortIntro || "-"}
                  </div>
                </div>

                <button
                  onClick={() => setEdit(true)}
                  className="inline-flex rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                >
                  Edit Profile
                </button>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold">Edit Profile</h2>

                <div className="grid sm:grid-cols-2 gap-3">
                  <input className="border rounded-xl p-2" placeholder="Name"
                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

                  <input className="border rounded-xl p-2" placeholder="City"
                    value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />

                  <input className="border rounded-xl p-2 sm:col-span-2" placeholder="Address"
                    value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />

                  <input className="border rounded-xl p-2 sm:col-span-2" placeholder="Category"
                    value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                </div>

                <textarea
                  rows={3}
                  className="border rounded-xl p-2 w-full"
                  placeholder="Short intro"
                  value={form.shortIntro}
                  onChange={(e) => setForm({ ...form, shortIntro: e.target.value })}
                />

                <input type="file" accept="image/*" onChange={(e) => setProfilePic(e.target.files?.[0] || null)} />

                <div className="flex gap-2">
                  <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="rounded-xl bg-indigo-600 text-white px-4 py-2 text-sm font-semibold disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button onClick={() => load()} className="rounded-xl border px-4 py-2 text-sm">
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Right */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="h-28 w-28 rounded-full overflow-hidden border">
                <img
                  src={user.profilePic ? `${BASE}/uploads/${user.profilePic}` : FALLBACK_DP}
                  className="h-full w-full object-cover"
                  onError={(e) => (e.currentTarget.src = FALLBACK_DP)}
                  alt="profile"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border p-3"><b>Total</b><div>{stats?.total ?? 0}</div></div>
              <div className="rounded-xl border p-3"><b>Pending</b><div>{stats?.pending ?? 0}</div></div>
              <div className="rounded-xl border p-3"><b>Accepted</b><div>{stats?.accepted ?? 0}</div></div>
              <div className="rounded-xl border p-3"><b>Rejected</b><div>{stats?.rejected ?? 0}</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
