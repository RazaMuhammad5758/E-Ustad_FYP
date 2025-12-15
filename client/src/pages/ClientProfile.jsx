import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const BASE = "http://localhost:5000";
const FALLBACK_DP = "/dp.jpg";

const COUNTRY_CODES = [
  { code: "+92", label: "PK", flag: "🇵🇰", max: 10, hint: "3xxxxxxxxx" },
  { code: "+91", label: "IN", flag: "🇮🇳", max: 10, hint: "xxxxxxxxxx" },
  { code: "+971", label: "AE", flag: "🇦🇪", max: 9, hint: "xxxxxxxxx" },
  { code: "+966", label: "SA", flag: "🇸🇦", max: 9, hint: "xxxxxxxxx" },
  { code: "+44", label: "UK", flag: "🇬🇧", max: 10, hint: "9-10 digits" },
  { code: "+1", label: "US", flag: "🇺🇸", max: 10, hint: "xxxxxxxxxx" },
];

function safeImg(file) {
  return file ? `${BASE}/uploads/${file}` : FALLBACK_DP;
}

function splitPhone(phone) {
  const raw = String(phone || "").trim();
  const onlyDigits = raw.replace(/[^\d+]/g, "");

  // If backend stored as national digits (or "03..") without +, keep PK default
  if (!onlyDigits.startsWith("+")) {
    const national = onlyDigits.replace(/[^\d]/g, "").replace(/^0/, "");
    return { cc: "+92", national };
  }

  // Match +<cc><national>
  const match = onlyDigits.match(/^\+(\d{1,3})(\d+)$/);
  if (!match) return { cc: "+92", national: onlyDigits.replace(/[^\d]/g, "") };

  const cc = `+${match[1]}`;
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
    return (
      COUNTRY_CODES.find((c) => c.code === form.phoneCountryCode) ||
      COUNTRY_CODES[0]
    );
  }, [form.phoneCountryCode]);

  function setPhoneDigits(value) {
    const digits = String(value || "").replace(/[^\d]/g, "");
    setForm((p) => ({ ...p, phone: digits.slice(0, phoneRule.max) }));
  }

  // ✅ Load user data into form (handles phone formats safely)
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const u = await refreshMe();

        const src = u || user; // fallback
        if (src) {
          const { cc, national } = splitPhone(src.phone);

          setForm({
            name: src?.name || "",
            phoneCountryCode: src?.phoneCountryCode || cc || "+92",
            phone: src?.phoneNational || national || "",
            city: src?.city || "",
            address: src?.address || "",
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
      fd.append("phone", form.phone.trim()); // ✅ national digits only
      fd.append("city", form.city);
      fd.append("address", (form.address || "").trim());
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

  function cancelEdit() {
    setEdit(false);
    setProfilePic(null);

    const src = user;
    const { cc, national } = splitPhone(src?.phone);

    setForm({
      name: src?.name || "",
      phoneCountryCode: src?.phoneCountryCode || cc || "+92",
      phone: src?.phoneNational || national || "",
      city: src?.city || "",
      address: src?.address || "",
    });
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <div className="p-6">Not found</div>;

  return (
    <div className="min-h-screen bg-transparent text-slate-900">
      {/* background (same family as home) */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50 via-sky-50 to-slate-100" />
        <div className="absolute -top-40 right-[-170px] h-[560px] w-[560px] rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute -bottom-52 left-[-210px] h-[640px] w-[640px] rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.07)_1px,transparent_0)] [background-size:26px_26px] opacity-30" />
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 space-y-5">
        {/* top bar */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              My Profile
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Manage your account info and profile picture.
            </p>
          </div>

          <Link
            to="/dashboard"
            className="rounded-xl bg-white/70 px-4 py-2 text-sm font-semibold text-indigo-700 ring-1 ring-slate-200/70 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Dashboard →
          </Link>
        </div>

        {/* card */}
        <div className="grid gap-4 rounded-3xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur-[2px] md:grid-cols-2">
          {/* left */}
          <div className="space-y-4">
            {!edit ? (
              <>
                <div className="space-y-1">
                  <div className="text-lg font-extrabold text-slate-900">
                    {user.name}
                  </div>
                  <div className="text-sm text-slate-600">{user.email}</div>
                </div>

                <div className="grid gap-2 rounded-2xl border border-slate-200/70 bg-white/70 p-4">
                  <div className="text-sm text-slate-700">
                    <span className="font-semibold text-slate-900">Phone:</span>{" "}
                    {user.phone || "-"}
                  </div>
                  <div className="text-sm text-slate-700">
                    <span className="font-semibold text-slate-900">City:</span>{" "}
                    {user.city || "—"}
                  </div>
                  <div className="text-sm text-slate-700">
                    <span className="font-semibold text-slate-900">
                      Address:
                    </span>{" "}
                    {user.address || "—"}
                  </div>
                </div>

                <button
                  onClick={() => setEdit(true)}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Edit Profile
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="text-lg font-extrabold text-slate-900">
                    Edit Profile
                  </div>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="text-sm font-semibold text-slate-600 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">
                      Full name
                    </label>
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
                      placeholder="Your name"
                      value={form.name}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, name: e.target.value }))
                      }
                    />
                  </div>

                  {/* phone */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">
                      Phone
                    </label>

                    <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white">
                      <select
                        className="h-10 bg-transparent px-2 text-sm outline-none border-r border-slate-200"
                        value={form.phoneCountryCode}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            phoneCountryCode: e.target.value,
                            phone: "",
                          }))
                        }
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.code}
                          </option>
                        ))}
                      </select>

                      <input
                        className="flex-1 h-10 px-3 text-sm outline-none"
                        placeholder={`e.g. ${phoneRule.hint || "digits"}`}
                        inputMode="numeric"
                        value={form.phone}
                        onChange={(e) => setPhoneDigits(e.target.value)}
                      />

                      <div className="px-3 text-xs text-slate-500 whitespace-nowrap flex items-center">
                        {form.phone.length}/{phoneRule.max}
                      </div>
                    </div>
                  </div>

                  {/* city */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">
                      City
                    </label>
                    <select
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
                      value={form.city}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, city: e.target.value }))
                      }
                    >
                      <option value="">Select City</option>
                      {CITIES.filter(Boolean).map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* address */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">
                      Address
                    </label>
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
                      placeholder="Street, Area, etc."
                      value={form.address}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, address: e.target.value }))
                      }
                    />
                  </div>

                  {/* profile pic */}
                  <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4">
                    <div className="text-sm font-semibold text-slate-900">
                      Profile Picture
                    </div>
                    <div className="mt-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setProfilePic(e.target.files?.[0] || null)
                        }
                      />
                      {profilePic && (
                        <div className="mt-2 text-xs text-slate-500">
                          Selected: {profilePic.name}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={saveProfile}
                      disabled={saving}
                      className="inline-flex items-center justify-center rounded-xl
                      bg-gradient-to-r from-indigo-600 to-indigo-700
                      px-4 py-2 text-sm font-semibold text-white
                      transition-all duration-300
                      hover:from-indigo-700 hover:to-indigo-800
                      focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                      disabled:opacity-60"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>

                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="space-y-3">
  <div className="flex items-center justify-between">
    <div className="text-sm font-semibold text-slate-900">Profile Photo</div>
    {edit && <div className="text-xs text-slate-500">Upload a clear face photo</div>}
  </div>

  {/* ✅ small + round */}
  <div className="flex justify-center">
    <div className="h-28 w-28 overflow-hidden rounded-full border border-slate-200 bg-white">
      <img
        src={safeImg(user.profilePic)}
        className="h-full w-full object-cover"
        alt="dp"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.src = FALLBACK_DP;
        }}
      />
    </div>
  </div>

  <div className="text-center text-xs text-slate-500">
    Tip: A good profile photo helps professionals trust your booking.
  </div>
</div>
        </div>
      </div>
    </div>
  );
}
