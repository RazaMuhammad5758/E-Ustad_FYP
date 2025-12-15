import { Link } from "react-router-dom";
import { CATEGORIES } from "../constants/categories";

export default function Home() {
  const year = new Date().getFullYear();

  // map category -> image filename in /public (fallback: other.png)
  const CATEGORY_IMG = {
    Electrician: "electrician.png",
    Plumber: "plumber.png",
    Carpenter: "carpenter.png",
    "AC Technician": "ac-technician.png",
    "Car Mechanic": "car-mechanic.png",
    Painter: "painter.png",
    Tutor: "tutor.png",
    Other: "other.png",
  };

  const CATEGORY_DESC = {
    Electrician: "Wiring, switches & quick fixes.",
    Plumber: "Leakage, fittings & pipe work.",
    Carpenter: "Furniture, doors & woodwork.",
    "AC Technician": "Install, service & repair.",
    "Car Mechanic": "Diagnostics & maintenance.",
    Painter: "Walls, polish & finishing.",
    Tutor: "Home/online tutoring support.",
    Other: "All other trusted services.",
  };

  const getCategoryImg = (name) => {
    if (CATEGORY_IMG[name]) return `/${CATEGORY_IMG[name]}`;

    const slug = String(name || "")
      .toLowerCase()
      .trim()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/(^-|-$)/g, "");

    return `/${slug}.png`;
  };

  const getCategoryDesc = (name) => CATEGORY_DESC[name] || "Book in seconds.";

  return (
    <div className="min-h-screen bg-transparent text-slate-900">
      {/* Bright modern background (gradient + aurora blobs + subtle dots) */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50 via-sky-50 to-slate-50" />
        <div className="absolute -top-44 right-[-160px] h-[560px] w-[560px] rounded-full bg-fuchsia-200/40 blur-3xl" />
        <div className="absolute top-16 left-[-180px] h-[560px] w-[560px] rounded-full bg-indigo-200/45 blur-3xl" />
        <div className="absolute -bottom-60 right-[-200px] h-[680px] w-[680px] rounded-full bg-sky-200/45 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.08)_1px,transparent_0)] [background-size:26px_26px] opacity-35" />
      </div>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        {/* HERO CARD */}
        <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/70 shadow-sm backdrop-blur">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-indigo-50/70" />
          <div className="relative grid gap-10 p-6 sm:p-10 md:grid-cols-2 md:items-center">
            {/* Left */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Verified professionals • Safer bookings
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl md:text-5xl">
                  Find trusted{" "}
                  <span className="bg-gradient-to-r from-slate-900 to-indigo-700 bg-clip-text text-transparent">
                    Ustads
                  </span>
                  <br className="hidden sm:block" />
                  in minutes, not days.
                </h1>

                <p className="max-w-xl text-base text-slate-600 sm:text-lg">
                  e-Ustad helps you connect with verified service providers —
                  electricians, plumbers, AC technicians, tutors and more — with a
                  clean, safe and fast booking flow.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/professionals"
                  className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Browse Professionals
                </Link>

                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/80 px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Join as Client / Professional
                </Link>
              </div>

              <p className="text-sm text-slate-500">
                Note: Professionals require admin approval before login.
              </p>

              {/* mini stats */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur">
                  <div className="text-xs font-medium text-slate-500">Privacy</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    Phone Protected
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur">
                  <div className="text-xs font-medium text-slate-500">Booking</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    Fast Requests
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur">
                  <div className="text-xs font-medium text-slate-500">Trust</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    Admin Verified
                  </div>
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="grid gap-4">
              <div className="group rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-lg">
                    ✅
                  </div>
                  <div>
                    <div className="text-base font-semibold">Verified Professionals</div>
                    <div className="mt-1 text-sm text-slate-600">
                      Admin approval + profile details for real trust.
                    </div>
                  </div>
                </div>
              </div>

              <div className="group rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-lg">
                    🔒
                  </div>
                  <div>
                    <div className="text-base font-semibold">Phone Privacy</div>
                    <div className="mt-1 text-sm text-slate-600">
                      Phone shows only after booking is accepted.
                    </div>
                  </div>
                </div>
              </div>

              <div className="group rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-lg">
                    📅
                  </div>
                  <div>
                    <div className="text-base font-semibold">Easy Booking</div>
                    <div className="mt-1 text-sm text-slate-600">
                      Request → track status → contact after acceptance.
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-900 p-5 text-white shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-base font-semibold">Need help today?</div>
                    <div className="mt-1 text-sm text-slate-200">
                      Search by city & category in seconds.
                    </div>
                  </div>
                  <Link
                    to="/professionals"
                    className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-slate-900"
                  >
                    Find Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

{/* POPULAR CATEGORIES (zigzag + dark blue text + clean gradient button) */}
<div className="mt-10">
  <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
        Popular Categories
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Click a category to see only related professionals.
      </p>
    </div>

    <Link
      to="/professionals"
      className="text-sm font-semibold text-indigo-700 underline-offset-4 hover:underline"
    >
      View all
    </Link>
  </div>

  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
    {CATEGORIES.map((c, idx) => {
      const imgSrc = getCategoryImg(c);
      const to = `/professionals?category=${encodeURIComponent(c)}`;
      const zigzag = idx % 2 === 1 ? "sm:translate-y-6 lg:translate-y-7" : "";

      return (
        <Link
          key={c}
          to={to}
          className={`group relative overflow-hidden rounded-[26px] ring-1 ring-slate-200/70 transition hover:-translate-y-1 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${zigzag}`}
        >
          {/* Background image (no dark overlay) */}
          <img
            src={imgSrc}
            alt={c}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            onError={(e) => (e.currentTarget.src = "/other.png")}
          />

          {/* subtle readability strip (very light) */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/40 via-white/10 to-transparent" />

          <div className="relative flex min-h-[260px] flex-col justify-between p-5">
            {/* Title area */}
            <div className="pt-2">
              <div className="inline-block rounded-2xl bg-white/70 px-3 py-2 backdrop-blur-sm">
                <div className="text-xl font-extrabold leading-tight text-indigo-900">
                  {c}
                </div>
                <div className="mt-1 text-xs font-medium text-indigo-800">
                  {getCategoryDesc(c)}
                </div>
              </div>
            </div>

            {/* Hover content */}
            <div className="pb-1 opacity-0 translate-y-2 transition duration-200 group-hover:opacity-100 group-hover:translate-y-0">
              <div className="mb-2 text-xs font-medium text-white">
                Browse verified professionals in this category.
              </div>

              <span
                className="inline-flex w-full items-center justify-center rounded-2xl
                bg-gradient-to-r from-indigo-600 to-indigo-700
                px-4 py-3 text-sm font-semibold text-white
                transition-all duration-300
                hover:from-indigo-700 hover:to-indigo-800
                focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                Explore More →
              </span>
            </div>
          </div>
        </Link>
      );
    })}
  </div>
</div>


        {/* ===== WHY CHOOSE E-USTAD (IMAGE + CONTENT) ===== */}
        <div className="mt-12">
          <div className="grid gap-6 items-center md:grid-cols-2">
            <div className="relative">
              <div className="absolute -top-4 -left-4 grid grid-cols-6 gap-2 opacity-30">
                {Array.from({ length: 24 }).map((_, i) => (
                  <span
                    key={i}
                    className="w-2 h-2 rounded-full border border-indigo-300"
                  />
                ))}
              </div>

              <div className="relative z-10 w-[260px] sm:w-[300px] aspect-square overflow-hidden rounded-3xl bg-white shadow-lg p-4">
                <img
                  src="/why.png"
                  alt="Why choose e-Ustad"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Why Choose <span className="text-indigo-700">e-Ustad?</span>
              </h2>

              <p className="text-slate-600 max-w-xl text-sm sm:text-base">
                e-Ustad is a smart service marketplace that connects clients with
                verified professionals under one platform. Our focus is on trust,
                privacy, and convenience.
              </p>

              <ul className="space-y-2 pt-1">
                {[
                  ["✓", "Vetted and admin-verified professionals"],
                  ["⚙️", "Skilled, trained, and experienced service providers"],
                  ["🛡️", "Privacy protection and safe contact sharing"],
                  ["💰", "Transparent and upfront service process"],
                  ["⏱️", "Fast, convenient, and reliable booking flow"],
                  ["⭐", "Quality assurance and post-service support"],
                ].map(([icon, text]) => (
                  <li key={text} className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold">
                      {icon}
                    </span>
                    <span className="text-sm text-slate-700">{text}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-3">
                <Link
                  to="/professionals"
                  className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Explore Professionals →
                </Link>
              </div>
            </div>
          </div>
        </div>

       
      </section>
    </div>
  );
}
