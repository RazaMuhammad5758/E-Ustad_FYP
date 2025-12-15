import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

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

export default function ClientProfile() {
  const { user, refreshMe, updateMyProfile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [saving, setSaving] = useState(false);

  const CITIES = [
    "",
    "Karachi",
    "Lahore",
    "Islamabad",
    "Rawalpindi",
    "Peshawar",
    "Quetta",
    "Faisalabad",
    "Multan",
    "Gujranwala",
    "Sialkot",
    "Hyderabad",
  ];

  const [form, setForm] = useState({
    name: "",
    phoneCountryCode: "+92",
    phone: "",
    city: "",
    address: "",
  });

  const [profilePic, setProfilePic] = useState(null);

  const phoneRule = useMemo(() => {
    return COUNTRY_CODES.find((c) => c.code === form.phoneCountryCode) || COUNTRY_CODES[0];
  }, [form.phoneCountryCode]);

  function setPhoneDigits(value) {
    const digits = String(value || "").replace(/[^\d]/g, "");
    setForm((p) => ({ ...p, phone: digits.slice(0, phoneRule.max) }));
  }

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const u = await refreshMe();
        if (u) {
          const { cc, national } = splitPhone(u.phone);
          setForm({
            name: u?.name || "",
            phoneCountryCode: u?.phoneCountryCode || cc || "+92",
            phone: u?.phoneNational || national || "",
            city: u?.city || "",
            address: u?.address || "",
          });
        }
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveProfile() {
    if (!form.name.trim()) return toast.error("Name required");
    if (!form.phone.trim()) return toast.error("Phone required");
    if (!form.city) return toast.error("City required");

    try {
      setSaving(true);

      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("phoneCountryCode", form.phoneCountryCode);
      fd.append("phone", form.phone.trim());
      fd.append("city", form.city);
      fd.append("address", form.address || "");
      if (profilePic) fd.append("profilePic", profilePic);

      const updated = await updateMyProfile(fd);

      toast.success("Profile updated");
      setEdit(false);
      setProfilePic(null);

      const { cc, national } = splitPhone(updated?.phone);
      setForm({
        name: updated?.name || "",
        phoneCountryCode: updated?.phoneCountryCode || cc || "+92",
        phone: updated?.phoneNational || national || "",
        city: updated?.city || "",
        address: updated?.address || "",
      });
    } catch (e) {
      toast.error(e?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <div className="p-6">Not found</div>;

  const currentPic = user.profilePic ? `${BASE}/uploads/${user.profilePic}` : "";

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Profile</h1>
          <Link to="/dashboard" className="underline text-sm">
            Dashboard
          </Link>
        </div>

        <div className="bg-white border rounded-xl p-5 grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            {!edit ? (
              <>
                <div className="font-bold text-lg">{user.name}</div>
                <div className="text-sm text-gray-600">{user.email}</div>
                <div className="text-sm">Phone: {user.phone}</div>
                <div className="text-sm">City: {user.city || "-"}</div>
                <div className="text-sm">Address: {user.address || "-"}</div>

                <button onClick={() => setEdit(true)} className="border rounded px-3 py-2 text-sm">
                  Edit Profile
                </button>
              </>
            ) : (
              <>
                <div className="font-bold text-lg">Edit Profile</div>

                <input
                  className="border p-2 rounded w-full"
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />

                {/* ✅ Phone with code INSIDE */}
                <div>
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

                <select
                  className="border p-2 rounded w-full"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                >
                  <option value="">Select City</option>
                  {CITIES.filter(Boolean).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <input
                  className="border p-2 rounded w-full"
                  placeholder="Address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />

                <div className="text-sm">
                  <div className="font-semibold mb-1">Profile Picture</div>
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
                      const { cc, national } = splitPhone(user?.phone);
                      setForm({
                        name: user?.name || "",
                        phoneCountryCode: user?.phoneCountryCode || cc || "+92",
                        phone: user?.phoneNational || national || "",
                        city: user?.city || "",
                        address: user?.address || "",
                      });
                    }}
                    className="border rounded px-4 py-2 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="space-y-2">
            {user.profilePic ? (
              <img
                src={currentPic}
                className="w-full h-56 object-cover rounded border"
                alt="dp"
                onError={(e) => {
                  e.currentTarget.src = "/dp.jpg";
                }}
              />
            ) : (
              <img
                src="/dp.jpg"
                className="w-full h-56 object-cover rounded border"
                alt="default"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
