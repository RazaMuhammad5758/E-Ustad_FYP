import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const BASE = "http://localhost:5000";

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
    return { cc: "+92", national: String(raw).replace(/[^\d]/g, "").replace(/^0/, "") };
  }
  const match = raw.match(/^\+(\d{1,3})(\d+)$/);
  if (!match) return { cc: "+92", national: String(raw).replace(/[^\d]/g, "") };
  const cc = "+" + match[1];
  const national = match[2];
  return { cc, national };
}

export default function ProProfile() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [edit, setEdit] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phoneCountryCode: "+92",
    phone: "",
    city: "",
    address: "",
    category: "",
    shortIntro: "",
  });

  const [profilePic, setProfilePic] = useState(null);

  const phoneRule = useMemo(() => {
    return COUNTRY_CODES.find((c) => c.code === form.phoneCountryCode) || COUNTRY_CODES[0];
  }, [form.phoneCountryCode]);

  function setPhoneDigits(value) {
    const digits = String(value || "").replace(/[^\d]/g, "");
    setForm((p) => ({ ...p, phone: digits.slice(0, phoneRule.max) }));
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
        phoneCountryCode: u.phoneCountryCode || cc || "+92",
        phone: u.phoneNational || national || "",
        city: u.city || "",
        address: u.address || "",
        category: p.category || "",
        shortIntro: p.shortIntro || "",
      });
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile() {
    if (!form.city?.trim()) return toast.error("City required"); // ✅ ADDED
    try {
      setSaving(true);

      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("phoneCountryCode", form.phoneCountryCode);
      fd.append("phone", form.phone);
      fd.append("city", form.city);
      fd.append("address", form.address);
      fd.append("category", form.category);
      fd.append("shortIntro", form.shortIntro);
      if (profilePic) fd.append("profilePic", profilePic);

      await api.put("/auth/me", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Profile updated");
      setEdit(false);
      setProfilePic(null);
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Update failed");
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
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Profile</h1>
          <div className="flex gap-3 text-sm">
            <Link to="/dashboard" className="underline">
              Dashboard
            </Link>
            <Link to="/add-gig" className="underline">
              Add Gig
            </Link>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-5 grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            {!edit ? (
              <>
                <div className="font-bold text-lg">{user?.name}</div>
                <div className="text-sm text-gray-600">{professional?.category || "-"}</div>
                <div className="text-sm">Email: {user?.email}</div>
                <div className="text-sm">Phone: {user?.phone}</div>
                <div className="text-sm">City: {user?.city || "-"}</div>
                <div className="text-sm">Address: {user?.address || "-"}</div>

                <div className="text-sm">
                  <b>Intro:</b>
                  <div className="border rounded p-2 mt-1">
                    {professional?.shortIntro || "-"}
                  </div>
                </div>

                <button onClick={() => setEdit(true)} className="mt-2 border rounded px-3 py-2 text-sm">
                  Edit Profile
                </button>
              </>
            ) : (
              <>
                <div className="font-bold text-lg">Edit Profile</div>

                <div className="grid md:grid-cols-2 gap-2">
                  <input
                    className="border p-2 rounded md:col-span-2"
                    placeholder="Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />

                  {/* ✅ Phone with code INSIDE */}
                  <div className="md:col-span-2">
                    <label className="text-xs text-gray-500">Phone</label>
                    <div className="mt-1 flex items-center border rounded overflow-hidden bg-white">
                      <select
                        className="h-10 px-2 text-sm bg-transparent border-r outline-none"
                        value={form.phoneCountryCode}
                        onChange={(e) => setForm({ ...form, phoneCountryCode: e.target.value, phone: "" })}
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.code}
                          </option>
                        ))}
                      </select>

                      <input
                        className="flex-1 h-10 px-3 outline-none"
                        placeholder="Phone"
                        inputMode="numeric"
                        value={form.phone}
                        onChange={(e) => setPhoneDigits(e.target.value)}
                      />

                      <div className="px-3 text-xs text-gray-500 whitespace-nowrap">
                        {form.phone.length}/{phoneRule.max}
                      </div>
                    </div>
                  </div>

                  <input
                    className="border p-2 rounded"
                    placeholder="City"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                  <input
                    className="border p-2 rounded"
                    placeholder="Address"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />

                  <input
                    className="border p-2 rounded md:col-span-2"
                    placeholder="Category"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  />
                </div>

                <textarea
                  className="border p-2 rounded w-full"
                  rows={3}
                  placeholder="Short intro"
                  value={form.shortIntro}
                  onChange={(e) => setForm({ ...form, shortIntro: e.target.value })}
                />

                <div className="text-sm space-y-1">
                  <div className="font-semibold">Profile Picture</div>
                  <input type="file" accept="image/*" onChange={(e) => setProfilePic(e.target.files?.[0] || null)} />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="bg-black text-white rounded px-4 py-2 text-sm disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => {
                      setEdit(false);
                      setProfilePic(null);
                      load();
                    }}
                    className="border rounded px-4 py-2 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            {!edit && (
              <div className="text-sm space-y-1 pt-2">
                {professional?.cnicPic && (
                  <div className="text-xs text-gray-600">
                    CNIC Pic:{" "}
                    <a className="underline" href={`${BASE}/uploads/${professional.cnicPic}`} target="_blank" rel="noreferrer">
                      View
                    </a>
                  </div>
                )}

                {professional?.feeScreenshot && (
                  <div className="text-xs text-gray-600">
                    Fee Screenshot:{" "}
                    <a className="underline" href={`${BASE}/uploads/${professional.feeScreenshot}`} target="_blank" rel="noreferrer">
                      View
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            {user?.profilePic ? (
              <img
                className="w-full h-56 object-cover rounded border"
                src={`${BASE}/uploads/${user.profilePic}`}
                alt="profile"
                onError={(e) => {
                  e.currentTarget.src = "/dp.jpg";
                }}
              />
            ) : (
              <img className="w-full h-56 object-cover rounded border" src="/dp.jpg" alt="default" />
            )}

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="border rounded p-3"><b>Total:</b> {stats?.total ?? 0}</div>
              <div className="border rounded p-3"><b>Pending:</b> {stats?.pending ?? 0}</div>
              <div className="border rounded p-3"><b>Accepted:</b> {stats?.accepted ?? 0}</div>
              <div className="border rounded p-3"><b>Rejected:</b> {stats?.rejected ?? 0}</div>
            </div>

            <div className="text-xs text-gray-500">
              Note: Your gigs are now shown on <b>Dashboard</b>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
