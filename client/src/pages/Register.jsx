import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import { CATEGORIES } from "../constants/categories";

export default function Register() {
  const nav = useNavigate();
  const [role, setRole] = useState("client");

  const CITIES = [
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
  const [showPassword, setShowPassword] = useState(false);

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
    setShowPassword(false);
  }

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

  async function submit(e) {
    e.preventDefault();

    if (!form.name.trim()) return toast.error("Name required");
    if (!form.email.trim() || !vEmail(form.email))
      return toast.error("Valid email required");
    if (!form.phone.trim()) return toast.error("Phone required");
    if (!form.city) return toast.error("City required");
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
        fd.append("city", form.city);
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

  // ✅ role-based background for "fields area"
  const fieldsBg =
    role === "client"
      ? "bg-indigo-50/60 border-indigo-100"
      : "bg-sky-50/60 border-sky-100";

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-8">
      {/* background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50 via-sky-50 to-slate-100" />
        <div className="absolute -top-40 right-[-160px] h-[520px] w-[520px] rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute -bottom-44 left-[-180px] h-[560px] w-[560px] rounded-full bg-sky-200/40 blur-3xl" />
      </div>

      <form
        onSubmit={submit}
        className="w-full max-w-2xl space-y-4 rounded-3xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur-[2px]"
      >
        {/* header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Create your account
          </h1>
          <p className="text-sm text-slate-600">
            Clients login instantly. Professionals require admin approval.
          </p>
        </div>

        {/* role switch */}
        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white/70 p-1.5">
          <button
            type="button"
            onClick={() => switchRole("client")}
            className={[
              "rounded-xl px-3 py-2 text-sm font-semibold transition",
              role === "client"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-700 hover:bg-slate-100",
            ].join(" ")}
          >
            Client
          </button>
          <button
            type="button"
            onClick={() => switchRole("professional")}
            className={[
              "rounded-xl px-3 py-2 text-sm font-semibold transition",
              role === "professional"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-700 hover:bg-slate-100",
            ].join(" ")}
          >
            Professional
          </button>
        </div>

        {/* ✅ fields area (bg changes on switch) */}
        <div
          className={[
            "rounded-2xl border p-4 transition-colors duration-300",
            fieldsBg,
          ].join(" ")}
        >
          <div className="grid gap-3 md:grid-cols-2">
            {/* name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">
                Full name
              </label>
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            {/* email */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">
                Email
              </label>
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            {/* phone */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-600">
                Phone
              </label>
              <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white">
                <select
                  className="h-10 bg-transparent px-2 text-sm outline-none border-r border-slate-200"
                  value={form.phoneCountryCode}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      phoneCountryCode: e.target.value,
                      phone: "",
                    })
                  }
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>

                <input
                  className="h-10 flex-1 px-3 text-sm outline-none"
                  placeholder={`e.g. ${phoneRule.hint}`}
                  inputMode="numeric"
                  value={form.phone}
                  onChange={(e) => setPhoneDigits(e.target.value)}
                />

                <div className="px-3 text-xs font-semibold text-slate-500 whitespace-nowrap">
                  {form.phone.length}/{phoneRule.max}
                </div>
              </div>
            </div>

            {/* password */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-600">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 pr-12 text-sm outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
                  placeholder="Password (min 6)"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-2 flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* city */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-600">City</label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              >
                <option value="">Select City</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* address */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-600">
                Address
              </label>
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
                placeholder="Complete Address (Street, Area, etc.)"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>

            {/* professional extra */}
            {role === "professional" && (
              <>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Category
                  </label>
                  <select
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-semibold text-slate-600">
                    Short Intro
                  </label>
                  <textarea
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
                    rows={2} // ✅ height reduced
                    placeholder="Short intro (1-2 lines)"
                    value={form.shortIntro}
                    onChange={(e) =>
                      setForm({ ...form, shortIntro: e.target.value })
                    }
                  />
                </div>
              </>
            )}
          </div>

          {/* uploads */}
          <div className="mt-3">
            {role === "client" ? (
              <div className="rounded-2xl border border-slate-200 bg-white/70 p-3">
                <div className="text-sm font-semibold text-slate-900">
                  Profile Picture (optional)
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="mt-2 text-sm"
                  onChange={(e) =>
                    setFiles({
                      ...files,
                      profilePic: e.target.files?.[0] || null,
                    })
                  }
                />
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white/70 p-3">
                <div className="grid gap-3 md:grid-cols-3 text-sm">
                  <label className="space-y-1">
                    <div className="font-semibold text-slate-900">Profile Pic</div>
                    <input
                      type="file"
                      accept="image/*"
                      className="text-sm"
                      onChange={(e) =>
                        setFiles({
                          ...files,
                          profilePic: e.target.files?.[0] || null,
                        })
                      }
                    />
                  </label>

                  <label className="space-y-1">
                    <div className="font-semibold text-slate-900">CNIC Pic</div>
                    <input
                      type="file"
                      accept="image/*"
                      className="text-sm"
                      onChange={(e) =>
                        setFiles({
                          ...files,
                          cnicPic: e.target.files?.[0] || null,
                        })
                      }
                    />
                  </label>

                  <label className="space-y-1">
                    <div className="font-semibold text-slate-900">Fee Screenshot</div>
                    <input
                      type="file"
                      accept="image/*"
                      className="text-sm"
                      onChange={(e) =>
                        setFiles({
                          ...files,
                          feeScreenshot: e.target.files?.[0] || null,
                        })
                      }
                    />
                  </label>
                </div>

                <div className="mt-2 text-xs text-slate-500">
                  Note: Professional cannot login until Admin approves.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* submit */}
        <button
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-xl
          bg-gradient-to-r from-indigo-600 to-indigo-700
          px-4 py-2.5 text-sm font-semibold text-white
          transition-all duration-300
          hover:from-indigo-700 hover:to-indigo-800
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
          disabled:opacity-60"
        >
          {loading
            ? "Submitting..."
            : role === "client"
            ? "Create Account"
            : "Submit for Approval"}
        </button>

        {/* footer */}
        <p className="text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-indigo-700 hover:underline"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
