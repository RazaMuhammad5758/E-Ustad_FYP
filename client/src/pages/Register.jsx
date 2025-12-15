import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import { CATEGORIES } from "../constants/categories";

export default function Register() {
  const nav = useNavigate();
  const [role, setRole] = useState("client");

  const CITIES = [
    "Karachi","Lahore","Islamabad","Rawalpindi","Peshawar","Quetta",
    "Faisalabad","Multan","Gujranwala","Sialkot","Hyderabad"
  ];

  const COUNTRY_CODES = [
    { code: "+92", label: "PK", flag: "🇵🇰", max: 10, hint: "3xxxxxxxxx" },
    { code: "+91", label: "IN", flag: "🇮🇳", max: 10, hint: "xxxxxxxxxx" },
    { code: "+971", label: "AE", flag: "🇦🇪", max: 9, hint: "xxxxxxxxx" },
    { code: "+966", label: "SA", flag: "🇸🇦", max: 9, hint: "xxxxxxxxx" },
    { code: "+44", label: "UK", flag: "🇬🇧", max: 10, hint: "9-10 digits" },
    { code: "+1", label: "US", flag: "🇺🇸", max: 10, hint: "xxxxxxxxxx" },
  ];

  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneCountryCode: "+92",
    phone: "",
    password: "",
    city: "",
    address: "",
    category: "",
    shortIntro: "",
  });

  const [files, setFiles] = useState({
    profilePic: null,
    cnicPic: null,
    feeScreenshot: null,
  });

  const [loading, setLoading] = useState(false);

  function vEmail(x) {
    return /^\S+@\S+\.\S+$/.test(x);
  }

  function switchRole(nextRole) {
    setRole(nextRole);
    setForm((prev) => ({
      ...prev,
      password: "",
      category: "",
      shortIntro: "",
    }));
    setFiles({ profilePic: null, cnicPic: null, feeScreenshot: null });
  }

  const phoneRule = useMemo(() => {
    return COUNTRY_CODES.find((c) => c.code === form.phoneCountryCode) || COUNTRY_CODES[0];
  }, [form.phoneCountryCode]);

  function setPhoneDigits(value) {
    const digits = String(value || "").replace(/[^\d]/g, "");
    setForm((p) => ({ ...p, phone: digits.slice(0, phoneRule.max) }));
  }

  async function submit(e) {
    e.preventDefault();

    if (!form.name.trim()) return toast.error("Name required");
    if (!form.email.trim() || !vEmail(form.email)) return toast.error("Valid email required");
    if (!form.phone.trim()) return toast.error("Phone required");
    if (!form.city) return toast.error("City required"); // ✅ NOW REQUIRED FOR BOTH
    if (form.password.length < 6) return toast.error("Password min 6 chars");
    if (!form.address.trim()) return toast.error("Complete address required");

    try {
      setLoading(true);

      if (role === "client") {
        const fd = new FormData();
        fd.append("name", form.name.trim());
        fd.append("email", form.email.trim());
        fd.append("phoneCountryCode", form.phoneCountryCode);
        fd.append("phone", form.phone.trim());
        fd.append("password", form.password);

        fd.append("city", form.city); // ✅ always
        fd.append("address", form.address.trim());

        if (files.profilePic) fd.append("profilePic", files.profilePic);

        await api.post("/auth/register/client", fd);

        toast.success("Registered successfully");
        nav("/login");
        return;
      }

      if (!form.category) return toast.error("Category required");
      if (!files.profilePic) return toast.error("Profile picture required");
      if (!files.cnicPic) return toast.error("CNIC picture required");
      if (!files.feeScreenshot) return toast.error("Fee screenshot required");

      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("email", form.email.trim());
      fd.append("phoneCountryCode", form.phoneCountryCode);
      fd.append("phone", form.phone.trim());
      fd.append("password", form.password);

      fd.append("city", form.city);
      fd.append("address", form.address.trim());
      fd.append("category", form.category);
      fd.append("shortIntro", form.shortIntro || "");

      fd.append("profilePic", files.profilePic);
      fd.append("cnicPic", files.cnicPic);
      fd.append("feeScreenshot", files.feeScreenshot);

      const res = await api.post("/auth/register/professional", fd);

      toast.success(res.data.message || "Submitted for approval");
      nav("/login");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Register failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <form onSubmit={submit} className="bg-white w-full max-w-xl p-6 rounded-xl shadow space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Register</h1>
          <p className="text-sm text-gray-500">
            Client can login instantly. Professionals require admin approval.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => switchRole("client")}
            className={`p-2 rounded border ${role === "client" ? "bg-black text-white" : "bg-white"}`}
          >
            Client
          </button>
          <button
            type="button"
            onClick={() => switchRole("professional")}
            className={`p-2 rounded border ${role === "professional" ? "bg-black text-white" : "bg-white"}`}
          >
            Professional
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <input
            className="border p-2 rounded"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="border p-2 rounded"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          {/* Phone */}
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
                placeholder={`e.g. ${phoneRule.hint}`}
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
            type="password"
            className="border p-2 rounded md:col-span-2"
            placeholder="Password (min 6)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          {/* ✅ City mandatory for BOTH */}
          <select
            className="border p-2 rounded md:col-span-2"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          >
            <option value="">Select City</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <input
            className="border p-2 rounded md:col-span-2"
            placeholder="Complete Address (Street, Area, etc.)"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />

          {role === "professional" && (
            <select
              className="border p-2 rounded md:col-span-2"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="">Select Category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}
        </div>

        {role === "client" && (
          <div className="border rounded p-3 space-y-2 text-sm">
            <div className="font-semibold">Profile Picture (optional)</div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFiles({ ...files, profilePic: e.target.files?.[0] || null })}
            />
          </div>
        )}

        {role === "professional" && (
          <div className="space-y-3 border rounded p-3">
            <textarea
              className="border p-2 rounded w-full"
              rows={3}
              placeholder="Short intro (1-2 lines)"
              value={form.shortIntro}
              onChange={(e) => setForm({ ...form, shortIntro: e.target.value })}
            />

            <div className="grid md:grid-cols-3 gap-3 text-sm">
              <label className="space-y-1">
                <div className="font-semibold">Profile Pic</div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFiles({ ...files, profilePic: e.target.files?.[0] || null })}
                />
              </label>

              <label className="space-y-1">
                <div className="font-semibold">CNIC Pic</div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFiles({ ...files, cnicPic: e.target.files?.[0] || null })}
                />
              </label>

              <label className="space-y-1">
                <div className="font-semibold">Fee Screenshot</div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFiles({ ...files, feeScreenshot: e.target.files?.[0] || null })}
                />
              </label>
            </div>

            <div className="text-xs text-gray-500">
              Note: Professional cannot login until Admin approves.
            </div>
          </div>
        )}

        <button disabled={loading} className="w-full bg-black text-white p-2 rounded disabled:opacity-60">
          {loading ? "Submitting..." : role === "client" ? "Create Account" : "Submit for Approval"}
        </button>

        <p className="text-sm text-gray-600">
          Already have account?{" "}
          <Link to="/login" className="underline font-semibold">Login</Link>
        </p>
      </form>
    </div>
  );
}
